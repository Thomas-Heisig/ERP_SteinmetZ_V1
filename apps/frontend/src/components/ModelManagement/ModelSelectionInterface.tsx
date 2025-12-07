// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ModelManagement/ModelSelectionInterface.tsx

import React, { useState, useEffect } from "react";

interface ModelConfig {
  name: string;
  provider: "openai" | "anthropic" | "ollama" | "fallback";
  available: boolean;
  description?: string;
  capabilities?: string[];
  costPerToken?: number;
  maxTokens?: number;
}

interface ModelRecommendation {
  modelName: string;
  provider: string;
  speed: number;
  accuracy: number;
  cost: number;
  reliability: number;
  overallScore: number;
}

export const ModelSelectionInterface: React.FC<{ apiBaseUrl?: string }> = ({
  apiBaseUrl = "http://localhost:3000",
}) => {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [recommendations, setRecommendations] = useState<ModelRecommendation[]>(
    [],
  );
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [criteria, setCriteria] = useState({
    prioritize: "balanced" as "speed" | "accuracy" | "cost" | "balanced",
    maxCost: undefined as number | undefined,
    minAccuracy: undefined as number | undefined,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
    fetchRecommendations();
  }, [criteria]);

  const fetchModels = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/ai-annotator/models`);
      const data = await response.json();

      if (data.success) {
        setModels(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (criteria.prioritize) params.append("prioritize", criteria.prioritize);
      if (criteria.maxCost) params.append("maxCost", criteria.maxCost.toString());
      if (criteria.minAccuracy)
        params.append("minAccuracy", criteria.minAccuracy.toString());

      const response = await fetch(
        `${apiBaseUrl}/api/ai-annotator/models/recommendations?${params}`,
      );
      const data = await response.json();

      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Selection Criteria */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Selection Criteria</h3>
        <div style={styles.criteriaGrid}>
          <div style={styles.criteriaItem}>
            <label style={styles.label}>Prioritize:</label>
            <select
              value={criteria.prioritize}
              onChange={(e) =>
                setCriteria({
                  ...criteria,
                  prioritize: e.target.value as any,
                })
              }
              style={styles.select}
            >
              <option value="balanced">Balanced</option>
              <option value="speed">Speed</option>
              <option value="accuracy">Accuracy</option>
              <option value="cost">Cost</option>
            </select>
          </div>

          <div style={styles.criteriaItem}>
            <label style={styles.label}>Max Cost (per 1K tokens):</label>
            <input
              type="number"
              value={criteria.maxCost || ""}
              onChange={(e) =>
                setCriteria({
                  ...criteria,
                  maxCost: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="No limit"
              style={styles.input}
              step="0.001"
            />
          </div>

          <div style={styles.criteriaItem}>
            <label style={styles.label}>Min Accuracy (%):</label>
            <input
              type="number"
              value={
                criteria.minAccuracy !== undefined
                  ? criteria.minAccuracy * 100
                  : ""
              }
              onChange={(e) =>
                setCriteria({
                  ...criteria,
                  minAccuracy: e.target.value
                    ? Number(e.target.value) / 100
                    : undefined,
                })
              }
              placeholder="No minimum"
              style={styles.input}
              min="0"
              max="100"
            />
          </div>
        </div>
      </div>

      {/* Recommended Models */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Recommended Models</h3>
        {loading ? (
          <div style={styles.loading}>Loading recommendations...</div>
        ) : recommendations.length === 0 ? (
          <div style={styles.empty}>
            No models match your criteria. Try relaxing the constraints.
          </div>
        ) : (
          <div style={styles.recommendationList}>
            {recommendations.map((rec, index) => (
              <div
                key={index}
                style={{
                  ...styles.recommendationCard,
                  ...(index === 0 ? styles.topRecommendation : {}),
                }}
              >
                {index === 0 && (
                  <div style={styles.badge}>🏆 Best Match</div>
                )}
                <div style={styles.recommendationHeader}>
                  <div>
                    <div style={styles.recommendationName}>{rec.modelName}</div>
                    <div style={styles.recommendationProvider}>
                      {rec.provider}
                    </div>
                  </div>
                  <div style={styles.overallScore}>{rec.overallScore}</div>
                </div>

                <div style={styles.metricsGrid}>
                  <div style={styles.metric}>
                    <div style={styles.metricLabel}>Speed</div>
                    <div style={styles.metricBar}>
                      <div
                        style={{
                          ...styles.metricBarFill,
                          width: `${(1 - rec.speed / 5000) * 100}%`,
                          backgroundColor: "#17a2b8",
                        }}
                      />
                    </div>
                    <div style={styles.metricValue}>{rec.speed.toFixed(0)}ms</div>
                  </div>

                  <div style={styles.metric}>
                    <div style={styles.metricLabel}>Accuracy</div>
                    <div style={styles.metricBar}>
                      <div
                        style={{
                          ...styles.metricBarFill,
                          width: `${rec.accuracy * 100}%`,
                          backgroundColor: "#28a745",
                        }}
                      />
                    </div>
                    <div style={styles.metricValue}>
                      {(rec.accuracy * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div style={styles.metric}>
                    <div style={styles.metricLabel}>Cost</div>
                    <div style={styles.metricBar}>
                      <div
                        style={{
                          ...styles.metricBarFill,
                          width: `${Math.min(rec.cost * 100, 100)}%`,
                          backgroundColor: "#ffc107",
                        }}
                      />
                    </div>
                    <div style={styles.metricValue}>
                      ${rec.cost.toFixed(4)}/1K
                    </div>
                  </div>

                  <div style={styles.metric}>
                    <div style={styles.metricLabel}>Reliability</div>
                    <div style={styles.metricBar}>
                      <div
                        style={{
                          ...styles.metricBarFill,
                          width: `${rec.reliability * 100}%`,
                          backgroundColor: "#6f42c1",
                        }}
                      />
                    </div>
                    <div style={styles.metricValue}>
                      {(rec.reliability * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedModel(rec.modelName)}
                  style={
                    selectedModel === rec.modelName
                      ? styles.selectedButton
                      : styles.selectButton
                  }
                >
                  {selectedModel === rec.modelName ? "✓ Selected" : "Select Model"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Models */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>All Available Models</h3>
        <div style={styles.modelGrid}>
          {models.map((model, index) => (
            <div
              key={index}
              style={{
                ...styles.modelCard,
                ...(model.available ? {} : styles.unavailableCard),
              }}
            >
              <div style={styles.modelCardHeader}>
                <div style={styles.modelCardName}>{model.name}</div>
                <div
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: model.available ? "#28a745" : "#dc3545",
                  }}
                >
                  {model.available ? "Available" : "Unavailable"}
                </div>
              </div>
              <div style={styles.modelCardProvider}>{model.provider}</div>
              {model.description && (
                <div style={styles.modelCardDescription}>
                  {model.description}
                </div>
              )}
              {model.capabilities && model.capabilities.length > 0 && (
                <div style={styles.capabilities}>
                  {model.capabilities.map((cap, idx) => (
                    <span key={idx} style={styles.capabilityTag}>
                      {cap}
                    </span>
                  ))}
                </div>
              )}
              {model.maxTokens && (
                <div style={styles.modelCardInfo}>
                  Max Tokens: {model.maxTokens.toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
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
    marginBottom: "20px",
  } as React.CSSProperties,
  criteriaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
  } as React.CSSProperties,
  criteriaItem: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
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
  } as React.CSSProperties,
  input: {
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
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
  recommendationList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  } as React.CSSProperties,
  recommendationCard: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "2px solid #e9ecef",
    position: "relative" as const,
  } as React.CSSProperties,
  topRecommendation: {
    backgroundColor: "#e7f3ff",
    borderColor: "#007bff",
  } as React.CSSProperties,
  badge: {
    position: "absolute" as const,
    top: "12px",
    right: "12px",
    padding: "4px 12px",
    backgroundColor: "#ffc107",
    color: "#333",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600" as const,
  } as React.CSSProperties,
  recommendationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  } as React.CSSProperties,
  recommendationName: {
    fontSize: "18px",
    fontWeight: "600" as const,
    color: "#333",
  } as React.CSSProperties,
  recommendationProvider: {
    fontSize: "13px",
    color: "#888",
    marginTop: "2px",
  } as React.CSSProperties,
  overallScore: {
    fontSize: "32px",
    fontWeight: "bold" as const,
    color: "#007bff",
  } as React.CSSProperties,
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  } as React.CSSProperties,
  metric: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  } as React.CSSProperties,
  metricLabel: {
    fontSize: "12px",
    color: "#888",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,
  metricBar: {
    height: "8px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    overflow: "hidden",
  } as React.CSSProperties,
  metricBarFill: {
    height: "100%",
    borderRadius: "4px",
  } as React.CSSProperties,
  metricValue: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "#333",
  } as React.CSSProperties,
  selectButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500" as const,
    cursor: "pointer",
  } as React.CSSProperties,
  selectedButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500" as const,
    cursor: "pointer",
  } as React.CSSProperties,
  modelGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  } as React.CSSProperties,
  modelCard: {
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    border: "1px solid #e9ecef",
  } as React.CSSProperties,
  unavailableCard: {
    opacity: 0.6,
  } as React.CSSProperties,
  modelCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  } as React.CSSProperties,
  modelCardName: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: "#333",
  } as React.CSSProperties,
  statusBadge: {
    padding: "3px 10px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "600" as const,
    color: "white",
  } as React.CSSProperties,
  modelCardProvider: {
    fontSize: "13px",
    color: "#888",
    marginBottom: "8px",
  } as React.CSSProperties,
  modelCardDescription: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "12px",
    lineHeight: "1.4",
  } as React.CSSProperties,
  capabilities: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "6px",
    marginBottom: "8px",
  } as React.CSSProperties,
  capabilityTag: {
    padding: "3px 8px",
    backgroundColor: "#007bff",
    color: "white",
    borderRadius: "10px",
    fontSize: "11px",
  } as React.CSSProperties,
  modelCardInfo: {
    fontSize: "12px",
    color: "#888",
  } as React.CSSProperties,
};
