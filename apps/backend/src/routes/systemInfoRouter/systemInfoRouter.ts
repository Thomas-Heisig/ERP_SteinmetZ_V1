// SPDX-License-Identifier: MIT
// apps/backend/src/routes/systemInfoRouter/systemInfoRouter.ts

import { Router, Request, Response } from "express";
import systemInfoService from "../../services/systemInfoService.js";

const router = Router();

/* -----------------------------------------------------------
   Error-Handler (einheitlich)
----------------------------------------------------------- */
function handleError(
  res: Response,
  label: string,
  error: unknown,
  status = 500,
) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[systemInfoRouter] ${label} error:`, message);
  res.status(status).json({ success: false, error: message });
}

/* -----------------------------------------------------------
   Utility: Express-App zuverlässig bestimmen
----------------------------------------------------------- */
function resolveApp(req: Request): import("express").Application {
  return (req.app as any) ?? (globalThis as any).expressApp;
}

/* -----------------------------------------------------------
   Haupt-Systemübersicht
----------------------------------------------------------- */
router.get("/", async (req: Request, res: Response) => {
  try {
    const app = resolveApp(req);
    const overview = await systemInfoService.getCompleteSystemOverview(app);
    res.json({ success: true, data: overview });
  } catch (error) {
    handleError(res, "System overview", error);
  }
});

/* -----------------------------------------------------------
   Alle registrierten Routen
----------------------------------------------------------- */
router.get("/routes", async (_req: Request, res: Response) => {
  try {
    const app = (globalThis as any).expressApp;

    if (!app) {
      throw new Error("Express-App nicht verfügbar");
    }

    // Router-Initialisierung sicherstellen
    if (!app._router || !Array.isArray(app._router.stack)) {
      // Once-only init Route
      app.get("/__init_router__", (_r: any, _s: any) => {});
    }

    if (!app._router || !Array.isArray(app._router.stack)) {
      return res.json({
        success: false,
        error: "Router-Stack weiterhin nicht verfügbar",
      });
    }

    const routes = systemInfoService.getRegisteredRoutes(app);

    res.json({
      success: true,
      data: { count: routes.length, endpoints: routes },
    });
  } catch (err) {
    handleError(res, "Routes", err);
  }
});

/* -----------------------------------------------------------
   Datenbankinformationen
----------------------------------------------------------- */
router.get("/database", async (_req: Request, res: Response) => {
  try {
    const dbInfo = await systemInfoService.getDatabaseInfo();
    res.json({ success: true, data: dbInfo });
  } catch (error) {
    handleError(res, "Database info", error);
  }
});

/* -----------------------------------------------------------
   Systeminformationen
----------------------------------------------------------- */
router.get("/system", async (_req: Request, res: Response) => {
  try {
    const systemInfo = systemInfoService.getSystemInfo();
    res.json({ success: true, data: systemInfo });
  } catch (error) {
    handleError(res, "System info", error);
  }
});

/* -----------------------------------------------------------
   Service-Status
----------------------------------------------------------- */
router.get("/status", async (_req: Request, res: Response) => {
  try {
    const status = await systemInfoService.getServiceStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    handleError(res, "Service status", error);
  }
});

/* -----------------------------------------------------------
   Health-Check
----------------------------------------------------------- */
router.get("/health", async (_req: Request, res: Response) => {
  try {
    const status = await systemInfoService.getServiceStatus();
    const healthy = status.database.connected;

    res.status(healthy ? 200 : 503).json({
      success: healthy,
      status: healthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        database: status.database.connected,
        functions: status.functions.loaded,
        ai: status.ai.available,
      },
    });
  } catch (error) {
    handleError(res, "Health check", error);
  }
});

/* -----------------------------------------------------------
   Environment (sicher)
----------------------------------------------------------- */
router.get("/environment", async (_req: Request, res: Response) => {
  try {
    const env = systemInfoService.getSanitizedEnvironment();
    res.json({ success: true, data: env });
  } catch (error) {
    handleError(res, "Environment", error);
  }
});

/* -----------------------------------------------------------
   Dependencies
----------------------------------------------------------- */
router.get("/dependencies", async (_req: Request, res: Response) => {
  try {
    const deps = systemInfoService.getDependenciesSummary();
    res.json({ success: true, data: deps });
  } catch (error) {
    handleError(res, "Dependencies", error);
  }
});

/* -----------------------------------------------------------
   Diagnostics
----------------------------------------------------------- */
router.get("/diagnostics", async (_req: Request, res: Response) => {
  try {
    const diag = await systemInfoService.runSystemDiagnostics();
    res.json({ success: true, data: diag });
  } catch (error) {
    handleError(res, "Diagnostics", error);
  }
});

/* -----------------------------------------------------------
   Feature Flags
----------------------------------------------------------- */
router.get("/features", async (_req: Request, res: Response) => {
  try {
    const flags = systemInfoService.getBackendFeatureFlags();
    res.json({ success: true, data: flags });
  } catch (error) {
    handleError(res, "Feature flags", error);
  }
});

/* -----------------------------------------------------------
   Ressourcenauslastung
----------------------------------------------------------- */
router.get("/resources", async (_req: Request, res: Response) => {
  try {
    const usage = systemInfoService.getResourceUsage();
    res.json({ success: true, data: usage });
  } catch (error) {
    handleError(res, "Resource usage", error);
  }
});

/* -----------------------------------------------------------
   Funktionskatalog (Kurzform)
----------------------------------------------------------- */
router.get("/functions", async (_req: Request, res: Response) => {
  try {
    const summary = await systemInfoService.getFunctionsSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    handleError(res, "Functions summary", error);
  }
});

export default router;
