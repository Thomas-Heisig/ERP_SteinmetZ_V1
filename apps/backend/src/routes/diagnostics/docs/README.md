# Diagnostics Module

**Version:** 1.0.0  
**Last Updated:** 2025-12-20  
**Status:** ✅ Production Ready

## Overview

The Diagnostics Module provides comprehensive system monitoring, health checks, and audit logging for the ERP SteinmetZ system. It offers both a modern HTML dashboard and RESTful JSON API for real-time system insights, database statistics, self-healing reports, and performance metrics.

### Key Features

- 🏥 **Health Monitoring** - Real-time system health checks with detailed status
- 💾 **Database Statistics** - Query performance, connection pool, and table metrics
- 🔧 **Self-Healing Reports** - Automated issue detection and resolution tracking
- 📊 **System Information** - CPU, memory, uptime, and process metrics
- 📝 **Audit Logs** - Comprehensive activity logging with filtering
- 🎨 **Interactive Dashboard** - Modern dark-themed HTML interface with auto-refresh
- 🔌 **JSON API** - RESTful endpoints for monitoring tools integration

---

## Architecture

```list
diagnostics/
├── types.ts                  # TypeScript types and Zod schemas
├── diagnosticsRouter.ts      # Express router with all endpoints
└── README.md                 # This file
```

### Design Principles

- **Type Safety**: Full TypeScript with Zod runtime validation
- **Database Agnostic**: Works with dbService abstraction
- **Logging**: Structured logging with Pino
- **Error Handling**: Comprehensive error handling with asyncHandler
- **Performance**: Minimal overhead, efficient queries
- **Security**: Input validation, SQL injection prevention

---

## Database Schema

### Audit Log Table

```sql
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  entity TEXT NOT NULL,
  entity_id TEXT,
  action TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT,
  changes TEXT,
  metadata TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  success INTEGER DEFAULT 1,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);
```

**Note:** The audit_log table is typically created by the authentication/RBAC system. If not present, audit logging features will be unavailable but the diagnostics endpoints will still function.

---

## API Endpoints

### System Diagnostics

#### GET `/diagnostics`

Interactive HTML dashboard with auto-refresh.

**Features:**

- Real-time system health indicators
- Memory usage visualization
- Database statistics
- Self-healing status
- System information table
- Auto-refresh every 30 seconds

**Response:** HTML page

**Example:**

```bash
# Open in browser
http://localhost:3000/diagnostics
```

---

#### GET `/diagnostics/api`

Complete diagnostics data in JSON format.

**Response:**

```typescript
{
  success: true,
  data: DiagnosticsData,
  timestamp: string
}
```

**Example:**

```bash
curl http://localhost:3000/api/diagnostics/api | jq .
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    "version": {
      "version": "1.0.0",
      "buildDate": "2025-12-20T00:00:00.000Z",
      "name": "ERP SteinmetZ",
      "environment": "production"
    },
    "health": {
      "status": "healthy",
      "checks": [
        {
          "name": "Database",
          "status": "pass",
          "message": "Connected",
          "timestamp": "2025-12-20T10:30:00.000Z",
          "duration": 15
        }
      ],
      "timestamp": "2025-12-20T10:30:00.000Z"
    },
    "database": {
      "total_nodes": 1500,
      "annotated_nodes": 750,
      "pending_nodes": 50,
      "total_ai_operations": 200
    },
    "scheduler": {
      "isRunning": true,
      "lastCheck": "2025-12-20T10:25:00.000Z",
      "nextCheck": "2025-12-20T10:35:00.000Z"
    },
    "reports": {
      "totalReports": 42,
      "successRate": 95
    },
    "system": {
      "hostname": "erp-server-01",
      "platform": "linux",
      "arch": "x64",
      "cpus": 8,
      "totalMemory": "16.00 GB",
      "freeMemory": "4.50 GB",
      "usedMemory": "11.50 GB",
      "memoryUsagePercent": 72,
      "uptime": "15d 6h 30m",
      "nodeVersion": "v20.10.0",
      "processUptime": "2d 4h 15m",
      "processMemory": {
        "rss": "350.00 MB",
        "heapTotal": "180.00 MB",
        "heapUsed": "120.00 MB",
        "external": "5.00 MB"
      },
      "loadAverage": [1.5, 1.2, 0.9]
    }
  },
  "timestamp": "2025-12-20T10:30:00.000Z"
}
```

---

#### GET `/diagnostics/health`

System health check status.

**Response:**

```typescript
{
  success: true,
  data: HealthResult
}
```

**Example:**

```bash
curl http://localhost:3000/api/diagnostics/health
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "checks": [
      {
        "name": "Database",
        "status": "pass",
        "message": "Connected successfully",
        "timestamp": "2025-12-20T10:30:00.000Z",
        "duration": 15
      },
      {
        "name": "AI Provider",
        "status": "pass",
        "message": "OpenAI API responsive",
        "timestamp": "2025-12-20T10:30:00.000Z",
        "duration": 120
      }
    ],
    "timestamp": "2025-12-20T10:30:00.000Z",
    "uptime": 86400
  }
}
```

---

#### GET `/diagnostics/system`

System information (CPU, memory, uptime).

**Response:**

```typescript
{
  success: true,
  data: SystemInfo
}
```

**Example:**

```bash
curl http://localhost:3000/api/diagnostics/system
```

---

#### GET `/diagnostics/database`

Database statistics and health.

**Response:**

```typescript
{
  success: true,
  data: DbStats
}
```

**Example:**

```bash
curl http://localhost:3000/api/diagnostics/database
```

---

#### GET `/diagnostics/scheduler`

Self-healing scheduler status.

**Response:**

```typescript
{
  success: true,
  data: SchedulerStatus
}
```

**Example:**

```bash
curl http://localhost:3000/api/diagnostics/scheduler
```

---

#### GET `/diagnostics/reports`

Healing reports statistics.

**Response:**

```typescript
{
  success: true,
  data: ReportStats
}
```

**Example:**

```bash
curl http://localhost:3000/api/diagnostics/reports
```

---

#### GET `/diagnostics/version`

Application version information.

**Response:**

```typescript
{
  success: true,
  data: VersionInfo
}
```

**Example:**

```bash
curl http://localhost:3000/api/diagnostics/version
```

---

#### POST `/diagnostics/health-check`

Trigger manual health check.

**Response:**

```typescript
{
  success: true,
  data: HealthResult
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/diagnostics/health-check
```

---

### Audit Logs

#### GET `/diagnostics/logs`

Retrieve audit logs with filtering and pagination.

**Query Parameters:**

- `limit` (number, optional, default: 100, max: 1000) - Number of logs to return
- `offset` (number, optional, default: 0) - Offset for pagination
- `entity` (string, optional) - Filter by entity name
- `entityId` (string, optional) - Filter by entity ID
- `action` (string, optional) - Filter by action (create, update, delete, read, login, logout, export, import)
- `userId` (string, optional) - Filter by user ID (UUID)
- `success` (boolean, optional) - Filter by success status
- `startDate` (string, optional) - Filter by start date (ISO 8601)
- `endDate` (string, optional) - Filter by end date (ISO 8601)

**Response:**

```typescript
{
  success: true,
  data: AuditLog[],
  pagination: {
    limit: number,
    offset: number,
    total: number,
    hasMore: boolean
  }
}
```

**Examples:**

```bash
# Get last 50 audit logs
curl "http://localhost:3000/api/diagnostics/logs?limit=50"

# Filter by entity
curl "http://localhost:3000/api/diagnostics/logs?entity=users&limit=20"

# Filter by action
curl "http://localhost:3000/api/diagnostics/logs?action=login&limit=10"

# Filter by user
curl "http://localhost:3000/api/diagnostics/logs?userId=550e8400-e29b-41d4-a716-446655440000"

# Filter by date range
curl "http://localhost:3000/api/diagnostics/logs?startDate=2025-12-01T00:00:00Z&endDate=2025-12-20T23:59:59Z"

# Filter failed operations
curl "http://localhost:3000/api/diagnostics/logs?success=false&limit=20"

# Combined filters with pagination
curl "http://localhost:3000/api/diagnostics/logs?entity=orders&action=update&limit=25&offset=0"
```

**Response Example:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "entity": "users",
      "entityId": "550e8400-e29b-41d4-a716-446655440002",
      "action": "update",
      "userId": "550e8400-e29b-41d4-a716-446655440003",
      "userName": "admin@example.com",
      "changes": "{\"email\":\"newemail@example.com\"}",
      "metadata": "{\"reason\":\"User requested email change\"}",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2025-12-20T10:30:00.000Z",
      "success": true
    }
  ],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 1523,
    "hasMore": true
  }
}
```

---

## TypeScript Types

### Core Types

```typescript
// Health check status values
const HEALTH_STATUS = {
  PASS: "pass",
  WARN: "warn",
  FAIL: "fail",
} as const;

// Overall system health levels
const SYSTEM_HEALTH = {
  HEALTHY: "healthy",
  DEGRADED: "degraded",
  UNHEALTHY: "unhealthy",
} as const;

// Audit log action types
const AUDIT_ACTION = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  READ: "read",
  LOGIN: "login",
  LOGOUT: "logout",
  EXPORT: "export",
  IMPORT: "import",
} as const;

// Individual health check result
interface HealthCheck {
  name: string;
  status: (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS];
  message?: string;
  timestamp?: string;
  duration?: number;
  details?: Record<string, unknown>;
}

// Overall health check result
interface HealthResult {
  status: (typeof SYSTEM_HEALTH)[keyof typeof SYSTEM_HEALTH];
  checks: HealthCheck[];
  timestamp: string;
  version?: string;
  uptime?: number;
}

// Database statistics
interface DbStats {
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

// Scheduler status information
interface SchedulerStatus {
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

// Healing report statistics
interface ReportStats {
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

// System information
interface SystemInfo {
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

// Version information
interface VersionInfo {
  version: string;
  buildDate: string;
  name: string;
  environment: string;
  nodeVersion?: string;
  dependencies?: Record<string, string>;
}

// Audit log entry
interface AuditLog {
  id: string;
  entity: string;
  entityId?: string;
  action: (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
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

// Comprehensive diagnostics data
interface DiagnosticsData {
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
```

---

## Frontend Integration

### Installation

```bash
# Install required dependencies
npm install axios @tanstack/react-query
```

### API Client

```typescript
// src/api/diagnostics.ts
import axios from "axios";
import type {
  DiagnosticsData,
  HealthResult,
  SystemInfo,
  DbStats,
  SchedulerStatus,
  ReportStats,
  VersionInfo,
  AuditLog,
} from "@/types/diagnostics";

const API_BASE_URL = "/api/diagnostics";

export const diagnosticsApi = {
  /**
   * Get complete diagnostics data
   */
  getDiagnostics: async (): Promise<DiagnosticsData> => {
    const { data } = await axios.get(`${API_BASE_URL}/api`);
    return data.data;
  },

  /**
   * Get system health status
   */
  getHealth: async (): Promise<HealthResult> => {
    const { data } = await axios.get(`${API_BASE_URL}/health`);
    return data.data;
  },

  /**
   * Get system information
   */
  getSystemInfo: async (): Promise<SystemInfo> => {
    const { data } = await axios.get(`${API_BASE_URL}/system`);
    return data.data;
  },

  /**
   * Get database statistics
   */
  getDatabaseStats: async (): Promise<DbStats> => {
    const { data } = await axios.get(`${API_BASE_URL}/database`);
    return data.data;
  },

  /**
   * Get scheduler status
   */
  getSchedulerStatus: async (): Promise<SchedulerStatus> => {
    const { data } = await axios.get(`${API_BASE_URL}/scheduler`);
    return data.data;
  },

  /**
   * Get healing reports statistics
   */
  getReportStats: async (): Promise<ReportStats> => {
    const { data } = await axios.get(`${API_BASE_URL}/reports`);
    return data.data;
  },

  /**
   * Get version information
   */
  getVersion: async (): Promise<VersionInfo> => {
    const { data } = await axios.get(`${API_BASE_URL}/version`);
    return data.data;
  },

  /**
   * Trigger manual health check
   */
  triggerHealthCheck: async (): Promise<HealthResult> => {
    const { data } = await axios.post(`${API_BASE_URL}/health-check`);
    return data.data;
  },

  /**
   * Get audit logs with filtering
   */
  getAuditLogs: async (params?: {
    limit?: number;
    offset?: number;
    entity?: string;
    entityId?: string;
    action?: string;
    userId?: string;
    success?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    data: AuditLog[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
      hasMore: boolean;
    };
  }> => {
    const { data } = await axios.get(`${API_BASE_URL}/logs`, { params });
    return data;
  },
};
```

### React Query Hooks

```typescript
// src/hooks/useDiagnostics.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { diagnosticsApi } from "@/api/diagnostics";

const DIAGNOSTICS_KEYS = {
  all: ["diagnostics"] as const,
  diagnostics: () => [...DIAGNOSTICS_KEYS.all, "data"] as const,
  health: () => [...DIAGNOSTICS_KEYS.all, "health"] as const,
  system: () => [...DIAGNOSTICS_KEYS.all, "system"] as const,
  database: () => [...DIAGNOSTICS_KEYS.all, "database"] as const,
  scheduler: () => [...DIAGNOSTICS_KEYS.all, "scheduler"] as const,
  reports: () => [...DIAGNOSTICS_KEYS.all, "reports"] as const,
  version: () => [...DIAGNOSTICS_KEYS.all, "version"] as const,
  logs: (params?: Record<string, unknown>) =>
    [...DIAGNOSTICS_KEYS.all, "logs", params] as const,
};

/**
 * Hook to fetch complete diagnostics data
 * Refetches every 30 seconds
 */
export function useDiagnostics() {
  return useQuery({
    queryKey: DIAGNOSTICS_KEYS.diagnostics(),
    queryFn: diagnosticsApi.getDiagnostics,
    refetchInterval: 30000, // 30 seconds
    staleTime: 20000, // 20 seconds
  });
}

/**
 * Hook to fetch system health
 * Refetches every 10 seconds for real-time monitoring
 */
export function useHealth() {
  return useQuery({
    queryKey: DIAGNOSTICS_KEYS.health(),
    queryFn: diagnosticsApi.getHealth,
    refetchInterval: 10000, // 10 seconds
    staleTime: 5000, // 5 seconds
  });
}

/**
 * Hook to fetch system information
 */
export function useSystemInfo() {
  return useQuery({
    queryKey: DIAGNOSTICS_KEYS.system(),
    queryFn: diagnosticsApi.getSystemInfo,
    refetchInterval: 60000, // 1 minute
  });
}

/**
 * Hook to fetch database statistics
 */
export function useDatabaseStats() {
  return useQuery({
    queryKey: DIAGNOSTICS_KEYS.database(),
    queryFn: diagnosticsApi.getDatabaseStats,
    refetchInterval: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch scheduler status
 */
export function useSchedulerStatus() {
  return useQuery({
    queryKey: DIAGNOSTICS_KEYS.scheduler(),
    queryFn: diagnosticsApi.getSchedulerStatus,
    refetchInterval: 15000, // 15 seconds
  });
}

/**
 * Hook to fetch healing reports statistics
 */
export function useReportStats() {
  return useQuery({
    queryKey: DIAGNOSTICS_KEYS.reports(),
    queryFn: diagnosticsApi.getReportStats,
    refetchInterval: 60000, // 1 minute
  });
}

/**
 * Hook to fetch version information
 */
export function useVersion() {
  return useQuery({
    queryKey: DIAGNOSTICS_KEYS.version(),
    queryFn: diagnosticsApi.getVersion,
    staleTime: Infinity, // Version doesn't change
  });
}

/**
 * Hook to trigger manual health check
 */
export function useTriggerHealthCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: diagnosticsApi.triggerHealthCheck,
    onSuccess: (data) => {
      // Update health cache with new data
      queryClient.setQueryData(DIAGNOSTICS_KEYS.health(), data);
      // Invalidate diagnostics to refetch
      queryClient.invalidateQueries({
        queryKey: DIAGNOSTICS_KEYS.diagnostics(),
      });
    },
  });
}

/**
 * Hook to fetch audit logs
 */
export function useAuditLogs(params?: {
  limit?: number;
  offset?: number;
  entity?: string;
  entityId?: string;
  action?: string;
  userId?: string;
  success?: boolean;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: DIAGNOSTICS_KEYS.logs(params),
    queryFn: () => diagnosticsApi.getAuditLogs(params),
    staleTime: 30000, // 30 seconds
  });
}
```

### React Components

#### Health Status Component

```typescript
// src/components/diagnostics/HealthStatus.tsx
import React from "react";
import { useHealth } from "@/hooks/useDiagnostics";

export const HealthStatus: React.FC = () => {
  const { data: health, isLoading, error } = useHealth();

  if (isLoading) {
    return <div className="spinner">Loading health status...</div>;
  }

  if (error) {
    return <div className="error">Failed to load health status</div>;
  }

  if (!health) {
    return null;
  }

  const statusColors = {
    healthy: "text-green-600 bg-green-100",
    degraded: "text-yellow-600 bg-yellow-100",
    unhealthy: "text-red-600 bg-red-100",
  };

  const checkStatusColors = {
    pass: "text-green-600",
    warn: "text-yellow-600",
    fail: "text-red-600",
  };

  return (
    <div className="health-status">
      <div className="header">
        <h2>System Health</h2>
        <span className={`status-badge ${statusColors[health.status]}`}>
          {health.status.toUpperCase()}
        </span>
      </div>

      <div className="checks">
        {health.checks.map((check, index) => (
          <div key={index} className="check-item">
            <div className="check-info">
              <span className="check-name">{check.name}</span>
              {check.message && (
                <span className="check-message">{check.message}</span>
              )}
            </div>
            <div className="check-status">
              <span className={checkStatusColors[check.status]}>
                {check.status}
              </span>
              {check.duration && (
                <span className="check-duration">{check.duration}ms</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="footer">
        Last checked: {new Date(health.timestamp).toLocaleString()}
      </div>
    </div>
  );
};
```

#### System Info Component

```typescript
// src/components/diagnostics/SystemInfo.tsx
import React from "react";
import { useSystemInfo } from "@/hooks/useDiagnostics";

export const SystemInfo: React.FC = () => {
  const { data: system, isLoading } = useSystemInfo();

  if (isLoading || !system) {
    return <div className="spinner">Loading system info...</div>;
  }

  return (
    <div className="system-info">
      <h2>System Information</h2>

      <div className="info-grid">
        <div className="info-item">
          <label>Hostname</label>
          <span>{system.hostname}</span>
        </div>
        <div className="info-item">
          <label>Platform</label>
          <span>{system.platform} ({system.arch})</span>
        </div>
        <div className="info-item">
          <label>CPUs</label>
          <span>{system.cpus}</span>
        </div>
        <div className="info-item">
          <label>Node.js</label>
          <span>{system.nodeVersion}</span>
        </div>
      </div>

      <div className="memory">
        <h3>Memory</h3>
        <div className="memory-bar">
          <div
            className="memory-bar-fill"
            style={{ width: `${system.memoryUsagePercent}%` }}
          >
            {system.memoryUsagePercent}%
          </div>
        </div>
        <div className="memory-stats">
          <span>Used: {system.usedMemory}</span>
          <span>Free: {system.freeMemory}</span>
          <span>Total: {system.totalMemory}</span>
        </div>
      </div>

      <div className="uptime">
        <div className="uptime-item">
          <label>System Uptime</label>
          <span>{system.uptime}</span>
        </div>
        <div className="uptime-item">
          <label>Process Uptime</label>
          <span>{system.processUptime}</span>
        </div>
      </div>
    </div>
  );
};
```

#### Audit Logs Component

```typescript
// src/components/diagnostics/AuditLogs.tsx
import React, { useState } from "react";
import { useAuditLogs } from "@/hooks/useDiagnostics";

export const AuditLogs: React.FC = () => {
  const [filters, setFilters] = useState({
    limit: 100,
    offset: 0,
    entity: "",
    action: "",
  });

  const { data, isLoading, error } = useAuditLogs(filters);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, offset: 0 }));
  };

  const handleNextPage = () => {
    if (data?.pagination.hasMore) {
      setFilters((prev) => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  const handlePrevPage = () => {
    setFilters((prev) => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit),
    }));
  };

  if (isLoading) {
    return <div className="spinner">Loading audit logs...</div>;
  }

  if (error) {
    return <div className="error">Failed to load audit logs</div>;
  }

  return (
    <div className="audit-logs">
      <div className="header">
        <h2>Audit Logs</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Filter by entity..."
            value={filters.entity}
            onChange={(e) => handleFilterChange("entity", e.target.value)}
          />
          <select
            value={filters.action}
            onChange={(e) => handleFilterChange("action", e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="read">Read</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>
        </div>
      </div>

      <div className="logs-table">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Entity</th>
              <th>Action</th>
              <th>User</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.entity}</td>
                <td>
                  <span className={`action-badge action-${log.action}`}>
                    {log.action}
                  </span>
                </td>
                <td>{log.userName || log.userId || "System"}</td>
                <td>
                  <span className={log.success ? "success" : "error"}>
                    {log.success ? "✓" : "✗"}
                  </span>
                </td>
                <td>
                  {log.changes && (
                    <button
                      className="details-btn"
                      onClick={() => alert(log.changes)}
                    >
                      View Changes
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.pagination && (
        <div className="pagination">
          <button
            onClick={handlePrevPage}
            disabled={filters.offset === 0}
          >
            Previous
          </button>
          <span>
            Showing {filters.offset + 1} -{" "}
            {Math.min(
              filters.offset + filters.limit,
              data.pagination.total
            )}{" "}
            of {data.pagination.total}
          </span>
          <button
            onClick={handleNextPage}
            disabled={!data.pagination.hasMore}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
```

#### Complete Diagnostics Dashboard

```typescript
// src/pages/DiagnosticsDashboard.tsx
import React from "react";
import { HealthStatus } from "@/components/diagnostics/HealthStatus";
import { SystemInfo } from "@/components/diagnostics/SystemInfo";
import { AuditLogs } from "@/components/diagnostics/AuditLogs";
import { useDatabaseStats, useSchedulerStatus, useReportStats, useVersion } from "@/hooks/useDiagnostics";

export const DiagnosticsDashboard: React.FC = () => {
  const { data: dbStats } = useDatabaseStats();
  const { data: scheduler } = useSchedulerStatus();
  const { data: reports } = useReportStats();
  const { data: version } = useVersion();

  return (
    <div className="diagnostics-dashboard">
      <header>
        <h1>System Diagnostics</h1>
        {version && (
          <div className="version">
            v{version.version} | {version.environment}
          </div>
        )}
      </header>

      <div className="dashboard-grid">
        <div className="col-span-2">
          <HealthStatus />
        </div>

        <div>
          <SystemInfo />
        </div>

        {dbStats && (
          <div className="card">
            <h2>Database</h2>
            <div className="stats-grid">
              <div className="stat">
                <div className="stat-value">{dbStats.total_nodes || 0}</div>
                <div className="stat-label">Total Nodes</div>
              </div>
              <div className="stat">
                <div className="stat-value">{dbStats.annotated_nodes || 0}</div>
                <div className="stat-label">Annotated</div>
              </div>
              <div className="stat">
                <div className="stat-value">{dbStats.pending_nodes || 0}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat">
                <div className="stat-value">{dbStats.total_ai_operations || 0}</div>
                <div className="stat-label">AI Operations</div>
              </div>
            </div>
          </div>
        )}

        {scheduler && (
          <div className="card">
            <h2>Scheduler</h2>
            <div className="scheduler-status">
              <div className={`status-indicator ${scheduler.isRunning ? "running" : "stopped"}`}>
                {scheduler.isRunning ? "● Running" : "○ Stopped"}
              </div>
              {scheduler.lastCheck && (
                <div className="last-check">
                  Last Check: {new Date(scheduler.lastCheck).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}

        {reports && (
          <div className="card">
            <h2>Self-Healing</h2>
            <div className="stats-grid">
              <div className="stat">
                <div className="stat-value">{reports.totalReports}</div>
                <div className="stat-label">Total Reports</div>
              </div>
              <div className="stat">
                <div className="stat-value">{reports.successRate}%</div>
                <div className="stat-label">Success Rate</div>
              </div>
            </div>
          </div>
        )}

        <div className="col-span-3">
          <AuditLogs />
        </div>
      </div>
    </div>
  );
};
```

---

## Best Practices

### Performance

1. **Caching**: Use React Query's built-in caching

   ```typescript
   useQuery({
     queryKey: ["diagnostics"],
     queryFn: fetchDiagnostics,
     staleTime: 30000, // Cache for 30 seconds
     refetchInterval: 60000, // Refetch every 60 seconds
   });
   ```

2. **Pagination**: Always use pagination for audit logs

   ```typescript
   const { data } = useAuditLogs({ limit: 50, offset: 0 });
   ```

3. **Selective Fetching**: Fetch only needed data

   ```typescript
   // Instead of useDiagnostics() for everything
   const { data: health } = useHealth(); // Only health data
   ```

### Security

1. **Authentication**: Protect diagnostics endpoints in production

   ```typescript
   router.get("/", authenticate(), requireRole(["admin"]), handler);
   ```

2. **Rate Limiting**: Implement rate limiting for health checks

   ```typescript
   router.post("/health-check", rateLimit({ max: 10, window: "1m" }), handler);
   ```

3. **Input Validation**: All inputs are validated with Zod

   ```typescript
   const validated = queryLogsSchema.parse(req.query);
   ```

4. **SQL Injection Prevention**: Use parameterized queries

   ```typescript
   db.all("SELECT * FROM audit_log WHERE entity = ?", [entity]);
   ```

### Monitoring Integration

#### Prometheus Integration

```typescript
// Future enhancement: /diagnostics/metrics endpoint
GET /diagnostics/metrics

# HELP system_health_status System health status (0=unhealthy, 1=degraded, 2=healthy)
# TYPE system_health_status gauge
system_health_status 2

# HELP db_connection_pool_active Active database connections
# TYPE db_connection_pool_active gauge
db_connection_pool_active 5

# HELP db_queries_total Total database queries
# TYPE db_queries_total counter
db_queries_total 10234
```

#### Grafana Dashboard

Create Grafana dashboard using `/diagnostics/api` endpoint:

- System health gauge
- Memory usage graph
- Database query performance
- Scheduler status timeline
- Audit log activity heatmap

---

## Error Handling

All errors are handled consistently:

```typescript
try {
  const data = await diagnosticsApi.getHealth();
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error("API Error:", error.response?.data);
  } else {
    console.error("Unknown Error:", error);
  }
}
```

React Query handles errors automatically:

```typescript
const { data, error, isError } = useHealth();

if (isError) {
  return <div>Error: {error.message}</div>;
}
```

---

## Testing

### Unit Tests

```typescript
// __tests__/diagnostics.test.ts
import { describe, it, expect } from "vitest";
import { formatBytes, formatUptime } from "../types";

describe("Diagnostics Utilities", () => {
  describe("formatBytes", () => {
    it("should format bytes to KB", () => {
      expect(formatBytes(1024)).toBe("1.00 KB");
    });

    it("should format bytes to MB", () => {
      expect(formatBytes(1048576)).toBe("1.00 MB");
    });

    it("should format bytes to GB", () => {
      expect(formatBytes(1073741824)).toBe("1.00 GB");
    });
  });

  describe("formatUptime", () => {
    it("should format seconds", () => {
      expect(formatUptime(30)).toBe("30s");
    });

    it("should format minutes", () => {
      expect(formatUptime(90)).toBe("1m 30s");
    });

    it("should format hours", () => {
      expect(formatUptime(3665)).toBe("1h 1m 5s");
    });

    it("should format days", () => {
      expect(formatUptime(90000)).toBe("1d 1h 0m 0s");
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/diagnostics-api.test.ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";

describe("Diagnostics API", () => {
  it("GET /diagnostics/health should return health status", async () => {
    const res = await request(app).get("/api/diagnostics/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("status");
    expect(res.body.data).toHaveProperty("checks");
    expect(res.body.data).toHaveProperty("timestamp");
  });

  it("GET /diagnostics/system should return system info", async () => {
    const res = await request(app).get("/api/diagnostics/system");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("hostname");
    expect(res.body.data).toHaveProperty("cpus");
    expect(res.body.data).toHaveProperty("totalMemory");
  });

  it("GET /diagnostics/logs should support filtering", async () => {
    const res = await request(app)
      .get("/api/diagnostics/logs")
      .query({ entity: "users", limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toHaveProperty("total");
  });

  it("POST /diagnostics/health-check should trigger manual check", async () => {
    const res = await request(app).post("/api/diagnostics/health-check");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("status");
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. Health checks always failing

**Problem**: All health checks return "fail" status

**Solution**:

- Check healthMonitor service configuration
- Verify external service connections (database, AI providers)
- Check network connectivity
- Review logs for specific error messages

```bash
# Check health monitor logs
tail -f logs/health-monitor.log

# Test database connection
sqlite3 data/dev.sqlite3 "SELECT 1"
```

#### 2. Audit logs not appearing

**Problem**: Audit logs endpoint returns empty array

**Solution**:

- Verify audit_log table exists
- Check if audit logging is enabled in authentication middleware
- Verify database migrations ran successfully
- Check table permissions

```bash
# Check if audit_log table exists
sqlite3 data/dev.sqlite3 ".schema audit_log"

# Count audit log entries
sqlite3 data/dev.sqlite3 "SELECT COUNT(*) FROM audit_log"
```

#### 3. Memory usage always 100%

**Problem**: System shows 100% memory usage

**Solution**:

- This is normal for Node.js (heap pre-allocation)
- Check `processMemory.heapUsed` vs `processMemory.heapTotal`
- Monitor for actual memory leaks with `node --inspect`

```bash
# Monitor memory with Node.js inspector
node --inspect=9229 apps/backend/src/index.ts

# Then open chrome://inspect in Chrome
```

#### 4. Dashboard not auto-refreshing

**Problem**: HTML dashboard doesn't refresh automatically

**Solution**:

- Check browser console for JavaScript errors
- Verify JavaScript is enabled
- Check for Content Security Policy blocking script execution
- Test manual refresh button

---

## Migration Guide

### From Old Diagnostics System

If you're migrating from an older diagnostics implementation:

1. **Update imports**:

   ```typescript
   // Old
   import { HealthCheck, HealthResult } from "../oldTypes";

   // New
   import type { HealthCheck, HealthResult } from "./types";
   ```

2. **Update API calls**:

   ```typescript
   // Old
   const health = await fetch("/health").then((r) => r.json());

   // New
   const health = await diagnosticsApi.getHealth();
   ```

3. **Update React components**:

   ```typescript
   // Old
   const [health, setHealth] = useState(null);
   useEffect(() => {
     fetchHealth().then(setHealth);
   }, []);

   // New
   const { data: health } = useHealth();
   ```

---

## Dependencies

### Backend

- express v4.x - Web framework
- zod v3.x - Runtime validation
- pino - Structured logging
- sqlite3 - Database (via dbService)

### Frontend

- axios - HTTP client
- @tanstack/react-query v5.x - Data fetching & caching
- react v18.x - UI framework

---

## Related Documentation

- [DATABASE_MIGRATION_STANDARDS.md](../../../docs/DATABASE_MIGRATION_STANDARDS.md) - Database migration guidelines
- [ARCHITECTURE.md](../../../docs/ARCHITECTURE.md) - System architecture
- [AUTHENTICATION.md](../../../docs/AUTHENTICATION.md) - Auth & RBAC
- [MONITORING.md](../../../docs/MONITORING.md) - System monitoring
- [ERROR_HANDLING.md](../../../docs/ERROR_HANDLING.md) - Error handling patterns

---

## Changelog

### Version 1.0.0 (2025-12-20)

- ✅ Complete rewrite with TypeScript and Zod validation
- ✅ Centralized types in types.ts
- ✅ Comprehensive API endpoints for all diagnostic data
- ✅ Enhanced HTML dashboard with memory visualization
- ✅ Audit logs with advanced filtering and pagination
- ✅ React Query hooks for frontend integration
- ✅ Production-ready error handling
- ✅ Complete documentation with examples

---

## Maintainer

**GitHub Copilot & Development Team**  
**Last Review:** 2025-12-20  
**Status:** ✅ Production Ready
