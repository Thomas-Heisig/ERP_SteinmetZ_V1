<!-- SPDX-License-Identifier: MIT -->

# 📦 Database Module - Complete Reference

> **Latest Version**: 2.0 (Major Redesign)  
> **Status**: ✅ Production Ready  
> **Last Updated**: 2025-12-20

## 🎯 Quick Links

- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** - Comprehensive API and usage guide
- **[REDESIGN_SUMMARY.md](./REDESIGN_SUMMARY.md)** - Before/after comparison
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Visual architecture diagrams
- **[IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)** - Integration tasks

---

## 🚀 Quick Start

### Using DatabaseRouterFactory (Recommended)

```typescript
import { DatabaseRouterFactory } from './database/index.js';

const factory = new DatabaseRouterFactory('users');

factory.get('/', async (req, res, db) => {
  const users = await db.query('SELECT * FROM users');
  res.json(users);
});

export default factory.getRouter();
```

### Using DatabaseManager Directly

```typescript
import { DatabaseManager } from './database/index.js';

// Initialize on app startup
await DatabaseManager.initialize();

// Use in routes
const users = await DatabaseManager.query('SELECT * FROM users');
```

---

## 📋 What's Included

### ✨ New Components

| Component | Purpose | Status |
|-----------|---------|--------|

| **DatabaseManager.ts** | Singleton with lazy initialization | ✅ Ready |
| **DatabaseRouterFactory.ts** | Express router with DB context | ✅ Ready |
| **utils.ts** | 10+ helper functions | ✅ Ready |
| **index.ts** | Central export point | ✅ Ready |
| **bootstrap-database.ts** | App initialization guide | ✅ Ready |

### 📚 Documentation

| Document | Focus |
|----------|-------|

| **IMPROVEMENTS.md** | Complete API reference with examples |
| **REDESIGN_SUMMARY.md** | Feature comparison and migration guide |
| **ARCHITECTURE.md** | Visual diagrams and data flow |
| **IMPLEMENTATION_CHECKLIST.md** | Integration tasks and verification |

### 🔧 Core Services

| File | Purpose |
|------|---------|

| **dbService.ts** | Main database implementation |
| **database.ts** | Type definitions (unified) |
| **db.ts** | Service interface |
| **postgres.ts** | PostgreSQL compatibility |

---

## 💡 Key Features

### 1. **Lazy Initialization** ✨

No more "Database not initialized" errors!

```typescript
// Safe to import and use at any time
import { DatabaseManager } from './database/index.js';

// Automatically initializes on first use
const users = await DatabaseManager.query('SELECT * FROM users');
```

### 2. **Router Integration** ✨

Express routers with automatic database context

```typescript
const factory = new DatabaseRouterFactory('resource');

factory.get('/', async (req, res, db) => {
  // db is automatically injected and initialized
  const items = await db.query('SELECT * FROM items');
  res.json(items);
});
```

### 3. **10+ Utility Functions** ✨

```typescript
import {
  parsePagination,
  buildWhereClause,
  formatDatabaseError,
  retryOperation,
  batchOperations
} from './database/index.js';

// Pagination
const { page, limit, offset } = parsePagination(req);

// WHERE clause
const { where, params } = buildWhereClause({ status: 'active' });

// Error handling
const formatted = formatDatabaseError(error);

// Retries with backoff
const result = await retryOperation(() => db.query(sql), 3, 100);

// Batch operations
const results = await batchOperations(operations, 10);
```

### 4. **Type Safety**

Full TypeScript support with zero `any` types

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const users = await db.query<User>('SELECT * FROM users');
// users is typed as User[]
```

### 5. **Error Handling**

User-friendly error messages

```typescript
import { formatDatabaseError } from './database/index.js';

try {
  await db.execute('INSERT INTO users...');
} catch (error) {
  const formatted = formatDatabaseError(error);
  // Handles UNIQUE constraint, FOREIGN KEY, NOT NULL, etc.
  res.status(400).json(formatted);
}
```

---

## 📚 API Overview

### DatabaseManager

```typescript
// Get singleton
DatabaseManager.getInstance()

// Initialization
await DatabaseManager.initialize()
DatabaseManager.isInitialized(): boolean
DatabaseManager.registerHook(fn): void

// Queries
DatabaseManager.query<T>(sql, params): Promise<T[]>
DatabaseManager.queryOne<T>(sql, params): Promise<T | undefined>
DatabaseManager.execute(sql, params): Promise<{changes, lastID}>

// Safe access
DatabaseManager.safeAccess<T>(operation): Promise<T>
```

### DatabaseRouterFactory

```typescript
new DatabaseRouterFactory(prefix: string)
  .get(path, handler): this
  .post(path, handler): this
  .put(path, handler): this
  .patch(path, handler): this
  .delete(path, handler): this
  .use(middleware): this
  .getRouter(): Router
```

### Utility Functions

- `parsePagination(req, defaults)` - Parse page/limit
- `createPaginatedResult(data, total, page, limit)` - Format response
- `buildWhereClause(filters)` - Generate WHERE SQL
- `buildOrderBy(column, order)` - Generate ORDER BY
- `buildSelectQuery(table, where, limit, offset, order)` - Complete query
- `safeIdentifier(name)` - SQL injection prevention
- `formatDatabaseError(error)` - User-friendly errors
- `retryOperation(fn, retries, delay)` - Exponential backoff
- `batchOperations(operations, size)` - Batch processing
- `transactionPattern(operations, onError)` - Transaction-like behavior

---

## 🔧 Configuration

### Environment Variables

```bash
# Database driver
DATABASE_DRIVER=sqlite        # or 'postgres'

# SQLite
DATABASE_PATH=data/dev.sqlite3

# PostgreSQL
DATABASE_URL=postgresql://user:pass@host/db
```

### Application Startup

```typescript
import { initializeDatabase } from './bootstrap-database.js';

async function start() {
  // Initialize database first
  await initializeDatabase();

  // Then setup app
  app.use(middleware);
  app.use('/api', routes);

  // Start server
  app.listen(3000);
}

start().catch(console.error);
```

---

## 🧪 Testing

```typescript
import { DatabaseManager } from './database/index.js';

describe('API Endpoints', () => {
  beforeAll(async () => {
    await DatabaseManager.initialize();
  });

  it('should fetch users', async () => {
    const users = await DatabaseManager.query('SELECT * FROM users');
    expect(users).toBeInstanceOf(Array);
  });
});
```

---

## 📈 Examples

### Example 1: Users Router

```typescript
import { DatabaseRouterFactory, parsePagination, createPaginatedResult } from './database/index.js';

const factory = new DatabaseRouterFactory('users');

factory.get('/', async (req, res, db) => {
  const { page, limit, offset } = parsePagination(req);
  
  const users = await db.query(
    'SELECT * FROM users LIMIT ? OFFSET ?',
    [limit, offset]
  );
  
  const total = await db.queryOne<{count: number}>(
    'SELECT COUNT(*) as count FROM users'
  );
  
  const result = createPaginatedResult(users, total?.count || 0, page, limit);
  res.json(result);
});

export default factory.getRouter();
```

### Example 2: Search with Filters

```typescript
factory.get('/search', async (req, res, db) => {
  import { buildWhereClause } from './database/index.js';
  
  const { where, params } = buildWhereClause({
    status: req.query.status as string,
    role: req.query.role as string,
  });
  
  const users = await db.query(
    `SELECT * FROM users ${where}`,
    params
  );
  
  res.json(users);
});
```

### Example 3: Error Handling

```typescript
factory.post('/users', async (req, res, db) => {
  import { formatDatabaseError } from './database/index.js';
  
  try {
    const result = await db.execute(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [req.body.name, req.body.email]
    );
    res.status(201).json({ id: result.lastID });
  } catch (error) {
    const formatted = formatDatabaseError(error);
    res.status(400).json(formatted);
  }
});
```

---

## 🐛 Troubleshooting

### Issue: "Database not initialized"

**Cause**: Calling `getDatabase()` at module level  
**Fix**: Use DatabaseManager or DatabaseRouterFactory

```typescript
// ❌ DON'T DO THIS
const db = getDatabase();

// ✅ DO THIS
await DatabaseManager.initialize();
const db = DatabaseManager.getDatabase();
```

### Issue: Route handler lacks database

**Cause**: Using old router pattern  
**Fix**: Use DatabaseRouterFactory

```typescript
// ✅ CORRECT
factory.get('/', async (req, res, db) => {
  // db is automatically injected
  const data = await db.query(sql);
});
```

### Issue: Type errors with queries

**Cause**: Missing type parameter  
**Fix**: Add generic type

```typescript
// ✅ TYPE SAFE
const users = await db.query<User>('SELECT * FROM users');
```

---

## 🔒 Security Best Practices

1. **Always use parameterized queries**

   ```typescript
   // ✅ SAFE
   await db.query('SELECT * FROM users WHERE id = ?', [userId]);
   
   // ❌ UNSAFE
   await db.query(`SELECT * FROM users WHERE id = '${userId}'`);
   ```

2. **Use safeIdentifier() for table names**

   ```typescript
   const table = safeIdentifier('users'); // Validates name
   ```

3. **Handle errors without leaking info**

   ```typescript
   const formatted = formatDatabaseError(error);
   res.json(formatted); // User-friendly message
   ```

---

## 📊 Performance Tips

1. **Use pagination** for large datasets

   ```typescript
   const { page, limit, offset } = parsePagination(req);
   ```

2. **Batch operations** for bulk inserts

   ```typescript
   const results = await batchOperations(insertOps, 10);
   ```

3. **Retry with backoff** for transient errors

   ```typescript
   const data = await retryOperation(query, 3, 100);
   ```

4. **Index frequently accessed columns**
   - Add indexes to primary keys, foreign keys, filter columns

5. **Monitor query performance**
   - Enable query logging
   - Check slow query log
   - Optimize N+1 queries

---

## 📞 Support Resources

| Topic | Resource |
|-------|----------|

| **Detailed Usage** | [IMPROVEMENTS.md](./IMPROVEMENTS.md) |
| **Architecture** | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **Migration** | [REDESIGN_SUMMARY.md](./REDESIGN_SUMMARY.md) |
| **Integration Tasks** | [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) |
| **Initialization** | [bootstrap-database.ts](../../bootstrap-database.ts) |

---

## 📈 What's New in v2.0

✨ **DatabaseManager** - Singleton with lazy initialization  
✨ **DatabaseRouterFactory** - Express router integration  
✨ **Database Utilities** - 10+ helper functions  
✨ **Unified Types** - All types in database.ts  
✨ **Comprehensive Docs** - 4 detailed guides  
✨ **Error Handling** - formatDatabaseError() utility  
✨ **Type Safety** - Zero any types in public API  

---

## ✅ Verification

After setup:

```bash
# 1. Check no TypeScript errors
npm run build

# 2. Check tests pass
npm run test

# 3. Start app
npm run dev

# 4. Test endpoint
curl http://localhost:3000/health
# Should show: "database": "initialized"
```

---

**Version**: 2.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-12-20  
**Compatibility**: 100% Backward Compatible
