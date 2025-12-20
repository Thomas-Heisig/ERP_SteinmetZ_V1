# GitHub Copilot Instructions für ERP SteinmetZ

## Allgemeine Richtlinien

- Verwende TypeScript für alle Backend- und Frontend-Code
- Folge den ESLint-Regeln in `eslint.config.js`
- Schreibe JSDoc-Kommentare für alle öffentlichen Funktionen und Klassen
- Nutze strukturiertes Logging mit Pino
- Implementiere umfassende Fehlerbehandlung

## Database Migrations

**KRITISCH: Befolge diese Standards für alle Datenbank-Migrationen**

### Migration-Datei erstellen

```sql
-- SPDX-License-Identifier: MIT
-- Migration: [Kurzbeschreibung]
-- Description: [Detaillierte Beschreibung]
-- Database: SQLite
-- Created: YYYY-MM-DD

-- [SQL Code hier]
```

### Dateibenennungs-Konvention

Format: `<prefix>_<beschreibender_name>.sql`

Prefixe:
- `001-009` = Core-System (Auth, RBAC, Settings)
- `010-049` = Tabellen-Erstellung
- `050-059` = Tabellen-Modifikationen (ALTER TABLE)
- `060-099` = Daten-Population (Seed Data)
- `100-199` = Erweiterte Konfigurationen
- `200-299` = Feature-Migrations
- `900-999` = Hotfixes

### SQLite-Syntax OBLIGATORISCH

**Verwende IMMER:**
```sql
-- Tabellen
CREATE TABLE IF NOT EXISTS tablename (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_name ON tablename(column);

-- Daten einfügen
INSERT OR IGNORE INTO tablename (id, name) VALUES ('1', 'Test');
```

**NIEMALS verwenden:**
```sql
-- ❌ MS SQL Server Syntax
IF NOT EXISTS (SELECT * FROM sys.objects...)
BEGIN ... END
GO
NVARCHAR(255)     → Nutze: TEXT
BIT               → Nutze: INTEGER
DATETIME2         → Nutze: TEXT
GETDATE()         → Nutze: CURRENT_TIMESTAMP
NEWID()           → Nutze: lower(hex(randomblob(16)))
```

### Typ-Mapping

| MS SQL Server | SQLite | Verwendung |
|--------------|--------|------------|
| `NVARCHAR(n)` | `TEXT` | Strings |
| `BIT` | `INTEGER` | Boolean (0/1) |
| `INT` | `INTEGER` | Zahlen |
| `DECIMAL(p,s)` | `REAL` | Dezimalzahlen |
| `DATETIME` | `TEXT` | ISO 8601 Datum/Zeit |
| `UNIQUEIDENTIFIER` | `TEXT` | UUIDs |

### Idempotenz

Alle Migrationen MÜSSEN idempotent sein:

```sql
-- ✅ Korrekt
CREATE TABLE IF NOT EXISTS users (...);
INSERT OR IGNORE INTO roles VALUES (...);

-- ❌ Falsch
CREATE TABLE users (...);  -- Fehler beim 2. Lauf!
INSERT INTO roles VALUES (...);  -- Dupliziert Daten!
```

### Foreign Keys

SQLite unterstützt KEIN `ALTER TABLE ADD CONSTRAINT FOREIGN KEY`.

```sql
-- ✅ Korrekt: In CREATE TABLE
CREATE TABLE user_roles (
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ❌ Falsch: Nach Tabellenerstellung
ALTER TABLE user_roles 
ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);
```

### Dokumentation

Vollständige Standards siehe: [docs/DATABASE_MIGRATION_STANDARDS.md](../docs/DATABASE_MIGRATION_STANDARDS.md)

## API-Entwicklung

### Route Handler

```typescript
/**
 * Handler-Beschreibung
 * @route GET /api/resource
 * @access Public/Private
 */
router.get('/resource', async (req: Request, res: Response) => {
  try {
    const result = await service.getResource();
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error({ error }, 'Failed to get resource');
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});
```

### Service Layer

```typescript
/**
 * Service-Klasse Beschreibung
 */
export class ResourceService {
  /**
   * Methoden-Beschreibung
   * @param {string} id - Parameter-Beschreibung
   * @returns {Promise<Resource>} Return-Beschreibung
   * @throws {NotFoundError} Wann der Fehler geworfen wird
   */
  async getById(id: string): Promise<Resource> {
    const resource = await db.get('SELECT * FROM resources WHERE id = ?', [id]);
    if (!resource) {
      throw new NotFoundError('Resource not found');
    }
    return resource;
  }
}
```

## Frontend (React/TypeScript)

### Komponenten

```typescript
/**
 * Komponenten-Beschreibung
 * @example
 * <ResourceList resources={resources} onSelect={handleSelect} />
 */
export const ResourceList: React.FC<ResourceListProps> = ({ 
  resources, 
  onSelect 
}) => {
  return (
    <div className="resource-list">
      {resources.map(resource => (
        <ResourceItem 
          key={resource.id} 
          resource={resource} 
          onClick={() => onSelect(resource.id)} 
        />
      ))}
    </div>
  );
};
```

### State Management

- Nutze React Query für Server-State
- Nutze Zustand für Client-State
- Vermeide unnötiges useState

## Testing

### Unit Tests (Vitest)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('ResourceService', () => {
  let service: ResourceService;

  beforeEach(() => {
    service = new ResourceService();
  });

  it('should get resource by id', async () => {
    const resource = await service.getById('123');
    expect(resource).toBeDefined();
    expect(resource.id).toBe('123');
  });

  it('should throw NotFoundError when resource does not exist', async () => {
    await expect(service.getById('invalid')).rejects.toThrow(NotFoundError);
  });
});
```

## Fehlerbehandlung

### Custom Errors

```typescript
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### Error Middleware

```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err, req: { method: req.method, url: req.url } }, 'Request error');

  if (err instanceof ValidationError) {
    return res.status(400).json({ 
      success: false, 
      error: err.message, 
      fields: err.fields 
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ 
      success: false, 
      error: err.message 
    });
  }

  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});
```

## Logging

### Strukturiertes Logging

```typescript
import { createLogger } from './utils/logger';

const logger = createLogger('module-name');

// Info
logger.info({ userId: '123', action: 'login' }, 'User logged in');

// Error
logger.error({ error, userId: '123' }, 'Login failed');

// Debug
logger.debug({ query: 'SELECT * FROM users' }, 'Executing query');
```

## Security

### Input Validation

```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8)
});

const validateCreateUser = (data: unknown) => {
  return createUserSchema.parse(data);
};
```

### SQL Injection Prevention

```typescript
// ✅ Korrekt: Prepared Statements
db.get('SELECT * FROM users WHERE id = ?', [userId]);

// ❌ Falsch: String Concatenation
db.get(`SELECT * FROM users WHERE id = '${userId}'`);
```

## Performance

### Database Queries

```typescript
// ✅ Effizient: Nur benötigte Spalten
db.all('SELECT id, name FROM users WHERE is_active = 1');

// ❌ Ineffizient: SELECT *
db.all('SELECT * FROM users');
```

### Caching

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 Minuten

async function getCachedResource(id: string) {
  const cached = cache.get<Resource>(id);
  if (cached) return cached;

  const resource = await db.get('SELECT * FROM resources WHERE id = ?', [id]);
  cache.set(id, resource);
  return resource;
}
```

## Code Style

### Naming Conventions

- **Dateien:** kebab-case (`user-service.ts`)
- **Klassen:** PascalCase (`UserService`)
- **Funktionen:** camelCase (`getUserById`)
- **Konstanten:** UPPER_SNAKE_CASE (`MAX_LOGIN_ATTEMPTS`)
- **Interfaces:** PascalCase mit 'I' prefix optional (`IUser` oder `User`)

### Imports

```typescript
// ✅ Korrekt: Gruppiert und sortiert
import fs from 'node:fs';
import path from 'node:path';

import express from 'express';
import { z } from 'zod';

import { UserService } from './services/user-service.js';
import { createLogger } from './utils/logger.js';
import type { User } from './types/user.js';

// ❌ Falsch: Ungeordnet
import { createLogger } from './utils/logger.js';
import express from 'express';
import { UserService } from './services/user-service.js';
import path from 'node:path';
```

## Git Commit Messages

```
feat: Add user authentication system
fix: Resolve database connection timeout
docs: Update API documentation
refactor: Simplify error handling logic
test: Add unit tests for UserService
chore: Update dependencies
```

---

**Letzte Aktualisierung:** 2025-12-20  
**Vollständige Dokumentation:** [docs/](../docs/)
