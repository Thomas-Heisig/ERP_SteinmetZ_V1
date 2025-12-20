-- SPDX-License-Identifier: MIT
-- Migration: Document Management System Tables
-- Description: Erstellt alle Tabellen für das DMS (Dokumente, Versionen, Metadaten, Tags, OCR, Workflows, Signaturen, Retention Policies, Audit Log)
-- Database: SQLite
-- Created: 2025-12-20

-- =============================================================================
-- DOKUMENTE HAUPTTABELLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'invoice', 'contract', 'employee_document', 
    'report', 'correspondence', 'other'
  )),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  checksum TEXT NOT NULL,
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  uploaded_by TEXT,
  current_version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'archived', 'deleted', 'in_review'
  )),
  retention_years INTEGER DEFAULT 10,
  retention_expires_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_retention_expires ON documents(retention_expires_at);

-- =============================================================================
-- DOKUMENTEN-VERSIONEN
-- =============================================================================

CREATE TABLE IF NOT EXISTS document_versions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  document_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  checksum TEXT NOT NULL,
  uploaded_by TEXT,
  changes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  UNIQUE(document_id, version)
);

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);

-- =============================================================================
-- METADATEN (JSON)
-- =============================================================================

CREATE TABLE IF NOT EXISTS document_metadata (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  document_id TEXT NOT NULL,
  metadata TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_document_metadata_document_id ON document_metadata(document_id);

-- =============================================================================
-- TAGS
-- =============================================================================

CREATE TABLE IF NOT EXISTS document_tags (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  document_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  source TEXT DEFAULT 'manual' CHECK (source IN (
    'manual', 'ai_generated', 'ocr_extracted'
  )),
  confidence REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  UNIQUE(document_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_document_tags_document_id ON document_tags(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tags_tag ON document_tags(tag);

-- =============================================================================
-- OCR DATEN
-- =============================================================================

CREATE TABLE IF NOT EXISTS document_ocr (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  document_id TEXT NOT NULL UNIQUE,
  extracted_text TEXT,
  language TEXT,
  confidence REAL,
  ocr_provider TEXT,
  processed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  processing_time_ms INTEGER,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_document_ocr_document_id ON document_ocr(document_id);

-- =============================================================================
-- WORKFLOWS
-- =============================================================================

CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  document_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('approval', 'review', 'signature')),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'approved', 'rejected', 'cancelled'
  )),
  created_by TEXT,
  deadline TEXT,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_workflows_document_id ON workflows(document_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by);

-- =============================================================================
-- WORKFLOW-SCHRITTE
-- =============================================================================

CREATE TABLE IF NOT EXISTS workflow_steps (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workflow_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  approver_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'skipped'
  )),
  comment TEXT,
  actioned_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES users(id),
  UNIQUE(workflow_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow_id ON workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_approver_id ON workflow_steps(approver_id);

-- =============================================================================
-- E-SIGNATUREN
-- =============================================================================

CREATE TABLE IF NOT EXISTS document_signatures (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  document_id TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'signed', 'declined', 'expired'
  )),
  provider TEXT,
  provider_envelope_id TEXT,
  signed_at TEXT,
  ip_address TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_document_signatures_document_id ON document_signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_signer_email ON document_signatures(signer_email);
CREATE INDEX IF NOT EXISTS idx_document_signatures_status ON document_signatures(status);

-- =============================================================================
-- AUFBEWAHRUNGSRICHTLINIEN
-- =============================================================================

CREATE TABLE IF NOT EXISTS retention_policies (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  category TEXT NOT NULL UNIQUE,
  retention_years INTEGER NOT NULL,
  description TEXT,
  legal_basis TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- AUDIT-TRAIL
-- =============================================================================

CREATE TABLE IF NOT EXISTS document_audit_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  document_id TEXT,
  action TEXT NOT NULL,
  user_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  changes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_document_audit_log_document_id ON document_audit_log(document_id);
CREATE INDEX IF NOT EXISTS idx_document_audit_log_user_id ON document_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_document_audit_log_action ON document_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_document_audit_log_created_at ON document_audit_log(created_at DESC);
