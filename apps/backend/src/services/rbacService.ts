// SPDX-License-Identifier: MIT
// apps/backend/src/services/rbacService.ts

/**
 * RBAC Service
 *
 * Manages role-based access control operations including:
 * - Role assignment and revocation
 * - Permission checking
 * - Role and permission management
 * - RBAC audit logging
 *
 * @module services/rbacService
 */

import { Database } from 'better-sqlite3';
import { 
  ModuleNames, 
  type RoleDefinition, 
  type Permission, 
  type RbacAuditLog,
} from '../types/rbac.js';
import { DEFAULT_ROLES, ROLE_HIERARCHY } from '../config/rbac.js';

// Database row interfaces
interface RoleRow {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  permissions: string;
  module_permissions: string | null;
  is_system: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

interface _UserRoleRow {
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by: string | null;
  expires_at: string | null;
}

/**
 * RBAC Service
 */
export class RbacService {
  private db: Database;
  private cacheEnabled: boolean = true;
  private roleCache: Map<string, RoleDefinition> = new Map();
  private permissionCache: Map<string, Permission[]> = new Map();

  constructor(db: Database) {
    this.db = db;
    this.initializeTables();
  }

  /**
   * Initialize RBAC tables in database
   */
  private initializeTables(): void {
    try {
      // Create roles table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS roles (
          id TEXT PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          display_name TEXT NOT NULL,
          description TEXT,
          permissions TEXT NOT NULL,
          is_system BOOLEAN DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          module_permissions TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // Create user_roles table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS user_roles (
          user_id TEXT NOT NULL,
          role_id TEXT NOT NULL,
          assigned_at TEXT NOT NULL,
          assigned_by TEXT,
          expires_at TEXT,
          PRIMARY KEY (user_id, role_id),
          FOREIGN KEY (role_id) REFERENCES roles(id)
        );
      `);

      // Create permissions table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS permissions (
          id TEXT PRIMARY KEY,
          permission TEXT UNIQUE NOT NULL,
          module TEXT NOT NULL,
          action TEXT NOT NULL,
          description TEXT,
          created_at TEXT NOT NULL
        );
      `);

      // Create rbac_audit_log table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS rbac_audit_log (
          id TEXT PRIMARY KEY,
          action TEXT NOT NULL,
          actor_id TEXT NOT NULL,
          target_user_id TEXT,
          target_role_id TEXT,
          details TEXT,
          timestamp TEXT NOT NULL,
          ip_address TEXT
        );
      `);

      // Create indices
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
        CREATE INDEX IF NOT EXISTS idx_rbac_audit_timestamp ON rbac_audit_log(timestamp);
      `);

      // Initialize default roles if not already present
      this.initializeDefaultRoles();
    } catch (error) {
      console.error('Error initializing RBAC tables:', error);
    }
  }

  /**
   * Initialize default system roles
   */
  private initializeDefaultRoles(): void {
    try {
      const roleCount = this.db.prepare('SELECT COUNT(*) as count FROM roles').get() as { count: number };
      
      if (roleCount.count === 0) {
        const insertRole = this.db.prepare(`
          INSERT INTO roles (id, name, display_name, description, permissions, is_system, is_active, module_permissions, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const role of DEFAULT_ROLES) {
          insertRole.run(
            role.id,
            role.name,
            role.display_name,
            role.description,
            JSON.stringify(role.permissions),
            role.is_system ? 1 : 0,
            role.is_active ? 1 : 0,
            JSON.stringify(role.module_permissions),
            role.created_at,
            role.updated_at,
          );
        }
      }
    } catch (error) {
      console.error('Error initializing default roles:', error);
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(roleId: string): Promise<RoleDefinition | null> {
    try {
      // Check cache first
      if (this.cacheEnabled && this.roleCache.has(roleId)) {
        return this.roleCache.get(roleId) || null;
      }

      const result = this.db.prepare('SELECT * FROM roles WHERE id = ?').get(roleId) as RoleRow | undefined;
      
      if (!result) {
        return null;
      }

      const role: RoleDefinition = {
        ...result,
        permissions: JSON.parse(result.permissions),
        module_permissions: result.module_permissions ? JSON.parse(result.module_permissions) : {},
        is_system: Boolean(result.is_system),
        is_active: Boolean(result.is_active),
      };

      // Cache the result
      if (this.cacheEnabled) {
        this.roleCache.set(roleId, role);
      }

      return role;
    } catch (error) {
      console.error('Error getting role:', error);
      return null;
    }
  }

  /**
   * Get role by name
   */
  async getRoleByName(roleName: string): Promise<RoleDefinition | null> {
    try {
      const result = this.db.prepare('SELECT * FROM roles WHERE name = ?').get(roleName) as RoleRow | undefined;
      
      if (!result) {
        return null;
      }

      return {
        ...result,
        permissions: JSON.parse(result.permissions),
        module_permissions: result.module_permissions ? JSON.parse(result.module_permissions) : {},
        is_system: Boolean(result.is_system),
        is_active: Boolean(result.is_active),
      };
    } catch (error) {
      console.error('Error getting role by name:', error);
      return null;
    }
  }

  /**
   * Get all roles
   */
  async getAllRoles(): Promise<RoleDefinition[]> {
    try {
      const results = this.db.prepare('SELECT * FROM roles WHERE is_active = 1 ORDER BY name').all() as RoleRow[];
      
      return results.map(result => ({
        ...result,
        permissions: JSON.parse(result.permissions),
        module_permissions: result.module_permissions ? JSON.parse(result.module_permissions) : {},
        is_system: Boolean(result.is_system),
        is_active: Boolean(result.is_active),
      }));
    } catch (error) {
      console.error('Error getting all roles:', error);
      return [];
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<RoleDefinition[]> {
    try {
      const results = this.db.prepare(`
        SELECT r.* FROM roles r
        INNER JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ? AND r.is_active = 1
        AND (ur.expires_at IS NULL OR ur.expires_at > datetime('now'))
      `).all(userId) as RoleRow[];

      return results.map(result => ({
        ...result,
        permissions: JSON.parse(result.permissions),
        module_permissions: result.module_permissions ? JSON.parse(result.module_permissions) : {},
        is_system: Boolean(result.is_system),
        is_active: Boolean(result.is_active),
      }));
    } catch (error) {
      console.error('Error getting user roles:', error);
      return [];
    }
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(
    userId: string,
    roleId: string,
    assignedBy: string,
    expiresAt?: string,
  ): Promise<boolean> {
    try {
      const role = await this.getRoleById(roleId);
      if (!role) {
        throw new Error(`Role ${roleId} not found`);
      }

      this.db.prepare(`
        INSERT OR REPLACE INTO user_roles (user_id, role_id, assigned_at, assigned_by, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, roleId, new Date().toISOString(), assignedBy, expiresAt || null);

      // Log the action
      await this.logRbacAudit('role_assigned', assignedBy, userId, roleId, {
        role_name: role.name,
        expires_at: expiresAt,
      });

      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    }
  }

  /**
   * Revoke role from user
   */
  async revokeRoleFromUser(userId: string, roleId: string, revokedBy: string): Promise<boolean> {
    try {
      const role = await this.getRoleById(roleId);
      if (!role) {
        throw new Error(`Role ${roleId} not found`);
      }

      this.db.prepare('DELETE FROM user_roles WHERE user_id = ? AND role_id = ?').run(userId, roleId);

      // Log the action
      await this.logRbacAudit('role_revoked', revokedBy, userId, roleId, {
        role_name: role.name,
      });

      return true;
    } catch (error) {
      console.error('Error revoking role:', error);
      return false;
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      // Check cache first
      if (this.cacheEnabled && this.permissionCache.has(userId)) {
        return this.permissionCache.get(userId) || [];
      }

      const roles = await this.getUserRoles(userId);
      const permissions = new Set<Permission>();

      for (const role of roles) {
        for (const permission of role.permissions) {
          permissions.add(permission);
        }
      }

      const permissionArray = Array.from(permissions) as Permission[];

      // Cache the result
      if (this.cacheEnabled) {
        this.permissionCache.set(userId, permissionArray);
      }

      return permissionArray;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissions.includes(permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user has all permissions
   */
  async hasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      return permissions.every(p => userPermissions.includes(p));
    } catch (error) {
      console.error('Error checking all permissions:', error);
      return false;
    }
  }

  /**
   * Check if user has any permission
   */
  async hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      return permissions.some(p => userPermissions.includes(p));
    } catch (error) {
      console.error('Error checking any permission:', error);
      return false;
    }
  }

  /**
   * Check if user has role
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    try {
      const roles = await this.getUserRoles(userId);
      return roles.some(r => r.name === roleName);
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }

  /**
   * Check if user has any role
   */
  async hasAnyRole(userId: string, roleNames: string[]): Promise<boolean> {
    try {
      const roles = await this.getUserRoles(userId);
      return roles.some(r => roleNames.includes(r.name));
    } catch (error) {
      console.error('Error checking any role:', error);
      return false;
    }
  }

  /**
   * Check if user has all roles
   */
  async hasAllRoles(userId: string, roleNames: string[]): Promise<boolean> {
    try {
      const roles = await this.getUserRoles(userId);
      const userRoleNames = roles.map(r => r.name);
      return roleNames.every(r => userRoleNames.includes(r));
    } catch (error) {
      console.error('Error checking all roles:', error);
      return false;
    }
  }

  /**
   * Get role hierarchy level
   */
  getRoleHierarchyLevel(roleName: string): number {
    const hierarchy = ROLE_HIERARCHY.find(h => h.role === roleName);
    return hierarchy ? hierarchy.level : 999; // Unknown roles get lowest priority
  }

  /**
   * Get highest privilege role (lowest level)
   */
  async getUserHighestPrivilegeRole(userId: string): Promise<RoleDefinition | null> {
    try {
      const roles = await this.getUserRoles(userId);
      if (roles.length === 0) {
        return null;
      }

      return roles.reduce((highest, current) => {
        const highestLevel = this.getRoleHierarchyLevel(highest.name);
        const currentLevel = this.getRoleHierarchyLevel(current.name);
        return currentLevel < highestLevel ? current : highest;
      });
    } catch (error) {
      console.error('Error getting highest privilege role:', error);
      return null;
    }
  }

  /**
   * Check if user can access module
   */
  async canAccessModule(userId: string, moduleName: ModuleNames | string): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissions.some(p => p.startsWith(`${moduleName}:`));
    } catch (error) {
      console.error('Error checking module access:', error);
      return false;
    }
  }

  /**
   * Get module actions available to user
   */
  async getModuleActions(userId: string, moduleName: ModuleNames | string): Promise<string[]> {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissions
        .filter(p => p.startsWith(`${moduleName}:`))
        .map(p => p.split(':')[1]);
    } catch (error) {
      console.error('Error getting module actions:', error);
      return [];
    }
  }

  /**
   * Log RBAC action
   */
  private async logRbacAudit(
    action: RbacAuditLog['action'],
    actorId: string,
    targetUserId?: string,
    targetRoleId?: string,
    details?: Record<string, unknown>,
  ): Promise<void> {
    try {
      const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.db.prepare(`
        INSERT INTO rbac_audit_log (id, action, actor_id, target_user_id, target_role_id, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        action,
        actorId,
        targetUserId || null,
        targetRoleId || null,
        details ? JSON.stringify(details) : null,
        new Date().toISOString(),
      );
    } catch (error) {
      console.error('Error logging RBAC audit:', error);
    }
  }

  /**
   * Clear caches
   */
  clearCache(): void {
    this.roleCache.clear();
    this.permissionCache.clear();
  }

  /**
   * Enable/disable caching
   */
  setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.clearCache();
    }
  }
}

// Singleton instance
let rbacServiceInstance: RbacService | null = null;

export function initializeRbacService(db: Database): RbacService {
  if (!rbacServiceInstance) {
    rbacServiceInstance = new RbacService(db);
  }
  return rbacServiceInstance;
}

export function getRbacService(): RbacService {
  if (!rbacServiceInstance) {
    throw new Error('RBAC Service not initialized. Call initializeRbacService first.');
  }
  return rbacServiceInstance;
}
