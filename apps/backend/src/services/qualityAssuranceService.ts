// SPDX-License-Identifier: MIT
// apps/backend/src/services/qualityAssuranceService.ts

/**
 * Quality Assurance Service
 * Provides functionality for annotation quality metrics and manual reviews
 */

export interface QAReview {
  id: string;
  nodeId: string;
  reviewer?: string;
  reviewStatus: "pending" | "approved" | "rejected" | "needs_revision";
  qualityScore?: number;
  reviewComments?: string;
  metrics?: QualityMetrics;
  createdAt: string;
  reviewedAt?: string;
}

export interface QualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  confidence: number;
  metaQuality: {
    hasDescription: boolean;
    descriptionLength: number;
    tagCount: number;
    hasBusinessArea: boolean;
    hasPiiClass: boolean;
  };
  schemaQuality?: {
    hasSchema: boolean;
    fieldCount: number;
    requiredFields: number;
    validationRules: number;
  };
  overallScore: number;
}

export interface QualityTrend {
  timestamp: string;
  metricType: string;
  metricValue: number;
  nodeCount: number;
  batchId?: string;
}

export interface QualityDashboardData {
  summary: {
    totalReviews: number;
    pendingReviews: number;
    approvedReviews: number;
    rejectedReviews: number;
    averageQualityScore: number;
    averageReviewTime: number;
  };
  recentReviews: QAReview[];
  qualityTrends: QualityTrend[];
  topIssues: Array<{ issue: string; count: number }>;
}

export class QualityAssuranceService {
  private reviews: Map<string, QAReview> = new Map();

  createReview(review: Omit<QAReview, "id" | "createdAt">): QAReview {
    const id = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const qaReview: QAReview = {
      id,
      ...review,
      createdAt: new Date().toISOString(),
    };
    this.reviews.set(id, qaReview);
    return qaReview;
  }

  getReview(id: string): QAReview | null {
    return this.reviews.get(id) || null;
  }

  getReviewsByNode(nodeId: string): QAReview[] {
    return Array.from(this.reviews.values())
      .filter(r => r.nodeId === nodeId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getReviewsByStatus(status: string, limit = 50, offset = 0): QAReview[] {
    const filtered = Array.from(this.reviews.values())
      .filter(r => r.reviewStatus === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    
    return filtered.slice(offset, offset + limit);
  }

  updateReview(
    id: string,
    updates: Partial<Omit<QAReview, "id" | "nodeId" | "createdAt">>
  ): QAReview | null {
    const existing = this.reviews.get(id);
    if (!existing) return null;

    const updated: QAReview = {
      ...existing,
      ...updates,
      id: existing.id,
      nodeId: existing.nodeId,
      createdAt: existing.createdAt,
    };

    if (existing.reviewStatus === "pending" && updates.reviewStatus !== "pending") {
      updated.reviewedAt = new Date().toISOString();
    }

    this.reviews.set(id, updated);
    return updated;
  }

  calculateQualityMetrics(node: any): QualityMetrics {
    const meta = node.meta_json || {};
    const schema = node.schema_json || {};

    const hasDescription = !!meta.description && meta.description.length > 0;
    const descriptionLength = meta.description?.length || 0;
    const tagCount = meta.tags?.length || 0;
    const hasBusinessArea = !!meta.businessArea;
    const hasPiiClass = !!meta.piiClass;

    const metaQuality = {
      hasDescription,
      descriptionLength,
      tagCount,
      hasBusinessArea,
      hasPiiClass,
    };

    const hasSchema = !!schema && Object.keys(schema).length > 0;
    const schemaQuality = {
      hasSchema,
      fieldCount: schema.fields?.length || 0,
      requiredFields: schema.fields?.filter((f: any) => f.required)?.length || 0,
      validationRules: schema.fields?.filter((f: any) => f.validation)?.length || 0,
    };

    const completeness = (
      (hasDescription ? 0.3 : 0) +
      (tagCount > 0 ? 0.2 : 0) +
      (hasBusinessArea ? 0.2 : 0) +
      (hasPiiClass ? 0.15 : 0) +
      (hasSchema ? 0.15 : 0)
    );

    return {
      completeness,
      accuracy: meta.quality?.confidence || 0.5,
      consistency: 0.7,
      confidence: meta.quality?.confidence || 0.5,
      metaQuality,
      schemaQuality,
      overallScore: Math.round(completeness * 100),
    };
  }

  getDashboardData(): QualityDashboardData {
    const allReviews = Array.from(this.reviews.values());
    
    return {
      summary: {
        totalReviews: allReviews.length,
        pendingReviews: allReviews.filter(r => r.reviewStatus === "pending").length,
        approvedReviews: allReviews.filter(r => r.reviewStatus === "approved").length,
        rejectedReviews: allReviews.filter(r => r.reviewStatus === "rejected").length,
        averageQualityScore: 0,
        averageReviewTime: 0,
      },
      recentReviews: allReviews.slice(0, 10),
      qualityTrends: [],
      topIssues: [],
    };
  }

  recordMetrics(
    metricType: string,
    metricValue: number,
    nodeCount: number,
    batchId?: string
  ): void {
    // Stub implementation
    console.log(`Recording metric: ${metricType} = ${metricValue} (${nodeCount} nodes)`);
  }

  getQualityTrends(metricType?: string, days = 30): QualityTrend[] {
    return [];
  }
}

export const qualityAssuranceService = new QualityAssuranceService();
