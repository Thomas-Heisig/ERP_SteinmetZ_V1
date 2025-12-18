// SPDX-License-Identifier: MIT
// apps/backend/src/utils/migrateSchema.ts

import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { createLogger } from "./logger.js";

const logger = createLogger("schema-migration");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../../data/database.db");
const migrationsDir = path.resolve(__dirname, "../../data/migrations");

logger.info("📦 Starte Schema-Migration...");
logger.info({ dbPath }, "📁 Datenbank");
logger.info({ migrationsDir }, "📂 Migrations-Ordner");

// Sicherheitsprüfungen
if (!fs.existsSync(migrationsDir)) {
  logger.error(
    { migrationsDir },
    "❌ Fehler: Migrations-Ordner nicht gefunden!",
  );
  process.exit(1);
}
if (!fs.existsSync(dbPath)) {
  logger.error({ dbPath }, "❌ Fehler: Datenbankdatei existiert nicht!");
  process.exit(1);
}

// Datenbank öffnen
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Protokolltabelle sicherstellen
db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT UNIQUE NOT NULL,
    applied_at TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'success',
    message TEXT
  );
`);

// Bereits angewendete Migrationen abrufen
interface MigrationRow {
  filename: string;
}
const appliedRows = db
  .prepare("SELECT filename FROM schema_migrations")
  .all() as MigrationRow[];

const appliedMigrations = new Set<string>(appliedRows.map((r) => r.filename));

// Alle SQL-Dateien ermitteln
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (migrationFiles.length === 0) {
  logger.info("ℹ️  Keine Migrationsdateien gefunden.");
  process.exit(0);
}

logger.info(
  { count: migrationFiles.length },
  `📄 Gefundene Migrationen: ${migrationFiles.length}`,
);

// Hilfsfunktion: Prüft, ob eine Spalte existiert
function columnExists(table: string, column: string): boolean {
  try {
    const info = db.prepare(`PRAGMA table_info(${table});`).all();
    return info.some((row: any) => row.name === column);
  } catch {
    return false;
  }
}
// 🔹 Sicherstellen, dass neuere Spalten vorhanden sind
try {
  const columns = db.prepare("PRAGMA table_info(schema_migrations);").all();
  const names = columns.map((c: any) => c.name);
  if (!names.includes("status")) {
    db.exec(
      "ALTER TABLE schema_migrations ADD COLUMN status TEXT DEFAULT 'success';",
    );
  }
  if (!names.includes("message")) {
    db.exec("ALTER TABLE schema_migrations ADD COLUMN message TEXT;");
  }
} catch (err) {
  logger.warn({ err }, "⚠️  Konnte schema_migrations nicht prüfen");
}

// Migrationen anwenden
for (const file of migrationFiles) {
  if (appliedMigrations.has(file)) {
    logger.info(
      { file },
      `⏭️  Überspringe bereits angewendete Migration: ${file}`,
    );
    continue;
  }

  const filePath = path.join(migrationsDir, file);
  logger.info({ file }, `🚀 Wende Migration an: ${file}`);

  const sqlContent = fs.readFileSync(filePath, "utf8");
  const statements = sqlContent
    .split(/;\s*$/m)
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt && !stmt.startsWith("--"));

  // Wenn die Datei eine eigene Transaktion hat → keine neue starten
  const hasOwnTransaction = statements.some((s) =>
    /BEGIN\s+TRANSACTION/i.test(s),
  );

  if (!hasOwnTransaction) db.exec("BEGIN TRANSACTION;");
  let message = "";

  try {
    for (const stmt of statements) {
      // Prüft dynamisch: wenn ALTER TABLE nodes ADD COLUMN annotation_status …
      const alterMatch = stmt.match(
        /ALTER\s+TABLE\s+(\w+)\s+ADD\s+COLUMN\s+(\w+)/i,
      );
      if (alterMatch) {
        const [, table, column] = alterMatch;
        if (columnExists(table, column)) {
          logger.info(
            { table, column },
            `⚠️  Spalte '${column}' in Tabelle '${table}' existiert bereits – überspringe.`,
          );
          continue;
        }
      }

      db.exec(stmt);
    }

    if (!hasOwnTransaction) db.exec("COMMIT;");
    logger.info({ file }, `✅ Erfolgreich angewendet: ${file}`);

    db.prepare(
      "INSERT INTO schema_migrations (filename, status, message) VALUES (?, ?, ?)",
    ).run(file, "success", message);
  } catch (err: unknown) {
    message = err instanceof Error ? err.message : JSON.stringify(err, null, 2);
    logger.error({ file, message, err }, `❌ Fehler bei Migration ${file}`);

    if (!hasOwnTransaction) db.exec("ROLLBACK;");

    // Migration als "fehlerhaft" markieren, aber nicht alles abbrechen
    db.prepare(
      "INSERT INTO schema_migrations (filename, status, message) VALUES (?, ?, ?)",
    ).run(file, "failed", message);

    logger.warn({ file }, `➡️  Fahre mit nächster Migration fort.`);
  }
}

// Abschluss
db.close();
logger.info("🎉 Alle Migrationen abgeschlossen!");
