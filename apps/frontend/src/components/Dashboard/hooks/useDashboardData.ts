// SPDX-License-Identifier: MIT
// apps/frontend/src/components/Dashboard/hooks/useDashboardData.ts

/**
 * Unified Dashboard Data Hook
 *
 * Consolidates all dashboard API calls into a single hook to:
 * - Reduce duplicate fetching logic
 * - Enable request batching and caching
 * - Provide consistent error handling
 * - Centralize refresh intervals
 */

import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface SystemHealth {
  status: "healthy" | "warning" | "error";
  uptime: number;
  memory: {
    free: string;
    total: string;
  };
  loadavg: number[];
  timestamp: string;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

interface DashboardOverview {
  system: {
    uptime: number;
    cpu: number;
    memory: {
      free: string;
      total: string;
    };
  };
  erp: {
    openOrders: number;
    pendingInvoices: number;
    stockItems: number;
    customers: number;
  };
}

interface WidgetStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  unreadNotifications: number;
  totalRevenue: number;
  newCustomers: number;
  activeProjects: number;
}

export interface DashboardData {
  health: SystemHealth | null;
  activities: Activity[];
  overview: DashboardOverview | null;
  stats: WidgetStats | null;
}

interface UseDashboardDataOptions {
  refreshInterval?: number;
  autoRefresh?: boolean;
  fetchOnMount?: boolean;
}

interface UseDashboardDataReturn {
  data: DashboardData;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Fetches all dashboard data in parallel
 *
 * @param options Configuration options
 * @returns Dashboard data, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useDashboardData({
 *   refreshInterval: 30000, // 30 seconds
 *   autoRefresh: true
 * });
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return (
 *   <Dashboard
 *     health={data.health}
 *     activities={data.activities}
 *     overview={data.overview}
 *   />
 * );
 * ```
 */
export function useDashboardData(
  options: UseDashboardDataOptions = {},
): UseDashboardDataReturn {
  const {
    refreshInterval = 60000, // Default 60 seconds
    autoRefresh = true,
    fetchOnMount = true,
  } = options;

  const [data, setData] = useState<DashboardData>({
    health: null,
    activities: [],
    overview: null,
    stats: null,
  });

  const [loading, setLoading] = useState(fetchOnMount);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch all dashboard data in parallel
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all endpoints in parallel
      const [healthRes, activitiesRes, overviewRes, statsRes] =
        await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/dashboard/health`),
          fetch(`${API_BASE_URL}/api/dashboard/activities`),
          fetch(`${API_BASE_URL}/api/dashboard/overview`),
          fetch(`${API_BASE_URL}/api/dashboard/widgets/stats`),
        ]);

      // Process results
      const newData: DashboardData = {
        health: null,
        activities: [],
        overview: null,
        stats: null,
      };

      // Health
      if (healthRes.status === "fulfilled" && healthRes.value.ok) {
        newData.health = await healthRes.value.json();
      }

      // Activities
      if (activitiesRes.status === "fulfilled" && activitiesRes.value.ok) {
        const result = await activitiesRes.value.json();
        newData.activities = result.success ? result.data : [];
      }

      // Overview
      if (overviewRes.status === "fulfilled" && overviewRes.value.ok) {
        newData.overview = await overviewRes.value.json();
      }

      // Stats
      if (statsRes.status === "fulfilled" && statsRes.value.ok) {
        const result = await statsRes.value.json();
        newData.stats = result.success ? result.data : null;
      }

      setData(newData);
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to fetch dashboard data");
      setError(error);
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    if (fetchOnMount) {
      void fetchDashboardData();
    }
  }, [fetchOnMount, fetchDashboardData]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      void fetchDashboardData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}

/**
 * Hook for fetching only system health
 */
export function useSystemHealth(refreshInterval = 30000) {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/health`);
        const data = await response.json();
        setHealth(data);
      } catch (error) {
        console.error("Failed to fetch system health:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { health, loading };
}

/**
 * Hook for fetching only activities
 */
export function useActivities(refreshInterval = 30000) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/dashboard/activities`,
        );
        const result = await response.json();
        if (result.success) {
          setActivities(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { activities, loading };
}
