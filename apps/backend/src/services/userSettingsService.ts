// SPDX-License-Identifier: MIT
// apps/backend/src/services/userSettingsService.ts

/**
 * User Settings Service
 * Manages user-specific settings and preferences
 */

import db from "./dbService.js";
import { createLogger } from "../utils/logger.js";
import {
  UserSettings,
  UserSettingRecord,
  DEFAULT_USER_SETTINGS,
} from "../types/user-settings.js";

const logger = createLogger("user-settings");

class UserSettingsService {
  /**
   * Initialize user settings table
   */
  static async init(): Promise<void> {
    try {
      const sql = `
        CREATE TABLE IF NOT EXISTS user_settings (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          user_id TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, key),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(key);
      `;

      db.exec(sql);
      logger.info("User settings table initialized");
    } catch (error) {
      logger.error("Failed to initialize user settings table:", error);
      throw error;
    }
  }

  /**
   * Get all settings for a user
   */
  static async getAll(userId: string): Promise<UserSettings> {
    try {
      const records = db
        .prepare("SELECT key, value FROM user_settings WHERE user_id = ?")
        .all(userId) as UserSettingRecord[];

      const settings = { ...DEFAULT_USER_SETTINGS };

      for (const record of records) {
        try {
          settings[record.key as keyof UserSettings] = JSON.parse(record.value);
        } catch (e) {
          logger.warn(`Failed to parse setting ${record.key}:`, e);
        }
      }

      return settings;
    } catch (error) {
      logger.error(`Failed to get user settings for ${userId}:`, error);
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
      const record = db
        .prepare(
          "SELECT value FROM user_settings WHERE user_id = ? AND key = ?",
        )
        .get(userId, key) as UserSettingRecord | undefined;

      if (record) {
        return JSON.parse(record.value);
      }

      return DEFAULT_USER_SETTINGS[key];
    } catch (error) {
      logger.error(`Failed to get user setting ${key} for ${userId}:`, error);
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

      db.prepare(
        `INSERT INTO user_settings (user_id, key, value, updated_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(user_id, key) DO UPDATE SET
           value = excluded.value,
           updated_at = CURRENT_TIMESTAMP`,
      ).run(userId, key, valueJson);

      logger.info(`User setting ${key} updated for user ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to set user setting ${key} for ${userId}:`, error);
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
      logger.error(
        `Failed to set multiple user settings for ${userId}:`,
        error,
      );
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
      db.prepare("DELETE FROM user_settings WHERE user_id = ? AND key = ?").run(
        userId,
        key,
      );

      logger.info(`User setting ${key} reset for user ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to reset user setting ${key} for ${userId}:`, error);
      return false;
    }
  }

  /**
   * Reset all settings for a user
   */
  static async resetAll(userId: string): Promise<boolean> {
    try {
      db.prepare("DELETE FROM user_settings WHERE user_id = ?").run(userId);

      logger.info(`All user settings reset for user ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to reset all user settings for ${userId}:`, error);
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
