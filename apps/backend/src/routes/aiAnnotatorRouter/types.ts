// SPDX-License-Identifier: MIT
// apps/backend/src/routes/aiAnnotatorRouter/types.ts

/**
 * TypeScript types and Zod validation schemas for AI Annotator Module
 *
 * @module routes/aiAnnotator/types
 */

import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Annotation status values
 */
export const ANNOTATION_STATUS = {
  PENDING: "pending",
  ANNOTATED: "annotated",
  REVIEWED: "reviewed",
  APPROVED: "approved",
  REJECTED: "rejected",
  FAILED: "failed",
} as const;

/**
 * Batch operation types
 */
export const BATCH_OPERATION = {
  GENERATE_META: "generate_meta",
  GENERATE_FORMS: "generate_forms",
  ENHANCE_SCHEMA: "enhance_schema",
  CLASSIFY_PII: "classify_pii",
  GENERATE_RULE: "generate_rule",
  FULL_ANNOTATION: "full_annotation",
  VALIDATE_NODES: "validate_nodes",
  BULK_ENHANCE: "bulk_enhance",
} as const;

/**
 * Model preference levels
 */
export const MODEL_PREFERENCE = {
  FAST: "fast",
  BALANCED: "balanced",
  ACCURATE: "accurate",
} as const;

/**
 * AI provider types
 */
export const AI_PROVIDER = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  OLLAMA: "ollama",
} as const;

/**
 * Prompt types for AI operations
 */
export const PROMPT_TYPE = {
  META: "meta",
  RULE: "rule",
  FORM: "form",
  SIMPLE: "simple",
  CORRECTION: "correction",
} as const;

/**
 * Export formats
 */
export const EXPORT_FORMAT = {
  JSON: "json",
  CSV: "csv",
} as const;

/**
 * Quality score thresholds
 */
export const QUALITY_THRESHOLD = {
  LOW: 0.6,
  MEDIUM: 0.75,
  HIGH: 0.9,
} as const;

/**
 * PII classification levels
 */
export const PII_LEVEL = {
  NONE: "none",
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Node for annotation
 */
export interface NodeForAnnotation {
  id: string;
  name?: string;
  title?: string;
  kind?: string;
  description?: string;
  category?: string;
  parent_id?: string | null;
  meta_json?: unknown;
  schema_json?: unknown;
  rule_json?: unknown;
  form_json?: unknown;
  breadcrumbs?: Array<{ id: string; title: string }>;
  annotation_status?: (typeof ANNOTATION_STATUS)[keyof typeof ANNOTATION_STATUS];
  ai_metadata?: string;
  ai_rule?: string;
  ai_form?: string;
  quality_score?: number;
  last_annotated_at?: string;
  annotated_by?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
}

/**
 * Generated AI metadata
 */
export interface GeneratedMeta {
  summary: string;
  keywords: string[];
  category?: string;
  complexity?: string;
  useCases?: string[];
  prerequisites?: string[];
  relatedConcepts?: string[];
  confidence?: number;
}

/**
 * Dashboard rule configuration
 */
export interface DashboardRule {
  id: string;
  name: string;
  description?: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
  created_at: string;
  updated_at?: string;
}

/**
 * Form specification
 */
export interface FormSpec {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  validation?: Record<string, unknown>;
  layout?: string;
  created_at: string;
}

/**
 * Form field specification
 */
export interface FormField {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: unknown;
  validation?: Record<string, unknown>;
  options?: Array<{ value: string; label: string }>;
}

/**
 * Batch operation
 */
export interface BatchOperation {
  id: string;
  operation: (typeof BATCH_OPERATION)[keyof typeof BATCH_OPERATION];
  filters: Record<string, unknown>;
  options?: BatchOperationOptions;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  total_nodes?: number;
  processed_nodes?: number;
  failed_nodes?: number;
  started_at?: string;
  completed_at?: string;
  error?: string;
  created_by?: string;
  created_at: string;
}

/**
 * Batch operation options
 */
export interface BatchOperationOptions {
  retryFailed?: boolean;
  maxRetries?: number;
  chunkSize?: number;
  parallelRequests?: number;
  modelPreference?: (typeof MODEL_PREFERENCE)[keyof typeof MODEL_PREFERENCE];
  webhookUrl?: string;
  notifyOnComplete?: boolean;
}

/**
 * Batch progress information
 */
export interface BatchProgress {
  batchId: string;
  status: string;
  total: number;
  processed: number;
  failed: number;
  successRate: number;
  estimatedTimeRemaining?: number;
  errors?: Array<{ nodeId: string; error: string }>;
}

/**
 * Quality metrics
 */
export interface QualityMetrics {
  totalNodes: number;
  annotatedNodes: number;
  reviewedNodes: number;
  approvedNodes: number;
  rejectedNodes: number;
  averageQualityScore: number;
  scoreDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  recentActivity: {
    last24h: number;
    last7days: number;
    last30days: number;
  };
}

/**
 * Model performance metrics
 */
export interface ModelPerformance {
  provider: (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER];
  model: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  averageQualityScore: number;
  totalCost: number;
  lastUsed?: string;
}

/**
 * PII classification result
 */
export interface PiiClassification {
  nodeId: string;
  piiLevel: (typeof PII_LEVEL)[keyof typeof PII_LEVEL];
  detectedTypes: string[];
  confidence: number;
  recommendations: string[];
  requiresReview: boolean;
}

/**
 * Validation result
 */
export interface ValidationResult {
  nodeId: string;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
  code?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

/**
 * Annotation history entry
 */
export interface AnnotationHistory {
  id: string;
  nodeId: string;
  operation: string;
  provider: string;
  model: string;
  metadata?: string;
  qualityScore?: number;
  cost?: number;
  duration?: number;
  created_at: string;
  created_by?: string;
}

/**
 * Filter definition
 */
export interface FilterDefinition {
  id: string;
  name: string;
  description?: string;
  conditions: FilterCondition[];
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

/**
 * Filter condition
 */
export interface FilterCondition {
  field: string;
  operator:
    | "eq"
    | "ne"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "in"
    | "like"
    | "isNull"
    | "isNotNull";
  value?: unknown;
}

/**
 * Statistics summary
 */
export interface StatisticsSummary {
  overview: {
    totalNodes: number;
    pendingNodes: number;
    annotatedNodes: number;
    approvedNodes: number;
  };
  quality: {
    averageScore: number;
    scoreDistribution: Record<string, number>;
  };
  performance: {
    totalAnnotations: number;
    averageResponseTime: number;
    successRate: number;
  };
  costs: {
    totalCost: number;
    costByProvider: Record<string, number>;
    costByModel: Record<string, number>;
  };
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for full annotation request
 */
export const fullAnnotationSchema = z.object({
  includeValidation: z.boolean().optional().default(true),
  parallel: z.boolean().optional().default(true),
});

/**
 * Schema for batch operation creation
 */
export const batchOperationSchema = z.object({
  operation: z.string().min(1),
  filters: z.record(z.string(), z.unknown()),
  options: z
    .object({
      retryFailed: z.boolean().optional(),
      maxRetries: z.number().int().positive().optional(),
      chunkSize: z.number().int().positive().optional(),
      parallelRequests: z.number().int().positive().optional(),
      modelPreference: z.enum(["fast", "balanced", "accurate"]).optional(),
      webhookUrl: z.string().url().optional(),
      notifyOnComplete: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Schema for PII classification
 */
export const classifyPiiSchema = z.object({
  nodeIds: z.array(z.string()).min(1),
  detailed: z.boolean().optional().default(false),
});

/**
 * Schema for batch validation
 */
export const validateBatchSchema = z.object({
  nodeIds: z.array(z.string()).min(1),
  rules: z.array(z.unknown()).optional().default([]),
});

/**
 * Schema for error correction configuration
 */
export const errorCorrectionConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  maxRetries: z.number().int().positive().optional().default(3),
  retryDelay: z.number().int().positive().optional().default(1000),
  fallbackModel: z.string().optional(),
  notifyOnFailure: z.boolean().optional().default(false),
});

/**
 * Schema for debug prompt
 */
export const debugPromptSchema = z.object({
  nodeId: z.string().min(1),
  promptType: z
    .enum(["meta", "rule", "form", "simple", "correction"])
    .optional()
    .default("meta"),
  options: z.record(z.string(), z.unknown()).optional().default({}),
});

/**
 * Schema for AI test
 */
export const debugAiTestSchema = z.object({
  prompt: z.string().optional(),
  model: z.string().optional(),
  provider: z.string().optional(),
});

/**
 * Schema for bulk enhance
 */
export const bulkEnhanceSchema = z.object({
  nodeIds: z.array(z.string()).min(1),
  operations: z
    .array(z.enum(["meta", "rule", "form"]))
    .optional()
    .default(["meta", "rule", "form"]),
});

/**
 * Schema for model selection test
 */
export const modelSelectionTestSchema = z.object({
  operation: z.string().optional().default("meta"),
  priority: z.string().optional().default("balanced"),
});

/**
 * Schema for export filter
 */
export const exportFilterSchema = z.object({
  nodes: z.array(z.unknown()).min(1),
  format: z.enum(["json", "csv"]).optional().default("json"),
});

/**
 * Schema for annotation request
 */
export const annotateSchema = z.object({
  nodeIds: z.array(z.string()).min(1).max(100),
  force: z.boolean().optional().default(false),
  provider: z.enum(["openai", "anthropic", "ollama"]).optional(),
  model: z.string().optional(),
});

/**
 * Schema for quality approval
 */
export const approveAnnotationSchema = z.object({
  approvedBy: z.string().min(1),
  comment: z.string().optional(),
});

/**
 * Schema for quality rejection
 */
export const rejectAnnotationSchema = z.object({
  rejectedBy: z.string().min(1),
  reason: z.string().min(1),
  suggestions: z.array(z.string()).optional(),
});

/**
 * Schema for filter creation
 */
export const createFilterSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  conditions: z
    .array(
      z.object({
        field: z.string().min(1),
        operator: z.enum([
          "eq",
          "ne",
          "gt",
          "gte",
          "lt",
          "lte",
          "in",
          "like",
          "isNull",
          "isNotNull",
        ]),
        value: z.unknown().optional(),
      }),
    )
    .min(1),
});

/**
 * Schema for query parameters
 */
export const queryNodesSchema = z.object({
  limit: z.coerce.number().int().positive().max(1000).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
  status: z
    .enum([
      "pending",
      "annotated",
      "reviewed",
      "approved",
      "rejected",
      "failed",
    ])
    .optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  minQualityScore: z.coerce.number().min(0).max(1).optional(),
  sortBy: z
    .enum(["name", "status", "quality_score", "created_at", "updated_at"])
    .optional()
    .default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for annotation status
 */
export function isValidAnnotationStatus(
  status: unknown,
): status is (typeof ANNOTATION_STATUS)[keyof typeof ANNOTATION_STATUS] {
  return (
    typeof status === "string" &&
    Object.values(ANNOTATION_STATUS).includes(
      status as (typeof ANNOTATION_STATUS)[keyof typeof ANNOTATION_STATUS],
    )
  );
}

/**
 * Type guard for batch operation
 */
export function isValidBatchOperation(
  operation: unknown,
): operation is (typeof BATCH_OPERATION)[keyof typeof BATCH_OPERATION] {
  return (
    typeof operation === "string" &&
    Object.values(BATCH_OPERATION).includes(
      operation as (typeof BATCH_OPERATION)[keyof typeof BATCH_OPERATION],
    )
  );
}

/**
 * Type guard for AI provider
 */
export function isValidAiProvider(
  provider: unknown,
): provider is (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER] {
  return (
    typeof provider === "string" &&
    Object.values(AI_PROVIDER).includes(
      provider as (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER],
    )
  );
}

/**
 * Type guard for PII level
 */
export function isValidPiiLevel(
  level: unknown,
): level is (typeof PII_LEVEL)[keyof typeof PII_LEVEL] {
  return (
    typeof level === "string" &&
    Object.values(PII_LEVEL).includes(
      level as (typeof PII_LEVEL)[keyof typeof PII_LEVEL],
    )
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert string array-like input to string array
 */
export function toStringArray(v: unknown): string[] | undefined {
  if (typeof v === "string") return [v];
  if (Array.isArray(v))
    return (v as unknown[]).filter((x): x is string => typeof x === "string");
  if (v && typeof v === "object") {
    const values = Object.values(v as Record<string, unknown>);
    const flat = values.flatMap((x) => (typeof x === "string" ? [x] : []));
    return flat.length ? flat : undefined;
  }
  return undefined;
}

/**
 * Convert to boolean with default
 */
export function toBool(v: unknown, def = false): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "on";
  }
  return def;
}

/**
 * Convert to integer with default
 */
export function toInt(v: unknown, def: number): number {
  if (typeof v === "number") return v;
  const n = typeof v === "string" ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : def;
}

/**
 * Calculate quality score from metadata
 */
export function calculateQualityScore(metadata: GeneratedMeta): number {
  let score = 0;
  const weights = {
    summary: 0.3,
    keywords: 0.2,
    category: 0.1,
    complexity: 0.1,
    useCases: 0.15,
    prerequisites: 0.05,
    relatedConcepts: 0.1,
  };

  if (metadata.summary && metadata.summary.length > 20)
    score += weights.summary;
  if (metadata.keywords && metadata.keywords.length >= 3)
    score += weights.keywords;
  if (metadata.category) score += weights.category;
  if (metadata.complexity) score += weights.complexity;
  if (metadata.useCases && metadata.useCases.length > 0)
    score += weights.useCases;
  if (metadata.prerequisites && metadata.prerequisites.length > 0)
    score += weights.prerequisites;
  if (metadata.relatedConcepts && metadata.relatedConcepts.length > 0)
    score += weights.relatedConcepts;

  return Math.min(score, 1);
}

/**
 * Determine quality threshold level
 */
export function getQualityLevel(score: number): "low" | "medium" | "high" {
  if (score >= QUALITY_THRESHOLD.HIGH) return "high";
  if (score >= QUALITY_THRESHOLD.MEDIUM) return "medium";
  return "low";
}

/**
 * Format cost in currency
 */
export function formatCost(cost: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 4,
  }).format(cost);
}

/**
 * Calculate success rate percentage
 */
export function calculateSuccessRate(
  successful: number,
  total: number,
): number {
  if (total === 0) return 0;
  return Math.round((successful / total) * 100 * 100) / 100;
}

/* ========================================================================== */
/* Additional Validation Schemas                                              */
/* ========================================================================== */

/**
 * Schema for full annotation (meta, rule, form)
 */
export const fullAnnotationRequestSchema = z.object({
  includeValidation: z.boolean().optional().default(true),
  parallel: z.boolean().optional().default(true),
});

/**
 * Schema for approve/reject review operations
 */
export const approveRejectReviewSchema = z.object({
  reviewer: z.string().min(1),
  comments: z.string().optional(),
});

/**
 * Schema for model comparison
 */
export const compareModelsSchema = z.object({
  models: z.array(z.string()).min(2),
  days: z.number().int().positive().optional().default(30),
});
