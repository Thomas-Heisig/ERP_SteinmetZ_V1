// SPDX-License-Identifier: MIT
// apps/backend/src/routes/procurement/procurementRouter.ts
/**
 * @module ProcurementRouter
 * @description Einkauf & Beschaffung - Bestellungen, Lieferanten, Wareneingang
 */

import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { z } from "zod";
import { BadRequestError } from "../../types/errors.js";

const router = Router();

/* ---------------------------------------------------------
   BESTELLUNGEN
--------------------------------------------------------- */

// GET /api/procurement/orders - Alle Bestellungen abrufen
router.get(
  "/orders",
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;

    const orders = [
      {
        id: "PO-2025-001",
        supplier: "Granit Lieferant GmbH",
        date: "2025-12-15",
        expected_delivery: "2025-12-28",
        total: 12500,
        status: "ordered",
        items_count: 3,
      },
      {
        id: "PO-2025-002",
        supplier: "Werkzeug AG",
        date: "2025-12-12",
        expected_delivery: "2025-12-20",
        total: 3200,
        status: "delivered",
        items_count: 8,
      },
    ];

    const filtered = status
      ? orders.filter((o) => o.status === status)
      : orders;

    res.json({ orders: filtered });
  }),
);

// POST /api/procurement/orders - Neue Bestellung erstellen
const orderSchema = z.object({
  supplier_id: z.number(),
  items: z.array(
    z.object({
      material_id: z.number(),
      description: z.string(),
      quantity: z.number().positive(),
      unit: z.string(),
      unit_price: z.number().positive(),
    }),
  ),
  delivery_address: z
    .object({
      street: z.string(),
      zip: z.string(),
      city: z.string(),
    })
    .optional(),
  requested_delivery_date: z.string(),
  notes: z.string().optional(),
});

router.post(
  "/orders",
  asyncHandler(async (req, res) => {
    const validatedData = orderSchema.parse(req.body);

    const orderNumber = `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

    res.status(201).json({
      message: "Bestellung erstellt",
      data: {
        id: orderNumber,
        ...validatedData,
        status: "draft",
        created_at: new Date().toISOString(),
      },
    });
  }),
);

// GET /api/procurement/orders/:id - Einzelne Bestellung abrufen
router.get(
  "/orders/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    res.json({
      id,
      supplier: {
        id: 1,
        name: "Granit Lieferant GmbH",
        contact: "Herr Weber",
        email: "weber@granit-lieferant.de",
      },
      date: "2025-12-15",
      expected_delivery: "2025-12-28",
      status: "ordered",
      items: [
        {
          position: 1,
          material_id: 101,
          description: "Schwarzer Granit, poliert",
          quantity: 5,
          unit: "m²",
          unit_price: 2500,
          total: 12500,
        },
      ],
      subtotal: 12500,
      tax: 2375,
      total: 14875,
    });
  }),
);

/* ---------------------------------------------------------
   LIEFERANTEN
--------------------------------------------------------- */

// GET /api/procurement/suppliers - Alle Lieferanten abrufen
router.get(
  "/suppliers",
  asyncHandler(async (_req, res) => {
    res.json({
      suppliers: [
        {
          id: 1,
          name: "Granit Lieferant GmbH",
          category: "Rohstoffe",
          rating: 4.8,
          status: "active",
          payment_terms: "30 Tage netto",
          delivery_reliability: 95,
        },
        {
          id: 2,
          name: "Werkzeug AG",
          category: "Betriebsmittel",
          rating: 4.5,
          status: "active",
          payment_terms: "14 Tage 2% Skonto",
          delivery_reliability: 92,
        },
        {
          id: 3,
          name: "Verpackung & Co",
          category: "Verpackung",
          rating: 4.2,
          status: "active",
          payment_terms: "30 Tage netto",
          delivery_reliability: 88,
        },
      ],
    });
  }),
);

// POST /api/procurement/suppliers - Neuen Lieferanten anlegen
const supplierSchema = z.object({
  name: z.string().min(1),
  category: z.string(),
  contact_person: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string(),
    zip: z.string(),
    city: z.string(),
    country: z.string(),
  }),
  payment_terms: z.string().optional(),
  bank_details: z
    .object({
      account_holder: z.string(),
      iban: z.string(),
      bic: z.string(),
    })
    .optional(),
});

router.post(
  "/suppliers",
  asyncHandler(async (req, res) => {
    const validatedData = supplierSchema.parse(req.body);

    res.status(201).json({
      message: "Lieferant angelegt",
      data: {
        id: Date.now(),
        ...validatedData,
        status: "active",
        rating: 0,
        created_at: new Date().toISOString(),
      },
    });
  }),
);

// GET /api/procurement/suppliers/:id - Einzelnen Lieferanten abrufen
router.get(
  "/suppliers/:id",
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new BadRequestError("Ungültige Lieferanten-ID");
    }

    res.json({
      id,
      name: "Granit Lieferant GmbH",
      category: "Rohstoffe",
      contact_person: "Herr Weber",
      email: "weber@granit-lieferant.de",
      phone: "+49 123 456789",
      address: {
        street: "Industriestr. 45",
        zip: "54321",
        city: "Steinstadt",
        country: "Deutschland",
      },
      payment_terms: "30 Tage netto",
      rating: 4.8,
      delivery_reliability: 95,
      quality_score: 4.7,
      price_level: "mittel",
      status: "active",
      orders_count: 156,
      total_volume: 2450000,
      last_order: "2025-12-15",
    });
  }),
);

// POST /api/procurement/suppliers/:id/evaluate - Lieferant bewerten
const evaluationSchema = z.object({
  delivery_reliability: z.number().min(0).max(100),
  quality: z.number().min(1).max(5),
  price_level: z.enum(["günstig", "mittel", "teuer"]),
  service: z.number().min(1).max(5),
  notes: z.string().optional(),
});

router.post(
  "/suppliers/:id/evaluate",
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new BadRequestError("Ungültige Lieferanten-ID");
    }

    const validatedData = evaluationSchema.parse(req.body);

    res.json({
      message: "Bewertung gespeichert",
      data: {
        supplier_id: id,
        ...validatedData,
        evaluated_at: new Date().toISOString(),
      },
    });
  }),
);

/* ---------------------------------------------------------
   WARENEINGANG
--------------------------------------------------------- */

// GET /api/procurement/goods-receipts - Alle Wareneingänge abrufen
router.get(
  "/goods-receipts",
  asyncHandler(async (_req, res) => {
    res.json({
      receipts: [
        {
          id: "GR-2025-001",
          purchase_order: "PO-2025-002",
          supplier: "Werkzeug AG",
          date: "2025-12-18",
          status: "checked",
          quality_status: "approved",
          items_count: 8,
        },
        {
          id: "GR-2025-002",
          purchase_order: "PO-2025-001",
          supplier: "Granit Lieferant GmbH",
          date: "2025-12-17",
          status: "pending",
          quality_status: "in_inspection",
          items_count: 3,
        },
      ],
    });
  }),
);

// POST /api/procurement/goods-receipts - Wareneingang erfassen
const goodsReceiptSchema = z.object({
  purchase_order_id: z.string(),
  delivery_note: z.string().optional(),
  items: z.array(
    z.object({
      position: z.number(),
      quantity_received: z.number().positive(),
      quantity_expected: z.number().positive(),
      condition: z.enum(["good", "damaged", "incomplete"]),
      notes: z.string().optional(),
    }),
  ),
  received_by: z.string(),
  notes: z.string().optional(),
});

router.post(
  "/goods-receipts",
  asyncHandler(async (req, res) => {
    const validatedData = goodsReceiptSchema.parse(req.body);

    const receiptNumber = `GR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

    res.status(201).json({
      message: "Wareneingang erfasst",
      data: {
        id: receiptNumber,
        ...validatedData,
        status: "checked",
        date: new Date().toISOString(),
      },
    });
  }),
);

/* ---------------------------------------------------------
   BEDARFSPLANUNG
--------------------------------------------------------- */

// GET /api/procurement/demand - Materialbedarfsplanung abrufen
router.get(
  "/demand",
  asyncHandler(async (_req, res) => {
    res.json({
      items: [
        {
          material_id: 101,
          material: "Schwarzer Granit, poliert",
          current_stock: 12,
          unit: "m²",
          min_stock: 20,
          reorder_point: 25,
          demand_forecast: 45,
          status: "order_required",
          suggested_order_quantity: 50,
          lead_time_days: 14,
        },
        {
          material_id: 102,
          material: "Grauer Marmor",
          current_stock: 35,
          unit: "m²",
          min_stock: 15,
          reorder_point: 20,
          demand_forecast: 18,
          status: "sufficient",
          suggested_order_quantity: 0,
          lead_time_days: 21,
        },
      ],
      summary: {
        critical_items: 1,
        reorder_items: 3,
        sufficient_items: 15,
      },
    });
  }),
);

// POST /api/procurement/demand/calculate - Bedarfsplanung neu berechnen
router.post(
  "/demand/calculate",
  asyncHandler(async (_req, res) => {
    // TODO: Berechnung basierend auf Verkaufsprognosen, aktuellen Aufträgen etc.
    res.json({
      message: "Bedarfsplanung neu berechnet",
      calculated_at: new Date().toISOString(),
      items_analyzed: 25,
      order_recommendations: 4,
    });
  }),
);

export default router;
