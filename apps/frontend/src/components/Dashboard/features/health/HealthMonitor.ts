// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/health/HealthMonitor.ts

/**
 * HealthMonitor – periodisches Monitoring des Backend-Health-Zustands.
 *
 * - Keine UI
 * - Liefert Events/Callbacks an Hooks/Provider
 * - Nutzt HealthMapper zur Normalisierung
 */

import { HealthMapper } from "./HealthMapper";
import type { RawHealthResponse } from "./HealthMapper";
import type { HealthStatusDetailed } from "../../types";

export interface HealthMonitorOptions {
  url: string;
  interval?: number; // Standard: 5 Sekunden
  timeout?: number; // Standard: 4 Sekunden
  onUpdate?: (status: HealthStatusDetailed) => void;
  fetcher?: (url: string, timeout: number) => Promise<unknown>;
}

export class HealthMonitor {
  private url: string;
  private interval: number;
  private timeout: number;
  private onUpdate?: (status: HealthStatusDetailed) => void;
  private mapper: HealthMapper;
  private timer: ReturnType<typeof setInterval> | null = null;
  private fetcher: (url: string, timeout: number) => Promise<unknown>;

  constructor(options: HealthMonitorOptions) {
    this.url = options.url;
    this.interval = options.interval ?? 5000;
    this.timeout = options.timeout ?? 4000;
    this.onUpdate = options.onUpdate;
    this.mapper = new HealthMapper();
    this.fetcher = options.fetcher ?? this.defaultFetch;
  }

  /**
   * Startet periodisches Polling.
   */
  start(): void {
    if (this.timer) return;

    this.timer = setInterval(() => this.check(), this.interval);
    this.check(); // Sofortiger Check beim Start
  }

  /**
   * Beendet Polling.
   */
  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /**
   * Führt Health-Check aus.
   */
  async check(): Promise<void> {
    try {
      const raw = await this.fetcher(this.url, this.timeout);

      const mapped = this.mapper.map(raw as RawHealthResponse);
      this.onUpdate?.(mapped);
    } catch (err) {
      // Konsistenter Fallback für Fehlerfälle
      const rawFallback: RawHealthResponse = {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        details: {
          error: (err as Error).message ?? "unknown error",
        },
        components: [],
        metrics: {
          responseTime: 0,
          errorRate: 1,
          uptime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
        },
      };

      const fallback = this.mapper.map(rawFallback);
      this.onUpdate?.(fallback);
    }
  }

  /**
   * Default Fetcher (mit Timeout).
   */
  private async defaultFetch(url: string, timeout: number): Promise<unknown> {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeout);

    try {
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(id);

      if (!res.ok) {
        throw new Error(`Health request failed: HTTP ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  }
}

export default HealthMonitor;
