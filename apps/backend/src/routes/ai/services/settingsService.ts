/**
 * settingsService.ts
 * ---------------------------------------------------------
 * Verwaltung, Validierung und Speicherung der Systemeinstellungen
 * für alle KI-Module (Provider, Services, Limits, API-Keys etc.).
 *
 * Unterstützt:
 *  - Laden & Speichern von JSON-Konfigurationen
 *  - Typisierte Einstellungen mit Defaultwerten
 *  - Validierung & Migration veralteter Strukturen
 *  - Änderungsverfolgung (Logging)
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { log } from "../utils/logger.js";
import type { Provider } from "../types/types.js";

type LogLevelValue = "error" | "warn" | "info" | "debug";

export interface AISettings {
  system_version: string;
  default_provider: Provider;
  default_model: string;
  log_level: LogLevelValue;
  max_parallel_requests: number;
  cache_enabled: boolean;
  autosave_interval_min: number;
  diagnostics_enabled: boolean;
  last_updated: string;
  [key: string]: unknown;
}

/* ========================================================================== */
/* ⚙️ Pfade & Standardwerte                                                  */
/* ========================================================================== */

const CONFIG_DIR = path.resolve("config");
const SETTINGS_FILE = path.join(CONFIG_DIR, "ai_settings.json");
const BACKUP_DIR = path.join(CONFIG_DIR, "backups");

const DEFAULT_SETTINGS: AISettings = {
  system_version: "1.0",
  default_provider: "openai",
  default_model: "gpt-4o-mini",
  log_level: "info",
  max_parallel_requests: 3,
  cache_enabled: true,
  autosave_interval_min: 30,
  diagnostics_enabled: true,
  last_updated: nowIso(),
};

/* ========================================================================== */
/* 📦 Dateioperationen                                                       */
/* ========================================================================== */

/**
 * Lädt aktuelle KI-Systemeinstellungen.
 * Erstellt bei Bedarf Standarddatei.
 */
export function loadSettings(): AISettings {
  ensureDirectories();

  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      log("warn", "Einstellungsdatei fehlt – Standardwerte werden erstellt.");
      saveSettings({ ...DEFAULT_SETTINGS });
      return { ...DEFAULT_SETTINGS };
    }

    const data = fs.readFileSync(SETTINGS_FILE, "utf8");
    const parsed = parseSettingsFile(data);
    return migrateSettings(parsed);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    log("error", "Fehler beim Laden der Einstellungen", { error: message });
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Speichert aktuelle Einstellungen dauerhaft auf der Festplatte.
 */
export function saveSettings(settings: AISettings): boolean {
  try {
    ensureDirectories();

    const backupName = `ai_settings_backup_${nowIso().replace(/[:.]/g, "-")}.json`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    if (fs.existsSync(SETTINGS_FILE)) {
      fs.copyFileSync(SETTINGS_FILE, backupPath);
      log("info", "Backup der alten Einstellungen erstellt", { backupPath });
    }

    const toSave: AISettings = {
      ...DEFAULT_SETTINGS,
      ...settings,
      last_updated: nowIso(),
    };

    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(toSave, null, 2), "utf8");
    log("info", "Einstellungen gespeichert", { keys: Object.keys(toSave) });
    return true;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    log("error", "Fehler beim Speichern der Einstellungen", { error: message });
    return false;
  }
}

/* ========================================================================== */
/* 🔧 Einzelne Werte & Updates                                               */
/* ========================================================================== */

/**
 * Aktualisiert oder ergänzt einzelne Konfigurationswerte.
 */
export function updateSetting(key: string, value: unknown): AISettings {
  const current = loadSettings();
  const prevValue = current[key];
  current[key] = value;
  saveSettings(current);
  log("info", "Einstellung geändert", { key, old: prevValue, new: value });
  return current;
}

/**
 * Setzt alle Einstellungen auf Defaultwerte zurück.
 */
export function resetSettings(): AISettings {
  saveSettings({ ...DEFAULT_SETTINGS });
  log("warn", "Einstellungen auf Standardwerte zurückgesetzt.");
  return DEFAULT_SETTINGS;
}

/**
 * Liefert einen bestimmten Wert mit Fallback.
 */
export function getSetting<T = unknown>(key: string, fallback?: T): T {
  const settings = loadSettings();
  return (settings[key] ?? fallback) as T;
}

/* ========================================================================== */
/* 🧠 Validierung & Migration                                                */
/* ========================================================================== */

/**
 * Prüft und aktualisiert alte Konfigurationsstrukturen.
 */
export function migrateSettings(settings: AISettings): AISettings {
  let changed = false;
  const normalized = normalizeSettings(settings);

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    if (!(key in normalized)) {
      normalized[key] = value;
      changed = true;
    }
  }

  if (changed) {
    log("info", "Veraltete Einstellungen ergänzt – neue Version gespeichert.");
    saveSettings(normalized);
  }

  return normalized;
}

/**
 * Validiert kritische Konfigurationsparameter.
 */
export function validateSettings(settings: AISettings): string[] {
  const issues: string[] = [];

  if (!settings.default_provider)
    issues.push("Kein Standard-Provider definiert.");
  if (!settings.default_model) issues.push("Kein Standardmodell gesetzt.");
  if (
    typeof settings.max_parallel_requests !== "number" ||
    settings.max_parallel_requests <= 0
  )
    issues.push("Ungültiger Wert für max_parallel_requests.");

  if (issues.length > 0) {
    log("warn", "Einstellungsvalidierung meldet Probleme", { issues });
  }

  return issues;
}

/* ========================================================================== */
/* 🧾 Diagnose & Systemstatus                                                */
/* ========================================================================== */

/**
 * Gibt einen strukturierten Diagnosebericht des Systems aus.
 */
export function getSettingsStatusReport() {
  const settings = loadSettings();
  const issues = validateSettings(settings);

  return {
    timestamp: new Date().toISOString(),
    settings,
    issues,
    system_info: {
      hostname: os.hostname(),
      platform: os.platform(),
      totalmem_GB: +(os.totalmem() / 1024 ** 3).toFixed(1),
      freemem_GB: +(os.freemem() / 1024 ** 3).toFixed(1),
      cpus: os.cpus().length,
    },
  };
}

/* ========================================================================== */
/* 🧩 Utility: Export & Import                                               */
/* ========================================================================== */

/**
 * Exportiert aktuelle Konfiguration in eine frei wählbare Datei.
 */
export function exportSettings(targetFile: string): boolean {
  try {
    const settings = loadSettings();
    fs.writeFileSync(targetFile, JSON.stringify(settings, null, 2), "utf8");
    log("info", "Einstellungen exportiert", { targetFile });
    return true;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    log("error", "Fehler beim Export", { error: message });
    return false;
  }
}

/**
 * Importiert Einstellungen aus einer externen JSON-Datei.
 */
export function importSettings(sourceFile: string): boolean {
  try {
    if (!fs.existsSync(sourceFile))
      throw new Error(`Datei nicht gefunden: ${sourceFile}`);
    const data = fs.readFileSync(sourceFile, "utf8");
    const imported = parseSettingsFile(data);
    saveSettings(imported);
    log("info", "Einstellungen importiert", { sourceFile });
    return true;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    log("error", "Fehler beim Import", { error: message });
    return false;
  }
}

/* ========================================================================== */
/* ✅ Export-API                                                            */
/* ========================================================================== */

export default {
  loadSettings,
  saveSettings,
  updateSetting,
  resetSettings,
  getSetting,
  validateSettings,
  migrateSettings,
  getSettingsStatusReport,
  exportSettings,
  importSettings,
};

function parseSettingsFile(data: string): AISettings {
  const parsed = JSON.parse(data) as unknown;
  if (!isRecord(parsed)) {
    throw new Error("Einstellungsdatei hat kein gültiges JSON-Objekt.");
  }
  return normalizeSettings(parsed as AISettings);
}

function normalizeSettings(settings: AISettings): AISettings {
  const normalized: AISettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
    last_updated:
      typeof settings.last_updated === "string"
        ? settings.last_updated
        : nowIso(),
  };

  if (!isValidLogLevel(normalized.log_level)) {
    normalized.log_level = DEFAULT_SETTINGS.log_level;
  }

  if (!isValidProvider(normalized.default_provider)) {
    normalized.default_provider = DEFAULT_SETTINGS.default_provider;
  }

  normalized.max_parallel_requests = toPositiveInteger(
    normalized.max_parallel_requests,
    DEFAULT_SETTINGS.max_parallel_requests,
  );

  normalized.autosave_interval_min = toPositiveInteger(
    normalized.autosave_interval_min,
    DEFAULT_SETTINGS.autosave_interval_min,
  );

  normalized.cache_enabled = toBoolean(
    normalized.cache_enabled,
    DEFAULT_SETTINGS.cache_enabled,
  );

  normalized.diagnostics_enabled = toBoolean(
    normalized.diagnostics_enabled,
    DEFAULT_SETTINGS.diagnostics_enabled,
  );

  return normalized;
}

function ensureDirectories() {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function toPositiveInteger(value: unknown, fallback: number): number {
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isFinite(num) && num > 0) return Math.round(num);
  return fallback;
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;
  return fallback;
}

function isValidLogLevel(level: unknown): level is LogLevelValue {
  return (
    level === "error" ||
    level === "warn" ||
    level === "info" ||
    level === "debug"
  );
}

function isValidProvider(provider: unknown): provider is Provider {
  if (typeof provider !== "string") return false;
  return [
    "openai",
    "anthropic",
    "local",
    "ollama",
    "fallback",
    "custom",
    "huggingface",
    "azure",
    "vertex",
    "embedding",
    "workflow",
    "diagnostic",
    "mock",
  ].includes(provider);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : JSON.stringify(error);
}

function nowIso(): string {
  return new Date().toISOString();
}
