// SPDX-License-Identifier: MIT
// apps/backend/src/routes/marketing/marketingRouter.ts

/**
 * Marketing Router
 *
 * Provides comprehensive marketing API including campaign management,
 * lead generation, marketing automation, and analytics.
 *
 * @module routes/marketing
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { NotFoundError, ValidationError } from "../error/errors.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { createLogger } from "../../utils/logger.js";
import db from "../database/dbService.js";
import { randomUUID } from "crypto";

const router = Router();
const logger = createLogger("marketing");

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum([
    "email",
    "social",
    "sem",
    "seo",
    "offline",
    "event",
    "telephone",
  ]),
  status: z
    .enum(["draft", "planned", "active", "paused", "completed", "cancelled"])
    .default("draft"),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.number().min(0).default(0),
  target_audience: z.string().optional(),
  goals: z.string().optional(), // JSON string
});

const updateCampaignSchema = createCampaignSchema.partial();

const createFormSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  form_type: z.enum([
    "contact",
    "newsletter",
    "download",
    "registration",
    "survey",
    "custom",
  ]),
  form_config: z.string(), // JSON string with field definitions
  success_message: z.string().optional(),
  redirect_url: z.string().url().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

const createLandingPageSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  content: z.string(), // HTML/JSON content
  form_id: z.string().optional(),
  template_id: z.string().optional(),
  seo_config: z.string().optional(), // JSON string
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

const createEventSchema = z.object({
  campaign_id: z.string().optional(),
  name: z.string().min(1).max(200),
  event_type: z.enum(["webinar", "live", "hybrid", "conference", "networking"]),
  description: z.string().optional(),
  start_date: z.string(),
  end_date: z.string(),
  location: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  budget: z.number().min(0).default(0),
});

const createSegmentSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  segment_type: z
    .enum([
      "demographic",
      "firmographic",
      "behavioral",
      "psychographic",
      "custom",
    ])
    .optional(),
  criteria: z.string(), // JSON string with criteria
  status: z.enum(["active", "inactive"]).default("active"),
});

// =============================================================================
// CAMPAIGN MANAGEMENT
// =============================================================================

/**
 * GET /api/marketing/campaigns
 * List all marketing campaigns with optional filtering
 */
router.get(
  "/campaigns",
  asyncHandler(async (req: Request, res: Response) => {
    const { status, type } = req.query;

    let sql = "SELECT * FROM marketing_campaigns WHERE 1=1";
    const params: string[] = [];

    if (status) {
      sql += " AND status = ?";
      params.push(status as string);
    }
    if (type) {
      sql += " AND type = ?";
      params.push(type as string);
    }

    sql += " ORDER BY created_at DESC";

    const campaigns = await db.all(sql, params);

    res.json({
      success: true,
      data: campaigns,
      count: campaigns.length,
    });
  }),
);

/**
 * GET /api/marketing/campaigns/:id
 * Get a specific campaign by ID
 */
router.get(
  "/campaigns/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const campaign = await db.get(
      "SELECT * FROM marketing_campaigns WHERE id = ?",
      [req.params.id],
    );

    if (!campaign) {
      throw new NotFoundError("Campaign not found");
    }

    res.json({
      success: true,
      data: campaign,
    });
  }),
);

/**
 * POST /api/marketing/campaigns
 * Create a new marketing campaign
 */
router.post(
  "/campaigns",
  asyncHandler(async (req: Request, res: Response) => {
    const validation = createCampaignSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError("Invalid campaign data", {
        issues: validation.error.issues,
      });
    }

    const id = `camp-${randomUUID()}`;
    const now = new Date().toISOString();
    const data = validation.data;

    await db.run(
      `INSERT INTO marketing_campaigns (id, name, type, status, description, start_date, end_date, budget, target_audience, goals, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.type,
        data.status,
        data.description || null,
        data.start_date || null,
        data.end_date || null,
        data.budget,
        data.target_audience || null,
        data.goals || null,
        now,
        now,
      ],
    );

    const campaign = await db.get(
      "SELECT * FROM marketing_campaigns WHERE id = ?",
      [id],
    );

    logger.info({ campaign_id: id }, "Marketing campaign created");

    res.status(201).json({
      success: true,
      data: campaign,
    });
  }),
);

/**
 * PUT /api/marketing/campaigns/:id
 * Update an existing campaign
 */
router.put(
  "/campaigns/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await db.get(
      "SELECT * FROM marketing_campaigns WHERE id = ?",
      [req.params.id],
    );

    if (!existing) {
      throw new NotFoundError("Campaign not found");
    }

    const validation = updateCampaignSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError("Invalid campaign data", {
        issues: validation.error.issues,
      });
    }

    const now = new Date().toISOString();
    const updates = validation.data;
    const fields = Object.keys(updates);

    if (fields.length === 0) {
      return res.json({ success: true, data: existing });
    }

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values: Array<unknown> = [
      ...fields.map((f) => (updates as Record<string, unknown>)[f]),
      now,
      req.params.id,
    ];

    await db.run(
      `UPDATE marketing_campaigns SET ${setClause}, updated_at = ? WHERE id = ?`,
      values as Array<string | number | null>,
    );

    const updated = await db.get(
      "SELECT * FROM marketing_campaigns WHERE id = ?",
      [req.params.id],
    );

    res.json({
      success: true,
      data: updated,
    });
  }),
);

/**
 * DELETE /api/marketing/campaigns/:id
 * Delete a campaign
 */
router.delete(
  "/campaigns/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await db.get(
      "SELECT * FROM marketing_campaigns WHERE id = ?",
      [req.params.id],
    );

    if (!existing) {
      throw new NotFoundError("Campaign not found");
    }

    await db.run("DELETE FROM marketing_campaigns WHERE id = ?", [
      req.params.id,
    ]);

    res.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  }),
);

/**
 * GET /api/marketing/campaigns/:id/metrics
 * Get performance metrics for a campaign
 */
router.get(
  "/campaigns/:id/metrics",
  asyncHandler(async (req: Request, res: Response) => {
    const metrics = await db.all(
      "SELECT * FROM marketing_campaign_metrics WHERE campaign_id = ? ORDER BY metric_date DESC",
      [req.params.id],
    );

    res.json({
      success: true,
      data: metrics,
      count: metrics.length,
    });
  }),
);

// =============================================================================
// WEB FORMS
// =============================================================================

/**
 * GET /api/marketing/forms
 * List all web forms
 */
router.get(
  "/forms",
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;

    let sql = "SELECT * FROM marketing_forms WHERE 1=1";
    const params: string[] = [];

    if (status) {
      sql += " AND status = ?";
      params.push(status as string);
    }

    sql += " ORDER BY created_at DESC";

    const forms = await db.all(sql, params);

    res.json({
      success: true,
      data: forms,
      count: forms.length,
    });
  }),
);

/**
 * GET /api/marketing/forms/:id
 * Get a specific form by ID
 */
router.get(
  "/forms/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const form = await db.get("SELECT * FROM marketing_forms WHERE id = ?", [
      req.params.id,
    ]);

    if (!form) {
      throw new NotFoundError("Form not found");
    }

    res.json({
      success: true,
      data: form,
    });
  }),
);

/**
 * POST /api/marketing/forms
 * Create a new web form
 */
router.post(
  "/forms",
  asyncHandler(async (req: Request, res: Response) => {
    const validation = createFormSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError("Invalid form data", {
        issues: validation.error.issues,
      });
    }

    const id = `form-${randomUUID()}`;
    const now = new Date().toISOString();
    const data = validation.data;

    await db.run(
      `INSERT INTO marketing_forms (id, name, description, form_type, form_config, success_message, redirect_url, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.description || null,
        data.form_type,
        data.form_config,
        data.success_message || null,
        data.redirect_url || null,
        data.status,
        now,
        now,
      ],
    );

    const form = await db.get("SELECT * FROM marketing_forms WHERE id = ?", [
      id,
    ]);

    res.status(201).json({
      success: true,
      data: form,
    });
  }),
);

/**
 * POST /api/marketing/forms/:id/submit
 * Submit a form (public endpoint for lead capture)
 */
router.post(
  "/forms/:id/submit",
  asyncHandler(async (req: Request, res: Response) => {
    const form = await db.get(
      "SELECT * FROM marketing_forms WHERE id = ? AND status = 'published'",
      [req.params.id],
    );

    if (!form) {
      throw new NotFoundError("Form not found or not published");
    }

    const submissionId = `sub-${randomUUID()}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO marketing_form_submissions (id, form_id, submission_data, ip_address, user_agent, referrer_url, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        submissionId,
        req.params.id,
        JSON.stringify(req.body),
        req.ip || null,
        req.get("user-agent") || null,
        req.get("referer") || null,
        now,
      ],
    );

    // Update form submission count
    await db.run(
      "UPDATE marketing_forms SET submission_count = submission_count + 1 WHERE id = ?",
      [req.params.id],
    );

    res.status(201).json({
      success: true,
      message: form.success_message || "Form submitted successfully",
      redirect_url: form.redirect_url,
    });
  }),
);

// =============================================================================
// LANDING PAGES
// =============================================================================

/**
 * GET /api/marketing/landing-pages
 * List all landing pages
 */
router.get(
  "/landing-pages",
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;

    let sql = "SELECT * FROM marketing_landing_pages WHERE 1=1";
    const params: string[] = [];

    if (status) {
      sql += " AND status = ?";
      params.push(status as string);
    }

    sql += " ORDER BY created_at DESC";

    const pages = await db.all(sql, params);

    res.json({
      success: true,
      data: pages,
      count: pages.length,
    });
  }),
);

/**
 * GET /api/marketing/landing-pages/:slug
 * Get a landing page by slug
 */
router.get(
  "/landing-pages/:slug",
  asyncHandler(async (req: Request, res: Response) => {
    const page = await db.get<{ id: string }>(
      "SELECT * FROM marketing_landing_pages WHERE slug = ? AND status = 'published'",
      [req.params.slug],
    );

    if (!page) {
      throw new NotFoundError("Landing page not found");
    }

    // Increment view count
    await db.run(
      "UPDATE marketing_landing_pages SET views = views + 1 WHERE id = ?",
      [page.id],
    );

    res.json({
      success: true,
      data: page,
    });
  }),
);

/**
 * POST /api/marketing/landing-pages
 * Create a new landing page
 */
router.post(
  "/landing-pages",
  asyncHandler(async (req: Request, res: Response) => {
    const validation = createLandingPageSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError("Invalid landing page data", {
        issues: validation.error.issues,
      });
    }

    const id = `lp-${randomUUID()}`;
    const now = new Date().toISOString();
    const data = validation.data;

    await db.run(
      `INSERT INTO marketing_landing_pages (id, name, slug, title, description, content, form_id, template_id, seo_config, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.slug,
        data.title,
        data.description || null,
        data.content,
        data.form_id || null,
        data.template_id || null,
        data.seo_config || null,
        data.status,
        now,
        now,
      ],
    );

    const page = await db.get(
      "SELECT * FROM marketing_landing_pages WHERE id = ?",
      [id],
    );

    res.status(201).json({
      success: true,
      data: page,
    });
  }),
);

// =============================================================================
// EVENTS
// =============================================================================

/**
 * GET /api/marketing/events
 * List all marketing events
 */
router.get(
  "/events",
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;

    let sql = "SELECT * FROM marketing_events WHERE 1=1";
    const params: string[] = [];

    if (status) {
      sql += " AND status = ?";
      params.push(status as string);
    }

    sql += " ORDER BY start_date DESC";

    const events = await db.all(sql, params);

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  }),
);

/**
 * POST /api/marketing/events
 * Create a new event
 */
router.post(
  "/events",
  asyncHandler(async (req: Request, res: Response) => {
    const validation = createEventSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError("Invalid event data", {
        issues: validation.error.issues,
      });
    }

    const id = `evt-${randomUUID()}`;
    const now = new Date().toISOString();
    const data = validation.data;

    await db.run(
      `INSERT INTO marketing_events (id, campaign_id, name, event_type, description, start_date, end_date, location, capacity, budget, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.campaign_id || null,
        data.name,
        data.event_type,
        data.description || null,
        data.start_date,
        data.end_date,
        data.location || null,
        data.capacity || null,
        data.budget,
        now,
        now,
      ],
    );

    const event = await db.get("SELECT * FROM marketing_events WHERE id = ?", [
      id,
    ]);

    res.status(201).json({
      success: true,
      data: event,
    });
  }),
);

/**
 * POST /api/marketing/events/:id/register
 * Register for an event
 */
router.post(
  "/events/:id/register",
  asyncHandler(async (req: Request, res: Response) => {
    const event = await db.get("SELECT * FROM marketing_events WHERE id = ?", [
      req.params.id,
    ]);

    if (!event) {
      throw new NotFoundError("Event not found");
    }

    const registrationId = `reg-${randomUUID()}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO marketing_event_registrations (id, event_id, lead_id, customer_id, attendee_name, attendee_email, attendee_phone, registration_data, payment_status, attendance_status, registered_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        registrationId,
        req.params.id,
        req.body.lead_id || null,
        req.body.customer_id || null,
        req.body.attendee_name,
        req.body.attendee_email,
        req.body.attendee_phone || null,
        JSON.stringify(req.body.additional_data || {}),
        "pending",
        "registered",
        now,
      ],
    );

    // Update event registration count
    await db.run(
      "UPDATE marketing_events SET registration_count = registration_count + 1 WHERE id = ?",
      [req.params.id],
    );

    res.status(201).json({
      success: true,
      message: "Successfully registered for event",
      registration_id: registrationId,
    });
  }),
);

// =============================================================================
// SEGMENTS
// =============================================================================

/**
 * GET /api/marketing/segments
 * List all segments
 */
router.get(
  "/segments",
  asyncHandler(async (req: Request, res: Response) => {
    const segments = await db.all(
      "SELECT * FROM marketing_segments ORDER BY created_at DESC",
    );

    res.json({
      success: true,
      data: segments,
      count: segments.length,
    });
  }),
);

/**
 * POST /api/marketing/segments
 * Create a new segment
 */
router.post(
  "/segments",
  asyncHandler(async (req: Request, res: Response) => {
    const validation = createSegmentSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError("Invalid segment data", {
        issues: validation.error.issues,
      });
    }

    const id = `seg-${randomUUID()}`;
    const now = new Date().toISOString();
    const data = validation.data;

    await db.run(
      `INSERT INTO marketing_segments (id, name, description, segment_type, criteria, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.description || null,
        data.segment_type || null,
        data.criteria,
        data.status,
        now,
        now,
      ],
    );

    const segment = await db.get(
      "SELECT * FROM marketing_segments WHERE id = ?",
      [id],
    );

    res.status(201).json({
      success: true,
      data: segment,
    });
  }),
);

/**
 * GET /api/marketing/stats
 * Get marketing statistics
 */
router.get(
  "/stats",
  asyncHandler(async (req: Request, res: Response) => {
    const totalCampaigns = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM marketing_campaigns",
    );
    const activeCampaigns = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM marketing_campaigns WHERE status = 'active'",
    );
    const totalForms = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM marketing_forms",
    );
    const totalSubmissions = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM marketing_form_submissions",
    );
    const totalEvents = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM marketing_events",
    );
    const totalSegments = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM marketing_segments",
    );

    const stats = {
      totalCampaigns: totalCampaigns?.count || 0,
      activeCampaigns: activeCampaigns?.count || 0,
      totalForms: totalForms?.count || 0,
      totalSubmissions: totalSubmissions?.count || 0,
      totalEvents: totalEvents?.count || 0,
      totalSegments: totalSegments?.count || 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  }),
);

export default router;
