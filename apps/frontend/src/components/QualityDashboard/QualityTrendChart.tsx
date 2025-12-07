// SPDX-License-Identifier: MIT
// apps/frontend/src/components/QualityDashboard/QualityTrendChart.tsx

import React, { useState, useEffect } from "react";

interface QualityTrend {
  timestamp: string;
  metricType: string;
  metricValue: number;
  nodeCount: number;
  batchId?: string;
}

interface QualityTrendChartProps {
  apiBaseUrl?: string;
  metricType?: string;
  days?: number;
}

export const QualityTrendChart: React.FC<QualityTrendChartProps> = ({
  apiBaseUrl = "http://localhost:3000",
  metricType = "overall",
  days = 30,
}) => {
  const [trends, setTrends] = useState<QualityTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState(metricType);

  useEffect(() => {
    fetchTrends();
  }, [selectedMetric, days]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiBaseUrl}/api/ai-annotator/qa/trends?metricType=${selectedMetric}&days=${days}`,
      );
      const data = await response.json();

      if (data.success) {
        setTrends(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch quality trends:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading trends...</div>;
  }

  if (trends.length === 0) {
    return <div style={styles.empty}>No trend data available</div>;
  }

  const maxValue = Math.max(...trends.map((t) => t.metricValue));
  const minValue = Math.min(...trends.map((t) => t.metricValue));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Quality Trends</h3>
        <div style={styles.controls}>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            style={styles.select}
          >
            <option value="overall">Overall Score</option>
            <option value="completeness">Completeness</option>
            <option value="accuracy">Accuracy</option>
            <option value="consistency">Consistency</option>
            <option value="confidence">Confidence</option>
          </select>
        </div>
      </div>

      <div style={styles.stats}>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Current:</span>
          <span style={styles.statValue}>
            {trends[trends.length - 1]?.metricValue.toFixed(1) || "N/A"}
          </span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Avg:</span>
          <span style={styles.statValue}>
            {(
              trends.reduce((sum, t) => sum + t.metricValue, 0) / trends.length
            ).toFixed(1)}
          </span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Max:</span>
          <span style={styles.statValue}>{maxValue.toFixed(1)}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Min:</span>
          <span style={styles.statValue}>{minValue.toFixed(1)}</span>
        </div>
      </div>

      <div style={styles.chartContainer}>
        <div style={styles.yAxis}>
          <div style={styles.yAxisLabel}>{maxValue.toFixed(0)}</div>
          <div style={styles.yAxisLabel}>
            {((maxValue + minValue) / 2).toFixed(0)}
          </div>
          <div style={styles.yAxisLabel}>{minValue.toFixed(0)}</div>
        </div>

        <div style={styles.chart}>
          {trends.map((trend, index) => {
            const height =
              ((trend.metricValue - minValue) / (maxValue - minValue)) * 100;
            const date = new Date(trend.timestamp);

            return (
              <div key={index} style={styles.bar}>
                <div
                  style={{
                    ...styles.barFill,
                    height: `${height}%`,
                  }}
                  title={`${trend.metricValue.toFixed(1)} (${trend.nodeCount} nodes)\n${date.toLocaleDateString()}`}
                />
                <div style={styles.barLabel}>
                  {date.getDate()}/{date.getMonth() + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.legend}>
        <span style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: "#28a745" }} />
          Quality Score
        </span>
        <span style={styles.legendItem}>
          Total nodes: {trends.reduce((sum, t) => sum + t.nodeCount, 0)}
        </span>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  } as React.CSSProperties,
  loading: {
    padding: "40px",
    textAlign: "center" as const,
    color: "#888",
  } as React.CSSProperties,
  empty: {
    padding: "40px",
    textAlign: "center" as const,
    color: "#888",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  } as React.CSSProperties,
  title: {
    fontSize: "18px",
    fontWeight: "600" as const,
    color: "#333",
    margin: 0,
  } as React.CSSProperties,
  controls: {
    display: "flex",
    gap: "10px",
  } as React.CSSProperties,
  select: {
    padding: "6px 12px",
    fontSize: "13px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "white",
    cursor: "pointer",
  } as React.CSSProperties,
  stats: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
  } as React.CSSProperties,
  statItem: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  } as React.CSSProperties,
  statLabel: {
    fontSize: "12px",
    color: "#888",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,
  statValue: {
    fontSize: "20px",
    fontWeight: "bold" as const,
    color: "#333",
  } as React.CSSProperties,
  chartContainer: {
    display: "flex",
    gap: "10px",
    height: "300px",
    marginBottom: "15px",
  } as React.CSSProperties,
  yAxis: {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: "10px",
    fontSize: "12px",
    color: "#888",
  } as React.CSSProperties,
  yAxisLabel: {
    lineHeight: "1",
  } as React.CSSProperties,
  chart: {
    flex: 1,
    display: "flex",
    alignItems: "flex-end",
    gap: "4px",
    borderLeft: "2px solid #e9ecef",
    borderBottom: "2px solid #e9ecef",
    paddingLeft: "10px",
    paddingBottom: "5px",
  } as React.CSSProperties,
  bar: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "5px",
    minWidth: "20px",
  } as React.CSSProperties,
  barFill: {
    width: "100%",
    backgroundColor: "#28a745",
    borderRadius: "4px 4px 0 0",
    transition: "background-color 0.2s",
    cursor: "pointer",
  } as React.CSSProperties,
  barLabel: {
    fontSize: "10px",
    color: "#888",
    whiteSpace: "nowrap" as const,
    transform: "rotate(-45deg)",
  } as React.CSSProperties,
  legend: {
    display: "flex",
    gap: "20px",
    fontSize: "13px",
    color: "#666",
  } as React.CSSProperties,
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  } as React.CSSProperties,
  legendDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
  } as React.CSSProperties,
};
