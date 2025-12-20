// SPDX-License-Identifier: MIT
// apps/backend/src/routes/sales/salesRouter.ts

/**
 * Sales Router Module
 *
 * Handles all sales-related HTTP endpoints including quotes, orders, leads,
 * campaigns, pipeline management, and analytics.
 *
 * @module SalesRouter
 * @category Routes
 */

import { Router, Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { z } from "zod";
import { BadRequestError } from "../error/errors.js";
import { createLogger } from "../../utils/logger.js";
import { salesService } from "./salesService.js";

const logger = createLogger("sales-router");

const router = Router();

// Status types for query parameters
type QuoteStatus = "draft" | "pending" | "accepted" | "rejected" | "expired" | undefined;
type OrderStatus = "confirmed" | "in_production" | "ready" | "delivered" | "cancelled" | undefined;
type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost" | undefined;
type CampaignStatus = "planned" | "active" | "paused" | "completed" | "cancelled" | undefined;

/* ---------------------------------------------------------
   VERTRIEBSPIPELINE
--------------------------------------------------------- */

/**
 * Get sales pipeline overview
 *
 * Returns the current state of the sales pipeline including all stages,
 * opportunity counts, values, conversion rates, and revenue forecast.
 *
 * @route GET /api/sales/pipeline
 * @access Private
 * @returns {PipelineSummary} Pipeline summary with stages and forecast
 */
router.get(
  "/pipeline",
  asyncHandler(async (_req, res) => {
    logger.debug("GET /api/sales/pipeline - Fetching pipeline summary");

    const pipeline = await salesService.getPipeline();

    logger.info({ total_value: pipeline.total_value }, "Pipeline summary retrieved");
    res.json(pipeline);
  }),
);

/* ---------------------------------------------------------
   ANGEBOTE
--------------------------------------------------------- */

/**
 * Get all quotes with optional status filter
 *
 * Returns a list of all quotes, optionally filtered by status.
 * Supports filtering by draft, pending, accepted, rejected, or expired status.
 *
 * @route GET /api/sales/quotes
 * @query {string} [status] - Optional status filter (draft|pending|accepted|rejected|expired)
 * @access Private
 * @returns {Quote[]} Array of quotes
 */
router.get(
  "/quotes",
  asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as QuoteStatus;
    logger.debug({ status }, "GET /api/sales/quotes - Fetching quotes");

    const quotes = await salesService.getQuotes(status);

    logger.info({ count: quotes.length, status }, "Quotes retrieved");
    res.json({ quotes });
  }),
);

/**
 * Create a new quote
 *
 * Creates a new sales quote with automatic quote number generation,
 * total calculation, and validity date calculation.
 *
 * @route POST /api/sales/quotes
 * @body {CreateQuoteInput} Quote data with customer, items, and terms
 * @access Private
 * @returns {Quote} Created quote with generated quote number
 */
const quoteSchema = z.object({
  customer_id: z.string(),
  contact_id: z.string().optional(),
  valid_days: z.number().default(30),
  items: z.array(
    z.object({
      product_id: z.string().optional(),
      description: z.string().min(1, "Description is required"),
      quantity: z.number().positive("Quantity must be positive"),
      unit_price: z.number().positive("Unit price must be positive"),
      discount_percent: z.number().min(0).max(100).default(0),
      tax_rate: z.number().default(19),
    }),
  ).min(1, "At least one item is required"),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

router.post(
  "/quotes",
  asyncHandler(async (req, res) => {
    logger.debug({ customer_id: req.body.customer_id }, "POST /api/sales/quotes - Creating quote");

    const validatedData = quoteSchema.parse(req.body);
    const quote = await salesService.createQuote(validatedData);

    logger.info({ quote_id: quote.id, quote_number: quote.quote_number, total: quote.total }, "Quote created");
    res.status(201).json({
      message: "Angebot erstellt",
      data: quote,
    });
  }),
);

/**
 * Get a single quote by ID
 *
 * Returns detailed information about a specific quote including
 * all line items, calculations, customer and contact details.
 *
 * @route GET /api/sales/quotes/:id
 * @param {string} id - Quote ID
 * @access Private
 * @returns {Quote} Quote with all details
 */
router.get(
  "/quotes/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.debug({ quote_id: id }, "GET /api/sales/quotes/:id - Fetching quote details");

    const quote = await salesService.getQuoteById(id);

    logger.info({ quote_id: id, quote_number: quote.quote_number }, "Quote details retrieved");
    res.json(quote);
  }),
);

/* ---------------------------------------------------------
   AUFTRÄGE
--------------------------------------------------------- */

/**
 * Get all sales orders with optional status filter
 *
 * Returns a list of all sales orders, optionally filtered by status.
 * Supports filtering by confirmed, in_production, ready, delivered, or cancelled.
 *
 * @route GET /api/sales/orders
 * @query {string} [status] - Optional status filter
 * @access Private
 * @returns {Order[]} Array of orders
 */
router.get(
  "/orders",
  asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as OrderStatus;
    logger.debug({ status }, "GET /api/sales/orders - Fetching orders");

    const orders = await salesService.getOrders(status);

    logger.info({ count: orders.length, status }, "Orders retrieved");
    res.json({ orders });
  }),
);

/**
 * Create a new sales order
 *
 * Creates a new sales order, optionally from an existing quote.
 * Generates order number and sets initial status to confirmed.
 *
 * @route POST /api/sales/orders
 * @body {CreateOrderInput} Order data with delivery and payment details
 * @access Private
 * @returns {Order} Created order with generated order number
 */
const orderSchema = z.object({
  quote_id: z.string().optional(),
  customer_id: z.string(),
  delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  payment_terms: z.string().optional(),
  special_instructions: z.string().optional(),
});

router.post(
  "/orders",
  asyncHandler(async (req, res) => {
    logger.debug({ quote_id: req.body.quote_id, customer_id: req.body.customer_id }, "POST /api/sales/orders - Creating order");

    const validatedData = orderSchema.parse(req.body);
    const order = await salesService.createOrder(validatedData);

    logger.info({ order_id: order.id, order_number: order.order_number }, "Order created");
    res.status(201).json({
      message: "Auftrag erstellt",
      data: order,
    });
  }),
);

/* ---------------------------------------------------------
   LEADS
--------------------------------------------------------- */

/**
 * Get all leads with optional status filter
 *
 * Returns a list of all leads including their qualification score,
 * source, contact information, and current status.
 *
 * @route GET /api/sales/leads
 * @query {string} [status] - Optional status filter (new|contacted|qualified|converted|lost)
 * @access Private
 * @returns {Lead[]} Array of leads
 */
router.get(
  "/leads",
  asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as LeadStatus;
    logger.debug({ status }, "GET /api/sales/leads - Fetching leads");

    const leads = await salesService.getLeads(status);

    logger.info({ count: leads.length, status }, "Leads retrieved");
    res.json({ leads });
  }),
);

/**
 * Create a new lead
 *
 * Captures a new sales lead with source tracking, contact information,
 * and automatic initial scoring.
 *
 * @route POST /api/sales/leads
 * @body {CreateLeadInput} Lead data with company and contact details
 * @access Private
 * @returns {Lead} Created lead with initial score of 50
 */
const leadSchema = z.object({
  source: z.string().min(1, "Source is required"),
  company: z.string().min(1, "Company name is required"),
  contact: z.string().min(1, "Contact name is required"),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

router.post(
  "/leads",
  asyncHandler(async (req, res) => {
    logger.debug({ source: req.body.source, company: req.body.company }, "POST /api/sales/leads - Creating lead");

    const validatedData = leadSchema.parse(req.body);
    const lead = await salesService.createLead(validatedData);

    logger.info({ lead_id: lead.id, company: lead.company, score: lead.score }, "Lead created");
    res.status(201).json({
      message: "Lead erfasst",
      data: lead,
    });
  }),
);

/**
 * Qualify a lead
 *
 * Updates a lead's status to qualified and assigns a qualification score.
 * Used after initial contact and evaluation of the lead's potential.
 *
 * @route PUT /api/sales/leads/:id/qualify
 * @param {string} id - Lead ID
 * @body {object} score - Qualification score (0-100)
 * @body {string} [notes] - Optional qualification notes
 * @access Private
 * @returns {Lead} Updated lead with qualified status
 */
router.put(
  "/leads/:id/qualify",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { score, notes } = req.body;

    logger.debug({ lead_id: id, score }, "PUT /api/sales/leads/:id/qualify - Qualifying lead");

    if (!score || typeof score !== "number" || score < 0 || score > 100) {
      throw new BadRequestError("Score must be a number between 0 and 100");
    }

    const lead = await salesService.qualifyLead(id, score, notes);

    logger.info({ lead_id: id, score, status: lead.status }, "Lead qualified");
    res.json({
      message: "Lead qualifiziert",
      data: lead,
    });
  }),
);

/* ---------------------------------------------------------
   ANALYTICS
--------------------------------------------------------- */

/**
 * Get sales analytics summary
 *
 * Returns comprehensive sales metrics including total revenue,
 * conversion rates, average deal size, and opportunity counts.
 *
 * @route GET /api/sales/analytics
 * @access Private
 * @returns {object} Sales analytics summary
 */
router.get(
  "/analytics",
  asyncHandler(async (_req, res) => {
    logger.debug("GET /api/sales/analytics - Fetching analytics");

    const analytics = await salesService.getAnalytics();

    logger.info({ total_revenue: analytics.total_revenue, conversion_rate: analytics.conversion_rate }, "Analytics retrieved");
    res.json(analytics);
  }),
);

/* ---------------------------------------------------------
   MARKETING KAMPAGNEN
--------------------------------------------------------- */

/**
 * Get all marketing campaigns with optional status filter
 *
 * Returns a list of all marketing campaigns including budget tracking,
 * lead generation metrics, and ROI calculations.
 *
 * @route GET /api/sales/campaigns
 * @query {string} [status] - Optional status filter (planned|active|paused|completed|cancelled)
 * @access Private
 * @returns {Campaign[]} Array of campaigns
 */
router.get(
  "/campaigns",
  asyncHandler(async (req, res) => {
    const status = req.query.status as CampaignStatus;
    logger.debug({ status }, "GET /api/sales/campaigns - Fetching campaigns");

    const campaigns = await salesService.getCampaigns(status);

    logger.info({ count: campaigns.length, status }, "Campaigns retrieved");
    res.json({ campaigns });
  }),
);

export default router;
