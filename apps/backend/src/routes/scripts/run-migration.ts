// SPDX-License-Identifier: MIT
// apps/backend/src/scripts/run-migration.ts

/**
 * Migration Script Runner
 * Executes SQL migration files against the database
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import db from "../routes/database/dbService.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("migration-runner");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Correct path: Navigate from src/routes/scripts/ to src/migrations/
const MIGRATIONS_DIR = path.join(__dirname, "..", "..", "migrations");

interface MigrationResult {
  executed: number;
  failed: number;
  statements: number;
}

/**
 * Execute a single SQL migration file from the migrations directory.
 *
 * @param migrationFile - File name (e.g. "010_create_tables.sql")
 * @returns Execution summary (executed / failed statements)
 */
async function runMigration(migrationFile: string): Promise<MigrationResult> {
  logger.info({ migrationFile }, "Starting migration execution");

  // Basic validation
  if (!migrationFile.endsWith(".sql")) {
    throw new Error("Migration file must have .sql extension");
  }

  const migrationPath = path.join(MIGRATIONS_DIR, migrationFile);

  try {
    // Initialize database connection
    await db.init();
    logger.info("Database connection established");

    // Read migration file
    const migrationSQL = await fs.readFile(migrationPath, "utf-8");
    logger.info({ migrationPath }, "Migration file loaded");

    // Split SQL statements (ignore line comments)
    const statements = migrationSQL
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    logger.info(
      { count: statements.length },
      "Found SQL statements to execute",
    );

    let executed = 0;

    await db.transaction(async () => {
      for (const statement of statements) {
        await db.exec(statement);
        executed += 1;
      }
    });

    logger.info(
      { executed, total: statements.length },
      "Migration executed successfully",
    );

    return { executed, failed: 0, statements: statements.length };
  } catch (error) {
    logger.error({ migrationPath, error }, "Migration failed");
    return { executed: 0, failed: 1, statements: 0 };
  }
}

async function main(): Promise<void> {
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    logger.error(
      { example: "010_create_tables.sql" },
      "Please provide a migration file name as argument",
    );
    process.exit(1);
    return;
  }

  const result = await runMigration(migrationFile);

  if (result.failed === 0) {
    logger.info({ ...result, migrationFile }, "✅ Migration completed");
    process.exit(0);
  } else {
    logger.error({ ...result, migrationFile }, "❌ Migration failed");
    process.exit(1);
  }
}

void main();
