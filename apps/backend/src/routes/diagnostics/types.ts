// SPDX-License-Identifier: MIT
// apps/backend/src/routes/diagnostics/types.ts

/**
 * TypeScript types and Zod validation schemas for Diagnostics Module
 * 
 * @module routes/diagnostics/types
 */

import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Health check status values
 */
export const HEALTH_STATUS = {
  PASS: "pass",
  WARN: "warn",
  FAIL: "fail",
} as const;

/**
 * Overall system health levels
 */
export const SYSTEM_HEALTH = {
  HEALTHY: "healthy",
  DEGRADED: "degraded",
  UNHEALTHY: "unhealthy",
} as const;

/**
 * Audit log action types
 */
export const AUDIT_ACTION = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  READ: "read",
  LOGIN: "login",
  LOGOUT: "logout",
  EXPORT: "export",
  IMPORT: "import",
} as const;

/**
 * Database operation types
 */
export const DB_OPERATION = {
  SELECT: "SELECT",
  INSERT: "INSERT",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  CREATE: "CREATE",
  DROP: "DROP",
  ALTER: "ALTER",
} as const;

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Individual health check result
 */
export interface HealthCheck {
  name: string;
  status: typeof HEALTH_STATUS[keyof typeof HEALTH_STATUS];
  message?: string;
  timestamp?: string;
  duration?: number;
  details?: Record<string, unknown>;
}

/**
 * Overall health check result
 */
export interface HealthResult {
  status: typeof SYSTEM_HEALTH[keyof typeof SYSTEM_HEALTH];
  checks: HealthCheck[];
  timestamp: string;
  version?: string;
  uptime?: number;
}

/**
 * Database statistics
 */
export interface DbStats {
  total_nodes?: number;
  annotated_nodes?: number;
  pending_nodes?: number;
  total_ai_operations?: number;
  connection_pool?: {
    active: number;
    idle: number;
    total: number;
  };
  query_performance?: {
    total_queries: number;
    slow_queries: number;
    average_time: number;
    slowest_query?: string;
  };
  table_stats?: Array<{
    name: string;
    rows: number;
    size: number;
  }>;
}

/**
 * Scheduler status information
 */
export interface SchedulerStatus {
  isRunning: boolean;
  lastCheck?: string;
  nextCheck?: string;
  interval?: number;
  jobQueue?: {
    pending: number;
    active: number;
    completed: number;
    failed: number;
  };
  lastJobs?: Array<{
    id: string;
    type: string;
    status: string;
    startedAt: string;
    completedAt?: string;
    duration?: number;
    error?: string;
  }>;
}

/**
 * Healing report statistics
 */
export interface ReportStats {
  totalReports: number;
  successRate: number;
  failureRate?: number;
  averageResolutionTime?: number;
  recentReports?: Array<{
    id: string;
    type: string;
    severity: string;
    status: string;
    createdAt: string;
    resolvedAt?: string;
  }>;
}

/**
 * System information
 */
export interface SystemInfo {
  hostname: string;
  platform: string;
  arch: string;
  cpus: number;
  totalMemory: string;
  freeMemory: string;
  usedMemory: string;
  memoryUsagePercent: number;
  uptime: string;
  nodeVersion: string;
  processUptime: string;
  processMemory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
  };
  loadAverage?: number[];
}

/**
 * Version information
 */
export interface VersionInfo {
  version: string;
  buildDate: string;
  name: string;
  environment: string;
  nodeVersion?: string;
  dependencies?: Record<string, string>;
}

/**
 * Audit log entry
 */
export interface AuditLog {
  id: string;
  entity: string;
  entityId?: string;
  action: typeof AUDIT_ACTION[keyof typeof AUDIT_ACTION];
  userId?: string;
  userName?: string;
  changes?: string;
  metadata?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

/**
 * Query performance metric
 */
export interface QueryMetric {
  query: string;
  duration: number;
  timestamp: string;
  params?: unknown[];
  operation: typeof DB_OPERATION[keyof typeof DB_OPERATION];
  rowsAffected?: number;
  cached?: boolean;
}

/**
 * API endpoint performance
 */
export interface EndpointMetric {
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: string;
  userId?: string;
  errorMessage?: string;
}

/**
 * Error log entry
 */
export interface ErrorLog {
  id: string;
  level: "error" | "warn" | "info" | "debug";
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: string;
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

/**
 * Comprehensive diagnostics data
 */
export interface DiagnosticsData {
  version: VersionInfo;
  health: HealthResult;
  system: SystemInfo;
  database: DbStats;
  scheduler: SchedulerStatus;
  reports: ReportStats;
  recentErrors?: ErrorLog[];
  performance?: {
    queries: QueryMetric[];
    endpoints: EndpointMetric[];
  };
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for querying audit logs
 */
export const queryLogsSchema = z.object({
  limit: z.coerce.number().int().positive().max(1000).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
  entity: z.string().min(1).max(100).optional(),
  entityId: z.string().max(100).optional(),
  action: z.enum([
    AUDIT_ACTION.CREATE,
    AUDIT_ACTION.UPDATE,
    AUDIT_ACTION.DELETE,
    AUDIT_ACTION.READ,
    AUDIT_ACTION.LOGIN,
    AUDIT_ACTION.LOGOUT,
    AUDIT_ACTION.EXPORT,
    AUDIT_ACTION.IMPORT,
  ]).optional(),
  userId: z.string().uuid().optional(),
  success: z.string().transform(val => val === "true").pipe(z.boolean()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Schema for creating an audit log entry
 */
export const createAuditLogSchema = z.object({
  entity: z.string().min(1).max(100),
  entityId: z.string().max(100).optional(),
  action: z.enum([
    AUDIT_ACTION.CREATE,
    AUDIT_ACTION.UPDATE,
    AUDIT_ACTION.DELETE,
    AUDIT_ACTION.READ,
    AUDIT_ACTION.LOGIN,
    AUDIT_ACTION.LOGOUT,
    AUDIT_ACTION.EXPORT,
    AUDIT_ACTION.IMPORT,
  ]),
  userId: z.string().uuid().optional(),
  userName: z.string().max(200).optional(),
  changes: z.string().optional(),
  metadata: z.string().optional(),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().max(500).optional(),
  success: z.boolean().default(true),
  error: z.string().optional(),
});

/**
 * Schema for health check configuration
 */
export const healthCheckConfigSchema = z.object({
  timeout: z.number().int().positive().max(30000).optional().default(5000),
  includeDetails: z.boolean().optional().default(false),
  checks: z.array(z.string()).optional(),
});

/**
 * Schema for query performance logging
 */
export const queryMetricSchema = z.object({
  query: z.string().min(1).max(5000),
  duration: z.number().positive(),
  params: z.array(z.unknown()).optional(),
  operation: z.enum([
    DB_OPERATION.SELECT,
    DB_OPERATION.INSERT,
    DB_OPERATION.UPDATE,
    DB_OPERATION.DELETE,
    DB_OPERATION.CREATE,
    DB_OPERATION.DROP,
    DB_OPERATION.ALTER,
  ]),
  rowsAffected: z.number().int().min(0).optional(),
  cached: z.boolean().optional().default(false),
});

/**
 * Schema for endpoint performance logging
 */
export const endpointMetricSchema = z.object({
  path: z.string().min(1).max(500),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]),
  statusCode: z.number().int().min(100).max(599),
  duration: z.number().positive(),
  userId: z.string().uuid().optional(),
  errorMessage: z.string().max(1000).optional(),
});

/**
 * Schema for error logging
 */
export const errorLogSchema = z.object({
  level: z.enum(["error", "warn", "info", "debug"]),
  message: z.string().min(1).max(2000),
  stack: z.string().max(10000).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Schema for system metrics query
 */
export const systemMetricsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  interval: z.enum(["minute", "hour", "day"]).optional().default("hour"),
  metrics: z.array(z.enum(["cpu", "memory", "disk", "network", "queries"])).optional(),
});

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for health status validation
 */
export function isValidHealthStatus(
  status: unknown
): status is typeof HEALTH_STATUS[keyof typeof HEALTH_STATUS] {
  return (
    typeof status === "string" &&
    Object.values(HEALTH_STATUS).includes(
      status as typeof HEALTH_STATUS[keyof typeof HEALTH_STATUS]
    )
  );
}

/**
 * Type guard for system health validation
 */
export function isValidSystemHealth(
  health: unknown
): health is typeof SYSTEM_HEALTH[keyof typeof SYSTEM_HEALTH] {
  return (
    typeof health === "string" &&
    Object.values(SYSTEM_HEALTH).includes(
      health as typeof SYSTEM_HEALTH[keyof typeof SYSTEM_HEALTH]
    )
  );
}

/**
 * Type guard for audit action validation
 */
export function isValidAuditAction(
  action: unknown
): action is typeof AUDIT_ACTION[keyof typeof AUDIT_ACTION] {
  return (
    typeof action === "string" &&
    Object.values(AUDIT_ACTION).includes(
      action as typeof AUDIT_ACTION[keyof typeof AUDIT_ACTION]
    )
  );
}

/**
 * Type guard for database operation validation
 */
export function isValidDbOperation(
  operation: unknown
): operation is typeof DB_OPERATION[keyof typeof DB_OPERATION] {
  return (
    typeof operation === "string" &&
    Object.values(DB_OPERATION).includes(
      operation as typeof DB_OPERATION[keyof typeof DB_OPERATION]
    )
  );
}

/**
 * Helper to determine overall health status from checks
 */
export function calculateOverallHealth(
  checks: HealthCheck[]
): typeof SYSTEM_HEALTH[keyof typeof SYSTEM_HEALTH] {
  const hasFailed = checks.some((c) => c.status === HEALTH_STATUS.FAIL);
  const hasWarning = checks.some((c) => c.status === HEALTH_STATUS.WARN);

  if (hasFailed) return SYSTEM_HEALTH.UNHEALTHY;
  if (hasWarning) return SYSTEM_HEALTH.DEGRADED;
  return SYSTEM_HEALTH.HEALTHY;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let value = bytes;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(2)} ${units[i]}`;
}

/**
 * Format uptime to human-readable string
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}
