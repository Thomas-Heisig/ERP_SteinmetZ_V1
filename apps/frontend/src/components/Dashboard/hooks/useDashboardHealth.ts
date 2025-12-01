// SPDX-License-Identifier: MIT
// src/components/Dashboard/hooks/useDashboardHealth.ts

import { useEffect, useState, useCallback, useRef } from "react";
import { useDashboardContext } from "../core/DashboardContext";

import { HealthMonitor } from "../features/health/HealthMonitor";

import type {
  UseDashboardHealth,
  HealthStatus,
  HealthStatusDetailed,
  DashboardHealthState,
  HealthLevel,
} from "../types";

/**
 * Mappt ein HealthLevel (HEALTHY/DEGRADED/…) auf das einfache HealthStatus.
 */
function mapLevelToStatus(level: HealthLevel): HealthStatus {
  switch (level) {
    case "HEALTHY":
      return "healthy";
    case "DEGRADED":
      return "degraded";
    case "UNHEALTHY":
      return "unhealthy";
    default:
      return "unknown";
  }
}

/**
 * Wandelt HealthStatusDetailed in das interne DashboardHealthState-Modell.
 */
function toDashboardHealthState(
  detailed: HealthStatusDetailed,
): DashboardHealthState {
  return {
    status: mapLevelToStatus(detailed.overall),
    overall: detailed.overall,
    components: detailed.components,
    lastChecked: detailed.lastChecked.toISOString(),
    metrics: detailed.metrics,
    version: detailed.version,
    message: undefined,
  };
}

/**
 * useDashboardHealth – Hook für Health-Monitoring.
 */
export function useDashboardHealth(): UseDashboardHealth {
  const { state, dispatch } = useDashboardContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monitorRef = useRef<HealthMonitor | null>(null);

  /**
   * Initialisierung: HealthMonitor starten.
   */
  useEffect(() => {
    if (monitorRef.current) return;

    // KORREKTUR: Endpoint → /api/health
    const monitor = new HealthMonitor({
      url: "http://localhost:3000/api/health",
      interval: 15000,
      onUpdate: (detailed: HealthStatusDetailed) => {
        const mapped = toDashboardHealthState(detailed);

        dispatch({
          type: "SET_HEALTH_STATUS",
          payload: mapped,
        });
      },
    });

    monitor.start();
    monitorRef.current = monitor;

    return () => {
      monitor.stop();
      monitorRef.current = null;
    };
  }, [dispatch]);

  /**
   * Manueller Check.
   */
  const refreshHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await monitorRef.current?.check();
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * HealthStatus aus globalem Zustand.
   */
  const healthStatus: HealthStatus = state.health.status ?? "unknown";

  /**
   * lastChecked -> Date | undefined
   */
  const lastChecked: Date | undefined = state.health.lastChecked
    ? new Date(state.health.lastChecked)
    : undefined;

  return {
    healthStatus,
    health: state.health,
    refreshHealth,
    isLoading,
    error,
    lastChecked,
  };
}

export default useDashboardHealth;
