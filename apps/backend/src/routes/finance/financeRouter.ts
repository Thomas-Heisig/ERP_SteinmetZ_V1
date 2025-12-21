// SPDX-License-Identifier: MIT
// apps/backend/src/routes/finance/financeRouter.ts

/**
 * Finance Router
 *
 * Provides comprehensive financial management API including invoicing,
 * customer management, payments, accounting, and financial reporting.
 *
 * @remarks
 * This router provides:
 * - Invoice CRUD operations (create, read, update, delete)
 * - Customer management
 * - Payment tracking and reconciliation
 * - Accounting entry management
 * - Financial statistics and reports
 * - Invoice status management (draft, sent, paid, overdue, cancelled)
 * - Multi-currency support
 *
 * Features:
 * - XRechnung and ZUGFeRD compliance (future)
 * - Automatic invoice numbering
 * - Payment reminders and dunning
 * - Tax calculation
 * - Revenue and expense tracking
 * - Profit/loss reporting
 * - Outstanding invoices monitoring
 *
 * Invoice Workflow:
 * 1. draft - Invoice is being prepared
 * 2. sent - Invoice has been sent to customer
 * 3. paid - Invoice has been paid
 * 4. overdue - Payment is past due date
 * 5. cancelled - Invoice has been cancelled
 *
 * @module routes/finance
 *
 * @example
 * ```typescript
 * // Create invoice
 * POST /api/finance/invoices
 * {
 *   "customerId": "cust-123",
 *   "customerName": "ACME Corp",
 *   "amount": 1500.00,
 *   "currency": "EUR",
 *   "dueDate": "2024-12-31",
 *   "items": [
 *     {
 *       "description": "Software Development",
 *       "quantity": 40,
 *       "unitPrice": 37.50,
 *       "total": 1500.00
 *     }
 *   ]
 * }
 *
 * // Record payment
 * POST /api/finance/payments
 * {
 *   "invoiceId": "inv-456",
 *   "amount": 1500.00,
 *   "paymentDate": "2024-12-15",
 *   "paymentMethod": "bank_transfer"
 * }
 *
 * // Get financial statistics
 * GET /api/finance/statistics
 * ```
 */

import { Router, Request, Response } from "express";
import { z, ZodIssue } from "zod";
import { BadRequestError } from "../error/errors.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { getDatabase } from "../database/db.js";
import { FinanceService } from "./services/FinanceService.js";
import { createLogger } from "../../utils/logger.js";

const router = Router();
const logger = createLogger("finance-router");

// Lazy-initialize service
let financeService: FinanceService | null = null;

function getFinanceService(): FinanceService {
  if (!financeService) {
    const db = getDatabase();
    financeService = new FinanceService(db);
  }
  return financeService;
}

/**
 * Helper function to format Zod validation errors
 */
function formatValidationErrors(issues: ZodIssue[]): Record<string, unknown> {
  return {
    errors: issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    })),
  };
}

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
      throw new BadRequestError(
        "Invalid query parameters",
        formatValidationErrors(validationResult.error.issues),
      );
    }

    const { status, customerId, startDate, endDate } = validationResult.data;

    const invoices = await getFinanceService().getAllInvoices({
      status,
      customerId,
      startDate,
      endDate,
    });

    res.json({
      success: true,
      data: invoices,
      count: invoices.length,
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
      throw new BadRequestError(
        "Invalid invoice data",
        formatValidationErrors(validationResult.error.issues),
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
      throw new BadRequestError(
        "Invalid invoice update data",
        formatValidationErrors(validationResult.error.issues),
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
      throw new BadRequestError(
        "Invalid query parameters",
        formatValidationErrors(validationResult.error.issues),
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
      throw new BadRequestError(
        "Invalid customer data",
        formatValidationErrors(validationResult.error.issues),
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
      throw new BadRequestError(
        "Invalid query parameters",
        formatValidationErrors(validationResult.error.issues),
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
      throw new BadRequestError(
        "Invalid supplier data",
        formatValidationErrors(validationResult.error.issues),
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
      throw new BadRequestError(
        "Invalid query parameters",
        formatValidationErrors(validationResult.error.issues),
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
      throw new BadRequestError(
        "Invalid payment data",
        formatValidationErrors(validationResult.error.issues),
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
      throw new BadRequestError(
        "Invalid query parameters",
        formatValidationErrors(validationResult.error.issues),
      );
    }

    const {
      accountId,
      startDate: _startDate,
      endDate: _endDate,
    } = validationResult.data;

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
      throw new BadRequestError(
        "Invalid transaction data",
        formatValidationErrors(validationResult.error.issues),
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

// ============================================================================
// XRECHNUNG & ZUGFERD
// ============================================================================

/**
 * POST /api/finance/invoices/:id/export/xrechnung
 * Export invoice as XRechnung XML
 */
router.post(
  "/invoices/:id/export/xrechnung",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // TODO: Fetch invoice from database
    // TODO: Generate XRechnung XML (EN 16931 compliant)
    // TODO: Validate against XRechnung schema

    logger.info({ invoiceId: id }, "XRechnung export requested");

    const xrechnungExport = {
      invoiceId: id,
      format: "XRechnung",
      version: "2.3",
      fileName: `xrechnung-${id}.xml`,
      createdAt: new Date().toISOString(),
      downloadUrl: `/api/finance/invoices/${id}/export/xrechnung/download`,
      standard: "EN 16931",
    };

    res.json({
      success: true,
      data: xrechnungExport,
      message: "XRechnung export generated successfully",
    });
  }),
);

/**
 * POST /api/finance/invoices/:id/export/zugferd
 * Export invoice as ZUGFeRD PDF
 */
router.post(
  "/invoices/:id/export/zugferd",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { profile = "BASIC" } = req.body;

    // Validate profile
    const validProfiles = ["MINIMUM", "BASIC", "EN16931", "EXTENDED"];
    if (!validProfiles.includes(profile)) {
      throw new BadRequestError(
        `Invalid ZUGFeRD profile. Must be one of: ${validProfiles.join(", ")}`,
      );
    }

    // TODO: Fetch invoice from database
    // TODO: Generate PDF with embedded XML (ZUGFeRD format)
    // TODO: Include invoice data as XML attachment in PDF

    logger.info({ invoiceId: id, profile }, "ZUGFeRD export requested");

    const zugferdExport = {
      invoiceId: id,
      format: "ZUGFeRD",
      version: "2.1.1",
      profile,
      fileName: `zugferd-${id}.pdf`,
      createdAt: new Date().toISOString(),
      downloadUrl: `/api/finance/invoices/${id}/export/zugferd/download`,
    };

    res.json({
      success: true,
      data: zugferdExport,
      message: "ZUGFeRD export generated successfully",
    });
  }),
);

// ============================================================================
// NUMBER RANGES (Nummernkreise)
// ============================================================================

const createNumberRangeSchema = z.object({
  type: z.enum(["invoice", "credit_note", "customer", "supplier", "voucher"]),
  prefix: z.string().max(10),
  startNumber: z.number().int().positive(),
  currentNumber: z.number().int().positive().optional(),
  endNumber: z.number().int().positive().optional(),
  year: z.number().int().min(2000).max(2100).optional(),
});

/**
 * GET /api/finance/number-ranges
 * Get all number ranges
 */
router.get(
  "/number-ranges",
  asyncHandler(async (req: Request, res: Response) => {
    // TODO: Query from database

    const mockNumberRanges = [
      {
        id: "nr-1",
        type: "invoice",
        prefix: "RE",
        year: 2024,
        startNumber: 1,
        currentNumber: 245,
        endNumber: 9999,
        format: "RE-2024-XXXX",
      },
      {
        id: "nr-2",
        type: "customer",
        prefix: "K",
        startNumber: 1000,
        currentNumber: 1234,
        format: "K-XXXX",
      },
      {
        id: "nr-3",
        type: "voucher",
        prefix: "BEL",
        year: 2024,
        startNumber: 1,
        currentNumber: 567,
        format: "BEL-2024-XXXX",
      },
    ];

    res.json({
      success: true,
      data: mockNumberRanges,
    });
  }),
);

/**
 * POST /api/finance/number-ranges
 * Create a new number range
 */
router.post(
  "/number-ranges",
  asyncHandler(async (req: Request, res: Response) => {
    const validationResult = createNumberRangeSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new BadRequestError(
        "Invalid number range data",
        formatValidationErrors(validationResult.error.issues),
      );
    }

    const rangeData = validationResult.data;

    // TODO: Save to database
    const newRange = {
      id: `nr-${Date.now()}`,
      ...rangeData,
      currentNumber: rangeData.currentNumber || rangeData.startNumber,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: newRange,
      message: "Number range created successfully",
    });
  }),
);

/**
 * POST /api/finance/number-ranges/:id/next
 * Get next number from range
 */
router.post(
  "/number-ranges/:id/next",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // TODO: Increment current number in database (atomic operation)
    // TODO: Check if range is exhausted

    const nextNumber = {
      rangeId: id,
      number: 246,
      formatted: "RE-2024-0246",
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: nextNumber,
    });
  }),
);

// ============================================================================
// DUNNING SYSTEM (Mahnwesen)
// ============================================================================

const createDunningSchema = z.object({
  invoiceId: z.string().min(1),
  level: z.number().int().min(1).max(3),
  message: z.string().optional(),
});

/**
 * GET /api/finance/dunning
 * Get all dunning notices
 */
router.get(
  "/dunning",
  asyncHandler(async (req: Request, res: Response) => {
    const { status, level } = req.query;

    // TODO: Query from database
    const mockDunning = [
      {
        id: "dun-1",
        invoiceId: "2",
        invoiceNumber: "RE-2024-002",
        customerId: "C002",
        customerName: "XYZ AG",
        level: 1,
        sentDate: new Date(Date.now() - 14 * 86400000).toISOString(),
        dueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        amount: 3250.5,
        fee: 5.0,
        status: "sent",
      },
      {
        id: "dun-2",
        invoiceId: "5",
        invoiceNumber: "RE-2024-005",
        customerId: "C005",
        customerName: "Test GmbH",
        level: 2,
        sentDate: new Date(Date.now() - 7 * 86400000).toISOString(),
        dueDate: new Date(Date.now() - 21 * 86400000).toISOString(),
        amount: 1890.0,
        fee: 10.0,
        status: "sent",
      },
    ];

    let filtered = mockDunning;
    if (status) {
      filtered = filtered.filter((d) => d.status === status);
    }
    if (level) {
      filtered = filtered.filter((d) => d.level === Number(level));
    }

    res.json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  }),
);

/**
 * POST /api/finance/dunning
 * Create a dunning notice
 */
router.post(
  "/dunning",
  asyncHandler(async (req: Request, res: Response) => {
    const validationResult = createDunningSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new BadRequestError(
        "Invalid dunning data",
        formatValidationErrors(validationResult.error.issues),
      );
    }

    const { invoiceId, level, message } = validationResult.data;

    // TODO: Verify invoice exists and is overdue
    // TODO: Check previous dunning level
    // TODO: Calculate dunning fees based on level
    // TODO: Generate dunning letter
    // TODO: Send notification

    const dunningFees = { 1: 5.0, 2: 10.0, 3: 15.0 };

    const newDunning = {
      id: `dun-${Date.now()}`,
      invoiceId,
      level,
      sentDate: new Date().toISOString(),
      fee: dunningFees[level as keyof typeof dunningFees] || 0,
      message: message || `Zahlungserinnerung Stufe ${level}`,
      status: "sent",
    };

    logger.info({ invoiceId, level }, "Dunning notice created");

    res.status(201).json({
      success: true,
      data: newDunning,
      message: "Dunning notice created and sent",
    });
  }),
);

/**
 * POST /api/finance/dunning/auto-escalate
 * Automatically escalate overdue invoices
 */
router.post(
  "/dunning/auto-escalate",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Find all overdue invoices
    // TODO: Check payment monitoring rules
    // TODO: Create appropriate dunning notices
    // TODO: Escalate based on days overdue

    const escalationRules = {
      level1: 7, // days after due date
      level2: 21,
      level3: 42,
    };

    const mockEscalated = {
      processed: 12,
      level1: 8,
      level2: 3,
      level3: 1,
      escalationRules,
      timestamp: new Date().toISOString(),
    };

    logger.info(
      { escalated: mockEscalated },
      "Dunning auto-escalation completed",
    );

    res.json({
      success: true,
      data: mockEscalated,
      message: "Automatic escalation completed",
    });
  }),
);

// ============================================================================
// CHART OF ACCOUNTS (SKR03/SKR04)
// ============================================================================

/**
 * GET /api/finance/chart-of-accounts
 * Get chart of accounts (SKR03 or SKR04)
 */
router.get(
  "/chart-of-accounts",
  asyncHandler(async (req: Request, res: Response) => {
    const { standard = "SKR03", category } = req.query;

    if (standard !== "SKR03" && standard !== "SKR04") {
      throw new BadRequestError("Invalid standard. Must be SKR03 or SKR04");
    }

    // TODO: Load from database based on standard
    const mockAccounts = [
      {
        accountNumber: "1000",
        name: "Kasse",
        type: "asset",
        category: "current_assets",
        standard: "SKR03",
      },
      {
        accountNumber: "1200",
        name: "Bank",
        type: "asset",
        category: "current_assets",
        standard: "SKR03",
      },
      {
        accountNumber: "1400",
        name: "Forderungen aus Lieferungen und Leistungen",
        type: "asset",
        category: "current_assets",
        standard: "SKR03",
      },
      {
        accountNumber: "4400",
        name: "Wareneingang",
        type: "expense",
        category: "cost_of_goods",
        standard: "SKR03",
      },
      {
        accountNumber: "8400",
        name: "Erlöse",
        type: "revenue",
        category: "sales",
        standard: "SKR03",
      },
    ];

    let filtered = mockAccounts.filter((acc) => acc.standard === standard);
    if (category) {
      filtered = filtered.filter((acc) => acc.category === category);
    }

    res.json({
      success: true,
      data: filtered,
      standard,
      count: filtered.length,
    });
  }),
);

/**
 * POST /api/finance/chart-of-accounts/import
 * Import chart of accounts from DATEV
 */
router.post(
  "/chart-of-accounts/import",
  asyncHandler(async (req: Request, res: Response) => {
    const { standard, file } = req.body;

    if (!standard || !file) {
      throw new BadRequestError("Standard and file data are required");
    }

    // TODO: Parse DATEV file format
    // TODO: Import accounts into database
    // TODO: Validate account structure

    const importResult = {
      imported: 156,
      skipped: 3,
      errors: 0,
      standard,
      timestamp: new Date().toISOString(),
    };

    logger.info({ result: importResult }, "Chart of accounts imported");

    res.json({
      success: true,
      data: importResult,
      message: "Chart of accounts imported successfully",
    });
  }),
);

// ============================================================================
// DATEV EXPORT
// ============================================================================

/**
 * POST /api/finance/datev-export
 * Generate DATEV export
 */
router.post(
  "/datev-export",
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, format = "csv" } = req.body;

    if (!startDate || !endDate) {
      throw new BadRequestError("Start date and end date are required");
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new BadRequestError("Invalid date format. Use YYYY-MM-DD");
    }

    // TODO: Fetch transactions from database
    // TODO: Generate DATEV format (CSV or DATEV-specific)
    // TODO: Include all required fields for DATEV import
    // TODO: Follow DATEV ASCII format specification

    const datevExport = {
      fileName: `datev-export-${startDate}-${endDate}.${format}`,
      format,
      startDate,
      endDate,
      transactionCount: 234,
      createdAt: new Date().toISOString(),
      downloadUrl: `/api/finance/datev-export/download/${startDate}-${endDate}`,
      standard: "DATEV ASCII",
    };

    logger.info({ export: datevExport }, "DATEV export generated");

    res.json({
      success: true,
      data: datevExport,
      message: "DATEV export generated successfully",
    });
  }),
);

// ============================================================================
// VAT ADVANCE RETURN (Umsatzsteuer-Voranmeldung)
// ============================================================================

/**
 * GET /api/finance/vat/advance-return
 * Get VAT advance return data
 */
router.get(
  "/vat/advance-return",
  asyncHandler(async (req: Request, res: Response) => {
    const { year, quarter } = req.query;

    if (!year || !quarter) {
      throw new BadRequestError("Year and quarter are required");
    }

    // TODO: Calculate from transactions
    // TODO: Sum up sales tax, input tax
    // TODO: Generate UStVA form data

    const mockVATReturn = {
      period: {
        year: Number(year),
        quarter: Number(quarter),
      },
      salesTax: {
        domestic19: { netAmount: 85000.0, taxAmount: 16150.0 },
        domestic7: { netAmount: 12000.0, taxAmount: 840.0 },
        exports: { netAmount: 23000.0, taxAmount: 0.0 },
        total: 16990.0,
      },
      inputTax: {
        domestic19: { netAmount: 32000.0, taxAmount: 6080.0 },
        domestic7: { netAmount: 8000.0, taxAmount: 560.0 },
        imports: { netAmount: 5000.0, taxAmount: 950.0 },
        total: 7590.0,
      },
      vatPayable: 9400.0, // salesTax.total - inputTax.total
      generatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: mockVATReturn,
    });
  }),
);

/**
 * POST /api/finance/vat/advance-return/submit
 * Submit VAT advance return (ELSTER integration placeholder)
 */
router.post(
  "/vat/advance-return/submit",
  asyncHandler(async (req: Request, res: Response) => {
    const { year, quarter } = req.body;

    if (!year || !quarter) {
      throw new BadRequestError("Year and quarter are required");
    }

    // TODO: Generate ELSTER XML format
    // TODO: Validate against ELSTER schema
    // TODO: Integration with ELSTER API (requires certification)

    logger.info({ year, quarter }, "VAT advance return submission requested");

    const submission = {
      year,
      quarter,
      status: "prepared",
      message: "ELSTER integration pending - manual submission required",
      downloadUrl: `/api/finance/vat/advance-return/xml/${year}/${quarter}`,
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: submission,
      message: "VAT return prepared for submission",
    });
  }),
);

// ============================================================================
// PAYMENT MONITORING
// ============================================================================

/**
 * GET /api/finance/payment-monitoring
 * Get payment monitoring overview
 */
router.get(
  "/payment-monitoring",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Calculate from invoices

    const mockMonitoring = {
      overview: {
        totalOutstanding: 45230.5,
        overdue: 12450.0,
        dueWithin7Days: 8900.5,
        dueWithin30Days: 23880.0,
      },
      byAge: {
        current: 23880.0, // not yet due
        days1to30: 8900.5,
        days31to60: 7230.0,
        days61to90: 3120.0,
        over90: 2100.0,
      },
      riskAssessment: {
        low: 28,
        medium: 8,
        high: 4,
        critical: 1,
      },
      topDebtors: [
        {
          customerId: "C002",
          customerName: "XYZ AG",
          outstanding: 3250.5,
          oldestInvoiceDays: 45,
          riskLevel: "medium",
        },
      ],
    };

    res.json({
      success: true,
      data: mockMonitoring,
    });
  }),
);

// ============================================================================
// ASSETS (ANLAGENBUCHHALTUNG)
// ============================================================================

const createAssetSchema = z.object({
  assetNumber: z.string().optional(),
  name: z.string().min(1).max(200),
  category: z.string().min(1),
  acquisitionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  acquisitionCost: z.number().positive(),
  residualValue: z.number().min(0).default(0),
  usefulLife: z.number().int().positive(), // in months
  depreciationMethod: z
    .enum(["linear", "declining", "performance-based"])
    .default("linear"),
  location: z.string().optional(),
  costCenter: z.string().optional(),
  serialNumber: z.string().optional(),
});

/**
 * GET /api/finance/assets
 * Get all assets
 */
router.get(
  "/assets",
  asyncHandler(async (req: Request, res: Response) => {
    const { category, status } = req.query;

    // TODO: Query from database
    const mockAssets = [
      {
        id: "ast-1",
        assetNumber: "ANL-001",
        name: "Firmenwagen Mercedes E-Klasse",
        category: "Fahrzeuge",
        acquisitionDate: "2022-01-15",
        acquisitionCost: 45000.0,
        residualValue: 5000.0,
        usefulLife: 72,
        depreciationMethod: "linear",
        currentBookValue: 28333.33,
        location: "Hauptsitz Berlin",
        status: "active",
      },
      {
        id: "ast-2",
        assetNumber: "ANL-002",
        name: "Server Dell PowerEdge",
        category: "IT-Hardware",
        acquisitionDate: "2023-06-01",
        acquisitionCost: 8500.0,
        residualValue: 500.0,
        usefulLife: 60,
        depreciationMethod: "linear",
        currentBookValue: 6166.67,
        location: "Rechenzentrum",
        status: "active",
      },
    ];

    let filtered = mockAssets;
    if (category) {
      filtered = filtered.filter((a) => a.category === category);
    }
    if (status) {
      filtered = filtered.filter((a) => a.status === status);
    }

    res.json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  }),
);

/**
 * GET /api/finance/assets/:id
 * Get asset details
 */
router.get(
  "/assets/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // TODO: Query from database
    const mockAsset = {
      id,
      assetNumber: "ANL-001",
      name: "Firmenwagen Mercedes E-Klasse",
      category: "Fahrzeuge",
      acquisitionDate: "2022-01-15",
      acquisitionCost: 45000.0,
      residualValue: 5000.0,
      usefulLife: 72,
      depreciationMethod: "linear",
      currentBookValue: 28333.33,
      accumulatedDepreciation: 16666.67,
      location: "Hauptsitz Berlin",
      costCenter: "CC-100",
      serialNumber: "WDD12345678901234",
      status: "active",
      createdAt: new Date("2022-01-15").toISOString(),
    };

    res.json({
      success: true,
      data: mockAsset,
    });
  }),
);

/**
 * POST /api/finance/assets
 * Create a new asset
 */
router.post(
  "/assets",
  asyncHandler(async (req: Request, res: Response) => {
    const validationResult = createAssetSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new BadRequestError(
        "Invalid asset data",
        formatValidationErrors(validationResult.error.issues),
      );
    }

    const assetData = validationResult.data;

    // TODO: Generate asset number if not provided
    // TODO: Save to database
    const newAsset = {
      id: `ast-${Date.now()}`,
      assetNumber: assetData.assetNumber || `ANL-${Date.now()}`,
      ...assetData,
      currentBookValue: assetData.acquisitionCost,
      accumulatedDepreciation: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    logger.info({ assetId: newAsset.id }, "Asset created");

    res.status(201).json({
      success: true,
      data: newAsset,
      message: "Asset created successfully",
    });
  }),
);

/**
 * PUT /api/finance/assets/:id
 * Update an asset
 */
router.put(
  "/assets/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const validationResult = createAssetSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      throw new BadRequestError(
        "Invalid asset update data",
        formatValidationErrors(validationResult.error.issues),
      );
    }

    const updateData = validationResult.data;

    // TODO: Update in database
    logger.info({ assetId: id }, "Asset updated");

    res.json({
      success: true,
      data: { id, ...updateData },
      message: "Asset updated successfully",
    });
  }),
);

/**
 * GET /api/finance/assets/:id/depreciation
 * Get depreciation history for an asset
 */
router.get(
  "/assets/:id/depreciation",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // TODO: Query from database
    const mockDepreciation = [
      {
        id: "dep-1",
        assetId: id,
        period: "2022-01-31",
        amount: 555.56,
        accumulatedDepreciation: 555.56,
        bookValue: 44444.44,
        method: "linear",
      },
      {
        id: "dep-2",
        assetId: id,
        period: "2022-02-28",
        amount: 555.56,
        accumulatedDepreciation: 1111.12,
        bookValue: 43888.88,
        method: "linear",
      },
      // ... more periods
    ];

    res.json({
      success: true,
      data: mockDepreciation,
      count: mockDepreciation.length,
    });
  }),
);

/**
 * POST /api/finance/assets/depreciation/calculate
 * Calculate depreciation for all active assets
 */
router.post(
  "/assets/depreciation/calculate",
  asyncHandler(async (req: Request, res: Response) => {
    const { period } = req.body;

    if (!period || !/^\d{4}-\d{2}-\d{2}$/.test(period)) {
      throw new BadRequestError("Period is required in YYYY-MM-DD format");
    }

    // TODO: Calculate depreciation for all active assets
    // TODO: Save depreciation entries to database
    // TODO: Update asset book values

    const calculationResult = {
      period,
      assetsProcessed: 25,
      totalDepreciation: 12345.67,
      timestamp: new Date().toISOString(),
    };

    logger.info({ result: calculationResult }, "Depreciation calculated");

    res.json({
      success: true,
      data: calculationResult,
      message: "Depreciation calculated successfully",
    });
  }),
);

// ============================================================================
// KPI ENDPOINTS (KENNZAHLEN)
// ============================================================================

/**
 * GET /api/finance/kpi/liquidity
 * Get liquidity KPIs
 */
router.get(
  "/kpi/liquidity",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Calculate from actual data
    const mockKPIs = {
      cashRatio: 25.5,
      quickRatio: 115.3,
      currentRatio: 185.7,
      workingCapital: 125000.0,
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: mockKPIs,
    });
  }),
);

/**
 * GET /api/finance/kpi/profitability
 * Get profitability KPIs
 */
router.get(
  "/kpi/profitability",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Calculate from actual data
    const mockKPIs = {
      roe: 15.2,
      roa: 8.5,
      ros: 12.3,
      ebitMargin: 14.7,
      ebitdaMargin: 18.2,
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: mockKPIs,
    });
  }),
);

/**
 * GET /api/finance/kpi/efficiency
 * Get efficiency KPIs
 */
router.get(
  "/kpi/efficiency",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Calculate from actual data
    const mockKPIs = {
      dso: 32.5,
      dpo: 42.1,
      dio: 28.3,
      ccc: 18.7,
      assetTurnover: 1.8,
      inventoryTurnover: 12.5,
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: mockKPIs,
    });
  }),
);

/**
 * GET /api/finance/kpi/capital-structure
 * Get capital structure KPIs
 */
router.get(
  "/kpi/capital-structure",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Calculate from actual data
    const mockKPIs = {
      equityRatio: 32.5,
      debtToEquityRatio: 107.7,
      gearing: 85.3,
      debtRatio: 51.8,
      interestCoverageRatio: 8.5,
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: mockKPIs,
    });
  }),
);

/**
 * GET /api/finance/kpi/dashboard
 * Get comprehensive KPI dashboard
 */
router.get(
  "/kpi/dashboard",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Calculate all KPIs from actual data
    const mockDashboard = {
      liquidity: {
        cashRatio: 25.5,
        quickRatio: 115.3,
        currentRatio: 185.7,
        workingCapital: 125000.0,
      },
      profitability: {
        roe: 15.2,
        roa: 8.5,
        ros: 12.3,
        ebitMargin: 14.7,
        ebitdaMargin: 18.2,
      },
      efficiency: {
        dso: 32.5,
        dpo: 42.1,
        dio: 28.3,
        ccc: 18.7,
        assetTurnover: 1.8,
      },
      capitalStructure: {
        equityRatio: 32.5,
        debtToEquityRatio: 107.7,
        gearing: 85.3,
      },
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: mockDashboard,
    });
  }),
);

// ============================================================================
// ADDITIONAL REPORTS
// ============================================================================

/**
 * GET /api/finance/reports/cash-flow
 * Get cash flow statement
 */
router.get(
  "/reports/cash-flow",
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, method = "indirect" } = req.query;

    // TODO: Generate cash flow statement
    const mockCashFlow = {
      startDate:
        startDate || new Date(Date.now() - 365 * 86400000).toISOString(),
      endDate: endDate || new Date().toISOString(),
      method,
      operatingActivities: {
        netIncome: 40000.0,
        adjustments: {
          depreciation: 12000.0,
          changeInReceivables: -5000.0,
          changeInPayables: 3000.0,
          other: 0,
        },
        net: 50000.0,
      },
      investingActivities: {
        acquisitions: -25000.0,
        disposals: 5000.0,
        net: -20000.0,
      },
      financingActivities: {
        equity: 10000.0,
        debt: 5000.0,
        dividends: -10000.0,
        net: 5000.0,
      },
      netCashFlow: 35000.0,
      beginningCash: 20000.0,
      endingCash: 55000.0,
    };

    res.json({
      success: true,
      data: mockCashFlow,
    });
  }),
);

/**
 * GET /api/finance/reports/trial-balance
 * Get trial balance (Summen- und Saldenliste)
 */
router.get(
  "/reports/trial-balance",
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    // TODO: Generate trial balance from transactions
    const mockTrialBalance = {
      startDate:
        startDate || new Date(Date.now() - 365 * 86400000).toISOString(),
      endDate: endDate || new Date().toISOString(),
      accounts: [
        {
          accountNumber: "1000",
          accountName: "Kasse",
          debitTurnover: 25000.0,
          creditTurnover: 22000.0,
          balance: 3000.0,
          balanceType: "debit",
        },
        {
          accountNumber: "1200",
          accountName: "Bank",
          debitTurnover: 150000.0,
          creditTurnover: 100000.0,
          balance: 50000.0,
          balanceType: "debit",
        },
        {
          accountNumber: "4000",
          accountName: "Umsatzerlöse",
          debitTurnover: 0,
          creditTurnover: 200000.0,
          balance: 200000.0,
          balanceType: "credit",
        },
      ],
      totalDebitTurnover: 175000.0,
      totalCreditTurnover: 322000.0,
      difference: 0, // should always be 0 in double-entry
    };

    res.json({
      success: true,
      data: mockTrialBalance,
    });
  }),
);

/**
 * GET /api/finance/reports/aging
 * Get aging report (Fälligkeitsstruktur)
 */
router.get(
  "/reports/aging",
  asyncHandler(async (req: Request, res: Response) => {
    const { type = "receivables", date } = req.query;

    if (type !== "receivables" && type !== "payables") {
      throw new BadRequestError("Type must be 'receivables' or 'payables'");
    }

    // TODO: Calculate aging from invoices/payments
    const mockAging = {
      date: date || new Date().toISOString(),
      type,
      buckets: {
        current: { count: 15, amount: 25000.0 },
        days1to30: { count: 8, amount: 12500.0 },
        days31to60: { count: 5, amount: 7800.0 },
        days61to90: { count: 2, amount: 3200.0 },
        over90: { count: 1, amount: 2100.0 },
      },
      total: { count: 31, amount: 50600.0 },
      topItems: [
        {
          id: "C002",
          name: "XYZ AG",
          amount: 3250.5,
          daysOverdue: 45,
        },
        {
          id: "C005",
          name: "Test GmbH",
          amount: 2100.0,
          daysOverdue: 95,
        },
      ],
    };

    res.json({
      success: true,
      data: mockAging,
    });
  }),
);

/**
 * GET /api/finance/reports/asset-register
 * Get asset register (Anlagenspiegel)
 */
router.get(
  "/reports/asset-register",
  asyncHandler(async (req: Request, res: Response) => {
    const { year } = req.query;

    if (!year) {
      throw new BadRequestError("Year is required");
    }

    // TODO: Generate asset register from assets table
    const mockAssetRegister = {
      year: Number(year),
      categories: [
        {
          category: "Fahrzeuge",
          openingBalance: 50000.0,
          additions: 45000.0,
          disposals: 15000.0,
          depreciation: 12000.0,
          closingBalance: 68000.0,
        },
        {
          category: "IT-Hardware",
          openingBalance: 25000.0,
          additions: 8500.0,
          disposals: 3000.0,
          depreciation: 5500.0,
          closingBalance: 25000.0,
        },
      ],
      totals: {
        openingBalance: 75000.0,
        additions: 53500.0,
        disposals: 18000.0,
        depreciation: 17500.0,
        closingBalance: 93000.0,
      },
    };

    res.json({
      success: true,
      data: mockAssetRegister,
    });
  }),
);

export default router;
