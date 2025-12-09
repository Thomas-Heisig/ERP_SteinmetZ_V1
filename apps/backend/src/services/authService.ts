// SPDX-License-Identifier: MIT
// apps/backend/src/services/authService.ts

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import db from "./dbService.js";
import { createLogger } from "../utils/logger.js";
import type {
  User,
  SafeUser,
  Role,
  Session,
  LoginCredentials,
  LoginResponse,
  RegisterData,
  TokenPayload,
  AuthContext,
  PasswordResetToken,
} from "../types/auth.js";

const logger = createLogger("auth");

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
const BCRYPT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

/**
 * Authentication Service
 * Handles user authentication, session management, and authorization
 */
export class AuthService {
  /**
   * Initialize authentication tables
   */
  static async init(): Promise<void> {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const migrationPath = path.join(
      __dirname,
      "../migrations/create_auth_tables.sql",
    );
    const fs = await import("fs/promises");
    const sql = await fs.readFile(migrationPath, "utf-8");

    // Parse SQL statements, handling comments
    const lines = sql.split("\n");
    let currentStatement = "";
    const statements: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comment-only lines
      if (!trimmed || trimmed.startsWith("--")) {
        continue;
      }

      // Remove inline comments
      const cleanLine = trimmed.split("--")[0].trim();
      if (!cleanLine) continue;

      currentStatement += " " + cleanLine;

      // If line ends with semicolon, we have a complete statement
      if (cleanLine.endsWith(";")) {
        const stmt = currentStatement.trim().slice(0, -1).trim(); // Remove trailing semicolon
        if (stmt) {
          statements.push(stmt);
        }
        currentStatement = "";
      }
    }

    // Execute each statement
    for (const statement of statements) {
      try {
        await db.exec(statement);
      } catch (error) {
        logger.error(
          { err: error, statement: statement.substring(0, 100) },
          "Failed to execute migration statement",
        );
        throw error;
      }
    }

    logger.info("Authentication tables initialized");
  }

  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<SafeUser> {
    // Validate input
    if (!data.username || !data.email || !data.password) {
      throw new Error("Username, email, and password are required");
    }

    if (data.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Check if user exists
    const existingUser = await db.get<User>(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [data.username, data.email],
    );

    if (existingUser) {
      throw new Error("Username or email already exists");
    }

    // Hash password
    const password_hash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    // Create user
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO users (id, username, email, password_hash, full_name, created_at, updated_at, password_changed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.username,
        data.email,
        password_hash,
        data.full_name || null,
        now,
        now,
        now,
      ],
    );

    // Assign default user role
    const userRole = await db.get<Role>("SELECT * FROM roles WHERE name = ?", [
      "User",
    ]);
    if (userRole) {
      await db.run("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [
        userId,
        userRole.id,
      ]);
    }

    const user = await db.get<User>("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (!user) {
      throw new Error("Failed to create user");
    }

    return this.toSafeUser(user);
  }

  /**
   * Login user with credentials
   */
  static async login(
    credentials: LoginCredentials,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponse> {
    const { username, password } = credentials;

    // Find user
    const user = await db.get<User>(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, username],
    );

    if (!user) {
      return { success: false, error: "Invalid credentials" };
    }

    // Check if user is locked
    if (user.locked_until) {
      const lockUntil = new Date(user.locked_until);
      if (lockUntil > new Date()) {
        return {
          success: false,
          error: `Account locked until ${lockUntil.toISOString()}`,
        };
      } else {
        // Unlock account
        await db.run(
          "UPDATE users SET locked_until = NULL, failed_login_attempts = 0 WHERE id = ?",
          [user.id],
        );
      }
    }

    // Check if user is active
    if (!user.is_active) {
      return { success: false, error: "Account is disabled" };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      // Increment failed attempts
      const failedAttempts = user.failed_login_attempts + 1;
      const updates: any[] = [failedAttempts];

      let lockUntil: string | null = null;
      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        lockUntil = new Date(
          Date.now() + LOCK_DURATION_MINUTES * 60 * 1000,
        ).toISOString();
        updates.push(lockUntil);
        updates.push(user.id);

        await db.run(
          "UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?",
          updates,
        );

        return {
          success: false,
          error: `Account locked for ${LOCK_DURATION_MINUTES} minutes due to too many failed attempts`,
        };
      } else {
        updates.push(user.id);
        await db.run(
          "UPDATE users SET failed_login_attempts = ? WHERE id = ?",
          updates,
        );
      }

      return { success: false, error: "Invalid credentials" };
    }

    // Reset failed attempts and update last login
    const now = new Date().toISOString();
    await db.run(
      "UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = ? WHERE id = ?",
      [now, user.id],
    );

    // Get user roles and permissions
    const roles = await this.getUserRoles(user.id);
    const permissions = this.extractPermissions(roles);

    // Create session
    const session = await this.createSession(
      user.id,
      roles.map((r) => r.name),
      permissions,
      ipAddress,
      userAgent,
    );

    // Log successful login to audit log
    await db.run(
      `INSERT INTO audit_log (entity, entity_id, action, details, user_id, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        "user",
        user.id,
        "login",
        "User logged in successfully",
        user.id,
        ipAddress || null,
        userAgent || null,
      ],
    );

    return {
      success: true,
      user: this.toSafeUser(user),
      token: session.token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at,
    };
  }

  /**
   * Logout user (invalidate session)
   */
  static async logout(token: string): Promise<void> {
    await db.run("UPDATE sessions SET is_valid = 0 WHERE token = ?", [token]);
  }

  /**
   * Validate session token
   */
  static async validateToken(token: string): Promise<AuthContext | null> {
    try {
      // Verify JWT
      const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;

      // Check if session exists and is valid
      const session = await db.get<Session>(
        "SELECT * FROM sessions WHERE token = ? AND is_valid = 1",
        [token],
      );

      if (!session) {
        return null;
      }

      // Check if session expired
      if (new Date(session.expires_at) < new Date()) {
        await db.run("UPDATE sessions SET is_valid = 0 WHERE id = ?", [
          session.id,
        ]);
        return null;
      }

      // Update last activity
      const now = new Date().toISOString();
      await db.run("UPDATE sessions SET last_activity_at = ? WHERE id = ?", [
        now,
        session.id,
      ]);

      // Get user
      const user = await db.get<User>(
        "SELECT * FROM users WHERE id = ? AND is_active = 1",
        [payload.userId],
      );

      if (!user) {
        return null;
      }

      // Get roles
      const roles = await this.getUserRoles(user.id);

      return {
        user: this.toSafeUser(user),
        roles,
        permissions: payload.permissions,
        sessionId: session.id,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(
    refreshToken: string,
  ): Promise<{ token: string; expiresAt: string } | null> {
    const session = await db.get<Session>(
      "SELECT * FROM sessions WHERE refresh_token = ? AND is_valid = 1",
      [refreshToken],
    );

    if (!session) {
      return null;
    }

    // Check if session expired
    if (new Date(session.expires_at) < new Date()) {
      await db.run("UPDATE sessions SET is_valid = 0 WHERE id = ?", [
        session.id,
      ]);
      return null;
    }

    // Get user and roles
    const user = await db.get<User>("SELECT * FROM users WHERE id = ?", [
      session.user_id,
    ]);
    if (!user || !user.is_active) {
      return null;
    }

    const roles = await this.getUserRoles(user.id);
    const permissions = this.extractPermissions(roles);

    // Generate new token
    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: roles.map((r) => r.name),
      permissions,
    };

    const token = jwt.sign(payload as any, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as any);
    const expiresAt = new Date(
      Date.now() + this.parseExpiry(JWT_EXPIRES_IN),
    ).toISOString();

    // Update session
    await db.run(
      "UPDATE sessions SET token = ?, expires_at = ?, last_activity_at = ? WHERE id = ?",
      [token, expiresAt, new Date().toISOString(), session.id],
    );

    return { token, expiresAt };
  }

  /**
   * Create a new session
   */
  private static async createSession(
    userId: string,
    roles: string[],
    permissions: string[],
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Session> {
    const user = await db.get<User>("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (!user) {
      throw new Error("User not found");
    }

    const sessionId = crypto.randomUUID();
    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      roles,
      permissions,
    };

    const token = jwt.sign(payload as any, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as any);
    const refreshToken = jwt.sign({ userId: user.id } as any, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    } as any);

    const now = new Date().toISOString();
    const expiresAt = new Date(
      Date.now() + this.parseExpiry(JWT_EXPIRES_IN),
    ).toISOString();

    await db.run(
      `INSERT INTO sessions (id, user_id, token, refresh_token, ip_address, user_agent, expires_at, created_at, last_activity_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        userId,
        token,
        refreshToken,
        ipAddress || null,
        userAgent || null,
        expiresAt,
        now,
        now,
      ],
    );

    const session = await db.get<Session>(
      "SELECT * FROM sessions WHERE id = ?",
      [sessionId],
    );
    if (!session) {
      throw new Error("Failed to create session");
    }

    return session;
  }

  /**
   * Get user roles
   */
  static async getUserRoles(userId: string): Promise<Role[]> {
    const roles = await db.all<Role>(
      `SELECT r.* FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [userId],
    );

    // Parse permissions JSON
    return roles.map((role) => ({
      ...role,
      permissions:
        typeof role.permissions === "string"
          ? JSON.parse(role.permissions)
          : role.permissions,
    }));
  }

  /**
   * Check if user has permission
   */
  static async hasPermission(
    userId: string,
    permission: string,
  ): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    const permissions = this.extractPermissions(roles);

    // Check for wildcard permission
    if (permissions.includes("*")) {
      return true;
    }

    // Check for specific permission
    if (permissions.includes(permission)) {
      return true;
    }

    // Check for pattern matching (e.g., "dashboard.*" matches "dashboard.read")
    const permissionParts = permission.split(".");
    for (const perm of permissions) {
      if (perm.endsWith(".*")) {
        const permBase = perm.slice(0, -2);
        if (permission.startsWith(permBase)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Extract permissions from roles
   */
  private static extractPermissions(roles: Role[]): string[] {
    const permissions = new Set<string>();
    for (const role of roles) {
      if (Array.isArray(role.permissions)) {
        role.permissions.forEach((p) => permissions.add(p));
      }
    }
    return Array.from(permissions);
  }

  /**
   * Convert user to safe user (remove sensitive data)
   */
  private static toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      is_active: user.is_active,
      is_verified: user.is_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login_at: user.last_login_at,
    };
  }

  /**
   * Parse expiry string to milliseconds
   */
  private static parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiry format: ${expiry}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      case "h":
        return value * 60 * 60 * 1000;
      case "d":
        return value * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Invalid expiry unit: ${unit}`);
    }
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<number> {
    const result = await db.run(
      "UPDATE sessions SET is_valid = 0 WHERE expires_at < datetime('now') AND is_valid = 1",
    );
    return result.changes || 0;
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<SafeUser | null> {
    const user = await db.get<User>("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    return user ? this.toSafeUser(user) : null;
  }

  /**
   * Update user
   */
  static async updateUser(
    userId: string,
    updates: Partial<SafeUser>,
  ): Promise<SafeUser> {
    const user = await db.get<User>("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (!user) {
      throw new Error("User not found");
    }

    const allowed = ["full_name", "email"];
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowed.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return this.toSafeUser(user);
    }

    fields.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(userId);

    await db.run(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);

    const updated = await db.get<User>("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (!updated) {
      throw new Error("Failed to update user");
    }

    return this.toSafeUser(updated);
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await db.get<User>("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) {
      throw new Error("Invalid old password");
    }

    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    const now = new Date().toISOString();

    await db.run(
      "UPDATE users SET password_hash = ?, password_changed_at = ?, updated_at = ? WHERE id = ?",
      [password_hash, now, now, userId],
    );

    // Invalidate all sessions
    await db.run("UPDATE sessions SET is_valid = 0 WHERE user_id = ?", [
      userId,
    ]);
  }

  /**
   * List all users (admin only)
   */
  static async listUsers(): Promise<SafeUser[]> {
    const users = await db.all<User>(
      "SELECT * FROM users ORDER BY created_at DESC",
    );
    return users.map((u) => this.toSafeUser(u));
  }

  /**
   * Delete user (admin only)
   */
  static async deleteUser(userId: string): Promise<void> {
    await db.run("DELETE FROM users WHERE id = ?", [userId]);
  }

  /**
   * Assign role to user
   */
  static async assignRole(
    userId: string,
    roleId: string,
    grantedBy?: string,
  ): Promise<void> {
    await db.run(
      "INSERT OR REPLACE INTO user_roles (user_id, role_id, granted_by) VALUES (?, ?, ?)",
      [userId, roleId, grantedBy || null],
    );
  }

  /**
   * Remove role from user
   */
  static async removeRole(userId: string, roleId: string): Promise<void> {
    await db.run("DELETE FROM user_roles WHERE user_id = ? AND role_id = ?", [
      userId,
      roleId,
    ]);
  }

  /**
   * List all roles
   */
  static async listRoles(): Promise<Role[]> {
    const roles = await db.all<Role>("SELECT * FROM roles ORDER BY name");
    return roles.map((role) => ({
      ...role,
      permissions:
        typeof role.permissions === "string"
          ? JSON.parse(role.permissions)
          : role.permissions,
    }));
  }
}
