// SPDX-License-Identifier: MIT
// apps/backend/src/types/errors.ts

/**
 * Zentrale Error-Handling Typen und Klassen
 *
 * Strukturierte Fehlerbehandlung mit konsistenter API-Response.
 *
 * @module types/errors
 */

import { z } from "zod";

/* ============================================================================
 * ERROR CODES ENUM
 * ============================================================================ */

/**
 * Standardisierte HTTP-ähnliche Error-Codes
 */
export enum ErrorCode {
  // Client Errors (4xx)
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  // Database Errors
  DATABASE_ERROR = "DATABASE_ERROR",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  SCHEMA_ERROR = "SCHEMA_ERROR",
  TRANSACTION_ERROR = "TRANSACTION_ERROR",

  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  TIMEOUT = "TIMEOUT",

  // External API Errors
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  PAYMENT_ERROR = "PAYMENT_ERROR",
}

/* ============================================================================
 * ERROR SCHEMAS
 * ============================================================================ */

/**
 * Schema für Error-Details
 */
export const ErrorDetailsSchema = z.object({
  code: z.nativeEnum(ErrorCode),
  message: z.string(),
  statusCode: z.number().int().min(100).max(599),
  details: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
  path: z.string().optional(),
  requestId: z.string().optional(),
});

export type ErrorDetails = z.infer<typeof ErrorDetailsSchema>;

/**
 * Schema für Error-Response
 */
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.nativeEnum(ErrorCode),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
  timestamp: z.string().datetime(),
  requestId: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

/* ============================================================================
 * BASE API ERROR KLASSE
 * ============================================================================ */

/**
 * Basis-API-Error Klasse mit standardisierter Struktur
 *
 * @example
 * ```typescript
 * throw new APIError(
 *   ErrorCode.NOT_FOUND,
 *   'User not found',
 *   404,
 *   { userId: '123' }
 * );
 * ```
 */
export class APIError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    details?: Record<string, unknown>,
    isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Konvertierung zu JSON für API-Response
   */
  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}

/* ============================================================================
 * SPEZIFISCHE ERROR KLASSEN
 * ============================================================================ */

/**
 * 400 Bad Request Error
 *
 * @example
 * ```typescript
 * throw new BadRequestError('Invalid input data', { field: 'email' });
 * ```
 */
export class BadRequestError extends APIError {
  constructor(message = "Bad Request", details?: Record<string, unknown>) {
    super(ErrorCode.BAD_REQUEST, message, 400, details);
  }
}

/**
 * 401 Unauthorized Error
 *
 * @example
 * ```typescript
 * throw new UnauthorizedError('Invalid credentials');
 * ```
 */
export class UnauthorizedError extends APIError {
  constructor(message = "Unauthorized", details?: Record<string, unknown>) {
    super(ErrorCode.UNAUTHORIZED, message, 401, details);
  }
}

/**
 * 403 Forbidden Error
 *
 * @example
 * ```typescript
 * throw new ForbiddenError('Insufficient permissions', { requiredRole: 'admin' });
 * ```
 */
export class ForbiddenError extends APIError {
  constructor(message = "Forbidden", details?: Record<string, unknown>) {
    super(ErrorCode.FORBIDDEN, message, 403, details);
  }
}

/**
 * 404 Not Found Error
 *
 * @example
 * ```typescript
 * throw new NotFoundError('User not found', { userId: '123' });
 * ```
 */
export class NotFoundError extends APIError {
  constructor(message = "Not Found", details?: Record<string, unknown>) {
    super(ErrorCode.NOT_FOUND, message, 404, details);
  }
}

/**
 * 409 Conflict Error
 *
 * @example
 * ```typescript
 * throw new ConflictError('Email already exists', { email: 'test@example.com' });
 * ```
 */
export class ConflictError extends APIError {
  constructor(message = "Conflict", details?: Record<string, unknown>) {
    super(ErrorCode.CONFLICT, message, 409, details);
  }
}

/**
 * Validation Error (400)
 *
 * Für Zod oder andere Validierungsfehler
 *
 * @example
 * ```typescript
 * throw new ValidationError('Invalid form data', validationErrors);
 * ```
 */
export class ValidationError extends APIError {
  constructor(message = "Validation Error", details?: Record<string, unknown>) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details);
  }
}

/**
 * Rate Limit Error (429)
 *
 * @example
 * ```typescript
 * throw new RateLimitError('Too many requests', { retryAfter: 60 });
 * ```
 */
export class RateLimitError extends APIError {
  constructor(message = "Rate Limit Exceeded", details?: Record<string, unknown>) {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429, details);
  }
}

/* ============================================================================
 * DATABASE SPEZIFISCHE ERRORS
 * ============================================================================ */

/**
 * Datenbankabfrage Ausführungsfehler
 *
 * Erfasst SQL-Kontext für Debugging
 *
 * @example
 * ```typescript
 * throw new DatabaseError(
 *   'Failed to insert user',
 *   'INSERT INTO users VALUES (?, ?)',
 *   ['john', 'email'],
 *   originalError
 * );
 * ```
 */
export class DatabaseError extends APIError {
  constructor(
    message: string,
    public readonly query?: string,
    public readonly params?: unknown[],
    public readonly originalError?: Error,
  ) {
    super(
      ErrorCode.DATABASE_ERROR,
      message,
      500,
      {
        query: query?.substring(0, 100), // Limit query length
        paramCount: params?.length,
        originalMessage: originalError?.message,
      },
      true,
    );
  }
}

/**
 * Datenbankverbindungsfehler
 *
 * @example
 * ```typescript
 * throw new DatabaseConnectionError(
 *   'Failed to connect to database',
 *   'sqlite',
 *   './data/dev.sqlite3'
 * );
 * ```
 */
export class DatabaseConnectionError extends APIError {
  constructor(
    message: string,
    public readonly driver: "sqlite" | "postgres",
    public readonly connectionString?: string,
  ) {
    super(
      ErrorCode.CONNECTION_ERROR,
      message,
      503,
      {
        driver,
        connectionString: connectionString?.substring(0, 50), // Sanitize
      },
      true,
    );
  }
}

/**
 * Datenbankschema Operationsfehler
 *
 * @example
 * ```typescript
 * throw new DatabaseSchemaError(
 *   'Failed to create table',
 *   'users',
 *   'CREATE'
 * );
 * ```
 */
export class DatabaseSchemaError extends APIError {
  constructor(
    message: string,
    public readonly table?: string,
    public readonly operation?: string,
  ) {
    super(
      ErrorCode.SCHEMA_ERROR,
      message,
      500,
      { table, operation },
      true,
    );
  }
}

/**
 * Transaktionsfehler
 *
 * @example
 * ```typescript
 * throw new TransactionError('Transaction failed', { operations: 5 });
 * ```
 */
export class TransactionError extends APIError {
  constructor(message = "Transaction Error", details?: Record<string, unknown>) {
    super(ErrorCode.TRANSACTION_ERROR, message, 500, details);
  }
}

/* ============================================================================
 * INTERNAL ERRORS
 * ============================================================================ */

/**
 * 500 Internal Server Error
 *
 * Nur für unerwartete Fehler verwenden
 */
export class InternalServerError extends APIError {
  constructor(message = "Internal Server Error", details?: Record<string, unknown>) {
    super(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, details, false);
  }
}

/**
 * 503 Service Unavailable
 *
 * @example
 * ```typescript
 * throw new ServiceUnavailableError('Database is temporarily unavailable');
 * ```
 */
export class ServiceUnavailableError extends APIError {
  constructor(message = "Service Unavailable", details?: Record<string, unknown>) {
    super(ErrorCode.SERVICE_UNAVAILABLE, message, 503, details);
  }
}

/**
 * Timeout Error
 *
 * @example
 * ```typescript
 * throw new TimeoutError('Database query timed out', { timeout: 5000 });
 * ```
 */
export class TimeoutError extends APIError {
  constructor(message = "Request Timeout", details?: Record<string, unknown>) {
    super(ErrorCode.TIMEOUT, message, 504, details);
  }
}

/* ============================================================================
 * EXTERNAL API ERRORS
 * ============================================================================ */

/**
 * Externer API-Fehler
 */
export class ExternalApiError extends APIError {
  constructor(
    message: string,
    public readonly service: string,
    public readonly externalStatusCode?: number,
  ) {
    super(
      ErrorCode.EXTERNAL_API_ERROR,
      message,
      502,
      { service, externalStatusCode },
      true,
    );
  }
}

/**
 * Zahlungsabwicklungsfehler
 */
export class PaymentError extends APIError {
  constructor(
    message: string,
    public readonly paymentProvider: string,
    details?: Record<string, unknown>,
  ) {
    super(
      ErrorCode.PAYMENT_ERROR,
      message,
      400,
      { ...details, provider: paymentProvider },
    );
  }
}

/* ============================================================================
 * ERROR UTILITIES
 * ============================================================================ */

/**
 * Prüft ob ein Fehler ein APIError ist
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Prüft ob ein Fehler operationell ist (erwartet und behandelbar)
 */
export function isOperationalError(error: unknown): boolean {
  if (isAPIError(error)) {
    return error.isOperational;
  }
  return false;
}

/**
 * Konvertiert einen unbekannten Error zu APIError
 */
export function toAPIError(error: unknown): APIError {
  if (isAPIError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalServerError(error.message, {
      originalError: error.name,
      stack: error.stack?.split("\n").slice(0, 3),
    });
  }

  return new InternalServerError("Unknown error occurred", { error });
}

/**
 * Erstellt Error-Response für API
 */
export function createErrorResponse(error: APIError, requestId?: string): ErrorResponse {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
    timestamp: new Date().toISOString(),
    requestId,
  };
}
