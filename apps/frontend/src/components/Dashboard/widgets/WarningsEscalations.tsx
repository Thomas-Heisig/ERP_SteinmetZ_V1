// SPDX-License-Identifier: MIT
// apps/frontend/src/components/Dashboard/widgets/WarningsEscalations.tsx

import React, { useEffect, useState } from "react";
import "./WarningsEscalations.css";

interface DeliveryDelay {
  id: string;
  order_id: string;
  customer_name: string;
  priority: "low" | "medium" | "high" | "critical";
  delay_days: number;
  estimated_revenue_loss: number;
  root_cause: string;
  escalation_status: string;
}

interface BudgetOverrun {
  id: string;
  department: string;
  budget_allocated: number;
  budget_spent: number;
  overrun_amount: number;
  overrun_percentage: number;
  priority: "low" | "medium" | "high" | "critical";
  manager: string;
  approval_status: string;
}

interface QualityIssue {
  id: string;
  product_name: string;
  issue_type: string;
  severity: "low" | "medium" | "high" | "critical";
  affected_quantity: number;
  estimated_cost: number;
  corrective_action: string;
}

interface CustomerComplaint {
  id: string;
  complaint_id: string;
  customer_name: string;
  customer_clv: number;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  estimated_value_loss: number;
  resolution_deadline: string;
}

interface SystemWarning {
  id: string;
  warning_type: string;
  severity: "info" | "warning" | "critical";
  component: string;
  message: string;
  response_time?: number;
  memory_usage?: number;
  api_status?: string;
}

interface WarningsData {
  deliveryDelays: DeliveryDelay[];
  budgetOverruns: BudgetOverrun[];
  qualityIssues: QualityIssue[];
  customerComplaints: CustomerComplaint[];
  systemWarnings: SystemWarning[];
  summary: {
    totalWarnings: number;
    critical: number;
  };
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number): string => {
  return new Intl.NumberFormat("de-DE", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};

const getPriorityIcon = (priority: string): string => {
  switch (priority) {
    case "critical":
      return "🔴";
    case "high":
      return "🟠";
    case "medium":
      return "🟡";
    case "low":
      return "🟢";
    default:
      return "⚪";
  }
};

const getSeverityIcon = (severity: string): string => {
  switch (severity) {
    case "critical":
      return "🔴";
    case "warning":
      return "⚠️";
    case "info":
      return "ℹ️";
    default:
      return "⚪";
  }
};

export const WarningsEscalations: React.FC = () => {
  const [data, setData] = useState<WarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "critical" | "high">("all");

  const fetchData = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(
        `${baseUrl}/api/dashboard/comprehensive/warnings/all`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch warnings data");
      }

      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError("Fehler beim Laden der Warnungen");
      console.error("Failed to fetch warnings data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="warnings-escalations loading">
        <div className="loading-spinner"></div>
        <p>Lade Warnungen...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="warnings-escalations error">
        <p>⚠️ {error || "Keine Daten verfügbar"}</p>
      </div>
    );
  }

  const filterData = <T extends Record<string, unknown>>(
    items: T[],
    priorityField: string = "priority",
  ): T[] => {
    if (filter === "all") return items;
    if (filter === "critical")
      return items.filter((item) => item[priorityField] === "critical");
    if (filter === "high")
      return items.filter(
        (item) =>
          item[priorityField] === "critical" || item[priorityField] === "high",
      );
    return items;
  };

  return (
    <div className="warnings-escalations">
      <div className="warnings-header">
        <h2 className="section-title">
          <span className="icon">🚨</span>
          Warnungen & Eskalationen
        </h2>

        <div className="summary-badges">
          <div className="summary-badge total">
            <span className="badge-value">{data.summary.totalWarnings}</span>
            <span className="badge-label">Gesamt</span>
          </div>
          <div className="summary-badge critical">
            <span className="badge-value">{data.summary.critical}</span>
            <span className="badge-label">Kritisch</span>
          </div>
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Alle
          </button>
          <button
            className={`filter-btn ${filter === "high" ? "active" : ""}`}
            onClick={() => setFilter("high")}
          >
            Hoch + Kritisch
          </button>
          <button
            className={`filter-btn ${filter === "critical" ? "active" : ""}`}
            onClick={() => setFilter("critical")}
          >
            Nur Kritisch
          </button>
        </div>
      </div>

      {/* Delivery Delays */}
      <section className="warning-section">
        <h3 className="subsection-title">⚠️ Kritische Lieferverzögerungen</h3>
        {filterData(data.deliveryDelays).length === 0 ? (
          <div className="no-warnings">
            ✅ Keine aktuellen Lieferverzögerungen
          </div>
        ) : (
          <div className="warning-cards">
            {filterData(data.deliveryDelays).map((delay) => (
              <div
                key={delay.id}
                className={`warning-card priority-${delay.priority}`}
              >
                <div className="card-header">
                  <span className="priority-icon">
                    {getPriorityIcon(delay.priority)}
                  </span>
                  <span className="card-title">
                    Auftrag {delay.order_id} - {delay.customer_name}
                  </span>
                  <span className={`priority-badge ${delay.priority}`}>
                    {delay.priority}
                  </span>
                </div>
                <div className="card-body">
                  <div className="info-row">
                    <span className="info-label">Verzögerung:</span>
                    <span className="info-value">{delay.delay_days} Tage</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Geschätzter Verlust:</span>
                    <span className="info-value warning">
                      {formatCurrency(delay.estimated_revenue_loss)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ursache:</span>
                    <span className="info-value">
                      {delay.root_cause || "Unbekannt"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Status:</span>
                    <span className="info-value">
                      {delay.escalation_status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Budget Overruns */}
      <section className="warning-section">
        <h3 className="subsection-title">💸 Budget-Überschreitungen</h3>
        {filterData(data.budgetOverruns).length === 0 ? (
          <div className="no-warnings">✅ Keine Budget-Überschreitungen</div>
        ) : (
          <div className="warning-cards">
            {filterData(data.budgetOverruns).map((overrun) => (
              <div
                key={overrun.id}
                className={`warning-card priority-${overrun.priority}`}
              >
                <div className="card-header">
                  <span className="priority-icon">
                    {getPriorityIcon(overrun.priority)}
                  </span>
                  <span className="card-title">{overrun.department}</span>
                  <span className={`priority-badge ${overrun.priority}`}>
                    {overrun.priority}
                  </span>
                </div>
                <div className="card-body">
                  <div className="info-row">
                    <span className="info-label">Budget:</span>
                    <span className="info-value">
                      {formatCurrency(overrun.budget_allocated)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ausgegeben:</span>
                    <span className="info-value">
                      {formatCurrency(overrun.budget_spent)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Überschreitung:</span>
                    <span className="info-value warning">
                      {formatCurrency(overrun.overrun_amount)} (
                      {formatPercent(overrun.overrun_percentage)})
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Manager:</span>
                    <span className="info-value">{overrun.manager}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Genehmigung:</span>
                    <span className="info-value">
                      {overrun.approval_status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quality Issues */}
      <section className="warning-section">
        <h3 className="subsection-title">🎯 Qualitätsprobleme</h3>
        {filterData(data.qualityIssues, "severity").length === 0 ? (
          <div className="no-warnings">✅ Keine Qualitätsprobleme</div>
        ) : (
          <div className="warning-cards">
            {filterData(data.qualityIssues, "severity").map((issue) => (
              <div
                key={issue.id}
                className={`warning-card priority-${issue.severity}`}
              >
                <div className="card-header">
                  <span className="priority-icon">
                    {getPriorityIcon(issue.severity)}
                  </span>
                  <span className="card-title">{issue.product_name}</span>
                  <span className={`priority-badge ${issue.severity}`}>
                    {issue.severity}
                  </span>
                </div>
                <div className="card-body">
                  <div className="info-row">
                    <span className="info-label">Fehlertyp:</span>
                    <span className="info-value">{issue.issue_type}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Betroffene Menge:</span>
                    <span className="info-value">
                      {issue.affected_quantity} Stück
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Geschätzte Kosten:</span>
                    <span className="info-value warning">
                      {formatCurrency(issue.estimated_cost)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Maßnahmen:</span>
                    <span className="info-value">
                      {issue.corrective_action || "In Bearbeitung"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Customer Complaints */}
      <section className="warning-section">
        <h3 className="subsection-title">😠 Kundenbeschwerden</h3>
        {filterData(data.customerComplaints).length === 0 ? (
          <div className="no-warnings">✅ Keine aktuellen Beschwerden</div>
        ) : (
          <div className="warning-cards">
            {filterData(data.customerComplaints).map((complaint) => (
              <div
                key={complaint.id}
                className={`warning-card priority-${complaint.priority}`}
              >
                <div className="card-header">
                  <span className="priority-icon">
                    {getPriorityIcon(complaint.priority)}
                  </span>
                  <span className="card-title">{complaint.customer_name}</span>
                  <span className={`priority-badge ${complaint.priority}`}>
                    {complaint.priority}
                  </span>
                </div>
                <div className="card-body">
                  <div className="info-row">
                    <span className="info-label">Beschwerde-ID:</span>
                    <span className="info-value">{complaint.complaint_id}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Kategorie:</span>
                    <span className="info-value">{complaint.category}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Kundenwert (CLV):</span>
                    <span className="info-value">
                      {formatCurrency(complaint.customer_clv)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Potenzieller Verlust:</span>
                    <span className="info-value warning">
                      {formatCurrency(complaint.estimated_value_loss)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Status:</span>
                    <span className={`status-badge ${complaint.status}`}>
                      {complaint.status}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Deadline:</span>
                    <span className="info-value">
                      {new Date(
                        complaint.resolution_deadline,
                      ).toLocaleDateString("de-DE")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* System Warnings */}
      <section className="warning-section">
        <h3 className="subsection-title">⚙️ System-Warnungen</h3>
        {data.systemWarnings.length === 0 ? (
          <div className="no-warnings">✅ Alle Systeme betriebsbereit</div>
        ) : (
          <div className="warning-cards">
            {data.systemWarnings.map((warning) => (
              <div
                key={warning.id}
                className={`warning-card priority-${warning.severity}`}
              >
                <div className="card-header">
                  <span className="priority-icon">
                    {getSeverityIcon(warning.severity)}
                  </span>
                  <span className="card-title">{warning.component}</span>
                  <span className={`priority-badge ${warning.severity}`}>
                    {warning.severity}
                  </span>
                </div>
                <div className="card-body">
                  <div className="info-row">
                    <span className="info-label">Typ:</span>
                    <span className="info-value">{warning.warning_type}</span>
                  </div>
                  <div className="info-row full-width">
                    <span className="info-label">Nachricht:</span>
                    <span className="info-value">{warning.message}</span>
                  </div>
                  {warning.response_time && (
                    <div className="info-row">
                      <span className="info-label">Antwortzeit:</span>
                      <span className="info-value">
                        {warning.response_time} ms
                      </span>
                    </div>
                  )}
                  {warning.memory_usage && (
                    <div className="info-row">
                      <span className="info-label">Speicher:</span>
                      <span className="info-value">
                        {warning.memory_usage}%
                      </span>
                    </div>
                  )}
                  {warning.api_status && (
                    <div className="info-row">
                      <span className="info-label">API Status:</span>
                      <span className="info-value">{warning.api_status}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default WarningsEscalations;
