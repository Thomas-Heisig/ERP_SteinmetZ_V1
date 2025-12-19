# Sidebar Component

Die **Sidebar**-Komponente ist die Hauptnavigation des ERP SteinmetZ Systems. Sie bietet eine strukturierte, mehrsprachige Navigation zu allen Funktionsbereichen der Anwendung.

## 🎯 Features

- ✅ **Vollständig typsicher** mit TypeScript
- 🌍 **Mehrsprachig** (i18n-Integration)
- 🎨 **CSS Modules** für Scope-Isolation
- 📱 **Responsive** Design (Desktop, Tablet, Mobile)
- ♿ **Accessibility** (ARIA-Labels, Keyboard-Navigation)
- 🎭 **Theme-Support** (Light, Dark, LCARS)
- 🔄 **Kollapsierbar** für mehr Arbeitsbereich
- 🎯 **Strukturierte Navigation** nach Geschäftsbereichen

## 📋 Navigation Structure

Die Navigation ist entsprechend der [ERP SteinmetZ Funktionsübersicht](../../docs/concept/_ERP%20SteinmetZ_FUNKTIONEN.md) organisiert:

### Hauptbereiche

1. **Hauptbereich** - Dashboard, Funktionskatalog, Kalender
2. **Geschäftsverwaltung** - Unternehmen, Prozesse, Risiko & Compliance
3. **Finanzen & Controlling** - Buchhaltung, Controlling, Treasury, Steuern
4. **Vertrieb & Marketing** - CRM, Marketing, Vertrieb, Fulfillment
5. **Einkauf & Beschaffung** - Beschaffung, Wareneingang, Lieferanten
6. **Produktion & Fertigung** - Planung, Fertigung, Qualität, Wartung
7. **Lager & Logistik** - Lagerverwaltung, Kommissionierung, Logistik
8. **Personal & HR** - Personalverwaltung, Zeiterfassung, Entwicklung, Recruiting
9. **Reporting & Analytics** - Standard-Reports, Ad-hoc-Analysen, KI-Analytics
10. **Kommunikation & Social** - E-Mail, Messaging, Social Media
11. **KI & Automatisierung** - AI-Annotator, Batch-Processing, Qualität, Modelle, Filter
12. **System & Administration** - Benutzer, Systemeinstellungen, Integrationen
13. **Sonstiges** - Projekte, Dokumente, Innovation, Hilfe, Einstellungen

## 🚀 Usage

### Basic Usage

```tsx
import { Sidebar } from "@/components/Sidebar";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Sidebar
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
    />
  );
}
```

### With Mobile Support

```tsx
import { Sidebar } from "@/components/Sidebar";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sidebar
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      isOpen={isOpen}
    />
  );
}
```

## 📖 Props

| Prop               | Type         | Default | Description                                   |
| ------------------ | ------------ | ------- | --------------------------------------------- |
| `isCollapsed`      | `boolean`    | `false` | Steuert den kollapsierten Zustand der Sidebar |
| `onToggleCollapse` | `() => void` | -       | Callback beim Toggle der Sidebar              |
| `isOpen`           | `boolean`    | `false` | Steuert die Sichtbarkeit auf mobilen Geräten  |

## 🎨 Styling

Die Komponente verwendet CSS Modules für isoliertes Styling. Alle Styles sind in `Sidebar.module.css` definiert.

### CSS Custom Properties

Die Sidebar nutzt folgende CSS-Variablen:

- `--header-height` - Höhe des Headers (Default: 60px)
- `--surface` - Hintergrundfarbe
- `--border` - Border-Farbe
- `--text-primary` - Primäre Textfarbe
- `--text-secondary` - Sekundäre Textfarbe
- `--text-tertiary` - Tertiäre Textfarbe
- `--primary-500` - Primärfarbe
- `--primary-600` - Primärfarbe (hover)
- `--primary-50` - Hintergrund für aktive Links
- `--primary-700` - Text für aktive Links
- `--hover-bg` - Hover-Hintergrund
- `--error-500` - Badge-Farbe

### Theme Support

Die Sidebar unterstützt verschiedene Themes:

```css
/* Dark Theme */
[data-theme="dark"] .link.active {
  background: var(--primary-900);
  color: var(--primary-100);
}

/* LCARS Theme */
[data-theme="lcars"] .sidebar {
  background: #000000;
  border-right-color: var(--lcars-orange);
}
```

## 🌍 Internationalisierung

Die Komponente ist vollständig internationalisiert. Übersetzungen werden via `react-i18next` geladen:

```tsx
import { useTranslation } from "react-i18next";

const { t } = useTranslation();
t("sidebar.dashboard"); // "Dashboard" (de) / "Dashboard" (en)
```

### Unterstützte Sprachen

- 🇩🇪 Deutsch (de)
- 🇬🇧 English (en)
- 🇸🇦 العربية (ar)
- 🇨🇳 中文 (zh)
- 🇷🇺 Русский (ru)
- 🧱 Plattdüütsch (nds)
- 🇫🇷 Français (fr)
- 🇮🇹 Italiano (it)
- 🇵🇱 Polski (pl)
- 🇹🇷 Türkçe (tr)

### Translation Keys

Alle Übersetzungsschlüssel beginnen mit `sidebar.`:

```json
{
  "sidebar": {
    "title": "Navigation",
    "collapse": "Sidebar einklappen",
    "expand": "Sidebar ausklappen",
    "dashboard": "Dashboard",
    "catalog": "Funktionskatalog",
    ...
  }
}
```

## 🎯 TypeScript Types

```typescript
export interface NavItem {
  path: string;
  labelKey: string;
  icon: string;
  badge?: number;
}

export interface NavSection {
  titleKey: string;
  items: NavItem[];
}

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isOpen?: boolean;
}
```

## ♿ Accessibility

Die Komponente erfüllt WCAG 2.1 Level AA Standards:

- ✅ ARIA-Labels für alle interaktiven Elemente
- ✅ Keyboard-Navigation (Tab, Enter, Space)
- ✅ Focus-Indikatoren
- ✅ Semantic HTML (`<nav>`, `<ul>`, `<li>`)
- ✅ Screen-Reader-freundlich

### Keyboard Shortcuts

- `Tab` - Nächstes Element fokussieren
- `Shift + Tab` - Vorheriges Element fokussieren
- `Enter` / `Space` - Link/Button aktivieren
- `Escape` - Sidebar schließen (mobile)

## 📱 Responsive Design

### Desktop (>1024px)

- Sidebar immer sichtbar
- Toggle-Button zum Kollabieren
- Breite: 280px (normal) / 70px (collapsed)

### Tablet (768px - 1024px)

- Sidebar initial versteckt
- Über Hamburger-Menü einblendbar
- Overlay-Modus

### Mobile (<768px)

- Sidebar als Overlay
- Volle Breite (max. 280px)
- Touch-optimiert

## 🔧 Implementation Details

### CSS Modules

Alle Styles sind in `Sidebar.module.css` definiert und werden als Objekt importiert:

```tsx
import styles from "./Sidebar.module.css";

<aside className={styles.sidebar}>
  <div className={styles.header}>...</div>
</aside>;
```

### Navigation Structure

Die Navigation wird aus einer Funktion generiert, die ein Array von `NavSection` zurückgibt:

```tsx
const getNavigationSections = (): NavSection[] => [
  {
    titleKey: "sidebar.main",
    items: [
      { path: "/", labelKey: "sidebar.dashboard", icon: "🏠" },
      ...
    ],
  },
  ...
];
```

### Active Link Styling

React Router's `NavLink` mit `isActive`-Prop:

```tsx
<NavLink
  to={item.path}
  end={item.path === "/"}
  className={({ isActive }) =>
    `${styles.link} ${isActive ? styles.active : ""}`
  }
>
  ...
</NavLink>
```

## 🐛 Troubleshooting

### Sidebar nicht sichtbar

- Prüfen Sie, ob `isOpen` auf mobilen Geräten `true` ist
- Prüfen Sie die CSS-Variable `--header-height`

### Übersetzungen fehlen

- Stellen Sie sicher, dass i18n initialisiert ist
- Prüfen Sie, ob `sidebar`-Übersetzungen in `de.ts` / `en.ts` vorhanden sind

### Styles nicht angewendet

- Prüfen Sie, ob CSS Modules korrekt importiert sind
- Stellen Sie sicher, dass `Sidebar.module.css` existiert

### Navigation-Links funktionieren nicht

- Prüfen Sie, ob React Router korrekt konfiguriert ist
- Stellen Sie sicher, dass die Routen in der App definiert sind

## 📝 Best Practices

1. **Badge-Nutzung**: Nur für wichtige Benachrichtigungen (z.B. neue Nachrichten)
2. **Icon-Konsistenz**: Emoji-Icons für einheitliches Look & Feel
3. **Section-Gruppierung**: Logische Gruppierung nach Geschäftsbereichen
4. **Translation Keys**: Konsistente Benennung (`sidebar.<section>.<item>`)
5. **CSS Variables**: Theme-Anpassung über CSS Custom Properties

## 🔄 Migration Notes

### Von alter Sidebar (Sidebar.css) zur neuen (Sidebar.module.css)

Die neue Sidebar hat folgende Änderungen:

- ✅ **Entfernt**: Systemstatus (jetzt im Footer)
- ✅ **Entfernt**: Schnellaktionen (jetzt im Header)
- ✅ **Entfernt**: Kürzlich verwendet (separate Komponente)
- ✅ **Neu**: CSS Modules statt globales CSS
- ✅ **Neu**: Vollständige i18n-Integration
- ✅ **Neu**: TypeScript-Types exportiert
- ✅ **Neu**: Navigation nach Funktionsübersicht

## 🚧 Roadmap

- [ ] Favoriten-Funktion
- [ ] Drag & Drop für Custom-Sortierung
- [ ] Suchfunktion in Navigation
- [ ] Collapsible Sections
- [ ] Badge-Animationen
- [ ] Breadcrumb-Integration

## 📄 License

SPDX-License-Identifier: MIT

## 🤝 Contributing

Siehe [CONTRIBUTING.md](../../CONTRIBUTING.md) für Details.

---

**Hinweis**: Diese Komponente ist Teil des ERP SteinmetZ V1 Systems und folgt den Architektur-Richtlinien des Projekts.
