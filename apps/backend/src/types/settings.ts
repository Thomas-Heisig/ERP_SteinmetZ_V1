// SPDX-License-Identifier: MIT
// apps/backend/src/types/settings.ts

/**
 * Settings Type Definitions
 * Comprehensive type system for application settings
 */

export type Provider = 
  | "openai" 
  | "anthropic" 
  | "ollama" 
  | "local" 
  | "azure" 
  | "gemini";

export type LogLevel = 
  | "debug" 
  | "info" 
  | "warn" 
  | "error" 
  | "fatal";

export type SettingCategory = 
  | "system" 
  | "ai" 
  | "database" 
  | "security" 
  | "ui" 
  | "integration" 
  | "performance"
  | "email"
  | "finance"
  | "inventory"
  | "hr"
  | "crm"
  | "reporting"
  | "backup"
  | "api"
  | "notifications";

export type SettingType = 
  | "string" 
  | "number" 
  | "boolean" 
  | "json" 
  | "select" 
  | "multiselect";

export interface SettingDefinition {
  key: string;
  category: SettingCategory;
  type: SettingType;
  label: string;
  description: string;
  defaultValue: string | number | boolean | object;
  required: boolean;
  sensitive: boolean; // API keys, passwords, etc.
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  group?: string; // Optional grouping within category
  requiresRestart?: boolean; // Whether changing this setting requires a restart
  validValues?: string[]; // Allowed values for select/multiselect
  minValue?: number; // Minimum value for number types
  maxValue?: number; // Maximum value for number types
}

export interface SystemSettings {
  // System Settings
  system_name: string;
  system_version: string;
  system_description?: string;
  system_company_name: string;
  system_logo_url?: string;
  system_timezone: string;
  system_country: string;
  system_currency: string;
  system_language_default: string;
  maintenance_mode: boolean;
  maintenance_message?: string;
  debug_mode: boolean;
  log_level: LogLevel;
  log_retention_days: number;
  
  // Tenant (Mandantenfähigkeit) Settings
  tenant_enabled: boolean;
  tenant_mode: "single" | "multi";
  tenant_isolation: "database" | "schema" | "row";
  tenant_default_id?: string;
  tenant_custom_domains: boolean;
  tenant_data_isolation_strict: boolean;
  
  // AI Provider Settings
  default_provider: Provider;
  default_model: string;
  ai_enabled: boolean;
  ai_timeout_seconds: number;
  max_parallel_requests: number;
  ai_fallback_provider?: Provider;
  ai_cost_limit_monthly?: number;
  
  // OpenAI
  openai_api_key?: string;
  openai_organization?: string;
  openai_model: string;
  openai_temperature: number;
  openai_max_tokens: number;
  openai_top_p: number;
  openai_frequency_penalty: number;
  openai_presence_penalty: number;
  
  // Anthropic
  anthropic_api_key?: string;
  anthropic_model: string;
  anthropic_temperature: number;
  anthropic_max_tokens: number;
  anthropic_top_p: number;
  anthropic_top_k: number;
  
  // Ollama
  ollama_base_url: string;
  ollama_model: string;
  ollama_temperature: number;
  ollama_max_tokens: number;
  ollama_num_ctx: number;
  
  // Azure OpenAI
  azure_openai_endpoint?: string;
  azure_openai_api_key?: string;
  azure_openai_deployment?: string;
  azure_openai_api_version: string;
  
  // Google Gemini
  gemini_api_key?: string;
  gemini_model: string;
  gemini_temperature: number;
  gemini_max_tokens: number;
  
  // Local Model
  local_model_path?: string;
  local_model_name?: string;
  local_gpu_enabled: boolean;
  local_gpu_layers: number;
  
  // Cache Settings
  cache_enabled: boolean;
  cache_ttl_minutes: number;
  cache_max_size_mb: number;
  redis_enabled: boolean;
  redis_host: string;
  redis_port: number;
  redis_password?: string;
  redis_db: number;
  
  // Performance
  autosave_interval_min: number;
  batch_size: number;
  request_timeout_seconds: number;
  max_concurrent_connections: number;
  rate_limit_enabled: boolean;
  rate_limit_requests_per_minute: number;
  compression_enabled: boolean;
  lazy_loading_enabled: boolean;
  
  // Database
  db_backup_enabled: boolean;
  db_backup_interval_hours: number;
  db_backup_retention_days: number;
  db_backup_location?: string;
  db_auto_vacuum_enabled: boolean;
  db_max_connections: number;
  db_query_timeout_seconds: number;
  db_pool_size: number;
  
  // Security
  session_timeout_minutes: number;
  max_login_attempts: number;
  lockout_duration_minutes: number;
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_numbers: boolean;
  password_require_special: boolean;
  password_expiry_days: number;
  require_2fa: boolean;
  allowed_ip_addresses?: string;
  blocked_ip_addresses?: string;
  jwt_secret?: string;
  jwt_expiry_hours: number;
  refresh_token_expiry_days: number;
  cors_enabled: boolean;
  cors_allowed_origins?: string;
  csrf_protection_enabled: boolean;
  
  // UI Settings
  theme: "light" | "dark" | "auto" | "lcars";
  language: string;
  date_format: string;
  time_format: string;
  number_format: string;
  currency_symbol_position: "before" | "after";
  decimal_separator: "." | ",";
  thousand_separator: "," | "." | " ";
  items_per_page: number;
  show_tooltips: boolean;
  enable_animations: boolean;
  compact_view: boolean;
  sidebar_collapsed: boolean;
  show_breadcrumbs: boolean;
  
  // Feature Flags
  feature_ai_annotator: boolean;
  feature_batch_processing: boolean;
  feature_realtime_updates: boolean;
  feature_advanced_filters: boolean;
  feature_export_excel: boolean;
  feature_export_pdf: boolean;
  feature_import_csv: boolean;
  feature_document_versioning: boolean;
  feature_audit_log: boolean;
  feature_notifications: boolean;
  feature_mobile_app: boolean;
  feature_api_access: boolean;
  
  // Email Settings
  email_enabled: boolean;
  email_provider: "smtp" | "sendgrid" | "mailgun" | "ses";
  email_smtp_host?: string;
  email_smtp_port?: number;
  email_smtp_secure: boolean;
  email_smtp_user?: string;
  email_smtp_password?: string;
  email_from_address?: string;
  email_from_name?: string;
  email_reply_to?: string;
  email_bcc_admin: boolean;
  email_queue_enabled: boolean;
  email_retry_attempts: number;
  
  // Notification Settings
  notifications_enabled: boolean;
  notifications_email: boolean;
  notifications_browser: boolean;
  notifications_sms: boolean;
  notifications_slack: boolean;
  notifications_teams: boolean;
  notifications_telegram: boolean;
  notification_sound_enabled: boolean;
  notification_digest_enabled: boolean;
  notification_digest_frequency: "hourly" | "daily" | "weekly";
  
  // Webhook Settings
  webhook_enabled: boolean;
  webhook_url?: string;
  webhook_secret?: string;
  webhook_timeout_seconds: number;
  webhook_retry_attempts: number;
  webhook_events?: string[];
  
  // Finance Module
  finance_enabled: boolean;
  finance_fiscal_year_start: string;
  finance_default_tax_rate: number;
  finance_auto_invoice_numbering: boolean;
  finance_invoice_prefix: string;
  finance_invoice_number_length: number;
  finance_payment_terms_days: number;
  finance_late_payment_fee_percentage: number;
  finance_multiple_currencies: boolean;
  finance_exchange_rate_api?: string;
  finance_accounting_standard: "GAAP" | "IFRS" | "HGB";
  finance_cost_center_tracking: boolean;
  
  // Inventory Module
  inventory_enabled: boolean;
  inventory_track_lots: boolean;
  inventory_track_serial_numbers: boolean;
  inventory_low_stock_threshold: number;
  inventory_reorder_point_enabled: boolean;
  inventory_auto_reorder: boolean;
  inventory_barcode_format: "EAN13" | "UPC" | "CODE128" | "QR";
  inventory_location_tracking: boolean;
  inventory_fifo_costing: boolean;
  inventory_allow_negative_stock: boolean;
  inventory_stock_valuation_method: "FIFO" | "LIFO" | "Average";
  
  // HR Module
  hr_enabled: boolean;
  hr_timesheet_enabled: boolean;
  hr_attendance_tracking: boolean;
  hr_leave_management: boolean;
  hr_payroll_integration: boolean;
  hr_performance_reviews: boolean;
  hr_recruitment_module: boolean;
  hr_employee_self_service: boolean;
  hr_working_hours_per_week: number;
  hr_overtime_calculation_method: "fixed" | "multiplier";
  hr_overtime_multiplier: number;
  
  // CRM Module
  crm_enabled: boolean;
  crm_lead_scoring: boolean;
  crm_auto_assign_leads: boolean;
  crm_sales_pipeline_stages?: string[];
  crm_quote_validity_days: number;
  crm_follow_up_reminder_days: number;
  crm_duplicate_detection: boolean;
  crm_email_integration: boolean;
  crm_calendar_sync: boolean;
  
  // Reporting Module
  reporting_enabled: boolean;
  reporting_auto_generate_monthly: boolean;
  reporting_dashboard_refresh_interval: number;
  reporting_data_retention_months: number;
  reporting_scheduled_reports: boolean;
  reporting_custom_kpi: boolean;
  reporting_export_formats?: string[];
  reporting_chart_library: "chartjs" | "d3" | "recharts";
  
  // API Settings
  api_enabled: boolean;
  api_rate_limiting: boolean;
  api_rate_limit_per_hour: number;
  api_key_required: boolean;
  api_versioning: boolean;
  api_current_version: string;
  api_documentation_enabled: boolean;
  api_cors_enabled: boolean;
  api_webhook_endpoints?: string[];
  
  // Backup Settings
  backup_enabled: boolean;
  backup_auto_backup: boolean;
  backup_frequency: "hourly" | "daily" | "weekly";
  backup_retention_count: number;
  backup_compression: boolean;
  backup_encryption: boolean;
  backup_remote_storage: boolean;
  backup_remote_provider?: "s3" | "azure" | "gcp" | "ftp";
  backup_remote_bucket?: string;
  backup_remote_region?: string;
  backup_remote_access_key?: string;
  backup_remote_secret_key?: string;
  backup_verify_after_backup: boolean;
  
  // Monitoring
  diagnostics_enabled: boolean;
  monitoring_enabled: boolean;
  monitoring_interval_seconds: number;
  sentry_enabled: boolean;
  sentry_dsn?: string;
  sentry_environment: string;
  sentry_traces_sample_rate: number;
  prometheus_enabled: boolean;
  prometheus_port: number;
  grafana_enabled: boolean;
  grafana_url?: string;
  health_check_enabled: boolean;
  health_check_interval_seconds: number;
  
  // Integration Platforms
  integration_zapier: boolean;
  integration_make: boolean;
  integration_n8n: boolean;
  integration_api_url?: string;
  
  // Document Management
  document_storage_provider: "local" | "s3" | "azure" | "gcp";
  document_max_file_size_mb: number;
  document_allowed_extensions?: string[];
  document_versioning: boolean;
  document_retention_years: number;
  document_ocr_enabled: boolean;
  document_auto_tagging: boolean;
  
  // Metadata
  last_updated: string;
  updated_by?: string;
}

export interface SettingRecord {
  id: string;
  key: string;
  value: string; // Always stored as JSON string
  category: SettingCategory;
  type: SettingType;
  description: string;
  sensitive: boolean;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export interface SettingHistoryRecord {
  id: string;
  setting_key: string;
  old_value: string;
  new_value: string;
  changed_by: string;
  changed_at: string;
  change_reason?: string;
}

export interface SettingsExport {
  version: string;
  exported_at: string;
  exported_by: string;
  settings: Partial<SystemSettings>;
}

export interface SettingsImport {
  settings: Partial<SystemSettings>;
  overwrite_existing: boolean;
  import_sensitive: boolean;
}

export interface SettingValidationError {
  key: string;
  error: string;
  currentValue: unknown;
}

export interface SettingsStatusReport {
  timestamp: string;
  total_settings: number;
  categories: Record<SettingCategory, number>;
  validation_errors: SettingValidationError[];
  system_info: {
    hostname: string;
    platform: string;
    node_version: string;
    uptime_seconds: number;
    memory: {
      total_gb: number;
      free_gb: number;
      used_percentage: number;
    };
    cpu: {
      cores: number;
      model: string;
    };
  };
  database_info: {
    connected: boolean;
    type: string;
    size_mb?: number;
  };
}

export const DEFAULT_SETTINGS: SystemSettings = {
  // System
  system_version: "1.0.0",
  system_name: "ERP SteinmetZ",
  system_description: "Enterprise Resource Planning System",
  system_company_name: "SteinmetZ GmbH",
  system_timezone: "Europe/Berlin",
  system_country: "DE",
  system_currency: "EUR",
  system_language_default: "de",
  maintenance_mode: false,
  debug_mode: false,
  log_level: "info",
  log_retention_days: 90,
  
  // Tenant (Mandantenfähigkeit)
  tenant_enabled: false,
  tenant_mode: "single",
  tenant_isolation: "row",
  tenant_custom_domains: false,
  tenant_data_isolation_strict: true,
  
  // AI
  default_provider: "openai",
  default_model: "gpt-4o-mini",
  ai_enabled: true,
  ai_timeout_seconds: 60,
  max_parallel_requests: 3,
  ai_cost_limit_monthly: 1000,
  
  // OpenAI
  openai_model: "gpt-4o-mini",
  openai_temperature: 0.7,
  openai_max_tokens: 4096,
  openai_top_p: 1.0,
  openai_frequency_penalty: 0.0,
  openai_presence_penalty: 0.0,
  
  // Anthropic
  anthropic_model: "claude-3-5-sonnet-20241022",
  anthropic_temperature: 0.7,
  anthropic_max_tokens: 4096,
  anthropic_top_p: 1.0,
  anthropic_top_k: 40,
  
  // Ollama
  ollama_base_url: "http://localhost:11434",
  ollama_model: "qwen2.5:3b",
  ollama_temperature: 0.7,
  ollama_max_tokens: 4096,
  ollama_num_ctx: 2048,
  
  // Azure OpenAI
  azure_openai_api_version: "2024-02-01",
  
  // Google Gemini
  gemini_model: "gemini-pro",
  gemini_temperature: 0.7,
  gemini_max_tokens: 4096,
  
  // Local Model
  local_gpu_enabled: false,
  local_gpu_layers: 0,
  
  // Cache
  cache_enabled: true,
  cache_ttl_minutes: 60,
  cache_max_size_mb: 512,
  redis_enabled: false,
  redis_host: "localhost",
  redis_port: 6379,
  redis_db: 0,
  
  // Performance
  autosave_interval_min: 30,
  batch_size: 100,
  request_timeout_seconds: 30,
  max_concurrent_connections: 100,
  rate_limit_enabled: true,
  rate_limit_requests_per_minute: 100,
  compression_enabled: true,
  lazy_loading_enabled: true,
  
  // Database
  db_backup_enabled: true,
  db_backup_interval_hours: 24,
  db_backup_retention_days: 30,
  db_auto_vacuum_enabled: true,
  db_max_connections: 20,
  db_query_timeout_seconds: 30,
  db_pool_size: 10,
  
  // Security
  session_timeout_minutes: 60,
  max_login_attempts: 5,
  lockout_duration_minutes: 30,
  password_min_length: 8,
  password_require_uppercase: true,
  password_require_lowercase: true,
  password_require_numbers: true,
  password_require_special: false,
  password_expiry_days: 90,
  require_2fa: false,
  jwt_expiry_hours: 24,
  refresh_token_expiry_days: 30,
  cors_enabled: true,
  csrf_protection_enabled: true,
  
  // UI
  theme: "auto",
  language: "de",
  date_format: "DD.MM.YYYY",
  time_format: "HH:mm",
  number_format: "de-DE",
  currency_symbol_position: "after",
  decimal_separator: ",",
  thousand_separator: ".",
  items_per_page: 25,
  show_tooltips: true,
  enable_animations: true,
  compact_view: false,
  sidebar_collapsed: false,
  show_breadcrumbs: true,
  
  // Features
  feature_ai_annotator: true,
  feature_batch_processing: true,
  feature_realtime_updates: true,
  feature_advanced_filters: true,
  feature_export_excel: true,
  feature_export_pdf: true,
  feature_import_csv: true,
  feature_document_versioning: true,
  feature_audit_log: true,
  feature_notifications: true,
  feature_mobile_app: false,
  feature_api_access: true,
  
  // Email
  email_enabled: false,
  email_provider: "smtp",
  email_smtp_port: 587,
  email_smtp_secure: true,
  email_bcc_admin: false,
  email_queue_enabled: true,
  email_retry_attempts: 3,
  
  // Notifications
  notifications_enabled: true,
  notifications_email: true,
  notifications_browser: true,
  notifications_sms: false,
  notifications_slack: false,
  notifications_teams: false,
  notifications_telegram: false,
  notification_sound_enabled: true,
  notification_digest_enabled: false,
  notification_digest_frequency: "daily",
  
  // Webhook
  webhook_enabled: false,
  webhook_timeout_seconds: 30,
  webhook_retry_attempts: 3,
  
  // Finance
  finance_enabled: true,
  finance_fiscal_year_start: "01-01",
  finance_default_tax_rate: 19.0,
  finance_auto_invoice_numbering: true,
  finance_invoice_prefix: "INV-",
  finance_invoice_number_length: 6,
  finance_payment_terms_days: 30,
  finance_late_payment_fee_percentage: 5.0,
  finance_multiple_currencies: false,
  finance_accounting_standard: "HGB",
  finance_cost_center_tracking: true,
  
  // Inventory
  inventory_enabled: true,
  inventory_track_lots: true,
  inventory_track_serial_numbers: false,
  inventory_low_stock_threshold: 10,
  inventory_reorder_point_enabled: true,
  inventory_auto_reorder: false,
  inventory_barcode_format: "EAN13",
  inventory_location_tracking: true,
  inventory_fifo_costing: true,
  inventory_allow_negative_stock: false,
  inventory_stock_valuation_method: "FIFO",
  
  // HR
  hr_enabled: true,
  hr_timesheet_enabled: true,
  hr_attendance_tracking: true,
  hr_leave_management: true,
  hr_payroll_integration: false,
  hr_performance_reviews: true,
  hr_recruitment_module: false,
  hr_employee_self_service: true,
  hr_working_hours_per_week: 40,
  hr_overtime_calculation_method: "multiplier",
  hr_overtime_multiplier: 1.5,
  
  // CRM
  crm_enabled: true,
  crm_lead_scoring: true,
  crm_auto_assign_leads: false,
  crm_quote_validity_days: 30,
  crm_follow_up_reminder_days: 7,
  crm_duplicate_detection: true,
  crm_email_integration: false,
  crm_calendar_sync: false,
  
  // Reporting
  reporting_enabled: true,
  reporting_auto_generate_monthly: true,
  reporting_dashboard_refresh_interval: 300,
  reporting_data_retention_months: 24,
  reporting_scheduled_reports: true,
  reporting_custom_kpi: true,
  reporting_chart_library: "chartjs",
  
  // API
  api_enabled: true,
  api_rate_limiting: true,
  api_rate_limit_per_hour: 1000,
  api_key_required: false,
  api_versioning: true,
  api_current_version: "v1",
  api_documentation_enabled: true,
  api_cors_enabled: true,
  
  // Backup
  backup_enabled: true,
  backup_auto_backup: true,
  backup_frequency: "daily",
  backup_retention_count: 7,
  backup_compression: true,
  backup_encryption: false,
  backup_remote_storage: false,
  backup_verify_after_backup: true,
  
  // Monitoring
  diagnostics_enabled: true,
  monitoring_enabled: false,
  monitoring_interval_seconds: 60,
  sentry_enabled: false,
  sentry_environment: "production",
  sentry_traces_sample_rate: 0.1,
  prometheus_enabled: false,
  prometheus_port: 9090,
  grafana_enabled: false,
  health_check_enabled: true,
  health_check_interval_seconds: 30,
  
  // Integration
  integration_zapier: false,
  integration_make: false,
  integration_n8n: false,
  
  // Document Management
  document_storage_provider: "local",
  document_max_file_size_mb: 50,
  document_versioning: true,
  document_retention_years: 10,
  document_ocr_enabled: false,
  document_auto_tagging: false,
  
  // Metadata
  last_updated: new Date().toISOString(),
};

// Import comprehensive setting definitions from separate file
export { SETTING_DEFINITIONS } from "./settings-definitions.js";
