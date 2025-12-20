# Calendar Feature - Frontend

**Version:** 1.0.0  
**Last Updated:** Dezember 2025

## Übersicht

Das Calendar-Feature bietet eine vollständige Kalender- und Terminverwaltung mit mehreren Ansichtsmodi, Filteroptionen und Export/Import-Funktionalität.

## Komponenten

### CalendarPage

Hauptkomponente, die alle Calendar-Funktionen orchestriert.

**Features:**

- View-Mode-Wechsel (Monat, Woche, Tag, Agenda)
- Filter-Integration
- Import/Export-Funktionalität
- Statistik-Anzeige
- Druck-Unterstützung

**Verwendung:**

```tsx
import { CalendarPage } from "@features/calendar";

<CalendarPage />;
```

### Calendar

Kern-Kalenderkomponente mit verschiedenen Ansichtsmodi.

**Features:**

- Monatansicht mit Tagesübersicht
- Wochenansicht
- Tagesansicht
- Event-Anzeige mit Farbcodierung
- Datumsnavigation
- Event-Detail-Modal

**Props:**

```tsx
interface CalendarProps {
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onEventCreate?: (start: Date, end: Date) => void;
  viewMode?: ViewMode;
  onViewChange?: (view: ViewMode) => void;
  filters?: { category?: string[]; search?: string };
}
```

**Beispiel:**

```tsx
<Calendar
  viewMode="month"
  onEventClick={(event) => console.log(event)}
  onDateClick={(date) => console.log(date)}
  filters={{ category: ["meeting"], search: "budget" }}
/>
```

### CalendarAgendaView

Chronologische Listen-Ansicht der Events, gruppiert nach Tagen.

**Features:**

- Tagesweise Gruppierung
- Erweiterbare/Zusammenklappbare Abschnitte
- Zeit- und Daueranzeige
- Standort- und Teilnehmerinformationen
- Bearbeiten- und Löschen-Aktionen
- Farbcodierte Event-Indikatoren

**Props:**

```tsx
interface CalendarAgendaViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => Promise<void>;
}
```

**Beispiel:**

```tsx
<CalendarAgendaView
  events={myEvents}
  onEventClick={handleClick}
  onEventEdit={handleEdit}
  onEventDelete={handleDelete}
/>
```

### EventForm

Modal-Formular zum Erstellen und Bearbeiten von Terminen.

**Features:**

- Ganztägige Termine
- Wiederkehrende Termine (täglich, wöchentlich, monatlich, jährlich)
- Mehrere Erinnerungsoptionen
- Teilnehmerverwaltung
- Farb- und Kategorieauswahl
- Standortfeld
- Formularvalidierung

**Props:**

```tsx
interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => Promise<void>;
  initialData?: Partial<EventFormData>;
  mode: "create" | "edit";
}
```

**Beispiel:**

```tsx
<EventForm
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  onSubmit={handleEventSubmit}
  mode="create"
/>
```

### CalendarFilters

Filter- und Such-Komponente für Kalender-Events.

**Features:**

- Kategoriebasierte Filterung
- Textsuche
- Datumsbereich-Auswahl
- Event-Typ-Schalter (ganztägig, wiederkehrend)
- Aktive Filter-Anzeige

**Props:**

```tsx
interface CalendarFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}
```

**Beispiel:**

```tsx
<CalendarFilters onFilterChange={handleFilterChange} />
```

### CalendarToolbar

Toolbar mit View-Wechsel und Aktionen.

**Features:**

- View-Mode-Buttons
- Import-Funktionalität (ICS)
- Export-Funktionalität (ICS, CSV, JSON)
- Druck-Button
- Neuer Termin-Button

**Props:**

```tsx
interface CalendarToolbarProps {
  onViewChange: (view: ViewMode) => void;
  onImport: (file: File) => Promise<void>;
  onPrint: () => void;
  currentView: string;
}
```

### CalendarStats

Statistik-Komponente für Kalender-Events.

**Features:**

- Gesamt-, Anstehende-, Wöchentliche- und Tägliche Event-Zählung
- Kategorieverteilung mit visuellen Fortschrittsbalken
- Geschäftigster Wochentag
- Durchschnittliche Event-Dauer

**Props:**

```tsx
interface CalendarStatsProps {
  events: CalendarEvent[];
}
```

## Datenstrukturen

### CalendarEvent

```typescript
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location?: string;
  start: string; // ISO 8601 format
  end: string; // ISO 8601 format
  allDay: boolean;
  color?: string;
  category?: string;
  recurrence?: RecurrenceType;
  recurrenceEndDate?: string;
  reminders?: number[];
  attendees?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### EventFormData

```typescript
interface EventFormData {
  id?: string;
  title: string;
  description: string;
  location: string;
  start: string;
  end: string;
  allDay: boolean;
  color: string;
  category: string;
  recurrence: string;
  recurrenceEndDate: string;
  reminders: number[];
  attendees: string[];
  createdBy: string;
}
```

### FilterOptions

```typescript
interface FilterOptions {
  category: string[];
  search: string;
  dateRange: { start: Date; end: Date } | null;
  showAllDay: boolean;
  showRecurring: boolean;
}
```

## API-Integration

### Events abrufen

```typescript
const response = await fetch(`/api/calendar/events?${params.toString()}`);
const data = (await response.json()) as ApiResponse<CalendarEvent[]>;
```

### Event erstellen

```typescript
const response = await fetch("/api/calendar/events", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(eventData),
});
```

### Event aktualisieren

```typescript
const response = await fetch(`/api/calendar/events/${eventId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(eventData),
});
```

### Event löschen

```typescript
const response = await fetch(`/api/calendar/events/${eventId}`, {
  method: "DELETE",
});
```

### Kategorien abrufen

```typescript
const response = await fetch("/api/calendar/categories");
const data = (await response.json()) as ApiResponse<CategoryData[]>;
```

### Import (ICS)

```typescript
const response = await fetch("/api/calendar/import", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ics: fileContent, overwrite: false }),
});
```

### Export

```typescript
const response = await fetch(`/api/calendar/export?format=${format}`);
const blob = await response.blob();
```

## Styling

Das Calendar-Feature verwendet CSS Modules für Styling:

- `Calendar.module.css` - Haupt-Styling für alle Komponenten
- `Calendar.css` - Legacy-Styling (wird nach und nach migriert)
- `fullcalendar-custom.css` - Custom-Styling für FullCalendar-Integration

### CSS-Variablen

```css
--primary-color: #4f46e5;
--surface: #ffffff;
--surface-alt: #f9fafb;
--border: #e5e7eb;
--text-primary: #111827;
--text-secondary: #6b7280;
```

## TypeScript Strict Mode

Alle Komponenten sind TypeScript Strict Mode konform:

- ✅ Keine `any` Types
- ✅ Explizite Return-Types
- ✅ Proper null/undefined handling
- ✅ Exhaustive dependency arrays in useEffect/useCallback
- ✅ Zentrale Type-Definitionen in `types.ts`

## Best Practices

### Event-Handling

```tsx
// ✅ Verwende useCallback für Event-Handler
const handleEventClick = useCallback((event: CalendarEvent) => {
  console.log("Event clicked:", event);
}, []);

// ✅ Type-Safe API Responses
const data = (await response.json()) as ApiResponse<CalendarEvent[]>;
```

### State Management

```tsx
// ✅ Verwende useState mit expliziten Types
const [events, setEvents] = useState<CalendarEvent[]>([]);

// ✅ Verwende useEffect mit Dependencies
useEffect(() => {
  fetchEvents();
}, [filters, dateRange]);
```

### Error Handling

```tsx
// ✅ Verwende try-catch mit Notifications
try {
  await submitEvent(eventData);
  Notification.success({ title: "Erfolg", message: "Event erstellt" });
} catch (error) {
  Notification.error({
    title: "Fehler",
    message: "Event konnte nicht erstellt werden",
  });
}
```

## Erweiterungen

### Neue Ansicht hinzufügen

1. Erweitere `ViewMode` Type in `types.ts`
2. Implementiere neue View-Komponente
3. Füge View zu `CalendarPage` hinzu
4. Aktualisiere `CalendarToolbar`

### Neues Event-Feld hinzufügen

1. Erweitere `CalendarEvent` Interface in `types.ts`
2. Aktualisiere `EventForm` Komponente
3. Passe Backend-API an
4. Aktualisiere Datenbank-Schema

## Bekannte Einschränkungen

- Wochenansicht ist noch nicht vollständig implementiert
- Tagesansicht ist noch nicht vollständig implementiert
- Drag & Drop ist noch nicht implementiert
- Offline-Modus wird noch nicht unterstützt

## Migration von Alt zu Neu

Falls Sie alte Calendar-Komponenten haben:

```tsx
// Alt
import { Calendar } from "./old-calendar";

// Neu
import { Calendar } from "@features/calendar";
```

## Testing

```bash
# Unit Tests
npm test -- calendar

# E2E Tests
npm run e2e:calendar
```

## Support

Bei Fragen oder Problemen wenden Sie sich an das Entwicklerteam oder erstellen Sie ein Issue im Repository.
