/**
 * helpers.ts
 * ---------------------------------------------------------
 * Universelle Hilfsfunktionen für das ERP-/KI-Backend.
 * - String- und Objekt-Helfer
 * - Zeitmessung & Performance
 * - Deep Clone, Merge, Compare
 * - JSON-Sicherheit
 * - ID- und Timestamp-Generatoren
 */

import { randomUUID } from "node:crypto";
import path from "node:path";
import { log } from "../utils/logger.js";

/* ========================================================================== */
/* 🕒 Zeit & Performance                                                     */
/* ========================================================================== */

/**
 * Misst die Laufzeit einer asynchronen Funktion.
 */
export async function measureExecutionTime<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = +(performance.now() - start).toFixed(2);
  log("info", `⏱️ Ausführungszeit (${label}): ${durationMs} ms`);
  return { result, durationMs };
}

/**
 * Formatiert Zeitangaben (Millisekunden → lesbar)
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)} s`;
  return `${(ms / 60000).toFixed(2)} min`;
}

/* ========================================================================== */
/* 🧠 JSON / Objekt-Operationen                                              */
/* ========================================================================== */

/**
 * Sicheres JSON-Parsing mit Fallback.
 */
export function safeJsonParse<T = any>(
  input: string,
  fallback: T = {} as T,
): T {
  try {
    return JSON.parse(input);
  } catch {
    return fallback;
  }
}

/**
 * Sicheres JSON-Stringify (mit optionaler Formatierung).
 */
export function safeJsonStringify(obj: any, pretty = false): string {
  try {
    return JSON.stringify(obj, null, pretty ? 2 : 0);
  } catch (err: any) {
    log("error", "Fehler beim JSON-Stringify", { error: err.message });
    return "{}";
  }
}

/**
 * Deep Clone (schnell & robust über strukturierte Klonierung)
 */
export function deepClone<T>(obj: T): T {
  try {
    return structuredClone(obj);
  } catch {
    return JSON.parse(JSON.stringify(obj));
  }
}

/**
 * Prüft, ob ein Wert ein einfaches Objekt ist.
 */
export function isPlainObject(val: any): val is Record<string, any> {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

/**
 * Deep Merge (rekursives Zusammenführen von Objekten)
 */
export function deepMergeLoose<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T {
  for (const key of Object.keys(source) as (keyof T)[]) {
    const s = source[key] as any;
    const t = target[key] as any;

    if (Array.isArray(s)) {
      (target as any)[key] = s.slice();
    } else if (s && typeof s === "object" && !Array.isArray(s)) {
      (target as any)[key] = deepMergeLoose(isPlainObject(t) ? t : {}, s);
    } else {
      (target as any)[key] = s;
    }
  }
  return target;
}

/**
 * Vergleicht zwei Objekte inhaltlich.
 */
export function deepEqual(a: any, b: any): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

/* ========================================================================== */
/* 🧩 Text- und Formatierungshilfen                                          */
/* ========================================================================== */

/**
 * Kürzt einen langen Text sicher.
 */
export function truncateText(text: string, maxLength = 200): string {
  if (!text) return "";
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
}

/**
 * Entfernt gefährliche Steuerzeichen oder Sonderzeichen.
 */
export function sanitizeString(input: string): string {
  return input.replace(/[\x00-\x1F\x7F]+/g, "").trim();
}

/**
 * Entfernt HTML-Tags (für KI-Ausgaben oder Logging).
 */
export function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

/**
 * Normalisiert Zeilenumbrüche (LF → \n).
 */
export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/* ========================================================================== */
/* ⚙️ Pfad- & Dateihilfen                                                   */
/* ========================================================================== */

/**
 * Normalisiert Pfade systemübergreifend.
 */
export function normalizePath(p: string): string {
  return path.normalize(p).replace(/\\/g, "/");
}

/**
 * Erzeugt einen relativen Pfad ab Projektstamm.
 */
export function relativeToRoot(p: string): string {
  return path.relative(process.cwd(), p);
}

/**
 * Liefert den Dateinamen ohne Endung.
 */
export function getBaseName(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

/**
 * Erzeugt einen eindeutigen Pfadnamen mit Zeitstempel.
 */
export function timestampedFileName(baseName: string, ext = ".txt"): string {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  return `${baseName}_${ts}${ext}`;
}

/* ========================================================================== */
/* 🆔 IDs, Zeitstempel, Zufall                                              */
/* ========================================================================== */

/**
 * Erstellt eine zufällige UUID (v4).
 */
export function createUUID(): string {
  return randomUUID();
}

/**
 * Erzeugt eine einfache Kurz-ID (z. B. für Sessions oder Logs).
 */
export function shortId(prefix = "id"): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${rand}`;
}

/**
 * Gibt ISO-Timestamp zurück (kompatibel für Logs und DB).
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/* ========================================================================== */
/* 🧾 Typprüfungen & Guards                                                 */
/* ========================================================================== */

/**
 * Prüft, ob ein Wert ein Objekt ist.
 */
export function isObject(val: any): val is Record<string, any> {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

/**
 * Prüft, ob ein Wert leer ist.
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
}

/**
 * Prüft, ob eine Variable eine gültige URL ist.
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/* ========================================================================== */
/* ✅ Export                                                                 */
/* ========================================================================== */

export default {
  measureExecutionTime,
  formatDuration,
  safeJsonParse,
  safeJsonStringify,
  deepClone,
  deepMergeLoose,
  deepEqual,
  truncateText,
  sanitizeString,
  stripHtmlTags,
  normalizeLineEndings,
  normalizePath,
  relativeToRoot,
  getBaseName,
  timestampedFileName,
  createUUID,
  shortId,
  nowISO,
  isObject,
  isPlainObject,
  isEmpty,
  isValidUrl,
};
