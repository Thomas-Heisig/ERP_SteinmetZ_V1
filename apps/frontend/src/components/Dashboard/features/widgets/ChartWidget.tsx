// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/widgets/ChartWidget.tsx

import React from "react";
import type { WidgetProps } from "../../types";

/**
 * ChartWidget – Basis-Diagramm-Widget.
 *
 * Dieses Widget rendern wir bewusst minimal:
 * - keine externe Chart-Library
 * - nur strukturierte Darstellung der Daten
 * - dient als Platzhalter für zukünftige Chart-Integrationen
 */
const ChartWidget: React.FC<WidgetProps> = ({ node, config }) => {
  const chart = node.data.chartConfig;

  if (!chart) {
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
        <strong>Kein Diagramm verfügbar</strong>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "1rem",
        backgroundColor: config.theme.backgroundColor,
        color: config.theme.textColor,
        borderRadius: config.theme.borderRadius ?? 6,
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <h3 style={{ margin: 0 }}>{node.data.title}</h3>

      <div style={{ fontSize: "0.9rem" }}>
        <strong>Chart-Typ:</strong> {chart.type}
      </div>

      <div style={{ fontSize: "0.9rem" }}>
        <strong>X-Achse:</strong> {chart.xKey}
      </div>

      <div style={{ fontSize: "0.9rem" }}>
        <strong>Y-Achse:</strong> {chart.yKey}
      </div>

      <div style={{ fontSize: "0.9rem" }}>
        <strong>Datenpunkte:</strong> {chart.data.length}
      </div>

      {/* Rohdaten anzeigen (Platzhalter für echte Diagrammbibliothek) */}
      <pre
        style={{
          background: "#00000011",
          padding: "0.5rem",
          fontSize: "0.7rem",
          overflowX: "auto",
        }}
      >
        {JSON.stringify(chart.data, null, 2)}
      </pre>
    </div>
  );
};

export default ChartWidget;
