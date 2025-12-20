// SPDX-License-Identifier: MIT

/**
 * PostgreSQL Type Definitions (Deprecated)
 *
 * @deprecated Use database.ts for unified type definitions instead.
 * This file is kept for backward compatibility only.
 *
 * All PostgreSQL types have been consolidated into database.ts for better
 * organization and to reduce duplicate type definitions across the module.
 */

// Re-export from consolidated types module for backward compatibility
export type {
  PostgresPool,
  PostgresClient,
  PostgresQueryResult,
  PostgresQueryConfig,
  PostgresModule,
} from "./database.js";
