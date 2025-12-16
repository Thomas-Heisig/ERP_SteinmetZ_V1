# Dokumentenverwaltung - API Spezifikation

## Übersicht

Die Dokumentenverwaltungs-API bietet vollständige CRUD-Operationen für Dokumente, einschließlich Upload, Download, Versionierung, Suche und Metadatenverwaltung.

## Base URL

``` text
/api/documents
```

## Authentifizierung

Alle Endpoints erfordern Authentifizierung via JWT-Token im Authorization-Header:

``` text
Authorization: Bearer <token>
```

---

## 1. Dokumente-Verwaltung

### GET /api/documents

Liste aller Dokumente mit Filterung, Suche und Pagination.

**Query-Parameter:**

- `page` (number, optional): Seitennummer (default: 1)
- `pageSize` (number, optional): Anzahl pro Seite (default: 20)
- `search` (string, optional): Suchbegriff (Titel, Beschreibung, Tags, Dateiname)
- `categories` (string[], optional): Komma-getrennte Kategorien
- `status` (string[], optional): Komma-getrennte Status-Werte
- `accessLevel` (string[], optional): Komma-getrennte Zugriffslevel
- `tags` (string[], optional): Komma-getrennte Tags
- `dateFrom` (string, optional): Von-Datum (ISO 8601)
- `dateTo` (string, optional): Bis-Datum (ISO 8601)
- `sortBy` (string, optional): Sortierfeld (default: "uploadedAt")
- `sortDir` (string, optional): Sortierrichtung "asc" | "desc" (default: "desc")

**Response:**

```typescript
{
  success: boolean;
  data: {
    documents: Document[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
```

**Kategorien:**

- `invoice` - Rechnung
- `contract` - Vertrag
- `employee_document` - Personal
- `report` - Bericht
- `correspondence` - Korrespondenz
- `policy` - Richtlinie
- `presentation` - Präsentation
- `other` - Sonstige

**Status:**

- `active` - Aktiv
- `approved` - Genehmigt
- `pending` - Ausstehend
- `archived` - Archiviert
- `draft` - Entwurf
- `rejected` - Abgelehnt

**Zugriffslevel:**

- `public` - Öffentlich
- `internal` - Intern
- `confidential` - Vertraulich
- `restricted` - Eingeschränkt

---

### GET /api/documents/:id

Einzelnes Dokument mit vollständigen Details abrufen.

**Path-Parameter:**

- `id` (string): Dokument-ID

**Response:**

```typescript
{
  success: boolean;
  data: Document;
}
```

**Document Interface:**

```typescript
interface Document {
  id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  fileType: string;
  fileName: string;
  size: number; // Bytes
  uploadedAt: string; // ISO 8601
  uploadedBy: string; // User ID
  uploadedByName: string;
  updatedAt: string; // ISO 8601
  version: number;
  tags: string[];
  status: DocumentStatus;
  accessLevel: DocumentAccessLevel;
  downloadCount: number;
  path: string;
  checksum?: string; // SHA-256
  expiresAt?: string; // ISO 8601
  relatedDocuments?: string[]; // Document IDs
  metadata?: {
    author?: string;
    department?: string;
    projectId?: string;
    customFields?: Record<string, string>;
  };
}
```

---

### POST /api/documents

Neues Dokument hochladen.

**Content-Type:** `multipart/form-data`

**Form-Felder:**

- `file` (File, required): Die hochzuladende Datei
- `title` (string, required): Dokumenttitel
- `description` (string, optional): Beschreibung
- `category` (DocumentCategory, required): Kategorie
- `status` (DocumentStatus, optional): Status (default: "draft")
- `accessLevel` (DocumentAccessLevel, optional): Zugriffslevel (default: "internal")
- `tags` (string[], optional): Tags (JSON array)
- `expiresAt` (string, optional): Ablaufdatum (ISO 8601)
- `metadata` (object, optional): Zusätzliche Metadaten (JSON object)

**Response:**

```typescript
{
  success: boolean;
  data: Document;
  message: string;
}
```

**Validierung:**

- Max. Dateigröße: 100 MB (konfigurierbar)
- Erlaubte Dateitypen: PDF, DOCX, XLSX, PPTX, TXT, MSG, ZIP, PNG, JPG
- Titel: min. 3 Zeichen, max. 200 Zeichen
- Beschreibung: max. 1000 Zeichen

---

### PUT /api/documents/:id

Dokument-Metadaten aktualisieren (nicht die Datei selbst).

**Path-Parameter:**

- `id` (string): Dokument-ID

**Request Body:**

```typescript
{
  title?: string;
  description?: string;
  category?: DocumentCategory;
  status?: DocumentStatus;
  accessLevel?: DocumentAccessLevel;
  tags?: string[];
  expiresAt?: string;
  metadata?: {
    author?: string;
    department?: string;
    projectId?: string;
    customFields?: Record<string, string>;
  };
}
```

**Response:**

```typescript
{
  success: boolean;
  data: Document;
  message: string;
}
```

---

### POST /api/documents/:id/version

Neue Version eines Dokuments hochladen.

**Path-Parameter:**

- `id` (string): Dokument-ID

**Content-Type:** `multipart/form-data`

**Form-Felder:**

- `file` (File, required): Die neue Dateiversion
- `changes` (string, required): Beschreibung der Änderungen

**Response:**

```typescript
{
  success: boolean;
  data: Document; // Aktualisiertes Dokument mit neuer Version
  message: string;
}
```

---

### DELETE /api/documents/:id

Dokument löschen (soft delete).

**Path-Parameter:**

- `id` (string): Dokument-ID

**Query-Parameter:**

- `permanent` (boolean, optional): Permanent löschen (default: false)

**Response:**

```typescript
{
  success: boolean;
  message: string;
}
```

---

## 2. Dokumenten-Download

### GET /api/documents/:id/download

Dokument herunterladen.

**Path-Parameter:**

- `id` (string): Dokument-ID

**Query-Parameter:**

- `version` (number, optional): Spezifische Version (default: aktuelle)

**Response:**

- Content-Type: entsprechend Dateityp
- Content-Disposition: attachment; filename="..."
- Binary-Datei

---

### GET /api/documents/:id/preview

Dokumentvorschau generieren (für PDF, Bilder).

**Path-Parameter:**

- `id` (string): Dokument-ID

**Query-Parameter:**

- `size` (string, optional): "thumbnail" | "small" | "medium" | "large"

**Response:**

- Bild oder PDF-Preview als Binary

---

## 3. Bulk-Operationen

### POST /api/documents/bulk/download

Mehrere Dokumente als ZIP herunterladen.

**Request Body:**

```typescript
{
  documentIds: string[];
  zipName?: string; // Optional: Name der ZIP-Datei
}
```

**Response:**

- Content-Type: application/zip
- ZIP-Datei mit allen Dokumenten

---

### POST /api/documents/bulk/archive

Mehrere Dokumente archivieren.

**Request Body:**

```typescript
{
  documentIds: string[];
}
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    archived: number;
    failed: number;
  };
  message: string;
}
```

---

### POST /api/documents/bulk/approve

Mehrere Dokumente genehmigen.

**Request Body:**

```typescript
{
  documentIds: string[];
  comment?: string;
}
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    approved: number;
    failed: number;
  };
  message: string;
}
```

---

### DELETE /api/documents/bulk/delete

Mehrere Dokumente löschen.

**Request Body:**

```typescript
{
  documentIds: string[];
  permanent?: boolean; // Default: false
}
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    deleted: number;
    failed: number;
  };
  message: string;
}
```

---

### POST /api/documents/bulk/export

Dokumentenliste als Excel/CSV exportieren.

**Request Body:**

```typescript
{
  documentIds?: string[]; // Optional: spezifische Dokumente
  format: "csv" | "xlsx";
  fields?: string[]; // Optional: welche Felder exportieren
}
```

**Response:**

- Content-Type: text/csv oder application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- CSV oder Excel-Datei

---

## 4. Versionshistorie

### GET /api/documents/:id/versions

Alle Versionen eines Dokuments abrufen.

**Path-Parameter:**

- `id` (string): Dokument-ID

**Response:**

```typescript
{
  success: boolean;
  data: {
    versions: DocumentVersion[];
    current: number; // Aktuelle Version
  };
}

interface DocumentVersion {
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName: string;
  changes: string;
  size: number;
  fileType: string;
  checksum: string;
}
```

---

### POST /api/documents/:id/versions/:version/restore

Version als aktuelle Version wiederherstellen.

**Path-Parameter:**

- `id` (string): Dokument-ID
- `version` (number): Versionsnummer

**Response:**

```typescript
{
  success: boolean;
  data: Document;
  message: string;
}
```

---

## 5. Statistiken & Analytics

### GET /api/documents/stats

Dokument-Statistiken abrufen.

**Query-Parameter:**

- `period` (string, optional): "week" | "month" | "quarter" | "year" (default: "month")
- `department` (string, optional): Nach Abteilung filtern

**Response:**

```typescript
{
  success: boolean;
  data: DocumentStats;
}

interface DocumentStats {
  totalDocuments: number;
  totalSize: number; // Bytes
  byCategory: Record<DocumentCategory, number>;
  byStatus: Record<DocumentStatus, number>;
  byAccessLevel: Record<DocumentAccessLevel, number>;
  recentUploads: number; // Letzte 7 Tage
  topDownloads: Array<{
    document: Document;
    downloads: number;
  }>;
  storageUsage: {
    used: number; // Bytes
    limit: number; // Bytes
    percentage: number;
  };
  uploadTrend: Array<{
    date: string;
    count: number;
    size: number;
  }>;
}
```

---

### GET /api/documents/stats/user/:userId

Statistiken für einen bestimmten Benutzer.

**Path-Parameter:**

- `userId` (string): Benutzer-ID

**Response:**

```typescript
{
  success: boolean;
  data: {
    uploadedCount: number;
    uploadedSize: number;
    downloadCount: number;
    recentDocuments: Document[];
  };
}
```

---

## 6. Suche & Tags

### GET /api/documents/search

Erweiterte Dokumentensuche.

**Query-Parameter:**

- `q` (string, required): Suchbegriff
- `fields` (string[], optional): Zu durchsuchende Felder
- `fuzzy` (boolean, optional): Fuzzy-Search aktivieren (default: true)
- `limit` (number, optional): Max. Ergebnisse (default: 50)

**Response:**

```typescript
{
  success: boolean;
  data: {
    results: Array<{
      document: Document;
      score: number; // Relevanz-Score 0-1
      highlights: Record<string, string>; // Hervorgehobene Treffer
    }>;
    total: number;
    took: number; // ms
  };
}
```

---

### GET /api/documents/tags

Alle verfügbaren Tags abrufen.

**Query-Parameter:**

- `search` (string, optional): Tag-Filter
- `limit` (number, optional): Max. Ergebnisse (default: 100)

**Response:**

```typescript
{
  success: boolean;
  data: Array<{
    tag: string;
    count: number; // Anzahl Dokumente mit diesem Tag
  }>;
}
```

---

### POST /api/documents/:id/tags

Tags zu einem Dokument hinzufügen.

**Path-Parameter:**

- `id` (string): Dokument-ID

**Request Body:**

```typescript
{
  tags: string[]; // Tags zum Hinzufügen
}
```

**Response:**

```typescript
{
  success: boolean;
  data: Document;
  message: string;
}
```

---

### DELETE /api/documents/:id/tags

Tags von einem Dokument entfernen.

**Path-Parameter:**

- `id` (string): Dokument-ID

**Request Body:**

```typescript
{
  tags: string[]; // Tags zum Entfernen
}
```

**Response:**

```typescript
{
  success: boolean;
  data: Document;
  message: string;
}
```

---

## 7. Freigabe & Berechtigungen

### POST /api/documents/:id/share

Dokument mit Benutzern/Gruppen teilen.

**Path-Parameter:**

- `id` (string): Dokument-ID

**Request Body:**

```typescript
{
  userIds?: string[]; // Benutzer-IDs
  groupIds?: string[]; // Gruppen-IDs
  permissions: "view" | "edit" | "admin";
  expiresAt?: string; // ISO 8601
  message?: string; // Optional: Nachricht
}
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    shareId: string;
    shareLink?: string; // Optional: Öffentlicher Link
  };
  message: string;
}
```

---

### GET /api/documents/:id/permissions

Berechtigungen für ein Dokument abrufen.

**Path-Parameter:**

- `id` (string): Dokument-ID

**Response:**

```typescript
{
  success: boolean;
  data: {
    owner: {
      userId: string;
      name: string;
    };
    shares: Array<{
      id: string;
      userId?: string;
      userName?: string;
      groupId?: string;
      groupName?: string;
      permission: "view" | "edit" | "admin";
      sharedAt: string;
      expiresAt?: string;
    }>;
  };
}
```

---

### DELETE /api/documents/:id/share/:shareId

Freigabe widerrufen.

**Path-Parameter:**

- `id` (string): Dokument-ID
- `shareId` (string): Freigabe-ID

**Response:**

```typescript
{
  success: boolean;
  message: string;
}
```

---

## 8. Audit Log

### GET /api/documents/:id/audit

Audit-Log für ein Dokument abrufen.

**Path-Parameter:**

- `id` (string): Dokument-ID

**Query-Parameter:**

- `limit` (number, optional): Max. Einträge (default: 50)
- `offset` (number, optional): Offset (default: 0)

**Response:**

```typescript
{
  success: boolean;
  data: {
    logs: Array<{
      id: string;
      action: "created" | "updated" | "downloaded" | "shared" | "deleted" | "version_created";
      userId: string;
      userName: string;
      timestamp: string; // ISO 8601
      details?: Record<string, any>; // Zusätzliche Details
      ipAddress?: string;
      userAgent?: string;
    }>;
    total: number;
  };
}
```

---

## 9. WebSocket Events

### Server-zu-Client Events

```typescript
// Neues Dokument hochgeladen
"documents:document-created"
Data: { document: Document }

// Dokument aktualisiert
"documents:document-updated"
Data: { document: Document, changes: string[] }

// Dokument gelöscht
"documents:document-deleted"
Data: { documentId: string }

// Neue Version erstellt
"documents:version-created"
Data: { document: Document, version: number }

// Status geändert
"documents:status-changed"
Data: { documentId: string, oldStatus: DocumentStatus, newStatus: DocumentStatus }

// Dokument geteilt
"documents:document-shared"
Data: { documentId: string, sharedWith: string[], sharedBy: string }
```

### Client-zu-Server Events

```typescript
// Kategorie abonnieren
"documents:subscribe-category"
Data: { category: DocumentCategory }

// Kategorie deabonnieren
"documents:unsubscribe-category"
Data: { category: DocumentCategory }

// Dokument beobachten
"documents:watch-document"
Data: { documentId: string }

// Dokument nicht mehr beobachten
"documents:unwatch-document"
Data: { documentId: string }
```

---

## Fehler-Codes

| Code | Bedeutung                    | HTTP Status |
| ---- | ---------------------------- | ----------- |
| 1001 | Dokument nicht gefunden      | 404         |
| 1002 | Ungültige Datei              | 400         |
| 1003 | Datei zu groß                | 413         |
| 1004 | Dateityp nicht erlaubt       | 415         |
| 1005 | Keine Berechtigung           | 403         |
| 1006 | Speicherplatz überschritten  | 507         |
| 1007 | Version nicht gefunden       | 404         |
| 1008 | Dokument ist gesperrt        | 423         |
| 1009 | Checksum-Fehler              | 422         |
| 1010 | Dokument abgelaufen          | 410         |

---

## Rate Limiting

- Standard: 100 Requests / Minute
- Upload: 10 Requests / Minute
- Download: 50 Requests / Minute
- Bulk-Operationen: 5 Requests / Minute

---

## Beispiel-Requests

### Dokument hochladen

```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/document.pdf" \
  -F "title=Jahresabschluss 2024" \
  -F "description=Vollständiger Jahresabschluss" \
  -F "category=report" \
  -F "status=draft" \
  -F "accessLevel=confidential" \
  -F 'tags=["Finanzen","2024"]'
```

### Dokumente suchen

```bash
curl -X GET "http://localhost:3000/api/documents?search=Vertrag&categories=contract&status=active&page=1&pageSize=20" \
  -H "Authorization: Bearer <token>"
```

### Dokument herunterladen

```bash
curl -X GET "http://localhost:3000/api/documents/doc-001/download" \
  -H "Authorization: Bearer <token>" \
  -o downloaded-document.pdf
```

### Bulk-Archivierung

```bash
curl -X POST http://localhost:3000/api/documents/bulk/archive \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"documentIds": ["doc-001", "doc-002", "doc-003"]}'
```

---

## Notizen für Backend-Team

1. **Speicherung:**
   - Dateien auf S3 / MinIO / lokales Filesystem
   - Metadaten in PostgreSQL / MongoDB
   - Checksums für Integrität
   - Virus-Scan bei Upload

2. **Sicherheit:**
   - JWT-Authentifizierung
   - Row-Level Security (RLS) für Berechtigungen
   - Verschlüsselung für vertrauliche Dokumente
   - Audit-Logging für alle Aktionen

3. **Performance:**
   - Caching für häufig abgerufene Dokumente
   - CDN für Downloads
   - Background-Jobs für Bulk-Operationen
   - Elasticsearch für Volltextsuche

4. **Versioning:**
   - S3-Versioning oder separate Files
   - Automatische Bereinigung alter Versionen
   - Diff-Generierung für Dokumente

5. **Monitoring:**
   - Storage-Nutzung überwachen
   - Download-Statistiken
   - Fehlerquoten bei Uploads
   - Performance-Metriken

---

*Version: 1.0.0*
*Erstellt: 16. Dezember 2024*
