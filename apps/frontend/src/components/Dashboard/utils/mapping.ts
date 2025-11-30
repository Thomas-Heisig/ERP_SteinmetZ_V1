// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/utils/mapping.ts

import type { 
  NodeType, 
  HealthLevel, 
  HealthStatus,
  SearchFilter,
  ViewMode,
  UITheme 
} from "../types";

// ============================================================================
// Type Definitions
// ============================================================================

export interface HealthColorSet {
  primary: string;
  secondary: string;
  light: string;
  dark: string;
  /** CSS class for styling */
  className: string;
}

export interface NodeIconSet {
  emoji: string;
  material: string;
  lucide: string;
  /** SVG path data for custom icons */
  svgPath?: string;
  description: string;
}

export interface CategoryColor {
  primary: string;
  secondary: string;
  text: string;
  /** CSS class for styling */
  className: string;
}

export interface I18nLabel {
  de: string;
  en: string;
  fr?: string;
  es?: string;
  description: string;
}

export interface ThemeColorSet {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  error?: string;
  warning?: string;
  success?: string;
  info?: string;
}

// ============================================================================
// Health Status Mapping
// ============================================================================

/**
 * Comprehensive health status color mapping with CSS classes
 */
export const healthColorMap: Record<HealthLevel, HealthColorSet> = {
  HEALTHY: {
    primary: "#2e7d32",
    secondary: "#4caf50", 
    light: "#e8f5e9",
    dark: "#1b5e20",
    className: "health-status-healthy"
  },
  DEGRADED: {
    primary: "#f9a825",
    secondary: "#fbc02d",
    light: "#fff8e1",
    dark: "#f57f17",
    className: "health-status-degraded"
  },
  UNHEALTHY: {
    primary: "#c62828",
    secondary: "#d32f2f",
    light: "#ffebee",
    dark: "#b71c1c",
    className: "health-status-unhealthy"
  },
  UNKNOWN: {
    primary: "#757575",
    secondary: "#9e9e9e",
    light: "#f5f5f5",
    dark: "#424242",
    className: "health-status-unknown"
  }
};

/**
 * Health status priority for sorting and comparison
 */
export const healthStatusPriority: Record<HealthLevel, number> = {
  UNHEALTHY: 0,
  DEGRADED: 1,
  UNKNOWN: 2,
  HEALTHY: 3
};

// ============================================================================
// Node Type Mapping
// ============================================================================

/**
 * Comprehensive node type icon mapping with multiple icon sets
 */
export const nodeIconMap: Record<NodeType, NodeIconSet> = {
  CARD: {
    emoji: "📄",
    material: "dashboard",
    lucide: "LayoutDashboard",
    svgPath: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    description: "Card widget for displaying information"
  },
  CHART: {
    emoji: "📊",
    material: "analytics",
    lucide: "BarChart3",
    svgPath: "M2 12h4v8H2zM8 8h4v12H8zM14 4h4v16h-4z",
    description: "Chart widget for data visualization"
  },
  TABLE: {
    emoji: "📋",
    material: "table_chart",
    lucide: "Table",
    svgPath: "M3 3h18v18H3V3zm2 2v4h14V5H5zm14 6H5v2h14v-2zm0 4H5v2h14v-2zm0 4H5v2h14v-2z",
    description: "Table widget for structured data"
  },
  FORM: {
    emoji: "📝",
    material: "description",
    lucide: "FileText",
    svgPath: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm0 2l6 6h-6V4zm-2 12H8v-2h4v2zm4-4H8v-2h8v2z",
    description: "Form widget for data input"
  },
  CUSTOM: {
    emoji: "⚙️",
    material: "widgets",
    lucide: "Settings",
    svgPath: "M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5zm7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.5 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.66.07.97l-2.11 1.66c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.23.09.5 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z",
    description: "Custom widget with specialized functionality"
  },
  CATEGORY: {
    emoji: "📁",
    material: "folder",
    lucide: "Folder",
    svgPath: "M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z",
    description: "Category container for organizing nodes"
  },
  ROOT: {
    emoji: "🏠",
    material: "home",
    lucide: "Home",
    svgPath: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
    description: "Root level node"
  }
};

/**
 * Node type priority for sorting and organization
 */
export const nodeTypePriority: Record<NodeType, number> = {
  ROOT: 0,
  CATEGORY: 1,
  CARD: 2,
  TABLE: 3,
  CHART: 4,
  FORM: 5,
  CUSTOM: 6
};

// ============================================================================
// Category Color Palette
// ============================================================================

/**
 * Extended color palette for categories with accessibility support
 */
export const categoryColorPalette: CategoryColor[] = [
  { primary: "#1976d2", secondary: "#42a5f5", text: "#ffffff", className: "category-blue" },
  { primary: "#0288d1", secondary: "#29b6f6", text: "#ffffff", className: "category-light-blue" },
  { primary: "#00796b", secondary: "#26a69a", text: "#ffffff", className: "category-teal" },
  { primary: "#388e3c", secondary: "#66bb6a", text: "#ffffff", className: "category-green" },
  { primary: "#f57c00", secondary: "#ff9800", text: "#000000", className: "category-orange" },
  { primary: "#d32f2f", secondary: "#ef5350", text: "#ffffff", className: "category-red" },
  { primary: "#7b1fa2", secondary: "#ab47bc", text: "#ffffff", className: "category-purple" },
  { primary: "#512da8", secondary: "#7e57c2", text: "#ffffff", className: "category-deep-purple" },
  { primary: "#c2185b", secondary: "#ec407a", text: "#ffffff", className: "category-pink" },
  { primary: "#0097a7", secondary: "#26c6da", text: "#000000", className: "category-cyan" },
  { primary: "#5d4037", secondary: "#8d6e63", text: "#ffffff", className: "category-brown" },
  { primary: "#455a64", secondary: "#78909c", text: "#ffffff", className: "category-blue-grey" }
];

// ============================================================================
// Internationalization Labels
// ============================================================================

/**
 * Comprehensive node type labels with multi-language support
 */
export const nodeTypeLabelMap: Record<NodeType, I18nLabel> = {
  CARD: { 
    de: "Karte", 
    en: "Card",
    fr: "Carte",
    es: "Tarjeta",
    description: "Basic card widget for displaying information"
  },
  CHART: { 
    de: "Diagramm", 
    en: "Chart",
    fr: "Graphique",
    es: "Gráfico",
    description: "Chart widget for data visualization"
  },
  TABLE: { 
    de: "Tabelle", 
    en: "Table",
    fr: "Tableau",
    es: "Tabla",
    description: "Table widget for structured data"
  },
  FORM: { 
    de: "Formular", 
    en: "Form",
    fr: "Formulaire",
    es: "Formulario",
    description: "Form widget for data input"
  },
  CUSTOM: { 
    de: "Benutzerdefiniert", 
    en: "Custom",
    fr: "Personnalisé",
    es: "Personalizado",
    description: "Custom widget with specialized functionality"
  },
  CATEGORY: {
    de: "Kategorie",
    en: "Category",
    fr: "Catégorie",
    es: "Categoría",
    description: "Category container for organizing nodes"
  },
  ROOT: {
    de: "Stamm",
    en: "Root",
    fr: "Racine",
    es: "Raíz",
    description: "Root level node"
  }
};

/**
 * Search filter labels with descriptions
 */
export const searchFilterMap: Record<SearchFilter, I18nLabel> = {
  category: {
    de: "Kategorie",
    en: "Category",
    fr: "Catégorie",
    es: "Categoría",
    description: "Filter by category"
  },
  type: {
    de: "Typ",
    en: "Type",
    fr: "Type",
    es: "Tipo",
    description: "Filter by node type"
  },
  tag: {
    de: "Tag",
    en: "Tag",
    fr: "Étiquette",
    es: "Etiqueta",
    description: "Filter by tags"
  },
  date: {
    de: "Datum",
    en: "Date",
    fr: "Date",
    es: "Fecha",
    description: "Filter by date range"
  }
};

/**
 * View mode labels with descriptions
 */
export const viewModeMap: Record<ViewMode, I18nLabel> = {
  VIEW: {
    de: "Ansicht",
    en: "View",
    fr: "Vue",
    es: "Vista",
    description: "View mode - read only"
  },
  EDIT: {
    de: "Bearbeiten", 
    en: "Edit",
    fr: "Éditer",
    es: "Editar",
    description: "Edit mode - full editing capabilities"
  },
  PREVIEW: {
    de: "Vorschau",
    en: "Preview",
    fr: "Aperçu",
    es: "Vista previa",
    description: "Preview mode - see changes before saving"
  }
};

// ============================================================================
// Theme Color Mapping
// ============================================================================

/**
 * Comprehensive theme color mapping with semantic colors
 */
export const themeColorMap: Record<UITheme['mode'], ThemeColorSet> = {
  LIGHT: {
    primary: "#1976d2",
    secondary: "#dc004e", 
    background: "#ffffff",
    surface: "#f5f5f5",
    text: "#212121",
    textSecondary: "#757575",
    error: "#d32f2f",
    warning: "#f57c00",
    success: "#388e3c",
    info: "#0288d1"
  },
  DARK: {
    primary: "#90caf9",
    secondary: "#f48fb1",
    background: "#121212", 
    surface: "#1e1e1e",
    text: "#ffffff",
    textSecondary: "#b0b0b0",
    error: "#f44336",
    warning: "#ff9800",
    success: "#4caf50",
    info: "#29b6f6"
  },
  AUTO: {
    primary: "#1976d2",
    secondary: "#dc004e",
    background: "var(--background, #ffffff)",
    surface: "var(--surface, #f5f5f5)", 
    text: "var(--text, #212121)",
    textSecondary: "var(--text-secondary, #757575)",
    error: "var(--error, #d32f2f)",
    warning: "var(--warning, #f57c00)",
    success: "var(--success, #388e3c)",
    info: "var(--info, #0288d1)"
  }
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get deterministic color for category ID with improved distribution
 */
export function getCategoryColor(categoryId: string): CategoryColor {
  const hash = [...categoryId].reduce((sum, ch) => {
    return ((sum << 5) - sum) + ch.charCodeAt(0);
  }, 0);
  
  const index = Math.abs(hash) % categoryColorPalette.length;
  return categoryColorPalette[index];
}

/**
 * Get node type label with language support and fallback
 */
export function getNodeTypeLabel(type: NodeType, language: string = 'de'): string {
  const label = nodeTypeLabelMap[type];
  const supportedLanguages = ['de', 'en', 'fr', 'es'] as const;
  const lang = supportedLanguages.includes(language as any) ? language as keyof I18nLabel : 'de';
  
  return label?.[lang] || label.de || type;
}

/**
 * Get node icon based on icon set with fallback
 */
export function getNodeIcon(type: NodeType, iconSet: 'emoji' | 'material' | 'lucide' | 'svgPath' = 'emoji'): string {
  const icon = nodeIconMap[type];
  if (iconSet === 'svgPath') {
    return icon?.svgPath || icon?.emoji || '❓';
  }
  return icon?.[iconSet as 'emoji' | 'material' | 'lucide'] || icon?.emoji || '❓';
}

/**
 * Convert health status to simplified health level
 */
export function simplifyHealthStatus(status: HealthStatus | string): HealthLevel {
  const statusMap: Record<string, HealthLevel> = {
    'healthy': 'HEALTHY',
    'degraded': 'DEGRADED',
    'unhealthy': 'UNHEALTHY',
    'checking': 'UNKNOWN'
  };
  
  return statusMap[status.toLowerCase()] || 'UNKNOWN';
}

/**
 * Get colors for health status with fallback
 */
export function getHealthColors(status: HealthStatus | HealthLevel): HealthColorSet {
  const level: HealthLevel = typeof status === 'string' 
    ? simplifyHealthStatus(status)
    : status;
    
  return healthColorMap[level] || healthColorMap.UNKNOWN;
}

/**
 * Compare health statuses for sorting (worst first)
 */
export function compareHealthStatus(a: HealthLevel, b: HealthLevel): number {
  return healthStatusPriority[a] - healthStatusPriority[b];
}

/**
 * Get search filter label with language support
 */
export function getSearchFilterLabel(filter: SearchFilter, language: string = 'de'): string {
  const label = searchFilterMap[filter];
  return label?.[language as keyof I18nLabel] as string || label?.de || String(filter);
}

/**
 * Get view mode label with language support
 */
export function getViewModeLabel(mode: ViewMode, language: string = 'de'): string {
  const label = viewModeMap[mode];
  return label?.[language as keyof I18nLabel] as string || label?.de || String(mode);
}

/**
 * Generate consistent color from string with HSL for better distribution
 */
export function generateColorFromString(
  str: string, 
  saturation: number = 70, 
  lightness: number = 60
): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Normalize category color with text contrast calculation
 */
export function normalizeCategoryColor(color: string | CategoryColor): CategoryColor {
  if (typeof color === 'string') {
    // Calculate text color based on background brightness
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Relative luminance calculation for accessibility
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const textColor = luminance > 0.5 ? '#000000' : '#ffffff';
    
    return {
      primary: color,
      secondary: color,
      text: textColor,
      className: `category-custom-${color.replace('#', '')}`
    };
  }
  
  return color;
}

/**
 * Get CSS class for health status
 */
export function getHealthStatusClass(status: HealthStatus | HealthLevel): string {
  const level = typeof status === 'string' ? simplifyHealthStatus(status) : status;
  return healthColorMap[level]?.className || 'health-status-unknown';
}

/**
 * Check if color is light (for text contrast decisions)
 */
export function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}