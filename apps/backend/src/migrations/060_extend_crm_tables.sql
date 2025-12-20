-- SPDX-License-Identifier: MIT
-- Migration: Extend CRM tables with additional features
-- Description: Adds advanced CRM features like hierarchies, enrichment, and duplicate detection

-- =============================================================================
-- CUSTOMER HIERARCHIES & RELATIONSHIPS
-- =============================================================================

-- Company Hierarchies (Parent-Child relationships)
CREATE TABLE IF NOT EXISTS crm_company_hierarchies (
  id TEXT PRIMARY KEY,
  parent_customer_id TEXT NOT NULL,
  child_customer_id TEXT NOT NULL,
  relationship_type TEXT CHECK (relationship_type IN ('parent_subsidiary', 'corporate_group', 'partner', 'key_account')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (child_customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  UNIQUE(parent_customer_id, child_customer_id)
);

-- Contact Relationships (between contacts)
CREATE TABLE IF NOT EXISTS crm_contact_relationships (
  id TEXT PRIMARY KEY,
  contact_id_from TEXT NOT NULL,
  contact_id_to TEXT NOT NULL,
  relationship_type TEXT CHECK (relationship_type IN ('reports_to', 'colleague', 'influencer', 'decision_maker')),
  relationship_strength INTEGER CHECK (relationship_strength >= 1 AND relationship_strength <= 10),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (contact_id_from) REFERENCES crm_contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id_to) REFERENCES crm_contacts(id) ON DELETE CASCADE
);

-- =============================================================================
-- DATA ENRICHMENT
-- =============================================================================

-- Data Enrichment Sources and Logs
CREATE TABLE IF NOT EXISTS crm_enrichment_logs (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  contact_id TEXT,
  source TEXT NOT NULL CHECK (source IN ('handelsregister', 'creditreform', 'web_scraping', 'social_media', 'manual', 'api')),
  enriched_fields TEXT NOT NULL, -- JSON: array of enriched field names
  enriched_data TEXT NOT NULL, -- JSON: actual enriched data
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  enriched_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE CASCADE
);

-- External Data Integrations Config
CREATE TABLE IF NOT EXISTS crm_external_data_sources (
  id TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  api_endpoint TEXT,
  api_config TEXT, -- JSON: API configuration
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'error')) DEFAULT 'active',
  last_sync TEXT,
  sync_count INTEGER DEFAULT 0,
  error_log TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- DUPLICATE DETECTION & MANAGEMENT
-- =============================================================================

-- Duplicate Detection Rules
CREATE TABLE IF NOT EXISTS crm_duplicate_rules (
  id TEXT PRIMARY KEY,
  rule_name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('customer', 'contact')),
  matching_fields TEXT NOT NULL, -- JSON: fields to match on with weights
  threshold_score INTEGER NOT NULL DEFAULT 80,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Detected Duplicates
CREATE TABLE IF NOT EXISTS crm_duplicate_candidates (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('customer', 'contact')),
  entity_id_1 TEXT NOT NULL,
  entity_id_2 TEXT NOT NULL,
  match_score INTEGER NOT NULL,
  matching_details TEXT, -- JSON: which fields matched
  status TEXT NOT NULL CHECK (status IN ('pending_review', 'confirmed_duplicate', 'not_duplicate', 'merged')) DEFAULT 'pending_review',
  reviewed_by TEXT,
  reviewed_at TEXT,
  detected_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(entity_id_1, entity_id_2)
);

-- Merge History
CREATE TABLE IF NOT EXISTS crm_merge_history (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('customer', 'contact')),
  master_id TEXT NOT NULL,
  merged_ids TEXT NOT NULL, -- JSON: array of merged entity IDs
  merged_data TEXT, -- JSON: backup of merged data
  merged_by TEXT NOT NULL,
  merged_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- DATA QUALITY MANAGEMENT
-- =============================================================================

-- Data Quality Checks
CREATE TABLE IF NOT EXISTS crm_data_quality_checks (
  id TEXT PRIMARY KEY,
  check_name TEXT NOT NULL,
  check_type TEXT CHECK (check_type IN ('completeness', 'validity', 'consistency', 'accuracy')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('customer', 'contact')),
  check_rules TEXT NOT NULL, -- JSON: validation rules
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Data Quality Issues
CREATE TABLE IF NOT EXISTS crm_data_quality_issues (
  id TEXT PRIMARY KEY,
  check_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'dismissed')) DEFAULT 'open',
  detected_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  resolved_by TEXT,
  FOREIGN KEY (check_id) REFERENCES crm_data_quality_checks(id) ON DELETE CASCADE
);

-- =============================================================================
-- EXTENDED CONTACT & ACTIVITY FEATURES
-- =============================================================================

-- Contact Preferences
CREATE TABLE IF NOT EXISTS crm_contact_preferences (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  preferred_communication_channel TEXT CHECK (preferred_communication_channel IN ('email', 'phone', 'sms', 'chat', 'mail')),
  preferred_contact_time TEXT,
  communication_frequency TEXT CHECK (communication_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  language TEXT,
  timezone TEXT,
  gdpr_consent BOOLEAN DEFAULT 0,
  gdpr_consent_date TEXT,
  marketing_opt_in BOOLEAN DEFAULT 0,
  marketing_opt_in_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE CASCADE,
  UNIQUE(contact_id)
);

-- Activity Follow-ups
CREATE TABLE IF NOT EXISTS crm_activity_followups (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL,
  follow_up_type TEXT CHECK (follow_up_type IN ('call', 'email', 'meeting', 'task')),
  due_date TEXT NOT NULL,
  assigned_to TEXT,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (activity_id) REFERENCES crm_activities(id) ON DELETE CASCADE
);

-- Communication Templates
CREATE TABLE IF NOT EXISTS crm_communication_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  template_type TEXT CHECK (template_type IN ('email', 'sms', 'letter', 'meeting_notes')),
  subject TEXT,
  content TEXT NOT NULL,
  variables TEXT, -- JSON: available variables
  category TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- CUSTOMER VALUE & SCORING
-- =============================================================================

-- Customer Value Metrics
CREATE TABLE IF NOT EXISTS crm_customer_metrics (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  metric_date TEXT NOT NULL,
  total_revenue REAL DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  avg_order_value REAL DEFAULT 0,
  lifetime_value REAL DEFAULT 0,
  customer_score INTEGER DEFAULT 0,
  churn_risk_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  satisfaction_score INTEGER DEFAULT 0,
  calculated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE
);

-- Customer Segments Assignment
CREATE TABLE IF NOT EXISTS crm_customer_segments (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  segment_id TEXT NOT NULL,
  assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
  assigned_by TEXT,
  notes TEXT,
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (segment_id) REFERENCES marketing_segments(id) ON DELETE CASCADE,
  UNIQUE(customer_id, segment_id)
);

-- =============================================================================
-- TELEPHONY & CTI INTEGRATION
-- =============================================================================

-- Call Logs (extended from activities)
CREATE TABLE IF NOT EXISTS crm_call_logs (
  id TEXT PRIMARY KEY,
  activity_id TEXT,
  customer_id TEXT,
  contact_id TEXT,
  phone_number TEXT NOT NULL,
  call_direction TEXT CHECK (call_direction IN ('inbound', 'outbound')),
  call_duration_seconds INTEGER DEFAULT 0,
  call_status TEXT CHECK (call_status IN ('answered', 'missed', 'voicemail', 'busy', 'failed')),
  recording_url TEXT,
  transcript TEXT,
  call_quality_score INTEGER CHECK (call_quality_score >= 1 AND call_quality_score <= 5),
  notes TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  FOREIGN KEY (activity_id) REFERENCES crm_activities(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE SET NULL
);

-- Email Tracking
CREATE TABLE IF NOT EXISTS crm_email_tracking (
  id TEXT PRIMARY KEY,
  activity_id TEXT,
  customer_id TEXT,
  contact_id TEXT,
  email_subject TEXT NOT NULL,
  email_from TEXT NOT NULL,
  email_to TEXT NOT NULL,
  email_cc TEXT,
  sent_at TEXT NOT NULL,
  delivered_at TEXT,
  opened_at TEXT,
  clicked_at TEXT,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  bounce_type TEXT CHECK (bounce_type IN ('hard', 'soft', 'none')),
  status TEXT CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced')),
  FOREIGN KEY (activity_id) REFERENCES crm_activities(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE SET NULL
);

-- =============================================================================
-- PERFORMANCE & PREDICTIVE ANALYTICS
-- =============================================================================

-- Sales Performance Metrics
CREATE TABLE IF NOT EXISTS crm_performance_metrics (
  id TEXT PRIMARY KEY,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('user', 'team', 'company')),
  metric_owner TEXT, -- user_id or team_id
  metric_period TEXT NOT NULL, -- e.g., '2025-12', 'Q1-2025'
  total_opportunities INTEGER DEFAULT 0,
  won_opportunities INTEGER DEFAULT 0,
  lost_opportunities INTEGER DEFAULT 0,
  win_rate REAL DEFAULT 0,
  avg_deal_size REAL DEFAULT 0,
  avg_sales_cycle_days INTEGER DEFAULT 0,
  pipeline_velocity REAL DEFAULT 0,
  total_activities INTEGER DEFAULT 0,
  total_revenue REAL DEFAULT 0,
  calculated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Predictive Models
CREATE TABLE IF NOT EXISTS crm_predictive_models (
  id TEXT PRIMARY KEY,
  model_name TEXT NOT NULL,
  model_type TEXT CHECK (model_type IN ('opportunity_scoring', 'churn_prediction', 'upsell_likelihood', 'forecasting')),
  model_config TEXT NOT NULL, -- JSON: model configuration
  accuracy_score REAL,
  last_trained TEXT,
  training_data_count INTEGER,
  status TEXT NOT NULL CHECK (status IN ('active', 'training', 'inactive')) DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_company_hierarchies_parent ON crm_company_hierarchies(parent_customer_id);
CREATE INDEX IF NOT EXISTS idx_company_hierarchies_child ON crm_company_hierarchies(child_customer_id);
CREATE INDEX IF NOT EXISTS idx_contact_relationships_from ON crm_contact_relationships(contact_id_from);
CREATE INDEX IF NOT EXISTS idx_contact_relationships_to ON crm_contact_relationships(contact_id_to);
CREATE INDEX IF NOT EXISTS idx_enrichment_logs_customer ON crm_enrichment_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_logs_contact ON crm_enrichment_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_candidates_status ON crm_duplicate_candidates(status);
CREATE INDEX IF NOT EXISTS idx_data_quality_issues_status ON crm_data_quality_issues(status);
CREATE INDEX IF NOT EXISTS idx_contact_preferences_contact ON crm_contact_preferences(contact_id);
CREATE INDEX IF NOT EXISTS idx_activity_followups_activity ON crm_activity_followups(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_followups_due_date ON crm_activity_followups(due_date);
CREATE INDEX IF NOT EXISTS idx_customer_metrics_customer ON crm_customer_metrics(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_segments_customer ON crm_customer_segments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_segments_segment ON crm_customer_segments(segment_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_customer ON crm_call_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON crm_call_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_email_tracking_customer ON crm_email_tracking(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_sent_at ON crm_email_tracking(sent_at);

