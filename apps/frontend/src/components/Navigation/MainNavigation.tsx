// SPDX-License-Identifier: MIT
// apps/frontend/src/components/Navigation/MainNavigation.tsx
/**
 * @module MainNavigation
 * @description Hauptnavigation für alle ERP-Module
 */

import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { navigationStructure } from "./navigationConfig";
import type { NavigationItem } from "./navigationConfig";
import "./MainNavigation.css";

export type { NavigationItem } from "./navigationConfig";

interface MainNavigationProps {
  collapsed?: boolean;
  onNavigate?: (path: string) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
  activePath?: string;
  searchEnabled?: boolean;
  favoritesEnabled?: boolean;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({
  collapsed = false,
  onNavigate,
  onCollapsedChange,
  activePath,
  searchEnabled = false,
  favoritesEnabled = false,
}) => {
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["dashboard"]),
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [manualActiveItem, setManualActiveItem] = useState<string | null>(null);

  // Compute active item based on activePath prop or manual selection
  const activeItem = useMemo(() => {
    // If user manually selected an item, use that
    if (manualActiveItem) return manualActiveItem;

    // Otherwise compute from activePath
    if (!activePath) return "dashboard";

    const findItemByPath = (
      items: NavigationItem[],
      path: string,
    ): string | null => {
      for (const item of items) {
        if (item.path === path) return item.id;
        if (item.children) {
          const found = findItemByPath(item.children, path);
          if (found) return found;
        }
      }
      return null;
    };

    return findItemByPath(navigationStructure, activePath) ?? "dashboard";
  }, [activePath, manualActiveItem]);

  const toggleExpand = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const handleItemClick = useCallback(
    (item: NavigationItem) => {
      setManualActiveItem(item.id);
      if (item.children && item.children.length > 0) {
        toggleExpand(item.id);
      } else {
        onNavigate?.(item.path);
      }
    },
    [onNavigate, toggleExpand],
  );

  const handleToggleCollapse = useCallback(() => {
    onCollapsedChange?.(!collapsed);
  }, [collapsed, onCollapsedChange]);

  // Render navigation item - using function declaration for proper recursion
  const renderNavItem = (
    item: NavigationItem,
    level: number = 0,
  ): React.ReactElement => {
    const isExpanded = expandedItems.has(item.id);
    const isActive = activeItem === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isFavorite = favorites.has(item.id);

    const levelClass = level > 0 ? `level-${level}` : "";
    const activeClass = isActive ? "active" : "";

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          className={`nav-item ${levelClass} ${activeClass}`}
          {...(hasChildren ? { "aria-expanded": isExpanded } : {})}
          aria-current={isActive ? "page" : undefined}
          title={collapsed ? t(item.label) : undefined}
        >
          <div className="nav-item-content">
            <span className="nav-item-icon" aria-hidden="true">
              {item.icon}
            </span>
            {!collapsed && (
              <>
                <span className="nav-item-label">{t(item.label)}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className="nav-item-badge"
                    aria-label={`${item.badge} notifications`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.isNew && (
                  <span className="nav-item-badge nav-item-badge-new">NEW</span>
                )}
                {item.isBeta && (
                  <span className="nav-item-badge nav-item-badge-beta">
                    BETA
                  </span>
                )}
                {favoritesEnabled && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="nav-item-favorite"
                    aria-label={
                      isFavorite ? "Remove from favorites" : "Add to favorites"
                    }
                    title={
                      isFavorite ? "Remove from favorites" : "Add to favorites"
                    }
                  >
                    {isFavorite ? "⭐" : "☆"}
                  </span>
                )}
              </>
            )}
          </div>
          {!collapsed && hasChildren && (
            <span
              className={`nav-item-expand ${isExpanded ? "expanded" : ""}`}
              aria-hidden="true"
            >
              ▶
            </span>
          )}
        </button>

        {!collapsed && hasChildren && isExpanded && item.children && (
          <div className="nav-item-children">
            {item.children.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return navigationStructure;

    const filterItems = (items: NavigationItem[]): NavigationItem[] => {
      return items.reduce<NavigationItem[]>((acc, item) => {
        const matchesSearch = t(item.label)
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const filteredChildren = item.children
          ? filterItems(item.children)
          : [];

        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...item,
            children:
              filteredChildren.length > 0 ? filteredChildren : item.children,
          });
        }
        return acc;
      }, []);
    };

    return filterItems(navigationStructure);
  }, [searchQuery, t]);

  return (
    <nav
      className={`main-navigation app-sidebar ${collapsed ? "collapsed" : "expanded"}`}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Header */}
        <div
          className={`main-navigation-header ${collapsed ? "collapsed" : ""}`}
        >
          {collapsed ? (
            <div className="main-navigation-logo">🧱</div>
          ) : (
            <>
              <h1 className="main-navigation-title">Steinmetz ERP</h1>
              {onCollapsedChange && (
                <button
                  onClick={handleToggleCollapse}
                  className="nav-collapse-toggle"
                  aria-label="Toggle navigation"
                  title="Navigation ein-/ausklappen"
                >
                  {collapsed ? "→" : "←"}
                </button>
              )}
            </>
          )}
        </div>

        {/* Search Bar */}
        {!collapsed && searchEnabled && (
          <div className="main-navigation-search">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("navigation.search", "Suche...")}
              className="nav-search-input"
              aria-label="Navigation durchsuchen"
            />
          </div>
        )}

        {/* Navigation Items */}
        <div className="main-navigation-content">
          {filteredItems.map((item) => renderNavItem(item))}
        </div>

        {/* Footer */}
        <div className="main-navigation-footer">
          {!collapsed && (
            <>
              <div className="main-navigation-version">Version 0.3.0</div>
              <div className="main-navigation-copyright">
                © {new Date().getFullYear()} Steinmetz ERP
              </div>
            </>
          )}
          {collapsed && onCollapsedChange && (
            <button
              onClick={handleToggleCollapse}
              className="nav-collapse-toggle-small"
              aria-label="Navigation erweitern"
              title="Navigation erweitern"
            >
              →
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;
