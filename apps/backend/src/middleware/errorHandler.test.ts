// SPDX-License-Identifier: MIT
// apps/backend/src/middleware/errorHandler.test.ts

import { describe, it, expect, vi } from "vitest";
import { errorHandler } from "./errorHandler";
import { Request, Response, NextFunction } from "express";

describe("errorHandler middleware", () => {
  it("should return 500 status with error message", () => {
    const mockReq = {} as Request;
    const mockRes = {
      headersSent: false,
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const mockNext = vi.fn() as NextFunction;

    const error = new Error("Test error");
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Internal Server Error",
    });
  });

  it("should not respond if headers already sent", () => {
    const mockReq = {} as Request;
    const mockRes = {
      headersSent: true,
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const mockNext = vi.fn() as NextFunction;

    const error = new Error("Test error");
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });
});
