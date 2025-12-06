# Finance Module API Documentation

Das Finance-Modul verwaltet alle finanzbezogenen Funktionen des ERP-Systems, einschließlich Rechnungsstellung, Buchhaltung, Zahlungsabwicklung und Finanzberichterstattung.

## 📋 Inhaltsverzeichnis

- [Rechnungsmanagement](#rechnungsmanagement)
- [Kunden (Debitoren)](#kunden-debitoren)
- [Lieferanten (Kreditoren)](#lieferanten-kreditoren)
- [Zahlungen](#zahlungen)
- [Konten (Kontenplan)](#konten-kontenplan)
- [Buchungen (Transaktionen)](#buchungen-transaktionen)
- [Berichte](#berichte)
- [Statistiken](#statistiken)

## 🔐 Authentifizierung

Alle Endpoints erfordern Authentifizierung. Verwenden Sie einen JWT-Token im Authorization-Header:

```
Authorization: Bearer <your-token>
```

## ⚠️ Error Handling

Alle Endpoints verwenden standardisierte Error-Responses nach folgendem Format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "timestamp": "2024-12-06T15:30:00Z",
    "path": "/api/finance/invoices"
  }
}
```

### Error Codes

- `BAD_REQUEST` (400): Ungültige Anfrage oder Parameter
- `UNAUTHORIZED` (401): Fehlende oder ungültige Authentifizierung
- `FORBIDDEN` (403): Keine Berechtigung für diese Ressource
- `NOT_FOUND` (404): Ressource nicht gefunden
- `VALIDATION_ERROR` (422): Eingabedaten nicht valide
- `INTERNAL_ERROR` (500): Interner Serverfehler
- `DATABASE_ERROR` (500): Datenbankfehler

### Input-Validierung

Alle Endpoints verwenden Zod-Schemas für die Validierung von Eingabedaten. Bei Validierungsfehlern wird ein `VALIDATION_ERROR` zurückgegeben mit Details zu den fehlerhaften Feldern:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "issues": [
        {
          "path": ["amount"],
          "message": "Amount must be a positive number"
        }
      ]
    },
    "timestamp": "2024-12-06T15:30:00Z",
    "path": "/api/finance/invoices"
  }
}
```

## 💰 Rechnungsmanagement

### GET /api/finance/invoices

Listet alle Rechnungen mit optionalen Filtern auf.

**Query-Parameter:**

- `status` (optional): Filter nach Status (`draft`, `sent`, `paid`, `overdue`, `cancelled`)
- `customerId` (optional): Filter nach Kunden-ID
- `startDate` (optional): Startdatum (ISO 8601)
- `endDate` (optional): Enddatum (ISO 8601)

**Beispiel-Request:**

```bash
GET /api/finance/invoices?status=overdue
```

**Beispiel-Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "invoiceNumber": "RE-2024-001",
      "customerName": "ABC GmbH",
      "customerId": "C001",
      "amount": 1500.0,
      "currency": "EUR",
      "dueDate": "2024-12-12",
      "status": "sent",
      "createdAt": "2024-11-28"
    }
  ],
  "count": 1
}
```

### GET /api/finance/invoices/:id

Ruft Details einer einzelnen Rechnung ab.

**Beispiel-Response:**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "invoiceNumber": "RE-2024-001",
    "customerName": "ABC GmbH",
    "customerId": "C001",
    "amount": 1500.0,
    "currency": "EUR",
    "dueDate": "2024-12-12",
    "status": "sent",
    "createdAt": "2024-11-28",
    "items": [
      {
        "id": "1",
        "description": "Beratungsleistung",
        "quantity": 10,
        "unitPrice": 150.0,
        "total": 1500.0
      }
    ],
    "tax": 285.0,
    "grossAmount": 1785.0
  }
}
```

### POST /api/finance/invoices

Erstellt eine neue Rechnung.

**Request-Body:**

```json
{
  "customerId": "C001",
  "items": [
    {
      "description": "Beratungsleistung",
      "quantity": 10,
      "unitPrice": 150.0
    }
  ],
  "dueDate": "2024-12-31",
  "notes": "Zahlbar innerhalb 30 Tage"
}
```

**Beispiel-Response:**

```json
{
  "success": true,
  "data": {
    "id": "5",
    "invoiceNumber": "RE-2024-005",
    "status": "draft",
    "createdAt": "2024-12-05T10:00:00Z"
  },
  "message": "Invoice created successfully"
}
```

### PUT /api/finance/invoices/:id

Aktualisiert eine Rechnung (nur Entwürfe).

### DELETE /api/finance/invoices/:id

Löscht eine Rechnung (nur Entwürfe).

### POST /api/finance/invoices/:id/send

Versendet eine Rechnung an den Kunden.

**Beispiel-Response:**

```json
{
  "success": true,
  "message": "Invoice sent successfully"
}
```

## 👥 Kunden (Debitoren)

### GET /api/finance/customers

Listet alle Kunden auf.

**Query-Parameter:**

- `search` (optional): Suche nach Name oder E-Mail

**Beispiel-Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "C001",
      "name": "ABC GmbH",
      "email": "info@abc-gmbh.de",
      "phone": "+49 30 1234567",
      "address": "Hauptstraße 1, 10115 Berlin",
      "creditLimit": 10000,
      "currentBalance": 1500
    }
  ],
  "count": 1
}
```

### GET /api/finance/customers/:id

Ruft Details eines einzelnen Kunden ab.

**Beispiel-Response:**

```json
{
  "success": true,
  "data": {
    "id": "C001",
    "name": "ABC GmbH",
    "email": "info@abc-gmbh.de",
    "phone": "+49 30 1234567",
    "address": "Hauptstraße 1, 10115 Berlin",
    "creditLimit": 10000,
    "currentBalance": 1500,
    "paymentTerms": "30 Tage netto",
    "taxId": "DE123456789"
  }
}
```

### POST /api/finance/customers

Erstellt einen neuen Kunden.

**Request-Body:**

```json
{
  "name": "XYZ AG",
  "email": "kontakt@xyz-ag.de",
  "phone": "+49 89 9876543",
  "address": "Leopoldstraße 50, 80802 München",
  "creditLimit": 20000,
  "paymentTerms": "30 Tage netto",
  "taxId": "DE987654321"
}
```

## 🏭 Lieferanten (Kreditoren)

### GET /api/finance/suppliers

Listet alle Lieferanten auf.

**Beispiel-Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "S001",
      "name": "Supplier GmbH",
      "email": "info@supplier.de",
      "phone": "+49 40 1234567",
      "address": "Industriestraße 10, 20095 Hamburg",
      "paymentTerms": "14 Tage 2% Skonto, 30 Tage netto"
    }
  ],
  "count": 1
}
```

### POST /api/finance/suppliers

Erstellt einen neuen Lieferanten.

**Request-Body:**

```json
{
  "name": "New Supplier GmbH",
  "email": "info@newsupplier.de",
  "phone": "+49 69 1234567",
  "address": "Bahnhofstraße 5, 60329 Frankfurt",
  "paymentTerms": "30 Tage netto"
}
```

## 💳 Zahlungen

### GET /api/finance/payments

Listet alle Zahlungen auf.

**Query-Parameter:**

- `type` (optional): Filter nach Typ (`incoming`, `outgoing`)
- `status` (optional): Filter nach Status (`pending`, `completed`, `failed`)

**Beispiel-Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "P001",
      "type": "incoming",
      "amount": 1500.0,
      "currency": "EUR",
      "date": "2024-12-05",
      "status": "completed",
      "invoiceId": "1",
      "customerId": "C001"
    }
  ],
  "count": 1
}
```

### POST /api/finance/payments

Erfasst eine neue Zahlung.

**Request-Body:**

```json
{
  "type": "incoming",
  "amount": 1500.0,
  "currency": "EUR",
  "date": "2024-12-05",
  "invoiceId": "1",
  "customerId": "C001",
  "paymentMethod": "bank_transfer",
  "reference": "Ref-12345"
}
```

## 📊 Konten (Kontenplan)

### GET /api/finance/accounts

Ruft den Kontenplan ab (SKR03/SKR04 kompatibel).

**Beispiel-Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1000",
      "name": "Kasse",
      "type": "asset",
      "balance": 5000.0
    },
    {
      "id": "1200",
      "name": "Bank",
      "type": "asset",
      "balance": 50000.0
    },
    {
      "id": "4000",
      "name": "Umsatzerlöse",
      "type": "revenue",
      "balance": 100000.0
    }
  ],
  "count": 3
}
```

## 📝 Buchungen (Transaktionen)

### GET /api/finance/transactions

Listet Buchungen auf.

**Query-Parameter:**

- `accountId` (optional): Filter nach Konto-ID
- `startDate` (optional): Startdatum (ISO 8601)
- `endDate` (optional): Enddatum (ISO 8601)

**Beispiel-Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "T001",
      "date": "2024-12-05",
      "description": "Zahlungseingang Rechnung RE-2024-001",
      "debitAccount": "1200",
      "creditAccount": "1400",
      "amount": 1500.0,
      "currency": "EUR"
    }
  ],
  "count": 1
}
```

### POST /api/finance/transactions

Erstellt eine neue Buchung.

**Request-Body:**

```json
{
  "date": "2024-12-05",
  "description": "Zahlung Lieferant",
  "debitAccount": "3300",
  "creditAccount": "1200",
  "amount": 1000.0,
  "currency": "EUR"
}
```

## 📈 Berichte

### GET /api/finance/reports/balance-sheet

Ruft die Bilanz ab.

**Beispiel-Response:**

```json
{
  "success": true,
  "data": {
    "assets": {
      "current": 55000.0,
      "fixed": 100000.0,
      "total": 155000.0
    },
    "liabilities": {
      "current": 25000.0,
      "longTerm": 50000.0,
      "total": 75000.0
    },
    "equity": 80000.0
  }
}
```

### GET /api/finance/reports/profit-loss

Ruft die Gewinn- und Verlustrechnung ab.

**Beispiel-Response:**

```json
{
  "success": true,
  "data": {
    "revenue": 100000.0,
    "costOfGoodsSold": 40000.0,
    "grossProfit": 60000.0,
    "operatingExpenses": 20000.0,
    "operatingIncome": 40000.0,
    "netIncome": 40000.0
  }
}
```

## 📊 Statistiken

### GET /api/finance/statistics

Ruft Finanzstatistiken ab.

**Beispiel-Response:**

```json
{
  "success": true,
  "data": {
    "totalRevenue": 100000.0,
    "totalExpenses": 60000.0,
    "netProfit": 40000.0,
    "openInvoices": 7,
    "overdueInvoices": 2,
    "totalOpenAmount": 4750.5,
    "totalOverdueAmount": 3250.5
  }
}
```

## 🔒 Berechtigungen

Die folgenden Rollen haben Zugriff auf das Finance-Modul:

- **Admin**: Vollzugriff auf alle Funktionen
- **Finance-Manager**: Zugriff auf alle Finance-Funktionen
- **Accountant**: Zugriff auf Buchungen und Berichte
- **Controller**: Nur lesender Zugriff auf Berichte

## 📝 Hinweise

### Buchhaltung

- Alle Buchungen folgen dem Prinzip der doppelten Buchführung (Soll = Haben)
- GoBD-konforme Archivierung aller Belege
- Unveränderbarkeit gebuchter Transaktionen (nur Stornierung möglich)

### Rechnungsstellung

- Automatische Nummerierung nach konfigurierbarem Schema
- Unterstützung für XRechnung und ZUGFeRD (geplant)
- Automatische Steuerberechnung

### Zahlungsmanagement

- Automatisches Matching von Banktransaktionen
- Skonto-Verwaltung
- Mahnwesen mit konfigurierbaren Mahnstufen

### Compliance

- HGB-konform
- GoBD-konforme Archivierung
- DATEV-Schnittstelle (geplant)
- Unterstützung für SKR03/SKR04

## 🚀 Nächste Schritte

1. ✅ Backend-Routen erstellt
2. ⏳ Datenbank-Schema implementieren
3. ⏳ Services und Business-Logik erstellen
4. ⏳ OCR-Integration für Eingangsrechnungen
5. ⏳ XRechnung/ZUGFeRD-Support
6. ⏳ DATEV-Schnittstelle
7. ⏳ Frontend-Integration
8. ⏳ Tests schreiben
9. ⏳ Dokumentation vervollständigen
