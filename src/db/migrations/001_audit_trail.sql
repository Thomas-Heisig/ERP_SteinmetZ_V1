-- Migration: core schema, audit_trail, idempotency, sagas
CREATE SCHEMA IF NOT EXISTS core;

-- Audit Trail (GoBD compliance)
CREATE TABLE IF NOT EXISTS core.audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  operation VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE, VIEW
  before_state JSONB,
  after_state JSONB,
  context JSONB, -- user, session, request-id, ip
  compliance_tags VARCHAR[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_core_audit_entity ON core.audit_trail(entity_type, entity_id);

-- Idempotency store
CREATE TABLE IF NOT EXISTS core.idempotency (
  request_id VARCHAR(255) PRIMARY KEY,
  operation_hash VARCHAR(255) NOT NULL,
  result JSONB,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_core_idempotency_expires ON core.idempotency (expires_at);

-- Saga orchestration store
CREATE TABLE IF NOT EXISTS core.sagas (
  saga_id UUID PRIMARY KEY,
  process_id VARCHAR(255) NOT NULL,
  state VARCHAR(50) NOT NULL,
  data JSONB,
  current_step INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_core_sagas_state ON core.sagas(state);