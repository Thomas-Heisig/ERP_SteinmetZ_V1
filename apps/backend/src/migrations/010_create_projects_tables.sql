-- SPDX-License-Identifier: MIT
-- Migration: Create Project Management tables
-- Description: Creates tables for projects, tasks, milestones, and time tracking

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')) DEFAULT 'planning',
  start_date TEXT,
  end_date TEXT,
  actual_start_date TEXT,
  actual_end_date TEXT,
  budget REAL CHECK (budget IS NULL OR budget >= 0),
  spent REAL DEFAULT 0 CHECK (spent >= 0),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  client TEXT,
  manager TEXT,
  department TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  color TEXT,
  tags TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  parent_task_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked', 'cancelled')) DEFAULT 'todo',
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  assignee TEXT,
  reporter TEXT,
  due_date TEXT,
  start_date TEXT,
  completed_at TEXT,
  estimated_hours REAL CHECK (estimated_hours IS NULL OR estimated_hours >= 0),
  actual_hours REAL DEFAULT 0 CHECK (actual_hours >= 0),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  tags TEXT,
  labels TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_task_id) REFERENCES project_tasks(id) ON DELETE SET NULL
);

-- Milestones table
CREATE TABLE IF NOT EXISTS project_milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'missed')) DEFAULT 'pending',
  completed_at TEXT,
  sort_order INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Time entries table (for time tracking)
CREATE TABLE IF NOT EXISTS project_time_entries (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  task_id TEXT,
  user_id TEXT NOT NULL,
  description TEXT,
  hours REAL NOT NULL CHECK (hours > 0),
  date TEXT NOT NULL,
  billable BOOLEAN DEFAULT 1,
  rate REAL CHECK (rate IS NULL OR rate >= 0),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE SET NULL
);

-- Project team members table
CREATE TABLE IF NOT EXISTS project_team_members (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT CHECK (role IN ('manager', 'developer', 'designer', 'qa', 'analyst', 'other')),
  allocation_percentage INTEGER DEFAULT 100 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  start_date TEXT,
  end_date TEXT,
  is_active BOOLEAN DEFAULT 1,
  notes TEXT,
  added_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Project comments/notes table
CREATE TABLE IF NOT EXISTS project_comments (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  task_id TEXT,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  comment_type TEXT CHECK (comment_type IN ('comment', 'note', 'update', 'decision')),
  is_pinned BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(manager);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assignee ON project_tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_due_date ON project_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_due_date ON project_milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_project ON project_time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_task ON project_time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_user ON project_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_date ON project_time_entries(date);
CREATE INDEX IF NOT EXISTS idx_project_team_members_project ON project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_user ON project_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_project ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_task ON project_comments(task_id);

