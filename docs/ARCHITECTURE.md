# ERP SteinmetZ — Architekturüberblick (Production-Ready Ergänzungen)

Ziel: ERP SteinmetZ zu einer produktionsreifen Plattform ausbauen mit Fokus auf:

- Datenkonsistenz (SAGA, Idempotenz, Versionierung)
- Resilienz & Fehlerbehandlung (Circuit Breaker, Retry, DLQ)
- Compliance (GoBD, GDPR, Audit Trail)
- Observability & Performance (Metriken, Health Checks, Query-Analysis)

1. Kernkomponenten

- API-Gateway (Auth, Rate-Limit, Request-ID)
- Backend-Services (modular, z.B. hr, payroll, billing) — einzelne Services kommunizieren via Events/Commands
- TransactionCoordinator (SAGA Orchestrator) — Orchestrierung lang laufender, verteilter Prozesse
- IdempotencyStore — Verhinderung doppelt ausgeführter Requests
- Postgres (Primärer Datenspeicher) + Replica(s) für Leser
- Materialized Views & Refresh-Strategien
- Audit Trail (GoBD-konform) — Vor/Nach-Zustände
- Monitoring: Prometheus + Grafana, Tracing: OpenTelemetry
- Queue: Kafka oder RabbitMQ (Empfohlener Standard: Kafka für hohe Durchsatzanforderungen)
- Local/Cloud KI-Orchestrierung — Modell-Registry + A/B Testing

2. Datenkonsistenz-Strategie

- Use SAGA Pattern für verteilte Transaktionen (TransactionCoordinator)
- Optimistic Locking: version-nummern in Entities
- Idempotency über request_id + operation_hash
- DSL für Data Integrity Rules (architekturmäßig vorbereitet; Regeln in DB oder Policy-Engine)

3. Resilienz

- Circuit Breaker pro externem System
- Retry-Policies mit exponentiellem Backoff + Jitter
- Dead Letter Queue für nicht verarbeitbare Nachrichten
- Health Checks: aggregierte Abhängigkeiten (DB, Queue, KI-Modelle, Externe APIs)

4. Compliance & Audit

- Audit-Trail-Table mit before/after JSONB, Context, Tags
- Aufbewahrungsfristen, automatische Policies (TTL & Archivierung)
- Vier-Augen-Prinzip (Approval-Flows)

5. Observability & SLOs

- Request tracing (OpenTelemetry)
- Metriken: latencies, error rates, MTTR, model hallucination rate
- Alerts: >1% failed validations, service error budget breaches

6. Deployment

- Docker Compose for local dev
- Kubernetes manifests for production (Blue/Green, Canary)
- DB Migrations with preview + rollback (use Flyway or Liquibase)

7. Phasenplan

- Phase 0 (heute): Implement core SAGA + Idempotency + Audit trail + HealthChecks + basic CircuitBreaker/Retry
- Phase 1: Materialized Views, Monitoring, Compliance workflows, Retention jobs
- Phase 2: KI Orchestration (A/B), Model monitoring, Process versioning

---

## 8. Performance & Optimierung (Neu — Dezember 2024)

### 8.1 Frontend-Performance

- **Lazy Loading & Code-Splitting**
  - Route-based lazy loading für alle Hauptkomponenten (Dashboard, Catalog, Login)
  - Manuelle Vendor-Chunks für besseres Caching (react, i18n, monaco)
  - Optimierte Build-Config mit esbuild Minification
  - Suspense-Boundaries für nahtlose Loading-Experiences

- **Bundle-Optimierung**
  - Separierte Vendor-Chunks reduzieren Cache-Invalidierung
  - Source-Maps für Production-Debugging aktiviert
  - Chunk-Size-Warnings bei >1MB konfiguriert

### 8.2 Backend-Performance

- **API-Response-Caching**
  - In-Memory-Cache mit konfigurierbarem TTL (5-15 Min)
  - X-Cache Header für Monitoring (HIT/MISS)
  - Cache-Invalidierung nach Datenänderungen
  - Integration in Functions-Catalog-Routes

- **Query-Performance-Monitoring**
  - QueryMonitor-Service für Slow-Query-Detection (Threshold: 100ms)
  - Performance-Tracking und Statistiken
  - Query-History mit Parametern
  - Automatisches Cleanup abgelaufener Metriken

### 8.3 Enhanced Search

- **Full-Text-Search-Engine**
  - Relevance-Scoring basierend auf Feldgewichtung (Titel 3.0, Description 2.0, Tags 1.5)
  - Fuzzy Matching mit Levenshtein Distance für Fehlertoleranz
  - Text-Highlighting mit Snippet-Extraktion
  - Faceted Search für Filterung nach Kind, Tags, Areas
  - Search-Suggestions für Auto-Complete

- **Skalierung für Zukunft**
  - Architektur vorbereitet für ElasticSearch/MeiliSearch-Integration
  - Query-Caching für häufige Suchanfragen
  - Pagination und Performance-Limits

---

## 9. Real-Time Communication (Neu — Dezember 2024)

### 9.1 WebSocket-Infrastruktur

- **Socket.IO Integration**
  - Bidirektionale WebSocket-Kommunikation
  - JWT-basierte Authentifizierung für WebSocket-Verbindungen
  - Connection-Management mit Room-Support
  - Automatisches Reconnection-Handling

### 9.2 Event-Broadcasting-System

- **Broadcasting-Strategien**
  - `broadcast()` — An alle verbundenen Clients
  - `toRoom(room)` — An spezifische Räume (z.B. "dashboard", "chat-123")
  - `toUser(userId)` — An alle Sockets eines Users

- **Event-Typen**
  - **Dashboard**: `dashboard:update`, `dashboard:widget-update`
  - **Chat**: `chat:message`, `chat:typing`
  - **System**: `system:notification`, `system:alert`, `system:status`
  - **Batch**: `batch:progress`, `batch:complete`, `batch:error`
  - **Catalog**: `catalog:update`, `catalog:reload`

### 9.3 Skalierung & Resilience

- **Für Produktion geplant**:
  - Redis Adapter für Socket.IO Multi-Server-Setup
  - Message-Queue-Integration (Kafka) für persistente Events
  - WebSocket-Health-Checks und Monitoring
  - Rate-Limiting für Event-Broadcasting
