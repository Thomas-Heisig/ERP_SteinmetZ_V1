// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ModelManagement/ModelUsageStatistics.tsx

/**
 * Model Usage Statistics Component
 *
 * Displays comprehensive usage statistics for AI models:
 * - Request counts and success rates
 * - Token usage and costs
 * - Usage trends over time
 *
 * @module ModelUsageStatistics
 */

import React, { useState, useEffect } from "react";
import styles from "./ModelUsageStatistics.module.css";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    return <div className={styles.loading}>Loading usage statistics...</div>;
  }

  const totalRequests = modelStats.reduce((sum, m) => sum + m.totalRequests, 0);
  const totalCost = modelStats.reduce((sum, m) => sum + m.totalCost, 0);
  const totalTokens = modelStats.reduce((sum, m) => sum + m.totalTokens, 0);
  const avgSuccessRate =
    modelStats.length > 0
      ? modelStats.reduce((sum, m) => sum + m.successRate, 0) /
        modelStats.length
      : 0;

  const maxRequests = Math.max(...usageData.map((d) => d.requests), 1);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Usage Statistics</h2>
        <div className={styles.controls}>
          <select
            id="days-select"
            aria-label="Select time range for statistics"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className={styles.select}
          >
            <option value={1}>Last 24 Hours</option>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.cardGrid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Total Requests</div>
          <div className={styles.cardValue}>
            {totalRequests.toLocaleString()}
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Total Cost</div>
          <div className={styles.cardValue}>${totalCost.toFixed(2)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Total Tokens</div>
          <div className={styles.cardValue}>{totalTokens.toLocaleString()}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Success Rate</div>
          <div className={styles.cardValue}>
            {(avgSuccessRate * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Usage Trend Chart */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Usage Trend</h3>
        {usageData.length === 0 ? (
          <p className={styles.empty}>No usage data available</p>
        ) : (
          <div className={styles.chartContainer}>
            <div className={styles.chart}>
              {usageData.map((dataPoint, index) => {
                const height = (dataPoint.requests / maxRequests) * 200;
                const date = new Date(dataPoint.timestamp);

                return (
                  <div key={index} className={styles.bar}>
                    <div
                      className={styles.barFill}
                      style={{ height: `${height}px` }}
                      title={`${dataPoint.requests} requests\n$${dataPoint.cost.toFixed(2)}\n${dataPoint.tokens} tokens`}
                    />
                    <div className={styles.barLabel}>
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
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Model Breakdown</h3>
        {modelStats.length === 0 ? (
          <p className={styles.empty}>No model data available</p>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>Model</div>
              <div className={styles.tableCell}>Requests</div>
              <div className={styles.tableCell}>Success Rate</div>
              <div className={styles.tableCell}>Avg Duration</div>
              <div className={styles.tableCell}>Cost</div>
              <div className={styles.tableCell}>Tokens</div>
            </div>
            {modelStats.map((model, index) => (
              <div key={index} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <div className={styles.modelName}>{model.modelName}</div>
                  <div className={styles.modelProvider}>{model.provider}</div>
                </div>
                <div className={styles.tableCell}>
                  <div>{model.totalRequests.toLocaleString()}</div>
                  <div className={styles.tableCellSub}>
                    {model.successfulRequests} success / {model.failedRequests}{" "}
                    failed
                  </div>
                </div>
                <div className={styles.tableCell}>
                  <div
                    className={styles.badge}
                    style={{
                      backgroundColor: getSuccessColor(model.successRate),
                    }}
                  >
                    {(model.successRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className={styles.tableCell}>
                  {model.averageDuration.toFixed(0)}ms
                </div>
                <div className={styles.tableCell}>
                  ${model.totalCost.toFixed(2)}
                </div>
                <div className={styles.tableCell}>
                  {model.totalTokens.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Distribution */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Request Distribution</h3>
        <div className={styles.distributionGrid}>
          {modelStats.map((model, index) => {
            const percentage = (model.totalRequests / totalRequests) * 100;

            return (
              <div key={index} className={styles.distributionItem}>
                <div className={styles.distributionHeader}>
                  <span className={styles.distributionModel}>
                    {model.modelName}
                  </span>
                  <span className={styles.distributionValue}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className={styles.distributionBar}>
                  <div
                    className={styles.distributionBarFill}
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: getColor(index),
                    }}
                  />
                </div>
                <div className={styles.distributionStats}>
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

export default ModelUsageStatistics;

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
