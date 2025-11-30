/**
 * validation.ts
 * ---------------------------------------------------------
 * Validierungs- und Prüfungshilfen für das ERP-/KI-Backend.
 * - Typvalidierungen (string, number, object, array)
 * - Schema-Validierung (leichtgewichtig, ohne externe libs)
 * - Sicherheitsprüfungen für Eingaben und KI-Parameter
 * - Utility-Funktionen für Request-/Konfigurationsvalidierung
 */

import { log } from "../utils/logger.js";

/* ========================================================================== */
/* 🧩 Grundlegende Typprüfungen                                              */
/* ========================================================================== */

export function isString(val: any): val is string {
  return typeof val === "string";
}

export function isNumber(val: any): val is number {
  return typeof val === "number" && !isNaN(val);
}

export function isBoolean(val: any): val is boolean {
  return typeof val === "boolean";
}

export function isArray(val: any): val is any[] {
  return Array.isArray(val);
}

export function isObject(val: any): val is Record<string, any> {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

/* ========================================================================== */
/* ✅ Erweiterte Schema-Validierung mit optionalen Feldern                   */
/* ========================================================================== */

/**
 * Führt eine Schema-Validierung eines Objekts durch.
 * Unterstützt optionale Felder ("string?") und Typprüfung.
 */
export function validateSchema<T extends Record<string, any>>(
  obj: any,
  schema: Record<
    keyof T,
    "string" | "number" | "boolean" | "array" | "object" | `${"string" | "number" | "boolean" | "array" | "object"}?`
  >,
  options: { allowExtra?: boolean } = {}
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isObject(obj)) {
    return { valid: false, errors: ["Kein gültiges Objekt."] };
  }

  for (const key in schema) {
    let expectedType = schema[key];
    const value = obj[key];

    // Optional-Handling: Wenn Typ mit "?" endet → optionales Feld
    const isOptional = typeof expectedType === "string" && expectedType.endsWith("?");
    if (isOptional) {
      expectedType = expectedType.slice(0, -1) as typeof expectedType;
    }

    // Wenn optionales Feld fehlt → kein Fehler
    if (value === undefined && isOptional) {
      continue;
    }

    // Wenn Feld fehlt und nicht optional → Fehler
    if (value === undefined) {
      errors.push(`Feld '${key}' fehlt.`);
      continue;
    }

    // Typprüfung
    switch (expectedType) {
      case "string":
        if (!isString(value)) errors.push(`Feld '${key}' muss vom Typ string sein.`);
        break;
      case "number":
        if (!isNumber(value)) errors.push(`Feld '${key}' muss vom Typ number sein.`);
        break;
      case "boolean":
        if (!isBoolean(value)) errors.push(`Feld '${key}' muss vom Typ boolean sein.`);
        break;
      case "array":
        if (!isArray(value)) errors.push(`Feld '${key}' muss ein Array sein.`);
        break;
      case "object":
        if (!isObject(value)) errors.push(`Feld '${key}' muss ein Objekt sein.`);
        break;
      default:
        errors.push(`Unbekannter Typ für Feld '${key}'.`);
    }
  }

  // Zusätzliche Felder prüfen, wenn nicht erlaubt
  if (!options.allowExtra) {
    for (const key of Object.keys(obj)) {
      if (!(key in schema)) {
        errors.push(`Unerwartetes Feld: '${key}'.`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/* ========================================================================== */
/* 🧠 KI-spezifische Validierungen                                           */
/* ========================================================================== */

export function validateModelName(model: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(model);
}

export function validateAIConfig(config: Record<string, any>): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!config.provider || !isString(config.provider)) {
    issues.push("Feld 'provider' fehlt oder ist ungültig.");
  }

  if (!config.model || !validateModelName(config.model)) {
    issues.push("Feld 'model' fehlt oder ist ungültig (nur a–z, 0–9, -, _, .).");
  }

  if ("temperature" in config && !isNumber(config.temperature)) {
    issues.push("Feld 'temperature' muss numerisch sein.");
  }

  if ("max_tokens" in config && (!isNumber(config.max_tokens) || config.max_tokens <= 0)) {
    issues.push("Feld 'max_tokens' muss eine positive Zahl sein.");
  }

  return { valid: issues.length === 0, issues };
}

export function validateChatMessages(messages: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(messages)) {
    return { valid: false, errors: ["Nachrichten müssen ein Array sein."] };
  }

  messages.forEach((msg, i) => {
    if (!msg || typeof msg !== "object") {
      errors.push(`Nachricht #${i} ist kein gültiges Objekt.`);
      return;
    }
    if (!["system", "user", "assistant"].includes(msg.role)) {
      errors.push(`Nachricht #${i} hat ungültige Rolle: ${msg.role}`);
    }
    if (typeof msg.content !== "string") {
      errors.push(`Nachricht #${i} hat ungültigen Inhaltstyp.`);
    }
  });

  return { valid: errors.length === 0, errors };
}

/* ========================================================================== */
/* 🔒 Sicherheits- & Eingabevalidierungen                                    */
/* ========================================================================== */

export function sanitizeInput(input: string): string {
  return input.replace(/[<>;$`]/g, "").trim();
}

export function containsInjectionRisk(input: string): boolean {
  return /[;$`<>]/.test(input);
}

/* ========================================================================== */
/* 🧾 Utility-Validierungen                                                  */
/* ========================================================================== */

export function validateFileExtension(filename: string, allowed: string[]): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  return !!ext && allowed.map(a => a.toLowerCase()).includes(ext);
}

export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function hasKey<T extends object>(
  obj: T,
  key: PropertyKey
): key is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/* ========================================================================== */
/* 🧩 Logging-Wrapper für Fehlvalidierungen                                  */
/* ========================================================================== */

export function logValidationErrors(context: string, errors: string[]) {
  if (errors.length === 0) return;
  log("warn", `Validierungsfehler in ${context}`, { count: errors.length, details: errors });
}

/* ========================================================================== */
/* ✅ Export                                                                 */
/* ========================================================================== */

export default {
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  validateSchema,
  validateModelName,
  validateAIConfig,
  validateChatMessages,
  sanitizeInput,
  containsInjectionRisk,
  validateFileExtension,
  isInRange,
  hasKey,
  logValidationErrors,
};
