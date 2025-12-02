# ERP SteinmetZ V2.0 - Intelligente Betriebsassistenz für KMU

## 🎯 Vision
ERP Steinmetz ist eine **intelligente Betriebsassistenz für KMU** - kein komplexes Enterprise-System, sondern ein KI-gestützter Betriebsassistent, der tägliche Abläufe vereinfacht, Prozesse automatisiert und Entscheidungen datenbasiert unterstützt.

## ✅ Aktueller Status (Stand: Dezember 2024)

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

### API-Endpunkte
- `GET /api/health` - System Health Status
- `GET /api/functions` - Vollständiger Funktionskatalog
- `GET /api/functions/roots` - Top-Level Kategorien (11 Bereiche)
- `GET /api/functions/nodes/:id` - Einzelner Funktionsknoten mit Details
- `GET /api/functions/search` - Volltextsuche mit Pagination
- `POST /api/functions/menu` - RBAC-gefiltertes Menü
- `GET /api/dashboard` - Dashboard-Daten
- `POST /api/quickchat` - QuickChat AI Assistant

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

### 🔄 In Entwicklung
- WebSocket für Echtzeit-Updates
- Erweiterte Suche mit Filtern
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

# Tests (wenn vorhanden)
npm test
```

## 📚 Dokumentation

- [Architecture](docs/ARCHITECTURE.md) - System-Architektur
- [Compliance](docs/COMPLIANCE.md) - Sicherheit & Datenschutz
- [API Docs](apps/backend/src/routes/README.md) - API Dokumentation

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

**Version:** 0.2.0  
**Letztes Update:** Dezember 2024
