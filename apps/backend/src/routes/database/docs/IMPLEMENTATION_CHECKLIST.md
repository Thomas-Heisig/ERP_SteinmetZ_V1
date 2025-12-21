<!-- SPDX-License-Identifier: MIT -->

# Implementation Checklist - Database Module Redesign

## ✅ Completed Components

### Core Components

- [x] **DatabaseManager.ts** - Singleton with lazy initialization
- [x] **DatabaseRouterFactory.ts** - Express router factory
- [x] **utils.ts** - 10+ utility functions
- [x] **index.ts** - Updated exports
- [x] **database.ts** - Unified type definitions
- [x] **db.ts** - Type-safe service interface

### Documentation

- [x] **IMPROVEMENTS.md** - Detailed guide with examples
- [x] **REDESIGN_SUMMARY.md** - Before/after comparison
- [x] **ARCHITECTURE.md** - Visual architecture diagrams
- [x] **bootstrap-database.ts** - Initialization examples

### Bug Fixes

- [x] Fixed "Database not initialized" error in documentsRouter.ts
- [x] Lazy initialization pattern implemented
- [x] Module-level database access eliminated

---

## 📋 Integration Checklist

### Phase 1: Core Application (🔴 TODO)

- [ ] **Update index.ts (main app entry)**
  - [ ] Import `initializeDatabase` from bootstrap-database.ts
  - [ ] Add `await initializeDatabase()` before app.listen()
  - [ ] Verify DatabaseManager is initialized before routes

  ```typescript
  import { initializeDatabase } from "./bootstrap-database.js";

  // Early in app startup
  await initializeDatabase();
  ```

- [ ] **Verify Application Startup**
  - [ ] npm start or yarn dev works
  - [ ] No "Database not initialized" errors
  - [ ] Health check endpoint returns `database: initialized`

### Phase 2: Route Migration (🔴 TODO)

- [ ] **Migrate Documents Router** (Already started)
  - [ ] Use DatabaseManager.initialize() in middleware
  - [ ] Test all document endpoints
  - [ ] Verify service initialization works

- [ ] **Migrate Other Routers**
  - [ ] [ ] Users Router
  - [ ] [ ] HR Router
  - [ ] [ ] Finance Router
  - [ ] [ ] Projects Router
  - [ ] [ ] [Any other routers...]

  **For each router**:

  ```typescript
  // Option 1: Use middleware
  router.use(async (req, res, next) => {
    await DatabaseManager.initialize();
    next();
  });

  // Option 2: Use DatabaseRouterFactory
  const factory = new DatabaseRouterFactory("resource");
  factory.get("/", async (req, res, db) => {
    const items = await db.query("SELECT * FROM items");
    res.json(items);
  });
  ```

### Phase 3: Utility Functions (🔴 TODO)

- [ ] **Identify query patterns** in existing routes
  - [ ] Pagination queries
  - [ ] WHERE clause building
  - [ ] Error handling
  - [ ] Batch operations

- [ ] **Replace with utility functions**
  - [ ] [ ] Use `parsePagination()` instead of manual parsing
  - [ ] [ ] Use `buildWhereClause()` instead of manual SQL
  - [ ] [ ] Use `formatDatabaseError()` for errors
  - [ ] [ ] Use `buildSelectQuery()` for complex queries

### Phase 4: Testing (🔴 TODO)

- [ ] **Update Test Suites**
  - [ ] [ ] beforeAll() calls DatabaseManager.initialize()
  - [ ] [ ] Use DatabaseManager in test helpers
  - [ ] [ ] Test error scenarios with formatDatabaseError()

- [ ] **Add Integration Tests**
  - [ ] [ ] Test DatabaseManager initialization
  - [ ] [ ] Test DatabaseRouterFactory routing
  - [ ] [ ] Test utility functions

### Phase 5: Documentation (🔴 TODO)

- [ ] **Update Project Documentation**
  - [ ] [ ] Add database module section to main README
  - [ ] [ ] Document initialization flow
  - [ ] [ ] Add examples for common patterns
  - [ ] [ ] Document migration from old pattern

- [ ] **Team Communication**
  - [ ] [ ] Share IMPROVEMENTS.md with team
  - [ ] [ ] Share REDESIGN_SUMMARY.md
  - [ ] [ ] Conduct code review
  - [ ] [ ] Update coding standards guide

---

## 🧪 Testing Checklist

### Initialization Tests

- [ ] DatabaseManager initializes correctly
- [ ] Multiple initialize() calls are safe (idempotent)
- [ ] Initialization hooks run in order
- [ ] Error during init is handled gracefully

### Router Tests

- [ ] DatabaseRouterFactory creates router
- [ ] Database context is injected correctly
- [ ] Async/await works in handlers
- [ ] Error handling works
- [ ] All HTTP methods (GET, POST, PUT, PATCH, DELETE) work

### Utility Function Tests

- [ ] `parsePagination()` handles edge cases
- [ ] `buildWhereClause()` generates valid SQL
- [ ] `buildSelectQuery()` creates complete queries
- [ ] `formatDatabaseError()` handles all error types
- [ ] `retryOperation()` retries with backoff
- [ ] `batchOperations()` processes correctly

### Integration Tests

- [ ] HTTP request → Route handler → Database query → Response
- [ ] Error in handler → formatDatabaseError() → HTTP error response
- [ ] Database not initialized → Auto-initialize → Success

---

## 🔍 Verification Checklist

After each phase, verify:

- [ ] **No Errors**
  - [ ] `npm run build` succeeds
  - [ ] `npm run lint` shows no errors
  - [ ] No TypeScript errors
  - [ ] No runtime errors on startup

- [ ] **Tests Pass**
  - [ ] `npm run test` passes
  - [ ] All integration tests pass
  - [ ] No flaky tests

- [ ] **Application Works**
  - [ ] App starts without errors
  - [ ] API endpoints respond
  - [ ] Database operations work
  - [ ] Graceful shutdown works

---

## 📊 Migration Progress

```legend
Legend:
  ✅ = Completed
  🔴 = Not Started
  🟡 = In Progress
  ⏭️ = Blocked
```

### Status Summary

| Item | Status | Notes |
| ---- | ------ | ----- |

| DatabaseManager.ts | ✅ | Created and ready |
| DatabaseRouterFactory.ts | ✅ | Created and ready |
| utils.ts | ✅ | 10+ functions implemented |
| index.ts | ✅ | All exports added |
| database.ts | ✅ | Types unified |
| documentsRouter.ts | 🟡 | Partially fixed, needs testing |
| bootstrap-database.ts | ✅ | Created with examples |
| Documentation | ✅ | 4 comprehensive guides created |
| **Main App Integration** | 🔴 | Needs index.ts update |
| **Route Migration** | 🔴 | Other routers need updates |
| **Testing** | 🔴 | Test suites need updates |

---

## 🚀 Implementation Timeline

### Week 1: Core Integration

- [ ] **Day 1-2**: Update main index.ts
- [ ] **Day 3-4**: Migrate documents router
- [ ] **Day 5**: Verify and test

### Week 2: Route Migration

- [ ] **Day 1-2**: Migrate 5-6 major routers
- [ ] **Day 3-4**: Update utility usage
- [ ] **Day 5**: Code review and fixes

### Week 3: Refinement

- [ ] **Day 1-2**: Add remaining routers
- [ ] **Day 3**: Write tests
- [ ] **Day 4-5**: Documentation and polish

---

## 💾 Rollback Plan

If issues occur:

1. **Keep old patterns** in conditional logic

   ```typescript
   // Support both old and new patterns temporarily
   const db = isDatabaseInitialized() ? DatabaseManager : getDatabase(); // old pattern
   ```

2. **Feature flags** for gradual rollout

   ```typescript
   const USE_NEW_DB_MANAGER = process.env.USE_NEW_DB_MANAGER === "true";
   ```

3. **Git branch strategy**
   - Create `feature/database-redesign` branch
   - Merge only after full testing
   - Keep old code available for quick rollback

---

## ✨ Success Criteria

**Implementation is complete when:**

- ✅ All routers use new DatabaseManager or DatabaseRouterFactory
- ✅ No module-level database access errors
- ✅ All tests pass
- ✅ Code review approved
- ✅ Documentation updated
- ✅ Team trained on new patterns
- ✅ No performance regressions
- ✅ Error handling improved

---

## 📚 Resources

- **IMPROVEMENTS.md** - Detailed usage guide
- **REDESIGN_SUMMARY.md** - Before/after comparison
- **ARCHITECTURE.md** - Visual architecture
- **bootstrap-database.ts** - Initialization examples
- **DatabaseManager.ts** - JSDoc comments
- **DatabaseRouterFactory.ts** - JSDoc comments
- **utils.ts** - Function documentation

---

## 🆘 Troubleshooting Guide

### Issue: DatabaseManager not initialized

**Solution**: Call `await DatabaseManager.initialize()` before using

### Issue: Route handler doesn't have database context

**Solution**: Use DatabaseRouterFactory or create middleware with initialization

### Issue: Old tests failing

**Solution**: Add `beforeAll(async () => { await DatabaseManager.initialize(); })`

### Issue: Performance degradation

**Solution**: Check query logs, use pagination, verify indexes

---

## 📞 Support

For questions or issues:

1. Check IMPROVEMENTS.md for detailed examples
2. Review ARCHITECTURE.md for design patterns
3. Check JSDoc comments in source files
4. Review bootstrap-database.ts for initialization patterns

---

**Created**: 2025-12-20  
**Last Updated**: 2025-12-20  
**Version**: 1.0
