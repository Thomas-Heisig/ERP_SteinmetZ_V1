// SPDX-License-Identifier: MIT
// src/components/Dashboard/core/DashboardProvider.tsx

import React, { useReducer, useEffect, useMemo } from "react";

import { DashboardContext } from "./DashboardContext";
import { dashboardReducer } from "./dashboardReducer";
import { initialDashboardState } from "../types";

import type {
  DashboardState,
  DashboardAction,
  DashboardConfig,
  NodeDetail,
} from "../types";

import { useTheme } from "../../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { useSystemInfo } from "../../../hooks/useSystemInfo";
import { safeGet } from "../utils/safeFetch";

export interface DashboardProviderProps {
  backendUrl?: string; // aktuell nicht mehr für Health genutzt
  initialNodes?: NodeDetail[];
  config?: Partial<DashboardConfig>;
  children: React.ReactNode;
  onError?: (error: Error) => void;
  onStateChange?: (state: DashboardState) => void;
}

const DashboardProvider: React.FC<DashboardProviderProps> = ({
  backendUrl, // bleibt für spätere Nutzung erhalten
  initialNodes,
  config,
  children,
  onError,
  onStateChange,
}) => {
  // ---------------------------------------------------------------
  // useReducer – zentraler State
  // ---------------------------------------------------------------
  const [state, dispatch] = useReducer(dashboardReducer, {
    ...initialDashboardState,
    ...(initialNodes && {
      catalog: { ...initialDashboardState.catalog, roots: initialNodes },
    }),
  } as DashboardState);

  // ---------------------------------------------------------------
  // State-Änderungen nach außen melden
  // ---------------------------------------------------------------
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // ---------------------------------------------------------------
  // Fehlerbehandlung
  // ---------------------------------------------------------------
  const handleError = (error: Error, context: string) => {
    console.error(`DashboardProvider Error [${context}]:`, error);
    onError?.(error);

    dispatch({
      type: "SET_ERROR",
      payload: { key: "provider", value: error.message },
    } as DashboardAction);
  };

  // ---------------------------------------------------------------
  // Theme-Integration
  // ---------------------------------------------------------------
  const { theme } = useTheme();

  useEffect(() => {
    dispatch({ type: "SET_THEME", payload: theme } as DashboardAction);
  }, [theme]);

  // ---------------------------------------------------------------
  // i18n-Integration
  // ---------------------------------------------------------------
  const { i18n, ready } = useTranslation();

  useEffect(() => {
    if (!ready) return;

    try {
      dispatch({
        type: "SET_LANGUAGE",
        payload: i18n.language || "de",
      } as DashboardAction);
    } catch (err) {
      handleError(err as Error, "i18n");
    }
  }, [ready, i18n.language]);

  // ---------------------------------------------------------------
  // Systeminformationen (für Debug/Monitoring)
  // ---------------------------------------------------------------
  const systemInfo = useSystemInfo();

  useEffect(() => {
    if (!systemInfo) return;
    dispatch({
      type: "SET_SYSTEM_INFO",
      payload: systemInfo,
    } as DashboardAction);
  }, [systemInfo]);

  // ---------------------------------------------------------------
  // Initiale Konfiguration und Nodes
  // ---------------------------------------------------------------
  useEffect(() => {
    if (config) {
      dispatch({
        type: "SET_CONFIG",
        payload: config,
      } as DashboardAction);
    }
  }, [config]);

  useEffect(() => {
    if (initialNodes && initialNodes.length > 0) {
      dispatch({
        type: "LOAD_ROOTS_SUCCESS",
        payload: initialNodes,
      } as DashboardAction);
    }
  }, [initialNodes]);

  // ---------------------------------------------------------------
  // Fetch Roots from Backend (if not provided as initialNodes)
  // ---------------------------------------------------------------
  useEffect(() => {
    const fetchRoots = async () => {
      // Only fetch if initialNodes were not provided
      if (initialNodes && initialNodes.length > 0) {
        return;
      }

      try {
        dispatch({ type: "LOAD_ROOTS_START" } as DashboardAction);

        const apiUrl =
          backendUrl ||
          import.meta.env.VITE_BACKEND_URL ||
          "http://localhost:3000";
        const result = await safeGet<{ success: boolean; roots: NodeDetail[] }>(
          `${apiUrl}/api/functions/roots`,
        );

        if (result.ok && result.data?.success && result.data.roots) {
          dispatch({
            type: "LOAD_ROOTS_SUCCESS",
            payload: result.data.roots,
          } as DashboardAction);
        } else {
          throw new Error(result.error || "Failed to load roots");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Failed to fetch roots:", errorMessage);
        dispatch({
          type: "LOAD_ROOTS_ERROR",
          payload: errorMessage,
        } as DashboardAction);
        handleError(error as Error, "fetchRoots");
      }
    };

    void fetchRoots();
  }, [initialNodes, backendUrl]);

  // ---------------------------------------------------------------
  // Performance-Marking (einmalig)
  // ---------------------------------------------------------------
  useEffect(() => {
    // Provider ist initial fertig → Loading-Flag aus
    dispatch({
      type: "SET_LOADING",
      payload: { key: "provider", value: false },
    } as DashboardAction);

    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      console.debug("DashboardProvider active for:", duration, "ms");
    };
  }, []);

  // ---------------------------------------------------------------
  // Provider Error Boundary UI
  // ---------------------------------------------------------------
  if (state.errors && state.errors.provider) {
    return (
      <div className="dashboard-provider-error">
        <h3>Dashboard temporarily unavailable</h3>
        <p>An internal error occurred. You may try refreshing the page.</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  // ---------------------------------------------------------------
  // FINALER CONTEXT-WERT
  // ---------------------------------------------------------------
  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      version: "1.0.0",
      isInitialized: !state.loading.provider,
    }),
    [state, dispatch],
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardProvider;
export { DashboardProvider };

// Convenience Hook
export const useDashboard = () => {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
