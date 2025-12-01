// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/ui/DashboardTopBar.tsx

import React, { useCallback, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardLogic } from "../hooks/useDashboardLogic";
import { useDashboardNavigation } from "../hooks/useDashboardNavigation";
import { getNodeIcon } from "../utils/mapping";
import { debounce } from "../utils/debounce";
import cls from "../utils/cls";

// ============================================================================
// Type Definitions
// ============================================================================

interface DashboardTopBarProps {
  /** Whether to show the search input */
  showSearch?: boolean;
  /** Whether to show navigation controls */
  showNavigation?: boolean;
  /** Whether to show view mode controls */
  showViewModes?: boolean;
  /** Whether to show filter controls */
  showFilters?: boolean;
  /** Custom CSS class name */
  className?: string;
}

interface DashboardTopBarState {
  isSearchFocused: boolean;
  isFiltersOpen: boolean;
  activeViewMode: "grid" | "list" | "table";
  activeFilter: string | null;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * DashboardTopBar - Top functional bar with search, filters, and navigation
 *
 * Features:
 * - Advanced search with debouncing
 * - Filter controls with dropdown
 * - Navigation controls (back/forward)
 * - View mode switching
 * - Responsive design
 * - Accessibility support
 *
 * @component
 * @example
 * ```tsx
 * <DashboardTopBar
 *   showSearch={true}
 *   showNavigation={true}
 *   showViewModes={true}
 *   showFilters={true}
 * />
 * ```
 */
const DashboardTopBar: React.FC<DashboardTopBarProps> = ({
  showSearch = true,
  showNavigation = true,
  showViewModes = false,
  showFilters = true,
  className,
}) => {
  const { t } = useTranslation();
  const { search, navigation } = useDashboardLogic();
  const { goBack, goForward, canGoBack, canGoForward } =
    useDashboardNavigation();

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<DashboardTopBarState>({
    isSearchFocused: false,
    isFiltersOpen: false,
    activeViewMode: "grid",
    activeFilter: null,
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      search.search(query);
    }, 300),
    [search],
  );

  const handleSearchChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const query = ev.target.value;
      debouncedSearch(query);
    },
    [debouncedSearch],
  );

  const handleSearchFocus = () => {
    setState((prev) => ({ ...prev, isSearchFocused: true }));
  };

  const handleSearchBlur = () => {
    setState((prev) => ({ ...prev, isSearchFocused: false }));
  };

  const handleSearchClear = () => {
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
      search.clearSearch();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Escape":
        if (state.isSearchFocused) {
          searchInputRef.current?.blur();
        }
        if (state.isFiltersOpen) {
          setState((prev) => ({ ...prev, isFiltersOpen: false }));
        }
        break;
      case "ArrowLeft":
        if (e.ctrlKey && canGoBack) {
          e.preventDefault();
          goBack();
        }
        break;
      case "ArrowRight":
        if (e.ctrlKey && canGoForward) {
          e.preventDefault();
          goForward();
        }
        break;
    }
  };

  const toggleFilters = () => {
    setState((prev) => ({ ...prev, isFiltersOpen: !prev.isFiltersOpen }));
  };

  const handleViewModeChange = (mode: "grid" | "list" | "table") => {
    setState((prev) => ({ ...prev, activeViewMode: mode }));
    // TODO: Implement view mode change logic
  };

  const handleFilterSelect = (filter: string) => {
    setState((prev) => ({
      ...prev,
      activeFilter: filter,
      isFiltersOpen: false,
    }));
    // TODO: Implement filter logic
  };

  const topBarClasses = cls(
    "dashboard-top-bar",
    {
      "dashboard-top-bar--search-focused": state.isSearchFocused,
      "dashboard-top-bar--filters-open": state.isFiltersOpen,
      "dashboard-top-bar--has-query": search.query.length > 0,
    },
    className,
    undefined,
  );

  return (
    <section
      className={topBarClasses}
      role="toolbar"
      aria-label={t("dashboard.topBar.ariaLabel")}
      onKeyDown={handleKeyDown}
    >
      {/* Left Section - Navigation Controls */}
      <div className="dashboard-top-bar__left">
        {showNavigation && (
          <div className="dashboard-top-bar__nav-buttons">
            <button
              className={cls(
                "dashboard-top-bar__nav-button",
                {
                  "dashboard-top-bar__nav-button--disabled": !canGoBack,
                },
                undefined,
              )}
              onClick={goBack}
              disabled={!canGoBack}
              aria-label={t("dashboard.topBar.navigation.back")}
              title={t("dashboard.topBar.navigation.backTitle")}
            >
              <span className="dashboard-top-bar__nav-icon">
                {getNodeIcon("CUSTOM", "emoji")}
              </span>
            </button>
            <button
              className={cls(
                "dashboard-top-bar__nav-button",
                {
                  "dashboard-top-bar__nav-button--disabled": !canGoForward,
                },
                undefined,
              )}
              onClick={goForward}
              disabled={!canGoForward}
              aria-label={t("dashboard.topBar.navigation.forward")}
              title={t("dashboard.topBar.navigation.forwardTitle")}
            >
              <span className="dashboard-top-bar__nav-icon">
                {getNodeIcon("CUSTOM", "emoji")}
              </span>
            </button>
          </div>
        )}

        {/* Breadcrumb for current context */}
        {navigation.currentView !== "root" && (
          <nav
            className="dashboard-top-bar__breadcrumb"
            aria-label={t("dashboard.topBar.breadcrumb")}
          >
            <span className="dashboard-top-bar__breadcrumb-text">
              {navigation.currentView}
            </span>
          </nav>
        )}
      </div>

      {/* Center Section - Search */}
      {/* Center Section - Search */}
      <div className="dashboard-top-bar__center">
        {showSearch && (
          <>
            <div className="dashboard-top-bar__search">
              <span
                className="dashboard-top-bar__search-icon"
                aria-hidden="true"
              >
                {getNodeIcon("CUSTOM", "emoji")}
              </span>

              <input
                ref={searchInputRef}
                type="text"
                className="dashboard-top-bar__search-input"
                placeholder={t("dashboard.search.placeholder")}
                defaultValue={search.query}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                aria-label={t("dashboard.search.ariaLabel")}
              />

              {search.query && (
                <button
                  className="dashboard-top-bar__search-clear"
                  onClick={handleSearchClear}
                  aria-label={t("dashboard.search.clear")}
                >
                  <span aria-hidden="true">×</span>
                </button>
              )}
            </div>

            {/* Search results info */}
            {search.results.length > 0 && (
              <div className="dashboard-top-bar__search-info">
                {t("dashboard.search.resultsCount", {
                  count: search.results.length,
                })}
              </div>
            )}
          </>
        )}
      </div>
      {/* Right Section - Controls */}
      {/* Right Section - Controls */}
      <div className="dashboard-top-bar__right">
        {/* View Mode Switcher */}
        {showViewModes && (
          <div className="dashboard-top-bar__view-buttons">
            <button
              className={cls(
                "dashboard-top-bar__view-button",
                {
                  "dashboard-top-bar__view-button--active":
                    state.activeViewMode === "grid",
                },
                undefined,
              )}
              onClick={() => handleViewModeChange("grid")}
              aria-label={t("dashboard.topBar.viewMode.grid")}
              aria-pressed={state.activeViewMode === "grid"}
            >
              {getNodeIcon("CUSTOM", "emoji")}
            </button>
            <button
              className={cls(
                "dashboard-top-bar__view-button",
                {
                  "dashboard-top-bar__view-button--active":
                    state.activeViewMode === "list",
                },
                undefined,
              )}
              onClick={() => handleViewModeChange("list")}
              aria-label={t("dashboard.topBar.viewMode.list")}
              aria-pressed={state.activeViewMode === "list"}
            >
              {getNodeIcon("CUSTOM", "emoji")}
            </button>
            <button
              className={cls(
                "dashboard-top-bar__view-button",
                {
                  "dashboard-top-bar__view-button--active":
                    state.activeViewMode === "table",
                },
                undefined,
              )}
              onClick={() => handleViewModeChange("table")}
              aria-label={t("dashboard.topBar.viewMode.table")}
              aria-pressed={state.activeViewMode === "table"}
            >
              {getNodeIcon("CUSTOM", "emoji")}
            </button>
          </div>
        )}

        {/* Filter Controls */}
        {showFilters && (
          <>
            <button
              className={cls(
                "dashboard-top-bar__filter-button",
                {
                  "dashboard-top-bar__filter-button--active":
                    state.isFiltersOpen || !!state.activeFilter,
                },
                undefined,
              )}
              onClick={toggleFilters}
              aria-label={t("dashboard.topBar.filters.toggle")}
              aria-expanded={state.isFiltersOpen}
              aria-haspopup="true"
            >
              <span className="dashboard-top-bar__filter-icon">
                {getNodeIcon("CUSTOM", "emoji")}
              </span>
              <span className="dashboard-top-bar__filter-text">
                {t("dashboard.search.filter")}
              </span>
              {state.activeFilter && (
                <span
                  className="dashboard-top-bar__filter-badge"
                  aria-label={t("dashboard.topBar.filters.active", {
                    filter: state.activeFilter,
                  })}
                >
                  1
                </span>
              )}
            </button>

            {/* Filter Dropdown */}
            {state.isFiltersOpen && (
              <div className="dashboard-top-bar__filter-dropdown" role="menu">
                <button
                  className={cls(
                    "dashboard-top-bar__filter-option",
                    {
                      "dashboard-top-bar__filter-option--active":
                        state.activeFilter === "category",
                    },
                    undefined,
                  )}
                  onClick={() => handleFilterSelect("category")}
                  role="menuitem"
                >
                  {t("dashboard.filters.category")}
                </button>

                <button
                  className={cls(
                    "dashboard-top-bar__filter-option",
                    {
                      "dashboard-top-bar__filter-option--active":
                        state.activeFilter === "type",
                    },
                    undefined,
                  )}
                  onClick={() => handleFilterSelect("type")}
                  role="menuitem"
                >
                  {t("dashboard.filters.type")}
                </button>

                <button
                  className={cls(
                    "dashboard-top-bar__filter-option",
                    {
                      "dashboard-top-bar__filter-option--active":
                        state.activeFilter === "date",
                    },
                    undefined,
                  )}
                  onClick={() => handleFilterSelect("date")}
                  role="menuitem"
                >
                  {t("dashboard.filters.date")}
                </button>

                <button
                  className={cls(
                    "dashboard-top-bar__filter-option",
                    {
                      "dashboard-top-bar__filter-option--active":
                        state.activeFilter === "tag",
                    },
                    undefined,
                  )}
                  onClick={() => handleFilterSelect("tag")}
                  role="menuitem"
                >
                  {t("dashboard.filters.tag")}
                </button>
              </div>
            )}
          </>
        )}
        <button
          className="dashboard-top-bar__action-button"
          aria-label={t("dashboard.topBar.actions.more")}
          title={t("dashboard.topBar.actions.more")}
        >
          <span className="dashboard-top-bar__action-icon">
            {getNodeIcon("CUSTOM", "emoji")}
          </span>
        </button>
      </div>
    </section>
  );
};

// ============================================================================
// Display Name
// ============================================================================

DashboardTopBar.displayName = "DashboardTopBar";

export default DashboardTopBar;
