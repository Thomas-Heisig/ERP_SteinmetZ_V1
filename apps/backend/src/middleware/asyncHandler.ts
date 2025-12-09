// apps/backend/src/middleware/asyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wrapper for async route handlers to automatically catch errors
 * 
 * Eliminates the need for try-catch blocks in async route handlers.
 * Any errors thrown or promises rejected will be automatically passed
 * to Express error handling middleware.
 * 
 * @param fn - Async route handler function
 * 
 * @returns Express RequestHandler that catches async errors
 * 
 * @remarks
 * This is the recommended way to handle async operations in Express routes.
 * Without this wrapper, unhandled promise rejections can crash the application.
 * 
 * @example
 * ```typescript
 * import { asyncHandler } from './middleware/asyncHandler';
 * import { Router } from 'express';
 * 
 * const router = Router();
 * 
 * // Without asyncHandler (NOT recommended)
 * router.get('/users', async (req, res, next) => {
 *   try {
 *     const users = await db.getUsers();
 *     res.json(users);
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 * 
 * // With asyncHandler (recommended)
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await db.getUsers();
 *   res.json(users);
 * }));
 * 
 * // Works with custom errors
 * router.get('/user/:id', asyncHandler(async (req, res) => {
 *   const user = await db.getUserById(req.params.id);
 *   if (!user) {
 *     throw new NotFoundError('User not found');
 *   }
 *   res.json(user);
 * }));
 * ```
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
