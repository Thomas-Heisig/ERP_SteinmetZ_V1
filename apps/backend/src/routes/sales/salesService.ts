// SPDX-License-Identifier: MIT
// apps/backend/src/routes/sales/salesService.ts

/**
 * Sales Service
 *
 * Provides business logic for sales operations including quotes, orders,
 * leads, campaigns, and pipeline management.
 *
 * @module SalesService
 */

import { createLogger } from "../../utils/logger.js";

const logger = createLogger("sales-service");

/* -------------------------------------------------------------------------- */
/*                              TYPE DEFINITIONS                              */
/* -------------------------------------------------------------------------- */

/**
 * Quote status values
 */
export type QuoteStatus = "draft" | "pending" | "accepted" | "rejected" | "expired";

/**
 * Order status values
 */
export type OrderStatus = "confirmed" | "in_production" | "ready" | "delivered" | "cancelled";

/**
 * Payment status values
 */
export type PaymentStatus = "pending" | "partial" | "paid" | "overdue";

/**
 * Lead status values
 */
export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

/**
 * Campaign status values
 */
export type CampaignStatus = "planned" | "active" | "paused" | "completed" | "cancelled";

/**
 * Quote item
 */
export interface QuoteItem {
  position: number;
  product_id?: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  net_amount: number;
  tax_rate: number;
  tax_amount: number;
  gross_amount: number;
}

/**
 * Quote data structure
 */
export interface Quote {
  id: string;
  quote_number: string;
  customer_id: string;
  contact_id?: string;
  date: string;
  valid_until: string;
  status: QuoteStatus;
  items: QuoteItem[];
  subtotal: number;
  total_tax: number;
  total: number;
  notes?: string;
  terms?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Order data structure
 */
export interface Order {
  id: string;
  order_number: string;
  quote_id?: string;
  customer_id: string;
  date: string;
  delivery_date: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_terms?: string;
  special_instructions?: string;
  total: number;
  created_at: string;
  updated_at?: string;
}

/**
 * Lead data structure
 */
export interface Lead {
  id: string;
  source: string;
  company: string;
  contact: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  score: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Campaign data structure
 */
export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: CampaignStatus;
  start_date: string;
  end_date: string;
  budget: number;
  spent: number;
  leads_generated: number;
  conversions: number;
  roi: number;
  created_at: string;
  updated_at?: string;
}

/**
 * Pipeline stage
 */
export interface PipelineStage {
  name: string;
  count: number;
  value: number;
  conversion_rate: number;
}

/**
 * Pipeline summary
 */
export interface PipelineSummary {
  total_value: number;
  stages: PipelineStage[];
  forecast: {
    this_month: number;
    next_month: number;
    this_quarter: number;
  };
}

/**
 * Create quote input data
 */
export interface CreateQuoteInput {
  customer_id: string;
  contact_id?: string;
  valid_days?: number;
  items: Array<{
    product_id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    discount_percent?: number;
    tax_rate?: number;
  }>;
  notes?: string;
  terms?: string;
}

/**
 * Create order input data
 */
export interface CreateOrderInput {
  quote_id?: string;
  customer_id: string;
  delivery_date: string;
  payment_terms?: string;
  special_instructions?: string;
}

/**
 * Create lead input data
 */
export interface CreateLeadInput {
  source: string;
  company: string;
  contact: string;
  email: string;
  phone?: string;
  notes?: string;
}

/* -------------------------------------------------------------------------- */
/*                              SALES SERVICE                                 */
/* -------------------------------------------------------------------------- */

/**
 * Sales Service Class
 *
 * Handles all sales-related operations including quotes, orders, leads,
 * campaigns, and pipeline management.
 */
export class SalesService {
  /**
   * Get sales pipeline summary
   *
   * Returns aggregated data about the sales pipeline including stage counts,
   * values, conversion rates, and forecast.
   *
   * @returns Pipeline summary with stages and forecast
   *
   * @example
   * ```typescript
   * const pipeline = await salesService.getPipeline();
   * console.log(`Total pipeline value: ${pipeline.total_value}`);
   * console.log(`Forecast this month: ${pipeline.forecast.this_month}`);
   * ```
   */
  async getPipeline(): Promise<PipelineSummary> {
    logger.debug("Fetching sales pipeline summary");

    try {
      // TODO: Replace with actual database queries
      // This is mock data - implement real queries when tables exist
      const summary: PipelineSummary = {
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
      };

      logger.info({ total_value: summary.total_value, stage_count: summary.stages.length }, "Pipeline summary retrieved");
      return summary;
    } catch (error) {
      logger.error({ error }, "Failed to get pipeline summary");
      throw error;
    }
  }

  /**
   * Get all quotes with optional status filter
   *
   * @param status - Optional status filter (draft, pending, accepted, rejected, expired)
   * @returns Array of quotes matching the filter
   *
   * @example
   * ```typescript
   * const pendingQuotes = await salesService.getQuotes('pending');
   * console.log(`Found ${pendingQuotes.length} pending quotes`);
   * ```
   */
  async getQuotes(status?: QuoteStatus): Promise<Quote[]> {
    logger.debug({ status }, "Fetching quotes");

    try {
      // TODO: Implement database query
      // For now, return mock data
      const quotes: Quote[] = [
        {
          id: "qt_001",
          quote_number: "QT-2025-001",
          customer_id: "cust_001",
          date: "2025-12-15",
          valid_until: "2026-01-15",
          status: "pending",
          items: [],
          subtotal: 3500,
          total_tax: 665,
          total: 4165,
          created_at: new Date().toISOString(),
        },
      ];

      const filtered = status ? quotes.filter((q) => q.status === status) : quotes;
      logger.info({ count: filtered.length, status }, "Quotes retrieved");
      return filtered;
    } catch (error) {
      logger.error({ error, status }, "Failed to get quotes");
      throw error;
    }
  }

  /**
   * Get a single quote by ID
   *
   * @param id - Quote ID
   * @returns Quote with all details including items
   * @throws {Error} If quote not found
   *
   * @example
   * ```typescript
   * const quote = await salesService.getQuoteById('qt_001');
   * console.log(`Quote ${quote.quote_number} for ${quote.total} EUR`);
   * ```
   */
  async getQuoteById(id: string): Promise<Quote> {
    logger.debug({ quoteId: id }, "Fetching quote by ID");

    try {
      // TODO: Implement database query
      const quote: Quote = {
        id,
        quote_number: "QT-2025-001",
        customer_id: "cust_001",
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
        created_at: new Date().toISOString(),
      };

      logger.info({ quoteId: id, quote_number: quote.quote_number }, "Quote retrieved");
      return quote;
    } catch (error) {
      logger.error({ error, quoteId: id }, "Failed to get quote");
      throw error;
    }
  }

  /**
   * Create a new quote
   *
   * Calculates totals, generates quote number, and stores the quote.
   *
   * @param data - Quote creation data
   * @returns Created quote with generated ID and number
   *
   * @example
   * ```typescript
   * const quote = await salesService.createQuote({
   *   customer_id: 'cust_001',
   *   items: [{
   *     description: 'Grabstein',
   *     quantity: 1,
   *     unit_price: 3500
   *   }]
   * });
   * console.log(`Created quote ${quote.quote_number}`);
   * ```
   */
  async createQuote(data: CreateQuoteInput): Promise<Quote> {
    logger.debug({ customer_id: data.customer_id, item_count: data.items.length }, "Creating new quote");

    try {
      // Generate quote number
      const year = new Date().getFullYear();
      const quoteNumber = `QT-${year}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

      // Calculate totals
      let subtotal = 0;
      let total_tax = 0;

      const items: QuoteItem[] = data.items.map((item, index) => {
        const quantity = item.quantity;
        const unit_price = item.unit_price;
        const discount_percent = item.discount_percent || 0;
        const tax_rate = item.tax_rate || 19;

        const net_amount = quantity * unit_price * (1 - discount_percent / 100);
        const tax_amount = net_amount * (tax_rate / 100);
        const gross_amount = net_amount + tax_amount;

        subtotal += net_amount;
        total_tax += tax_amount;

        return {
          position: index + 1,
          product_id: item.product_id,
          description: item.description,
          quantity,
          unit: "Stk",
          unit_price,
          discount_percent,
          net_amount,
          tax_rate,
          tax_amount,
          gross_amount,
        };
      });

      const total = subtotal + total_tax;

      // Calculate valid_until date
      const validDays = data.valid_days || 30;
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validDays);

      const quote: Quote = {
        id: `qt_${Date.now()}`,
        quote_number: quoteNumber,
        customer_id: data.customer_id,
        contact_id: data.contact_id,
        date: new Date().toISOString().split("T")[0],
        valid_until: validUntil.toISOString().split("T")[0],
        status: "draft",
        items,
        subtotal,
        total_tax,
        total,
        notes: data.notes,
        terms: data.terms,
        created_at: new Date().toISOString(),
      };

      // TODO: Save to database

      logger.info(
        {
          quote_id: quote.id,
          quote_number: quoteNumber,
          customer_id: data.customer_id,
          total,
        },
        "Quote created"
      );

      return quote;
    } catch (error) {
      logger.error({ error, customer_id: data.customer_id }, "Failed to create quote");
      throw error;
    }
  }

  /**
   * Get all orders with optional status filter
   *
   * @param status - Optional status filter
   * @returns Array of orders matching the filter
   *
   * @example
   * ```typescript
   * const activeOrders = await salesService.getOrders('in_production');
   * console.log(`${activeOrders.length} orders in production`);
   * ```
   */
  async getOrders(status?: OrderStatus): Promise<Order[]> {
    logger.debug({ status }, "Fetching orders");

    try {
      // TODO: Implement database query
      const orders: Order[] = [
        {
          id: "ord_001",
          order_number: "OR-2025-001",
          customer_id: "cust_001",
          date: "2025-12-10",
          delivery_date: "2026-01-20",
          status: "confirmed",
          payment_status: "pending",
          total: 45000,
          created_at: new Date().toISOString(),
        },
      ];

      const filtered = status ? orders.filter((o) => o.status === status) : orders;
      logger.info({ count: filtered.length, status }, "Orders retrieved");
      return filtered;
    } catch (error) {
      logger.error({ error, status }, "Failed to get orders");
      throw error;
    }
  }

  /**
   * Create a new order (optionally from a quote)
   *
   * @param data - Order creation data
   * @returns Created order with generated number
   *
   * @example
   * ```typescript
   * const order = await salesService.createOrder({
   *   quote_id: 'qt_001',
   *   customer_id: 'cust_001',
   *   delivery_date: '2026-01-20'
   * });
   * console.log(`Created order ${order.order_number}`);
   * ```
   */
  async createOrder(data: CreateOrderInput): Promise<Order> {
    logger.debug({ quote_id: data.quote_id, customer_id: data.customer_id }, "Creating new order");

    try {
      const year = new Date().getFullYear();
      const orderNumber = `OR-${year}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

      const order: Order = {
        id: `ord_${Date.now()}`,
        order_number: orderNumber,
        quote_id: data.quote_id,
        customer_id: data.customer_id,
        date: new Date().toISOString().split("T")[0],
        delivery_date: data.delivery_date,
        status: "confirmed",
        payment_status: "pending",
        payment_terms: data.payment_terms,
        special_instructions: data.special_instructions,
        total: 0, // TODO: Calculate from quote or items
        created_at: new Date().toISOString(),
      };

      // TODO: Save to database
      // TODO: If quote_id provided, copy items from quote and update quote status

      logger.info(
        {
          order_id: order.id,
          order_number: orderNumber,
          quote_id: data.quote_id,
          customer_id: data.customer_id,
        },
        "Order created"
      );

      return order;
    } catch (error) {
      logger.error({ error, quote_id: data.quote_id }, "Failed to create order");
      throw error;
    }
  }

  /**
   * Get all leads with optional status filter
   *
   * @param status - Optional status filter
   * @returns Array of leads matching the filter
   *
   * @example
   * ```typescript
   * const newLeads = await salesService.getLeads('new');
   * console.log(`${newLeads.length} new leads to contact`);
   * ```
   */
  async getLeads(status?: LeadStatus): Promise<Lead[]> {
    logger.debug({ status }, "Fetching leads");

    try {
      // TODO: Implement database query
      const leads: Lead[] = [
        {
          id: "lead_001",
          source: "Website",
          company: "Neukunde GmbH",
          contact: "Anna Schmidt",
          email: "anna@neukunde.de",
          phone: "+49 987 654321",
          status: "new",
          score: 85,
          created_at: new Date().toISOString(),
        },
      ];

      const filtered = status ? leads.filter((l) => l.status === status) : leads;
      logger.info({ count: filtered.length, status }, "Leads retrieved");
      return filtered;
    } catch (error) {
      logger.error({ error, status }, "Failed to get leads");
      throw error;
    }
  }

  /**
   * Create a new lead
   *
   * @param data - Lead creation data
   * @returns Created lead with initial score
   *
   * @example
   * ```typescript
   * const lead = await salesService.createLead({
   *   source: 'Website',
   *   company: 'New Corp',
   *   contact: 'John Doe',
   *   email: 'john@newcorp.com'
   * });
   * console.log(`Created lead with score ${lead.score}`);
   * ```
   */
  async createLead(data: CreateLeadInput): Promise<Lead> {
    logger.debug({ source: data.source, company: data.company }, "Creating new lead");

    try {
      const lead: Lead = {
        id: `lead_${Date.now()}`,
        source: data.source,
        company: data.company,
        contact: data.contact,
        email: data.email,
        phone: data.phone,
        status: "new",
        score: 50, // Default initial score
        notes: data.notes,
        created_at: new Date().toISOString(),
      };

      // TODO: Save to database

      logger.info(
        {
          lead_id: lead.id,
          company: data.company,
          source: data.source,
        },
        "Lead created"
      );

      return lead;
    } catch (error) {
      logger.error({ error, company: data.company }, "Failed to create lead");
      throw error;
    }
  }

  /**
   * Qualify a lead by updating status and score
   *
   * @param id - Lead ID
   * @param score - New qualification score (0-100)
   * @param notes - Optional qualification notes
   * @returns Updated lead
   *
   * @example
   * ```typescript
   * const qualified = await salesService.qualifyLead('lead_001', 85, 'Strong interest');
   * console.log(`Lead qualified with score ${qualified.score}`);
   * ```
   */
  async qualifyLead(id: string, score: number, notes?: string): Promise<Lead> {
    logger.debug({ lead_id: id, score }, "Qualifying lead");

    try {
      // TODO: Update in database
      const lead: Lead = {
        id,
        source: "Website",
        company: "Neukunde GmbH",
        contact: "Anna Schmidt",
        email: "anna@neukunde.de",
        status: "qualified",
        score: Math.max(0, Math.min(100, score)), // Clamp to 0-100
        notes,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      };

      logger.info({ lead_id: id, score, status: lead.status }, "Lead qualified");
      return lead;
    } catch (error) {
      logger.error({ error, lead_id: id }, "Failed to qualify lead");
      throw error;
    }
  }

  /**
   * Get all campaigns with optional status filter
   *
   * @param status - Optional status filter
   * @returns Array of campaigns matching the filter
   *
   * @example
   * ```typescript
   * const activeCampaigns = await salesService.getCampaigns('active');
   * console.log(`${activeCampaigns.length} active campaigns`);
   * ```
   */
  async getCampaigns(status?: CampaignStatus): Promise<Campaign[]> {
    logger.debug({ status }, "Fetching campaigns");

    try {
      // TODO: Implement database query
      const campaigns: Campaign[] = [
        {
          id: "camp_001",
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
          created_at: new Date().toISOString(),
        },
      ];

      const filtered = status ? campaigns.filter((c) => c.status === status) : campaigns;
      logger.info({ count: filtered.length, status }, "Campaigns retrieved");
      return filtered;
    } catch (error) {
      logger.error({ error, status }, "Failed to get campaigns");
      throw error;
    }
  }

  /**
   * Get sales analytics summary
   *
   * Returns aggregated metrics including total revenue, conversion rate,
   * average deal size, and period comparisons.
   *
   * @returns Analytics summary
   *
   * @example
   * ```typescript
   * const analytics = await salesService.getAnalytics();
   * console.log(`Total revenue: ${analytics.total_revenue}`);
   * console.log(`Conversion rate: ${analytics.conversion_rate}%`);
   * ```
   */
  async getAnalytics(): Promise<{
    total_revenue: number;
    conversion_rate: number;
    average_deal_size: number;
    active_opportunities: number;
    won_deals: number;
    lost_deals: number;
  }> {
    logger.debug("Fetching sales analytics");

    try {
      // TODO: Implement real analytics queries
      const analytics = {
        total_revenue: 245000,
        conversion_rate: 28.5,
        average_deal_size: 15000,
        active_opportunities: 87,
        won_deals: 45,
        lost_deals: 23,
      };

      logger.info(
        {
          total_revenue: analytics.total_revenue,
          conversion_rate: analytics.conversion_rate,
        },
        "Analytics retrieved"
      );

      return analytics;
    } catch (error) {
      logger.error({ error }, "Failed to get analytics");
      throw error;
    }
  }
}

// Export singleton instance
export const salesService = new SalesService();

// Export class for testing
export default salesService;
