// SPDX-License-Identifier: MIT
// apps/frontend/src/contexts/SettingsContext.tsx

/**
 * Settings Context Provider
 * Provides system-wide access to settings with caching and real-time updates
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

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

interface SettingsContextType {
  settings: Setting[];
  loading: boolean;
  error: string | null;
  getSetting: <T = unknown>(key: string) => T | undefined;
  getSettingValue: <T = unknown>(key: string, defaultValue?: T) => T;
  updateSetting: (key: string, value: unknown) => Promise<void>;
  refresh: () => Promise<void>;
  isFeatureEnabled: (feature: string) => boolean;
  // Commonly used settings as properties for quick access
  theme: "light" | "dark" | "auto" | "lcars";
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from API
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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
    <T = unknown,>(key: string): T | undefined => {
      const setting = settings.find((s) => s.key === key);
      return setting?.value as T | undefined;
    },
    [settings],
  );

  // Get a setting value with default fallback
  const getSettingValue = useCallback(
    <T = unknown,>(key: string, defaultValue?: T): T => {
      const value = getSetting<T>(key);
      return value !== undefined ? value : (defaultValue as T);
    },
    [getSetting],
  );

  // Update a single setting
  const updateSetting = useCallback(async (key: string, value: unknown) => {
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
          reason: "Updated via Settings Context",
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
    } catch (err) {
      console.error(`Failed to update setting ${key}:`, err);
      throw err;
    }
  }, []);

  // Refresh settings from server
  const refresh = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  // Check if a feature flag is enabled
  const isFeatureEnabled = useCallback(
    (feature: string): boolean => {
      const key = feature.startsWith("feature_")
        ? feature
        : `feature_${feature}`;
      return getSettingValue<boolean>(key, false);
    },
    [getSettingValue],
  );

  // Commonly used settings
  const theme = getSettingValue<"light" | "dark" | "auto" | "lcars">(
    "theme",
    "auto",
  );
  const language = getSettingValue<string>("language", "de");
  const currency = getSettingValue<string>("system_currency", "EUR");
  const dateFormat = getSettingValue<string>("date_format", "DD.MM.YYYY");
  const timeFormat = getSettingValue<string>("time_format", "HH:mm");

  const value: SettingsContextType = {
    settings,
    loading,
    error,
    getSetting,
    getSettingValue,
    updateSetting,
    refresh,
    isFeatureEnabled,
    theme,
    language,
    currency,
    dateFormat,
    timeFormat,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook to use settings context
 */
export function useSettingsContext(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error(
      "useSettingsContext must be used within a SettingsProvider",
    );
  }
  return context;
}

/**
 * HOC to wrap component with settings provider
 */
export function withSettings<P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> {
  return function WithSettingsComponent(props: P) {
    return (
      <SettingsProvider>
        <Component {...props} />
      </SettingsProvider>
    );
  };
}
