const Database = require("better-sqlite3");
const db = new Database("data/dev.sqlite3");

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table'")
  .all();
console.log("Total Tabellen:", tables.length);
console.log("\nAlle Tabellen:");
tables.forEach((t) => console.log("  - " + t.name));
db.close();
