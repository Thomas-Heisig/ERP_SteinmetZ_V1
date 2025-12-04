// apps/backend/src/middleware/asyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wrapper for async route handlers to catch errors and pass to error middleware
 *
 * Usage:
 * router.get('/endpoint', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
