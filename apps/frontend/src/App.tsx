// SPDX-License-Identifier: MIT
// apps/frontend/src/App.tsx

import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { useTheme, type Theme } from "./contexts/ThemeContext";
import { useAuth } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { LanguageProvider } from "./components/LanguageSwitch/LanguageProvider";
import { LanguageSwitcher } from "./components/LanguageSwitch/LanguageSwitcher";
import { MainNavigation } from "./components/Navigation/MainNavigation";
import { useLocation } from "react-router-dom";

import {
  UnifiedQuickChat,
  UnifiedQuickChatProvider,
} from "./components/QuickChat";
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
  const [redisStatus, setRedisStatus] = useState<{
    connected: boolean;
    usingFallback: boolean;
  } | null>(null);
  const [backendReady, setBackendReady] = useState(false);
  const [backendAttempts, setBackendAttempts] = useState(0);
  const [backendError, setBackendError] = useState<string | null>(null);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch Redis status periodically
  useEffect(() => {
    const fetchRedisStatus = async () => {
      try {
        const response = await fetch("/api/health");
        if (response.ok) {
          const data = await response.json();
          if (data.details?.redis) {
            setRedisStatus(data.details.redis);
          }
        }
      } catch (error) {
        console.error("Failed to fetch Redis status:", error);
      }
    };

    fetchRedisStatus();
    const interval = setInterval(fetchRedisStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Backend reachability check with retry/backoff
  useEffect(() => {
    let cancelled = false;

    const pingBackend = async (attempt: number) => {
      if (cancelled || backendReady) return;
      setBackendAttempts(attempt);
      try {
        const response = await fetch("/api/health", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        setBackendReady(true);
        setBackendError(null);
        return;
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "Unbekannter Fehler";
        setBackendError(message);
        setBackendReady(false);
        const delay = Math.min(3000, 300 * attempt);
        setTimeout(() => void pingBackend(attempt + 1), delay);
      }
    };

    void pingBackend(1);

    return () => {
      cancelled = true;
    };
  }, [backendReady]);

  const handleManualRetry = () => {
    setBackendReady(false);
    setBackendAttempts(0);
    setBackendError(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <SettingsProvider>
      <UnifiedQuickChatProvider>
        <LanguageProvider>
          <div className="app-container">
            {!backendReady && (
              <div
                className="backend-wait-overlay"
                role="status"
                aria-live="polite"
              >
                <div className="backend-wait-card">
                  <div className="backend-spinner" aria-hidden="true" />
                  <h2>Warte auf Backend ...</h2>
                  <p>
                    Versuche: {backendAttempts || 1}
                    {backendError ? ` | Letzter Fehler: ${backendError}` : ""}
                  </p>
                  <button
                    type="button"
                    className="backend-retry-button"
                    onClick={handleManualRetry}
                  >
                    Erneut versuchen
                  </button>
                </div>
              </div>
            )}

            {/* ---------- Header ---------- */}
            <header className="app-header">
              {/* Branding */}
              <div className="app-brand" aria-label="ERP SteinmetZ Dashboard">
                <button
                  className="sidebar-menu-button"
                  onClick={handleToggleSidebar}
                  aria-label="Toggle Sidebar"
                  title={
                    isSidebarCollapsed
                      ? "Sidebar ausklappen"
                      : "Sidebar einklappen"
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
                © {new Date().getFullYear()} ERP SteinmetZ | v
                {VERSION_INFO.version} ({VERSION_INFO.environment})
              </small>
              {redisStatus && (
                <div
                  className="service-status"
                  title={
                    redisStatus.connected
                      ? "Redis verbunden"
                      : redisStatus.usingFallback
                        ? "Redis nicht verfügbar - In-Memory-Modus"
                        : "Redis Status unbekannt"
                  }
                >
                  <span className="status-label">Redis:</span>
                  <span
                    className={`status-indicator ${
                      redisStatus.connected
                        ? "status-green"
                        : redisStatus.usingFallback
                          ? "status-yellow"
                          : "status-red"
                    }`}
                  >
                    ●
                  </span>
                </div>
              )}
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
    </SettingsProvider>
  );
}
