// SPDX-License-Identifier: MIT
// apps/backend/src/routes/batch/types.ts

/**
 * Batch Processing Type Definitions
 *
 * @module routes/batch/types
 */

/**
 * Batch operation status
 */
export type BatchStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Batch operation type
 */
export type BatchOperationType =
  | "annotate"
  | "import"
  | "export"
  | "transform"
  | "report"
  | "validate"
  | "cleanup";

/**
 * Batch filter criteria
 */
export interface BatchFilters {
  status?: string | string[];
  category?: string | string[];
  tags?: string[];
  createdAfter?: string;
  createdBefore?: string;
  annotationStatus?: string;
  hasErrors?: boolean;
  [key: string]: unknown;
}

/**
 * Batch processing options
 */
export interface BatchOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  batchSize?: number;
  retryAttempts?: number;
  timeout?: number;
  priority?: "low" | "normal" | "high";
  notifyOnComplete?: boolean;
  [key: string]: unknown;
}

/**
 * Core batch operation structure
 */
export interface BatchOperation {
  id: string;
  operation: BatchOperationType;
  filters: BatchFilters;
  options?: BatchOptions;
  status: BatchStatus;
  progress: number;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
  name?: string;
  description?: string;
  created_by?: string;
  total_items?: number;
  processed_items?: number;
  failed_items?: number;
  [key: string]: unknown;
}

/**
 * Batch creation request
 */
export interface BatchCreationRequest {
  operation: BatchOperationType;
  filters: BatchFilters;
  options?: BatchOptions;
  name?: string;
  description?: string;
}

/**
 * Individual batch item result
 */
export interface BatchItemResult {
  nodeId: string;
  success: boolean;
  result?: Record<string, unknown>;
  error?: string;
  retries: number;
  durationMs?: number;
  qualityScore?: number;
  createdAt: string;
}

/**
 * Batch result summary statistics
 */
export interface BatchResultSummary {
  total: number;
  successful: number;
  failed: number;
  averageConfidence?: number;
  businessAreas?: Record<string, number>;
  piiDistribution?: Record<string, number>;
  qualityScore?: number;
  performanceMetrics?: {
    averageDuration: number;
    totalDuration: number;
    requestsPerMinute: number;
    p50Duration?: number;
    p95Duration?: number;
    p99Duration?: number;
  };
}

/**
 * Batch operation with complete results
 */
export interface BatchWithResults extends BatchOperation {
  results?: BatchItemResult[];
  summary?: BatchResultSummary;
}

/**
 * Batch history filter criteria
 */
export interface BatchHistoryFilter {
  operation?: BatchOperationType;
  status?: BatchStatus;
  createdAfter?: string;
  createdBefore?: string;
  createdBy?: string;
  limit?: number;
  offset?: number;
  sortBy?: "created_at" | "completed_at" | "progress";
  sortOrder?: "asc" | "desc";
}

/**
 * Timeline data point for visualization
 */
export interface TimelineDataPoint {
  timestamp: string;
  successful: number;
  failed: number;
  pending: number;
  progress?: number;
}

/**
 * Error distribution for analytics
 */
export interface ErrorDistribution {
  error: string;
  count: number;
  percentage?: number;
  examples?: string[];
}

/**
 * Quality score distribution
 */
export interface QualityDistribution {
  range: string;
  count: number;
  percentage?: number;
  averageScore?: number;
}

/**
 * Performance metrics for batch visualization
 */
export interface PerformanceMetrics {
  averageDuration: number;
  p50Duration: number;
  p95Duration: number;
  p99Duration: number;
  minDuration?: number;
  maxDuration?: number;
  totalDuration?: number;
  throughput?: number;
}

/**
 * Complete batch visualization data
 */
export interface BatchVisualizationData {
  batchId: string;
  overview: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    successRate: number;
    averageDuration: number;
    estimatedCompletion?: string;
  };
  timeline: TimelineDataPoint[];
  errorDistribution: ErrorDistribution[];
  qualityDistribution: QualityDistribution[];
  performanceMetrics: PerformanceMetrics;
  statusBreakdown?: Record<BatchStatus, number>;
  operationMetrics?: {
    itemsPerMinute: number;
    estimatedTimeRemaining?: number;
    peakThroughput?: number;
  };
}

/**
 * Batch progress update event
 */
export interface BatchProgressUpdate {
  batchId: string;
  progress: number;
  status: BatchStatus;
  processedItems?: number;
  totalItems?: number;
  currentItem?: string;
  estimatedCompletion?: string;
}

/**
 * Batch WebSocket event types
 */
export type BatchEventType =
  | "batch:created"
  | "batch:progress"
  | "batch:completed"
  | "batch:failed"
  | "batch:cancelled"
  | "batch:item_completed"
  | "batch:error";

/**
 * Batch WebSocket event payload
 */
export interface BatchEvent {
  type: BatchEventType;
  batchId: string;
  data:
    | BatchOperation
    | BatchProgressUpdate
    | BatchItemResult
    | { error: string };
  timestamp: string;
}
