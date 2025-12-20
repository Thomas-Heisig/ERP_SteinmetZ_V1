// SPDX-License-Identifier: MIT
// apps/frontend/src/config/dashboardConfig.ts
/**
 * Dashboard Configuration
 * 
 * Consolidated dashboard configuration matching backend API structure.
 * Replaces duplicate configurations in Dashboard and DashboardWidgets components.
 */

import { API_ROUTES, WIDGET_API_MAP, MODULE_CATEGORIES } from "./apiRoutes";

/**
 * Dashboard Widget Configuration
 */
export interface DashboardWidget {
  id: string;
  title: string;
  type: "kpi" | "chart" | "table" | "list" | "calendar" | "executive" | "warnings";
  module: string;
  apiEndpoints: string[];
  refreshInterval?: number; // in seconds
  gridSpan?: number; // 1-4 columns
  priority?: number; // display order
  permissions?: string[]; // required permissions
}

/**
 * Available Dashboard Widgets
 */
export const DASHBOARD_WIDGETS: Record<string, DashboardWidget> = {
  EXECUTIVE_OVERVIEW: {
    id: "executive-overview",
    title: "Executive Overview",
    type: "executive",
    module: "dashboard",
    apiEndpoints: [
      API_ROUTES.DASHBOARD.KPIS,
      API_ROUTES.FINANCE.REVENUE,
      API_ROUTES.SALES.STATISTICS,
      API_ROUTES.REPORTING.FINANCIAL,
    ],
    refreshInterval: 300, // 5 minutes
    gridSpan: 4,
    priority: 1,
  },

  WARNINGS_ESCALATIONS: {
    id: "warnings-escalations",
    title: "Warnings & Escalations",
    type: "warnings",
    module: "dashboard",
    apiEndpoints: [
      API_ROUTES.PRODUCTION.STATISTICS,
      API_ROUTES.WAREHOUSE.STATISTICS,
      API_ROUTES.PRODUCTION.QUALITY,
      API_ROUTES.INVENTORY.LOW_STOCK,
    ],
    refreshInterval: 60, // 1 minute
    gridSpan: 4,
    priority: 2,
  },

  CRM_WIDGET: {
    id: "crm-widget",
    title: "CRM Overview",
    type: "kpi",
    module: "crm",
    apiEndpoints: [
      API_ROUTES.CRM.STATISTICS,
      API_ROUTES.CRM.OPPORTUNITIES,
    ],
    refreshInterval: 180,
    gridSpan: 2,
    priority: 10,
    permissions: ["crm:read"],
  },

  FINANCE_WIDGET: {
    id: "finance-widget",
    title: "Finance Dashboard",
    type: "kpi",
    module: "finance",
    apiEndpoints: [
      API_ROUTES.FINANCE.STATISTICS,
      API_ROUTES.FINANCE.OUTSTANDING,
      API_ROUTES.FINANCE.REVENUE,
    ],
    refreshInterval: 300,
    gridSpan: 2,
    priority: 11,
    permissions: ["finance:read"],
  },

  SALES_WIDGET: {
    id: "sales-widget",
    title: "Sales Pipeline",
    type: "chart",
    module: "sales",
    apiEndpoints: [
      API_ROUTES.SALES.PIPELINE,
      API_ROUTES.SALES.FORECAST,
    ],
    refreshInterval: 180,
    gridSpan: 2,
    priority: 12,
    permissions: ["sales:read"],
  },

  HR_WIDGET: {
    id: "hr-widget",
    title: "HR Overview",
    type: "kpi",
    module: "hr",
    apiEndpoints: [
      API_ROUTES.HR.EMPLOYEES,
      API_ROUTES.HR.LEAVE_REQUESTS,
      API_ROUTES.HR.PAYROLL_SUMMARY,
    ],
    refreshInterval: 300,
    gridSpan: 2,
    priority: 13,
    permissions: ["hr:read"],
  },

  PROJECTS_WIDGET: {
    id: "projects-widget",
    title: "Active Projects",
    type: "list",
    module: "projects",
    apiEndpoints: [
      API_ROUTES.PROJECTS.LIST,
      API_ROUTES.PROJECTS.ANALYTICS,
    ],
    refreshInterval: 180,
    gridSpan: 2,
    priority: 14,
    permissions: ["projects:read"],
  },

  WAREHOUSE_WIDGET: {
    id: "warehouse-widget",
    title: "Warehouse Operations",
    type: "kpi",
    module: "warehouse",
    apiEndpoints: [
      API_ROUTES.WAREHOUSE.STATISTICS,
      API_ROUTES.WAREHOUSE.STOCK,
    ],
    refreshInterval: 120,
    gridSpan: 2,
    priority: 15,
    permissions: ["warehouse:read"],
  },

  PRODUCTION_WIDGET: {
    id: "production-widget",
    title: "Production Overview",
    type: "chart",
    module: "production",
    apiEndpoints: [
      API_ROUTES.PRODUCTION.STATISTICS,
      API_ROUTES.PRODUCTION.PLANNING,
    ],
    refreshInterval: 120,
    gridSpan: 2,
    priority: 16,
    permissions: ["production:read"],
  },

  INVENTORY_WIDGET: {
    id: "inventory-widget",
    title: "Inventory Status",
    type: "kpi",
    module: "inventory",
    apiEndpoints: [
      API_ROUTES.INVENTORY.STATISTICS,
      API_ROUTES.INVENTORY.LOW_STOCK,
    ],
    refreshInterval: 180,
    gridSpan: 2,
    priority: 17,
    permissions: ["inventory:read"],
  },

  MARKETING_WIDGET: {
    id: "marketing-widget",
    title: "Marketing Campaigns",
    type: "chart",
    module: "marketing",
    apiEndpoints: [
      API_ROUTES.MARKETING.ANALYTICS,
      API_ROUTES.MARKETING.CAMPAIGNS,
    ],
    refreshInterval: 300,
    gridSpan: 2,
    priority: 18,
    permissions: ["marketing:read"],
  },

  PROCUREMENT_WIDGET: {
    id: "procurement-widget",
    title: "Procurement",
    type: "list",
    module: "procurement",
    apiEndpoints: [
      API_ROUTES.PROCUREMENT.PURCHASE_ORDERS,
      API_ROUTES.PROCUREMENT.SUPPLIERS,
    ],
    refreshInterval: 180,
    gridSpan: 2,
    priority: 19,
    permissions: ["procurement:read"],
  },

  REPORTING_WIDGET: {
    id: "reporting-widget",
    title: "Business Insights",
    type: "chart",
    module: "reporting",
    apiEndpoints: [
      API_ROUTES.REPORTING.INSIGHTS,
      API_ROUTES.REPORTING.RECOMMENDATIONS,
    ],
    refreshInterval: 600, // 10 minutes
    gridSpan: 3,
    priority: 20,
    permissions: ["reporting:read"],
  },
};

/**
 * Default Dashboard Layout
 */
export const DEFAULT_DASHBOARD_LAYOUT = {
  mode: "grid",
  columns: 4,
  gap: 20,
  widgets: [
    "executive-overview",
    "warnings-escalations",
    "crm-widget",
    "finance-widget",
    "sales-widget",
    "hr-widget",
    "projects-widget",
    "warehouse-widget",
    "production-widget",
    "inventory-widget",
    "marketing-widget",
    "procurement-widget",
  ],
};

/**
 * Dashboard Themes
 */
export const DASHBOARD_THEMES = {
  light: {
    background: "#f5f5f5",
    surface: "#ffffff",
    primary: "#1976d2",
    secondary: "#dc004e",
    text: "#333333",
    border: "#e0e0e0",
  },
  dark: {
    background: "#121212",
    surface: "#1e1e1e",
    primary: "#90caf9",
    secondary: "#f48fb1",
    text: "#ffffff",
    border: "#424242",
  },
  lcars: {
    background: "#000000",
    surface: "#111111",
    primary: "#ff9900",
    secondary: "#9999ff",
    text: "#ffcc99",
    border: "#664400",
  },
} as const;

/**
 * Dashboard Refresh Intervals (in seconds)
 */
export const REFRESH_INTERVALS = {
  REALTIME: 10,
  FAST: 30,
  NORMAL: 60,
  SLOW: 180,
  VERY_SLOW: 300,
} as const;

/**
 * Dashboard Grid Configuration
 */
export const GRID_CONFIG = {
  BREAKPOINTS: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  },
  COLUMNS: {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    "2xl": 4,
  },
  GAP: {
    xs: 10,
    sm: 15,
    md: 20,
    lg: 20,
    xl: 20,
    "2xl": 24,
  },
} as const;

/**
 * Module Icons Mapping
 */
export const MODULE_ICONS = {
  dashboard: "📊",
  crm: "👥",
  finance: "💰",
  sales: "📈",
  hr: "👨‍💼",
  projects: "📁",
  warehouse: "📦",
  production: "🏭",
  inventory: "📋",
  marketing: "📣",
  procurement: "🛒",
  reporting: "📊",
  communication: "💬",
  business: "🏢",
  ai: "🤖",
  calendar: "📅",
  documents: "📄",
  help: "❓",
} as const;

/**
 * Widget Status Colors
 */
export const STATUS_COLORS = {
  healthy: "#4caf50",
  warning: "#ff9800",
  critical: "#f44336",
  info: "#2196f3",
  unknown: "#9e9e9e",
} as const;

/**
 * Export helper functions
 */
export function getWidgetConfig(widgetId: string): DashboardWidget | undefined {
  return Object.values(DASHBOARD_WIDGETS).find((w) => w.id === widgetId);
}

export function getWidgetsByModule(module: string): DashboardWidget[] {
  return Object.values(DASHBOARD_WIDGETS).filter((w) => w.module === module);
}

export function getWidgetsByPermissions(permissions: string[]): DashboardWidget[] {
  return Object.values(DASHBOARD_WIDGETS).filter((widget) => {
    if (!widget.permissions || widget.permissions.length === 0) return true;
    return widget.permissions.some((perm) => permissions.includes(perm));
  });
}

export function sortWidgetsByPriority(widgets: DashboardWidget[]): DashboardWidget[] {
  return [...widgets].sort((a, b) => (a.priority || 999) - (b.priority || 999));
}
