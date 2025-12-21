<!-- SPDX-License-Identifier: MIT -->

# Database Module - Complete Guide

Unified, production-ready database abstraction layer with router integration, lazy initialization, and comprehensive utilities.

## 📋 What's New

### ✅ Improvements Made

1. **DatabaseManager** - Singleton with lazy initialization
   - Prevents "Database not initialized" errors
   - Automatic initialization on first access
   - Safe for import at module level
   - Initialization hooks for setup operations

2. **DatabaseRouterFactory** - Express router with database integration
   - Automatic database initialization per route
   - Type-safe database context injection
   - Built-in error handling
   - Request logging with database state

3. **Database Utilities** - Helper functions
   - Pagination with automatic query building
   - WHERE clause generation
   - Safe SQL identifier handling
   - Error formatting
   - Retry logic with exponential backoff
   - Batch operations
   - Transaction pattern

4. **Fixed Import Timing**
   - No more module-level `getDatabase()` calls
   - Lazy initialization pattern
   - Safe for all import scenarios

## 🚀 Quick Start

### Pattern 1: Using DatabaseRouterFactory (Recommended)

```typescript
import { DatabaseRouterFactory } from "./database/index.js";

// Create router with automatic DB initialization
const factory = new DatabaseRouterFactory("users");

// Database is automatically initialized on first request
factory.get("/", async (req, res, db) => {
  const users = await db.query("SELECT * FROM users");
  res.json(users);
});

export default factory.getRouter();
```

### Pattern 2: Using DatabaseManager Directly

```typescript
import { DatabaseManager } from "./database/index.js";

// Initialize when application starts
const dbManager = DatabaseManager;
await dbManager.initialize();

// Now safe to use anywhere
const users = await dbManager.query("SELECT * FROM users");
```

### Pattern 3: Safe Access Pattern

```typescript
import { DatabaseManager } from "./database/index.js";

// Automatically waits for initialization if needed
const users = await DatabaseManager.safeAccess(async () => {
  return await db.all("SELECT * FROM users");
});
```

## 📚 Detailed API

### DatabaseManager (Singleton)

```typescript
import { DatabaseManager } from './database/index.js';

const dbManager = DatabaseManager; // Get singleton instance

// Initialization
await dbManager.initialize();              // Initialize (idempotent)
dbManager.isInitialized();                 // Check status
dbManager.registerHook(async () => {...}); // Register init hook

// Query operations
const rows = await dbManager.query<User>('SELECT * FROM users');
const row = await dbManager.queryOne<User>('SELECT * FROM users WHERE id = ?', [id]);
const result = await dbManager.execute('INSERT INTO users VALUES (?, ?)', [name, email]);

// Direct database access
const rawDb = dbManager.getDatabase();     // Get raw better-sqlite3 instance
const service = dbManager.getService();     // Get database service

// Safe access pattern
await dbManager.safeAccess(async () => {
  // Automatically waits for initialization
  return await db.all('SELECT * FROM users');
});
```

### DatabaseRouterFactory

```typescript
import { DatabaseRouterFactory } from "./database/index.js";

const factory = new DatabaseRouterFactory("resource-name");

// Register routes (returns this for chaining)
factory
  .get("/", async (req, res, db) => {
    const items = await db.query("SELECT * FROM items");
    res.json(items);
  })
  .post("/", async (req, res, db) => {
    const result = await db.execute("INSERT INTO items (name) VALUES (?)", [
      req.body.name,
    ]);
    res.json({ success: true, insertedId: result.lastID });
  })
  .put("/:id", async (req, res, db) => {
    await db.execute("UPDATE items SET name = ? WHERE id = ?", [
      req.body.name,
      req.params.id,
    ]);
    res.json({ success: true });
  })
  .delete("/:id", async (req, res, db) => {
    await db.execute("DELETE FROM items WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  });

// Get Express router
export default factory.getRouter();
```

#### DatabaseContext Properties

```typescript
interface DatabaseContext {
  // Async query methods
  db: {
    query<T>(sql: string, params?: unknown[]): Promise<T[]>;
    queryOne<T>(sql: string, params?: unknown[]): Promise<T | undefined>;
    execute(
      sql: string,
      params?: unknown[],
    ): Promise<{ changes: number; lastID?: number }>;
  };

  // Raw database instance (special cases only)
  rawDb: Database.Database;

  // Route prefix (for logging/debugging)
  prefix: string;
}
```

### Utility Functions

#### Pagination

```typescript
import {
  parsePagination,
  createPaginatedResult,
  buildSelectQuery,
} from "./database/index.js";

// Parse pagination from request
const { page, limit, offset } = parsePagination(req, { page: 1, limit: 10 });

// Build query
const query = buildSelectQuery(
  "users",
  "",
  limit,
  offset,
  "ORDER BY created_at DESC",
);
const total = await db.queryOne<{ count: number }>(
  "SELECT COUNT(*) as count FROM users",
);
const data = await db.query(
  "SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?",
  [limit, offset],
);

// Create response
const result = createPaginatedResult(data, total?.count || 0, page, limit);
// Result includes: data, total, page, limit, pages, hasNext, hasPrev
```

#### WHERE Clause Building

```typescript
import { buildWhereClause } from "./database/index.js";

const { where, params } = buildWhereClause({
  status: "active",
  role: "admin",
});
// where = "WHERE status = ? AND role = ?"
// params = ['active', 'admin']

const query = `SELECT * FROM users ${where}`;
const users = await db.query(query, params);
```

#### Error Handling

```typescript
import { formatDatabaseError } from "./database/index.js";

try {
  await db.execute("INSERT INTO users (id, name) VALUES (?, ?)", [id, name]);
} catch (error) {
  const formatted = formatDatabaseError(error);
  res.status(400).json(formatted);
  // Handles: UNIQUE constraint, FOREIGN KEY constraint, NOT NULL constraint
}
```

#### Retry Logic

```typescript
import { retryOperation } from "./database/index.js";

const user = await retryOperation(
  () => db.queryOne("SELECT * FROM users WHERE id = ?", [userId]),
  3, // Max retries
  100, // Initial delay in ms
);
// Uses exponential backoff: 100ms, 200ms, 400ms
```

#### Batch Operations

```typescript
import { batchOperations } from "./database/index.js";

const insertOps = users.map(
  (user) => () =>
    db.execute("INSERT INTO users (name, email) VALUES (?, ?)", [
      user.name,
      user.email,
    ]),
);

const results = await batchOperations(insertOps, 10); // Process 10 at a time
```

#### Transaction Pattern

```typescript
import { transactionPattern } from "./database/index.js";

try {
  const results = await transactionPattern([
    () =>
      db.execute("INSERT INTO users VALUES (?, ?)", [
        "alice",
        "alice@example.com",
      ]),
    () =>
      db.execute("INSERT INTO users VALUES (?, ?)", ["bob", "bob@example.com"]),
    () =>
      db.execute("INSERT INTO users VALUES (?, ?)", [
        "charlie",
        "charlie@example.com",
      ]),
  ]);

  res.json({ success: true, created: results.length });
} catch (error) {
  // All operations rolled back (simulated)
  res.status(500).json({ success: false, error: error.message });
}
```

## 🔧 Migration Guide

### OLD Pattern (❌ Causes Error)

```typescript
// DON'T DO THIS - gets called at module level
import { getDatabase } from "./database/db.js";

const db = getDatabase(); // ERROR: Database not initialized!

router.get("/", (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
  res.json(users);
});
```

### NEW Pattern 1 (✅ Using DatabaseRouterFactory)

```typescript
// RECOMMENDED - automatic initialization per request
import { DatabaseRouterFactory } from "./database/index.js";

const factory = new DatabaseRouterFactory("users");

factory.get("/", async (req, res, db) => {
  const users = await db.query("SELECT * FROM users");
  res.json(users);
});

export default factory.getRouter();
```

### NEW Pattern 2 (✅ Using DatabaseManager)

```typescript
// SAFE - lazy initialization
import { DatabaseManager } from "./database/index.js";

router.get("/", async (req, res) => {
  try {
    const users = await DatabaseManager.query("SELECT * FROM users");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

## 📂 Complete Module Structure

```tree
database/
├── DatabaseManager.ts           # Singleton with lazy init ✨ NEW
├── DatabaseRouterFactory.ts     # Express router factory ✨ NEW
├── utils.ts                     # Helper functions ✨ NEW
├── index.ts                     # Central exports (updated)
├── db.ts                        # Database service interface
├── database.ts                  # Type definitions (unified)
├── dbService.ts                 # Implementation
├── postgres.ts                  # Backward compatibility
├── connect-sqlite3.d.ts         # Session store types
├── docs/
│   └── README.md               # This file
└── README.md                    # Quick reference (old)
```

## 🎯 Usage Examples

### Example 1: Users Router

```typescript
import { DatabaseRouterFactory } from "./database/index.js";

const factory = new DatabaseRouterFactory("users");

factory
  .get("/", async (req, res, db) => {
    const { page, limit, offset } = parsePagination(req);
    const users = await db.query("SELECT * FROM users LIMIT ? OFFSET ?", [
      limit,
      offset,
    ]);
    const total = await db.queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM users",
    );
    res.json(createPaginatedResult(users, total?.count || 0, page, limit));
  })
  .post("/", async (req, res, db) => {
    try {
      const result = await db.execute(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        [req.body.name, req.body.email],
      );
      res.status(201).json({ success: true, id: result.lastID });
    } catch (error) {
      res.status(400).json(formatDatabaseError(error));
    }
  });

export default factory.getRouter();
```

### Example 2: Products Router with Search

```typescript
import {
  DatabaseRouterFactory,
  buildWhereClause,
  buildSelectQuery,
} from "./database/index.js";

const factory = new DatabaseRouterFactory("products");

factory.get("/", async (req, res, db) => {
  const { category, inStock } = req.query;
  const { page, limit, offset } = parsePagination(req);

  const { where, params } = buildWhereClause({
    category: category as string,
    in_stock: inStock ? 1 : undefined,
  });

  const query = buildSelectQuery(
    "products",
    where,
    limit,
    offset,
    "ORDER BY name ASC",
  );
  const products = await db.query(query, params);

  res.json({
    success: true,
    data: products,
    page,
    limit,
  });
});

export default factory.getRouter();
```

## ✨ Key Features

| Feature | Benefit |
| ------- | ------- |

| **Lazy Initialization** | No more "Database not initialized" errors |
| **DatabaseManager** | Singleton pattern for safe global access |
| **DatabaseRouterFactory** | Type-safe database context per request |
| **Automatic Error Handling** | Built-in error formatting and HTTP responses |
| **Pagination Helpers** | Reduce boilerplate query building |
| **Retry Logic** | Handle transient database errors gracefully |
| **Batch Operations** | Process large datasets efficiently |
| **Transaction Pattern** | Simulate transactions for related operations |
| **100% Type Safe** | Full TypeScript support, no `any` types |
| **Backward Compatible** | Old imports still work |

## 🐛 Troubleshooting

### "Database not initialized" Error

**Problem**: Calling `getDatabase()` at module level

```typescript
// ❌ DON'T DO THIS
const db = getDatabase(); // Error!
```

**Solution**: Use DatabaseManager or DatabaseRouterFactory

```typescript
// ✅ DO THIS
const db = DatabaseManager; // Use later with await
// OR
const factory = new DatabaseRouterFactory("resource");
```

### Route Handler Doesn't Have Database

**Problem**: Using old router pattern

```typescript
// ❌ OLD WAY
router.get("/", (req, res) => {
  // No database context
});
```

**Solution**: Use DatabaseRouterFactory

```typescript
// ✅ NEW WAY
factory.get("/", async (req, res, db) => {
  // db is automatically injected
});
```

### Type Safety Issues

**Problem**: Using `any` types

```typescript
// ❌ NOT TYPE SAFE
const result = (await db.query("SELECT * FROM users")) as any;
```

**Solution**: Use generic types

```typescript
// ✅ TYPE SAFE
interface User {
  id: string;
  name: string;
  email: string;
}
const result = await db.query<User>("SELECT * FROM users");
```

## 📈 Performance Tips

1. **Use Pagination** for large result sets
2. **Index Foreign Keys** in database schema
3. **Batch Operations** for bulk inserts/updates
4. **Cache Frequently Accessed Data** using Redis
5. **Monitor Query Performance** with built-in stats
6. **Use Prepared Statements** (automatic with better-sqlite3)

## 🔐 Security Best Practices

1. **Always Use Parameterized Queries** - prevent SQL injection

   ```typescript
   // ✅ SAFE
   await db.query("SELECT * FROM users WHERE id = ?", [userId]);

   // ❌ UNSAFE
   await db.query(`SELECT * FROM users WHERE id = '${userId}'`);
   ```

2. **Validate Input** before database operations
3. **Use safeIdentifier()** for table/column names
4. **Handle Errors** appropriately - don't leak sensitive info

## 📞 Support & Documentation

- **Database Manager**: See DatabaseManager.ts JSDoc
- **Router Factory**: See DatabaseRouterFactory.ts JSDoc
- **Utilities**: See utils.ts JSDoc
- **Type Definitions**: See database.ts for all types
- **Examples**: See example routers in /routes

---

**Status**: ✅ Production Ready with Major Improvements  
**Last Updated**: 2025-12-20  
**Version**: 2.0 - Added DatabaseManager, DatabaseRouterFactory, Utilities
