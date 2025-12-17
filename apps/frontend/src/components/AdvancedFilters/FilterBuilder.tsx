// SPDX-License-Identifier: MIT
// apps/frontend/src/components/AdvancedFilters/FilterBuilder.tsx

import React, { useState } from "react";
import "./FilterBuilder.css";

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

  const updateFilter = (key: keyof FilterConfig, value: unknown) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="filter-builder-container">
      <h2 className="filter-builder-title">Filter Builder</h2>

      {/* Text Search */}
      <div className="filter-builder-field">
        <label className="filter-builder-label">Search Query</label>
        <input
          type="text"
          value={filter.query || ""}
          onChange={(e) => updateFilter("query", e.target.value)}
          placeholder="Search by title, id, or content..."
          className="filter-builder-input"
        />
      </div>

      {/* Node Kinds */}
      <div className="filter-builder-field">
        <label className="filter-builder-label">Node Types</label>
        <select
          multiple
          value={filter.kinds || []}
          onChange={(e) => {
            const selected = Array.from(
              e.target.selectedOptions,
              (o) => o.value,
            );
            updateFilter("kinds", selected);
          }}
          className="filter-builder-input filter-builder-select-multiple"
          aria-label="Node Types"
        >
          <option value="category">Category</option>
          <option value="section">Section</option>
          <option value="action">Action</option>
          <option value="workflow">Workflow</option>
          <option value="record">Record</option>
          <option value="report">Report</option>
        </select>
        <small className="filter-builder-hint">
          Hold Ctrl/Cmd to select multiple
        </small>
      </div>

      {/* Annotation Status */}
      <div className="filter-builder-field">
        <label className="filter-builder-label">Annotation Status</label>
        <select
          multiple
          value={filter.annotationStatus || []}
          onChange={(e) => {
            const selected = Array.from(
              e.target.selectedOptions,
              (o) => o.value,
            );
            updateFilter("annotationStatus", selected);
          }}
          className="filter-builder-input filter-builder-select-annotation"
          aria-label="Annotation Status"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="needs_review">Needs Review</option>
        </select>
      </div>

      {/* Complexity Score Range */}
      <div className="filter-builder-field">
        <label className="filter-builder-label">Complexity Score Range</label>
        <div className="filter-builder-range-container">
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
            className="filter-builder-input filter-builder-range-input"
          />
          <span className="filter-builder-range-separator">to</span>
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
            className="filter-builder-input filter-builder-range-input"
          />
        </div>
      </div>

      {/* Sort Options */}
      <div className="filter-builder-field">
        <label className="filter-builder-label">Sort By</label>
        <div className="filter-builder-range-container">
          <select
            value={filter.sortBy || ""}
            onChange={(e) =>
              updateFilter("sortBy", e.target.value || undefined)
            }
            className="filter-builder-input filter-builder-sort-select"
            aria-label="Sort By"
          >
            <option value="">-- No sorting --</option>
            <option value="created_at">Created Date</option>
            <option value="updated_at">Updated Date</option>
            <option value="title">Title</option>
            <option value="complexity_score">Complexity Score</option>
          </select>
          <select
            value={filter.sortOrder || "asc"}
            onChange={(e) =>
              updateFilter("sortOrder", e.target.value as "asc" | "desc")
            }
            className="filter-builder-input filter-builder-order-select"
            disabled={!filter.sortBy}
            aria-label="Sort Order"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="filter-builder-actions">
        <button
          onClick={handleApply}
          className="filter-builder-button filter-builder-button-primary"
        >
          Apply Filter
        </button>
        {onSave && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="filter-builder-button filter-builder-button-secondary"
          >
            Save Filter
          </button>
        )}
        <button
          onClick={() => setFilter({})}
          className="filter-builder-button filter-builder-button-danger"
        >
          Clear All
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="filter-builder-modal">
          <div className="filter-builder-modal-content">
            <h3>Save Filter</h3>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Enter filter name..."
              className="filter-builder-input"
              autoFocus
            />
            <div className="filter-builder-modal-actions">
              <button
                onClick={handleSave}
                className="filter-builder-button filter-builder-button-primary"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="filter-builder-button filter-builder-button-secondary"
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
