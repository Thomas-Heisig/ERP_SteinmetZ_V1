// src/hooks/useHealth.ts
import { useState, useEffect, useRef } from "react";

/** Mögliche Gesundheitszustände des Systems */
export type HealthStatus = "healthy" | "unhealthy" | "checking" | "error";

/** Gesundheitsinformationen des Backends */
export interface SystemHealth {
  status: HealthStatus;
  timestamp?: string;
  version?: string;
  responseTime?: number;
  lastChecked?: string;
}

/**
 * useHealth – prüft regelmäßig die Erreichbarkeit des Backends.
 * Enthält Timeout, Abort-Handling und Schutz vor Race Conditions.
 */
export function useHealth(backendUrl: string): SystemHealth {
  const [health, setHealth] = useState<SystemHealth>({ status: "checking" });

  /** Verhindert State-Updates, wenn eine alte Anfrage später zurückkommt */
  const lastRequestId = useRef(0);

  useEffect(() => {
    if (!backendUrl) {
      setHealth({ status: "error" });
      return;
    }

    let interval: number;

    const checkHealth = async () => {
      const requestId = ++lastRequestId.current;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      const startedAt = Date.now();

      try {
        const res = await fetch(`${backendUrl}/api/health`, {
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
        });

        const duration = Date.now() - startedAt;
        clearTimeout(timeout);

        // Falls eine neuere Anfrage gestartet wurde → Ergebnis ignorieren
        if (requestId !== lastRequestId.current) return;

        if (!res.ok) {
          setHealth({
            status: "unhealthy",
            responseTime: duration,
            lastChecked: new Date().toISOString(),
          });
          return;
        }

        const data = await res.json();

        setHealth({
          status: "healthy",
          timestamp:
            typeof data.timestamp === "string" ? data.timestamp : undefined,
          version: typeof data.version === "string" ? data.version : undefined,
          responseTime: duration,
          lastChecked: new Date().toISOString(),
        });
      } catch (err) {
        clearTimeout(timeout);

        // Abbruch → kein echter Fehler
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        // Falls veraltete Anfrage → ignorieren
        if (requestId !== lastRequestId.current) return;

        setHealth({
          status: "error",
          lastChecked: new Date().toISOString(),
        });
      }
    };

    // Sofort prüfen
    checkHealth();

    // Alle 30s erneut prüfen
    interval = window.setInterval(checkHealth, 30000);

    return () => {
      lastRequestId.current++;
      clearInterval(interval);
    };
  }, [backendUrl]);

  return health;
}
