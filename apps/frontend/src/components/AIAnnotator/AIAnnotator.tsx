// SPDX-License-Identifier: MIT
// apps/frontend/src/components/AIAnnotator/AIAnnotator.tsx

/**
 * AI Annotator Component
 * 
 * Provides a comprehensive interface for managing AI-powered annotation of function nodes.
 * Features include node management, batch operations, quality reporting, and AI generation
 * of metadata, rules, and forms.
 * 
 * @module AIAnnotator
 * @category Components
 * 
 * @example
 * ```tsx
 * import { AIAnnotator } from './components/AIAnnotator/AIAnnotator';
 * 
 * function App() {
 *   return <AIAnnotator />;
 * }
 * ```
 */

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import useAiAnnotator from "../../hooks/useAiAnnotator";
import "./AIAnnotator.css";

/**
 * Main AI Annotator component for function node annotation and management
 * 
 * @returns {React.FC} AI Annotator interface with dashboard, nodes, quality, and batch tabs
 */
export const AIAnnotator: React.FC = () => {
  const { t } = useTranslation("aiAnnotator");

  const {
    // Status & Config
    status,
    statusLoading,
    statusError,
    getStatus,

    // Health
    health,
    healthLoading,
    healthError,
    getHealth,

    // Nodes
    nodes,
    nodesLoading,
    nodesError,
    pagination,
    listNodes,

    // Database Stats
    databaseStats,
    databaseStatsLoading,
    databaseStatsError,
    getDatabaseStats,

    // Batch Operations
    batchOperations,
    batchOperationsLoading,
    batchOperationsError,
    getBatchOperations,
    cleanupOldBatches,

    // Quality Report
    qualityReport,
    qualityReportLoading,
    qualityReportError,
    getQualityReport,

    // AI Generation
    generateMeta,
    generateRule,
    generateForm,
  } = useAiAnnotator();

  // Local state
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "nodes" | "quality" | "batch"
  >("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [limitValue, setLimitValue] = useState(20);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");

  // Load initial data
  useEffect(() => {
    void getStatus();
    void getHealth();
    void getDatabaseStats();
    void getBatchOperations();
  }, [getStatus, getHealth, getDatabaseStats, getBatchOperations]);

  const handleRefreshNodes = useCallback(() => {
    void listNodes({ limit: limitValue });
  }, [listNodes, limitValue]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      void listNodes({ search: searchQuery, limit: limitValue });
    } else {
      handleRefreshNodes();
    }
  }, [searchQuery, listNodes, limitValue, handleRefreshNodes]);

  const getStatusIndicator = (healthy: boolean) => (
    <span
      className={`status-indicator ${healthy ? "status-healthy" : "status-error"}`}
    />
  );

  const renderDashboard = () => (
    <div className="ai-section">
      <h2 className="ai-section-title">{t("dashboard.title")}</h2>
      <div className="ai-grid">
        {/* API Status Card */}
        <div className="ai-card">
          <h3 className="ai-card-title">
            {t("dashboard.systemStatus.title")}{" "}
            {status && getStatusIndicator(status.available)}
          </h3>
          {statusLoading ? (
            <p className="loading-text">
              {t("dashboard.systemStatus.loading")}
            </p>
          ) : statusError ? (
            <p className="error-text">
              {t("dashboard.systemStatus.error")}: {statusError}
            </p>
          ) : status ? (
            <>
              <div className="status-details">
                <p>
                  Provider: <strong>{status.provider}</strong>
                </p>
                <p>
                  Model: <strong>{status.model}</strong>
                </p>
                <p>
                  Available: <strong>{status.available ? "Yes" : "No"}</strong>
                </p>
                {status.capabilities && status.capabilities.length > 0 && (
                  <div className="capabilities-list">
                    <strong>Capabilities:</strong>
                    <div className="tags-container">
                      {status.capabilities.map((cap: string, idx: number) => (
                        <span key={`cap-${idx}`} className="tag">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => void getStatus()}
                className="btn btn-primary"
                disabled={statusLoading}
              >
                {t("nodes.refreshButton")}
              </button>
            </>
          ) : (
            <p>No status data available</p>
          )}
        </div>

        {/* System Health Card */}
        <div className="ai-card">
          <h3 className="ai-card-title">
            {t("dashboard.health.title")}{" "}
            {health && getStatusIndicator(health.overall === "healthy")}
          </h3>
          {healthLoading ? (
            <p className="loading-text">{t("dashboard.health.loading")}</p>
          ) : healthError ? (
            <p className="error-text">
              {t("dashboard.health.error")}: {healthError}
            </p>
          ) : health ? (
            <>
              <div className="health-details">
                <p>
                  Overall: <strong>{health.overall}</strong>
                </p>
                <p>
                  Database:{" "}
                  <strong
                    className={health.database ? "text-success" : "text-error"}
                  >
                    {health.database ? "Connected" : "Disconnected"}
                  </strong>
                </p>
                <p>
                  Memory: {health.memory.percentage.toFixed(1)}% (
                  {(health.memory.used / 1024 / 1024).toFixed(0)}MB /{" "}
                  {(health.memory.total / 1024 / 1024).toFixed(0)}MB)
                </p>
                <p>
                  Last Check:{" "}
                  {new Date(health.lastHealthCheck).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => void getHealth()}
                className="btn btn-primary"
                disabled={healthLoading}
              >
                {t("nodes.refreshButton")}
              </button>
            </>
          ) : (
            <p>No health data available</p>
          )}
        </div>

        {/* Database Statistics Card */}
        <div className="ai-card">
          <h3 className="ai-card-title">📊 {t("dashboard.database.title")}</h3>
          {databaseStatsLoading ? (
            <p className="loading-text">{t("dashboard.database.loading")}</p>
          ) : databaseStatsError ? (
            <p className="error-text">
              {t("dashboard.database.error")}: {databaseStatsError}
            </p>
          ) : databaseStats ? (
            <>
              <div className="db-stats">
                <p className="stat-main">
                  {t("dashboard.database.totalNodes")}:{" "}
                  <strong>
                    {(databaseStats as unknown as Record<string, number>)
                      .total || 0}
                  </strong>
                </p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    ref={(el) => {
                      if (el) {
                        el.style.width = `${(((databaseStats as unknown as Record<string, number>).annotated || 0) / ((databaseStats as unknown as Record<string, number>).total || 1)) * 100}%`;
                      }
                    }}
                  />
                </div>
                <p className="stat-label">
                  {(databaseStats as unknown as Record<string, number>)
                    .annotated || 0}{" "}
                  /{" "}
                  {(databaseStats as unknown as Record<string, number>).total ||
                    0}{" "}
                  annotated
                </p>
                <div className="stats-grid">
                  <div className="stat-item">
                    <strong>Valid:</strong>{" "}
                    {(databaseStats as unknown as Record<string, number>)
                      .valid || 0}
                  </div>
                  <div className="stat-item">
                    <strong>Invalid:</strong>{" "}
                    {(databaseStats as unknown as Record<string, number>)
                      .invalid || 0}
                  </div>
                  <div className="stat-item">
                    <strong>Pending:</strong>{" "}
                    {(databaseStats as unknown as Record<string, number>)
                      .pending || 0}
                  </div>
                </div>
              </div>
              <button
                onClick={() => void getDatabaseStats()}
                className="btn btn-primary"
                disabled={databaseStatsLoading}
              >
                {t("nodes.refreshButton")}
              </button>
            </>
          ) : (
            <p>No database stats available</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderNodes = () => (
    <div className="ai-section">
      <h2 className="ai-section-title">{t("nodes.title")}</h2>

      {/* Filters */}
      <div className="filter-row">
        <div className="filter-group">
          <label className="filter-label">{t("nodes.search")}</label>
          <input
            type="text"
            className="filter-input"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder={t("nodes.search")}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">{t("nodes.limit")}</label>
          <input
            type="number"
            className="filter-input"
            value={limitValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setLimitValue(Number(e.target.value))
            }
            min={1}
            max={100}
            aria-label="Results limit"
          />
        </div>
      </div>

      <div className="filter-actions">
        <button
          onClick={handleSearch}
          className="btn btn-primary"
          disabled={nodesLoading}
        >
          {t("nodes.searchButton")}
        </button>
        <button
          onClick={handleRefreshNodes}
          className="btn btn-secondary"
          disabled={nodesLoading}
        >
          {t("nodes.refreshButton")}
        </button>
      </div>

      {nodesLoading ? (
        <div className="loading-state">{t("nodes.loading")}</div>
      ) : nodesError ? (
        <div className="error-state">
          {t("nodes.error")}: {nodesError}
        </div>
      ) : !nodes || nodes.length === 0 ? (
        <div className="empty-state">{t("nodes.noNodes")}</div>
      ) : (
        <>
          <div className="pagination-info">
            {t("nodes.pagination.showing")} {nodes.length}{" "}
            {t("nodes.pagination.of")} {pagination.total}{" "}
            {t("nodes.pagination.nodes")}
          </div>
          <div className="ai-grid">
            {nodes.map(
              (
                node: {
                  id: string;
                  title: string;
                  kind: string;
                  path: string[];
                  meta?: { description?: string };
                },
                idx: number,
              ) => (
                <div
                  key={node.id || idx}
                  className="ai-card node-card"
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  <div className="node-header">
                    <span className="node-kind">{node.kind}</span>
                    <span className="node-id">{node.id}</span>
                  </div>
                  <h4 className="node-title">{node.title || "Untitled"}</h4>
                  <p className="node-description">
                    Path: {node.path?.join(" > ") || "N/A"}
                  </p>
                  {node.meta?.description && (
                    <p className="node-description">
                      {String(node.meta.description).substring(0, 100)}...
                    </p>
                  )}
                  {selectedNodeId === node.id && (
                    <div className="node-actions">
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          void generateMeta(node.id);
                        }}
                        className="btn btn-primary"
                      >
                        {t("nodes.actions.generateMeta")}
                      </button>
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          void generateForm(node.id);
                        }}
                        className="btn btn-secondary"
                      >
                        {t("nodes.actions.generateForm")}
                      </button>
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          void generateRule(node.id);
                        }}
                        className="btn btn-success"
                      >
                        {t("nodes.actions.generateRule")}
                      </button>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderQuality = () => (
    <div className="ai-section">
      <h2 className="ai-section-title">{t("quality.title")}</h2>

      {qualityReportLoading ? (
        <div className="loading-state">{t("quality.loading")}</div>
      ) : qualityReportError ? (
        <div className="error-state">
          {t("quality.error")}: {qualityReportError}
        </div>
      ) : qualityReport ? (
        <div className="ai-grid">
          <div className="ai-card">
            <h3 className="ai-card-title">Overall Score</h3>
            <p className="quality-score">
              {(
                (qualityReport as unknown as Record<string, number>).score || 0
              ).toFixed(1)}
            </p>
          </div>

          <div className="ai-card">
            <h3 className="ai-card-title">Coverage</h3>
            <p className="quality-stat">
              {(qualityReport as unknown as Record<string, number>).coverage ||
                0}
              %
            </p>
            <p className="stat-label">Nodes Annotated</p>
          </div>

          <div className="ai-card">
            <h3 className="ai-card-title">Completeness</h3>
            <p className="quality-stat">
              {(qualityReport as unknown as Record<string, number>)
                .completeness || 0}
              %
            </p>
            <p className="stat-label">Fields Filled</p>
          </div>

          <div className="ai-card">
            <h3 className="ai-card-title">Consistency</h3>
            <p className="quality-stat">
              {(qualityReport as unknown as Record<string, number>)
                .consistency || 0}
              %
            </p>
            <p className="stat-label">Standard Compliance</p>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>{t("quality.noReport")}</p>
        </div>
      )}

      <button
        onClick={() => void getQualityReport()}
        className="btn btn-primary"
        disabled={qualityReportLoading}
      >
        {t("quality.generateButton")}
      </button>
    </div>
  );

  const renderBatch = () => (
    <div className="ai-section">
      <h2 className="ai-section-title">{t("batch.title")}</h2>

      {batchOperationsLoading ? (
        <div className="loading-state">{t("batch.loading")}</div>
      ) : batchOperationsError ? (
        <div className="error-state">
          {t("batch.error")}: {batchOperationsError}
        </div>
      ) : batchOperations && batchOperations.length > 0 ? (
        <div className="batch-list">
          {batchOperations.map(
            (batch: Record<string, unknown>, idx: number) => (
              <div
                key={(batch.id as string) || String(idx)}
                className="ai-card batch-card"
              >
                <div className="batch-header">
                  <h4>{String(batch.operation || "Unknown")}</h4>
                  <span
                    className={`batch-status batch-status-${batch.status || "pending"}`}
                  >
                    {String(batch.status || "pending")}
                  </span>
                </div>
                <p>Progress: {(batch.progress as number) || 0}%</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    ref={(el) => {
                      if (el) {
                        el.style.width = `${(batch.progress as number) || 0}%`;
                      }
                    }}
                  />
                </div>
                {batch.totalNodes !== undefined && (
                  <p className="stat-label">
                    {(batch.processedNodes as number) || 0} /{" "}
                    {batch.totalNodes as number} nodes processed
                  </p>
                )}
                {batch.created_at !== undefined && (
                  <p className="batch-date">
                    Created:{" "}
                    {new Date(batch.created_at as string).toLocaleString()}
                  </p>
                )}
              </div>
            ),
          )}
        </div>
      ) : (
        <div className="empty-state">
          <p>{t("batch.noBatches")}</p>
        </div>
      )}

      <div className="batch-actions">
        <button
          onClick={() => void getBatchOperations()}
          className="btn btn-secondary"
          disabled={batchOperationsLoading}
        >
          {t("batch.refreshButton")}
        </button>
        <button
          onClick={() => void cleanupOldBatches()}
          className="btn btn-danger"
          disabled={batchOperationsLoading}
        >
          {t("batch.cleanupButton")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="ai-annotator-container">
      <header className="ai-annotator-header">
        <h1 className="ai-annotator-title">🤖 {t("title")}</h1>
        <p className="ai-annotator-subtitle">{t("subtitle")}</p>
      </header>

      <div className="ai-annotator-tabs">
        <button
          className={`tab-button ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          {t("tabs.dashboard")}
        </button>
        <button
          className={`tab-button ${activeTab === "nodes" ? "active" : ""}`}
          onClick={() => setActiveTab("nodes")}
        >
          {t("tabs.nodes")}
        </button>
        <button
          className={`tab-button ${activeTab === "quality" ? "active" : ""}`}
          onClick={() => setActiveTab("quality")}
        >
          {t("tabs.quality")}
        </button>
        <button
          className={`tab-button ${activeTab === "batch" ? "active" : ""}`}
          onClick={() => setActiveTab("batch")}
        >
          {t("tabs.batch")}
        </button>
      </div>

      {activeTab === "dashboard" && renderDashboard()}
      {activeTab === "nodes" && renderNodes()}
      {activeTab === "quality" && renderQuality()}
      {activeTab === "batch" && renderBatch()}
    </div>
  );
};

export default AIAnnotator;
