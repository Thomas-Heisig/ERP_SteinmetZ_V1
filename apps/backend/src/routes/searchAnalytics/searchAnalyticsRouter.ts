// SPDX-License-Identifier: MIT
// apps/backend/src/routes/searchAnalytics/searchAnalyticsRouter.ts

import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { BadRequestError } from "../../types/errors.js";
import { searchAnalyticsService } from "../../services/searchAnalyticsService.js";

const router = Router();

/**
 * GET /api/search/analytics/dashboard
 * Get search analytics dashboard data
 * Query params:
 *   - hours: number (default: 24) - Time range in hours
 */
router.get(
  "/analytics/dashboard",
  asyncHandler(async (req, res) => {
    const hours = parseInt(req.query.hours as string) || 24;

    if (hours < 1 || hours > 8760) {
      throw new BadRequestError(
        "Hours parameter must be between 1 and 8760 (1 year)",
      );
    }

    const data = searchAnalyticsService.getDashboard(hours);
    res.json({ success: true, data });
  }),
);

/**
 * GET /api/search/analytics/metrics
 * Get search metrics
 * Query params:
 *   - hours: number (default: 24) - Time range in hours
 */
router.get(
  "/analytics/metrics",
  asyncHandler(async (req, res) => {
    const hours = parseInt(req.query.hours as string) || 24;

    if (hours < 1 || hours > 8760) {
      throw new BadRequestError(
        "Hours parameter must be between 1 and 8760 (1 year)",
      );
    }

    const metrics = searchAnalyticsService.getMetrics(hours);
    res.json({ success: true, data: metrics });
  }),
);

/**
 * GET /api/search/analytics/top-queries
 * Get top search queries
 * Query params:
 *   - limit: number (default: 10) - Number of results
 *   - hours: number (default: 24) - Time range in hours
 */
router.get(
  "/analytics/top-queries",
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const hours = parseInt(req.query.hours as string) || 24;

    if (limit < 1 || limit > 100) {
      throw new BadRequestError("Limit parameter must be between 1 and 100");
    }

    if (hours < 1 || hours > 8760) {
      throw new BadRequestError(
        "Hours parameter must be between 1 and 8760 (1 year)",
      );
    }

    const queries = searchAnalyticsService.getTopQueries(limit, hours);
    res.json({ success: true, data: queries });
  }),
);

/**
 * GET /api/search/analytics/zero-results
 * Get queries with zero results
 * Query params:
 *   - limit: number (default: 10) - Number of results
 *   - hours: number (default: 24) - Time range in hours
 */
router.get(
  "/analytics/zero-results",
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const hours = parseInt(req.query.hours as string) || 24;

    if (limit < 1 || limit > 100) {
      throw new BadRequestError("Limit parameter must be between 1 and 100");
    }

    if (hours < 1 || hours > 8760) {
      throw new BadRequestError(
        "Hours parameter must be between 1 and 8760 (1 year)",
      );
    }

    const queries = searchAnalyticsService.getZeroResultQueries(limit, hours);
    res.json({ success: true, data: queries });
  }),
);

/**
 * GET /api/search/analytics/trends
 * Get search trends over time
 * Query params:
 *   - hours: number (default: 24) - Time range in hours
 *   - granularity: "hour" | "day" (default: "hour")
 */
router.get(
  "/analytics/trends",
  asyncHandler(async (req, res) => {
    const hours = parseInt(req.query.hours as string) || 24;
    const granularity = (req.query.granularity as "hour" | "day") || "hour";

    if (hours < 1 || hours > 8760) {
      throw new BadRequestError(
        "Hours parameter must be between 1 and 8760 (1 year)",
      );
    }

    if (granularity !== "hour" && granularity !== "day") {
      throw new BadRequestError('Granularity must be "hour" or "day"');
    }

    const trends = searchAnalyticsService.getTrends(hours, granularity);
    res.json({ success: true, data: trends });
  }),
);

/**
 * GET /api/search/analytics/performance
 * Get performance distribution
 * Query params:
 *   - hours: number (default: 24) - Time range in hours
 */
router.get(
  "/analytics/performance",
  asyncHandler(async (req, res) => {
    const hours = parseInt(req.query.hours as string) || 24;

    if (hours < 1 || hours > 8760) {
      throw new BadRequestError(
        "Hours parameter must be between 1 and 8760 (1 year)",
      );
    }

    const distribution =
      searchAnalyticsService.getPerformanceDistribution(hours);
    res.json({ success: true, data: distribution });
  }),
);

/**
 * POST /api/search/analytics/log
 * Log a search query
 * Body:
 *   - query: string (required) - Search query
 *   - resultCount: number (required) - Number of results returned
 *   - latencyMs: number (required) - Search latency in milliseconds
 *   - filters: object (optional) - Search filters applied
 *   - userId: string (optional) - User ID who performed the search
 */
router.post(
  "/analytics/log",
  asyncHandler(async (req, res) => {
    const { query, resultCount, latencyMs, filters, userId } = req.body;

    if (!query || typeof query !== "string") {
      throw new BadRequestError("Query is required and must be a string");
    }

    if (typeof resultCount !== "number" || resultCount < 0) {
      throw new BadRequestError(
        "Result count is required and must be a non-negative number",
      );
    }

    if (typeof latencyMs !== "number" || latencyMs < 0) {
      throw new BadRequestError(
        "Latency is required and must be a non-negative number",
      );
    }

    const log = searchAnalyticsService.logQuery(
      query,
      resultCount,
      latencyMs,
      filters,
      userId,
    );

    res.json({ success: true, data: log });
  }),
);

/**
 * POST /api/search/analytics/click
 * Log a click on a search result
 * Body:
 *   - queryId: string (required) - Search query ID
 *   - resultId: string (required) - Clicked result ID
 */
router.post(
  "/analytics/click",
  asyncHandler(async (req, res) => {
    const { queryId, resultId } = req.body;

    if (!queryId || typeof queryId !== "string") {
      throw new BadRequestError("Query ID is required and must be a string");
    }

    if (!resultId || typeof resultId !== "string") {
      throw new BadRequestError("Result ID is required and must be a string");
    }

    searchAnalyticsService.logClick(queryId, resultId);
    res.json({ success: true, message: "Click logged successfully" });
  }),
);

/**
 * GET /api/search/analytics/export
 * Export analytics data
 * Query params:
 *   - startDate: string (optional) - Start date in ISO format
 *   - endDate: string (optional) - End date in ISO format
 */
router.get(
  "/analytics/export",
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    if (startDate && typeof startDate !== "string") {
      throw new BadRequestError("Start date must be a string");
    }

    if (endDate && typeof endDate !== "string") {
      throw new BadRequestError("End date must be a string");
    }

    const data = searchAnalyticsService.exportData(
      startDate as string | undefined,
      endDate as string | undefined,
    );

    res.json({ success: true, data });
  }),
);

/**
 * POST /api/search/analytics/cleanup
 * Clean up old analytics data
 * Body:
 *   - daysToKeep: number (default: 30) - Number of days to keep
 */
router.post(
  "/analytics/cleanup",
  asyncHandler(async (req, res) => {
    const daysToKeep = parseInt(req.body.daysToKeep) || 30;

    if (daysToKeep < 1 || daysToKeep > 365) {
      throw new BadRequestError(
        "Days to keep must be between 1 and 365",
      );
    }

    const deleted = searchAnalyticsService.cleanup(daysToKeep);
    res.json({
      success: true,
      message: `Cleaned up ${deleted} old log entries`,
      deleted,
    });
  }),
);

export default router;
