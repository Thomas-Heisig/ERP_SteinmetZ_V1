// SPDX-License-Identifier: MIT
// apps/frontend/src/components/widgets/SystemStatusWidget.tsx

import React from "react";
import { useSystemHealth } from "../Dashboard/hooks/useDashboardData";
import "./widgets.css";

export const SystemStatusWidget: React.FC = () => {
  const { health, loading } = useSystemHealth(30000);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "error";
      default:
        return "info";
    }
  };

  if (loading) {
    return (
      <div className="system-status-widget loading">
        <div className="widget-header">
          <h3>System Status</h3>
        </div>
        <div className="skeleton-container">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="system-status-widget error">
        <div className="widget-header">
          <h3>System Status</h3>
        </div>
        <p className="error-message">Failed to load system status</p>
      </div>
    );
  }

  return (
    <div
      className={`system-status-widget status-${getStatusColor(health.status)}`}
    >
      <div className="widget-header">
        <h3>🖥️ System Status</h3>
        <span
          className={`status-badge status-${getStatusColor(health.status)}`}
        >
          {health.status}
        </span>
      </div>
      <div className="status-metrics">
        <div className="metric-item">
          <span className="metric-label">Uptime</span>
          <span className="metric-value">{formatUptime(health.uptime)}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Memory</span>
          <span className="metric-value">
            {health.memory.free} / {health.memory.total}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Load Avg</span>
          <span className="metric-value">
            {health.loadavg.map((l) => l.toFixed(2)).join(" / ")}
          </span>
        </div>
      </div>
    </div>
  );
};
