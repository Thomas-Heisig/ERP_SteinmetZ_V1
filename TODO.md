# ERP SteinmetZ - TODO Liste

**Stand**: Dezember 2024  
**Version**: 0.2.0

Diese Liste dokumentiert alle anstehenden Aufgaben, sortiert nach Priorität und Phase.

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

- [x] **API-Error-Handling vereinheitlichen** ✅ ERLEDIGT (2024-12-04)
  - [x] Zentrale Error-Handler-Middleware erweitern
  - [x] Konsistente Error-Responses definieren
  - [x] Logging für alle Errors implementieren
  - [x] Standardisierte Error-Typen (APIError, BadRequestError, NotFoundError, etc.)
  - [x] AsyncHandler für async Route-Handler
  - [x] 10 umfassende Tests
  - **Aufwand**: 4-6 Stunden
  - **Ergebnis**: Vollständige Error-Handling-Infrastruktur mit strukturiertem Logging

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
  - **Aufwand**: 1-2 Stunden
  - **Ergebnis**: Klare, wartbare Dokumentationsstruktur

---

## 🟡 Mittlere Priorität

### Performance & Optimization

- [ ] **Frontend Performance-Optimierung**
  - [ ] Code-Splitting implementieren
  - [ ] Lazy Loading für Routes
  - [ ] Bundle-Size analysieren und optimieren
  - [ ] React.memo für teure Komponenten
  - [ ] useMemo/useCallback strategisch einsetzen
  - **Aufwand**: 2-3 Tage

- [ ] **Backend Caching-Layer**
  - [ ] Redis Integration für Sessions
  - [ ] API-Response-Caching
  - [ ] Functions-Catalog-Cache
  - [ ] Cache-Invalidierung-Strategie
  - **Aufwand**: 3-4 Tage

- [ ] **Database Query-Optimierung**
  - [ ] Slow-Query-Logging aktivieren
  - [ ] Indizes analysieren und optimieren
  - [ ] N+1-Queries vermeiden
  - [ ] Query-Performance-Monitoring
  - **Aufwand**: 2-3 Tage

### Features - WebSocket Integration

- [ ] **WebSocket-Server aufsetzen**
  - [ ] Socket.io oder native WebSockets
  - [ ] Connection-Management
  - [ ] Authentication für WebSockets
  - **Aufwand**: 1 Tag

- [ ] **Real-Time Updates**
  - [ ] Dashboard-Widgets live updaten
  - [ ] Chat-Messages in Echtzeit
  - [ ] System-Notifications
  - [ ] Batch-Progress-Updates
  - **Aufwand**: 2-3 Tage

### Features - Erweiterte Suche

- [ ] **Full-Text-Search verbessern**
  - [ ] ElasticSearch oder MeiliSearch evaluieren
  - [ ] Faceted Search implementieren
  - [ ] Search-Highlighting
  - [ ] Search-Analytics
  - **Aufwand**: 3-5 Tage

- [ ] **Advanced Filters**
  - [ ] Filter-Builder-UI
  - [ ] Gespeicherte Filter
  - [ ] Filter-Presets
  - [ ] Export gefilterte Ergebnisse
  - **Aufwand**: 2-3 Tage

### AI Annotator - Enhancements

- [ ] **Batch-Processing-UI**
  - [ ] Batch-Creation-Formular
  - [ ] Progress-Tracking
  - [ ] Batch-History
  - [ ] Result-Visualization
  - **Aufwand**: 3-4 Tage

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

### Nächste Sprint-Planung

**Sprint 1 (KW 49-50/2024)**:

- TypeScript Build-Fehler beheben
- Test-Infrastruktur aufsetzen
- Environment-Variables validieren

**Sprint 2 (KW 51-52/2024)**:

- API-Error-Handling vereinheitlichen
- Responsive Design verbessern
- AI Provider Connection Tests

**Sprint 3 (KW 1-2/2025)**:

- Performance-Optimierung (Frontend & Backend)
- WebSocket Integration
- Advanced Search Implementation

---

**Letzte Aktualisierung**: 3. Dezember 2024  
**Maintainer**: Thomas Heisig
