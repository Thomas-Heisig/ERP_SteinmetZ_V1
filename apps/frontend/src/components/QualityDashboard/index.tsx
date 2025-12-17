// SPDX-License-Identifier: MIT
// apps/frontend/src/components/QualityDashboard/index.tsx

/**
 * Quality Dashboard Module
 *
 * Provides comprehensive quality assurance tools for reviewing and monitoring
 * AI-annotated nodes and ensuring data quality across the system.
 */

export { QADashboard } from "./QADashboard";
export { ManualReviewInterface } from "./ManualReviewInterface";
export { QualityTrendChart } from "./QualityTrendChart";

// Default export for convenience
export { QADashboard as default } from "./QADashboard";

// Type exports
export type { QASummary } from "./QADashboard";
export type { QAReview as DashboardReview } from "./QADashboard";
export type {
  QAReview,
  ManualReviewInterfaceProps,
} from "./ManualReviewInterface";
