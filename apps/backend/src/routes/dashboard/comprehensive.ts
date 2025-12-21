// SPDX-License-Identifier: MIT
// apps/backend/src/routes/dashboard/comprehensive.ts

/**
 * Comprehensive Dashboard API Routes
 *
 * Provides detailed analytics, metrics, and monitoring data
 * for executive overview, process monitoring, and real-time analytics.
 *
 * @module routes/dashboard/comprehensive
 */

import { Router, type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import db from "../database/dbService.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { NotFoundError } from "../error/errors.js";
import type { SqlValue } from "../database/database.js";
import { createLogger } from "../../utils/logger.js";
import {
  createWidgetSchema,
  updateWidgetSchema,
  createLayoutSchema,
  updateLayoutSchema,
  createFavoriteSchema,
  type DashboardWidget,
  type DashboardLayout,
  type DashboardFavorite,
  type RevenueMetrics,
  type TopCustomer,
  type TopProduct,
  type RegionalRevenue,
  type ProfitMargin,
  type LiquidityStatus,
  type OrderIntake,
  type ProductivityMetrics,
  type PipelineStage,
  type ProcurementMetrics,
  type ProductionUtilization,
  type SLAMetrics,
  type ProjectProgress,
  type DashboardWarning,
} from "./types.js";

const router = Router();
const logger = createLogger("dashboard-comprehensive");

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

async function ensureTables(): Promise<void> {
  try {
    // Dashboard Widgets Configuration
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_widgets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        widget_type TEXT NOT NULL,
        data_source TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        position INTEGER NOT NULL DEFAULT 0,
        width INTEGER NOT NULL DEFAULT 4,
        height INTEGER NOT NULL DEFAULT 4,
        refresh_interval INTEGER,
        config TEXT,
        is_visible INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Dashboard Layouts
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_layouts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        layout TEXT NOT NULL,
        is_default INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Dashboard Favorites
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_favorites (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        item_type TEXT NOT NULL,
        item_id TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        icon TEXT,
        position INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Dashboard Revenue Metrics
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_revenue_metrics (
        date TEXT NOT NULL,
        total_revenue REAL NOT NULL DEFAULT 0,
        projected_revenue REAL NOT NULL DEFAULT 0,
        revenue_growth REAL NOT NULL DEFAULT 0,
        average_order_value REAL NOT NULL DEFAULT 0,
        order_count INTEGER NOT NULL DEFAULT 0,
        active_customers INTEGER NOT NULL DEFAULT 0,
        new_customers INTEGER NOT NULL DEFAULT 0,
        recurring_revenue REAL NOT NULL DEFAULT 0,
        one_time_revenue REAL NOT NULL DEFAULT 0,
        PRIMARY KEY (date)
      )
    `);

    // Dashboard Top Customers
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_top_customers (
        customer_id TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        revenue REAL NOT NULL DEFAULT 0,
        order_count INTEGER NOT NULL DEFAULT 0,
        rank INTEGER NOT NULL,
        period TEXT NOT NULL,
        PRIMARY KEY (customer_id, period)
      )
    `);

    // Dashboard Top Products
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_top_products (
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        revenue REAL NOT NULL DEFAULT 0,
        quantity INTEGER NOT NULL DEFAULT 0,
        rank INTEGER NOT NULL,
        period TEXT NOT NULL,
        PRIMARY KEY (product_id, period)
      )
    `);

    // Dashboard Regional Revenue
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_regional_revenue (
        region TEXT NOT NULL,
        revenue REAL NOT NULL DEFAULT 0,
        order_count INTEGER NOT NULL DEFAULT 0,
        customer_count INTEGER NOT NULL DEFAULT 0,
        date TEXT NOT NULL,
        PRIMARY KEY (region, date)
      )
    `);

    // Dashboard Profit Margins
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_profit_margins (
        date TEXT NOT NULL,
        revenue REAL NOT NULL DEFAULT 0,
        cogs REAL NOT NULL DEFAULT 0,
        gross_profit REAL NOT NULL DEFAULT 0,
        gross_margin REAL NOT NULL DEFAULT 0,
        operating_expenses REAL NOT NULL DEFAULT 0,
        operating_profit REAL NOT NULL DEFAULT 0,
        operating_margin REAL NOT NULL DEFAULT 0,
        net_profit REAL NOT NULL DEFAULT 0,
        net_margin REAL NOT NULL DEFAULT 0,
        PRIMARY KEY (date)
      )
    `);

    // Dashboard Liquidity Status
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_liquidity (
        date TEXT NOT NULL,
        cash_on_hand REAL NOT NULL DEFAULT 0,
        accounts_receivable REAL NOT NULL DEFAULT 0,
        accounts_payable REAL NOT NULL DEFAULT 0,
        current_ratio REAL NOT NULL DEFAULT 0,
        quick_ratio REAL NOT NULL DEFAULT 0,
        working_capital REAL NOT NULL DEFAULT 0,
        cash_flow_operating REAL NOT NULL DEFAULT 0,
        cash_flow_investing REAL NOT NULL DEFAULT 0,
        cash_flow_financing REAL NOT NULL DEFAULT 0,
        PRIMARY KEY (date)
      )
    `);

    // Dashboard Order Intake
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_order_intake (
        period TEXT NOT NULL,
        order_count INTEGER NOT NULL DEFAULT 0,
        order_value REAL NOT NULL DEFAULT 0,
        average_order_value REAL NOT NULL DEFAULT 0,
        pending_orders INTEGER NOT NULL DEFAULT 0,
        completed_orders INTEGER NOT NULL DEFAULT 0,
        cancelled_orders INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (period)
      )
    `);

    // Dashboard Productivity Metrics
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_productivity (
        date TEXT NOT NULL,
        employee_count INTEGER NOT NULL DEFAULT 0,
        revenue_per_employee REAL NOT NULL DEFAULT 0,
        orders_per_employee REAL NOT NULL DEFAULT 0,
        production_output REAL NOT NULL DEFAULT 0,
        production_efficiency REAL NOT NULL DEFAULT 0,
        utilization_rate REAL NOT NULL DEFAULT 0,
        PRIMARY KEY (date)
      )
    `);

    // Dashboard Pipeline Stages
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_pipeline (
        stage TEXT NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        value REAL NOT NULL DEFAULT 0,
        conversion_rate REAL NOT NULL DEFAULT 0,
        average_duration REAL NOT NULL DEFAULT 0,
        updated_at TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (stage)
      )
    `);

    // Dashboard Procurement Metrics
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_procurement (
        date TEXT NOT NULL,
        purchase_orders INTEGER NOT NULL DEFAULT 0,
        total_spend REAL NOT NULL DEFAULT 0,
        average_processing_time REAL NOT NULL DEFAULT 0,
        on_time_delivery REAL NOT NULL DEFAULT 0,
        supplier_count INTEGER NOT NULL DEFAULT 0,
        cost_savings REAL NOT NULL DEFAULT 0,
        PRIMARY KEY (date)
      )
    `);

    // Dashboard Production Utilization
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_production (
        date TEXT NOT NULL,
        capacity REAL NOT NULL DEFAULT 0,
        utilized REAL NOT NULL DEFAULT 0,
        utilization_rate REAL NOT NULL DEFAULT 0,
        downtime REAL NOT NULL DEFAULT 0,
        efficiency REAL NOT NULL DEFAULT 0,
        output REAL NOT NULL DEFAULT 0,
        PRIMARY KEY (date)
      )
    `);

    // Dashboard SLA Metrics
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_sla (
        date TEXT NOT NULL,
        total_tickets INTEGER NOT NULL DEFAULT 0,
        resolved_tickets INTEGER NOT NULL DEFAULT 0,
        average_response_time REAL NOT NULL DEFAULT 0,
        average_resolution_time REAL NOT NULL DEFAULT 0,
        sla_compliance REAL NOT NULL DEFAULT 0,
        customer_satisfaction REAL NOT NULL DEFAULT 0,
        PRIMARY KEY (date)
      )
    `);

    // Dashboard Project Progress
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_projects (
        project_id TEXT PRIMARY KEY,
        project_name TEXT NOT NULL,
        status TEXT NOT NULL,
        progress REAL NOT NULL DEFAULT 0,
        budget REAL NOT NULL DEFAULT 0,
        spent REAL NOT NULL DEFAULT 0,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        tasks_total INTEGER NOT NULL DEFAULT 0,
        tasks_completed INTEGER NOT NULL DEFAULT 0,
        health TEXT NOT NULL DEFAULT 'good',
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Dashboard Warnings
    await db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_warnings (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        value REAL,
        threshold REAL,
        unit TEXT,
        affected_entity TEXT,
        affected_id TEXT,
        action_required TEXT,
        acknowledged_by TEXT,
        acknowledged_at TEXT,
        resolved_by TEXT,
        resolved_at TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Create indexes for better query performance
    await db.run(
      "CREATE INDEX IF NOT EXISTS idx_widgets_user ON dashboard_widgets(user_id)",
    );
    await db.run(
      "CREATE INDEX IF NOT EXISTS idx_widgets_visible ON dashboard_widgets(is_visible)",
    );
    await db.run(
      "CREATE INDEX IF NOT EXISTS idx_layouts_user ON dashboard_layouts(user_id)",
    );
    await db.run(
      "CREATE INDEX IF NOT EXISTS idx_layouts_active ON dashboard_layouts(is_active)",
    );
    await db.run(
      "CREATE INDEX IF NOT EXISTS idx_favorites_user ON dashboard_favorites(user_id)",
    );
    await db.run(
      "CREATE INDEX IF NOT EXISTS idx_warnings_type ON dashboard_warnings(type)",
    );
    await db.run(
      "CREATE INDEX IF NOT EXISTS idx_warnings_severity ON dashboard_warnings(severity)",
    );
    await db.run(
      "CREATE INDEX IF NOT EXISTS idx_warnings_resolved ON dashboard_warnings(resolved_at)",
    );

    logger.info("Dashboard comprehensive tables initialized successfully");
  } catch (error) {
    logger.error(
      { error },
      "Failed to initialize dashboard comprehensive tables",
    );
    throw error;
  }
}

ensureTables();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function rowToWidget(row: Record<string, unknown>): DashboardWidget {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    widgetType: row.widget_type as DashboardWidget["widgetType"],
    dataSource: row.data_source as DashboardWidget["dataSource"],
    title: row.title as string,
    description: row.description as string | undefined,
    position: row.position as number,
    width: row.width as number,
    height: row.height as number,
    refreshInterval: row.refresh_interval as number | undefined,
    config: row.config as string | undefined,
    isVisible: Boolean(row.is_visible),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToLayout(row: Record<string, unknown>): DashboardLayout {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    layout: row.layout as string,
    isDefault: Boolean(row.is_default),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToFavorite(row: Record<string, unknown>): DashboardFavorite {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    itemType: row.item_type as string,
    itemId: row.item_id as string,
    title: row.title as string,
    url: row.url as string,
    icon: row.icon as string | undefined,
    position: row.position as number,
    createdAt: row.created_at as string,
  };
}

function rowToRevenueMetrics(row: Record<string, unknown>): RevenueMetrics {
  return {
    date: row.date as string,
    totalRevenue: row.total_revenue as number,
    projectedRevenue: row.projected_revenue as number,
    revenueGrowth: row.revenue_growth as number,
    averageOrderValue: row.average_order_value as number,
    orderCount: row.order_count as number,
    activeCustomers: row.active_customers as number,
    newCustomers: row.new_customers as number,
    recurringRevenue: row.recurring_revenue as number,
    oneTimeRevenue: row.one_time_revenue as number,
  };
}

function rowToTopCustomer(row: Record<string, unknown>): TopCustomer {
  return {
    customerId: row.customer_id as string,
    customerName: row.customer_name as string,
    revenue: row.revenue as number,
    orderCount: row.order_count as number,
    rank: row.rank as number,
    period: row.period as string,
  };
}

function rowToTopProduct(row: Record<string, unknown>): TopProduct {
  return {
    productId: row.product_id as string,
    productName: row.product_name as string,
    revenue: row.revenue as number,
    quantity: row.quantity as number,
    rank: row.rank as number,
    period: row.period as string,
  };
}

function rowToRegionalRevenue(row: Record<string, unknown>): RegionalRevenue {
  return {
    region: row.region as string,
    revenue: row.revenue as number,
    orderCount: row.order_count as number,
    customerCount: row.customer_count as number,
    date: row.date as string,
  };
}

function rowToProfitMargin(row: Record<string, unknown>): ProfitMargin {
  return {
    date: row.date as string,
    revenue: row.revenue as number,
    cogs: row.cogs as number,
    grossProfit: row.gross_profit as number,
    grossMargin: row.gross_margin as number,
    operatingExpenses: row.operating_expenses as number,
    operatingProfit: row.operating_profit as number,
    operatingMargin: row.operating_margin as number,
    netProfit: row.net_profit as number,
    netMargin: row.net_margin as number,
  };
}

function rowToLiquidityStatus(row: Record<string, unknown>): LiquidityStatus {
  return {
    date: row.date as string,
    cashOnHand: row.cash_on_hand as number,
    accountsReceivable: row.accounts_receivable as number,
    accountsPayable: row.accounts_payable as number,
    currentRatio: row.current_ratio as number,
    quickRatio: row.quick_ratio as number,
    workingCapital: row.working_capital as number,
    cashFlowOperating: row.cash_flow_operating as number,
    cashFlowInvesting: row.cash_flow_investing as number,
    cashFlowFinancing: row.cash_flow_financing as number,
  };
}

function rowToOrderIntake(row: Record<string, unknown>): OrderIntake {
  return {
    period: row.period as string,
    orderCount: row.order_count as number,
    orderValue: row.order_value as number,
    averageOrderValue: row.average_order_value as number,
    pendingOrders: row.pending_orders as number,
    completedOrders: row.completed_orders as number,
    cancelledOrders: row.cancelled_orders as number,
  };
}

function rowToProductivityMetrics(
  row: Record<string, unknown>,
): ProductivityMetrics {
  return {
    date: row.date as string,
    employeeCount: row.employee_count as number,
    revenuePerEmployee: row.revenue_per_employee as number,
    ordersPerEmployee: row.orders_per_employee as number,
    productionOutput: row.production_output as number,
    productionEfficiency: row.production_efficiency as number,
    utilizationRate: row.utilization_rate as number,
  };
}

function rowToPipelineStage(row: Record<string, unknown>): PipelineStage {
  return {
    stage: row.stage as string,
    count: row.count as number,
    value: row.value as number,
    conversionRate: row.conversion_rate as number,
    averageDuration: row.average_duration as number,
  };
}

function rowToProcurementMetrics(
  row: Record<string, unknown>,
): ProcurementMetrics {
  return {
    date: row.date as string,
    purchaseOrders: row.purchase_orders as number,
    totalSpend: row.total_spend as number,
    averageProcessingTime: row.average_processing_time as number,
    onTimeDelivery: row.on_time_delivery as number,
    supplierCount: row.supplier_count as number,
    costSavings: row.cost_savings as number,
  };
}

function rowToProductionUtilization(
  row: Record<string, unknown>,
): ProductionUtilization {
  return {
    date: row.date as string,
    capacity: row.capacity as number,
    utilized: row.utilized as number,
    utilizationRate: row.utilization_rate as number,
    downtime: row.downtime as number,
    efficiency: row.efficiency as number,
    output: row.output as number,
  };
}

function rowToSLAMetrics(row: Record<string, unknown>): SLAMetrics {
  return {
    date: row.date as string,
    totalTickets: row.total_tickets as number,
    resolvedTickets: row.resolved_tickets as number,
    averageResponseTime: row.average_response_time as number,
    averageResolutionTime: row.average_resolution_time as number,
    slaCompliance: row.sla_compliance as number,
    customerSatisfaction: row.customer_satisfaction as number,
  };
}

function rowToProjectProgress(row: Record<string, unknown>): ProjectProgress {
  return {
    projectId: row.project_id as string,
    projectName: row.project_name as string,
    status: row.status as string,
    progress: row.progress as number,
    budget: row.budget as number,
    spent: row.spent as number,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    tasksTotal: row.tasks_total as number,
    tasksCompleted: row.tasks_completed as number,
    health: row.health as string,
  };
}

function rowToWarning(row: Record<string, unknown>): DashboardWarning {
  return {
    id: row.id as string,
    type: row.type as DashboardWarning["type"],
    severity: row.severity as DashboardWarning["severity"],
    title: row.title as string,
    message: row.message as string,
    value: row.value as number | undefined,
    threshold: row.threshold as number | undefined,
    unit: row.unit as string | undefined,
    affectedEntity: row.affected_entity as string | undefined,
    affectedId: row.affected_id as string | undefined,
    actionRequired: row.action_required as string | undefined,
    acknowledgedBy: row.acknowledged_by as string | undefined,
    acknowledgedAt: row.acknowledged_at as string | undefined,
    resolvedBy: row.resolved_by as string | undefined,
    resolvedAt: row.resolved_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ============================================================================
// EXECUTIVE OVERVIEW ROUTES
// ============================================================================

/**
 * GET /api/dashboard/comprehensive/executive/revenue
 * Get revenue metrics and top performers
 */
router.get(
  "/executive/revenue",
  asyncHandler(async (req: Request, res: Response) => {
    const { period = "month" } = req.query;

    logger.info({ period }, "Fetching revenue metrics");

    const metricsRow = await db.get(
      "SELECT * FROM dashboard_revenue_metrics ORDER BY date DESC LIMIT 1",
    );
    const metrics = metricsRow ? rowToRevenueMetrics(metricsRow) : null;

    const topCustomersRows = await db.all(
      "SELECT * FROM dashboard_top_customers WHERE period = ? ORDER BY rank ASC LIMIT 10",
      [period as string],
    );
    const topCustomers = topCustomersRows.map(rowToTopCustomer);

    const topProductsRows = await db.all(
      "SELECT * FROM dashboard_top_products WHERE period = ? ORDER BY rank ASC LIMIT 10",
      [period as string],
    );
    const topProducts = topProductsRows.map(rowToTopProduct);

    const regionalRevenueRows = await db.all(
      "SELECT * FROM dashboard_regional_revenue WHERE date = date('now') ORDER BY revenue DESC",
    );
    const regionalRevenue = regionalRevenueRows.map(rowToRegionalRevenue);

    res.json({
      success: true,
      data: {
        metrics,
        topCustomers,
        topProducts,
        regionalRevenue,
      },
    });
  }),
);

/**
 * GET /api/dashboard/comprehensive/executive/margins
 * Get profit margin metrics
 */
router.get(
  "/executive/margins",
  asyncHandler(async (req: Request, res: Response) => {
    const { days = "30" } = req.query;

    logger.info({ days }, "Fetching profit margins");

    const marginsRows = await db.all(
      `SELECT * FROM dashboard_profit_margins 
       WHERE date >= date('now', '-' || ? || ' days') 
       ORDER BY date DESC`,
      [parseInt(days as string, 10)],
    );
    const margins = marginsRows.map(rowToProfitMargin);

    const latest = margins.length > 0 ? margins[0] : null;

    res.json({
      success: true,
      data: {
        latest,
        history: margins,
      },
    });
  }),
);

/**
 * GET /api/dashboard/comprehensive/executive/liquidity
 * Get liquidity status
 */
router.get(
  "/executive/liquidity",
  asyncHandler(async (req: Request, res: Response) => {
    logger.info("Fetching liquidity status");

    const liquidityRow = await db.get(
      "SELECT * FROM dashboard_liquidity ORDER BY date DESC LIMIT 1",
    );
    const liquidity = liquidityRow ? rowToLiquidityStatus(liquidityRow) : null;

    res.json({
      success: true,
      data: liquidity,
    });
  }),
);

/**
 * GET /api/dashboard/comprehensive/executive/order-intake
 * Get order intake statistics
 */
router.get(
  "/executive/order-intake",
  asyncHandler(async (req: Request, res: Response) => {
    const { periods = "12" } = req.query;

    logger.info({ periods }, "Fetching order intake");

    const intakeRows = await db.all(
      "SELECT * FROM dashboard_order_intake ORDER BY period DESC LIMIT ?",
      [parseInt(periods as string, 10)],
    );
    const intake = intakeRows.map(rowToOrderIntake);

    res.json({
      success: true,
      data: intake,
    });
  }),
);

/**
 * GET /api/dashboard/comprehensive/executive/productivity
 * Get productivity metrics
 */
router.get(
  "/executive/productivity",
  asyncHandler(async (req: Request, res: Response) => {
    logger.info("Fetching productivity metrics");

    const productivityRow = await db.get(
      "SELECT * FROM dashboard_productivity ORDER BY date DESC LIMIT 1",
    );
    const productivity = productivityRow
      ? rowToProductivityMetrics(productivityRow)
      : null;

    res.json({
      success: true,
      data: productivity,
    });
  }),
);

// ============================================================================
// PROCESS MONITORING ROUTES
// ============================================================================

/**
 * GET /api/dashboard/comprehensive/process/pipeline
 * Get sales pipeline stages
 */
router.get(
  "/process/pipeline",
  asyncHandler(async (req: Request, res: Response) => {
    logger.info("Fetching pipeline stages");

    const pipelineRows = await db.all(
      "SELECT * FROM dashboard_pipeline ORDER BY stage ASC",
    );
    const pipeline = pipelineRows.map(rowToPipelineStage);

    res.json({
      success: true,
      data: pipeline,
    });
  }),
);

/**
 * GET /api/dashboard/comprehensive/process/procurement
 * Get procurement metrics
 */
router.get(
  "/process/procurement",
  asyncHandler(async (req: Request, res: Response) => {
    const { days = "30" } = req.query;

    logger.info({ days }, "Fetching procurement metrics");

    const procurementRows = await db.all(
      `SELECT * FROM dashboard_procurement 
       WHERE date >= date('now', '-' || ? || ' days') 
       ORDER BY date DESC`,
      [parseInt(days as string, 10)],
    );
    const procurement = procurementRows.map(rowToProcurementMetrics);

    res.json({
      success: true,
      data: procurement,
    });
  }),
);

/**
 * GET /api/dashboard/comprehensive/process/production
 * Get production utilization
 */
router.get(
  "/process/production",
  asyncHandler(async (req: Request, res: Response) => {
    const { days = "30" } = req.query;

    logger.info({ days }, "Fetching production utilization");

    const productionRows = await db.all(
      `SELECT * FROM dashboard_production 
       WHERE date >= date('now', '-' || ? || ' days') 
       ORDER BY date DESC`,
      [parseInt(days as string, 10)],
    );
    const production = productionRows.map(rowToProductionUtilization);

    res.json({
      success: true,
      data: production,
    });
  }),
);

/**
 * GET /api/dashboard/comprehensive/process/sla
 * Get SLA metrics
 */
router.get(
  "/process/sla",
  asyncHandler(async (req: Request, res: Response) => {
    const { days = "30" } = req.query;

    logger.info({ days }, "Fetching SLA metrics");

    const slaRows = await db.all(
      `SELECT * FROM dashboard_sla 
       WHERE date >= date('now', '-' || ? || ' days') 
       ORDER BY date DESC`,
      [parseInt(days as string, 10)],
    );
    const sla = slaRows.map(rowToSLAMetrics);

    res.json({
      success: true,
      data: sla,
    });
  }),
);

/**
 * GET /api/dashboard/comprehensive/process/projects
 * Get project progress
 */
router.get(
  "/process/projects",
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;

    logger.info({ status }, "Fetching project progress");

    let sql = "SELECT * FROM dashboard_projects WHERE 1=1";
    const params: SqlValue[] = [];

    if (status && typeof status === "string") {
      sql += " AND status = ?";
      params.push(status);
    }

    sql += " ORDER BY updated_at DESC";

    const projectsRows = await db.all(sql, params);
    const projects = projectsRows.map(rowToProjectProgress);

    res.json({
      success: true,
      data: projects,
      count: projects.length,
    });
  }),
);

// ============================================================================
// WARNINGS & ESCALATIONS ROUTES
// ============================================================================

/**
 * GET /api/dashboard/comprehensive/warnings/all
 * Get all warnings and alerts
 */
router.get(
  "/warnings/all",
  asyncHandler(async (req: Request, res: Response) => {
    const { type, severity, acknowledged, resolved } = req.query;

    logger.info(
      { type, severity, acknowledged, resolved },
      "Fetching warnings",
    );

    let sql = "SELECT * FROM dashboard_warnings WHERE 1=1";
    const params: SqlValue[] = [];

    if (type && typeof type === "string") {
      sql += " AND type = ?";
      params.push(type);
    }

    if (severity && typeof severity === "string") {
      sql += " AND severity = ?";
      params.push(severity);
    }

    if (acknowledged === "true") {
      sql += " AND acknowledged_at IS NOT NULL";
    } else if (acknowledged === "false") {
      sql += " AND acknowledged_at IS NULL";
    }

    if (resolved === "true") {
      sql += " AND resolved_at IS NOT NULL";
    } else if (resolved === "false") {
      sql += " AND resolved_at IS NULL";
    }

    sql += " ORDER BY severity DESC, created_at DESC";

    const warningsRows = await db.all(sql, params);
    const warnings = warningsRows.map(rowToWarning);

    res.json({
      success: true,
      data: warnings,
      count: warnings.length,
    });
  }),
);

// ============================================================================
// WIDGET CONFIGURATION ROUTES
// ============================================================================

/**
 * GET /api/dashboard/comprehensive/widgets/config/:userId
 * Get user's widget configuration
 */
router.get(
  "/widgets/config/:userId",
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    logger.info({ userId }, "Fetching user widgets");

    const widgetsRows = await db.all(
      "SELECT * FROM dashboard_widgets WHERE user_id = ? ORDER BY position ASC",
      [userId],
    );
    const widgets = widgetsRows.map(rowToWidget);

    res.json({
      success: true,
      data: widgets,
      count: widgets.length,
    });
  }),
);

/**
 * POST /api/dashboard/comprehensive/widgets/config
 * Create a new widget
 */
router.post(
  "/widgets/config",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createWidgetSchema.parse(req.body);

    logger.info({ userId: validated.userId }, "Creating new widget");

    const id = randomUUID();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO dashboard_widgets (
        id, user_id, widget_type, data_source, title, description,
        position, width, height, refresh_interval, config, is_visible,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validated.userId,
        validated.widgetType,
        validated.dataSource,
        validated.title,
        validated.description ?? null,
        validated.position,
        validated.width,
        validated.height,
        validated.refreshInterval ?? null,
        validated.config ?? null,
        validated.isVisible ? 1 : 0,
        now,
        now,
      ],
    );

    const widgetRow = await db.get(
      "SELECT * FROM dashboard_widgets WHERE id = ?",
      [id],
    );
    if (!widgetRow) {
      throw new NotFoundError("Widget not found after creation");
    }

    const widget = rowToWidget(widgetRow);

    res.status(201).json({
      success: true,
      data: widget,
    });
  }),
);

/**
 * PUT /api/dashboard/comprehensive/widgets/config/:widgetId
 * Update a widget
 */
router.put(
  "/widgets/config/:widgetId",
  asyncHandler(async (req: Request, res: Response) => {
    const { widgetId } = req.params;
    const validated = updateWidgetSchema.parse(req.body);

    logger.info({ widgetId }, "Updating widget");

    const existing = await db.get(
      "SELECT * FROM dashboard_widgets WHERE id = ?",
      [widgetId],
    );
    if (!existing) {
      throw new NotFoundError("Widget not found");
    }

    const updates: string[] = [];
    const params: SqlValue[] = [];

    const fieldMapping: Record<string, string> = {
      widgetType: "widget_type",
      dataSource: "data_source",
      title: "title",
      description: "description",
      position: "position",
      width: "width",
      height: "height",
      refreshInterval: "refresh_interval",
      config: "config",
      isVisible: "is_visible",
    };

    Object.entries(validated).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = fieldMapping[key];
        if (dbField) {
          updates.push(`${dbField} = ?`);
          if (key === "isVisible") {
            params.push(value ? 1 : 0);
          } else {
            params.push(value as SqlValue);
          }
        }
      }
    });

    if (updates.length > 0) {
      updates.push("updated_at = ?");
      params.push(new Date().toISOString());
      params.push(widgetId);

      await db.run(
        `UPDATE dashboard_widgets SET ${updates.join(", ")} WHERE id = ?`,
        params,
      );
    }

    const updatedRow = await db.get(
      "SELECT * FROM dashboard_widgets WHERE id = ?",
      [widgetId],
    );
    if (!updatedRow) {
      throw new NotFoundError("Widget not found after update");
    }

    const widget = rowToWidget(updatedRow);

    res.json({
      success: true,
      data: widget,
    });
  }),
);

/**
 * DELETE /api/dashboard/comprehensive/widgets/config/:widgetId
 * Delete a widget
 */
router.delete(
  "/widgets/config/:widgetId",
  asyncHandler(async (req: Request, res: Response) => {
    const { widgetId } = req.params;

    logger.info({ widgetId }, "Deleting widget");

    const result = await db.run("DELETE FROM dashboard_widgets WHERE id = ?", [
      widgetId,
    ]);
    if (result.changes === 0) {
      throw new NotFoundError("Widget not found");
    }

    res.json({
      success: true,
      message: "Widget deleted successfully",
    });
  }),
);

// ============================================================================
// USER LAYOUTS ROUTES
// ============================================================================

/**
 * GET /api/dashboard/comprehensive/layouts/:userId
 * Get user's layouts
 */
router.get(
  "/layouts/:userId",
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    logger.info({ userId }, "Fetching user layouts");

    const layoutsRows = await db.all(
      "SELECT * FROM dashboard_layouts WHERE user_id = ? ORDER BY is_active DESC, is_default DESC",
      [userId],
    );
    const layouts = layoutsRows.map(rowToLayout);

    res.json({
      success: true,
      data: layouts,
      count: layouts.length,
    });
  }),
);

/**
 * POST /api/dashboard/comprehensive/layouts
 * Create a new layout
 */
router.post(
  "/layouts",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createLayoutSchema.parse(req.body);

    logger.info({ userId: validated.userId }, "Creating new layout");

    const id = randomUUID();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO dashboard_layouts (
        id, user_id, name, description, layout, is_default, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validated.userId,
        validated.name,
        validated.description ?? null,
        validated.layout,
        validated.isDefault ? 1 : 0,
        validated.isActive ? 1 : 0,
        now,
        now,
      ],
    );

    const layoutRow = await db.get(
      "SELECT * FROM dashboard_layouts WHERE id = ?",
      [id],
    );
    if (!layoutRow) {
      throw new NotFoundError("Layout not found after creation");
    }

    const layout = rowToLayout(layoutRow);

    res.status(201).json({
      success: true,
      data: layout,
    });
  }),
);

/**
 * PUT /api/dashboard/comprehensive/layouts/:layoutId
 * Update a layout
 */
router.put(
  "/layouts/:layoutId",
  asyncHandler(async (req: Request, res: Response) => {
    const { layoutId } = req.params;
    const validated = updateLayoutSchema.parse(req.body);

    logger.info({ layoutId }, "Updating layout");

    const existing = await db.get(
      "SELECT * FROM dashboard_layouts WHERE id = ?",
      [layoutId],
    );
    if (!existing) {
      throw new NotFoundError("Layout not found");
    }

    const updates: string[] = [];
    const params: SqlValue[] = [];

    const fieldMapping: Record<string, string> = {
      name: "name",
      description: "description",
      layout: "layout",
      isDefault: "is_default",
      isActive: "is_active",
    };

    Object.entries(validated).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = fieldMapping[key];
        if (dbField) {
          updates.push(`${dbField} = ?`);
          if (key === "isDefault" || key === "isActive") {
            params.push(value ? 1 : 0);
          } else {
            params.push(value as SqlValue);
          }
        }
      }
    });

    if (updates.length > 0) {
      updates.push("updated_at = ?");
      params.push(new Date().toISOString());
      params.push(layoutId);

      await db.run(
        `UPDATE dashboard_layouts SET ${updates.join(", ")} WHERE id = ?`,
        params,
      );
    }

    const updatedRow = await db.get(
      "SELECT * FROM dashboard_layouts WHERE id = ?",
      [layoutId],
    );
    if (!updatedRow) {
      throw new NotFoundError("Layout not found after update");
    }

    const layout = rowToLayout(updatedRow);

    res.json({
      success: true,
      data: layout,
    });
  }),
);

/**
 * DELETE /api/dashboard/comprehensive/layouts/:layoutId
 * Delete a layout
 */
router.delete(
  "/layouts/:layoutId",
  asyncHandler(async (req: Request, res: Response) => {
    const { layoutId } = req.params;

    logger.info({ layoutId }, "Deleting layout");

    const result = await db.run("DELETE FROM dashboard_layouts WHERE id = ?", [
      layoutId,
    ]);
    if (result.changes === 0) {
      throw new NotFoundError("Layout not found");
    }

    res.json({
      success: true,
      message: "Layout deleted successfully",
    });
  }),
);

// ============================================================================
// FAVORITES ROUTES
// ============================================================================

/**
 * GET /api/dashboard/comprehensive/favorites/:userId
 * Get user's favorites
 */
router.get(
  "/favorites/:userId",
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    logger.info({ userId }, "Fetching user favorites");

    const favoritesRows = await db.all(
      "SELECT * FROM dashboard_favorites WHERE user_id = ? ORDER BY position ASC",
      [userId],
    );
    const favorites = favoritesRows.map(rowToFavorite);

    res.json({
      success: true,
      data: favorites,
      count: favorites.length,
    });
  }),
);

/**
 * POST /api/dashboard/comprehensive/favorites
 * Create a new favorite
 */
router.post(
  "/favorites",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createFavoriteSchema.parse(req.body);

    logger.info({ userId: validated.userId }, "Creating new favorite");

    const id = randomUUID();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO dashboard_favorites (
        id, user_id, item_type, item_id, title, url, icon, position, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validated.userId,
        validated.itemType,
        validated.itemId,
        validated.title,
        validated.url,
        validated.icon ?? null,
        validated.position,
        now,
      ],
    );

    const favoriteRow = await db.get(
      "SELECT * FROM dashboard_favorites WHERE id = ?",
      [id],
    );
    if (!favoriteRow) {
      throw new NotFoundError("Favorite not found after creation");
    }

    const favorite = rowToFavorite(favoriteRow);

    res.status(201).json({
      success: true,
      data: favorite,
    });
  }),
);

/**
 * DELETE /api/dashboard/comprehensive/favorites/:favoriteId
 * Delete a favorite
 */
router.delete(
  "/favorites/:favoriteId",
  asyncHandler(async (req: Request, res: Response) => {
    const { favoriteId } = req.params;

    logger.info({ favoriteId }, "Deleting favorite");

    const result = await db.run(
      "DELETE FROM dashboard_favorites WHERE id = ?",
      [favoriteId],
    );
    if (result.changes === 0) {
      throw new NotFoundError("Favorite not found");
    }

    res.json({
      success: true,
      message: "Favorite deleted successfully",
    });
  }),
);

// ============================================================================
// COMPREHENSIVE OVERVIEW ROUTE
// ============================================================================

/**
 * GET /api/dashboard/comprehensive/comprehensive-overview
 * Get all dashboard data in one request
 */
router.get(
  "/comprehensive-overview",
  asyncHandler(async (req: Request, res: Response) => {
    logger.info("Fetching comprehensive dashboard overview");

    // Fetch all data in parallel
    const [
      revenueMetricsRow,
      profitMarginsRow,
      liquidityRow,
      orderIntakeRows,
      productivityRow,
      pipelineRows,
      warningsRows,
    ] = await Promise.all([
      db.get(
        "SELECT * FROM dashboard_revenue_metrics ORDER BY date DESC LIMIT 1",
      ),
      db.get(
        "SELECT * FROM dashboard_profit_margins ORDER BY date DESC LIMIT 1",
      ),
      db.get("SELECT * FROM dashboard_liquidity ORDER BY date DESC LIMIT 1"),
      db.all(
        "SELECT * FROM dashboard_order_intake ORDER BY period DESC LIMIT 12",
      ),
      db.get("SELECT * FROM dashboard_productivity ORDER BY date DESC LIMIT 1"),
      db.all("SELECT * FROM dashboard_pipeline ORDER BY stage ASC"),
      db.all(
        "SELECT * FROM dashboard_warnings WHERE resolved_at IS NULL ORDER BY severity DESC, created_at DESC LIMIT 10",
      ),
    ]);

    res.json({
      success: true,
      data: {
        revenue: revenueMetricsRow
          ? rowToRevenueMetrics(revenueMetricsRow)
          : null,
        margins: profitMarginsRow ? rowToProfitMargin(profitMarginsRow) : null,
        liquidity: liquidityRow ? rowToLiquidityStatus(liquidityRow) : null,
        orderIntake: orderIntakeRows.map(rowToOrderIntake),
        productivity: productivityRow
          ? rowToProductivityMetrics(productivityRow)
          : null,
        pipeline: pipelineRows.map(rowToPipelineStage),
        warnings: warningsRows.map(rowToWarning),
      },
    });
  }),
);

export default router;
