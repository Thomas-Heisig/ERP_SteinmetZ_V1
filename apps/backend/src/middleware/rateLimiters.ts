// SPDX-License-Identifier: MIT
// apps/backend/src/middleware/rateLimiters.ts

/**
 * Rate Limiting Middleware
 *
 * Provides differentiated rate limiting for various API endpoints:
 * - Authentication: Strict limits to prevent brute-force attacks
 * - AI endpoints: Moderate limits to control costs
 * - Batch operations: Very strict limits for expensive operations
 * - General API: Generous limits for normal operations
 *
 * Configuration via environment variables:
 * - SKIP_RATE_LIMIT: Disable rate limiting (development only)
 * - NODE_ENV: Production enforces stricter limits
 *
 * See docs/RATE_LIMITING.md for detailed documentation.
 */

import rateLimit from "express-rate-limit";
import { sendRateLimitError } from "../utils/errorResponse.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("rate-limiter");

/**
 * Rate limiter for AI endpoints
 * Limits to 20 requests per 15 minutes per IP
 * Allows burst of 5 requests within 1 minute
 */
export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many AI requests from this IP, please try again later.",
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    logger.warn({
      ip: req.ip,
      endpoint: req.path,
      limit: options.max,
      message: "AI rate limit exceeded",
    });
    sendRateLimitError(
      res,
      "Too many AI requests from this IP, please try again later.",
      retryAfter,
    );
  },
  skip: (req) => {
    // Skip rate limiting in development if configured
    return process.env.SKIP_RATE_LIMIT === "true";
  },
  // Note: Failed requests don't count against the limit
  skipSuccessfulRequests: false,
  skipFailedRequests: true,
});

/**
 * Stricter rate limiter for expensive AI operations
 * Limits to 5 requests per 15 minutes per IP
 * No burst handling - strictly enforced
 *
 * Used for:
 * - Batch processing endpoints
 * - Large AI model requests (GPT-4, Claude-3-Opus)
 * - Audio transcription
 */
export const strictAiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message:
    "Too many expensive AI requests from this IP, please try again later.",
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    logger.warn({
      ip: req.ip,
      endpoint: req.path,
      limit: options.max,
      message: "Strict AI rate limit exceeded (expensive operation)",
    });
    sendRateLimitError(
      res,
      "Too many expensive AI requests from this IP, please try again later.",
      retryAfter,
    );
  },
  skip: (req) => {
    return process.env.SKIP_RATE_LIMIT === "true";
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: true,
});

/**
 * Rate limiter for audio transcription
 * Limits to 10 requests per hour per IP
 *
 * Audio transcription is expensive (Whisper API) and time-consuming,
 * so we apply strict hourly limits.
 */
export const audioRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message:
    "Too many audio transcription requests from this IP, please try again later.",
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    logger.warn({
      ip: req.ip,
      endpoint: req.path,
      limit: options.max,
      message: "Audio transcription rate limit exceeded",
    });
    sendRateLimitError(
      res,
      "Too many audio transcription requests from this IP, please try again later.",
      retryAfter,
    );
  },
  skip: (req) => {
    return process.env.SKIP_RATE_LIMIT === "true";
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: true,
});

/**
 * General API rate limiter
 * Limits to 100 requests per 15 minutes per IP
 * Allows burst of 20 requests within 1 minute
 *
 * Applied to most API endpoints as baseline protection.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    logger.warn({
      ip: req.ip,
      endpoint: req.path,
      limit: options.max,
      message: "General API rate limit exceeded",
    });
    sendRateLimitError(
      res,
      "Too many requests from this IP, please try again later.",
      retryAfter,
    );
  },
  skip: (req) => {
    return process.env.SKIP_RATE_LIMIT === "true";
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: true,
});
