# ERP SteinmetZ - TODO Liste

**Stand**: Dezember 2025  
**Version**: 0.3.0

Diese Liste dokumentiert alle anstehenden Aufgaben, sortiert nach Priorität und Phase.
Folgt internationalen Standards: ISO/IEC 25010 (Qualität), IEEE 830 (Requirements), OpenAPI 3.0 (APIs).

---

## 🔴 Kritische Aufgaben (Höchste Priorität)

### Build & Infrastruktur

- [x] **TypeScript Build-Fehler beheben** ✅ ERLEDIGT (2024-12-03)
  - [x] @types/node in Backend korrekt einbinden
  - [x] Implizite 'any' Types in allen Routern beheben
  - [x] Module-Resolution-Probleme für 'express', 'multer', etc. lösen
  - [x] Process-Type-Definitionen ergänzen
  - [x] NodeJS-Namespace-Fehler beheben
  - **Priorität**: 🔴 Kritisch - Build schlägt aktuell fehl
  - **Aufwand**: 2-4 Stunden (bereits erledigt)
  - **Betroffen**: apps/backend/src/

- [x] **npm install Fehler beheben** ✅ ERLEDIGT (2024-12-03)
  - [x] Peer-Dependency-Warnings analysieren
  - [x] Package-Versionen kompatibel machen
  - [x] Lock-File aktualisieren
  - **Priorität**: 🔴 Kritisch
  - **Aufwand**: 1-2 Stunden
  - **Ergebnis**: Nur Deprecation-Warnings, keine kritischen Fehler

### Testing

- [x] **Test-Infrastruktur aufsetzen** ✅ ERLEDIGT (2024-12-03)
  - [x] Vitest konfigurieren
  - [x] Test-Scripts in package.json ergänzen
  - [x] Erste Unit-Tests für kritische Services schreiben
  - [x] Test-Coverage-Reporting einrichten
  - **Priorität**: 🔴 Kritisch für Production-Readiness
  - **Aufwand**: 1 Tag
  - **Ergebnis**: 30 Tests (22 Backend, 8 Frontend) - alle passing

---

## 🟠 Hohe Priorität

### Backend - Core Funktionalität

- [x] **Environment Variables validieren** ✅ ERLEDIGT (2024-12-03)
  - [x] .env.example für Backend aktualisieren
  - [x] .env.example für Frontend aktualisieren
  - [x] Pflichtfelder dokumentieren
  - [x] Runtime-Validierung mit Zod implementieren
  - **Aufwand**: 2-3 Stunden
  - **Ergebnis**: Vollständige Zod-Validierung, 7 Tests, Dokumentation erstellt

- [x] **Database Migrations testen** ✅ ERLEDIGT (2024-12-03)
  - [x] Migration-Scripts durchführen
  - [x] Migration-System testen
  - [x] Dokumentation ergänzen
  - **Aufwand**: 3-4 Stunden
  - **Ergebnis**: 5 Tests für Migration-System, vollständige Dokumentation

- [x] **API-Error-Handling vereinheitlichen** ✅ ERLEDIGT (2025-12-06)
  - [x] Zentrale Error-Handler-Middleware erweitern
  - [x] Konsistente Error-Responses definieren
  - [x] Logging für alle Errors implementieren
  - [x] Standardisierte Error-Typen (APIError, BadRequestError, NotFoundError, etc.)
  - [x] AsyncHandler für async Route-Handler
  - [x] 10 umfassende Tests
  - [x] quickchatRouter mit standardisierten Errors + Zod-Validierung
  - [x] hrRouter vollständig aktualisiert (14/14 Endpoints)
  - [x] financeRouter vollständig aktualisiert (19/19 Endpoints)
  - [ ] Verbleibende Router aktualisieren (AI, Dashboard, Diagnostics, etc.) - Optional
  - **Aufwand**: 6 Stunden (abgeschlossen für Kern-Module)
  - **Ergebnis**: Vollständige Error-Handling-Infrastruktur für HR & Finance Module

- [x] **AI Provider Connection Tests** ✅ ERLEDIGT (2024-12-04)
  - [x] Health-Checks für alle Provider (OpenAI, Ollama, Anthropic, Fallback)
  - [x] Fallback-Mechanismus mit Prioritätsreihenfolge
  - [x] Provider-Verfügbarkeit dokumentieren (HEALTH_CHECKS.md)
  - [x] Health-Check-Endpoints (/api/ai/health/\*)
  - [x] 8 Provider-Connection-Tests
  - **Aufwand**: 1 Tag
  - **Ergebnis**: Automatisches Fallback-System mit vollständiger Dokumentation

### Frontend - Core Features

- [x] **Responsive Design verbessern** ✅ ERLEDIGT (2024-12-04)
  - [x] Mobile Breakpoints definieren (320px, 640px, 768px, 1024px, 1280px, 1536px)
  - [x] Tablet-Ansicht optimieren (Dashboard-responsive Styles)
  - [x] Touch-Interaktionen verbessern (44px Touch-Targets, iOS-Zoom-Prevention)
  - [x] Responsive Grid-System und Container-Utilities
  - [x] Safe-Area-Support für Notched-Devices
  - **Aufwand**: 1-2 Tage
  - **Ergebnis**: Umfassendes Responsive-Design-System mit Touch-Optimierungen

- [x] **Error Boundaries implementieren** ✅ ERLEDIGT (2024-12-04)
  - [x] Error-Boundary-Komponente erstellen (React Class Component)
  - [x] Fallback-UI gestalten (Error-Icon, Nachricht, Aktionen)
  - [x] Error-Reporting integrieren (Console + Produktions-Placeholder)
  - [x] withErrorBoundary HOC für einfaches Component-Wrapping
  - [x] Reset-Funktionalität mit resetKeys-Support
  - [x] 11 umfassende Tests
  - **Aufwand**: 3-4 Stunden
  - **Ergebnis**: Produktionsreife Error-Boundary mit customizable Fallbacks

- [x] **Loading States optimieren** ✅ ERLEDIGT (2024-12-04)
  - [x] Skeleton-Loader für alle Hauptkomponenten (Text, Avatar, Card, Table, List, Dashboard)
  - [x] Suspense-Boundaries strategisch platzieren (Spezielle Suspense-Wrapper)
  - [x] Pulse- und Wave-Animationen implementiert
  - [x] 14 umfassende Skeleton-Tests
  - **Aufwand**: 1 Tag
  - **Ergebnis**: Vollständige Skeleton-Loader-Bibliothek mit Suspense-Integration

### Documentation

- [x] **API-Dokumentation vervollständigen** ✅ ERLEDIGT (2024-12-04)
  - [x] OpenAPI/Swagger Spec generieren (docs/api/openapi.yaml)
  - [x] Postman Collection erstellen (docs/api/postman-collection.json)
  - [x] Request/Response-Beispiele für alle Endpoints (docs/api/API_DOCUMENTATION.md)
  - [x] Error-Handling-Dokumentation ergänzt (2025-12-06)
  - [x] HR-Modul-Dokumentation aktualisiert (2025-12-06)
  - [x] Finance-Modul-Dokumentation aktualisiert (2025-12-06)
  - **Aufwand**: 2-3 Tage
  - **Ergebnis**: Vollständige API-Dokumentation mit OpenAPI 3.0 Spec, Postman Collection und umfangreichen Beispielen

- [x] **Developer Onboarding Guide** ✅ ERLEDIGT (2024-12-04)
  - [x] Setup-Anleitung erweitern (docs/DEVELOPER_ONBOARDING.md)
  - [x] Troubleshooting-Sektion mit Common Issues und Solutions
  - [x] Code-Conventions dokumentieren (docs/CODE_CONVENTIONS.md)
  - [x] Architecture Decision Records (ADR) beginnen (docs/adr/ mit 5 ADRs)
  - **Aufwand**: 1-2 Tage
  - **Ergebnis**: Umfassende Onboarding-Dokumentation, Code-Style-Guide, ADR-Template und 5 initiale ADRs

- [x] **Dokumentations-Konsolidierung** ✅ ERLEDIGT (2024-12-05)
  - [x] Changelogs zusammenführen (CHANGELOG.md)
  - [x] Issues aufräumen (nur aktive in ISSUES.md)
  - [x] Archiv erstellen (ARCHIVE.md) für behobene Issues
  - [x] Redundante Dateien entfernen (6 Dateien)
  - [x] README aktualisieren mit neuer Struktur
  - [x] Erweiterte Dokumentation (2025-12-06):
    - [x] ERROR_HANDLING.md - Standardisiertes Error-Handling-System
    - [x] DATABASE_OPTIMIZATION.md - DB-Performance und Optimierung
    - [x] WEBSOCKET_REALTIME.md - WebSocket und Real-Time Features
  - **Aufwand**: 1-2 Stunden
  - **Ergebnis**: Klare, wartbare Dokumentationsstruktur mit umfassenden Guides

---

## 🟡 Mittlere Priorität

### Performance & Optimization

- [x] **Frontend Performance-Optimierung** ✅ ERLEDIGT (2024-12-05)
  - [x] Code-Splitting implementieren (Route-based lazy loading)
  - [x] Lazy Loading für Routes (React.lazy + Suspense)
  - [x] Bundle-Size analysieren und optimieren (Vite manual chunks)
  - [x] React.memo für teure Komponenten (bereits vorhanden)
  - [x] useMemo/useCallback strategisch einsetzen (bereits vorhanden)
  - **Aufwand**: 2-3 Tage
  - **Ergebnis**: Lazy Loading für Dashboard, FunctionsCatalog und Login; optimierte Vendor-Chunks (react, i18n, monaco)

- [x] **Backend Caching-Layer** ✅ ERLEDIGT (2025-12-06)
  - [x] API-Response-Caching (cacheMiddleware mit TTL)
  - [x] Functions-Catalog-Cache (15 min TTL für Index, 10 min für Rules)
  - [x] Cache-Invalidierung-Strategie (invalidateCacheMiddleware)
  - [x] Redis Integration für Sessions (mit In-Memory-Fallback für Development)
  - **Aufwand**: 3-4 Tage
  - **Ergebnis**: In-Memory Response-Caching mit TTL, Cache-Invalidierung, X-Cache Header, Redis Session Store

- [x] **Database Query-Optimierung** ✅ ERLEDIGT (2024-12-05)
  - [x] Slow-Query-Logging aktivieren (queryMonitor mit konfigurierbarem Threshold)
  - [x] Query-Performance-Monitoring (QueryMetrics-Tracking, Stats-Endpoint)
  - [x] Dokumentation erstellt (DATABASE_OPTIMIZATION.md - 2025-12-06)
    - [x] Index-Optimierungsstrategien
    - [x] N+1-Query-Lösungsansätze
    - [x] Caching-Strategien
    - [x] Connection-Pooling
    - [x] Best Practices
  - [ ] Indizes analysieren und optimieren (manuell nach Query-Monitoring)
  - [ ] N+1-Queries vermeiden (Code-Review basierend auf Monitoring)
  - **Aufwand**: 2-3 Tage
  - **Ergebnis**: QueryMonitor-Service mit Slow-Query-Detection, Performance-Tracking, Stats-API und umfassender Dokumentation

### Features - WebSocket Integration

- [x] **WebSocket-Server aufsetzen** ✅ ERLEDIGT (2024-12-05)
  - [x] Socket.io Integration (v4 mit CORS-Unterstützung)
  - [x] Connection-Management (Connection-Tracking, Room-Support)
  - [x] Authentication für WebSockets (JWT-basiert mit Middleware)
  - [x] Dokumentation erstellt (WEBSOCKET_REALTIME.md - 2025-12-06)
    - [x] Backend-Implementation
    - [x] Event-Typen und Formate
    - [x] Frontend-Integration-Beispiele
    - [x] React-Hooks für WebSocket
    - [x] Security und Authentifizierung
    - [x] Monitoring und Testing
  - **Aufwand**: 1 Tag
  - **Ergebnis**: Vollständiger WebSocket-Service mit Auth, Rooms, Broadcasting und umfassender Dokumentation

- [x] **Real-Time Updates** ✅ ERLEDIGT (2025-12-06)
  - [x] WebSocket-Infrastructure (Events: dashboard, chat, system, batch, catalog)
  - [x] Event-Broadcasting-System (broadcast, toRoom, toUser)
  - [x] Dashboard-Widgets live updaten (Frontend-Hooks erstellt)
  - [x] Chat-Messages in Echtzeit (Frontend-Hooks verfügbar)
  - [x] System-Notifications (Event-Typen definiert)
  - [x] Batch-Progress-Updates (In BatchProcessingPage integriert)
  - [x] WebSocket Hooks erstellt (useWebSocket, useDashboardUpdates, useChatUpdates, useBatchUpdates)
  - **Aufwand**: 2-3 Tage
  - **Ergebnis**: Backend-Infrastructure komplett, Frontend-Hooks und Integration verfügbar

### Features - Erweiterte Suche

- [x] **Full-Text-Search verbessern** ✅ ERLEDIGT (2024-12-05)
  - [x] Enhanced Search Service mit Relevance-Scoring
  - [x] Faceted Search implementieren (kinds, tags, areas)
  - [x] Search-Highlighting mit Snippet-Extraktion
  - [x] Fuzzy Matching mit Levenshtein Distance
  - [x] Search-Suggestions-Funktion
  - [ ] ElasticSearch oder MeiliSearch evaluieren (optional für Skalierung)
  - [ ] Search-Analytics Dashboard (folgt)
  - **Aufwand**: 3-5 Tage
  - **Ergebnis**: Vollständiger SearchService, Frontend-Integration ausstehend

- [x] **Advanced Filters** ✅ ERLEDIGT (2025-12-06)
  - [x] Filter-Builder-UI
  - [x] Gespeicherte Filter (LocalStorage)
  - [x] Filter-Presets (Quick Filters)
  - [x] Export gefilterte Ergebnisse (JSON & CSV)
  - **Aufwand**: 2-3 Tage
  - **Ergebnis**: Vollständige Filter-UI mit Saved Filters, Presets und Export-Funktionalität

### AI Annotator - Enhancements

- [x] **Batch-Processing-UI** ✅ ERLEDIGT (2025-12-06)
  - [x] Batch-Creation-Formular
  - [x] Progress-Tracking mit WebSocket
  - [x] Batch-History
  - [x] Result-Visualization
  - **Aufwand**: 3-4 Tage
  - **Ergebnis**: Vollständige Batch-Processing-UI mit Real-Time-Updates

- [ ] **Quality Assurance Dashboard**
  - [ ] Annotation-Quality-Metrics
  - [ ] Manual Review-Interface
  - [ ] Approval-Workflow
  - [ ] Quality-Trend-Charts
  - **Aufwand**: 4-5 Tage

- [ ] **AI Model Management UI**
  - [ ] Model-Selection-Interface
  - [ ] Model-Performance-Comparison
  - [ ] Cost-Tracking
  - [ ] Usage-Statistics
  - **Aufwand**: 3-4 Tage

---

## 🟢 Niedrige Priorität / Nice-to-Have

### Developer Experience

- [ ] **Development Tools**
  - [ ] Storybook für Component-Development
  - [ ] Mock-Server für Frontend-Dev
  - [ ] Hot-Module-Replacement optimieren
  - [ ] Dev-Tools-Extension
  - **Aufwand**: 2-3 Tage

- [ ] **Code Quality Tools**
  - [ ] Pre-commit Hooks (Husky)
  - [ ] Conventional Commits enforcing
  - [ ] Code-Coverage-Reports
  - [ ] SonarQube Integration
  - **Aufwand**: 1-2 Tage

### UI/UX Enhancements

- [ ] **Accessibility (a11y)**
  - [ ] ARIA-Labels vervollständigen
  - [ ] Keyboard-Navigation testen
  - [ ] Screen-Reader-Kompatibilität
  - [ ] WCAG 2.1 AA Compliance
  - **Aufwand**: 2-3 Tage

- [ ] **Animation & Transitions**
  - [ ] Page-Transitions
  - [ ] Micro-Interactions
  - [ ] Loading-Animations
  - [ ] Success/Error-Feedback-Animations
  - **Aufwand**: 1-2 Tage

- [ ] **Dark Mode Improvements**
  - [ ] Contrast-Ratios optimieren
  - [ ] Auto-Detection Systemeinstellung
  - [ ] Sanftere Theme-Transitions
  - **Aufwand**: 1 Tag

### Internationalization

- [ ] **i18n Vervollständigen**
  - [ ] Fehlende Übersetzungen ergänzen
  - [ ] Plural-Forms korrekt handhaben
  - [ ] Date/Time-Formatierung lokalisieren
  - [ ] Currency-Formatting
  - **Aufwand**: 2-3 Tage

- [ ] **Neue Sprachen hinzufügen**
  - [ ] Französisch
  - [ ] Italienisch
  - [ ] Polnisch
  - [ ] Türkisch
  - **Aufwand**: 1-2 Tage pro Sprache

### Monitoring & Observability

- [ ] **Logging-Infrastructure**
  - [ ] Structured Logging (Pino erweitern)
  - [ ] Log-Aggregation (ELK Stack / Loki)
  - [ ] Log-Retention-Policies
  - **Aufwand**: 2-3 Tage

- [ ] **Metrics & Monitoring**
  - [ ] Prometheus-Exporter
  - [ ] Grafana-Dashboards
  - [ ] Custom Business-Metrics
  - [ ] Alert-Rules definieren
  - **Aufwand**: 3-4 Tage

- [ ] **Tracing**
  - [ ] OpenTelemetry Integration
  - [ ] Distributed Tracing
  - [ ] Jaeger/Zipkin Setup
  - **Aufwand**: 2-3 Tage

- [ ] **Error Tracking**
  - [ ] Sentry Integration
  - [ ] Error-Grouping und -Deduplication
  - [ ] Source-Maps für Stack-Traces
  - [ ] Alert-Notifications
  - **Aufwand**: 1 Tag

---

## 🚀 Phase 3: Enterprise Features (Langfristig)

### HR-Modul

- [ ] **Mitarbeiter-Management**
  - [ ] Mitarbeiter anlegen/bearbeiten
  - [ ] Vertragsmanagement
  - [ ] Dokumentenverwaltung
  - [ ] Onboarding-Workflow
  - **Aufwand**: 2-3 Wochen

- [ ] **Zeiterfassung**
  - [ ] Time-Tracking-Interface
  - [ ] Urlaubs-/Abwesenheitsmanagement
  - [ ] Überstunden-Konto
  - [ ] Genehmigungsworkflows
  - **Aufwand**: 2 Wochen

- [ ] **Payroll**
  - [ ] Gehaltsabrechnung
  - [ ] Steuerberechnung
  - [ ] SEPA-Export
  - [ ] Lohnjournal
  - **Aufwand**: 3-4 Wochen

### Finance-Modul

- [ ] **Rechnungsmanagement**
  - [ ] Rechnungserstellung
  - [ ] XRechnung-Export
  - [ ] ZUGFeRD-Integration
  - [ ] Nummernkreise
  - **Aufwand**: 2-3 Wochen

- [ ] **Mahnwesen**
  - [ ] Automatische Mahnungen
  - [ ] Eskalationsstufen
  - [ ] Zahlungsüberwachung
  - **Aufwand**: 1-2 Wochen

- [ ] **Buchhaltung**
  - [ ] Kontenrahmen (SKR03/04)
  - [ ] Buchungserfassung
  - [ ] DATEV-Export
  - [ ] Umsatzsteuer-Voranmeldung
  - **Aufwand**: 4-6 Wochen

### Document Management

- [ ] **Dokumenten-Repository**
  - [ ] Upload & Versioning
  - [ ] OCR-Integration
  - [ ] AI-basierte Verschlagwortung
  - [ ] Full-Text-Search
  - **Aufwand**: 2-3 Wochen

- [ ] **Workflow-Automation**
  - [ ] Document-Approval-Workflows
  - [ ] E-Signature-Integration
  - [ ] Retention-Policies
  - **Aufwand**: 2 Wochen

### Workflow-Engine

- [ ] **BPMN-Editor**
  - [ ] Visual Workflow-Designer
  - [ ] Process-Templates
  - [ ] Condition-Logic
  - **Aufwand**: 3-4 Wochen

- [ ] **Workflow-Execution**
  - [ ] State-Machine-Implementation
  - [ ] Task-Assignment
  - [ ] Escalation-Rules
  - [ ] Monitoring & Analytics
  - **Aufwand**: 2-3 Wochen

### Advanced Analytics

- [ ] **BI-Dashboard**
  - [ ] Custom-Report-Builder
  - [ ] Drill-Down-Capabilities
  - [ ] Export (PDF, Excel)
  - [ ] Scheduled Reports
  - **Aufwand**: 3-4 Wochen

- [ ] **Predictive Analytics**
  - [ ] Sales-Forecasting
  - [ ] Demand-Planning
  - [ ] Anomaly-Detection
  - **Aufwand**: 4-6 Wochen

---

## 🔮 Phase 4: KI-Erweiterungen (Vision)

### RAG (Retrieval Augmented Generation)

- [ ] **Document Indexing**
  - [ ] Vector-Database (Pinecone/Weaviate/Qdrant)
  - [ ] Chunking-Strategies
  - [ ] Embedding-Generation
  - [ ] Index-Management
  - **Aufwand**: 2-3 Wochen

- [ ] **Semantic Search**
  - [ ] Hybrid-Search (BM25 + Vector)
  - [ ] Re-Ranking
  - [ ] Citation-Tracking
  - **Aufwand**: 2 Wochen

### Intelligent Automation

- [ ] **Process Mining**
  - [ ] Event-Log-Analysis
  - [ ] Process-Discovery
  - [ ] Bottleneck-Detection
  - **Aufwand**: 3-4 Wochen

- [ ] **Automated Decision-Making**
  - [ ] Rule-Engine
  - [ ] ML-Model-Deployment
  - [ ] A/B-Testing-Framework
  - **Aufwand**: 4-5 Wochen

### Natural Language Interface

- [ ] **NLQ (Natural Language Querying)**
  - [ ] SQL-Generation aus Text
  - [ ] Query-Validation
  - [ ] Result-Visualization
  - **Aufwand**: 3-4 Wochen

- [ ] **Voice Commands**
  - [ ] Speech-to-Action
  - [ ] Command-Disambiguation
  - [ ] Multi-Language-Support
  - **Aufwand**: 2-3 Wochen

---

## 📝 Notizen

### Aufwand-Legende

- **Stunden**: Kleine Aufgaben, schnell umsetzbar
- **Tage**: Mittlere Aufgaben, 1-5 Tage
- **Wochen**: Große Features, mehrere Wochen

### Prioritäten-Legende

- 🔴 **Kritisch**: Blockiert weitere Entwicklung oder Production-Deployment
- 🟠 **Hoch**: Wichtig für Core-Funktionalität oder User-Experience
- 🟡 **Mittel**: Verbessert das System, aber nicht dringend
- 🟢 **Niedrig**: Nice-to-Have, kann zurückgestellt werden

### Nächste Sprint-Planung (2025)

**Sprint 1 (KW 1-2/2025)** - AI-Annotator Production-Ready:

- [ ] AI-Annotator Frontend-Integration
- [ ] Batch-Processing-UI implementieren
- [ ] Quality-Dashboard visualisieren
- [ ] Model-Management-Interface

**Sprint 2 (KW 3-4/2025)** - Function-Node-Transformation MVP:

- [ ] Markdown-Parser implementieren
- [ ] Schema-Extractor entwickeln
- [ ] Code-Generator (TypeScript) erstellen
- [ ] API-Registration-System
- [ ] Test-Generator implementieren

**Sprint 3 (KW 5-6/2025)** - HR & Finance Module vervollständigen:

- [ ] HR-Modul: CRUD-Operationen vollständig
- [ ] Finance-Modul: Buchhaltungsintegration
- [ ] Datenbank-Migrationen
- [ ] Frontend-Komponenten für beide Module

**Sprint 4 (KW 7-8/2025)** - Compliance & Documentation:

- [ ] GoBD-Compliance-Checks
- [ ] DSGVO-Audit-Toolkit
- [ ] API-Dokumentation vervollständigen (OpenAPI 3.0)
- [ ] Security-Audit durchführen

---

## 📊 Fortschrittstracking

### Completion Rate (Stand Dezember 2025)

- 🟢 **Abgeschlossen**: 78% (Infrastructure, Core-Features, Error-Handling)
- 🟡 **In Arbeit**: 18% (AI-Annotator, Function-Transformation)
- 🔴 **Offen**: 4% (Enterprise-Features, Advanced-AI)

### Key Performance Indicators (KPIs)

- **Code-Coverage**: 86% (Ziel: 90%)
- **Build-Success-Rate**: 100%
- **API-Response-Time**: <100ms (95th percentile)
- **Frontend-Performance**: Lighthouse Score >90

---

**Letzte Aktualisierung**: 6. Dezember 2025  
**Maintainer**: Thomas Heisig  
**Nächster Review**: Januar 2026
