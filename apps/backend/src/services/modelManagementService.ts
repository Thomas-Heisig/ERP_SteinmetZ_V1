// SPDX-License-Identifier: MIT
// apps/backend/src/services/modelManagementService.ts

/**
 * AI Model Management Service
 * Provides functionality for model selection, performance comparison, and cost tracking
 */

import { createLogger } from "../utils/logger.js";
import type { ModelConfig, AIProvider } from "./aiAnnotatorService.js";

const logger = createLogger("model-management");

export interface ModelUsageStats {
  modelName: string;
  provider: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokens: number;
  totalCost: number;
  averageDuration: number;
  successRate: number;
}

export interface ModelPerformanceComparison {
  modelName: string;
  provider: string;
  speed: number;
  accuracy: number;
  cost: number;
  reliability: number;
  overallScore: number;
}

export interface CostBreakdown {
  period: "day" | "week" | "month";
  startDate: string;
  endDate: string;
  totalCost: number;
  byModel: Array<{
    modelName: string;
    provider: string;
    cost: number;
    requests: number;
    tokens: number;
  }>;
  byOperation: Array<{
    operationType: string;
    cost: number;
    requests: number;
  }>;
}

export interface ModelAvailability {
  modelName: string;
  provider: string;
  available: boolean;
  lastChecked: string;
  latency?: number;
  error?: string;
}

export class ModelManagementService {
  private stats: Map<string, ModelUsageStats> = new Map();

  recordUsage(
    modelName: string,
    provider: string,
    operationType: string,
    tokensUsed: number,
    cost: number,
    durationMs: number,
    success: boolean,
  ): void {
    const key = `${modelName}-${provider}`;
    const existing = this.stats.get(key) || {
      modelName,
      provider,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageDuration: 0,
      successRate: 0,
    };

    existing.totalRequests++;
    if (success) existing.successfulRequests++;
    else existing.failedRequests++;
    existing.totalTokens += tokensUsed;
    existing.totalCost += cost;
    existing.averageDuration =
      (existing.averageDuration * (existing.totalRequests - 1) + durationMs) /
      existing.totalRequests;
    existing.successRate = existing.successfulRequests / existing.totalRequests;

    this.stats.set(key, existing);
  }

  getModelStats(modelName: string, days = 30): ModelUsageStats | null {
    const entries = Array.from(this.stats.values());
    return entries.find((s) => s.modelName === modelName) || null;
  }

  getAllModelsStats(days = 30): ModelUsageStats[] {
    return Array.from(this.stats.values());
  }

  compareModels(modelNames: string[], days = 30): ModelPerformanceComparison[] {
    return modelNames
      .map((name) => {
        const stats = this.getModelStats(name, days);
        if (!stats) {
          return {
            modelName: name,
            provider: "unknown",
            speed: 0,
            accuracy: 0,
            cost: 0,
            reliability: 0,
            overallScore: 0,
          };
        }

        const normalizedSpeed = Math.max(0, 1 - stats.averageDuration / 10000);
        const normalizedCost = Math.max(0, 1 - stats.totalCost / 100);

        return {
          modelName: stats.modelName,
          provider: stats.provider,
          speed: stats.averageDuration,
          accuracy: stats.successRate,
          cost:
            stats.totalTokens > 0
              ? (stats.totalCost / stats.totalTokens) * 1000
              : 0,
          reliability: stats.successRate,
          overallScore: Math.round(
            normalizedSpeed * 25 +
              stats.successRate * 35 +
              normalizedCost * 20 +
              stats.successRate * 20,
          ),
        };
      })
      .sort((a, b) => b.overallScore - a.overallScore);
  }

  getCostBreakdown(period: "day" | "week" | "month" = "month"): CostBreakdown {
    const now = new Date();
    const startDate = new Date(now);

    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setDate(now.getDate() - 30);
        break;
    }

    const allStats = Array.from(this.stats.values());
    const totalCost = allStats.reduce((sum, s) => sum + s.totalCost, 0);

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      totalCost,
      byModel: allStats.map((s) => ({
        modelName: s.modelName,
        provider: s.provider,
        cost: s.totalCost,
        requests: s.totalRequests,
        tokens: s.totalTokens,
      })),
      byOperation: [],
    };
  }

  getUsageOverTime(
    days = 30,
    granularity: "hour" | "day" = "day",
  ): Array<{
    timestamp: string;
    requests: number;
    cost: number;
    tokens: number;
  }> {
    return [];
  }

  registerModel(config: ModelConfig): void {
    logger.info(
      { modelName: config.name, provider: config.provider },
      "Registering model",
    );
  }

  getRegisteredModels(): ModelConfig[] {
    return [];
  }

  updateModelAvailability(
    modelName: string,
    available: boolean,
    error?: string,
  ): void {
    logger.info({ modelName, available, error }, "Model availability updated");
  }

  getModelAvailability(): ModelAvailability[] {
    return [];
  }

  getModelRecommendations(
    criteria: {
      prioritize?: "speed" | "accuracy" | "cost" | "balanced";
      maxCost?: number;
      minAccuracy?: number;
    } = {},
  ): ModelPerformanceComparison[] {
    const allModels = Array.from(this.stats.keys());
    let comparisons = this.compareModels(allModels);

    if (criteria.maxCost !== undefined) {
      comparisons = comparisons.filter((c) => c.cost <= criteria.maxCost!);
    }
    if (criteria.minAccuracy !== undefined) {
      comparisons = comparisons.filter(
        (c) => c.accuracy >= criteria.minAccuracy!,
      );
    }

    return comparisons;
  }

  cleanupOldStats(daysToKeep = 90): number {
    // Stub - no cleanup needed for in-memory storage
    return 0;
  }
}

export const modelManagementService = new ModelManagementService();
