// SPDX-License-Identifier: MIT
// apps/frontend/src/pages/ComprehensiveDashboard.tsx

import React, { useState } from "react";
import { ExecutiveOverview, WarningsEscalations } from "../components/Dashboard/widgets";
import "./ComprehensiveDashboard.css";

type DashboardView = "overview" | "executive" | "warnings" | "analytics" | "tasks";

export const ComprehensiveDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<DashboardView>("overview");

  const renderView = () => {
    switch (activeView) {
      case "executive":
        return <ExecutiveOverview />;
      case "warnings":
        return <WarningsEscalations />;
      case "overview":
      default:
        return (
          <div className="dashboard-overview-grid">
            <div className="overview-card">
              <h3>📊 Executive Overview</h3>
              <p>Schnellzugriff auf Umsatz, Margen, Liquidität und Produktivität</p>
              <button
                className="view-btn"
                onClick={() => setActiveView("executive")}
              >
                Details anzeigen
              </button>
            </div>
            <div className="overview-card">
              <h3>🚨 Warnungen & Eskalationen</h3>
              <p>Kritische Lieferverzögerungen, Budget-Überschreitungen und mehr</p>
              <button
                className="view-btn"
                onClick={() => setActiveView("warnings")}
              >
                Details anzeigen
              </button>
            </div>
            <div className="overview-card">
              <h3>📈 Echtzeit-Analytics</h3>
              <p>Finanz-, Produktions- und Kunden-KPIs in Echtzeit</p>
              <button
                className="view-btn"
                onClick={() => setActiveView("analytics")}
              >
                Details anzeigen
              </button>
            </div>
            <div className="overview-card">
              <h3>✅ Aufgaben & Benachrichtigungen</h3>
              <p>Persönliche und Team-Aufgaben im Überblick</p>
              <button
                className="view-btn"
                onClick={() => setActiveView("tasks")}
              >
                Details anzeigen
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="comprehensive-dashboard">
      <header className="dashboard-main-header">
        <h1>🏠 ERP Dashboard</h1>
        <p className="dashboard-subtitle">
          Umfassende Übersicht über alle wichtigen Unternehmenskennzahlen
        </p>
      </header>

      <nav className="dashboard-navigation">
        <button
          className={`nav-btn ${activeView === "overview" ? "active" : ""}`}
          onClick={() => setActiveView("overview")}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Übersicht</span>
        </button>
        <button
          className={`nav-btn ${activeView === "executive" ? "active" : ""}`}
          onClick={() => setActiveView("executive")}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Executive Overview</span>
        </button>
        <button
          className={`nav-btn ${activeView === "warnings" ? "active" : ""}`}
          onClick={() => setActiveView("warnings")}
        >
          <span className="nav-icon">🚨</span>
          <span className="nav-label">Warnungen</span>
        </button>
        <button
          className={`nav-btn ${activeView === "analytics" ? "active" : ""}`}
          onClick={() => setActiveView("analytics")}
        >
          <span className="nav-icon">📈</span>
          <span className="nav-label">Analytics</span>
        </button>
        <button
          className={`nav-btn ${activeView === "tasks" ? "active" : ""}`}
          onClick={() => setActiveView("tasks")}
        >
          <span className="nav-icon">✅</span>
          <span className="nav-label">Aufgaben</span>
        </button>
      </nav>

      <main className="dashboard-main-content">{renderView()}</main>
    </div>
  );
};

export default ComprehensiveDashboard;
