# ERP SteinmetZ - Aktive Issues

**Stand**: 17. Dezember 2025
**Version**: 0.3.0

Dieses Dokument listet alle **aktiven (offenen)** Probleme, Bugs und Technical Debt im Projekt auf.

> **Hinweis**: Behobene Issues wurden nach [ARCHIVE.md](../archive/ARCHIVE.md) verschoben.  
> 📊 **System-Status**: Siehe [../SYSTEM_STATUS.md](../SYSTEM_STATUS.md) für Gesamtübersicht

---

## 🟠 Hohe Priorität (Sollten bald behoben werden)

### ISSUE-008: Fehlende Monitoring & Observability 📊

**Status**: 🟢 Weitgehend behoben | **Priorität**: Mittel | **Erstellt**: 2024-12-03 | **Aktualisiert**: 2025-12-09 (Dokumentation vervollständigt)

**Beschreibung**:
Es gibt kein strukturiertes Logging, keine Metriken, kein Tracing, kein Error-Tracking.

**Fortschritt (9. Dezember 2025 - Dokumentation)**:

- ✅ **Structured Logging**: Vollständig implementiert mit Pino
  - Centralized Logger (`apps/backend/src/utils/logger.ts`)
  - Frontend Logger (`apps/frontend/src/utils/logger.ts`)
  - Security Redaction (passwords, tokens, apiKeys)
  - Semantic Log Helpers (request, query, auth, performance, business, security)
  - 160+ console.log Statements zu structured logging migriert
  - Backend: 73% Reduktion (45 → 12)
  - Frontend: 89% Reduktion (9 → 1)

- ✅ **Metrics (Professional Implementation)**: Vollständig implementiert mit prom-client
  - PrometheusMetricsService (`apps/backend/src/services/monitoring/prometheusMetricsService.ts`)
  - HTTP Metrics (requests, duration, errors)
  - Database Metrics (queries, duration, connections)
  - AI Metrics (requests, duration, tokens, cost)
  - Business Metrics (active users, sessions, events)
  - System Metrics (CPU, memory, Node.js default collectors)
  - Monitoring Router mit Prometheus und JSON Endpoints

- ✅ **Grafana-Dashboards**: Vollständig erstellt
  - Comprehensive Dashboard mit 13 Panels (`monitoring/grafana/erp-steinmetz-dashboard.json`)
  - HTTP Performance Monitoring
  - Database Performance Tracking
  - AI Usage und Cost Tracking
  - System Resource Monitoring
  - Business Metrics Visualization

- ✅ **Alert-Rules**: Vollständig definiert
  - 15 Alert Rules in 5 Kategorien (`monitoring/prometheus/alert-rules.yml`)
  - HTTP Alerts (error rate, latency)
  - Database Alerts (query performance, connections)
  - AI Alerts (cost, failures, latency)
  - System Alerts (CPU, memory, uptime)
  - Business Alerts (user activity, event failures)

- ✅ **Dokumentation**: Umfassende Setup-Anleitung
  - Prometheus und Grafana Setup (`monitoring/README.md`)
  - Konfiguration und Anpassung
  - Troubleshooting-Guide

- ✅ **Dokumentation**: Umfassende Setup-Anleitungen erstellt (9. Dezember 2025)
  - ✅ OpenTelemetry Integration Guide (docs/OPENTELEMETRY_SETUP.md)
    - Collector-Setup mit Docker Compose
    - Backend & Frontend Integration
    - Jaeger/Tempo Anbindung
    - Best Practices & Troubleshooting
  - ✅ Sentry Integration Guide (docs/SENTRY_INTEGRATION.md)
    - Backend & Frontend Setup
    - Source Maps Konfiguration
    - CI/CD Integration
    - Alert Rules & Dashboards
  - ✅ Log Aggregation Guide (docs/LOG_AGGREGATION.md)
    - Loki + Grafana (empfohlen)
    - ELK Stack Alternative
    - Cloud-Lösungen (Datadog, CloudWatch)
    - LogQL Queries & Best Practices

**Noch ausstehend (Implementation)**:

- [ ] OpenTelemetry Integration (Tracing) - Dokumentation vorhanden ✅
- [ ] Distributed Tracing (Jaeger/Zipkin) - Dokumentation vorhanden ✅
- [ ] Sentry Integration (Error-Tracking) - Dokumentation vorhanden ✅
- [ ] Log-Aggregation (ELK Stack / Loki) - Dokumentation vorhanden ✅

**Aufwand**: 1-2 Wochen gesamt → ~75% erledigt (Infrastruktur + Dokumentation)

**Dokumentation**:

- [Monitoring README](apps/backend/src/services/monitoring/README.md)
- [CODE_QUALITY_IMPROVEMENTS.md](docs/CODE_QUALITY_IMPROVEMENTS.md)

---

## 🟡 Moderate Issues (Technical Debt)

### ISSUE-009: Ungenutzte Dependencies 📦

**Status**: 🟢 Weitgehend behoben | **Priorität**: Niedrig | **Erstellt**: 2024-12-03 | **Aktualisiert**: 2025-12-06

**Beschreibung**:
Mehrere Dependencies sind installiert, werden aber nicht genutzt oder sind veraltet.

**Analyse durchgeführt (5. Dezember 2024)**:

- `monaco-editor` → **WIRD VERWENDET** in `apps/frontend/src/components/FunctionsCatalog/features/code/`
- Keine offensichtlich ungenutzten Dependencies gefunden

**Fortschritt (6. Dezember 2025)**:

- ✅ npm audit durchgeführt und alle 3 Vulnerabilities behoben (body-parser, js-yaml, jws)
- ✅ Deprecated packages identifiziert (npmlog, gauge, fluent-ffmpeg, etc.)
- ✅ ESLint v9 Migration durchgeführt mit aktuellen Paketen
- ✅ 0 Vulnerabilities im aktuellen Stand

**Empfehlung**:

- Regelmäßige Dependency-Audits mit `npm list`
- `npm audit` für Security-Vulnerabilities (✅ durchgeführt)
- Update auf neueste Versionen wo möglich
- Deprecated packages evaluieren für zukünftige Migration

**Auswirkung**: Bundle-Size, Security-Vulnerabilities (✅ behoben)

**Aufwand**: 2-3 Stunden → 1 Stunde erledigt

---

### ISSUE-012: Fehlende Accessibility (a11y) ♿

**Status**: 🟡 Offen | **Priorität**: Niedrig | **Erstellt**: 2024-12-03

**Beschreibung**:
Die Anwendung ist nicht barrierefrei. Fehlen von ARIA-Labels, Keyboard-Navigation ist unvollständig, Screen-Reader-Support fehlt.

**Probleme**:

- Fehlende ARIA-Labels auf interaktiven Elementen
- Nicht alle Komponenten keyboard-navigable
- Unzureichende Focus-Styles
- Kontrast-Verhältnisse teilweise zu niedrig
- Keine Skip-Links

**Lösungsansatz**:

1. react-axe im Development-Mode
2. Lighthouse Audits durchführen
3. Systematisch ARIA-Attribute hinzufügen
4. Keyboard-Navigation testen und fixen
5. WCAG 2.1 AA als Ziel

**Auswirkung**: Schließt Nutzer mit Behinderungen aus

**Aufwand**: 2-3 Tage

---

### ISSUE-013: Keine Code-Dokumentation 📖

**Status**: 🟡 In Arbeit (Phase 1 begonnen) | **Priorität**: Niedrig | **Erstellt**: 2024-12-03 | **Aktualisiert**: 2025-12-09

**Beschreibung**:
Es gibt kaum JSDoc-Kommentare oder Code-Dokumentation. Komplexe Funktionen sind nicht erklärt.

**Fortschritt** (2025-12-09):

1. ✅ Umfassende Dokumentation für wichtige Module:
   - ✅ ERROR_HANDLING.md - Standardisiertes Error-Handling-System
   - ✅ DATABASE_OPTIMIZATION.md - DB-Performance und Optimierung
   - ✅ WEBSOCKET_REALTIME.md - WebSocket und Real-Time Features
2. ✅ HR-Modul vollständig dokumentiert mit Error-Handling-Beispielen
3. ✅ Finance-Modul vollständig dokumentiert mit Error-Handling-Beispielen
4. ✅ API-Dokumentation mit OpenAPI 3.0 Spec
5. ✅ Router-Dokumentation vervollständigt:
   - ✅ Auth Router (README.md) - Authentication & Authorization
   - ✅ Calendar Router (README.md) - Calendar & Event Management
   - ✅ Diagnostics Router (README.md) - System Diagnostics
   - ✅ Innovation Router (README.md) - Innovation Management
   - ✅ QuickChat Router (README.md) - AI Chat Assistant
6. 🔄 JSDoc für Services (Phase 1 begonnen - 9. Dez 2025)
   - ✅ AuthService: Vollständige JSDoc (7 Methoden: init, register, login, logout, validateToken, refreshToken, createSession)
   - ✅ errorHandler Middleware: Umfassende Dokumentation mit Response-Format-Beispielen
   - ✅ asyncHandler Middleware: Best-Practice-Beispiele für async error handling
   - ⏳ Verbleibende Services (~17): dbService, websocketService, redisService, etc.
7. ⏳ Inline-Comments für komplexe Logik (laufend)

**Betroffen** (verbleibend):

- Komplexe Utilities (teilweise)
- Weitere Router-Module (systemInfo - hat bereits docs/README.md)
- Resilience-Patterns (dokumentiert in ARCHITECTURE.md)

**Lösungsansatz**:

1. ✅ README in komplexen Modulen
2. ✅ Umfassende Guides für Kern-Features
3. ⏳ JSDoc für alle öffentlichen Functions/Classes
4. ⏳ TypeDoc für API-Dokumentation generieren

**Auswirkung**: Wesentlich verbesserte Einarbeitung neuer Entwickler

**Aufwand (ursprünglich)**: Laufend  
**Aufwand (bereits investiert)**: 2.5 Stunden (Infrastruktur + Phase 1 Start)  
**Aufwand (verbleibend)**: 8-12 Stunden für vollständige JSDoc-Migration

---

## 🟢 Kleinere Issues & Verbesserungsvorschläge

_Alle kleineren Issues wurden behoben und nach [ARCHIVE.md](../archive/ARCHIVE.md) verschoben._

---

## 📊 Issue-Statistiken

### Nach Priorität

- 🟠 Hoch: 1 Issue (ISSUE-008: Monitoring - weitgehend behoben)
- 🟡 Mittel: 2 Issues (ISSUE-009 weitgehend behoben, ISSUE-012, ISSUE-013 teilweise)
- 🟢 Niedrig: 0 Issues - Alle erledigt! ✅

**Gesamt**: 3 aktive Issues | **Status**: 1 weitgehend behoben, 2 in Arbeit | **Archiviert**: 14 Issues (siehe [ARCHIVE.md](../archive/ARCHIVE.md))

### System-Status Übersicht

- ✅ **Build & Tests**: 100% erfolgreich (152/152 Tests bestanden) - aktualisiert 17.12.2025
- ✅ **Dependencies**: 0 Vulnerabilities
- ✅ **TypeScript Strict Mode**: Backend und Frontend vollständig funktional - aktualisiert 17.12.2025
- ✅ **Console.logs**: 93% Reduktion, Pre-commit Hook aktiv
- ✅ **Code Quality**: SonarQube konfiguriert, ESLint v9 aktiv
- ✅ **Dashboard & Sidebar**: Erweitert mit neuen Widgets und Features - NEU 17.12.2025
- ✅ **Operational**: System läuft stabil und fehlertolerant
- 🟡 **Verbesserungspotential**: Monitoring-Erweiterung, Code-Dokumentation (JSDoc)

### Nach Kategorie

- **Code-Quality**: 1 (ISSUE-013 teilweise - JSDoc Phase 1 begonnen)
- **Monitoring**: 1 (ISSUE-008 - 75% fertig, Hauptziele erreicht)
- **Dependencies**: 1 (ISSUE-009 - weitgehend behoben)
- **Accessibility**: 0 (ISSUE-012 - grundlegende Features implementiert, weitere Tests empfohlen)
- **Console.logs**: ✅ Alle behoben (ISSUE-010 archiviert)
- **TypeScript Strict**: ✅ Alle behoben (ISSUE-011 archiviert)
- **Security**: ✅ Alle behoben (archiviert)
- **Developer Experience**: ✅ Alle behoben (archiviert)

### Geschätzter Gesamtaufwand

- **Hohe Priorität**: ✅ Komplett erledigt und archiviert!
- **Mittlere Priorität**: 1 Woche verbleibend (Monitoring-Erweiterung, JSDoc-Vervollständigung)
- **Niedrige Priorität**: ✅ Komplett erledigt und archiviert!

**Gesamt**: ~1 Woche für verbleibende 3 aktive Issues (1 weitgehend fertig)

**Kürzlich verbessert (17. Dezember 2025)**:

- ✅ **TypeScript Strict Mode**: Letzter verbleibender Fehler in aiAnnotatorRouter.ts behoben
- ✅ **Dashboard Enhancement**: 2 neue Widgets hinzugefügt (RecentActivities, StatsOverview)
- ✅ **Sidebar Enhancement**: 3 neue Sektionen hinzugefügt (Quick Actions, Recent Items, System Status)
- ✅ **Backend APIs**: 3 neue Dashboard-Endpoints implementiert
- ✅ **Tests**: Alle 152 Tests bestehen (102 Backend + 50 Frontend)
- ✅ **Dokumentation**: ENHANCEMENT_SUMMARY_2025_12_17.md erstellt

**Details siehe**: [docs/ENHANCEMENT_SUMMARY_2025_12_17.md](docs/ENHANCEMENT_SUMMARY_2025_12_17.md)

**Kürzlich archiviert (9. Dezember 2025)**:

- ✅ **ISSUE-010**: Console.logs im Production-Code - vollständig behoben (2025-12-09)
- ✅ **ISSUE-011**: TypeScript Strict Mode - vollständig behoben (2025-12-09)
- ✅ **ISSUE-005**: Inkonsistente Error-Responses - vollständig behoben (2025-12-07)
- ✅ **ISSUE-006**: Fehlende Input-Validierung - vollständig behoben (2025-12-07)
- ✅ **ISSUE-015**: Package.json Scripts - vollständig behoben (2025-12-06)
- ✅ **ISSUE-016**: Commit-Conventions - vollständig behoben (2025-12-06)

**Details siehe**: [ARCHIVE.md](../archive/ARCHIVE.md)

---

## 🔧 Issue-Management-Prozess

### Issue-Labels

- `high-priority` - Sollte bald behoben werden
- `bug` - Funktionalität funktioniert nicht wie erwartet
- `enhancement` - Verbesserung bestehender Features
- `technical-debt` - Code-Quality-Probleme
- `security` - Sicherheitsrelevant
- `documentation` - Fehlende/fehlerhafte Doku

### Workflow

1. **New Issue** → Beschreibung, Priorität, Aufwand-Schätzung
2. **Triaging** → Validierung, Priorität bestätigen
3. **In Progress** → Entwickler zugewiesen
4. **Review** → Code-Review, Testing
5. **Done** → Deployed, dokumentiert, nach ARCHIVE.md verschoben

### Reporting

Issues werden monatlich reviewed und nach Priorität neu bewertet.

---

## 📝 Nächste Schritte

### Empfohlene Reihenfolge

1. **ISSUE-008** (Monitoring & Observability) - Production-Readiness Implementation
2. **ISSUE-013** (Code-Dokumentation) - JSDoc Phase 2-3 Migration
3. **ISSUE-009** (Dependencies) - Wartung und Updates

**Hinweis**: ISSUE-010 (Console.logs) und ISSUE-011 (TypeScript Strict Mode) wurden erfolgreich abgeschlossen und archiviert.

---

**Letzte Aktualisierung**: 14. Dezember 2025  
**Maintainer**: Thomas Heisig  
**Nächster Review**: Januar 2026

**Siehe auch**:

- [ARCHIVE.md](../archive/ARCHIVE.md) - Behobene Issues und alte Changelogs (12 Issues archiviert)
- [TODO.md](TODO.md) - Priorisierte Aufgabenliste
- [CHANGELOG.md](../../CHANGELOG.md) - Projekt-Changelog
- [../SYSTEM_STATUS.md](../SYSTEM_STATUS.md) - Vollständiger System-Status
