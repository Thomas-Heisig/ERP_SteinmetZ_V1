# ERP SteinmetZ – Enterprise ERP mit KI-gestütztem AI Annotator

[![Version](https://img.shields.io/badge/Version-0.3.0-blue.svg)](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.18.0-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[![Tests](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/workflows/Tests/badge.svg)](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/actions)
[![Build](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/workflows/Build/badge.svg)](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/actions)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Thomas-Heisig_ERP_SteinmetZ_V1&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Thomas-Heisig_ERP_SteinmetZ_V1)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Thomas-Heisig_ERP_SteinmetZ_V1&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Thomas-Heisig_ERP_SteinmetZ_V1)

> 📘 **Dokumentation**: Vollständige technische Referenz im [Documentation Hub](docs/README.md)

## 📑 Inhaltsverzeichnis

- [🎯 Projektvision](#-projektvision)
- [✅ Aktueller Status](#-aktueller-status-stand-20-dezember-2025)
- [🚀 Quick Start](#-quick-start)
- [📁 Projektstruktur](#-projektstruktur)
- [🔧 Technologie-Stack](#-technologie-stack)
- [📊 Features](#-features)
- [🏗️ Architektur](#️-architektur)
- [🔐 Sicherheit & Compliance](#-sicherheit--compliance)
- [🧪 Tests & Qualität](#-tests--qualität)
- [📚 Dokumentation](#-dokumentation)
- [🤝 Beitragen](#-beitragen)
- [📧 Kontakt](#-kontakt)
- [📄 Lizenz](#-lizenz)

## 🎯 Projektvision

ERP SteinmetZ ist ein **modernes Enterprise Resource Planning System** mit einem innovativen **KI-gestützten Architekturansatz**. Das System nutzt einen **AI Annotator**, um Funktionen, Metadaten, Regeln und Formulare flexibel zu analysieren, generieren und zu erweitern – damit wird das ERP zu einer sich selbst dokumentierenden und kontinuierlich lernenden Plattform.

### 🌟 Hauptmerkmale

- **🤖 KI-Integration**: 13 AI-Provider (OpenAI, Ollama, Anthropic, Azure, Vertex AI, etc.)
- **📊 15.472 Funktionsknoten**: Vollständiger Katalog in 11 Geschäftsbereichen
- **🎨 Modern UI**: React 19 mit 4 Themes (Light, Dark, LCARS, High Contrast)
- **🌍 Mehrsprachig**: 7 Sprachen (DE, EN, ES, FR, IT, PL, TR)
- **🔄 Real-Time**: WebSocket-Integration für Live-Updates
- **🏗️ Production-Ready**: Express 5 Backend mit TypeScript
- **📱 Responsive**: Mobile-optimiert mit Touch-Interaktionen
- **🔐 Sicher**: RBAC, GDPR-konform, Audit Trail

### Kernphilosophie

- **Instruction-driven ERP**: Fachprozesse als Arbeitsanweisungen (AA/DSL) und JSON-Schemas beschrieben
- **KI als Moderator**: AI orchestriert Eingaben und ruft deterministische Services auf
- **Flexible Architektur**: Dynamische Navigation und Dashboards aus Modul-Manifesten
- **Deterministische Basis**: Kernzahlen werden ausschließlich deterministisch berechnet
- **RAG für Wissensmanagement**: Retrieval Augmented Generation nur für Text-/Webquellen

## ✅ Aktueller Status (Stand: 20. Dezember 2025)

> 📊 **System-Übersicht**: [Detaillierter System-Status](docs/SYSTEM_STATUS.md) mit Performance-Metriken, Operational-Readiness und bekannten Einschränkungen

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

#### Document Management System (DMS) ✨ NEU

- `GET /api/documents` - Alle Dokumente
- `POST /api/documents/upload` - Dokument hochladen
- `GET /api/documents/:id` - Einzelnes Dokument
- `POST /api/documents/:id/versions` - Neue Version
- `GET /api/documents/search` - Volltextsuche
- `POST /api/documents/:id/ocr` - OCR-Verarbeitung
- `POST /api/documents/:id/ai-tags` - AI-Tag-Generierung
- `POST /api/documents/:id/workflows` - Workflow starten
- `POST /api/documents/:id/sign` - E-Signature anfordern
- `GET /api/documents/retention-policies` - Aufbewahrungsrichtlinien
- `GET /api/documents/statistics` - DMS-Statistiken

#### CRM Module (Customer Relationship Management) ✨ NEU

- `GET /api/crm/customers` - Kundenverwaltung
- `POST /api/crm/customers` - Neuer Kunde
- `GET /api/crm/contacts` - Kontaktverwaltung
- `GET /api/crm/opportunities` - Verkaufschancen
- `GET /api/crm/activities` - Aktivitäten & Interaktionen
- `GET /api/crm/statistics` - CRM-Statistiken

#### Sales Module (Vertrieb) ✨ NEU

- `GET /api/sales/quotes` - Angebotsverwaltung
- `POST /api/sales/quotes/:id/convert` - Angebot zu Auftrag
- `GET /api/sales/orders` - Auftragsverwaltung
- `GET /api/sales/products` - Produktkatalog
- `GET /api/sales/analytics` - Vertriebsanalyse

#### Marketing Module ✨ NEU

- `GET /api/marketing/campaigns` - Kampagnenverwaltung
- `GET /api/marketing/forms` - Marketing-Formulare
- `GET /api/marketing/landing-pages` - Landing Pages
- `GET /api/marketing/leads` - Lead-Management
- `GET /api/marketing/analytics/overview` - Marketing-Analytics

#### Inventory Module (Lagerverwaltung) ✨ NEU

- `GET /api/inventory/items` - Artikelverwaltung
- `POST /api/inventory/movements` - Lagerbewegungen
- `GET /api/inventory/low-stock` - Niedrigbestand-Alarm
- `GET /api/inventory/statistics` - Lagerstatistiken

#### Projects Module (Projektverwaltung) ✨ NEU

- `GET /api/projects` - Projektverwaltung
- `GET /api/projects/:id/tasks` - Aufgabenverwaltung
- `POST /api/projects/time-entries` - Zeiterfassung
- `GET /api/projects/:id/analytics` - Projektanalyse

#### Procurement Module (Beschaffung) ✨ NEU

- `GET /api/procurement/purchase-orders` - Bestellwesen
- `GET /api/procurement/suppliers` - Lieferantenverwaltung
- `GET /api/procurement/requisitions` - Bestellanforderungen

#### Production Module (Produktion) ✨ NEU

- `GET /api/production/work-orders` - Fertigungsaufträge
- `GET /api/production/bom` - Stücklisten (BOM)
- `GET /api/production/schedule` - Produktionsplanung

#### Warehouse Module (Lagerhaltung) ✨ NEU

- `GET /api/warehouse/locations` - Lagerplätze
- `GET /api/warehouse/receipts` - Wareneingang
- `GET /api/warehouse/shipments` - Warenausgang

#### Communication Module ✨ NEU

- `POST /api/communication/emails/send` - E-Mail versenden
- `GET /api/communication/messages` - Interne Nachrichten
- `GET /api/communication/notifications` - Benachrichtigungen

#### Monitoring & Analytics ✨ NEU

- `GET /api/monitoring/health` - System-Gesundheit
- `GET /api/metrics/kpis` - Kennzahlen (KPIs)
- `GET /api/reporting/reports` - Berichtswesen
- `GET /api/search-analytics/statistics` - Suchanalyse

## 🚀 Quick Start

### Voraussetzungen

- **Node.js** >= 18.18.0
- **npm** oder yarn
- **Git** für Repository-Kloning

### 🔧 Installation & Start (5 Minuten)

```bash
# 1. Repository klonen
git clone https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1.git
cd ERP_SteinmetZ_V1

# 2. Dependencies installieren
npm install

# 3. Umgebungsvariablen konfigurieren (optional)
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# Bearbeiten Sie die .env-Dateien nach Bedarf

# 4. Development Server starten
npm run dev
# Alternativ: Nur Frontend oder nur Backend
# npm run dev:frontend
# npm run dev:backend
```

### 🌐 URLs & Zugriff

Nach erfolgreichem Start sind folgende URLs verfügbar:

- **Frontend (Hauptanwendung):** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/health
- **API Funktionskatalog:** http://localhost:3000/api/functions

### 📦 Production Build & Deployment

```bash
# Build für Production
npm run build

# Production Server starten
npm start
```

> 💡 **Weitere Informationen:** Siehe [Developer Onboarding Guide](docs/DEVELOPER_ONBOARDING.md) für detaillierte Setup-Anweisungen und Troubleshooting.

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

```tree
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
- **HR-Modul** ✨ ERWEITERT
  - Mitarbeiterverwaltung (26 Endpoints)
  - Vertragsmanagement (permanent, befristet, freiberuflich)
  - Dokumentenverwaltung für Mitarbeiter
  - Onboarding-Workflow-System
  - Zeiterfassung mit Überstundenkonto
  - Urlaubsmanagement mit Genehmigungsworkflows
  - Gehaltsabrechnung mit Steuerberechnung
  - SEPA-Export für Gehaltszahlungen
  - Lohnjournal
  - Vollständige Input-Validierung und Error-Handling
- **Finance-Modul** ✨ ERWEITERT
  - Rechnungsmanagement (39+ Endpoints)
  - XRechnung-Export (EN 16931-konform)
  - ZUGFeRD-Integration (PDF mit eingebettetem XML)
  - Nummernkreisverwaltung
  - Mahnwesen mit 3 Eskalationsstufen
  - Auto-Eskalation für überfällige Rechnungen
  - Kontenrahmen SKR03/SKR04
  - DATEV-Export
  - Umsatzsteuer-Voranmeldung (UStVA)
  - Zahlungsüberwachung mit Risikobewertung
  - Kunden-/Lieferantenverwaltung
  - Buchhaltung (Hauptbuch, Debitoren, Kreditoren)
  - Finanzberichte (Bilanz, GuV)
- **Document Management System (DMS)** ✨ NEU
  - Dokumenten-Repository (25 Endpoints)
  - Upload & Versionierung
  - OCR-Integration für Dokumentenscanning
  - AI-basierte Verschlagwortung
  - Full-Text-Suche
  - Workflow-Automation (Genehmigung, Prüfung, Unterschrift)
  - E-Signature-Integration
  - Aufbewahrungsrichtlinien nach deutschem Recht
  - Audit-Trail für alle Aktionen

### 🔄 In Entwicklung (Module)

- **HR, Finance & DMS Module** ✅ APIs fertig
  - ✅ 60+ neue API-Endpoints implementiert
  - ✅ Workflow-Automatisierung (Genehmigungen, Mahnwesen)
  - ✅ XRechnung/ZUGFeRD-Unterstützung
  - ✅ OCR-Integration (Placeholder)
  - ✅ E-Signature-Integration (Placeholder)
  - 🔄 Datenbank-Integration für persistente Speicherung (folgt)
  - 🔄 Services-Layer für Business-Logik (folgt)
  - 🔄 Frontend-Komponenten für vollständige Benutzeroberfläche (folgt)
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

### Test-Befehle

```bash
# Alle Tests ausführen
npm test

# Nur Backend-Tests
npm test:backend

# Nur Frontend-Tests
npm test:frontend

# Tests mit Coverage-Report
npm test:coverage
npm test:backend:coverage    # Nur Backend Coverage
npm test:frontend:coverage   # Nur Frontend Coverage

# Interactive Test UI
npm test:ui

# Linting
npm run lint

# Code-Formatierung
npm run format

# Build (prüft TypeScript)
npm run build
```

**Aktueller Test-Status:**

- ⚠️ Backend: 10/16 Test-Dateien bestanden (6 failed)
- ⚠️ Frontend: 3/4 Test-Dateien bestanden (1 failed)
- ✅ Build: Vollständig erfolgreich (Frontend + Backend)
- ✅ Code Coverage: Backend 57.73%, Frontend 71.42% (Ziel: Gesamt 80%+)

**Code-Qualität & Coverage:**

- ✅ **SonarQube Integration** - Kontinuierliche Code-Qualitätsüberwachung
- ✅ **Coverage Reports** - LCOV, HTML, JSON Formate
- ✅ **Quality Gates** - Automatische Qualitätsprüfung in CI/CD
- ✅ **Security Scanning** - CodeQL + SonarQube Sicherheitsanalyse
- ✅ **ESLint & Prettier** - Konsistente Code-Formatierung
- ✅ **TypeScript strict mode** - Vollständige Typsicherheit

> 📚 **Weitere Informationen:**
>
> - [SonarQube Guide](docs/SONARQUBE.md) - Code-Qualität und Coverage
> - [CI/CD Setup](docs/development/CI_CD_SETUP.md) - Continuous Integration
> - [Code Conventions](docs/CODE_CONVENTIONS.md) - Coding Standards

## 📚 Dokumentation

> 📘 **Zentrale Anlaufstelle**: [Documentation Hub](docs/README.md) - Vollständiger Index aller Dokumentation

### 🎯 Schnelleinstieg nach Rolle

#### 👨‍💻 Für Entwickler

1. **[Getting Started Tutorial](docs/tutorials/getting-started.md)** - 5-Minuten-Setup
2. **[Developer Onboarding](docs/DEVELOPER_ONBOARDING.md)** - Vollständiger Setup-Guide
3. **[Code Conventions](docs/CODE_CONVENTIONS.md)** - Coding Standards & Best Practices
4. **[Copilot Ruleset](docs/development/COPILOT_RULESET.md)** - Entwicklungsrichtlinien

#### 🔌 Für API-Nutzer

1. **[API Documentation Hub](docs/api/README.md)** - Vollständige API-Referenz
2. **[Environment Variables](docs/ENVIRONMENT_VARIABLES.md)** - Konfigurationsreferenz
3. **[Authentication Guide](docs/AUTHENTICATION.md)** - Auth-System & Setup

#### 🏗️ Für Architekten

1. **[System Architecture](docs/ARCHITECTURE.md)** - Architektur-Übersicht
2. **[Architecture Decision Records](docs/adr/README.md)** - ADRs & Design-Entscheidungen
3. **[System Status](docs/SYSTEM_STATUS.md)** - Aktueller System-Status & Performance

### 📂 Wichtige Dokumentations-Kategorien

#### Kern-Dokumentation

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Beitragsrichtlinien
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community-Standards
- **[SECURITY.md](SECURITY.md)** - Sicherheitsrichtlinien
- **[CHANGELOG.md](CHANGELOG.md)** - Versionshistorie
- **[SUPPORT.md](docs/SUPPORT.md)** - Hilfe & FAQ

#### Entwicklung & Projektmanagement

- **[TODO.md](docs/development/TODO.md)** - Priorisierte Aufgabenliste
- **[ISSUES.md](docs/development/ISSUES.md)** - Aktive Issues & Technical Debt
- **[CI/CD Setup](docs/development/CI_CD_SETUP.md)** - Continuous Integration
- **[Scripts Guide](docs/development/SCRIPTS.md)** - NPM Scripts & Tools

#### Architektur & Konzept

- **[Architecture Decision Records](docs/adr/README.md)** - Architektur-Entscheidungen (ADRs)
- **[Compliance](docs/COMPLIANCE.md)** - Sicherheit, Datenschutz & GoBD
- **[Konzept](docs/concept/_0_KONZEPT.md)** - Vollständiges Projektkonzept
- **[Roadmap](docs/concept/_ROADMAP.md)** - Detaillierte Projektphasen

#### Modul-Dokumentation

- **[HR Module Guide](docs/HR_MODULE_GUIDE.md)** - Personalwesen & HR Management
- **[Finance Module Guide](docs/FINANCE_MODULE_GUIDE.md)** - Finanzen & Controlling
- **[AI Annotator Workflow](docs/AI_ANNOTATOR_WORKFLOW.md)** - KI-gestützte Annotation
- **[Function Node Transformation](docs/FUNCTION_NODE_TRANSFORMATION.md)** - Code-Generierung

#### Erweiterte Themen

- **[Performance Features](docs/PERFORMANCE_FEATURES.md)** - Optimierung & Caching
- **[Advanced Features](docs/ADVANCED_FEATURES.md)** - Fortgeschrittene Features
- **[WebSocket Real-Time](docs/WEBSOCKET_REALTIME.md)** - Real-Time-Updates
- **[Error Handling](docs/ERROR_HANDLING.md)** - Fehlerbehandlung & Recovery

### 📖 Dokumentations-Framework

Die Dokumentation folgt dem **[Diátaxis Framework](https://diataxis.fr/)** und **ISO/IEC/IEEE 26514** Standards:

- **📚 Tutorials** - Learning-oriented: Schritt-für-Schritt Anleitungen
- **🔧 How-To Guides** - Problem-oriented: Lösungen für spezifische Probleme
- **📖 Reference** - Information-oriented: Technische Referenz-Dokumentation
- **💡 Explanation** - Understanding-oriented: Konzeptionelle Erklärungen

## 🤝 Beitragen

Dieses Projekt folgt dem [Copilot Ruleset](docs/development/COPILOT_RULESET.md) für konsistente Entwicklung:

- **Aufgabenbearbeitung**: Arbeite [TODO.md](docs/development/TODO.md) und [ISSUES.md](docs/development/ISSUES.md) systematisch ab
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
**Letztes Update:** 20. Dezember 2025  
**Build-Status:** ✅ Erfolgreich (Backend + Frontend)  
**Test-Status:** ⚠️ 13/20 Test-Dateien bestanden (Backend: 10/16, Frontend: 3/4)  
**Dependencies:** ✅ 0 Vulnerabilities

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

### 🔄 In Entwicklung (AI & Transformation)

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

#### Q4 2025 (Aktuell): Stabilisierung & Qualität

- [x] Frontend: React 19 + Vite Migration
- [x] Backend: Express 5 + TypeScript
- [x] AI-Integration: Multi-Provider-System
- [x] Dokumentation: Umfassende Reorganisation
- [ ] Test-Coverage: Stabilisierung auf 80%+
- [ ] Code-Qualität: SonarQube Integration abschließen

#### Q1 2026: Core-Module vervollständigen

- [ ] HR-Modul: Vollständige CRUD-Operationen
- [ ] Finance-Modul: Buchhaltungsintegration
- [ ] AI-Annotator: Production-Ready
- [ ] Function-Node-Transformation: MVP

#### Q2 2026: Enterprise-Features

- [ ] Workflow-Engine (BPMN 2.0)
- [ ] Document-Management (OCR, AI-Tagging)
- [ ] Advanced Analytics (BI-Dashboard)
- [ ] Multi-Tenant-Support

#### Q3 2026: Compliance & Security

- [ ] GoBD-Zertifizierung
- [ ] DSGVO-Audit-Toolkit
- [ ] Pen-Test & Security-Hardening
- [ ] ISO 27001-Vorbereitung

#### Q4 2026: AI & Automation

- [ ] RAG-System für Dokumentensuche
- [ ] Process-Mining & Optimization
- [ ] Natural-Language-Querying (NLQ)
- [ ] Predictive Analytics
