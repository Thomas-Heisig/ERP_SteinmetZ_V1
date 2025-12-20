# Reporting & Analytics Module

Umfassendes Reporting-System mit Standard-Berichten, Ad-hoc-Analysen, KI-gestützten Insights und Dashboard-KPIs für das ERP SteinmetZ System.

**Version:** 1.0.0  
**Letzte Aktualisierung:** 2025-12-20  
**Status:** ✅ Production Ready

---

## Inhaltsverzeichnis

- [Überblick](#überblick)
- [Features](#features)
- [Architektur](#architektur)
- [API-Endpoints](#api-endpoints)
  - [Standard-Reports] (#standard-reports)
  - [Ad-hoc-Analysen] (#ad-hoc-analysen-1)
  - [KI-Analytics] (#ki-analytics-1)
  - [Dashboard-KPIs] (#dashboard-kpis-1)
- [TypeScript-Typen](#typescript-typen)
- [Verwendung](#verwendung)
- [Best Practices](#best-practices)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)

---

## Überblick

Das Reporting-Modul bietet eine zentrale Schnittstelle für alle Reporting- und Analytics-Anforderungen im ERP-System. Es kombiniert:

- **Standard-Reports:** Vordefinierte Finanz-, Vertriebs-, Produktions-, HR- und Lagerberichte
- **Ad-hoc-Analysen:** Flexibles Query-System für benutzerdefinierte Auswertungen
- **KI-Analytics:** ML-basierte Vorhersagen, Insights und Trend-Analysen
- **Dashboard-KPIs:** Echtzeit-Kennzahlen für Management-Dashboards

### Kernkomponenten

| Komponente | Pfad | Verantwortlichkeit |
| -----------|------| -------------------|

| Router | `reportingRouter.ts` | HTTP-Endpoints und Request-Validierung |
| Service | `reportingService.ts` | Business-Logik und Daten-Aggregation |
| Tests | `reportingRouter.test.ts` | Unit- und Integration-Tests |
| Docs | `docs/README_NEW.md` | Dokumentation und Beispiele |

---

## Features

### ✅ Standard-Reports

- **Finanzberichte:**
  - Bilanz (Balance Sheet)
  - Gewinn- und Verlustrechnung (P&L)
  - Cashflow-Rechnung
  - Zeiträume: Monat, Quartal, Jahr

- **Vertriebsberichte:**
  - Umsatzanalyse mit Zielvergleich
  - Top-Kunden und -Produkte
  - Regionale Verteilung
  - Konversionsraten

- **Produktionsberichte:**
  - OEE (Overall Equipment Effectiveness)
  - Ausfallzeiten-Analyse
  - Produktionsmengen und -effizienz
  - Produktübersicht

- **Personalberichte:**
  - Headcount und Abteilungsübersicht
  - Anwesenheitsquoten
  - Überstunden-Tracking
  - Mitarbeiter-Auslastung

- **Lagerberichte:**
  - Bestandsbewertung
  - Umschlagshäufigkeit
  - Lagerbewegungen
  - Bestandsstatus (OK, niedrig, Überbestand)

### ✅ Ad-hoc-Analysen

- Flexibles Query-System mit:
  - Datenquellen-Auswahl
  - Dimensionen und Measures
  - Filter-Operatoren (eq, ne, gt, lt, gte, lte, in, like)
  - Gruppierung und Sortierung
  - Limit-Support
- Speichern von Analysen
- Geplante Ausführung (TODO)
- E-Mail-Versand (TODO)

### ✅ KI-Analytics

- **Vorhersagen:**
  - Umsatz-Forecast (Monat/Quartal)
  - Bedarfs-Prognose
  - Churn-Risiko-Bewertung

- **Insights:**
  - Chancen (Opportunities)
  - Risiken (Risks)
  - Optimierungspotenziale

- **Trend-Analysen:**
  - Automatische Trend-Erkennung
  - Confidence-Scores
  - Einflussfaktoren
  - Alert-System

### ✅ Dashboard-KPIs

- Echtzeit-Kennzahlen mit:
  - Aktueller Wert
  - Änderung gegenüber Vorperiode
  - Trend-Indikator
  - Zielvergleich
  - Status-Ampel (good, warning, critical)

---

## Architektur

### Schichtenmodell

```chart
┌─────────────────────────────────────┐
│  HTTP Layer (reportingRouter.ts)   │  ← Request/Response, Validation
├─────────────────────────────────────┤
│ Business Layer (reportingService.ts)│  ← Logik, Berechnung, Aggregation
├─────────────────────────────────────┤
│   Data Layer (dbService.ts)         │  ← SQLite-Zugriff
└─────────────────────────────────────┘
```

### Datenfluss

```sequence
Client Request
     ↓
Router (Validation mit Zod)
     ↓
Service (Business-Logik)
     ↓
Database (SQL-Queries)
     ↓
Service (Daten-Transformation)
     ↓
Router (Response-Formatting)
     ↓
Client Response
```

### Fehlerbehandlung

- **Router-Layer:** Validierungs-Fehler (400 Bad Request)
- **Service-Layer:** Business-Logik-Fehler (404 Not Found, 409 Conflict)
- **Middleware:** Globale Fehlerbehandlung (500 Internal Server Error)
- **Logging:** Strukturiertes Logging mit Pino

---

## API-Endpoints

### Standard-Reports

#### GET /api/reporting/financial

Finanzberichte-Übersicht abrufen.

**Query-Parameter:**

| Parameter | Typ | Optional | Beschreibung |
|-----------|-----|----------|--------------|

| `period` | string | ✅ | Berichtszeitraum (current_month, last_month, quarter, year) |
| `year` | number | ✅ | Jahr (Standard: aktuelles Jahr) |

**Response:**

```typescript
{
  period: "current_month",
  year: 2025,
  reports: [
    {
      name: "Bilanz",
      type: "balance_sheet",
      date: "2025-12-31",
      available: true
    },
    {
      name: "Gewinn- und Verlustrechnung",
      type: "pnl",
      date: "2025-12-31",
      available: true
    }
  ]
}
```

**Beispiel:**

```bash
curl -X GET "http://localhost:3000/api/reporting/financial?period=quarter&year=2025" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### GET /api/reporting/financial/:type

Spezifischen Finanzbericht abrufen.

**Path-Parameter:**

| Parameter | Typ    | Beschreibung                              |
|-----------|-----   |--------------                             |
| `type`    | string | Report-Typ (pnl, balance_sheet, cashflow) |

**Query-Parameter:**

| Parameter | Typ    | Optional | Beschreibung |
|-----------|-----   |----------|--------------|
| `year`    | number | ❌       | Jahr         |
| `month`   | number | ✅       | Monat (1-12) |

**Response (P&L):**

```typescript
{
  type: "pnl",
  period: "2025-12",
  data: {
    revenue: {
      sales: 450000,
      other_income: 12000,
      total: 462000
    },
    expenses: {
      materials: 180000,
      personnel: 120000,
      operating: 45000,
      depreciation: 15000,
      total: 360000
    },
    ebit: 102000,
    financial_result: -3000,
    ebt: 99000,
    taxes: 19800,
    net_income: 79200
  }
}
```

---

## TypeScript-Typen

### FinancialReport

```typescript
interface FinancialReport {
  period: string;
  year: number;
  reports: {
    name: string;
    type: "balance_sheet" | "pnl" | "cashflow";
    date: string;
    available: boolean;
  }[];
}
```

### PnLReport

```typescript
interface PnLReport {
  type: "pnl";
  period: string;
  data: {
    revenue: {
      sales: number;
      other_income: number;
      total: number;
    };
    expenses: {
      materials: number;
      personnel: number;
      operating: number;
      depreciation: number;
      total: number;
    };
    ebit: number;
    financial_result: number;
    ebt: number;
    taxes: number;
    net_income: number;
  };
}
```

### SalesReport

```typescript
interface SalesReport {
  period: string;
  revenue: {
    total: number;
    change_percent: number;
    target: number;
    achievement_percent: number;
  };
  orders: {
    count: number;
    average_value: number;
    conversion_rate: number;
  };
  top_customers: Array<{
    name: string;
    revenue: number;
    orders: number;
  }>;
  top_products: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  by_region: Array<{
    region: string;
    revenue: number;
    percentage: number;
  }>;
}
```

### ProductionReport

```typescript
interface ProductionReport {
  period: string;
  output: {
    units_produced: number;
    target: number;
    achievement_percent: number;
  };
  efficiency: {
    oee: number;
    availability: number;
    performance: number;
    quality: number;
  };
  downtime: {
    total_hours: number;
    planned: number;
    unplanned: number;
    reasons: Array<{
      reason: string;
      hours: number;
    }>;
  };
  by_product: Array<{
    product: string;
    quantity: number;
    percentage: number;
  }>;
}
```

### AdhocQuery

```typescript
interface AdhocQuery {
  name: string;
  datasource: string;
  dimensions: string[];
  measures: string[];
  filters?: Array<{
    field: string;
    operator: "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "in" | "like";
    value: any;
  }>;
  groupBy?: string[];
  orderBy?: Array<{
    field: string;
    direction: "asc" | "desc";
  }>;
  limit?: number;
}
```

### DashboardKPIs

```typescript
interface DashboardKPIs {
  revenue: {
    value: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
  profit_margin: {
    value: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
  customer_satisfaction: {
    value: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
  delivery_performance: {
    value: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
  production_efficiency: {
    value: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
  employee_utilization: {
    value: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
}
```

---

## Verwendung

### Service-Integration

```typescript
import { reportingService } from "./reportingService.js";

// Standard-Report abrufen
const salesReport = await reportingService.getSalesReport();

// Ad-hoc-Analyse ausführen
const adhocResult = await reportingService.executeAdhocAnalysis({
  name: "Top Customers",
  datasource: "sales",
  dimensions: ["customer"],
  measures: ["revenue"],
  orderBy: [{ field: "revenue", direction: "desc" }],
  limit: 10,
});

// KI-Vorhersagen abrufen
const predictions = await reportingService.getAIPredictions();
```

### Frontend-Integration

```typescript
// React Hook für Dashboard-KPIs
import { useQuery } from "@tanstack/react-query";

function useDashboardKPIs() {
  return useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: async () => {
      const response = await fetch("/api/reporting/dashboard-kpis", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
    refetchInterval: 60000, // Aktualisierung alle 60 Sekunden
  });
}
```

---

## Best Practices

### 1. Caching

```typescript
// Service-Level Caching für häufig abgerufene Reports
const cache = new Map<string, { data: any; expires: number }>();

function getCachedReport<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 300000
): Promise<T> {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return Promise.resolve(cached.data);
  }

  return fetchFn().then((data) => {
    cache.set(key, { data, expires: Date.now() + ttl });
    return data;
  });
}
```

### 2. Fehlerbehandlung

```typescript
async function safelyFetchReport<T>(
  fetchFn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    logger.error({ error }, "Failed to fetch report");
    return fallback;
  }
}
```

---

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from "vitest";
import { reportingService } from "./reportingService.js";

describe("ReportingService", () => {
  describe("getSalesReport", () => {
    it("should return sales report with all metrics", async () => {
      const report = await reportingService.getSalesReport();

      expect(report).toBeDefined();
      expect(report.revenue).toHaveProperty("total");
      expect(report.orders).toHaveProperty("count");
      expect(report.top_customers).toBeInstanceOf(Array);
    });
  });
});
```

---

## Troubleshooting

### Problem: Leere Reports

**Symptom:** Reports enthalten keine Daten.

**Lösung:**

```typescript
const rowCount = await db.get(
  "SELECT COUNT(*) as count FROM sales WHERE date >= ?",
  [startDate]
);

if (rowCount.count === 0) {
  logger.warn({ startDate }, "No data found for period");
}
```

### Problem: Langsame Queries

**Symptom:** Ad-hoc-Analysen dauern >5 Sekunden.

**Lösung:**

```sql
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_customer ON sales(customer_id);
```

---

## Changelog

### Version 1.0.0 (2025-12-20)

**✅ Neue Features:**

- Vollständige Service-Layer-Implementierung
- Strukturiertes Logging mit Pino
- Umfassende JSDoc-Dokumentation
- TypeScript-Typen für alle Reports
- Validierung mit Zod
- Production-ready Code-Qualität

**🔧 Verbesserungen:**

- Trennung von Business-Logik und HTTP-Layer
- Konsistente Fehlerbehandlung
- Umfassende Test-Coverage

---

**Letzte Aktualisierung:** 2025-12-20  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
