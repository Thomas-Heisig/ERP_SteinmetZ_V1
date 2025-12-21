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
import { randomUUID } from "crypto";
import db from "../database/dbService.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { NotFoundError } from "../error/errors.js";
import type { SqlValue } from "../database/database.js";
import { createLogger } from "../../utils/logger.js";
import {
  type Customer,
  type Contact,
  type Opportunity,
  type Activity,
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
  createContactSchema,
  updateContactSchema,
  contactQuerySchema,
  createOpportunitySchema,
  updateOpportunitySchema,
  opportunityQuerySchema,
  createActivitySchema,
  updateActivitySchema,
  activityQuerySchema,
} from "./types.js";

const router = Router();
const logger = createLogger("crm");

// Export types for use in other modules
export type { Customer, Contact, Opportunity, Activity } from "./types.js";

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Verify CRM tables exist
 * Note: Tables are created by migrations (010_create_all_modules_tables.sql and 052_add_missing_crm_calendar_columns.sql)
 */
async function ensureTables(): Promise<void> {
  try {
    const tables = await db.all<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('crm_customers', 'crm_contacts', 'crm_opportunities', 'crm_activities')",
    );

    const tableNames = tables.map((t) => t.name);
    const requiredTables = [
      "crm_customers",
      "crm_contacts",
      "crm_opportunities",
      "crm_activities",
    ];
    const missingTables = requiredTables.filter((t) => !tableNames.includes(t));

    if (missingTables.length > 0) {
      logger.warn(
        { missingTables },
        "CRM tables not found - migrations may not have run",
      );
    } else {
      logger.info("CRM tables verified successfully");
    }
  } catch (error) {
    logger.error({ error }, "Failed to verify CRM tables");
  }
}

ensureTables();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function rowToCustomer(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string | undefined,
    phone: row.phone as string | undefined,
    company: row.company as string | undefined,
    address: row.address as string | undefined,
    city: row.city as string | undefined,
    postalCode: row.postal_code as string | undefined,
    country: row.country as string | undefined,
    status: (row.status as Customer["status"]) ?? "prospect",
    category: row.category as string | undefined,
    industry: row.industry as string | undefined,
    website: row.website as string | undefined,
    taxId: row.tax_id as string | undefined,
    notes: row.notes as string | undefined,
    assignedTo: row.assigned_to as string | undefined,
    createdBy: row.created_by as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToContact(row: Record<string, unknown>): Contact {
  return {
    id: row.id as string,
    customerId: row.customer_id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    email: row.email as string | undefined,
    phone: row.phone as string | undefined,
    mobile: row.mobile as string | undefined,
    position: row.position as string | undefined,
    department: row.department as string | undefined,
    isPrimary: Boolean(row.is_primary),
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToOpportunity(row: Record<string, unknown>): Opportunity {
  return {
    id: row.id as string,
    customerId: row.customer_id as string,
    contactId: row.contact_id as string | undefined,
    title: row.title as string,
    description: row.description as string | undefined,
    value: (row.value as number) ?? 0,
    probability: (row.probability as number) ?? 50,
    status: (row.status as Opportunity["status"]) ?? "open",
    stage: (row.stage as Opportunity["stage"]) ?? "lead",
    expectedCloseDate: row.expected_close_date as string | undefined,
    actualCloseDate: row.actual_close_date as string | undefined,
    assignedTo: row.assigned_to as string | undefined,
    source: row.source as string | undefined,
    competitors: row.competitors as string | undefined,
    nextStep: row.next_step as string | undefined,
    notes: row.notes as string | undefined,
    createdBy: row.created_by as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToActivity(row: Record<string, unknown>): Activity {
  return {
    id: row.id as string,
    customerId: row.customer_id as string | undefined,
    contactId: row.contact_id as string | undefined,
    opportunityId: row.opportunity_id as string | undefined,
    type: row.type as Activity["type"],
    subject: row.subject as string,
    description: row.description as string | undefined,
    status: (row.status as Activity["status"]) ?? "planned",
    scheduledAt: row.scheduled_at as string | undefined,
    completedAt: row.completed_at as string | undefined,
    durationMinutes: row.duration_minutes as number | undefined,
    assignedTo: row.assigned_to as string | undefined,
    outcome: row.outcome as Activity["outcome"] | undefined,
    location: row.location as string | undefined,
    attendees: row.attendees as string | undefined,
    notes: row.notes as string | undefined,
    createdBy: row.created_by as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ============================================================================
// CUSTOMERS ROUTES
// ============================================================================

/**
 * GET /api/crm/customers
 * List customers with filtering
 */
router.get(
  "/customers",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = customerQuerySchema.parse(req.query);
    const { status, search, category, industry, assignedTo, limit, offset } =
      validated;

    let sql = "SELECT * FROM crm_customers WHERE 1=1";
    const params: SqlValue[] = [];

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }
    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }
    if (industry) {
      sql += " AND industry = ?";
      params.push(industry);
    }
    if (assignedTo) {
      sql += " AND assigned_to = ?";
      params.push(assignedTo);
    }
    if (search) {
      sql += " AND (name LIKE ? OR email LIKE ? OR company LIKE ?)";
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rows = await db.all<Record<string, unknown>>(sql, params);
    const customers = rows.map(rowToCustomer);

    res.json({
      success: true,
      data: customers,
      pagination: { limit, offset, total: customers.length },
    });
  }),
);

/**
 * GET /api/crm/customers/:id
 */
router.get(
  "/customers/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const row = await db.get<Record<string, unknown>>(
      "SELECT * FROM crm_customers WHERE id = ?",
      [req.params.id],
    );

    if (!row) {
      throw new NotFoundError("Customer not found");
    }

    res.json({ success: true, data: rowToCustomer(row) });
  }),
);

/**
 * POST /api/crm/customers
 */
router.post(
  "/customers",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createCustomerSchema.parse(req.body);
    const id = `cust-${randomUUID()}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO crm_customers (
        id, name, email, phone, company, address, city, postal_code, country,
        status, category, industry, website, tax_id, notes, assigned_to,
        created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validated.name,
        validated.email ?? null,
        validated.phone ?? null,
        validated.company ?? null,
        validated.address ?? null,
        validated.city ?? null,
        validated.postalCode ?? null,
        validated.country ?? null,
        validated.status,
        validated.category ?? null,
        validated.industry ?? null,
        validated.website ?? null,
        validated.taxId ?? null,
        validated.notes ?? null,
        validated.assignedTo ?? null,
        validated.createdBy ?? null,
        now,
        now,
      ],
    );

    const customer: Customer = {
      id,
      ...validated,
      createdAt: now,
      updatedAt: now,
    };

    logger.info({ customerId: id, name: validated.name }, "Customer created");
    res.status(201).json({ success: true, data: customer });
  }),
);

/**
 * PUT /api/crm/customers/:id
 */
router.put(
  "/customers/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = updateCustomerSchema.parse(req.body);

    const existing = await db.get<Record<string, unknown>>(
      "SELECT * FROM crm_customers WHERE id = ?",
      [id],
    );

    if (!existing) {
      throw new NotFoundError("Customer not found");
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const params: SqlValue[] = [];

    // Build dynamic update
    const mapping: Record<string, string> = {
      name: "name",
      email: "email",
      phone: "phone",
      company: "company",
      address: "address",
      city: "city",
      postalCode: "postal_code",
      country: "country",
      status: "status",
      category: "category",
      industry: "industry",
      website: "website",
      taxId: "tax_id",
      notes: "notes",
      assignedTo: "assigned_to",
    };

    for (const [jsKey, dbKey] of Object.entries(mapping)) {
      if (jsKey in validated) {
        updates.push(`${dbKey} = ?`);
        params.push((validated as Record<string, unknown>)[jsKey] as SqlValue);
      }
    }

    if (updates.length === 0) {
      return res.json({ success: true, data: rowToCustomer(existing) });
    }

    updates.push("updated_at = ?");
    params.push(now, id);

    await db.run(
      `UPDATE crm_customers SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    const updated = await db.get<Record<string, unknown>>(
      "SELECT * FROM crm_customers WHERE id = ?",
      [id],
    );

    if (!updated) {
      throw new NotFoundError("Customer not found after update");
    }

    res.json({ success: true, data: rowToCustomer(updated) });
  }),
);

/**
 * DELETE /api/crm/customers/:id
 */
router.delete(
  "/customers/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await db.run("DELETE FROM crm_customers WHERE id = ?", [
      req.params.id,
    ]);

    if (result.changes === 0) {
      throw new NotFoundError("Customer not found");
    }

    res.json({ success: true, message: "Customer deleted" });
  }),
);

// ============================================================================
// CONTACTS ROUTES
// ============================================================================

/**
 * GET /api/crm/contacts
 */
router.get(
  "/contacts",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = contactQuerySchema.parse(req.query);
    const { customerId, search, isPrimary, limit, offset } = validated;

    let sql = "SELECT * FROM crm_contacts WHERE 1=1";
    const params: SqlValue[] = [];

    if (customerId) {
      sql += " AND customer_id = ?";
      params.push(customerId);
    }
    if (isPrimary !== undefined) {
      sql += " AND is_primary = ?";
      params.push(isPrimary ? 1 : 0);
    }
    if (search) {
      sql += " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)";
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += " ORDER BY is_primary DESC, last_name ASC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rows = await db.all<Record<string, unknown>>(sql, params);
    const contacts = rows.map(rowToContact);

    res.json({
      success: true,
      data: contacts,
      pagination: { limit, offset, total: contacts.length },
    });
  }),
);

/**
 * GET /api/crm/contacts/:id
 */
router.get(
  "/contacts/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const row = await db.get<Record<string, unknown>>(
      "SELECT * FROM crm_contacts WHERE id = ?",
      [req.params.id],
    );

    if (!row) {
      throw new NotFoundError("Contact not found");
    }

    res.json({ success: true, data: rowToContact(row) });
  }),
);

/**
 * POST /api/crm/contacts
 */
router.post(
  "/contacts",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createContactSchema.parse(req.body);
    const id = `contact-${randomUUID()}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO crm_contacts (
        id, customer_id, first_name, last_name, email, phone, mobile,
        position, department, is_primary, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validated.customerId,
        validated.firstName,
        validated.lastName,
        validated.email ?? null,
        validated.phone ?? null,
        validated.mobile ?? null,
        validated.position ?? null,
        validated.department ?? null,
        validated.isPrimary ? 1 : 0,
        validated.notes ?? null,
        now,
        now,
      ],
    );

    const contact: Contact = {
      id,
      ...validated,
      createdAt: now,
      updatedAt: now,
    };

    logger.info(
      { contactId: id, customerId: validated.customerId },
      "Contact created",
    );
    res.status(201).json({ success: true, data: contact });
  }),
);

/**
 * PUT /api/crm/contacts/:id
 */
router.put(
  "/contacts/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = updateContactSchema.parse(req.body);

    const existing = await db.get<Record<string, unknown>>(
      "SELECT * FROM crm_contacts WHERE id = ?",
      [id],
    );

    if (!existing) {
      throw new NotFoundError("Contact not found");
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const params: SqlValue[] = [];

    const mapping: Record<string, string> = {
      customerId: "customer_id",
      firstName: "first_name",
      lastName: "last_name",
      email: "email",
      phone: "phone",
      mobile: "mobile",
      position: "position",
      department: "department",
      isPrimary: "is_primary",
      notes: "notes",
    };

    for (const [jsKey, dbKey] of Object.entries(mapping)) {
      if (jsKey in validated) {
        updates.push(`${dbKey} = ?`);
        const value = (validated as Record<string, unknown>)[jsKey];
        params.push(
          jsKey === "isPrimary" ? (value ? 1 : 0) : (value as SqlValue),
        );
      }
    }

    if (updates.length === 0) {
      return res.json({ success: true, data: rowToContact(existing) });
    }

    updates.push("updated_at = ?");
    params.push(now, id);

    await db.run(
      `UPDATE crm_contacts SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    const updated = await db.get<Record<string, unknown>>(
      "SELECT * FROM crm_contacts WHERE id = ?",
      [id],
    );

    if (!updated) {
      throw new NotFoundError("Contact not found after update");
    }

    res.json({ success: true, data: rowToContact(updated) });
  }),
);

/**
 * DELETE /api/crm/contacts/:id
 */
router.delete(
  "/contacts/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await db.run("DELETE FROM crm_contacts WHERE id = ?", [
      req.params.id,
    ]);

    if (result.changes === 0) {
      throw new NotFoundError("Contact not found");
    }

    res.json({ success: true, message: "Contact deleted" });
  }),
);

// ============================================================================
// OPPORTUNITIES ROUTES
// ============================================================================

/**
 * GET /api/crm/opportunities
 */
router.get(
  "/opportunities",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = opportunityQuerySchema.parse(req.query);
    const {
      customerId,
      status,
      stage,
      assignedTo,
      minValue,
      maxValue,
      limit,
      offset,
    } = validated;

    let sql = "SELECT * FROM crm_opportunities WHERE 1=1";
    const params: SqlValue[] = [];

    if (customerId) {
      sql += " AND customer_id = ?";
      params.push(customerId);
    }
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }
    if (stage) {
      sql += " AND stage = ?";
      params.push(stage);
    }
    if (assignedTo) {
      sql += " AND assigned_to = ?";
      params.push(assignedTo);
    }
    if (minValue !== undefined) {
      sql += " AND value >= ?";
      params.push(minValue);
    }
    if (maxValue !== undefined) {
      sql += " AND value <= ?";
      params.push(maxValue);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rows = await db.all<Record<string, unknown>>(sql, params);
    const opportunities = rows.map(rowToOpportunity);

    res.json({
      success: true,
      data: opportunities,
      pagination: { limit, offset, total: opportunities.length },
    });
  }),
);

/**
 * GET /api/crm/opportunities/:id
 */
router.get(
  "/opportunities/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const row = await db.get<Record<string, unknown>>(
      "SELECT * FROM crm_opportunities WHERE id = ?",
      [req.params.id],
    );

    if (!row) {
      throw new NotFoundError("Opportunity not found");
    }

    res.json({ success: true, data: rowToOpportunity(row) });
  }),
);

/**
 * POST /api/crm/opportunities
 */
router.post(
  "/opportunities",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createOpportunitySchema.parse(req.body);
    const id = `opp-${randomUUID()}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO crm_opportunities (
        id, customer_id, contact_id, title, description, value, probability,
        status, stage, expected_close_date, actual_close_date, assigned_to,
        source, competitors, next_step, notes, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validated.customerId,
        validated.contactId ?? null,
        validated.title,
        validated.description ?? null,
        validated.value,
        validated.probability,
        validated.status,
        validated.stage,
        validated.expectedCloseDate ?? null,
        validated.actualCloseDate ?? null,
        validated.assignedTo ?? null,
        validated.source ?? null,
        validated.competitors ?? null,
        validated.nextStep ?? null,
        validated.notes ?? null,
        validated.createdBy ?? null,
        now,
        now,
      ],
    );

    const opportunity: Opportunity = {
      id,
      ...validated,
      createdAt: now,
      updatedAt: now,
    };

    logger.info(
      { opportunityId: id, customerId: validated.customerId },
      "Opportunity created",
    );
    res.status(201).json({ success: true, data: opportunity });
  }),
);

/**
 * PUT /api/crm/opportunities/:id
 */
router.put(
  "/opportunities/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = updateOpportunitySchema.parse(req.body);

    const existing = await db.get<Record<string, unknown>>(
      "SELECT * FROM crm_opportunities WHERE id = ?",
      [id],
    );

    if (!existing) {
      throw new NotFoundError("Opportunity not found");
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const params: SqlValue[] = [];

    const mapping: Record<string, string> = {
      customerId: "customer_id",
      contactId: "contact_id",
      title: "title",
      description: "description",
      value: "value",
      probability: "probability",
      status: "status",
      stage: "stage",
      expectedCloseDate: "expected_close_date",
      actualCloseDate: "actual_close_date",
      assignedTo: "assigned_to",
      source: "source",
      competitors: "competitors",
      nextStep: "next_step",
      notes: "notes",
    };

    for (const [jsKey, dbKey] of Object.entries(mapping)) {
      if (jsKey in validated) {
        updates.push(`${dbKey} = ?`);
        params.push((validated as Record<string, unknown>)[jsKey] as SqlValue);
      }
    }

    if (updates.length === 0) {
      return res.json({ success: true, data: rowToOpportunity(existing) });
    }

    updates.push("updated_at = ?");
    params.push(now, id);

    await db.run(
      `UPDATE crm_opportunities SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    const updated = await db.get<Record<string, unknown>>(
      "SELECT * FROM crm_opportunities WHERE id = ?",
      [id],
    );

    if (!updated) {
      throw new NotFoundError("Opportunity not found after update");
    }

    res.json({ success: true, data: rowToOpportunity(updated) });
  }),
);

/**
 * DELETE /api/crm/opportunities/:id
 */
router.delete(
  "/opportunities/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await db.run("DELETE FROM crm_opportunities WHERE id = ?", [
      req.params.id,
    ]);

    if (result.changes === 0) {
      throw new NotFoundError("Opportunity not found");
    }

    res.json({ success: true, message: "Opportunity deleted" });
  }),
);

// ============================================================================
// ACTIVITIES ROUTES
// ============================================================================

/**
 * GET /api/crm/activities
 */
router.get(
  "/activities",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = activityQuerySchema.parse(req.query);
    const {
      customerId,
      contactId,
      opportunityId,
      type,
      status,
      assignedTo,
      startDate,
      endDate,
      limit,
      offset,
    } = validated;

    let sql = "SELECT * FROM crm_activities WHERE 1=1";
    const params: SqlValue[] = [];

    if (customerId) {
      sql += " AND customer_id = ?";
      params.push(customerId);
    }
    if (contactId) {
      sql += " AND contact_id = ?";
      params.push(contactId);
    }
    if (opportunityId) {
      sql += " AND opportunity_id = ?";
      params.push(opportunityId);
    }
    if (type) {
      sql += " AND type = ?";
      params.push(type);
    }
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }
    if (assignedTo) {
      sql += " AND assigned_to = ?";
      params.push(assignedTo);
    }
    if (startDate) {
      sql += " AND (scheduled_at >= ? OR created_at >= ?)";
      params.push(startDate, startDate);
    }
    if (endDate) {
      sql += " AND (scheduled_at <= ? OR created_at <= ?)";
      params.push(endDate, endDate);
    }

    sql += " ORDER BY scheduled_at DESC, created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rows = await db.all<Record<string, unknown>>(sql, params);
    const activities = rows.map(rowToActivity);

    res.json({
      success: true,
      data: activities,
      pagination: { limit, offset, total: activities.length },
    });
  }),
);

/**
 * GET /api/crm/activities/:id
 */
router.get(
  "/activities/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const row = await db.get<Record<string, unknown>>(
      "SELECT * FROM crm_activities WHERE id = ?",
      [req.params.id],
    );

    if (!row) {
      throw new NotFoundError("Activity not found");
    }

    res.json({ success: true, data: rowToActivity(row) });
  }),
);

/**
 * POST /api/crm/activities
 */
router.post(
  "/activities",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createActivitySchema.parse(req.body);
    const id = `activity-${randomUUID()}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO crm_activities (
        id, customer_id, contact_id, opportunity_id, type, subject, description,
        status, scheduled_at, completed_at, duration_minutes, assigned_to, outcome,
        location, attendees, notes, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validated.customerId ?? null,
        validated.contactId ?? null,
        validated.opportunityId ?? null,
        validated.type,
        validated.subject,
        validated.description ?? null,
        validated.status,
        validated.scheduledAt ?? null,
        validated.completedAt ?? null,
        validated.durationMinutes ?? null,
        validated.assignedTo ?? null,
        validated.outcome ?? null,
        validated.location ?? null,
        validated.attendees ?? null,
        validated.notes ?? null,
        validated.createdBy ?? null,
        now,
        now,
      ],
    );

    const activity: Activity = {
      id,
      ...validated,
      createdAt: now,
      updatedAt: now,
    };

    logger.info({ activityId: id, type: validated.type }, "Activity created");
    res.status(201).json({ success: true, data: activity });
  }),
);

/**
 * PUT /api/crm/activities/:id
 */
router.put(
  "/activities/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = updateActivitySchema.parse(req.body);

    const existing = await db.get<Record<string, unknown>>(
      "SELECT * FROM crm_activities WHERE id = ?",
      [id],
    );

    if (!existing) {
      throw new NotFoundError("Activity not found");
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const params: SqlValue[] = [];

    const mapping: Record<string, string> = {
      customerId: "customer_id",
      contactId: "contact_id",
      opportunityId: "opportunity_id",
      type: "type",
      subject: "subject",
      description: "description",
      status: "status",
      scheduledAt: "scheduled_at",
      completedAt: "completed_at",
      durationMinutes: "duration_minutes",
      assignedTo: "assigned_to",
      outcome: "outcome",
      location: "location",
      attendees: "attendees",
      notes: "notes",
    };

    for (const [jsKey, dbKey] of Object.entries(mapping)) {
      if (jsKey in validated) {
        updates.push(`${dbKey} = ?`);
        params.push((validated as Record<string, unknown>)[jsKey] as SqlValue);
      }
    }

    if (updates.length === 0) {
      return res.json({ success: true, data: rowToActivity(existing) });
    }

    updates.push("updated_at = ?");
    params.push(now, id);

    await db.run(
      `UPDATE crm_activities SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    const updated = await db.get<Record<string, unknown>>(
      "SELECT * FROM crm_activities WHERE id = ?",
      [id],
    );

    if (!updated) {
      throw new NotFoundError("Activity not found after update");
    }

    res.json({ success: true, data: rowToActivity(updated) });
  }),
);

/**
 * DELETE /api/crm/activities/:id
 */
router.delete(
  "/activities/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await db.run("DELETE FROM crm_activities WHERE id = ?", [
      req.params.id,
    ]);

    if (result.changes === 0) {
      throw new NotFoundError("Activity not found");
    }

    res.json({ success: true, message: "Activity deleted" });
  }),
);

// ============================================================================
// STATISTICS ROUTES
// ============================================================================

/**
 * GET /api/crm/stats
 */
router.get(
  "/stats",
  asyncHandler(async (req: Request, res: Response) => {
    const customerStats = await db.get<{
      total: number;
      active: number;
      inactive: number;
      prospect: number;
      archived: number;
    }>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN status = 'prospect' THEN 1 ELSE 0 END) as prospect,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived
       FROM crm_customers`,
    );

    const contactStats = await db.get<{
      total: number;
      primary: number;
    }>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_primary = 1 THEN 1 ELSE 0 END) as primary
       FROM crm_contacts`,
    );

    const opportunityStats = await db.get<{
      total: number;
      open: number;
      won: number;
      lost: number;
      totalValue: number;
      avgValue: number;
      avgProbability: number;
    }>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won,
        SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost,
        COALESCE(SUM(value), 0) as totalValue,
        COALESCE(AVG(value), 0) as avgValue,
        COALESCE(AVG(probability), 0) as avgProbability
       FROM crm_opportunities`,
    );

    const activityStats = await db.get<{
      total: number;
      planned: number;
      completed: number;
      thisMonth: number;
    }>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END) as planned,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') THEN 1 ELSE 0 END) as thisMonth
       FROM crm_activities`,
    );

    res.json({
      success: true,
      data: {
        customers: customerStats,
        contacts: contactStats,
        opportunities: opportunityStats,
        activities: activityStats,
      },
    });
  }),
);

export default router;
