-- SPDX-License-Identifier: MIT
-- Migration: Create CRM (Customer Relationship Management) tables
-- Description: Creates tables for customers, contacts, opportunities, and activities

-- Customers table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crm_customers]') AND type in (N'U'))
BEGIN
CREATE TABLE crm_customers (
  id NVARCHAR(255) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  email NVARCHAR(255),
  phone NVARCHAR(50),
  company NVARCHAR(255),
  address NVARCHAR(MAX),
  status NVARCHAR(50) NOT NULL CHECK (status IN ('active', 'inactive', 'prospect')) DEFAULT 'prospect',
  category NVARCHAR(100),
  notes NVARCHAR(MAX),
  created_at DATETIME NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME NOT NULL DEFAULT GETDATE()
);
END

-- Contacts table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crm_contacts]') AND type in (N'U'))
BEGIN
CREATE TABLE crm_contacts (
  id NVARCHAR(255) PRIMARY KEY,
  customer_id NVARCHAR(255),
  first_name NVARCHAR(255) NOT NULL,
  last_name NVARCHAR(255) NOT NULL,
  email NVARCHAR(255),
  phone NVARCHAR(50),
  position NVARCHAR(100),
  department NVARCHAR(100),
  is_primary BIT DEFAULT 0,
  notes NVARCHAR(MAX),
  created_at DATETIME NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE
);
END

-- Opportunities (Sales opportunities) table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crm_opportunities]') AND type in (N'U'))
BEGIN
CREATE TABLE crm_opportunities (
  id NVARCHAR(255) PRIMARY KEY,
  customer_id NVARCHAR(255),
  title NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  value DECIMAL(18, 2) DEFAULT 0,
  probability INT DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  status NVARCHAR(50) NOT NULL CHECK (status IN ('open', 'won', 'lost', 'cancelled')) DEFAULT 'open',
  stage NVARCHAR(100),
  expected_close_date DATETIME,
  assigned_to NVARCHAR(255),
  notes NVARCHAR(MAX),
  created_at DATETIME NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE
);
END

-- Activities (Interactions, calls, emails, meetings) table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crm_activities]') AND type in (N'U'))
BEGIN
CREATE TABLE crm_activities (
  id NVARCHAR(255) PRIMARY KEY,
  customer_id NVARCHAR(255),
  contact_id NVARCHAR(255),
  opportunity_id NVARCHAR(255),
  type NVARCHAR(50) NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task', 'demo')),
  subject NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  status NVARCHAR(50) NOT NULL CHECK (status IN ('planned', 'completed', 'cancelled')) DEFAULT 'planned',
  scheduled_at DATETIME,
  completed_at DATETIME,
  duration_minutes INT,
  assigned_to NVARCHAR(255),
  outcome NVARCHAR(MAX),
  notes NVARCHAR(MAX),
  created_at DATETIME NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE SET NULL,
  FOREIGN KEY (opportunity_id) REFERENCES crm_opportunities(id) ON DELETE SET NULL
);
END

-- Create indexes for better query performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_crm_customers_status' AND object_id = OBJECT_ID('crm_customers'))
CREATE INDEX idx_crm_customers_status ON crm_customers(status);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_crm_customers_email' AND object_id = OBJECT_ID('crm_customers'))
CREATE INDEX idx_crm_customers_email ON crm_customers(email);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_crm_contacts_customer' AND object_id = OBJECT_ID('crm_contacts'))
CREATE INDEX idx_crm_contacts_customer ON crm_contacts(customer_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_crm_opportunities_customer' AND object_id = OBJECT_ID('crm_opportunities'))
CREATE INDEX idx_crm_opportunities_customer ON crm_opportunities(customer_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_crm_opportunities_status' AND object_id = OBJECT_ID('crm_opportunities'))
CREATE INDEX idx_crm_opportunities_status ON crm_opportunities(status);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_crm_activities_customer' AND object_id = OBJECT_ID('crm_activities'))
CREATE INDEX idx_crm_activities_customer ON crm_activities(customer_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_crm_activities_type' AND object_id = OBJECT_ID('crm_activities'))
CREATE INDEX idx_crm_activities_type ON crm_activities(type);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_crm_activities_status' AND object_id = OBJECT_ID('crm_activities'))
CREATE INDEX idx_crm_activities_status ON crm_activities(status);
