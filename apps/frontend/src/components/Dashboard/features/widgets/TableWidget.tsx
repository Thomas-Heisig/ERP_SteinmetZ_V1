// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/widgets/TableWidget.tsx

import React from "react";
import type { WidgetProps } from "../../types";
import "./TableWidget.css";

/**
 * TableWidget – einfache tabellarische Darstellung.
 *
 * Keine externe Tabelle, keine Sortierung, reines strukturiertes Rendering.
 */
const TableWidget: React.FC<WidgetProps> = ({ node }) => {
  const table = node.data.tableConfig;

  if (!table) {
    return (
      <div className="table-widget">
        <strong>Keine Tabellendaten verfügbar</strong>
      </div>
    );
  }

  const rows = Array.isArray(node.data.content) ? node.data.content : [];

  return (
    <div className="table-widget">
      <h3 className="table-widget__title">{node.data.title}</h3>

      <table className="table-widget__table">
        <thead>
          <tr>
            {table.columns.map((col) => (
              <th key={col.key} className="table-widget__th">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={table.columns.length}
                className="table-widget__empty"
              >
                Keine Daten
              </td>
            </tr>
          )}

          {rows.map((row, idx) => (
            <tr key={idx}>
              {table.columns.map((col) => (
                <td key={col.key} className="table-widget__td">
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
