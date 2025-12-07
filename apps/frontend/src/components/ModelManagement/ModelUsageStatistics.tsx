// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ModelManagement/ModelUsageStatistics.tsx

import React, { useState, useEffect } from "react";

interface UsageDataPoint {
  timestamp: string;
  requests: number;
  cost: number;
  tokens: number;
}

interface ModelStats {
  modelName: string;
  provider: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokens: number;
  totalCost: number;
  averageDuration: number;
  successRate: number;
}

export const ModelUsageStatistics: React.FC<{ apiBaseUrl?: string }> = ({
  apiBaseUrl = "http://localhost:3000",
}) => {
  const [usageData, setUsageData] = useState<UsageDataPoint[]>([]);
  const [modelStats, setModelStats] = useState<ModelStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchUsageData();
  }, [days]);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      
      // Fetch usage over time
      const usageResponse = await fetch(
        `${apiBaseUrl}/api/ai-annotator/models/usage?days=${days}`,
      );
      const usageResult = await usageResponse.json();
      
      // Fetch model stats
      const statsResponse = await fetch(
        `${apiBaseUrl}/api/ai-annotator/models/stats?days=${days}`,
      );
      const statsResult = await statsResponse.json();

      if (usageResult.success) {
        setUsageData(usageResult.data);
      }
      
      if (statsResult.success) {
        setModelStats(statsResult.data);
      }
    } catch (error) {
      console.error("Failed to fetch usage data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading usage statistics...</div>;
  }

  const totalRequests = modelStats.reduce((sum, m) => sum + m.totalRequests, 0);
  const totalCost = modelStats.reduce((sum, m) => sum + m.totalCost, 0);
  const totalTokens = modelStats.reduce((sum, m) => sum + m.totalTokens, 0);
  const avgSuccessRate =
    modelStats.length > 0
      ? modelStats.reduce((sum, m) => sum + m.successRate, 0) / modelStats.length
      : 0;

  const maxRequests = Math.max(...usageData.map((d) => d.requests), 1);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Usage Statistics</h2>
        <div style={styles.controls}>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={styles.select}
          >
            <option value={1}>Last 24 Hours</option>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.cardGrid}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Total Requests</div>
          <div style={styles.cardValue}>{totalRequests.toLocaleString()}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Total Cost</div>
          <div style={styles.cardValue}>${totalCost.toFixed(2)}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Total Tokens</div>
          <div style={styles.cardValue}>{totalTokens.toLocaleString()}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Success Rate</div>
          <div style={styles.cardValue}>
            {(avgSuccessRate * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Usage Trend Chart */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Usage Trend</h3>
        {usageData.length === 0 ? (
          <p style={styles.empty}>No usage data available</p>
        ) : (
          <div style={styles.chartContainer}>
            <div style={styles.chart}>
              {usageData.map((dataPoint, index) => {
                const height = (dataPoint.requests / maxRequests) * 200;
                const date = new Date(dataPoint.timestamp);
                
                return (
                  <div key={index} style={styles.bar}>
                    <div
                      style={{
                        ...styles.barFill,
                        height: `${height}px`,
                      }}
                      title={`${dataPoint.requests} requests\n$${dataPoint.cost.toFixed(2)}\n${dataPoint.tokens} tokens`}
                    />
                    <div style={styles.barLabel}>
                      {date.getMonth() + 1}/{date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Model Breakdown */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Model Breakdown</h3>
        {modelStats.length === 0 ? (
          <p style={styles.empty}>No model data available</p>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <div style={styles.tableCell}>Model</div>
              <div style={styles.tableCell}>Requests</div>
              <div style={styles.tableCell}>Success Rate</div>
              <div style={styles.tableCell}>Avg Duration</div>
              <div style={styles.tableCell}>Cost</div>
              <div style={styles.tableCell}>Tokens</div>
            </div>
            {modelStats.map((model, index) => (
              <div key={index} style={styles.tableRow}>
                <div style={styles.tableCell}>
                  <div style={styles.modelName}>{model.modelName}</div>
                  <div style={styles.modelProvider}>{model.provider}</div>
                </div>
                <div style={styles.tableCell}>
                  <div>{model.totalRequests.toLocaleString()}</div>
                  <div style={styles.tableCellSub}>
                    {model.successfulRequests} success / {model.failedRequests}{" "}
                    failed
                  </div>
                </div>
                <div style={styles.tableCell}>
                  <div
                    style={{
                      ...styles.badge,
                      backgroundColor: getSuccessColor(model.successRate),
                    }}
                  >
                    {(model.successRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div style={styles.tableCell}>
                  {model.averageDuration.toFixed(0)}ms
                </div>
                <div style={styles.tableCell}>
                  ${model.totalCost.toFixed(2)}
                </div>
                <div style={styles.tableCell}>
                  {model.totalTokens.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Distribution */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Request Distribution</h3>
        <div style={styles.distributionGrid}>
          {modelStats.map((model, index) => {
            const percentage = (model.totalRequests / totalRequests) * 100;
            
            return (
              <div key={index} style={styles.distributionItem}>
                <div style={styles.distributionHeader}>
                  <span style={styles.distributionModel}>{model.modelName}</span>
                  <span style={styles.distributionValue}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div style={styles.distributionBar}>
                  <div
                    style={{
                      ...styles.distributionBarFill,
                      width: `${percentage}%`,
                      backgroundColor: getColor(index),
                    }}
                  />
                </div>
                <div style={styles.distributionStats}>
                  {model.totalRequests.toLocaleString()} requests
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const getSuccessColor = (rate: number): string => {
  if (rate >= 0.95) return "#28a745";
  if (rate >= 0.8) return "#ffc107";
  return "#dc3545";
};

const getColor = (index: number): string => {
  const colors = [
    "#007bff",
    "#28a745",
    "#ffc107",
    "#dc3545",
    "#17a2b8",
    "#6f42c1",
  ];
  return colors[index % colors.length];
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  } as React.CSSProperties,
  loading: {
    padding: "60px",
    textAlign: "center" as const,
    color: "#888",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  } as React.CSSProperties,
  title: {
    fontSize: "24px",
    fontWeight: "600" as const,
    color: "#333",
    margin: 0,
  } as React.CSSProperties,
  controls: {
    display: "flex",
    gap: "10px",
  } as React.CSSProperties,
  select: {
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "white",
    cursor: "pointer",
  } as React.CSSProperties,
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  } as React.CSSProperties,
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  } as React.CSSProperties,
  cardLabel: {
    fontSize: "13px",
    color: "#888",
    marginBottom: "8px",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,
  cardValue: {
    fontSize: "28px",
    fontWeight: "bold" as const,
    color: "#333",
  } as React.CSSProperties,
  section: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: "16px",
  } as React.CSSProperties,
  empty: {
    textAlign: "center" as const,
    color: "#888",
    padding: "20px",
  } as React.CSSProperties,
  chartContainer: {
    overflow: "auto",
  } as React.CSSProperties,
  chart: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    height: "250px",
    minWidth: "600px",
  } as React.CSSProperties,
  bar: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "8px",
  } as React.CSSProperties,
  barFill: {
    width: "100%",
    backgroundColor: "#007bff",
    borderRadius: "4px 4px 0 0",
    cursor: "pointer",
    transition: "background-color 0.2s",
  } as React.CSSProperties,
  barLabel: {
    fontSize: "11px",
    color: "#888",
  } as React.CSSProperties,
  table: {
    width: "100%",
  } as React.CSSProperties,
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    fontWeight: "600" as const,
    fontSize: "13px",
    marginBottom: "8px",
  } as React.CSSProperties,
  tableRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr",
    padding: "12px",
    borderBottom: "1px solid #e9ecef",
    alignItems: "center",
  } as React.CSSProperties,
  tableCell: {
    fontSize: "14px",
    color: "#333",
  } as React.CSSProperties,
  tableCellSub: {
    fontSize: "12px",
    color: "#888",
    marginTop: "2px",
  } as React.CSSProperties,
  modelName: {
    fontWeight: "600" as const,
    marginBottom: "2px",
  } as React.CSSProperties,
  modelProvider: {
    fontSize: "12px",
    color: "#888",
  } as React.CSSProperties,
  badge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "12px",
    color: "white",
    fontSize: "12px",
    fontWeight: "500" as const,
  } as React.CSSProperties,
  distributionGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  } as React.CSSProperties,
  distributionItem: {
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
  } as React.CSSProperties,
  distributionHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  } as React.CSSProperties,
  distributionModel: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "#333",
  } as React.CSSProperties,
  distributionValue: {
    fontSize: "14px",
    fontWeight: "bold" as const,
    color: "#007bff",
  } as React.CSSProperties,
  distributionBar: {
    height: "12px",
    backgroundColor: "#e9ecef",
    borderRadius: "6px",
    overflow: "hidden",
    marginBottom: "6px",
  } as React.CSSProperties,
  distributionBarFill: {
    height: "100%",
    borderRadius: "6px",
  } as React.CSSProperties,
  distributionStats: {
    fontSize: "12px",
    color: "#888",
  } as React.CSSProperties,
};
