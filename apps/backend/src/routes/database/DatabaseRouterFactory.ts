// SPDX-License-Identifier: MIT

/**
 * Database Router Factory - Express Router Integration
 *
 * Provides factory for creating Express routers with built-in database access.
 * Ensures database is initialized before route handlers execute.
 *
 * @module database/DatabaseRouterFactory
 * @example
 * ```typescript
 * import { DatabaseRouterFactory } from './database/DatabaseRouterFactory.js';
 *
 * const factory = new DatabaseRouterFactory('users');
 *
 * factory.get('/', async (req, res, db) => {
 *   const users = await db.query('SELECT * FROM users');
 *   res.json(users);
 * });
 *
 * export default factory.getRouter();
 * ```
 */

import express, { Request, Response, NextFunction, Router } from "express";
import DatabaseManager from "./DatabaseManager.js";
import { createLogger } from "../../utils/logger.js";
import type Database from "better-sqlite3";

const logger = createLogger("db-router-factory");

/**
 * Database context available in route handlers
 */
export interface DatabaseContext {
  /** Database service for async operations */
  db: {
    query: <T = unknown>(sql: string, params?: unknown[]) => Promise<T[]>;
    queryOne: <T = unknown>(sql: string, params?: unknown[]) => Promise<T | undefined>;
    execute: (sql: string, params?: unknown[]) => Promise<{ changes: number; lastID?: number }>;
  };
  /** Raw database instance (for special cases) */
  rawDb: Database.Database;
  /** Route prefix for logging */
  prefix: string;
}

/**
 * Handler type with database context
 */
export type DatabaseRouteHandler = (
  req: Request,
  res: Response,
  db: DatabaseContext,
  next?: NextFunction,
) => Promise<void> | void;

/**
 * DatabaseRouterFactory - Create routers with database integration
 *
 * Features:
 * - Automatic database initialization before route handlers
 * - Type-safe database context injection
 * - Built-in error handling
 * - Request logging with database state
 * - Connection pooling and resource management
 */
export class DatabaseRouterFactory {
  private router: Router;
  private prefix: string;
  private dbManager = DatabaseManager;

  /**
   * Create a new router factory
   *
   * @param prefix - Route prefix for logging and context
   *
   * @example
   * ```typescript
   * const factory = new DatabaseRouterFactory('users');
   * ```
   */
  constructor(prefix: string) {
    this.router = express.Router();
    this.prefix = prefix;
    this.setupMiddleware();
  }

  /**
   * Setup automatic database initialization middleware
   */
  private setupMiddleware(): void {
    // Ensure database is initialized before any handler
    this.router.use(async (req: Request, res: Response, next: NextFunction) => {
      try {
        await this.dbManager.initialize();
        next();
      } catch (error) {
        logger.error({ error, prefix: this.prefix }, "Database initialization failed");
        res.status(503).json({
          success: false,
          error: "Database service unavailable",
          prefix: this.prefix,
        });
      }
    });
  }

  /**
   * Wrap handler to inject database context
   */
  private wrapHandler(handler: DatabaseRouteHandler) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Create database context
        const dbContext: DatabaseContext = {
          db: {
            query: (sql, params) => this.dbManager.query(sql, params),
            queryOne: (sql, params) => this.dbManager.queryOne(sql, params),
            execute: (sql, params) => this.dbManager.execute(sql, params),
          },
          rawDb: this.dbManager.getDatabase(),
          prefix: this.prefix,
        };

        // Call handler with context
        await handler(req, res, dbContext, next);
      } catch (error) {
        logger.error(
          { error, prefix: this.prefix, url: req.url },
          "Route handler error",
        );
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Internal server error",
            prefix: this.prefix,
          });
        }
      }
    };
  }

  /**
   * Register GET handler
   */
  get(path: string, handler: DatabaseRouteHandler): this {
    this.router.get(path, this.wrapHandler(handler));
    logger.debug({ prefix: this.prefix, method: "GET", path }, "Registered route");
    return this;
  }

  /**
   * Register POST handler
   */
  post(path: string, handler: DatabaseRouteHandler): this {
    this.router.post(path, this.wrapHandler(handler));
    logger.debug({ prefix: this.prefix, method: "POST", path }, "Registered route");
    return this;
  }

  /**
   * Register PUT handler
   */
  put(path: string, handler: DatabaseRouteHandler): this {
    this.router.put(path, this.wrapHandler(handler));
    logger.debug({ prefix: this.prefix, method: "PUT", path }, "Registered route");
    return this;
  }

  /**
   * Register PATCH handler
   */
  patch(path: string, handler: DatabaseRouteHandler): this {
    this.router.patch(path, this.wrapHandler(handler));
    logger.debug({ prefix: this.prefix, method: "PATCH", path }, "Registered route");
    return this;
  }

  /**
   * Register DELETE handler
   */
  delete(path: string, handler: DatabaseRouteHandler): this {
    this.router.delete(path, this.wrapHandler(handler));
    logger.debug({ prefix: this.prefix, method: "DELETE", path }, "Registered route");
    return this;
  }

  /**
   * Register custom middleware
   */
  use(middleware: express.RequestHandler | express.ErrorRequestHandler): this {
    this.router.use(middleware);
    return this;
  }

  /**
   * Get the Express router
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Get database manager
   */
  getDbManager(): typeof DatabaseManager {
    return this.dbManager;
  }
}

export default DatabaseRouterFactory;
