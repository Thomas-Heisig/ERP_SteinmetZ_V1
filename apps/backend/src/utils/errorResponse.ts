// SPDX-License-Identifier: MIT
// apps/backend/src/utils/errorResponse.ts

import { Response } from "express";

/**
 * Standardized error response structure
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path?: string;
  };
}

/**
 * Common error codes
 */
export const ErrorCode = {
  // Client errors (4xx)
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // Server errors (5xx)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  DATABASE_ERROR: "DATABASE_ERROR",

  // AI-specific errors
  AI_PROVIDER_ERROR: "AI_PROVIDER_ERROR",
  AI_MODEL_NOT_FOUND: "AI_MODEL_NOT_FOUND",
  AI_QUOTA_EXCEEDED: "AI_QUOTA_EXCEEDED",
} as const;

/**
 * Send a standardized error response
 */
export function sendErrorResponse(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: any,
  path?: string,
): void {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: path || res.req?.path || res.req?.url,
    },
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * Send a bad request error (400)
 */
export function sendBadRequest(
  res: Response,
  message: string = "Bad request",
  details?: any,
): void {
  sendErrorResponse(res, 400, ErrorCode.BAD_REQUEST, message, details);
}

/**
 * Send an unauthorized error (401)
 */
export function sendUnauthorized(
  res: Response,
  message: string = "Authentication required",
  details?: any,
): void {
  sendErrorResponse(res, 401, ErrorCode.UNAUTHORIZED, message, details);
}

/**
 * Send a forbidden error (403)
 */
export function sendForbidden(
  res: Response,
  message: string = "Insufficient permissions",
  details?: any,
): void {
  sendErrorResponse(res, 403, ErrorCode.FORBIDDEN, message, details);
}

/**
 * Send a not found error (404)
 */
export function sendNotFound(
  res: Response,
  message: string = "Resource not found",
  details?: any,
): void {
  sendErrorResponse(res, 404, ErrorCode.NOT_FOUND, message, details);
}

/**
 * Send a validation error (422)
 */
export function sendValidationError(
  res: Response,
  message: string = "Validation failed",
  details?: any,
): void {
  sendErrorResponse(res, 422, ErrorCode.VALIDATION_ERROR, message, details);
}

/**
 * Send a rate limit error (429)
 */
export function sendRateLimitError(
  res: Response,
  message: string = "Too many requests. Please try again later.",
  retryAfter?: number,
): void {
  if (retryAfter) {
    res.setHeader("Retry-After", retryAfter);
  }
  sendErrorResponse(res, 429, ErrorCode.RATE_LIMIT_EXCEEDED, message, {
    retryAfter,
  });
}

/**
 * Send an internal server error (500)
 */
export function sendInternalError(
  res: Response,
  message: string = "Internal server error",
  details?: any,
): void {
  sendErrorResponse(res, 500, ErrorCode.INTERNAL_ERROR, message, details);
}

/**
 * Send a service unavailable error (503)
 */
export function sendServiceUnavailable(
  res: Response,
  message: string = "Service temporarily unavailable",
  details?: any,
): void {
  sendErrorResponse(res, 503, ErrorCode.SERVICE_UNAVAILABLE, message, details);
}
