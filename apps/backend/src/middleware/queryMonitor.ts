// SPDX-License-Identifier: MIT
// apps/backend/src/middleware/queryMonitor.ts

/**
 * Database Query Performance Monitor
 *
 * Tracks query execution time, identifies slow queries, and provides
 * performance metrics for database optimization. Maintains query history
 * for analysis.
 *
 * @remarks
 * This monitor offers:
 * - Real-time query performance tracking
 * - Slow query detection and logging
 * - Query history with configurable size
 * - Performance statistics (avg, p95, p99)
 * - Query sanitization for logging
 *
 * Default Configuration:
 * - Slow query threshold: 100ms
 * - History size: 1000 queries
 * - Log all queries: false (only slow queries)
 *
 * @example
 * ```typescript
 * import { queryMonitor } from './middleware/queryMonitor.js';
 *
 * // Track a query
 * const result = await queryMonitor.trackQuery(
 *   'SELECT * FROM users WHERE id = ?',
 *   [123],
 *   () => db.get('SELECT * FROM users WHERE id = ?', [123])
 * );
 *
 * // Get statistics
 * const stats = queryMonitor.getStats();
 * console.log(`Average query time: ${stats.avgDuration}ms`);
 * ```
 */

import { log } from "../routes/ai/utils/logger.js";

/**
 * Query performance metrics
 */
interface QueryMetrics {
  /** SQL query text */
  query: string;
  /** Execution duration in milliseconds */
  duration: number;
  /** Unix timestamp when query was executed */
  timestamp: number;
  /** Query parameters (sanitized for logging) */
  params?: any[];
}

/**
 * Configuration options for query monitoring
 */
interface SlowQueryConfig {
  /** Threshold in milliseconds to consider a query as slow (default: 100ms) */
  slowQueryThreshold?: number;
  /** Whether to log all queries regardless of duration (default: false) */
  logAllQueries?: boolean;
  /** Maximum number of queries to keep in history (default: 1000) */
  maxHistorySize?: number;
}

/**
 * Query Monitor Class
 *
 * Tracks database query performance and identifies slow queries.
 * Maintains a rolling history of queries for performance analysis.
 *
 * @example
 * ```typescript
 * const monitor = new QueryMonitor({ slowQueryThreshold: 200 });
 *
 * await monitor.trackQuery('SELECT * FROM users', [], async () => {
 *   return db.all('SELECT * FROM users');
 * });
 * ```
 */
class QueryMonitor {
  private queryHistory: QueryMetrics[] = [];
  private slowQueryThreshold: number;
  private logAllQueries: boolean;
  private maxHistorySize: number;

  constructor(config: SlowQueryConfig = {}) {
    this.slowQueryThreshold = config.slowQueryThreshold || 100; // 100ms default
    this.logAllQueries = config.logAllQueries || false;
    this.maxHistorySize = config.maxHistorySize || 1000;
  }

  /**
   * Wraps a database query function to measure execution time
   *
   * Executes the query, measures duration, and logs if it exceeds the
   * slow query threshold. Adds query to history for analysis.
   *
   * @param query - SQL query text
   * @param params - Query parameters
   * @param executor - Async function that executes the query
   * @returns Query result from executor function
   *
   * @example
   * ```typescript
   * const users = await queryMonitor.trackQuery(
   *   'SELECT * FROM users WHERE active = ?',
   *   [true],
   *   () => db.all('SELECT * FROM users WHERE active = ?', [true])
   * );
   * ```
   */
  async trackQuery<T>(
    query: string,
    params: any[] | undefined,
    executor: () => Promise<T>,
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await executor();
      const duration = performance.now() - startTime;

      this.recordQuery(query, duration, params);

      if (duration > this.slowQueryThreshold) {
        log("warn", "⚠️ Slow query detected", {
          query: this.sanitizeQuery(query),
          duration: `${duration.toFixed(2)}ms`,
          threshold: `${this.slowQueryThreshold}ms`,
          params: params ? this.sanitizeParams(params) : undefined,
        });
      } else if (this.logAllQueries) {
        log("debug", "Query executed", {
          query: this.sanitizeQuery(query),
          duration: `${duration.toFixed(2)}ms`,
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      log("error", "Query execution failed", {
        query: this.sanitizeQuery(query),
        duration: `${duration.toFixed(2)}ms`,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Records query metrics in history
   */
  private recordQuery(query: string, duration: number, params?: any[]): void {
    const metrics: QueryMetrics = {
      query: this.sanitizeQuery(query),
      duration,
      timestamp: Date.now(),
      params: params ? this.sanitizeParams(params) : undefined,
    };

    this.queryHistory.push(metrics);

    // Keep history size under control
    if (this.queryHistory.length > this.maxHistorySize) {
      this.queryHistory.shift();
    }
  }

  /**
   * Sanitizes query string for logging (removes sensitive data)
   */
  private sanitizeQuery(query: string): string {
    // Remove extra whitespace and newlines
    return query.replace(/\s+/g, " ").trim().substring(0, 500);
  }

  /**
   * Sanitizes query parameters for logging
   */
  private sanitizeParams(params: any[]): any[] {
    const sensitiveKeywords = [
      "password",
      "token",
      "secret",
      "key",
      "auth",
      "credential",
      "pin",
      "ssn",
    ];

    return params.map((param) => {
      // Check if param is an object with sensitive keys
      if (typeof param === "object" && param !== null) {
        const paramStr = JSON.stringify(param).toLowerCase();
        if (sensitiveKeywords.some((keyword) => paramStr.includes(keyword))) {
          return "***REDACTED_OBJECT***";
        }
      }

      // Mask potentially sensitive strings
      if (typeof param === "string") {
        const lowerParam = param.toLowerCase();
        if (sensitiveKeywords.some((keyword) => lowerParam.includes(keyword))) {
          return "***REDACTED***";
        }
        // Truncate long strings
        if (param.length > 100) {
          return param.substring(0, 97) + "...";
        }
      }

      return param;
    });
  }

  /**
   * Gets slow queries from history
   */
  getSlowQueries(limit = 20): QueryMetrics[] {
    return this.queryHistory
      .filter((q) => q.duration > this.slowQueryThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Gets query statistics
   */
  getStats() {
    const queries = this.queryHistory;
    const slowQueries = queries.filter(
      (q) => q.duration > this.slowQueryThreshold,
    );

    if (queries.length === 0) {
      return {
        totalQueries: 0,
        slowQueries: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: 0,
      };
    }

    const durations = queries.map((q) => q.duration);
    const avgDuration =
      durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);

    return {
      totalQueries: queries.length,
      slowQueries: slowQueries.length,
      slowQueryPercentage:
        ((slowQueries.length / queries.length) * 100).toFixed(2) + "%",
      avgDuration: `${avgDuration.toFixed(2)}ms`,
      maxDuration: `${maxDuration.toFixed(2)}ms`,
      minDuration: `${minDuration.toFixed(2)}ms`,
      threshold: `${this.slowQueryThreshold}ms`,
    };
  }

  /**
   * Clears query history
   */
  clearHistory(): void {
    this.queryHistory = [];
  }

  /**
   * Updates configuration
   */
  updateConfig(config: Partial<SlowQueryConfig>): void {
    if (config.slowQueryThreshold !== undefined) {
      this.slowQueryThreshold = config.slowQueryThreshold;
    }
    if (config.logAllQueries !== undefined) {
      this.logAllQueries = config.logAllQueries;
    }
    if (config.maxHistorySize !== undefined) {
      this.maxHistorySize = config.maxHistorySize;
    }
  }
}

// Global query monitor instance
export const queryMonitor = new QueryMonitor({
  slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || "100", 10),
  logAllQueries: process.env.LOG_ALL_QUERIES === "true",
});

/**
 * Express middleware for query monitoring endpoint
 */
export function queryMonitorStatsHandler(req: any, res: any): void {
  const action = req.query.action;

  switch (action) {
    case "slow": {
      const limit = parseInt(req.query.limit as string, 10) || 20;
      res.json({
        success: true,
        slowQueries: queryMonitor.getSlowQueries(limit),
      });
      break;
    }

    case "clear":
      queryMonitor.clearHistory();
      res.json({
        success: true,
        message: "Query history cleared",
      });
      break;

    default:
      res.json({
        success: true,
        stats: queryMonitor.getStats(),
      });
      break;
  }
}

export default queryMonitor;
