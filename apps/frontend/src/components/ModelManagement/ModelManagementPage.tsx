// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ModelManagement/ModelManagementPage.tsx

import React, { useState } from "react";
import { ModelComparison } from "./ModelComparison";
import { ModelCostTracking } from "./ModelCostTracking";
import { ModelUsageStatistics } from "./ModelUsageStatistics";
import { ModelSelectionInterface } from "./ModelSelectionInterface";

export const ModelManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "selection" | "comparison" | "cost" | "usage"
  >("selection");

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>AI Model Management</h1>
        <p style={styles.subtitle}>
          Monitor, compare, and optimize your AI model usage
        </p>
      </div>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("selection")}
          style={{
            ...styles.tab,
            ...(activeTab === "selection" ? styles.activeTab : {}),
          }}
        >
          Model Selection
        </button>
        <button
          onClick={() => setActiveTab("comparison")}
          style={{
            ...styles.tab,
            ...(activeTab === "comparison" ? styles.activeTab : {}),
          }}
        >
          Performance Comparison
        </button>
        <button
          onClick={() => setActiveTab("cost")}
          style={{
            ...styles.tab,
            ...(activeTab === "cost" ? styles.activeTab : {}),
          }}
        >
          Cost Tracking
        </button>
        <button
          onClick={() => setActiveTab("usage")}
          style={{
            ...styles.tab,
            ...(activeTab === "usage" ? styles.activeTab : {}),
          }}
        >
          Usage Statistics
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === "selection" && <ModelSelectionInterface />}
        {activeTab === "comparison" && <ModelComparison />}
        {activeTab === "cost" && <ModelCostTracking />}
        {activeTab === "usage" && <ModelUsageStatistics />}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
  } as React.CSSProperties,
  header: {
    marginBottom: "30px",
  } as React.CSSProperties,
  title: {
    fontSize: "32px",
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: "8px",
  } as React.CSSProperties,
  subtitle: {
    fontSize: "16px",
    color: "#666",
    margin: 0,
  } as React.CSSProperties,
  tabs: {
    display: "flex",
    gap: "4px",
    borderBottom: "2px solid #e9ecef",
    marginBottom: "30px",
  } as React.CSSProperties,
  tab: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "500" as const,
    border: "none",
    backgroundColor: "transparent",
    color: "#666",
    cursor: "pointer",
    transition: "all 0.2s",
    borderBottom: "2px solid transparent",
    marginBottom: "-2px",
  } as React.CSSProperties,
  activeTab: {
    color: "#007bff",
    borderBottom: "2px solid #007bff",
  } as React.CSSProperties,
  content: {
    minHeight: "500px",
  } as React.CSSProperties,
};
