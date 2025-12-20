// SPDX-License-Identifier: MIT

/**
 * Database Manager - Singleton with Lazy Initialization
 *
 * Manages database lifecycle with proper initialization sequencing.
 * Prevents the "Database not initialized" error by using lazy loading
 * and caching patterns.
 *
 * @module database/DatabaseManager
 */

import db from "./dbService.js";
import type Database from "better-sqlite3";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("db-manager");

/**
 * Database service interface for type safety
 */
interface DatabaseService {
  api?: {
    db?: Database.Database;
  };
  init?: () => Promise<void>;
  all?: <T = unknown>(sql: string, params?: unknown[]) => Promise<T[]>;
  get?: <T = unknown>(
    sql: string,
    params?: unknown[],
  ) => Promise<T | undefined>;
  run?: (
    sql: string,
    params?: unknown[],
  ) => Promise<{ changes: number; lastID?: number }>;
}

/**
 * Database Manager class - Singleton pattern
 *
 * Manages:
 * - Lazy initialization with caching
 * - Initialization state tracking
 * - Safe database access patterns
 * - Initialization hooks
 */
class DatabaseManager {
  private static instance: DatabaseManager;
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private initHooks: Array<() => Promise<void>> = [];

  /**
   * Get singleton instance
   */
  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize database (idempotent - safe to call multiple times)
   *
   * @example
   * ```typescript
   * await DatabaseManager.getInstance().initialize();
   * ```
   */
  async initialize(): Promise<void> {
    // If already initialized, return immediately
    if (this.initialized) {
      logger.debug("Database already initialized");
      return;
    }

    // If initialization in progress, wait for it
    if (this.initPromise) {
      logger.debug("Database initialization in progress, waiting...");
      return this.initPromise;
    }

    // Start initialization
    this.initPromise = this.performInitialization();
    await this.initPromise;
  }

  /**
   * Perform the actual initialization
   */
  private async performInitialization(): Promise<void> {
    try {
      logger.info("Starting database initialization");

      // Initialize the database service
      const dbService = db as unknown as DatabaseService;
      if (dbService?.init) {
        await dbService.init();
        logger.info("Database service initialized");
      }

      // Run initialization hooks
      for (const hook of this.initHooks) {
        try {
          await hook();
        } catch (hookError) {
          logger.warn({ hookError }, "Initialization hook failed");
        }
      }

      this.initialized = true;
      logger.info("Database fully initialized");
    } catch (error) {
      this.initPromise = null; // Reset so we can retry
      logger.error({ error }, "Database initialization failed");
      throw error;
    }
  }

  /**
   * Register an initialization hook
   * Hooks run after database.init() completes
   *
   * @param hook - Async function to run during initialization
   *
   * @example
   * ```typescript
   * DatabaseManager.getInstance().registerHook(async () => {
   *   await seedDefaultData();
   * });
   * ```
   */
  registerHook(hook: () => Promise<void>): void {
    this.initHooks.push(hook);
  }

  /**
   * Check if database is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get raw database instance
   * Safe to call after initialization
   *
   * @throws {Error} If database not initialized
   */
  getDatabase(): Database.Database {
    const dbService = db as unknown as DatabaseService;

    if (dbService?.api?.db) {
      return dbService.api.db;
    }

    throw new Error(
      "Database not initialized. Call DatabaseManager.getInstance().initialize() first.",
    );
  }

  /**
   * Get database service (async operations)
   */
  getService(): DatabaseService {
    return db as unknown as DatabaseService;
  }

  /**
   * Safe database access - waits for initialization if needed
   *
   * @param operation - Async operation to perform
   * @returns Result of operation
   *
   * @example
   * ```typescript
   * const users = await dbManager.safeAccess(async () => {
   *   return await db.all('SELECT * FROM users');
   * });
   * ```
   */
  async safeAccess<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.initialized && !this.initPromise) {
      await this.initialize();
    } else if (this.initPromise) {
      await this.initPromise;
    }

    return operation();
  }

  /**
   * Execute a query safely (waits for initialization)
   */
  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    return this.safeAccess(async () => {
      const service = this.getService();
      if (service?.all) {
        return service.all<T>(sql, params);
      }
      throw new Error("Database service not available");
    });
  }

  /**
   * Get single row safely
   */
  async queryOne<T = unknown>(
    sql: string,
    params?: unknown[],
  ): Promise<T | undefined> {
    return this.safeAccess(async () => {
      const service = this.getService();
      if (service?.get) {
        return service.get<T>(sql, params);
      }
      throw new Error("Database service not available");
    });
  }

  /**
   * Execute mutation safely
   */
  async execute(
    sql: string,
    params?: unknown[],
  ): Promise<{ changes: number; lastID?: number }> {
    return this.safeAccess(async () => {
      const service = this.getService();
      if (service?.run) {
        return service.run(sql, params);
      }
      throw new Error("Database service not available");
    });
  }
}

export default DatabaseManager.getInstance();
