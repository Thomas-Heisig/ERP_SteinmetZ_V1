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
router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
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
  }),
);

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

/* ---------------------------------------------------------
   Dashboard KPIs - Key Performance Indicators
--------------------------------------------------------- */
router.get(
  "/kpis",
  asyncHandler(async (_req, res) => {
    const db = (await import("../../services/dbService.js")).default;

    // Get recent KPIs from database
    const kpis = await db.all(
      `SELECT * FROM dashboard_kpis 
       WHERE date >= date('now', '-7 days') 
       ORDER BY date DESC, name ASC`
    );

    res.json({
      success: true,
      data: kpis,
      count: kpis.length,
    });
  })
);

/* ---------------------------------------------------------
   Dashboard Tasks
--------------------------------------------------------- */
router.get(
  "/tasks",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;
    const { status, priority } = req.query;

    let sql = "SELECT * FROM dashboard_tasks WHERE 1=1";
    const params: any[] = [];

    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      sql += ` AND status IN (${statuses.map(() => "?").join(",")})`;
      params.push(...statuses);
    }

    if (priority) {
      sql += " AND priority = ?";
      params.push(priority);
    }

    sql += " ORDER BY priority DESC, due_date ASC";

    const tasks = await db.all(sql, params);

    res.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  })
);

/* ---------------------------------------------------------
   Dashboard Notifications
--------------------------------------------------------- */
router.get(
  "/notifications",
  asyncHandler(async (req, res) => {
    const db = (await import("../../services/dbService.js")).default;
    const { read, user_id, limit = "10" } = req.query;

    let sql = "SELECT * FROM dashboard_notifications WHERE 1=1";
    const params: any[] = [];

    if (read !== undefined) {
      sql += " AND read = ?";
      params.push(read === "true" ? 1 : 0);
    }

    if (user_id) {
      sql += " AND user_id = ?";
      params.push(user_id);
    }

    sql += " ORDER BY created_at DESC LIMIT ?";
    params.push(parseInt(limit as string, 10));

    const notifications = await db.all(sql, params);

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  })
);

/* ---------------------------------------------------------
   Dashboard Widgets Data
--------------------------------------------------------- */
router.get(
  "/widgets/stats",
  asyncHandler(async (_req, res) => {
    // Provide comprehensive stats for dashboard widgets
    const stats = {
      sales: {
        today: 15420,
        yesterday: 12340,
        thisWeek: 89760,
        lastWeek: 78450,
        trend: "+14.4%",
      },
      orders: {
        total: 1248,
        pending: 14,
        processing: 23,
        completed: 1211,
        trend: "+8.2%",
      },
      customers: {
        total: 328,
        new: 12,
        active: 287,
        inactive: 41,
        trend: "+3.8%",
      },
      inventory: {
        totalItems: 1240,
        lowStock: 8,
        outOfStock: 2,
        inStock: 1230,
        trend: "-0.6%",
      },
      finance: {
        revenue: 125340,
        expenses: 45280,
        profit: 80060,
        margin: "63.9%",
        trend: "+12.5%",
      },
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  }),
);

/* ---------------------------------------------------------
   Recent Activities for Dashboard
--------------------------------------------------------- */
router.get(
  "/activities",
  asyncHandler(async (_req, res) => {
    const activities = [
      {
        id: 1,
        type: "order",
        title: "Neue Bestellung #1234",
        description: "Kunde Schmidt GmbH hat eine Bestellung aufgegeben",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
        icon: "📦",
        status: "success",
      },
      {
        id: 2,
        type: "invoice",
        title: "Rechnung bezahlt #5678",
        description: "Zahlung von 5.450 € eingegangen",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
        icon: "💰",
        status: "success",
      },
      {
        id: 3,
        type: "customer",
        title: "Neuer Kunde registriert",
        description: "Müller AG wurde als Kunde angelegt",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        icon: "👤",
        status: "info",
      },
      {
        id: 4,
        type: "inventory",
        title: "Niedriger Lagerbestand",
        description: "Artikel A123 hat nur noch 5 Einheiten auf Lager",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
        icon: "⚠️",
        status: "warning",
      },
      {
        id: 5,
        type: "system",
        title: "Backup abgeschlossen",
        description: "Tägliches Backup erfolgreich durchgeführt",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        icon: "💾",
        status: "success",
      },
    ];

    res.json({
      success: true,
      data: activities,
      count: activities.length,
      timestamp: new Date().toISOString(),
    });
  }),
);

/* ---------------------------------------------------------
   Quick Links for Dashboard
--------------------------------------------------------- */
router.get("/quick-links", (_req, res) => {
  const quickLinks = [
    {
      id: 1,
      title: "Neue Rechnung",
      description: "Rechnung erstellen",
      path: "/finance/invoices/new",
      icon: "📄",
      color: "#4CAF50",
    },
    {
      id: 2,
      title: "Neuer Kunde",
      description: "Kunde anlegen",
      path: "/crm/customers/new",
      icon: "👤",
      color: "#2196F3",
    },
    {
      id: 3,
      title: "Bestellung erfassen",
      description: "Neue Bestellung",
      path: "/orders/new",
      icon: "🛒",
      color: "#FF9800",
    },
    {
      id: 4,
      title: "Berichte",
      description: "Berichte anzeigen",
      path: "/reports",
      icon: "📊",
      color: "#9C27B0",
    },
  ];

  res.json({
    success: true,
    data: quickLinks,
    count: quickLinks.length,
  });
});

export default router;
