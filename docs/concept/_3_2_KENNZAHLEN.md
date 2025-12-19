## 🔧 Technische Implementierung der Kennzahlen

### Backend-API-Endpunkte

```
GET /api/finance/kpi/:category
GET /api/finance/kpi/dashboard
GET /api/finance/kpi/calculate
```

#### KPI-Kategorien

| Kategorie | Endpoint | Enthaltene KPIs |
|-----------|----------|-----------------|
| Liquidität | `/api/finance/kpi/liquidity` | Cash Ratio, Quick Ratio, Current Ratio, Working Capital |
| Rentabilität | `/api/finance/kpi/profitability` | ROE, ROA, ROS, EBIT-Marge, EBITDA-Marge |
| Effizienz | `/api/finance/kpi/efficiency` | DSO, DPO, DIO, CCC, Kapitalumschlag, Vorratsumschlag |
| Kapitalstruktur | `/api/finance/kpi/capital-structure` | EK-Quote, FK-Quote, Verschuldungsgrad, Gearing |
| Alle | `/api/finance/kpi/dashboard` | Kombination aller wichtigen KPIs |

### KPI-Berechnungsservice

```typescript
// apps/backend/src/services/kpiService.ts

export class KPIService {
  
  // ==================== LIQUIDITÄT ====================
  
  // Liquidität 1. Grades (Cash Ratio)
  async calculateCashRatio(date: Date): Promise<number> {
    const cash = await this.getCash(date);
    const shortTermLiabilities = await this.getShortTermLiabilities(date);
    
    if (shortTermLiabilities === 0) return 0;
    return (cash / shortTermLiabilities) * 100;
  }
  
  // Liquidität 2. Grades (Quick Ratio)
  async calculateQuickRatio(date: Date): Promise<number> {
    const cash = await this.getCash(date);
    const receivables = await this.getReceivables(date);
    const shortTermLiabilities = await this.getShortTermLiabilities(date);
    
    if (shortTermLiabilities === 0) return 0;
    return ((cash + receivables) / shortTermLiabilities) * 100;
  }
  
  // Liquidität 3. Grades (Current Ratio)
  async calculateCurrentRatio(date: Date): Promise<number> {
    const currentAssets = await this.getCurrentAssets(date);
    const shortTermLiabilities = await this.getShortTermLiabilities(date);
    
    if (shortTermLiabilities === 0) return 0;
    return (currentAssets / shortTermLiabilities) * 100;
  }
  
  // Working Capital
  async calculateWorkingCapital(date: Date): Promise<number> {
    const currentAssets = await this.getCurrentAssets(date);
    const shortTermLiabilities = await this.getShortTermLiabilities(date);
    
    return currentAssets - shortTermLiabilities;
  }
  
  // ==================== RENTABILITÄT ====================
  
  // Eigenkapitalrentabilität (ROE)
  async calculateROE(startDate: Date, endDate: Date): Promise<number> {
    const netIncome = await this.getNetIncome(startDate, endDate);
    const avgEquity = await this.getAverageEquity(startDate, endDate);
    
    if (avgEquity === 0) return 0;
    return (netIncome / avgEquity) * 100;
  }
  
  // Gesamtkapitalrentabilität (ROA)
  async calculateROA(startDate: Date, endDate: Date): Promise<number> {
    const netIncome = await this.getNetIncome(startDate, endDate);
    const interestExpense = await this.getInterestExpense(startDate, endDate);
    const avgTotalAssets = await this.getAverageTotalAssets(startDate, endDate);
    
    if (avgTotalAssets === 0) return 0;
    return ((netIncome + interestExpense) / avgTotalAssets) * 100;
  }
  
  // Umsatzrendite (ROS)
  async calculateROS(startDate: Date, endDate: Date): Promise<number> {
    const netIncome = await this.getNetIncome(startDate, endDate);
    const revenue = await this.getRevenue(startDate, endDate);
    
    if (revenue === 0) return 0;
    return (netIncome / revenue) * 100;
  }
  
  // EBIT-Marge
  async calculateEBITMargin(startDate: Date, endDate: Date): Promise<number> {
    const ebit = await this.getEBIT(startDate, endDate);
    const revenue = await this.getRevenue(startDate, endDate);
    
    if (revenue === 0) return 0;
    return (ebit / revenue) * 100;
  }
  
  // EBITDA-Marge
  async calculateEBITDAMargin(startDate: Date, endDate: Date): Promise<number> {
    const ebitda = await this.getEBITDA(startDate, endDate);
    const revenue = await this.getRevenue(startDate, endDate);
    
    if (revenue === 0) return 0;
    return (ebitda / revenue) * 100;
  }
  
  // ==================== EFFIZIENZ ====================
  
  // Days Sales Outstanding (DSO)
  async calculateDSO(startDate: Date, endDate: Date): Promise<number> {
    const avgReceivables = await this.getAverageReceivables(startDate, endDate);
    const revenue = await this.getRevenue(startDate, endDate);
    const days = this.getDaysBetween(startDate, endDate);
    
    if (revenue === 0) return 0;
    return (avgReceivables / revenue) * days;
  }
  
  // Days Payables Outstanding (DPO)
  async calculateDPO(startDate: Date, endDate: Date): Promise<number> {
    const avgPayables = await this.getAveragePayables(startDate, endDate);
    const cogs = await this.getCOGS(startDate, endDate);
    const days = this.getDaysBetween(startDate, endDate);
    
    if (cogs === 0) return 0;
    return (avgPayables / cogs) * days;
  }
  
  // Days Inventory Outstanding (DIO)
  async calculateDIO(startDate: Date, endDate: Date): Promise<number> {
    const avgInventory = await this.getAverageInventory(startDate, endDate);
    const cogs = await this.getCOGS(startDate, endDate);
    const days = this.getDaysBetween(startDate, endDate);
    
    if (cogs === 0) return 0;
    return (avgInventory / cogs) * days;
  }
  
  // Cash Conversion Cycle (CCC)
  async calculateCCC(startDate: Date, endDate: Date): Promise<number> {
    const dso = await this.calculateDSO(startDate, endDate);
    const dio = await this.calculateDIO(startDate, endDate);
    const dpo = await this.calculateDPO(startDate, endDate);
    
    return dso + dio - dpo;
  }
  
  // Kapitalumschlag
  async calculateAssetTurnover(startDate: Date, endDate: Date): Promise<number> {
    const revenue = await this.getRevenue(startDate, endDate);
    const avgTotalAssets = await this.getAverageTotalAssets(startDate, endDate);
    
    if (avgTotalAssets === 0) return 0;
    return revenue / avgTotalAssets;
  }
  
  // ==================== KAPITALSTRUKTUR ====================
  
  // Eigenkapitalquote
  async calculateEquityRatio(date: Date): Promise<number> {
    const equity = await this.getEquity(date);
    const totalAssets = await this.getTotalAssets(date);
    
    if (totalAssets === 0) return 0;
    return (equity / totalAssets) * 100;
  }
  
  // Verschuldungsgrad
  async calculateDebtToEquityRatio(date: Date): Promise<number> {
    const totalDebt = await this.getTotalDebt(date);
    const equity = await this.getEquity(date);
    
    if (equity === 0) return 0;
    return (totalDebt / equity) * 100;
  }
  
  // Gearing (Nettoverschuldung / Eigenkapital)
  async calculateGearing(date: Date): Promise<number> {
    const interestBearingDebt = await this.getInterestBearingDebt(date);
    const cash = await this.getCash(date);
    const equity = await this.getEquity(date);
    
    const netDebt = interestBearingDebt - cash;
    
    if (equity === 0) return 0;
    return (netDebt / equity) * 100;
  }
  
  // ==================== DASHBOARD ====================
  
  async getKPIDashboard(date: Date): Promise<KPIDashboard> {
    const thirtyDaysAgo = new Date(date);
    thirtyDaysAgo.setDate(date.getDate() - 30);
    
    return {
      liquidity: {
        cashRatio: await this.calculateCashRatio(date),
        quickRatio: await this.calculateQuickRatio(date),
        currentRatio: await this.calculateCurrentRatio(date),
        workingCapital: await this.calculateWorkingCapital(date),
      },
      profitability: {
        roe: await this.calculateROE(thirtyDaysAgo, date),
        roa: await this.calculateROA(thirtyDaysAgo, date),
        ros: await this.calculateROS(thirtyDaysAgo, date),
        ebitMargin: await this.calculateEBITMargin(thirtyDaysAgo, date),
        ebitdaMargin: await this.calculateEBITDAMargin(thirtyDaysAgo, date),
      },
      efficiency: {
        dso: await this.calculateDSO(thirtyDaysAgo, date),
        dpo: await this.calculateDPO(thirtyDaysAgo, date),
        dio: await this.calculateDIO(thirtyDaysAgo, date),
        ccc: await this.calculateCCC(thirtyDaysAgo, date),
        assetTurnover: await this.calculateAssetTurnover(thirtyDaysAgo, date),
      },
      capitalStructure: {
        equityRatio: await this.calculateEquityRatio(date),
        debtToEquityRatio: await this.calculateDebtToEquityRatio(date),
        gearing: await this.calculateGearing(date),
      },
      timestamp: new Date(),
    };
  }
}
```

### Frontend KPI-Dashboard

```typescript
// apps/frontend/src/features/finance/modules/KPIDashboard.tsx

import { useEffect, useState } from 'react';
import { financeApi } from '@/api/finance';
import { KPICard } from './KPICard';
import { KPITrend } from './KPITrend';

export function KPIDashboard() {
  const [kpis, setKpis] = useState<KPIDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    financeApi.getKPIDashboard().then(data => {
      setKpis(data);
      setLoading(false);
    });
  }, []);
  
  if (loading) return <Loading />;
  if (!kpis) return <Error />;
  
  return (
    <div className="kpi-dashboard">
      <h1>Kennzahlen-Dashboard</h1>
      
      {/* Liquidität */}
      <section className="kpi-section">
        <h2>💧 Liquidität</h2>
        <div className="kpi-grid">
          <KPICard
            title="Liquidität 1. Grades"
            value={kpis.liquidity.cashRatio}
            unit="%"
            benchmark={{ min: 20, optimal: 30, max: 50 }}
            description="Sofortige Zahlungsfähigkeit"
          />
          <KPICard
            title="Liquidität 2. Grades"
            value={kpis.liquidity.quickRatio}
            unit="%"
            benchmark={{ min: 100, optimal: 120, max: 150 }}
            description="Kurzfristige Zahlungsfähigkeit"
          />
          <KPICard
            title="Liquidität 3. Grades"
            value={kpis.liquidity.currentRatio}
            unit="%"
            benchmark={{ min: 150, optimal: 200, max: 250 }}
            description="Allgemeine Deckungskraft"
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
      <section className="kpi-section">
        <h2>📈 Rentabilität</h2>
        <div className="kpi-grid">
          <KPICard
            title="Eigenkapitalrentabilität (ROE)"
            value={kpis.profitability.roe}
            unit="%"
            benchmark={{ min: 10, optimal: 15, max: 25 }}
            description="Rendite für Eigentümer"
          />
          <KPICard
            title="Gesamtkapitalrentabilität (ROA)"
            value={kpis.profitability.roa}
            unit="%"
            benchmark={{ min: 5, optimal: 10, max: 15 }}
            description="Verzinsung des Gesamtkapitals"
          />
          <KPICard
            title="Umsatzrendite (ROS)"
            value={kpis.profitability.ros}
            unit="%"
            benchmark={{ min: 5, optimal: 10, max: 20 }}
            description="Nettogewinn je Umsatz-Euro"
          />
          <KPICard
            title="EBIT-Marge"
            value={kpis.profitability.ebitMargin}
            unit="%"
            benchmark={{ min: 8, optimal: 12, max: 20 }}
            description="Operative Ertragskraft"
          />
        </div>
      </section>
      
      {/* Effizienz */}
      <section className="kpi-section">
        <h2>⚡ Effizienz</h2>
        <div className="kpi-grid">
          <KPICard
            title="Days Sales Outstanding (DSO)"
            value={kpis.efficiency.dso}
            unit="Tage"
            benchmark={{ min: 0, optimal: 30, max: 45 }}
            invertColors
            description="Ø Tage bis Zahlungseingang"
          />
          <KPICard
            title="Days Payables Outstanding (DPO)"
            value={kpis.efficiency.dpo}
            unit="Tage"
            benchmark={{ min: 30, optimal: 45, max: 60 }}
            description="Ø Tage Lieferantenkredit"
          />
          <KPICard
            title="Days Inventory Outstanding (DIO)"
            value={kpis.efficiency.dio}
            unit="Tage"
            benchmark={{ min: 0, optimal: 30, max: 60 }}
            invertColors
            description="Ø Lagerdauer"
          />
          <KPICard
            title="Cash Conversion Cycle (CCC)"
            value={kpis.efficiency.ccc}
            unit="Tage"
            benchmark={{ min: 0, optimal: 30, max: 60 }}
            invertColors
            description="Kapitalbindungsdauer"
          />
        </div>
      </section>
      
      {/* Kapitalstruktur */}
      <section className="kpi-section">
        <h2>🏛️ Kapitalstruktur</h2>
        <div className="kpi-grid">
          <KPICard
            title="Eigenkapitalquote"
            value={kpis.capitalStructure.equityRatio}
            unit="%"
            benchmark={{ min: 20, optimal: 30, max: 50 }}
            description="Anteil EK an Bilanzsumme"
          />
          <KPICard
            title="Verschuldungsgrad"
            value={kpis.capitalStructure.debtToEquityRatio}
            unit="%"
            benchmark={{ min: 0, optimal: 100, max: 200 }}
            invertColors
            description="FK im Verhältnis zum EK"
          />
          <KPICard
            title="Gearing"
            value={kpis.capitalStructure.gearing}
            unit="%"
            benchmark={{ min: 0, optimal: 50, max: 150 }}
            invertColors
            description="Nettoverschuldung / EK"
          />
        </div>
      </section>
      
      {/* Trendcharts */}
      <section className="kpi-trends">
        <h2>📊 Trends (letzte 12 Monate)</h2>
        <KPITrend metrics={['DSO', 'DPO', 'CCC']} />
      </section>
    </div>
  );
}

// KPICard Komponente
function KPICard({ 
  title, 
  value, 
  unit, 
  benchmark, 
  invertColors = false,
  format = 'number',
  description 
}: KPICardProps) {
  const status = getStatus(value, benchmark, invertColors);
  const formattedValue = format === 'currency' 
    ? formatCurrency(value) 
    : formatNumber(value, 2);
  
  return (
    <div className={`kpi-card status-${status}`}>
      <h3>{title}</h3>
      <div className="kpi-value">
        {formattedValue}
        {unit && <span className="unit">{unit}</span>}
      </div>
      <p className="description">{description}</p>
      
      {benchmark && (
        <div className="benchmark">
          <div className="benchmark-bar">
            <span className="min">{benchmark.min}</span>
            <div className="indicator" style={{ left: `${getPosition(value, benchmark)}%` }} />
            <span className="optimal">{benchmark.optimal}</span>
            <span className="max">{benchmark.max}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Functions
function getStatus(
  value: number, 
  benchmark: { min: number; optimal: number; max: number },
  invertColors: boolean
): 'good' | 'warning' | 'bad' {
  const isInRange = value >= benchmark.min && value <= benchmark.max;
  const isOptimal = Math.abs(value - benchmark.optimal) / benchmark.optimal < 0.1;
  
  if (invertColors) {
    if (value > benchmark.max) return 'bad';
    if (value < benchmark.min) return 'good';
    if (isOptimal) return 'good';
    return 'warning';
  } else {
    if (value < benchmark.min || value > benchmark.max) return 'bad';
    if (isOptimal) return 'good';
    return 'warning';
  }
}

function getPosition(
  value: number,
  benchmark: { min: number; optimal: number; max: number }
): number {
  const range = benchmark.max - benchmark.min;
  const position = ((value - benchmark.min) / range) * 100;
  return Math.max(0, Math.min(100, position));
}
```

### Datentypen

```typescript
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
  timestamp: Date;
}
```

---

Icon Kennzahl Herleitung (Formel) Beschreibung
💧 Liquidität 1. Grades (Cash Ratio) Flüssige Mittel / kurzfr. Verbindlichkeiten × 100 % Fähigkeit, kurzfristige Schulden nur mit Kasse/Bank zu begleichen.
💧 Liquidität 2. Grades (Quick Ratio) (Flüssige Mittel + kurzfr. Forderungen) / kurzfr. Verbindlichkeiten × 100 % Kurzfristige Zahlungsfähigkeit ohne Lagerbestände.
💧 Liquidität 3. Grades (Current Ratio) Umlaufvermögen / kurzfr. Verbindlichkeiten × 100 % Allgemeine kurzfristige Deckungskraft.
🧰 Working Capital Umlaufvermögen − kurzfr. Verbindlichkeiten Netto-Umlaufvermögen; Puffer für den Betrieb.
💸 Operativer Cashflow (indirekt) Periodenergebnis + Abschreibungen ± ΔWC-Posten Innenfinanzierungskraft aus laufendem Geschäft.
💸 Free Cashflow Operativer CF − Investitionsauszahlungen (Capex) Liquider Überschuss nach Investitionen.
⏱️ Cash Conversion Cycle (CCC) DSO + DIO − DPO Dauer vom Geldeinsatz bis Geldeingang.
📬 Debitorenlaufzeit (DSO) (Ø Ford. a. L. u. L. / Umsatz) × 365 Tage bis Zahlungseingang von Kunden.
📤 Kreditorenlaufzeit (DPO) (Ø Verb. a. L. u. L. / Wareneinsatz) × 365 Tage der Lieferantenkreditnutzung.
📦 Lagerreichweite (DIO) (Ø Vorräte / Wareneinsatz) × 365 Ø Lagerdauer in Tagen.
📦 Vorratsumschlag Wareneinsatz / Ø Vorräte Wie oft das Lager pro Jahr „sich dreht“.
🔄 Kapitalumschlag Umsatz / Ø Gesamtkapital Effizienz der Kapitalnutzung.
🌐 Gesamtkapitalrentabilität (ROA) (Jahresüberschuss + FK-Zinsen) / Ø Gesamtkapital × 100 % Verzinsung des gesamten eingesetzten Kapitals.
🏦 Eigenkapitalrentabilität (ROE) Jahresüberschuss / Ø Eigenkapital × 100 % Rendite für die Eigentümer.
⚙️ EBIT-Marge EBIT / Umsatz × 100 % Operative Ertragskraft vor Zinsen/Steuern.
⚙️ EBITDA-Marge EBITDA / Umsatz × 100 % Operative Marge vor Abschreibungen.
💶 Umsatzrendite (ROS) Jahresüberschuss / Umsatz × 100 % Nettogewinn je Umsatz-Euro.
🔁 ROCE EBIT / (Gesamtkapital − kurzfr. Verb.) × 100 % Rendite auf gebundenes, langfristiges Kapital.
🔄 ROI (DuPont) (Gewinn/Umsatz) × (Umsatz/Gesamtkapital) × 100 % Zerlegt Rendite in Marge × Umschlag.
➕ Economic Value Added (EVA) NOPAT − (WACC × Capital Employed) Wertbeitrag nach Kapitalkosten.
🧮 NOPAT EBIT × (1 − Steuersatz) Operatives Ergebnis nach Steuern.
🧱 Eigenkapitalquote Eigenkapital / Gesamtkapital × 100 % Anteil EK an der Bilanzsumme.
🧱 Fremdkapitalquote Fremdkapital / Gesamtkapital × 100 % Anteil FK an der Bilanzsumme.
🧱 Verschuldungsgrad Fremdkapital / Eigenkapital × 100 % Hebelwirkung durch Fremdkapital.
🧱 Anlagendeckungsgrad I Eigenkapital / Anlagevermögen × 100 % Deckt EK das AV? (Goldene Bilanzregel eng)
🧱 Anlagendeckungsgrad II (Eigenkapital + langfr. FK) / Anlagevermögen × 100 % Langfristige Mittel decken langfristige Güter.
📉 Net Debt (Nettoverschuldung) verzinsl. FK − liquide Mittel Schuldenposition nach Abzug der Kasse.
📉 Gearing Net Debt / Eigenkapital × 100 % Nettoverschuldung im Verhältnis zum EK.
🛡️ Zinsdeckungsgrad EBIT / Zinsaufwand Fähigkeit, Zinsen zu bedienen.
🏭 Anlagenintensität Anlagevermögen / Gesamtkapital × 100 % Kapitalbindung in Anlagen.
👥 Umsatz je Mitarbeiter Umsatz / Ø Mitarbeiterzahl Produktivität des Personals (grobe Kennzahl).
👷 Arbeitsproduktivität Outputmenge / Arbeitsstunden Effizienz der Arbeitsleistung.
🏭 OEE (Gesamtanlageneffizienz) Verfügbarkeit × Leistung × Qualität Produktionskennzahl (Fertigungsumfeld).
🧾 Materialkostenquote Materialaufwand / Umsatz × 100 % Materialanteil am Umsatz.
👥 Personalaufwandsquote Personalaufwand / Umsatz × 100 % Personalkostenanteil am Umsatz.
📌 Fixkostenanteil Fixkosten / Gesamtkosten × 100 % Kostenstruktur (Fix vs. variabel).
➗ Deckungsbeitrag (DB) Umsatz − variable Kosten Betrag zur Deckung von Fixkosten/Gewinn.
➗ DB-Marge DB / Umsatz × 100 % Anteil des Umsatzes, der Fixkosten/Gewinn deckt.
🎯 Stückdeckungsbeitrag Verkaufspreis − var. Stückkosten DB pro Einheit.
⚖️ Break-even-Menge Fixkosten / (Preis − var. Stückkosten) Absatzmenge ohne Gewinn/Verlust.
⚖️ Break-even-Umsatz Fixkosten / DB-Marge Umsatzschwelle ohne Gewinn/Verlust.
🛟 Sicherheitskoeffizient (Ist-Umsatz − BE-Umsatz) / Ist-Umsatz × 100 % Puffer bis zum Break-even.
🔧 Oper. Hebel (DOL) DB / EBIT (Annäherung) Ergebnisempfindlichkeit ggü. Umsatzänderung.
📈 Umsatzwachstum (Umsatz*t − Umsatz*{t−1}) / Umsatz\_{t−1} × 100 % Periodisches Wachstum der Erlöse.
🧮 Bruttomarge (Umsatz − Wareneinsatz) / Umsatz × 100 % Rohmarge (Handel/Produktion).
🧮 Nettomarge Jahresüberschuss / Umsatz × 100 % Endmarge nach allen Aufwänden/Steuern.
📊 KGV (P/E)_ Kurs je Aktie / Gewinn je Aktie Bewertungskennzahl (börsennotiert).
📘 KBV (P/B)_ Kurs je Aktie / Buchwert je Aktie Marktbewertung ggü. Buchwert.
🧾 KUV (P/S)_ Kurs je Aktie / Umsatz je Aktie Bewertung relativ zum Umsatz.
🏷️ EV/EBITDA_ Unternehmenswert / EBITDA Kapitalstruktur-neutrale Bewertung.
💠 Dividendenrendite\* Dividende je Aktie / Kurs × 100 % Cash-Rendite für Aktionäre.
⏳ Amortisationsdauer Investition / jährl. Rückflüsse Zeit bis Rückfluss der Investition.
📉 Kapitalwert (NPV) Σ (CF_t / (1+r)^t) − Anfangsinvestition Barwert der Investition (r = Kalk.-zins).
📈 Interner Zinsfuß (IRR) r mit NPV = 0 Rendite der Zahlungsreihe.
🚑 Fehlzeitenquote Fehlzeiten / Soll-Arbeitszeit × 100 % Abwesenheitsanteil (HR-Kennzahl).
🔁 Fluktuationsrate Austritte / Ø Personalbestand × 100 % Personalwechsel (HR-Kennzahl).
