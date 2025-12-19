-- SPDX-License-Identifier: MIT
-- Migration: Seed Dashboard Data
-- Description: Populates initial dashboard KPIs, tasks, and notifications

-- Insert sample KPIs
IF NOT EXISTS (SELECT 1 FROM dashboard_kpis WHERE id = 'kpi-revenue-1')
  INSERT INTO dashboard_kpis (id, name, value, change_percent, category, period, date) VALUES ('kpi-revenue-1', 'Umsatz', '€ 1.2M', 12.5, 'revenue', 'month', GETDATE());
IF NOT EXISTS (SELECT 1 FROM dashboard_kpis WHERE id = 'kpi-orders-1')
  INSERT INTO dashboard_kpis (id, name, value, change_percent, category, period, date) VALUES ('kpi-orders-1', 'Bestellungen', '156', 8.3, 'orders', 'month', GETDATE());
IF NOT EXISTS (SELECT 1 FROM dashboard_kpis WHERE id = 'kpi-production-1')
  INSERT INTO dashboard_kpis (id, name, value, change_percent, category, period, date) VALUES ('kpi-production-1', 'Produktionsauslastung', '89%', -2.1, 'production', 'month', GETDATE());
IF NOT EXISTS (SELECT 1 FROM dashboard_kpis WHERE id = 'kpi-liquidity-1')
  INSERT INTO dashboard_kpis (id, name, value, change_percent, category, period, date) VALUES ('kpi-liquidity-1', 'Liquidität', '€ 450K', 15.7, 'liquidity', 'month', GETDATE());

-- Insert sample tasks
IF NOT EXISTS (SELECT 1 FROM dashboard_tasks WHERE id = 'task-1')
  INSERT INTO dashboard_tasks (id, title, priority, status, due_date, description) VALUES ('task-1', 'Angebot für Kunde ABC erstellen', 'high', 'pending', DATEADD(HOUR, 4, GETDATE()), 'Detailliertes Angebot mit Preiskalkulation');
IF NOT EXISTS (SELECT 1 FROM dashboard_tasks WHERE id = 'task-2')
  INSERT INTO dashboard_tasks (id, title, priority, status, due_date, description) VALUES ('task-2', 'Monatsabschluss vorbereiten', 'medium', 'pending', DATEADD(DAY, 1, GETDATE()), 'Finanzberichte und Übersichten erstellen');
IF NOT EXISTS (SELECT 1 FROM dashboard_tasks WHERE id = 'task-3')
  INSERT INTO dashboard_tasks (id, title, priority, status, due_date, description) VALUES ('task-3', 'Lieferantenbewertung durchführen', 'low', 'pending', DATEADD(DAY, 3, GETDATE()), 'Bewertung der Top 10 Lieferanten');
IF NOT EXISTS (SELECT 1 FROM dashboard_tasks WHERE id = 'task-4')
  INSERT INTO dashboard_tasks (id, title, priority, status, due_date, description) VALUES ('task-4', 'Team-Meeting planen', 'medium', 'in_progress', DATEADD(DAY, 2, GETDATE()), 'Quartalsbesprechung organisieren');
IF NOT EXISTS (SELECT 1 FROM dashboard_tasks WHERE id = 'task-5')
  INSERT INTO dashboard_tasks (id, title, priority, status, due_date, description) VALUES ('task-5', 'Systemupdate durchführen', 'high', 'pending', DATEADD(DAY, 1, GETDATE()), 'Backend und Frontend auf neue Version aktualisieren');

-- Insert sample notifications
IF NOT EXISTS (SELECT 1 FROM dashboard_notifications WHERE id = 'notif-1')
  INSERT INTO dashboard_notifications (id, title, message, type, [read], created_at) VALUES ('notif-1', 'Neue Bestellung', 'Auftrag #1234 wurde erstellt', 'success', 0, DATEADD(MINUTE, -5, GETDATE()));
IF NOT EXISTS (SELECT 1 FROM dashboard_notifications WHERE id = 'notif-2')
  INSERT INTO dashboard_notifications (id, title, message, type, [read], created_at) VALUES ('notif-2', 'Lagerbestand niedrig', 'Artikel XYZ unter Mindestbestand', 'warning', 0, DATEADD(MINUTE, -15, GETDATE()));
IF NOT EXISTS (SELECT 1 FROM dashboard_notifications WHERE id = 'notif-3')
  INSERT INTO dashboard_notifications (id, title, message, type, [read], created_at) VALUES ('notif-3', 'Zahlung eingegangen', 'Rechnung #5678 wurde bezahlt', 'info', 0, DATEADD(HOUR, -1, GETDATE()));
IF NOT EXISTS (SELECT 1 FROM dashboard_notifications WHERE id = 'notif-4')
  INSERT INTO dashboard_notifications (id, title, message, type, [read], created_at) VALUES ('notif-4', 'System-Wartung geplant', 'Wartungsfenster morgen 02:00-04:00 Uhr', 'info', 0, DATEADD(HOUR, -2, GETDATE()));
IF NOT EXISTS (SELECT 1 FROM dashboard_notifications WHERE id = 'notif-5')
  INSERT INTO dashboard_notifications (id, title, message, type, [read], created_at) VALUES ('notif-5', 'Produktionsauftrag abgeschlossen', 'Auftrag #9876 wurde fertiggestellt', 'success', 0, DATEADD(HOUR, -3, GETDATE()));
