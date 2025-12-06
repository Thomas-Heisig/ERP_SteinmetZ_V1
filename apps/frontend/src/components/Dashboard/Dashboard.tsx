// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/Dashboard.tsx

import React, { Suspense, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

// Provider / Context
import DashboardProvider from "./core/DashboardProvider";
import {
  useDashboardSelector,
  useDashboardDispatch,
} from "./core/DashboardContext";

// Theme-System
import { ThemeProvider, useTheme } from "../../contexts/ThemeContext";

// Styles
import "./styles/dashboard-modern.css";

// Typen
import type {
  Category,
  SearchResult,
  NodeDetail,
  DashboardConfig,
  DashboardState,
} from "./types";

// UI-Komponenten
import DashboardHeader from "./ui/DashboardHeader";
import DashboardTopBar from "./ui/DashboardTopBar";
import CategoryGrid from "./ui/CategoryGrid";
import NodeDetails from "./ui/NodeDetails";
import SearchOverlay from "./ui/SearchOverlay";
import LoadingScreen from "./ui/LoadingScreen";
import ErrorScreen from "./ui/ErrorScreen";
import QuickChatButton from "./ui/QuickChatButton";

// Widgets
import { DashboardWidgets } from "../DashboardWidgets";

// Layout Hook
import { useDashboardLayout } from "./hooks/useDashboardLayout";

// ============================================================================
// Dashboard Wrapper
// ============================================================================

interface DashboardProps {
  /** Initial configuration for the dashboard */
  config?: Partial<DashboardConfig>;
  /** Preloaded nodes for initial display */
  initialNodes?: NodeDetail[];
  /** Callback for state changes */
  onStateChange?: (state: DashboardState) => void;
  /** Error handler */
  onError?: (error: Error) => void;
  /** Additional CSS classes */
  className?: string;
  /** Backend URL override */
  backendUrl?: string;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
  return (
    <ThemeProvider>
      <DashboardProvider {...props}>
        <Suspense fallback={<LoadingScreen message="loading.i18n" />}>
          <DashboardView />
        </Suspense>
      </DashboardProvider>
    </ThemeProvider>
  );
};

export default Dashboard;

// ============================================================================
// DashboardView – Main View Component
// ============================================================================

const DashboardView: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useDashboardDispatch();

  // Layout calculation (tablet, mobile etc.)
  useDashboardLayout();

  // Global state selection with memoization
  const { navigation, search, catalog, ui } = useDashboardSelector((state) => ({
    navigation: state.navigation,
    search: state.search,
    catalog: state.catalog,
    ui: state.ui,
  }));

  // ============================================================================
  // Category Generation from Nodes
  // ============================================================================

  const categoryList: Category[] = useMemo(() => {
    return catalog.roots.map((node: NodeDetail) => ({
      id: node.id,
      name: node.title ?? t("dashboard.categories.defaultName"),
      color: node.metadata?.color ?? "#888888",
      icon: node.metadata?.icon ?? "folder",
      nodeIds: [node.id],
    }));
  }, [catalog.roots, t]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /** Category selection → load first node */
  const handleCategorySelect = useCallback(
    (category: Category) => {
      const firstNodeId = category.nodeIds?.[0] ?? null;
      if (firstNodeId) {
        dispatch({ type: "SELECT_NODE", payload: firstNodeId });
      }
    },
    [dispatch],
  );

  /** Close search overlay */
  const handleSearchOverlayClose = useCallback(() => {
    dispatch({ type: "SET_SEARCH_ACTIVE", payload: false });
  }, [dispatch]);

  /** Select search result */
  const handleSearchResultSelect = useCallback(
    (result: SearchResult) => {
      dispatch({ type: "SELECT_NODE", payload: result.id });
      dispatch({ type: "SET_SEARCH_ACTIVE", payload: false });
    },
    [dispatch],
  );

  /** Toggle search visibility */
  const handleSearchToggle = useCallback(() => {
    dispatch({
      type: "SET_SEARCH_ACTIVE",
      payload: !search.active,
    });
  }, [dispatch, search.active]);

  // ============================================================================
  // Loading States & Error Handling
  // ============================================================================

  if (catalog.rootsLoading) {
    return <LoadingScreen message={t("dashboard.loading.categories")} />;
  }

  if (catalog.rootsError != null) {
    return (
      <ErrorScreen
        error={catalog.rootsError}
        title={t("dashboard.error.title")}
        message={t("dashboard.error.loadingCategories")}
      />
    );
  }

  // ============================================================================
  // Display Logic
  // ============================================================================

  const showNode =
    !catalog.nodeLoading &&
    catalog.nodeError == null &&
    catalog.node !== null &&
    !search.active;

  const showCategories =
    !catalog.node &&
    !search.active &&
    !catalog.nodeLoading &&
    !catalog.rootsLoading;

  const showNodeError = catalog.nodeError != null && !search.active;

  const showNodeLoading = catalog.nodeLoading && !search.active;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      className={`dashboard-root theme-${theme}`}
      role="main"
      aria-label={t("dashboard.title")}
    >
      {/* Header Section */}
      <DashboardHeader
        title={t("dashboard.title")}
        subtitle={t("dashboard.subtitle")}
        onSearchToggle={handleSearchToggle}
      />

      {/* Top Navigation Bar */}
      <DashboardTopBar />

      {/* Main Content Area */}
      <main className="dashboard-content" id="main-content">
        {/* Node Details View */}
        {showNode && <NodeDetails />}

        {/* Categories Grid View */}
        {showCategories && (
          <>
            {/* Dashboard Widgets Section */}
            <section
              className="dashboard-widgets-section"
              aria-labelledby="widgets-title"
            >
              <h2 id="widgets-title" className="section-title">
                {t("dashboard.overview", "Dashboard Overview")}
              </h2>
              <DashboardWidgets />
            </section>

            {/* Categories Section */}
            <section
              className="dashboard-main-section"
              aria-labelledby="categories-title"
            >
              <h2 id="categories-title" className="section-title">
                {t("dashboard.categories.title")}
              </h2>

              <p className="section-subtitle">
                {t("dashboard.categories.count", {
                  count: catalog.roots.length,
                })}
              </p>

              <CategoryGrid
                categories={categoryList}
                onCategorySelect={handleCategorySelect}
              />
            </section>
          </>
        )}

        {/* Node Error State */}
        {showNodeError && (
          <ErrorScreen
            error={catalog.nodeError}
            title={t("dashboard.error.nodeTitle")}
            message={t("dashboard.error.nodeMessage")}
          />
        )}

        {/* Node Loading State */}
        {showNodeLoading && (
          <LoadingScreen message={t("dashboard.loading.node")} />
        )}
      </main>

      {/* Search Overlay */}
      {search.active && (
        <SearchOverlay
          isOpen={search.active}
          onClose={handleSearchOverlayClose}
          onResultSelect={handleSearchResultSelect}
        />
      )}

      {/* Quick Chat Feature */}
      <QuickChatButton />
    </div>
  );
};
