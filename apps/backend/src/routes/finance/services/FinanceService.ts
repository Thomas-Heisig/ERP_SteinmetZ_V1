// SPDX-License-Identifier: MIT
// apps/backend/src/routes/finance/services/FinanceService.ts

/**
 * Finance Service
 * Centralized service for all finance-related business logic
 * @module routes/finance/services
 */

import type { Database } from "better-sqlite3";
import { NotFoundError } from "../../error/errors.js";
import { createLogger } from "../../../utils/logger.js";

const logger = createLogger("finance-service");

/**
 * Invoice interface
 */
interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  amount: number;
  currency: string;
  due_date: string;
  status: "draft" | "sent" | "paid" | "overdue";
  sent_at?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Customer interface
 */
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  credit_limit: number;
  payment_terms: string;
  tax_id?: string;
  created_at: string;
}

/**
 * Supplier interface
 */
interface Supplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  payment_terms: string;
  tax_id?: string;
  created_at: string;
}

/**
 * Payment interface
 */
interface Payment {
  id: string;
  type: "incoming" | "outgoing";
  amount: number;
  currency: string;
  date: string;
  invoice_id?: string;
  customer_id?: string;
  supplier_id?: string;
  description?: string;
  status: string;
  created_at: string;
}

/**
 * Transaction interface
 */
interface Transaction {
  id: string;
  date: string;
  description: string;
  debit_account: string;
  credit_account: string;
  amount: number;
  currency: string;
  created_at: string;
}

/**
 * Statistics interface
 */
interface Statistics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  outstandingInvoices: number;
  overdueInvoices: number;
  totalOutstandingAmount: number;
  totalOverdueAmount: number;
}

/**
 * Create Invoice Request interface
 */
interface CreateInvoiceRequest {
  customerId: string;
  customerName: string;
  amount: number;
  currency?: string;
  dueDate: string;
}

/**
 * Update Invoice Request interface
 */
interface UpdateInvoiceRequest {
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  dueDate: string;
}

/**
 * Create Customer Request interface
 */
interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  creditLimit?: number;
  paymentTerms?: string;
  taxId?: string;
}

/**
 * Create Supplier Request interface
 */
interface CreateSupplierRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  paymentTerms?: string;
  taxId?: string;
}

/**
 * Create Payment Request interface
 */
interface CreatePaymentRequest {
  type: "incoming" | "outgoing";
  amount: number;
  currency?: string;
  date: string;
  invoiceId?: string;
  customerId?: string;
  supplierId?: string;
  description?: string;
}

/**
 * Create Transaction Request interface
 */
interface CreateTransactionRequest {
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  currency?: string;
}

/**
 * Finance Service Class
 * Handles all financial operations including invoices, customers, payments, and accounting
 */
export class FinanceService {
  constructor(private db: Database) {}

  // ============================================================================
  // INVOICES
  // ============================================================================

  /**
   * Get all invoices with optional filters
   */
  async getAllInvoices(filters?: {
    status?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Invoice[]> {
    let query = "SELECT * FROM invoices WHERE 1=1";
    const params: (string | number)[] = [];

    if (filters?.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }
    if (filters?.customerId) {
      query += " AND customer_id = ?";
      params.push(filters.customerId);
    }
    if (filters?.startDate) {
      query += " AND created_at >= ?";
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      query += " AND created_at <= ?";
      params.push(filters.endDate);
    }

    const invoices = this.db.prepare(query).all(...params) as Invoice[];
    logger.info({ count: invoices.length, filters }, "Invoices retrieved");
    return invoices;
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id: string): Promise<Invoice> {
    const invoice = this.db
      .prepare("SELECT * FROM invoices WHERE id = ?")
      .get(id) as Invoice | undefined;

    if (!invoice) {
      throw new NotFoundError("Invoice not found", { id });
    }

    logger.info({ id }, "Invoice retrieved");
    return invoice;
  }

  /**
   * Create a new invoice
   */
  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    const id = `inv-${Date.now()}`;
    const invoiceNumber = this.generateInvoiceNumber();

    this.db
      .prepare(
        `INSERT INTO invoices (id, invoice_number, customer_id, customer_name, amount, currency, due_date, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', datetime('now'))`,
      )
      .run(
        id,
        invoiceNumber,
        data.customerId,
        data.customerName,
        data.amount,
        data.currency || "EUR",
        data.dueDate,
      );

    logger.info({ id, invoiceNumber }, "Invoice created");
    return this.getInvoiceById(id);
  }

  /**
   * Update an invoice
   */
  async updateInvoice(id: string, data: UpdateInvoiceRequest): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id);

    if (invoice.status !== "draft") {
      throw new Error("Only draft invoices can be updated");
    }

    this.db
      .prepare(
        `UPDATE invoices 
         SET customer_id = ?, customer_name = ?, amount = ?, currency = ?, due_date = ?, updated_at = datetime('now')
         WHERE id = ?`,
      )
      .run(
        data.customerId,
        data.customerName,
        data.amount,
        data.currency,
        data.dueDate,
        id,
      );

    logger.info({ id }, "Invoice updated");
    return this.getInvoiceById(id);
  }

  /**
   * Delete an invoice
   */
  async deleteInvoice(id: string): Promise<void> {
    const invoice = await this.getInvoiceById(id);

    if (invoice.status !== "draft") {
      throw new Error("Only draft invoices can be deleted");
    }

    this.db.prepare("DELETE FROM invoices WHERE id = ?").run(id);
    logger.info({ id }, "Invoice deleted");
  }

  /**
   * Send an invoice to customer
   */
  async sendInvoice(id: string): Promise<void> {
    const invoice = await this.getInvoiceById(id);

    if (invoice.status !== "draft") {
      throw new Error("Only draft invoices can be sent");
    }

    this.db
      .prepare(
        "UPDATE invoices SET status = 'sent', sent_at = datetime('now') WHERE id = ?",
      )
      .run(id);

    logger.info({ id }, "Invoice sent");
  }

  /**
   * Generate invoice number
   */
  private generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const count = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM invoices WHERE invoice_number LIKE ?",
      )
      .get(`RE-${year}-%`) as { count: number };

    return `RE-${year}-${String(count.count + 1).padStart(3, "0")}`;
  }

  // ============================================================================
  // CUSTOMERS
  // ============================================================================

  /**
   * Get all customers
   */
  async getAllCustomers(filters?: { search?: string }): Promise<Customer[]> {
    let query = "SELECT * FROM customers WHERE 1=1";
    const params: string[] = [];

    if (filters?.search) {
      query += " AND (name LIKE ? OR email LIKE ?)";
      const searchParam = `%${filters.search}%`;
      params.push(searchParam, searchParam);
    }

    const customers = this.db.prepare(query).all(...params) as Customer[];
    logger.info({ count: customers.length }, "Customers retrieved");
    return customers;
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(id: string): Promise<Customer> {
    const customer = this.db
      .prepare("SELECT * FROM customers WHERE id = ?")
      .get(id) as Customer | undefined;

    if (!customer) {
      throw new NotFoundError("Customer not found", { id });
    }

    logger.info({ id }, "Customer retrieved");
    return customer;
  }

  /**
   * Create a new customer
   */
  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    const id = `C${String(Date.now()).slice(-6)}`;

    this.db
      .prepare(
        `INSERT INTO customers (id, name, email, phone, address, credit_limit, payment_terms, tax_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      )
      .run(
        id,
        data.name,
        data.email,
        data.phone || null,
        data.address || null,
        data.creditLimit || 0,
        data.paymentTerms || "30 Tage netto",
        data.taxId || null,
      );

    logger.info({ id, name: data.name }, "Customer created");
    return this.getCustomerById(id);
  }

  // ============================================================================
  // SUPPLIERS
  // ============================================================================

  /**
   * Get all suppliers
   */
  async getAllSuppliers(filters?: { search?: string }): Promise<Supplier[]> {
    let query = "SELECT * FROM suppliers WHERE 1=1";
    const params: string[] = [];

    if (filters?.search) {
      query += " AND (name LIKE ? OR email LIKE ?)";
      const searchParam = `%${filters.search}%`;
      params.push(searchParam, searchParam);
    }

    const suppliers = this.db.prepare(query).all(...params) as Supplier[];
    logger.info({ count: suppliers.length }, "Suppliers retrieved");
    return suppliers;
  }

  /**
   * Create a new supplier
   */
  async createSupplier(data: CreateSupplierRequest): Promise<Supplier> {
    const id = `S${String(Date.now()).slice(-6)}`;

    this.db
      .prepare(
        `INSERT INTO suppliers (id, name, email, phone, address, payment_terms, tax_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      )
      .run(
        id,
        data.name,
        data.email,
        data.phone || null,
        data.address || null,
        data.paymentTerms || "30 Tage netto",
        data.taxId || null,
      );

    logger.info({ id, name: data.name }, "Supplier created");
    return this.db.prepare("SELECT * FROM suppliers WHERE id = ?").get(id) as Supplier;
  }

  // ============================================================================
  // PAYMENTS
  // ============================================================================

  /**
   * Get all payments
   */
  async getAllPayments(filters?: {
    type?: string;
    status?: string;
  }): Promise<Payment[]> {
    let query = "SELECT * FROM payments WHERE 1=1";
    const params: string[] = [];

    if (filters?.type) {
      query += " AND type = ?";
      params.push(filters.type);
    }
    if (filters?.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }

    const payments = this.db.prepare(query).all(...params) as Payment[];
    logger.info({ count: payments.length }, "Payments retrieved");
    return payments;
  }

  /**
   * Create a new payment
   */
  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    const id = `P${String(Date.now()).slice(-6)}`;

    this.db
      .prepare(
        `INSERT INTO payments (id, type, amount, currency, date, invoice_id, customer_id, supplier_id, description, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', datetime('now'))`,
      )
      .run(
        id,
        data.type,
        data.amount,
        data.currency || "EUR",
        data.date,
        data.invoiceId || null,
        data.customerId || null,
        data.supplierId || null,
        data.description || null,
      );

    logger.info({ id, type: data.type, amount: data.amount }, "Payment created");
    return this.db.prepare("SELECT * FROM payments WHERE id = ?").get(id) as Payment;
  }

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================

  /**
   * Get all transactions
   */
  async getAllTransactions(filters?: {
    accountId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> {
    let query = "SELECT * FROM transactions WHERE 1=1";
    const params: string[] = [];

    if (filters?.accountId) {
      query += " AND (debit_account = ? OR credit_account = ?)";
      params.push(filters.accountId, filters.accountId);
    }
    if (filters?.startDate) {
      query += " AND date >= ?";
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      query += " AND date <= ?";
      params.push(filters.endDate);
    }

    const transactions = this.db.prepare(query).all(...params) as Transaction[];
    logger.info({ count: transactions.length }, "Transactions retrieved");
    return transactions;
  }

  /**
   * Create a new transaction
   */
  async createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
    const id = `T${String(Date.now()).slice(-6)}`;

    this.db
      .prepare(
        `INSERT INTO transactions (id, date, description, debit_account, credit_account, amount, currency, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      )
      .run(
        id,
        data.date,
        data.description,
        data.debitAccount,
        data.creditAccount,
        data.amount,
        data.currency || "EUR",
      );

    logger.info({ id, amount: data.amount }, "Transaction created");
    return this.db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as Transaction;
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  /**
   * Get financial statistics
   */
  async getStatistics(): Promise<Statistics> {
    const stats: Statistics = {
      totalRevenue: this.calculateTotalRevenue(),
      totalExpenses: this.calculateTotalExpenses(),
      netIncome: 0,
      outstandingInvoices: this.countOutstandingInvoices(),
      overdueInvoices: this.countOverdueInvoices(),
      totalOutstandingAmount: this.calculateOutstandingAmount(),
      totalOverdueAmount: this.calculateOverdueAmount(),
    };

    stats.netIncome = stats.totalRevenue - stats.totalExpenses;

    logger.info("Statistics calculated");
    return stats;
  }

  private calculateTotalRevenue(): number {
    const result = this.db
      .prepare(
        "SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid'",
      )
      .get() as { total: number };
    return result.total;
  }

  private calculateTotalExpenses(): number {
    const result = this.db
      .prepare(
        "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE type = 'outgoing'",
      )
      .get() as { total: number };
    return result.total;
  }

  private countOutstandingInvoices(): number {
    const result = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM invoices WHERE status IN ('sent', 'overdue')",
      )
      .get() as { count: number };
    return result.count;
  }

  private countOverdueInvoices(): number {
    const result = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM invoices WHERE status = 'overdue'",
      )
      .get() as { count: number };
    return result.count;
  }

  private calculateOutstandingAmount(): number {
    const result = this.db
      .prepare(
        "SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status IN ('sent', 'overdue')",
      )
      .get() as { total: number };
    return result.total;
  }

  private calculateOverdueAmount(): number {
    const result = this.db
      .prepare(
        "SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'overdue'",
      )
      .get() as { total: number };
    return result.total;
  }
}
