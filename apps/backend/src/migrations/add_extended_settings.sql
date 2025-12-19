-- SPDX-License-Identifier: MIT
-- Migration: Add Extended Settings
-- Adds all new ERP-wide settings to the system_settings table
-- Safe to run multiple times (uses INSERT OR IGNORE)

-- Disable foreign key checks for this migration
PRAGMA foreign_keys = OFF;

-- System Extended Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('system_company_name', '"SteinmetZ GmbH"', 'system', 'string', 0, 'Offizieller Firmenname'),
  ('system_logo_url', 'null', 'system', 'string', 0, 'URL zum Firmenlogo'),
  ('system_timezone', '"Europe/Berlin"', 'system', 'select', 0, 'Standard-Zeitzone'),
  ('system_country', '"DE"', 'system', 'select', 0, 'Hauptstandort des Unternehmens'),
  ('system_currency', '"EUR"', 'system', 'select', 0, 'Standard-Währung'),
  ('system_language_default', '"de"', 'system', 'select', 0, 'Standard-Systemsprache'),
  ('maintenance_message', '"System wird gewartet"', 'system', 'string', 0, 'Wartungsnachricht'),
  ('log_retention_days', '90', 'system', 'number', 0, 'Log-Aufbewahrung in Tagen');

-- AI Extended Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('ai_fallback_provider', 'null', 'ai', 'select', 0, 'Fallback KI-Provider'),
  ('ai_cost_limit_monthly', '1000', 'ai', 'number', 0, 'Monatliches Kosten-Limit (€)'),
  ('openai_top_p', '1.0', 'ai', 'number', 0, 'OpenAI Top P Parameter'),
  ('openai_frequency_penalty', '0.0', 'ai', 'number', 0, 'OpenAI Frequency Penalty'),
  ('openai_presence_penalty', '0.0', 'ai', 'number', 0, 'OpenAI Presence Penalty'),
  ('anthropic_top_p', '1.0', 'ai', 'number', 0, 'Anthropic Top P Parameter'),
  ('anthropic_top_k', '40', 'ai', 'number', 0, 'Anthropic Top K Parameter'),
  ('ollama_num_ctx', '2048', 'ai', 'number', 0, 'Ollama Context Length'),
  ('azure_openai_endpoint', 'null', 'ai', 'string', 1, 'Azure OpenAI Endpoint'),
  ('azure_openai_api_key', 'null', 'ai', 'string', 1, 'Azure OpenAI API Key'),
  ('azure_openai_deployment', 'null', 'ai', 'string', 0, 'Azure OpenAI Deployment Name'),
  ('azure_openai_api_version', '"2024-02-01"', 'ai', 'string', 0, 'Azure OpenAI API Version'),
  ('gemini_api_key', 'null', 'ai', 'string', 1, 'Google Gemini API Key'),
  ('gemini_model', '"gemini-pro"', 'ai', 'string', 0, 'Google Gemini Modell'),
  ('gemini_temperature', '0.7', 'ai', 'number', 0, 'Gemini Temperatur'),
  ('gemini_max_tokens', '4096', 'ai', 'number', 0, 'Gemini Max Tokens'),
  ('local_gpu_enabled', 'false', 'ai', 'boolean', 0, 'GPU für lokale Modelle aktiviert'),
  ('local_gpu_layers', '0', 'ai', 'number', 0, 'Anzahl GPU Layers');

-- Cache & Redis Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('redis_enabled', 'false', 'performance', 'boolean', 0, 'Redis Caching aktiviert'),
  ('redis_host', '"localhost"', 'performance', 'string', 0, 'Redis Host'),
  ('redis_port', '6379', 'performance', 'number', 0, 'Redis Port'),
  ('redis_password', 'null', 'performance', 'string', 1, 'Redis Passwort'),
  ('redis_db', '0', 'performance', 'number', 0, 'Redis Datenbank-Index');

-- Performance Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('max_concurrent_connections', '100', 'performance', 'number', 0, 'Max. gleichzeitige Verbindungen'),
  ('compression_enabled', 'true', 'performance', 'boolean', 0, 'Gzip Komprimierung'),
  ('lazy_loading_enabled', 'true', 'performance', 'boolean', 0, 'Lazy Loading aktiviert');

-- Database Extended Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('db_backup_location', 'null', 'database', 'string', 0, 'Backup-Speicherort'),
  ('db_auto_vacuum_enabled', 'true', 'database', 'boolean', 0, 'Auto-Vacuum aktiviert'),
  ('db_query_timeout_seconds', '30', 'database', 'number', 0, 'Query Timeout (Sekunden)'),
  ('db_pool_size', '10', 'database', 'number', 0, 'Connection Pool Größe');

-- Security Extended Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('lockout_duration_minutes', '30', 'security', 'number', 0, 'Sperrdauer nach Fehlversuchen'),
  ('password_require_uppercase', 'true', 'security', 'boolean', 0, 'Großbuchstaben erforderlich'),
  ('password_require_lowercase', 'true', 'security', 'boolean', 0, 'Kleinbuchstaben erforderlich'),
  ('password_require_numbers', 'true', 'security', 'boolean', 0, 'Zahlen erforderlich'),
  ('password_require_special', 'false', 'security', 'boolean', 0, 'Sonderzeichen erforderlich'),
  ('password_expiry_days', '90', 'security', 'number', 0, 'Passwort-Ablauf (Tage)'),
  ('allowed_ip_addresses', 'null', 'security', 'string', 0, 'Erlaubte IP-Adressen'),
  ('blocked_ip_addresses', 'null', 'security', 'string', 0, 'Gesperrte IP-Adressen'),
  ('jwt_secret', 'null', 'security', 'string', 1, 'JWT Secret Key'),
  ('jwt_expiry_hours', '24', 'security', 'number', 0, 'JWT Ablaufzeit (Stunden)'),
  ('refresh_token_expiry_days', '30', 'security', 'number', 0, 'Refresh Token Ablauf (Tage)'),
  ('cors_allowed_origins', 'null', 'security', 'string', 0, 'CORS Allowed Origins'),
  ('csrf_protection_enabled', 'true', 'security', 'boolean', 0, 'CSRF Protection');

-- UI Extended Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('number_format', '"de-DE"', 'ui', 'string', 0, 'Zahlenformat'),
  ('currency_symbol_position', '"after"', 'ui', 'select', 0, 'Währungssymbol Position'),
  ('decimal_separator', '","', 'ui', 'select', 0, 'Dezimaltrennzeichen'),
  ('thousand_separator', '"."', 'ui', 'select', 0, 'Tausendertrennzeichen'),
  ('show_tooltips', 'true', 'ui', 'boolean', 0, 'Tooltips anzeigen'),
  ('enable_animations', 'true', 'ui', 'boolean', 0, 'Animationen aktivieren'),
  ('compact_view', 'false', 'ui', 'boolean', 0, 'Kompakte Ansicht'),
  ('sidebar_collapsed', 'false', 'ui', 'boolean', 0, 'Sidebar eingeklappt'),
  ('show_breadcrumbs', 'true', 'ui', 'boolean', 0, 'Breadcrumbs anzeigen');

-- Feature Flags Extended
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('feature_export_excel', 'true', 'system', 'boolean', 0, 'Excel Export'),
  ('feature_export_pdf', 'true', 'system', 'boolean', 0, 'PDF Export'),
  ('feature_import_csv', 'true', 'system', 'boolean', 0, 'CSV Import'),
  ('feature_document_versioning', 'true', 'system', 'boolean', 0, 'Dokumentenversionierung'),
  ('feature_audit_log', 'true', 'system', 'boolean', 0, 'Audit Log'),
  ('feature_notifications', 'true', 'system', 'boolean', 0, 'Benachrichtigungen'),
  ('feature_mobile_app', 'false', 'system', 'boolean', 0, 'Mobile App'),
  ('feature_api_access', 'true', 'system', 'boolean', 0, 'API Zugriff');

-- Email Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('email_provider', '"smtp"', 'email', 'select', 0, 'Email Provider'),
  ('email_smtp_secure', 'true', 'email', 'boolean', 0, 'SMTP Secure (TLS)'),
  ('email_smtp_user', 'null', 'email', 'string', 0, 'SMTP Benutzername'),
  ('email_smtp_password', 'null', 'email', 'string', 1, 'SMTP Passwort'),
  ('email_from_name', 'null', 'email', 'string', 0, 'Absender Name'),
  ('email_reply_to', 'null', 'email', 'string', 0, 'Reply-To Adresse'),
  ('email_bcc_admin', 'false', 'email', 'boolean', 0, 'BCC an Admin'),
  ('email_queue_enabled', 'true', 'email', 'boolean', 0, 'Email Queue'),
  ('email_retry_attempts', '3', 'email', 'number', 0, 'Wiederholungsversuche');

-- Notification Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('notifications_enabled', 'true', 'notifications', 'boolean', 0, 'Benachrichtigungen aktiviert'),
  ('notifications_email', 'true', 'notifications', 'boolean', 0, 'Email-Benachrichtigungen'),
  ('notifications_browser', 'true', 'notifications', 'boolean', 0, 'Browser-Benachrichtigungen'),
  ('notifications_sms', 'false', 'notifications', 'boolean', 0, 'SMS-Benachrichtigungen'),
  ('notifications_slack', 'false', 'notifications', 'boolean', 0, 'Slack-Benachrichtigungen'),
  ('notifications_teams', 'false', 'notifications', 'boolean', 0, 'Teams-Benachrichtigungen'),
  ('notifications_telegram', 'false', 'notifications', 'boolean', 0, 'Telegram-Benachrichtigungen'),
  ('notification_sound_enabled', 'true', 'notifications', 'boolean', 0, 'Sound aktiviert'),
  ('notification_digest_enabled', 'false', 'notifications', 'boolean', 0, 'Digest aktiviert'),
  ('notification_digest_frequency', '"daily"', 'notifications', 'select', 0, 'Digest Frequenz');

-- Webhook Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('webhook_timeout_seconds', '30', 'integration', 'number', 0, 'Webhook Timeout'),
  ('webhook_retry_attempts', '3', 'integration', 'number', 0, 'Webhook Wiederholungsversuche'),
  ('webhook_events', 'null', 'integration', 'json', 0, 'Webhook Events');

-- Finance Module Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('finance_enabled', 'true', 'finance', 'boolean', 0, 'Finance Modul aktiviert'),
  ('finance_fiscal_year_start', '"01-01"', 'finance', 'string', 0, 'Geschäftsjahrbeginn'),
  ('finance_default_tax_rate', '19.0', 'finance', 'number', 0, 'Standard Steuersatz (%)'),
  ('finance_auto_invoice_numbering', 'true', 'finance', 'boolean', 0, 'Auto Rechnungsnummern'),
  ('finance_invoice_prefix', '"INV-"', 'finance', 'string', 0, 'Rechnungsnummer-Präfix'),
  ('finance_invoice_number_length', '6', 'finance', 'number', 0, 'Rechnungsnummer Länge'),
  ('finance_payment_terms_days', '30', 'finance', 'number', 0, 'Zahlungsziel (Tage)'),
  ('finance_late_payment_fee_percentage', '5.0', 'finance', 'number', 0, 'Säumniszuschlag (%)'),
  ('finance_multiple_currencies', 'false', 'finance', 'boolean', 0, 'Mehrere Währungen'),
  ('finance_exchange_rate_api', 'null', 'finance', 'string', 0, 'Wechselkurs API'),
  ('finance_accounting_standard', '"HGB"', 'finance', 'select', 0, 'Rechnungslegungsstandard'),
  ('finance_cost_center_tracking', 'true', 'finance', 'boolean', 0, 'Kostenstellen-Tracking');

-- Inventory Module Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('inventory_enabled', 'true', 'inventory', 'boolean', 0, 'Lager-Modul aktiviert'),
  ('inventory_track_lots', 'true', 'inventory', 'boolean', 0, 'Chargen-Tracking'),
  ('inventory_track_serial_numbers', 'false', 'inventory', 'boolean', 0, 'Seriennummer-Tracking'),
  ('inventory_low_stock_threshold', '10', 'inventory', 'number', 0, 'Mindestbestand-Schwelle'),
  ('inventory_reorder_point_enabled', 'true', 'inventory', 'boolean', 0, 'Meldebestand aktiviert'),
  ('inventory_auto_reorder', 'false', 'inventory', 'boolean', 0, 'Auto-Bestellung'),
  ('inventory_barcode_format', '"EAN13"', 'inventory', 'select', 0, 'Barcode-Format'),
  ('inventory_location_tracking', 'true', 'inventory', 'boolean', 0, 'Lagerort-Tracking'),
  ('inventory_fifo_costing', 'true', 'inventory', 'boolean', 0, 'FIFO Kosten'),
  ('inventory_allow_negative_stock', 'false', 'inventory', 'boolean', 0, 'Negativbestand erlauben'),
  ('inventory_stock_valuation_method', '"FIFO"', 'inventory', 'select', 0, 'Bestandsbewertung');

-- HR Module Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('hr_enabled', 'true', 'hr', 'boolean', 0, 'HR-Modul aktiviert'),
  ('hr_timesheet_enabled', 'true', 'hr', 'boolean', 0, 'Zeiterfassung'),
  ('hr_attendance_tracking', 'true', 'hr', 'boolean', 0, 'Anwesenheitserfassung'),
  ('hr_leave_management', 'true', 'hr', 'boolean', 0, 'Urlaubsverwaltung'),
  ('hr_payroll_integration', 'false', 'hr', 'boolean', 0, 'Lohnabrechnung Integration'),
  ('hr_performance_reviews', 'true', 'hr', 'boolean', 0, 'Leistungsbeurteilungen'),
  ('hr_recruitment_module', 'false', 'hr', 'boolean', 0, 'Recruiting Modul'),
  ('hr_employee_self_service', 'true', 'hr', 'boolean', 0, 'Mitarbeiter Self-Service'),
  ('hr_working_hours_per_week', '40', 'hr', 'number', 0, 'Wochenstunden'),
  ('hr_overtime_calculation_method', '"multiplier"', 'hr', 'select', 0, 'Überstunden-Berechnung'),
  ('hr_overtime_multiplier', '1.5', 'hr', 'number', 0, 'Überstunden-Faktor');

-- CRM Module Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('crm_enabled', 'true', 'crm', 'boolean', 0, 'CRM-Modul aktiviert'),
  ('crm_lead_scoring', 'true', 'crm', 'boolean', 0, 'Lead Scoring'),
  ('crm_auto_assign_leads', 'false', 'crm', 'boolean', 0, 'Auto Lead-Zuweisung'),
  ('crm_sales_pipeline_stages', 'null', 'crm', 'json', 0, 'Sales Pipeline Stages'),
  ('crm_quote_validity_days', '30', 'crm', 'number', 0, 'Angebotsgültigkeit (Tage)'),
  ('crm_follow_up_reminder_days', '7', 'crm', 'number', 0, 'Follow-up Erinnerung (Tage)'),
  ('crm_duplicate_detection', 'true', 'crm', 'boolean', 0, 'Duplikat-Erkennung'),
  ('crm_email_integration', 'false', 'crm', 'boolean', 0, 'Email Integration'),
  ('crm_calendar_sync', 'false', 'crm', 'boolean', 0, 'Kalender Sync');

-- Reporting Module Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('reporting_enabled', 'true', 'reporting', 'boolean', 0, 'Reporting aktiviert'),
  ('reporting_auto_generate_monthly', 'true', 'reporting', 'boolean', 0, 'Monatliche Auto-Reports'),
  ('reporting_dashboard_refresh_interval', '300', 'reporting', 'number', 0, 'Dashboard Refresh (Sek.)'),
  ('reporting_data_retention_months', '24', 'reporting', 'number', 0, 'Datenaufbewahrung (Monate)'),
  ('reporting_scheduled_reports', 'true', 'reporting', 'boolean', 0, 'Geplante Reports'),
  ('reporting_custom_kpi', 'true', 'reporting', 'boolean', 0, 'Custom KPIs'),
  ('reporting_export_formats', 'null', 'reporting', 'json', 0, 'Export Formate'),
  ('reporting_chart_library', '"chartjs"', 'reporting', 'select', 0, 'Chart Library');

-- API Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('api_enabled', 'true', 'api', 'boolean', 0, 'REST API aktiviert'),
  ('api_rate_limiting', 'true', 'api', 'boolean', 0, 'API Rate Limiting'),
  ('api_rate_limit_per_hour', '1000', 'api', 'number', 0, 'Rate Limit (pro Stunde)'),
  ('api_key_required', 'false', 'api', 'boolean', 0, 'API Key erforderlich'),
  ('api_versioning', 'true', 'api', 'boolean', 0, 'API Versionierung'),
  ('api_current_version', '"v1"', 'api', 'string', 0, 'Aktuelle API Version'),
  ('api_documentation_enabled', 'true', 'api', 'boolean', 0, 'API Dokumentation'),
  ('api_cors_enabled', 'true', 'api', 'boolean', 0, 'API CORS'),
  ('api_webhook_endpoints', 'null', 'api', 'json', 0, 'Webhook Endpoints');

-- Backup Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('backup_enabled', 'true', 'backup', 'boolean', 0, 'Backup aktiviert'),
  ('backup_auto_backup', 'true', 'backup', 'boolean', 0, 'Auto-Backup'),
  ('backup_frequency', '"daily"', 'backup', 'select', 0, 'Backup-Frequenz'),
  ('backup_retention_count', '7', 'backup', 'number', 0, 'Backup-Aufbewahrung (Anzahl)'),
  ('backup_compression', 'true', 'backup', 'boolean', 0, 'Backup Komprimierung'),
  ('backup_encryption', 'false', 'backup', 'boolean', 0, 'Backup Verschlüsselung'),
  ('backup_remote_storage', 'false', 'backup', 'boolean', 0, 'Remote Backup'),
  ('backup_remote_provider', 'null', 'backup', 'select', 0, 'Remote Provider'),
  ('backup_remote_bucket', 'null', 'backup', 'string', 0, 'Remote Bucket'),
  ('backup_remote_region', 'null', 'backup', 'string', 0, 'Remote Region'),
  ('backup_remote_access_key', 'null', 'backup', 'string', 1, 'Remote Access Key'),
  ('backup_remote_secret_key', 'null', 'backup', 'string', 1, 'Remote Secret Key'),
  ('backup_verify_after_backup', 'true', 'backup', 'boolean', 0, 'Backup Verifikation');

-- Monitoring Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('monitoring_interval_seconds', '60', 'integration', 'number', 0, 'Monitoring Intervall'),
  ('sentry_environment', '"production"', 'integration', 'string', 0, 'Sentry Environment'),
  ('sentry_traces_sample_rate', '0.1', 'integration', 'number', 0, 'Sentry Traces Sample Rate'),
  ('prometheus_enabled', 'false', 'integration', 'boolean', 0, 'Prometheus aktiviert'),
  ('prometheus_port', '9090', 'integration', 'number', 0, 'Prometheus Port'),
  ('grafana_enabled', 'false', 'integration', 'boolean', 0, 'Grafana aktiviert'),
  ('grafana_url', 'null', 'integration', 'string', 0, 'Grafana URL'),
  ('health_check_enabled', 'true', 'integration', 'boolean', 0, 'Health Check'),
  ('health_check_interval_seconds', '30', 'integration', 'number', 0, 'Health Check Intervall');

-- Integration Platforms
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('integration_zapier', 'false', 'integration', 'boolean', 0, 'Zapier Integration'),
  ('integration_make', 'false', 'integration', 'boolean', 0, 'Make.com Integration'),
  ('integration_n8n', 'false', 'integration', 'boolean', 0, 'n8n Integration'),
  ('integration_api_url', 'null', 'integration', 'string', 0, 'Integration API URL');

-- Document Management
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES
  ('document_storage_provider', '"local"', 'system', 'select', 0, 'Dokument Speicher Provider'),
  ('document_max_file_size_mb', '50', 'system', 'number', 0, 'Max. Dateigröße (MB)'),
  ('document_allowed_extensions', 'null', 'system', 'json', 0, 'Erlaubte Dateitypen'),
  ('document_versioning', 'true', 'system', 'boolean', 0, 'Dokumentenversionierung'),
  ('document_retention_years', '10', 'system', 'number', 0, 'Dokumentenaufbewahrung (Jahre)'),
  ('document_ocr_enabled', 'false', 'system', 'boolean', 0, 'OCR aktiviert'),
  ('document_auto_tagging', 'false', 'system', 'boolean', 0, 'Auto-Tagging');

-- Re-enable foreign key checks
PRAGMA foreign_keys = ON;
