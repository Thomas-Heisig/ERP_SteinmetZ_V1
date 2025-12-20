# Sales Module - Dokumentation

**Version:** 1.0.0  
**Letzte Aktualisierung:** 2025-12-20  
**Status:** ✅ Produktiv

---

## Übersicht

Das Sales-Modul bietet umfassende Vertriebsfunktionalität für Angebote, Aufträge, Lead-Management, Marketing-Kampagnen und Pipeline-Tracking. Es unterstützt den gesamten Verkaufsprozess vom ersten Kontakt bis zum Abschluss.

### Hauptkomponenten

1. **SalesService** - Geschäftslogik für alle Sales-Operationen
2. **SalesRouter** - REST API Endpunkte
3. **Pipeline Management** - Opportunity-Tracking und Forecasting
4. **Analytics** - Vertriebsmetriken und Reporting

---

## Features

### 1. Angebotsverwaltung (Quotes)

- ✅ **Quote-Erstellung** - Automatische Nummerngenerierung
- ✅ **Positionsberechnung** - Netto, Steuer, Brutto mit Rabatten
- ✅ **Gültigkeitsdatum** - Konfigurierbare Gültigkeit
- ✅ **Status-Tracking** - Draft, Pending, Accepted, Rejected, Expired
- ✅ **PDF-Export** - Professionelle Angebotsdokumente (TODO)

### 2. Auftragsverwaltung (Orders)

- ✅ **Auftragskonvertierung** - Aus Angeboten erstellen
- ✅ **Liefertermin-Tracking** - Terminplanung
- ✅ **Produktionsstatus** - Confirmed, In Production, Ready, Delivered
- ✅ **Zahlungsstatus** - Pending, Partial, Paid, Overdue
- ✅ **Spezielle Anweisungen** - Kundenspezifische Anforderungen

### 3. Lead-Management

- ✅ **Lead-Erfassung** - Multi-Source Tracking (Website, Messe, Referral)
- ✅ **Qualification Scoring** - 0-100 Punkte-System
- ✅ **Status-Workflow** - New → Contacted → Qualified → Converted/Lost
- ✅ **Kontaktinformationen** - Company, Contact, Email, Phone
- ✅ **Lead-Notizen** - Gesprächshistorie

### 4. Marketing-Kampagnen

- ✅ **Kampagnen-Planung** - Start/End-Datum, Budget
- ✅ **Lead-Tracking** - Generierte Leads pro Kampagne
- ✅ **Conversion-Tracking** - Von Lead zu Kunde
- ✅ **ROI-Berechnung** - Return on Investment
- ✅ **Multi-Channel** - Email, Social, Events, Ads

### 5. Sales Pipeline

- ✅ **Stage-Tracking** - Lead → Qualifiziert → Angebot → Verhandlung → Gewonnen
- ✅ **Value-Tracking** - Pipeline-Wert pro Stage
- ✅ **Conversion Rates** - Stage-zu-Stage Conversion
- ✅ **Forecasting** - Monat/Quartal Prognosen
- ✅ **Pipeline-Visualisierung** - Dashboard-Ready Data

### 6. Analytics

- ✅ **Revenue-Tracking** - Gesamtumsatz
- ✅ **Conversion Rates** - Lead-zu-Kunde Conversion
- ✅ **Average Deal Size** - Durchschnittlicher Auftragswert
- ✅ **Active Opportunities** - Anzahl offener Opportunities
- ✅ **Won/Lost Tracking** - Gewonnene/verlorene Deals

---

## API Dokumentation

### Pipeline

#### Get Pipeline Summary

```http
GET /api/sales/pipeline
```

**Response:**

```json
{
  "total_value": 2450000,
  "stages": [
    {
      "name": "Lead",
      "count": 45,
      "value": 450000,
      "conversion_rate": 25
    },
    {
      "name": "Qualifiziert",
      "count": 32,
      "value": 640000,
      "conversion_rate": 45
    },
    {
      "name": "Angebot",
      "count": 18,
      "value": 720000,
      "conversion_rate": 60
    },
    {
      "name": "Verhandlung",
      "count": 12,
      "value": 480000,
      "conversion_rate": 75
    },
    {
      "name": "Gewonnen",
      "count": 5,
      "value": 160000,
      "conversion_rate": 100
    }
  ],
  "forecast": {
    "this_month": 185000,
    "next_month": 220000,
    "this_quarter": 650000
  }
}
```

---

### Quotes (Angebote)

#### List Quotes

```http
GET /api/sales/quotes?status=pending
```

**Query Parameters:**

- `status` (optional) - Filter by status: `draft`, `pending`, `accepted`, `rejected`, `expired`

**Response:**

```json
{
  "quotes": [
    {
      "id": "qt_001",
      "quote_number": "QT-2025-001",
      "customer_id": "cust_001",
      "date": "2025-12-15",
      "valid_until": "2026-01-15",
      "status": "pending",
      "total": 4165,
      "created_at": "2025-12-15T10:30:00Z"
    }
  ]
}
```

#### Get Quote Details

```http
GET /api/sales/quotes/:id
```

**Response:**

```json
{
  "id": "qt_001",
  "quote_number": "QT-2025-001",
  "customer_id": "cust_001",
  "contact_id": "contact_001",
  "date": "2025-12-15",
  "valid_until": "2026-01-15",
  "status": "pending",
  "items": [
    {
      "position": 1,
      "description": "Grabstein aus schwarzem Granit",
      "quantity": 1,
      "unit": "Stk",
      "unit_price": 3500,
      "discount_percent": 0,
      "net_amount": 3500,
      "tax_rate": 19,
      "tax_amount": 665,
      "gross_amount": 4165
    }
  ],
  "subtotal": 3500,
  "total_tax": 665,
  "total": 4165,
  "notes": "Lieferzeit ca. 4-6 Wochen",
  "terms": "Zahlbar innerhalb 14 Tagen",
  "created_at": "2025-12-15T10:30:00Z"
}
```

#### Create Quote

```http
POST /api/sales/quotes
Content-Type: application/json

{
  "customer_id": "cust_001",
  "contact_id": "contact_001",
  "valid_days": 30,
  "items": [
    {
      "description": "Grabstein aus schwarzem Granit",
      "quantity": 1,
      "unit_price": 3500,
      "discount_percent": 0,
      "tax_rate": 19
    }
  ],
  "notes": "Lieferzeit ca. 4-6 Wochen",
  "terms": "Zahlbar innerhalb 14 Tagen"
}
```

**Response:**

```json
{
  "message": "Angebot erstellt",
  "data": {
    "id": "qt_1734693000123",
    "quote_number": "QT-2025-001",
    "status": "draft",
    "total": 4165
  }
}
```

---

### Orders (Aufträge)

#### List Orders

```http
GET /api/sales/orders?status=in_production
```

**Query Parameters:**

- `status` (optional) - Filter: `confirmed`, `in_production`, `ready`, `delivered`, `cancelled`

**Response:**

```json
{
  "orders": [
    {
      "id": "ord_001",
      "order_number": "OR-2025-001",
      "customer_id": "cust_001",
      "date": "2025-12-10",
      "delivery_date": "2026-01-20",
      "status": "in_production",
      "payment_status": "pending",
      "total": 45000
    }
  ]
}
```

#### Create Order

```http
POST /api/sales/orders
Content-Type: application/json

{
  "quote_id": "qt_001",
  "customer_id": "cust_001",
  "delivery_date": "2026-01-20",
  "payment_terms": "30 Tage netto",
  "special_instructions": "Bitte vor Lieferung kontaktieren"
}
```

**Response:**

```json
{
  "message": "Auftrag erstellt",
  "data": {
    "id": "ord_1734693000123",
    "order_number": "OR-2025-001",
    "status": "confirmed",
    "payment_status": "pending"
  }
}
```

---

### Leads

#### List Leads

```http
GET /api/sales/leads?status=qualified
```

**Query Parameters:**

- `status` (optional) - Filter: `new`, `contacted`, `qualified`, `converted`, `lost`

**Response:**

```json
{
  "leads": [
    {
      "id": "lead_001",
      "source": "Website",
      "company": "Neukunde GmbH",
      "contact": "Anna Schmidt",
      "email": "anna@neukunde.de",
      "phone": "+49 987 654321",
      "status": "qualified",
      "score": 85,
      "created_at": "2025-12-16T14:20:00Z"
    }
  ]
}
```

#### Create Lead

```http
POST /api/sales/leads
Content-Type: application/json

{
  "source": "Website",
  "company": "Neukunde GmbH",
  "contact": "Anna Schmidt",
  "email": "anna@neukunde.de",
  "phone": "+49 987 654321",
  "notes": "Interesse an Granit-Produkten"
}
```

**Response:**

```json
{
  "message": "Lead erfasst",
  "data": {
    "id": "lead_1734693000123",
    "status": "new",
    "score": 50
  }
}
```

#### Qualify Lead

```http
PUT /api/sales/leads/:id/qualify
Content-Type: application/json

{
  "score": 85,
  "notes": "Gutes Erstgespräch, Budget vorhanden"
}
```

**Response:**

```json
{
  "message": "Lead qualifiziert",
  "data": {
    "id": "lead_001",
    "status": "qualified",
    "score": 85,
    "updated_at": "2025-12-20T11:30:00Z"
  }
}
```

---

### Campaigns (Marketing-Kampagnen)

#### List Campaigns

```http
GET /api/sales/campaigns?status=active
```

**Query Parameters:**

- `status` (optional) - Filter: `planned`, `active`, `paused`, `completed`, `cancelled`

**Response:**

```json
{
  "campaigns": [
    {
      "id": "camp_001",
      "name": "Weihnachts-Aktion 2025",
      "type": "email",
      "status": "active",
      "start_date": "2025-12-01",
      "end_date": "2025-12-24",
      "budget": 5000,
      "spent": 3200,
      "leads_generated": 45,
      "conversions": 12,
      "roi": 240
    }
  ]
}
```

---

### Analytics

#### Get Sales Analytics

```http
GET /api/sales/analytics
```

**Response:**

```json
{
  "total_revenue": 245000,
  "conversion_rate": 28.5,
  "average_deal_size": 15000,
  "active_opportunities": 87,
  "won_deals": 45,
  "lost_deals": 23
}
```

---

## TypeScript Types

### Quote Types

```typescript
type QuoteStatus = "draft" | "pending" | "accepted" | "rejected" | "expired";

interface QuoteItem {
  position: number;
  product_id?: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  net_amount: number;
  tax_rate: number;
  tax_amount: number;
  gross_amount: number;
}

interface Quote {
  id: string;
  quote_number: string;
  customer_id: string;
  contact_id?: string;
  date: string;
  valid_until: string;
  status: QuoteStatus;
  items: QuoteItem[];
  subtotal: number;
  total_tax: number;
  total: number;
  notes?: string;
  terms?: string;
  created_at: string;
  updated_at?: string;
}
```

### Order Types

```typescript
type OrderStatus =
  | "confirmed"
  | "in_production"
  | "ready"
  | "delivered"
  | "cancelled";
type PaymentStatus = "pending" | "partial" | "paid" | "overdue";

interface Order {
  id: string;
  order_number: string;
  quote_id?: string;
  customer_id: string;
  date: string;
  delivery_date: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_terms?: string;
  special_instructions?: string;
  total: number;
  created_at: string;
  updated_at?: string;
}
```

### Lead Types

```typescript
type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

interface Lead {
  id: string;
  source: string;
  company: string;
  contact: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  score: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}
```

### Campaign Types

```typescript
type CampaignStatus =
  | "planned"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: CampaignStatus;
  start_date: string;
  end_date: string;
  budget: number;
  spent: number;
  leads_generated: number;
  conversions: number;
  roi: number;
  created_at: string;
  updated_at?: string;
}
```

---

## Service Layer

### SalesService API

```typescript
import { salesService } from "./salesService.js";

// Pipeline
const pipeline = await salesService.getPipeline();

// Quotes
const quotes = await salesService.getQuotes("pending");
const quote = await salesService.getQuoteById("qt_001");
const newQuote = await salesService.createQuote({
  customer_id: "cust_001",
  items: [{ description: "Product", quantity: 1, unit_price: 100 }],
});

// Orders
const orders = await salesService.getOrders("confirmed");
const newOrder = await salesService.createOrder({
  customer_id: "cust_001",
  delivery_date: "2026-01-20",
});

// Leads
const leads = await salesService.getLeads("new");
const newLead = await salesService.createLead({
  source: "Website",
  company: "Corp",
  contact: "John Doe",
  email: "john@corp.com",
});
const qualified = await salesService.qualifyLead("lead_001", 85);

// Campaigns
const campaigns = await salesService.getCampaigns("active");

// Analytics
const analytics = await salesService.getAnalytics();
```

---

## Berechnungslogik

### Quote-Berechnung

```typescript
// Für jede Position:
net_amount = quantity * unit_price * (1 - discount_percent / 100);
tax_amount = net_amount * (tax_rate / 100);
gross_amount = net_amount + tax_amount;

// Gesamt:
subtotal = Summe(net_amount);
total_tax = Summe(tax_amount);
total = subtotal + total_tax;
```

**Beispiel:**

- 1x Grabstein à 3.500 EUR
- 0% Rabatt
- 19% MwSt.

```calc
net_amount = 1 * 3500 * (1 - 0/100) = 3.500 EUR
tax_amount = 3500 * (19/100) = 665 EUR
gross_amount = 3500 + 665 = 4.165 EUR

subtotal = 3.500 EUR
total_tax = 665 EUR
total = 4.165 EUR
```

### Lead Scoring

**Initiales Scoring:** 50 Punkte

**Qualifikations-Faktoren:**

- +20: Budget vorhanden
- +15: Entscheidungsträger kontaktiert
- +10: Konkreter Bedarf
- +10: Zeitnaher Kauftermin
- -10: Kein Budget
- -15: Nur Informationssuche

**Score-Ranges:**

- 0-30: Low Priority
- 31-60: Medium Priority
- 61-80: High Priority
- 81-100: Hot Lead

---

## Workflows

### Quote-to-Order Workflow

```sequence
1. Create Quote
   ↓
2. Send to Customer
   ↓
3. Quote Status: Pending
   ↓
4. Customer Accepts → Quote Status: Accepted
   ↓
5. Create Order (from Quote)
   ↓
6. Order Status: Confirmed
   ↓
7. Production → Order Status: In Production
   ↓
8. Ready → Order Status: Ready
   ↓
9. Delivery → Order Status: Delivered
```

### Lead-to-Customer Workflow

```sequence
1. Lead Created (Source: Website/Messe/etc.)
   ↓ Status: New, Score: 50
2. First Contact
   ↓ Status: Contacted
3. Qualification
   ↓ Status: Qualified, Score: 70-100
4. Create Quote
   ↓
5. Quote Accepted
   ↓
6. Create Order
   ↓ Status: Converted
```

---

## Validierung

### Quote Validation

```typescript
const quoteSchema = z.object({
  customer_id: z.string(),
  contact_id: z.string().optional(),
  valid_days: z.number().default(30),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().positive("Quantity must be positive"),
        unit_price: z.number().positive("Unit price must be positive"),
        discount_percent: z.number().min(0).max(100).default(0),
        tax_rate: z.number().default(19),
      }),
    )
    .min(1, "At least one item is required"),
});
```

### Order Validation

```typescript
const orderSchema = z.object({
  customer_id: z.string(),
  delivery_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});
```

### Lead Validation

```typescript
const leadSchema = z.object({
  source: z.string().min(1, "Source is required"),
  company: z.string().min(1, "Company name is required"),
  contact: z.string().min(1, "Contact name is required"),
  email: z.string().email("Valid email is required"),
});
```

---

## Logging

Strukturiertes Logging mit Pino:

```typescript
// Quote creation
logger.debug({ customer_id, item_count }, "Creating new quote");
logger.info({ quote_id, quote_number, total }, "Quote created");

// Order creation
logger.debug({ quote_id, customer_id }, "Creating new order");
logger.info({ order_id, order_number }, "Order created");

// Lead qualification
logger.debug({ lead_id, score }, "Qualifying lead");
logger.info({ lead_id, score, status }, "Lead qualified");

// Analytics
logger.debug("Fetching sales analytics");
logger.info({ total_revenue, conversion_rate }, "Analytics retrieved");
```

---

## Error Handling

### Validation Errors (400)

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "items": "At least one item is required"
  }
}
```

### Not Found (404)

```json
{
  "success": false,
  "error": "Quote not found"
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Integration Points

### Mit anderen Modulen

- **CRM Module** - Customer und Contact Daten
- **Finance Module** - Rechnungsstellung, Zahlungen
- **Inventory Module** - Produktverfügbarkeit
- **Projects Module** - Projektbezogene Verkäufe
- **DMS Module** - Dokumentenarchivierung

---

## Database Schema (TODO)

```sql
-- Quotes
CREATE TABLE IF NOT EXISTS sales_quotes (
  id TEXT PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  contact_id TEXT,
  date TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  status TEXT NOT NULL,
  subtotal REAL NOT NULL,
  total_tax REAL NOT NULL,
  total REAL NOT NULL,
  notes TEXT,
  terms TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id)
);

-- Quote Items
CREATE TABLE IF NOT EXISTS sales_quote_items (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  product_id TEXT,
  description TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  unit_price REAL NOT NULL,
  discount_percent REAL DEFAULT 0,
  tax_rate REAL DEFAULT 19,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quote_id) REFERENCES sales_quotes(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE IF NOT EXISTS sales_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  quote_id TEXT,
  customer_id TEXT NOT NULL,
  date TEXT NOT NULL,
  delivery_date TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  payment_terms TEXT,
  special_instructions TEXT,
  total REAL NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (quote_id) REFERENCES sales_quotes(id),
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id)
);

-- Leads
CREATE TABLE IF NOT EXISTS sales_leads (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  company TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL,
  score INTEGER DEFAULT 50,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

-- Campaigns
CREATE TABLE IF NOT EXISTS sales_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  budget REAL NOT NULL,
  spent REAL DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  roi REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);
```

---

## Best Practices

### 1. Quote-Nummern generieren

```typescript
// ✅ Korrekt - eindeutige Nummern
const year = new Date().getFullYear();
const number = await getNextQuoteNumber(year);
const quote_number = `QT-${year}-${String(number).padStart(3, "0")}`;

// ❌ Falsch - Kollisionen möglich
const quote_number = `QT-${Date.now()}`;
```

### 2. Preise berechnen

```typescript
// ✅ Korrekt - präzise Berechnungen
const net_amount =
  Math.round(quantity * unit_price * (1 - discount / 100) * 100) / 100;

// ❌ Falsch - Rundungsfehler
const net_amount = quantity * unit_price * (1 - discount / 100);
```

### 3. Lead Scoring

```typescript
// ✅ Korrekt - zwischen 0-100
const score = Math.max(0, Math.min(100, calculatedScore));

// ❌ Falsch - keine Begrenzung
const score = calculatedScore;
```

---

## TODO / Roadmap

- [ ] **Database Integration** - SQLite-Tabellen erstellen
- [ ] **PDF Export** - Quote/Order PDFs generieren
- [ ] **Email Integration** - Quotes per Email versenden
- [ ] **Payment Integration** - Zahlungsabwicklung
- [ ] **Inventory Check** - Verfügbarkeitsprüfung
- [ ] **Advanced Analytics** - Dashboard, Charts
- [ ] **Quote Templates** - Vorlagen für Standard-Angebote
- [ ] **Automated Follow-ups** - Lead-Nurturing
- [ ] **CRM Integration** - Customer/Contact Synchronisation
- [ ] **Approval Workflows** - Mehrstufige Genehmigungen

---

## Troubleshooting

### Problem: Quote total stimmt nicht

**Lösung:**

```typescript
// Prüfen Sie Rundungsfehler
console.log({
  net_amount,
  tax_amount,
  gross_amount,
  subtotal,
  total_tax,
  total,
});

// Verwenden Sie Math.round für Cent-Genauigkeit
const total = Math.round((subtotal + total_tax) * 100) / 100;
```

### Problem: Lead Score > 100

**Lösung:**

```typescript
// Immer zwischen 0-100 begrenzen
const score = Math.max(0, Math.min(100, rawScore));
```

### Problem: Duplicate Quote Numbers

**Lösung:**

```typescript
// Verwenden Sie Datenbank-Sequenzen oder atomare Increments
// Nicht: Random oder Timestamp-basiert
```

---

## Version History

- **v1.0.0** (2025-12-20):
  - ✅ SalesService mit vollständiger Business Logic
  - ✅ Logger-Integration
  - ✅ Vollständige JSDoc
  - ✅ Zod-Validierung
  - ✅ Error Handling
  - ✅ Umfassende Dokumentation
- **v0.3.0** (2025-12-19): Initial sales module implementation

---

**Letzte Aktualisierung:** 2025-12-20  
**Maintainer:** ERP SteinmetZ Team
