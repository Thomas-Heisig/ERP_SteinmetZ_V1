// SPDX-License-Identifier: MIT
// apps/backend/src/routes/userSettings.ts

/**
 * User Settings API Routes
 * RESTful API for user-specific settings management
 */

import { Router, type Request, type Response } from "express";
import { createLogger } from "../utils/logger.js";
import UserSettingsService from "../services/userSettingsService.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { USER_SETTING_DEFINITIONS } from "../types/user-settings.js";

const router = Router();
const logger = createLogger("user-settings-api");

/**
 * GET /api/user-settings
 * Get all settings for current user
 */
router.get(
  "/",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const settings = await UserSettingsService.getAll(userId);
    res.json({ success: true, settings });
  })
);

/**
 * GET /api/user-settings/definitions
 * Get user setting definitions
 */
router.get(
  "/definitions",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, definitions: USER_SETTING_DEFINITIONS });
  })
);

/**
 * GET /api/user-settings/:key
 * Get a specific setting for current user
 */
router.get(
  "/:key",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { key } = req.params;
    const value = await UserSettingsService.get(userId, key as any);

    res.json({ success: true, key, value });
  })
);

/**
 * PUT /api/user-settings/:key
 * Update a specific setting for current user
 */
router.put(
  "/:key",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: "Value is required" });
    }

    const success = await UserSettingsService.set(userId, key as any, value);

    if (success) {
      res.json({ success: true, message: "Setting updated" });
    } else {
      res.status(500).json({ error: "Failed to update setting" });
    }
  })
);

/**
 * POST /api/user-settings/bulk
 * Update multiple settings for current user
 */
router.post(
  "/bulk",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { settings } = req.body;

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({ error: "Settings object is required" });
    }

    const result = await UserSettingsService.setMultiple(userId, settings);

    res.json({
      success: result.success,
      updated: result.updated,
      message: `Updated ${result.updated} settings`,
    });
  })
);

/**
 * DELETE /api/user-settings/:key
 * Reset a specific setting to default
 */
router.delete(
  "/:key",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { key } = req.params;
    const success = await UserSettingsService.reset(userId, key as any);

    if (success) {
      res.json({ success: true, message: "Setting reset to default" });
    } else {
      res.status(500).json({ error: "Failed to reset setting" });
    }
  })
);

/**
 * POST /api/user-settings/reset
 * Reset all settings to defaults
 */
router.post(
  "/reset",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const success = await UserSettingsService.resetAll(userId);

    res.json({
      success,
      message: success
        ? "All settings reset to defaults"
        : "Failed to reset settings",
    });
  })
);

export default router;
