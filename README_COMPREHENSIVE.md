# ERP SteinmetZ – Vollständiges Enterprise ERP mit KI-gestütztem AI Annotator

[![Version](https://img.shields.io/badge/Version-0.3.0-blue.svg)](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.18.0-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 Projektvision

ERP SteinmetZ ist ein **vollständiges Enterprise Resource Planning System** mit einem innovativen, **KI-gestützten Architekturansatz**. Das System nutzt einen **AI Annotator**, um Funktionen, Metadaten, Regeln und Formulare flexibel zu analysieren, generieren und zu erweitern – damit wird das ERP zu einer sich selbst dokumentierenden und kontinuierlich lernenden Plattform.

### Kernphilosophie

- **Instruction-driven ERP**: Fachprozesse als Arbeitsanweisungen (AA/DSL) und JSON-Schemas beschrieben
- **KI als Moderator**: AI orchestriert Eingaben und ruft deterministische Services auf
- **Flexible Architektur**: Dynamische Navigation und Dashboards aus Modul-Manifesten
- **Deterministische Basis**: Kernzahlen werden ausschließlich deterministisch berechnet
- **RAG für Wissensmanagement**: Retrieval Augmented Generation nur für Text-/Webquellen

---

## 📊 Aktueller Projektstand (Dezember 2025)

> **📘 Hinweis**: Diese Datei enthält die vollständige technische Dokumentation. Für strukturierte Navigation nach internationalen Standards siehe [Documentation Hub](docs/README.md).

### ✅ Vollständig Implementiert

#### Frontend (React 19 + Vite)

- ✅ **Modernes Framework**: React 19 mit Vite Build-System
- ✅ **Routing**: React Router v7 für Navigation
- ✅ **Theme-System**: 4 Themes (Light, Dark, LCARS, Contrast)
- ✅ **Dashboard**: Dynamisches Laden von 11 Funktionsbereichen
- ✅ **QuickChat**: KI-Assistant Integration
- ✅ **Internationalisierung**: 7 Sprachen (i18next)
- ✅ **Responsive Design**: Mobile-optimierte Layouts
- ✅ **Authentifizierung**: Login/Logout mit geschützten Routen

#### Backend (Express 5 + Node.js)

- ✅ **Express 5**: Moderner API-Server mit TypeScript
- ✅ **Health-Checks**: System-Monitoring (`/api/health`)
- ✅ **Functions Catalog**: 15.472 Funktionsknoten in 11 Kategorien
- ✅ **AI-Integration**: Multiple Provider (OpenAI, Ollama, Anthropic, Azure, Vertex AI, HuggingFace)
- ✅ **AI Annotator**: Automatische Metadaten-Generierung für Funktionsknoten
- ✅ **Datenbank**: SQLite (Dev) / PostgreSQL (Production-ready)
- ✅ **File-Watcher**: Automatisches Reload bei Änderungen
- ✅ **CORS**: Konfiguriert für Frontend-Integration
- ✅ **Authentifizierung**: JWT-basiertes Auth-System mit RBAC

#### AI & Machine Learning Layer

- ✅ **13 AI-Provider**: OpenAI, Ollama, Anthropic, Azure OpenAI, Vertex AI, HuggingFace, llama.cpp, Custom, Fallback, Eliza
- ✅ **AI Services**: Chat, Audio (STT), Translation, Vision, Embedding, Knowledge Base
- ✅ **Tool-Registry**: ERP-Tools, Database-Tools, File-Tools, System-Tools, Calculation-Tools
- ✅ **Workflow-Engine**: Orchestrierung komplexer AI-Workflows
- ✅ **Session-Management**: Konversationskontext und Memory-Store
- ✅ **AI Annotator Service**:
  - Meta-Generierung (Beschreibungen, Tags, Business Area)
  - Regel-Generierung (Dashboard-Widgets, Validierung)
  - Formular-Generierung (JSON-Schema basiert)
  - Schema-Enhancement
  - PII-Klassifizierung
  - Batch-Verarbeitung
  - Qualitätsanalyse

#### Resilience & Production-Ready Features

- ✅ **SAGA Pattern**: Transaction Coordinator für verteilte Transaktionen
- ✅ **Idempotency Store**: Vermeidung doppelter Operationen
- ✅ **Circuit Breaker**: Resiliente externe Service-Aufrufe
- ✅ **Retry Policy**: Exponentielles Backoff bei Fehlern
- ✅ **Audit Trail**: GoBD-konforme Event-Logs
- ✅ **Database Migrations**: Versionierte Schema-Änderungen
- ✅ **Self-Healing**: Automatische Reparatur und Health-Monitoring

#### Spezial-Services

- ✅ **Sipgate Integration**: Telefonie (CallHandler, FaxProcessor, VoiceAI)
- ✅ **System-Diagnostics**: Umfassendes System-Monitoring
- ✅ **Innovation Router**: Feature-Tracking und Innovation-Management
- ✅ **Calendar Service**: Terminverwaltung

### 📁 Projektstruktur

```
ERP_SteinmetZ_V1/
├── apps/
│   ├── frontend/                      # React 19 + Vite Frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Auth/             # Authentifizierung
│   │   │   │   ├── Dashboard/        # Hauptdashboard (mit Builder, Widgets, Navigation)
│   │   │   │   ├── FunctionsCatalog/ # Funktionsübersicht (mit Code-Editor, Export)
│   │   │   │   ├── QuickChat/        # KI-Chat Assistant
│   │   │   │   ├── LanguageSwitch/   # Sprachumschaltung
│   │   │   │   └── i18n/             # Internationalisierung
│   │   │   ├── contexts/             # React Contexts (Auth, Theme)
│   │   │   ├── hooks/                # Custom React Hooks
│   │   │   ├── pages/                # Seiten-Komponenten
│   │   │   ├── features/             # Feature-spezifische Module
│   │   │   └── styles/               # CSS Themes (base, light, dark, lcars, contrast)
│   │   └── package.json
│   │
│   └── backend/                       # Express 5 Backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── ai/               # AI Router (13 Provider, Services, Tools, Workflows)
│       │   │   ├── aiAnnotatorRouter/ # AI Annotator API
│       │   │   ├── auth/             # Authentifizierung
│       │   │   ├── dashboard/        # Dashboard-API
│       │   │   ├── functionsCatalog/ # Funktionskatalog-API
│       │   │   ├── quickchat/        # QuickChat-API
│       │   │   ├── systemInfoRouter/ # System-Info & Health
│       │   │   ├── innovation/       # Innovation-Tracking
│       │   │   ├── calendar/         # Kalender-Service
│       │   │   └── diagnostics/      # System-Diagnostics
│       │   ├── services/
│       │   │   ├── aiAnnotatorService.ts      # AI Annotator Core
│       │   │   ├── authService.ts             # Authentication
│       │   │   ├── dbService.ts               # Database Layer
│       │   │   ├── functionsCatalogService.ts # Functions Management
│       │   │   ├── systemInfoService.ts       # System Information
│       │   │   ├── selfhealing/               # Self-Healing Services
│       │   │   └── sipgate/                   # Telefonie Integration
│       │   ├── middleware/           # Express Middleware (Auth, Error Handler)
│       │   ├── tools/                # Tool Registry für AI
│       │   ├── types/                # TypeScript Definitionen
│       │   ├── utils/                # Utilities
│       │   ├── migrations/           # DB Migrations
│       │   └── views/                # Static Views
│       └── package.json
│
├── src/                              # Shared Code
│   ├── resilience/                   # Circuit Breaker, Retry Policy
│   ├── saga/                         # Transaction Coordinator, Idempotency Store
│   └── db/                           # Database Migrations
│
├── data/
│   └── functions/                    # Funktionskatalog-Dateien (11 Kategorien)
│
├── docs/                             # Dokumentation
│   ├── concept/                      # Konzeptdokumente
│   │   ├── _0_KONZEPT.md            # Hauptkonzept
│   │   ├── _ROADMAP.md              # Projektphasen
│   │   └── [11 Funktionsbereich-Docs]
│   ├── ARCHITECTURE.md              # System-Architektur
│   ├── AUTHENTICATION.md            # Auth-Dokumentation
│   └── COMPLIANCE.md                # Sicherheit & Datenschutz
│
└── package.json                     # Root Package (Workspaces)
```

### 📊 Code-Statistiken

- **Backend**: ~28.800 Zeilen TypeScript (77 Dateien)
- **Frontend**: ~18.800 Zeilen TypeScript/TSX (137 Dateien)
- **AI Provider**: 13 verschiedene Provider-Implementierungen
- **API-Endpunkte**: 100+ REST-Endpoints
- **Funktionskatalog**: 15.472 Funktionsknoten in 11 Kategorien

---

## 🚀 Quick Start

### Voraussetzungen

- **Node.js**: >= 18.18.0
- **npm** oder **yarn**
- **SQLite** (für Development)
- **PostgreSQL** (optional, für Production)

### Installation & Start

```bash
# 1. Repository klonen
git clone https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1.git
cd ERP_SteinmetZ_V1

# 2. Dependencies installieren
npm install

# 3. Umgebungsvariablen konfigurieren
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# Bearbeite .env Dateien nach Bedarf

# 4. Development Modus (Frontend + Backend parallel)
npm run dev

# Oder separat:
npm run dev:frontend  # Frontend auf http://localhost:5173
npm run dev:backend   # Backend auf http://localhost:3000
```

### Production Build

```bash
# Build erstellen
npm run build

# Production Server starten
npm start
```

### URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Functions API**: http://localhost:3000/api/functions
- **AI Annotator**: http://localhost:3000/api/ai-annotator
- **System Dashboard**: http://localhost:3000/

---

## 🏗️ Technologie-Stack

### Frontend

- **Framework**: React 19.2.0
- **Build-Tool**: Vite 7.1
- **Routing**: React Router DOM v7.9
- **State Management**: React Context API + Custom Hooks
- **Internationalisierung**: i18next 25.6 + react-i18next 16.3
- **Styling**: CSS Modules + Custom Design System (4 Themes)
- **TypeScript**: 5.9.3

### Backend

- **Runtime**: Node.js >= 18.18.0
- **Framework**: Express 5.1.0
- **Language**: TypeScript 5.9.3
- **Database**:
  - SQLite (better-sqlite3 12.4) für Development
  - PostgreSQL (pg 8.16) für Production
- **AI/ML**:
  - OpenAI 6.7
  - Anthropic SDK 0.68
  - node-llama-cpp 3.14
  - node-fetch 3.3 (für Custom Provider)
- **File Upload**: Multer 2.0
- **Authentication**:
  - jsonwebtoken 9.0
  - bcrypt 6.0
  - express-session 1.18
- **Security**:
  - express-rate-limit 8.2
  - cookie-parser 1.4
  - cors 2.8
- **Audio Processing**: fluent-ffmpeg 2.1
- **File Watching**: chokidar 4.0
- **Real-Time Communication**: socket.io (latest) ✨ NEU

### Shared Dependencies

- **Validation**: Zod 4.1
- **Utilities**: lodash-es 4.17, clsx 2.1
- **Async**: await-lock 3.0
- **Data Format**: yaml 2.8
- **Logging**: pino 10.1
- **Code Editor**: monaco-editor 0.54

---

## 📚 API-Dokumentation

### Core APIs

#### Health & System

- `GET /api/health` - System Health Status
- `GET /api/system` - System Information
- `GET /diagnostics` - Diagnostic Information

#### Authentication

- `POST /api/auth/login` - User Login
- `POST /api/auth/logout` - User Logout
- `POST /api/auth/register` - User Registration
- `GET /api/auth/me` - Current User Info

#### Functions Catalog

- `GET /api/functions` - Vollständiger Funktionskatalog (mit Caching ✨)
- `GET /api/functions/roots` - Top-Level Kategorien (11 Bereiche)
- `GET /api/functions/nodes/:id` - Einzelner Funktionsknoten mit Details
- `GET /api/functions/search` - Volltextsuche mit Pagination (Enhanced Search ✨)
- `POST /api/functions/menu` - RBAC-gefiltertes Menü

#### WebSocket & Real-Time ✨ NEU

- `ws://localhost:3000` - WebSocket-Verbindung
- `GET /api/ws/stats` - WebSocket-Statistiken
- Events: `dashboard:*`, `chat:*`, `system:*`, `batch:*`, `catalog:*`

#### Dashboard

- `GET /api/dashboard` - Dashboard-Daten und Widgets

#### QuickChat (AI Assistant)

- `POST /api/quickchat` - Chat-Nachricht senden

### AI APIs (Ausführlich dokumentiert in `/apps/backend/src/routes/ai/docs/`)

#### AI Models & Chat

- `GET /api/ai/models` - Liste aller AI-Modelle
- `POST /api/ai/chat` - Neue Chat-Session
- `POST /api/ai/chat/:sessionId/message` - Nachricht senden
- `GET /api/ai/sessions` - Alle Sessions
- `DELETE /api/ai/chat/:sessionId` - Session löschen

#### AI Services

- `POST /api/ai/audio/transcribe` - Speech-to-Text
- `POST /api/ai/translate` - Text-Übersetzung
- `GET /api/ai/settings` - AI-Konfiguration
- `PUT /api/ai/settings` - Konfiguration aktualisieren

#### AI Tools & Workflows

- `GET /api/ai/tools` - Verfügbare Tools
- `POST /api/ai/tools/:name/run` - Tool ausführen
- `GET /api/ai/workflows` - Workflow-Katalog
- `POST /api/ai/workflow/:name/run` - Workflow starten

#### AI Status & Diagnostics

- `GET /api/ai/status` - AI-System Status
- `GET /api/ai/diagnostics` - Ausführliche Diagnose

### AI Annotator APIs (Ausführlich dokumentiert in `/apps/backend/src/routes/aiAnnotatorRouter/docs/`)

#### Node Management

- `GET /api/ai-annotator/nodes` - Nodes filtern und auflisten
- `GET /api/ai-annotator/nodes/:id` - Einzelnen Node abrufen
- `POST /api/ai-annotator/nodes/:id/validate` - Node validieren

#### Annotation Operations

- `POST /api/ai-annotator/nodes/:id/generate-meta` - Metadaten generieren
- `POST /api/ai-annotator/nodes/:id/generate-rule` - Regeln generieren
- `POST /api/ai-annotator/nodes/:id/generate-form` - Formular generieren
- `POST /api/ai-annotator/nodes/:id/enhance-schema` - Schema erweitern
- `POST /api/ai-annotator/nodes/:id/full-annotation` - Vollständige Annotation

#### Batch Operations

- `POST /api/ai-annotator/batch` - Batch-Operation erstellen
- `GET /api/ai-annotator/batch/:id` - Batch-Status abrufen
- `POST /api/ai-annotator/batch/:id/cancel` - Batch abbrechen

#### Quality & Analysis

- `GET /api/ai-annotator/quality/report` - Qualitätsbericht
- `POST /api/ai-annotator/classify-pii` - PII-Klassifizierung
- `POST /api/ai-annotator/validate-batch` - Batch-Validierung

#### System

- `GET /api/ai-annotator/status` - System-Status
- `GET /api/ai-annotator/database/stats` - Datenbank-Statistiken
- `GET /api/ai-annotator/rules` - Dashboard-Regeln

---

## 🎨 Features im Detail

### 1. Functions Catalog (15.472 Knoten in 11 Kategorien)

Der Funktionskatalog ist das Herzstück des Systems und organisiert alle ERP-Funktionen hierarchisch:

1. **Dashboard** - Zentrale Übersicht
2. **Geschäftsverwaltung** - Stammdaten, Kontakte, Dokumente
3. **Finanzen & Controlling** - Buchhaltung, Rechnungen, Mahnwesen
4. **Vertrieb & Marketing** - CRM, Angebote, Kampagnen
5. **Einkauf & Beschaffung** - Lieferanten, Bestellungen
6. **Produktion & Fertigung (Werk)** - Fertigung, Qualität
7. **Produktion & Fertigung (Lager)** - Lagerverwaltung, Logistik
8. **Personal & HR** - Mitarbeiter, Zeiterfassung, Payroll
9. **Reporting & Analytics** - Reports, KPIs, BI
10. **Kommunikation & Social** - E-Mail, Telefonie, Collaboration
11. **System & Administration** - Einstellungen, Benutzerverwaltung

### 2. AI Annotator - Intelligente Metadaten-Generierung

Der AI Annotator analysiert und erweitert automatisch Funktionsknoten:

- **Meta-Generierung**: Beschreibungen, Tags, Business-Area-Zuordnung
- **PII-Klassifizierung**: Automatische Erkennung personenbezogener Daten
- **Regel-Generierung**: Dashboard-Widget-Definitionen
- **Formular-Generierung**: JSON-Schema-basierte Formulare
- **Schema-Enhancement**: Erweiterte Datenschema-Informationen
- **Qualitätsanalyse**: Konfidenz-Scores, Validierung, Empfehlungen
- **Batch-Verarbeitung**: Parallele Verarbeitung großer Node-Mengen

### 3. Multi-Provider AI-Integration

Das System unterstützt 13 verschiedene AI-Provider mit automatischem Fallback:

- **OpenAI**: GPT-4, GPT-3.5-turbo, Whisper
- **Anthropic**: Claude 3 (Opus, Sonnet, Haiku)
- **Azure OpenAI**: Enterprise GPT-Modelle
- **Google Vertex AI**: PaLM, Gemini
- **Ollama**: Lokale Modelle (Mistral, LLaMA, Qwen)
- **HuggingFace**: Open-Source Modelle
- **llama.cpp**: Native C++ Inferenz
- **Custom Provider**: Eigene Modell-Endpunkte
- **Fallback Provider**: Regelbasierte Antworten bei Ausfall
- **Eliza**: Klassischer Chatbot-Fallback

### 4. Theme-System mit 4 Themes

- **Light**: Helle, moderne Oberfläche
- **Dark**: Dunkles Theme für Augenschonung
- **LCARS**: Star Trek inspiriertes Design
- **Contrast**: Hoher Kontrast für Barrierefreiheit

### 5. Resilience & Production-Ready

- **SAGA Pattern**: Orchestrierung verteilter Transaktionen
- **Circuit Breaker**: Schutz vor kaskadierenden Fehlern
- **Retry Policy**: Exponentielles Backoff mit Jitter
- **Idempotency**: Vermeidung doppelter Operationen
- **Audit Trail**: Vollständige GoBD-konforme Event-Logs
- **Self-Healing**: Automatische Fehlererkennung und -behebung

---

## 🔐 Sicherheit & Compliance

### Authentifizierung & Autorisierung

- **JWT-basiert**: Sichere Token-Authentifizierung
- **RBAC**: Role-Based Access Control
- **Session-Management**: Sichere Session-Verwaltung
- **Password-Hashing**: bcrypt mit Salting

### Datenschutz (GDPR/DSGVO)

- **PII-Klassifizierung**: Automatische Erkennung personenbezogener Daten
- **Audit Trail**: Lückenlose Protokollierung
- **Data Retention**: Konfigurierbare Aufbewahrungsfristen
- **Encryption**: Verschlüsselung at-rest und in-transit

### Compliance (GoBD)

- **Unveränderbarkeit**: Append-only Event-Logs
- **Nummernkreise**: Lückenlose Belegnummerierung
- **Archivierung**: Langfristige Datenspeicherung
- **Dokumentation**: Vollständige API-Dokumentation

Siehe [COMPLIANCE.md](docs/COMPLIANCE.md) für Details.

---

## 🧪 Development

### Linting & Code-Quality

```bash
# Linting ausführen
npm run lint

# Code formatieren
npm run format
```

### Build & Type-Checking

```bash
# TypeScript Type-Checking
npm run build

# Nur Frontend bauen
npm run build:frontend

# Nur Backend bauen
npm run build:backend
```

### Clean-Up

```bash
# Alle Build-Artefakte löschen
npm run clean

# Nur Frontend bereinigen
npm run clean:frontend

# Nur Backend bereinigen
npm run clean:backend
```

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅ (Abgeschlossen)

- ✅ Grundlegende Architektur
- ✅ Frontend mit React 19 + Vite
- ✅ Backend mit Express 5
- ✅ AI-Integration mit Multiple Provider
- ✅ Functions Catalog (15.472 Nodes)
- ✅ Dashboard & Navigation
- ✅ Theme-System (4 Themes)
- ✅ Authentifizierung & RBAC
- ✅ AI Annotator Core

### Phase 2: Erweiterung & Stabilisierung 🔄 (In Arbeit)

- ⏳ WebSocket für Echtzeit-Updates
- ⏳ Erweiterte Suche mit Filtern
- ⏳ Mobile Optimierung
- ⏳ Performance-Optimierung (Caching, Lazy Loading)
- ⏳ Umfassende Unit- und Integration-Tests
- ⏳ CI/CD Pipeline
- ⏳ Docker Containerisierung

### Phase 3: Enterprise Features 📋 (Geplant)

- 📋 HR-Modul: Mitarbeiter anlegen, Zeiterfassung, Payroll
- 📋 Finance-Modul: Rechnung E2E (XRechnung, ZUGFeRD)
- 📋 Workflow-Engine mit Approval-Flows
- 📋 Document Management (AI-gestützt)
- 📋 Advanced Analytics & Reporting
- 📋 SLA-Monitoring & Alerting
- 📋 Multi-Tenancy Support

### Phase 4: KI-Erweiterungen 🚀 (Vision)

- 🚀 RAG für Dokumenten-Suche
- 🚀 Preisvergleich mit Web-Scraping
- 🚀 Automatisierte Prozess-Optimierung
- 🚀 Predictive Analytics
- 🚀 Natural Language Querying
- 🚀 Voice-Interfaces (Speech-to-Action)

---

## 📖 Weitere Dokumentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Detaillierte System-Architektur
- **[AUTHENTICATION.md](docs/AUTHENTICATION.md)** - Authentifizierungs-System
- **[COMPLIANCE.md](docs/COMPLIANCE.md)** - Sicherheit & Datenschutz
- **[Konzept](docs/concept/_0_KONZEPT.md)** - Vollständiges Projektkonzept
- **[Roadmap](docs/concept/_ROADMAP.md)** - Detaillierte Projektphasen
- **[AI Router Docs](apps/backend/src/routes/ai/docs/)** - Vollständige AI-API-Dokumentation
- **[AI Annotator Docs](apps/backend/src/routes/aiAnnotatorRouter/docs/)** - AI Annotator API

---

## 🤝 Beitragen

Contributions sind willkommen! Bitte beachte:

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add AmazingFeature'`)
4. Pushe zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

### Coding Standards

- TypeScript für alle neuen Dateien
- ESLint Regeln beachten
- Aussagekräftige Commit-Messages
- Code-Dokumentation für komplexe Logik

---

## 📧 Kontakt & Support

**Projektverantwortlicher**: Thomas Heisig  
**GitHub**: [@Thomas-Heisig](https://github.com/Thomas-Heisig)  
**Repository**: [ERP_SteinmetZ_V1](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1)

---

## 📄 Lizenz

Siehe [LICENSE](LICENSE) für Details.

---

## 🙏 Danksagungen

Dieses Projekt nutzt zahlreiche Open-Source-Technologien und -Bibliotheken:

- React, Vite, Express, TypeScript
- OpenAI, Anthropic, Ollama und weitere AI-Provider
- Alle Contributors und Open-Source-Community

---

**Version**: 0.2.0  
**Letztes Update**: Dezember 2024  
**Status**: ✅ Production-Ready Foundation, 🔄 Active Development
