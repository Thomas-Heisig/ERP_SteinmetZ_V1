// SPDX-License-Identifier: MIT
// apps/backend/scripts/analyzeIndexes.ts
// Database Index Analyzer - Identifies missing and unused indexes

import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface IndexInfo {
  name: string;
  tableName: string;
  sql: string;
  isUnique: boolean;
}

interface TableInfo {
  name: string;
  columns: string[];
}

interface IndexRecommendation {
  table: string;
  column: string;
  reason: string;
  priority: "high" | "medium" | "low";
  sql: string;
}

/**
 * Analyzes database schema and recommends index optimizations
 */
class IndexAnalyzer {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath, { readonly: true });
  }

  /**
   * Get all tables in the database
   */
  getTables(): TableInfo[] {
    const tables = this.db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`,
      )
      .all() as { name: string }[];

    return tables.map((table) => ({
      name: table.name,
      columns: this.getTableColumns(table.name),
    }));
  }

  /**
   * Get columns for a specific table
   */
  getTableColumns(tableName: string): string[] {
    const columns = this.db
      .prepare(`PRAGMA table_info(${tableName})`)
      .all() as { name: string }[];

    return columns.map((col) => col.name);
  }

  /**
   * Get all existing indexes
   */
  getIndexes(): IndexInfo[] {
    const indexes = this.db
      .prepare(
        `SELECT name, tbl_name as tableName, sql FROM sqlite_master WHERE type='index'`,
      )
      .all() as { name: string; tableName: string; sql: string | null }[];

    return indexes
      .filter((idx) => idx.sql !== null) // Filter out auto-indexes
      .map((idx) => ({
        name: idx.name,
        tableName: idx.tableName,
        sql: idx.sql || "",
        isUnique: idx.sql?.includes("UNIQUE") || false,
      }));
  }

  /**
   * Analyze and recommend index optimizations
   */
  analyzeAndRecommend(): IndexRecommendation[] {
    const tables = this.getTables();
    const existingIndexes = this.getIndexes();
    const recommendations: IndexRecommendation[] = [];

    // Build a map of indexed columns per table
    const indexedColumns = new Map<string, Set<string>>();
    existingIndexes.forEach((idx) => {
      if (!indexedColumns.has(idx.tableName)) {
        indexedColumns.set(idx.tableName, new Set());
      }
      // Extract column names from SQL (simplified)
      const match = idx.sql.match(/\((.*?)\)/);
      if (match) {
        match[1].split(",").forEach((col) => {
          indexedColumns.get(idx.tableName)?.add(col.trim());
        });
      }
    });

    // Check for common patterns that benefit from indexes
    tables.forEach((table) => {
      const indexed = indexedColumns.get(table.name) || new Set();

      // Foreign key columns (typically end with _id)
      table.columns
        .filter((col) => col.endsWith("_id"))
        .forEach((col) => {
          if (!indexed.has(col)) {
            recommendations.push({
              table: table.name,
              column: col,
              reason: "Foreign key column used in JOINs",
              priority: "high",
              sql: `CREATE INDEX IF NOT EXISTS idx_${table.name}_${col} ON ${table.name}(${col});`,
            });
          }
        });

      // Common filter columns
      ["status", "type", "category", "state"].forEach((commonCol) => {
        if (table.columns.includes(commonCol) && !indexed.has(commonCol)) {
          recommendations.push({
            table: table.name,
            column: commonCol,
            reason: "Frequently used in WHERE clauses",
            priority: "medium",
            sql: `CREATE INDEX IF NOT EXISTS idx_${table.name}_${commonCol} ON ${table.name}(${commonCol});`,
          });
        }
      });

      // Email columns (typically unique)
      if (table.columns.includes("email") && !indexed.has("email")) {
        recommendations.push({
          table: table.name,
          column: "email",
          reason: "Email lookup and uniqueness constraint",
          priority: "high",
          sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_${table.name}_email ON ${table.name}(email);`,
        });
      }

      // Date/timestamp columns
      [
        "created_at",
        "updated_at",
        "date",
        "due_date",
        "start_date",
        "end_date",
      ].forEach((dateCol) => {
        if (table.columns.includes(dateCol) && !indexed.has(dateCol)) {
          recommendations.push({
            table: table.name,
            column: dateCol,
            reason: "Date range queries and sorting",
            priority: "medium",
            sql: `CREATE INDEX IF NOT EXISTS idx_${table.name}_${dateCol} ON ${table.name}(${dateCol});`,
          });
        }
      });

      // Name columns (for sorting and searching)
      ["name", "title", "first_name", "last_name"].forEach((nameCol) => {
        if (table.columns.includes(nameCol) && !indexed.has(nameCol)) {
          recommendations.push({
            table: table.name,
            column: nameCol,
            reason: "Text search and sorting",
            priority: "low",
            sql: `CREATE INDEX IF NOT EXISTS idx_${table.name}_${nameCol} ON ${table.name}(${nameCol});`,
          });
        }
      });
    });

    return recommendations;
  }

  /**
   * Generate index statistics
   */
  getIndexStats(): {
    totalTables: number;
    totalIndexes: number;
    indexedTables: number;
    avgIndexesPerTable: number;
  } {
    const tables = this.getTables();
    const indexes = this.getIndexes();

    const tablesWithIndexes = new Set(indexes.map((idx) => idx.tableName));

    return {
      totalTables: tables.length,
      totalIndexes: indexes.length,
      indexedTables: tablesWithIndexes.size,
      avgIndexesPerTable:
        tables.length > 0 ? indexes.length / tables.length : 0,
    };
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}

/**
 * Main execution
 */
function main() {
  const dbPath =
    process.env.SQLITE_FILE || join(__dirname, "../../../data/dev.sqlite3");

  console.log("🔍 Database Index Analyzer\n");
  console.log(`Database: ${dbPath}\n`);

  // Try to open database with proper error handling
  let analyzer: IndexAnalyzer;
  try {
    analyzer = new IndexAnalyzer(dbPath);
  } catch (error: any) {
    if (error.code === "SQLITE_CANTOPEN") {
      console.error("❌ Database file not found!");
      console.error(`   Expected location: ${dbPath}`);
      console.error("\n💡 To use this tool:");
      console.error("   1. Ensure the database exists");
      console.error("   2. Run migrations: npm run migrate");
      console.error(
        "   3. Or set SQLITE_FILE env variable to point to your database",
      );
      process.exit(1);
    }
    console.error("❌ Error opening database:", error.message || error);
    process.exit(1);
  }

  try {
    // Get statistics
    console.log("📊 Current Index Statistics:");
    const stats = analyzer.getIndexStats();
    console.log(`  Total Tables: ${stats.totalTables}`);
    console.log(`  Total Indexes: ${stats.totalIndexes}`);
    console.log(`  Tables with Indexes: ${stats.indexedTables}`);
    console.log(
      `  Avg Indexes per Table: ${stats.avgIndexesPerTable.toFixed(2)}`,
    );
    console.log();

    // Get existing indexes
    console.log("📋 Existing Indexes:");
    const indexes = analyzer.getIndexes();
    const indexesByTable = new Map<string, IndexInfo[]>();

    indexes.forEach((idx) => {
      if (!indexesByTable.has(idx.tableName)) {
        indexesByTable.set(idx.tableName, []);
      }
      indexesByTable.get(idx.tableName)?.push(idx);
    });

    indexesByTable.forEach((tableIndexes, tableName) => {
      console.log(`  ${tableName}:`);
      tableIndexes.forEach((idx) => {
        console.log(`    - ${idx.name} ${idx.isUnique ? "(UNIQUE)" : ""}`);
      });
    });
    console.log();

    // Get recommendations
    console.log("💡 Index Recommendations:\n");
    const recommendations = analyzer.analyzeAndRecommend();

    if (recommendations.length === 0) {
      console.log("  ✅ No index recommendations - schema is well-indexed!");
    } else {
      // Group by priority
      const byPriority = {
        high: recommendations.filter((r) => r.priority === "high"),
        medium: recommendations.filter((r) => r.priority === "medium"),
        low: recommendations.filter((r) => r.priority === "low"),
      };

      if (byPriority.high.length > 0) {
        console.log("  🔴 HIGH PRIORITY:");
        byPriority.high.forEach((rec) => {
          console.log(`    ${rec.table}.${rec.column}`);
          console.log(`      Reason: ${rec.reason}`);
          console.log(`      SQL: ${rec.sql}`);
          console.log();
        });
      }

      if (byPriority.medium.length > 0) {
        console.log("  🟡 MEDIUM PRIORITY:");
        byPriority.medium.forEach((rec) => {
          console.log(`    ${rec.table}.${rec.column}`);
          console.log(`      Reason: ${rec.reason}`);
          console.log(`      SQL: ${rec.sql}`);
          console.log();
        });
      }

      if (byPriority.low.length > 0) {
        console.log("  🟢 LOW PRIORITY:");
        byPriority.low.forEach((rec) => {
          console.log(`    ${rec.table}.${rec.column}`);
          console.log(`      Reason: ${rec.reason}`);
          console.log(`      SQL: ${rec.sql}`);
          console.log();
        });
      }

      // Generate SQL migration file
      console.log("\n📝 SQL Migration Script:\n");
      console.log("-- Generated Index Recommendations");
      console.log(`-- Date: ${new Date().toISOString()}\n`);
      recommendations.forEach((rec) => {
        console.log(`-- ${rec.table}.${rec.column}: ${rec.reason}`);
        console.log(rec.sql);
        console.log();
      });
    }
  } finally {
    analyzer.close();
  }
}

// Run if called directly
import { fileURLToPath } from "url";
if (
  import.meta.url === `file://${process.argv[1]}` ||
  fileURLToPath(import.meta.url) === process.argv[1]
) {
  main();
}

export { IndexAnalyzer };
