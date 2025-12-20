/**
 * logger.ts
 * ---------------------------------------------------------
 * Zentraler Logger für das ERP-/KI-System.
 * Unterstützt standardisierte JSON-Ausgabe, optionale Farbcodierung,
 * Fehlerweitergabe und optionale Dateiprotokollierung.
 */

import fs from "node:fs";
import path from "node:path";

/* ========================================================================== */
/* ⚙️ Konfiguration                                                          */
/* ========================================================================== */

const LOG_TO_FILE = process.env.LOG_TO_FILE === "true";
const LOG_DIR = path.resolve("logs");
const LOG_FILE = path.join(
  LOG_DIR,
  `app_${new Date().toISOString().split("T")[0]}.log`,
);

if (LOG_TO_FILE && !fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/* ========================================================================== */
/* 🎨 Farben für CLI                                                         */
/* ========================================================================== */

const COLORS = {
  info: "\x1b[36m%s\x1b[0m", // Cyan
  warn: "\x1b[33m%s\x1b[0m", // Gelb
  error: "\x1b[31m%s\x1b[0m", // Rot
  debug: "\x1b[35m%s\x1b[0m", // Magenta
};

/* ========================================================================== */
/* 🧠 Zentrale Log-Funktion                                                  */
/* ========================================================================== */

export type LogLevel = "info" | "warn" | "error" | "debug";

/**
 * Standardisierte Logfunktion mit JSON-Ausgabe.
 */
export function log(level: LogLevel, msg: string, data?: unknown): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg,
    data,
  };

  const jsonLine = JSON.stringify(entry);

  // CLI-Ausgabe (mit Farbe)
  if (process.stdout.isTTY) {
    const color = COLORS[level] || "%s";
    console.log(
      color,
      `[${entry.level.toUpperCase()}] ${entry.ts} - ${entry.msg}`,
    );
    if (data) console.dir(data, { depth: 4, colors: true });
  } else {
    console.log(jsonLine);
  }

  // Optional: Log-Datei
  if (LOG_TO_FILE) {
    try {
      fs.appendFileSync(LOG_FILE, jsonLine + "\n", "utf8");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Fehler beim Schreiben der Log-Datei:", message);
    }
  }

  // Optional: Weiterleitung an externe Systeme (z. B. Monitoring)
  if (level === "error" && process.env.SEND_ERROR_LOGS === "true") {
    // TODO: Implementiere optionalen Remote-Logversand
  }
}

/* ========================================================================== */
/* 🧩 Hilfsfunktionen                                                        */
/* ========================================================================== */

/**
 * Erstellt eine standardisierte Fehlerstruktur für Express-Antworten.
 */
export function errorResponse(res: unknown, code: number, msg: string, err?: unknown) {
  const detail = err instanceof Error ? err.message : err;
  log("error", msg, { code, detail });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (res as any).status(code).json({
    success: false,
    error: msg,
    detail,
    ts: new Date().toISOString(),
  });
}

/**
 * Einfache Debug-Ausgabe (nur wenn NODE_ENV=development).
 */
export function debugLog(msg: string, data?: unknown) {
  if (process.env.NODE_ENV === "development") {
    log("debug", msg, data);
  }
}

/**
 * Gibt nur Zeitstempel zurück (kompatibel mit Helpers).
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/* ========================================================================== */
/* ✅ Export                                                                 */
/* ========================================================================== */

export default {
  log,
  debugLog,
  errorResponse,
  nowISO,
};
