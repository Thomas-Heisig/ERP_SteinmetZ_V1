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

export default logger;
