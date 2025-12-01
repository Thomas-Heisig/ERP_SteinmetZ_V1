// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/search/SearchBar.tsx

import React, { useState, useEffect } from "react";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  loading?: boolean;
  debounce?: number;
}

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Suche…",
  loading = false,
  debounce = 0,
}: SearchBarProps) {
  const [internal, setInternal] = useState<string>(value);

  /** externe Änderungen → interner Zustand aktualisieren */
  useEffect(() => {
    setInternal(value);
  }, [value]);

  /** Debounce Logik */
  useEffect(() => {
    if (typeof onChange !== "function") return;

    if (debounce <= 0) {
      onChange(internal);
      return;
    }

    const timer = window.setTimeout(() => {
      onChange(internal);
    }, debounce);

    return () => window.clearTimeout(timer);
  }, [internal, debounce, onChange]);

  /** Clear-Button */
  const handleClear = () => {
    setInternal("");

    if (onClear) {
      onClear();
    }

    if (debounce <= 0) {
      onChange("");
    }
  };

  return (
    <div className="fc-searchbar">
      <input
        type="search"
        value={internal}
        onChange={(e) => setInternal(e.target.value)}
        placeholder={placeholder}
        className="fc-search-input"
        aria-label="FunctionsCatalog Suche"
      />

      {loading && (
        <span className="fc-search-spinner" aria-hidden="true">
          ⏳
        </span>
      )}

      {internal !== "" && (
        <button
          type="button"
          className="fc-search-clear"
          onClick={handleClear}
          aria-label="Suche löschen"
        >
          ✖
        </button>
      )}

      <style>{`
        .fc-searchbar {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .fc-search-input {
          flex: 1;
          padding: 8px 36px 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: var(--fc-bg, #ffffff);
          color: var(--fc-text, #111827);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .fc-search-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }

        .fc-search-spinner {
          position: absolute;
          right: 36px;
          font-size: 12px;
          opacity: 0.7;
          pointer-events: none;
        }

        .fc-search-clear {
          position: absolute;
          right: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 2px 4px;
          font-size: 14px;
          opacity: 0.7;
          line-height: 1;
        }

        .fc-search-clear:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
