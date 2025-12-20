-- SPDX-License-Identifier: MIT
-- Migration: Add user_id column to dashboard tables
-- Description: Adds user_id column to dashboard_tasks and updates dashboard_notifications
-- Database: SQLite
-- Created: 2025-12-20

-- =============================================================================
-- STRATEGY: Recreate tables with correct schema
-- =============================================================================
-- SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS
-- We use the safe approach: rename old table, create new one, migrate data, drop old

-- =============================================================================
-- DASHBOARD_TASKS - Add user_id and missing columns
-- =============================================================================

-- Rename old table
ALTER TABLE dashboard_tasks RENAME TO dashboard_tasks_old;

-- Create new table with complete schema
CREATE TABLE dashboard_tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'normal',
  due_date TEXT,
  completed_at TEXT,
  assigned_to TEXT,
  tags TEXT,
  related_to TEXT,
  related_type TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Migrate existing data
INSERT INTO dashboard_tasks (id, title, priority, status, due_date, assigned_to, description, created_at, updated_at, user_id)
SELECT 
  id, 
  title, 
  priority, 
  status, 
  due_date, 
  assigned_to, 
  description, 
  created_at, 
  updated_at,
  'system' as user_id
FROM dashboard_tasks_old;

-- Drop old table
DROP TABLE dashboard_tasks_old;

-- =============================================================================
-- DASHBOARD_NOTIFICATIONS - Add missing columns
-- =============================================================================

-- Rename old table
ALTER TABLE dashboard_notifications RENAME TO dashboard_notifications_old;

-- Create new table with complete schema
CREATE TABLE dashboard_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'system',
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  action_url TEXT,
  action_label TEXT,
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  read_at TEXT
);

-- Migrate existing data
INSERT INTO dashboard_notifications (id, title, message, type, read, user_id, created_at)
SELECT 
  id, 
  title, 
  message, 
  type, 
  read,
  COALESCE(user_id, 'system') as user_id,
  created_at
FROM dashboard_notifications_old;

-- Drop old table
DROP TABLE dashboard_notifications_old;

-- =============================================================================
-- CREATE INDEXES (Idempotent)
-- =============================================================================

-- These will succeed now that user_id column exists
CREATE INDEX IF NOT EXISTS idx_tasks_user ON dashboard_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON dashboard_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON dashboard_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON dashboard_tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON dashboard_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON dashboard_notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON dashboard_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_kpis_date ON dashboard_kpis(date);
CREATE INDEX IF NOT EXISTS idx_kpis_category ON dashboard_kpis(category);
