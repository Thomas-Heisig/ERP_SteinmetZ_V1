// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/health/HealthStatusBadge.tsx

import React from "react";
import type { HealthLevel } from "../../types";
import "./HealthStatusBadge.css";

export interface HealthStatusBadgeProps {
  status: HealthLevel;
  size?: "SMALL" | "MEDIUM" | "LARGE";
  showText?: boolean;
  onClick?: () => void;
}

/**
 * HealthStatusBadge – zeigt einen kompakten Statusindikator an.
 */
const HealthStatusBadge: React.FC<HealthStatusBadgeProps> = ({
  status,
  size = "MEDIUM",
  showText = true,
  onClick,
}) => {
  const text = mapLabel(status);
  const sizeClass = `health-status-badge__indicator--${size.toLowerCase()}`;
  const statusClass = `health-status-badge__indicator--${status.toLowerCase()}`;
  const clickableClass = onClick ? "health-status-badge--clickable" : "";

  return (
    <div onClick={onClick} className={`health-status-badge ${clickableClass}`}>
      <span
        className={`health-status-badge__indicator ${sizeClass} ${statusClass}`}
      />

      {showText && <span>{text}</span>}
    </div>
  );
};

/* ------------------------------------------------------------
   Hilfsfunktionen
------------------------------------------------------------ */
function mapLabel(level: HealthLevel): string {
  switch (level) {
    case "HEALTHY":
      return "OK";
    case "DEGRADED":
      return "Degraded";
    case "UNHEALTHY":
      return "Error";
    case "UNKNOWN":
    default:
      return "Unknown";
  }
}

export default HealthStatusBadge;
