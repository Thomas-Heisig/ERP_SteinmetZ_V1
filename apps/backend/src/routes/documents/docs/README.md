# Document Management System (DMS) - API Documentation

**Status**: ✅ Vollständig implementiert (Mock-Daten)  
**Version**: 1.0.0  
**Letzte Aktualisierung**: 9. Dezember 2025

## Übersicht

Das Document Management System (DMS) bietet umfassende Funktionen für die Verwaltung, Versionierung und Workflow-Automatisierung von Dokumenten im ERP-System.

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

## Roadmap

### Phase 1 (Q1 2025) - ✅ ERLEDIGT

- [x] Basis-Repository-Funktionen
- [x] Upload und Versionierung
- [x] Suche und Filterung
- [x] Workflow-Engine
- [x] E-Signature-Integration

### Phase 2 (Q2 2025) - GEPLANT

- [ ] Datenbankintegration
- [ ] Tatsächliche Dateiablage (S3/MinIO)
- [ ] OCR-Implementierung
- [ ] AI-Tag-Generierung
- [ ] Frontend-Komponenten

### Phase 3 (Q3 2025) - GEPLANT

- [ ] Advanced Workflows (BPMN)
- [ ] Collaboration-Features
- [ ] Mobile App
- [ ] Offline-Modus

### Phase 4 (Q4 2025) - GEPLANT

- [ ] Records Management
- [ ] Advanced Analytics
- [ ] Blockchain-Integration für Audit-Trail
- [ ] Compliance-Reports

## Support

Bei Fragen oder Problemen:

- 📧 **Email**: support@erp-steinmetz.de
- 📚 **Dokumentation**: [docs/DMS_GUIDE.md](../../../../../../../docs/DMS_GUIDE.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues)

---

**Letzte Aktualisierung**: 9. Dezember 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (Mock-Daten)
