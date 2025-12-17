-- SPDX-License-Identifier: MIT
-- Migration 002: Erweiterte KI- und Batch-Unterstützung

-- Batch Operations Tracking
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[batch_operations]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[batch_operations] (
  id NVARCHAR(255) PRIMARY KEY,
  operation NVARCHAR(255) NOT NULL,
  filters NVARCHAR(MAX) NOT NULL,
  options NVARCHAR(MAX),
  status NVARCHAR(50) DEFAULT 'pending',
  progress INT DEFAULT 0,
  created_at DATETIME DEFAULT GETDATE(),
  started_at DATETIME,
  completed_at DATETIME
);
END
GO

-- AI Model Registry (für erweiterte Modellverwaltung)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ai_models]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[ai_models] (
  name NVARCHAR(255) PRIMARY KEY,
  provider NVARCHAR(255) NOT NULL,
  capabilities NVARCHAR(MAX) NOT NULL,
  max_tokens INT,
  context_window INT,
  cost_per_token FLOAT,
  speed NVARCHAR(50),
  accuracy NVARCHAR(50),
  available BIT DEFAULT 1,
  last_checked DATETIME
);
END
GO

-- Performance Metrics (optional für Monitoring)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[performance_metrics]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[performance_metrics] (
  id INT PRIMARY KEY IDENTITY(1,1),
  operation NVARCHAR(255) NOT NULL,
  model_used NVARCHAR(255),
  duration_ms INT,
  success BIT,
  tokens_used INT,
  cost FLOAT,
  timestamp DATETIME DEFAULT GETDATE()
);
END
GO
