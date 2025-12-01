// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/builder/NodeBuilder.ts

/**
 * NodeBuilder – zentrale Einheit zur Erzeugung dynamischer UI-Strukturen
 * aus DashboardNodes. Der Builder kennt keine UI-Komponenten; er erzeugt
 * lediglich abstrakte Widget-Beschreibungen, die später durch den
 * WidgetResolver einer konkreten Darstellung zugeordnet werden.
 */

import type { DashboardNode, WidgetRegistry, WidgetProps } from "../../types";

import { LayoutEngine } from "./LayoutEngine";

export interface BuiltNodeUI {
  nodeId: string;
  widgetType: string;
  config: Record<string, unknown>;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
    zIndex: number;
  };
}

export interface BuiltNodeTree {
  widgets: BuiltNodeUI[];
  layoutType: "GRID" | "FREE" | "CATEGORY";
}

export class NodeBuilder {
  private layoutEngine: LayoutEngine;
  private widgets: WidgetRegistry;

  constructor(registry: WidgetRegistry) {
    this.layoutEngine = new LayoutEngine();
    this.widgets = registry;
  }

  /**
   * Baut die gesamte UI-Struktur für mehrere Nodes.
   */
  build(nodes: DashboardNode[]): BuiltNodeTree {
    const layout = this.layoutEngine.fromNodes(nodes);

    const widgets = layout.items
      .map((item) => {
        const sourceNode = nodes.find((n) => n.id === item.id);
        if (!sourceNode) {
          return null;
        }

        return this.buildSingleNode(sourceNode, item);
      })
      .filter(Boolean) as BuiltNodeUI[];

    return {
      widgets,
      layoutType: layout.type,
    };
  }

  /**
   * Baut ein einzelnes Node-Widget basierend auf Node-Metadaten.
   */
  buildSingleNode(node: DashboardNode, layoutItem?: any): BuiltNodeUI {
    const widgetType = this.resolveWidgetType(node);

    return {
      nodeId: node.id,
      widgetType,
      config: this.extractWidgetConfig(node),
      position: {
        x: layoutItem?.x ?? node.position.x,
        y: layoutItem?.y ?? node.position.y,
        w: layoutItem?.w ?? node.size.width,
        h: layoutItem?.h ?? node.size.height,
        zIndex: layoutItem?.zIndex ?? node.position.zIndex ?? 1,
      },
    };
  }

  /**
   * Bestimmt, welcher Widget-Typ für diesen Node verwendet wird.
   */
  private resolveWidgetType(node: DashboardNode): string {
    switch (node.type) {
      case "CARD":
        return "CardWidget";
      case "TABLE":
        return "TableWidget";
      case "CHART":
        return "ChartWidget";
      case "FORM":
        return "FormWidget";
      case "CUSTOM":
        return "CustomWidget";
      default:
        return "UnknownWidget";
    }
  }

  /**
   * Extrahiert Widget-spezifische Konfigurationen aus einem Node.
   */
  private extractWidgetConfig(node: DashboardNode): Record<string, unknown> {
    const config: Record<string, unknown> = {
      title: node.data.title,
      visibility: node.config.visibility,
      draggable: node.config.isDraggable,
      resizable: node.config.isResizable,
      collapsible: node.config.isCollapsible,
      editable: node.config.isEditable,
      tags: node.metadata.tags,
      category: node.metadata.category,
    };

    if (node.data.fields) config.fields = node.data.fields;
    if (node.data.tableConfig) config.table = node.data.tableConfig;
    if (node.data.chartConfig) config.chart = node.data.chartConfig;
    if (node.data.dataSource) config.dataSource = node.data.dataSource;

    return config;
  }

  /**
   * Prüft, ob ein Widget tatsächlich existiert.
   */
  hasWidget(type: string): boolean {
    return Boolean(this.widgets[type]);
  }

  /**
   * Liefert ein React-Widget (nicht gerendert), falls vorhanden.
   */
  getWidgetComponent(type: string): React.ComponentType<WidgetProps> | null {
    return this.widgets[type] ?? null;
  }
}

export default NodeBuilder;
