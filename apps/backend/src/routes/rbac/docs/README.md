// SPDX-License-Identifier: MIT
// apps/backend/src/routes/rbac/README.md

# RBAC Router Documentation

## Quick Start

### 1. Initialize RBAC Service in Your App

```typescript
// In your main app.ts or index.ts
import { initializeRbacService } from "../services/rbacService.js";
import db from "../config/database.js";

// Initialize RBAC service after database connection
const rbacService = initializeRbacService(db);
```

### 2. Mount RBAC Router

```typescript
import rbacRouter from "../routes/rbacRouter.js";

// Mount the router
app.use("/api/rbac", rbacRouter);
```

### 3. Run Database Migration

```bash
# Using sqlite3 CLI
sqlite3 data/dev.sqlite3 < src/migrations/003_rbac_system.sql

# Or via Node.js
npm run migrate:rbac
```

### 4. Use RBAC Middleware in Your Routes

```typescript
import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  requireRole,
  requirePermission,
  requireModuleAccess,
} from "../middleware/rbacMiddleware.js";

const router = Router();

// Require admin role
router.delete(
  "/settings",
  authenticate,
  requireRole("admin"),
  deleteSettingsHandler,
);

// Require specific permission
router.post(
  "/invoices",
  authenticate,
  requirePermission("finance:create"),
  createInvoiceHandler,
);

// Require module access
router.get(
  "/finance/reports",
  authenticate,
  requireModuleAccess("finance"),
  getFinanceReportsHandler,
);

export default router;
```

## API Endpoints

### Get All Roles (Admin)

```
GET /api/rbac/roles
```

### Assign Role to User (Admin)

```
POST /api/rbac/users/:userId/roles/:roleId
{
  "expiresAt": "2025-12-31T23:59:59Z"  // Optional
}
```

### Revoke Role (Admin)

```
DELETE /api/rbac/users/:userId/roles/:roleId
```

### Get User Roles

```
GET /api/rbac/users/:userId/roles
```

### Get User Permissions

```
GET /api/rbac/users/:userId/permissions
```

### Check Current User Permissions

```
GET /api/rbac/me/permissions
```

### Check Current User Roles

```
GET /api/rbac/me/roles
```

### Check Permission

```
POST /api/rbac/check-permission
{
  "permission": "finance:create"
}
```

### Check Role

```
POST /api/rbac/check-role
{
  "role": "admin"
}
```

## Available Roles

1. **super_admin** - Full system access
2. **admin** - Administrative access (no system role management)
3. **manager** - Can approve and manage team
4. **supervisor** - Can supervise team work
5. **user** - Standard user access
6. **viewer** - Read-only access
7. **guest** - Limited guest access

## Middleware Functions

- `requireRole(roleName)` - Require specific role
- `requireAnyRole(roleNames)` - Require any of multiple roles
- `requireAllRoles(roleNames)` - Require all specified roles
- `requirePermission(permission)` - Require specific permission
- `requireAnyPermission(permissions)` - Require any permission
- `requireAllPermissions(permissions)` - Require all permissions
- `requireModuleAccess(moduleName)` - Require module access
- `requirePermissionCheck(checker)` - Custom permission checker
- `optionalPermissionCheck(permission)` - Optional authorization

## Examples

### Protect Admin Routes

```typescript
router.delete(
  "/users/:id",
  authenticate,
  requireRole("admin"),
  deleteUserHandler,
);
```

### Multi-Level Approval

```typescript
router.post(
  "/approval",
  authenticate,
  requireAnyRole(["admin", "manager"]),
  approveHandler,
);
```

### Finance Operations

```typescript
router.post(
  "/invoices",
  authenticate,
  requirePermission("finance:create"),
  createInvoiceHandler,
);

router.post(
  "/invoices/:id/approve",
  authenticate,
  requirePermission("finance:approve"),
  approveInvoiceHandler,
);
```

### Module Access

```typescript
router.get(
  "/sales/dashboard",
  authenticate,
  requireModuleAccess("sales"),
  getSalesDashboardHandler,
);
```

## Service Methods

```typescript
import { getRbacService } from "../services/rbacService.js";

const rbacService = getRbacService();

// Check permissions
const hasPermission = await rbacService.hasPermission(userId, "finance:create");
const hasRole = await rbacService.hasRole(userId, "admin");

// Get user info
const roles = await rbacService.getUserRoles(userId);
const permissions = await rbacService.getUserPermissions(userId);

// Manage roles
await rbacService.assignRoleToUser(userId, roleId, adminId);
await rbacService.revokeRoleFromUser(userId, roleId, adminId);

// Check module access
const canAccess = await rbacService.canAccessModule(userId, "finance");
const actions = await rbacService.getModuleActions(userId, "finance");
```

## Database Tables

- **roles** - Role definitions
- **user_roles** - User-role assignments
- **permissions** - Permission reference (optional)
- **rbac_audit_log** - Audit trail of RBAC changes
- **module_permissions** - Module-level permissions (optional)

## Environment Variables

```env
RBAC_CACHE_ENABLED=true
RBAC_CACHE_TTL=3600000
RBAC_AUDIT_LOG_ENABLED=true
```

## Performance Considerations

- **Caching**: Permissions and roles are cached by default
- **Database**: Indices on frequently queried columns
- **Audit Log**: Consider archiving old entries regularly

## Troubleshooting

### Permission Denied Error

- Check if user has the required role/permission
- Verify role is active
- Clear cache if recently changed

### Slow Permission Checks

- Ensure caching is enabled
- Check database indices are created
- Consider reducing audit log retention

### Role Assignment Not Working

- Verify user exists
- Check role exists and is active
- Ensure user doesn't already have the role

## See Also

- [RBAC_IMPLEMENTATION.md](../../RBAC_IMPLEMENTATION.md) - Complete documentation
- [authMiddleware.ts](../../middleware/authMiddleware.ts) - Authentication
- [rbacService.ts](../../services/rbacService.ts) - Service implementation
