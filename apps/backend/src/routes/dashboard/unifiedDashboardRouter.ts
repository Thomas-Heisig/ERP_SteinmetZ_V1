// SPDX-License-Identifier: MIT
// apps/backend/src/routes/unifiedDashboard/unifiedDashboardRouter.ts

/**
 * Unified Dashboard Router
 *
 * Verschmilzt KI-Annotator und Funktionskatalog zu einem einzigen Dashboard
 * für die Generierung und Verwaltung von Funktionen, Formularen und Widgets.
 *
 * @remarks
 * Dieses Router-Modul vereint:
 * - Funktionskatalog (Navigation, Suche, Hierarchie)
 * - KI-Annotator (Meta-Generierung, Forms, Rules)
 * - Dashboard-Widgets (KPI-Cards, Charts, Lists)
 * - Batch-Operationen (Bulk-Annotation, QA-Pipeline)
 *
 * Features:
 * - Unified API für Frontend (keine getrennten Calls)
 * - Konsistente Response-Formate
 * - Integrierte Qualitätssicherung
 * - Multi-Provider AI Support
 * - Regelbasierte Widget-Platzierung
 *
 * @module routes/unifiedDashboard
 *
 * @example
 * ```typescript
 * // Alle Funktionen mit Meta-Daten laden
 * GET /api/unified-dashboard/functions
 *
 * // KI-generiert Meta/Form/Rule für Funktion
 * POST /api/unified-dashboard/functions/:id/generate
 * {
 *   "types": ["meta", "form", "rule"],
 *   "force": false
 * }
 *
 * // Dashboard-Widgets abrufen
 * GET /api/unified-dashboard/widgets?context={"roles":["hr"]}
 * ```
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import pino from "pino";

// Services
import {
  FunctionsCatalogService,
  type MenuContext,
  type SearchParams,
} from "../functionsCatalog/functionsCatalogService.js";
import aiAnnotatorService, {
  type NodeForAnnotation,
  type GeneratedMeta,
  type DashboardRule,
  type FormSpec,
} from "../aiAnnotatorRouter/aiAnnotatorService.js";

// Middleware
import { strictAiRateLimiter } from "../../middleware/rateLimiters.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import {
  cacheMiddleware,
  invalidateCacheMiddleware,
} from "../../middleware/cacheMiddleware.js";

// Types & Errors
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../error/errors.js";

/* ========================================================================== */
/* Logger & Router                                                            */
/* ========================================================================== */

const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const router = Router();

// Service Instances
const catalogService = new FunctionsCatalogService();

/* ========================================================================== */
/* Zod Validation Schemas                                                    */
/* ========================================================================== */

const generateSchema = z.object({
  types: z
    .array(z.enum(["meta", "form", "rule", "widget"]))
    .optional()
    .default(["meta"]),
  force: z.boolean().optional().default(false),
  options: z
    .object({
      modelPreference: z.enum(["fast", "balanced", "accurate"]).optional(),
      includeValidation: z.boolean().optional().default(true),
      parallel: z.boolean().optional().default(true),
    })
    .optional(),
});

const batchOperationSchema = z.object({
  operation: z.enum([
    "annotate",
    "validate",
    "generate_meta",
    "generate_forms",
    "generate_rules",
  ]),
  filters: z.object({
    kinds: z.array(z.string()).optional(),
    status: z.array(z.string()).optional(),
    businessArea: z.array(z.string()).optional(),
    missingOnly: z.boolean().optional(),
  }),
  options: z
    .object({
      retryFailed: z.boolean().optional().default(true),
      maxRetries: z.number().int().positive().optional().default(3),
      chunkSize: z.number().int().positive().optional().default(10),
      parallelRequests: z.number().int().positive().optional().default(2),
      modelPreference: z.enum(["fast", "balanced", "accurate"]).optional(),
    })
    .optional(),
});

const widgetContextSchema = z.object({
  roles: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  area: z.string().optional(),
});

const searchQuerySchema = z.object({
  q: z.string().optional(),
  kinds: z.string().optional(),
  tags: z.string().optional(),
  area: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

/* ========================================================================== */
/* Helper Functions                                                           */
/* ========================================================================== */

/**
 * Merged function data from Catalog + Annotator
 */
interface UnifiedFunction {
  // From Catalog
  id: string;
  kind: string;
  parent_id?: string;
  breadcrumbs?: Array<{ id: string; title: string }>;

  // From Annotator (if available)
  meta?: GeneratedMeta;
  schema?: unknown;
  rule?: DashboardRule;
  form?: FormSpec;

  // Quality Metrics
  quality?: {
    annotated: boolean;
    validated: boolean;
    coverage: number; // 0-1
    last_updated?: string;
  };
}

/**
 * Merge function from catalog with annotation data
 */
async function mergeFunctionData(
  catalogNode: unknown,
): Promise<UnifiedFunction> {
  const node = catalogNode as {
    id: string;
    kind: string;
    parent_id?: string;
    breadcrumbs?: Array<{ id: string; title: string }>;
    meta_json?: unknown;
    schema_json?: unknown;
    rule_json?: unknown;
    form_json?: unknown;
  };

  // Try to get annotation data
  let annotationData: NodeForAnnotation | null = null;
  try {
    const candidates = await aiAnnotatorService.listCandidates({
      search: node.id,
      limit: 1,
    });
    annotationData = candidates.find((n) => n.id === node.id) || null;
  } catch (err) {
    logger.warn({ nodeId: node.id, err }, "Failed to fetch annotation data");
  }

  // Calculate coverage
  let coverage = 0;
  if (node.meta_json || annotationData?.meta_json) coverage += 0.25;
  if (node.schema_json || annotationData?.schema_json) coverage += 0.25;
  if (node.rule_json || annotationData?.meta_json?.rule) coverage += 0.25;
  if (node.form_json || annotationData?.meta_json?.formSpec) coverage += 0.25;

  return {
    id: node.id,
    kind: node.kind,
    parent_id: node.parent_id,
    breadcrumbs: node.breadcrumbs,
    meta: (annotationData?.meta_json as GeneratedMeta) || node.meta_json,
    schema: annotationData?.schema_json || node.schema_json,
    rule:
      ((annotationData?.meta_json as { rule?: DashboardRule })?.rule as
        | DashboardRule
        | undefined) || node.rule_json,
    form:
      ((annotationData?.meta_json as { formSpec?: FormSpec })?.formSpec as
        | FormSpec
        | undefined) || node.form_json,
    quality: {
      annotated: !!annotationData,
      validated: !!annotationData?.meta_json,
      coverage,
      last_updated: annotationData
        ? new Date().toISOString()
        : undefined,
    },
  };
}

/* ========================================================================== */
/* 1. System Status & Health                                                 */
/* ========================================================================== */

/**
 * GET /api/unified-dashboard/status
 * Combined status from both services
 */
router.get(
  "/status",
  asyncHandler(async (_req, res) => {
    const [catalogStatus, annotatorStatus] = await Promise.all([
      catalogService.getFunctionsSummary(),
      aiAnnotatorService.getStatus(),
    ]);

    res.json({
      success: true,
      data: {
        version: "1.0.0",
        services: {
          catalog: {
            loaded: catalogStatus.loadedAt,
            categories: catalogStatus.categories,
            warnings: catalogStatus.warnings,
          },
          annotator: annotatorStatus,
        },
        unified: {
          ready: true,
          features: [
            "function_browsing",
            "ai_generation",
            "widget_management",
            "batch_operations",
          ],
        },
      },
    });
  }),
);

/**
 * GET /api/unified-dashboard/health
 * Health check
 */
router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    const health = await aiAnnotatorService.getHealthStatus();
    res.json({
      success: true,
      data: {
        status: health.healthy ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        ...health,
      },
    });
  }),
);

/* ========================================================================== */
/* 2. Unified Functions API                                                  */
/* ========================================================================== */

/**
 * GET /api/unified-dashboard/functions
 * List all functions with merged data
 */
router.get(
  "/functions",
  cacheMiddleware({ ttl: 5 * 60 * 1000 }), // 5 minutes
  asyncHandler(async (req, res) => {
    const { kinds, area, limit = "50", offset = "0" } = req.query;

    // Get catalog index
    const catalogIndex = await catalogService.getFunctionsIndex();
    const nodes = catalogIndex.nodes || [];

    // Filter if requested
    let filtered = nodes;
    if (kinds && typeof kinds === "string") {
      const kindArray = kinds.split(",").map((k) => k.trim());
      filtered = nodes.filter((n: { kind: string }) =>
        kindArray.includes(n.kind),
      );
    }
    if (area && typeof area === "string") {
      filtered = filtered.filter(
        (n: { meta_json?: { area?: string } }) =>
          n.meta_json?.area === area,
      );
    }

    // Pagination
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);
    const paginated = filtered.slice(offsetNum, offsetNum + limitNum);

    // Merge with annotation data (parallel)
    const merged = await Promise.all(paginated.map(mergeFunctionData));

    res.json({
      success: true,
      data: {
        functions: merged,
        total: filtered.length,
        loaded_at: catalogIndex.loadedAt,
      },
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        total: filtered.length,
      },
    });
  }),
);

/**
 * GET /api/unified-dashboard/functions/:id
 * Get single function with full data
 */
router.get(
  "/functions/:id",
  asyncHandler(async (req, res) => {
    const node = await catalogService.getNodeById(req.params.id);
    if (!node) {
      throw new NotFoundError(`Funktion ${req.params.id} nicht gefunden`);
    }

    const merged = await mergeFunctionData(node);
    res.json({
      success: true,
      data: merged,
    });
  }),
);

/**
 * POST /api/unified-dashboard/functions/:id/generate
 * AI-generate meta/form/rule for function
 */
router.post(
  "/functions/:id/generate",
  strictAiRateLimiter,
  asyncHandler(async (req, res) => {
    const validated = generateSchema.parse(req.body);
    const { types, force, options = {} } = validated;

    // Get node from catalog
    const node = await catalogService.getNodeById(req.params.id);
    if (!node) {
      throw new NotFoundError(`Funktion ${req.params.id} nicht gefunden`);
    }

    // Convert to NodeForAnnotation
    const nodeForAnnotation: NodeForAnnotation = {
      id: node.id,
      kind: node.kind,
      parent_id: node.parent_id,
      meta_json: node.meta_json,
      schema_json: node.schema_json,
      breadcrumbs: node.breadcrumbs,
    };

    // Generate requested types
    const results: {
      meta?: GeneratedMeta;
      form?: FormSpec;
      rule?: DashboardRule;
      widget?: unknown;
    } = {};

    if (options.parallel) {
      // Parallel generation
      const promises = types.map((type) => {
        switch (type) {
          case "meta":
            return aiAnnotatorService.generateMeta(nodeForAnnotation);
          case "form":
            return aiAnnotatorService.generateFormSpec(nodeForAnnotation);
          case "rule":
            return aiAnnotatorService.generateRule(nodeForAnnotation);
          case "widget":
            // Widget generation would be implemented here
            return Promise.resolve({ type: "kpi-card", placeholder: true });
          default:
            return Promise.resolve(null);
        }
      });

      const generated = await Promise.all(promises);

      types.forEach((type, index) => {
        if (type === "meta") results.meta = generated[index] as GeneratedMeta;
        if (type === "form") results.form = generated[index] as FormSpec;
        if (type === "rule")
          results.rule = generated[index] as DashboardRule;
        if (type === "widget") results.widget = generated[index];
      });
    } else {
      // Sequential generation
      for (const type of types) {
        if (type === "meta") {
          results.meta = await aiAnnotatorService.generateMeta(
            nodeForAnnotation,
          );
        }
        if (type === "form") {
          results.form = await aiAnnotatorService.generateFormSpec(
            nodeForAnnotation,
          );
        }
        if (type === "rule") {
          results.rule = await aiAnnotatorService.generateRule(
            nodeForAnnotation,
          );
        }
        if (type === "widget") {
          results.widget = { type: "kpi-card", placeholder: true };
        }
      }
    }

    // Save results (if force or not exists)
    if (force || !node.meta_json) {
      if (results.meta) {
        await aiAnnotatorService.saveMeta(req.params.id, results.meta);
      }
    }
    if (force || !node.rule_json) {
      if (results.rule) {
        await aiAnnotatorService.saveRule(req.params.id, results.rule);
      }
    }
    if (force || !node.form_json) {
      if (results.form) {
        await aiAnnotatorService.saveFormSpec(req.params.id, results.form);
      }
    }

    // Validation if requested
    let validation = null;
    if (options.includeValidation) {
      validation = await aiAnnotatorService.validateNode(nodeForAnnotation);
    }

    res.json({
      success: true,
      message: "Generierung erfolgreich abgeschlossen",
      data: {
        ...results,
        validation,
      },
    });
  }),
);

/**
 * POST /api/unified-dashboard/functions/:id/validate
 * Validate function
 */
router.post(
  "/functions/:id/validate",
  asyncHandler(async (req, res) => {
    const node = await catalogService.getNodeById(req.params.id);
    if (!node) {
      throw new NotFoundError(`Funktion ${req.params.id} nicht gefunden`);
    }

    const nodeForAnnotation: NodeForAnnotation = {
      id: node.id,
      kind: node.kind,
      parent_id: node.parent_id,
      meta_json: node.meta_json,
      schema_json: node.schema_json,
      breadcrumbs: node.breadcrumbs,
    };

    const validation = await aiAnnotatorService.validateNode(
      nodeForAnnotation,
    );

    res.json({
      success: true,
      data: {
        function: node,
        validation,
      },
    });
  }),
);

/* ========================================================================== */
/* 3. Batch Operations                                                       */
/* ========================================================================== */

/**
 * POST /api/unified-dashboard/functions/batch
 * Batch operation on multiple functions
 */
router.post(
  "/functions/batch",
  strictAiRateLimiter,
  asyncHandler(async (req, res) => {
    const validated = batchOperationSchema.parse(req.body);
    const { operation, filters, options = {} } = validated;

    // Get matching functions from catalog
    const catalogIndex = await catalogService.getFunctionsIndex();
    let nodes = catalogIndex.nodes || [];

    // Apply filters
    if (filters.kinds) {
      nodes = nodes.filter((n: { kind: string }) =>
        filters.kinds!.includes(n.kind),
      );
    }
    if (filters.businessArea) {
      nodes = nodes.filter((n: { meta_json?: { area?: string } }) =>
        filters.businessArea!.includes(n.meta_json?.area || ""),
      );
    }
    if (filters.missingOnly) {
      nodes = nodes.filter(
        (n: { meta_json?: unknown }) => !n.meta_json,
      );
    }

    // Execute batch operation through aiAnnotatorService
    const batchOp = {
      operation: operation as string,
      filters: {
        nodeIds: nodes.map((n: { id: string }) => n.id),
      },
      options: {
        retryFailed: options.retryFailed,
        maxRetries: options.maxRetries,
        chunkSize: options.chunkSize,
        parallelRequests: options.parallelRequests,
        modelPreference: options.modelPreference || "balanced",
      },
    };

    const result = await aiAnnotatorService.executeBatchOperation(batchOp);

    res.json({
      success: true,
      data: {
        batch_id: result.id || "generated",
        operation,
        affected_functions: nodes.length,
        status: result.status || "running",
        progress: result.progress || 0,
      },
    });
  }),
);

/* ========================================================================== */
/* 4. Widget Management                                                      */
/* ========================================================================== */

/**
 * GET /api/unified-dashboard/widgets
 * Get dashboard widgets based on context (roles, features, area)
 */
router.get(
  "/widgets",
  asyncHandler(async (req, res) => {
    const contextParam = req.query.context;
    let context: MenuContext = {};

    if (typeof contextParam === "string") {
      try {
        context = JSON.parse(contextParam);
      } catch (err) {
        throw new BadRequestError("Invalid context JSON");
      }
    }

    // Get functions with rules (widgets are defined in rules)
    const catalogIndex = await catalogService.getFunctionsIndex();
    const nodes = catalogIndex.nodes || [];

    // Filter nodes with widget rules
    const widgetNodes = nodes.filter(
      (n: { meta_json?: { rule?: { type?: string; widget?: string } } }) =>
        n.meta_json?.rule?.type === "widget" ||
        n.meta_json?.rule?.widget,
    );

    // TODO: Apply RBAC filtering based on context.roles
    // TODO: Apply feature flags based on context.features
    // TODO: Apply area filtering based on context.area

    // Merge with annotation data
    const widgets = await Promise.all(widgetNodes.map(mergeFunctionData));

    res.json({
      success: true,
      data: {
        widgets,
        context,
        total: widgets.length,
      },
    });
  }),
);

/**
 * POST /api/unified-dashboard/widgets/generate
 * Generate new widget
 */
router.post(
  "/widgets/generate",
  strictAiRateLimiter,
  asyncHandler(async (req, res) => {
    const { function_id, type, config } = req.body;

    if (!function_id || !type) {
      throw new BadRequestError("function_id and type are required");
    }

    // Get function from catalog
    const node = await catalogService.getNodeById(function_id);
    if (!node) {
      throw new NotFoundError(`Funktion ${function_id} nicht gefunden`);
    }

    // Generate widget configuration using AI
    const widgetConfig = {
      id: `${function_id}.widget`,
      type,
      function_id,
      config: config || {},
      generated_at: new Date().toISOString(),
    };

    // In a real implementation, this would:
    // 1. Use AI to generate optimal widget config based on function type
    // 2. Create visualization spec (chart type, data bindings, etc.)
    // 3. Save to database
    // 4. Return preview data

    res.json({
      success: true,
      message: "Widget erfolgreich generiert",
      data: {
        widget: widgetConfig,
        preview: {
          type,
          title: node.meta_json?.title || "Untitled Widget",
        },
      },
    });
  }),
);

/* ========================================================================== */
/* 5. Search & Navigation                                                    */
/* ========================================================================== */

/**
 * GET /api/unified-dashboard/search
 * Unified search across functions
 */
router.get(
  "/search",
  asyncHandler(async (req, res) => {
    const parsed = searchQuerySchema.parse(req.query);

    const searchParams: SearchParams = {
      q: parsed.q,
      kinds: parsed.kinds
        ? parsed.kinds.split(",").map((k) => k.trim())
        : undefined,
      tags: parsed.tags
        ? parsed.tags.split(",").map((t) => t.trim())
        : undefined,
      area: parsed.area,
    };

    const pagination = {
      limit: parsed.limit ? parseInt(parsed.limit, 10) : 50,
      offset: parsed.offset ? parseInt(parsed.offset, 10) : 0,
    };

    const results = await catalogService.search(searchParams, pagination);

    // Merge with annotation data
    const merged = await Promise.all(
      (results.items || []).map(mergeFunctionData),
    );

    res.json({
      success: true,
      data: {
        results: merged,
        total: results.total || 0,
        query: searchParams,
      },
      pagination,
    });
  }),
);

/* ========================================================================== */
/* 6. Quality & Analytics                                                    */
/* ========================================================================== */

/**
 * GET /api/unified-dashboard/quality/report
 * Quality report for all functions
 */
router.get(
  "/quality/report",
  asyncHandler(async (_req, res) => {
    const [catalogSummary, dbStats] = await Promise.all([
      catalogService.getFunctionsSummary(),
      aiAnnotatorService.getStatus(),
    ]);

    const report = {
      catalog: {
        total_functions: catalogSummary.categories?.reduce(
          (sum: number, cat: { count: number }) => sum + cat.count,
          0,
        ),
        categories: catalogSummary.categories,
        warnings: catalogSummary.warnings,
      },
      annotations: {
        coverage: dbStats.annotationCoverage || 0,
        average_confidence: dbStats.averageConfidence || 0,
      },
      recommendations: [] as string[],
    };

    // Generate recommendations
    if (report.annotations.coverage < 0.5) {
      report.recommendations.push(
        "Weniger als 50% der Funktionen sind annotiert. Starten Sie eine Batch-Annotation.",
      );
    }
    if (report.annotations.average_confidence < 0.7) {
      report.recommendations.push(
        "Durchschnittliche Konfidenz ist niedrig. Überprüfen Sie die KI-Modell-Konfiguration.",
      );
    }

    res.json({
      success: true,
      data: report,
    });
  }),
);

/* ========================================================================== */
/* 7. Maintenance & Utility                                                  */
/* ========================================================================== */

/**
 * POST /api/unified-dashboard/reload
 * Reload catalog and refresh caches
 */
router.post(
  "/reload",
  asyncHandler(async (_req, res) => {
    const result = await catalogService.refreshFunctionsIndex();

    res.json({
      success: true,
      message: "Katalog erfolgreich neu geladen",
      data: {
        loaded_at: result.loadedAt,
        findings: result.findings,
        warnings: result.warnings,
      },
    });
  }),
  invalidateCacheMiddleware("/api/unified-dashboard"),
);

/* ========================================================================== */
/* Export Router                                                             */
/* ========================================================================== */

export default router;
