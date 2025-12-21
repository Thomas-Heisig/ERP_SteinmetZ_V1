// SPDX-License-Identifier: MIT
// apps/backend/src/routes/database/db.ts

/**
 * Database Export Module
 *
 * Provides clean unified interface for database operations with better-sqlite3.
 * Handles type-safe access to the database service instance used throughout
 * the application.
 *
 * @module database
 * @example
 * ```typescript
 * import db from './db.js';
 * import { getDatabase, isDatabaseInitialized } from './db.js';
 *
 * // Initialize database
 * await db.init();
 *
 * // Execute async queries
 * const users = await db.all('SELECT * FROM users');
 * const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
 *
 * // Access raw synchronous database for special cases
 * const rawDb = getDatabase();
 * const stmt = rawDb.prepare('SELECT * FROM users').all();
 * ```
 */

import db from "./dbService.js";
import type Database from "better-sqlite3";

/**
 * Database service interface for type safety
 * Ensures dbService has the expected structure with api property
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
 * Get the raw better-sqlite3 database instance
 * for direct synchronous operations (used by specialized services)
 *
 * @returns The initialized better-sqlite3 database instance
 * @throws {Error} If database is not initialized
 *
 * @example
 * ```typescript
 * import { getDatabase } from './db.js';
 *
 * const rawDb = getDatabase();
 * const users = rawDb.prepare('SELECT * FROM users').all();
 * ```
 */
export function getDatabase(): Database.Database {
  // Type-safe access to the internal SQLite instance
  const dbService = db as unknown as DatabaseService;

  if (dbService?.api?.db) {
    return dbService.api.db;
  }

  throw new Error(
    "Database not initialized. Call db.init() before accessing raw database instance.",
  );
}

/**
 * Checks if the database is initialized and ready for use
 *
 * @returns true if database is ready, false otherwise
 *
 * @example
 * ```typescript
 * import { isDatabaseInitialized } from './db.js';
 *
 * if (isDatabaseInitialized()) {
 *   const rawDb = getDatabase();
 * }
 * ```
 */
export function isDatabaseInitialized(): boolean {
  try {
    const dbService = db as unknown as DatabaseService;
    return dbService?.api?.db !== undefined;
  } catch {
    return false;
  }
}

// Re-export the main database service for async operations
export default db;
