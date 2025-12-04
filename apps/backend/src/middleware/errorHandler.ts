// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { APIError, ErrorCode, ErrorDetails } from "../types/errors.js";
import { log } from "../routes/ai/utils/logger.js";

/**
 * Enhanced error handler middleware with standardized error responses and logging
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Skip if headers already sent
  if (res.headersSent) {
    return;
  }

  const isDevelopment = process.env.NODE_ENV === "development";
  const requestId = (req.headers["x-request-id"] as string) || generateRequestId();

  let errorDetails: ErrorDetails;
  let statusCode: number;

  // Handle known APIError instances
  if (err instanceof APIError) {
    statusCode = err.statusCode;
    errorDetails = {
      ...err.toJSON(),
      path: req.path,
      requestId,
    };

    // Log operational errors as warnings, non-operational as errors
    if (err.isOperational) {
      log("warn", `API Error: ${err.message}`, {
        code: err.code,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        requestId,
        details: err.details,
      });
    } else {
      log("error", `Non-operational API Error: ${err.message}`, {
        code: err.code,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        requestId,
        details: err.details,
        stack: err.stack,
      });
    }
  }
  // Handle validation errors from Zod or other validators
  else if (err && typeof err === "object" && "issues" in err) {
    statusCode = 422;
    errorDetails = {
      code: ErrorCode.VALIDATION_ERROR,
      message: "Validation failed",
      statusCode,
      details: (err as any).issues || (err as any).errors,
      timestamp: new Date().toISOString(),
      path: req.path,
      requestId,
    };

    log("warn", "Validation Error", {
      path: req.path,
      method: req.method,
      requestId,
      issues: (err as any).issues || (err as any).errors,
    });
  }
  // Handle standard JavaScript errors
  else if (err instanceof Error) {
    statusCode = 500;
    errorDetails = {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: isDevelopment ? err.message : "Internal Server Error",
      statusCode,
      details: isDevelopment ? { stack: err.stack } : undefined,
      timestamp: new Date().toISOString(),
      path: req.path,
      requestId,
    };

    log("error", `Unhandled Error: ${err.message}`, {
      path: req.path,
      method: req.method,
      requestId,
      error: err.message,
      stack: err.stack,
    });
  }
  // Handle unknown errors
  else {
    statusCode = 500;
    errorDetails = {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred",
      statusCode,
      details: isDevelopment ? { error: String(err) } : undefined,
      timestamp: new Date().toISOString(),
      path: req.path,
      requestId,
    };

    log("error", "Unknown Error Type", {
      path: req.path,
      method: req.method,
      requestId,
      error: String(err),
    });
  }

  // Send standardized error response
  res.status(statusCode).json({
    success: false,
    error: errorDetails,
  });
}

/**
 * Generate a simple request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
