// SPDX-License-Identifier: MIT
// apps/backend/src/service/DatabaseService.ts

/**
 * Zentrale Datenbankservice Klasse
 *
 * Vereinheitlichte Datenbankabstraktion für SQLite und PostgreSQL.
 * Handles Schema-Management, Migrationen, Query-Ausführung und Monitoring.
 *
 * @module service/DatabaseService
 *
 * @example
 * ```typescript
 * import { DatabaseService } from './service/DatabaseService.js';
 *
 * const db = new DatabaseService({
 *   driver: 'sqlite',
 *   sqliteFile: './data/dev.sqlite3'
 * });
 *
 * await db.init();
 * const users = await db.all('SELECT * FROM users WHERE active = ?', [true]);
 * ```
 */

import { createLogger } from "../utils/logger.js";
import {
  DatabaseConfig,
  DatabaseConfigSchema,
  QueryResult,
  QuerySingleResult,
  MutationResult,
  SqlParameters,
  HealthStatus,
  QueryStats,
  BetterSqlite3Database,
} from "../types/database.js";
import {
  DatabaseError,
  DatabaseConnectionError,
  TransactionError,
} from "../types/errors.js";

const logger = createLogger("DatabaseService");

/**
 * Zentrale Datenbankservice Klasse
 *
 * Verwaltet alle Datenbankoperationen mit konsistenter API.
 */
export class DatabaseService {
  private config: DatabaseConfig;
  private db: BetterSqlite3Database | null = null;
  private isInitialized = false;
  private queryStats: QueryStats[] = [];

  /**
   * Erstellt neue DatabaseService Instanz
   *
   * @param config - Datenbankonfiguration (optional)
   *
   * @throws {Error} Falls Config ungültig ist
   */
  constructor(config?: Partial<DatabaseConfig>) {
    const defaultConfig: DatabaseConfig = {
      driver: "sqlite",
      sqliteFile: process.env.SQLITE_FILE || "./data/dev.sqlite3",
      postgresUrl: process.env.DATABASE_URL,
      maxConnections: 10,
      timeout: 5000,
      enableWAL: true,
      retryAttempts: 3,
      logging: process.env.DB_LOGGING === "true",
    };

    this.config = DatabaseConfigSchema.parse({
      ...defaultConfig,
      ...config,
    });

    logger.info(
      { driver: this.config.driver, logging: this.config.logging },
      "DatabaseService initialized",
    );
  }

  /**
   * Initialisiert die Datenbankverbindung
   *
   * @throws {DatabaseConnectionError} Falls Verbindung fehlschlägt
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      logger.debug("Database already initialized");
      return;
    }

    try {
      if (this.config.driver === "sqlite") {
        await this.initSqlite();
      } else {
        await this.initPostgres();
      }

      this.isInitialized = true;
      logger.info(
        { driver: this.config.driver },
        "Database connection initialized",
      );
    } catch (error) {
      logger.error({ error }, "Database initialization failed");
      throw error;
    }
  }

  /**
   * SQLite-Initialisierung
   *
   * @private
   */
  private async initSqlite(): Promise<void> {
    try {
      const Database = (
        await import("better-sqlite3")
      ).default;

      this.db = new Database(this.config.sqliteFile || "./data/dev.sqlite3", {
        timeout: this.config.timeout,
      });

      // PRAGMA-Befehle für Performance
      if (this.config.enableWAL) {
        this.db.pragma("journal_mode = WAL");
      }
      this.db.pragma("foreign_keys = ON");
      this.db.pragma("busy_timeout = 5000");

      logger.info(
        { file: this.config.sqliteFile },
        "SQLite database initialized",
      );
    } catch (_error) {
      throw new DatabaseConnectionError(
        "Failed to initialize SQLite",
        "sqlite",
        this.config.sqliteFile,
      );
    }
  }

  /**
   * PostgreSQL-Initialisierung
   *
   * @private
   */
  private async initPostgres(): Promise<void> {
    if (!this.config.postgresUrl) {
      throw new DatabaseConnectionError(
        "DATABASE_URL not provided for PostgreSQL",
        "postgres",
      );
    }

    try {
      // TODO: Implementiere PostgreSQL-Connection
      logger.warn("PostgreSQL support not yet implemented");
    } catch (_error) {
      throw new DatabaseConnectionError(
        "Failed to initialize PostgreSQL",
        "postgres",
        this.config.postgresUrl,
      );
    }
  }

  /**
   * Führt SELECT-Abfrage aus und gibt alle Zeilen zurück
   *
   * @param sql - SQL-Statement
   * @param params - Query-Parameter
   * @returns Array von Abfrageergebnissen
   *
   * @throws {DatabaseError} Falls Abfrage fehlschlägt
   *
   * @example
   * ```typescript
   * const users = await db.all('SELECT * FROM users WHERE active = ?', [true]);
   * ```
   */
  async all<T = unknown>(
    sql: string,
    params?: SqlParameters,
  ): Promise<QueryResult<T>> {
    this.ensureInitialized();

    const startTime = Date.now();
    try {
      if (!this.db) throw new Error("Database not initialized");

      const stmt = this.db.prepare(sql);
      const results = stmt.all(params) as T[];

      this.recordQueryStats(sql, params, Date.now() - startTime, true);
      return results;
    } catch (error) {
      this.recordQueryStats(sql, params, Date.now() - startTime, false);
      throw new DatabaseError(
        "Query execution failed",
        sql,
        (params ?? []) as unknown[],
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Führt SELECT-Abfrage aus und gibt einzelne Zeile zurück
   *
   * @param sql - SQL-Statement
   * @param params - Query-Parameter
   * @returns Erste Zeile oder undefined
   *
   * @throws {DatabaseError} Falls Abfrage fehlschlägt
   *
   * @example
   * ```typescript
   * const user = await db.get('SELECT * FROM users WHERE id = ?', ['123']);
   * ```
   */
  async get<T = unknown>(
    sql: string,
    params?: SqlParameters,
  ): Promise<QuerySingleResult<T>> {
    const results = await this.all<T>(sql, params);
    return results[0];
  }

  /**
   * Führt INSERT/UPDATE/DELETE aus
   *
   * @param sql - SQL-Statement
   * @param params - Query-Parameter
   * @returns Mutations-Ergebnis
   *
   * @throws {DatabaseError} Falls Abfrage fehlschlägt
   *
   * @example
   * ```typescript
   * const result = await db.run(
   *   'INSERT INTO users (name, email) VALUES (?, ?)',
   *   ['John', 'john@example.com']
   * );
   * console.log(result.lastInsertRowid);
   * ```
   */
  async run(
    sql: string,
    params?: SqlParameters,
  ): Promise<MutationResult> {
    this.ensureInitialized();

    const startTime = Date.now();
    try {
      if (!this.db) throw new Error("Database not initialized");

      const stmt = this.db.prepare(sql);
      const result = stmt.run(params);

      this.recordQueryStats(sql, params, Date.now() - startTime, true);

      return {
        changes: result.changes,
        lastInsertRowid: result.lastInsertRowid,
      };
    } catch (error) {
      this.recordQueryStats(sql, params, Date.now() - startTime, false);
      throw new DatabaseError(
        "Mutation execution failed",
        sql,
        (params ?? []) as unknown[],
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Führt SQL-Statements ohne Rückgabewert aus
   *
   * @param sql - SQL-Statement
   * @param params - Query-Parameter
   *
   * @throws {DatabaseError} Falls Ausführung fehlschlägt
   *
   * @example
   * ```typescript
   * await db.exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY)');
   * ```
   */
  async exec(sql: string, params?: SqlParameters): Promise<void> {
    this.ensureInitialized();

    const startTime = Date.now();
    try {
      if (!this.db) throw new Error("Database not initialized");

      if (params) {
        const stmt = this.db.prepare(sql);
        stmt.run(params);
      } else {
        this.db.exec(sql);
      }

      this.recordQueryStats(sql, params, Date.now() - startTime, true);
    } catch (error) {
      this.recordQueryStats(sql, params, Date.now() - startTime, false);
      throw new DatabaseError(
        "Execution failed",
        sql,
        (params ?? []) as unknown[],
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Führt Transaktion aus
   *
   * @param callback - Transaktions-Callback
   * @returns Ergebnis des Callbacks
   *
   * @throws {TransactionError} Falls Transaktion fehlschlägt
   *
   * @example
   * ```typescript
   * const result = await db.transaction(async () => {
   *   await db.run('INSERT INTO users VALUES (?, ?)', ['John', 'john@example.com']);
   *   return 'Success';
   * });
   * ```
   */
  async transaction<T = unknown>(
    callback: () => Promise<T>,
  ): Promise<T> {
    this.ensureInitialized();

    try {
      if (!this.db) throw new Error("Database not initialized");

      this.db.exec("BEGIN");
      try {
        const result = await callback();
        this.db.exec("COMMIT");
        return result;
      } catch (error) {
        this.db.exec("ROLLBACK");
        throw new TransactionError("Transaction failed", { error: String(error) });
      }
    } catch (error) {
      throw error instanceof TransactionError
        ? error
        : new TransactionError("Unexpected transaction error", { error: String(error) });
    }
  }

  /**
   * Health Check für Datenbank
   *
   * @returns Health Status
   *
   * @example
   * ```typescript
   * const health = await db.healthCheck();
   * console.log(health.status); // 'healthy' | 'degraded' | 'unhealthy'
   * ```
   */
  async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
      this.ensureInitialized();
      await this.get("SELECT 1 as health_check");

      return {
        status: "healthy",
        driver: this.config.driver,
        latency: Date.now() - startTime,
      };
    } catch (error) {
      logger.error({ error }, "Health check failed");

      return {
        status: "unhealthy",
        driver: this.config.driver,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Schließt Datenbankverbindung
   *
   * @example
   * ```typescript
   * await db.close();
   * ```
   */
  async close(): Promise<void> {
    if (this.db && this.config.driver === "sqlite") {
      this.db.close();
      this.isInitialized = false;
      logger.info("Database connection closed");
    }
  }

  /**
   * Gibt Konfiguration zurück
   */
  getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  /**
   * Gibt Query-Statistiken zurück
   */
  getQueryStats(): QueryStats[] {
    return [...this.queryStats];
  }

  /**
   * Löscht Query-Statistiken
   */
  clearQueryStats(): void {
    this.queryStats = [];
  }

  /**
   * Prüft ob Datenbank initialisiert ist
   *
   * @private
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        "Database not initialized. Call init() first.",
      );
    }
  }

  /**
   * Registriert Query-Statistiken
   *
   * @private
   */
  private recordQueryStats(
    query: string,
    params: SqlParameters,
    duration: number,
    success: boolean,
  ): void {
    if (!this.config.logging) return;

    const stats: QueryStats = {
      query,
      paramCount: Array.isArray(params) ? params.length : 0,
      duration,
      success,
      timestamp: new Date().toISOString(),
    };

    this.queryStats.push(stats);

    // Limit query stats to last 1000
    if (this.queryStats.length > 1000) {
      this.queryStats = this.queryStats.slice(-1000);
    }
  }
}
