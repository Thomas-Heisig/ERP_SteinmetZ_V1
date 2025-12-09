# ERP SteinmetZ - Aktive Issues

**Stand**: 7. Dezember 2025
**Version**: 0.3.0

Dieses Dokument listet alle **aktiven (offenen)** Probleme, Bugs und Technical Debt im Projekt auf.

> **Hinweis**: Behobene Issues wurden nach [ARCHIVE.md](ARCHIVE.md) verschoben.  
> 📊 **System-Status**: Siehe [docs/SYSTEM_STATUS.md](docs/SYSTEM_STATUS.md) für Gesamtübersicht

---

## 🟠 Hohe Priorität (Sollten bald behoben werden)

### ISSUE-008: Fehlende Monitoring & Observability 📊

**Status**: 🟡 In Arbeit | **Priorität**: Mittel | **Erstellt**: 2024-12-03 | **Aktualisiert**: 2025-12-09

**Beschreibung**:
Es gibt kein strukturiertes Logging, keine Metriken, kein Tracing, kein Error-Tracking.

**Fortschritt (9. Dezember 2025)**:

- ✅ **Structured Logging**: Vollständig implementiert mit Pino
  - Centralized Logger (`apps/backend/src/utils/logger.ts`)
  - Security Redaction (passwords, tokens, apiKeys)
  - Semantic Log Helpers (request, query, auth, performance, business, security)
  - 133+ console.log Statements zu structured logging migriert

- ✅ **Metrics (Basic Implementation)**: Grundlegende Metriken implementiert
  - MetricsService (`apps/backend/src/services/monitoring/metricsService.ts`)
  - Counters, Gauges, Histograms
  - Prometheus Export Format
  - JSON Export
  - Monitoring Router mit Endpoints (/api/monitoring/metrics, /health)
  - Umfassende Dokumentation (README.md)

**Noch ausstehend**:

- [ ] Prometheus Client Integration (prom-client)
- [ ] Grafana-Dashboards (Vorlagen existieren bereits)
- [ ] Custom Business-Metrics erweitern
- [ ] Alert-Rules definieren
- [ ] OpenTelemetry Integration (Tracing)
- [ ] Distributed Tracing (Jaeger/Zipkin)
- [ ] Sentry Integration (Error-Tracking)
- [ ] Log-Aggregation (ELK Stack / Loki)

**Aufwand**: 1-2 Wochen gesamt → ~30% erledigt (3-4 Tage)

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

### ISSUE-010: Console.logs im Production-Code 🐛

**Status**: 🟢 Weitgehend behoben | **Priorität**: Niedrig | **Erstellt**: 2024-12-03 | **Aktualisiert**: 2025-12-06

**Beschreibung**:
Viele console.log() Statements im Code, die in Production nicht sein sollten.

**Analyse (9. Dezember 2025)**:

- **Backend**: 45 console.log Statements (von ursprünglich 106, gestartet bei 171)
- **Frontend**: 9 console.log Statements (von ursprünglich 16)
- **Gesamt**: 54 Instanzen (von ursprünglich 177, ~70% Reduktion)

**Lösung (Phase 1 - Infrastruktur) ✅**:

1. ✅ ESLint-Rule aktiviert: `no-console: ["warn", { allow: ["warn", "error", "info"] }]`
2. ✅ Comprehensive Migration Guide erstellt: [CODE_QUALITY_IMPROVEMENTS.md](docs/CODE_QUALITY_IMPROVEMENTS.md)
3. ✅ Strukturierte Logging-Guidelines dokumentiert
4. ✅ Schrittweise Migration durchgeführt

**Phase 2 - Kritische Services ✅ (6. Dezember 2025)**:

1. ✅ Centralized Logger erstellt (`apps/backend/src/utils/logger.ts`)
2. ✅ index.ts migriert (41 console.log → structured logging)
3. ✅ dbService.ts migriert (28 console.log → structured logging)
4. ✅ elizaProvider.ts migriert (19 console.log → structured logging)
5. ✅ **Gesamt**: 88 console.log Statements in kritischen Services ersetzt

**Phase 3 - Backend Services ✅ (9. Dezember 2025)**:

1. ✅ migrateSchema.ts migriert (10 console.log → structured logging)
2. ✅ Sipgate Services komplett migriert:
   - ✅ SipgateClient.ts (5 console.log → structured logging)
   - ✅ CallHandler.ts (3 console.log → structured logging)
   - ✅ VoiceAI.ts (4 console.log → structured logging)
   - ✅ FaxProcessor.ts (3 console.log → structured logging)
3. ✅ aiAnnotatorService.ts migriert (5 console.log → structured logging)
4. ✅ Self-Healing Services migriert:
   - ✅ HealingReport.ts (3 console.log → structured logging)
   - ✅ SelfHealingScheduler.ts (12 console.log → structured logging)
5. ✅ **Gesamt Phase 3**: 45 console.log Statements ersetzt
6. ✅ **Gesamt kumulativ**: 133 console.log Statements ersetzt (~75% des Ziels)

**Nächste Schritte (Phase 4-5)**:

- [ ] Verbleibende Backend-Services migrieren (45 Instanzen)
- [ ] Frontend komplett migrieren (9 Instanzen)
- [ ] ESLint auf "error" hochstufen
- [ ] Pre-commit Hooks einrichten

**Betroffen**:

- Backend: `apps/backend/src/**/*.ts`
- Frontend: `apps/frontend/src/**/*.tsx`

**Auswirkung**: Performance (minimal), Security (Info-Leakage), Code-Qualität

**Aufwand**: ~8-10 Stunden verteilt über 3 Sprints

**Dokumentation**: [CODE_QUALITY_IMPROVEMENTS.md](docs/CODE_QUALITY_IMPROVEMENTS.md)

---

### ISSUE-011: Fehlende TypeScript Strict Mode ⚙️

**Status**: 🟡 Offen | **Priorität**: Niedrig | **Erstellt**: 2024-12-03

**Beschreibung**:
TypeScript läuft nicht im Strict-Mode. Viele potentielle Fehler werden nicht erkannt.

**Aktuelle Konfiguration**:

```json
{
  "strict": false,
  "noImplicitAny": false
}
```

**Empfohlen**:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "strictBindCallApply": true,
  "strictPropertyInitialization": true,
  "noImplicitThis": true,
  "alwaysStrict": true
}
```

**Herausforderung**: Würde hunderte Type-Errors produzieren, die alle behoben werden müssen.

**Aufwand**: 1-2 Wochen (schrittweise Migration)

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

**Status**: 🟢 Teilweise behoben | **Priorität**: Niedrig | **Erstellt**: 2024-12-03 | **Aktualisiert**: 2025-12-06

**Beschreibung**:
Es gibt kaum JSDoc-Kommentare oder Code-Dokumentation. Komplexe Funktionen sind nicht erklärt.

**Fortschritt** (2025-12-06):

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
6. ⏳ JSDoc für Services (laufend)
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
**Aufwand (verbleibend)**: 2-3 Tage für JSDoc und TypeDoc

---

## 🟢 Kleinere Issues & Verbesserungsvorschläge

_Alle kleineren Issues wurden behoben und nach [ARCHIVE.md](ARCHIVE.md) verschoben._

---

## 📊 Issue-Statistiken

### Nach Priorität

- 🟠 Hoch: 1 Issue (ISSUE-008: Monitoring)
- 🟡 Mittel: 5 Issues (2 weitgehend behoben, 3 offen)
- 🟢 Niedrig: 0 Issues (✅ alle erledigt und archiviert)

**Gesamt**: 6 aktive Issues | **Status**: 2 weitgehend behoben, 4 offen | **Archiviert**: 10 Issues (siehe [ARCHIVE.md](ARCHIVE.md))

### System-Status Übersicht

- ✅ **Build & Tests**: 100% erfolgreich (134/134 Tests bestanden)
- ✅ **Dependencies**: 0 Vulnerabilities
- ✅ **Operational**: System läuft stabil und fehlertolerant
- 🟡 **Verbesserungspotential**: Monitoring, TypeScript Strict Mode, Code-Dokumentation

### Nach Kategorie

- **Code-Quality**: 3 (ISSUE-010 teilweise, ISSUE-011, ISSUE-013 teilweise)
- **Monitoring**: 1 (ISSUE-008)
- **Dependencies**: 1 (ISSUE-009 weitgehend behoben)
- **Accessibility**: 1 (ISSUE-012)
- **Security**: ✅ Alle behoben (archiviert)
- **Developer Experience**: ✅ Alle behoben (archiviert)

### Geschätzter Gesamtaufwand

- **Hohe Priorität**: ✅ Komplett erledigt und archiviert!
- **Mittlere Priorität**: 1-2 Wochen verbleibend
- **Niedrige Priorität**: ✅ Komplett erledigt und archiviert!

**Gesamt**: ~1-2 Wochen für verbleibende 6 aktive Issues

**Kürzlich archiviert**:

- ✅ **ISSUE-005**: Inkonsistente Error-Responses - vollständig behoben (2025-12-07)
- ✅ **ISSUE-006**: Fehlende Input-Validierung - vollständig behoben (2025-12-07)
- ✅ **ISSUE-015**: Package.json Scripts - vollständig behoben (2025-12-06)
- ✅ **ISSUE-016**: Commit-Conventions - vollständig behoben (2025-12-06)

**Details siehe**: [ARCHIVE.md](ARCHIVE.md)

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

1. **ISSUE-008** (Monitoring & Observability) - Production-Readiness
2. **ISSUE-010** (Console.logs entfernen) - Code-Qualität (weitgehend behoben, Finalisierung ausstehend)
3. **ISSUE-011** (TypeScript Strict Mode) - Code-Qualität
4. **ISSUE-013** (Code-Dokumentation) - Developer Experience (teilweise behoben)
5. **ISSUE-012** (Accessibility) - Inklusion
6. **ISSUE-009** (Dependencies) - Wartung (weitgehend behoben)

---

**Letzte Aktualisierung**: 7. Dezember 2025  
**Maintainer**: Thomas Heisig  
**Nächster Review**: Januar 2026

**Siehe auch**:

- [ARCHIVE.md](ARCHIVE.md) - Behobene Issues und alte Changelogs
- [TODO.md](TODO.md) - Priorisierte Aufgabenliste
- [CHANGELOG.md](CHANGELOG.md) - Projekt-Changelog
