// SPDX-License-Identifier: MIT

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../styles/pages.css";

interface WarehouseStats {
  totalStock: number;
  lowStockItems: number;
  pendingShipments: number;
  todaysPicks: number;
}

/**
 * WarehousePage Component
 *
 * Main page for Warehouse module displaying:
 * - Stock management and inventory
 * - Warehouse locations
 * - Picking and shipping
 * - Inventory tracking
 */
export default function WarehousePage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/warehouse/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch warehouse statistics");
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
        <h1>{t("warehouse.title", "Warehouse")}</h1>
        <p className="page-description">
          {t(
            "warehouse.description",
            "Manage inventory, picking, shipping, and warehouse operations",
          )}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalStock || 0}</div>
            <div className="stat-label">
              {t("warehouse.totalStock", "Total Stock Items")}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.lowStockItems || 0}</div>
            <div className="stat-label">
              {t("warehouse.lowStockItems", "Low Stock Items")}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.pendingShipments || 0}</div>
            <div className="stat-label">
              {t("warehouse.pendingShipments", "Pending Shipments")}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.todaysPicks || 0}</div>
            <div className="stat-label">
              {t("warehouse.todaysPicks", "Today's Picks")}
            </div>
          </div>
        </div>
      </div>

      <div className="modules-grid">
        <div className="module-card">
          <h3>📊 {t("warehouse.stock", "Stock Management")}</h3>
          <p>
            {t("warehouse.stockDesc", "Monitor and manage inventory levels")}
          </p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>📍 {t("warehouse.locations", "Warehouse Locations")}</h3>
          <p>
            {t("warehouse.locationsDesc", "Manage storage locations and bins")}
          </p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>📋 {t("warehouse.picking", "Picking")}</h3>
          <p>{t("warehouse.pickingDesc", "Manage order picking operations")}</p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>📦 {t("warehouse.shipping", "Shipping")}</h3>
          <p>{t("warehouse.shippingDesc", "Process outbound shipments")}</p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>🔍 {t("warehouse.inventory", "Inventory")}</h3>
          <p>{t("warehouse.inventoryDesc", "Conduct inventory counts")}</p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>

        <div className="module-card">
          <h3>📈 {t("warehouse.analytics", "Analytics")}</h3>
          <p>{t("warehouse.analyticsDesc", "View warehouse performance")}</p>
          <button className="btn-primary">{t("common.view", "View")}</button>
        </div>
      </div>
    </div>
  );
}
