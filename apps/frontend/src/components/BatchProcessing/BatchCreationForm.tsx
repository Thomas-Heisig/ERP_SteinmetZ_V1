// SPDX-License-Identifier: MIT
// apps/frontend/src/components/BatchProcessing/BatchCreationForm.tsx

import React, { useState } from "react";

interface BatchFormData {
  operation: string;
  filters: any;
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

  const updateOptions = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [key]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} style={styles.container}>
      <h2 style={styles.title}>Create Batch Operation</h2>

      {/* Operation Type */}
      <div style={styles.field}>
        <label style={styles.label}>Operation Type *</label>
        <select
          value={formData.operation}
          onChange={(e) =>
            setFormData({ ...formData, operation: e.target.value })
          }
          style={styles.input}
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
      <div style={styles.field}>
        <label style={styles.label}>Batch Name</label>
        <input
          type="text"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Optional batch name"
          style={styles.input}
        />
      </div>

      {/* Description */}
      <div style={styles.field}>
        <label style={styles.label}>Description</label>
        <textarea
          value={formData.description || ""}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Optional description"
          style={{ ...styles.input, minHeight: "80px" }}
        />
      </div>

      {/* Advanced Options */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Advanced Options</h3>

        <div style={styles.field}>
          <label style={styles.label}>Chunk Size</label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.options?.chunkSize || 10}
            onChange={(e) => updateOptions("chunkSize", Number(e.target.value))}
            style={styles.input}
          />
          <small style={styles.hint}>
            Number of nodes to process per batch
          </small>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Parallel Requests</label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.options?.parallelRequests || 2}
            onChange={(e) =>
              updateOptions("parallelRequests", Number(e.target.value))
            }
            style={styles.input}
          />
          <small style={styles.hint}>Number of concurrent API requests</small>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Model Preference</label>
          <select
            value={formData.options?.modelPreference || "balanced"}
            onChange={(e) => updateOptions("modelPreference", e.target.value)}
            style={styles.input}
          >
            <option value="fast">Fast (Lower quality, faster results)</option>
            <option value="balanced">Balanced (Good quality and speed)</option>
            <option value="accurate">Accurate (Best quality, slower)</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button
          type="submit"
          style={{ ...styles.button, ...styles.primaryButton }}
        >
          Create Batch
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{ ...styles.button, ...styles.secondaryButton }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    maxWidth: "600px",
  } as React.CSSProperties,
  title: {
    fontSize: "24px",
    fontWeight: "bold" as const,
    marginBottom: "20px",
    color: "#333",
  } as React.CSSProperties,
  section: {
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600" as const,
    marginBottom: "15px",
    color: "#444",
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
};
