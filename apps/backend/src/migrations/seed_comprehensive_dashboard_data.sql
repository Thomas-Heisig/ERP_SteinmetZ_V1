-- SPDX-License-Identifier: MIT
-- Migration: Seed Comprehensive Dashboard Data
-- Description: Populates sample data for all dashboard tables

-- =============================================================================
-- Revenue Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_revenue_metrics (id, date, daily_revenue, monthly_revenue, yearly_revenue, previous_month_revenue, previous_year_revenue, budget_target, forecast_amount, forecast_confidence, average_order_value, growth_rate)
VALUES 
  ('rev-metric-1', date('now'), 45280.50, 1245600.00, 12456000.00, 1089450.00, 10890450.00, 13000000.00, 13200000.00, 0.85, 8450.00, 0.144),
  ('rev-metric-2', date('now', '-1 day'), 42130.00, 1200320.00, 12410720.00, 1089450.00, 10890450.00, 13000000.00, 13200000.00, 0.85, 8200.00, 0.140);

-- =============================================================================
-- Top Customers
-- =============================================================================

INSERT OR IGNORE INTO dashboard_top_customers (id, customer_id, customer_name, revenue, rank, period, date)
VALUES 
  ('top-cust-1', 'cust-001', 'Schmidt GmbH', 248500.00, 1, 'month', date('now')),
  ('top-cust-2', 'cust-002', 'Müller AG', 189200.00, 2, 'month', date('now')),
  ('top-cust-3', 'cust-003', 'Weber Industries', 156800.00, 3, 'month', date('now')),
  ('top-cust-4', 'cust-004', 'Fischer Group', 145300.00, 4, 'month', date('now')),
  ('top-cust-5', 'cust-005', 'Schneider Systems', 132100.00, 5, 'month', date('now')),
  ('top-cust-6', 'cust-006', 'Becker Technologies', 125600.00, 6, 'month', date('now')),
  ('top-cust-7', 'cust-007', 'Koch Manufacturing', 118900.00, 7, 'month', date('now')),
  ('top-cust-8', 'cust-008', 'Hoffmann Solutions', 112400.00, 8, 'month', date('now')),
  ('top-cust-9', 'cust-009', 'Bauer Enterprises', 105800.00, 9, 'month', date('now')),
  ('top-cust-10', 'cust-010', 'Richter Industries', 98500.00, 10, 'month', date('now'));

-- =============================================================================
-- Top Products
-- =============================================================================

INSERT OR IGNORE INTO dashboard_top_products (id, product_id, product_name, revenue, rank, period, date)
VALUES 
  ('top-prod-1', 'prod-001', 'Premium Steinplatte A1', 356200.00, 1, 'month', date('now')),
  ('top-prod-2', 'prod-002', 'Marmor Classic B2', 289500.00, 2, 'month', date('now')),
  ('top-prod-3', 'prod-003', 'Granit Professional C3', 245800.00, 3, 'month', date('now')),
  ('top-prod-4', 'prod-004', 'Schiefer Deluxe D4', 198600.00, 4, 'month', date('now')),
  ('top-prod-5', 'prod-005', 'Kalkstein Standard E5', 176400.00, 5, 'month', date('now'));

-- =============================================================================
-- Regional Revenue
-- =============================================================================

INSERT OR IGNORE INTO dashboard_regional_revenue (id, region, revenue, percentage, date)
VALUES 
  ('reg-rev-1', 'Bayern', 445200.00, 35.7, date('now')),
  ('reg-rev-2', 'Baden-Württemberg', 348900.00, 28.0, date('now')),
  ('reg-rev-3', 'Nordrhein-Westfalen', 276500.00, 22.2, date('now')),
  ('reg-rev-4', 'Hessen', 124800.00, 10.0, date('now')),
  ('reg-rev-5', 'Sonstige', 50200.00, 4.1, date('now'));

-- =============================================================================
-- Margin Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_margin_metrics (id, date, gross_margin, net_margin, target_margin, benchmark_margin, period)
VALUES 
  ('margin-1', date('now'), 0.389, 0.185, 0.400, 0.350, 'month'),
  ('margin-2', date('now', '-1 month'), 0.375, 0.172, 0.400, 0.350, 'month');

-- =============================================================================
-- Margin by Product Group
-- =============================================================================

INSERT OR IGNORE INTO dashboard_margin_by_product (id, product_group, margin, date)
VALUES 
  ('marg-prod-1', 'Premium Steinplatten', 0.425, date('now')),
  ('marg-prod-2', 'Marmor-Produkte', 0.390, date('now')),
  ('marg-prod-3', 'Granit-Produkte', 0.365, date('now')),
  ('marg-prod-4', 'Standard-Produkte', 0.285, date('now'));

-- =============================================================================
-- Liquidity Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_liquidity_metrics (id, date, current_balance, daily_cashflow, forecast_7days, forecast_30days, payables_due, receivables_expected, credit_line_available, short_term_liabilities, warning_level)
VALUES 
  ('liq-1', date('now'), 456780.00, 12450.00, 543210.00, 689500.00, 145600.00, 234500.00, 500000.00, 198400.00, 'green');

-- =============================================================================
-- Order Intake
-- =============================================================================

INSERT OR IGNORE INTO dashboard_order_intake (id, date, daily_intake, monthly_intake, target_intake, average_order_size, deviation_percentage)
VALUES 
  ('ord-int-1', date('now'), 78450.00, 1456800.00, 1400000.00, 12450.00, 0.041);

-- =============================================================================
-- Order Intake by Sales Person
-- =============================================================================

INSERT OR IGNORE INTO dashboard_order_intake_by_sales (id, sales_person, intake, date)
VALUES 
  ('ord-sales-1', 'Anna Schmidt', 345600.00, date('now')),
  ('ord-sales-2', 'Michael Müller', 298700.00, date('now')),
  ('ord-sales-3', 'Sarah Weber', 267400.00, date('now')),
  ('ord-sales-4', 'Thomas Fischer', 245100.00, date('now')),
  ('ord-sales-5', 'Julia Schneider', 200000.00, date('now'));

-- =============================================================================
-- Productivity Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_productivity_metrics (id, date, revenue_per_employee, output_per_machine_hour, average_throughput_time, oee, capacity_utilization, target_value)
VALUES 
  ('prod-1', date('now'), 156780.00, 245.50, 8.5, 0.892, 0.875, 0.900);

-- =============================================================================
-- Pipeline Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_pipeline_metrics (id, date, stage, count, value, conversion_rate, average_cycle_time, forecast_accuracy)
VALUES 
  ('pipe-1', date('now'), 'Lead', 45, 567800.00, 0.25, 5, 0.78),
  ('pipe-2', date('now'), 'Qualified', 23, 456200.00, 0.45, 12, 0.82),
  ('pipe-3', date('now'), 'Proposal', 12, 389400.00, 0.68, 18, 0.85),
  ('pipe-4', date('now'), 'Negotiation', 8, 298600.00, 0.85, 25, 0.88),
  ('pipe-5', date('now'), 'Closed Won', 5, 234500.00, 1.00, 30, 0.92);

-- =============================================================================
-- Procurement Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_procurement_metrics (id, date, open_orders, pending_receipts, open_invoices, average_processing_time, payables_due, dpo)
VALUES 
  ('proc-1', date('now'), 34, 12, 28, 5, 145600.00, 45.5);

-- =============================================================================
-- Supplier Performance
-- =============================================================================

INSERT OR IGNORE INTO dashboard_supplier_performance (id, supplier_id, supplier_name, otif_rate, complaint_rate, price_variance, date)
VALUES 
  ('supp-1', 'sup-001', 'Steinbruch Nord GmbH', 0.95, 0.02, -0.01, date('now')),
  ('supp-2', 'sup-002', 'Marmor Import AG', 0.89, 0.05, 0.03, date('now')),
  ('supp-3', 'sup-003', 'Granit Handel GmbH', 0.92, 0.03, 0.00, date('now'));

-- =============================================================================
-- Production Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_production_metrics (id, date, current_utilization, machine_utilization, personnel_utilization, target_utilization, shift, capacity_reserve)
VALUES 
  ('prod-util-1', date('now'), 0.875, 0.892, 0.858, 0.850, 'Tag', 0.125);

-- =============================================================================
-- Production Bottlenecks
-- =============================================================================

INSERT OR IGNORE INTO dashboard_production_bottlenecks (id, resource_id, resource_name, type, severity, impact_description, date)
VALUES 
  ('bottleneck-1', 'mach-005', 'Schneidemaschine 5', 'machine', 'medium', 'Verzögerung bei großen Aufträgen um 2 Stunden', date('now')),
  ('bottleneck-2', 'mat-stone-a1', 'Rohstein Typ A1', 'material', 'high', 'Nur noch 3 Tage Vorrat verfügbar', date('now'));

-- =============================================================================
-- SLA Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_sla_metrics (id, date, sla_fulfillment, average_response_time, average_resolution_time, first_contact_resolution, target_sla, ticket_backlog)
VALUES 
  ('sla-1', date('now'), 0.92, 45, 180, 0.67, 0.95, 8);

-- =============================================================================
-- SLA Violations
-- =============================================================================

INSERT OR IGNORE INTO dashboard_sla_violations (id, ticket_id, severity, violation_time, customer_id, date)
VALUES 
  ('sla-viol-1', 'ticket-1234', 'high', 120, 'cust-001', date('now')),
  ('sla-viol-2', 'ticket-1235', 'medium', 60, 'cust-008', date('now'));

-- =============================================================================
-- Project Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_project_metrics (id, project_id, project_name, status, progress_percentage, budget_used, budget_total, schedule_variance, risk_level, date)
VALUES 
  ('proj-1', 'proj-001', 'Erweiterung Produktionshalle', 'active', 0.65, 458000.00, 650000.00, -0.05, 'low', date('now')),
  ('proj-2', 'proj-002', 'ERP System Upgrade', 'active', 0.42, 156000.00, 250000.00, 0.08, 'medium', date('now')),
  ('proj-3', 'proj-003', 'Neue Steinbruch-Erschließung', 'planning', 0.15, 89000.00, 1200000.00, 0.00, 'high', date('now'));

-- =============================================================================
-- Delivery Delays
-- =============================================================================

INSERT OR IGNORE INTO dashboard_delivery_delays (id, order_id, customer_id, customer_name, priority, delay_days, estimated_revenue_loss, supplier_id, root_cause, escalation_status, date)
VALUES 
  ('delay-1', 'ord-1234', 'cust-001', 'Schmidt GmbH', 'high', 5, 15600.00, 'sup-002', 'Rohstoff-Lieferverzug', 'escalated', date('now')),
  ('delay-2', 'ord-1245', 'cust-004', 'Fischer Group', 'medium', 2, 4500.00, NULL, 'Maschinenstillstand', 'monitoring', date('now'));

-- =============================================================================
-- Budget Overruns
-- =============================================================================

INSERT OR IGNORE INTO dashboard_budget_overruns (id, department, budget_allocated, budget_spent, overrun_amount, overrun_percentage, priority, manager, approval_status, date)
VALUES 
  ('budget-1', 'Produktion', 450000.00, 478900.00, 28900.00, 0.064, 'medium', 'Hans Meier', 'pending', date('now')),
  ('budget-2', 'Marketing', 120000.00, 134500.00, 14500.00, 0.121, 'high', 'Lisa Bauer', 'approved', date('now'));

-- =============================================================================
-- Quality Issues
-- =============================================================================

INSERT OR IGNORE INTO dashboard_quality_issues (id, product_id, product_name, issue_type, severity, affected_quantity, estimated_cost, root_cause, corrective_action, date)
VALUES 
  ('qual-1', 'prod-003', 'Granit Professional C3', 'Oberflächenfehler', 'medium', 25, 8900.00, 'Werkzeugverschleiß', 'Werkzeug ausgetauscht, zusätzliche Qualitätsprüfung', date('now')),
  ('qual-2', 'prod-001', 'Premium Steinplatte A1', 'Maßabweichung', 'low', 8, 2400.00, 'Kalibrierung', 'Maschine neu kalibriert', date('now'));

-- =============================================================================
-- Customer Complaints
-- =============================================================================

INSERT OR IGNORE INTO dashboard_customer_complaints (id, complaint_id, customer_id, customer_name, customer_clv, category, priority, status, estimated_value_loss, resolution_deadline, date)
VALUES 
  ('compl-1', 'comp-001', 'cust-001', 'Schmidt GmbH', 456000.00, 'Lieferverzug', 'high', 'in_progress', 15600.00, date('now', '+2 days'), date('now')),
  ('compl-2', 'comp-002', 'cust-006', 'Becker Technologies', 298000.00, 'Produktqualität', 'medium', 'open', 8900.00, date('now', '+5 days'), date('now'));

-- =============================================================================
-- System Warnings
-- =============================================================================

INSERT OR IGNORE INTO dashboard_system_warnings (id, warning_type, severity, component, message, response_time, memory_usage, api_status, date)
VALUES 
  ('sys-warn-1', 'performance', 'warning', 'API Server', 'Response time elevated', 850, 78.5, 'degraded', date('now')),
  ('sys-warn-2', 'resource', 'info', 'Database', 'Cache hit ratio below optimal', 120, 65.2, 'operational', date('now'));

-- =============================================================================
-- Cashflow Analytics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_cashflow_analytics (id, date, period, operating_cashflow, investing_cashflow, financing_cashflow, total_cashflow, forecast)
VALUES 
  ('cash-1', date('now'), 'daily', 12450.00, -5600.00, 0.00, 6850.00, 7200.00),
  ('cash-2', date('now', '-1 day'), 'daily', 15680.00, -2300.00, 0.00, 13380.00, 12000.00);

-- =============================================================================
-- DSO Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_dso_metrics (id, date, dso_current, dso_benchmark, outstanding_aging, critical_debtors)
VALUES 
  ('dso-1', date('now'), 38.5, 35.0, '0-30: 65%, 31-60: 25%, 61-90: 8%, 90+: 2%', 3);

-- =============================================================================
-- ROI by Department
-- =============================================================================

INSERT OR IGNORE INTO dashboard_roi_by_department (id, department, roi, investment, return_amount, date)
VALUES 
  ('roi-1', 'Vertrieb', 3.45, 120000.00, 414000.00, date('now')),
  ('roi-2', 'Marketing', 2.15, 85000.00, 182750.00, date('now')),
  ('roi-3', 'Produktion', 4.20, 350000.00, 1470000.00, date('now')),
  ('roi-4', 'F&E', 1.85, 145000.00, 268250.00, date('now'));

-- =============================================================================
-- OEE Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_oee_metrics (id, date, machine_id, availability, performance, quality, oee, target_oee, shift)
VALUES 
  ('oee-1', date('now'), 'mach-001', 0.95, 0.92, 0.98, 0.857, 0.850, 'Tag'),
  ('oee-2', date('now'), 'mach-002', 0.89, 0.95, 0.96, 0.811, 0.850, 'Tag'),
  ('oee-3', date('now'), 'mach-003', 0.92, 0.88, 0.99, 0.801, 0.850, 'Tag');

-- =============================================================================
-- Throughput Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_throughput_metrics (id, date, product_id, current_throughput_time, target_throughput_time, bottleneck_step)
VALUES 
  ('through-1', date('now'), 'prod-001', 510, 480, 'Polieren'),
  ('through-2', date('now'), 'prod-002', 620, 600, 'Zuschnitt');

-- =============================================================================
-- Scrap Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_scrap_metrics (id, date, product_id, machine_id, scrap_rate, target_rate, scrap_cost, root_cause)
VALUES 
  ('scrap-1', date('now'), 'prod-001', 'mach-001', 0.035, 0.020, 1890.00, 'Materialschwankung'),
  ('scrap-2', date('now'), 'prod-003', 'mach-003', 0.022, 0.020, 890.00, 'Normal');

-- =============================================================================
-- CLV Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_clv_metrics (id, date, customer_segment, average_clv, acquisition_cost, risk_customers)
VALUES 
  ('clv-1', date('now'), 'Premium', 456000.00, 12500.00, 2),
  ('clv-2', date('now'), 'Standard', 189000.00, 5600.00, 5),
  ('clv-3', date('now'), 'Basic', 78000.00, 2300.00, 8);

-- =============================================================================
-- Churn Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_churn_metrics (id, date, period, churn_rate, churn_count, benchmark_rate, risk_customers)
VALUES 
  ('churn-1', date('now'), 'month', 0.028, 3, 0.035, 12);

-- =============================================================================
-- NPS/CSAT Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_nps_csat_metrics (id, date, nps_score, csat_score, target_nps, target_csat, touchpoint, region)
VALUES 
  ('nps-1', date('now'), 42, 4.3, 50, 4.5, 'Lieferung', 'Bayern'),
  ('nps-2', date('now'), 38, 4.1, 50, 4.5, 'Support', 'Bayern'),
  ('nps-3', date('now'), 45, 4.4, 50, 4.5, 'Lieferung', 'Baden-Württemberg');

-- =============================================================================
-- Response Time Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_response_time_metrics (id, date, channel, average_response_time, sla_threshold, sla_violations)
VALUES 
  ('resp-1', date('now'), 'Email', 180, 240, 2),
  ('resp-2', date('now'), 'Telefon', 35, 60, 0),
  ('resp-3', date('now'), 'Chat', 45, 90, 1);

-- =============================================================================
-- Conversion Metrics
-- =============================================================================

INSERT OR IGNORE INTO dashboard_conversion_metrics (id, date, channel, region, conversion_rate, target_rate, conversions, visitors)
VALUES 
  ('conv-1', date('now'), 'Website', 'Bayern', 0.045, 0.050, 89, 1978),
  ('conv-2', date('now'), 'Email-Kampagne', 'Bayern', 0.068, 0.060, 34, 500),
  ('conv-3', date('now'), 'Direktansprache', 'Baden-Württemberg', 0.125, 0.100, 25, 200);
