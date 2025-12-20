# 🗂️ Menüsystem & Modulstruktur

**Datum**: 17. Dezember 2025  
**Version**: 0.3.0  
**Status**: ✅ Implementiert

## 📋 Übersicht

Das ERP-System verfügt über ein vollständig integriertes Menüsystem mit 11 Hauptmodulen, die alle wesentlichen Geschäftsprozesse abdecken. Jedes Modul hat dedizierte Backend-APIs und Frontend-Komponenten.

## 🎯 Hauptmodule

### 1. 🏠 Dashboard

**Pfad**: `/dashboard`  
**Backend**: `/api/dashboard`

Zentrale Übersicht mit KPIs und Schnellzugriff auf alle Module.

**Features**:

- Executive Overview mit Echtzeit-KPIs
- Personalisierbare Widgets
- Schnellzugriff auf Hauptfunktionen
- Benachrichtigungszentrale

---

### 2. 💼 Geschäftsverwaltung

**Pfad**: `/business`  
**Backend**: `/api/business`

Verwaltung von Unternehmensstammdaten, Prozessen und Compliance.

**Submodule**:

- **Unternehmen** (`/business/company`)
  - Stammdaten, Bankverbindungen, Steuerdaten
  - Organisationseinheiten, Standortverwaltung
- **Prozess-Management** (`/business/processes`)
  - BPMN 2.0 Workflow-Designer
  - Prozess-Mining und -Optimierung
  - Lead-to-Cash, Procure-to-Pay, Plan-to-Produce
- **Risiko & Compliance** (`/business/risks`)
  - Risikomanagement und -bewertung
  - Compliance-Monitoring (GoBD, DSGVO, ISO)
  - Audit-Management

**Backend-Endpoints**:

```
GET    /api/business/company           - Unternehmensdaten abrufen
PUT    /api/business/company           - Unternehmensdaten aktualisieren
GET    /api/business/processes         - Prozesse abrufen
POST   /api/business/processes         - Prozess erstellen
GET    /api/business/processes/:id     - Prozess-Details
GET    /api/business/risks             - Risiken abrufen
POST   /api/business/risks             - Risiko erfassen
GET    /api/business/compliance        - Compliance-Status
GET    /api/business/audits            - Audit-Historie
```

---

### 3. 💰 Finanzen & Controlling

**Pfad**: `/finance`  
**Backend**: `/api/finance`

Vollständige Finanzverwaltung mit Buchhaltung und Controlling.

**Submodule**:

- **Buchhaltung** (`/finance/accounting`)
  - Hauptbuch, Debitoren, Kreditoren
  - Automatische Buchungen, Kontenrahmen (SKR03/04, IFRS)
- **Controlling** (`/finance/controlling`)
  - Kostenrechnung, Budgetierung
  - KPI-Tracking und -Analyse
- **Treasury** (`/finance/treasury`)
  - Liquiditätsmanagement, Zahlungsverkehr
  - Cash-Flow-Planung
- **Steuern** (`/finance/taxes`)
  - Umsatzsteuer, Voranmeldungen
  - ELSTER-Integration

---

### 4. 📈 Vertrieb & Marketing

**Pfad**: `/sales`  
**Backend**: `/api/sales`

CRM, Vertriebsprozesse und Marketing-Automation.

**Submodule**:

- **CRM** (`/sales/crm`)
  - 360° Kundenansicht
  - Kontakt- und Interaktionsverwaltung
- **Marketing** (`/sales/marketing`)
  - Kampagnen-Management
  - Lead-Generierung und -Scoring
- **Vertrieb** (`/sales/orders`)
  - Angebotserstellung, Auftragsmanagement
  - Pipeline-Management
- **Fulfillment** (`/sales/fulfillment`)
  - Versandmanagement, Rechnungsstellung

**Backend-Endpoints**:

```
GET    /api/sales/pipeline             - Pipeline-Übersicht
GET    /api/sales/quotes               - Angebote abrufen
POST   /api/sales/quotes               - Angebot erstellen
GET    /api/sales/quotes/:id           - Angebots-Details
GET    /api/sales/orders               - Aufträge abrufen
POST   /api/sales/orders               - Auftrag erstellen
GET    /api/sales/leads                - Leads abrufen
POST   /api/sales/leads                - Lead erfassen
PUT    /api/sales/leads/:id/qualify    - Lead qualifizieren
GET    /api/sales/campaigns            - Kampagnen abrufen
```

---

### 5. 🛒 Einkauf & Beschaffung

**Pfad**: `/procurement`  
**Backend**: `/api/procurement`

Beschaffungsprozesse, Lieferantenmanagement und Wareneingang.

**Submodule**:

- **Beschaffung** (`/procurement/orders`)
  - Bedarfsplanung, Bestellwesen
  - Rahmenvertragsmanagement
- **Wareneingang** (`/procurement/goods-receipt`)
  - Eingangskontrolle, Qualitätsprüfung
  - Rechnungsprüfung
- **Lieferanten** (`/procurement/suppliers`)
  - Stammdaten, Bewertungssystem
  - Vertragsmanagement

**Backend-Endpoints**:

```
GET    /api/procurement/orders                  - Bestellungen abrufen
POST   /api/procurement/orders                  - Bestellung erstellen
GET    /api/procurement/orders/:id              - Bestellungs-Details
GET    /api/procurement/suppliers               - Lieferanten abrufen
POST   /api/procurement/suppliers               - Lieferant anlegen
GET    /api/procurement/suppliers/:id           - Lieferanten-Details
POST   /api/procurement/suppliers/:id/evaluate  - Lieferant bewerten
GET    /api/procurement/goods-receipts          - Wareneingänge abrufen
POST   /api/procurement/goods-receipts          - Wareneingang erfassen
GET    /api/procurement/demand                  - Bedarfsplanung
POST   /api/procurement/demand/calculate        - Bedarf neu berechnen
```

---

### 6. 🏭 Produktion & Fertigung

**Pfad**: `/production`  
**Backend**: `/api/production`

Produktionsplanung, Fertigungssteuerung und Qualitätsmanagement.

**Submodule**:

- **Produktionsplanung** (`/production/planning`)
  - Kapazitätsplanung, Materialbedarf
  - Terminplanung
- **Fertigungssteuerung** (`/production/control`)
  - Fertigungsaufträge, Rückmeldungen
  - Maschineneinsatzplanung
- **Qualitätsmanagement** (`/production/quality`)
  - Prüfpläne, Qualitätskontrollen
  - Zertifikatsmanagement
- **Wartung** (`/production/maintenance`)
  - Wartungspläne, Instandhaltung
  - Ersatzteilmanagement

**Backend-Endpoints**:

```
GET    /api/production/planning                - Produktionsplan
POST   /api/production/planning                - Auftrag einplanen
GET    /api/production/orders                  - Fertigungsaufträge
GET    /api/production/orders/:id              - Auftrags-Details
POST   /api/production/orders/:id/feedback     - Rückmeldung erfassen
GET    /api/production/machines                - Maschinen-Übersicht
GET    /api/production/machines/:id            - Maschinen-Details
GET    /api/production/quality                 - Qualitäts-Übersicht
POST   /api/production/quality/inspection      - Prüfung erfassen
GET    /api/production/maintenance             - Wartungs-Übersicht
POST   /api/production/maintenance             - Wartung planen
```

---

### 7. 📦 Lager & Logistik

**Pfad**: `/warehouse`  
**Backend**: `/api/warehouse`

Bestandsführung, Kommissionierung und Versandmanagement.

**Submodule**:

- **Lagerverwaltung** (`/warehouse/stock`)
  - Bestandsführung in Echtzeit
  - Lagerplatzverwaltung, Inventur
- **Kommissionierung** (`/warehouse/picking`)
  - Kommissionierlisten, Pick-by-Voice
  - Wegoptimierung
- **Logistik** (`/warehouse/shipping`)
  - Versandmanagement, Transportplanung
  - Sendungsverfolgung

**Backend-Endpoints**:

```
GET    /api/warehouse/stock                    - Bestand abrufen
GET    /api/warehouse/stock/:id                - Artikel-Details
POST   /api/warehouse/stock/movement           - Bewegung erfassen
GET    /api/warehouse/locations                - Lagerplätze
GET    /api/warehouse/picking                  - Kommissionierlisten
GET    /api/warehouse/picking/:id              - Listen-Details
POST   /api/warehouse/picking/:id/assign       - Kommissionierer zuweisen
POST   /api/warehouse/picking/:id/complete     - Kommissionierung abschließen
GET    /api/warehouse/shipments                - Versendungen
POST   /api/warehouse/shipments                - Versendung erstellen
GET    /api/warehouse/shipments/:id/tracking   - Sendungsverfolgung
GET    /api/warehouse/inventory                - Inventuren
POST   /api/warehouse/inventory                - Inventur anlegen
```

---

### 8. 👥 Personal & HR

**Pfad**: `/hr`  
**Backend**: `/api/hr`

Personalverwaltung, Zeiterfassung und Personalentwicklung.

**Submodule**:

- **Personalverwaltung** (`/hr/employees`)
  - Mitarbeiterstammdaten, Verträge
  - Dokumentenmanagement
- **Zeiterfassung** (`/hr/time-tracking`)
  - Arbeitszeit-, Projektzeiterfassung
  - Urlaubsverwaltung, Abwesenheiten
- **Personalentwicklung** (`/hr/development`)
  - Qualifikationen, Schulungen
  - Karriereplanung
- **Recruiting** (`/hr/recruiting`)
  - Stellenausschreibungen
  - Bewerbermanagement, Onboarding

---

### 9. 📊 Reporting & Analytics

**Pfad**: `/reporting`  
**Backend**: `/api/reporting`

Umfassendes Reporting mit KI-gestützten Analysen.

**Submodule**:

- **Standard-Reports** (`/reporting/standard`)
  - Finanzberichte (Bilanz, GuV, Cashflow)
  - Vertriebs-, Produktions-, Personalberichte
- **Ad-hoc-Analysen** (`/reporting/adhoc`)
  - Daten-Explorer, Pivot-Tabellen
  - Benutzerdefinierte Abfragen
- **KI-Analytics** (`/reporting/ai`)
  - Predictive Analytics, Trend-Analysen
  - Automatische Insights und Empfehlungen

**Backend-Endpoints**:

```
GET    /api/reporting/financial                - Finanzberichte
GET    /api/reporting/financial/:type          - Spezifischer Bericht
GET    /api/reporting/sales                    - Vertriebsberichte
GET    /api/reporting/production               - Produktionsberichte
GET    /api/reporting/hr                       - Personalberichte
GET    /api/reporting/inventory                - Lagerberichte
POST   /api/reporting/adhoc                    - Ad-hoc-Analyse ausführen
POST   /api/reporting/adhoc/save               - Analyse speichern
GET    /api/reporting/ai/predictions           - Vorhersagen
GET    /api/reporting/ai/insights              - KI-Insights
GET    /api/reporting/ai/trends                - Trend-Analysen
GET    /api/reporting/dashboard-kpis           - Dashboard-KPIs
```

---

### 10. 💬 Kommunikation & Social

**Pfad**: `/communication`  
**Backend**: `/api/communication`

Unified Communications und Social Media Management.

**Submodule**:

- **E-Mail-Management** (`/communication/email`)
  - Unified Inbox, Smart Response
  - Kampagnen-Tracking
- **Messaging** (`/communication/messaging`)
  - Chat-System, Video-Konferenzen
  - Team-Collaboration
- **Social Media** (`/communication/social`)
  - Multi-Channel-Management
  - Content-Kalender, Sentiment-Analyse

---

### 11. ⚙️ System & Administration

**Pfad**: `/system`  
**Backend**: `/api/system`

Systemverwaltung, Benutzerverwaltung und Integrationen.

**Submodule**:

- **Benutzerverwaltung** (`/system/users`)
  - Rollen & Rechte, Zugriffskontrolle
  - Audit-Log
- **Systemeinstellungen** (`/system/settings`)
  - Mandantenverwaltung
  - Datenbank-Management, Backup/Restore
- **Integrationen** (`/system/integrations`)
  - API-Management, Schnittstellen
  - Plugin-System

---

## 🔄 Prozess-Integrationen

### Lead-to-Cash

```
Marketing → Lead → Qualifikation → Angebot → Auftrag →
Produktion → Lieferung → Rechnung → Zahlung
```

**Module**: Sales → Production → Warehouse → Finance

### Procure-to-Pay

```
Bedarf → Bestellanforderung → Bestellung → Wareneingang →
Rechnungsprüfung → Zahlung
```

**Module**: Procurement → Warehouse → Finance

### Plan-to-Produce

```
Prognose → Planung → Materialdisposition → Fertigungsauftrag →
Produktion → QM → Einlagerung
```

**Module**: Sales → Production → Warehouse

---

## 🎨 Frontend-Komponenten

### Dashboard-Widgets

Datei: `apps/frontend/src/components/Dashboard/widgets/ModuleWidgets.tsx`

Jedes Modul hat ein dediziertes Widget mit:

- KPIs und Kennzahlen
- Schnellzugriff auf wichtige Funktionen
- Visuellen Indikatoren (Trends, Status)

### Navigation

Datei: `apps/frontend/src/components/Navigation/MainNavigation.tsx`

Features:

- Hierarchische Menüstruktur
- Kollapsible Untermenüs
- Badge-Support für Benachrichtigungen
- Responsive Design (Desktop/Tablet/Mobile)
- Dark Mode Support

---

## 🔌 API-Struktur

Alle Module folgen einer konsistenten API-Struktur:

### Standardendpoints

- `GET /api/{module}` - Übersicht/Liste
- `GET /api/{module}/:id` - Details
- `POST /api/{module}` - Neu erstellen
- `PUT /api/{module}/:id` - Aktualisieren
- `DELETE /api/{module}/:id` - Löschen

### Error-Handling

Alle Endpoints verwenden standardisierte Errors:

- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `APIError` (500)

### Validierung

Alle Input-Daten werden mit Zod validiert.

---

## 📝 Implementierungsstatus

| Modul         | Backend | Frontend | Tests | Dokumentation |
| ------------- | ------- | -------- | ----- | ------------- |
| Dashboard     | ✅      | ✅       | ⏳    | ✅            |
| Business      | ✅      | ⏳       | ⏳    | ✅            |
| Finance       | ✅      | ⏳       | ✅    | ✅            |
| Sales         | ✅      | ⏳       | ⏳    | ✅            |
| Procurement   | ✅      | ⏳       | ⏳    | ✅            |
| Production    | ✅      | ⏳       | ⏳    | ✅            |
| Warehouse     | ✅      | ⏳       | ⏳    | ✅            |
| HR            | ✅      | ⏳       | ✅    | ✅            |
| Reporting     | ✅      | ⏳       | ⏳    | ✅            |
| Communication | ✅      | ⏳       | ⏳    | ✅            |
| System        | ✅      | ⏳       | ⏳    | ✅            |

**Legende**: ✅ Komplett | ⏳ In Arbeit | ❌ Nicht gestartet

---

## 🚀 Nächste Schritte

1. **Frontend-Seiten für alle Module erstellen**
   - React-Komponenten für jedes Submodul
   - Formular-Komponenten für CRUD-Operationen
2. **Tests ergänzen**
   - Backend-API-Tests
   - Frontend-Komponenten-Tests
   - E2E-Tests für Hauptprozesse
3. **Authentifizierung & Autorisierung**
   - Rollenbasierte Zugriffskontrolle pro Modul
   - Feingranulare Berechtigungen
4. **Performance-Optimierung**
   - Caching-Strategien
   - Lazy Loading für Module
   - Virtualisierung für große Listen

---

## 📚 Verwandte Dokumentation

- [Architecture](./ARCHITECTURE.md) - Systemarchitektur
- [API Documentation](./api/openapi.yaml) - OpenAPI-Spezifikation
- [Frontend Structure](../apps/frontend/FRONTEND_STRUCTURE.md) - Frontend-Architektur
- [Database Schema](./DATABASE_MIGRATIONS.md) - Datenbankschema

---

**Stand**: 17. Dezember 2025  
**Version**: 0.3.0
