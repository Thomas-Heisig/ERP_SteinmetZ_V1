// SPDX-License-Identifier: MIT
// apps/frontend/src/components/QualityDashboard/ManualReviewInterface.tsx

import React, { useState, useEffect } from "react";

interface QAReview {
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

interface ManualReviewInterfaceProps {
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

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
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
  };

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
        const remainingReviews = reviews.filter((r) => r.id !== currentReview.id);
        setReviews(remainingReviews);
        setCurrentReview(remainingReviews[0] || null);
        setComments("");
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading reviews...</div>;
  }

  if (!currentReview) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>✓</div>
        <h3>All Caught Up!</h3>
        <p>No pending reviews at the moment.</p>
        <button onClick={fetchPendingReviews} style={styles.refreshButton}>
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Manual Review</h2>
        <div style={styles.progress}>
          Review {reviews.indexOf(currentReview) + 1} of {reviews.length}
        </div>
      </div>

      <div style={styles.reviewCard}>
        {/* Node Information */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Node Information</h3>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Node ID:</span>
              <span style={styles.infoValue}>{currentReview.nodeId}</span>
            </div>
            {currentReview.nodeData && (
              <>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Name:</span>
                  <span style={styles.infoValue}>
                    {currentReview.nodeData.name}
                  </span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Kind:</span>
                  <span style={styles.infoValue}>
                    {currentReview.nodeData.kind}
                  </span>
                </div>
                {currentReview.nodeData.description && (
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Description:</span>
                    <span style={styles.infoValue}>
                      {currentReview.nodeData.description}
                    </span>
                  </div>
                )}
              </>
            )}
            {currentReview.qualityScore !== undefined && (
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Quality Score:</span>
                <span
                  style={{
                    ...styles.infoValue,
                    ...styles.qualityScore,
                    backgroundColor: getScoreColor(currentReview.qualityScore),
                  }}
                >
                  {currentReview.qualityScore.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Review Comments */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Review Comments</h3>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add your review comments here..."
            style={styles.textarea}
            rows={5}
          />
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button
            onClick={() => handleReviewAction("approved")}
            style={{ ...styles.button, ...styles.approveButton }}
          >
            ✓ Approve
          </button>
          <button
            onClick={() => handleReviewAction("needs_revision")}
            style={{ ...styles.button, ...styles.revisionButton }}
          >
            ⚠ Needs Revision
          </button>
          <button
            onClick={() => handleReviewAction("rejected")}
            style={{ ...styles.button, ...styles.rejectButton }}
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
            style={{ ...styles.button, ...styles.skipButton }}
          >
            → Skip
          </button>
        </div>
      </div>

      {/* Queue Preview */}
      {reviews.length > 1 && (
        <div style={styles.queue}>
          <h3 style={styles.queueTitle}>Upcoming Reviews</h3>
          <div style={styles.queueList}>
            {reviews.slice(1, 6).map((review) => (
              <div
                key={review.id}
                style={styles.queueItem}
                onClick={() => setCurrentReview(review)}
              >
                <span style={styles.queueNodeId}>{review.nodeId}</span>
                {review.qualityScore !== undefined && (
                  <span
                    style={{
                      ...styles.queueScore,
                      backgroundColor: getScoreColor(review.qualityScore),
                    }}
                  >
                    {review.qualityScore.toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
            {reviews.length > 6 && (
              <div style={styles.queueMore}>
                +{reviews.length - 6} more...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return "#28a745";
  if (score >= 60) return "#ffc107";
  return "#dc3545";
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
  } as React.CSSProperties,
  loading: {
    padding: "60px 20px",
    textAlign: "center" as const,
    fontSize: "18px",
    color: "#888",
  } as React.CSSProperties,
  empty: {
    padding: "60px 20px",
    textAlign: "center" as const,
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  } as React.CSSProperties,
  emptyIcon: {
    fontSize: "64px",
    color: "#28a745",
    marginBottom: "20px",
  } as React.CSSProperties,
  refreshButton: {
    marginTop: "20px",
    padding: "10px 24px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500" as const,
    cursor: "pointer",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  } as React.CSSProperties,
  title: {
    fontSize: "24px",
    fontWeight: "600" as const,
    color: "#333",
    margin: 0,
  } as React.CSSProperties,
  progress: {
    fontSize: "14px",
    color: "#888",
    padding: "6px 12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
  } as React.CSSProperties,
  reviewCard: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "24px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  } as React.CSSProperties,
  section: {
    marginBottom: "24px",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: "12px",
  } as React.CSSProperties,
  infoGrid: {
    display: "grid",
    gap: "12px",
  } as React.CSSProperties,
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  } as React.CSSProperties,
  infoLabel: {
    fontSize: "14px",
    color: "#888",
    fontWeight: "500" as const,
    minWidth: "120px",
  } as React.CSSProperties,
  infoValue: {
    fontSize: "14px",
    color: "#333",
  } as React.CSSProperties,
  qualityScore: {
    padding: "4px 12px",
    borderRadius: "12px",
    color: "white",
    fontWeight: "bold" as const,
  } as React.CSSProperties,
  textarea: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    resize: "vertical" as const,
    fontFamily: "inherit",
  } as React.CSSProperties,
  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
  } as React.CSSProperties,
  button: {
    flex: 1,
    padding: "12px 20px",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500" as const,
    cursor: "pointer",
    transition: "all 0.2s",
  } as React.CSSProperties,
  approveButton: {
    backgroundColor: "#28a745",
    color: "white",
  } as React.CSSProperties,
  revisionButton: {
    backgroundColor: "#ffc107",
    color: "#333",
  } as React.CSSProperties,
  rejectButton: {
    backgroundColor: "#dc3545",
    color: "white",
  } as React.CSSProperties,
  skipButton: {
    backgroundColor: "#6c757d",
    color: "white",
  } as React.CSSProperties,
  queue: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  } as React.CSSProperties,
  queueTitle: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: "12px",
  } as React.CSSProperties,
  queueList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  } as React.CSSProperties,
  queueItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  } as React.CSSProperties,
  queueNodeId: {
    fontSize: "13px",
    color: "#666",
  } as React.CSSProperties,
  queueScore: {
    fontSize: "12px",
    padding: "3px 8px",
    borderRadius: "10px",
    color: "white",
    fontWeight: "500" as const,
  } as React.CSSProperties,
  queueMore: {
    fontSize: "13px",
    color: "#888",
    fontStyle: "italic" as const,
    textAlign: "center" as const,
    padding: "8px",
  } as React.CSSProperties,
};
