-- SPDX-License-Identifier: MIT
-- Migration: Update system_settings categories
-- Description: Add new categories to system_settings table

-- SQLite doesn't support ALTER TABLE ... DROP CONSTRAINT or MODIFY COLUMN
-- So we need to recreate the table with new constraints

-- Step 1: Disable foreign key checks (SQLite specific)
-- PRAGMA foreign_keys = OFF;

-- Step 2: Create new table with updated constraints
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'system_settings_new')
BEGIN
CREATE TABLE system_settings_new (
  id NVARCHAR(32) PRIMARY KEY DEFAULT (LOWER(CONVERT(NVARCHAR(32), NEWID()))),
  [key] NVARCHAR(255) UNIQUE NOT NULL,
  [value] NVARCHAR(MAX) NOT NULL,
  category NVARCHAR(50) NOT NULL CHECK (category IN (
    'system', 'ai', 'database', 'security', 'ui', 'integration', 'performance',
    'email', 'finance', 'inventory', 'hr', 'crm', 'reporting', 'backup', 'api', 'notifications'
  )),
  [type] NVARCHAR(50) NOT NULL CHECK ([type] IN ('string', 'number', 'boolean', 'json', 'select', 'multiselect')),
  [description] NVARCHAR(MAX),
  sensitive BIT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT (GETDATE()),
  updated_at DATETIME NOT NULL DEFAULT (GETDATE()),
  updated_by NVARCHAR(255)
);
END

-- Step 2: Copy data from old table to new table
INSERT INTO system_settings_new (id, [key], [value], category, [type], [description], sensitive, created_at, updated_at, updated_by)
SELECT id, [key], [value], category, [type], [description], sensitive, created_at, updated_at, updated_by
FROM system_settings;

-- Step 3: Drop old table
DROP TABLE system_settings;

-- Step 4: Rename new table to original name
EXEC sp_rename 'system_settings_new', 'system_settings';

-- Step 5: Recreate indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_system_settings_key' AND object_id = OBJECT_ID('system_settings'))
CREATE INDEX idx_system_settings_key ON system_settings([key]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_system_settings_category' AND object_id = OBJECT_ID('system_settings'))
CREATE INDEX idx_system_settings_category ON system_settings(category);

-- Step 6: Re-enable foreign key checks (SQLite specific)
-- PRAGMA foreign_keys = ON;
