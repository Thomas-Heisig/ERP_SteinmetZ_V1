// SPDX-License-Identifier: MIT
// apps/backend/src/types/user-settings.ts

/**
 * User-Specific Settings Type Definitions
 * Settings that can be customized per user
 */

export interface UserSettings {
  // UI Preferences
  theme: "light" | "dark" | "auto" | "lcars";
  language: string;
  date_format: string;
  time_format: string;
  number_format: string;
  items_per_page: number;
  sidebar_collapsed: boolean;
  compact_view: boolean;
  show_tooltips: boolean;
  enable_animations: boolean;

  // Notification Preferences
  notifications_email: boolean;
  notifications_browser: boolean;
  notification_sound_enabled: boolean;
  notification_digest_enabled: boolean;
  notification_digest_frequency: "hourly" | "daily" | "weekly";

  // Dashboard Preferences
  dashboard_layout?: string; // JSON string of widget layout
  dashboard_widgets?: string[]; // Array of enabled widgets
  dashboard_refresh_interval: number; // seconds

  // Work Preferences
  default_view: string; // Default landing page
  quick_actions?: string[]; // Favorite actions
  recent_items_count: number;

  // Accessibility
  high_contrast: boolean;
  font_size: "small" | "medium" | "large" | "xlarge";
  reduce_motion: boolean;
  screen_reader_mode: boolean;
}

export interface UserSettingRecord {
  id: string;
  user_id: string;
  key: string;
  value: string; // JSON string
  updated_at: string;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  // UI Preferences
  theme: "auto",
  language: "de",
  date_format: "DD.MM.YYYY",
  time_format: "HH:mm",
  number_format: "de-DE",
  items_per_page: 25,
  sidebar_collapsed: false,
  compact_view: false,
  show_tooltips: true,
  enable_animations: true,

  // Notification Preferences
  notifications_email: true,
  notifications_browser: true,
  notification_sound_enabled: true,
  notification_digest_enabled: false,
  notification_digest_frequency: "daily",

  // Dashboard Preferences
  dashboard_refresh_interval: 300, // 5 minutes

  // Work Preferences
  default_view: "/",
  recent_items_count: 10,

  // Accessibility
  high_contrast: false,
  font_size: "medium",
  reduce_motion: false,
  screen_reader_mode: false,
};

export interface UserSettingDefinition {
  key: keyof UserSettings;
  type: "string" | "number" | "boolean" | "select" | "json";
  label: string;
  description: string;
  defaultValue: string | number | boolean;
  category: "ui" | "notifications" | "dashboard" | "work" | "accessibility";
  options?: string[];
}

export const USER_SETTING_DEFINITIONS: UserSettingDefinition[] = [
  // UI Preferences
  {
    key: "theme",
    type: "select",
    label: "Theme",
    description: "Farbschema der Benutzeroberfläche",
    defaultValue: "auto",
    category: "ui",
    options: ["light", "dark", "auto", "lcars"],
  },
  {
    key: "language",
    type: "select",
    label: "Sprache",
    description: "Benutzersprache",
    defaultValue: "de",
    category: "ui",
    options: ["de", "en"],
  },
  {
    key: "sidebar_collapsed",
    type: "boolean",
    label: "Sidebar eingeklappt",
    description: "Sidebar standardmäßig eingeklappt anzeigen",
    defaultValue: false,
    category: "ui",
  },
  {
    key: "items_per_page",
    type: "select",
    label: "Einträge pro Seite",
    description: "Anzahl der Einträge in Listen",
    defaultValue: 25,
    category: "ui",
    options: ["10", "25", "50", "100"],
  },

  // Notification Preferences
  {
    key: "notifications_email",
    type: "boolean",
    label: "E-Mail-Benachrichtigungen",
    description: "Benachrichtigungen per E-Mail erhalten",
    defaultValue: true,
    category: "notifications",
  },
  {
    key: "notifications_browser",
    type: "boolean",
    label: "Browser-Benachrichtigungen",
    description: "Browser-Push-Benachrichtigungen erhalten",
    defaultValue: true,
    category: "notifications",
  },
  {
    key: "notification_sound_enabled",
    type: "boolean",
    label: "Benachrichtigungston",
    description: "Sound bei neuen Benachrichtigungen abspielen",
    defaultValue: true,
    category: "notifications",
  },

  // Dashboard Preferences
  {
    key: "dashboard_refresh_interval",
    type: "select",
    label: "Dashboard-Aktualisierung",
    description: "Wie oft soll das Dashboard aktualisiert werden (Sekunden)",
    defaultValue: 300,
    category: "dashboard",
    options: ["60", "300", "600", "1800"],
  },

  // Work Preferences
  {
    key: "default_view",
    type: "string",
    label: "Standard-Ansicht",
    description: "Seite die beim Login angezeigt wird",
    defaultValue: "/",
    category: "work",
  },
  {
    key: "recent_items_count",
    type: "select",
    label: "Anzahl zuletzt verwendeter Elemente",
    description: "Wie viele zuletzt verwendete Elemente anzeigen",
    defaultValue: 10,
    category: "work",
    options: ["5", "10", "20", "50"],
  },

  // Accessibility
  {
    key: "high_contrast",
    type: "boolean",
    label: "Hoher Kontrast",
    description: "Hochkontrast-Modus für bessere Lesbarkeit",
    defaultValue: false,
    category: "accessibility",
  },
  {
    key: "font_size",
    type: "select",
    label: "Schriftgröße",
    description: "Größe der Schrift in der Benutzeroberfläche",
    defaultValue: "medium",
    category: "accessibility",
    options: ["small", "medium", "large", "xlarge"],
  },
  {
    key: "reduce_motion",
    type: "boolean",
    label: "Bewegungen reduzieren",
    description: "Animationen und Bewegungen minimieren",
    defaultValue: false,
    category: "accessibility",
  },
];
