# Configuration Module

Zentrale Konfiguration für alle Frontend-Dashboard-Komponenten.

## 📋 Dateien

### `apiRoutes.ts`

Definiert **alle Backend-API-Routen** als typsichere Konstanten.

**Verwendung:**

```typescript
import { API_ROUTES, buildApiUrl } from "@/config";

// Einfacher API-Call
fetch(buildApiUrl(API_ROUTES.DASHBOARD.OVERVIEW));

// Mit Parametern
const customerId = "123";
fetch(buildApiUrl(API_ROUTES.CRM.CUSTOMER(customerId)));
```

**Features:**

- 200+ Endpoints aus 20+ Modulen
- Typsicher mit TypeScript
- Parametrisierte URLs
- Modul-Kategorisierung

---

### `dashboardConfig.ts`

Definiert **Dashboard-Widgets, Themes, Grid-System**.

**Verwendung:**

```typescript
import { DASHBOARD_WIDGETS, getWidgetConfig } from "@/config";

// Widget-Konfiguration abrufen
const widget = DASHBOARD_WIDGETS.EXECUTIVE_OVERVIEW;

// Widget-Properties
console.log(widget.apiEndpoints); // Array von API-URLs
console.log(widget.refreshInterval); // Refresh-Zeit in Sekunden
console.log(widget.gridSpan); // Grid-Spalten (1-4)
console.log(widget.permissions); // Benötigte Berechtigungen
```

**Features:**

- 13 vordefinierte Widgets
- Theme-Konfigurationen (light/dark/lcars)
- Grid-Breakpoints
- Helper-Funktionen

---

### `index.ts`

Zentrale Exports.

**Verwendung:**

```typescript
// Alles importieren
import * from "@/config";

// Oder spezifisch
import { API_ROUTES, DASHBOARD_WIDGETS } from "@/config";
```

---

## 🎯 Schnellstart

### 1. API-Call durchführen

```typescript
import { API_ROUTES, buildApiUrl } from "@/config";

async function loadDashboard() {
  const response = await fetch(buildApiUrl(API_ROUTES.DASHBOARD.OVERVIEW));
  const data = await response.json();
  return data;
}
```

### 2. Widget erstellen

```typescript
import { DASHBOARD_WIDGETS } from "@/config";

const MyWidget: React.FC = () => {
  const widget = DASHBOARD_WIDGETS.CRM_WIDGET;
  const [data, setData] = useState(null);

  useEffect(() => {
    // Alle API-Endpoints des Widgets laden
    Promise.all(
      widget.apiEndpoints.map(endpoint =>
        fetch(buildApiUrl(endpoint)).then(r => r.json())
      )
    ).then(results => {
      setData(results);
    });

    // Auto-Refresh
    const interval = setInterval(() => {
      // Refresh-Logik
    }, widget.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [widget]);

  return <div>...</div>;
};
```

### 3. Permissions prüfen

```typescript
import { DASHBOARD_WIDGETS, getWidgetsByPermissions } from "@/config";

const Dashboard: React.FC = () => {
  const userPermissions = ["crm:read", "finance:read"];

  // Nur Widgets mit passenden Permissions
  const widgets = getWidgetsByPermissions(userPermissions);

  return (
    <div>
      {widgets.map(widget => (
        <Widget key={widget.id} config={widget} />
      ))}
    </div>
  );
};
```

### 4. Theme verwenden

```typescript
import { DASHBOARD_THEMES } from "@/config";
import { useTheme } from "@/hooks/useTheme";

const ThemedComponent: React.FC = () => {
  const { theme } = useTheme(); // "light" | "dark" | "lcars"
  const colors = DASHBOARD_THEMES[theme];

  return (
    <div style={{
      background: colors.background,
      color: colors.text,
      borderColor: colors.border,
    }}>
      Content
    </div>
  );
};
```

---

## 📚 Erweiterung

### Neue API-Route hinzufügen

1. Öffne `apiRoutes.ts`
2. Füge Route zum passenden Modul hinzu:

```typescript
export const API_ROUTES = {
  // ... bestehende Module

  MY_MODULE: {
    BASE: "/api/my-module",
    LIST: "/api/my-module/items",
    ITEM: (id: string) => `/api/my-module/items/${id}`,
  },
} as const;
```

3. Aktualisiere `MODULE_CATEGORIES` falls neues Modul
4. Dokumentiere in `API_QUICK_REFERENCE.md`

### Neues Widget definieren

1. Öffne `dashboardConfig.ts`
2. Füge Widget hinzu:

```typescript
export const DASHBOARD_WIDGETS: Record<string, DashboardWidget> = {
  // ... bestehende Widgets

  MY_WIDGET: {
    id: "my-widget",
    title: "Mein Widget",
    type: "kpi", // "kpi" | "chart" | "table" | ...
    module: "my-module",
    apiEndpoints: [API_ROUTES.MY_MODULE.LIST, API_ROUTES.MY_MODULE.STATISTICS],
    refreshInterval: 180, // 3 Minuten
    gridSpan: 2, // 2 Spalten
    priority: 25, // Display-Reihenfolge
    permissions: ["my-module:read"],
  },
};
```

3. Erstelle React-Komponente in `components/Dashboard/widgets/`
4. Dokumentiere in `MIGRATION_GUIDE.md`

---

## 🔧 Helper-Funktionen

### `buildApiUrl(path: string): string`

Baut vollständige API-URL mit Base-URL.

```typescript
buildApiUrl("/api/dashboard/overview");
// → "http://localhost:3000/api/dashboard/overview"
```

### `getModuleRoutes(module: keyof typeof API_ROUTES)`

Gibt alle Routen eines Moduls zurück.

```typescript
const crmRoutes = getModuleRoutes("CRM");
// → { BASE: "/api/crm", CUSTOMERS: "/api/crm/customers", ... }
```

### `getWidgetConfig(widgetId: string)`

Findet Widget-Konfiguration nach ID.

```typescript
const widget = getWidgetConfig("executive-overview");
// → DASHBOARD_WIDGETS.EXECUTIVE_OVERVIEW
```

### `getWidgetsByModule(module: string)`

Gibt alle Widgets eines Moduls zurück.

```typescript
const crmWidgets = getWidgetsByModule("crm");
// → [DASHBOARD_WIDGETS.CRM_WIDGET]
```

### `getWidgetsByPermissions(permissions: string[])`

Filtert Widgets nach Berechtigungen.

```typescript
const widgets = getWidgetsByPermissions(["crm:read", "finance:read"]);
// → Nur Widgets mit passenden Permissions
```

### `sortWidgetsByPriority(widgets: DashboardWidget[])`

Sortiert Widgets nach Priorität.

```typescript
const sorted = sortWidgetsByPriority(allWidgets);
// → Widgets nach priority-Feld sortiert (niedrigste zuerst)
```

---

## 🎨 Konstanten

### `MODULE_CATEGORIES`

Gruppierung aller Module nach Kategorie.

```typescript
{
  CORE: ["auth", "health", "system", "dashboard"],
  ANALYTICS: ["reporting", "metrics", "search"],
  AI: ["ai", "ai-annotator", "quickchat"],
  BUSINESS: ["crm", "sales", "marketing", "projects"],
  FINANCE: ["finance", "procurement"],
  OPERATIONS: ["production", "warehouse", "inventory"],
  HR: ["hr"],
  SERVICES: ["communication", "calendar", "documents", "help"],
  ADMIN: ["rbac", "settings", "business", "innovation"],
}
```

### `REFRESH_INTERVALS`

Standard-Refresh-Intervalle in Sekunden.

```typescript
{
  REALTIME: 10,
  FAST: 30,
  NORMAL: 60,
  SLOW: 180,
  VERY_SLOW: 300,
}
```

### `GRID_CONFIG`

Responsive Grid-Konfiguration.

```typescript
{
  BREAKPOINTS: { xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 },
  COLUMNS: { xs: 1, sm: 2, md: 2, lg: 3, xl: 4, "2xl": 4 },
  GAP: { xs: 10, sm: 15, md: 20, lg: 20, xl: 20, "2xl": 24 },
}
```

### `MODULE_ICONS`

Icon-Mapping für Module.

```typescript
{
  dashboard: "📊",
  crm: "👥",
  finance: "💰",
  // ... weitere
}
```

### `STATUS_COLORS`

Standard-Farben für Status-Badges.

```typescript
{
  healthy: "#4caf50",
  warning: "#ff9800",
  critical: "#f44336",
  info: "#2196f3",
  unknown: "#9e9e9e",
}
```

---

## 📖 Weitere Dokumentation

- **Vollständige API-Referenz:** `../API_QUICK_REFERENCE.md`
- **Konsolidierungs-Doku:** `../DASHBOARD_CONSOLIDATION.md`
- **Migrations-Anleitung:** `../MIGRATION_GUIDE.md`
- **Dokumentations-Index:** `../DOCUMENTATION_INDEX.md`

---

**Version:** 1.0.0  
**Maintainer:** Development Team
