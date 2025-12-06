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
  [key: string]: any;
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
      if (filter.kinds?.length) queryParams.set("kinds", filter.kinds.join(","));
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
    const keys = Array.from(
      new Set(results.flatMap((r) => Object.keys(r))),
    );

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
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Advanced Filters</h1>
        <div style={styles.actions}>
          <button
            onClick={() => setShowSaved(!showSaved)}
            style={styles.button}
          >
            📁 Saved Filters ({savedFilters.length})
          </button>
        </div>
      </div>

      {/* Saved Filters Panel */}
      {showSaved && (
        <div style={styles.savedPanel}>
          <h3 style={styles.panelTitle}>Saved Filters</h3>
          {savedFilters.length === 0 ? (
            <p style={styles.emptyText}>No saved filters yet</p>
          ) : (
            <div style={styles.savedList}>
              {savedFilters.map((saved) => (
                <div key={saved.id} style={styles.savedItem}>
                  <div>
                    <div style={styles.savedName}>{saved.name}</div>
                    <div style={styles.savedDate}>
                      {new Date(saved.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={styles.savedActions}>
                    <button
                      onClick={() => handleLoadFilter(saved)}
                      style={styles.smallButton}
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteFilter(saved.id)}
                      style={{ ...styles.smallButton, ...styles.deleteButton }}
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
      <div style={styles.presetsSection}>
        <h3 style={styles.sectionTitle}>Quick Filters</h3>
        <div style={styles.presetGrid}>
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleApplyFilter(preset.filter)}
              style={styles.presetButton}
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
      <div style={styles.resultsSection}>
        <div style={styles.resultsHeader}>
          <h3 style={styles.sectionTitle}>
            Results {results.length > 0 && `(${results.length})`}
          </h3>
          {results.length > 0 && (
            <div style={styles.exportButtons}>
              <button onClick={handleExportResults} style={styles.button}>
                📥 Export JSON
              </button>
              <button onClick={handleExportCSV} style={styles.button}>
                📊 Export CSV
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div style={styles.loading}>Loading results...</div>
        ) : results.length === 0 ? (
          <div style={styles.emptyResults}>
            No results. Apply a filter to see results.
          </div>
        ) : (
          <div style={styles.resultsGrid}>
            {results.map((result) => (
              <div key={result.id} style={styles.resultCard}>
                <div style={styles.resultHeader}>
                  <span style={styles.resultKind}>{result.kind}</span>
                  <span style={styles.resultId}>{result.id}</span>
                </div>
                <h4 style={styles.resultTitle}>{result.title || "Untitled"}</h4>
                {result.meta?.description && (
                  <p style={styles.resultDescription}>
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

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "2rem",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    margin: 0,
  },
  actions: {
    display: "flex",
    gap: "1rem",
  },
  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "#4a90e2",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  savedPanel: {
    backgroundColor: "#f5f5f5",
    padding: "1.5rem",
    borderRadius: "8px",
    marginBottom: "2rem",
  },
  panelTitle: {
    marginTop: 0,
    marginBottom: "1rem",
    fontSize: "1.2rem",
  },
  emptyText: {
    color: "#666",
    fontStyle: "italic",
  },
  savedList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  savedItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    backgroundColor: "white",
    borderRadius: "4px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  savedName: {
    fontWeight: "600",
    marginBottom: "0.25rem",
  },
  savedDate: {
    fontSize: "0.8rem",
    color: "#666",
  },
  savedActions: {
    display: "flex",
    gap: "0.5rem",
  },
  smallButton: {
    padding: "0.25rem 0.75rem",
    fontSize: "0.85rem",
    backgroundColor: "#4a90e2",
    color: "white",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  presetsSection: {
    marginBottom: "2rem",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    marginBottom: "1rem",
  },
  presetGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "0.75rem",
  },
  presetButton: {
    padding: "0.75rem",
    backgroundColor: "white",
    border: "2px solid #e0e0e0",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  resultsSection: {
    marginTop: "2rem",
  },
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  exportButtons: {
    display: "flex",
    gap: "0.5rem",
  },
  loading: {
    textAlign: "center",
    padding: "3rem",
    color: "#666",
    fontSize: "1.1rem",
  },
  emptyResults: {
    textAlign: "center",
    padding: "3rem",
    color: "#999",
    fontStyle: "italic",
  },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1rem",
  },
  resultCard: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    border: "1px solid #e0e0e0",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  resultKind: {
    display: "inline-block",
    padding: "0.25rem 0.5rem",
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    borderRadius: "3px",
    fontSize: "0.75rem",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  resultId: {
    fontSize: "0.75rem",
    color: "#999",
    fontFamily: "monospace",
  },
  resultTitle: {
    margin: "0 0 0.5rem 0",
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  resultDescription: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#666",
    lineHeight: "1.4",
  },
};

export default AdvancedFilters;
