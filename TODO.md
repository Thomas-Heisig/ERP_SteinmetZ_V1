# ERP SteinmetZ - TODO Liste

**Stand**: Dezember 2024  
**Version**: 0.2.0

Diese Liste dokumentiert alle anstehenden Aufgaben, sortiert nach Priorität und Phase.

---

## 🔴 Kritische Aufgaben (Höchste Priorität)

### Build & Infrastruktur

- [ ] **TypeScript Build-Fehler beheben**
  - [ ] @types/node in Backend korrekt einbinden
  - [ ] Implizite 'any' Types in allen Routern beheben
  - [ ] Module-Resolution-Probleme für 'express', 'multer', etc. lösen
  - [ ] Process-Type-Definitionen ergänzen
  - [ ] NodeJS-Namespace-Fehler beheben
  - **Priorität**: 🔴 Kritisch - Build schlägt aktuell fehl
  - **Aufwand**: 2-4 Stunden
  - **Betroffen**: apps/backend/src/

- [ ] **npm install Fehler beheben**
  - [ ] Peer-Dependency-Warnings analysieren
  - [ ] Package-Versionen kompatibel machen
  - [ ] Lock-File aktualisieren
  - **Priorität**: 🔴 Kritisch
  - **Aufwand**: 1-2 Stunden

### Testing

- [ ] **Test-Infrastruktur aufsetzen**
  - [ ] Jest oder Vitest konfigurieren
  - [ ] Test-Scripts in package.json ergänzen
  - [ ] Erste Unit-Tests für kritische Services schreiben
  - **Priorität**: 🔴 Kritisch für Production-Readiness
  - **Aufwand**: 1 Tag

---

## 🟠 Hohe Priorität

### Backend - Core Funktionalität

- [ ] **Environment Variables validieren**
  - [ ] .env.example für Backend aktualisieren
  - [ ] .env.example für Frontend aktualisieren
  - [ ] Pflichtfelder dokumentieren
  - [ ] Runtime-Validierung mit Zod implementieren
  - **Aufwand**: 2-3 Stunden

- [ ] **Database Migrations testen**
  - [ ] Migration-Scripts durchführen
  - [ ] Rollback-Funktionalität testen
  - [ ] Dokumentation ergänzen
  - **Aufwand**: 3-4 Stunden

- [ ] **API-Error-Handling vereinheitlichen**
  - [ ] Zentrale Error-Handler-Middleware erweitern
  - [ ] Konsistente Error-Responses definieren
  - [ ] Logging für alle Errors implementieren
  - **Aufwand**: 4-6 Stunden

- [ ] **AI Provider Connection Tests**
  - [ ] Health-Checks für alle Provider
  - [ ] Fallback-Mechanismus testen
  - [ ] Provider-Verfügbarkeit dokumentieren
  - **Aufwand**: 1 Tag

### Frontend - Core Features

- [ ] **Responsive Design verbessern**
  - [ ] Mobile Breakpoints definieren
  - [ ] Tablet-Ansicht optimieren
  - [ ] Touch-Interaktionen verbessern
  - **Aufwand**: 1-2 Tage

- [ ] **Error Boundaries implementieren**
  - [ ] Error-Boundary-Komponente erstellen
  - [ ] Fallback-UI gestalten
  - [ ] Error-Reporting integrieren
  - **Aufwand**: 3-4 Stunden

- [ ] **Loading States optimieren**
  - [ ] Skeleton-Loader für alle Hauptkomponenten
  - [ ] Suspense-Boundaries strategisch platzieren
  - [ ] Optimistic UI-Updates implementieren
  - **Aufwand**: 1 Tag

### Documentation

- [ ] **API-Dokumentation vervollständigen**
  - [ ] OpenAPI/Swagger Spec generieren
  - [ ] Postman Collection erstellen
  - [ ] Request/Response-Beispiele für alle Endpoints
  - **Aufwand**: 2-3 Tage

- [ ] **Developer Onboarding Guide**
  - [ ] Setup-Anleitung erweitern
  - [ ] Troubleshooting-Sektion
  - [ ] Code-Conventions dokumentieren
  - [ ] Architecture Decision Records (ADR) beginnen
  - **Aufwand**: 1-2 Tage

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
