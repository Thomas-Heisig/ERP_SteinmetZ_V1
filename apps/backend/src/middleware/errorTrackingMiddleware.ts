// SPDX-License-Identifier: MIT
// apps/backend/src/middleware/errorTrackingMiddleware.ts

import { Request, Response, NextFunction } from "express";
import { errorTrackingService } from "../services/errorTrackingService.js";

/**
 * Middleware to integrate Sentry error tracking with Express error handling.
 * Should be added AFTER all routes and BEFORE error handler middleware.
 *
 * Usage:
 * ```typescript
 * import { errorTrackingMiddleware } from './middleware/errorTrackingMiddleware.js';
 * app.use(errorTrackingMiddleware);
 * app.use(errorHandler); // Should come after
 * ```
 */
export function errorTrackingMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!errorTrackingService.isEnabled()) {
    return next(err);
  }

  // Capture error in Sentry
  errorTrackingService.captureException(err, {
    user: (req as any).user
      ? {
          id: (req as any).user.id,
          email: (req as any).user.email,
          username: (req as any).user.username,
        }
      : undefined,
    tags: {
      method: req.method,
      url: req.url,
      status: res.statusCode.toString(),
    },
    extra: {
      headers: req.headers,
      query: req.query,
      params: req.params,
      body: req.body,
    },
  });

  // Continue to next error handler
  next(err);
}

export default errorTrackingMiddleware;
