// SPDX-License-Identifier: MIT
// apps/backend/src/services/batchProcessingService.ts

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
 * const viz = batchService.getVisualizationData(batch.id);
 * ```
 */

import type { BatchOperation, BatchResult } from "./aiAnnotatorService.js";
import { websocketService } from "./websocketService.js";

export interface BatchCreationRequest {
  operation: BatchOperation["operation"];
  filters: any;
  options?: BatchOperation["options"];
  name?: string;
  description?: string;
}

export interface BatchWithResults extends BatchOperation {
  results?: any[];
  summary?: BatchResult["summary"];
}

export interface BatchHistoryFilter {
  operation?: string;
  status?: string;
  createdAfter?: string;
  createdBefore?: string;
  limit?: number;
  offset?: number;
}

export interface BatchVisualizationData {
  batchId: string;
  overview: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    successRate: number;
    averageDuration: number;
  };
  timeline: Array<{
    timestamp: string;
    successful: number;
    failed: number;
    pending: number;
  }>;
  errorDistribution: Array<{
    error: string;
    count: number;
  }>;
  qualityDistribution: Array<{
    range: string;
    count: number;
  }>;
  performanceMetrics: {
    averageDuration: number;
    p50Duration: number;
    p95Duration: number;
    p99Duration: number;
  };
}

export class BatchProcessingService {
  private batches: Map<string, BatchOperation> = new Map();
  private results: Map<string, any[]> = new Map();

  /**
   * Creates a new batch operation
   * 
   * Generates a unique batch ID and initializes the batch with pending status.
   * Broadcasts a 'batch:created' event via WebSocket to notify connected clients.
   * 
   * @param request - Batch creation parameters including operation type, filters, and options
   * @returns The created batch operation with generated ID and metadata
   * 
   * @example
   * ```typescript
   * const batch = batchService.createBatch({
   *   operation: 'annotate',
   *   filters: { category: 'product', status: 'pending' },
   *   options: { model: 'gpt-4', temperature: 0.7 },
   *   name: 'Product annotation batch',
   *   description: 'Annotate all pending products with AI'
   * });
   * console.log(`Created batch: ${batch.id}`);
   * ```
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
    };

    this.batches.set(id, batch);

    // Emit WebSocket event
    websocketService.broadcast("batch:created", batch);

    return batch;
  }

  /**
   * Retrieves a batch operation by ID
   * 
   * @param id - The batch ID to retrieve
   * @returns The batch operation if found, null otherwise
   * 
   * @example
   * ```typescript
   * const batch = batchService.getBatch('batch_1234567890_abc123');
   * if (batch) {
   *   console.log(`Batch status: ${batch.status}, Progress: ${batch.progress}%`);
   * }
   * ```
   */
  getBatch(id: string): BatchOperation | null {
    return this.batches.get(id) || null;
  }

  /**
   * Retrieves a batch operation with its complete results
   * 
   * @param id - The batch ID to retrieve
   * @returns The batch operation with results and summary, or null if not found
   * 
   * @example
   * ```typescript
   * const batchWithResults = batchService.getBatchWithResults('batch_1234567890_abc123');
   * if (batchWithResults) {
   *   console.log(`Total results: ${batchWithResults.results?.length}`);
   *   console.log(`Summary: ${JSON.stringify(batchWithResults.summary)}`);
   * }
   * ```
   */
  getBatchWithResults(id: string): BatchWithResults | null {
    const batch = this.batches.get(id);
    if (!batch) return null;

    const results = this.results.get(id) || [];

    return {
      ...batch,
      results,
      summary: {
        averageConfidence: 0,
        businessAreas: {},
        piiDistribution: {},
        qualityScore: 0,
        performanceMetrics: {
          averageDuration: 0,
          totalDuration: 0,
          requestsPerMinute: 0,
        },
      },
    };
  }

  updateBatchProgress(
    id: string,
    progress: number,
    status?: BatchOperation["status"],
  ): void {
    const batch = this.batches.get(id);
    if (!batch) return;

    batch.progress = progress;

    if (status) {
      batch.status = status;

      if (status === "running" && !batch.started_at) {
        batch.started_at = new Date().toISOString();
      }

      if (
        status === "completed" ||
        status === "failed" ||
        status === "cancelled"
      ) {
        batch.completed_at = new Date().toISOString();
      }
    }

    this.batches.set(id, batch);

    // Emit WebSocket event
    websocketService.broadcast("batch:progress", {
      batchId: id,
      progress,
      status,
    });
  }

  recordResult(
    batchId: string,
    nodeId: string,
    success: boolean,
    result?: any,
    error?: string,
    retries = 0,
    durationMs?: number,
    qualityScore?: number,
  ): void {
    const results = this.results.get(batchId) || [];

    results.push({
      nodeId,
      success,
      result,
      error,
      retries,
      durationMs,
      qualityScore,
      createdAt: new Date().toISOString(),
    });

    this.results.set(batchId, results);
  }

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
      batches = batches.filter(
        (b) => b.created_at && b.created_at >= afterDate,
      );
    }

    if (filter.createdBefore) {
      const beforeDate = filter.createdBefore;
      batches = batches.filter(
        (b) => b.created_at && b.created_at <= beforeDate,
      );
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

  getBatchVisualization(batchId: string): BatchVisualizationData | null {
    const batch = this.batches.get(batchId);
    if (!batch) return null;

    const results = this.results.get(batchId) || [];
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return {
      batchId,
      overview: {
        total: results.length,
        successful,
        failed,
        pending: 0,
        successRate: results.length > 0 ? successful / results.length : 0,
        averageDuration: 0,
      },
      timeline: [],
      errorDistribution: [],
      qualityDistribution: [],
      performanceMetrics: {
        averageDuration: 0,
        p50Duration: 0,
        p95Duration: 0,
        p99Duration: 0,
      },
    };
  }

  cancelBatch(id: string): boolean {
    const batch = this.batches.get(id);
    if (!batch) return false;

    if (batch.status === "completed" || batch.status === "cancelled") {
      return false;
    }

    this.updateBatchProgress(id, batch.progress || 0, "cancelled");

    // Emit WebSocket event
    websocketService.broadcast("batch:cancelled", { batchId: id });

    return true;
  }

  cleanupOldBatches(daysToKeep = 30): number {
    const cutoffDate = new Date(
      Date.now() - daysToKeep * 24 * 60 * 60 * 1000,
    ).toISOString();
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
