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

// In-memory storage (for demonstration)
const customers = new Map<string, any>();
const contacts = new Map<string, any>();
const opportunities = new Map<string, any>();
const activities = new Map<string, any>();

// Initialize with sample data
let customerCounter = 0;
let contactCounter = 0;
let opportunityCounter = 0;
let activityCounter = 0;

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
    let results = Array.from(customers.values());

    // Apply filters
    if (status) {
      results = results.filter((c) => c.status === status);
    }
    if (category) {
      results = results.filter((c) => c.category === category);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(
        (c) =>
          c.name?.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower) ||
          c.company?.toLowerCase().includes(searchLower),
      );
    }

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
    const customer = customers.get(req.params.id);

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

    const id = `cust-${++customerCounter}`;
    const customer = {
      id,
      ...validation.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customers.set(id, customer);

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
    const customer = customers.get(req.params.id);

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    const validation = updateCustomerSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError(
        "Invalid customer data",
        validation.error.issues,
      );
    }

    const updated = {
      ...customer,
      ...validation.data,
      updatedAt: new Date().toISOString(),
    };

    customers.set(req.params.id, updated);

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
    if (!customers.has(req.params.id)) {
      throw new NotFoundError("Customer not found");
    }

    customers.delete(req.params.id);

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
    const results = Array.from(contacts.values());

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
    const id = `contact-${++contactCounter}`;
    const contact = {
      id,
      ...req.body,
      createdAt: new Date().toISOString(),
    };

    contacts.set(id, contact);

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
    const results = Array.from(opportunities.values());

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
    const id = `opp-${++opportunityCounter}`;
    const opportunity = {
      id,
      ...req.body,
      status: req.body.status || "open",
      createdAt: new Date().toISOString(),
    };

    opportunities.set(id, opportunity);

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
    const results = Array.from(activities.values());

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
    const id = `activity-${++activityCounter}`;
    const activity = {
      id,
      ...req.body,
      timestamp: new Date().toISOString(),
    };

    activities.set(id, activity);

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
    const stats = {
      totalCustomers: customers.size,
      activeCustomers: Array.from(customers.values()).filter(
        (c) => c.status === "active",
      ).length,
      prospects: Array.from(customers.values()).filter(
        (c) => c.status === "prospect",
      ).length,
      totalOpportunities: opportunities.size,
      totalActivities: activities.size,
      totalContacts: contacts.size,
    };

    res.json({
      success: true,
      data: stats,
    });
  }),
);

export default router;
