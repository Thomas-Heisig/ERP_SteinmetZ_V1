// SPDX-License-Identifier: MIT
// apps/frontend/src/components/BatchProcessing/ProgressTracker.tsx

import React, { useEffect, useState } from "react";

interface BatchProgress {
  batchId: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress: number;
  total?: number;
  processed?: number;
  successful?: number;
  failed?: number;
}

interface ProgressTrackerProps {
  batch: BatchProgress;
  onCancel?: (batchId: string) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ batch, onCancel }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
  }, [batch.progress]);

  const getStatusColor = () => {
    switch (batch.status) {
      case "completed":
        return "#28a745";
      case "failed":
        return "#dc3545";
      case "cancelled":
        return "#6c757d";
      case "running":
        return "#007bff";
      default:
        return "#ffc107";
    }
  };

  const getStatusIcon = () => {
    switch (batch.status) {
      case "completed":
        return "✓";
      case "failed":
        return "✗";
      case "cancelled":
        return "⊘";
      case "running":
        return "⟳";
      default:
        return "⏸";
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.statusBadge}>
          <span style={{ ...styles.statusIcon, backgroundColor: getStatusColor() }}>
            {getStatusIcon()}
          </span>
          <span style={styles.statusText}>
            {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
          </span>
        </div>
        {batch.status === "running" && onCancel && (
          <button
            onClick={() => onCancel(batch.batchId)}
            style={{ ...styles.button, ...styles.dangerButton }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${batch.progress}%`,
              backgroundColor: getStatusColor(),
              transition: animated ? "width 0.5s ease-in-out" : "none",
            }}
          />
        </div>
        <span style={styles.progressText}>{Math.round(batch.progress)}%</span>
      </div>

      {/* Statistics */}
      {(batch.total !== undefined || batch.processed !== undefined) && (
        <div style={styles.stats}>
          {batch.total !== undefined && (
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total:</span>
              <span style={styles.statValue}>{batch.total}</span>
            </div>
          )}
          {batch.processed !== undefined && (
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Processed:</span>
              <span style={styles.statValue}>{batch.processed}</span>
            </div>
          )}
          {batch.successful !== undefined && (
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Successful:</span>
              <span style={{ ...styles.statValue, color: "#28a745" }}>
                {batch.successful}
              </span>
            </div>
          )}
          {batch.failed !== undefined && batch.failed > 0 && (
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Failed:</span>
              <span style={{ ...styles.statValue, color: "#dc3545" }}>{batch.failed}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  } as React.CSSProperties,
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  } as React.CSSProperties,
  statusIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold" as const,
  } as React.CSSProperties,
  statusText: {
    fontSize: "18px",
    fontWeight: "600" as const,
    color: "#333",
  } as React.CSSProperties,
  progressContainer: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "15px",
  } as React.CSSProperties,
  progressBar: {
    flex: 1,
    height: "20px",
    backgroundColor: "#e9ecef",
    borderRadius: "10px",
    overflow: "hidden",
  } as React.CSSProperties,
  progressFill: {
    height: "100%",
    borderRadius: "10px",
  } as React.CSSProperties,
  progressText: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: "#555",
    minWidth: "50px",
    textAlign: "right" as const,
  } as React.CSSProperties,
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "15px",
    paddingTop: "15px",
    borderTop: "1px solid #e9ecef",
  } as React.CSSProperties,
  statItem: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "5px",
  } as React.CSSProperties,
  statLabel: {
    fontSize: "12px",
    color: "#888",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,
  statValue: {
    fontSize: "18px",
    fontWeight: "600" as const,
    color: "#333",
  } as React.CSSProperties,
  button: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500" as const,
    cursor: "pointer",
    transition: "all 0.2s",
  } as React.CSSProperties,
  dangerButton: {
    backgroundColor: "#dc3545",
    color: "white",
  } as React.CSSProperties,
};
