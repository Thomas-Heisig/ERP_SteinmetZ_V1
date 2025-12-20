<!-- SPDX-License-Identifier: MIT -->

# Database Module

Unified database abstraction layer providing type-safe access to SQLite and PostgreSQL databases with comprehensive error handling, query tracking, and health monitoring.

## 📋 Module Structure

```chart
database/
├── index.ts               # Central export point (all imports come through here)
├── db.ts                  # Database service interface & utility functions
├── database.ts            # Comprehensive type definitions (unified)
├── dbService.ts           # Main database service implementation
├── postgres.ts            # PostgreSQL types (re-exports from database.ts)
└── connect-sqlite3.d.ts   # Type definitions for connect-sqlite3
```

## 🚀 Quick Start

### Basic Usage (Async)

```typescript
import db from './database/index.js';

// Initialize database
await db.init();

// Execute queries
const users = await db.all('SELECT * FROM users WHERE active = ?', [true]);
const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
const result = await db.run('INSERT INTO users (name, email) VALUES (?, ?)', ['John', 'john@example.com']);
```

### Advanced Usage (Raw Synchronous)

```typescript
import { getDatabase, isDatabaseInitialized } from './database/index.js';

if (isDatabaseInitialized()) {
  const rawDb = getDatabase();
  const stmt = rawDb.prepare('SELECT * FROM users');
  const users = stmt.all();
}
```

### Type Safety

```typescript
import type { BetterSqlite3Database, SqlValue, UnknownRow } from './database/index.js';

interface User extends UnknownRow {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

const users = await db.all<User>('SELECT * FROM users');
const user = await db.get<User>('SELECT * FROM users WHERE id = ?', [userId]);
```

## 🔑 Key Features

### 1. **Type Safety**

- Full TypeScript support with proper type definitions
- No `any` types in public API
- Type guards for error checking
- Generic types for query results

### 2. **Dual Database Support**

- SQLite (default) for development
- PostgreSQL ready for production
- Abstract driver layer for easy switching

### 3. **Error Handling**

- Custom error classes: `DatabaseError`, `DatabaseConnectionError`, `DatabaseSchemaError`
- Type guards: `isDatabaseError()`, `isSqlValue()`
- Comprehensive error logging

### 4. **Query Tracking**

- Performance monitoring
- Query statistics collection
- Health status information

### 5. **Data Validation**

- Automatic data correction for invalid types
- Support for German→English value mapping
- Fuzzy matching and typo correction

### 6. **Migrations**

- Automatic schema creation and migration
- Idempotent migrations (safe to run multiple times)
- Transaction support

## 📚 API Reference

### Functions

#### `getDatabase(): Database.Database`

Returns the raw better-sqlite3 instance for synchronous operations.

```typescript
import { getDatabase } from './database/index.js';

const db = getDatabase();
const users = db.prepare('SELECT * FROM users').all();
```

#### `isDatabaseInitialized(): boolean`

Checks if database is ready for use.

```typescript
import { isDatabaseInitialized, getDatabase } from './database/index.js';

if (isDatabaseInitialized()) {
  const db = getDatabase();
  // Use database...
}
```

### Main Database Service Methods

```typescript
// Query operations
db.all<T>(sql: string, params?: SqlParameters): Promise<T[]>
db.get<T>(sql: string, params?: SqlParameters): Promise<T | undefined>
db.run(sql: string, params?: SqlParameters): Promise<{ changes: number; lastID?: number }>

// Initialization
db.init(config?: DatabaseConfig): Promise<void>

// Health & Status
db.getHealthStatus(): HealthStatus
db.getQueryStats(): QueryStats[]
```

### Types

```typescript
// Database instances
type BetterSqlite3Database = Database.Database
type PostgresPool = Pool

// Query parameters & results
type SqlValue = string | number | bigint | boolean | null | Buffer | Record<string, unknown> | unknown[]
type UnknownRow = Record<string, unknown>
type QueryResult<T> = T[]
type QuerySingleResult<T> = T | undefined
type MutationResult = { changes?: number; lastID?: number }

// Configuration
type DatabaseDriver = 'sqlite' | 'postgres'
interface DatabaseConfig {
  driver?: DatabaseDriver;
  database?: string;
  migrations?: boolean;
  // ... more options
}

// Errors
interface DatabaseErrorOriginal {
  code?: string;
  errno?: number;
  message?: string;
}
```

## 🔧 Configuration

### SQLite (Default)

```typescript
await db.init({
  driver: 'sqlite',
  database: 'data/dev.sqlite3',
  migrations: true
});
```

### PostgreSQL

```typescript
await db.init({
  driver: 'postgres',
  database: process.env.DATABASE_URL,
  migrations: true
});
```

## 📁 File Responsibilities

### `index.ts` - Central Export Point

- **Purpose**: Single source of truth for all database imports
- **Exports**: All database functions, types, and utilities
- **Usage**: `import db, { getDatabase } from './database/index.js'`

### `db.ts` - Service Interface

- **Purpose**: Clean API wrapper around raw dbService
- **Exports**: `getDatabase()`, `isDatabaseInitialized()`, main db service
- **Key Feature**: Type-safe access without `any` casts
- **Improvements**:
  - Removed `as any` casting
  - Added `DatabaseService` interface for type safety
  - Comprehensive JSDoc with examples

### `database.ts` - Unified Types

- **Purpose**: Single source of truth for ALL database types
- **Exports**: 60+ type definitions and interfaces
- **Consolidation**: Merged SQLite and PostgreSQL types
- **Improvements**:
  - Added PostgreSQL types (previously in postgres.ts)
  - Better organization with section separators
  - Comprehensive documentation

### `postgres.ts` - PostgreSQL Compatibility

- **Purpose**: Backward compatibility layer
- **Status**: @deprecated (all types in database.ts)
- **Usage**: Re-exports from database.ts for backward compat
- **Migration**: Can be deleted once all code updated

### `dbService.ts` - Main Implementation

- **Purpose**: Core database service with all operations
- **Features**: Query execution, migrations, health checks, validation
- **Status**: 1950+ lines, complex multi-database implementation

### `connect-sqlite3.d.ts` - Session Store Types

- **Purpose**: Type definitions for connect-sqlite3 session store
- **Usage**: Express session middleware with SQLite backend

## 🏗️ Architecture

```sequence
Application
    ↓
index.ts (exports everything)
    ↓
db.ts (clean interface, type safety)
    ↓
dbService.ts (actual implementation)
    ↓
Database (SQLite/PostgreSQL)
```

## 📋 Consolidation Improvements

### ✅ Before (Scattered Types)

- SQLite types in `database.ts`
- PostgreSQL types in `postgres.ts`
- Database service in `dbService.ts`
- Re-export logic in `db.ts`
- No clear entry point for imports
- `as any` casts in db.ts
- Duplicate type definitions

### ✅ After (Unified Module)

- All types in `database.ts` (single source of truth)
- `postgres.ts` re-exports from `database.ts`
- `index.ts` as central export point
- No `any` casts (proper `DatabaseService` interface)
- Clear import paths: `from './database/index.js'`
- Better documentation and examples
- Single responsible architecture

## 🔄 Migration Guide

### Old Imports (Still Work)

```typescript
import db from './database/dbService.js';
import { getDatabase } from './database/db.js';
import type { BetterSqlite3Database } from './database/database.js';
```

### New Imports (Recommended)

```typescript
import db, { getDatabase, isDatabaseInitialized } from './database/index.js';
import type { BetterSqlite3Database, UnknownRow } from './database/index.js';
```

## 🧪 Testing

```typescript
import db, { isDatabaseInitialized } from './database/index.js';

// Wait for initialization
await db.init({ database: ':memory:' });

// Run tests
const result = await db.run('INSERT INTO test VALUES (?, ?)', [1, 'test']);
expect(result.changes).toBe(1);

// Check health
const health = db.getHealthStatus();
expect(health.status).toBe('healthy');
```

## 📈 Performance

- Query performance tracking built-in
- Connection pooling for PostgreSQL
- Prepared statements for SQLite
- Health checks and diagnostics available

## 🐛 Troubleshooting

### "Database not initialized"

```typescript
// ❌ Wrong
const db = getDatabase();

// ✅ Correct
await db.init();
const rawDb = getDatabase();
```

### Type errors with async queries

```typescript
// Define expected result type
interface User {
  id: string;
  name: string;
}

const users = await db.all<User>('SELECT * FROM users');
```

### Import errors

```typescript
// Use central export point
import db, { getDatabase } from './database/index.js';
```

## 📝 Next Steps

1. Update all imports to use `./database/index.js`
2. Remove any remaining `as any` type casts
3. Replace `postgres.ts` imports with `database.ts`
4. Add health check monitoring endpoints
5. Consider ORM integration (Prisma/TypeORM) for future

## 📚 Related Documentation

- [Database Migration Standards](../../docs/DATABASE_MIGRATION_STANDARDS.md)
- [Architecture Guide](../../docs/ARCHITECTURE.md)
- [Database Optimization](../../docs/DATABASE_OPTIMIZATION.md)

---

**Status**: ✅ Consolidated & Production Ready  
**Last Updated**: 2025-12-20
