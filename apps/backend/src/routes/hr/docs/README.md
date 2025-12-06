# HR Module API Documentation

Das HR-Modul verwaltet alle personalbezogenen Funktionen des ERP-Systems, einschließlich Mitarbeiterverwaltung, Zeiterfassung, Urlaubsmanagement und Gehaltsabrechnung.

## 📋 Inhaltsverzeichnis

- [Mitarbeiterverwaltung](#mitarbeiterverwaltung)
- [Zeiterfassung](#zeiterfassung)
- [Urlaubsverwaltung](#urlaubsverwaltung)
- [Gehaltsabrechnung](#gehaltsabrechnung)
- [Abteilungen](#abteilungen)
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
    "path": "/api/hr/employees"
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
          "path": ["email"],
          "message": "Invalid email address"
        }
      ]
    },
    "timestamp": "2024-12-06T15:30:00Z",
    "path": "/api/hr/employees"
  }
}
```

## 📊 Mitarbeiterverwaltung

### GET /api/hr/employees

Listet alle Mitarbeiter mit optionalen Filtern auf.

**Query-Parameter:**

- `department` (optional): Filter nach Abteilung
- `status` (optional): Filter nach Status (`active`, `inactive`, `on_leave`)
- `search` (optional): Suche nach Name oder E-Mail

**Beispiel-Request:**

```bash
GET /api/hr/employees?department=Entwicklung&status=active
```

**Beispiel-Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "firstName": "Max",
      "lastName": "Mustermann",
      "email": "max.mustermann@company.de",
      "department": "Entwicklung",
      "position": "Senior Developer",
      "startDate": "2020-03-15",
      "status": "active",
      "employeeNumber": "EMP-001"
    }
  ],
  "count": 1
}
```

### GET /api/hr/employees/:id

Ruft Details eines einzelnen Mitarbeiters ab.

**Beispiel-Response:**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "firstName": "Max",
    "lastName": "Mustermann",
    "email": "max.mustermann@company.de",
    "department": "Entwicklung",
    "position": "Senior Developer",
    "startDate": "2020-03-15",
    "status": "active",
    "employeeNumber": "EMP-001",
    "phone": "+49 123 456789",
    "address": {
      "street": "Musterstraße 1",
      "city": "Berlin",
      "zipCode": "10115",
      "country": "Deutschland"
    },
    "contract": {
      "type": "unbefristet",
      "startDate": "2020-03-15",
      "salary": 65000,
      "workingHours": 40
    }
  }
}
```

### POST /api/hr/employees

Erstellt einen neuen Mitarbeiter.

**Request-Body:**

```json
{
  "firstName": "Anna",
  "lastName": "Schmidt",
  "email": "anna.schmidt@company.de",
  "department": "Vertrieb",
  "position": "Sales Manager",
  "startDate": "2024-01-01",
  "phone": "+49 123 456789",
  "address": {
    "street": "Hauptstraße 10",
    "city": "München",
    "zipCode": "80331",
    "country": "Deutschland"
  },
  "contract": {
    "type": "unbefristet",
    "salary": 70000,
    "workingHours": 40
  }
}
```

**Beispiel-Response:**

```json
{
  "success": true,
  "data": {
    "id": "2",
    "firstName": "Anna",
    "lastName": "Schmidt",
    "status": "active",
    "createdAt": "2024-12-05T10:00:00Z"
  },
  "message": "Employee created successfully"
}
```

### PUT /api/hr/employees/:id

Aktualisiert einen Mitarbeiter.

**Request-Body:** (beliebige Felder)

```json
{
  "position": "Lead Developer",
  "department": "Entwicklung"
}
```

### DELETE /api/hr/employees/:id

Deaktiviert einen Mitarbeiter (Soft Delete).

**Beispiel-Response:**

```json
{
  "success": true,
  "message": "Employee deactivated successfully"
}
```

## ⏱️ Zeiterfassung

### GET /api/hr/time-entries

Listet Zeiteinträge mit optionalen Filtern auf.

**Query-Parameter:**

- `employeeId` (optional): Filter nach Mitarbeiter-ID
- `startDate` (optional): Startdatum (ISO 8601)
- `endDate` (optional): Enddatum (ISO 8601)

**Beispiel-Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "employeeId": "1",
      "date": "2024-12-05",
      "startTime": "08:00",
      "endTime": "17:00",
      "breakMinutes": 60,
      "totalHours": 8,
      "type": "regular"
    }
  ],
  "count": 1
}
```

### POST /api/hr/time-entries

Erstellt einen neuen Zeiteintrag.

**Request-Body:**

```json
{
  "employeeId": "1",
  "date": "2024-12-05",
  "startTime": "08:00",
  "endTime": "17:00",
  "breakMinutes": 60,
  "type": "regular"
}
```

## 🏖️ Urlaubsverwaltung

### GET /api/hr/leave-requests

Listet Urlaubsanträge auf.

**Query-Parameter:**

- `employeeId` (optional): Filter nach Mitarbeiter-ID
- `status` (optional): Filter nach Status (`pending`, `approved`, `rejected`)

**Beispiel-Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "employeeId": "1",
      "type": "vacation",
      "startDate": "2024-12-20",
      "endDate": "2024-12-31",
      "days": 10,
      "status": "approved",
      "reason": "Weihnachtsurlaub",
      "requestedAt": "2024-11-15"
    }
  ],
  "count": 1
}
```

### POST /api/hr/leave-requests

Erstellt einen neuen Urlaubsantrag.

**Request-Body:**

```json
{
  "employeeId": "1",
  "type": "vacation",
  "startDate": "2024-12-20",
  "endDate": "2024-12-31",
  "reason": "Weihnachtsurlaub"
}
```

### PUT /api/hr/leave-requests/:id/approve

Genehmigt einen Urlaubsantrag.

### PUT /api/hr/leave-requests/:id/reject

Lehnt einen Urlaubsantrag ab.

**Request-Body:**

```json
{
  "reason": "Keine Kapazität in diesem Zeitraum"
}
```

## 💰 Gehaltsabrechnung

### GET /api/hr/payroll/:employeeId

Ruft Gehaltsabrechnungsinformationen für einen Mitarbeiter ab.

**Beispiel-Response:**

```json
{
  "success": true,
  "data": {
    "employeeId": "1",
    "baseSalary": 65000,
    "bonuses": [],
    "deductions": [],
    "netSalary": 65000,
    "lastPayment": "2024-11-30"
  }
}
```

## 🏢 Abteilungen

### GET /api/hr/departments

Listet alle Abteilungen auf.

**Beispiel-Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Entwicklung",
      "manager": "Max Mustermann",
      "employeeCount": 15
    }
  ],
  "count": 1
}
```

## 📊 Statistiken

### GET /api/hr/statistics

Ruft HR-Statistiken ab.

**Beispiel-Response:**

```json
{
  "success": true,
  "data": {
    "totalEmployees": 31,
    "activeEmployees": 29,
    "onLeave": 2,
    "newHires": 3,
    "departments": 4,
    "avgTenure": 3.5,
    "openPositions": 2
  }
}
```

## 🔒 Berechtigungen

Die folgenden Rollen haben Zugriff auf das HR-Modul:

- **Admin**: Vollzugriff auf alle Funktionen
- **HR-Manager**: Zugriff auf alle HR-Funktionen außer sensible Gehaltsdaten
- **Manager**: Zugriff auf eigene Abteilungsdaten
- **Employee**: Nur Zugriff auf eigene Daten

## 📝 Hinweise

### Zeiterfassung

- Die Zeiterfassung muss den gesetzlichen Anforderungen entsprechen (BAG-Beschluss, EuGH)
- Alle Zeiteinträge sind unveränderlich (nur Korrekturen mit Audit-Trail)
- Pausenzeiten müssen korrekt erfasst werden

### Urlaubsverwaltung

- Urlaubsanspruch wird automatisch berechnet (BUrlG)
- Resturlaub wird automatisch übertragen
- Genehmigungsworkflows sind konfigurierbar

### Datenschutz

- Alle personenbezogenen Daten werden nach DSGVO/BDSG verarbeitet
- Zugriff nur nach Need-to-Know-Prinzip
- Audit-Trail für alle Änderungen

## 🚀 Nächste Schritte

1. ✅ Backend-Routen erstellt
2. ⏳ Datenbank-Schema implementieren
3. ⏳ Services und Business-Logik erstellen
4. ⏳ Frontend-Integration
5. ⏳ Tests schreiben
6. ⏳ Dokumentation vervollständigen
