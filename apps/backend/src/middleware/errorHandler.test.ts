// SPDX-License-Identifier: MIT
// apps/backend/src/middleware/errorHandler.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { errorHandler } from "./errorHandler";
import { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
  InternalServerError,
  ErrorCode,
} from "../routes/error/errors";

describe("errorHandler middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      path: "/api/test",
      method: "GET",
      headers: {},
    };
    mockRes = {
      headersSent: false,
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn() as NextFunction;
  });

  it("should handle APIError with correct status code and structure", () => {
    const error = new BadRequestError("Invalid input", { field: "email" });
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.BAD_REQUEST,
          message: "Invalid input",
          statusCode: 400,
          details: { field: "email" },
          path: "/api/test",
        }),
      }),
    );
  });

  it("should handle NotFoundError", () => {
    const error = new NotFoundError("User not found");
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.NOT_FOUND,
          message: "User not found",
          statusCode: 404,
        }),
      }),
    );
  });

  it("should handle ValidationError", () => {
    const error = new ValidationError("Validation failed", {
      errors: ["Field required"],
    });
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(422);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.VALIDATION_ERROR,
          statusCode: 422,
        }),
      }),
    );
  });

  it("should handle standard Error as 500", () => {
    const error = new Error("Something went wrong");
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          statusCode: 500,
        }),
      }),
    );
  });

  it("should handle Zod validation errors", () => {
    const zodError = {
      issues: [
        { path: ["email"], message: "Invalid email" },
        { path: ["age"], message: "Must be positive" },
      ],
    };
    errorHandler(zodError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(422);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.VALIDATION_ERROR,
          message: "Validation failed",
          details: zodError.issues,
        }),
      }),
    );
  });

  it("should handle unknown error types", () => {
    const weirdError = "string error";
    errorHandler(weirdError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: "An unexpected error occurred",
        }),
      }),
    );
  });

  it("should not respond if headers already sent", () => {
    mockRes.headersSent = true;
    const error = new Error("Test error");
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it("should include requestId in error response", () => {
    mockReq.headers = { "x-request-id": "test-123" };
    const error = new NotFoundError("Not found");
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          requestId: "test-123",
        }),
      }),
    );
  });

  it("should generate requestId if not provided", () => {
    const error = new InternalServerError("Server error");
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          requestId: expect.stringMatching(/^req_/),
        }),
      }),
    );
  });
});
