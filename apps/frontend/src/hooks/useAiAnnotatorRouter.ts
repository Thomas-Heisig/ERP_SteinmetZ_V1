// SPDX-License-Identifier: MIT
// apps/frontend/src/hooks/useAiAnnotatorRouter.ts

import { useState, useCallback } from "react";

export type GeneratedMeta = {
  description: string;
  tags: string[];
  businessArea?: string;
  piiClass?: "none" | "low" | "medium" | "high";
  requires?: string[];
  quality?: {
    confidence: number;
    evidence?: string[];
    generatedBy: "ai" | "fallback" | "hybrid";
    modelUsed?: string;
    validationScore?: number;
  };
  technical?: {
    complexity: "low" | "medium" | "high";
    dataVolume: "small" | "medium" | "large";
    integrationPoints: string[];
    performanceImpact: "low" | "medium" | "high";
    estimatedDevelopmentHours?: number;
  };
  compliance?: {
    gdprRelevant: boolean;
    retentionPeriod?: number;
    auditRequired: boolean;
    complianceTags?: string[];
  };
  lifecycle?: {
    status: "active" | "deprecated" | "experimental" | "planned";
    version?: string;
    lastReview?: string;
    nextReview?: string;
  };
};

export type DashboardRule = {
  type:
    | "dashboard-root"
    | "section"
    | "metric"
    | "report"
    | "form"
    | "table"
    | "action"
    | "config"
    | "chart"
    | "kpi"
    | "alerts";
  widget?:
    | "number"
    | "chart"
    | "gauge"
    | "table"
    | "form"
    | "button"
    | "tabs"
    | "grid"
    | "panel"
    | "progress"
    | "timeline"
    | "map";
  dataSource?: string;
  refreshInterval?: number;
  unit?: string;
  permissions?: string[];
  layout?: {
    colSpan?: number;
    rowSpan?: number;
    priority?: number;
    responsive?: boolean;
    breakpoints?: Record<string, any>;
  };
  aggregation?: string;
  timeRange?: string;
  colorScheme?: string;
  thresholds?: {
    warning: number;
    critical: number;
    success: number;
  };
  alerts?: AlertRule[];
};

export type AlertRule = {
  condition: string;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  actions: string[];
};

export type FormSpec = {
  title: string;
  description?: string;
  fields: FormField[];
  layout: "vertical" | "horizontal" | "wizard" | "tabs" | "accordion";
  validation?: ValidationRule[];
  actions: string[];
  sections?: FormSection[];
  conditionalLogic?: ConditionalLogic[];
};

export type FormSection = {
  title: string;
  description?: string;
  fields: string[];
  conditional?: {
    field: string;
    value: any;
  };
  collapsed?: boolean;
};

export type FormField = {
  name: string;
  type:
    | "text"
    | "number"
    | "date"
    | "select"
    | "checkbox"
    | "textarea"
    | "email"
    | "phone"
    | "currency"
    | "percentage"
    | "file"
    | "password";
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  validation?: FieldValidation;
  helpText?: string;
  defaultValue?: any;
  conditional?: ConditionalLogic;
  disabled?: boolean;
  readonly?: boolean;
  autoComplete?: string;
};

export type ConditionalLogic = {
  field: string;
  operator: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan";
  value: any;
  action: "show" | "hide" | "enable" | "disable";
};

export type ValidationRule = {
  field: string;
  type:
    | "required"
    | "min"
    | "max"
    | "pattern"
    | "custom"
    | "email"
    | "url"
    | "phone";
  value?: any;
  message: string;
};

export type FieldValidation = {
  min?: number;
  max?: number;
  pattern?: string;
  custom?: string;
};

export type NodeForAnnotation = {
  id: string;
  title: string;
  kind: string;
  path: string[];
  meta_json?: any | null;
  schema_json?: any | null;
  aa_json?: any | null;
  source_file?: string | null;
  rule?: DashboardRule;
  created_at?: string;
  updated_at?: string;
  last_annotated?: string;
  annotation_status?:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "needs_review";
  complexity_score?: number;
};

export type BatchOperation = {
  id?: string;
  operation:
    | "generate_meta"
    | "generate_forms"
    | "enhance_schema"
    | "classify_pii"
    | "generate_rule"
    | "full_annotation"
    | "validate_nodes"
    | "bulk_enhance";
  filters: any;
  options?: BatchOptions;
  status?: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress?: number;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
};

export type BatchOptions = {
  retryFailed?: boolean;
  maxRetries?: number;
  chunkSize?: number;
  parallelRequests?: number;
  modelPreference?: "auto" | "fast" | "accurate" | "balanced";
  fallbackStrategy?: "aggressive" | "conservative" | "hybrid";
  validationRules?: ValidationConfig;
  qualityThreshold?: number;
};

export type ValidationConfig = {
  minDescriptionLength?: number;
  maxTags?: number;
  requiredFields?: string[];
  businessAreaWhitelist?: string[];
  confidenceThreshold?: number;
};

export type BatchResult = {
  id: string;
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
  results: Array<{
    id: string;
    success: boolean;
    result?: any;
    error?: string;
    retries?: number;
    duration?: number;
    qualityScore?: number;
  }>;
  summary?: {
    averageConfidence: number;
    businessAreas: Record<string, number>;
    piiDistribution: Record<string, number>;
    qualityScore: number;
    performanceMetrics: {
      averageDuration: number;
      totalDuration: number;
      requestsPerMinute: number;
    };
  };
};

export type ListParams = {
  kinds?: string[];
  missingOnly?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
  status?: string[];
  businessArea?: string[];
  complexity?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
};

export type StatusResponse = {
  provider: "openai" | "ollama" | "anthropic" | "local" | "hybrid" | "none";
  available: boolean;
  model: string;
  capabilities: string[];
  health?: HealthStatus;
  errorCorrection?: ErrorCorrectionConfig;
};

export type HealthStatus = {
  overall: "healthy" | "degraded" | "unhealthy";
  database: boolean;
  aiProviders: Record<string, boolean>;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  lastHealthCheck: string;
};

export type ValidationResponse = {
  valid: boolean;
  errors: string[];
  warnings?: string[];
};

export type NodeValidation = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
};

export type RulesResponse = {
  total: number;
  byType: Record<string, NodeForAnnotation[]>;
  widgets?: Record<string, string[]>;
  nodes: NodeForAnnotation[];
};

export type DatabaseStats = {
  total: number;
  byKind: Record<string, number>;
  byStatus: Record<string, number>;
  annotationProgress: number;
  averageConfidence: number;
  qualityDistribution: Record<string, number>;
};

export type QualityReport = {
  annotation: {
    progress: number;
    averageConfidence: number;
    distribution: Record<string, number>;
  };
  batches: {
    total: number;
    completed: number;
    failed: number;
    recentSuccessRate: number;
  };
  recommendations: string[];
};

export type ErrorCorrectionConfig = {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number;
  fallbackModels: string[];
  validationRules: string[];
  autoCorrect: boolean;
  qualityThreshold: number;
};

export type BatchTemplate = {
  name: string;
  description: string;
  operation: string;
  filters: any;
  options: any;
};

export type ModelStatistics = {
  availableModels: string[];
  healthStatus: Record<string, boolean>;
  performanceMetrics: Record<string, any>;
  recommendations: string[];
};

export type OptimizationResult = {
  changes: string[];
  optimized: boolean;
};

export type PiiResult = {
  id: string;
  piiClass: "none" | "low" | "medium" | "high";
  reason: string;
  confidence: number;
  generatedBy: "ai" | "fallback" | "hybrid";
};

export type NodeAnalysis = {
  technical: {
    complexity: "low" | "medium" | "high";
    dataVolume: "small" | "medium" | "large";
    integrationPoints: string[];
    performanceImpact: "low" | "medium" | "high";
  };
  integrationPoints: string[];
  businessArea: string;
  piiClass: "none" | "low" | "medium" | "high";
};

// Hook-Konfiguration
interface UseAiAnnotatorRouterOptions {
  baseUrl?: string;
}

export default function useAiAnnotatorRouter({
  baseUrl = "/api/ai-annotator",
}: UseAiAnnotatorRouterOptions = {}) {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [nodes, setNodes] = useState<NodeForAnnotation[]>([]);
  const [nodesLoading, setNodesLoading] = useState(false);
  const [nodesError, setNodesError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    limit: 25,
    offset: 0,
    total: 0,
  });

  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(
    null,
  );
  const [databaseStatsLoading, setDatabaseStatsLoading] = useState(false);
  const [databaseStatsError, setDatabaseStatsError] = useState<string | null>(
    null,
  );

  const [batchOperations, setBatchOperations] = useState<BatchOperation[]>([]);
  const [batchOperationsLoading, setBatchOperationsLoading] = useState(false);
  const [batchOperationsError, setBatchOperationsError] = useState<
    string | null
  >(null);

  const [rules, setRules] = useState<RulesResponse | null>(null);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesError, setRulesError] = useState<string | null>(null);

  const [qualityReport, setQualityReport] = useState<QualityReport | null>(
    null,
  );
  const [qualityReportLoading, setQualityReportLoading] = useState(false);
  const [qualityReportError, setQualityReportError] = useState<string | null>(
    null,
  );

  const [errorCorrectionConfig, setErrorCorrectionConfig] =
    useState<ErrorCorrectionConfig | null>(null);
  const [errorCorrectionConfigLoading, setErrorCorrectionConfigLoading] =
    useState(false);
  const [errorCorrectionConfigError, setErrorCorrectionConfigError] = useState<
    string | null
  >(null);

  const [batchTemplates, setBatchTemplates] = useState<Record<
    string,
    BatchTemplate
  > | null>(null);
  const [batchTemplatesLoading, setBatchTemplatesLoading] = useState(false);
  const [batchTemplatesError, setBatchTemplatesError] = useState<string | null>(
    null,
  );

  const [modelStatistics, setModelStatistics] =
    useState<ModelStatistics | null>(null);
  const [modelStatisticsLoading, setModelStatisticsLoading] = useState(false);
  const [modelStatisticsError, setModelStatisticsError] = useState<
    string | null
  >(null);

  const [lastMeta, setLastMeta] = useState<{
    id: string;
    meta: GeneratedMeta;
  } | null>(null);
  const [lastForm, setLastForm] = useState<{
    id: string;
    form: FormSpec;
  } | null>(null);
  const [lastRule, setLastRule] = useState<{
    id: string;
    rule: DashboardRule;
  } | null>(null);
  const [lastBatch, setLastBatch] = useState<BatchResult | null>(null);
  const [lastPii, setLastPii] = useState<PiiResult[] | null>(null);
  const [lastValidation, setLastValidation] = useState<{
    id: string;
    validation: NodeValidation;
  } | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<{
    id: string;
    analysis: NodeAnalysis;
  } | null>(null);

  // Hilfsfunktion für API-Calls
  const fetchApi = useCallback(
    async <T>(
      endpoint: string,
      options: RequestInit = {},
    ): Promise<ApiResponse<T>> => {
      const url = `${baseUrl}${endpoint}`;

      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          ...options,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error(`API call failed for ${url}:`, error);
        throw error;
      }
    },
    [baseUrl],
  );

  // Status abrufen
  const getStatus = useCallback(async () => {
    setStatusLoading(true);
    setStatusError(null);

    try {
      const result = await fetchApi<StatusResponse>("/status");
      if (result.success && result.data) {
        setStatus(result.data);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setStatusError(message);
    } finally {
      setStatusLoading(false);
    }
  }, [fetchApi]);

  // Health abrufen
  const getHealth = useCallback(async () => {
    setHealthLoading(true);
    setHealthError(null);

    try {
      const result = await fetchApi<HealthStatus>("/health");
      if (result.success && result.data) {
        setHealth(result.data);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setHealthError(message);
    } finally {
      setHealthLoading(false);
    }
  }, [fetchApi]);

  // Knoten auflisten
  const listNodes = useCallback(
    async (params: ListParams) => {
      setNodesLoading(true);
      setNodesError(null);

      try {
        const queryParams = new URLSearchParams();

        if (params.kinds?.length) {
          params.kinds.forEach((kind) => queryParams.append("kinds", kind));
        }
        if (params.missingOnly) {
          queryParams.append("missingOnly", "true");
        }
        if (params.limit) {
          queryParams.append("limit", params.limit.toString());
        }
        if (params.offset) {
          queryParams.append("offset", params.offset.toString());
        }
        if (params.search) {
          queryParams.append("search", params.search);
        }
        if (params.status?.length) {
          params.status.forEach((status) =>
            queryParams.append("status", status),
          );
        }
        if (params.businessArea?.length) {
          params.businessArea.forEach((area) =>
            queryParams.append("businessArea", area),
          );
        }
        if (params.complexity?.length) {
          params.complexity.forEach((complexity) =>
            queryParams.append("complexity", complexity),
          );
        }

        const result = await fetchApi<{
          nodes: NodeForAnnotation[];
          pagination: any;
        }>(`/nodes?${queryParams}`);

        if (result.success && result.data) {
          setNodes(result.data.nodes || []);
          setPagination(
            result.data.pagination || { limit: 25, offset: 0, total: 0 },
          );
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        setNodesError(message);
      } finally {
        setNodesLoading(false);
      }
    },
    [fetchApi],
  );

  // Einzelnen Knoten abrufen
  const getNode = useCallback(
    async (nodeId: string) => {
      try {
        const result = await fetchApi<{ node: NodeForAnnotation }>(
          `/nodes/${encodeURIComponent(nodeId)}`,
        );
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to get node:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Knoten validieren
  const validateNode = useCallback(
    async (nodeId: string) => {
      try {
        const result = await fetchApi<{
          node: NodeForAnnotation;
          validation: NodeValidation;
        }>(`/nodes/${encodeURIComponent(nodeId)}/validate`, { method: "POST" });

        if (result.success && result.data) {
          setLastValidation({ id: nodeId, validation: result.data.validation });
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to validate node:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Datenbank-Statistiken abrufen
  const getDatabaseStats = useCallback(async () => {
    setDatabaseStatsLoading(true);
    setDatabaseStatsError(null);

    try {
      const result = await fetchApi<DatabaseStats>("/database/stats");
      if (result.success && result.data) {
        setDatabaseStats(result.data);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setDatabaseStatsError(message);
    } finally {
      setDatabaseStatsLoading(false);
    }
  }, [fetchApi]);

  // Batch-Operationen abrufen
  const getBatchOperations = useCallback(
    async (limit?: number) => {
      setBatchOperationsLoading(true);
      setBatchOperationsError(null);

      try {
        const queryParams = limit ? `?limit=${limit}` : "";
        const result = await fetchApi<BatchOperation[]>(
          `/database/batches${queryParams}`,
        );
        if (result.success && result.data) {
          setBatchOperations(result.data);
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        setBatchOperationsError(message);
      } finally {
        setBatchOperationsLoading(false);
      }
    },
    [fetchApi],
  );

  // Alte Batches bereinigen
  const cleanupOldBatches = useCallback(
    async (daysToKeep?: number) => {
      try {
        const queryParams = daysToKeep ? `?days=${daysToKeep}` : "";
        const result = await fetchApi<{ message: string }>(
          `/database/batches/cleanup${queryParams}`,
          {
            method: "DELETE",
          },
        );
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to cleanup old batches:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Regeln abrufen
  const getRules = useCallback(
    async (filters?: {
      type?: string;
      widget?: string;
      includeNodes?: boolean;
    }) => {
      setRulesLoading(true);
      setRulesError(null);

      try {
        const queryParams = new URLSearchParams();
        if (filters?.type) queryParams.append("type", filters.type);
        if (filters?.widget) queryParams.append("widget", filters.widget);
        if (filters?.includeNodes !== undefined)
          queryParams.append("includeNodes", filters.includeNodes.toString());

        const endpoint = queryParams.toString()
          ? `/rules?${queryParams}`
          : "/rules";
        const result = await fetchApi<RulesResponse>(endpoint);

        if (result.success && result.data) {
          setRules(result.data);
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        setRulesError(message);
      } finally {
        setRulesLoading(false);
      }
    },
    [fetchApi],
  );

  // NEUE FUNKTIONEN FÜR ERWEITERTE FEATURES

  // Modell-Statistiken abrufen
  const getModelStatistics = useCallback(async () => {
    setModelStatisticsLoading(true);
    setModelStatisticsError(null);

    try {
      const result = await fetchApi<ModelStatistics>("/ai/models");
      if (result.success && result.data) {
        setModelStatistics(result.data);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setModelStatisticsError(message);
    } finally {
      setModelStatisticsLoading(false);
    }
  }, [fetchApi]);

  // System optimieren
  const optimizeSystem = useCallback(async () => {
    try {
      const result = await fetchApi<OptimizationResult>("/system/optimize", {
        method: "POST",
      });
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Failed to optimize system:", error);
      throw error;
    }
  }, [fetchApi]);

  // Bulk-Enhancement durchführen
  const bulkEnhance = useCallback(
    async (
      nodeIds: string[],
      operations: string[] = ["meta", "rule", "form"],
    ) => {
      try {
        const result = await fetchApi<BatchResult>("/bulk-enhance", {
          method: "POST",
          body: JSON.stringify({ nodeIds, operations }),
        });

        if (result.success && result.data) {
          setLastBatch(result.data);
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to perform bulk enhancement:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Monitoring-Status abrufen
  const getMonitoringStatus = useCallback(async () => {
    try {
      const result = await fetchApi<{
        health: HealthStatus;
        models: ModelStatistics;
        database: DatabaseStats;
        timestamp: string;
      }>("/system/monitoring");

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Failed to get monitoring status:", error);
      throw error;
    }
  }, [fetchApi]);

  // Smart Model Selection testen
  const testModelSelection = useCallback(
    async (operation: string = "meta", priority: string = "balanced") => {
      try {
        const result = await fetchApi<{
          operation: string;
          priority: string;
          selectedModel: any;
          availableModels: any[];
        }>("/ai/model-selection-test", {
          method: "POST",
          body: JSON.stringify({ operation, priority }),
        });

        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to test model selection:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Knoten-Analyse abrufen
  const getNodeAnalysis = useCallback(
    async (nodeId: string) => {
      try {
        const result = await fetchApi<{ data: NodeAnalysis }>(
          `/nodes/${encodeURIComponent(nodeId)}/analysis`,
        );
        if (result.success && result.data) {
          setLastAnalysis({ id: nodeId, analysis: result.data.data });
          return result.data.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to get node analysis:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Knoten-Metadaten abrufen
  const getNodeMeta = useCallback(
    async (nodeId: string) => {
      try {
        const result = await fetchApi<GeneratedMeta>(
          `/nodes/${encodeURIComponent(nodeId)}/meta`,
        );
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to get node meta:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Knoten-Regel abrufen
  const getNodeRule = useCallback(
    async (nodeId: string) => {
      try {
        const result = await fetchApi<DashboardRule>(
          `/nodes/${encodeURIComponent(nodeId)}/rule`,
        );
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to get node rule:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Knoten-Formular abrufen
  const getNodeForm = useCallback(
    async (nodeId: string) => {
      try {
        const result = await fetchApi<FormSpec>(
          `/nodes/${encodeURIComponent(nodeId)}/form`,
        );
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to get node form:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Knoten-Schema abrufen
  const getNodeSchema = useCallback(
    async (nodeId: string) => {
      try {
        const result = await fetchApi<any>(
          `/nodes/${encodeURIComponent(nodeId)}/schema`,
        );
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to get node schema:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Knoten-Qualität abrufen
  const getNodeQuality = useCallback(
    async (nodeId: string) => {
      try {
        const result = await fetchApi<any>(
          `/nodes/${encodeURIComponent(nodeId)}/quality`,
        );
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to get node quality:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // BESTEHENDE FUNKTIONEN (angepasst)

  // Metadaten generieren
  const generateMeta = useCallback(
    async (nodeId: string) => {
      try {
        const result = await fetchApi<{
          node: NodeForAnnotation;
          meta: GeneratedMeta;
        }>(`/nodes/${encodeURIComponent(nodeId)}/generate-meta`, {
          method: "POST",
        });

        if (result.success && result.data) {
          setLastMeta({ id: nodeId, meta: result.data.meta });
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to generate meta:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Dashboard-Regel generieren
  const generateRule = useCallback(
    async (nodeId: string) => {
      try {
        const result = await fetchApi<{
          node: NodeForAnnotation;
          rule: DashboardRule;
        }>(`/nodes/${encodeURIComponent(nodeId)}/generate-rule`, {
          method: "POST",
        });

        if (result.success && result.data) {
          setLastRule({ id: nodeId, rule: result.data.rule });
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to generate rule:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Formular generieren
  const generateForm = useCallback(
    async (nodeId: string) => {
      try {
        const result = await fetchApi<{
          node: NodeForAnnotation;
          formSpec: FormSpec;
        }>(`/nodes/${encodeURIComponent(nodeId)}/generate-form`, {
          method: "POST",
        });

        if (result.success && result.data) {
          setLastForm({ id: nodeId, form: result.data.formSpec });
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to generate form:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Schema verbessern
  const enhanceSchema = useCallback(
    async (nodeId: string) => {
      try {
        const result = await fetchApi<{
          node: NodeForAnnotation;
          enhancedSchema: any;
        }>(`/nodes/${encodeURIComponent(nodeId)}/enhance-schema`, {
          method: "POST",
        });

        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to enhance schema:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Vollständige Annotation
  const fullAnnotation = useCallback(
    async (
      nodeId: string,
      options?: { includeValidation?: boolean; parallel?: boolean },
    ) => {
      try {
        const result = await fetchApi<{
          node: NodeForAnnotation;
          meta: GeneratedMeta;
          rule: DashboardRule;
          form: FormSpec;
          validation?: NodeValidation;
        }>(`/nodes/${encodeURIComponent(nodeId)}/full-annotation`, {
          method: "POST",
          body: JSON.stringify(options || {}),
        });

        if (result.success && result.data) {
          setLastMeta({ id: nodeId, meta: result.data.meta });
          setLastRule({ id: nodeId, rule: result.data.rule });
          setLastForm({ id: nodeId, form: result.data.form });
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to perform full annotation:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Batch-Operation ausführen
  const runBatch = useCallback(
    async (operation: BatchOperation) => {
      try {
        const result = await fetchApi<BatchResult>("/batch", {
          method: "POST",
          body: JSON.stringify(operation),
        });

        if (result.success && result.data) {
          setLastBatch(result.data);
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to run batch:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Batch abrufen
  const getBatch = useCallback(
    async (batchId: string) => {
      try {
        const result = await fetchApi<BatchOperation>(
          `/batch/${encodeURIComponent(batchId)}`,
        );
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to get batch:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Batch abbrechen
  const cancelBatch = useCallback(
    async (batchId: string) => {
      try {
        const result = await fetchApi<{ message: string }>(
          `/batch/${encodeURIComponent(batchId)}/cancel`,
          {
            method: "POST",
          },
        );
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to cancel batch:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // PII klassifizieren
  const classifyPii = useCallback(
    async (nodeIds: string[], options?: { detailed?: boolean }) => {
      try {
        const result = await fetchApi<PiiResult[]>("/classify-pii", {
          method: "POST",
          body: JSON.stringify({ nodeIds, ...options }),
        });

        if (result.success && result.data) {
          setLastPii(result.data);
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to classify PII:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Batch-Validierung
  const validateBatch = useCallback(
    async (nodeIds: string[], rules?: string[]) => {
      try {
        const result = await fetchApi<{
          summary: any;
          results: Array<{
            node: NodeForAnnotation;
            validation: NodeValidation;
          }>;
        }>("/validate-batch", {
          method: "POST",
          body: JSON.stringify({ nodeIds, rules }),
        });
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to validate batch:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Quality Report abrufen
  const getQualityReport = useCallback(async () => {
    setQualityReportLoading(true);
    setQualityReportError(null);

    try {
      const result = await fetchApi<QualityReport>("/quality/report");
      if (result.success && result.data) {
        setQualityReport(result.data);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setQualityReportError(message);
    } finally {
      setQualityReportLoading(false);
    }
  }, [fetchApi]);

  // Error Correction Konfiguration abrufen
  const getErrorCorrectionConfig = useCallback(async () => {
    setErrorCorrectionConfigLoading(true);
    setErrorCorrectionConfigError(null);

    try {
      const result = await fetchApi<ErrorCorrectionConfig>(
        "/error-correction/config",
      );
      if (result.success && result.data) {
        setErrorCorrectionConfig(result.data);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setErrorCorrectionConfigError(message);
    } finally {
      setErrorCorrectionConfigLoading(false);
    }
  }, [fetchApi]);

  // Error Correction Konfiguration aktualisieren
  const updateErrorCorrectionConfig = useCallback(
    async (config: ErrorCorrectionConfig) => {
      try {
        const result = await fetchApi<ErrorCorrectionConfig>(
          "/error-correction/config",
          {
            method: "PUT",
            body: JSON.stringify(config),
          },
        );
        if (result.success && result.data) {
          setErrorCorrectionConfig(result.data);
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to update error correction config:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Batch-Templates abrufen
  const getBatchTemplates = useCallback(async () => {
    setBatchTemplatesLoading(true);
    setBatchTemplatesError(null);

    try {
      const result =
        await fetchApi<Record<string, BatchTemplate>>("/batch-templates");
      if (result.success && result.data) {
        setBatchTemplates(result.data);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setBatchTemplatesError(message);
    } finally {
      setBatchTemplatesLoading(false);
    }
  }, [fetchApi]);

  // AI-Verbindung testen
  const testAiConnection = useCallback(
    async (prompt?: string, model?: string, provider?: string) => {
      try {
        const result = await fetchApi<{
          prompt: string;
          response: string;
          parsed: any;
        }>("/debug/ai-test", {
          method: "POST",
          body: JSON.stringify({ prompt, model, provider }),
        });
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to test AI connection:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  // Prompt debuggen
  const debugPrompt = useCallback(
    async (nodeId: string, promptType: string, options?: any) => {
      try {
        const result = await fetchApi<{
          node: NodeForAnnotation;
          prompt: string;
          length: number;
        }>("/debug/prompt", {
          method: "POST",
          body: JSON.stringify({ nodeId, promptType, options }),
        });
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to debug prompt:", error);
        throw error;
      }
    },
    [fetchApi],
  );

  return {
    // Status & Health
    status,
    statusLoading,
    statusError,
    getStatus,

    health,
    healthLoading,
    healthError,
    getHealth,

    // Nodes Management
    nodes,
    nodesLoading,
    nodesError,
    pagination,
    listNodes,
    getNode,
    validateNode,
    getNodeAnalysis,
    getNodeMeta,
    getNodeRule,
    getNodeForm,
    getNodeSchema,
    getNodeQuality,

    // Database & Statistics
    databaseStats,
    databaseStatsLoading,
    databaseStatsError,
    getDatabaseStats,

    batchOperations,
    batchOperationsLoading,
    batchOperationsError,
    getBatchOperations,
    cleanupOldBatches,

    // Rules & Forms
    rules,
    rulesLoading,
    rulesError,
    getRules,

    // Quality & Validation
    qualityReport,
    qualityReportLoading,
    qualityReportError,
    getQualityReport,

    errorCorrectionConfig,
    errorCorrectionConfigLoading,
    errorCorrectionConfigError,
    getErrorCorrectionConfig,
    updateErrorCorrectionConfig,

    batchTemplates,
    batchTemplatesLoading,
    batchTemplatesError,
    getBatchTemplates,

    // AI Model Management
    modelStatistics,
    modelStatisticsLoading,
    modelStatisticsError,
    getModelStatistics,
    optimizeSystem,
    testModelSelection,

    // Single Operations
    generateMeta,
    generateRule,
    generateForm,
    enhanceSchema,
    fullAnnotation,

    // Batch Operations
    runBatch,
    getBatch,
    cancelBatch,
    classifyPii,
    validateBatch,
    bulkEnhance,

    // System & Monitoring
    getMonitoringStatus,

    // Debug & Test
    testAiConnection,
    debugPrompt,

    // Results
    lastMeta,
    lastForm,
    lastRule,
    lastBatch,
    lastPii,
    lastValidation,
    lastAnalysis,
  };
}

export type UseAiAnnotatorRouterReturn = ReturnType<
  typeof useAiAnnotatorRouter
>;
