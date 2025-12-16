// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/builder/index.ts

/**
 * Barrel export for all builder modules.
 */

export { FormBuilder } from "./FormBuilder";
export { LayoutEngine } from "./LayoutEngine";
export { NodeBuilder } from "./NodeBuilder";
export { WidgetResolver } from "./WidgetResolver";

export type {
  BuiltFormField,
  BuiltForm,
  LayoutItem,
  GeneratedLayout,
  BuiltNodeUI,
  BuiltNodeTree,
  NodeBuilderInterface,
  FormBuilderInterface,
  LayoutEngineInterface,
} from "./types";

export type { WidgetResolverOptions } from "./WidgetResolver";
