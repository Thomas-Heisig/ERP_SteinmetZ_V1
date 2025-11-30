// SPDX-License-Identifier: MIT
// apps/backend/src/utils/migrateSchema.ts

import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../../data/database.db");
const migrationsDir = path.resolve(__dirname, "../../data/migrations");

console.log("📦 Starte Schema-Migration...");
console.log("📁 Datenbank:", dbPath);
console.log("📂 Migrations-Ordner:", migrationsDir);

// Sicherheitsprüfungen
if (!fs.existsSync(migrationsDir)) {
  console.error("❌ Fehler: Migrations-Ordner nicht gefunden!");
  process.exit(1);
}
if (!fs.existsSync(dbPath)) {
  console.error("❌ Fehler: Datenbankdatei existiert nicht!");
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
  console.log("ℹ️  Keine Migrationsdateien gefunden.");
  process.exit(0);
}

console.log(`📄 Gefundene Migrationen: ${migrationFiles.length}\n`);

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
    db.exec("ALTER TABLE schema_migrations ADD COLUMN status TEXT DEFAULT 'success';");
  }
  if (!names.includes("message")) {
    db.exec("ALTER TABLE schema_migrations ADD COLUMN message TEXT;");
  }
} catch (err) {
  console.warn("⚠️  Konnte schema_migrations nicht prüfen:", err);
}

// Migrationen anwenden
for (const file of migrationFiles) {
  if (appliedMigrations.has(file)) {
    console.log(`⏭️  Überspringe bereits angewendete Migration: ${file}`);
    continue;
  }

  const filePath = path.join(migrationsDir, file);
  console.log(`🚀 Wende Migration an: ${file}`);

  const sqlContent = fs.readFileSync(filePath, "utf8");
  const statements = sqlContent
    .split(/;\s*$/m)
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt && !stmt.startsWith("--"));

  // Wenn die Datei eine eigene Transaktion hat → keine neue starten
  const hasOwnTransaction = statements.some((s) =>
    /BEGIN\s+TRANSACTION/i.test(s)
  );

  if (!hasOwnTransaction) db.exec("BEGIN TRANSACTION;");
  let success = true;
  let message = "";

  try {
    for (const stmt of statements) {
      // Prüft dynamisch: wenn ALTER TABLE nodes ADD COLUMN annotation_status …
      const alterMatch = stmt.match(
        /ALTER\s+TABLE\s+(\w+)\s+ADD\s+COLUMN\s+(\w+)/i
      );
      if (alterMatch) {
        const [, table, column] = alterMatch;
        if (columnExists(table, column)) {
          console.log(
            `⚠️  Spalte '${column}' in Tabelle '${table}' existiert bereits – überspringe.`
          );
          continue;
        }
      }

      db.exec(stmt);
    }

    if (!hasOwnTransaction) db.exec("COMMIT;");
    console.log(`✅ Erfolgreich angewendet: ${file}\n`);

    db.prepare(
      "INSERT INTO schema_migrations (filename, status, message) VALUES (?, ?, ?)"
    ).run(file, "success", message);
  } catch (err: unknown) {
    success = false;
    message =
      err instanceof Error ? err.message : JSON.stringify(err, null, 2);
    console.error(`❌ Fehler bei Migration ${file}: ${message}`);

    if (!hasOwnTransaction) db.exec("ROLLBACK;");

    // Migration als "fehlerhaft" markieren, aber nicht alles abbrechen
    db.prepare(
      "INSERT INTO schema_migrations (filename, status, message) VALUES (?, ?, ?)"
    ).run(file, "failed", message);

    console.warn(`➡️  Fahre mit nächster Migration fort.\n`);
  }
}

// Abschluss
db.close();
console.log("🎉 Alle Migrationen abgeschlossen!");
