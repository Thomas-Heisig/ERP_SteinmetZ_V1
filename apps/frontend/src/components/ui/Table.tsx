// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Table.tsx

import React from "react";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T;
  loading?: boolean;
  emptyMessage?: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
  onRowClick?: (row: T, index: number) => void;
  selectedRows?: Set<number>;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  className?: string;
}

export function Table<T extends object>({
  columns,
  data,
  keyField,
  loading = false,
  emptyMessage = "Keine Daten vorhanden",
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  selectedRows,
  striped = true,
  hoverable = true,
  compact = false,
  className = "",
}: TableProps<T>) {
  const getNestedValue = (obj: T, path: string): unknown => {
    return path.split(".").reduce((acc: unknown, part) => {
      if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  };

  const renderCell = (column: Column<T>, row: T, index: number) => {
    const value = getNestedValue(row, column.key as string);

    if (column.render) {
      return column.render(value, row, index);
    }

    if (value === null || value === undefined) {
      return "-";
    }

    if (typeof value === "boolean") {
      return value ? "✓" : "✕";
    }

    return String(value);
  };

  const cellPadding = compact ? "0.5rem 0.75rem" : "0.75rem 1rem";

  return (
    <div
      className={`ui-table-wrapper ${className}`}
      style={{
        overflowX: "auto",
        border: "1px solid var(--border)",
        borderRadius: "8px",
      }}
    >
      <table
        className="ui-table"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: compact ? "0.875rem" : "1rem",
        }}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key as string}
                onClick={() => column.sortable && onSort?.(column.key as string)}
                style={{
                  padding: cellPadding,
                  textAlign: "left",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  background: "var(--gray-50)",
                  borderBottom: "1px solid var(--border)",
                  cursor: column.sortable ? "pointer" : "default",
                  whiteSpace: "nowrap",
                  width: column.width,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {column.header}
                  {column.sortable && sortColumn === column.key && (
                    <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--text-tertiary)",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    width: "24px",
                    height: "24px",
                    border: "3px solid var(--gray-200)",
                    borderTopColor: "var(--primary-500)",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <p style={{ marginTop: "0.5rem" }}>Laden...</p>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--text-tertiary)",
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={keyField ? String(row[keyField]) : index}
                onClick={() => onRowClick?.(row, index)}
                style={{
                  background: selectedRows?.has(index)
                    ? "var(--primary-50)"
                    : striped && index % 2 === 1
                      ? "var(--gray-50)"
                      : "transparent",
                  cursor: onRowClick ? "pointer" : "default",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (hoverable) {
                    e.currentTarget.style.background = "var(--gray-100)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (hoverable) {
                    e.currentTarget.style.background = selectedRows?.has(index)
                      ? "var(--primary-50)"
                      : striped && index % 2 === 1
                        ? "var(--gray-50)"
                        : "transparent";
                  }
                }}
              >
                {columns.map((column) => (
                  <td
                    key={column.key as string}
                    style={{
                      padding: cellPadding,
                      borderBottom: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {renderCell(column, row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
