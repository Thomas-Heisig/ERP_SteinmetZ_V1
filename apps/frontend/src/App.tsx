// SPDX-License-Identifier: MIT
// apps/frontend/src/App.tsx

import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";

import { useTheme, type Theme } from "./contexts/ThemeContext";
import { LanguageProvider } from "./components/LanguageSwitch/LanguageProvider";
import { LanguageSwitcher } from "./components/LanguageSwitch/LanguageSwitcher";

import QuickChat from "./components/QuickChat";

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <LanguageProvider>
      <div className="app-container">
        {/* ---------- Header ---------- */}
        <header className="app-header">
          {/* Branding */}
          <div className="app-brand" aria-label="ERP SteinmetZ Dashboard">
            <span className="brand-icon" aria-hidden="true">
              🧱
            </span>
            <strong className="brand-name">ERP SteinmetZ</strong>
            <span className="brand-subtitle">Dashboard</span>
          </div>

          {/* Navigation */}
          <nav className="main-nav" aria-label="Hauptnavigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon" aria-hidden="true">
                🏠
              </span>
              Übersicht
            </NavLink>

            <NavLink
              to="/catalog"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon" aria-hidden="true">
                🧭
              </span>
              Funktionen
            </NavLink>

            <NavLink
              to="/ai"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon" aria-hidden="true">
                🤖
              </span>
              AI-Annotator
            </NavLink>
          </nav>

          {/* Controls */}
          <div className="header-controls">
            <LanguageSwitcher />
            <ThemeToggle />

            {/* QuickChat Button */}
            <button
              className="quickchat-open-button"
              onClick={() => setIsChatOpen(true)}
              aria-label="Chat öffnen"
            >
              💬
            </button>
          </div>
        </header>

        {/* ---------- Main ---------- */}
        <main className="app-main">
          <Outlet />
        </main>

        {/* ---------- Footer + QuickChat ---------- */}
        <footer className="app-footer">
          <small>© {new Date().getFullYear()} ERP SteinmetZ</small>

          <QuickChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </footer>
      </div>
    </LanguageProvider>
  );
}

/* ---------------------------------------------------------
   Theme-Toggle
--------------------------------------------------------- */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const THEMES: readonly Theme[] = ["light", "dark", "lcars"] as const;

  const getThemeIcon = (t: Theme): string => {
    switch (t) {
      case "light":
        return "☀️";
      case "dark":
        return "🌙";
      case "lcars":
        return "🚀";
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
