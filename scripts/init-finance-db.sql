-- SPDX-License-Identifier: MIT
-- Finance Module Database Schema Initialization
-- Compatible with SQLite and PostgreSQL

-- ============================================================================
-- CUSTOMERS (DEBITOREN)
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  customer_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  credit_limit REAL,
  payment_terms TEXT,
  current_balance REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- ============================================================================
-- SUPPLIERS (KREDITOREN)
-- ============================================================================

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  supplier_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  payment_terms TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers(email);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- ============================================================================
-- INVOICES
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'EUR',
  tax_amount REAL DEFAULT 0,
  gross_amount REAL NOT NULL,
  status TEXT CHECK(status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- ============================================================================
-- INVOICE ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit_price REAL NOT NULL,
  total REAL NOT NULL,
  tax_rate REAL DEFAULT 19.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  type TEXT CHECK(type IN ('incoming', 'outgoing')),
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'EUR',
  date DATE NOT NULL,
  status TEXT CHECK(status IN ('pending', 'completed', 'failed')),
  invoice_id TEXT,
  customer_id TEXT,
  supplier_id TEXT,
  description TEXT,
  payment_method TEXT,
  reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_supplier ON payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);

-- ============================================================================
-- ACCOUNTS (KONTEN)
-- ============================================================================

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  account_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  category TEXT NOT NULL,
  standard TEXT CHECK(standard IN ('SKR03', 'SKR04', 'IFRS', 'US-GAAP')),
  balance REAL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accounts_number ON accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);
CREATE INDEX IF NOT EXISTS idx_accounts_standard ON accounts(standard);

-- ============================================================================
-- TRANSACTIONS (BUCHUNGEN)
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  transaction_number TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  debit_account TEXT NOT NULL,
  credit_account TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'EUR',
  reference TEXT,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (debit_account) REFERENCES accounts(account_number),
  FOREIGN KEY (credit_account) REFERENCES accounts(account_number)
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_debit ON transactions(debit_account);
CREATE INDEX IF NOT EXISTS idx_transactions_credit ON transactions(credit_account);
CREATE INDEX IF NOT EXISTS idx_transactions_number ON transactions(transaction_number);

-- ============================================================================
-- ASSETS (ANLAGEN)
-- ============================================================================

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  asset_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  acquisition_date DATE NOT NULL,
  acquisition_cost REAL NOT NULL,
  residual_value REAL DEFAULT 0,
  useful_life INTEGER NOT NULL,
  depreciation_method TEXT CHECK(depreciation_method IN ('linear', 'declining', 'performance-based')),
  current_book_value REAL NOT NULL,
  location TEXT,
  cost_center TEXT,
  serial_number TEXT,
  -- Status: active (in use), disposed (scrapped/written off), sold (sold to third party)
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'disposed', 'sold')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assets_number ON assets(asset_number);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);

-- ============================================================================
-- DEPRECIATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS depreciation (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  period DATE NOT NULL,
  amount REAL NOT NULL,
  accumulated_depreciation REAL NOT NULL,
  book_value REAL NOT NULL,
  method TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_depreciation_asset ON depreciation(asset_id);
CREATE INDEX IF NOT EXISTS idx_depreciation_period ON depreciation(period);

-- ============================================================================
-- DUNNING (MAHNUNGEN)
-- ============================================================================

CREATE TABLE IF NOT EXISTS dunning (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  level INTEGER CHECK(level IN (1, 2, 3)),
  sent_date DATETIME NOT NULL,
  due_date DATE NOT NULL,
  amount REAL NOT NULL,
  fee REAL DEFAULT 0,
  status TEXT CHECK(status IN ('sent', 'paid', 'escalated')),
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE INDEX IF NOT EXISTS idx_dunning_invoice ON dunning(invoice_id);
CREATE INDEX IF NOT EXISTS idx_dunning_customer ON dunning(customer_id);
CREATE INDEX IF NOT EXISTS idx_dunning_level ON dunning(level);

-- ============================================================================
-- NUMBER RANGES (NUMMERNKREISE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS number_ranges (
  id TEXT PRIMARY KEY,
  type TEXT CHECK(type IN ('invoice', 'credit_note', 'customer', 'supplier', 'voucher', 'asset')),
  prefix TEXT NOT NULL,
  start_number INTEGER NOT NULL,
  current_number INTEGER NOT NULL,
  end_number INTEGER,
  year INTEGER,
  format TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_number_ranges_type ON number_ranges(type);
CREATE INDEX IF NOT EXISTS idx_number_ranges_year ON number_ranges(year);

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Insert sample chart of accounts (SKR03)
INSERT OR IGNORE INTO accounts (id, account_number, name, type, category, standard, balance) VALUES
  ('acc-1000', '1000', 'Kasse', 'asset', 'current_assets', 'SKR03', 5000.0),
  ('acc-1200', '1200', 'Bank', 'asset', 'current_assets', 'SKR03', 50000.0),
  ('acc-1400', '1400', 'Forderungen aus Lieferungen und Leistungen', 'asset', 'current_assets', 'SKR03', 25000.0),
  ('acc-3300', '3300', 'Verbindlichkeiten aus Lieferungen und Leistungen', 'liability', 'current_liabilities', 'SKR03', 15000.0),
  ('acc-4000', '4000', 'Wareneingang', 'expense', 'cost_of_goods', 'SKR03', 0),
  ('acc-8400', '8400', 'Erlöse 19% USt', 'revenue', 'sales', 'SKR03', 0);

-- Insert sample customers
INSERT OR IGNORE INTO customers (id, customer_id, name, email, phone, address, credit_limit, payment_terms) VALUES
  ('cust-1', 'C001', 'ABC GmbH', 'info@abc-gmbh.de', '+49 30 1234567', 'Hauptstraße 1, 10115 Berlin', 10000, '30 Tage netto'),
  ('cust-2', 'C002', 'XYZ AG', 'kontakt@xyz-ag.de', '+49 89 9876543', 'Leopoldstraße 50, 80802 München', 20000, '30 Tage netto');

-- Insert sample suppliers
INSERT OR IGNORE INTO suppliers (id, supplier_id, name, email, phone, address, payment_terms) VALUES
  ('supp-1', 'S001', 'Supplier GmbH', 'info@supplier.de', '+49 40 1234567', 'Industriestraße 10, 20095 Hamburg', '14 Tage 2% Skonto, 30 Tage netto');

-- Insert sample number ranges
INSERT OR IGNORE INTO number_ranges (id, type, prefix, start_number, current_number, year, format) VALUES
  ('nr-1', 'invoice', 'RE', 1, 1, 2024, 'RE-2024-XXXX'),
  ('nr-2', 'customer', 'K', 1000, 1002, NULL, 'K-XXXX'),
  ('nr-3', 'asset', 'ANL', 1, 1, NULL, 'ANL-XXX');

-- Insert sample asset
-- Note: Book value calculated as: 45000 - (45000-5000)/72 * 30 months = 28333.33
-- Linear depreciation over 72 months, 30 months elapsed since 2022-01-15
INSERT OR IGNORE INTO assets (id, asset_number, name, category, acquisition_date, acquisition_cost, residual_value, useful_life, depreciation_method, current_book_value, status) VALUES
  ('ast-1', 'ANL-001', 'Firmenwagen Mercedes E-Klasse', 'Fahrzeuge', '2022-01-15', 45000.0, 5000.0, 72, 'linear', 28333.33, 'active');

COMMIT;
