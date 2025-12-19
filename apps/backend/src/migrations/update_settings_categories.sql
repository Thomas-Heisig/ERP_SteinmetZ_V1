-- SPDX-License-Identifier: MIT
-- Migration: Update system_settings categories
-- Description: Add new categories to system_settings table

-- SQLite doesn't support ALTER TABLE ... DROP CONSTRAINT or MODIFY COLUMN
-- So we need to recreate the table with new constraints

-- Step 1: Disable foreign key checks
PRAGMA foreign_keys = OFF;

-- Step 2: Create new table with updated constraints
CREATE TABLE IF NOT EXISTS system_settings_new (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'system', 'ai', 'database', 'security', 'ui', 'integration', 'performance',
    'email', 'finance', 'inventory', 'hr', 'crm', 'reporting', 'backup', 'api', 'notifications'
  )),
  type TEXT NOT NULL CHECK (type IN ('string', 'number', 'boolean', 'json', 'select', 'multiselect')),
  description TEXT,
  sensitive BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT
);

-- Step 2: Copy data from old table to new table
INSERT INTO system_settings_new (id, key, value, category, type, description, sensitive, created_at, updated_at, updated_by)
SELECT id, key, value, category, type, description, sensitive, created_at, updated_at, updated_by
FROM system_settings;

-- Step 3: Drop old table
DROP TABLE system_settings;

-- Step 4: Rename new table to original name
ALTER TABLE system_settings_new RENAME TO system_settings;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- Step 6: Re-enable foreign key checks
PRAGMA foreign_keys = ON;
