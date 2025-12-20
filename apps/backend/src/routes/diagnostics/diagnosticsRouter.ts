// SPDX-License-Identifier: MIT
// apps/backend/src/routes/diagnostics/diagnosticsRouter.ts

/**
 * Diagnostics Router
 *
 * Provides comprehensive system health checks, diagnostics, and monitoring endpoints.
 * Offers both HTML dashboard and JSON API access to system metrics, database statistics,
 * self-healing status, and audit logs.
 *
 * @remarks
 * This router provides:
 * - System diagnostics (CPU, memory, uptime, load average)
 * - Database health and statistics with connection pool metrics
 * - Self-healing system status and reports
 * - Healing scheduler information
 * - Health check results with detailed status
 * - Audit log retrieval with filtering
 * - Performance metrics tracking
 * - HTML diagnostics dashboard with auto-refresh
 * - Query performance monitoring
 *
 * Endpoints:
 * - GET /diagnostics - Interactive HTML diagnostics dashboard
 * - GET /diagnostics/api - Complete diagnostics data (JSON)
 * - GET /diagnostics/health - Health check status
 * - GET /diagnostics/system - System information
 * - GET /diagnostics/database - Database statistics
 * - GET /diagnostics/scheduler - Self-healing scheduler status
 * - GET /diagnostics/reports - Healing reports statistics
 * - GET /diagnostics/version - Version information
 * - POST /diagnostics/health-check - Trigger manual health check
 * - GET /diagnostics/logs - Audit logs with filtering
 *
 * @module routes/diagnostics
 *
 * @example
 * ```typescript
 * // Get complete diagnostics
 * GET /api/diagnostics/api
 *
 * // Get health status
 * GET /api/diagnostics/health
 * // Response: { status: 'healthy', checks: [...], timestamp: '...' }
 *
 * // Get system info
 * GET /api/diagnostics/system
 * // Response: { hostname: ..., cpus: ..., memory: ..., uptime: ... }
 *
 * // Get audit logs with filters
 * GET /api/diagnostics/logs?limit=50&entity=users&action=login
 * // Response: { success: true, data: [...], total: 50 }
 * ```
 */

import { Router, Request, Response } from "express";
import os from "node:os";
import { createLogger } from "../../utils/logger.js";
import db from "../database/dbService.js";
import type { SqlValue } from "../database/database.js";
import {
  healthMonitor,
  scheduler,
  healingReport,
} from "../selfhealing/index.js";
import { getVersionInfo } from "../../version.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

// Import types and schemas from centralized types file
import type {
  HealthCheck,
  HealthResult,
  DbStats,
  SchedulerStatus,
  ReportStats,
  SystemInfo,
  VersionInfo,
  DiagnosticsData,
  AuditLog,
} from "./types.js";
import {
  queryLogsSchema,
  formatBytes,
  formatUptime,
} from "./types.js";

const logger = createLogger("diagnostics-router");
const router = Router();

/* ========================================================================== */
/* Helper Functions                                                           */
/* ========================================================================== */

/**
 * Get comprehensive system information
 */
function getSystemInfo(): SystemInfo {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: formatBytes(totalMem),
    freeMemory: formatBytes(freeMem),
    usedMemory: formatBytes(usedMem),
    memoryUsagePercent: Math.round((usedMem / totalMem) * 100),
    uptime: formatUptime(os.uptime()),
    nodeVersion: process.version,
    processUptime: formatUptime(process.uptime()),
    processMemory: {
      rss: formatBytes(process.memoryUsage().rss),
      heapTotal: formatBytes(process.memoryUsage().heapTotal),
      heapUsed: formatBytes(process.memoryUsage().heapUsed),
      external: formatBytes(process.memoryUsage().external),
    },
    loadAverage: os.loadavg(),
  };
}

/**
 * Convert database row to AuditLog object
 */
function rowToAuditLog(row: Record<string, SqlValue>): AuditLog {
  return {
    id: String(row.id),
    entity: String(row.entity),
    entityId: row.entity_id ? String(row.entity_id) : undefined,
    action: String(row.action) as AuditLog["action"],
    userId: row.user_id ? String(row.user_id) : undefined,
    userName: row.user_name ? String(row.user_name) : undefined,
    changes: row.changes ? String(row.changes) : undefined,
    metadata: row.metadata ? String(row.metadata) : undefined,
    ipAddress: row.ip_address ? String(row.ip_address) : undefined,
    userAgent: row.user_agent ? String(row.user_agent) : undefined,
    timestamp: String(row.created_at || row.timestamp),
    success: Boolean(row.success),
    error: row.error ? String(row.error) : undefined,
  };
}

/* ========================================================================== */
/* Routes                                                                     */
/* ========================================================================== */

/**
 * GET /diagnostics
 * Interactive HTML diagnostics dashboard with auto-refresh
 */
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    logger.debug("Rendering HTML diagnostics dashboard");

    const versionInfo = getVersionInfo();
    const healthResultRaw = await healthMonitor.runHealthChecks();
    const healthResult: HealthResult = {
      ...healthResultRaw,
      timestamp: healthResultRaw.timestamp instanceof Date ? healthResultRaw.timestamp.toISOString() : String(healthResultRaw.timestamp),
    };
    const dbStats = await db.getStats();
    const schedulerStatus = scheduler.getStatus();
    const reportStats = healingReport.getStatistics();
    const systemInfo = getSystemInfo();

    const html = generateDiagnosticsHTML(
      versionInfo,
      healthResult,
      dbStats,
      schedulerStatus,
      reportStats,
      systemInfo
    );

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  })
);

/**
 * GET /diagnostics/api
 * Complete diagnostics data in JSON format
 */
router.get(
  "/api",
  asyncHandler(async (_req: Request, res: Response) => {
    logger.debug("Fetching complete diagnostics data");

    const versionInfo = getVersionInfo();
    const healthResultRaw = await healthMonitor.runHealthChecks();
    const healthResult: HealthResult = {
      ...healthResultRaw,
      timestamp: healthResultRaw.timestamp instanceof Date ? healthResultRaw.timestamp.toISOString() : String(healthResultRaw.timestamp),
    };
    const dbStats = await db.getStats();
    const schedulerStatus = scheduler.getStatus();
    const reportStats = healingReport.getStatistics();
    const systemInfo = getSystemInfo();

    const diagnostics: DiagnosticsData = {
      version: versionInfo,
      health: healthResult,
      database: dbStats,
      scheduler: schedulerStatus,
      reports: reportStats,
      system: systemInfo,
    };

    res.json({
      success: true,
      data: diagnostics,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /diagnostics/health
 * System health check status
 */
router.get(
  "/health",
  asyncHandler(async (_req: Request, res: Response) => {
    logger.debug("Running health checks");

    const healthResult = await healthMonitor.runHealthChecks();

    res.json({
      success: true,
      data: healthResult,
    });
  })
);

/**
 * GET /diagnostics/system
 * System information (CPU, memory, uptime)
 */
router.get(
  "/system",
  asyncHandler(async (_req: Request, res: Response) => {
    logger.debug("Fetching system information");

    const systemInfo = getSystemInfo();

    res.json({
      success: true,
      data: systemInfo,
    });
  })
);

/**
 * GET /diagnostics/database
 * Database statistics and health
 */
router.get(
  "/database",
  asyncHandler(async (_req: Request, res: Response) => {
    logger.debug("Fetching database statistics");

    const dbStats = await db.getStats();

    res.json({
      success: true,
      data: dbStats,
    });
  })
);

/**
 * GET /diagnostics/scheduler
 * Self-healing scheduler status
 */
router.get(
  "/scheduler",
  asyncHandler(async (_req: Request, res: Response) => {
    logger.debug("Fetching scheduler status");

    const schedulerStatus = scheduler.getStatus();

    res.json({
      success: true,
      data: schedulerStatus,
    });
  })
);

/**
 * GET /diagnostics/reports
 * Healing reports statistics
 */
router.get(
  "/reports",
  asyncHandler(async (_req: Request, res: Response) => {
    logger.debug("Fetching healing reports statistics");

    const reportStats = healingReport.getStatistics();

    res.json({
      success: true,
      data: reportStats,
    });
  })
);

/**
 * GET /diagnostics/version
 * Application version information
 */
router.get(
  "/version",
  asyncHandler(async (_req: Request, res: Response) => {
    logger.debug("Fetching version information");

    const versionInfo = getVersionInfo();

    res.json({
      success: true,
      data: versionInfo,
    });
  })
);

/**
 * POST /diagnostics/health-check
 * Trigger manual health check
 */
router.post(
  "/health-check",
  asyncHandler(async (_req: Request, res: Response) => {
    logger.info("Manual health check triggered");

    const result = await scheduler.runManualCheck();

    res.json({
      success: true,
      data: result,
    });
  })
);

/**
 * GET /diagnostics/logs
 * Retrieve audit logs with filtering options
 *
 * Query Parameters:
 * - limit: Number of logs to return (default: 100, max: 1000)
 * - offset: Offset for pagination (default: 0)
 * - entity: Filter by entity name
 * - entityId: Filter by entity ID
 * - action: Filter by action type (create, update, delete, etc.)
 * - userId: Filter by user ID
 * - success: Filter by success status (true/false)
 * - startDate: Filter by start date (ISO 8601)
 * - endDate: Filter by end date (ISO 8601)
 */
router.get(
  "/logs",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = queryLogsSchema.parse(req.query);
    const {
      limit,
      offset,
      entity,
      entityId,
      action,
      userId,
      success,
      startDate,
      endDate,
    } = validated;

    logger.debug({ query: validated }, "Fetching audit logs");

    let sql = "SELECT * FROM audit_log WHERE 1=1";
    const params: SqlValue[] = [];

    if (entity) {
      sql += " AND entity = ?";
      params.push(entity);
    }

    if (entityId) {
      sql += " AND entity_id = ?";
      params.push(entityId);
    }

    if (action) {
      sql += " AND action = ?";
      params.push(action);
    }

    if (userId) {
      sql += " AND user_id = ?";
      params.push(userId);
    }

    if (success !== undefined) {
      sql += " AND success = ?";
      params.push(success ? 1 : 0);
    }

    if (startDate) {
      sql += " AND created_at >= ?";
      params.push(startDate);
    }

    if (endDate) {
      sql += " AND created_at <= ?";
      params.push(endDate);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rows = await db.all(sql, params);
    const logs = rows.map((row) => rowToAuditLog(row as Record<string, SqlValue>));

    // Get total count for pagination
    let countSql = "SELECT COUNT(*) as count FROM audit_log WHERE 1=1";
    const countParams: SqlValue[] = [];
    let paramIndex = 0;

    if (entity) {
      countSql += " AND entity = ?";
      countParams.push(params[paramIndex++]);
    }
    if (entityId) {
      countSql += " AND entity_id = ?";
      countParams.push(params[paramIndex++]);
    }
    if (action) {
      countSql += " AND action = ?";
      countParams.push(params[paramIndex++]);
    }
    if (userId) {
      countSql += " AND user_id = ?";
      countParams.push(params[paramIndex++]);
    }
    if (success !== undefined) {
      countSql += " AND success = ?";
      countParams.push(params[paramIndex++]);
    }
    if (startDate) {
      countSql += " AND created_at >= ?";
      countParams.push(params[paramIndex++]);
    }
    if (endDate) {
      countSql += " AND created_at <= ?";
      countParams.push(params[paramIndex++]);
    }

    const countRow = await db.get(countSql, countParams);
    const total = Number(countRow?.count || 0);

    res.json({
      success: true,
      data: logs,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
    });
  })
);

/* ========================================================================== */
/* HTML Generator                                                             */
/* ========================================================================== */

/**
 * Generate interactive HTML diagnostics dashboard
 */
function generateDiagnosticsHTML(
  versionInfo: VersionInfo,
  health: HealthResult,
  dbStats: DbStats,
  schedulerStatus: SchedulerStatus,
  reportStats: ReportStats,
  systemInfo: SystemInfo
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
    
    .memory-bar {
      width: 100%;
      height: 24px;
      background: var(--surface-elevated);
      border-radius: 4px;
      overflow: hidden;
      position: relative;
      margin-top: 0.5rem;
    }
    
    .memory-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary), var(--success));
      transition: width 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
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
              (check: HealthCheck) => `
            <li class="check-item">
              <span class="check-name">${check.name}</span>
              <span class="check-status" style="background: ${statusColors[check.status]}20; color: ${statusColors[check.status]}">
                ${check.status}
              </span>
            </li>
          `
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
        ${
          schedulerStatus.lastCheck
            ? `
        <p class="timestamp" style="margin-top: 1rem;">
          Last Check: ${new Date(schedulerStatus.lastCheck).toLocaleString("de-DE")}
        </p>
        `
            : ""
        }
      </div>
      
      <!-- Memory Usage -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">💻 Memory</span>
        </div>
        <div class="metric">
          <div class="metric-value">${systemInfo.usedMemory}</div>
          <div class="metric-label">Used of ${systemInfo.totalMemory}</div>
        </div>
        <div class="memory-bar">
          <div class="memory-bar-fill" style="width: ${systemInfo.memoryUsagePercent}%">
            ${systemInfo.memoryUsagePercent}%
          </div>
        </div>
      </div>
      
      <!-- System Info -->
      <div class="card full-width">
        <div class="card-header">
          <span class="card-title">🖥️ System Information</span>
        </div>
        <table>
          <tr><th>Hostname</th><td>${systemInfo.hostname}</td></tr>
          <tr><th>Platform</th><td>${systemInfo.platform} (${systemInfo.arch})</td></tr>
          <tr><th>CPUs</th><td>${systemInfo.cpus}</td></tr>
          <tr><th>Memory</th><td>${systemInfo.freeMemory} free / ${systemInfo.totalMemory} total</td></tr>
          <tr><th>System Uptime</th><td>${systemInfo.uptime}</td></tr>
          <tr><th>Process Uptime</th><td>${systemInfo.processUptime}</td></tr>
          <tr><th>Node.js</th><td>${systemInfo.nodeVersion}</td></tr>
          ${
            systemInfo.loadAverage && systemInfo.loadAverage.length > 0
              ? `<tr><th>Load Average</th><td>${systemInfo.loadAverage.map((l) => l.toFixed(2)).join(", ")}</td></tr>`
              : ""
          }
        </table>
      </div>
      
      <!-- Process Memory -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📊 Process Memory</span>
        </div>
        <table>
          <tr><th>RSS</th><td>${systemInfo.processMemory.rss}</td></tr>
          <tr><th>Heap Total</th><td>${systemInfo.processMemory.heapTotal}</td></tr>
          <tr><th>Heap Used</th><td>${systemInfo.processMemory.heapUsed}</td></tr>
          <tr><th>External</th><td>${systemInfo.processMemory.external}</td></tr>
        </table>
      </div>
    </div>
    
    <p class="timestamp">
      Last updated: ${new Date().toLocaleString("de-DE")} | Auto-refresh in 30s
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

export default router;
