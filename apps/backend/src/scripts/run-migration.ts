// SPDX-License-Identifier: MIT
// apps/backend/src/scripts/run-migration.ts

/**
 * Migration Script Runner
 * Executes SQL migration files against the database
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "../services/dbService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration(migrationFile: string) {
  console.log(`🔄 Running migration: ${migrationFile}`);
  
  try {
    // Initialize database connection
    await db.init();
    console.log("✅ Database connection established");
    
    // Read migration file
    const migrationPath = path.join(__dirname, "..", "migrations", migrationFile);
    const migrationSQL = await fs.readFile(migrationPath, "utf-8");
    console.log(`📄 Migration file loaded: ${migrationPath}`);
    
    // Split SQL statements (simple split by semicolon)
    // Remove comments first
    const cleanSQL = migrationSQL
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove /* */ comments
      .replace(/--.*$/gm, "")           // Remove -- comments
      .replace(/^\/\/.*$/gm, "");       // Remove // comments
    
    const statements = cleanSQL
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        await db.run(statement);
        successCount++;
      } catch (error: any) {
        // Ignore "UNIQUE constraint failed" for INSERT OR IGNORE
        if (error.message && error.message.includes("UNIQUE constraint")) {
          console.log(`⚠️  Skipped duplicate entry (expected behavior)`);
          successCount++;
        } else {
          console.error(`❌ Error executing statement:`, statement.substring(0, 100));
          console.error(`   Error:`, error.message);
          errorCount++;
        }
      }
    }
    
    console.log(`\n✅ Migration completed!`);
    console.log(`   Success: ${successCount} statements`);
    console.log(`   Errors: ${errorCount} statements`);
    
    // Verify settings count
    const result = await db.get("SELECT COUNT(*) as count FROM system_settings");
    console.log(`\n📊 Total settings in database: ${result.count}`);
    
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2] || "add_extended_settings.sql";

runMigration(migrationFile);
