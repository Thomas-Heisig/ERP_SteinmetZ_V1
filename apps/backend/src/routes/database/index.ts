// SPDX-License-Identifier: MIT

/**
 * Database Module - Unified Exports
 *
 * Central export point for all database operations, types, and utilities.
 * Provides clean API for database access throughout the application.
 *
 * @module database
 * @example
 * ```typescript
 * import db, { getDatabase, isDatabaseInitialized } from './database/index.js';
 * import type { BetterSqlite3Database, SqlValue } from './database/index.js';
 *
 * // Initialize database
 * await db.init();
 *
 * // Use async API
 * const users = await db.all('SELECT * FROM users');
 *
 * // Or use raw synchronous API when needed
 * if (isDatabaseInitialized()) {
 *   const rawDb = getDatabase();
 *   const result = rawDb.prepare('SELECT * FROM users').all();
 * }
 * ```
 */

// ============================================================================
// Main Database Service
// ============================================================================

export { default } from "./db.js";
export { default as db } from "./db.js";

// ============================================================================
// Database Manager (Singleton with Lazy Init)
// ============================================================================

export { default as DatabaseManager } from "./DatabaseManager.js";

// ============================================================================
// Database Router Factory
// ============================================================================

export { DatabaseRouterFactory } from "./DatabaseRouterFactory.js";
export type {
  DatabaseContext,
  DatabaseRouteHandler,
} from "./DatabaseRouterFactory.js";

// ============================================================================
// Database Utility Functions
// ============================================================================

export { getDatabase, isDatabaseInitialized } from "./db.js";

// ============================================================================
// Database Utilities & Helpers
// ============================================================================

export {
  parsePagination,
  createPaginatedResult,
  buildWhereClause,
  buildOrderBy,
  buildSelectQuery,
  safeIdentifier,
  formatDatabaseError,
  retryOperation,
  batchOperations,
  transactionPattern,
} from "./utils.js";

export type { PaginationOptions, PaginatedResult } from "./utils.js";

// ============================================================================
// Type Definitions - SQLite
// ============================================================================

export type {
  BetterSqlite3Database,
  BetterSqlite3Statement,
  BetterSqlite3Module,
  RunResult,
  ColumnInfo,
} from "./database.js";

// ============================================================================
// Type Definitions - Query Operations
// ============================================================================

export type {
  SqlValue,
  SqlParams,
  SqlParamsObject,
  SqlParameters,
  QueryResult,
  QuerySingleResult,
  MutationResult,
  UnknownRow,
} from "./database.js";

// ============================================================================
// Type Definitions - Data Models
// ============================================================================

export type { RawNodeData, CorrectedNodeData } from "./database.js";

// ============================================================================
// Type Definitions - Error Handling
// ============================================================================

export type { DatabaseErrorOriginal } from "./database.js";
export { isDatabaseError } from "./database.js";

// ============================================================================
// Type Definitions - PostgreSQL (for future support)
// ============================================================================

export type {
  PostgresPool,
  PostgresClient,
  PostgresQueryResult,
  PostgresQueryConfig,
  PostgresModule,
} from "./database.js";

// ============================================================================
// Type Definitions - Configuration
// ============================================================================

export type { DatabaseDriver } from "./database.js";

// ============================================================================
// Helper Functions
// ============================================================================

export { isSqlValue } from "./database.js";
