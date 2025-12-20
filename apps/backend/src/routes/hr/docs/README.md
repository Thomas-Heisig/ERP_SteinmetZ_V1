# HR Module API

Einheitliche API-Dokumentation für das HR-Modul des ERP-Systems. Verwaltet alle personalbezogenen Funktionen inklusive Mitarbeiterverwaltung, Zeiterfassung, Urlaubsmanagement und Gehaltsabrechnung.

## 🔐 Authentifizierung & Berechtigungen

Alle Routen erfordern JWT-Authentifizierung im Header:

```bash
Authorization: Bearer <your-token>
```

### RBAC-Berechtigungen

Jede Route erfordert spezifische Berechtigungen im HR-Modul:

| Berechtigung | Beschreibung |
| ------------ | ------------ |

| `hr:read` | Lesen/Exports von HR-Daten |
| `hr:create` | Anlegen neuer Datensätze |
| `hr:update` | Ändern bestehender Datensätze |
| `hr:delete` | Löschen/Terminieren |
| `hr:approve` | Freigaben/Genehmigungen |

## ⚠️ Error Handling

### Standard-Response bei Fehlern

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "issues": [
        {
          "path": "field",
          "message": "..."
        }
      ]
    },
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
- `VALIDATION_ERROR` (422): Eingabedaten nicht valide (Zod-Validierung)
- `INTERNAL_ERROR` (500): Interner Serverfehler

## 📋 Konventionen

### Pagination

Standard-Pagination-Parameter:

- `page` (default: 1)
- `limit` (default: 50, max: 200)

Response-Format für paginierte Endpoints:

```json
{
  "success": true,
  "data": {
    "data": [], // Array der Ergebnisse
    "total": 100, // Gesamtanzahl der Datensätze
    "page": 1, // Aktuelle Seite
    "limit": 50, // Ergebnisse pro Seite
    "total_pages": 2 // Gesamtanzahl Seiten
  }
}
```

### Sortierung

- `sort_by`: Feldname für Sortierung (z.B. `last_name`, `start_date`)
- `sort_order`: `asc` (aufsteigend) oder `desc` (absteigend)

### Datenformate

- **Datum**: `YYYY-MM-DD` (ISO 8601)
- **Uhrzeit**: `HH:MM` (24-Stunden-Format)
- **UUIDs**: Strikte Prüfung im UUID-Format
- **Zahlen**: Numerisch (kein String-Casting im Payload)

## 📊 Mitarbeiterverwaltung

### GET `/api/hr/employees` (`hr:read`)

Listet alle Mitarbeiter mit optionalen Filtern.

**Query-Parameter:**

- `department?`: Filter nach Abteilung
- `status?`: Filter nach Status (`active`, `inactive`, `on_leave`, `terminated`)
- `position?`: Filter nach Position
- `search?`: Suche nach Name oder E-Mail
- `page?`: Seitenzahl (default: 1)
- `limit?`: Ergebnisse pro Seite (default: 50, max: 200)
- `sort_by?`: Sortierfeld (default: `last_name`)
- `sort_order?`: Sortierrichtung (default: `asc`)

**Beispiel-Request:**

```bash
GET /api/hr/employees?search=anna&department=Entwicklung&page=1&limit=25
```

**Beispiel-Response:**

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid-1234-...",
        "employee_number": "EMP-001",
        "first_name": "Max",
        "last_name": "Mustermann",
        "email": "max.mustermann@company.de",
        "department": "Entwicklung",
        "position": "Senior Developer",
        "start_date": "2020-03-15",
        "status": "active",
        "phone": "+49 123 456789",
        "address": "Musterstraße 1",
        "city": "Berlin",
        "postal_code": "10115",
        "country": "Deutschland"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 25,
    "total_pages": 1
  }
}
```

### GET `/api/hr/employees/:id` (`hr:read`)

Ruft Details eines einzelnen Mitarbeiters inkl. aller Relationen ab.

**Response-Format:** `EmployeeWithRelations` (inkl. Verträge, Zeiteinträge, Urlaubsanträge, Überstunden, Payroll-Daten, Dokumente, Onboarding)

**Beispiel-Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-1234-...",
    "employee_number": "EMP-001",
    "first_name": "Max",
    "last_name": "Mustermann",
    "email": "max.mustermann@company.de",
    "department": "Entwicklung",
    "position": "Senior Developer",
    "start_date": "2020-03-15",
    "status": "active",
    "phone": "+49 123 456789",
    "address": "Musterstraße 1",
    "city": "Berlin",
    "postal_code": "10115",
    "country": "Deutschland",
    "emergency_contact": "Erika Mustermann",
    "emergency_phone": "+49 987 654321",
    "notes": "Beispielnotizen",
    "contracts": [...],
    "time_entries": [...],
    "leave_requests": [...],
    "documents": [...],
    "onboarding": {...}
  }
}
```

### POST `/api/hr/employees` (`hr:create`)

Erstellt einen neuen Mitarbeiter.

**Request-Body:**

```json
{
  "employee_number?": "EMP-002",
  "first_name": "Anna",
  "last_name": "Schmidt",
  "email": "anna.schmidt@company.de",
  "phone?": "+49 123 456789",
  "department?": "Vertrieb",
  "position": "Sales Manager",
  "start_date": "2024-01-01",
  "end_date?": null,
  "status?": "active",
  "address?": "Hauptstraße 10",
  "city?": "München",
  "postal_code?": "80331",
  "country?": "Deutschland",
  "emergency_contact?": "Max Schmidt",
  "emergency_phone?": "+49 987 654321",
  "notes?": "Neue Mitarbeiterin"
}
```

**Response:** HTTP 201 mit `Employee`-Objekt

### PUT `/api/hr/employees/:id` (`hr:update`)

Aktualisiert einen Mitarbeiter (partielles Update).

**Request-Body:** Alle Felder optional (wie POST)

**Beispiel:**

```json
{
  "position": "Lead Developer",
  "department": "Entwicklung"
}
```

### DELETE `/api/hr/employees/:id` (`hr:delete`)

Terminiert einen Mitarbeiter (Soft Delete).

**Wirkung:**

- Status auf `terminated` gesetzt
- `end_date` auf heutiges Datum gesetzt

**Response:**

```json
{
  "success": true,
  "message": "Employee terminated successfully"
}
```

## 📑 Verträge

### GET `/api/hr/employees/:employeeId/contracts` (`hr:read`)

Listet alle Verträge eines Mitarbeiters (neueste zuerst).

### GET `/api/hr/contracts/:id` (`hr:read`)

Ruft einen einzelnen Vertrag ab.

### POST `/api/hr/contracts` (`hr:create`)

Erstellt einen neuen Vertrag.

**Request-Body:**

```json
{
  "employee_id": "uuid-1234-...",
  "type": "permanent|temporary|freelance|internship",
  "start_date": "2024-01-01",
  "end_date?": "2024-12-31",
  "salary": 65000,
  "working_hours": 40,
  "vacation_days?": 30,
  "probation_period?": 6,
  "notice_period?": 3,
  "status?": "active",
  "notes?": "Beispielnotizen"
}
```

**Response:** HTTP 201 mit `Contract`-Objekt

### PUT `/api/hr/contracts/:id` (`hr:update`)

Aktualisiert einen Vertrag (partielles Update).

## ⏱️ Zeiterfassung

### GET `/api/hr/time-entries` (`hr:read`)

Listet Zeiteinträge mit Filtern.

**Query-Parameter:**

- `employee_id` (Pflicht): UUID des Mitarbeiters
- `start_date?`: Startdatum (YYYY-MM-DD)
- `end_date?`: Enddatum (YYYY-MM-DD)

**Beispiel-Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1234-...",
      "employee_id": "uuid-1234-...",
      "date": "2024-12-05",
      "start_time": "08:00",
      "end_time": "17:00",
      "break_minutes": 60,
      "type": "regular",
      "net_hours": 8,
      "notes": "Normaler Arbeitstag",
      "status": "approved"
    }
  ]
}
```

### POST `/api/hr/time-entries` (`hr:create`)

Erstellt einen neuen Zeiteintrag.

**Request-Body:**

```json
{
  "employee_id": "uuid-1234-...",
  "date": "2024-12-05",
  "start_time": "08:00",
  "end_time": "17:00",
  "break_minutes?": 60,
  "type?": "regular",
  "notes?": "Normaler Arbeitstag"
}
```

**Wirkung:** Netto-Stunden werden automatisch berechnet

**Response:** HTTP 201 mit `TimeEntry`-Objekt

### POST `/api/hr/time-entries/:id/approve` (`hr:approve`)

Genehmigt einen Zeiteintrag.

## 🏖️ Urlaubsverwaltung

### GET `/api/hr/leave-requests` (`hr:read`)

Listet Urlaubsanträge mit Filtern.

**Query-Parameter:**

- `employee_id` (Pflicht): UUID des Mitarbeiters
- `status?`: Filter nach Status (`pending`, `approved`, `rejected`)

**Beispiel-Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1234-...",
      "employee_id": "uuid-1234-...",
      "type": "vacation",
      "start_date": "2024-12-20",
      "end_date": "2024-12-31",
      "days": 10,
      "status": "pending",
      "reason": "Weihnachtsurlaub",
      "notes": "Beispielnotizen"
    }
  ]
}
```

### POST `/api/hr/leave-requests` (`hr:create`)

Erstellt einen neuen Urlaubsantrag.

**Request-Body:**

```json
{
  "employee_id": "uuid-1234-...",
  "type": "vacation|sick|parental|other",
  "start_date": "2024-12-20",
  "end_date": "2024-12-31",
  "days": 10,
  "reason?": "Weihnachtsurlaub",
  "notes?": "Beispielnotizen"
}
```

**Wirkung:** Status startet bei `pending`

**Response:** HTTP 201 mit `LeaveRequest`-Objekt

### POST `/api/hr/leave-requests/:id/approve` (`hr:approve`)

Genehmigt einen Urlaubsantrag.

### POST `/api/hr/leave-requests/:id/reject` (`hr:approve`)

Lehnt einen Urlaubsantrag ab.

**Request-Body:**

```json
{
  "reason": "string (required)"
}
```

## 🏢 Abteilungen

### GET `/api/hr/departments` (`hr:read`)

Listet alle Abteilungen.

**Query-Parameter:**

- `active_only` (string, default: `true`): Bei `false` werden alle Abteilungen geliefert

**Beispiel-Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1234-...",
      "name": "Entwicklung",
      "manager_id": "uuid-1234-...",
      "description": "Softwareentwicklung",
      "budget": 500000,
      "is_active": true,
      "employee_count": 15
    }
  ]
}
```

### POST `/api/hr/departments` (`hr:create`)

Erstellt eine neue Abteilung.

**Request-Body:**

```json
{
  "name": "Marketing",
  "manager_id?": "uuid-1234-...",
  "description?": "Marketing und Kommunikation",
  "budget?": 250000,
  "is_active?": true
}
```

**Response:** HTTP 201 mit `Department`-Objekt

## 🎯 Onboarding

### GET `/api/hr/onboarding/:id` (`hr:read`)

Ruft Onboarding-Prozess inkl. Tasks und optional Mentor/Employee ab.

### POST `/api/hr/onboarding` (`hr:create`)

Erstellt einen neuen Onboarding-Prozess.

**Request-Body:**

```json
{
  "employee_id": "uuid-1234-...",
  "start_date": "2024-01-01",
  "mentor_id?": "uuid-1234-...",
  "notes?": "Onboarding für neue Position"
}
```

**Response:** HTTP 201 mit `OnboardingProcess`-Objekt

### POST `/api/hr/onboarding/tasks` (`hr:create`)

Erstellt eine neue Onboarding-Task.

**Request-Body:**

```json
{
  "onboarding_id": "uuid-1234-...",
  "title": "Arbeitsplatz einrichten",
  "description?": "Computer und Zugänge bereitstellen",
  "due_date?": "2024-01-05",
  "assigned_to?": "uuid-1234-...",
  "sort_order?": 1,
  "notes?": "Beispielnotizen"
}
```

**Response:** HTTP 201 mit `OnboardingTask`-Objekt

### POST `/api/hr/onboarding/tasks/:id/complete` (`hr:update`)

Schließt eine Task ab und aktualisiert den Progress.

## 📄 Dokumente

### GET `/api/hr/employees/:employeeId/documents` (`hr:read`)

Listet alle Dokumente eines Mitarbeiters.

## ⏰ Überstunden

### GET `/api/hr/overtime` (`hr:read`)

Listet Überstunden mit Filter.

**Query-Parameter:**

- `employee_id` (UUID): Filter nach Mitarbeiter

**Beispiel-Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1234-...",
      "employee_id": "uuid-1234-...",
      "date": "2024-12-05",
      "hours": 2.5,
      "reason": "Projektabschluss",
      "status": "approved",
      "notes": "Beispielnotizen"
    }
  ]
}
```

### POST `/api/hr/overtime` (`hr:create`)

Erfasst Überstunden.

**Request-Body:**

```json
{
  "employee_id": "uuid-1234-...",
  "date": "2024-12-05",
  "hours": 2.5,
  "reason?": "Projektabschluss",
  "notes?": "Beispielnotizen"
}
```

**Response:** HTTP 201 mit `OvertimeRecord`-Objekt

### POST `/api/hr/overtime/:id/approve` (`hr:approve`)

Genehmigt Überstunden.

## 💰 Payroll & Steuerparameter

### GET `/api/hr/payroll/tax-params/:year` (`hr:read`)

Ruft Steuerparameter für ein Jahr ab.

**Query-Parameter:**

- `country_code?` (default: `DE`): Länderkürzel

**Beispiel-Response:**

```json
{
  "success": true,
  "data": {
    "year": 2024,
    "country_code": "DE",
    "income_tax_rate": 0.42,
    "pension_insurance_rate": 0.186,
    "health_insurance_rate": 0.146,
    "unemployment_insurance_rate": 0.024,
    "church_tax_rate": 0.09,
    "solidarity_surcharge_rate": 0.055,
    "minimum_wage": 12.41,
    "tax_free_allowance": 10908,
    "notes": "Steuerparameter 2024"
  }
}
```

### POST `/api/hr/payroll/tax-params` (`hr:create`)

Erstellt Steuerparameter.

**Request-Body:**

```json
{
  "year": 2024,
  "income_tax_rate": 0.42,
  "pension_insurance_rate": 0.186,
  "health_insurance_rate": 0.146,
  "unemployment_insurance_rate": 0.024,
  "church_tax_rate?": 0.09,
  "solidarity_surcharge_rate?": 0.055,
  "minimum_wage": 12.41,
  "tax_free_allowance": 10908,
  "country_code?": "DE",
  "notes?": "Steuerparameter 2024"
}
```

**Response:** HTTP 201 mit `PayrollTaxParams`-Objekt

## 💸 Gehaltsabrechnung

### GET `/api/hr/payroll` (`hr:read`)

Listet Payroll-Datensätze mit Pagination.

**Query-Parameter:**

- `year?` (default: aktuelles Jahr)
- `month?`: Monat (MM)
- `page?`: Seitenzahl
- `limit?`: Ergebnisse pro Seite
- `sort_by?`: Sortierfeld
- `sort_order?`: Sortierrichtung

### GET `/api/hr/payroll/:id` (`hr:read`)

Ruft einen einzelnen Payroll-Datensatz ab.

### GET `/api/hr/employees/:employeeId/payroll` (`hr:read`)

Ruft Payroll-Daten für einen Mitarbeiter ab.

**Query-Parameter:**

- `year?`: Jahr
- `month?`: Monat (MM)

**Beispiel-Request:**

```bash
GET /api/hr/employees/uuid-1234-.../payroll?year=2024&month=12
```

### POST `/api/hr/payroll` (`hr:create`)

Erstellt einen neuen Payroll-Datensatz.

**Request-Body:**

```json
{
  "employee_id": "uuid-1234-...",
  "month": "12",
  "year": 2024,
  "gross_salary": 65000,
  "bonuses?": 5000,
  "income_tax?": 15000,
  "pension_insurance?": 6500,
  "health_insurance?": 5000,
  "unemployment_insurance?": 1000,
  "church_tax?": 500,
  "solidarity_surcharge?": 750,
  "other_deductions?": 250,
  "payment_method?": "bank_transfer|cash|check|paypal",
  "iban?": "DE89370400440532013000",
  "bic?": "COBADEFFXXX",
  "creditor_name?": "Max Mustermann",
  "notes?": "Dezember Gehalt"
}
```

**Wirkung:**

- `net_salary` wird automatisch berechnet
- `payment_status` wird auf `PENDING` gesetzt
- `sepa_status` wird auf `DRAFT` gesetzt

**Response:** HTTP 201 mit `PayrollRecord`-Objekt

### GET `/api/hr/payroll/export/csv` (`hr:read`)

Exportiert Payroll-Daten als CSV.

**Query-Parameter:**

- `year` (default: aktuelles Jahr)
- `month?`: Monat (MM)

**Response:** CSV-Datei-Download

### POST `/api/hr/payroll/export/sepa` (`hr:read`)

Erstellt SEPA-Export für Gehaltszahlungen.

**Request-Body:**

```json
{
  "year": 2024,
  "month": "12",
  "company_name": "Musterfirma GmbH",
  "company_iban": "DE89370400440532013000",
  "company_bic": "COBADEFFXXX"
}
```

**Response:** SEPA pain.001 XML-Datei-Download

## 📈 Statistiken

### GET `/api/hr/statistics` (`hr:read`)

Ruft HR-Statistiken ab.

**Beispiel-Response:**

```json
{
  "success": true,
  "data": {
    "total_employees": 31,
    "active_employees": 29,
    "on_leave": 2,
    "new_hires": 3,
    "departments": 4,
    "avg_tenure": 3.5,
    "open_positions": 2,
    "avg_salary": 55000,
    "total_overtime_hours": 245.5,
    "leave_requests_pending": 5
  }
}
```

## 🚀 Schnelle Beispiel-Requests

```bash
# Mitarbeiter mit Suche und Pagination
GET /api/hr/employees?search=anna&page=1&limit=25

# Überstunden erfassen
POST /api/hr/overtime
Content-Type: application/json
{
  "employee_id": "uuid-1234-...",
  "date": "2025-01-15",
  "hours": 2.5,
  "reason": "Go-Live"
}

# Payroll für einen Mitarbeiter abrufen
GET /api/hr/employees/uuid-1234-.../payroll?year=2025&month=01

# Urlaub genehmigen
POST /api/hr/leave-requests/uuid-1234-.../approve

# Mitarbeiter erstellen
POST /api/hr/employees
Content-Type: application/json
{
  "first_name": "Anna",
  "last_name": "Schmidt",
  "email": "anna.schmidt@company.de",
  "position": "Sales Manager",
  "start_date": "2024-01-01",
  "department": "Vertrieb"
}
```

## 🔒 Datenschutz & Compliance

### DSGVO/BDSG

- Alle personenbezogenen Daten werden nach DSGVO/BDSG verarbeitet
- Zugriff nur nach Need-to-Know-Prinzip
- Audit-Trail für alle Änderungen

### Zeiterfassung (BAG/EuGH)

- Erfüllt alle gesetzlichen Anforderungen
- Alle Zeiteinträge sind unveränderlich (nur Korrekturen mit Audit-Trail)
- Pausenzeiten müssen korrekt erfasst werden

### Urlaubsverwaltung (BUrlG)

- Urlaubsanspruch wird automatisch berechnet
- Resturlaub wird automatisch übertragen
- Genehmigungsworkflows sind konfigurierbar

## 🎯 Nächste Schritte

1. ✅ Backend-Routen erstellt
2. ✅ API-Dokumentation konsolidiert
3. ⏳ Datenbank-Schema implementieren
4. ⏳ Services und Business-Logik erstellen
5. ⏳ Frontend-Integration
6. ⏳ Tests schreiben
7. ⏳ Dokumentation vervollständigen
