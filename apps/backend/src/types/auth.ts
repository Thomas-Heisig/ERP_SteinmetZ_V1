// SPDX-License-Identifier: MIT
// apps/backend/src/types/auth.ts

/**
 * User entity
 */
export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  failed_login_attempts: number;
  locked_until?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  password_changed_at: string;
}

/**
 * Safe user data (without password hash)
 */
export interface SafeUser {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

/**
 * Role entity
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * User-Role association
 */
export interface UserRole {
  user_id: string;
  role_id: string;
  granted_at: string;
  granted_by?: string;
}

/**
 * Session entity
 */
export interface Session {
  id: string;
  user_id: string;
  token: string;
  refresh_token?: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: string;
  created_at: string;
  last_activity_at: string;
  is_valid: boolean;
}

/**
 * Password reset token
 */
export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  success: boolean;
  user?: SafeUser;
  token?: string;
  refreshToken?: string;
  expiresAt?: string;
  error?: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

/**
 * Token payload
 */
export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
}

/**
 * Authentication context
 */
export interface AuthContext {
  user: SafeUser;
  roles: Role[];
  permissions: string[];
  sessionId: string;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}
