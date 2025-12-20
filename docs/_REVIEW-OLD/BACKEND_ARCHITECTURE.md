# Backend-Architektur - Technisches Referenz-Dokument

**Letzte Aktualisierung:** 20. Dezember 2025  
**Version:** 1.0.0  
**Status:** ✅ Produktionsreif

---

## 📋 Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Architektur-Schichten](#architektur-schichten)
3. [Type-System](#type-system)
4. [Error-Handling](#error-handling)
5. [Service-Architektur](#service-architektur)
6. [Datenbankschicht](#datenbankschicht)
7. [Middleware & Validierung](#middleware--validierung)
8. [Best Practices](#best-practices)

---

## Überblick

### Prinzipien

Das Backend folgt diesen Architektur-Prinzipien:

✅ **Single Responsibility** - Jede Klasse hat eine Aufgabe  
✅ **Dependency Injection** - Lose Kopplung zwischen Komponenten  
✅ **Type Safety** - 100% TypeScript mit Zod-Validierung  
✅ **Structured Logging** - Pino für Performance  
✅ **Error Recovery** - Graceful Error Handling  

### Schichten-Modell

```
┌─────────────────────────────────────┐
│     HTTP Layer (Express)            │
│     Routes + Middleware             │
├─────────────────────────────────────┤
│     API Layer                       │
│     Request Validation (Zod)        │
│     Response Formatting             │
├─────────────────────────────────────┤
│     Service Layer                   │
│     Business Logic                  │
│     Transaction Management          │
├─────────────────────────────────────┤
│     Database Layer                  │
│     Query Execution                 │
│     Connection Management           │
├─────────────────────────────────────┤
│     Data Layer                      │
│     SQLite / PostgreSQL             │
└─────────────────────────────────────┘
```

---

## Architektur-Schichten

### 1️⃣ HTTP Layer (Express)

**Dateiort:** `apps/backend/src/routes/`

```typescript
import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { UserService } from '../service/UserService.js';

const router = express.Router();
const userService = new UserService(db);

/**
 * GET /api/users/:id
 * Benutzer abrufen
 * @param id User-ID
 * @returns User-Objekt
 */
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error); // An Error Handler
  }
});

export default router;
```

**Verantwortungen:**
- HTTP-Request/Response Handling
- Route Definitionen
- Middleware Verkettung
- Error Propagation

### 2️⃣ API Layer

**Dateiort:** `apps/backend/src/middleware/`

```typescript
import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger.js';
import { toAPIError } from '../types/errors.js';

const logger = createLogger('api');

/**
 * Globaler Error Handler
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = toAPIError(err);
  
  res.status(error.statusCode).json({
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
  
  logger.error({ error, requestId: req.id }, 'Request error');
};

/**
 * Request Validation mit Zod
 */
export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      req.validated = parsed;
      next();
    } catch (error) {
      next(new ValidationError('Invalid request', parseZodErrors(error)));
    }
  };
};
```

**Verantwortungen:**
- Request Validation (Zod)
- Response Formatting
- Error Handling
- Logging

### 3️⃣ Service Layer

**Dateiort:** `apps/backend/src/service/`

```typescript
import { DatabaseService } from './DatabaseService.js';
import { NotFoundError, ValidationError } from '../types/errors.js';

/**
 * Business-Logik für Benutzer
 */
export class UserService {
  constructor(private db: DatabaseService) {}

  /**
   * Benutzer nach ID abrufen
   * @param id User-ID
   * @returns User-Objekt
   * @throws NotFoundError wenn Benutzer nicht existiert
   */
  async getById(id: string) {
    const user = await this.db.get(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      throw new NotFoundError(`User ${id} not found`, { userId: id });
    }

    return user;
  }

  /**
   * Benutzer erstellen
   * @param data User-Daten
   * @returns Neue User-ID
   * @throws ValidationError bei ungültigen Daten
   */
  async create(data: CreateUserInput) {
    // Validierung
    if (!data.email?.includes('@')) {
      throw new ValidationError('Invalid email', { field: 'email' });
    }

    // Insert
    const result = await this.db.run(
      'INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)',
      [generateId(), data.name, data.email, data.role]
    );

    return result.lastInsertRowid;
  }

  /**
   * Benutzer aktualisieren
   * @param id User-ID
   * @param data Update-Daten
   */
  async update(id: string, data: UpdateUserInput) {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.email) {
      updates.push('email = ?');
      values.push(data.email);
    }

    if (updates.length === 0) return;

    values.push(id);
    await this.db.run(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * Benutzer löschen
   * @param id User-ID
   */
  async delete(id: string) {
    await this.db.run('DELETE FROM users WHERE id = ?', [id]);
  }
}
```

**Verantwortungen:**
- Business-Logik
- Datenvalidierung
- Transaktionen
- Error Handling

### 4️⃣ Database Layer

**Dateiort:** `apps/backend/src/service/DatabaseService.ts`

```typescript
import Database from 'better-sqlite3';
import { DatabaseConfig } from '../types/database.js';
import { DatabaseError } from '../types/errors.js';

/**
 * Zentrale Datenbank-Abstraktionsschicht
 * Unterstützt SQLite und PostgreSQL
 */
export class DatabaseService {
  private db: any;
  private config: DatabaseConfig;
  private stats = { total: 0, errors: 0, lastQuery: '' };

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * Datenbankverbindung initialisieren
   */
  async init(): Promise<void> {
    try {
      if (this.config.driver === 'sqlite') {
        this.db = new Database(this.config.sqliteFile);
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');
      } else if (this.config.driver === 'postgres') {
        // PostgreSQL-Initialisierung
        const { Pool } = await import('pg');
        this.db = new Pool({ connectionString: this.config.postgresUri });
      }
    } catch (error) {
      throw new DatabaseError('Failed to initialize database', '', [], error);
    }
  }

  /**
   * SELECT Query ausführen
   */
  async all<T>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const stmt = this.db.prepare(sql);
      const results = stmt.all(...params) as T[];
      this.trackQuery(sql);
      return results;
    } catch (error) {
      throw new DatabaseError('Query failed', sql, params, error);
    }
  }

  /**
   * SELECT Query ausführen (einzelner Datensatz)
   */
  async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.get(...params) as T | undefined;
      this.trackQuery(sql);
      return result;
    } catch (error) {
      throw new DatabaseError('Query failed', sql, params, error);
    }
  }

  /**
   * INSERT / UPDATE / DELETE Query ausführen
   */
  async run(sql: string, params: any[] = []): Promise<MutationResult> {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(...params);
      this.trackQuery(sql);
      return {
        changes: result.changes,
        lastInsertRowid: result.lastInsertRowid,
      };
    } catch (error) {
      throw new DatabaseError('Mutation failed', sql, params, error);
    }
  }

  /**
   * Transaktion ausführen
   */
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    const transaction = this.db.transaction(callback);
    try {
      return await transaction();
    } catch (error) {
      throw new DatabaseError('Transaction failed', '', [], error);
    }
  }

  /**
   * Health Check
   */
  async healthCheck(): Promise<HealthStatus> {
    try {
      const start = Date.now();
      await this.get('SELECT 1');
      const latency = Date.now() - start;

      return {
        status: latency < 100 ? 'healthy' : 'degraded',
        latency,
        driver: this.config.driver,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: -1,
        driver: this.config.driver,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Query-Statistiken tracken
   */
  private trackQuery(sql: string): void {
    this.stats.total++;
    this.stats.lastQuery = sql;
  }
}
```

**Verantwortungen:**
- Datenbankverbindung
- Query Execution
- Connection Management
- Query Stats

---

## Type-System

### Zod Schemas

**Dateiort:** `apps/backend/src/types/database.ts`

```typescript
import { z } from 'zod';

/**
 * Konfigurationsschema für Datenbankverbindung
 */
export const DatabaseConfigSchema = z.discriminatedUnion('driver', [
  z.object({
    driver: z.literal('sqlite'),
    sqliteFile: z.string(),
    enableWAL: z.boolean().optional(),
    logging: z.boolean().optional(),
  }),
  z.object({
    driver: z.literal('postgres'),
    postgresUri: z.string().url(),
    connectionTimeout: z.number().optional(),
    idleTimeout: z.number().optional(),
  }),
]);

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

/**
 * Query-Parameter Schema
 */
export const QueryParamsSchema = z.object({
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  sort: z.string().optional(),
  filter: z.record(z.string()).optional(),
});

/**
 * Typ für Abfrageergebnisse
 */
export interface QueryResult<T> {
  data: T[];
  count: number;
  total: number;
  hasMore: boolean;
}

/**
 * Typ für Mutationsergebnisse
 */
export interface MutationResult {
  changes: number;
  lastInsertRowid?: number | bigint;
}
```

**Vorteile:**

✅ Runtime-Validierung  
✅ Type Inference  
✅ IDE Autocompletion  
✅ Self-Documenting Code  

---

## Error-Handling

### Error-Hierarchie

```typescript
APTError (base)
├── BadRequestError (400)
├── UnauthorizedError (401)
├── ForbiddenError (403)
├── NotFoundError (404)
├── ConflictError (409)
├── ValidationError (400)
├── RateLimitError (429)
├── DatabaseError (500)
│   ├── DatabaseConnectionError (503)
│   ├── DatabaseSchemaError (500)
│   └── TransactionError (500)
├── InternalServerError (500)
├── ServiceUnavailableError (503)
├── TimeoutError (504)
├── ExternalApiError (502)
└── PaymentError (400)
```

### Verwendungsbeispiele

```typescript
// NotFoundError
if (!user) {
  throw new NotFoundError('User not found', { userId: '123' });
}

// ValidationError
if (!email.includes('@')) {
  throw new ValidationError('Invalid email', { field: 'email', value: email });
}

// DatabaseError (mit Context)
try {
  await db.run(sql, params);
} catch (error) {
  throw new DatabaseError('Insert failed', sql, params, error);
}

// UnauthorizedError
if (!token) {
  throw new UnauthorizedError('Token required');
}
```

### Error Recovery

```typescript
// Retry Logic
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await sleep(Math.pow(2, i) * 1000); // Exponential backoff
      }
    }
  }
  
  throw lastError!;
}

// Verwendung
const result = await withRetry(() => db.get(sql, params));
```

---

## Service-Architektur

### Struktur

```
src/service/
├── index.ts                    # Zentrale Exports
├── DatabaseService.ts          # Datenbankabstraktions
├── DocumentService.ts          # DMS
├── UserService.ts             # Benutzerverwaltung
├── AuthService.ts             # Authentifizierung
├── HRService.ts               # Personalverwaltung
└── FinanceService.ts          # Finanzmodul
```

### Service Pattern

```typescript
export class DocumentService {
  constructor(private db: DatabaseService) {}

  async getAll(filters?: DocumentFilters) {
    const sql = 'SELECT * FROM documents WHERE 1=1';
    // ... build query with filters
    return await this.db.all<Document>(sql, params);
  }

  async getById(id: string) {
    return await this.db.get<Document>(
      'SELECT * FROM documents WHERE id = ?',
      [id]
    );
  }

  async create(data: CreateDocumentInput) {
    const id = generateId();
    await this.db.run(
      'INSERT INTO documents (id, title, category, created_at) VALUES (?, ?, ?, ?)',
      [id, data.title, data.category, new Date().toISOString()]
    );
    return id;
  }

  async delete(id: string) {
    await this.db.run('DELETE FROM documents WHERE id = ?', [id]);
  }
}
```

---

## Datenbankschicht

### Migrations

**Format:** `<prefix>_<name>.sql`

```sql
-- SPDX-License-Identifier: MIT
-- Migration: Create users table
-- Description: Initialize users table for authentication
-- Database: SQLite
-- Created: 2025-12-20

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

### Query Best Practices

```typescript
// ✅ KORREKT: Prepared Statements
const user = await db.get(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// ❌ FALSCH: String Concatenation
const user = await db.get(
  `SELECT * FROM users WHERE id = '${userId}'` // SQL Injection!
);

// ✅ KORREKT: Named Parameters
const result = await db.all(
  'SELECT * FROM documents WHERE category = ? AND status = ?',
  [category, status]
);

// ✅ KORREKT: Transaktionen
await db.transaction(async () => {
  await db.run('INSERT INTO documents ...', []);
  await db.run('UPDATE document_versions ...', []);
});
```

---

## Middleware & Validierung

### Validierungs-Middleware

```typescript
/**
 * Erstellt Validierungs-Middleware für Zod-Schemas
 */
export function validateBody(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      const details = parseZodErrors(error);
      next(new ValidationError('Invalid request body', details));
    }
  };
}

// Verwendung
app.post(
  '/users',
  validateBody(CreateUserSchema),
  async (req, res, next) => {
    // req.body ist jetzt validiert und typsicher
    const result = await userService.create(req.body);
    res.json({ success: true, data: result });
  }
);
```

### Auth-Middleware

```typescript
/**
 * JWT Token Verifikation
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new UnauthorizedError('Token required');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = payload as UserPayload;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid token'));
  }
}

// Verwendung
router.get('/profile', authMiddleware, async (req, res) => {
  res.json({ success: true, data: req.user });
});
```

---

## Best Practices

### 1. Logging

```typescript
import { createLogger } from '../utils/logger.js';

const logger = createLogger('DocumentService');

logger.debug({ id }, 'Finding document');
logger.info({ count: results.length }, 'Documents found');
logger.warn({ expired: true }, 'Cache expired');
logger.error({ error }, 'Database error');
```

### 2. Error Handling

```typescript
try {
  const user = await userService.getById(id);
} catch (error) {
  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message, fields: error.fields });
  }
  throw error; // Unerwarteter Fehler
}
```

### 3. Type Safety

```typescript
// ✅ KORREKT: Type-sichere Generics
const users = await db.all<User>(sql, params);
const user = await db.get<User>(sql, params);

// ❌ FALSCH: Zu viel `any`
const result: any = await db.get(sql, params);
```

### 4. Performance

```typescript
// ✅ Indizes verwenden
CREATE INDEX idx_documents_category ON documents(category);

// ✅ Nur benötigte Spalten wählen
SELECT id, title, category FROM documents; // nicht SELECT *

// ✅ Pagination
SELECT * FROM documents LIMIT ? OFFSET ?;

// ✅ Query Stats tracken
const stats = db.getStats(); // { total, errors, lastQuery }
```

### 5. Testing

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseService } from './DatabaseService';

describe('DatabaseService', () => {
  let db: DatabaseService;

  beforeEach(async () => {
    db = new DatabaseService({
      driver: 'sqlite',
      sqliteFile: ':memory:', // In-memory für Tests
    });
    await db.init();
  });

  it('should insert and retrieve data', async () => {
    await db.run('CREATE TABLE test (id TEXT PRIMARY KEY, name TEXT)');
    await db.run('INSERT INTO test VALUES (?, ?)', ['1', 'Test']);
    const result = await db.get('SELECT * FROM test WHERE id = ?', ['1']);
    expect(result?.name).toBe('Test');
  });
});
```

---

**Letzte Aktualisierung:** 20. Dezember 2025 ✍️
