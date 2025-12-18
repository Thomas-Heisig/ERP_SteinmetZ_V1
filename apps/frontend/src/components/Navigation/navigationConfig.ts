// SPDX-License-Identifier: MIT
// apps/frontend/src/components/Navigation/navigationConfig.ts
/**
 * @module NavigationConfig
 * @description Navigationskonfiguration für alle ERP-Module
 */

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  children?: NavigationItem[];
  requiredPermissions?: string[];
  isNew?: boolean;
  isBeta?: boolean;
}

export const navigationStructure: NavigationItem[] = [
  // Main Section
  {
    id: "dashboard",
    label: "sidebar.dashboard",
    icon: "🏠",
    path: "/",
  },
  {
    id: "catalog",
    label: "sidebar.catalog",
    icon: "🧭",
    path: "/catalog",
  },
  {
    id: "calendar",
    label: "sidebar.calendar",
    icon: "📅",
    path: "/calendar",
  },

  // Business Management
  {
    id: "business",
    label: "sidebar.business",
    icon: "💼",
    path: "/company",
    children: [
      {
        id: "company",
        label: "sidebar.company",
        icon: "🏢",
        path: "/company",
      },
      {
        id: "processes",
        label: "sidebar.processes",
        icon: "📋",
        path: "/processes",
      },
      {
        id: "risks",
        label: "sidebar.risk",
        icon: "🛡️",
        path: "/risk",
      },
    ],
  },

  // Finance & Controlling
  {
    id: "finance",
    label: "sidebar.finance",
    icon: "💰",
    path: "/accounting",
    children: [
      {
        id: "accounting",
        label: "sidebar.accounting",
        icon: "💳",
        path: "/accounting",
      },
      {
        id: "controlling",
        label: "sidebar.controlling",
        icon: "📊",
        path: "/controlling",
      },
      {
        id: "treasury",
        label: "sidebar.treasury",
        icon: "🏦",
        path: "/treasury",
      },
      {
        id: "taxes",
        label: "sidebar.taxes",
        icon: "📋",
        path: "/taxes",
      },
    ],
  },

  // Sales & Marketing
  {
    id: "sales",
    label: "sidebar.sales",
    icon: "🤝",
    path: "/crm",
    children: [
      { id: "crm", label: "sidebar.crm", icon: "🤝", path: "/crm" },
      {
        id: "marketing",
        label: "sidebar.marketing",
        icon: "📈",
        path: "/marketing",
      },
      {
        id: "sales-module",
        label: "sidebar.sales",
        icon: "💰",
        path: "/sales",
      },
      {
        id: "fulfillment",
        label: "sidebar.fulfillment",
        icon: "🚚",
        path: "/fulfillment",
      },
    ],
  },

  // Procurement
  {
    id: "procurement",
    label: "sidebar.procurement",
    icon: "📋",
    path: "/purchasing",
    children: [
      {
        id: "purchasing",
        label: "sidebar.purchasing",
        icon: "📋",
        path: "/purchasing",
      },
      {
        id: "receiving",
        label: "sidebar.receiving",
        icon: "📦",
        path: "/receiving",
      },
      {
        id: "suppliers",
        label: "sidebar.suppliers",
        icon: "🤝",
        path: "/suppliers",
      },
    ],
  },

  // Production & Manufacturing
  {
    id: "production",
    label: "sidebar.production",
    icon: "🏭",
    path: "/planning",
    children: [
      {
        id: "planning",
        label: "sidebar.planning",
        icon: "🏗️",
        path: "/planning",
      },
      {
        id: "manufacturing",
        label: "sidebar.manufacturing",
        icon: "⚙️",
        path: "/manufacturing",
      },
      { id: "quality", label: "sidebar.quality", icon: "✅", path: "/quality" },
      {
        id: "maintenance",
        label: "sidebar.maintenance",
        icon: "🔧",
        path: "/maintenance",
      },
    ],
  },

  // Warehouse & Logistics
  {
    id: "warehouse",
    label: "sidebar.warehouse",
    icon: "🏪",
    path: "/inventory",
    children: [
      {
        id: "inventory",
        label: "sidebar.inventory",
        icon: "🏪",
        path: "/inventory",
      },
      { id: "picking", label: "sidebar.picking", icon: "📦", path: "/picking" },
      {
        id: "logistics",
        label: "sidebar.logistics",
        icon: "🚛",
        path: "/logistics",
      },
    ],
  },

  // HR & Personnel
  {
    id: "hr",
    label: "sidebar.hr",
    icon: "👥",
    path: "/personnel",
    children: [
      {
        id: "personnel",
        label: "sidebar.personnel",
        icon: "👤",
        path: "/personnel",
      },
      {
        id: "time-tracking",
        label: "sidebar.timeTracking",
        icon: "⏱️",
        path: "/time-tracking",
      },
      {
        id: "development",
        label: "sidebar.development",
        icon: "📈",
        path: "/development",
      },
      {
        id: "recruiting",
        label: "sidebar.recruiting",
        icon: "💼",
        path: "/recruiting",
      },
    ],
  },

  // Reporting & Analytics
  {
    id: "reporting",
    label: "sidebar.reporting",
    icon: "📊",
    path: "/reports",
    children: [
      { id: "reports", label: "sidebar.reports", icon: "📈", path: "/reports" },
      { id: "adhoc", label: "sidebar.adhoc", icon: "🔍", path: "/adhoc" },
      {
        id: "ai-analytics",
        label: "sidebar.aiAnalytics",
        icon: "🤖",
        path: "/ai-analytics",
      },
    ],
  },

  // Communication & Social
  {
    id: "communication",
    label: "sidebar.communication",
    icon: "💬",
    path: "/email",
    children: [
      { id: "email", label: "sidebar.email", icon: "📧", path: "/email" },
      {
        id: "messaging",
        label: "sidebar.messaging",
        icon: "💬",
        path: "/messaging",
      },
      { id: "social", label: "sidebar.social", icon: "📱", path: "/social" },
    ],
  },

  // AI Tools
  {
    id: "ai",
    label: "sidebar.ai",
    icon: "🤖",
    path: "/ai",
    children: [
      {
        id: "ai-annotator",
        label: "sidebar.aiAnnotator",
        icon: "🤖",
        path: "/ai",
      },
      {
        id: "batch-processing",
        label: "sidebar.batchProcessing",
        icon: "⚙️",
        path: "/batch-processing",
      },
      {
        id: "quality-dashboard",
        label: "sidebar.qualityDashboard",
        icon: "✅",
        path: "/quality-dashboard",
      },
      {
        id: "model-management",
        label: "sidebar.modelManagement",
        icon: "🎯",
        path: "/model-management",
      },
      {
        id: "advanced-filters",
        label: "sidebar.advancedFilters",
        icon: "🔍",
        path: "/advanced-filters",
      },
    ],
  },

  // System & Administration
  {
    id: "system",
    label: "sidebar.system",
    icon: "⚙️",
    path: "/users",
    children: [
      { id: "users", label: "sidebar.users", icon: "👥", path: "/users" },
      {
        id: "system-settings",
        label: "sidebar.systemSettings",
        icon: "⚙️",
        path: "/system-settings",
      },
      {
        id: "integrations",
        label: "sidebar.integrations",
        icon: "🔌",
        path: "/integrations",
      },
    ],
  },

  // Misc
  {
    id: "documents",
    label: "sidebar.documents",
    icon: "📄",
    path: "/documents",
  },
  {
    id: "projects",
    label: "sidebar.projects",
    icon: "📁",
    path: "/projects",
  },
  {
    id: "settings",
    label: "sidebar.settings",
    icon: "⚙️",
    path: "/settings",
  },
  {
    id: "help",
    label: "sidebar.help",
    icon: "❓",
    path: "/help",
  },
];
