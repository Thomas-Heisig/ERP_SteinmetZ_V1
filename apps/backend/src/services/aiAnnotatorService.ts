// SPDX-License-Identifier: MIT
// apps/backend/src/services/aiAnnotatorService.ts

import db from "./dbService.js";
import { EventEmitter } from "events";
import * as os from "os";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("ai-annotator");

/* -------------------------------------------------------------------------- */
/*                     KONFIGURATION & DEFAULTS                              */
/* -------------------------------------------------------------------------- */

const DEFAULT_AI_PROVIDER = process.env.AI_PROVIDER || "ollama";
const DEFAULT_AI_MODEL =
  process.env.AI_DEFAULT_MODEL || process.env.OPENAI_MODEL || "qwen3:4b";

/* -------------------------------------------------------------------------- */
/*                           TYPE‑DEFINITIONS                                 */
/* -------------------------------------------------------------------------- */

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

export type AIProvider =
  | "ollama"
  | "anthropic"
  | "local"
  | "hybrid"
  | "openai"
  | "none";

export type ModelConfig = {
  name: string;
  provider: AIProvider;
  capabilities: string[];
  maxTokens: number;
  contextWindow: number;
  costPerToken?: number;
  speed: "slow" | "medium" | "fast";
  accuracy: "low" | "medium" | "high";
  available: boolean;
  priority: number; // Niedrigere Zahl = höhere Priorität
  healthCheck?: () => Promise<boolean>;
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

/* -------------------------------------------------------------------------- */
/*                     FEHLENDE TYP‑DEFINITIONEN                               */
/* -------------------------------------------------------------------------- */

export type GeneratedRule = {
  id: string;
  rule: DashboardRule;
  quality: {
    confidence: number;
    evidence: string[];
    generatedBy: "ai" | "fallback" | "hybrid";
    modelUsed?: string;
  };
};

export type GeneratedFormSpec = {
  id: string;
  form: FormSpec;
  quality: {
    confidence: number;
    evidence: string[];
    generatedBy: "ai" | "fallback" | "hybrid";
    modelUsed?: string;
  };
};

export type PiiResult = {
  id: string;
  piiClass: "none" | "low" | "medium" | "high";
  reason: string;
  confidence: number;
  generatedBy: "ai" | "fallback" | "hybrid";
};

/* -------------------------------------------------------------------------- */
/*                        SMART MODEL SELECTOR                                 */
/* -------------------------------------------------------------------------- */

class SmartModelSelector {
  private models: ModelConfig[] = [];
  private healthStatus: Map<string, boolean> = new Map();
  private performanceMetrics: Map<
    string,
    { success: number; total: number; avgResponseTime: number }
  > = new Map();

  constructor(models: ModelConfig[]) {
    this.models = models;
    this.initializeHealthChecks();
  }

  private async initializeHealthChecks() {
    for (const model of this.models) {
      if (model.healthCheck) {
        try {
          const isHealthy = await model.healthCheck();
          this.healthStatus.set(model.name, isHealthy);
        } catch {
          this.healthStatus.set(model.name, false);
        }
      } else {
        this.healthStatus.set(model.name, true);
      }
    }
  }

  /**
   * Wählt das beste Modell für die übergebene Operation aus.
   *
   * @param operation  Der zu erledigende AI‑Task (z. B. "meta", "rule"...)
   * @param priority   "speed" | "accuracy" | "balanced"
   */
  async selectBestModel(
    operation: string,
    priority: "speed" | "accuracy" | "balanced" = "balanced",
  ): Promise<ModelConfig> {
    // 1️⃣ verfügbare & gesunde Modelle filtern
    const availableModels = this.models.filter((model) => {
      const healthy = this.healthStatus.get(model.name) !== false;
      const capable =
        model.capabilities.includes(operation) ||
        model.capabilities.includes("complex");
      return model.available && healthy && capable;
    });

    if (availableModels.length === 0) {
      return this.getFallbackModel();
    }

    // 2️⃣ Scoring basierend auf Priorität & Performance
    const scored = availableModels.map((model) => {
      let score = model.priority * 100; // Basis‑Score = Priorität

      const metrics = this.performanceMetrics.get(model.name);
      if (metrics && metrics.total > 0) {
        const successRate = metrics.success / metrics.total;
        score += successRate * 50;
        score += (1000 / Math.max(metrics.avgResponseTime, 100)) * 10;
      }

      // Prioritäts‑Gewichtung
      if (priority === "speed") {
        score +=
          model.speed === "fast" ? 30 : model.speed === "medium" ? 15 : 0;
      } else if (priority === "accuracy") {
        score +=
          model.accuracy === "high" ? 40 : model.accuracy === "medium" ? 20 : 0;
      } else {
        // balanced
        score +=
          model.accuracy === "high" ? 20 : model.accuracy === "medium" ? 10 : 0;
        score +=
          model.speed === "fast" ? 20 : model.speed === "medium" ? 10 : 0;
      }

      return { model, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].model;
  }

  updatePerformanceMetrics(
    modelName: string,
    success: boolean,
    responseTime: number,
  ) {
    const cur = this.performanceMetrics.get(modelName) || {
      success: 0,
      total: 0,
      avgResponseTime: 0,
    };
    cur.total++;
    if (success) cur.success++;
    cur.avgResponseTime =
      (cur.avgResponseTime * (cur.total - 1) + responseTime) / cur.total;
    this.performanceMetrics.set(modelName, cur);
  }

  async checkModelHealth(model: ModelConfig): Promise<boolean> {
    if (model.healthCheck) {
      try {
        const healthy = await model.healthCheck();
        this.healthStatus.set(model.name, healthy);
        return healthy;
      } catch {
        this.healthStatus.set(model.name, false);
        return false;
      }
    }
    return true;
  }

  private getFallbackModel(): ModelConfig {
    const fallback = this.models.find((m) => m.name === "fallback");
    if (!fallback) {
      throw new Error("Kein Fallback‑Modell verfügbar");
    }
    return fallback;
  }

  getHealthStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    this.models.forEach((model) => {
      status[model.name] = this.healthStatus.get(model.name) ?? true;
    });
    return status;
  }
}

/* -------------------------------------------------------------------------- */
/*                             DATABASE TOOL                                    */
/* -------------------------------------------------------------------------- */

export class DatabaseTool {
  private static instance: DatabaseTool;

  static getInstance(): DatabaseTool {
    if (!DatabaseTool.instance) {
      DatabaseTool.instance = new DatabaseTool();
    }
    return DatabaseTool.instance;
  }

  /** Sammle Statistik‑Daten zu den bereits annotierten Knoten */
  async getNodeStatistics(): Promise<{
    total: number;
    byKind: Record<string, number>;
    byStatus: Record<string, number>;
    annotationProgress: number;
    averageConfidence: number;
    qualityDistribution: Record<string, number>;
  }> {
    try {
      const nodes = (await db.all(`
        SELECT kind, annotation_status, meta_json
        FROM functions_nodes
        WHERE meta_json IS NOT NULL
      `)) as Array<{
        kind: string;
        annotation_status?: string | null;
        meta_json?: any;
      }>;

      const stats = {
        total: nodes.length,
        byKind: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        annotationProgress: 0,
        averageConfidence: 0,
        qualityDistribution: { high: 0, medium: 0, low: 0 },
      };

      let totalConfidence = 0;
      let nodesWithConf = 0;

      nodes.forEach((n) => {
        stats.byKind[n.kind] = (stats.byKind[n.kind] || 0) + 1;
        const status = n.annotation_status || "unknown";
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

        if (n.meta_json?.quality) {
          const conf = n.meta_json.quality.confidence ?? 0;
          totalConfidence += conf;
          nodesWithConf++;

          if (conf >= 0.8) stats.qualityDistribution.high++;
          else if (conf >= 0.5) stats.qualityDistribution.medium++;
          else stats.qualityDistribution.low++;
        }
      });

      stats.annotationProgress =
        (nodes.length / (await this.getTotalNodeCount())) * 100;
      stats.averageConfidence =
        nodesWithConf > 0 ? totalConfidence / nodesWithConf : 0;

      return stats;
    } catch (e) {
      console.error("Error getting node statistics:", e);
      throw e;
    }
  }

  async getTotalNodeCount(): Promise<number> {
    const res = (await db.get(
      "SELECT COUNT(*) as count FROM functions_nodes",
    )) as { count?: number } | undefined;
    return res?.count ?? 0;
  }

  async getBatchOperations(limit: number = 50): Promise<BatchOperation[]> {
    try {
      const rows = (await db.all(
        `
        SELECT * FROM batch_operations 
        ORDER BY created_at DESC 
        LIMIT ?
      `,
        [limit],
      )) as Array<{
        id: string;
        operation: string;
        filters: string;
        options?: string | null;
        status?: string;
        progress?: number;
        created_at?: string;
        started_at?: string;
        completed_at?: string;
      }>;

      return rows.map((r: any) => ({
        ...r,
        filters: r.filters ? JSON.parse(r.filters) : {},
        options: r.options ? JSON.parse(r.options) : {},
      }));
    } catch (e) {
      console.error("Error getting batch operations:", e);
      return [];
    }
  }

  async saveBatchOperation(operation: BatchOperation): Promise<string> {
    const id =
      operation.id ||
      `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.run(
      `
      INSERT OR REPLACE INTO batch_operations 
        (id, operation, filters, options, status, progress, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        operation.operation,
        JSON.stringify(operation.filters),
        JSON.stringify(operation.options || {}),
        operation.status || "pending",
        operation.progress || 0,
        operation.created_at || new Date().toISOString(),
      ],
    );

    return id;
  }

  async updateBatchProgress(
    id: string,
    progress: number,
    status?: string,
  ): Promise<void> {
    const updates: string[] = ["progress = ?"];
    const params: any[] = [progress];

    if (status) {
      updates.push("status = ?");
      params.push(status);
    }

    if (status === "completed" || status === "failed") {
      updates.push("completed_at = ?");
      params.push(new Date().toISOString());
    }

    params.push(id);

    await db.run(
      `
      UPDATE batch_operations 
      SET ${updates.join(", ")} 
      WHERE id = ?
    `,
      params,
    );
  }

  async cleanupOldBatches(daysToKeep: number = 30): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    await db.run(
      `
      DELETE FROM batch_operations 
      WHERE created_at < ?
    `,
      [cutoff.toISOString()],
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                           HAUService – AI‑Annotator                         */
/* -------------------------------------------------------------------------- */

export class AiAnnotatorService extends EventEmitter {
  private provider: AIProvider;
  private currentModel: string;
  private availableModels: ModelConfig[];
  private modelSelector: SmartModelSelector;
  private errorCorrection: ErrorCorrectionConfig;
  private databaseTool: DatabaseTool;
  private activeBatches: Map<string, BatchOperation> = new Map();
  private healthStatus: HealthStatus = {
    overall: "healthy",
    database: true,
    aiProviders: {},
    memory: { used: 0, total: 0, percentage: 0 },
    lastHealthCheck: new Date().toISOString(),
  };

  constructor() {
    super();
    this.provider = this.detectProvider();
    this.availableModels = this.initializeModels();
    this.modelSelector = new SmartModelSelector(this.availableModels);
    this.currentModel = this.getDefaultModel();
    this.errorCorrection = this.initializeErrorCorrection();
    this.databaseTool = DatabaseTool.getInstance();

    this.setupEventHandlers();
    this.startHealthMonitoring();
  }

  /* ---------------------------------------------------------------------- */
  /*                     EVENT‑HANDLER & HEALTH‑MONITORING                  */
  /* ---------------------------------------------------------------------- */

  private setupEventHandlers() {
    this.on("batch_progress", (batchId: string, progress: number) => {
      this.databaseTool.updateBatchProgress(batchId, progress);
    });

    this.on("batch_complete", (batchId: string) => {
      this.databaseTool.updateBatchProgress(batchId, 100, "completed");
      this.activeBatches.delete(batchId);
    });

    this.on("batch_error", (batchId: string, err: Error) => {
      this.databaseTool.updateBatchProgress(batchId, 0, "failed");
      this.activeBatches.delete(batchId);
    });

    this.on("model_health_changed", (modelName: string, healthy: boolean) => {
      logger.info(
        { modelName, healthy },
        `Model ${modelName} health changed: ${healthy ? "healthy" : "unhealthy"}`,
      );
    });
  }

  private startHealthMonitoring() {
    // Alle 30 s prüfen
    setInterval(() => this.performHealthCheck().catch(console.error), 30000);
    // Sofort beim Start prüfen
    this.performHealthCheck().catch(console.error);
  }

  private async performHealthCheck() {
    const memory = process.memoryUsage();
    const totalMem = os.totalmem();

    // Datenbank
    let dbHealthy = true;
    try {
      await this.databaseTool.getTotalNodeCount();
    } catch {
      dbHealthy = false;
    }

    // AI‑Provider Health‑Checks
    const providerHealth: Record<string, boolean> = {};
    for (const model of this.availableModels) {
      if (model.provider !== "none") {
        const healthy = await this.modelSelector.checkModelHealth(model);
        providerHealth[model.name] = healthy;
      }
    }

    const allProvidersHealthy = Object.values(providerHealth).every(Boolean);
    const overall =
      dbHealthy && allProvidersHealthy
        ? "healthy"
        : dbHealthy
          ? "degraded"
          : "unhealthy";

    this.healthStatus = {
      overall,
      database: dbHealthy,
      aiProviders: providerHealth,
      memory: {
        used: memory.rss,
        total: totalMem,
        percentage: (memory.rss / totalMem) * 100,
      },
      lastHealthCheck: new Date().toISOString(),
    };

    this.emit("health_status", this.healthStatus);
  }

  /* ---------------------------------------------------------------------- */
  /*                        PROVIDER & MODEL LOGIC                           */
  /* ---------------------------------------------------------------------- */

  private detectProvider(): AIProvider {
    const env = (process.env.AI_PROVIDER || "").toLowerCase();

    if (env === "openai" && process.env.OPENAI_API_KEY) return "openai";
    if (env === "ollama") return "ollama";
    if (env === "anthropic" && process.env.ANTHROPIC_API_KEY)
      return "anthropic";
    if (env === "local" && process.env.LOCAL_MODEL_PATH) return "local";
    if (env === "hybrid") return "hybrid";

    return "none";
  }

  private initializeModels(): ModelConfig[] {
    const ollamaHealthCheck = async (): Promise<boolean> => {
      try {
        const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 5000);
        const res = await fetch(`${baseUrl}/api/tags`, { signal: ctrl.signal });
        clearTimeout(timeout);
        return res.ok;
      } catch (e: any) {
        if (e?.name === "AbortError") return false;
        return false;
      }
    };

    const openaiHealthCheck = async (): Promise<boolean> =>
      !!process.env.OPENAI_API_KEY;
    const anthropicHealthCheck = async (): Promise<boolean> =>
      !!process.env.ANTHROPIC_API_KEY;

    const models: ModelConfig[] = [
      // Ollama – höchste Priorität
      {
        name: "qwen3:8b",
        provider: "ollama",
        capabilities: [
          "meta",
          "rules",
          "forms",
          "schema",
          "pii",
          "complex",
          "enhancement",
        ],
        maxTokens: 32768,
        contextWindow: 32768,
        speed: "medium",
        accuracy: "high",
        available: true,
        priority: 1,
        healthCheck: ollamaHealthCheck,
      },
      {
        name: "qwen3:4b",
        provider: "ollama",
        capabilities: ["meta", "rules", "forms"],
        maxTokens: 32768,
        contextWindow: 32768,
        speed: "fast",
        accuracy: "medium",
        available: true,
        priority: 2,
        healthCheck: ollamaHealthCheck,
      },
      {
        name: "llama3.1:8b",
        provider: "ollama",
        capabilities: ["meta", "rules", "forms"],
        maxTokens: 8192,
        contextWindow: 8192,
        speed: "medium",
        accuracy: "medium",
        available: true,
        priority: 3,
        healthCheck: ollamaHealthCheck,
      },

      // Lokale Modelle
      {
        name: "local-llama",
        provider: "local",
        capabilities: ["meta", "rules", "forms"],
        maxTokens: 4096,
        contextWindow: 4096,
        speed: "slow",
        accuracy: "medium",
        available: !!process.env.LOCAL_MODEL_PATH,
        priority: 4,
      },

      // Cloud‑Provider
      {
        name: "claude-3-5-sonnet",
        provider: "anthropic",
        capabilities: [
          "meta",
          "rules",
          "forms",
          "schema",
          "pii",
          "complex",
          "enhancement",
        ],
        maxTokens: 200000,
        contextWindow: 200000,
        speed: "medium",
        accuracy: "high",
        available: !!process.env.ANTHROPIC_API_KEY,
        priority: 5,
        healthCheck: anthropicHealthCheck,
      },
      {
        name: "gpt-4o",
        provider: "openai",
        capabilities: [
          "meta",
          "rules",
          "forms",
          "schema",
          "pii",
          "complex",
          "enhancement",
        ],
        maxTokens: 128000,
        contextWindow: 128000,
        speed: "fast",
        accuracy: "high",
        available: !!process.env.OPENAI_API_KEY,
        priority: 6,
        healthCheck: openaiHealthCheck,
      },
      {
        name: "gpt-4o-mini",
        provider: "openai",
        capabilities: ["meta", "rules", "forms", "schema", "pii"],
        maxTokens: 128000,
        contextWindow: 128000,
        speed: "fast",
        accuracy: "medium",
        available: !!process.env.OPENAI_API_KEY,
        priority: 7,
        healthCheck: openaiHealthCheck,
      },

      // Fallback
      {
        name: "fallback",
        provider: "none",
        capabilities: ["meta", "rules", "forms"],
        maxTokens: 1000,
        contextWindow: 1000,
        speed: "fast",
        accuracy: "low",
        available: true,
        priority: 100,
      },
    ];

    // Nur verfügbare Modelle zurückgeben
    return models.filter((m) => m.available);
  }

  private getDefaultModel(): string {
    switch (this.provider) {
      case "openai":
        return process.env.OPENAI_MODEL || "gpt-4o-mini";
      case "ollama":
        return process.env.OLLAMA_MODEL || "qwen3:4b";
      case "anthropic":
        return process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet";
      case "local":
        return process.env.LOCAL_MODEL_NAME || "local-llama";
      default:
        return "fallback";
    }
  }

  private initializeErrorCorrection(): ErrorCorrectionConfig {
    return {
      enabled: process.env.ERROR_CORRECTION !== "false",
      maxRetries: parseInt(process.env.MAX_RETRIES || "3"),
      retryDelay: parseInt(process.env.RETRY_DELAY_MS || "1000"),
      fallbackModels: (
        process.env.FALLBACK_MODELS || "qwen3:4b,fallback"
      ).split(","),
      validationRules: (
        process.env.VALIDATION_RULES ||
        "json,required_fields,business_area,confidence"
      ).split(","),
      autoCorrect: process.env.AUTO_CORRECT === "true",
      qualityThreshold: parseFloat(process.env.QUALITY_THRESHOLD || "0.6"),
    };
  }

  /* ---------------------------------------------------------------------- */
  /*                        ÖFFENTLICHE STATUS‑METHODEN                      */
  /* ---------------------------------------------------------------------- */

  async getHealthStatus(): Promise<HealthStatus> {
    await this.performHealthCheck();
    return this.healthStatus;
  }

  async getModelStatistics(): Promise<{
    availableModels: string[];
    healthStatus: Record<string, boolean>;
    performanceMetrics: Record<string, any>;
    recommendations: string[];
  }> {
    const health = this.modelSelector.getHealthStatus();
    const availableModels = this.availableModels
      .filter((m) => m.available)
      .map((m) => m.name);

    const recommendations: string[] = [];
    if (
      !availableModels.includes("qwen3:8b") &&
      !availableModels.includes("qwen3:4b")
    ) {
      recommendations.push(
        "Installieren Sie qwen3:4b (oder qwen3:8b) für bessere Performance",
      );
    }
    if (this.healthStatus.overall === "degraded") {
      recommendations.push(
        "Einige AI‑Provider sind nicht erreichbar – prüfen Sie die Konfiguration",
      );
    }

    return {
      availableModels,
      healthStatus: health,
      performanceMetrics: {}, // optional erweiterbar
      recommendations,
    };
  }

  async optimizeConfiguration(): Promise<{
    changes: string[];
    optimized: boolean;
  }> {
    const changes: string[] = [];
    let optimized = false;

    // Ollama-Erreichbarkeit prüfen
    try {
      const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
      const r = await fetch(`${baseUrl}/api/tags`);
      if (r.ok && this.provider !== "ollama") {
        changes.push("Ollama ist verfügbar – setze als primären Provider");
        this.provider = "ollama";
        optimized = true;
      }
    } catch {
      changes.push("Ollama nicht erreichbar");
    }

    // Modell‑Prioritäten prüfen
    const best = await this.modelSelector.selectBestModel("meta");
    if (best && best.name !== this.currentModel) {
      changes.push(
        `Wechsele Modell von ${this.currentModel} zu ${best.name} für bessere Leistung`,
      );
      this.currentModel = best.name;
      optimized = true;
    }

    return { changes, optimized };
  }

  /* ---------------------------------------------------------------------- */
  /*                        KANDIDATEN‑LISTE (DB‑Abfrage)                     */
  /* ---------------------------------------------------------------------- */

  async listCandidates(opts: {
    kinds?: string[];
    missingOnly?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
    status?: string[];
    businessArea?: string[];
    complexity?: string[];
  }): Promise<NodeForAnnotation[]> {
    const limit = Math.max(1, Math.min(10_000, opts.limit ?? 500));
    const offset = Math.max(0, opts.offset ?? 0);
    const params: any[] = [];

    let sql = `
      SELECT 
        id, title, kind, path_json as path,
        meta_json, schema_json, aa_json, source_file,
        created_at, updated_at, last_annotated, annotation_status
      FROM functions_nodes
      WHERE 1=1
    `;

    if (opts.missingOnly) {
      sql += ` AND (meta_json IS NULL OR meta_json = '' OR json_type(meta_json) = 'null')`;
    }

    if (opts.kinds?.length) {
      sql += ` AND kind IN (${opts.kinds.map(() => "?").join(",")})`;
      params.push(...opts.kinds);
    }

    if (opts.search) {
      sql += ` AND (title LIKE ? OR id LIKE ? OR path_json LIKE ?)`;
      const term = `%${opts.search}%`;
      params.push(term, term, term);
    }

    if (opts.status?.length) {
      sql += ` AND annotation_status IN (${opts.status.map(() => "?").join(",")})`;
      params.push(...opts.status);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = (await db.all(sql, params)) as any[];

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      kind: r.kind,
      path: typeof r.path === "string" ? JSON.parse(r.path) : r.path,
      meta_json: r.meta_json ?? null,
      schema_json: r.schema_json ?? null,
      aa_json: r.aa_json ?? null,
      source_file: r.source_file ?? null,
      created_at: r.created_at,
      updated_at: r.updated_at,
      last_annotated: r.last_annotated,
      annotation_status: r.annotation_status || "pending",
    }));
  }

  /* ---------------------------------------------------------------------- */
  /*                     SPEICHER‑METHODEN (DB)                               */
  /* ---------------------------------------------------------------------- */

  async saveMeta(id: string, meta: GeneratedMeta): Promise<void> {
    await db.run(
      `
      UPDATE functions_nodes 
      SET meta_json = ?, updated_at = ?, last_annotated = ?, annotation_status = ?
      WHERE id = ?
    `,
      [
        JSON.stringify(meta),
        new Date().toISOString(),
        new Date().toISOString(),
        "completed",
        id,
      ],
    );
  }

  async saveRule(id: string, rule: DashboardRule): Promise<void> {
    const currentMeta = await this.getNodeMeta(id);
    const updatedMeta = {
      ...currentMeta,
      rule,
      updated_at: new Date().toISOString(),
      last_annotated: new Date().toISOString(),
    };
    await this.saveMeta(id, updatedMeta);
  }

  async saveFormSpec(id: string, formSpec: FormSpec): Promise<void> {
    const currentMeta = await this.getNodeMeta(id);
    const updatedMeta = {
      ...currentMeta,
      formSpec,
      updated_at: new Date().toISOString(),
      last_annotated: new Date().toISOString(),
    };
    await this.saveMeta(id, updatedMeta);
  }

  /* ---------------------------------------------------------------------- */
  /*                           KI‑GENERIERUNG                                 */
  /* ---------------------------------------------------------------------- */

  async generateMeta(
    node: NodeForAnnotation,
    retryCount = 0,
  ): Promise<GeneratedMeta> {
    // Echtzeit‑Fallback, wenn Provider "none" ist
    if (
      this.provider === "none" ||
      retryCount >= this.errorCorrection.maxRetries
    ) {
      return this.generateEnhancedFallbackMeta(node);
    }

    const start = Date.now();

    try {
      const model = await this.modelSelector.selectBestModel(
        "meta",
        "balanced",
      );
      const prompt = model.capabilities.includes("complex")
        ? this.buildEnhancedMetaPrompt(node)
        : this.buildSimpleMetaPrompt(node);
      const raw = await this.callAIWithModel(prompt, model);
      const meta = this.parseMetaJson(raw, node);
      const validation = this.validateMeta(meta);

      if (!validation.valid && this.errorCorrection.autoCorrect) {
        console.warn(
          `Meta‑Validierung fehlgeschlagen für ${node.id}, versuche Korrektur`,
        );
        return await this.correctMetaGeneration(
          node,
          meta,
          validation.errors,
          retryCount,
        );
      }

      // Qualitäts‑Score basierend auf Confidence & optionaler Bewertung
      const qualityScore = meta.quality?.confidence ?? 0.5;

      this.modelSelector.updatePerformanceMetrics(
        model.name,
        true,
        Date.now() - start,
      );

      return {
        ...meta,
        quality: {
          confidence: qualityScore,
          evidence: meta.quality?.evidence ?? ["Automatisch generiert"],
          generatedBy: "ai",
          modelUsed: model.name,
          validationScore: qualityScore,
        },
      };
    } catch (error) {
      console.warn(
        `AI‑Aufruf für ${node.id} fehlgeschlagen (Versuch ${retryCount + 1}):`,
        error,
      );
      this.modelSelector.updatePerformanceMetrics(
        this.currentModel,
        false,
        Date.now() - start,
      );

      if (
        this.errorCorrection.enabled &&
        retryCount < this.errorCorrection.maxRetries
      ) {
        await this.delay(this.errorCorrection.retryDelay * (retryCount + 1));
        return this.generateMeta(node, retryCount + 1);
      }

      return this.generateEnhancedFallbackMeta(node);
    }
  }

  async generateRule(
    node: NodeForAnnotation,
    retryCount = 0,
  ): Promise<DashboardRule> {
    if (
      this.provider === "none" ||
      retryCount >= this.errorCorrection.maxRetries
    ) {
      return this.generateFallbackRule(node);
    }

    const start = Date.now();

    try {
      const prompt = this.buildRulePrompt(node);
      const raw = await this.callAI(prompt, "rule");
      const rule = this.parseRuleJson(raw);
      this.modelSelector.updatePerformanceMetrics(
        this.currentModel,
        true,
        Date.now() - start,
      );
      return rule;
    } catch (error) {
      console.warn(
        `Rule‑Generation fehlgeschlagen für ${node.id} (Versuch ${retryCount + 1}):`,
        error,
      );
      if (
        this.errorCorrection.enabled &&
        retryCount < this.errorCorrection.maxRetries
      ) {
        await this.delay(this.errorCorrection.retryDelay * (retryCount + 1));
        return this.generateRule(node, retryCount + 1);
      }
      return this.generateFallbackRule(node);
    }
  }

  async generateFormSpec(
    node: NodeForAnnotation,
    retryCount = 0,
  ): Promise<FormSpec> {
    if (
      this.provider === "none" ||
      retryCount >= this.errorCorrection.maxRetries
    ) {
      return this.generateFallbackForm(node);
    }

    const start = Date.now();

    try {
      const prompt = this.buildFormPrompt(node);
      const raw = await this.callAI(prompt, "form");
      const form = this.parseFormJson(raw);
      this.modelSelector.updatePerformanceMetrics(
        this.currentModel,
        true,
        Date.now() - start,
      );
      return form;
    } catch (error) {
      console.warn(
        `Form‑Spec‑Generation fehlgeschlagen für ${node.id} (Versuch ${retryCount + 1}):`,
        error,
      );
      if (
        this.errorCorrection.enabled &&
        retryCount < this.errorCorrection.maxRetries
      ) {
        await this.delay(this.errorCorrection.retryDelay * (retryCount + 1));
        return this.generateFormSpec(node, retryCount + 1);
      }
      return this.generateFallbackForm(node);
    }
  }

  async enhanceSchema(node: NodeForAnnotation): Promise<any> {
    if (this.provider === "none") {
      return node.schema_json || {};
    }

    try {
      const prompt = this.buildSchemaEnhancementPrompt(node);
      const raw = await this.callAI(prompt, "schema");
      return JSON.parse(raw);
    } catch (error) {
      console.warn(`Schema‑Verbesserung fehlgeschlagen für ${node.id}:`, error);
      return node.schema_json || {};
    }
  }

  async classifyPii(nodes: NodeForAnnotation[]): Promise<PiiResult[]> {
    if (this.provider === "none") {
      return nodes.map((n) => ({
        id: n.id,
        piiClass: this.guessPiiClass(n),
        reason: "Fallback‑Klassifizierung",
        confidence: 0.3,
        generatedBy: "fallback",
      }));
    }

    try {
      const prompt = this.buildPiiClassificationPrompt(nodes);
      const raw = await this.callAI(prompt, "pii");
      return this.parsePiiClassification(raw, nodes);
    } catch (error) {
      console.warn(`PII‑Klassifizierung fehlgeschlagen:`, error);
      return nodes.map((n) => ({
        id: n.id,
        piiClass: this.guessPiiClass(n),
        reason: "Fallback nach Fehler",
        confidence: 0.3,
        generatedBy: "fallback",
      }));
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                        AI‑CALL WRAPPERS & FALLBACKS                       */
  /* ---------------------------------------------------------------------- */

  private async callAI(prompt: string, operation: string): Promise<string> {
    const model = this.selectModelForOperation(operation);
    try {
      switch (model.provider) {
        case "openai":
          return await this.callOpenAI(prompt, model.name);
        case "ollama":
          return await this.callOllama(prompt, model.name);
        case "anthropic":
          return await this.callAnthropic(prompt, model.name);
        case "local":
          return await this.callLocal(prompt);
        default:
          throw new Error(`Unsupported provider: ${model.provider}`);
      }
    } catch (error) {
      console.warn(
        `AI‑Call mit Modell ${model.name} fehlgeschlagen – Versuche Fallback`,
        error,
      );
      return await this.fallbackAI(prompt, operation, error as Error);
    }
  }

  /**
   * Call AI using a provided ModelConfig instance. This is used in places where
   * the SmartModelSelector returns a chosen model (e.g., for corrections).
   */
  private async callAIWithModel(
    prompt: string,
    model: ModelConfig,
    operation: string = "meta",
  ): Promise<string> {
    const start = Date.now();

    // Sofortiger Fallback für "none" Provider
    if (model.provider === "none") {
      logger.info(
        { operation },
        `[callAIWithModel] Provider "none" - verwende Fallback für ${operation}`,
      );
      return this.generateLocalFallback(operation);
    }

    try {
      switch (model.provider) {
        case "openai": {
          const res = await this.callOpenAI(prompt, model.name);
          this.modelSelector.updatePerformanceMetrics(
            model.name,
            true,
            Date.now() - start,
          );
          return res;
        }
        case "ollama": {
          const res = await this.callOllama(prompt, model.name);
          this.modelSelector.updatePerformanceMetrics(
            model.name,
            true,
            Date.now() - start,
          );
          return res;
        }
        case "anthropic": {
          const res = await this.callAnthropic(prompt, model.name);
          this.modelSelector.updatePerformanceMetrics(
            model.name,
            true,
            Date.now() - start,
          );
          return res;
        }
        case "local": {
          const res = await this.callLocal(prompt);
          this.modelSelector.updatePerformanceMetrics(
            model.name,
            true,
            Date.now() - start,
          );
          return res;
        }
        default:
          throw new Error(`Unsupported provider: ${model.provider}`);
      }
    } catch (error) {
      console.warn(
        `[callAIWithModel] Aufruf mit Modell ${model.name} fehlgeschlagen:`,
        error,
      );
      this.modelSelector.updatePerformanceMetrics(
        model.name,
        false,
        Date.now() - start,
      );
      return this.generateLocalFallback(operation);
    }
  }

  /** Aufruf bei OpenAI (Chat‑Completion) */
  private async callOpenAI(prompt: string, model: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY nicht gesetzt");

    const url =
      process.env.OPENAI_API_URL ||
      "https://api.openai.com/v1/chat/completions";
    const body = {
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`OpenAI HTTP ${resp.status}: ${txt}`);
    }

    const data = (await resp.json()) as any;
    // Immer den Content‑Teil zurückgeben (auch bei Legacy‑Antworten)
    return (
      data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? "{}"
    );
  }

  /** Aufruf bei Ollama */
  private async callOllama(prompt: string, model: string): Promise<string> {
    const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

    // Sicherstellen, dass das Modell vorhanden ist (wenn nicht, pull)
    try {
      const tagsResp = await fetch(`${baseUrl}/api/tags`);
      if (!tagsResp.ok)
        throw new Error(`Ollama /api/tags HTTP ${tagsResp.status}`);

      const tags = (await tagsResp.json()) as any;
      const available = Array.isArray(tags.models)
        ? tags.models.map((m: any) => m.name)
        : [];

      if (!available.includes(model)) {
        console.warn(`[ollama] Modell "${model}" fehlt – Pull wird gestartet`);
        await this.pullOllamaModel(model);
      }
    } catch (e: any) {
      console.warn(`[ollama] Modell‑Check/ Pull fehlgeschlagen: ${e.message}`);
      // Weiter mit dem Modell‑Aufruf – wenn es wirklich fehlt, schlägt er später fehl.
    }

    const resp = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature: 0.1, top_p: 0.9, num_predict: 4000 },
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Ollama HTTP ${resp.status}: ${txt}`);
    }

    const data = (await resp.json()) as any;
    return data.response || "{}";
  }

  /** Pull‑Vorgang für ein fehlendes Ollama‑Modell */
  private async pullOllamaModel(model: string): Promise<void> {
    const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

    const pullResp = await fetch(`${baseUrl}/api/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: model, stream: false }),
    });

    if (!pullResp.ok) {
      const txt = await pullResp.text().catch(() => "");
      throw new Error(`Ollama Pull ${pullResp.status}: ${txt}`);
    }

    const result = (await pullResp.json().catch(() => ({}))) as any;
    if (result.error) throw new Error(`Ollama Pull-Fehler: ${result.error}`);

    logger.info({ model }, `[ollama] Modell "${model}" erfolgreich geladen`);
  }

  /** Aufruf bei Anthropic */
  private async callAnthropic(prompt: string, model: string): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY nicht konfiguriert");

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4000,
        temperature: 0.1,
        system:
          "Du bist ein präziser Assistent, immer gültiges JSON zurückgebend.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Anthropic HTTP ${resp.status}: ${txt}`);
    }

    const data = (await resp.json()) as any;
    return data?.content?.[0]?.text ?? "{}";
  }

  /** Simulierter lokaler Aufruf (oder echter HTTP‑Endpoint) */
  private async callLocal(prompt: string): Promise<string> {
    logger.info(
      { promptLength: prompt.length },
      "[local] Aufruf:",
      prompt.slice(0, 100) + "...",
    );
    // Dummy‑Implementierung – in Produktion durch echten Service ersetzen
    if (prompt.includes("METADATEN‑GENERIERUNG")) {
      return JSON.stringify({
        description: `Lokal generierte Beschreibung für ${prompt.substring(0, 30)}…`,
        tags: ["lokal", "generiert"],
        businessArea: "Allgemein",
        piiClass: "none",
        quality: {
          confidence: 0.5,
          generatedBy: "fallback",
          modelUsed: "local",
        },
      });
    }
    return "{}";
  }

  /** Fallback‑Strategie, falls das ausgewählte Modell nicht funktioniert */
  private async fallbackAI(
    prompt: string,
    operation: string,
    originalError: any,
  ): Promise<string> {
    logger.warn(
      { operation, error: originalError?.message ?? originalError },
      `Fallback für ${operation} wegen:`,
    );
    const fallbackIdx = this.errorCorrection.fallbackModels.indexOf(
      this.currentModel,
    );
    if (fallbackIdx < this.errorCorrection.fallbackModels.length - 1) {
      const next = this.errorCorrection.fallbackModels[fallbackIdx + 1];
      logger.info({ next }, `Wechsle zu Fallback‑Modell: ${next}`);
      this.currentModel = next;
      return this.callAI(prompt, operation);
    }
    // Alle Fallback‑Modelle erschöpft → lokale statische Antwort
    return this.generateLocalFallback(operation);
  }

  /* ---------------------------------------------------------------------- */
  /*                       PROMPT‑BUILDING (Meta, Rule, …)                  */
  /* ---------------------------------------------------------------------- */

  private buildEnhancedMetaPrompt(node: NodeForAnnotation): string {
    return `
# ERWEITERTE METADATEN‑GENERIERUNG FÜR ERP‑FUNKTION

## KONTEXT:
- ID: ${node.id}
- Titel: ${node.title}
- Typ: ${node.kind}
- Pfad: ${node.path.join(" → ")}
- Schema vorhanden: ${!!node.schema_json ? "Ja" : "Nein"}
- Workflow (aa_json) vorhanden: ${!!node.aa_json ? "Ja" : "Nein"}

## ANFORDERUNG:
Erstelle ein umfassendes JSON‑Objekt mit:
1. Fachliche Beschreibung (2‑3 Sätze)
2. 5‑8 relevante Tags
3. Zuordnung zum Geschäfts‑/Fachbereich
4. PII‑Klassifikation
5. Technische Bewertung (Komplexität, Datenvolumen, Integration, Performance‑Impact)
6. Compliance‑Hinweise (DSGVO, Aufbewahrung, Audit)

## RÜCKGABEFORMAT (reines JSON):
{
  "description": "string",
  "tags": ["string"],
  "businessArea": "Finanzen|Vertrieb|Einkauf|HR|Produktion|IT|Logistik|Marketing|Allgemein",
  "piiClass": "none|low|medium|high",
  "requires": ["string"],
  "technical": {
    "complexity": "low|medium|high",
    "dataVolume": "small|medium|large",
    "integrationPoints": ["string"],
    "performanceImpact": "low|medium|high",
    "estimatedDevelopmentHours": number
  },
  "compliance": {
    "gdprRelevant": boolean,
    "retentionPeriod": number,
    "auditRequired": boolean,
    "complianceTags": ["string"]
  },
  "quality": {
    "confidence": number,
    "evidence": ["string"],
    "generatedBy": "ai|fallback|hybrid",
    "modelUsed": "string"
  },
  "lifecycle": {
    "status": "active|deprecated|experimental|planned",
    "version": "string",
    "lastReview": "YYYY-MM-DD",
    "nextReview": "YYYY-MM-DD"
  }
}
    `;
  }

  private buildSimpleMetaPrompt(node: NodeForAnnotation): string {
    return `
# METADATEN‑GENERIERUNG (EINFACH)

Erstelle ein kompaktes JSON‑Objekt für die ERP‑Funktion.

{
  "description": "kurze, fachlich korrekte Beschreibung",
  "tags": ["string"],
  "businessArea": "Finanzen|Vertrieb|Einkauf|HR|Produktion|IT|Logistik|Marketing|Allgemein",
  "piiClass": "none|low|medium|high",
  "quality": { "confidence": number }
}

## Kontext
- Titel: ${node.title}
- Typ: ${node.kind}
- Pfad: ${node.path.join(" → ")}
    `;
  }

  private buildRulePrompt(node: NodeForAnnotation): string {
    return `
Erstelle eine Dashboard‑Regel für die angegebene ERP‑Funktion.
Gib ausschließlich ein gültiges JSON‑Objekt zurück.

{
  "type": "dashboard-root|section|metric|report|form|table|action|config|chart|kpi|alerts",
  "widget": "number|chart|gauge|table|form|button|tabs|grid|panel|progress|timeline|map",
  "dataSource": "string (optional)",
  "refreshInterval": number (optional),
  "unit": "string (optional)",
  "permissions": ["string"],
  "layout": { "colSpan": number, "rowSpan": number, "priority": number }
}

## Kontext:
${JSON.stringify(
  {
    title: node.title,
    path: node.path,
    kind: node.kind,
    tags: node.meta_json?.tags ?? [],
  },
  null,
  2,
)}
    `;
  }

  private buildFormPrompt(node: NodeForAnnotation): string {
    return `
Erstelle eine Formular‑Spezifikation (FormSpec) für die ERP‑Funktion.
Antwort ausschließlich im JSON‑Format.

{
  "title": "string",
  "description": "string (optional)",
  "fields": [
    {
      "name": "string",
      "type": "text|number|date|select|checkbox|textarea|email|phone|currency|percentage|file|password",
      "label": "string",
      "required": boolean,
      "options": ["string"] (optional),
      "placeholder": "string" (optional)
    }
  ],
  "layout": "vertical|horizontal|wizard|tabs|accordion",
  "validation": [
    {
      "field": "string",
      "type": "required|min|max|pattern|custom|email|url|phone",
      "value": any,
      "message": "string"
    }
  ],
  "actions": ["string"]
}

## Kontext:
${JSON.stringify({ title: node.title, path: node.path }, null, 2)}
    `;
  }

  private buildSchemaEnhancementPrompt(node: NodeForAnnotation): string {
    return `
Verbessere das vorhandene JSON‑Schema für die ERP‑Funktion "${node.title}".
Behalte alle existierenden Felder bei und ergänze sinnvolle Validierungen.

Aktuelles Schema:
${JSON.stringify(node.schema_json || {}, null, 2)}

Gib ausschließlich das verbesserte Schema zurück (gültiges JSON).
    `;
  }

  private buildPiiClassificationPrompt(nodes: NodeForAnnotation[]): string {
    return `
Klassifiziere personenbezogene Daten (PII) für die folgenden ERP‑Funktionen.
Antworte mit einem JSON‑Array:

[
  {
    "id": "string",
    "piiClass": "none|low|medium|high",
    "reason": "string",
    "confidence": number
  }
]

Daten:
${JSON.stringify(
  nodes.map((n) => ({
    id: n.id,
    title: n.title,
    kind: n.kind,
    path: n.path,
  })),
  null,
  2,
)}
    `;
  }

  private buildCorrectionPrompt(
    node: NodeForAnnotation,
    invalidMeta: GeneratedMeta,
    errors: string[],
  ): string {
    return `
# METADATEN‑KORREKTUR

### FEHLER
${errors.map((e) => `- ${e}`).join("\n")}

### ORIGINAL (ungültiges) METADATEN
${JSON.stringify(invalidMeta, null, 2)}

### KNOTEN‑INFO
${JSON.stringify(
  { title: node.title, kind: node.kind, path: node.path },
  null,
  2,
)}

Korrigiere das JSON‑Objekt und gib **nur** das gültige Ergebnis zurück.
    `;
  }

  /* ---------------------------------------------------------------------- */
  /*                              PARSING                                     */
  /* ---------------------------------------------------------------------- */

  private parseMetaJson(raw: string, node: NodeForAnnotation): GeneratedMeta {
    let jsonStr = raw.trim();

    // Extrahiere erstes JSON‑Objekt, falls Umschließende Texte vorhanden sind
    const match = jsonStr.match(/\{[\s\S]*\}/);
    if (match) jsonStr = match[0];

    try {
      const parsed = JSON.parse(jsonStr);
      return parsed as GeneratedMeta;
    } catch {
      console.warn("parseMetaJson: JSON‑Parsing fehlgeschlagen – Fallback");
      return this.generateEnhancedFallbackMeta(node);
    }
  }

  private parseRuleJson(raw: string): DashboardRule {
    try {
      const obj = JSON.parse(raw);
      const validTypes = [
        "dashboard-root",
        "section",
        "metric",
        "report",
        "form",
        "table",
        "action",
        "config",
        "chart",
        "kpi",
        "alerts",
      ];
      const validWidgets = [
        "number",
        "chart",
        "gauge",
        "table",
        "form",
        "button",
        "tabs",
        "grid",
        "panel",
        "progress",
        "timeline",
        "map",
      ];

      return {
        type: validTypes.includes(obj.type) ? obj.type : "section",
        widget: validWidgets.includes(obj.widget) ? obj.widget : undefined,
        dataSource: obj.dataSource,
        refreshInterval: obj.refreshInterval,
        unit: obj.unit,
        permissions: Array.isArray(obj.permissions) ? obj.permissions : [],
        layout: obj.layout || { colSpan: 1, rowSpan: 1, priority: 1 },
        aggregation: obj.aggregation,
        timeRange: obj.timeRange,
        colorScheme: obj.colorScheme,
        thresholds: obj.thresholds,
        alerts: obj.alerts,
      };
    } catch {
      // Rückfall zu einfacher Regel
      return this.generateFallbackRule({} as NodeForAnnotation);
    }
  }

  private parseFormJson(raw: string): FormSpec {
    try {
      const obj = JSON.parse(raw);
      return {
        title: obj.title || "Formular",
        description: obj.description,
        fields: Array.isArray(obj.fields) ? obj.fields : [],
        layout: obj.layout || "vertical",
        validation: obj.validation || [],
        actions: obj.actions || ["speichern", "abbrechen"],
        sections: obj.sections,
        conditionalLogic: obj.conditionalLogic,
      };
    } catch {
      return this.generateFallbackForm({} as NodeForAnnotation);
    }
  }

  private parsePiiClassification(
    raw: string,
    nodes: NodeForAnnotation[],
  ): PiiResult[] {
    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) throw new Error("Expected array");
      return arr.map((item: any) => ({
        id: item.id,
        piiClass: ["none", "low", "medium", "high"].includes(item.piiClass)
          ? item.piiClass
          : "none",
        reason: item.reason || "automatisch klassifiziert",
        confidence: Math.min(1, Math.max(0, Number(item.confidence ?? 0.5))),
        generatedBy: "ai",
      }));
    } catch (e) {
      console.warn("PII‑Parse‑Fehler, greife auf Fallback zurück", e);
      return nodes.map((n) => ({
        id: n.id,
        piiClass: this.guessPiiClass(n),
        reason: "Fallback nach Parse‑Fehler",
        confidence: 0.3,
        generatedBy: "fallback",
      }));
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                              VALIDIERUNG                                 */
  /* ---------------------------------------------------------------------- */

  private validateMeta(meta: GeneratedMeta): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!meta.description || meta.description.trim().length < 10) {
      errors.push("Beschreibung fehlt oder ist zu kurz");
    }

    if (!meta.tags || !Array.isArray(meta.tags) || meta.tags.length === 0) {
      errors.push("Keine Tags angegeben");
    }

    const businessAreas = [
      "Finanzen",
      "Vertrieb",
      "Einkauf",
      "HR",
      "Produktion",
      "IT",
      "Logistik",
      "Marketing",
      "Allgemein",
    ];
    if (meta.businessArea && !businessAreas.includes(meta.businessArea)) {
      errors.push(`Ungültiger Geschäftsbereich: ${meta.businessArea}`);
    }

    return { valid: errors.length === 0, errors };
  }

  /* ---------------------------------------------------------------------- */
  /*                     BATCH‑VERARBEITUNG & SUMMARY                        */
  /* ---------------------------------------------------------------------- */

  async executeBatchOperation(operation: BatchOperation): Promise<BatchResult> {
    const batchId = await this.databaseTool.saveBatchOperation({
      ...operation,
      status: "running",
      started_at: new Date().toISOString(),
      progress: 0,
    });

    this.activeBatches.set(batchId, operation);

    try {
      const nodes = await this.listCandidates(operation.filters);
      const result: BatchResult = {
        id: batchId,
        total: nodes.length,
        processed: 0,
        successful: 0,
        failed: 0,
        errors: [],
        results: [],
      };

      const chunkSize = operation.options?.chunkSize ?? 10;
      const parallel = operation.options?.parallelRequests ?? 2;
      const startAll = Date.now();

      for (let i = 0; i < nodes.length; i += chunkSize) {
        const chunk = nodes.slice(i, i + chunkSize);

        const tasks = chunk.map((node, idx) => async () => {
          await this.delay(idx * 200); // leichte Staggered‑Starts
          return this.processBatchNode(node, operation, batchId);
        });

        const promises = this.limitConcurrency(tasks, parallel);
        const settled = (await Promise.allSettled(
          promises,
        )) as PromiseSettledResult<BatchResult["results"][0]>[];

        settled.forEach((settledResult, idx) => {
          const node = chunk[idx];
          if (settledResult.status === "fulfilled") {
            const nodeResult = settledResult.value;
            result.results.push(nodeResult);
            if (nodeResult.success) result.successful++;
            else {
              result.failed++;
              if (nodeResult.error)
                result.errors.push(`${node.id}: ${nodeResult.error}`);
            }
          } else {
            const errMsg =
              (settledResult.reason as any)?.message ??
              String(settledResult.reason);
            result.results.push({
              id: node.id,
              success: false,
              error: errMsg,
              retries: 0,
            });
            result.failed++;
            result.errors.push(`${node.id}: ${errMsg}`);
          }
          result.processed++;
        });

        const progress = Math.round((result.processed / result.total) * 100);
        this.emit("batch_progress", batchId, progress);

        // Kurze Pause zwischen Chunks, um das System zu entlasten
        await this.delay(500);
      }

      // Gesamtdauer – für Performance‑Kennzahlen
      const totalDuration = Date.now() - startAll;
      result.summary = this.calculateBatchSummary(result, totalDuration);

      this.emit("batch_complete", batchId);
      return result;
    } catch (err) {
      this.emit("batch_error", batchId, err as Error);
      throw err;
    }
  }

  private async processBatchNode(
    node: NodeForAnnotation,
    operation: BatchOperation,
    batchId: string,
  ): Promise<BatchResult["results"][0]> {
    const start = Date.now();
    const maxRetries =
      operation.options?.maxRetries ?? this.errorCorrection.maxRetries;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        let result: any;

        switch (operation.operation) {
          case "generate_meta":
            result = await this.generateMeta(node);
            await this.saveMeta(node.id, result);
            break;

          case "generate_forms":
            result = await this.generateFormSpec(node);
            await this.saveFormSpec(node.id, result);
            break;

          case "enhance_schema":
            result = await this.enhanceSchema(node);
            break;

          case "classify_pii":
            const pii = await this.classifyPii([node]);
            result = pii[0];
            break;

          case "generate_rule":
            result = await this.generateRule(node);
            await this.saveRule(node.id, result);
            break;

          case "full_annotation":
            // Parallel, um Zeit zu sparen
            const [meta, rule, form] = await Promise.all([
              this.generateMeta(node),
              this.generateRule(node),
              this.generateFormSpec(node),
            ]);
            result = { meta, rule, form };
            // Meta wird mit Regel gespeichert (wie im Original‑Code)
            await this.saveMeta(node.id, {
              ...meta,
              rule,
            } as unknown as GeneratedMeta);
            await this.saveFormSpec(node.id, form);
            break;

          case "validate_nodes":
            result = await this.validateNode(node);
            break;

          default:
            throw new Error(
              `Unsupported batch operation: ${operation.operation}`,
            );
        }

        return {
          id: node.id,
          success: true,
          result,
          retries: attempt,
          duration: Date.now() - start,
          qualityScore:
            result?.quality?.confidence ??
            result?.meta?.quality?.confidence ??
            0,
        };
      } catch (e: any) {
        attempt++;
        if (attempt > maxRetries) {
          return {
            id: node.id,
            success: false,
            error: e?.message ?? String(e),
            retries: attempt,
            duration: Date.now() - start,
            qualityScore: 0,
          };
        }
        await this.delay(this.errorCorrection.retryDelay * attempt);
      }
    }

    // Sollte nie erreicht werden
    return {
      id: node.id,
      success: false,
      error: "Unbekannter Fehler",
      retries: maxRetries,
      duration: Date.now() - start,
      qualityScore: 0,
    };
  }

  /** Steuert gleichzeitige Ausführung einer begrenzten Anzahl von Tasks */
  private limitConcurrency<T>(
    tasks: Array<() => Promise<T>>,
    limit: number,
  ): Promise<T>[] {
    const results: Promise<T>[] = new Array(tasks.length);
    let idx = 0;

    const worker = async () => {
      while (true) {
        const cur = idx++;
        if (cur >= tasks.length) return;
        try {
          const p = tasks[cur]();
          results[cur] = p;
          await p.catch(() => undefined);
        } catch {
          // ignore sync errors in task creation
        }
      }
    };

    const workers = Math.max(1, Math.min(limit, tasks.length));
    for (let i = 0; i < workers; i++) void worker();

    // Filter out still‑undefined slots (falls tasks.length === 0)
    return results.filter((r): r is Promise<T> => Boolean(r));
  }

  /** Berechnet zusammenfassende Kennzahlen für ein Batch‑Ergebnis */
  private calculateBatchSummary(
    result: BatchResult,
    totalDuration: number,
  ): Required<NonNullable<BatchResult["summary"]>> {
    const confidences: number[] = [];
    const businessAreas: Record<string, number> = {};
    const piiDistribution: Record<string, number> = {};

    result.results.forEach((r) => {
      if (r.success && r.result) {
        // Qualität (Confidence) kann entweder direkt im Ergebnis oder im eingebetteten meta-Objekt liegen
        const conf =
          typeof r.result?.quality?.confidence === "number"
            ? r.result.quality.confidence
            : typeof r.result?.meta?.quality?.confidence === "number"
              ? r.result.meta.quality.confidence
              : undefined;
        if (typeof conf === "number") confidences.push(conf);

        const area = r.result?.businessArea || r.result?.meta?.businessArea;
        if (area) businessAreas[area] = (businessAreas[area] || 0) + 1;

        const pii = r.result?.piiClass || r.result?.meta?.piiClass || "none";
        piiDistribution[pii] = (piiDistribution[pii] || 0) + 1;
      }
    });

    const avgConf = confidences.length
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;

    return {
      averageConfidence: avgConf,
      businessAreas,
      piiDistribution,
      qualityScore: result.total > 0 ? result.successful / result.total : 0,
      performanceMetrics: {
        averageDuration:
          result.processed > 0 ? totalDuration / result.processed : 0,
        totalDuration,
        requestsPerMinute:
          result.processed > 0 ? (result.processed / totalDuration) * 60000 : 0,
      },
    };
  }

  /* ---------------------------------------------------------------------- */
  /*                        MODEL‑SELECTION (legacy)                        */
  /* ---------------------------------------------------------------------- */

  /**
   * Legacy‑Methode – wird von `callAI` verwendet.
   * Wählt ein Modell basierend auf `capabilities` und Priorität.
   */
  private selectModelForOperation(operation: string): ModelConfig {
    const capable = this.availableModels.filter(
      (m) =>
        m.capabilities.includes(operation) ||
        m.capabilities.includes("complex"),
    );

    if (capable.length === 0) {
      const fallback = this.availableModels.find((m) => m.name === "fallback");
      if (!fallback)
        throw new Error("[aiAnnotator] Kein geeignetes Modell verfügbar");
      return fallback;
    }

    // Prioritäten‑Reihenfolge (qwen 8b → qwen 4b → beliebiges Ollama → Cloud → fallback)
    const byName = (n: string) => capable.find((m) => m.name === n);
    return (
      byName("qwen3:8b") ||
      byName("qwen3:4b") ||
      capable.find((m) => m.provider === "ollama")! ||
      capable.find(
        (m) =>
          (m.provider === "openai" || m.provider === "anthropic") &&
          m.available,
      )! ||
      capable.find((m) => m.name === "fallback")!
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                         SELBSTHEILUNGS‑FUNKTIONEN                       */
  /* ---------------------------------------------------------------------- */

  private async correctMetaGeneration(
    node: NodeForAnnotation,
    invalidMeta: GeneratedMeta,
    errors: string[],
    retryCount: number,
  ): Promise<GeneratedMeta> {
    const correctionPrompt = this.buildCorrectionPrompt(
      node,
      invalidMeta,
      errors,
    );
    try {
      const model = await this.modelSelector.selectBestModel(
        "meta",
        "accuracy",
      );
      const raw = await this.callAIWithModel(correctionPrompt, model);
      const corrected = this.parseMetaJson(raw, node);
      const validation = this.validateMeta(corrected);

      this.modelSelector.updatePerformanceMetrics(
        model.name,
        validation.valid,
        Date.now() - Date.now(),
      );

      if (validation.valid) {
        return {
          ...corrected,
          quality: {
            confidence: corrected.quality?.confidence ?? 0.8,
            evidence: [
              ...(corrected.quality?.evidence || []),
              `Korrektur: ${errors.join(", ")}`,
            ],
            generatedBy: "hybrid",
            modelUsed: model.name,
            validationScore: 1,
          },
        };
      }

      // Wiederholungen falls noch ungültig
      if (retryCount < this.errorCorrection.maxRetries) {
        await this.delay(this.errorCorrection.retryDelay * (retryCount + 1));
        return this.correctMetaGeneration(
          node,
          corrected,
          validation.errors,
          retryCount + 1,
        );
      }

      // Letzter Ausweg
      return this.generateEnhancedFallbackMeta(node);
    } catch (e) {
      console.warn(`Meta‑Korrektur fehlgeschlagen für ${node.id}:`, e);
      return this.generateEnhancedFallbackMeta(node);
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                      FALLBACK‑GENERIERUNG (Meta, Rule, Form)           */
  /* ---------------------------------------------------------------------- */

  private generateEnhancedFallbackMeta(node: NodeForAnnotation): GeneratedMeta {
    const technical = this.analyzeTechnicalComplexity(node);
    const pii = this.guessPiiClass(node);
    const ba = this.guessBusinessArea(node);
    return {
      description: `Automatisch generierte Beschreibung für "${node.title}". Dies ist ein Fallback‑Eintrag.`,
      tags: [
        node.kind,
        ...node.title.split(" ").slice(0, 5),
        ...node.path.slice(-2),
      ],
      businessArea: ba,
      piiClass: pii,
      requires: this.extractDependencies(node),
      quality: {
        confidence: 0.3,
        evidence: ["Fallback‑Meta‑Generierung"],
        generatedBy: "fallback",
        modelUsed: "fallback",
        validationScore: 0.3,
      },
      technical: {
        ...technical,
        estimatedDevelopmentHours: this.estimateDevelopmentHours(
          node,
          technical.complexity,
        ),
      },
      compliance: {
        gdprRelevant: pii !== "none",
        retentionPeriod: pii === "high" ? 3650 : pii === "medium" ? 1825 : 730,
        auditRequired: pii === "high",
        complianceTags: pii !== "none" ? ["DSGVO"] : [],
      },
      lifecycle: {
        status: "active",
        version: "1.0",
        lastReview: new Date().toISOString().split("T")[0],
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
    };
  }

  private generateFallbackRule(node: NodeForAnnotation): DashboardRule {
    const title = node.title.toLowerCase();
    if (node.path.length === 1 && title.includes("dashboard")) {
      return {
        type: "dashboard-root",
        widget: "tabs",
        layout: { colSpan: 12, rowSpan: 1, priority: 1 },
      };
    }

    if (
      title.includes("kpi") ||
      title.includes("umsatz") ||
      title.includes("kennzahl")
    ) {
      return {
        type: "metric",
        widget: "number",
        refreshInterval: 60,
        layout: { colSpan: 2, rowSpan: 1, priority: 2 },
      };
    }

    if (title.includes("bericht") || title.includes("report")) {
      return {
        type: "report",
        widget: "panel",
        layout: { colSpan: 6, rowSpan: 2, priority: 3 },
      };
    }

    return {
      type: "section",
      widget: "panel",
      layout: { colSpan: 3, rowSpan: 1, priority: 4 },
    };
  }

  private generateFallbackForm(node: NodeForAnnotation): FormSpec {
    return {
      title: node.title,
      fields: [{ name: "name", type: "text", label: "Name", required: true }],
      layout: "vertical",
      actions: ["speichern", "abbrechen"],
    };
  }

  private generateLocalFallback(operation: string): string {
    const nodeStub: NodeForAnnotation = {
      id: "fallback",
      title: "Fallback Node",
      kind: "system",
      path: [],
    };
    switch (operation) {
      case "meta":
        return JSON.stringify(this.generateEnhancedFallbackMeta(nodeStub));
      case "rule":
        return JSON.stringify(this.generateFallbackRule(nodeStub));
      case "form":
        return JSON.stringify(this.generateFallbackForm(nodeStub));
      default:
        return "{}";
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                        HILFSMETHODEN (Analyse, Schätzung, …)           */
  /* ---------------------------------------------------------------------- */

  private analyzeTechnicalComplexity(
    node: NodeForAnnotation,
  ): NonNullable<GeneratedMeta["technical"]> {
    const title = node.title.toLowerCase();
    let complexity: "low" | "medium" | "high" = "low";
    let dataVolume: "small" | "medium" | "large" = "small";
    let performanceImpact: "low" | "medium" | "high" = "low";

    if (/report|analyse|statistik/.test(title)) {
      dataVolume = "large";
      performanceImpact = "medium";
    }

    if (/transaktion|buchung|rechnung/.test(title)) {
      complexity = "medium";
      performanceImpact = "medium";
    }

    if (/integration|synchronisation|api/.test(title)) {
      complexity = "high";
      performanceImpact = "high";
    }

    return {
      complexity,
      dataVolume,
      integrationPoints: this.extractIntegrationPoints(node),
      performanceImpact,
    };
  }

  private extractIntegrationPoints(node: NodeForAnnotation): string[] {
    const pts: string[] = [];
    const title = node.title.toLowerCase();
    const path = node.path.join(" ").toLowerCase();

    if (title.includes("kunde") || path.includes("kunde")) pts.push("CRM");
    if (title.includes("lieferant") || path.includes("lieferant"))
      pts.push("Lieferantenmanagement");
    if (title.includes("lager") || path.includes("lager"))
      pts.push("Warenwirtschaft");
    if (title.includes("personal") || path.includes("personal"))
      pts.push("HR-System");
    if (title.includes("finanz") || path.includes("finanz"))
      pts.push("Finanzbuchhaltung");

    return pts.slice(0, 3);
  }

  private extractDependencies(node: NodeForAnnotation): string[] {
    const deps: string[] = [];
    if (node.path.length > 1) deps.push(node.path[node.path.length - 2]);
    if (Array.isArray(node.meta_json?.requires))
      deps.push(...node.meta_json.requires);
    return [...new Set(deps)].slice(0, 5);
  }

  private guessBusinessArea(node: NodeForAnnotation): string {
    const title = node.title.toLowerCase();
    const map: Record<string, string> = {
      finance: "Finanzen",
      kosten: "Finanzen",
      rechnung: "Finanzen",
      kunde: "Vertrieb",
      vertrieb: "Vertrieb",
      auftrag: "Vertrieb",
      angebot: "Vertrieb",
      einkauf: "Einkauf",
      lieferant: "Einkauf",
      bestellung: "Einkauf",
      personal: "HR",
      mitarbeiter: "HR",
      gehalt: "HR",
      lohn: "HR",
      produkt: "Produktion",
      fertigung: "Produktion",
      lager: "Produktion",
      material: "Produktion",
      system: "IT",
      benutzer: "IT",
      rolle: "IT",
      berechtigung: "IT",
    };
    for (const [kw, area] of Object.entries(map)) {
      if (title.includes(kw)) return area;
    }
    return "Allgemein";
  }

  private guessPiiClass(
    node: NodeForAnnotation,
  ): "none" | "low" | "medium" | "high" {
    const t = node.title.toLowerCase();
    if (t.includes("personal") || t.includes("gehalt") || t.includes("lohn"))
      return "high";
    if (t.includes("kunde") || t.includes("adresse") || t.includes("email"))
      return "medium";
    if (
      t.includes("benutzer") ||
      t.includes("rolle") ||
      t.includes("abteilung")
    )
      return "low";
    return "none";
  }

  private estimateDevelopmentHours(
    node: NodeForAnnotation,
    complexity: "low" | "medium" | "high",
  ): number {
    const base = 8;
    const factor = complexity === "high" ? 4 : complexity === "medium" ? 2 : 1;
    return base * factor;
  }

  /* ---------------------------------------------------------------------- */
  /*                     VALIDIERUNG VON EINEM EINZELNEN KNOTEN                */
  /* ---------------------------------------------------------------------- */

  async validateNode(node: NodeForAnnotation): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!node.meta_json) {
      errors.push("Keine Metadaten vorhanden");
    } else {
      const metaVal = this.validateMeta(node.meta_json);
      if (!metaVal.valid) errors.push(...metaVal.errors);
    }

    if (!node.schema_json) warnings.push("Kein Schema vorhanden");
    if (node.title.length < 3) warnings.push("Titel sehr kurz");
    if (node.path.length === 0) warnings.push("Kein Pfad definiert");

    if (this.provider !== "none") {
      try {
        const aiVal = await this.aiValidateNode(node);
        suggestions.push(...aiVal.suggestions);
      } catch (e) {
        console.warn("AI‑Validierung fehlgeschlagen:", e);
      }
    }

    return { valid: errors.length === 0, errors, warnings, suggestions };
  }

  private async aiValidateNode(
    node: NodeForAnnotation,
  ): Promise<{ suggestions: string[] }> {
    const prompt = `
# VALIDIERUNG ERP‑FUNKTIONSKNOTEN

## KNOTEN
${JSON.stringify(
  {
    title: node.title,
    kind: node.kind,
    path: node.path,
    meta: node.meta_json,
  },
  null,
  2,
)}

## AUFGABE
Analysiere und gib Verbesserungsvorschläge zurück.

Erwartete Ausgabe (JSON):
{ "suggestions": ["string"] }
    `;

    try {
      const raw = await this.callAI(prompt, "validation");
      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      }
      return {
        suggestions: Array.isArray(parsed?.suggestions)
          ? parsed.suggestions
          : [],
      };
    } catch (e) {
      console.warn("AI‑Validierung fehlgeschlagen:", e);
      return { suggestions: [] };
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                        HELPER (Delay, DB‑Meta‑Abfrage)                 */
  /* ---------------------------------------------------------------------- */

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async getNodeMeta(id: string): Promise<any> {
    try {
      const rows = await this.listCandidates({ search: id, limit: 1 });
      return rows[0]?.meta_json || {};
    } catch {
      return {};
    }
  }

  async getStatus() {
    const health = await this.getSystemHealth();
    return {
      provider: this.provider,
      available: this.provider !== "none",
      model: this.currentModel,
      capabilities: this.availableModels.flatMap((m) => m.capabilities),
      health,
      errorCorrection: this.errorCorrection,
    };
  }

  private async getSystemHealth(): Promise<any> {
    const mem = process.memoryUsage();
    let dbOk = true;
    try {
      await this.databaseTool.getTotalNodeCount();
    } catch {
      dbOk = false;
    }

    let providerReachable: boolean | null = null;
    try {
      if (this.provider === "ollama") {
        const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
        const resp = await fetch(`${baseUrl}/api/tags`);
        providerReachable = resp.ok;
      } else if (this.provider === "openai") {
        providerReachable = !!process.env.OPENAI_API_KEY;
      } else if (this.provider === "anthropic") {
        providerReachable = !!process.env.ANTHROPIC_API_KEY;
      } else if (this.provider === "local") {
        providerReachable = !!process.env.LOCAL_MODEL_PATH;
      } else {
        providerReachable = false;
      }
    } catch {
      providerReachable = false;
    }

    return {
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: {
        rss: mem.rss,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
      },
      cpuCount: os.cpus().length,
      loadAverage: os.loadavg(),
      database: { ok: dbOk },
      aiProvider: {
        name: this.provider,
        available: this.provider !== "none",
        reachable: providerReachable,
      },
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                               EXPORT                                         */
/* -------------------------------------------------------------------------- */

export default new AiAnnotatorService();
