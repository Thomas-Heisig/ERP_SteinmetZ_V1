// SPDX-License-Identifier: MIT
// apps/backend/src/index.ts

/**
 * ERP-SteinmetZ Backend Server
 *
 * Main application entry point with:
 * - Express server initialization
 * - Middleware setup
 * - Router registration
 * - Service bootstrap
 * - Graceful shutdown
 *
 * All setup logic is delegated to dedicated modules for maintainability.
 *
 * @module index
 */

import "dotenv/config";
import express, { Application } from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { GlobalApp } from "./utils/globalApp.js";
import { getVersionInfo } from "./version.js";
import { createLogger } from "./utils/logger.js";

// Setup modules
import { setupMiddleware } from "./setup/middlewareSetup.js";
import { setupStaticFiles } from "./setup/staticSetup.js";
import {
  registerRouters,
  registerDiagnosticEndpoints,
  register404Handler,
} from "./setup/routerSetup.js";
import { bootstrapServices } from "./setup/bootstrapServices.js";
import { registerAllShutdownHandlers } from "./setup/shutdownHandlers.js";

/* ---------------------- Constants & Configuration ---------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, "../../..");
const DEFAULT_FUNCTIONS_DIR =
  process.env.FUNCTIONS_DIR || path.join(REPO_ROOT, "docs", "functions");
const VIEWS_DIR = path.join(__dirname, "views");

const PORT = Number(process.env.PORT) || 3000;
const ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

/* ---------------------- Logger ---------------------- */
const logger = createLogger("server");

/* ---------------------- App Initialization ---------------------- */
const app: Application = express();

// Register app globally (required before router initialization)
Object.assign(globalThis, { expressApp: app });
GlobalApp.set(app);

/* ---------------------- Version & Startup Logging ---------------------- */
const versionInfo = getVersionInfo();

function logStartupInfo(): void {
  logger.info("========================================================");
  logger.info("🧱 ERP-SteinmetZ Backend");
  logger.info("========================================================");
  logger.info(`📌 Version:           ${versionInfo.version}`);
  logger.info(`🕒 Build:             ${versionInfo.buildDate}`);
  logger.info(`🔧 Environment:       ${versionInfo.environment}`);
  logger.info(`📦 Node:              ${versionInfo.nodeVersion}`);
  logger.info(
    `💻 Platform:          ${versionInfo.platform} (${versionInfo.arch})`
  );
  logger.info("--------------------------------------------------------");
  logger.info(`📁 Views:             ${VIEWS_DIR}`);
  logger.info(`📂 Repo Root:         ${REPO_ROOT}`);
  logger.info(`🌐 CORS Origin:       ${ORIGIN}`);
  logger.info(`🔌 Port:              ${PORT}`);
  logger.info("========================================================");
}

/* ---------------------- Setup Pipeline ---------------------- */
async function setupApplication(): Promise<void> {
  logger.info("Initializing application setup pipeline...");

  // 1. Setup middleware (CORS, body parsers, session, metrics, auth, error tracking, error handler)
  setupMiddleware(app, {
    corsOrigin: ORIGIN,
    bodyLimit: "10mb",
    enableMetrics: true,
    enableErrorTracking: true,
    enableAdminAuth: true,
    adminToken: process.env.ADMIN_TOKEN,
  });

  // 2. Setup static files and dashboard
  setupStaticFiles(app, VIEWS_DIR);

  // 3. Register all API routers
  registerRouters(app);

  // 4. Register diagnostic endpoints
  registerDiagnosticEndpoints(app);

  // 5. Register 404 fallback (must be last)
  register404Handler(app);

  logger.info("Application setup pipeline complete");
}

/* ---------------------- Server Start Function ---------------------- */
async function start(): Promise<void> {
  logger.info("Starting backend server...");

  try {
    logStartupInfo();

    // Setup Express application
    await setupApplication();

    // Bootstrap all services (database, auth, functions catalog, etc.)
    await bootstrapServices(app, {
      functionsDir: DEFAULT_FUNCTIONS_DIR,
      autoloadFunctions: process.env.FUNCTIONS_AUTOLOAD !== "0",
      persistFunctions: process.env.FUNCTIONS_AUTOPERSIST === "1",
      watchFunctions: process.env.FUNCTIONS_WATCH === "1",
      environment: versionInfo.environment,
    });

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info("--------------------------------------------------------");
      logger.info(
        { port: PORT },
        `Backend listening on: http://localhost:${PORT}`
      );
      logger.info(`Dashboard:            http://localhost:${PORT}/`);
      logger.info(`System API:           http://localhost:${PORT}/api/system`);
      logger.info(`Health API:           http://localhost:${PORT}/api/health`);
      logger.info(
        `Functions API:        http://localhost:${PORT}/api/functions`
      );
      logger.info(
        `AI Annotator API:     http://localhost:${PORT}/api/ai-annotator`
      );
      logger.info(`Metrics API:          http://localhost:${PORT}/api/metrics`);
      logger.info("--------------------------------------------------------");

      // Initialize WebSocket server via dynamic import
      void (async () => {
        const { websocketService: ws } = await import(
          "./routes/other/websocketService.js"
        );
        ws.initialize(server);
        logger.info(
          { port: PORT },
          `WebSocket initialized: ws://localhost:${PORT}`
        );
      })();

      // Register graceful shutdown handlers
      registerAllShutdownHandlers(server);

      logger.info("========================================================");
      logger.info("🚀 Backend Server Ready");
      logger.info("========================================================");
    });
  } catch (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
}

/* ---------------------- ESM Entry Point Guard ---------------------- */
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