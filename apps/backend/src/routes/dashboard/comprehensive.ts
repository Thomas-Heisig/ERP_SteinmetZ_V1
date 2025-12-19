// SPDX-License-Identifier: MIT
// apps/backend/src/routes/dashboard/comprehensive.ts
// Comprehensive Dashboard API Routes based on _1_DASHBOARD.md

import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";

const router = Router();

/* =============================================================================
   EXECUTIVE OVERVIEW - Revenue Metrics
============================================================================= */

router.get(
  "/executive/revenue",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;
    const { period = "month" } = req.query;

    // Get latest revenue metrics
    const metrics = await db.get(
      "SELECT * FROM dashboard_revenue_metrics ORDER BY date DESC LIMIT 1",
    );

    // Get top customers
    const topCustomers = await db.all(
      "SELECT * FROM dashboard_top_customers WHERE period = ? ORDER BY rank ASC LIMIT 10",
      [period],
    );

    // Get top products
    const topProducts = await db.all(
      "SELECT * FROM dashboard_top_products WHERE period = ? ORDER BY rank ASC LIMIT 10",
      [period],
    );

    // Get regional distribution
    const regionalRevenue = await db.all(
      "SELECT * FROM dashboard_regional_revenue WHERE date = date('now') ORDER BY revenue DESC",
    );

    res.json({
      success: true,
      data: {
        metrics: metrics || {},
        topCustomers,
        topProducts,
        regionalRevenue,
      },
    });
  }),
);

/* =============================================================================
   EXECUTIVE OVERVIEW - Profit Margins
============================================================================= */

router.get(
  "/executive/margins",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;

    const margins = await db.get(
      "SELECT * FROM dashboard_margin_metrics ORDER BY date DESC LIMIT 1",
    );

    const marginsByProduct = await db.all(
      "SELECT * FROM dashboard_margin_by_product WHERE date = date('now') ORDER BY margin DESC",
    );

    const marginsByCustomer = await db.all(
      "SELECT * FROM dashboard_margin_by_customer WHERE date = date('now') ORDER BY margin DESC LIMIT 10",
    );

    res.json({
      success: true,
      data: {
        current: margins || {},
        byProduct: marginsByProduct,
        byCustomer: marginsByCustomer,
      },
    });
  }),
);

/* =============================================================================
   EXECUTIVE OVERVIEW - Liquidity Status
============================================================================= */

router.get(
  "/executive/liquidity",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;

    const liquidity = await db.get(
      "SELECT * FROM dashboard_liquidity_metrics ORDER BY date DESC LIMIT 1",
    );

    res.json({
      success: true,
      data: liquidity || {},
    });
  }),
);

/* =============================================================================
   EXECUTIVE OVERVIEW - Order Intake
============================================================================= */

router.get(
  "/executive/order-intake",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;

    const intake = await db.get(
      "SELECT * FROM dashboard_order_intake ORDER BY date DESC LIMIT 1",
    );

    const bySales = await db.all(
      "SELECT * FROM dashboard_order_intake_by_sales WHERE date = date('now') ORDER BY intake DESC",
    );

    const byRegion = await db.all(
      "SELECT * FROM dashboard_order_intake_by_region WHERE date = date('now') ORDER BY intake DESC",
    );

    res.json({
      success: true,
      data: {
        current: intake || {},
        bySales,
        byRegion,
      },
    });
  }),
);

/* =============================================================================
   EXECUTIVE OVERVIEW - Productivity Metrics
============================================================================= */

router.get(
  "/executive/productivity",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;

    const productivity = await db.get(
      "SELECT * FROM dashboard_productivity_metrics ORDER BY date DESC LIMIT 1",
    );

    res.json({
      success: true,
      data: productivity || {},
    });
  }),
);

/* =============================================================================
   PROCESS MONITORING - Lead to Cash Pipeline
============================================================================= */

router.get(
  "/process/pipeline",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;

    const pipelineStages = await db.all(
      "SELECT * FROM dashboard_pipeline_metrics WHERE date = date('now') ORDER BY stage",
    );

    const stagnantOpportunities = await db.all(
      "SELECT * FROM dashboard_stagnant_opportunities WHERE date = date('now') ORDER BY days_in_stage DESC LIMIT 10",
    );

    res.json({
      success: true,
      data: {
        stages: pipelineStages,
        stagnant: stagnantOpportunities,
      },
    });
  }),
);

/* =============================================================================
   PROCESS MONITORING - Procure to Pay
============================================================================= */

router.get(
  "/process/procurement",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;

    const metrics = await db.get(
      "SELECT * FROM dashboard_procurement_metrics ORDER BY date DESC LIMIT 1",
    );

    const supplierPerformance = await db.all(
      "SELECT * FROM dashboard_supplier_performance WHERE date = date('now') ORDER BY otif_rate DESC",
    );

    res.json({
      success: true,
      data: {
        metrics: metrics || {},
        suppliers: supplierPerformance,
      },
    });
  }),
);

/* =============================================================================
   PROCESS MONITORING - Production Utilization
============================================================================= */

router.get(
  "/process/production",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;

    const metrics = await db.get(
      "SELECT * FROM dashboard_production_metrics ORDER BY date DESC LIMIT 1",
    );

    const bottlenecks = await db.all(
      "SELECT * FROM dashboard_production_bottlenecks WHERE date = date('now') ORDER BY severity DESC",
    );

    res.json({
      success: true,
      data: {
        metrics: metrics || {},
        bottlenecks,
      },
    });
  }),
);

/* =============================================================================
   PROCESS MONITORING - Service Level
============================================================================= */

router.get(
  "/process/sla",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;

    const metrics = await db.get(
      "SELECT * FROM dashboard_sla_metrics ORDER BY date DESC LIMIT 1",
    );

    const violations = await db.all(
      "SELECT * FROM dashboard_sla_violations WHERE date = date('now') ORDER BY severity DESC",
    );

    res.json({
      success: true,
      data: {
        metrics: metrics || {},
        violations,
      },
    });
  }),
);

/* =============================================================================
   PROCESS MONITORING - Project Progress
============================================================================= */

router.get(
  "/process/projects",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;

    const projects = await db.all(
      "SELECT * FROM dashboard_project_metrics WHERE date = date('now') ORDER BY risk_level DESC, progress_percentage ASC",
    );

    // Calculate summary statistics
    const summary = {
      total: projects.length,
      critical: projects.filter((p) => p.risk_level === "critical").length,
      high_risk: projects.filter((p) => p.risk_level === "high").length,
      on_track: projects.filter((p) => p.schedule_variance >= -0.05).length,
    };

    res.json({
      success: true,
      data: {
        projects,
        summary,
      },
    });
  }),
);

/* =============================================================================
   WARNINGS & ESCALATIONS - All Types
============================================================================= */

router.get(
  "/warnings/all",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;
    const { priority, severity } = req.query;

    // Build WHERE clauses
    let deliveryWhere = "date = date('now')";
    let budgetWhere = "date = date('now')";
    let qualityWhere = "date = date('now')";
    let complaintsWhere = "date = date('now')";
    const systemWhere = "date = date('now')";

    const params: string[] = [];

    if (priority) {
      deliveryWhere += " AND priority = ?";
      budgetWhere += " AND priority = ?";
      qualityWhere += " AND severity = ?";
      complaintsWhere += " AND priority = ?";
      params.push(priority);
    }

    const deliveryDelays = await db.all(
      `SELECT * FROM dashboard_delivery_delays WHERE ${deliveryWhere} ORDER BY priority DESC, delay_days DESC`,
      params,
    );

    const budgetOverruns = await db.all(
      `SELECT * FROM dashboard_budget_overruns WHERE ${budgetWhere} ORDER BY priority DESC, overrun_percentage DESC`,
      params,
    );

    const qualityIssues = await db.all(
      `SELECT * FROM dashboard_quality_issues WHERE ${qualityWhere} ORDER BY severity DESC`,
      params,
    );

    const customerComplaints = await db.all(
      `SELECT * FROM dashboard_customer_complaints WHERE ${complaintsWhere} ORDER BY priority DESC, customer_clv DESC`,
      params,
    );

    const systemWarnings = await db.all(
      `SELECT * FROM dashboard_system_warnings WHERE ${systemWhere} ORDER BY severity DESC`,
      severity ? [severity] : [],
    );

    res.json({
      success: true,
      data: {
        deliveryDelays,
        budgetOverruns,
        qualityIssues,
        customerComplaints,
        systemWarnings,
        summary: {
          totalWarnings:
            deliveryDelays.length +
            budgetOverruns.length +
            qualityIssues.length +
            customerComplaints.length +
            systemWarnings.length,
          critical:
            deliveryDelays.filter((d) => d.priority === "critical").length +
            budgetOverruns.filter((b) => b.priority === "critical").length +
            qualityIssues.filter((q) => q.severity === "critical").length +
            customerComplaints.filter((c) => c.priority === "critical").length +
            systemWarnings.filter((s) => s.severity === "critical").length,
        },
      },
    });
  }),
);

/* =============================================================================
   REAL-TIME ANALYTICS - Finance KPIs
============================================================================= */

router.get(
  "/analytics/finance",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;
    const { period = "daily" } = req.query;

    const cashflow = await db.all(
      "SELECT * FROM dashboard_cashflow_analytics WHERE period = ? ORDER BY date DESC LIMIT 30",
      [period],
    );

    const dso = await db.get(
      "SELECT * FROM dashboard_dso_metrics ORDER BY date DESC LIMIT 1",
    );

    const roiByDept = await db.all(
      "SELECT * FROM dashboard_roi_by_department WHERE date = date('now') ORDER BY roi DESC",
    );

    res.json({
      success: true,
      data: {
        cashflow,
        dso: dso || {},
        roiByDepartment: roiByDept,
      },
    });
  }),
);

/* =============================================================================
   REAL-TIME ANALYTICS - Production KPIs
============================================================================= */

router.get(
  "/analytics/production",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;

    const oee = await db.all(
      "SELECT * FROM dashboard_oee_metrics WHERE date = date('now') ORDER BY oee DESC",
    );

    const throughput = await db.all(
      "SELECT * FROM dashboard_throughput_metrics WHERE date = date('now')",
    );

    const scrap = await db.all(
      "SELECT * FROM dashboard_scrap_metrics WHERE date = date('now') ORDER BY scrap_rate DESC",
    );

    res.json({
      success: true,
      data: {
        oee,
        throughput,
        scrap,
      },
    });
  }),
);

/* =============================================================================
   REAL-TIME ANALYTICS - Customer KPIs
============================================================================= */

router.get(
  "/analytics/customers",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;

    const clv = await db.all(
      "SELECT * FROM dashboard_clv_metrics WHERE date = date('now') ORDER BY average_clv DESC",
    );

    const churn = await db.get(
      "SELECT * FROM dashboard_churn_metrics ORDER BY date DESC LIMIT 1",
    );

    const nps = await db.all(
      "SELECT * FROM dashboard_nps_csat_metrics WHERE date = date('now') ORDER BY nps_score DESC",
    );

    const responseTime = await db.all(
      "SELECT * FROM dashboard_response_time_metrics WHERE date = date('now') ORDER BY channel",
    );

    const conversion = await db.all(
      "SELECT * FROM dashboard_conversion_metrics WHERE date = date('now') ORDER BY conversion_rate DESC",
    );

    res.json({
      success: true,
      data: {
        clv,
        churn: churn || {},
        nps,
        responseTime,
        conversion,
      },
    });
  }),
);

/* =============================================================================
   WIDGET CONFIGURATION
============================================================================= */

router.get(
  "/widgets/config/:userId",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;
    const { userId } = req.params;

    const widgets = await db.all(
      "SELECT * FROM dashboard_widget_config WHERE user_id = ? AND is_visible = 1 ORDER BY position_y, position_x",
      [userId],
    );

    res.json({
      success: true,
      data: widgets,
    });
  }),
);

router.post(
  "/widgets/config",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;
    const {
      user_id,
      widget_type,
      position_x,
      position_y,
      width,
      height,
      settings,
      refresh_interval,
    } = req.body;

    const id = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await db.run(
      `INSERT INTO dashboard_widget_config 
       (id, user_id, widget_type, position_x, position_y, width, height, settings, refresh_interval)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        user_id,
        widget_type,
        position_x || 0,
        position_y || 0,
        width || 1,
        height || 1,
        JSON.stringify(settings || {}),
        refresh_interval || 300,
      ],
    );

    res.json({
      success: true,
      data: { id },
    });
  }),
);

router.put(
  "/widgets/config/:widgetId",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;
    const { widgetId } = req.params;
    const {
      position_x,
      position_y,
      width,
      height,
      settings,
      is_visible,
      refresh_interval,
    } = req.body;

    const updates: string[] = [];
    const params: (string | number | boolean)[] = [];

    if (position_x !== undefined) {
      updates.push("position_x = ?");
      params.push(position_x);
    }
    if (position_y !== undefined) {
      updates.push("position_y = ?");
      params.push(position_y);
    }
    if (width !== undefined) {
      updates.push("width = ?");
      params.push(width);
    }
    if (height !== undefined) {
      updates.push("height = ?");
      params.push(height);
    }
    if (settings !== undefined) {
      updates.push("settings = ?");
      params.push(JSON.stringify(settings));
    }
    if (is_visible !== undefined) {
      updates.push("is_visible = ?");
      params.push(is_visible ? 1 : 0);
    }
    if (refresh_interval !== undefined) {
      updates.push("refresh_interval = ?");
      params.push(refresh_interval);
    }

    updates.push("updated_at = datetime('now')");
    params.push(widgetId);

    await db.run(
      `UPDATE dashboard_widget_config SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    res.json({
      success: true,
    });
  }),
);

/* =============================================================================
   USER LAYOUTS
============================================================================= */

router.get(
  "/layouts/:userId",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;
    const { userId } = req.params;

    const layouts = await db.all(
      "SELECT * FROM dashboard_user_layouts WHERE user_id = ? ORDER BY is_default DESC, layout_name",
      [userId],
    );

    res.json({
      success: true,
      data: layouts,
    });
  }),
);

router.post(
  "/layouts",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;
    const { user_id, layout_name, layout_config, is_default, device_type } =
      req.body;

    const id = `layout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // If setting as default, unset other defaults for this user and device
    if (is_default) {
      await db.run(
        "UPDATE dashboard_user_layouts SET is_default = 0 WHERE user_id = ? AND device_type = ?",
        [user_id, device_type || "desktop"],
      );
    }

    await db.run(
      `INSERT INTO dashboard_user_layouts 
       (id, user_id, layout_name, layout_config, is_default, device_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        user_id,
        layout_name,
        JSON.stringify(layout_config),
        is_default ? 1 : 0,
        device_type || "desktop",
      ],
    );

    res.json({
      success: true,
      data: { id },
    });
  }),
);

/* =============================================================================
   FAVORITES
============================================================================= */

router.get(
  "/favorites/:userId",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;
    const { userId } = req.params;

    const favorites = await db.all(
      "SELECT * FROM dashboard_favorites WHERE user_id = ? ORDER BY display_order",
      [userId],
    );

    res.json({
      success: true,
      data: favorites,
    });
  }),
);

router.post(
  "/favorites",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;
    const { user_id, item_type, item_id, display_order } = req.body;

    const id = `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await db.run(
      `INSERT INTO dashboard_favorites (id, user_id, item_type, item_id, display_order)
       VALUES (?, ?, ?, ?, ?)`,
      [id, user_id, item_type, item_id, display_order || 0],
    );

    res.json({
      success: true,
      data: { id },
    });
  }),
);

router.delete(
  "/favorites/:favoriteId",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;
    const { favoriteId } = req.params;

    await db.run("DELETE FROM dashboard_favorites WHERE id = ?", [favoriteId]);

    res.json({
      success: true,
    });
  }),
);

/* =============================================================================
   COMPREHENSIVE OVERVIEW
============================================================================= */

router.get(
  "/comprehensive-overview",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;

    // Fetch key metrics from all areas
    const [
      revenue,
      margins,
      liquidity,
      orderIntake,
      productivity,
      pipelineStages,
      procurementMetrics,
      productionMetrics,
      slaMetrics,
    ] = await Promise.all([
      db.get(
        "SELECT * FROM dashboard_revenue_metrics ORDER BY date DESC LIMIT 1",
      ),
      db.get(
        "SELECT * FROM dashboard_margin_metrics ORDER BY date DESC LIMIT 1",
      ),
      db.get(
        "SELECT * FROM dashboard_liquidity_metrics ORDER BY date DESC LIMIT 1",
      ),
      db.get("SELECT * FROM dashboard_order_intake ORDER BY date DESC LIMIT 1"),
      db.get(
        "SELECT * FROM dashboard_productivity_metrics ORDER BY date DESC LIMIT 1",
      ),
      db.all(
        "SELECT * FROM dashboard_pipeline_metrics WHERE date = date('now') ORDER BY stage",
      ),
      db.get(
        "SELECT * FROM dashboard_procurement_metrics ORDER BY date DESC LIMIT 1",
      ),
      db.get(
        "SELECT * FROM dashboard_production_metrics ORDER BY date DESC LIMIT 1",
      ),
      db.get("SELECT * FROM dashboard_sla_metrics ORDER BY date DESC LIMIT 1"),
    ]);

    // Count warnings by severity
    const warnings = await Promise.all([
      db.all(
        "SELECT priority, COUNT(*) as count FROM dashboard_delivery_delays WHERE date = date('now') GROUP BY priority",
      ),
      db.all(
        "SELECT priority, COUNT(*) as count FROM dashboard_budget_overruns WHERE date = date('now') GROUP BY priority",
      ),
      db.all(
        "SELECT severity, COUNT(*) as count FROM dashboard_quality_issues WHERE date = date('now') GROUP BY severity",
      ),
      db.all(
        "SELECT priority, COUNT(*) as count FROM dashboard_customer_complaints WHERE date = date('now') GROUP BY priority",
      ),
      db.all(
        "SELECT severity, COUNT(*) as count FROM dashboard_system_warnings WHERE date = date('now') GROUP BY severity",
      ),
    ]);

    res.json({
      success: true,
      data: {
        executive: {
          revenue: revenue || {},
          margins: margins || {},
          liquidity: liquidity || {},
          orderIntake: orderIntake || {},
          productivity: productivity || {},
        },
        processes: {
          pipeline: pipelineStages,
          procurement: procurementMetrics || {},
          production: productionMetrics || {},
          sla: slaMetrics || {},
        },
        warnings: {
          deliveryDelays: warnings[0],
          budgetOverruns: warnings[1],
          qualityIssues: warnings[2],
          customerComplaints: warnings[3],
          systemWarnings: warnings[4],
        },
      },
      timestamp: new Date().toISOString(),
    });
  }),
);

export default router;
