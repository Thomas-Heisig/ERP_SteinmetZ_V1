# ERP SteinmetZ – Enterprise ERP mit KI-gestütztem AI Annotator

[![Version](https://img.shields.io/badge/Version-0.3.0-blue.svg)](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.18.0-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[![Tests](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/workflows/Tests/badge.svg)](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/actions)
[![Build](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/workflows/Build/badge.svg)](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/actions)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Thomas-Heisig_ERP_SteinmetZ_V1&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Thomas-Heisig_ERP_SteinmetZ_V1)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Thomas-Heisig_ERP_SteinmetZ_V1&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Thomas-Heisig_ERP_SteinmetZ_V1)

> 📘 **Dokumentation**: Vollständige technische Referenz im [Documentation Hub](docs/README.md)

## 🎯 Projektvision

ERP SteinmetZ ist ein **vollständiges Enterprise Resource Planning System** mit einem innovativen **KI-gestützten Architekturansatz**. Das System nutzt einen **AI Annotator**, um Funktionen, Metadaten, Regeln und Formulare flexibel zu analysieren, generieren und zu erweitern – damit wird das ERP zu einer sich selbst dokumentierenden und kontinuierlich lernenden Plattform.

### Kernphilosophie

- **Instruction-driven ERP**: Fachprozesse als Arbeitsanweisungen (AA/DSL) und JSON-Schemas beschrieben
- **KI als Moderator**: AI orchestriert Eingaben und ruft deterministische Services auf
- **Flexible Architektur**: Dynamische Navigation und Dashboards aus Modul-Manifesten
- **Deterministische Basis**: Kernzahlen werden ausschließlich deterministisch berechnet
- **RAG für Wissensmanagement**: Retrieval Augmented Generation nur für Text-/Webquellen

## ✅ Aktueller Status (Stand: 7. Dezember 2025)

### Frontend ✅ Vollständig Funktionsfähig

- ✅ **React 19 + Vite**: Modernes Build-System mit optimiertem Code-Splitting
- ✅ **Dashboard**: Dynamisches Laden von 11 Funktionsbereichen vom Backend
- ✅ **Theme-System**: 4 Themes (Light, Dark, LCARS, High Contrast)
- ✅ **Routing**: Zentrale Route-Konfiguration mit React Router v7
- ✅ **QuickChat Assistant**: KI-gestützte Chat-Komponente integriert
- ✅ **AI Annotator UI**: Batch-Processing und Quality-Dashboard
- ✅ **Internationalisierung**: 7 Sprachen mit i18next
- ✅ **Responsive Design**: Mobile-optimiert mit Touch-Interaktionen
- ✅ **Error Handling**: Error Boundaries mit Fallback-UI

### Backend ✅ Production-Ready

- ✅ **Express 5**: TypeScript-basierter API-Server
- ✅ **Functions Catalog**: 15.472 Funktionsknoten in 11 Kategorien
- ✅ **AI-Integration**: 13 Provider (OpenAI, Ollama, Anthropic, Azure, Vertex AI, etc.)
- ✅ **AI Annotator**: Automatische Metadaten-, Regel- und Formular-Generierung
- ✅ **Datenbank**: SQLite (Dev) / PostgreSQL (Production)
- ✅ **WebSocket**: Socket.IO für Real-Time Updates
- ✅ **Caching**: API-Response-Caching mit TTL
- ✅ **Monitoring**: Query-Performance-Monitoring und Health-Checks
- ✅ **Resilience**: Circuit Breaker, Retry Policy, SAGA Pattern

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

### Frontend Routes ✨ NEU

Alle Features sind über zentralisierte Routes erreichbar:

- `/` - Dashboard (Hauptansicht)
- `/catalog` - Funktionskatalog
- `/ai` - AI Annotator
- `/hr` - Personalwesen
- `/finance` - Finanzen & Controlling
- `/crm` - Customer Relationship Management
- `/inventory` - Lagerverwaltung
- `/projects` - Projektverwaltung
- `/innovation` - Innovationsmanagement
- `/calendar` - Kalender
- `/communication` - Kommunikationszentrum
- `/settings` - Einstellungen

## 📁 Projektstruktur

```
ERP_SteinmetZ_V1/
├── apps/
│   ├── frontend/              # React 19 + Vite Frontend
│   │   ├── src/
│   │   │   ├── components/    # React Komponenten
│   │   │   │   ├── ui/             # Basis UI-Komponenten ✨ NEU
│   │   │   │   ├── Dashboard/      # Hauptdashboard
│   │   │   │   ├── QuickChat/      # KI-Chat Assistant
│   │   │   │   ├── aiAnnotatorRouter/  # AI Annotator ✨ NEU
│   │   │   │   └── FunctionsCatalog/  # Funktionsübersicht
│   │   │   ├── features/      # Feature-Module (HR, Finance, etc.) ✨ NEU
│   │   │   ├── contexts/      # React Contexts (Theme, Auth)
│   │   │   ├── hooks/         # Custom React Hooks
│   │   │   ├── pages/         # Top-Level Pages
│   │   │   ├── styles/        # Styling System ✨ NEU
│   │   │   │   ├── theme/          # Theme-Variablen
│   │   │   │   ├── components.css  # Wiederverwendbare Styles
│   │   │   │   └── *.css           # Theme-Dateien
│   │   │   └── routes.tsx     # Zentrale Route-Konfiguration ✨ NEU
│   │   ├── THEME_SYSTEM.md    # Theme-Dokumentation ✨ NEU
│   │   ├── FRONTEND_STRUCTURE.md  # Architektur-Dokumentation ✨ NEU
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

> 📖 Siehe auch: [Frontend-Architektur](apps/frontend/FRONTEND_STRUCTURE.md) | [Theme-System](apps/frontend/THEME_SYSTEM.md)

## 🔧 Technologie-Stack

### Frontend

- **Framework:** React 19 + Vite
- **Routing:** React Router v7 (zentralisiert in routes.tsx) ✨ NEU
- **Styling:** CSS-Variablen + Theme-System ✨ NEU
- **State:** React Context + Hooks
- **i18n:** react-i18next (7 Sprachen)
- **Themes:** Light, Dark, LCARS, High Contrast ✨ NEU
- **TypeScript:** Vollständig typisiert
- **Testing:** Vitest + React Testing Library

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
- **Standardisiertes Error-Handling** ✨ NEU
  - APIError-Klassen für konsistente Fehlerbehandlung
  - Zod-Validierung für Request-Parameter
  - Vollständig implementiert in HR, Finance und QuickChat
- **HR-Modul** ✨ NEU
  - Mitarbeiterverwaltung (14 Endpoints)
  - Zeiterfassung
  - Urlaubsmanagement
  - Gehaltsabrechnung (Basis)
  - Vollständige Input-Validierung und Error-Handling
- **Finance-Modul** ✨ NEU
  - Rechnungsmanagement (19 Endpoints)
  - Kunden-/Lieferantenverwaltung
  - Zahlungsabwicklung
  - Buchhaltung (Hauptbuch, Debitoren, Kreditoren)
  - Finanzberichte (Bilanz, GuV)
  - Vollständige Input-Validierung und Error-Handling

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
npm test:coverage     # Mit Coverage-Report (LCOV, HTML, JSON)
```

**Aktueller Test-Status:**

- ✅ Backend: 42/42 Tests passing (100%)
- ✅ Frontend: 37/50 Tests passing (74%, 13 pre-existing issues unrelated to recent changes)
- ✅ Build: Vollständig erfolgreich
- ✅ Code Coverage: Backend 86% (Ziel: 90%)

**Code-Qualität & Coverage:**

- ✅ **SonarQube Integration** - Kontinuierliche Code-Qualitätsüberwachung
- ✅ **Coverage Reports** - LCOV, HTML, JSON Formate
- ✅ **Quality Gates** - Automatische Qualitätsprüfung in CI/CD
- ✅ **Security Scanning** - CodeQL + SonarQube Sicherheitsanalyse

Siehe [SonarQube Guide](docs/SONARQUBE.md) und [CI/CD Setup](CI_CD_SETUP.md) für Details.

## 📚 Dokumentation

### 🚀 Schnellstart

- **[Getting Started Tutorial](docs/tutorials/getting-started.md)** - 5-Minuten-Setup für neue Entwickler
- **[Documentation Hub](docs/README.md)** - Zentraler Dokumentations-Index mit allen Guides
- **[COPILOT_RULESET.md](COPILOT_RULESET.md)** - Entwicklungsrichtlinien für Copilot
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution Guidelines
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community Standards
- **[SECURITY.md](SECURITY.md)** - Security Policy
- **[SUPPORT.md](SUPPORT.md)** - Getting Help & FAQ

### 📖 Dokumentations-Hub

- **[Documentation Hub](docs/README.md)** ⭐ NEU - Zentraler Dokumentations-Index
  - Folgt **Diátaxis Framework** und **ISO/IEC/IEEE 26514** Standards
  - 📚 **Tutorials** - Schritt-für-Schritt Anleitungen
  - 🔧 **How-To Guides** - Lösungen für spezifische Probleme
  - 📖 **Reference** - Technische Referenz-Dokumentation
  - 💡 **Explanation** - Konzeptionelle Erklärungen

### Haupt-Dokumentation

- **[TODO.md](TODO.md)** - Priorisierte Aufgabenliste
- **[ISSUES.md](ISSUES.md)** - Aktive Issues & Technical Debt
- **[CHANGELOG.md](CHANGELOG.md)** - Projekt-Changelog mit allen Versionen
- **[ARCHIVE.md](ARCHIVE.md)** - Behobene Issues & alte Changelogs

### Architektur & Konzept

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System-Architektur & Production-Readiness
- **[Architecture Decision Records](docs/adr/README.md)** - Architektur-Entscheidungen
- **[AUTHENTICATION.md](docs/AUTHENTICATION.md)** - Authentifizierungs-System
- **[COMPLIANCE.md](docs/COMPLIANCE.md)** - Sicherheit, Datenschutz & GoBD
- **[Konzept](docs/concept/_0_KONZEPT.md)** - Vollständiges Projektkonzept
- **[Roadmap](docs/concept/_ROADMAP.md)** - Detaillierte Projektphasen

### Entwickler-Dokumentation

- **[Copilot Ruleset](COPILOT_RULESET.md)** - Entwicklungsrichtlinien & Arbeitsweise
- **[Developer Onboarding](docs/DEVELOPER_ONBOARDING.md)** - Komplette Setup-Anleitung
- **[Code Conventions](docs/CODE_CONVENTIONS.md)** - Coding Standards & Best Practices
- **[Error Standardization Guide](docs/ERROR_STANDARDIZATION_GUIDE.md)** - Error-Handling Guide
- **[Environment Variables](docs/ENVIRONMENT_VARIABLES.md)** - Konfigurationsreferenz
- **[Database Migrations](docs/DATABASE_MIGRATIONS.md)** - Datenbank-Migrationen

### API-Dokumentation

- **[API Documentation Hub](docs/api/README.md)** - Vollständige API-Referenz
- **[AI Router](apps/backend/src/routes/ai/docs/)** - AI-API-Dokumentation
- **[AI Annotator](apps/backend/src/routes/aiAnnotatorRouter/docs/)** - AI Annotator API
- **[Dashboard](apps/backend/src/routes/dashboard/docs/)** - Dashboard-API
- **[Functions Catalog](apps/backend/src/routes/functionsCatalog/docs/)** - Funktionskatalog-API
- **[HR Module](apps/backend/src/routes/hr/docs/)** - Personal & HR Management API
- **[Finance Module](apps/backend/src/routes/finance/docs/)** - Finanzen & Controlling API

### Erweiterte Themen

- **[AI Annotator Workflow](docs/AI_ANNOTATOR_WORKFLOW.md)** - KI-gestützte Annotation
- **[Function Node Transformation](docs/FUNCTION_NODE_TRANSFORMATION.md)** - Code-Generierung
- **[Performance Features](docs/PERFORMANCE_FEATURES.md)** - Optimierung & Caching
- **[Advanced Features](docs/ADVANCED_FEATURES.md)** - Fortgeschrittene Features

## 🤝 Beitragen

Dieses Projekt folgt dem [Copilot Ruleset](COPILOT_RULESET.md) für konsistente Entwicklung:

- **Aufgabenbearbeitung**: Arbeite [TODO.md](TODO.md) und [ISSUES.md](ISSUES.md) systematisch ab
- **Dokumentation**: Halte Docs aktuell und strukturiert (Diátaxis Framework)
- **Code-Qualität**: Clean Code, SOLID-Prinzipien, TypeScript mit expliziten Typen
- **Testing**: Mindest-Coverage 80%, alle Tests müssen bestehen
- **Standards**: OpenAPI 3.0, Semantic Versioning, Conventional Commits

### Contribution-Workflow

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit deine Änderungen (`git commit -m 'feat(scope): Add AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

Siehe [CONTRIBUTING.md](CONTRIBUTING.md) für detaillierte Guidelines.

## 📧 Kontakt

**Projektverantwortlicher:** Thomas Heisig

- GitHub: [@Thomas-Heisig](https://github.com/Thomas-Heisig)

## 📄 Lizenz

Siehe LICENSE file für Details.

---

**Version:** 0.3.0  
**Letztes Update:** 7. Dezember 2025  
**Build-Status:** ✅ Erfolgreich  
**Test-Status:** ✅ 79/92 passing (Backend: 42/42, Frontend: 37/50)

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
