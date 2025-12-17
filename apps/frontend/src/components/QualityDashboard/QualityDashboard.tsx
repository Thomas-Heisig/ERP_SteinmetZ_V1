// SPDX-License-Identifier: MIT
// apps/frontend/src/components/QualityDashboard/QualityDashboard.tsx

/**
 * Quality Dashboard Component
 *
 * Displays quality metrics and statistics for annotation workflows.
 * Shows overall quality stats, individual metrics with progress, and trends.
 *
 * Features:
 * - Quality score overview
 * - Accuracy and consistency metrics
 * - Review rate tracking
 * - Trend indicators
 * - Progress bars for each metric
 * - Responsive grid layout
 *
 * @example
 * ```tsx
 * <QualityDashboard />
 * ```
 *
 * @module QualityDashboard
 */

import React, { useState, useEffect } from "react";
import { Card } from "../ui";
import styles from "./QualityDashboard.module.css";

/**
 * Quality metric interface
 */
interface QualityMetric {
  /** Unique metric identifier */
  id: string;
  /** Display name of the metric */
  name: string;
  /** Current value */
  value: number;
  /** Target value to achieve */
  target: number;
  /** Trend direction indicator */
  trend: "up" | "down" | "stable";
  /** Unit of measurement */
  unit: string;
}

/**
 * Quality statistics interface
 */
interface QualityStats {
  /** Total number of annotations */
  totalAnnotations: number;
  /** Overall quality score percentage */
  qualityScore: number;
  /** Accuracy percentage */
  accuracy: number;
  /** Consistency percentage */
  consistency: number;
  /** Review rate percentage */
  reviewRate: number;
}

/**
 * Quality Dashboard component
 *
 * Displays quality metrics and statistics for annotation workflows.
 * Includes loading state, stats grid, and metrics with progress bars.
 *
 * @returns Quality dashboard interface
 */
export const QualityDashboard: React.FC = () => {
  const [stats, setStats] = useState<QualityStats>({
    totalAnnotations: 0,
    qualityScore: 0,
    accuracy: 0,
    consistency: 0,
    reviewRate: 0,
  });
  const [metrics, setMetrics] = useState<QualityMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQualityData = async () => {
      try {
        setLoading(true);
        // Mock data - replace with actual API call
        const mockStats: QualityStats = {
          totalAnnotations: 12543,
          qualityScore: 94.5,
          accuracy: 96.2,
          consistency: 92.8,
          reviewRate: 87.3,
        };

        const mockMetrics: QualityMetric[] = [
          {
            id: "1",
            name: "Annotation Speed",
            value: 125,
            target: 100,
            trend: "up",
            unit: "items/hour",
          },
          {
            id: "2",
            name: "Error Rate",
            value: 3.5,
            target: 5,
            trend: "down",
            unit: "%",
          },
          {
            id: "3",
            name: "Inter-Annotator Agreement",
            value: 89.2,
            target: 85,
            trend: "up",
            unit: "%",
          },
          {
            id: "4",
            name: "Review Time",
            value: 2.3,
            target: 3,
            trend: "down",
            unit: "min/item",
          },
        ];

        setStats(mockStats);
        setMetrics(mockMetrics);
      } catch (error) {
        console.error("Failed to fetch quality data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQualityData();
  }, []);

  const getTrendIcon = (trend: QualityMetric["trend"]) => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      case "stable":
        return "➡️";
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>📊 Quality Dashboard</h1>
        <p className={styles.subtitle}>
          Überwachen Sie die Qualität Ihrer Annotationen
        </p>
      </div>

      <div className={styles.statsGrid}>
        <Card variant="elevated" padding="md">
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Gesamt Annotationen</span>
            <span className={styles.statValue}>
              {stats.totalAnnotations.toLocaleString("de-DE")}
            </span>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Qualitätsscore</span>
            <span className={styles.statValue}>{stats.qualityScore}%</span>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Genauigkeit</span>
            <span className={styles.statValue}>{stats.accuracy}%</span>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Konsistenz</span>
            <span className={styles.statValue}>{stats.consistency}%</span>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Review Rate</span>
            <span className={styles.statValue}>{stats.reviewRate}%</span>
          </div>
        </Card>
      </div>

      <Card variant="elevated" padding="md" className={styles.metricsCard}>
        <h2 className={styles.sectionTitle}>Qualitätsmetriken</h2>
        <div className={styles.metricsGrid}>
          {metrics.map((metric) => (
            <div key={metric.id} className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricName}>{metric.name}</span>
                <span className={styles.trendIcon}>
                  {getTrendIcon(metric.trend)}
                </span>
              </div>
              <div className={styles.metricValues}>
                <div className={styles.metricValue}>
                  <span className={styles.valueNumber}>{metric.value}</span>
                  <span className={styles.valueUnit}>{metric.unit}</span>
                </div>
                <div className={styles.metricTarget}>
                  Ziel: {metric.target} {metric.unit}
                </div>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  data-progress={Math.min(
                    (metric.value / metric.target) * 100,
                    100,
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default QualityDashboard;
