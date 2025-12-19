-- SPDX-License-Identifier: MIT
-- Migration: Geschäftsverwaltung (Business Management) Module
-- Description: Comprehensive business management tables based on concept document

-- =============================================================================
-- 1. COMPANY MASTER DATA (Unternehmens-Stammdaten)
-- =============================================================================

-- 1.1 Company Basic Information
CREATE TABLE IF NOT EXISTS business_company_info (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  -- Basic Data
  official_name TEXT NOT NULL,
  trade_name TEXT,
  company_purpose TEXT,
  founded_date TEXT,
  employee_count INTEGER,
  revenue_class TEXT,
  industry_classification TEXT,
  
  -- Address
  street TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'Deutschland',
  
  -- Contact
  phone TEXT,
  fax TEXT,
  email TEXT,
  website TEXT,
  
  -- Business Hours
  business_hours TEXT, -- JSON format
  timezone TEXT DEFAULT 'Europe/Berlin',
  
  -- Corporate Identity
  logo_url TEXT,
  brand_assets TEXT, -- JSON format
  imprint_data TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT 1,
  notes TEXT,
  
  -- Audit
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT
);

-- 1.2 Legal Form & Commercial Register
CREATE TABLE IF NOT EXISTS business_legal_info (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company_id TEXT NOT NULL,
  
  -- Legal Form
  legal_form TEXT NOT NULL, -- GmbH, AG, KG, etc.
  registration_number TEXT,
  registration_court TEXT,
  registration_date TEXT,
  
  -- Management
  management TEXT, -- JSON array of management persons
  shareholders TEXT, -- JSON array of shareholders
  capital_amount REAL,
  capital_increases TEXT, -- JSON array of capital increases
  
  -- Authorized Representatives
  authorized_representatives TEXT, -- JSON array
  
  -- Documents
  articles_of_association TEXT, -- Document reference
  commercial_register_extract TEXT, -- Document reference
  
  -- International
  international_registrations TEXT, -- JSON array
  
  -- Compliance
  compliance_obligations TEXT, -- JSON array
  representation_rules TEXT,
  reporting_obligations TEXT, -- JSON array
  
  -- Audit
  valid_from TEXT NOT NULL,
  valid_to TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT,
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE
);

-- 1.3 Tax Numbers & VAT ID
CREATE TABLE IF NOT EXISTS business_tax_info (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company_id TEXT NOT NULL,
  
  -- Tax Office
  tax_office TEXT,
  tax_office_address TEXT,
  
  -- Tax Numbers
  tax_number TEXT,
  vat_id TEXT,
  
  -- Additional Numbers
  business_location_number TEXT,
  payroll_tax_number TEXT,
  trade_tax_number TEXT,
  
  -- International
  international_tax_ids TEXT, -- JSON array
  
  -- Validation
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'failed')),
  verification_date TEXT,
  vies_check_log TEXT, -- JSON array of VIES checks
  
  -- ELSTER/E-Filing
  elster_access TEXT, -- Encrypted JSON
  digital_signature TEXT,
  certificate_expiry TEXT,
  
  -- Tax Classification
  tax_classification TEXT,
  tax_obligations TEXT, -- JSON array
  
  -- Audit
  valid_from TEXT NOT NULL,
  valid_to TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT,
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE
);

-- 1.4 Bank Accounts
CREATE TABLE IF NOT EXISTS business_bank_accounts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company_id TEXT NOT NULL,
  
  -- Bank Details
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT, -- Business account, depot, etc.
  
  -- Account Numbers
  iban TEXT NOT NULL,
  bic TEXT,
  bank_code TEXT,
  account_number TEXT,
  
  -- Limits & Credit
  overdraft_limit REAL,
  credit_line REAL,
  
  -- Online Banking
  online_banking_access TEXT, -- Encrypted JSON
  ebics_keys TEXT, -- Encrypted JSON
  last_sync TEXT,
  
  -- Settings
  is_primary BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  
  -- Warnings & Notifications
  low_balance_threshold REAL,
  notification_settings TEXT, -- JSON
  
  -- Audit
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT,
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE
);

-- 1.5 Communication Channels
CREATE TABLE IF NOT EXISTS business_communication (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company_id TEXT NOT NULL,
  
  -- Type
  channel_type TEXT NOT NULL CHECK (channel_type IN ('email', 'phone', 'fax', 'social_media', 'website', 'other')),
  channel_name TEXT NOT NULL,
  
  -- Details
  value TEXT NOT NULL, -- Email address, phone number, URL, etc.
  description TEXT,
  
  -- Configuration (for email, phone systems)
  configuration TEXT, -- JSON format
  
  -- Status
  is_primary BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  
  -- Audit
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT,
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE
);

-- =============================================================================
-- 2. ORGANIZATIONAL STRUCTURE (Organisation)
-- =============================================================================

-- 2.1 Organizational Units (Abteilungen)
CREATE TABLE IF NOT EXISTS business_departments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company_id TEXT NOT NULL,
  parent_id TEXT,
  
  -- Basic Info
  name TEXT NOT NULL,
  code TEXT,
  type TEXT, -- department, team, division, etc.
  description TEXT,
  
  -- Hierarchy
  level INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  
  -- Management
  manager_id TEXT, -- Reference to HR employee
  deputy_manager_id TEXT,
  
  -- Resources
  budget REAL,
  employee_count INTEGER,
  
  -- Location
  location_id TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT 1,
  
  -- Audit
  valid_from TEXT NOT NULL,
  valid_to TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT,
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES business_departments(id) ON DELETE SET NULL
);

-- 2.2 Locations & Branches
CREATE TABLE IF NOT EXISTS business_locations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company_id TEXT NOT NULL,
  
  -- Type
  location_type TEXT CHECK (location_type IN ('headquarters', 'branch', 'production', 'warehouse', 'sales_office', 'service_center', 'foreign', 'representative', 'home_office', 'temporary')),
  
  -- Basic Info
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  
  -- Address
  street TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT,
  
  -- Contact
  phone TEXT,
  email TEXT,
  
  -- Building Info
  building_info TEXT, -- JSON
  area_sqm REAL,
  capacity INTEGER,
  equipment TEXT, -- JSON array
  
  -- Financial
  rent_or_purchase TEXT CHECK (rent_or_purchase IN ('rent', 'purchase', 'lease')),
  monthly_cost REAL,
  
  -- Infrastructure
  infrastructure TEXT, -- JSON
  connectivity TEXT, -- JSON
  
  -- Compliance
  compliance_requirements TEXT, -- JSON array
  
  -- Performance
  utilization_percent REAL,
  
  -- Status
  is_active BOOLEAN DEFAULT 1,
  
  -- Audit
  valid_from TEXT NOT NULL,
  valid_to TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT,
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE
);

-- 2.3 Cost Centers
CREATE TABLE IF NOT EXISTS business_cost_centers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company_id TEXT NOT NULL,
  parent_id TEXT,
  
  -- Basic Info
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('cost_center', 'profit_center', 'investment_center', 'revenue_center')),
  description TEXT,
  
  -- Hierarchy
  level INTEGER DEFAULT 0,
  
  -- Responsibility
  responsible_person_id TEXT,
  budget_responsible_id TEXT,
  
  -- Budget
  annual_budget REAL,
  
  -- Department Link
  department_id TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT 1,
  
  -- Audit
  valid_from TEXT NOT NULL,
  valid_to TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT,
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES business_cost_centers(id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES business_departments(id) ON DELETE SET NULL
);

-- 2.4 Roles & Responsibilities
CREATE TABLE IF NOT EXISTS business_roles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company_id TEXT NOT NULL,
  
  -- Basic Info
  role_name TEXT NOT NULL,
  role_code TEXT,
  description TEXT,
  
  -- Competencies
  competency_profile TEXT, -- JSON
  qualifications_required TEXT, -- JSON array
  
  -- Responsibilities
  responsibility_areas TEXT, -- JSON array
  decision_authority TEXT, -- JSON
  approval_limits TEXT, -- JSON
  
  -- Career
  career_level TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT 1,
  
  -- Audit
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT,
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE
);

-- =============================================================================
-- 3. DOCUMENT MANAGEMENT (Dokumentenmanagement)
-- =============================================================================

-- 3.1 Document Templates
CREATE TABLE IF NOT EXISTS business_doc_templates (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company_id TEXT NOT NULL,
  
  -- Basic Info
  name TEXT NOT NULL,
  category TEXT, -- email, letter, quote, invoice, report, form, presentation, contract, policy, process
  description TEXT,
  
  -- Template Content
  template_content TEXT, -- JSON or HTML
  variables TEXT, -- JSON array of variables/placeholders
  
  -- Design
  layout TEXT, -- JSON
  branding TEXT, -- JSON
  
  -- Language
  language TEXT DEFAULT 'de',
  
  -- Version
  version TEXT NOT NULL DEFAULT '1.0',
  status TEXT CHECK (status IN ('draft', 'review', 'approved', 'archived')) DEFAULT 'draft',
  
  -- Usage
  usage_count INTEGER DEFAULT 0,
  last_used TEXT,
  
  -- Approval
  approved_by TEXT,
  approved_at TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT 1,
  
  -- Audit
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT,
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE
);

-- 3.2 Document Versions
CREATE TABLE IF NOT EXISTS business_doc_versions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  template_id TEXT NOT NULL,
  
  -- Version Info
  version TEXT NOT NULL,
  version_note TEXT,
  
  -- Content
  content TEXT, -- Full template content snapshot
  
  -- Author
  author_id TEXT,
  
  -- Status
  is_current BOOLEAN DEFAULT 0,
  
  -- Audit
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (template_id) REFERENCES business_doc_templates(id) ON DELETE CASCADE
);

-- 3.3 Workflow Definitions
CREATE TABLE IF NOT EXISTS business_workflows (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company_id TEXT NOT NULL,
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT, -- approval, review, notification, etc.
  
  -- Target
  target_entity TEXT, -- document, template, invoice, etc.
  
  -- Steps
  steps TEXT NOT NULL, -- JSON array of workflow steps
  
  -- Rules
  rules TEXT, -- JSON conditional rules
  escalation_rules TEXT, -- JSON
  
  -- SLA
  sla_hours INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT 1,
  version TEXT DEFAULT '1.0',
  
  -- Audit
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT,
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE
);

-- 3.4 Workflow Instances
CREATE TABLE IF NOT EXISTS business_workflow_instances (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workflow_id TEXT NOT NULL,
  
  -- Target
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  
  -- Status
  current_step INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
  
  -- Timing
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  due_date TEXT,
  
  -- Current Approver
  current_approver_id TEXT,
  
  -- History
  step_history TEXT, -- JSON array of completed steps
  
  -- Audit
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (workflow_id) REFERENCES business_workflows(id) ON DELETE CASCADE
);

-- 3.5 Document Archive
CREATE TABLE IF NOT EXISTS business_doc_archive (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company_id TEXT NOT NULL,
  
  -- Document Info
  document_name TEXT NOT NULL,
  document_type TEXT,
  document_category TEXT,
  
  -- Storage
  storage_path TEXT NOT NULL,
  file_size INTEGER,
  file_hash TEXT, -- For integrity verification
  mime_type TEXT,
  
  -- Metadata
  metadata TEXT, -- JSON
  tags TEXT, -- JSON array
  
  -- Retention
  retention_period_years INTEGER,
  retention_start_date TEXT,
  retention_end_date TEXT,
  legal_hold BOOLEAN DEFAULT 0,
  
  -- Archive Status
  archived_date TEXT NOT NULL,
  archive_status TEXT CHECK (archive_status IN ('active', 'to_delete', 'deleted')) DEFAULT 'active',
  
  -- Access
  access_log TEXT, -- JSON array of access events
  
  -- Compliance
  compliance_tags TEXT, -- JSON array (GoBD, DSGVO, etc.)
  
  -- Audit
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT,
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE
);

-- =============================================================================
-- 4. AUDIT TRAIL (Change History)
-- =============================================================================

CREATE TABLE IF NOT EXISTS business_audit_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Entity
  entity_type TEXT NOT NULL, -- company, department, cost_center, etc.
  entity_id TEXT NOT NULL,
  
  -- Action
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'approve', 'reject')),
  
  -- Changes
  old_value TEXT, -- JSON
  new_value TEXT, -- JSON
  changed_fields TEXT, -- JSON array
  
  -- User
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  
  -- Context
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamp
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- INDEXES for Performance
-- =============================================================================

-- Company Info
CREATE INDEX IF NOT EXISTS idx_business_company_info_active ON business_company_info(is_active);

-- Legal Info
CREATE INDEX IF NOT EXISTS idx_business_legal_info_company ON business_legal_info(company_id);
CREATE INDEX IF NOT EXISTS idx_business_legal_info_valid ON business_legal_info(valid_from, valid_to);

-- Tax Info
CREATE INDEX IF NOT EXISTS idx_business_tax_info_company ON business_tax_info(company_id);
CREATE INDEX IF NOT EXISTS idx_business_tax_info_vat ON business_tax_info(vat_id);

-- Bank Accounts
CREATE INDEX IF NOT EXISTS idx_business_bank_accounts_company ON business_bank_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_business_bank_accounts_iban ON business_bank_accounts(iban);

-- Communication
CREATE INDEX IF NOT EXISTS idx_business_communication_company ON business_communication(company_id);
CREATE INDEX IF NOT EXISTS idx_business_communication_type ON business_communication(channel_type);

-- Departments
CREATE INDEX IF NOT EXISTS idx_business_departments_company ON business_departments(company_id);
CREATE INDEX IF NOT EXISTS idx_business_departments_parent ON business_departments(parent_id);
CREATE INDEX IF NOT EXISTS idx_business_departments_active ON business_departments(is_active);

-- Locations
CREATE INDEX IF NOT EXISTS idx_business_locations_company ON business_locations(company_id);
CREATE INDEX IF NOT EXISTS idx_business_locations_type ON business_locations(location_type);

-- Cost Centers
CREATE INDEX IF NOT EXISTS idx_business_cost_centers_company ON business_cost_centers(company_id);
CREATE INDEX IF NOT EXISTS idx_business_cost_centers_parent ON business_cost_centers(parent_id);
CREATE INDEX IF NOT EXISTS idx_business_cost_centers_code ON business_cost_centers(code);

-- Roles
CREATE INDEX IF NOT EXISTS idx_business_roles_company ON business_roles(company_id);

-- Templates
CREATE INDEX IF NOT EXISTS idx_business_doc_templates_company ON business_doc_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_business_doc_templates_category ON business_doc_templates(category);
CREATE INDEX IF NOT EXISTS idx_business_doc_templates_status ON business_doc_templates(status);

-- Workflows
CREATE INDEX IF NOT EXISTS idx_business_workflows_company ON business_workflows(company_id);
CREATE INDEX IF NOT EXISTS idx_business_workflow_instances_workflow ON business_workflow_instances(workflow_id);
CREATE INDEX IF NOT EXISTS idx_business_workflow_instances_entity ON business_workflow_instances(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_business_workflow_instances_status ON business_workflow_instances(status);

-- Archive
CREATE INDEX IF NOT EXISTS idx_business_doc_archive_company ON business_doc_archive(company_id);
CREATE INDEX IF NOT EXISTS idx_business_doc_archive_type ON business_doc_archive(document_type);

-- Audit Log
CREATE INDEX IF NOT EXISTS idx_business_audit_log_entity ON business_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_business_audit_log_timestamp ON business_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_business_audit_log_user ON business_audit_log(user_id);
