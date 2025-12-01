// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/ui/NodeDetails.tsx

import React, { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardLogic } from "../hooks/useDashboardLogic";
import { useDashboardNavigation } from "../hooks/useDashboardNavigation";
import { NodeBuilder } from "../features/builder/NodeBuilder";
import { WidgetResolver } from "../features/builder/WidgetResolver";
import LoadingScreen from "./LoadingScreen";
import ErrorScreen from "./ErrorScreen";
import {
  getNodeIcon,
  getNodeTypeLabel,
  getCategoryColor,
} from "../utils/mapping";
import cls from "../utils/cls";

import type { DashboardNode, NodeDetail, WidgetInstance } from "../types";

// ============================================================================
// Type Definitions
// ============================================================================

interface NodeDetailsProps {
  /** Custom CSS class name */
  className?: string;
  /** Whether to show raw JSON data */
  showDebugInfo?: boolean;
  /** View mode for the node */
  viewMode?: "view" | "edit" | "preview";
}

interface NodeDetailsState {
  activeTab: "content" | "properties" | "relationships" | "history";
  isEditing: boolean;
  showRawData: boolean;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Maps NodeDetail to DashboardNode with proper type safety
 */
function mapNodeDetailToDashboardNode(node: NodeDetail): DashboardNode {
  return {
    id: node.id,
    type: node.type ?? "CUSTOM",
    position: {
      x: node.position?.x ?? 0,
      y: node.position?.y ?? 0,
      zIndex: node.position?.zIndex ?? 1,
    },
    size: {
      width: node.size?.width ?? 4,
      height: node.size?.height ?? 4,
      minWidth: node.size?.minWidth,
      minHeight: node.size?.minHeight,
      maxWidth: node.size?.maxWidth,
      maxHeight: node.size?.maxHeight,
    },
    data: node.data ?? {
      title: node.title || "Untitled Node",
      content: node.description,
      ...(node.data ? (node.data as Record<string, unknown>) : {}),
    },
    config: {
      visibility: node.config?.visibility ?? "VISIBLE",
      isDraggable: node.config?.isDraggable ?? false,
      isResizable: node.config?.isResizable ?? false,
      isCollapsible: node.config?.isCollapsible ?? false,
      isEditable: node.config?.isEditable ?? false,
    },
    metadata: {
      icon: node.metadata?.icon,
      color: node.metadata?.color,
      tags: node.tags || node.metadata?.tags || [],
      category: node.category || node.metadata?.category || null,
      createdAt: node.createdAt || node.metadata?.createdAt || new Date(),
      updatedAt: node.updatedAt || node.metadata?.updatedAt || new Date(),
      createdBy: node.createdBy || node.metadata?.createdBy || "unknown",
      version: node.version || node.metadata?.version || 1,
    },
  };
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// ============================================================================
// Node Header Component
// ============================================================================

interface NodeHeaderProps {
  node: NodeDetail;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditing: boolean;
}

const NodeHeader: React.FC<NodeHeaderProps> = React.memo(
  ({ node, onBack, onEdit, onDelete, isEditing }) => {
    const { t } = useTranslation();
    const categoryColor = getCategoryColor(node.category);

    return (
      <header className="node-details__header">
        {/* Back Button and Navigation */}
        <div className="node-details__navigation">
          <button
            className="node-details__back-button"
            onClick={onBack}
            aria-label={t("nodeDetails.backToOverview")}
          >
            <span className="node-details__back-icon">←</span>
            {t("nodeDetails.back")}
          </button>
        </div>

        {/* Main Header Content */}
        <div className="node-details__title-section">
          <div
            className="node-details__icon"
            style={{ color: categoryColor.primary }}
          >
            {getNodeIcon(node.type, "emoji")}
          </div>

          <div className="node-details__title-content">
            <h1 className="node-details__title" title={node.title}>
              {node.title || t("nodeDetails.untitled")}
            </h1>

            <div className="node-details__meta">
              <span className="node-details__type">
                {getNodeTypeLabel(node.type)}
              </span>

              {node.category && (
                <>
                  <span className="node-details__meta-separator">•</span>
                  <span
                    className="node-details__category"
                    style={{ color: categoryColor.primary }}
                  >
                    {node.category}
                  </span>
                </>
              )}

              <span className="node-details__meta-separator">•</span>
              <span className="node-details__updated">
                {t("nodeDetails.updated", {
                  date: formatDate(node.updatedAt),
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="node-details__actions">
          {onEdit && (
            <button
              className={cls(
                "node-details__action-button",
                {
                  "node-details__action-button--active": isEditing,
                },
                undefined,
              )}
              onClick={onEdit}
              aria-label={t("nodeDetails.edit")}
            >
              {getNodeIcon("FORM", "emoji")}
              <span>
                {isEditing
                  ? t("nodeDetails.cancelEdit")
                  : t("nodeDetails.edit")}
              </span>
            </button>
          )}

          {onDelete && (
            <button
              className="node-details__action-button node-details__action-button--danger"
              onClick={onDelete}
              aria-label={t("nodeDetails.delete")}
            >
              {getNodeIcon("CUSTOM", "emoji")}
              <span>{t("nodeDetails.delete")}</span>
            </button>
          )}
        </div>
      </header>
    );
  },
);

NodeHeader.displayName = "NodeHeader";

// ============================================================================
// Node Properties Component
// ============================================================================

interface NodePropertiesProps {
  node: NodeDetail;
}

const NodeProperties: React.FC<NodePropertiesProps> = ({ node }) => {
  const { t } = useTranslation();

  const properties = [
    { label: t("nodeDetails.properties.id"), value: node.id },
    {
      label: t("nodeDetails.properties.type"),
      value: getNodeTypeLabel(node.type),
    },
    { label: t("nodeDetails.properties.category"), value: node.category },
    {
      label: t("nodeDetails.properties.created"),
      value: formatDate(node.createdAt),
    },
    {
      label: t("nodeDetails.properties.updated"),
      value: formatDate(node.updatedAt),
    },
    { label: t("nodeDetails.properties.createdBy"), value: node.createdBy },
    { label: t("nodeDetails.properties.version"), value: `v${node.version}` },
  ];

  return (
    <div className="node-details__properties">
      <h3 className="node-details__properties-title">
        {t("nodeDetails.properties.title")}
      </h3>

      <div className="node-details__properties-grid">
        {properties.map((prop, index) => (
          <div key={index} className="node-details__property">
            <span className="node-details__property-label">{prop.label}:</span>
            <span className="node-details__property-value">
              {prop.value || "-"}
            </span>
          </div>
        ))}
      </div>

      {/* Tags */}
      {node.tags && node.tags.length > 0 && (
        <div className="node-details__tags">
          <h4 className="node-details__tags-title">{t("nodeDetails.tags")}</h4>
          <div className="node-details__tags-list">
            {node.tags.map((tag, index) => (
              <span key={index} className="node-details__tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

/**
 * NodeDetails - Comprehensive node detail view with multiple display modes
 *
 * Features:
 * - Multiple view modes (content, properties, relationships, history)
 * - Edit mode support
 * - Widget rendering through NodeBuilder
 * - Responsive design
 * - Accessibility support
 *
 * @component
 * @example
 * ```tsx
 * <NodeDetails
 *   showDebugInfo={false}
 *   viewMode="view"
 *   className="custom-node-details"
 * />
 * ```
 */
const NodeDetails: React.FC<NodeDetailsProps> = ({
  className,
  showDebugInfo = false,
  viewMode = "view",
}) => {
  const { t } = useTranslation();
  const { state } = useDashboardLogic();
  const { goBack } = useDashboardNavigation();

  const { node, nodeLoading, nodeError } = state.catalog;
  const widgetRegistry = state.builder?.widgets ?? {};

  const [localState, setLocalState] = useState<NodeDetailsState>({
    activeTab: "content",
    isEditing: viewMode === "edit",
    showRawData: showDebugInfo,
  });

  // Build widget tree from node data
  const builtTree = useMemo(() => {
    if (!node) return [];

    const dashboardNode = mapNodeDetailToDashboardNode(node);
    const builder = new NodeBuilder(widgetRegistry);

    try {
      return builder.build([dashboardNode]);
    } catch (error) {
      console.error("Error building node tree:", error);
      return [];
    }
  }, [node, widgetRegistry]);

  // Render widgets using WidgetResolver
  const renderedWidgets = useMemo(() => {
    if (!Array.isArray(builtTree) || builtTree.length === 0) return null;

    const resolver = new WidgetResolver({ registry: widgetRegistry });

    return builtTree.map((widgetInstance: WidgetInstance) => {
      try {
        const WidgetComponent = resolver.resolve(widgetInstance.type);

        if (!WidgetComponent) {
          console.warn(`No widget found for type: ${widgetInstance.type}`);
          return (
            <div key={widgetInstance.id} className="node-details__widget-error">
              {t("nodeDetails.widgetNotFound", { type: widgetInstance.type })}
            </div>
          );
        }

        return (
          <div key={widgetInstance.id} className="node-details__widget">
            <WidgetComponent
              node={mapNodeDetailToDashboardNode(node!)}
              config={widgetInstance.config}
            />
          </div>
        );
      } catch (error) {
        console.error(`Error rendering widget ${widgetInstance.type}:`, error);
        return (
          <div key={widgetInstance.id} className="node-details__widget-error">
            {t("nodeDetails.widgetError")}
          </div>
        );
      }
    });
  }, [builtTree, widgetRegistry, node, t]);

  const handleTabChange = useCallback((tab: NodeDetailsState["activeTab"]) => {
    setLocalState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const handleEditToggle = useCallback(() => {
    setLocalState((prev) => ({ ...prev, isEditing: !prev.isEditing }));
  }, []);

  const handleRawDataToggle = useCallback(() => {
    setLocalState((prev) => ({ ...prev, showRawData: !prev.showRawData }));
  }, []);

  const handleDelete = useCallback(() => {
    // TODO: Implement delete functionality
    if (window.confirm(t("nodeDetails.deleteConfirm"))) {
      console.log("Delete node:", node?.id);
    }
  }, [node, t]);

  // Loading and error states
  if (nodeLoading) {
    return (
      <LoadingScreen
        message={t("nodeDetails.loading")}
        variant="dots"
        size="medium"
      />
    );
  }

  if (nodeError) {
    return (
      <ErrorScreen
        error={nodeError}
        title={t("nodeDetails.errorTitle")}
        message={t("nodeDetails.errorMessage")}
        onRetry={() => window.location.reload()}
        variant="professional"
      />
    );
  }

  if (!node) {
    return (
      <div className="node-details__empty">
        <div className="node-details__empty-icon">
          {getNodeIcon("CUSTOM", "emoji")}
        </div>
        <h3 className="node-details__empty-title">
          {t("nodeDetails.noNodeSelected")}
        </h3>
        <p className="node-details__empty-description">
          {t("nodeDetails.selectNodePrompt")}
        </p>
      </div>
    );
  }

  const nodeDetailsClasses = cls(
    "node-details",
    `node-details--${localState.activeTab}`,
    {
      "node-details--editing": localState.isEditing,
      "node-details--debug": localState.showRawData,
    },
    className ?? undefined,
    undefined,
  );

  return (
    <div className={nodeDetailsClasses}>
      {/* Header */}
      <NodeHeader
        node={node}
        onBack={goBack}
        onEdit={handleEditToggle}
        onDelete={handleDelete}
        isEditing={localState.isEditing}
      />

      {/* Navigation Tabs */}
      <nav className="node-details__tabs">
        <button
          className={cls(
            "node-details__tab",
            {
              "node-details__tab--active": localState.activeTab === "content",
            },
            undefined,
          )}
          onClick={() => handleTabChange("content")}
        >
          {t("nodeDetails.tabs.content")}
        </button>

        <button
          className={cls(
            "node-details__tab",
            {
              "node-details__tab--active":
                localState.activeTab === "properties",
            },
            undefined,
          )}
          onClick={() => handleTabChange("properties")}
        >
          {t("nodeDetails.tabs.properties")}
        </button>

        <button
          className={cls(
            "node-details__tab",
            {
              "node-details__tab--active":
                localState.activeTab === "relationships",
            },
            undefined,
          )}
          onClick={() => handleTabChange("relationships")}
        >
          {t("nodeDetails.tabs.relationships")}
        </button>

        <button
          className={cls(
            "node-details__tab",
            {
              "node-details__tab--active": localState.activeTab === "history",
            },
            undefined,
          )}
          onClick={() => handleTabChange("history")}
        >
          {t("nodeDetails.tabs.history")}
        </button>
      </nav>

      {/* Content Area */}
      <main className="node-details__content">
        {localState.activeTab === "content" && (
          <div className="node-details__widgets">
            {node.description && (
              <div className="node-details__description">
                <h3 className="node-details__description-title">
                  {t("nodeDetails.description")}
                </h3>
                <p className="node-details__description-text">
                  {node.description}
                </p>
              </div>
            )}

            {renderedWidgets && renderedWidgets.length > 0 ? (
              renderedWidgets
            ) : (
              <div className="node-details__no-widgets">
                <p>{t("nodeDetails.noWidgets")}</p>
              </div>
            )}
          </div>
        )}

        {localState.activeTab === "properties" && (
          <NodeProperties node={node} />
        )}

        {localState.activeTab === "relationships" && (
          <div className="node-details__relationships">
            <h3>{t("nodeDetails.relationships.title")}</h3>
            <p className="node-details__coming-soon">
              {t("nodeDetails.comingSoon")}
            </p>
          </div>
        )}

        {localState.activeTab === "history" && (
          <div className="node-details__history">
            <h3>{t("nodeDetails.history.title")}</h3>
            <p className="node-details__coming-soon">
              {t("nodeDetails.comingSoon")}
            </p>
          </div>
        )}
      </main>

      {/* Debug Information */}
      {localState.showRawData && (
        <details className="node-details__debug">
          <summary className="node-details__debug-summary">
            {t("nodeDetails.debugInfo")}
          </summary>
          <pre className="node-details__debug-content">
            {JSON.stringify(
              {
                node,
                builtTree,
                widgetRegistry: Object.keys(widgetRegistry),
              },
              null,
              2,
            )}
          </pre>
        </details>
      )}
      {/* Debug Toggle */}
      {import.meta.env.MODE === "development" && (
        <button
          className="node-details__debug-toggle"
          onClick={handleRawDataToggle}
          aria-label={t("nodeDetails.toggleDebug")}
        >
          {localState.showRawData ? "🔒" : "🔓"}
        </button>
      )}
    </div>
  );
};

// ============================================================================
// Display Name
// ============================================================================

NodeDetails.displayName = "NodeDetails";

export default NodeDetails;
