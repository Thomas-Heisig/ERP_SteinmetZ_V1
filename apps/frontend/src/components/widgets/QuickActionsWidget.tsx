// SPDX-License-Identifier: MIT
// apps/frontend/src/components/widgets/QuickActionsWidget.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import "./widgets.css";

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  path?: string;
  onClick?: () => void;
  color?: "primary" | "success" | "warning" | "info";
}

export const QuickActionsWidget: React.FC = () => {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      id: "catalog",
      label: "Functions Catalog",
      icon: "🧭",
      path: "/catalog",
      color: "primary",
    },
    {
      id: "ai",
      label: "AI Annotator",
      icon: "🤖",
      path: "/ai",
      color: "info",
    },
    {
      id: "search",
      label: "Search",
      icon: "🔍",
      onClick: () => {
        // Trigger search overlay
        document.dispatchEvent(new CustomEvent("openSearch"));
      },
      color: "success",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
      path: "/settings",
      color: "warning",
    },
  ];

  const handleAction = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.path) {
      navigate(action.path);
    }
  };

  return (
    <div className="quick-actions-widget">
      <div className="widget-header">
        <h3>⚡ Quick Actions</h3>
      </div>
      <div className="actions-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            className={`action-button action-${action.color || "primary"}`}
            onClick={() => handleAction(action)}
            aria-label={action.label}
          >
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
