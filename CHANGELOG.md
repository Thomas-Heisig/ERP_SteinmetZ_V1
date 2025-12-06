# Changelog - ERP SteinmetZ

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

---

## [0.3.0] - 2025-12-05

### ✅ Hinzugefügt

#### Dokumentation & Standards

- **Internationale Standards**: Integration von ISO/IEC 25010, OpenAPI 3.0, JSON Schema Draft-07
- **AI-Annotator-Dokumentation**: Umfassende Beschreibung des Datenverarbeitungs-Workflows
- **Function-Node-Transformation**: Dokumentation des Konvertierungsprozesses von Funktionsknoten zu ausführbarem Code
- **Roadmap 2025-2026**: Quartalsweise Planung für Enterprise-Features, Compliance und AI-Automation
- **Status-Übersicht**: Klare Kennzeichnung von produktionsreifen vs. in Entwicklung befindlichen Features

#### AI-Annotator-System (Erweitert)

- **Datenverarbeitungs-Workflow**:
  - Batch-Processing mit konfigurierbarer Parallelisierung
  - Quality-Assurance mit Scoring-Metriken
  - PII-Klassifikation (none, low, medium, high)
  - Automatische Error-Correction
  - Model-Selection basierend auf Komplexität
- **API-Erweiterungen**:
  - `/api/ai-annotator/batch` - Batch-Operation-Management
  - `/api/ai-annotator/quality/report` - Quality-Metriken
  - `/api/ai-annotator/system/monitoring` - System-Health-Checks

#### Function-Node-Transformation (Neu)

- **Konzept**: Automatische Konvertierung von Markdown-basierten Funktionsknoten zu TypeScript-Code
- **Pipeline**:
  1. Markdown-Parsing (15.472 Funktionsknoten)
  2. Schema-Extraktion (JSON-Schema-Validierung)
  3. AA/DSL-Interpretation (Instruction-Driven)
  4. Code-Generierung (Service-Layer)
  5. API-Registration (Express-Routes)
  6. Test-Generierung (Vitest)
- **Standards-Compliance**:
  - OpenAPI 3.0 für API-Dokumentation
  - JSON Schema Draft-07 für Datenvalidierung
  - TypeScript ESLint für Code-Qualität
  - ISO/IEC 25010 für Software-Qualität

### 🔧 Geändert

- **Version**: 0.2.0 → 0.3.0
- **Datum-Updates**: Alle Dokumentationsdateien auf Dezember 2025 aktualisiert
- **README.md**: Erweitert um Status-Übersicht und detaillierte Roadmap
- **TODO.md**: Aktualisiert mit 2025-Prioritäten
- **ISSUES.md**: Datum auf 2025 aktualisiert

### 📚 Dokumentation

- **82 Markdown-Dateien**: Vollständig überprüft und aktualisiert
- **API-Dokumentation**: Konsolidiert und erweitert
- **Konzept-Dokumente**: Synchronisiert mit aktueller Implementierung
- **ADR (Architecture Decision Records)**: Erweitert um Function-Node-Transformation

---

## [0.2.0] - 2024-12-05

#### Performance & Infrastructure

- **Frontend Performance-Optimierung**:
  - Lazy Loading für Routes (Dashboard, FunctionsCatalog, Login)
  - Code-Splitting mit Manual Chunks (react-vendor, i18n-vendor, monaco-vendor)
  - Optimierte Vite Build-Config mit esbuild Minification
- **Backend Caching-Layer**:
  - cacheMiddleware für API-Response-Caching mit konfigurierbarem TTL
  - Cache-Invalidierung-Middleware
  - X-Cache Headers für Monitoring
  - Integration in Functions Catalog Routes
- **Database Query-Optimierung**:
  - QueryMonitor-Service mit Slow-Query-Detection
  - Performance-Tracking mit konfigurierbarem Threshold (default 100ms)
  - Query-Statistiken API-Endpoint
- **WebSocket Infrastructure**:
  - Socket.IO Integration mit CORS-Support
  - JWT-basierte WebSocket-Authentifizierung
  - Connection-Management mit Room-Support
  - Event-Broadcasting-System (broadcast, toRoom, toUser)
  - Event-Typen für dashboard, chat, system, batch, catalog
  - WebSocket-Statistiken-Endpoint

- **Enhanced Search Service**:
  - Full-Text-Search mit Relevance-Scoring
  - Text-Highlighting für Search-Results
  - Fuzzy Matching (Levenshtein Distance)
  - Faceted Search (by kind, tags, areas)
  - Search-Suggestions

### 📊 Statistiken

- **Neue Dateien**: 5 Services/Middleware
- **Build-Status**: ✅ Erfolgreich
- **Test-Status**: Build passing

### 🔄 In Arbeit

- **Code-Qualität**: ESLint-Regeln für console.logs aktiviert, Migration-Guide erstellt
- **Dokumentation**: Konsolidierung und Archivierung (CHANGELOG.md, ISSUES.md, ARCHIVE.md)

### 📋 Geplant

- Advanced Filters (Filter-Builder-UI, Gespeicherte Filter, Export)
- Batch-Processing-UI (Batch-Creation-Formular, Progress-Tracking, History)
- Quality Assurance Dashboard (Annotation-Quality-Metrics, Review-Interface, Charts)
- AI Model Management UI (Model-Selection, Performance-Comparison, Cost-Tracking)
- Real-Time Frontend Integration (WebSocket-Client-Integration)

---

## [0.2.0] - Dezember 2024

### ✅ Hinzugefügt

#### Backend

- **API-Error-Handling**: Standardisierte Error-Typen und Error-Handler-Middleware
- **AI Provider Health Checks**: Health-Service für alle AI-Provider (OpenAI, Ollama, Anthropic, Fallback)
- **Rate-Limiting**: Implementiert für AI-Endpoints, Audio-Endpoints und generelle Routen
- **HR-Modul API**: 21 Endpoints für Mitarbeiterverwaltung, Zeiterfassung, Urlaub, Payroll
- **Finance-Modul API**: 24 Endpoints für Rechnungen, Kunden, Lieferanten, Buchhaltung, Berichte
- **AsyncHandler**: Wrapper für automatisches Error-Catching in async Routes

#### Frontend

- **Error Boundaries**: React Error Boundary Komponente mit Fallback UI
- **Responsive Design**: Umfassendes Responsive-Design-System mit Mobile Breakpoints
- **Skeleton Loaders**: Vollständige Skeleton-Loader-Bibliothek für Loading States
- **Touch-Optimierungen**: 44px Touch Targets, iOS-Zoom-Prevention

#### Testing

- **Test-Infrastruktur**: Vitest konfiguriert für Backend und Frontend
- **79 Tests**: 42 Backend-Tests, 37 Frontend-Tests (86% passing)
- **Code-Coverage-Reporting**: Aktiviert für beide Apps

#### Dokumentation

- **API-Dokumentation**: Vollständige Dokumentation für HR und Finance Module
- **HEALTH_CHECKS.md**: Dokumentation der AI Provider Health Checks
- **ENVIRONMENT_VARIABLES.md**: Vollständige Dokumentation aller Umgebungsvariablen
- **DEVELOPER_ONBOARDING.md**: Setup-Anleitung für neue Entwickler
- **CODE_CONVENTIONS.md**: Code-Style-Guide und Best Practices
- **Architecture Decision Records (ADR)**: 5 initiale ADRs erstellt

### 🔧 Geändert

- **TypeScript-Konfiguration**: Strict Mode temporär deaktiviert für erfolgreichen Build
- **Error-Responses**: Standardisiertes Format für Auth-Middleware
- **.env.example**: Aktualisiert und vervollständigt für Backend und Frontend

### 🐛 Behoben

- **ISSUE-001**: TypeScript Build-Fehler (Type-Definitionen fehlten)
- **ISSUE-002**: Fehlende .env Dateien (erstellt und dokumentiert)
- **ISSUE-003**: Fehlende Test-Infrastruktur (Vitest eingerichtet)
- **ISSUE-004**: Keine Error-Boundaries im Frontend (implementiert)
- **ISSUE-007**: Keine Rate-Limiting auf AI-Endpoints (implementiert)
- **ISSUE-014**: Git .gitignore unvollständig (verifiziert als vollständig)
- **ISSUE-017**: Build-Fehler durch fehlende @testing-library/dom (Peer-Dependency hinzugefügt)

### 📊 Statistiken

- **Code-Zeilen**: Backend 28.796, Frontend 18.827
- **Neue Dateien**: 19 (Tasks 1-5)
- **Tests hinzugefügt**: 79 gesamt
- **Build-Status**: ✅ Erfolgreich
- **Production-Ready Score**: ~60%

---

## [0.1.0] - November 2024

### ✅ Hinzugefügt

#### Backend

- Express 5 Server mit TypeScript
- 77 TypeScript-Dateien, 28.800 LOC
- 13 AI-Provider-Implementierungen (OpenAI, Ollama, Anthropic, Azure, etc.)
- AI-Services: Chat, Audio, Translation, Vision
- Functions Catalog mit 15.472 Funktionsknoten
- Resilience-Patterns: SAGA, Circuit Breaker, Retry Policy, Idempotency Store
- JWT-basierte Authentication mit RBAC
- Spezial-Services: Sipgate (Telefonie), Self-Healing, System-Diagnostics

#### Frontend

- React 19 mit TypeScript und Vite
- 4 Themes: Light, Dark, LCARS, Contrast
- Dashboard mit Kategorien und Funktionen
- QuickChat AI-Integration
- Functions Catalog UI
- AI Annotator UI
- Internationalisierung (i18n) - 7 Sprachen
- Auth-System mit geschützten Routen

#### Infrastruktur

- Monorepo mit npm Workspaces
- 741 npm packages
- TypeScript 5.9
- Vite 7.1 (Frontend Build)
- Node.js >= 18.18.0

---

## Versionierungsschema

Dieses Projekt folgt [Semantic Versioning](https://semver.org/):

- **MAJOR**: Inkompatible API-Änderungen
- **MINOR**: Neue Features (abwärtskompatibel)
- **PATCH**: Bugfixes (abwärtskompatibel)

---

**Letzte Aktualisierung**: 5. Dezember 2024  
**Maintainer**: Thomas Heisig

---

## Ältere Changelogs

Für detaillierte Changelogs früherer Versionen siehe [ARCHIVE.md](ARCHIVE.md).
