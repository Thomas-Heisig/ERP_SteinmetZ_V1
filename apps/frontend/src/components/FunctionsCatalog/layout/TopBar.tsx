// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/layout/TopBar.tsx

import React from "react";
import SearchBar from "../search/SearchBar";

interface TopBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;

  onReload: () => void;
  onLint: () => void;

  menuLoading: boolean;
  searchLoading: boolean;
  nodeLoading: boolean;

  menuError?: string | Error | null;
  nodeError?: string | Error | null;
}

export default function TopBar({
  searchQuery,
  onSearch,
  onReload,
  onLint,
  menuLoading,
  searchLoading,
  nodeLoading,
  menuError,
  nodeError,
}: TopBarProps) {
  const errorText = [
    typeof menuError === "string" ? menuError : menuError?.message,
    typeof nodeError === "string" ? nodeError : nodeError?.message,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="fc-topbar">
      {/* Suche */}
      <div className="fc-topbar-search">
        <SearchBar
          value={searchQuery}
          onChange={onSearch}
          loading={searchLoading}
          placeholder="Suchen…"
          debounce={150}
        />
      </div>

      {/* Aktionen */}
      <div className="fc-topbar-actions">
        <button
          type="button"
          className="fc-btn"
          onClick={onReload}
          title="Index neu laden"
          aria-label="Index neu laden"
        >
          🔄
        </button>

        <button
          type="button"
          className="fc-btn"
          onClick={onLint}
          title="Lint-Ergebnisse anzeigen"
          aria-label="Lint-Ergebnisse anzeigen"
        >
          🧪
        </button>
      </div>

      {/* Statusanzeige */}
      <div className="fc-topbar-status" aria-live="polite">
        {menuLoading && <span>Menü… </span>}
        {searchLoading && <span>Suche… </span>}
        {nodeLoading && <span>Details… </span>}

        {errorText && (
          <span className="fc-topbar-error">
            ⚠ {errorText}
          </span>
        )}
      </div>

      {/* Inline-Fallback-Styles */}
      <style>{`
        .fc-topbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
        }

        .fc-topbar-search {
          flex: 1;
          min-width: 240px;
        }

        .fc-topbar-actions {
          display: flex;
          gap: 8px;
        }

        .fc-btn {
          padding: 6px 10px;
          background: var(--fc-btn-bg, #eee);
          border-radius: 6px;
          border: 1px solid #ccc;
          cursor: pointer;
        }

        .fc-btn:hover {
          background: #ddd;
        }

        .fc-topbar-status {
          font-size: 12px;
          min-width: 140px;
          color: #444;
        }

        .fc-topbar-error {
          color: #b91c1c;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
