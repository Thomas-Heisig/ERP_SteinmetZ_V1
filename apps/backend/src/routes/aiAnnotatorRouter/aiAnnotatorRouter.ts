// SPDX-License-Identifier: MIT
// apps/backend/src/routes/aiAnnotatorRouter/aiAnnotatorRouter.ts

import { Router, Request, Response } from "express";
import { z } from "zod";
import aiAnnotatorService, {
  BatchOperation,
  NodeForAnnotation,
  GeneratedMeta,
  DashboardRule,
  FormSpec,
  DatabaseTool,
} from "../../services/aiAnnotatorService.js";
import { strictAiRateLimiter } from "../../middleware/rateLimiters.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../types/errors.js";
import { filterService } from "../../services/filterService.js";
import { qualityAssuranceService } from "../../services/qualityAssuranceService.js";
import { modelManagementService } from "../../services/modelManagementService.js";
import { batchProcessingService } from "../../services/batchProcessingService.js";

const router = Router();
const databaseTool = DatabaseTool.getInstance();

/** --------- Erweiterte Hilfsfunktionen --------- */
function toStringArray(v: unknown): string[] | undefined {
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

function toBool(v: unknown, def = false): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "on";
  }
  return def;
}

function toInt(v: unknown, def: number): number {
  if (typeof v === "number") return v;
  const n = typeof v === "string" ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : def;
}

function toArray<T>(v: unknown, validator: (x: any) => x is T): T[] {
  if (Array.isArray(v)) return v.filter(validator);
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed.filter(validator) : [];
    } catch {
      return v
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x.length > 0) as T[];
    }
  }
  return [];
}

/** Erweiterte Query-Parameter Typen */
type NodesQuery = {
  kinds?: string | string[];
  missingOnly?: string;
  limit?: string;
  offset?: string;
  search?: string;
  status?: string | string[];
  businessArea?: string | string[];
  complexity?: string | string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

/** Helper function to find node by ID */
async function findNodeById(id: string): Promise<NodeForAnnotation> {
  const nodes = await aiAnnotatorService.listCandidates({
    limit: 1,
    search: id,
  });
  const node = nodes.find((n) => n.id === id);
  if (!node) {
    throw new NotFoundError(`Knoten ${id} nicht gefunden`);
  }
  return node;
}

/* ========================================================================== */
/* Zod Validation Schemas                                                     */
/* ========================================================================== */

const fullAnnotationSchema = z.object({
  includeValidation: z.boolean().optional().default(true),
  parallel: z.boolean().optional().default(true),
});

const batchOperationSchema = z.object({
  operation: z.string().min(1),
  filters: z.record(z.string(), z.any()),
  options: z
    .object({
      retryFailed: z.boolean().optional(),
      maxRetries: z.number().int().positive().optional(),
      chunkSize: z.number().int().positive().optional(),
      parallelRequests: z.number().int().positive().optional(),
      modelPreference: z.enum(["fast", "balanced", "accurate"]).optional(),
    })
    .optional(),
});

const classifyPiiSchema = z.object({
  nodeIds: z.array(z.string()).min(1),
  detailed: z.boolean().optional().default(false),
});

const validateBatchSchema = z.object({
  nodeIds: z.array(z.string()).min(1),
  rules: z.array(z.any()).optional().default([]),
});

// TODO: Define specific validation rules for error correction config parameters
// This should validate the specific configuration options available in the error correction system
const errorCorrectionConfigSchema = z.record(z.string(), z.any());

const debugPromptSchema = z.object({
  nodeId: z.string().min(1),
  promptType: z
    .enum(["meta", "rule", "form", "simple", "correction"])
    .optional()
    .default("meta"),
  options: z.record(z.string(), z.any()).optional().default({}),
});

const debugAiTestSchema = z.object({
  prompt: z.string().optional(),
  model: z.string().optional(),
  provider: z.string().optional(),
});

const bulkEnhanceSchema = z.object({
  nodeIds: z.array(z.string()).min(1),
  operations: z
    .array(z.enum(["meta", "rule", "form"]))
    .optional()
    .default(["meta", "rule", "form"]),
});

const modelSelectionTestSchema = z.object({
  operation: z.string().optional().default("meta"),
  priority: z.string().optional().default("balanced"),
});

// TODO: Define proper validation schemas based on service interfaces
// Currently using passthrough validation to maintain backward compatibility
// These should be updated to match SavedFilter interface from filterService
const createFilterSchema = z.any();
const updateFilterSchema = z.any();

const exportFilterSchema = z.object({
  nodes: z.array(z.any()).min(1),
  format: z.enum(["json", "csv"]).optional().default("json"),
});

// TODO: Define proper validation schemas based on QAReview interface
// These should be updated to match QAReview from qualityAssuranceService
const createReviewSchema = z.any();
const updateReviewSchema = z.any();

const approveRejectReviewSchema = z.object({
  reviewer: z.string().min(1),
  comments: z.string().optional(),
});

const compareModelsSchema = z.object({
  models: z.array(z.string()).min(2),
  days: z.number().int().positive().optional().default(30),
});

// TODO: Define proper validation schema based on BatchCreationRequest interface
// This should be updated to match BatchCreationRequest from batchProcessingService
const createBatchSchema = z.any();

// ============ SYSTEM STATUS & HEALTH ============

router.get(
  "/status",
  asyncHandler(async (_req, res, next) => {
    const status = await aiAnnotatorService.getStatus();
    res.json({ success: true, data: status });
  }),
);

router.get(
  "/health",
  asyncHandler(async (_req, res, next) => {
    const health = await aiAnnotatorService.getHealthStatus();
    res.json({ success: true, data: health });
  }),
);

// ============ DATABASE TOOL ENDPOINTS ============

router.get(
  "/database/stats",
  asyncHandler(async (_req, res, next) => {
    const stats = await databaseTool.getNodeStatistics();
    res.json({ success: true, data: stats });
  }),
);

router.get(
  "/database/batches",
  asyncHandler(async (req, res, next) => {
    const limit = toInt(req.query.limit, 50);
    const batches = await databaseTool.getBatchOperations(limit);

    res.json({
      success: true,
      data: batches,
      pagination: { limit, total: batches.length },
    });
  }),
);

router.delete(
  "/database/batches/cleanup",
  asyncHandler(async (req, res, next) => {
    if (process.env.NODE_ENV === "production" && req.query.force !== "true") {
      throw new ForbiddenError("Cleanup in Production erfordert force=true");
    }

    const daysToKeep = toInt(req.query.days, 30);
    await databaseTool.cleanupOldBatches(daysToKeep);

    res.json({
      success: true,
      message: `Alte Batch-Jobs älter als ${daysToKeep} Tage wurden bereinigt`,
    });
  }),
);

// ============ ERWEITERTE NODE MANAGEMENT ============

router.get(
  "/nodes",
  asyncHandler(async (req: Request<{}, any, any, NodesQuery>, res) => {
    const kinds = toStringArray(req.query.kinds);
    const missingOnly = toBool(req.query.missingOnly, false);
    const limit = toInt(req.query.limit, 50);
    const offset = toInt(req.query.offset, 0);
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const status = toStringArray(req.query.status);
    const businessArea = toStringArray(req.query.businessArea);
    const complexity = toStringArray(req.query.complexity);

    const nodes = await aiAnnotatorService.listCandidates({
      kinds,
      missingOnly,
      limit,
      offset,
      search,
      status,
      businessArea,
      complexity,
    });

    res.json({
      success: true,
      data: { nodes },
      pagination: { limit, offset, total: nodes.length },
      filters: { kinds, status, businessArea, complexity },
    });
  }),
);

router.get(
  "/nodes/:id",
  asyncHandler(async (req, res, next) => {
    const node = await findNodeById(req.params.id);
    res.json({
      success: true,
      data: { node },
    });
  }),
);

router.post(
  "/nodes/:id/validate",
  asyncHandler(async (req, res, next) => {
    const node = await findNodeById(req.params.id);
    const validation = await aiAnnotatorService.validateNode(node);

    res.json({
      success: true,
      data: { node, validation },
    });
  }),
);

// ============ SINGLE OPERATIONS MIT ERROR CORRECTION ============

router.post(
  "/nodes/:id/generate-meta",
  strictAiRateLimiter,
  asyncHandler(async (req, res, next) => {
    const node = await findNodeById(req.params.id);
    const meta = await aiAnnotatorService.generateMeta(node);
    await aiAnnotatorService.saveMeta(req.params.id, meta);

    res.json({
      success: true,
      message: "Metadaten erfolgreich generiert und gespeichert.",
      data: { node, meta },
    });
  }),
);

router.post(
  "/nodes/:id/generate-rule",
  strictAiRateLimiter,
  asyncHandler(async (req, res, next) => {
    const node = await findNodeById(req.params.id);
    const rule = await aiAnnotatorService.generateRule(node);
    await aiAnnotatorService.saveRule(req.params.id, rule);

    res.json({
      success: true,
      message: "Regel erfolgreich generiert und gespeichert.",
      data: { node, rule },
    });
  }),
);

router.post(
  "/nodes/:id/generate-form",
  strictAiRateLimiter,
  asyncHandler(async (req, res, next) => {
    const node = await findNodeById(req.params.id);
    const formSpec = await aiAnnotatorService.generateFormSpec(node);
    await aiAnnotatorService.saveFormSpec(req.params.id, formSpec);

    res.json({
      success: true,
      message: "Formular erfolgreich generiert und gespeichert.",
      data: { node, formSpec },
    });
  }),
);

router.post(
  "/nodes/:id/enhance-schema",
  asyncHandler(async (req, res, next) => {
    const node = await findNodeById(req.params.id);
    const enhancedSchema = await aiAnnotatorService.enhanceSchema(node);

    res.json({
      success: true,
      message: "Schema erfolgreich erweitert.",
      data: { node, enhancedSchema },
    });
  }),
);

router.post(
  "/nodes/:id/full-annotation",
  asyncHandler(async (req, res, next) => {
    const validated = fullAnnotationSchema.parse(req.body);
    const { includeValidation, parallel } = validated;
    const node = await findNodeById(req.params.id);

    let meta: any,
      rule: any,
      form: any,
      validation: any = null;

    if (parallel) {
      [meta, rule, form, validation] = await Promise.all([
        aiAnnotatorService.generateMeta(node),
        aiAnnotatorService.generateRule(node),
        aiAnnotatorService.generateFormSpec(node),
        includeValidation
          ? aiAnnotatorService.validateNode(node)
          : Promise.resolve(null),
      ]);
    } else {
      meta = await aiAnnotatorService.generateMeta(node);
      rule = await aiAnnotatorService.generateRule(node);
      form = await aiAnnotatorService.generateFormSpec(node);
      validation = includeValidation
        ? await aiAnnotatorService.validateNode(node)
        : null;
    }

    if (meta)
      await aiAnnotatorService.saveMeta(req.params.id, { ...meta, rule });
    if (form) await aiAnnotatorService.saveFormSpec(req.params.id, form);

    res.json({
      success: true,
      message: "Vollständige Annotation erfolgreich generiert.",
      data: { node, meta, rule, form, validation },
    });
  }),
);

// ============ ERWEITERTE BATCH OPERATIONS ============

router.post(
  "/batch",
  strictAiRateLimiter,
  asyncHandler(async (req, res, next) => {
    const validated = batchOperationSchema.parse(req.body);
    const operation = {
      ...validated,
      options: {
        retryFailed: true,
        maxRetries: 3,
        chunkSize: 10,
        parallelRequests: 2,
        modelPreference: "balanced" as const,
        ...validated.options,
      },
    } as BatchOperation;

    const result = await aiAnnotatorService.executeBatchOperation(operation);

    res.json({
      success: true,
      data: result,
    });
  }),
);

router.get(
  "/batch/:id",
  asyncHandler(async (req, res, next) => {
    const batches = await databaseTool.getBatchOperations(100);
    const batch = batches.find((b) => b.id === req.params.id);

    if (!batch) {
      throw new NotFoundError(`Batch ${req.params.id} nicht gefunden`);
    }

    res.json({
      success: true,
      data: batch,
    });
  }),
);

router.post(
  "/batch/:id/cancel",
  asyncHandler(async (req, res, next) => {
    await databaseTool.updateBatchProgress(req.params.id, 0, "cancelled");

    res.json({
      success: true,
      message: `Batch ${req.params.id} wurde abgebrochen`,
    });
  }),
);

router.post(
  "/classify-pii",
  asyncHandler(async (req, res, next) => {
    const validated = classifyPiiSchema.parse(req.body);
    const { nodeIds } = validated;

    const allNodes = await aiAnnotatorService.listCandidates({ limit: 1000 });
    const nodes = allNodes.filter((n) => nodeIds.includes(n.id));

    if (nodes.length === 0) {
      throw new NotFoundError("Keine Knoten gefunden");
    }

    const piiResults = await aiAnnotatorService.classifyPii(nodes);

    res.json({
      success: true,
      data: piiResults,
    });
  }),
);

// ============ VALIDATION & QUALITY ENDPOINTS ============

router.post(
  "/validate-batch",
  asyncHandler(async (req, res, next) => {
    const validated = validateBatchSchema.parse(req.body);
    const { nodeIds } = validated;

    const allNodes = await aiAnnotatorService.listCandidates({ limit: 1000 });
    const nodes = allNodes.filter((n) => nodeIds.includes(n.id));

    if (nodes.length === 0) {
      throw new NotFoundError("Keine Knoten gefunden");
    }

    const validationResults = await Promise.all(
      nodes.map((node) => aiAnnotatorService.validateNode(node)),
    );

    const summary = {
      total: validationResults.length,
      valid: validationResults.filter((r) => r.valid).length,
      withErrors: validationResults.filter((r) => r.errors.length > 0).length,
      withWarnings: validationResults.filter((r) => r.warnings.length > 0)
        .length,
      averageSuggestions:
        validationResults.reduce((sum, r) => sum + r.suggestions.length, 0) /
        validationResults.length,
    };

    res.json({
      success: true,
      data: {
        summary,
        results: validationResults.map((result, index) => ({
          node: nodes[index],
          validation: result,
        })),
      },
    });
  }),
);

router.get(
  "/quality/report",
  asyncHandler(async (_req, res, next) => {
    const stats = await databaseTool.getNodeStatistics();
    const batches = await databaseTool.getBatchOperations(50);

    const qualityReport = {
      annotation: {
        progress: stats.annotationProgress,
        averageConfidence: stats.averageConfidence,
        distribution: stats.byStatus,
      },
      batches: {
        total: batches.length,
        completed: batches.filter((b) => b.status === "completed").length,
        failed: batches.filter((b) => b.status === "failed").length,
        recentSuccessRate:
          batches.slice(0, 10).filter((b) => b.status === "completed").length /
          10,
      },
      recommendations: [
        stats.annotationProgress < 50
          ? "Batch-Annotation für unvollständige Knoten ausführen"
          : null,
        stats.averageConfidence < 0.7
          ? "KI-Modell für bessere Konfidenz optimieren"
          : null,
        batches.filter((b) => b.status === "failed").length > 5
          ? "Fehlerhafte Batches analysieren und wiederholen"
          : null,
      ].filter(Boolean),
    };

    res.json({
      success: true,
      data: qualityReport,
    });
  }),
);

// ============ DASHBOARD REGELN ============

router.get(
  "/rules",
  asyncHandler(async (req, res, next) => {
    const { type, widget, includeNodes = true } = req.query;

    const allNodes = await aiAnnotatorService.listCandidates({ limit: 1000 });
    const nodesWithRules = allNodes.filter((node) => node.meta_json?.rule);

    // Filterung nach Typ/Widget
    let filteredNodes = nodesWithRules;
    if (type) {
      filteredNodes = filteredNodes.filter(
        (node) => node.meta_json.rule.type === type,
      );
    }
    if (widget) {
      filteredNodes = filteredNodes.filter(
        (node) => node.meta_json.rule.widget === widget,
      );
    }

    // Gruppierung
    const rulesByType: Record<string, NodeForAnnotation[]> = {};
    const widgetsByType: Record<string, string[]> = {};

    filteredNodes.forEach((node) => {
      const ruleType = node.meta_json.rule.type;
      const widget = node.meta_json.rule.widget;

      if (!rulesByType[ruleType]) {
        rulesByType[ruleType] = [];
      }
      rulesByType[ruleType].push(node);

      if (widget) {
        if (!widgetsByType[ruleType]) {
          widgetsByType[ruleType] = [];
        }
        if (!widgetsByType[ruleType].includes(widget)) {
          widgetsByType[ruleType].push(widget);
        }
      }
    });

    res.json({
      success: true,
      data: {
        total: filteredNodes.length,
        byType: rulesByType,
        widgets: widgetsByType,
        nodes: includeNodes ? filteredNodes : undefined,
      },
    });
  }),
);

// ============ AI MODEL MANAGEMENT ============

router.get(
  "/ai/models",
  asyncHandler(async (_req, res, next) => {
    const modelStats = await aiAnnotatorService.getModelStatistics();
    res.json({
      success: true,
      data: modelStats,
    });
  }),
);

router.post(
  "/ai/optimize",
  asyncHandler(async (_req, res, next) => {
    const optimization = await aiAnnotatorService.optimizeConfiguration();
    res.json({
      success: true,
      data: optimization,
    });
  }),
);

// ============ ERROR CORRECTION CONFIG ============

router.get(
  "/error-correction/config",
  asyncHandler(async (_req, res, next) => {
    const status = await aiAnnotatorService.getStatus();
    res.json({
      success: true,
      data: status.errorCorrection,
    });
  }),
);

router.put(
  "/error-correction/config",
  asyncHandler(async (req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      throw new ForbiddenError(
        "Konfigurationsänderungen nicht in Production verfügbar",
      );
    }

    const config = errorCorrectionConfigSchema.parse(req.body);

    // TODO: Implement actual configuration persistence to database or configuration file
    // Currently returns simulated success response for development/testing purposes
    // Real implementation should:
    // 1. Validate config against aiAnnotatorService configuration schema
    // 2. Persist to database or configuration file
    // 3. Notify aiAnnotatorService to reload configuration

    res.json({
      success: true,
      message: "Konfiguration wurde aktualisiert (simuliert)",
      data: config,
    });
  }),
);

// ============ TEST & DEBUG ============

router.post(
  "/debug/prompt",
  asyncHandler(async (req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      throw new ForbiddenError("Debug endpoints nicht in Production verfügbar");
    }

    const validated = debugPromptSchema.parse(req.body);
    const { nodeId, promptType, options } = validated;

    const node = await findNodeById(nodeId);

    let prompt: string;
    switch (promptType) {
      case "meta":
        prompt = (aiAnnotatorService as any).buildEnhancedMetaPrompt(node);
        break;
      case "rule":
        prompt = (aiAnnotatorService as any).buildRulePrompt(node);
        break;
      case "form":
        prompt = (aiAnnotatorService as any).buildFormPrompt(node);
        break;
      case "simple":
        prompt = (aiAnnotatorService as any).buildSimpleMetaPrompt(node);
        break;
      case "correction":
        const mockMeta = { description: "Test", tags: [] };
        const mockErrors = ["Description too short", "No tags provided"];
        prompt = (aiAnnotatorService as any).buildCorrectionPrompt(
          node,
          mockMeta,
          mockErrors,
        );
        break;
      default:
        throw new BadRequestError("Unbekannter Prompt-Typ");
    }

    res.json({
      success: true,
      data: { node, prompt, length: prompt.length },
    });
  }),
);

router.post(
  "/debug/ai-test",
  asyncHandler(async (req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      throw new ForbiddenError(
        "Debug endpoints sind in Production deaktiviert",
      );
    }

    const validated = debugAiTestSchema.parse(req.body);
    const { prompt, model, provider } = validated;

    const testPrompt =
      prompt ||
      `Teste die AI-Verbindung. Antworte mit folgendem JSON:
{
  "status": "success",
  "message": "Verbindung erfolgreich"
}`;

    const response = await (aiAnnotatorService as any).callAI(
      testPrompt,
      "debug",
    );

    let parsed: any = null;
    try {
      parsed = JSON.parse(response);
    } catch {
      parsed = { raw: response };
    }

    res.json({
      success: true,
      data: {
        prompt: testPrompt,
        response,
        parsed,
      },
    });
  }),
);

// ============ BATCH TEMPLATES ============

router.get(
  "/batch-templates",
  asyncHandler(async (_req, res, next) => {
    const templates = {
      quick_annotation: {
        name: "Schnelle Annotation",
        description:
          "Schnelle Metadaten-Generierung für alle unannotierten Knoten",
        operation: "generate_meta",
        filters: { missingOnly: true },
        options: {
          chunkSize: 20,
          parallelRequests: 3,
          modelPreference: "fast",
        },
      },
      full_annotation: {
        name: "Vollständige Annotation",
        description:
          "Umfassende Annotation mit Metadaten, Regeln und Formularen",
        operation: "full_annotation",
        filters: { missingOnly: true },
        options: {
          chunkSize: 5,
          parallelRequests: 2,
          modelPreference: "accurate",
        },
      },
      pii_scan: {
        name: "PII Scan",
        description: "PII-Klassifizierung für alle Knoten",
        operation: "classify_pii",
        filters: {},
        options: {
          chunkSize: 50,
          parallelRequests: 5,
          modelPreference: "balanced",
        },
      },
      quality_check: {
        name: "Qualitätsprüfung",
        description: "Validierung aller annotierten Knoten",
        operation: "validate_nodes",
        filters: {},
        options: {
          chunkSize: 25,
          parallelRequests: 4,
        },
      },
    };

    res.json({
      success: true,
      data: templates,
    });
  }),
);

// ============ NODE META ============

router.get(
  "/nodes/:id/meta",
  asyncHandler(async (req, res, next) => {
    const node = await findNodeById(req.params.id);
    res.json({
      success: true,
      data: node.meta_json || {},
    });
  }),
);

// ============ NODE RULE ============

router.get(
  "/nodes/:id/rule",
  asyncHandler(async (req, res, next) => {
    const node = await findNodeById(req.params.id);
    const rule = node.meta_json?.rule;
    res.json({
      success: true,
      data: rule || null,
    });
  }),
);

// ============ NODE FORM ============

router.get(
  "/nodes/:id/form",
  asyncHandler(async (req, res, next) => {
    const node = await findNodeById(req.params.id);
    const form = node.meta_json?.formSpec;
    res.json({
      success: true,
      data: form || null,
    });
  }),
);

// ============ NODE SCHEMA ============

router.get(
  "/nodes/:id/schema",
  asyncHandler(async (req, res, next) => {
    const node = await findNodeById(req.params.id);
    res.json({
      success: true,
      data: node.schema_json || null,
    });
  }),
);

// ============ NODE ANALYTICS ============

router.get(
  "/nodes/:id/analysis",
  asyncHandler(async (req, res, next) => {
    const node = await findNodeById(req.params.id);

    const analysis = {
      technical: (aiAnnotatorService as any).analyzeTechnicalComplexity(node),
      integrationPoints: (aiAnnotatorService as any).extractIntegrationPoints(
        node,
      ),
      businessArea: (aiAnnotatorService as any).guessBusinessArea(node),
      piiClass: (aiAnnotatorService as any).guessPiiClass(node),
    };

    res.json({
      success: true,
      data: analysis,
    });
  }),
);

// ============ NODE QUALITY INFO ============

router.get(
  "/nodes/:id/quality",
  asyncHandler(async (req, res, next) => {
    const node = await findNodeById(req.params.id);
    const quality = node.meta_json?.quality;
    res.json({
      success: true,
      data: quality || null,
    });
  }),
);

// ============ NEUE ENDPOINTS FÜR ERWEITERTE FUNKTIONALITÄT ============

router.post(
  "/system/optimize",
  asyncHandler(async (_req, res, next) => {
    const result = await aiAnnotatorService.optimizeConfiguration();
    res.json({
      success: true,
      data: result,
    });
  }),
);

router.get(
  "/ai/model-stats",
  asyncHandler(async (_req, res, next) => {
    const stats = await aiAnnotatorService.getModelStatistics();
    res.json({
      success: true,
      data: stats,
    });
  }),
);

router.post(
  "/bulk-enhance",
  asyncHandler(async (req, res, next) => {
    const validated = bulkEnhanceSchema.parse(req.body);
    const { nodeIds, operations } = validated;

    const allNodes = await aiAnnotatorService.listCandidates({ limit: 1000 });
    const nodes = allNodes.filter((n) => nodeIds.includes(n.id));

    if (nodes.length === 0) {
      throw new NotFoundError("Keine Knoten gefunden");
    }

    const batchOp: BatchOperation = {
      operation: "bulk_enhance",
      filters: { nodeIds },
      options: {
        chunkSize: 5,
        parallelRequests: 2,
        modelPreference: "balanced",
      },
    };

    const result = await aiAnnotatorService.executeBatchOperation(batchOp);

    res.json({
      success: true,
      data: result,
    });
  }),
);

router.get(
  "/system/monitoring",
  asyncHandler(async (_req, res, next) => {
    const health = await aiAnnotatorService.getHealthStatus();
    const modelStats = await aiAnnotatorService.getModelStatistics();
    const dbStats = await databaseTool.getNodeStatistics();

    res.json({
      success: true,
      data: {
        health,
        models: modelStats,
        database: dbStats,
        timestamp: new Date().toISOString(),
      },
    });
  }),
);

router.post(
  "/ai/model-selection-test",
  asyncHandler(async (req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      throw new ForbiddenError("Test endpoints sind in Production deaktiviert");
    }

    const validated = modelSelectionTestSchema.parse(req.body);
    const { operation, priority } = validated;

    const model = await (
      aiAnnotatorService as any
    ).modelSelector.selectBestModel(operation, priority);

    res.json({
      success: true,
      data: {
        operation,
        priority,
        selectedModel: model,
        availableModels: (aiAnnotatorService as any).availableModels,
      },
    });
  }),
);

// ============ ADVANCED FILTERS ============

router.get(
  "/filters",
  asyncHandler(async (req, res, next) => {
    const { type, publicOnly } = req.query;
    const filters = await filterService.getFilters(
      type as string | undefined,
      publicOnly === "true",
    );
    res.json({ success: true, data: filters });
  }),
);

router.get(
  "/filters/presets",
  asyncHandler(async (req, res, next) => {
    const { type } = req.query;
    const presets = await filterService.getPresets(type as string | undefined);
    const defaultPresets = filterService.getDefaultPresets();

    res.json({
      success: true,
      data: {
        saved: presets,
        defaults: defaultPresets,
      },
    });
  }),
);

router.post(
  "/filters",
  asyncHandler(async (req, res, next) => {
    const filter = await filterService.createFilter(req.body);
    res.json({ success: true, data: filter });
  }),
);

router.get(
  "/filters/:id",
  asyncHandler(async (req, res, next) => {
    const filter = await filterService.getFilter(req.params.id);
    if (!filter) {
      throw new NotFoundError("Filter nicht gefunden");
    }
    res.json({ success: true, data: filter });
  }),
);

router.put(
  "/filters/:id",
  asyncHandler(async (req, res, next) => {
    const filter = await filterService.updateFilter(req.params.id, req.body);
    if (!filter) {
      throw new NotFoundError("Filter nicht gefunden");
    }
    res.json({ success: true, data: filter });
  }),
);

router.delete(
  "/filters/:id",
  asyncHandler(async (req, res, next) => {
    const deleted = await filterService.deleteFilter(req.params.id);
    if (!deleted) {
      throw new NotFoundError("Filter nicht gefunden");
    }
    res.json({ success: true, message: "Filter gelöscht" });
  }),
);

router.post(
  "/filters/:id/apply",
  asyncHandler(async (req, res, next) => {
    const filter = await filterService.getFilter(req.params.id);
    if (!filter) {
      throw new NotFoundError("Filter nicht gefunden");
    }

    await filterService.incrementUsageCount(req.params.id);

    const allNodes = await aiAnnotatorService.listCandidates({ limit: 10000 });
    const filtered = filterService.applyFilter(allNodes, filter.filterConfig);

    res.json({
      success: true,
      data: {
        filter,
        results: filtered,
        total: filtered.length,
      },
    });
  }),
);

router.post(
  "/filters/export",
  asyncHandler(async (req, res, next) => {
    const validated = exportFilterSchema.parse(req.body);
    const { nodes, format } = validated;

    const exported = await filterService.exportFilteredResults(nodes, format);

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=export.csv");
    } else {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=export.json");
    }

    res.send(exported);
  }),
);

// ============ QUALITY ASSURANCE ============

router.get(
  "/qa/dashboard",
  asyncHandler(async (_req, res, next) => {
    const data = await qualityAssuranceService.getDashboardData();
    res.json({ success: true, data });
  }),
);

router.get(
  "/qa/reviews",
  asyncHandler(async (req, res, next) => {
    const { status, limit = "50", offset = "0" } = req.query;
    const reviews = await qualityAssuranceService.getReviewsByStatus(
      (status as string) || "pending",
      parseInt(limit as string),
      parseInt(offset as string),
    );
    res.json({ success: true, data: reviews });
  }),
);

router.get(
  "/qa/reviews/node/:nodeId",
  asyncHandler(async (req, res, next) => {
    const reviews = await qualityAssuranceService.getReviewsByNode(
      req.params.nodeId,
    );
    res.json({ success: true, data: reviews });
  }),
);

router.post(
  "/qa/reviews",
  asyncHandler(async (req, res, next) => {
    const review = await qualityAssuranceService.createReview(req.body);
    res.json({ success: true, data: review });
  }),
);

router.put(
  "/qa/reviews/:id",
  asyncHandler(async (req, res, next) => {
    const review = await qualityAssuranceService.updateReview(
      req.params.id,
      req.body,
    );
    if (!review) {
      throw new NotFoundError("Review nicht gefunden");
    }
    res.json({ success: true, data: review });
  }),
);

router.post(
  "/qa/reviews/:id/approve",
  asyncHandler(async (req, res, next) => {
    const validated = approveRejectReviewSchema.parse(req.body);
    const { reviewer, comments } = validated;
    const review = await qualityAssuranceService.updateReview(req.params.id, {
      reviewStatus: "approved",
      reviewer,
      reviewComments: comments,
    });

    if (!review) {
      throw new NotFoundError("Review nicht gefunden");
    }

    res.json({ success: true, data: review });
  }),
);

router.post(
  "/qa/reviews/:id/reject",
  asyncHandler(async (req, res, next) => {
    const validated = approveRejectReviewSchema.parse(req.body);
    const { reviewer, comments } = validated;
    const review = await qualityAssuranceService.updateReview(req.params.id, {
      reviewStatus: "rejected",
      reviewer,
      reviewComments: comments,
    });

    if (!review) {
      throw new NotFoundError("Review nicht gefunden");
    }

    res.json({ success: true, data: review });
  }),
);

router.get(
  "/qa/trends",
  asyncHandler(async (req, res, next) => {
    const { metricType, days = "30" } = req.query;
    const trends = await qualityAssuranceService.getQualityTrends(
      metricType as string | undefined,
      parseInt(days as string),
    );
    res.json({ success: true, data: trends });
  }),
);

router.post(
  "/qa/metrics/node/:nodeId",
  asyncHandler(async (req, res, next) => {
    const allNodes = await aiAnnotatorService.listCandidates({ limit: 10000 });
    const node = allNodes.find((n) => n.id === req.params.nodeId);

    if (!node) {
      throw new NotFoundError("Node nicht gefunden");
    }

    const metrics = qualityAssuranceService.calculateQualityMetrics(node);
    res.json({ success: true, data: metrics });
  }),
);

// ============ MODEL MANAGEMENT ============

router.get(
  "/models/stats",
  asyncHandler(async (req, res, next) => {
    const { days = "30" } = req.query;
    const stats = await modelManagementService.getAllModelsStats(
      parseInt(days as string),
    );
    res.json({ success: true, data: stats });
  }),
);

router.get(
  "/models/stats/:modelName",
  asyncHandler(async (req, res, next) => {
    const { days = "30" } = req.query;
    const stats = await modelManagementService.getModelStats(
      req.params.modelName,
      parseInt(days as string),
    );

    if (!stats) {
      throw new NotFoundError("Keine Statistiken für dieses Model gefunden");
    }

    res.json({ success: true, data: stats });
  }),
);

router.post(
  "/models/compare",
  asyncHandler(async (req, res, next) => {
    const validated = compareModelsSchema.parse(req.body);
    const { models, days } = validated;

    const comparison = await modelManagementService.compareModels(models, days);
    res.json({ success: true, data: comparison });
  }),
);

router.get(
  "/models/costs",
  asyncHandler(async (req, res, next) => {
    const { period = "month" } = req.query;
    const breakdown = await modelManagementService.getCostBreakdown(
      period as "day" | "week" | "month",
    );
    res.json({ success: true, data: breakdown });
  }),
);

router.get(
  "/models/usage-timeline",
  asyncHandler(async (req, res, next) => {
    const { days = "30", granularity = "day" } = req.query;
    const timeline = await modelManagementService.getUsageOverTime(
      parseInt(days as string),
      granularity as "hour" | "day",
    );
    res.json({ success: true, data: timeline });
  }),
);

router.get(
  "/models/availability",
  asyncHandler(async (_req, res, next) => {
    const availability = await modelManagementService.getModelAvailability();
    res.json({ success: true, data: availability });
  }),
);

router.get(
  "/models/recommendations",
  asyncHandler(async (req, res, next) => {
    const { prioritize, maxCost, minAccuracy } = req.query;

    const criteria: any = {};
    if (prioritize) criteria.prioritize = prioritize;
    if (maxCost) criteria.maxCost = parseFloat(maxCost as string);
    if (minAccuracy) criteria.minAccuracy = parseFloat(minAccuracy as string);

    const recommendations =
      await modelManagementService.getModelRecommendations(criteria);
    res.json({ success: true, data: recommendations });
  }),
);

router.get(
  "/models/registered",
  asyncHandler(async (_req, res, next) => {
    const models = await modelManagementService.getRegisteredModels();
    res.json({ success: true, data: models });
  }),
);

// ============ ENHANCED BATCH PROCESSING ============

router.post(
  "/batch/create",
  asyncHandler(async (req, res, next) => {
    const batch = await batchProcessingService.createBatch(req.body);
    res.json({ success: true, data: batch });
  }),
);

router.get(
  "/batch/history",
  asyncHandler(async (req, res, next) => {
    const {
      operation,
      status,
      createdAfter,
      createdBefore,
      limit = "50",
      offset = "0",
    } = req.query;

    const filter: any = {};
    if (operation) filter.operation = operation;
    if (status) filter.status = status;
    if (createdAfter) filter.createdAfter = createdAfter;
    if (createdBefore) filter.createdBefore = createdBefore;
    filter.limit = parseInt(limit as string);
    filter.offset = parseInt(offset as string);

    const history = await batchProcessingService.getBatchHistory(filter);
    res.json({ success: true, data: history });
  }),
);

router.get(
  "/batch/:id/details",
  asyncHandler(async (req, res, next) => {
    const batch = await batchProcessingService.getBatchWithResults(
      req.params.id,
    );
    if (!batch) {
      throw new NotFoundError("Batch nicht gefunden");
    }
    res.json({ success: true, data: batch });
  }),
);

router.get(
  "/batch/:id/visualization",
  asyncHandler(async (req, res, next) => {
    const visualization = await batchProcessingService.getBatchVisualization(
      req.params.id,
    );
    if (!visualization) {
      throw new NotFoundError("Batch nicht gefunden");
    }
    res.json({ success: true, data: visualization });
  }),
);

router.post(
  "/batch/:id/cancel-v2",
  asyncHandler(async (req, res, next) => {
    const cancelled = await batchProcessingService.cancelBatch(req.params.id);
    if (!cancelled) {
      throw new BadRequestError("Batch konnte nicht abgebrochen werden");
    }
    res.json({ success: true, message: "Batch wurde abgebrochen" });
  }),
);

export default router;
