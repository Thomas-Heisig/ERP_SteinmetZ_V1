// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ModelManagement/ModelCostTracking.tsx

import React, { useState, useEffect } from "react";

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
    return <div style={styles.loading}>Loading cost data...</div>;
  }

  if (!costData) {
    return <div style={styles.error}>Failed to load cost data</div>;
  }

  const maxModelCost = Math.max(...costData.byModel.map((m) => m.cost));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Cost Tracking</h2>
        <div style={styles.controls}>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            style={styles.select}
          >
            <option value="day">Last Day</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Total Cost Summary */}
      <div style={styles.totalCard}>
        <div style={styles.totalLabel}>Total Cost</div>
        <div style={styles.totalValue}>${costData.totalCost.toFixed(2)}</div>
        <div style={styles.totalPeriod}>
          {new Date(costData.startDate).toLocaleDateString()} -{" "}
          {new Date(costData.endDate).toLocaleDateString()}
        </div>
      </div>

      {/* Cost by Model */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Cost by Model</h3>
        {costData.byModel.length === 0 ? (
          <p style={styles.empty}>No cost data available</p>
        ) : (
          <div style={styles.modelList}>
            {costData.byModel.map((model, index) => (
              <div key={index} style={styles.modelItem}>
                <div style={styles.modelHeader}>
                  <div>
                    <div style={styles.modelName}>{model.modelName}</div>
                    <div style={styles.modelProvider}>{model.provider}</div>
                  </div>
                  <div style={styles.modelCost}>${model.cost.toFixed(2)}</div>
                </div>
                <div style={styles.modelBar}>
                  <div
                    style={{
                      ...styles.modelBarFill,
                      width: `${(model.cost / maxModelCost) * 100}%`,
                    }}
                  />
                </div>
                <div style={styles.modelStats}>
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
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Cost Distribution</h3>
        <div style={styles.pieContainer}>
          {costData.byModel.map((model, index) => {
            const percentage = (model.cost / costData.totalCost) * 100;
            return (
              <div key={index} style={styles.pieItem}>
                <div
                  style={{
                    ...styles.pieDot,
                    backgroundColor: getColor(index),
                  }}
                />
                <div style={styles.pieLabel}>
                  {model.modelName} ({percentage.toFixed(1)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cost Optimization Suggestions */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Cost Optimization Suggestions</h3>
        <div style={styles.suggestionList}>
          {costData.byModel
            .filter((m) => m.cost > costData.totalCost * 0.3)
            .map((model, index) => (
              <div key={index} style={styles.suggestion}>
                <div style={styles.suggestionIcon}>💡</div>
                <div style={styles.suggestionText}>
                  <strong>{model.modelName}</strong> accounts for{" "}
                  {((model.cost / costData.totalCost) * 100).toFixed(1)}% of
                  total costs. Consider using a more cost-effective model for
                  non-critical tasks.
                </div>
              </div>
            ))}
          {costData.totalCost > 100 && (
            <div style={styles.suggestion}>
              <div style={styles.suggestionIcon}>⚠️</div>
              <div style={styles.suggestionText}>
                High usage detected. Review your batch processing schedules and
                consider rate limiting.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Button */}
      <div style={styles.actions}>
        <button
          onClick={() => {
            const csv = generateCostCSV(costData);
            downloadCSV(csv, `cost-report-${period}.csv`);
          }}
          style={styles.exportButton}
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

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
  } as React.CSSProperties,
  loading: {
    padding: "60px",
    textAlign: "center" as const,
    color: "#888",
  } as React.CSSProperties,
  error: {
    padding: "60px",
    textAlign: "center" as const,
    color: "#dc3545",
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
  totalCard: {
    backgroundColor: "#007bff",
    color: "white",
    borderRadius: "8px",
    padding: "30px",
    textAlign: "center" as const,
    marginBottom: "30px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  } as React.CSSProperties,
  totalLabel: {
    fontSize: "14px",
    textTransform: "uppercase" as const,
    opacity: 0.9,
    marginBottom: "8px",
  } as React.CSSProperties,
  totalValue: {
    fontSize: "48px",
    fontWeight: "bold" as const,
    marginBottom: "8px",
  } as React.CSSProperties,
  totalPeriod: {
    fontSize: "13px",
    opacity: 0.8,
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
  modelList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  } as React.CSSProperties,
  modelItem: {
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
  } as React.CSSProperties,
  modelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  } as React.CSSProperties,
  modelName: {
    fontSize: "15px",
    fontWeight: "600" as const,
    color: "#333",
  } as React.CSSProperties,
  modelProvider: {
    fontSize: "12px",
    color: "#888",
    marginTop: "2px",
  } as React.CSSProperties,
  modelCost: {
    fontSize: "20px",
    fontWeight: "bold" as const,
    color: "#007bff",
  } as React.CSSProperties,
  modelBar: {
    height: "8px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "8px",
  } as React.CSSProperties,
  modelBarFill: {
    height: "100%",
    backgroundColor: "#007bff",
    borderRadius: "4px",
  } as React.CSSProperties,
  modelStats: {
    fontSize: "12px",
    color: "#888",
  } as React.CSSProperties,
  pieContainer: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "16px",
  } as React.CSSProperties,
  pieItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  } as React.CSSProperties,
  pieDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
  } as React.CSSProperties,
  pieLabel: {
    fontSize: "13px",
    color: "#666",
  } as React.CSSProperties,
  suggestionList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  } as React.CSSProperties,
  suggestion: {
    display: "flex",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#fff3cd",
    borderRadius: "6px",
    border: "1px solid #ffc107",
  } as React.CSSProperties,
  suggestionIcon: {
    fontSize: "20px",
    flexShrink: 0,
  } as React.CSSProperties,
  suggestionText: {
    fontSize: "14px",
    color: "#333",
    lineHeight: "1.5",
  } as React.CSSProperties,
  actions: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
  } as React.CSSProperties,
  exportButton: {
    padding: "12px 24px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500" as const,
    cursor: "pointer",
  } as React.CSSProperties,
};
