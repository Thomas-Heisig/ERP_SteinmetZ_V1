-- SPDX-License-Identifier: MIT
-- Migration: Create system settings tables
-- Description: Comprehensive settings management with history tracking

-- =============================================================================
-- System Settings Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL, -- JSON string
  category TEXT NOT NULL CHECK (category IN ('system', 'ai', 'database', 'security', 'ui', 'integration', 'performance')),
  type TEXT NOT NULL CHECK (type IN ('string', 'number', 'boolean', 'json', 'select', 'multiselect')),
  description TEXT,
  sensitive BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================================================
-- Settings History Table (Audit Trail)
-- =============================================================================

CREATE TABLE IF NOT EXISTS system_settings_history (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  setting_key TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  changed_at TEXT NOT NULL DEFAULT (datetime('now')),
  change_reason TEXT,
  FOREIGN KEY (setting_key) REFERENCES system_settings(key) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================================================
-- Indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_history_key ON system_settings_history(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_history_changed_at ON system_settings_history(changed_at);

-- =============================================================================
-- Default Settings Data
-- =============================================================================

INSERT OR IGNORE INTO system_settings (key, value, category, type, description, sensitive) VALUES
-- System Settings
('system_version', '"1.0.0"', 'system', 'string', 'System version', 0),
('system_name', '"ERP SteinmetZ"', 'system', 'string', 'Name of the ERP system', 0),
('maintenance_mode', 'false', 'system', 'boolean', 'Enable maintenance mode', 0),
('debug_mode', 'false', 'system', 'boolean', 'Enable debug mode', 0),
('log_level', '"info"', 'system', 'select', 'System log level', 0),

-- AI Provider Settings
('default_provider', '"openai"', 'ai', 'select', 'Default AI provider', 0),
('default_model', '"gpt-4o-mini"', 'ai', 'string', 'Default AI model', 0),
('ai_enabled', 'true', 'ai', 'boolean', 'Enable AI features', 0),
('ai_timeout_seconds', '60', 'ai', 'number', 'AI request timeout in seconds', 0),
('max_parallel_requests', '3', 'ai', 'number', 'Maximum parallel AI requests', 0),

-- OpenAI Settings
('openai_model', '"gpt-4o-mini"', 'ai', 'string', 'OpenAI model name', 0),
('openai_temperature', '0.7', 'ai', 'number', 'OpenAI temperature (0-2)', 0),
('openai_max_tokens', '4096', 'ai', 'number', 'OpenAI max tokens', 0),

-- Anthropic Settings
('anthropic_model', '"claude-3-5-sonnet-20241022"', 'ai', 'string', 'Anthropic model name', 0),
('anthropic_temperature', '0.7', 'ai', 'number', 'Anthropic temperature (0-1)', 0),
('anthropic_max_tokens', '4096', 'ai', 'number', 'Anthropic max tokens', 0),

-- Ollama Settings
('ollama_base_url', '"http://localhost:11434"', 'ai', 'string', 'Ollama base URL', 0),
('ollama_model', '"qwen2.5:3b"', 'ai', 'string', 'Ollama model name', 0),
('ollama_temperature', '0.7', 'ai', 'number', 'Ollama temperature (0-2)', 0),

-- Cache Settings
('cache_enabled', 'true', 'performance', 'boolean', 'Enable caching', 0),
('cache_ttl_minutes', '60', 'performance', 'number', 'Cache TTL in minutes', 0),
('cache_max_size_mb', '512', 'performance', 'number', 'Max cache size in MB', 0),

-- Performance Settings
('autosave_interval_min', '30', 'performance', 'number', 'Autosave interval in minutes', 0),
('batch_size', '100', 'performance', 'number', 'Batch processing size', 0),
('request_timeout_seconds', '30', 'performance', 'number', 'HTTP request timeout', 0),

-- Database Settings
('db_backup_enabled', 'true', 'database', 'boolean', 'Enable automatic backups', 0),
('db_backup_interval_hours', '24', 'database', 'number', 'Backup interval in hours', 0),
('db_backup_retention_days', '30', 'database', 'number', 'Backup retention in days', 0),

-- Security Settings
('session_timeout_minutes', '60', 'security', 'number', 'Session timeout in minutes', 0),
('max_login_attempts', '5', 'security', 'number', 'Max failed login attempts', 0),
('password_min_length', '8', 'security', 'number', 'Minimum password length', 0),
('require_2fa', 'false', 'security', 'boolean', 'Require two-factor authentication', 0),

-- UI Settings
('theme', '"auto"', 'ui', 'select', 'UI theme (light/dark/auto/lcars)', 0),
('language', '"de"', 'ui', 'select', 'System language', 0),
('date_format', '"DD.MM.YYYY"', 'ui', 'string', 'Date format', 0),
('time_format', '"HH:mm"', 'ui', 'string', 'Time format', 0),
('items_per_page', '25', 'ui', 'number', 'Items per page in lists', 0),

-- Feature Flags
('feature_ai_annotator', 'true', 'system', 'boolean', 'Enable AI Annotator', 0),
('feature_batch_processing', 'true', 'system', 'boolean', 'Enable batch processing', 0),
('feature_realtime_updates', 'true', 'system', 'boolean', 'Enable realtime updates', 0),
('feature_advanced_filters', 'true', 'system', 'boolean', 'Enable advanced filters', 0),

-- Integration Settings
('email_enabled', 'false', 'integration', 'boolean', 'Enable email integration', 0),
('webhook_enabled', 'false', 'integration', 'boolean', 'Enable webhooks', 0),

-- Monitoring Settings
('diagnostics_enabled', 'true', 'system', 'boolean', 'Enable diagnostics', 0),
('monitoring_enabled', 'false', 'integration', 'boolean', 'Enable monitoring', 0),
('sentry_enabled', 'false', 'integration', 'boolean', 'Enable Sentry error tracking', 0);
