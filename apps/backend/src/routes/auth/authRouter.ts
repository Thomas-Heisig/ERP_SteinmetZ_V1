// SPDX-License-Identifier: MIT
// apps/backend/src/routes/auth/authRouter.ts

import { Router, Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../../services/authService.js";
import {
  authenticate,
  rateLimitLogin,
  requireRole,
} from "../../middleware/authMiddleware.js";

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
router.post("/register", async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await AuthService.register(data);

    res.status(201).json({
      success: true,
      user,
      message: "User registered successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.issues,
      });
      return;
    }

    console.error("[auth] Registration error:", error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    });
  }
});

/**
 * POST /api/auth/login
 * Login with username/email and password
 */
router.post("/login", rateLimitLogin, async (req: Request, res: Response) => {
  try {
    const credentials = loginSchema.parse(req.body);
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const result = await AuthService.login(credentials, ipAddress, userAgent);

    if (!result.success) {
      res.status(401).json(result);
      return;
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.issues,
      });
      return;
    }

    console.error("[auth] Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post("/logout", authenticate, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.substring(7) || req.cookies?.token;

    if (token) {
      await AuthService.logout(token);
    }

    res.clearCookie("token");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("[auth] Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Logout failed",
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: "Refresh token is required",
      });
      return;
    }

    const result = await AuthService.refreshToken(refreshToken);

    if (!result) {
      res.status(401).json({
        success: false,
        error: "Invalid or expired refresh token",
      });
      return;
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
  } catch (error) {
    console.error("[auth] Refresh token error:", error);
    res.status(500).json({
      success: false,
      error: "Token refresh failed",
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get("/me", authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    res.json({
      success: true,
      user: req.auth.user,
      roles: req.auth.roles,
      permissions: req.auth.permissions,
    });
  } catch (error) {
    console.error("[auth] Get current user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user information",
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post(
  "/change-password",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Not authenticated" });
        return;
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: "Validation error",
          details: error.issues,
        });
        return;
      }

      console.error("[auth] Change password error:", error);
      res.status(400).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Password change failed",
      });
    }
  },
);

/**
 * GET /api/auth/users
 * List all users (admin only)
 */
router.get(
  "/users",
  authenticate,
  requireRole("Admin"),
  async (_req: Request, res: Response) => {
    try {
      const users = await AuthService.listUsers();
      res.json({ success: true, users });
    } catch (error) {
      console.error("[auth] List users error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to list users",
      });
    }
  },
);

/**
 * GET /api/auth/roles
 * List all roles
 */
router.get("/roles", authenticate, async (_req: Request, res: Response) => {
  try {
    const roles = await AuthService.listRoles();
    res.json({ success: true, roles });
  } catch (error) {
    console.error("[auth] List roles error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list roles",
    });
  }
});

/**
 * POST /api/auth/users/:userId/roles
 * Assign role to user (admin only)
 */
router.post(
  "/users/:userId/roles",
  authenticate,
  requireRole("Admin"),
  async (req: Request, res: Response) => {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const { userId } = req.params;
      const { roleId } = req.body;

      if (!roleId) {
        res.status(400).json({ error: "Role ID is required" });
        return;
      }

      await AuthService.assignRole(userId, roleId, req.auth.user.id);

      res.json({
        success: true,
        message: "Role assigned successfully",
      });
    } catch (error) {
      console.error("[auth] Assign role error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to assign role",
      });
    }
  },
);

/**
 * DELETE /api/auth/users/:userId/roles/:roleId
 * Remove role from user (admin only)
 */
router.delete(
  "/users/:userId/roles/:roleId",
  authenticate,
  requireRole("Admin"),
  async (req: Request, res: Response) => {
    try {
      const { userId, roleId } = req.params;

      await AuthService.removeRole(userId, roleId);

      res.json({
        success: true,
        message: "Role removed successfully",
      });
    } catch (error) {
      console.error("[auth] Remove role error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to remove role",
      });
    }
  },
);

/**
 * DELETE /api/auth/users/:userId
 * Delete user (admin only)
 */
router.delete(
  "/users/:userId",
  authenticate,
  requireRole("Admin"),
  async (req: Request, res: Response) => {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const { userId } = req.params;

      // Prevent self-deletion
      if (userId === req.auth.user.id) {
        res.status(400).json({ error: "Cannot delete your own account" });
        return;
      }

      await AuthService.deleteUser(userId);

      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("[auth] Delete user error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete user",
      });
    }
  },
);

export default router;
