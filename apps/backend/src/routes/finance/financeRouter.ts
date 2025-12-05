// SPDX-License-Identifier: MIT
// apps/backend/src/routes/finance/financeRouter.ts

import { Router, Request, Response } from "express";

const router = Router();

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
router.get("/invoices", async (req: Request, res: Response) => {
  try {
    const { status, customerId, startDate, endDate } = req.query;

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
  } catch (error) {
    console.error("[Finance] Error fetching invoices:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch invoices",
    });
  }
});

/**
 * GET /api/finance/invoices/:id
 * Get a single invoice by ID
 */
router.get("/invoices/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Replace with actual database query
    // In real implementation, this would be:
    // const invoice = await invoiceService.findById(id);
    // if (!invoice) { return res.status(404).json(...) }
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

    // Note: This check is for demonstration purposes only
    // Will be replaced with actual DB query in Phase 2
    if (!mockInvoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    res.json({
      success: true,
      data: mockInvoice,
    });
  } catch (error) {
    console.error("[Finance] Error fetching invoice:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch invoice",
    });
  }
});

/**
 * POST /api/finance/invoices
 * Create a new invoice
 */
router.post("/invoices", async (req: Request, res: Response) => {
  try {
    const invoiceData = req.body;

    // TODO: Validate data with Zod schema
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

    res.status(201).json({
      success: true,
      data: newInvoice,
      message: "Invoice created successfully",
    });
  } catch (error) {
    console.error("[Finance] Error creating invoice:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create invoice",
    });
  }
});

/**
 * PUT /api/finance/invoices/:id
 * Update an invoice
 */
router.put("/invoices/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // TODO: Validate data
    // TODO: Update in database

    res.json({
      success: true,
      data: { id, ...updateData },
      message: "Invoice updated successfully",
    });
  } catch (error) {
    console.error("[Finance] Error updating invoice:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update invoice",
    });
  }
});

/**
 * DELETE /api/finance/invoices/:id
 * Delete an invoice (only drafts)
 */
router.delete("/invoices/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Check if invoice is draft
    // TODO: Delete from database

    res.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("[Finance] Error deleting invoice:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete invoice",
    });
  }
});

/**
 * POST /api/finance/invoices/:id/send
 * Send an invoice to customer
 */
router.post("/invoices/:id/send", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Update status to "sent"
    // TODO: Generate PDF
    // TODO: Send email to customer

    res.json({
      success: true,
      message: "Invoice sent successfully",
    });
  } catch (error) {
    console.error("[Finance] Error sending invoice:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send invoice",
    });
  }
});

// ============================================================================
// CUSTOMERS (DEBITOREN)
// ============================================================================

/**
 * GET /api/finance/customers
 * Get all customers
 */
router.get("/customers", async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

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

    res.json({
      success: true,
      data: mockCustomers,
      count: mockCustomers.length,
    });
  } catch (error) {
    console.error("[Finance] Error fetching customers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch customers",
    });
  }
});

/**
 * GET /api/finance/customers/:id
 * Get a single customer by ID
 */
router.get("/customers/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Replace with actual database query
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
  } catch (error) {
    console.error("[Finance] Error fetching customer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch customer",
    });
  }
});

/**
 * POST /api/finance/customers
 * Create a new customer
 */
router.post("/customers", async (req: Request, res: Response) => {
  try {
    const customerData = req.body;

    // TODO: Validate data
    // TODO: Save to database

    res.status(201).json({
      success: true,
      data: { id: `C${Date.now()}`, ...customerData },
      message: "Customer created successfully",
    });
  } catch (error) {
    console.error("[Finance] Error creating customer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create customer",
    });
  }
});

// ============================================================================
// SUPPLIERS (KREDITOREN)
// ============================================================================

/**
 * GET /api/finance/suppliers
 * Get all suppliers
 */
router.get("/suppliers", async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

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

    res.json({
      success: true,
      data: mockSuppliers,
      count: mockSuppliers.length,
    });
  } catch (error) {
    console.error("[Finance] Error fetching suppliers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch suppliers",
    });
  }
});

/**
 * POST /api/finance/suppliers
 * Create a new supplier
 */
router.post("/suppliers", async (req: Request, res: Response) => {
  try {
    const supplierData = req.body;

    // TODO: Validate data
    // TODO: Save to database

    res.status(201).json({
      success: true,
      data: { id: `S${Date.now()}`, ...supplierData },
      message: "Supplier created successfully",
    });
  } catch (error) {
    console.error("[Finance] Error creating supplier:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create supplier",
    });
  }
});

// ============================================================================
// PAYMENTS
// ============================================================================

/**
 * GET /api/finance/payments
 * Get all payments
 */
router.get("/payments", async (req: Request, res: Response) => {
  try {
    const { type, status } = req.query;

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

    res.json({
      success: true,
      data: mockPayments,
      count: mockPayments.length,
    });
  } catch (error) {
    console.error("[Finance] Error fetching payments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payments",
    });
  }
});

/**
 * POST /api/finance/payments
 * Record a new payment
 */
router.post("/payments", async (req: Request, res: Response) => {
  try {
    const paymentData = req.body;

    // TODO: Validate data
    // TODO: Save to database
    // TODO: Update invoice status if applicable

    res.status(201).json({
      success: true,
      data: { id: `P${Date.now()}`, ...paymentData },
      message: "Payment recorded successfully",
    });
  } catch (error) {
    console.error("[Finance] Error recording payment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to record payment",
    });
  }
});

// ============================================================================
// ACCOUNTS (KONTEN)
// ============================================================================

/**
 * GET /api/finance/accounts
 * Get chart of accounts
 */
router.get("/accounts", async (_req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error("[Finance] Error fetching accounts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch accounts",
    });
  }
});

// ============================================================================
// TRANSACTIONS (BUCHUNGEN)
// ============================================================================

/**
 * GET /api/finance/transactions
 * Get transactions with optional filters
 */
router.get("/transactions", async (req: Request, res: Response) => {
  try {
    const { accountId, startDate, endDate } = req.query;

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

    res.json({
      success: true,
      data: mockTransactions,
      count: mockTransactions.length,
    });
  } catch (error) {
    console.error("[Finance] Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transactions",
    });
  }
});

/**
 * POST /api/finance/transactions
 * Create a new transaction (booking)
 */
router.post("/transactions", async (req: Request, res: Response) => {
  try {
    const transactionData = req.body;

    // TODO: Validate data
    // TODO: Ensure debit = credit
    // TODO: Save to database

    res.status(201).json({
      success: true,
      data: { id: `T${Date.now()}`, ...transactionData },
      message: "Transaction recorded successfully",
    });
  } catch (error) {
    console.error("[Finance] Error creating transaction:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create transaction",
    });
  }
});

// ============================================================================
// STATISTICS & REPORTS
// ============================================================================

/**
 * GET /api/finance/statistics
 * Get finance statistics overview
 */
router.get("/statistics", async (_req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error("[Finance] Error fetching statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
    });
  }
});

/**
 * GET /api/finance/reports/balance-sheet
 * Get balance sheet
 */
router.get("/reports/balance-sheet", async (_req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error("[Finance] Error generating balance sheet:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate balance sheet",
    });
  }
});

/**
 * GET /api/finance/reports/profit-loss
 * Get profit & loss statement
 */
router.get("/reports/profit-loss", async (_req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error("[Finance] Error generating profit & loss:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate profit & loss statement",
    });
  }
});

export default router;
