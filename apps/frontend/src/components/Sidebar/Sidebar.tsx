// SPDX-License-Identifier: MIT
// apps/frontend/src/components/Sidebar/Sidebar.tsx

import React, { useCallback } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./Sidebar.module.css";

export interface NavItem {
  path: string;
  labelKey: string;
  icon: string;
  badge?: number;
}

export interface NavSection {
  titleKey: string;
  items: NavItem[];
}

/**
 * Navigation structure based on ERP SteinmetZ function overview
 * Organized by business domains according to docs/concept/_ERP SteinmetZ_FUNKTIONEN.md
 */
const getNavigationSections = (): NavSection[] => [
  {
    titleKey: "sidebar.main",
    items: [
      { path: "/", labelKey: "sidebar.dashboard", icon: "🏠" },
      { path: "/catalog", labelKey: "sidebar.catalog", icon: "🧭" },
      { path: "/calendar", labelKey: "sidebar.calendar", icon: "📅" },
    ],
  },
  {
    titleKey: "sidebar.business",
    items: [
      { path: "/company", labelKey: "sidebar.company", icon: "🏢" },
      { path: "/processes", labelKey: "sidebar.processes", icon: "📋" },
      { path: "/risk", labelKey: "sidebar.risk", icon: "🛡️" },
    ],
  },
  {
    titleKey: "sidebar.finance",
    items: [
      { path: "/accounting", labelKey: "sidebar.accounting", icon: "💳" },
      { path: "/controlling", labelKey: "sidebar.controlling", icon: "📊" },
      { path: "/treasury", labelKey: "sidebar.treasury", icon: "🏦" },
      { path: "/taxes", labelKey: "sidebar.taxes", icon: "📋" },
    ],
  },
  {
    titleKey: "sidebar.sales",
    items: [
      { path: "/crm", labelKey: "sidebar.crm", icon: "🤝" },
      { path: "/marketing", labelKey: "sidebar.marketing", icon: "📈" },
      { path: "/sales", labelKey: "sidebar.sales", icon: "💰" },
      { path: "/fulfillment", labelKey: "sidebar.fulfillment", icon: "🚚" },
    ],
  },
  {
    titleKey: "sidebar.procurement",
    items: [
      { path: "/purchasing", labelKey: "sidebar.purchasing", icon: "📋" },
      { path: "/receiving", labelKey: "sidebar.receiving", icon: "📦" },
      { path: "/suppliers", labelKey: "sidebar.suppliers", icon: "🤝" },
    ],
  },
  {
    titleKey: "sidebar.production",
    items: [
      { path: "/planning", labelKey: "sidebar.planning", icon: "🏗️" },
      { path: "/manufacturing", labelKey: "sidebar.manufacturing", icon: "⚙️" },
      { path: "/quality", labelKey: "sidebar.quality", icon: "✅" },
      { path: "/maintenance", labelKey: "sidebar.maintenance", icon: "🔧" },
    ],
  },
  {
    titleKey: "sidebar.warehouse",
    items: [
      { path: "/inventory", labelKey: "sidebar.inventory", icon: "🏪" },
      { path: "/picking", labelKey: "sidebar.picking", icon: "📦" },
      { path: "/logistics", labelKey: "sidebar.logistics", icon: "🚛" },
    ],
  },
  {
    titleKey: "sidebar.hr",
    items: [
      { path: "/personnel", labelKey: "sidebar.personnel", icon: "👤" },
      { path: "/time-tracking", labelKey: "sidebar.timeTracking", icon: "⏱️" },
      { path: "/development", labelKey: "sidebar.development", icon: "📈" },
      { path: "/recruiting", labelKey: "sidebar.recruiting", icon: "💼" },
    ],
  },
  {
    titleKey: "sidebar.reporting",
    items: [
      { path: "/reports", labelKey: "sidebar.reports", icon: "📈" },
      { path: "/adhoc", labelKey: "sidebar.adhoc", icon: "🔍" },
      { path: "/ai-analytics", labelKey: "sidebar.aiAnalytics", icon: "🤖" },
    ],
  },
  {
    titleKey: "sidebar.communication",
    items: [
      { path: "/email", labelKey: "sidebar.email", icon: "📧" },
      { path: "/messaging", labelKey: "sidebar.messaging", icon: "💬" },
      { path: "/social", labelKey: "sidebar.social", icon: "📱" },
    ],
  },
  {
    titleKey: "sidebar.ai",
    items: [
      { path: "/ai", labelKey: "sidebar.aiAnnotator", icon: "🤖" },
      {
        path: "/batch-processing",
        labelKey: "sidebar.batchProcessing",
        icon: "⚙️",
      },
      {
        path: "/quality-dashboard",
        labelKey: "sidebar.qualityDashboard",
        icon: "✅",
      },
      {
        path: "/model-management",
        labelKey: "sidebar.modelManagement",
        icon: "🎯",
      },
      {
        path: "/advanced-filters",
        labelKey: "sidebar.advancedFilters",
        icon: "🔍",
      },
    ],
  },
  {
    titleKey: "sidebar.system",
    items: [
      { path: "/users", labelKey: "sidebar.users", icon: "👥" },
      { path: "/settings", labelKey: "sidebar.settings", icon: "⚙️" },
      {
        path: "/system-settings",
        labelKey: "sidebar.systemSettings",
        icon: "⚙️",
      },
      { path: "/integrations", labelKey: "sidebar.integrations", icon: "🔌" },
    ],
  },
  {
    titleKey: "sidebar.misc",
    items: [
      { path: "/projects", labelKey: "sidebar.projects", icon: "🎯" },
      { path: "/documents", labelKey: "sidebar.documents", icon: "📄" },
      { path: "/innovation", labelKey: "sidebar.innovation", icon: "💡" },
      { path: "/help", labelKey: "sidebar.help", icon: "❓" },
      { path: "/settings", labelKey: "sidebar.settings", icon: "⚙️" },
    ],
  },
];

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  isOpen = false,
}) => {
  const { t } = useTranslation();
  const navigationSections = getNavigationSections();

  const handleToggle = useCallback(() => {
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  }, [onToggleCollapse]);

  const sidebarClasses = [
    styles.sidebar,
    isCollapsed && styles.collapsed,
    isOpen && styles.open,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={sidebarClasses}>
      {/* Sidebar Header */}
      <div className={styles.header}>
        <button
          className={styles.toggle}
          onClick={handleToggle}
          aria-label={t(isCollapsed ? "sidebar.expand" : "sidebar.collapse")}
          title={t(isCollapsed ? "sidebar.expand" : "sidebar.collapse")}
        >
          {isCollapsed ? "▶" : "◀"}
        </button>
        {!isCollapsed && <h2 className={styles.title}>{t("sidebar.title")}</h2>}
      </div>

      {/* Navigation Sections */}
      <nav className={styles.nav} aria-label={t("sidebar.title")}>
        {navigationSections.map((section) => (
          <div key={section.titleKey} className={styles.section}>
            {!isCollapsed && (
              <h3 className={styles.sectionTitle}>{t(section.titleKey)}</h3>
            )}
            <ul className={styles.items}>
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `${styles.link} ${isActive ? styles.active : ""}`
                    }
                    title={isCollapsed ? t(item.labelKey) : undefined}
                  >
                    <span className={styles.icon} aria-hidden="true">
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <>
                        <span className={styles.label}>{t(item.labelKey)}</span>
                        {item.badge !== undefined && (
                          <span className={styles.badge}>{item.badge}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className={styles.footer}>
          <div className={styles.info}>
            <small>ERP SteinmetZ</small>
            <small>{t("sidebar.version")} 2.0.0</small>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
