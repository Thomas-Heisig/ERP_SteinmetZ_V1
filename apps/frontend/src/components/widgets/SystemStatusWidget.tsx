// SPDX-License-Identifier: MIT
// apps/frontend/src/components/widgets/SystemStatusWidget.tsx

import React, { useEffect, useState } from "react";
import "./widgets.css";

interface SystemHealth {
  status: "healthy" | "warning" | "error";
  uptime: number;
  memory: {
    free: string;
    total: string;
  };
  loadavg: number[];
  timestamp: string;
}

export const SystemStatusWidget: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/dashboard/health`,
        );
        const data = await response.json();
        setHealth(data);
      } catch (error) {
        console.error("Failed to fetch system health:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

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
    <div className={`system-status-widget status-${getStatusColor(health.status)}`}>
      <div className="widget-header">
        <h3>🖥️ System Status</h3>
        <span className={`status-badge status-${getStatusColor(health.status)}`}>
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
