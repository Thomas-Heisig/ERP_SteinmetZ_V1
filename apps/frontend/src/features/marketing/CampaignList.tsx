// SPDX-License-Identifier: MIT
// apps/frontend/src/features/marketing/CampaignList.tsx

/**
 * Campaign List Component
 * 
 * Displays and manages marketing campaigns with filtering, 
 * status badges, and CRUD operations.
 */

import React, { useState, useEffect } from "react";
import styles from "./CampaignList.module.css";

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget: number;
  spent: number;
  target_audience?: string;
  created_at: string;
  updated_at: string;
}

export const CampaignList: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter, typeFilter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("type", typeFilter);

      const response = await fetch(
        `http://localhost:3000/api/marketing/campaigns?${params}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }

      const data = await response.json();
      setCampaigns(data.data || []);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      campaign.name.toLowerCase().includes(searchLower) ||
      campaign.type.toLowerCase().includes(searchLower) ||
      (campaign.description &&
        campaign.description.toLowerCase().includes(searchLower))
    );
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; className: string }
    > = {
      draft: { label: "Entwurf", className: styles.statusDraft },
      planned: { label: "Geplant", className: styles.statusPlanned },
      active: { label: "Aktiv", className: styles.statusActive },
      paused: { label: "Pausiert", className: styles.statusPaused },
      completed: { label: "Abgeschlossen", className: styles.statusCompleted },
      cancelled: { label: "Abgebrochen", className: styles.statusCancelled },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return <span className={`${styles.statusBadge} ${config.className}`}>{config.label}</span>;
  };

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      email: "E-Mail",
      social: "Social Media",
      sem: "SEM",
      seo: "SEO",
      offline: "Offline",
      event: "Event",
      telephone: "Telefon",
    };

    return (
      <span className={styles.typeBadge}>
        {typeLabels[type] || type}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("de-DE");
  };

  const calculateROI = (spent: number, revenue: number = 0) => {
    if (spent === 0) return "-";
    const roi = ((revenue - spent) / spent) * 100;
    return `${roi.toFixed(1)}%`;
  };

  if (loading) {
    return <div className={styles.loading}>Lade Kampagnen...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Fehler beim Laden der Kampagnen: {error}</p>
        <button onClick={fetchCampaigns} className={styles.retryButton}>
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Marketing-Kampagnen</h1>
        <button className={styles.createButton}>
          + Neue Kampagne
        </button>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Kampagnen durchsuchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Alle Status</option>
          <option value="draft">Entwurf</option>
          <option value="planned">Geplant</option>
          <option value="active">Aktiv</option>
          <option value="paused">Pausiert</option>
          <option value="completed">Abgeschlossen</option>
          <option value="cancelled">Abgebrochen</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Alle Typen</option>
          <option value="email">E-Mail</option>
          <option value="social">Social Media</option>
          <option value="sem">SEM</option>
          <option value="seo">SEO</option>
          <option value="offline">Offline</option>
          <option value="event">Event</option>
          <option value="telephone">Telefon</option>
        </select>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className={styles.empty}>
          <p>Keine Kampagnen gefunden.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Typ</th>
                <th>Status</th>
                <th>Zeitraum</th>
                <th>Budget</th>
                <th>Ausgegeben</th>
                <th>% Ausgegeben</th>
                <th>Zielgruppe</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((campaign) => {
                const spentPercentage = campaign.budget > 0
                  ? (campaign.spent / campaign.budget) * 100
                  : 0;

                return (
                  <tr key={campaign.id}>
                    <td>
                      <div className={styles.campaignName}>
                        {campaign.name}
                        {campaign.description && (
                          <div className={styles.campaignDescription}>
                            {campaign.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{getTypeBadge(campaign.type)}</td>
                    <td>{getStatusBadge(campaign.status)}</td>
                    <td>
                      <div className={styles.dateRange}>
                        {formatDate(campaign.start_date)} -{" "}
                        {formatDate(campaign.end_date)}
                      </div>
                    </td>
                    <td>{formatCurrency(campaign.budget)}</td>
                    <td>{formatCurrency(campaign.spent)}</td>
                    <td>
                      <div className={styles.progressContainer}>
                        <div
                          className={styles.progressBar}
                          style={{
                            width: `${Math.min(spentPercentage, 100)}%`,
                            backgroundColor:
                              spentPercentage > 100
                                ? "var(--danger-500)"
                                : spentPercentage > 80
                                  ? "var(--warning-500)"
                                  : "var(--success-500)",
                          }}
                        />
                        <span className={styles.progressText}>
                          {spentPercentage.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.audience}>
                        {campaign.target_audience || "-"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionButton}
                          title="Bearbeiten"
                        >
                          ✏️
                        </button>
                        <button
                          className={styles.actionButton}
                          title="Statistiken"
                        >
                          📊
                        </button>
                        <button
                          className={styles.actionButton}
                          title="Löschen"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.footer}>
        <p>
          {filteredCampaigns.length} Kampagne(n) angezeigt von{" "}
          {campaigns.length} gesamt
        </p>
      </div>
    </div>
  );
};

export default CampaignList;
