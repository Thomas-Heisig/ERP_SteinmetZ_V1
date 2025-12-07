// SPDX-License-Identifier: MIT
// apps/frontend/src/components/SearchAnalytics/SearchAnalyticsDashboard.tsx

import React, { useState, useEffect } from "react";

interface SearchMetrics {
  totalQueries: number;
  uniqueQueries: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  zeroResultsRate: number;
  clickThroughRate: number;
}

interface PopularQuery {
  query: string;
  count: number;
  averageResults: number;
  averageLatency: number;
}

interface SearchTrend {
  timestamp: string;
  queryCount: number;
  averageLatency: number;
  zeroResultsCount: number;
}

interface PerformanceDistribution {
  range: string;
  count: number;
}

interface DashboardData {
  summary: SearchMetrics;
  topQueries: PopularQuery[];
  zeroResultQueries: PopularQuery[];
  trends: SearchTrend[];
  performanceDistribution: PerformanceDistribution[];
}

interface SearchAnalyticsDashboardProps {
  apiBaseUrl?: string;
}

export const SearchAnalyticsDashboard: React.FC<
  SearchAnalyticsDashboardProps
> = ({ apiBaseUrl = "http://localhost:3000" }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(24);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
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
  };

  if (loading) {
    return <div style={styles.loading}>Loading Search Analytics...</div>;
  }

  if (!data) {
    return <div style={styles.error}>Failed to load analytics data</div>;
  }

  const { summary, topQueries, zeroResultQueries, trends, performanceDistribution } = data;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Search Analytics Dashboard</h1>
        <div style={styles.timeRangeSelector}>
          <label style={styles.label}>Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            style={styles.select}
          >
            <option value={1}>Last Hour</option>
            <option value={24}>Last 24 Hours</option>
            <option value={168}>Last Week</option>
            <option value={720}>Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Summary Metrics */}
      <div style={styles.cardGrid}>
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
      <div style={styles.chartsGrid}>
        {/* Top Queries */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Top Search Queries</h2>
          {topQueries.length === 0 ? (
            <p style={styles.emptyState}>No queries yet</p>
          ) : (
            <div style={styles.queryList}>
              {topQueries.map((query, index) => (
                <div key={index} style={styles.queryItem}>
                  <div style={styles.queryRank}>{index + 1}</div>
                  <div style={styles.queryDetails}>
                    <div style={styles.queryText}>{query.query}</div>
                    <div style={styles.queryStats}>
                      {query.count} searches • {query.averageResults} avg results • {query.averageLatency}ms
                    </div>
                  </div>
                  <div style={styles.queryBar}>
                    <div
                      style={{
                        ...styles.queryBarFill,
                        width: `${(query.count / topQueries[0].count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zero Result Queries */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Queries with Zero Results</h2>
          {zeroResultQueries.length === 0 ? (
            <p style={styles.emptyState}>No zero-result queries</p>
          ) : (
            <div style={styles.queryList}>
              {zeroResultQueries.map((query, index) => (
                <div key={index} style={styles.queryItem}>
                  <div style={{ ...styles.queryRank, backgroundColor: "#dc3545" }}>
                    {index + 1}
                  </div>
                  <div style={styles.queryDetails}>
                    <div style={styles.queryText}>{query.query}</div>
                    <div style={styles.queryStats}>
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
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Performance Distribution</h2>
        <div style={styles.performanceGrid}>
          {performanceDistribution.map((item, index) => (
            <div key={index} style={styles.performanceItem}>
              <div style={styles.performanceLabel}>{item.range}</div>
              <div style={styles.performanceBar}>
                <div
                  style={{
                    ...styles.performanceBarFill,
                    width: `${(item.count / summary.totalQueries) * 100}%`,
                  }}
                />
              </div>
              <div style={styles.performanceValue}>{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trends */}
      {trends.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Search Volume Trends</h2>
          <div style={styles.trendChart}>
            {trends.map((trend, index) => {
              const maxQueries = Math.max(...trends.map((t) => t.queryCount));
              const height = (trend.queryCount / maxQueries) * 200;
              
              return (
                <div key={index} style={styles.trendBar}>
                  <div
                    style={{
                      ...styles.trendBarFill,
                      height: `${height}px`,
                    }}
                    title={`${trend.queryCount} queries\n${trend.averageLatency}ms avg latency\n${trend.zeroResultsCount} zero results`}
                  />
                  <div style={styles.trendLabel}>
                    {new Date(trend.timestamp).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: trends.length < 48 ? "numeric" : undefined,
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={styles.actions}>
        <button
          onClick={fetchDashboardData}
          style={{ ...styles.button, ...styles.primaryButton }}
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
}) => (
  <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
    <div style={styles.cardTitle}>{title}</div>
    <div style={styles.cardValue}>{value}</div>
  </div>
);

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  } as React.CSSProperties,
  title: {
    fontSize: "32px",
    fontWeight: "bold" as const,
    color: "#333",
  } as React.CSSProperties,
  timeRangeSelector: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  } as React.CSSProperties,
  label: {
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "#666",
  } as React.CSSProperties,
  select: {
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "white",
    cursor: "pointer",
  } as React.CSSProperties,
  loading: {
    padding: "40px",
    textAlign: "center" as const,
    fontSize: "18px",
    color: "#888",
  } as React.CSSProperties,
  error: {
    padding: "40px",
    textAlign: "center" as const,
    fontSize: "18px",
    color: "#dc3545",
  } as React.CSSProperties,
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  } as React.CSSProperties,
  card: {
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  } as React.CSSProperties,
  cardTitle: {
    fontSize: "13px",
    color: "#888",
    marginBottom: "8px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  } as React.CSSProperties,
  cardValue: {
    fontSize: "24px",
    fontWeight: "bold" as const,
    color: "#333",
  } as React.CSSProperties,
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  } as React.CSSProperties,
  section: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    padding: "20px",
    marginBottom: "20px",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600" as const,
    marginBottom: "20px",
    color: "#333",
  } as React.CSSProperties,
  emptyState: {
    textAlign: "center" as const,
    color: "#888",
    padding: "20px",
  } as React.CSSProperties,
  queryList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  } as React.CSSProperties,
  queryItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
  } as React.CSSProperties,
  queryRank: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#007bff",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold" as const,
    fontSize: "14px",
    flexShrink: 0,
  } as React.CSSProperties,
  queryDetails: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,
  queryText: {
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "#333",
    marginBottom: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  queryStats: {
    fontSize: "12px",
    color: "#888",
  } as React.CSSProperties,
  queryBar: {
    width: "100px",
    height: "8px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    overflow: "hidden",
  } as React.CSSProperties,
  queryBarFill: {
    height: "100%",
    backgroundColor: "#007bff",
    borderRadius: "4px",
  } as React.CSSProperties,
  performanceGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  } as React.CSSProperties,
  performanceItem: {
    display: "grid",
    gridTemplateColumns: "100px 1fr 60px",
    gap: "12px",
    alignItems: "center",
  } as React.CSSProperties,
  performanceLabel: {
    fontSize: "13px",
    fontWeight: "500" as const,
    color: "#666",
  } as React.CSSProperties,
  performanceBar: {
    height: "24px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    overflow: "hidden",
  } as React.CSSProperties,
  performanceBarFill: {
    height: "100%",
    backgroundColor: "#28a745",
    borderRadius: "4px",
  } as React.CSSProperties,
  performanceValue: {
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "#333",
    textAlign: "right" as const,
  } as React.CSSProperties,
  trendChart: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    height: "250px",
    padding: "20px 0",
  } as React.CSSProperties,
  trendBar: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "8px",
  } as React.CSSProperties,
  trendBarFill: {
    width: "100%",
    backgroundColor: "#007bff",
    borderRadius: "4px 4px 0 0",
    cursor: "pointer",
    transition: "background-color 0.2s",
  } as React.CSSProperties,
  trendLabel: {
    fontSize: "11px",
    color: "#888",
    textAlign: "center" as const,
    transform: "rotate(-45deg)",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  } as React.CSSProperties,
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500" as const,
    cursor: "pointer",
    transition: "all 0.2s",
  } as React.CSSProperties,
  primaryButton: {
    backgroundColor: "#007bff",
    color: "white",
  } as React.CSSProperties,
};
