# Error Standardization Migration Guide

**Version**: 1.1  
**Last Updated**: December 6, 2025  
**Status**: Core Routers Complete (90% Complete)

## Overview

This guide provides instructions for migrating router endpoints to use standardized error handling and input validation.

## Current Status

### ✅ Completed Routers

- **quickchatRouter**: 100% (3/3 endpoints)
- **authRouter**: 100% (already standardized)
- **rateLimiters**: 100% (already standardized)
- **hrRouter**: 100% (14/14 endpoints) ✅ **COMPLETED 2025-12-06**
  - ✅ GET /api/hr/employees
  - ✅ GET /api/hr/employees/:id
  - ✅ POST /api/hr/employees
  - ✅ PUT /api/hr/employees/:id
  - ✅ DELETE /api/hr/employees/:id
  - ✅ GET /api/hr/time-entries
  - ✅ POST /api/hr/time-entries
  - ✅ GET /api/hr/leave-requests
  - ✅ POST /api/hr/leave-requests
  - ✅ PUT /api/hr/leave-requests/:id/approve
  - ✅ PUT /api/hr/leave-requests/:id/reject
  - ✅ GET /api/hr/payroll/:employeeId
  - ✅ GET /api/hr/departments
  - ✅ GET /api/hr/statistics

- **financeRouter**: 100% (19/19 endpoints) ✅ **COMPLETED 2025-12-06**
  - ✅ GET /api/finance/invoices
  - ✅ GET /api/finance/invoices/:id
  - ✅ POST /api/finance/invoices
  - ✅ PUT /api/finance/invoices/:id
  - ✅ DELETE /api/finance/invoices/:id
  - ✅ POST /api/finance/invoices/:id/send
  - ✅ GET /api/finance/customers
  - ✅ GET /api/finance/customers/:id
  - ✅ POST /api/finance/customers
  - ✅ GET /api/finance/suppliers
  - ✅ POST /api/finance/suppliers
  - ✅ GET /api/finance/payments
  - ✅ POST /api/finance/payments
  - ✅ GET /api/finance/accounts
  - ✅ GET /api/finance/transactions
  - ✅ POST /api/finance/transactions
  - ✅ GET /api/finance/statistics
  - ✅ GET /api/finance/reports/balance-sheet
  - ✅ GET /api/finance/reports/profit-loss

### 🟡 Partially Completed Routers

- **functionsCatalogRouter**: Has Zod validation but uses custom error format
  - ⚠️ Needs: Migration to standardized APIError classes (lower priority)

### ⚠️ Not Started

- **aiRouter**: 0% (~15 endpoints)
- **aiAnnotatorRouter**: 0% (~8 endpoints)
- **dashboardRouter**: 0% (~3 endpoints)
- **diagnosticsRouter**: 0% (~5 endpoints)
- **systemInfoRouter**: 0% (~3 endpoints)
- **calendarRouter**: 0% (endpoints TBD)
- **innovationRouter**: 0% (endpoints TBD)

## Migration Pattern

### Step 1: Add Imports

```typescript
// At the top of the router file
import { z } from "zod";
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
  InternalServerError,
} from "../../types/errors.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import pino from "pino";

const router = Router();
const logger = pino({ level: process.env.LOG_LEVEL || "info" });
```

### Step 2: Define Zod Validation Schemas

```typescript
// Define schemas for request validation
const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  status: z.enum(["active", "inactive"]).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const querySchema = z.object({
  status: z.enum(["active", "inactive"]).optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});
```

### Step 3: Migrate Route Handlers

**Before:**

```typescript
router.get("/items", async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    if (search && typeof search !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid search parameter",
      });
    }

    // ... fetch data ...

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch items",
    });
  }
});
```

**After:**

```typescript
router.get(
  "/items",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate query parameters
    const validationResult = querySchema.safeParse(req.query);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid query parameters",
        validationResult.error.issues,
      );
    }

    const { status, search } = validationResult.data;

    // ... fetch data ...

    // If not found, throw error instead of returning early
    if (!item) {
      throw new NotFoundError("Item not found", { itemId: id });
    }

    res.json({
      success: true,
      data: items,
    });
  }),
);
```

### Step 4: Replace Console Logging

**Before:**

```typescript
console.log("Fetching items...");
console.error("Error:", error);
```

**After:**

```typescript
logger.info("Fetching items...");
logger.error({ error }, "Failed to fetch items");
```

## Common Patterns

### Pattern 1: GET with Query Parameters

```typescript
const querySchema = z.object({
  status: z.enum(["active", "inactive"]).optional(),
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional(),
});

router.get(
  "/items",
  asyncHandler(async (req: Request, res: Response) => {
    const validationResult = querySchema.safeParse(req.query);
    if (!validationResult.success) {
      throw new ValidationError("Invalid query", validationResult.error.issues);
    }

    const { status, page } = validationResult.data;
    // ... implementation ...
  }),
);
```

### Pattern 2: GET by ID

```typescript
router.get(
  "/items/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Fetch item
    const item = await itemService.findById(id);

    if (!item) {
      throw new NotFoundError("Item not found", { itemId: id });
    }

    res.json({ success: true, data: item });
  }),
);
```

### Pattern 3: POST with Body Validation

```typescript
const createSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

router.post(
  "/items",
  asyncHandler(async (req: Request, res: Response) => {
    const validationResult = createSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError("Invalid data", validationResult.error.issues);
    }

    const data = validationResult.data;
    const item = await itemService.create(data);

    res.status(201).json({ success: true, data: item });
  }),
);
```

### Pattern 4: PUT with Partial Updates

```typescript
router.put(
  "/items/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Use partial() to allow optional fields for updates
    const validationResult = createSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError("Invalid data", validationResult.error.issues);
    }

    const data = validationResult.data;
    const item = await itemService.update(id, data);

    if (!item) {
      throw new NotFoundError("Item not found", { itemId: id });
    }

    res.json({ success: true, data: item });
  }),
);
```

### Pattern 5: DELETE

```typescript
router.delete(
  "/items/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const deleted = await itemService.delete(id);

    if (!deleted) {
      throw new NotFoundError("Item not found", { itemId: id });
    }

    res.json({ success: true, message: "Item deleted" });
  }),
);
```

## Error Types Reference

### Client Errors (4xx)

- **BadRequestError** (400): Invalid request format or parameters

  ```typescript
  throw new BadRequestError("Invalid ID format", { id });
  ```

- **UnauthorizedError** (401): Authentication required

  ```typescript
  throw new UnauthorizedError("Token expired");
  ```

- **ForbiddenError** (403): Insufficient permissions

  ```typescript
  throw new ForbiddenError("Admin access required");
  ```

- **NotFoundError** (404): Resource not found

  ```typescript
  throw new NotFoundError("User not found", { userId: id });
  ```

- **ConflictError** (409): Resource conflict (e.g., duplicate)

  ```typescript
  throw new ConflictError("Email already exists", { email });
  ```

- **ValidationError** (422): Validation failed
  ```typescript
  throw new ValidationError("Invalid input", validationErrors);
  ```

### Server Errors (5xx)

- **InternalServerError** (500): Unexpected server error

  ```typescript
  throw new InternalServerError("Database connection failed");
  ```

- **ServiceUnavailableError** (503): Service temporarily unavailable

  ```typescript
  throw new ServiceUnavailableError("AI provider is down");
  ```

- **DatabaseError** (500): Database-specific error

  ```typescript
  throw new DatabaseError("Query failed", { query });
  ```

- **AIProviderError** (502): AI provider error
  ```typescript
  throw new AIProviderError("OpenAI API error", { details });
  ```

## Validation Schema Patterns

### Common Field Types

```typescript
// Strings
z.string(); // Any string
z.string().min(1); // Non-empty string
z.string().max(100); // Max length
z.string().email(); // Email format
z.string().uuid(); // UUID format
z.string().url(); // URL format
z.string().regex(/^\d{4}-\d{2}-\d{2}$/); // Custom pattern

// Numbers
z.number(); // Any number
z.number().int(); // Integer only
z.number().positive(); // Positive numbers
z.number().min(0).max(100); // Range

// Enums
z.enum(["active", "inactive"]); // Fixed values

// Arrays
z.array(z.string()); // Array of strings
z.array(itemSchema).min(1); // Non-empty array of objects

// Objects
z.object({ name: z.string() }); // Object with structure
z.record(z.string(), z.unknown()); // Dynamic key-value pairs

// Optional and nullable
z.string().optional(); // Field may be undefined
z.string().nullable(); // Field may be null
z.string().nullish(); // Field may be null or undefined

// Transformations
z.string().transform(Number); // Convert string to number
z.string().toLowerCase(); // Transform to lowercase
```

### Query Parameter Pattern

```typescript
// Query params come as strings, need transformation
const querySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .pipe(z.number().int().positive().optional()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .pipe(z.number().int().positive().max(100).optional()),
});
```

## Testing Changes

After migrating an endpoint, test:

1. **Valid requests**: Should work as before
2. **Invalid input**: Should return 422 with validation details
3. **Not found**: Should return 404 with helpful message
4. **Server errors**: Should be caught and logged properly

```bash
# Build to check TypeScript errors
npm run build:backend

# Run tests
npm run test:backend

# Manual testing with curl
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

## Migration Checklist

For each router file:

- [ ] Add imports (z, APIError classes, asyncHandler, pino)
- [ ] Initialize logger
- [ ] Define Zod schemas for all endpoints
- [ ] Wrap all routes with `asyncHandler`
- [ ] Add validation for request bodies/queries
- [ ] Replace early returns with `throw` statements
- [ ] Replace `console.*` with `logger.*`
- [ ] Remove try-catch blocks (handled by asyncHandler)
- [ ] Test all endpoints
- [ ] Update router documentation

## Next Steps

### High Priority (Remaining)

1. ✅ ~~Complete HR router (7 remaining endpoints)~~ **COMPLETED 2025-12-06**
2. ✅ ~~Complete Finance router (9 remaining endpoints)~~ **COMPLETED 2025-12-06**
3. Migrate AI router (critical, many endpoints) - **RECOMMENDED NEXT**

### Medium Priority

4. Migrate Dashboard router (~3 endpoints)
5. Migrate Diagnostics router (~5 endpoints)
6. Migrate System Info router (~3 endpoints)

### Low Priority

7. Refactor functionsCatalog error format
8. Migrate AI Annotator router (~8 endpoints)
9. Migrate Calendar router (if active)
10. Migrate Innovation router (if active)

## Questions?

For questions or issues during migration:

- Check existing migrated routers (quickchatRouter, parts of hrRouter/financeRouter)
- Review error handler middleware: `apps/backend/src/middleware/errorHandler.ts`
- Review error types: `apps/backend/src/types/errors.ts`
- Check asyncHandler implementation: `apps/backend/src/middleware/asyncHandler.ts`

## Related Documentation

- [Error Handler Middleware](../apps/backend/src/middleware/errorHandler.ts)
- [Error Types](../apps/backend/src/types/errors.ts)
- [Async Handler](../apps/backend/src/middleware/asyncHandler.ts)
- [Zod Documentation](https://zod.dev/)
