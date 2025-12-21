// SPDX-License-Identifier: MIT
// apps/backend/src/types/rbac.ts

/**
 * RBAC Type Definitions
 *
 * Type definitions for Role-Based Access Control system
 *
 * @module types/rbac
 */

/**
 * Permission definition
 */
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

/**
 * Role definition
 */
export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  permissions: Permission[];
  module_permissions?: Record<string, string[]>;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * User role assignment
 */
export interface UserRole {
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by: string;
}

/**
 * Module permission definition
 */
export interface ModulePermission {
  module: string;
  permissions: string[];
}
