// SPDX-License-Identifier: MIT
// apps/frontend/src/utils/logger.ts

/**
 * Frontend Logger
 * Provides structured logging for frontend code with conditional output
 * based on environment (development vs production)
 */

type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

interface LogContext {
  module?: string;
  [key: string]: unknown;
}

const isDevelopment = import.meta.env.DEV;

/**
 * Creates a module-specific logger
 */
export function createLogger(moduleName: string) {
  const log = (level: LogLevel, message: string, context?: LogContext) => {
    // In production, only log warnings and errors
    if (!isDevelopment && level !== "warn" && level !== "error") {
      return;
    }

    // Use appropriate console method
    switch (level) {
      case "trace":
      case "debug":
        if (isDevelopment) {
          // Development-only debug logging
          // eslint-disable-next-line no-console
          console.debug(
            `[${level.toUpperCase()}] [${moduleName}] ${message}`,
            context || "",
          );
        }
        break;
      case "info":
        // eslint-disable-next-line no-console
        console.info(`[INFO] [${moduleName}] ${message}`, context || "");
        break;
      case "warn":
        console.warn(`[WARN] [${moduleName}] ${message}`, context || "");
        break;
      case "error":
        console.error(`[ERROR] [${moduleName}] ${message}`, context || "");
        break;
    }
  };

  return {
    trace: (message: string, context?: LogContext) =>
      log("trace", message, context),
    debug: (message: string, context?: LogContext) =>
      log("debug", message, context),
    info: (message: string, context?: LogContext) =>
      log("info", message, context),
    warn: (message: string, context?: LogContext) =>
      log("warn", message, context),
    error: (message: string, context?: LogContext) =>
      log("error", message, context),
  };
}

/**
 * Default logger instance
 */
export const logger = createLogger("app");
