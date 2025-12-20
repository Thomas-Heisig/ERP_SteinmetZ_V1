-- SPDX-License-Identifier: MIT
-- Migration: Add Extended Settings
-- Adds all new ERP-wide settings to the system_settings table
-- Safe to run multiple times (uses INSERT OR IGNORE)
-- SQLite compatible version

-- System Extended Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('system_company_name', '"SteinmetZ GmbH"', 'system', 'string', 0, 'Offizieller Firmenname');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('system_logo_url', 'null', 'system', 'string', 0, 'URL zum Firmenlogo');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('system_timezone', '"Europe/Berlin"', 'system', 'select', 0, 'Standard-Zeitzone');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('system_country', '"DE"', 'system', 'select', 0, 'Hauptstandort des Unternehmens');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('system_currency', '"EUR"', 'system', 'select', 0, 'Standard-Währung');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('system_language_default', '"de"', 'system', 'select', 0, 'Standard-Systemsprache');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('maintenance_message', '"System wird gewartet"', 'system', 'string', 0, 'Wartungsnachricht');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('log_retention_days', '90', 'system', 'number', 0, 'Log-Aufbewahrung in Tagen');

-- AI Extended Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('ai_fallback_provider', 'null', 'ai', 'select', 0, 'Fallback KI-Provider');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('ai_cost_limit_monthly', '1000', 'ai', 'number', 0, 'Monatliches Kosten-Limit (€)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('openai_top_p', '1.0', 'ai', 'number', 0, 'OpenAI Top P Parameter');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('openai_frequency_penalty', '0.0', 'ai', 'number', 0, 'OpenAI Frequency Penalty');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('openai_presence_penalty', '0.0', 'ai', 'number', 0, 'OpenAI Presence Penalty');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('anthropic_top_p', '1.0', 'ai', 'number', 0, 'Anthropic Top P Parameter');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('anthropic_top_k', '40', 'ai', 'number', 0, 'Anthropic Top K Parameter');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('ollama_num_ctx', '2048', 'ai', 'number', 0, 'Ollama Context Length');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('azure_openai_endpoint', 'null', 'ai', 'string', 1, 'Azure OpenAI Endpoint');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('azure_openai_api_key', 'null', 'ai', 'string', 1, 'Azure OpenAI API Key');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('azure_openai_deployment', 'null', 'ai', 'string', 0, 'Azure OpenAI Deployment Name');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('azure_openai_api_version', '"2024-02-01"', 'ai', 'string', 0, 'Azure OpenAI API Version');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('gemini_api_key', 'null', 'ai', 'string', 1, 'Google Gemini API Key');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('gemini_model', '"gemini-pro"', 'ai', 'string', 0, 'Google Gemini Modell');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('gemini_temperature', '0.7', 'ai', 'number', 0, 'Gemini Temperatur');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('gemini_max_tokens', '4096', 'ai', 'number', 0, 'Gemini Max Tokens');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('local_gpu_enabled', 'false', 'ai', 'boolean', 0, 'GPU für lokale Modelle aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('local_gpu_layers', '0', 'ai', 'number', 0, 'Anzahl GPU Layers');

-- Cache & Redis Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('redis_enabled', 'false', 'performance', 'boolean', 0, 'Redis Caching aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('redis_host', '"localhost"', 'performance', 'string', 0, 'Redis Host');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('redis_port', '6379', 'performance', 'number', 0, 'Redis Port');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('redis_password', 'null', 'performance', 'string', 1, 'Redis Passwort');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('redis_db', '0', 'performance', 'number', 0, 'Redis Datenbank-Index');

-- Performance Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('max_concurrent_connections', '100', 'performance', 'number', 0, 'Max. gleichzeitige Verbindungen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('compression_enabled', 'true', 'performance', 'boolean', 0, 'Gzip Komprimierung');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('lazy_loading_enabled', 'true', 'performance', 'boolean', 0, 'Lazy Loading aktiviert');

-- Database Extended Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('db_backup_location', 'null', 'database', 'string', 0, 'Backup-Speicherort');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('db_auto_vacuum_enabled', 'true', 'database', 'boolean', 0, 'Auto-Vacuum aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('db_query_timeout_seconds', '30', 'database', 'number', 0, 'Query Timeout (Sekunden)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('db_pool_size', '10', 'database', 'number', 0, 'Connection Pool Größe');

-- Security Extended Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('lockout_duration_minutes', '30', 'security', 'number', 0, 'Sperrdauer nach Fehlversuchen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('password_require_uppercase', 'true', 'security', 'boolean', 0, 'Großbuchstaben erforderlich');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('password_require_lowercase', 'true', 'security', 'boolean', 0, 'Kleinbuchstaben erforderlich');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('password_require_numbers', 'true', 'security', 'boolean', 0, 'Zahlen erforderlich');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('password_require_special', 'false', 'security', 'boolean', 0, 'Sonderzeichen erforderlich');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('password_expiry_days', '90', 'security', 'number', 0, 'Passwort-Ablauf (Tage)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('allowed_ip_addresses', 'null', 'security', 'string', 0, 'Erlaubte IP-Adressen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('blocked_ip_addresses', 'null', 'security', 'string', 0, 'Gesperrte IP-Adressen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('jwt_secret', 'null', 'security', 'string', 1, 'JWT Secret Key');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('jwt_expiry_hours', '24', 'security', 'number', 0, 'JWT Ablaufzeit (Stunden)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('refresh_token_expiry_days', '30', 'security', 'number', 0, 'Refresh Token Ablauf (Tage)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('cors_allowed_origins', 'null', 'security', 'string', 0, 'CORS Allowed Origins');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('csrf_protection_enabled', 'true', 'security', 'boolean', 0, 'CSRF Protection');

-- UI Extended Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('number_format', '"de-DE"', 'ui', 'string', 0, 'Zahlenformat');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('currency_symbol_position', '"after"', 'ui', 'select', 0, 'Währungssymbol Position');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('decimal_separator', '","', 'ui', 'select', 0, 'Dezimaltrennzeichen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('thousand_separator', '"."', 'ui', 'select', 0, 'Tausendertrennzeichen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('show_tooltips', 'true', 'ui', 'boolean', 0, 'Tooltips anzeigen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('enable_animations', 'true', 'ui', 'boolean', 0, 'Animationen aktivieren');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('compact_view', 'false', 'ui', 'boolean', 0, 'Kompakte Ansicht');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('sidebar_collapsed', 'false', 'ui', 'boolean', 0, 'Sidebar eingeklappt');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('show_breadcrumbs', 'true', 'ui', 'boolean', 0, 'Breadcrumbs anzeigen');

-- Feature Flags Extended
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('feature_export_excel', 'true', 'system', 'boolean', 0, 'Excel Export');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('feature_export_pdf', 'true', 'system', 'boolean', 0, 'PDF Export');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('feature_import_csv', 'true', 'system', 'boolean', 0, 'CSV Import');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('feature_document_versioning', 'true', 'system', 'boolean', 0, 'Dokumentenversionierung');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('feature_audit_log', 'true', 'system', 'boolean', 0, 'Audit Log');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('feature_notifications', 'true', 'system', 'boolean', 0, 'Benachrichtigungen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('feature_mobile_app', 'false', 'system', 'boolean', 0, 'Mobile App');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('feature_api_access', 'true', 'system', 'boolean', 0, 'API Zugriff');

-- Email Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('email_provider', '"smtp"', 'email', 'select', 0, 'Email Provider');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('email_smtp_secure', 'true', 'email', 'boolean', 0, 'SMTP Secure (TLS)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('email_smtp_user', 'null', 'email', 'string', 0, 'SMTP Benutzername');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('email_smtp_password', 'null', 'email', 'string', 1, 'SMTP Passwort');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('email_from_name', 'null', 'email', 'string', 0, 'Absender Name');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('email_reply_to', 'null', 'email', 'string', 0, 'Reply-To Adresse');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('email_bcc_admin', 'false', 'email', 'boolean', 0, 'BCC an Admin');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('email_queue_enabled', 'true', 'email', 'boolean', 0, 'Email Queue');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('email_retry_attempts', '3', 'email', 'number', 0, 'Wiederholungsversuche');

-- Notification Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('notifications_enabled', 'true', 'notifications', 'boolean', 0, 'Benachrichtigungen aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('notifications_email', 'true', 'notifications', 'boolean', 0, 'Email-Benachrichtigungen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('notifications_browser', 'true', 'notifications', 'boolean', 0, 'Browser-Benachrichtigungen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('notifications_sms', 'false', 'notifications', 'boolean', 0, 'SMS-Benachrichtigungen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('notifications_slack', 'false', 'notifications', 'boolean', 0, 'Slack-Benachrichtigungen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('notifications_teams', 'false', 'notifications', 'boolean', 0, 'Teams-Benachrichtigungen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('notifications_telegram', 'false', 'notifications', 'boolean', 0, 'Telegram-Benachrichtigungen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('notification_sound_enabled', 'true', 'notifications', 'boolean', 0, 'Sound aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('notification_digest_enabled', 'false', 'notifications', 'boolean', 0, 'Digest aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('notification_digest_frequency', '"daily"', 'notifications', 'select', 0, 'Digest Frequenz');

-- Webhook Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('webhook_timeout_seconds', '30', 'integration', 'number', 0, 'Webhook Timeout');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('webhook_retry_attempts', '3', 'integration', 'number', 0, 'Webhook Wiederholungsversuche');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('webhook_events', 'null', 'integration', 'json', 0, 'Webhook Events');

-- Finance Module Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('finance_enabled', 'true', 'finance', 'boolean', 0, 'Finance Modul aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('finance_fiscal_year_start', '"01-01"', 'finance', 'string', 0, 'Geschäftsjahrbeginn');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('finance_default_tax_rate', '19.0', 'finance', 'number', 0, 'Standard Steuersatz (%)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('finance_auto_invoice_numbering', 'true', 'finance', 'boolean', 0, 'Auto Rechnungsnummern');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('finance_invoice_prefix', '"INV-"', 'finance', 'string', 0, 'Rechnungsnummer-Präfix');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('finance_invoice_number_length', '6', 'finance', 'number', 0, 'Rechnungsnummer Länge');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('finance_payment_terms_days', '30', 'finance', 'number', 0, 'Zahlungsziel (Tage)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('finance_late_payment_fee_percentage', '5.0', 'finance', 'number', 0, 'Säumniszuschlag (%)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('finance_multiple_currencies', 'false', 'finance', 'boolean', 0, 'Mehrere Währungen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('finance_exchange_rate_api', 'null', 'finance', 'string', 0, 'Wechselkurs API');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('finance_accounting_standard', '"HGB"', 'finance', 'select', 0, 'Rechnungslegungsstandard');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('finance_cost_center_tracking', 'true', 'finance', 'boolean', 0, 'Kostenstellen-Tracking');

-- Inventory Module Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('inventory_enabled', 'true', 'inventory', 'boolean', 0, 'Lager-Modul aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('inventory_track_lots', 'true', 'inventory', 'boolean', 0, 'Chargen-Tracking');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('inventory_track_serial_numbers', 'false', 'inventory', 'boolean', 0, 'Seriennummer-Tracking');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('inventory_low_stock_threshold', '10', 'inventory', 'number', 0, 'Mindestbestand-Schwelle');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('inventory_reorder_point_enabled', 'true', 'inventory', 'boolean', 0, 'Meldebestand aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('inventory_auto_reorder', 'false', 'inventory', 'boolean', 0, 'Auto-Bestellung');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('inventory_barcode_format', '"EAN13"', 'inventory', 'select', 0, 'Barcode-Format');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('inventory_location_tracking', 'true', 'inventory', 'boolean', 0, 'Lagerort-Tracking');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('inventory_fifo_costing', 'true', 'inventory', 'boolean', 0, 'FIFO Kosten');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('inventory_allow_negative_stock', 'false', 'inventory', 'boolean', 0, 'Negativbestand erlauben');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('inventory_stock_valuation_method', '"FIFO"', 'inventory', 'select', 0, 'Bestandsbewertung');

-- HR Module Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('hr_enabled', 'true', 'hr', 'boolean', 0, 'HR-Modul aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('hr_timesheet_enabled', 'true', 'hr', 'boolean', 0, 'Zeiterfassung');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('hr_attendance_tracking', 'true', 'hr', 'boolean', 0, 'Anwesenheitserfassung');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('hr_leave_management', 'true', 'hr', 'boolean', 0, 'Urlaubsverwaltung');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('hr_payroll_integration', 'false', 'hr', 'boolean', 0, 'Lohnabrechnung Integration');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('hr_performance_reviews', 'true', 'hr', 'boolean', 0, 'Leistungsbeurteilungen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('hr_recruitment_module', 'false', 'hr', 'boolean', 0, 'Recruiting Modul');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('hr_employee_self_service', 'true', 'hr', 'boolean', 0, 'Mitarbeiter Self-Service');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('hr_working_hours_per_week', '40', 'hr', 'number', 0, 'Wochenstunden');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('hr_overtime_calculation_method', '"multiplier"', 'hr', 'select', 0, 'Überstunden-Berechnung');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('hr_overtime_multiplier', '1.5', 'hr', 'number', 0, 'Überstunden-Faktor');

-- CRM Module Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('crm_enabled', 'true', 'crm', 'boolean', 0, 'CRM-Modul aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('crm_lead_scoring', 'true', 'crm', 'boolean', 0, 'Lead Scoring');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('crm_auto_assign_leads', 'false', 'crm', 'boolean', 0, 'Auto Lead-Zuweisung');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('crm_sales_pipeline_stages', 'null', 'crm', 'json', 0, 'Sales Pipeline Stages');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('crm_quote_validity_days', '30', 'crm', 'number', 0, 'Angebotsgültigkeit (Tage)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('crm_follow_up_reminder_days', '7', 'crm', 'number', 0, 'Follow-up Erinnerung (Tage)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('crm_duplicate_detection', 'true', 'crm', 'boolean', 0, 'Duplikat-Erkennung');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('crm_email_integration', 'false', 'crm', 'boolean', 0, 'Email Integration');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('crm_calendar_sync', 'false', 'crm', 'boolean', 0, 'Kalender Sync');

-- Reporting Module Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('reporting_enabled', 'true', 'reporting', 'boolean', 0, 'Reporting aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('reporting_auto_generate_monthly', 'true', 'reporting', 'boolean', 0, 'Monatliche Auto-Reports');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('reporting_dashboard_refresh_interval', '300', 'reporting', 'number', 0, 'Dashboard Refresh (Sek.)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('reporting_data_retention_months', '24', 'reporting', 'number', 0, 'Datenaufbewahrung (Monate)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('reporting_scheduled_reports', 'true', 'reporting', 'boolean', 0, 'Geplante Reports');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('reporting_custom_kpi', 'true', 'reporting', 'boolean', 0, 'Custom KPIs');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('reporting_export_formats', 'null', 'reporting', 'json', 0, 'Export Formate');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('reporting_chart_library', '"chartjs"', 'reporting', 'select', 0, 'Chart Library');

-- API Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('api_enabled', 'true', 'api', 'boolean', 0, 'REST API aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('api_rate_limiting', 'true', 'api', 'boolean', 0, 'API Rate Limiting');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('api_rate_limit_per_hour', '1000', 'api', 'number', 0, 'Rate Limit (pro Stunde)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('api_key_required', 'false', 'api', 'boolean', 0, 'API Key erforderlich');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('api_versioning', 'true', 'api', 'boolean', 0, 'API Versionierung');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('api_current_version', '"v1"', 'api', 'string', 0, 'Aktuelle API Version');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('api_documentation_enabled', 'true', 'api', 'boolean', 0, 'API Dokumentation');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('api_cors_enabled', 'true', 'api', 'boolean', 0, 'API CORS');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('api_webhook_endpoints', 'null', 'api', 'json', 0, 'Webhook Endpoints');

-- Backup Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('backup_enabled', 'true', 'backup', 'boolean', 0, 'Backup aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('backup_auto_backup', 'true', 'backup', 'boolean', 0, 'Auto-Backup');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('backup_frequency', '"daily"', 'backup', 'select', 0, 'Backup-Frequenz');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('backup_retention_count', '7', 'backup', 'number', 0, 'Backup-Aufbewahrung (Anzahl)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('backup_compression', 'true', 'backup', 'boolean', 0, 'Backup Komprimierung');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('backup_encryption', 'false', 'backup', 'boolean', 0, 'Backup Verschlüsselung');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('backup_remote_storage', 'false', 'backup', 'boolean', 0, 'Remote Backup');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('backup_remote_provider', 'null', 'backup', 'select', 0, 'Remote Provider');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('backup_remote_bucket', 'null', 'backup', 'string', 0, 'Remote Bucket');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('backup_remote_region', 'null', 'backup', 'string', 0, 'Remote Region');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('backup_remote_access_key', 'null', 'backup', 'string', 1, 'Remote Access Key');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('backup_remote_secret_key', 'null', 'backup', 'string', 1, 'Remote Secret Key');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('backup_verify_after_backup', 'true', 'backup', 'boolean', 0, 'Backup Verifikation');

-- Monitoring Settings
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('monitoring_interval_seconds', '60', 'integration', 'number', 0, 'Monitoring Intervall');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('sentry_environment', '"production"', 'integration', 'string', 0, 'Sentry Environment');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('sentry_traces_sample_rate', '0.1', 'integration', 'number', 0, 'Sentry Traces Sample Rate');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('prometheus_enabled', 'false', 'integration', 'boolean', 0, 'Prometheus aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('prometheus_port', '9090', 'integration', 'number', 0, 'Prometheus Port');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('grafana_enabled', 'false', 'integration', 'boolean', 0, 'Grafana aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('grafana_url', 'null', 'integration', 'string', 0, 'Grafana URL');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('health_check_enabled', 'true', 'integration', 'boolean', 0, 'Health Check');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('health_check_interval_seconds', '30', 'integration', 'number', 0, 'Health Check Intervall');

-- Integration Platforms
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('integration_zapier', 'false', 'integration', 'boolean', 0, 'Zapier Integration');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('integration_make', 'false', 'integration', 'boolean', 0, 'Make.com Integration');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('integration_n8n', 'false', 'integration', 'boolean', 0, 'n8n Integration');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('integration_api_url', 'null', 'integration', 'string', 0, 'Integration API URL');

-- Document Management
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('document_storage_provider', '"local"', 'system', 'select', 0, 'Dokument Speicher Provider');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('document_max_file_size_mb', '50', 'system', 'number', 0, 'Max. Dateigröße (MB)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('document_allowed_extensions', 'null', 'system', 'json', 0, 'Erlaubte Dateitypen');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('document_versioning', 'true', 'system', 'boolean', 0, 'Dokumentenversionierung');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('document_retention_years', '10', 'system', 'number', 0, 'Dokumentenaufbewahrung (Jahre)');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('document_ocr_enabled', 'false', 'system', 'boolean', 0, 'OCR aktiviert');
INSERT OR IGNORE INTO system_settings (key, value, category, type, sensitive, description) VALUES ('document_auto_tagging', 'false', 'system', 'boolean', 0, 'Auto-Tagging');

