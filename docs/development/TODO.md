# ERP SteinmetZ - TODO Liste

**Stand**: 21. Dezember 2025  
**Version**: 0.3.0

Diese Liste dokumentiert alle anstehenden Aufgaben, sortiert nach Priorität und Phase.
Folgt internationalen Standards: ISO/IEC 25010 (Qualität), IEEE 830 (Requirements), OpenAPI 3.0 (APIs).

> 📊 **System-Status**: Siehe [SYSTEM_STATUS.md](../SYSTEM_STATUS.md) für detaillierte Übersicht

---

## 🔴 Kritische Aufgaben (Höchste Priorität)

**Status**: ✅ Alle kritischen Aufgaben erledigt! Siehe [ARCHIVE.md](../archive/ARCHIVE.md)

---

## 🟠 Hohe Priorität

### Code Quality & Type Safety 🆕

- [ ] **TypeScript `any` Types eliminieren** 🔄 (20. Dez 2025 - In Bearbeitung)
  - **Aktueller Stand**: ~379 `any` Types identifiziert → **~62 eliminiert** (14% abgeschlossen)
  - **Top Dateien mit any Types**:
    - [x] ✅ **dbService.ts (63 Instanzen → 0)** - Datenbankabfragen und Ergebnisse
      - Neue Typen erstellt: `database.ts`, `postgres.ts` (135 Zeilen)
      - Alle `any` durch `SqlValue`, `SqlParams`, `UnknownRow`, `MutationResult` ersetzt
      - BetterSqlite3 und PostgreSQL Typen korrekt annotiert
      - Error Handling mit proper type guards
    - [x] 🔄 **aiAnnotatorService.ts (33 Instanzen → 24)** - AI Service Responses (teilweise behoben)
      - Neue Typen erstellt: `ai-annotator.ts` (180 Zeilen)
      - Type definitions: FormFieldValue, ConditionalValue, JsonMetadata, NodeFilters
      - 13 any types ersetzt in Interfaces/Types
      - Verbleibend: ~9 any types in Implementierung (-27% Reduktion)
    - [x] 🔄 **workflowEngine.ts (28 Instanzen → 17)** - Workflow-States und Payloads (teilweise behoben)
      - Neue Typen: WorkflowInput, WorkflowResult, WorkflowContext in types.ts
      - Legacy action field proper typisiert (deprecated marker)
      - Error handling von any → unknown konvertiert
      - Function signatures mit proper workflow types
      - Verbleibend: ~17 any types (-39% Reduktion)
    - [x] 🔄 **ai/types/types.ts (24 Instanzen → 23)** - AI Message und Tool Definitionen
      - metadata: Record<string, any> → Record<string, unknown>
      - triggers config: any → unknown
      - input_schema/output_schema: any → unknown
      - Verbleibend: ~23 any types (-4% Reduktion)
    - [ ] customProvider.ts (22 Instanzen) - Provider-Responses
    - [ ] systemInfoService.ts (19 Instanzen) - System-Metriken
    - [ ] helpers.ts (16 Instanzen) - Utility-Funktionen
    - [ ] src/types/errors.ts (15 Instanzen) - Error-Handling
    - [ ] Weitere ~48 Dateien mit kleineren Mengen
  - **Aufwand**: 5-7 Tage für vollständige Migration (0.7 Tage verbraucht, 4.3-6.3 Tage verbleibend)
  - **Priorität**: Hoch - Type Safety ist wichtig für Wartbarkeit
  - **Status**: 14% abgeschlossen - dbService.ts vollständig, workflowEngine.ts/aiAnnotatorService.ts/types.ts teilweise
  - **Details**: Siehe ISSUE-017 in ISSUES.md
  - **Neue Dateien**:
    - ✅ `src/types/database.ts` - Umfassende Datenbank-Typdefinitionen (108 Zeilen)
    - ✅ `src/types/postgres.ts` - PostgreSQL-spezifische Typen (27 Zeilen)
    - ✅ `src/types/ai-annotator.ts` - AI Annotator Typdefinitionen (180 Zeilen)
  - **Nächste Schritte**:
    - workflowEngine.ts vollständig typisieren (17 any types verbleibend)
    - customProvider.ts typisieren (22 any types)
    - systemInfoService.ts typisieren (19 any types)

- [x] **Deprecated Dependencies evaluieren** ✅ ÜBERPRÜFT (18. Dez 2025)
  - [x] fluent-ffmpeg - NICHT MEHR VORHANDEN (bereits entfernt)
  - [x] npmlog/gauge - Transitive Dependency von better-sqlite3 (kein Handlungsbedarf)
  - [x] inflight - Transitive Dependency (wird durch glob@9 Update behoben)
  - [x] rimraf@3 / glob@7 - Transitive Dependencies (Root bereits auf v5/v9)
  - **Status**: Keine direkten deprecated Dependencies mehr vorhanden
  - **Transitive Dependencies**: 6 deprecated packages in Dependencies, aber keine Sicherheitsprobleme
  - **Aufwand**: 1 Stunde (Analyse abgeschlossen)
  - **Priorität**: Niedrig - nur transitive Dependencies betroffen
  - **Ergebnis**: Alle direkten deprecated Dependencies bereits bereinigt
  - **Details**: Siehe ISSUE-018 in ISSUES.md (als gelöst markiert)

---

## 🟠 Hohe Priorität (fortgesetzt)

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
  - [x] dashboard.ts aktualisiert mit asyncHandler (2025-12-06)
  - [x] diagnosticsRouter.ts aktualisiert mit asyncHandler (2025-12-06)
  - [x] systemInfoRouter.ts aktualisiert mit asyncHandler (2025-12-06)
  - [x] authRouter.ts aktualisiert mit asyncHandler (2025-12-06)
  - [x] calendarRouter.ts aktualisiert mit asyncHandler (2025-12-06)
  - [x] innovationRouter.ts (9 Endpoints) - ✅ ERLEDIGT (2025-12-07)
  - [x] aiRouter.ts (10 Endpoints) - ✅ ERLEDIGT (2025-12-07)
  - [x] aiAnnotatorRouter.ts (68 Endpoints) - ✅ ERLEDIGT (2025-12-07)
  - **Aufwand**: 10 Stunden (16/16 Router komplett)
  - **Ergebnis**: ✅ Standardisiertes Error-Handling für ALLE Router implementiert

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

- [x] **Dokumentations-Konsolidierung** ✅ VOLLSTÄNDIG ERLEDIGT (2025-12-07)
  - [x] Changelogs zusammenführen (CHANGELOG.md)
  - [x] Issues aufräumen (nur aktive in ISSUES.md)
  - [x] Archiv erstellen (../archive/ARCHIVE.md) für behobene Issues
  - [x] Redundante Dateien entfernen (6 Dateien)
  - [x] README aktualisieren mit neuer Struktur
  - [x] Erweiterte Dokumentation (2025-12-06):
    - [x] ERROR_HANDLING.md - Standardisiertes Error-Handling-System
    - [x] DATABASE_OPTIMIZATION.md - DB-Performance und Optimierung
    - [x] WEBSOCKET_REALTIME.md - WebSocket und Real-Time Features
  - [x] README_COMPREHENSIVE.md konsolidiert (2025-12-07):
    - [x] Beste Inhalte beider READMEs zusammengeführt
    - [x] Doppelte Informationen entfernt
    - [x] README_COMPREHENSIVE.md archiviert
    - [x] Kernphilosophie-Sektion hinzugefügt
    - [x] Aktualisierungsdaten auf 7. Dezember 2025 gesetzt
  - **Aufwand**: 1-2 Stunden → 2 Stunden (inkl. finale Konsolidierung)
  - **Ergebnis**: Klare, wartbare Dokumentationsstruktur mit konsolidiertem README

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

- [x] **Database Query-Optimierung** ✅ ERLEDIGT (2024-12-05, erweitert 2025-12-06)
  - [x] Slow-Query-Logging aktivieren (queryMonitor mit konfigurierbarem Threshold)
  - [x] Query-Performance-Monitoring (QueryMetrics-Tracking, Stats-Endpoint)
  - [x] Index-Analyzer-Tool erstellt (analyzeIndexes.ts - 2025-12-06)
  - [x] Dokumentation erstellt (DATABASE_OPTIMIZATION.md - 2025-12-06)
    - [x] Index-Optimierungsstrategien
    - [x] N+1-Query-Lösungsansätze
    - [x] Caching-Strategien
    - [x] Connection-Pooling
    - [x] Best Practices
  - [x] Indizes analysieren und optimieren ✅ ERLEDIGT (2025-12-06)
    - Tool getestet und funktioniert (npm run analyze:indexes)
    - Analyzer gibt Empfehlungen für fehlende Indizes
    - Priorisierung nach high/medium/low
  - [x] N+1-Queries vermeiden ✅ TEILWEISE (2025-12-06)
    - Query-Monitoring ist aktiv
    - Dokumentation mit Best Practices vorhanden
    - Code-Review kann basierend auf Monitoring durchgeführt werden
  - **Aufwand**: 2-3 Tage
  - **Ergebnis**: QueryMonitor-Service, Index-Analyzer-Tool, umfassende Dokumentation mit praktischen Beispielen

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

- [x] **Full-Text-Search verbessern** ✅ ERLEDIGT (2024-12-05, erweitert 2025-12-07)
  - [x] Enhanced Search Service mit Relevance-Scoring
  - [x] Faceted Search implementieren (kinds, tags, areas)
  - [x] Search-Highlighting mit Snippet-Extraktion
  - [x] Fuzzy Matching mit Levenshtein Distance
  - [x] Search-Suggestions-Funktion
  - [x] ElasticSearch oder MeiliSearch evaluieren ✅ ERLEDIGT (2025-12-07)
  - [x] Search-Analytics Dashboard ✅ ERLEDIGT (2025-12-07)
  - **Aufwand**: 3-5 Tage → 6 Tage
  - **Ergebnis**: Vollständiger SearchService, Search Analytics Dashboard mit Metrics & Trends, ElasticSearch/MeiliSearch Evaluation Guide

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

- [x] **Quality Assurance Dashboard** ✅ ERLEDIGT (2025-12-07)
  - [x] Annotation-Quality-Metrics
  - [x] Manual Review-Interface
  - [x] Approval-Workflow
  - [x] Quality-Trend-Charts
  - **Aufwand**: 4-5 Tage → 4 Tage
  - **Ergebnis**: Vollständiges QA-Dashboard mit Quality Trends, Manual Review Interface, und Approval Workflow

- [x] **AI Model Management UI** ✅ ERLEDIGT (2025-12-07)
  - [x] Model-Selection-Interface
  - [x] Model-Performance-Comparison
  - [x] Cost-Tracking
  - [x] Usage-Statistics
  - **Aufwand**: 3-4 Tage → 3 Tage
  - **Ergebnis**: Vollständiges Model Management UI mit Selection, Performance Comparison, Cost Tracking, und Usage Statistics

---

## � Neue Aufgaben - Hauptfunktionen-Integration

### Backend - Hauptmodule (Status: ✅ ERLEDIGT 17. Dez 2025)

- [x] **Geschäftsverwaltung Router** ✅ ERLEDIGT (17. Dez 2025)
  - [x] `/api/business` - Unternehmen, Prozesse, Risiko & Compliance
  - [x] Endpoints für Stammdaten, Prozess-Management, Audits
  - [x] Zod-Validierung für alle Input-Daten
  - **Datei**: `apps/backend/src/routes/business/businessRouter.ts`

- [x] **Vertrieb Router** ✅ ERLEDIGT (17. Dez 2025)
  - [x] `/api/sales` - Pipeline, Angebote, Aufträge, Leads, Kampagnen
  - [x] CRM-Funktionen, Marketing-Automation
  - [x] Vollständiges Lead-to-Cash Process-Mapping
  - **Datei**: `apps/backend/src/routes/sales/salesRouter.ts`

- [x] **Einkauf Router** ✅ ERLEDIGT (17. Dez 2025)
  - [x] `/api/procurement` - Bestellungen, Lieferanten, Wareneingang
  - [x] Bedarfsplanung und -berechnung
  - [x] Lieferantenbewertung
  - **Datei**: `apps/backend/src/routes/procurement/procurementRouter.ts`

- [x] **Produktions Router** ✅ ERLEDIGT (17. Dez 2025)
  - [x] `/api/production` - Planung, Steuerung, QM, Wartung
  - [x] Maschinen-Management, Rückmeldungen
  - [x] Qualitätsprüfungen und -kontrollen
  - **Datei**: `apps/backend/src/routes/production/productionRouter.ts`

- [x] **Lager Router** ✅ ERLEDIGT (17. Dez 2025)
  - [x] `/api/warehouse` - Bestand, Kommissionierung, Versand
  - [x] Lagerplätze, Inventur
  - [x] Sendungsverfolgung
  - **Datei**: `apps/backend/src/routes/warehouse/warehouseRouter.ts`

- [x] **Reporting Router** ✅ ERLEDIGT (17. Dez 2025)
  - [x] `/api/reporting` - Standard-Reports, Ad-hoc, KI-Analytics
  - [x] Finanz-, Vertriebs-, Produktionsberichte
  - [x] KI-Vorhersagen, Insights, Trends
  - **Datei**: `apps/backend/src/routes/reporting/reportingRouter.ts`

- [x] **Backend-Integration** ✅ ERLEDIGT (17. Dez 2025)
  - [x] Alle Router in index.ts registriert
  - [x] Standardisiertes Error-Handling
  - [x] Zod-Validierung konsistent implementiert

### Frontend - Hauptfunktionen (Status: ⏳ IN ARBEIT)

- [x] **Dashboard-Widgets** ✅ ERLEDIGT (17. Dez 2025)
  - [x] ModuleWidgets für alle 11 Hauptmodule
  - [x] KPI-Anzeigen mit Echtzeit-Daten
  - [x] Navigations-Integration
  - **Datei**: `apps/frontend/src/components/Dashboard/widgets/ModuleWidgets.tsx`

- [x] **Hauptnavigation** ✅ ERLEDIGT (17. Dez 2025)
  - [x] Hierarchische Menüstruktur
  - [x] Kollapsible Untermenüs
  - [x] Dark Mode Support
  - **Datei**: `apps/frontend/src/components/Navigation/MainNavigation.tsx`

- [x] **Dashboard-Integration** ✅ ERLEDIGT (17. Dez 2025)
  - [x] Widgets in Dashboard.tsx integriert
  - [x] Navigation zu Modulen implementiert

- [x] **Modul-Seiten erstellen** ✅ GRUNDLAGEN ERLEDIGT (19. Dez 2025)
  - [x] Business-Management-Seiten (bereits vorhanden: CompanyPage, OrganizationPage)
  - [x] Sales & CRM-Seiten (SalesPage.tsx - Stats, Pipeline, Quotes, Orders, Leads, Campaigns) 🆕
  - [x] Procurement-Seiten (ProcurementPage.tsx - Purchase Orders, Suppliers, Goods Receipt) 🆕
  - [x] Production-Seiten (ProductionPage.tsx - Orders, Planning, Machines, Quality) 🆕
  - [x] Warehouse-Seiten (WarehousePage.tsx - Stock, Locations, Picking, Shipping) 🆕
  - [x] Reporting-Seiten (ReportingPage.tsx - Standard Reports, Ad-hoc, AI Analytics) 🆕
  - **Aufwand**: 2-3 Wochen → 2 Stunden für Basis-Seiten erledigt ✅
  - **Status**: Grundlegende Seiten mit Stats und Feature-Übersicht erstellt
  - **Verbleibend**: Detaillierte Funktionen und CRUD-Operationen (1-2 Wochen)

### Dokumentation (Status: ✅ ERLEDIGT)

- [x] **Menüsystem-Dokumentation** ✅ ERLEDIGT (17. Dez 2025)
  - [x] Vollständige Modulübersicht
  - [x] API-Endpoint-Dokumentation
  - [x] Prozess-Integrationen beschrieben
  - [x] Frontend-Komponenten dokumentiert
  - **Datei**: `docs/MENU_SYSTEM.md`

### Tests & Qualitätssicherung (Status: 🔄 IN BEARBEITUNG)

- [ ] **Backend-Tests für neue Router** (Infrastruktur: ✅ ERLEDIGT - 19. Dez 2025)
  - [x] ✅ Business Router Tests - TypeScript kompiliert (supertest installed)
  - [x] ✅ Sales Router Tests - TypeScript kompiliert (supertest installed)
  - [x] ✅ Procurement Router Tests - TypeScript kompiliert (supertest installed)
  - [x] ✅ Production Router Tests - TypeScript kompiliert (supertest installed)
  - [x] ✅ Warehouse Router Tests - TypeScript kompiliert (supertest installed)
  - [x] ✅ Reporting Router Tests - TypeScript kompiliert (supertest installed)
  - [ ] Test-Implementierung vollständig ausbauen (Assertions, Edge Cases)
  - **Aufwand**: 1 Woche → 2 Stunden (Infrastruktur erledigt), 4-5 Tage verbleibend
  - **Details**: supertest@^7.0.0 und @types/supertest@^6.0.2 installiert

- [ ] **Frontend-Tests für Widgets**
  - [x] ✅ ModuleWidgets Tests - TypeScript Errors behoben (19. Dez 2025)
    - Non-null assertion entfernt (proper null checks)
    - Missing onNavigate prop hinzugefügt
    - 11 Test Cases kompilieren erfolgreich
  - [ ] MainNavigation Tests
  - [ ] Integration Tests
  - **Aufwand**: 3-4 Tage → 1 Stunde (ModuleWidgets erledigt), 2-3 Tage verbleibend

### Datenbank-Integration (Status: ✅ WEITGEHEND ERLEDIGT)

- [x] **Datenbank-Schema für neue Module** ✅ ERLEDIGT (vor 19. Dez 2025)
  - [x] ✅ **Business-Tabellen** - Umfassende Implementierung:
    - business_company_info, business_legal_info, business_tax_info, business_bank_accounts
    - business_communication, business_departments, business_locations
    - business_processes (Name, Beschreibung, Owner, Status, Kategorie)
    - business_risks (Titel, Beschreibung, Wahrscheinlichkeit, Impact, Mitigation)
    - business_audits (via business_legal_info Compliance-Felder)
    - **Datei**: create_business_management_tables.sql (667 Zeilen)
  - [x] ✅ **Sales-Tabellen**:
    - sales_orders (Order Number, Customer ID, Delivery Date, Status, Payment Status)
    - marketing_campaigns (Name, Budget, Status, Metrics)
    - crm_customers, crm_contacts, crm_opportunities, crm_activities
    - **Datei**: create_all_modules_tables.sql
  - [x] ✅ **Procurement-Tabellen**:
    - procurement_suppliers (Name, Email, Rating, Status, Payment Terms)
    - procurement_purchase_orders (PO Number, Supplier, Delivery Date, Status)
    - procurement_receiving (Received Date, Quality Check, Notes)
    - **Datei**: create_all_modules_tables.sql
  - [x] ✅ **Production-Tabellen**:
    - production_orders (Order Number, Quantity, Status, Priority)
    - production_planning (Scheduled Date, Resource ID, Capacity)
    - production_quality (Inspection Date, Result, Defects Found)
    - production_maintenance (Equipment, Maintenance Type, Status, Cost)
    - **Datei**: create_all_modules_tables.sql
  - [x] ✅ **Warehouse-Tabellen**:
    - warehouse_locations (Code, Type, Capacity, Parent Hierarchy)
    - warehouse_picking (Order ID, Picker, Status, Completion Time)
    - logistics_shipments (Shipment Number, Carrier, Tracking, Status)
    - inventory_items, inventory_movements, inventory_warehouses, inventory_stock_levels
    - **Dateien**: create_all_modules_tables.sql, create_inventory_tables.sql
  - **Status**: Alle Haupttabellen implementiert mit vollständigen Constraints, Foreign Keys, Indexes

- [x] **Migrations erstellen** ✅ ERLEDIGT (vor 19. Dez 2025)
  - [x] ✅ Initial-Schema für alle Module
    - create_all_modules_tables.sql (491 Zeilen) - CRM, Dashboard, Business, Procurement, Production, Warehouse, Sales, Reporting
    - create_business_management_tables.sql (667 Zeilen) - Detaillierte Business Management Strukturen
    - create_inventory_tables.sql (102 Zeilen) - Inventory Management System
  - [x] ✅ Seed-Daten für Demo/Test
    - seed_comprehensive_dashboard_data.sql (333 Zeilen)
    - Revenue Metrics, Top Customers/Products, Regional Revenue, Margin Metrics
    - Order Intake, Liquidity Metrics, KPIs
  - [ ] Seed-Daten für neue Module (Business, Sales, Procurement, Production, Warehouse) - optional
  - **Status**: Migrations komplett, Demo-Daten für Dashboard vorhanden
  - **Verbleibend**: Optional - Erweiterte Seed-Daten für alle neuen Module (1-2 Tage)

### Authentifizierung & Autorisierung (Status: ✅ ABGESCHLOSSEN)

- [x] **Rollenbasierte Zugriffskontrolle** ✅ IMPLEMENTIERT (2025-12-19)
  - [x] Rollen definieren (Admin, Manager, User, etc.) - 7 System Rollen
  - [x] Berechtigungen pro Modul - 50+ Berechtigungen
  - [x] Middleware für Route-Protection - 7 verschiedene Middleware
  - [x] RBAC Service mit Datenbank-Integration
  - [x] RBAC Router mit API Endpoints
  - [x] Datenbank-Migrations-Skript
  - [x] Vollständige Dokumentation
  - **Aufwand**: 1 Tag (Optimiert)
  - **Implementiert**:
    - **types/rbac.ts** - Type Definitionen
    - **config/rbac.ts** - Standard Rollen & Permissions
    - **services/rbacService.ts** - Core RBAC Logik (500+ Zeilen)
    - **middleware/rbacMiddleware.ts** - Authorization Middleware (400+ Zeilen)
    - **routes/rbacRouter.ts** - RBAC API Router (300+ Zeilen)
    - **migrations/003_rbac_system.sql** - DB Schema & Initial Data
    - **docs/RBAC_IMPLEMENTATION.md** - Umfangreiche Dokumentation

---

## �🟢 Niedrige Priorität / Nice-to-Have

### Developer Experience

- [x] **Development Tools** ✅ DOKUMENTIERT (2025-12-07)
  - [x] Storybook für Component-Development (Setup-Guide)
  - [x] Mock-Server für Frontend-Dev (JSON Server + MSW Guide)
  - [x] Hot-Module-Replacement optimieren (Vite HMR Guide)
  - [x] Dev-Tools-Extension (React DevTools + Custom Panel Guide)
  - [x] SonarQube Integration (Setup-Guide)
  - **Aufwand**: 2-3 Tage → 1 Tag (Dokumentation)
  - **Ergebnis**: Vollständige DEV_TOOLS_GUIDE.md mit Konfiguration und Best Practices

- [x] **Code Quality Tools** ✅ ERLEDIGT (2025-12-09)
  - [x] Pre-commit Hooks (Husky) - Format Hook aktiv
  - [x] Conventional Commits enforcing - commitlint konfiguriert
  - [x] Umfassende Dokumentation (COMMIT_CONVENTIONS.md, SCRIPTS.md)
  - [x] ESLint v9 flat config für Backend und Frontend ✅ (6. Dez 2025)
  - [x] TypeScript ESLint-Plugin konfiguriert ✅
  - [x] React-spezifische ESLint-Regeln (React 19) ✅
  - [x] Security: GitHub PAT entfernt, .gitignore erweitert ✅
  - [x] npm audit: 0 Vulnerabilities (3 behoben) ✅
  - [x] Dokumentations-Konsolidierung: 4 Dateien archiviert ✅
  - [x] TypeScript Strict Mode für Backend aktiviert ✅ NEU (9. Dez 2025)
  - [x] Code-Coverage-Reports (bereits vorhanden) ✅ NEU (9. Dez 2025)
    - Backend: 57.73% statements, 44.11% branches
    - Frontend: 71.42% statements, 75.63% branches
    - Umfassende Dokumentation erstellt (CODE_COVERAGE.md)
    - Package.json Scripts erweitert
  - [x] SonarQube Integration ✅ ERLEDIGT (9. Dez 2025)
    - Bereits in GitHub Actions konfiguriert (.github/workflows/test.yml)
    - sonar-project.properties vollständig konfiguriert
    - Setup-Script erstellt (scripts/sonarqube-setup.sh)
    - Umfassende Dokumentation vorhanden (docs/SONARQUBE.md)
    - npm run sonar:setup für lokale Vorbereitung
  - **Aufwand**: 1-2 Tage → 10 Stunden erledigt ✅ KOMPLETT

### Code Quality Enhancement

- [x] **ESLint Strict Mode & Pre-commit Hooks** ✅ KOMPLETT ERLEDIGT (9. Dez 2025)
  - [x] ESLint no-console Regel hochgestuft auf "error"
  - [x] Pre-commit Hook aktiviert (console-check + format)
  - [x] Console.log Check-Script erstellt (check-console-logs.sh)
  - [x] Script läuft automatisch bei jedem Commit (verhindert neue console.log)
  - [x] npm run check:console für manuelle Prüfung
  - [x] Console.log Migration vollständig abgeschlossen (6 Instanzen in dbService.ts)
  - [x] Verbleibende console.log nur in legitimen Bereichen (CLI-Scripts, Logger-Utilities)
  - [x] ESLint-Ausnahmen für Scripts und Logger konfiguriert
  - **Aufwand**: 2-3 Stunden → 2 Stunden erledigt ✅ KOMPLETT

### Logging & Monitoring

- [x] **Log-Aggregation & Retention** ✅ DOKUMENTIERT (9. Dez 2025)
  - [x] LOG_AGGREGATION.md bereits vorhanden (Loki + Grafana)
  - [x] LOG_RETENTION_POLICY.md erstellt mit:
    - Retention-Perioden nach Umgebung (Dev/Staging/Prod)
    - DSGVO/GoBD Compliance-Anforderungen
    - Log-Kategorisierung (Critical, Important, Standard, Temporary)
    - Loki & Promtail Konfiguration
    - Backup & Archivierungs-Strategien
    - S3 Lifecycle Policies
    - Kosten-Optimierung
    - Compliance-Audit-Checkliste
  - **Aufwand**: 2 Stunden → 2 Stunden erledigt ✅ KOMPLETT

### Code Dokumentation

- [x] **JSDoc & TypeDoc** ✅ PHASE 1 BEGONNEN (9. Dez 2025)
  - [x] JSDoc Style Guide erstellt (JSDOC_GUIDE.md)
    - Dokumentations-Standards definiert
    - Best Practices für Functions, Classes, Types
    - Migration Plan (3-Phasen-Ansatz)
    - Beispiele für alle gängigen Patterns
  - [x] TypeDoc Konfiguration optimiert
    - Erfolgreiche Generierung von API-Dokumentation
    - Output: docs/api/index.html
    - npm run docs funktioniert
    - npm run docs:serve für lokale Ansicht
  - [x] Phase 1: Critical APIs (erweitert - 8 von ~20 Dateien) ✅ FORTSCHRITT (19 Dec 2025)
    - [x] AuthService: Vollständige JSDoc für init, register, login, logout, validateToken, refreshToken
    - [x] errorHandler Middleware: Umfassende Dokumentation mit Beispielen
    - [x] asyncHandler Middleware: Best-Practice-Beispiele hinzugefügt
    - [x] redisService: Vollständige JSDoc (15+ Methoden, alle Interfaces dokumentiert)
    - [x] filterService: Vollständige JSDoc (alle Methoden und Interfaces)
    - [x] systemInfoService: Vollständige JSDoc (5 Hauptmethoden dokumentiert) 🆕
    - [x] batchProcessingService: Erweiterte JSDoc (Klassen-Header + 3 Hauptmethoden) 🆕
    - [x] websocketService: Bereits vollständig dokumentiert ✓
    - [ ] Verbleibende Services (~12): dbService, aiAnnotatorService, etc.
    - [ ] Verbleibende Middleware: cacheMiddleware, metricsMiddleware, etc.
  - [ ] Phase 2: Routes
  - [ ] Phase 3: Supporting Code
  - **Aufwand**: 2-3 Stunden → 5 Stunden erledigt (Infrastruktur + Phase 1 erweitert ✅), 5-8 Stunden für vollständige Migration verbleibend

- [ ] **Frontend Component Documentation** 🆕 (21. Dez 2025 - In Bearbeitung)
  - [x] Dokumentationsstruktur nach Backend-Standard etabliert
  - [x] JSDoc für UI-Komponenten hinzugefügt (4/50+ Komponenten)
    - [x] AIAnnotator.tsx - Vollständige Modul-Dokumentation
    - [x] FunctionsCatalog.tsx - Komponenten-Dokumentation mit Beispielen
    - [x] HelpCenter.tsx - Interface- und Komponenten-Dokumentation
    - [x] Card.tsx - Props-Dokumentation mit Beispielen
    - [x] LoadingFallback.tsx - Suspense-Fallback-Dokumentation
  - [ ] Weitere Komponenten dokumentieren (~46 verbleibend)
    - [ ] Dashboard-Komponenten (Dashboard.tsx, CategoryGrid, etc.)
    - [ ] Navigation-Komponenten (MainNavigation, Sidebar, etc.)
    - [ ] Feature-Komponenten (BatchProcessing, QualityDashboard, etc.)
    - [ ] UI-Komponenten (Button ✅, Input, Table, Toast, etc.)
    - [ ] Page-Komponenten (Settings, Sales, Procurement, etc.)
  - **Aufwand**: 2-3 Tage → 1 Stunde erledigt (5 Komponenten ✅), 2 Tage verbleibend
  - **Priorität**: Mittel - Verbessert Developer Experience und Code-Wartbarkeit
  - **Stil**: Analog Backend mit @module, @category, @example, @param, @returns
  - **Ziel**: Alle 50+ Frontend-Komponenten mit JSDoc wie Backend-Services

### UI/UX Enhancements

- [x] **Accessibility (a11y)** ✅ GRUNDLAGEN ERLEDIGT (2025-12-06)
  - [x] ARIA-Labels vervollständigen
    - Button-Komponente mit aria-label, aria-describedby erweitert
    - aria-busy für Loading-States
    - role="status" für Spinner
  - [x] Keyboard-Navigation testen
    - trapFocus() Utility für Modals
    - KeyboardShortcuts-Manager implementiert
    - Fokus-Management-Utilities (getFocusableElements, moveFocus)
  - [x] Screen-Reader-Kompatibilität
    - announceToScreenReader() Funktion
    - SkipLink-Komponente für Navigation
    - sr-only Klasse bereits vorhanden
  - [x] WCAG 2.1 AA Compliance - Basis implementiert
    - Contrast ratios in dark.css bereits optimiert
    - Focus-Styles mit outline
    - Reduced-motion Media-Query in animations.css
  - **Aufwand**: 2-3 Tage → 1 Tag erledigt
  - **Ergebnis**: Grundlegende Accessibility-Features implementiert, weitere Tests empfohlen

- [x] **Animation & Transitions** ✅ ERLEDIGT (2025-12-06)
  - [x] Page-Transitions
    - fadeIn, fadeOut, slideIn (all directions), scaleIn/Out
    - Utility classes für einfache Anwendung
  - [x] Micro-Interactions
    - pulse, bounce, shake, spin, wiggle
    - hover-scale, hover-lift, hover-glow effects
  - [x] Loading-Animations
    - shimmer effect für Skeleton-Loader
    - Spinner mit Animation
  - [x] Success/Error-Feedback-Animations
    - successPulse, errorPulse, warningPulse
    - Box-shadow pulse effects
  - **Aufwand**: 1-2 Tage → 1 Tag erledigt
  - **Ergebnis**: Umfassende animations.css mit ~20 Animationen und Utility-Classes

- [x] **Dark Mode Improvements** ✅ ERLEDIGT (2025-12-06)
  - [x] Contrast-Ratios optimieren
    - Bereits in dark.css mit WCAG-konformen Werten
    - Enhanced deep color palette
  - [x] Auto-Detection Systemeinstellung
    - Bereits seit Anfang in ThemeContext implementiert (window.matchMedia)
    - Prüft prefers-color-scheme: dark
  - [x] Sanftere Theme-Transitions
    - 250ms ease-in-out transitions für background und color
    - Angewendet auf documentElement und body
  - **Aufwand**: 1 Tag → 30 Minuten (meiste Features bereits vorhanden)
  - **Ergebnis**: Dark Mode vollständig optimiert mit smooth transitions

### Internationalization

- [x] **i18n Vervollständigen** ✅ ERLEDIGT (2025-12-06)
  - [x] Fehlende Übersetzungen ergänzen
    - UI-Strings (save, delete, edit, add, etc.) hinzugefügt
    - Datetime-Strings (today, yesterday, tomorrow, etc.)
    - Common items mit Plural-Support
  - [x] Plural-Forms korrekt handhaben
    - count_one, count_other Pattern implementiert
    - Deutsche und englische Pluralformen
  - [x] Date/Time-Formatierung lokalisieren
    - Intl.DateTimeFormat Integration in i18n.ts
    - useFormatting Hook erstellt
    - Short, long, full, time, datetime Formate
  - [x] Currency-Formatting
    - Intl.NumberFormat für Währungen
    - Automatische Locale-Erkennung (EUR/USD)
    - formatPercent, formatNumber, formatFileSize
  - **Aufwand**: 2-3 Tage → 2 Stunden erledigt
  - **Ergebnis**: Vollständiges i18n-System mit Formattern und Pluralisierung

- [x] **Neue Sprachen hinzufügen** ✅ ERLEDIGT (2025-12-07)
  - [x] Französisch (Vervollständigung)
  - [x] Italienisch
  - [x] Polnisch
  - [x] Türkisch
  - **Aufwand**: 1-2 Tage pro Sprache → 2 Stunden erledigt
  - **Ergebnis**: 4 neue/vervollständigte Sprachen mit vollständiger i18n-Integration

### Monitoring & Observability

- [x] **Logging-Infrastructure** ✅ GRUNDLAGEN ERLEDIGT (2025-12-06)
  - [x] Structured Logging (Pino erweitern)
    - Timestamp Formatting hinzugefügt
    - Security Redaction (password, token, apiKey, secret)
    - Base Context (pid, hostname)
    - Semantic Log Helpers (request, query, auth, performance, business, security)
    - Level Formatting (uppercase)
  - [ ] Log-Aggregation (ELK Stack / Loki) - Folgt später
  - [ ] Log-Retention-Policies - Folgt später
  - **Aufwand**: 2-3 Tage → 1 Stunde für Grundlagen erledigt
  - **Ergebnis**: Enhanced Pino Logger mit Redaction und Semantic Helpers

- [x] **Metrics & Monitoring** ✅ ERLEDIGT (2025-12-09)
  - [x] Prometheus-Exporter (prom-client integriert)
  - [x] Grafana-Dashboards (13-Panel Dashboard erstellt)
  - [x] Custom Business-Metrics (HTTP, DB, AI, Business, System)
  - [x] Alert-Rules definieren (15 Rules in 5 Kategorien)
  - [x] Umfassende Dokumentation (monitoring/README.md)
  - **Aufwand**: 3-4 Tage → 3 Tage erledigt
  - **Ergebnis**: Vollständiges Prometheus + Grafana Monitoring-Setup

- [x] **Tracing** ✅ ERLEDIGT (2025-12-09)
  - [x] OpenTelemetry Integration (bereits vorhanden, dokumentiert)
  - [x] Distributed Tracing (konfiguriert und dokumentiert)
  - [x] Jaeger/Zipkin Setup (docker-compose.yml erstellt)
  - [x] OTLP Collector Konfiguration
  - [x] Grafana Integration für Traces
  - [x] Umfassende Dokumentation (TRACING_SETUP.md)
  - **Aufwand**: 2-3 Tage → 3 Stunden erledigt

- [x] **Error Tracking** ✅ ERLEDIGT (2025-12-09)
  - [x] Sentry Integration (bereits vorhanden, erweitert)
  - [x] Error-Grouping und -Deduplication (automatisch)
  - [x] Source-Maps für Stack-Traces (konfiguriert und dokumentiert)
  - [x] Alert-Notifications (Alertmanager konfiguriert)
  - [x] Sensitive Data Redaction (implementiert)
  - [x] Umfassende Dokumentation (ERROR_TRACKING_SETUP.md)
  - **Aufwand**: 1 Tag → 2 Stunden erledigt

---

## 🚀 Phase 3: Enterprise Features (Langfristig)

### HR-Modul

- [x] **Mitarbeiter-Management** ✅ COMPLETED (2024-12-19)
  - [x] Mitarbeiter anlegen/bearbeiten
  - [x] Vertragsmanagement
  - [x] Dokumentenverwaltung
  - [x] Onboarding-Workflow
  - **Implementiert**:
    - Strict TypeScript types (`types/hr.ts`)
    - HR Service mit 30+ Methoden (`services/hrService.ts`)
    - RESTful API mit 25+ Endpoints (`routes/hr/hrRouter.ts`)
    - RBAC-Integration (hr:read, hr:create, hr:update, hr:delete, hr:approve)
    - 10 Datenbank-Tabellen (employees, contracts, departments, onboarding, documents)
    - Frontend-Typen vorbereitet (`apps/frontend/src/types/hr.ts`)
    - Umfassende Dokumentation (`docs/HR_MODULE_IMPLEMENTATION.md`)
  - **Aufwand**: 2-3 Wochen → 4 Stunden erledigt ✅

- [x] **Zeiterfassung** ✅ COMPLETED (2024-12-19)
  - [x] Time-Tracking-Interface
  - [x] Urlaubs-/Abwesenheitsmanagement
  - [x] Überstunden-Konto
  - [x] Genehmigungsworkflows
  - **Implementiert**:
    - Time Entry Tracking (hr_time_entries Tabelle)
    - Leave Request Management (hr_leave_requests Tabelle)
    - Overtime Tracking (hr_overtime Tabelle)
    - Approval Workflows (approve/reject Endpoints)
    - Date-Range Queries
    - Automatic Hours Calculation
  - **Aufwand**: 2 Wochen → Inkludiert in HR-Modul ✅

- [ ] **Payroll**
  - [x] Gehaltsabrechnung (Basisimplementierung)
  - [ ] Steuerberechnung
  - [ ] SEPA-Export
  - [ ] Lohnjournal
  - **Teilweise implementiert**:
    - Payroll Records (hr_payroll Tabelle)
    - Gross/Net Salary Calculation
    - Tax and Insurance Deductions
    - Payment Tracking
  - **Aufwand**: 3-4 Wochen (2 Wochen verbleibend für erweiterte Features)

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

> **Hinweis**: Diese Sprints wurden ursprünglich für Q1 2025 geplant, aber vorzeitig abgeschlossen.

**Sprint 1 (Geplant: KW 1-2/2025 | Tatsächlich: KW 49/2025)** - AI-Annotator Production-Ready: ✅ ERLEDIGT (2025-12-07)

- [x] AI-Annotator Frontend-Integration (aiAnnotatorRouter.tsx, useAiAnnotatorRouter.ts)
- [x] Batch-Processing-UI implementieren (BatchProcessingPage.tsx, BatchCreationForm.tsx, ProgressTracker.tsx)
- [x] Quality-Dashboard visualisieren (QADashboard.tsx mit API-Integration)
- [x] Model-Management-Interface (ModelComparison.tsx, ModelsTab.tsx mit Stats und Vergleich)

**Sprint 2 (Geplant: KW 3-4/2025 | Status: KW 49/2025)** - Function-Node-Transformation MVP: ⚠️ TEILWEISE (2025-12-07)

- [x] Markdown-Parser implementieren (outlineParser.ts - parst Unicode-ASCII-Bäume + Markdown-Bullets)
- [ ] Schema-Extractor entwickeln (NICHT IMPLEMENTIERT - benötigt für Metadaten-Extraktion)
- [ ] Code-Generator (TypeScript) erstellen (NICHT IMPLEMENTIERT - benötigt für Function-Node → TypeScript)
- [ ] API-Registration-System (NICHT IMPLEMENTIERT - benötigt für dynamisches Laden)
- [ ] Test-Generator implementieren (NICHT IMPLEMENTIERT - benötigt für Auto-Testing)

**Sprint 3 (Geplant: KW 5-6/2025)** - HR & Finance Module vervollständigen:

- [x] HR-Modul: Entwicklungsanleitung erstellt (docs/HR_MODULE_GUIDE.md - 9. Dez 2025)
- [x] Finance-Modul: Entwicklungsanleitung erstellt (docs/FINANCE_MODULE_GUIDE.md - 9. Dez 2025)
- [ ] HR-Modul: CRUD-Operationen implementieren
- [ ] Finance-Modul: Rechnungserstellung implementieren
- [ ] Datenbank-Migrationen für HR und Finance
- [ ] Frontend-Komponenten für beide Module

**Sprint 4 (Geplant: KW 7-8/2025)** - Compliance & Documentation:

- [ ] GoBD-Compliance-Checks
- [ ] DSGVO-Audit-Toolkit
- [ ] API-Dokumentation vervollständigen (OpenAPI 3.0)
- [ ] Security-Audit durchführen

---

## 📊 Fortschrittstracking

### Completion Rate (Stand 14. Dezember 2025)

- 🟢 **Abgeschlossen**: 85% (Infrastructure, Core-Features, Error-Handling, i18n, Accessibility, Animations, Dokumentation, Sprint 1)
- 🟡 **In Arbeit**: 11% (Sprint 2: Function-Transformation teilweise, JSDoc Phase 1 begonnen)
- 🔴 **Offen**: 4% (Enterprise-Features, Advanced-AI, Sprint 3-4)

**Hinweis (14. Dezember 2025)**: Die meisten kritischen Services und Router haben bereits umfassende JSDoc-Dokumentation. Phase 1 der JSDoc-Migration ist weiter fortgeschritten als ursprünglich dokumentiert.

**Neu Erledigt (7. Dezember 2025 - Sprint 1 Abschluss)**:

- ✅ **Sprint 1 (Phase 1): AI-Annotator Production-Ready** - VOLLSTÄNDIG:
  - ✅ AI-Annotator Frontend-Integration (aiAnnotatorRouter.tsx, Hook)
  - ✅ Batch-Processing-UI (3 Komponenten mit WebSocket-Integration)
  - ✅ Quality-Dashboard (QADashboard.tsx mit Metriken)
  - ✅ Model-Management-Interface (ModelComparison.tsx mit Stats)
- ⚠️ **Sprint 2 (Phase 2): Function-Node-Transformation MVP** - TEILWEISE:
  - ✅ Markdown-Parser (outlineParser.ts) vorhanden
  - ❌ Schema-Extractor, Code-Generator, API-Registration, Test-Generator fehlen noch

**Neu Erledigt (17. Dezember 2025)**:

- ✅ **TypeScript Strict Mode Fixes**:
  - ✅ TypeScript-Fehler in aiAnnotatorRouter.ts behoben
  - ✅ Request-Type-Inkompatibilität in asyncHandler gelöst
  - ✅ Inline CSS überprüft - keine Strict-Mode-Fehler
  - ✅ Alle Builds erfolgreich (Backend + Frontend)
  - ✅ Alle Tests bestehen: 152/152 (100%)

- ✅ **Dashboard & Sidebar Enhancement**:
  - ✅ Sidebar mit 3 neuen Sektionen erweitert:
    - Schnellaktionen (Neue Rechnung, Neuer Kunde, Schnellsuche)
    - Kürzlich verwendet (letzte 3 Elemente)
    - Systemstatus (CPU, RAM, Laufzeit mit Auto-Refresh)
  - ✅ 2 neue Dashboard-Widgets erstellt:
    - RecentActivitiesWidget (letzte Aktivitäten)
    - StatsOverviewWidget (Geschäftsstatistiken)
  - ✅ 3 neue Backend-API-Endpoints:
    - /api/dashboard/widgets/stats (umfassende Statistiken)
    - /api/dashboard/activities (letzte Aktivitäten)
    - /api/dashboard/quick-links (Schnellzugriff-Links)
  - ✅ Vollständiges Styling mit Glassmorphism-Design
  - ✅ Responsive Design für alle neuen Komponenten
  - ✅ Dark-Theme-Unterstützung

- ✅ **Dokumentation**:
  - ✅ Enhancement Summary erstellt (ENHANCEMENT_SUMMARY_2025_12_17.md)
  - ✅ Detaillierte Dokumentation aller Änderungen
  - ✅ API-Endpoint-Dokumentation
  - ✅ TODO.md auf 17. Dezember 2025 aktualisiert

**Neu Erledigt (14. Dezember 2025)**:

- ✅ **Test-Fixes und Validierung**:
  - ✅ JWT_SECRET Test-Fix: Schwaches Passwort-Pattern vermieden
  - ✅ Alle Backend-Tests bestehen: 102/102 (100%)
  - ✅ Alle Frontend-Tests bestehen: 50/50 (100%)
  - ✅ Gesamt-Tests: 152/152 bestanden
  - ✅ Dokumentationsdaten auf 14. Dezember 2025 aktualisiert

- ✅ **Dokumentation und Analyse**:
  - ✅ Umfassende Projektanalyse erstellt (PROJECT_ANALYSIS_2025_12_14.md)
  - ✅ TODO.md, ISSUES.md, SYSTEM_STATUS.md aktualisiert
  - ✅ Monitoring-Status-Check-Script erstellt (check-monitoring-status.sh)
  - ✅ SCRIPTS.md erweitert mit neuen Utility-Scripts
  - ✅ npm run check:monitoring für schnelle Monitoring-Validierung

**Neu Erledigt (7. Dezember 2025 - Vormittag)**:

- ✅ **Dokumentations-Konsolidierung**:
  - ✅ README_COMPREHENSIVE.md → README.md zusammengeführt
  - ✅ Doppelte Informationen entfernt (~ 100 Zeilen Duplikate)
  - ✅ README_COMPREHENSIVE.md nach docs/archive/ verschoben
  - ✅ Alle Dokumentations-Links aktualisiert (README.md, SUPPORT.md)
  - ✅ Kernphilosophie-Sektion hinzugefügt
  - ✅ Status auf 7. Dezember 2025 aktualisiert
- ✅ **Repository-Verifikation**:
  - ✅ Build-Test erfolgreich (Backend + Frontend komplett)
  - ✅ Backend-Routes verifiziert: 12 APIs korrekt registriert
  - ✅ Frontend-Routes verifiziert: 18 Routes korrekt konfiguriert
  - ✅ Alle Dokumentations-Cross-Links funktionieren

**Erledigt (6. Dezember 2025 - Abend-Session)**:

- ✅ Router Error-Handling-Standardisierung (5 Router)
  - ✅ dashboard.ts - asyncHandler implementiert
  - ✅ diagnosticsRouter.ts - asyncHandler implementiert
  - ✅ systemInfoRouter.ts - asyncHandler implementiert
  - ✅ authRouter.ts - asyncHandler + APIError-Klassen
  - ✅ calendarRouter.ts - asyncHandler + APIError-Klassen
- ✅ Backend Build erfolgreich (0 TypeScript-Fehler)
- ✅ Backend Tests: 42/42 passing

**Erledigt (6. Dezember 2025 - Vormittag/Nachmittag)**:

- ✅ i18n mit Date/Time/Currency-Formatierung
- ✅ Accessibility (ARIA-Labels, Keyboard-Navigation, Screen-Reader)
- ✅ Animations & Transitions (20+ Animationen)
- ✅ Dark Mode Verbesserungen (Smooth Transitions)
- ✅ Structured Logging erweitert (Security Redaction, Semantic Helpers)
- ✅ Database Index Analyzer getestet und dokumentiert

### Key Performance Indicators (KPIs)

- **Code-Coverage**: 86% (Ziel: 90%)
- **Build-Success-Rate**: 100% ✅
- **Test-Success-Rate**: 100% (152/152 Tests) ✅
- **ESLint Warnings**: 194 (Ziel: <50) - TypeScript `any` Types
- **Deprecated Dependencies**: 6 (Ziel: 0)
- **API-Response-Time**: <100ms (95th percentile)
- **Frontend-Performance**: Lighthouse Score >90

---

**Neu Hinzugefügt (18. Dezember 2025)**:

- ✅ **System-Verifikation durchgeführt**:
  - ✅ Alle Builds erfolgreich (Backend + Frontend)
  - ✅ Alle Tests bestehen (152/152 - 102 Backend + 50 Frontend)
  - ✅ npm audit: 0 Vulnerabilities
  - ⚠️ 441 ESLint-Warnungen identifiziert (`@typescript-eslint/no-explicit-any`)
  - ✅ Deprecated Dependencies: Nur transitive Dependencies betroffen
- ✅ **ISSUE-017**: TypeScript `any` Types vollständig analysiert
  - 441 Instanzen in 56 Dateien detailliert dokumentiert
  - 4-Phasen-Migrations-Plan erstellt
  - Top 20 betroffene Dateien identifiziert
  - Aufwand neu geschätzt: 5-7 Tage
- ✅ **ISSUE-018**: Deprecated Dependencies gelöst
  - Keine direkten deprecated Dependencies mehr vorhanden
  - fluent-ffmpeg bereits entfernt
  - Nur 9 transitive Dependencies betroffen (kein Handlungsbedarf)
- ✅ **JSDoc Phase 1 erweitert**: 2 weitere Services vollständig dokumentiert 🆕
  - redisService: 15+ Methoden mit vollständiger JSDoc, Interface-Dokumentation, Beispiele
  - filterService: Alle Interfaces und Methoden mit JSDoc, Nutzungsbeispiele
  - Gesamtfortschritt Phase 1: 5/20 Services (25%) - authService, errorHandler, asyncHandler, redisService, filterService
  - Verbleibend: ~15 Services für vollständige Phase 1
- ✅ **Dokumentation**: ISSUES.md und TODO.md mit aktuellem Stand aktualisiert

---

---

## 📋 Neu identifizierte offene Aufgaben (19. Dezember 2025)

**Abgeschlossen (19. Dezember 2025 - Session 1)**:

- ✅ Dashboard Menu System-Analyse (Funktioniert korrekt - showCategories Logic geprüft)
- ✅ Frontend Impure Function Calls behoben (ErrorScreen.tsx, LoadingScreen.tsx bereits korrekt mit useState)
- ✅ React Hook Violations behoben (CallLog.tsx, FaxInbox.tsx - leere useEffect entfernt)
- ✅ Backend-Tests erstellt für alle 6 neuen Router:
  - businessRouter.test.ts (9 Tests)
  - salesRouter.test.ts (10 Tests)
  - procurementRouter.test.ts (8 Tests)
  - productionRouter.test.ts (10 Tests)
  - warehouseRouter.test.ts (11 Tests)
  - reportingRouter.test.ts (11 Tests)
- ✅ Frontend-Tests: ModuleWidgets.test.tsx erstellt (11 Tests)
- **Total**: 70 neue Tests erstellt ✨

### Frontend - Modul-Detailseiten

- [ ] **Sales-Modul - Detailseiten** 🆕 (19. Dez 2025)
  - [x] SalesPage.tsx erstellt (Basis mit Stats) ✅
  - [ ] Pipeline-Detailseite mit Drag & Drop
  - [ ] Angebots-Editor mit Positionen
  - [ ] Auftrags-Verwaltung mit Status-Workflow
  - [ ] Lead-Detailansicht mit Aktivitäten
  - [ ] Kampagnen-Dashboard mit Metriken
  - [ ] Analytics-Seite mit Charts
  - **Aufwand**: 1-2 Wochen
  - **Basis**: API-Router bereits vorhanden (salesRouter.ts)

- [ ] **Procurement-Modul - Detailseiten** 🆕 (19. Dez 2025)
  - [x] ProcurementPage.tsx erstellt (Basis mit Stats) ✅
  - [ ] Bestellungen-Editor mit Positionen
  - [ ] Lieferanten-Verwaltung mit Bewertungen
  - [ ] Wareneingangs-Interface mit Qualitätsprüfung
  - [ ] Bedarfsplanung-Dashboard
  - [ ] Lieferanten-Evaluation-Berichte
  - **Aufwand**: 1-2 Wochen
  - **Basis**: API-Router bereits vorhanden (procurementRouter.ts)

- [ ] **Production-Modul - Detailseiten** 🆕 (19. Dez 2025)
  - [x] ProductionPage.tsx erstellt (Basis mit Stats) ✅
  - [ ] Produktionsauftrags-Planung
  - [ ] Maschinen-Übersicht mit Status
  - [ ] Qualitätskontroll-Interface
  - [ ] Wartungs-Management
  - [ ] Produktions-Reports mit Charts
  - **Aufwand**: 1-2 Wochen
  - **Basis**: API-Router bereits vorhanden (productionRouter.ts)

- [ ] **Warehouse-Modul - Detailseiten** 🆕 (19. Dez 2025)
  - [x] WarehousePage.tsx erstellt (Basis mit Stats) ✅
  - [ ] Lagerbestands-Übersicht mit Suchfilter
  - [ ] Lagerplatz-Verwaltung (Heatmap)
  - [ ] Kommissionier-Interface (Scanner-Integration)
  - [ ] Versand-Management mit Tracking
  - [ ] Inventur-Modul
  - [ ] Analytics-Dashboard
  - **Aufwand**: 1-2 Wochen
  - **Basis**: API-Router bereits vorhanden (warehouseRouter.ts)

- [ ] **Reporting-Modul - Detailseiten** 🆕 (19. Dez 2025)
  - [x] ReportingPage.tsx erstellt (Basis mit Stats) ✅
  - [ ] Standard-Reports-Library
  - [ ] Ad-hoc-Query-Builder
  - [ ] AI-Analytics-Dashboard
  - [ ] Report-Scheduling-Interface
  - [ ] Export-Funktionen (PDF, Excel, CSV)
  - **Aufwand**: 1-2 Wochen
  - **Basis**: API-Router bereits vorhanden (reportingRouter.ts)

### Frontend - Weitere fehlende Seiten

- [ ] **Business-Modul - Erweiterte Seiten** 🆕
  - [x] CompanyManagement.tsx vorhanden ✅
  - [x] ProcessManagement.tsx vorhanden ✅
  - [x] RiskManagement.tsx vorhanden ✅
  - [ ] Audit-Management-Seite
  - [ ] Compliance-Dashboard
  - **Aufwand**: 1 Woche
  - **Status**: Grundlagen vorhanden (siehe FRONTEND_PAGES_IMPLEMENTATION.md)

- [ ] **Finance-Modul - Detailseiten** 🆕
  - [x] Accounting, Controlling, Treasury, Taxes-Listen vorhanden ✅
  - [ ] Rechnungs-Editor mit Positionsverwaltung
  - [ ] Buchungserfassung-Interface
  - [ ] Budget-Planning-Tool
  - [ ] Cash-Flow-Dashboard
  - [ ] Tax-Return-Generator
  - **Aufwand**: 2 Wochen
  - **Status**: Listen-Komponenten vorhanden (siehe FRONTEND_PAGES_IMPLEMENTATION.md)

- [ ] **HR-Modul - Detailseiten** 🆕
  - [x] Personnel, Time-Tracking, Development, Recruiting-Listen vorhanden ✅
  - [ ] Mitarbeiter-Detailansicht mit Dokumenten
  - [ ] Zeiterfassungs-Interface (Stempeluhr)
  - [ ] Urlaubsplanung-Kalender
  - [ ] Schulungs-Management
  - [ ] Recruiting-Pipeline
  - **Aufwand**: 1-2 Wochen
  - **Status**: Listen-Komponenten vorhanden (siehe FRONTEND_PAGES_IMPLEMENTATION.md)

- [ ] **Communication-Modul - Detailseiten** 🆕
  - [x] Email, Messaging, Social-Listen vorhanden ✅
  - [ ] Email-Client-Interface
  - [ ] Messaging-Chat-View
  - [ ] Social-Media-Publishing-Tool
  - **Aufwand**: 1 Woche
  - **Status**: Listen-Komponenten vorhanden (siehe FRONTEND_PAGES_IMPLEMENTATION.md)

### Datenbank-Schema

- [ ] **Marketing & CRM Tabellen-Integration** 🆕
  - [x] Marketing-Tabellen erstellt (create_marketing_tables.sql) ✅
    - 29 Tabellen (Campaigns, Leads, Forms, Landing Pages, etc.)
  - [x] Extended CRM-Tabellen erstellt (extend_crm_tables.sql) ✅
    - 18 Tabellen (Hierarchies, Data Quality, etc.)
  - [x] Backend-API vorhanden (marketingRouter.ts) ✅
  - [x] Frontend-Komponente vorhanden (CampaignList.tsx) ✅
  - [ ] Migrations in main database integrieren
  - [ ] Seed-Daten für Marketing/CRM erstellen
  - [ ] Frontend Marketing-Seiten vervollständigen
  - **Aufwand**: 1 Woche
  - **Status**: SQL-Schema komplett, API komplett (siehe VERTRIEB_MARKETING_IMPLEMENTATION.md)

- [ ] **Weitere Modul-Tabellen** 🆕
  - [ ] Production-Tabellen (production_orders, machines, quality_inspections)
  - [ ] Warehouse-Tabellen (stock, locations, shipments, inventory)
  - [ ] Reporting-Tabellen (reports, scheduled_reports, analytics)
  - **Aufwand**: 1-2 Wochen
  - **Status**: Router vorhanden, Schema ausstehend (siehe IMPLEMENTATION_STATUS.md)

### React Strict Mode & TypeScript

- [x] **Frontend React-Hooks-Violations beheben** ✅ TEILWEISE ERLEDIGT (19. Dez 2025)
  - [x] CallLog.tsx - Leerer useEffect entfernt ✅
  - [x] FaxInbox.tsx - Leerer useEffect entfernt ✅
  - [x] QuickChatButton.tsx - Verwendet bereits useLayoutEffect (korrekt) ✅
  - [x] ErrorScreen.tsx - Verwendet bereits useState (korrekt) ✅
  - [x] LoadingScreen.tsx - Verwendet bereits useState (korrekt) ✅
  - ✅ CustomerList.tsx - Hat korrekten useEffect mit API-Call (kein Problem)
  - ✅ EmployeeList.tsx - Verwendet Mock-Daten, kein useEffect nötig (kein Problem)
  - ✅ InventoryList.tsx - Hat korrekten useEffect mit API-Call (kein Problem)
  - ✅ ProjectList.tsx - Hat korrekten useEffect mit API-Call (kein Problem)
  - ✅ useHealth.ts - Korrekt implementiert mit Race-Condition-Protection
  - ✅ useSystemInfo.ts - Korrekt implementiert
  - ✅ ProgressTracker.tsx - Kein setState in useEffect (kein Problem)
  - ❌ QuickChatInput.tsx - Datei existiert nicht
  - **Aufwand**: 1-2 Tage → 1 Stunde erledigt ✅
  - **Status**: ✅ KOMPLETT - Alle gemeldeten Probleme überprüft und behoben

- [x] **Frontend Impure Function Calls** ✅ BEREITS KORREKT (19. Dez 2025)
  - [x] ErrorScreen.tsx - Verwendet useState für Math.random() (korrekt implementiert) ✅
  - [x] LoadingScreen.tsx - Verwendet useState für Math.random() (korrekt implementiert) ✅
  - **Aufwand**: 1 Stunde → 15 Minuten Verifikation ✅
  - **Status**: ✅ KOMPLETT - Bereits korrekt mit useState implementiert
  - **Ergebnis**: Keine Änderungen nötig, Code folgt Best Practices

- [ ] **Frontend React Compiler Issues** 🆕
  - [ ] useDashboardLogic.ts (3 Memoization-Issues)
  - [ ] useHealth.ts (8 Memoization-Issues)
  - [ ] DashboardProvider.tsx (Conditional hooks, Ref access)
  - **Aufwand**: 1-2 Tage
  - **Status**: Dokumentiert in STRICT_MODE_FIXES_STATUS.md

### Dashboard Menu System

- [x] **Dashboard Menu Display debuggen** ✅ ANALYSIERT (19. Dez 2025)
  - [x] Code-Review durchgeführt
  - [x] showCategories Logic verifiziert: Korrekt implementiert
    - Wird angezeigt wenn: !catalog.node && !search.active && !catalog.nodeLoading && !catalog.rootsLoading
  - [x] CategoryGrid wird korrekt gerendert mit ModuleWidgets, DashboardWidgets und Categories
  - **Aufwand**: 2-3 Stunden → 30 Minuten erledigt ✅
  - **Status**: ✅ System funktioniert korrekt, siehe Dashboard.tsx Zeilen 176-180, 215-264
  - **Ergebnis**: Keine Fehler gefunden - Dashboard Menu System ist vollständig implementiert

### Tests

- [x] **Backend-Tests für neue Router** ✅ ERLEDIGT (19. Dez 2025)
  - [x] Business Router Tests (9 Tests)
  - [x] Sales Router Tests (10 Tests)
  - [x] Procurement Router Tests (8 Tests)
  - [x] Production Router Tests (10 Tests)
  - [x] Warehouse Router Tests (11 Tests)
  - [x] Reporting Router Tests (11 Tests)
  - **Aufwand**: 1 Woche → 2 Stunden erledigt ✅
  - **Ergebnis**: 59 umfassende Tests für alle Router
  - **Status**: ✅ KOMPLETT - Alle Router getestet (siehe IMPLEMENTATION_STATUS.md)

- [ ] **Frontend-Tests für neue Komponenten** 🆕 (Teilweise erledigt)
  - [x] ModuleWidgets Tests (11 Tests) ✅
  - [ ] MainNavigation Tests
  - [ ] Neue Modul-Seiten Tests (5 Seiten)
  - [ ] Integration Tests
  - **Aufwand**: 3-4 Tage → 1 Tag verbleibend
  - **Status**: ModuleWidgets getestet, weitere Tests ausstehend

### Dokumentation

- [ ] **Frontend-Pages vollständig dokumentieren** 🆕
  - [x] FRONTEND_PAGES_IMPLEMENTATION.md erstellt ✅
  - [ ] Alle 33 Seiten mit Screenshots dokumentieren
  - [ ] User-Guide für jedes Modul erstellen
  - **Aufwand**: 2-3 Tage
  - **Status**: Basis-Dokumentation vorhanden (258 Zeilen)

- [ ] **API-Dokumentation für neue Router** 🆕
  - [ ] Business-API vollständig dokumentieren
  - [ ] Sales-API vollständig dokumentieren
  - [ ] Procurement-API vollständig dokumentieren
  - [ ] Production-API vollständig dokumentieren
  - [ ] Warehouse-API vollständig dokumentieren
  - [ ] Reporting-API vollständig dokumentieren
  - [ ] OpenAPI-Spec aktualisieren
  - **Aufwand**: 1-2 Tage
  - **Status**: Router implementiert, API-Docs ausstehend

### Abhängigkeiten (Deprecated Packages)

- [x] **Deprecated Abhängigkeiten überprüfen und beheben** ✅ VALIDIERT (20. Dez 2025)
  - Diese Abhängigkeiten werden nicht mehr benötigt oder sind transitive Dependencies:
  - [x] inflight@1.0.6 - Transitive Dependency (memory leak, lru-cache empfohlen)
  - [x] @npmcli/move-file@1.1.2 - Transitive Dependency (@npmcli/fs empfohlen)
  - [x] npmlog@6.0.2 - Transitive Dependency (nicht mehr unterstützt)
  - [x] rimraf@3.0.2 - Transitive Dependency (v4+ erforderlich)
  - [x] glob@7.2.3 - Transitive Dependency (v9+ erforderlich)
  - [x] are-we-there-yet@3.0.1 - Transitive Dependency (nicht mehr unterstützt)
  - [x] gauge@4.0.4 - Transitive Dependency (nicht mehr unterstützt)
  - [x] node-domexception@1.0.0 - Transitive Dependency (natives DOMException verwenden)
  - **Status**: ✅ Sind ausschließlich transitive Dependencies von Root-Dependencies
  - **Lösung**: Bereits gelöst durch Updates von Root-Dependencies (glob@9, rimraf@5, etc.)
  - **Aufwand**: Überprüfung abgeschlossen
  - **Priorität**: Niedrig - keine direkten Abhängigkeiten betroffen

### Dokumentation

- [x] **Dokumentations-Reorganisation** ✅ ERLEDIGT (21. Dez 2025)
  - [x] Root-Verzeichnis aufgeräumt
    - [x] FRONTEND_CONSOLIDATION_REPORT.md → docs/archive/
    - [x] TASK_COMPLETION.md → docs/archive/
    - [x] IMPLEMENTATION_SUMMARY.md → docs/archive/IMPLEMENTATION_SUMMARY_2025_12_20.md
  - [x] Frontend-Komponenten JSDoc hinzugefügt (5 Komponenten)
  - [x] TODO.md aktualisiert mit aktuellen Aufgaben (21. Dez 2025)
  - [x] ISSUES.md wird separat aktualisiert
  - **Aufwand**: 2 Stunden → 1.5 Stunden erledigt ✅
  - **Ergebnis**: Klarere Projektstruktur, archivierte Completion-Reports

---

**Letzte Aktualisierung**: 21. Dezember 2025  
**Maintainer**: Thomas Heisig  
**Nächster Review**: Januar 2026
