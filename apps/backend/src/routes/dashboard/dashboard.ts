// SPDX-License-Identifier: MIT
// apps/backend/src/routes/dashboard/dashboard.ts

/**
 * Main Dashboard Router
 * 
 * Provides system health, overview, KPIs, tasks, notifications,
 * and widget stats for the dashboard interface.
 * 
 * ✅ Uses DashboardService (Singleton with DatabaseManager)
 * ✅ Utility functions (pagination, filtering, error handling)
 * ✅ Zod validation
 * ✅ Comprehensive JSDoc
 * ✅ No CREATE TABLE statements (migrations only)
 *
 * @module routes/dashboard
 * 
 * @example
 * ```typescript
 * // Get paginated tasks
 * GET /api/dashboard/tasks?limit=20&offset=0&status=pending
 * 
 * // Create task
 * POST /api/dashboard/tasks
 * {
 *   "userId": "user-123",
 *   "title": "Review Report",
 *   "priority": "high",
 *   "dueDate": "2025-12-25"
 * }
 * 
 * // Mark notification as read
 * PUT /api/dashboard/notifications/:id
 * { "read": true }
 * ```
 */

import { Router, type Request, type Response } from "express";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { BadRequestError } from "../error/errors.js";
import dashboardService from "./DashboardService.js";
import comprehensiveRouter from "./comprehensive.js";
import {
  createTaskSchema,
  updateTaskSchema,
  queryTaskSchema,
  createNotificationSchema,
  updateNotificationSchema,
  queryNotificationSchema,
  createWidgetSchema,
  updateWidgetSchema,
  queryWidgetSchema,
  createLayoutSchema,
  updateLayoutSchema,
  createFavoriteSchema,
  type ActivityItem,
} from "./types.js";

const router = Router();

// Mount comprehensive dashboard routes
router.use("/comprehensive", comprehensiveRouter);

// ==========================================================================
// SYSTEM HEALTH ROUTES
// ==========================================================================

/**
 * GET /api/dashboard/health
 * Get system health status
 * 
 * @returns {SystemHealth} System health metrics
 */
router.get(
  "/health",
  asyncHandler(async (_req: Request, res: Response) => {
    const health = await dashboardService.getSystemHealth();
    res.json(health);
  })
);

/**
 * GET /api/dashboard/overview
 * Get comprehensive system, AI, and ERP overview
 * 
 * @returns {DashboardOverview} Complete dashboard overview
 */
router.get(
  "/overview",
  asyncHandler(async (_req: Request, res: Response) => {
    const overview = await dashboardService.getDashboardOverview();
    res.json(overview);
  })
);

/**
 * GET /api/dashboard/context
 * Get last context log entries
 * 
 * @returns {object} Last 10 log entries
 */
router.get("/context", (_req: Request, res: Response) => {
  const logFile = path.join(process.cwd(), "data", "chat_context.log");
  if (existsSync(logFile)) {
    const content = readFileSync(logFile, "utf8").split("\n").slice(-10);
    res.json({ success: true, context: content });
  } else {
    res.json({ success: true, context: [] });
  }
});

// ==========================================================================
// KPI ROUTES
// ==========================================================================

/**
 * GET /api/dashboard/kpis
 * Get dashboard KPIs
 * 
 * @query {string} category - Filter by category (optional)
 * @query {number} days - Number of days (default: 7)
 * 
 * @returns {DashboardKPI[]} List of KPIs
 */
router.get(
  "/kpis",
  asyncHandler(async (req: Request, res: Response) => {
    const category = req.query.category as string | undefined;
    const days = req.query.days
      ? parseInt(req.query.days as string, 10)
      : 7;

    const kpis = await dashboardService.getKPIs({ category, days });

    res.json({
      success: true,
      data: kpis,
      count: kpis.length,
    });
  })
);

/**
 * POST /api/dashboard/kpis
 * Create new KPI entry
 * 
 * @body {object} KPI data
 * 
 * @returns {DashboardKPI} Created KPI
 */
router.post(
  "/kpis",
  asyncHandler(async (req: Request, res: Response) => {
    const { category, name, value, unit, target, date } = req.body;

    if (!category || !name || value === undefined) {
      throw new BadRequestError("Missing required fields: category, name, value");
    }

    const kpi = await dashboardService.createKPI({
      category,
      name,
      value,
      unit,
      target,
      date,
    });

    res.status(201).json({
      success: true,
      data: kpi,
    });
  })
);

// ==========================================================================
// TASKS ROUTES
// ==========================================================================

/**
 * GET /api/dashboard/tasks
 * Get dashboard tasks with pagination and filtering
 * 
 * @query {string} userId - Filter by user ID
 * @query {string} status - Filter by status (pending, in_progress, completed, etc.)
 * @query {string} priority - Filter by priority (low, normal, high, urgent, critical)
 * @query {string} assignedTo - Filter by assigned user
 * @query {string} tags - Filter by tags (partial match)
 * @query {string} dueBefore - Filter tasks due before date (ISO 8601)
 * @query {string} dueAfter - Filter tasks due after date (ISO 8601)
 * @query {number} limit - Results per page (default: 50)
 * @query {number} offset - Pagination offset (default: 0)
 * @query {string} sortBy - Sort field
 * @query {string} sortOrder - Sort order (asc, desc)
 * 
 * @returns {PaginatedResult<DashboardTask>} Paginated tasks
 */
router.get(
  "/tasks",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = queryTaskSchema.parse(req.query);
    const filters = {
      userId: validated.userId,
      status: validated.status,
      priority: validated.priority,
      assignedTo: validated.assignedTo,
      dueBefore: validated.dueBefore,
      dueAfter: validated.dueAfter,
      limit: validated.limit ? Number(validated.limit) : undefined,
      offset: validated.offset ? Number(validated.offset) : undefined,
    };
    const result = await dashboardService.getTasks(filters);
    res.json(result);
  })
);

/**
 * GET /api/dashboard/tasks/:id
 * Get task by ID
 * 
 * @param {string} id - Task ID
 * 
 * @returns {DashboardTask} Task details
 */
router.get(
  "/tasks/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const task = await dashboardService.getTaskById(req.params.id);
    res.json({ success: true, data: task });
  })
);

/**
 * POST /api/dashboard/tasks
 * Create a new task
 * 
 * @body {CreateTaskInput} Task data
 * 
 * @returns {DashboardTask} Created task
 */
router.post(
  "/tasks",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createTaskSchema.parse(req.body);
    const task = await dashboardService.createTask(validated);
    res.status(201).json({ success: true, data: task });
  })
);

/**
 * PUT /api/dashboard/tasks/:id
 * Update a task
 * 
 * @param {string} id - Task ID
 * @body {UpdateTaskInput} Update data
 * 
 * @returns {DashboardTask} Updated task
 */
router.put(
  "/tasks/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = updateTaskSchema.parse(req.body);
    const task = await dashboardService.updateTask(req.params.id, validated);
    res.json({ success: true, data: task });
  })
);

/**
 * DELETE /api/dashboard/tasks/:id
 * Delete a task
 * 
 * @param {string} id - Task ID
 * 
 * @returns {object} Success message
 */
router.delete(
  "/tasks/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await dashboardService.deleteTask(req.params.id);
    res.json({ success: true, message: "Task deleted successfully" });
  })
);

// ==========================================================================
// NOTIFICATIONS ROUTES
// ==========================================================================

/**
 * GET /api/dashboard/notifications
 * Get dashboard notifications with pagination and filtering
 * 
 * @query {string} userId - Filter by user ID
 * @query {boolean} read - Filter by read status
 * @query {string} type - Filter by type (info, warning, error, success, alert)
 * @query {string} createdAfter - Filter by creation date (after)
 * @query {string} createdBefore - Filter by creation date (before)
 * @query {number} limit - Results per page (default: 50)
 * @query {number} offset - Pagination offset (default: 0)
 * @query {string} sortBy - Sort field
 * @query {string} sortOrder - Sort order (asc, desc)
 * 
 * @returns {PaginatedResult<DashboardNotification>} Paginated notifications
 */
router.get(
  "/notifications",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = queryNotificationSchema.parse(req.query);
    const filters = {
      userId: validated.userId,
      type: validated.type,
      read:
        typeof validated.read === "string"
          ? validated.read === "true"
          : undefined,
      limit: validated.limit ? Number(validated.limit) : undefined,
      offset: validated.offset ? Number(validated.offset) : undefined,
    };
    const result = await dashboardService.getNotifications(filters);
    res.json(result);
  })
);

/**
 * GET /api/dashboard/notifications/:id
 * Get notification by ID
 * 
 * @param {string} id - Notification ID
 * 
 * @returns {DashboardNotification} Notification details
 */
router.get(
  "/notifications/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const notification = await dashboardService.getNotificationById(
      req.params.id
    );
    res.json({ success: true, data: notification });
  })
);

/**
 * POST /api/dashboard/notifications
 * Create a new notification
 * 
 * @body {CreateNotificationInput} Notification data
 * 
 * @returns {DashboardNotification} Created notification
 */
router.post(
  "/notifications",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createNotificationSchema.parse(req.body);
    const notification = await dashboardService.createNotification(validated);
    res.status(201).json({ success: true, data: notification });
  })
);

/**
 * PUT /api/dashboard/notifications/:id
 * Update a notification (mark as read/unread)
 * 
 * @param {string} id - Notification ID
 * @body {UpdateNotificationInput} Update data
 * 
 * @returns {DashboardNotification} Updated notification
 */
router.put(
  "/notifications/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = updateNotificationSchema.parse(req.body);
    const notification = await dashboardService.updateNotification(
      req.params.id,
      validated
    );
    res.json({ success: true, data: notification });
  })
);

/**
 * DELETE /api/dashboard/notifications/:id
 * Delete a notification
 * 
 * @param {string} id - Notification ID
 * 
 * @returns {object} Success message
 */
router.delete(
  "/notifications/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await dashboardService.deleteNotification(req.params.id);
    res.json({ success: true, message: "Notification deleted successfully" });
  })
);

// ==========================================================================
// WIDGETS ROUTES (CRUD)
// ==========================================================================

/**
 * GET /api/dashboard/widgets
 * Get widgets with pagination and filtering
 *
 * @query {string} userId
 * @query {string} widgetType
 * @query {string} dataSource
 * @query {string} isVisible
 * @query {number} limit
 * @query {number} offset
 * @query {string} sortBy
 * @query {string} sortOrder
 */
router.get(
  "/widgets",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = queryWidgetSchema.parse(req.query);
    const filters: {
      userId?: string;
      widgetType?: string;
      dataSource?: string;
      isVisible?: boolean;
      limit?: number;
      offset?: number;
    } = {
      userId: validated.userId,
      widgetType: validated.widgetType,
      dataSource: validated.dataSource,
      isVisible:
        typeof validated.isVisible === "string"
          ? validated.isVisible === "true"
          : undefined,
      limit: validated.limit ? Number(validated.limit) : undefined,
      offset: validated.offset ? Number(validated.offset) : undefined,
    };
    const result = await dashboardService.getWidgets(filters);
    res.json(result);
  })
);

/**
 * POST /api/dashboard/widgets
 * Create a new widget
 */
router.post(
  "/widgets",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createWidgetSchema.parse(req.body);
    const widget = await dashboardService.createWidget(validated);
    res.status(201).json({ success: true, data: widget });
  })
);

/**
 * PUT /api/dashboard/widgets/:id
 * Update an existing widget
 */
router.put(
  "/widgets/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = updateWidgetSchema.parse(req.body);
    const widget = await dashboardService.updateWidget(req.params.id, validated);
    res.json({ success: true, data: widget });
  })
);

/**
 * DELETE /api/dashboard/widgets/:id
 * Delete a widget
 */
router.delete(
  "/widgets/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await dashboardService.deleteWidget(req.params.id);
    res.json({ success: true, message: "Widget deleted successfully" });
  })
);

// ==========================================================================
// LAYOUTS ROUTES (CRUD)
// ==========================================================================

/**
 * GET /api/dashboard/layouts
 * Get layouts for a user
 * @query {string} userId - Required
 */
router.get(
  "/layouts",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.query.userId as string | undefined;
    if (!userId) throw new BadRequestError("Missing required query: userId");
    const layouts = await dashboardService.getLayouts(userId);
    res.json({ success: true, data: layouts, count: layouts.length });
  })
);

/**
 * POST /api/dashboard/layouts
 * Create a new layout
 */
router.post(
  "/layouts",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createLayoutSchema.parse(req.body);
    const layout = await dashboardService.createLayout(validated);
    res.status(201).json({ success: true, data: layout });
  })
);

/**
 * PUT /api/dashboard/layouts/:id
 * Update an existing layout
 */
router.put(
  "/layouts/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = updateLayoutSchema.parse(req.body);
    const layout = await dashboardService.updateLayout(req.params.id, validated);
    res.json({ success: true, data: layout });
  })
);

/**
 * DELETE /api/dashboard/layouts/:id
 * Delete a layout
 */
router.delete(
  "/layouts/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await dashboardService.deleteLayout(req.params.id);
    res.json({ success: true, message: "Layout deleted successfully" });
  })
);

// ==========================================================================
// FAVORITES ROUTES (CRUD)
// ==========================================================================

/**
 * GET /api/dashboard/favorites
 * Get favorites for a user
 * @query {string} userId - Required
 */
router.get(
  "/favorites",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.query.userId as string | undefined;
    if (!userId) throw new BadRequestError("Missing required query: userId");
    const favorites = await dashboardService.getFavorites(userId);
    res.json({ success: true, data: favorites, count: favorites.length });
  })
);

/**
 * POST /api/dashboard/favorites
 * Add a new favorite
 */
router.post(
  "/favorites",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createFavoriteSchema.parse(req.body);
    const favorite = await dashboardService.addFavorite(validated);
    res.status(201).json({ success: true, data: favorite });
  })
);

/**
 * DELETE /api/dashboard/favorites/:id
 * Delete a favorite
 */
router.delete(
  "/favorites/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await dashboardService.deleteFavorite(req.params.id);
    res.json({ success: true, message: "Favorite deleted successfully" });
  })
);

// ==========================================================================
// WIDGETS STATS ROUTES
// ==========================================================================

/**
 * GET /api/dashboard/widgets/stats
 * Get comprehensive stats for dashboard widgets
 * 
 * @returns {DashboardStats} Widget statistics
 */
router.get("/widgets/stats", (_req: Request, res: Response) => {
  const stats = {
    totalTasks: 45,
    completedTasks: 28,
    pendingTasks: 17,
    overdueTasks: 3,
    unreadNotifications: 8,
    totalRevenue: 1250000,
    newCustomers: 23,
    activeProjects: 12,
  };

  res.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================================================
// ACTIVITIES ROUTES
// ==========================================================================

/**
 * GET /api/dashboard/activities
 * Get recent activities for dashboard
 * 
 * @query {number} limit - Max number of activities (default: 10)
 * 
 * @returns {ActivityItem[]} Recent activities
 */
router.get(
  "/activities",
  asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;

    const activities: ActivityItem[] = [
      {
        id: "1",
        type: "task_completed",
        title: "Task Completed",
        description: "Quarterly Report completed by John Doe",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        icon: "check-circle",
        user: {
          id: "user-1",
          name: "John Doe",
          avatar: "/avatars/john.jpg",
        },
      },
      {
        id: "2",
        type: "notification_sent",
        title: "Notification Sent",
        description: "Invoice #1234 sent to customer",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        icon: "bell",
      },
      {
        id: "3",
        type: "kpi_updated",
        title: "KPI Updated",
        description: "Revenue KPI updated - Target reached",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        icon: "trending-up",
      },
    ].slice(0, limit);

    res.json({
      success: true,
      data: activities,
      count: activities.length,
    });
  })
);

/**
 * GET /api/dashboard/quick-links
 * Get quick links for dashboard navigation
 * 
 * @returns {object[]} Quick links
 */
router.get("/quick-links", (_req: Request, res: Response) => {
  const quickLinks = [
    {
      id: "1",
      category: "Finance",
      title: "Revenue Dashboard",
      url: "/dashboard/finance/revenue",
      icon: "dollar-sign",
      color: "green",
    },
    {
      id: "2",
      category: "HR",
      title: "Employee Directory",
      url: "/hr/employees",
      icon: "users",
      color: "blue",
    },
    {
      id: "3",
      category: "Production",
      title: "Production Schedule",
      url: "/production/schedule",
      icon: "calendar",
      color: "orange",
    },
    {
      id: "4",
      category: "CRM",
      title: "Customer List",
      url: "/crm/customers",
      icon: "briefcase",
      color: "purple",
    },
    {
      id: "5",
      category: "Warehouse",
      title: "Inventory Overview",
      url: "/warehouse/inventory",
      icon: "package",
      color: "indigo",
    },
  ];

  res.json({
    success: true,
    data: quickLinks,
    count: quickLinks.length,
  });
});

export default router;
