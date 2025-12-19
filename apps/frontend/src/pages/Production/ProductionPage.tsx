// SPDX-License-Identifier: MIT

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../styles/pages.css";

interface ProductionStats {
  activeOrders: number;
  machinesRunning: number;
  qualityIssues: number;
  completedToday: number;
}

/**
 * ProductionPage Component
 *
 * Main page for Production module displaying:
 * - Production orders and planning
 * - Machine management and monitoring
 * - Quality management
 * - Production reports
 */
export default function ProductionPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ProductionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/production/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch production statistics");
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
        <h1>{t("production.title", "Production")}</h1>
        <p className="page-description">
          {t(
            "production.description",
            "Manage production orders, machines, and quality control",
          )}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏭</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.activeOrders || 0}</div>
            <div className="stat-label">
              {t("production.activeOrders", "Active Orders")}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚙️</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.machinesRunning || 0}</div>
            <div className="stat-label">
              {t("production.machinesRunning", "Machines Running")}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.qualityIssues || 0}</div>
            <div className="stat-label">
              {t("production.qualityIssues", "Quality Issues")}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.completedToday || 0}</div>
            <div className="stat-label">
              {t("production.completedToday", "Completed Today")}
            </div>
          </div>
        </div>
      </div>

      <div className="modules-grid">
        <div className="module-card">
          <h3>📋 {t("production.orders", "Production Orders")}</h3>
          <p>
            {t("production.ordersDesc", "Create and track production orders")}
          </p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>📅 {t("production.planning", "Production Planning")}</h3>
          <p>{t("production.planningDesc", "Plan and schedule production")}</p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>🔧 {t("production.machines", "Machines")}</h3>
          <p>{t("production.machinesDesc", "Monitor and manage machines")}</p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>✓ {t("production.quality", "Quality Control")}</h3>
          <p>{t("production.qualityDesc", "Manage quality inspections")}</p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>🔨 {t("production.maintenance", "Maintenance")}</h3>
          <p>{t("production.maintenanceDesc", "Track machine maintenance")}</p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>📊 {t("production.reports", "Reports")}</h3>
          <p>{t("production.reportsDesc", "View production performance")}</p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>
      </div>
    </div>
  );
}
