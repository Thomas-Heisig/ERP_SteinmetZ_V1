-- SPDX-License-Identifier: MIT
-- Migration: Create CRM (Customer Relationship Management) tables
-- Description: Creates tables for customers, contacts, opportunities, and activities
-- Database: SQLite
-- Created: 2025-12-20

-- =============================================================================
-- CRM TABLES
-- =============================================================================

-- Customers table
CREATE TABLE IF NOT EXISTS crm_customers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('active', 'inactive', 'prospect')),
  category TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE IF NOT EXISTS crm_contacts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  customer_id TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  department TEXT,
  is_primary INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE
);

-- Opportunities (Sales opportunities) table
CREATE TABLE IF NOT EXISTS crm_opportunities (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  customer_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  value REAL DEFAULT 0,
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'cancelled')),
  stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  expected_close_date TEXT,
  assigned_to TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE
);

-- Activities (Interactions, calls, emails, meetings) table
CREATE TABLE IF NOT EXISTS crm_activities (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  customer_id TEXT,
  contact_id TEXT,
  opportunity_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task', 'demo')),
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'cancelled')),
  scheduled_at TEXT,
  completed_at TEXT,
  duration_minutes INTEGER,
  assigned_to TEXT,
  outcome TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE SET NULL,
  FOREIGN KEY (opportunity_id) REFERENCES crm_opportunities(id) ON DELETE SET NULL
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_crm_customers_status ON crm_customers(status);
CREATE INDEX IF NOT EXISTS idx_crm_customers_email ON crm_customers(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_customer ON crm_contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_customer ON crm_opportunities(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_status ON crm_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_stage ON crm_opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_crm_activities_customer ON crm_activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_contact ON crm_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_opportunity ON crm_activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_type ON crm_activities(type);
CREATE INDEX IF NOT EXISTS idx_crm_activities_status ON crm_activities(status);



