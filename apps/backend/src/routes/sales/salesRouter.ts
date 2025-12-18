// SPDX-License-Identifier: MIT
// apps/backend/src/routes/sales/salesRouter.ts
/**
 * @module SalesRouter
 * @description Vertrieb & Marketing - CRM, Angebote, Aufträge, Pipeline
 */

import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { z } from "zod";
import { BadRequestError } from "../../types/errors.js";

const router = Router();

/* ---------------------------------------------------------
   VERTRIEBSPIPELINE
--------------------------------------------------------- */

// GET /api/sales/pipeline - Pipeline-Übersicht
router.get(
  "/pipeline",
  asyncHandler(async (_req, res) => {
    res.json({
      total_value: 2450000,
      stages: [
        { name: "Lead", count: 45, value: 450000, conversion_rate: 25 },
        { name: "Qualifiziert", count: 32, value: 640000, conversion_rate: 45 },
        { name: "Angebot", count: 18, value: 720000, conversion_rate: 60 },
        { name: "Verhandlung", count: 12, value: 480000, conversion_rate: 75 },
        { name: "Gewonnen", count: 5, value: 160000, conversion_rate: 100 },
      ],
      forecast: {
        this_month: 185000,
        next_month: 220000,
        this_quarter: 650000,
      },
    });
  }),
);

/* ---------------------------------------------------------
   ANGEBOTE
--------------------------------------------------------- */

// GET /api/sales/quotes - Alle Angebote abrufen
router.get(
  "/quotes",
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;

    // TODO: Aus Datenbank laden mit Filterung
    const quotes = [
      {
        id: "QT-2025-001",
        customer: "Musterfirma GmbH",
        contact: "Max Mustermann",
        date: "2025-12-15",
        valid_until: "2026-01-15",
        total: 45000,
        status: "pending",
        items_count: 5,
      },
      {
        id: "QT-2025-002",
        customer: "Beispiel AG",
        contact: "Erika Muster",
        date: "2025-12-14",
        valid_until: "2026-01-14",
        total: 32000,
        status: "accepted",
        items_count: 3,
      },
    ];

    const filtered = status
      ? quotes.filter((q) => q.status === status)
      : quotes;

    res.json({ quotes: filtered });
  }),
);

// POST /api/sales/quotes - Neues Angebot erstellen
const quoteSchema = z.object({
  customer_id: z.number(),
  contact_id: z.number().optional(),
  valid_days: z.number().default(30),
  items: z.array(
    z.object({
      product_id: z.number().optional(),
      description: z.string(),
      quantity: z.number().positive(),
      unit_price: z.number().positive(),
      discount_percent: z.number().min(0).max(100).default(0),
      tax_rate: z.number().default(19),
    }),
  ),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

router.post(
  "/quotes",
  asyncHandler(async (req, res) => {
    const validatedData = quoteSchema.parse(req.body);

    // TODO: In Datenbank speichern
    const quoteNumber = `QT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

    res.status(201).json({
      message: "Angebot erstellt",
      data: {
        id: quoteNumber,
        ...validatedData,
        status: "draft",
        date: new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString(),
      },
    });
  }),
);

// GET /api/sales/quotes/:id - Einzelnes Angebot abrufen
router.get(
  "/quotes/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // TODO: Aus Datenbank laden
    res.json({
      id,
      customer: {
        id: 1,
        name: "Musterfirma GmbH",
        address: "Musterstr. 1, 12345 Musterstadt",
      },
      contact: {
        id: 1,
        name: "Max Mustermann",
        email: "max@musterfirma.de",
        phone: "+49 123 456789",
      },
      date: "2025-12-15",
      valid_until: "2026-01-15",
      status: "pending",
      items: [
        {
          position: 1,
          description: "Grabstein aus schwarzem Granit",
          quantity: 1,
          unit: "Stk",
          unit_price: 3500,
          discount_percent: 0,
          net_amount: 3500,
          tax_rate: 19,
          tax_amount: 665,
          gross_amount: 4165,
        },
      ],
      subtotal: 3500,
      total_tax: 665,
      total: 4165,
      notes: "Lieferzeit ca. 4-6 Wochen",
      terms: "Zahlbar innerhalb 14 Tagen",
    });
  }),
);

/* ---------------------------------------------------------
   AUFTRÄGE
--------------------------------------------------------- */

// GET /api/sales/orders - Alle Aufträge abrufen
router.get(
  "/orders",
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;

    const orders = [
      {
        id: "OR-2025-001",
        customer: "Musterfirma GmbH",
        date: "2025-12-10",
        delivery_date: "2026-01-20",
        total: 45000,
        status: "confirmed",
        payment_status: "pending",
      },
      {
        id: "OR-2025-002",
        customer: "Beispiel AG",
        date: "2025-12-08",
        delivery_date: "2025-12-28",
        total: 32000,
        status: "in_production",
        payment_status: "partial",
      },
    ];

    const filtered = status
      ? orders.filter((o) => o.status === status)
      : orders;

    res.json({ orders: filtered });
  }),
);

// POST /api/sales/orders - Auftrag aus Angebot erstellen
const orderSchema = z.object({
  quote_id: z.string(),
  delivery_date: z.string(),
  payment_terms: z.string().optional(),
  special_instructions: z.string().optional(),
});

router.post(
  "/orders",
  asyncHandler(async (req, res) => {
    const validatedData = orderSchema.parse(req.body);

    // TODO: Angebot in Auftrag umwandeln
    const orderNumber = `OR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

    res.status(201).json({
      message: "Auftrag erstellt",
      data: {
        id: orderNumber,
        ...validatedData,
        status: "confirmed",
        created_at: new Date().toISOString(),
      },
    });
  }),
);

/* ---------------------------------------------------------
   LEADS
--------------------------------------------------------- */

// GET /api/sales/leads - Alle Leads abrufen
router.get(
  "/leads",
  asyncHandler(async (_req, res) => {
    res.json({
      leads: [
        {
          id: 1,
          source: "Website",
          company: "Neukunde GmbH",
          contact: "Anna Schmidt",
          email: "anna@neukunde.de",
          phone: "+49 987 654321",
          status: "new",
          score: 85,
          created_at: "2025-12-16",
        },
        {
          id: 2,
          source: "Messe",
          company: "Innovation AG",
          contact: "Peter Müller",
          email: "peter@innovation.de",
          phone: "+49 876 543210",
          status: "qualified",
          score: 92,
          created_at: "2025-12-14",
        },
      ],
    });
  }),
);

// POST /api/sales/leads - Neuen Lead erfassen
const leadSchema = z.object({
  source: z.string(),
  company: z.string(),
  contact: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

router.post(
  "/leads",
  asyncHandler(async (req, res) => {
    const validatedData = leadSchema.parse(req.body);

    res.status(201).json({
      message: "Lead erfasst",
      data: {
        id: Date.now(),
        ...validatedData,
        status: "new",
        score: 50,
        created_at: new Date().toISOString(),
      },
    });
  }),
);

// PUT /api/sales/leads/:id/qualify - Lead qualifizieren
router.put(
  "/leads/:id/qualify",
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new BadRequestError("Ungültige Lead-ID");
    }

    const { score, notes } = req.body;

    res.json({
      message: "Lead qualifiziert",
      data: {
        id,
        status: "qualified",
        score: score || 75,
        notes,
        updated_at: new Date().toISOString(),
      },
    });
  }),
);

/* ---------------------------------------------------------
   MARKETING KAMPAGNEN
--------------------------------------------------------- */

// GET /api/sales/campaigns - Alle Kampagnen abrufen
router.get(
  "/campaigns",
  asyncHandler(async (_req, res) => {
    res.json({
      campaigns: [
        {
          id: 1,
          name: "Weihnachts-Aktion 2025",
          type: "email",
          status: "active",
          start_date: "2025-12-01",
          end_date: "2025-12-24",
          budget: 5000,
          spent: 3200,
          leads_generated: 45,
          conversions: 12,
          roi: 240,
        },
        {
          id: 2,
          name: "Neujahrs-Special",
          type: "social",
          status: "planned",
          start_date: "2026-01-02",
          end_date: "2026-01-31",
          budget: 3000,
          spent: 0,
          leads_generated: 0,
          conversions: 0,
          roi: 0,
        },
      ],
    });
  }),
);

export default router;
