// apps/backend/src/middleware/asyncHandler.test.ts
import { describe, it, expect, vi } from "vitest";
import { asyncHandler } from "./asyncHandler";
import { Request, Response, NextFunction } from "express";

describe("asyncHandler", () => {
  it("should call async function and handle successful response", async () => {
    const mockReq = {} as Request;
    const mockRes = {
      json: vi.fn(),
    } as unknown as Response;
    const mockNext = vi.fn() as NextFunction;

    const asyncFn = vi.fn(async (_req, res) => {
      res.json({ success: true });
    });

    const handler = asyncHandler(asyncFn);
    await handler(mockReq, mockRes, mockNext);

    expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should catch errors and pass to next middleware", async () => {
    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const mockNext = vi.fn() as NextFunction;

    const error = new Error("Test error");
    const asyncFn = vi.fn(async () => {
      throw error;
    });

    const handler = asyncHandler(asyncFn);
    await handler(mockReq, mockRes, mockNext);

    expect(asyncFn).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it("should handle rejected promises", async () => {
    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const mockNext = vi.fn() as NextFunction;

    const error = new Error("Promise rejection");
    const asyncFn = vi.fn(() => Promise.reject(error));

    const handler = asyncHandler(asyncFn);
    await handler(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
