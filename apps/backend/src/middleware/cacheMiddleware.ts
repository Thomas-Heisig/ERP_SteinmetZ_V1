// SPDX-License-Identifier: MIT
// apps/backend/src/middleware/cacheMiddleware.ts

/**
 * API Response Caching Middleware
 *
 * Provides HTTP response caching for GET requests with configurable TTL
 * and cache invalidation strategies.
 */

import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { log } from "../routes/ai/utils/logger.js";

interface CacheEntry {
  data: any;
  statusCode: number;
  headers: Record<string, string>;
  createdAt: number;
  expiresAt: number;
}

interface CacheOptions {
  /** Time to live in milliseconds */
  ttl?: number;
  /** Custom cache key generator */
  keyGenerator?: (req: Request) => string;
  /** Skip caching for certain conditions */
  skip?: (req: Request, res: Response) => boolean;
}

class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private readonly cleanupInterval = 60_000; // 1 minute

  constructor() {
    this.startCleanup();
  }

  private generateKey(
    req: Request,
    customGenerator?: (req: Request) => string,
  ): string {
    if (customGenerator) {
      return customGenerator(req);
    }

    // Default: hash of method + path + query params + auth header
    const data = {
      method: req.method,
      path: req.path,
      query: req.query,
      user: req.headers.authorization || "anonymous",
    };

    return crypto
      .createHash("sha256")
      .update(JSON.stringify(data))
      .digest("hex");
  }

  set(
    key: string,
    data: any,
    statusCode: number,
    headers: Record<string, string>,
    ttl: number,
  ): void {
    const entry: CacheEntry = {
      data,
      statusCode,
      headers,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(key, entry);
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  invalidate(pattern?: string | RegExp): number {
    if (!pattern) {
      const size = this.cache.size;
      this.cache.clear();
      return size;
    }

    let removed = 0;
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  private startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      let removed = 0;

      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiresAt < now) {
          this.cache.delete(key);
          removed++;
        }
      }

      if (removed > 0) {
        log(
          "info",
          `🧹 Response cache cleanup: ${removed} expired entries removed`,
        );
      }
    }, this.cleanupInterval).unref();
  }

  stats() {
    return {
      entries: this.cache.size,
      memory: this.getMemoryUsage(),
    };
  }

  private getMemoryUsage(): string {
    const bytes = JSON.stringify(Array.from(this.cache.entries())).length;
    return bytes > 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
      : `${(bytes / 1024).toFixed(2)} KB`;
  }
}

// Global cache instance
export const responseCache = new ResponseCache();

/**
 * Cache middleware factory
 *
 * @example
 * app.get('/api/data', cacheMiddleware({ ttl: 300000 }), handler);
 */
export function cacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = 5 * 60 * 1000, // Default: 5 minutes
    keyGenerator,
    skip,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Check skip condition
    if (skip && skip(req, res)) {
      return next();
    }

    const cacheKey = responseCache["generateKey"](req, keyGenerator);

    // Try to get from cache
    const cached = responseCache.get(cacheKey);
    if (cached) {
      log("debug", `✅ Cache hit: ${req.path}`);

      // Set cached headers
      Object.entries(cached.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      res.setHeader("X-Cache", "HIT");
      res.status(cached.statusCode).json(cached.data);
      return;
    }

    // Cache miss - intercept response
    const originalJson = res.json.bind(res);

    res.json = function (data: any) {
      // Store in cache
      const headers: Record<string, string> = {};
      Object.entries(res.getHeaders()).forEach(([key, value]) => {
        if (typeof value === "string") {
          headers[key] = value;
        }
      });

      responseCache.set(cacheKey, data, res.statusCode, headers, ttl);

      log("debug", `💾 Cache miss → stored: ${req.path}`);
      res.setHeader("X-Cache", "MISS");

      return originalJson(data);
    };

    next();
  };
}

/**
 * Cache invalidation middleware
 * Use after routes that modify data (POST, PUT, DELETE)
 *
 * @example
 * app.post('/api/data', handler, invalidateCacheMiddleware('/api/data'));
 */
export function invalidateCacheMiddleware(pattern?: string | RegExp) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    const removed = responseCache.invalidate(pattern);
    if (removed > 0) {
      log("info", `🗑️ Cache invalidated: ${removed} entries removed`);
    }
    next();
  };
}

/**
 * Cache statistics endpoint handler
 */
export function cacheStatsHandler(_req: Request, res: Response): void {
  res.json(responseCache.stats());
}
