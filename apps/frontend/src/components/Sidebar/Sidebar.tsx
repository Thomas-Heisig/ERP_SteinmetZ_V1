// SPDX-License-Identifier: MIT
// apps/frontend/src/components/Sidebar/Sidebar.tsx

import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: "Hauptbereich",
    items: [
      { path: "/", label: "Dashboard", icon: "🏠" },
      { path: "/catalog", label: "Funktionskatalog", icon: "🧭" },
      { path: "/calendar", label: "Kalender", icon: "📅" },
      { path: "/communication", label: "Kommunikation", icon: "📡" },
    ],
  },
  {
    title: "Geschäftsprozesse",
    items: [
      { path: "/crm", label: "Kunden (CRM)", icon: "🤝" },
      { path: "/finance", label: "Finanzen", icon: "💰" },
      { path: "/hr", label: "Personal", icon: "👥" },
      { path: "/inventory", label: "Lager", icon: "📦" },
      { path: "/projects", label: "Projekte", icon: "🎯" },
      { path: "/documents", label: "Dokumente", icon: "📄" },
    ],
  },
  {
    title: "KI & Automatisierung",
    items: [
      { path: "/ai", label: "AI-Annotator", icon: "🤖" },
      { path: "/batch-processing", label: "Batch-Verarbeitung", icon: "⚙️" },
      { path: "/quality-dashboard", label: "Qualität", icon: "✅" },
      { path: "/model-management", label: "Modelle", icon: "🎯" },
      { path: "/advanced-filters", label: "Filter", icon: "🔍" },
    ],
  },
  {
    title: "Sonstiges",
    items: [
      { path: "/innovation", label: "Innovation", icon: "💡" },
      { path: "/help", label: "Hilfe", icon: "❓" },
      { path: "/settings", label: "Einstellungen", icon: "⚙️" },
    ],
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
}) => {
  return (
    <aside className={`app-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <button
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
          title={isCollapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
        >
          {isCollapsed ? "▶" : "◀"}
        </button>
        {!isCollapsed && <h2 className="sidebar-title">Navigation</h2>}
      </div>

      {/* Navigation Sections */}
      <nav className="sidebar-nav" aria-label="Sidebar Navigation">
        {navigationSections.map((section) => (
          <div key={section.title} className="sidebar-section">
            {!isCollapsed && (
              <h3 className="sidebar-section-title">{section.title}</h3>
            )}
            <ul className="sidebar-items">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? "active" : ""}`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="sidebar-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <>
                        <span className="sidebar-label">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="sidebar-badge">{item.badge}</span>
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
        <div className="sidebar-footer">
          <div className="sidebar-info">
            <small>ERP SteinmetZ</small>
            <small>Version 2.0.0</small>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
