// SPDX-License-Identifier: MIT
// apps/backend/src/middleware/rbacMiddleware.ts

/**
 * RBAC Middleware
 *
 * Provides authorization middleware for role-based and permission-based access control.
 * Works in conjunction with the authentication middleware to enforce authorization rules.
 *
 * @remarks
 * This middleware provides:
 * - Role-based access control (requireRole, requireAnyRole, requireAllRoles)
 * - Permission-based access control (requirePermission, requireAnyPermission, requireAllPermissions)
 * - Module access control (requireModuleAccess)
 * - Custom permission checkers
 *
 * @example
 * ```typescript
 * // Require specific role
 * router.delete('/users/:id', authenticate, requireRole('admin'), deleteUser);
 *
 * // Require any of multiple roles
 * router.post('/approvals', authenticate, requireAnyRole(['manager', 'admin']), approveRequest);
 *
 * // Require specific permission
 * router.post('/invoices', authenticate, requirePermission('finance:create'), createInvoice);
 *
 * // Require module access
 * router.get('/sales/reports', authenticate, requireModuleAccess('sales'), getSalesReports);
 *
 * // Custom permission check
 * router.get('/users/:id', authenticate, requirePermissionCheck(async (req) => {
 *   return await canViewUser(req.auth.user.id, req.params.id);
 * }), getUser);
 * ```
 *
 * @module middleware/rbacMiddleware
 */

import { Request, Response, NextFunction } from 'express';
import { getRbacService } from '../services/rbacService.js';
import { sendForbidden } from '../utils/errorResponse.js';
import type { Permission } from '../types/rbac.js';

/**
 * Require specific role
 *
 * @param roleName - Name of the required role
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * router.delete('/admin/settings', authenticate, requireRole('admin'), deleteSettings);
 * ```
 */
export function requireRole(roleName: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        sendForbidden(res, 'Authentication required');
        return;
      }

      const rbacService = getRbacService();
      const hasRole = await rbacService.hasRole(req.auth.user.id, roleName);

      if (!hasRole) {
        sendForbidden(res, `Role '${roleName}' required`);
        return;
      }

      next();
    } catch (error) {
      console.error('Error in requireRole middleware:', error);
      sendForbidden(res, 'Authorization check failed');
    }
  };
}

/**
 * Require any of multiple roles
 *
 * @param roleNames - Array of role names, user must have at least one
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * router.post('/approvals', authenticate, requireAnyRole(['manager', 'admin']), approveRequest);
 * ```
 */
export function requireAnyRole(roleNames: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        sendForbidden(res, 'Authentication required');
        return;
      }

      const rbacService = getRbacService();
      const hasRole = await rbacService.hasAnyRole(req.auth.user.id, roleNames);

      if (!hasRole) {
        sendForbidden(res, `One of the following roles required: ${roleNames.join(', ')}`);
        return;
      }

      next();
    } catch (error) {
      console.error('Error in requireAnyRole middleware:', error);
      sendForbidden(res, 'Authorization check failed');
    }
  };
}

/**
 * Require all specified roles
 *
 * @param roleNames - Array of role names, user must have all
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * router.put('/settings/advanced', authenticate, requireAllRoles(['admin', 'security']), updateAdvancedSettings);
 * ```
 */
export function requireAllRoles(roleNames: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        sendForbidden(res, 'Authentication required');
        return;
      }

      const rbacService = getRbacService();
      const hasAllRoles = await rbacService.hasAllRoles(req.auth.user.id, roleNames);

      if (!hasAllRoles) {
        sendForbidden(res, `All of the following roles required: ${roleNames.join(', ')}`);
        return;
      }

      next();
    } catch (error) {
      console.error('Error in requireAllRoles middleware:', error);
      sendForbidden(res, 'Authorization check failed');
    }
  };
}

/**
 * Require specific permission
 *
 * @param permission - Permission in format "module:action" (e.g., "finance:create")
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * router.post('/invoices', authenticate, requirePermission('finance:create'), createInvoice);
 * ```
 */
export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        sendForbidden(res, 'Authentication required');
        return;
      }

      const rbacService = getRbacService();
      const hasPermission = await rbacService.hasPermission(req.auth.user.id, permission);

      if (!hasPermission) {
        sendForbidden(res, `Permission '${permission}' required`);
        return;
      }

      next();
    } catch (error) {
      console.error('Error in requirePermission middleware:', error);
      sendForbidden(res, 'Authorization check failed');
    }
  };
}

/**
 * Require any of multiple permissions
 *
 * @param permissions - Array of permissions, user must have at least one
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * router.post('/data/import', authenticate, 
 *   requireAnyPermission(['finance:import', 'hr:import']), 
 *   importData);
 * ```
 */
export function requireAnyPermission(permissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        sendForbidden(res, 'Authentication required');
        return;
      }

      const rbacService = getRbacService();
      const hasPermission = await rbacService.hasAnyPermission(req.auth.user.id, permissions);

      if (!hasPermission) {
        sendForbidden(res, `One of the following permissions required: ${permissions.join(', ')}`);
        return;
      }

      next();
    } catch (error) {
      console.error('Error in requireAnyPermission middleware:', error);
      sendForbidden(res, 'Authorization check failed');
    }
  };
}

/**
 * Require all specified permissions
 *
 * @param permissions - Array of permissions, user must have all
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * router.post('/reconciliation', authenticate, 
 *   requireAllPermissions(['finance:read', 'finance:update']), 
 *   reconcileAccounts);
 * ```
 */
export function requireAllPermissions(permissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        sendForbidden(res, 'Authentication required');
        return;
      }

      const rbacService = getRbacService();
      const hasAllPermissions = await rbacService.hasAllPermissions(req.auth.user.id, permissions);

      if (!hasAllPermissions) {
        sendForbidden(res, `All of the following permissions required: ${permissions.join(', ')}`);
        return;
      }

      next();
    } catch (error) {
      console.error('Error in requireAllPermissions middleware:', error);
      sendForbidden(res, 'Authorization check failed');
    }
  };
}

/**
 * Require access to specific module
 *
 * @param moduleName - Name of the module
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * router.get('/finance/reports', authenticate, requireModuleAccess('finance'), getFinanceReports);
 * ```
 */
export function requireModuleAccess(moduleName: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        sendForbidden(res, 'Authentication required');
        return;
      }

      const rbacService = getRbacService();
      const canAccess = await rbacService.canAccessModule(req.auth.user.id, moduleName);

      if (!canAccess) {
        sendForbidden(res, `Access to '${moduleName}' module denied`);
        return;
      }

      next();
    } catch (error) {
      console.error('Error in requireModuleAccess middleware:', error);
      sendForbidden(res, 'Authorization check failed');
    }
  };
}

/**
 * Custom permission checker
 *
 * @param checker - Async function that returns true if authorized
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * router.put('/users/:id/profile', authenticate, 
 *   requirePermissionCheck(async (req) => {
 *     // Allow admins or the user themselves
 *     return req.auth.user.id === req.params.id || 
 *            await rbacService.hasRole(req.auth.user.id, 'admin');
 *   }), 
 *   updateUserProfile);
 * ```
 */
export function requirePermissionCheck(
  checker: (req: Request) => Promise<boolean>,
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        sendForbidden(res, 'Authentication required');
        return;
      }

      const allowed = await checker(req);

      if (!allowed) {
        sendForbidden(res, 'You do not have permission to access this resource');
        return;
      }

      next();
    } catch (error) {
      console.error('Error in requirePermissionCheck middleware:', error);
      sendForbidden(res, 'Authorization check failed');
    }
  };
}

/**
 * Optional authorization check
 *
 * Used for endpoints that can be accessed by authenticated users
 * but have enhanced functionality for authorized users.
 *
 * @param permission - Permission to check
 * @returns Middleware function that sets req.isAuthorized if user has permission
 *
 * @example
 * ```typescript
 * router.get('/data', authenticate, optionalPermissionCheck('data:export'), getData);
 * 
 * // In route handler:
 * if (req.isAuthorized) {
 *   // Include export options
 * }
 * ```
 */
export function optionalPermissionCheck(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        req.isAuthorized = false;
        next();
        return;
      }

      const rbacService = getRbacService();
      req.isAuthorized = await rbacService.hasPermission(req.auth.user.id, permission);

      next();
    } catch (error) {
      console.error('Error in optionalPermissionCheck middleware:', error);
      req.isAuthorized = false;
      next();
    }
  };
}

// Extend Express Request to include authorization flag
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      isAuthorized?: boolean;
    }
  }
}
