// SPDX-License-Identifier: MIT
// apps/frontend/src/components/AdvancedFilters/AdvancedFilters.tsx

/**
 * Advanced Filters Main Component
 * Provides a comprehensive filtering UI with saved filters, presets, and export capabilities
 */

import React, { useState, useEffect } from "react";
import { FilterBuilder } from "./FilterBuilder";

interface FilterConfig {
  query?: string;
  kinds?: string[];
  tags?: string[];
  businessArea?: string[];
  annotationStatus?: string[];
  complexityScore?: { min?: number; max?: number };
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface SavedFilter {
  id: string;
  name: string;
  filter: FilterConfig;
  createdAt: string;
}

interface SearchResult {
  id: string;
  title: string;
  kind: string;
  description?: string;
  [key: string]: unknown;
}

export const AdvancedFilters: React.FC = () => {
  const [currentFilter, setCurrentFilter] = useState<FilterConfig>({});
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Load saved filters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedFilters");
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved filters:", e);
      }
    }
  }, []);

  const handleApplyFilter = async (filter: FilterConfig) => {
    setCurrentFilter(filter);
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const queryParams = new URLSearchParams();

      if (filter.query) queryParams.set("search", filter.query);
      if (filter.kinds?.length)
        queryParams.set("kinds", filter.kinds.join(","));
      if (filter.tags?.length) queryParams.set("tags", filter.tags.join(","));
      if (filter.businessArea?.length)
        queryParams.set("businessArea", filter.businessArea.join(","));
      if (filter.annotationStatus?.length)
        queryParams.set("status", filter.annotationStatus.join(","));
      if (filter.sortBy) queryParams.set("sortBy", filter.sortBy);
      if (filter.sortOrder) queryParams.set("sortOrder", filter.sortOrder);

      const response = await fetch(
        `${apiUrl}/api/ai-annotator/nodes?${queryParams}`,
      );
      const data = await response.json();

      if (data.success) {
        setResults(data.data || []);
      }
    } catch (error) {
      console.error("Failed to apply filter:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFilter = (name: string, filter: FilterConfig) => {
    const newFilter: SavedFilter = {
      id: `filter_${Date.now()}`,
      name,
      filter,
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem("savedFilters", JSON.stringify(updated));
  };

  const handleLoadFilter = (saved: SavedFilter) => {
    setCurrentFilter(saved.filter);
    handleApplyFilter(saved.filter);
    setShowSaved(false);
  };

  const handleDeleteFilter = (id: string) => {
    const updated = savedFilters.filter((f) => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem("savedFilters", JSON.stringify(updated));
  };

  const handleExportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `filter-results-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;

    // Get all unique keys from results
    const keys = Array.from(new Set(results.flatMap((r) => Object.keys(r))));

    // Create CSV header
    const csv = [
      keys.join(","),
      ...results.map((r) =>
        keys.map((k) => JSON.stringify(r[k] || "")).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `filter-results-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Preset filters
  const presets: { name: string; filter: FilterConfig }[] = [
    {
      name: "Missing Metadata",
      filter: { annotationStatus: ["missing_meta"] },
    },
    {
      name: "High Complexity",
      filter: { complexityScore: { min: 7 } },
    },
    {
      name: "HR Functions",
      filter: { businessArea: ["HR"] },
    },
    {
      name: "Finance Functions",
      filter: { businessArea: ["Finance"] },
    },
    {
      name: "Recently Added",
      filter: { sortBy: "created_at", sortOrder: "desc" },
    },
  ];

  return (
    <div className="advanced-filters-container">
      <div className="advanced-filters-header">
        <h1 className="advanced-filters-title">Advanced Filters</h1>
        <div className="advanced-filters-actions">
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="advanced-filters-button"
          >
            📁 Saved Filters ({savedFilters.length})
          </button>
        </div>
      </div>

      {/* Saved Filters Panel */}
      {showSaved && (
        <div className="advanced-filters-saved-panel">
          <h3 className="advanced-filters-panel-title">Saved Filters</h3>
          {savedFilters.length === 0 ? (
            <p className="advanced-filters-empty-text">No saved filters yet</p>
          ) : (
            <div className="advanced-filters-saved-list">
              {savedFilters.map((saved) => (
                <div key={saved.id} className="advanced-filters-saved-item">
                  <div>
                    <div className="advanced-filters-saved-name">
                      {saved.name}
                    </div>
                    <div className="advanced-filters-saved-date">
                      {new Date(saved.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="advanced-filters-saved-actions">
                    <button
                      onClick={() => handleLoadFilter(saved)}
                      className="advanced-filters-small-button"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteFilter(saved.id)}
                      className="advanced-filters-small-button advanced-filters-delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter Presets */}
      <div className="advanced-filters-presets-section">
        <h3 className="advanced-filters-section-title">Quick Filters</h3>
        <div className="advanced-filters-preset-grid">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleApplyFilter(preset.filter)}
              className="advanced-filters-preset-button"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Builder */}
      <FilterBuilder
        initialFilter={currentFilter}
        onApply={handleApplyFilter}
        onSave={handleSaveFilter}
      />

      {/* Results Section */}
      <div className="advanced-filters-results-section">
        <div className="advanced-filters-results-header">
          <h3 className="advanced-filters-section-title">
            Results ({results.length})
          </h3>
          {results.length > 0 && (
            <div className="advanced-filters-export-buttons">
              <button
                onClick={handleExportResults}
                className="advanced-filters-button"
              >
                Export JSON
              </button>
              <button
                onClick={handleExportCSV}
                className="advanced-filters-button"
              >
                📊 Export CSV
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="advanced-filters-loading">Loading results...</div>
        ) : results.length === 0 ? (
          <div className="advanced-filters-empty-results">
            No results. Apply a filter to see results.
          </div>
        ) : (
          <div className="advanced-filters-results-grid">
            {results.map((result) => (
              <div key={result.id} className="advanced-filters-result-card">
                <div className="advanced-filters-result-header">
                  <span className="advanced-filters-result-kind">
                    {result.kind}
                  </span>
                  <span className="advanced-filters-result-id">
                    {result.id}
                  </span>
                </div>
                <h4 className="advanced-filters-result-title">
                  {result.title || "Untitled"}
                </h4>
                {typeof result.meta === "object" &&
                  result.meta !== null &&
                  "description" in result.meta && (
                    <p className="advanced-filters-result-description">
                      {String(result.meta.description).substring(0, 150)}...
                    </p>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFilters;
