# 📘 **Dashboard-Modul – Technische Übersicht**

Dieses Dokument beschreibt die Struktur, die Funktionsweise und die wesentlichen Komponenten des Dashboard-Moduls innerhalb der Anwendung.
Ziel ist eine klare Darstellung der Architektur und der internen Abhängigkeiten, um spätere Erweiterungen und Wartung zu erleichtern.

---

## 1. Zweck des Moduls

Das Dashboard stellt eine zentrale Oberfläche bereit, um:

- Systeminformationen einsehbar zu machen
- Knoten (Nodes) aus der Funktionsdatenbank anzuzeigen
- Kategorien zu visualisieren
- Suche, Navigation und Layout zu steuern
- Gesundheitsdaten des Backends darzustellen
- Widgets dynamisch aus Node-Daten zu erzeugen

Das Modul ist in logische Schichten unterteilt und folgt einem strukturierenden Ansatz, damit Geschäftslogik, Präsentationslogik und technische Infrastruktur getrennt bleiben.

---

## 2. Architekturüberblick

Das Dashboard-Modul besteht aus fünf Kernbereichen:

1. **core** – globaler State, Actions, Reducer, Provider
2. **features** – Navigation, Health, Suche, Builder, Widgets
3. **hooks** – Geschäftslogik für UI-Komponenten
4. **ui** – reine visuelle Komponenten
5. **utils** – Hilfsfunktionen für Mapping, Debounce, Fetch usw.

Diese Aufteilung dient der Wartbarkeit und verhindert, dass UI-Komponenten Verantwortlichkeiten übernehmen, die im State- oder Logikbereich besser aufgehoben sind.

---

## 3. Kernmodule im Detail

## 3.1 core

**Bestandteile:**

- `DashboardProvider.tsx`
- `dashboardReducer.ts`
- `DashboardContext.ts`
- `DashboardState.ts`
- `dashboardActions.ts`

**Zweck:**

- zentraler Zustand des Dashboards
- deterministische State-Änderungen (Reducer)
- Schnittstelle zu Theme und i18n
- Bereitstellung eines Contexts für alle Dashboard-Komponenten

Der Provider übernimmt nur Initialisierungsaufgaben und enthält selbst keine Geschäftslogik.

---

## 3.2 features

Dieser Bereich enthält isolierte Funktionalität, unabhängig von UI oder State.

### 3.2.1 builder

Werkzeuge für die dynamische Darstellung von Nodes:

- `NodeBuilder.ts`
- `WidgetResolver.ts`
- `LayoutEngine.ts`
- `FormBuilder.ts`
- `types.ts`

Der Builder erzeugt aus Node-Metadaten eine passende Widget-Struktur.
Die Logik bleibt vollständig vom UI getrennt.

### 3.2.2 health

Überwacht Backend-Gesundheit:

- `HealthMonitor.ts`
- `HealthMapper.ts`
- `HealthStatusBadge.tsx`

Das Monitoring ruft Backend-Endpunkte ab und normalisiert die Daten für den globalen State.

### 3.2.3 search

Suchsystem:

- `SearchManager.ts`
- `SearchHelpers.ts`
- `SearchFilter.ts`

Die Suche arbeitet unabhängig vom UI und ermöglicht Filter, Gewichtung und Trefferbewertung.

### 3.2.4 navigation

Verwaltet Navigation innerhalb des Dashboards:

- `NavigationStack.ts`
- `NavigationManager.ts`

Behandelt Stapel, History und Wechsel zwischen Nodes oder Kategorien.

### 3.2.5 widgets

Standardisierte UI-Bausteine:

- `BasicCardWidget.tsx`
- `TableWidget.tsx`
- `ChartWidget.tsx`
- `WidgetRegistry.ts`

WidgetRegistry ermöglicht dynamische Zuordnung durch den Builder.

---

## 3.3 hooks

Geschäftslogik für UI-Komponenten:

- `useDashboardNavigation.ts`
- `useDashboardSearch.ts`
- `useDashboardHealth.ts`
- `useDashboardLayout.ts`
- `useDashboardLogic.ts`
- `useDashboardShortcuts.ts`

Diese Hooks interagieren mit dem globalen State und kapseln Handlungsabläufe, ohne UI zu rendern.

---

## 3.4 ui

Reine Präsentationskomponenten:

- `DashboardHeader.tsx`
- `DashboardTopBar.tsx`
- `CategoryGrid.tsx`
- `NodeDetails.tsx`
- `SearchOverlay.tsx`
- `LoadingScreen.tsx`
- `ErrorScreen.tsx`
- `QuickChatButton.tsx`

UI-Komponenten greifen nicht direkt auf Backend oder Logik zu, sondern nutzen ausschließlich Hooks und Context.

---

## 3.5 utils

Hilfsfunktionen:

- `cls.ts` – Zusammenführen von CSS-Klassen
- `debounce.ts` – einfache Debounce-Logik
- `mapping.ts` – Zuordnung von Icons, Farben und Metadaten
- `safeFetch.ts` – Fetch mit Fehlerbehandlung und Timeout

Diese Funktionen sind unabhängig von React.

---

## 4. Datenmodell und Node-Struktur

Das Dashboard nutzt Nodes aus der Backend-Datenbank (`functions_nodes`).
Jeder Node enthält mindestens:

- `id`
- `title`
- `kind`
- `path_json`
- Metadaten (z. B. Schema, Flags, Kategorie)

Builder, Widgets und Navigation greifen darauf zurück.

---

## 5. Integration mit Backend

Das Modul verwendet verschiedene Schnittstellen:

- `/api/system-info` (Systeminformationen)
- `/api/health` und `/api/health/readiness` (Health-Monitoring)
- Funktionen-Datenbank (`functions_nodes`, `functions_edges`)

Die Verarbeitung erfolgt ausschließlich über Hooks oder Features, nicht über UI-Komponenten.

---

## 6. Erweiterbarkeit

Die Struktur ermöglicht:

- dynamische Widgets
- konfigurierbare Layouts
- zusätzliche Suchoperatoren
- erweitertem Health-Monitoring
- Navigation mit Custom-Views
- Integration weiterer Dashboards oder Module

Die Architektur ist auf nachvollziehbare Erweiterungen ausgelegt, ohne tiefgreifende Änderungen am Kern vorzunehmen.

---

## 7. Entwicklungsrichtlinien

- UI-Komponenten bleiben ohne Geschäftslogik
- Reducer enthalten keinerlei Seiteneffekte
- asynchrone Vorgänge liegen in Hooks oder Features
- Backend-Abfragen sind gekapselt
- Typen werden zentral verwaltet
- Provider leitet externe State-Änderungen (Theme, Sprache, Health) direkt weiter

---

## 8. Abhängigkeiten

Das Modul nutzt:

- React (Hooks, Context)
- i18next (Sprachunterstützung)
- eigenes Health-Monitoring
- einheitliche Fetch-Utilities
- ThemeContext des Systems

Diese Abhängigkeiten werden klar im Provider geführt, um sie später austauschbar zu halten.

---

## 9. Status

Der Aufbau ist funktionsfähig und modular.
Er befindet sich technisch in einem Zustand, der weitere Arbeit in Bereichen wie Widgets, komplexeren Formularen oder erweiterten Suchmechanismen ermöglicht.

---

## 10. Zusammenfassung

Das Dashboard-Modul ist in mehrere unabhängige Ebenen unterteilt, um eine klar nachvollziehbare Trennung von Aufgaben zu erreichen.
Die vorgesehene Architektur unterstützt Wartbarkeit und Erweiterbarkeit, ohne einzelne Komponenten zu überladen oder Abhängigkeiten unnötig zu verflechten.

---

Wenn du möchtest, kann ich:

✔ `README.md` ebenfalls überarbeiten
✔ Grafische Architektur-Diagramme hinzufügen
✔ Code-Beispiele in das README integrieren
✔ eine Version speziell für Entwickler oder Administratoren erstellen
