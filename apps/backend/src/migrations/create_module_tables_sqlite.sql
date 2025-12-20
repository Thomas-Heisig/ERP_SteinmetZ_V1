-- SPDX-License-Identifier: MIT
-- SQLite Migration: Create all ERP module tables for testing
-- This file contains SQLite-compatible table definitions for all modules

-- =============================================================================
-- BUSINESS MANAGEMENT TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS business_company_info (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  official_name TEXT NOT NULL,
  trade_name TEXT,
  company_purpose TEXT,
  founded_date TEXT,
  employee_count INTEGER,
  revenue_class TEXT,
  industry_classification TEXT,
  street TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'Deutschland',
  phone TEXT,
  fax TEXT,
  email TEXT,
  website TEXT,
  business_hours TEXT, -- JSON
  timezone TEXT DEFAULT 'Europe/Berlin',
  logo_url TEXT,
  brand_assets TEXT, -- JSON
  imprint_data TEXT,
  is_active INTEGER DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS business_processes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  owner TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS business_risks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  probability TEXT,
  impact TEXT,
  mitigation TEXT,
  status TEXT DEFAULT 'open',
  owner TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- SALES & CRM TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS sales_orders (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  order_number TEXT UNIQUE,
  customer_id TEXT,
  customer_name TEXT,
  status TEXT DEFAULT 'draft',
  total_amount REAL DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid',
  delivery_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sales_quotes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  quote_number TEXT UNIQUE,
  customer_id TEXT,
  customer_name TEXT,
  status TEXT DEFAULT 'draft',
  total_amount REAL DEFAULT 0,
  valid_until TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sales_leads (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'new',
  source TEXT,
  value_estimate REAL,
  notes TEXT,
  assigned_to TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  status TEXT DEFAULT 'draft',
  budget REAL DEFAULT 0,
  start_date TEXT,
  end_date TEXT,
  target_audience TEXT,
  metrics TEXT, -- JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- PROCUREMENT TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS procurement_suppliers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  rating REAL,
  payment_terms TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS procurement_purchase_orders (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  po_number TEXT UNIQUE,
  supplier_id TEXT,
  status TEXT DEFAULT 'draft',
  total_amount REAL DEFAULT 0,
  delivery_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (supplier_id) REFERENCES procurement_suppliers(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS procurement_receiving (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  po_id TEXT,
  received_date TEXT,
  quantity REAL,
  quality_check TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (po_id) REFERENCES procurement_purchase_orders(id) ON DELETE CASCADE
);

-- =============================================================================
-- PRODUCTION TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS production_orders (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  order_number TEXT UNIQUE,
  product_id TEXT,
  product_name TEXT,
  quantity REAL NOT NULL,
  status TEXT DEFAULT 'planned',
  priority TEXT DEFAULT 'normal',
  planned_start TEXT,
  planned_end TEXT,
  actual_start TEXT,
  actual_end TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS production_planning (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  production_order_id TEXT,
  scheduled_date TEXT,
  resource_id TEXT,
  resource_name TEXT,
  capacity REAL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS production_quality (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  production_order_id TEXT,
  inspection_date TEXT,
  inspector TEXT,
  result TEXT,
  defects_found INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS production_maintenance (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  equipment_id TEXT,
  equipment_name TEXT,
  maintenance_type TEXT,
  scheduled_date TEXT,
  completed_date TEXT,
  status TEXT DEFAULT 'planned',
  technician TEXT,
  cost REAL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS production_machines (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'active',
  capacity REAL,
  location TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- WAREHOUSE TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS warehouse_locations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  code TEXT UNIQUE NOT NULL,
  name TEXT,
  type TEXT,
  capacity REAL,
  parent_id TEXT,
  is_active INTEGER DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES warehouse_locations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS warehouse_picking (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  order_id TEXT,
  picker_id TEXT,
  picker_name TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  started_at TEXT,
  completed_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS warehouse_stock (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  product_id TEXT NOT NULL,
  product_name TEXT,
  location_id TEXT,
  quantity REAL DEFAULT 0,
  unit TEXT,
  min_quantity REAL,
  max_quantity REAL,
  last_counted TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (location_id) REFERENCES warehouse_locations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS logistics_shipments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  shipment_number TEXT UNIQUE,
  order_id TEXT,
  carrier TEXT,
  tracking_number TEXT,
  status TEXT DEFAULT 'pending',
  shipped_date TEXT,
  delivered_date TEXT,
  recipient_name TEXT,
  recipient_address TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- REPORTING TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- financial, sales, production, custom
  category TEXT,
  query_definition TEXT, -- JSON or SQL
  parameters TEXT, -- JSON
  format TEXT DEFAULT 'json', -- json, csv, pdf
  is_scheduled INTEGER DEFAULT 0,
  schedule_cron TEXT,
  created_by TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS report_executions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  report_id TEXT,
  status TEXT DEFAULT 'running',
  started_at TEXT,
  completed_at TEXT,
  result_data TEXT, -- JSON or file path
  error_message TEXT,
  executed_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Business indexes
CREATE INDEX IF NOT EXISTS idx_business_company_active ON business_company_info(is_active);
CREATE INDEX IF NOT EXISTS idx_business_processes_status ON business_processes(status);
CREATE INDEX IF NOT EXISTS idx_business_risks_status ON business_risks(status);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_quotes_status ON sales_quotes(status);
CREATE INDEX IF NOT EXISTS idx_sales_leads_status ON sales_leads(status);

-- Procurement indexes
CREATE INDEX IF NOT EXISTS idx_procurement_suppliers_status ON procurement_suppliers(status);
CREATE INDEX IF NOT EXISTS idx_procurement_po_supplier ON procurement_purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_procurement_po_status ON procurement_purchase_orders(status);

-- Production indexes
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON production_orders(status);
CREATE INDEX IF NOT EXISTS idx_production_machines_status ON production_machines(status);

-- Warehouse indexes
CREATE INDEX IF NOT EXISTS idx_warehouse_locations_code ON warehouse_locations(code);
CREATE INDEX IF NOT EXISTS idx_warehouse_stock_product ON warehouse_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_picking_status ON warehouse_picking(status);
CREATE INDEX IF NOT EXISTS idx_logistics_shipments_status ON logistics_shipments(status);

-- Reporting indexes
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_report_executions_report ON report_executions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_executions_status ON report_executions(status);
