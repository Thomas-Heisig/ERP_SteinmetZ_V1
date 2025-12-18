// SPDX-License-Identifier: MIT
// apps/frontend/src/hooks/useDashboardData.ts

/**
 * Custom hook for fetching dashboard data from API
 */

import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface KPIData {
  name: string;
  value: string;
  change_percent: number;
  category: string;
}

interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: string;
  due_date: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  created_at: string;
  read: boolean;
}

interface DashboardData {
  kpis: KPIData[];
  tasks: Task[];
  notifications: Notification[];
}

interface UseDashboardDataResult {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch KPIs
      const kpisResponse = await fetch(`${API_BASE}/dashboard/kpis`);
      const kpisData = await kpisResponse.json();

      // Fetch Tasks
      const tasksResponse = await fetch(
        `${API_BASE}/dashboard/tasks?status=pending&status=in_progress`,
      );
      const tasksData = await tasksResponse.json();

      // Fetch Notifications
      const notificationsResponse = await fetch(
        `${API_BASE}/dashboard/notifications?read=false&limit=10`,
      );
      const notificationsData = await notificationsResponse.json();

      setData({
        kpis: kpisData.data || [],
        tasks: tasksData.data || [],
        notifications: notificationsData.data || [],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch dashboard data"),
      );
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
