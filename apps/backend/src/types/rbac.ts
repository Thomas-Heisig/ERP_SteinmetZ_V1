// SPDX-License-Identifier: MIT
// apps/backend/src/types/rbac.ts

/**
 * Role-Based Access Control (RBAC) Types
 *
 * Defines interfaces and types for implementing role-based access control
 * with fine-grained permission management across the ERP system.
 *
 * @module types/rbac
 */

/**
 * System Role Names
 * @enum
 */
export enum RoleNames {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  USER = 'user',
  VIEWER = 'viewer',
  GUEST = 'guest',
}

/**
 * Module Names in ERP System
 * @enum
 */
export enum ModuleNames {
  DASHBOARD = 'dashboard',
  USER_MANAGEMENT = 'user_management',
  ROLE_MANAGEMENT = 'role_management',
  FINANCE = 'finance',
  HR = 'hr',
  CRM = 'crm',
  SALES = 'sales',
  PROCUREMENT = 'procurement',
  INVENTORY = 'inventory',
  PRODUCTION = 'production',
  WAREHOUSE = 'warehouse',
  BUSINESS = 'business',
  MARKETING = 'marketing',
  REPORTING = 'reporting',
  SETTINGS = 'settings',
  MONITORING = 'monitoring',
  AUDIT_LOGS = 'audit_logs',
  AI_ANNOTATOR = 'ai_annotator',
  COMMUNICATION = 'communication',
  PROJECTS = 'projects',
  DOCUMENTS = 'documents',
}

/**
 * Permission Actions
 * @enum
 */
export enum PermissionActions {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
  SHARE = 'share',
  UNSHARE = 'unshare',
  CONFIGURE = 'configure',
  MANAGE = 'manage',
}

/**
 * Permission format: "module:action"
 * Example: "finance:create", "user_management:delete"
 */
export type Permission = `${string}:${string}`;

/**
 * Role Definition
 */
export interface RoleDefinition {
  id: string;
  name: RoleNames | string;
  display_name: string;
  description?: string | null;
  permissions: Permission[];
  is_system: boolean; // System roles cannot be deleted
  is_active: boolean;
  module_permissions: Record<ModuleNames | string, string[]>; // Detailed module permissions
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

/**
 * User Role Assignment
 */
export interface UserRoleAssignment {
  user_id: string;
  role_id: string;
  role_name: RoleNames | string;
  assigned_at: string;
  assigned_by: string;
  expires_at?: string; // Optional expiration date for temporary assignments
}

/**
 * Permission Check Context
 */
export interface PermissionContext {
  userId: string;
  roles: RoleNames[] | string[];
  permissions: Permission[];
  modules: (ModuleNames | string)[];
  resource_owner_id?: string; // For resource-level permissions
  resource_type?: string; // For resource-level permissions
}

/**
 * Permission Check Result
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  check_timestamp?: string;
  required_permission?: Permission;
  user_permissions?: Permission[];
}

/**
 * Module Permission Set
 */
export interface ModulePermissionSet {
  module: ModuleNames | string;
  permissions: Permission[];
  granted_by: string;
  granted_at: string;
}

/**
 * Audit Log Entry for RBAC Changes
 */
export interface RbacAuditLog {
  id: string;
  action: 'role_created' | 'role_updated' | 'role_deleted' | 'permission_granted' | 'permission_revoked' | 'role_assigned' | 'role_revoked';
  actor_id: string;
  target_user_id?: string;
  target_role_id?: string;
  details: Record<string, unknown>;
  timestamp: string;
  ip_address?: string;
}

/**
 * Role Hierarchy
 */
export interface RoleHierarchy {
  role: RoleNames | string;
  level: number; // 0 = super admin, higher = lower privilege
  inherits_from?: (RoleNames | string)[]; // Roles this inherits permissions from
}
