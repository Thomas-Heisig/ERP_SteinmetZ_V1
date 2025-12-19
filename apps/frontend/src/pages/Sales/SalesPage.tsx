// SPDX-License-Identifier: MIT

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../styles/pages.css";

interface SalesStats {
  totalRevenue: number;
  openQuotes: number;
  activeOrders: number;
  leads: number;
}

/**
 * SalesPage Component
 *
 * Main page for Sales & CRM module displaying:
 * - Sales pipeline overview
 * - Quotes and orders management
 * - Lead management
 * - Campaign statistics
 */
export default function SalesPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch sales statistics from API
        const response = await fetch("/api/sales/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch sales statistics");
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h3>{t("common.error")}</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{t("sales.title", "Sales & CRM")}</h1>
        <p className="page-description">
          {t(
            "sales.description",
            "Manage sales pipeline, quotes, orders, and customer relationships",
          )}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">
              {stats?.totalRevenue.toLocaleString() || 0} €
            </div>
            <div className="stat-label">
              {t("sales.totalRevenue", "Total Revenue")}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.openQuotes || 0}</div>
            <div className="stat-label">
              {t("sales.openQuotes", "Open Quotes")}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.activeOrders || 0}</div>
            <div className="stat-label">
              {t("sales.activeOrders", "Active Orders")}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.leads || 0}</div>
            <div className="stat-label">{t("sales.leads", "Leads")}</div>
          </div>
        </div>
      </div>

      <div className="modules-grid">
        <div className="module-card">
          <h3>📊 {t("sales.pipeline", "Sales Pipeline")}</h3>
          <p>
            {t(
              "sales.pipelineDesc",
              "Track opportunities through sales stages",
            )}
          </p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>📝 {t("sales.quotes", "Quotes")}</h3>
          <p>{t("sales.quotesDesc", "Create and manage customer quotes")}</p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>📦 {t("sales.orders", "Orders")}</h3>
          <p>
            {t("sales.ordersDesc", "Manage customer orders and fulfillment")}
          </p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>👥 {t("sales.leads", "Leads")}</h3>
          <p>{t("sales.leadsDesc", "Track and convert potential customers")}</p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>📧 {t("sales.campaigns", "Campaigns")}</h3>
          <p>{t("sales.campaignsDesc", "Manage marketing campaigns")}</p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>📈 {t("sales.analytics", "Analytics")}</h3>
          <p>{t("sales.analyticsDesc", "View sales performance metrics")}</p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>
      </div>
    </div>
  );
}
