// SPDX-License-Identifier: MIT

/**
 * PostgreSQL Type Definitions
 *
 * Type definitions for PostgreSQL (pg) package integration
 */

import type { Pool, PoolClient, QueryResult } from "pg";

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
export type PostgresQueryResult<T = unknown> = QueryResult<T>;

/**
 * PostgreSQL module for dynamic import
 */
export interface PostgresModule {
  Pool: typeof Pool;
  Client: typeof import("pg").Client;
}

/**
 * PostgreSQL query config object
 */
export interface PostgresQueryConfig {
  text: string;
  values?: unknown[];
}
