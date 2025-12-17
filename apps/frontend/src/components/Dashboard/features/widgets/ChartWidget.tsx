// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/widgets/ChartWidget.tsx

import React from "react";
import type { WidgetProps } from "../../types";
import "./ChartWidget.css";

/**
 * ChartWidget – Basis-Diagramm-Widget.
 *
 * Dieses Widget rendern wir bewusst minimal:
 * - keine externe Chart-Library
 * - nur strukturierte Darstellung der Daten
 * - dient als Platzhalter für zukünftige Chart-Integrationen
 */
const ChartWidget: React.FC<WidgetProps> = ({ node }) => {
  const chart = node.data.chartConfig;

  if (!chart) {
    return (
      <div className="chart-widget">
        <h3 className="chart-widget__title">Chart Widget</h3>
        <div className="chart-widget__info">
          <strong>Kein Diagramm verfügbar</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-widget">
      <h3 className="chart-widget__title">{node.data.title}</h3>

      <div className="chart-widget__info">
        <strong>Chart-Typ:</strong> {chart.type}
      </div>

      <div className="chart-widget__info">
        <strong>X-Achse:</strong> {chart.xKey}
      </div>

      <div className="chart-widget__info">
        <strong>Y-Achse:</strong> {chart.yKey}
      </div>

      <div className="chart-widget__info">
        <strong>Datenpunkte:</strong> {chart.data.length}
      </div>

      {/* Rohdaten anzeigen (Platzhalter für echte Diagrammbibliothek) */}
      <pre className="chart-widget__data">
        {JSON.stringify(chart.data, null, 2)}
      </pre>
    </div>
  );
};

export default ChartWidget;
