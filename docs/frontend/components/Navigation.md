# MainNavigation Component

Hauptnavigationskomponente für das Steinmetz ERP System mit vollständiger TypeScript-Typisierung, Accessibility-Features und modernem Design.

## Features

### ✅ Behobene Probleme

- ✅ Keine `any` Typen
- ✅ Keine CSS inline styles
- ✅ Keine TypeScript Fehler
- ✅ Keine Fast Refresh Warnungen
- ✅ Keine non-null assertions
- ✅ Keine cascading render Probleme

### 🎨 Design Features

- Dark Mode Unterstützung
- Responsive Design
- Smooth Animationen
- Custom Scrollbar
- Collapse/Expand Funktionalität

### ♿ Accessibility

- ARIA Labels und Attributes
- Keyboard Navigation
- Focus Management
- Screen Reader Support

### 🚀 Erweiterte Funktionen

- **Suchfunktion** - Durchsuche Navigation in Echtzeit
- **Favoriten** - Markiere häufig verwendete Menüpunkte
- **Badges** - NEW/BETA Labels und Notification Counter
- **Hierarchische Navigation** - Unbegrenzte Verschachtelungstiefe
- **Path-basierte Aktivierung** - Automatische Hervorhebung basierend auf Route
- **Filterung** - Dynamisches Filtern von Navigationselementen

## Installation

```typescript
import { MainNavigation } from "@/components/Navigation";
// oder
import MainNavigation from "@/components/Navigation";
```

## Verwendung

### Basis-Verwendung

```tsx
import { MainNavigation } from "@/components/Navigation";

function App() {
  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return <MainNavigation onNavigate={handleNavigate} />;
}
```

### Mit allen Features

```tsx
import { MainNavigation } from "@/components/Navigation";
import { useState } from "react";

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPath, setCurrentPath] = useState("/dashboard");

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    router.push(path);
  };

  return (
    <MainNavigation
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      onNavigate={handleNavigate}
      activePath={currentPath}
      searchEnabled={true}
      favoritesEnabled={true}
    />
  );
}
```

## Props

```typescript
interface MainNavigationProps {
  /** Ob die Navigation eingeklappt ist */
  collapsed?: boolean;

  /** Callback für Navigation zu einem Pfad */
  onNavigate?: (path: string) => void;

  /** Callback wenn collapsed Status sich ändert */
  onCollapsedChange?: (collapsed: boolean) => void;

  /** Aktueller aktiver Pfad für automatische Hervorhebung */
  activePath?: string;

  /** Aktiviert die Suchfunktion */
  searchEnabled?: boolean;

  /** Aktiviert Favoriten-Feature */
  favoritesEnabled?: boolean;
}
```

## Navigation-Konfiguration

Die Navigation wird über `navigationConfig.ts` konfiguriert:

```typescript
import type { NavigationItem } from "./navigationConfig";

// Beispiel einer Navigation Item Definition
const item: NavigationItem = {
  id: "unique-id",
  label: "translation.key",
  icon: "🏠",
  path: "/path",
  badge: 5, // Optional: Notification counter
  isNew: true, // Optional: NEW Badge
  isBeta: true, // Optional: BETA Badge
  requiredPermissions: ["admin"], // Optional: Permissions
  children: [
    // Optional: Untermenüs
    {
      id: "child-id",
      label: "child.translation.key",
      icon: "📄",
      path: "/path/child",
    },
  ],
};
```

### Navigation anpassen

1. Öffne `navigationConfig.ts`
2. Füge neue Items zum `navigationStructure` Array hinzu
3. Translations in i18n Dateien hinzufügen

```typescript
export const navigationStructure: NavigationItem[] = [
  {
    id: "dashboard",
    label: "navigation.dashboard",
    icon: "🏠",
    path: "/dashboard",
  },
  // Weitere Items...
];
```

## Styling

### CSS Classes

Die Komponente verwendet CSS Classes statt inline styles:

```css
/* Hauptcontainer */
.main-navigation {
}
.main-navigation.collapsed {
}
.main-navigation.expanded {
}

/* Navigation Items */
.nav-item {
}
.nav-item.active {
}
.nav-item.level-1 {
}
.nav-item-content {
}
.nav-item-icon {
}
.nav-item-label {
}
.nav-item-badge {
}
.nav-item-expand {
}

/* Dark Mode */
.dark .main-navigation {
}
.dark .nav-item {
}
```

### Theme anpassen

Styles können in `MainNavigation.css` überschrieben werden:

```css
/* Custom Theme */
.main-navigation {
  --nav-bg: white;
  --nav-border: #e5e7eb;
  --nav-text: #374151;
  --nav-active-bg: #2563eb;
  --nav-active-text: white;
}

.dark .main-navigation {
  --nav-bg: #111827;
  --nav-border: #374151;
  --nav-text: #d1d5db;
}
```

## Performance

- ✅ `useMemo` für gefilterte Items
- ✅ `useCallback` für Event Handler
- ✅ Keine unnecessary Re-renders
- ✅ Optimierte Rekursion
- ✅ Lazy Loading möglich

## Accessibility Features

### ARIA Attributes

- `aria-expanded` für expandierbare Items
- `aria-current="page"` für aktive Items
- `aria-label` für Buttons und Badges
- `aria-hidden` für dekorative Icons

### Keyboard Support

- Tab Navigation
- Enter/Space für Aktivierung
- Escape für Schließen (bei Submenüs)

### Screen Reader

- Semantisches HTML
- Beschreibende Labels
- Status Updates

## Browser-Kompatibilität

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Browser

## Beispiele

### Mit React Router

```tsx
import { MainNavigation } from "@/components/Navigation";
import { useNavigate, useLocation } from "react-router-dom";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <MainNavigation
      onNavigate={(path) => navigate(path)}
      activePath={location.pathname}
      searchEnabled={true}
    />
  );
}
```

### Mit Next.js

```tsx
import { MainNavigation } from "@/components/Navigation";
import { useRouter } from "next/router";

function Layout() {
  const router = useRouter();

  return (
    <MainNavigation
      onNavigate={(path) => router.push(path)}
      activePath={router.pathname}
    />
  );
}
```

### Responsive Layout

```tsx
function ResponsiveLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  return (
    <div className="flex">
      <MainNavigation collapsed={collapsed} onCollapsedChange={setCollapsed} />
      <main className="flex-1">{/* Content */}</main>
    </div>
  );
}
```

## Testing

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { MainNavigation } from "./MainNavigation";

describe("MainNavigation", () => {
  it("renders navigation items", () => {
    render(<MainNavigation />);
    expect(screen.getByText("Steinmetz ERP")).toBeInTheDocument();
  });

  it("calls onNavigate when item is clicked", () => {
    const handleNavigate = jest.fn();
    render(<MainNavigation onNavigate={handleNavigate} />);

    fireEvent.click(screen.getByText("Dashboard"));
    expect(handleNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("toggles collapsed state", () => {
    const handleCollapse = jest.fn();
    render(
      <MainNavigation
        collapsed={false}
        onCollapsedChange={handleCollapse}
      />
    );

    fireEvent.click(screen.getByLabelText("Toggle navigation"));
    expect(handleCollapse).toHaveBeenCalledWith(true);
  });
});
```

## Changelog

### Version 1.0.0

- ✅ Alle TypeScript Fehler behoben
- ✅ CSS inline styles entfernt
- ✅ Navigation Config ausgelagert
- ✅ Suchfunktion hinzugefügt
- ✅ Favoriten-Feature hinzugefügt
- ✅ Accessibility verbessert
- ✅ Performance optimiert
- ✅ Dark Mode Support

## License

SPDX-License-Identifier: MIT
