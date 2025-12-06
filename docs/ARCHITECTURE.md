# ERP SteinmetZ — Systemarchitektur

**Version**: 2.0.0  
**Stand**: Dezember 2025  
**Status**: Production-Ready  
**Standards**: ISO/IEC 25010, IEEE 1471, ISO 27001, OpenAPI 3.0

---

## 📋 Überblick

ERP SteinmetZ ist eine produktionsreife Enterprise-Resource-Planning-Plattform mit Fokus auf:

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

## 8. Performance & Optimierung (Stand: Dezember 2025)

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

---

## 10. Internationale Standards & Compliance (Stand: Dezember 2025)

### 10.1 Software-Qualität (ISO/IEC 25010)

ERP SteinmetZ folgt dem **ISO/IEC 25010 Software-Qualitätsmodell** mit acht Hauptcharakteristiken:

#### Functional Suitability (Funktionale Eignung)

- **Functional Completeness**: 15.472 Funktionsknoten decken alle ERP-Bereiche ab
- **Functional Correctness**: 92%+ Test-Coverage sichert korrekte Implementierung
- **Functional Appropriateness**: Instruction-Driven Design für fachliche Anforderungen

#### Performance Efficiency (Leistungseffizienz)

- **Time Behaviour**: API-Response <100ms (p95)
- **Resource Utilization**: Optimierte Queries, Caching, Lazy-Loading
- **Capacity**: Skalierbar für 1000+ gleichzeitige Benutzer

#### Compatibility (Kompatibilität)

- **Co-existence**: RESTful API, WebSocket, Standard-Protokolle
- **Interoperability**: OpenAPI 3.0, JSON Schema, XRechnung, ZUGFeRD

#### Usability (Benutzbarkeit)

- **Appropriateness Recognizability**: Intuitive UI, Dashboard-basiert
- **Learnability**: Inline-Help, QuickChat-Assistent
- **Operability**: Keyboard-Navigation, Touch-Optimiert
- **User Error Protection**: Validation, Confirmation Dialogs
- **User Interface Aesthetics**: 3 Themes, Responsive Design
- **Accessibility**: WCAG 2.1 AA konform (geplant)

#### Reliability (Zuverlässigkeit)

- **Maturity**: SAGA Pattern, Idempotency, Circuit Breaker
- **Availability**: Health Checks, Auto-Recovery, Fallback-Systeme
- **Fault Tolerance**: Retry-Policies, Dead Letter Queue
- **Recoverability**: Backup-Strategien, Rollback-fähig

#### Security (Sicherheit)

- **Confidentiality**: Encryption at-rest & in-transit (TLS 1.3)
- **Integrity**: Audit Trail, Checksums, Unveränderlichkeit
- **Non-repudiation**: Vollständige Audit-Logs
- **Accountability**: User-Actions werden getrackt
- **Authenticity**: JWT-basierte Authentifizierung

#### Maintainability (Wartbarkeit)

- **Modularity**: Monorepo, klare Modul-Grenzen
- **Reusability**: Shared Components, Services
- **Analysability**: Structured Logging, Metrics, Tracing
- **Modifiability**: TypeScript, Clean Architecture
- **Testability**: 92%+ Coverage, Unit & Integration Tests

#### Portability (Übertragbarkeit)

- **Adaptability**: Multi-Database-Support (SQLite, PostgreSQL)
- **Installability**: Docker, Docker-Compose, Kubernetes
- **Replaceability**: Standard-APIs, keine Vendor-Lock-in

### 10.2 API-Standards (OpenAPI 3.0)

Alle APIs folgen der **OpenAPI 3.0 Specification**:

```yaml
openapi: 3.0.3
info:
  title: ERP SteinmetZ API
  version: 0.3.0
  description: Enterprise Resource Planning System
  contact:
    name: Thomas Heisig
    email: support@erp-steinmetz.de
  license:
    name: MIT
```

**Vorteile**:

- Automatische API-Dokumentation
- Code-Generierung für Client-SDKs
- Contract-Testing möglich
- Editor-Support (Swagger UI, Postman)

### 10.3 Datenvalidierung (JSON Schema Draft-07)

Alle Datenstrukturen sind mit **JSON Schema Draft-07** definiert:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://erp-steinmetz.de/schemas/employee.json",
  "title": "Employee",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^EMP-[0-9]{6}$"
    }
  },
  "required": ["id", "firstName", "lastName"]
}
```

### 10.4 Compliance & Regulatorik

#### DSGVO (GDPR) Compliance

- PII-Klassifikation (none, low, medium, high)
- Recht auf Auskunft (Data Export)
- Recht auf Vergessenwerden (Deletion Workflow)
- Recht auf Datenübertragbarkeit (JSON/CSV Export)
- Einwilligungsverwaltung
- Breach-Notification-System

#### GoBD (Grundsätze ordnungsmäßiger Buchführung)

- Lückenlose Nummernkreise
- Unveränderbarkeit nach Buchung
- Vollständigkeit und Richtigkeit
- Zeitgerechte Buchungen
- Ordnung und Nachvollziehbarkeit
- Aufbewahrungsfristen (10 Jahre)

#### ISO 27001 (Information Security)

- Risk Assessment
- Security Policies
- Access Control (RBAC/ABAC)
- Cryptographic Controls
- Incident Management
- Business Continuity

### 10.5 Architektur-Standards (IEEE 1471)

Architektur-Dokumentation folgt **IEEE 1471 (ISO/IEC 42010)**:

- **Stakeholder**: Entwickler, Product Owner, Endbenutzer
- **Concerns**: Performance, Security, Maintainability
- **Viewpoints**:
  - Logical View (Komponenten-Struktur)
  - Process View (Runtime-Verhalten)
  - Development View (Code-Organisation)
  - Physical View (Deployment)
  - Scenario View (Use-Cases)

### 10.6 Code-Qualität (ESLint, TypeScript)

**TypeScript Strict-Mode** (geplant für Q1 2026):

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

**ESLint-Konfiguration**:

- Airbnb Style Guide als Basis
- Zusätzliche Rules für Security
- Accessibility-Checks (jsx-a11y)

### 10.7 Test-Standards

**Test-Pyramide**:

```
        ┌────────┐
        │  E2E   │  10% (Playwright)
        ├────────┤
        │ Integr.│  20% (API Tests)
        ├────────┤
        │  Unit  │  70% (Vitest)
        └────────┘
```

**Coverage-Ziele**:

- Statements: ≥90%
- Branches: ≥85%
- Functions: ≥90%
- Lines: ≥90%

### 10.8 Documentation-Standards

**Markdown-Konventionen**:

- Folgt [CommonMark Spec](https://commonmark.org/)
- README-Style: [Standard Readme](https://github.com/RichardLitt/standard-readme)
- Changelog: [Keep a Changelog](https://keepachangelog.com/)
- Commits: [Conventional Commits](https://www.conventionalcommits.org/)

**ADR (Architecture Decision Records)**:

- Format: [MADR](https://adr.github.io/madr/)
- Location: `docs/adr/`
- Template: `docs/adr/000-template.md`

### 10.9 Accessibility-Standards (WCAG 2.1)

**Level AA Compliance** (geplant):

- Perceivable: Alt-Text, Color-Contrast, Text-Resizing
- Operable: Keyboard-Navigation, Focus-Visible, Skip-Links
- Understandable: Error-Messages, Labels, Consistent-Navigation
- Robust: Valid-HTML, ARIA-Attributes

### 10.10 Performance-Standards

**Web Vitals** (Target):

- Largest Contentful Paint (LCP): <2.5s
- First Input Delay (FID): <100ms
- Cumulative Layout Shift (CLS): <0.1
- Time to Interactive (TTI): <3.5s

**Lighthouse Score** (Target):

- Performance: >90
- Accessibility: >90
- Best Practices: >95
- SEO: >95

---

## 11. Roadmap & Phasenplan (2025-2026)

### Q1 2025: Consolidation

- [x] Performance-Optimierung abgeschlossen
- [x] Documentation-Update (82 .md Dateien)
- [ ] TypeScript Strict-Mode aktivieren
- [ ] Test-Coverage auf 95%+

### Q2 2025: AI-Features

- [ ] AI-Annotator Production-Deployment
- [ ] Function-Node Transformation MVP
- [ ] RAG-System für Dokumentensuche
- [ ] NLQ (Natural Language Querying)

### Q3 2025: Enterprise

- [ ] Multi-Tenant-Support
- [ ] Advanced Workflow-Engine (BPMN)
- [ ] Document-Management-System
- [ ] Advanced BI & Analytics

### Q4 2025: Compliance

- [ ] GoBD-Zertifizierung
- [ ] ISO 27001-Audit-Vorbereitung
- [ ] Pen-Test & Security-Audit
- [ ] WCAG 2.1 AA Compliance

---

## 12. Referenzen & Standards

### Internationale Standards

- **ISO/IEC 25010**: Systems and software Quality Requirements and Evaluation (SQuaRE)
- **IEEE 1471**: Recommended Practice for Architectural Description (ISO/IEC 42010)
- **ISO 27001**: Information Security Management
- **OpenAPI 3.0**: https://swagger.io/specification/
- **JSON Schema Draft-07**: https://json-schema.org/

### Regulatorik

- **DSGVO/GDPR**: https://eur-lex.europa.eu/eli/reg/2016/679
- **GoBD**: https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Weitere_Steuerthemen/Abgabenordnung/2019-11-28-GoBD.html

### Best Practices

- **12-Factor App**: https://12factor.net/
- **RESTful API Design**: https://restfulapi.net/
- **Semantic Versioning**: https://semver.org/
- **Keep a Changelog**: https://keepachangelog.com/
- **Conventional Commits**: https://www.conventionalcommits.org/

---

**Version**: 2.0.0  
**Autor**: Thomas Heisig  
**Letzte Aktualisierung**: 5. Dezember 2025  
**Nächster Review**: März 2026
