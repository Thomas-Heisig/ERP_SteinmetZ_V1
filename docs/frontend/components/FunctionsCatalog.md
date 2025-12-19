# **README – FunctionsCatalog Component**

Die `FunctionsCatalog`-Komponente stellt eine clientseitige Oberfläche zur Verfügung, mit der Funktionen, Workflows, Datensätze und ähnliche Knotenstrukturen angezeigt, durchsucht und analysiert werden können.
Das Modul ist modular aufgebaut und kann in unterschiedlichen UI-Umgebungen verwendet werden.

---

## **Inhalt**

1. Übersicht
2. Hauptfunktionen
3. Eigenschaften (`FunctionsCatalogProps`)
4. Architektur
5. Komponenten
6. Thema/Styles
7. Export-Funktionen
8. Favoriten
9. Verlauf
10. Entwicklerhinweise

---

## **1. Übersicht**

Der FunctionsCatalog liefert:

- eine Suchfunktion mit Resultatliste, Highlighting und Scoring
- eine Detailansicht für alle Knoten (`NodeDetail`)
- Breadcrumb-Navigation
- Metadaten-, Schema- und Warnungsblöcke
- Exportmöglichkeiten (JSON, Markdown, YAML)
- Favoritenverwaltung (LocalStorage)
- Verlaufshistorie (LocalStorage)
- Fehler- und Ladezustandsmeldungen
- Lint-Ergebnisse für diagnostische Zwecke

Alle Daten stammen aus dem Hook `useFunctionsCatalog`, der Daten vom Backend lädt und aufbereitet.

---

## **2. Hauptfunktionen**

- **Suchen:** Volltextsuche über Knoten. Ergebnisse werden dynamisch angezeigt.
- **Navigation:** Auswahl eines Knotens, Darstellung von Details und Metadaten.
- **Linting:** Ausgabe von statischen Prüfungen.
- **Export:** Einzelne Knoten lassen sich als JSON, Markdown oder YAML exportieren.
- **Favoriten:** Nutzer können Knoten markieren.
- **Historie:** Kürzlich angesehene Knoten werden gespeichert.

---

## **3. Eigenschaften (`FunctionsCatalogProps`)**

Die Komponente akzeptiert Konfigurationsparameter, u. a.:

- `roles`, `features`: Zugriffskontext für Backend-Abfragen
- `baseUrl`: Serverpfad für Index- und Node-Abfragen
- `theme`: „auto“, „light“, „dark“ oder „lcars“
- `locale`: Sprachkonfiguration
- `permissions`: optionale Rechteobjekte
- `config`: weitere verhaltenssteuernde Parameter
- Callback-Funktionen wie
  - `onNodeSelect(node)`
  - `onSearch(query, results)`
  - `onError(error)`
  - `onExport(payload)`

---

## **4. Architektur**

Die Struktur ist in Hauptbereiche unterteilt:

```text
FunctionsCatalog/
 ├─ FunctionsCatalog.tsx
 ├─ details/
 ├─ search/
 ├─ layout/
 ├─ lint/
 ├─ features/
 │   ├─ code/
 │   ├─ contextMenu/
 │   ├─ export/
 │   ├─ favorites/
 │   └─ history/
 └─ styles/
```

Die Logik bleibt klar getrennt von der Darstellung.
Persistenz (Favoriten, Verlauf) erfolgt lokal im Browser.

---

## **5. Komponenten**

**Wesentliche UI-Komponenten:**

- **`TopBar`** – Suche, Reload, Lint
- **`SearchBar`, `SearchResults`, `SearchItem`**
- **`NodeDetails`** – vollständige Detaildarstellung
- **`NodeHeader`** – Titel, Icon, Badges
- **`NodeInfoGrid`** – technische Informationen
- **`NodeMetaBlocks`** – Meta/Schemata/Warnungen
- **`Breadcrumbs`**
- **`Panel`** – generische Containerkomponente
- **`LintPanel`**

**Code-Viewer:**

- `MonacoCode` – readonly Monaco-Editor mit Lazy-Loading
- `useMonacoThemeSync` – Theme-Anpassung

**Export:**

- `exportNodeAsJSON(...)`
- `exportNodeAsMarkdown(...)`
- `exportNodeAsYAML(...)`
- `ExportMenu` – Kontextmenü für Exportoptionen

**Favoriten:**

- `FavoritesStore` (Singleton)
- `useFavorites` – React Hook

**Verlauf:**

- `HistoryStore`
- `useHistory`

---

## **6. Thema / Styles**

Drei getrennte Stylesheets:

- `fc-base.css` – Grundlayout, Variablen
- `fc-dark.css` – dunkles Theme
- `fc-lcars.css` – alternativer Stil

Das Theme wird über `data-theme="light" | "dark" | "lcars"` am `<html>`-Element gesteuert.

---

## **7. Export-Funktionen**

Unterstützt werden:

| Format   | Funktion                     | Eigenschaften                            |
| -------- | ---------------------------- | ---------------------------------------- |
| JSON     | `exportNodeAsJSON(node)`     | Serialisierung mit Zyklen-Abfang         |
| Markdown | `exportNodeAsMarkdown(node)` | erzeugt standardisierten Markdownbericht |
| YAML     | `exportNodeAsYAML(node)`     | YAML Serializer ohne Fremdbibliotheken   |

Alle Funktionen lösen Downloads im Browser aus.

---

## **8. Favoriten**

Favoriten werden lokal gespeichert, enthalten u. a.:

- `id`
- `title`
- `kind`
- `addedAt`
- optional `tags`, `category`

`useFavorites()` liefert Lese-/Schreiboperationen mit automatischer Reaktivität.

---

## **9. Verlauf**

Der Verlauf speichert:

- zuletzt angesehene Knoten,
- Zeitstempel (`viewedAt`),
- Typ (`kind`),
- Aktionstyp (`view`).

Die Einträge sind auf 50 begrenzt.
`useHistory()` stellt den Zugriff bereit.

---

## **10. Entwicklerhinweise**

### Einbindung

```tsx
import { FunctionsCatalog } from "@/components/FunctionsCatalog";

<FunctionsCatalog
  baseUrl="/api/catalog"
  roles={["admin"]}
  features={["search", "details"]}
/>;
```

### Theme setzen

```ts
document.documentElement.dataset.theme = "dark";
```

### Node auswählen

```ts
function handleSelect(node) {
  console.log("Ausgewählt:", node.id);
}
```

### Styling

Die Komponente überschreibt keine globalen Styles und ist über CSS-Variablen anpassbar.

---

Wenn du möchtest, erstelle ich zusätzlich:

- eine **README für das Backend-Schema** (`NodeDetail`, `SearchResult`, etc.),
- eine **Dokumentation der Hooks** (`useFunctionsCatalog`, `useFavorites`, `useHistory`),
- oder eine **Markdown-Dokumentation pro Featuregruppe**.
