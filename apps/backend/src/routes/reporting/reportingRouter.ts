// SPDX-License-Identifier: MIT
// apps/backend/src/routes/reporting/reportingRouter.ts

/**
 * Reporting Router Module
 *
 * Handles all reporting and analytics HTTP endpoints including standard reports,
 * ad-hoc analyses, AI insights, and dashboard KPIs.
 *
 * @module ReportingRouter
 * @category Routes
 */

import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { z } from "zod";
import { createLogger } from "../../utils/logger.js";
import { reportingService } from "./reportingService.js";

const logger = createLogger("reporting-router");
const router = Router();

/* ---------------------------------------------------------
   STANDARD-REPORTS
--------------------------------------------------------- */

/**
 * Get financial reports overview
 *
 * Returns available financial reports (balance sheet, P&L, cashflow)
 * for a specified period and year.
 *
 * @route GET /api/reporting/financial
 * @query {string} [period] - Report period (current_month, last_month, quarter, year)
 * @query {number} [year] - Report year (defaults to current year)
 * @access Private
 * @returns {FinancialReport} Available financial reports
 */
router.get(
  "/financial",
  asyncHandler(async (req, res) => {
    const period = req.query.period as string | undefined;
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : undefined;

    logger.debug(
      { period, year },
      "GET /api/reporting/financial - Fetching financial reports",
    );

    const reports = await reportingService.getFinancialReports(period, year);

    logger.info(
      { period, year, count: reports.reports.length },
      "Financial reports retrieved",
    );
    res.json(reports);
  }),
);

/**
 * Get specific financial report by type
 *
 * Returns detailed financial report data for a specific report type
 * (e.g., P&L, balance sheet, cashflow).
 *
 * @route GET /api/reporting/financial/:type
 * @param {string} type - Report type (pnl, balance_sheet, cashflow)
 * @query {number} year - Report year
 * @query {number} [month] - Report month (optional)
 * @access Private
 * @returns {PnLReport|BalanceSheetReport|CashflowReport} Detailed report data
 */
router.get(
  "/financial/:type",
  asyncHandler(async (req, res) => {
    const { type } = req.params;
    const year = parseInt(req.query.year as string);
    const month = req.query.month
      ? parseInt(req.query.month as string)
      : undefined;

    logger.debug(
      { type, year, month },
      "GET /api/reporting/financial/:type - Fetching specific report",
    );

    if (type === "pnl") {
      const report = await reportingService.getPnLReport(year, month);
      logger.info(
        { type, year, month, net_income: report.data.net_income },
        "P&L report retrieved",
      );
      return res.json(report);
    }

    logger.warn({ type }, "Report type not implemented");
    res.json({ message: "Report type not implemented", type });
  }),
);

/**
 * Get sales report
 *
 * Returns comprehensive sales metrics including revenue, orders,
 * top customers, products, and regional breakdown.
 *
 * @route GET /api/reporting/sales
 * @access Private
 * @returns {SalesReport} Sales report with metrics and breakdowns
 */
router.get(
  "/sales",
  asyncHandler(async (_req, res) => {
    logger.debug("GET /api/reporting/sales - Fetching sales report");

    const report = await reportingService.getSalesReport();

    logger.info(
      { revenue: report.revenue.total, orders: report.orders.count },
      "Sales report retrieved",
    );
    res.json(report);
  }),
);

/**
 * Get production report
 *
 * Returns production metrics including output, OEE, downtime,
 * and product breakdown.
 *
 * @route GET /api/reporting/production
 * @access Private
 * @returns {ProductionReport} Production metrics and efficiency data
 */
router.get(
  "/production",
  asyncHandler(async (_req, res) => {
    logger.debug("GET /api/reporting/production - Fetching production report");

    const report = await reportingService.getProductionReport();

    logger.info(
      { oee: report.efficiency.oee, units: report.output.units_produced },
      "Production report retrieved",
    );
    res.json(report);
  }),
);

/**
 * Get HR report
 *
 * Returns human resources metrics including headcount, attendance,
 * and overtime statistics.
 *
 * @route GET /api/reporting/hr
 * @access Private
 * @returns {HRReport} HR metrics and department breakdown
 */
router.get(
  "/hr",
  asyncHandler(async (_req, res) => {
    logger.debug("GET /api/reporting/hr - Fetching HR report");

    const report = await reportingService.getHRReport();

    logger.info(
      {
        headcount: report.headcount.total,
        presence_rate: report.attendance.presence_rate,
      },
      "HR report retrieved",
    );
    res.json(report);
  }),
);

/**
 * Get inventory report
 *
 * Returns inventory metrics including valuation, turnover,
 * movements, and stock status.
 *
 * @route GET /api/reporting/inventory
 * @access Private
 * @returns {InventoryReport} Inventory metrics and status
 */
router.get(
  "/inventory",
  asyncHandler(async (_req, res) => {
    logger.debug("GET /api/reporting/inventory - Fetching inventory report");

    const report = await reportingService.getInventoryReport();

    logger.info(
      { total_value: report.value.total, turnover_rate: report.turnover.rate },
      "Inventory report retrieved",
    );
    res.json(report);
  }),
);

/* ---------------------------------------------------------
   AD-HOC ANALYSEN
--------------------------------------------------------- */

/**
 * Execute ad-hoc analysis
 *
 * Runs a custom data analysis query with specified dimensions,
 * measures, filters, and sorting.
 *
 * @route POST /api/reporting/adhoc
 * @body {AdhocQuery} Query configuration
 * @access Private
 * @returns {AdhocResult} Query results with execution metadata
 */
const adhocSchema = z.object({
  name: z.string().min(1, "Name is required"),
  datasource: z.string().min(1, "Datasource is required"),
  dimensions: z.array(z.string()).min(1, "At least one dimension required"),
  measures: z.array(z.string()).min(1, "At least one measure required"),
  filters: z
    .array(
      z.object({
        field: z.string(),
        operator: z.enum(["eq", "ne", "gt", "lt", "gte", "lte", "in", "like"]),
        value: z.any(),
      }),
    )
    .optional(),
  groupBy: z.array(z.string()).optional(),
  orderBy: z
    .array(
      z.object({
        field: z.string(),
        direction: z.enum(["asc", "desc"]),
      }),
    )
    .optional(),
  limit: z.number().positive().optional(),
});

router.post(
  "/adhoc",
  asyncHandler(async (req, res) => {
    logger.debug(
      { name: req.body.name, datasource: req.body.datasource },
      "POST /api/reporting/adhoc - Executing ad-hoc analysis",
    );

    const validatedData = adhocSchema.parse(req.body);
    const result = await reportingService.executeAdhocAnalysis(validatedData);

    logger.info(
      {
        name: validatedData.name,
        rows: result.results.total_rows,
        execution_time: result.results.execution_time_ms,
      },
      "Ad-hoc analysis completed",
    );

    res.json({
      message: "Analyse ausgeführt",
      ...result,
    });
  }),
);

/**
 * Save ad-hoc analysis
 *
 * Saves an ad-hoc analysis query for later reuse and optionally
 * schedules it for automatic execution.
 *
 * @route POST /api/reporting/adhoc/save
 * @body {object} Analysis configuration with optional schedule
 * @access Private
 * @returns {object} Saved analysis with ID
 */
const saveAnalysisSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  query: adhocSchema,
  schedule: z
    .object({
      enabled: z.boolean(),
      frequency: z.enum(["daily", "weekly", "monthly"]),
      recipients: z.array(z.string().email()),
    })
    .optional(),
});

router.post(
  "/adhoc/save",
  asyncHandler(async (req, res) => {
    logger.debug(
      { name: req.body.name },
      "POST /api/reporting/adhoc/save - Saving analysis",
    );

    const validatedData = saveAnalysisSchema.parse(req.body);

    // TODO: Save to database
    const saved = {
      id: Date.now(),
      ...validatedData,
      created_at: new Date().toISOString(),
    };

    logger.info({ id: saved.id, name: validatedData.name }, "Analysis saved");
    res.status(201).json({
      message: "Analyse gespeichert",
      data: saved,
    });
  }),
);

/* ---------------------------------------------------------
   KI-ANALYTICS
--------------------------------------------------------- */

/**
 * Get AI predictions
 *
 * Returns AI-powered forecasts for sales, demand, and churn risk
 * with confidence intervals.
 *
 * @route GET /api/reporting/ai/predictions
 * @access Private
 * @returns {AIPrediction} Predictions with confidence levels
 */
router.get(
  "/ai/predictions",
  asyncHandler(async (_req, res) => {
    logger.debug("GET /api/reporting/ai/predictions - Fetching AI predictions");

    const predictions = await reportingService.getAIPredictions();

    logger.info(
      {
        next_month_forecast:
          predictions.sales_forecast.next_month.predicted_revenue,
        at_risk_customers: predictions.churn_risk.at_risk_customers,
      },
      "AI predictions retrieved",
    );

    res.json(predictions);
  }),
);

/**
 * Get AI insights
 *
 * Returns AI-generated insights about opportunities, risks,
 * and optimizations based on data analysis.
 *
 * @route GET /api/reporting/ai/insights
 * @access Private
 * @returns {AIInsight[]} Array of actionable insights
 */
router.get(
  "/ai/insights",
  asyncHandler(async (_req, res) => {
    logger.debug("GET /api/reporting/ai/insights - Fetching AI insights");

    const insights = await reportingService.getAIInsights();

    logger.info(
      {
        count: insights.length,
        high_priority: insights.filter((i) => i.priority === "high").length,
      },
      "AI insights retrieved",
    );

    res.json({ insights });
  }),
);

/**
 * Get AI trend analysis
 *
 * Returns AI-powered trend analysis for key business metrics
 * with contributing factors.
 *
 * @route GET /api/reporting/ai/trends
 * @access Private
 * @returns {AITrend[]} Array of trend analyses
 */
router.get(
  "/ai/trends",
  asyncHandler(async (_req, res) => {
    logger.debug("GET /api/reporting/ai/trends - Fetching AI trends");

    const trends = await reportingService.getAITrends();

    logger.info(
      { count: trends.length, alerts: trends.filter((t) => t.alert).length },
      "AI trends retrieved",
    );

    res.json({ trends });
  }),
);

/* ---------------------------------------------------------
   DASHBOARD-DATEN
--------------------------------------------------------- */

/**
 * Get dashboard KPIs
 *
 * Returns key performance indicators for the main dashboard
 * with current values, changes, and trends.
 *
 * @route GET /api/reporting/dashboard-kpis
 * @access Private
 * @returns {DashboardKPIs} KPIs with trend information
 */
router.get(
  "/dashboard-kpis",
  asyncHandler(async (_req, res) => {
    logger.debug("GET /api/reporting/dashboard-kpis - Fetching dashboard KPIs");

    const kpis = await reportingService.getDashboardKPIs();

    logger.info(
      { revenue: kpis.revenue.value, profit_margin: kpis.profit_margin.value },
      "Dashboard KPIs retrieved",
    );

    res.json({
      kpis: [
        {
          name: "Umsatz (Monat)",
          value: kpis.revenue.value,
          unit: "EUR",
          change: kpis.revenue.change,
          trend: kpis.revenue.trend,
          status: kpis.revenue.change > 0 ? "good" : "warning",
        },
        {
          name: "Gewinnmarge",
          value: kpis.profit_margin.value,
          unit: "%",
          change: kpis.profit_margin.change,
          trend: kpis.profit_margin.trend,
          status: kpis.profit_margin.value > 15 ? "good" : "normal",
        },
        {
          name: "Kundenzufriedenheit",
          value: kpis.customer_satisfaction.value,
          unit: "/5",
          change: kpis.customer_satisfaction.change,
          trend: kpis.customer_satisfaction.trend,
          status: kpis.customer_satisfaction.value >= 4.5 ? "good" : "normal",
        },
        {
          name: "Lieferperformance",
          value: kpis.delivery_performance.value,
          unit: "%",
          change: kpis.delivery_performance.change,
          trend: kpis.delivery_performance.trend,
          status: kpis.delivery_performance.value >= 95 ? "good" : "warning",
        },
        {
          name: "Produktionseffizienz",
          value: kpis.production_efficiency.value,
          unit: "%",
          change: kpis.production_efficiency.change,
          trend: kpis.production_efficiency.trend,
          status: kpis.production_efficiency.value >= 85 ? "good" : "normal",
        },
        {
          name: "Mitarbeiterauslastung",
          value: kpis.employee_utilization.value,
          unit: "%",
          change: kpis.employee_utilization.change,
          trend: kpis.employee_utilization.trend,
          status: kpis.employee_utilization.value >= 90 ? "good" : "normal",
        },
      ],
      updated_at: new Date().toISOString(),
    });
  }),
);

export default router;
