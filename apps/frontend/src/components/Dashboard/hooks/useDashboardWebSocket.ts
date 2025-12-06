// SPDX-License-Identifier: MIT
// apps/frontend/src/components/Dashboard/hooks/useDashboardWebSocket.ts

/**
 * Dashboard WebSocket Hook
 * Integrates real-time updates for dashboard widgets
 */

import { useEffect, useState, useCallback } from "react";
import { useDashboardUpdates } from "../../../hooks/useWebSocket";

interface DashboardUpdate {
  type: "widget_update" | "metrics_update" | "catalog_update";
  timestamp: string;
  data: any;
}

interface DashboardWidgetUpdate {
  widgetId: string;
  data: any;
}

export function useDashboardWebSocket() {
  const [lastUpdate, setLastUpdate] = useState<DashboardUpdate | null>(null);
  const [updates, setUpdates] = useState<DashboardUpdate[]>([]);
  const [widgetUpdates, setWidgetUpdates] = useState<
    Record<string, DashboardWidgetUpdate>
  >({});

  const handleDashboardUpdate = useCallback((data: any) => {
    const update: DashboardUpdate = {
      type: "metrics_update",
      timestamp: new Date().toISOString(),
      data,
    };

    setLastUpdate(update);
    setUpdates((prev) => [...prev.slice(-9), update]); // Keep last 10 updates
  }, []);

  const handleWidgetUpdate = useCallback((data: any) => {
    if (data.widgetId) {
      setWidgetUpdates((prev) => ({
        ...prev,
        [data.widgetId]: data,
      }));

      const update: DashboardUpdate = {
        type: "widget_update",
        timestamp: new Date().toISOString(),
        data,
      };

      setLastUpdate(update);
      setUpdates((prev) => [...prev.slice(-9), update]);
    }
  }, []);

  const { isConnected } = useDashboardUpdates(
    handleDashboardUpdate,
    handleWidgetUpdate,
  );

  const clearUpdates = useCallback(() => {
    setUpdates([]);
    setWidgetUpdates({});
    setLastUpdate(null);
  }, []);

  return {
    isConnected,
    lastUpdate,
    updates,
    widgetUpdates,
    clearUpdates,
  };
}
