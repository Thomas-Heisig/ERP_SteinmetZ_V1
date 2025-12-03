# ERP SteinmetZ - Bekannte Probleme & Technical Debt

**Stand**: Dezember 2024  
**Version**: 0.2.0

Dieses Dokument listet alle bekannten Probleme, Bugs und Technical Debt im Projekt auf.

---

## 🔴 Kritische Issues (Müssen sofort behoben werden)

### ISSUE-001: TypeScript Build schlägt fehl ❌

**Status**: 🔴 Offen | **Priorität**: Kritisch | **Erstellt**: 2024-12-03

**Beschreibung**:
Der TypeScript-Build schlägt mit zahlreichen Type-Fehlern fehl. Hauptprobleme:

**Fehlerdetails**:
```
- Cannot find name 'process' (~50 Instanzen)
- Cannot find module 'express' or its corresponding type declarations
- Cannot find module 'multer' or its corresponding type declarations
- Cannot find module 'node:fs', 'node:path', 'node:url'
- Cannot find module '@anthropic-ai/sdk'
- Cannot find module 'openai'
- Cannot find namespace 'NodeJS'
- Parameter implicitly has 'any' type (~100+ Instanzen)
```

**Betroffene Dateien**:
- `apps/backend/src/index.ts`
- `apps/backend/src/routes/**/*.ts` (alle Router)
- `apps/backend/src/middleware/**/*.ts`
- `apps/backend/src/routes/ai/**/*.ts` (alle AI-Provider)

**Ursache**:
1. @types/node fehlt oder ist nicht korrekt konfiguriert im Backend-tsconfig.json
2. Type-Definitionen für Express und andere Libraries nicht gefunden
3. Strikte TypeScript-Konfiguration ohne explizite Types

**Lösungsansatz**:
1. @types/node explizit in apps/backend/package.json dependencies aufnehmen
2. tsconfig.json im Backend anpassen: `"types": ["node"]`
3. Alle impliziten any-Types explizit typisieren
4. Express Request/Response Types importieren und verwenden

**Auswirkung**: 
- Build schlägt fehl
- Production-Deployment nicht möglich
- TypeScript-Vorteile werden nicht genutzt

**Aufwand**: 4-6 Stunden

---

### ISSUE-002: Fehlende .env Dateien 🔧

**Status**: 🔴 Offen | **Priorität**: Kritisch | **Erstellt**: 2024-12-03

**Beschreibung**:
Die .env.example Dateien fehlen im Repository. Entwickler wissen nicht, welche Umgebungsvariablen benötigt werden.

**Betroffene Bereiche**:
- Backend: `apps/backend/.env.example`
- Frontend: `apps/frontend/.env.example`

**Erforderliche Umgebungsvariablen (Backend)**:
```
# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database
DATABASE_URL=sqlite:./data/erp.db
# oder für PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/erp_steinmetz

# AI Providers
AI_PROVIDER=ollama
AI_DEFAULT_MODEL=qwen3:4b
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=...
AZURE_OPENAI_DEPLOYMENT=...
OLLAMA_BASE_URL=http://localhost:11434

# Functions Catalog
FUNCTIONS_DIR=../../docs/functions
FUNCTIONS_AUTOLOAD=1
FUNCTIONS_AUTOPERSIST=1
FUNCTIONS_WATCH=1

# Authentication
JWT_SECRET=your-secret-key-here
ADMIN_TOKEN=admin-token-here
SESSION_SECRET=session-secret-here

# Optional
LOG_LEVEL=info
```

**Erforderliche Umgebungsvariablen (Frontend)**:
```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

**Auswirkung**: Entwickler können System nicht starten ohne Trial-and-Error

**Aufwand**: 1 Stunde

---

### ISSUE-003: Fehlende Test-Infrastruktur 🧪

**Status**: 🔴 Offen | **Priorität**: Hoch | **Erstellt**: 2024-12-03

**Beschreibung**:
Es gibt keine automatisierten Tests. Keine Unit-Tests, keine Integration-Tests, keine E2E-Tests.

**Fehlende Test-Tools**:
- Test-Framework (Jest / Vitest)
- Testing-Library (@testing-library/react)
- Test-Scripts in package.json
- CI-Integration
- Code-Coverage-Reporting

**Konsequenzen**:
- Keine Regression-Detection
- Refactoring ist riskant
- Code-Quality nicht messbar
- Bugs werden erst in Production entdeckt

**Erforderlich**:
1. Jest oder Vitest konfigurieren
2. Test-Scripts erstellen (`npm test`, `npm test:watch`, `npm test:coverage`)
3. Mindestens 50% Code-Coverage für kritische Services
4. CI-Pipeline mit automatischen Tests

**Aufwand**: 1-2 Tage Setup + laufende Test-Erstellung

---

## 🟠 Wichtige Issues (Sollten bald behoben werden)

### ISSUE-004: Keine Error-Boundaries im Frontend ⚠️

**Status**: 🟠 Offen | **Priorität**: Hoch | **Erstellt**: 2024-12-03

**Beschreibung**:
Das Frontend hat keine Error-Boundaries. Ein Runtime-Error in einer Komponente führt zum Crash der ganzen App.

**Betroffene Bereiche**:
- Alle Komponenten ohne Error-Handling
- Besonders kritisch: Dashboard, FunctionsCatalog, QuickChat

**Lösungsansatz**:
1. ErrorBoundary-Komponente erstellen
2. Fallback-UI gestalten
3. Error-Logging implementieren
4. An strategischen Stellen einsetzen (pro Route, pro großes Feature)

**Auswirkung**: Schlechte User-Experience bei Fehlern

**Aufwand**: 3-4 Stunden

---

### ISSUE-005: Inkonsistente Error-Responses vom Backend 📡

**Status**: 🟠 Offen | **Priorität**: Hoch | **Erstellt**: 2024-12-03

**Beschreibung**:
API-Fehler haben kein einheitliches Format. Manche Router geben `{ error: "..." }` zurück, andere `{ message: "..." }`, wieder andere nur Status-Codes.

**Beispiele**:
```javascript
// Router A
res.status(404).json({ error: "Not found" });

// Router B
res.status(500).json({ message: "Internal error", details: {...} });

// Router C
res.status(400).send("Bad request");
```

**Erforderlich**:
Einheitliches Error-Response-Format:
```typescript
{
  success: false,
  error: {
    code: "NOT_FOUND",
    message: "Resource not found",
    details?: any,
    timestamp: "2024-12-03T14:00:00Z",
    path: "/api/functions/123"
  }
}
```

**Auswirkung**: Frontend kann Fehler nicht konsistent behandeln

**Aufwand**: 4-6 Stunden

---

### ISSUE-006: Fehlende Input-Validierung auf Backend 🛡️

**Status**: 🟠 Offen | **Priorität**: Hoch | **Erstellt**: 2024-12-03

**Beschreibung**:
Viele API-Endpunkte validieren Eingaben nicht oder nur unzureichend. Malformed Requests können zu unerwarteten Fehlern führen.

**Betroffene Routen**:
- POST /api/ai/chat
- POST /api/ai-annotator/nodes/:id/*
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
  model: z.string().optional()
});

router.post('/chat', validate(chatMessageSchema), async (req, res) => {
  // req.body ist garantiert valide
});
```

**Auswirkung**: Security-Risiko, instabile API

**Aufwand**: 2-3 Tage

---

### ISSUE-007: Keine Rate-Limiting auf AI-Endpoints 🚦

**Status**: 🟠 Offen | **Priorität**: Mittel | **Erstellt**: 2024-12-03

**Beschreibung**:
Die AI-Endpunkte haben kein Rate-Limiting. Ein User könnte unlimitiert teure AI-API-Calls auslösen.

**Betroffene Routen**:
- POST /api/ai/chat/:sessionId/message
- POST /api/ai/audio/transcribe
- POST /api/ai-annotator/nodes/:id/generate-meta
- POST /api/ai-annotator/batch

**Lösungsansatz**:
1. express-rate-limit ist bereits installiert
2. Rate-Limiter für AI-Endpunkte konfigurieren
3. User-spezifisches Limiting (nach JWT)
4. Quota-System implementieren

**Beispiel**:
```typescript
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 20, // 20 Requests pro 15 Min
  message: 'Too many AI requests, please try again later'
});

router.post('/ai/chat/:sessionId/message', aiRateLimiter, ...);
```

**Auswirkung**: Potentiell hohe AI-API-Kosten, DoS-Anfälligkeit

**Aufwand**: 2-3 Stunden

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

**Beispiele**:
- `monaco-editor` in root package.json (sollte in Frontend sein)
- Möglicherweise veraltete AI-Provider-SDKs
- Dev-Dependencies, die nicht mehr benötigt werden

**Lösungsansatz**:
1. `npm list` ausführen und ungenutzte Packages identifizieren
2. Dependency-Audit mit `npm audit`
3. Update auf neueste Versionen wo möglich
4. Ungenutzte entfernen

**Auswirkung**: Bundle-Size, Security-Vulnerabilities

**Aufwand**: 2-3 Stunden

---

### ISSUE-010: Console.logs im Production-Code 🐛

**Status**: 🟡 Offen | **Priorität**: Niedrig | **Erstellt**: 2024-12-03

**Beschreibung**:
Viele console.log() Statements im Code, die in Production nicht sein sollten.

**Betroffen**:
- Backend: `apps/backend/src/**/*.ts`
- Frontend: `apps/frontend/src/**/*.tsx`

**Lösungsansatz**:
1. ESLint-Rule aktivieren: `no-console: ["error", { allow: ["warn", "error"] }]`
2. Logger-Service verwenden (Backend hat Pino)
3. Frontend: Conditional Logging basierend auf ENV

**Auswirkung**: Performance (minimal), Security (Info-Leakage)

**Aufwand**: 2-3 Stunden

---

### ISSUE-011: Fehlende TypeScript Strict Mode ⚙️

**Status**: 🟡 Offen | **Priorität**: Niedrig | **Erstellt**: 2024-12-03

**Beschreibung**:
TypeScript läuft nicht im Strict-Mode. Viele potentielle Fehler werden nicht erkannt.

**Aktuelle Konfiguration**:
```json
{
  "strict": false,
  "noImplicitAny": false,
  // etc.
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

### ISSUE-014: Git .gitignore unvollständig 📝

**Status**: 🟢 Offen | **Priorität**: Sehr niedrig | **Erstellt**: 2024-12-03

**Beschreibung**:
`.gitignore` könnte erweitert werden:
- `*.log` Files
- OS-spezifische Files (`.DS_Store`, `Thumbs.db`)
- IDE-spezifische Files (`.idea/`, `.vscode/settings.json`)
- Temporäre Files (`*.tmp`, `*.bak`)

**Aufwand**: 5 Minuten

---

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
- 🔴 Kritisch: 3 Issues
- 🟠 Hoch: 5 Issues
- 🟡 Mittel: 5 Issues
- 🟢 Niedrig: 3 Issues

**Gesamt**: 16 dokumentierte Issues

### Nach Kategorie
- **Build & Infrastruktur**: 3
- **Testing & Quality**: 2
- **Security**: 2
- **Code-Quality**: 4
- **Documentation**: 2
- **Accessibility**: 1
- **Developer Experience**: 2

### Geschätzter Gesamtaufwand
- **Kritische Issues**: 1-2 Wochen
- **Hohe Priorität**: 2-3 Wochen
- **Mittlere Priorität**: 3-4 Wochen
- **Niedrige Priorität**: 1 Woche

**Gesamt**: ~8-10 Wochen für alle Issues

---

## 🔧 Issue-Management-Prozess

### Issue-Labels
- `critical` - Blockiert Production-Deployment
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
5. **Done** → Deployed, dokumentiert, Issue geschlossen

### Reporting
Issues werden monatlich reviewed und nach Priorität neu bewertet.

---

**Letzte Aktualisierung**: 3. Dezember 2024  
**Maintainer**: Thomas Heisig  
**Nächster Review**: Januar 2025
