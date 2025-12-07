// SPDX-License-Identifier: MIT
// apps/backend/src/services/metricsService.ts

import { Request, Response } from "express";
import client from "prom-client";

/**
 * Centralized metrics service using Prometheus client.
 * Provides system metrics, HTTP metrics, and custom business metrics.
 *
 * Usage:
 * ```typescript
 * import { metricsService } from './services/metricsService.js';
 *
 * // Record HTTP request
 * metricsService.recordHttpRequest('GET', '/api/users', 200, 123);
 *
 * // Record business metric
 * metricsService.incrementCounter('orders_created', { type: 'online' });
 * ```
 */

// Initialize default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({
  prefix: "erp_steinmetz_",
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// Create a registry
export const register = client.register;

/**
 * HTTP Request metrics
 */
export const httpRequestDuration = new client.Histogram({
  name: "erp_steinmetz_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
});

export const httpRequestTotal = new client.Counter({
  name: "erp_steinmetz_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

export const httpRequestsInProgress = new client.Gauge({
  name: "erp_steinmetz_http_requests_in_progress",
  help: "Number of HTTP requests currently being processed",
  labelNames: ["method", "route"],
});

/**
 * Database metrics
 */
export const dbQueryDuration = new client.Histogram({
  name: "erp_steinmetz_db_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["operation", "table"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

export const dbQueryTotal = new client.Counter({
  name: "erp_steinmetz_db_queries_total",
  help: "Total number of database queries",
  labelNames: ["operation", "table", "status"],
});

export const dbConnectionsActive = new client.Gauge({
  name: "erp_steinmetz_db_connections_active",
  help: "Number of active database connections",
});

/**
 * Authentication metrics
 */
export const authAttemptsTotal = new client.Counter({
  name: "erp_steinmetz_auth_attempts_total",
  help: "Total number of authentication attempts",
  labelNames: ["method", "status"],
});

export const authActiveSessionsGauge = new client.Gauge({
  name: "erp_steinmetz_auth_active_sessions",
  help: "Number of active authenticated sessions",
});

/**
 * Business metrics
 */
export const businessEventsTotal = new client.Counter({
  name: "erp_steinmetz_business_events_total",
  help: "Total number of business events",
  labelNames: ["event_type", "status"],
});

export const businessOperationDuration = new client.Histogram({
  name: "erp_steinmetz_business_operation_duration_seconds",
  help: "Duration of business operations in seconds",
  labelNames: ["operation"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10, 30, 60],
});

/**
 * AI Provider metrics
 */
export const aiRequestsTotal = new client.Counter({
  name: "erp_steinmetz_ai_requests_total",
  help: "Total number of AI provider requests",
  labelNames: ["provider", "status"],
});

export const aiRequestDuration = new client.Histogram({
  name: "erp_steinmetz_ai_request_duration_seconds",
  help: "Duration of AI provider requests in seconds",
  labelNames: ["provider"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 20, 30, 60],
});

export const aiTokensUsed = new client.Counter({
  name: "erp_steinmetz_ai_tokens_used_total",
  help: "Total number of AI tokens used",
  labelNames: ["provider", "type"],
});

/**
 * Error metrics
 */
export const errorsTotal = new client.Counter({
  name: "erp_steinmetz_errors_total",
  help: "Total number of errors",
  labelNames: ["type", "severity"],
});

/**
 * Metrics Service
 */
export const metricsService = {
  /**
   * Record HTTP request metrics
   */
  recordHttpRequest: (
    method: string,
    route: string,
    statusCode: number,
    durationMs: number,
  ) => {
    const statusCodeStr = statusCode.toString();
    httpRequestDuration
      .labels(method, route, statusCodeStr)
      .observe(durationMs / 1000);
    httpRequestTotal.labels(method, route, statusCodeStr).inc();
  },

  /**
   * Track HTTP request in progress
   */
  startHttpRequest: (method: string, route: string) => {
    httpRequestsInProgress.labels(method, route).inc();
  },

  /**
   * Complete HTTP request tracking
   */
  endHttpRequest: (method: string, route: string) => {
    httpRequestsInProgress.labels(method, route).dec();
  },

  /**
   * Record database query metrics
   */
  recordDbQuery: (
    operation: string,
    table: string,
    durationMs: number,
    success: boolean = true,
  ) => {
    dbQueryDuration.labels(operation, table).observe(durationMs / 1000);
    dbQueryTotal.labels(operation, table, success ? "success" : "error").inc();
  },

  /**
   * Set active database connections
   */
  setDbConnections: (count: number) => {
    dbConnectionsActive.set(count);
  },

  /**
   * Record authentication attempt
   */
  recordAuthAttempt: (method: string, success: boolean) => {
    authAttemptsTotal.labels(method, success ? "success" : "failure").inc();
  },

  /**
   * Set active session count
   */
  setActiveSessions: (count: number) => {
    authActiveSessionsGauge.set(count);
  },

  /**
   * Record business event
   */
  recordBusinessEvent: (eventType: string, status: string = "success") => {
    businessEventsTotal.labels(eventType, status).inc();
  },

  /**
   * Record business operation duration
   */
  recordBusinessOperation: (operation: string, durationMs: number) => {
    businessOperationDuration.labels(operation).observe(durationMs / 1000);
  },

  /**
   * Record AI provider request
   */
  recordAiRequest: (
    provider: string,
    durationMs: number,
    success: boolean = true,
  ) => {
    aiRequestsTotal.labels(provider, success ? "success" : "error").inc();
    aiRequestDuration.labels(provider).observe(durationMs / 1000);
  },

  /**
   * Record AI token usage
   */
  recordAiTokens: (provider: string, type: string, count: number) => {
    aiTokensUsed.labels(provider, type).inc(count);
  },

  /**
   * Record error
   */
  recordError: (type: string, severity: string = "error") => {
    errorsTotal.labels(type, severity).inc();
  },

  /**
   * Get metrics in Prometheus format
   */
  getMetrics: async (): Promise<string> => {
    return await register.metrics();
  },

  /**
   * Get content type for metrics
   */
  getContentType: (): string => {
    return register.contentType;
  },

  /**
   * Reset all metrics (useful for testing)
   */
  reset: () => {
    register.resetMetrics();
  },
};

export default metricsService;
