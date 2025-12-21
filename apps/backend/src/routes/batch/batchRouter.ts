// SPDX-License-Identifier: MIT
// apps/backend/src/routes/batch/batchRouter.ts

/**
 * Batch Processing Router
 *
 * Provides REST API for batch operation management, including creation,
 * monitoring, cancellation, and visualization of batch processing jobs.
 *
 * @remarks
 * This router provides:
 * - Batch creation and submission
 * - Real-time progress monitoring
 * - Batch history and filtering
 * - Result visualization and analytics
 * - Batch cancellation
 * - Cleanup operations
 *
 * Features:
 * - WebSocket integration for live updates
 * - Comprehensive filtering and pagination
 * - Performance metrics and analytics
 * - Error tracking and reporting
 * - Quality score analysis
 *
 * Endpoints:
 * - POST   /api/batch/create       - Create new batch operation
 * - GET    /api/batch/:id          - Get batch status and details
 * - GET    /api/batch/:id/results  - Get batch results with summary
 * - GET    /api/batch/:id/viz      - Get visualization data
 * - GET    /api/batch/history      - Get batch history with filters
 * - POST   /api/batch/:id/cancel   - Cancel running batch
 * - DELETE /api/batch/cleanup      - Clean up old batches
 *
 * @module routes/batch
 *
 * @example
 * ```typescript
 * // Create annotation batch
 * POST /api/batch/create
 * {
 *   "operation": "annotate",
 *   "filters": { "status": "pending", "category": "invoice" },
 *   "options": { "model": "gpt-4", "batchSize": 50 },
 *   "name": "Invoice annotation batch"
 * }
 *
 * // Monitor progress
 * GET /api/batch/:id
 *
 * // Get results
 * GET /api/batch/:id/results
 * ```
 */

import { Router } from "express";
import { z } from "zod";
import { batchProcessingService } from "./batchProcessingService.js";
import { createLogger } from "../../utils/logger.js";
import type { Request, Response } from "express";
import type { ZodIssue } from "zod";
import type { BatchOperation, BatchHistoryFilter } from "./types.js";

/**
 * Custom error for bad requests
 */
class BadRequestError extends Error {
  constructor(
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "BadRequestError";
  }
}

const router = Router();
const logger = createLogger("batch-router");

/**
 * Helper to format Zod validation errors
 */
function formatValidationErrors(issues: ZodIssue[]): Record<string, unknown> {
  return {
    errors: issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    })),
  };
}

/**
 * Validation schemas
 */

const batchCreationSchema = z.object({
  operation: z.enum([
    "annotate",
    "import",
    "export",
    "transform",
    "report",
    "validate",
    "cleanup",
  ]),
  filters: z.record(z.string(), z.unknown()),
  options: z.record(z.string(), z.unknown()).optional(),
  name: z.string().optional(),
  description: z.string().optional(),
});

const batchHistorySchema = z.object({
  operation: z
    .enum([
      "annotate",
      "import",
      "export",
      "transform",
      "report",
      "validate",
      "cleanup",
    ])
    .optional(),
  status: z
    .enum(["pending", "running", "completed", "failed", "cancelled"])
    .optional(),
  createdAfter: z.string().optional(),
  createdBefore: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

const cleanupSchema = z.object({
  daysToKeep: z.number().min(1).max(365).optional(),
});

/**
 * POST /api/batch/create
 *
 * Creates a new batch operation
 *
 * @access Private (requires authentication)
 *
 * @example
 * POST /api/batch/create
 * {
 *   "operation": "annotate",
 *   "filters": { "annotation_status": "pending" },
 *   "options": { "model": "gpt-4", "batchSize": 50 },
 *   "name": "Monthly annotation batch"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "batch": {
 *     "id": "batch_1234567890_abc123",
 *     "operation": "annotate",
 *     "status": "pending",
 *     "progress": 0,
 *     "created_at": "2025-12-20T10:00:00.000Z"
 *   }
 * }
 */
router.post("/create", async (req: Request, res: Response) => {
  try {
    const validationResult = batchCreationSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new BadRequestError(
        "Invalid batch creation data",
        formatValidationErrors(validationResult.error.issues),
      );
    }

    const batch = batchProcessingService.createBatch(validationResult.data);

    logger.info(
      { batchId: batch.id, operation: batch.operation },
      "Batch created",
    );

    res.status(201).json({
      success: true,
      batch,
    });
  } catch (error) {
    logger.error({ error }, "Failed to create batch");
    throw error;
  }
});

/**
 * GET /api/batch/:id
 *
 * Retrieves batch operation status and details
 *
 * @access Private
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const batch = batchProcessingService.getBatch(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: "Batch not found",
      });
    }

    res.json({
      success: true,
      batch,
    });
  } catch (error) {
    logger.error({ error }, "Failed to get batch");
    throw error;
  }
});

/**
 * GET /api/batch/:id/results
 *
 * Retrieves batch operation with complete results and summary
 *
 * @access Private
 */
router.get("/:id/results", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const batchWithResults = batchProcessingService.getBatchWithResults(id);

    if (!batchWithResults) {
      return res.status(404).json({
        success: false,
        error: "Batch not found",
      });
    }

    res.json({
      success: true,
      batch: batchWithResults,
    });
  } catch (error) {
    logger.error({ error }, "Failed to get batch results");
    throw error;
  }
});

/**
 * GET /api/batch/:id/viz
 *
 * Retrieves visualization data for batch operation
 *
 * @access Private
 */
router.get("/:id/viz", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const visualization = batchProcessingService.getBatchVisualization(id);

    if (!visualization) {
      return res.status(404).json({
        success: false,
        error: "Batch not found",
      });
    }

    res.json({
      success: true,
      visualization,
    });
  } catch (error) {
    logger.error({ error }, "Failed to get batch visualization");
    throw error;
  }
});

/**
 * GET /api/batch/history
 *
 * Retrieves batch history with optional filtering
 *
 * @access Private
 *
 * @query operation - Filter by operation type
 * @query status - Filter by batch status
 * @query createdAfter - Filter by creation date (ISO 8601)
 * @query createdBefore - Filter by creation date (ISO 8601)
 * @query limit - Max results (default: 50, max: 100)
 * @query offset - Pagination offset (default: 0)
 *
 * @example
 * GET /api/batch/history?status=completed&limit=20
 */
router.get("/history", async (req: Request, res: Response) => {
  try {
    const validationResult = batchHistorySchema.safeParse({
      ...req.query,
      limit: req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : undefined,
      offset: req.query.offset
        ? parseInt(req.query.offset as string, 10)
        : undefined,
    });

    if (!validationResult.success) {
      throw new BadRequestError(
        "Invalid query parameters",
        formatValidationErrors(validationResult.error.issues),
      );
    }

    const batches = batchProcessingService.getBatchHistory(
      validationResult.data as BatchHistoryFilter,
    );

    res.json({
      success: true,
      batches,
      count: batches.length,
      filter: validationResult.data,
    });
  } catch (error) {
    logger.error({ error }, "Failed to get batch history");
    throw error;
  }
});

/**
 * POST /api/batch/:id/cancel
 *
 * Cancels a running batch operation
 *
 * @access Private
 */
router.post("/:id/cancel", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const success = batchProcessingService.cancelBatch(id);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: "Batch cannot be cancelled (not found or already completed)",
      });
    }

    logger.info({ batchId: id }, "Batch cancelled");

    res.json({
      success: true,
      message: "Batch cancelled successfully",
    });
  } catch (error) {
    logger.error({ error }, "Failed to cancel batch");
    throw error;
  }
});

/**
 * DELETE /api/batch/cleanup
 *
 * Cleans up old batch operations and their results
 *
 * @access Admin
 *
 * @body daysToKeep - Number of days to keep (default: 30)
 *
 * @example
 * DELETE /api/batch/cleanup
 * { "daysToKeep": 60 }
 */
router.delete("/cleanup", async (req: Request, res: Response) => {
  try {
    const validationResult = cleanupSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new BadRequestError(
        "Invalid cleanup parameters",
        formatValidationErrors(validationResult.error.issues),
      );
    }

    const daysToKeep = validationResult.data.daysToKeep || 30;
    const deleted = batchProcessingService.cleanupOldBatches(daysToKeep);

    logger.info({ deleted, daysToKeep }, "Batch cleanup completed");

    res.json({
      success: true,
      deleted,
      daysToKeep,
    });
  } catch (error) {
    logger.error({ error }, "Failed to cleanup batches");
    throw error;
  }
});

/**
 * GET /api/batch/stats
 *
 * Retrieves overall batch processing statistics
 *
 * @access Private
 */
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    // Get all batches and calculate statistics
    const allBatches = batchProcessingService.getBatchHistory({ limit: 1000 });

    const stats = {
      total: allBatches.length,
      byStatus: {
        pending: allBatches.filter(
          (b: BatchOperation) => b.status === "pending",
        ).length,
        running: allBatches.filter(
          (b: BatchOperation) => b.status === "running",
        ).length,
        completed: allBatches.filter(
          (b: BatchOperation) => b.status === "completed",
        ).length,
        failed: allBatches.filter((b: BatchOperation) => b.status === "failed")
          .length,
        cancelled: allBatches.filter(
          (b: BatchOperation) => b.status === "cancelled",
        ).length,
      },
      byOperation: allBatches.reduce(
        (acc: Record<string, number>, batch: BatchOperation) => {
          acc[batch.operation] = (acc[batch.operation] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      completionRate:
        allBatches.length > 0
          ? allBatches.filter((b: BatchOperation) => b.status === "completed")
              .length / allBatches.length
          : 0,
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error({ error }, "Failed to get batch stats");
    throw error;
  }
});

export default router;
