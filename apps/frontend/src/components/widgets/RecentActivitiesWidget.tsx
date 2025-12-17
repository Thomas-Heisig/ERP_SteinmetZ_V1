// SPDX-License-Identifier: MIT
// apps/frontend/src/components/widgets/RecentActivitiesWidget.tsx

import React, { useEffect, useState } from "react";
import "./widgets.css";

interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  status: "success" | "info" | "warning" | "error";
}

export const RecentActivitiesWidget: React.FC = () => {
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
          setActivities(result.data);
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

    if (diffMinutes < 1) return "gerade eben";
    if (diffMinutes < 60) return `vor ${diffMinutes} Min.`;
    if (diffMinutes < 1440)
      return `vor ${Math.floor(diffMinutes / 60)} Std.`;
    return date.toLocaleDateString("de-DE");
  };

  if (loading) {
    return (
      <div className="widget recent-activities-widget">
        <div className="widget-header">
          <h3 className="widget-title">Letzte Aktivitäten</h3>
        </div>
        <div className="widget-body">
          <div className="loading-spinner">Lädt...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="widget recent-activities-widget">
      <div className="widget-header">
        <h3 className="widget-title">Letzte Aktivitäten</h3>
        <span className="widget-badge">{activities.length}</span>
      </div>
      <div className="widget-body">
        <div className="activities-list">
          {activities.length === 0 ? (
            <div className="empty-state">
              <p>Keine Aktivitäten gefunden</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className={`activity-item activity-${activity.status}`}
              >
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-description">
                    {activity.description}
                  </div>
                  <div className="activity-timestamp">
                    {formatTimestamp(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentActivitiesWidget;
