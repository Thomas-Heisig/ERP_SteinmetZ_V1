-- SPDX-License-Identifier: MIT
-- Migration: Seed Dashboard Data
-- Description: Populates initial dashboard KPIs, tasks, and notifications

-- Insert sample KPIs
INSERT OR IGNORE INTO dashboard_kpis (id, name, value, change_percent, category, period, date) VALUES
  ('kpi-revenue-1', 'Umsatz', '€ 1.2M', 12.5, 'revenue', 'month', date('now')),
  ('kpi-orders-1', 'Bestellungen', '156', 8.3, 'orders', 'month', date('now')),
  ('kpi-production-1', 'Produktionsauslastung', '89%', -2.1, 'production', 'month', date('now')),
  ('kpi-liquidity-1', 'Liquidität', '€ 450K', 15.7, 'liquidity', 'month', date('now'));

-- Insert sample tasks
INSERT OR IGNORE INTO dashboard_tasks (id, title, priority, status, due_date, description) VALUES
  ('task-1', 'Angebot für Kunde ABC erstellen', 'high', 'pending', datetime('now', '+4 hours'), 'Detailliertes Angebot mit Preiskalkulation'),
  ('task-2', 'Monatsabschluss vorbereiten', 'medium', 'pending', datetime('now', '+1 day'), 'Finanzberichte und Übersichten erstellen'),
  ('task-3', 'Lieferantenbewertung durchführen', 'low', 'pending', datetime('now', '+3 days'), 'Bewertung der Top 10 Lieferanten'),
  ('task-4', 'Team-Meeting planen', 'medium', 'in_progress', datetime('now', '+2 days'), 'Quartalsbesprechung organisieren'),
  ('task-5', 'Systemupdate durchführen', 'high', 'pending', datetime('now', '+1 day'), 'Backend und Frontend auf neue Version aktualisieren');

-- Insert sample notifications
INSERT OR IGNORE INTO dashboard_notifications (id, title, message, type, read, created_at) VALUES
  ('notif-1', 'Neue Bestellung', 'Auftrag #1234 wurde erstellt', 'success', 0, datetime('now', '-5 minutes')),
  ('notif-2', 'Lagerbestand niedrig', 'Artikel XYZ unter Mindestbestand', 'warning', 0, datetime('now', '-15 minutes')),
  ('notif-3', 'Zahlung eingegangen', 'Rechnung #5678 wurde bezahlt', 'info', 0, datetime('now', '-1 hour')),
  ('notif-4', 'System-Wartung geplant', 'Wartungsfenster morgen 02:00-04:00 Uhr', 'info', 0, datetime('now', '-2 hours')),
  ('notif-5', 'Produktionsauftrag abgeschlossen', 'Auftrag #9876 wurde fertiggestellt', 'success', 0, datetime('now', '-3 hours'));
