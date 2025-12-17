// SPDX-License-Identifier: MIT
// apps/frontend/src/components/QualityDashboard/ManualReviewInterface.tsx

import React, { useState, useEffect, useCallback } from "react";
import "./ManualReviewInterface.css";

export interface QAReview {
  id: string;
  nodeId: string;
  reviewer?: string;
  reviewStatus: "pending" | "approved" | "rejected" | "needs_revision";
  qualityScore?: number;
  reviewComments?: string;
  createdAt: string;
  reviewedAt?: string;
  nodeData?: {
    name: string;
    kind: string;
    description?: string;
  };
}

export interface ManualReviewInterfaceProps {
  apiBaseUrl?: string;
  onReviewComplete?: (review: QAReview) => void;
}

export const ManualReviewInterface: React.FC<ManualReviewInterfaceProps> = ({
  apiBaseUrl = "http://localhost:3000",
  onReviewComplete,
}) => {
  const [reviews, setReviews] = useState<QAReview[]>([]);
  const [currentReview, setCurrentReview] = useState<QAReview | null>(null);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPendingReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiBaseUrl}/api/ai-annotator/qa/reviews?status=pending&limit=50`,
      );
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setReviews(data.data);
        setCurrentReview(data.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch pending reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchPendingReviews();
  }, [fetchPendingReviews]);

  const handleReviewAction = async (
    action: "approved" | "rejected" | "needs_revision",
  ) => {
    if (!currentReview) return;

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/ai-annotator/qa/reviews/${currentReview.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviewStatus: action,
            reviewComments: comments,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        onReviewComplete?.(data.data);

        // Move to next review
        const remainingReviews = reviews.filter(
          (r) => r.id !== currentReview.id,
        );
        setReviews(remainingReviews);
        setCurrentReview(remainingReviews[0] || null);
        setComments("");
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  const getScoreClass = (score: number): string => {
    if (score >= 80) return "high";
    if (score >= 60) return "medium";
    return "low";
  };

  if (loading) {
    return <div className="manual-review-loading">Loading reviews...</div>;
  }

  if (!currentReview) {
    return (
      <div className="manual-review-empty">
        <div className="manual-review-empty-icon">✓</div>
        <h3>All Caught Up!</h3>
        <p>No pending reviews at the moment.</p>
        <button
          onClick={fetchPendingReviews}
          className="manual-review-refresh-button"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="manual-review-container">
      <div className="manual-review-header">
        <h2 className="manual-review-title">Manual Review</h2>
        <div className="manual-review-progress">
          Review {reviews.indexOf(currentReview) + 1} of {reviews.length}
        </div>
      </div>

      <div className="manual-review-card">
        {/* Node Information */}
        <div className="manual-review-section">
          <h3 className="manual-review-section-title">Node Information</h3>
          <div className="manual-review-info-grid">
            <div className="manual-review-info-item">
              <span className="manual-review-info-label">Node ID:</span>
              <span className="manual-review-info-value">
                {currentReview.nodeId}
              </span>
            </div>
            {currentReview.nodeData && (
              <>
                <div className="manual-review-info-item">
                  <span className="manual-review-info-label">Name:</span>
                  <span className="manual-review-info-value">
                    {currentReview.nodeData.name}
                  </span>
                </div>
                <div className="manual-review-info-item">
                  <span className="manual-review-info-label">Kind:</span>
                  <span className="manual-review-info-value">
                    {currentReview.nodeData.kind}
                  </span>
                </div>
                {currentReview.nodeData.description && (
                  <div className="manual-review-info-item">
                    <span className="manual-review-info-label">
                      Description:
                    </span>
                    <span className="manual-review-info-value">
                      {currentReview.nodeData.description}
                    </span>
                  </div>
                )}
              </>
            )}
            {currentReview.qualityScore !== undefined && (
              <div className="manual-review-info-item">
                <span className="manual-review-info-label">Quality Score:</span>
                <span
                  className={`manual-review-quality-score ${getScoreClass(currentReview.qualityScore)}`}
                >
                  {currentReview.qualityScore.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Review Comments */}
        <div className="manual-review-section">
          <h3 className="manual-review-section-title">Review Comments</h3>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add your review comments here..."
            className="manual-review-textarea"
            rows={5}
          />
        </div>

        {/* Action Buttons */}
        <div className="manual-review-actions">
          <button
            onClick={() => handleReviewAction("approved")}
            className="manual-review-button manual-review-button-approve"
          >
            ✓ Approve
          </button>
          <button
            onClick={() => handleReviewAction("needs_revision")}
            className="manual-review-button manual-review-button-revision"
          >
            ⚠ Needs Revision
          </button>
          <button
            onClick={() => handleReviewAction("rejected")}
            className="manual-review-button manual-review-button-reject"
          >
            ✗ Reject
          </button>
          <button
            onClick={() => {
              const remainingReviews = reviews.filter(
                (r) => r.id !== currentReview.id,
              );
              setReviews(remainingReviews);
              setCurrentReview(remainingReviews[0] || null);
              setComments("");
            }}
            className="manual-review-button manual-review-button-skip"
          >
            → Skip
          </button>
        </div>
      </div>

      {/* Queue Preview */}
      {reviews.length > 1 && (
        <div className="manual-review-queue">
          <h3 className="manual-review-queue-title">Upcoming Reviews</h3>
          <div className="manual-review-queue-list">
            {reviews.slice(1, 6).map((review) => (
              <div
                key={review.id}
                className="manual-review-queue-item"
                onClick={() => setCurrentReview(review)}
              >
                <span className="manual-review-queue-node-id">
                  {review.nodeId}
                </span>
                {review.qualityScore !== undefined && (
                  <span
                    className={`manual-review-queue-score ${getScoreClass(review.qualityScore)}`}
                  >
                    {review.qualityScore.toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
            {reviews.length > 6 && (
              <div className="manual-review-queue-more">
                +{reviews.length - 6} more...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
