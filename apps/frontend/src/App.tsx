// SPDX-License-Identifier: MIT
// apps/frontend/src/App.tsx

import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { useTheme, type Theme } from "./contexts/ThemeContext";
import { useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./components/LanguageSwitch/LanguageProvider";
import { LanguageSwitcher } from "./components/LanguageSwitch/LanguageSwitcher";
import { MainNavigation } from "./components/Navigation/MainNavigation";
import { useLocation } from "react-router-dom";

import { UnifiedQuickChat, UnifiedQuickChatProvider } from "./components/QuickChat";
import { VERSION_INFO } from "./version";

/* ---------------------------------------------------------
   Theme-Toggle Component
--------------------------------------------------------- */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const THEMES: readonly Theme[] = [
    "light",
    "dark",
    "lcars",
    "contrast",
  ] as const;

  const getThemeIcon = (t: Theme): string => {
    switch (t) {
      case "light":
        return "☀️";
      case "dark":
        return "🌙";
      case "lcars":
        return "🚀";
      case "contrast":
        return "◐";
      default:
        return "⚙️";
    }
  };

  const currentIndex = THEMES.indexOf(theme);
  const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Theme wechseln zu: ${nextTheme}`}
      title={`Aktuelles Theme: ${theme}`}
      type="button"
    >
      <span className="theme-icon" aria-hidden="true">
        {getThemeIcon(theme)}
      </span>
      <span className="theme-label">
        {theme.charAt(0).toUpperCase() + theme.slice(1)}
      </span>
    </button>
  );
}

/* ---------------------------------------------------------
   Main App Component
--------------------------------------------------------- */
export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <UnifiedQuickChatProvider>
      <LanguageProvider>
        <div className="app-container">
          {/* ---------- Header ---------- */}
          <header className="app-header">
            {/* Branding */}
            <div className="app-brand" aria-label="ERP SteinmetZ Dashboard">
              <button
                className="sidebar-menu-button"
                onClick={handleToggleSidebar}
                aria-label="Toggle Sidebar"
                title={
                  isSidebarCollapsed ? "Sidebar ausklappen" : "Sidebar einklappen"
                }
              >
                ☰
              </button>
              <span className="brand-icon" aria-hidden="true">
                🧱
              </span>
              <strong className="brand-name">ERP SteinmetZ</strong>
              <span className="brand-subtitle">Dashboard</span>
            </div>

            {/* Controls */}
            <div className="header-controls">
              <LanguageSwitcher />
              <ThemeToggle />

              {/* User Menu */}
              {isAuthenticated && user && (
                <div className="user-menu">
                  <span className="user-name">{user.username}</span>
                  <button
                    className="logout-button"
                    onClick={handleLogout}
                    aria-label="Abmelden"
                    title="Abmelden"
                  >
                    🚪
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* ---------- Main Navigation ---------- */}
          {isAuthenticated && (
            <MainNavigation
              collapsed={isSidebarCollapsed}
              onCollapsedChange={setIsSidebarCollapsed}
              onNavigate={(path) => navigate(path)}
              activePath={location.pathname}
              searchEnabled={true}
              favoritesEnabled={true}
            />
          )}

          {/* ---------- Main ---------- */}
          <main
            className={`app-main ${isAuthenticated ? "with-sidebar" : ""} ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
          >
            <Outlet />
          </main>

          {/* ---------- Footer + QuickChat ---------- */}
          <footer className="app-footer">
            <small>
              © {new Date().getFullYear()} ERP SteinmetZ | v{VERSION_INFO.version}{" "}
              ({VERSION_INFO.environment})
            </small>
          </footer>

          {/* QuickChat with floating button - always visible */}
          <UnifiedQuickChat 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)}
            onOpen={() => setIsChatOpen(true)}
          />
        </div>
      </LanguageProvider>
    </UnifiedQuickChatProvider>
  );
}
