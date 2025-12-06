// SPDX-License-Identifier: MIT
// apps/frontend/src/components/QualityDashboard/QADashboard.tsx

import React, { useState, useEffect } from "react";

interface QASummary {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  averageQualityScore: number;
  averageReviewTime: number;
}

interface QAReview {
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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
  };

  if (loading) {
    return <div style={styles.loading}>Loading QA Dashboard...</div>;
  }

  if (!summary) {
    return <div style={styles.error}>Failed to load dashboard data</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Quality Assurance Dashboard</h1>

      {/* Summary Cards */}
      <div style={styles.cardGrid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Reviews</div>
          <div style={styles.cardValue}>{summary.totalReviews}</div>
        </div>

        <div style={{ ...styles.card, borderTop: "4px solid #ffc107" }}>
          <div style={styles.cardTitle}>Pending Reviews</div>
          <div style={styles.cardValue}>{summary.pendingReviews}</div>
        </div>

        <div style={{ ...styles.card, borderTop: "4px solid #28a745" }}>
          <div style={styles.cardTitle}>Approved</div>
          <div style={styles.cardValue}>{summary.approvedReviews}</div>
        </div>

        <div style={{ ...styles.card, borderTop: "4px solid #dc3545" }}>
          <div style={styles.cardTitle}>Rejected</div>
          <div style={styles.cardValue}>{summary.rejectedReviews}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Avg Quality Score</div>
          <div style={styles.cardValue}>
            {summary.averageQualityScore.toFixed(1)}/100
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Avg Review Time</div>
          <div style={styles.cardValue}>
            {Math.round(summary.averageReviewTime)} min
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Reviews</h2>
        {recentReviews.length === 0 ? (
          <p style={styles.emptyState}>No reviews yet</p>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <div style={styles.tableCell}>Node ID</div>
              <div style={styles.tableCell}>Status</div>
              <div style={styles.tableCell}>Quality Score</div>
              <div style={styles.tableCell}>Date</div>
            </div>
            {recentReviews.map((review) => (
              <div key={review.id} style={styles.tableRow}>
                <div style={styles.tableCell}>{review.nodeId}</div>
                <div style={styles.tableCell}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: getStatusColor(review.reviewStatus),
                    }}
                  >
                    {review.reviewStatus}
                  </span>
                </div>
                <div style={styles.tableCell}>
                  {review.qualityScore
                    ? `${review.qualityScore.toFixed(1)}%`
                    : "-"}
                </div>
                <div style={styles.tableCell}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div style={styles.actions}>
        <button
          onClick={fetchDashboardData}
          style={{ ...styles.button, ...styles.primaryButton }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "approved":
      return "#28a745";
    case "rejected":
      return "#dc3545";
    case "needs_revision":
      return "#ffc107";
    default:
      return "#6c757d";
  }
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  } as React.CSSProperties,
  loading: {
    padding: "40px",
    textAlign: "center" as const,
    fontSize: "18px",
    color: "#888",
  } as React.CSSProperties,
  error: {
    padding: "40px",
    textAlign: "center" as const,
    fontSize: "18px",
    color: "#dc3545",
  } as React.CSSProperties,
  title: {
    fontSize: "32px",
    fontWeight: "bold" as const,
    marginBottom: "30px",
    color: "#333",
  } as React.CSSProperties,
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  } as React.CSSProperties,
  card: {
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    borderTop: "4px solid #007bff",
  } as React.CSSProperties,
  cardTitle: {
    fontSize: "14px",
    color: "#888",
    marginBottom: "10px",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,
  cardValue: {
    fontSize: "28px",
    fontWeight: "bold" as const,
    color: "#333",
  } as React.CSSProperties,
  section: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    padding: "20px",
    marginBottom: "20px",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600" as const,
    marginBottom: "20px",
    color: "#333",
  } as React.CSSProperties,
  emptyState: {
    textAlign: "center" as const,
    color: "#888",
    padding: "20px",
  } as React.CSSProperties,
  table: {
    width: "100%",
  } as React.CSSProperties,
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    padding: "10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    fontWeight: "600" as const,
    marginBottom: "5px",
  } as React.CSSProperties,
  tableRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    padding: "10px",
    borderBottom: "1px solid #e9ecef",
  } as React.CSSProperties,
  tableCell: {
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,
  badge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500" as const,
    color: "white",
    textTransform: "capitalize" as const,
  } as React.CSSProperties,
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  } as React.CSSProperties,
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500" as const,
    cursor: "pointer",
    transition: "all 0.2s",
  } as React.CSSProperties,
  primaryButton: {
    backgroundColor: "#007bff",
    color: "white",
  } as React.CSSProperties,
};
