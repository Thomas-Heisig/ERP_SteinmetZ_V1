// SPDX-License-Identifier: MIT
// apps/backend/src/routes/error/errors.ts

/**
 * Standardized Error Classes for consistent API error handling
 *
 * Provides a hierarchy of error types with proper HTTP status codes,
 * error codes for client handling, and optional details for debugging.
 *
 * @module error/errors
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

  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  DATABASE_ERROR = "DATABASE_ERROR",
  AI_PROVIDER_ERROR = "AI_PROVIDER_ERROR",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  timestamp?: string;
  path?: string;
  requestId?: string;
}

/**
 * Base API Error class with standardized structure
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

/**
 * 400 Bad Request
 */
export class BadRequestError extends APIError {
  constructor(message = "Bad Request", details?: Record<string, unknown>) {
    super(ErrorCode.BAD_REQUEST, message, 400, details);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends APIError {
  constructor(message = "Unauthorized", details?: Record<string, unknown>) {
    super(ErrorCode.UNAUTHORIZED, message, 401, details);
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends APIError {
  constructor(message = "Forbidden", details?: Record<string, unknown>) {
    super(ErrorCode.FORBIDDEN, message, 403, details);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends APIError {
  constructor(
    message = "Resource not found",
    details?: Record<string, unknown>,
  ) {
    super(ErrorCode.NOT_FOUND, message, 404, details);
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends APIError {
  constructor(message = "Conflict", details?: Record<string, unknown>) {
    super(ErrorCode.CONFLICT, message, 409, details);
  }
}

/**
 * 422 Validation Error
 */
export class ValidationError extends APIError {
  constructor(
    message = "Validation failed",
    details?: Record<string, unknown>,
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, 422, details);
  }
}

/**
 * 429 Rate Limit Exceeded
 */
export class RateLimitError extends APIError {
  constructor(
    message = "Rate limit exceeded",
    details?: Record<string, unknown>,
  ) {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429, details);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends APIError {
  constructor(
    message = "Internal Server Error",
    details?: Record<string, unknown>,
  ) {
    super(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, details, false);
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends APIError {
  constructor(
    message = "Service Unavailable",
    details?: Record<string, unknown>,
  ) {
    super(ErrorCode.SERVICE_UNAVAILABLE, message, 503, details);
  }
}

/**
 * Database Error
 */
export class DatabaseError extends APIError {
  constructor(message = "Database Error", details?: Record<string, unknown>) {
    super(ErrorCode.DATABASE_ERROR, message, 500, details, false);
  }
}

/**
 * AI Provider Error
 */
export class AIProviderError extends APIError {
  constructor(
    message = "AI Provider Error",
    details?: Record<string, unknown>,
  ) {
    super(ErrorCode.AI_PROVIDER_ERROR, message, 502, details);
  }
}

/**
 * External API Error
 */
export class ExternalAPIError extends APIError {
  constructor(
    message = "External API Error",
    details?: Record<string, unknown>,
  ) {
    super(ErrorCode.EXTERNAL_API_ERROR, message, 502, details);
  }
}
