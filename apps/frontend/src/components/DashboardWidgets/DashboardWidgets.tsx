// SPDX-License-Identifier: MIT
// apps/frontend/src/components/DashboardWidgets/DashboardWidgets.tsx

import React, { useEffect, useState } from "react";
import {
  KPIWidget,
  SystemStatusWidget,
  QuickActionsWidget,
  ActivityFeedWidget,
} from "../widgets";
import "./DashboardWidgets.css";

interface DashboardData {
  system: {
    uptime: number;
    cpu: number;
    memory: {
      free: string;
      total: string;
    };
  };
  erp: {
    openOrders: number;
    pendingInvoices: number;
    stockItems: number;
    customers: number;
  };
}

export const DashboardWidgets: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/dashboard/overview`,
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-widgets-container">
      <div className="widgets-grid">
        {/* KPI Widgets Row */}
        <KPIWidget
          title="Open Orders"
          value={loading ? "..." : data?.erp.openOrders || 0}
          subtitle="Active orders in system"
          icon="📦"
          color="primary"
          loading={loading}
          trend={{ value: 12, direction: "up" }}
        />

        <KPIWidget
          title="Pending Invoices"
          value={loading ? "..." : data?.erp.pendingInvoices || 0}
          subtitle="Awaiting payment"
          icon="💰"
          color="warning"
          loading={loading}
          trend={{ value: -5, direction: "down" }}
        />

        <KPIWidget
          title="Stock Items"
          value={loading ? "..." : data?.erp.stockItems.toLocaleString() || 0}
          subtitle="Total inventory"
          icon="📊"
          color="success"
          loading={loading}
          trend={{ value: 8, direction: "up" }}
        />

        <KPIWidget
          title="Customers"
          value={loading ? "..." : data?.erp.customers || 0}
          subtitle="Active customers"
          icon="👥"
          color="info"
          loading={loading}
          trend={{ value: 3, direction: "up" }}
        />

        {/* System Status Widget - Spans 2 columns */}
        <div className="widget-span-2">
          <SystemStatusWidget />
        </div>

        {/* Quick Actions Widget */}
        <QuickActionsWidget />

        {/* Activity Feed Widget */}
        <ActivityFeedWidget />
      </div>
    </div>
  );
};
