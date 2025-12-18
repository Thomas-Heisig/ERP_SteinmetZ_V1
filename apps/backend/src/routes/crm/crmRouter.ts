// SPDX-License-Identifier: MIT
// apps/backend/src/routes/crm/crmRouter.ts

/**
 * CRM (Customer Relationship Management) Router
 *
 * Provides comprehensive CRM API including customer records,
 * contacts, opportunities, activities, and interaction tracking.
 *
 * @module routes/crm
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { NotFoundError, ValidationError } from "../../types/errors.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import pino from "pino";
import db from "../../services/dbService.js";
import { randomUUID } from "crypto";

const router = Router();
const _logger = pino({ level: process.env.LOG_LEVEL || "info" }); // Reserved for future logging

// Validation schemas
const customerQuerySchema = z.object({
  status: z.enum(["active", "inactive", "prospect"]).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
});

const createCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive", "prospect"]).default("prospect"),
  category: z.string().optional(),
  notes: z.string().optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

/**
 * GET /api/crm/customers
 * List all customers with optional filtering
 */
router.get(
  "/customers",
  asyncHandler(async (req: Request, res: Response) => {
    const query = customerQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw new ValidationError("Invalid query parameters", query.error.issues);
    }

    const { status, search, category } = query.data;

    let sql = "SELECT * FROM crm_customers WHERE 1=1";
    const params: any[] = [];

    // Apply filters
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }
    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }
    if (search) {
      sql += " AND (name LIKE ? OR email LIKE ? OR company LIKE ?)";
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += " ORDER BY created_at DESC";

    const results = await db.all(sql, params);

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  }),
);

/**
 * GET /api/crm/customers/:id
 * Get a specific customer by ID
 */
router.get(
  "/customers/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const customer = await db.get("SELECT * FROM crm_customers WHERE id = ?", [
      req.params.id,
    ]);

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    res.json({
      success: true,
      data: customer,
    });
  }),
);

/**
 * POST /api/crm/customers
 * Create a new customer
 */
router.post(
  "/customers",
  asyncHandler(async (req: Request, res: Response) => {
    const validation = createCustomerSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError(
        "Invalid customer data",
        validation.error.issues,
      );
    }

    const id = `cust-${randomUUID()}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO crm_customers (id, name, email, phone, company, address, status, category, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validation.data.name,
        validation.data.email || null,
        validation.data.phone || null,
        validation.data.company || null,
        validation.data.address || null,
        validation.data.status,
        validation.data.category || null,
        validation.data.notes || null,
        now,
        now,
      ],
    );

    const customer = await db.get("SELECT * FROM crm_customers WHERE id = ?", [
      id,
    ]);

    res.status(201).json({
      success: true,
      data: customer,
    });
  }),
);

/**
 * PUT /api/crm/customers/:id
 * Update an existing customer
 */
router.put(
  "/customers/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await db.get("SELECT * FROM crm_customers WHERE id = ?", [
      req.params.id,
    ]);

    if (!existing) {
      throw new NotFoundError("Customer not found");
    }

    const validation = updateCustomerSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError(
        "Invalid customer data",
        validation.error.issues,
      );
    }

    const now = new Date().toISOString();
    const updates = validation.data;

    // Build dynamic UPDATE query
    const fields = Object.keys(updates);
    if (fields.length === 0) {
      return res.json({ success: true, data: existing });
    }

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = [
      ...fields.map((f) => (updates as any)[f]),
      now,
      req.params.id,
    ];

    await db.run(
      `UPDATE crm_customers SET ${setClause}, updated_at = ? WHERE id = ?`,
      values,
    );

    const updated = await db.get("SELECT * FROM crm_customers WHERE id = ?", [
      req.params.id,
    ]);

    res.json({
      success: true,
      data: updated,
    });
  }),
);

/**
 * DELETE /api/crm/customers/:id
 * Delete a customer
 */
router.delete(
  "/customers/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await db.get("SELECT * FROM crm_customers WHERE id = ?", [
      req.params.id,
    ]);

    if (!existing) {
      throw new NotFoundError("Customer not found");
    }

    await db.run("DELETE FROM crm_customers WHERE id = ?", [req.params.id]);

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  }),
);

/**
 * GET /api/crm/contacts
 * List all contacts
 */
router.get(
  "/contacts",
  asyncHandler(async (req: Request, res: Response) => {
    const results = await db.all(
      "SELECT * FROM crm_contacts ORDER BY created_at DESC",
    );

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  }),
);

/**
 * POST /api/crm/contacts
 * Create a new contact
 */
router.post(
  "/contacts",
  asyncHandler(async (req: Request, res: Response) => {
    const id = `contact-${randomUUID()}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO crm_contacts (id, customer_id, first_name, last_name, email, phone, position, department, is_primary, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        req.body.customer_id || null,
        req.body.first_name || "",
        req.body.last_name || "",
        req.body.email || null,
        req.body.phone || null,
        req.body.position || null,
        req.body.department || null,
        req.body.is_primary || 0,
        req.body.notes || null,
        now,
        now,
      ],
    );

    const contact = await db.get("SELECT * FROM crm_contacts WHERE id = ?", [
      id,
    ]);

    res.status(201).json({
      success: true,
      data: contact,
    });
  }),
);

/**
 * GET /api/crm/opportunities
 * List all sales opportunities
 */
router.get(
  "/opportunities",
  asyncHandler(async (req: Request, res: Response) => {
    const results = await db.all(
      "SELECT * FROM crm_opportunities ORDER BY created_at DESC",
    );

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  }),
);

/**
 * POST /api/crm/opportunities
 * Create a new opportunity
 */
router.post(
  "/opportunities",
  asyncHandler(async (req: Request, res: Response) => {
    const id = `opp-${randomUUID()}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO crm_opportunities (id, customer_id, title, description, value, probability, status, stage, expected_close_date, assigned_to, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        req.body.customer_id || null,
        req.body.title || "",
        req.body.description || null,
        req.body.value || 0,
        req.body.probability || 50,
        req.body.status || "open",
        req.body.stage || null,
        req.body.expected_close_date || null,
        req.body.assigned_to || null,
        req.body.notes || null,
        now,
        now,
      ],
    );

    const opportunity = await db.get(
      "SELECT * FROM crm_opportunities WHERE id = ?",
      [id],
    );

    res.status(201).json({
      success: true,
      data: opportunity,
    });
  }),
);

/**
 * GET /api/crm/activities
 * List all customer activities
 */
router.get(
  "/activities",
  asyncHandler(async (req: Request, res: Response) => {
    const results = await db.all(
      "SELECT * FROM crm_activities ORDER BY created_at DESC",
    );

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  }),
);

/**
 * POST /api/crm/activities
 * Log a new activity
 */
router.post(
  "/activities",
  asyncHandler(async (req: Request, res: Response) => {
    const id = `activity-${randomUUID()}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO crm_activities (id, customer_id, contact_id, opportunity_id, type, subject, description, status, scheduled_at, completed_at, duration_minutes, assigned_to, outcome, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        req.body.customer_id || null,
        req.body.contact_id || null,
        req.body.opportunity_id || null,
        req.body.type || "note",
        req.body.subject || "",
        req.body.description || null,
        req.body.status || "planned",
        req.body.scheduled_at || null,
        req.body.completed_at || null,
        req.body.duration_minutes || null,
        req.body.assigned_to || null,
        req.body.outcome || null,
        req.body.notes || null,
        now,
        now,
      ],
    );

    const activity = await db.get("SELECT * FROM crm_activities WHERE id = ?", [
      id,
    ]);

    res.status(201).json({
      success: true,
      data: activity,
    });
  }),
);

/**
 * GET /api/crm/stats
 * Get CRM statistics
 */
router.get(
  "/stats",
  asyncHandler(async (req: Request, res: Response) => {
    const totalCustomers = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM crm_customers",
    );
    const activeCustomers = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM crm_customers WHERE status = 'active'",
    );
    const prospects = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM crm_customers WHERE status = 'prospect'",
    );
    const totalOpportunities = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM crm_opportunities",
    );
    const totalActivities = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM crm_activities",
    );
    const totalContacts = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM crm_contacts",
    );

    const stats = {
      totalCustomers: totalCustomers?.count || 0,
      activeCustomers: activeCustomers?.count || 0,
      prospects: prospects?.count || 0,
      totalOpportunities: totalOpportunities?.count || 0,
      totalActivities: totalActivities?.count || 0,
      totalContacts: totalContacts?.count || 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  }),
);

export default router;
