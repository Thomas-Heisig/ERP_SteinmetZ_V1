# ERP SteinmetZ – Enterprise ERP mit KI-gestütztem AI Annotator

[![Version](https://img.shields.io/badge/Version-0.3.0-blue.svg)](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.18.0-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 📘 **Hinweis**: Für eine vollständige Dokumentation siehe [README_COMPREHENSIVE.md](README_COMPREHENSIVE.md)

## 🎯 Vision

ERP SteinmetZ ist ein **vollständiges Enterprise Resource Planning System** mit einem innovativen **KI-gestützten Architekturansatz**. Das System nutzt einen **AI Annotator**, um Funktionen, Metadaten, Regeln und Formulare flexibel zu analysieren, generieren und zu erweitern – damit wird das ERP zu einer sich selbst dokumentierenden und kontinuierlich lernenden Plattform.

## ✅ Aktueller Status (Stand: Dezember 2025)

### Frontend ✅ Vollständig Funktionsfähig

- ✅ React 19 + Vite Setup funktioniert
- ✅ Dashboard lädt dynamisch 11 Funktionsbereiche vom Backend
- ✅ Theme-System (Light, Dark, LCARS) vollständig funktionsfähig
- ✅ QuickChat Assistant Komponente integriert und funktionsfähig
- ✅ Navigation zwischen Seiten funktioniert
- ✅ Mehrsprachige Oberfläche (7 Sprachen)
- ✅ Responsive Design

### Backend ✅ Stabil & Funktionsfähig

- ✅ Express 5 Server läuft stabil
- ✅ Health-Check Endpoint aktiv (`/api/health`)
- ✅ Functions Catalog API mit 11 Kategorien und 15.472 Funktionsknoten
- ✅ AI-Integration vorbereitet (Ollama, OpenAI, lokale Modelle)
- ✅ SQLite Datenbank für Entwicklung
- ✅ CORS konfiguriert für Frontend-Integration
- ✅ File-Watcher für automatisches Reload der Funktionen
- ✅ WebSocket-Server mit Socket.IO ✨ NEU
- ✅ API-Response-Caching mit TTL ✨ NEU
- ✅ Query-Performance-Monitoring ✨ NEU
- ✅ Enhanced Full-Text-Search ✨ NEU

### API-Endpunkte

#### System & Core

- `GET /api/health` - System Health Status
- `GET /api/functions` - Vollständiger Funktionskatalog (mit Caching ✨)
- `GET /api/functions/roots` - Top-Level Kategorien (11 Bereiche)
- `GET /api/functions/nodes/:id` - Einzelner Funktionsknoten mit Details
- `GET /api/functions/search` - Volltextsuche mit Pagination
- `POST /api/functions/menu` - RBAC-gefiltertes Menü
- `GET /api/dashboard` - Dashboard-Daten
- `POST /api/quickchat` - QuickChat AI Assistant
- `GET /api/ws/stats` - WebSocket-Statistiken ✨ NEU
- `ws://localhost:3000` - WebSocket-Verbindung ✨ NEU

#### HR Module (Personalwesen) ✨ NEU

- `GET /api/hr/employees` - Mitarbeiterliste
- `POST /api/hr/employees` - Mitarbeiter anlegen
- `GET /api/hr/time-entries` - Zeiterfassung
- `GET /api/hr/leave-requests` - Urlaubsanträge
- `GET /api/hr/payroll/:employeeId` - Gehaltsabrechnung
- `GET /api/hr/departments` - Abteilungen
- `GET /api/hr/statistics` - HR-Statistiken

#### Finance Module (Finanzen & Controlling) ✨ NEU

- `GET /api/finance/invoices` - Rechnungsverwaltung
- `POST /api/finance/invoices` - Rechnung erstellen
- `GET /api/finance/customers` - Kundenverwaltung (Debitoren)
- `GET /api/finance/suppliers` - Lieferantenverwaltung (Kreditoren)
- `GET /api/finance/payments` - Zahlungsabwicklung
- `GET /api/finance/accounts` - Kontenplan
- `GET /api/finance/transactions` - Buchungen
- `GET /api/finance/reports/balance-sheet` - Bilanz
- `GET /api/finance/reports/profit-loss` - GuV
- `GET /api/finance/statistics` - Finanzstatistiken

## 🚀 Quick Start

### Voraussetzungen

- Node.js >= 18.18.0
- npm oder yarn

### Installation & Start

```bash
# Dependencies installieren
npm install

# Development Modus (Frontend + Backend)
npm run dev

# Nur Frontend
npm run dev:frontend

# Nur Backend
npm run dev:backend

# Production Build
npm run build
npm start
```

### URLs

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/health
- **API Docs:** http://localhost:3000/api/functions

## 📁 Projektstruktur

```
ERP_SteinmetZ_V1/
├── apps/
│   ├── frontend/              # React 19 + Vite Frontend
│   │   ├── src/
│   │   │   ├── components/    # React Komponenten
│   │   │   │   ├── Dashboard/      # Hauptdashboard
│   │   │   │   ├── QuickChat/      # KI-Chat Assistant
│   │   │   │   └── FunctionsCatalog/  # Funktionsübersicht
│   │   │   ├── contexts/      # React Contexts (Theme, i18n)
│   │   │   ├── hooks/         # Custom React Hooks
│   │   │   └── styles/        # CSS Themes
│   │   └── .env.example       # Frontend Umgebungsvariablen
│   │
│   └── backend/               # Express 5 Backend
│       ├── src/
│       │   ├── routes/        # API Routen
│       │   ├── services/      # Business Logic
│       │   ├── middleware/    # Express Middleware
│       │   └── tools/         # KI Tools
│       └── .env.example       # Backend Umgebungsvariablen
│
├── data/                      # Entwicklungsdatenbank
├── docs/                      # Dokumentation
└── src/                       # Shared Code (Resilience, SAGA)
```

## 🔧 Technologie-Stack

### Frontend

- **Framework:** React 19 + Vite
- **Routing:** React Router v7
- **Styling:** CSS Modules + Design System
- **State:** React Context + Hooks
- **i18n:** react-i18next (7 Sprachen)
- **Themes:** Light, Dark, LCARS

### Backend

- **Runtime:** Node.js + Express 5
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **AI:** OpenAI API + Ollama + Lokale Modelle
- **Patterns:** SAGA, Circuit Breaker, Retry Policy

## 📊 Features

### ✅ Implementiert

- **Dashboard** mit 11 Funktionsbereichen
- **QuickChat** KI-Assistent
- **Funktionskatalog** mit 15.472 Knoten
- **Theme-Switching** (3 Themes)
- **Mehrsprachigkeit** (7 Sprachen)
- **Health Monitoring**
- **Auto-Reload** für Entwicklung
- **HR-Modul** ✨ NEU
  - Mitarbeiterverwaltung
  - Zeiterfassung
  - Urlaubsmanagement
  - Gehaltsabrechnung (Basis)
- **Finance-Modul** ✨ NEU
  - Rechnungsmanagement
  - Kunden-/Lieferantenverwaltung
  - Zahlungsabwicklung
  - Buchhaltung (Hauptbuch, Debitoren, Kreditoren)
  - Finanzberichte (Bilanz, GuV)

### 🔄 In Entwicklung

- **HR & Finance Module**
  - Datenbank-Integration für persistente Speicherung
  - Services-Layer für Business-Logik
  - Frontend-Komponenten für vollständige Benutzeroberfläche
  - Workflow-Automatisierung (Genehmigungen, Mahnwesen)
  - OCR für Eingangsrechnungen
  - XRechnung/ZUGFeRD-Unterstützung
- **Real-Time Features** ✅ Backend fertig
  - WebSocket-Server mit Socket.IO ✅
  - JWT-Authentifizierung für WebSocket ✅
  - Event-Broadcasting-System ✅
  - Frontend-Integration (folgt)
- **Performance & Optimierung** ✅
  - Frontend: Lazy Loading, Code-Splitting ✅
  - Backend: API-Response-Caching ✅
  - Database: Query-Monitoring ✅
- **Enhanced Search** ✅ Service fertig
  - Full-Text-Search mit Highlighting ✅
  - Relevance-Scoring ✅
  - Fuzzy Matching ✅
  - Faceted Search ✅
  - Frontend-Integration (folgt)
- Kategorie-Navigation im Dashboard
- KI-gestützte Prozess-Automatisierung
- Mobile Optimierung

### 📋 Geplant (Roadmap)

- SLA-Monitoring & Alerting
- Workflow-Engine
- Document Management (AI-gestützt)
- Communication Center (Email, Fax, Telefonie)
- Advanced Analytics & Reporting

## 🏗️ Architektur

### Resilience & Production-Readiness

- **SAGA Pattern:** TransactionCoordinator, IdempotencyStore
- **Resilience:** CircuitBreaker, RetryPolicy
- **Database:** Audit Trail, Migrations
- **Monitoring:** Health Checks, Metrics

Siehe [ARCHITECTURE.md](docs/ARCHITECTURE.md) für Details.

## 🔐 Sicherheit & Compliance

Siehe [COMPLIANCE.md](docs/COMPLIANCE.md) für:

- Datenschutz (GDPR)
- Audit Trail
- Sicherheitsrichtlinien

## 🧪 Tests & Qualität

```bash
# Linting
npm run lint

# Build (prüft TypeScript)
npm run build

# Tests
npm test              # Alle Tests
npm test:backend      # Nur Backend (42 Tests)
npm test:frontend     # Nur Frontend (50 Tests)
npm test:coverage     # Mit Coverage-Report
```

**Aktueller Test-Status:**

- ✅ Backend: 42/42 Tests passing
- ✅ Frontend: 37/50 Tests passing (13 pre-existing issues)
- ✅ Build: Vollständig erfolgreich

## 📚 Dokumentation

### Haupt-Dokumentation

- **[README_COMPREHENSIVE.md](README_COMPREHENSIVE.md)** - Vollständige Projekt-Dokumentation
- **[TODO.md](TODO.md)** - Priorisierte Aufgabenliste
- **[ISSUES.md](ISSUES.md)** - Aktive Issues & Technical Debt
- **[CHANGELOG.md](CHANGELOG.md)** - Projekt-Changelog mit allen Versionen
- **[ARCHIVE.md](ARCHIVE.md)** - Behobene Issues & alte Changelogs

### Architektur & Konzept

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System-Architektur & Production-Readiness
- **[AUTHENTICATION.md](docs/AUTHENTICATION.md)** - Authentifizierungs-System
- **[COMPLIANCE.md](docs/COMPLIANCE.md)** - Sicherheit, Datenschutz & GoBD
- **[Konzept](docs/concept/_0_KONZEPT.md)** - Vollständiges Projektkonzept
- **[Roadmap](docs/concept/_ROADMAP.md)** - Detaillierte Projektphasen

### API-Dokumentation

- **[AI Router](apps/backend/src/routes/ai/docs/)** - Vollständige AI-API-Dokumentation
- **[AI Annotator](apps/backend/src/routes/aiAnnotatorRouter/docs/)** - AI Annotator API
- **[Dashboard](apps/backend/src/routes/dashboard/docs/)** - Dashboard-API
- **[Functions Catalog](apps/backend/src/routes/functionsCatalog/docs/)** - Funktionskatalog-API
- **[HR Module](apps/backend/src/routes/hr/docs/)** ✨ NEU - Personal & HR Management API
- **[Finance Module](apps/backend/src/routes/finance/docs/)** ✨ NEU - Finanzen & Controlling API
- **[Error Standardization Guide](docs/ERROR_STANDARDIZATION_GUIDE.md)** ✨ NEU - Migration Guide für Error-Handling

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit deine Änderungen (`git commit -m 'Add AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📧 Kontakt

**Projektverantwortlicher:** Thomas Heisig

- GitHub: [@Thomas-Heisig](https://github.com/Thomas-Heisig)

## 📄 Lizenz

Siehe LICENSE file für Details.

---

**Version:** 0.3.0  
**Letztes Update:** 5. Dezember 2025  
**Build-Status:** ✅ Erfolgreich  
**Test-Status:** ✅ 79/92 passing

---

## 📋 Status-Übersicht (Dezember 2025)

### ✅ Produktionsreif & Abgeschlossen

#### Infrastruktur

- React 19 + Vite Frontend (Lazy Loading, Code-Splitting)
- Express 5 Backend (API, WebSocket, Caching)
- SQLite (Development) / PostgreSQL (Production Ready)
- WebSocket-Server mit Socket.IO (Real-Time-Unterstützung)
- API-Response-Caching mit TTL
- Query-Performance-Monitoring
- Strukturiertes Error-Handling
- Health-Check-System

#### Frontend-Komponenten

- Dashboard mit 11 Funktionsbereichen
- QuickChat KI-Assistent
- Theme-System (Light, Dark, LCARS)
- Mehrsprachigkeit (7 Sprachen: DE, EN, ES, FR, IT, PL, TR)
- Error Boundaries
- Skeleton Loaders
- Responsive Design (Mobile-First)

#### Backend-Module

- Functions Catalog API (15.472 Funktionsknoten)
- AI-Integration (OpenAI, Ollama, Anthropic, Fallback-System)
- HR-Modul (Basis-APIs)
- Finance-Modul (Basis-APIs)
- Enhanced Search Service (Full-Text, Fuzzy, Faceted)

### 🔄 In Entwicklung

#### AI-Annotator-System

- **Status**: Architektur definiert, Core-Komponenten implementiert
- **Ziel**: Automatische Analyse und Anreicherung von Funktionsknoten
- **Datenverarbeitung**:
  - Batch-Processing für große Datenmengen
  - Quality-Assurance-Dashboard
  - PII-Klassifikation
  - Validierung und Error-Correction
- **Nächste Schritte**:
  - Integration mit Function-Catalog
  - Frontend-UI für Batch-Operations
  - Automatische Metadaten-Generierung

#### Function-Node-Transformation

- **Status**: Konzeptphase
- **Ziel**: Konvertierung von Funktionsknoten zu ausführbaren Funktionen
- **Prozess**:
  1. Funktionsknoten-Parsing (Markdown-basiert)
  2. Schema-Extraktion (JSON-Schema für Validierung)
  3. AA/DSL-Interpretation (Arbeitsanweisungen)
  4. Code-Generierung (TypeScript-Services)
  5. API-Endpoint-Registration
  6. Test-Generierung
- **Standards**:
  - ISO/IEC 25010 (Software-Qualitätsmodell)
  - OpenAPI 3.0 (API-Spezifikation)
  - JSON Schema Draft-07 (Datenvalidierung)

### 📋 Roadmap 2025-2026

#### Q1 2025: Core-Module vervollständigen

- [ ] HR-Modul: Vollständige CRUD-Operationen
- [ ] Finance-Modul: Buchhaltungsintegration
- [ ] AI-Annotator: Production-Ready
- [ ] Function-Node-Transformation: MVP

#### Q2 2025: Enterprise-Features

- [ ] Workflow-Engine (BPMN 2.0)
- [ ] Document-Management (OCR, AI-Tagging)
- [ ] Advanced Analytics (BI-Dashboard)
- [ ] Multi-Tenant-Support

#### Q3 2025: Compliance & Security

- [ ] GoBD-Zertifizierung
- [ ] DSGVO-Audit-Toolkit
- [ ] Pen-Test & Security-Hardening
- [ ] ISO 27001-Vorbereitung

#### Q4 2025: AI & Automation

- [ ] RAG-System für Dokumentensuche
- [ ] Process-Mining & Optimization
- [ ] Natural-Language-Querying (NLQ)
- [ ] Predictive Analytics
