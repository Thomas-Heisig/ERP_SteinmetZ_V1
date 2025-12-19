// SPDX-License-Identifier: MIT

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../styles/pages.css";

interface ReportingStats {
  totalReports: number;
  scheduledReports: number;
  aiInsights: number;
  recentReports: number;
}

/**
 * ReportingPage Component
 *
 * Main page for Reporting & Analytics module displaying:
 * - Standard reports library
 * - Ad-hoc reporting tools
 * - AI-powered analytics
 * - Report scheduling and distribution
 */
export default function ReportingPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ReportingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/reporting/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch reporting statistics");
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
        <h1>{t("reporting.title", "Reporting & Analytics")}</h1>
        <p className="page-description">
          {t(
            "reporting.description",
            "Access reports, analytics, and AI-powered business insights",
          )}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalReports || 0}</div>
            <div className="stat-label">
              {t("reporting.totalReports", "Available Reports")}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.scheduledReports || 0}</div>
            <div className="stat-label">
              {t("reporting.scheduledReports", "Scheduled Reports")}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.aiInsights || 0}</div>
            <div className="stat-label">
              {t("reporting.aiInsights", "AI Insights")}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.recentReports || 0}</div>
            <div className="stat-label">
              {t("reporting.recentReports", "Recent Reports")}
            </div>
          </div>
        </div>
      </div>

      <div className="modules-grid">
        <div className="module-card">
          <h3>📚 {t("reporting.standardReports", "Standard Reports")}</h3>
          <p>
            {t(
              "reporting.standardReportsDesc",
              "Access pre-built financial and operational reports",
            )}
          </p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>🔨 {t("reporting.adHoc", "Ad-hoc Reports")}</h3>
          <p>{t("reporting.adHocDesc", "Create custom reports on demand")}</p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>🤖 {t("reporting.aiAnalytics", "AI Analytics")}</h3>
          <p>
            {t(
              "reporting.aiAnalyticsDesc",
              "Get AI-powered insights and predictions",
            )}
          </p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>⏰ {t("reporting.scheduling", "Report Scheduling")}</h3>
          <p>
            {t(
              "reporting.schedulingDesc",
              "Schedule automatic report generation",
            )}
          </p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>📊 {t("reporting.dashboards", "Dashboards")}</h3>
          <p>
            {t(
              "reporting.dashboardsDesc",
              "View real-time business dashboards",
            )}
          </p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>📤 {t("reporting.export", "Export & Share")}</h3>
          <p>{t("reporting.exportDesc", "Export and distribute reports")}</p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>
      </div>
    </div>
  );
}
