// SPDX-License-Identifier: MIT
// apps/backend/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService.js";
import type { AuthContext } from "../types/auth.js";

// Extend Express Request to include auth context
declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

/**
 * Authentication middleware
 * Validates JWT token and attaches auth context to request
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
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Validate token
    const authContext = await AuthService.validateToken(token);
    if (!authContext) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // Attach auth context to request
    req.auth = authContext;
    next();
  } catch (error) {
    console.error("[auth] Authentication error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
}

/**
 * Optional authentication middleware
 * Validates token if present, but doesn't require it
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
 * Authorization middleware factory
 * Checks if user has required permission
 */
export function requirePermission(permission: string) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Authentication required" });
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
      const permissionParts = permission.split(".");
      for (const perm of req.auth.permissions) {
        if (perm.endsWith(".*")) {
          const permBase = perm.slice(0, -2);
          if (permission.startsWith(permBase)) {
            next();
            return;
          }
        }
      }

      res.status(403).json({ error: "Insufficient permissions" });
    } catch (error) {
      console.error("[auth] Authorization error:", error);
      res.status(500).json({ error: "Authorization failed" });
    }
  };
}

/**
 * Role-based authorization middleware factory
 * Checks if user has required role
 */
export function requireRole(roleName: string) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const hasRole = req.auth.roles.some((role) => role.name === roleName);
      if (!hasRole) {
        res
          .status(403)
          .json({ error: `Role '${roleName}' required` });
        return;
      }

      next();
    } catch (error) {
      console.error("[auth] Role check error:", error);
      res.status(500).json({ error: "Authorization failed" });
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
    res.status(429).json({
      error: "Too many login attempts. Please try again later.",
      retryAfter,
    });
    return;
  }

  // Increment counter
  attempts.count++;

  next();
}
