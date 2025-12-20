-- SPDX-License-Identifier: MIT
-- Migration: Seed Dashboard Data
-- Description: Populates initial dashboard KPIs, tasks, and notifications

-- Insert sample KPIs

INSERT OR IGNORE INTO dashboard_kpis (id, name, value, change_percent, category, period, date) VALUES ('kpi-revenue-1', 'Umsatz', '€ 1.2M', 12.5, 'revenue', 'month', CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO dashboard_kpis (id, name, value, change_percent, category, period, date) VALUES ('kpi-orders-1', 'Bestellungen', '156', 8.3, 'orders', 'month', CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO dashboard_kpis (id, name, value, change_percent, category, period, date) VALUES ('kpi-production-1', 'Produktionsauslastung', '89%', -2.1, 'production', 'month', CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO dashboard_kpis (id, name, value, change_percent, category, period, date) VALUES ('kpi-liquidity-1', 'Liquidität', '€ 450K', 15.7, 'liquidity', 'month', CURRENT_TIMESTAMP);

-- Insert sample tasks

INSERT OR IGNORE INTO dashboard_tasks (id, title, priority, status, due_date, description) VALUES ('task-1', 'Angebot für Kunde ABC erstellen', 'high', 'pending', datetime('now', '+4 hours'), 'Detailliertes Angebot mit Preiskalkulation');

INSERT OR IGNORE INTO dashboard_tasks (id, title, priority, status, due_date, description) VALUES ('task-2', 'Monatsabschluss vorbereiten', 'medium', 'pending', datetime('now', '+1 day'), 'Finanzberichte und Übersichten erstellen');

INSERT OR IGNORE INTO dashboard_tasks (id, title, priority, status, due_date, description) VALUES ('task-3', 'Lieferantenbewertung durchführen', 'low', 'pending', datetime('now', '+3 days'), 'Bewertung der Top 10 Lieferanten');

INSERT OR IGNORE INTO dashboard_tasks (id, title, priority, status, due_date, description) VALUES ('task-4', 'Team-Meeting planen', 'medium', 'in_progress', datetime('now', '+2 days'), 'Quartalsbesprechung organisieren');

INSERT OR IGNORE INTO dashboard_tasks (id, title, priority, status, due_date, description) VALUES ('task-5', 'Systemupdate durchführen', 'high', 'pending', datetime('now', '+1 day'), 'Backend und Frontend auf neue Version aktualisieren');

-- Insert sample notifications

INSERT OR IGNORE INTO dashboard_notifications (id, title, message, type, [read], created_at) VALUES ('notif-1', 'Neue Bestellung', 'Auftrag #1234 wurde erstellt', 'success', 0, datetime('now', '-5 minutes'));

INSERT OR IGNORE INTO dashboard_notifications (id, title, message, type, [read], created_at) VALUES ('notif-2', 'Lagerbestand niedrig', 'Artikel XYZ unter Mindestbestand', 'warning', 0, datetime('now', '-15 minutes'));

INSERT OR IGNORE INTO dashboard_notifications (id, title, message, type, [read], created_at) VALUES ('notif-3', 'Zahlung eingegangen', 'Rechnung #5678 wurde bezahlt', 'info', 0, datetime('now', '-1 hour'));

INSERT OR IGNORE INTO dashboard_notifications (id, title, message, type, [read], created_at) VALUES ('notif-4', 'System-Wartung geplant', 'Wartungsfenster morgen 02:00-04:00 Uhr', 'info', 0, datetime('now', '-2 hours'));

INSERT OR IGNORE INTO dashboard_notifications (id, title, message, type, [read], created_at) VALUES ('notif-5', 'Produktionsauftrag abgeschlossen', 'Auftrag #9876 wurde fertiggestellt', 'success', 0, datetime('now', '-3 hours'));

