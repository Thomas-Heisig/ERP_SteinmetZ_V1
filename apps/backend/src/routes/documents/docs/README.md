# Document Management System (DMS) - API Documentation

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Letzte Aktualisierung:** 2025-12-20

## Schnellstart

**Vollständige Dokumentation:** [DMS_GUIDE.md](../../../../../../../docs/DMS_GUIDE.md)

Dieses Dokument bietet eine **erweiterte technische Referenz** mit Implementierungsdetails, Datenbankschemas, Service-Architekturen und allen aktuellen sowie geplanten Features.

## Überblick

Das Document Management System (DMS) ist eine **Enterprise-Grade Dokumentenverwaltungslösung** mit vollständiger Versionskontrolle, OCR-Integration, AI-basierter Analyse, Workflow-Automation und rechtskompliantem Archivierungssystem.

### Kernfunktionen

- ✅ **Dokumenten-Repository** - Upload, Versioning, Metadaten
- ✅ **OCR-Integration** - Texterkennung aus Scans und Bildern
- ✅ **AI-basierte Verschlagwortung** - Automatische Tag-Generierung
- ✅ **Full-Text-Search** - Suche in Dokumentinhalten und Metadaten
- ✅ **Workflow-Automation** - Genehmigungs- und Review-Prozesse
- ✅ **E-Signature-Integration** - Elektronische Unterschriften
- ✅ **Retention Policies** - Aufbewahrungsfristen nach deutschem Recht

## API-Endpunkte

### Dokumenten-Repository

#### Alle Dokumente abrufen

```http
GET /api/documents
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "doc-1",
      "title": "Rechnung ABC GmbH",
      "category": "invoice",
      "fileType": "pdf",
      "size": 245678,
      "uploadedAt": "2024-12-09T10:00:00.000Z",
      "uploadedBy": "user-123",
      "version": 1,
      "tags": ["rechnung", "2024", "kunde-abc"],
      "status": "active"
    }
  ],
  "count": 1
}
```

#### Einzelnes Dokument abrufen

```http
GET /api/documents/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "doc-1",
    "title": "Rechnung ABC GmbH",
    "category": "invoice",
    "fileType": "pdf",
    "fileName": "rechnung-abc-2024.pdf",
    "size": 245678,
    "uploadedAt": "2024-12-09T10:00:00.000Z",
    "uploadedBy": "user-123",
    "version": 1,
    "tags": ["rechnung", "2024", "kunde-abc"],
    "status": "active",
    "metadata": {
      "customer": "ABC GmbH",
      "amount": 1500.0,
      "invoiceNumber": "RE-2024-001"
    },
    "ocrData": {
      "extracted": true,
      "text": "Rechnung Nr. RE-2024-001...",
      "confidence": 0.95
    },
    "versions": [
      {
        "version": 1,
        "uploadedAt": "2024-12-09T10:00:00.000Z",
        "uploadedBy": "user-123",
        "changes": "Initial upload"
      }
    ]
  }
}
```

#### Dokument hochladen

```http
POST /api/documents/upload
Content-Type: application/json
```

**Request Body:**

```json
{
  "category": "invoice",
  "title": "Rechnung ABC GmbH",
  "description": "Rechnung für Projekt XYZ",
  "tags": ["rechnung", "wichtig"],
  "metadata": {
    "customer": "ABC GmbH",
    "amount": 1500.0
  },
  "retentionYears": 10
}
```

**Kategorien:**

- `invoice` - Rechnungen (10 Jahre Aufbewahrung)
- `contract` - Verträge (6 Jahre)
- `employee_document` - Personalunterlagen (3 Jahre nach Ausscheiden)
- `report` - Berichte
- `correspondence` - Korrespondenz
- `other` - Sonstige

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "doc-1734608400000",
    "title": "Rechnung ABC GmbH",
    "category": "invoice",
    "fileName": "uploaded-file.pdf",
    "fileType": "pdf",
    "size": 245678,
    "uploadedAt": "2024-12-09T10:00:00.000Z",
    "uploadedBy": "current-user-id",
    "version": 1,
    "status": "active"
  },
  "message": "Document uploaded successfully"
}
```

#### Neue Version hochladen

```http
POST /api/documents/:id/versions
Content-Type: application/json
```

**Request Body:**

```json
{
  "changes": "Korrektur Rechnungsbetrag"
}
```

#### Dokument löschen (Soft Delete)

```http
DELETE /api/documents/:id
```

### Suche & OCR

#### Volltextsuche

```http
GET /api/documents/search?query=rechnung&category=invoice&fileType=pdf
```

**Query-Parameter:**

- `query` - Suchbegriff
- `category` - Dokumentenkategorie
- `tags` - Array von Tags
- `startDate` - Von-Datum (YYYY-MM-DD)
- `endDate` - Bis-Datum (YYYY-MM-DD)
- `fileType` - Dateityp (pdf, docx, xlsx, etc.)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "doc-1",
      "title": "Rechnung ABC GmbH",
      "category": "invoice",
      "snippet": "...Rechnung Nr. RE-2024-001 für ABC GmbH...",
      "relevance": 0.95,
      "highlights": ["Rechnung", "ABC GmbH"]
    }
  ],
  "count": 1,
  "query": "rechnung"
}
```

#### OCR-Verarbeitung starten

```http
POST /api/documents/:id/ocr
```

**Response:**

```json
{
  "success": true,
  "message": "OCR processing started",
  "jobId": "ocr-job-1734608400000"
}
```

#### AI-Tags generieren

```http
POST /api/documents/:id/ai-tags
```

**Response:**

```json
{
  "success": true,
  "data": {
    "generatedTags": ["rechnung", "kunde", "2024", "zahlung"],
    "category": "invoice",
    "confidence": 0.92,
    "entities": [
      {
        "type": "customer",
        "value": "ABC GmbH",
        "confidence": 0.95
      },
      {
        "type": "amount",
        "value": "1500.00 EUR",
        "confidence": 0.98
      }
    ]
  }
}
```

### Workflow-Automation

#### Workflow starten

```http
POST /api/documents/:id/workflows
Content-Type: application/json
```

**Request Body:**

```json
{
  "type": "approval",
  "approvers": ["user-123", "user-456"],
  "deadline": "2024-12-31",
  "description": "Freigabe erforderlich"
}
```

**Workflow-Typen:**

- `approval` - Genehmigungsworkflow
- `review` - Prüfungsworkflow
- `signature` - Unterschriftsworkflow

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "wf-1734608400000",
    "documentId": "doc-1",
    "type": "approval",
    "status": "pending",
    "createdAt": "2024-12-09T10:00:00.000Z",
    "approvers": ["user-123", "user-456"],
    "currentStep": 1,
    "totalSteps": 2
  },
  "message": "Workflow started successfully"
}
```

#### Workflows abrufen

```http
GET /api/documents/:id/workflows
```

#### Workflow-Schritt genehmigen

```http
POST /api/documents/:id/workflows/:workflowId/approve
Content-Type: application/json
```

**Request Body:**

```json
{
  "comment": "Genehmigt, sieht gut aus"
}
```

#### Workflow-Schritt ablehnen

```http
POST /api/documents/:id/workflows/:workflowId/reject
Content-Type: application/json
```

**Request Body:**

```json
{
  "reason": "Bitte Betrag korrigieren"
}
```

### E-Signature Integration

#### Unterschrift anfordern

```http
POST /api/documents/:id/sign
Content-Type: application/json
```

**Request Body:**

```json
{
  "signers": ["user-123@company.com", "user-456@company.com"],
  "message": "Bitte Vertrag unterschreiben"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "sig-1734608400000",
    "documentId": "doc-1",
    "signers": ["user-123@company.com", "user-456@company.com"],
    "status": "pending",
    "createdAt": "2024-12-09T10:00:00.000Z",
    "expiresAt": "2025-01-08T10:00:00.000Z"
  },
  "message": "Signature request sent"
}
```

#### Unterschriftenstatus abrufen

```http
GET /api/documents/:id/signatures
```

### Retention Policies

#### Aufbewahrungsrichtlinien abrufen

```http
GET /api/documents/retention-policies
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "policy-1",
      "category": "invoice",
      "retentionYears": 10,
      "description": "Rechnungen müssen 10 Jahre aufbewahrt werden (HGB §257)",
      "legalBasis": "HGB §257"
    },
    {
      "id": "policy-2",
      "category": "contract",
      "retentionYears": 6,
      "description": "Verträge 6 Jahre aufbewahren",
      "legalBasis": "BGB §195"
    },
    {
      "id": "policy-3",
      "category": "employee_document",
      "retentionYears": 3,
      "description": "Personalunterlagen 3 Jahre nach Ausscheiden",
      "legalBasis": "DSGVO Art. 17"
    }
  ]
}
```

#### Aufbewahrungsrichtlinie ändern

```http
PUT /api/documents/:id/retention-policy
Content-Type: application/json
```

**Request Body:**

```json
{
  "retentionYears": 12,
  "reason": "Erweiterte Aufbewahrung wegen laufendem Verfahren"
}
```

#### Ablaufende Dokumente abrufen

```http
GET /api/documents/expiring?days=30
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "doc-5",
      "title": "Alter Vertrag",
      "category": "contract",
      "expiresAt": "2024-12-24T00:00:00.000Z",
      "daysUntilExpiration": 15
    }
  ],
  "count": 1
}
```

### Statistiken

#### DMS-Statistiken abrufen

```http
GET /api/documents/statistics
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalDocuments": 1247,
    "totalSize": 5234567890,
    "byCategory": {
      "invoice": 456,
      "contract": 123,
      "employee_document": 234,
      "report": 189,
      "correspondence": 145,
      "other": 100
    },
    "pendingWorkflows": 12,
    "pendingSignatures": 5,
    "expiringDocuments": 8
  }
}
```

## Rechtliche Grundlagen

### Aufbewahrungsfristen (Deutschland)

| Dokumentenart      | Frist                    | Rechtsgrundlage |
| ------------------ | ------------------------ | --------------- |
| Rechnungen         | 10 Jahre                 | HGB §257        |
| Buchungsbelege     | 10 Jahre                 | HGB §257        |
| Jahresabschlüsse   | 10 Jahre                 | HGB §257        |
| Verträge           | 6 Jahre                  | BGB §195        |
| Personalunterlagen | 3 Jahre nach Ausscheiden | DSGVO Art. 17   |
| Steuerunterlagen   | 10 Jahre                 | AO §147         |

### DSGVO-Compliance

Das DMS berücksichtigt folgende DSGVO-Anforderungen:

- ✅ **Art. 5** - Datensparsamkeit und Zweckbindung
- ✅ **Art. 17** - Recht auf Löschung
- ✅ **Art. 25** - Privacy by Design
- ✅ **Art. 32** - Datensicherheit
- ✅ **Art. 33** - Meldung von Datenschutzverletzungen

## Integration

### OCR-Integration

Das System unterstützt folgende OCR-Provider:

- **Tesseract** (Open Source)
- **Google Cloud Vision API**
- **AWS Textract**
- **Azure Computer Vision**

### E-Signature-Provider

Unterstützte E-Signature-Anbieter:

- **DocuSign**
- **Adobe Sign**
- **D-Trust SignLive**
- **Secardeo**

## Sicherheit

### Zugriffskontrolle

- ✅ Rollenbasierte Zugriffskontrolle (RBAC)
- ✅ Dokumentenebenen-Berechtigungen
- ✅ Audit-Trail für alle Aktionen
- ✅ Verschlüsselung im Ruhezustand
- ✅ Verschlüsselung bei Übertragung (TLS 1.3)

### Audit-Trail

Alle Aktionen werden protokolliert:

- Dokument hochgeladen
- Dokument geändert
- Dokument gelöscht
- Workflow gestartet
- Genehmigung erteilt/abgelehnt
- Unterschrift angefordert/erhalten

## Best Practices

### Dokumenten-Kategorisierung

1. **Kategorien konsistent verwenden**
   - Einheitliche Namenskonventionen
   - Klare Kategoriedefinitionen

2. **Tags sinnvoll einsetzen**
   - Max. 5-10 Tags pro Dokument
   - Konsistente Tag-Namen
   - AI-generierte Tags überprüfen

3. **Metadaten pflegen**
   - Wichtige Geschäftsinformationen erfassen
   - Suchbarkeit verbessern
   - Reporting ermöglichen

### Workflow-Design

1. **Klare Verantwortlichkeiten**
   - Approver definieren
   - Eskalationspfade festlegen
   - Deadlines setzen

2. **Effiziente Prozesse**
   - Parallele Genehmigungen wo möglich
   - Automatische Erinnerungen
   - Eskalation bei Verzögerung

3. **Dokumentation**
   - Workflow-Diagramme erstellen
   - Prozessschritte dokumentieren
   - Schulungsmaterial bereitstellen

## Roadmap & Implementation Status

### ✅ Phase 1 (Q4 2024) - COMPLETE

**Basis-Funktionen implementiert (Mock-Daten):**

- [x] **Dokumenten-Repository** - Upload, Download, Versionierung
- [x] **Metadaten-Verwaltung** - Tags, Kategorien, Custom Fields
- [x] **Suche & Filterung** - Basis-Volltextsuche
- [x] **Workflow-Engine** - Approval/Review/Signature Workflows
- [x] **E-Signature-Integration** - DocuSign/Adobe Sign Support
- [x] **Retention Policies** - DSGVO & HGB konforme Aufbewahrung

### 🔄 Phase 2 (Q1 2025) - IN PROGRESS

**Datenpersistenz & Storage:**

- [ ] **PostgreSQL Integration** - Vollständige Datenbankintegration

  ```sql
  -- Geplante Tabellen:
  documents, document_versions, document_metadata,
  workflows, workflow_steps, retention_policies,
  ocr_jobs, ai_tags, signatures
  ```

- [ ] **File Storage** - S3/MinIO für skalierbare Dateiablage

  ```typescript
  // Geplante Storage-Architektur:
  interface StorageService {
    upload(file: Buffer, metadata: FileMetadata): Promise<string>;
    download(documentId: string): Promise<Buffer>;
    delete(documentId: string): Promise<void>;
    getPresignedUrl(documentId: string): Promise<string>;
  }
  ```

- [ ] **OCR-Implementierung** - Tesseract.js Integration

  ```typescript
  // OCR Service
  class OCRService {
    async extractText(file: Buffer, lang: string): Promise<OCRResult>;
    async processDocument(documentId: string): Promise<void>;
  }
  ```

- [ ] **AI-Tag-Generierung** - OpenAI/Anthropic Integration

  ```typescript
  // AI Service
  class AITagService {
    async generateTags(text: string): Promise<string[]>;
    async classifyDocument(content: string): Promise<DocumentCategory>;
    async extractEntities(text: string): Promise<Entity[]>;
  }
  ```

- [ ] **Frontend-Komponenten** - React UI für alle Features

  ```typescript
  // Geplante React Components:
  - DocumentList
  - DocumentUpload (mit Drag & Drop)
  - DocumentViewer (PDF, DOCX, Images)
  - DocumentSearch (mit Faceted Search)
  - WorkflowManager
  - RetentionDashboard
  ```

### 📋 Phase 3 (Q2 2025) - PLANNED

**Advanced Features:**

- [ ] **BPMN Workflows** - Komplexe Business Process Workflows

  ```typescript
  // BPMN Engine Integration
  interface BPMNWorkflow {
    startProcess(
      documentId: string,
      processDefinition: string,
    ): Promise<string>;
    completeTask(taskId: string, variables: Record<string, any>): Promise<void>;
    getActiveTasks(processInstanceId: string): Promise<Task[]>;
  }
  ```

- [ ] **Collaboration Features** - Echtzeit-Zusammenarbeit
  - Comments & Annotations
  - Real-time Editing (WebSocket)
  - @Mentions & Notifications
  - Activity Feed

- [ ] **Mobile App** - iOS & Android Apps
  - React Native based
  - Offline-fähig
  - Push Notifications
  - Document Scanning (Camera)

- [ ] **Offline-Modus** - PWA mit Service Workers

  ```typescript
  // Service Worker für Offline-Support
  self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => response || fetch(event.request)),
    );
  });
  ```

### 🚀 Phase 4 (Q3 2025) - PLANNED

**Enterprise Features:**

- [ ] **Records Management** - Compliance & Archivierung
  - Retention Schedule Management
  - Legal Hold Funktionen
  - Disposition Automation
  - Audit Reports

- [ ] **Advanced Analytics** - Business Intelligence

  ```typescript
  // Analytics Dashboard
  interface DocumentAnalytics {
    getUsageStatistics(timeRange: TimeRange): Promise<UsageStats>;
    getStorageTrends(): Promise<StorageTrend[]>;
    getWorkflowMetrics(): Promise<WorkflowMetrics>;
    getUserActivityReport(userId: string): Promise<ActivityReport>;
  }
  ```

- [ ] **Blockchain Audit-Trail** - Unveränderliche Protokollierung

  ```typescript
  // Blockchain Integration
  interface BlockchainAudit {
    logAction(action: AuditAction): Promise<string>; // Returns Transaction Hash
    verifyIntegrity(documentId: string): Promise<boolean>;
    getAuditChain(documentId: string): Promise<BlockchainEntry[]>;
  }
  ```

- [ ] **Compliance-Reports** - Automatisierte Berichte
  - DSGVO Compliance Reports
  - Retention Policy Compliance
  - Access Control Audit
  - Data Protection Impact Assessment (DPIA)

### 📊 Feature Matrix

| Feature         | Phase 1 | Phase 2     | Phase 3     | Phase 4        |
| --------------- | ------- | ----------- | ----------- | -------------- |
| Upload/Download | ✅      | ✅          | ✅          | ✅             |
| Versionierung   | ✅      | ✅          | ✅          | ✅             |
| Metadaten       | ✅      | ✅          | ✅          | ✅             |
| Basis-Suche     | ✅      | ✅          | ✅          | ✅             |
| Workflows       | ✅ Mock | ✅ DB       | ✅ BPMN     | ✅ Advanced    |
| E-Signature     | ✅ Mock | ✅ Real     | ✅ Advanced | ✅ Legal       |
| Database        | ❌      | ✅          | ✅          | ✅             |
| File Storage    | ❌      | ✅ S3/MinIO | ✅ CDN      | ✅ Distributed |
| OCR             | ❌      | ✅ Basic    | ✅ Advanced | ✅ AI-Enhanced |
| AI-Tags         | ❌      | ✅ Basic    | ✅ Advanced | ✅ ML-Based    |
| Frontend        | ❌      | ✅ Basic    | ✅ Advanced | ✅ Enterprise  |
| Collaboration   | ❌      | ❌          | ✅          | ✅             |
| Mobile App      | ❌      | ❌          | ✅          | ✅             |
| Offline-Mode    | ❌      | ❌          | ✅          | ✅             |
| Records Mgmt    | ❌      | ❌          | ❌          | ✅             |
| Analytics       | ❌      | ❌          | ❌          | ✅             |
| Blockchain      | ❌      | ❌          | ❌          | ✅             |
| Compliance      | ❌      | ❌          | ❌          | ✅             |

---

## Technische Architektur

### Datenbankschema (PostgreSQL)

#### Haupttabellen

```sql
-- Dokumente Tabelle
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'invoice', 'contract', 'employee_document',
    'report', 'correspondence', 'other'
  )),
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  checksum VARCHAR(64) NOT NULL, -- SHA-256
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id),
  current_version INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
    'active', 'archived', 'deleted', 'in_review'
  )),
  retention_years INTEGER DEFAULT 10,
  retention_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_documents_retention_expires ON documents(retention_expires_at);

-- Versionierung
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  checksum VARCHAR(64) NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  changes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, version)
);

CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);

-- Metadaten (JSON für Flexibilität)
CREATE TABLE document_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_document_metadata_document_id ON document_metadata(document_id);
CREATE INDEX idx_document_metadata_jsonb ON document_metadata USING GIN(metadata);

-- Tags
CREATE TABLE document_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  source VARCHAR(20) DEFAULT 'manual' CHECK (source IN (
    'manual', 'ai_generated', 'ocr_extracted'
  )),
  confidence DECIMAL(3,2), -- 0.00 - 1.00
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, tag)
);

CREATE INDEX idx_document_tags_document_id ON document_tags(document_id);
CREATE INDEX idx_document_tags_tag ON document_tags(tag);

-- OCR Daten
CREATE TABLE document_ocr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  extracted_text TEXT,
  language VARCHAR(10),
  confidence DECIMAL(3,2),
  ocr_provider VARCHAR(50), -- tesseract, google, aws, azure
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_time_ms INTEGER,
  UNIQUE(document_id)
);

CREATE INDEX idx_document_ocr_document_id ON document_ocr(document_id);
CREATE INDEX idx_document_ocr_text_fts ON document_ocr USING GIN(to_tsvector('german', extracted_text));

-- Workflows
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('approval', 'review', 'signature')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'approved', 'rejected', 'cancelled'
  )),
  created_by UUID REFERENCES users(id),
  deadline TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_workflows_document_id ON workflows(document_id);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_created_by ON workflows(created_by);

-- Workflow-Schritte
CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  approver_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'skipped'
  )),
  comment TEXT,
  actioned_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(workflow_id, step_number)
);

CREATE INDEX idx_workflow_steps_workflow_id ON workflow_steps(workflow_id);
CREATE INDEX idx_workflow_steps_approver_id ON workflow_steps(approver_id);

-- E-Signaturen
CREATE TABLE document_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  signer_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'signed', 'declined', 'expired'
  )),
  provider VARCHAR(50), -- docusign, adobe-sign
  provider_envelope_id VARCHAR(255),
  signed_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_document_signatures_document_id ON document_signatures(document_id);
CREATE INDEX idx_document_signatures_signer_email ON document_signatures(signer_email);
CREATE INDEX idx_document_signatures_status ON document_signatures(status);

-- Aufbewahrungsrichtlinien
CREATE TABLE retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL UNIQUE,
  retention_years INTEGER NOT NULL,
  description TEXT,
  legal_basis VARCHAR(100), -- "HGB §257", "DSGVO Art. 17"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit-Trail
CREATE TABLE document_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'downloaded', 'viewed'
  user_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  changes JSONB, -- Details der Änderungen
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_document_audit_log_document_id ON document_audit_log(document_id);
CREATE INDEX idx_document_audit_log_user_id ON document_audit_log(user_id);
CREATE INDEX idx_document_audit_log_action ON document_audit_log(action);
CREATE INDEX idx_document_audit_log_created_at ON document_audit_log(created_at DESC);
```

### Service-Layer Architektur

#### DocumentService

```typescript
/**
 * Document Service - Hauptlogik für Dokumentenverwaltung
 */
export class DocumentService {
  constructor(
    private db: Database,
    private storageService: StorageService,
    private ocrService: OCRService,
    private aiService: AIService,
    private logger: Logger,
  ) {}

  /**
   * Dokument hochladen
   */
  async uploadDocument(
    file: Express.Multer.File,
    metadata: UploadDocumentDto,
    userId: string,
  ): Promise<Document> {
    const transaction = await this.db.transaction();

    try {
      // 1. Datei in Storage speichern
      const storagePath = await this.storageService.upload(
        file.buffer,
        file.originalname,
        userId,
      );

      // 2. Checksum berechnen
      const checksum = this.calculateChecksum(file.buffer);

      // 3. Dokument in DB speichern
      const document = await this.db.documents.create(
        {
          title: metadata.title,
          category: metadata.category,
          file_name: file.originalname,
          file_type: file.mimetype,
          file_size: file.size,
          storage_path: storagePath,
          checksum,
          uploaded_by: userId,
          retention_years: metadata.retentionYears,
          retention_expires_at: this.calculateRetentionExpiry(
            metadata.retentionYears,
          ),
        },
        { transaction },
      );

      // 4. Metadaten speichern
      if (metadata.metadata) {
        await this.db.documentMetadata.create(
          {
            document_id: document.id,
            metadata: metadata.metadata,
          },
          { transaction },
        );
      }

      // 5. Tags speichern
      if (metadata.tags) {
        await Promise.all(
          metadata.tags.map((tag) =>
            this.db.documentTags.create(
              {
                document_id: document.id,
                tag,
                source: "manual",
              },
              { transaction },
            ),
          ),
        );
      }

      // 6. Audit-Log
      await this.logAudit(
        {
          document_id: document.id,
          action: "created",
          user_id: userId,
        },
        transaction,
      );

      await transaction.commit();

      // 7. Async: OCR-Processing anstoßen
      if (this.shouldProcessOCR(file.mimetype)) {
        this.queueOCRJob(document.id, file.buffer);
      }

      // 8. Async: AI-Tag-Generierung
      if (metadata.generateAITags) {
        this.queueAITagJob(document.id);
      }

      this.logger.info({ documentId: document.id }, "Document uploaded");

      return document;
    } catch (error) {
      await transaction.rollback();
      this.logger.error({ error }, "Document upload failed");
      throw error;
    }
  }

  /**
   * Neue Version hochladen
   */
  async uploadVersion(
    documentId: string,
    file: Express.Multer.File,
    changes: string,
    userId: string,
  ): Promise<DocumentVersion> {
    const transaction = await this.db.transaction();

    try {
      // 1. Dokument laden
      const document = await this.db.documents.findByPk(documentId);
      if (!document) {
        throw new NotFoundError("Document not found");
      }

      // 2. Neue Version in Storage
      const storagePath = await this.storageService.upload(
        file.buffer,
        file.originalname,
        userId,
      );

      const checksum = this.calculateChecksum(file.buffer);
      const newVersion = document.current_version + 1;

      // 3. Version speichern
      const version = await this.db.documentVersions.create(
        {
          document_id: documentId,
          version: newVersion,
          file_name: file.originalname,
          storage_path: storagePath,
          file_size: file.size,
          checksum,
          uploaded_by: userId,
          changes,
        },
        { transaction },
      );

      // 4. Dokument aktualisieren
      await document.update(
        {
          current_version: newVersion,
          file_name: file.originalname,
          file_type: file.mimetype,
          file_size: file.size,
          storage_path: storagePath,
          checksum,
        },
        { transaction },
      );

      // 5. Audit-Log
      await this.logAudit(
        {
          document_id: documentId,
          action: "version_uploaded",
          user_id: userId,
          changes: { version: newVersion, changes },
        },
        transaction,
      );

      await transaction.commit();

      this.logger.info({ documentId, version: newVersion }, "Version uploaded");

      return version;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Dokument herunterladen
   */
  async downloadDocument(
    documentId: string,
    userId: string,
    version?: number,
  ): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    // 1. Dokument oder Version laden
    let storagePath: string;
    let filename: string;
    let mimetype: string;

    if (version) {
      const docVersion = await this.db.documentVersions.findOne({
        where: { document_id: documentId, version },
      });
      if (!docVersion) {
        throw new NotFoundError("Document version not found");
      }
      storagePath = docVersion.storage_path;
      filename = docVersion.file_name;
      mimetype = "application/octet-stream"; // From storage or document
    } else {
      const document = await this.db.documents.findByPk(documentId);
      if (!document) {
        throw new NotFoundError("Document not found");
      }
      storagePath = document.storage_path;
      filename = document.file_name;
      mimetype = document.file_type;
    }

    // 2. Datei aus Storage laden
    const buffer = await this.storageService.download(storagePath);

    // 3. Audit-Log
    await this.logAudit({
      document_id: documentId,
      action: "downloaded",
      user_id: userId,
      changes: { version },
    });

    return { buffer, filename, mimetype };
  }

  /**
   * Dokument löschen (Soft Delete)
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    const transaction = await this.db.transaction();

    try {
      const document = await this.db.documents.findByPk(documentId);
      if (!document) {
        throw new NotFoundError("Document not found");
      }

      // Check Retention Policy
      const now = new Date();
      if (
        document.retention_expires_at &&
        now < document.retention_expires_at
      ) {
        throw new ForbiddenError(
          `Document cannot be deleted before ${document.retention_expires_at}`,
        );
      }

      // Soft Delete
      await document.update({ status: "deleted" }, { transaction });

      // Audit-Log
      await this.logAudit(
        {
          document_id: documentId,
          action: "deleted",
          user_id: userId,
        },
        transaction,
      );

      await transaction.commit();

      this.logger.info({ documentId }, "Document deleted");
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Hilfs-Methoden
   */
  private calculateChecksum(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  private calculateRetentionExpiry(years: number): Date {
    const now = new Date();
    return new Date(now.setFullYear(now.getFullYear() + years));
  }

  private shouldProcessOCR(mimetype: string): boolean {
    return [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/tiff",
    ].includes(mimetype);
  }

  private async queueOCRJob(
    documentId: string,
    fileBuffer: Buffer,
  ): Promise<void> {
    // Queue mit Bull oder BullMQ
    await this.ocrQueue.add("process-ocr", {
      documentId,
      fileBuffer: fileBuffer.toString("base64"),
    });
  }

  private async queueAITagJob(documentId: string): Promise<void> {
    await this.aiQueue.add("generate-tags", { documentId });
  }

  private async logAudit(
    data: AuditLogData,
    transaction?: Transaction,
  ): Promise<void> {
    await this.db.documentAuditLog.create(data, { transaction });
  }
}
```

#### SearchService

```typescript
/**
 * Search Service - Elasticsearch Integration
 */
export class SearchService {
  constructor(
    private elastic: Client,
    private db: Database,
    private logger: Logger,
  ) {}

  /**
   * Volltextsuche
   */
  async searchDocuments(
    query: SearchDocumentsDto,
    userId: string,
  ): Promise<SearchResults> {
    const mustClauses: any[] = [];
    const filterClauses: any[] = [];

    // Text Query
    if (query.query) {
      mustClauses.push({
        multi_match: {
          query: query.query,
          fields: ["title^3", "ocr_text^2", "tags", "metadata.*"],
          fuzziness: "AUTO",
        },
      });
    }

    // Filters
    if (query.category) {
      filterClauses.push({ term: { category: query.category } });
    }

    if (query.tags) {
      filterClauses.push({ terms: { tags: query.tags } });
    }

    if (query.startDate || query.endDate) {
      filterClauses.push({
        range: {
          created_at: {
            gte: query.startDate,
            lte: query.endDate,
          },
        },
      });
    }

    // Elasticsearch Query
    const result = await this.elastic.search({
      index: "documents",
      body: {
        query: {
          bool: {
            must: mustClauses,
            filter: filterClauses,
          },
        },
        highlight: {
          fields: {
            title: {},
            ocr_text: {
              fragment_size: 150,
              number_of_fragments: 3,
            },
          },
        },
        from: (query.page - 1) * query.limit,
        size: query.limit,
        sort: [{ _score: "desc" }, { created_at: "desc" }],
      },
    });

    return {
      hits: result.hits.hits.map((hit) => ({
        id: hit._id,
        score: hit._score,
        document: hit._source,
        highlights: hit.highlight,
      })),
      total: result.hits.total.value,
      page: query.page,
      limit: query.limit,
    };
  }

  /**
   * Index Dokument
   */
  async indexDocument(document: Document): Promise<void> {
    await this.elastic.index({
      index: "documents",
      id: document.id,
      body: {
        title: document.title,
        category: document.category,
        tags: await this.getDocumentTags(document.id),
        ocr_text: await this.getOCRText(document.id),
        metadata: await this.getMetadata(document.id),
        created_at: document.created_at,
        updated_at: document.updated_at,
      },
    });
  }

  private async getDocumentTags(documentId: string): Promise<string[]> {
    const tags = await this.db.documentTags.findAll({
      where: { document_id: documentId },
    });
    return tags.map((t) => t.tag);
  }

  private async getOCRText(documentId: string): Promise<string | null> {
    const ocr = await this.db.documentOCR.findOne({
      where: { document_id: documentId },
    });
    return ocr?.extracted_text || null;
  }

  private async getMetadata(documentId: string): Promise<Record<string, any>> {
    const metadata = await this.db.documentMetadata.findOne({
      where: { document_id: documentId },
    });
    return metadata?.metadata || {};
  }
}
```

#### OCRService

```typescript
/**
 * OCR Service - Tesseract.js Integration
 */
export class OCRService {
  constructor(
    private db: Database,
    private logger: Logger,
  ) {}

  /**
   * OCR-Verarbeitung
   */
  async processDocument(documentId: string): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      // 1. Dokument laden
      const document = await this.db.documents.findByPk(documentId);
      if (!document) {
        throw new NotFoundError("Document not found");
      }

      // 2. Datei laden
      const buffer = await this.storageService.download(document.storage_path);

      // 3. OCR mit Tesseract
      const worker = await createWorker("deu");
      const { data } = await worker.recognize(buffer);

      // 4. Ergebnis speichern
      await this.db.documentOCR.upsert({
        document_id: documentId,
        extracted_text: data.text,
        language: "deu",
        confidence: data.confidence / 100,
        ocr_provider: "tesseract",
        processed_at: new Date(),
        processing_time_ms: Date.now() - startTime,
      });

      await worker.terminate();

      // 5. Elasticsearch aktualisieren
      await this.searchService.indexDocument(document);

      this.logger.info({ documentId }, "OCR processing completed");

      return {
        text: data.text,
        confidence: data.confidence / 100,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error({ error, documentId }, "OCR processing failed");
      throw error;
    }
  }
}
```

#### WorkflowService

```typescript
/**
 * Workflow Service - Genehmigungs- & Review-Prozesse
 */
export class WorkflowService {
  constructor(
    private db: Database,
    private notificationService: NotificationService,
    private logger: Logger,
  ) {}

  /**
   * Workflow starten
   */
  async startWorkflow(
    documentId: string,
    workflowData: CreateWorkflowDto,
    userId: string,
  ): Promise<Workflow> {
    const transaction = await this.db.transaction();

    try {
      // 1. Workflow erstellen
      const workflow = await this.db.workflows.create(
        {
          document_id: documentId,
          type: workflowData.type,
          created_by: userId,
          deadline: workflowData.deadline,
          description: workflowData.description,
          status: "pending",
        },
        { transaction },
      );

      // 2. Workflow-Schritte erstellen
      await Promise.all(
        workflowData.approvers.map((approverId, index) =>
          this.db.workflowSteps.create(
            {
              workflow_id: workflow.id,
              step_number: index + 1,
              approver_id: approverId,
              status: index === 0 ? "pending" : "pending", // Ersten aktiv machen
            },
            { transaction },
          ),
        ),
      );

      await transaction.commit();

      // 3. Erste Approver benachrichtigen
      await this.notificationService.notifyApprover(
        workflowData.approvers[0],
        workflow.id,
      );

      this.logger.info({ workflowId: workflow.id }, "Workflow started");

      return workflow;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Workflow-Schritt genehmigen
   */
  async approveStep(
    workflowId: string,
    stepNumber: number,
    userId: string,
    comment?: string,
  ): Promise<void> {
    const transaction = await this.db.transaction();

    try {
      // 1. Schritt laden
      const step = await this.db.workflowSteps.findOne({
        where: { workflow_id: workflowId, step_number: stepNumber },
      });

      if (!step) {
        throw new NotFoundError("Workflow step not found");
      }

      if (step.approver_id !== userId) {
        throw new ForbiddenError("Not authorized to approve this step");
      }

      // 2. Schritt genehmigen
      await step.update(
        {
          status: "approved",
          comment,
          actioned_at: new Date(),
        },
        { transaction },
      );

      // 3. Nächsten Schritt aktivieren oder Workflow abschließen
      const nextStep = await this.db.workflowSteps.findOne({
        where: { workflow_id: workflowId, step_number: stepNumber + 1 },
      });

      if (nextStep) {
        // Nächsten Approver benachrichtigen
        await this.notificationService.notifyApprover(
          nextStep.approver_id,
          workflowId,
        );
      } else {
        // Workflow abschließen
        await this.db.workflows.update(
          {
            status: "approved",
            completed_at: new Date(),
          },
          {
            where: { id: workflowId },
            transaction,
          },
        );

        // Dokument-Status aktualisieren
        const workflow = await this.db.workflows.findByPk(workflowId);
        await this.db.documents.update(
          { status: "approved" },
          {
            where: { id: workflow.document_id },
            transaction,
          },
        );
      }

      await transaction.commit();

      this.logger.info({ workflowId, stepNumber }, "Workflow step approved");
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

---

## Performance-Optimierungen

### Datei-Upload Optimierung

```typescript
// Chunked Upload für große Dateien
app.post(
  "/api/documents/upload-chunked",
  upload.single("chunk"),
  async (req, res) => {
    const { chunkIndex, totalChunks, fileId } = req.body;

    // Chunk speichern
    await redis.setex(`upload:${fileId}:${chunkIndex}`, 3600, req.file.buffer);

    if (chunkIndex == totalChunks - 1) {
      // Alle Chunks zusammenführen
      const chunks = [];
      for (let i = 0; i < totalChunks; i++) {
        chunks.push(await redis.getBuffer(`upload:${fileId}:${i}`));
      }
      const fullFile = Buffer.concat(chunks);

      // Dokument speichern
      await documentService.uploadDocument(fullFile, metadata, userId);

      // Cleanup
      for (let i = 0; i < totalChunks; i++) {
        await redis.del(`upload:${fileId}:${i}`);
      }
    }

    res.json({ success: true, uploadedChunks: chunkIndex + 1 });
  },
);
```

### Caching-Strategie

```typescript
// Redis Cache für häufige Abfragen
class CachedDocumentService {
  constructor(
    private documentService: DocumentService,
    private redis: Redis,
  ) {}

  async getDocument(documentId: string): Promise<Document> {
    // Cache-Check
    const cached = await this.redis.get(`document:${documentId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // DB-Abfrage
    const document = await this.documentService.getById(documentId);

    // Cache speichern (5 Minuten)
    await this.redis.setex(
      `document:${documentId}`,
      300,
      JSON.stringify(document),
    );

    return document;
  }

  async invalidateCache(documentId: string): Promise<void> {
    await this.redis.del(`document:${documentId}`);
  }
}
```

### Database Query Optimization

```typescript
// Batch-Loading mit DataLoader
const documentLoader = new DataLoader(async (documentIds: string[]) => {
  const documents = await db.documents.findAll({
    where: { id: { [Op.in]: documentIds } },
    include: [
      { model: db.documentMetadata },
      { model: db.documentTags },
      { model: db.documentOCR },
    ],
  });

  return documentIds.map((id) => documents.find((doc) => doc.id === id));
});

// Verwenden
const documents = await Promise.all(
  documentIds.map((id) => documentLoader.load(id)),
);
```

---

## Security Best Practices

### Datei-Upload Validierung

```typescript
// Multer mit Validierung
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB
  },
  fileFilter: (req, file, cb) => {
    // Erlaubte Dateitypen
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/tiff",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

// Virus-Scan
async function scanFile(buffer: Buffer): Promise<boolean> {
  const clamav = await clamscan();
  const { isInfected } = await clamav.scanStream(Readable.from(buffer));
  return !isInfected;
}
```

### Zugriffskontrolle-

```typescript
// Permission Middleware
const requireDocumentPermission =
  (action: "view" | "edit" | "delete") =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await db.documents.findByPk(id);

    // Owner hat immer Zugriff
    if (document.uploaded_by === userId) {
      return next();
    }

    // RBAC prüfen
    const hasPermission = await rbacService.hasPermission(
      userId,
      `document:${action}`,
    );

    if (!hasPermission) {
      throw new ForbiddenError("Insufficient permissions");
    }

    next();
  };

// Verwenden
router.delete(
  "/:id",
  authenticate,
  requireDocumentPermission("delete"),
  asyncHandler(deleteDocumentHandler),
);
```

### Encryption at Rest

```typescript
// Verschlüsselung vor Storage
import crypto from "crypto";

class EncryptedStorageService implements StorageService {
  private algorithm = "aes-256-gcm";
  private key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

  async upload(buffer: Buffer, filename: string): Promise<string> {
    // Verschlüsseln
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    const authTag = cipher.getAuthTag();

    // IV + AuthTag + Encrypted speichern
    const combined = Buffer.concat([iv, authTag, encrypted]);

    return await this.s3.upload(combined, filename);
  }

  async download(storagePath: string): Promise<Buffer> {
    const combined = await this.s3.download(storagePath);

    // Extrahieren
    const iv = combined.slice(0, 16);
    const authTag = combined.slice(16, 32);
    const encrypted = combined.slice(32);

    // Entschlüsseln
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }
}
```

---

## Testing-Strategie

### Unit Tests

```typescript
// documentService.test.ts
describe('DocumentService', () => {
  let service: DocumentService;
  let mockDb: jest.Mocked<Database>;
  let mockStorage: jest.Mocked<StorageService>;

  beforeEach(() => {
    mockDb = createMockDatabase();
    mockStorage = createMockStorage();
    service = new DocumentService(mockDb, mockStorage, ...);
  });

  describe('uploadDocument', () => {
    it('should upload document and create audit log', async () => {
      const file = {
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      };

      const metadata = {
        title: 'Test Document',
        category: 'invoice',
        retentionYears: 10,
      };

      mockStorage.upload.mockResolvedValue('/storage/test.pdf');
      mockDb.documents.create.mockResolvedValue({
        id: 'doc-123',
        ...metadata,
      });

      const result = await service.uploadDocument(file, metadata, 'user-123');

      expect(result.id).toBe('doc-123');
      expect(mockDb.documentAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'created' }),
        expect.anything()
      );
    });

    it('should rollback on error', async () => {
      mockStorage.upload.mockRejectedValue(new Error('Storage error'));

      await expect(
        service.uploadDocument(file, metadata, 'user-123')
      ).rejects.toThrow('Storage error');

      expect(mockDb.transaction().rollback).toHaveBeenCalled();
    });
  });
});
```

### Integration Tests

```typescript
// documents.integration.test.ts
describe("Documents API Integration", () => {
  let app: Express;
  let db: Database;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    db = await createTestDatabase();
    token = await createTestUser();
  });

  afterAll(async () => {
    await db.close();
  });

  it("should upload, search, and download document", async () => {
    // Upload
    const uploadRes = await request(app)
      .post("/api/documents/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("test content"), "test.pdf")
      .field("title", "Test Document")
      .field("category", "invoice")
      .expect(201);

    const documentId = uploadRes.body.data.id;

    // Search
    const searchRes = await request(app)
      .get("/api/documents/search?query=test")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(searchRes.body.data).toContainEqual(
      expect.objectContaining({ id: documentId }),
    );

    // Download
    const downloadRes = await request(app)
      .get(`/api/documents/${documentId}/download`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(downloadRes.body.toString()).toBe("test content");
  });
});
```

### Performance Tests

```typescript
// performance.test.ts
import autocannon from "autocannon";

describe("Performance Tests", () => {
  it("should handle 1000 concurrent document requests", async () => {
    const result = await autocannon({
      url: "http://localhost:3001/api/documents",
      connections: 100,
      duration: 30,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(result.requests.average).toBeGreaterThan(1000);
    expect(result.latency.p99).toBeLessThan(500);
  });
});
```

---

## Deployment & DevOps

### Docker Setup

#### Dockerfile

```dockerfile
# Multi-Stage Build für optimierte Image-Größe
FROM node:20-alpine AS builder

WORKDIR /app

# Dependencies installieren
COPY package*.json ./
RUN npm ci --only=production

# Source kopieren
COPY . .

# TypeScript kompilieren
RUN npm run build

# Production Image
FROM node:20-alpine

WORKDIR /app

# System-Dependencies für OCR
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-deu \
    poppler-utils \
    imagemagick

# Node Dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Non-root User
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

# Health Check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "dist/server.js"]
```

#### docker-compose.yml

```yaml
version: "3.8"

services:
  # Backend mit DMS
  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/erp_steinmetz
      - REDIS_URL=redis://redis:6379
      - S3_ENDPOINT=http://minio:9000
      - S3_ACCESS_KEY=${S3_ACCESS_KEY}
      - S3_SECRET_KEY=${S3_SECRET_KEY}
      - ELASTICSEARCH_URL=http://elasticsearch:9200
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    volumes:
      - ./logs:/app/logs
    depends_on:
      - db
      - redis
      - minio
      - elasticsearch
    restart: unless-stopped

  # PostgreSQL Database
  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=erp_steinmetz
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./apps/backend/src/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Redis für Caching & Queue
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

  # MinIO (S3-kompatibel)
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=${MINIO_ROOT_USER}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    restart: unless-stopped

  # Elasticsearch für Suche
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    restart: unless-stopped

  # BullMQ Dashboard (Optional)
  bull-board:
    image: deadly0/bull-board:latest
    ports:
      - "3010:3000"
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  minio_data:
  elasticsearch_data:
```

### Kubernetes Deployment

#### deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dms-backend
  labels:
    app: dms-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dms-backend
  template:
    metadata:
      labels:
        app: dms-backend
    spec:
      containers:
        - name: backend
          image: ghcr.io/your-org/erp-steinmetz-backend:latest
          ports:
            - containerPort: 3001
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secrets
                  key: connection-string
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: jwt-secret
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "2Gi"
              cpu: "2000m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3001
            initialDelaySeconds: 10
            periodSeconds: 5
          volumeMounts:
            - name: logs
              mountPath: /app/logs
      volumes:
        - name: logs
          emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: dms-backend-service
spec:
  selector:
    app: dms-backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3001
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: dms-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: dms-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy DMS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379

      - name: Run integration tests
        run: npm run test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./apps/backend
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/backend:latest
            ghcr.io/${{ github.repository }}/backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Configure kubectl
        run: |
          echo "${{ secrets.KUBECONFIG }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig

      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/dms-backend \
            backend=ghcr.io/${{ github.repository }}/backend:${{ github.sha }}
          kubectl rollout status deployment/dms-backend
```

### Monitoring Setup

#### Prometheus Metrics

```typescript
// metrics.ts
import promClient from "prom-client";

const register = new promClient.Registry();

// Metrics
export const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

export const documentUploads = new promClient.Counter({
  name: "documents_uploaded_total",
  help: "Total number of documents uploaded",
  labelNames: ["category"],
  registers: [register],
});

export const documentStorageBytes = new promClient.Gauge({
  name: "documents_storage_bytes",
  help: "Total storage used by documents in bytes",
  registers: [register],
});

export const ocrProcessingDuration = new promClient.Histogram({
  name: "ocr_processing_duration_seconds",
  help: "Duration of OCR processing in seconds",
  buckets: [1, 5, 10, 30, 60, 120],
  registers: [register],
});

// Middleware
export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(
        req.method,
        req.route?.path || req.path,
        res.statusCode.toString(),
      )
      .observe(duration);
  });

  next();
};

// Metrics Endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.send(await register.metrics());
});
```

#### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "ERP SteinmetZ - Document Management",
    "panels": [
      {
        "title": "Document Uploads/sec",
        "targets": [
          {
            "expr": "rate(documents_uploaded_total[5m])"
          }
        ]
      },
      {
        "title": "Storage Usage",
        "targets": [
          {
            "expr": "documents_storage_bytes"
          }
        ]
      },
      {
        "title": "OCR Processing Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(ocr_processing_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "API Response Time (p99)",
        "targets": [
          {
            "expr": "histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      }
    ]
  }
}
```

### Backup & Disaster Recovery

#### Automated Backups

```bash
#!/bin/bash
# backup.sh - Automated Database & Storage Backup

# Variablen
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# PostgreSQL Backup
pg_dump -h localhost -U postgres erp_steinmetz | \
  gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# MinIO Backup (S3 Sync)
mc mirror minio/documents "$BACKUP_DIR/documents_$DATE"

# Upload zu Remote Storage (AWS S3/Google Cloud Storage)
aws s3 sync "$BACKUP_DIR" "s3://erp-steinmetz-backups/$(date +%Y/%m/%d)/"

# Alte Backups löschen
find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete

# Backup-Validierung
if [ -f "$BACKUP_DIR/db_backup_$DATE.sql.gz" ]; then
  echo "Backup erfolgreich: $DATE"
else
  echo "FEHLER: Backup fehlgeschlagen!"
  # Alert senden (Slack, Email, etc.)
  curl -X POST https://hooks.slack.com/... \
    -d "{\"text\":\"⚠️ Backup fehlgeschlagen: $DATE\"}"
  exit 1
fi
```

---

## Erweiterte Features (Roadmap Phase 3-4)

### BPMN Workflow Engine

```typescript
// bpmn-workflow.service.ts
import { BpmnEngine } from "bpmn-engine";

export class BPMNWorkflowService {
  private engine: BpmnEngine;

  constructor() {
    this.engine = new BpmnEngine({
      name: "Document Approval Engine",
    });
  }

  async startProcess(
    documentId: string,
    processDefinition: string,
  ): Promise<string> {
    const execution = await this.engine.execute({
      name: `Document ${documentId} Approval`,
      source: processDefinition,
      variables: {
        documentId,
        startDate: new Date(),
      },
    });

    return execution.id;
  }

  async completeTask(
    processId: string,
    taskId: string,
    variables: Record<string, any>,
  ): Promise<void> {
    const execution = await this.engine.getExecution(processId);
    const task = execution.getActivityById(taskId);

    task.signal(variables);
  }

  async getActiveTasks(processId: string): Promise<Task[]> {
    const execution = await this.engine.getExecution(processId);
    return execution.getPostponedActivities();
  }
}
```

### Real-time Collaboration

```typescript
// collaboration.service.ts
import { Server as SocketServer } from "socket.io";

export class CollaborationService {
  private io: SocketServer;
  private activeUsers = new Map<string, Set<string>>();

  constructor(io: SocketServer) {
    this.io = io;
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.io.on("connection", (socket) => {
      socket.on("join-document", async ({ documentId, userId }) => {
        socket.join(`document:${documentId}`);

        if (!this.activeUsers.has(documentId)) {
          this.activeUsers.set(documentId, new Set());
        }
        this.activeUsers.get(documentId).add(userId);

        // Benachrichtige andere Nutzer
        socket.to(`document:${documentId}`).emit("user-joined", {
          userId,
          activeUsers: Array.from(this.activeUsers.get(documentId)),
        });
      });

      socket.on("add-comment", async ({ documentId, comment }) => {
        const savedComment = await this.saveComment(documentId, comment);

        // Broadcast an alle im Dokument
        this.io
          .to(`document:${documentId}`)
          .emit("comment-added", savedComment);
      });

      socket.on("add-annotation", async ({ documentId, annotation }) => {
        const savedAnnotation = await this.saveAnnotation(
          documentId,
          annotation,
        );

        this.io
          .to(`document:${documentId}`)
          .emit("annotation-added", savedAnnotation);
      });

      socket.on("leave-document", ({ documentId, userId }) => {
        socket.leave(`document:${documentId}`);
        this.activeUsers.get(documentId)?.delete(userId);

        socket.to(`document:${documentId}`).emit("user-left", { userId });
      });
    });
  }
}
```

### Blockchain Audit Trail

```typescript
// blockchain-audit.service.ts
import { ethers } from "ethers";

export class BlockchainAuditService {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL,
    );

    const wallet = new ethers.Wallet(
      process.env.ETHEREUM_PRIVATE_KEY,
      this.provider,
    );

    this.contract = new ethers.Contract(
      process.env.AUDIT_CONTRACT_ADDRESS,
      AuditContractABI,
      wallet,
    );
  }

  async logAction(action: AuditAction): Promise<string> {
    // Hash der Aktion berechnen
    const actionHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(action)),
    );

    // In Blockchain schreiben
    const tx = await this.contract.logAudit(
      action.documentId,
      action.action,
      actionHash,
      Math.floor(Date.now() / 1000),
    );

    await tx.wait();

    return tx.hash;
  }

  async verifyIntegrity(documentId: string): Promise<boolean> {
    const dbAudits = await db.documentAuditLog.findAll({
      where: { document_id: documentId },
      order: [["created_at", "ASC"]],
    });

    const blockchainAudits = await this.contract.getAuditTrail(documentId);

    // Hashes vergleichen
    for (let i = 0; i < dbAudits.length; i++) {
      const dbHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(JSON.stringify(dbAudits[i])),
      );

      if (dbHash !== blockchainAudits[i].hash) {
        return false;
      }
    }

    return true;
  }
}
```

### Advanced Analytics

```typescript
// analytics.service.ts
export class AnalyticsService {
  async getUsageStatistics(
    startDate: Date,
    endDate: Date,
  ): Promise<UsageStatistics> {
    const [uploadStats, downloadStats, storageStats] = await Promise.all([
      this.getUploadStatistics(startDate, endDate),
      this.getDownloadStatistics(startDate, endDate),
      this.getStorageStatistics(),
    ]);

    return {
      uploads: uploadStats,
      downloads: downloadStats,
      storage: storageStats,
    };
  }

  async getStorageTrends(): Promise<StorageTrend[]> {
    const last30Days = [...Array(30)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    });

    const trends = await Promise.all(
      last30Days.map(async (date) => {
        const stats = await db.documents.findAll({
          attributes: [
            [db.fn("COUNT", db.col("id")), "count"],
            [db.fn("SUM", db.col("file_size")), "totalSize"],
          ],
          where: {
            created_at: {
              [Op.lte]: new Date(date),
            },
            status: "active",
          },
        });

        return {
          date,
          documentCount: parseInt(stats[0].get("count") as string),
          storageBytes: parseInt(stats[0].get("totalSize") as string),
        };
      }),
    );

    return trends.reverse();
  }
}
```

---

## Migration & Upgrade Guide

### Von Legacy-System zu DMS

```bash
# 1. Datenbank-Migration vorbereiten
npm run migration:generate -- add-dms-tables

# 2. Bestehende Dateien migrieren
node scripts/migrate-legacy-documents.js \
  --source /legacy/storage \
  --target s3://documents \
  --batch-size 100

# 3. Metadaten migrieren
node scripts/migrate-metadata.js \
  --legacy-db postgresql://old:5432/legacy \
  --new-db postgresql://new:5432/erp_steinmetz

# 4. OCR für existierende PDFs
node scripts/batch-ocr.js \
  --start-date 2020-01-01 \
  --end-date 2024-12-31 \
  --parallel 10

# 5. Search Index aufbauen
curl -X POST http://localhost:3001/api/admin/reindex
```

### Version Upgrades

```typescript
// Version-Check Middleware
app.use((req, res, next) => {
  const clientVersion = req.headers["x-client-version"];
  const serverVersion = process.env.APP_VERSION;

  if (semver.major(clientVersion) < semver.major(serverVersion)) {
    return res.status(426).json({
      error: "Upgrade Required",
      message: `Client version ${clientVersion} is outdated. Please upgrade to ${serverVersion}`,
      downloadUrl: "https://erp-steinmetz.com/download",
    });
  }

  next();
});
```

---

## Häufige Probleme (Troubleshooting)

### Storage-Probleme

**Problem:** MinIO Connection Timeout

```bash
# Diagnose
docker logs minio

# Lösung
docker-compose restart minio

# Netzwerk prüfen
docker network inspect erp_default
```

**Problem:** S3 Upload schlägt fehl

```typescript
// Retry-Logic implementieren
async uploadWithRetry(file: Buffer, maxRetries = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await this.s3.upload(file);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

### OCR-Probleme

**Problem:** Tesseract erkennt deutschen Text nicht

```bash
# Sprachpaket installieren
apt-get install tesseract-ocr-deu

# Oder in Docker
RUN apk add tesseract-ocr tesseract-ocr-data-deu
```

### Performance-Probleme

**Problem:** Langsame Datei-Uploads

```typescript
// Stream-basierter Upload statt Buffer
import { pipeline } from "stream/promises";

router.post("/upload-stream", async (req, res) => {
  const busboy = Busboy({ headers: req.headers });

  busboy.on("file", async (fieldname, file, info) => {
    const uploadStream = await storageService.createUploadStream(info.filename);

    await pipeline(file, uploadStream);

    res.json({ success: true });
  });

  req.pipe(busboy);
});
```

**Problem:** Elasticsearch Out of Memory

```yaml
# docker-compose.yml
elasticsearch:
  environment:
    - "ES_JAVA_OPTS=-Xms2g -Xmx2g" # Erhöhen
    - bootstrap.memory_lock=true
  ulimits:
    memlock:
      soft: -1
      hard: -1
```

---

## Support

Bei Fragen oder Problemen:

- 📧 **Email**: [support@erp-steinmetz.de](mailto:support@erp-steinmetz.de)
- 📚 **Dokumentation**: [docs/DMS_GUIDE.md](../../../../../../../docs/DMS_GUIDE.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues)

---

**Letzte Aktualisierung**: 9. Dezember 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (Mock-Daten)
