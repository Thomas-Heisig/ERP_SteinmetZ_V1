# InvoiceList.tsx Korrekturhinweise

## Zusammenfassung der Probleme

Die Datei InvoiceList.tsx hat 51 TypeScript/ESLint-Fehler. Die meisten stammen von:

1. Nicht vorhandenen UI-Komponenten (Dropdown, Badge, Tooltip, etc.)
2. Falschen Typdeklarationen
3. Inline-Styles
4. Fehlenden Accessibility-Attributen

## Empfohlene Lösung

Da die Datei DocumentList.tsx erfolgreich implementiert wurde, sollte InvoiceList.tsx nach demselben Muster umgeschrieben werden:

### 1. Custom Components statt externe UI-Bibliothek

- Custom Tabs (Buttons mit CSS)
- Custom Dropdown (Select-Elemente)
- Custom Badge (Span-Elemente mit CSS-Klassen)
- Custom Table Implementation

### 2. Inline Styles entfernen

Alle `style={{ backgroundColor: config.color }}` durch CSS-Klassen ersetzen:

```css
.statusIndicatorDraft { background-color: var(--gray-500); }
.statusIndicatorSent { background-color: var(--info-500); }
.statusIndicatorPaid { background-color: var(--success-500); }
/* etc. */
```

### 3. DatePicker ersetzen

```tsx
<input 
  type="date"
  value={filters.dateRange?.start || ''}
  onChange={(e) => setFilters(prev => ({
    ...prev,
    dateRange: { ...prev.dateRange, start: e.target.value }
  }))}
/>
```

### 4. Accessibility verbessern

- Alle Checkboxen: `aria-label="..."`
- Alle Inputs: `placeholder` oder `aria-label`

### 5. Type Fixes

- `SortConfig.field`: `string` statt `keyof Invoice`
- `handleSort`: Parameter als `string`
- useWebSocket: Callback entfernen oder korrekt typen

### 6. Modal Footer

Modal-Komponente unterstützt kein `footer` prop - direkt in children rendern.

## Alternative: Vereinfachte Version

Falls vollständige Neuimplementierung zu aufwendig:

1. Alle fehlenden UI-Komponenten durch HTML-Elemente ersetzen
2. Inline-Styles in CSS-Module verschieben
3. Type-Fehler mit `any` temporär unterdrücken (nicht empfohlen)

## Nächste Schritte

Siehe DocumentList.tsx als Referenz für best practices.
