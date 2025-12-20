# Code Coverage Report

**Stand**: 9. Dezember 2025  
**Version**: 0.3.0

Dieses Dokument beschreibt die Code-Coverage-Strategie, -Metriken und -Tools für das ERP SteinmetZ-Projekt.

---

## 📊 Aktuelle Coverage-Metriken

### Backend Coverage (Stand: 9. Dezember 2025)

```
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |   57.73 |    44.11 |   55.33 |   58.51 |
-------------------|---------|----------|---------|---------|
```

**Details**:

- **Statement Coverage**: 57.73% (Ziel: 80%)
- **Branch Coverage**: 44.11% (Ziel: 70%)
- **Function Coverage**: 55.33% (Ziel: 80%)
- **Line Coverage**: 58.51% (Ziel: 80%)

**Gut getestete Module**:

- `middleware/`: 100% statements, 80% branches
  - `asyncHandler.ts`: 100% coverage
  - `errorHandler.ts`: 100% statements
- `services/metricsService.ts`: 100% coverage
- `services/tracingService.ts`: 89.28% statements

**Verbesserungsbedarf**:

- `config/env.ts`: 39.47% (niedrige Coverage)
- `routes/ai/utils/helpers.ts`: 16.12% (kritisch niedrig)
- `utils/logger.ts`: 38.46% (verbesserungswürdig)

### Frontend Coverage (Stand: 9. Dezember 2025)

```
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |   71.42 |    75.63 |   77.41 |   71.42 |
-------------------|---------|----------|---------|---------|
```

**Details**:

- **Statement Coverage**: 71.42% (Ziel: 80%)
- **Branch Coverage**: 75.63% (✅ über Ziel)
- **Function Coverage**: 77.41% (nahe am Ziel)
- **Line Coverage**: 71.42% (Ziel: 80%)

**Gut getestete Module**:

- `components/ui/Button.tsx`: 100% statements
- `components/ui/Skeleton.tsx`: 100% coverage
- `components/ui/ErrorBoundary.tsx`: 92.59% statements

**Verbesserungsbedarf**:

- `utils/logger.ts`: 16.66% (kritisch niedrig)

---

## 🎯 Coverage-Ziele

### Kurz- bis Mittelfristig (Q1 2025)

| Metrik              | Aktuell | Ziel | Status |
| ------------------- | ------- | ---- | ------ |
| Backend Statements  | 57.73%  | 80%  | 🟡     |
| Backend Branches    | 44.11%  | 70%  | 🔴     |
| Frontend Statements | 71.42%  | 80%  | 🟡     |
| Frontend Branches   | 75.63%  | 70%  | ✅     |

### Langfristig (Q2 2025)

- **Backend**: 90% statement coverage, 80% branch coverage
- **Frontend**: 90% statement coverage, 85% branch coverage
- **Integration Tests**: 70% E2E coverage der kritischen User-Flows

---

## 🛠️ Coverage-Tools

### Vitest mit V8 Coverage Provider

Beide Apps nutzen Vitest mit dem V8 Coverage Provider:

**Konfiguration** (`vitest.config.ts`):

```typescript
coverage: {
  provider: "v8",
  reporter: ["text", "json", "html", "lcov"],
  reportsDirectory: "./coverage",
  exclude: [
    "node_modules/**",
    "dist/**",
    "**/*.config.*",
    "**/types/**",
    "**/*.d.ts",
  ],
}
```

### Reporter

1. **text**: Console-Output für schnelle Übersicht
2. **json**: Maschinenlesbare Daten für CI/CD-Integration
3. **html**: Interaktiver HTML-Report für detaillierte Analyse
4. **lcov**: Standard-Format für SonarQube, Codecov, Coveralls

---

## 📝 Coverage-Befehle

### Backend

```bash
# Coverage mit Report generieren
cd apps/backend
npm run test:coverage

# Coverage-Report im Browser öffnen
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### Frontend

```bash
# Coverage mit Report generieren
cd apps/frontend
npm run test:coverage

# Coverage-Report im Browser öffnen
open coverage/index.html
```

### Root-Level

```bash
# Alle Tests mit Coverage (Backend + Frontend)
npm run test:coverage

# Nur Backend
npm run test:backend:coverage

# Nur Frontend
npm run test:frontend:coverage
```

---

## 📁 Coverage-Reports

### Verzeichnisstruktur

```
apps/
├── backend/
│   └── coverage/
│       ├── index.html          # HTML-Report (interaktiv)
│       ├── coverage-final.json # JSON-Report
│       └── lcov.info           # LCOV-Report (für SonarQube)
└── frontend/
    └── coverage/
        ├── index.html
        ├── coverage-final.json
        └── lcov.info
```

### HTML-Reports

Die HTML-Reports bieten:

- **Datei-Explorer**: Navigiere durch die Projekt-Struktur
- **Source-Code-Highlighting**: Zeigt gedeckte (grün) und nicht gedeckte (rot) Zeilen
- **Branch-Visualisierung**: Zeigt welche Branches getestet wurden
- **Sortierung**: Nach Coverage-Prozentsatz sortierbar

**Tipps**:

- Fokussiere zuerst auf Dateien mit <50% Coverage
- Priorisiere kritische Business-Logic
- Ignoriere trivialen Code (Getter/Setter, einfache Utilities)

---

## 🔄 CI/CD-Integration

### GitHub Actions

Coverage-Reports werden automatisch in der CI/CD-Pipeline generiert:

```yaml
# .github/workflows/test.yml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./apps/backend/coverage/lcov.info,./apps/frontend/coverage/lcov.info
    flags: unittests
    name: codecov-umbrella
```

### SonarQube

SonarQube liest automatisch die `lcov.info`-Dateien:

```properties
# sonar-project.properties
sonar.javascript.lcov.reportPaths=apps/backend/coverage/lcov.info,apps/frontend/coverage/lcov.info
sonar.typescript.lcov.reportPaths=apps/backend/coverage/lcov.info,apps/frontend/coverage/lcov.info
```

---

## ✅ Best Practices

### Was sollte getestet werden?

1. **Kritische Business-Logic** (Priorität: Hoch)
   - Rechnungserstellung, Payroll-Berechnungen
   - Authentifizierung, Authorization
   - Datentransformationen

2. **API-Endpoints** (Priorität: Hoch)
   - Request-Validierung
   - Error-Handling
   - Response-Formatierung

3. **Utilities & Helpers** (Priorität: Mittel)
   - Date/Time-Formatierung
   - Datenvalidierung
   - Transformationen

4. **UI-Komponenten** (Priorität: Mittel)
   - User-Interaktionen
   - Conditional Rendering
   - State-Management

### Was muss nicht getestet werden?

- **Triviale Code**: Einfache Getter/Setter
- **Third-Party-Code**: Bibliotheken (werden von Maintainern getestet)
- **Generated Code**: Auto-generierte Dateien
- **Config-Files**: Statische Konfiguration ohne Logik

### Coverage ist kein Selbstzweck

- **Qualität > Quantität**: 60% hochwertige Tests > 90% triviale Tests
- **Fokus auf kritische Pfade**: Priorisiere nach Business-Impact
- **Test-Wartbarkeit**: Gut strukturierte Tests sind wichtiger als 100% Coverage

---

## 🎨 Coverage-Badges

### Codecov

```markdown
[![codecov](https://codecov.io/gh/Thomas-Heisig/ERP_SteinmetZ_V1/branch/main/graph/badge.svg)](https://codecov.io/gh/Thomas-Heisig/ERP_SteinmetZ_V1)
```

### SonarQube

```markdown
[![Quality Gate Status](https://sonarqube.example.com/api/project_badges/measure?project=erp-steinmetz&metric=alert_status)](https://sonarqube.example.com/dashboard?id=erp-steinmetz)
```

---

## 📈 Coverage-Trend

| Datum      | Backend % | Frontend % | Gesamt % |
| ---------- | --------- | ---------- | -------- |
| 2025-12-09 | 57.73%    | 71.42%     | 64.58%   |
| 2025-12-03 | ~45%      | ~60%       | ~52%     |
| 2024-12-05 | ~30%      | ~40%       | ~35%     |

**Ziel**: +5% pro Monat bis Q2 2025

---

## 🚀 Coverage steigern: Action Plan

### Phase 1: Quick Wins (1 Woche)

1. **Logger-Utilities testen** (Backend + Frontend)
   - `apps/backend/src/utils/logger.ts`: 38.46% → 80%
   - `apps/frontend/src/utils/logger.ts`: 16.66% → 80%
   - **Impact**: +5% Backend, +10% Frontend

2. **AI Helpers testen**
   - `apps/backend/src/routes/ai/utils/helpers.ts`: 16.12% → 70%
   - **Impact**: +8% Backend

3. **Env-Validation erweitern**
   - `apps/backend/src/config/env.ts`: 39.47% → 70%
   - **Impact**: +4% Backend

**Erwartetes Ergebnis**: Backend 75%, Frontend 81%

### Phase 2: Medium Impact (2 Wochen)

1. **Service-Layer-Tests**
   - `aiProviderHealthService.ts`: 62.9% → 85%
   - `errorTrackingService.ts`: 46.47% → 75%
   - **Impact**: +6% Backend

2. **Router-Tests**
   - Standardisierte Tests für alle Router (15 Router)
   - Fokus: Error-Handling, Validierung, Authorization
   - **Impact**: +5% Backend

**Erwartetes Ergebnis**: Backend 86%, Frontend 81%

### Phase 3: Long Tail (laufend)

1. **Integration-Tests**
   - E2E-Tests mit Playwright
   - API-Integration-Tests
   - **Impact**: Qualitätssteigerung

2. **Edge-Cases**
   - Error-Pfade
   - Timeout-Szenarien
   - Race-Conditions
   - **Impact**: Robustheit

---

## 🔍 Coverage-Analyse-Tools

### 1. Vitest UI

Interaktives UI für Test-Entwicklung:

```bash
npm run test:ui
```

Öffnet Browser-UI mit:

- Live-Coverage-Updates
- Test-Filtering
- Source-Code-Integration

### 2. Coverage-HTML-Reports

Beste Methode für detaillierte Analyse:

```bash
npm run test:coverage
open apps/backend/coverage/index.html
```

### 3. SonarQube

Umfassende Code-Quality-Metriken:

- Coverage-Trends über Zeit
- Code-Smells + Coverage-Gaps
- Security-Hotspots

---

## 📚 Weitere Ressourcen

- [Vitest Coverage Documentation](https://vitest.dev/guide/coverage.html)
- [V8 Coverage Provider](https://v8.dev/blog/javascript-code-coverage)
- [Istanbul/NYC (alternative)](https://istanbul.js.org/)
- [LCOV Format Specification](https://ltp.sourceforge.net/coverage/lcov/genhtml.1.php)
- [SonarQube Coverage Guide](https://docs.sonarqube.org/latest/analysis/coverage/)

---

## 🤝 Beitragen

### Pull Request Guidelines

**Coverage-Anforderungen**:

- ❌ **Blocker**: Neue Dateien <50% Coverage
- ⚠️ **Warning**: Coverage-Rückgang >5%
- ✅ **Good**: Neue Tests für neue Features
- 🌟 **Excellent**: Coverage-Steigerung

**PR-Checklist**:

- [ ] Tests für neue Funktionen geschrieben
- [ ] Coverage-Report geprüft (keine kritischen Lücken)
- [ ] Edge-Cases berücksichtigt
- [ ] Integration-Tests wo sinnvoll

---

**Letzte Aktualisierung**: 9. Dezember 2025  
**Maintainer**: Thomas Heisig  
**Nächster Review**: Januar 2026
