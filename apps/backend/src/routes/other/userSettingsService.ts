// SPDX-License-Identifier: MIT
// apps/backend/src/services/userSettingsService.ts

/**
 * User Settings Service
 * Manages user-specific settings and preferences
 */

import db from "../database/dbService.js";
import { createLogger } from "../../utils/logger.js";
import {
  UserSettings,
  UserSettingRecord,
  DEFAULT_USER_SETTINGS,
} from "../settings/user-settings.js";

const logger = createLogger("user-settings");

class UserSettingsService {
  /**
   * Initialize user settings table
   */
  static async init(): Promise<void> {
    try {
      // Create table
      await db.run(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          user_id TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, key),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Create indexes separately
      await db.run(
        `CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id)`,
      );
      await db.run(
        `CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(key)`,
      );

      logger.info(
        { action: "table_initialized" },
        "User settings table initialized",
      );
    } catch (error) {
      logger.error({ error }, "Failed to initialize user settings table");
      throw error;
    }
  }

  /**
   * Get all settings for a user
   */
  static async getAll(userId: string): Promise<UserSettings> {
    try {
      const records = await db.all<UserSettingRecord>(
        "SELECT key, value FROM user_settings WHERE user_id = ?",
        [userId],
      );

      const settings = { ...DEFAULT_USER_SETTINGS };

      for (const record of records) {
        try {
          const parsedValue = JSON.parse(record.value);
          const key = record.key as keyof UserSettings;
          (settings[key] as unknown) = parsedValue;
        } catch (parseError) {
          logger.warn(
            { error: parseError, key: record.key },
            "Failed to parse setting",
          );
        }
      }

      return settings;
    } catch (error) {
      logger.error({ error, userId }, "Failed to get user settings");
      return DEFAULT_USER_SETTINGS;
    }
  }

  /**
   * Get a specific setting for a user
   */
  static async get<K extends keyof UserSettings>(
    userId: string,
    key: K,
  ): Promise<UserSettings[K]> {
    try {
      const record = await db.get<UserSettingRecord>(
        "SELECT value FROM user_settings WHERE user_id = ? AND key = ?",
        [userId, key],
      );

      if (record) {
        return JSON.parse(record.value);
      }

      return DEFAULT_USER_SETTINGS[key];
    } catch (error) {
      logger.error({ error, userId, key }, "Failed to get user setting");
      return DEFAULT_USER_SETTINGS[key];
    }
  }

  /**
   * Set a specific setting for a user
   */
  static async set<K extends keyof UserSettings>(
    userId: string,
    key: K,
    value: UserSettings[K],
  ): Promise<boolean> {
    try {
      const valueJson = JSON.stringify(value);

      await db.run(
        `INSERT INTO user_settings (user_id, key, value, updated_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(user_id, key) DO UPDATE SET
           value = excluded.value,
           updated_at = CURRENT_TIMESTAMP`,
        [userId, key, valueJson],
      );

      logger.info({ userId, key }, "User setting updated");
      return true;
    } catch (error) {
      logger.error({ error, userId, key }, "Failed to set user setting");
      return false;
    }
  }

  /**
   * Set multiple settings for a user
   */
  static async setMultiple(
    userId: string,
    settings: Partial<UserSettings>,
  ): Promise<{ success: boolean; updated: number }> {
    try {
      let updated = 0;

      for (const [key, value] of Object.entries(settings)) {
        const success = await this.set(
          userId,
          key as keyof UserSettings,
          value,
        );
        if (success) updated++;
      }

      return { success: true, updated };
    } catch (error) {
      logger.error({ error, userId }, "Failed to set multiple user settings");
      return { success: false, updated: 0 };
    }
  }

  /**
   * Reset a specific setting to default
   */
  static async reset(
    userId: string,
    key: keyof UserSettings,
  ): Promise<boolean> {
    try {
      await db.run("DELETE FROM user_settings WHERE user_id = ? AND key = ?", [
        userId,
        key,
      ]);

      logger.info({ userId, key }, "User setting reset");
      return true;
    } catch (error) {
      logger.error({ error, userId, key }, "Failed to reset user setting");
      return false;
    }
  }

  /**
   * Reset all settings for a user
   */
  static async resetAll(userId: string): Promise<boolean> {
    try {
      await db.run("DELETE FROM user_settings WHERE user_id = ?", [userId]);

      logger.info({ userId }, "All user settings reset");
      return true;
    } catch (error) {
      logger.error({ error, userId }, "Failed to reset all user settings");
      return false;
    }
  }

  /**
   * Delete all settings for a user (when user is deleted)
   */
  static async deleteForUser(userId: string): Promise<boolean> {
    return this.resetAll(userId);
  }
}

export default UserSettingsService;
