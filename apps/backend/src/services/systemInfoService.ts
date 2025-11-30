// SPDX-License-Identifier: MIT
// apps/backend/src/services/systemInfoService.ts

/**
 * SystemInfoService
 * - Ermittelt Laufzeitinformationen über System, Node.js, Datenbank und Routen.
 * - Unterstützt SQLite und PostgreSQL.
 */

import type { Express, Application } from "express";


import os from "os";
import process from "process";
import db from "./dbService.js";

const isPostgres = (process.env.DB_DRIVER || "").toLowerCase() === "postgres";



/* ========================================================================== */
/*  Typdefinitionen                                                           */
/* ========================================================================== */

export type RouteInfo = { path: string; methods: string[]; middleware?: string };

export type DatabaseInfo = {
  tables: TableInfo[];
  rowCounts: Record<string, number>;
  sizeInfo: Record<string, string>;
};

export type TableInfo = {
  name: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
};

export type ColumnInfo = {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: any;
  primaryKey: boolean;
};

export type IndexInfo = { name: string; columns: string[]; unique: boolean };

export type SystemInfo = {
  nodejs: { version: string; platform: string; arch: string; uptime: number };
  process: {
    pid: number;
    memory: { rss: string; heapTotal: string; heapUsed: string; external: string };
    uptime: number;
  };
  system: {
    hostname: string;
    type: string;
    platform: string;
    arch: string;
    release: string;
    uptime: number;
    loadAverage: number[];
    totalMemory: string;
    freeMemory: string;
    cpus: number;
  };
  environment: {
    NODE_ENV: string;
    PORT: number;
    FUNCTIONS_DIR?: string;
    FUNCTIONS_AUTOLOAD: string;
    FUNCTIONS_AUTOPERSIST: string;
    FUNCTIONS_WATCH: string;
    AI_PROVIDER?: string;
    OPENAI_MODEL?: string;
  };
};

export type ServiceStatus = {
  database: { connected: boolean; tables: number; totalRows: number };
  functions: { loaded: boolean; nodes: number; lastLoad: string | null };
  ai: { provider: string; available: boolean; model: string };
};

/* ========================================================================== */
/*  Klasse                                                                    */
/* ========================================================================== */

class SystemInfoService {
/* ----------------------------------------------------------- */
/* Express-Routen rekursiv ermitteln                            */
/* ----------------------------------------------------------- */
getRegisteredRoutes(app: import('express').Application): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const seen = new Set<string>();

  const pushRoute = (path: string, methods: string[]) => {
    const normPath = path.replace(/\/+/g, '/');
    const normMethods = methods.map(m => m.toUpperCase()).sort();
    const key = `${normMethods.join(',')} ${normPath}`;
    if (!seen.has(key)) {
      seen.add(key);
      routes.push({ path: normPath, methods: normMethods });
    }
  };

  // Basis-Pfad aus Layer-Regex extrahieren
  const extractBasePathFromLayer = (layer: any): string => {
    if (!layer?.regexp || typeof layer.regexp.source !== 'string') return '';
    const raw = layer.regexp.source;
    let path = raw
      .replace(/\\\//g, '/')     // \/ -> /
      .replace(/(\(\?:\(\?\=\\\/\|\$\)\)\?)?\$$/, '') // Endmuster raus
      .replace(/^\\\^/, '')      // ^ entfernen
      .replace(/\$$/, '');       // $ entfernen
    if (!path.startsWith('/')) path = '/' + path;
    return path.replace(/\(\?:\(\?\=\/\|\$\)\)\?/g, '').replace(/\/\?$/, '');
  };

  const walkStack = (stack: any[], base = '') => {
    for (const layer of stack) {
      // direkte Route
      if (layer?.route?.path) {
        const methods = Object.keys(layer.route.methods || {}).map(m => m.toUpperCase());
        const full = (base + layer.route.path).replace(/\/+/g, '/');
        pushRoute(full, methods.length ? methods : ['GET']);
        continue;
      }

      // Sub-Router
      const isRouter = layer?.name === 'router' || !!layer?.handle?.stack;
      if (isRouter) {
        const basePart = extractBasePathFromLayer(layer);
        const nextBase = (base + basePart).replace(/\/+/g, '/');
        const subStack = layer?.handle?.stack || layer?.stack || [];
        walkStack(subStack, nextBase);
        continue;
      }

      // Einzel-Layer mit Methode
      if (layer?.method && layer?.handle) {
        const full = base.replace(/\/+/g, '/');
        pushRoute(full || '/', [String(layer.method).toUpperCase()]);
      }
    }
  };

  const stack = (app as any)?._router?.stack;
  if (Array.isArray(stack)) walkStack(stack, '');

  // sortieren
  routes.sort(
    (a, b) =>
      a.path.localeCompare(b.path) ||
      a.methods.join(',').localeCompare(b.methods.join(','))
  );
  return routes;
}

  /* ----------------------------------------------------------- */
  /* Datenbankinformationen                                       */
  /* ----------------------------------------------------------- */
  async getDatabaseInfo(): Promise<DatabaseInfo> {
    const result: DatabaseInfo = { tables: [], rowCounts: {}, sizeInfo: {} };
    try {
      await db.get(isPostgres ? "SELECT 1" : "SELECT 1 as ok");
      result.tables = await this.getTableInfo();
      result.rowCounts = await this.getRowCounts();
      result.sizeInfo = await this.getTableSizes();
      return result;
    } catch (err) {
      console.error("[db-info]", err);
      return result;
    }
  }

  private async getTableInfo(): Promise<TableInfo[]> {
    const tableInfos: TableInfo[] = [];

    try {
      if (isPostgres) {
        const tables = await db.all<{ table_name: string }>(`
          SELECT table_name
            FROM information_schema.tables
           WHERE table_schema='public' AND table_type='BASE TABLE'
           ORDER BY table_name
        `);

        for (const { table_name } of tables) {
          const columns = await db.all<any>(
            `
            SELECT c.column_name AS name, c.data_type AS type, c.is_nullable, c.column_default,
                   (c.column_name IN (
                     SELECT kcu.column_name
                       FROM information_schema.table_constraints tc
                       JOIN information_schema.key_column_usage kcu
                         ON tc.constraint_name=kcu.constraint_name AND tc.table_schema=kcu.table_schema
                      WHERE tc.table_name=$1 AND tc.table_schema='public' AND tc.constraint_type='PRIMARY KEY'
                   )) AS is_primary
              FROM information_schema.columns c
             WHERE c.table_name=$1 AND c.table_schema='public'
             ORDER BY c.ordinal_position
            `,
            [table_name]
          );

          const indexes = await db.all<{ name: string; indexdef: string }>(
            `SELECT indexname AS name, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename=$1`,
            [table_name]
          );

          const indexInfos = indexes.map(ix => ({
            name: ix.name,
            columns: this.extractPostgresIndexColumns(ix.indexdef),
            unique: ix.indexdef.includes("UNIQUE"),
          }));

          tableInfos.push({
            name: table_name,
            columns: columns.map(c => ({
              name: c.name,
              type: c.type,
              nullable: c.is_nullable === "YES",
              defaultValue: c.column_default,
              primaryKey: !!c.is_primary,
            })),
            indexes: indexInfos,
          });
        }
      } else {
        const tables = await db.all<{ name: string }>(
          `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
        );
        for (const { name } of tables) {
          const columns = await db.all<any>(`PRAGMA table_info("${name}")`);
          const indexes = await db.all<any>(`PRAGMA index_list("${name}")`);
          const indexInfos: IndexInfo[] = [];

          for (const idx of indexes) {
            const cols = await db.all<any>(`PRAGMA index_info("${idx.name}")`);
            indexInfos.push({ name: idx.name, columns: cols.map(c => c.name), unique: idx.unique === 1 });
          }

          tableInfos.push({
            name,
            columns: columns.map(c => ({
              name: c.name,
              type: c.type,
              nullable: c.notnull === 0,
              defaultValue: c.dflt_value,
              primaryKey: c.pk === 1,
            })),
            indexes: indexInfos,
          });
        }
      }
    } catch (err) {
      console.error("[db-tables]", err);
    }
    return tableInfos;
  }

  private extractPostgresIndexColumns(indexDef: string): string[] {
    try {
      const match = indexDef.match(/\(([^)]+)\)/);
      return match ? match[1].split(",").map(c => c.trim().replace(/"/g, "")) : [];
    } catch {
      return [];
    }
  }

  private async getRowCounts(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    const tables = isPostgres
      ? await db.all<{ table_name: string }>(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`)
      : await db.all<{ name: string }>(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`);

    for (const t of tables) {
      const name = isPostgres ? (t as any).table_name : (t as any).name;
      try {
        const r = await db.get<{ count: number }>(`SELECT COUNT(*) AS count FROM "${name}"`);
        counts[name] = r?.count ?? 0;
      } catch {
        counts[name] = 0;
      }
    }
    return counts;
  }

  private async getTableSizes(): Promise<Record<string, string>> {
    const sizes: Record<string, string> = {};
    try {
      if (isPostgres) {
        const rows = await db.all<{ relname: string; size: string }>(`
          SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) AS size
            FROM pg_catalog.pg_statio_user_tables
        `);
        rows.forEach(r => (sizes[r.relname] = r.size));
      } else {
        const tables = await db.all<{ name: string }>(
          `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
        );
        for (const { name } of tables) {
          const rc = await db.get<{ count: number }>(`SELECT COUNT(*) AS count FROM "${name}"`);
          sizes[name] = `${Math.max(1, Math.round((rc?.count ?? 0) / 100 + 1))} KB (estimated)`;
        }
      }
    } catch (err) {
      console.error("[db-size]", err);
    }
    return sizes;
  }

  /* ----------------------------------------------------------- */
  /* Systeminformationen                                          */
  /* ----------------------------------------------------------- */
  getSystemInfo(): SystemInfo {
    const formatMem = (b: number) => (b < 1024 ** 2 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 ** 2).toFixed(2)} MB`);
    const cpuCount = Array.isArray(os.cpus()) ? os.cpus().length : 0;

    return {
      nodejs: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: Math.round(process.uptime()),
      },
      process: {
        pid: process.pid,
        memory: {
          rss: formatMem(process.memoryUsage().rss),
          heapTotal: formatMem(process.memoryUsage().heapTotal),
          heapUsed: formatMem(process.memoryUsage().heapUsed),
          external: formatMem(process.memoryUsage().external),
        },
        uptime: Math.round(process.uptime()),
      },
      system: {
        hostname: os.hostname(),
        type: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        uptime: Math.round(os.uptime()),
        loadAverage: os.loadavg(),
        totalMemory: formatMem(os.totalmem()),
        freeMemory: formatMem(os.freemem()),
        cpus: cpuCount,
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV || "development",
        PORT: Number(process.env.PORT) || 3000,
        FUNCTIONS_DIR: process.env.FUNCTIONS_DIR,
        FUNCTIONS_AUTOLOAD: process.env.FUNCTIONS_AUTOLOAD || "1",
        FUNCTIONS_AUTOPERSIST: process.env.FUNCTIONS_AUTOPERSIST || "0",
        FUNCTIONS_WATCH: process.env.FUNCTIONS_WATCH || "0",
        AI_PROVIDER: process.env.AI_PROVIDER,
        OPENAI_MODEL: process.env.OPENAI_MODEL,
      },
    };
  }

  /* ----------------------------------------------------------- */
  /* Service-Status                                               */
  /* ----------------------------------------------------------- */
  async getServiceStatus(): Promise<ServiceStatus> {
    const status: ServiceStatus = {
      database: { connected: false, tables: 0, totalRows: 0 },
      functions: { loaded: false, nodes: 0, lastLoad: null },
      ai: { provider: "none", available: false, model: "none" },
    };

    try {
      await db.get("SELECT 1 AS test");
      status.database.connected = true;
      const tables = isPostgres
        ? await db.all<{ table_name: string }>(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`)
        : await db.all<{ name: string }>(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`);

      status.database.tables = tables.length;
      for (const t of tables) {
        const n = isPostgres ? (t as any).table_name : (t as any).name;
        const r = await db.get<{ count: number }>(`SELECT COUNT(*) AS count FROM "${n}"`);
        status.database.totalRows += r?.count ?? 0;
      }
    } catch (err) {
      console.error("[service-status]", err);
    }

    try {
      const c = await db.get<{ count: number }>(`SELECT COUNT(*) AS count FROM functions_nodes`);
      status.functions.nodes = c?.count ?? 0;
      status.functions.loaded = status.functions.nodes > 0;
      status.functions.lastLoad = new Date().toISOString();
    } catch {}

    const aiProv = process.env.AI_PROVIDER || "none";
    const aiModel = process.env.OPENAI_MODEL || "none";
    const hasKey = !!process.env.OPENAI_API_KEY || !!process.env.ANTHROPIC_API_KEY || !!process.env.GEMINI_API_KEY;
    status.ai = { provider: aiProv, model: aiModel, available: aiProv !== "none" && hasKey };

    return status;
  }

  /* ----------------------------------------------------------- */
  /* Komplettübersicht                                            */
  /* ----------------------------------------------------------- */

async getCompleteSystemOverview(app?: any) {
  // robuste App-Ermittlung
  const expressApp: import('express').Application | undefined =
    app ?? (globalThis as any).expressApp;

  if (!expressApp) {
    throw new Error('Express-App nicht registriert (global)');
  }

  // Routen versuchen; bei Nichterfolg nicht crashen
  let routeList: RouteInfo[] = [];
  try {
    routeList = this.getRegisteredRoutes(expressApp);
  } catch (e) {
    console.warn('[systemInfo] getRegisteredRoutes() fehlgeschlagen:', e);
    routeList = [];
  }

  const [dbInfo, systemInfo, serviceStatus] = await Promise.all([
    this.getDatabaseInfo(),
    Promise.resolve(this.getSystemInfo()),
    this.getServiceStatus(),
  ]);

  return {
    timestamp: new Date().toISOString(),
    serviceStatus,
    systemInfo,
    routes: {
      count: routeList.length,
      endpoints: routeList, // <— wichtig: { path, methods } pro Eintrag
    },
    database: dbInfo,
  };
}

  /* ----------------------------------------------------------- */
  /* Weitere Hilfsfunktionen                                     */
  /* ----------------------------------------------------------- */
  async getFunctionsSummary() {
    try {
      const rows = await db.all<{ name: string; kind: string; description?: string }>(
        `SELECT name, kind, description FROM functions_nodes ORDER BY name`
      );
      return { success: true, count: rows.length, nodes: rows };
    } catch (err) {
      return { success: false, count: 0, nodes: [], error: String(err) };
    }
  }

  getSanitizedEnvironment(): Record<string, string> {
    const hide = ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "DATABASE_URL", "JWT_SECRET"];
    const env: Record<string, string> = {};
    for (const [k, v] of Object.entries(process.env)) env[k] = hide.includes(k) ? "***" : v || "";
    return env;
  }

  getDependenciesSummary(): Record<string, any> {
    try {
      const pkgPath = require.resolve("../../../package.json");
      const pkg = require(pkgPath);
      return { name: pkg.name, version: pkg.version, dependencies: pkg.dependencies, devDependencies: pkg.devDependencies };
    } catch (err) {
      return { error: String(err) };
    }
  }

  async runSystemDiagnostics(): Promise<Record<string, any>> {
    const res: any = { timestamp: new Date().toISOString(), status: "ok" };
    try {
      res.databaseConnected = await db.get("SELECT 1 AS ok").then(() => true).catch(() => false);
      res.aiProvider = process.env.AI_PROVIDER || "none";
      res.hasAIKey = !!process.env.OPENAI_API_KEY || !!process.env.ANTHROPIC_API_KEY || !!process.env.GEMINI_API_KEY;
      const mem = process.memoryUsage();
      res.memory = { rssMB: (mem.rss / 1024 / 1024).toFixed(2), heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(2) };
      res.system = { hostname: os.hostname(), platform: os.platform(), load: os.loadavg().map(n => n.toFixed(2)) };
    } catch (err) {
      res.status = "error";
      res.error = String(err);
    }
    return res;
  }

  getBackendFeatureFlags(): Record<string, string> {
    const f = {
      FUNCTIONS_AUTOLOAD: process.env.FUNCTIONS_AUTOLOAD || "1",
      FUNCTIONS_AUTOPERSIST: process.env.FUNCTIONS_AUTOPERSIST || "0",
      FUNCTIONS_WATCH: process.env.FUNCTIONS_WATCH || "0",
      AI_PROVIDER: process.env.AI_PROVIDER || "none",
      FALLBACK_WIKI: process.env.FALLBACK_WIKI || "0",
      LOG_LEVEL: process.env.LOG_LEVEL || "info",
    };
    return Object.fromEntries(Object.entries(f).filter(([_, v]) => v !== ""));
  }

  getResourceUsage(): Record<string, any> {
    const mem = process.memoryUsage();
    const f = (b: number) => `${(b / 1024 / 1024).toFixed(2)} MB`;
    const load = os.loadavg();
    return {
      cpuLoad1m: load[0].toFixed(2),
      cpuLoad5m: load[1].toFixed(2),
      cpuLoad15m: load[2].toFixed(2),
      memoryRSS: f(mem.rss),
      heapUsed: f(mem.heapUsed),
      uptimeSec: process.uptime().toFixed(0),
      cpuCount: os.cpus().length,
    };
  }

  async runCommand(command: string) {
    const ENABLE_SHELL = process.env.ENABLE_SHELL === "1";
    if (!ENABLE_SHELL) return { success: false, command, error: "Shell deaktiviert" };
    if (!command.trim()) return { success: false, command, error: "Kein Befehl angegeben" };

    const allowed = ["ls", "pwd", "df", "du", "free", "top", "uptime", "cat", "whoami", "ps", "echo"];
    if (!allowed.some(c => command.startsWith(c))) return { success: false, command, error: "Befehl nicht erlaubt" };

    const { exec } = await import("child_process");
    const util = await import("util");
    const execAsync = util.promisify(exec);

    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 7000 });
      return { success: true, command, output: stdout.trim() || stderr.trim() };
    } catch (err: any) {
      return { success: false, command, error: err.stderr || err.message || String(err) };
    }
  }
}

export default new SystemInfoService();
