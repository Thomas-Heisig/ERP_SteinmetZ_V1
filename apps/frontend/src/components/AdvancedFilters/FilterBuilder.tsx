// SPDX-License-Identifier: MIT
// apps/frontend/src/components/AdvancedFilters/FilterBuilder.tsx

import React, { useState } from "react";

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

interface FilterBuilderProps {
  initialFilter?: FilterConfig;
  onApply: (filter: FilterConfig) => void;
  onSave?: (name: string, filter: FilterConfig) => void;
}

export const FilterBuilder: React.FC<FilterBuilderProps> = ({
  initialFilter = {},
  onApply,
  onSave,
}) => {
  const [filter, setFilter] = useState<FilterConfig>(initialFilter);
  const [filterName, setFilterName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleApply = () => {
    onApply(filter);
  };

  const handleSave = () => {
    if (onSave && filterName.trim()) {
      onSave(filterName, filter);
      setShowSaveDialog(false);
      setFilterName("");
    }
  };

  const updateFilter = (key: keyof FilterConfig, value: any) => {
    setFilter((prev) => ({  ...prev, [key]: value }));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Filter Builder</h2>

      {/* Text Search */}
      <div style={styles.field}>
        <label style={styles.label}>Search Query</label>
        <input
          type="text"
          value={filter.query || ""}
          onChange={(e) => updateFilter("query", e.target.value)}
          placeholder="Search by title, id, or content..."
          style={styles.input}
        />
      </div>

      {/* Node Kinds */}
      <div style={styles.field}>
        <label style={styles.label}>Node Types</label>
        <select
          multiple
          value={filter.kinds || []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, (o) => o.value);
            updateFilter("kinds", selected);
          }}
          style={{ ...styles.input, height: "100px" }}
        >
          <option value="category">Category</option>
          <option value="section">Section</option>
          <option value="action">Action</option>
          <option value="workflow">Workflow</option>
          <option value="record">Record</option>
          <option value="report">Report</option>
        </select>
        <small style={styles.hint}>Hold Ctrl/Cmd to select multiple</small>
      </div>

      {/* Annotation Status */}
      <div style={styles.field}>
        <label style={styles.label}>Annotation Status</label>
        <select
          multiple
          value={filter.annotationStatus || []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, (o) => o.value);
            updateFilter("annotationStatus", selected);
          }}
          style={{ ...styles.input, height: "80px" }}
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="needs_review">Needs Review</option>
        </select>
      </div>

      {/* Complexity Score Range */}
      <div style={styles.field}>
        <label style={styles.label}>Complexity Score Range</label>
        <div style={styles.rangeContainer}>
          <input
            type="number"
            min="0"
            max="10"
            value={filter.complexityScore?.min || ""}
            onChange={(e) =>
              updateFilter("complexityScore", {
                ...filter.complexityScore,
                min: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="Min"
            style={{ ...styles.input, width: "80px" }}
          />
          <span style={{ margin: "0 10px" }}>to</span>
          <input
            type="number"
            min="0"
            max="10"
            value={filter.complexityScore?.max || ""}
            onChange={(e) =>
              updateFilter("complexityScore", {
                ...filter.complexityScore,
                max: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="Max"
            style={{ ...styles.input, width: "80px" }}
          />
        </div>
      </div>

      {/* Sort Options */}
      <div style={styles.field}>
        <label style={styles.label}>Sort By</label>
        <div style={styles.rangeContainer}>
          <select
            value={filter.sortBy || ""}
            onChange={(e) => updateFilter("sortBy", e.target.value || undefined)}
            style={{ ...styles.input, flex: 1 }}
          >
            <option value="">-- No sorting --</option>
            <option value="created_at">Created Date</option>
            <option value="updated_at">Updated Date</option>
            <option value="title">Title</option>
            <option value="complexity_score">Complexity Score</option>
          </select>
          <select
            value={filter.sortOrder || "asc"}
            onChange={(e) => updateFilter("sortOrder", e.target.value as "asc" | "desc")}
            style={{ ...styles.input, width: "120px", marginLeft: "10px" }}
            disabled={!filter.sortBy}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button onClick={handleApply} style={{ ...styles.button, ...styles.primaryButton }}>
          Apply Filter
        </button>
        {onSave && (
          <button
            onClick={() => setShowSaveDialog(true)}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Save Filter
          </button>
        )}
        <button
          onClick={() => setFilter({})}
          style={{ ...styles.button, ...styles.dangerButton }}
        >
          Clear All
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Save Filter</h3>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Enter filter name..."
              style={styles.input}
              autoFocus
            />
            <div style={styles.modalActions}>
              <button onClick={handleSave} style={{ ...styles.button, ...styles.primaryButton }}>
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                style={{ ...styles.button, ...styles.secondaryButton }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  } as React.CSSProperties,
  title: {
    fontSize: "24px",
    fontWeight: "bold" as const,
    marginBottom: "20px",
    color: "#333",
  } as React.CSSProperties,
  field: {
    marginBottom: "20px",
  } as React.CSSProperties,
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "500" as const,
    color: "#555",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
  } as React.CSSProperties,
  hint: {
    display: "block",
    marginTop: "4px",
    fontSize: "12px",
    color: "#888",
  } as React.CSSProperties,
  rangeContainer: {
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "30px",
  } as React.CSSProperties,
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500" as const,
    cursor: "pointer",
    transition: "all 0.2s",
  } as React.CSSProperties,
  primaryButton: {
    backgroundColor: "#007bff",
    color: "white",
  } as React.CSSProperties,
  secondaryButton: {
    backgroundColor: "#6c757d",
    color: "white",
  } as React.CSSProperties,
  dangerButton: {
    backgroundColor: "#dc3545",
    color: "white",
  } as React.CSSProperties,
  modal: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  } as React.CSSProperties,
  modalContent: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    minWidth: "400px",
  } as React.CSSProperties,
  modalActions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    justifyContent: "flex-end",
  } as React.CSSProperties,
};
