// SPDX-License-Identifier: MIT
// apps/frontend/src/hooks/useSettings.ts

/**
 * React Hook for Settings Management
 * Provides easy access to system settings with caching and real-time updates
 */

import { useState, useEffect, useCallback } from "react";

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  category: string;
  type: string;
  description: string;
  sensitive: boolean;
  label?: string;
  validation?: {
    min?: number;
    max?: number;
    options?: string[];
  };
  defaultValue?: unknown;
  requiresRestart?: boolean;
}

export interface UseSettingsReturn {
  settings: Setting[];
  loading: boolean;
  error: string | null;
  getSetting: <T = unknown>(key: string) => T | undefined;
  getSettingValue: <T = unknown>(key: string, defaultValue?: T) => T;
  updateSetting: (
    key: string,
    value: unknown,
    reason?: string,
  ) => Promise<void>;
  updateMultiple: (
    updates: Record<string, unknown>,
    reason?: string,
  ) => Promise<void>;
  resetToDefaults: (reason?: string) => Promise<void>;
  refresh: () => Promise<void>;
  getByCategory: (category: string) => Setting[];
  requiresRestartAfterChanges: () => boolean;
}

const CACHE_KEY = "system_settings_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to manage system settings
 */
export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());

  // Load settings from API
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = sessionStorage.getItem(CACHE_KEY);
      const cacheTime = sessionStorage.getItem(`${CACHE_KEY}_time`);

      if (
        cached &&
        cacheTime &&
        Date.now() - parseInt(cacheTime) < CACHE_DURATION
      ) {
        setSettings(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const response = await fetch("/api/settings", {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);

        // Cache the settings
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(data.settings));
        sessionStorage.setItem(`${CACHE_KEY}_time`, Date.now().toString());
      } else {
        throw new Error(data.error || "Failed to load settings");
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Get a specific setting object
  const getSetting = useCallback(
    <T = unknown>(key: string): T | undefined => {
      const setting = settings.find((s) => s.key === key);
      return setting?.value as T | undefined;
    },
    [settings],
  );

  // Get a setting value with default fallback
  const getSettingValue = useCallback(
    <T = unknown>(key: string, defaultValue?: T): T => {
      const value = getSetting<T>(key);
      return value !== undefined ? value : (defaultValue as T);
    },
    [getSetting],
  );

  // Update a single setting
  const updateSetting = useCallback(
    async (key: string, value: unknown, reason?: string) => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/settings/${key}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            value,
            reason: reason || "Updated via useSettings hook",
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update setting");
        }

        // Update local state
        setSettings((prev) =>
          prev.map((s) => (s.key === key ? { ...s, value } : s)),
        );

        // Track which keys have been changed
        const setting = settings.find((s) => s.key === key);
        if (setting?.requiresRestart) {
          setChangedKeys((prev) => new Set(prev).add(key));
        }

        // Invalidate cache
        sessionStorage.removeItem(CACHE_KEY);
        sessionStorage.removeItem(`${CACHE_KEY}_time`);
      } catch (err) {
        console.error(`Failed to update setting ${key}:`, err);
        throw err;
      }
    },
    [settings],
  );

  // Update multiple settings at once
  const updateMultiple = useCallback(
    async (updates: Record<string, unknown>, reason?: string) => {
      try {
        const token = localStorage.getItem("token");
        const updateArray = Object.entries(updates).map(([key, value]) => ({
          key,
          value,
        }));

        const response = await fetch("/api/settings/bulk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            updates: updateArray,
            reason: reason || "Bulk update via useSettings hook",
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update settings");
        }

        // Update local state
        setSettings((prev) =>
          prev.map((s) =>
            updates[s.key] !== undefined ? { ...s, value: updates[s.key] } : s,
          ),
        );

        // Track keys that require restart
        const restartKeys = settings
          .filter((s) => updates[s.key] !== undefined && s.requiresRestart)
          .map((s) => s.key);

        if (restartKeys.length > 0) {
          setChangedKeys((prev) => {
            const newSet = new Set(prev);
            restartKeys.forEach((k) => newSet.add(k));
            return newSet;
          });
        }

        // Invalidate cache
        sessionStorage.removeItem(CACHE_KEY);
        sessionStorage.removeItem(`${CACHE_KEY}_time`);
      } catch (err) {
        console.error("Failed to update settings:", err);
        throw err;
      }
    },
    [settings],
  );

  // Reset all settings to defaults
  const resetToDefaults = useCallback(
    async (reason?: string) => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/settings/reset", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            reason: reason || "Reset to defaults via useSettings hook",
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to reset settings");
        }

        // Reload settings
        await loadSettings();
        setChangedKeys(new Set());

        // Invalidate cache
        sessionStorage.removeItem(CACHE_KEY);
        sessionStorage.removeItem(`${CACHE_KEY}_time`);
      } catch (err) {
        console.error("Failed to reset settings:", err);
        throw err;
      }
    },
    [loadSettings],
  );

  // Refresh settings from server
  const refresh = useCallback(async () => {
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(`${CACHE_KEY}_time`);
    await loadSettings();
  }, [loadSettings]);

  // Get settings by category
  const getByCategory = useCallback(
    (category: string): Setting[] => {
      return settings.filter((s) => s.category === category);
    },
    [settings],
  );

  // Check if any changed settings require restart
  const requiresRestartAfterChanges = useCallback((): boolean => {
    return changedKeys.size > 0;
  }, [changedKeys]);

  return {
    settings,
    loading,
    error,
    getSetting,
    getSettingValue,
    updateSetting,
    updateMultiple,
    resetToDefaults,
    refresh,
    getByCategory,
    requiresRestartAfterChanges,
  };
}

/**
 * Hook to get a specific setting value
 */
export function useSetting<T = unknown>(
  key: string,
  defaultValue?: T,
): {
  value: T;
  loading: boolean;
  error: string | null;
  update: (newValue: T, reason?: string) => Promise<void>;
} {
  const { getSetting, getSettingValue, updateSetting, loading, error } =
    useSettings();

  const value = getSetting<T>(key) ?? defaultValue;

  const update = useCallback(
    async (newValue: T, reason?: string) => {
      await updateSetting(key, newValue, reason);
    },
    [key, updateSetting],
  );

  return {
    value: value as T,
    loading,
    error,
    update,
  };
}
