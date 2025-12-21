/**
 * errors.ts
 * ---------------------------------------------------------
 * Einheitliches Fehler-Handling für das ERP / KI-Backend.
 *
 * Enthält:
 *  - Standardisierte Fehlerklassen mit Statuscodes
 *  - KI-spezifische Fehler (Provider, Parsing, Timeout)
 *  - Utility-Funktionen für Fehleranalyse und Logging
 */

import type { Response } from "express";
import { log } from "../utils/logger.js";

/* ========================================================================== */
/* 🧩 Grundklasse: BaseError                                                 */
/* ========================================================================== */

export class BaseError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;
  timestamp: string;

  constructor(
    message: string,
    code = "ERR_GENERIC",
    status = 500,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      timestamp: this.timestamp,
      details: this.details ?? {},
    };
  }
}

/* ========================================================================== */
/* 🧠 KI-bezogene Fehlerklassen                                              */
/* ========================================================================== */

export class AIProviderError extends BaseError {
  constructor(
    provider: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(
      `KI-Provider-Fehler (${provider}): ${message}`,
      "ERR_AI_PROVIDER",
      502,
      details,
    );
  }
}

export class AIResponseError extends BaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`Ungültige KI-Antwort: ${message}`, "ERR_AI_RESPONSE", 500, details);
  }
}

export class AITimeoutError extends BaseError {
  constructor(durationMs: number, provider?: string) {
    super(
      `Zeitüberschreitung nach ${durationMs} ms${provider ? ` (Provider: ${provider})` : ""}`,
      "ERR_AI_TIMEOUT",
      504,
      { durationMs, provider },
    );
  }
}

export class AITokenLimitError extends BaseError {
  constructor(limit: number, used: number) {
    super(
      `Tokenlimit überschritten (${used}/${limit})`,
      "ERR_AI_TOKEN_LIMIT",
      413,
      { limit, used },
    );
  }
}

/* ========================================================================== */
/* ⚙️ System- und Infrastrukturfehler                                       */
/* ========================================================================== */

export class FileSystemError extends BaseError {
  constructor(
    filePath: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(`Dateifehler: ${message}`, "ERR_FILE_SYSTEM", 500, {
      filePath,
      ...details,
    });
  }
}

export class ConfigError extends BaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`Konfigurationsfehler: ${message}`, "ERR_CONFIG", 500, details);
  }
}

export class ToolExecutionError extends BaseError {
  constructor(
    toolName: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(
      `Tool-Fehler (${toolName}): ${message}`,
      "ERR_TOOL_EXECUTION",
      500,
      details,
    );
  }
}

/* ========================================================================== */
/* 🌐 API-Fehler                                                            */
/* ========================================================================== */

export class APIError extends BaseError {
  constructor(
    status: number,
    message: string,
    endpoint?: string,
    details?: Record<string, unknown>,
  ) {
    super(`API-Fehler: ${message}`, "ERR_API", status, {
      endpoint,
      ...details,
    });
  }
}

export class ValidationError extends BaseError {
  constructor(
    message: string,
    field?: string,
    details?: Record<string, unknown>,
  ) {
    super(
      `Validierungsfehler${field ? ` in Feld "${field}"` : ""}: ${message}`,
      "ERR_VALIDATION",
      400,
      details,
    );
  }
}

/* ========================================================================== */
/* 🧾 Utility-Funktionen                                                     */
/* ========================================================================== */

/**
 * Erkennt, ob ein Fehler bereits ein BaseError ist.
 */
export function isBaseError(err: unknown): err is BaseError {
  return err instanceof BaseError;
}

/**
 * Wandelt beliebige Fehler in BaseError um (mit Logging).
 */
export function toBaseError(err: unknown, context: string): BaseError {
  if (err instanceof BaseError) return err;

  const message = err instanceof Error ? err.message : String(err);
  const wrapped = new BaseError(message, "ERR_UNKNOWN", 500, { context });

  log("error", `❌ Fehler (${context})`, {
    message,
    stack: err instanceof Error ? err.stack : undefined,
  });
  return wrapped;
}

/**
 * Wandelt Fehler in ein API-kompatibles JSON-Format um.
 */
export function formatErrorResponse(err: unknown): Record<string, unknown> {
  const base = isBaseError(err) ? err : toBaseError(err, "unknown");
  return {
    error: {
      code: base.code,
      message: base.message,
      status: base.status,
      timestamp: base.timestamp,
      details: base.details ?? {},
    },
  };
}

/**
 * Sichert Fehlerlogging mit Metadaten ab.
 */
export function logError(err: unknown, context = "global"): void {
  const base = isBaseError(err) ? err : toBaseError(err, context);
  log("error", `❗[${context}] ${base.message}`, {
    code: base.code,
    status: base.status,
    details: base.details,
  });
}

/* ========================================================================== */
/* 🚦 HTTP-kompatible Fehlerantwort                                         */
/* ========================================================================== */

/**
 * Gibt eine einheitliche API-Fehlerantwort über Express zurück.
 */
export function errorResponse(
  res: Response,
  code: number,
  message: string,
  err?: unknown,
): Response {
  const baseError = toBaseError(err ?? new Error(message), "api");
  log("error", `[HTTP ${code}] ${message}`, {
    error: baseError.message,
    code: baseError.code,
    stack: (err as Error)?.stack,
  });

  return res.status(code).json({
    success: false,
    error: {
      code: baseError.code,
      message: message || baseError.message,
      status: code,
      timestamp: new Date().toISOString(),
      details: baseError.details ?? {},
    },
  });
}

/* ========================================================================== */
/* ✅ Export                                                                */
/* ========================================================================== */

export default {
  BaseError,
  AIProviderError,
  AIResponseError,
  AITimeoutError,
  AITokenLimitError,
  FileSystemError,
  ConfigError,
  ToolExecutionError,
  APIError,
  ValidationError,
  errorResponse, // ✅ jetzt vorhanden
  isBaseError,
  toBaseError,
  formatErrorResponse,
  logError,
};
