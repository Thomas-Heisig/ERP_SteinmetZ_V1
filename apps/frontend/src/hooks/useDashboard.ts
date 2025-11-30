// SPDX-License-Identifier: MIT
// apps/frontend/src/hooks/useDashboard.ts

import { useState, useEffect, useCallback } from "react";

/* ---------------------------------------------------------
   Backend-Typen (abgeleitet aus dashboard.ts)
--------------------------------------------------------- */

// /dashboard/health
export interface DashboardHealth {
  status: string;
  uptime: number;
  hostname: string;
  platform: string;
  node_version: string;
  memory: {
    free: string;
    total: string;
  };
  loadavg: number[];
  timestamp: string;
}

// /dashboard/overview
export interface DashboardOverview {
  system: {
    uptime: number;
    cpu: number;
    loadavg: string[];
    memory: {
      free: string;
      total: string;
    };
  };
  ai: {
    fallback_config_source: string;
    wiki_enabled: boolean;
    modules: {
      fallback_ai: boolean;
      annotator_ai: boolean;
      rag_ai: boolean;
    };
  };
  erp: {
    openOrders: number;
    pendingInvoices: number;
    stockItems: number;
    customers: number;
  };
  version: {
    name: string;
    version: string;
    description?: string;
  };
  timestamp: string;
}

// /dashboard/context
export interface DashboardContextLog {
  context: string[];
}

/* ---------------------------------------------------------
   Haupt-Hook
--------------------------------------------------------- */

export interface UseDashboardReturn {
  health: DashboardHealth | null;
  overview: DashboardOverview | null;
  context: string[];

  loading: boolean;
  errors: {
    health?: string;
    overview?: string;
    context?: string;
  };

  reload: () => Promise<void>;
}

export function useDashboard(backendUrl: string = "/api/dashboard"): UseDashboardReturn {
  const [health, setHealth] = useState<DashboardHealth | null>(null);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [context, setContext] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    health?: string;
    overview?: string;
    context?: string;
  }>({});

  const safeFetch = useCallback(async <T,>(url: string): Promise<T> => {
    try {
      const res = await fetch(url, { headers: { "Content-Type": "application/json" } });

      if (!res.ok) {
        const text = await res.text().catch(() => "Unbekannter Fehler");
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      return await res.json();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      throw new Error(msg);
    }
  }, []);

  /* ---------------------------------------------------------
     Einzelne Ladevorgänge
  --------------------------------------------------------- */

  const loadHealth = useCallback(async () => {
    try {
      const data = await safeFetch<DashboardHealth>(`${backendUrl}/health`);
      setHealth(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrors(prev => ({ ...prev, health: msg }));
    }
  }, [backendUrl, safeFetch]);

  const loadOverview = useCallback(async () => {
    try {
      const data = await safeFetch<DashboardOverview>(`${backendUrl}/overview`);
      setOverview(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrors(prev => ({ ...prev, overview: msg }));
    }
  }, [backendUrl, safeFetch]);

  const loadContext = useCallback(async () => {
    try {
      const data = await safeFetch<DashboardContextLog>(`${backendUrl}/context`);
      setContext(Array.isArray(data.context) ? data.context : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrors(prev => ({ ...prev, context: msg }));
    }
  }, [backendUrl, safeFetch]);

  /* ---------------------------------------------------------
     Gesamtes Reloading
  --------------------------------------------------------- */

  const reload = useCallback(async () => {
    setLoading(true);
    setErrors({});

    await Promise.allSettled([
      loadHealth(),
      loadOverview(),
      loadContext()
    ]);

    setLoading(false);
  }, [loadHealth, loadOverview, loadContext]);

  /* ---------------------------------------------------------
     Initiales Laden
  --------------------------------------------------------- */

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    health,
    overview,
    context,
    loading,
    errors,
    reload,
  };
}

export default useDashboard;
