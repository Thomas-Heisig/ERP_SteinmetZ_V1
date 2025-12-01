// SPDX-License-Identifier: MIT

// -------------------------------------------------------------------
// Node.js Standardmodule
// -------------------------------------------------------------------
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
 * Automatische Korrektur für kind-Werte in Funktionen
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
 * Erweiterte Korrektur für komplexe Fälle
 */
function attemptAdvancedCorrection(
  rawData: any,
  lineIndex: number,
  fileName: string,
): any {
  try {
    // Tiefe Kopie der Daten für Korrektur-Versuche
    const correctedData = { ...rawData };

    // 1. Korrektur für kind-Feld
    if (correctedData.kind) {
      const originalKind = correctedData.kind;
      correctedData.kind = autoCorrectKind(originalKind);

      if (originalKind !== correctedData.kind) {
        console.log(
          `🔄 [Auto-Correct] ${fileName}:${lineIndex + 1} kind "${originalKind}" → "${correctedData.kind}"`,
        );
      }
    }

    // 2. Sicherstellen, dass Pfad ein Array ist
    if (correctedData.path && !Array.isArray(correctedData.path)) {
      if (typeof correctedData.path === "string") {
        correctedData.path = [correctedData.path];
        console.log(
          `🔄 [Auto-Correct] ${fileName}:${lineIndex + 1} path als String → Array konvertiert`,
        );
      } else {
        correctedData.path = [];
      }
    }

    // 3. Standardwerte für optionale Felder setzen
    if (!correctedData.children) correctedData.children = [];
    if (!correctedData.weight) correctedData.weight = 1;
    if (!correctedData.icon) correctedData.icon = "";

    return correctedData;
  } catch (error) {
    console.error(
      `❌ [Advanced Correction Failed] ${fileName}:${lineIndex + 1}:`,
      error,
    );
    return rawData;
  }
}

// -------------------------------------------------------------------
// Erweiterte Fehlerklassen
// -------------------------------------------------------------------

class DatabaseError extends Error {
  public readonly sql: string;
  public readonly params: any[];
  public readonly original: unknown;
  public readonly code?: string;

  constructor(message: string, sql: string, params: any[], original: unknown) {
    super(message);
    this.name = "DatabaseError";
    this.sql = sql;
    this.params = params;
    this.original = original;
    this.code = (original as any)?.code;
  }
}

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

type Driver = "sqlite" | "postgres";

interface DatabaseConfig {
  driver: Driver;
  sqliteFile?: string;
  postgresUrl?: string;
  maxConnections?: number;
  timeout?: number;
  enableWAL?: boolean;
  retryAttempts?: number;
}

interface QueryStats {
  sql: string;
  duration: number;
  rowCount?: number;
  timestamp: Date;
}

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  driver: Driver;
  latency?: number;
  error?: string;
  details?: Record<string, any>;
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
];

// -------------------------------------------------------------------
// Konfigurations-Helper
// -------------------------------------------------------------------

/** Treiber valide aus ENV lesen */
function resolveDriver(): Driver {
  const raw = process.env.DB_DRIVER?.toLowerCase();
  if (raw === "postgres" || raw === "pg") return "postgres";
  if (raw === "sqlite" || !raw) return "sqlite";

  console.warn(`⚠️ Unbekannter DB_DRIVER='${raw}', nutze sqlite`);
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
  exec(sql: string, params?: any[]): Promise<void>;
  run<T = any>(
    sql: string,
    params?: any[],
  ): Promise<{ changes?: number; lastID?: number }>;
  all<T = any>(sql: string, params?: any[]): Promise<T[]>;
  get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
  close(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

// -------------------------------------------------------------------
// SQLite-Implementierung (KORRIGIERT)
// -------------------------------------------------------------------

class SqliteApi implements SqlApi {
  private db!: any;
  private initialized = false;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    const mod: any = await import("better-sqlite3");
    const sqliteFile = this.config.sqliteFile || SQLITE_FILE;

    // Datenbankverzeichnis erstellen
    const dir = path.dirname(sqliteFile);
    await fs.mkdir(dir, { recursive: true });

    try {
      this.db = new mod.default(sqliteFile, {
        fileMustExist: false,
        timeout: this.config.timeout || 5000,
      });
    } catch (err: any) {
      throw new DatabaseConnectionError(
        `SQLite konnte nicht geöffnet werden: ${err.message}`,
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
    console.log("✅ [SQLite] Database initialized:", sqliteFile);
  }

  private safePragma(statement: string) {
    try {
      this.db.pragma(statement);
    } catch (err: any) {
      console.warn(
        `⚠️ [SQLite] PRAGMA '${statement}' fehlgeschlagen:`,
        err.message,
      );
    }
  }

  private async ensureBaseSchema(): Promise<void> {
    console.log("🔍 [SQLite] Starting schema verification...");

    // Tabellen erstellen
    for (const [name, ddl] of Object.entries(SCHEMAS)) {
      try {
        this.db.exec(ddl);
        console.log(`✅ [SQLite] Table ${name} ensured`);
      } catch (err: any) {
        console.warn(
          `⚠️ [SQLite] Tabelle ${name} konnte nicht erstellt werden:`,
          err.message,
        );
      }
    }

    // Fehlende Spalten ergänzen
    await this.addMissingColumns();

    // Nur sichere Indizes erstellen
    await this.createSafeIndexes();

    console.log("✅ [SQLite] Schema verification completed");
  }

  private async addMissingColumns(): Promise<void> {
    const colInfo = this.db.prepare("PRAGMA table_info(functions_nodes)").all();
    const existingColumns = new Set(colInfo.map((c: any) => c.name));

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
          console.log(`🧩 [SQLite] Adding missing column: ${col}`);
          this.db.exec(`ALTER TABLE functions_nodes ADD COLUMN ${col} ${def}`);
        } catch (err: any) {
          console.warn(`⚠️ [SQLite] Could not add column ${col}:`, err.message);
        }
      }
    }

    // Fehlende Spalten in functions_edges prüfen - OHNE DEFAULT für created_at
    const edgesColInfo = this.db
      .prepare("PRAGMA table_info(functions_edges)")
      .all();
    const edgesExistingCols = new Set(edgesColInfo.map((c: any) => c.name));

    const edgesMissingCols = {
      weight: "INTEGER DEFAULT 1",
      relationship_type: "TEXT DEFAULT 'contains'",
      created_at: "TEXT", // Ohne DEFAULT-Wert für SQLite-Kompatibilität
    };

    for (const [col, def] of Object.entries(edgesMissingCols)) {
      if (!edgesExistingCols.has(col)) {
        try {
          console.log(
            `🧩 [SQLite] Adding missing column to functions_edges: ${col}`,
          );
          this.db.exec(`ALTER TABLE functions_edges ADD COLUMN ${col} ${def}`);

          // Für created_at: Nach dem Hinzufügen Standardwert setzen
          if (col === "created_at") {
            this.db.exec(
              `UPDATE functions_edges SET created_at = datetime('now') WHERE created_at IS NULL`,
            );
          }
        } catch (err: any) {
          console.warn(
            `⚠️ [SQLite] Could not add column ${col} to functions_edges:`,
            err.message,
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
      } catch (err: any) {
        console.warn(
          `⚠️ [SQLite] Could not create index (skipping):`,
          err.message,
        );
        console.warn(`  SQL: ${idx.substring(0, 100)}...`);
      }
    }
  }

  async exec(sql: string, params: any[] = []): Promise<void> {
    this.db.prepare(sql).run(params);
  }

  async run<T = any>(sql: string, params: any[] = []) {
    const info = this.db.prepare(sql).run(params);
    return { changes: info.changes, lastID: info.lastInsertRowid };
  }

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return this.db.prepare(sql).all(params);
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return this.db.prepare(sql).get(params) ?? undefined;
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
  private pool!: any;
  private txClient?: any;
  private initialized = false;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    const mod: any = await import("pg");
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
      console.error("❌ [PostgreSQL] Unexpected pool error:", err);
    });

    await this.ensureBaseSchema();
    this.initialized = true;
    console.log("✅ [PostgreSQL] Database initialized successfully");
  }

  private async ensureBaseSchema(): Promise<void> {
    console.log("🔍 [PostgreSQL] Starting schema verification...");

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
        console.log(`✅ [PostgreSQL] Table ${tableName} ensured`);
      } catch (err: any) {
        console.warn(
          `⚠️ [PostgreSQL] Fehler beim Erstellen von Tabelle ${tableName}:`,
          err.message,
        );
      }
    }

    // Fehlende Spalten ergänzen
    await this.addMissingColumns();

    // Nur sichere Indizes erstellen
    await this.createSafeIndexes();

    console.log("✅ [PostgreSQL] Schema verification completed");
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
          console.log(`🧩 [PostgreSQL] Füge fehlende Spalte hinzu: ${col}`);
          await this.exec(
            `ALTER TABLE functions_nodes ADD COLUMN ${col} ${def};`,
          );
        } catch (err: any) {
          console.warn(
            `⚠️ [PostgreSQL] Konnte Spalte ${col} nicht hinzufügen:`,
            err.message,
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
      } catch (err: any) {
        console.warn(
          `⚠️ [PostgreSQL] Konnte Index nicht erstellen (skipping):`,
          err.message,
        );
        console.warn(`  SQL: ${indexSql.substring(0, 100)}...`);
      }
    }
  }

  private async useClient() {
    if (this.txClient) return this.txClient;
    return await this.pool.connect();
  }

  async exec(sql: string, params: any[] = []): Promise<void> {
    const client = await this.useClient();
    try {
      await client.query(sql, params);
    } finally {
      if (!this.txClient) client.release();
    }
  }

  async run<T = any>(
    sql: string,
    params: any[] = [],
  ): Promise<{ changes?: number; lastID?: number }> {
    const startTime = Date.now();
    const client = await this.useClient();
    try {
      const r = await client.query(sql, params);
      const duration = Date.now() - startTime;

      if (process.env.NODE_ENV === "development" && duration > 100) {
        console.log(
          `🐌 [DB] Slow query (${duration}ms): ${sql.substring(0, 100)}...`,
        );
      }

      return { changes: r.rowCount ?? undefined, lastID: undefined };
    } finally {
      if (!this.txClient) client.release();
    }
  }

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const startTime = Date.now();
    const client = await this.useClient();
    try {
      const r = await client.query(sql, params);
      const duration = Date.now() - startTime;

      if (process.env.NODE_ENV === "development" && duration > 100) {
        console.log(
          `🐌 [DB] Slow query (${duration}ms): ${sql.substring(0, 100)}...`,
        );
      }

      return r.rows as T[];
    } finally {
      if (!this.txClient) client.release();
    }
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const startTime = Date.now();
    const client = await this.useClient();
    try {
      const r = await client.query(sql, params);
      const duration = Date.now() - startTime;

      if (process.env.NODE_ENV === "development" && duration > 100) {
        console.log(
          `🐌 [DB] Slow query (${duration}ms): ${sql.substring(0, 100)}...`,
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
      } catch {}
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

class DatabaseService {
  private config: DatabaseConfig;
  private api: SqlApi;
  private isInitialized = false;
  private queryStats: QueryStats[] = [];
  private readonly maxQueryStats = 1000;

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
   * Initialisiert den Datenbankzugang und prüft das Schema.
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.api.init();
      this.isInitialized = true;
      console.log(`✅ [DB] Database ready (${this.config.driver})`);
    } catch (err: any) {
      console.error(
        `❌ [DB] Initialization failed (${this.config.driver}):`,
        err.message,
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
    error: any,
    sql: string,
    params: any[] = [],
  ): DatabaseError {
    const message = error?.message
      ? `Database Error: ${error.message}`
      : "Database Error (unbekannter Fehler)";

    return new DatabaseError(message, sql, params, error);
  }

  // -------------------------------------------------------------------
  // Basis-Datenbankoperationen
  // -------------------------------------------------------------------

  async exec(sql: string, params: any[] = []): Promise<void> {
    await this.ensureInitialized();
    const startTime = Date.now();

    try {
      await this.api.exec(sql, params);
      this.trackQueryStats(sql, Date.now() - startTime);
    } catch (err: any) {
      console.error("❌ [DB] Error in exec():", err?.message, "\nSQL:", sql);
      throw this.enhanceError(err, sql, params);
    }
  }

  async run<T = any>(
    sql: string,
    params: any[] = [],
  ): Promise<{ changes?: number; lastID?: number }> {
    await this.ensureInitialized();
    const startTime = Date.now();

    try {
      const result = await this.api.run<T>(sql, params);
      this.trackQueryStats(sql, Date.now() - startTime, result.changes);
      return result;
    } catch (err: any) {
      console.error("❌ [DB] Error in run():", err?.message, "\nSQL:", sql);
      throw this.enhanceError(err, sql, params);
    }
  }

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    await this.ensureInitialized();
    const startTime = Date.now();

    try {
      const result = await this.api.all<T>(sql, params);
      this.trackQueryStats(sql, Date.now() - startTime, result.length);
      return result;
    } catch (err: any) {
      console.error("❌ [DB] Error in all():", err?.message, "\nSQL:", sql);
      throw this.enhanceError(err, sql, params);
    }
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    await this.ensureInitialized();
    const startTime = Date.now();

    try {
      const result = await this.api.get<T>(sql, params);
      this.trackQueryStats(sql, Date.now() - startTime, result ? 1 : 0);
      return result;
    } catch (err: any) {
      console.error("❌ [DB] Error in get():", err?.message, "\nSQL:", sql);
      throw this.enhanceError(err, sql, params);
    }
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    await this.ensureInitialized();

    try {
      return await this.api.transaction(fn);
    } catch (err: any) {
      console.error("❌ [DB] Error in transaction:", err?.message);
      throw err;
    }
  }

  // -------------------------------------------------------------------
  // Erweiterte Service-Funktionen mit Auto-Korrektur
  // -------------------------------------------------------------------

  /** Prüft Tabellen und Spalten (manuell aufrufbar für Admin-Tools) */
  async verifySchema(): Promise<void> {
    console.log("🔍 [DB] Manual schema verification started...");
    try {
      await this.ensureInitialized();
      console.log("✅ [DB] Schema verification completed successfully.");
    } catch (err: any) {
      console.error("❌ [DB] Schema verification failed:", err.message);
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
    } catch (err: any) {
      console.error(
        `❌ [DB] Error in updateFunctionsNodeForm(${id}):`,
        err.message,
      );
      throw err;
    }
  }

  /** Aktualisiert die Metadaten eines Knotens. */
  async updateFunctionsNodeMeta(id: string, meta: unknown): Promise<void> {
    await this.ensureInitialized();

    try {
      const payload =
        this.config.driver === "postgres"
          ? (meta as object)
          : JSON.stringify(meta);
      const sql =
        this.config.driver === "postgres"
          ? `UPDATE functions_nodes SET meta_json = $1::jsonb, updated_at = now() WHERE id = $2`
          : `UPDATE functions_nodes SET meta_json = ?, updated_at = datetime('now') WHERE id = ?`;

      await this.run(sql, [payload, id]);
    } catch (err: any) {
      console.error(
        `❌ [DB] Error in updateFunctionsNodeMeta(${id}):`,
        err.message,
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

    const toJsonParam = (obj: unknown): string | object | null => {
      if (obj == null) return null;
      return this.config.driver === "postgres"
        ? (obj as object)
        : JSON.stringify(obj);
    };

    const insertNode = async (n: CatalogNode) => {
      // Auto-Korrektur für kind-Werte vor dem Einfügen
      const originalKind = n.kind;
      const correctedKind = autoCorrectKind(originalKind);

      if (originalKind !== correctedKind) {
        correctedCount++;
        console.log(
          `🔄 [DB Auto-Correct] ${n.id}: kind "${originalKind}" → "${correctedKind}"`,
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
      } catch (err: any) {
        console.warn(
          `⚠️ [DB] Could not insert edge (${parentId} → ${childId}):`,
          err.message,
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
      console.log(`🔄 [DB] ${correctedCount} Knoten automatisch korrigiert`);
    }

    console.log(
      `✅ [DB] Catalog successfully saved (${nodeCount} nodes, ${edgeCount} edges).`,
    );
    return { nodes: nodeCount, edges: edgeCount };
  }

  // -------------------------------------------------------------------
  // Batch-Operationen mit Auto-Validierung
  // -------------------------------------------------------------------

  async batchInsert(
    table: string,
    records: any[],
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
        if (table === "functions_nodes" && record.kind) {
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
      console.log("⚠️ [DB] Backup only supported for SQLite");
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

    console.log(`💾 [DB] Database backed up to: ${targetPath}`);
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
      console.log("🧹 [DB] Database vacuum completed");
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
      console.log("🔒 [DB] Database connection closed");
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
      console.log(
        `🔄 [DB Auto-Correct] ${node.id}: "${node.kind}" → "${correctedKind}"`,
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

// Automatische Initialisierung
db.init().catch((err: unknown) => {
  console.error("❌ [DB] Initialization failed:", err);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("🔄 [DB] Shutting down database...");
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
