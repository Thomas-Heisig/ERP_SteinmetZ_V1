// apps/frontend/src/hooks/useSystemInfo.ts
import { useState, useCallback, useMemo } from "react";

/* -------------------------------------------------------
   Typen
------------------------------------------------------- */

interface SystemData {
  name?: string;
  version?: string;
  status?: string;
  [key: string]: unknown;
}

export interface SystemOverview {
  system: SystemData;
  ai: SystemData;
  erp: SystemData;
  version: SystemData;
  timestamp: string;
}

export interface SystemRouteInfo {
  count: number;
  endpoints: Array<{ method: string; path: string }>;
}

export interface HealthStatus {
  success: boolean;
  status: string;
  timestamp: string;
  services: Record<string, boolean>;
}

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/* -------------------------------------------------------
   Haupt-Hook
------------------------------------------------------- */

export const useSystemInfo = (backendUrl: string = "http://localhost:3000") => {
  /* Overview */
  const [overview, setOverview] = useState<FetchState<SystemOverview>>({
    data: null,
    loading: false,
    error: null,
  });

  /* Weitere Bereiche */
  const [routes, setRoutes] = useState<FetchState<SystemRouteInfo>>({
    data: null,
    loading: false,
    error: null,
  });

  const [database, setDatabase] = useState<FetchState<Record<string, unknown>>>(
    {
      data: null,
      loading: false,
      error: null,
    },
  );

  const [systemInfo, setSystemInfo] = useState<
    FetchState<Record<string, unknown>>
  >({
    data: null,
    loading: false,
    error: null,
  });

  const [status, setStatus] = useState<FetchState<Record<string, unknown>>>({
    data: null,
    loading: false,
    error: null,
  });

  const [health, setHealth] = useState<FetchState<HealthStatus>>({
    data: null,
    loading: false,
    error: null,
  });

  const [environment, setEnvironment] = useState<
    FetchState<Record<string, unknown>>
  >({
    data: null,
    loading: false,
    error: null,
  });

  const [dependencies, setDependencies] = useState<
    FetchState<Record<string, unknown>>
  >({
    data: null,
    loading: false,
    error: null,
  });

  const [diagnostics, setDiagnostics] = useState<
    FetchState<Record<string, unknown>>
  >({
    data: null,
    loading: false,
    error: null,
  });

  const [features, setFeatures] = useState<FetchState<Record<string, unknown>>>(
    {
      data: null,
      loading: false,
      error: null,
    },
  );

  const [resources, setResources] = useState<
    FetchState<Record<string, unknown>>
  >({
    data: null,
    loading: false,
    error: null,
  });

  const [functionsSummary, setFunctionsSummary] = useState<
    FetchState<Record<string, unknown>>
  >({
    data: null,
    loading: false,
    error: null,
  });

  /* -------------------------------------------------------
     Einfache Fetch-Hilfsfunktion
  ------------------------------------------------------- */

  const fetchFromBackend = useCallback(
    async <T>(path: string): Promise<T> => {
      const url = `${backendUrl}/api/system-info${path}`;

      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(
          `HTTP ${res.status}: ${res.statusText}, ${errText || "No details"}`,
        );
      }

      const json = await res.json();

      if (!json.success && json.error) {
        throw new Error(json.error);
      }

      return json.data;
    },
    [backendUrl],
  );

  /* -------------------------------------------------------
     Loader für einzelne Bereiche
  ------------------------------------------------------- */

  const loadOverview = useCallback(async () => {
    setOverview({ data: null, loading: true, error: null });

    try {
      const result = await fetchFromBackend<SystemOverview>("/");
      setOverview({ data: result, loading: false, error: null });
    } catch (err) {
      setOverview({
        data: {
          system: { error: true },
          ai: { fallback: true },
          erp: { offline: true },
          version: { version: "fallback" },
          timestamp: new Date().toISOString(),
        },
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [fetchFromBackend]);

  const loadRoutes = useCallback(async () => {
    setRoutes((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await fetchFromBackend<SystemRouteInfo>("/routes");
      setRoutes({ data: result, loading: false, error: null });
    } catch (err) {
      setRoutes({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [fetchFromBackend]);

  const loadDatabase = useCallback(async () => {
    setDatabase((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchFromBackend("/database");
      setDatabase({
        data: data as Record<string, unknown>,
        loading: false,
        error: null,
      });
    } catch (err) {
      setDatabase({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [fetchFromBackend]);

  const loadSystem = useCallback(async () => {
    setSystemInfo((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchFromBackend("/system");
      setSystemInfo({
        data: data as Record<string, unknown>,
        loading: false,
        error: null,
      });
    } catch (err) {
      setSystemInfo({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [fetchFromBackend]);

  const loadStatus = useCallback(async () => {
    setStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchFromBackend("/status");
      setStatus({
        data: data as Record<string, unknown>,
        loading: false,
        error: null,
      });
    } catch (err) {
      setStatus({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [fetchFromBackend]);

  const loadHealth = useCallback(async () => {
    setHealth((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchFromBackend<HealthStatus>("/health");
      setHealth({ data, loading: false, error: null });
    } catch (err) {
      setHealth({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [fetchFromBackend]);

  const loadEnvironment = useCallback(async () => {
    setEnvironment((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchFromBackend("/environment");
      setEnvironment({
        data: data as Record<string, unknown>,
        loading: false,
        error: null,
      });
    } catch (err) {
      setEnvironment({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [fetchFromBackend]);

  const loadDependencies = useCallback(async () => {
    setDependencies((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchFromBackend("/dependencies");
      setDependencies({
        data: data as Record<string, unknown>,
        loading: false,
        error: null,
      });
    } catch (err) {
      setDependencies({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [fetchFromBackend]);

  const loadDiagnostics = useCallback(async () => {
    setDiagnostics((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchFromBackend("/diagnostics");
      setDiagnostics({
        data: data as Record<string, unknown>,
        loading: false,
        error: null,
      });
    } catch (err) {
      setDiagnostics({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [fetchFromBackend]);

  const loadFeatures = useCallback(async () => {
    setFeatures((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchFromBackend("/features");
      setFeatures({
        data: data as Record<string, unknown>,
        loading: false,
        error: null,
      });
    } catch (err) {
      setFeatures({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [fetchFromBackend]);

  const loadResources = useCallback(async () => {
    setResources((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchFromBackend("/resources");
      setResources({
        data: data as Record<string, unknown>,
        loading: false,
        error: null,
      });
    } catch (err) {
      setResources({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [fetchFromBackend]);

  const loadFunctions = useCallback(async () => {
    setFunctionsSummary((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchFromBackend("/functions");
      setFunctionsSummary({
        data: data as Record<string, unknown>,
        loading: false,
        error: null,
      });
    } catch (err) {
      setFunctionsSummary({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [fetchFromBackend]);

  /* -------------------------------------------------------
     Stabilisiertes Return (wichtig!)
  ------------------------------------------------------- */

  return useMemo(
    () => ({
      overview,
      loadOverview,

      routes,
      database,
      systemInfo,
      status,
      health,
      environment,
      dependencies,
      diagnostics,
      features,
      resources,
      functionsSummary,

      loadRoutes,
      loadDatabase,
      loadSystem,
      loadStatus,
      loadHealth,
      loadEnvironment,
      loadDependencies,
      loadDiagnostics,
      loadFeatures,
      loadResources,
      loadFunctions,
    }),
    [
      overview,
      loadOverview,
      routes,
      loadRoutes,
      database,
      loadDatabase,
      systemInfo,
      loadSystem,
      status,
      loadStatus,
      health,
      loadHealth,
      environment,
      loadEnvironment,
      dependencies,
      loadDependencies,
      diagnostics,
      loadDiagnostics,
      features,
      loadFeatures,
      resources,
      loadResources,
      functionsSummary,
      loadFunctions,
    ],
  );
};
