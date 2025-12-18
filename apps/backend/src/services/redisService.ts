// SPDX-License-Identifier: MIT
// apps/backend/src/services/redisService.ts

/**
 * Redis Service
 *
 * Provides Redis integration for session management and distributed caching.
 * Automatically falls back to in-memory storage when Redis is unavailable or not configured.
 *
 * @remarks
 * This service supports:
 * - Redis connection with automatic retry and fallback
 * - In-memory storage fallback for development environments
 * - Key-value operations (get, set, delete, exists)
 * - TTL (Time To Live) support for cache expiration
 * - Pattern-based key search
 * - Atomic increment operations
 * - Batch operations (mget)
 * - Graceful shutdown with cleanup
 *
 * The service automatically uses in-memory fallback when:
 * - NODE_ENV is 'development' and Redis is not explicitly configured
 * - Redis connection fails during initialization
 * - Redis becomes unavailable during runtime
 *
 * @example
 * ```typescript
 * import redisService from './services/redisService.js';
 *
 * // Service initializes automatically on import
 *
 * // Store session data
 * await redisService.set('session:123', JSON.stringify(sessionData), 3600);
 *
 * // Retrieve session
 * const session = await redisService.get('session:123');
 *
 * // Increment counter
 * const views = await redisService.incr('page:views:home');
 *
 * // Check connection
 * const isReady = redisService.isReady();
 * ```
 */

import { createClient, RedisClientType } from "redis";
import { log } from "../routes/ai/utils/logger.js";

/**
 * Redis configuration options
 *
 * @interface RedisConfig
 * @property {string} host - Redis server hostname
 * @property {number} port - Redis server port (default: 6379)
 * @property {string} [password] - Optional Redis authentication password
 * @property {number} [db] - Redis database number (default: 0)
 * @property {boolean} [enableOfflineQueue] - Queue commands when offline (default: false)
 * @property {Function} [retryStrategy] - Custom retry strategy function
 */
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
   * Initialize Redis client with optional configuration
   *
   * Attempts to connect to Redis using environment variables or provided config.
   * Automatically falls back to in-memory storage if connection fails or Redis is not configured.
   *
   * @param {Partial<RedisConfig>} [config] - Optional Redis configuration overrides
   * @returns {Promise<void>}
   * @throws Will not throw - logs errors and enables fallback mode instead
   *
   * @example
   * ```typescript
   * // Initialize with custom config
   * await redisService.initialize({ host: 'redis.example.com', port: 6380 });
   *
   * // Initialize with defaults from environment
   * await redisService.initialize();
   * ```
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
   * Get the underlying Redis client instance
   *
   * @returns {RedisClientType | null} Redis client or null if using in-memory fallback
   *
   * @example
   * ```typescript
   * const client = redisService.getClient();
   * if (client) {
   *   // Use native Redis commands
   *   await client.hSet('user:123', 'name', 'John');
   * }
   * ```
   */
  getClient(): RedisClientType | null {
    return this.useInMemoryFallback ? null : this.client;
  }

  /**
   * Check if the service is ready to accept commands
   *
   * @returns {boolean} True if Redis is connected or fallback mode is active
   *
   * @example
   * ```typescript
   * if (redisService.isReady()) {
   *   await redisService.set('key', 'value');
   * }
   * ```
   */
  isReady(): boolean {
    return this.useInMemoryFallback || this.isConnected;
  }

  /**
   * Retrieve a value by its key
   *
   * @param {string} key - The key to retrieve
   * @returns {Promise<string | null>} The value or null if key doesn't exist or is expired
   * @throws {Error} If Redis client is not connected and not in fallback mode
   *
   * @example
   * ```typescript
   * const sessionData = await redisService.get('session:abc123');
   * if (sessionData) {
   *   const session = JSON.parse(sessionData);
   * }
   * ```
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
   * Store a key-value pair with optional expiration
   *
   * @param {string} key - The key to store
   * @param {string} value - The value to store (must be a string)
   * @param {number} [expirySeconds] - Optional TTL in seconds
   * @returns {Promise<void>}
   * @throws {Error} If Redis client is not connected and not in fallback mode
   *
   * @example
   * ```typescript
   * // Store without expiry
   * await redisService.set('config:theme', 'dark');
   *
   * // Store with 1-hour expiry
   * await redisService.set('cache:user:123', JSON.stringify(user), 3600);
   * ```
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
   * Delete a key from the store
   *
   * @param {string} key - The key to delete
   * @returns {Promise<void>}
   * @throws {Error} If Redis client is not connected and not in fallback mode
   *
   * @example
   * ```typescript
   * // Remove session
   * await redisService.del('session:expired-session-id');
   * ```
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
   * Check if a key exists in the store
   *
   * @param {string} key - The key to check
   * @returns {Promise<boolean>} True if the key exists, false otherwise
   * @throws {Error} If Redis client is not connected and not in fallback mode
   *
   * @example
   * ```typescript
   * if (await redisService.exists('cache:users')) {
   *   // Cache hit
   *   const users = await redisService.get('cache:users');
   * }
   * ```
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
   * Set or update the expiration time for an existing key
   *
   * @param {string} key - The key to set expiration for
   * @param {number} seconds - TTL in seconds
   * @returns {Promise<void>}
   * @throws {Error} If Redis client is not connected and not in fallback mode
   *
   * @example
   * ```typescript
   * // Extend cache lifetime by 1 hour
   * await redisService.expire('cache:products', 3600);
   * ```
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
   * Find all keys matching a pattern
   *
   * @param {string} pattern - Glob-style pattern (* for any characters, ? for single character)
   * @returns {Promise<string[]>} Array of matching keys
   * @throws {Error} If Redis client is not connected and not in fallback mode
   *
   * @warning Use with caution in production - can be slow with many keys
   *
   * @example
   * ```typescript
   * // Get all session keys
   * const sessionKeys = await redisService.keys('session:*');
   *
   * // Get all cache keys for users
   * const userCaches = await redisService.keys('cache:user:*');
   * ```
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
   * Atomically increment a numeric value
   *
   * Creates the key with value 0 if it doesn't exist, then increments by 1.
   *
   * @param {string} key - The key to increment
   * @returns {Promise<number>} The new value after increment
   * @throws {Error} If Redis client is not connected and not in fallback mode
   *
   * @example
   * ```typescript
   * // Track page views
   * const views = await redisService.incr('stats:pageviews:home');
   * console.log(`Page viewed ${views} times`);
   * ```
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
   * Retrieve multiple values in a single operation
   *
   * More efficient than multiple individual get() calls.
   *
   * @param {string[]} keys - Array of keys to retrieve
   * @returns {Promise<(string | null)[]>} Array of values (null for missing/expired keys)
   * @throws {Error} If Redis client is not connected and not in fallback mode
   *
   * @example
   * ```typescript
   * const [user1, user2, user3] = await redisService.mget([
   *   'cache:user:1',
   *   'cache:user:2',
   *   'cache:user:3'
   * ]);
   * ```
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
    return results.map((r) =>
      r === null || r === undefined ? null : String(r),
    );
  }

  /**
   * Delete all keys from the current database
   *
   * @returns {Promise<void>}
   * @throws {Error} If Redis client is not connected and not in fallback mode
   *
   * @warning DESTRUCTIVE OPERATION - Use only for testing or maintenance
   *
   * @example
   * ```typescript
   * // Clear all cache in test environment
   * if (process.env.NODE_ENV === 'test') {
   *   await redisService.flushAll();
   * }
   * ```
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
   * Get current service statistics and status
   *
   * @returns {{connected: boolean, usingFallback: boolean, inMemoryKeys: number}} Service statistics
   *
   * @example
   * ```typescript
   * const stats = redisService.getStats();
   * console.log(`Redis connected: ${stats.connected}`);
   * console.log(`Using fallback: ${stats.usingFallback}`);
   * console.log(`In-memory keys: ${stats.inMemoryKeys}`);
   * ```
   */
  getStats() {
    return {
      connected: this.isConnected,
      usingFallback: this.useInMemoryFallback,
      inMemoryKeys: this.useInMemoryFallback ? this.inMemoryStore.size : 0,
    };
  }

  /**
   * Gracefully disconnect from Redis
   *
   * Attempts a clean shutdown with QUIT command. Falls back to forced disconnect if needed.
   * Clears in-memory store if using fallback mode.
   *
   * @returns {Promise<void>}
   *
   * @example
   * ```typescript
   * // During application shutdown
   * await redisService.disconnect();
   * ```
   */
  async disconnect(): Promise<void> {
    if (this.useInMemoryFallback) {
      log("info", "Using in-memory fallback, clearing store");
      this.inMemoryStore.clear();
      return;
    }

    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        this.isConnected = false;
        log("info", "✅ Redis client disconnected gracefully");
      } catch (error) {
        log(
          "error",
          "Failed to gracefully disconnect Redis client, forcing close",
          {
            error: error instanceof Error ? error.message : String(error),
          },
        );
        // Force close if graceful quit fails
        await this.client?.disconnect();
        this.isConnected = false;
      }
    }
  }

  /**
   * Close Redis connection
   *
   * Alias for disconnect() for consistency with other services.
   *
   * @returns {Promise<void>}
   *
   * @example
   * ```typescript
   * await redisService.close();
   * ```
   */
  async close(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Start automatic cleanup of expired entries in in-memory fallback mode
   *
   * Runs every 60 seconds to remove expired keys from memory.
   * Only active when using in-memory fallback.
   *
   * @private
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
