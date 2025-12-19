// SPDX-License-Identifier: MIT
// apps/frontend/src/components/Dashboard/widgets/ExecutiveOverview.tsx

import React, { useEffect, useState } from "react";
import "./ExecutiveOverview.css";

interface RevenueMetrics {
  daily_revenue: number;
  monthly_revenue: number;
  yearly_revenue: number;
  previous_month_revenue: number;
  previous_year_revenue: number;
  budget_target: number;
  forecast_amount: number;
  forecast_confidence: number;
  average_order_value: number;
  growth_rate: number;
}

interface MarginMetrics {
  gross_margin: number;
  net_margin: number;
  target_margin: number;
  benchmark_margin: number;
}

interface LiquidityMetrics {
  current_balance: number;
  daily_cashflow: number;
  forecast_7days: number;
  forecast_30days: number;
  payables_due: number;
  receivables_expected: number;
  credit_line_available: number;
  short_term_liabilities: number;
  warning_level: "green" | "yellow" | "red";
}

interface OrderIntakeMetrics {
  daily_intake: number;
  monthly_intake: number;
  target_intake: number;
  average_order_size: number;
  deviation_percentage: number;
}

interface ProductivityMetrics {
  revenue_per_employee: number;
  output_per_machine_hour: number;
  average_throughput_time: number;
  oee: number;
  capacity_utilization: number;
  target_value: number;
}

interface ExecutiveOverviewData {
  revenue: RevenueMetrics;
  topCustomers: Array<{ customer_name: string; revenue: number; rank: number }>;
  topProducts: Array<{ product_name: string; revenue: number; rank: number }>;
  regionalRevenue: Array<{
    region: string;
    revenue: number;
    percentage: number;
  }>;
  margins: MarginMetrics;
  liquidity: LiquidityMetrics;
  orderIntake: OrderIntakeMetrics;
  productivity: ProductivityMetrics;
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

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const ExecutiveOverview: React.FC = () => {
  const [data, setData] = useState<ExecutiveOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

      // Fetch all executive overview data
      const [
        revenueRes,
        marginsRes,
        liquidityRes,
        orderIntakeRes,
        productivityRes,
      ] = await Promise.all([
        fetch(`${baseUrl}/api/dashboard/comprehensive/executive/revenue`),
        fetch(`${baseUrl}/api/dashboard/comprehensive/executive/margins`),
        fetch(`${baseUrl}/api/dashboard/comprehensive/executive/liquidity`),
        fetch(`${baseUrl}/api/dashboard/comprehensive/executive/order-intake`),
        fetch(`${baseUrl}/api/dashboard/comprehensive/executive/productivity`),
      ]);

      const [
        revenueData,
        marginsData,
        liquidityData,
        orderIntakeData,
        productivityData,
      ] = await Promise.all([
        revenueRes.json(),
        marginsRes.json(),
        liquidityRes.json(),
        orderIntakeRes.json(),
        productivityRes.json(),
      ]);

      setData({
        revenue: revenueData.data.metrics,
        topCustomers: revenueData.data.topCustomers,
        topProducts: revenueData.data.topProducts,
        regionalRevenue: revenueData.data.regionalRevenue,
        margins: marginsData.data.current,
        liquidity: liquidityData.data,
        orderIntake: orderIntakeData.data.current,
        productivity: productivityData.data,
      });
      setError(null);
    } catch (err) {
      setError("Fehler beim Laden der Executive Overview Daten");
      console.error("Failed to fetch executive overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="executive-overview loading">
        <div className="loading-spinner"></div>
        <p>Lade Executive Overview...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="executive-overview error">
        <p>⚠️ {error || "Keine Daten verfügbar"}</p>
      </div>
    );
  }

  return (
    <div className="executive-overview">
      <h2 className="section-title">
        <span className="icon">📊</span>
        Executive Overview
      </h2>

      {/* Revenue Metrics Section */}
      <section className="overview-section revenue-section">
        <h3 className="subsection-title">💰 Umsatz-Kennzahlen</h3>
        <div className="metrics-grid">
          <div className="metric-card primary">
            <div className="metric-label">Tagesumsatz (Live)</div>
            <div className="metric-value">
              {formatCurrency(data.revenue.daily_revenue)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Monatsumsatz</div>
            <div className="metric-value">
              {formatCurrency(data.revenue.monthly_revenue)}
            </div>
            <div className="metric-change">
              {data.revenue.monthly_revenue >
              data.revenue.previous_month_revenue
                ? "📈"
                : "📉"}{" "}
              {formatPercent(
                (data.revenue.monthly_revenue -
                  data.revenue.previous_month_revenue) /
                  data.revenue.previous_month_revenue,
              )}{" "}
              vs. Vormonat
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Jahresumsatz (YTD)</div>
            <div className="metric-value">
              {formatCurrency(data.revenue.yearly_revenue)}
            </div>
            <div className="metric-change">
              {data.revenue.yearly_revenue > data.revenue.previous_year_revenue
                ? "📈"
                : "📉"}{" "}
              {formatPercent(
                (data.revenue.yearly_revenue -
                  data.revenue.previous_year_revenue) /
                  data.revenue.previous_year_revenue,
              )}{" "}
              vs. Vorjahr
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Umsatzprognose (KI)</div>
            <div className="metric-value">
              {formatCurrency(data.revenue.forecast_amount)}
            </div>
            <div className="metric-change">
              🎯 Konfidenz: {formatPercent(data.revenue.forecast_confidence)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Durchschn. Auftragswert</div>
            <div className="metric-value">
              {formatCurrency(data.revenue.average_order_value)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Wachstumsrate</div>
            <div className="metric-value">
              {formatPercent(data.revenue.growth_rate)}
            </div>
            <div
              className={`metric-trend ${data.revenue.growth_rate > 0 ? "positive" : "negative"}`}
            >
              {data.revenue.growth_rate > 0 ? "▲" : "▼"}
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="top-list">
          <h4>🏆 Top 10 Kunden (Umsatz)</h4>
          <div className="top-list-items">
            {data.topCustomers.slice(0, 5).map((customer) => (
              <div key={customer.rank} className="list-item">
                <span className="rank">#{customer.rank}</span>
                <span className="name">{customer.customer_name}</span>
                <span className="value">
                  {formatCurrency(customer.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="top-list">
          <h4>📦 Top 5 Produkte (Umsatz)</h4>
          <div className="top-list-items">
            {data.topProducts.map((product) => (
              <div key={product.rank} className="list-item">
                <span className="rank">#{product.rank}</span>
                <span className="name">{product.product_name}</span>
                <span className="value">{formatCurrency(product.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="regional-chart">
          <h4>🌍 Regionale Umsatzverteilung</h4>
          {data.regionalRevenue.map((region) => (
            <div key={region.region} className="region-bar">
              <div className="region-label">
                <span className="region-name">{region.region}</span>
                <span className="region-value">
                  {formatCurrency(region.revenue)}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${region.percentage}%` }}
                  title={formatPercent(region.percentage / 100)}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Margin Metrics Section */}
      <section className="overview-section margin-section">
        <h3 className="subsection-title">💸 Gewinnmargen</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Bruttomarge (Live)</div>
            <div className="metric-value">
              {formatPercent(data.margins.gross_margin)}
            </div>
            <div className="metric-change">
              🎯 Ziel: {formatPercent(data.margins.target_margin)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Nettomarge</div>
            <div className="metric-value">
              {formatPercent(data.margins.net_margin)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Branchenbenchmark</div>
            <div className="metric-value">
              {formatPercent(data.margins.benchmark_margin)}
            </div>
            <div
              className={`metric-trend ${data.margins.gross_margin > data.margins.benchmark_margin ? "positive" : "negative"}`}
            >
              {data.margins.gross_margin > data.margins.benchmark_margin
                ? "Über Benchmark"
                : "Unter Benchmark"}
            </div>
          </div>
        </div>
      </section>

      {/* Liquidity Section */}
      <section className="overview-section liquidity-section">
        <h3 className="subsection-title">💧 Liquiditätsstatus</h3>
        <div
          className={`liquidity-status status-${data.liquidity.warning_level}`}
        >
          <div className="status-indicator">
            {data.liquidity.warning_level === "green" && "✅ Gut"}
            {data.liquidity.warning_level === "yellow" && "⚠️ Warnung"}
            {data.liquidity.warning_level === "red" && "🔴 Kritisch"}
          </div>
        </div>
        <div className="metrics-grid">
          <div className="metric-card primary">
            <div className="metric-label">Aktueller Kontostand</div>
            <div className="metric-value">
              {formatCurrency(data.liquidity.current_balance)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Täglicher Cashflow</div>
            <div className="metric-value">
              {formatCurrency(data.liquidity.daily_cashflow)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">7-Tage-Prognose</div>
            <div className="metric-value">
              {formatCurrency(data.liquidity.forecast_7days)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">30-Tage-Prognose</div>
            <div className="metric-value">
              {formatCurrency(data.liquidity.forecast_30days)}
            </div>
          </div>

          <div className="metric-card warning">
            <div className="metric-label">Fällige Zahlungsausgänge</div>
            <div className="metric-value">
              {formatCurrency(data.liquidity.payables_due)}
            </div>
          </div>

          <div className="metric-card success">
            <div className="metric-label">Erwartete Zahlungseingänge</div>
            <div className="metric-value">
              {formatCurrency(data.liquidity.receivables_expected)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Verfügbare Kreditlinien</div>
            <div className="metric-value">
              {formatCurrency(data.liquidity.credit_line_available)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Kurzfristige Verbindlichkeiten</div>
            <div className="metric-value">
              {formatCurrency(data.liquidity.short_term_liabilities)}
            </div>
          </div>
        </div>
      </section>

      {/* Order Intake Section */}
      <section className="overview-section order-section">
        <h3 className="subsection-title">📦 Auftragseingang</h3>
        <div className="metrics-grid">
          <div className="metric-card primary">
            <div className="metric-label">Heutiger Auftragseingang</div>
            <div className="metric-value">
              {formatCurrency(data.orderIntake.daily_intake)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Monatlicher Auftragseingang</div>
            <div className="metric-value">
              {formatCurrency(data.orderIntake.monthly_intake)}
            </div>
            <div className="metric-change">
              🎯 Ziel: {formatCurrency(data.orderIntake.target_intake)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Soll-Ist Abweichung</div>
            <div className="metric-value">
              {formatPercent(data.orderIntake.deviation_percentage)}
            </div>
            <div
              className={`metric-trend ${data.orderIntake.deviation_percentage > 0 ? "positive" : "negative"}`}
            >
              {data.orderIntake.deviation_percentage > 0
                ? "▲ Über Plan"
                : "▼ Unter Plan"}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Durchschn. Auftragsgröße</div>
            <div className="metric-value">
              {formatCurrency(data.orderIntake.average_order_size)}
            </div>
          </div>
        </div>
      </section>

      {/* Productivity Section */}
      <section className="overview-section productivity-section">
        <h3 className="subsection-title">🚀 Produktivitätskennzahlen</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Umsatz pro Mitarbeiter</div>
            <div className="metric-value">
              {formatCurrency(data.productivity.revenue_per_employee)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Output pro Maschinenstunde</div>
            <div className="metric-value">
              {formatNumber(data.productivity.output_per_machine_hour)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Durchschn. Durchlaufzeit</div>
            <div className="metric-value">
              {formatNumber(data.productivity.average_throughput_time)} Min
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">
              OEE (Overall Equipment Effectiveness)
            </div>
            <div className="metric-value">
              {formatPercent(data.productivity.oee)}
            </div>
            <div className="metric-change">
              🎯 Ziel: {formatPercent(data.productivity.target_value)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Kapazitätsauslastung</div>
            <div className="metric-value">
              {formatPercent(data.productivity.capacity_utilization)}
            </div>
            <div
              className={`metric-trend ${data.productivity.capacity_utilization > 0.85 ? "positive" : "warning"}`}
            >
              {data.productivity.capacity_utilization > 0.85
                ? "Optimal"
                : "Ausbaufähig"}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExecutiveOverview;
