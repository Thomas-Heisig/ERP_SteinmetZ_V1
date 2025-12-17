// SPDX-License-Identifier: MIT
// apps/frontend/src/components/Sidebar/Sidebar.tsx

import React, { useEffect, useState } from "react";
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

interface SystemStatus {
  cpu: number;
  memory: string;
  uptime: number;
}

interface QuickAction {
  label: string;
  icon: string;
  action: () => void;
  color?: string;
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
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [recentItems] = useState<string[]>([
    "Rechnung #1234",
    "Kunde Schmidt GmbH",
    "Projekt Alpha",
  ]);

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/dashboard/health`,
        );
        const data = await response.json();
        setSystemStatus({
          cpu: data.loadavg?.[0] || 0,
          memory: data.memory?.free || "N/A",
          uptime: data.uptime || 0,
        });
      } catch (error) {
        console.error("Failed to fetch system status:", error);
      }
    };

    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const quickActions: QuickAction[] = [
    {
      label: "Neue Rechnung",
      icon: "📄",
      action: () => (window.location.href = "/finance"),
      color: "#4CAF50",
    },
    {
      label: "Neuer Kunde",
      icon: "👤",
      action: () => (window.location.href = "/crm"),
      color: "#2196F3",
    },
    {
      label: "Schnellsuche",
      icon: "🔍",
      action: () => {
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="search"]',
        );
        searchInput?.focus();
      },
      color: "#FF9800",
    },
  ];

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

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

      {/* Quick Actions Section */}
      {!isCollapsed && (
        <div className="sidebar-section sidebar-quick-actions">
          <h3 className="sidebar-section-title">Schnellaktionen</h3>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn"
                onClick={action.action}
                style={{ borderLeftColor: action.color }}
                title={action.label}
              >
                <span className="quick-action-icon">{action.icon}</span>
                <span className="quick-action-label">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Items Section */}
      {!isCollapsed && recentItems.length > 0 && (
        <div className="sidebar-section sidebar-recent">
          <h3 className="sidebar-section-title">Kürzlich verwendet</h3>
          <ul className="recent-items-list">
            {recentItems.map((item, index) => (
              <li key={index} className="recent-item">
                <span className="recent-item-icon">📌</span>
                <span className="recent-item-text">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* System Status Section */}
      {!isCollapsed && systemStatus && (
        <div className="sidebar-section sidebar-system-status">
          <h3 className="sidebar-section-title">Systemstatus</h3>
          <div className="system-status-grid">
            <div className="status-item">
              <span className="status-label">CPU Last</span>
              <span className="status-value">
                {systemStatus.cpu.toFixed(2)}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">RAM frei</span>
              <span className="status-value">{systemStatus.memory}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Laufzeit</span>
              <span className="status-value">
                {formatUptime(systemStatus.uptime)}
              </span>
            </div>
          </div>
        </div>
      )}

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
