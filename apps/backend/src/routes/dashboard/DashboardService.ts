// SPDX-License-Identifier: MIT
// apps/backend/src/routes/dashboard/DashboardService.ts

/**
 * Dashboard Service
 *
 * Centralized business logic for all dashboard operations including:
 * - System health monitoring
 * - KPI tracking and analytics
 * - Task management
 * - Notification system
 * - Widget configuration
 * - Layout management
 * - Executive metrics
 * - Process monitoring
 *
 * @module routes/dashboard/DashboardService
 *
 * @example
 * ```typescript
 * const service = DashboardService.getInstance();
 * await service.initialize();
 *
 * // Get paginated tasks
 * const tasks = await service.getTasks({
 *   userId: '123',
 *   status: 'pending',
 *   limit: 20,
 *   offset: 0
 * });
 *
 * // Create notification
 * await service.createNotification({
 *   userId: '123',
 *   type: 'info',
 *   title: 'Update Available',
 *   message: 'New features released'
 * });
 * ```
 */

import { randomUUID } from "node:crypto";
import os from "node:os";
import { createLogger } from "../../utils/logger.js";
import DatabaseManager from "../database/DatabaseManager.js";
import { NotFoundError } from "../error/errors.js";
import {
  createPaginatedResult,
  buildWhereClause,
  buildSelectQuery,
  formatDatabaseError,
  retryOperation,
  type PaginationOptions,
  type PaginatedResult,
} from "../database/utils.js";
import type {
  DashboardTask,
  DashboardNotification,
  DashboardKPI,
  DashboardWidget,
  DashboardLayout,
  DashboardFavorite,
} from "./types.js";

const logger = createLogger("dashboard-service");

/**
 * System Health Status
 */
export interface SystemHealth {
  status: "healthy" | "degraded" | "unhealthy";
  uptime: number;
  hostname: string;
  platform: string;
  nodeVersion: string;
  memory: {
    used: string;
    total: string;
    percentage: number;
  };
  loadAvg: number[];
  timestamp: string;
}

/**
 * Dashboard Overview Data
 */
export interface DashboardOverview {
  system: {
    status: string;
    uptime: number;
    version: string;
    environment: string;
  };
  ai: {
    annotatorStatus: string;
    quickchatStatus: string;
    activeProviders: string[];
    totalAnnotations: number;
  };
  erp: {
    activeUsers: number;
    openTasks: number;
    pendingOrders: number;
    totalRevenue: number;
  };
  timestamp: string;
}

/**
 * Task Query Filters
 */
export interface TaskQueryFilters extends PaginationOptions {
  userId?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dueBefore?: string;
  dueAfter?: string;
  tags?: string;
  relatedTo?: string;
  relatedType?: string;
}

/**
 * Notification Query Filters
 */
export interface NotificationQueryFilters extends PaginationOptions {
  userId?: string;
  read?: boolean;
  type?: string;
  createdAfter?: string;
  createdBefore?: string;
}

/**
 * Widget Query Filters
 */
export interface WidgetQueryFilters extends PaginationOptions {
  userId?: string;
  widgetType?: string;
  dataSource?: string;
  isVisible?: boolean;
}

/**
 * Create Task Input
 */
export interface CreateTaskInput {
  userId: string;
  title: string;
  description?: string;
  status?: DashboardTask["status"];
  priority?: DashboardTask["priority"];
  dueDate?: string;
  assignedTo?: string;
  tags?: string;
  relatedTo?: string;
  relatedType?: string;
}

/**
 * Update Task Input
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: DashboardTask["status"];
  priority?: DashboardTask["priority"];
  dueDate?: string;
  completedAt?: string;
  assignedTo?: string;
  tags?: string;
  relatedTo?: string;
  relatedType?: string;
}

/**
 * Create Notification Input
 */
export interface CreateNotificationInput {
  userId: string;
  type: DashboardNotification["type"];
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: string;
}

/**
 * Update Notification Input
 */
export interface UpdateNotificationInput {
  read?: boolean;
  readAt?: string;
}

/**
 * Create Widget Input
 */
export interface CreateWidgetInput {
  userId: string;
  widgetType: DashboardWidget["widgetType"];
  dataSource: DashboardWidget["dataSource"];
  title: string;
  description?: string;
  position?: number;
  width?: number;
  height?: number;
  refreshInterval?: number;
  config?: string;
  isVisible?: boolean;
}

/**
 * Update Widget Input
 */
export interface UpdateWidgetInput {
  title?: string;
  description?: string;
  position?: number;
  width?: number;
  height?: number;
  refreshInterval?: number;
  config?: string;
  isVisible?: boolean;
}

/**
 * Dashboard Service - Singleton
 *
 * Provides centralized dashboard operations with:
 * - Lazy initialization
 * - Database connection management
 * - Error handling and retry logic
 * - Pagination and filtering
 * - Analytics and metrics
 */
export class DashboardService {
  private static instance: DashboardService;
  private dbManager: typeof DatabaseManager;
  private initialized = false;

  private constructor() {
    this.dbManager = DatabaseManager;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  /**
   * Initialize service and verify database tables
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await this.dbManager.initialize();

      // Verify required tables exist
      const tables = await this.dbManager.query<{ name: string }>(
        `SELECT name FROM sqlite_master 
         WHERE type='table' 
         AND name IN (
           'dashboard_kpis', 
           'dashboard_tasks', 
           'dashboard_notifications',
           'dashboard_widgets',
           'dashboard_layouts',
           'dashboard_favorites'
         )`,
      );

      const tableNames = tables.map((t) => t.name);
      const requiredTables = [
        "dashboard_kpis",
        "dashboard_tasks",
        "dashboard_notifications",
      ];
      const missingTables = requiredTables.filter(
        (t) => !tableNames.includes(t),
      );

      if (missingTables.length > 0) {
        logger.warn(
          { missingTables },
          "Dashboard tables not found - migrations may not have run",
        );
      } else {
        logger.info("Dashboard service initialized successfully");
      }

      this.initialized = true;
    } catch (error) {
      logger.error({ error }, "Failed to initialize dashboard service");
      throw formatDatabaseError(error);
    }
  }

  // ==========================================================================
  // SYSTEM HEALTH & OVERVIEW
  // ==========================================================================

  /**
   * Get system health status
   */
  public async getSystemHealth(): Promise<SystemHealth> {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercentage = Math.round((usedMem / totalMem) * 100);

    return {
      status: memPercentage > 90 ? "degraded" : "healthy",
      uptime: process.uptime(),
      hostname: os.hostname(),
      platform: os.platform(),
      nodeVersion: process.version,
      memory: {
        used: Math.round(usedMem / 1024 / 1024) + " MB",
        total: Math.round(totalMem / 1024 / 1024) + " MB",
        percentage: memPercentage,
      },
      loadAvg: os.loadavg(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get dashboard overview with system, AI, and ERP stats
   */
  public async getDashboardOverview(): Promise<DashboardOverview> {
    await this.initialize();

    const [taskCount, annotationCount] = await Promise.all([
      this.dbManager
        .queryOne<{
          count: number;
        }>(
          "SELECT COUNT(*) as count FROM dashboard_tasks WHERE status != 'completed'",
        )
        .then((r) => r?.count ?? 0),
      this.dbManager
        .queryOne<{
          count: number;
        }>("SELECT COUNT(*) as count FROM annotations")
        .then((r) => r?.count ?? 0),
    ]);

    return {
      system: {
        status: "running",
        uptime: Math.round(process.uptime()),
        version: process.env.APP_VERSION || "1.0.0",
        environment: process.env.NODE_ENV || "development",
      },
      ai: {
        annotatorStatus: "active",
        quickchatStatus: "active",
        activeProviders: ["OpenAI", "Anthropic"],
        totalAnnotations: annotationCount,
      },
      erp: {
        activeUsers: 5,
        openTasks: taskCount,
        pendingOrders: 12,
        totalRevenue: 1250000,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // ==========================================================================
  // KPI MANAGEMENT
  // ==========================================================================

  /**
   * Get KPIs with optional filtering
   */
  public async getKPIs(filters: {
    category?: string;
    days?: number;
  }): Promise<DashboardKPI[]> {
    await this.initialize();

    const days = filters.days || 7;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const wc = buildWhereClause({ category: filters.category });
    const whereParts = [wc.where].filter(Boolean);
    whereParts.push(wc.where ? "AND date >= ?" : "WHERE date >= ?");
    const params = [...wc.params, dateLimit.toISOString().split("T")[0]];

    const sql = buildSelectQuery(
      "dashboard_kpis",
      whereParts.join(" "),
      100,
      0,
      "ORDER BY date DESC, category ASC",
    );

    const rows = await this.dbManager.query<DashboardKPI>(sql, params);
    return rows;
  }

  /**
   * Create new KPI entry
   */
  public async createKPI(data: {
    category: string;
    name: string;
    value: number;
    unit?: string;
    target?: number;
    date?: string;
  }): Promise<DashboardKPI> {
    await this.initialize();

    const kpi: DashboardKPI = {
      id: randomUUID(),
      category: data.category,
      name: data.name,
      value: data.value,
      unit: data.unit,
      target: data.target,
      trend: undefined,
      // optional fields can be updated by analytics jobs later
      date: data.date || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };

    return await retryOperation(async () => {
      await this.dbManager.execute(
        `INSERT INTO dashboard_kpis 
         (id, category, name, value, unit, target, date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          kpi.id,
          kpi.category,
          kpi.name,
          kpi.value,
          kpi.unit,
          kpi.target,
          kpi.date,
          kpi.createdAt,
        ],
      );
      return kpi;
    });
  }

  // ==========================================================================
  // TASK MANAGEMENT
  // ==========================================================================

  /**
   * Get tasks with pagination and filtering
   */
  public async getTasks(
    filters: TaskQueryFilters,
  ): Promise<PaginatedResult<DashboardTask>> {
    await this.initialize();

    const limit = Math.max(1, Number(filters.limit ?? 50));
    const offset = Math.max(0, Number(filters.offset ?? 0));
    const page = Math.floor(offset / limit) + 1;

    const baseFilters: Record<string, unknown> = {};
    if (filters.userId) baseFilters.user_id = filters.userId;
    if (filters.status) baseFilters.status = filters.status;
    if (filters.priority) baseFilters.priority = filters.priority;
    if (filters.assignedTo) baseFilters.assigned_to = filters.assignedTo;
    if (filters.relatedTo) baseFilters.related_to = filters.relatedTo;
    if (filters.relatedType) baseFilters.related_type = filters.relatedType;

    const wc = buildWhereClause(baseFilters);
    const whereParts = [wc.where].filter(Boolean);
    const params = [...wc.params];
    if (filters.tags) {
      whereParts.push(wc.where ? "AND tags LIKE ?" : "WHERE tags LIKE ?");
      params.push(`%${filters.tags}%`);
    }
    if (filters.dueBefore) {
      whereParts.push(wc.where ? "AND due_date <= ?" : "WHERE due_date <= ?");
      params.push(filters.dueBefore);
    }
    if (filters.dueAfter) {
      whereParts.push(wc.where ? "AND due_date >= ?" : "WHERE due_date >= ?");
      params.push(filters.dueAfter);
    }

    const orderBy = "ORDER BY priority DESC, due_date ASC";

    const countSql = `SELECT COUNT(*) as count FROM dashboard_tasks ${whereParts.join(" ")}`;
    const totalRow = await this.dbManager.queryOne<{ count: number }>(
      countSql,
      params,
    );
    const total = totalRow?.count ?? 0;

    const dataSql = buildSelectQuery(
      "dashboard_tasks",
      whereParts.join(" "),
      limit,
      offset,
      orderBy,
    );

    const rows = await this.dbManager.query<Record<string, unknown>>(
      dataSql,
      params,
    );
    const data = rows.map(this.rowToTask);

    return createPaginatedResult(data, total, page, limit);
  }

  /**
   * Get single task by ID
   */
  public async getTaskById(id: string): Promise<DashboardTask> {
    await this.initialize();

    const task = await this.dbManager.queryOne<Record<string, unknown>>(
      "SELECT * FROM dashboard_tasks WHERE id = ?",
      [id],
    );

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    return this.rowToTask(task);
  }

  /**
   * Create new task
   */
  public async createTask(data: CreateTaskInput): Promise<DashboardTask> {
    await this.initialize();

    const task: DashboardTask = {
      id: randomUUID(),
      userId: data.userId,
      title: data.title,
      description: data.description,
      status: data.status || "pending",
      priority: data.priority || "normal",
      dueDate: data.dueDate,
      completedAt: undefined,
      assignedTo: data.assignedTo,
      tags: data.tags,
      relatedTo: data.relatedTo,
      relatedType: data.relatedType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await retryOperation(async () => {
      await this.dbManager.execute(
        `INSERT INTO dashboard_tasks 
         (id, user_id, title, description, status, priority, due_date, 
          assigned_to, tags, related_to, related_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task.id,
          task.userId,
          task.title,
          task.description,
          task.status,
          task.priority,
          task.dueDate,
          task.assignedTo,
          task.tags,
          task.relatedTo,
          task.relatedType,
          task.createdAt,
          task.updatedAt,
        ],
      );
      return task;
    });
  }

  /**
   * Update existing task
   */
  public async updateTask(
    id: string,
    data: UpdateTaskInput,
  ): Promise<DashboardTask> {
    await this.initialize();

    const existing = await this.getTaskById(id);

    const updated: DashboardTask = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // Auto-set completed_at when status changes to completed
    if (data.status === "completed" && !data.completedAt) {
      updated.completedAt = new Date().toISOString();
    }

    return await retryOperation(async () => {
      await this.dbManager.execute(
        `UPDATE dashboard_tasks 
         SET title = ?, description = ?, status = ?, priority = ?, 
             due_date = ?, completed_at = ?, assigned_to = ?, tags = ?,
             related_to = ?, related_type = ?, updated_at = ?
         WHERE id = ?`,
        [
          updated.title,
          updated.description,
          updated.status,
          updated.priority,
          updated.dueDate,
          updated.completedAt,
          updated.assignedTo,
          updated.tags,
          updated.relatedTo,
          updated.relatedType,
          updated.updatedAt,
          id,
        ],
      );
      return updated;
    });
  }

  /**
   * Delete task
   */
  public async deleteTask(id: string): Promise<void> {
    await this.initialize();

    await retryOperation(async () => {
      const result = await this.dbManager.execute(
        "DELETE FROM dashboard_tasks WHERE id = ?",
        [id],
      );
      if (!result.changes || result.changes === 0) {
        throw new NotFoundError("Task not found");
      }
    });
  }

  // ==========================================================================
  // NOTIFICATION MANAGEMENT
  // ==========================================================================

  /**
   * Get notifications with pagination and filtering
   */
  public async getNotifications(
    filters: NotificationQueryFilters,
  ): Promise<PaginatedResult<DashboardNotification>> {
    await this.initialize();

    const limit = Math.max(1, Number(filters.limit ?? 50));
    const offset = Math.max(0, Number(filters.offset ?? 0));
    const page = Math.floor(offset / limit) + 1;
    const whereConditions: Record<string, unknown> = {};

    if (filters.userId) whereConditions.user_id = filters.userId;
    if (filters.read !== undefined) whereConditions.read = filters.read ? 1 : 0;
    if (filters.type) whereConditions.type = filters.type;
    if (filters.createdAfter)
      whereConditions["created_at >="] = filters.createdAfter;
    if (filters.createdBefore)
      whereConditions["created_at <="] = filters.createdBefore;

    const wc = buildWhereClause(whereConditions);
    const where = wc.where;
    const params = wc.params;
    const orderBy = "ORDER BY created_at DESC";

    // Get total count
    const countSql = `SELECT COUNT(*) as count FROM dashboard_notifications ${where}`;
    const totalRow = await this.dbManager.queryOne<{ count: number }>(
      countSql,
      params,
    );
    const total = totalRow?.count ?? 0;

    // Get paginated data
    const dataSql = buildSelectQuery(
      "dashboard_notifications",
      where,
      limit,
      offset,
      orderBy,
    );

    const rows = await this.dbManager.query<Record<string, unknown>>(
      dataSql,
      params,
    );
    const data = rows.map(this.rowToNotification);

    return createPaginatedResult(data, total, page, limit);
  }

  /**
   * Get single notification by ID
   */
  public async getNotificationById(id: string): Promise<DashboardNotification> {
    await this.initialize();

    const notification = await this.dbManager.queryOne<Record<string, unknown>>(
      "SELECT * FROM dashboard_notifications WHERE id = ?",
      [id],
    );

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    return this.rowToNotification(notification);
  }

  /**
   * Create new notification
   */
  public async createNotification(
    data: CreateNotificationInput,
  ): Promise<DashboardNotification> {
    await this.initialize();

    const notification: DashboardNotification = {
      id: randomUUID(),
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      read: false,
      actionUrl: data.actionUrl,
      actionLabel: data.actionLabel,
      metadata: data.metadata,
      createdAt: new Date().toISOString(),
      readAt: undefined,
    };

    return await retryOperation(async () => {
      await this.dbManager.execute(
        `INSERT INTO dashboard_notifications 
         (id, user_id, type, title, message, read, action_url, 
          action_label, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          notification.id,
          notification.userId,
          notification.type,
          notification.title,
          notification.message,
          notification.read ? 1 : 0,
          notification.actionUrl,
          notification.actionLabel,
          notification.metadata,
          notification.createdAt,
        ],
      );
      return notification;
    });
  }

  /**
   * Update notification (mark as read/unread)
   */
  public async updateNotification(
    id: string,
    data: UpdateNotificationInput,
  ): Promise<DashboardNotification> {
    await this.initialize();

    const existing = await this.getNotificationById(id);

    const updated: DashboardNotification = {
      ...existing,
      read: data.read ?? existing.read,
      readAt:
        data.readAt ||
        (data.read && !existing.read
          ? new Date().toISOString()
          : existing.readAt),
    };

    return await retryOperation(async () => {
      await this.dbManager.execute(
        `UPDATE dashboard_notifications 
         SET read = ?, read_at = ?
         WHERE id = ?`,
        [updated.read ? 1 : 0, updated.readAt, id],
      );
      return updated;
    });
  }

  /**
   * Delete notification
   */
  public async deleteNotification(id: string): Promise<void> {
    await this.initialize();

    await retryOperation(async () => {
      const result = await this.dbManager.execute(
        "DELETE FROM dashboard_notifications WHERE id = ?",
        [id],
      );
      if (!result.changes || result.changes === 0) {
        throw new NotFoundError("Notification not found");
      }
    });
  }

  // ==========================================================================
  // WIDGETS MANAGEMENT
  // ==========================================================================

  /**
   * Get widgets with pagination and filtering
   */
  public async getWidgets(
    filters: WidgetQueryFilters,
  ): Promise<PaginatedResult<DashboardWidget>> {
    await this.initialize();

    const limit = Math.max(1, Number(filters.limit ?? 50));
    const offset = Math.max(0, Number(filters.offset ?? 0));
    const page = Math.floor(offset / limit) + 1;
    const whereConditions: Record<string, unknown> = {};

    if (filters.userId) whereConditions.user_id = filters.userId;
    if (filters.widgetType) whereConditions.widget_type = filters.widgetType;
    if (filters.dataSource) whereConditions.data_source = filters.dataSource;
    if (filters.isVisible !== undefined)
      whereConditions.is_visible = filters.isVisible ? 1 : 0;

    const wc = buildWhereClause(whereConditions);
    const where = wc.where;
    const params = wc.params;
    const orderBy = "ORDER BY position ASC, updated_at DESC";

    const countSql = `SELECT COUNT(*) as count FROM dashboard_widgets ${where}`;
    const totalRow = await this.dbManager.queryOne<{ count: number }>(
      countSql,
      params,
    );
    const total = totalRow?.count ?? 0;

    const dataSql = buildSelectQuery(
      "dashboard_widgets",
      where,
      limit,
      offset,
      orderBy,
    );

    const rows = await this.dbManager.query<Record<string, unknown>>(
      dataSql,
      params,
    );
    const data = rows.map(this.rowToWidget);

    return createPaginatedResult(data, total, page, limit);
  }

  /**
   * Create a new widget
   */
  public async createWidget(data: CreateWidgetInput): Promise<DashboardWidget> {
    await this.initialize();

    const widget: DashboardWidget = {
      id: randomUUID(),
      userId: data.userId,
      widgetType: data.widgetType,
      dataSource: data.dataSource,
      title: data.title,
      description: data.description,
      position: data.position ?? 0,
      width: data.width ?? 4,
      height: data.height ?? 4,
      refreshInterval: data.refreshInterval,
      config: data.config,
      isVisible: data.isVisible ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await retryOperation(async () => {
      await this.dbManager.execute(
        `INSERT INTO dashboard_widgets 
         (id, user_id, widget_type, data_source, title, description, position, width, height, 
          refresh_interval, config, is_visible, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          widget.id,
          widget.userId,
          widget.widgetType,
          widget.dataSource,
          widget.title,
          widget.description,
          widget.position,
          widget.width,
          widget.height,
          widget.refreshInterval,
          widget.config,
          widget.isVisible ? 1 : 0,
          widget.createdAt,
          widget.updatedAt,
        ],
      );
      return widget;
    });
  }

  /**
   * Update a widget
   */
  public async updateWidget(
    id: string,
    data: UpdateWidgetInput,
  ): Promise<DashboardWidget> {
    await this.initialize();

    const existing = await this.dbManager.queryOne<Record<string, unknown>>(
      "SELECT * FROM dashboard_widgets WHERE id = ?",
      [id],
    );
    if (!existing) throw new NotFoundError("Widget not found");

    const updated: DashboardWidget = {
      ...this.rowToWidget(existing),
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await retryOperation(async () => {
      const result = await this.dbManager.execute(
        `UPDATE dashboard_widgets 
         SET title = ?, description = ?, position = ?, width = ?, height = ?, 
             refresh_interval = ?, config = ?, is_visible = ?, updated_at = ?
         WHERE id = ?`,
        [
          updated.title,
          updated.description,
          updated.position,
          updated.width,
          updated.height,
          updated.refreshInterval,
          updated.config,
          updated.isVisible ? 1 : 0,
          updated.updatedAt,
          id,
        ],
      );
      if (!result.changes) throw new NotFoundError("Widget not found");
    });

    return updated;
  }

  /**
   * Delete a widget
   */
  public async deleteWidget(id: string): Promise<void> {
    await this.initialize();
    await retryOperation(async () => {
      const result = await this.dbManager.execute(
        "DELETE FROM dashboard_widgets WHERE id = ?",
        [id],
      );
      if (!result.changes) throw new NotFoundError("Widget not found");
    });
  }

  // ==========================================================================
  // LAYOUTS MANAGEMENT
  // ==========================================================================

  /**
   * Get layouts for a user
   */
  public async getLayouts(userId: string): Promise<DashboardLayout[]> {
    await this.initialize();
    const rows = await this.dbManager.query<Record<string, unknown>>(
      "SELECT * FROM dashboard_layouts WHERE user_id = ? ORDER BY is_active DESC, is_default DESC, updated_at DESC",
      [userId],
    );
    return rows.map(this.rowToLayout);
  }

  /**
   * Create a new layout
   */
  public async createLayout(data: {
    userId: string;
    name: string;
    description?: string;
    layout: string;
    isDefault?: boolean;
    isActive?: boolean;
  }): Promise<DashboardLayout> {
    await this.initialize();

    const layout: DashboardLayout = {
      id: randomUUID(),
      userId: data.userId,
      name: data.name,
      description: data.description,
      layout: data.layout,
      isDefault: data.isDefault ?? false,
      isActive: data.isActive ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await retryOperation(async () => {
      await this.dbManager.execute(
        `INSERT INTO dashboard_layouts 
         (id, user_id, name, description, layout, is_default, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          layout.id,
          layout.userId,
          layout.name,
          layout.description,
          layout.layout,
          layout.isDefault ? 1 : 0,
          layout.isActive ? 1 : 0,
          layout.createdAt,
          layout.updatedAt,
        ],
      );
    });

    return layout;
  }

  /**
   * Update an existing layout
   */
  public async updateLayout(
    id: string,
    data: Partial<Omit<DashboardLayout, "id" | "userId" | "createdAt">>,
  ): Promise<DashboardLayout> {
    await this.initialize();

    const existing = await this.dbManager.queryOne<Record<string, unknown>>(
      "SELECT * FROM dashboard_layouts WHERE id = ?",
      [id],
    );
    if (!existing) throw new NotFoundError("Layout not found");

    const updated: DashboardLayout = {
      ...this.rowToLayout(existing),
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await retryOperation(async () => {
      const result = await this.dbManager.execute(
        `UPDATE dashboard_layouts 
         SET name = ?, description = ?, layout = ?, is_default = ?, is_active = ?, updated_at = ?
         WHERE id = ?`,
        [
          updated.name,
          updated.description,
          updated.layout,
          updated.isDefault ? 1 : 0,
          updated.isActive ? 1 : 0,
          updated.updatedAt,
          id,
        ],
      );
      if (!result.changes) throw new NotFoundError("Layout not found");
    });

    return updated;
  }

  /**
   * Delete a layout
   */
  public async deleteLayout(id: string): Promise<void> {
    await this.initialize();
    await retryOperation(async () => {
      const result = await this.dbManager.execute(
        "DELETE FROM dashboard_layouts WHERE id = ?",
        [id],
      );
      if (!result.changes) throw new NotFoundError("Layout not found");
    });
  }

  // ==========================================================================
  // FAVORITES MANAGEMENT
  // ==========================================================================

  /**
   * Get favorites for a user
   */
  public async getFavorites(userId: string): Promise<DashboardFavorite[]> {
    await this.initialize();
    const rows = await this.dbManager.query<Record<string, unknown>>(
      "SELECT * FROM dashboard_favorites WHERE user_id = ? ORDER BY position ASC, created_at DESC",
      [userId],
    );
    return rows.map(this.rowToFavorite);
  }

  /**
   * Add a new favorite
   */
  public async addFavorite(data: {
    userId: string;
    itemType: DashboardFavorite["itemType"];
    itemId: string;
    title: string;
    url: string;
    icon?: string;
    position?: number;
  }): Promise<DashboardFavorite> {
    await this.initialize();

    const favorite: DashboardFavorite = {
      id: randomUUID(),
      userId: data.userId,
      itemType: data.itemType,
      itemId: data.itemId,
      title: data.title,
      url: data.url,
      icon: data.icon,
      position: data.position ?? 0,
      createdAt: new Date().toISOString(),
    };

    await retryOperation(async () => {
      await this.dbManager.execute(
        `INSERT INTO dashboard_favorites 
         (id, user_id, item_type, item_id, title, url, icon, position, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          favorite.id,
          favorite.userId,
          favorite.itemType,
          favorite.itemId,
          favorite.title,
          favorite.url,
          favorite.icon,
          favorite.position,
          favorite.createdAt,
        ],
      );
    });

    return favorite;
  }

  /**
   * Delete a favorite
   */
  public async deleteFavorite(id: string): Promise<void> {
    await this.initialize();
    await retryOperation(async () => {
      const result = await this.dbManager.execute(
        "DELETE FROM dashboard_favorites WHERE id = ?",
        [id],
      );
      if (!result.changes) throw new NotFoundError("Favorite not found");
    });
  }

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  private rowToTask(row: Record<string, unknown>): DashboardTask {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      title: row.title as string,
      description: row.description as string | undefined,
      status: row.status as DashboardTask["status"],
      priority: row.priority as DashboardTask["priority"],
      dueDate: row.due_date as string | undefined,
      completedAt: row.completed_at as string | undefined,
      assignedTo: row.assigned_to as string | undefined,
      tags: row.tags as string | undefined,
      relatedTo: row.related_to as string | undefined,
      relatedType: row.related_type as string | undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private rowToNotification(
    row: Record<string, unknown>,
  ): DashboardNotification {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      type: row.type as DashboardNotification["type"],
      title: row.title as string,
      message: row.message as string,
      read: Boolean(row.read),
      actionUrl: row.action_url as string | undefined,
      actionLabel: row.action_label as string | undefined,
      metadata: row.metadata as string | undefined,
      createdAt: row.created_at as string,
      readAt: row.read_at as string | undefined,
    };
  }

  private rowToWidget(row: Record<string, unknown>): DashboardWidget {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      widgetType: row.widget_type as DashboardWidget["widgetType"],
      dataSource: row.data_source as DashboardWidget["dataSource"],
      title: row.title as string,
      description: row.description as string | undefined,
      position: (row.position as number) ?? 0,
      width: (row.width as number) ?? 4,
      height: (row.height as number) ?? 4,
      refreshInterval: row.refresh_interval as number | undefined,
      config: row.config as string | undefined,
      isVisible: Boolean(row.is_visible),
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private rowToLayout(row: Record<string, unknown>): DashboardLayout {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      name: row.name as string,
      description: row.description as string | undefined,
      layout: row.layout as string,
      isDefault: Boolean(row.is_default),
      isActive: Boolean(row.is_active),
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private rowToFavorite(row: Record<string, unknown>): DashboardFavorite {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      itemType: row.item_type as DashboardFavorite["itemType"],
      itemId: row.item_id as string,
      title: row.title as string,
      url: row.url as string,
      icon: row.icon as string | undefined,
      position: (row.position as number) ?? 0,
      createdAt: row.created_at as string,
    };
  }
}

export default DashboardService.getInstance();
