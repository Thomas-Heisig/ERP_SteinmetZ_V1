// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/features/export/ExportMenu.tsx

import type { NodeDetail } from "../../types";
import type { ContextMenuItem } from "../contextMenu/useContextMenu";

import { exportNodeAsJSON } from "./exportJSON";
import { exportNodeAsMarkdown } from "./exportMarkdown";
import { exportNodeAsYAML } from "./exportYAML";

export function buildExportMenuItems(node: NodeDetail): ContextMenuItem[] {
  return [
    {
      id: "export-json",
      label: "Als JSON exportieren",
      icon: "🟦",
      onClick: () => exportNodeAsJSON(node),
    },
    {
      id: "export-md",
      label: "Als Markdown exportieren",
      icon: "📄",
      onClick: () => exportNodeAsMarkdown(node),
    },
    {
      id: "export-yaml",
      label: "Als YAML exportieren",
      icon: "📘",
      onClick: () => exportNodeAsYAML(node),
    },
  ];
}
