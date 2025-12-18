// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ModelManagement/ModelComparison.tsx

/**
 * Model Comparison Component
 *
 * Compares performance and cost metrics across different AI models:
 * - Success rates and request counts
 * - Cost efficiency analysis
 * - Performance benchmarking
 *
 * @module ModelComparison
 */

import React, { useState, useEffect } from "react";
import styles from "./ModelComparison.module.css";

interface ModelStats {
  modelName: string;
  provider: string;
  totalRequests: number;
  successfulRequests: number;
  totalCost: number;
  averageDuration: number;
  successRate: number;
}

interface ModelComparisonProps {
  apiBaseUrl?: string;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({
  apiBaseUrl = "http://localhost:3000",
}) => {
  const [models, setModels] = useState<ModelStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);

  useEffect(() => {
    fetchModelStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDays]);

  const fetchModelStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiBaseUrl}/api/ai-annotator/models/stats?days=${selectedDays}`,
      );
      const data = await response.json();

      if (data.success) {
        setModels(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch model stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading model statistics...</div>;
  }

  const totalCost = models.reduce((sum, m) => sum + m.totalCost, 0);
  const totalRequests = models.reduce((sum, m) => sum + m.totalRequests, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Model Comparison</h1>
        <select
          id="days-select"
          aria-label="Select time range for comparison"
          value={selectedDays}
          onChange={(e) => setSelectedDays(Number(e.target.value))}
          className={styles.select}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total Models</div>
          <div className={styles.summaryValue}>{models.length}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total Requests</div>
          <div className={styles.summaryValue}>
            {totalRequests.toLocaleString()}
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total Cost</div>
          <div className={styles.summaryValue}>${totalCost.toFixed(2)}</div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className={styles.section}>
        {models.length === 0 ? (
          <p className={styles.emptyState}>No model usage data available</p>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>Model</div>
              <div className={styles.tableCell}>Provider</div>
              <div className={styles.tableCell}>Requests</div>
              <div className={styles.tableCell}>Success Rate</div>
              <div className={styles.tableCell}>Avg Duration</div>
              <div className={styles.tableCell}>Total Cost</div>
            </div>
            {models.map((model) => (
              <div
                key={`${model.modelName}-${model.provider}`}
                className={styles.tableRow}
              >
                <div className={styles.tableCell}>
                  <strong>{model.modelName}</strong>
                </div>
                <div className={styles.tableCell}>
                  <span className={styles.providerBadge}>{model.provider}</span>
                </div>
                <div className={styles.tableCell}>
                  {model.totalRequests.toLocaleString()}
                </div>
                <div className={styles.tableCell}>
                  <div className={styles.progressContainer}>
                    <div
                      className={`${styles.progressBar} ${
                        model.successRate >= 0.9
                          ? styles.progressSuccess
                          : model.successRate >= 0.7
                            ? styles.progressWarning
                            : styles.progressDanger
                      }`}
                      style={{ width: `${model.successRate * 100}%` }}
                    />
                    <span className={styles.progressText}>
                      {(model.successRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className={styles.tableCell}>
                  {Math.round(model.averageDuration)}ms
                </div>
                <div className={styles.tableCell}>
                  <strong>${model.totalCost.toFixed(2)}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cost per Request Comparison */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Cost Efficiency</h2>
        <div className={styles.chartContainer}>
          {models.map((model) => {
            const costPerRequest =
              model.totalRequests > 0
                ? model.totalCost / model.totalRequests
                : 0;
            const maxCost = Math.max(
              ...models.map((m) =>
                m.totalRequests > 0 ? m.totalCost / m.totalRequests : 0,
              ),
            );
            const barWidth = maxCost > 0 ? (costPerRequest / maxCost) * 100 : 0;

            return (
              <div
                key={`${model.modelName}-${model.provider}`}
                className={styles.chartRow}
              >
                <div className={styles.chartLabel}>
                  {model.modelName} ({model.provider})
                </div>
                <div className={styles.chartBarContainer}>
                  <div
                    className={styles.chartBar}
                    style={{ width: `${barWidth}%` }}
                  />
                  <span className={styles.chartValue}>
                    ${costPerRequest.toFixed(4)} / request
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.actions}>
        <button
          onClick={fetchModelStats}
          className={`${styles.button} ${styles.primaryButton}`}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default ModelComparison;
