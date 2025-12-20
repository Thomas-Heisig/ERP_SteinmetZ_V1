// SPDX-License-Identifier: MIT
// apps/backend/src/routes/systemInfoRouter/systemInfoRouter.ts

import { Router, Request, Response, Application } from "express";
import systemInfoService from "../other/systemInfoService.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

const router = Router();

/* -----------------------------------------------------------
   Utility: Express-App zuverlässig bestimmen
----------------------------------------------------------- */
function resolveApp(req: Request): Application {
  return (
    (req.app as Application) ??
    ((globalThis as { expressApp?: Application }).expressApp as Application)
  );
}

/* -----------------------------------------------------------
   Haupt-Systemübersicht
----------------------------------------------------------- */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const app = resolveApp(req);
    const overview = await systemInfoService.getCompleteSystemOverview(app);
    res.json({ success: true, data: overview });
  }),
);

/* -----------------------------------------------------------
   Alle registrierten Routen
----------------------------------------------------------- */
router.get(
  "/routes",
  asyncHandler(async (_req: Request, res: Response) => {
    const app = (globalThis as { expressApp?: Application }).expressApp;

    if (!app) {
      throw new Error("Express-App nicht verfügbar");
    }

    // Router-Initialisierung sicherstellen
    if (!app._router || !Array.isArray(app._router.stack)) {
      // Once-only init Route
      app.get("/__init_router__", (_r: Request, _s: Response) => {});
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
  }),
);

/* -----------------------------------------------------------
   Datenbankinformationen
----------------------------------------------------------- */
router.get(
  "/database",
  asyncHandler(async (_req: Request, res: Response) => {
    const dbInfo = await systemInfoService.getDatabaseInfo();
    res.json({ success: true, data: dbInfo });
  }),
);

/* -----------------------------------------------------------
   Systeminformationen
----------------------------------------------------------- */
router.get(
  "/system",
  asyncHandler(async (_req: Request, res: Response) => {
    const systemInfo = systemInfoService.getSystemInfo();
    res.json({ success: true, data: systemInfo });
  }),
);

/* -----------------------------------------------------------
   Service-Status
----------------------------------------------------------- */
router.get(
  "/status",
  asyncHandler(async (_req: Request, res: Response) => {
    const status = await systemInfoService.getServiceStatus();
    res.json({ success: true, data: status });
  }),
);

/* -----------------------------------------------------------
   Health-Check
----------------------------------------------------------- */
router.get(
  "/health",
  asyncHandler(async (_req: Request, res: Response) => {
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
  }),
);

/* -----------------------------------------------------------
   Environment (sicher)
----------------------------------------------------------- */
router.get(
  "/environment",
  asyncHandler(async (_req: Request, res: Response) => {
    const env = systemInfoService.getSanitizedEnvironment();
    res.json({ success: true, data: env });
  }),
);

/* -----------------------------------------------------------
   Dependencies
----------------------------------------------------------- */
router.get(
  "/dependencies",
  asyncHandler(async (_req: Request, res: Response) => {
    const deps = systemInfoService.getDependenciesSummary();
    res.json({ success: true, data: deps });
  }),
);

/* -----------------------------------------------------------
   Diagnostics
----------------------------------------------------------- */
router.get(
  "/diagnostics",
  asyncHandler(async (_req: Request, res: Response) => {
    const diag = await systemInfoService.runSystemDiagnostics();
    res.json({ success: true, data: diag });
  }),
);

/* -----------------------------------------------------------
   Feature Flags
----------------------------------------------------------- */
router.get(
  "/features",
  asyncHandler(async (_req: Request, res: Response) => {
    const flags = systemInfoService.getBackendFeatureFlags();
    res.json({ success: true, data: flags });
  }),
);

/* -----------------------------------------------------------
   Ressourcenauslastung
----------------------------------------------------------- */
router.get(
  "/resources",
  asyncHandler(async (_req: Request, res: Response) => {
    const usage = systemInfoService.getResourceUsage();
    res.json({ success: true, data: usage });
  }),
);

/* -----------------------------------------------------------
   Funktionskatalog (Kurzform)
----------------------------------------------------------- */
router.get(
  "/functions",
  asyncHandler(async (_req: Request, res: Response) => {
    const summary = await systemInfoService.getFunctionsSummary();
    res.json({ success: true, data: summary });
  }),
);

export default router;
