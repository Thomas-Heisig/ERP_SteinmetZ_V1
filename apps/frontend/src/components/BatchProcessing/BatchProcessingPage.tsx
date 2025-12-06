// SPDX-License-Identifier: MIT
// apps/frontend/src/components/BatchProcessing/BatchProcessingPage.tsx

/**
 * Complete Batch Processing UI
 * Integrates batch creation, progress tracking, history, and result visualization
 */

import React, { useState, useEffect } from "react";
import { BatchCreationForm } from "./BatchCreationForm";
import { ProgressTracker } from "./ProgressTracker";

interface BatchOperation {
  id: string;
  operation: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  progress: number;
  created_at: string;
  completed_at?: string;
  name?: string;
  description?: string;
}

interface BatchResult {
  batchId: string;
  overview: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    successRate: number;
  };
  timeline?: any[];
  errorDistribution?: any[];
}

export const BatchProcessingPage: React.FC = () => {
  const [view, setView] = useState<"create" | "tracking" | "history">(
    "history",
  );
  const [batches, setBatches] = useState<BatchOperation[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchOperation | null>(
    null,
  );
  const [batchResults, setBatchResults] = useState<BatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Load batch history on mount
  useEffect(() => {
    loadBatchHistory();
  }, []);

  // Use WebSocket for real-time batch updates when tracking
  useEffect(() => {
    if (view === "tracking" && selectedBatch) {
      // Load initial details
      loadBatchDetails(selectedBatch.id);

      // WebSocket updates will be handled by useBatchUpdates hook if integrated
      // For now, use longer polling interval as fallback (30 seconds instead of 2)
      const interval = setInterval(() => {
        loadBatchDetails(selectedBatch.id);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [view, selectedBatch]);

  const loadBatchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/ai-annotator/batch/history`);
      const data = await response.json();
      if (data.success) {
        setBatches(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load batch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBatchDetails = async (batchId: string) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/ai-annotator/batch/${batchId}`,
      );
      const data = await response.json();
      if (data.success) {
        setSelectedBatch(data.data);

        // Load results if batch is completed
        if (data.data.status === "completed") {
          const resultsResponse = await fetch(
            `${apiUrl}/api/ai-annotator/batch/${batchId}/results`,
          );
          const resultsData = await resultsResponse.json();
          if (resultsData.success) {
            setBatchResults(resultsData.data);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load batch details:", error);
    }
  };

  const handleCreateBatch = async (formData: any) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/ai-annotator/batch/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        const newBatch = data.data;
        setSelectedBatch(newBatch);
        setView("tracking");
        loadBatchHistory(); // Refresh history
      }
    } catch (error) {
      console.error("Failed to create batch:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBatch = async (batchId: string) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/ai-annotator/batch/${batchId}/cancel`,
        { method: "POST" },
      );
      const data = await response.json();
      if (data.success) {
        loadBatchHistory();
        loadBatchDetails(batchId);
      }
    } catch (error) {
      console.error("Failed to cancel batch:", error);
    }
  };

  const renderCreateView = () => (
    <BatchCreationForm
      onSubmit={handleCreateBatch}
      onCancel={() => setView("history")}
    />
  );

  const renderTrackingView = () => {
    if (!selectedBatch) return null;

    return (
      <div style={styles.trackingContainer}>
        <div style={styles.trackingHeader}>
          <h2>Batch Progress</h2>
          <button onClick={() => setView("history")} style={styles.button}>
            ← Back to History
          </button>
        </div>

        <ProgressTracker
          batch={{
            batchId: selectedBatch.id,
            status: selectedBatch.status as any,
            progress: selectedBatch.progress,
          }}
          onCancel={(batchId) => handleCancelBatch(batchId)}
        />

        {selectedBatch.status === "processing" && (
          <div style={styles.actions}>
            <button
              onClick={() => handleCancelBatch(selectedBatch.id)}
              style={{ ...styles.button, backgroundColor: "#e74c3c" }}
            >
              Cancel Batch
            </button>
          </div>
        )}

        {/* Results Visualization */}
        {batchResults && selectedBatch.status === "completed" && (
          <div style={styles.resultsSection}>
            <h3>Batch Results</h3>
            <div style={styles.resultsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Processed</div>
                <div style={styles.statValue}>
                  {batchResults.overview.total}
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Successful</div>
                <div style={{ ...styles.statValue, color: "#27ae60" }}>
                  {batchResults.overview.successful}
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Failed</div>
                <div style={{ ...styles.statValue, color: "#e74c3c" }}>
                  {batchResults.overview.failed}
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Success Rate</div>
                <div style={styles.statValue}>
                  {(batchResults.overview.successRate * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderHistoryView = () => (
    <div style={styles.historyContainer}>
      <div style={styles.historyHeader}>
        <h2>Batch History</h2>
        <button onClick={() => setView("create")} style={styles.button}>
          + Create New Batch
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading batch history...</div>
      ) : batches.length === 0 ? (
        <div style={styles.empty}>
          <p>No batch operations yet</p>
          <button onClick={() => setView("create")} style={styles.button}>
            Create Your First Batch
          </button>
        </div>
      ) : (
        <div style={styles.batchList}>
          {batches.map((batch) => (
            <div
              key={batch.id}
              style={styles.batchCard}
              onClick={() => {
                setSelectedBatch(batch);
                setView("tracking");
              }}
            >
              <div style={styles.batchHeader}>
                <div>
                  <h4 style={styles.batchName}>
                    {batch.name || `Batch ${batch.id.substring(0, 8)}`}
                  </h4>
                  <p style={styles.batchOperation}>{batch.operation}</p>
                </div>
                <div style={getStatusStyle(batch.status)}>{batch.status}</div>
              </div>
              <div style={styles.batchInfo}>
                <span>Progress: {batch.progress}%</span>
                <span>
                  Created: {new Date(batch.created_at).toLocaleString()}
                </span>
              </div>
              {batch.description && (
                <p style={styles.batchDescription}>{batch.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Batch Processing</h1>

      {/* Navigation Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setView("history")}
          style={view === "history" ? styles.activeTab : styles.tab}
        >
          History
        </button>
        <button
          onClick={() => setView("create")}
          style={view === "create" ? styles.activeTab : styles.tab}
        >
          Create New
        </button>
        {selectedBatch && (
          <button
            onClick={() => setView("tracking")}
            style={view === "tracking" ? styles.activeTab : styles.tab}
          >
            Track Progress
          </button>
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {view === "create" && renderCreateView()}
        {view === "tracking" && renderTrackingView()}
        {view === "history" && renderHistoryView()}
      </div>
    </div>
  );
};

const getStatusStyle = (status: string): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "600",
    textTransform: "uppercase",
  };

  switch (status) {
    case "completed":
      return { ...baseStyle, backgroundColor: "#d4edda", color: "#155724" };
    case "processing":
      return { ...baseStyle, backgroundColor: "#fff3cd", color: "#856404" };
    case "failed":
      return { ...baseStyle, backgroundColor: "#f8d7da", color: "#721c24" };
    case "cancelled":
      return { ...baseStyle, backgroundColor: "#e2e3e5", color: "#383d41" };
    default:
      return { ...baseStyle, backgroundColor: "#d1ecf1", color: "#0c5460" };
  }
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
  },
  tabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "2rem",
    borderBottom: "2px solid #e0e0e0",
  },
  tab: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "3px solid transparent",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    color: "#666",
  },
  activeTab: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "3px solid #4a90e2",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#4a90e2",
  },
  content: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "#4a90e2",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  historyContainer: {},
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  loading: {
    textAlign: "center",
    padding: "3rem",
    color: "#666",
  },
  empty: {
    textAlign: "center",
    padding: "3rem",
  },
  batchList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  batchCard: {
    padding: "1.5rem",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: "white",
  },
  batchHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "0.75rem",
  },
  batchName: {
    margin: "0 0 0.25rem 0",
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  batchOperation: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#666",
  },
  batchInfo: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
    color: "#999",
  },
  batchDescription: {
    marginTop: "0.75rem",
    fontSize: "0.9rem",
    color: "#666",
  },
  trackingContainer: {},
  trackingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  actions: {
    marginTop: "1.5rem",
    display: "flex",
    gap: "1rem",
  },
  resultsSection: {
    marginTop: "2rem",
    padding: "1.5rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
  },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  },
  statCard: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    textAlign: "center",
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "#666",
    marginBottom: "0.5rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#333",
  },
};

export default BatchProcessingPage;
