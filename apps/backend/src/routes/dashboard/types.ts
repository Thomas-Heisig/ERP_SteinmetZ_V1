// SPDX-License-Identifier: MIT
// apps/backend/src/routes/dashboard/types.ts

/**
 * TypeScript types and Zod validation schemas for Dashboard Module
 * 
 * @module routes/dashboard/types
 */

import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Widget types available in the dashboard
 */
export const WIDGET_TYPE = {
  CHART: "chart",
  STAT: "stat",
  TABLE: "table",
  LIST: "list",
  GAUGE: "gauge",
  MAP: "map",
  TIMELINE: "timeline",
  CUSTOM: "custom",
} as const;

/**
 * Widget data source types
 */
export const WIDGET_DATA_SOURCE = {
  REVENUE: "revenue",
  ORDERS: "orders",
  CUSTOMERS: "customers",
  INVENTORY: "inventory",
  PRODUCTION: "production",
  FINANCE: "finance",
  HR: "hr",
  TASKS: "tasks",
  NOTIFICATIONS: "notifications",
  CUSTOM: "custom",
} as const;

/**
 * Task status values
 */
export const TASK_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ON_HOLD: "on_hold",
} as const;

/**
 * Task priority levels
 */
export const TASK_PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
  CRITICAL: "critical",
} as const;

/**
 * Notification types
 */
export const NOTIFICATION_TYPE = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  SUCCESS: "success",
  ALERT: "alert",
} as const;

/**
 * KPI trend directions
 */
export const TREND_DIRECTION = {
  UP: "up",
  DOWN: "down",
  STABLE: "stable",
} as const;

/**
 * Warning severity levels
 */
export const WARNING_SEVERITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

/**
 * Warning types
 */
export const WARNING_TYPE = {
  LIQUIDITY: "liquidity",
  RECEIVABLES: "receivables",
  INVENTORY: "inventory",
  PRODUCTION: "production",
  QUALITY: "quality",
  DEADLINE: "deadline",
  BUDGET: "budget",
  COMPLIANCE: "compliance",
} as const;

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Dashboard Widget Configuration
 */
export interface DashboardWidget {
  id: string;
  userId: string;
  widgetType: typeof WIDGET_TYPE[keyof typeof WIDGET_TYPE];
  dataSource: typeof WIDGET_DATA_SOURCE[keyof typeof WIDGET_DATA_SOURCE];
  title: string;
  description?: string;
  position: number;
  width: number;
  height: number;
  refreshInterval?: number;
  config?: string; // JSON string
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dashboard Layout
 */
export interface DashboardLayout {
  id: string;
  userId: string;
  name: string;
  description?: string;
  layout: string; // JSON string with grid layout
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dashboard Favorite Item
 */
export interface DashboardFavorite {
  id: string;
  userId: string;
  itemType: string;
  itemId: string;
  title: string;
  url: string;
  icon?: string;
  position: number;
  createdAt: string;
}

/**
 * Dashboard Task
 */
export interface DashboardTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: typeof TASK_STATUS[keyof typeof TASK_STATUS];
  priority: typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
  dueDate?: string;
  completedAt?: string;
  assignedTo?: string;
  tags?: string; // JSON array
  relatedTo?: string;
  relatedType?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dashboard Notification
 */
export interface DashboardNotification {
  id: string;
  userId: string;
  type: typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE];
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: string; // JSON object
  createdAt: string;
  readAt?: string;
}

/**
 * Dashboard KPI Metric
 */
export interface DashboardKPI {
  id: string;
  name: string;
  category: string;
  value: number;
  unit?: string;
  trend?: typeof TREND_DIRECTION[keyof typeof TREND_DIRECTION];
  trendValue?: number;
  target?: number;
  description?: string;
  date: string;
  createdAt: string;
}

/**
 * Dashboard Warning/Alert
 */
export interface DashboardWarning {
  id: string;
  type: typeof WARNING_TYPE[keyof typeof WARNING_TYPE];
  severity: typeof WARNING_SEVERITY[keyof typeof WARNING_SEVERITY];
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

/**
 * Revenue Metrics
 */
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

/**
 * Top Customer
 */
export interface TopCustomer {
  customerId: string;
  customerName: string;
  revenue: number;
  orderCount: number;
  rank: number;
  period: string;
}

/**
 * Top Product
 */
export interface TopProduct {
  productId: string;
  productName: string;
  revenue: number;
  quantity: number;
  rank: number;
  period: string;
}

/**
 * Regional Revenue
 */
export interface RegionalRevenue {
  region: string;
  revenue: number;
  orderCount: number;
  customerCount: number;
  date: string;
}

/**
 * Profit Margin Data
 */
export interface ProfitMargin {
  date: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: number;
  operatingProfit: number;
  operatingMargin: number;
  netProfit: number;
  netMargin: number;
}

/**
 * Liquidity Status
 */
export interface LiquidityStatus {
  date: string;
  cashOnHand: number;
  accountsReceivable: number;
  accountsPayable: number;
  currentRatio: number;
  quickRatio: number;
  workingCapital: number;
  cashFlowOperating: number;
  cashFlowInvesting: number;
  cashFlowFinancing: number;
}

/**
 * Order Intake Statistics
 */
export interface OrderIntake {
  period: string;
  orderCount: number;
  orderValue: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

/**
 * Productivity Metrics
 */
export interface ProductivityMetrics {
  date: string;
  employeeCount: number;
  revenuePerEmployee: number;
  ordersPerEmployee: number;
  productionOutput: number;
  productionEfficiency: number;
  utilizationRate: number;
}

/**
 * Pipeline Stage Data
 */
export interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
  averageDuration: number;
}

/**
 * Procurement Metrics
 */
export interface ProcurementMetrics {
  date: string;
  purchaseOrders: number;
  totalSpend: number;
  averageProcessingTime: number;
  onTimeDelivery: number;
  supplierCount: number;
  costSavings: number;
}

/**
 * Production Utilization
 */
export interface ProductionUtilization {
  date: string;
  capacity: number;
  utilized: number;
  utilizationRate: number;
  downtime: number;
  efficiency: number;
  output: number;
}

/**
 * Service Level Agreement Metrics
 */
export interface SLAMetrics {
  date: string;
  totalTickets: number;
  resolvedTickets: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  slaCompliance: number;
  customerSatisfaction: number;
}

/**
 * Project Progress
 */
export interface ProjectProgress {
  projectId: string;
  projectName: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  tasksTotal: number;
  tasksCompleted: number;
  health: string;
}

/**
 * Comprehensive Dashboard Stats
 */
export interface DashboardStats {
  revenue: RevenueMetrics;
  margins: ProfitMargin;
  liquidity: LiquidityStatus;
  orders: OrderIntake;
  productivity: ProductivityMetrics;
  kpis: DashboardKPI[];
  warnings: DashboardWarning[];
  recentActivities: ActivityItem[];
}

/**
 * Activity Item for recent activities feed
 */
export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  icon?: string;
  url?: string;
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for creating a widget
 */
export const createWidgetSchema = z.object({
  userId: z.string().uuid(),
  widgetType: z.enum([
    WIDGET_TYPE.CHART,
    WIDGET_TYPE.STAT,
    WIDGET_TYPE.TABLE,
    WIDGET_TYPE.LIST,
    WIDGET_TYPE.GAUGE,
    WIDGET_TYPE.MAP,
    WIDGET_TYPE.TIMELINE,
    WIDGET_TYPE.CUSTOM,
  ]),
  dataSource: z.enum([
    WIDGET_DATA_SOURCE.REVENUE,
    WIDGET_DATA_SOURCE.ORDERS,
    WIDGET_DATA_SOURCE.CUSTOMERS,
    WIDGET_DATA_SOURCE.INVENTORY,
    WIDGET_DATA_SOURCE.PRODUCTION,
    WIDGET_DATA_SOURCE.FINANCE,
    WIDGET_DATA_SOURCE.HR,
    WIDGET_DATA_SOURCE.TASKS,
    WIDGET_DATA_SOURCE.NOTIFICATIONS,
    WIDGET_DATA_SOURCE.CUSTOM,
  ]),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  position: z.number().int().min(0),
  width: z.number().int().min(1).max(12),
  height: z.number().int().min(1).max(12),
  refreshInterval: z.number().int().min(0).optional(),
  config: z.string().optional(),
  isVisible: z.boolean().default(true),
});

/**
 * Schema for updating a widget
 */
export const updateWidgetSchema = z.object({
  widgetType: z.enum([
    WIDGET_TYPE.CHART,
    WIDGET_TYPE.STAT,
    WIDGET_TYPE.TABLE,
    WIDGET_TYPE.LIST,
    WIDGET_TYPE.GAUGE,
    WIDGET_TYPE.MAP,
    WIDGET_TYPE.TIMELINE,
    WIDGET_TYPE.CUSTOM,
  ]).optional(),
  dataSource: z.enum([
    WIDGET_DATA_SOURCE.REVENUE,
    WIDGET_DATA_SOURCE.ORDERS,
    WIDGET_DATA_SOURCE.CUSTOMERS,
    WIDGET_DATA_SOURCE.INVENTORY,
    WIDGET_DATA_SOURCE.PRODUCTION,
    WIDGET_DATA_SOURCE.FINANCE,
    WIDGET_DATA_SOURCE.HR,
    WIDGET_DATA_SOURCE.TASKS,
    WIDGET_DATA_SOURCE.NOTIFICATIONS,
    WIDGET_DATA_SOURCE.CUSTOM,
  ]).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  position: z.number().int().min(0).optional(),
  width: z.number().int().min(1).max(12).optional(),
  height: z.number().int().min(1).max(12).optional(),
  refreshInterval: z.number().int().min(0).optional(),
  config: z.string().optional(),
  isVisible: z.boolean().optional(),
});

/**
 * Schema for querying widgets
 */
export const queryWidgetSchema = z.object({
  userId: z.string().uuid().optional(),
  widgetType: z.string().optional(),
  dataSource: z.string().optional(),
  isVisible: z.string().optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

/**
 * Schema for creating a layout
 */
export const createLayoutSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  layout: z.string(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(false),
});

/**
 * Schema for updating a layout
 */
export const updateLayoutSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  layout: z.string().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Schema for creating a favorite
 */
export const createFavoriteSchema = z.object({
  userId: z.string().uuid(),
  itemType: z.string().min(1).max(50),
  itemId: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  url: z.string().min(1).max(500),
  icon: z.string().max(50).optional(),
  position: z.number().int().min(0),
});

/**
 * Schema for creating a task
 */
export const createTaskSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  status: z.enum([
    TASK_STATUS.PENDING,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.COMPLETED,
    TASK_STATUS.CANCELLED,
    TASK_STATUS.ON_HOLD,
  ]).default(TASK_STATUS.PENDING),
  priority: z.enum([
    TASK_PRIORITY.LOW,
    TASK_PRIORITY.NORMAL,
    TASK_PRIORITY.HIGH,
    TASK_PRIORITY.URGENT,
    TASK_PRIORITY.CRITICAL,
  ]).default(TASK_PRIORITY.NORMAL),
  dueDate: z.string().datetime().optional(),
  assignedTo: z.string().uuid().optional(),
  tags: z.string().optional(),
  relatedTo: z.string().optional(),
  relatedType: z.string().max(50).optional(),
});

/**
 * Schema for updating a task
 */
export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum([
    TASK_STATUS.PENDING,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.COMPLETED,
    TASK_STATUS.CANCELLED,
    TASK_STATUS.ON_HOLD,
  ]).optional(),
  priority: z.enum([
    TASK_PRIORITY.LOW,
    TASK_PRIORITY.NORMAL,
    TASK_PRIORITY.HIGH,
    TASK_PRIORITY.URGENT,
    TASK_PRIORITY.CRITICAL,
  ]).optional(),
  dueDate: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  assignedTo: z.string().uuid().optional(),
  tags: z.string().optional(),
  relatedTo: z.string().optional(),
  relatedType: z.string().max(50).optional(),
});

/**
 * Schema for querying tasks
 */
export const queryTaskSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  userId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
  dueBefore: z.string().optional(),
  dueAfter: z.string().optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

/**
 * Schema for creating a notification
 */
export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum([
    NOTIFICATION_TYPE.INFO,
    NOTIFICATION_TYPE.WARNING,
    NOTIFICATION_TYPE.ERROR,
    NOTIFICATION_TYPE.SUCCESS,
    NOTIFICATION_TYPE.ALERT,
  ]),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  read: z.boolean().default(false),
  actionUrl: z.string().max(500).optional(),
  actionLabel: z.string().max(100).optional(),
  metadata: z.string().optional(),
});

/**
 * Schema for updating a notification
 */
export const updateNotificationSchema = z.object({
  read: z.boolean(),
});

/**
 * Schema for querying notifications
 */
export const queryNotificationSchema = z.object({
  userId: z.string().uuid().optional(),
  type: z.string().optional(),
  read: z.string().optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

/**
 * Schema for creating a warning
 */
export const createWarningSchema = z.object({
  type: z.enum([
    WARNING_TYPE.LIQUIDITY,
    WARNING_TYPE.RECEIVABLES,
    WARNING_TYPE.INVENTORY,
    WARNING_TYPE.PRODUCTION,
    WARNING_TYPE.QUALITY,
    WARNING_TYPE.DEADLINE,
    WARNING_TYPE.BUDGET,
    WARNING_TYPE.COMPLIANCE,
  ]),
  severity: z.enum([
    WARNING_SEVERITY.LOW,
    WARNING_SEVERITY.MEDIUM,
    WARNING_SEVERITY.HIGH,
    WARNING_SEVERITY.CRITICAL,
  ]),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  value: z.number().optional(),
  threshold: z.number().optional(),
  unit: z.string().max(50).optional(),
  affectedEntity: z.string().max(100).optional(),
  affectedId: z.string().max(100).optional(),
  actionRequired: z.string().max(500).optional(),
});

/**
 * Schema for updating a warning
 */
export const updateWarningSchema = z.object({
  acknowledgedBy: z.string().uuid().optional(),
  resolvedBy: z.string().uuid().optional(),
});

/**
 * Schema for querying warnings
 */
export const queryWarningSchema = z.object({
  type: z.string().optional(),
  severity: z.string().optional(),
  acknowledged: z.string().optional(),
  resolved: z.string().optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for widget type validation
 */
export function isValidWidgetType(
  type: unknown
): type is typeof WIDGET_TYPE[keyof typeof WIDGET_TYPE] {
  return (
    typeof type === "string" &&
    Object.values(WIDGET_TYPE).includes(
      type as typeof WIDGET_TYPE[keyof typeof WIDGET_TYPE]
    )
  );
}

/**
 * Type guard for data source validation
 */
export function isValidDataSource(
  source: unknown
): source is typeof WIDGET_DATA_SOURCE[keyof typeof WIDGET_DATA_SOURCE] {
  return (
    typeof source === "string" &&
    Object.values(WIDGET_DATA_SOURCE).includes(
      source as typeof WIDGET_DATA_SOURCE[keyof typeof WIDGET_DATA_SOURCE]
    )
  );
}

/**
 * Type guard for task status validation
 */
export function isValidTaskStatus(
  status: unknown
): status is typeof TASK_STATUS[keyof typeof TASK_STATUS] {
  return (
    typeof status === "string" &&
    Object.values(TASK_STATUS).includes(
      status as typeof TASK_STATUS[keyof typeof TASK_STATUS]
    )
  );
}

/**
 * Type guard for task priority validation
 */
export function isValidTaskPriority(
  priority: unknown
): priority is typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY] {
  return (
    typeof priority === "string" &&
    Object.values(TASK_PRIORITY).includes(
      priority as typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY]
    )
  );
}

/**
 * Type guard for notification type validation
 */
export function isValidNotificationType(
  type: unknown
): type is typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE] {
  return (
    typeof type === "string" &&
    Object.values(NOTIFICATION_TYPE).includes(
      type as typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE]
    )
  );
}

/**
 * Type guard for warning type validation
 */
export function isValidWarningType(
  type: unknown
): type is typeof WARNING_TYPE[keyof typeof WARNING_TYPE] {
  return (
    typeof type === "string" &&
    Object.values(WARNING_TYPE).includes(
      type as typeof WARNING_TYPE[keyof typeof WARNING_TYPE]
    )
  );
}

/**
 * Type guard for warning severity validation
 */
export function isValidWarningSeverity(
  severity: unknown
): severity is typeof WARNING_SEVERITY[keyof typeof WARNING_SEVERITY] {
  return (
    typeof severity === "string" &&
    Object.values(WARNING_SEVERITY).includes(
      severity as typeof WARNING_SEVERITY[keyof typeof WARNING_SEVERITY]
    )
  );
}
