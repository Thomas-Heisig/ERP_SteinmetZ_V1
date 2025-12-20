// SPDX-License-Identifier: MIT
// apps/backend/src/types/database.ts

/**
 * Zentrale Datenbanktypen und Schemas
 *
 * Umfassende Typendefinitionen für alle Datenbankoperationen,
 * einschließlich SQLite und PostgreSQL Unterstützung.
 *
 * @module types/database
 */

import { z } from "zod";
import type Database from "better-sqlite3";

/* ============================================================================
 * ZODB-SCHEMAS FÜR VALIDIERUNG
 * ============================================================================ */

/**
 * Schema für Datenbankverbindungskonfiguration
 */
export const DatabaseConfigSchema = z.object({
  driver: z.enum(["sqlite", "postgres"]).default("sqlite"),
  sqliteFile: z.string().optional(),
  postgresUrl: z.string().optional(),
  maxConnections: z.number().int().positive().default(10),
  timeout: z.number().int().positive().default(5000),
  enableWAL: z.boolean().default(true),
  retryAttempts: z.number().int().nonnegative().default(3),
  logging: z.boolean().default(false),
});

/**
 * Abgeleiteter Typ aus Zod-Schema
 */
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

/**
 * Schema für Abfrageparameter
 */
export const QueryParamsSchema = z.union([
  z.array(z.unknown()),
  z.record(z.string(), z.unknown()),
  z.undefined(),
]);

export type QueryParams = z.infer<typeof QueryParamsSchema>;

/**
 * Schema für Abfrageergebnisse
 */
export const QueryResultSchema = z.array(z.record(z.string(), z.unknown()));

export type QueryResult<T = unknown> = T[];

/* ============================================================================
 * BETTER-SQLITE3 TYPEN
 * ============================================================================ */

/**
 * Better-SQLite3 Datenbank-Instanztyp
 */
export type BetterSqlite3Database = Database.Database;

/**
 * Better-SQLite3 Statement-Typ
 */
export type BetterSqlite3Statement<
  T extends Record<string, unknown> | unknown[] = Record<string, unknown>,
> = Database.Statement<T>;

/**
 * Better-SQLite3 RunResult Typ
 *
 * @property changes - Anzahl der geänderten Zeilen
 * @property lastInsertRowid - ID der zuletzt eingefügten Zeile
 */
export interface RunResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

/**
 * Spalteninformationen aus PRAGMA table_info
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
 * Better-SQLite3 Modul für dynamische Importe
 */
export interface BetterSqlite3Module {
  default: typeof Database;
}

/* ============================================================================
 * SQL PARAMETER TYPEN
 * ============================================================================ */

/**
 * Gültige SQL-Parameterwerte
 *
 * Unterstützt:
 * - Primitive Typen (string, number, boolean, null)
 * - Binary Data (Buffer)
 * - JSON-Objekte und Arrays
 */
export type SqlValue =
  | string
  | number
  | bigint
  | boolean
  | null
  | Buffer
  | Record<string, unknown>
  | unknown[];

/**
 * SQL-Parameterarray
 */
export type SqlParams = SqlValue[];

/**
 * Benannte SQL-Parameter
 */
export type SqlParamsObject = Record<string, SqlValue>;

/**
 * Kombinierte SQL-Parameterstypen
 */
export type SqlParameters = SqlParams | SqlParamsObject | undefined;

/* ============================================================================
 * ABFRAGEERGEBNIS TYPEN
 * ============================================================================ */

/**
 * Generische Datenbankzeile (unbekannte Struktur)
 */
export type UnknownRow = Record<string, unknown>;

/**
 * Abfrageergebnis für SELECT-Statements
 */
export type QuerySingleResult<T = UnknownRow> = T | undefined;

/**
 * Mutationsergebnis für INSERT, UPDATE, DELETE
 */
export interface MutationResult {
  changes?: number;
  lastID?: number;
  lastInsertRowid?: number | bigint;
}

/* ============================================================================
 * ROHDATEN UND KORREKTIONSTYPEN
 * ============================================================================ */

/**
 * Rohdaten-Struktur, die Validierung benötigt
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
 * Korrigierte Knotenstruktur
 */
export interface CorrectedNodeData {
  kind: string;
  path: string[];
  children: unknown[];
  weight: number;
  icon: string;
  [key: string]: unknown;
}

/* ============================================================================
 * FEHLERTYPEN
 * ============================================================================ */

/**
 * Ursprünglicher Fehler aus Datenbanktreiber
 */
export interface DatabaseErrorOriginal {
  code?: string;
  errno?: number;
  message?: string;
  [key: string]: unknown;
}

/**
 * Schema für Fehlerantwort
 */
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().datetime(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

/* ============================================================================
 * ERFOLGREICHE ABFRAGE-RESPONSE
 * ============================================================================ */

/**
 * Schema für erfolgreiche Abfrage-Response
 */
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  count: z.number().int().nonnegative().optional(),
  timestamp: z.string().datetime(),
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

/**
 * Kombinierte Response-Type
 */
export type ApiResponse<T = unknown> =
  | (SuccessResponse & { data: T })
  | ErrorResponse;

/* ============================================================================
 * DATENBANK-HEALTH CHECK
 * ============================================================================ */

/**
 * Datenbankgesundheitsstatus
 */
export interface HealthStatus {
  /** Gesamtstatus */
  status: "healthy" | "degraded" | "unhealthy";
  /** Verwendeter Datenbanktreiber */
  driver: "sqlite" | "postgres";
  /** Verbindungslatenzen in Millisekunden */
  latency?: number;
  /** Fehlermeldung falls unhealthy */
  error?: string;
  /** Zusätzliche Diagnose-Details */
  details?: Record<string, unknown>;
}

/**
 * Schema für Health Check
 */
export const HealthStatusSchema = z.object({
  status: z.enum(["healthy", "degraded", "unhealthy"]),
  driver: z.enum(["sqlite", "postgres"]),
  latency: z.number().optional(),
  error: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

/* ============================================================================
 * ABFRAGESTATISTIKEN
 * ============================================================================ */

/**
 * Abfrage-Performance-Tracking
 */
export interface QueryStats {
  /** SQL-Abfrage */
  query: string;
  /** Anzahl Parameter */
  paramCount: number;
  /** Ausführungszeit in Millisekunden */
  duration: number;
  /** Erfolg-Status */
  success: boolean;
  /** Fehlermeldung falls fehlgeschlagen */
  error?: string;
  /** Zeitstempel der Ausführung */
  timestamp: string;
}

/**
 * Schema für Abfragestatistiken
 */
export const QueryStatsSchema = z.object({
  query: z.string(),
  paramCount: z.number().int().nonnegative(),
  duration: z.number().nonnegative(),
  success: z.boolean(),
  error: z.string().optional(),
  timestamp: z.string().datetime(),
});

/* ============================================================================
 * TRANSAKTIONS-TYPEN
 * ============================================================================ */

/**
 * Transaktionsergebnis
 */
export interface TransactionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Transaktions-Callback-Typ
 */
export type TransactionCallback<T = unknown> = () => Promise<T>;

/* ============================================================================
 * MIGRATION TYPEN
 * ============================================================================ */

/**
 * Migrations-Datei-Metadaten
 */
export interface MigrationFile {
  name: string;
  path: string;
  content: string;
  checksum: string;
  executedAt?: string;
}

/**
 * Migrations-Ergebnis
 */
export interface MigrationResult {
  name: string;
  status: "success" | "skipped" | "error";
  error?: string;
  duration: number;
}

/* ============================================================================
 * TYPE GUARDS
 * ============================================================================ */

/**
 * Prüft ob ein Wert ein gültiger SQL-Wert ist
 */
export function isSqlValue(value: unknown): value is SqlValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint" ||
    typeof value === "boolean" ||
    value === null ||
    Buffer.isBuffer(value) ||
    (typeof value === "object" && value !== null)
  );
}

/**
 * Prüft ob ein Fehler ein DatabaseErrorOriginal ist
 */
export function isDatabaseError(
  error: unknown,
): error is DatabaseErrorOriginal {
  return (
    typeof error === "object" &&
    error !== null &&
    ("code" in error || "errno" in error || "message" in error)
  );
}

/**
 * Prüft ob ein Wert ein UnknownRow ist
 */
export function isUnknownRow(value: unknown): value is UnknownRow {
  return typeof value === "object" && value !== null;
}

/**
 * Prüft ob ein Wert ein MutationResult ist
 */
export function isMutationResult(value: unknown): value is MutationResult {
  return (
    typeof value === "object" &&
    value !== null &&
    ("changes" in value || "lastID" in value)
  );
}

/* ============================================================================
 * POSTGRESQL SPEZIFISCHE TYPEN
 * ============================================================================ */

/**
 * PostgreSQL Connection Pool Typ
 */
export interface PostgresPool {
  query<T = unknown>(
    query: PostgresQueryConfig,
  ): Promise<PostgresQueryResult<T>>;
  end(): Promise<void>;
}

/**
 * PostgreSQL Client Typ
 */
export interface PostgresClient {
  query<T = unknown>(
    query: PostgresQueryConfig,
  ): Promise<PostgresQueryResult<T>>;
  release(): void;
}

/**
 * PostgreSQL Query Result Typ
 */
export interface PostgresQueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  command: string;
}

/**
 * PostgreSQL Query Config
 */
export interface PostgresQueryConfig {
  text: string;
  values?: unknown[];
}
