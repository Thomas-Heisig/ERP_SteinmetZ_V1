-- SPDX-License-Identifier: MIT
-- Migration: Create Authentication Tables (MS SQL Server)
-- Description: Creates users, sessions, and roles tables for authentication system
-- Database: MS SQL Server
-- Created: 2025-12-17

-- Users table
CREATE TABLE IF NOT EXISTS CREATE TABLE users (
  id NVARCHAR(255) PRIMARY KEY,
  username NVARCHAR(255) UNIQUE NOT NULL,
  email NVARCHAR(255) UNIQUE NOT NULL,
  password_hash NVARCHAR(500) NOT NULL,
  full_name NVARCHAR(255),
  is_active BIT DEFAULT 1,
  is_verified BIT DEFAULT 0,
  failed_login_attempts INT DEFAULT 0,
  locked_until DATETIME,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  last_login_at DATETIME,
  password_changed_at DATETIME DEFAULT GETDATE()
);

-- Roles table
CREATE TABLE IF NOT EXISTS CREATE TABLE roles (
  id NVARCHAR(255) PRIMARY KEY,
  name NVARCHAR(255) UNIQUE NOT NULL,
  description NVARCHAR(MAX),
  permissions NVARCHAR(MAX) NOT NULL,
  is_system BIT DEFAULT 0,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE()
);

-- User roles junction table
CREATE TABLE IF NOT EXISTS CREATE TABLE user_roles (
  user_id NVARCHAR(255) NOT NULL,
  role_id NVARCHAR(255) NOT NULL,
  granted_at DATETIME DEFAULT GETDATE(),
  granted_by NVARCHAR(255),
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Sessions table
CREATE TABLE IF NOT EXISTS CREATE TABLE sessions (
  id NVARCHAR(255) PRIMARY KEY,
  user_id NVARCHAR(255) NOT NULL,
  token NVARCHAR(500) UNIQUE NOT NULL,
  refresh_token NVARCHAR(500) UNIQUE,
  ip_address NVARCHAR(50),
  user_agent NVARCHAR(500),
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT GETDATE(),
  last_activity_at DATETIME DEFAULT GETDATE(),
  is_valid BIT DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS CREATE TABLE password_reset_tokens (
  id NVARCHAR(255) PRIMARY KEY,
  user_id NVARCHAR(255) NOT NULL,
  token NVARCHAR(500) UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME,
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_username' AND object_id = OBJECT_ID('users'))
BEGIN
  CREATE INDEX idx_users_username ON users(username);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_email' AND object_id = OBJECT_ID('users'))
BEGIN
  CREATE INDEX idx_users_email ON users(email);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_is_active' AND object_id = OBJECT_ID('users'))
BEGIN
  CREATE INDEX idx_users_is_active ON users(is_active);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_sessions_user_id' AND object_id = OBJECT_ID('sessions'))
BEGIN
  CREATE INDEX idx_sessions_user_id ON sessions(user_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_sessions_token' AND object_id = OBJECT_ID('sessions'))
BEGIN
  CREATE INDEX idx_sessions_token ON sessions(token);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_sessions_expires_at' AND object_id = OBJECT_ID('sessions'))
BEGIN
  CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_sessions_is_valid' AND object_id = OBJECT_ID('sessions'))
BEGIN
  CREATE INDEX idx_sessions_is_valid ON sessions(is_valid);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_user_roles_user_id' AND object_id = OBJECT_ID('user_roles'))
BEGIN
  CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_user_roles_role_id' AND object_id = OBJECT_ID('user_roles'))
BEGIN
  CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_password_reset_tokens_token' AND object_id = OBJECT_ID('password_reset_tokens'))
BEGIN
  CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_password_reset_tokens_user_id' AND object_id = OBJECT_ID('password_reset_tokens'))
BEGIN
  CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- Insert default roles (using MERGE for idempotency)
IF NOT EXISTS (SELECT * FROM roles WHERE id = 'role_admin')
BEGIN
  INSERT INTO roles (id, name, description, permissions, is_system) 
  VALUES ('role_admin', 'Admin', 'Full system administrator access', '["*"]', 1);

IF NOT EXISTS (SELECT * FROM roles WHERE id = 'role_user')
BEGIN
  INSERT INTO roles (id, name, description, permissions, is_system) 
  VALUES ('role_user', 'User', 'Standard user access', '["dashboard.read", "catalog.read", "ai.use"]', 1);

IF NOT EXISTS (SELECT * FROM roles WHERE id = 'role_viewer')
BEGIN
  INSERT INTO roles (id, name, description, permissions, is_system) 
  VALUES ('role_viewer', 'Viewer', 'Read-only access', '["dashboard.read", "catalog.read"]', 1);

