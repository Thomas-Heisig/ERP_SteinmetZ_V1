const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join("f:", "ERP_SteinmetZ_V1", "data", "dev.sqlite3");
const db = new Database(dbPath);

console.log("Dropping existing settings tables...");

try {
  db.exec("DROP TABLE IF EXISTS system_settings_history");
  console.log("✅ Dropped system_settings_history");

  db.exec("DROP TABLE IF EXISTS system_settings");
  console.log("✅ Dropped system_settings");

  // Check if migrations table exists
  const migrationsTable = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'",
    )
    .get();
  if (migrationsTable) {
    db.exec("DELETE FROM migrations WHERE name LIKE '%system_settings%'");
    console.log("✅ Removed migration record");
  } else {
    console.log("ℹ️  No migrations table found");
  }

  console.log("\n✅ All tables dropped successfully");
  console.log("Server will recreate them on next restart");
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}

db.close();
