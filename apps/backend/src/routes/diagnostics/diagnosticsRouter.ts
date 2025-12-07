// SPDX-License-Identifier: MIT
// apps/backend/src/routes/diagnostics/diagnosticsRouter.ts

import { Router, Request, Response } from "express";
import { z } from "zod";
import os from "node:os";
import db from "../../services/dbService.js";
import {
  healthMonitor,
  scheduler,
  healingReport,
} from "../../services/selfhealing/index.js";
import { getVersionInfo } from "../../version.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

/* ========================================================================== */
/* Zod Validation Schemas                                                     */
/* ========================================================================== */

const logsQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).optional().default("100"),
  entity: z.string().min(1).max(100).optional(),
  action: z.string().min(1).max(100).optional(),
});

const router = Router();

/**
 * GET /diagnostics
 * HTML-Diagnoseseite
 */
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const versionInfo = getVersionInfo();
    const healthResult = await healthMonitor.runHealthChecks();
    const dbStats = await db.getStats();
    const schedulerStatus = scheduler.getStatus();
    const reportStats = healingReport.getStatistics();

    const systemInfo = {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: formatBytes(os.totalmem()),
      freeMemory: formatBytes(os.freemem()),
      uptime: formatUptime(os.uptime()),
      nodeVersion: process.version,
      processUptime: formatUptime(process.uptime()),
    };

    const html = generateDiagnosticsHTML(
      versionInfo,
      healthResult,
      dbStats,
      schedulerStatus,
      reportStats,
      systemInfo,
    );

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  }),
);

/**
 * GET /diagnostics/api
 * JSON API für Diagnosedaten
 */
router.get(
  "/api",
  asyncHandler(async (_req: Request, res: Response) => {
    const versionInfo = getVersionInfo();
    const healthResult = await healthMonitor.runHealthChecks();
    const dbStats = await db.getStats();
    const schedulerStatus = scheduler.getStatus();
    const reportStats = healingReport.getStatistics();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      version: versionInfo,
      health: healthResult,
      database: dbStats,
      scheduler: schedulerStatus,
      reports: reportStats,
      system: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        uptime: os.uptime(),
        nodeVersion: process.version,
        processUptime: process.uptime(),
      },
    });
  }),
);

/**
 * POST /diagnostics/health-check
 * Manuellen Health-Check triggern
 */
router.post(
  "/health-check",
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await scheduler.runManualCheck();
    res.json({
      success: true,
      result,
    });
  }),
);

/**
 * GET /diagnostics/logs
 * Audit-Logs abrufen
 */
router.get(
  "/logs",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = logsQuerySchema.parse(req.query);
    const { limit, entity, action } = validated;

    let sql = "SELECT * FROM audit_log WHERE 1=1";
    const params: unknown[] = [];

    if (entity) {
      sql += " AND entity = ?";
      params.push(entity);
    }

    if (action) {
      sql += " AND action = ?";
      params.push(action);
    }

    sql += " ORDER BY created_at DESC LIMIT ?";
    params.push(Number(limit));

    const logs = await db.all(sql, params);

    res.json({
      success: true,
      data: logs,
      total: logs.length,
    });
  }),
);

// HTML Generator
function generateDiagnosticsHTML(
  versionInfo: {
    version: string;
    buildDate: string;
    name: string;
    environment: string;
  },
  health: any,
  dbStats: any,
  schedulerStatus: any,
  reportStats: any,
  systemInfo: any,
): string {
  const statusColors: Record<string, string> = {
    healthy: "#22c55e",
    degraded: "#f59e0b",
    unhealthy: "#ef4444",
    pass: "#22c55e",
    warn: "#f59e0b",
    fail: "#ef4444",
  };

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ERP SteinmetZ - Diagnostics</title>
  <style>
    :root {
      --bg: #0f172a;
      --surface: #1e293b;
      --surface-elevated: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #3b82f6;
      --success: #22c55e;
      --warning: #f59e0b;
      --error: #ef4444;
      --border: #475569;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }
    
    h1 {
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid var(--border);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .card-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text);
    }
    
    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .check-list {
      list-style: none;
    }
    
    .check-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      background: var(--surface-elevated);
    }
    
    .check-name {
      font-weight: 500;
    }
    
    .check-status {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    
    .metric {
      text-align: center;
      padding: 1rem;
      background: var(--surface-elevated);
      border-radius: 8px;
    }
    
    .metric-value {
      font-size: 1.5rem;
      font-weight: 700;
    }
    
    .metric-label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .refresh-btn {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s;
    }
    
    .refresh-btn:hover {
      background: #2563eb;
    }
    
    .timestamp {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    
    .full-width {
      grid-column: 1 / -1;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      text-align: left;
      padding: 0.75rem;
      border-bottom: 1px solid var(--border);
    }
    
    th {
      color: var(--text-muted);
      font-weight: 500;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>
          🧱 ERP SteinmetZ Diagnostics
        </h1>
        <p class="timestamp" style="margin-top: 0.5rem;">
          Version ${versionInfo.version} | Build: ${new Date(versionInfo.buildDate).toLocaleDateString("de-DE")} | ${versionInfo.environment}
        </p>
      </div>
      <div style="display: flex; align-items: center; gap: 1rem;">
        <span class="status-badge" style="background: ${statusColors[health.status]}20; color: ${statusColors[health.status]}">
          <span class="status-dot" style="background: ${statusColors[health.status]}"></span>
          ${health.status.toUpperCase()}
        </span>
        <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
      </div>
    </header>
    
    <div class="grid">
      <!-- System Health -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🏥 System Health</span>
        </div>
        <ul class="check-list">
          ${health.checks
            .map(
              (check: any) => `
            <li class="check-item">
              <span class="check-name">${check.name}</span>
              <span class="check-status" style="background: ${statusColors[check.status]}20; color: ${statusColors[check.status]}">
                ${check.status}
              </span>
            </li>
          `,
            )
            .join("")}
        </ul>
      </div>
      
      <!-- Database Stats -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">💾 Database</span>
        </div>
        <div class="metrics-grid">
          <div class="metric">
            <div class="metric-value">${dbStats.total_nodes ?? 0}</div>
            <div class="metric-label">Nodes</div>
          </div>
          <div class="metric">
            <div class="metric-value">${dbStats.annotated_nodes ?? 0}</div>
            <div class="metric-label">Annotated</div>
          </div>
          <div class="metric">
            <div class="metric-value">${dbStats.pending_nodes ?? 0}</div>
            <div class="metric-label">Pending</div>
          </div>
          <div class="metric">
            <div class="metric-value">${dbStats.total_ai_operations ?? 0}</div>
            <div class="metric-label">AI Ops</div>
          </div>
        </div>
      </div>
      
      <!-- Self-Healing -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔧 Self-Healing</span>
          <span style="color: ${schedulerStatus.isRunning ? "var(--success)" : "var(--error)"}">
            ${schedulerStatus.isRunning ? "● Active" : "○ Inactive"}
          </span>
        </div>
        <div class="metrics-grid">
          <div class="metric">
            <div class="metric-value">${reportStats.totalReports}</div>
            <div class="metric-label">Total Reports</div>
          </div>
          <div class="metric">
            <div class="metric-value">${reportStats.successRate}%</div>
            <div class="metric-label">Success Rate</div>
          </div>
        </div>
      </div>
      
      <!-- System Info -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🖥️ System</span>
        </div>
        <table>
          <tr><td>Hostname</td><td>${systemInfo.hostname}</td></tr>
          <tr><td>Platform</td><td>${systemInfo.platform} (${systemInfo.arch})</td></tr>
          <tr><td>CPUs</td><td>${systemInfo.cpus}</td></tr>
          <tr><td>Memory</td><td>${systemInfo.freeMemory} / ${systemInfo.totalMemory}</td></tr>
          <tr><td>Uptime</td><td>${systemInfo.uptime}</td></tr>
          <tr><td>Node.js</td><td>${systemInfo.nodeVersion}</td></tr>
        </table>
      </div>
    </div>
    
    <p class="timestamp">
      Last updated: ${new Date().toLocaleString("de-DE")}
    </p>
  </div>
  
  <script>
    // Auto-refresh every 30 seconds
    setTimeout(() => location.reload(), 30000);
  </script>
</body>
</html>
  `;
}

// Helper functions
function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(1)} ${units[i]}`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(" ") || "0m";
}

export default router;
