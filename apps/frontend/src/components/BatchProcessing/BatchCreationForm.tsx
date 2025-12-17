// SPDX-License-Identifier: MIT
// apps/frontend/src/components/BatchProcessing/BatchCreationForm.tsx

import React, { useState } from "react";
import "./BatchCreationForm.css";

interface BatchFormData {
  operation: string;
  filters: unknown;
  options?: {
    chunkSize?: number;
    parallelRequests?: number;
    modelPreference?: string;
  };
  name?: string;
  description?: string;
}

interface BatchCreationFormProps {
  onSubmit: (data: BatchFormData) => void;
  onCancel: () => void;
}

export const BatchCreationForm: React.FC<BatchCreationFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<BatchFormData>({
    operation: "generate_meta",
    filters: {},
    options: {
      chunkSize: 10,
      parallelRequests: 2,
      modelPreference: "balanced",
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateOptions = (key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [key]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="batch-form-container">
      <h2 className="batch-form-title">Create Batch Operation</h2>

      {/* Operation Type */}
      <div className="batch-form-field">
        <label className="batch-form-label">Operation Type *</label>
        <select
          value={formData.operation}
          onChange={(e) =>
            setFormData({ ...formData, operation: e.target.value })
          }
          className="batch-form-input"
          aria-label="Operation Type"
          required
        >
          <option value="generate_meta">Generate Metadata</option>
          <option value="generate_forms">Generate Forms</option>
          <option value="generate_rule">Generate Rules</option>
          <option value="classify_pii">Classify PII</option>
          <option value="full_annotation">Full Annotation</option>
          <option value="validate_nodes">Validate Nodes</option>
        </select>
      </div>

      {/* Batch Name */}
      <div className="batch-form-field">
        <label className="batch-form-label">Batch Name</label>
        <input
          type="text"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Optional batch name"
          className="batch-form-input"
        />
      </div>

      {/* Description */}
      <div className="batch-form-field">
        <label className="batch-form-label">Description</label>
        <textarea
          value={formData.description || ""}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Optional description"
          className="batch-form-input batch-form-textarea"
        />
      </div>

      {/* Advanced Options */}
      <div className="batch-form-section">
        <h3 className="batch-form-section-title">Advanced Options</h3>

        <div className="batch-form-field">
          <label className="batch-form-label">Chunk Size</label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.options?.chunkSize || 10}
            onChange={(e) => updateOptions("chunkSize", Number(e.target.value))}
            className="batch-form-input"
            aria-label="Chunk Size"
          />
          <small className="batch-form-hint">
            Number of nodes to process per batch
          </small>
        </div>

        <div className="batch-form-field">
          <label className="batch-form-label">Parallel Requests</label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.options?.parallelRequests || 2}
            onChange={(e) =>
              updateOptions("parallelRequests", Number(e.target.value))
            }
            className="batch-form-input"
            aria-label="Parallel Requests"
          />
          <small className="batch-form-hint">
            Number of concurrent API requests
          </small>
        </div>

        <div className="batch-form-field">
          <label className="batch-form-label">Model Preference</label>
          <select
            value={formData.options?.modelPreference || "balanced"}
            onChange={(e) => updateOptions("modelPreference", e.target.value)}
            className="batch-form-input"
            aria-label="Model Preference"
          >
            <option value="fast">Fast (Lower quality, faster results)</option>
            <option value="balanced">Balanced (Good quality and speed)</option>
            <option value="accurate">Accurate (Best quality, slower)</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="batch-form-actions">
        <button
          type="submit"
          className="batch-form-button batch-form-button-primary"
        >
          Create Batch
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="batch-form-button batch-form-button-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
