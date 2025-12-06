// SPDX-License-Identifier: MIT
// apps/backend/src/routes/dashboard/dashboard.ts

import os from "os";
import { Router } from "express";

import { existsSync, readFileSync } from "fs";
import path from "path";
import { asyncHandler } from "../../middleware/asyncHandler.js";

const router = Router();

/* ---------------------------------------------------------
   Systemstatus
--------------------------------------------------------- */
router.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    hostname: os.hostname(),
    platform: os.platform(),
    node_version: process.version,
    memory: {
      free: Math.round(os.freemem() / 1024 / 1024) + " MB",
      total: Math.round(os.totalmem() / 1024 / 1024) + " MB",
    },
    loadavg: os.loadavg(),
    timestamp: new Date().toISOString(),
  });
});

/* ---------------------------------------------------------
   Dashboard-Übersicht: System + AI + ERP-Daten
--------------------------------------------------------- */
router.get("/overview", asyncHandler(async (_req, res) => {
  // Beispielhafte "ERP"-Werte (später echte Datenbank-Abfragen)
  const erpStats = {
    openOrders: 14,
    pendingInvoices: 7,
    stockItems: 1240,
    customers: 328,
  };

  // AI-Komponentenstatus
  const aiStatus = {
    fallback_config_source: process.env.FALLBACK_CONFIG_SOURCE ?? "defaults",
    wiki_enabled: (process.env.FALLBACK_WIKI ?? "1") !== "0",
    modules: {
      fallback_ai: true,
      annotator_ai: existsSync(
        path.join(process.cwd(), "src/routes/ai/annotator_ai.ts"),
      ),
      rag_ai: existsSync(path.join(process.cwd(), "src/routes/ai/rag_ai.ts")),
    },
  };

  // Versionsinformationen
  const packageJson = JSON.parse(
    readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
  );
  const versionInfo = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
  };

  res.json({
    system: {
      uptime: process.uptime(),
      cpu: os.cpus().length,
      loadavg: os.loadavg().map((x) => x.toFixed(2)),
      memory: {
        free: Math.round(os.freemem() / 1024 / 1024) + " MB",
        total: Math.round(os.totalmem() / 1024 / 1024) + " MB",
      },
    },
    ai: aiStatus,
    erp: erpStats,
    version: versionInfo,
    timestamp: new Date().toISOString(),
  });
}));

/* ---------------------------------------------------------
   (optional) Letzte Logs / Chat-Kontext
--------------------------------------------------------- */
router.get("/context", (_req, res) => {
  const logFile = path.join(process.cwd(), "data", "chat_context.log");
  if (existsSync(logFile)) {
    const content = readFileSync(logFile, "utf8").split("\n").slice(-10);
    res.json({ context: content });
  } else {
    res.json({ context: [] });
  }
});

export default router;
