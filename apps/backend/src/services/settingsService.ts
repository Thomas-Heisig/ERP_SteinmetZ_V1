// SPDX-License-Identifier: MIT
// apps/backend/src/services/settingsService.ts

/**
 * Settings Service
 * ---------------------------------------------------------
 * Comprehensive settings management with database persistence,
 * type safety, validation, history tracking, and audit logging.
 *
 * Features:
 *  - Type-safe settings with full TypeScript support
 *  - Database persistence with SQLite/PostgreSQL
 *  - Settings history and audit trail
 *  - Validation and migration
 *  - Export/Import functionality
 *  - Real-time change notifications
 *  - Sensitive data encryption
 */

import { createLogger } from "../utils/logger.js";
import db from "./dbService.js";
import crypto from "node:crypto";
import os from "node:os";
import type {
  SystemSettings,
  SettingRecord,
  SettingHistoryRecord,
  SettingsStatusReport,
  SettingsExport,
  SettingsImport,
  SettingValidationError,
  SettingCategory,
  Provider,
  LogLevel,
} from "../types/settings.js";
import { DEFAULT_SETTINGS, SETTING_DEFINITIONS } from "../types/settings.js";

const logger = createLogger("settings");

// Encryption key for sensitive settings (should be in env vars)
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || "default-key-change-in-production";
const ALGORITHM = "aes-256-cbc";

/* ========================================================================== */
/* 🔐 Encryption/Decryption for Sensitive Settings                           */
/* ========================================================================== */

function encrypt(text: string): string {
  try {
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (error) {
    logger.error({ error }, "Failed to encrypt value");
    return text;
  }
}

function decrypt(encrypted: string): string {
  try {
    const [ivHex, encryptedText] = encrypted.split(":");
    if (!ivHex || !encryptedText) return encrypted;
    
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    logger.error({ error }, "Failed to decrypt value");
    return encrypted;
  }
}

/* ========================================================================== */
/* 📊 Database Operations                                                     */
/* ========================================================================== */

export class SettingsService {
  /**
   * Initialize settings - create tables and insert defaults
   */
  static async initialize(): Promise<void> {
    try {
      await db.init();
      logger.info("Settings service initialized");
    } catch (error) {
      logger.error({ error }, "Failed to initialize settings service");
      throw error;
    }
  }

  /**
   * Get all settings as a typed object
   */
  static async getAll(): Promise<SystemSettings> {
    try {
      const records = await db.all<SettingRecord>(
        "SELECT * FROM system_settings ORDER BY category, key"
      );

      const settings: Partial<SystemSettings> = {};

      for (const record of records) {
        try {
          let value = JSON.parse(record.value);
          
          // Decrypt if sensitive
          if (record.sensitive && typeof value === "string") {
            value = decrypt(value);
          }

          settings[record.key as keyof SystemSettings] = value;
        } catch (error) {
          logger.warn({ key: record.key, error }, "Failed to parse setting value");
        }
      }

      // Merge with defaults for any missing settings
      return { ...DEFAULT_SETTINGS, ...settings };
    } catch (error) {
      logger.error({ error }, "Failed to load settings");
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Get a single setting by key
   */
  static async get<T = unknown>(key: string, fallback?: T): Promise<T> {
    try {
      const record = await db.get<SettingRecord>(
        "SELECT * FROM system_settings WHERE key = ?",
        [key]
      );

      if (!record) {
        return (fallback ?? DEFAULT_SETTINGS[key as keyof SystemSettings]) as T;
      }

      let value = JSON.parse(record.value);
      
      if (record.sensitive && typeof value === "string") {
        value = decrypt(value);
      }

      return value as T;
    } catch (error) {
      logger.error({ key, error }, "Failed to get setting");
      return fallback as T;
    }
  }

  /**
   * Get settings by category
   */
  static async getByCategory(category: SettingCategory): Promise<Record<string, unknown>> {
    try {
      const records = await db.all<SettingRecord>(
        "SELECT * FROM system_settings WHERE category = ? ORDER BY key",
        [category]
      );

      const settings: Record<string, unknown> = {};

      for (const record of records) {
        try {
          let value = JSON.parse(record.value);
          
          if (record.sensitive && typeof value === "string") {
            value = decrypt(value);
          }

          settings[record.key] = value;
        } catch (error) {
          logger.warn({ key: record.key, error }, "Failed to parse setting");
        }
      }

      return settings;
    } catch (error) {
      logger.error({ category, error }, "Failed to get settings by category");
      return {};
    }
  }

  /**
   * Set a single setting value
   */
  static async set(
    key: string,
    value: unknown,
    userId?: string,
    reason?: string
  ): Promise<boolean> {
    try {
      // Get current value for history
      const current = await db.get<SettingRecord>(
        "SELECT * FROM system_settings WHERE key = ?",
        [key]
      );

      // Check if setting is sensitive
      const definition = SETTING_DEFINITIONS.find((d) => d.key === key);
      const isSensitive = definition?.sensitive || false;

      // Prepare value
      let valueStr = JSON.stringify(value);
      if (isSensitive && typeof value === "string") {
        valueStr = JSON.stringify(encrypt(value));
      }

      if (current) {
        // Update existing
        await db.run(
          `UPDATE system_settings 
           SET value = ?, updated_at = datetime('now'), updated_by = ?
           WHERE key = ?`,
          [valueStr, userId || null, key]
        );

        // Record history
        await this.recordHistory(key, current.value, valueStr, userId || "system", reason);
      } else {
        // Insert new
        await db.run(
          `INSERT INTO system_settings (key, value, category, type, description, sensitive, updated_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            key,
            valueStr,
            definition?.category || "system",
            definition?.type || "string",
            definition?.description || "",
            isSensitive ? 1 : 0,
            userId || null,
          ]
        );

        // Record history
        await this.recordHistory(key, null, valueStr, userId || "system", reason);
      }

      logger.info({ key, userId }, "Setting updated");
      return true;
    } catch (error) {
      logger.error({ key, error }, "Failed to set setting");
      return false;
    }
  }

  /**
   * Set multiple settings at once
   */
  static async setMany(
    settings: Partial<SystemSettings>,
    userId?: string,
    reason?: string
  ): Promise<boolean> {
    try {
      await db.transaction(async () => {
        for (const [key, value] of Object.entries(settings)) {
          await this.set(key, value, userId, reason);
        }
      });

      logger.info({ count: Object.keys(settings).length, userId }, "Multiple settings updated");
      return true;
    } catch (error) {
      logger.error({ error }, "Failed to set multiple settings");
      return false;
    }
  }

  /**
   * Reset a setting to its default value
   */
  static async reset(key: string, userId?: string): Promise<boolean> {
    const defaultValue = DEFAULT_SETTINGS[key as keyof SystemSettings];
    if (defaultValue === undefined) {
      logger.warn({ key }, "No default value found for setting");
      return false;
    }

    return this.set(key, defaultValue, userId, "Reset to default");
  }

  /**
   * Reset all settings to defaults
   */
  static async resetAll(userId?: string): Promise<boolean> {
    try {
      await db.transaction(async () => {
        for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
          await this.set(key, value, userId, "Reset all to defaults");
        }
      });

      logger.info({ userId }, "All settings reset to defaults");
      return true;
    } catch (error) {
      logger.error({ error }, "Failed to reset all settings");
      return false;
    }
  }

  /**
   * Delete a setting
   */
  static async delete(key: string, userId?: string): Promise<boolean> {
    try {
      const current = await db.get<SettingRecord>(
        "SELECT value FROM system_settings WHERE key = ?",
        [key]
      );

      await db.run("DELETE FROM system_settings WHERE key = ?", [key]);

      if (current) {
        await this.recordHistory(key, current.value, null, userId || "system", "Deleted");
      }

      logger.info({ key, userId }, "Setting deleted");
      return true;
    } catch (error) {
      logger.error({ key, error }, "Failed to delete setting");
      return false;
    }
  }

  /* ======================================================================== */
  /* 📜 History & Audit Trail                                                */
  /* ======================================================================== */

  /**
   * Record a setting change in history
   */
  private static async recordHistory(
    key: string,
    oldValue: string | null,
    newValue: string | null,
    userId: string,
    reason?: string
  ): Promise<void> {
    try {
      await db.run(
        `INSERT INTO system_settings_history 
         (setting_key, old_value, new_value, changed_by, change_reason)
         VALUES (?, ?, ?, ?, ?)`,
        [key, oldValue, newValue, userId, reason || null]
      );
    } catch (error) {
      logger.error({ key, error }, "Failed to record settings history");
    }
  }

  /**
   * Get history for a specific setting
   */
  static async getHistory(key: string, limit: number = 50): Promise<SettingHistoryRecord[]> {
    try {
      return await db.all<SettingHistoryRecord>(
        `SELECT * FROM system_settings_history 
         WHERE setting_key = ? 
         ORDER BY changed_at DESC 
         LIMIT ?`,
        [key, limit]
      );
    } catch (error) {
      logger.error({ key, error }, "Failed to get setting history");
      return [];
    }
  }

  /**
   * Get recent changes across all settings
   */
  static async getRecentChanges(limit: number = 100): Promise<SettingHistoryRecord[]> {
    try {
      return await db.all<SettingHistoryRecord>(
        `SELECT * FROM system_settings_history 
         ORDER BY changed_at DESC 
         LIMIT ?`,
        [limit]
      );
    } catch (error) {
      logger.error({ error }, "Failed to get recent changes");
      return [];
    }
  }

  /* ======================================================================== */
  /* ✅ Validation                                                           */
  /* ======================================================================== */

  /**
   * Validate all settings
   */
  static async validate(): Promise<SettingValidationError[]> {
    const errors: SettingValidationError[] = [];
    const settings = await this.getAll();

    for (const definition of SETTING_DEFINITIONS) {
      const value = settings[definition.key as keyof SystemSettings];

      // Check required
      if (definition.required && (value === undefined || value === null || value === "")) {
        errors.push({
          key: definition.key,
          error: "Required setting is missing",
          currentValue: value,
        });
        continue;
      }

      // Type validation
      if (value !== undefined && value !== null) {
        const expectedType = definition.type === "select" || definition.type === "multiselect" 
          ? "string" 
          : definition.type;

        if (typeof value !== expectedType && definition.type !== "json") {
          errors.push({
            key: definition.key,
            error: `Expected type ${expectedType}, got ${typeof value}`,
            currentValue: value,
          });
        }

        // Validation rules
        if (definition.validation) {
          const { min, max, pattern, options } = definition.validation;

          // Number range
          if (typeof value === "number") {
            if (min !== undefined && value < min) {
              errors.push({
                key: definition.key,
                error: `Value must be at least ${min}`,
                currentValue: value,
              });
            }
            if (max !== undefined && value > max) {
              errors.push({
                key: definition.key,
                error: `Value must be at most ${max}`,
                currentValue: value,
              });
            }
          }

          // String pattern
          if (typeof value === "string" && pattern) {
            const regex = new RegExp(pattern);
            if (!regex.test(value)) {
              errors.push({
                key: definition.key,
                error: `Value does not match required pattern: ${pattern}`,
                currentValue: value,
              });
            }
          }

          // Enum options
          if (options && !options.includes(String(value))) {
            errors.push({
              key: definition.key,
              error: `Value must be one of: ${options.join(", ")}`,
              currentValue: value,
            });
          }
        }
      }
    }

    if (errors.length > 0) {
      logger.warn({ errorCount: errors.length }, "Settings validation found issues");
    }

    return errors;
  }

  /* ======================================================================== */
  /* 📤 Export / Import                                                      */
  /* ======================================================================== */

  /**
   * Export settings to JSON
   */
  static async export(userId: string, includeSensitive: boolean = false): Promise<SettingsExport> {
    const settings = await this.getAll();

    // Filter out sensitive data if requested
    const exportSettings: Partial<SystemSettings> = {};
    for (const [key, value] of Object.entries(settings)) {
      const definition = SETTING_DEFINITIONS.find((d) => d.key === key);
      if (!definition?.sensitive || includeSensitive) {
        exportSettings[key as keyof SystemSettings] = value;
      }
    }

    return {
      version: settings.system_version,
      exported_at: new Date().toISOString(),
      exported_by: userId,
      settings: exportSettings,
    };
  }

  /**
   * Import settings from JSON
   */
  static async import(
    data: SettingsImport,
    userId: string
  ): Promise<{ success: boolean; imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    try {
      await db.transaction(async () => {
        for (const [key, value] of Object.entries(data.settings)) {
          const definition = SETTING_DEFINITIONS.find((d) => d.key === key);
          
          // Skip sensitive if not allowed
          if (definition?.sensitive && !data.import_sensitive) {
            continue;
          }

          try {
            await this.set(key, value, userId, "Imported from file");
            imported++;
          } catch (error) {
            errors.push(`Failed to import ${key}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      });

      logger.info({ imported, errors: errors.length, userId }, "Settings imported");
      return { success: errors.length === 0, imported, errors };
    } catch (error) {
      logger.error({ error }, "Failed to import settings");
      return { success: false, imported, errors: [error instanceof Error ? error.message : String(error)] };
    }
  }

  /* ======================================================================== */
  /* 📊 Status & Diagnostics                                                */
  /* ======================================================================== */

  /**
   * Get comprehensive status report
   */
  static async getStatusReport(): Promise<SettingsStatusReport> {
    const settings = await this.getAll();
    const allRecords = await db.all<SettingRecord>("SELECT * FROM system_settings");
    const validationErrors = await this.validate();

    const categoryCounts: Record<SettingCategory, number> = {
      system: 0,
      ai: 0,
      database: 0,
      security: 0,
      ui: 0,
      integration: 0,
      performance: 0,
      email: 0,
      finance: 0,
      inventory: 0,
      hr: 0,
      crm: 0,
      reporting: 0,
      backup: 0,
      api: 0,
      notifications: 0,
    };

    allRecords.forEach((record) => {
      const category = record.category as SettingCategory;
      if (category in categoryCounts) {
        categoryCounts[category]++;
      }
    });

    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    return {
      timestamp: new Date().toISOString(),
      total_settings: allRecords.length,
      categories: categoryCounts,
      validation_errors: validationErrors,
      system_info: {
        hostname: os.hostname(),
        platform: os.platform(),
        node_version: process.version,
        uptime_seconds: Math.floor(process.uptime()),
        memory: {
          total_gb: Math.round((totalMem / 1024 ** 3) * 100) / 100,
          free_gb: Math.round((freeMem / 1024 ** 3) * 100) / 100,
          used_percentage: Math.round(((totalMem - freeMem) / totalMem) * 100),
        },
        cpu: {
          cores: cpus.length,
          model: cpus[0]?.model || "Unknown",
        },
      },
      database_info: {
        connected: true,
        type: process.env.DB_DRIVER || "sqlite",
      },
    };
  }
}

export default SettingsService;
