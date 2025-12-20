-- SPDX-License-Identifier: MIT
-- Migration: Update system_settings categories
-- Description: Add new categories to system_settings table
-- SQLite compatible version

-- Note: For SQLite, this migration handles the constraints and new categories
-- SQLite doesn't support ALTER TABLE with CHECK constraints modification
-- We handle this by creating the table with constraints if it doesn't exist

CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY,
  [key] TEXT UNIQUE NOT NULL,
  [value] TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'system' CHECK (category IN (
    'system', 'ai', 'database', 'security', 'ui', 'integration', 'performance',
    'email', 'finance', 'inventory', 'hr', 'crm', 'reporting', 'backup', 'api', 'notifications'
  )),
  [type] TEXT NOT NULL DEFAULT 'string' CHECK ([type] IN ('string', 'number', 'boolean', 'json', 'select', 'multiselect')),
  [description] TEXT,
  sensitive INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings([key]);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

