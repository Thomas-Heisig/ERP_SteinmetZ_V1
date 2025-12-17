// SPDX-License-Identifier: MIT
// apps/frontend/src/components/Dashboard/SimpleDashboard.tsx
/**
 * @module SimpleDashboard
 * @description Vereinfachtes Dashboard mit 4 Hauptelementen
 */

import React from "react";
import { useTranslation } from "react-i18next";
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
  priority: "high" | "medium" | "low";
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

  // Mock-Daten für Executive Overview
  const kpis = [
    {
      title: t("dashboard.kpis.revenue"),
      value: "€ 1.2M",
      change: 12.5,
      icon: "💰",
      color: "border-blue-500",
    },
    {
      title: t("dashboard.kpis.orders"),
      value: "156",
      change: 8.3,
      icon: "📦",
      color: "border-green-500",
    },
    {
      title: t("dashboard.kpis.production"),
      value: "89%",
      change: -2.1,
      icon: "🏭",
      color: "border-orange-500",
    },
    {
      title: t("dashboard.kpis.liquidity"),
      value: "€ 450K",
      change: 15.7,
      icon: "💵",
      color: "border-purple-500",
    },
  ];

  // Mock-Daten für Benachrichtigungen
  const notifications: NotificationItem[] = [
    {
      id: "1",
      title: "Neue Bestellung",
      message: "Auftrag #1234 wurde erstellt",
      time: "vor 5 Min.",
      type: "success",
    },
    {
      id: "2",
      title: "Lagerbestand niedrig",
      message: "Artikel XYZ unter Mindestbestand",
      time: "vor 15 Min.",
      type: "warning",
    },
    {
      id: "3",
      title: "Zahlung eingegangen",
      message: "Rechnung #5678 wurde bezahlt",
      time: "vor 1 Std.",
      type: "info",
    },
  ];

  // Mock-Daten für Aufgaben
  const tasks: TaskItem[] = [
    {
      id: "1",
      title: "Angebot für Kunde ABC erstellen",
      priority: "high",
      dueDate: "Heute, 14:00",
    },
    {
      id: "2",
      title: "Monatsabschluss vorbereiten",
      priority: "medium",
      dueDate: "Morgen",
    },
    {
      id: "3",
      title: "Lieferantenbewertung durchführen",
      priority: "low",
      dueDate: "Diese Woche",
    },
  ];

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
