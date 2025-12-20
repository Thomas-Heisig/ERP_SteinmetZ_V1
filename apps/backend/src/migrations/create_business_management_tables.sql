-- SPDX-License-Identifier: MIT
-- Migration: Geschäftsverwaltung (Business Management) Module
-- Description: Comprehensive business management tables based on concept document

-- =============================================================================
-- 1. COMPANY MASTER DATA (Unternehmens-Stammdaten)
-- =============================================================================

-- 1.1 Company Basic Information
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'business_company_info') AND type in (N'U'))
BEGIN
CREATE TABLE business_company_info (
  id NVARCHAR(36) PRIMARY KEY DEFAULT (LOWER(CAST(NEWID() AS NVARCHAR(36)))),
  -- Basic Data
  official_name NVARCHAR(MAX) NOT NULL,
  trade_name NVARCHAR(MAX),
  company_purpose NVARCHAR(MAX),
  founded_date DATETIME,
  employee_count INT,
  revenue_class NVARCHAR(100),
  industry_classification NVARCHAR(200),
  
  -- Address
  street NVARCHAR(500),
  postal_code NVARCHAR(20),
  city NVARCHAR(200),
  country NVARCHAR(100) DEFAULT 'Deutschland',
  
  -- Contact
  phone NVARCHAR(50),
  fax NVARCHAR(50),
  email NVARCHAR(255),
  website NVARCHAR(500),
  
  -- Business Hours
  business_hours NVARCHAR(MAX), -- JSON format
  timezone NVARCHAR(100) DEFAULT 'Europe/Berlin',
  
  -- Corporate Identity
  logo_url NVARCHAR(500),
  brand_assets NVARCHAR(MAX), -- JSON format
  imprint_data NVARCHAR(MAX),
  
  -- Status
  is_active BIT DEFAULT 1,
  notes NVARCHAR(MAX),
  
  -- Audit
  created_at DATETIME NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME NOT NULL DEFAULT GETDATE(),
  created_by NVARCHAR(255),
  updated_by NVARCHAR(255)
);
END

-- 1.2 Legal Form & Commercial Register
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'business_legal_info') AND type in (N'U'))
BEGIN
CREATE TABLE business_legal_info (
  id NVARCHAR(36) PRIMARY KEY DEFAULT (LOWER(CAST(NEWID() AS NVARCHAR(36)))),
  company_id NVARCHAR(36) NOT NULL,
  
  -- Legal Form
  legal_form NVARCHAR(100) NOT NULL, -- GmbH, AG, KG, etc.
  registration_number NVARCHAR(100),
  registration_court NVARCHAR(200),
  registration_date DATETIME,
  
  -- Management
  management NVARCHAR(MAX), -- JSON array of management persons
  shareholders NVARCHAR(MAX), -- JSON array of shareholders
  capital_amount DECIMAL(18,2),
  capital_increases NVARCHAR(MAX), -- JSON array of capital increases
  
  -- Authorized Representatives
  authorized_representatives NVARCHAR(MAX), -- JSON array
  
  -- Documents
  articles_of_association NVARCHAR(MAX), -- Document reference
  commercial_register_extract NVARCHAR(MAX), -- Document reference
  
  -- International
  international_registrations NVARCHAR(MAX), -- JSON array
  
  -- Compliance
  compliance_obligations NVARCHAR(MAX), -- JSON array
  representation_rules NVARCHAR(MAX),
  reporting_obligations NVARCHAR(MAX), -- JSON array
  
  -- Audit
  valid_from DATETIME NOT NULL,
  valid_to DATETIME,
  created_at DATETIME NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME NOT NULL DEFAULT GETDATE(),
  created_by NVARCHAR(255),
  updated_by NVARCHAR(255),
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE
);
END

-- 1.3 Tax Numbers & VAT ID
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'business_tax_info') AND type in (N'U'))
BEGIN
CREATE TABLE business_tax_info (
  id NVARCHAR(36) PRIMARY KEY DEFAULT (LOWER(CAST(NEWID() AS NVARCHAR(36)))),
  company_id NVARCHAR(36) NOT NULL,
  
  -- Tax Office
  tax_office NVARCHAR(500),
  tax_office_address NVARCHAR(MAX),
  
  -- Tax Numbers
  tax_number NVARCHAR(100),
  vat_id NVARCHAR(100),
  
  -- Additional Numbers
  business_location_number NVARCHAR(100),
  payroll_tax_number NVARCHAR(100),
  trade_tax_number NVARCHAR(100),
  
  -- International
  international_tax_ids NVARCHAR(MAX), -- JSON array
  
  -- Validation
  verification_status NVARCHAR(50) CHECK (verification_status IN ('pending', 'verified', 'failed')),
  verification_date DATETIME,
  vies_check_log NVARCHAR(MAX), -- JSON array of VIES checks
  
  -- ELSTER/E-Filing
  elster_access NVARCHAR(MAX), -- Encrypted JSON
  digital_signature NVARCHAR(MAX),
  certificate_expiry DATETIME,
  
  -- Tax Classification
  tax_classification NVARCHAR(200),
  tax_obligations NVARCHAR(MAX), -- JSON array
  
  -- Audit
  valid_from DATETIME NOT NULL,
  valid_to DATETIME,
  created_at DATETIME NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME NOT NULL DEFAULT GETDATE(),
  created_by NVARCHAR(255),
  updated_by NVARCHAR(255),
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE
);
END

-- 1.4 Bank Accounts
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'business_bank_accounts') AND type in (N'U'))
BEGIN
CREATE TABLE business_bank_accounts (
  id NVARCHAR(36) PRIMARY KEY DEFAULT (LOWER(CAST(NEWID() AS NVARCHAR(36)))),
  company_id NVARCHAR(36) NOT NULL,
  
  -- Bank Details
  bank_name NVARCHAR(500) NOT NULL,
  account_name NVARCHAR(500) NOT NULL,
  account_type NVARCHAR(100), -- Business account, depot, etc.
  
  -- Account Numbers
  iban NVARCHAR(34) NOT NULL,
  bic NVARCHAR(11),
  bank_code NVARCHAR(20),
  account_number NVARCHAR(50),
  
  -- Limits & Credit
  overdraft_limit DECIMAL(18,2),
  credit_line DECIMAL(18,2),
  
  -- Online Banking
  online_banking_access NVARCHAR(MAX), -- Encrypted JSON
  ebics_keys NVARCHAR(MAX), -- Encrypted JSON
  last_sync DATETIME,
  
  -- Settings
  is_primary BIT DEFAULT 0,
  is_active BIT DEFAULT 1,
  
  -- Warnings & Notifications
  low_balance_threshold DECIMAL(18,2),
  notification_settings NVARCHAR(MAX), -- JSON
  
  -- Audit
  created_at DATETIME NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME NOT NULL DEFAULT GETDATE(),
  created_by NVARCHAR(255),
  updated_by NVARCHAR(255),
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE
);
END

-- 1.5 Communication Channels
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'business_communication') AND type in (N'U'))
BEGIN
CREATE TABLE business_communication (
  id NVARCHAR(36) PRIMARY KEY DEFAULT (LOWER(CAST(NEWID() AS NVARCHAR(36)))),
  company_id NVARCHAR(36) NOT NULL,
  
  -- Type
  channel_type NVARCHAR(50) NOT NULL CHECK (channel_type IN ('email', 'phone', 'fax', 'social_media', 'website', 'other')),
  channel_name NVARCHAR(500) NOT NULL,
  
  -- Details
  value NVARCHAR(500) NOT NULL, -- Email address, phone number, URL, etc.
  description NVARCHAR(MAX),
  
  -- Configuration (for email, phone systems)
  configuration NVARCHAR(MAX), -- JSON format
  
  -- Status
  is_primary BIT DEFAULT 0,
  is_active BIT DEFAULT 1,
  
  -- Audit
  created_at DATETIME NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME NOT NULL DEFAULT GETDATE(),
  created_by NVARCHAR(255),
  updated_by NVARCHAR(255),
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE
);
END

-- =============================================================================
-- 2. ORGANIZATIONAL STRUCTURE (Organisation)
-- =============================================================================

-- 2.1 Organizational Units (Abteilungen)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'business_departments') AND type in (N'U'))
BEGIN
CREATE TABLE business_departments (
  id NVARCHAR(36) PRIMARY KEY DEFAULT (LOWER(CAST(NEWID() AS NVARCHAR(36)))),
  company_id NVARCHAR(36) NOT NULL,
  parent_id NVARCHAR(36),
  
  -- Basic Info
  name NVARCHAR(500) NOT NULL,
  code NVARCHAR(100),
  type NVARCHAR(100), -- department, team, division, etc.
  description NVARCHAR(MAX),
  
  -- Hierarchy
  level INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  
  -- Management
  manager_id NVARCHAR(36), -- Reference to HR employee
  deputy_manager_id NVARCHAR(36),
  
  -- Resources
  budget DECIMAL(18,2),
  employee_count INT,
  
  -- Location
  location_id NVARCHAR(36),
  
  -- Status
  is_active BIT DEFAULT 1,
  
  -- Audit
  valid_from DATETIME NOT NULL,
  valid_to DATETIME,
  created_at DATETIME NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME NOT NULL DEFAULT GETDATE(),
  created_by NVARCHAR(255),
  updated_by NVARCHAR(255),
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES business_departments(id) ON DELETE NO ACTION
);
END

-- 2.2 Locations & Branches
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'business_locations') AND type in (N'U'))
BEGIN
CREATE TABLE business_locations (
  id NVARCHAR(36) PRIMARY KEY DEFAULT (LOWER(CAST(NEWID() AS NVARCHAR(36)))),
  company_id NVARCHAR(36) NOT NULL,
  
  -- Type
  location_type NVARCHAR(50) CHECK (location_type IN ('headquarters', 'branch', 'production', 'warehouse', 'sales_office', 'service_center', 'foreign', 'representative', 'home_office', 'temporary')),
  
  -- Basic Info
  name NVARCHAR(500) NOT NULL,
  code NVARCHAR(100),
  description NVARCHAR(MAX),
  
  -- Address
  street NVARCHAR(500),
  postal_code NVARCHAR(20),
  city NVARCHAR(200),
  country NVARCHAR(100),
  
  -- Contact
  phone NVARCHAR(50),
  email NVARCHAR(255),
  
  -- Building Info
  building_info NVARCHAR(MAX), -- JSON
  area_sqm DECIMAL(18,2),
  capacity INT,
  equipment NVARCHAR(MAX), -- JSON array
  
  -- Financial
  rent_or_purchase NVARCHAR(50) CHECK (rent_or_purchase IN ('rent', 'purchase', 'lease')),
  monthly_cost DECIMAL(18,2),
  
  -- Infrastructure
  infrastructure NVARCHAR(MAX), -- JSON
  connectivity NVARCHAR(MAX), -- JSON
  
  -- Compliance
  compliance_requirements NVARCHAR(MAX), -- JSON array
  
  -- Performance
  utilization_percent DECIMAL(5,2),
  
  -- Status
  is_active BIT DEFAULT 1,
  
  -- Audit
  valid_from DATETIME NOT NULL,
  valid_to DATETIME,
  created_at DATETIME NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME NOT NULL DEFAULT GETDATE(),
  created_by NVARCHAR(255),
  updated_by NVARCHAR(255),
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE
);
END

-- 2.3 Cost Centers
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'business_cost_centers') AND type in (N'U'))
BEGIN
CREATE TABLE business_cost_centers (
  id NVARCHAR(36) PRIMARY KEY DEFAULT (LOWER(CAST(NEWID() AS NVARCHAR(36)))),
  company_id NVARCHAR(36) NOT NULL,
  parent_id NVARCHAR(36),
  
  -- Basic Info
  code NVARCHAR(100) NOT NULL,
  name NVARCHAR(500) NOT NULL,
  type NVARCHAR(100) CHECK (type IN ('cost_center', 'profit_center', 'investment_center', 'revenue_center')),
  description NVARCHAR(MAX),
  
  -- Hierarchy
  level INT DEFAULT 0,
  
  -- Responsibility
  responsible_person_id NVARCHAR(36),
  budget_responsible_id NVARCHAR(36),
  
  -- Budget
  annual_budget DECIMAL(18,2),
  
  -- Department Link
  department_id NVARCHAR(36),
  
  -- Status
  is_active BIT DEFAULT 1,
  
  -- Audit
  valid_from DATETIME NOT NULL,
  valid_to DATETIME,
  created_at DATETIME NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME NOT NULL DEFAULT GETDATE(),
  created_by NVARCHAR(255),
  updated_by NVARCHAR(255),
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES business_cost_centers(id) ON DELETE NO ACTION,
  FOREIGN KEY (department_id) REFERENCES business_departments(id) ON DELETE NO ACTION
);
END

-- 2.4 Roles & Responsibilities
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'business_roles') AND type in (N'U'))
BEGIN
CREATE TABLE business_roles (
  id NVARCHAR(36) PRIMARY KEY DEFAULT (LOWER(CAST(NEWID() AS NVARCHAR(36)))),
  company_id NVARCHAR(36) NOT NULL,
  
  -- Basic Info
  role_name NVARCHAR(500) NOT NULL,
  role_code NVARCHAR(100),
  description NVARCHAR(MAX),
  
  -- Competencies
  competency_profile NVARCHAR(MAX), -- JSON
  qualifications_required NVARCHAR(MAX), -- JSON array
  
  -- Responsibilities
  responsibility_areas NVARCHAR(MAX), -- JSON array
  decision_authority NVARCHAR(MAX), -- JSON
  approval_limits NVARCHAR(MAX), -- JSON
  
  -- Career
  career_level NVARCHAR(100),
  
  -- Status
  is_active BIT DEFAULT 1,
  
  -- Audit
  created_at DATETIME NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME NOT NULL DEFAULT GETDATE(),
  created_by NVARCHAR(255),
  updated_by NVARCHAR(255),
  
  FOREIGN KEY (company_id) REFERENCES business_company_info(id) ON DELETE CASCADE
);
END

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
