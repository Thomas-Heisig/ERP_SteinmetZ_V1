// SPDX-License-Identifier: MIT
// apps/frontend/src/components/QualityDashboard/QualityTrendChart.tsx

import React, { useState, useEffect, useCallback } from "react";
import "./QualityTrendChart.css";

interface QualityTrend {
  timestamp: string;
  metricType: string;
  metricValue: number;
  nodeCount: number;
  batchId?: string;
}

interface QualityTrendChartProps {
  apiBaseUrl?: string;
  metricType?: string;
  days?: number;
}

export const QualityTrendChart: React.FC<QualityTrendChartProps> = ({
  apiBaseUrl = "http://localhost:3000",
  metricType = "overall",
  days = 30,
}) => {
  const [trends, setTrends] = useState<QualityTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState(metricType);

  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiBaseUrl}/api/ai-annotator/qa/trends?metricType=${selectedMetric}&days=${days}`,
      );
      const data = await response.json();

      if (data.success) {
        setTrends(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch quality trends:", error);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, selectedMetric, days]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  // Set bar heights imperatively to avoid inline styles
  useEffect(() => {
    if (trends.length === 0) return;

    const maxValue = Math.max(...trends.map((t) => t.metricValue));
    const minValue = Math.min(...trends.map((t) => t.metricValue));

    trends.forEach((trend, index) => {
      const height =
        ((trend.metricValue - minValue) / (maxValue - minValue)) * 100;
      const bar = document.querySelector(
        `[data-bar-index="${index}"]`,
      ) as HTMLElement;
      if (bar) {
        bar.style.height = `${height}%`;
      }
    });
  }, [trends]);

  if (loading) {
    return <div className="quality-trend-loading">Loading trends...</div>;
  }

  if (trends.length === 0) {
    return <div className="quality-trend-empty">No trend data available</div>;
  }

  const maxValue = Math.max(...trends.map((t) => t.metricValue));
  const minValue = Math.min(...trends.map((t) => t.metricValue));

  return (
    <div className="quality-trend-container">
      <div className="quality-trend-header">
        <h3 className="quality-trend-title">Quality Trends</h3>
        <div className="quality-trend-controls">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="quality-trend-select"
            aria-label="Select metric type"
          >
            <option value="overall">Overall Score</option>
            <option value="completeness">Completeness</option>
            <option value="accuracy">Accuracy</option>
            <option value="consistency">Consistency</option>
            <option value="confidence">Confidence</option>
          </select>
        </div>
      </div>

      <div className="quality-trend-stats">
        <div className="quality-trend-stat-item">
          <span className="quality-trend-stat-label">Current:</span>
          <span className="quality-trend-stat-value">
            {trends[trends.length - 1]?.metricValue.toFixed(1) || "N/A"}
          </span>
        </div>
        <div className="quality-trend-stat-item">
          <span className="quality-trend-stat-label">Avg:</span>
          <span className="quality-trend-stat-value">
            {(
              trends.reduce((sum, t) => sum + t.metricValue, 0) / trends.length
            ).toFixed(1)}
          </span>
        </div>
        <div className="quality-trend-stat-item">
          <span className="quality-trend-stat-label">Max:</span>
          <span className="quality-trend-stat-value">
            {maxValue.toFixed(1)}
          </span>
        </div>
        <div className="quality-trend-stat-item">
          <span className="quality-trend-stat-label">Min:</span>
          <span className="quality-trend-stat-value">
            {minValue.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="quality-trend-chart-container">
        <div className="quality-trend-y-axis">
          <div className="quality-trend-y-axis-label">
            {maxValue.toFixed(0)}
          </div>
          <div className="quality-trend-y-axis-label">
            {((maxValue + minValue) / 2).toFixed(0)}
          </div>
          <div className="quality-trend-y-axis-label">
            {minValue.toFixed(0)}
          </div>
        </div>

        <div className="quality-trend-chart">
          {trends.map((trend, index) => {
            const date = new Date(trend.timestamp);

            return (
              <div key={index} className="quality-trend-bar">
                <div
                  className="quality-trend-bar-fill"
                  data-bar-index={index}
                  title={`${trend.metricValue.toFixed(1)} (${trend.nodeCount} nodes)\n${date.toLocaleDateString()}`}
                />
                <div className="quality-trend-bar-label">
                  {date.getDate()}/{date.getMonth() + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="quality-trend-legend">
        <span className="quality-trend-legend-item">
          <span className="quality-trend-legend-dot" />
          Quality Score
        </span>
        <span className="quality-trend-legend-item">
          Total nodes: {trends.reduce((sum, t) => sum + t.nodeCount, 0)}
        </span>
      </div>
    </div>
  );
};
