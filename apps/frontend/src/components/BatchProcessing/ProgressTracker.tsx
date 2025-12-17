// SPDX-License-Identifier: MIT
// apps/frontend/src/components/BatchProcessing/ProgressTracker.tsx

import React from "react";
import "./ProgressTracker.css";

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

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  batch,
  onCancel,
}) => {
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
    <div className="progress-tracker-container">
      <div className="progress-tracker-header">
        <div className="progress-tracker-status-badge">
          <span
            className={`progress-tracker-status-icon progress-tracker-status-${batch.status}`}
          >
            {getStatusIcon()}
          </span>
          <span className="progress-tracker-status-text">
            {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
          </span>
        </div>
        {batch.status === "running" && onCancel && (
          <button
            onClick={() => onCancel(batch.batchId)}
            className="progress-tracker-button progress-tracker-danger-button"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-tracker-progress-container">
        <div
          {...((): React.HTMLAttributes<HTMLDivElement> & {
            style?: React.CSSProperties;
          } => {
            const props: React.HTMLAttributes<HTMLDivElement> & {
              "aria-valuenow"?: number;
              "aria-valuemin"?: number;
              "aria-valuemax"?: number;
              "aria-label"?: string;
              style?: React.CSSProperties;
            } = {
              className: "progress-tracker-progress-bar",
              role: "progressbar",
              "aria-valuenow": Math.round(batch.progress),
              "aria-valuemin": 0,
              "aria-valuemax": 100,
              "aria-label": `Batch progress: ${Math.round(batch.progress)}%`,
              style: {
                // Using CSS custom property for dynamic progress value
                "--progress-width": `${batch.progress}%`,
              } as React.CSSProperties,
            };
            return props;
          })()}
        >
          <div
            className={`progress-tracker-progress-fill progress-tracker-status-${batch.status}`}
          />
        </div>
        <span className="progress-tracker-progress-text">
          {Math.round(batch.progress)}%
        </span>
      </div>

      {/* Statistics */}
      {(batch.total !== undefined || batch.processed !== undefined) && (
        <div className="progress-tracker-stats">
          {batch.total !== undefined && (
            <div className="progress-tracker-stat-item">
              <span className="progress-tracker-stat-label">Total:</span>
              <span className="progress-tracker-stat-value">{batch.total}</span>
            </div>
          )}
          {batch.processed !== undefined && (
            <div className="progress-tracker-stat-item">
              <span className="progress-tracker-stat-label">Processed:</span>
              <span className="progress-tracker-stat-value">
                {batch.processed}
              </span>
            </div>
          )}
          {batch.successful !== undefined && (
            <div className="progress-tracker-stat-item">
              <span className="progress-tracker-stat-label">Successful:</span>
              <span className="progress-tracker-stat-value progress-tracker-stat-success">
                {batch.successful}
              </span>
            </div>
          )}
          {batch.failed !== undefined && batch.failed > 0 && (
            <div className="progress-tracker-stat-item">
              <span className="progress-tracker-stat-label">Failed:</span>
              <span className="progress-tracker-stat-value progress-tracker-stat-error">
                {batch.failed}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
