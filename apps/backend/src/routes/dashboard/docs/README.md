# Dashboard Module

Comprehensive dashboard system providing system health monitoring, KPIs, tasks, notifications, widgets, and analytics.

**Version:** 2.0  
**Last Updated:** 2025-12-20

## Features

- **System Health**: Real-time system and resource monitoring
- **Dashboard Overview**: Comprehensive system, AI, and ERP statistics
- **KPI Tracking**: Key Performance Indicators with trends
- **Task Management**: User tasks with priorities and due dates
- **Notifications**: User notifications with read status
- **Widget Configuration**: Customizable dashboard widgets
- **Layout Management**: Save and switch between dashboard layouts
- **Favorites**: Quick access to frequently used items
- **Executive Metrics**: Revenue, margins, liquidity, productivity
- **Process Monitoring**: Pipeline, procurement, production, SLA
- **Warnings & Alerts**: System-wide warnings and escalations

## Database Schema

### Dashboard KPIs Table (`dashboard_kpis`)

```sql
CREATE TABLE dashboard_kpis (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  value REAL NOT NULL DEFAULT 0,
  unit TEXT,
  trend TEXT,
  trend_value REAL,
  target REAL,
  description TEXT,
  date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

**Indexes:**

- `idx_kpis_date` on `date`
- `idx_kpis_category` on `category`

### Dashboard Tasks Table (`dashboard_tasks`)

```sql
CREATE TABLE dashboard_tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'normal',
  due_date TEXT,
  completed_at TEXT,
  assigned_to TEXT,
  tags TEXT,
  related_to TEXT,
  related_type TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

**Indexes:**

- `idx_tasks_user` on `user_id`
- `idx_tasks_status` on `status`
- `idx_tasks_priority` on `priority`
- `idx_tasks_due` on `due_date`

### Dashboard Notifications Table (`dashboard_notifications`)

```sql
CREATE TABLE dashboard_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  action_url TEXT,
  action_label TEXT,
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  read_at TEXT
);
```

**Indexes:**

- `idx_notifications_user` on `user_id`
- `idx_notifications_read` on `read`
- `idx_notifications_created` on `created_at`

### Dashboard Widgets Table (`dashboard_widgets`)

```sql
CREATE TABLE dashboard_widgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  widget_type TEXT NOT NULL,
  data_source TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 4,
  height INTEGER NOT NULL DEFAULT 4,
  refresh_interval INTEGER,
  config TEXT,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

**Indexes:**

- `idx_widgets_user` on `user_id`
- `idx_widgets_visible` on `is_visible`

### Dashboard Layouts Table (`dashboard_layouts`)

```sql
CREATE TABLE dashboard_layouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  layout TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

**Indexes:**

- `idx_layouts_user` on `user_id`
- `idx_layouts_active` on `is_active`

### Dashboard Favorites Table (`dashboard_favorites`)

```sql
CREATE TABLE dashboard_favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
```

**Indexes:**

- `idx_favorites_user` on `user_id`

### Additional Analytics Tables

See [comprehensive.ts](comprehensive.ts#L48-L340) for complete schemas of:

- `dashboard_revenue_metrics`
- `dashboard_top_customers`
- `dashboard_top_products`
- `dashboard_regional_revenue`
- `dashboard_profit_margins`
- `dashboard_liquidity`
- `dashboard_order_intake`
- `dashboard_productivity`
- `dashboard_pipeline`
- `dashboard_procurement`
- `dashboard_production`
- `dashboard_sla`
- `dashboard_projects`
- `dashboard_warnings`

## API Endpoints

### System Health & Overview

#### `GET /api/dashboard/health`

Get system health status.

**Response:**

```json
{
  "status": "healthy",
  "uptime": 12345.67,
  "hostname": "server01",
  "platform": "win32",
  "node_version": "v18.17.0",
  "memory": {
    "free": "1024 MB",
    "total": "8192 MB"
  },
  "loadavg": [0.12, 0.08, 0.05],
  "timestamp": "2025-12-20T10:30:00.000Z"
}
```

#### `GET /api/dashboard/overview`

Get comprehensive system, AI, and ERP overview.

**Response:**

```json
{
  "system": {
    "uptime": 12345.67,
    "cpu": 8,
    "loadavg": ["0.12", "0.10", "0.09"],
    "memory": {
      "free": "1024 MB",
      "total": "8192 MB"
    }
  },
  "ai": {
    "fallback_config_source": "defaults",
    "wiki_enabled": true,
    "modules": {
      "fallback_ai": true,
      "annotator_ai": true,
      "rag_ai": false
    }
  },
  "erp": {
    "openOrders": 14,
    "pendingInvoices": 7,
    "stockItems": 1240,
    "customers": 328
  },
  "version": {
    "name": "erp-steinmetz",
    "version": "1.0.0",
    "description": "ERP System"
  },
  "timestamp": "2025-12-20T10:30:00.000Z"
}
```

#### `GET /api/dashboard/context`

Get last context log entries.

**Response:**

```json
{
  "context": ["User: Request 1", "AI: Response 1", "System: Event 1"]
}
```

### KPIs

#### `GET /api/dashboard/kpis`

Get dashboard KPIs.

**Query Parameters:**

- `category` (optional): Filter by category
- `days` (default: 7): Number of days to retrieve

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "kpi-uuid",
      "name": "Revenue",
      "category": "finance",
      "value": 125340,
      "unit": "EUR",
      "trend": "up",
      "trendValue": 12.5,
      "target": 150000,
      "description": "Monthly revenue",
      "date": "2025-12-20",
      "createdAt": "2025-12-20T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Tasks

#### `GET /api/dashboard/tasks`

List tasks with filtering.

**Query Parameters:**

- `status` (optional): Filter by status (pending, in_progress, completed, cancelled, on_hold)
- `priority` (optional): Filter by priority (low, normal, high, urgent, critical)
- `userId` (optional): Filter by user ID
- `assignedTo` (optional): Filter by assigned user
- `dueBefore` (optional): Filter tasks due before date
- `dueAfter` (optional): Filter tasks due after date
- `limit` (default: no limit): Results per page
- `offset` (default: 0): Pagination offset

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "task-uuid",
      "userId": "user-uuid",
      "title": "Complete monthly report",
      "description": "Generate and submit monthly financial report",
      "status": "in_progress",
      "priority": "high",
      "dueDate": "2025-12-25T18:00:00.000Z",
      "completedAt": null,
      "assignedTo": "user-2-uuid",
      "tags": "[\"finance\",\"reporting\"]",
      "relatedTo": "report-123",
      "relatedType": "report",
      "createdAt": "2025-12-15T09:00:00.000Z",
      "updatedAt": "2025-12-20T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### `GET /api/dashboard/tasks/:id`

Get task by ID.

#### `POST /api/dashboard/tasks`

Create a new task.

**Request Body:**

```json
{
  "userId": "user-uuid",
  "title": "Complete monthly report",
  "description": "Generate and submit monthly financial report",
  "status": "pending",
  "priority": "high",
  "dueDate": "2025-12-25T18:00:00.000Z",
  "assignedTo": "user-2-uuid",
  "tags": "[\"finance\",\"reporting\"]",
  "relatedTo": "report-123",
  "relatedType": "report"
}
```

#### `PUT /api/dashboard/tasks/:id`

Update a task.

#### `DELETE /api/dashboard/tasks/:id`

Delete a task.

### Notifications

#### `GET /api/dashboard/notifications`

List notifications with filtering.

**Query Parameters:**

- `userId` (optional): Filter by user ID
- `type` (optional): Filter by type (info, warning, error, success, alert)
- `read` (optional): Filter by read status ("true" or "false")
- `limit` (default: no limit): Results per page
- `offset` (default: 0): Pagination offset

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "notif-uuid",
      "userId": "user-uuid",
      "type": "warning",
      "title": "Low stock alert",
      "message": "Product XYZ-123 is below minimum threshold",
      "read": false,
      "actionUrl": "/inventory/XYZ-123",
      "actionLabel": "View Product",
      "metadata": "{\"productId\":\"XYZ-123\",\"currentStock\":5}",
      "createdAt": "2025-12-20T10:00:00.000Z",
      "readAt": null
    }
  ],
  "count": 1
}
```

#### `GET /api/dashboard/notifications/:id`

Get notification by ID.

#### `POST /api/dashboard/notifications`

Create a new notification.

**Request Body:**

```json
{
  "userId": "user-uuid",
  "type": "warning",
  "title": "Low stock alert",
  "message": "Product XYZ-123 is below minimum threshold",
  "read": false,
  "actionUrl": "/inventory/XYZ-123",
  "actionLabel": "View Product",
  "metadata": "{\"productId\":\"XYZ-123\",\"currentStock\":5}"
}
```

#### `PUT /api/dashboard/notifications/:id`

Update a notification (mark as read/unread).

**Request Body:**

```json
{
  "read": true
}
```

#### `DELETE /api/dashboard/notifications/:id`

Delete a notification.

### Widgets

#### `GET /api/dashboard/widgets/stats`

Get comprehensive stats for dashboard widgets.

**Response:**

```json
{
  "success": true,
  "data": {
    "sales": {
      "today": 15420,
      "yesterday": 12340,
      "thisWeek": 89760,
      "lastWeek": 78450,
      "trend": "+14.4%"
    },
    "orders": {
      "total": 1248,
      "pending": 14,
      "processing": 23,
      "completed": 1211,
      "trend": "+8.2%"
    },
    "customers": {
      "total": 328,
      "new": 12,
      "active": 287,
      "inactive": 41,
      "trend": "+3.8%"
    },
    "inventory": {
      "totalItems": 1240,
      "lowStock": 8,
      "outOfStock": 2,
      "inStock": 1230,
      "trend": "-0.6%"
    },
    "finance": {
      "revenue": 125340,
      "expenses": 45280,
      "profit": 80060,
      "margin": "63.9%",
      "trend": "+12.5%"
    }
  },
  "timestamp": "2025-12-20T10:30:00.000Z"
}
```

### Activities

#### `GET /api/dashboard/activities`

Get recent activities for dashboard.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "type": "order",
      "title": "New order received",
      "description": "Order #12345 from ACME Corp",
      "timestamp": "2025-12-20T10:25:00.000Z",
      "icon": "shopping-cart",
      "url": "/orders/12345"
    }
  ],
  "count": 1
}
```

### Quick Links

#### `GET /api/dashboard/quick-links`

Get quick links for dashboard.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "orders",
      "title": "Orders",
      "description": "Manage customer orders",
      "icon": "shopping-cart",
      "url": "/orders",
      "category": "sales"
    }
  ],
  "count": 6
}
```

## Comprehensive Dashboard Endpoints

All comprehensive dashboard endpoints are prefixed with `/api/dashboard/comprehensive`.

### Executive Overview

#### `GET /api/dashboard/comprehensive/executive/revenue`

Get revenue metrics and top performers.

**Query Parameters:**

- `period` (default: "month"): Time period for top customers/products

**Response:**

```json
{
  "success": true,
  "data": {
    "metrics": {
      "date": "2025-12-20",
      "totalRevenue": 125340,
      "projectedRevenue": 150000,
      "revenueGrowth": 12.5,
      "averageOrderValue": 450.5,
      "orderCount": 278,
      "activeCustomers": 245,
      "newCustomers": 12,
      "recurringRevenue": 85000,
      "oneTimeRevenue": 40340
    },
    "topCustomers": [
      {
        "customerId": "cust-uuid",
        "customerName": "ACME Corporation",
        "revenue": 25000,
        "orderCount": 45,
        "rank": 1,
        "period": "month"
      }
    ],
    "topProducts": [
      {
        "productId": "prod-uuid",
        "productName": "Premium Widget",
        "revenue": 15000,
        "quantity": 120,
        "rank": 1,
        "period": "month"
      }
    ],
    "regionalRevenue": [
      {
        "region": "Europe",
        "revenue": 75000,
        "orderCount": 150,
        "customerCount": 120,
        "date": "2025-12-20"
      }
    ]
  }
}
```

#### `GET /api/dashboard/comprehensive/executive/margins`

Get profit margin metrics.

**Query Parameters:**

- `days` (default: "30"): Number of days to retrieve

#### `GET /api/dashboard/comprehensive/executive/liquidity`

Get liquidity status.

#### `GET /api/dashboard/comprehensive/executive/order-intake`

Get order intake statistics.

**Query Parameters:**

- `periods` (default: "12"): Number of periods to retrieve

#### `GET /api/dashboard/comprehensive/executive/productivity`

Get productivity metrics.

### Process Monitoring

#### `GET /api/dashboard/comprehensive/process/pipeline`

Get sales pipeline stages.

#### `GET /api/dashboard/comprehensive/process/procurement`

Get procurement metrics.

**Query Parameters:**

- `days` (default: "30"): Number of days to retrieve

#### `GET /api/dashboard/comprehensive/process/production`

Get production utilization.

**Query Parameters:**

- `days` (default: "30"): Number of days to retrieve

#### `GET /api/dashboard/comprehensive/process/sla`

Get SLA metrics.

**Query Parameters:**

- `days` (default: "30"): Number of days to retrieve

#### `GET /api/dashboard/comprehensive/process/projects`

Get project progress.

**Query Parameters:**

- `status` (optional): Filter by project status

### Warnings & Escalations

#### `GET /api/dashboard/comprehensive/warnings/all`

Get all warnings and alerts.

**Query Parameters:**

- `type` (optional): Filter by type (liquidity, receivables, inventory, production, quality, deadline, budget, compliance)
- `severity` (optional): Filter by severity (low, medium, high, critical)
- `acknowledged` (optional): Filter by acknowledged status ("true" or "false")
- `resolved` (optional): Filter by resolved status ("true" or "false")

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "warn-uuid",
      "type": "liquidity",
      "severity": "high",
      "title": "Low cash reserves",
      "message": "Cash on hand below safe threshold",
      "value": 15000,
      "threshold": 25000,
      "unit": "EUR",
      "affectedEntity": "finance",
      "affectedId": "cash-account-1",
      "actionRequired": "Review upcoming expenses and collect receivables",
      "acknowledgedBy": null,
      "acknowledgedAt": null,
      "resolvedBy": null,
      "resolvedAt": null,
      "createdAt": "2025-12-20T08:00:00.000Z",
      "updatedAt": "2025-12-20T08:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Widget Configuration

#### `GET /api/dashboard/comprehensive/widgets/config/:userId`

Get user's widget configuration.

#### `POST /api/dashboard/comprehensive/widgets/config`

Create a new widget.

**Request Body:**

```json
{
  "userId": "user-uuid",
  "widgetType": "chart",
  "dataSource": "revenue",
  "title": "Monthly Revenue",
  "description": "Revenue trend over last 12 months",
  "position": 0,
  "width": 6,
  "height": 4,
  "refreshInterval": 300,
  "config": "{\"chartType\":\"line\",\"period\":\"month\"}",
  "isVisible": true
}
```

#### `PUT /api/dashboard/comprehensive/widgets/config/:widgetId`

Update a widget.

#### `DELETE /api/dashboard/comprehensive/widgets/config/:widgetId`

Delete a widget.

### Layouts

#### `GET /api/dashboard/comprehensive/layouts/:userId`

Get user's layouts.

#### `POST /api/dashboard/comprehensive/layouts`

Create a new layout.

**Request Body:**

```json
{
  "userId": "user-uuid",
  "name": "Executive Dashboard",
  "description": "Executive overview with key metrics",
  "layout": "{\"widgets\":[{\"id\":\"w1\",\"x\":0,\"y\":0,\"w\":6,\"h\":4}]}",
  "isDefault": true,
  "isActive": true
}
```

#### `PUT /api/dashboard/comprehensive/layouts/:layoutId`

Update a layout.

#### `DELETE /api/dashboard/comprehensive/layouts/:layoutId`

Delete a layout.

### Favorites

#### `GET /api/dashboard/comprehensive/favorites/:userId`

Get user's favorites.

#### `POST /api/dashboard/comprehensive/favorites`

Create a new favorite.

**Request Body:**

```json
{
  "userId": "user-uuid",
  "itemType": "report",
  "itemId": "monthly-sales",
  "title": "Monthly Sales Report",
  "url": "/reports/monthly-sales",
  "icon": "bar-chart",
  "position": 0
}
```

#### `DELETE /api/dashboard/comprehensive/favorites/:favoriteId`

Delete a favorite.

### Comprehensive Overview

#### `GET /api/dashboard/comprehensive/comprehensive-overview`

Get all dashboard data in one request (optimized for initial dashboard load).

**Response:**

```json
{
  "success": true,
  "data": {
    "revenue": {
      /* RevenueMetrics */
    },
    "margins": {
      /* ProfitMargin */
    },
    "liquidity": {
      /* LiquidityStatus */
    },
    "orderIntake": [
      /* OrderIntake[] */
    ],
    "productivity": {
      /* ProductivityMetrics */
    },
    "pipeline": [
      /* PipelineStage[] */
    ],
    "warnings": [
      /* DashboardWarning[] */
    ]
  }
}
```

## Frontend Integration

### TypeScript Types

```typescript
// types/dashboard.ts
export interface DashboardTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled" | "on_hold";
  priority: "low" | "normal" | "high" | "urgent" | "critical";
  dueDate?: string;
  completedAt?: string;
  assignedTo?: string;
  tags?: string;
  relatedTo?: string;
  relatedType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardNotification {
  id: string;
  userId: string;
  type: "info" | "warning" | "error" | "success" | "alert";
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: string;
  createdAt: string;
  readAt?: string;
}

export interface DashboardKPI {
  id: string;
  name: string;
  category: string;
  value: number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: number;
  target?: number;
  description?: string;
  date: string;
  createdAt: string;
}

export interface DashboardWidget {
  id: string;
  userId: string;
  widgetType:
    | "chart"
    | "stat"
    | "table"
    | "list"
    | "gauge"
    | "map"
    | "timeline"
    | "custom";
  dataSource:
    | "revenue"
    | "orders"
    | "customers"
    | "inventory"
    | "production"
    | "finance"
    | "hr"
    | "tasks"
    | "notifications"
    | "custom";
  title: string;
  description?: string;
  position: number;
  width: number;
  height: number;
  refreshInterval?: number;
  config?: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardLayout {
  id: string;
  userId: string;
  name: string;
  description?: string;
  layout: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWarning {
  id: string;
  type:
    | "liquidity"
    | "receivables"
    | "inventory"
    | "production"
    | "quality"
    | "deadline"
    | "budget"
    | "compliance";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  value?: number;
  threshold?: number;
  unit?: string;
  affectedEntity?: string;
  affectedId?: string;
  actionRequired?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueMetrics {
  date: string;
  totalRevenue: number;
  projectedRevenue: number;
  revenueGrowth: number;
  averageOrderValue: number;
  orderCount: number;
  activeCustomers: number;
  newCustomers: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
}

export interface SystemHealth {
  status: string;
  uptime: number;
  hostname: string;
  platform: string;
  node_version: string;
  memory: {
    free: string;
    total: string;
  };
  loadavg: number[];
  timestamp: string;
}
```

### API Client

```typescript
// services/dashboardApi.ts
import axios from "axios";
import type {
  DashboardTask,
  DashboardNotification,
  DashboardKPI,
  DashboardWidget,
  DashboardLayout,
  DashboardWarning,
  RevenueMetrics,
  SystemHealth,
} from "@/types/dashboard";

const API_BASE = "/api/dashboard";

export const dashboardApi = {
  // System Health & Overview
  getHealth: () =>
    axios.get<SystemHealth>(`${API_BASE}/health`).then((res) => res.data),

  getOverview: () => axios.get(`${API_BASE}/overview`).then((res) => res.data),

  getContext: () =>
    axios
      .get<{ context: string[] }>(`${API_BASE}/context`)
      .then((res) => res.data),

  // KPIs
  getKPIs: (params?: { category?: string; days?: number }) =>
    axios
      .get<{
        success: boolean;
        data: DashboardKPI[];
        count: number;
      }>(`${API_BASE}/kpis`, { params })
      .then((res) => res.data),

  // Tasks
  getTasks: (params?: {
    status?: string;
    priority?: string;
    userId?: string;
    assignedTo?: string;
    dueBefore?: string;
    dueAfter?: string;
    limit?: number;
    offset?: number;
  }) =>
    axios
      .get<{
        success: boolean;
        data: DashboardTask[];
        count: number;
      }>(`${API_BASE}/tasks`, { params })
      .then((res) => res.data),

  getTask: (id: string) =>
    axios
      .get<{ success: boolean; data: DashboardTask }>(`${API_BASE}/tasks/${id}`)
      .then((res) => res.data.data),

  createTask: (task: Partial<DashboardTask>) =>
    axios
      .post<{
        success: boolean;
        data: DashboardTask;
      }>(`${API_BASE}/tasks`, task)
      .then((res) => res.data.data),

  updateTask: (id: string, updates: Partial<DashboardTask>) =>
    axios
      .put<{
        success: boolean;
        data: DashboardTask;
      }>(`${API_BASE}/tasks/${id}`, updates)
      .then((res) => res.data.data),

  deleteTask: (id: string) =>
    axios.delete(`${API_BASE}/tasks/${id}`).then((res) => res.data),

  // Notifications
  getNotifications: (params?: {
    userId?: string;
    type?: string;
    read?: boolean;
    limit?: number;
    offset?: number;
  }) =>
    axios
      .get<{
        success: boolean;
        data: DashboardNotification[];
        count: number;
      }>(`${API_BASE}/notifications`, { params })
      .then((res) => res.data),

  getNotification: (id: string) =>
    axios
      .get<{
        success: boolean;
        data: DashboardNotification;
      }>(`${API_BASE}/notifications/${id}`)
      .then((res) => res.data.data),

  createNotification: (notification: Partial<DashboardNotification>) =>
    axios
      .post<{
        success: boolean;
        data: DashboardNotification;
      }>(`${API_BASE}/notifications`, notification)
      .then((res) => res.data.data),

  markNotificationAsRead: (id: string, read: boolean) =>
    axios
      .put<{
        success: boolean;
        data: DashboardNotification;
      }>(`${API_BASE}/notifications/${id}`, { read })
      .then((res) => res.data.data),

  deleteNotification: (id: string) =>
    axios.delete(`${API_BASE}/notifications/${id}`).then((res) => res.data),

  // Widgets & Stats
  getWidgetStats: () =>
    axios.get(`${API_BASE}/widgets/stats`).then((res) => res.data),

  getActivities: () =>
    axios.get(`${API_BASE}/activities`).then((res) => res.data),

  getQuickLinks: () =>
    axios.get(`${API_BASE}/quick-links`).then((res) => res.data),

  // Comprehensive Dashboard
  comprehensive: {
    // Executive Overview
    getRevenue: (params?: { period?: string }) =>
      axios
        .get(`${API_BASE}/comprehensive/executive/revenue`, { params })
        .then((res) => res.data),

    getMargins: (params?: { days?: number }) =>
      axios
        .get(`${API_BASE}/comprehensive/executive/margins`, { params })
        .then((res) => res.data),

    getLiquidity: () =>
      axios
        .get(`${API_BASE}/comprehensive/executive/liquidity`)
        .then((res) => res.data),

    getOrderIntake: (params?: { periods?: number }) =>
      axios
        .get(`${API_BASE}/comprehensive/executive/order-intake`, { params })
        .then((res) => res.data),

    getProductivity: () =>
      axios
        .get(`${API_BASE}/comprehensive/executive/productivity`)
        .then((res) => res.data),

    // Process Monitoring
    getPipeline: () =>
      axios
        .get(`${API_BASE}/comprehensive/process/pipeline`)
        .then((res) => res.data),

    getProcurement: (params?: { days?: number }) =>
      axios
        .get(`${API_BASE}/comprehensive/process/procurement`, { params })
        .then((res) => res.data),

    getProduction: (params?: { days?: number }) =>
      axios
        .get(`${API_BASE}/comprehensive/process/production`, { params })
        .then((res) => res.data),

    getSLA: (params?: { days?: number }) =>
      axios
        .get(`${API_BASE}/comprehensive/process/sla`, { params })
        .then((res) => res.data),

    getProjects: (params?: { status?: string }) =>
      axios
        .get(`${API_BASE}/comprehensive/process/projects`, { params })
        .then((res) => res.data),

    // Warnings
    getWarnings: (params?: {
      type?: string;
      severity?: string;
      acknowledged?: boolean;
      resolved?: boolean;
    }) =>
      axios
        .get<{
          success: boolean;
          data: DashboardWarning[];
          count: number;
        }>(`${API_BASE}/comprehensive/warnings/all`, { params })
        .then((res) => res.data),

    // Widget Configuration
    getWidgets: (userId: string) =>
      axios
        .get<{
          success: boolean;
          data: DashboardWidget[];
          count: number;
        }>(`${API_BASE}/comprehensive/widgets/config/${userId}`)
        .then((res) => res.data),

    createWidget: (widget: Partial<DashboardWidget>) =>
      axios
        .post<{
          success: boolean;
          data: DashboardWidget;
        }>(`${API_BASE}/comprehensive/widgets/config`, widget)
        .then((res) => res.data.data),

    updateWidget: (id: string, updates: Partial<DashboardWidget>) =>
      axios
        .put<{
          success: boolean;
          data: DashboardWidget;
        }>(`${API_BASE}/comprehensive/widgets/config/${id}`, updates)
        .then((res) => res.data.data),

    deleteWidget: (id: string) =>
      axios
        .delete(`${API_BASE}/comprehensive/widgets/config/${id}`)
        .then((res) => res.data),

    // Layouts
    getLayouts: (userId: string) =>
      axios
        .get<{
          success: boolean;
          data: DashboardLayout[];
          count: number;
        }>(`${API_BASE}/comprehensive/layouts/${userId}`)
        .then((res) => res.data),

    createLayout: (layout: Partial<DashboardLayout>) =>
      axios
        .post<{
          success: boolean;
          data: DashboardLayout;
        }>(`${API_BASE}/comprehensive/layouts`, layout)
        .then((res) => res.data.data),

    updateLayout: (id: string, updates: Partial<DashboardLayout>) =>
      axios
        .put<{
          success: boolean;
          data: DashboardLayout;
        }>(`${API_BASE}/comprehensive/layouts/${id}`, updates)
        .then((res) => res.data.data),

    deleteLayout: (id: string) =>
      axios
        .delete(`${API_BASE}/comprehensive/layouts/${id}`)
        .then((res) => res.data),

    // Favorites
    getFavorites: (userId: string) =>
      axios
        .get(`${API_BASE}/comprehensive/favorites/${userId}`)
        .then((res) => res.data),

    createFavorite: (favorite: any) =>
      axios
        .post(`${API_BASE}/comprehensive/favorites`, favorite)
        .then((res) => res.data),

    deleteFavorite: (id: string) =>
      axios
        .delete(`${API_BASE}/comprehensive/favorites/${id}`)
        .then((res) => res.data),

    // Comprehensive Overview
    getComprehensiveOverview: () =>
      axios
        .get(`${API_BASE}/comprehensive/comprehensive-overview`)
        .then((res) => res.data),
  },
};
```

### React Query Hooks

```typescript
// hooks/useDashboard.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "@/services/dashboardApi";
import type {
  DashboardTask,
  DashboardNotification,
  DashboardWidget,
} from "@/types/dashboard";

// System Health & Overview
export function useSystemHealth() {
  return useQuery({
    queryKey: ["dashboard", "health"],
    queryFn: dashboardApi.getHealth,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardApi.getOverview,
    refetchInterval: 60000, // Refresh every minute
  });
}

// KPIs
export function useDashboardKPIs(params?: {
  category?: string;
  days?: number;
}) {
  return useQuery({
    queryKey: ["dashboard", "kpis", params],
    queryFn: () => dashboardApi.getKPIs(params),
  });
}

// Tasks
export function useDashboardTasks(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["dashboard", "tasks", params],
    queryFn: () => dashboardApi.getTasks(params),
  });
}

export function useDashboardTask(id: string) {
  return useQuery({
    queryKey: ["dashboard", "tasks", id],
    queryFn: () => dashboardApi.getTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: Partial<DashboardTask>) => dashboardApi.createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<DashboardTask>;
    }) => dashboardApi.updateTask(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "tasks"] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", "tasks", variables.id],
      });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dashboardApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "tasks"] });
    },
  });
}

// Notifications
export function useDashboardNotifications(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["dashboard", "notifications", params],
    queryFn: () => dashboardApi.getNotifications(params),
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) =>
      dashboardApi.markNotificationAsRead(id, read),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dashboard", "notifications"],
      });
    },
  });
}

// Widgets & Stats
export function useWidgetStats() {
  return useQuery({
    queryKey: ["dashboard", "widget-stats"],
    queryFn: dashboardApi.getWidgetStats,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useActivities() {
  return useQuery({
    queryKey: ["dashboard", "activities"],
    queryFn: dashboardApi.getActivities,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Comprehensive Dashboard
export function useRevenueMetrics(params?: { period?: string }) {
  return useQuery({
    queryKey: ["dashboard", "comprehensive", "revenue", params],
    queryFn: () => dashboardApi.comprehensive.getRevenue(params),
  });
}

export function useWarnings(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["dashboard", "comprehensive", "warnings", params],
    queryFn: () => dashboardApi.comprehensive.getWarnings(params),
  });
}

export function useUserWidgets(userId: string) {
  return useQuery({
    queryKey: ["dashboard", "comprehensive", "widgets", userId],
    queryFn: () => dashboardApi.comprehensive.getWidgets(userId),
    enabled: !!userId,
  });
}

export function useCreateWidget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (widget: Partial<DashboardWidget>) =>
      dashboardApi.comprehensive.createWidget(widget),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["dashboard", "comprehensive", "widgets", data.userId],
      });
    },
  });
}

export function useComprehensiveOverview() {
  return useQuery({
    queryKey: ["dashboard", "comprehensive", "overview"],
    queryFn: dashboardApi.comprehensive.getComprehensiveOverview,
    refetchInterval: 120000, // Refresh every 2 minutes
  });
}
```

### Component Examples

#### Task List Component

```tsx
// components/TaskList.tsx
import React from "react";
import {
  useDashboardTasks,
  useUpdateTask,
  useDeleteTask,
} from "@/hooks/useDashboard";
import type { DashboardTask } from "@/types/dashboard";

export const TaskList: React.FC<{ userId: string }> = ({ userId }) => {
  const { data, isLoading } = useDashboardTasks({ userId, limit: 10 });
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleToggleStatus = (task: DashboardTask) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    const completedAt =
      newStatus === "completed" ? new Date().toISOString() : undefined;
    updateTask.mutate({
      id: task.id,
      updates: { status: newStatus, completedAt },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(id);
    }
  };

  if (isLoading) return <div>Loading tasks...</div>;

  return (
    <div className="task-list">
      <h2>My Tasks</h2>
      {data?.data.map((task) => (
        <div key={task.id} className={`task-item priority-${task.priority}`}>
          <div className="task-header">
            <input
              type="checkbox"
              checked={task.status === "completed"}
              onChange={() => handleToggleStatus(task)}
            />
            <h3>{task.title}</h3>
            <span className={`status-badge ${task.status}`}>{task.status}</span>
            <span className={`priority-badge ${task.priority}`}>
              {task.priority}
            </span>
          </div>
          {task.description && <p>{task.description}</p>}
          {task.dueDate && (
            <div className="due-date">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
          <button onClick={() => handleDelete(task.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

#### Notification Center Component

```tsx
// components/NotificationCenter.tsx
import React from "react";
import {
  useDashboardNotifications,
  useMarkNotificationAsRead,
} from "@/hooks/useDashboard";

export const NotificationCenter: React.FC<{ userId: string }> = ({
  userId,
}) => {
  const { data, isLoading } = useDashboardNotifications({ userId, limit: 20 });
  const markAsRead = useMarkNotificationAsRead();

  const handleMarkAsRead = (id: string, read: boolean) => {
    markAsRead.mutate({ id, read });
  };

  const unreadCount = data?.data.filter((n) => !n.read).length || 0;

  if (isLoading) return <div>Loading notifications...</div>;

  return (
    <div className="notification-center">
      <div className="header">
        <h2>Notifications</h2>
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </div>
      <div className="notifications">
        {data?.data.map((notification) => (
          <div
            key={notification.id}
            className={`notification ${notification.type} ${notification.read ? "read" : "unread"}`}
            onClick={() =>
              !notification.read && handleMarkAsRead(notification.id, true)
            }
          >
            <div className="notification-header">
              <span className={`icon ${notification.type}`} />
              <h4>{notification.title}</h4>
              <span className="time">
                {new Date(notification.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <p>{notification.message}</p>
            {notification.actionUrl && (
              <a href={notification.actionUrl} className="action-link">
                {notification.actionLabel || "View"}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### Dashboard Overview Component

```tsx
// components/DashboardOverview.tsx
import React from "react";
import {
  useWidgetStats,
  useActivities,
  useSystemHealth,
} from "@/hooks/useDashboard";

export const DashboardOverview: React.FC = () => {
  const { data: stats } = useWidgetStats();
  const { data: activities } = useActivities();
  const { data: health } = useSystemHealth();

  return (
    <div className="dashboard-overview">
      <div className="stats-grid">
        <div className="stat-card sales">
          <h3>Sales Today</h3>
          <div className="value">
            €{stats?.data.sales.today.toLocaleString()}
          </div>
          <div className="trend">{stats?.data.sales.trend}</div>
        </div>
        <div className="stat-card orders">
          <h3>Orders</h3>
          <div className="value">{stats?.data.orders.total}</div>
          <div className="trend">{stats?.data.orders.trend}</div>
        </div>
        <div className="stat-card customers">
          <h3>Customers</h3>
          <div className="value">{stats?.data.customers.total}</div>
          <div className="trend">{stats?.data.customers.trend}</div>
        </div>
        <div className="stat-card finance">
          <h3>Profit</h3>
          <div className="value">
            €{stats?.data.finance.profit.toLocaleString()}
          </div>
          <div className="margin">Margin: {stats?.data.finance.margin}</div>
        </div>
      </div>

      <div className="activities-section">
        <h3>Recent Activities</h3>
        {activities?.data.map((activity) => (
          <div key={activity.id} className="activity-item">
            <span className={`icon ${activity.icon}`} />
            <div className="activity-content">
              <h4>{activity.title}</h4>
              <p>{activity.description}</p>
              <span className="timestamp">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="system-health">
        <h3>System Health</h3>
        <div className="health-status">
          <span className={`status ${health?.status}`}>{health?.status}</span>
          <div>Uptime: {Math.floor((health?.uptime || 0) / 3600)}h</div>
          <div>
            Memory: {health?.memory.free} / {health?.memory.total}
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### Warning Dashboard Component

```tsx
// components/WarningDashboard.tsx
import React, { useState } from "react";
import { useWarnings } from "@/hooks/useDashboard";

export const WarningDashboard: React.FC = () => {
  const [filter, setFilter] = useState({ severity: "", resolved: false });
  const { data, isLoading } = useWarnings(filter);

  const severityColors = {
    low: "blue",
    medium: "yellow",
    high: "orange",
    critical: "red",
  };

  if (isLoading) return <div>Loading warnings...</div>;

  return (
    <div className="warning-dashboard">
      <div className="filters">
        <select
          value={filter.severity}
          onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={filter.resolved}
            onChange={(e) =>
              setFilter({ ...filter, resolved: e.target.checked })
            }
          />
          Show Resolved
        </label>
      </div>

      <div className="warnings-list">
        {data?.data.map((warning) => (
          <div
            key={warning.id}
            className={`warning-card ${severityColors[warning.severity]}`}
          >
            <div className="warning-header">
              <span className={`severity-badge ${warning.severity}`}>
                {warning.severity}
              </span>
              <span className="type-badge">{warning.type}</span>
            </div>
            <h3>{warning.title}</h3>
            <p>{warning.message}</p>
            {warning.value !== undefined && warning.threshold !== undefined && (
              <div className="warning-metrics">
                <span>
                  Value: {warning.value} {warning.unit}
                </span>
                <span>
                  Threshold: {warning.threshold} {warning.unit}
                </span>
              </div>
            )}
            {warning.actionRequired && (
              <div className="action-required">
                <strong>Action Required:</strong> {warning.actionRequired}
              </div>
            )}
            {warning.resolvedAt && (
              <div className="resolved-info">
                Resolved: {new Date(warning.resolvedAt).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Best Practices

### Performance

- **Caching**: Use React Query's caching mechanism for frequently accessed data
- **Refresh Intervals**: Configure appropriate refresh intervals for real-time data
- **Pagination**: Use limit/offset for large datasets
- **Lazy Loading**: Load dashboard widgets on-demand
- **Optimization**: Index database tables for common query patterns

### Security

- **Authentication**: Verify user authentication before accessing dashboard data
- **Authorization**: Ensure users can only access their own tasks, notifications, and widgets
- **Input Validation**: Validate all inputs using Zod schemas
- **SQL Injection Prevention**: Use parameterized queries exclusively

### User Experience

- **Real-time Updates**: Use WebSocket or polling for critical metrics
- **Loading States**: Show appropriate loading indicators
- **Error Handling**: Display user-friendly error messages
- **Responsive Design**: Ensure dashboard works on all screen sizes
- **Customization**: Allow users to customize their dashboard layout and widgets

### Monitoring

- **System Health**: Monitor system resources and uptime
- **API Performance**: Track API response times
- **Error Rates**: Monitor error rates and types
- **User Activity**: Track dashboard usage patterns
- **Alerts**: Set up alerts for critical thresholds

## Version History

- **2.0** (2025-12-20): Complete modernization with TypeScript, Zod validation, comprehensive documentation
- **1.0** (2024): Initial implementation

---

**Module**: Dashboard  
**Path**: `apps/backend/src/routes/dashboard/`  
**Files**: dashboard.ts, comprehensive.ts, types.ts, README.md
