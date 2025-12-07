/********************************************************************
 *  ERP-SteinmetZ – Backend (Express)
 *
 *  • Health-/Dashboard-/AI-/Functions-Router
 *  • CORS inkl. Credentials
 *  • JSON-/URL-encoded Body-Parser
 *  • Initiales Einlesen des Funktionskatalogs (optional persist)
 *  • Watcher auf docs/functions (optional)
 *  • 404 & zentraler Error-Handler
 *  • Statisches System-Dashboard (HTML, CSS, JS)
 ********************************************************************/

/********************************************************************
 *  ERP-SteinmetZ – Backend (Express)
 ********************************************************************/

import "dotenv/config";
import express, { Request, Response, Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "node:url";
import path from "node:path";
import chokidar from "chokidar";
import fs from "fs/promises";
import { GlobalApp } from "./utils/globalApp.js";
import { getVersionInfo } from "./version.js";
import { createLogger } from "./utils/logger.js";

/* ---------------------- Router ---------------------- */
import authRouter from "./routes/auth/authRouter.js";
import dashboardRouter from "./routes/dashboard/dashboard.js";
import aiRouter from "./routes/ai/aiRouter.js";
import healthRouter from "./routes/systemInfoRouter/health.js";
import functionsCatalogRouter from "./routes/functionsCatalog/functionsCatalog.js";
import aiAnnotatorRouter from "./routes/aiAnnotatorRouter/aiAnnotatorRouter.js";
import systemInfoRouter from "./routes/systemInfoRouter/systemInfoRouter.js";
import innovationRouter from "./routes/innovation/innovationRouter.js";
import calendarRouter from "./routes/calendar/calendarRouter.js";
import quickchatRouter from "./routes/quickchat/quickchatRouter.js";
import diagnosticsRouter from "./routes/diagnostics/diagnosticsRouter.js";
import hrRouter from "./routes/hr/hrRouter.js";
import financeRouter from "./routes/finance/financeRouter.js";
import searchAnalyticsRouter from "./routes/searchAnalytics/searchAnalyticsRouter.js";
import metricsRouter from "./routes/metrics/metricsRouter.js";

import { toolRegistry } from "./tools/registry.js";
import { listRoutesTool } from "./tools/listRoutesTool.js";
toolRegistry.register(listRoutesTool);

/* ---------------------- Services ---------------------- */
import { FunctionsCatalogService } from "./services/functionsCatalogService.js";
import { AuthService } from "./services/authService.js";
import db from "./services/dbService.js";
import { websocketService } from "./services/websocketService.js";
import { tracingService } from "./services/tracingService.js";
import { errorTrackingService } from "./services/errorTrackingService.js";

/* ---------------------- Middleware ---------------------- */
import { metricsMiddleware } from "./middleware/metricsMiddleware.js";
import { errorTrackingMiddleware } from "./middleware/errorTrackingMiddleware.js";

/* ---------------------- Error-Handler ---------------------- */
import { errorHandler } from "./middleware/errorHandler.js";

/* ---------------------- Pfade & Konstanten ---------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, "../../..");
const DEFAULT_FUNCTIONS_DIR =
  process.env.FUNCTIONS_DIR || path.join(REPO_ROOT, "docs", "functions");
const VIEWS_DIR = path.join(__dirname, "views");

const PORT = Number(process.env.PORT) || 3000;
const ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

/* ---------------------- App-Initialisierung ---------------------- */
const app: Application = express();
const logger = createLogger("server");

/* --------------------------------------------------------
   WICHTIG: globale Registrierung der App
   (muss erfolgen, bevor Router verwendet werden)
--------------------------------------------------------- */
(globalThis as any).expressApp = app;
GlobalApp.set(app);

/* ---------------------- Initiale Log-Ausgabe ---------------------- */
const versionInfo = getVersionInfo();
logger.info("========================================================");
logger.info("🧱 ERP-SteinmetZ Backend");
logger.info("========================================================");
logger.info(`📌 Version:           ${versionInfo.version}`);
logger.info(`🕒 Build:             ${versionInfo.buildDate}`);
logger.info(`🔧 Environment:       ${versionInfo.environment}`);
logger.info(`📦 Node:              ${versionInfo.nodeVersion}`);
logger.info(
  `💻 Platform:          ${versionInfo.platform} (${versionInfo.arch})`,
);
logger.info("--------------------------------------------------------");
logger.info(`📁 Views:             ${VIEWS_DIR}`);
logger.info(`📂 Repo Root:         ${REPO_ROOT}`);
logger.info(`🌐 CORS Origin:       ${ORIGIN}`);
logger.info(`🔌 Port:              ${PORT}`);
logger.info("========================================================");

/* ---------------------- Middleware ---------------------- */
app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware with Redis support
import { createSessionMiddleware } from "./middleware/sessionMiddleware.js";
app.use(createSessionMiddleware());
logger.info("Session middleware configured with Redis support");

// Metrics middleware - must be early to capture all requests
app.use(metricsMiddleware);
logger.info("Metrics middleware enabled");

/* ---------------------- Optionale Admin-Auth ---------------------- */
app.use((req, res, next) => {
  if (process.env.ADMIN_TOKEN && req.path.startsWith("/api/system")) {
    const token = req.headers["x-admin-token"];
    if (token !== process.env.ADMIN_TOKEN) {
      logger.warn({ path: req.path }, "Access denied: Admin token required");
      return res.status(403).json({ error: "Forbidden: Admin token required" });
    }
  }
  next();
});

/* ---------------------- Dashboard-Frontend ---------------------- */
app.use(express.static(VIEWS_DIR));
logger.info({ viewsDir: VIEWS_DIR }, "Static file serving enabled");

app.get("/", async (_req: Request, res: Response) => {
  const dashboardPath = path.join(VIEWS_DIR, "systemDashboard.html");
  try {
    await fs.access(dashboardPath);
    logger.debug("Serving systemDashboard.html");
    res.sendFile(dashboardPath);
  } catch (err) {
    logger.error({ err, path: dashboardPath }, "Dashboard HTML not found");
    res.status(404).send("Dashboard HTML nicht gefunden");
  }
});

/* ---------------------- API-Routen ---------------------- */
logger.info("Initializing API routes...");
app.use("/api/auth", authRouter);
app.use("/api/health", healthRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/ai", aiRouter);
app.use("/api/functions", functionsCatalogRouter);
app.use("/api/ai-annotator", aiAnnotatorRouter);
app.use("/api/system", systemInfoRouter);
app.use("/api/innovation", innovationRouter);
app.use("/api/calendar", calendarRouter);
app.use("/api/quickchat", quickchatRouter);
app.use("/diagnostics", diagnosticsRouter);
app.use("/api/hr", hrRouter);
app.use("/api/finance", financeRouter);
app.use("/api/search", searchAnalyticsRouter);
app.use("/api/metrics", metricsRouter);

// WebSocket statistics endpoint
app.get("/api/ws/stats", (_req: Request, res: Response) => {
  res.json({
    success: true,
    ...websocketService.getStats(),
  });
});

// Session statistics endpoint
import { getSessionStats } from "./middleware/sessionMiddleware.js";
app.get("/api/session/stats", async (_req: Request, res: Response) => {
  const stats = await getSessionStats();
  res.json({
    success: true,
    ...stats,
  });
});

logger.info("API routes activated");

/* --------------------------------------------------------
   Router-Debug
--------------------------------------------------------- */

app.get("/_router_init", (_req, res) => res.json({ ok: true }));

logger.debug("Checking router structure after global registration...");
const stack = (app as any)?._router?.stack;
if (Array.isArray(stack)) {
  logger.debug({ stackLength: stack.length }, "Router stack registered");
  const routeNames = stack
    .map(
      (layer: any) => layer?.route?.path || layer?.name || layer?.handle?.name,
    )
    .filter(Boolean);
  logger.debug({ routes: routeNames.slice(0, 20) }, "Known router entries");
} else {
  logger.warn("No _router stack found in Express app");
}

/* ---------------------- Debug-/Hilfsroute ---------------------- */
app.get("/api/debug/routes", (_req, res) => {
  try {
    const stack = (app as any)?._router?.stack || [];
    res.json({
      success: true,
      message: "Router-Stack sichtbar",
      layers: stack.length,
    });
  } catch (err) {
    res.json({ success: false, error: String(err) });
  }
});

/* ---------------------- 404-Fallback ---------------------- */
app.use((_req: Request, res: Response) => {
  logger.warn({ url: _req.originalUrl }, "Route not found");
  res.status(404).json({ error: "Not found" });
});

/* ---------------------- Error Tracking & Error Handler ---------------------- */
// Error tracking must come before error handler
app.use(errorTrackingMiddleware);
app.use(errorHandler);

/* ---------------------- Bootstrap Functions-Katalog ---------------------- */
async function bootstrapFunctionsCatalog() {
  logger.info("Initializing Functions Catalog...");
  const service = new FunctionsCatalogService();

  try {
    // Initialize monitoring services
    await tracingService.initialize();
    if (tracingService.isEnabled()) {
      logger.info("OpenTelemetry tracing initialized");
    }

    errorTrackingService.initialize(app);
    if (errorTrackingService.isEnabled()) {
      logger.info("Sentry error tracking initialized");
    }

    await db.init();
    logger.info("Database initialized");

    // Initialize authentication system
    await AuthService.init();
    logger.info("Authentication system initialized");

    if (process.env.FUNCTIONS_AUTOLOAD !== "0") {
      const result = await service.refreshFunctionsIndex();
      logger.info(
        { loadedAt: result.loadedAt, rootNodes: result.nodes.length },
        "Functions catalog initially loaded",
      );

      if (process.env.FUNCTIONS_AUTOPERSIST === "1") {
        const summary = await db.upsertFunctionsCatalog(result);
        logger.info(
          { nodes: summary.nodes, edges: summary.edges },
          "Functions catalog persisted to database",
        );
      }
    } else {
      logger.info("FUNCTIONS_AUTOLOAD=0 - Skipping initial load");
    }

    if (process.env.FUNCTIONS_WATCH === "1") {
      startFunctionsWatcher(service, DEFAULT_FUNCTIONS_DIR);
    }
  } catch (err) {
    logger.error({ err }, "Failed to initialize Functions Catalog");
  }
}

/* ---------------------- Watcher ---------------------- */
function startFunctionsWatcher(service: FunctionsCatalogService, dir: string) {
  logger.info({ directory: dir }, "Functions watcher activated");
  let timer: NodeJS.Timeout | null = null;

  const reload = async () => {
    try {
      const result = await service.refreshFunctionsIndex();
      logger.info({ loadedAt: result.loadedAt }, "Functions catalog reloaded");
      if (process.env.FUNCTIONS_AUTOPERSIST === "1") {
        const summary = await db.upsertFunctionsCatalog(result);
        logger.info(
          { nodes: summary.nodes, edges: summary.edges },
          "Functions catalog persisted to database",
        );
      }
    } catch (e) {
      logger.error({ err: e }, "Functions catalog reload failed");
    }
  };

  chokidar
    .watch(dir, {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
      ignored: /(^|[/\\])\../,
    })
    .on("all", (_event, _file) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(reload, 300);
    });
}

/* ---------------------- Server-Start ---------------------- */
export async function start() {
  logger.info("Starting backend server...");
  try {
    await bootstrapFunctionsCatalog();

    const server = app.listen(PORT, () => {
      logger.info("--------------------------------------------------------");
      logger.info(
        { port: PORT },
        `Backend listening on: http://localhost:${PORT}`,
      );
      logger.info(`Dashboard available:  http://localhost:${PORT}/`);
      logger.info(`System API:           http://localhost:${PORT}/api/system`);
      logger.info(`Health API:           http://localhost:${PORT}/api/health`);
      logger.info(
        `Functions API:        http://localhost:${PORT}/api/functions`,
      );
      logger.info(
        `AI Annotator API:     http://localhost:${PORT}/api/ai-annotator`,
      );
      logger.info(`Metrics API:          http://localhost:${PORT}/api/metrics`);
      logger.info("--------------------------------------------------------");

      // Initialize WebSocket server
      websocketService.initialize(server);
      logger.info(
        { port: PORT },
        `WebSocket initialized: ws://localhost:${PORT}`,
      );
    });

    return server;
  } catch (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
}

/* ---------------------- ESM Guard ---------------------- */
const isMain = (() => {
  try {
    const current = path.resolve(fileURLToPath(import.meta.url));
    const entry = process.argv[1] ? path.resolve(process.argv[1]) : "";
    return current === entry;
  } catch {
    return false;
  }
})();

if (isMain) {
  void start();
}

export default app;
