// SPDX-License-Identifier: MIT
// apps/backend/src/services/searchAnalyticsService.ts

/**
 * Search Analytics Service
 * Tracks search queries, performance, and user behavior
 */

export interface SearchQueryLog {
  id: string;
  query: string;
  filters?: Record<string, any>;
  resultCount: number;
  latencyMs: number;
  userId?: string;
  timestamp: string;
  clickedResults?: string[];
}

export interface SearchMetrics {
  totalQueries: number;
  uniqueQueries: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  zeroResultsRate: number;
  clickThroughRate: number;
}

export interface PopularQuery {
  query: string;
  count: number;
  averageResults: number;
  averageLatency: number;
}

export interface SearchTrend {
  timestamp: string;
  queryCount: number;
  averageLatency: number;
  zeroResultsCount: number;
}

export interface SearchAnalyticsDashboard {
  summary: SearchMetrics;
  topQueries: PopularQuery[];
  zeroResultQueries: PopularQuery[];
  trends: SearchTrend[];
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
   */
  logQuery(
    query: string,
    resultCount: number,
    latencyMs: number,
    filters?: Record<string, any>,
    userId?: string,
  ): SearchQueryLog {
    const log: SearchQueryLog = {
      id: `sq_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      query: query.trim().toLowerCase(),
      filters,
      resultCount,
      latencyMs,
      userId,
      timestamp: new Date().toISOString(),
    };

    this.queryLogs.push(log);

    // Keep only the most recent logs
    if (this.queryLogs.length > this.maxLogs) {
      this.queryLogs = this.queryLogs.slice(-this.maxLogs);
    }

    return log;
  }

  /**
   * Log when a user clicks on a search result
   */
  logClick(queryId: string, resultId: string): void {
    const log = this.queryLogs.find((q) => q.id === queryId);
    if (log) {
      if (!log.clickedResults) {
        log.clickedResults = [];
      }
      log.clickedResults.push(resultId);
    }
  }

  /**
   * Get search metrics for a time period
   */
  getMetrics(hours = 24): SearchMetrics {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const recentLogs = this.queryLogs.filter((q) => q.timestamp >= cutoff);

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

    const zeroResultsCount = recentLogs.filter((q) => q.resultCount === 0).length;
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
   * Get top search queries
   */
  getTopQueries(limit = 10, hours = 24): PopularQuery[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const recentLogs = this.queryLogs.filter((q) => q.timestamp >= cutoff);

    const queryMap = new Map<string, SearchQueryLog[]>();

    for (const log of recentLogs) {
      if (!queryMap.has(log.query)) {
        queryMap.set(log.query, []);
      }
      queryMap.get(log.query)!.push(log);
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

    return popularQueries
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get queries with zero results
   */
  getZeroResultQueries(limit = 10, hours = 24): PopularQuery[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const recentLogs = this.queryLogs.filter(
      (q) => q.timestamp >= cutoff && q.resultCount === 0,
    );

    const queryMap = new Map<string, SearchQueryLog[]>();

    for (const log of recentLogs) {
      if (!queryMap.has(log.query)) {
        queryMap.set(log.query, []);
      }
      queryMap.get(log.query)!.push(log);
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

    return zeroResultQueries
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get search trends over time
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

      if (!bucketMap.has(bucketKey)) {
        bucketMap.set(bucketKey, []);
      }
      bucketMap.get(bucketKey)!.push(log);
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
   * Get performance distribution
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
   * Get dashboard data
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
   * Export analytics data (for external analysis)
   */
  exportData(
    startDate?: string,
    endDate?: string,
  ): SearchQueryLog[] {
    let logs = this.queryLogs;

    if (startDate) {
      logs = logs.filter((q) => q.timestamp >= startDate);
    }

    if (endDate) {
      logs = logs.filter((q) => q.timestamp <= endDate);
    }

    return logs;
  }

  /**
   * Clear old logs (for maintenance)
   */
  cleanup(daysToKeep = 30): number {
    const cutoff = new Date(
      Date.now() - daysToKeep * 24 * 60 * 60 * 1000,
    ).toISOString();
    const before = this.queryLogs.length;
    this.queryLogs = this.queryLogs.filter((q) => q.timestamp >= cutoff);
    return before - this.queryLogs.length;
  }
}

export const searchAnalyticsService = new SearchAnalyticsService();
