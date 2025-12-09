# Finance-Modul Entwicklungsanleitung

**Status**: 🟡 In Entwicklung  
**Version**: 0.1.0  
**Letzte Aktualisierung**: 9. Dezember 2025

## Übersicht

Das Finance-Modul verwaltet alle finanziellen Transaktionen, Rechnungen, Zahlungen und Buchhaltung im ERP SteinmetZ System. Diese Anleitung beschreibt die Architektur für deutsche Buchhaltungsstandards (SKR03/SKR04, DATEV, GoBD).

## Funktionsumfang

### Phase 1: Basis-Funktionalität (MVP)

- ✅ Rechnungserstellung (Ausgangsrechnungen)
- ✅ Rechnungsverwaltung (Status-Tracking)
- ✅ Zahlungserfassung
- [ ] Eingangsrechnungen
- [ ] Nummernkreise mit Prefix/Suffix

### Phase 2: Compliance & Export

- [ ] XRechnung-Export (E-Invoicing Standard)
- [ ] ZUGFeRD-Integration (PDF mit eingebetteter XML)
- [ ] DATEV-Export (Buchungsdaten)
- [ ] GoBD-konforme Archivierung

### Phase 3: Erweiterte Funktionen

- [ ] Mahnwesen (automatische Mahnläufe)
- [ ] Kontenrahmen SKR03/SKR04
- [ ] Umsatzsteuer-Voranmeldung
- [ ] Kassenbuch

## Datenmodell

### Rechnungen (invoices)

```typescript
interface Invoice {
  id: string;                    // UUID
  invoice_number: string;        // z.B. "2025-001"
  
  // Typ und Status
  type: 'outgoing' | 'incoming'; // Ausgangs- oder Eingangsrechnung
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'void';
  
  // Datumsangaben
  invoice_date: string;          // ISO 8601
  due_date: string;              // Fälligkeitsdatum
  service_date?: string;         // Leistungsdatum
  
  // Kunde/Lieferant
  customer_id?: string;
  supplier_id?: string;
  
  // Rechnungsadresse
  billing_address: {
    name: string;
    company?: string;
    street: string;
    postal_code: string;
    city: string;
    country: string;             // ISO 3166-1 alpha-2
    vat_id?: string;             // USt-IdNr.
  };
  
  // Positionen
  line_items: InvoiceLineItem[];
  
  // Beträge
  subtotal: number;              // Nettobetrag
  tax_total: number;             // MwSt-Betrag
  total: number;                 // Bruttobetrag
  currency: 'EUR' | 'USD' | 'GBP';
  
  // Zahlungsinformationen
  payment_terms?: string;        // z.B. "14 Tage netto"
  payment_method?: 'bank_transfer' | 'card' | 'cash' | 'direct_debit';
  
  // Notizen
  notes?: string;
  internal_notes?: string;
  
  // Referenzen
  order_id?: string;
  quote_id?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

interface InvoiceLineItem {
  id: string;
  position: number;              // Sortierung
  
  // Produkt/Dienstleistung
  description: string;
  article_number?: string;
  
  // Mengen und Preise
  quantity: number;
  unit: string;                  // z.B. "Stück", "kg", "Stunden"
  unit_price: number;            // Einzelpreis (netto)
  
  // Steuer
  tax_rate: number;              // z.B. 19.0 für 19%
  tax_amount: number;
  
  // Summen
  subtotal: number;              // quantity * unit_price
  total: number;                 // subtotal + tax_amount
  
  // Optional: Rabatte
  discount_percent?: number;
  discount_amount?: number;
}
```

### Zahlungen (payments)

```typescript
interface Payment {
  id: string;
  invoice_id: string;
  
  amount: number;
  currency: 'EUR' | 'USD' | 'GBP';
  
  payment_date: string;          // ISO 8601
  payment_method: 'bank_transfer' | 'card' | 'cash' | 'direct_debit';
  
  // Bankdaten (für Überweisung)
  bank_account?: {
    iban: string;
    bic?: string;
    account_holder: string;
    bank_name?: string;
  };
  
  // Referenzen
  reference: string;             // Verwendungszweck
  transaction_id?: string;       // Externe Transaktions-ID
  
  // Status
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  
  notes?: string;
  
  created_at: string;
  created_by: string;
}
```

### Buchungen (accounting_entries)

```typescript
interface AccountingEntry {
  id: string;
  entry_date: string;            // Buchungsdatum
  document_date: string;         // Belegdatum
  
  // Buchungstyp
  entry_type: 'invoice' | 'payment' | 'manual' | 'opening_balance';
  
  // Referenzen
  invoice_id?: string;
  payment_id?: string;
  
  // Beleg
  document_number: string;
  document_type: string;         // "RE" = Rechnung, "ER" = Eingangsrechnung
  
  // Konten (Soll/Haben)
  debit_account: string;         // SKR03/04 Kontonummer
  credit_account: string;
  
  amount: number;
  currency: 'EUR';
  
  // Steuer
  tax_code?: string;             // z.B. "V19" = Vorsteuer 19%
  tax_rate?: number;
  tax_amount?: number;
  
  description: string;
  
  // GoBD
  locked: boolean;               // Unveränderbar nach Abschluss
  locked_at?: string;
  locked_by?: string;
  
  created_at: string;
  created_by: string;
}
```

### Kontenplan (chart_of_accounts)

```typescript
interface Account {
  id: string;
  account_number: string;        // z.B. "1200" (SKR03)
  name: string;                  // z.B. "Bank"
  
  // Kontoart
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  
  // Hierarchie
  parent_account?: string;
  level: number;                 // 0 = Hauptkonto, 1+ = Unterkonten
  
  // Standard
  framework: 'SKR03' | 'SKR04' | 'custom';
  
  // Status
  active: boolean;
  
  created_at: string;
  updated_at: string;
}
```

## Datenbankschema

### SQLite Schema

```sql
-- Invoices Table
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  
  type TEXT NOT NULL CHECK(type IN ('outgoing', 'incoming')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'void')),
  
  invoice_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  service_date TEXT,
  
  customer_id TEXT,
  supplier_id TEXT,
  billing_address TEXT NOT NULL,  -- JSON
  
  line_items TEXT NOT NULL,       -- JSON array
  
  subtotal REAL NOT NULL,
  tax_total REAL NOT NULL,
  total REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  
  payment_terms TEXT,
  payment_method TEXT,
  
  notes TEXT,
  internal_notes TEXT,
  
  order_id TEXT,
  quote_id TEXT,
  
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL,
  updated_by TEXT,
  
  CHECK(json_valid(billing_address)),
  CHECK(json_valid(line_items)),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Payments Table
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  
  payment_date TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('bank_transfer', 'card', 'cash', 'direct_debit')),
  
  bank_account TEXT,              -- JSON
  reference TEXT NOT NULL,
  transaction_id TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
  
  notes TEXT,
  
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL,
  
  CHECK(json_valid(bank_account)),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- Accounting Entries Table
CREATE TABLE accounting_entries (
  id TEXT PRIMARY KEY,
  entry_date TEXT NOT NULL,
  document_date TEXT NOT NULL,
  
  entry_type TEXT NOT NULL CHECK(entry_type IN ('invoice', 'payment', 'manual', 'opening_balance')),
  
  invoice_id TEXT,
  payment_id TEXT,
  
  document_number TEXT NOT NULL,
  document_type TEXT NOT NULL,
  
  debit_account TEXT NOT NULL,
  credit_account TEXT NOT NULL,
  
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  
  tax_code TEXT,
  tax_rate REAL,
  tax_amount REAL,
  
  description TEXT NOT NULL,
  
  locked INTEGER NOT NULL DEFAULT 0,
  locked_at TEXT,
  locked_by TEXT,
  
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL,
  
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- Chart of Accounts Table
CREATE TABLE chart_of_accounts (
  id TEXT PRIMARY KEY,
  account_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  
  type TEXT NOT NULL CHECK(type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  
  parent_account TEXT,
  level INTEGER NOT NULL DEFAULT 0,
  
  framework TEXT NOT NULL DEFAULT 'SKR03' CHECK(framework IN ('SKR03', 'SKR04', 'custom')),
  
  active INTEGER NOT NULL DEFAULT 1,
  
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_account) REFERENCES chart_of_accounts(id)
);

-- Indexes
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

CREATE INDEX idx_accounting_date ON accounting_entries(entry_date);
CREATE INDEX idx_accounting_document ON accounting_entries(document_number);
CREATE INDEX idx_accounting_locked ON accounting_entries(locked);
```

## API-Endpunkte

### Rechnungen

```typescript
// GET /api/finance/invoices
router.get('/invoices', asyncHandler(async (req, res) => {
  const { 
    type,            // 'outgoing' | 'incoming'
    status,
    customer_id,
    from_date,
    to_date,
    search,          // Rechnungsnummer oder Kundenname
    page = 1,
    per_page = 20
  } = req.query;
  
  const invoices = await financeService.getInvoices({
    type, status, customer_id, from_date, to_date, search,
    page: Number(page), per_page: Number(per_page)
  });
  
  res.json({ success: true, data: invoices });
}));

// POST /api/finance/invoices
router.post('/invoices',
  validateRequest(createInvoiceSchema),
  asyncHandler(async (req, res) => {
    const invoiceData = req.body;
    const invoice = await financeService.createInvoice(invoiceData, req.user.id);
    
    res.status(201).json({ success: true, data: invoice });
  })
);

// GET /api/finance/invoices/:id/pdf
router.get('/invoices/:id/pdf', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const pdfBuffer = await financeService.generateInvoicePDF(id);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="rechnung-${id}.pdf"`);
  res.send(pdfBuffer);
}));

// POST /api/finance/invoices/:id/send
router.post('/invoices/:id/send', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, subject, message } = req.body;
  
  await financeService.sendInvoiceEmail(id, { email, subject, message });
  
  res.json({ success: true, message: 'Invoice sent' });
}));
```

### Zahlungen

```typescript
// POST /api/finance/payments
router.post('/payments',
  validateRequest(paymentSchema),
  asyncHandler(async (req, res) => {
    const paymentData = req.body;
    const payment = await financeService.recordPayment(paymentData, req.user.id);
    
    res.status(201).json({ success: true, data: payment });
  })
);

// GET /api/finance/invoices/:id/payments
router.get('/invoices/:id/payments', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payments = await financeService.getInvoicePayments(id);
  
  res.json({ success: true, data: payments });
}));
```

### Export

```typescript
// GET /api/finance/export/xrechnung/:id
router.get('/export/xrechnung/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const xmlBuffer = await financeService.exportXRechnung(id);
  
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Disposition', `attachment; filename="xrechnung-${id}.xml"`);
  res.send(xmlBuffer);
}));

// GET /api/finance/export/datev
router.get('/export/datev', asyncHandler(async (req, res) => {
  const { from_date, to_date } = req.query;
  const csvBuffer = await financeService.exportDATEV({ from_date, to_date });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="datev-export.csv"`);
  res.send(csvBuffer);
}));
```

## Validation Schemas

```typescript
import { z } from 'zod';

const addressSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  street: z.string().min(1),
  postal_code: z.string().regex(/^\d{5}$/),
  city: z.string().min(1),
  country: z.string().length(2),
  vat_id: z.string().regex(/^DE\d{9}$/).optional(),
});

const lineItemSchema = z.object({
  description: z.string().min(1),
  article_number: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  unit_price: z.number().nonnegative(),
  tax_rate: z.number().min(0).max(100),
  discount_percent: z.number().min(0).max(100).optional(),
});

export const createInvoiceSchema = z.object({
  type: z.enum(['outgoing', 'incoming']),
  invoice_date: z.string().datetime(),
  due_date: z.string().datetime(),
  service_date: z.string().datetime().optional(),
  customer_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid().optional(),
  billing_address: addressSchema,
  line_items: z.array(lineItemSchema).min(1),
  payment_terms: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export const paymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_date: z.string().datetime(),
  payment_method: z.enum(['bank_transfer', 'card', 'cash', 'direct_debit']),
  reference: z.string().min(1),
  transaction_id: z.string().optional(),
});
```

## Service Layer

```typescript
// apps/backend/src/services/financeService.ts

export class FinanceService {
  /**
   * Erstellt eine neue Rechnung und generiert automatisch eine Rechnungsnummer
   */
  async createInvoice(data: Partial<Invoice>, userId: string): Promise<Invoice> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Rechnungsnummer generieren
    const invoiceNumber = await this.generateInvoiceNumber(data.type!);
    
    // Beträge berechnen
    const { subtotal, tax_total, total } = this.calculateInvoiceTotals(data.line_items!);
    
    const invoice: Invoice = {
      id,
      invoice_number: invoiceNumber,
      ...data,
      subtotal,
      tax_total,
      total,
      status: 'draft',
      created_at: now,
      updated_at: now,
      created_by: userId,
    } as Invoice;
    
    await dbService.insert('invoices', {
      id,
      invoice_number: invoiceNumber,
      type: invoice.type,
      status: invoice.status,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      service_date: invoice.service_date,
      customer_id: invoice.customer_id,
      supplier_id: invoice.supplier_id,
      billing_address: JSON.stringify(invoice.billing_address),
      line_items: JSON.stringify(invoice.line_items),
      subtotal: invoice.subtotal,
      tax_total: invoice.tax_total,
      total: invoice.total,
      currency: invoice.currency || 'EUR',
      payment_terms: invoice.payment_terms,
      notes: invoice.notes,
      internal_notes: invoice.internal_notes,
      created_at: now,
      updated_at: now,
      created_by: userId,
    });
    
    // Buchungssatz erstellen
    await this.createAccountingEntry(invoice);
    
    return invoice;
  }
  
  /**
   * Generiert fortlaufende Rechnungsnummer
   */
  private async generateInvoiceNumber(type: 'outgoing' | 'incoming'): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = type === 'outgoing' ? 'RE' : 'ER';
    
    // Höchste Nummer des Jahres ermitteln
    const lastInvoice = await dbService.query(`
      SELECT invoice_number 
      FROM invoices 
      WHERE invoice_number LIKE '${prefix}-${year}-%'
      ORDER BY invoice_number DESC 
      LIMIT 1
    `);
    
    let nextNumber = 1;
    if (lastInvoice.length > 0) {
      const match = lastInvoice[0].invoice_number.match(/-(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }
    
    return `${prefix}-${year}-${String(nextNumber).padStart(5, '0')}`;
  }
  
  /**
   * Berechnet Summen einer Rechnung
   */
  private calculateInvoiceTotals(lineItems: InvoiceLineItem[]): {
    subtotal: number;
    tax_total: number;
    total: number;
  } {
    let subtotal = 0;
    let tax_total = 0;
    
    for (const item of lineItems) {
      const itemSubtotal = item.quantity * item.unit_price;
      const discount = item.discount_amount || 
        (item.discount_percent ? itemSubtotal * item.discount_percent / 100 : 0);
      const netAmount = itemSubtotal - discount;
      const taxAmount = netAmount * item.tax_rate / 100;
      
      subtotal += netAmount;
      tax_total += taxAmount;
    }
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax_total: Math.round(tax_total * 100) / 100,
      total: Math.round((subtotal + tax_total) * 100) / 100,
    };
  }
  
  /**
   * Erstellt Buchungssatz für Rechnung
   */
  private async createAccountingEntry(invoice: Invoice): Promise<void> {
    // Für Ausgangsrechnung: Forderung (Soll) an Umsatzerlöse (Haben)
    if (invoice.type === 'outgoing') {
      await dbService.insert('accounting_entries', {
        id: crypto.randomUUID(),
        entry_date: invoice.invoice_date,
        document_date: invoice.invoice_date,
        entry_type: 'invoice',
        invoice_id: invoice.id,
        document_number: invoice.invoice_number,
        document_type: 'RE',
        debit_account: '1400',  // Forderungen (SKR03)
        credit_account: '8400', // Erlöse 19% USt (SKR03)
        amount: invoice.total,
        currency: invoice.currency,
        tax_code: 'V19',
        tax_rate: 19.0,
        tax_amount: invoice.tax_total,
        description: `Rechnung ${invoice.invoice_number}`,
        locked: false,
        created_at: new Date().toISOString(),
        created_by: invoice.created_by,
      });
    }
  }
  
  /**
   * Erfasst eine Zahlung und aktualisiert Rechnungsstatus
   */
  async recordPayment(data: Partial<Payment>, userId: string): Promise<Payment> {
    const invoice = await this.getInvoice(data.invoice_id!);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const payment: Payment = {
      id,
      ...data,
      status: 'completed',
      created_at: now,
      created_by: userId,
    } as Payment;
    
    await dbService.insert('payments', {
      id,
      invoice_id: payment.invoice_id,
      amount: payment.amount,
      currency: payment.currency || 'EUR',
      payment_date: payment.payment_date,
      payment_method: payment.payment_method,
      bank_account: payment.bank_account ? JSON.stringify(payment.bank_account) : null,
      reference: payment.reference,
      transaction_id: payment.transaction_id,
      status: payment.status,
      notes: payment.notes,
      created_at: now,
      created_by: userId,
    });
    
    // Rechnungsstatus aktualisieren
    const totalPaid = await this.getTotalPaid(invoice.id);
    if (totalPaid >= invoice.total) {
      await this.updateInvoiceStatus(invoice.id, 'paid');
    }
    
    // Buchungssatz für Zahlung
    await this.createPaymentAccountingEntry(invoice, payment);
    
    return payment;
  }
  
  /**
   * PDF-Generierung (mit Bibliothek wie PDFKit oder Puppeteer)
   */
  async generateInvoicePDF(invoiceId: string): Promise<Buffer> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    // TODO: PDF-Generierung implementieren
    // - PDFKit: Low-level, volle Kontrolle
    // - Puppeteer: HTML → PDF, einfacher für Layout
    // - pdfmake: Deklarativ, mittlere Komplexität
    
    return Buffer.from('PDF placeholder');
  }
}

export const financeService = new FinanceService();
```

## XRechnung Export

XRechnung ist der deutsche E-Invoicing-Standard (basiert auf EN 16931):

```typescript
async exportXRechnung(invoiceId: string): Promise<Buffer> {
  const invoice = await this.getInvoice(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }
  
  // XML-Struktur nach XRechnung-Standard
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice 
  xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  
  <rsm:ExchangedDocument>
    <ram:ID>${invoice.invoice_number}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${invoice.invoice_date.replace(/-/g, '')}</udt:DateTimeString>
    </ram:IssueDateTime>
  </rsm:ExchangedDocument>
  
  <!-- Weitere XML-Struktur... -->
</rsm:CrossIndustryInvoice>`;
  
  return Buffer.from(xml, 'utf-8');
}
```

## DATEV Export

DATEV-Schnittstelle für Steuerberater:

```typescript
async exportDATEV(options: { from_date: string; to_date: string }): Promise<Buffer> {
  const entries = await this.getAccountingEntries(options);
  
  // DATEV CSV-Format
  const header = [
    'Umsatz (ohne Soll/Haben-Kz)',
    'Soll/Haben-Kennzeichen',
    'WKZ Umsatz',
    'Kurs',
    'Basis-Umsatz',
    'WKZ Basis-Umsatz',
    'Konto',
    'Gegenkonto (ohne BU-Schlüssel)',
    'BU-Schlüssel',
    'Belegdatum',
    'Belegfeld 1',
    'Belegfeld 2',
    'Buchungstext',
    // ... weitere Felder
  ].join(';');
  
  const rows = entries.map(entry => [
    entry.amount.toFixed(2).replace('.', ','),
    'S', // Soll
    'EUR',
    '',
    '',
    '',
    entry.debit_account,
    entry.credit_account,
    entry.tax_code || '',
    entry.document_date.replace(/-/g, ''),
    entry.document_number,
    '',
    entry.description,
  ].join(';'));
  
  const csv = [header, ...rows].join('\n');
  return Buffer.from(csv, 'utf-8');
}
```

## Best Practices

### 1. GoBD-Konformität

- **Unveränderbarkeit**: Gebuchte Einträge dürfen nicht mehr geändert werden
- **Vollständigkeit**: Alle Belege müssen erfasst sein
- **Nachvollziehbarkeit**: Audit-Trail für alle Änderungen
- **Archivierung**: 10 Jahre Aufbewahrungspflicht

### 2. Nummernkreise

- Fortlaufende, lückenlose Nummernvergabe
- Pro Geschäftsjahr separate Nummerierung
- Prefix für Rechnungstyp (RE, ER, GU für Gutschrift)

### 3. Stornierung statt Löschen

```typescript
async cancelInvoice(invoiceId: string, reason: string): Promise<Invoice> {
  const invoice = await this.getInvoice(invoiceId);
  
  // Status auf "cancelled" setzen
  await this.updateInvoiceStatus(invoiceId, 'cancelled');
  
  // Stornobuchung erstellen
  await this.createCancellationEntry(invoice, reason);
  
  return invoice;
}
```

### 4. Mahnwesen

```typescript
async checkOverdueInvoices(): Promise<void> {
  const today = new Date().toISOString();
  
  const overdueInvoices = await dbService.query(`
    SELECT * FROM invoices
    WHERE status = 'sent'
      AND due_date < ?
  `, [today]);
  
  for (const invoice of overdueInvoices) {
    await this.updateInvoiceStatus(invoice.id, 'overdue');
    await this.createReminder(invoice);
  }
}
```

## Weitere Schritte

- [ ] PDF-Generierung mit PDFKit oder Puppeteer
- [ ] Email-Versand von Rechnungen
- [ ] XRechnung XML-Generator
- [ ] ZUGFeRD PDF mit eingebetteter XML
- [ ] DATEV-Export-Format
- [ ] Automatisches Mahnwesen
- [ ] SKR03/04 Kontenrahmen
- [ ] Kassenbuch-Funktionen

---

**Status**: In Entwicklung  
**Nächster Schritt**: CRUD-Operationen für Rechnungen implementieren  
**Verantwortlich**: Backend Team
