// SPDX-License-Identifier: MIT
// apps/backend/src/middleware/authMiddleware.ts

/**
 * Authentication Middleware
 *
 * Provides JWT-based authentication and role-based authorization middleware.
 * Validates tokens from Authorization headers or cookies and attaches user
 * context to requests.
 *
 * @remarks
 * This middleware offers:
 * - JWT token validation
 * - Token extraction from headers or cookies
 * - User authentication context (user, role, permissions)
 * - Role-based access control (RBAC)
 * - Permission-based access control
 * - Optional authentication (for public endpoints)
 *
 * @example
 * ```typescript
 * // Require authentication
 * router.get('/profile', authenticate, (req, res) => {
 *   const user = req.auth.user;
 *   res.json(user);
 * });
 *
 * // Require specific role
 * router.delete('/users/:id', authenticate, requireRole('admin'), (req, res) => {
 *   // Only admins can access
 * });
 *
 * // Require specific permission
 * router.post('/invoices', authenticate, requirePermission('invoices:create'), (req, res) => {
 *   // Only users with 'invoices:create' permission can access
 * });
 * ```
 */

import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService.js";
import type { AuthContext } from "../types/auth.js";
import {
  sendUnauthorized,
  sendForbidden,
  sendRateLimitError,
} from "../utils/errorResponse.js";

// Extend Express Request to include auth context
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

/**
 * Authentication middleware - requires valid JWT token
 *
 * Validates JWT token from Authorization header or cookie and attaches
 * auth context to request. Rejects requests without valid token.
 *
 * Token sources (in order of priority):
 * 1. Authorization: Bearer <token> header
 * 2. Cookie: token=<token>
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @throws {401} If no token provided or token is invalid
 *
 * @example
 * ```typescript
 * router.get('/profile', authenticate, (req, res) => {
 *   const userId = req.auth.user.id;
 *   // User is guaranteed to be authenticated
 * });
 * ```
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Get token from Authorization header or cookie
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      sendUnauthorized(res, "Authentication required");
      return;
    }

    // Validate token
    const authContext = await AuthService.validateToken(token);
    if (!authContext) {
      sendUnauthorized(res, "Invalid or expired token");
      return;
    }

    // Attach auth context to request
    req.auth = authContext;
    next();
  } catch (error) {
    console.error("[auth] Authentication error:", error);
    sendUnauthorized(res, "Authentication failed");
  }
}

/**
 * Optional authentication middleware - token not required
 *
 * Validates JWT token if present, but allows request to proceed even
 * without authentication. Useful for endpoints that behave differently
 * for authenticated vs. anonymous users.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @example
 * ```typescript
 * router.get('/products', optionalAuthenticate, (req, res) => {
 *   if (req.auth) {
 *     // Show personalized pricing for authenticated users
 *   } else {
 *     // Show regular pricing for anonymous users
 *   }
 * });
 * ```
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Get token from Authorization header or cookie
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const authContext = await AuthService.validateToken(token);
      if (authContext) {
        req.auth = authContext;
      }
    }

    next();
  } catch (error) {
    console.error("[auth] Optional authentication error:", error);
    next();
  }
}

/**
 * Authorization middleware factory - require specific role
 *
 * Creates middleware that checks if authenticated user has the specified
 * role. Must be used after authenticate() middleware.
 *
 * @param roleName - Required role name (e.g., 'admin', 'user', 'manager')
 * @returns Express middleware function
 *
 * @throws {401} If user is not authenticated
 * @throws {403} If user lacks the required role
 *
 * @example
 * ```typescript
 * router.post('/settings/bulk',
 *   authenticate,
 *   requireRole('admin'),
 *   (req, res) => {
 *     // Only admins can access
 *   }
 * );
 * ```
 */
export function requireRole(roleName: string) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.auth) {
        sendUnauthorized(res, "Authentication required");
        return;
      }

      const userRoles = req.auth.roles?.map((r) => r.name.toLowerCase()) || [];
      const hasRole = userRoles.includes(roleName.toLowerCase());

      if (!hasRole) {
        sendForbidden(
          res,
          `Access denied. Required role: ${roleName}`,
        );
        return;
      }

      next();
    } catch (error) {
      console.error("[auth] Role check error:", error);
      sendForbidden(res, "Authorization failed");
    }
  };
}

/**
 * Authorization middleware factory - require specific permission
 *
 * Creates middleware that checks if authenticated user has the specified
 * permission. Must be used after authenticate() middleware.
 *
 * Permission format: `resource:action` (e.g., 'invoices:create', 'users:delete')
 * Wildcard permission '*' grants access to all resources.
 *
 * @param permission - Required permission string
 * @returns Express middleware function
 *
 * @throws {401} If user is not authenticated
 * @throws {403} If user lacks the required permission
 *
 * @example
 * ```typescript
 * router.post('/invoices',
 *   authenticate,
 *   requirePermission('invoices:create'),
 *   (req, res) => {
 *     // Only users with 'invoices:create' permission can access
 *   }
 * );
 * ```
 */
export function requirePermission(permission: string) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.auth) {
        sendUnauthorized(res, "Authentication required");
        return;
      }

      // Check for wildcard permission
      if (req.auth.permissions.includes("*")) {
        next();
        return;
      }

      // Check for specific permission
      if (req.auth.permissions.includes(permission)) {
        next();
        return;
      }

      // Check for pattern matching (e.g., "dashboard.*" matches "dashboard.read")
      for (const perm of req.auth.permissions) {
        if (perm.endsWith(".*")) {
          const permBase = perm.slice(0, -2);
          if (permission.startsWith(permBase)) {
            next();
            return;
          }
        }
      }

      sendForbidden(res, "Insufficient permissions", { required: permission });
    } catch (error) {
      console.error("[auth] Authorization error:", error);
      sendForbidden(res, "Authorization failed");
    }
  };
}

/**
 * Rate limiting for authentication endpoints
 */
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimitLogin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;

  // Clean up old entries
  for (const [key, value] of loginAttempts.entries()) {
    if (value.resetAt < now) {
      loginAttempts.delete(key);
    }
  }

  // Get or create attempt record
  let attempts = loginAttempts.get(ip);
  if (!attempts || attempts.resetAt < now) {
    attempts = { count: 0, resetAt: now + windowMs };
    loginAttempts.set(ip, attempts);
  }

  // Check if limit exceeded
  if (attempts.count >= maxAttempts) {
    const retryAfter = Math.ceil((attempts.resetAt - now) / 1000);
    sendRateLimitError(
      res,
      "Too many login attempts. Please try again later.",
      retryAfter,
    );
    return;
  }

  // Increment counter
  attempts.count++;

  next();
}
