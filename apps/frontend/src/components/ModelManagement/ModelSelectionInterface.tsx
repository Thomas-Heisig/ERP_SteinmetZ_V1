// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ModelManagement/ModelSelectionInterface.tsx

/**
 * Model Selection Interface Component
 * 
 * Provides an intelligent interface for selecting AI models based on:
 * - Performance criteria (speed, accuracy, cost, reliability)
 * - Model recommendations with scoring
 * - Real-time model availability
 * 
 * @module ModelSelectionInterface
 */

import React, { useState, useEffect } from "react";
import styles from "./ModelSelectionInterface.module.css";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (criteria.maxCost)
        params.append("maxCost", criteria.maxCost.toString());
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
    <div className={styles.container}>
      {/* Selection Criteria */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Selection Criteria</h3>
        <div className={styles.criteriaGrid}>
          <div className={styles.criteriaItem}>
            <label className={styles.label} htmlFor="prioritize-select">Prioritize:</label>
            <select
              id="prioritize-select"
              aria-label="Prioritize selection criteria"
              value={criteria.prioritize}
              onChange={(e) =>
                setCriteria({
                  ...criteria,
                  prioritize: e.target.value as "balanced" | "speed" | "accuracy" | "cost",
                })
              }
              className={styles.select}
            >
              <option value="balanced">Balanced</option>
              <option value="speed">Speed</option>
              <option value="accuracy">Accuracy</option>
              <option value="cost">Cost</option>
            </select>
          </div>

          <div className={styles.criteriaItem}>
            <label className={styles.label}>Max Cost (per 1K tokens):</label>
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
              className={styles.input}
              step="0.001"
            />
          </div>

          <div className={styles.criteriaItem}>
            <label className={styles.label}>Min Accuracy (%):</label>
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
              className={styles.input}
              min="0"
              max="100"
            />
          </div>
        </div>
      </div>

      {/* Recommended Models */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Recommended Models</h3>
        {loading ? (
          <div className={styles.loading}>Loading recommendations...</div>
        ) : recommendations.length === 0 ? (
          <div className={styles.empty}>
            No models match your criteria. Try relaxing the constraints.
          </div>
        ) : (
          <div className={styles.recommendationList}>
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`${styles.recommendationCard} ${index === 0 ? styles.topRecommendation : ""}`}
              >
                {index === 0 && <div className={styles.badge}>🏆 Best Match</div>}
                <div className={styles.recommendationHeader}>
                  <div>
                    <div className={styles.recommendationName}>{rec.modelName}</div>
                    <div className={styles.recommendationProvider}>
                      {rec.provider}
                    </div>
                  </div>
                  <div className={styles.overallScore}>{rec.overallScore}</div>
                </div>

                <div className={styles.metricsGrid}>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>Speed</div>
                    <div className={styles.metricBar}>
                      <div
                        className={`${styles.metricBarFill} ${styles.metricSpeed}`}
                        style={{ width: `${(1 - rec.speed / 5000) * 100}%` }}
                      />
                    </div>
                    <div className={styles.metricValue}>
                      {rec.speed.toFixed(0)}ms
                    </div>
                  </div>

                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>Accuracy</div>
                    <div className={styles.metricBar}>
                      <div
                        className={`${styles.metricBarFill} ${styles.metricAccuracy}`}
                        style={{ width: `${rec.accuracy * 100}%` }}
                      />
                    </div>
                    <div className={styles.metricValue}>
                      {(rec.accuracy * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>Cost</div>
                    <div className={styles.metricBar}>
                      <div
                        className={`${styles.metricBarFill} ${styles.metricCost}`}
                        style={{ width: `${rec.cost * 100}%` }}
                      />
                    </div>
                    <div className={styles.metricValue}>
                      ${rec.cost.toFixed(4)}/1K
                    </div>
                  </div>

                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>Reliability</div>
                    <div className={styles.metricBar}>
                      <div
                        className={`${styles.metricBarFill} ${styles.metricReliability}`}
                        style={{ width: `${rec.reliability * 100}%` }}
                      />
                    </div>
                    <div className={styles.metricValue}>
                      {(rec.reliability * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedModel(rec.modelName)}
                  className={
                    selectedModel === rec.modelName
                      ? styles.selectedButton
                      : styles.selectButton
                  }
                >
                  {selectedModel === rec.modelName
                    ? "✓ Selected"
                    : "Select Model"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Models */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>All Available Models</h3>
        <div className={styles.modelGrid}>
          {models.map((model, index) => (
            <div
              key={index}
              className={`${styles.modelCard} ${!model.available ? styles.unavailableCard : ""}`}
            >
              <div className={styles.modelCardHeader}>
                <div className={styles.modelCardName}>{model.name}</div>
                <div
                  className={`${styles.statusBadge} ${model.available ? styles.statusAvailable : styles.statusUnavailable}`}
                >
                  {model.available ? "Available" : "Unavailable"}
                </div>
              </div>
              <div className={styles.modelCardProvider}>{model.provider}</div>
              {model.description && (
                <div className={styles.modelCardDescription}>
                  {model.description}
                </div>
              )}
              {model.capabilities && model.capabilities.length > 0 && (
                <div className={styles.capabilities}>
                  {model.capabilities.map((cap, idx) => (
                    <span key={idx} className={styles.capabilityTag}>
                      {cap}
                    </span>
                  ))}
                </div>
              )}
              {model.maxTokens && (
                <div className={styles.modelCardInfo}>
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

export default ModelSelectionInterface;