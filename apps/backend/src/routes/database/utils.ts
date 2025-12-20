// SPDX-License-Identifier: MIT

/**
 * Database Utilities - Helper Functions
 *
 * Collection of utility functions for common database operations,
 * pagination, filtering, and data transformation.
 *
 * @module database/utils
 */

import type { Request } from "express";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("db-utils");

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Pagination result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Parse pagination from request query
 *
 * @param req - Express request
 * @param defaults - Default pagination values
 * @returns Pagination options
 *
 * @example
 * ```typescript
 * const { page, limit, offset } = parsePagination(req, { page: 1, limit: 10 });
 * ```
 */
export function parsePagination(
  req: Request,
  defaults: { page?: number; limit?: number } = {},
): PaginationOptions {
  const page = Math.max(1, Number(req.query.page) || defaults.page || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || defaults.limit || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Create paginated response
 *
 * @param data - Result rows
 * @param total - Total count
 * @param page - Current page
 * @param limit - Items per page
 * @returns Paginated result
 *
 * @example
 * ```typescript
 * const total = await db.queryOne('SELECT COUNT(*) as count FROM users');
 * const data = await db.query('SELECT * FROM users LIMIT ? OFFSET ?', [10, 0]);
 * return createPaginatedResult(data, total?.count || 0, 1, 10);
 * ```
 */
export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const pages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
}

/**
 * Build WHERE clause from filters
 *
 * @param filters - Filter object
 * @returns { whereClause, params }
 *
 * @example
 * ```typescript
 * const { where, params } = buildWhereClause({ status: 'active', role: 'admin' });
 * // where = "status = ? AND role = ?"
 * // params = ['active', 'admin']
 * ```
 */
export function buildWhereClause(
  filters: Record<string, unknown>,
): { where: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      conditions.push(`${key} = ?`);
      params.push(value);
    }
  }

  return {
    where: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

/**
 * Build ORDER BY clause
 *
 * @param sortBy - Sort column
 * @param order - ASC or DESC
 * @returns ORDER BY clause
 *
 * @example
 * ```typescript
 * const orderBy = buildOrderBy('created_at', 'DESC');
 * // "ORDER BY created_at DESC"
 * ```
 */
export function buildOrderBy(sortBy: string, order: "ASC" | "DESC" = "ASC"): string {
  if (!sortBy || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(sortBy)) {
    logger.warn({ sortBy }, "Invalid sort column, using default");
    return "ORDER BY created_at DESC";
  }

  return `ORDER BY ${sortBy} ${order}`;
}

/**
 * Build complete query with pagination
 *
 * @param table - Table name
 * @param where - WHERE clause (optional)
 * @param limit - Limit
 * @param offset - Offset
 * @param orderBy - ORDER BY clause (optional)
 * @returns Complete SELECT query
 *
 * @example
 * ```typescript
 * const query = buildSelectQuery(
 *   'users',
 *   'WHERE status = ?',
 *   10,
 *   0,
 *   'ORDER BY created_at DESC'
 * );
 * // SELECT * FROM users WHERE status = ? ORDER BY created_at DESC LIMIT 10 OFFSET 0
 * ```
 */
export function buildSelectQuery(
  table: string,
  where: string = "",
  limit: number = 10,
  offset: number = 0,
  orderBy: string = "",
): string {
  const parts = [
    `SELECT * FROM ${table}`,
    where && where.trim(),
    orderBy && orderBy.trim(),
    `LIMIT ${limit}`,
    `OFFSET ${offset}`,
  ].filter(Boolean);

  return parts.join(" ");
}

/**
 * Safe table name (prevent SQL injection)
 *
 * @param name - Table or column name
 * @returns Safe name
 */
export function safeIdentifier(name: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`Invalid identifier: ${name}`);
  }
  return name;
}

/**
 * Format database error for API response
 *
 * @param error - Database error
 * @returns Formatted error object
 */
export function formatDatabaseError(error: unknown): { error: string; details?: string } {
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes("UNIQUE constraint failed")) {
      return {
        error: "Duplicate entry",
        details: "This record already exists",
      };
    }

    if (error.message.includes("FOREIGN KEY constraint failed")) {
      return {
        error: "Invalid reference",
        details: "Referenced record does not exist",
      };
    }

    if (error.message.includes("NOT NULL constraint failed")) {
      return {
        error: "Missing required field",
        details: error.message,
      };
    }

    return {
      error: error.message,
    };
  }

  return {
    error: "Unknown database error",
  };
}

/**
 * Retry database operation with exponential backoff
 *
 * @param operation - Async operation
 * @param maxRetries - Maximum retries
 * @param initialDelay - Initial delay in ms
 * @returns Result of operation
 *
 * @example
 * ```typescript
 * const result = await retryOperation(
 *   () => db.queryOne('SELECT * FROM users WHERE id = ?', [userId]),
 *   3,
 *   100
 * );
 * ```
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 100,
): Promise<T> {
  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        logger.debug(
          { attempt, delay, error: lastError.message },
          "Operation failed, retrying",
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw lastError || new Error("Operation failed after retries");
}

/**
 * Batch database operations
 *
 * @param operations - Array of operations
 * @param batchSize - Operations per batch
 * @returns Results in order
 *
 * @example
 * ```typescript
 * const users = ['alice', 'bob', 'charlie'];
 * const results = await batchOperations(
 *   users.map(name => () => db.execute('INSERT INTO users VALUES (?)', [name])),
 *   2 // Process 2 at a time
 * );
 * ```
 */
export async function batchOperations<T>(
  operations: Array<() => Promise<T>>,
  batchSize: number = 10,
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((op) => op()));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Transaction-like pattern for multiple operations
 *
 * @param operations - Array of operations
 * @param onError - Error handler (for rollback simulation)
 * @returns Results
 *
 * @example
 * ```typescript
 * const results = await transactionPattern([
 *   () => db.execute('INSERT INTO users VALUES (?, ?)', ['alice', 'alice@example.com']),
 *   () => db.execute('INSERT INTO users VALUES (?, ?)', ['bob', 'bob@example.com']),
 * ]);
 * ```
 */
export async function transactionPattern<T>(
  operations: Array<() => Promise<T>>,
  onError?: (error: Error, completedCount: number) => Promise<void>,
): Promise<T[]> {
  const results: T[] = [];

  try {
    for (let i = 0; i < operations.length; i++) {
      results.push(await operations[i]());
    }
  } catch (error) {
    if (onError && error instanceof Error) {
      await onError(error, results.length);
    }
    throw error;
  }

  return results;
}
