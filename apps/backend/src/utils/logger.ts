// SPDX-License-Identifier: MIT
// apps/backend/src/utils/logger.ts

import pino from "pino";

/**
 * Centralized logger configuration for the entire backend.
 * Uses Pino for structured logging with configurable log levels.
 *
 * Usage:
 * ```typescript
 * import { logger } from './utils/logger.js';
 * logger.info('Server started');
 * logger.error({ err }, 'Failed to connect');
 * ```
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    pid: process.pid,
    hostname: process.env.HOSTNAME || "unknown",
  },
  redact: {
    paths: [
      "password",
      "token",
      "apiKey",
      "secret",
      "authorization",
      "*.password",
      "*.token",
      "*.apiKey",
      "*.secret",
    ],
    remove: true,
  },
});

/**
 * Creates a child logger with a specific name/context.
 * Useful for adding context to all logs from a specific module.
 *
 * @param name - Name/context for the child logger (e.g., 'auth', 'db', 'api')
 * @returns Child logger instance
 */
export function createLogger(name: string) {
  return logger.child({ module: name });
}

/**
 * Log levels with semantic helpers
 */
export const logLevels = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
} as const;

/**
 * Structured logging helpers for common scenarios
 */
export const logHelpers = {
  /**
   * Log HTTP request
   */
  request: (
    method: string,
    path: string,
    statusCode: number,
    duration: number,
  ) => {
    logger.info(
      {
        type: "http_request",
        method,
        path,
        statusCode,
        duration,
        durationUnit: "ms",
      },
      `${method} ${path} ${statusCode} - ${duration}ms`,
    );
  },

  /**
   * Log database query
   */
  query: (
    operation: string,
    table: string,
    duration: number,
    rows?: number,
  ) => {
    logger.debug(
      {
        type: "db_query",
        operation,
        table,
        duration,
        durationUnit: "ms",
        rows,
      },
      `DB ${operation} on ${table} - ${duration}ms${rows !== undefined ? ` (${rows} rows)` : ""}`,
    );
  },

  /**
   * Log authentication event
   */
  auth: (event: string, userId?: string, success: boolean = true) => {
    const level = success ? "info" : "warn";
    logger[level](
      {
        type: "auth_event",
        event,
        userId,
        success,
      },
      `Auth: ${event}${userId ? ` for user ${userId}` : ""}`,
    );
  },

  /**
   * Log performance metric
   */
  performance: (metric: string, value: number, unit: string = "ms") => {
    logger.info(
      {
        type: "performance",
        metric,
        value,
        unit,
      },
      `Performance: ${metric} = ${value}${unit}`,
    );
  },

  /**
   * Log business event
   */
  business: (event: string, data?: Record<string, any>) => {
    logger.info(
      {
        type: "business_event",
        event,
        ...data,
      },
      `Business: ${event}`,
    );
  },

  /**
   * Log security event
   */
  security: (
    event: string,
    severity: "low" | "medium" | "high" | "critical",
    data?: Record<string, any>,
  ) => {
    const level =
      severity === "critical" || severity === "high" ? "error" : "warn";
    logger[level](
      {
        type: "security_event",
        event,
        severity,
        ...data,
      },
      `Security: ${event} (${severity})`,
    );
  },
};

export default logger;
