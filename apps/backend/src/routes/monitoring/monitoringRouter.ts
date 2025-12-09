// SPDX-License-Identifier: MIT
// apps/backend/src/routes/monitoring/monitoringRouter.ts

/**
 * Monitoring Router
 *
 * Provides metrics and monitoring endpoints for Prometheus and custom
 * monitoring solutions. Exposes application metrics in both JSON and
 * Prometheus text format.
 *
 * @remarks
 * This router provides:
 * - Application metrics in JSON format
 * - Prometheus-compatible metrics endpoint
 * - HTTP request metrics (count, duration, status codes)
 * - Database query metrics
 * - AI operation metrics (requests, tokens, cost)
 * - Business metrics (users, sessions, events)
 * - System metrics (CPU, memory, Node.js stats)
 *
 * Metrics Categories:
 * - Counters: Total counts (requests, errors, operations)
 * - Gauges: Current values (active users, connections)
 * - Histograms: Distributions (request duration, query time)
 *
 * Prometheus Integration:
 * - Compatible with Prometheus scraping
 * - Standard metric naming conventions
 * - Labels for dimensional data
 * - Default Node.js metrics included
 *
 * @module routes/monitoring
 *
 * @example
 * ```typescript
 * // Get JSON metrics
 * GET /api/monitoring/metrics
 * // Response: { success: true, data: { counters: {...}, gauges: {...} } }
 *
 * // Prometheus format
 * GET /api/monitoring/metrics/prometheus
 * // Response: Plain text in Prometheus exposition format
 *
 * // Grafana configuration
 * {
 *   "url": "http://localhost:3000/api/monitoring/metrics/prometheus",
 *   "scrape_interval": "15s"
 * }
 * ```
 */

import express from "express";
import { metricsService } from "../../services/monitoring/metricsService.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { createLogger } from "../../utils/logger.js";

const router = express.Router();
const logger = createLogger("monitoring-router");

/**
 * GET /api/monitoring/metrics
 * Get all metrics in JSON format
 *
 * @returns JSON object with counters, gauges, and histograms
 */
router.get(
  "/metrics",
  asyncHandler(async (req, res) => {
    const metrics = metricsService.getMetricsJSON();

    logger.info("Metrics requested");

    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * GET /api/monitoring/metrics/prometheus
 * Get all metrics in Prometheus text format
 *
 * @returns Metrics in Prometheus exposition format
 */
router.get(
  "/metrics/prometheus",
  asyncHandler(async (req, res) => {
    const prometheusMetrics = metricsService.getPrometheusMetrics();

    logger.info("Prometheus metrics requested");

    res.set("Content-Type", "text/plain; version=0.0.4");
    res.send(prometheusMetrics);
  }),
);

/**
 * GET /api/monitoring/health
 * Health check endpoint
 *
 * @returns Health status
 */
router.get(
  "/health",
  asyncHandler(async (req, res) => {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      metricsEnabled: metricsService.isMetricsEnabled(),
    };

    res.json(health);
  }),
);

/**
 * POST /api/monitoring/metrics/reset
 * Reset all metrics (for testing/development)
 *
 * @returns Success message
 */
router.post(
  "/metrics/reset",
  asyncHandler(async (req, res) => {
    metricsService.reset();

    logger.warn("Metrics reset requested");

    res.json({
      success: true,
      message: "All metrics have been reset",
      timestamp: new Date().toISOString(),
    });
  }),
);

export default router;
