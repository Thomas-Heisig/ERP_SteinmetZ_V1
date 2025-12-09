// SPDX-License-Identifier: MIT
// apps/backend/src/services/monitoring/metricsService.ts

import { createLogger } from "../../utils/logger.js";

const logger = createLogger("metrics-service");

/**
 * Simple in-memory metrics collector
 * In production, this would integrate with Prometheus client
 *
 * @example
 * ```typescript
 * metricsService.incrementCounter('http_requests_total', { method: 'GET', status: '200' });
 * metricsService.recordHistogram('http_request_duration_seconds', 0.123);
 * metricsService.setGauge('active_connections', 42);
 * ```
 */
class MetricsService {
  private counters: Map<
    string,
    { value: number; labels: Map<string, number> }
  > = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private isEnabled: boolean = false;

  constructor() {
    // Initialize basic metrics
    this.initializeMetrics();
  }

  /**
   * Initialize default metrics
   * @private
   */
  private initializeMetrics(): void {
    // HTTP metrics
    this.counters.set("http_requests_total", { value: 0, labels: new Map() });
    this.counters.set("http_request_errors_total", {
      value: 0,
      labels: new Map(),
    });

    // Database metrics
    this.counters.set("db_queries_total", { value: 0, labels: new Map() });
    this.histograms.set("db_query_duration_seconds", []);

    // AI metrics
    this.counters.set("ai_requests_total", { value: 0, labels: new Map() });
    this.histograms.set("ai_request_duration_seconds", []);

    // Business metrics
    this.gauges.set("active_users", 0);
    this.gauges.set("active_sessions", 0);

    logger.info("Metrics service initialized");
    this.isEnabled = true;
  }

  /**
   * Increment a counter metric
   *
   * @param name - Metric name
   * @param labels - Optional labels for the metric
   * @param value - Value to increment by (default: 1)
   *
   * @example
   * ```typescript
   * metricsService.incrementCounter('api_requests_total', { endpoint: '/api/users', method: 'GET' });
   * ```
   */
  incrementCounter(
    name: string,
    labels?: Record<string, string>,
    value: number = 1,
  ): void {
    if (!this.isEnabled) return;

    const counter = this.counters.get(name);
    if (!counter) {
      this.counters.set(name, { value, labels: new Map() });
      return;
    }

    counter.value += value;

    if (labels) {
      const labelKey = JSON.stringify(labels);
      const labelValue = counter.labels.get(labelKey) || 0;
      counter.labels.set(labelKey, labelValue + value);
    }
  }

  /**
   * Set a gauge metric value
   *
   * @param name - Metric name
   * @param value - Value to set
   *
   * @example
   * ```typescript
   * metricsService.setGauge('cpu_usage_percent', 45.2);
   * ```
   */
  setGauge(name: string, value: number): void {
    if (!this.isEnabled) return;
    this.gauges.set(name, value);
  }

  /**
   * Increment a gauge metric
   *
   * @param name - Metric name
   * @param value - Value to increment by (default: 1)
   */
  incrementGauge(name: string, value: number = 1): void {
    if (!this.isEnabled) return;
    const current = this.gauges.get(name) || 0;
    this.gauges.set(name, current + value);
  }

  /**
   * Decrement a gauge metric
   *
   * @param name - Metric name
   * @param value - Value to decrement by (default: 1)
   */
  decrementGauge(name: string, value: number = 1): void {
    if (!this.isEnabled) return;
    const current = this.gauges.get(name) || 0;
    this.gauges.set(name, Math.max(0, current - value));
  }

  /**
   * Record a histogram observation
   *
   * @param name - Metric name
   * @param value - Observed value
   *
   * @example
   * ```typescript
   * const start = Date.now();
   * // ... do work
   * const duration = (Date.now() - start) / 1000;
   * metricsService.recordHistogram('task_duration_seconds', duration);
   * ```
   */
  recordHistogram(name: string, value: number): void {
    if (!this.isEnabled) return;

    const histogram = this.histograms.get(name);
    if (!histogram) {
      this.histograms.set(name, [value]);
      return;
    }

    histogram.push(value);

    // Keep only last 1000 observations to prevent memory leak
    if (histogram.length > 1000) {
      histogram.shift();
    }
  }

  /**
   * Get counter value
   *
   * @param name - Metric name
   * @returns Counter value or 0 if not found
   */
  getCounter(name: string): number {
    return this.counters.get(name)?.value || 0;
  }

  /**
   * Get gauge value
   *
   * @param name - Metric name
   * @returns Gauge value or 0 if not found
   */
  getGauge(name: string): number {
    return this.gauges.get(name) || 0;
  }

  /**
   * Get histogram statistics
   *
   * @param name - Metric name
   * @returns Statistics object with count, sum, min, max, avg, p50, p95, p99
   */
  getHistogramStats(name: string): {
    count: number;
    sum: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const histogram = this.histograms.get(name);
    if (!histogram || histogram.length === 0) {
      return null;
    }

    const sorted = [...histogram].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const avg = sum / count;

    const percentile = (p: number) => {
      const index = Math.ceil((p / 100) * count) - 1;
      return sorted[Math.max(0, index)];
    };

    return {
      count,
      sum,
      min: sorted[0],
      max: sorted[count - 1],
      avg,
      p50: percentile(50),
      p95: percentile(95),
      p99: percentile(99),
    };
  }

  /**
   * Get all metrics in Prometheus text format
   *
   * @returns Metrics in Prometheus exposition format
   */
  getPrometheusMetrics(): string {
    const lines: string[] = [];

    // Counters
    for (const [name, data] of this.counters.entries()) {
      lines.push(`# TYPE ${name} counter`);
      lines.push(`${name} ${data.value}`);

      // Add labeled metrics
      for (const [labelKey, value] of data.labels.entries()) {
        const labels = JSON.parse(labelKey);
        const labelStr = Object.entries(labels)
          .map(([k, v]) => `${k}="${v}"`)
          .join(",");
        lines.push(`${name}{${labelStr}} ${value}`);
      }
    }

    // Gauges
    for (const [name, value] of this.gauges.entries()) {
      lines.push(`# TYPE ${name} gauge`);
      lines.push(`${name} ${value}`);
    }

    // Histograms
    for (const [name, values] of this.histograms.entries()) {
      if (values.length === 0) continue;

      const stats = this.getHistogramStats(name);
      if (!stats) continue;

      lines.push(`# TYPE ${name} histogram`);
      lines.push(`${name}_count ${stats.count}`);
      lines.push(`${name}_sum ${stats.sum}`);
      lines.push(
        `${name}_bucket{le="0.005"} ${values.filter((v) => v <= 0.005).length}`,
      );
      lines.push(
        `${name}_bucket{le="0.01"} ${values.filter((v) => v <= 0.01).length}`,
      );
      lines.push(
        `${name}_bucket{le="0.025"} ${values.filter((v) => v <= 0.025).length}`,
      );
      lines.push(
        `${name}_bucket{le="0.05"} ${values.filter((v) => v <= 0.05).length}`,
      );
      lines.push(
        `${name}_bucket{le="0.1"} ${values.filter((v) => v <= 0.1).length}`,
      );
      lines.push(
        `${name}_bucket{le="0.25"} ${values.filter((v) => v <= 0.25).length}`,
      );
      lines.push(
        `${name}_bucket{le="0.5"} ${values.filter((v) => v <= 0.5).length}`,
      );
      lines.push(
        `${name}_bucket{le="1"} ${values.filter((v) => v <= 1).length}`,
      );
      lines.push(
        `${name}_bucket{le="2.5"} ${values.filter((v) => v <= 2.5).length}`,
      );
      lines.push(
        `${name}_bucket{le="5"} ${values.filter((v) => v <= 5).length}`,
      );
      lines.push(
        `${name}_bucket{le="10"} ${values.filter((v) => v <= 10).length}`,
      );
      lines.push(`${name}_bucket{le="+Inf"} ${values.length}`);
    }

    return lines.join("\n") + "\n";
  }

  /**
   * Get all metrics as JSON
   *
   * @returns Metrics object with counters, gauges, and histograms
   */
  getMetricsJSON(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<string, any>;
  } {
    const counters: Record<string, number> = {};
    for (const [name, data] of this.counters.entries()) {
      counters[name] = data.value;
    }

    const gauges: Record<string, number> = {};
    for (const [name, value] of this.gauges.entries()) {
      gauges[name] = value;
    }

    const histograms: Record<string, any> = {};
    for (const [name] of this.histograms.entries()) {
      histograms[name] = this.getHistogramStats(name);
    }

    return { counters, gauges, histograms };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.initializeMetrics();
    logger.info("Metrics reset");
  }

  /**
   * Check if metrics service is enabled
   */
  isMetricsEnabled(): boolean {
    return this.isEnabled;
  }
}

// Singleton instance
export const metricsService = new MetricsService();
export default metricsService;
