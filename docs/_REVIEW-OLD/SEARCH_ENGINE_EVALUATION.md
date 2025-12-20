# Search Engine Evaluation: ElasticSearch vs MeiliSearch

**Stand**: 7. Dezember 2025  
**Status**: 🔬 Evaluierung  
**Version**: 0.3.0

## Überblick

Dieses Dokument evaluiert ElasticSearch und MeiliSearch als mögliche Skalierungslösungen für die Full-Text-Search-Funktionalität des ERP-Systems.

## Aktuelle Lösung

**SearchService** (In-Memory)

- ✅ Einfache Integration
- ✅ Keine zusätzliche Infrastruktur
- ✅ Fuzzy Matching mit Levenshtein Distance
- ✅ Faceted Search (kinds, tags, areas)
- ✅ Relevance Scoring
- ❌ Begrenzte Skalierbarkeit (limitiert durch RAM)
- ❌ Keine Persistenz bei Neustart
- ❌ Keine verteilte Suche

---

## ElasticSearch

### Eigenschaften

**Version**: 8.x (aktuell)  
**Lizenz**: Elastic License 2.0 (eingeschränkt), SSPL für Open Source  
**Sprache**: Java  
**Typ**: Distributed Search & Analytics Engine

### Vorteile ✅

1. **Reife Technologie**
   - Seit 2010 auf dem Markt
   - Große Community und umfangreiches Ökosystem
   - Umfassende Dokumentation

2. **Features**
   - Full-Text-Search mit BM25 Ranking
   - Fuzzy Matching und Synonym-Support
   - Faceted Search und Aggregationen
   - Geospatiale Suche
   - Mehrsprachige Analyzer
   - Machine Learning Features (anomaly detection)

3. **Skalierbarkeit**
   - Horizontal skalierbar (Sharding & Replication)
   - Millionen von Dokumenten
   - Clustered Setup für High Availability

4. **Integration**
   - Offizielle Clients für Node.js
   - RESTful API
   - Integration mit ELK Stack (Logstash, Kibana)

5. **Analytics & Observability**
   - Kibana für Visualisierung
   - Monitoring und Alerting
   - Log-Aggregation

### Nachteile ❌

1. **Komplexität**
   - Steile Lernkurve
   - Komplexe Konfiguration
   - Aufwändiges Tuning notwendig

2. **Ressourcen**
   - Hoher Memory-Bedarf (min. 2GB RAM empfohlen)
   - CPU-intensiv für Indexierung
   - Storage-Overhead für Indizes

3. **Lizenz**
   - Elastic License 2.0 (nicht Open Source)
   - Einschränkungen für managed Services
   - SSPL für Open Source Version (restriktiv)

4. **Betrieb**
   - Requires Java Runtime
   - Komplexes Cluster-Management
   - Upgrade-Pfade können breaking sein

### Kosten

- **Self-Hosted**: Infrastruktur-Kosten (Server, Storage)
- **Elastic Cloud**: Ab $95/Monat (Basic)
- **AWS OpenSearch**: Ab $13/Monat (t3.small.search)

### Use Cases (Ideal für)

- Große Datenmengen (>100k Dokumente)
- Komplexe Analytics-Requirements
- Log-Aggregation und Monitoring
- Multi-Tenancy mit Isolation

---

## MeiliSearch

### Eigenschaften

**Version**: 1.x (aktuell)  
**Lizenz**: MIT (Open Source)  
**Sprache**: Rust  
**Typ**: Lightweight Search Engine

### Vorteile ✅

1. **Developer Experience**
   - Einfaches Setup (Single Binary)
   - Intuitive API
   - Auto-Schema-Detection
   - Sehr gute Dokumentation

2. **Performance**
   - Extrem schnelle Suche (<50ms)
   - Typo-Tolerant out-of-the-box
   - Instant Search (Search-as-you-type)
   - Effiziente Indexierung

3. **Features**
   - Relevance Ranking
   - Faceted Search (Filters)
   - Typo-Tolerance (automatisch)
   - Stop Words
   - Synonyme
   - Highlighting

4. **Einfacher Betrieb**
   - Single Binary (keine JVM)
   - Geringer Memory-Footprint (~100MB)
   - RESTful API
   - Docker-Image verfügbar

5. **Lizenz**
   - MIT License (echtes Open Source)
   - Keine Einschränkungen
   - Community-freundlich

### Nachteile ❌

1. **Eingeschränkte Features**
   - Keine Geospatial-Suche
   - Keine Aggregationen (nur Facets)
   - Keine Machine Learning Features
   - Weniger Analyzer-Optionen

2. **Skalierung**
   - Single-Node-Architektur (keine native Sharding)
   - Vertical Scaling only
   - Keine Cluster-Unterstützung (in Roadmap)
   - Limitiert auf ~100 Millionen Dokumente

3. **Ökosystem**
   - Kleinere Community
   - Weniger Third-Party-Tools
   - Noch in aktiver Entwicklung

4. **Analytics**
   - Kein Built-in Monitoring
   - Kein natives Analytics-Dashboard
   - Externes Monitoring notwendig

### Kosten

- **Self-Hosted**: Minimal (nur Server-Kosten)
- **MeiliSearch Cloud**: Ab $39/Monat (Hobby Plan)

### Use Cases (Ideal für)

- Kleine bis mittlere Datenmengen (<10M Dokumente)
- Simple Full-Text-Search
- Search-as-you-type Interfaces
- Schnelle Time-to-Market
- Kosteneffizienz

---

## Vergleich

| Kriterium                  | ElasticSearch        | MeiliSearch      | Aktuell (In-Memory)  |
| -------------------------- | -------------------- | ---------------- | -------------------- |
| **Setup-Komplexität**      | Hoch (JVM, Config)   | Niedrig (Binary) | Sehr niedrig         |
| **Search-Geschwindigkeit** | <100ms               | <50ms            | <10ms (RAM)          |
| **Indexierung**            | Mittel-schnell       | Sehr schnell     | Instant              |
| **Memory-Footprint**       | Hoch (>2GB)          | Niedrig (~100MB) | Abhängig von Daten   |
| **Skalierbarkeit**         | Horizontal (Cluster) | Vertical only    | In-Memory limitiert  |
| **Lizenz**                 | Elastic 2.0/SSPL     | MIT              | N/A                  |
| **Typo-Tolerance**         | Konfigurierbar       | Built-in         | Levenshtein (custom) |
| **Analytics**              | Kibana               | Extern           | Keine                |
| **Learning Curve**         | Steil                | Flach            | Minimal              |
| **Community**              | Sehr groß            | Wachsend         | N/A                  |
| **Kosten (Self-Hosted)**   | Mittel-Hoch          | Niedrig          | Minimal              |

---

## Empfehlung

### Kurzfristig (0-6 Monate): **BEHALTEN (In-Memory)**

**Begründung**:

- Aktuelles Datenvolumen: <10k Funktions-Nodes
- Geschwindigkeit ist bereits exzellent (<10ms)
- Keine zusätzliche Infrastruktur notwendig
- Entwicklungsfokus auf Business-Features

**Next Steps**:

1. ✅ Monitoring für Search-Performance implementieren
2. ✅ Metriken sammeln (Query-Count, Latency, Memory)
3. ⏳ Schwellenwerte definieren (wann Migration notwendig)

### Mittelfristig (6-12 Monate): **MeiliSearch**

**Begründung**:

- Einfache Migration (RESTful API)
- MIT Lizenz (keine Einschränkungen)
- Geringer Ressourcen-Overhead
- Gute Developer Experience
- Ausreichend für erwartetes Wachstum (<100k Nodes)

**Migration Path**:

1. MeiliSearch parallel zum aktuellen Service laufen lassen
2. A/B-Testing für Performance-Vergleich
3. Schrittweise Migration (Dual-Write)
4. Cutover nach erfolgreichen Tests

**Integration (Beispiel)**:

```typescript
import { MeiliSearch } from "meilisearch";

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST,
  apiKey: process.env.MEILISEARCH_API_KEY,
});

const index = client.index("function-nodes");

// Search
const results = await index.search("query", {
  attributesToHighlight: ["name", "description"],
  filters: 'kind = "function" AND area = "crm"',
  limit: 20,
});
```

### Langfristig (>12 Monate): **ElasticSearch (Optional)**

**Nur wenn**:

- Datenvolumen >10 Millionen Dokumente
- Komplexe Analytics-Requirements
- Multi-Tenancy mit strikter Isolation
- Geospatiale oder ML-Features notwendig

**Voraussetzungen**:

- Dediziertes DevOps-Team
- Cluster-Management-Expertise
- Höheres Budget für Infrastruktur

---

## Technische Integration

### Architektur-Änderungen

```typescript
// apps/backend/src/services/searchService.ts

interface ISearchProvider {
  search(query: string, options: SearchOptions): Promise<SearchResults>;
  index(documents: Document[]): Promise<void>;
  delete(ids: string[]): Promise<void>;
}

class InMemorySearchProvider implements ISearchProvider {
  // Aktueller Code
}

class MeiliSearchProvider implements ISearchProvider {
  // MeiliSearch Integration
}

class ElasticSearchProvider implements ISearchProvider {
  // ElasticSearch Integration
}

// Factory Pattern
class SearchServiceFactory {
  static create(
    provider: "memory" | "meilisearch" | "elasticsearch",
  ): ISearchProvider {
    switch (provider) {
      case "memory":
        return new InMemorySearchProvider();
      case "meilisearch":
        return new MeiliSearchProvider();
      case "elasticsearch":
        return new ElasticSearchProvider();
    }
  }
}
```

### Environment Configuration

```bash
# .env
SEARCH_PROVIDER=memory # memory | meilisearch | elasticsearch

# MeiliSearch Config
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=masterKey

# ElasticSearch Config
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_API_KEY=your-api-key
```

### Docker Compose (Development)

```yaml
# docker-compose.yml
services:
  meilisearch:
    image: getmeili/meilisearch:v1.5
    ports:
      - "7700:7700"
    environment:
      MEILI_MASTER_KEY: masterKey
      MEILI_ENV: development
    volumes:
      - ./data/meilisearch:/meili_data

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    ports:
      - "9200:9200"
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms1g -Xmx1g
    volumes:
      - ./data/elasticsearch:/usr/share/elasticsearch/data
```

---

## Monitoring & Metrics

### Zu überwachende Metriken

1. **Query Performance**
   - Latency (p50, p95, p99)
   - Throughput (Queries/sec)
   - Error Rate

2. **Index Health**
   - Indexierungsrate
   - Index-Größe
   - Memory-Nutzung

3. **Business Metrics**
   - Top Search Queries
   - Zero-Results-Rate
   - Click-Through-Rate

### Migration Trigger

**Migration zu externer Search Engine wenn**:

- Query Latency >100ms (p95)
- Memory-Nutzung >4GB
- Datenvolumen >50k Dokumente
- > 1000 Queries/Minute

---

## Entscheidungsmatrix

| Kriterium          | Gewichtung | In-Memory | MeiliSearch | ElasticSearch |
| ------------------ | ---------- | --------- | ----------- | ------------- |
| **Einfachheit**    | 25%        | 10        | 9           | 4             |
| **Performance**    | 20%        | 10        | 9           | 8             |
| **Skalierbarkeit** | 20%        | 4         | 7           | 10            |
| **Kosten**         | 15%        | 10        | 9           | 5             |
| **Features**       | 10%        | 6         | 7           | 10            |
| **Lizenz**         | 10%        | 10        | 10          | 6             |
| **Gesamt**         | 100%       | **8.15**  | **8.30**    | **6.85**      |

**Ergebnis**: MeiliSearch ist die beste Wahl für mittelfristige Skalierung.

---

## Fazit

1. **Sofort (Phase 0-6 Monate)**: In-Memory-Lösung beibehalten
2. **Mittelfristig (Phase 6-12 Monate)**: Migration zu MeiliSearch
3. **Langfristig (Phase >12 Monate)**: ElasticSearch nur bei Bedarf

**Nächste Schritte**:

- [ ] Search-Analytics-Dashboard implementieren (Monitoring)
- [ ] Performance-Metriken sammeln
- [ ] MeiliSearch POC mit echten Daten
- [ ] Migration-Guide dokumentieren

---

**Referenzen**:

- [MeiliSearch Dokumentation](https://www.meilisearch.com/docs)
- [ElasticSearch Dokumentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [OpenSearch (Open Source Alternative)](https://opensearch.org/)

**Maintainer**: Thomas Heisig  
**Letzte Aktualisierung**: 7. Dezember 2025
