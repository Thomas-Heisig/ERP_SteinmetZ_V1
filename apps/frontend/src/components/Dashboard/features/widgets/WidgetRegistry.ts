// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/widgets/WidgetRegistry.ts

/**
 * WidgetRegistry – zentrale Registrierung aller Widgets des Dashboards.
 *
 * Diese Datei hat keine Logik. Sie exportiert lediglich ein Objekt, das
 * die Widget-Komponenten über ihre Keys verfügbar macht.
 */

import type { WidgetRegistry } from "../../types";

import BasicCardWidget from "./BasicCardWidget";
import TableWidget from "./TableWidget";
import ChartWidget from "./ChartWidget";

export const widgetRegistry: WidgetRegistry = {
  CARD: BasicCardWidget,
  TABLE: TableWidget,
  CHART: ChartWidget,
};

export default widgetRegistry;
