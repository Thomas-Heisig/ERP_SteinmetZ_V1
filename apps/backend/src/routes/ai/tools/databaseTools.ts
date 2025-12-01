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
let betterSqlite3: any = null;
let sqlite3: any = null;
let pg: any = null;
let mysql: any = null;
try {
  betterSqlite3 = require("better-sqlite3");
} catch {}
try {
  sqlite3 = require("sqlite3");
} catch {}
try {
  pg = require("pg");
} catch {}
try {
  mysql = require("mysql2/promise");
} catch {}

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
  params?: any[],
): Promise<any[]> {
  if (betterSqlite3) {
    const db = new betterSqlite3(file, { readonly: true });
    const res = db.prepare(sql).all(params || []);
    db.close();
    return res;
  }
  if (sqlite3) {
    const db = new sqlite3.Database(file);
    return new Promise((resolve, reject) => {
      db.all(sql, params || [], (err: any, rows: any[]) => {
        db.close();
        if (err) reject(err);
        else resolve(rows);
      });
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
  const scanTool = (async ({ directory = "./" }: { directory?: string }) => {
    try {
      const abs = path.resolve(directory);
      const files = await scanDatabases(abs);
      return {
        success: true,
        directory: abs,
        databases: files,
        count: files.length,
      };
    } catch (err) {
      return { success: false, error: String(err) };
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
        const meta: Record<string, any> = {};
        for (const t of tables) {
          const columns = await querySQLite(
            file,
            `PRAGMA table_info(${t.name});`,
          );
          const indices = await querySQLite(
            file,
            `PRAGMA index_list(${t.name});`,
          );
          meta[t.name] = { columns, indices };
        }
        return {
          success: true,
          file,
          meta,
          tableCount: Object.keys(meta).length,
        };
      }

      if (file.endsWith(".json")) {
        const json = JSON.parse(await fs.promises.readFile(file, "utf8"));
        const keys = Array.isArray(json)
          ? Object.keys(json[0] ?? {})
          : Object.keys(json);
        return {
          success: true,
          file,
          type: "json",
          keys,
          sample: json[0] ?? json,
        };
      }

      if (file.endsWith(".csv")) {
        const content = await fs.promises.readFile(file, "utf8");
        const [headerLine] = content.split(/\r?\n/);
        return {
          success: true,
          file,
          type: "csv",
          columns: headerLine.split(","),
        };
      }

      return { success: false, error: "Unbekanntes Datenformat." };
    } catch (err) {
      return { success: false, error: String(err) };
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
    params?: any[];
    connectionString?: string;
    type?: "sqlite" | "postgres" | "mysql" | "json";
  }) => {
    try {
      let rows: any[] = [];

      if (file && isSQLiteDatabase(file))
        rows = await querySQLite(file, query, params);
      else if (connectionString && type === "postgres") {
        const client = await connectPostgres(connectionString);
        const res = await client.query(query, params);
        await client.end();
        rows = res.rows;
      } else if (connectionString && type === "mysql") {
        const conn = await connectMySQL(connectionString);
        const [res] = await conn.execute(query, params);
        await conn.end();
        rows = Array.isArray(res) ? res : [res];
      } else if (file?.endsWith(".json")) {
        const json = JSON.parse(await fs.promises.readFile(file, "utf8"));
        if (query.toLowerCase().startsWith("select"))
          rows = Array.isArray(json) ? json : [json];
      } else {
        throw new Error("Kein unterstützter Datenbanktyp erkannt.");
      }

      return { success: true, count: rows.length, results: rows.slice(0, 100) };
    } catch (err) {
      return { success: false, error: String(err) };
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
      const results: any[] = [];
      for (const t of tables) {
        const idx = await querySQLite(file, `PRAGMA index_list(${t.name});`);
        const cols = await querySQLite(file, `PRAGMA table_info(${t.name});`);
        results.push({ table: t.name, indices: idx, columnCount: cols.length });
      }
      const total = results.reduce((a, r) => a + r.indices.length, 0);
      return { success: true, results, totalIndices: total };
    } catch (err) {
      return { success: false, error: String(err) };
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
      const size = pageSize[0]?.page_size * pageCount[0]?.page_count;
      return {
        success: true,
        stats,
        pageSize: pageSize[0]?.page_size,
        pageCount: pageCount[0]?.page_count,
        freelist: freelist[0]?.freelist_count,
        approxSizeMB: (size / 1024 / 1024).toFixed(2),
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }) as ToolFunction;

  analyzeTool.description =
    "Liefert SQLite-Datenbankstatistiken und Größenanalyse.";
  analyzeTool.parameters = { file: "Pfad zur SQLite-Datenbank" };
  analyzeTool.category = "database";
  toolRegistry.register("analyze_database", analyzeTool);
}
