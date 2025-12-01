// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/health/HealthStatusBadge.tsx

import React from "react";
import type { HealthLevel } from "../../types";

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
  const color = mapColor(status);
  const text = mapLabel(status);

  const dimension = sizeToPx(size);

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: dimension,
          height: dimension,
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />

      {showText && <span>{text}</span>}
    </div>
  );
};

/* ------------------------------------------------------------
   Hilfsfunktionen
------------------------------------------------------------ */
function mapColor(level: HealthLevel): string {
  switch (level) {
    case "HEALTHY":
      return "#4caf50";
    case "DEGRADED":
      return "#ff9800";
    case "UNHEALTHY":
      return "#f44336";
    case "UNKNOWN":
    default:
      return "#9e9e9e";
  }
}

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

function sizeToPx(size: "SMALL" | "MEDIUM" | "LARGE"): number {
  switch (size) {
    case "SMALL":
      return 10;
    case "MEDIUM":
      return 14;
    case "LARGE":
      return 18;
    default:
      return 14;
  }
}

export default HealthStatusBadge;
