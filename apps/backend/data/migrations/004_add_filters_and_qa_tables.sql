-- SPDX-License-Identifier: MIT
-- Migration 003: Advanced Filters, Quality Assurance, and Enhanced Batch Support

-- Saved Filters for Search and AI Annotator
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[saved_filters]') AND type in (N'U'))
CREATE TABLE saved_filters (
  id NVARCHAR(255) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  filter_type NVARCHAR(50) NOT NULL, -- 'search', 'annotator', 'batch'
  filter_config NVARCHAR(MAX) NOT NULL, -- JSON configuration
  is_preset BIT DEFAULT 0,
  is_public BIT DEFAULT 0,
  created_by NVARCHAR(255),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  usage_count INTEGER DEFAULT 0
);

-- Quality Assurance Reviews
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[qa_reviews]') AND type in (N'U'))
CREATE TABLE qa_reviews (
  id NVARCHAR(255) PRIMARY KEY,
  node_id NVARCHAR(255) NOT NULL,
  reviewer NVARCHAR(255),
  review_status NVARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'needs_revision'
  quality_score FLOAT,
  review_comments NVARCHAR(MAX),
  metrics NVARCHAR(MAX), -- JSON with quality metrics
  created_at DATETIME DEFAULT GETDATE(),
  reviewed_at DATETIME
);

-- Batch Results Storage (enhanced)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[batch_results]') AND type in (N'U'))
CREATE TABLE batch_results (
  id NVARCHAR(255) PRIMARY KEY,
  batch_id NVARCHAR(255) NOT NULL,
  node_id NVARCHAR(255) NOT NULL,
  success BIT DEFAULT 0,
  result NVARCHAR(MAX), -- JSON result data
  error NVARCHAR(MAX),
  retries INT DEFAULT 0,
  duration_ms INT,
  quality_score FLOAT,
  created_at DATETIME DEFAULT GETDATE()
);

-- Model Usage Statistics
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[model_usage_stats]') AND type in (N'U'))
CREATE TABLE model_usage_stats (
  id INT PRIMARY KEY IDENTITY(1,1),
  model_name NVARCHAR(255) NOT NULL,
  provider NVARCHAR(255) NOT NULL,
  operation_type NVARCHAR(255),
  tokens_used INT,
  cost FLOAT,
  duration_ms INT,
  success BIT,
  timestamp DATETIME DEFAULT GETDATE()
);

-- Quality Metrics History
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[quality_metrics_history]') AND type in (N'U'))
CREATE TABLE quality_metrics_history (
  id INT PRIMARY KEY IDENTITY(1,1),
  metric_type NVARCHAR(255) NOT NULL, -- 'accuracy', 'confidence', 'completeness', etc.
  metric_value FLOAT NOT NULL,
  node_count INT,
  batch_id NVARCHAR(255),
  timestamp DATETIME DEFAULT GETDATE()
);

-- Indexes for performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_saved_filters_type' AND object_id = OBJECT_ID('saved_filters'))
CREATE INDEX idx_saved_filters_type ON saved_filters(filter_type);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_saved_filters_public' AND object_id = OBJECT_ID('saved_filters'))
CREATE INDEX idx_saved_filters_public ON saved_filters(is_public);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_qa_reviews_node' AND object_id = OBJECT_ID('qa_reviews'))
CREATE INDEX idx_qa_reviews_node ON qa_reviews(node_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_qa_reviews_status' AND object_id = OBJECT_ID('qa_reviews'))
CREATE INDEX idx_qa_reviews_status ON qa_reviews(review_status);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_batch_results_batch' AND object_id = OBJECT_ID('batch_results'))
CREATE INDEX idx_batch_results_batch ON batch_results(batch_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_batch_results_node' AND object_id = OBJECT_ID('batch_results'))
CREATE INDEX idx_batch_results_node ON batch_results(node_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_model_usage_timestamp' AND object_id = OBJECT_ID('model_usage_stats'))
CREATE INDEX idx_model_usage_timestamp ON model_usage_stats(timestamp);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_quality_metrics_type' AND object_id = OBJECT_ID('quality_metrics_history'))
CREATE INDEX idx_quality_metrics_type ON quality_metrics_history(metric_type);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_quality_metrics_timestamp' AND object_id = OBJECT_ID('quality_metrics_history'))
CREATE INDEX idx_quality_metrics_timestamp ON quality_metrics_history(timestamp);
