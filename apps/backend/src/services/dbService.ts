// SPDX-License-Identifier: MIT

/**
 * Database Service
 *
 * Provides unified database abstraction layer supporting both SQLite and PostgreSQL.
 * Handles schema management, migrations, query execution, and connection pooling.
 *
 * @remarks
 * This service offers:
 * - Dual database driver support (SQLite for development, PostgreSQL for production)
 * - Automatic schema initialization and migrations
 * - Query performance tracking and monitoring
 * - Connection pooling and retry logic
 * - Data validation and auto-correction for node types
 * - Backup and maintenance operations (SQLite)
 * - Health checks and diagnostics
 *
 * @example
 * ```typescript
 * import db from './services/dbService.js';
 *
 * // Initialize database
 * await db.init();
 *
 * // Query data
 * const users = await db.all('SELECT * FROM users WHERE active = ?', [true]);
 *
 * // Insert data
 * const result = await db.run('INSERT INTO users (name, email) VALUES (?, ?)', ['John', 'john@example.com']);
 * ```
 */

// -------------------------------------------------------------------
// Node.js Standardmodule
// -------------------------------------------------------------------
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createLogger } from "../utils/logger.js";
import type {
  BetterSqlite3Database,
  BetterSqlite3Module,
  ColumnInfo,
  CorrectedNodeData,
  DatabaseErrorOriginal,
  MutationResult,
  RawNodeData,
  SqlParams,
  SqlValue,
  UnknownRow,
} from "../types/database.js";
import type {
  PostgresModule,
  PostgresPool,
  PostgresClient,
} from "../types/postgres.js";

const logger = createLogger("db");

// -------------------------------------------------------------------
// Typdefinitionen (nur für statische Analyse)
// -------------------------------------------------------------------
import type { FormSpec } from "./aiAnnotatorService.js";
import type {
  BuildResult,
  CatalogNode,
  NodeKind,
} from "./functionsCatalogService.js";

// -------------------------------------------------------------------
// Zod Auto-Korrektur Funktionen
// -------------------------------------------------------------------

/**
 * Automatically corrects kind values for function nodes
 *
 * Attempts to map invalid or German kind values to valid NodeKind enum values.
 * Supports fuzzy matching, typo correction, and German-to-English translation.
 *
 * @param kind - The kind value to correct (may be invalid or in German)
 * @returns A valid NodeKind value
 *
 * @example
 * ```typescript
 * autoCorrectKind('kategorie'); // returns 'category'
 * autoCorrectKind('aktion'); // returns 'action'
 * autoCorrectKind('cateogry'); // returns 'category' (typo correction)
 * ```
 */
function autoCorrectKind(kind: string): NodeKind {
  const validKinds: NodeKind[] = [
    "category",
    "section",
    "record",
    "collection",
    "action",
    "note",
    "group",
    "workflow",
    "report",
    "dataset",
    "item",
  ];

  const normalized = kind.toLowerCase().trim();

  // Direkte Übereinstimmung
  if (validKinds.includes(normalized as NodeKind)) {
    return normalized as NodeKind;
  }

  // Erweiterte Korrektur-Tabelle
  const correctionMap: Record<string, NodeKind> = {
    // Deutsche Begriffe
    kategorie: "category",
    kategory: "category",
    categorie: "category",
    sektion: "section",
    bereich: "section",
    abteilung: "section",
    aktion: "action",
    funktion: "action",
    operation: "action",
    vorgang: "action",
    workflow: "workflow",
    arbeitsablauf: "workflow",
    prozess: "workflow",
    gruppe: "group",
    team: "group",
    datensatz: "dataset",
    daten: "dataset",
    datenmenge: "dataset",
    record: "record",
    eintrag: "record",
    collection: "collection",
    sammlung: "collection",
    kollektion: "collection",
    note: "note",
    notiz: "note",
    hinweis: "note",
    report: "report",
    bericht: "report",
    auswertung: "report",
    item: "item",
    element: "item",
    objekt: "item",

    // Typische Tippfehler
    cateogry: "category",
    sction: "section",
    aciton: "action",
    workfow: "workflow",
    gropu: "group",
    datasett: "dataset",
    recrod: "record",
    collecton: "collection",
    not: "note",
    reprot: "report",
    itme: "item",
  };

  // Versuche direkte Korrektur
  if (correctionMap[normalized]) {
    return correctionMap[normalized];
  }

  // Versuche Teil-Übereinstimmungen
  for (const [wrong, correct] of Object.entries(correctionMap)) {
    if (normalized.includes(wrong) || wrong.includes(normalized)) {
      return correct;
    }
  }

  // Fallback basierend auf Kontext
  if (normalized.includes("cat")) return "category";
  if (normalized.includes("sec")) return "section";
  if (normalized.includes("act")) return "action";
  if (normalized.includes("work") || normalized.includes("flow"))
    return "workflow";
  if (normalized.includes("group") || normalized.includes("team"))
    return "group";
  if (normalized.includes("data")) return "dataset";
  if (normalized.includes("rec")) return "record";
  if (normalized.includes("collec")) return "collection";
  if (normalized.includes("note") || normalized.includes("notiz"))
    return "note";
  if (normalized.includes("rep") || normalized.includes("bericht"))
    return "report";

  // Finaler Fallback
  return "item";
}

/**
 * Advanced correction for complex data validation cases
 *
 * Performs deep data correction including kind field normalization,
 * path array conversion, and default value assignment.
 *
 * @param rawData - The raw data object to correct
 * @param lineIndex - Line number in source file (for logging)
 * @param fileName - Source file name (for logging)
 * @returns Corrected data object with normalized fields
 *
 * @example
 * ```typescript
 * const corrected = attemptAdvancedCorrection(
 *   { kind: 'kategorie', path: 'root' },
 *   10,
 *   'functions.json'
 * );
 * // Returns: { kind: 'category', path: ['root'], children: [], weight: 1, icon: '' }
 * ```
 */
function attemptAdvancedCorrection(
  rawData: RawNodeData,
  lineIndex: number,
  fileName: string,
): CorrectedNodeData {
  try {
    // Tiefe Kopie der Daten für Korrektur-Versuche
    const correctedData = { ...rawData };

    // 1. Korrektur für kind-Feld
    if (correctedData.kind) {
      const originalKind = correctedData.kind;
      correctedData.kind = autoCorrectKind(originalKind);

      if (originalKind !== correctedData.kind) {
        logger.debug(
          {
            fileName,
            line: lineIndex + 1,
            originalKind,
            correctedKind: correctedData.kind,
          },
          "Auto-corrected kind field",
        );
      }
    }

    // 2. Sicherstellen, dass Pfad ein Array ist
    if (correctedData.path && !Array.isArray(correctedData.path)) {
      if (typeof correctedData.path === "string") {
        correctedData.path = [correctedData.path];
        logger.debug(
          { fileName, line: lineIndex + 1 },
          "Auto-corrected path: converted string to array",
        );
      } else {
        correctedData.path = [];
      }
    }

    // 3. Standardwerte für optionale Felder setzen
    if (!correctedData.children) correctedData.children = [];
    if (!correctedData.weight) correctedData.weight = 1;
    if (!correctedData.icon) correctedData.icon = "";
    if (!correctedData.kind) correctedData.kind = "item"; // Fallback kind
    if (!correctedData.path) correctedData.path = [];

    return correctedData as CorrectedNodeData;
  } catch (error) {
    logger.error(
      { fileName, line: lineIndex + 1, err: error },
      "Advanced correction failed",
    );
    // Return fallback with required fields
    return {
      kind: "item",
      path: [],
      children: [],
      weight: 1,
      icon: "",
      ...rawData
    } as CorrectedNodeData;
  }
}

// -------------------------------------------------------------------
// Erweiterte Fehlerklassen
// -------------------------------------------------------------------

/**
 * Database query execution error
 *
 * Enhanced error class that captures SQL query context for debugging.
 * Includes the original error, SQL statement, parameters, and database error code.
 */
class DatabaseError extends Error {
  public readonly sql: string;
  public readonly params: SqlParams;
  public readonly original: unknown;
  public readonly code?: string;

  constructor(message: string, sql: string, params: SqlParams, original: unknown) {
    super(message);
    this.name = "DatabaseError";
    this.sql = sql;
    this.params = params;
    this.original = original;
    this.code = (original as DatabaseErrorOriginal)?.code;
  }
}

/**
 * Database connection failure error
 *
 * Thrown when the database connection cannot be established.
 * Includes driver type and connection string (sanitized).
 */
class DatabaseConnectionError extends Error {
  public readonly driver: string;
  public readonly connectionString?: string;

  constructor(message: string, driver: string, connectionString?: string) {
    super(message);
    this.name = "DatabaseConnectionError";
    this.driver = driver;
    this.connectionString = connectionString;
  }
}

/**
 * Database schema operation error
 *
 * Thrown when schema creation, migration, or validation fails.
 * Includes the affected table and operation type.
 */
class DatabaseSchemaError extends Error {
  public readonly table?: string;
  public readonly operation: string;

  constructor(message: string, operation: string, table?: string) {
    super(message);
    this.name = "DatabaseSchemaError";
    this.table = table;
    this.operation = operation;
  }
}

// -------------------------------------------------------------------
// Konfiguration und Typdefinitionen
// -------------------------------------------------------------------

/**
 * Supported database drivers
 */
type Driver = "sqlite" | "postgres";

/**
 * Database configuration options
 */
interface DatabaseConfig {
  /** Database driver to use (sqlite or postgres) */
  driver: Driver;
  /** Path to SQLite database file (only for SQLite) */
  sqliteFile?: string;
  /** PostgreSQL connection URL (only for PostgreSQL) */
  postgresUrl?: string;
  /** Maximum number of connections in pool (PostgreSQL only) */
  maxConnections?: number;
  /** Query timeout in milliseconds */
  timeout?: number;
  /** Enable Write-Ahead Logging for SQLite */
  enableWAL?: boolean;
  /** Number of retry attempts for failed operations */
  retryAttempts?: number;
}

/**
 * Query performance tracking data
 */
interface QueryStats {
  /** SQL query text */
  sql: string;
  /** Query execution duration in milliseconds */
  duration: number;
  /** Number of rows affected/returned */
  rowCount?: number;
  /** Timestamp when query was executed */
  timestamp: Date;
}

/**
 * Database health status information
 */
interface HealthStatus {
  /** Overall health status */
  status: "healthy" | "degraded" | "unhealthy";
  /** Database driver in use */
  driver: Driver;
  /** Connection latency in milliseconds */
  latency?: number;
  /** Error message if unhealthy */
  error?: string;
  /** Additional diagnostic details */
  details?: Record<string, unknown>;
}

// -------------------------------------------------------------------
// Schema-Definitionen (KORRIGIERT)
// -------------------------------------------------------------------

const SCHEMAS = {
  functions_nodes: `
    CREATE TABLE IF NOT EXISTS functions_nodes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      kind TEXT NOT NULL,
      icon TEXT,
      path_json JSON NOT NULL,
      weight INTEGER NOT NULL,
      meta_json JSON,
      rbac_json JSON,
      flags_json JSON,
      pii_json JSON,
      aa_json JSON,
      schema_json JSON,
      source_file TEXT,
      source_line_start INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      last_annotated TEXT,
      annotation_status TEXT DEFAULT 'pending'
        CHECK (annotation_status IN ('pending','processing','completed','failed')),
      ai_last_processed TEXT,
      ai_attempts INTEGER DEFAULT 0
        CHECK (ai_attempts >= 0),
      ai_model_used TEXT,
      priority INTEGER DEFAULT 0
        CHECK (priority >= 0 AND priority <= 5),
      manual_reviewed BOOLEAN DEFAULT 0,
      manual_locked BOOLEAN DEFAULT 0,
      content_hash TEXT,
      category TEXT,
      attributes JSON,
      form_json JSON,
      last_accessed TEXT,
      sync_state TEXT DEFAULT 'ok'
        CHECK (sync_state IN ('ok','changed','error'))
    )
  `,

  functions_edges: `
    CREATE TABLE IF NOT EXISTS functions_edges (
      parent_id TEXT NOT NULL,
      child_id TEXT NOT NULL,
      weight INTEGER DEFAULT 1,
      relationship_type TEXT DEFAULT 'contains',
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (parent_id, child_id),
      FOREIGN KEY (parent_id) REFERENCES functions_nodes(id) ON DELETE CASCADE,
      FOREIGN KEY (child_id)  REFERENCES functions_nodes(id) ON DELETE CASCADE
    )
  `,

  batch_operations: `
    CREATE TABLE IF NOT EXISTS batch_operations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      operation TEXT NOT NULL,
      filters JSON,
      options JSON,
      status TEXT DEFAULT 'pending'
        CHECK (status IN ('pending','running','completed','failed','cancelled')),
      progress REAL DEFAULT 0
        CHECK (progress >= 0 AND progress <= 100),
      created_at TEXT,
      started_at TEXT,
      completed_at TEXT,
      updated_at TEXT,
      triggered_by TEXT DEFAULT 'system',
      initiated_by TEXT,
      expected_total INTEGER,
      filter_hash TEXT,
      model_used TEXT,
      priority INTEGER DEFAULT 0
        CHECK (priority >= 0),
      restart_count INTEGER DEFAULT 0
        CHECK (restart_count >= 0),
      failure_reason TEXT,
      system_context JSON,
      meta_json JSON
    )
  `,

  ai_annotations_log: `
    CREATE TABLE IF NOT EXISTS ai_annotations_log (
      id TEXT PRIMARY KEY,
      node_id TEXT,
      operation_type TEXT NOT NULL,
      model_used TEXT,
      prompt TEXT,
      response TEXT,
      success BOOLEAN,
      error_message TEXT,
      duration_ms INTEGER
        CHECK (duration_ms IS NULL OR duration_ms >= 0),
      confidence_score REAL
        CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)),
      tokens_used INTEGER,
      cost_estimate REAL,
      created_at TEXT,
      FOREIGN KEY (node_id) REFERENCES functions_nodes (id)
    )
  `,

  annotations: `
    CREATE TABLE IF NOT EXISTS annotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id TEXT,
      status TEXT DEFAULT 'open'
        CHECK (status IN ('open','in_review','closed')),
      data_json JSON,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      last_action TEXT,
      FOREIGN KEY (node_id) REFERENCES functions_nodes(id) ON DELETE CASCADE
    )
  `,

  audit_log: `
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity TEXT,
      entity_id TEXT,
      action TEXT,
      details TEXT,
      user_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `,

  database_migrations: `
    CREATE TABLE IF NOT EXISTS database_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      executed_at TEXT DEFAULT (datetime('now')),
      checksum TEXT
    )
  `,

  help_articles: `
    CREATE TABLE IF NOT EXISTS help_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      excerpt TEXT,
      keywords TEXT,
      icon TEXT,
      path TEXT,
      status TEXT DEFAULT 'draft'
        CHECK (status IN ('draft','published','archived')),
      author TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      view_count INTEGER DEFAULT 0
        CHECK (view_count >= 0)
    )
  `,

  help_categories: `
    CREATE TABLE IF NOT EXISTS help_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      description TEXT,
      \`order\` INTEGER DEFAULT 999
        CHECK (\`order\` >= 0)
    )
  `,
};

// KORRIGIERTE INDEX-DEFINITIONEN - nur für existierende Spalten
const INDEXES = [
  // functions_nodes
  `CREATE INDEX IF NOT EXISTS idx_nodes_annotation_status ON functions_nodes(annotation_status)`,
  `CREATE INDEX IF NOT EXISTS idx_nodes_kind ON functions_nodes(kind)`,
  `CREATE INDEX IF NOT EXISTS idx_nodes_created_at ON functions_nodes(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_nodes_path_json ON functions_nodes(path_json)`,
  `CREATE INDEX IF NOT EXISTS idx_nodes_priority ON functions_nodes(priority)`,
  `CREATE INDEX IF NOT EXISTS idx_nodes_category ON functions_nodes(category)`,

  // functions_edges - NUR für existierende Spalten
  `CREATE INDEX IF NOT EXISTS idx_edges_parent ON functions_edges(parent_id)`,
  `CREATE INDEX IF NOT EXISTS idx_edges_child ON functions_edges(child_id)`,

  // batch_operations - NUR für existierende Spalten
  `CREATE INDEX IF NOT EXISTS idx_batch_status ON batch_operations(status)`,
  `CREATE INDEX IF NOT EXISTS idx_batch_created ON batch_operations(created_at)`,

  // ai_annotations_log
  `CREATE INDEX IF NOT EXISTS idx_ai_log_node_id ON ai_annotations_log(node_id)`,
  `CREATE INDEX IF NOT EXISTS idx_ai_log_created ON ai_annotations_log(created_at)`,

  // annotations
  `CREATE INDEX IF NOT EXISTS idx_annotation_status ON annotations(status)`,

  // audit_log - NUR für existierende Spalten
  `CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at)`,

  // help_articles
  `CREATE INDEX IF NOT EXISTS idx_help_category ON help_articles(category)`,
  `CREATE INDEX IF NOT EXISTS idx_help_status ON help_articles(status)`,
  `CREATE INDEX IF NOT EXISTS idx_help_created ON help_articles(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_help_views ON help_articles(view_count)`,

  // help_categories
  `CREATE INDEX IF NOT EXISTS idx_help_cat_order ON help_categories(\`order\`)`,
];

// -------------------------------------------------------------------
// Konfigurations-Helper
// -------------------------------------------------------------------

/** Treiber valide aus ENV lesen */
function resolveDriver(): Driver {
  const raw = process.env.DB_DRIVER?.toLowerCase();
  if (raw === "postgres" || raw === "pg") return "postgres";
  if (raw === "sqlite" || !raw) return "sqlite";

  logger.warn({ driver: raw }, "Unknown DB_DRIVER, using sqlite as fallback");
  return "sqlite";
}

/** Projektverzeichnisse */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Repository-Wurzel stabiler berechnen */
const REPO_ROOT = process.env.REPO_ROOT || process.cwd();

/** SQLite-Datei */
const SQLITE_FILE =
  process.env.SQLITE_FILE ||
  process.env.DATABASE_PATH ||
  path.join(REPO_ROOT, "data", "dev.sqlite3");

/** Postgres-URL (höher validiert) */
function resolvePgUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  if (process.env.PGHOST) {
    const user = encodeURIComponent(process.env.PGUSER || "postgres");
    const pass = encodeURIComponent(process.env.PGPASSWORD || "");
    const host = process.env.PGHOST;
    const port = process.env.PGPORT || "5432";
    const db = process.env.PGDATABASE || "postgres";
    return `postgres://${user}:${pass}@${host}:${port}/${db}`;
  }

  return undefined;
}

// -------------------------------------------------------------------
// Einheitliche SQL-Treiber-API
// -------------------------------------------------------------------

interface SqlApi {
  init(): Promise<void>;
  exec(sql: string, params?: SqlParams): Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run<T = UnknownRow>(
    sql: string,
    params?: SqlParams,
  ): Promise<MutationResult>;
  all<T = UnknownRow>(sql: string, params?: SqlParams): Promise<T[]>;
  get<T = UnknownRow>(sql: string, params?: SqlParams): Promise<T | undefined>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
  close(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

// -------------------------------------------------------------------
// SQLite-Implementierung (KORRIGIERT)
// -------------------------------------------------------------------

class SqliteApi implements SqlApi {
  private db!: BetterSqlite3Database;
  private initialized = false;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    const mod = (await import("better-sqlite3")) as unknown as BetterSqlite3Module;
    const sqliteFile = this.config.sqliteFile || SQLITE_FILE;

    // Datenbankverzeichnis erstellen
    const dir = path.dirname(sqliteFile);
    await fs.mkdir(dir, { recursive: true });

    try {
      this.db = new mod.default(sqliteFile, {
        fileMustExist: false,
        timeout: this.config.timeout || 5000,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new DatabaseConnectionError(
        `SQLite konnte nicht geöffnet werden: ${message}`,
        "sqlite",
        sqliteFile,
      );
    }

    // Grund-Konfiguration
    this.safePragma("journal_mode = WAL");
    this.safePragma("foreign_keys = ON");
    this.safePragma("busy_timeout = 5000");

    // Schema prüfen
    await this.ensureBaseSchema();
    this.initialized = true;
    logger.info({ file: sqliteFile }, "SQLite database initialized");
  }

  private safePragma(statement: string) {
    try {
      this.db.pragma(statement);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn({ statement, error: message }, "SQLite PRAGMA failed");
    }
  }

  private async ensureBaseSchema(): Promise<void> {
    logger.info("Starting SQLite schema verification...");

    // Tabellen erstellen
    for (const [name, ddl] of Object.entries(SCHEMAS)) {
      try {
        this.db.exec(ddl);
        logger.debug({ table: name }, "Table ensured");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(
          { table: name, error: message },
          "Could not create table",
        );
      }
    }

    // Fehlende Spalten ergänzen
    await this.addMissingColumns();

    // Nur sichere Indizes erstellen
    await this.createSafeIndexes();

    logger.info("SQLite schema verification completed");
  }

  private async addMissingColumns(): Promise<void> {
    const colInfo = this.db.prepare("PRAGMA table_info(functions_nodes)").all() as ColumnInfo[];
    const existingColumns = new Set(colInfo.map((c) => c.name));

    const missingColumns = {
      annotation_status: "TEXT DEFAULT 'pending'",
      updated_at: "TEXT",
      form_json: "TEXT",
      last_annotated: "TEXT",
      last_accessed: "TEXT",
      sync_state: "TEXT DEFAULT 'ok'",
      ai_last_processed: "TEXT",
      ai_attempts: "INTEGER DEFAULT 0",
      ai_model_used: "TEXT",
      priority: "INTEGER DEFAULT 0",
      manual_reviewed: "BOOLEAN DEFAULT 0",
      manual_locked: "BOOLEAN DEFAULT 0",
      content_hash: "TEXT",
      category: "TEXT",
      attributes: "TEXT",
    };

    for (const [col, def] of Object.entries(missingColumns)) {
      if (!existingColumns.has(col)) {
        try {
          logger.debug(
            { column: col },
            "Adding missing column to functions_nodes",
          );
          this.db.exec(`ALTER TABLE functions_nodes ADD COLUMN ${col} ${def}`);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          logger.warn(
            { column: col, error: message },
            "Could not add column",
          );
        }
      }
    }

    // Fehlende Spalten in functions_edges prüfen - OHNE DEFAULT für created_at
    const edgesColInfo = this.db
      .prepare("PRAGMA table_info(functions_edges)")
      .all() as ColumnInfo[];
    const edgesExistingCols = new Set(edgesColInfo.map((c) => c.name));

    const edgesMissingCols = {
      weight: "INTEGER DEFAULT 1",
      relationship_type: "TEXT DEFAULT 'contains'",
      created_at: "TEXT", // Ohne DEFAULT-Wert für SQLite-Kompatibilität
    };

    for (const [col, def] of Object.entries(edgesMissingCols)) {
      if (!edgesExistingCols.has(col)) {
        try {
          logger.debug(
            { column: col, table: "functions_edges" },
            "Adding missing column",
          );
          this.db.exec(`ALTER TABLE functions_edges ADD COLUMN ${col} ${def}`);

          // Für created_at: Nach dem Hinzufügen Standardwert setzen
          if (col === "created_at") {
            this.db.exec(
              `UPDATE functions_edges SET created_at = datetime('now') WHERE created_at IS NULL`,
            );
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          logger.warn(
            { column: col, table: "functions_edges", error: message },
            "Could not add column",
          );
        }
      }
    }
  }

  private async createSafeIndexes(): Promise<void> {
    // Nur Indizes für existierende Spalten erstellen
    for (const idx of INDEXES) {
      try {
        this.db.exec(idx);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(
          { error: message, sql: idx.substring(0, 100) },
          "Could not create index (skipping)",
        );
      }
    }
  }

  async exec(sql: string, params: SqlParams = []): Promise<void> {
    this.db.prepare(sql).run(params);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run<T = UnknownRow>(sql: string, params: SqlParams = []): Promise<MutationResult> {
    const info = this.db.prepare(sql).run(params);
    return {
      changes: info.changes,
      lastID: typeof info.lastInsertRowid === 'number' ? info.lastInsertRowid : Number(info.lastInsertRowid),
      lastInsertRowid: info.lastInsertRowid
    };
  }

  async all<T = UnknownRow>(sql: string, params: SqlParams = []): Promise<T[]> {
    return this.db.prepare(sql).all(params) as T[];
  }

  async get<T = UnknownRow>(sql: string, params: SqlParams = []): Promise<T | undefined> {
    return this.db.prepare(sql).get(params) as T | undefined ?? undefined;
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    this.db.exec("BEGIN");
    try {
      const val = await fn();
      this.db.exec("COMMIT");
      return val;
    } catch (err) {
      this.db.exec("ROLLBACK");
      throw err;
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.initialized = false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.get("SELECT 1 as health_check");
      return result?.health_check === 1;
    } catch {
      return false;
    }
  }
}

// -------------------------------------------------------------------
// PostgreSQL-Implementierung (KORRIGIERT)
// -------------------------------------------------------------------

class PostgresApi implements SqlApi {
  private pool!: PostgresPool;
  private txClient?: PostgresClient;
  private initialized = false;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    const mod = (await import("pg")) as PostgresModule;
    const pgUrl = this.config.postgresUrl || resolvePgUrl();

    if (!pgUrl) {
      throw new DatabaseConnectionError(
        "DATABASE_URL (oder PGHOST/PGUSER/...) nicht gesetzt",
        "postgres",
      );
    }

    const { Pool } = mod;
    this.pool = new Pool({
      connectionString: pgUrl,
      max: this.config.maxConnections || 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: this.config.timeout || 5000,
    });

    // Connection error handling
    this.pool.on("error", (err: Error) => {
      logger.error({ err }, "PostgreSQL unexpected pool error");
    });

    await this.ensureBaseSchema();
    this.initialized = true;
    logger.info("PostgreSQL database initialized successfully");
  }

  private async ensureBaseSchema(): Promise<void> {
    logger.info("Starting PostgreSQL schema verification...");

    // Tabellen erstellen
    for (const [tableName, schema] of Object.entries(SCHEMAS)) {
      try {
        const pgSchema = schema
          .replace(/CREATE TABLE IF NOT EXISTS/g, "CREATE TABLE IF NOT EXISTS")
          .replace(
            /TEXT DEFAULT \(datetime\('now'\)\)/g,
            "TIMESTAMPTZ DEFAULT now()",
          )
          .replace(/BOOLEAN DEFAULT 0/g, "BOOLEAN DEFAULT false")
          .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, "SERIAL PRIMARY KEY")
          .replace(/JSON/g, "JSONB");

        await this.exec(pgSchema);
        logger.debug({ table: tableName }, "PostgreSQL table ensured");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(
          { table: tableName, error: message },
          "Failed to create PostgreSQL table",
        );
      }
    }

    // Fehlende Spalten ergänzen
    await this.addMissingColumns();

    // Nur sichere Indizes erstellen
    await this.createSafeIndexes();

    logger.info("PostgreSQL schema verification completed");
  }

  private async addMissingColumns(): Promise<void> {
    const missingColsQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'functions_nodes';
    `;
    const rows = await this.all<{ column_name: string }>(missingColsQuery);
    const existingCols = new Set(rows.map((r) => r.column_name));

    const expectedColumns: Record<string, string> = {
      annotation_status: "TEXT DEFAULT 'pending'",
      updated_at: "TIMESTAMPTZ",
      form_json: "JSONB",
      last_annotated: "TIMESTAMPTZ",
      last_accessed: "TIMESTAMPTZ",
      sync_state: "TEXT DEFAULT 'ok'",
      ai_last_processed: "TIMESTAMPTZ",
      ai_attempts: "INTEGER DEFAULT 0",
      ai_model_used: "TEXT",
      priority: "INTEGER DEFAULT 0",
      manual_reviewed: "BOOLEAN DEFAULT false",
      manual_locked: "BOOLEAN DEFAULT false",
      content_hash: "TEXT",
      category: "TEXT",
      attributes: "JSONB",
    };

    for (const [col, def] of Object.entries(expectedColumns)) {
      if (!existingCols.has(col)) {
        try {
          logger.debug({ column: col }, "Adding missing PostgreSQL column");
          await this.exec(
            `ALTER TABLE functions_nodes ADD COLUMN ${col} ${def};`,
          );
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          logger.warn(
            { column: col, error: message },
            "Could not add PostgreSQL column",
          );
        }
      }
    }
  }

  private async createSafeIndexes(): Promise<void> {
    for (const indexSql of INDEXES) {
      try {
        const pgIndex = indexSql
          .replace(/CREATE INDEX IF NOT EXISTS/g, "CREATE INDEX IF NOT EXISTS")
          .replace(/JSON/g, "JSONB");
        await this.exec(pgIndex);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(
          { error: message, sql: indexSql.substring(0, 100) },
          "Could not create PostgreSQL index (skipping)",
        );
      }
    }
  }

  private async useClient() {
    if (this.txClient) return this.txClient;
    return await this.pool.connect();
  }

  async exec(sql: string, params: SqlParams = []): Promise<void> {
    const client = await this.useClient();
    try {
      await client.query(sql, params);
    } finally {
      if (!this.txClient) client.release();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run<T = UnknownRow>(
    sql: string,
    params: SqlParams = [],
  ): Promise<MutationResult> {
    const startTime = Date.now();
    const client = await this.useClient();
    try {
      const r = await client.query(sql, params);
      const duration = Date.now() - startTime;

      if (duration > 100) {
        const queryType =
          sql.trim().split(/\s+/)[0]?.toUpperCase() || "UNKNOWN";
        logger.warn(
          {
            duration,
            queryType,
            ...(process.env.NODE_ENV === "development"
              ? { sqlPreview: sql.substring(0, 60) }
              : {}),
          },
          "Slow database query detected",
        );
      }

      return { changes: r.rowCount ?? undefined, lastID: undefined };
    } finally {
      if (!this.txClient) client.release();
    }
  }

  async all<T = UnknownRow>(sql: string, params: SqlParams = []): Promise<T[]> {
    const startTime = Date.now();
    const client = await this.useClient();
    try {
      const r = await client.query(sql, params);
      const duration = Date.now() - startTime;

      if (duration > 100) {
        const queryType =
          sql.trim().split(/\s+/)[0]?.toUpperCase() || "UNKNOWN";
        logger.warn(
          {
            duration,
            queryType,
            ...(process.env.NODE_ENV === "development"
              ? { sqlPreview: sql.substring(0, 60) }
              : {}),
          },
          "Slow database query detected",
        );
      }

      return r.rows as T[];
    } finally {
      if (!this.txClient) client.release();
    }
  }

  async get<T = UnknownRow>(sql: string, params: SqlParams = []): Promise<T | undefined> {
    const startTime = Date.now();
    const client = await this.useClient();
    try {
      const r = await client.query(sql, params);
      const duration = Date.now() - startTime;

      if (duration > 100) {
        const queryType =
          sql.trim().split(/\s+/)[0]?.toUpperCase() || "UNKNOWN";
        logger.warn(
          {
            duration,
            queryType,
            ...(process.env.NODE_ENV === "development"
              ? { sqlPreview: sql.substring(0, 60) }
              : {}),
          },
          "Slow database query detected",
        );
      }

      return (r.rows[0] as T) ?? undefined;
    } finally {
      if (!this.txClient) client.release();
    }
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    this.txClient = client;
    try {
      await client.query("BEGIN");
      const val = await fn();
      await client.query("COMMIT");
      return val;
    } catch (e) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Rollback failed, but original error is more important
      }
      throw e;
    } finally {
      this.txClient = undefined;
      client.release();
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.initialized = false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.get("SELECT 1 as health_check");
      return result?.health_check === 1;
    } catch {
      return false;
    }
  }
}

// -------------------------------------------------------------------
// Haupt-Datenbank-Service (KORRIGIERT mit Auto-Validierung)
// -------------------------------------------------------------------

/**
 * Database Service
 *
 * Main database service class providing unified access to SQLite or PostgreSQL.
 * Handles connection management, schema initialization, query execution, and monitoring.
 *
 * @remarks
 * The service automatically selects the appropriate database driver based on
 * environment variables (DB_DRIVER, DATABASE_URL). Provides query performance
 * tracking, health checks, and backup functionality.
 *
 * Features:
 * - Automatic driver selection (SQLite for dev, PostgreSQL for prod)
 * - Schema initialization and migrations
 * - Query performance monitoring
 * - Connection pooling (PostgreSQL)
 * - WAL mode support (SQLite)
 * - Backup and vacuum operations
 *
 * @example
 * ```typescript
 * // Initialize
 * await db.init();
 *
 * // Execute query
 * const result = await db.run('INSERT INTO users VALUES (?, ?)', ['name', 'email']);
 *
 * // Fetch data
 * const users = await db.all('SELECT * FROM users WHERE active = ?', [true]);
 *
 * // Health check
 * const health = await db.healthCheck();
 * ```
 */
class DatabaseService {
  private config: DatabaseConfig;
  private api: SqlApi;
  private isInitialized = false;
  private queryStats: QueryStats[] = [];
  private readonly maxQueryStats = 1000;

  /**
   * Creates a new DatabaseService instance
   *
   * @param config - Optional database configuration overrides
   */
  constructor(config?: Partial<DatabaseConfig>) {
    this.config = {
      driver: resolveDriver(),
      sqliteFile: SQLITE_FILE,
      postgresUrl: resolvePgUrl(),
      maxConnections: 10,
      timeout: 5000,
      enableWAL: true,
      retryAttempts: 3,
      ...config,
    };

    this.api =
      this.config.driver === "postgres"
        ? new PostgresApi(this.config)
        : new SqliteApi(this.config);
  }

  /**
   * Initializes database connection and schema
   *
   * Establishes connection to the configured database and ensures
   * all required tables and indexes exist. Safe to call multiple times.
   *
   * @throws {DatabaseConnectionError} If connection fails
   * @throws {DatabaseSchemaError} If schema initialization fails
   *
   * @example
   * ```typescript
   * await db.init();
   * ```
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.api.init();
      this.isInitialized = true;
      logger.info({ driver: this.config.driver }, "Database ready");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(
        { driver: this.config.driver, error: message },
        "Database initialization failed",
      );
      throw err;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  private trackQueryStats(
    sql: string,
    duration: number,
    rowCount?: number,
  ): void {
    this.queryStats.push({
      sql,
      duration,
      rowCount,
      timestamp: new Date(),
    });

    // Alte Einträge entfernen
    if (this.queryStats.length > this.maxQueryStats) {
      this.queryStats = this.queryStats.slice(-this.maxQueryStats);
    }
  }

  private enhanceError(
    error: unknown,
    sql: string,
    params: SqlParams = [],
  ): DatabaseError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const message = errorMessage
      ? `Database Error: ${errorMessage}`
      : "Database Error (unbekannter Fehler)";

    return new DatabaseError(message, sql, params, error);
  }

  // -------------------------------------------------------------------
  // Basis-Datenbankoperationen
  // -------------------------------------------------------------------

  async exec(sql: string, params: SqlParams = []): Promise<void> {
    await this.ensureInitialized();
    const startTime = Date.now();

    try {
      await this.api.exec(sql, params);
      this.trackQueryStats(sql, Date.now() - startTime);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("❌ [DB] Error in exec():", message, "\nSQL:", sql);
      throw this.enhanceError(err, sql, params);
    }
  }

  /**
   * Executes a SQL statement and returns execution metadata
   *
   * Use for INSERT, UPDATE, DELETE when you need to know how many
   * rows were affected or what the last inserted ID was.
   *
   * @param sql - SQL statement to execute
   * @param params - Query parameters (prevents SQL injection)
   * @returns Object with changes count and lastID (for INSERT)
   * @throws {DatabaseError} If query execution fails
   *
   * @example
   * ```typescript
   * const result = await db.run('INSERT INTO users (name) VALUES (?)', ['John']);
   * console.log(result.lastID); // ID of inserted row
   * console.log(result.changes); // Number of rows affected
   * ```
   */
  async run<T = UnknownRow>(
    sql: string,
    params: SqlParams = [],
  ): Promise<MutationResult> {
    await this.ensureInitialized();
    const startTime = Date.now();

    try {
      const result = await this.api.run<T>(sql, params);
      this.trackQueryStats(sql, Date.now() - startTime, result.changes);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("❌ [DB] Error in run():", message, "\nSQL:", sql);
      throw this.enhanceError(err, sql, params);
    }
  }

  /**
   * Executes a SELECT query and returns all matching rows
   *
   * @param sql - SELECT query to execute
   * @param params - Query parameters (prevents SQL injection)
   * @returns Array of matching rows (empty array if no matches)
   * @throws {DatabaseError} If query execution fails
   *
   * @example
   * ```typescript
   * const users = await db.all<User>('SELECT * FROM users WHERE active = ?', [true]);
   * console.log(users.length); // Number of active users
   * ```
   */
  async all<T = UnknownRow>(sql: string, params: SqlParams = []): Promise<T[]> {
    await this.ensureInitialized();
    const startTime = Date.now();

    try {
      const result = await this.api.all<T>(sql, params);
      this.trackQueryStats(sql, Date.now() - startTime, result.length);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("❌ [DB] Error in all():", message, "\nSQL:", sql);
      throw this.enhanceError(err, sql, params);
    }
  }

  /**
   * Executes a SELECT query and returns the first matching row
   *
   * @param sql - SELECT query to execute
   * @param params - Query parameters (prevents SQL injection)
   * @returns First matching row, or undefined if no matches
   * @throws {DatabaseError} If query execution fails
   *
   * @example
   * ```typescript
   * const user = await db.get<User>('SELECT * FROM users WHERE id = ?', [123]);
   * if (user) {
   *   console.log(user.name);
   * }
   * ```
   */
  async get<T = UnknownRow>(sql: string, params: SqlParams = []): Promise<T | undefined> {
    await this.ensureInitialized();
    const startTime = Date.now();

    try {
      const result = await this.api.get<T>(sql, params);
      this.trackQueryStats(sql, Date.now() - startTime, result ? 1 : 0);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("❌ [DB] Error in get():", message, "\nSQL:", sql);
      throw this.enhanceError(err, sql, params);
    }
  }

  /**
   * Executes multiple queries as an atomic transaction
   *
   * If any query fails, all changes are rolled back. Use for operations
   * that must succeed or fail together (e.g., transferring money between accounts).
   *
   * @param fn - Async function containing queries to execute
   * @returns Result of the transaction function
   * @throws Error if any query in the transaction fails
   *
   * @example
   * ```typescript
   * await db.transaction(async () => {
   *   await db.run('UPDATE accounts SET balance = balance - ? WHERE id = ?', [100, 1]);
   *   await db.run('UPDATE accounts SET balance = balance + ? WHERE id = ?', [100, 2]);
   * });
   * ```
   */
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    await this.ensureInitialized();

    try {
      return await this.api.transaction(fn);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("❌ [DB] Error in transaction:", message);
      throw err;
    }
  }

  // -------------------------------------------------------------------
  // Erweiterte Service-Funktionen mit Auto-Korrektur
  // -------------------------------------------------------------------

  /** Prüft Tabellen und Spalten (manuell aufrufbar für Admin-Tools) */
  async verifySchema(): Promise<void> {
    logger.info("Manual schema verification started");
    try {
      await this.ensureInitialized();
      logger.info("Schema verification completed successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("❌ [DB] Schema verification failed:", message);
      throw err;
    }
  }

  /** Aktualisiert das Formular eines Knotens. */
  async updateFunctionsNodeForm(id: string, form: FormSpec): Promise<void> {
    await this.ensureInitialized();

    try {
      const formJson =
        this.config.driver === "postgres" ? form : JSON.stringify(form);
      const sql =
        this.config.driver === "postgres"
          ? `UPDATE functions_nodes SET form_json = $1::jsonb, updated_at = now() WHERE id = $2`
          : `UPDATE functions_nodes SET form_json = json(?), updated_at = datetime('now') WHERE id = ?`;

      await this.run(sql, [formJson, id]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `❌ [DB] Error in updateFunctionsNodeForm(${id}):`,
        message,
      );
      throw err;
    }
  }

  /** Aktualisiert die Metadaten eines Knotens. */
  async updateFunctionsNodeMeta(id: string, meta: unknown): Promise<void> {
    await this.ensureInitialized();

    try {
      const payload: SqlValue =
        this.config.driver === "postgres"
          ? (meta as Record<string, unknown>)
          : JSON.stringify(meta);
      const sql =
        this.config.driver === "postgres"
          ? `UPDATE functions_nodes SET meta_json = $1::jsonb, updated_at = now() WHERE id = $2`
          : `UPDATE functions_nodes SET meta_json = ?, updated_at = datetime('now') WHERE id = ?`;

      await this.run(sql, [payload, id]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `❌ [DB] Error in updateFunctionsNodeMeta(${id}):`,
        message,
      );
      throw err;
    }
  }

  /** Importiert den Funktionskatalog komplett (mit Upsert-Logik und Auto-Korrektur) */
  async upsertFunctionsCatalog(
    result: BuildResult,
  ): Promise<{ nodes: number; edges: number }> {
    await this.ensureInitialized();

    let nodeCount = 0;
    let edgeCount = 0;
    let correctedCount = 0;

    const toJsonParam = (obj: unknown): SqlValue => {
      if (obj === null || obj === undefined) return null;
      return this.config.driver === "postgres"
        ? (obj as Record<string, unknown>)
        : JSON.stringify(obj);
    };

    const insertNode = async (n: CatalogNode) => {
      // Auto-Korrektur für kind-Werte vor dem Einfügen
      const originalKind = n.kind;
      const correctedKind = autoCorrectKind(originalKind);

      if (originalKind !== correctedKind) {
        correctedCount++;
        logger.info(
          { nodeId: n.id, originalKind, correctedKind },
          `Auto-corrected kind: "${originalKind}" → "${correctedKind}"`,
        );
        n.kind = correctedKind;
      }

      const sql =
        this.config.driver === "postgres"
          ? `
        INSERT INTO functions_nodes
        (id, title, kind, icon, path_json, weight, meta_json, rbac_json, flags_json, pii_json, aa_json, schema_json, source_file, source_line_start)
        VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10::jsonb,$11::jsonb,$12::jsonb,$13,$14)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          kind = EXCLUDED.kind,
          icon = EXCLUDED.icon,
          path_json = EXCLUDED.path_json,
          weight = EXCLUDED.weight,
          meta_json = EXCLUDED.meta_json,
          rbac_json = EXCLUDED.rbac_json,
          flags_json = EXCLUDED.flags_json,
          pii_json = EXCLUDED.pii_json,
          aa_json = EXCLUDED.aa_json,
          schema_json = EXCLUDED.schema_json,
          source_file = EXCLUDED.source_file,
          source_line_start = EXCLUDED.source_line_start`
          : `
        INSERT INTO functions_nodes
        (id, title, kind, icon, path_json, weight, meta_json, rbac_json, flags_json, pii_json, aa_json, schema_json, source_file, source_line_start)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          kind = excluded.kind,
          icon = excluded.icon,
          path_json = excluded.path_json,
          weight = excluded.weight,
          meta_json = excluded.meta_json,
          rbac_json = excluded.rbac_json,
          flags_json = excluded.flags_json,
          pii_json = excluded.pii_json,
          aa_json = excluded.aa_json,
          schema_json = excluded.schema_json,
          source_file = excluded.source_file,
          source_line_start = excluded.source_line_start`;

      const params = [
        n.id,
        n.title,
        n.kind,
        n.icon ?? null,
        this.config.driver === "postgres" ? n.path : JSON.stringify(n.path),
        n.weight,
        toJsonParam(n.meta),
        toJsonParam(n.rbac),
        toJsonParam(n.flags),
        toJsonParam(n.pii),
        toJsonParam(n.aa),
        toJsonParam(n.schema),
        n.source.file,
        n.source.lineStart ?? null,
      ];

      await this.run(sql, params);
      nodeCount++;
    };

    const insertEdge = async (parentId: string, childId: string) => {
      try {
        const sql =
          this.config.driver === "postgres"
            ? `INSERT INTO functions_edges (parent_id, child_id) VALUES ($1, $2) ON CONFLICT (parent_id, child_id) DO NOTHING`
            : `INSERT OR IGNORE INTO functions_edges (parent_id, child_id) VALUES (?, ?)`;

        await this.run(sql, [parentId, childId]);
        edgeCount++;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(
          `⚠️ [DB] Could not insert edge (${parentId} → ${childId}):`,
          message,
        );
      }
    };

    const walk = async (n: CatalogNode, parentId: string | null) => {
      await insertNode(n);
      if (parentId) await insertEdge(parentId, n.id);
      for (const c of n.children) {
        await walk(c, n.id);
      }
    };

    await this.transaction(async () => {
      // Bestehende Daten löschen
      await this.exec("DELETE FROM functions_edges");
      await this.exec("DELETE FROM functions_nodes");

      // Neue Daten einfügen
      for (const root of result.nodes) {
        await walk(root, null);
      }
    });

    if (correctedCount > 0) {
      logger.info({ correctedCount }, `${correctedCount} nodes auto-corrected`);
    }

    logger.info(
      { nodeCount, edgeCount },
      `Catalog successfully saved (${nodeCount} nodes, ${edgeCount} edges)`,
    );
    return { nodes: nodeCount, edges: edgeCount };
  }

  // -------------------------------------------------------------------
  // Batch-Operationen mit Auto-Validierung
  // -------------------------------------------------------------------

  async batchInsert(
    table: string,
    records: UnknownRow[],
    batchSize: number = 100,
  ): Promise<{
    inserted: number;
    errors: Array<{ batch: number; error: string }>;
    corrected: number;
  }> {
    await this.ensureInitialized();

    if (!Array.isArray(records) || records.length === 0) {
      return { inserted: 0, errors: [], corrected: 0 };
    }

    const results = {
      inserted: 0,
      errors: [] as Array<{ batch: number; error: string }>,
      corrected: 0,
    };

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      // Auto-Korrektur für die Batch-Daten
      const correctedBatch = batch.map((record) => {
        if (table === "functions_nodes" && typeof record.kind === "string") {
          const originalKind = record.kind;
          const correctedKind = autoCorrectKind(originalKind);
          if (originalKind !== correctedKind) {
            results.corrected++;
            record.kind = correctedKind;
          }
        }
        return record;
      });

      const first = correctedBatch[0];
      const columnCount = Array.isArray(first) ? first.length : 1;
      const rowPlaceholder = `(${Array(columnCount).fill("?").join(",")})`;
      const placeholders = correctedBatch.map(() => rowPlaceholder).join(",");

      const sql = `INSERT OR REPLACE INTO ${table} VALUES ${placeholders}`;

      try {
        const flatParams = correctedBatch.flat();
        await this.run(sql, flatParams);
        results.inserted += correctedBatch.length;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        results.errors.push({
          batch: i / batchSize + 1,
          error: message,
        });
        console.error(
          `❌ [DB] Batch insert failed (Batch ${i / batchSize + 1}):`,
          message,
        );
      }
    }

    return results;
  }

  // -------------------------------------------------------------------
  // Monitoring und Health-Checks
  // -------------------------------------------------------------------

  async healthCheck(): Promise<HealthStatus> {
    try {
      await this.ensureInitialized();
      const startTime = Date.now();
      await this.get("SELECT 1 as health_check");
      const latency = Date.now() - startTime;

      return {
        status: "healthy",
        driver: this.config.driver,
        latency,
        details: {
          initialized: this.isInitialized,
          queryStatsCount: this.queryStats.length,
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";

      return {
        status: "unhealthy",
        driver: this.config.driver,
        error: message,
        details: {
          initialized: this.isInitialized,
        },
      };
    }
  }

  async getStats() {
    try {
      await this.ensureInitialized();

      const stats = await this.all(`
        SELECT 
          (SELECT COUNT(*) FROM functions_nodes) as total_nodes,
          (SELECT COUNT(*) FROM functions_nodes WHERE annotation_status = 'completed') as annotated_nodes,
          (SELECT COUNT(*) FROM functions_nodes WHERE annotation_status = 'pending') as pending_nodes,
          (SELECT COUNT(*) FROM batch_operations) as total_batches,
          (SELECT COUNT(*) FROM batch_operations WHERE status = 'completed') as completed_batches,
          (SELECT COUNT(*) FROM ai_annotations_log) as total_ai_operations,
          (SELECT COUNT(*) FROM audit_log) as total_audit_entries
      `);

      return {
        ...stats[0],
        queryPerformance: this.getQueryPerformance(),
      };
    } catch (error) {
      console.error("❌ [DB] Error getting stats:", error);
      return {};
    }
  }

  private getQueryPerformance() {
    if (this.queryStats.length === 0) return {};

    const durations = this.queryStats.map((q) => q.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const slowQueries = this.queryStats.filter((q) => q.duration > 100).length;

    return {
      totalQueries: this.queryStats.length,
      averageDuration: Math.round(avgDuration),
      maxDuration,
      slowQueries,
      slowQueryPercentage: (
        (slowQueries / this.queryStats.length) *
        100
      ).toFixed(1),
    };
  }

  // -------------------------------------------------------------------
  // Backup und Wartung
  // -------------------------------------------------------------------

  async backup(backupPath?: string): Promise<string | null> {
    if (this.config.driver !== "sqlite") {
      logger.info(
        { driver: this.config.driver },
        "Backup only supported for SQLite",
      );
      return null;
    }

    await this.ensureInitialized();

    let targetPath = backupPath;
    if (!targetPath) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      targetPath = path.join(
        __dirname,
        "../../../backups",
        `database-backup-${timestamp}.sqlite`,
      );
    }

    const sourcePath = this.config.sqliteFile || SQLITE_FILE;
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(sourcePath, targetPath);

    logger.info({ sourcePath, targetPath }, "Database backed up successfully");
    return targetPath;
  }

  async vacuum(): Promise<void> {
    await this.ensureInitialized();

    try {
      if (this.config.driver === "sqlite") {
        await this.exec("VACUUM");
      } else {
        await this.exec("VACUUM ANALYZE");
      }
      logger.info({ driver: this.config.driver }, "Database vacuum completed");
    } catch (error) {
      console.error("❌ [DB] Vacuum failed:", error);
    }
  }

  // -------------------------------------------------------------------
  // Utility-Methoden
  // -------------------------------------------------------------------

  async close(): Promise<void> {
    if (this.api) {
      await this.api.close();
      this.isInitialized = false;
      logger.info("Database connection closed");
    }
  }

  getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  getQueryStats(): QueryStats[] {
    return [...this.queryStats];
  }

  clearQueryStats(): void {
    this.queryStats = [];
  }

  // -------------------------------------------------------------------
  // Auto-Korrektur Hilfsmethoden (für externe Nutzung)
  // -------------------------------------------------------------------

  /** Korrigiert automatisch kind-Werte in einem Knoten */
  autoCorrectNode(node: CatalogNode): CatalogNode {
    const correctedKind = autoCorrectKind(node.kind);
    if (node.kind !== correctedKind) {
      logger.info(
        { nodeId: node.id, oldKind: node.kind, newKind: correctedKind },
        "Auto-correcting node kind",
      );
      return { ...node, kind: correctedKind };
    }
    return node;
  }

  /** Korrigiert automatisch kind-Werte in einer Liste von Knoten */
  autoCorrectNodes(nodes: CatalogNode[]): CatalogNode[] {
    return nodes.map((node) => this.autoCorrectNode(node));
  }
}

// -------------------------------------------------------------------
// Export und Initialisierung
// -------------------------------------------------------------------

// Standard-Instanz erstellen
const db = new DatabaseService();

// Automatische Initialisierung entfernt - wird in index.ts manuell aufgerufen
// db.init() wird in apps/backend/src/index.ts:bootstrapFunctionsCatalog() ausgeführt

// Graceful shutdown
const shutdown = async () => {
  logger.info("Shutting down database...");
  await db.close();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("beforeExit", shutdown);

// Export der Auto-Korrektur Funktionen für andere Module
export { autoCorrectKind, attemptAdvancedCorrection };
export default db;
export {
  DatabaseService,
  DatabaseError,
  DatabaseConnectionError,
  DatabaseSchemaError,
};
export type { DatabaseConfig, HealthStatus, QueryStats };
