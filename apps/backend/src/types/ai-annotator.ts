// SPDX-License-Identifier: MIT

/**
 * AI Annotator Type Definitions
 *
 * Comprehensive type definitions for AI annotation service, replacing `any` types
 * with proper type safety for form specs, validation rules, and annotation metadata.
 */

/* -------------------------------------------------------------------------- */
/*                         DASHBOARD & WIDGET TYPES                           */
/* -------------------------------------------------------------------------- */

/**
 * Responsive breakpoint configuration for widgets
 */
export interface ResponsiveBreakpoints {
  xs?: number | { cols: number; rows: number };
  sm?: number | { cols: number; rows: number };
  md?: number | { cols: number; rows: number };
  lg?: number | { cols: number; rows: number };
  xl?: number | { cols: number; rows: number };
  [key: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/*                         FORM & FIELD TYPES                                 */
/* -------------------------------------------------------------------------- */

/**
 * Possible form field values
 */
export type FormFieldValue = 
  | string 
  | number 
  | boolean 
  | Date
  | string[]
  | number[]
  | null;

/**
 * Conditional logic field value (for comparisons)
 */
export type ConditionalValue = string | number | boolean | string[] | number[];

/**
 * Validation rule value (for min/max/pattern)
 */
export type ValidationValue = string | number | RegExp;

/* -------------------------------------------------------------------------- */
/*                         JSON METADATA TYPES                                */
/* -------------------------------------------------------------------------- */

/**
 * Generic JSON metadata (stored in database)
 */
export type JsonMetadata = Record<string, unknown> | unknown[] | null;

/**
 * Node metadata JSON
 */
export interface NodeMetaJson {
  description?: string;
  tags?: string[];
  businessArea?: string;
  piiClass?: "none" | "low" | "medium" | "high";
  [key: string]: unknown;
}

/**
 * Node schema JSON
 */
export interface NodeSchemaJson {
  type?: string;
  properties?: Record<string, unknown>;
  required?: string[];
  [key: string]: unknown;
}

/**
 * Node annotation JSON (AI-generated)
 */
export interface NodeAnnotationJson {
  confidence?: number;
  provider?: string;
  model?: string;
  timestamp?: string;
  [key: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/*                         QUERY & FILTER TYPES                               */
/* -------------------------------------------------------------------------- */

/**
 * Filter object for node queries (compatible with listCandidates)
 */
export interface NodeFilters {
  kinds?: string[];
  missingOnly?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
  status?: string[];
  businessArea?: string[];
  complexity?: string[];
  [key: string]: unknown;
}

/**
 * Query parameters (can be any primitive type)
 */
export type QueryParam = string | number | boolean | null;

/**
 * Array of query parameters for SQL queries
 */
export type QueryParams = QueryParam[];

/* -------------------------------------------------------------------------- */
/*                         DATABASE ROW TYPES                                 */
/* -------------------------------------------------------------------------- */

/**
 * Generic database row when structure is unknown
 */
export type DatabaseRow = Record<string, unknown>;

/**
 * Node data from database (partial/unknown structure)
 */
export interface PartialNodeRow {
  id?: string;
  title?: string;
  kind?: string;
  meta_json?: JsonMetadata;
  schema_json?: JsonMetadata;
  aa_json?: JsonMetadata;
  [key: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/*                         AI PROVIDER TYPES                                  */
/* -------------------------------------------------------------------------- */

/**
 * AI model information from provider
 */
export interface AIModelInfo {
  name: string;
  size?: string | number;
  version?: string;
  modified?: string;
  [key: string]: unknown;
}

/**
 * AI provider response (generic)
 */
export interface AIProviderResponse {
  success?: boolean;
  data?: unknown;
  error?: string;
  models?: AIModelInfo[];
  [key: string]: unknown;
}

/**
 * AI provider tags response
 */
export interface AITagsResponse {
  models?: Array<{ name: string; [key: string]: unknown }>;
  [key: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/*                         BATCH PROCESSING TYPES                             */
/* -------------------------------------------------------------------------- */

/**
 * Batch operation result metadata
 */
export interface BatchResultMetadata {
  result?: unknown;
  error?: string;
  duration?: number;
  retries?: number;
  [key: string]: unknown;
}

/**
 * Performance metrics for batch operations
 */
export interface PerformanceMetrics {
  totalDuration?: number;
  averageDuration?: number;
  successRate?: number;
  failureCount?: number;
  [key: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/*                         TYPE GUARDS                                        */
/* -------------------------------------------------------------------------- */

/**
 * Type guard to check if value is valid FormFieldValue
 */
export function isFormFieldValue(value: unknown): value is FormFieldValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value instanceof Date ||
    value === null ||
    (Array.isArray(value) && value.every(v => typeof v === "string" || typeof v === "number"))
  );
}

/**
 * Type guard to check if value is JsonMetadata
 */
export function isJsonMetadata(value: unknown): value is JsonMetadata {
  return (
    value === null ||
    Array.isArray(value) ||
    (typeof value === "object" && value !== null)
  );
}

/**
 * Type guard to check if object is AIProviderResponse
 */
export function isAIProviderResponse(obj: unknown): obj is AIProviderResponse {
  return (
    typeof obj === "object" &&
    obj !== null &&
    !Array.isArray(obj)
  );
}
