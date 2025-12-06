// SPDX-License-Identifier: MIT
// apps/frontend/src/components/widgets/ActivityFeedWidget.tsx

import React from "react";
import "./widgets.css";

interface Activity {
  id: string;
  type: "info" | "success" | "warning" | "error";
  icon: string;
  title: string;
  description: string;
  timestamp: string;
}

export const ActivityFeedWidget: React.FC = () => {
  // Mock data - in production this would come from an API or WebSocket
  const activities: Activity[] = [
    {
      id: "1",
      type: "success",
      icon: "✅",
      title: "System Started",
      description: "Backend server is running",
      timestamp: "2 minutes ago",
    },
    {
      id: "2",
      type: "info",
      icon: "📊",
      title: "Functions Loaded",
      description: "15,472 nodes loaded successfully",
      timestamp: "2 minutes ago",
    },
    {
      id: "3",
      type: "success",
      icon: "🔌",
      title: "WebSocket Connected",
      description: "Real-time updates enabled",
      timestamp: "2 minutes ago",
    },
    {
      id: "4",
      type: "info",
      icon: "🗄️",
      title: "Database Ready",
      description: "SQLite initialized",
      timestamp: "2 minutes ago",
    },
  ];

  const getActivityTypeClass = (type: string) => {
    return `activity-${type}`;
  };

  return (
    <div className="activity-feed-widget">
      <div className="widget-header">
        <h3>📋 Recent Activity</h3>
      </div>
      <div className="activity-list">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`activity-item ${getActivityTypeClass(activity.type)}`}
          >
            <div className="activity-icon">{activity.icon}</div>
            <div className="activity-content">
              <h4 className="activity-title">{activity.title}</h4>
              <p className="activity-description">{activity.description}</p>
              <span className="activity-timestamp">{activity.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
