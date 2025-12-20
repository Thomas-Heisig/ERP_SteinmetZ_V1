-- SPDX-License-Identifier: MIT
-- Migration: Create Project Management tables
-- Description: Creates tables for projects, tasks, milestones, and time tracking

-- Projects table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[projects]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[projects] (
  id NVARCHAR(255) PRIMARY KEY,
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
END

-- Tasks table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[project_tasks]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[project_tasks] (
  id NVARCHAR(255) PRIMARY KEY,
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
END

-- Milestones table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[project_milestones]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[project_milestones] (
  id NVARCHAR(255) PRIMARY KEY,
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
END

-- Time entries table (for time tracking)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[project_time_entries]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[project_time_entries] (
  id NVARCHAR(255) PRIMARY KEY,
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
END

-- Project team members table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[project_team_members]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[project_team_members] (
  id NVARCHAR(255) PRIMARY KEY,
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
END

-- Project comments/notes table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[project_comments]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[project_comments] (
  id NVARCHAR(255) PRIMARY KEY,
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
END

-- Create indexes for better query performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_projects_status')
CREATE INDEX idx_projects_status ON projects(status);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_projects_manager')
CREATE INDEX idx_projects_manager ON projects(manager);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_projects_start_date')
CREATE INDEX idx_projects_start_date ON projects(start_date);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_project_tasks_project')
CREATE INDEX idx_project_tasks_project ON project_tasks(project_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_project_tasks_assignee')
CREATE INDEX idx_project_tasks_assignee ON project_tasks(assignee);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_project_tasks_status')
CREATE INDEX idx_project_tasks_status ON project_tasks(status);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_project_tasks_due_date')
CREATE INDEX idx_project_tasks_due_date ON project_tasks(due_date);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_project_milestones_project')
CREATE INDEX idx_project_milestones_project ON project_milestones(project_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_project_milestones_due_date')
CREATE INDEX idx_project_milestones_due_date ON project_milestones(due_date);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_project_time_entries_project')
CREATE INDEX idx_project_time_entries_project ON project_time_entries(project_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_project_time_entries_task')
CREATE INDEX idx_project_time_entries_task ON project_time_entries(task_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_project_time_entries_user')
CREATE INDEX idx_project_time_entries_user ON project_time_entries(user_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_project_time_entries_date')
CREATE INDEX idx_project_time_entries_date ON project_time_entries(date);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_project_team_members_project')
CREATE INDEX idx_project_team_members_project ON project_team_members(project_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_project_team_members_user')
CREATE INDEX idx_project_team_members_user ON project_team_members(user_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_project_comments_project')
CREATE INDEX idx_project_comments_project ON project_comments(project_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_project_comments_task')
CREATE INDEX idx_project_comments_task ON project_comments(task_id);
