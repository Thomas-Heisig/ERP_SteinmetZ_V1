// SPDX-License-Identifier: MIT
// src/components/Dashboard/core/dashboardReducer.ts

import type {
  DashboardState,
  DashboardAction,
  NodeDetail,
  SearchResult,
  SearchFilters,
  DashboardConfig,
  NodeType,
} from "../../Dashboard/types";

/**
 * Dashboard-Reducer – kompatibel zur neuen types.ts
 */
export function dashboardReducer(
  state: DashboardState,
  action: DashboardAction,
): DashboardState {
  switch (action.type) {
    // ============================================================
    // ROOTS
    // ============================================================
    case "LOAD_ROOTS_START":
      return {
        ...state,
        catalog: {
          ...state.catalog,
          rootsLoading: true,
          rootsError: null,
        },
      };

    case "LOAD_ROOTS_SUCCESS":
      return {
        ...state,
        catalog: {
          ...state.catalog,
          roots: normalizeNodes(action.payload),
          rootsLoading: false,
          rootsError: null,
          lastUpdated: new Date(),
        },
      };

    case "LOAD_ROOTS_ERROR":
      return {
        ...state,
        catalog: {
          ...state.catalog,
          rootsLoading: false,
          rootsError: action.payload,
          lastUpdated: new Date(),
        },
      };

    // ============================================================
    // NODE
    // ============================================================

    case "SELECT_NODE": {
      const cachedNode = state.cache.nodes[action.payload];
      const rootNode = state.catalog.roots.find((r) => r.id === action.payload);

      return {
        ...state,
        catalog: {
          ...state.catalog,
          selectedNodeId: action.payload,
          node: cachedNode || rootNode || null,
        },
      };
    }

    case "LOAD_NODE_START":
      return {
        ...state,
        catalog: {
          ...state.catalog,
          nodeLoading: true,
          nodeError: null,
        },
      };

    case "LOAD_NODE_SUCCESS": {
      const normalized = normalizeNode(action.payload);

      return {
        ...state,
        catalog: {
          ...state.catalog,
          node: normalized,
          nodeLoading: false,
          nodeError: null,
        },
        cache: {
          ...state.cache,
          nodes: {
            ...state.cache.nodes,
            [normalized.id]: normalized,
          },
        },
      };
    }

    case "LOAD_NODE_ERROR":
      return {
        ...state,
        catalog: {
          ...state.catalog,
          nodeLoading: false,
          nodeError: action.payload,
        },
      };

    // ============================================================
    // SEARCH
    // ============================================================
    case "SET_SEARCH_QUERY":
      return {
        ...state,
        search: {
          ...state.search,
          query: action.payload,
          ...(action.payload === "" ? { active: false, isOpen: false } : {}),
        },
      };

    case "SET_SEARCH_FILTERS":
      return {
        ...state,
        search: {
          ...state.search,
          filters: normalizeSearchFilters(action.payload),
        },
      };

    case "SET_SEARCH_ACTIVE":
      return {
        ...state,
        search: {
          ...state.search,
          active: action.payload,
          isOpen: action.payload,
          ...(!action.payload ? { results: [] } : {}),
        },
      };

    case "SEARCH_START":
      return {
        ...state,
        search: {
          ...state.search,
          isLoading: true,
        },
      };

    case "SEARCH_SUCCESS":
      return {
        ...state,
        search: {
          ...state.search,
          query: action.payload.query,
          results: normalizeSearchResults(action.payload.results),
          isLoading: false,
          lastSearch: new Date(),
        },
      };

    case "SEARCH_CLEAR":
      return {
        ...state,
        search: {
          ...state.search,
          query: "",
          results: [],
          isOpen: false,
          active: false,
          isLoading: false,
        },
      };

    // ============================================================
    // NAVIGATION
    // ============================================================
    case "NAV_PUSH":
      return {
        ...state,
        navigation: {
          ...state.navigation,
          history: [...state.navigation.history, action.payload],
          currentIndex: state.navigation.history.length,
          currentView: action.payload.view,
          canGoBack: true,
          canGoForward: false,
        },
      };

    case "NAV_POP": {
      if (state.navigation.currentIndex <= 0) return state;

      const newIndex = state.navigation.currentIndex - 1;
      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentIndex: newIndex,
          currentView: state.navigation.history[newIndex].view,
          canGoBack: newIndex > 0,
          canGoForward: true,
        },
      };
    }

    case "NAV_CLEAR":
      return {
        ...state,
        navigation: {
          selectedId: null,
          stack: [],
          history: [],
          currentIndex: -1,
          currentView: "root",
          canGoBack: false,
          canGoForward: false,
        },
      };

    // ============================================================
    // HEALTH
    // ============================================================
    case "SET_HEALTH_STATUS":
    case "HEALTH_UPDATE":
      return {
        ...state,
        health: {
          ...state.health,
          ...action.payload,
          lastChecked: new Date().toISOString(),
        },
      };

    // ============================================================
    // UI
    // ============================================================

    case "SET_THEME":
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: action.payload, // "light" | "dark" | "lcars"
        },
        // ui.theme existiert, aber muss ein UITheme-Objekt sein → nicht automatisch setzen
      };

    case "SET_LANGUAGE":
      return {
        ...state,
        settings: {
          ...state.settings,
          language: action.payload,
        },
        ui: {
          ...state.ui,
          language: action.payload,
        },
      };

    case "TOGGLE_CHAT":
      return {
        ...state,
        ui: {
          ...state.ui,
          chatOpen: !state.ui.chatOpen,
          quickChatOpen: !state.ui.quickChatOpen,
        },
      };

    case "SET_LAYOUT_MODE":
      return {
        ...state,
        ui: {
          ...state.ui,
          layout: action.payload,
          layoutMode: action.payload,
        },
      };

    // ============================================================
    // LOADING
    // ============================================================
    case "SET_LOADING":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };

    // ============================================================
    // ERRORS
    // ============================================================
    case "SET_ERROR":
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value,
          lastError: {
            key: action.payload.key,
            value: action.payload.value,
            timestamp: new Date(),
          },
        },
      };

    case "CLEAR_ERRORS":
      return {
        ...state,
        errors: {
          roots: null,
          node: null,
          search: null,
          health: null,
          provider: null,
        },
      };

    // ============================================================
    // CACHE
    // ============================================================
    case "CACHE_SET_NODE": {
      const cached = normalizeNode(action.payload);
      return {
        ...state,
        cache: {
          ...state.cache,
          nodes: {
            ...state.cache.nodes,
            [cached.id]: cached,
          },
          lastUpdated: new Date(),
        },
      };
    }

    // ============================================================
    // CONFIG
    // ============================================================
    case "SET_CONFIG": {
      // Falls keine Vollkonfiguration existiert, sichere Defaults setzen
      const defaultConfig: DashboardConfig = {
        version: state.config?.version ?? "0.0.0",
        permissions: state.config?.permissions ?? [],
        features: state.config?.features ?? {
          search: false,
          healthMonitoring: false,
          customWidgets: false,
          advancedLayout: false,
          realTimeUpdates: false,
        },
        dataSources: state.config?.dataSources ?? [],
        security: state.config?.security ?? {
          encryption: { algorithm: "", key: "", enabled: false },
          sessionTimeout: 0,
          allowedOrigins: [],
          cors: {
            allowedOrigins: [],
            allowedMethods: [],
            allowedHeaders: [],
          },
        },
      };

      return {
        ...state,
        config: {
          ...defaultConfig,
          ...action.payload,
        },
      };
    }

    // ============================================================
    // SYSTEM INFO
    // ============================================================
    case "SET_SYSTEM_INFO":
      return {
        ...state,
        system: {
          ...state.system,
          ...action.payload,
        },
      };

    // ============================================================
    // BUILDER / LAYOUT
    // ============================================================
    case "SET_LAYOUT":
      return {
        ...state,
        builder: {
          ...state.builder,
          activeLayout: action.payload.type, // optional, falls benötigt
          layout: action.payload, // vollständiges DashboardLayout
        },
      };

    // ============================================================
    // DEFAULT
    // ============================================================
    default:
      return state;
  }
}

//
// ─── HELPER ─────────────────────────────────────────────────────────────
//

function normalizeNode(node: unknown): NodeDetail {
  const n = node as Record<string, unknown>;
  return {
    ...n,
    id: String(n.id),
    tags: Array.isArray(n.tags) ? n.tags : [],
    metadata: {
      ...(n.metadata as Record<string, unknown>),
      createdAt:
        (n.metadata as Record<string, unknown>)?.createdAt || new Date(),
      updatedAt:
        (n.metadata as Record<string, unknown>)?.updatedAt || new Date(),
    },
    createdAt: n.createdAt || new Date(),
    updatedAt: n.updatedAt || new Date(),
  } as NodeDetail;
}

function normalizeNodes(nodes: unknown[]): NodeDetail[] {
  return Array.isArray(nodes) ? nodes.map(normalizeNode) : [];
}

function normalizeSearchFilters(filters: unknown): SearchFilters {
  const f = filters as Record<string, unknown>;
  const dateRangeRaw = f?.dateRange as Record<string, unknown> | undefined;
  const dateRange = dateRangeRaw
    ? {
        from: new Date(dateRangeRaw.from as string | number | Date),
        to: new Date(dateRangeRaw.to as string | number | Date),
      }
    : undefined;

  return {
    categories: (f?.categories as string[]) ?? [],
    nodeTypes: (f?.nodeTypes as NodeType[]) ?? [],
    tags: (f?.tags as string[]) ?? [],
    dateRange,
  };
}

function normalizeSearchResults(results: unknown[]): SearchResult[] {
  return Array.isArray(results)
    ? results.map((r) => {
        const result = r as Record<string, unknown>;
        return {
          ...result,
          id: String(result.id),
          relevance: (result.relevance as number) ?? 1,
          metadata: {
            ...(result.metadata as Record<string, unknown>),
            lastModified:
              (result.metadata as Record<string, unknown>)?.lastModified ||
              new Date(),
          },
        } as SearchResult;
      })
    : [];
}
