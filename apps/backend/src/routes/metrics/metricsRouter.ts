// SPDX-License-Identifier: MIT
// apps/backend/src/routes/metrics/metricsRouter.ts

import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { metricsService } from "../../services/metricsService.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("metrics");
const router = Router();

/**
 * @route   GET /api/metrics
 * @desc    Get Prometheus metrics
 * @access  Public (but should be protected in production)
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    logger.debug("Metrics endpoint accessed");

    const metrics = await metricsService.getMetrics();
    const contentType = metricsService.getContentType();

    res.set("Content-Type", contentType);
    res.send(metrics);
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
