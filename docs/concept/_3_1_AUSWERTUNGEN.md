## 🔧 Technische Implementierung der Auswertungen

### Backend-API-Endpunkte

Alle Auswertungen sind über RESTful API-Endpunkte zugänglich:

```
GET /api/finance/reports/:reportType?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

#### Verfügbare Reports

| Report Type          | Endpoint                              | Query Parameter                                    |
| -------------------- | ------------------------------------- | -------------------------------------------------- |
| Bilanz               | `/api/finance/reports/balance-sheet`  | `date` (Stichtag)                                  |
| GuV                  | `/api/finance/reports/profit-loss`    | `startDate`, `endDate`                             |
| Kapitalflussrechnung | `/api/finance/reports/cash-flow`      | `startDate`, `endDate`, `method` (direct/indirect) |
| Anhang               | `/api/finance/reports/notes`          | `year`                                             |
| Summen-Saldenliste   | `/api/finance/reports/trial-balance`  | `startDate`, `endDate`                             |
| Anlagenspiegel       | `/api/finance/reports/asset-register` | `year`                                             |
| Segmentbericht       | `/api/finance/reports/segment`        | `startDate`, `endDate`, `segment`                  |
| Fälligkeitsstruktur  | `/api/finance/reports/aging`          | `date`, `type` (receivables/payables)              |

### Report-Datenstrukturen

```typescript
// Balance Sheet Response
interface BalanceSheetReport {
  date: Date;
  standard: "HGB" | "IFRS" | "US-GAAP";
  assets: {
    fixedAssets: {
      intangibleAssets: number;
      tangibleAssets: number;
      financialAssets: number;
      total: number;
    };
    currentAssets: {
      inventory: number;
      receivables: number;
      cash: number;
      total: number;
    };
    total: number;
  };
  liabilitiesAndEquity: {
    equity: {
      capital: number;
      reserves: number;
      retainedEarnings: number;
      total: number;
    };
    liabilities: {
      longTerm: number;
      shortTerm: number;
      total: number;
    };
    total: number;
  };
}

// Profit & Loss Statement
interface ProfitLossReport {
  startDate: Date;
  endDate: Date;
  method: "total-cost" | "cost-of-sales";
  revenue: number;
  costOfGoodsSold?: number;
  grossProfit?: number;
  operatingExpenses: {
    personnel: number;
    depreciation: number;
    other: number;
    total: number;
  };
  operatingIncome: number;
  financialResult: {
    interest: number;
    other: number;
    total: number;
  };
  earningsBeforeTax: number;
  incomeTax: number;
  netIncome: number;
}

// Cash Flow Statement
interface CashFlowReport {
  startDate: Date;
  endDate: Date;
  method: "direct" | "indirect";
  operatingActivities: {
    netIncome?: number;
    adjustments?: {
      depreciation: number;
      changeInReceivables: number;
      changeInPayables: number;
      other: number;
    };
    cashReceipts?: number;
    cashPayments?: number;
    net: number;
  };
  investingActivities: {
    acquisitions: number;
    disposals: number;
    net: number;
  };
  financingActivities: {
    equity: number;
    debt: number;
    dividends: number;
    net: number;
  };
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
}

// Aging Report (Fälligkeitsstruktur)
interface AgingReport {
  date: Date;
  type: "receivables" | "payables";
  buckets: {
    current: { count: number; amount: number };
    days1to30: { count: number; amount: number };
    days31to60: { count: number; amount: number };
    days61to90: { count: number; amount: number };
    over90: { count: number; amount: number };
  };
  total: { count: number; amount: number };
  topItems: Array<{
    id: string;
    name: string;
    amount: number;
    daysOverdue: number;
  }>;
}
```

### Report-Generierung Backend

```typescript
// apps/backend/src/services/reportService.ts
export class ReportService {
  // Bilanz generieren
  async generateBalanceSheet(
    date: Date,
    standard: string,
  ): Promise<BalanceSheetReport> {
    // 1. Alle Konten mit Salden abrufen
    const accounts = await db.getAccountsWithBalances(date);

    // 2. Nach Kontenklassen gruppieren
    const groupedAccounts = this.groupAccountsByClass(accounts, standard);

    // 3. Summen bilden
    const assets = this.calculateAssets(groupedAccounts);
    const liabilities = this.calculateLiabilitiesAndEquity(groupedAccounts);

    return {
      date,
      standard,
      assets,
      liabilitiesAndEquity: liabilities,
    };
  }

  // GuV generieren
  async generateProfitLoss(
    startDate: Date,
    endDate: Date,
  ): Promise<ProfitLossReport> {
    // 1. Alle Ertrags- und Aufwandskonten im Zeitraum
    const transactions = await db.getTransactions(startDate, endDate);

    // 2. Nach Kontenart summieren
    const revenue = this.sumByAccountType(transactions, "revenue");
    const expenses = this.sumByAccountType(transactions, "expense");

    // 3. GuV-Struktur aufbauen
    return {
      startDate,
      endDate,
      revenue,
      operatingExpenses: this.calculateOperatingExpenses(expenses),
      operatingIncome: revenue - expenses.operating,
      // ... weitere Berechnungen
    };
  }

  // Kapitalflussrechnung (indirekte Methode)
  async generateCashFlow(
    startDate: Date,
    endDate: Date,
  ): Promise<CashFlowReport> {
    // 1. Periodenergebnis aus GuV
    const plStatement = await this.generateProfitLoss(startDate, endDate);

    // 2. Anpassungen (nicht-zahlungswirksame Vorgänge)
    const depreciation = await db.getDepreciation(startDate, endDate);
    const changeInWC = await this.calculateWorkingCapitalChange(
      startDate,
      endDate,
    );

    // 3. Investitions- und Finanzierungstätigkeit
    const investing = await this.calculateInvestingCashFlow(startDate, endDate);
    const financing = await this.calculateFinancingCashFlow(startDate, endDate);

    return {
      startDate,
      endDate,
      method: "indirect",
      operatingActivities: {
        netIncome: plStatement.netIncome,
        adjustments: {
          depreciation,
          changeInReceivables: changeInWC.receivables,
          changeInPayables: changeInWC.payables,
          other: 0,
        },
        net: plStatement.netIncome + depreciation + changeInWC.total,
      },
      investingActivities: investing,
      financingActivities: financing,
      // ... Summenbildung
    };
  }
}
```

### Frontend-Komponenten

```typescript
// Bilanzansicht
import { useEffect, useState } from 'react';
import { financeApi } from '@/api/finance';

export function BalanceSheetView() {
  const [report, setReport] = useState<BalanceSheetReport | null>(null);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    financeApi.getBalanceSheet(date).then(setReport);
  }, [date]);

  if (!report) return <Loading />;

  return (
    <div className="balance-sheet">
      <h2>Bilanz zum {formatDate(report.date)}</h2>

      <div className="two-columns">
        {/* Aktiva */}
        <div className="assets">
          <h3>Aktiva</h3>
          <section>
            <h4>Anlagevermögen</h4>
            <div className="line">
              <span>Immaterielle Vermögensgegenstände</span>
              <span>{formatCurrency(report.assets.fixedAssets.intangibleAssets)}</span>
            </div>
            {/* ... weitere Positionen */}
          </section>
        </div>

        {/* Passiva */}
        <div className="liabilities">
          <h3>Passiva</h3>
          {/* ... Eigenkapital & Schulden */}
        </div>
      </div>
    </div>
  );
}

// GuV-Ansicht
export function ProfitLossView() {
  // Ähnliche Struktur wie BalanceSheet
  // Mit Zeitraumauswahl (startDate/endDate)
}

// Fälligkeitsanalyse
export function AgingReportView() {
  const [report, setReport] = useState<AgingReport | null>(null);

  return (
    <div className="aging-report">
      <h2>Fälligkeitsstruktur Forderungen</h2>

      <div className="buckets">
        <div className="bucket">
          <h3>Aktuell (nicht fällig)</h3>
          <p>{report?.buckets.current.count} Positionen</p>
          <p>{formatCurrency(report?.buckets.current.amount)}</p>
        </div>

        <div className="bucket warning">
          <h3>1-30 Tage überfällig</h3>
          <p>{report?.buckets.days1to30.count} Positionen</p>
          <p>{formatCurrency(report?.buckets.days1to30.amount)}</p>
        </div>

        {/* ... weitere Buckets */}
      </div>

      <table className="top-items">
        <thead>
          <tr>
            <th>Kunde</th>
            <th>Betrag</th>
            <th>Tage überfällig</th>
          </tr>
        </thead>
        <tbody>
          {report?.topItems.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{formatCurrency(item.amount)}</td>
              <td>{item.daysOverdue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Export-Funktionen

```typescript
// PDF-Export
export async function exportReportAsPDF(
  reportType: string,
  data: any,
): Promise<Blob> {
  // PDF-Generierung mit pdfmake oder ähnlicher Library
  const pdfDoc = createPDFDocument(reportType, data);
  return pdfDoc.toBlob();
}

// Excel-Export
export async function exportReportAsExcel(
  reportType: string,
  data: any,
): Promise<Blob> {
  // Excel-Generierung mit xlsx oder ähnlicher Library
  const workbook = createExcelWorkbook(reportType, data);
  return workbook.toBlob();
}

// CSV-Export
export function exportReportAsCSV(reportType: string, data: any): string {
  // CSV-String generieren
  return convertToCSV(data);
}
```

---

Icon Auswertung Herleitung (Datenbasis/Methodik) Beschreibung
📘 Bilanz Abschlussbuchungen; Saldierung aller Konten; Gliederung nach HGB/IFRS Vermögens-, Finanz- und Kapitalstruktur zum Stichtag.
📄 Gewinn- und Verlustrechnung (GuV) Gesamtkosten- oder Umsatzkostenverfahren Periodenerfolg aus Erträgen/Aufwendungen.
💧 Kapitalflussrechnung Direkt (Ein-/Auszahlungen) oder indirekt (vom Periodenergebnis) Zahlungsströme aus operativer, Investitions-, Finanzierungstätigkeit.
🧾 Anhang Aufbereitung aus Hauptbuch/Anlagenbuch/Verträgen Erläuternde Angaben zu Bilanz/GuV/­KFR.
📝 Lagebericht Aus Management-Infos, Planungen, Risikoberichten Lage, Chancen/Risiken, Prognose.
🧱 Eigenkapitalspiegel EK-Bewegungen aus Bilanzkonten Entwicklung der EK-Komponenten.
🏭 Anlagenspiegel Anlagenbuchhaltung (Zugänge/Abgänge/Afa) Entwicklung des Anlagevermögens.
🧩 Segmentbericht ERP/CO nach Segmentlogik Ergebnisse/Vermögen nach Segmenten.
🧮 Steuerüberleitung/latente Steuern Handels- vs. Steuerbilanz; temporäre Differenzen Abgleich Steueraufwand ↔ Steuerzahlungen.
🔄 HGB-/IFRS-Überleitung Mapping lokaler GAAP → IFRS Effekte aus Bewertungs-/Darstellungsunterschieden.
🧠 ESEF/XBRL-Paket Abschlussdaten + Taxonomie-Tagging Digitales Abschluss-Reporting.
🌍 ESG/CSRD-Report ESRS-KPI aus Fachsystemen (Energie, HR, Einkauf) Nachhaltigkeitskennzahlen und Narrative.
🌫️ CO₂-Bilanz (GHG) Aktivitätsdaten × Emissionsfaktoren (Scopes 1-3) Treibhausgas-Fußabdruck.
💼 Konsolidierung (Konzern) Kapital-/Schulden-/Ergebnis-Konsolidierung, I/C-Eliminierungen Konzernabschluss ohne Konzerninterne Effekte.
🔗 Intercompany-Abstimmung I/C-Saldenlisten; Matching & Clearing Abgleich konzerninterner Forderungen/Verbindlichkeiten.
💸 Liquiditätsstatus (täglich) Bankkonten, offene Posten, Zahlungsplan Tagesgenaue Zahlungsfähigkeit.
📆 Liquiditätsplanung (rollierend) Ein-/Auszahlungsforecast, OP-Listen, CapEx-Plan Erwartete Liquidität 13 Wochen/12 Monate.
🔁 Working-Capital-Analyse DSO/DPO/DIO; OP-Analysen; Lagerdaten Bindung/­Freisetzung kurzfristiger Mittel.
📬 Forderungsaltersstruktur Debitoren-OP, Fälligkeitsklassen Überfälligkeiten, Ausfallrisiken.
📤 Verbindlichkeitenfälligkeiten Kreditoren-OP, Zahlungsziele Ausnutzung Lieferantenkredite/Skonto.
📦 Bestands-/Inventuranalyse Lagerbuch/Inventur; Reichweiten; Schwund Qualität und Höhe der Vorräte.
📈 DuPont-Analyse Zerlegung ROI = Marge × Umschlag Treiberbaum für Rendite.
🧭 Kennzahlen-Dashboard/BSC KPI-Set (Finanzen, Kunde, Prozesse, Lernen) Verdichtete Steuerungsgrößen.
🎯 Budget (Plan) Top-down/Bottom-up; Annahmen-Set Geplanter Jahresrahmen Finanzen/Leistung.
🔄 Rollierender Forecast Aktualisierte Annahmen/Run-Rates Erwartete Jahresergebnisse unter neuen Daten.
⚖️ Soll-Ist-Abweichungsanalyse Plan/Forecast vs. Ist; Varianztreiber Aufklärung von Mengen-/Preis-/Mix-Effekten.
🧪 Sensitivitätsanalyse ceteris-paribus-Variation von Treibern Ergebnisänderung bei Parameter-Schwankung.
📚 Szenarioanalyse Best-/Base-/Worst-Case-Sets Ergebnisbandbreiten, Risikopuffer.
➗ Deckungsbeitragsrechnung (MSt.) Mehrstufige DB-Rechnung (Produkt/Kunde/Sparte) Profitabilität nach Verantwortlichkeiten.
🧮 Break-even-Analyse Fixkosten, var. Kosten, Preis Verlustfreie Menge/Umsatz.
🏷️ Preis-Mengen-Mix-Analyse Absatz/Preislisten/DB je Einheit Quellen der Umsatz-/DB-Veränderung.
🧾 Produktkalkulation Zuschlags-/Maschinenstundensatz/Prozesskosten Herstell-/Selbstkosten, Preisuntergrenzen.
⚙️ Prozesskostenrechnung (ABC) Aktivitäten, Kostentreiber, Cost Pools Verursachungsgerechte Gemeinkosten.
📊 Plankostenrechnung Starre/flexible Plankosten; Soll-Kosten Kostenkontrolle je Beschäftigungsgrad.
🗺️ Betriebsabrechnungsbogen (BAB) Gemeinkostenverteilung auf Kostenstellen Grundlage für Zuschlagsätze/CO.
🏢 Kostenstellen-/Kostenträgerrechnung Primär-/Sekundärkosten, Umlagen Transparenz von Kostenverursachern.
🧩 Profit-Center-Rechnung Internes Ergebnis nach Verantwortungseinheiten Dezentraler Ergebnisnachweis.
👥 Kundendeckungsbeitrag Umsatz, Rabatte, Servicekosten je Kunde Kundenprofitabilität/Segmentsteuerung.
🧰 Projektcontrolling Projektstruktur, Budgets, Leistungsfortschritt Termin-, Kosten-, Ergebnisüberwachung.
🚧 Engpassrechnung (TOC) Kapazitätsdaten, DB je Engpassminute Steuerung nach Bottleneck-Rendite.
🛒 ABC/XYZ-Analyse Umsatz/Verbrauchsdaten Bedeutung (ABC) und Verbrauchsregularität (XYZ).
🔧 Make-or-Buy Kostenvergleich, Kapazität, Risiko Eigenfertigung vs. Fremdbezug.
💼 Investitionsrechnung NPV/IRR/Amortisation; Cashflows Vorteilhaftigkeit von Investitionen.
🧱 CapEx/OpEx-Analyse Anlagenbuch/Projektlisten, GuV Investive vs. laufende Aufwendungen.
🧾 Margenbaum Umsatz → Roh-/DB-/EBIT-Stufen Transparenz der Ergebnishebel.
🧩 Transferpreis-Analyse Interne Verrechnungssätze, Marktpreise Preislogik zwischen Einheiten.
🧮 Bonitäts-/Covenant-Monitoring Kennzahlen aus Abschluss/Planung Früherkennung von Verletzungsrisiken.
🛡️ IKS/Compliance-Report (GoBD etc.) Kontrollen, Prüfpunkte, Prozessdokumentation Wirksamkeit interner Kontrollen.
🔍 Audit-Trail/Abschluss-Checkliste Journale, Freigaben, Abstimmungen Nachvollziehbarkeit/Abschlussqualität.
🧭 Benchmark/Peer-Vergleich Öffentliche Abschlüsse/Marktdaten Leistung im Branchenvergleich.
🧑‍🤝‍🧑 Vertriebs-/Pipeline-Report CRM-Daten, Conversion, Hit-Rates Vorlauf für Umsatz/DB.
🔁 CCC-Report DSO/DIO/DPO-Verläufe Dauer Kapitalbindung im Umlaufvermögen.
📦 Preis-/Rabattpolitik-Review Transaktionsdaten, Konditionen Effekt der Konditionen auf Marge/DB.
🧲 Churn-/Kohortenanalyse (Abo) Vertrags-/Nutzungsdaten Kundenbindung, Abwanderungsraten.
⚖️ Risiko-Report Risikomatrix, Eintritts-/Schadenshöhe Top-Risiken und Maßnahmen.
🧷 Sanierungs-/Fortführungsprognose Liquiditäts-/Ergebnis-/Maßnahmenplan Beurteilung der Fortführungsfähigkeit.
