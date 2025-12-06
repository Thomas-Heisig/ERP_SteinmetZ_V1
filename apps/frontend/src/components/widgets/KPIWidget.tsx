// SPDX-License-Identifier: MIT
// apps/frontend/src/components/widgets/KPIWidget.tsx

import React from "react";
import "./widgets.css";

export interface KPIWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  icon?: string;
  color?: "primary" | "success" | "warning" | "error" | "info";
  loading?: boolean;
}

export const KPIWidget: React.FC<KPIWidgetProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = "primary",
  loading = false,
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === "up") return "📈";
    if (trend.direction === "down") return "📉";
    return "➡️";
  };

  const getTrendClass = () => {
    if (!trend) return "";
    if (trend.direction === "up") return "trend-up";
    if (trend.direction === "down") return "trend-down";
    return "trend-neutral";
  };

  if (loading) {
    return (
      <div className={`kpi-widget kpi-widget-${color} loading`}>
        <div className="kpi-skeleton">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-value"></div>
          <div className="skeleton-line skeleton-subtitle"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`kpi-widget kpi-widget-${color}`}>
      <div className="kpi-header">
        {icon && <span className="kpi-icon">{icon}</span>}
        <h3 className="kpi-title">{title}</h3>
      </div>
      <div className="kpi-value">{value}</div>
      {subtitle && <p className="kpi-subtitle">{subtitle}</p>}
      {trend && (
        <div className={`kpi-trend ${getTrendClass()}`}>
          <span className="trend-icon">{getTrendIcon()}</span>
          <span className="trend-value">
            {trend.value > 0 ? "+" : ""}
            {trend.value}%
          </span>
        </div>
      )}
    </div>
  );
};
