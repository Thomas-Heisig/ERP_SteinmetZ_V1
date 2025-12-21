// SPDX-License-Identifier: MIT
// apps/frontend/src/components/DashboardWidgets/DashboardWidgets.tsx

import React from "react";
import {
  KPIWidget,
  SystemStatusWidget,
  QuickActionsWidget,
  ActivityFeedWidget,
} from "../widgets";
import { useDashboardData } from "../Dashboard/hooks/useDashboardData";
import "./DashboardWidgets.css";

export const DashboardWidgets: React.FC = () => {
  const { data, loading } = useDashboardData({
    refreshInterval: 60000,
    autoRefresh: true,
  });

  return (
    <div className="dashboard-widgets-container">
      <div className="widgets-grid">
        {/* KPI Widgets Row */}
        <KPIWidget
          title="Open Orders"
          value={loading ? "..." : data.overview?.erp.openOrders || 0}
          subtitle="Active orders in system"
          icon="📦"
          color="primary"
          loading={loading}
          trend={{ value: 12, direction: "up" }}
        />

        <KPIWidget
          title="Pending Invoices"
          value={loading ? "..." : data.overview?.erp.pendingInvoices || 0}
          subtitle="Awaiting payment"
          icon="💰"
          color="warning"
          loading={loading}
          trend={{ value: -5, direction: "down" }}
        />

        <KPIWidget
          title="Stock Items"
          value={loading ? "..." : (data.overview?.erp.stockItems || 0).toLocaleString()}
          subtitle="Total inventory"
          icon="📊"
          color="success"
          loading={loading}
          trend={{ value: 8, direction: "up" }}
        />

        <KPIWidget
          title="Customers"
          value={loading ? "..." : data.overview?.erp.customers || 0}
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
