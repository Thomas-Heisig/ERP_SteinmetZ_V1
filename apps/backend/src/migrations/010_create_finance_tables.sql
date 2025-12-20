-- SPDX-License-Identifier: MIT
-- Migration: Create Finance tables
-- Description: Creates tables for invoices, transactions, accounts, and financial data

-- Chart of accounts table
CREATE TABLE IF NOT EXISTS finance_accounts (
  id TEXT PRIMARY KEY,
  account_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  category TEXT,
  parent_id TEXT,
  balance REAL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  is_active BOOLEAN DEFAULT 1,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES finance_accounts(id) ON DELETE SET NULL
);

-- Invoices table
CREATE TABLE IF NOT EXISTS finance_invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  invoice_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  total_amount REAL NOT NULL CHECK (total_amount >= 0),
  tax_amount REAL DEFAULT 0 CHECK (tax_amount >= 0),
  discount_amount REAL DEFAULT 0 CHECK (discount_amount >= 0),
  paid_amount REAL DEFAULT 0 CHECK (paid_amount >= 0),
  balance REAL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially_paid')) DEFAULT 'draft',
  payment_terms TEXT,
  payment_method TEXT,
  currency TEXT DEFAULT 'EUR',
  notes TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Invoice line items table
CREATE TABLE IF NOT EXISTS finance_invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  item_id TEXT,
  description TEXT NOT NULL,
  quantity REAL NOT NULL CHECK (quantity > 0),
  unit_price REAL NOT NULL CHECK (unit_price >= 0),
  tax_rate REAL DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  discount REAL DEFAULT 0 CHECK (discount >= 0),
  total REAL NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (invoice_id) REFERENCES finance_invoices(id) ON DELETE CASCADE
);

-- Transactions table (general ledger)
CREATE TABLE IF NOT EXISTS finance_transactions (
  id TEXT PRIMARY KEY,
  transaction_date TEXT NOT NULL,
  account_id TEXT NOT NULL,
  debit REAL DEFAULT 0 CHECK (debit >= 0),
  credit REAL DEFAULT 0 CHECK (credit >= 0),
  description TEXT NOT NULL,
  reference TEXT,
  reference_type TEXT CHECK (reference_type IN ('invoice', 'payment', 'journal', 'transfer', 'adjustment')),
  category TEXT,
  posted BOOLEAN DEFAULT 0,
  posted_at TEXT,
  posted_by TEXT,
  reversed BOOLEAN DEFAULT 0,
  reversed_at TEXT,
  reversed_by TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES finance_accounts(id) ON DELETE RESTRICT
);

-- Payments table
CREATE TABLE IF NOT EXISTS finance_payments (
  id TEXT PRIMARY KEY,
  invoice_id TEXT,
  payment_date TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'debit_card', 'check', 'paypal', 'other')),
  reference TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'completed',
  notes TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (invoice_id) REFERENCES finance_invoices(id) ON DELETE SET NULL
);

-- Budget table
CREATE TABLE IF NOT EXISTS finance_budgets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account_id TEXT,
  department TEXT,
  fiscal_year INTEGER NOT NULL,
  period TEXT,
  budgeted_amount REAL NOT NULL CHECK (budgeted_amount >= 0),
  spent_amount REAL DEFAULT 0 CHECK (spent_amount >= 0),
  remaining_amount REAL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'exceeded')) DEFAULT 'draft',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES finance_accounts(id) ON DELETE SET NULL
);

-- Cost centers table
CREATE TABLE IF NOT EXISTS finance_cost_centers (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  manager TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Bank accounts table
CREATE TABLE IF NOT EXISTS finance_bank_accounts (
  id TEXT PRIMARY KEY,
  account_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  iban TEXT,
  bic TEXT,
  currency TEXT DEFAULT 'EUR',
  balance REAL DEFAULT 0,
  account_type TEXT CHECK (account_type IN ('checking', 'savings', 'credit', 'investment')),
  is_active BOOLEAN DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Bank transactions/statements table
CREATE TABLE IF NOT EXISTS finance_bank_transactions (
  id TEXT PRIMARY KEY,
  bank_account_id TEXT NOT NULL,
  transaction_date TEXT NOT NULL,
  value_date TEXT,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  beneficiary TEXT,
  reference TEXT,
  transaction_type TEXT CHECK (transaction_type IN ('debit', 'credit')),
  balance REAL,
  reconciled BOOLEAN DEFAULT 0,
  reconciled_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (bank_account_id) REFERENCES finance_bank_accounts(id) ON DELETE CASCADE
);

-- Tax rates table
CREATE TABLE IF NOT EXISTS finance_tax_rates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rate REAL NOT NULL CHECK (rate >= 0 AND rate <= 100),
  country TEXT DEFAULT 'DE',
  type TEXT CHECK (type IN ('VAT', 'sales_tax', 'income_tax', 'corporate_tax', 'other')),
  is_active BOOLEAN DEFAULT 1,
  effective_from TEXT,
  effective_to TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Fiscal periods table
CREATE TABLE IF NOT EXISTS finance_fiscal_periods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  fiscal_year INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed', 'locked')) DEFAULT 'open',
  closed_at TEXT,
  closed_by TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_finance_accounts_type ON finance_accounts(type);
CREATE INDEX IF NOT EXISTS idx_finance_accounts_parent ON finance_accounts(parent_id);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_customer ON finance_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_status ON finance_invoices(status);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_date ON finance_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_due_date ON finance_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_finance_invoice_items_invoice ON finance_invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_account ON finance_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_date ON finance_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_posted ON finance_transactions(posted);
CREATE INDEX IF NOT EXISTS idx_finance_payments_invoice ON finance_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_finance_payments_date ON finance_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_finance_budgets_account ON finance_budgets(account_id);
CREATE INDEX IF NOT EXISTS idx_finance_budgets_fiscal_year ON finance_budgets(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_finance_bank_transactions_account ON finance_bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_finance_bank_transactions_date ON finance_bank_transactions(transaction_date);

