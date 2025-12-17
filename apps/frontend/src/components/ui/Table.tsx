// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Table.tsx

import React from "react";
import styles from "./Table.module.css";

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
  hoverable: _hoverable = true,
  compact = false,
  className = "",
}: TableProps<T>) {
  const getNestedValue = (obj: T, path: string): unknown => {
    return path.split(".").reduce((acc: unknown, part) => {
      if (
        acc &&
        typeof acc === "object" &&
        part in (acc as Record<string, unknown>)
      ) {
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

  const wrapperClasses = [styles.wrapper, className].filter(Boolean).join(" ");
  const tableClasses = [styles.table, compact && styles.compact]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses}>
      <table className={tableClasses}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((column) => {
              const thClasses = [styles.th, column.sortable && styles.sortable]
                .filter(Boolean)
                .join(" ");

              return (
                <th
                  key={column.key as string}
                  onClick={() =>
                    column.sortable && onSort?.(column.key as string)
                  }
                  className={thClasses}
                  ref={(el) => {
                    if (el && column.width) {
                      el.style.width = column.width;
                    }
                  }}
                >
                  <span className={styles.sortIcon}>
                    {column.header}
                    {column.sortable && sortColumn === column.key && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {loading ? (
            <tr className={styles.loadingRow}>
              <td colSpan={columns.length}>
                <div className={styles.loadingContent}>
                  <div className={styles.spinner} />
                  <p className={styles.loadingText}>Laden...</p>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr className={styles.emptyRow}>
              <td colSpan={columns.length}>
                <div className={styles.emptyContent}>
                  <span className={styles.emptyIcon}>📭</span>
                  <p className={styles.emptyText}>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const rowClasses = [
                styles.tr,
                selectedRows?.has(index) && styles.selected,
                striped && index % 2 === 1 && styles.striped,
                onRowClick && styles.clickable,
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <tr
                  key={keyField ? String(row[keyField]) : index}
                  onClick={() => onRowClick?.(row, index)}
                  className={rowClasses}
                >
                  {columns.map((column) => (
                    <td key={column.key as string} className={styles.td}>
                      {renderCell(column, row, index)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
