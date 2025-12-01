// SPDX-License-Identifier: MIT
// apps/backend/src/services/functionsSchema.ts
import db from "./dbService.js";

export async function ensureFunctionsSchema() {
  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS functions_nodes (
      id           TEXT PRIMARY KEY,
      parent_id    TEXT REFERENCES functions_nodes(id) ON DELETE CASCADE,
      title        TEXT NOT NULL,
      order_index  INTEGER NOT NULL DEFAULT 0,
      depth        INTEGER,
      path_json    TEXT,
      tags_json    TEXT,
      metrics_json TEXT,
      meta_json    TEXT
    );

    -- optional: Annotationen durch KI/Manuell
    CREATE TABLE IF NOT EXISTS ai_annotations (
      node_id      TEXT PRIMARY KEY REFERENCES functions_nodes(id) ON DELETE CASCADE,
      summary      TEXT,
      updated_at   TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_functions_parent ON functions_nodes(parent_id);
    CREATE INDEX IF NOT EXISTS idx_functions_order  ON functions_nodes(parent_id, order_index);
  `);
}
