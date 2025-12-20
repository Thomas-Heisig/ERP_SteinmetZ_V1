-- SPDX-License-Identifier: MIT
-- apps/backend/src/migrations/003_rbac_system.sql
-- RBAC (Role-Based Access Control) System Tables and Initial Data

-- Roles table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[roles]') AND type in (N'U'))
BEGIN
CREATE TABLE roles (
    id NVARCHAR(255) PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    permissions TEXT NOT NULL,  -- JSON array of permission strings
    is_system BOOLEAN DEFAULT 0,  -- System roles cannot be deleted
    is_active BOOLEAN DEFAULT 1,
    module_permissions TEXT,  -- JSON object of module -> actions
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by NVARCHAR(255),
    updated_by NVARCHAR(255)
);
END

-- User-Role association table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[user_roles]') AND type in (N'U'))
BEGIN
CREATE TABLE user_roles (
    user_id NVARCHAR(255) NOT NULL,
    role_id NVARCHAR(255) NOT NULL,
    assigned_at DATETIME NOT NULL,
    assigned_by NVARCHAR(255),
    expires_at DATETIME,  -- Optional: temporary role assignments
    is_active BIT DEFAULT 1,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
END

-- Permissions table (reference/documentation)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[permissions]') AND type in (N'U'))
BEGIN
CREATE TABLE permissions (
    id NVARCHAR(255) PRIMARY KEY,
    permission NVARCHAR(255) UNIQUE NOT NULL,  -- Format: "module:action"
    module NVARCHAR(255) NOT NULL,
    action NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    created_at DATETIME NOT NULL,
    updated_by NVARCHAR(255)
);
END

-- RBAC Audit Log table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[rbac_audit_log]') AND type in (N'U'))
BEGIN
CREATE TABLE rbac_audit_log (
    id NVARCHAR(255) PRIMARY KEY,
    action NVARCHAR(255) NOT NULL,  -- role_created, role_updated, role_deleted, permission_granted, permission_revoked, role_assigned, role_revoked
    actor_id NVARCHAR(255) NOT NULL,
    target_user_id NVARCHAR(255),
    target_role_id NVARCHAR(255),
    details NVARCHAR(MAX),  -- JSON with additional context
    timestamp DATETIME NOT NULL,
    ip_address NVARCHAR(50),
    FOREIGN KEY (actor_id) REFERENCES users(id),
    FOREIGN KEY (target_user_id) REFERENCES users(id),
    FOREIGN KEY (target_role_id) REFERENCES roles(id)
);
END

-- Module permissions table (optional: for more granular control)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[module_permissions]') AND type in (N'U'))
BEGIN
CREATE TABLE module_permissions (
    id NVARCHAR(255) PRIMARY KEY,
    role_id NVARCHAR(255) NOT NULL,
    module NVARCHAR(255) NOT NULL,
    actions NVARCHAR(MAX) NOT NULL,  -- JSON array of action strings
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    UNIQUE(role_id, module)
);
END

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires_at ON user_roles(expires_at);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_is_system ON roles(is_system);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_log_actor_id ON rbac_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_log_timestamp ON rbac_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_log_action ON rbac_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_module_permissions_role_id ON module_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_module_permissions_module ON module_permissions(module);

-- Insert default system roles
INSERT OR IGNORE INTO roles (id, name, display_name, description, permissions, is_system, is_active, module_permissions, created_at, updated_at)
VALUES
(
    'role_super_admin',
    'super_admin',
    'Super Administrator',
    'Full system access. Can manage all users, roles, and configurations.',
    '[
        "dashboard:read", "dashboard:export",
        "user_management:create", "user_management:read", "user_management:update", "user_management:delete", "user_management:manage",
        "role_management:create", "role_management:read", "role_management:update", "role_management:delete", "role_management:manage",
        "finance:create", "finance:read", "finance:update", "finance:delete", "finance:approve", "finance:export",
        "hr:create", "hr:read", "hr:update", "hr:delete", "hr:approve", "hr:export",
        "crm:create", "crm:read", "crm:update", "crm:delete", "crm:export",
        "sales:create", "sales:read", "sales:update", "sales:delete", "sales:approve", "sales:export",
        "procurement:create", "procurement:read", "procurement:update", "procurement:delete", "procurement:approve", "procurement:export",
        "inventory:create", "inventory:read", "inventory:update", "inventory:delete", "inventory:export",
        "production:create", "production:read", "production:update", "production:delete", "production:approve", "production:export",
        "warehouse:create", "warehouse:read", "warehouse:update", "warehouse:delete", "warehouse:export",
        "settings:read", "settings:update", "settings:configure",
        "monitoring:read", "monitoring:configure",
        "audit_logs:read", "audit_logs:export",
        "ai_annotator:create", "ai_annotator:read", "ai_annotator:update", "ai_annotator:delete", "ai_annotator:configure",
        "reporting:read", "reporting:create", "reporting:export"
    ]',
    1,
    1,
    '{"user_management":["create","read","update","delete","manage"],"role_management":["create","read","update","delete","manage"],"finance":["create","read","update","delete","approve","export"],"hr":["create","read","update","delete","approve","export"],"crm":["create","read","update","delete","export"],"sales":["create","read","update","delete","approve","export"],"procurement":["create","read","update","delete","approve","export"],"inventory":["create","read","update","delete","export"],"production":["create","read","update","delete","approve","export"],"warehouse":["create","read","update","delete","export"],"dashboard":["read","export"],"settings":["read","update","configure"],"monitoring":["read","configure"],"audit_logs":["read","export"],"ai_annotator":["create","read","update","delete","configure"],"reporting":["read","create","export"]}',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'role_admin',
    'admin',
    'Administrator',
    'Administrative access. Can manage users and configurations but cannot manage system roles.',
    '[
        "dashboard:read", "dashboard:export",
        "user_management:create", "user_management:read", "user_management:update", "user_management:delete",
        "finance:create", "finance:read", "finance:update", "finance:delete", "finance:approve", "finance:export",
        "hr:create", "hr:read", "hr:update", "hr:delete", "hr:approve", "hr:export",
        "crm:create", "crm:read", "crm:update", "crm:delete", "crm:export",
        "sales:create", "sales:read", "sales:update", "sales:delete", "sales:approve", "sales:export",
        "procurement:create", "procurement:read", "procurement:update", "procurement:delete", "procurement:approve", "procurement:export",
        "inventory:create", "inventory:read", "inventory:update", "inventory:delete", "inventory:export",
        "production:create", "production:read", "production:update", "production:delete", "production:approve", "production:export",
        "warehouse:create", "warehouse:read", "warehouse:update", "warehouse:delete", "warehouse:export",
        "settings:read", "settings:update",
        "monitoring:read",
        "audit_logs:read", "audit_logs:export",
        "reporting:read", "reporting:create", "reporting:export"
    ]',
    1,
    1,
    '{"user_management":["create","read","update","delete"],"finance":["create","read","update","delete","approve","export"],"hr":["create","read","update","delete","approve","export"],"crm":["create","read","update","delete","export"],"sales":["create","read","update","delete","approve","export"],"procurement":["create","read","update","delete","approve","export"],"inventory":["create","read","update","delete","export"],"production":["create","read","update","delete","approve","export"],"warehouse":["create","read","update","delete","export"],"dashboard":["read","export"],"settings":["read","update"],"monitoring":["read"],"audit_logs":["read","export"],"reporting":["read","create","export"]}',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'role_manager',
    'manager',
    'Manager',
    'Can manage team members and approve workflow items. Limited to specific modules.',
    '[
        "dashboard:read", "dashboard:export",
        "user_management:read",
        "finance:read", "finance:update", "finance:approve", "finance:export",
        "hr:read", "hr:update", "hr:approve", "hr:export",
        "crm:read", "crm:create", "crm:update", "crm:export",
        "sales:read", "sales:create", "sales:update", "sales:approve", "sales:export",
        "procurement:read", "procurement:create", "procurement:update", "procurement:approve", "procurement:export",
        "inventory:read", "inventory:update", "inventory:export",
        "production:read", "production:update", "production:approve", "production:export",
        "warehouse:read", "warehouse:update", "warehouse:export",
        "reporting:read", "reporting:export"
    ]',
    1,
    1,
    '{"dashboard":["read","export"],"user_management":["read"],"finance":["read","update","approve","export"],"hr":["read","update","approve","export"],"crm":["read","create","update","export"],"sales":["read","create","update","approve","export"],"procurement":["read","create","update","approve","export"],"inventory":["read","update","export"],"production":["read","update","approve","export"],"warehouse":["read","update","export"],"reporting":["read","export"]}',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'role_supervisor',
    'supervisor',
    'Supervisor',
    'Can supervise team work. Can read and update team data.',
    '[
        "dashboard:read",
        "user_management:read",
        "finance:read", "finance:export",
        "hr:read", "hr:export",
        "crm:read", "crm:update", "crm:export",
        "sales:read", "sales:create", "sales:update", "sales:export",
        "procurement:read", "procurement:update", "procurement:export",
        "inventory:read", "inventory:update", "inventory:export",
        "production:read", "production:update", "production:export",
        "warehouse:read", "warehouse:update", "warehouse:export",
        "reporting:read", "reporting:export"
    ]',
    1,
    1,
    '{"dashboard":["read"],"user_management":["read"],"finance":["read","export"],"hr":["read","export"],"crm":["read","update","export"],"sales":["read","create","update","export"],"procurement":["read","update","export"],"inventory":["read","update","export"],"production":["read","update","export"],"warehouse":["read","update","export"],"reporting":["read","export"]}',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'role_user',
    'user',
    'User',
    'Standard user access. Can read and create data in assigned modules.',
    '[
        "dashboard:read",
        "crm:read", "crm:create",
        "sales:read", "sales:create",
        "procurement:read",
        "inventory:read",
        "production:read",
        "warehouse:read",
        "reporting:read"
    ]',
    1,
    1,
    '{"dashboard":["read"],"crm":["read","create"],"sales":["read","create"],"procurement":["read"],"inventory":["read"],"production":["read"],"warehouse":["read"],"reporting":["read"]}',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'role_viewer',
    'viewer',
    'Viewer',
    'Read-only access. Can view data but cannot create or modify.',
    '[
        "dashboard:read",
        "finance:read",
        "hr:read",
        "crm:read",
        "sales:read",
        "procurement:read",
        "inventory:read",
        "production:read",
        "warehouse:read",
        "reporting:read"
    ]',
    1,
    1,
    '{"dashboard":["read"],"finance":["read"],"hr":["read"],"crm":["read"],"sales":["read"],"procurement":["read"],"inventory":["read"],"production":["read"],"warehouse":["read"],"reporting":["read"]}',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'role_guest',
    'guest',
    'Guest',
    'Limited guest access. Can only access public dashboards and reports.',
    '[
        "dashboard:read",
        "reporting:read"
    ]',
    1,
    1,
    '{"dashboard":["read"],"reporting":["read"]}',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert common permissions for reference
INSERT OR IGNORE INTO permissions (id, permission, module, action, description, created_at)
VALUES
('perm_dashboard_read', 'dashboard:read', 'dashboard', 'read', 'View dashboard', CURRENT_TIMESTAMP),
('perm_dashboard_export', 'dashboard:export', 'dashboard', 'export', 'Export dashboard data', CURRENT_TIMESTAMP),
('perm_user_mgmt_create', 'user_management:create', 'user_management', 'create', 'Create new users', CURRENT_TIMESTAMP),
('perm_user_mgmt_read', 'user_management:read', 'user_management', 'read', 'View user information', CURRENT_TIMESTAMP),
('perm_user_mgmt_update', 'user_management:update', 'user_management', 'update', 'Update user information', CURRENT_TIMESTAMP),
('perm_user_mgmt_delete', 'user_management:delete', 'user_management', 'delete', 'Delete users', CURRENT_TIMESTAMP),
('perm_role_mgmt_create', 'role_management:create', 'role_management', 'create', 'Create new roles', CURRENT_TIMESTAMP),
('perm_role_mgmt_read', 'role_management:read', 'role_management', 'read', 'View roles', CURRENT_TIMESTAMP),
('perm_role_mgmt_update', 'role_management:update', 'role_management', 'update', 'Update roles', CURRENT_TIMESTAMP),
('perm_role_mgmt_delete', 'role_management:delete', 'role_management', 'delete', 'Delete roles', CURRENT_TIMESTAMP),
('perm_finance_create', 'finance:create', 'finance', 'create', 'Create finance records', CURRENT_TIMESTAMP),
('perm_finance_read', 'finance:read', 'finance', 'read', 'View finance records', CURRENT_TIMESTAMP),
('perm_finance_approve', 'finance:approve', 'finance', 'approve', 'Approve finance transactions', CURRENT_TIMESTAMP),
('perm_hr_create', 'hr:create', 'hr', 'create', 'Create HR records', CURRENT_TIMESTAMP),
('perm_hr_read', 'hr:read', 'hr', 'read', 'View HR records', CURRENT_TIMESTAMP),
('perm_hr_approve', 'hr:approve', 'hr', 'approve', 'Approve HR requests', CURRENT_TIMESTAMP),
('perm_sales_create', 'sales:create', 'sales', 'create', 'Create sales records', CURRENT_TIMESTAMP),
('perm_sales_read', 'sales:read', 'sales', 'read', 'View sales records', CURRENT_TIMESTAMP),
('perm_sales_approve', 'sales:approve', 'sales', 'approve', 'Approve sales transactions', CURRENT_TIMESTAMP),
('perm_procurement_create', 'procurement:create', 'procurement', 'create', 'Create procurement records', CURRENT_TIMESTAMP),
('perm_procurement_read', 'procurement:read', 'procurement', 'read', 'View procurement records', CURRENT_TIMESTAMP),
('perm_procurement_approve', 'procurement:approve', 'procurement', 'approve', 'Approve procurement', CURRENT_TIMESTAMP),
('perm_inventory_read', 'inventory:read', 'inventory', 'read', 'View inventory', CURRENT_TIMESTAMP),
('perm_inventory_update', 'inventory:update', 'inventory', 'update', 'Update inventory', CURRENT_TIMESTAMP),
('perm_reporting_read', 'reporting:read', 'reporting', 'read', 'View reports', CURRENT_TIMESTAMP),
('perm_reporting_create', 'reporting:create', 'reporting', 'create', 'Create reports', CURRENT_TIMESTAMP),
('perm_audit_logs_read', 'audit_logs:read', 'audit_logs', 'read', 'View audit logs', CURRENT_TIMESTAMP);
