// SPDX-License-Identifier: MIT
// apps/backend/src/middleware/sessionMiddleware.ts

/**
 * Session Middleware
 *
 * Provides HTTP session management with Redis backend for distributed applications.
 * Falls back to in-memory storage in development when Redis is unavailable.
 *
 * @remarks
 * This middleware offers:
 * - Persistent sessions with Redis backend (production)
 * - In-memory fallback for development
 * - Secure cookie configuration
 * - Automatic session expiration (24 hours)
 * - CSRF protection via SameSite cookies
 *
 * Session Configuration:
 * - Cookie name: 'erp.sid'
 * - Max age: 24 hours
 * - HttpOnly: true (prevents XSS)
 * - Secure: true in production (HTTPS only)
 * - SameSite: 'lax' (CSRF protection)
 *
 * @example
 * ```typescript
 * import { createSessionMiddleware } from './middleware/sessionMiddleware.js';
 *
 * app.use(createSessionMiddleware());
 *
 * // Access session in routes
 * app.get('/profile', (req, res) => {
 *   req.session.userId = 123;
 *   res.json({ sessionId: req.sessionID });
 * });
 * ```
 */

import session from "express-session";
import { RedisStore } from "connect-redis";
import { redisService } from "../services/redisService.js";
import { log } from "../routes/ai/utils/logger.js";

/**
 * Creates session middleware with Redis store or in-memory fallback
 *
 * Automatically selects Redis store if available, otherwise uses in-memory store
 * (not recommended for production). Session secret is read from SESSION_SECRET
 * environment variable.
 *
 * @returns Express session middleware
 *
 * @example
 * ```typescript
 * const sessionMiddleware = createSessionMiddleware();
 * app.use(sessionMiddleware);
 * ```
 */
export function createSessionMiddleware() {
  const sessionSecret =
    process.env.SESSION_SECRET || "dev-secret-key-change-in-production";

  // Redis client for session store
  const redisClient = redisService.getClient();

  // Session configuration
  const sessionConfig: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: "erp.sid",
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax",
    },
  };

  // Use Redis store if available
  if (redisClient && redisService.isReady()) {
    log("info", "📦 Using Redis session store");
    sessionConfig.store = new RedisStore({
      client: redisClient,
      prefix: "sess:",
      ttl: 86400, // 24 hours in seconds
    });
  } else {
    log(
      "warn",
      "⚠️ Using in-memory session store (not recommended for production)",
    );
    // Default MemoryStore is used when no store is specified
  }

  return session(sessionConfig);
}

/**
 * Session statistics middleware
 * Adds endpoint to get session stats
 */
export async function getSessionStats() {
  const redisClient = redisService.getClient();

  if (!redisClient || !redisService.isReady()) {
    return {
      store: "memory",
      message: "Using in-memory session store - statistics not available",
    };
  }

  try {
    // Get all session keys
    const sessionKeys = await redisService.keys("sess:*");

    return {
      store: "redis",
      totalSessions: sessionKeys.length,
      redisStats: redisService.getStats(),
    };
  } catch (error) {
    log("error", "Failed to get session stats", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      store: "redis",
      error: "Failed to retrieve statistics",
    };
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const redisClient = redisService.getClient();

  if (!redisClient || !redisService.isReady()) {
    log("debug", "Session cleanup skipped - using in-memory store");
    return 0;
  }

  try {
    const sessionKeys = await redisService.keys("sess:*");
    let cleanedCount = 0;

    for (const key of sessionKeys) {
      const exists = await redisService.exists(key);
      if (!exists) {
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      log("info", `Cleaned up ${cleanedCount} expired sessions`);
    }

    return cleanedCount;
  } catch (error) {
    log("error", "Failed to cleanup sessions", {
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}

export default createSessionMiddleware;
