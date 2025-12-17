// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ModelManagement/ModelCostTracking.tsx

/**
 * Model Cost Tracking Component
 * 
 * Tracks and displays cost information for AI model usage:
 * - Total costs by period (day/week/month)
 * - Cost breakdown by model
 * - Cost optimization suggestions
 * 
 * @module ModelCostTracking
 */

import React, { useState, useEffect } from "react";
import styles from "./ModelCostTracking.module.css";

interface CostBreakdown {
  period: "day" | "week" | "month";
  startDate: string;
  endDate: string;
  totalCost: number;
  byModel: Array<{
    modelName: string;
    provider: string;
    cost: number;
    requests: number;
    tokens: number;
  }>;
  byOperation: Array<{
    operationType: string;
    cost: number;
    requests: number;
  }>;
}

export const ModelCostTracking: React.FC<{ apiBaseUrl?: string }> = ({
  apiBaseUrl = "http://localhost:3000",
}) => {
  const [costData, setCostData] = useState<CostBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");

  useEffect(() => {
    fetchCostData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchCostData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiBaseUrl}/api/ai-annotator/models/cost?period=${period}`,
      );
      const data = await response.json();

      if (data.success) {
        setCostData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch cost data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading cost data...</div>;
  }

  if (!costData) {
    return <div className={styles.error}>Failed to load cost data</div>;
  }

  const maxModelCost = Math.max(...costData.byModel.map((m) => m.cost));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Cost Tracking</h2>
        <div className={styles.controls}>
          <select
            id="period-select"
            aria-label="Select time period for cost tracking"
            value={period}
            onChange={(e) => setPeriod(e.target.value as "day" | "week" | "month")}
            className={styles.select}
          >
            <option value="day">Last Day</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Total Cost Summary */}
      <div className={styles.totalCard}>
        <div className={styles.totalLabel}>Total Cost</div>
        <div className={styles.totalValue}>${costData.totalCost.toFixed(2)}</div>
        <div className={styles.totalPeriod}>
          {new Date(costData.startDate).toLocaleDateString()} -{" "}
          {new Date(costData.endDate).toLocaleDateString()}
        </div>
      </div>

      {/* Cost by Model */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Cost by Model</h3>
        {costData.byModel.length === 0 ? (
          <p className={styles.empty}>No cost data available</p>
        ) : (
          <div className={styles.modelList}>
            {costData.byModel.map((model, index) => (
              <div key={index} className={styles.modelItem}>
                <div className={styles.modelHeader}>
                  <div>
                    <div className={styles.modelName}>{model.modelName}</div>
                    <div className={styles.modelProvider}>{model.provider}</div>
                  </div>
                  <div className={styles.modelCost}>${model.cost.toFixed(2)}</div>
                </div>
                <div className={styles.modelBar}>
                  <div
                    className={styles.modelBarFill}
                    style={{ '--bar-width': `${(model.cost / maxModelCost) * 100}%` } as React.CSSProperties}
                  />
                </div>
                <div className={styles.modelStats}>
                  {model.requests.toLocaleString()} requests •{" "}
                  {model.tokens.toLocaleString()} tokens • $
                  {(model.cost / model.requests).toFixed(4)}/request
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cost Distribution Pie Chart */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Cost Distribution</h3>
        <div className={styles.pieContainer}>
          {costData.byModel.map((model, index) => {
            const percentage = (model.cost / costData.totalCost) * 100;
            return (
              <div key={index} className={styles.pieItem}>
                <div
                  className={styles.pieDot}
                  style={{ '--dot-color': getColor(index) } as React.CSSProperties}
                />
                <div className={styles.pieLabel}>
                  {model.modelName} ({percentage.toFixed(1)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cost Optimization Suggestions */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Cost Optimization Suggestions</h3>
        <div className={styles.suggestionList}>
          {costData.byModel
            .filter((m) => m.cost > costData.totalCost * 0.3)
            .map((model, index) => (
              <div key={index} className={styles.suggestion}>
                <div className={styles.suggestionIcon}>💡</div>
                <div className={styles.suggestionText}>
                  <strong>{model.modelName}</strong> accounts for{" "}
                  {((model.cost / costData.totalCost) * 100).toFixed(1)}% of
                  total costs. Consider using a more cost-effective model for
                  non-critical tasks.
                </div>
              </div>
            ))}
          {costData.totalCost > 100 && (
            <div className={styles.suggestion}>
              <div className={styles.suggestionIcon}>⚠️</div>
              <div className={styles.suggestionText}>
                High usage detected. Review your batch processing schedules and
                consider rate limiting.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Button */}
      <div className={styles.actions}>
        <button
          onClick={() => {
            const csv = generateCostCSV(costData);
            downloadCSV(csv, `cost-report-${period}.csv`);
          }}
          className={styles.exportButton}
        >
          📊 Export Report
        </button>
      </div>
    </div>
  );
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

const generateCostCSV = (data: CostBreakdown): string => {
  let csv = "Model,Provider,Cost,Requests,Tokens,Cost per Request\n";
  for (const model of data.byModel) {
    csv += `${model.modelName},${model.provider},${model.cost},${model.requests},${model.tokens},${(model.cost / model.requests).toFixed(4)}\n`;
  }
  return csv;
};

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export default ModelCostTracking;