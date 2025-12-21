# Document Management System (DMS) - Quick Reference

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Letzte Aktualisierung:** 2025-12-20

## Überblick

Das Document Management System (DMS) ist eine Vollfeature-Dokumentenverwaltungslösung mit Upload, Versionierung, OCR, AI-Verschlagwortung, Workflow-Automation und rechtskompliantem Archivierungssystem.

## Installation

```bash
# Backend Setup
cd apps/backend
npm install

# Umgebungsvariablen
cp .env.example .env.development.local

# Datenbank starten
npm run db:migrate

# Server starten
npm run dev
```

## Modul-Übersicht

| Modul        | Datei                | Funktion                |
| ------------ | -------------------- | ----------------------- |
| **Router**   | `documentsRouter.ts` | Main API Router         |
| **Handlers** | `handlers/*.ts`      | Request Processing      |
| **Services** | `services/*.ts`      | Business Logic          |
| **Types**    | `types/documents.ts` | TypeScript Definitionen |
| **Utils**    | `utils/*.ts`         | Helper Funktionen       |
| **Tests**    | `tests/*.test.ts`    | Unit/Integration Tests  |

## Kernfeatures

- ✅ Upload & Versionierung - Dokumente mit Änderungsverlauf  
  ✅ OCR - Texterkennung aus Scans  
  ✅ AI-Tags - Automatische Verschlagwortung  
  ✅ Full-Text Search - Intelligente Suche  
  ✅ Workflows - Genehmigungsprozesse  
  ✅ E-Signature - Elektronische Unterschriften  
  ✅ Retention - Aufbewahrungsfristen (DSGVO)

## Quick Start API

```bash
# Alle Dokumente
curl http://localhost:3001/api/documents

# Einzelnes Dokument
curl http://localhost:3001/api/documents/:id

# Dokument hochladen
curl -F "file=@doc.pdf" \
  http://localhost:3001/api/documents/upload

# Suche
curl "http://localhost:3001/api/documents/search?query=rechnung"

# OCR starten
curl -X POST http://localhost:3001/api/documents/:id/ocr

# Workflow starten
curl -X POST http://localhost:3001/api/documents/:id/workflows
```

## Kategorien & Aufbewahrung

| Kategorie         | Aufbewahrung | Rechtsgrundlage |
| ----------------- | ------------ | --------------- |
| invoice           | 10 Jahre     | HGB §257        |
| contract          | 6 Jahre      | BGB §195        |
| employee_document | 3 Jahre\*    | DSGVO Art. 17   |
| report            | 5 Jahre      | Firmenpolicy    |
| correspondence    | 5 Jahre      | Firmenpolicy    |
| other             | 1 Jahr       | Firmenpolicy    |

\*nach Ausscheiden

## Testing

```bash
# Alle Tests
npm test -- src/routes/documents

# Mit Coverage
npm test:coverage -- src/routes/documents

# Watch Mode
npm test:watch -- src/routes/documents
```

## Häufige Aufgaben

### Dokument hochladen

```typescript
import { documentsRouter } from "./documentsRouter";

app.use("/api/documents", documentsRouter);

// POST /api/documents/upload
// Content-Type: multipart/form-data
// Datei + Metadaten
```

### Suche implementieren

```bash
GET /api/documents/search?query=xyz&category=invoice
```

### Workflow starten

```bash
POST /api/documents/:id/workflows
{
  "type": "approval",
  "approvers": ["user-1", "user-2"],
  "deadline": "2024-12-31"
}
```

## Konfiguration

**Umgebungsvariablen (.env):**

```env
# Storage
STORAGE_PATH="./data/documents"
UPLOAD_MAX_SIZE="500mb"

# OCR
OCR_ENABLED="true"
OCR_PROVIDER="tesseract"

# AI
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."

# Database
DATABASE_URL="sqlite:./data/dev.sqlite3"
```

## Sicherheit

✅ JWT Authentication  
✅ Rollenbasierte Zugriffskontrolle (RBAC)  
✅ Dokumentenebenen-Berechtigungen  
✅ Vollständiges Audit-Trail  
✅ Verschlüsselung im Ruhezustand

## Abhängigkeiten

```json
{
  "express": "^4.x",
  "multer": "^1.x",
  "zod": "^3.x",
  "tesseract.js": "^5.x"
}
```

## Umfassende Dokumentation

Siehe [DMS_GUIDE.md](../../docs/DMS_GUIDE.md) für:

- Detaillierte API-Referenz
- Integration & Setup
- Best Practices
- Troubleshooting
- Rechtliche Grundlagen

## Links

- 🔗 [API Dokumentation](./docs/README.md)
- 📘 [Umfassender Guide](../../docs/DMS_GUIDE.md)
- 🧪 [Tests](./tests/)
- ⚙️ [Typen](./types/)

---

**Letzte Aktualisierung:** 2025-12-20
