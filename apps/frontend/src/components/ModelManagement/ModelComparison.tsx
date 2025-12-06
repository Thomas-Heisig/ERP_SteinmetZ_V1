// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ModelManagement/ModelComparison.tsx

import React, { useState, useEffect } from "react";

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
  }, [selectedDays]);

  const fetchModelStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiBaseUrl}/api/ai-annotator/models/stats?days=${selectedDays}`
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
    return <div style={styles.loading}>Loading model statistics...</div>;
  }

  const totalCost = models.reduce((sum, m) => sum + m.totalCost, 0);
  const totalRequests = models.reduce((sum, m) => sum + m.totalRequests, 0);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Model Comparison</h1>
        <select
          value={selectedDays}
          onChange={(e) => setSelectedDays(Number(e.target.value))}
          style={styles.select}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Models</div>
          <div style={styles.summaryValue}>{models.length}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Requests</div>
          <div style={styles.summaryValue}>{totalRequests.toLocaleString()}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Cost</div>
          <div style={styles.summaryValue}>${totalCost.toFixed(2)}</div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div style={styles.section}>
        {models.length === 0 ? (
          <p style={styles.emptyState}>No model usage data available</p>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <div style={styles.tableCell}>Model</div>
              <div style={styles.tableCell}>Provider</div>
              <div style={styles.tableCell}>Requests</div>
              <div style={styles.tableCell}>Success Rate</div>
              <div style={styles.tableCell}>Avg Duration</div>
              <div style={styles.tableCell}>Total Cost</div>
            </div>
            {models.map((model) => (
              <div key={`${model.modelName}-${model.provider}`} style={styles.tableRow}>
                <div style={styles.tableCell}>
                  <strong>{model.modelName}</strong>
                </div>
                <div style={styles.tableCell}>
                  <span style={styles.providerBadge}>{model.provider}</span>
                </div>
                <div style={styles.tableCell}>{model.totalRequests.toLocaleString()}</div>
                <div style={styles.tableCell}>
                  <div style={styles.progressContainer}>
                    <div
                      style={{
                        ...styles.progressBar,
                        width: `${model.successRate * 100}%`,
                        backgroundColor:
                          model.successRate >= 0.9
                            ? "#28a745"
                            : model.successRate >= 0.7
                              ? "#ffc107"
                              : "#dc3545",
                      }}
                    />
                    <span style={styles.progressText}>
                      {(model.successRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div style={styles.tableCell}>{Math.round(model.averageDuration)}ms</div>
                <div style={styles.tableCell}>
                  <strong>${model.totalCost.toFixed(2)}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cost per Request Comparison */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Cost Efficiency</h2>
        <div style={styles.chartContainer}>
          {models.map((model) => {
            const costPerRequest = model.totalRequests > 0 
              ? model.totalCost / model.totalRequests 
              : 0;
            const maxCost = Math.max(...models.map(m => 
              m.totalRequests > 0 ? m.totalCost / m.totalRequests : 0
            ));
            const barWidth = maxCost > 0 ? (costPerRequest / maxCost) * 100 : 0;

            return (
              <div key={`${model.modelName}-${model.provider}`} style={styles.chartRow}>
                <div style={styles.chartLabel}>
                  {model.modelName} ({model.provider})
                </div>
                <div style={styles.chartBarContainer}>
                  <div
                    style={{
                      ...styles.chartBar,
                      width: `${barWidth}%`,
                    }}
                  />
                  <span style={styles.chartValue}>
                    ${costPerRequest.toFixed(4)} / request
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.actions}>
        <button
          onClick={fetchModelStats}
          style={{ ...styles.button, ...styles.primaryButton }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

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
  select: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
  } as React.CSSProperties,
  loading: {
    padding: "40px",
    textAlign: "center" as const,
    fontSize: "18px",
    color: "#888",
  } as React.CSSProperties,
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  } as React.CSSProperties,
  summaryCard: {
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  } as React.CSSProperties,
  summaryLabel: {
    fontSize: "14px",
    color: "#888",
    marginBottom: "8px",
  } as React.CSSProperties,
  summaryValue: {
    fontSize: "28px",
    fontWeight: "bold" as const,
    color: "#333",
  } as React.CSSProperties,
  section: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    padding: "20px",
    marginBottom: "20px",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600" as const,
    marginBottom: "20px",
    color: "#333",
  } as React.CSSProperties,
  emptyState: {
    textAlign: "center" as const,
    color: "#888",
    padding: "20px",
  } as React.CSSProperties,
  table: {
    width: "100%",
  } as React.CSSProperties,
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 2fr 1fr 1fr",
    padding: "10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    fontWeight: "600" as const,
    marginBottom: "5px",
  } as React.CSSProperties,
  tableRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 2fr 1fr 1fr",
    padding: "10px",
    borderBottom: "1px solid #e9ecef",
    alignItems: "center",
  } as React.CSSProperties,
  tableCell: {
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,
  providerBadge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500" as const,
    backgroundColor: "#007bff",
    color: "white",
  } as React.CSSProperties,
  progressContainer: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  } as React.CSSProperties,
  progressBar: {
    height: "8px",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  } as React.CSSProperties,
  progressText: {
    fontSize: "14px",
    fontWeight: "500" as const,
    minWidth: "50px",
  } as React.CSSProperties,
  chartContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "15px",
  } as React.CSSProperties,
  chartRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  } as React.CSSProperties,
  chartLabel: {
    flex: "0 0 200px",
    fontSize: "14px",
    color: "#555",
  } as React.CSSProperties,
  chartBarContainer: {
    flex: 1,
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,
  chartBar: {
    height: "24px",
    backgroundColor: "#007bff",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  } as React.CSSProperties,
  chartValue: {
    marginLeft: "10px",
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "#333",
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
