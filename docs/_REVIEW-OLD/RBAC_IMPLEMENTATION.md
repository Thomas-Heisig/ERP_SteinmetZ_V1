# RBAC (Role-Based Access Control) System Documentation

**Version**: 1.0.0  
**Last Updated**: 2025-12-19  
**Status**: ✅ Fully Implemented

## Overview

The RBAC system provides comprehensive role-based and permission-based access control for the ERP system. It allows fine-grained control over user access to different modules and features.

## Table of Contents

1. [Architecture](#architecture)
2. [Core Concepts](#core-concepts)
3. [System Roles](#system-roles)
4. [Permissions](#permissions)
5. [API Endpoints](#api-endpoints)
6. [Middleware Usage](#middleware-usage)
7. [Configuration](#configuration)
8. [Examples](#examples)
9. [Database Schema](#database-schema)

## Architecture

### Components

```
┌─────────────────────────────────────┐
│      Request with Auth Token        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Authentication Middleware         │
│   (Validates token, loads user)     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│     RBAC Middleware (Optional)       │
│  (Checks roles/permissions)         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   RBAC Service                      │
│   (Queries database, manages cache) │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Request Handler                   │
│   (Executes protected operation)    │
└─────────────────────────────────────┘
```

### Key Files

- **types/rbac.ts** - Type definitions and enums
- **config/rbac.ts** - Default roles and permissions
- **services/rbacService.ts** - Core RBAC logic and database operations
- **middleware/rbacMiddleware.ts** - Express middleware for authorization
- **routes/rbacRouter.ts** - API endpoints for RBAC management
- **migrations/003_rbac_system.sql** - Database schema and initial data

## Core Concepts

### Roles

A **role** is a collection of permissions that can be assigned to users. Roles provide a convenient way to group related permissions.

**Characteristics**:

- System roles cannot be deleted
- Roles can be activated/deactivated
- Roles support module-level permission grouping
- Roles can have optional expiration dates when assigned to users

### Permissions

A **permission** is a specific action allowed on a specific module, following the format: `module:action`.

**Format**: `{module}:{action}`

**Examples**:

- `finance:create` - Can create finance records
- `user_management:delete` - Can delete users
- `sales:approve` - Can approve sales transactions
- `dashboard:export` - Can export dashboard data

### Modules

Modules represent different functional areas of the ERP system:

- `dashboard` - Dashboard and analytics
- `user_management` - User management
- `role_management` - Role management
- `finance` - Finance and accounting
- `hr` - Human resources
- `crm` - Customer relationship management
- `sales` - Sales management
- `procurement` - Procurement
- `inventory` - Inventory management
- `production` - Production management
- `warehouse` - Warehouse management
- `business` - Business management
- `marketing` - Marketing
- `reporting` - Reporting
- `settings` - System settings
- `monitoring` - System monitoring
- `audit_logs` - Audit logging
- `ai_annotator` - AI Annotator integration
- `communication` - Communication tools
- `projects` - Project management
- `documents` - Document management

### Actions

Common actions applied across modules:

- `create` - Create new records
- `read` - View records
- `update` - Modify existing records
- `delete` - Remove records
- `approve` - Approve workflow items
- `reject` - Reject workflow items
- `export` - Export data
- `import` - Import data
- `publish` - Publish content
- `unpublish` - Unpublish content
- `archive` - Archive records
- `restore` - Restore archived records
- `configure` - Configure module settings
- `manage` - Full management of module

## System Roles

### Role Hierarchy

The system includes 7 default roles organized in a hierarchy:

```
1. Super Admin (Level 0)
   ↓
2. Admin (Level 1)
   ↓
3. Manager (Level 2) ─ User (Level 4)
   ├─ Supervisor (Level 3) ─ User (Level 4)
   │
4. User (Level 4)
   ↓
5. Viewer (Level 5)
   ↓
6. Guest (Level 6)
```

### Role Details

#### 1. Super Administrator (`super_admin`)

**Level**: 0 (Highest)  
**Description**: Full system access. Can manage all users, roles, and configurations.

**Key Permissions**:

- All user management operations
- All role management operations including system roles
- Full access to all modules
- System settings and configuration
- Audit log access

**Use Cases**:

- System owners
- IT administrators with full control

#### 2. Administrator (`admin`)

**Level**: 1  
**Description**: Administrative access. Can manage users and configurations but cannot manage system roles.

**Key Permissions**:

- User CRUD operations (cannot manage super_admin users)
- Full access to finance, HR, sales, procurement, production, warehouse
- Cannot create/modify system roles
- Settings update (not configure)
- Monitoring read-only
- Audit log access

**Use Cases**:

- Department heads
- IT staff managing non-critical systems

#### 3. Manager (`manager`)

**Level**: 2  
**Description**: Can manage team members and approve workflow items.

**Key Permissions**:

- User read-only (view team members)
- Finance: read, update, approve, export
- HR: read, update, approve, export
- Sales: read, create, update, approve, export
- Procurement: read, create, update, approve, export
- Can approve transactions in their domain

**Use Cases**:

- Department managers
- Team leaders
- Project managers

#### 4. Supervisor (`supervisor`)

**Level**: 3  
**Description**: Can supervise team work and oversee operations.

**Key Permissions**:

- Can read and update team data
- Cannot approve transactions
- Can view and create limited records
- Export capability

**Use Cases**:

- Team supervisors
- Lead technicians

#### 5. User (`user`)

**Level**: 4  
**Description**: Standard user access. Can read and create data in assigned modules.

**Key Permissions**:

- Dashboard read
- Can create records in: CRM, Sales
- Read-only in: Procurement, Inventory, Production, Warehouse

**Use Cases**:

- Regular employees
- Department staff members

#### 6. Viewer (`viewer`)

**Level**: 5  
**Description**: Read-only access to all modules.

**Key Permissions**:

- Read-only access to most modules
- Cannot create or modify anything
- Can export some data

**Use Cases**:

- External stakeholders
- Auditors
- Compliance officers

#### 7. Guest (`guest`)

**Level**: 6 (Lowest)  
**Description**: Limited guest access.

**Key Permissions**:

- Dashboard read
- Reporting read

**Use Cases**:

- Anonymous users
- Public dashboard viewers
- Temporary access

## Permissions

### Complete Permission List

All permissions follow the `module:action` format.

**Dashboard**:

- `dashboard:read` - View dashboard
- `dashboard:export` - Export dashboard data

**User Management**:

- `user_management:create` - Create new users
- `user_management:read` - View user information
- `user_management:update` - Update user information
- `user_management:delete` - Delete users
- `user_management:manage` - Full user management

**Role Management**:

- `role_management:create` - Create new roles
- `role_management:read` - View roles
- `role_management:update` - Update roles
- `role_management:delete` - Delete roles
- `role_management:manage` - Full role management

**Finance**:

- `finance:create` - Create finance records
- `finance:read` - View finance records
- `finance:update` - Modify finance records
- `finance:delete` - Delete finance records
- `finance:approve` - Approve transactions
- `finance:export` - Export finance data

**HR**:

- `hr:create` - Create HR records
- `hr:read` - View HR records
- `hr:update` - Modify HR records
- `hr:delete` - Delete HR records
- `hr:approve` - Approve HR requests
- `hr:export` - Export HR data

**Sales**:

- `sales:create` - Create sales records
- `sales:read` - View sales records
- `sales:update` - Modify sales records
- `sales:delete` - Delete sales records
- `sales:approve` - Approve sales transactions
- `sales:export` - Export sales data

**Other Modules** (Similar patterns):

- `crm:*`
- `procurement:*`
- `inventory:*`
- `production:*`
- `warehouse:*`
- `reporting:*`
- `settings:*`
- `monitoring:*`
- `audit_logs:*`
- `ai_annotator:*`

## API Endpoints

### Role Management (Admin only)

#### Get All Roles

```
GET /api/rbac/roles
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Roles retrieved successfully",
  "data": {
    "roles": [
      {
        "id": "role_admin",
        "name": "admin",
        "display_name": "Administrator",
        "description": "...",
        "permissions": ["..."],
        "is_system": true,
        "is_active": true
      }
    ]
  }
}
```

#### Get Role by ID

```
GET /api/rbac/roles/:roleId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "role": { ... }
  }
}
```

#### Create Role

```
POST /api/rbac/roles
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "analyst",
  "display_name": "Data Analyst",
  "description": "Can analyze and report on data",
  "permissions": ["dashboard:read", "reporting:read", "reporting:create"],
  "module_permissions": {
    "dashboard": ["read"],
    "reporting": ["read", "create"]
  }
}

Response:
{
  "success": true,
  "message": "Role created successfully"
}
```

#### Update Role

```
PUT /api/rbac/roles/:roleId
Authorization: Bearer {token}

Request Body:
{
  "display_name": "Data Analyst (Updated)",
  "permissions": ["..."],
  "is_active": true
}
```

#### Delete Role

```
DELETE /api/rbac/roles/:roleId
Authorization: Bearer {token}
Requires: super_admin role
```

### User Role Assignment

#### Assign Role to User

```
POST /api/rbac/users/:userId/roles/:roleId
Authorization: Bearer {token}

Request Body (optional):
{
  "expiresAt": "2025-12-31T23:59:59Z"  // Optional: temporary assignment
}

Response:
{
  "success": true,
  "message": "Role assigned successfully"
}
```

#### Revoke Role from User

```
DELETE /api/rbac/users/:userId/roles/:roleId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Role revoked successfully"
}
```

#### Get User Roles

```
GET /api/rbac/users/:userId/roles
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "roles": [{ ... }]
  }
}
```

#### Get User Permissions

```
GET /api/rbac/users/:userId/permissions
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "permissions": ["finance:read", "finance:update", ...]
  }
}
```

### Permission Checking (Authenticated Users)

#### Get Current User Roles

```
GET /api/rbac/me/roles
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "roles": [{ ... }]
  }
}
```

#### Get Current User Permissions

```
GET /api/rbac/me/permissions
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "permissions": ["..."]
  }
}
```

#### Check Permission

```
POST /api/rbac/check-permission
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "permission": "finance:approve"
}

Response:
{
  "success": true,
  "data": {
    "permission": "finance:approve",
    "allowed": true
  }
}
```

#### Check Role

```
POST /api/rbac/check-role
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "role": "admin"
}

Response:
{
  "success": true,
  "data": {
    "role": "admin",
    "allowed": true
  }
}
```

## Middleware Usage

### Require Specific Role

Restrict access to users with a specific role:

```typescript
import { authenticate } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/rbacMiddleware";

router.delete(
  "/admin/settings",
  authenticate,
  requireRole("admin"),
  (req, res) => {
    // Only admins can access
    res.json({ message: "Settings deleted" });
  },
);
```

### Require Any of Multiple Roles

Allow access if user has any of the specified roles:

```typescript
router.post(
  "/approval",
  authenticate,
  requireAnyRole(["admin", "manager"]),
  approveHandler,
);
```

### Require All Roles

User must have all specified roles:

```typescript
router.put(
  "/critical-config",
  authenticate,
  requireAllRoles(["admin", "security-officer"]),
  configureHandler,
);
```

### Require Specific Permission

Restrict based on fine-grained permission:

```typescript
router.post(
  "/invoices",
  authenticate,
  requirePermission("finance:create"),
  createInvoiceHandler,
);
```

### Require Any Permission

Allow if user has any of the specified permissions:

```typescript
router.post(
  "/export",
  authenticate,
  requireAnyPermission(["finance:export", "sales:export", "hr:export"]),
  exportHandler,
);
```

### Require Module Access

Simplify permission checking by module:

```typescript
router.get(
  "/finance/reports",
  authenticate,
  requireModuleAccess("finance"),
  getReportsHandler,
);
```

### Custom Permission Check

Implement complex authorization logic:

```typescript
router.put(
  "/users/:id/profile",
  authenticate,
  requirePermissionCheck(async (req) => {
    // Allow admins or the user themselves
    return (
      req.auth!.user.id === req.params.id ||
      (await rbacService.hasRole(req.auth!.user.id, "admin"))
    );
  }),
  updateProfileHandler,
);
```

### Optional Permission Check

Enhance functionality for authorized users without denying access:

```typescript
router.get(
  "/data",
  authenticate,
  optionalPermissionCheck("data:export"),
  (req, res) => {
    const data = getBaseData();

    // Add export options if authorized
    if (req.isAuthorized) {
      data.exportOptions = getExportFormats();
    }

    res.json(data);
  },
);
```

## Configuration

### Environment Variables

Add to `.env`:

```env
# RBAC Configuration
RBAC_CACHE_ENABLED=true
RBAC_CACHE_TTL=3600000  # 1 hour in milliseconds
RBAC_AUDIT_LOG_ENABLED=true
RBAC_MAX_ROLE_ASSIGNMENTS_PER_USER=10
```

### Custom Role Creation

Create a new role programmatically:

```typescript
import { getRbacService } from "../services/rbacService";

const rbacService = getRbacService();

// Create analyst role
const analytRole = {
  id: "role_analyst",
  name: "analyst",
  display_name: "Data Analyst",
  description: "Can analyze data and create reports",
  permissions: [
    "dashboard:read",
    "reporting:read",
    "reporting:create",
    "reporting:export",
  ],
  is_system: false,
  is_active: true,
  module_permissions: {
    dashboard: ["read"],
    reporting: ["read", "create", "export"],
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Save to database...
```

## Examples

### Example 1: Protect Finance Routes

```typescript
import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  requirePermission,
  requireAnyPermission,
  requireModuleAccess,
} from "../middleware/rbacMiddleware";

const router = Router();

// View finance records
router.get(
  "/invoices",
  authenticate,
  requirePermission("finance:read"),
  getInvoices,
);

// Create invoice (finance:create)
router.post(
  "/invoices",
  authenticate,
  requirePermission("finance:create"),
  createInvoice,
);

// Approve invoice (finance:approve)
router.post(
  "/invoices/:id/approve",
  authenticate,
  requirePermission("finance:approve"),
  approveInvoice,
);

// Delete invoice (finance:delete + super_admin)
router.delete(
  "/invoices/:id",
  authenticate,
  requirePermission("finance:delete"),
  deleteInvoice,
);

// Export all finance data
router.get(
  "/export",
  authenticate,
  requirePermission("finance:export"),
  exportFinanceData,
);

export default router;
```

### Example 2: Hierarchical Approval Workflow

```typescript
// Only managers and above can approve
router.post(
  "/requests/:id/approve",
  authenticate,
  requireAnyRole(["admin", "manager"]),
  async (req, res) => {
    const rbacService = getRbacService();

    // Get user's highest privilege role
    const highestRole = await rbacService.getUserHighestPrivilegeRole(
      req.auth.user.id,
    );

    const approvalLevel = getRoleLevel(highestRole.name);

    if (approvalLevel >= requiredLevel) {
      // Approve request
      res.json({ approved: true });
    } else {
      res.status(403).json({ error: "Insufficient privilege level" });
    }
  },
);
```

### Example 3: Resource-Level Authorization

```typescript
// Allow user to update their own profile or admin to update anyone
router.put(
  "/users/:userId/profile",
  authenticate,
  requirePermissionCheck(async (req) => {
    const rbacService = getRbacService();
    const isAdmin = await rbacService.hasRole(req.auth.user.id, "admin");
    const isOwner = req.auth.user.id === req.params.userId;

    return isAdmin || isOwner;
  }),
  updateUserProfile,
);
```

### Example 4: Dynamic Module Access

```typescript
// Check available actions in a module
router.get("/:module/available-actions", authenticate, async (req, res) => {
  const rbacService = getRbacService();
  const actions = await rbacService.getModuleActions(
    req.auth.user.id,
    req.params.module,
  );

  res.json({ actions });
});
```

## Database Schema

### Roles Table

```sql
CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  permissions TEXT NOT NULL,  -- JSON array
  is_system BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  module_permissions TEXT,  -- JSON object
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT,
  updated_by TEXT
);
```

### User Roles Table

```sql
CREATE TABLE user_roles (
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  assigned_at TEXT NOT NULL,
  assigned_by TEXT,
  expires_at TEXT,  -- Optional expiration
  is_active BOOLEAN DEFAULT 1,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

### Permissions Table (Reference)

```sql
CREATE TABLE permissions (
  id TEXT PRIMARY KEY,
  permission TEXT UNIQUE NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_by TEXT
);
```

### RBAC Audit Log Table

```sql
CREATE TABLE rbac_audit_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  target_user_id TEXT,
  target_role_id TEXT,
  details TEXT,  -- JSON
  timestamp TEXT NOT NULL,
  ip_address TEXT,
  FOREIGN KEY (actor_id) REFERENCES users(id),
  FOREIGN KEY (target_user_id) REFERENCES users(id),
  FOREIGN KEY (target_role_id) REFERENCES roles(id)
);
```

## Service Methods

### RbacService API

#### Query Methods

- `getRoleById(roleId: string)` - Get role by ID
- `getRoleByName(roleName: string)` - Get role by name
- `getAllRoles()` - Get all active roles
- `getUserRoles(userId: string)` - Get user's roles
- `getUserPermissions(userId: string)` - Get user's permissions
- `hasPermission(userId: string, permission: Permission)` - Check single permission
- `hasAllPermissions(userId: string, permissions: Permission[])` - Check all permissions
- `hasAnyPermission(userId: string, permissions: Permission[])` - Check any permission
- `hasRole(userId: string, roleName: string)` - Check if user has role
- `hasAnyRole(userId: string, roleNames: string[])` - Check any role
- `hasAllRoles(userId: string, roleNames: string[])` - Check all roles
- `canAccessModule(userId: string, moduleName: string)` - Check module access
- `getModuleActions(userId: string, moduleName: string)` - Get available actions in module
- `getUserHighestPrivilegeRole(userId: string)` - Get user's highest privilege role
- `getRoleHierarchyLevel(roleName: string)` - Get role's hierarchy level

#### Management Methods

- `assignRoleToUser(userId, roleId, assignedBy, expiresAt?)` - Assign role
- `revokeRoleFromUser(userId, roleId, revokedBy)` - Revoke role

#### Cache Methods

- `clearCache()` - Clear permission and role caches
- `setCacheEnabled(enabled: boolean)` - Enable/disable caching

## Best Practices

### 1. Use Module-Level Checks First

Prefer module-level checks before permission-level checks:

```typescript
// ✅ Good: Check module first
router.get(
  "/finance/reports",
  authenticate,
  requireModuleAccess("finance"), // Simple check
  getReportsHandler,
);

// ✅ Also good: Use permission for fine-grained control
router.post(
  "/finance/reports",
  authenticate,
  requirePermission("finance:export"), // Specific action
  exportReportsHandler,
);
```

### 2. Cache Permission Checks

Use caching for performance in high-traffic endpoints:

```typescript
// Permission checks are cached by default
// Cache is invalidated when roles are assigned/revoked
const hasPermission = await rbacService.hasPermission(userId, "finance:read");
```

### 3. Log All RBAC Changes

Use the audit log for compliance:

```typescript
// All role assignments/revocations are automatically logged
await rbacService.assignRoleToUser(userId, roleId, adminId);
// Creates audit_log entry automatically
```

### 4. Use Temporary Role Assignments

Assign roles temporarily when needed:

```typescript
const oneWeekFromNow = new Date(
  Date.now() + 7 * 24 * 60 * 60 * 1000,
).toISOString();

await rbacService.assignRoleToUser(
  userId,
  roleId,
  adminId,
  oneWeekFromNow, // Role expires after one week
);
```

### 5. Combine Role and Permission Checks

Use both for layered security:

```typescript
// Require admin role AND specific permission
router.delete(
  "/users/:id",
  authenticate,
  requireRole("admin"), // Role-based access
  requirePermission("user_management:delete"), // Permission check
  deleteUserHandler,
);
```

## Migration and Deployment

### Database Initialization

The RBAC tables are automatically created on first startup. The default system roles are inserted if they don't exist.

To manually initialize:

```bash
# Run migration
sqlite3 data/dev.sqlite3 < src/migrations/003_rbac_system.sql
```

### Upgrading Existing Systems

If adding RBAC to an existing system:

1. Run the migration script
2. Assign appropriate roles to existing users
3. Verify permissions are correct before going live
4. Update protected routes with RBAC middleware

## Troubleshooting

### Issue: Permission Denied despite assigned role

**Causes**:

- Role not active (`is_active = false`)
- Permission not in role definition
- User role assignment expired

**Solution**:

```typescript
// Check role details
const role = await rbacService.getRoleById(roleId);
console.log("Role active:", role.is_active);
console.log("Permissions:", role.permissions);

// Check user roles
const roles = await rbacService.getUserRoles(userId);
console.log("User roles:", roles);
```

### Issue: Permission checks slow down requests

**Causes**:

- Caching disabled
- Large number of roles assigned to user

**Solution**:

```typescript
// Enable caching (default)
rbacService.setCacheEnabled(true);

// Manually refresh cache if needed
rbacService.clearCache();
```

### Issue: Newly assigned permissions not recognized

**Causes**:

- Permission cache not cleared
- Role assignment hasn't propagated

**Solution**:

```typescript
// Clear permission cache for user
rbacService.permissionCache.delete(userId);

// Or clear all caches
rbacService.clearCache();
```

## Future Enhancements

- [ ] Dynamic permission groups
- [ ] Conditional role assignments (time-based, location-based)
- [ ] Permission delegation
- [ ] Role inheritance chains
- [ ] Bulk role assignment
- [ ] Permission analytics and reporting
- [ ] Two-factor authorization for sensitive roles
- [ ] Role history and audit trail UI

---

**For questions or issues**: See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
