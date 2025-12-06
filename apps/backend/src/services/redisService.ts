// SPDX-License-Identifier: MIT
// apps/backend/src/services/redisService.ts

/**
 * Redis Service
 * Provides Redis integration for session management and distributed caching
 * Supports both Redis and in-memory fallback for development
 */

import { createClient, RedisClientType } from "redis";
import { log } from "../routes/ai/utils/logger.js";

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  enableOfflineQueue?: boolean;
  retryStrategy?: (times: number) => number | void;
}

class RedisService {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private useInMemoryFallback = false;
  private inMemoryStore = new Map<string, { value: string; expiry?: number }>();

  /**
   * Initialize Redis client
   */
  async initialize(config?: Partial<RedisConfig>): Promise<void> {
    const defaultConfig: RedisConfig = {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || "0", 10),
      enableOfflineQueue: false,
    };

    const finalConfig = { ...defaultConfig, ...config };

    try {
      // Skip Redis in development if not configured
      if (
        process.env.NODE_ENV === "development" &&
        !process.env.REDIS_HOST &&
        !process.env.REDIS_ENABLED
      ) {
        log(
          "info",
          "Redis not configured for development - using in-memory fallback",
        );
        this.useInMemoryFallback = true;
        return;
      }

      this.client = createClient({
        socket: {
          host: finalConfig.host,
          port: finalConfig.port,
        },
        password: finalConfig.password,
        database: finalConfig.db,
      });

      this.client.on("error", (err) => {
        log("error", "Redis Client Error", { error: err.message });
        if (!this.isConnected) {
          log("warn", "Falling back to in-memory session store");
          this.useInMemoryFallback = true;
        }
      });

      this.client.on("connect", () => {
        log("info", "🔴 Redis client connected");
      });

      this.client.on("ready", () => {
        this.isConnected = true;
        log("info", "✅ Redis client ready");
      });

      this.client.on("end", () => {
        this.isConnected = false;
        log("info", "Redis client disconnected");
      });

      await this.client.connect();
    } catch (error) {
      log("error", "Failed to initialize Redis", {
        error: error instanceof Error ? error.message : String(error),
      });
      log("warn", "Falling back to in-memory session store");
      this.useInMemoryFallback = true;
    }
  }

  /**
   * Get Redis client (or null if using fallback)
   */
  getClient(): RedisClientType | null {
    return this.useInMemoryFallback ? null : this.client;
  }

  /**
   * Check if Redis is connected
   */
  isReady(): boolean {
    return this.useInMemoryFallback || this.isConnected;
  }

  /**
   * Get value by key
   */
  async get(key: string): Promise<string | null> {
    if (this.useInMemoryFallback) {
      const entry = this.inMemoryStore.get(key);
      if (!entry) return null;

      // Check expiry
      if (entry.expiry && Date.now() > entry.expiry) {
        this.inMemoryStore.delete(key);
        return null;
      }

      return entry.value;
    }

    if (!this.client || !this.isConnected) {
      throw new Error("Redis client not connected");
    }

    const result = await this.client.get(key);
    return typeof result === "string" ? result : null;
  }

  /**
   * Set value with optional expiry (in seconds)
   */
  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    if (this.useInMemoryFallback) {
      const entry: { value: string; expiry?: number } = { value };

      if (expirySeconds) {
        entry.expiry = Date.now() + expirySeconds * 1000;
      }

      this.inMemoryStore.set(key, entry);
      return;
    }

    if (!this.client || !this.isConnected) {
      throw new Error("Redis client not connected");
    }

    if (expirySeconds) {
      await this.client.setEx(key, expirySeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Delete key
   */
  async del(key: string): Promise<void> {
    if (this.useInMemoryFallback) {
      this.inMemoryStore.delete(key);
      return;
    }

    if (!this.client || !this.isConnected) {
      throw new Error("Redis client not connected");
    }

    await this.client.del(key);
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (this.useInMemoryFallback) {
      return this.inMemoryStore.has(key);
    }

    if (!this.client || !this.isConnected) {
      throw new Error("Redis client not connected");
    }

    return (await this.client.exists(key)) === 1;
  }

  /**
   * Set expiry for existing key (in seconds)
   */
  async expire(key: string, seconds: number): Promise<void> {
    if (this.useInMemoryFallback) {
      const entry = this.inMemoryStore.get(key);
      if (entry) {
        entry.expiry = Date.now() + seconds * 1000;
        this.inMemoryStore.set(key, entry);
      }
      return;
    }

    if (!this.client || !this.isConnected) {
      throw new Error("Redis client not connected");
    }

    await this.client.expire(key, seconds);
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    if (this.useInMemoryFallback) {
      const regex = new RegExp(
        "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$",
      );
      return Array.from(this.inMemoryStore.keys()).filter((key) =>
        regex.test(key),
      );
    }

    if (!this.client || !this.isConnected) {
      throw new Error("Redis client not connected");
    }

    return await this.client.keys(pattern);
  }

  /**
   * Increment value
   */
  async incr(key: string): Promise<number> {
    if (this.useInMemoryFallback) {
      const entry = this.inMemoryStore.get(key);
      const currentValue = entry ? parseInt(entry.value, 10) : 0;
      const newValue = currentValue + 1;
      this.inMemoryStore.set(key, { value: String(newValue) });
      return newValue;
    }

    if (!this.client || !this.isConnected) {
      throw new Error("Redis client not connected");
    }

    return await this.client.incr(key);
  }

  /**
   * Get multiple values
   */
  async mget(keys: string[]): Promise<(string | null)[]> {
    if (this.useInMemoryFallback) {
      return keys.map((key) => {
        const entry = this.inMemoryStore.get(key);
        if (!entry) return null;

        // Check expiry
        if (entry.expiry && Date.now() > entry.expiry) {
          this.inMemoryStore.delete(key);
          return null;
        }

        return entry.value;
      });
    }

    if (!this.client || !this.isConnected) {
      throw new Error("Redis client not connected");
    }

    const results = await this.client.mGet(keys);
    return results.map((r) => (r === null || r === undefined ? null : String(r)));
  }

  /**
   * Flush all data (use with caution!)
   */
  async flushAll(): Promise<void> {
    if (this.useInMemoryFallback) {
      this.inMemoryStore.clear();
      return;
    }

    if (!this.client || !this.isConnected) {
      throw new Error("Redis client not connected");
    }

    await this.client.flushAll();
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      connected: this.isConnected,
      usingFallback: this.useInMemoryFallback,
      inMemoryKeys: this.useInMemoryFallback ? this.inMemoryStore.size : 0,
    };
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      log("info", "Redis client closed");
    }
  }

  /**
   * Clean up expired in-memory entries (for fallback mode)
   */
  private startCleanupTimer(): void {
    if (!this.useInMemoryFallback) return;

    setInterval(
      () => {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, entry] of this.inMemoryStore.entries()) {
          if (entry.expiry && now > entry.expiry) {
            this.inMemoryStore.delete(key);
            cleaned++;
          }
        }

        if (cleaned > 0) {
          log("debug", `Cleaned ${cleaned} expired in-memory cache entries`);
        }
      },
      60_000, // Every minute
    ).unref();
  }
}

// Global Redis service instance
export const redisService = new RedisService();

// Initialize Redis on module load (non-blocking)
redisService.initialize().catch((error) => {
  log("error", "Failed to initialize Redis service", {
    error: error instanceof Error ? error.message : String(error),
  });
});

export default redisService;
