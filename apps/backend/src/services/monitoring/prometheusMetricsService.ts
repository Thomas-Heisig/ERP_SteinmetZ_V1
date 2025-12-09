// SPDX-License-Identifier: MIT
// apps/backend/src/services/monitoring/prometheusMetricsService.ts

import { createLogger } from "../../utils/logger.js";
import * as client from "prom-client";

const logger = createLogger("prometheus-metrics");

/**
 * Prometheus Metrics Service
 * Integrates with prom-client for professional metrics collection
 * Compatible with Prometheus, Grafana, and other monitoring tools
 */
class PrometheusMetricsService {
  private register: client.Registry;
  private isEnabled: boolean = false;

  // HTTP Metrics
  private httpRequestsTotal: client.Counter<string>;
  private httpRequestDuration: client.Histogram<string>;
  private httpRequestErrors: client.Counter<string>;

  // Database Metrics
  private dbQueriesTotal: client.Counter<string>;
  private dbQueryDuration: client.Histogram<string>;
  private dbConnectionsActive: client.Gauge<string>;

  // AI Metrics
  private aiRequestsTotal: client.Counter<string>;
  private aiRequestDuration: client.Histogram<string>;
  private aiTokensUsed: client.Counter<string>;
  private aiRequestCost: client.Counter<string>;

  // Business Metrics
  private activeUsers: client.Gauge<string>;
  private activeSessions: client.Gauge<string>;
  private businessEventsTotal: client.Counter<string>;

  // System Metrics
  private processInfo: client.Gauge<string>;

  constructor() {
    this.register = new client.Registry();

    // Set default labels for all metrics
    this.register.setDefaultLabels({
      app: "erp-steinmetz",
      environment: process.env.NODE_ENV || "development",
    });

    // Initialize HTTP metrics
    this.httpRequestsTotal = new client.Counter({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "path", "status"],
      registers: [this.register],
    });

    this.httpRequestDuration = new client.Histogram({
      name: "http_request_duration_seconds",
      help: "Duration of HTTP requests in seconds",
      labelNames: ["method", "path", "status"],
      buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    });

    this.httpRequestErrors = new client.Counter({
      name: "http_request_errors_total",
      help: "Total number of HTTP request errors",
      labelNames: ["method", "path", "error_type"],
      registers: [this.register],
    });

    // Initialize Database metrics
    this.dbQueriesTotal = new client.Counter({
      name: "db_queries_total",
      help: "Total number of database queries",
      labelNames: ["operation", "table"],
      registers: [this.register],
    });

    this.dbQueryDuration = new client.Histogram({
      name: "db_query_duration_seconds",
      help: "Duration of database queries in seconds",
      labelNames: ["operation", "table"],
      buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.register],
    });

    this.dbConnectionsActive = new client.Gauge({
      name: "db_connections_active",
      help: "Number of active database connections",
      registers: [this.register],
    });

    // Initialize AI metrics
    this.aiRequestsTotal = new client.Counter({
      name: "ai_requests_total",
      help: "Total number of AI requests",
      labelNames: ["provider", "model", "status"],
      registers: [this.register],
    });

    this.aiRequestDuration = new client.Histogram({
      name: "ai_request_duration_seconds",
      help: "Duration of AI requests in seconds",
      labelNames: ["provider", "model"],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
      registers: [this.register],
    });

    this.aiTokensUsed = new client.Counter({
      name: "ai_tokens_used_total",
      help: "Total number of AI tokens used",
      labelNames: ["provider", "model", "type"],
      registers: [this.register],
    });

    this.aiRequestCost = new client.Counter({
      name: "ai_request_cost_total",
      help: "Total cost of AI requests in USD",
      labelNames: ["provider", "model"],
      registers: [this.register],
    });

    // Initialize Business metrics
    this.activeUsers = new client.Gauge({
      name: "active_users",
      help: "Number of currently active users",
      registers: [this.register],
    });

    this.activeSessions = new client.Gauge({
      name: "active_sessions",
      help: "Number of currently active sessions",
      registers: [this.register],
    });

    this.businessEventsTotal = new client.Counter({
      name: "business_events_total",
      help: "Total number of business events",
      labelNames: ["event_type", "status"],
      registers: [this.register],
    });

    // Initialize System metrics
    this.processInfo = new client.Gauge({
      name: "process_info",
      help: "Process information",
      labelNames: ["version", "node_version"],
      registers: [this.register],
    });

    // Collect default Node.js metrics
    client.collectDefaultMetrics({ register: this.register });

    this.isEnabled = true;
    logger.info("Prometheus metrics service initialized");
  }

  /**
   * Record HTTP request metrics
   */
  recordHttpRequest(
    method: string,
    path: string,
    status: number,
    durationSeconds: number,
  ): void {
    if (!this.isEnabled) return;

    const statusStr = status.toString();
    this.httpRequestsTotal.inc({ method, path, status: statusStr });
    this.httpRequestDuration.observe({ method, path, status: statusStr }, durationSeconds);
  }

  /**
   * Record HTTP error
   */
  recordHttpError(method: string, path: string, errorType: string): void {
    if (!this.isEnabled) return;
    this.httpRequestErrors.inc({ method, path, error_type: errorType });
  }

  /**
   * Record database query metrics
   */
  recordDbQuery(
    operation: string,
    table: string,
    durationSeconds: number,
  ): void {
    if (!this.isEnabled) return;
    this.dbQueriesTotal.inc({ operation, table });
    this.dbQueryDuration.observe({ operation, table }, durationSeconds);
  }

  /**
   * Set active database connections
   */
  setDbConnections(count: number): void {
    if (!this.isEnabled) return;
    this.dbConnectionsActive.set(count);
  }

  /**
   * Record AI request metrics
   */
  recordAiRequest(
    provider: string,
    model: string,
    status: string,
    durationSeconds: number,
    tokensUsed?: { prompt: number; completion: number },
    costUsd?: number,
  ): void {
    if (!this.isEnabled) return;

    this.aiRequestsTotal.inc({ provider, model, status });
    this.aiRequestDuration.observe({ provider, model }, durationSeconds);

    if (tokensUsed) {
      this.aiTokensUsed.inc(
        { provider, model, type: "prompt" },
        tokensUsed.prompt,
      );
      this.aiTokensUsed.inc(
        { provider, model, type: "completion" },
        tokensUsed.completion,
      );
    }

    if (costUsd !== undefined) {
      this.aiRequestCost.inc({ provider, model }, costUsd);
    }
  }

  /**
   * Set active users count
   */
  setActiveUsers(count: number): void {
    if (!this.isEnabled) return;
    this.activeUsers.set(count);
  }

  /**
   * Set active sessions count
   */
  setActiveSessions(count: number): void {
    if (!this.isEnabled) return;
    this.activeSessions.set(count);
  }

  /**
   * Record business event
   */
  recordBusinessEvent(eventType: string, status: string = "success"): void {
    if (!this.isEnabled) return;
    this.businessEventsTotal.inc({ event_type: eventType, status });
  }

  /**
   * Get metrics in Prometheus format
   * This is what gets exposed on /metrics endpoint
   */
  async getMetrics(): Promise<string> {
    if (!this.isEnabled) return "";
    return await this.register.metrics();
  }

  /**
   * Get metrics as JSON (for debugging/custom endpoints)
   */
  async getMetricsJSON(): Promise<any[]> {
    if (!this.isEnabled) return [];
    return await this.register.getMetricsAsJSON();
  }

  /**
   * Get content type for Prometheus metrics
   */
  getContentType(): string {
    return this.register.contentType;
  }

  /**
   * Reset all metrics (useful for testing)
   */
  reset(): void {
    this.register.resetMetrics();
    logger.info("Metrics reset");
  }

  /**
   * Check if service is enabled
   */
  get enabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const prometheusMetrics = new PrometheusMetricsService();
export default prometheusMetrics;
