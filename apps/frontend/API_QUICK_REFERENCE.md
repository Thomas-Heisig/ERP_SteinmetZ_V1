# Dashboard API Quick Reference

## 🚀 Schnellstart

```typescript
import { API_ROUTES, DASHBOARD_WIDGETS } from "@/config";

// API-Call
const data = await fetch(API_ROUTES.DASHBOARD.OVERVIEW);

// Widget laden
const widget = DASHBOARD_WIDGETS.EXECUTIVE_OVERVIEW;
```

## 📋 Häufig genutzte Endpoints

| Modul          | Endpoint                     | Verwendung                    |
| -------------- | ---------------------------- | ----------------------------- |
| **Dashboard**  | `/api/dashboard/overview`    | Komplette Dashboard-Übersicht |
| **System**     | `/api/system`                | System-Informationen          |
| **Health**     | `/api/health`                | Gesundheitsstatus             |
| **CRM**        | `/api/crm/statistics`        | CRM-Statistiken               |
| **Finance**    | `/api/finance/revenue`       | Umsatz-Daten                  |
| **Sales**      | `/api/sales/pipeline`        | Verkaufspipeline              |
| **HR**         | `/api/hr/employees`          | Mitarbeiter-Liste             |
| **Production** | `/api/production/statistics` | Produktions-KPIs              |
| **Warehouse**  | `/api/warehouse/stock`       | Lagerbestand                  |
| **Inventory**  | `/api/inventory/low-stock`   | Niedrige Bestände             |

## 🔗 Backend-Route-Muster

### GET Requests

```typescript
// Liste mit Filterung
GET /api/{module}/{resource}?filter=value&limit=10&offset=0

// Einzelnes Item
GET /api/{module}/{resource}/{id}

// Statistiken
GET /api/{module}/statistics
```

### POST Requests

```typescript
// Erstellen
POST /api/{module}/{resource}
Body: { ...data }

// Aktionen
POST /api/{module}/{resource}/{id}/{action}
```

### PUT/PATCH Requests

```typescript
// Vollständiges Update
PUT /api/{module}/{resource}/{id}
Body: { ...data }

// Teilupdate
PATCH /api/{module}/{resource}/{id}
Body: { field: "value" }
```

### DELETE Requests

```typescript
// Löschen
DELETE / api / { module } / { resource } / { id };
```

## 📊 Widget-Konfiguration

```typescript
const DASHBOARD_WIDGETS = {
  EXECUTIVE_OVERVIEW: {
    apiEndpoints: [
      "/api/dashboard/kpis",
      "/api/finance/revenue",
      "/api/sales/statistics",
      "/api/reporting/financial",
    ],
    refreshInterval: 300, // 5 min
  },
  CRM_WIDGET: {
    apiEndpoints: ["/api/crm/statistics", "/api/crm/opportunities"],
    refreshInterval: 180, // 3 min
    permissions: ["crm:read"],
  },
  // ... weitere Widgets
};
```

## 🎯 Helper-Funktionen

```typescript
// Widget nach ID finden
const widget = getWidgetConfig("executive-overview");

// Widgets nach Modul
const crmWidgets = getWidgetsByModule("crm");

// Widgets nach Berechtigungen
const widgets = getWidgetsByPermissions(["crm:read", "finance:read"]);

// Widgets sortieren
const sorted = sortWidgetsByPriority(widgets);

// API-URL bauen
const url = buildApiUrl(API_ROUTES.DASHBOARD.OVERVIEW);
```

## 📦 Module-zu-API Mapping

| Frontend-Modul | Backend-Route      | Status |
| -------------- | ------------------ | ------ |
| Dashboard      | `/api/dashboard`   | ✅     |
| CRM            | `/api/crm`         | ✅     |
| Finance        | `/api/finance`     | ✅     |
| Sales          | `/api/sales`       | ✅     |
| HR             | `/api/hr`          | ✅     |
| Projects       | `/api/projects`    | ✅     |
| Warehouse      | `/api/warehouse`   | ✅     |
| Production     | `/api/production`  | ✅     |
| Inventory      | `/api/inventory`   | ✅     |
| Marketing      | `/api/marketing`   | ✅     |
| Procurement    | `/api/procurement` | ✅     |
| Reporting      | `/api/reporting`   | ✅     |

## 🔄 Refresh-Intervalle

```typescript
const REFRESH_INTERVALS = {
  REALTIME: 10, // Echtzeit (z.B. Alarme)
  FAST: 30, // Schnell (z.B. Lager)
  NORMAL: 60, // Normal (z.B. CRM)
  SLOW: 180, // Langsam (z.B. Berichte)
  VERY_SLOW: 300, // Sehr langsam (z.B. Analytics)
};
```

## 🎨 Themes

```typescript
// Light Theme
background: "#f5f5f5";
surface: "#ffffff";
primary: "#1976d2";

// Dark Theme
background: "#121212";
surface: "#1e1e1e";
primary: "#90caf9";

// LCARS Theme
background: "#000000";
surface: "#111111";
primary: "#ff9900";
```

## 📱 Responsive Grid

```typescript
const GRID_CONFIG = {
  BREAKPOINTS: {
    xs: 320, // Mobile
    sm: 640, // Tablet portrait
    md: 768, // Tablet landscape
    lg: 1024, // Desktop
    xl: 1280, // Large desktop
    "2xl": 1536, // Extra large
  },
  COLUMNS: {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    "2xl": 4,
  },
};
```

## ✅ Beispiel: Executive Overview

```typescript
import {
  API_ROUTES,
  DASHBOARD_WIDGETS,
  buildApiUrl
} from "@/config";

const ExecutiveOverview = () => {
  const widget = DASHBOARD_WIDGETS.EXECUTIVE_OVERVIEW;

  useEffect(() => {
    // Alle Endpoints des Widgets laden
    Promise.all(
      widget.apiEndpoints.map(endpoint =>
        fetch(buildApiUrl(endpoint)).then(r => r.json())
      )
    ).then(([kpis, revenue, sales, financial]) => {
      // Daten verarbeiten
      setData({ kpis, revenue, sales, financial });
    });
  }, []);

  return <div>/* Widget UI */</div>;
};
```

## ⚠️ Wichtige Hinweise

1. **Backend-Routen sind FEST** - Nicht ändern!
2. **Immer zentrale Config verwenden** - Keine hardcodierten URLs
3. **Refresh-Intervalle beachten** - Nicht zu oft pollen
4. **Permissions prüfen** - Widget nur mit Berechtigung anzeigen
5. **Error Handling** - Immer try-catch verwenden

## 🔍 Debugging

```typescript
// API-Call debuggen
console.log("API URL:", buildApiUrl(API_ROUTES.DASHBOARD.OVERVIEW));

// Widget-Config ausgeben
console.log("Widget Config:", getWidgetConfig("executive-overview"));

// Alle verfügbaren Widgets
console.log("All Widgets:", Object.keys(DASHBOARD_WIDGETS));

// Module-Kategorien
import { MODULE_CATEGORIES } from "@/config";
console.log("Categories:", MODULE_CATEGORIES);
```

---

**Weitere Infos:** Siehe `DASHBOARD_CONSOLIDATION.md`
