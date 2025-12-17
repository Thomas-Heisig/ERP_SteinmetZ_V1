// SPDX-License-Identifier: MIT
// apps/backend/src/routes/production/productionRouter.ts
/**
 * @module ProductionRouter
 * @description Produktion & Fertigung - Planung, Steuerung, QM, Wartung
 */

import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { z } from "zod";
import { BadRequestError, NotFoundError } from "../../types/errors.js";

const router = Router();

/* ---------------------------------------------------------
   PRODUKTIONSPLANUNG
--------------------------------------------------------- */

// GET /api/production/planning - Produktionsplan abrufen
router.get(
  "/planning",
  asyncHandler(async (_req, res) => {
    res.json({
      week: 51,
      year: 2025,
      capacity_utilization: 87,
      orders: [
        {
          id: "FO-2025-001",
          order_id: "OR-2025-001",
          product: "Grabstein Modell A",
          quantity: 1,
          start_date: "2025-12-18",
          end_date: "2025-12-22",
          status: "scheduled",
          machine: "Fräsmaschine 1",
          priority: "high",
        },
        {
          id: "FO-2025-002",
          order_id: "OR-2025-003",
          product: "Gedenktafel",
          quantity: 3,
          start_date: "2025-12-19",
          end_date: "2025-12-21",
          status: "in_progress",
          machine: "Fräsmaschine 2",
          priority: "normal",
        },
      ],
    });
  }),
);

// POST /api/production/planning - Produktionsauftrag einplanen
const planningSchema = z.object({
  order_id: z.string(),
  product_id: z.number(),
  quantity: z.number().positive(),
  requested_delivery_date: z.string(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  special_instructions: z.string().optional(),
});

router.post(
  "/planning",
  asyncHandler(async (req, res) => {
    const validatedData = planningSchema.parse(req.body);

    // TODO: Automatische Planung mit Kapazitätsprüfung
    const orderNumber = `FO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

    res.status(201).json({
      message: "Produktionsauftrag eingeplant",
      data: {
        id: orderNumber,
        ...validatedData,
        start_date: "2025-12-20",
        end_date: "2025-12-24",
        machine: "Fräsmaschine 1",
        status: "scheduled",
        created_at: new Date().toISOString(),
      },
    });
  }),
);

/* ---------------------------------------------------------
   FERTIGUNGSAUFTRÄGE
--------------------------------------------------------- */

// GET /api/production/orders - Alle Fertigungsaufträge
router.get(
  "/orders",
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;

    const orders = [
      {
        id: "FO-2025-001",
        order_id: "OR-2025-001",
        product: "Grabstein Modell A",
        quantity: 1,
        status: "in_progress",
        progress: 65,
        machine: "Fräsmaschine 1",
        operator: "Hans Müller",
        start_time: "2025-12-18T08:00:00Z",
        estimated_completion: "2025-12-22T16:00:00Z",
      },
      {
        id: "FO-2025-002",
        order_id: "OR-2025-003",
        product: "Gedenktafel",
        quantity: 3,
        status: "completed",
        progress: 100,
        machine: "Fräsmaschine 2",
        operator: "Maria Schmidt",
        start_time: "2025-12-19T08:00:00Z",
        completion_time: "2025-12-21T14:30:00Z",
      },
    ];

    const filtered = status
      ? orders.filter((o) => o.status === status)
      : orders;

    res.json({ orders: filtered });
  }),
);

// GET /api/production/orders/:id - Einzelner Fertigungsauftrag
router.get(
  "/orders/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    res.json({
      id,
      order_id: "OR-2025-001",
      product: {
        id: 1,
        name: "Grabstein Modell A",
        material: "Schwarzer Granit",
        dimensions: "100x50x10 cm",
      },
      quantity: 1,
      status: "in_progress",
      progress: 65,
      machine: {
        id: 1,
        name: "Fräsmaschine 1",
        status: "running",
      },
      operator: {
        id: 5,
        name: "Hans Müller",
      },
      work_steps: [
        {
          step: 1,
          description: "Material zuschneiden",
          status: "completed",
          duration_minutes: 45,
        },
        {
          step: 2,
          description: "Fräsen",
          status: "in_progress",
          duration_minutes: 120,
          progress: 60,
        },
        {
          step: 3,
          description: "Polieren",
          status: "pending",
          duration_minutes: 90,
        },
        {
          step: 4,
          description: "Qualitätskontrolle",
          status: "pending",
          duration_minutes: 30,
        },
      ],
      materials: [
        {
          material: "Schwarzer Granit",
          planned: 0.5,
          used: 0.48,
          unit: "m²",
        },
      ],
      start_time: "2025-12-18T08:00:00Z",
      estimated_completion: "2025-12-22T16:00:00Z",
    });
  }),
);

// POST /api/production/orders/:id/feedback - Rückmeldung erfassen
const feedbackSchema = z.object({
  step: z.number(),
  status: z.enum(["started", "in_progress", "completed", "paused", "failed"]),
  quantity_completed: z.number().optional(),
  quantity_scrapped: z.number().optional(),
  notes: z.string().optional(),
  materials_used: z
    .array(
      z.object({
        material_id: z.number(),
        quantity: z.number(),
      }),
    )
    .optional(),
});

router.post(
  "/orders/:id/feedback",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const validatedData = feedbackSchema.parse(req.body);

    res.json({
      message: "Rückmeldung erfasst",
      data: {
        order_id: id,
        ...validatedData,
        timestamp: new Date().toISOString(),
      },
    });
  }),
);

/* ---------------------------------------------------------
   MASCHINEN & KAPAZITÄTEN
--------------------------------------------------------- */

// GET /api/production/machines - Alle Maschinen
router.get(
  "/machines",
  asyncHandler(async (_req, res) => {
    res.json({
      machines: [
        {
          id: 1,
          name: "Fräsmaschine 1",
          type: "CNC-Fräse",
          status: "running",
          utilization: 87,
          current_order: "FO-2025-001",
          next_maintenance: "2026-01-15",
          efficiency: 94,
        },
        {
          id: 2,
          name: "Fräsmaschine 2",
          type: "CNC-Fräse",
          status: "idle",
          utilization: 65,
          current_order: null,
          next_maintenance: "2026-02-10",
          efficiency: 91,
        },
        {
          id: 3,
          name: "Poliermaschine 1",
          type: "Polieranlage",
          status: "maintenance",
          utilization: 0,
          current_order: null,
          next_maintenance: "2025-12-17",
          efficiency: 88,
        },
      ],
    });
  }),
);

// GET /api/production/machines/:id - Einzelne Maschine
router.get(
  "/machines/:id",
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new BadRequestError("Ungültige Maschinen-ID");
    }

    res.json({
      id,
      name: "Fräsmaschine 1",
      type: "CNC-Fräse",
      manufacturer: "Hersteller XYZ",
      model: "CNC-2000",
      serial_number: "SN123456",
      installation_date: "2020-03-15",
      status: "running",
      current_order: "FO-2025-001",
      utilization: 87,
      efficiency: 94,
      total_runtime_hours: 12450,
      maintenance: {
        last: "2025-11-15",
        next: "2026-01-15",
        interval_days: 60,
        status: "ok",
      },
      performance: {
        availability: 96,
        quality_rate: 98,
        oee: 92,
      },
    });
  }),
);

/* ---------------------------------------------------------
   QUALITÄTSMANAGEMENT
--------------------------------------------------------- */

// GET /api/production/quality - Qualitätsübersicht
router.get(
  "/quality",
  asyncHandler(async (_req, res) => {
    res.json({
      overall_quality_rate: 97.8,
      inspections_today: 15,
      passed: 14,
      failed: 1,
      defect_rate: 2.2,
      top_defects: [
        { type: "Oberflächenfehler", count: 8, percentage: 53 },
        { type: "Maßabweichung", count: 5, percentage: 33 },
        { type: "Materialfehler", count: 2, percentage: 14 },
      ],
    });
  }),
);

// POST /api/production/quality/inspection - Qualitätsprüfung erfassen
const inspectionSchema = z.object({
  order_id: z.string(),
  inspector: z.string(),
  result: z.enum(["passed", "failed", "rework"]),
  checks: z.array(
    z.object({
      check_point: z.string(),
      result: z.enum(["ok", "nok"]),
      measured_value: z.string().optional(),
      target_value: z.string().optional(),
      notes: z.string().optional(),
    }),
  ),
  overall_notes: z.string().optional(),
});

router.post(
  "/quality/inspection",
  asyncHandler(async (req, res) => {
    const validatedData = inspectionSchema.parse(req.body);

    res.status(201).json({
      message: "Qualitätsprüfung erfasst",
      data: {
        id: Date.now(),
        ...validatedData,
        timestamp: new Date().toISOString(),
      },
    });
  }),
);

/* ---------------------------------------------------------
   WARTUNG & INSTANDHALTUNG
--------------------------------------------------------- */

// GET /api/production/maintenance - Wartungsübersicht
router.get(
  "/maintenance",
  asyncHandler(async (_req, res) => {
    res.json({
      upcoming: [
        {
          id: 1,
          machine: "Fräsmaschine 1",
          type: "Regelmäßige Wartung",
          due_date: "2026-01-15",
          status: "scheduled",
        },
        {
          id: 2,
          machine: "Poliermaschine 1",
          type: "Reparatur",
          due_date: "2025-12-17",
          status: "in_progress",
        },
      ],
      overdue: [],
      completed_this_month: 5,
    });
  }),
);

// POST /api/production/maintenance - Wartung erfassen
const maintenanceSchema = z.object({
  machine_id: z.number(),
  type: z.enum(["regular", "repair", "inspection"]),
  description: z.string(),
  scheduled_date: z.string(),
  estimated_duration_hours: z.number().positive(),
  spare_parts: z
    .array(
      z.object({
        part_id: z.number(),
        quantity: z.number(),
      }),
    )
    .optional(),
});

router.post(
  "/maintenance",
  asyncHandler(async (req, res) => {
    const validatedData = maintenanceSchema.parse(req.body);

    res.status(201).json({
      message: "Wartung geplant",
      data: {
        id: Date.now(),
        ...validatedData,
        status: "scheduled",
        created_at: new Date().toISOString(),
      },
    });
  }),
);

export default router;
