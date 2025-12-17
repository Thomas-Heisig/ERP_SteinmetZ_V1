// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/builder/types.ts

/**
 * Zentrale Typdefinitionen für das Builder-Subsystem.
 * Enthält keine Geschäftslogik, ausschließlich modellhafte Strukturen.
 */

import type { DashboardNode, FormField, ValidationRule } from "../../types";

/* ============================================================
   Layout-Typen
   ============================================================ */

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

/* ============================================================
   Form-Typen
   ============================================================ */

export interface BuiltFormField {
  id: string;
  type: FormField["type"];
  label: string;
  required: boolean;
  defaultValue?: unknown;
  options?: string[];
  validation: ValidationRule;
}

export interface BuiltForm {
  fields: BuiltFormField[];
  values: Record<string, unknown>;
  valid: boolean;
}

/* ============================================================
   Node-/Widget-Typen
   ============================================================ */

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

/* ============================================================
   Builder-Interfaces
   ============================================================ */

export interface NodeBuilderInterface {
  build(nodes: DashboardNode[]): BuiltNodeTree;
  buildSingleNode(node: DashboardNode): BuiltNodeUI;
}

export interface FormBuilderInterface {
  fromNode(node: DashboardNode): BuiltForm;
  fromFieldList(fields: FormField[]): BuiltForm;
  updateValue(form: BuiltForm, fieldId: string, newValue: unknown): BuiltForm;
  validateAll(
    fields: BuiltFormField[],
    values: Record<string, unknown>,
  ): boolean;
}

export interface LayoutEngineInterface {
  fromNodes(nodes: DashboardNode[]): GeneratedLayout;
  autoLayout(nodes: DashboardNode[]): GeneratedLayout;
  byCategory(nodes: DashboardNode[]): Record<string, GeneratedLayout>;
  mergeLayouts(
    base: GeneratedLayout,
    overrides: Partial<GeneratedLayout>,
  ): GeneratedLayout;
}
