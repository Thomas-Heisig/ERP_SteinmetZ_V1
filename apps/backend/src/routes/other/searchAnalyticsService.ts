// SPDX-License-Identifier: MIT
// apps/backend/src/routes/other/searchAnalyticsService.ts

/**
 * Search Analytics Service
 * Tracks search queries, performance, and user behavior
 *
 * Features:
 * - Query logging and tracking
 * - Performance metrics (latency, P95, P99)
 * - Popular searches analysis
 * - Zero-result queries tracking
 * - Search trends over time
 * - Click-through rate tracking
 * - Data export and cleanup
 *
 * @example
 * ```typescript
 * import { searchAnalyticsService } from './searchAnalyticsService.js';
 *
 * // Log a search
 * searchAnalyticsService.logQuery('customer', 42, 125);
 *
 * // Get metrics
 * const metrics = searchAnalyticsService.getMetrics(24);
 * ```
 */

import { createLogger } from "../../utils/logger.js";

const logger = createLogger("search-analytics");

/**
 * Logged search query entry
 */
export interface SearchQueryLog {
  /** Unique log entry ID */
  id: string;
  /** Normalized search query (lowercase, trimmed) */
  query: string;
  /** Optional filters applied to search */
  filters?: Record<string, unknown>;
  /** Number of results returned */
  resultCount: number;
  /** Search latency in milliseconds */
  latencyMs: number;
  /** Optional user ID who performed the search */
  userId?: string;
  /** ISO timestamp when query was executed */
  timestamp: string;
  /** IDs of results that were clicked */
  clickedResults?: string[];
}

/**
 * Aggregated search metrics
 */
export interface SearchMetrics {
  /** Total number of queries in period */
  totalQueries: number;
  /** Number of unique query strings */
  uniqueQueries: number;
  /** Average latency across all queries (ms) */
  averageLatency: number;
  /** 95th percentile latency (ms) */
  p95Latency: number;
  /** 99th percentile latency (ms) */
  p99Latency: number;
  /** Percentage of queries with zero results (0-1) */
  zeroResultsRate: number;
  /** Percentage of queries with clicks (0-1) */
  clickThroughRate: number;
}

/**
 * Popular search query statistics
 */
export interface PopularQuery {
  /** Search query text */
  query: string;
  /** Number of times searched */
  count: number;
  /** Average number of results returned */
  averageResults: number;
  /** Average search latency (ms) */
  averageLatency: number;
}

/**
 * Search trend data point
 */
export interface SearchTrend {
  /** ISO timestamp of bucket */
  timestamp: string;
  /** Number of queries in bucket */
  queryCount: number;
  /** Average latency in bucket (ms) */
  averageLatency: number;
  /** Number of zero-result queries in bucket */
  zeroResultsCount: number;
}

/**
 * Complete dashboard data
 */
export interface SearchAnalyticsDashboard {
  /** Summary metrics */
  summary: SearchMetrics;
  /** Top search queries */
  topQueries: PopularQuery[];
  /** Queries with zero results */
  zeroResultQueries: PopularQuery[];
  /** Trends over time */
  trends: SearchTrend[];
  /** Performance distribution by latency ranges */
  performanceDistribution: {
    range: string;
    count: number;
  }[];
}

export class SearchAnalyticsService {
  private queryLogs: SearchQueryLog[] = [];
  private maxLogs = 10000; // Keep last 10k queries in memory

  /**
   * Log a search query
   *
   * @param query - Search query string
   * @param resultCount - Number of results returned
   * @param latencyMs - Search latency in milliseconds
   * @param filters - Optional search filters
   * @param userId - Optional user ID
   * @returns Logged query entry
   *
   * @example
   * ```typescript
   * searchAnalyticsService.logQuery('customer', 42, 125, { kind: 'action' }, 'user123');
   * ```
   */
  logQuery(
    query: string,
    resultCount: number,
    latencyMs: number,
    filters?: Record<string, unknown>,
    userId?: string,
  ): SearchQueryLog {
    if (!query || typeof query !== "string") {
      logger.warn({ query }, "Invalid query string provided to logQuery");
      query = "";
    }

    const log: SearchQueryLog = {
      id: `sq_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      query: query.trim().toLowerCase(),
      filters,
      resultCount: Math.max(0, resultCount),
      latencyMs: Math.max(0, latencyMs),
      userId,
      timestamp: new Date().toISOString(),
    };

    this.queryLogs.push(log);

    // Keep only the most recent logs
    if (this.queryLogs.length > this.maxLogs) {
      const removed = this.queryLogs.length - this.maxLogs;
      this.queryLogs = this.queryLogs.slice(-this.maxLogs);
      logger.debug({ removed }, "Trimmed old query logs");
    }

    logger.debug(
      { queryId: log.id, query: log.query, resultCount, latencyMs },
      "Logged search query",
    );

    return log;
  }

  /**
   * Log when a user clicks on a search result
   *
   * @param queryId - Search query log ID
   * @param resultId - Clicked result ID
   *
   * @example
   * ```typescript
   * searchAnalyticsService.logClick('sq_1234567890_abc', 'result_xyz');
   * ```
   */
  logClick(queryId: string, resultId: string): void {
    const log = this.queryLogs.find((q) => q.id === queryId);
    if (log) {
      if (!log.clickedResults) {
        log.clickedResults = [];
      }
      log.clickedResults.push(resultId);
      logger.debug(
        { queryId, resultId, query: log.query },
        "Logged click on search result",
      );
    } else {
      logger.warn({ queryId, resultId }, "Query not found for click tracking");
    }
  }

  /**
   * Get search metrics for a time period
   *
   * @param hours - Number of hours to analyze (default: 24)
   * @returns Aggregated search metrics
   *
   * @example
   * ```typescript
   * const metrics = searchAnalyticsService.getMetrics(24);
   * console.log(`${metrics.totalQueries} searches in last 24h`);
   * ```
   */
  getMetrics(hours = 24): SearchMetrics {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const recentLogs = this.queryLogs.filter((q) => q.timestamp >= cutoff);

    logger.debug({ hours, logCount: recentLogs.length }, "Calculating metrics");

    if (recentLogs.length === 0) {
      return {
        totalQueries: 0,
        uniqueQueries: 0,
        averageLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        zeroResultsRate: 0,
        clickThroughRate: 0,
      };
    }

    const uniqueQueries = new Set(recentLogs.map((q) => q.query)).size;
    const totalLatency = recentLogs.reduce((sum, q) => sum + q.latencyMs, 0);
    const averageLatency = totalLatency / recentLogs.length;

    // Calculate percentiles
    const sortedLatencies = recentLogs
      .map((q) => q.latencyMs)
      .sort((a, b) => a - b);
    const p95Index = Math.floor(sortedLatencies.length * 0.95);
    const p99Index = Math.floor(sortedLatencies.length * 0.99);

    const zeroResultsCount = recentLogs.filter(
      (q) => q.resultCount === 0,
    ).length;
    const zeroResultsRate = zeroResultsCount / recentLogs.length;

    const queriesWithClicks = recentLogs.filter(
      (q) => q.clickedResults && q.clickedResults.length > 0,
    ).length;
    const clickThroughRate = queriesWithClicks / recentLogs.length;

    return {
      totalQueries: recentLogs.length,
      uniqueQueries,
      averageLatency: Math.round(averageLatency * 100) / 100,
      p95Latency: sortedLatencies[p95Index] || 0,
      p99Latency: sortedLatencies[p99Index] || 0,
      zeroResultsRate: Math.round(zeroResultsRate * 100) / 100,
      clickThroughRate: Math.round(clickThroughRate * 100) / 100,
    };
  }

  /**
   * Get top search queries by frequency
   *
   * @param limit - Maximum number of queries to return (default: 10)
   * @param hours - Time period in hours (default: 24)
   * @returns Popular queries sorted by count
   *
   * @example
   * ```typescript
   * const top = searchAnalyticsService.getTopQueries(5, 24);
   * ```
   */
  getTopQueries(limit = 10, hours = 24): PopularQuery[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const recentLogs = this.queryLogs.filter((q) => q.timestamp >= cutoff);

    const queryMap = new Map<string, SearchQueryLog[]>();

    for (const log of recentLogs) {
      const logs = queryMap.get(log.query);
      if (logs) {
        logs.push(log);
      } else {
        queryMap.set(log.query, [log]);
      }
    }

    const popularQueries: PopularQuery[] = [];

    for (const [query, logs] of queryMap.entries()) {
      const totalResults = logs.reduce((sum, l) => sum + l.resultCount, 0);
      const totalLatency = logs.reduce((sum, l) => sum + l.latencyMs, 0);

      popularQueries.push({
        query,
        count: logs.length,
        averageResults: Math.round(totalResults / logs.length),
        averageLatency: Math.round((totalLatency / logs.length) * 100) / 100,
      });
    }

    return popularQueries.sort((a, b) => b.count - a.count).slice(0, limit);
  }

  /**
   * Get queries with zero results (failed searches)
   *
   * @param limit - Maximum number of queries to return (default: 10)
   * @param hours - Time period in hours (default: 24)
   * @returns Zero-result queries sorted by frequency
   *
   * @example
   * ```typescript
   * const failed = searchAnalyticsService.getZeroResultQueries(10, 24);
   * ```
   */
  getZeroResultQueries(limit = 10, hours = 24): PopularQuery[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const recentLogs = this.queryLogs.filter(
      (q) => q.timestamp >= cutoff && q.resultCount === 0,
    );

    const queryMap = new Map<string, SearchQueryLog[]>();

    for (const log of recentLogs) {
      const logs = queryMap.get(log.query);
      if (logs) {
        logs.push(log);
      } else {
        queryMap.set(log.query, [log]);
      }
    }

    const zeroResultQueries: PopularQuery[] = [];

    for (const [query, logs] of queryMap.entries()) {
      const totalLatency = logs.reduce((sum, l) => sum + l.latencyMs, 0);

      zeroResultQueries.push({
        query,
        count: logs.length,
        averageResults: 0,
        averageLatency: Math.round((totalLatency / logs.length) * 100) / 100,
      });
    }

    return zeroResultQueries.sort((a, b) => b.count - a.count).slice(0, limit);
  }

  /**
   * Get search trends over time
   *
   * @param hours - Time period in hours (default: 24)
   * @param granularity - Bucket size: 'hour' or 'day' (default: 'hour')
   * @returns Time-series trend data
   *
   * @example
   * ```typescript
   * const hourly = searchAnalyticsService.getTrends(24, 'hour');
   * const daily = searchAnalyticsService.getTrends(168, 'day');
   * ```
   */
  getTrends(hours = 24, granularity: "hour" | "day" = "hour"): SearchTrend[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const recentLogs = this.queryLogs.filter((q) => q.timestamp >= cutoff);

    const bucketMap = new Map<string, SearchQueryLog[]>();

    for (const log of recentLogs) {
      const date = new Date(log.timestamp);
      let bucketKey: string;

      if (granularity === "hour") {
        date.setMinutes(0, 0, 0);
        bucketKey = date.toISOString();
      } else {
        date.setHours(0, 0, 0, 0);
        bucketKey = date.toISOString();
      }

      const logs = bucketMap.get(bucketKey);
      if (logs) {
        logs.push(log);
      } else {
        bucketMap.set(bucketKey, [log]);
      }
    }

    const trends: SearchTrend[] = [];

    for (const [timestamp, logs] of bucketMap.entries()) {
      const totalLatency = logs.reduce((sum, l) => sum + l.latencyMs, 0);
      const zeroResultsCount = logs.filter((l) => l.resultCount === 0).length;

      trends.push({
        timestamp,
        queryCount: logs.length,
        averageLatency: Math.round((totalLatency / logs.length) * 100) / 100,
        zeroResultsCount,
      });
    }

    return trends.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  /**
   * Get performance distribution by latency ranges
   *
   * @param hours - Time period in hours (default: 24)
   * @returns Distribution of queries across latency buckets
   *
   * @example
   * ```typescript
   * const dist = searchAnalyticsService.getPerformanceDistribution(24);
   * // [{ range: '0-10ms', count: 100 }, ...]
   * ```
   */
  getPerformanceDistribution(hours = 24): { range: string; count: number }[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const recentLogs = this.queryLogs.filter((q) => q.timestamp >= cutoff);

    const ranges = [
      { range: "0-10ms", min: 0, max: 10, count: 0 },
      { range: "10-50ms", min: 10, max: 50, count: 0 },
      { range: "50-100ms", min: 50, max: 100, count: 0 },
      { range: "100-500ms", min: 100, max: 500, count: 0 },
      { range: "500ms+", min: 500, max: Infinity, count: 0 },
    ];

    for (const log of recentLogs) {
      for (const range of ranges) {
        if (log.latencyMs >= range.min && log.latencyMs < range.max) {
          range.count++;
          break;
        }
      }
    }

    return ranges.map((r) => ({ range: r.range, count: r.count }));
  }

  /**
   * Get complete dashboard data
   *
   * @param hours - Time period in hours (default: 24)
   * @returns Full analytics dashboard with all metrics
   *
   * @example
   * ```typescript
   * const dashboard = searchAnalyticsService.getDashboard(24);
   * ```
   */
  getDashboard(hours = 24): SearchAnalyticsDashboard {
    return {
      summary: this.getMetrics(hours),
      topQueries: this.getTopQueries(10, hours),
      zeroResultQueries: this.getZeroResultQueries(10, hours),
      trends: this.getTrends(hours, hours > 48 ? "day" : "hour"),
      performanceDistribution: this.getPerformanceDistribution(hours),
    };
  }

  /**
   * Export analytics data for external analysis
   *
   * @param startDate - Optional start date (ISO string)
   * @param endDate - Optional end date (ISO string)
   * @returns Filtered query logs
   *
   * @example
   * ```typescript
   * const data = searchAnalyticsService.exportData(
   *   '2025-12-01T00:00:00Z',
   *   '2025-12-20T23:59:59Z'
   * );
   * ```
   */
  exportData(startDate?: string, endDate?: string): SearchQueryLog[] {
    let logs = this.queryLogs;

    if (startDate) {
      logs = logs.filter((q) => q.timestamp >= startDate);
    }

    if (endDate) {
      logs = logs.filter((q) => q.timestamp <= endDate);
    }

    logger.info(
      { startDate, endDate, exportedCount: logs.length },
      "Exported analytics data",
    );

    return logs;
  }

  /**
   * Clear old logs for maintenance
   *
   * @param daysToKeep - Number of days to keep (default: 30)
   * @returns Number of deleted log entries
   *
   * @example
   * ```typescript
   * const deleted = searchAnalyticsService.cleanup(30);
   * console.log(`Deleted ${deleted} old logs`);
   * ```
   */
  cleanup(daysToKeep = 30): number {
    const cutoff = new Date(
      Date.now() - daysToKeep * 24 * 60 * 60 * 1000,
    ).toISOString();
    const before = this.queryLogs.length;
    this.queryLogs = this.queryLogs.filter((q) => q.timestamp >= cutoff);
    const deleted = before - this.queryLogs.length;

    logger.info(
      { daysToKeep, deleted, remaining: this.queryLogs.length },
      "Cleaned up old query logs",
    );

    return deleted;
  }
}

export const searchAnalyticsService = new SearchAnalyticsService();
