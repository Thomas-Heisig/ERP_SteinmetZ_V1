# Self-Healing System - Dokumentation

**Version:** 1.0.0  
**Letzte Aktualisierung:** 2025-12-20  
**Status:** ✅ Produktiv

---

## Übersicht

Das Self-Healing System überwacht kontinuierlich die Datenbankintegrität, erkennt automatisch Probleme und führt bei Bedarf Reparaturen durch. Es besteht aus vier Hauptkomponenten, die nahtlos zusammenarbeiten.

### Hauptkomponenten

1. **DatabaseHealthMonitor** - Kontinuierliche Überwachung und Health-Checks
2. **AutoRepair** - Automatische Reparatur mit Rollback-Fähigkeit
3. **HealingReport** - Protokollierung und Reporting
4. **SelfHealingScheduler** - Zeitgesteuerte Ausführung

---

## 1. DatabaseHealthMonitor

### Funktionalität

Der Health Monitor führt folgende Checks durch:

| Check | Beschreibung | Status |
|-------|--------------|--------|

| **Connection** | Datenbankverbindung | pass/fail |
| **Schema Integrity** | Prüft, ob alle erforderlichen Tabellen existieren | pass/fail |
| **Referential Integrity** | Erkennt verwaiste Edges (Orphan Edges) | pass/warn/fail |
| **Duplicates** | Findet doppelte Einträge (title + kind) | pass/warn/fail |
| **Data Validity** | Prüft auf fehlende Titel und ungültige `kind`-Werte | pass/warn/fail |
| **Storage Health** | Überwacht Datenbankgröße und Log-Einträge | pass/warn/fail |

### API

```typescript
import healthMonitor from './DatabaseHealthMonitor.js';

// Health Check durchführen
const result = await healthMonitor.runHealthChecks();
console.log(result.status); // "healthy" | "degraded" | "unhealthy"
console.log(result.summary); // "6 checks completed in 45ms - 0 failures, 1 warnings"

// Integritätsprobleme finden
const issues = await healthMonitor.findIntegrityIssues();
console.log(issues); // Array von IntegrityIssue

// Letztes Ergebnis abrufen
const lastResult = healthMonitor.getLastCheckResult();

// Prüfen ob Check läuft
const isRunning = healthMonitor.getIsRunning();
```

### Interfaces

```typescript
interface HealthCheckResult {
  timestamp: Date;
  status: "healthy" | "degraded" | "unhealthy";
  checks: HealthCheck[];
  summary: string;
}

interface HealthCheck {
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
  details?: Record<string, unknown>;
  duration?: number;
}

interface IntegrityIssue {
  type: "orphan_edge" | "missing_reference" | "duplicate" | "invalid_data" | "constraint_violation";
  table: string;
  recordId?: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  suggestedFix?: string;
}
```

### Concurrency Guard

Der Monitor verhindert parallele Ausführung:

```typescript
if (this.isRunning) {
  this.logger.warn("Health check already running - returning last result");
  return this.lastCheckResult ?? defaultResult;
}
```

---

## 2. AutoRepair

### Funktionalität-

Automatische Reparatur von erkannten Problemen mit vollständiger Rollback-Fähigkeit.

### Features

- ✅ **Rollback-fähig** - Jede Änderung kann rückgängig gemacht werden
- ✅ **Dry-Run Modus** - Simulation ohne tatsächliche Änderungen
- ✅ **Session-basiert** - Alle Reparaturen werden in Sessions gruppiert
- ✅ **Backup vor Änderung** - Originaldaten werden gespeichert

### Unterstützte Reparaturen

#### 1. Orphan Edges (Verwaiste Kanten)

```typescript
// Problem: Edge zeigt auf nicht existierenden Node
// Lösung: Edge wird gelöscht
// Rollback: Edge wird wiederhergestellt
```

#### 2. Invalid Data (Ungültige Daten)

```typescript
// Problem: Node ohne Title
// Lösung: Titel wird gesetzt: "[Auto-Repaired] {id}"
// Rollback: Originaltitel wird wiederhergestellt
```

#### 3. Duplicates (Duplikate)

```typescript
// Problem: Mehrere Nodes mit gleichem title + kind
// Lösung: Nur Reporting (manuelle Prüfung erforderlich)
// Rollback: N/A
```

### API-

```typescript
import { AutoRepair } from './AutoRepair.js';
import healthMonitor from './DatabaseHealthMonitor.js';

const autoRepair = new AutoRepair(healthMonitor);

// Repair Session starten
const session = await autoRepair.startRepairSession(false); // dryRun=false
console.log(session.id); // UUID
console.log(session.status); // "completed"
console.log(session.results); // Array von RepairResult

// Rollback durchführen
const success = await autoRepair.rollbackSession(session.id);

// Sessions abrufen
const allSessions = autoRepair.getSessions();
const oneSession = autoRepair.getSession(sessionId);
```

### Interfaces-

```typescript
interface RepairSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  results: RepairResult[];
  status: "running" | "completed" | "failed" | "rolledback";
}

interface RepairResult {
  timestamp: Date;
  issue: IntegrityIssue;
  success: boolean;
  action: string;
  rollbackAvailable: boolean;
  rollbackData?: unknown;
  error?: string;
}
```

### Session Management

- **Maximale Sessions:** 100 (älteste werden automatisch gelöscht)
- **Session-Cleanup:** Automatisch nach jeder Repair-Session

---

## 3. HealingReport

### Funktionalitäten

Protokolliert alle Health-Checks und Reparaturen in der Datenbank.

### Report-Typen

| Typ | Beschreibung | Ausführung |
|-----|--------------|------------|

| `nightly` | Nächtlicher Health-Check | 03:00 Uhr |
| `weekly` | Wöchentliche Tiefenanalyse | Sonntag 03:00 Uhr |
| `manual` | Manuelle Ausführung | On-Demand |

### APIs

```typescript
import { HealingReport } from './HealingReport.js';

const report = new HealingReport();

// Report erstellen
await report.createReport('nightly', healthResult);

// Report mit zusätzlichen Daten
await report.createReport('weekly', healthResult, {
  issues: integrityIssues,
  repairSession: session
});

// Reports abrufen
const allReports = await report.getReports();
const recent = await report.getReports(10); // Letzten 10

// Einen Report abrufen
const oneReport = await report.getReport(reportId);

// Reports löschen (älter als 90 Tage)
const deleted = await report.deleteOldReports(90);
```

### Report-Format

```typescript
interface HealingReportEntry {
  id: string;
  timestamp: Date;
  type: 'nightly' | 'weekly' | 'manual';
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
  summary: string;
  checks: HealthCheck[];
  issues?: IntegrityIssue[];
  repairResults?: RepairResult[];
  repairSuccess: boolean;
  metadata?: Record<string, unknown>;
}
```

---

## 4. SelfHealingScheduler

### Funktionalitäten-

Zeitgesteuerte Ausführung von Health-Checks und Auto-Repair.

### Standardkonfiguration

```typescript
{
  nightlyCheckEnabled: true,
  nightlyCheckHour: 3,              // 03:00 Uhr
  weeklyDeepAnalysisEnabled: true,
  weeklyDeepAnalysisDay: 0,         // Sonntag
  autoRepairEnabled: true,
  autoRepairDryRunOnly: false,      // Echte Reparaturen
  reportingEnabled: true
}
```

### APIs-

```typescript
import { SelfHealingScheduler } from './SelfHealingScheduler.js';

const scheduler = new SelfHealingScheduler(healthMonitor, autoRepair, report);

// Scheduler starten
scheduler.start();

// Konfiguration aktualisieren
scheduler.updateConfig({
  nightlyCheckHour: 2,              // Auf 02:00 Uhr ändern
  autoRepairEnabled: false          // Auto-Repair deaktivieren
});

// Manuelle Checks
const task = await scheduler.runManualCheck();
const nightlyTask = await scheduler.runNightlyCheck();
const weeklyTask = await scheduler.runWeeklyDeepAnalysis();

// Status abrufen
const status = scheduler.getStatus();
console.log(status.isRunning);
console.log(status.taskCount);
console.log(status.lastTask);

// Scheduler stoppen
scheduler.stop();
```

### Scheduled Tasks

```typescript
interface ScheduledTask {
  id: string;
  name: string;
  type: "nightly" | "weekly" | "manual";
  scheduledTime: Date;
  executedTime?: Date;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  result?: HealthCheckResult | RepairSession;
  error?: string;
}
```

---

## Verwendungsbeispiele

### 1. Einfacher Health-Check

```typescript
import healthMonitor from './DatabaseHealthMonitor.js';

const result = await healthMonitor.runHealthChecks();

if (result.status === 'unhealthy') {
  console.error('Datenbank hat kritische Probleme!');
  console.log(result.checks.filter(c => c.status === 'fail'));
}
```

### 2. Auto-Repair mit Rollback

```typescript
import { AutoRepair } from './AutoRepair.js';
import healthMonitor from './DatabaseHealthMonitor.js';

const autoRepair = new AutoRepair(healthMonitor);

// Reparatur durchführen
const session = await autoRepair.startRepairSession(false);

if (session.results.some(r => !r.success)) {
  console.error('Einige Reparaturen fehlgeschlagen!');
  
  // Rollback durchführen
  await autoRepair.rollbackSession(session.id);
  console.log('Rollback erfolgreich');
}
```

### 3. Kompletter Self-Healing Flow

```typescript
import healthMonitor from './DatabaseHealthMonitor.js';
import { AutoRepair } from './AutoRepair.js';
import { HealingReport } from './HealingReport.js';
import { SelfHealingScheduler } from './SelfHealingScheduler.js';

// Komponenten initialisieren
const autoRepair = new AutoRepair(healthMonitor);
const report = new HealingReport();
const scheduler = new SelfHealingScheduler(healthMonitor, autoRepair, report);

// Scheduler starten
scheduler.start();

// Scheduler läuft nun automatisch:
// - Täglich um 03:00 Uhr: Health-Check + Auto-Repair
// - Sonntags um 03:00 Uhr: Tiefenanalyse + Auto-Repair + Report
```

### 4. Dry-Run (Test-Modus)

```typescript
import { AutoRepair } from './AutoRepair.js';
import healthMonitor from './DatabaseHealthMonitor.js';

const autoRepair = new AutoRepair(healthMonitor);

// Dry-Run: Keine echten Änderungen
const session = await autoRepair.startRepairSession(true);

console.log('Würde folgende Änderungen durchführen:');
session.results.forEach(r => {
  console.log(`- ${r.action}`);
});
```

---

## REST API Endpunkte

### Health Check

```http
GET /api/selfhealing/health
```

**Response:**

```json
{
  "timestamp": "2025-12-20T14:30:00Z",
  "status": "healthy",
  "checks": [
    {
      "name": "connection",
      "status": "pass",
      "message": "Database connection OK",
      "duration": 5
    }
  ],
  "summary": "6 checks completed in 45ms - 0 failures, 0 warnings"
}
```

### Integrity Issues

```http
GET /api/selfhealing/issues
```

**Response:**

```json
{
  "issues": [
    {
      "type": "orphan_edge",
      "table": "functions_edges",
      "recordId": "abc123->def456",
      "description": "Edge references non-existent parent node: abc123",
      "severity": "high",
      "suggestedFix": "DELETE edge or restore parent node"
    }
  ]
}
```

### Auto-Repair

```http
POST /api/selfhealing/repair
Content-Type: application/json

{
  "dryRun": false
}
```

**Response:**

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "startTime": "2025-12-20T14:30:00Z",
  "endTime": "2025-12-20T14:30:02Z",
  "results": [
    {
      "timestamp": "2025-12-20T14:30:01Z",
      "issue": { ... },
      "success": true,
      "action": "DELETED orphan edge abc123 -> def456",
      "rollbackAvailable": true
    }
  ]
}
```

### Rollback

```http
POST /api/selfhealing/rollback/:sessionId
```

**Response:**

```json
{
  "success": true,
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "rollbackCount": 3
}
```

### Reports

```http
GET /api/selfhealing/reports?limit=10
GET /api/selfhealing/reports/:reportId
```

### Scheduler Status

```http
GET /api/selfhealing/scheduler/status
```

**Response:**

```json
{
  "isRunning": true,
  "config": {
    "nightlyCheckEnabled": true,
    "nightlyCheckHour": 3,
    "weeklyDeepAnalysisEnabled": true,
    "autoRepairEnabled": true
  },
  "taskCount": 42,
  "lastTask": {
    "id": "nightly-1734700800000",
    "name": "Nächtlicher Health-Check",
    "type": "nightly",
    "status": "completed"
  }
}
```

---

## Logging

Alle Komponenten verwenden strukturiertes Logging mit Pino:

```typescript
// DatabaseHealthMonitor
this.logger.info({ issues: 3 }, "Found integrity issues");
this.logger.error({ error }, "Health check failed");

// AutoRepair
logger.info({ sessionId, issueCount: 5 }, "Starting repair session");
logger.warn({ data }, "Missing identifiers for rollback");

// SelfHealingScheduler
logger.info({ taskId }, "🌙 Running nightly check");
logger.error({ taskId, error }, "❌ Nightly check failed");
```

### Log-Levels

- **debug** - Detaillierte Ausführungsinformationen
- **info** - Normale Operationen (Health-Checks, Repairs)
- **warn** - Warnings (Orphan Edges, Duplikate)
- **error** - Fehler (Check-Failures, Repair-Failures)

---

## Fehlerbehandlung

### Health Monitor

```typescript
try {
  const result = await healthMonitor.runHealthChecks();
} catch (error) {
  // Wird intern behandelt, gibt immer ein HealthCheckResult zurück
  // mit status: "unhealthy"
}
```

### Auto-Repair-

```typescript
try {
  const session = await autoRepair.startRepairSession(false);
  
  if (session.status === 'failed') {
    console.error('Repair session failed');
  }
  
  // Einzelne Reparaturen prüfen
  session.results.forEach(r => {
    if (!r.success) {
      console.error(`Repair failed: ${r.error}`);
    }
  });
} catch (error) {
  console.error('Critical error during repair:', error);
}
```

---

## Performance

### Health Check Performance

| Check | Durchschnitt | Maximal |
|-------|------------- |---------|

| Connection | 5ms | 15ms |
| Schema Integrity | 10ms | 30ms |
| Referential Integrity | 20ms | 100ms |
| Duplicates | 15ms | 80ms |
| Data Validity | 25ms | 120ms |
| Storage Health | 15ms | 60ms |
| **Gesamt** | **90ms** | **405ms** |

### Optimierungen

- **Concurrency Guard** - Verhindert parallele Health-Checks
- **Caching** - `lastCheckResult` wird gecached
- **Indexed Queries** - Alle Integritätschecks nutzen Indexes
- **Session Cleanup** - Automatische Bereinigung alter Sessions

---

## Sicherheit

### Rollback-Sicherheit

- **Backup vor Änderung** - Originaldaten werden immer gespeichert
- **Type Guards** - Rollback-Daten werden validiert
- **Null-Checks** - Fehlende IDs führen zu Skip, nicht zu Fehler

### SQL Injection Prevention

Alle Queries verwenden Prepared Statements:

```typescript
// ✅ Sicher
await db.run(
  "DELETE FROM functions_edges WHERE parent_id = ? AND child_id = ?",
  [parentId, childId]
);

// ❌ Unsicher (wird nicht verwendet)
await db.run(
  `DELETE FROM functions_edges WHERE parent_id = '${parentId}'`
);
```

---

## Migration & Updates

### Von 0.x zu 1.0

**Änderungen:**

1. **DatabaseHealthMonitor:**
   - ✅ Concurrency Guard hinzugefügt
   - ✅ Strukturiertes Logging
   - ✅ Erweiterte Error Handling

2. **AutoRepair:**
   - ✅ Rollback Type Guards
   - ✅ Default-Werte für fehlende Daten
   - ✅ Session-basiertes Management

3. **Breaking Changes:**
   - Keine Breaking Changes

---

## Troubleshooting

### Problem: Health Check bleibt hängen

**Lösung:**

```typescript
// Check ob bereits läuft
const isRunning = healthMonitor.getIsRunning();
if (isRunning) {
  console.log('Health check already running, wait...');
}
```

### Problem: Rollback schlägt fehl

**Lösung:**

```typescript
// Rollback-Daten prüfen
session.results.forEach(r => {
  if (r.rollbackAvailable) {
    console.log('Rollback data:', r.rollbackData);
  } else {
    console.warn('No rollback data available');
  }
});
```

### Problem: Scheduler führt nichts aus

**Lösung:**

```typescript
// Status prüfen
const status = scheduler.getStatus();
console.log('Scheduler running:', status.isRunning);
console.log('Config:', status.config);

// Manuellen Check durchführen
const task = await scheduler.runManualCheck();
console.log('Manual check result:', task.result);
```

---

## Best Practices

### 1. Regelmäßige Health-Checks

```typescript
// Scheduler nutzen statt manuelle Checks
scheduler.start();
```

### 2. Dry-Run vor Produktion

```typescript
// Immer erst Dry-Run testen
const dryRun = await autoRepair.startRepairSession(true);
console.log('Would perform:', dryRun.results.map(r => r.action));

// Dann echte Reparatur
const realRun = await autoRepair.startRepairSession(false);
```

### 3. Rollback bereithalten

```typescript
const session = await autoRepair.startRepairSession(false);

// Bei Problemen sofort Rollback
if (problemDetected) {
  await autoRepair.rollbackSession(session.id);
}
```

### 4. Reports regelmäßig prüfen

```typescript
const reports = await healingReport.getReports(10);
const unhealthy = reports.filter(r => r.healthStatus === 'unhealthy');

if (unhealthy.length > 3) {
  console.error('Viele unhealthy Reports - System prüfen!');
}
```

---

## Ressourcen

- **Source Code:** `apps/backend/src/routes/selfhealing/`
- **Migrations:** `apps/backend/src/migrations/`
- **Tests:** `apps/backend/src/routes/selfhealing/__tests__/`

---

## Support & Feedback

Bei Fragen oder Problemen:

1. Logs prüfen (`pino` structured logs)
2. Health-Check manuell ausführen
3. Issue im GitHub Repository erstellen

---

**Letzte Aktualisierung:** 2025-12-20  
**Version:** 1.0.0
