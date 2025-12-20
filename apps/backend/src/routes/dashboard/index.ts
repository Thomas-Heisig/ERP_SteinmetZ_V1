// SPDX-License-Identifier: MIT
// apps/backend/src/routes/dashboard/index.ts

/**
 * Dashboard Module Exports
 *
 * Central export point for all dashboard functionality.
 *
 * @module routes/dashboard
 */

// Service
export { DashboardService } from "./DashboardService.js";
export { default as dashboardService } from "./DashboardService.js";

// Router
export { default as dashboardRouter } from "./dashboard.js";
export { default as comprehensiveRouter } from "./comprehensive.js";
export { default as unifiedDashboardRouter } from "./unifiedDashboardRouter.js";

// Types
export * from "./types.js";

// Type Exports
export type {
  SystemHealth,
  DashboardOverview,
  TaskQueryFilters,
  NotificationQueryFilters,
  WidgetQueryFilters,
  CreateTaskInput,
  UpdateTaskInput,
  CreateNotificationInput,
  UpdateNotificationInput,
  CreateWidgetInput,
  UpdateWidgetInput,
} from "./DashboardService.js";
