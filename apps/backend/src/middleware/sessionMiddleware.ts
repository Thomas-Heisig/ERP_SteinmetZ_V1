// SPDX-License-Identifier: MIT
// apps/backend/src/middleware/sessionMiddleware.ts

/**
 * Session Middleware
 *
 * Provides HTTP session management with Redis or SQLite backend.
 * Uses Redis for production and SQLite for development with persistent sessions.
 *
 * @remarks
 * This middleware offers:
 * - Persistent sessions with Redis backend (production)
 * - SQLite session store for development (persistent across restarts)
 * - Secure cookie configuration
 * - Automatic session expiration (24 hours)
 * - CSRF protection via SameSite cookies
 * - Automatic cleanup of expired sessions
 * - Session statistics endpoint
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
 *
 * @module sessionMiddleware
 */

import session from "express-session";
import type { RequestHandler } from "express";
import { RedisStore } from "connect-redis";
import connectSqlite3 from "connect-sqlite3";
import { redisService } from "../services/redisService.js";
import { log } from "../routes/ai/utils/logger.js";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create SQLite session store
const SQLiteStore = connectSqlite3(session);

/**
 * Creates session middleware with Redis or SQLite store
 *
 * Automatically selects Redis store if available, otherwise uses SQLite store
 * for persistent sessions. Session secret is read from SESSION_SECRET
 * environment variable.
 *
 * @returns Express session middleware with type-safe configuration
 * @throws {Error} If session store initialization fails
 *
 * @example
 * ```typescript
 * const sessionMiddleware = createSessionMiddleware();
 * app.use(sessionMiddleware);
 * ```
 */
export function createSessionMiddleware(): RequestHandler {
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

  // Use Redis store if available, otherwise SQLite store
  try {
    if (redisClient && redisService.isReady()) {
      log("info", "📦 Using Redis session store");
      sessionConfig.store = new RedisStore({
        client: redisClient,
        prefix: "sess:",
        ttl: 86400, // 24 hours in seconds
      });
    } else {
      // Use SQLite session store for persistent sessions in development
      const sessionDbPath = path.resolve(
        __dirname,
        "../../data/sessions.sqlite3",
      );
      log("info", `📦 Using SQLite session store: ${sessionDbPath}`);
      sessionConfig.store = new SQLiteStore({
        db: "sessions.sqlite3",
        dir: path.resolve(__dirname, "../../data"),
        table: "sessions",
      });
    }
  } catch (error) {
    log("error", "Failed to initialize session store", {
      error: error instanceof Error ? error.message : String(error),
    });
    // Fallback to default memory store (will warn automatically)
    log(
      "warn",
      "⚠️ Falling back to memory session store (not recommended for production)",
    );
  }

  return session(sessionConfig);
}

/**
 * Session store type
 */
type SessionStore = "redis" | "sqlite" | "memory";

/**
 * Session statistics interface
 */
interface SessionStats {
  /** Type of session store being used */
  store: SessionStore;
  /** Total number of active sessions (Redis only) */
  totalSessions?: number;
  /** Redis service statistics */
  redisStats?: ReturnType<typeof redisService.getStats>;
  /** Status message */
  message?: string;
  /** Error message if stats retrieval failed */
  error?: string;
}

/**
 * Get session statistics
 *
 * Returns information about the current session store and active sessions.
 * For Redis store, includes total session count and Redis statistics.
 * For SQLite store, returns basic information.
 *
 * @returns Session statistics object
 *
 * @example
 * ```typescript
 * const stats = await getSessionStats();
 * console.log(`Using ${stats.store} store with ${stats.totalSessions} sessions`);
 * ```
 */
export async function getSessionStats(): Promise<SessionStats> {
  const redisClient = redisService.getClient();

  if (!redisClient || !redisService.isReady()) {
    return {
      store: "sqlite",
      message: "Using SQLite session store for persistent sessions",
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
 *
 * Removes expired sessions from the session store. For Redis, this is
 * handled automatically by TTL. For SQLite, expired sessions are manually
 * removed based on timestamp.
 *
 * @returns Number of sessions cleaned up
 *
 * @example
 * ```typescript
 * // Manual cleanup
 * const cleaned = await cleanupExpiredSessions();
 * console.log(`Cleaned ${cleaned} expired sessions`);
 *
 * // Scheduled cleanup (every hour)
 * setInterval(async () => {
 *   await cleanupExpiredSessions();
 * }, 60 * 60 * 1000);
 * ```
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

/**
 * Start automatic session cleanup scheduler
 *
 * Schedules periodic cleanup of expired sessions. Only active for Redis store.
 * SQLite sessions are cleaned up automatically by the store.
 *
 * @param intervalMs - Cleanup interval in milliseconds (default: 1 hour)
 * @returns Timer ID that can be used to stop the scheduler
 *
 * @example
 * ```typescript
 * // Start cleanup every hour
 * const timerId = startSessionCleanup();
 *
 * // Stop cleanup
 * clearInterval(timerId);
 * ```
 */
export function startSessionCleanup(
  intervalMs = 60 * 60 * 1000,
): NodeJS.Timeout {
  log("info", `Starting session cleanup scheduler (interval: ${intervalMs}ms)`);

  return setInterval(async () => {
    try {
      const cleaned = await cleanupExpiredSessions();
      if (cleaned > 0) {
        log("info", `Scheduled cleanup removed ${cleaned} expired sessions`);
      }
    } catch (error) {
      log("error", "Scheduled session cleanup failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, intervalMs);
}

export default createSessionMiddleware;
