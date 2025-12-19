-- SPDX-License-Identifier: MIT
-- Migration: Create all ERP module tables
-- Description: Comprehensive migration for all ERP SteinmetZ modules

-- =============================================================================
-- CRM (Customer Relationship Management) Tables
-- =============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crm_customers]') AND type in (N'U'))
BEGIN
CREATE TABLE crm_customers (
  id NVARCHAR(255) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  email NVARCHAR(255),
  phone NVARCHAR(50),
  company NVARCHAR(255),
  address NVARCHAR(500),
  status NVARCHAR(50) NOT NULL CHECK (status IN ('active', 'inactive', 'prospect')) DEFAULT 'prospect',
  category NVARCHAR(100),
  notes NVARCHAR(MAX),
  created_at DATETIME NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME NOT NULL DEFAULT GETDATE()
);
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[crm_contacts]') AND type in (N'U'))
BEGIN
CREATE TABLE crm_contacts (
  id NVARCHAR(255) PRIMARY KEY,
  customer_id NVARCHAR(255),
  first_name NVARCHAR(100) NOT NULL,
  last_name NVARCHAR(100) NOT NULL,
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
GO

CREATE TABLE IF NOT EXISTS crm_opportunities (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  value REAL DEFAULT 0,
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  status TEXT NOT NULL CHECK (status IN ('open', 'won', 'lost', 'cancelled')) DEFAULT 'open',
  stage TEXT,
  expected_close_date TEXT,
  assigned_to TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS crm_activities (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  contact_id TEXT,
  opportunity_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task', 'demo')),
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('planned', 'completed', 'cancelled')) DEFAULT 'planned',
  scheduled_at TEXT,
  completed_at TEXT,
  duration_minutes INTEGER,
  assigned_to TEXT,
  outcome TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE SET NULL,
  FOREIGN KEY (opportunity_id) REFERENCES crm_opportunities(id) ON DELETE SET NULL
);

-- =============================================================================
-- Dashboard/KPI Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_kpis (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  change_percent REAL,
  category TEXT,
  period TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  due_date TEXT,
  assigned_to TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'warning', 'error', 'success')) DEFAULT 'info',
  read BOOLEAN DEFAULT 0,
  user_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Business Management Tables  
-- =============================================================================

CREATE TABLE IF NOT EXISTS business_companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  legal_form TEXT,
  registration_number TEXT,
  tax_id TEXT,
  vat_id TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Deutschland',
  phone TEXT,
  email TEXT,
  website TEXT,
  founded_date TEXT,
  fiscal_year_start TEXT,
  is_active BOOLEAN DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS business_processes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'under_review')) DEFAULT 'active',
  category TEXT,
  version TEXT,
  documentation_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS business_risks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  probability TEXT CHECK (probability IN ('low', 'medium', 'high', 'critical')),
  impact TEXT CHECK (impact IN ('low', 'medium', 'high', 'critical')),
  mitigation_plan TEXT,
  owner TEXT,
  status TEXT CHECK (status IN ('identified', 'assessed', 'mitigated', 'accepted', 'resolved')) DEFAULT 'identified',
  review_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Procurement/Suppliers Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS procurement_suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  supplier_number TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  payment_terms TEXT,
  delivery_terms TEXT,
  rating REAL CHECK (rating >= 0 AND rating <= 5),
  status TEXT CHECK (status IN ('active', 'inactive', 'blacklisted')) DEFAULT 'active',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS procurement_purchase_orders (
  id TEXT PRIMARY KEY,
  po_number TEXT UNIQUE NOT NULL,
  supplier_id TEXT NOT NULL,
  order_date TEXT NOT NULL,
  delivery_date TEXT,
  total_amount REAL DEFAULT 0 CHECK (total_amount >= 0),
  status TEXT CHECK (status IN ('draft', 'sent', 'confirmed', 'received', 'cancelled')) DEFAULT 'draft',
  payment_status TEXT CHECK (payment_status IN ('pending', 'partial', 'paid')) DEFAULT 'pending',
  notes TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (supplier_id) REFERENCES procurement_suppliers(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS procurement_receiving (
  id TEXT PRIMARY KEY,
  po_id TEXT NOT NULL,
  received_date TEXT NOT NULL,
  received_by TEXT,
  item_id TEXT,
  quantity_ordered REAL,
  quantity_received REAL,
  quality_check TEXT CHECK (quality_check IN ('passed', 'failed', 'pending')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (po_id) REFERENCES procurement_purchase_orders(id) ON DELETE CASCADE
);

-- =============================================================================
-- Production/Manufacturing Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS production_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  product_id TEXT,
  quantity REAL NOT NULL CHECK (quantity > 0),
  start_date TEXT,
  end_date TEXT,
  due_date TEXT,
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled', 'on_hold')) DEFAULT 'planned',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS production_planning (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  production_order_id TEXT,
  planned_date TEXT NOT NULL,
  resource_id TEXT,
  capacity_required REAL,
  status TEXT CHECK (status IN ('draft', 'scheduled', 'in_progress', 'completed')) DEFAULT 'draft',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS production_quality (
  id TEXT PRIMARY KEY,
  production_order_id TEXT,
  inspection_date TEXT NOT NULL,
  inspector TEXT,
  result TEXT CHECK (result IN ('passed', 'failed', 'conditional')) NOT NULL,
  defects_found INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS production_maintenance (
  id TEXT PRIMARY KEY,
  equipment_id TEXT,
  equipment_name TEXT NOT NULL,
  maintenance_type TEXT CHECK (maintenance_type IN ('preventive', 'corrective', 'predictive')),
  scheduled_date TEXT,
  completed_date TEXT,
  technician TEXT,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  cost REAL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Warehouse/Logistics Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS warehouse_locations (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('warehouse', 'zone', 'aisle', 'bin', 'shelf')),
  parent_id TEXT,
  capacity REAL,
  is_active BOOLEAN DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES warehouse_locations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS warehouse_picking (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  picker_id TEXT,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  started_at TEXT,
  completed_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS logistics_shipments (
  id TEXT PRIMARY KEY,
  shipment_number TEXT UNIQUE NOT NULL,
  order_id TEXT,
  carrier TEXT,
  tracking_number TEXT,
  ship_date TEXT,
  delivery_date TEXT,
  status TEXT CHECK (status IN ('preparing', 'shipped', 'in_transit', 'delivered', 'returned', 'cancelled')) DEFAULT 'preparing',
  weight REAL,
  cost REAL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Sales/Marketing Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS sales_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL,
  order_date TEXT NOT NULL,
  delivery_date TEXT,
  total_amount REAL DEFAULT 0,
  status TEXT CHECK (status IN ('draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'draft',
  payment_status TEXT CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')) DEFAULT 'pending',
  notes TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT,
  start_date TEXT,
  end_date TEXT,
  budget REAL,
  spent REAL DEFAULT 0,
  status TEXT CHECK (status IN ('planned', 'active', 'paused', 'completed', 'cancelled')) DEFAULT 'planned',
  target_audience TEXT,
  metrics TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Reporting Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS reports_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT,
  query TEXT,
  parameters TEXT,
  format TEXT CHECK (format IN ('pdf', 'excel', 'csv', 'html')),
  is_active BOOLEAN DEFAULT 1,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reports_scheduled (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  schedule TEXT NOT NULL,
  recipients TEXT,
  last_run TEXT,
  next_run TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (template_id) REFERENCES reports_templates(id) ON DELETE CASCADE
);

-- =============================================================================
-- System/Settings Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS system_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'user', 'viewer')) DEFAULT 'user',
  is_active BOOLEAN DEFAULT 1,
  last_login TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  data_type TEXT CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
  category TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS system_integrations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  config TEXT,
  is_active BOOLEAN DEFAULT 1,
  last_sync TEXT,
  sync_status TEXT CHECK (sync_status IN ('success', 'failed', 'pending')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Create all indexes
-- =============================================================================

-- CRM indexes
CREATE INDEX IF NOT EXISTS idx_crm_customers_status ON crm_customers(status);
CREATE INDEX IF NOT EXISTS idx_crm_customers_email ON crm_customers(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_customer ON crm_contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_customer ON crm_opportunities(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_status ON crm_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_crm_activities_customer ON crm_activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_type ON crm_activities(type);

-- Dashboard indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_kpis_date ON dashboard_kpis(date);
CREATE INDEX IF NOT EXISTS idx_dashboard_tasks_status ON dashboard_tasks(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_tasks_due_date ON dashboard_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_dashboard_notifications_user ON dashboard_notifications(user_id);

-- Business indexes
CREATE INDEX IF NOT EXISTS idx_business_processes_status ON business_processes(status);
CREATE INDEX IF NOT EXISTS idx_business_risks_status ON business_risks(status);

-- Procurement indexes
CREATE INDEX IF NOT EXISTS idx_procurement_suppliers_status ON procurement_suppliers(status);
CREATE INDEX IF NOT EXISTS idx_procurement_po_supplier ON procurement_purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_procurement_po_status ON procurement_purchase_orders(status);

-- Production indexes
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON production_orders(status);
CREATE INDEX IF NOT EXISTS idx_production_planning_order ON production_planning(production_order_id);
CREATE INDEX IF NOT EXISTS idx_production_quality_order ON production_quality(production_order_id);

-- Warehouse indexes
CREATE INDEX IF NOT EXISTS idx_warehouse_locations_parent ON warehouse_locations(parent_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_picking_status ON warehouse_picking(status);
CREATE INDEX IF NOT EXISTS idx_logistics_shipments_status ON logistics_shipments(status);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);

-- System indexes
CREATE INDEX IF NOT EXISTS idx_system_users_email ON system_users(email);
CREATE INDEX IF NOT EXISTS idx_system_users_username ON system_users(username);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
