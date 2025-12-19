// SPDX-License-Identifier: MIT
// apps/backend/src/utils/runMigrations.ts

/**
 * Database Migration Runner
 *
 * Automatically runs SQL migration files in order
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "../services/dbService.js";
import { createLogger } from "./logger.js";

const logger = createLogger("migrations");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, "../migrations");

interface Migration {
  filename: string;
  path: string;
}

/**
 * Get all SQL migration files sorted by filename
 */
async function getMigrationFiles(): Promise<Migration[]> {
  try {
    const files = await fs.readdir(MIGRATIONS_DIR);

    // Get current database driver
    const driver = process.env.DB_DRIVER || "sqlite";

    const sqlFiles = files
      .filter((f) => f.endsWith(".sql"))
      // Skip MSSQL-specific migrations when using SQLite
      .filter((f) => {
        if (driver === "sqlite" && f.includes("_mssql")) {
          logger.info(
            { migration: f },
            "Skipping MSSQL-specific migration (SQLite database)",
          );
          return false;
        }
        return true;
      })
      .sort()
      .map((f) => ({
        filename: f,
        path: path.join(MIGRATIONS_DIR, f),
      }));

    return sqlFiles;
  } catch (error) {
    logger.error({ error }, "Failed to read migrations directory");
    return [];
  }
}

/**
 * Split SQL file into individual statements
 */
function splitSQLStatements(sql: string): string[] {
  // Remove comments
  const withoutComments = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  // Split by semicolon but not inside strings
  const statements = withoutComments
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return statements;
}

/**
 * Check if a migration has already been executed
 */
async function isMigrationExecuted(filename: string): Promise<boolean> {
  try {
    const result = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM database_migrations WHERE name = ?",
      [filename],
    );
    return (result?.count ?? 0) > 0;
  } catch (_error) {
    // If table doesn't exist yet, no migrations have been run
    return false;
  }
}

/**
 * Record a migration as executed
 */
async function recordMigration(filename: string): Promise<void> {
  const now = new Date().toISOString();
  await db.run(
    "INSERT INTO database_migrations (name, executed_at) VALUES (?, ?)",
    [filename, now],
  );
}

/**
 * Execute a single migration file
 */
async function executeMigration(migration: Migration): Promise<boolean> {
  try {
    // Check if already executed
    const executed = await isMigrationExecuted(migration.filename);
    if (executed) {
      logger.info(
        { migration: migration.filename },
        "Migration already executed, skipping",
      );
      return true;
    }

    logger.info({ migration: migration.filename }, "Executing migration");

    // Read migration file
    const sql = await fs.readFile(migration.path, "utf-8");

    // Split into individual statements
    const statements = splitSQLStatements(sql);

    // Execute each statement in a transaction
    await db.transaction(async () => {
      for (const statement of statements) {
        if (statement.trim()) {
          await db.exec(statement);
        }
      }

      // Record migration as executed
      await recordMigration(migration.filename);
    });

    logger.info(
      { migration: migration.filename },
      "Migration completed successfully",
    );
    return true;
  } catch (error) {
    logger.error({ migration: migration.filename, error }, "Migration failed");
    return false;
  }
}

/**
 * Run all pending migrations
 */
export async function runAllMigrations(): Promise<{
  success: boolean;
  executed: number;
  failed: number;
}> {
  logger.info("Starting database migrations");

  try {
    // Ensure database is initialized
    await db.init();

    // Get all migration files
    const migrations = await getMigrationFiles();

    if (migrations.length === 0) {
      logger.info("No migrations found");
      return { success: true, executed: 0, failed: 0 };
    }

    logger.info({ count: migrations.length }, "Found migration files");

    let executed = 0;
    let failed = 0;

    // Execute each migration in order
    for (const migration of migrations) {
      const success = await executeMigration(migration);
      if (success) {
        executed++;
      } else {
        failed++;
        // Stop on first failure
        break;
      }
    }

    const success = failed === 0;
    logger.info({ executed, failed, success }, "Migration run completed");

    return { success, executed, failed };
  } catch (error) {
    logger.error({ error }, "Migration run failed");
    return { success: false, executed: 0, failed: 1 };
  }
}

/**
 * CLI entry point
 */
async function main() {
  const result = await runAllMigrations();

  if (result.success) {
    logger.info(
      { executed: result.executed, failed: result.failed },
      "✅ Migrations completed",
    );
    process.exit(0);
  } else {
    logger.error(
      { executed: result.executed, failed: result.failed },
      "❌ Migrations failed",
    );
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error({ error }, "Fatal error during migration");
    process.exit(1);
  });
}
