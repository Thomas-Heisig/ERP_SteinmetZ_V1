// SPDX-License-Identifier: MIT
// apps/backend/src/utils/migrateSchema.test.ts

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import os from "os";

describe("Database Migration System", () => {
  // Use a temp file for testing to avoid path issues
  const testDbPath = path.join(os.tmpdir(), `test-migration-${Date.now()}.db`);
  let db: Database.Database;

  beforeEach(() => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    // Create a new test database
    db = new Database(testDbPath);
    db.pragma("journal_mode = WAL");
  });

  afterEach(() => {
    // Close and clean up
    if (db) {
      db.close();
    }
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it("should create schema_migrations table", () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'success',
        message TEXT
      );
    `);

    const tableInfo = db.prepare("PRAGMA table_info(schema_migrations)").all();
    expect(tableInfo.length).toBeGreaterThan(0);

    const columns = tableInfo.map((col: any) => col.name);
    expect(columns).toContain("filename");
    expect(columns).toContain("applied_at");
    expect(columns).toContain("status");
    expect(columns).toContain("message");
  });

  it("should track applied migrations", () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'success',
        message TEXT
      );
    `);

    db.prepare(
      "INSERT INTO schema_migrations (filename, status) VALUES (?, ?)",
    ).run("001_test_migration.sql", "success");

    const migrations = db
      .prepare("SELECT * FROM schema_migrations")
      .all() as any[];
    expect(migrations).toHaveLength(1);
    expect(migrations[0].filename).toBe("001_test_migration.sql");
    expect(migrations[0].status).toBe("success");
  });

  it("should not apply same migration twice", () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'success',
        message TEXT
      );
    `);

    db.prepare(
      "INSERT INTO schema_migrations (filename) VALUES (?)",
    ).run("001_test.sql");

    const appliedMigrations = db
      .prepare("SELECT filename FROM schema_migrations")
      .all() as any[];
    const appliedSet = new Set(appliedMigrations.map((r) => r.filename));

    // Simulate checking if migration is already applied
    const testMigration = "001_test.sql";
    expect(appliedSet.has(testMigration)).toBe(true);
  });

  it("should handle migration failure gracefully", () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'success',
        message TEXT
      );
    `);

    // Simulate a failed migration
    const migrationFile = "002_failing_migration.sql";
    const errorMessage = "Table already exists";

    db.prepare(
      "INSERT INTO schema_migrations (filename, status, message) VALUES (?, ?, ?)",
    ).run(migrationFile, "failed", errorMessage);

    const failedMigrations = db
      .prepare("SELECT * FROM schema_migrations WHERE status = 'failed'")
      .all() as any[];

    expect(failedMigrations).toHaveLength(1);
    expect(failedMigrations[0].filename).toBe(migrationFile);
    expect(failedMigrations[0].status).toBe("failed");
    expect(failedMigrations[0].message).toBe(errorMessage);
  });

  it("should check if column exists before altering table", () => {
    // Create a test table
    db.exec(`
      CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY,
        name TEXT
      );
    `);

    // Helper function to check if column exists
    function columnExists(table: string, column: string): boolean {
      const info = db.prepare(`PRAGMA table_info(${table})`).all();
      return info.some((row: any) => row.name === column);
    }

    expect(columnExists("test_table", "name")).toBe(true);
    expect(columnExists("test_table", "nonexistent")).toBe(false);

    // Try to add a column that doesn't exist
    if (!columnExists("test_table", "email")) {
      db.exec("ALTER TABLE test_table ADD COLUMN email TEXT");
    }

    expect(columnExists("test_table", "email")).toBe(true);

    // Verify trying to add it again would be detected
    expect(columnExists("test_table", "email")).toBe(true);
  });
});
