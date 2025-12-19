-- SPDX-License-Identifier: MIT
-- Migration: Create Comprehensive Dashboard Tables
-- Description: Creates all tables needed for the comprehensive ERP dashboard based on _1_DASHBOARD.md

-- =============================================================================
-- Executive Overview - Revenue Metrics
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_revenue_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  daily_revenue REAL DEFAULT 0,
  monthly_revenue REAL DEFAULT 0,
  yearly_revenue REAL DEFAULT 0,
  previous_month_revenue REAL DEFAULT 0,
  previous_year_revenue REAL DEFAULT 0,
  budget_target REAL DEFAULT 0,
  forecast_amount REAL DEFAULT 0,
  forecast_confidence REAL DEFAULT 0,
  average_order_value REAL DEFAULT 0,
  growth_rate REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_top_customers (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  revenue REAL DEFAULT 0,
  rank INTEGER,
  period TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_top_products (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  revenue REAL DEFAULT 0,
  rank INTEGER,
  period TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_regional_revenue (
  id TEXT PRIMARY KEY,
  region TEXT NOT NULL,
  revenue REAL DEFAULT 0,
  percentage REAL DEFAULT 0,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Executive Overview - Profit Margins
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_margin_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  gross_margin REAL DEFAULT 0,
  net_margin REAL DEFAULT 0,
  target_margin REAL DEFAULT 0,
  benchmark_margin REAL DEFAULT 0,
  period TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_margin_by_product (
  id TEXT PRIMARY KEY,
  product_group TEXT NOT NULL,
  margin REAL DEFAULT 0,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_margin_by_customer (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  margin REAL DEFAULT 0,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Executive Overview - Liquidity Status
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_liquidity_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  current_balance REAL DEFAULT 0,
  daily_cashflow REAL DEFAULT 0,
  forecast_7days REAL DEFAULT 0,
  forecast_30days REAL DEFAULT 0,
  payables_due REAL DEFAULT 0,
  receivables_expected REAL DEFAULT 0,
  credit_line_available REAL DEFAULT 0,
  short_term_liabilities REAL DEFAULT 0,
  warning_level TEXT CHECK (warning_level IN ('green', 'yellow', 'red')) DEFAULT 'green',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Executive Overview - Order Intake
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_order_intake (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  daily_intake REAL DEFAULT 0,
  monthly_intake REAL DEFAULT 0,
  target_intake REAL DEFAULT 0,
  average_order_size REAL DEFAULT 0,
  deviation_percentage REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_order_intake_by_sales (
  id TEXT PRIMARY KEY,
  sales_person TEXT NOT NULL,
  intake REAL DEFAULT 0,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_order_intake_by_region (
  id TEXT PRIMARY KEY,
  region TEXT NOT NULL,
  intake REAL DEFAULT 0,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Executive Overview - Productivity Metrics
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_productivity_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  revenue_per_employee REAL DEFAULT 0,
  output_per_machine_hour REAL DEFAULT 0,
  average_throughput_time REAL DEFAULT 0,
  oee REAL DEFAULT 0,
  capacity_utilization REAL DEFAULT 0,
  target_value REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Process Monitoring - Lead to Cash Pipeline
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_pipeline_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  stage TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  value REAL DEFAULT 0,
  conversion_rate REAL DEFAULT 0,
  average_cycle_time INTEGER DEFAULT 0,
  forecast_accuracy REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_stagnant_opportunities (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  days_in_stage INTEGER DEFAULT 0,
  value REAL DEFAULT 0,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Process Monitoring - Procure to Pay
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_procurement_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  open_orders INTEGER DEFAULT 0,
  pending_receipts INTEGER DEFAULT 0,
  open_invoices INTEGER DEFAULT 0,
  average_processing_time INTEGER DEFAULT 0,
  payables_due REAL DEFAULT 0,
  dpo REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_supplier_performance (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  otif_rate REAL DEFAULT 0,
  complaint_rate REAL DEFAULT 0,
  price_variance REAL DEFAULT 0,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Process Monitoring - Production Utilization
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_production_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  current_utilization REAL DEFAULT 0,
  machine_utilization REAL DEFAULT 0,
  personnel_utilization REAL DEFAULT 0,
  target_utilization REAL DEFAULT 0,
  shift TEXT,
  capacity_reserve REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_production_bottlenecks (
  id TEXT PRIMARY KEY,
  resource_id TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('machine', 'personnel', 'material')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  impact_description TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Process Monitoring - Service Level
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_sla_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  sla_fulfillment REAL DEFAULT 0,
  average_response_time INTEGER DEFAULT 0,
  average_resolution_time INTEGER DEFAULT 0,
  first_contact_resolution REAL DEFAULT 0,
  target_sla REAL DEFAULT 0,
  ticket_backlog INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_sla_violations (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  violation_time INTEGER DEFAULT 0,
  customer_id TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Process Monitoring - Project Progress
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_project_metrics (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  progress_percentage REAL DEFAULT 0,
  budget_used REAL DEFAULT 0,
  budget_total REAL DEFAULT 0,
  schedule_variance REAL DEFAULT 0,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Warnings & Escalations
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_delivery_delays (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  delay_days INTEGER DEFAULT 0,
  estimated_revenue_loss REAL DEFAULT 0,
  supplier_id TEXT,
  root_cause TEXT,
  escalation_status TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_budget_overruns (
  id TEXT PRIMARY KEY,
  department TEXT NOT NULL,
  budget_allocated REAL DEFAULT 0,
  budget_spent REAL DEFAULT 0,
  overrun_amount REAL DEFAULT 0,
  overrun_percentage REAL DEFAULT 0,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  manager TEXT,
  approval_status TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_quality_issues (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  affected_quantity INTEGER DEFAULT 0,
  estimated_cost REAL DEFAULT 0,
  root_cause TEXT,
  corrective_action TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_customer_complaints (
  id TEXT PRIMARY KEY,
  complaint_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_clv REAL DEFAULT 0,
  category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  estimated_value_loss REAL DEFAULT 0,
  resolution_deadline TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_system_warnings (
  id TEXT PRIMARY KEY,
  warning_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
  component TEXT NOT NULL,
  message TEXT NOT NULL,
  response_time INTEGER,
  memory_usage REAL,
  api_status TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Real-time Analytics - Finance KPIs
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_cashflow_analytics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  operating_cashflow REAL DEFAULT 0,
  investing_cashflow REAL DEFAULT 0,
  financing_cashflow REAL DEFAULT 0,
  total_cashflow REAL DEFAULT 0,
  forecast REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_dso_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  dso_current REAL DEFAULT 0,
  dso_benchmark REAL DEFAULT 0,
  outstanding_aging TEXT,
  critical_debtors INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_roi_by_department (
  id TEXT PRIMARY KEY,
  department TEXT NOT NULL,
  roi REAL DEFAULT 0,
  investment REAL DEFAULT 0,
  return_amount REAL DEFAULT 0,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Real-time Analytics - Production KPIs
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_oee_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  machine_id TEXT,
  availability REAL DEFAULT 0,
  performance REAL DEFAULT 0,
  quality REAL DEFAULT 0,
  oee REAL DEFAULT 0,
  target_oee REAL DEFAULT 0,
  shift TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_throughput_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  product_id TEXT,
  current_throughput_time INTEGER DEFAULT 0,
  target_throughput_time INTEGER DEFAULT 0,
  bottleneck_step TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_scrap_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  product_id TEXT,
  machine_id TEXT,
  scrap_rate REAL DEFAULT 0,
  target_rate REAL DEFAULT 0,
  scrap_cost REAL DEFAULT 0,
  root_cause TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Real-time Analytics - Customer KPIs
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_clv_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  customer_segment TEXT NOT NULL,
  average_clv REAL DEFAULT 0,
  acquisition_cost REAL DEFAULT 0,
  risk_customers INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_churn_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  period TEXT NOT NULL,
  churn_rate REAL DEFAULT 0,
  churn_count INTEGER DEFAULT 0,
  benchmark_rate REAL DEFAULT 0,
  risk_customers INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_nps_csat_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  nps_score REAL DEFAULT 0,
  csat_score REAL DEFAULT 0,
  target_nps REAL DEFAULT 0,
  target_csat REAL DEFAULT 0,
  touchpoint TEXT,
  region TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_response_time_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  channel TEXT NOT NULL,
  average_response_time INTEGER DEFAULT 0,
  sla_threshold INTEGER DEFAULT 0,
  sla_violations INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_conversion_metrics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  channel TEXT NOT NULL,
  region TEXT,
  conversion_rate REAL DEFAULT 0,
  target_rate REAL DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  visitors INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Widget Configuration & Personalization
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_widget_config (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  widget_type TEXT NOT NULL,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 1,
  height INTEGER DEFAULT 1,
  settings TEXT,
  is_visible BOOLEAN DEFAULT 1,
  refresh_interval INTEGER DEFAULT 300,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_user_layouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  layout_name TEXT NOT NULL,
  layout_config TEXT NOT NULL,
  is_default BOOLEAN DEFAULT 0,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')) DEFAULT 'desktop',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dashboard_favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Revenue Metrics
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_date ON dashboard_revenue_metrics(date);
CREATE INDEX IF NOT EXISTS idx_top_customers_period ON dashboard_top_customers(period, date);
CREATE INDEX IF NOT EXISTS idx_top_products_period ON dashboard_top_products(period, date);
CREATE INDEX IF NOT EXISTS idx_regional_revenue_date ON dashboard_regional_revenue(date);

-- Margins
CREATE INDEX IF NOT EXISTS idx_margin_metrics_date ON dashboard_margin_metrics(date);
CREATE INDEX IF NOT EXISTS idx_margin_product_date ON dashboard_margin_by_product(date);
CREATE INDEX IF NOT EXISTS idx_margin_customer_date ON dashboard_margin_by_customer(date);

-- Liquidity
CREATE INDEX IF NOT EXISTS idx_liquidity_date ON dashboard_liquidity_metrics(date);
CREATE INDEX IF NOT EXISTS idx_liquidity_warning ON dashboard_liquidity_metrics(warning_level, date);

-- Orders
CREATE INDEX IF NOT EXISTS idx_order_intake_date ON dashboard_order_intake(date);
CREATE INDEX IF NOT EXISTS idx_order_sales_date ON dashboard_order_intake_by_sales(date);
CREATE INDEX IF NOT EXISTS idx_order_region_date ON dashboard_order_intake_by_region(date);

-- Productivity
CREATE INDEX IF NOT EXISTS idx_productivity_date ON dashboard_productivity_metrics(date);

-- Pipeline
CREATE INDEX IF NOT EXISTS idx_pipeline_date_stage ON dashboard_pipeline_metrics(date, stage);
CREATE INDEX IF NOT EXISTS idx_stagnant_opps_date ON dashboard_stagnant_opportunities(date);

-- Procurement
CREATE INDEX IF NOT EXISTS idx_procurement_date ON dashboard_procurement_metrics(date);
CREATE INDEX IF NOT EXISTS idx_supplier_perf_date ON dashboard_supplier_performance(date);

-- Production
CREATE INDEX IF NOT EXISTS idx_production_date ON dashboard_production_metrics(date);
CREATE INDEX IF NOT EXISTS idx_bottlenecks_date ON dashboard_production_bottlenecks(date, severity);

-- SLA
CREATE INDEX IF NOT EXISTS idx_sla_date ON dashboard_sla_metrics(date);
CREATE INDEX IF NOT EXISTS idx_sla_violations_date ON dashboard_sla_violations(date, severity);

-- Projects
CREATE INDEX IF NOT EXISTS idx_project_metrics_date ON dashboard_project_metrics(date);
CREATE INDEX IF NOT EXISTS idx_project_status ON dashboard_project_metrics(status, risk_level);

-- Warnings
CREATE INDEX IF NOT EXISTS idx_delivery_delays_priority ON dashboard_delivery_delays(priority, date);
CREATE INDEX IF NOT EXISTS idx_budget_overruns_priority ON dashboard_budget_overruns(priority, date);
CREATE INDEX IF NOT EXISTS idx_quality_issues_severity ON dashboard_quality_issues(severity, date);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON dashboard_customer_complaints(priority, status);
CREATE INDEX IF NOT EXISTS idx_system_warnings_severity ON dashboard_system_warnings(severity, date);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_cashflow_date_period ON dashboard_cashflow_analytics(date, period);
CREATE INDEX IF NOT EXISTS idx_dso_date ON dashboard_dso_metrics(date);
CREATE INDEX IF NOT EXISTS idx_roi_dept_date ON dashboard_roi_by_department(date);
CREATE INDEX IF NOT EXISTS idx_oee_date_machine ON dashboard_oee_metrics(date, machine_id);
CREATE INDEX IF NOT EXISTS idx_throughput_date ON dashboard_throughput_metrics(date);
CREATE INDEX IF NOT EXISTS idx_scrap_date ON dashboard_scrap_metrics(date);
CREATE INDEX IF NOT EXISTS idx_clv_date ON dashboard_clv_metrics(date);
CREATE INDEX IF NOT EXISTS idx_churn_date ON dashboard_churn_metrics(date);
CREATE INDEX IF NOT EXISTS idx_nps_date ON dashboard_nps_csat_metrics(date);
CREATE INDEX IF NOT EXISTS idx_response_date_channel ON dashboard_response_time_metrics(date, channel);
CREATE INDEX IF NOT EXISTS idx_conversion_date_channel ON dashboard_conversion_metrics(date, channel);

-- Widget Config
CREATE INDEX IF NOT EXISTS idx_widget_config_user ON dashboard_widget_config(user_id);
CREATE INDEX IF NOT EXISTS idx_user_layouts_user ON dashboard_user_layouts(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON dashboard_favorites(user_id);
