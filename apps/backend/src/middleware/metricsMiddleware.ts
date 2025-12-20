// SPDX-License-Identifier: MIT
// apps/backend/src/middleware/metricsMiddleware.ts

import { Request, Response, NextFunction } from "express";
import { metricsService } from "../routes/metrics/metricsService.js";

/**
 * Middleware to automatically collect HTTP request metrics.
 * Tracks request duration, status codes, and routes.
 *
 * Usage:
 * ```typescript
 * import { metricsMiddleware } from './middleware/metricsMiddleware.js';
 * app.use(metricsMiddleware);
 * ```
 */
export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Skip metrics collection for the metrics endpoint itself
  if (req.path === "/metrics" || req.path === "/api/metrics") {
    return next();
  }

  const startTime = Date.now();
  const method = req.method;
  // Normalize route to avoid high cardinality
  const route = normalizeRoute(req.path);

  // Track request in progress
  metricsService.startHttpRequest(method, route);

  // Override res.end to capture metrics when response is sent
  const originalEnd = res.end.bind(res);
  res.end = function (
    this: Response,
    chunk?: unknown,
    encoding?: BufferEncoding | (() => void),
    cb?: () => void,
  ): Response {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Record metrics
    metricsService.recordHttpRequest(method, route, statusCode, duration);
    metricsService.endHttpRequest(method, route);

    // Call original end with proper argument handling
    if (typeof encoding === "function") {
      return originalEnd(chunk, encoding);
    }
    if (encoding === undefined) {
      return originalEnd(chunk);
    }
    return originalEnd(chunk, encoding, cb);
  };

  next();
}

/**
 * Pre-compiled regex patterns for route normalization
 */
const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const NUMERIC_ID_PATTERN = /\/\d+/g;
const FILE_EXTENSION_PATTERN = /\.[a-zA-Z0-9]+$/;

/**
 * Normalize routes to avoid high cardinality in metrics.
 * Replaces IDs and other dynamic segments with placeholders.
 *
 * Examples:
 * - /api/users/123 -> /api/users/:id
 * - /api/orders/abc-def-ghi -> /api/orders/:id
 * - /api/files/report.pdf -> /api/files/:filename
 */
function normalizeRoute(path: string): string {
  return (
    path
      // Replace UUIDs
      .replace(UUID_PATTERN, ":id")
      // Replace numeric IDs
      .replace(NUMERIC_ID_PATTERN, "/:id")
      // Replace file extensions
      .replace(FILE_EXTENSION_PATTERN, ".ext")
      // Limit path depth to avoid explosion
      .split("/")
      .slice(0, 5)
      .join("/")
  );
}

export default metricsMiddleware;
