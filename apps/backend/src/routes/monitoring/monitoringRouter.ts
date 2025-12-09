// SPDX-License-Identifier: MIT
// apps/backend/src/routes/monitoring/monitoringRouter.ts

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
