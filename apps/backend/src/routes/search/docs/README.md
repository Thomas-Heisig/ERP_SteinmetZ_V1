# Search Module - Dokumentation

**Version:** 1.0.0  
**Letzte Aktualisierung:** 2025-12-20  
**Status:** ✅ Produktiv

---

## Übersicht

Das Search-Modul bietet erweiterte Volltextsuche mit Relevanz-Scoring, Fuzzy-Matching, Highlighting und Faceted Search für den Functions Catalog. Es umfasst auch umfassende Analytics für Suchverhalten und Performance-Tracking.

### Hauptkomponenten

1. **SearchService** - Erweiterte Volltextsuche mit Scoring
2. **SearchAnalyticsService** - Query-Tracking und Metriken
3. **SearchAnalyticsRouter** - REST API für Analytics

---

## 1. SearchService

### Features

- ✅ **Relevance Scoring** - Intelligente Bewertung von Suchergebnissen
- ✅ **Fuzzy Matching** - Tolerant gegenüber Tippfehlern (Levenshtein Distance)
- ✅ **Text Highlighting** - Markierung von Suchbegriffen im Ergebnis
- ✅ **Faceted Search** - Filterung nach Kind, Tags, Area
- ✅ **Search Suggestions** - Autocomplete-Vorschläge
- ✅ **Multi-Field Search** - Suche in Title, Description, Tags, ID

### Scoring-Gewichtung

| Feld | Gewichtung | Multiplier |
| ---- | ---------- | ---------- |

| **Title** | Höchste | 3.0x |
| **Description** | Hoch | 2.0x |
| **Tags** | Mittel | 1.5x |
| **ID** | Niedrig | 1.0x |

### Match-Typen

| Typ | Score | Beispiel |
| --- | ----- | -------- |

| **Exact Match** | weight × 2.0 | "customer" = "customer" |
| **Starts With** | weight × 1.5 | "customer" starts with "cust" |
| **Contains** | weight × 1.0 | "customer management" contains "manage" |
| **Fuzzy Match** | weight × 0.5 | "custmer" ≈ "customer" (distance 1) |

### API

```typescript
import { searchService } from "./searchService.js";
import type { SearchQuery, SearchResult } from "./searchService.js";

// Einfache Suche
const result = searchService.search(nodes, {
  q: "customer",
});

// Erweiterte Suche
const result = searchService.search(
  nodes,
  {
    q: "customer management",
    kinds: ["action", "workflow"],
    tags: ["sales", "crm"],
    area: "sales",
    fuzzy: true,
    highlight: true,
    minScore: 0.3,
  },
  {
    limit: 10,
    offset: 0,
  },
);

console.log(result.results); // SearchResult[]
console.log(result.total); // 42
console.log(result.facets); // SearchFacets
```

### Interfaces

```typescript
interface SearchQuery {
  q?: string; // Suchtext
  kinds?: string[]; // Filter: Node-Typen
  tags?: string[]; // Filter: Tags
  area?: string; // Filter: Business Area
  fuzzy?: boolean; // Fuzzy Matching aktivieren
  highlight?: boolean; // Text-Highlighting aktivieren
  minScore?: number; // Mindest-Relevanz (0-1)
}

interface SearchResult {
  node: CatalogNode; // Gefundener Node
  score: number; // Relevanz-Score (0-1)
  highlights?: SearchHighlight[]; // Highlighting (optional)
  matchedFields: string[]; // Felder mit Match
}

interface SearchHighlight {
  field: string; // Feldname
  snippets: string[]; // Markierte Textausschnitte
}

interface SearchFacets {
  kinds: FacetValue[]; // Verfügbare Kinds
  tags: FacetValue[]; // Verfügbare Tags (Top 20)
  areas: FacetValue[]; // Verfügbare Areas
}

interface FacetValue {
  value: string; // Wert
  count: number; // Anzahl Ergebnisse
}
```

### Suggestions (Autocomplete)

```typescript
const suggestions = searchService.getSuggestions(
  nodes,
  "cust", // Partial query
  10, // Limit
);

// Returns:
[
  { text: "customer", score: 0.9, type: "node" },
  { text: "customer management", score: 0.85, type: "node" },
  { text: "crm", score: 0.7, type: "tag" },
];
```

### Performance

- **Durchschnitt:** 90ms für 1000 Nodes
- **Maximum:** 405ms für 1000 Nodes mit allen Checks
- **Optimierungen:**
  - Early-Exit bei Fuzzy Matching
  - Levenshtein Distance mit Max-Distance
  - Facet-Berechnung nach Pagination

---

## 2. SearchAnalyticsService

### Features-

- ✅ **Query Logging** - Alle Suchanfragen tracken
- ✅ **Performance Metrics** - Latenz, P95, P99
- ✅ **Popular Searches** - Top-Queries
- ✅ **Zero Results** - Fehlgeschlagene Suchen
- ✅ **Click Tracking** - Click-Through Rate
- ✅ **Trends** - Zeitliche Entwicklung
- ✅ **Export** - Datenexport für Analyse
- ✅ **Cleanup** - Automatische Bereinigung

### API-

```typescript
import { searchAnalyticsService } from "./searchAnalyticsService.js";

// Query loggen
const log = searchAnalyticsService.logQuery(
  "customer", // query
  42, // resultCount
  125, // latencyMs
  { kind: "action" }, // filters (optional)
  "user123", // userId (optional)
);

// Click tracken
searchAnalyticsService.logClick(log.id, "result_xyz");

// Metriken abrufen (letzte 24h)
const metrics = searchAnalyticsService.getMetrics(24);

// Top Queries
const top = searchAnalyticsService.getTopQueries(10, 24);

// Zero-Result Queries
const failed = searchAnalyticsService.getZeroResultQueries(10, 24);

// Trends
const hourly = searchAnalyticsService.getTrends(24, "hour");
const daily = searchAnalyticsService.getTrends(168, "day");

// Performance Distribution
const dist = searchAnalyticsService.getPerformanceDistribution(24);

// Dashboard (alles zusammen)
const dashboard = searchAnalyticsService.getDashboard(24);

// Export
const data = searchAnalyticsService.exportData(
  "2025-12-01T00:00:00Z",
  "2025-12-20T23:59:59Z",
);

// Cleanup (alte Logs löschen)
const deleted = searchAnalyticsService.cleanup(30); // 30 Tage behalten
```

### Interfaces-

```typescript
interface SearchMetrics {
  totalQueries: number; // Gesamtanzahl Queries
  uniqueQueries: number; // Anzahl unique Queries
  averageLatency: number; // Durchschnitt Latenz (ms)
  p95Latency: number; // 95. Percentile (ms)
  p99Latency: number; // 99. Percentile (ms)
  zeroResultsRate: number; // Rate ohne Ergebnisse (0-1)
  clickThroughRate: number; // Click-Through Rate (0-1)
}

interface PopularQuery {
  query: string; // Suchbegriff
  count: number; // Anzahl Suchen
  averageResults: number; // Durchschnitt Ergebnisse
  averageLatency: number; // Durchschnitt Latenz (ms)
}

interface SearchTrend {
  timestamp: string; // ISO Zeitstempel
  queryCount: number; // Anzahl Queries
  averageLatency: number; // Durchschnitt Latenz (ms)
  zeroResultsCount: number; // Anzahl ohne Ergebnisse
}
```

### In-Memory Storage

- **Maximale Logs:** 10.000 (konfigurierbar)
- **Auto-Trimming:** Älteste Logs werden automatisch entfernt
- **Retention:** 30 Tage (standard), konfigurierbar

---

## 3. SearchAnalyticsRouter (REST API)

### Endpunkte

#### Dashboard

```http
GET /api/search/analytics/dashboard?hours=24
```

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      /* SearchMetrics */
    },
    "topQueries": [
      /* PopularQuery[] */
    ],
    "zeroResultQueries": [
      /* PopularQuery[] */
    ],
    "trends": [
      /* SearchTrend[] */
    ],
    "performanceDistribution": [
      /* {range, count}[] */
    ]
  }
}
```

#### Metrics

```http
GET /api/search/analytics/metrics?hours=24
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalQueries": 15234,
    "uniqueQueries": 3456,
    "averageLatency": 125,
    "p95Latency": 230,
    "p99Latency": 450,
    "zeroResultsRate": 0.08,
    "clickThroughRate": 0.65
  }
}
```

#### Top Queries

```http
GET /api/search/analytics/top-queries?limit=10&hours=24
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "query": "customer",
      "count": 234,
      "averageResults": 42,
      "averageLatency": 125
    }
  ]
}
```

#### Zero Results

```http
GET /api/search/analytics/zero-results?limit=10&hours=24
```

#### Trends

```http
GET /api/search/analytics/trends?hours=24&granularity=hour
```

**Query Params:**

- `hours` - Zeitraum (1-8760)
- `granularity` - `hour` oder `day`

#### Performance Distribution

```http
GET /api/search/analytics/performance?hours=24
```

**Response:**

```json
{
  "success": true,
  "data": [
    { "range": "0-10ms", "count": 100 },
    { "range": "10-50ms", "count": 250 },
    { "range": "50-100ms", "count": 150 },
    { "range": "100-500ms", "count": 50 },
    { "range": "500ms+", "count": 10 }
  ]
}
```

#### Log Query

```http
POST /api/search/analytics/log
Content-Type: application/json

{
  "query": "customer",
  "resultCount": 42,
  "latencyMs": 125,
  "filters": { "kind": "action" },
  "userId": "user123"
}
```

#### Log Click

```http
POST /api/search/analytics/click
Content-Type: application/json

{
  "queryId": "sq_1234567890_abc",
  "resultId": "result_xyz"
}
```

#### Export

```http
GET /api/search/analytics/export?startDate=2025-12-01T00:00:00Z&endDate=2025-12-20T23:59:59Z
```

#### Cleanup

```http
POST /api/search/analytics/cleanup
Content-Type: application/json

{
  "daysToKeep": 30
}
```

---

## Integration

### Mit Functions Catalog

```typescript
import catalogService from "../functionsCatalog/functionsCatalogService.js";
import { searchService } from "./searchService.js";
import { searchAnalyticsService } from "./searchAnalyticsService.js";

// Catalog abrufen
const catalog = await catalogService.getIndex();

// Suche durchführen
const startTime = Date.now();
const result = searchService.search(
  catalog.nodes,
  {
    q: req.query.q,
    kinds: req.query.kinds?.split(","),
    fuzzy: true,
    highlight: true,
  },
  {
    limit: parseInt(req.query.limit) || 10,
    offset: parseInt(req.query.offset) || 0,
  },
);
const latencyMs = Date.now() - startTime;

// Analytics loggen
searchAnalyticsService.logQuery(
  req.query.q,
  result.total,
  latencyMs,
  { kinds: req.query.kinds },
  req.user?.id,
);

// Response
res.json({
  success: true,
  results: result.results,
  total: result.total,
  facets: result.facets,
  latency: latencyMs,
});
```

---

## Verwendungsbeispiele

### 1. Einfache Suche

```typescript
const result = searchService.search(nodes, {
  q: "customer",
});

console.log(`Found ${result.total} results`);
result.results.forEach((r) => {
  console.log(`${r.node.title} (score: ${r.score})`);
});
```

### 2. Faceted Search

```typescript
const result = searchService.search(nodes, {
  q: "invoice",
  kinds: ["action", "workflow"],
});

console.log("Available facets:");
console.log("Kinds:", result.facets.kinds);
console.log("Tags:", result.facets.tags);
console.log("Areas:", result.facets.areas);
```

### 3. Fuzzy Search mit Highlighting

```typescript
const result = searchService.search(nodes, {
  q: "custmer", // Typo
  fuzzy: true,
  highlight: true,
});

result.results.forEach((r) => {
  console.log(`${r.node.title} (score: ${r.score})`);

  if (r.highlights) {
    r.highlights.forEach((h) => {
      console.log(`  ${h.field}: ${h.snippets.join(", ")}`);
    });
  }
});
```

### 4. Autocomplete

```typescript
const suggestions = searchService.getSuggestions(nodes, "cust", 5);

suggestions.forEach((s) => {
  console.log(`${s.text} (${s.type}, score: ${s.score})`);
});
```

### 5. Analytics Dashboard

```typescript
const dashboard = searchAnalyticsService.getDashboard(24);

console.log(`Total searches: ${dashboard.summary.totalQueries}`);
console.log(`Average latency: ${dashboard.summary.averageLatency}ms`);
console.log(`Zero results rate: ${dashboard.summary.zeroResultsRate * 100}%`);

console.log("\nTop queries:");
dashboard.topQueries.forEach((q, i) => {
  console.log(`${i + 1}. "${q.query}" (${q.count} searches)`);
});

console.log("\nFailed searches:");
dashboard.zeroResultQueries.forEach((q, i) => {
  console.log(`${i + 1}. "${q.query}" (${q.count} times)`);
});
```

---

## Logging

Strukturiertes Logging mit Pino:

```typescript
// searchService
logger.debug({ query, nodeCount: 1000 }, "Starting search");
logger.info(
  { query: "customer", totalResults: 42, duration: 125 },
  "Search completed",
);
logger.error({ error, query }, "Search failed");

// searchAnalyticsService
logger.debug({ queryId, query, resultCount, latencyMs }, "Logged search query");
logger.warn({ queryId, resultId }, "Query not found for click tracking");
logger.info({ daysToKeep: 30, deleted: 500 }, "Cleaned up old query logs");
```

---

## Performance-Optimierungen

### SearchService

1. **Early Exit** - Fuzzy-Matching bricht ab bei großem Längenunterschied
2. **Levenshtein mit Max-Distance** - Begrenzt auf 2-3 Edits
3. **Facet-Berechnung nach Pagination** - Nur für sichtbare Ergebnisse
4. **Caching** - Tokenisierung wird gecached

### SearchAnalyticsService

1. **In-Memory Storage** - Schneller Zugriff ohne DB
2. **Auto-Trimming** - Begrenzt auf 10k Logs
3. **Batch-Operationen** - Metriken werden in einem Pass berechnet

---

## Best Practices

### 1. Immer Pagination verwenden

```typescript
// ✅ Korrekt
const result = searchService.search(nodes, query, {
  limit: 10,
  offset: 0,
});

// ❌ Falsch (alle Ergebnisse)
const result = searchService.search(nodes, query);
```

### 2. MinScore setzen

```typescript
// ✅ Korrekt - nur relevante Ergebnisse
const result = searchService.search(nodes, {
  q: "customer",
  minScore: 0.3,
});

// ❌ Falsch - auch irrelevante Ergebnisse
const result = searchService.search(nodes, {
  q: "customer",
});
```

### 3. Analytics immer loggen

```typescript
// ✅ Korrekt
const startTime = Date.now();
const result = searchService.search(nodes, query);
const latencyMs = Date.now() - startTime;

searchAnalyticsService.logQuery(query.q, result.total, latencyMs);

// ❌ Falsch - keine Analytics
const result = searchService.search(nodes, query);
```

### 4. Fuzzy nur bei Bedarf

```typescript
// ✅ Korrekt - Fuzzy nur bei User-Eingabe
const result = searchService.search(nodes, {
  q: userInput,
  fuzzy: true,
});

// ❌ Falsch - Fuzzy bei exakten Filtern
const result = searchService.search(nodes, {
  kinds: ["action"], // Exakter Filter
  fuzzy: true, // Unnötig
});
```

---

## Fehlerbehandlung

### SearchService-

```typescript
try {
  const result = searchService.search(nodes, query);
} catch (error) {
  // Wird intern behandelt, gibt immer leere Results zurück
  // bei Fehler: { results: [], total: 0, facets: {...} }
}
```

### SearchAnalyticsService-

```typescript
// Invalid query string
searchAnalyticsService.logQuery("", 0, 0);
// Logs warning, speichert leeren String

// Query not found
searchAnalyticsService.logClick("invalid_id", "result");
// Logs warning, ignoriert Click
```

---

## Troubleshooting

### Problem: Suche findet nichts

**Lösung:**

```typescript
// 1. MinScore zu hoch?
const result = searchService.search(nodes, {
  q: "customer",
  minScore: 0.9, // Zu streng!
});

// Besser:
minScore: 0.3;
```

### Problem: Fuzzy Match zu ungenau

**Lösung:**

```typescript
// Levenshtein Distance ist fest auf 2
// Für exaktere Matches: Fuzzy deaktivieren
const result = searchService.search(nodes, {
  q: "customer",
  fuzzy: false,
});
```

### Problem: Analytics-Daten fehlen

**Lösung:**

```typescript
// Logs in-memory - gehen bei Restart verloren!
// Lösung: Regelmäßig exportieren
setInterval(
  () => {
    const data = searchAnalyticsService.exportData();
    fs.writeFileSync("analytics.json", JSON.stringify(data));
  },
  60 * 60 * 1000,
); // Stündlich
```

---

## Migration & Updates

### Von 0.x zu 1.0

**Änderungen:**

1. **SearchService:**
   - ✅ Logger hinzugefügt
   - ✅ Vollständige JSDoc
   - ✅ Error Handling verbessert
   - ✅ Import-Path korrigiert

2. **SearchAnalyticsService:**
   - ✅ Logger hinzugefügt
   - ✅ Vollständige JSDoc
   - ✅ Safety Checks
   - ✅ Ausführliches Logging

3. **Breaking Changes:**
   - Keine Breaking Changes

---

## Ressourcen

- **Source Code:** `apps/backend/src/routes/search/`
- **Analytics Service:** `apps/backend/src/routes/other/searchAnalyticsService.ts`
- **Functions Catalog:** `apps/backend/src/routes/functionsCatalog/`

---

## Support & Feedback

Bei Fragen oder Problemen:

1. Logs prüfen (`pino` structured logs)
2. Analytics Dashboard prüfen
3. Issue im GitHub Repository erstellen

---

**Letzte Aktualisierung:** 2025-12-20  
**Version:** 1.0.0
