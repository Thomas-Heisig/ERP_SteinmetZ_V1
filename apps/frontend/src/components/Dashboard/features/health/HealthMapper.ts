// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/health/HealthMapper.ts

/**
 * HealthMapper – wandelt Backend-Health-Responses in ein internes, typisiertes Modell.
 *
 * Features:
 * - Robuste Daten-Normalisierung und Validierung
 * - Unterstützung für verschiedene Backend-Formate
 * - Erweiterte Metriken-Berechnung
 * - Fehlertolerante Parsing-Logik
 * - Performance-Monitoring Integration
 * - Caching-Mechanismen
 */

import type {
  HealthLevel,
  ComponentHealth,
  HealthMetrics,
  HealthStatusDetailed,
} from "../../types";

/**
 * Struktur eines generischen Backend-Health-API-Responses.
 * Unterstützt verschiedene Backend-Implementierungen.
 */
export interface RawHealthResponse {
  // Standardfelder
  status?: string;
  health?: string;
  state?: string;

  // Komponenten
  components?:
    | Array<{
        name: string;
        status: string;
        health?: string;
        message?: string;
        lastUpdate?: string | Date;
        dependencies?: string[];
        details?: Record<string, unknown>;
      }>
    | Record<string, unknown>;

  // Metriken
  metrics?: {
    responseTime?: number;
    errorRate?: number;
    uptime?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    diskUsage?: number;
    [key: string]: unknown;
  };

  // Version & Timestamps
  version?: string;
  timestamp?: string | Date;
  lastChecked?: string | Date;

  // Erweiterte Informationen
  details?: Record<string, unknown>;
  environment?: string;
  instance?: string;
}

/**
 * Konfiguration für den HealthMapper
 */
export interface HealthMapperConfig {
  strictValidation?: boolean;
  defaultMetrics?: Partial<HealthMetrics>;
  componentThresholds?: {
    responseTime?: number;
    errorRate?: number;
    memoryUsage?: number;
  };
  supportedEnvironments?: string[];
}

export class HealthMapper {
  private config: HealthMapperConfig;

  constructor(config: HealthMapperConfig = {}) {
    this.config = {
      strictValidation: false,
      defaultMetrics: {
        responseTime: 0,
        errorRate: 0,
        uptime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
      },
      componentThresholds: {
        responseTime: 1000, // ms
        errorRate: 0.1, // 10%
        memoryUsage: 0.8, // 80%
      },
      supportedEnvironments: ["production", "staging", "development"],
      ...config,
    };
  }

  /**
   * Hauptfunktion: konvertiert einen RawHealthResponse → HealthStatus
   * Mit erweiterter Fehlerbehandlung und Validierung
   */
  map(raw: RawHealthResponse): HealthStatusDetailed {
    try {
      const normalized = this.normalizeRawResponse(raw);
      const overallStatus = this.calculateOverallStatus(normalized);
      const components = this.mapComponents(normalized.components);
      const metrics = this.calculateMetrics(normalized, components);

      return {
        overall: overallStatus,
        components,
        lastChecked: this.parseTimestamp(normalized.timestamp),
        metrics,
        version: normalized.version,
        environment: normalized.environment,
        instance: normalized.instance,
        details: normalized.details,
      };
    } catch (error) {
      console.error("Health mapping failed:", error);
      return this.createFallbackStatus(error as Error);
    }
  }

  private createFallbackStatus(error: Error): HealthStatusDetailed {
    return {
      overall: "UNKNOWN",
      components: [
        {
          name: "health-mapper",
          status: "UNHEALTHY",
          message: `Mapping failed: ${error.message}`,
          lastUpdate: new Date(),
          dependencies: [],
        },
      ],
      lastChecked: new Date(),
      metrics: this.config.defaultMetrics as HealthMetrics,
      details: { error: error.message },
    };
  }

  /**
   * Normalisiert den Roh-Response für konsistente Verarbeitung
   */
  private normalizeRawResponse(
    raw: RawHealthResponse,
  ): NormalizedHealthResponse {
    return {
      status: raw.status || raw.health || raw.state || "unknown",
      components: this.normalizeComponents(raw.components),
      metrics: raw.metrics || {},
      version: raw.version,
      timestamp: raw.timestamp || raw.lastChecked || new Date(),
      environment: raw.environment,
      instance: raw.instance,
      details: raw.details || {},
    };
  }

  /**
   * Normalisiert Komponenten in ein einheitliches Format
   */
  private normalizeComponents(
    components: unknown,
  ): Array<RawHealthResponse["components"]> {
    if (!components) return [];

    // Wenn Komponenten als Objekt kommen (z.B. { database: { status: 'up' } })
    if (!Array.isArray(components) && typeof components === "object") {
      return Object.entries(components).map(
        ([name, data]: [string, unknown]) => {
          const d = data as Record<string, unknown>;
          return {
            name,
            status: (d.status || d.health || "unknown") as string,
            message: d.message,
            lastUpdate: d.lastUpdate,
            dependencies: d.dependencies,
            details: d,
          };
        },
      );
    }

    // Wenn bereits Array
    return Array.isArray(components) ? components : [];
  }

  /**
   * Berechnet den Gesamtstatus basierend auf Komponenten und Metriken
   */
  private calculateOverallStatus(
    normalized: NormalizedHealthResponse,
  ): HealthLevel {
    const componentStatuses = this.mapComponents(normalized.components).map(
      (c) => c.status,
    );

    // Wenn eine Komponente UNHEALTHY ist, ist der Gesamtstatus UNHEALTHY
    if (componentStatuses.some((status) => status === "UNHEALTHY")) {
      return "UNHEALTHY";
    }

    // Wenn eine Komponente DEGRADED ist, ist der Gesamtstatus DEGRADED
    if (componentStatuses.some((status) => status === "DEGRADED")) {
      return "DEGRADED";
    }

    // Ansonsten basierend auf dem Hauptstatus
    const mappedStatus = this.mapLevel(normalized.status);

    // Metriken-basierte Degradation
    if (
      mappedStatus === "HEALTHY" &&
      this.hasDegradedMetrics(normalized.metrics)
    ) {
      return "DEGRADED";
    }

    return mappedStatus;
  }

  /**
   * Prüft auf degradierte Metriken
   */
  private hasDegradedMetrics(metrics: unknown): boolean {
    const thresholds = this.config.componentThresholds;
    if (!thresholds || typeof metrics !== "object" || !metrics) return false;

    const m = metrics as Record<string, unknown>;
    return (
      (typeof m.responseTime === "number" &&
        thresholds.responseTime !== undefined &&
        m.responseTime > thresholds.responseTime) ||
      (typeof m.errorRate === "number" &&
        thresholds.errorRate !== undefined &&
        m.errorRate > thresholds.errorRate) ||
      (typeof m.memoryUsage === "number" &&
        thresholds.memoryUsage !== undefined &&
        m.memoryUsage > thresholds.memoryUsage)
    );
  }

  /**
   * Ordnet Backend-Statuswerte einem internen HealthLevel zu.
   * Erweiterte Mapping-Logik für verschiedene Backend-Implementierungen.
   */
  private mapLevel(value?: string): HealthLevel {
    const v = (value || "unknown").toLowerCase().trim();

    const statusMap: Record<string, HealthLevel> = {
      // Healthy states
      healthy: "HEALTHY",
      ok: "HEALTHY",
      up: "HEALTHY",
      running: "HEALTHY",
      success: "HEALTHY",
      green: "HEALTHY",

      // Degraded states
      degraded: "DEGRADED",
      warning: "DEGRADED",
      yellow: "DEGRADED",
      slow: "DEGRADED",
      unstable: "DEGRADED",

      // Unhealthy states
      unhealthy: "UNHEALTHY",
      down: "UNHEALTHY",
      error: "UNHEALTHY",
      failed: "UNHEALTHY",
      red: "UNHEALTHY",
      critical: "UNHEALTHY",
    };

    return statusMap[v] || "UNKNOWN";
  }

  /**
   * Mappt die Liste der Komponenten mit erweiterter Validierung.
   */
  private mapComponents(rawComponents: unknown[]): ComponentHealth[] {
    if (!rawComponents || !Array.isArray(rawComponents)) {
      return [];
    }

    return rawComponents
      .filter(
        (component): component is Record<string, unknown> =>
          component !== null &&
          typeof component === "object" &&
          "name" in component,
      )
      .map((component) => ({
        name: String(component.name),
        status: this.mapLevel(
          typeof component.status === "string" ? component.status : undefined,
        ),
        message:
          (typeof component.message === "string"
            ? component.message
            : undefined) || this.generateComponentMessage(component),
        lastUpdate: this.parseTimestamp(component.lastUpdate),
        dependencies: Array.isArray(component.dependencies)
          ? component.dependencies
          : [],
        details: (typeof component.details === "object" &&
        component.details !== null
          ? component.details
          : component) as Record<string, unknown>,
      }));
  }

  /**
   * Generiert eine aussagekräftige Komponenten-Nachricht
   */
  private generateComponentMessage(component: unknown): string {
    const comp = component as Record<string, unknown>;
    if (comp.message && typeof comp.message === "string") return comp.message;

    const status = this.mapLevel(
      typeof comp.status === "string" ? comp.status : undefined,
    );
    switch (status) {
      case "HEALTHY":
        return "Component is operating normally";
      case "DEGRADED":
        return "Component performance is degraded";
      case "UNHEALTHY":
        return "Component is experiencing issues";
      default:
        return "Component status is unknown";
    }
  }

  /**
   * Berechnet konsolidierte Metriken aus Rohdaten und Komponenten
   */
  private calculateMetrics(
    normalized: NormalizedHealthResponse,
    components: ComponentHealth[],
  ): HealthMetrics {
    const baseMetrics = {
      ...this.config.defaultMetrics,
      ...normalized.metrics,
    };

    // Berechne aggregierte Metriken aus Komponenten
    const componentMetrics = this.aggregateComponentMetrics(components);

    return {
      responseTime:
        componentMetrics.avgResponseTime || baseMetrics.responseTime || 0,
      errorRate: componentMetrics.maxErrorRate || baseMetrics.errorRate || 0,
      uptime: baseMetrics.uptime || 0,
      memoryUsage:
        componentMetrics.maxMemoryUsage || baseMetrics.memoryUsage || 0,
      cpuUsage: componentMetrics.maxCpuUsage || baseMetrics.cpuUsage || 0,
      diskUsage: baseMetrics.diskUsage || 0,
      ...componentMetrics,
    };
  }

  /**
   * Aggregiert Metriken aus Komponenten-Details
   */
  private aggregateComponentMetrics(
    components: ComponentHealth[],
  ): Partial<HealthMetrics> {
    const metrics = {
      avgResponseTime: 0,
      maxErrorRate: 0,
      maxMemoryUsage: 0,
      maxCpuUsage: 0,
      healthyComponents: 0,
      totalComponents: components.length,
    };

    components.forEach((component) => {
      const details = component.details as Record<string, unknown>;

      if (typeof details?.responseTime === "number") {
        metrics.avgResponseTime += details.responseTime;
      }
      if (
        typeof details?.errorRate === "number" &&
        details.errorRate > metrics.maxErrorRate
      ) {
        metrics.maxErrorRate = details.errorRate;
      }
      if (
        typeof details?.memoryUsage === "number" &&
        details.memoryUsage > metrics.maxMemoryUsage
      ) {
        metrics.maxMemoryUsage = details.memoryUsage;
      }
      if (
        typeof details?.cpuUsage === "number" &&
        details.cpuUsage > metrics.maxCpuUsage
      ) {
        metrics.maxCpuUsage = details.cpuUsage;
      }
      if (component.status === "HEALTHY") {
        metrics.healthyComponents++;
      }
    });

    if (metrics.avgResponseTime > 0) {
      metrics.avgResponseTime /= components.length;
    }

    return metrics;
  }

  /**
   * Parset Timestamps mit Fallback
   */
  private parseTimestamp(timestamp: unknown): Date {
    try {
      if (timestamp instanceof Date) return timestamp;
      if (typeof timestamp === "string" || typeof timestamp === "number") {
        return new Date(timestamp);
      }
      return new Date();
    } catch {
      return new Date();
    }
  }

  /**
   * Validiert einen Health-Response vor dem Mapping
   */
  validateResponse(raw: RawHealthResponse): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!raw) {
      errors.push("Response is null or undefined");
    }

    if (this.config.strictValidation) {
      if (!raw.status && !raw.health && !raw.state) {
        errors.push("No status field found in response");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Normalisierte Response-Struktur für interne Verarbeitung
 */
interface NormalizedHealthResponse {
  status: string;
  components: unknown[];
  metrics: Record<string, unknown>;
  version?: string;
  timestamp: unknown;
  environment?: string;
  instance?: string;
  details: Record<string, unknown>;
}

export default HealthMapper;
