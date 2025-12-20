// SPDX-License-Identifier: MIT
// apps/backend/src/setup/routerSetup.ts

/**
 * Router Setup Module
 *
 * Centralized registration of all API routes.
 * Separates router configuration from main application file.
 *
 * @module setup/routerSetup
 */

import express, { Application, Request, Response } from "express";
import { createLogger } from "../utils/logger.js";

// Import all routers
import authRouter from "../routes/auth/authRouter.js";
import dashboardRouter from "../routes/dashboard/dashboard.js";
import aiRouter from "../routes/ai/aiRouter.js";
import healthRouter from "../routes/systemInfoRouter/health.js";
import functionsCatalogRouter from "../routes/functionsCatalog/functionsCatalog.js";
import aiAnnotatorRouter from "../routes/aiAnnotatorRouter/aiAnnotatorRouter.js";
import systemInfoRouter from "../routes/systemInfoRouter/systemInfoRouter.js";
import innovationRouter from "../routes/innovation/innovationRouter.js";
import calendarRouter from "../routes/calendar/calendarRouter.js";
import calendarExportRouter from "../routes/calendar/exportRouter.js";
import quickchatRouter from "../routes/quickchat/quickchatRouter.js";
import diagnosticsRouter from "../routes/diagnostics/diagnosticsRouter.js";
import hrRouter from "../routes/hr/hrRouter.js";
import financeRouter from "../routes/finance/financeRouter.js";
import documentsRouter from "../routes/documents/documentsRouter.js";
import searchAnalyticsRouter from "../routes/search/searchAnalyticsRouter.js";
import metricsRouter from "../routes/metrics/metricsRouter.js";
import crmRouter from "../routes/crm/crmRouter.js";
import inventoryRouter from "../routes/inventory/inventoryRouter.js";
import projectsRouter from "../routes/projects/projectsRouter.js";
import communicationRouter from "../routes/communication/communicationRouter.js";
import businessRouter from "../routes/business/businessRouter.js";
import salesRouter from "../routes/sales/salesRouter.js";
import marketingRouter from "../routes/marketing/marketingRouter.js";
import procurementRouter from "../routes/procurement/procurementRouter.js";
import productionRouter from "../routes/production/productionRouter.js";
import warehouseRouter from "../routes/warehouse/warehouseRouter.js";
import reportingRouter from "../routes/reporting/reportingRouter.js";
// import settingsRouter from "../routes/settings.js";
// import userSettingsRouter from "../routes/userSettings.js";
import helpRouter from "../routes/help/helpRouter.js";

// Services
import { websocketService } from "../routes/other/websocketService.js";
import { getSessionStats } from "../middleware/sessionMiddleware.js";

const logger = createLogger("router-setup");

/**
 * Interface for router registration
 */
interface RouterEntry {
  path: string;
  router: express.Router;
  category?: string;
}

/**
 * Organized list of all routers by category
 */
const routerRegistry: RouterEntry[] = [
  // Core APIs
  { path: "/api/auth", router: authRouter, category: "core" },
  { path: "/api/health", router: healthRouter, category: "core" },
  { path: "/api/system", router: systemInfoRouter, category: "core" },
  { path: "/api/metrics", router: metricsRouter, category: "core" },
  { path: "/api/help", router: helpRouter, category: "core" },

  // Dashboard & Reporting
  { path: "/api/dashboard", router: dashboardRouter, category: "analytics" },
  { path: "/api/reporting", router: reportingRouter, category: "analytics" },
  { path: "/api/search", router: searchAnalyticsRouter, category: "analytics" },

  // AI Features
  { path: "/api/ai", router: aiRouter, category: "ai" },
  { path: "/api/ai-annotator", router: aiAnnotatorRouter, category: "ai" },
  { path: "/api/quickchat", router: quickchatRouter, category: "ai" },

  // Workflow & Calendar
  { path: "/api/calendar", router: calendarRouter, category: "workflow" },
  { path: "/api/calendar", router: calendarExportRouter, category: "workflow" },
  { path: "/api/innovation", router: innovationRouter, category: "workflow" },

  // Functions & Tools
  { path: "/api/functions", router: functionsCatalogRouter, category: "system" },
  { path: "/diagnostics", router: diagnosticsRouter, category: "system" },

  // Business Modules
  { path: "/api/business", router: businessRouter, category: "business" },
  { path: "/api/sales", router: salesRouter, category: "business" },
  { path: "/api/marketing", router: marketingRouter, category: "business" },
  { path: "/api/hr", router: hrRouter, category: "business" },
  { path: "/api/finance", router: financeRouter, category: "business" },

  // Operations Modules
  { path: "/api/procurement", router: procurementRouter, category: "operations" },
  { path: "/api/production", router: productionRouter, category: "operations" },
  { path: "/api/warehouse", router: warehouseRouter, category: "operations" },
  { path: "/api/inventory", router: inventoryRouter, category: "operations" },

  // Management Modules
  { path: "/api/crm", router: crmRouter, category: "management" },
  { path: "/api/projects", router: projectsRouter, category: "management" },
  { path: "/api/documents", router: documentsRouter, category: "management" },
  { path: "/api/communication", router: communicationRouter, category: "management" },

  // Settings
  // { path: "/api/settings", router: settingsRouter, category: "config" },
  // { path: "/api/user-settings", router: userSettingsRouter, category: "config" },
  { path: "/api/help", router: helpRouter, category: "core" },
];

/**
 * Register all API routes with the Express application
 *
 * @param app - Express application instance
 * @returns Number of routers registered
 */
export function registerRouters(app: Application): number {
  logger.info("Initializing API routers...");

  const routersByCategory = new Map<string, number>();

  for (const entry of routerRegistry) {
    try {
      app.use(entry.path, entry.router);
      const category = entry.category || "uncategorized";
      routersByCategory.set(category, (routersByCategory.get(category) || 0) + 1);
    } catch (error) {
      logger.error(
        { path: entry.path, error },
        "Failed to register router"
      );
    }
  }

  // Log registration summary
  logger.info(
    { totalRouters: routerRegistry.length },
    "API routers activated"
  );

  routersByCategory.forEach((count, category) => {
    logger.debug({ category, count }, "Routers registered");
  });

  return routerRegistry.length;
}

/**
 * Register diagnostic endpoints
 */
export function registerDiagnosticEndpoints(app: Application): void {
  logger.debug("Registering diagnostic endpoints");

  // WebSocket statistics
  app.get("/api/ws/stats", (_req: Request, res: Response) => {
    res.json({
      success: true,
      ...websocketService.getStats(),
    });
  });

  // Session statistics
  app.get("/api/session/stats", async (_req: Request, res: Response) => {
    const stats = await getSessionStats();
    res.json({
      success: true,
      ...stats,
    });
  });

  // Debug route initialization
  app.get("/_router_init", (_req, res) => res.json({ ok: true }));

  // Debug available routes
  app.get("/api/debug/routes", (_req: Request, res: Response) => {
    try {
      interface RouterLayer {
        route?: { path: string };
        name?: string;
        handle?: { name?: string };
      }
      type AppRouter = { _router?: { stack: RouterLayer[] } };
      const appRouter = (app as unknown as AppRouter);
      const routerStack: RouterLayer[] = appRouter._router?.stack || [];
      res.json({
        success: true,
        message: "Router-Stack visible",
        layers: routerStack.length,
        routes: routerStack
          .map(
            (layer) =>
              layer?.route?.path || layer?.name || layer?.handle?.name
          )
          .filter(Boolean)
          .slice(0, 50),
      });
    } catch (err) {
      res.json({ success: false, error: String(err) });
    }
  });
}

/**
 * Register 404 fallback handler
 * Must be registered after all other routes
 */
export function register404Handler(app: Application): void {
  app.use((_req: Request, res: Response) => {
    logger.warn({ url: _req.originalUrl }, "Route not found");
    res.status(404).json({ error: "Not found" });
  });
}

export default {
  registerRouters,
  registerDiagnosticEndpoints,
  register404Handler,
};
