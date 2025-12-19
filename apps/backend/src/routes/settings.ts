// SPDX-License-Identifier: MIT
// apps/backend/src/routes/settings.ts

/**
 * Settings API Routes
 * RESTful API for system settings management with proper authentication
 */

import { Router, type Request, type Response } from "express";
import { createLogger } from "../utils/logger.js";
import SettingsService from "../services/settingsService.js";
import { SETTING_DEFINITIONS } from "../types/settings.js";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type {
  SystemSettings,
  SettingsImport,
  SettingCategory,
} from "../types/settings.js";

const router = Router();
const logger = createLogger("settings-api");

/* ========================================================================== */
/* 📖 READ Operations                                                         */
/* ========================================================================== */

/**
 * GET /api/settings
 * Get all settings (returns array format for frontend)
 */
router.get("/", authenticate, asyncHandler(async (req: Request, res: Response) => {
  const allSettings = await SettingsService.getAll();
  
  // Convert to array format
  const settingsArray = SETTING_DEFINITIONS.map(def => {
    const value = allSettings[def.key as keyof SystemSettings];
    return {
      id: def.key,
      key: def.key,
      value: value,
      category: def.category,
      sensitive: def.sensitive,
      description: def.description,
      type: def.type,
      validValues: def.validValues,
      minValue: def.minValue,
      maxValue: def.maxValue,
      defaultValue: def.defaultValue,
      requiresRestart: def.requiresRestart,
    };
  });
  
  // Filter sensitive settings for non-admin users
  const isAdmin = req.auth?.roles?.some(r => r.name === "admin") ?? false;
  const filtered = isAdmin ? settingsArray : settingsArray.filter(s => !s.sensitive);

  res.json({ success: true, settings: filtered });
}));

/**
 * GET /api/settings/definitions
 * Get setting definitions
 */
router.get("/definitions", authenticate, asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.auth?.roles?.some(r => r.name === "admin") ?? false;
  const definitions = isAdmin
    ? SETTING_DEFINITIONS
    : SETTING_DEFINITIONS.filter((d) => !d.sensitive);

  res.json({ success: true, definitions });
}));

/**
 * GET /api/settings/category/:category
 * Get settings by category
 */
router.get("/category/:category", authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;
  const settings = await SettingsService.getByCategory(category as SettingCategory);
  res.json({ success: true, category, settings });
}));

/**
 * GET /api/settings/history/:key
 * Get setting history
 */
router.get("/history/:key", authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  const { limit = 50 } = req.query;
  
  const history = await SettingsService.getHistory(key, Number(limit));
  res.json({ success: true, key, history });
}));

/**
 * GET /api/settings/history
 * Get recent changes across all settings
 */
router.get("/history", authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { limit = 100 } = req.query;
  
  const history = await SettingsService.getRecentChanges(Number(limit));
  res.json({ success: true, history });
}));

/**
 * GET /api/settings/:key
 * Get specific setting
 */
router.get("/:key", authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  
  // Check if sensitive
  const definition = SETTING_DEFINITIONS.find((d) => d.key === key);
  const isAdmin = req.auth?.roles?.some(r => r.name === "admin") ?? false;
  
  if (definition?.sensitive && !isAdmin) {
    return res.status(403).json({ error: "Access denied to sensitive setting" });
  }

  const value = await SettingsService.get(key);
  res.json({ success: true, key, value });
}));

/* ========================================================================== */
/* ✏️ WRITE Operations (Admin only)                                          */
/* ========================================================================== */

/**
 * PUT /api/settings/:key
 * Update specific setting
 */
router.put("/:key", authenticate, requireRole("admin"), asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  const { value, reason } = req.body;

  if (value === undefined) {
    return res.status(400).json({ error: "Missing value in request body" });
  }

  const userId = req.auth?.user?.id || "system";
  const success = await SettingsService.set(key, value, userId, reason);

  if (success) {
    res.json({ success: true, message: "Setting updated", key, value });
  } else {
    res.status(500).json({ error: "Failed to update setting" });
  }
}));

/**
 * POST /api/settings/bulk
 * Update multiple settings
 */
router.post("/bulk", authenticate, requireRole("admin"), asyncHandler(async (req: Request, res: Response) => {
  const { updates, reason } = req.body;

  if (!Array.isArray(updates)) {
    return res.status(400).json({ error: "Updates must be an array" });
  }

  const userId = req.auth?.user?.id || "system";
  
  // Update each setting
  const results = [];
  for (const update of updates) {
    try {
      const success = await SettingsService.set(update.key, update.value, userId, reason);
      results.push({ key: update.key, success });
    } catch (error) {
      results.push({ key: update.key, success: false, error: String(error) });
    }
  }

  const allSuccessful = results.every(r => r.success);
  res.json({ 
    success: allSuccessful, 
    results,
    message: `Updated ${results.filter(r => r.success).length} of ${results.length} settings`
  });
}));

/**
 * DELETE /api/settings/:key
 * Delete setting (reset to default)
 */
router.delete("/:key", authenticate, requireRole("admin"), asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  const userId = req.auth?.user?.id || "system";
  
  const success = await SettingsService.delete(key, userId);

  if (success) {
    res.json({ success: true, message: "Setting reset to default" });
  } else {
    res.status(500).json({ error: "Failed to reset setting" });
  }
}));

/**
 * POST /api/settings/reset
 * Reset settings to defaults
 */
router.post("/reset", authenticate, requireRole("admin"), asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.body;
  const userId = req.auth?.user?.id || "system";

  if (key) {
    // Reset single setting
    const success = await SettingsService.reset(key, userId);
    res.json({ success, message: success ? "Setting reset" : "Failed to reset setting" });
  } else {
    // Reset all settings
    const success = await SettingsService.resetAll(userId);
    res.json({ success, message: success ? "All settings reset" : "Failed to reset settings" });
  }
}));

/* ========================================================================== */
/* 🔄 IMPORT/EXPORT Operations                                               */
/* ========================================================================== */

/**
 * POST /api/settings/export
 * Export settings to JSON
 */
router.post("/export", authenticate, requireRole("admin"), asyncHandler(async (req: Request, res: Response) => {
  const { includeSensitive = false } = req.body;
  const userId = req.auth?.user?.id || "system";
  
  const exportData = await SettingsService.export(userId, includeSensitive);
  
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="settings-${Date.now()}.json"`);
  res.json(exportData);
}));

/**
 * POST /api/settings/import
 * Import settings from JSON
 */
router.post("/import", authenticate, requireRole("admin"), asyncHandler(async (req: Request, res: Response) => {
  const importData: SettingsImport = req.body;
  const userId = req.auth?.user?.id || "system";
  
  if (!importData || typeof importData !== "object") {
    return res.status(400).json({ error: "Invalid import data" });
  }

  const result = await SettingsService.import(importData, userId);
  res.json({ ...result, success: true });
}));

/* ========================================================================== */
/* 🔍 DIAGNOSTICS                                                            */
/* ========================================================================== */

/**
 * GET /api/settings/status
 * Get system diagnostics
 */
router.get("/status", authenticate, requireRole("admin"), asyncHandler(async (req: Request, res: Response) => {
  const status = await SettingsService.getStatusReport();
  res.json({ success: true, status });
}));

/**
 * POST /api/settings/validate
 * Validate all settings
 */
router.post("/validate", authenticate, requireRole("admin"), asyncHandler(async (req: Request, res: Response) => {
  const validation = await SettingsService.validate();
  res.json({ success: true, validation });
}));

export default router;
