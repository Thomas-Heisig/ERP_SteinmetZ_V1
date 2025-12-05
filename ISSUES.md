# ERP SteinmetZ - Aktive Issues

**Stand**: Dezember 2024  
**Version**: 0.2.0

Dieses Dokument listet alle **aktiven (offenen)** Probleme, Bugs und Technical Debt im Projekt auf.

> **Hinweis**: Behobene Issues wurden nach [ARCHIVE.md](ARCHIVE.md) verschoben.

---

## 🟠 Hohe Priorität (Sollten bald behoben werden)

### ISSUE-005: Inkonsistente Error-Responses vom Backend 🔄

**Status**: 🟡 Teilweise behoben | **Priorität**: Hoch | **Erstellt**: 2024-12-03 | **Aktualisiert**: 2024-12-04

**Beschreibung**:
API-Fehler haben kein einheitliches Format. Auth-Middleware wurde bereits standardisiert, aber viele Router geben immer noch unterschiedliche Error-Formate zurück.

**Beispiele**:

```javascript
// Router A
res.status(404).json({ error: "Not found" });

// Router B
res.status(500).json({ message: "Internal error", details: {...} });

// Router C
res.status(400).send("Bad request");
```

**Lösung (teilweise)**:

1. ✅ Standardisiertes Error-Response-Format definiert in `errorResponse.ts`
2. ✅ Helper-Funktionen erstellt (sendBadRequest, sendUnauthorized, etc.)
3. ✅ Error-Codes definiert (BAD_REQUEST, UNAUTHORIZED, etc.)
4. ✅ authMiddleware komplett aktualisiert
5. ✅ rateLimitLogin Middleware aktualisiert
6. ⚠️ **Weitere Router müssen noch aktualisiert werden** (AI, Functions, etc.)

**Standardformat**:

```typescript
{
  success: false,
  error: {
    code: "NOT_FOUND",
    message: "Resource not found",
    details?: any,
    timestamp: "2024-12-04T14:00:00Z",
    path: "/api/functions/123"
  }
}
```

**Auswirkung**: Inkonsistente API-Responses erschweren Frontend-Integration

**Aufwand**: 4-6 Stunden für alle verbleibenden Router

---

### ISSUE-006: Fehlende Input-Validierung auf Backend 🛡️

**Status**: 🟠 Offen | **Priorität**: Hoch | **Erstellt**: 2024-12-03

**Beschreibung**:
Viele API-Endpunkte validieren Eingaben nicht oder nur unzureichend. Malformed Requests können zu unerwarteten Fehlern führen.

**Betroffene Routen**:

- POST /api/ai/chat
- POST /api/ai-annotator/nodes/:id/\*
- POST /api/functions/menu
- Und viele mehr

**Lösungsansatz**:

1. Zod-Schemas für alle Request-Bodies definieren
2. Validation-Middleware erstellen
3. In allen Routen einsetzen
4. Klare Validation-Error-Messages

**Beispiel**:

```typescript
const chatMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().uuid().optional(),
  model: z.string().optional(),
});

router.post("/chat", validate(chatMessageSchema), async (req, res) => {
  // req.body ist garantiert valide
});
```

**Auswirkung**: **Security-Risiko**, instabile API

**Aufwand**: 2-3 Tage

---

### ISSUE-008: Fehlende Monitoring & Observability 📊

**Status**: 🟠 Offen | **Priorität**: Mittel | **Erstellt**: 2024-12-03

**Beschreibung**:
Es gibt kein strukturiertes Logging, keine Metriken, kein Tracing, kein Error-Tracking.

**Fehlende Features**:

- Structured Logging (Pino ist da, aber nicht überall genutzt)
- Metrics (Prometheus-Exporter)
- Distributed Tracing (OpenTelemetry)
- Error-Tracking (Sentry o.ä.)
- Performance-Monitoring (APM)
- Log-Aggregation (ELK, Loki)

**Konsequenzen**:

- Schwierig, Probleme in Production zu debuggen
- Keine Performance-Insights
- Keine Anomalie-Detection
- Reaktiv statt proaktiv

**Aufwand**: 1-2 Wochen

---

## 🟡 Moderate Issues (Technical Debt)

### ISSUE-009: Ungenutzte Dependencies 📦

**Status**: 🟡 Offen | **Priorität**: Niedrig | **Erstellt**: 2024-12-03

**Beschreibung**:
Mehrere Dependencies sind installiert, werden aber nicht genutzt oder sind veraltet.

**Analyse durchgeführt (5. Dezember 2024)**:

- `monaco-editor` → **WIRD VERWENDET** in `apps/frontend/src/components/FunctionsCatalog/features/code/`
- Keine offensichtlich ungenutzten Dependencies gefunden

**Empfehlung**:

- Regelmäßige Dependency-Audits mit `npm list`
- `npm audit` für Security-Vulnerabilities
- Update auf neueste Versionen wo möglich

**Auswirkung**: Bundle-Size, Security-Vulnerabilities (minimal)

**Aufwand**: 2-3 Stunden

---

### ISSUE-010: Console.logs im Production-Code 🐛

**Status**: 🟡 Teilweise behoben | **Priorität**: Niedrig | **Erstellt**: 2024-12-03 | **Aktualisiert**: 2024-12-05

**Beschreibung**:
Viele console.log() Statements im Code, die in Production nicht sein sollten.

**Analyse (5. Dezember 2024)**:

- **Backend**: 171 console.log Statements
- **Frontend**: 6 console.log Statements
- **Gesamt**: 177 Instanzen

**Lösung (Phase 1 - Infrastruktur) ✅**:

1. ✅ ESLint-Rule aktiviert: `no-console: ["warn", { allow: ["warn", "error", "info"] }]`
2. ✅ Comprehensive Migration Guide erstellt: [CODE_QUALITY_IMPROVEMENTS.md](docs/CODE_QUALITY_IMPROVEMENTS.md)
3. ✅ Strukturierte Logging-Guidelines dokumentiert
4. ⏳ Schrittweise Migration geplant (3 Sprints)

**Nächste Schritte (Phase 2-4)**:

- [ ] Kritische Backend-Services migrieren (Auth, AI)
- [ ] Business-Logik migrieren (HR, Finance)
- [ ] Frontend komplett migrieren
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

**Status**: 🟡 Offen | **Priorität**: Niedrig | **Erstellt**: 2024-12-03

**Beschreibung**:
Es gibt kaum JSDoc-Kommentare oder Code-Dokumentation. Komplexe Funktionen sind nicht erklärt.

**Betroffen**:

- Alle Services
- Komplexe Utilities
- AI-Provider-Implementierungen
- Resilience-Patterns

**Lösungsansatz**:

1. JSDoc für alle öffentlichen Functions/Classes
2. README in komplexen Modulen
3. Inline-Comments für komplexe Logik
4. TypeDoc für API-Dokumentation generieren

**Auswirkung**: Schwierige Einarbeitung neuer Entwickler

**Aufwand**: Laufend

---

## 🟢 Kleinere Issues & Verbesserungsvorschläge

### ISSUE-015: Package.json Scripts fehlen Beschreibungen 📋

**Status**: 🟢 Offen | **Priorität**: Sehr niedrig | **Erstellt**: 2024-12-03

**Beschreibung**:
Die npm-scripts haben keine Beschreibungen. `npm run` zeigt eine unleserliche Liste.

**Lösungsansatz**:
Namenskonventionen verwenden oder `package.json` "description" nutzen.

**Aufwand**: 30 Minuten

---

### ISSUE-016: Fehlende Commit-Conventions 🔖

**Status**: 🟢 Offen | **Priorität**: Sehr niedrig | **Erstellt**: 2024-12-03

**Beschreibung**:
Keine enforzierten Commit-Message-Conventions. Commits sind unstrukturiert.

**Lösungsansatz**:

1. Conventional Commits einführen
2. Commitlint installieren
3. Husky pre-commit hooks

**Beispiel**:

```
feat(backend): add rate limiting to AI endpoints
fix(frontend): resolve theme toggle bug
docs(readme): update installation instructions
```

**Aufwand**: 1-2 Stunden

---

## 📊 Issue-Statistiken

### Nach Priorität

- 🟠 Hoch: 3 Issues (1 teilweise behoben)
- 🟡 Mittel: 5 Issues
- 🟢 Niedrig: 2 Issues

**Gesamt**: 10 aktive Issues (1 teilweise, 9 offen)

### Nach Kategorie

- **Security**: 1 (ISSUE-006)
- **Code-Quality**: 4 (ISSUE-005, 010, 011, 013)
- **Monitoring**: 1 (ISSUE-008)
- **Dependencies**: 1 (ISSUE-009)
- **Accessibility**: 1 (ISSUE-012)
- **Developer Experience**: 2 (ISSUE-015, 016)

### Geschätzter Gesamtaufwand

- **Hohe Priorität**: 1-2 Wochen
- **Mittlere Priorität**: 1-2 Wochen
- **Niedrige Priorität**: 3-4 Tage

**Gesamt**: ~3-5 Wochen für alle offenen Issues

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

1. **ISSUE-006** (Input-Validierung) - Security-Risiko
2. **ISSUE-005** (Error-Responses standardisieren) - API-Konsistenz
3. **ISSUE-010** (Console.logs entfernen) - Code-Qualität
4. **ISSUE-008** (Monitoring) - Production-Readiness
5. Weitere nach Bedarf

---

**Letzte Aktualisierung**: 5. Dezember 2024  
**Maintainer**: Thomas Heisig  
**Nächster Review**: Januar 2025

**Siehe auch**:

- [ARCHIVE.md](ARCHIVE.md) - Behobene Issues und alte Changelogs
- [TODO.md](TODO.md) - Priorisierte Aufgabenliste
- [CHANGELOG.md](CHANGELOG.md) - Projekt-Changelog
