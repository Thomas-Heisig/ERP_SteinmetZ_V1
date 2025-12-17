// SPDX-License-Identifier: MIT
// apps/frontend/src/components/SearchAnalytics/SearchAnalyticsDashboard.tsx

import React, { useState, useEffect, useCallback } from "react";
import styles from "./SearchAnalyticsDashboard.module.css";

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

export interface PerformanceDistribution {
  range: string;
  count: number;
}

export interface DashboardData {
  summary: SearchMetrics;
  topQueries: PopularQuery[];
  zeroResultQueries: PopularQuery[];
  trends: SearchTrend[];
  performanceDistribution: PerformanceDistribution[];
}

export interface SearchAnalyticsDashboardProps {
  apiBaseUrl?: string;
}

export const SearchAnalyticsDashboard: React.FC<
  SearchAnalyticsDashboardProps
> = ({ apiBaseUrl = "http://localhost:3000" }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(24);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiBaseUrl}/api/search/analytics/dashboard?hours=${timeRange}`,
      );
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch search analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, timeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Set dynamic widths/heights imperatively to avoid inline styles
  useEffect(() => {
    if (!data) return;

    // Set query bar widths
    const { topQueries, performanceDistribution, trends, summary } = data;

    if (topQueries.length > 0) {
      topQueries.forEach((query, index) => {
        const bar = document.querySelector(
          `[data-query-bar="${index}"]`,
        ) as HTMLElement;
        if (bar) {
          bar.style.width = `${(query.count / topQueries[0].count) * 100}%`;
        }
      });
    }

    // Set performance bar widths
    performanceDistribution.forEach((item, index) => {
      const bar = document.querySelector(
        `[data-performance-bar="${index}"]`,
      ) as HTMLElement;
      if (bar) {
        bar.style.width = `${(item.count / summary.totalQueries) * 100}%`;
      }
    });

    // Set trend bar heights
    if (trends.length > 0) {
      const maxQueries = Math.max(...trends.map((t) => t.queryCount));
      trends.forEach((trend, index) => {
        const height = (trend.queryCount / maxQueries) * 200;
        const bar = document.querySelector(
          `[data-trend-bar="${index}"]`,
        ) as HTMLElement;
        if (bar) {
          bar.style.height = `${height}px`;
        }
      });
    }
  }, [data]);

  if (loading) {
    return <div className={styles.loading}>Loading Search Analytics...</div>;
  }

  if (!data) {
    return <div className={styles.error}>Failed to load analytics data</div>;
  }

  const {
    summary,
    topQueries,
    zeroResultQueries,
    trends,
    performanceDistribution,
  } = data;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Search Analytics Dashboard</h1>
        <div className={styles.timeRangeSelector}>
          <label htmlFor="timeRange" className={styles.label}>
            Time Range:
          </label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className={styles.select}
            aria-label="Select time range for analytics"
          >
            <option value={1}>Last Hour</option>
            <option value={24}>Last 24 Hours</option>
            <option value={168}>Last Week</option>
            <option value={720}>Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className={styles.cardGrid}>
        <MetricCard
          title="Total Queries"
          value={summary.totalQueries.toLocaleString()}
          color="#007bff"
        />
        <MetricCard
          title="Unique Queries"
          value={summary.uniqueQueries.toLocaleString()}
          color="#28a745"
        />
        <MetricCard
          title="Avg Latency"
          value={`${summary.averageLatency.toFixed(1)}ms`}
          color="#17a2b8"
        />
        <MetricCard
          title="P95 Latency"
          value={`${summary.p95Latency}ms`}
          color="#ffc107"
        />
        <MetricCard
          title="P99 Latency"
          value={`${summary.p99Latency}ms`}
          color="#fd7e14"
        />
        <MetricCard
          title="Zero Results"
          value={`${(summary.zeroResultsRate * 100).toFixed(1)}%`}
          color="#dc3545"
        />
        <MetricCard
          title="Click-Through Rate"
          value={`${(summary.clickThroughRate * 100).toFixed(1)}%`}
          color="#6f42c1"
        />
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Top Queries */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Top Search Queries</h2>
          {topQueries.length === 0 ? (
            <p className={styles.emptyState}>No queries yet</p>
          ) : (
            <div className={styles.queryList}>
              {topQueries.map((query, index) => (
                <div key={index} className={styles.queryItem}>
                  <div className={styles.queryRank}>{index + 1}</div>
                  <div className={styles.queryDetails}>
                    <div className={styles.queryText}>{query.query}</div>
                    <div className={styles.queryStats}>
                      {query.count} searches • {query.averageResults} avg
                      results • {query.averageLatency}ms
                    </div>
                  </div>
                  <div className={styles.queryBar}>
                    <div
                      className={styles.queryBarFill}
                      data-query-bar={index}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zero Result Queries */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Queries with Zero Results</h2>
          {zeroResultQueries.length === 0 ? (
            <p className={styles.emptyState}>No zero-result queries</p>
          ) : (
            <div className={styles.queryList}>
              {zeroResultQueries.map((query, index) => (
                <div key={index} className={styles.queryItem}>
                  <div className={`${styles.queryRank} ${styles.danger}`}>
                    {index + 1}
                  </div>
                  <div className={styles.queryDetails}>
                    <div className={styles.queryText}>{query.query}</div>
                    <div className={styles.queryStats}>
                      {query.count} searches • {query.averageLatency}ms
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Distribution */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Performance Distribution</h2>
        <div className={styles.performanceGrid}>
          {performanceDistribution.map((item, index) => (
            <div key={index} className={styles.performanceItem}>
              <div className={styles.performanceLabel}>{item.range}</div>
              <div className={styles.performanceBar}>
                <div
                  className={styles.performanceBarFill}
                  data-performance-bar={index}
                />
              </div>
              <div className={styles.performanceValue}>{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trends */}
      {trends.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Search Volume Trends</h2>
          <div className={styles.trendChart}>
            {trends.map((trend, index) => (
              <div key={index} className={styles.trendBar}>
                <div
                  className={styles.trendBarFill}
                  data-trend-bar={index}
                  title={`${trend.queryCount} queries\n${trend.averageLatency}ms avg latency\n${trend.zeroResultsCount} zero results`}
                />
                <div className={styles.trendLabel}>
                  {new Date(trend.timestamp).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: trends.length < 48 ? "numeric" : undefined,
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button
          onClick={fetchDashboardData}
          className={`${styles.button} ${styles.primaryButton}`}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ title: string; value: string; color: string }> = ({
  title,
  value,
  color,
}) => {
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.setProperty("--card-color", color);
    }
  }, [color]);

  return (
    <div ref={cardRef} className={styles.card}>
      <div className={styles.cardTitle}>{title}</div>
      <div className={styles.cardValue}>{value}</div>
    </div>
  );
};
