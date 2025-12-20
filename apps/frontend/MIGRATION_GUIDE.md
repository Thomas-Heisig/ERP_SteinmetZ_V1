# Migration Guide: Dashboard Consolidation

## 🎯 Ziel

Umstellung existierender Dashboard-Komponenten auf die zentrale API-Konfiguration.

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: Imports aktualisieren

#### Vorher ❌
```typescript
// Hardcoded API-Aufrufe in jeder Komponente
const Dashboard = () => {
  useEffect(() => {
    fetch("/api/dashboard/overview").then(/*...*/);
    fetch("/api/system/health").then(/*...*/);
  }, []);
};
```

#### Nachher ✅
```typescript
import { API_ROUTES, buildApiUrl } from "@/config";

const Dashboard = () => {
  useEffect(() => {
    fetch(buildApiUrl(API_ROUTES.DASHBOARD.OVERVIEW)).then(/*...*/);
    fetch(buildApiUrl(API_ROUTES.SYSTEM.HEALTH)).then(/*...*/);
  }, []);
};
```

### Schritt 2: Widget-Konfiguration nutzen

#### Vorher ❌
```typescript
const ExecutiveOverview = () => {
  const [kpis, setKpis] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [sales, setSales] = useState(null);
  
  useEffect(() => {
    // Mehrere separate API-Calls
    fetch("/api/dashboard/kpis").then(r => r.json()).then(setKpis);
    fetch("/api/finance/revenue").then(r => r.json()).then(setRevenue);
    fetch("/api/sales/statistics").then(r => r.json()).then(setSales);
  }, []);
};
```

#### Nachher ✅
```typescript
import { DASHBOARD_WIDGETS, buildApiUrl } from "@/config";

const ExecutiveOverview = () => {
  const widget = DASHBOARD_WIDGETS.EXECUTIVE_OVERVIEW;
  const [data, setData] = useState({});
  
  useEffect(() => {
    // Alle Endpoints aus Config laden
    Promise.all(
      widget.apiEndpoints.map(endpoint => 
        fetch(buildApiUrl(endpoint)).then(r => r.json())
      )
    ).then(([kpis, revenue, sales, financial]) => {
      setData({ kpis, revenue, sales, financial });
    });
    
    // Auto-Refresh mit konfiguriertem Intervall
    const interval = setInterval(() => {
      /* refresh */
    }, widget.refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [widget]);
};
```

### Schritt 3: Permissions integrieren

#### Vorher ❌
```typescript
const CRMWidget = () => {
  // Keine Permission-Prüfung
  return <div>CRM Data</div>;
};
```

#### Nachher ✅
```typescript
import { DASHBOARD_WIDGETS } from "@/config";
import { usePermissions } from "@/hooks/usePermissions";

const CRMWidget = () => {
  const widget = DASHBOARD_WIDGETS.CRM_WIDGET;
  const { hasPermissions } = usePermissions();
  
  if (!hasPermissions(widget.permissions)) {
    return <PermissionDenied />;
  }
  
  return <div>CRM Data</div>;
};
```

### Schritt 4: Grid-Layout anpassen

#### Vorher ❌
```typescript
<div style={{ gridColumn: "span 2" }}>
  <CRMWidget />
</div>
```

#### Nachher ✅
```typescript
import { DASHBOARD_WIDGETS } from "@/config";

const widget = DASHBOARD_WIDGETS.CRM_WIDGET;

<div className={`widget-span-${widget.gridSpan}`}>
  <CRMWidget />
</div>
```

### Schritt 5: Theme-System nutzen

#### Vorher ❌
```typescript
const styles = {
  background: "#ffffff",
  color: "#333333",
  // ... hardcoded colors
};
```

#### Nachher ✅
```typescript
import { DASHBOARD_THEMES, STATUS_COLORS } from "@/config";
import { useTheme } from "@/hooks/useTheme";

const MyComponent = () => {
  const { theme } = useTheme();
  const colors = DASHBOARD_THEMES[theme];
  
  const styles = {
    background: colors.background,
    color: colors.text,
    borderColor: colors.border,
  };
  
  return <div style={styles}>...</div>;
};
```

## 🔧 Komponenten-spezifische Migrations-Beispiele

### ExecutiveOverview.tsx

```typescript
// VORHER
import React, { useState, useEffect } from "react";
import "./ExecutiveOverview.css";

const ExecutiveOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/kpis").then(r => r.json()),
      fetch("/api/finance/revenue").then(r => r.json()),
      fetch("/api/sales/statistics").then(r => r.json()),
    ]).then(([kpis, revenue, sales]) => {
      // ...
      setLoading(false);
    });
  }, []);
  
  if (loading) return <div className="loading-spinner" />;
  return <div className="executive-overview">...</div>;
};
```

```typescript
// NACHHER
import React, { useState, useEffect } from "react";
import { DASHBOARD_WIDGETS, buildApiUrl } from "@/config";
import { useRefreshInterval } from "@/hooks/useRefreshInterval";
import "./ExecutiveOverview.css";

const ExecutiveOverview: React.FC = () => {
  const widget = DASHBOARD_WIDGETS.EXECUTIVE_OVERVIEW;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OverviewData | null>(null);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        widget.apiEndpoints.map(endpoint => 
          fetch(buildApiUrl(endpoint)).then(r => r.json())
        )
      );
      setData({
        kpis: results[0],
        revenue: results[1],
        sales: results[2],
        financial: results[3],
      });
    } catch (error) {
      console.error("Failed to load executive overview:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  // Auto-Refresh
  useRefreshInterval(loadData, widget.refreshInterval * 1000);
  
  if (loading) return <div className="loading-spinner" />;
  return <div className="executive-overview">...</div>;
};
```

### ModuleWidgets.tsx

```typescript
// VORHER
const AllModuleWidgets: React.FC = () => {
  return (
    <div className="widgets-grid">
      <CRMWidget />
      <FinanceWidget />
      <SalesWidget />
      {/* ... 8 weitere Widgets */}
    </div>
  );
};
```

```typescript
// NACHHER
import { 
  DASHBOARD_WIDGETS, 
  getWidgetsByPermissions,
  sortWidgetsByPriority 
} from "@/config";
import { usePermissions } from "@/hooks/usePermissions";

const AllModuleWidgets: React.FC = () => {
  const { userPermissions } = usePermissions();
  
  // Nur Widgets anzeigen, für die User Berechtigung hat
  const authorizedWidgets = getWidgetsByPermissions(userPermissions);
  
  // Nach Priorität sortieren
  const sortedWidgets = sortWidgetsByPriority(authorizedWidgets);
  
  return (
    <div className="widgets-grid">
      {sortedWidgets.map(widget => (
        <div 
          key={widget.id}
          className={`widget-span-${widget.gridSpan}`}
        >
          <DynamicWidget config={widget} />
        </div>
      ))}
    </div>
  );
};

// Dynamisches Widget-Rendering
const DynamicWidget: React.FC<{ config: DashboardWidget }> = ({ config }) => {
  switch (config.module) {
    case "crm": return <CRMWidget config={config} />;
    case "finance": return <FinanceWidget config={config} />;
    case "sales": return <SalesWidget config={config} />;
    // ... weitere Module
    default: return null;
  }
};
```

### SimpleDashboard.tsx

```typescript
// VORHER
const SimpleDashboard: React.FC = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch("/api/dashboard/overview")
      .then(r => r.json())
      .then(setData);
  }, []);
  
  return (
    <div className="simple-dashboard">
      <KPICard title="Revenue" value={data?.revenue} />
      <KPICard title="Orders" value={data?.orders} />
      {/* ... */}
    </div>
  );
};
```

```typescript
// NACHHER
import { API_ROUTES, buildApiUrl, DASHBOARD_WIDGETS } from "@/config";

const SimpleDashboard: React.FC = () => {
  const [data, setData] = useState(null);
  const widget = DASHBOARD_WIDGETS.EXECUTIVE_OVERVIEW;
  
  useEffect(() => {
    fetch(buildApiUrl(API_ROUTES.DASHBOARD.OVERVIEW))
      .then(r => r.json())
      .then(setData);
      
    // Auto-Refresh
    const interval = setInterval(() => {
      fetch(buildApiUrl(API_ROUTES.DASHBOARD.OVERVIEW))
        .then(r => r.json())
        .then(setData);
    }, widget.refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [widget]);
  
  return (
    <div className="simple-dashboard">
      <KPICard title="Revenue" value={data?.revenue} />
      <KPICard title="Orders" value={data?.orders} />
      {/* ... */}
    </div>
  );
};
```

## 🗑️ Duplikate entfernen

### DashboardWidgets-Komponente löschen

```bash
# Schritt 1: Backup erstellen
cp -r apps/frontend/src/components/DashboardWidgets \
      apps/frontend/src/components/DashboardWidgets.backup

# Schritt 2: Imports in App.tsx bereinigen
# Datei: apps/frontend/src/App.tsx
# ENTFERNEN:
import { DashboardWidgets } from "./components/DashboardWidgets";

# Schritt 3: Route entfernen
# <Route path="/widgets" element={<DashboardWidgets />} />

# Schritt 4: Ordner löschen
rm -rf apps/frontend/src/components/DashboardWidgets
```

## ✅ Validierungs-Checkliste

Nach jeder Komponenten-Migration:

- [ ] Imports verwenden `@/config`
- [ ] Keine hardcodierten URLs
- [ ] Widget-Konfiguration genutzt
- [ ] Permissions geprüft
- [ ] Auto-Refresh implementiert
- [ ] Grid-Span aus Config
- [ ] Theme-System verwendet
- [ ] TypeScript-Errors behoben
- [ ] ESLint-Warnings behoben
- [ ] Tests angepasst
- [ ] Funktionalität getestet
- [ ] Performance gemessen

## 🧪 Testing

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import { DASHBOARD_WIDGETS, API_ROUTES } from "@/config";
import { ExecutiveOverview } from "./ExecutiveOverview";

describe("ExecutiveOverview", () => {
  beforeEach(() => {
    // Mock API-Calls
    global.fetch = vi.fn();
  });
  
  it("should use centralized config", async () => {
    const widget = DASHBOARD_WIDGETS.EXECUTIVE_OVERVIEW;
    
    render(<ExecutiveOverview />);
    
    await waitFor(() => {
      // Prüfen, dass alle Endpoints aus Config aufgerufen wurden
      expect(fetch).toHaveBeenCalledTimes(widget.apiEndpoints.length);
      widget.apiEndpoints.forEach(endpoint => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining(endpoint)
        );
      });
    });
  });
  
  it("should refresh according to config interval", () => {
    const widget = DASHBOARD_WIDGETS.EXECUTIVE_OVERVIEW;
    vi.useFakeTimers();
    
    render(<ExecutiveOverview />);
    
    vi.advanceTimersByTime(widget.refreshInterval * 1000);
    
    // Prüfen, dass Refresh erfolgt ist
    expect(fetch).toHaveBeenCalledTimes(widget.apiEndpoints.length * 2);
  });
});
```

## 🚀 Performance-Optimierung

### Before: Duplikate API-Calls

```typescript
// Component A
useEffect(() => {
  fetch("/api/dashboard/overview"); // Call 1
}, []);

// Component B
useEffect(() => {
  fetch("/api/dashboard/overview"); // Call 2 (Duplikat!)
}, []);
```

### After: Shared State mit Config

```typescript
// Shared Hook
import { API_ROUTES, buildApiUrl } from "@/config";

const useDashboardData = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch(buildApiUrl(API_ROUTES.DASHBOARD.OVERVIEW))
      .then(r => r.json())
      .then(setData);
  }, []);
  
  return data;
};

// Component A
const data = useDashboardData(); // Call 1

// Component B
const data = useDashboardData(); // Verwendet gecachte Daten
```

## 📊 Fortschritt Tracking

| Komponente | Status | Notizen |
|------------|--------|---------|
| `config/apiRoutes.ts` | ✅ Fertig | Alle Routen definiert |
| `config/dashboardConfig.ts` | ✅ Fertig | Widgets konfiguriert |
| `Dashboard.tsx` | ⏳ Ausstehend | Haupt-Migration |
| `SimpleDashboard.tsx` | ⏳ Ausstehend | Migration |
| `ExecutiveOverview.tsx` | ⏳ Ausstehend | Migration |
| `WarningsEscalations.tsx` | ⏳ Ausstehend | Migration |
| `ModuleWidgets.tsx` | ⏳ Ausstehend | Migration |
| `DashboardWidgets/` | ⏳ Ausstehend | Zu entfernen |
| Tests | ⏳ Ausstehend | Anpassen |
| Dokumentation | ✅ Fertig | Vollständig |

## 💡 Tipps & Tricks

1. **Schrittweise Migration**: Ein Widget nach dem anderen
2. **Tests zuerst**: Stelle sicher, alte Tests laufen
3. **Parallel-Entwicklung**: Alte Komponenten erst entfernen, wenn neue funktionieren
4. **Performance messen**: Vorher/Nachher Bundle-Größe vergleichen
5. **Console-Logging**: Während Migration Config-Ausgaben prüfen

## 🆘 Hilfe bei Problemen

### Problem: API-Call funktioniert nicht

```typescript
// Debug-Ausgabe
console.log("Full URL:", buildApiUrl(API_ROUTES.DASHBOARD.OVERVIEW));
// Erwartete Ausgabe: "http://localhost:3000/api/dashboard/overview"
```

### Problem: Widget wird nicht angezeigt

```typescript
// Permissions prüfen
const widget = DASHBOARD_WIDGETS.CRM_WIDGET;
console.log("Required permissions:", widget.permissions);
console.log("User permissions:", userPermissions);
```

### Problem: Refresh funktioniert nicht

```typescript
// Intervall prüfen
const widget = DASHBOARD_WIDGETS.EXECUTIVE_OVERVIEW;
console.log("Refresh interval (s):", widget.refreshInterval);
console.log("Refresh interval (ms):", widget.refreshInterval * 1000);
```

---

**Bei Fragen:** Siehe `DASHBOARD_CONSOLIDATION.md` oder `API_QUICK_REFERENCE.md`
