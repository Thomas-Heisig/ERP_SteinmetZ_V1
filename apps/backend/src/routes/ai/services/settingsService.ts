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
import type { AIModuleConfig, Provider } from "../types/types.js";

/* ========================================================================== */
/* ⚙️ Pfade & Standardwerte                                                  */
/* ========================================================================== */

const CONFIG_DIR = path.resolve("config");
const SETTINGS_FILE = path.join(CONFIG_DIR, "ai_settings.json");
const BACKUP_DIR = path.join(CONFIG_DIR, "backups");

const DEFAULT_SETTINGS: Record<string, any> = {
  system_version: "1.0",
  default_provider: "openai" as Provider,
  default_model: "gpt-4o-mini",
  log_level: "info",
  max_parallel_requests: 3,
  cache_enabled: true,
  autosave_interval_min: 30,
  diagnostics_enabled: true,
  last_updated: new Date().toISOString(),
};

/* ========================================================================== */
/* 📦 Dateioperationen                                                       */
/* ========================================================================== */

/**
 * Lädt aktuelle KI-Systemeinstellungen.
 * Erstellt bei Bedarf Standarddatei.
 */
export function loadSettings(): Record<string, any> {
  try {
    if (!fs.existsSync(CONFIG_DIR))
      fs.mkdirSync(CONFIG_DIR, { recursive: true });

    if (!fs.existsSync(SETTINGS_FILE)) {
      log("warn", "Einstellungsdatei fehlt – Standardwerte werden erstellt.");
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }

    const data = fs.readFileSync(SETTINGS_FILE, "utf8");
    const parsed = JSON.parse(data);
    return migrateSettings(parsed);
  } catch (err: any) {
    log("error", "Fehler beim Laden der Einstellungen", { error: err.message });
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Speichert aktuelle Einstellungen dauerhaft auf der Festplatte.
 */
export function saveSettings(settings: Record<string, any>): boolean {
  try {
    if (!fs.existsSync(CONFIG_DIR))
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    if (!fs.existsSync(BACKUP_DIR))
      fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const backupName = `ai_settings_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    // Backup anlegen
    if (fs.existsSync(SETTINGS_FILE)) {
      fs.copyFileSync(SETTINGS_FILE, backupPath);
      log("info", "Backup der alten Einstellungen erstellt", { backupPath });
    }

    settings.last_updated = new Date().toISOString();

    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");
    log("info", "Einstellungen gespeichert", { keys: Object.keys(settings) });
    return true;
  } catch (err: any) {
    log("error", "Fehler beim Speichern der Einstellungen", {
      error: err.message,
    });
    return false;
  }
}

/* ========================================================================== */
/* 🔧 Einzelne Werte & Updates                                               */
/* ========================================================================== */

/**
 * Aktualisiert oder ergänzt einzelne Konfigurationswerte.
 */
export function updateSetting(key: string, value: any): Record<string, any> {
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
export function resetSettings(): Record<string, any> {
  saveSettings(DEFAULT_SETTINGS);
  log("warn", "Einstellungen auf Standardwerte zurückgesetzt.");
  return DEFAULT_SETTINGS;
}

/**
 * Liefert einen bestimmten Wert mit Fallback.
 */
export function getSetting<T = any>(key: string, fallback?: T): T {
  const settings = loadSettings();
  return (settings[key] ?? fallback) as T;
}

/* ========================================================================== */
/* 🧠 Validierung & Migration                                                */
/* ========================================================================== */

/**
 * Prüft und aktualisiert alte Konfigurationsstrukturen.
 */
export function migrateSettings(
  settings: Record<string, any>,
): Record<string, any> {
  let changed = false;

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    if (!(key in settings)) {
      settings[key] = value;
      changed = true;
    }
  }

  if (changed) {
    log("info", "Veraltete Einstellungen ergänzt – neue Version gespeichert.");
    saveSettings(settings);
  }

  return settings;
}

/**
 * Validiert kritische Konfigurationsparameter.
 */
export function validateSettings(settings: Record<string, any>): string[] {
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
  } catch (err: any) {
    log("error", "Fehler beim Export", { error: err.message });
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
    const imported = JSON.parse(data);
    saveSettings(imported);
    log("info", "Einstellungen importiert", { sourceFile });
    return true;
  } catch (err: any) {
    log("error", "Fehler beim Import", { error: err.message });
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
