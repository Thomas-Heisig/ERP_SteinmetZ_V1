// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/ui/DashboardHeader.tsx

import React from "react";
import { useTranslation } from "react-i18next";

import type { DashboardHeaderProps, HealthStatus, HealthLevel } from "../types";
import { useDashboardLogic } from "../hooks/useDashboardLogic";
import HealthStatusBadge from "../features/health/HealthStatusBadge";
import { getNodeIcon } from "../utils/mapping";
import cls from "../utils/cls";

// ============================================================================
// Type Definitions
// ============================================================================

interface DashboardHeaderState {
  isScrolled: boolean;
  isSearchFocused: boolean;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Maps HealthStatus to HealthLevel for the badge component
 */
function mapStatusToLevel(status: HealthStatus): HealthLevel {
  const statusMap: Record<HealthStatus, HealthLevel> = {
    healthy: "HEALTHY",
    degraded: "DEGRADED",
    unhealthy: "UNHEALTHY",
    checking: "UNKNOWN",
    unknown: "UNKNOWN",
  };

  return statusMap[status] || "UNKNOWN";
}

/**
 * Format last updated timestamp
 */
function formatLastUpdated(timestamp?: string | Date): string {
  if (!timestamp) return "";

  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * DashboardHeader - Main header component for the dashboard
 *
 * Features:
 * - Responsive layout with scroll effects
 * - Health status monitoring
 * - Search functionality
 * - Navigation controls
 * - Accessibility support
 * - Theme integration
 *
 * @component
 * @example
 * ```tsx
 * <DashboardHeader
 *   title="My Dashboard"
 *   subtitle="Welcome back, User"
 *   onSearchToggle={handleSearch}
 *   onMenuToggle={handleMenu}
 *   showHealthStatus={true}
 * />
 * ```
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  actions,
  onSearchToggle,
  onMenuToggle,
  showHealthStatus = true,
  showLastUpdated = false,
  className,
  ...rest
}) => {
  const { t } = useTranslation();
  const { health, navigation } = useDashboardLogic();

  const [state, setState] = React.useState<DashboardHeaderState>({
    isScrolled: false,
    isSearchFocused: false,
  });

  // Scroll effect for header styling
  React.useEffect(() => {
    const handleScroll = () => {
      setState((prev) => ({
        ...prev,
        isScrolled: window.scrollY > 10,
      }));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Health status derived once
  const healthLevel: HealthLevel = mapStatusToLevel(health.healthStatus);

  const lastUpdated = "";

  // Conditional classes for header styling
  const conditionalClasses = [
    state.isScrolled ? "dashboard-header--scrolled" : null,
    state.isSearchFocused ? "dashboard-header--search-focused" : null,
    actions ? "dashboard-header--has-actions" : null,
  ].filter(Boolean) as string[];

  // Optional additional classes
  const extraClasses = className ? [className] : [];

  // Build final className string using cls()
  const headerClasses = cls(
    "dashboard-header",
    ...conditionalClasses,
    ...extraClasses,
    undefined,
  );

  const handleSearchClick = () => {
    onSearchToggle?.();
    setState((prev) => ({ ...prev, isSearchFocused: true }));
  };

  const handleSearchBlur = () => {
    setState((prev) => ({ ...prev, isSearchFocused: false }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "/":
        e.preventDefault();
        onSearchToggle?.();
        break;
      case "Escape":
        if (state.isSearchFocused) {
          handleSearchBlur();
        }
        break;
    }
  };

  return (
    <header
      className={headerClasses}
      role="banner"
      aria-label={t("dashboard.header.ariaLabel")}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {/* Left Section - Branding and Navigation */}
      <div className="dashboard-header__left">
        {/* Menu Toggle (Mobile) */}
        {onMenuToggle && (
          <button
            className="dashboard-header__menu-button"
            onClick={onMenuToggle}
            aria-label={t("dashboard.header.menuToggle")}
            aria-expanded="false"
            aria-haspopup="true"
          >
            <span className="dashboard-header__menu-icon">
              {getNodeIcon("CUSTOM", "emoji")}
            </span>
          </button>
        )}

        {/* Title Section */}
        <div className="dashboard-header__title-section">
          <h1 className="dashboard-header__title">
            {title ?? t("dashboard.title")}
          </h1>

          {(subtitle || lastUpdated) && (
            <div className="dashboard-header__subtitle-section">
              {subtitle && (
                <span className="dashboard-header__subtitle">{subtitle}</span>
              )}

              {lastUpdated && (
                <span
                  className="dashboard-header__last-updated"
                  title={t("dashboard.header.lastUpdated")}
                >
                  {t("dashboard.header.updatedAt", { time: lastUpdated })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center Section - Additional Info (Desktop) */}
      <div className="dashboard-header__center">
        {navigation.currentView !== "root" && (
          <nav
            className="dashboard-header__breadcrumb"
            aria-label={t("dashboard.header.breadcrumb")}
          >
            <span className="dashboard-header__breadcrumb-item">
              {t("dashboard.title")}
            </span>
            <span
              className="dashboard-header__breadcrumb-separator"
              aria-hidden="true"
            >
              /
            </span>
            <span className="dashboard-header__breadcrumb-current">
              {navigation.currentView}
            </span>
          </nav>
        )}
      </div>

      {/* Right Section - Actions and Controls */}
      <div className="dashboard-header__right">
        {/* Health Status */}
        {showHealthStatus && (
          <div className="dashboard-header__health">
            <HealthStatusBadge
              status={healthLevel}
              size="SMALL"
              showText={false}
              aria-label={t("dashboard.header.healthStatus", {
                status: health.healthStatus,
              })}
            />
            <span className="dashboard-header__health-text">
              {t(`dashboard.health.status.${health.healthStatus}`)}
            </span>
          </div>
        )}

        {/* Search Toggle */}
        {onSearchToggle && (
          <button
            className="dashboard-header__search-button"
            onClick={handleSearchClick}
            onBlur={handleSearchBlur}
            aria-label={t("dashboard.header.searchToggle")}
            title={t("dashboard.header.searchShortcut", { shortcut: "/" })}
          >
            <span className="dashboard-header__search-icon">
              {getNodeIcon("CUSTOM", "emoji")}
            </span>
            <span className="dashboard-header__search-text">
              {t("dashboard.search.button")}
            </span>
            <kbd className="dashboard-header__search-shortcut">/</kbd>
          </button>
        )}

        {/* Additional Actions */}
        {actions && <div className="dashboard-header__actions">{actions}</div>}

        {/* User Menu (Placeholder) */}
        <div className="dashboard-header__user">
          <button
            className="dashboard-header__user-button"
            aria-label={t("dashboard.header.userMenu")}
            aria-haspopup="true"
          >
            <span className="dashboard-header__user-avatar">
              {getNodeIcon("ROOT", "emoji")}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

// ============================================================================
// Display Name
// ============================================================================

DashboardHeader.displayName = "DashboardHeader";

export default DashboardHeader;
