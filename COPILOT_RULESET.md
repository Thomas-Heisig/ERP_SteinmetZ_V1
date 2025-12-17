# Copilot Ruleset – ERP SteinmetZ

**Version:** 1.0.0  
**Stand:** Dezember 2025  
**Gültigkeit:** Alle automatischen Codevorschläge und Entwicklungsabläufe

---

## Zielsetzung

Dieses Repository soll **stabil, nachvollziehbar und wartbar** bleiben. Änderungen müssen sauber implementiert, dokumentiert und überprüfbar sein. Das Frontend soll ein konsistentes Erscheinungsbild aufweisen, das System soll fehlertolerant arbeiten, und das Logging soll klar strukturiert sein.

---

## 1. Aufgabenbearbeitung

### 1.1 TODO und ISSUES

**Grundprinzipien:**

- Bearbeite jeweils den nächsten offenen Punkt aus [TODO.md](TODO.md).
- Arbeite die Einträge aus [ISSUES.md](ISSUES.md) ab, sofern sie technisch nachvollziehbar sind.
- Markiere erledigte Punkte und verschiebe sie in die jeweils vorgesehenen Bereiche (z. B. [ARCHIVE.md](ARCHIVE.md), [CHANGELOG.md](CHANGELOG.md)).
- Aktualisiere anschließend die [TODO.md](TODO.md) und [ISSUES.md](ISSUES.md).

**Workflow:**

1. **Vor Beginn**: Prüfe die aktuelle Priorität in TODO.md (🔴 Kritisch > 🟠 Hoch > 🟡 Mittel > 🟢 Niedrig)
2. **Während der Arbeit**: Halte den Status in TODO.md aktuell (✅ für erledigt)
3. **Nach Abschluss**:
   - Aktualisiere CHANGELOG.md mit einer aussagekräftigen Beschreibung
   - Verschiebe behobene Issues nach ARCHIVE.md
   - Entferne erledigte Einträge oder markiere sie als abgeschlossen

**Issue-Management:**

- Jedes Issue benötigt: Status, Priorität, Beschreibung, Aufwand-Schätzung
- Bei Abschluss: Issue mit Datum und Lösung dokumentieren
- Referenziere verwandte PRs und Commits

---

## 2. Dokumentation

### 2.1 Ergänzung der Dokumentation

**Standards:**

- Ergänze fehlende Dokumentationsabschnitte an Stellen, an denen Funktionen, Module oder Schnittstellen unvollständig beschrieben sind.
- Halte die Beschreibung sachlich, strukturiert und nachvollziehbar.
- Füge alle notwendigen Dateien hinzu, wenn sie für Funktion, Build, Tests oder Dokumentation relevant sind.

**Dokumentationsstruktur:**

Folge dem **Diátaxis Framework**:

- **Tutorials** (`docs/tutorials/`): Lernorientierte Schritt-für-Schritt-Anleitungen
- **How-To Guides** (`docs/how-to/`): Problemorientierte praktische Anleitungen
- **Reference** (`docs/reference/`): Informationsorientierte technische Spezifikationen
- **Explanation** (`docs/explanation/`): Verständnisorientierte konzeptionelle Inhalte

**Dokumentations-Anforderungen:**

- Jedes neue Modul benötigt mindestens ein README.md im Modul-Verzeichnis
- API-Änderungen müssen in der entsprechenden API-Dokumentation reflektiert werden
- Komplexe Entscheidungen werden als Architecture Decision Record (ADR) in `docs/adr/` dokumentiert
- Code-Kommentare für komplexe Logik (TSDoc/JSDoc-Format)

**Code-Dokumentation:**

````typescript
/**
 * Beschreibung der Funktion
 * @param paramName - Beschreibung des Parameters
 * @returns Beschreibung des Rückgabewerts
 * @throws {ErrorType} Beschreibung wann dieser Fehler geworfen wird
 * @example
 * ```typescript
 * const result = functionName(param);
 * ```
 */
````

---

## 3. Code-Sauberkeit und Struktur

### 3.1 Entfernen nicht benötigter Elemente

**Vorsichtsprinzip:**

- Entferne nur solche Komponenten, die nach einer sachlichen Prüfung eindeutig als überflüssig gelten.
- Vermeide Eingriffe, deren Folgen nicht sicher bestimmt werden können.
- Führe vor dem Löschen eine Impact-Analyse durch (Suche nach Abhängigkeiten).

**Prüfkriterien:**

1. Wird der Code irgendwo importiert? (`grep -r "import.*ComponentName"`)
2. Gibt es Tests, die diesen Code verwenden?
3. Ist er in der Dokumentation erwähnt?
4. Könnte er zukünftig benötigt werden?

**Bei Unsicherheit:**

- Verschiebe Code nach `ARCHIVE.md` oder in ein `deprecated/` Verzeichnis
- Markiere ihn mit `@deprecated` Annotation
- Plane die Entfernung für ein zukünftiges Release

### 3.2 Systemanalyse

**Kontinuierliche Verbesserung:**

- Prüfe Abhängigkeiten, Schnittstellen, Fehlerpfade und doppelte Strukturen.
- Überarbeite Code, wenn sich unnötige Komplexität oder wiederholte Muster ergeben.
- Achte darauf, dass das Gesamtsystem nach Änderungen weiterhin lauffähig bleibt.

**Refactoring-Richtlinien:**

1. **DRY (Don't Repeat Yourself)**: Vermeide Code-Duplikation
2. **SOLID-Prinzipien**: Single Responsibility, Open/Closed, etc.
3. **KISS (Keep It Simple, Stupid)**: Bevorzuge einfache Lösungen
4. **YAGNI (You Aren't Gonna Need It)**: Implementiere nur, was aktuell benötigt wird

**Qualitätssicherung:**

- Führe nach größeren Änderungen `npm run build` aus
- Führe Tests aus: `npm test`
- Prüfe mit Linter: `npm run lint`
- Validiere TypeScript-Typen
- Generiere Coverage-Reports: `npm run test:coverage`
- Überprüfe SonarQube-Metriken auf Code-Qualität und Sicherheit

**Code-Qualitätsstandards:**

- **Coverage**: Mindestens 80% Gesamtabdeckung, 90% für neue Funktionen
- **SonarQube Quality Gate**: Muss grün sein (keine Blocker/Critical Issues)
- **Technical Debt**: Soll unter 5% bleiben (Maintainability Rating A)
- **Security**: Keine Vulnerabilities (Security Rating A)
- **Duplication**: Weniger als 3% Code-Duplikation

Siehe [SonarQube Integration Guide](docs/SONARQUBE.md) für Details.

---

## 4. Frontend-Einbindung

### 4.1 Integration neuer Komponenten

**Standards:**

- Binde neue Funktionen oder Module sauber und vollständig ins Frontend ein.
- Achte auf ein einheitliches Erscheinungsbild und konsistente Benennungen.
- Prüfe unterschiedliche Darstellungsvarianten, sofern dies für die Nutzeroberfläche relevant ist.

**Theme-System:**

- Verwende CSS-Variablen aus `apps/frontend/src/styles/theme/`
- Unterstütze alle Themes: Light, Dark, LCARS, High Contrast
- Teste Komponenten in allen Theme-Varianten

**Responsive Design:**

- Nutze die definierten Breakpoints:
  - Mobile: 320px, 640px
  - Tablet: 768px, 1024px
  - Desktop: 1280px, 1536px
- Touch-Targets mindestens 44px × 44px
- Teste auf verschiedenen Bildschirmgrößen

**Komponentenstruktur:**

```tree
apps/frontend/src/components/
├── ui/              # Wiederverwendbare UI-Komponenten
├── features/        # Feature-spezifische Komponenten
└── pages/           # Top-Level Page-Komponenten
```

**Naming Conventions:**

- Komponenten: PascalCase (`MyComponent.tsx`)
- Hooks: camelCase mit "use" Prefix (`useMyHook.ts`)
- Utilities: camelCase (`formatDate.ts`)
- Types: PascalCase (`MyType.ts` oder in `types.ts`)

**Internationalisierung:**

- Alle UI-Texte müssen übersetzbar sein
- Verwende `react-i18next` für Übersetzungen
- Füge Übersetzungen in alle 7 Sprachen hinzu (DE, EN, ES, FR, IT, PL, TR)
- Beispiel: `{t('common.save')}` statt `"Speichern"`

---

## 5. Fehlertoleranz und Logging

### 5.1 Fehlerbehandlung

**Prinzipien:**

- Ergänze oder verbessere Fehlerbehandlungen nur auf Grundlage nachvollziehbarer Hinweise.
- Vermeide unklare oder redundante Fehlerreaktionen.
- Verwende standardisierte Error-Responses (siehe `docs/ERROR_HANDLING.md`).

**Backend Error-Handling:**

Verwende die standardisierten APIError-Klassen:

```typescript
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "../middleware/errors/apiErrors";

// Beispiel
if (!resource) {
  throw new NotFoundError("Resource not found", { resourceId: id });
}
```

**Standardisiertes Error-Response-Format:**

```typescript
{
  success: false,
  error: {
    code: "NOT_FOUND",
    message: "Resource not found",
    details?: any,
    timestamp: "2025-12-06T14:00:00Z",
    path: "/api/resource/123"
  }
}
```

**Input-Validierung:**

- Verwende Zod-Schemas für alle Request-Bodies
- Validiere vor der Verarbeitung
- Gib klare Validierungsfehler zurück

```typescript
import { z } from "zod";
import { validate } from "../middleware/validate";

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

router.post("/users", validate(createUserSchema), async (req, res) => {
  // req.body ist garantiert valide
});
```

**Frontend Error-Handling:**

- Verwende Error Boundaries für React-Komponenten
- Zeige benutzerfreundliche Fehlermeldungen
- Logge technische Details für Debugging

### 5.2 Logging

**Strukturiertes Logging:**

- Stelle sicher, dass Logmeldungen strukturiert, reserviert und nachvollziehbar sind.
- Entferne überflüssige Logeinträge.
- Dokumentiere relevante Fehlerereignisse und Systemzustände.

**Backend Logging:**

Verwende Pino für strukturiertes Logging:

```typescript
import logger from "../utils/logger";

// Info-Level für normale Operationen
logger.info({ userId, action: "login" }, "User logged in");

// Warn-Level für potentielle Probleme
logger.warn({ endpoint, duration }, "Slow API response");

// Error-Level für Fehler
logger.error({ err, context }, "Operation failed");
```

**Log-Levels:**

- `trace`: Sehr detaillierte Debug-Informationen
- `debug`: Debug-Informationen für Entwicklung
- `info`: Normale Operationen und wichtige Events
- `warn`: Warnungen über potentielle Probleme
- `error`: Fehler, die behandelt werden müssen
- `fatal`: Kritische Fehler, die zum Absturz führen

**Logging-Richtlinien:**

- **KEINE** `console.log()` in Production-Code (siehe CODE_QUALITY_IMPROVEMENTS.md)
- Verwende strukturierte Logging-Objekte statt String-Konkatenation
- Logge niemals sensible Daten (Passwörter, Tokens, PII)
- Füge Kontext hinzu (User-ID, Request-ID, etc.)
- Verwende passende Log-Levels

**Frontend Logging:**

- Development: `console.info()`, `console.warn()`, `console.error()` erlaubt
- Production: Verwende einen Error-Tracking-Service (z.B. Sentry)
- Logge User-Aktionen für Analytics (anonymisiert)

---

## 6. Arbeitsweise

### 6.1 Vorgehensprinzipien

**Grundsätze:**

- Arbeite in kleinen, klar dokumentierten Schritten.
- Begründe Entscheidungen kurz, wenn mehrere Möglichkeiten bestehen.
- Priorisiere Stabilität und Nachvollziehbarkeit.
- Führe nur solche Änderungen durch, deren Wirkung belegbar geprüft werden kann.

**Entwicklungszyklus:**

1. **Verstehen**
   - Lese die Anforderung vollständig
   - Prüfe betroffene Module und Abhängigkeiten
   - Kläre Unklarheiten vor dem Start

2. **Planen**
   - Skizziere die Lösung
   - Identifiziere betroffene Dateien
   - Schätze den Aufwand realistisch ein

3. **Implementieren**
   - Kleine, fokussierte Commits
   - Aussagekräftige Commit-Messages (siehe unten)
   - Regelmäßig testen während der Entwicklung

4. **Testen**
   - Unit-Tests für neue Funktionen
   - Integration-Tests für API-Änderungen
   - Manuelle Tests für UI-Änderungen
   - Regression-Tests für kritische Pfade
   - Coverage-Reports generieren: `npm run test:coverage`
   - SonarQube Quality Gates überprüfen

5. **Dokumentieren**
   - Code-Kommentare für komplexe Logik
   - README-Updates bei neuen Features
   - API-Dokumentation bei Endpoint-Änderungen
   - CHANGELOG.md aktualisieren

6. **Review**
   - Selbst-Review: Code nochmal durchgehen
   - Peer-Review anfordern
   - Feedback einarbeiten

**Commit-Messages:**

Folge den Conventional Commits:

```text
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: Neue Funktion
- `fix`: Bugfix
- `docs`: Dokumentation
- `style`: Formatierung, kein Code-Change
- `refactor`: Code-Umstrukturierung ohne Funktionsänderung
- `perf`: Performance-Verbesserung
- `test`: Tests hinzufügen oder ändern
- `build`: Build-System oder Dependencies
- `ci`: CI-Konfiguration
- `chore`: Wartungsarbeiten

**Beispiele:**

```text
feat(hr): add employee time tracking endpoint
fix(frontend): resolve theme toggle bug in dark mode
docs(api): update finance module documentation
refactor(backend): simplify error handling middleware
```

**Branch-Strategie:**

- `main`: Produktionsreife Releases
- `develop`: Entwicklungsbranch (falls verwendet)
- `feature/*`: Feature-Branches
- `fix/*`: Bugfix-Branches
- `docs/*`: Dokumentations-Branches

**Pull Requests:**

- Beschreibende Titel
- Ausführliche Beschreibung der Änderungen
- Referenziere verwandte Issues
- Screenshots für UI-Änderungen
- Checklist für Reviewer

---

## 7. Code-Qualität und Standards

### 7.1 TypeScript

**Typ-Sicherheit:**

- Verwende explizite Typen, vermeide `any`
- Definiere Interfaces für komplexe Objekte
- Nutze Union-Types und Type Guards
- Dokumentiere Types mit TSDoc

**Best Practices:**

```typescript
// ✅ Gut: Explizite Typen
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User | null {
  // Implementation
}

// ❌ Schlecht: Implizite any
function getData(param) {
  return param.value;
}
```

### 7.2 Testing

**Test-Anforderungen:**

- Neue Features benötigen Tests (Mindest-Coverage: 80%)
- Bugfixes benötigen Regression-Tests
- Kritische Funktionen: Mindest-Coverage 90%

**Test-Struktur:**

```typescript
describe("ComponentName", () => {
  describe("methodName", () => {
    it("should do something", () => {
      // Arrange
      const input = setupTest();

      // Act
      const result = methodName(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

**Test-Commands:**

```bash
npm test              # Alle Tests
npm test:backend      # Nur Backend
npm test:frontend     # Nur Frontend
npm test:coverage     # Mit Coverage-Report
```

### 7.3 Performance

**Optimierungen:**

- Verwende React.memo für teure Komponenten
- useMemo/useCallback für aufwändige Berechnungen
- Lazy Loading für große Komponenten
- Code-Splitting für bessere Ladezeiten

**Monitoring:**

- Query-Performance überwachen (< 100ms Ziel)
- API-Response-Zeiten tracken
- Frontend-Performance: Lighthouse Score > 90

---

## 8. Sicherheit

### 8.1 Security Best Practices

**Input-Validierung:**

- Validiere alle User-Inputs (Client- und Server-seitig)
- Verwende Zod für Type-safe Validierung
- Sanitize Inputs gegen XSS

**Authentifizierung & Autorisierung:**

- JWT-Tokens für API-Authentifizierung
- RBAC (Role-Based Access Control) für Berechtigungen
- Rate-Limiting für sensible Endpoints

**Datenschutz:**

- Keine sensiblen Daten in Logs
- Verschlüsselte Speicherung von Credentials
- GDPR-Compliance beachten

**Dependencies:**

- Regelmäßige Sicherheitsupdates (`npm audit`)
- Keine bekannten Vulnerabilities in Production
- Lock-Files committen (`package-lock.json`)

---

## 9. Standards und Compliance

### 9.1 Internationale Standards

Dieses Projekt folgt folgenden Standards:

**Code-Qualität:**

- ISO/IEC 25010 - Software-Qualitätsmodell
- SOLID-Prinzipien
- Clean Code Practices

**API-Design:**

- OpenAPI 3.0 - API-Spezifikation
- RESTful API Principles
- JSON:API Standard (wo anwendbar)

**Dokumentation:**

- ISO/IEC/IEEE 26514 - User Documentation Design
- Diátaxis Framework - Documentation Structure

**Versionierung:**

- Semantic Versioning 2.0.0
- Keep a Changelog 1.0.0
- Conventional Commits 1.0.0

**Compliance:**

- GDPR (DSGVO) - Datenschutz
- GoBD - Buchführungsrichtlinien (geplant)
- ISO 27001 - Informationssicherheit (Vorbereitung)

### 9.2 Projekt-spezifische Standards

**Dateistruktur:**

- Backend: `apps/backend/src/`
- Frontend: `apps/frontend/src/`
- Shared: `src/` (z.B. Resilience-Patterns)
- Docs: `docs/`

**Naming Conventions:**

- Dateien: kebab-case (`my-component.tsx`)
- Komponenten: PascalCase (`MyComponent`)
- Variablen/Funktionen: camelCase (`myFunction`)
- Konstanten: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- Types/Interfaces: PascalCase (`UserType`, `ApiResponse`)

---

## 10. Ressourcen und Weiterführende Dokumentation

### 10.1 Projektdokumentation

- [README.md](README.md) - Projekt-Übersicht
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution Guidelines
- [TODO.md](TODO.md) - Aufgabenliste mit Prioritäten
- [ISSUES.md](ISSUES.md) - Aktive Issues
- [CHANGELOG.md](CHANGELOG.md) - Projekt-Changelog
- [ARCHIVE.md](ARCHIVE.md) - Behobene Issues und alte Changelogs

### 10.2 Technische Dokumentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System-Architektur
- [docs/ERROR_HANDLING.md](docs/ERROR_HANDLING.md) - Error-Handling-System
- [docs/DATABASE_OPTIMIZATION.md](docs/DATABASE_OPTIMIZATION.md) - DB-Optimierung
- [docs/WEBSOCKET_REALTIME.md](docs/WEBSOCKET_REALTIME.md) - WebSocket & Real-Time
- [docs/DEVELOPER_ONBOARDING.md](docs/DEVELOPER_ONBOARDING.md) - Developer Setup
- [docs/CODE_CONVENTIONS.md](docs/CODE_CONVENTIONS.md) - Coding Standards

### 10.3 API-Dokumentation

- [docs/api/README.md](docs/api/README.md) - API-Dokumentation Hub
- [docs/api/openapi.yaml](docs/api/openapi.yaml) - OpenAPI 3.0 Spezifikation
- [docs/api/postman-collection.json](docs/api/postman-collection.json) - Postman Collection

### 10.4 Module-spezifische Dokumentation

- [apps/backend/src/routes/hr/docs/](apps/backend/src/routes/hr/docs/) - HR-Modul
- [apps/backend/src/routes/finance/docs/](apps/backend/src/routes/finance/docs/) - Finance-Modul
- [apps/backend/src/routes/ai/docs/](apps/backend/src/routes/ai/docs/) - AI-Modul
- [apps/frontend/FRONTEND_STRUCTURE.md](apps/frontend/FRONTEND_STRUCTURE.md) - Frontend-Architektur
- [apps/frontend/THEME_SYSTEM.md](apps/frontend/THEME_SYSTEM.md) - Theme-System

---

## 11. Checkliste für neue Features

Bevor ein Feature als "fertig" gilt, prüfe:

### Code

- [ ] Code folgt den Projekt-Standards
- [ ] TypeScript-Typen sind vollständig definiert
- [ ] Keine `any`-Types (außer begründete Ausnahmen)
- [ ] Error-Handling ist implementiert
- [ ] Input-Validierung ist vorhanden
- [ ] Keine `console.log` in Production-Code
- [ ] Code ist kommentiert (komplexe Logik)

### Tests

- [ ] Unit-Tests geschrieben (Coverage > 80%)
- [ ] Integration-Tests vorhanden (bei API-Änderungen)
- [ ] Manuelle Tests durchgeführt
- [ ] Alle Tests bestehen (`npm test`)
- [ ] Build ist erfolgreich (`npm run build`)
- [ ] Lint-Check ist erfolgreich (`npm run lint`)

### Dokumentation

- [ ] Code ist mit TSDoc/JSDoc dokumentiert
- [ ] README aktualisiert (falls relevant)
- [ ] API-Dokumentation aktualisiert (bei API-Änderungen)
- [ ] CHANGELOG.md aktualisiert
- [ ] TODO.md/ISSUES.md aktualisiert

### Frontend (falls relevant)

- [ ] Alle Themes unterstützt (Light, Dark, LCARS, Contrast)
- [ ] Responsive Design (Mobile, Tablet, Desktop)
- [ ] Internationalisierung (alle 7 Sprachen)
- [ ] Accessibility (ARIA-Labels, Keyboard-Navigation)
- [ ] Loading States implementiert
- [ ] Error Boundaries vorhanden

### Backend (falls relevant)

- [ ] API-Endpoints validieren Input (Zod)
- [ ] Standardisiertes Error-Response-Format
- [ ] Logging implementiert (Pino)
- [ ] Rate-Limiting konfiguriert (bei Bedarf)
- [ ] CORS korrekt konfiguriert
- [ ] Health-Checks aktualisiert (bei Bedarf)

### Sicherheit

- [ ] Input-Validierung (Client + Server)
- [ ] Keine sensiblen Daten in Logs
- [ ] Keine bekannten Security-Vulnerabilities (`npm audit`)
- [ ] Authentication/Authorization geprüft

### Performance

- [ ] API-Response-Zeit < 100ms (95th percentile)
- [ ] Frontend Lighthouse Score > 90
- [ ] Keine N+1-Queries
- [ ] Lazy Loading verwendet (bei großen Komponenten)

### Review

- [ ] Selbst-Review durchgeführt
- [ ] Peer-Review angefordert
- [ ] Feedback eingearbeitet
- [ ] PR-Beschreibung vollständig

---

## Anhang: Varianten und Anpassungen

### A.1 Kurzversion für README

Für eine Kurzfassung in der README kann folgender Abschnitt eingefügt werden:

```markdown
## 📋 Entwicklungsrichtlinien

Dieses Projekt folgt dem [Copilot Ruleset](COPILOT_RULESET.md) für konsistente Entwicklung:

- **Aufgabenbearbeitung**: Arbeite TODO.md und ISSUES.md systematisch ab
- **Dokumentation**: Halte Docs aktuell und strukturiert (Diátaxis Framework)
- **Code-Qualität**: Clean Code, SOLID-Prinzipien, TypeScript Strict Mode
- **Testing**: Mindest-Coverage 80%, alle Tests müssen bestehen
- **Standards**: OpenAPI 3.0, Semantic Versioning, Conventional Commits

Siehe [CONTRIBUTING.md](CONTRIBUTING.md) für Details zum Beitragsprozess.
```

### A.2 GitHub-spezifische Version

Eine `.github/COPILOT.md` könnte für GitHub Copilot spezifische Hinweise enthalten:

```markdown
# GitHub Copilot Konfiguration

Diese Datei enthält Kontext für GitHub Copilot zur Unterstützung der Entwicklung.

## Projekt-Kontext

- ERP-System für Steinmetz-Betriebe
- Stack: React 19, Express 5, TypeScript, SQLite/PostgreSQL
- Standards: OpenAPI 3.0, GDPR-Compliance, GoBD-Vorbereitung

## Coding-Standards

- Verwende TypeScript mit expliziten Typen
- Error-Handling mit standardisierten APIError-Klassen
- Input-Validierung mit Zod
- Logging mit Pino (Backend) statt console.log
- Testing mit Vitest

## Ressourcen

Siehe [COPILOT_RULESET.md](../COPILOT_RULESET.md) für vollständige Richtlinien.
```

### A.3 GitHub Actions Integration

Für automatische Prüfungen vor dem Merge könnte `.github/workflows/quality-check.yml` erstellt werden:

```yaml
name: Quality Check

on:
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run build

      - name: Test
        run: npm test

      - name: Check TODO/ISSUES updated
        run: |
          git diff --name-only origin/main...HEAD | grep -E "(TODO|ISSUES|CHANGELOG).md" || \
          echo "⚠️ Consider updating TODO.md, ISSUES.md, or CHANGELOG.md"
```

---

**Letzte Aktualisierung**: 6. Dezember 2025  
**Version**: 1.0.0  
**Maintainer**: Thomas Heisig  
**Nächster Review**: März 2026
