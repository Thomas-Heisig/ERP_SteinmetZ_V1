// SPDX-License-Identifier: MIT
// apps/frontend/src/components/widgets/ActivityFeedWidget.tsx

import React, { useEffect, useState } from "react";
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/dashboard/activities`,
        );
        const result = await response.json();
        if (result.success) {
          // Map API response to component format
          setActivities(
            result.data.map((item: {
              id: string;
              type: string;
              title: string;
              description: string;
              timestamp: string;
              icon: string;
            }) => ({
              id: item.id,
              type: (item.type || "info") as "info" | "success" | "warning" | "error",
              icon: item.icon,
              title: item.title,
              description: item.description,
              timestamp: formatTimestamp(item.timestamp),
            })),
          );
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const getActivityTypeClass = (type: string) => {
    return `activity-${type}`;
  };

  if (loading) {
    return (
      <div className="activity-feed-widget">
        <div className="widget-header">
          <h3>📋 Recent Activity</h3>
        </div>
        <div className="activity-list">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-feed-widget">
      <div className="widget-header">
        <h3>📋 Recent Activity</h3>
        <span className="widget-badge">{activities.length}</span>
      </div>
      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="empty-state">
            <p>No recent activities</p>
          </div>
        ) : (
          activities.map((activity) => (
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
          ))
        )}
      </div>
    </div>
  );
};
