// SPDX-License-Identifier: MIT
// apps/frontend/src/components/QualityDashboard/QADashboard.tsx

import React, { useState, useEffect, useCallback } from "react";
import "./QADashboard.css";

export interface QASummary {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  averageQualityScore: number;
  averageReviewTime: number;
}

export interface QAReview {
  id: string;
  nodeId: string;
  reviewStatus: string;
  qualityScore?: number;
  reviewComments?: string;
  createdAt: string;
  reviewedAt?: string;
}

interface QADashboardProps {
  apiBaseUrl?: string;
}

export const QADashboard: React.FC<QADashboardProps> = ({
  apiBaseUrl = "http://localhost:3000",
}) => {
  const [summary, setSummary] = useState<QASummary | null>(null);
  const [recentReviews, setRecentReviews] = useState<QAReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiBaseUrl}/api/ai-annotator/qa/dashboard`,
      );
      const data = await response.json();

      if (data.success) {
        setSummary(data.data.summary);
        setRecentReviews(data.data.recentReviews);
      }
    } catch (error) {
      console.error("Failed to fetch QA dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusClass = (status: string): string => {
    switch (status) {
      case "approved":
        return "approved";
      case "rejected":
        return "rejected";
      case "needs_revision":
        return "needs_revision";
      default:
        return "pending";
    }
  };

  if (loading) {
    return <div className="qa-dashboard-loading">Loading QA Dashboard...</div>;
  }

  if (!summary) {
    return (
      <div className="qa-dashboard-error">Failed to load dashboard data</div>
    );
  }

  return (
    <div className="qa-dashboard-container">
      <h1 className="qa-dashboard-title">Quality Assurance Dashboard</h1>

      {/* Summary Cards */}
      <div className="qa-dashboard-card-grid">
        <div className="qa-dashboard-card">
          <div className="qa-dashboard-card-title">Total Reviews</div>
          <div className="qa-dashboard-card-value">{summary.totalReviews}</div>
        </div>

        <div className="qa-dashboard-card pending">
          <div className="qa-dashboard-card-title">Pending Reviews</div>
          <div className="qa-dashboard-card-value">
            {summary.pendingReviews}
          </div>
        </div>

        <div className="qa-dashboard-card approved">
          <div className="qa-dashboard-card-title">Approved</div>
          <div className="qa-dashboard-card-value">
            {summary.approvedReviews}
          </div>
        </div>

        <div className="qa-dashboard-card rejected">
          <div className="qa-dashboard-card-title">Rejected</div>
          <div className="qa-dashboard-card-value">
            {summary.rejectedReviews}
          </div>
        </div>

        <div className="qa-dashboard-card">
          <div className="qa-dashboard-card-title">Avg Quality Score</div>
          <div className="qa-dashboard-card-value">
            {summary.averageQualityScore.toFixed(1)}/100
          </div>
        </div>

        <div className="qa-dashboard-card">
          <div className="qa-dashboard-card-title">Avg Review Time</div>
          <div className="qa-dashboard-card-value">
            {Math.round(summary.averageReviewTime)} min
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="qa-dashboard-section">
        <h2 className="qa-dashboard-section-title">Recent Reviews</h2>
        {recentReviews.length === 0 ? (
          <p className="qa-dashboard-empty-state">No reviews yet</p>
        ) : (
          <div className="qa-dashboard-table">
            <div className="qa-dashboard-table-header">
              <div className="qa-dashboard-table-cell">Node ID</div>
              <div className="qa-dashboard-table-cell">Status</div>
              <div className="qa-dashboard-table-cell">Quality Score</div>
              <div className="qa-dashboard-table-cell">Date</div>
            </div>
            {recentReviews.map((review) => (
              <div key={review.id} className="qa-dashboard-table-row">
                <div className="qa-dashboard-table-cell">{review.nodeId}</div>
                <div className="qa-dashboard-table-cell">
                  <span
                    className={`qa-dashboard-badge ${getStatusClass(review.reviewStatus)}`}
                  >
                    {review.reviewStatus}
                  </span>
                </div>
                <div className="qa-dashboard-table-cell">
                  {review.qualityScore
                    ? `${review.qualityScore.toFixed(1)}%`
                    : "-"}
                </div>
                <div className="qa-dashboard-table-cell">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="qa-dashboard-actions">
        <button
          onClick={fetchDashboardData}
          className="qa-dashboard-button primary"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};
