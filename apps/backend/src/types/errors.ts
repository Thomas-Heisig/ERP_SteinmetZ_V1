// apps/backend/src/types/errors.ts
/**
 * Standardized Error Classes for consistent API error handling
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
  details?: any;
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
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    details?: any,
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
  constructor(message = "Bad Request", details?: any) {
    super(ErrorCode.BAD_REQUEST, message, 400, details);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends APIError {
  constructor(message = "Unauthorized", details?: any) {
    super(ErrorCode.UNAUTHORIZED, message, 401, details);
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends APIError {
  constructor(message = "Forbidden", details?: any) {
    super(ErrorCode.FORBIDDEN, message, 403, details);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends APIError {
  constructor(message = "Resource not found", details?: any) {
    super(ErrorCode.NOT_FOUND, message, 404, details);
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends APIError {
  constructor(message = "Conflict", details?: any) {
    super(ErrorCode.CONFLICT, message, 409, details);
  }
}

/**
 * 422 Validation Error
 */
export class ValidationError extends APIError {
  constructor(message = "Validation failed", details?: any) {
    super(ErrorCode.VALIDATION_ERROR, message, 422, details);
  }
}

/**
 * 429 Rate Limit Exceeded
 */
export class RateLimitError extends APIError {
  constructor(message = "Rate limit exceeded", details?: any) {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429, details);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends APIError {
  constructor(message = "Internal Server Error", details?: any) {
    super(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, details, false);
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends APIError {
  constructor(message = "Service Unavailable", details?: any) {
    super(ErrorCode.SERVICE_UNAVAILABLE, message, 503, details);
  }
}

/**
 * Database Error
 */
export class DatabaseError extends APIError {
  constructor(message = "Database Error", details?: any) {
    super(ErrorCode.DATABASE_ERROR, message, 500, details, false);
  }
}

/**
 * AI Provider Error
 */
export class AIProviderError extends APIError {
  constructor(message = "AI Provider Error", details?: any) {
    super(ErrorCode.AI_PROVIDER_ERROR, message, 502, details);
  }
}

/**
 * External API Error
 */
export class ExternalAPIError extends APIError {
  constructor(message = "External API Error", details?: any) {
    super(ErrorCode.EXTERNAL_API_ERROR, message, 502, details);
  }
}
