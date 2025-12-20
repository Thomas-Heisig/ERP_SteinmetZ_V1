// SPDX-License-Identifier: MIT
// apps/backend/src/routes/rbacRouter.ts

/**
 * RBAC Router
 *
 * Provides endpoints for managing roles, permissions, and user role assignments.
 * Only accessible to administrators.
 *
 * @remarks
 * This router provides:
 * - Role management (CRUD operations)
 * - User role assignment/revocation
 * - Permission management
 * - Role hierarchy and inheritance
 * - Audit logging for all RBAC changes
 *
 * All endpoints require authentication and appropriate permissions.
 *
 * @module routes/rbacRouter
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  requirePermission,
  requireRole,
} from '../middleware/rbacMiddleware.js';
import { getRbacService } from '../services/rbacService.js';
import type { Permission } from '../types/rbac.js';

// Helper functions for sending responses
const sendSuccess = (res: Response, message: string, data?: unknown) => {
  res.status(200).json({ success: true, message, data });
};

const sendError = (res: Response, statusCode: number, message: string, error?: unknown) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  res.status(statusCode).json({ success: false, message, error: errorMessage });
};

// Helper function to get authenticated user ID
function getUserId(req: Request): string {
  if (!req.auth || !req.auth.user || !req.auth.user.id) {
    throw new Error('User not authenticated');
  }
  return req.auth.user.id;
}

const router = Router();
const rbacService = getRbacService();

/**
 * POST /api/rbac/roles
 * Create a new role
 *
 * @requiresRole admin
 */
router.post(
  '/roles',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, display_name, description, permissions, module_permissions } = req.body;

    if (!name || !display_name || !permissions) {
      sendError(res, 400, 'Missing required fields: name, display_name, permissions');
      return;
    }

    try {
      // TODO: Implement database insertion
      sendSuccess(res, 'Role created successfully', {
        role: {
          id: `role_${Date.now()}`,
          name,
          display_name,
          description,
          permissions,
          module_permissions,
          is_system: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      sendError(res, 500, 'Failed to create role', error);
    }
  }),
);

/**
 * GET /api/rbac/roles
 * Get all roles
 *
 * @requiresRole admin
 */
router.get(
  '/roles',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const roles = await rbacService.getAllRoles();
      sendSuccess(res, 'Roles retrieved successfully', { roles });
    } catch (error) {
      sendError(res, 500, 'Failed to retrieve roles', error);
    }
  }),
);

/**
 * GET /api/rbac/roles/:roleId
 * Get role by ID
 *
 * @requiresRole admin
 */
router.get(
  '/roles/:roleId',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const role = await rbacService.getRoleById(req.params.roleId);
      if (!role) {
        sendError(res, 404, 'Role not found');
        return;
      }
      sendSuccess(res, 'Role retrieved successfully', { role });
    } catch (error) {
      sendError(res, 500, 'Failed to retrieve role', error);
    }
  }),
);

/**
 * PUT /api/rbac/roles/:roleId
 * Update role
 *
 * @requiresRole admin
 */
router.put(
  '/roles/:roleId',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { display_name, description, permissions, module_permissions, is_active } = req.body;

    try {
      const role = await rbacService.getRoleById(req.params.roleId);
      if (!role) {
        sendError(res, 404, 'Role not found');
        return;
      }

      if (role.is_system) {
        sendError(res, 403, 'System roles cannot be modified');
        return;
      }

      // TODO: Implement database update
      sendSuccess(res, 'Role updated successfully', {
        role: {
          ...role,
          display_name: display_name || role.display_name,
          description: description || role.description,
          permissions: permissions || role.permissions,
          module_permissions: module_permissions || role.module_permissions,
          is_active: is_active !== undefined ? is_active : role.is_active,
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      sendError(res, 500, 'Failed to update role', error);
    }
  }),
);

/**
 * DELETE /api/rbac/roles/:roleId
 * Delete role
 *
 * @requiresRole super_admin
 */
router.delete(
  '/roles/:roleId',
  authenticate,
  requireRole('super_admin'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const role = await rbacService.getRoleById(req.params.roleId);
      if (!role) {
        sendError(res, 404, 'Role not found');
        return;
      }

      if (role.is_system) {
        sendError(res, 403, 'System roles cannot be deleted');
        return;
      }

      // TODO: Implement database deletion
      sendSuccess(res, 'Role deleted successfully');
    } catch (error) {
      sendError(res, 500, 'Failed to delete role', error);
    }
  }),
);

/**
 * POST /api/rbac/users/:userId/roles/:roleId
 * Assign role to user
 *
 * @requiresPermission role_management:assign
 */
router.post(
  '/users/:userId/roles/:roleId',
  authenticate,
  requirePermission('role_management:assign' as Permission),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { expiresAt } = req.body;

    try {
      const success = await rbacService.assignRoleToUser(
        req.params.userId,
        req.params.roleId,
        getUserId(req),
        expiresAt,
      );

      if (!success) {
        sendError(res, 400, 'Failed to assign role');
        return;
      }

      sendSuccess(res, 'Role assigned successfully');
    } catch (error) {
      sendError(res, 500, 'Failed to assign role', error);
    }
  }),
);

/**
 * DELETE /api/rbac/users/:userId/roles/:roleId
 * Revoke role from user
 *
 * @requiresPermission role_management:revoke
 */
router.delete(
  '/users/:userId/roles/:roleId',
  authenticate,
  requirePermission('role_management:revoke' as Permission),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const success = await rbacService.revokeRoleFromUser(
        req.params.userId,
        req.params.roleId,
        getUserId(req),
      );

      if (!success) {
        sendError(res, 400, 'Failed to revoke role');
        return;
      }

      sendSuccess(res, 'Role revoked successfully');
    } catch (error) {
      sendError(res, 500, 'Failed to revoke role', error);
    }
  }),
);

/**
 * GET /api/rbac/users/:userId/roles
 * Get user roles
 *
 * @requiresPermission user_management:read
 */
router.get(
  '/users/:userId/roles',
  authenticate,
  requirePermission('user_management:read' as Permission),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const roles = await rbacService.getUserRoles(req.params.userId);
      sendSuccess(res, 'User roles retrieved successfully', { roles });
    } catch (error) {
      sendError(res, 500, 'Failed to retrieve user roles', error);
    }
  }),
);

/**
 * GET /api/rbac/users/:userId/permissions
 * Get user permissions
 *
 * @requiresPermission user_management:read
 */
router.get(
  '/users/:userId/permissions',
  authenticate,
  requirePermission('user_management:read' as Permission),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const permissions = await rbacService.getUserPermissions(req.params.userId);
      sendSuccess(res, 'User permissions retrieved successfully', { permissions });
    } catch (error) {
      sendError(res, 500, 'Failed to retrieve user permissions', error);
    }
  }),
);

/**
 * GET /api/rbac/me/permissions
 * Get current user permissions
 *
 * @requiresAuth
 */
router.get(
  '/me/permissions',
  authenticate,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const permissions = await rbacService.getUserPermissions(getUserId(req));
      sendSuccess(res, 'Permissions retrieved successfully', { permissions });
    } catch (error) {
      sendError(res, 500, 'Failed to retrieve permissions', error);
    }
  }),
);

/**
 * GET /api/rbac/me/roles
 * Get current user roles
 *
 * @requiresAuth
 */
router.get(
  '/me/roles',
  authenticate,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const roles = await rbacService.getUserRoles(getUserId(req));
      sendSuccess(res, 'Roles retrieved successfully', { roles });
    } catch (error) {
      sendError(res, 500, 'Failed to retrieve roles', error);
    }
  }),
);

/**
 * POST /api/rbac/check-permission
 * Check if user has permission
 *
 * @requiresAuth
 */
router.post(
  '/check-permission',
  authenticate,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { permission } = req.body;

    if (!permission) {
      sendError(res, 400, 'Missing required field: permission');
      return;
    }

    try {
      const hasPermission = await rbacService.hasPermission(
        getUserId(req),
        permission as Permission,
      );
      sendSuccess(res, 'Permission check completed', {
        permission,
        allowed: hasPermission,
      });
    } catch (error) {
      sendError(res, 500, 'Failed to check permission', error);
    }
  }),
);

/**
 * POST /api/rbac/check-role
 * Check if user has role
 *
 * @requiresAuth
 */
router.post(
  '/check-role',
  authenticate,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { role } = req.body;

    if (!role) {
      sendError(res, 400, 'Missing required field: role');
      return;
    }

    try {
      const hasRole = await rbacService.hasRole(getUserId(req), role);
      sendSuccess(res, 'Role check completed', {
        role,
        allowed: hasRole,
      });
    } catch (error) {
      sendError(res, 500, 'Failed to check role', error);
    }
  }),
);

/**
 * GET /api/rbac/roles/:roleId/users
 * Get users with specific role
 *
 * @requiresRole admin
 */
router.get(
  '/roles/:roleId/users',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Implement database query
      sendSuccess(res, 'Users retrieved successfully', { users: [] });
    } catch (error) {
      sendError(res, 500, 'Failed to retrieve users', error);
    }
  }),
);

export default router;
