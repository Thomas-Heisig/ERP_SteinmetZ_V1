-- SPDX-License-Identifier: MIT
-- Migration: Create Marketing tables
-- Description: Creates comprehensive tables for marketing campaigns, lead generation, and automation

-- =============================================================================
-- KAMPAGNENMANAGEMENT (Campaign Management)
-- =============================================================================

-- Marketing Campaigns table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('email', 'social', 'sem', 'seo', 'offline', 'event', 'telephone')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'planned', 'active', 'paused', 'completed', 'cancelled')) DEFAULT 'draft',
  description TEXT,
  start_date TEXT,
  end_date TEXT,
  budget REAL DEFAULT 0,
  spent REAL DEFAULT 0,
  target_audience TEXT,
  goals TEXT, -- JSON: conversion goals, metrics
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Campaign Performance Metrics
CREATE TABLE IF NOT EXISTS marketing_campaign_metrics (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  metric_date TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  cost REAL DEFAULT 0,
  revenue REAL DEFAULT 0,
  engagement_rate REAL DEFAULT 0,
  conversion_rate REAL DEFAULT 0,
  roi REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns(id) ON DELETE CASCADE
);

-- Email Marketing Sequences
CREATE TABLE IF NOT EXISTS marketing_email_sequences (
  id TEXT PRIMARY KEY,
  campaign_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'completed')) DEFAULT 'draft',
  trigger_type TEXT CHECK (trigger_type IN ('manual', 'date', 'behavior', 'scoring', 'system')),
  trigger_config TEXT, -- JSON: trigger configuration
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns(id) ON DELETE SET NULL
);

-- Individual Email Steps in Sequence
CREATE TABLE IF NOT EXISTS marketing_email_steps (
  id TEXT PRIMARY KEY,
  sequence_id TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  delay_days INTEGER DEFAULT 0,
  delay_hours INTEGER DEFAULT 0,
  send_time TEXT, -- HH:MM preferred send time
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (sequence_id) REFERENCES marketing_email_sequences(id) ON DELETE CASCADE
);

-- Social Media Content Calendar
CREATE TABLE IF NOT EXISTS marketing_social_posts (
  id TEXT PRIMARY KEY,
  campaign_id TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'pinterest')),
  content TEXT NOT NULL,
  media_urls TEXT, -- JSON: array of media URLs
  scheduled_at TEXT,
  published_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'published', 'failed')) DEFAULT 'draft',
  engagement_metrics TEXT, -- JSON: likes, shares, comments
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns(id) ON DELETE SET NULL
);

-- =============================================================================
-- ZIELGRUPPENVERWALTUNG (Audience Management)
-- =============================================================================

-- Market Segments
CREATE TABLE IF NOT EXISTS marketing_segments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  segment_type TEXT CHECK (segment_type IN ('demographic', 'firmographic', 'behavioral', 'psychographic', 'custom')),
  criteria TEXT NOT NULL, -- JSON: segmentation criteria
  size_estimate INTEGER DEFAULT 0,
  last_calculated TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Personas
CREATE TABLE IF NOT EXISTS marketing_personas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  demographics TEXT, -- JSON: age, location, job title, etc.
  pain_points TEXT, -- JSON: array of pain points
  goals TEXT, -- JSON: array of goals
  communication_preferences TEXT, -- JSON: preferred channels, times
  buying_process TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Budget Allocation
CREATE TABLE IF NOT EXISTS marketing_budgets (
  id TEXT PRIMARY KEY,
  campaign_id TEXT,
  channel TEXT,
  allocated_amount REAL NOT NULL DEFAULT 0,
  spent_amount REAL DEFAULT 0,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planned', 'active', 'completed')) DEFAULT 'planned',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns(id) ON DELETE CASCADE
);

-- =============================================================================
-- LEAD-GENERIERUNG (Lead Generation)
-- =============================================================================

-- Web Forms
CREATE TABLE IF NOT EXISTS marketing_forms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  form_type TEXT CHECK (form_type IN ('contact', 'newsletter', 'download', 'registration', 'survey', 'custom')),
  form_config TEXT NOT NULL, -- JSON: field definitions, validation rules
  success_message TEXT,
  redirect_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  submission_count INTEGER DEFAULT 0,
  conversion_rate REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Form Submissions
CREATE TABLE IF NOT EXISTS marketing_form_submissions (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  submission_data TEXT NOT NULL, -- JSON: submitted field values
  ip_address TEXT,
  user_agent TEXT,
  referrer_url TEXT,
  lead_id TEXT, -- Link to created lead
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (form_id) REFERENCES marketing_forms(id) ON DELETE CASCADE
);

-- Landing Pages
CREATE TABLE IF NOT EXISTS marketing_landing_pages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL, -- HTML/JSON content
  form_id TEXT,
  template_id TEXT,
  seo_config TEXT, -- JSON: meta tags, keywords
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (form_id) REFERENCES marketing_forms(id) ON DELETE SET NULL
);

-- Event Management
CREATE TABLE IF NOT EXISTS marketing_events (
  id TEXT PRIMARY KEY,
  campaign_id TEXT,
  name TEXT NOT NULL,
  event_type TEXT CHECK (event_type IN ('webinar', 'live', 'hybrid', 'conference', 'networking')),
  description TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  location TEXT,
  capacity INTEGER,
  registration_count INTEGER DEFAULT 0,
  attendance_count INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('planned', 'registration_open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'planned',
  budget REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns(id) ON DELETE SET NULL
);

-- Event Registrations
CREATE TABLE IF NOT EXISTS marketing_event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  lead_id TEXT,
  customer_id TEXT,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_phone TEXT,
  registration_data TEXT, -- JSON: additional fields
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled')),
  attendance_status TEXT CHECK (attendance_status IN ('registered', 'confirmed', 'attended', 'no_show', 'cancelled')),
  registered_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES marketing_events(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE SET NULL
);

-- =============================================================================
-- LEAD-SCORING
-- =============================================================================

-- Lead Scoring Models
CREATE TABLE IF NOT EXISTS marketing_scoring_models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  model_type TEXT CHECK (model_type IN ('rule_based', 'ai_based', 'hybrid')),
  scoring_rules TEXT NOT NULL, -- JSON: rules definition
  thresholds TEXT, -- JSON: score thresholds for different stages
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'testing')) DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Lead Scores History
CREATE TABLE IF NOT EXISTS marketing_lead_scores (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  score_breakdown TEXT, -- JSON: detailed score components
  scored_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (model_id) REFERENCES marketing_scoring_models(id) ON DELETE CASCADE
);

-- =============================================================================
-- MARKETING-AUTOMATION
-- =============================================================================

-- Automation Workflows
CREATE TABLE IF NOT EXISTS marketing_workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT CHECK (workflow_type IN ('nurturing', 'onboarding', 're_engagement', 'lifecycle', 'custom')),
  trigger_config TEXT NOT NULL, -- JSON: trigger definition
  workflow_steps TEXT NOT NULL, -- JSON: workflow logic
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'archived')) DEFAULT 'draft',
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Workflow Executions
CREATE TABLE IF NOT EXISTS marketing_workflow_executions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  lead_id TEXT,
  customer_id TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  current_step INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')) DEFAULT 'running',
  execution_data TEXT, -- JSON: execution state
  FOREIGN KEY (workflow_id) REFERENCES marketing_workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE SET NULL
);

-- A/B Test Configurations
CREATE TABLE IF NOT EXISTS marketing_ab_tests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  test_type TEXT CHECK (test_type IN ('email', 'landing_page', 'form', 'content', 'cta')),
  entity_id TEXT NOT NULL, -- ID of the entity being tested
  variant_a TEXT NOT NULL, -- JSON: variant A configuration
  variant_b TEXT NOT NULL, -- JSON: variant B configuration
  test_metric TEXT NOT NULL,
  sample_size INTEGER,
  confidence_level REAL DEFAULT 95,
  status TEXT NOT NULL CHECK (status IN ('draft', 'running', 'completed', 'inconclusive')) DEFAULT 'draft',
  winner TEXT CHECK (winner IN ('a', 'b', 'none')),
  started_at TEXT,
  completed_at TEXT,
  results TEXT, -- JSON: detailed test results
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- ATTRIBUTION & ROI
-- =============================================================================

-- Attribution Models
CREATE TABLE IF NOT EXISTS marketing_attribution_models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model_type TEXT CHECK (model_type IN ('first_touch', 'last_touch', 'linear', 'time_decay', 'position_based', 'data_driven')),
  description TEXT,
  configuration TEXT, -- JSON: model parameters
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Touchpoint Tracking
CREATE TABLE IF NOT EXISTS marketing_touchpoints (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  lead_id TEXT,
  campaign_id TEXT,
  touchpoint_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  source TEXT,
  medium TEXT,
  content TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  value_contribution REAL,
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON marketing_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON marketing_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign ON marketing_campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_sequences_campaign ON marketing_email_sequences(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_steps_sequence ON marketing_email_steps(sequence_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_campaign ON marketing_social_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON marketing_social_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_segments_status ON marketing_segments(status);
CREATE INDEX IF NOT EXISTS idx_forms_status ON marketing_forms(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form ON marketing_form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON marketing_landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_landing_pages_status ON marketing_landing_pages(status);
CREATE INDEX IF NOT EXISTS idx_events_dates ON marketing_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON marketing_event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_lead_scores_lead ON marketing_lead_scores(lead_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON marketing_workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON marketing_workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_customer ON marketing_touchpoints(customer_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_campaign ON marketing_touchpoints(campaign_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_timestamp ON marketing_touchpoints(timestamp);

