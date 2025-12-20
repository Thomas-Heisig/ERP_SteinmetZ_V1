# RBAC Implementation - Integration Checklist

## ✅ Implementation Status: COMPLETE

This checklist helps you integrate the newly implemented RBAC system into your application.

## Phase 1: Database Setup (5 minutes)

- [ ] Run the migration script

  ```bash
  sqlite3 data/dev.sqlite3 < apps/backend/src/migrations/003_rbac_system.sql
  ```

- [ ] Verify tables were created

  ```bash
  sqlite3 data/dev.sqlite3 ".tables" | grep -E "roles|user_roles|permissions"
  ```

- [ ] Check default roles were inserted
  ```bash
  sqlite3 data/dev.sqlite3 "SELECT COUNT(*) FROM roles;"
  # Should show: 7
  ```

## Phase 2: Service Initialization (5 minutes)

- [ ] Add import in `apps/backend/src/index.ts`

  ```typescript
  import { initializeRbacService } from "./services/rbacService.js";
  ```

- [ ] Initialize after database connection

  ```typescript
  const rbacService = initializeRbacService(db);
  ```

- [ ] Verify singleton initialization works (check logs)

## Phase 3: Router Setup (5 minutes)

- [ ] Add import in main app file

  ```typescript
  import rbacRouter from "./routes/rbacRouter.js";
  ```

- [ ] Mount router

  ```typescript
  app.use("/api/rbac", rbacRouter);
  ```

- [ ] Test endpoint
  ```bash
  curl -H "Authorization: Bearer {token}" http://localhost:3000/api/rbac/roles
  ```

## Phase 4: Assign Roles to Existing Users (10 minutes)

For each existing user, assign appropriate role:

```typescript
const rbacService = getRbacService();

// Admin user
await rbacService.assignRoleToUser(
  adminUserId,
  "role_admin",
  "system", // assignedBy
);

// Manager user
await rbacService.assignRoleToUser(managerUserId, "role_manager", "system");

// Regular user
await rbacService.assignRoleToUser(userId, "role_user", "system");
```

## Phase 5: Protect Routes (Varies)

Protect existing routes by adding RBAC middleware:

### Example 1: Admin-Only Routes

```typescript
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

router.delete(
  "/admin/settings",
  authenticate,
  requireRole("admin"),
  deleteSettingsHandler,
);
```

### Example 2: Module-Based Access

```typescript
router.get(
  "/finance/reports",
  authenticate,
  requireModuleAccess("finance"),
  getReportsHandler,
);
```

### Example 3: Permission-Based

```typescript
router.post(
  "/invoices",
  authenticate,
  requirePermission("finance:create"),
  createInvoiceHandler,
);
```

## Phase 6: Testing (15 minutes)

### Test 1: Check Roles API

```bash
curl -H "Authorization: Bearer {admin-token}" \
  http://localhost:3000/api/rbac/roles
```

Expected: List of 7 default roles

### Test 2: Get User Permissions

```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/api/rbac/me/permissions
```

Expected: List of user's permissions

### Test 3: Check Permission

```bash
curl -X POST -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"permission": "finance:create"}' \
  http://localhost:3000/api/rbac/check-permission
```

Expected: `{"allowed": true/false}`

### Test 4: Access Control

```bash
# Should work (user has permission)
curl http://localhost:3000/api/protected-route -H "Authorization: Bearer {token}"

# Should fail with 403 (user lacks permission)
curl http://localhost:3000/api/admin-route -H "Authorization: Bearer {user-token}"
```

## Phase 7: Monitoring & Validation (Ongoing)

- [ ] Check audit logs for role changes

  ```sql
  SELECT * FROM rbac_audit_log ORDER BY timestamp DESC LIMIT 10;
  ```

- [ ] Monitor for permission denied errors
  - Log location: Application error logs
  - Common issue: Role not assigned to user

- [ ] Validate permission cache
  - Use `rbacService.clearCache()` if permissions not updating
  - Cache TTL: 1 hour (configurable)

## Available System Roles

When assigning roles, use these predefined roles:

1. **super_admin** (`role_super_admin`)
   - Full system access
   - Can manage system roles

2. **admin** (`role_admin`)
   - Administrative access
   - Cannot manage system roles

3. **manager** (`role_manager`)
   - Can approve transactions
   - Can manage team

4. **supervisor** (`role_supervisor`)
   - Can supervise team
   - Can update team data

5. **user** (`role_user`)
   - Standard user access
   - Can create in assigned modules

6. **viewer** (`role_viewer`)
   - Read-only access

7. **guest** (`role_guest`)
   - Limited guest access

## Middleware Functions Reference

Use these in your route definitions:

```typescript
// Role-based
requireRole(roleName)                    // Single role
requireAnyRole(roleNames)                // Any role
requireAllRoles(roleNames)               // All roles

// Permission-based
requirePermission(permission)            // Single permission
requireAnyPermission(permissions)        // Any permission
requireAllPermissions(permissions)       // All permissions

// Module-based
requireModuleAccess(moduleName)          // Module access

// Custom
requirePermissionCheck(async (req) => {...})     // Custom logic
optionalPermissionCheck(permission)              // Optional auth
```

## Configuration

Add to `.env` if needed:

```env
# RBAC Configuration (defaults shown)
RBAC_CACHE_ENABLED=true
RBAC_CACHE_TTL=3600000
RBAC_AUDIT_LOG_ENABLED=true
RBAC_MAX_ROLE_ASSIGNMENTS_PER_USER=10
```

## Documentation Files

- **Main Documentation**: `docs/RBAC_IMPLEMENTATION.md`
- **Completion Summary**: `docs/RBAC_COMPLETION_SUMMARY.md`
- **Quick Start**: `apps/backend/src/routes/rbac/README.md`
- **Type Definitions**: `apps/backend/src/types/rbac.ts`
- **Configuration**: `apps/backend/src/config/rbac.ts`

## Troubleshooting

### Issue: "RBAC Service not initialized"

**Solution**: Call `initializeRbacService(db)` after database connection

### Issue: "Permission Denied" despite assigned role

**Solution**:

- Verify role is assigned: `SELECT * FROM user_roles WHERE user_id = 'xxx';`
- Check role is active: `SELECT is_active FROM roles WHERE name = 'admin';`
- Clear cache: `rbacService.clearCache();`

### Issue: Slow permission checks

**Solution**: Ensure caching is enabled (default) and check database indices

### Issue: New permissions not recognized

**Solution**: Clear cache with `rbacService.clearCache()`

## Performance Tips

1. **Enable Caching** (default)
   - Permissions cached by user
   - Roles cached by ID
   - Automatic invalidation on changes

2. **Use Module Checks First**
   - `requireModuleAccess()` before `requirePermission()`
   - More efficient than individual permission checks

3. **Batch Role Assignments**
   - Avoid rapid sequential assignments
   - Use transactions if bulk assigning

4. **Archive Audit Logs**
   - Implement log rotation/archiving
   - Consider purging old entries quarterly

## Security Best Practices

1. **Use Appropriate Roles**
   - Assign least privilege role
   - Don't overuse super_admin
   - Use manager role for approvals

2. **Temporary Assignments**
   - Use expiration dates for temporary access
   - Example: contractor access for 3 months

3. **Monitor Audit Logs**
   - Review role changes regularly
   - Alert on suspicious activity
   - Archive logs for compliance

4. **Regular Access Reviews**
   - Quarterly review of role assignments
   - Remove unnecessary roles
   - Update permissions as needed

## Integration Timeline

| Phase     | Task               | Time       | Effort      |
| --------- | ------------------ | ---------- | ----------- |
| 1         | Database Setup     | 5 min      | Low         |
| 2         | Service Init       | 5 min      | Low         |
| 3         | Router Setup       | 5 min      | Low         |
| 4         | Assign Roles       | 10 min     | Medium      |
| 5         | Protect Routes     | Varies     | Medium-High |
| 6         | Testing            | 15 min     | Low         |
| 7         | Monitoring         | Ongoing    | Low         |
| **Total** | **Complete Setup** | **55 min** | **Medium**  |

## Rollback Plan

If you need to rollback:

1. **Remove Router**

   ```typescript
   // Remove this line
   // app.use('/api/rbac', rbacRouter);
   ```

2. **Remove Middleware**
   - Remove RBAC middleware from protected routes
   - Routes become unprotected

3. **Drop Tables** (if needed)

   ```sql
   DROP TABLE IF EXISTS rbac_audit_log;
   DROP TABLE IF EXISTS module_permissions;
   DROP TABLE IF EXISTS user_roles;
   DROP TABLE IF EXISTS permissions;
   DROP TABLE IF EXISTS roles;
   ```

4. **Restart Application**

## Success Criteria

You've successfully integrated RBAC when:

- [x] All 7 default roles are in database
- [x] RBAC service initializes without errors
- [x] API endpoints respond to authenticated requests
- [x] Role assignments work via API
- [x] Protected routes deny access to unauthorized users
- [x] Audit logs record RBAC changes
- [x] Permission cache works correctly
- [x] Tests pass with appropriate permissions

## Next Steps

1. Read the full documentation: `docs/RBAC_IMPLEMENTATION.md`
2. Review example routes in `RBAC_IMPLEMENTATION.md#examples`
3. Implement role assignments for existing users
4. Protect critical routes with RBAC middleware
5. Set up monitoring and alerting
6. Document custom roles/permissions
7. Train team on RBAC system

## Support

For questions or issues:

- Check `docs/RBAC_IMPLEMENTATION.md#troubleshooting`
- Review middleware examples
- Check service method documentation
- Review database schema in migration file

---

**Setup Status**: Ready for Integration  
**Estimated Total Time**: ~1 hour (including testing and user assignments)  
**Complexity**: Low to Medium (straightforward setup with examples)
