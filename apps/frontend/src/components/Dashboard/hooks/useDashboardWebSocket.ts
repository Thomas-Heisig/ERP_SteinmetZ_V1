// SPDX-License-Identifier: MIT
// apps/frontend/src/components/Dashboard/hooks/useDashboardWebSocket.ts

/**
 * Dashboard WebSocket Hook
 * Integrates real-time updates for dashboard widgets
 */

import { useState, useCallback } from "react";
import { useDashboardUpdates } from "../../../hooks/useWebSocket";

interface DashboardUpdate {
  type: "widget_update" | "metrics_update" | "catalog_update";
  timestamp: string;
  data: unknown;
}

interface DashboardWidgetUpdate {
  widgetId: string;
  data: unknown;
}

export function useDashboardWebSocket() {
  const [lastUpdate, setLastUpdate] = useState<DashboardUpdate | null>(null);
  const [updates, setUpdates] = useState<DashboardUpdate[]>([]);
  const [widgetUpdates, setWidgetUpdates] = useState<
    Record<string, DashboardWidgetUpdate>
  >({});

  const handleDashboardUpdate = useCallback((data: unknown) => {
    const update: DashboardUpdate = {
      type: "metrics_update",
      timestamp: new Date().toISOString(),
      data,
    };

    setLastUpdate(update);
    setUpdates((prev) => [...prev.slice(-9), update]); // Keep last 10 updates
  }, []);

  const handleWidgetUpdate = useCallback((data: unknown) => {
    const d = data as Record<string, unknown>;
    if (d.widgetId && typeof d.widgetId === "string") {
      const widgetId = String(d.widgetId);
      const widgetUpdate: DashboardWidgetUpdate = {
        widgetId,
        data: d,
      };
      setWidgetUpdates((prev) => ({
        ...prev,
        [widgetId]: widgetUpdate,
      }));

      const update: DashboardUpdate = {
        type: "widget_update",
        timestamp: new Date().toISOString(),
        data: d,
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
