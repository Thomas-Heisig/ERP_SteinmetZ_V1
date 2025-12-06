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
import { getVersionInfo, getVersionString } from "./version.js";

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

import { toolRegistry } from "./tools/registry.js";
import { listRoutesTool } from "./tools/listRoutesTool.js";
toolRegistry.register(listRoutesTool);

/* ---------------------- Services ---------------------- */
import { FunctionsCatalogService } from "./services/functionsCatalogService.js";
import { AuthService } from "./services/authService.js";
import db from "./services/dbService.js";
import { websocketService } from "./services/websocketService.js";

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

/* --------------------------------------------------------
   WICHTIG: globale Registrierung der App
   (muss erfolgen, bevor Router verwendet werden)
--------------------------------------------------------- */
(globalThis as any).expressApp = app;
GlobalApp.set(app);

/* ---------------------- Initiale Log-Ausgabe ---------------------- */
const versionInfo = getVersionInfo();
console.log("========================================================");
console.log("🧱 ERP-SteinmetZ Backend");
console.log("========================================================");
console.log(`📌 Version:           ${versionInfo.version}`);
console.log(`🕒 Build:             ${versionInfo.buildDate}`);
console.log(`🔧 Environment:       ${versionInfo.environment}`);
console.log(`📦 Node:              ${versionInfo.nodeVersion}`);
console.log(
  `💻 Platform:          ${versionInfo.platform} (${versionInfo.arch})`,
);
console.log("--------------------------------------------------------");
console.log(`📁 Views:             ${VIEWS_DIR}`);
console.log(`📂 Repo Root:         ${REPO_ROOT}`);
console.log(`🌐 CORS Origin:       ${ORIGIN}`);
console.log(`🔌 Port:              ${PORT}`);
console.log("========================================================");

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

/* ---------------------- Optionale Admin-Auth ---------------------- */
app.use((req, res, next) => {
  if (process.env.ADMIN_TOKEN && req.path.startsWith("/api/system")) {
    const token = req.headers["x-admin-token"];
    if (token !== process.env.ADMIN_TOKEN) {
      console.warn(`[auth] Zugriff verweigert auf ${req.path}`);
      return res.status(403).json({ error: "Forbidden: Admin token required" });
    }
  }
  next();
});

/* ---------------------- Dashboard-Frontend ---------------------- */
app.use(express.static(VIEWS_DIR));
console.log(`[views] Static-Serving aktiviert für: ${VIEWS_DIR}`);

app.get("/", async (_req: Request, res: Response) => {
  const dashboardPath = path.join(VIEWS_DIR, "systemDashboard.html");
  try {
    await fs.access(dashboardPath);
    console.log("[views] Liefere systemDashboard.html aus");
    res.sendFile(dashboardPath);
  } catch (err) {
    console.error("[views] Dashboard HTML fehlt:", err);
    res.status(404).send("Dashboard HTML nicht gefunden");
  }
});

/* ---------------------- API-Routen ---------------------- */
console.log("[router] Initialisiere API-Routen...");
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

// WebSocket statistics endpoint
app.get("/api/ws/stats", (_req: Request, res: Response) => {
  res.json({
    success: true,
    ...websocketService.getStats(),
  });
});

console.log("[router] API-Routen aktiv");

/* --------------------------------------------------------
   Router-Debug
--------------------------------------------------------- */

app.get("/_router_init", (_req, res) => res.json({ ok: true }));

console.log("[debug] Prüfe Router-Struktur nach globaler Registrierung...");
const stack = (app as any)?._router?.stack;
if (Array.isArray(stack)) {
  console.log("[debug] Router-Stack-Länge:", stack.length);
  const routeNames = stack
    .map(
      (layer: any) => layer?.route?.path || layer?.name || layer?.handle?.name,
    )
    .filter(Boolean);
  console.log("[debug] Bekannte Router-Einträge:", routeNames.slice(0, 20));
} else {
  console.warn("[debug] Kein _router-Stack in Express-App gefunden");
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
  console.warn("[404] Route nicht gefunden:", _req.originalUrl);
  res.status(404).json({ error: "Not found" });
});

/* ---------------------- Globaler Error-Handler ---------------------- */
app.use(errorHandler);

/* ---------------------- Bootstrap Functions-Katalog ---------------------- */
async function bootstrapFunctionsCatalog() {
  console.log("[bootstrap] Initialisiere Functions-Katalog...");
  const service = new FunctionsCatalogService();

  try {
    await db.init();
    console.log("[bootstrap] Datenbank initialisiert");

    // Initialize authentication system
    await AuthService.init();
    console.log("[bootstrap] Authentication system initialisiert");

    if (process.env.FUNCTIONS_AUTOLOAD !== "0") {
      const result = await service.refreshFunctionsIndex();
      console.log(
        `[functions] initial geladen @ ${result.loadedAt} (${result.nodes.length} Wurzeln)`,
      );

      if (process.env.FUNCTIONS_AUTOPERSIST === "1") {
        const summary = await db.upsertFunctionsCatalog(result);
        console.log(
          `[functions] initial in DB gespeichert: nodes=${summary.nodes}, edges=${summary.edges}`,
        );
      }
    } else {
      console.log("[functions] FUNCTIONS_AUTOLOAD=0 → kein initiales Laden");
    }

    if (process.env.FUNCTIONS_WATCH === "1") {
      startFunctionsWatcher(service, DEFAULT_FUNCTIONS_DIR);
    }
  } catch (err) {
    console.error(
      "[bootstrap] Fehler beim Initialisieren des Function-Katalogs:",
      err,
    );
  }
}

/* ---------------------- Watcher ---------------------- */
function startFunctionsWatcher(service: FunctionsCatalogService, dir: string) {
  console.log(`[functions] Watcher aktiv: ${dir}`);
  let timer: NodeJS.Timeout | null = null;

  const reload = async () => {
    try {
      const result = await service.refreshFunctionsIndex();
      console.log(`[functions] neu geladen @ ${result.loadedAt}`);
      if (process.env.FUNCTIONS_AUTOPERSIST === "1") {
        const summary = await db.upsertFunctionsCatalog(result);
        console.log(
          `[functions] in DB gespeichert: nodes=${summary.nodes}, edges=${summary.edges}`,
        );
      }
    } catch (e) {
      console.error("[functions] Reload fehlgeschlagen:", e);
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
  console.log("[server] Starte Backend...");
  try {
    await bootstrapFunctionsCatalog();

    const server = app.listen(PORT, () => {
      console.log("--------------------------------------------------------");
      console.log(`[backend] Listening on:           http://localhost:${PORT}`);
      console.log(`[backend] Dashboard erreichbar:  http://localhost:${PORT}/`);
      console.log(
        `[backend] System API:             http://localhost:${PORT}/api/system`,
      );
      console.log(
        `[backend] Health API:             http://localhost:${PORT}/api/health`,
      );
      console.log(
        `[backend] Functions API:          http://localhost:${PORT}/api/functions`,
      );
      console.log(
        `[backend] AI Annotator API:       http://localhost:${PORT}/api/ai-annotator`,
      );
      console.log("--------------------------------------------------------");

      // Initialize WebSocket server
      websocketService.initialize(server);
      console.log(`[backend] WebSocket initialized:  ws://localhost:${PORT}`);
    });

    return server;
  } catch (err) {
    console.error("❌ [server] Fehler beim Start:", err);
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
