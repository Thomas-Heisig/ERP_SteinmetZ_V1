// SPDX-License-Identifier: MIT
// apps/backend/src/routes/aiAnnotatorRouter/aiAnnotatorRouter.ts

/**
 * AI Annotator Router
 *
 * Provides AI-powered metadata annotation and quality assurance for function
 * catalog nodes. Supports batch processing, model management, and quality
 * validation workflows.
 *
 * @remarks
 * This router provides:
 * - Node annotation with AI-generated metadata
 * - Batch processing for bulk annotations
 * - Quality assurance workflows
 * - Manual review and approval
 * - Model selection and performance comparison
 * - Filter management for targeted processing
 * - Dashboard and form generation
 * - Annotation history and statistics
 *
 * Features:
 * - Multi-provider AI support (OpenAI, Anthropic, Ollama)
 * - Smart model selection based on task complexity
 * - Quality scoring and validation
 * - Approval workflows with review status
 * - Batch progress tracking with WebSocket updates
 * - Cost tracking per model and operation
 * - PII classification and compliance tagging
 *
 * Annotation Quality Workflow:
 * 1. pending - Node awaiting annotation
 * 2. annotated - AI has generated metadata
 * 3. reviewed - Human has reviewed annotation
 * 4. approved - Annotation quality approved
 * 5. rejected - Annotation rejected, needs rework
 *
 * @module routes/aiAnnotator
 *
 * @example
 * ```typescript
 * // Annotate single node
 * POST /api/ai-annotator/annotate
 * {
 *   "nodeIds": [123, 456],
 *   "force": false
 * }
 *
 * // Create batch operation
 * POST /api/ai-annotator/batch
 * {
 *   "operation": "annotate",
 *   "filters": { "annotation_status": "pending" },
 *   "options": { "batchSize": 50 }
 * }
 *
 * // Get quality metrics
 * GET /api/ai-annotator/quality/metrics
 *
 * // Approve annotation
 * POST /api/ai-annotator/quality/approve/:nodeId
 * { "approvedBy": "user-123" }
 * ```
 */

import { Router } from "express";
import { createLogger } from "../../utils/logger.js";
import aiAnnotatorService, {
  BatchOperation,
  NodeForAnnotation,
  DatabaseTool,
  FormSpec,
  GeneratedMeta,
  DashboardRule,
} from "./aiAnnotatorService.js";
import { strictAiRateLimiter } from "../../middleware/rateLimiters.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../error/errors.js";
import { filterService } from "../other/filterService.js";
import { qualityAssuranceService } from "../other/qualityAssuranceService.js";
import { modelManagementService } from "../modelmanager/modelManagementService.js";
import { batchProcessingService } from "../batch/batchProcessingService.js";

// Import types and schemas from centralized types file
import {
  batchOperationSchema,
  classifyPiiSchema,
  validateBatchSchema,
  errorCorrectionConfigSchema,
  debugPromptSchema,
  debugAiTestSchema,
  bulkEnhanceSchema,
  modelSelectionTestSchema,
  exportFilterSchema,
  fullAnnotationRequestSchema,
  approveRejectReviewSchema,
  compareModelsSchema,
  toStringArray,
  toBool,
  toInt,
} from "./types.js";

const logger = createLogger("ai-annotator");
const router = Router();
const databaseTool = DatabaseTool.getInstance();

/** Helper function to find node by ID */
async function findNodeById(id: string): Promise<NodeForAnnotation> {
  logger.debug({ nodeId: id }, "Searching for node by ID");
  const nodes = await aiAnnotatorService.listCandidates({
    limit: 1,
    search: id,
  });
  const node = nodes.find((n) => n.id === id);
  if (!node) {
    logger.warn({ nodeId: id }, "Node not found");
    throw new NotFoundError(`Knoten ${id} nicht gefunden`);
  }
  logger.debug({ nodeId: id, nodeKind: node.kind }, "Node found");
  return node;
}

// ============ SYSTEM STATUS & HEALTH ============

/**
 * Get system status
 * @route GET /api/ai-annotator/status
 * @access Private
 */
router.get(
  "/status",
  asyncHandler(async (_req, res) => {
    logger.debug("Fetching AI Annotator system status");
    const status = await aiAnnotatorService.getStatus();
    res.json({ success: true, data: status });
  }),
);

/**
 * Get health status
 * @route GET /api/ai-annotator/health
 * @access Private
 */
router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    logger.debug("Fetching AI Annotator health status");
    const health = await aiAnnotatorService.getHealthStatus();
    res.json({ success: true, data: health });
  }),
);

// ============ DATABASE TOOL ENDPOINTS ============

/**
 * Get node statistics
 * @route GET /api/ai-annotator/database/stats
 * @access Private
 */
router.get(
  "/database/stats",
  asyncHandler(async (_req, res) => {
    logger.debug("Fetching database node statistics");
    const stats = await databaseTool.getNodeStatistics();
    res.json({ success: true, data: stats });
  }),
);

/**
 * Get batch operations
 * @route GET /api/ai-annotator/database/batches
 * @access Private
 */
router.get(
  "/database/batches",
  asyncHandler(async (req, res) => {
    const limit = toInt(req.query.limit, 50);
    logger.debug({ limit }, "Fetching batch operations");
    const batches = await databaseTool.getBatchOperations(limit);

    res.json({
      success: true,
      data: batches,
      pagination: { limit, total: batches.length },
    });
  }),
);

/**
 * Cleanup old batch operations
 * @route DELETE /api/ai-annotator/database/batches/cleanup
 * @access Private
 */
router.delete(
  "/database/batches/cleanup",
  asyncHandler(async (req, res) => {
    if (process.env.NODE_ENV === "production" && req.query.force !== "true") {
      logger.warn("Attempted cleanup in production without force flag");
      throw new ForbiddenError("Cleanup in Production erfordert force=true");
    }

    const daysToKeep = toInt(req.query.days, 30);
    logger.info({ daysToKeep }, "Cleaning up old batch operations");
    await databaseTool.cleanupOldBatches(daysToKeep);

    res.json({
      success: true,
      message: `Alte Batch-Jobs älter als ${daysToKeep} Tage wurden bereinigt`,
    });
  }),
);

// ============ ERWEITERTE NODE MANAGEMENT ============

/**
 * List annotation candidate nodes
 * @route GET /api/ai-annotator/nodes
 * @access Private
 */
router.get(
  "/nodes",
  asyncHandler(async (req, res) => {
    const kinds = toStringArray(req.query.kinds);
    const missingOnly = toBool(req.query.missingOnly, false);
    const limit = toInt(req.query.limit, 50);
    const offset = toInt(req.query.offset, 0);
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const status = toStringArray(req.query.status);
    const businessArea = toStringArray(req.query.businessArea);
    const complexity = toStringArray(req.query.complexity);

    logger.debug(
      { kinds, status, limit, offset },
      "Listing annotation candidate nodes",
    );

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
      pagination: {
        limit,
        offset,
        total: nodes.length,
      },
      filters: {
        kinds,
        status,
        businessArea,
        complexity,
      },
    });
  }),
);

/**
 * Get single node by ID
 * @route GET /api/ai-annotator/nodes/:id
 * @access Private
 */
router.get(
  "/nodes/:id",
  asyncHandler(async (req, res) => {
    const node = await findNodeById(req.params.id);
    res.json({
      success: true,
      data: { node },
    });
  }),
);

/**
 * Validate node annotations
 * @route POST /api/ai-annotator/nodes/:id/validate
 * @access Private
 */
router.post(
  "/nodes/:id/validate",
  asyncHandler(async (req, res) => {
    logger.debug({ nodeId: req.params.id }, "Validating node");
    const node = await findNodeById(req.params.id);
    const validation = await aiAnnotatorService.validateNode(node);

    res.json({
      success: true,
      data: { node, validation },
    });
  }),
);

// ============ SINGLE OPERATIONS MIT ERROR CORRECTION ============

/**
 * Generate metadata for a node
 * @route POST /api/ai-annotator/nodes/:id/generate-meta
 * @access Private
 */
router.post(
  "/nodes/:id/generate-meta",
  strictAiRateLimiter,
  asyncHandler(async (req, res) => {
    logger.info({ nodeId: req.params.id }, "Generating metadata");
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

/**
 * Generate dashboard rule for a node
 * @route POST /api/ai-annotator/nodes/:id/generate-rule
 * @access Private
 */
router.post(
  "/nodes/:id/generate-rule",
  strictAiRateLimiter,
  asyncHandler(async (req, res) => {
    logger.info({ nodeId: req.params.id }, "Generating dashboard rule");
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

/**
 * Generate form specification for a node
 * @route POST /api/ai-annotator/nodes/:id/generate-form
 * @access Private
 */
router.post(
  "/nodes/:id/generate-form",
  strictAiRateLimiter,
  asyncHandler(async (req, res) => {
    logger.info({ nodeId: req.params.id }, "Generating form specification");
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

/**
 * Enhance schema with AI suggestions
 * @route POST /api/ai-annotator/nodes/:id/enhance-schema
 * @access Private
 */
router.post(
  "/nodes/:id/enhance-schema",
  asyncHandler(async (req, res) => {
    logger.info({ nodeId: req.params.id }, "Enhancing schema");
    const node = await findNodeById(req.params.id);
    const enhancedSchema = await aiAnnotatorService.enhanceSchema(node);

    res.json({
      success: true,
      message: "Schema erfolgreich erweitert.",
      data: { node, enhancedSchema },
    });
  }),
);

/**
 * Generate full annotation (meta, rule, form) for a node
 * @route POST /api/ai-annotator/nodes/:id/full-annotation
 * @access Private
 */
router.post(
  "/nodes/:id/full-annotation",
  asyncHandler(async (req, res) => {
    const validated = fullAnnotationRequestSchema.parse(req.body);
    const { includeValidation, parallel } = validated;
    logger.info(
      { nodeId: req.params.id, includeValidation, parallel },
      "Generating full annotation",
    );
    const node = await findNodeById(req.params.id);

    let meta: unknown,
      rule: unknown,
      form: unknown,
      validation: unknown = null;

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

    if (
      meta &&
      typeof meta === "object" &&
      "description" in meta &&
      "tags" in meta
    )
      await aiAnnotatorService.saveMeta(req.params.id, meta as GeneratedMeta);
    if (rule && typeof rule === "object" && "type" in rule)
      await aiAnnotatorService.saveRule(req.params.id, rule as DashboardRule);
    if (form && typeof form === "object" && "title" in form)
      await aiAnnotatorService.saveFormSpec(req.params.id, form as FormSpec);

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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
    await databaseTool.updateBatchProgress(req.params.id, 0, "cancelled");

    res.json({
      success: true,
      message: `Batch ${req.params.id} wurde abgebrochen`,
    });
  }),
);

router.post(
  "/classify-pii",
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (_req, res) => {
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
  asyncHandler(async (req, res) => {
    const { type, widget, includeNodes = true } = req.query;

    const allNodes = await aiAnnotatorService.listCandidates({ limit: 1000 });
    const nodesWithRules = allNodes.filter((node) => node.meta_json?.rule);

    // Filterung nach Typ/Widget
    let filteredNodes = nodesWithRules;
    if (type) {
      filteredNodes = filteredNodes.filter(
        (node) =>
          node.meta_json &&
          typeof node.meta_json === "object" &&
          "rule" in node.meta_json &&
          typeof node.meta_json.rule === "object" &&
          node.meta_json.rule &&
          "type" in node.meta_json.rule &&
          node.meta_json.rule.type === type,
      );
    }
    if (widget) {
      filteredNodes = filteredNodes.filter(
        (node) =>
          node.meta_json &&
          typeof node.meta_json === "object" &&
          "rule" in node.meta_json &&
          typeof node.meta_json.rule === "object" &&
          node.meta_json.rule &&
          "widget" in node.meta_json.rule &&
          node.meta_json.rule.widget === widget,
      );
    }

    // Gruppierung
    const rulesByType: Record<string, NodeForAnnotation[]> = {};
    const widgetsByType: Record<string, string[]> = {};

    filteredNodes.forEach((node) => {
      if (
        !node.meta_json ||
        typeof node.meta_json !== "object" ||
        !("rule" in node.meta_json) ||
        typeof node.meta_json.rule !== "object" ||
        !node.meta_json.rule
      ) {
        return;
      }

      const rule = node.meta_json.rule as Record<string, unknown>;
      const ruleType = typeof rule.type === "string" ? rule.type : "unknown";
      const widget = typeof rule.widget === "string" ? rule.widget : undefined;

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
  asyncHandler(async (_req, res) => {
    const modelStats = await aiAnnotatorService.getModelStatistics();
    res.json({
      success: true,
      data: modelStats,
    });
  }),
);

router.post(
  "/ai/optimize",
  asyncHandler(async (_req, res) => {
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
  asyncHandler(async (_req, res) => {
    const status = await aiAnnotatorService.getStatus();
    res.json({
      success: true,
      data: status.errorCorrection,
    });
  }),
);

router.put(
  "/error-correction/config",
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
    if (process.env.NODE_ENV === "production") {
      throw new ForbiddenError("Debug endpoints nicht in Production verfügbar");
    }

    const validated = debugPromptSchema.parse(req.body);
    const { nodeId, promptType } = validated;

    const node = await findNodeById(nodeId);

    let prompt: string;
    switch (promptType) {
      case "meta":
        prompt = (
          (aiAnnotatorService as unknown as Record<string, unknown>)
            .buildEnhancedMetaPrompt as (node: NodeForAnnotation) => string
        )(node);
        break;
      case "rule":
        prompt = (
          (aiAnnotatorService as unknown as Record<string, unknown>)
            .buildRulePrompt as (node: NodeForAnnotation) => string
        )(node);
        break;
      case "form":
        prompt = (
          (aiAnnotatorService as unknown as Record<string, unknown>)
            .buildFormPrompt as (node: NodeForAnnotation) => string
        )(node);
        break;
      case "simple":
        prompt = (
          (aiAnnotatorService as unknown as Record<string, unknown>)
            .buildSimpleMetaPrompt as (node: NodeForAnnotation) => string
        )(node);
        break;
      case "correction": {
        const mockMeta = { description: "Test", tags: [] };
        const mockErrors = ["Description too short", "No tags provided"];
        prompt = (
          (aiAnnotatorService as unknown as Record<string, unknown>)
            .buildCorrectionPrompt as (
            node: NodeForAnnotation,
            meta: unknown,
            errors: string[],
          ) => string
        )(node, mockMeta, mockErrors);
        break;
      }
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
  asyncHandler(async (req, res) => {
    if (process.env.NODE_ENV === "production") {
      throw new ForbiddenError(
        "Debug endpoints sind in Production deaktiviert",
      );
    }

    const validated = debugAiTestSchema.parse(req.body);
    const { prompt } = validated;

    const testPrompt =
      prompt ||
      `Teste die AI-Verbindung. Antworte mit folgendem JSON:
{
  "status": "success",
  "message": "Verbindung erfolgreich"
}`;

    const response = await (
      (aiAnnotatorService as unknown as Record<string, unknown>).callAI as (
        prompt: string,
        operation: string,
      ) => Promise<string>
    )(testPrompt, "debug");

    let parsed: unknown = null;
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
  asyncHandler(async (_req, res) => {
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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
    const node = await findNodeById(req.params.id);

    const service = aiAnnotatorService as unknown as Record<string, unknown>;
    const analysis = {
      technical: (
        service.analyzeTechnicalComplexity as (
          node: NodeForAnnotation,
        ) => unknown
      )(node),
      integrationPoints: (
        service.extractIntegrationPoints as (node: NodeForAnnotation) => unknown
      )(node),
      businessArea: (
        service.guessBusinessArea as (node: NodeForAnnotation) => unknown
      )(node),
      piiClass: (service.guessPiiClass as (node: NodeForAnnotation) => unknown)(
        node,
      ),
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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (_req, res) => {
    const result = await aiAnnotatorService.optimizeConfiguration();
    res.json({
      success: true,
      data: result,
    });
  }),
);

router.get(
  "/ai/model-stats",
  asyncHandler(async (_req, res) => {
    const stats = await aiAnnotatorService.getModelStatistics();
    res.json({
      success: true,
      data: stats,
    });
  }),
);

router.post(
  "/bulk-enhance",
  asyncHandler(async (req, res) => {
    const validated = bulkEnhanceSchema.parse(req.body);
    const { nodeIds } = validated;

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
  asyncHandler(async (_req, res) => {
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
  asyncHandler(async (req, res) => {
    if (process.env.NODE_ENV === "production") {
      throw new ForbiddenError("Test endpoints sind in Production deaktiviert");
    }

    const validated = modelSelectionTestSchema.parse(req.body);
    const { operation, priority } = validated;

    const service = aiAnnotatorService as unknown as Record<string, unknown>;
    const modelSelector = service.modelSelector as Record<string, unknown>;
    const model = await (
      modelSelector.selectBestModel as (
        operation: string,
        priority: string,
      ) => Promise<unknown>
    )(operation, priority);

    res.json({
      success: true,
      data: {
        operation,
        priority,
        selectedModel: model,
        availableModels: service.availableModels,
      },
    });
  }),
);

// ============ ADVANCED FILTERS ============

router.get(
  "/filters",
  asyncHandler(async (req, res) => {
    const { type, publicOnly } = req.query;
    const filters = filterService.getFilters(
      type as string | undefined,
      publicOnly === "true",
    );
    res.json({ success: true, data: filters });
  }),
);

router.get(
  "/filters/presets",
  asyncHandler(async (req, res) => {
    const { type } = req.query;
    const presets = filterService.getPresets(type as string | undefined);
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
  asyncHandler(async (req, res) => {
    const filter = filterService.createFilter(req.body);
    res.json({ success: true, data: filter });
  }),
);

router.get(
  "/filters/:id",
  asyncHandler(async (req, res) => {
    const filter = filterService.getFilter(req.params.id);
    if (!filter) {
      throw new NotFoundError("Filter nicht gefunden");
    }
    res.json({ success: true, data: filter });
  }),
);

router.put(
  "/filters/:id",
  asyncHandler(async (req, res) => {
    const filter = filterService.updateFilter(req.params.id, req.body);
    if (!filter) {
      throw new NotFoundError("Filter nicht gefunden");
    }
    res.json({ success: true, data: filter });
  }),
);

router.delete(
  "/filters/:id",
  asyncHandler(async (req, res) => {
    const deleted = filterService.deleteFilter(req.params.id);
    if (!deleted) {
      throw new NotFoundError("Filter nicht gefunden");
    }
    res.json({ success: true, message: "Filter gelöscht" });
  }),
);

router.post(
  "/filters/:id/apply",
  asyncHandler(async (req, res) => {
    const filter = filterService.getFilter(req.params.id);
    if (!filter) {
      throw new NotFoundError("Filter nicht gefunden");
    }

    filterService.incrementUsageCount(req.params.id);

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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (_req, res) => {
    const data = qualityAssuranceService.getDashboardData();
    res.json({ success: true, data });
  }),
);

router.get(
  "/qa/reviews",
  asyncHandler(async (req, res) => {
    const { status, limit = "50", offset = "0" } = req.query;
    const reviews = qualityAssuranceService.getReviewsByStatus(
      (status as string) || "pending",
      parseInt(limit as string),
      parseInt(offset as string),
    );
    res.json({ success: true, data: reviews });
  }),
);

router.get(
  "/qa/reviews/node/:nodeId",
  asyncHandler(async (req, res) => {
    const reviews = qualityAssuranceService.getReviewsByNode(req.params.nodeId);
    res.json({ success: true, data: reviews });
  }),
);

router.post(
  "/qa/reviews",
  asyncHandler(async (req, res) => {
    const review = qualityAssuranceService.createReview(req.body);
    res.json({ success: true, data: review });
  }),
);

router.put(
  "/qa/reviews/:id",
  asyncHandler(async (req, res) => {
    const review = qualityAssuranceService.updateReview(
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
  asyncHandler(async (req, res) => {
    const validated = approveRejectReviewSchema.parse(req.body);
    const { reviewer, comments } = validated;
    const review = qualityAssuranceService.updateReview(req.params.id, {
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
  asyncHandler(async (req, res) => {
    const validated = approveRejectReviewSchema.parse(req.body);
    const { reviewer, comments } = validated;
    const review = qualityAssuranceService.updateReview(req.params.id, {
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
  asyncHandler(async (req, res) => {
    const { metricType, days = "30" } = req.query;
    const trends = qualityAssuranceService.getQualityTrends(
      metricType as string | undefined,
      parseInt(days as string),
    );
    res.json({ success: true, data: trends });
  }),
);

router.post(
  "/qa/metrics/node/:nodeId",
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
    const { days = "30" } = req.query;
    const stats = modelManagementService.getAllModelsStats(
      parseInt(days as string),
    );
    res.json({ success: true, data: stats });
  }),
);

router.get(
  "/models/stats/:modelName",
  asyncHandler(async (req, res) => {
    const { days = "30" } = req.query;
    const stats = modelManagementService.getModelStats(
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
  asyncHandler(async (req, res) => {
    const validated = compareModelsSchema.parse(req.body);
    const { models, days } = validated;

    const comparison = modelManagementService.compareModels(models, days);
    res.json({ success: true, data: comparison });
  }),
);

router.get(
  "/models/costs",
  asyncHandler(async (req, res) => {
    const { period = "month" } = req.query;
    const breakdown = modelManagementService.getCostBreakdown(
      period as "day" | "week" | "month",
    );
    res.json({ success: true, data: breakdown });
  }),
);

router.get(
  "/models/usage-timeline",
  asyncHandler(async (req, res) => {
    const { days = "30", granularity = "day" } = req.query;
    const timeline = modelManagementService.getUsageOverTime(
      parseInt(days as string),
      granularity as "hour" | "day",
    );
    res.json({ success: true, data: timeline });
  }),
);

router.get(
  "/models/availability",
  asyncHandler(async (_req, res) => {
    const availability = modelManagementService.getModelAvailability();
    res.json({ success: true, data: availability });
  }),
);

router.get(
  "/models/recommendations",
  asyncHandler(async (req, res) => {
    const { prioritize, maxCost, minAccuracy } = req.query;

    const criteria: Record<string, unknown> = {};
    if (prioritize) criteria.prioritize = prioritize;
    if (maxCost) criteria.maxCost = parseFloat(maxCost as string);
    if (minAccuracy) criteria.minAccuracy = parseFloat(minAccuracy as string);

    const recommendations =
      modelManagementService.getModelRecommendations(criteria);
    res.json({ success: true, data: recommendations });
  }),
);

router.get(
  "/models/registered",
  asyncHandler(async (_req, res) => {
    const models = modelManagementService.getRegisteredModels();
    res.json({ success: true, data: models });
  }),
);

// ============ ENHANCED BATCH PROCESSING ============

router.post(
  "/batch/create",
  asyncHandler(async (req, res) => {
    const batch = batchProcessingService.createBatch(req.body);
    res.json({ success: true, data: batch });
  }),
);

router.get(
  "/batch/history",
  asyncHandler(async (req, res) => {
    const {
      operation,
      status,
      createdAfter,
      createdBefore,
      limit = "50",
      offset = "0",
    } = req.query;

    const filter: Record<string, unknown> = {};
    if (operation) filter.operation = operation;
    if (status) filter.status = status;
    if (createdAfter) filter.createdAfter = createdAfter;
    if (createdBefore) filter.createdBefore = createdBefore;
    filter.limit = parseInt(limit as string);
    filter.offset = parseInt(offset as string);

    const history = batchProcessingService.getBatchHistory(filter);
    res.json({ success: true, data: history });
  }),
);

router.get(
  "/batch/:id/details",
  asyncHandler(async (req, res) => {
    const batch = batchProcessingService.getBatchWithResults(req.params.id);
    if (!batch) {
      throw new NotFoundError("Batch nicht gefunden");
    }
    res.json({ success: true, data: batch });
  }),
);

router.get(
  "/batch/:id/visualization",
  asyncHandler(async (req, res) => {
    const visualization = batchProcessingService.getBatchVisualization(
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
  asyncHandler(async (req, res) => {
    const cancelled = batchProcessingService.cancelBatch(req.params.id);
    if (!cancelled) {
      throw new BadRequestError("Batch konnte nicht abgebrochen werden");
    }
    res.json({ success: true, message: "Batch wurde abgebrochen" });
  }),
);

export default router;
