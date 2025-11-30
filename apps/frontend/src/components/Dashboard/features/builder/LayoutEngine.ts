// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/builder/LayoutEngine.ts

/**
 * LayoutEngine – einfache, erweiterbare Engine zur Platzierung von Widgets
 * basierend auf Node-Definitionen, Kategorien oder dynamischen Regeln.
 *
 * Die Engine selbst enthält keine UI-Elemente. Sie erzeugt lediglich
 * logische Layout-Strukturen, die später von der UI interpretiert werden.
 */

import type { DashboardNode } from "../../types";

export interface LayoutItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
}

export interface GeneratedLayout {
  items: LayoutItem[];
  type: "GRID" | "FREE" | "CATEGORY";
}

export class LayoutEngine {
  constructor() {}

  /**
   * Erzeugt ein Layout basierend auf einem DashboardNode[]
   * Standard: Grid-Layout
   */
  fromNodes(nodes: DashboardNode[]): GeneratedLayout {
    const items: LayoutItem[] = [];

    for (const node of nodes) {
      items.push({
        id: node.id,
        x: node.position.x,
        y: node.position.y,
        w: node.size.width,
        h: node.size.height,
        zIndex: node.position.zIndex ?? 1,
      });
    }

    return {
      items,
      type: "GRID",
    };
  }

  /**
   * Vereinfachte Autolayout-Funktion, die Widgets untereinander anordnet.
   * Wird genutzt, wenn keine expliziten Koordinaten vorhanden sind.
   */
  autoLayout(nodes: DashboardNode[]): GeneratedLayout {
    const items: LayoutItem[] = [];
    let yOffset = 0;

    for (const node of nodes) {
      items.push({
        id: node.id,
        x: 0,
        y: yOffset,
        w: node.size.width ?? 12,
        h: node.size.height ?? 4,
        zIndex: 1,
      });

      yOffset += (node.size.height ?? 4) + 1;
    }

    return {
      items,
      type: "FREE",
    };
  }

  /**
   * Kategorie-basiertes Layout.
   * Nutzt die Kategorie als Gruppierung und ordnet pro Kategorie vertikal.
   */
  byCategory(nodes: DashboardNode[]): Record<string, GeneratedLayout> {
    const grouped: Record<string, DashboardNode[]> = {};

    for (const n of nodes) {
      const cat = n.metadata.category ?? "uncategorized";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(n);
    }

    const layouts: Record<string, GeneratedLayout> = {};

    for (const [category, list] of Object.entries(grouped)) {
      layouts[category] = this.autoLayout(list);
    }

    return layouts;
  }

  /**
   * Kombiniert mehrere Layout-Varianten, falls gewünscht.
   */
  mergeLayouts(base: GeneratedLayout, overrides: Partial<GeneratedLayout>): GeneratedLayout {
    return {
      type: overrides.type ?? base.type,
      items: overrides.items ?? base.items,
    };
  }
}

export default LayoutEngine;