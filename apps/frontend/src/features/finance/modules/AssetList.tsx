// SPDX-License-Identifier: MIT
// apps/frontend/src/features/finance/modules/AssetList.tsx

/**
 * Asset Management Component
 *
 * Displays and manages fixed assets (Anlagenvermögen) including:
 * - Asset list with filtering capabilities
 * - Asset details with depreciation history
 * - Add/Edit asset functionality
 * - Depreciation calculation
 */

import React, { useState, useEffect } from "react";
import { Card, Table, Button, Input } from "../../../components/ui";
import { API_ENDPOINTS, buildUrl } from "../../../config/api";
import styles from "./AssetList.module.css";

interface Asset {
  id: string;
  assetNumber: string;
  name: string;
  category: string;
  acquisitionDate: string;
  acquisitionCost: number;
  residualValue: number;
  usefulLife: number;
  depreciationMethod: "linear" | "declining" | "performance-based";
  currentBookValue: number;
  location?: string;
  costCenter?: string;
  serialNumber?: string;
  status: "active" | "disposed" | "sold";
}

interface AssetFormData {
  name: string;
  category: string;
  acquisitionDate: string;
  acquisitionCost: number;
  residualValue: number;
  usefulLife: number;
  depreciationMethod: "linear" | "declining" | "performance-based";
  location: string;
  costCenter: string;
  serialNumber: string;
}

export const AssetList: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AssetFormData>({
    name: "",
    category: "",
    acquisitionDate: new Date().toISOString().split("T")[0],
    acquisitionCost: 0,
    residualValue: 0,
    usefulLife: 60,
    depreciationMethod: "linear",
    location: "",
    costCenter: "",
    serialNumber: "",
  });

  useEffect(() => {
    fetchAssets();
  }, [categoryFilter]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const url = buildUrl(API_ENDPOINTS.finance.assets, {
        category: categoryFilter || undefined,
      });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch assets");
      }

      const result = await response.json();
      setAssets(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error fetching assets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(API_ENDPOINTS.finance.assets, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create asset");
      }

      const result = await response.json();
      setAssets([...assets, result.data]);
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create asset");
      console.error("Error creating asset:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      acquisitionDate: new Date().toISOString().split("T")[0],
      acquisitionCost: 0,
      residualValue: 0,
      usefulLife: 60,
      depreciationMethod: "linear",
      location: "",
      costCenter: "",
      serialNumber: "",
    });
  };

  const filteredAssets = assets.filter((asset) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      asset.name.toLowerCase().includes(searchLower) ||
      asset.assetNumber.toLowerCase().includes(searchLower) ||
      asset.category.toLowerCase().includes(searchLower) ||
      (asset.serialNumber &&
        asset.serialNumber.toLowerCase().includes(searchLower))
    );
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("de-DE");
  };

  const getDepreciationMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
      linear: "Linear",
      declining: "Degressiv",
      "performance-based": "Leistungsabhängig",
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Lade Anlagen...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🏢 Anlagenbuchhaltung</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className={styles.addButton}
        >
          {showForm ? "Abbrechen" : "+ Neue Anlage"}
        </Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {showForm && (
        <Card className={styles.formCard}>
          <h2>Neue Anlage erfassen</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Bezeichnung *</label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>Kategorie *</label>
                <Input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="z.B. Fahrzeuge, IT-Hardware"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Anschaffungsdatum *</label>
                <Input
                  type="date"
                  required
                  value={formData.acquisitionDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      acquisitionDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>Anschaffungskosten (€) *</label>
                <Input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.acquisitionCost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      acquisitionCost: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Restwert (€)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.residualValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      residualValue: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>Nutzungsdauer (Monate) *</label>
                <Input
                  type="number"
                  required
                  min="1"
                  value={formData.usefulLife}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usefulLife: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Abschreibungsmethode *</label>
                <select
                  required
                  value={formData.depreciationMethod}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      depreciationMethod: e.target.value as any,
                    })
                  }
                  className={styles.select}
                >
                  <option value="linear">Linear</option>
                  <option value="declining">Degressiv</option>
                  <option value="performance-based">Leistungsabhängig</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Standort</label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Kostenstelle</label>
                <Input
                  type="text"
                  value={formData.costCenter}
                  onChange={(e) =>
                    setFormData({ ...formData, costCenter: e.target.value })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>Seriennummer</label>
                <Input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, serialNumber: e.target.value })
                  }
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <Button type="submit" className={styles.submitButton}>
                Anlage erfassen
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className={styles.cancelButton}
              >
                Abbrechen
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className={styles.filterCard}>
        <div className={styles.filters}>
          <Input
            type="text"
            placeholder="Suche nach Name, Nummer, Kategorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <Input
            type="text"
            placeholder="Kategorie-Filter..."
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.categoryInput}
          />
        </div>
      </Card>

      <Card>
        <Table>
          <thead>
            <tr>
              <th>Anlagennummer</th>
              <th>Bezeichnung</th>
              <th>Kategorie</th>
              <th>Anschaffungsdatum</th>
              <th>Anschaffungskosten</th>
              <th>Buchwert</th>
              <th>Abschreibung</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.noData}>
                  {search || categoryFilter
                    ? "Keine Anlagen gefunden"
                    : "Noch keine Anlagen erfasst"}
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <strong>{asset.assetNumber}</strong>
                  </td>
                  <td>{asset.name}</td>
                  <td>
                    <span className={styles.badge}>{asset.category}</span>
                  </td>
                  <td>{formatDate(asset.acquisitionDate)}</td>
                  <td>{formatCurrency(asset.acquisitionCost)}</td>
                  <td>
                    <strong>{formatCurrency(asset.currentBookValue)}</strong>
                  </td>
                  <td>
                    {getDepreciationMethodLabel(asset.depreciationMethod)}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${styles[`status-${asset.status}`]}`}
                    >
                      {asset.status === "active" ? "Aktiv" : "Ausgebucht"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      <div className={styles.summary}>
        <p>
          Gesamt: <strong>{filteredAssets.length}</strong> Anlagen
        </p>
        <p>
          Gesamtwert:{" "}
          <strong>
            {formatCurrency(
              filteredAssets.reduce(
                (sum, asset) => sum + asset.currentBookValue,
                0,
              ),
            )}
          </strong>
        </p>
      </div>
    </div>
  );
};

export default AssetList;
