// SPDX-License-Identifier: MIT
// apps/frontend/src/features/finance/modules/KPIDashboard.tsx

/**
 * KPI Dashboard Component
 *
 * Displays comprehensive financial key performance indicators including:
 * - Liquidity ratios (Cash Ratio, Quick Ratio, Current Ratio)
 * - Profitability metrics (ROE, ROA, ROS, EBIT/EBITDA margins)
 * - Efficiency metrics (DSO, DPO, DIO, CCC)
 * - Capital structure indicators (Equity ratio, Gearing, Debt ratios)
 */

import React, { useState, useEffect } from "react";
import { Card } from "../../../components/ui";
import { API_ENDPOINTS } from "../../../config/api";
import styles from "./KPIDashboard.module.css";

interface KPIDashboard {
  liquidity: {
    cashRatio: number;
    quickRatio: number;
    currentRatio: number;
    workingCapital: number;
  };
  profitability: {
    roe: number;
    roa: number;
    ros: number;
    ebitMargin: number;
    ebitdaMargin: number;
  };
  efficiency: {
    dso: number;
    dpo: number;
    dio: number;
    ccc: number;
    assetTurnover: number;
  };
  capitalStructure: {
    equityRatio: number;
    debtToEquityRatio: number;
    gearing: number;
  };
  timestamp: string;
}

interface KPICardProps {
  title: string;
  value: number;
  unit?: string;
  format?: "number" | "currency" | "percentage";
  benchmark?: { min: number; optimal: number; max: number };
  invertColors?: boolean;
  description?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit = "",
  format = "number",
  benchmark,
  invertColors = false,
  description,
}) => {
  const getStatus = (): "good" | "warning" | "bad" => {
    if (!benchmark) return "good";

    const isInRange = value >= benchmark.min && value <= benchmark.max;
    const isOptimal =
      Math.abs(value - benchmark.optimal) / benchmark.optimal < 0.1;

    if (invertColors) {
      if (value > benchmark.max) return "bad";
      if (value < benchmark.min) return "good";
      if (isOptimal) return "good";
      return "warning";
    } else {
      if (value < benchmark.min || value > benchmark.max) return "bad";
      if (isOptimal) return "good";
      return "warning";
    }
  };

  const formatValue = (val: number): string => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }).format(val);
      case "percentage":
        return val.toFixed(2);
      default:
        return val.toFixed(2);
    }
  };

  const status = getStatus();

  return (
    <Card className={`${styles.kpiCard} ${styles[`status-${status}`]}`}>
      <h3 className={styles.kpiTitle}>{title}</h3>
      <div className={styles.kpiValue}>
        {formatValue(value)}
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
      {description && <p className={styles.description}>{description}</p>}
      {benchmark && (
        <div className={styles.benchmark}>
          <div className={styles.benchmarkBar}>
            <span className={styles.min}>{benchmark.min}</span>
            <span className={styles.optimal}>{benchmark.optimal}</span>
            <span className={styles.max}>{benchmark.max}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export const KPIDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<KPIDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.finance.kpi.dashboard);

        if (!response.ok) {
          throw new Error("Failed to fetch KPI data");
        }

        const result = await response.json();
        setKpis(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        console.error("Error fetching KPIs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Lade Kennzahlen...</div>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Fehler beim Laden der Kennzahlen: {error || "Keine Daten verfügbar"}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>💰 Kennzahlen-Dashboard</h1>

      {/* Liquidität */}
      <section className={styles.kpiSection}>
        <h2 className={styles.sectionTitle}>💧 Liquidität</h2>
        <div className={styles.kpiGrid}>
          <KPICard
            title="Liquidität 1. Grades"
            value={kpis.liquidity.cashRatio}
            unit="%"
            format="percentage"
            benchmark={{ min: 20, optimal: 30, max: 50 }}
            description="Sofortige Zahlungsfähigkeit (Cash Ratio)"
          />
          <KPICard
            title="Liquidität 2. Grades"
            value={kpis.liquidity.quickRatio}
            unit="%"
            format="percentage"
            benchmark={{ min: 100, optimal: 120, max: 150 }}
            description="Kurzfristige Zahlungsfähigkeit (Quick Ratio)"
          />
          <KPICard
            title="Liquidität 3. Grades"
            value={kpis.liquidity.currentRatio}
            unit="%"
            format="percentage"
            benchmark={{ min: 150, optimal: 200, max: 250 }}
            description="Allgemeine Deckungskraft (Current Ratio)"
          />
          <KPICard
            title="Working Capital"
            value={kpis.liquidity.workingCapital}
            unit="€"
            format="currency"
            description="Netto-Umlaufvermögen"
          />
        </div>
      </section>

      {/* Rentabilität */}
      <section className={styles.kpiSection}>
        <h2 className={styles.sectionTitle}>📈 Rentabilität</h2>
        <div className={styles.kpiGrid}>
          <KPICard
            title="Eigenkapitalrentabilität (ROE)"
            value={kpis.profitability.roe}
            unit="%"
            format="percentage"
            benchmark={{ min: 10, optimal: 15, max: 25 }}
            description="Rendite für Eigentümer"
          />
          <KPICard
            title="Gesamtkapitalrentabilität (ROA)"
            value={kpis.profitability.roa}
            unit="%"
            format="percentage"
            benchmark={{ min: 5, optimal: 10, max: 15 }}
            description="Verzinsung des Gesamtkapitals"
          />
          <KPICard
            title="Umsatzrendite (ROS)"
            value={kpis.profitability.ros}
            unit="%"
            format="percentage"
            benchmark={{ min: 5, optimal: 10, max: 20 }}
            description="Nettogewinn je Umsatz-Euro"
          />
          <KPICard
            title="EBIT-Marge"
            value={kpis.profitability.ebitMargin}
            unit="%"
            format="percentage"
            benchmark={{ min: 8, optimal: 12, max: 20 }}
            description="Operative Ertragskraft"
          />
          <KPICard
            title="EBITDA-Marge"
            value={kpis.profitability.ebitdaMargin}
            unit="%"
            format="percentage"
            benchmark={{ min: 10, optimal: 15, max: 25 }}
            description="Operative Marge vor Abschreibungen"
          />
        </div>
      </section>

      {/* Effizienz */}
      <section className={styles.kpiSection}>
        <h2 className={styles.sectionTitle}>⚡ Effizienz</h2>
        <div className={styles.kpiGrid}>
          <KPICard
            title="Days Sales Outstanding (DSO)"
            value={kpis.efficiency.dso}
            unit=" Tage"
            benchmark={{ min: 0, optimal: 30, max: 45 }}
            invertColors
            description="Ø Tage bis Zahlungseingang"
          />
          <KPICard
            title="Days Payables Outstanding (DPO)"
            value={kpis.efficiency.dpo}
            unit=" Tage"
            benchmark={{ min: 30, optimal: 45, max: 60 }}
            description="Ø Tage Lieferantenkredit"
          />
          <KPICard
            title="Days Inventory Outstanding (DIO)"
            value={kpis.efficiency.dio}
            unit=" Tage"
            benchmark={{ min: 0, optimal: 30, max: 60 }}
            invertColors
            description="Ø Lagerdauer"
          />
          <KPICard
            title="Cash Conversion Cycle (CCC)"
            value={kpis.efficiency.ccc}
            unit=" Tage"
            benchmark={{ min: 0, optimal: 30, max: 60 }}
            invertColors
            description="Kapitalbindungsdauer"
          />
          <KPICard
            title="Kapitalumschlag"
            value={kpis.efficiency.assetTurnover}
            unit="x"
            benchmark={{ min: 1.0, optimal: 2.0, max: 3.0 }}
            description="Effizienz der Kapitalnutzung"
          />
        </div>
      </section>

      {/* Kapitalstruktur */}
      <section className={styles.kpiSection}>
        <h2 className={styles.sectionTitle}>🏛️ Kapitalstruktur</h2>
        <div className={styles.kpiGrid}>
          <KPICard
            title="Eigenkapitalquote"
            value={kpis.capitalStructure.equityRatio}
            unit="%"
            format="percentage"
            benchmark={{ min: 20, optimal: 30, max: 50 }}
            description="Anteil EK an Bilanzsumme"
          />
          <KPICard
            title="Verschuldungsgrad"
            value={kpis.capitalStructure.debtToEquityRatio}
            unit="%"
            format="percentage"
            benchmark={{ min: 0, optimal: 100, max: 200 }}
            invertColors
            description="FK im Verhältnis zum EK"
          />
          <KPICard
            title="Gearing"
            value={kpis.capitalStructure.gearing}
            unit="%"
            format="percentage"
            benchmark={{ min: 0, optimal: 50, max: 150 }}
            invertColors
            description="Nettoverschuldung / EK"
          />
        </div>
      </section>

      <footer className={styles.footer}>
        <p className={styles.timestamp}>
          Letzte Aktualisierung:{" "}
          {new Date(kpis.timestamp).toLocaleString("de-DE")}
        </p>
      </footer>
    </div>
  );
};

export default KPIDashboard;
