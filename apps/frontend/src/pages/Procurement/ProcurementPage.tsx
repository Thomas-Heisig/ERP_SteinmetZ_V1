// SPDX-License-Identifier: MIT

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../styles/pages.css";

interface ProcurementStats {
  pendingOrders: number;
  activeSuppliers: number;
  totalSpend: number;
  awaitingReceipt: number;
}

/**
 * ProcurementPage Component
 *
 * Main page for Procurement module displaying:
 * - Purchase orders management
 * - Supplier management
 * - Goods receipt tracking
 * - Demand planning
 */
export default function ProcurementPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ProcurementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/procurement/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch procurement statistics");
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
        <h1>{t("procurement.title", "Procurement")}</h1>
        <p className="page-description">
          {t(
            "procurement.description",
            "Manage purchase orders, suppliers, and goods receipt",
          )}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.pendingOrders || 0}</div>
            <div className="stat-label">
              {t("procurement.pendingOrders", "Pending Orders")}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.activeSuppliers || 0}</div>
            <div className="stat-label">
              {t("procurement.activeSuppliers", "Active Suppliers")}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💶</div>
          <div className="stat-content">
            <div className="stat-value">
              {stats?.totalSpend.toLocaleString() || 0} €
            </div>
            <div className="stat-label">
              {t("procurement.totalSpend", "Total Spend")}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.awaitingReceipt || 0}</div>
            <div className="stat-label">
              {t("procurement.awaitingReceipt", "Awaiting Receipt")}
            </div>
          </div>
        </div>
      </div>

      <div className="modules-grid">
        <div className="module-card">
          <h3>🛒 {t("procurement.purchaseOrders", "Purchase Orders")}</h3>
          <p>
            {t(
              "procurement.purchaseOrdersDesc",
              "Create and track purchase orders",
            )}
          </p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>🏭 {t("procurement.suppliers", "Suppliers")}</h3>
          <p>
            {t("procurement.suppliersDesc", "Manage supplier relationships")}
          </p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>📥 {t("procurement.goodsReceipt", "Goods Receipt")}</h3>
          <p>
            {t("procurement.goodsReceiptDesc", "Process incoming deliveries")}
          </p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>📊 {t("procurement.demandPlanning", "Demand Planning")}</h3>
          <p>
            {t("procurement.demandPlanningDesc", "Plan material requirements")}
          </p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>⭐ {t("procurement.supplierEval", "Supplier Evaluation")}</h3>
          <p>
            {t("procurement.supplierEvalDesc", "Rate and compare suppliers")}
          </p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>📈 {t("procurement.analytics", "Analytics")}</h3>
          <p>{t("procurement.analyticsDesc", "View procurement insights")}</p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>
      </div>
    </div>
  );
}
