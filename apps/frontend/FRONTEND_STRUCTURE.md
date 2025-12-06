# ERP SteinmetZ - Frontend Struktur Dokumentation

## Architektur Übersicht

Das Frontend folgt einer klaren, modularen Struktur mit Trennung von Belangen (Separation of Concerns). Die Architektur basiert auf React 19 mit TypeScript, Vite als Build-Tool und einem zentralisierten Theme-System.

## Verzeichnisstruktur

```
apps/frontend/
├── src/
│   ├── components/          # Wiederverwendbare React-Komponenten
│   │   ├── ui/             # Basis UI-Komponenten (Button, Modal, etc.)
│   │   ├── Auth/           # Authentifizierungs-Komponenten
│   │   ├── Dashboard/      # Dashboard-Komponente und Unterkomponenten
│   │   ├── QuickChat/      # QuickChat AI Assistant
│   │   ├── aiAnnotatorRouter/  # AI Annotator Interface
│   │   ├── FunctionsCatalog/   # Funktionskatalog Browser
│   │   ├── DashboardWidgets/   # Dashboard Widgets
│   │   └── LanguageSwitch/     # Sprachumschaltung
│   │
│   ├── contexts/           # React Context Providers
│   │   ├── ThemeContext.tsx    # Theme Management
│   │   └── AuthContext.tsx     # Authentifizierung
│   │
│   ├── features/           # Feature-Module (Domain-spezifische Funktionalität)
│   │   ├── calendar/       # Kalender-Feature
│   │   ├── communication/  # Kommunikationszentrum
│   │   ├── crm/           # Customer Relationship Management
│   │   ├── finance/       # Finanzwesen
│   │   ├── hr/            # Human Resources
│   │   ├── innovation/    # Innovationsmanagement
│   │   ├── inventory/     # Lagerverwaltung
│   │   ├── projects/      # Projektverwaltung
│   │   └── settings/      # Einstellungen
│   │
│   ├── hooks/              # Custom React Hooks
│   │   ├── useHealth.ts
│   │   ├── useAI.ts
│   │   ├── useDashboard.ts
│   │   └── ...
│   │
│   ├── pages/              # Top-Level Pages
│   │   └── Login/         # Login-Seite
│   │
│   ├── styles/             # Globale Styles
│   │   ├── theme/         # Theme-System
│   │   │   └── variables.css  # Zentrale CSS-Variablen
│   │   ├── base.css       # Basis-Styles
│   │   ├── components.css # Komponenten-Styles
│   │   ├── light.css      # Light Theme
│   │   ├── dark.css       # Dark Theme
│   │   ├── lcars.css      # LCARS Theme
│   │   └── contrast.css   # High Contrast Theme
│   │
│   ├── test/               # Test-Setup und Utilities
│   ├── routes.tsx          # Zentralisierte Route-Konfiguration
│   ├── App.tsx            # Hauptkomponente mit Layout
│   ├── main.tsx           # Einstiegspunkt
│   └── version.ts         # Versions-Information
│
├── index.html             # HTML-Template
├── package.json           # Dependencies und Scripts
├── tsconfig.json          # TypeScript-Konfiguration
├── vite.config.ts         # Vite-Konfiguration
└── vitest.config.ts       # Test-Konfiguration
```

## Architektur-Prinzipien

### 1. Komponenten-Organisation

#### UI-Komponenten (`components/ui/`)
- Atomare, wiederverwendbare UI-Elemente
- Keine Business-Logik
- Props-getrieben
- Vollständig typisiert
- Beispiele: Button, Modal, Card, Input, Toast

#### Feature-Komponenten (`features/`)
- Domain-spezifische Funktionalität
- Enthalten Business-Logik
- Können UI-Komponenten zusammensetzen
- Beispiele: HR-Module, Finanz-Module, CRM

#### Layout-Komponenten (`components/`)
- Größere, zusammengesetzte Komponenten
- Dashboard, FunctionsCatalog, QuickChat
- Können State und Side-Effects haben

### 2. State Management

#### Local State
- Verwendet `useState` für Komponenten-lokalen State
- Verwendet `useReducer` für komplexe State-Logik

#### Global State
- React Context für Theme und Authentication
- Custom Hooks für Feature-spezifische Logik

#### Server State
- Fetch API für Backend-Kommunikation
- Custom Hooks für Data-Fetching (z.B. `useHealth`, `useAI`)

### 3. Routing

Zentralisierte Route-Konfiguration in `src/routes.tsx`:

```typescript
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "catalog", element: <FunctionsCatalog /> },
      { path: "ai", element: <AiAnnotatorRouter /> },
      // ... weitere Routes
    ],
  },
]);
```

**Vorteile:**
- Zentrale Übersicht aller Routes
- Lazy Loading für bessere Performance
- Type-Safety durch TypeScript
- Einfache Wartung und Erweiterung

### 4. Styling-Strategie

#### CSS-in-Files Ansatz
- Komponenten-spezifische CSS-Dateien
- Verwendung von CSS-Variablen für Theme-Support
- BEM-ähnliche Namenskonvention (optional)

#### Theme-System
- CSS Custom Properties (Variablen)
- React Context für Theme-Umschaltung
- Automatische Theme-Erkennung basierend auf System-Präferenz

#### Best Practice Beispiel:
```typescript
// Component.tsx
import './Component.css';

export const Component = () => (
  <div className="component card">
    <h2 className="component-title">Title</h2>
    <button className="btn btn-primary">Action</button>
  </div>
);
```

```css
/* Component.css */
.component {
  background-color: var(--bg-card);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
}

.component-title {
  color: var(--text-primary);
  font-size: var(--text-xl);
}
```

### 5. TypeScript Integration

#### Type-Safety
- Alle Komponenten sind typisiert
- Props-Interfaces für Komponenten
- Type-Inference wo möglich

#### Beispiel:
```typescript
interface ComponentProps {
  title: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export const Component: React.FC<ComponentProps> = ({
  title,
  onAction,
  children
}) => {
  // Implementation
};
```

## Code-Konventionen

### Datei-Benennung
- Komponenten: `PascalCase.tsx` (z.B. `UserProfile.tsx`)
- Hooks: `camelCase.ts` mit `use` Präfix (z.B. `useAuth.ts`)
- Utilities: `camelCase.ts` (z.B. `formatDate.ts`)
- CSS: Gleicher Name wie Komponente (z.B. `UserProfile.css`)

### Komponenten-Struktur
```typescript
// 1. Imports
import React from 'react';
import { useHook } from './hooks';
import './Component.css';

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export const Component: React.FC<ComponentProps> = (props) => {
  // 3.1 Hooks
  const [state, setState] = useState();
  
  // 3.2 Event Handlers
  const handleClick = () => {};
  
  // 3.3 Effects
  useEffect(() => {}, []);
  
  // 3.4 Render
  return <div>...</div>;
};

// 4. Sub-components (wenn nötig)
const SubComponent = () => {};
```

### Import-Reihenfolge
1. React und externe Libraries
2. Interne absolute Imports
3. Relative Imports
4. Styles

```typescript
// External
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Internal
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

// Relative
import { helper } from './utils';

// Styles
import './Component.css';
```

## Performance-Optimierung

### Lazy Loading
- Alle Routes werden lazy geladen
- Große Komponenten werden lazy geladen
- Code-Splitting automatisch durch Vite

### Memoization
```typescript
// React.memo für teure Komponenten
export const ExpensiveComponent = React.memo(({ data }) => {
  // ...
});

// useMemo für teure Berechnungen
const result = useMemo(() => expensiveCalculation(data), [data]);

// useCallback für Event-Handler
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);
```

### Bundle-Optimierung
- Vite optimiert automatisch
- Tree-Shaking für unused Code
- Code-Splitting per Route

## Testing-Strategie

### Unit Tests
- Komponenten-Tests mit React Testing Library
- Hook-Tests mit @testing-library/react-hooks
- Utility-Funktionen mit Vitest

### Test-Struktur
```typescript
// Component.test.tsx
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Neue Features hinzufügen

### 1. Neues Feature-Modul erstellen
```bash
mkdir -p src/features/myfeature
touch src/features/myfeature/index.ts
touch src/features/myfeature/MyFeature.tsx
touch src/features/myfeature/MyFeature.css
```

### 2. Route hinzufügen
In `src/routes.tsx`:
```typescript
const MyFeature = lazy(() => import('./features/myfeature/MyFeature'));

// Im Router:
{
  path: "myfeature",
  element: <ProtectedPage><MyFeature /></ProtectedPage>
}
```

### 3. Navigation hinzufügen
In `src/App.tsx`:
```typescript
<NavLink to="/myfeature" className="nav-link">
  <span className="nav-icon">🎯</span>
  My Feature
</NavLink>
```

### 4. Feature implementieren
```typescript
// MyFeature.tsx
import React from 'react';
import './MyFeature.css';

export const MyFeature: React.FC = () => {
  return (
    <div className="myfeature-container">
      <h1>My Feature</h1>
      {/* Implementation */}
    </div>
  );
};
```

## Build & Deployment

### Development
```bash
npm run dev               # Start dev server
npm run dev:frontend      # Frontend only
```

### Production
```bash
npm run build            # Build all
npm run build:frontend   # Build frontend only
npm run preview          # Preview production build
```

### Build-Output
- Optimierte Bundles in `dist/`
- Automatisches Code-Splitting
- Minifizierte Assets
- Source Maps für Debugging

## Environment Variables

Konfiguration über `.env` Dateien:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
```

Zugriff im Code:
```typescript
const backendUrl = import.meta.env.VITE_BACKEND_URL;
```

## Troubleshooting

### Build-Fehler
1. Dependencies aktualisieren: `npm install`
2. Cache löschen: `npm run clean`
3. TypeScript prüfen: `tsc --noEmit`

### Runtime-Fehler
1. Console-Logs prüfen
2. React DevTools verwenden
3. Network-Tab für API-Calls prüfen

## Weiterführende Links

- [React 19 Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [React Router Documentation](https://reactrouter.com/)
- [Theme System Documentation](./THEME_SYSTEM.md)
