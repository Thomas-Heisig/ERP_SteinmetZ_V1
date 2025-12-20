# Utils - Backend Hilfsfunktionen

Zentrale Utilities für das Backend mit Logging, Fehlerbehandlung, Datenbankmigrationen und allgemeinen Helfer.

## 📁 Verzeichnisstruktur

```text
src/utils/
src/utils/
├── errorResponse.ts        # Standardisierte Error-Response-Funktionen
├── globalApp.ts            # Globale Express-App-Instanz
├── icsGenerator.ts         # ICS (iCalendar) Generierung
├── logger.ts               # Strukturiertes Logging mit Pino
├── migrateSchema.ts        # Schema-Migrationen (direkt)
├── migrateSchema.test.ts   # Tests für Schema-Migration
├── runMigrations.ts        # Migration Runner
└── docs/
    └── README.md           # Diese Datei
```

## 🔧 Module

### 1. errorResponse.ts

Standardisierte Error-Response-Struktur für alle API-Responses.

**Features:**

- Typsichere Error-Interfaces
- Vordefinierte Error-Codes
- Helper-Funktionen für Standard-HTTP-Fehler

**Verwendung:**

```typescript
import { sendBadRequest, sendNotFound } from '../utils/errorResponse';

// Bad Request (400)
sendBadRequest(res, "Invalid input", { field: "email" });

// Not Found (404)
sendNotFound(res, "User not found");

// Validation Error (422)
sendValidationError(res, "Validation failed", { errors: [...] });
```

**Verfügbare Error-Funktionen:**

| Funktion | Status | ErrorCode |
| --- | --- | --- |
| `sendBadRequest` | 400 | BAD_REQUEST |
| `sendUnauthorized` | 401 | UNAUTHORIZED |
| `sendForbidden` | 403 | FORBIDDEN |
| `sendNotFound` | 404 | NOT_FOUND |
| `sendValidationError` | 422 | VALIDATION_ERROR |
| `sendRateLimitError` | 429 | RATE_LIMIT_EXCEEDED |
| `sendInternalError` | 500 | INTERNAL_ERROR |
| `sendServiceUnavailable` | 503 | SERVICE_UNAVAILABLE |

### 2. logger.ts

Strukturiertes Logging-System basierend auf Pino mit Kontext und spezialisierten Loggern.

**Features:**

- Pino-basiertes strukturiertes Logging
- Modul-spezifische Logger
- Spezialisierte Logging-Methoden für HTTP, DB, Auth, Security
- Middleware für Express
- Kontext-Logger für asynchrone Operationen

**Verwendung:**

```typescript
import { createLogger } from './logger';

const logger = createLogger('my-module');

// Strukturiertes Logging
logger.info({ userId: '123', action: 'login' }, 'User logged in');
logger.error({ error, endpoint: '/api/users' }, 'Request failed');

// Spezialisierte Logger
import { dbLogger, authLogger, securityLogger } from './logger';

dbLogger.database('SELECT', 150, 5); // operation, duration, rowCount
authLogger.request(req, res, 50); // req, res, duration
securityLogger.security('login_attempt', { userId: '123' });
```

**Vorkonfigurierte Logger:**

- `dbLogger` - Datenbank-Operationen
- `apiLogger` - API-Routes
- `authLogger` - Authentifizierung
- `documentsLogger` - Dokumentenverwaltung
- `workflowLogger` - Workflows
- `errorLogger` - Fehler
- `securityLogger` - Security-Events

**Express Middleware:**

```typescript
import { loggerMiddleware } from './logger';

app.use(loggerMiddleware);
// Jetzt ist req.logger verfügbar
```

### 3. globalApp.ts

Globale Express-App-Instanz für Zugriff aus Services und Routern.

**Features:**

- Zentrale App-Verwaltung
- Kompatibilität mit globalThis
- Fehlerbehandlung bei fehlender Instanz

**Verwendung:**

```typescript
import { GlobalApp } from './globalApp';

// App registrieren (in index.ts)
GlobalApp.set(app);

// App abrufen (aus Services/Routern)
const app = GlobalApp.get();
```

### 4. icsGenerator.ts

Generiert ICS (iCalendar) Format-Dateien aus Kalender-Events.

**Features:**

- RFC 5545 kompatible ICS-Generierung
- Unterstützung für Ganztags-Events
- Teilnehmer und Erinnerungen
- Organizer-Information

**Verwendung:**

```typescript
import { createICS } from './icsGenerator';

const events = [
  {
    id: 'event-1',
    title: 'Team Meeting',
    start: new Date('2025-01-15T10:00:00'),
    end: new Date('2025-01-15T11:00:00'),
    description: 'Weekly sync',
    location: 'Conference Room A',
    attendees: ['john@example.com', 'jane@example.com'],
    reminders: [15, 30], // Minuten vor Event
  }
];

const icsContent = createICS(events);
// Kann als .ics Datei heruntergeladen werden
```

### 5. migrateSchema.ts

Direkte Schema-Migrations-Ausführung für SQLite-Datenbanken.

**Features:**

- Idempotente Migrationen
- Spalten-Existenz-Prüfung
- Fehlerbehandlung mit Rollback
- Migrations-Tracking
- Unterstützung für explizite Transaktionen

**Verwendung:**

```bash
# Direkt ausführen
node src/utils/migrateSchema.ts
```

**Migrations-Datei Struktur:**

```sql
-- Migration: Create users table
-- Description: Initializes the users table
-- Database: SQLite

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### 6. runMigrations.ts

Programmgesteuerte Migration Runner mit CLI-Support.

**Features:**

- Programmgesteuert nutzbar
- CLI-Eintrypoint
- Fehlerbehandlung mit Transaktionen
- MSSQL-spezifische Migrationen überspringen für SQLite

**Verwendung:**

```typescript
import { runAllMigrations } from './runMigrations';

const result = await runAllMigrations();
console.log(`Executed: ${result.executed}, Failed: ${result.failed}`);
```

**CLI-Verwendung:**

```bash
node src/utils/runMigrations.ts
```

### 7. migrateSchema.test.ts

Vitest-Tests für das Schema-Migrations-System.

**Tests:**

- ✅ Schema Migrations Tabelle erstellen
- ✅ Migrationen tracking
- ✅ Verhindert doppeltes Ausführen
- ✅ Fehlerbehandlung
- ✅ Spalten-Existenz-Prüfung

**Ausführung:**

```bash
npm run test -- migrateSchema.test.ts
```

## 🎯 Best Practices

### Logging

```typescript
// ✅ RICHTIG: Strukturiertes Logging mit Kontext
logger.info(
  { userId: '123', action: 'login', timestamp: Date.now() },
  'User logged in'
);

// ❌ FALSCH: String-Konkatenation
logger.info('User 123 logged in at ' + new Date());
```

### Error Handling

```typescript
// ✅ RICHTIG: Typsichere Error-Responses
try {
  const user = await userService.getById(id);
  if (!user) {
    return sendNotFound(res, `User ${id} not found`);
  }
  res.json({ success: true, data: user });
} catch (error) {
  logger.error({ error, userId: id }, 'Failed to get user');
  return sendInternalError(res);
}

// ❌ FALSCH: Unsichere Error-Responses
res.json({ error: error.message });
```

### Migrationen

```sql
-- ✅ RICHTIG: Idempotente Migration
CREATE TABLE IF NOT EXISTS users (...);
INSERT OR IGNORE INTO roles VALUES (...);

-- ❌ FALSCH: Fehlerhafte zweite Ausführung
CREATE TABLE users (...);  -- Fehler beim 2. Lauf!
INSERT INTO roles VALUES (...);  -- Dupliziert Daten!
```

## 🔗 Abhängigkeiten

- **pino** - Strukturiertes Logging
- **better-sqlite3** - SQLite Datenbankabstraktion
- **zod** (in anderen Modulen) - Runtime Validierung

## 📊 Import-Beispiele

```typescript
// Error Response
import {
  sendErrorResponse,
  sendBadRequest,
  sendUnauthorized,
  ErrorCode,
} from '../utils/errorResponse.js';

// Logger
import { createLogger, dbLogger, authLogger } from '../utils/logger.js';
import { loggerMiddleware } from '../utils/logger.js';

// Global App
import { GlobalApp } from '../utils/globalApp.js';

// ICS Generator
import { createICS } from '../utils/icsGenerator.js';

// Migrations
import { runAllMigrations } from '../utils/runMigrations.js';
```

## 🚀 Performance Tips

1. **Logging-Level**: Setze `LOG_LEVEL=warn` in Production
2. **Strukturierte Daten**: Nutze nur serialisierbare Objekte
3. **Database Logging**: Nur für Development aktivieren (`DB_LOGGING=true`)
4. **Migrations**: Führe Migrationen asynchron aus

## 🐛 Troubleshooting

### Problem: Logger zeigt nicht alle Ausgaben

- Prüfe `LOG_LEVEL` Environment Variable
- Stelle sicher, dass `createLogger` mit korrektem Modul-Namen aufgerufen wird

### Problem: Doppelte Migrationen

- Überprüfe, dass die schema_migrations Tabelle existiert
- Stelle sicher, dass Migrations-Dateien `.sql` Endung haben

### Problem: ICS-Dateien werden nicht erkannt

- Setze korrekten Content-Type: `text/calendar; charset=utf-8`
- Verwende `.ics` Dateiendung beim Download

## 📝 Weitere Ressourcen

- [Pino Dokumentation](https://getpino.io)
- [RFC 5545 - iCalendar Specification](https://tools.ietf.org/html/rfc5545)
- [SQLite Pragma Dokumentation](https://www.sqlite.org/pragma.html)
- [DATABASE_MIGRATION_STANDARDS.md](../../docs/DATABASE_MIGRATION_STANDARDS.md)
- [ERROR_HANDLING.md](../../docs/ERROR_HANDLING.md)
