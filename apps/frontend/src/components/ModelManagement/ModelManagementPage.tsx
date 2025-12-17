// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ModelManagement/ModelManagementPage.tsx

/**
 * Model Management Page Component
 * 
 * Main navigation page for AI model management features:
 * - Model selection interface
 * - Model comparison
 * - Cost tracking
 * - Usage statistics
 * 
 * @module ModelManagementPage
 */

import React, { useState } from "react";
import ModelComparison from "./ModelComparison";
import ModelCostTracking from "./ModelCostTracking";
import ModelUsageStatistics from "./ModelUsageStatistics";
import ModelSelectionInterface from "./ModelSelectionInterface";
import styles from "./ModelManagementPage.module.css";

export const ModelManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "selection" | "comparison" | "cost" | "usage"
  >("selection");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI Model Management</h1>
        <p className={styles.subtitle}>
          Monitor, compare, and optimize your AI model usage
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab("selection")}
          className={`${styles.tab} ${activeTab === "selection" ? styles.activeTab : ""}`}
        >
          Model Selection
        </button>
        <button
          onClick={() => setActiveTab("comparison")}
          className={`${styles.tab} ${activeTab === "comparison" ? styles.activeTab : ""}`}
        >
          Performance Comparison
        </button>
        <button
          onClick={() => setActiveTab("cost")}
          className={`${styles.tab} ${activeTab === "cost" ? styles.activeTab : ""}`}
        >
          Cost Tracking
        </button>
        <button
          onClick={() => setActiveTab("usage")}
          className={`${styles.tab} ${activeTab === "usage" ? styles.activeTab : ""}`}
        >
          Usage Statistics
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "selection" && <ModelSelectionInterface />}
        {activeTab === "comparison" && <ModelComparison />}
        {activeTab === "cost" && <ModelCostTracking />}
        {activeTab === "usage" && <ModelUsageStatistics />}
      </div>
    </div>
  );
};

export default ModelManagementPage;