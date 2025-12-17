// SPDX-License-Identifier: MIT
// apps/frontend/src/components/widgets/StatsOverviewWidget.tsx

import React, { useEffect, useState } from "react";
import "./widgets.css";

interface StatsData {
  sales: {
    today: number;
    trend: string;
  };
  orders: {
    total: number;
    pending: number;
    trend: string;
  };
  customers: {
    total: number;
    new: number;
    trend: string;
  };
  inventory: {
    totalItems: number;
    lowStock: number;
    trend: string;
  };
  finance: {
    revenue: number;
    profit: number;
    margin: string;
    trend: string;
  };
}

export const StatsOverviewWidget: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/dashboard/widgets/stats`,
        );
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat("de-DE").format(value);
  };

  if (loading || !stats) {
    return (
      <div className="widget stats-overview-widget">
        <div className="widget-header">
          <h3 className="widget-title">Statistiken</h3>
        </div>
        <div className="widget-body">
          <div className="loading-spinner">Lädt...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="widget stats-overview-widget">
      <div className="widget-header">
        <h3 className="widget-title">Unternehmensübersicht</h3>
      </div>
      <div className="widget-body">
        <div className="stats-grid">
          {/* Sales */}
          <div className="stat-card stat-primary">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">Umsatz heute</div>
              <div className="stat-value">
                {formatCurrency(stats.sales.today)}
              </div>
              <div className="stat-trend positive">{stats.sales.trend}</div>
            </div>
          </div>

          {/* Orders */}
          <div className="stat-card stat-info">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <div className="stat-label">Bestellungen</div>
              <div className="stat-value">{formatNumber(stats.orders.total)}</div>
              <div className="stat-detail">
                {stats.orders.pending} ausstehend
              </div>
            </div>
          </div>

          {/* Customers */}
          <div className="stat-card stat-success">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-label">Kunden</div>
              <div className="stat-value">
                {formatNumber(stats.customers.total)}
              </div>
              <div className="stat-detail">{stats.customers.new} neue</div>
            </div>
          </div>

          {/* Inventory */}
          <div className="stat-card stat-warning">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">Lagerbestand</div>
              <div className="stat-value">
                {formatNumber(stats.inventory.totalItems)}
              </div>
              <div className="stat-detail stat-warning-text">
                {stats.inventory.lowStock} niedrig
              </div>
            </div>
          </div>

          {/* Finance */}
          <div className="stat-card stat-primary">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-label">Gewinn</div>
              <div className="stat-value">
                {formatCurrency(stats.finance.profit)}
              </div>
              <div className="stat-detail">Marge: {stats.finance.margin}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverviewWidget;
