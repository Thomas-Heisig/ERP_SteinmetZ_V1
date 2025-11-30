// SPDX-License-Identifier: MIT
// src/components/Dashboard/core/DashboardState.ts

/**
 * Typisierte Struktur des Dashboard-Zustands.
 */

import type {
  NodeDetail,
  SearchResult,
  SearchFilter,
  HealthStatus,
} from "../types";

/* ============================================================
   Navigation
   ============================================================ */
export interface DashboardNavigationState {
  selectedId: string | null;
  stack: NodeDetail[];
  canGoBack: boolean;
  canGoForward: boolean;
}

/* ============================================================
   Suche
   ============================================================ */
export interface DashboardSearchState {
  query: string;
  active: boolean;
  loading: boolean;
  results: SearchResult[];
  filter: SearchFilter;
}

/* ============================================================
   Health Monitoring
   ============================================================ */
export interface DashboardHealthState {
  status: HealthStatus;
  lastChecked?: string;
  responseTime?: number;
  version?: string;
}

/* ============================================================
   UI
   ============================================================ */
export interface DashboardUIState {
  chatOpen: boolean;
  currentTime: Date;
  searchOverlayVisible: boolean;
  layout: "mobile" | "tablet" | "desktop";
}

/* ============================================================
   Catalog
   ============================================================ */
export interface DashboardCatalogState {
  roots: NodeDetail[];
  rootsLoading: boolean;
  rootsError: unknown;

  node: NodeDetail | null;
  nodeLoading: boolean;
  nodeError: unknown;
}

/* ============================================================
   Builder / Widgets
   ============================================================ */
export interface DashboardBuilderState {
  renderedWidgets: unknown[];
  activeLayout?: string;
  widgets: string[];
  activeForm?: {
    schema: Record<string, unknown>;
    values: Record<string, unknown>;
    valid: boolean;
  };
}

/* ============================================================
   Settings
   ============================================================ */
export interface DashboardSettingsState {
  language: string;
  theme: "light" | "dark" | "lcars";
}

/* ============================================================
   Gesamtstate
   ============================================================ */
export interface DashboardState {
  navigation: DashboardNavigationState;
  search: DashboardSearchState;
  health: DashboardHealthState;
  ui: DashboardUIState;
  catalog: DashboardCatalogState;
  builder: DashboardBuilderState;
  settings: DashboardSettingsState;
}

/* ============================================================
   Initialzustand
   ============================================================ */
export const initialDashboardState: DashboardState = {
  navigation: {
    selectedId: null,
    stack: [],
    canGoBack: false,
    canGoForward: false,
  },

  search: {
    query: "",
    active: false,
    loading: false,
    results: [],
    filter: "category",
  },

  health: {
    status: "checking",
  },

  ui: {
    chatOpen: false,
    currentTime: new Date(),
    searchOverlayVisible: false,
    layout: "desktop",
  },

  catalog: {
    roots: [],
    rootsLoading: false,
    rootsError: null,
    node: null,
    nodeLoading: false,
    nodeError: null,
  },

  builder: {
    renderedWidgets: [],
    widgets: [],
  },

  settings: {
    language: "de",
    theme: "light",
  },
};