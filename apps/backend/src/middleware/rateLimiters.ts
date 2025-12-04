// SPDX-License-Identifier: MIT
// apps/backend/src/middleware/rateLimiters.ts

import rateLimit from "express-rate-limit";
import { sendRateLimitError } from "../utils/errorResponse.js";

/**
 * Rate limiter for AI endpoints
 * Limits to 20 requests per 15 minutes per IP
 */
export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many AI requests from this IP, please try again later.",
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    sendRateLimitError(
      res,
      "Too many AI requests from this IP, please try again later.",
      retryAfter
    );
  },
  skip: (req) => {
    // Skip rate limiting in development if configured
    return process.env.SKIP_RATE_LIMIT === "true";
  },
});

/**
 * Stricter rate limiter for expensive AI operations
 * Limits to 5 requests per 15 minutes per IP
 */
export const strictAiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many expensive AI requests from this IP, please try again later.",
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    sendRateLimitError(
      res,
      "Too many expensive AI requests from this IP, please try again later.",
      retryAfter
    );
  },
  skip: (req) => {
    return process.env.SKIP_RATE_LIMIT === "true";
  },
});

/**
 * Rate limiter for audio transcription
 * Limits to 10 requests per hour per IP
 */
export const audioRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many audio transcription requests from this IP, please try again later.",
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    sendRateLimitError(
      res,
      "Too many audio transcription requests from this IP, please try again later.",
      retryAfter
    );
  },
  skip: (req) => {
    return process.env.SKIP_RATE_LIMIT === "true";
  },
});

/**
 * General API rate limiter
 * Limits to 100 requests per 15 minutes per IP
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    sendRateLimitError(
      res,
      "Too many requests from this IP, please try again later.",
      retryAfter
    );
  },
  skip: (req) => {
    return process.env.SKIP_RATE_LIMIT === "true";
  },
});
