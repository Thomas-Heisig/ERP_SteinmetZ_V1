-- SPDX-License-Identifier: MIT
-- Migration 002: Erweiterte KI- und Batch-Unterstützung

-- Batch Operations Tracking
CREATE TABLE IF NOT EXISTS batch_operations (
  id TEXT PRIMARY KEY,
  operation TEXT NOT NULL,
  filters TEXT NOT NULL,
  options TEXT,
  status TEXT DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  started_at TEXT,
  completed_at TEXT
);

-- AI Model Registry (für erweiterte Modellverwaltung)
CREATE TABLE IF NOT EXISTS ai_models (
  name TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  capabilities TEXT NOT NULL,
  max_tokens INTEGER,
  context_window INTEGER,
  cost_per_token REAL,
  speed TEXT,
  accuracy TEXT,
  available BOOLEAN DEFAULT true,
  last_checked TEXT
);

-- Performance Metrics (optional für Monitoring)
CREATE TABLE IF NOT EXISTS performance_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  operation TEXT NOT NULL,
  model_used TEXT,
  duration_ms INTEGER,
  success BOOLEAN,
  tokens_used INTEGER,
  cost REAL,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);
