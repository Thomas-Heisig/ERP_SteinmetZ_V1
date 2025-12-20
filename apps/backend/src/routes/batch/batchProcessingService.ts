// SPDX-License-Identifier: MIT
// apps/backend/src/routes/batch/batchProcessingService.ts

/**
 * Enhanced Batch Processing Service
 *
 * Provides comprehensive batch processing capabilities including:
 * - Batch operation creation and management
 * - Real-time progress tracking via WebSocket
 * - Result visualization and analytics
 * - Batch history and filtering
 *
 * @remarks
 * This service is designed for large-scale operations that need to process
 * multiple items asynchronously. It integrates with the WebSocket service
 * to provide real-time progress updates to connected clients.
 *
 * Supported operations include:
 * - AI annotation batches
 * - Data import/export batches
 * - Bulk data transformations
 * - Report generation batches
 *
 * @example
 * ```typescript
 * const batchService = new BatchProcessingService();
 *
 * // Create a new batch
 * const batch = batchService.createBatch({
 *   operation: 'annotate',
 *   filters: { status: 'pending' },
 *   options: { model: 'gpt-4' },
 *   name: 'Monthly annotation batch'
 * });
 *
 * // Get batch history
 * const history = batchService.getBatchHistory({
 *   status: 'completed',
 *   limit: 10
 * });
 *
 * // Get visualization data
 * const viz = batchService.getBatchVisualization(batch.id);
 * ```
 */

import { websocketService } from "../other/websocketService.js";
import type {
  BatchOperation,
  BatchCreationRequest,
  BatchWithResults,
  BatchHistoryFilter,
  BatchVisualizationData,
  BatchItemResult,
  BatchResultSummary,
} from "./types.js";

export class BatchProcessingService {
  private batches: Map<string, BatchOperation> = new Map();
  private results: Map<string, BatchItemResult[]> = new Map();

  /**
   * Creates a new batch operation
   */
  createBatch(request: BatchCreationRequest): BatchOperation {
    const id = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date().toISOString();

    const batch: BatchOperation = {
      id,
      operation: request.operation,
      filters: request.filters,
      options: request.options,
      status: "pending",
      progress: 0,
      created_at: now,
      name: request.name,
      description: request.description,
    };

    this.batches.set(id, batch);
    websocketService.broadcast("batch:created", batch);

    return batch;
  }

  /**
   * Retrieves a batch operation by ID
   */
  getBatch(id: string): BatchOperation | null {
    return this.batches.get(id) || null;
  }

  /**
   * Retrieves a batch operation with its complete results
   */
  getBatchWithResults(id: string): BatchWithResults | null {
    const batch = this.batches.get(id);
    if (!batch) return null;

    const results = this.results.get(id) || [];
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    const durations = results.filter((r) => r.durationMs !== undefined).map((r) => r.durationMs as number);
    const avgDuration = durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;

    const qualityScores = results.filter((r) => r.qualityScore !== undefined).map((r) => r.qualityScore as number);
    const avgQuality = qualityScores.length > 0 ? qualityScores.reduce((sum, q) => sum + q, 0) / qualityScores.length : 0;

    const summary: BatchResultSummary = {
      total: results.length,
      successful,
      failed,
      qualityScore: avgQuality,
      performanceMetrics: {
        averageDuration: avgDuration,
        totalDuration: durations.reduce((sum, d) => sum + d, 0),
        requestsPerMinute: durations.length > 0 ? (60000 / avgDuration) * durations.length : 0,
      },
    };

    return { ...batch, results, summary };
  }

  /**
   * Updates batch progress and status
   */
  updateBatchProgress(id: string, progress: number, status?: BatchOperation["status"]): void {
    const batch = this.batches.get(id);
    if (!batch) return;

    batch.progress = progress;

    if (status) {
      batch.status = status;

      if (status === "running" && !batch.started_at) {
        batch.started_at = new Date().toISOString();
      }

      if (status === "completed" || status === "failed" || status === "cancelled") {
        batch.completed_at = new Date().toISOString();
      }
    }

    this.batches.set(id, batch);
    websocketService.broadcast("batch:progress", {
      batchId: id,
      progress,
      status,
    });
  }

  /**
   * Records the result of processing a single item in a batch
   */
  recordResult(
    batchId: string,
    nodeId: string,
    success: boolean,
    result?: Record<string, unknown>,
    error?: string,
    retries = 0,
    durationMs?: number,
    qualityScore?: number,
  ): void {
    const results = this.results.get(batchId) || [];

    const itemResult: BatchItemResult = {
      nodeId,
      success,
      result,
      error,
      retries,
      durationMs,
      qualityScore,
      createdAt: new Date().toISOString(),
    };

    results.push(itemResult);
    this.results.set(batchId, results);

    const batch = this.batches.get(batchId);
    if (batch && batch.total_items) {
      const processed = results.length;
      const progress = Math.round((processed / batch.total_items) * 100);
      this.updateBatchProgress(batchId, progress);
    }
  }

  /**
   * Retrieves batch history with filtering and pagination
   */
  getBatchHistory(filter: BatchHistoryFilter = {}): BatchOperation[] {
    let batches = Array.from(this.batches.values());

    if (filter.operation) {
      batches = batches.filter((b) => b.operation === filter.operation);
    }

    if (filter.status) {
      batches = batches.filter((b) => b.status === filter.status);
    }

    if (filter.createdAfter) {
      const afterDate = filter.createdAfter;
      batches = batches.filter((b) => b.created_at && b.created_at >= afterDate);
    }

    if (filter.createdBefore) {
      const beforeDate = filter.createdBefore;
      batches = batches.filter((b) => b.created_at && b.created_at <= beforeDate);
    }

    batches.sort((a, b) => {
      const aDate = a.created_at || "";
      const bDate = b.created_at || "";
      return bDate.localeCompare(aDate);
    });

    const limit = filter.limit || 50;
    const offset = filter.offset || 0;

    return batches.slice(offset, offset + limit);
  }

  /**
   * Generates visualization data for a batch
   */
  getBatchVisualization(batchId: string): BatchVisualizationData | null {
    const batch = this.batches.get(batchId);
    if (!batch) return null;

    const results = this.results.get(batchId) || [];
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    const durations = results.filter((r) => r.durationMs !== undefined).map((r) => r.durationMs as number).sort((a, b) => a - b);
    const avgDuration = durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;

    const p50 = durations.length > 0 ? durations[Math.floor(durations.length * 0.5)] : 0;
    const p95 = durations.length > 0 ? durations[Math.floor(durations.length * 0.95)] : 0;
    const p99 = durations.length > 0 ? durations[Math.floor(durations.length * 0.99)] : 0;

    const errorCounts: Record<string, number> = {};
    results.forEach((r) => {
      if (!r.success && r.error) {
        errorCounts[r.error] = (errorCounts[r.error] || 0) + 1;
      }
    });

    const errorDistribution = Object.entries(errorCounts).map(([error, count]) => ({
      error,
      count,
      percentage: failed > 0 ? (count / failed) * 100 : 0,
    }));

    const qualityRanges: Record<string, number> = {
      "0.0-0.2": 0,
      "0.2-0.4": 0,
      "0.4-0.6": 0,
      "0.6-0.8": 0,
      "0.8-1.0": 0,
    };

    results.forEach((r) => {
      if (r.qualityScore !== undefined) {
        if (r.qualityScore <= 0.2) qualityRanges["0.0-0.2"]++;
        else if (r.qualityScore <= 0.4) qualityRanges["0.2-0.4"]++;
        else if (r.qualityScore <= 0.6) qualityRanges["0.4-0.6"]++;
        else if (r.qualityScore <= 0.8) qualityRanges["0.6-0.8"]++;
        else qualityRanges["0.8-1.0"]++;
      }
    });

    const qualityDistribution = Object.entries(qualityRanges).map(([range, count]) => ({
      range,
      count,
      percentage: results.length > 0 ? (count / results.length) * 100 : 0,
    }));

    return {
      batchId,
      overview: {
        total: results.length,
        successful,
        failed,
        pending: (batch.total_items || 0) - results.length,
        successRate: results.length > 0 ? successful / results.length : 0,
        averageDuration: avgDuration,
      },
      timeline: [],
      errorDistribution,
      qualityDistribution,
      performanceMetrics: {
        averageDuration: avgDuration,
        p50Duration: p50,
        p95Duration: p95,
        p99Duration: p99,
      },
    };
  }

  /**
   * Cancels a running batch operation
   */
  cancelBatch(id: string): boolean {
    const batch = this.batches.get(id);
    if (!batch) return false;

    if (batch.status === "completed" || batch.status === "cancelled") {
      return false;
    }

    this.updateBatchProgress(id, batch.progress || 0, "cancelled");
    websocketService.broadcast("batch:cancelled", { batchId: id });

    return true;
  }

  /**
   * Cleans up old batch operations
   */
  cleanupOldBatches(daysToKeep = 30): number {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();
    let deleted = 0;

    for (const [id, batch] of this.batches.entries()) {
      if (batch.created_at && batch.created_at < cutoffDate) {
        this.batches.delete(id);
        this.results.delete(id);
        deleted++;
      }
    }

    return deleted;
  }
}

export const batchProcessingService = new BatchProcessingService();
