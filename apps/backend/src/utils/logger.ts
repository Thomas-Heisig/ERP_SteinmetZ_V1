// SPDX-License-Identifier: MIT
// apps/backend/src/utils/logger.ts

/**
 * Zentrales Logging-System mit Pino
 * Bietet strukturiertes Logging mit Kontext und Specialized Loggers
 */

import pino, { type LoggerOptions } from "pino";

export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

export interface Logger {
  request(req: Record<string, unknown>, res: Record<string, unknown>, duration: number): void;
  response(statusCode: number, duration: number): void;
  database(operation: string, duration: number, rowCount?: number): void;
  externalAPI(service: string, endpoint: string, duration: number, statusCode?: number): void;
  performanceWarning(metric: string, value: number, threshold: number): void;
  security(event: string, details: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
  // Überladungen für info - sowohl 1 als auch 2 Parameter
  info(message: string): void;
  info(obj: Record<string, unknown>, msg: string): void;
  // Überladungen für error
  error(message: string): void;
  error(obj: Record<string, unknown>, msg: string): void;
  // Überladungen für debug
  debug(message: string): void;
  debug(obj: Record<string, unknown>, msg: string): void;
  // Überladungen für warn
  warn(message: string): void;
  warn(obj: Record<string, unknown>, msg: string): void;
}

const DEFAULT_CONFIG = {
  level: (process.env.LOG_LEVEL as LogLevel) || "info",
  environment: process.env.NODE_ENV || "development",
  pretty: process.env.NODE_ENV !== "production",
};

/**
 * Erstellt einen Logger mit Kontext
 */
export function createLogger(moduleName: string, config: Record<string, unknown> = {}): Logger {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const baseOptions: LoggerOptions = {
    level: finalConfig.level as string,
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
      module: moduleName,
      environment: finalConfig.environment,
    },
    formatters: {
      level: (label: string) => ({ level: label }),
      bindings: (bindings: Record<string, unknown>) => ({ ...bindings, module: moduleName }),
    },
  };

  const pinoLogger = pino(baseOptions);
  
  // Typen für die flexiblen Log-Funktionen
  type LogFunction = {
    (message: string): void;
    (obj: Record<string, unknown>, msg: string): void;
  };

  const logger: Logger = Object.create(pinoLogger) as Logger;

  // Wrapper für info - unterstützt beide Signaturen
  const originalInfo = pinoLogger.info.bind(pinoLogger);
  (logger.info as LogFunction) = ((arg1: string | Record<string, unknown>, arg2?: string) => {
    if (typeof arg1 === "string") {
      originalInfo(arg1);
    } else if (typeof arg1 === "object" && typeof arg2 === "string") {
      originalInfo(arg1, arg2);
    }
  });

  // Wrapper für error - unterstützt beide Signaturen
  const originalError = pinoLogger.error.bind(pinoLogger);
  (logger.error as LogFunction) = ((arg1: string | Record<string, unknown>, arg2?: string) => {
    if (typeof arg1 === "string") {
      originalError(arg1);
    } else if (typeof arg1 === "object" && typeof arg2 === "string") {
      originalError(arg1, arg2);
    }
  });

  // Wrapper für debug - unterstützt beide Signaturen
  const originalDebug = pinoLogger.debug.bind(pinoLogger);
  (logger.debug as LogFunction) = ((arg1: string | Record<string, unknown>, arg2?: string) => {
    if (typeof arg1 === "string") {
      originalDebug(arg1);
    } else if (typeof arg1 === "object" && typeof arg2 === "string") {
      originalDebug(arg1, arg2);
    }
  });

  // Wrapper für warn - unterstützt beide Signaturen
  const originalWarn = pinoLogger.warn.bind(pinoLogger);
  (logger.warn as LogFunction) = ((arg1: string | Record<string, unknown>, arg2?: string) => {
    if (typeof arg1 === "string") {
      originalWarn(arg1);
    } else if (typeof arg1 === "object" && typeof arg2 === "string") {
      originalWarn(arg1, arg2);
    }
  });

  logger.request = function (req: Record<string, unknown>, res: Record<string, unknown>, duration: number) {
    originalInfo({ method: req.method, path: req.path, statusCode: res.statusCode, duration }, "API Request");
  };

  logger.response = function (statusCode: number, duration: number) {
    originalDebug({ statusCode, duration }, "API Response");
  };

  logger.database = function (operation: string, duration: number, rowCount?: number) {
    const level = duration > 100 ? "warn" : "debug";
    const logFunc = level === "warn" ? originalWarn : originalDebug;
    logFunc({ operation, duration, rowCount }, duration > 100 ? "Slow query" : "DB operation");
  };

  logger.externalAPI = function (service: string, endpoint: string, duration: number, statusCode?: number) {
    const level = statusCode && statusCode >= 400 ? "warn" : "debug";
    const logFunc = level === "warn" ? originalWarn : originalDebug;
    logFunc({ service, endpoint, statusCode, duration }, statusCode && statusCode >= 400 ? "External API error" : "External API");
  };

  logger.performanceWarning = function (metric: string, value: number, threshold: number) {
    originalWarn({ metric, value, threshold, percentage: ((value / threshold) * 100).toFixed(1) }, "Performance threshold exceeded");
  };

  logger.security = function (event: string, details: Record<string, unknown>) {
    originalWarn({ event, ...details }, "Security event");
  };

  return logger;
}

// ============================================================================
// VORKONFIGURIERTE LOGGER
// ============================================================================

/** Logger für Datenbank-Operationen */
export const dbLogger = createLogger("database");

/** Logger für API-Routes */
export const apiLogger = createLogger("api");

/** Logger für Authentifizierung */
export const authLogger = createLogger("auth");

/** Logger für Dokumentenverwaltung */
export const documentsLogger = createLogger("documents");

/** Logger für Workflows */
export const workflowLogger = createLogger("workflows");

/** Logger für Fehler */
export const errorLogger = createLogger("error");

/** Logger für Security-Events */
export const securityLogger = createLogger("security");

// ============================================================================
// MIDDLEWARE FÜR EXPRESS
// ============================================================================

/**
 * Express-Middleware für Request-Logging
 */
export function loggerMiddleware(req: Record<string, unknown>, res: Record<string, unknown>, next: () => void) {
  const startTime = Date.now();
  const requestId = (req.headers as Record<string, string>)["x-request-id"] || `req-${Date.now()}`;
  const requestLogger = createLogger("http").child({ requestId, method: req.method, path: req.path });
  (req as Record<string, unknown>).logger = requestLogger;
  const originalJson = (res as Record<string, unknown>).json as (data: unknown) => void;
  (res as Record<string, unknown>).json = function (data: unknown) {
    const duration = Date.now() - startTime;
    requestLogger.info({ statusCode: res.statusCode, duration, responseSize: JSON.stringify(data).length }, "Request completed");
    return originalJson.call(this, data);
  };
  next();
}

/**
 * Logger mit Request-Kontext für async Operationen
 */
export function createContextLogger(context: Record<string, unknown>): Logger {
  const logger = createLogger("context");
  return logger.child(context) as Logger;
}

// Standardlogger für Rückwärtskompatibilität
export const logger = createLogger("app");

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
  business: (event: string, data?: Record<string, unknown>) => {
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
    data?: Record<string, unknown>,
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
