// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/widgets/TableWidget.tsx

import React from "react";
import type { WidgetProps } from "../../types";

/**
 * TableWidget – einfache tabellarische Darstellung.
 *
 * Keine externe Tabelle, keine Sortierung, reines strukturiertes Rendering.
 */
const TableWidget: React.FC<WidgetProps> = ({ node, config }) => {
  const table = node.data.tableConfig;

  if (!table) {
    return (
      <div
        style={{
          padding: "1rem",
          backgroundColor: config.theme.backgroundColor,
          color: config.theme.textColor,
          borderRadius: config.theme.borderRadius ?? 6,
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        <strong>Keine Tabellendaten verfügbar</strong>
      </div>
    );
  }

  const rows = Array.isArray(node.data.content) ? node.data.content : [];

  return (
    <div
      style={{
        padding: "1rem",
        backgroundColor: config.theme.backgroundColor,
        color: config.theme.textColor,
        borderRadius: config.theme.borderRadius ?? 6,
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        overflowX: "auto",
      }}
    >
      <h3 style={{ margin: "0 0 0.5rem 0" }}>{node.data.title}</h3>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.85rem",
        }}
      >
        <thead>
          <tr>
            {table.columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: "left",
                  padding: "0.5rem",
                  borderBottom: "1px solid #ccc",
                  fontWeight: 600,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={table.columns.length} style={{ padding: "0.5rem" }}>
                Keine Daten
              </td>
            </tr>
          )}

          {rows.map((row, idx) => (
            <tr key={idx}>
              {table.columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: "0.5rem",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {col.render ? col.render(row[col.key]) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableWidget;