// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);
  if (res.headersSent) return;

  res.status(500).json({
    error: "Internal Server Error",
    // In dev you may want to expose the message, otherwise hide it:
    // message: (err as Error).message,
  });
}
