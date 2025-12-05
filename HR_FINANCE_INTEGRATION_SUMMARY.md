# HR & Finance Module Integration - Zusammenfassung

**Datum:** 5. Dezember 2024  
**Status:** Phase 1 abgeschlossen ✅  
**Nächste Schritte:** Datenbank-Integration und Services-Layer

---

## 📊 Überblick

Die Integration der HR- und Finance-Module wurde erfolgreich begonnen. Die Backend-API-Routen und umfassende Dokumentation sind vorhanden und funktionsfähig.

## ✅ Was wurde implementiert (Phase 1)

### HR-Modul (`/api/hr`)

#### Mitarbeiterverwaltung

- ✅ `GET /api/hr/employees` - Mitarbeiter abrufen (mit Filtern)
- ✅ `GET /api/hr/employees/:id` - Einzelnen Mitarbeiter abrufen
- ✅ `POST /api/hr/employees` - Neuen Mitarbeiter anlegen
- ✅ `PUT /api/hr/employees/:id` - Mitarbeiter aktualisieren
- ✅ `DELETE /api/hr/employees/:id` - Mitarbeiter deaktivieren

#### Zeiterfassung

- ✅ `GET /api/hr/time-entries` - Zeiteinträge abrufen
- ✅ `POST /api/hr/time-entries` - Zeiteintrag erstellen

#### Urlaubsverwaltung

- ✅ `GET /api/hr/leave-requests` - Urlaubsanträge abrufen
- ✅ `POST /api/hr/leave-requests` - Urlaubsantrag erstellen
- ✅ `PUT /api/hr/leave-requests/:id/approve` - Urlaubsantrag genehmigen
- ✅ `PUT /api/hr/leave-requests/:id/reject` - Urlaubsantrag ablehnen

#### Gehaltsabrechnung

- ✅ `GET /api/hr/payroll/:employeeId` - Gehaltsinfos abrufen

#### Organisatorisches

- ✅ `GET /api/hr/departments` - Abteilungen abrufen
- ✅ `GET /api/hr/statistics` - HR-Statistiken abrufen

### Finance-Modul (`/api/finance`)

#### Rechnungsmanagement

- ✅ `GET /api/finance/invoices` - Rechnungen abrufen (mit Filtern)
- ✅ `GET /api/finance/invoices/:id` - Einzelne Rechnung abrufen
- ✅ `POST /api/finance/invoices` - Neue Rechnung erstellen
- ✅ `PUT /api/finance/invoices/:id` - Rechnung aktualisieren
- ✅ `DELETE /api/finance/invoices/:id` - Rechnung löschen (nur Entwürfe)
- ✅ `POST /api/finance/invoices/:id/send` - Rechnung versenden

#### Kunden (Debitoren)

- ✅ `GET /api/finance/customers` - Kunden abrufen
- ✅ `GET /api/finance/customers/:id` - Einzelnen Kunden abrufen
- ✅ `POST /api/finance/customers` - Neuen Kunden anlegen

#### Lieferanten (Kreditoren)

- ✅ `GET /api/finance/suppliers` - Lieferanten abrufen
- ✅ `POST /api/finance/suppliers` - Neuen Lieferanten anlegen

#### Zahlungen

- ✅ `GET /api/finance/payments` - Zahlungen abrufen
- ✅ `POST /api/finance/payments` - Zahlung erfassen

#### Buchhaltung

- ✅ `GET /api/finance/accounts` - Kontenplan abrufen
- ✅ `GET /api/finance/transactions` - Buchungen abrufen
- ✅ `POST /api/finance/transactions` - Buchung erstellen

#### Berichte

- ✅ `GET /api/finance/reports/balance-sheet` - Bilanz
- ✅ `GET /api/finance/reports/profit-loss` - GuV
- ✅ `GET /api/finance/statistics` - Finanzstatistiken

### Dokumentation

- ✅ [HR Module API Dokumentation](apps/backend/src/routes/hr/docs/README.md)
- ✅ [Finance Module API Dokumentation](apps/backend/src/routes/finance/docs/README.md)
- ✅ README.md aktualisiert mit neuen Endpoints
- ✅ Integration in main backend index.ts

### Build & Tests

- ✅ TypeScript-Kompilierung erfolgreich
- ✅ Backend baut ohne Fehler

---

## 🔄 Was noch fehlt (Phase 2-6)

### Phase 2: Datenbank-Schema & Models

#### HR-Datenbank

- [ ] **employees** - Mitarbeiter-Stammdaten
  - id, employee_number, first_name, last_name, email, phone
  - department, position, status, start_date, end_date
  - created_at, updated_at
- [ ] **employee_contracts** - Verträge
  - id, employee_id, contract_type, start_date, end_date
  - salary, working_hours, probation_period
  - created_at, updated_at

- [ ] **time_entries** - Zeiterfassung
  - id, employee_id, date, start_time, end_time
  - break_minutes, total_hours, entry_type
  - created_at, updated_at

- [ ] **leave_requests** - Urlaubsanträge
  - id, employee_id, leave_type, start_date, end_date
  - days, status, reason, approved_by, approved_at
  - created_at, updated_at

- [ ] **leave_balances** - Urlaubskontingente
  - id, employee_id, year, total_days
  - used_days, remaining_days, carried_over_days
  - created_at, updated_at

- [ ] **departments** - Abteilungen
  - id, name, manager_id, description
  - created_at, updated_at

- [ ] **qualifications** - Qualifikationen
  - id, employee_id, qualification_type, name
  - issued_date, expiry_date, certificate_file
  - created_at, updated_at

#### Finance-Datenbank

- [ ] **invoices** - Rechnungen
  - id, invoice_number, customer_id, issue_date, due_date
  - amount, tax_amount, gross_amount, currency
  - status, payment_terms, notes
  - created_at, updated_at

- [ ] **invoice_items** - Rechnungspositionen
  - id, invoice_id, description, quantity
  - unit_price, tax_rate, total_amount
  - created_at, updated_at

- [ ] **customers** - Kunden (Debitoren)
  - id, customer_number, name, email, phone
  - address, tax_id, credit_limit, current_balance
  - payment_terms, created_at, updated_at

- [ ] **suppliers** - Lieferanten (Kreditoren)
  - id, supplier_number, name, email, phone
  - address, tax_id, payment_terms
  - created_at, updated_at

- [ ] **accounts** - Kontenplan (SKR03/04)
  - id, account_number, name, account_type
  - balance, parent_account_id
  - created_at, updated_at

- [ ] **transactions** - Buchungen
  - id, transaction_date, description
  - debit_account_id, credit_account_id
  - amount, currency, reference
  - created_at, updated_at

- [ ] **payments** - Zahlungen
  - id, payment_type, amount, currency
  - payment_date, payment_method
  - invoice_id, customer_id, supplier_id
  - status, reference, created_at, updated_at

#### Migration-Scripts

- [ ] Erstellen von Knex/Prisma Migrations
- [ ] Seed-Daten für Entwicklung
- [ ] Rollback-Strategien

### Phase 3: Backend Services & Business Logic

#### HR Services

- [ ] **EmployeeService**
  - CRUD-Operationen mit Datenbank
  - Validierung mit Zod-Schemas
  - Geschäftslogik (Mitarbeiter-Nr. generieren, Status-Übergänge)
- [ ] **TimeTrackingService**
  - Zeiterfassung mit Validierung (ArbZG-konform)
  - Pausen-Berechnung
  - Überstunden-Konto
  - Audit-Trail für Korrekturen

- [ ] **LeaveManagementService**
  - Urlaubsanträge mit Workflow
  - Automatische Berechnung verbleibender Tage
  - Genehmigungslogik
  - Konflikt-Erkennung (Team-Kalender)

- [ ] **PayrollService**
  - Gehaltsberechnung
  - Lohnarten-Verwaltung
  - Schnittstelle zu externem Lohnsystem

#### Finance Services

- [ ] **InvoiceService**
  - CRUD mit Datenbank
  - Automatische Rechnungs-Nr. Generierung
  - Steuerberechnung
  - PDF-Generierung
  - E-Mail-Versand

- [ ] **AccountingService**
  - Hauptbuch (Kontenplan SKR03/04)
  - Debitoren-Verwaltung
  - Kreditoren-Verwaltung
  - Automatisches Matching von Zahlungen
- [ ] **PaymentService**
  - Zahlungserfassung
  - Zahlungsabgleich
  - Skonto-Berechnung
  - SEPA-Export

- [ ] **ReportingService**
  - Bilanz-Generierung
  - GuV-Generierung
  - Summen- und Saldenlisten
  - DATEV-Export

### Phase 4: Frontend-Integration

#### HR Frontend

- [ ] Aktualisierung `EmployeeList.tsx` mit echten API-Calls
- [ ] CRUD-Dialoge für Mitarbeiter
- [ ] Zeiterfassungs-UI
  - Tages-/Wochen-/Monatsansicht
  - Stundenzettel-Eingabe
  - Überstunden-Anzeige
- [ ] Urlaubsverwaltungs-UI
  - Kalender-Ansicht
  - Antrags-Formulare
  - Genehmigungs-Workflows
- [ ] Dashboard mit HR-Statistiken

#### Finance Frontend

- [ ] Aktualisierung `InvoiceList.tsx` mit echten API-Calls
- [ ] CRUD-Dialoge für Rechnungen
  - Positions-Editor
  - PDF-Vorschau
  - E-Mail-Versand
- [ ] Kunden-/Lieferanten-Verwaltung
- [ ] Zahlungsabwicklung-UI
  - Zahlungseingang buchen
  - Offene Posten anzeigen
- [ ] Buchhaltungs-UI
  - Kontenplan-Ansicht
  - Buchungserfassung
  - Journal-Ansichten
- [ ] Finanzberichte-UI
  - Bilanz-Darstellung
  - GuV-Darstellung
  - Grafische Auswertungen

### Phase 5: Erweiterte Features

#### HR

- [ ] Workflow-Automatisierung
  - Onboarding-Prozesse
  - Genehmigungs-Workflows
  - Erinnerungen (Probezeitende, Vertragsende)
- [ ] Dokumentenmanagement
  - Digitale Personalakte
  - Vertrags-Upload
  - Zeugnisse

#### Finance

- [ ] OCR für Eingangsrechnungen
- [ ] XRechnung/ZUGFeRD-Unterstützung
- [ ] Automatisches Mahnwesen
  - Mahnstufen-Konfiguration
  - Automatischer Versand
- [ ] DATEV-Schnittstelle
- [ ] Bankkonto-Anbindung (HBCI/PSD2)

### Phase 6: Testing & Qualitätssicherung

#### Backend Tests

- [ ] Unit-Tests für Services
- [ ] Integration-Tests für API-Endpoints
- [ ] E2E-Tests für kritische Workflows

#### Frontend Tests

- [ ] Component-Tests mit Testing Library
- [ ] Integration-Tests
- [ ] E2E-Tests mit Playwright

#### Security

- [ ] Authentifizierung & Autorisierung
- [ ] RBAC (Role-Based Access Control)
- [ ] Datenschutz (DSGVO-konform)
- [ ] Audit-Trail
- [ ] Input-Validierung

#### Performance

- [ ] Datenbank-Indizes optimieren
- [ ] API-Response-Caching
- [ ] Frontend-Optimierung (Code-Splitting, Lazy Loading)

---

## 🎯 Nächste konkrete Schritte

### Sofort (Prio 1)

1. **Datenbank-Schema Design finalisieren**
   - ER-Diagramm erstellen
   - Relationships definieren
   - Constraints festlegen

2. **Migration-Scripts erstellen**
   - SQLite für Entwicklung
   - PostgreSQL für Production

3. **Services-Layer implementieren**
   - Beginnen mit EmployeeService
   - Dann InvoiceService
   - Schrittweise erweitern

### Kurzfristig (Prio 2)

4. **Frontend-Komponenten mit APIs verbinden**
   - EmployeeList mit echten Daten
   - InvoiceList mit echten Daten

5. **Basis-Tests schreiben**
   - API-Tests für HR-Endpoints
   - API-Tests für Finance-Endpoints

### Mittelfristig (Prio 3)

6. **Erweiterte Features**
   - Workflow-Automatisierung
   - PDF-Generierung
   - E-Mail-Versand

7. **Performance & Security**
   - Caching implementieren
   - RBAC implementieren
   - Security-Audit

---

## 📋 Offene Fragen & Entscheidungen

### Technische Entscheidungen

- [ ] Welches ORM/Query-Builder? (Prisma, Knex, TypeORM)
- [ ] PDF-Generierung: Welche Library? (pdfkit, puppeteer)
- [ ] E-Mail-Versand: Welcher Service? (nodemailer, sendgrid)
- [ ] Datei-Upload: Lokales Filesystem oder S3-kompatibel?

### Business-Logik

- [ ] Genehmigungs-Workflows: Wer kann was genehmigen?
- [ ] Urlaubsberechnung: Welche Regeln gelten?
- [ ] Rechnungs-Nummerierung: Welches Schema?
- [ ] Mahnwesen: Welche Mahnstufen?

### Compliance

- [ ] DSGVO: Welche Daten müssen besonders geschützt werden?
- [ ] GoBD: Welche Anforderungen an Buchführung?
- [ ] ArbZG: Welche Validierungen für Zeiterfassung?

---

## 📚 Ressourcen & Links

### Dokumentation

- [HR Module API](apps/backend/src/routes/hr/docs/README.md)
- [Finance Module API](apps/backend/src/routes/finance/docs/README.md)
- [HR Konzept](docs/concept/_8_PERSONAL%20&%20HR.md)
- [Finance Konzept](docs/concept/_3_0_FINANZEN%20&%20CONTROLLING.md)

### Gesetzliche Grundlagen

- **Arbeitszeiterfassung:** BAG 1 ABR 22/21, EuGH C-55/18
- **Urlaubsrecht:** BUrlG
- **Datenschutz:** DSGVO Art. 6/9, § 26 BDSG
- **Buchhaltung:** HGB §§ 238, 239, 257
- **GoBD:** Grundsätze ordnungsmäßiger Buchführung

---

**Stand:** 5. Dezember 2024  
**Letzte Aktualisierung:** Phase 1 abgeschlossen  
**Verantwortlich:** Thomas Heisig
