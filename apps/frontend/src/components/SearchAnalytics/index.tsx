// SPDX-License-Identifier: MIT
// apps/frontend/src/components/SearchAnalytics/index.tsx

/**
 * Search Analytics Module
 *
 * Provides comprehensive search analytics and performance monitoring
 * for tracking search queries, latency, and user behavior.
 */

export { SearchAnalyticsDashboard } from "./SearchAnalyticsDashboard";

// Default export for convenience
export { SearchAnalyticsDashboard as default } from "./SearchAnalyticsDashboard";

// Type exports
export type {
  SearchMetrics,
  PopularQuery,
  SearchTrend,
  PerformanceDistribution,
  DashboardData,
  SearchAnalyticsDashboardProps,
} from "./SearchAnalyticsDashboard";
