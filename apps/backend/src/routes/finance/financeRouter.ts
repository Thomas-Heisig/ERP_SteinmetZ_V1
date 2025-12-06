// SPDX-License-Identifier: MIT
// apps/backend/src/routes/finance/financeRouter.ts

import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "../../types/errors.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import pino from "pino";

const router = Router();
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

// Validation schemas
const invoiceQuerySchema = z.object({
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
  customerId: z.string().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

const createInvoiceSchema = z.object({
  customerId: z.string().min(1),
  customerName: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3).default("EUR"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z
    .array(
      z.object({
        description: z.string(),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
        total: z.number().positive(),
      }),
    )
    .optional(),
});

const customerQuerySchema = z.object({
  search: z.string().optional(),
});

const createCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.number().positive().optional(),
  paymentTerms: z.string().optional(),
  taxId: z.string().optional(),
});

const supplierQuerySchema = z.object({
  search: z.string().optional(),
});

const createSupplierSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  paymentTerms: z.string().optional(),
  taxId: z.string().optional(),
});

const paymentQuerySchema = z.object({
  type: z.enum(["incoming", "outgoing"]).optional(),
  status: z.enum(["pending", "completed", "failed"]).optional(),
});

const createPaymentSchema = z.object({
  type: z.enum(["incoming", "outgoing"]),
  amount: z.number().positive(),
  currency: z.string().length(3).default("EUR"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  invoiceId: z.string().optional(),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  description: z.string().optional(),
});

const transactionQuerySchema = z.object({
  accountId: z.string().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

const createTransactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(1),
  debitAccount: z.string().min(1),
  creditAccount: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3).default("EUR"),
});

/**
 * Finance Module Router
 * Handles invoicing, accounting, payments, and financial reporting
 */

// ============================================================================
// INVOICE MANAGEMENT
// ============================================================================

/**
 * GET /api/finance/invoices
 * Get all invoices with optional filters
 */
router.get(
  "/invoices",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate query parameters
    const validationResult = invoiceQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid query parameters",
        validationResult.error.issues,
      );
    }

    const { status, customerId, startDate, endDate } = validationResult.data;

    // TODO: Replace with actual database query
    const mockInvoices = [
      {
        id: "1",
        invoiceNumber: "RE-2024-001",
        customerName: "ABC GmbH",
        customerId: "C001",
        amount: 1500.0,
        currency: "EUR",
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        status: "sent",
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: "2",
        invoiceNumber: "RE-2024-002",
        customerName: "XYZ AG",
        customerId: "C002",
        amount: 3250.5,
        currency: "EUR",
        dueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        status: "overdue",
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: "3",
        invoiceNumber: "RE-2024-003",
        customerName: "Musterfirma",
        customerId: "C003",
        amount: 890.0,
        currency: "EUR",
        dueDate: new Date(Date.now() - 20 * 86400000).toISOString(),
        status: "paid",
        createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
      },
      {
        id: "4",
        invoiceNumber: "RE-2024-004",
        customerName: "Test KG",
        customerId: "C004",
        amount: 2100.0,
        currency: "EUR",
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: "draft",
        createdAt: new Date().toISOString(),
      },
    ];

    // Apply filters
    let filteredInvoices = mockInvoices;
    if (status) {
      filteredInvoices = filteredInvoices.filter(
        (inv) => inv.status === status,
      );
    }
    if (customerId) {
      filteredInvoices = filteredInvoices.filter(
        (inv) => inv.customerId === customerId,
      );
    }

    res.json({
      success: true,
      data: filteredInvoices,
      count: filteredInvoices.length,
    });
  }),
);

/**
 * GET /api/finance/invoices/:id
 * Get a single invoice by ID
 */
router.get(
  "/invoices/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // TODO: Replace with actual database query
    // In production: const invoice = await invoiceService.findById(id);
    // if (!invoice) throw new NotFoundError("Invoice not found", { invoiceId: id });
    const mockInvoice = {
      id,
      invoiceNumber: "RE-2024-001",
      customerName: "ABC GmbH",
      customerId: "C001",
      amount: 1500.0,
      currency: "EUR",
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: "sent",
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      items: [
        {
          id: "1",
          description: "Beratungsleistung",
          quantity: 10,
          unitPrice: 150.0,
          total: 1500.0,
        },
      ],
      tax: 285.0,
      grossAmount: 1785.0,
    };

    res.json({
      success: true,
      data: mockInvoice,
    });
  }),
);

/**
 * POST /api/finance/invoices
 * Create a new invoice
 */
router.post(
  "/invoices",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const validationResult = createInvoiceSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid invoice data",
        validationResult.error.issues,
      );
    }

    const invoiceData = validationResult.data;

    // TODO: Generate invoice number
    // TODO: Calculate totals
    // TODO: Save to database

    const newInvoice = {
      id: Date.now().toString(),
      invoiceNumber: `RE-2024-${Date.now()}`,
      ...invoiceData,
      status: "draft",
      createdAt: new Date().toISOString(),
    };

    logger.info({ invoiceId: newInvoice.id }, "Invoice created");

    res.status(201).json({
      success: true,
      data: newInvoice,
      message: "Invoice created successfully",
    });
  }),
);

/**
 * PUT /api/finance/invoices/:id
 * Update an invoice
 */
router.put(
  "/invoices/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate input (using partial schema for updates)
    const validationResult = createInvoiceSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid invoice update data",
        validationResult.error.issues,
      );
    }

    const updateData = validationResult.data;

    // TODO: Update in database
    // In production: const invoice = await invoiceService.update(id, updateData);
    // if (!invoice) throw new NotFoundError("Invoice not found", { invoiceId: id });

    logger.info({ invoiceId: id }, "Invoice updated");

    res.json({
      success: true,
      data: { id, ...updateData },
      message: "Invoice updated successfully",
    });
  }),
);

/**
 * DELETE /api/finance/invoices/:id
 * Delete an invoice (only drafts)
 */
router.delete(
  "/invoices/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // TODO: Check if invoice is draft
    // TODO: Delete from database
    // In production:
    // const invoice = await invoiceService.findById(id);
    // if (!invoice) throw new NotFoundError("Invoice not found", { invoiceId: id });
    // if (invoice.status !== 'draft') throw new BadRequestError("Only draft invoices can be deleted");
    // await invoiceService.delete(id);

    logger.info({ invoiceId: id }, "Invoice deleted");

    res.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  }),
);

/**
 * POST /api/finance/invoices/:id/send
 * Send an invoice to customer
 */
router.post(
  "/invoices/:id/send",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // TODO: Update status to "sent"
    // TODO: Generate PDF
    // TODO: Send email to customer
    // In production:
    // const invoice = await invoiceService.findById(id);
    // if (!invoice) throw new NotFoundError("Invoice not found", { invoiceId: id });
    // await invoiceService.send(id);

    logger.info({ invoiceId: id }, "Invoice sent to customer");

    res.json({
      success: true,
      message: "Invoice sent successfully",
    });
  }),
);

// ============================================================================
// CUSTOMERS (DEBITOREN)
// ============================================================================

/**
 * GET /api/finance/customers
 * Get all customers
 */
router.get(
  "/customers",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate query parameters
    const validationResult = customerQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid query parameters",
        validationResult.error.issues,
      );
    }

    const { search } = validationResult.data;

    // TODO: Replace with actual database query
    const mockCustomers = [
      {
        id: "C001",
        name: "ABC GmbH",
        email: "info@abc-gmbh.de",
        phone: "+49 30 1234567",
        address: "Hauptstraße 1, 10115 Berlin",
        creditLimit: 10000,
        currentBalance: 1500,
      },
      {
        id: "C002",
        name: "XYZ AG",
        email: "kontakt@xyz-ag.de",
        phone: "+49 89 9876543",
        address: "Leopoldstraße 50, 80802 München",
        creditLimit: 20000,
        currentBalance: 3250.5,
      },
    ];

    // Apply search filter if provided
    let filteredCustomers = mockCustomers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCustomers = filteredCustomers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower),
      );
    }

    res.json({
      success: true,
      data: filteredCustomers,
      count: filteredCustomers.length,
    });
  }),
);

/**
 * GET /api/finance/customers/:id
 * Get a single customer by ID
 */
router.get(
  "/customers/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // TODO: Replace with actual database query
    // In production: const customer = await customerService.findById(id);
    // if (!customer) throw new NotFoundError("Customer not found", { customerId: id });
    const mockCustomer = {
      id,
      name: "ABC GmbH",
      email: "info@abc-gmbh.de",
      phone: "+49 30 1234567",
      address: "Hauptstraße 1, 10115 Berlin",
      creditLimit: 10000,
      currentBalance: 1500,
      paymentTerms: "30 Tage netto",
      taxId: "DE123456789",
    };

    res.json({
      success: true,
      data: mockCustomer,
    });
  }),
);

/**
 * POST /api/finance/customers
 * Create a new customer
 */
router.post(
  "/customers",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const validationResult = createCustomerSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid customer data",
        validationResult.error.issues,
      );
    }

    const customerData = validationResult.data;

    // TODO: Save to database
    // In production: const customer = await customerService.create(customerData);

    const newCustomer = { id: `C${Date.now()}`, ...customerData };
    logger.info({ customerId: newCustomer.id }, "Customer created");

    res.status(201).json({
      success: true,
      data: newCustomer,
      message: "Customer created successfully",
    });
  }),
);

// ============================================================================
// SUPPLIERS (KREDITOREN)
// ============================================================================

/**
 * GET /api/finance/suppliers
 * Get all suppliers
 */
router.get(
  "/suppliers",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate query parameters
    const validationResult = supplierQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid query parameters",
        validationResult.error.issues,
      );
    }

    const { search } = validationResult.data;

    // TODO: Replace with actual database query
    const mockSuppliers = [
      {
        id: "S001",
        name: "Supplier GmbH",
        email: "info@supplier.de",
        phone: "+49 40 1234567",
        address: "Industriestraße 10, 20095 Hamburg",
        paymentTerms: "14 Tage 2% Skonto, 30 Tage netto",
      },
    ];

    // Apply search filter if provided
    let filteredSuppliers = mockSuppliers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSuppliers = filteredSuppliers.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower),
      );
    }

    res.json({
      success: true,
      data: filteredSuppliers,
      count: filteredSuppliers.length,
    });
  }),
);

/**
 * POST /api/finance/suppliers
 * Create a new supplier
 */
router.post(
  "/suppliers",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const validationResult = createSupplierSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid supplier data",
        validationResult.error.issues,
      );
    }

    const supplierData = validationResult.data;

    // TODO: Save to database
    // In production: const supplier = await supplierService.create(supplierData);

    const newSupplier = { id: `S${Date.now()}`, ...supplierData };
    logger.info({ supplierId: newSupplier.id }, "Supplier created");

    res.status(201).json({
      success: true,
      data: newSupplier,
      message: "Supplier created successfully",
    });
  }),
);

// ============================================================================
// PAYMENTS
// ============================================================================

/**
 * GET /api/finance/payments
 * Get all payments
 */
router.get(
  "/payments",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate query parameters
    const validationResult = paymentQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid query parameters",
        validationResult.error.issues,
      );
    }

    const { type, status } = validationResult.data;

    // TODO: Replace with actual database query
    const mockPayments = [
      {
        id: "P001",
        type: "incoming",
        amount: 1500.0,
        currency: "EUR",
        date: new Date().toISOString(),
        status: "completed",
        invoiceId: "1",
        customerId: "C001",
      },
    ];

    // Apply filters
    let filteredPayments = mockPayments;
    if (type) {
      filteredPayments = filteredPayments.filter((p) => p.type === type);
    }
    if (status) {
      filteredPayments = filteredPayments.filter((p) => p.status === status);
    }

    res.json({
      success: true,
      data: filteredPayments,
      count: filteredPayments.length,
    });
  }),
);

/**
 * POST /api/finance/payments
 * Record a new payment
 */
router.post(
  "/payments",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const validationResult = createPaymentSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid payment data",
        validationResult.error.issues,
      );
    }

    const paymentData = validationResult.data;

    // TODO: Save to database
    // TODO: Update invoice status if applicable
    // In production: const payment = await paymentService.create(paymentData);

    const newPayment = {
      id: `P${Date.now()}`,
      ...paymentData,
      status: "completed",
    };
    logger.info({ paymentId: newPayment.id }, "Payment recorded");

    res.status(201).json({
      success: true,
      data: newPayment,
      message: "Payment recorded successfully",
    });
  }),
);

// ============================================================================
// ACCOUNTS (KONTEN)
// ============================================================================

/**
 * GET /api/finance/accounts
 * Get chart of accounts
 */
router.get(
  "/accounts",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Replace with actual database query
    const mockAccounts = [
      {
        id: "1000",
        name: "Kasse",
        type: "asset",
        balance: 5000.0,
      },
      {
        id: "1200",
        name: "Bank",
        type: "asset",
        balance: 50000.0,
      },
      {
        id: "4000",
        name: "Umsatzerlöse",
        type: "revenue",
        balance: 100000.0,
      },
    ];

    res.json({
      success: true,
      data: mockAccounts,
      count: mockAccounts.length,
    });
  }),
);

// ============================================================================
// TRANSACTIONS (BUCHUNGEN)
// ============================================================================

/**
 * GET /api/finance/transactions
 * Get transactions with optional filters
 */
router.get(
  "/transactions",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate query parameters
    const validationResult = transactionQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid query parameters",
        validationResult.error.issues,
      );
    }

    const { accountId, startDate, endDate } = validationResult.data;

    // TODO: Replace with actual database query
    const mockTransactions = [
      {
        id: "T001",
        date: new Date().toISOString(),
        description: "Zahlungseingang Rechnung RE-2024-001",
        debitAccount: "1200",
        creditAccount: "1400",
        amount: 1500.0,
        currency: "EUR",
      },
    ];

    // Apply filters
    let filteredTransactions = mockTransactions;
    if (accountId) {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.debitAccount === accountId || t.creditAccount === accountId,
      );
    }
    // Note: date filtering would be applied here in production

    res.json({
      success: true,
      data: filteredTransactions,
      count: filteredTransactions.length,
    });
  }),
);

/**
 * POST /api/finance/transactions
 * Create a new transaction (booking)
 */
router.post(
  "/transactions",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const validationResult = createTransactionSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid transaction data",
        validationResult.error.issues,
      );
    }

    const transactionData = validationResult.data;

    // TODO: Ensure debit = credit (double-entry bookkeeping)
    // TODO: Save to database
    // In production: const transaction = await transactionService.create(transactionData);

    const newTransaction = { id: `T${Date.now()}`, ...transactionData };
    logger.info({ transactionId: newTransaction.id }, "Transaction recorded");

    res.status(201).json({
      success: true,
      data: newTransaction,
      message: "Transaction recorded successfully",
    });
  }),
);

// ============================================================================
// STATISTICS & REPORTS
// ============================================================================

/**
 * GET /api/finance/statistics
 * Get finance statistics overview
 */
router.get(
  "/statistics",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Calculate from actual database
    const mockStats = {
      totalRevenue: 100000.0,
      totalExpenses: 60000.0,
      netProfit: 40000.0,
      openInvoices: 7,
      overdueInvoices: 2,
      totalOpenAmount: 4750.5,
      totalOverdueAmount: 3250.5,
    };

    res.json({
      success: true,
      data: mockStats,
    });
  }),
);

/**
 * GET /api/finance/reports/balance-sheet
 * Get balance sheet
 */
router.get(
  "/reports/balance-sheet",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Generate balance sheet from accounts
    const mockBalanceSheet = {
      assets: {
        current: 55000.0,
        fixed: 100000.0,
        total: 155000.0,
      },
      liabilities: {
        current: 25000.0,
        longTerm: 50000.0,
        total: 75000.0,
      },
      equity: 80000.0,
    };

    res.json({
      success: true,
      data: mockBalanceSheet,
    });
  }),
);

/**
 * GET /api/finance/reports/profit-loss
 * Get profit & loss statement
 */
router.get(
  "/reports/profit-loss",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Generate P&L from accounts
    const mockProfitLoss = {
      revenue: 100000.0,
      costOfGoodsSold: 40000.0,
      grossProfit: 60000.0,
      operatingExpenses: 20000.0,
      operatingIncome: 40000.0,
      netIncome: 40000.0,
    };

    res.json({
      success: true,
      data: mockProfitLoss,
    });
  }),
);

export default router;
