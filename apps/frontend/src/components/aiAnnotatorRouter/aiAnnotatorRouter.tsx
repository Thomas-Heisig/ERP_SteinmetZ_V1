// SPDX-License-Identifier: MIT
// apps/frontend/src/components/aiAnnotatorRouter.tsx

import React, { useState, useEffect } from "react";
import useAiAnnotatorRouter, {
  NodeForAnnotation,
  GeneratedMeta,
  DashboardRule,
  FormSpec,
  BatchOperation,
  UseAiAnnotatorRouterReturn,
} from "../../hooks/useAiAnnotatorRouter";
import "./aiAnnotatorRouter.css";

// Styling mit verbessertem Design
const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  section: {
    marginBottom: "30px",
    padding: "20px",
    border: "1px solid #e1e5e9",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  card: {
    border: "1px solid #e1e5e9",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    transition: "all 0.2s ease",
    cursor: "pointer",
    ":hover": {
      boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
      transform: "translateY(-2px)",
    },
  },
  button: {
    padding: "10px 16px",
    margin: "4px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  primaryButton: {
    backgroundColor: "#007bff",
    color: "white",
    ":hover": {
      backgroundColor: "#0056b3",
    },
  },
  secondaryButton: {
    backgroundColor: "#6c757d",
    color: "white",
    ":hover": {
      backgroundColor: "#545b62",
    },
  },
  successButton: {
    backgroundColor: "#28a745",
    color: "white",
    ":hover": {
      backgroundColor: "#1e7e34",
    },
  },
  dangerButton: {
    backgroundColor: "#dc3545",
    color: "white",
    ":hover": {
      backgroundColor: "#bd2130",
    },
  },
  statusIndicator: {
    display: "inline-block",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    marginRight: "8px",
  },
  statusHealthy: {
    backgroundColor: "#28a745",
  },
  statusWarning: {
    backgroundColor: "#ffc107",
  },
  statusError: {
    backgroundColor: "#dc3545",
  },
  tag: {
    display: "inline-block",
    backgroundColor: "#e9ecef",
    padding: "4px 12px",
    borderRadius: "16px",
    margin: "2px",
    fontSize: "12px",
    color: "#495057",
  },
  input: {
    padding: "8px 12px",
    border: "1px solid #ced4da",
    borderRadius: "6px",
    fontSize: "14px",
  },
  select: {
    padding: "8px 12px",
    border: "1px solid #ced4da",
    borderRadius: "6px",
    backgroundColor: "white",
    fontSize: "14px",
  },
  filterRow: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap" as const,
    alignItems: "center",
    marginBottom: "15px",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "5px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#495057",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    overflow: "hidden",
    margin: "10px 0",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007bff",
    transition: "width 0.3s ease",
  },
};

const AiAnnotatorRouter: React.FC = () => {
  const {
    // Status & Config
    status,
    statusLoading,
    statusError,
    getStatus,

    health,
    healthLoading,
    healthError,
    getHealth,

    // Nodes
    nodes,
    nodesLoading,
    nodesError,
    pagination,
    listNodes,
    getNode,
    validateNode,
    getNodeAnalysis,
    getNodeMeta,
    getNodeRule,
    getNodeForm,
    getNodeSchema,
    getNodeQuality,

    // Database & Statistics
    databaseStats,
    databaseStatsLoading,
    databaseStatsError,
    getDatabaseStats,

    batchOperations,
    batchOperationsLoading,
    batchOperationsError,
    getBatchOperations,
    cleanupOldBatches,

    // Rules & Forms
    rules,
    rulesLoading,
    rulesError,
    getRules,

    // Quality & Validation
    qualityReport,
    qualityReportLoading,
    qualityReportError,
    getQualityReport,

    errorCorrectionConfig,
    errorCorrectionConfigLoading,
    errorCorrectionConfigError,
    getErrorCorrectionConfig,
    updateErrorCorrectionConfig,

    batchTemplates,
    batchTemplatesLoading,
    batchTemplatesError,
    getBatchTemplates,

    // AI Model Management
    modelStatistics,
    modelStatisticsLoading,
    modelStatisticsError,
    getModelStatistics,
    optimizeSystem,
    testModelSelection,

    // Single Operations
    generateMeta,
    generateRule,
    generateForm,
    enhanceSchema,
    fullAnnotation,

    // Batch Operations
    runBatch,
    getBatch,
    cancelBatch,
    classifyPii,
    validateBatch,
    bulkEnhance,

    // System & Monitoring
    getMonitoringStatus,

    // Debug & Test
    testAiConnection,
    debugPrompt,

    // Results
    lastMeta,
    lastForm,
    lastRule,
    lastBatch,
    lastPii,
    lastValidation,
    lastAnalysis,
  }: UseAiAnnotatorRouterReturn = useAiAnnotatorRouter();

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "nodes" | "batch" | "results" | "models" | "analysis"
  >("overview");
  const [filters, setFilters] = useState({
    kinds: [] as string[],
    missingOnly: false,
    search: "",
    status: [] as string[],
    businessArea: [] as string[],
    complexity: [] as string[],
    limit: 25,
    offset: 0,
  });

  const [operationInProgress, setOperationInProgress] = useState<string | null>(
    null,
  );
  const [selectedNodesForBulk, setSelectedNodesForBulk] = useState<Set<string>>(
    new Set(),
  );

  // Initial Daten laden
  useEffect(() => {
    getStatus();
    getHealth();
    getDatabaseStats();
    getBatchOperations();
    getBatchTemplates();
    getModelStatistics();
    listNodes(filters);
  }, []);

  // Filter anwenden
  const applyFilters = () => {
    listNodes(filters);
  };

  // Status-Indikator
  const renderStatusIndicator = (status: string) => {
    const statusStyle = {
      ...styles.statusIndicator,
      ...(status === "healthy"
        ? styles.statusHealthy
        : status === "warning"
          ? styles.statusWarning
          : styles.statusError),
    };
    return <span style={statusStyle}></span>;
  };

  // Hilfsfunktion für Operationen mit Loading-State
  const executeWithLoading = async (
    operation: () => Promise<any>,
    operationName: string,
  ) => {
    setOperationInProgress(operationName);
    try {
      await operation();
    } finally {
      setOperationInProgress(null);
    }
  };

  // Tab-Navigation
  const renderTabs = () => (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        borderBottom: "1px solid #e1e5e9",
      }}
    >
      {[
        { id: "overview", label: "Overview" },
        { id: "nodes", label: "Nodes" },
        { id: "batch", label: "Batch Operations" },
        { id: "models", label: "AI Models" },
        { id: "analysis", label: "Analysis" },
        { id: "results", label: "Results" },
      ].map((tab) => (
        <button
          key={tab.id}
          style={{
            ...styles.button,
            ...(activeTab === tab.id
              ? styles.primaryButton
              : styles.secondaryButton),
            borderRadius: "6px 6px 0 0",
            margin: "0",
          }}
          onClick={() => setActiveTab(tab.id as any)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  // System Status Section
  const renderSystemStatus = () => (
    <div style={styles.section}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>System Status</h2>
      <div style={styles.grid}>
        {/* AI Provider Status */}
        <div style={styles.card}>
          <h3 style={{ marginBottom: "15px", color: "#495057" }}>
            🤖 AI Provider
          </h3>
          {statusLoading ? (
            <p>Loading...</p>
          ) : statusError ? (
            <p style={{ color: "#dc3545" }}>Error: {statusError}</p>
          ) : status ? (
            <div>
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                {renderStatusIndicator(status.available ? "healthy" : "error")}
                <strong>Provider:</strong> {status.provider}
              </p>
              <p>
                <strong>Model:</strong> {status.model}
              </p>
              <p>
                <strong>Available:</strong>{" "}
                {status.available ? "✅ Yes" : "❌ No"}
              </p>
              <div style={{ marginTop: "10px" }}>
                <strong>Capabilities:</strong>
                <div style={{ marginTop: "8px" }}>
                  {status.capabilities?.map((cap, idx) => (
                    <span key={`${cap}-${idx}`} style={styles.tag}>
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>No status information available</p>
          )}
          <button
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              marginTop: "15px",
            }}
            onClick={() => executeWithLoading(getStatus, "getStatus")}
            disabled={statusLoading}
          >
            {statusLoading ? "Refreshing..." : "Refresh Status"}
          </button>
        </div>

        {/* System Health */}
        <div style={styles.card}>
          <h3 style={{ marginBottom: "15px", color: "#495057" }}>
            🩺 System Health
          </h3>
          {healthLoading ? (
            <p>Loading...</p>
          ) : healthError ? (
            <p style={{ color: "#dc3545" }}>Error: {healthError}</p>
          ) : health ? (
            <div>
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                {renderStatusIndicator(health.overall)}
                <strong>Overall:</strong> {health.overall}
              </p>
              <p style={{ marginBottom: "10px" }}>
                <strong>Database:</strong>{" "}
                {health.database ? "✅ Healthy" : "❌ Unhealthy"}
              </p>
              <p style={{ marginBottom: "10px" }}>
                <strong>AI Providers:</strong>{" "}
                {Object.values(health.aiProviders).filter(Boolean).length}/
                {Object.keys(health.aiProviders).length} healthy
              </p>
              <p style={{ marginBottom: "10px" }}>
                <strong>Memory:</strong> {Math.round(health.memory.percentage)}%
                used
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#6c757d",
                  marginTop: "10px",
                }}
              >
                Last check: {new Date(health.lastHealthCheck).toLocaleString()}
              </p>
            </div>
          ) : (
            <p>No health information available</p>
          )}
          <button
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              marginTop: "15px",
            }}
            onClick={() => executeWithLoading(getHealth, "getHealth")}
            disabled={healthLoading}
          >
            {healthLoading ? "Refreshing..." : "Refresh Health"}
          </button>
        </div>

        {/* Database Statistics */}
        <div style={styles.card}>
          <h3 style={{ marginBottom: "15px", color: "#495057" }}>
            📊 Database Statistics
          </h3>
          {databaseStatsLoading ? (
            <p>Loading...</p>
          ) : databaseStatsError ? (
            <p style={{ color: "#dc3545" }}>Error: {databaseStatsError}</p>
          ) : databaseStats ? (
            <div>
              <p>
                <strong>Total Nodes:</strong> {databaseStats.total}
              </p>
              <p>
                <strong>Annotation Progress:</strong>{" "}
                {databaseStats.annotationProgress.toFixed(1)}%
              </p>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${databaseStats.annotationProgress}%`,
                  }}
                />
              </div>
              <p>
                <strong>Average Confidence:</strong>{" "}
                {(databaseStats.averageConfidence * 100).toFixed(1)}%
              </p>
              <div style={{ marginTop: "10px" }}>
                <strong>Quality Distribution:</strong>
                <div style={{ fontSize: "14px", marginTop: "4px" }}>
                  High: {databaseStats.qualityDistribution?.high || 0}
                </div>
                <div style={{ fontSize: "14px", marginTop: "2px" }}>
                  Medium: {databaseStats.qualityDistribution?.medium || 0}
                </div>
                <div style={{ fontSize: "14px", marginTop: "2px" }}>
                  Low: {databaseStats.qualityDistribution?.low || 0}
                </div>
              </div>
            </div>
          ) : (
            <p>No database statistics available</p>
          )}
          <button
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              marginTop: "15px",
            }}
            onClick={() =>
              executeWithLoading(getDatabaseStats, "getDatabaseStats")
            }
            disabled={databaseStatsLoading}
          >
            {databaseStatsLoading ? "Refreshing..." : "Refresh Stats"}
          </button>
        </div>
      </div>
    </div>
  );

  // Filter Section
  const renderFilters = () => (
    <div style={styles.section}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>🔍 Node Filters</h2>
      <div style={styles.filterRow}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>Search</label>
          <input
            type="text"
            style={styles.input}
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            placeholder="Search nodes..."
          />
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>Limit</label>
          <select
            style={styles.select}
            value={filters.limit}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                limit: parseInt(e.target.value),
              }))
            }
          >
            <option value={10}>10 nodes</option>
            <option value={25}>25 nodes</option>
            <option value={50}>50 nodes</option>
            <option value={100}>100 nodes</option>
          </select>
        </div>

        <div style={{ ...styles.filterGroup, justifyContent: "center" }}>
          <label style={styles.label}>
            <input
              type="checkbox"
              checked={filters.missingOnly}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  missingOnly: e.target.checked,
                }))
              }
              style={{ marginRight: "8px" }}
            />
            Only unannotated nodes
          </label>
        </div>
      </div>

      <div style={styles.filterRow}>
        <button
          style={{ ...styles.button, ...styles.primaryButton }}
          onClick={applyFilters}
          disabled={nodesLoading}
        >
          {nodesLoading ? "Loading..." : "Apply Filters"}
        </button>

        <button
          style={{ ...styles.button, ...styles.secondaryButton }}
          onClick={() => {
            setFilters({
              kinds: [],
              missingOnly: false,
              search: "",
              status: [],
              businessArea: [],
              complexity: [],
              limit: 25,
              offset: 0,
            });
          }}
        >
          Reset Filters
        </button>

        {selectedNodesForBulk.size > 0 && (
          <button
            style={{ ...styles.button, ...styles.successButton }}
            onClick={() => {
              executeWithLoading(
                () => bulkEnhance(Array.from(selectedNodesForBulk)),
                "bulk-enhance",
              );
              setSelectedNodesForBulk(new Set());
            }}
            disabled={operationInProgress !== null}
          >
            🚀 Enhance Selected ({selectedNodesForBulk.size})
          </button>
        )}
      </div>

      {nodesError && (
        <div
          style={{
            color: "#dc3545",
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#f8d7da",
            borderRadius: "4px",
          }}
        >
          Error: {nodesError}
        </div>
      )}
    </div>
  );

  // Nodes List Section
  const renderNodesList = () => (
    <div style={styles.section}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>
        📋 Nodes ({pagination.total})
        {nodesLoading && (
          <span
            style={{ marginLeft: "10px", fontSize: "14px", color: "#6c757d" }}
          >
            Loading...
          </span>
        )}
      </h2>

      {nodes.length === 0 && !nodesLoading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
          No nodes found matching your filters.
        </div>
      ) : (
        <>
          <div style={styles.grid}>
            {nodes.map((node, nodeIdx) => (
              <div
                key={`${node.id}-${nodeIdx}`}
                style={{
                  ...styles.card,
                  borderColor:
                    selectedNode === node.id
                      ? "#007bff"
                      : selectedNodesForBulk.has(node.id)
                        ? "#28a745"
                        : "#e1e5e9",
                  backgroundColor:
                    selectedNode === node.id
                      ? "#e7f1ff"
                      : selectedNodesForBulk.has(node.id)
                        ? "#f0fff4"
                        : "#f8f9fa",
                }}
                onClick={() =>
                  setSelectedNode(node.id === selectedNode ? null : node.id)
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <h4 style={{ margin: 0, color: "#333", flex: 1 }}>
                    {node.title}
                  </h4>
                  <input
                    type="checkbox"
                    checked={selectedNodesForBulk.has(node.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      const newSelection = new Set(selectedNodesForBulk);
                      if (e.target.checked) {
                        newSelection.add(node.id);
                      } else {
                        newSelection.delete(node.id);
                      }
                      setSelectedNodesForBulk(newSelection);
                    }}
                    style={{ marginLeft: "10px" }}
                  />
                </div>

                <p
                  style={{
                    fontSize: "14px",
                    color: "#6c757d",
                    marginBottom: "8px",
                  }}
                >
                  <strong>ID:</strong> {node.id}
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6c757d",
                    marginBottom: "8px",
                  }}
                >
                  <strong>Kind:</strong> {node.kind}
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6c757d",
                    marginBottom: "8px",
                  }}
                >
                  <strong>Path:</strong> {node.path.join(" → ")}
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6c757d",
                    marginBottom: "12px",
                  }}
                >
                  <strong>Status:</strong>
                  <span
                    style={{
                      color:
                        node.annotation_status === "completed"
                          ? "#28a745"
                          : node.annotation_status === "failed"
                            ? "#dc3545"
                            : "#ffc107",
                      fontWeight: "500",
                      marginLeft: "5px",
                    }}
                  >
                    {node.annotation_status || "pending"}
                  </span>
                </p>

                {node.meta_json && (
                  <div
                    style={{
                      marginTop: "12px",
                      paddingTop: "12px",
                      borderTop: "1px solid #dee2e6",
                    }}
                  >
                    <p style={{ fontSize: "14px", marginBottom: "8px" }}>
                      {node.meta_json.description}
                    </p>
                    <div style={{ marginBottom: "8px" }}>
                      {node.meta_json.tags?.map(
                        (tag: string, tagIdx: number) => (
                          <span
                            key={`${tag}-${node.id}-${tagIdx}`}
                            style={styles.tag}
                          >
                            {tag}
                          </span>
                        ),
                      )}
                    </div>
                    <p style={{ fontSize: "14px", color: "#6c757d" }}>
                      <strong>Business Area:</strong>{" "}
                      {node.meta_json.businessArea} |<strong> PII:</strong>{" "}
                      {node.meta_json.piiClass} |<strong> Confidence:</strong>{" "}
                      {(node.meta_json.quality?.confidence * 100)?.toFixed(1)}%
                    </p>
                  </div>
                )}

                <div
                  style={{
                    marginTop: "15px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <button
                    style={{ ...styles.button, ...styles.primaryButton }}
                    onClick={(e) => {
                      e.stopPropagation();
                      executeWithLoading(
                        () => generateMeta(node.id),
                        `generateMeta-${node.id}`,
                      );
                    }}
                    disabled={operationInProgress !== null}
                    title="Generate metadata for this node"
                  >
                    Meta
                  </button>
                  <button
                    style={{ ...styles.button, ...styles.secondaryButton }}
                    onClick={(e) => {
                      e.stopPropagation();
                      executeWithLoading(
                        () => generateRule(node.id),
                        `generateRule-${node.id}`,
                      );
                    }}
                    disabled={operationInProgress !== null}
                    title="Generate dashboard rule"
                  >
                    Rule
                  </button>
                  <button
                    style={{ ...styles.button, ...styles.successButton }}
                    onClick={(e) => {
                      e.stopPropagation();
                      executeWithLoading(
                        () => fullAnnotation(node.id),
                        `fullAnnotation-${node.id}`,
                      );
                    }}
                    disabled={operationInProgress !== null}
                    title="Complete annotation (Meta + Rule + Form)"
                  >
                    Full
                  </button>
                  <button
                    style={{
                      ...styles.button,
                      ...{ backgroundColor: "#6f42c1", color: "white" },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      executeWithLoading(
                        () => validateNode(node.id),
                        `validateNode-${node.id}`,
                      );
                    }}
                    disabled={operationInProgress !== null}
                    title="Validate node annotations"
                  >
                    Validate
                  </button>
                  <button
                    style={{
                      ...styles.button,
                      ...{ backgroundColor: "#20c997", color: "white" },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      executeWithLoading(
                        () => getNodeAnalysis(node.id),
                        `analyze-${node.id}`,
                      );
                    }}
                    disabled={operationInProgress !== null}
                    title="Analyze node"
                  >
                    Analyze
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
            }}
          >
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  offset: Math.max(0, prev.offset - prev.limit),
                }))
              }
              disabled={filters.offset === 0 || nodesLoading}
            >
              ← Previous
            </button>

            <span style={{ color: "#6c757d" }}>
              Page {Math.floor(filters.offset / filters.limit) + 1} of{" "}
              {Math.ceil(pagination.total / filters.limit)} ({pagination.total}{" "}
              total nodes)
            </span>

            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  offset: prev.offset + prev.limit,
                }))
              }
              disabled={
                filters.offset + filters.limit >= pagination.total ||
                nodesLoading
              }
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );

  // AI Models Section
  const renderModelsSection = () => (
    <div style={styles.section}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>
        🤖 AI Model Management
      </h2>

      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "15px", color: "#495057" }}>
          Model Statistics
        </h3>
        {modelStatisticsLoading ? (
          <p>Loading model statistics...</p>
        ) : modelStatisticsError ? (
          <p style={{ color: "#dc3545" }}>Error: {modelStatisticsError}</p>
        ) : modelStatistics ? (
          <div style={styles.grid}>
            <div style={styles.card}>
              <h4 style={{ marginBottom: "15px", color: "#333" }}>
                Available Models
              </h4>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {modelStatistics.availableModels.map((model, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "8px",
                      marginBottom: "5px",
                      backgroundColor: "#ffffff",
                      borderRadius: "4px",
                      border: "1px solid #e1e5e9",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>{model}</span>
                      <span
                        style={{
                          color: modelStatistics.healthStatus[model]
                            ? "#28a745"
                            : "#dc3545",
                          fontSize: "12px",
                        }}
                      >
                        {modelStatistics.healthStatus[model] ? "✅" : "❌"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <h4 style={{ marginBottom: "15px", color: "#333" }}>
                Health Status
              </h4>
              <div>
                {Object.entries(modelStatistics.healthStatus).map(
                  ([model, healthy]) => (
                    <div
                      key={model}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                        padding: "5px",
                      }}
                    >
                      {renderStatusIndicator(healthy ? "healthy" : "error")}
                      <span style={{ flex: 1 }}>{model}</span>
                      <span
                        style={{
                          color: healthy ? "#28a745" : "#dc3545",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {healthy ? "Healthy" : "Unhealthy"}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            {modelStatistics.recommendations.length > 0 && (
              <div style={styles.card}>
                <h4 style={{ marginBottom: "15px", color: "#333" }}>
                  Recommendations
                </h4>
                <ul style={{ paddingLeft: "20px" }}>
                  {modelStatistics.recommendations.map((rec, idx) => (
                    <li
                      key={idx}
                      style={{ marginBottom: "8px", fontSize: "14px" }}
                    >
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p>No model statistics available</p>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={() =>
              executeWithLoading(getModelStatistics, "get-model-statistics")
            }
            disabled={modelStatisticsLoading}
          >
            Refresh Model Stats
          </button>
          <button
            style={{ ...styles.button, ...styles.successButton }}
            onClick={() =>
              executeWithLoading(optimizeSystem, "optimize-system")
            }
            disabled={operationInProgress !== null}
          >
            Optimize System
          </button>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={() =>
              executeWithLoading(
                () => testModelSelection("meta", "balanced"),
                "test-model-selection",
              )
            }
            disabled={operationInProgress !== null}
          >
            Test Model Selection
          </button>
        </div>
      </div>
    </div>
  );

  // Analysis Section
  const renderAnalysisSection = () => (
    <div style={styles.section}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>🔍 Node Analysis</h2>

      {lastAnalysis && (
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ marginBottom: "15px", color: "#495057" }}>
            Last Analysis: {lastAnalysis.id}
          </h3>
          <div style={styles.grid}>
            <div style={styles.card}>
              <h4 style={{ marginBottom: "15px", color: "#333" }}>
                Technical Analysis
              </h4>
              <p>
                <strong>Complexity:</strong>{" "}
                {lastAnalysis.analysis.technical.complexity}
              </p>
              <p>
                <strong>Data Volume:</strong>{" "}
                {lastAnalysis.analysis.technical.dataVolume}
              </p>
              <p>
                <strong>Performance Impact:</strong>{" "}
                {lastAnalysis.analysis.technical.performanceImpact}
              </p>
            </div>

            <div style={styles.card}>
              <h4 style={{ marginBottom: "15px", color: "#333" }}>
                Integration Points
              </h4>
              {lastAnalysis.analysis.integrationPoints.length > 0 ? (
                <div>
                  {lastAnalysis.analysis.integrationPoints.map((point, idx) => (
                    <span key={idx} style={styles.tag}>
                      {point}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#6c757d" }}>
                  No integration points detected
                </p>
              )}
            </div>

            <div style={styles.card}>
              <h4 style={{ marginBottom: "15px", color: "#333" }}>
                Classification
              </h4>
              <p>
                <strong>Business Area:</strong>{" "}
                {lastAnalysis.analysis.businessArea}
              </p>
              <p>
                <strong>PII Class:</strong> {lastAnalysis.analysis.piiClass}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 style={{ marginBottom: "15px", color: "#495057" }}>
          Quick Analysis
        </h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={() =>
              executeWithLoading(
                () =>
                  runBatch({
                    operation: "classify_pii",
                    filters: {},
                    options: { chunkSize: 50, parallelRequests: 5 },
                  }),
                "batch-pii-analysis",
              )
            }
            disabled={operationInProgress !== null}
          >
            🔒 PII Analysis All Nodes
          </button>
          <button
            style={{ ...styles.button, ...styles.successButton }}
            onClick={() =>
              executeWithLoading(getMonitoringStatus, "get-monitoring-status")
            }
            disabled={operationInProgress !== null}
          >
            📊 Get System Monitoring
          </button>
        </div>
      </div>
    </div>
  );

  // Batch Operations Section
  const renderBatchOperations = () => (
    <div style={styles.section}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>
        ⚡ Batch Operations
      </h2>

      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "15px", color: "#495057" }}>
          Quick Actions
        </h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={() =>
              executeWithLoading(
                () =>
                  runBatch({
                    operation: "generate_meta",
                    filters: { missingOnly: true },
                    options: { chunkSize: 20, parallelRequests: 3 },
                  }),
                "batch-generate-meta",
              )
            }
            disabled={operationInProgress !== null}
          >
            🚀 Annotate All Missing
          </button>
          <button
            style={{ ...styles.button, ...styles.successButton }}
            onClick={() =>
              executeWithLoading(
                () =>
                  runBatch({
                    operation: "classify_pii",
                    filters: {},
                    options: { chunkSize: 50, parallelRequests: 5 },
                  }),
                "batch-pii-scan",
              )
            }
            disabled={operationInProgress !== null}
          >
            🔒 PII Scan All Nodes
          </button>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={() =>
              executeWithLoading(
                () =>
                  runBatch({
                    operation: "validate_nodes",
                    filters: {},
                    options: { chunkSize: 25, parallelRequests: 4 },
                  }),
                "batch-validate",
              )
            }
            disabled={operationInProgress !== null}
          >
            ✅ Validate All Nodes
          </button>
          <button
            style={{
              ...styles.button,
              ...{ backgroundColor: "#fd7e14", color: "white" },
            }}
            onClick={() =>
              executeWithLoading(
                () =>
                  runBatch({
                    operation: "full_annotation",
                    filters: { missingOnly: true },
                    options: { chunkSize: 5, parallelRequests: 2 },
                  }),
                "batch-full-annotation",
              )
            }
            disabled={operationInProgress !== null}
          >
            🎯 Full Annotation All
          </button>
          {selectedNodesForBulk.size > 0 && (
            <button
              style={{
                ...styles.button,
                ...{ backgroundColor: "#e83e8c", color: "white" },
              }}
              onClick={() =>
                executeWithLoading(
                  () => bulkEnhance(Array.from(selectedNodesForBulk)),
                  "bulk-enhance-selected",
                )
              }
              disabled={operationInProgress !== null}
            >
              🚀 Enhance Selected ({selectedNodesForBulk.size})
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: "15px", color: "#495057" }}>
          Recent Batch Jobs
        </h3>
        {batchOperationsLoading ? (
          <p>Loading batch operations...</p>
        ) : batchOperationsError ? (
          <p style={{ color: "#dc3545" }}>Error: {batchOperationsError}</p>
        ) : batchOperations.length === 0 ? (
          <p style={{ color: "#6c757d", textAlign: "center", padding: "20px" }}>
            No batch operations found.
          </p>
        ) : (
          <div style={styles.grid}>
            {batchOperations.slice(0, 6).map((batch, idx) => (
              <div key={`${batch.id || "batch"}-${idx}`} style={styles.card}>
                <h4 style={{ marginBottom: "10px", color: "#333" }}>
                  {batch.operation}
                </h4>
                <p style={{ fontSize: "14px", marginBottom: "8px" }}>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      color:
                        batch.status === "completed"
                          ? "#28a745"
                          : batch.status === "failed"
                            ? "#dc3545"
                            : batch.status === "running"
                              ? "#007bff"
                              : "#6c757d",
                      fontWeight: "500",
                    }}
                  >
                    {batch.status}
                  </span>
                </p>
                <p style={{ fontSize: "14px", marginBottom: "8px" }}>
                  <strong>Progress:</strong> {batch.progress}%
                </p>
                {batch.progress && batch.progress > 0 && (
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${batch.progress}%`,
                      }}
                    />
                  </div>
                )}
                <p style={{ fontSize: "14px", color: "#6c757d" }}>
                  Created: {new Date(batch.created_at!).toLocaleString()}
                </p>
                {batch.status === "running" && batch.id && (
                  <button
                    style={{
                      ...styles.button,
                      ...styles.dangerButton,
                      marginTop: "10px",
                    }}
                    onClick={() =>
                      executeWithLoading(
                        () => cancelBatch(batch.id!),
                        `cancel-batch-${batch.id}`,
                      )
                    }
                    disabled={operationInProgress !== null}
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          style={{
            ...styles.button,
            ...styles.secondaryButton,
            marginTop: "15px",
          }}
          onClick={() =>
            executeWithLoading(getBatchOperations, "getBatchOperations")
          }
          disabled={batchOperationsLoading}
        >
          {batchOperationsLoading ? "Refreshing..." : "Refresh Batch List"}
        </button>
      </div>

      {lastBatch && (
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            backgroundColor: "#e7f3ff",
            borderRadius: "8px",
            border: "1px solid #b3d7ff",
          }}
        >
          <h4 style={{ marginBottom: "15px", color: "#004085" }}>
            📈 Last Batch Result
          </h4>
          <div style={styles.grid}>
            <div>
              <p>
                <strong>Processed:</strong> {lastBatch.processed}/
                {lastBatch.total}
              </p>
              <p>
                <strong>Successful:</strong> {lastBatch.successful}
              </p>
              <p>
                <strong>Failed:</strong> {lastBatch.failed}
              </p>
            </div>
            {lastBatch.summary && (
              <div>
                <p>
                  <strong>Avg Confidence:</strong>{" "}
                  {(lastBatch.summary.averageConfidence * 100).toFixed(1)}%
                </p>
                <p>
                  <strong>Quality Score:</strong>{" "}
                  {(lastBatch.summary.qualityScore * 100).toFixed(1)}%
                </p>
                {lastBatch.summary.performanceMetrics && (
                  <p>
                    <strong>Avg Duration:</strong>{" "}
                    {Math.round(
                      lastBatch.summary.performanceMetrics.averageDuration,
                    )}
                    ms
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Results Section
  const renderResults = () => (
    <div style={styles.section}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>📊 Recent Results</h2>

      {!lastMeta &&
        !lastRule &&
        !lastForm &&
        !lastValidation &&
        !lastBatch &&
        !lastAnalysis && (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}
          >
            No recent results. Perform some operations to see results here.
          </div>
        )}

      <div style={styles.grid}>
        {/* Last Meta Generation */}
        {lastMeta && (
          <div style={styles.card}>
            <h3 style={{ marginBottom: "15px", color: "#333" }}>
              📝 Meta Generation
            </h3>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Node:</strong> {lastMeta.id}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Description:</strong>{" "}
              {lastMeta.meta?.description?.substring(0, 100)}...
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Business Area:</strong>{" "}
              {lastMeta.meta?.businessArea || "—"}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>PII Class:</strong> {lastMeta.meta?.piiClass || "—"}
            </p>
            {lastMeta.meta?.quality?.confidence !== undefined && (
              <p style={{ fontSize: "14px", marginBottom: "8px" }}>
                <strong>Confidence:</strong>{" "}
                {((lastMeta.meta.quality.confidence ?? 0) * 100).toFixed(1)}%
              </p>
            )}
            <div style={{ marginTop: "10px" }}>
              {lastMeta.meta?.tags
                ?.slice(0, 3)
                .map((tag: string, idx: number) => (
                  <span key={idx} style={styles.tag}>
                    {tag}
                  </span>
                ))}
              {lastMeta.meta?.tags && lastMeta.meta.tags.length > 3 && (
                <span style={styles.tag}>
                  +{lastMeta.meta.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Last Rule Generation */}
        {lastRule && (
          <div style={styles.card}>
            <h3 style={{ marginBottom: "15px", color: "#333" }}>
              📊 Rule Generation
            </h3>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Node:</strong> {lastRule.id}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Type:</strong> {lastRule.rule?.type || "—"}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Widget:</strong> {lastRule.rule?.widget || "—"}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Layout:</strong> {lastRule.rule?.layout?.colSpan || 1} x{" "}
              {lastRule.rule?.layout?.rowSpan || 1}
            </p>
            {lastRule.rule?.dataSource && (
              <p style={{ fontSize: "14px", marginBottom: "8px" }}>
                <strong>Data Source:</strong> {lastRule.rule.dataSource}
              </p>
            )}
            {lastRule.rule?.refreshInterval && (
              <p style={{ fontSize: "14px", marginBottom: "8px" }}>
                <strong>Refresh:</strong> {lastRule.rule.refreshInterval}s
              </p>
            )}
          </div>
        )}

        {/* Last Form Generation */}
        {lastForm && (
          <div style={styles.card}>
            <h3 style={{ marginBottom: "15px", color: "#333" }}>
              📋 Form Generation
            </h3>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Node:</strong> {lastForm.id}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Title:</strong> {lastForm.form?.title || "—"}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Layout:</strong> {lastForm.form?.layout || "—"}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Fields:</strong> {lastForm.form?.fields?.length || 0}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Actions:</strong>{" "}
              {lastForm.form?.actions?.join(", ") || "—"}
            </p>
            {lastForm.form?.sections && (
              <p style={{ fontSize: "14px", marginBottom: "8px" }}>
                <strong>Sections:</strong> {lastForm.form.sections.length}
              </p>
            )}
          </div>
        )}

        {/* Last Validation */}
        {lastValidation && (
          <div style={styles.card}>
            <h3 style={{ marginBottom: "15px", color: "#333" }}>
              ✅ Validation Result
            </h3>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Node:</strong> {lastValidation.id}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Valid:</strong>{" "}
              <span
                style={{
                  color: lastValidation.validation?.valid
                    ? "#28a745"
                    : "#dc3545",
                  fontWeight: "500",
                }}
              >
                {lastValidation.validation?.valid ? "Yes" : "No"}
              </span>
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Errors:</strong>{" "}
              {lastValidation.validation?.errors?.length || 0}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Warnings:</strong>{" "}
              {lastValidation.validation?.warnings?.length || 0}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Suggestions:</strong>{" "}
              {lastValidation.validation?.suggestions?.length || 0}
            </p>
            {lastValidation.validation?.suggestions &&
              lastValidation.validation.suggestions.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <strong>Top Suggestions:</strong>
                  <ul
                    style={{
                      fontSize: "12px",
                      marginTop: "5px",
                      paddingLeft: "15px",
                    }}
                  >
                    {lastValidation.validation.suggestions
                      .slice(0, 2)
                      .map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                  </ul>
                </div>
              )}
          </div>
        )}

        {/* Last Analysis */}
        {lastAnalysis && (
          <div style={styles.card}>
            <h3 style={{ marginBottom: "15px", color: "#333" }}>
              🔍 Node Analysis
            </h3>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Node:</strong> {lastAnalysis.id}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Complexity:</strong>{" "}
              {lastAnalysis.analysis.technical.complexity}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Data Volume:</strong>{" "}
              {lastAnalysis.analysis.technical.dataVolume}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Business Area:</strong>{" "}
              {lastAnalysis.analysis.businessArea}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>PII Class:</strong> {lastAnalysis.analysis.piiClass}
            </p>
            {lastAnalysis.analysis.integrationPoints.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <strong>Integration Points:</strong>
                <div style={{ marginTop: "5px" }}>
                  {lastAnalysis.analysis.integrationPoints
                    .slice(0, 2)
                    .map((point, idx) => (
                      <span key={idx} style={styles.tag}>
                        {point}
                      </span>
                    ))}
                  {lastAnalysis.analysis.integrationPoints.length > 2 && (
                    <span style={styles.tag}>
                      +{lastAnalysis.analysis.integrationPoints.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Last Batch Result Summary */}
        {lastBatch && (
          <div style={styles.card}>
            <h3 style={{ marginBottom: "15px", color: "#333" }}>
              ⚡ Batch Result
            </h3>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>ID:</strong> {lastBatch.id}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Processed:</strong> {lastBatch.processed}/
              {lastBatch.total}
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Success Rate:</strong>{" "}
              {lastBatch.total > 0
                ? ((lastBatch.successful / lastBatch.total) * 100).toFixed(1)
                : 0}
              %
            </p>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Failed:</strong> {lastBatch.failed}
            </p>
            {lastBatch.summary && (
              <>
                <p style={{ fontSize: "14px", marginBottom: "8px" }}>
                  <strong>Avg Confidence:</strong>{" "}
                  {(lastBatch.summary.averageConfidence * 100).toFixed(1)}%
                </p>
                <p style={{ fontSize: "14px", marginBottom: "8px" }}>
                  <strong>Quality Score:</strong>{" "}
                  {(lastBatch.summary.qualityScore * 100).toFixed(1)}%
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Debug Section
  const renderDebugSection = () => (
    <div style={styles.section}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>🐛 Debug Tools</h2>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          style={{ ...styles.button, ...styles.secondaryButton }}
          onClick={() =>
            executeWithLoading(
              () =>
                testAiConnection(
                  "Test AI connection",
                  status?.model,
                  status?.provider,
                ),
              "test-ai-connection",
            )
          }
          disabled={operationInProgress !== null}
        >
          Test AI Connection
        </button>
        <button
          style={{ ...styles.button, ...styles.secondaryButton }}
          onClick={() =>
            executeWithLoading(
              getErrorCorrectionConfig,
              "get-error-correction-config",
            )
          }
          disabled={errorCorrectionConfigLoading}
        >
          Get Error Correction Config
        </button>
        <button
          style={{ ...styles.button, ...styles.secondaryButton }}
          onClick={() =>
            executeWithLoading(getQualityReport, "get-quality-report")
          }
          disabled={qualityReportLoading}
        >
          Quality Report
        </button>
      </div>

      {operationInProgress && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "4px",
            color: "#856404",
          }}
        >
          Operation in progress: {operationInProgress}
        </div>
      )}
    </div>
  );

  // Haupt-Rendering mit Tabs
  return (
    <div style={styles.container}>
      <header style={{ marginBottom: "30px" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            color: "#333",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          🤖 AI Annotator Router
        </h1>
        <p style={{ color: "#6c757d", fontSize: "1.1rem" }}>
          Manage AI-powered annotations for ERP function nodes
        </p>
      </header>

      {renderTabs()}

      {activeTab === "overview" && (
        <>
          {renderSystemStatus()}
          {renderFilters()}
        </>
      )}

      {activeTab === "nodes" && (
        <>
          {renderFilters()}
          {renderNodesList()}
        </>
      )}

      {activeTab === "batch" && <>{renderBatchOperations()}</>}

      {activeTab === "models" && <>{renderModelsSection()}</>}

      {activeTab === "analysis" && <>{renderAnalysisSection()}</>}

      {activeTab === "results" && <>{renderResults()}</>}

      {/* Debug Section (nur im Development) */}
      {import.meta.env?.MODE === "development" && renderDebugSection()}
    </div>
  );
};

export default AiAnnotatorRouter;
