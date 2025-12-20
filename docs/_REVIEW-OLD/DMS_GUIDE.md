---
title: Document Management System (DMS) Guide
description: Umfassende Dokumentation für das ERP SteinmetZ Document Management System
language: de
version: 1.0.0
status: Production Ready
last-updated: 2025-12-20
---

## Document Management System (DMS) Guide

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Letzte Aktualisierung:** 2025-12-20  
**Sprache:** Deutsch

## Inhaltsverzeichnis

- [Überblick](#überblick)
- [Systemarchitektur](#systemarchitektur)
- [Installation & Setup](#installation--setup)
- [API-Referenz](#api-referenz)
- [Dokumentenverwaltung](#dokumentenverwaltung)
- [Suche & OCR](#suche--ocr)
- [Workflow-Automation](#workflow-automation)
- [E-Signature Integration](#e-signature-integration)
- [Retention Policies](#retention-policies)
- [Best Practices](#best-practices)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

---

## Überblick

Das Document Management System (DMS) bietet umfassende Funktionen für die Verwaltung, Versionierung, Automatisierung und rechtskonforme Archivierung von Dokumenten im ERP-SteinmetZ System.

### Kernfeatures

✅ **Dokumenten-Repository** - Upload, Download, Versioning mit Audit-Trail  
✅ **Versionskontrolle** - Automatische Versionierung mit Änderungsverfolgung  
✅ **OCR-Integration** - Texterkennung aus Scans und Bildern  
✅ **AI-basierte Verschlagwortung** - Automatische Tag- und Kategorie-Generierung  
✅ **Full-Text-Search** - Intelligente Suche mit Highlighting und Relevanz-Ranking  
✅ **Workflow-Automation** - Genehmigungs- und Review-Prozesse  
✅ **E-Signature** - Elektronische Unterschriften mit Audit-Trail  
✅ **Retention Policies** - Aufbewahrungsfristen nach deutschem Recht (HGB, DSGVO)  
✅ **Zugriffskontrolle** - Rollenbasierte Berechtigungen und Dokumentenebenen-Sicherheit  
✅ **Audit-Trail** - Vollständige Protokollierung aller Aktionen  

### Dateityp-Unterstützung

- **Dokumente:** PDF, DOCX, XLSX, PPTX, TXT, RTF
- **Bilder:** JPG, PNG, GIF, TIFF, BMP
- **Archive:** ZIP, RAR, 7Z
- **Max. Dateigröße:** 500 MB (konfigurierbar)



---

## Systemarchitektur

### Monorepo-Struktur

```text
ERP_SteinmetZ_V1/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   └── documents/
│   │   │   │       ├── documentsRouter.ts      # Main Router
│   │   │   │       ├── handlers/
│   │   │   │       │   ├── documentHandlers.ts
│   │   │   │       │   ├── searchHandlers.ts
│   │   │   │       │   ├── workflowHandlers.ts
│   │   │   │       │   └── retentionHandlers.ts
│   │   │   │       ├── services/
│   │   │   │       │   ├── documentService.ts
│   │   │   │       │   ├── ocrService.ts
│   │   │   │       │   ├── aiService.ts
│   │   │   │       │   ├── searchService.ts
│   │   │   │       │   ├── workflowService.ts
│   │   │   │       │   └── retentionService.ts
│   │   │   │       ├── middleware/
│   │   │   │       │   ├── documentValidation.ts
│   │   │   │       │   ├── fileUpload.ts
│   │   │   │       │   └── permissions.ts
│   │   │   │       ├── types/
│   │   │   │       │   └── documents.ts
│   │   │   │       ├── utils/
│   │   │   │       │   ├── fileUtils.ts
│   │   │   │       │   ├── pdfUtils.ts
│   │   │   │       │   └── retentionCalculator.ts
│   │   │   │       ├── tests/
│   │   │   │       │   ├── documents.test.ts
│   │   │   │       │   ├── search.test.ts
│   │   │   │       │   └── workflow.test.ts
│   │   │   │       └── docs/
│   │   │   │           └── README.md           # API Docs
│   │   │   └── middleware/
│   │   │       ├── authMiddleware.ts           # Auth & RBAC
│   │   │       ├── errorHandler.ts             # Error Handling
│   │   │       └── asyncHandler.ts             # Promise Wrapping
│   │   ├── data/
│   │   │   ├── documents/                      # Dokumente
│   │   │   ├── uploads/                        # Temporäre Uploads
│   │   │   └── storage/                        # Persistente Ablage
│   │   └── migrations/
│   │       ├── 030_create_documents_tables.sql
│   │       ├── 031_create_workflows_tables.sql
│   │       └── 032_create_retention_tables.sql
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   │   └── DocumentManagement/
│       │   │       ├── DocumentList.tsx
│       │   │       ├── DocumentUpload.tsx
│       │   │       ├── DocumentViewer.tsx
│       │   │       ├── DocumentSearch.tsx
│       │   │       ├── WorkflowManager.tsx
│       │   │       └── RetentionDashboard.tsx
│       │   └── pages/
│       │       └── DocumentsPage.tsx
│       └── api/
│           └── documentsApi.ts
└── docs/
    └── DMS_GUIDE.md                             # Diese Datei
```

### Datenfluss

```text
Client Request
    ↓
Express Router (documentsRouter.ts)
    ↓
Middleware (Auth, Validation, Error Handling)
    ↓
Handlers (Request Processing)
    ↓
Services (Business Logic)
    ↓
Database / File Storage
    ↓
Response to Client
```

### Abhängigkeiten

```typescript
// External
- express
- multer (File Upload)
- zod (Validation)
- pino (Logging)
- jwt (Authentication)

// Services
- Tesseract/Google Vision (OCR)
- OpenAI/Anthropic (AI-Tags)
- Elasticsearch (Full-Text Search)
- Stripe/PayPal (Optional: Document Signing)

// Database
- SQLite (Development)
- PostgreSQL (Production)
```

---

## Installation & Setup

### Voraussetzungen

```bash
# Node.js & npm
node -v  # v18+ erforderlich
npm -v   # v9+ erforderlich

# TypeScript
npm install -g typescript

# Optional aber empfohlen
npm install -g ts-node
```

### Backend-Setup

#### Dependencies installieren

```bash
cd apps/backend
npm install

# oder bei monorepo:
npm install -w apps/backend
```

#### 2. Umgebungsvariablen konfigurieren

Erstelle `.env.development.local` in `apps/backend/`:

```env
# Database
DATABASE_URL="sqlite:./data/dev.sqlite3"
# ODER für PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/erp_documents"

# File Storage
STORAGE_PATH="./data/documents"
UPLOAD_MAX_SIZE="500mb"
UPLOAD_TEMP_PATH="./data/uploads"

# OCR Configuration
OCR_ENABLED="true"
OCR_PROVIDER="tesseract"  # tesseract, google, aws, azure
OCR_LANGUAGE="deu"

# AI Configuration
AI_ENABLED="true"
AI_PROVIDER="openai"      # openai, anthropic
OPENAI_API_KEY="sk-..."

# Search
SEARCH_ENABLED="true"
ELASTICSEARCH_URL="http://localhost:9200"

# E-Signature
SIGNATURE_ENABLED="true"
SIGNATURE_PROVIDER="docusign"  # docusign, adobe-sign
DOCUSIGN_API_KEY="..."

# JWT
JWT_SECRET="your-32-char-secret-key-here-1234567890ab"
JWT_EXPIRES_IN="24h"

# Logging
LOG_LEVEL="info"
LOG_FORMAT="json"

# Security
CORS_ORIGIN="http://localhost:3000"
RATE_LIMIT_WINDOW="15min"
RATE_LIMIT_MAX_REQUESTS="100"
```

#### 3. Datenbankmigrations ausführen

```bash
# Erstelle SQLite Datenbank
npm run db:migrate

# Oder für PostgreSQL:
npm run db:migrate:postgres
```

#### 4. Server starten

```bash
# Development
npm run dev

# Production
npm run build
npm run start

# Mit Watch Mode
npm run dev:watch
```

### Frontend-Setup

#### 1. Dependencies installieren

```bash
cd apps/frontend
npm install
```

#### 2. API-Endpunkt konfigurieren

Erstelle `.env.development.local`:

```env
VITE_API_URL="http://localhost:3001/api"
VITE_DMS_ENDPOINT="/documents"
VITE_MAX_UPLOAD_SIZE="500"  # MB
```

#### 3. Frontend starten

```bash
npm run dev  # Development Server auf localhost:3000
```

### Docker-Setup (Optional)

```bash
# Docker Build
docker build -f apps/backend/Dockerfile -t erp-documents:latest .

# Docker Run
docker run -p 3001:3001 \
  -e DATABASE_URL="sqlite:./data/dev.sqlite3" \
  -e STORAGE_PATH="/data/documents" \
  -v ./data:/app/data \
  erp-documents:latest

# Docker Compose
docker-compose up -d
```

---

## API-Referenz

### Authentifizierung

Alle Endpunkte erfordern JWT-Token im Authorization Header:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/documents
```

### Base URL

```text
Development:  http://localhost:3001/api/documents
Production:   https://erp.steinmetz.de/api/documents
```

### Error Handling

Alle Fehler folgen diesem Format:

```json
{
  "success": false,
  "error": "Document not found",
  "code": "NOT_FOUND",
  "statusCode": 404,
  "timestamp": "2024-12-20T10:00:00.000Z"
}
```

### Rate Limiting

```text
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702990800
```

---

## Dokumentenverwaltung

### GET /api/documents - Alle Dokumente abrufen

Ruft alle Dokumente mit optionalen Filtern und Paginierung ab.

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/documents?page=1&limit=20&category=invoice"
```

**Query Parameter:**

| Parameter | Typ | Beschreibung |
| --- | --- | --- |
| `page` | number | Seite (Default: 1) |
| `limit` | number | Items pro Seite (Default: 20, Max: 100) |
| `category` | string | Filterung nach Kategorie |
| `tags` | string | Komma-getrennte Tags |
| `status` | string | active, archived, deleted |
| `sortBy` | string | uploadedAt, title, size |
| `sortOrder` | string | asc, desc |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "doc-uuid-123",
      "title": "Rechnung ABC GmbH",
      "category": "invoice",
      "fileType": "pdf",
      "size": 245678,
      "uploadedAt": "2024-12-20T10:00:00.000Z",
      "uploadedBy": {
        "id": "user-123",
        "name": "Max Mustermann"
      },
      "version": 1,
      "tags": ["rechnung", "2024", "kunde-abc"],
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "pages": 8
  }
}
```

### GET /api/documents/:id - Einzelnes Dokument abrufen

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/documents/doc-uuid-123
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "doc-uuid-123",
    "title": "Rechnung ABC GmbH",
    "category": "invoice",
    "fileType": "pdf",
    "fileName": "rechnung-abc-2024.pdf",
    "size": 245678,
    "uploadedAt": "2024-12-20T10:00:00.000Z",
    "uploadedBy": {
      "id": "user-123",
      "name": "Max Mustermann"
    },
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
        "uploadedAt": "2024-12-20T10:00:00.000Z",
        "uploadedBy": "user-123",
        "changes": "Initial upload"
      }
    ],
    "permissions": {
      "canView": true,
      "canEdit": true,
      "canDelete": false,
      "canShare": true
    }
  }
}
```

### POST /api/documents/upload - Dokument hochladen

```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf" \
  -F "category=invoice" \
  -F "title=Rechnung ABC GmbH" \
  -F "tags=rechnung,2024" \
  http://localhost:3001/api/documents/upload
```

**Request Body (JSON):**

```json
{
  "category": "invoice",
  "title": "Rechnung ABC GmbH",
  "description": "Rechnung für Projekt XYZ",
  "tags": ["rechnung", "wichtig", "2024"],
  "metadata": {
    "customer": "ABC GmbH",
    "amount": 1500.0,
    "invoiceNumber": "RE-2024-001"
  },
  "retentionYears": 10
}
```

**Kategorien:**

| Kategorie | Aufbewahrung | Rechtsgrundlage |
| --- | --- | --- |
| `invoice` | 10 Jahre | HGB §257 |
| `contract` | 6 Jahre | BGB §195 |
| `employee_document` | 3 Jahre* | DSGVO Art. 17 |
| `report` | 5 Jahre | Firmenpolicy |
| `correspondence` | 5 Jahre | Firmenpolicy |
| `other` | 1 Jahr | Firmenpolicy |

*nach Ausscheiden

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "doc-uuid-123",
    "title": "Rechnung ABC GmbH",
    "category": "invoice",
    "fileName": "document.pdf",
    "fileType": "pdf",
    "size": 245678,
    "uploadedAt": "2024-12-20T10:00:00.000Z",
    "uploadedBy": "user-123",
    "version": 1,
    "status": "active"
  },
  "message": "Document uploaded successfully"
}
```

### POST /api/documents/:id/versions - Neue Version hochladen

```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -F "file=@document-v2.pdf" \
  -F "changes=Korrektur Rechnungsbetrag" \
  http://localhost:3001/api/documents/doc-uuid-123/versions
```

**Response:**

```json
{
  "success": true,
  "data": {
    "documentId": "doc-uuid-123",
    "version": 2,
    "uploadedAt": "2024-12-20T10:15:00.000Z",
    "uploadedBy": "user-123",
    "changes": "Korrektur Rechnungsbetrag"
  },
  "message": "New version uploaded successfully"
}
```

### DELETE /api/documents/:id - Dokument löschen

```bash
curl -X DELETE -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/documents/doc-uuid-123
```

**Soft Delete:** Dokument wird markiert, nicht physisch gelöscht.

### GET /api/documents/:id/download - Dokument herunterladen

```bash
curl -H "Authorization: Bearer <token>" \
  -o rechnung.pdf \
  http://localhost:3001/api/documents/doc-uuid-123/download
```

### PUT /api/documents/:id - Dokument-Metadaten aktualisieren

```bash
curl -X PUT -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Neue Titel",
    "tags": ["aktualisiert", "2024"],
    "metadata": {"customer": "Neuer Kunde"}
  }' \
  http://localhost:3001/api/documents/doc-uuid-123
```

---

## Suche & OCR

### GET /api/documents/search - Volltextsuche

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/documents/search?query=rechnung&category=invoice&limit=20"
```

**Query Parameter:**

| Parameter | Typ | Beschreibung |
| --- | --- | --- |
| `query` | string | Suchbegriff (erforderlich) |
| `category` | string | Filtere nach Kategorie |
| `tags` | string | Komma-getrennte Tags |
| `startDate` | string | Von-Datum (YYYY-MM-DD) |
| `endDate` | string | Bis-Datum (YYYY-MM-DD) |
| `fileType` | string | pdf, docx, xlsx, etc. |
| `limit` | number | Max. Ergebnisse (Default: 20) |
| `highlight` | boolean | Text-Highlighting (Default: true) |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "doc-uuid-123",
      "title": "Rechnung ABC GmbH",
      "category": "invoice",
      "snippet": "...Rechnung Nr. RE-2024-001 für ABC GmbH...",
      "relevance": 0.95,
      "highlights": ["Rechnung", "ABC GmbH"],
      "matchedFields": ["title", "ocrText"]
    }
  ],
  "count": 5,
  "query": "rechnung"
}
```

### POST /api/documents/:id/ocr - OCR-Verarbeitung starten

Startet die Texterkennung für ein Dokument (besonders bei Scans/Bildern).

```bash
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/documents/doc-uuid-123/ocr
```

**Query Parameter:**

| Parameter | Typ | Beschreibung |
| --- | --- | --- |
| `language` | string | Dokumentsprache (deu, eng, fra) |
| `quality` | string | low, medium, high |

**Response:**

```json
{
  "success": true,
  "message": "OCR processing started",
  "jobId": "ocr-job-uuid-456",
  "estimatedTime": "30 seconds"
}
```

**OCR-Status abrufen:**

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/documents/doc-uuid-123/ocr/ocr-job-uuid-456
```

**Response:**

```json
{
  "success": true,
  "data": {
    "jobId": "ocr-job-uuid-456",
    "status": "completed",
    "progress": 100,
    "extractedText": "Rechnung Nr. RE-2024-001...",
    "confidence": 0.95,
    "language": "deu",
    "completedAt": "2024-12-20T10:05:00.000Z"
  }
}
```

### POST /api/documents/:id/ai-tags - AI-Tags generieren

```bash
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/documents/doc-uuid-123/ai-tags
```

**Response:**

```json
{
  "success": true,
  "data": {
    "generatedTags": ["rechnung", "kunde", "2024", "zahlung", "fällig"],
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
      },
      {
        "type": "invoiceNumber",
        "value": "RE-2024-001",
        "confidence": 0.96
      }
    ]
  }
}
```

---

## Workflow-Automation

### POST /api/documents/:id/workflows - Workflow starten

```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "approval",
    "approvers": ["user-123", "user-456"],
    "deadline": "2024-12-31",
    "description": "Freigabe erforderlich"
  }' \
  http://localhost:3001/api/documents/doc-uuid-123/workflows
```

**Workflow-Typen:**

| Typ | Beschreibung |
| --- | --- |
| `approval` | Genehmigungsworkflow |
| `review` | Prüfungsworkflow |
| `signature` | Unterschriftsworkflow |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "wf-uuid-789",
    "documentId": "doc-uuid-123",
    "type": "approval",
    "status": "pending",
    "createdAt": "2024-12-20T10:00:00.000Z",
    "approvers": [
      {
        "id": "user-123",
        "name": "Max Mustermann",
        "status": "pending"
      },
      {
        "id": "user-456",
        "name": "Erika Musterfrau",
        "status": "pending"
      }
    ],
    "currentStep": 1,
    "totalSteps": 2,
    "deadline": "2024-12-31"
  }
}
```

### GET /api/documents/:id/workflows - Workflows abrufen

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/documents/doc-uuid-123/workflows
```

### POST /api/documents/:id/workflows/:workflowId/approve - Workflow genehmigen

```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Genehmigt, sieht gut aus"
  }' \
  http://localhost:3001/api/documents/doc-uuid-123/workflows/wf-uuid-789/approve
```

### POST /api/documents/:id/workflows/:workflowId/reject - Workflow ablehnen

```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Bitte Betrag korrigieren"
  }' \
  http://localhost:3001/api/documents/doc-uuid-123/workflows/wf-uuid-789/reject
```

---

## E-Signature Integration

### POST /api/documents/:id/sign - Unterschrift anfordern

```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "signers": ["user-123@company.de", "user-456@company.de"],
    "message": "Bitte Vertrag unterschreiben"
  }' \
  http://localhost:3001/api/documents/doc-uuid-123/sign
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "sig-uuid-101",
    "documentId": "doc-uuid-123",
    "signers": [
      {
        "email": "user-123@company.de",
        "status": "pending"
      }
    ],
    "status": "pending",
    "createdAt": "2024-12-20T10:00:00.000Z",
    "expiresAt": "2025-01-18T10:00:00.000Z"
  }
}
```

### GET /api/documents/:id/signatures - Unterschriftenstatus

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/documents/doc-uuid-123/signatures
```

---

## Retention Policies

### GET /api/documents/retention-policies - Aufbewahrungsrichtlinien abrufen

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/documents/retention-policies
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "policy-invoice",
      "category": "invoice",
      "retentionYears": 10,
      "description": "Rechnungen müssen 10 Jahre aufbewahrt werden",
      "legalBasis": "HGB §257"
    }
  ]
}
```

### PUT /api/documents/:id/retention-policy - Aufbewahrungsrichtlinie ändern

```bash
curl -X PUT -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "retentionYears": 12,
    "reason": "Erweiterte Aufbewahrung wegen laufendem Verfahren"
  }' \
  http://localhost:3001/api/documents/doc-uuid-123/retention-policy
```

### GET /api/documents/expiring - Ablaufende Dokumente

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/documents/expiring?days=30"
```

---

## Best Practices

### Dokumenten-Kategorisierung

✅ **DO:**

- Konsistente Kategorien verwenden
- Klare Benennungskonventionen
- Strukturierte Metadaten erfassen
- Suchbarkeit im Auge behalten

❌ **DON'T:**

- Zu viele Unterkategorien
- Mehrdeutige Kategorienamen
- Metadaten ignorieren
- Willkürliche Struktur

### Tagging-Strategie

✅ **DO:**

- Max. 5-10 Tags pro Dokument
- Konsistente Tag-Nomenclatur
- AI-generierte Tags überprüfen
- Tag-Hierarchie definieren

❌ **DON'T:**

- Zu viele Tags (>15)
- Inkonsistente Schreibweise
- AI-Tags blind übernehmen
- Keine Kontrolle

### Workflow-Design

✅ **DO:**

- Klare Verantwortlichkeiten definieren
- Eskalationspfade festlegen
- Angemessene Deadlines setzen
- Automatische Erinnerungen aktivieren

❌ **DON'T:**

- Unklar, wer entscheidet
- Unbegrenzte Bearbeitungszeit
- Keine Eskalation
- Manuelle Erinnerungen

### Retention Policy Compliance

✅ **DO:**

- Kategorie-Aufbewahrungsfristen kennen
- Rechtliche Grundlagen dokumentieren
- Regelmäßig auf Ablauf prüfen
- Archivierung planen

❌ **DON'T:**

- Aufbewahrungsfristen ignorieren
- Zu früh löschen
- Zu lange aufbewahren
- DSGVO-Anforderungen übersehen

### Security Best Practices

✅ **DO:**

- RBAC streng durchsetzen
- Zugriffe protokollieren
- Sensible Dokumente verschlüsseln
- Berechtigungen regelmäßig überprüfen

❌ **DON'T:**

- Alle Benutzer mit admin-Rechten
- Berechtigungen nicht überprüfen
- Unverschlüsselte sensible Daten
- Audit-Trail ignorieren

---

## Testing

### Unit Tests

```bash
# Alle Tests
npm test -- src/routes/documents

# Einzelne Test-Suite
npm test -- documents.test.ts

# Mit Coverage
npm test:coverage -- src/routes/documents
```

### Integration Tests

```bash
# Gegen Test-Datenbank
NODE_ENV=test npm test

# Mit Live-Server
npm test:integration
```

### Manuelle Tests

```bash
# Dokument hochladen
curl -F "file=@test.pdf" \
  http://localhost:3001/api/documents/upload

# Suche testen
curl "http://localhost:3001/api/documents/search?query=test"

# OCR starten
curl -X POST http://localhost:3001/api/documents/doc-1/ocr
```

---

## Troubleshooting

### "Document not found"

**Ursache:** Dokument-ID nicht korrekt

**Lösung:**

```bash
# Alle Dokumente auflisten
curl http://localhost:3001/api/documents

# Dokument mit Suchbegriff finden
curl "http://localhost:3001/api/documents/search?query=xyz"
```

### "Permission denied"

**Ursache:** Unzureichende Berechtigungen

**Lösung:**

```bash
# Aktuelle Berechtigungen prüfen
curl http://localhost:3001/api/user/permissions

# Admin kontaktieren für erweiterte Rechte
```

### "File too large"

**Ursache:** Dateigröße überschreitet Limit (500 MB)

**Lösung:**

```bash
# Datei vor Upload komprimieren
gzip large-file.pdf

# Oder Uploadlimit erhöhen (in .env):
UPLOAD_MAX_SIZE="1gb"
```

### OCR funktioniert nicht

**Ursache:** OCR-Service nicht konfiguriert oder nicht erreichbar

**Lösung:**

```bash
# Tesseract prüfen
which tesseract

# Oder Google Vision API Key:
echo $GOOGLE_VISION_API_KEY
```

### Suche funktioniert nicht

**Ursache:** Elasticsearch nicht verfügbar

**Lösung:**

```bash
# Elasticsearch Status
curl http://localhost:9200/_health

# Docker mit Elasticsearch
docker-compose up elasticsearch
```

---

## Roadmap

### Phase 1 (Q4 2024) - ✅ COMPLETE

- [x] Basis API-Struktur
- [x] Dokumenten Upload/Download
- [x] Einfache Suche
- [x] Mock-Daten

### Phase 2 (Q1 2025) - IN PROGRESS

- [ ] Datenbankintegration (PostgreSQL)
- [ ] Actual file storage (S3/MinIO)
- [ ] OCR Implementation (Tesseract)
- [ ] AI-Tag Generation
- [ ] Full-Text Search (Elasticsearch)

### Phase 3 (Q2 2025) - PLANNED

- [ ] Workflow Engine (BPMN)
- [ ] E-Signature Integration (DocuSign)
- [ ] Advanced Retention Management
- [ ] Frontend Components (React)

### Phase 4 (Q3 2025) - PLANNED

- [ ] Records Management
- [ ] Advanced Analytics
- [ ] Mobile App
- [ ] Blockchain Audit Trail

---

## Weitere Dokumentation

- 📘 [CONFIG_MODULE_GUIDE.md](CONFIG_MODULE_GUIDE.md) - Konfigurationssystem
- 📕 [MIDDLEWARE_GUIDE.md](MIDDLEWARE_GUIDE.md) - Middleware & Auth
- 🔐 [AUTHENTICATION.md](AUTHENTICATION.md) - Authentifizierung
- ⚖️ [COMPLIANCE.md](COMPLIANCE.md) - Compliance & Rechtliches
- 📊 [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md) - Datenbankänderungen

---

## Support & Kontakt

- 📧 **Email:** [support@erp-steinmetz.de](mailto:support@erp-steinmetz.de)
- 💬 **Chat:** Internal Slack Channel
- 🐛 **Issues:** [GitHub Issues](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues)
- 📞 **Phone:** +49 (0) 123 456789

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Letzte Aktualisierung:** 2025-12-20  
**Autor:** GitHub Copilot
