// SPDX-License-Identifier: MIT
// apps/backend/src/routes/auth/authRouter.ts

/**
 * Authentication Router
 *
 * Provides user authentication and authorization endpoints including
 * registration, login, logout, token refresh, and profile management.
 *
 * @remarks
 * This router provides:
 * - User registration with password hashing
 * - Login with JWT token generation
 * - Token refresh for session extension
 * - Logout with session invalidation
 * - Profile retrieval and updates
 * - Role-based access control
 * - Rate limiting for brute force protection
 * - Secure cookie management
 *
 * Security Features:
 * - Bcrypt password hashing (10 rounds)
 * - JWT tokens with configurable expiry
 * - HttpOnly cookies for token storage
 * - Rate limiting on login attempts
 * - Account lockout after failed attempts
 * - CSRF protection via SameSite cookies
 *
 * Token Management:
 * - Access tokens (short-lived, 24h default)
 * - Refresh tokens (long-lived, 7d default)
 * - Secure cookie storage in production (HTTPS)
 *
 * @module routes/auth
 *
 * @example
 * ```typescript
 * // Register new user
 * POST /api/auth/register
 * {
 *   "username": "john_doe",
 *   "password": "SecurePass123!",
 *   "email": "john@example.com"
 * }
 *
 * // Login
 * POST /api/auth/login
 * {
 *   "username": "john_doe",
 *   "password": "SecurePass123!"
 * }
 * // Response: { success: true, token: "jwt-token", user: {...} }
 *
 * // Get profile (requires authentication)
 * GET /api/auth/profile
 * Headers: { Authorization: "Bearer jwt-token" }
 *
 * // Refresh token
 * POST /api/auth/refresh
 * { "refreshToken": "refresh-token" }
 * ```
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../../services/authService.js";
import {
  authenticate,
  rateLimitLogin,
  requireRole,
} from "../../middleware/authMiddleware.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { BadRequestError, UnauthorizedError } from "../../types/errors.js";

const router = Router();

// Helper to parse JWT expiry to milliseconds
function parseExpiryToMs(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 24 * 60 * 60 * 1000; // Default 24h

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
      return 24 * 60 * 60 * 1000;
  }
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const COOKIE_MAX_AGE = parseExpiryToMs(JWT_EXPIRES_IN);

// Validation schemas
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    ),
  full_name: z.string().optional(),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    ),
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    const data = registerSchema.parse(req.body);
    const user = await AuthService.register(data);

    res.status(201).json({
      success: true,
      user,
      message: "User registered successfully",
    });
  }),
);

/**
 * POST /api/auth/login
 * Login with username/email and password
 */
router.post(
  "/login",
  rateLimitLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const credentials = loginSchema.parse(req.body);
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const result = await AuthService.login(credentials, ipAddress, userAgent);

    if (!result.success) {
      throw new UnauthorizedError(result.error || "Login failed");
    }

    // Set secure cookie with token
    if (result.token) {
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: COOKIE_MAX_AGE,
      });
    }

    res.json(result);
  }),
);

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post(
  "/logout",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const token = req.headers.authorization?.substring(7) || req.cookies?.token;

    if (token) {
      await AuthService.logout(token);
    }

    res.clearCookie("token");
    res.json({ success: true, message: "Logged out successfully" });
  }),
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  "/refresh",
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BadRequestError("Refresh token is required");
    }

    const result = await AuthService.refreshToken(refreshToken);

    if (!result) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Update cookie with new token
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: COOKIE_MAX_AGE,
    });

    res.json({
      success: true,
      token: result.token,
      expiresAt: result.expiresAt,
    });
  }),
);

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get(
  "/me",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.auth) {
      throw new UnauthorizedError("Not authenticated");
    }

    res.json({
      success: true,
      user: req.auth.user,
      roles: req.auth.roles,
      permissions: req.auth.permissions,
    });
  }),
);

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post(
  "/change-password",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.auth) {
      throw new UnauthorizedError("Not authenticated");
    }

    const data = changePasswordSchema.parse(req.body);

    await AuthService.changePassword(
      req.auth.user.id,
      data.oldPassword,
      data.newPassword,
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  }),
);

/**
 * GET /api/auth/users
 * List all users (admin only)
 */
router.get(
  "/users",
  authenticate,
  requireRole("Admin"),
  asyncHandler(async (_req: Request, res: Response) => {
    const users = await AuthService.listUsers();
    res.json({ success: true, users });
  }),
);

/**
 * GET /api/auth/roles
 * List all roles
 */
router.get(
  "/roles",
  authenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    const roles = await AuthService.listRoles();
    res.json({ success: true, roles });
  }),
);

/**
 * POST /api/auth/users/:userId/roles
 * Assign role to user (admin only)
 */
router.post(
  "/users/:userId/roles",
  authenticate,
  requireRole("Admin"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.auth) {
      throw new UnauthorizedError("Not authenticated");
    }

    const { userId } = req.params;
    const { roleId } = req.body;

    if (!roleId) {
      throw new BadRequestError("Role ID is required");
    }

    await AuthService.assignRole(userId, roleId, req.auth.user.id);

    res.json({
      success: true,
      message: "Role assigned successfully",
    });
  }),
);

/**
 * DELETE /api/auth/users/:userId/roles/:roleId
 * Remove role from user (admin only)
 */
router.delete(
  "/users/:userId/roles/:roleId",
  authenticate,
  requireRole("Admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, roleId } = req.params;

    await AuthService.removeRole(userId, roleId);

    res.json({
      success: true,
      message: "Role removed successfully",
    });
  }),
);

/**
 * DELETE /api/auth/users/:userId
 * Delete user (admin only)
 */
router.delete(
  "/users/:userId",
  authenticate,
  requireRole("Admin"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.auth) {
      throw new UnauthorizedError("Not authenticated");
    }

    const { userId } = req.params;

    // Prevent self-deletion
    if (userId === req.auth.user.id) {
      throw new BadRequestError("Cannot delete your own account");
    }

    await AuthService.deleteUser(userId);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  }),
);

export default router;
