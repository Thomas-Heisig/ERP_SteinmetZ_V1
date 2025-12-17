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
  timeline?: unknown[];
  errorDistribution?: unknown[];
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

  const loadBatchHistory = React.useCallback(async () => {
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
  }, [apiUrl]);

  const loadBatchDetails = React.useCallback(
    async (batchId: string) => {
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
    },
    [apiUrl],
  );

  // Load batch history on mount
  useEffect(() => {
    loadBatchHistory();
  }, [loadBatchHistory]);

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
  }, [view, selectedBatch, loadBatchDetails]);

  const handleCreateBatch = async (formData: unknown) => {
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
      <div>
        <div className="batch-tracking-header">
          <h2>Batch Progress</h2>
          <button
            onClick={() => setView("history")}
            className="batch-processing-button"
          >
            ← Back to History
          </button>
        </div>

        <ProgressTracker
          batch={{
            batchId: selectedBatch.id,
            status: selectedBatch.status as
              | "pending"
              | "running"
              | "completed"
              | "failed"
              | "cancelled",
            progress: selectedBatch.progress,
          }}
          onCancel={(batchId) => handleCancelBatch(batchId)}
        />

        {selectedBatch.status === "processing" && (
          <div className="batch-tracking-actions">
            <button
              onClick={() => handleCancelBatch(selectedBatch.id)}
              className="batch-processing-button batch-processing-button-danger"
            >
              Cancel Batch
            </button>
          </div>
        )}

        {/* Results Visualization */}
        {batchResults && selectedBatch.status === "completed" && (
          <div className="batch-results-section">
            <h3 className="batch-results-title">Batch Results</h3>
            <div className="batch-results-grid">
              <div className="batch-stat-card">
                <div className="batch-stat-label">Total Processed</div>
                <div className="batch-stat-value">
                  {batchResults.overview.total}
                </div>
              </div>
              <div className="batch-stat-card">
                <div className="batch-stat-label">Successful</div>
                <div className="batch-stat-value batch-stat-value-success">
                  {batchResults.overview.successful}
                </div>
              </div>
              <div className="batch-stat-card">
                <div className="batch-stat-label">Failed</div>
                <div className="batch-stat-value batch-stat-value-error">
                  {batchResults.overview.failed}
                </div>
              </div>
              <div className="batch-stat-card">
                <div className="batch-stat-label">Success Rate</div>
                <div className="batch-stat-value">
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
    <div>
      <div className="batch-processing-history-header">
        <h2>Batch History</h2>
        <button
          onClick={() => setView("create")}
          className="batch-processing-button"
        >
          + Create New Batch
        </button>
      </div>

      {loading ? (
        <div className="batch-processing-loading">Loading batch history...</div>
      ) : batches.length === 0 ? (
        <div className="batch-processing-empty">
          <p>No batch operations yet</p>
          <button
            onClick={() => setView("create")}
            className="batch-processing-button"
          >
            Create Your First Batch
          </button>
        </div>
      ) : (
        <div className="batch-processing-list">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="batch-card"
              onClick={() => {
                setSelectedBatch(batch);
                setView("tracking");
              }}
            >
              <div className="batch-card-header">
                <div className="batch-card-info">
                  <h4 className="batch-card-name">
                    {batch.name || `Batch ${batch.id.substring(0, 8)}`}
                  </h4>
                  <p className="batch-card-operation">{batch.operation}</p>
                </div>
                <div
                  className={`batch-status-badge batch-status-${batch.status}`}
                >
                  {batch.status}
                </div>
              </div>
              <div className="batch-card-meta">
                <span>Progress: {batch.progress}%</span>
                <span>
                  Created: {new Date(batch.created_at).toLocaleString()}
                </span>
              </div>
              {batch.description && (
                <p className="batch-card-description">{batch.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="batch-processing-container">
      <h1 className="batch-processing-title">Batch Processing</h1>

      {/* Navigation Tabs */}
      <div className="batch-processing-tabs">
        <button
          onClick={() => setView("history")}
          className={
            view === "history"
              ? "batch-processing-tab-active"
              : "batch-processing-tab"
          }
        >
          History
        </button>
        <button
          onClick={() => setView("create")}
          className={
            view === "create"
              ? "batch-processing-tab-active"
              : "batch-processing-tab"
          }
        >
          Create New
        </button>
        {selectedBatch && (
          <button
            onClick={() => setView("tracking")}
            className={
              view === "tracking"
                ? "batch-processing-tab-active"
                : "batch-processing-tab"
            }
          >
            Track Progress
          </button>
        )}
      </div>

      {/* Content */}
      <div className="batch-processing-content">
        {view === "create" && renderCreateView()}
        {view === "tracking" && renderTrackingView()}
        {view === "history" && renderHistoryView()}
      </div>
    </div>
  );
};

export default BatchProcessingPage;
