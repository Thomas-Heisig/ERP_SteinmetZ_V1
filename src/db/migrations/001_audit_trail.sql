-- Migration: core schema, audit_trail, idempotency, sagas
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'core')
BEGIN
    EXEC('CREATE SCHEMA core');
END
GO

-- Audit Trail (GoBD compliance)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'core.audit_trail') AND type = 'U')
BEGIN
    CREATE TABLE core.audit_trail (
      id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
      entity_type VARCHAR(100) NOT NULL,
      entity_id UNIQUEIDENTIFIER,
      operation VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE, VIEW
      before_state NVARCHAR(MAX),
      after_state NVARCHAR(MAX),
      context NVARCHAR(MAX), -- user, session, request-id, ip
      compliance_tags NVARCHAR(MAX),
      created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_core_audit_entity')
BEGIN
    CREATE INDEX idx_core_audit_entity ON core.audit_trail(entity_type, entity_id);
END
GO

-- Idempotency store
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'core.idempotency') AND type = 'U')
BEGIN
    CREATE TABLE core.idempotency (
      request_id VARCHAR(255) PRIMARY KEY,
      operation_hash VARCHAR(255) NOT NULL,
      result NVARCHAR(MAX),
      completed_at DATETIMEOFFSET,
      expires_at DATETIMEOFFSET
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_core_idempotency_expires')
BEGIN
    CREATE INDEX idx_core_idempotency_expires ON core.idempotency (expires_at);
END
GO

-- Saga orchestration store
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'core.sagas') AND type = 'U')
BEGIN
    CREATE TABLE core.sagas (
      saga_id UNIQUEIDENTIFIER PRIMARY KEY,
      process_id VARCHAR(255) NOT NULL,
      state VARCHAR(50) NOT NULL,
      data NVARCHAR(MAX),
      current_step INT,
      created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
      updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_core_sagas_state')
BEGIN
    CREATE INDEX idx_core_sagas_state ON core.sagas(state);
END