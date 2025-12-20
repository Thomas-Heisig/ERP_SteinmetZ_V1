// SPDX-License-Identifier: MIT

/**
 * Unified Database Type Definitions
 *
 * Comprehensive type definitions for database operations across SQLite and PostgreSQL,
 * replacing `any` types with proper type safety throughout the database service layer.
 *
 * @module database/types
 */

import type Database from "better-sqlite3";
import type { Pool, PoolClient, QueryResult as PgQueryResult } from "pg";

/* -------------------------------------------------------------------------- */
/*                         BETTER-SQLITE3 TYPES                               */
/* -------------------------------------------------------------------------- */

/**
 * better-sqlite3 Database instance type
 */
export type BetterSqlite3Database = Database.Database;

/**
 * better-sqlite3 Statement type
 */
export type BetterSqlite3Statement<
  T extends Record<string, unknown> | unknown[] = Record<string, unknown>,
> = Database.Statement<T>;

/**
 * better-sqlite3 RunResult type
 */
export interface RunResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

/**
 * Database column information from PRAGMA table_info
 */
export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

/**
 * Module for better-sqlite3 dynamic import
 */
export interface BetterSqlite3Module {
  default: typeof Database;
}

/* -------------------------------------------------------------------------- */
/*                         SQL QUERY PARAMETERS                               */
/* -------------------------------------------------------------------------- */

/**
 * Valid SQL parameter types
 * Includes support for JSON objects and arrays (PostgreSQL JSONB, SQLite JSON)
 */
export type SqlValue =
  | string
  | number
  | bigint
  | boolean
  | null
  | Buffer
  | Record<string, unknown> // JSON objects
  | unknown[]; // JSON arrays

/**
 * SQL parameter array
 */
export type SqlParams = SqlValue[];

/**
 * SQL parameter object (named parameters)
 */
export type SqlParamsObject = Record<string, SqlValue>;

/**
 * Combined SQL parameters type
 */
export type SqlParameters = SqlParams | SqlParamsObject | undefined;

/* -------------------------------------------------------------------------- */
/*                         RAW DATA TYPES                                     */
/* -------------------------------------------------------------------------- */

/**
 * Raw data structure that needs validation/correction
 */
export interface RawNodeData {
  kind?: string;
  path?: string | string[];
  children?: unknown[];
  weight?: number;
  icon?: string;
  [key: string]: unknown;
}

/**
 * Corrected node data structure
 */
export interface CorrectedNodeData {
  kind: string;
  path: string[];
  children: unknown[];
  weight: number;
  icon: string;
  [key: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/*                         ERROR TYPES                                        */
/* -------------------------------------------------------------------------- */

/**
 * Original error from database driver
 */
export interface DatabaseErrorOriginal {
  code?: string;
  errno?: number;
  message?: string;
  [key: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/*                         QUERY RESULT TYPES                                 */
/* -------------------------------------------------------------------------- */

/**
 * Generic database row (when structure is unknown)
 */
export type UnknownRow = Record<string, unknown>;

/**
 * Database query result for SELECT statements
 */
export type QueryResult<T = UnknownRow> = T[];

/**
 * Database query result for single row SELECT
 */
export type QuerySingleResult<T = UnknownRow> = T | undefined;

/**
 * Database mutation result (INSERT, UPDATE, DELETE)
 */
export interface MutationResult {
  changes?: number;
  lastID?: number;
  lastInsertRowid?: number | bigint;
}

/* -------------------------------------------------------------------------- */
/*                         GENERIC HELPERS                                    */
/* -------------------------------------------------------------------------- */

/**
 * Type guard to check if value is a valid SQL value
 */
export function isSqlValue(value: unknown): value is SqlValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint" ||
    typeof value === "boolean" ||
    value === null ||
    Buffer.isBuffer(value)
  );
}

/**
 * Type guard to check if error is DatabaseErrorOriginal
 */
export function isDatabaseError(
  error: unknown,
): error is DatabaseErrorOriginal {
  return (
    typeof error === "object" &&
    error !== null &&
    ("code" in error || "errno" in error)
  );
}

/* -------------------------------------------------------------------------- */
/*                         POSTGRESQL TYPES                                   */
/* -------------------------------------------------------------------------- */

/**
 * PostgreSQL Pool type
 */
export type PostgresPool = Pool;

/**
 * PostgreSQL Client type
 */
export type PostgresClient = PoolClient;

/**
 * PostgreSQL query result type
 */
export type PostgresQueryResult<T extends Record<string, unknown> = Record<string, unknown>> = PgQueryResult<T>;

/**
 * PostgreSQL query config object
 */
export interface PostgresQueryConfig {
  text: string;
  values?: unknown[];
}

/**
 * PostgreSQL module for dynamic import
 */
export interface PostgresModule {
  Pool: typeof Pool;
  Client: typeof import("pg").Client;
}

/* -------------------------------------------------------------------------- */
/*                         DATABASE DRIVER                                    */
/* -------------------------------------------------------------------------- */

/**
 * Database driver type
 */
export type DatabaseDriver = "sqlite" | "postgres";

