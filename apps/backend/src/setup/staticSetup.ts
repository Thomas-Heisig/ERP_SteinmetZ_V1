// SPDX-License-Identifier: MIT
// apps/backend/src/setup/staticSetup.ts

/**
 * Static File & Dashboard Setup Module
 *
 * Configuration of:
 * - Static file serving
 * - System dashboard HTML
 * - Root route (/)
 *
 * @module setup/staticSetup
 */

import { Application, Request, Response } from "express";
import express from "express";
import fs from "fs/promises";
import path from "path";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("static-setup");

/**
 * Setup static file serving and dashboard
 *
 * @param app - Express application instance
 * @param viewsDir - Directory containing static files and HTML
 */
export function setupStaticFiles(app: Application, viewsDir: string): void {
  logger.info({ viewsDir }, "Configuring static file serving");

  // Serve static files from views directory
  app.use(express.static(viewsDir));

  // Root route - serve dashboard
  app.get("/", async (_req: Request, res: Response) => {
    const dashboardPath = path.join(viewsDir, "systemDashboard.html");
    try {
      await fs.access(dashboardPath);
      logger.debug("Serving systemDashboard.html");
      res.sendFile(dashboardPath);
    } catch (err) {
      logger.error({ err, path: dashboardPath }, "Dashboard HTML not found");
      res.status(404).send("Dashboard HTML not found");
    }
  });

  logger.info("Static file serving configured");
}

export default {
  setupStaticFiles,
};
