// SPDX-License-Identifier: MIT
// apps/backend/src/routes/metrics/metricsRouter.ts

import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
// Reserved for future use
// import { metricsService } from "../../services/metricsService.js";
import prometheusMetrics from "../../services/monitoring/prometheusMetricsService.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("metrics");
const router = Router();

/**
 * @route   GET /api/metrics
 * @desc    Get Prometheus metrics (standard format)
 * @access  Public (but should be protected in production)
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    logger.debug("Prometheus metrics endpoint accessed");

    const metrics = await prometheusMetrics.getMetrics();
    const contentType = prometheusMetrics.getContentType();

    res.set("Content-Type", contentType);
    res.send(metrics);
  }),
);

/**
 * @route   GET /api/metrics/json
 * @desc    Get metrics as JSON (for custom dashboards)
 * @access  Public (but should be protected in production)
 */
router.get(
  "/json",
  asyncHandler(async (req, res) => {
    logger.debug("JSON metrics endpoint accessed");

    const metrics = await prometheusMetrics.getMetricsJSON();
    res.json({
      timestamp: new Date().toISOString(),
      metrics,
    });
  }),
);

/**
 * @route   GET /api/metrics/health
 * @desc    Health check for metrics service
 * @access  Public
 */
router.get(
  "/health",
  asyncHandler(async (req, res) => {
    res.json({
      status: "healthy",
      service: "metrics",
      timestamp: new Date().toISOString(),
    });
  }),
);

export default router;
