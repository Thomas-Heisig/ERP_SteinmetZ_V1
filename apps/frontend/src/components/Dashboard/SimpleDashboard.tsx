// SPDX-License-Identifier: MIT
// apps/frontend/src/components/Dashboard/SimpleDashboard.tsx
/**
 * @module SimpleDashboard
 * @description Vereinfachtes Dashboard mit 4 Hauptelementen
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { useDashboardData } from "../../hooks/useDashboardData";
import "./SimpleDashboard.css";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  icon,
  color,
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          {change !== undefined && (
            <p
              className={`text-sm mt-2 ${change >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className="text-5xl opacity-20">{icon}</div>
      </div>
    </div>
  );
};

interface TaskItem {
  id: string;
  title: string;
  priority: "high" | "medium" | "low" | "urgent";
  dueDate: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "warning" | "error" | "success";
}

export const SimpleDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useDashboardData();

  // Default KPIs mapping with icons and colors
  const kpiConfig: Record<string, { icon: string; color: string }> = {
    revenue: { icon: "💰", color: "border-blue-500" },
    orders: { icon: "📦", color: "border-green-500" },
    production: { icon: "🏭", color: "border-orange-500" },
    liquidity: { icon: "💵", color: "border-purple-500" },
  };

  // Map API data to KPI cards
  const kpis =
    data?.kpis?.slice(0, 4).map((kpi) => {
      const config = kpiConfig[kpi.category] || {
        icon: "📊",
        color: "border-gray-500",
      };
      return {
        title: kpi.name,
        value: kpi.value,
        change: kpi.change_percent,
        icon: config.icon,
        color: config.color,
      };
    }) || [];

  // Format notifications from API
  const notifications: NotificationItem[] =
    data?.notifications?.map((notif) => ({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      time: formatTimeAgo(notif.created_at),
      type: notif.type,
    })) || [];

  // Format tasks from API
  const tasks: TaskItem[] =
    data?.tasks?.map((task) => ({
      id: task.id,
      title: task.title,
      priority: task.priority,
      dueDate: formatDueDate(task.due_date),
    })) || [];

  // Helper function to format time ago
  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "gerade eben";
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    const diffDays = Math.floor(diffHours / 24);
    return `vor ${diffDays} Tag${diffDays > 1 ? "en" : ""}`;
  }

  // Helper function to format due date
  function formatDueDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate.getTime() === today.getTime()) {
      return `Heute, ${date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return "Morgen";
    } else {
      return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }

  const getNotificationColor = (type: NotificationItem["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-100 border-green-500 text-green-800";
      case "warning":
        return "bg-yellow-100 border-yellow-500 text-yellow-800";
      case "error":
        return "bg-red-100 border-red-500 text-red-800";
      default:
        return "bg-blue-100 border-blue-500 text-blue-800";
    }
  };

  const getPriorityColor = (priority: TaskItem["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Fehler beim Laden
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error.message || "Dashboard-Daten konnten nicht geladen werden."}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Verwende Mock-Daten zur Entwicklung oder prüfe die
            Backend-Verbindung.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("dashboard.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Willkommen zurück! Hier ist Ihre heutige Übersicht.
        </p>
      </div>

      {/* Executive Overview - KPIs */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>📊</span>
          {t("dashboard.executiveOverview")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Benachrichtigungen */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🔔</span>
              {t("dashboard.notifications")}
            </h2>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border-l-4 ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-sm">
                      {notification.title}
                    </h3>
                    <span className="text-xs opacity-75">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-sm opacity-90">{notification.message}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Alle anzeigen
            </button>
          </div>
        </div>

        {/* Echtzeit-KPIs */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>📈</span>
              {t("dashboard.realtimeKpis")}
            </h2>
            <div className="space-y-4">
              {/* Umsatz heute */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Umsatz heute
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    € 12,450
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                </div>
              </div>

              {/* Offene Aufträge */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Offene Aufträge
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    23
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-3/5"></div>
                </div>
              </div>

              {/* Produktionsauslastung */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Produktion
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    89%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full progress-width-89"></div>
                </div>
              </div>

              {/* Lagerbestand */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Lagerbestand
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    94%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full progress-width-94"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Aufgaben & Prioritäten */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🎯</span>
              {t("dashboard.tasksAndPriorities")}
            </h2>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm text-gray-900 dark:text-white flex-1">
                      {task.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    <span>📅</span>
                    <span className="ml-1">{task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Neue Aufgabe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
