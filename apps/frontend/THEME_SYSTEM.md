# ERP SteinmetZ - Theme System Documentation

## Überblick

Das Frontend verwendet ein zentralisiertes Theme-System mit CSS-Variablen, das einen konsistenten Look & Feel über die gesamte Anwendung gewährleistet und Dark Mode, Light Mode, LCARS und High Contrast unterstützt.

## Projektstruktur

```
apps/frontend/src/
├── styles/
│   ├── theme/
│   │   └── variables.css      # Zentrale Design-Variablen (Spacing, Farben, etc.)
│   ├── base.css               # Basis-Styles und Reset
│   ├── components.css         # Wiederverwendbare Komponenten-Styles
│   ├── light.css              # Light Theme
│   ├── dark.css               # Dark Theme
│   ├── lcars.css              # LCARS Theme (Star Trek inspiriert)
│   ├── contrast.css           # High Contrast Theme
│   └── responsive.css         # Responsive Breakpoints
├── components/
│   ├── ui/                    # Basis UI-Komponenten
│   ├── QuickChat/
│   │   └── QuickChat.css      # QuickChat spezifische Styles
│   ├── aiAnnotatorRouter/
│   │   └── aiAnnotatorRouter.css  # AI Annotator Styles
│   └── Dashboard/
│       └── styles/
│           └── dashboard-modern.css
├── contexts/
│   └── ThemeContext.tsx       # React Context für Theme Management
├── routes.tsx                 # Zentralisierte Route-Konfiguration
└── main.tsx                   # App-Einstiegspunkt
```

## Theme-System

### Verfügbare Themes

1. **Light** - Standard helles Theme für Tageslicht
2. **Dark** - Dunkles Theme für reduzierte Augenbelastung
3. **LCARS** - Star Trek inspiriertes Theme
4. **Contrast** - Hoher Kontrast für Barrierefreiheit

### Theme Wechsel

Das Theme kann auf drei Arten gewechselt werden:

1. **Theme Toggle Button im Header** - Zykliert durch alle Themes
2. **Programmatisch** - Über den `useTheme()` Hook:
   ```typescript
   const { theme, setTheme, toggleTheme } = useTheme();
   setTheme('dark'); // Setzt spezifisches Theme
   toggleTheme();    // Wechselt zum nächsten Theme
   ```
3. **Automatisch** - Erkennt System-Präferenz beim ersten Laden

### CSS-Variablen

Das Theme-System nutzt CSS-Variablen für maximale Flexibilität:

#### Spacing (in `theme/variables.css`)
```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
```

#### Farben (Theme-spezifisch)
```css
--primary-600: #0284c7;
--text-primary: #1e293b;
--text-secondary: #64748b;
--bg-card: #ffffff;
--bg-secondary: #f8fafc;
--border-color: #e2e8f0;
```

#### Typographie
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
```

#### Border Radius
```css
--radius-sm: 0.25rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
--radius-full: 9999px;
```

#### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

#### Transitions
```css
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
```

## Komponenten-Styles

### Wiederverwendbare Komponenten (components.css)

#### Buttons
```css
.btn                /* Basis-Button */
.btn-primary        /* Primärer Button */
.btn-secondary      /* Sekundärer Button */
.btn-success        /* Erfolg Button */
.btn-danger         /* Gefahr Button */
.btn-ghost          /* Transparenter Button */
```

#### Cards
```css
.card               /* Basis-Card */
.card-header        /* Card-Kopfbereich */
.card-title         /* Card-Titel */
.card-content       /* Card-Inhalt */
.card-footer        /* Card-Fußbereich */
```

#### Badges
```css
.badge              /* Basis-Badge */
.badge-primary      /* Primäres Badge */
.badge-success      /* Erfolg Badge */
.badge-warning      /* Warnung Badge */
.badge-error        /* Fehler Badge */
```

#### Forms
```css
.form-group         /* Form-Gruppe Container */
.form-label         /* Form-Label */
.form-input         /* Text Input */
.form-select        /* Select Dropdown */
.form-textarea      /* Textarea */
.form-error         /* Fehler-Nachricht */
.form-help          /* Hilfe-Text */
```

#### Layout
```css
.grid               /* Grid Container */
.grid-cols-2        /* 2-Spalten Grid */
.grid-cols-3        /* 3-Spalten Grid */
.grid-cols-4        /* 4-Spalten Grid */
```

## Best Practices

### 1. Verwende CSS-Variablen statt Hart-codierter Werte

❌ **Schlecht:**
```css
.my-component {
  color: #1e293b;
  padding: 16px;
  border-radius: 8px;
}
```

✅ **Gut:**
```css
.my-component {
  color: var(--text-primary);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}
```

### 2. Nutze vorhandene Komponenten-Klassen

❌ **Schlecht:**
```jsx
<button style={{ padding: '10px 16px', backgroundColor: '#0284c7' }}>
  Click me
</button>
```

✅ **Gut:**
```jsx
<button className="btn btn-primary">
  Click me
</button>
```

### 3. Erstelle komponentenspezifische CSS-Dateien

Für größere Komponenten sollte eine separate CSS-Datei angelegt werden:

```
MyComponent/
├── MyComponent.tsx
└── MyComponent.css
```

### 4. Vermeide Inline-Styles

Inline-Styles sollten nur in Ausnahmefällen verwendet werden (z.B. für dynamische Werte).

### 5. Theme-Aware Komponenten

Komponenten sollten die aktuellen Theme-Variablen respektieren:

```css
.my-component {
  background-color: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

## Routing

Die Routing-Konfiguration ist in `src/routes.tsx` zentralisiert:

```typescript
import { router } from './routes';

// In main.tsx
<RouterProvider router={router} />
```

### Verfügbare Routes

- `/` - Dashboard (Hauptseite)
- `/catalog` - Funktionskatalog
- `/ai` - AI Annotator
- `/hr` - Personalverwaltung
- `/finance` - Finanzverwaltung
- `/crm` - Kundenverwaltung
- `/inventory` - Lagerverwaltung
- `/projects` - Projektverwaltung
- `/innovation` - Innovationsmanagement
- `/calendar` - Kalender
- `/communication` - Kommunikationszentrum
- `/settings` - Einstellungen

## Neue Komponente erstellen

### 1. Erstelle die Komponenten-Dateien

```bash
mkdir -p src/components/MyNewComponent
touch src/components/MyNewComponent/MyNewComponent.tsx
touch src/components/MyNewComponent/MyNewComponent.css
```

### 2. Implementiere die Komponente

```typescript
// MyNewComponent.tsx
import React from 'react';
import './MyNewComponent.css';

export const MyNewComponent: React.FC = () => {
  return (
    <div className="my-component card">
      <div className="card-header">
        <h2 className="card-title">My Component</h2>
      </div>
      <div className="card-content">
        <p className="text-secondary">Content here...</p>
        <button className="btn btn-primary">Action</button>
      </div>
    </div>
  );
};
```

### 3. Verwende Theme-Variablen im CSS

```css
/* MyNewComponent.css */
.my-component {
  /* Verwende Theme-Variablen */
  background-color: var(--bg-card);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
}

.my-component-title {
  color: var(--text-primary);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
}
```

## Testing Themes

Um alle Themes zu testen:

1. Starte die Entwicklungsumgebung: `npm run dev`
2. Klicke auf den Theme-Toggle im Header
3. Verifiziere, dass alle Komponenten in allen Themes korrekt dargestellt werden
4. Prüfe auch die responsive Ansicht (verschiedene Bildschirmgrößen)

## Barrierefreiheit

Das Theme-System unterstützt Barrierefreiheit:

- **High Contrast Mode** für bessere Lesbarkeit
- **Konsistente Farbkontraste** in allen Themes
- **Keyboard Navigation** wird unterstützt
- **ARIA-Labels** sollten bei interaktiven Elementen verwendet werden

## Weitere Informationen

- [React Documentation](https://react.dev/)
- [CSS Variables (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
