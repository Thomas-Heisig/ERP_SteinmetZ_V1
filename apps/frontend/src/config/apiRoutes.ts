// SPDX-License-Identifier: MIT
// apps/frontend/src/config/apiRoutes.ts
/**
 * Central API Routes Configuration
 *
 * This file defines all backend API routes used by frontend components.
 * Backend routes are fixed - frontend must adapt to these endpoints.
 *
 * @see Backend docs: apps/backend/src/routes/*\/docs/README.md
 */

/**
 * API Base URL - determined at runtime
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * API Routes organized by module
 */
export const API_ROUTES = {
  /**
   * Authentication & Security
   */
  AUTH: {
    BASE: "/api/auth",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    REGISTER: "/api/auth/register",
    ME: "/api/auth/me",
    PASSWORD_RESET: "/api/auth/password-reset",
    PASSWORD_CHANGE: "/api/auth/password",
  },

  /**
   * System Health & Monitoring
   */
  HEALTH: {
    BASE: "/api/health",
    LIVENESS: "/api/health",
    READINESS: "/api/health/readiness",
    VERSION: "/api/health/version",
  },

  /**
   * System Information
   */
  SYSTEM: {
    BASE: "/api/system",
    OVERVIEW: "/api/system",
    ROUTES: "/api/system/routes",
    DATABASE: "/api/system/database",
    INFO: "/api/system/system",
    STATUS: "/api/system/status",
    ENVIRONMENT: "/api/system/environment",
    DEPENDENCIES: "/api/system/dependencies",
    DIAGNOSTICS: "/api/system/diagnostics",
    FEATURES: "/api/system/features",
    RESOURCES: "/api/system/resources",
    FUNCTIONS: "/api/system/functions",
  },

  /**
   * Dashboard Module
   */
  DASHBOARD: {
    BASE: "/api/dashboard",
    HEALTH: "/api/dashboard/health",
    OVERVIEW: "/api/dashboard/overview",
    CONTEXT_LOG: "/api/dashboard/context-log",
    KPIS: "/api/dashboard/kpis",
    TASKS: "/api/dashboard/tasks",
    TASK: (id: string) => `/api/dashboard/tasks/${id}`,
    NOTIFICATIONS: "/api/dashboard/notifications",
    NOTIFICATION: (id: string) => `/api/dashboard/notifications/${id}`,
    WIDGETS: "/api/dashboard/widgets",
    WIDGET: (id: string) => `/api/dashboard/widgets/${id}`,
    LAYOUTS: "/api/dashboard/layouts",
    LAYOUT: (id: string) => `/api/dashboard/layouts/${id}`,
    FAVORITES: "/api/dashboard/favorites",
    ACTIVITIES: "/api/dashboard/activities",
    COMPREHENSIVE: "/api/dashboard/comprehensive",
  },

  /**
   * CRM Module
   */
  CRM: {
    BASE: "/api/crm",
    CUSTOMERS: "/api/crm/customers",
    CUSTOMER: (id: string) => `/api/crm/customers/${id}`,
    CONTACTS: "/api/crm/contacts",
    CONTACT: (id: string) => `/api/crm/contacts/${id}`,
    OPPORTUNITIES: "/api/crm/opportunities",
    OPPORTUNITY: (id: string) => `/api/crm/opportunities/${id}`,
    ACTIVITIES: "/api/crm/activities",
    ACTIVITY: (id: string) => `/api/crm/activities/${id}`,
    STATISTICS: "/api/crm/statistics",
  },

  /**
   * Finance Module
   */
  FINANCE: {
    BASE: "/api/finance",
    INVOICES: "/api/finance/invoices",
    INVOICE: (id: string) => `/api/finance/invoices/${id}`,
    INVOICE_SEND: (id: string) => `/api/finance/invoices/${id}/send`,
    CUSTOMERS: "/api/finance/customers",
    CUSTOMER: (id: string) => `/api/finance/customers/${id}`,
    PAYMENTS: "/api/finance/payments",
    ACCOUNTS: "/api/finance/accounts",
    ACCOUNTING_ENTRIES: "/api/finance/accounting-entries",
    STATISTICS: "/api/finance/statistics",
    OUTSTANDING: "/api/finance/outstanding",
    REVENUE: "/api/finance/revenue",
    DUNNING: "/api/finance/dunning",
    RECONCILE: "/api/finance/reconcile",
  },

  /**
   * HR Module
   */
  HR: {
    BASE: "/api/hr",
    EMPLOYEES: "/api/hr/employees",
    EMPLOYEE: (id: string) => `/api/hr/employees/${id}`,
    CONTRACTS: "/api/hr/contracts",
    CONTRACT: (id: string) => `/api/hr/contracts/${id}`,
    EMPLOYEE_CONTRACTS: (employeeId: string) =>
      `/api/hr/employees/${employeeId}/contracts`,
    LEAVE_REQUESTS: "/api/hr/leave-requests",
    LEAVE_REQUEST_APPROVE: (id: string) =>
      `/api/hr/leave-requests/${id}/approve`,
    LEAVE_REQUEST_REJECT: (id: string) => `/api/hr/leave-requests/${id}/reject`,
    TIME_ENTRIES: "/api/hr/time-entries",
    TIME_ENTRIES_BULK: "/api/hr/time-entries/bulk",
    TIME_ENTRY_APPROVE: (id: string) => `/api/hr/time-entries/${id}/approve`,
    PAYROLL: "/api/hr/payroll",
    PAYROLL_SUMMARY: "/api/hr/payroll/summary",
    PAYROLL_APPROVE: (id: string) => `/api/hr/payroll/${id}/approve`,
    PAYROLL_EXPORT: (id: string) => `/api/hr/payroll/${id}/export`,
  },

  /**
   * Projects Module
   */
  PROJECTS: {
    BASE: "/api/projects",
    LIST: "/api/projects",
    PROJECT: (id: string) => `/api/projects/${id}`,
    TASKS: "/api/projects/tasks",
    TASK: (id: string) => `/api/projects/tasks/${id}`,
    TIME_ENTRIES: "/api/projects/time-entries",
    ANALYTICS: "/api/projects/analytics",
    OVERVIEW: "/api/projects/overview",
  },

  /**
   * Sales Module
   */
  SALES: {
    BASE: "/api/sales",
    PIPELINE: "/api/sales/pipeline",
    QUOTES: "/api/sales/quotes",
    QUOTE: (id: string) => `/api/sales/quotes/${id}`,
    ORDERS: "/api/sales/orders",
    LEADS: "/api/sales/leads",
    CAMPAIGNS: "/api/sales/campaigns",
    CAMPAIGN: (id: string) => `/api/sales/campaigns/${id}`,
    STATISTICS: "/api/sales/statistics",
    FORECAST: "/api/sales/forecast",
  },

  /**
   * Warehouse Module
   */
  WAREHOUSE: {
    BASE: "/api/warehouse",
    STOCK: "/api/warehouse/stock",
    STOCK_ITEM: (id: string) => `/api/warehouse/stock/${id}`,
    MOVEMENTS: "/api/warehouse/movements",
    LOCATIONS: "/api/warehouse/locations",
    PICKING: "/api/warehouse/picking",
    PICKING_ITEM: (id: string) => `/api/warehouse/picking/${id}`,
    PICKING_ASSIGN: (id: string) => `/api/warehouse/picking/${id}/assign`,
    PICKING_COMPLETE: (id: string) => `/api/warehouse/picking/${id}/complete`,
    SHIPMENTS: "/api/warehouse/shipments",
    INVENTORY_COUNTS: "/api/warehouse/inventory-counts",
    STATISTICS: "/api/warehouse/statistics",
  },

  /**
   * Production Module
   */
  PRODUCTION: {
    BASE: "/api/production",
    PLANNING: "/api/production/planning",
    ORDERS: "/api/production/orders",
    ORDER: (id: string) => `/api/production/orders/${id}`,
    ORDER_FEEDBACK: (id: string) => `/api/production/orders/${id}/feedback`,
    MACHINES: "/api/production/machines",
    MACHINE: (id: string) => `/api/production/machines/${id}`,
    QUALITY: "/api/production/quality",
    MAINTENANCE: "/api/production/maintenance",
    STATISTICS: "/api/production/statistics",
  },

  /**
   * Inventory Module
   */
  INVENTORY: {
    BASE: "/api/inventory",
    ITEMS: "/api/inventory/items",
    ITEM: (id: string) => `/api/inventory/items/${id}`,
    MOVEMENTS: "/api/inventory/movements",
    STOCK_LEVELS: "/api/inventory/stock-levels",
    MOVEMENT_HISTORY: "/api/inventory/movement-history",
    LOW_STOCK: "/api/inventory/low-stock",
    OUT_OF_STOCK: "/api/inventory/out-of-stock",
    STATISTICS: "/api/inventory/statistics",
    TURNOVER: "/api/inventory/turnover",
  },

  /**
   * Marketing Module
   */
  MARKETING: {
    BASE: "/api/marketing",
    CAMPAIGNS: "/api/marketing/campaigns",
    CAMPAIGN: (id: string) => `/api/marketing/campaigns/${id}`,
    CAMPAIGN_METRICS: (id: string) => `/api/marketing/campaigns/${id}/metrics`,
    CAMPAIGN_LEADS: (id: string) => `/api/marketing/campaigns/${id}/leads`,
    FORMS: "/api/marketing/forms",
    FORM: (id: string) => `/api/marketing/forms/${id}`,
    LANDING_PAGES: "/api/marketing/landing-pages",
    EVENTS: "/api/marketing/events",
    SEGMENTS: "/api/marketing/segments",
    ANALYTICS: "/api/marketing/analytics",
  },

  /**
   * Reporting Module
   */
  REPORTING: {
    BASE: "/api/reporting",
    FINANCIAL: "/api/reporting/financial",
    FINANCIAL_REPORT: (type: string) => `/api/reporting/financial/${type}`,
    SALES: "/api/reporting/sales",
    HR: "/api/reporting/hr",
    INVENTORY: "/api/reporting/inventory",
    AD_HOC: "/api/reporting/ad-hoc",
    SCHEDULED: "/api/reporting/scheduled",
    INSIGHTS: "/api/reporting/insights",
    RECOMMENDATIONS: "/api/reporting/recommendations",
    ANOMALIES: "/api/reporting/anomalies",
    FORECASTS: "/api/reporting/forecasts",
  },

  /**
   * Procurement Module
   */
  PROCUREMENT: {
    BASE: "/api/procurement",
    PURCHASE_ORDERS: "/api/procurement/purchase-orders",
    PURCHASE_ORDER: (id: string) => `/api/procurement/purchase-orders/${id}`,
    SUPPLIERS: "/api/procurement/suppliers",
    SUPPLIER: (id: string) => `/api/procurement/suppliers/${id}`,
    GOODS_RECEIPTS: "/api/procurement/goods-receipts",
    REQUISITIONS: "/api/procurement/requisitions",
  },

  /**
   * Communication Module
   */
  COMMUNICATION: {
    BASE: "/api/communication",
    MESSAGES: "/api/communication/messages",
    MESSAGE: (id: string) => `/api/communication/messages/${id}`,
    NOTIFICATIONS: "/api/communication/notifications",
    TEMPLATES: "/api/communication/templates",
    CALL_LOGS: "/api/communication/call-logs",
  },

  /**
   * Business Module
   */
  BUSINESS: {
    BASE: "/api/business",
    COMPANY: "/api/business/company",
    PROCESSES: "/api/business/processes",
    RISKS: "/api/business/risks",
    COMPLIANCE: "/api/business/compliance",
    ORGANIZATION: "/api/business/organization",
  },

  /**
   * AI & Intelligence
   */
  AI: {
    BASE: "/api/ai",
    ANNOTATOR: "/api/ai-annotator",
    QUICKCHAT: "/api/quickchat",
  },

  /**
   * Additional Services
   */
  CALENDAR: {
    BASE: "/api/calendar",
  },

  DOCUMENTS: {
    BASE: "/api/documents",
  },

  INNOVATION: {
    BASE: "/api/innovation",
  },

  HELP: {
    BASE: "/api/help",
  },

  METRICS: {
    BASE: "/api/metrics",
  },

  SEARCH: {
    BASE: "/api/search",
  },

  DIAGNOSTICS: {
    BASE: "/api/diagnostics",
  },

  FUNCTIONS: {
    BASE: "/api/functions",
  },

  RBAC: {
    BASE: "/api/rbac",
  },

  SETTINGS: {
    BASE: "/api/settings",
  },
} as const;

/**
 * Module Categories for Dashboard Organization
 */
export const MODULE_CATEGORIES = {
  CORE: ["auth", "health", "system", "dashboard"],
  ANALYTICS: ["reporting", "metrics", "search"],
  AI: ["ai", "ai-annotator", "quickchat"],
  BUSINESS: ["crm", "sales", "marketing", "projects"],
  FINANCE: ["finance", "procurement"],
  OPERATIONS: ["production", "warehouse", "inventory"],
  HR: ["hr"],
  SERVICES: ["communication", "calendar", "documents", "help"],
  ADMIN: ["rbac", "settings", "business", "innovation"],
} as const;

/**
 * Widget-to-API mapping
 * Maps dashboard widgets to their respective API endpoints
 */
export const WIDGET_API_MAP = {
  "executive-overview": {
    kpis: API_ROUTES.DASHBOARD.KPIS,
    revenue: API_ROUTES.FINANCE.REVENUE,
    sales: API_ROUTES.SALES.STATISTICS,
    financial: API_ROUTES.REPORTING.FINANCIAL,
  },
  "warnings-escalations": {
    production: API_ROUTES.PRODUCTION.STATISTICS,
    warehouse: API_ROUTES.WAREHOUSE.STATISTICS,
    quality: API_ROUTES.PRODUCTION.QUALITY,
    inventory: API_ROUTES.INVENTORY.LOW_STOCK,
  },
  crm: {
    customers: API_ROUTES.CRM.CUSTOMERS,
    opportunities: API_ROUTES.CRM.OPPORTUNITIES,
    statistics: API_ROUTES.CRM.STATISTICS,
  },
  finance: {
    invoices: API_ROUTES.FINANCE.INVOICES,
    outstanding: API_ROUTES.FINANCE.OUTSTANDING,
    revenue: API_ROUTES.FINANCE.REVENUE,
  },
  sales: {
    pipeline: API_ROUTES.SALES.PIPELINE,
    quotes: API_ROUTES.SALES.QUOTES,
    forecast: API_ROUTES.SALES.FORECAST,
  },
  hr: {
    employees: API_ROUTES.HR.EMPLOYEES,
    leave_requests: API_ROUTES.HR.LEAVE_REQUESTS,
    payroll: API_ROUTES.HR.PAYROLL_SUMMARY,
  },
  projects: {
    list: API_ROUTES.PROJECTS.LIST,
    analytics: API_ROUTES.PROJECTS.ANALYTICS,
  },
  warehouse: {
    stock: API_ROUTES.WAREHOUSE.STOCK,
    movements: API_ROUTES.WAREHOUSE.MOVEMENTS,
    picking: API_ROUTES.WAREHOUSE.PICKING,
  },
  production: {
    planning: API_ROUTES.PRODUCTION.PLANNING,
    orders: API_ROUTES.PRODUCTION.ORDERS,
    machines: API_ROUTES.PRODUCTION.MACHINES,
  },
  inventory: {
    items: API_ROUTES.INVENTORY.ITEMS,
    low_stock: API_ROUTES.INVENTORY.LOW_STOCK,
    statistics: API_ROUTES.INVENTORY.STATISTICS,
  },
  marketing: {
    campaigns: API_ROUTES.MARKETING.CAMPAIGNS,
    analytics: API_ROUTES.MARKETING.ANALYTICS,
  },
  procurement: {
    orders: API_ROUTES.PROCUREMENT.PURCHASE_ORDERS,
    suppliers: API_ROUTES.PROCUREMENT.SUPPLIERS,
  },
} as const;

/**
 * Helper to build full API URL
 */
export function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

/**
 * Helper to get module routes
 */
export function getModuleRoutes(
  module: keyof typeof API_ROUTES,
): Record<string, string> {
  return API_ROUTES[module] as Record<string, string>;
}
