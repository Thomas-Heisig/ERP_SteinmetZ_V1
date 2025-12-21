/**
 * databaseTools.ts
 * Universelle Datenbankwerkzeuge – adaptiv, sicher und KI-kompatibel.
 * Unterstützt SQLite, PostgreSQL, MySQL und dateibasierte Strukturen (JSON, CSV, etc.).
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import type { ToolFunction } from "./registry.js";

const require = createRequire(import.meta.url);

// Optionale DB-Treiber dynamisch laden (nicht zwingend erforderlich)
type BetterSqlite3Module = new (
  file: string,
  options?: { readonly?: boolean },
) => {
  prepare: (sql: string) => { all: (params?: unknown[]) => unknown[] };
  close: () => void;
};

type SQLite3Module = {
  Database: new (file: string) => {
    all: (
      sql: string,
      params: unknown[],
      cb: (err: Error | null, rows: unknown[]) => void,
    ) => void;
    close: () => void;
  };
};

type PostgresModule = {
  Client: new (opts: { connectionString: string }) => {
    connect: () => Promise<void>;
    query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
    end: () => Promise<void>;
  };
};

type MySQLModule = {
  createConnection: (connectionString: string) => Promise<{
    execute: (sql: string, params?: unknown[]) => Promise<[unknown, unknown]>;
    end: () => Promise<void>;
  }>;
};

let betterSqlite3: BetterSqlite3Module | null = null;
let sqlite3: SQLite3Module | null = null;
let pg: PostgresModule | null = null;
let mysql: MySQLModule | null = null;
try {
  betterSqlite3 = require("better-sqlite3");
} catch {
  // Optional dependency - ignore if not available
}
try {
  sqlite3 = require("sqlite3");
} catch {
  // Optional dependency - ignore if not available
}
try {
  pg = require("pg");
} catch {
  // Optional dependency - ignore if not available
}
try {
  mysql = require("mysql2/promise");
} catch {
  // Optional dependency - ignore if not available
}

/* ─────────────────────────────────────────────
 * Hilfsfunktionen
 * ───────────────────────────────────────────── */

function isSQLiteDatabase(filePath: string): boolean {
  try {
    const header = fs.readFileSync(filePath).slice(0, 16).toString();
    return header.includes("SQLite format");
  } catch {
    return false;
  }
}

async function scanDatabases(baseDir: string): Promise<string[]> {
  const entries = await fs.promises.readdir(baseDir, { withFileTypes: true });
  const results: string[] = [];
  for (const e of entries) {
    const p = path.join(baseDir, e.name);
    if (e.isDirectory()) results.push(...(await scanDatabases(p)));
    else if (/\.(db|sqlite|sqlite3|json|csv)$/i.test(e.name)) results.push(p);
  }
  return results;
}

async function querySQLite(
  file: string,
  sql: string,
  params?: unknown[],
): Promise<unknown[]> {
  if (betterSqlite3) {
    const db = new betterSqlite3(file, { readonly: true });
    const res = db.prepare(sql).all(params || []);
    db.close();
    return res;
  }
  if (sqlite3) {
    const db = new sqlite3.Database(file);
    return new Promise((resolve, reject) => {
      db.all(
        sql,
        (params || []) as unknown[],
        (err: Error | null, rows: unknown[]) => {
          db.close();
          if (err) reject(err);
          else resolve(rows);
        },
      );
    });
  }
  throw new Error(
    "Kein SQLite-Treiber gefunden (better-sqlite3 oder sqlite3).",
  );
}

async function connectPostgres(connectionString: string) {
  if (!pg) throw new Error("PostgreSQL-Treiber (pg) nicht installiert.");
  const { Client } = pg;
  const client = new Client({ connectionString });
  await client.connect();
  return client;
}

async function connectMySQL(connectionString: string) {
  if (!mysql) throw new Error("MySQL-Treiber (mysql2) nicht installiert.");
  return await mysql.createConnection(connectionString);
}

/* ─────────────────────────────────────────────
 * Tool-Registrierung
 * ───────────────────────────────────────────── */

export function registerTools(toolRegistry: {
  register: (name: string, fn: ToolFunction) => void;
}) {
  /* 🔍 Scan nach Datenbanken */
  const scanTool = (async ({ directory = "data" }: { directory?: string }) => {
    try {
      const abs = path.resolve(directory);
      const files = await scanDatabases(abs);
      return {
        success: true,
        directory: abs,
        databases: files,
        count: files.length,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  }) as ToolFunction;

  scanTool.description =
    "Durchsucht ein Verzeichnis rekursiv nach Datenbanken (SQLite, JSON, CSV).";
  scanTool.parameters = { directory: "Pfad zum Startverzeichnis" };
  scanTool.category = "database";
  toolRegistry.register("scan_databases", scanTool);

  /* 🧱 Inspektion (Tabellen, Spalten, Indizes) */
  const inspectTool = (async ({ file }: { file: string }) => {
    try {
      if (isSQLiteDatabase(file)) {
        const tables = await querySQLite(
          file,
          "SELECT name FROM sqlite_master WHERE type='table';",
        );
        const meta: Record<string, unknown> = {};
        for (const t of tables) {
          const columns = await querySQLite(
            file,
            `PRAGMA table_info(${(t as Record<string, unknown>).name});`,
          );
          const indices = await querySQLite(
            file,
            `PRAGMA index_list(${(t as Record<string, unknown>).name});`,
          );
          const tableName = (t as Record<string, unknown>).name as string;
          meta[tableName] = { columns, indices };
        }
        return {
          success: true,
          file,
          meta,
          tableCount: Object.keys(meta).length,
        };
      }

      if (file.endsWith(".json")) {
        const raw = JSON.parse(
          await fs.promises.readFile(file, "utf8"),
        ) as unknown;
        const isArray = Array.isArray(raw);
        const first = isArray ? ((raw as unknown[])[0] ?? {}) : raw;
        const keys = isRecord(first) ? Object.keys(first) : [];
        return {
          success: true,
          file,
          type: "json",
          keys,
          sample: isArray ? (raw as unknown[])[0] : raw,
        };
      }

      if (file.endsWith(".csv")) {
        const content = await fs.promises.readFile(file, "utf8");
        const [headerLine] = content.split(/\r?\n/);
        const columns = headerLine
          ? headerLine.split(",").map((c) => c.trim())
          : [];
        return {
          success: true,
          file,
          type: "csv",
          columns,
        };
      }

      return { success: false, error: "Unbekanntes Datenformat." };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  }) as ToolFunction;

  inspectTool.description =
    "Liest Metadaten einer Datenquelle (Tabellen, Spalten, Indizes oder Struktur).";
  inspectTool.parameters = { file: "Pfad zur Datei (DB, JSON, CSV)" };
  inspectTool.category = "database";
  toolRegistry.register("inspect_database", inspectTool);

  /* 🧩 Flexible Abfrage */
  const queryTool = (async ({
    file,
    query,
    params = [],
    connectionString,
    type,
  }: {
    file?: string;
    query: string;
    params?: unknown[];
    connectionString?: string;
    type?: "sqlite" | "postgres" | "mysql" | "json";
  }) => {
    try {
      let rows: unknown[] = [];

      if (file && isSQLiteDatabase(file)) {
        rows = await querySQLite(file, query, params);
      } else if (connectionString && type === "postgres") {
        const client = await connectPostgres(connectionString);
        const res = await client.query(query, params);
        await client.end();
        rows = res.rows;
      } else if (connectionString && type === "mysql") {
        const conn = await connectMySQL(connectionString);
        const [res] = await conn.execute(query, params);
        await conn.end();
        rows = Array.isArray(res) ? (res as unknown[]) : [res];
      } else if (file?.endsWith(".json")) {
        const raw = JSON.parse(
          await fs.promises.readFile(file, "utf8"),
        ) as unknown;
        if (query.toLowerCase().startsWith("select")) {
          rows = Array.isArray(raw) ? (raw as unknown[]) : [raw];
        }
      } else {
        throw new Error("Kein unterstützter Datenbanktyp erkannt.");
      }

      return { success: true, count: rows.length, results: rows.slice(0, 100) };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  }) as ToolFunction;

  queryTool.description =
    "Führt Abfragen auf verschiedenen Datenquellen aus (SQLite, PostgreSQL, MySQL, JSON).";
  queryTool.parameters = {
    file: "Pfad zur Datei (optional)",
    connectionString: "DB-Verbindungszeichenkette (z. B. postgres://...)",
    type: "sqlite|postgres|mysql|json",
    query: "SQL-Abfrage",
    params: "Parameter",
  };
  queryTool.category = "database";
  toolRegistry.register("query_database", queryTool);

  /* 🧩 Indizes & Schemaqualität */
  const indexTool = (async ({ file }: { file: string }) => {
    try {
      if (!isSQLiteDatabase(file)) throw new Error("Nur SQLite unterstützt.");
      const tables = await querySQLite(
        file,
        "SELECT name FROM sqlite_master WHERE type='table';",
      );
      const results: Array<{
        table: string;
        indices: unknown[];
        columnCount: number;
      }> = [];
      for (const t of tables) {
        const tableName = (t as Record<string, unknown>).name as string;
        const idx = await querySQLite(file, `PRAGMA index_list(${tableName});`);
        const cols = await querySQLite(
          file,
          `PRAGMA table_info(${tableName});`,
        );
        results.push({
          table: tableName,
          indices: idx,
          columnCount: cols.length as number,
        });
      }
      const total = results.reduce(
        (a, r) => a + (Array.isArray(r.indices) ? r.indices.length : 0),
        0,
      );
      return { success: true, results, totalIndices: total };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  }) as ToolFunction;

  indexTool.description =
    "Überprüft Tabellenindizes und Schemaqualität (aktuell SQLite).";
  indexTool.parameters = { file: "Pfad zur SQLite-Datenbank" };
  indexTool.category = "database";
  toolRegistry.register("check_indices", indexTool);

  /* 📈 Performance-Analyse */
  const analyzeTool = (async ({ file }: { file: string }) => {
    try {
      if (!isSQLiteDatabase(file)) throw new Error("Nur SQLite unterstützt.");
      const stats = await querySQLite(file, "PRAGMA database_list;");
      const pageSize = await querySQLite(file, "PRAGMA page_size;");
      const pageCount = await querySQLite(file, "PRAGMA page_count;");
      const freelist = await querySQLite(file, "PRAGMA freelist_count;");
      const pageSizeVal = (pageSize[0] as Record<string, unknown>)
        ?.page_size as number;
      const pageCountVal = (pageCount[0] as Record<string, unknown>)
        ?.page_count as number;
      const freelistVal = (freelist[0] as Record<string, unknown>)
        ?.freelist_count as number;
      const size = pageSizeVal * pageCountVal;
      return {
        success: true,
        stats,
        pageSize: pageSizeVal,
        pageCount: pageCountVal,
        freelist: freelistVal,
        approxSizeMB: (size / 1024 / 1024).toFixed(2),
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  }) as ToolFunction;

  analyzeTool.description =
    "Liefert SQLite-Datenbankstatistiken und Größenanalyse.";
  analyzeTool.parameters = { file: "Pfad zur SQLite-Datenbank" };
  analyzeTool.category = "database";
  toolRegistry.register("analyze_database", analyzeTool);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : JSON.stringify(error);
}
