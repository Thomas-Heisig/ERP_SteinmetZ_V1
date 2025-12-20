# ERP SteinmetZ - Dokumentationsindex

**Stand**: 19. Dezember 2025  
**Version**: 0.3.0

Dieser Index bietet eine strukturierte Übersicht über die gesamte Projektdokumentation.

## 📚 Schnellstart

| Dokument                                           | Beschreibung                             | Zielgruppe        |
| -------------------------------------------------- | ---------------------------------------- | ----------------- |
| [README.md](../README.md)                          | Projekt-Übersicht, Features, Quick Start | Alle              |
| [DEVELOPER_ONBOARDING.md](DEVELOPER_ONBOARDING.md) | Entwickler-Setup-Anleitung               | Neue Entwickler   |
| [SCRIPTS.md](../SCRIPTS.md)                        | Verfügbare npm-Scripts                   | Entwickler        |
| **[📘 Help Center](/help)**                        | **Integriertes Help-System**             | **Alle Benutzer** |

## 🆕 Neue Dokumentationsstruktur (19. Dezember 2025)

### Zentralisierte Dokumentation

Die Dokumentation wurde neu organisiert und konsolidiert:

| Bereich                                  | Beschreibung                    | Dateien               |
| ---------------------------------------- | ------------------------------- | --------------------- |
| **[docs/modules/](modules/README.md)**   | Backend-Modul-Dokumentation     | 24 Module-Docs        |
| **[docs/frontend/](frontend/README.md)** | Frontend-Komponenten & Features | 19 Komponenten-Docs   |
| **[docs/backend/](backend/README.md)**   | Backend-Infrastructure          | 3 Infrastructure-Docs |

### Help Desk System ✨ NEU

| Komponente                                                         | Beschreibung                   | Zugriff       |
| ------------------------------------------------------------------ | ------------------------------ | ------------- |
| **Frontend Help Center**                                           | Benutzer-Hilfe-Portal          | `/help`       |
| **Admin Interface**                                                | Artikel-Verwaltung             | `/help-admin` |
| **Backend API**                                                    | REST API für Help-System       | `/api/help/*` |
| **[API Documentation](../apps/backend/src/routes/help/README.md)** | Vollständige API-Dokumentation | -             |

**Features:**

- 📝 Artikel-Verwaltung (CRUD)
- 🔍 Erweiterte Suche mit Relevanz-Scoring
- 📊 Usage-Analytics und Statistics
- 🏷️ Kategorien-Management
- 📈 View-Count Tracking
- 🎨 Markdown-Editor

## 🏗️ Architektur & Design

### Kern-Architektur

| Dokument                                                 | Beschreibung                   |
| -------------------------------------------------------- | ------------------------------ |
| [ARCHITECTURE.md](ARCHITECTURE.md)                       | System-Architektur, Tech Stack |
| [CODE_CONVENTIONS.md](CODE_CONVENTIONS.md)               | Code-Style, Naming-Conventions |
| [DOCUMENTATION_STANDARDS.md](DOCUMENTATION_STANDARDS.md) | Dokumentations-Standards       |
| [docs/adr/](adr/)                                        | Architecture Decision Records  |

### Datenbank

| Dokument                                             | Beschreibung                     |
| ---------------------------------------------------- | -------------------------------- |
| [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md)     | Migrations-System                |
| [DATABASE_OPTIMIZATION.md](DATABASE_OPTIMIZATION.md) | Performance-Optimierung, Indizes |

## 🛠️ Entwicklung

### Setup & Konfiguration

| Dokument                                             | Beschreibung                             |
| ---------------------------------------------------- | ---------------------------------------- |
| [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) | Alle Umgebungsvariablen                  |
| [REDIS_CONFIGURATION.md](REDIS_CONFIGURATION.md)     | Redis Setup & Verwendung                 |
| [DEV_TOOLS_GUIDE.md](DEV_TOOLS_GUIDE.md)             | Development Tools (Storybook, MSW, etc.) |

### Code-Qualität

| Dokument                                                     | Beschreibung                           |
| ------------------------------------------------------------ | -------------------------------------- |
| [COMMIT_CONVENTIONS.md](../COMMIT_CONVENTIONS.md)            | Conventional Commits                   |
| [CODE_QUALITY_IMPROVEMENTS.md](CODE_QUALITY_IMPROVEMENTS.md) | Migration Guide (console.log → logger) |
| [SONARQUBE.md](SONARQUBE.md)                                 | SonarQube Integration                  |

### Error-Handling & Validation

| Dokument                                                         | Beschreibung                           |
| ---------------------------------------------------------------- | -------------------------------------- |
| [ERROR_HANDLING.md](ERROR_HANDLING.md)                           | Standardisiertes Error-Handling-System |
| [ERROR_STANDARDIZATION_GUIDE.md](ERROR_STANDARDIZATION_GUIDE.md) | Error-Klassen, AsyncHandler            |

## 📊 Monitoring & Observability

### Metriken & Logs

| Dokument                                         | Beschreibung                    | Status           |
| ------------------------------------------------ | ------------------------------- | ---------------- |
| [monitoring/README.md](../monitoring/README.md)  | Prometheus + Grafana Setup      | ✅ Implementiert |
| [MONITORING.md](MONITORING.md)                   | Monitoring-Übersicht            | ✅ Dokumentiert  |
| [LOG_AGGREGATION.md](LOG_AGGREGATION.md)         | Loki, ELK Stack, Cloud-Lösungen | 🟡 Geplant       |
| [OPENTELEMETRY_SETUP.md](OPENTELEMETRY_SETUP.md) | Distributed Tracing             | 🟡 Geplant       |
| [SENTRY_INTEGRATION.md](SENTRY_INTEGRATION.md)   | Error Tracking                  | 🟡 Geplant       |

## 🔒 Security & Compliance

| Dokument                                 | Beschreibung        |
| ---------------------------------------- | ------------------- |
| [SECURITY.md](../SECURITY.md)            | Security Policy     |
| [AUTHENTICATION.md](AUTHENTICATION.md)   | Auth-System, JWT    |
| [COMPLIANCE.md](COMPLIANCE.md)           | DSGVO, GoBD         |
| [FAULT_TOLERANCE.md](FAULT_TOLERANCE.md) | Resilience Patterns |

## 🎯 Features & Module

### AI & Automation

| Dokument                                                                | Beschreibung                         |
| ----------------------------------------------------------------------- | ------------------------------------ |
| [apps/backend/src/routes/ai/docs/](../apps/backend/src/routes/ai/docs/) | AI-System-Dokumentation              |
| [QUICKCHAT_REDESIGN.md](QUICKCHAT_REDESIGN.md)                          | QuickChat-Feature                    |
| [FUNCTION_NODE_TRANSFORMATION.md](FUNCTION_NODE_TRANSFORMATION.md)      | Code-Generierung aus Funktions-Nodes |

### Realtime & WebSockets

| Dokument                                               | Beschreibung                        |
| ------------------------------------------------------ | ----------------------------------- |
| [WEBSOCKET_REALTIME.md](WEBSOCKET_REALTIME.md)         | WebSocket-Integration, Event-System |
| [REALTIME_UPDATES_GUIDE.md](REALTIME_UPDATES_GUIDE.md) | Real-Time Updates Implementation    |

### Suche & Filter

| Dokument                                                   | Beschreibung                    |
| ---------------------------------------------------------- | ------------------------------- |
| [SEARCH_ENGINE_EVALUATION.md](SEARCH_ENGINE_EVALUATION.md) | ElasticSearch vs MeiliSearch    |
| [PERFORMANCE_FEATURES.md](PERFORMANCE_FEATURES.md)         | Search Analytics, Filter-System |

### Business-Module

| Dokument                                           | Beschreibung                                  | Status            |
| -------------------------------------------------- | --------------------------------------------- | ----------------- |
| [HR_MODULE_GUIDE.md](HR_MODULE_GUIDE.md)           | HR-Modul: Mitarbeiter, Zeiterfassung, Payroll | 🟡 In Entwicklung |
| [FINANCE_MODULE_GUIDE.md](FINANCE_MODULE_GUIDE.md) | Finance: Rechnungen, Buchhaltung, DATEV       | 🟡 In Entwicklung |

## 📖 API-Dokumentation

### REST API

| Dokument                                                        | Beschreibung                  |
| --------------------------------------------------------------- | ----------------------------- |
| [docs/api/](api/)                                               | OpenAPI 3.0 Specification     |
| [docs/api/API_DOCUMENTATION.md](api/API_DOCUMENTATION.md)       | Alle Endpoints mit Beispielen |
| [docs/api/postman-collection.json](api/postman-collection.json) | Postman Collection            |

### Module-Dokumentation

| Modul       | Dokument                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Auth        | [apps/backend/src/routes/auth/README.md](../apps/backend/src/routes/auth/README.md)               |
| Calendar    | [apps/backend/src/routes/calendar/README.md](../apps/backend/src/routes/calendar/README.md)       |
| Diagnostics | [apps/backend/src/routes/diagnostics/README.md](../apps/backend/src/routes/diagnostics/README.md) |
| Finance     | [apps/backend/src/routes/finance/README.md](../apps/backend/src/routes/finance/README.md)         |
| HR          | [apps/backend/src/routes/hr/README.md](../apps/backend/src/routes/hr/README.md)                   |
| Innovation  | [apps/backend/src/routes/innovation/README.md](../apps/backend/src/routes/innovation/README.md)   |
| QuickChat   | [apps/backend/src/routes/quickchat/README.md](../apps/backend/src/routes/quickchat/README.md)     |

## 🧪 Testing

| Dokument                                                            | Beschreibung                |
| ------------------------------------------------------------------- | --------------------------- |
| [apps/backend/vitest.config.ts](../apps/backend/vitest.config.ts)   | Backend Test-Konfiguration  |
| [apps/frontend/vitest.config.ts](../apps/frontend/vitest.config.ts) | Frontend Test-Konfiguration |

## 🚀 CI/CD & Deployment

| Dokument                                    | Beschreibung             |
| ------------------------------------------- | ------------------------ |
| [CI_CD_SETUP.md](../CI_CD_SETUP.md)         | GitHub Actions Workflows |
| [.github/workflows/](../.github/workflows/) | Workflow-Definitionen    |

## 📝 Projektmanagement

### Planung & Tracking

| Dokument                        | Beschreibung                      |
| ------------------------------- | --------------------------------- |
| [TODO.md](../TODO.md)           | Priorisierte Aufgabenliste        |
| [ISSUES.md](../ISSUES.md)       | Aktive Issues & Bugs              |
| [CHANGELOG.md](../CHANGELOG.md) | Version History                   |
| [ARCHIVE.md](../ARCHIVE.md)     | Behobene Issues & alte Changelogs |

### Status & Reports

| Dokument                             | Beschreibung            |
| ------------------------------------ | ----------------------- |
| [SYSTEM_STATUS.md](SYSTEM_STATUS.md) | Aktueller System-Status |
| [docs/concept/](concept/)            | Konzept-Dokumente       |

## 🤝 Community

| Dokument                                    | Beschreibung            |
| ------------------------------------------- | ----------------------- |
| [CONTRIBUTING.md](../CONTRIBUTING.md)       | Contribution Guidelines |
| [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) | Code of Conduct         |
| [SUPPORT.md](../SUPPORT.md)                 | Support-Kanäle          |

## 📚 Tutorials

| Tutorial                                                     | Beschreibung    |
| ------------------------------------------------------------ | --------------- |
| [tutorials/getting-started.md](tutorials/getting-started.md) | Getting Started |
| [tutorials/API_INTEGRATION.md](tutorials/API_INTEGRATION.md) | API Integration |

## 🗂️ Nach Typ sortiert

### 📘 How-To Guides

Praktische Anleitungen für konkrete Aufgaben:

- [DEVELOPER_ONBOARDING.md](DEVELOPER_ONBOARDING.md)
- [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md)
- [REDIS_CONFIGURATION.md](REDIS_CONFIGURATION.md)
- [OPENTELEMETRY_SETUP.md](OPENTELEMETRY_SETUP.md)
- [SENTRY_INTEGRATION.md](SENTRY_INTEGRATION.md)
- [LOG_AGGREGATION.md](LOG_AGGREGATION.md)

### 📖 Reference

Nachschlagewerke und technische Spezifikationen:

- [CODE_CONVENTIONS.md](CODE_CONVENTIONS.md)
- [ERROR_HANDLING.md](ERROR_HANDLING.md)
- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)
- [docs/api/](api/)
- [docs/reference/](reference/)

### 💡 Explanation

Konzeptionelle Dokumentation:

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [FAULT_TOLERANCE.md](FAULT_TOLERANCE.md)
- [WEBSOCKET_REALTIME.md](WEBSOCKET_REALTIME.md)
- [docs/explanation/](explanation/)

### 🎓 Tutorials

Schritt-für-Schritt-Anleitungen:

- [tutorials/getting-started.md](tutorials/getting-started.md)
- [tutorials/API_INTEGRATION.md](tutorials/API_INTEGRATION.md)

## 🔍 Dokumentation finden

### Nach Rolle

**Neue Entwickler**:

1. [README.md](../README.md)
2. [DEVELOPER_ONBOARDING.md](DEVELOPER_ONBOARDING.md)
3. [CODE_CONVENTIONS.md](CODE_CONVENTIONS.md)
4. [SCRIPTS.md](../SCRIPTS.md)

**Backend-Entwickler**:

1. [ERROR_HANDLING.md](ERROR_HANDLING.md)
2. [DATABASE_OPTIMIZATION.md](DATABASE_OPTIMIZATION.md)
3. [WEBSOCKET_REALTIME.md](WEBSOCKET_REALTIME.md)
4. [HR_MODULE_GUIDE.md](HR_MODULE_GUIDE.md)
5. [FINANCE_MODULE_GUIDE.md](FINANCE_MODULE_GUIDE.md)

**Frontend-Entwickler**:

1. [apps/frontend/src/components/](../apps/frontend/src/components/)
2. [REALTIME_UPDATES_GUIDE.md](REALTIME_UPDATES_GUIDE.md)
3. [QUICKCHAT_REDESIGN.md](QUICKCHAT_REDESIGN.md)

**DevOps**:

1. [CI_CD_SETUP.md](../CI_CD_SETUP.md)
2. [monitoring/README.md](../monitoring/README.md)
3. [OPENTELEMETRY_SETUP.md](OPENTELEMETRY_SETUP.md)
4. [SENTRY_INTEGRATION.md](SENTRY_INTEGRATION.md)
5. [LOG_AGGREGATION.md](LOG_AGGREGATION.md)

**QA / Tester**:

1. [apps/backend/vitest.config.ts](../apps/backend/vitest.config.ts)
2. [SYSTEM_STATUS.md](SYSTEM_STATUS.md)
3. [ISSUES.md](../ISSUES.md)

### Nach Thema

**Authentication & Security**:

- [AUTHENTICATION.md](AUTHENTICATION.md)
- [SECURITY.md](../SECURITY.md)
- [COMPLIANCE.md](COMPLIANCE.md)

**Database**:

- [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md)
- [DATABASE_OPTIMIZATION.md](DATABASE_OPTIMIZATION.md)

**Monitoring**:

- [monitoring/README.md](../monitoring/README.md)
- [MONITORING.md](MONITORING.md)
- [LOG_AGGREGATION.md](LOG_AGGREGATION.md)
- [OPENTELEMETRY_SETUP.md](OPENTELEMETRY_SETUP.md)
- [SENTRY_INTEGRATION.md](SENTRY_INTEGRATION.md)

**Module-Entwicklung**:

- [HR_MODULE_GUIDE.md](HR_MODULE_GUIDE.md)
- [FINANCE_MODULE_GUIDE.md](FINANCE_MODULE_GUIDE.md)
- [ERROR_STANDARDIZATION_GUIDE.md](ERROR_STANDARDIZATION_GUIDE.md)

## 📊 Dokumentations-Status

### ✅ Vollständig dokumentiert

- Backend Error-Handling-System
- Monitoring mit Prometheus + Grafana
- WebSocket-Integration
- Authentifizierung & Autorisierung
- Datenbankmigrationen
- Code-Conventions

### 🟡 Teilweise dokumentiert

- HR-Modul (Konzept vorhanden, Implementation ausstehend)
- Finance-Modul (Konzept vorhanden, Implementation ausstehend)
- AI-System (Technische Docs vorhanden, User-Docs ausstehend)

### 🔴 Dokumentation ausstehend

- End-to-End Tests
- Performance-Benchmarks
- Deployment-Prozess (Production)

## 🔄 Dokumentations-Updates

Die Dokumentation wird kontinuierlich aktualisiert. Letzte größere Updates:

- **9. Dezember 2025**: TypeScript Strict Mode, Monitoring Guides (OpenTelemetry, Sentry, Loki), HR & Finance Module Guides
- **7. Dezember 2025**: Dokumentations-Konsolidierung, README-Update
- **6. Dezember 2025**: Error-Handling, Database-Optimization, WebSocket-Dokumentation
- **5. Dezember 2025**: Search-Engine-Evaluation, Performance-Features
- **4. Dezember 2025**: API-Dokumentation, Developer-Onboarding, ADRs

---

**Feedback**: Haben Sie Verbesserungsvorschläge für die Dokumentation? Erstellen Sie ein Issue oder Pull Request!

**Maintainer**: Thomas Heisig  
**Letzte Aktualisierung**: 9. Dezember 2025
