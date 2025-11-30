// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/features/export/exportYAML.ts

import type {
  NodeDetail,
  ExportPayload
} from "../../types";

/* -------------------------------------------------------------------------- */
/*                          YAML SERIALIZER (Safe)                             */
/* -------------------------------------------------------------------------- */

/**
 * YAML Serializer:
 * - keine externen Libraries
 * - sicher für Strings, Objekte, Arrays
 * - keine YAML-Anchors, keine komplexen Typen
 */
function toYAML(value: unknown, indent = 0): string {
  const pad = " ".repeat(indent);

  if (value === null || value === undefined) return "null";

  switch (typeof value) {
    case "string": {
      const escaped = value.replace(/"/g, '\\"');

      if (
        value.includes(":") ||
        value.includes("\n") ||
        value.includes("\"") ||
        value.startsWith(" ") ||
        value.endsWith(" ")
      ) {
        return `"${escaped}"`;
      }

      return escaped;
    }

    case "number":
    case "boolean":
      return String(value);

    case "object": {
      if (Array.isArray(value)) {
        if (value.length === 0) return "[]";
        return value
          .map((item) => `${pad}- ${toYAML(item, indent + 2)}`)
          .join("\n");
      }

      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0) return "{}";

      return entries
        .map(([key, val]) => {
          const child = toYAML(val, indent + 2);
          const prefix = `${pad}${key}:`;
          const isMultiline = /\n/.test(child);

          if (typeof val === "object" && val !== null && isMultiline) {
            return `${prefix}\n${" ".repeat(indent + 2)}${child}`;
          }

          return `${prefix} ${child}`;
        })
        .join("\n");
    }

    default:
      return `"${String(value)}"`;
  }
}

/* -------------------------------------------------------------------------- */
/*                          EXPORT PAYLOAD BUILDER                             */
/* -------------------------------------------------------------------------- */

function buildExportPayload(node: NodeDetail): ExportPayload {
  return {
    id: node.id,
    title: node.title,
    kind: node.kind,

    meta: node.meta,
    schema: node.schema,
    aa: node.aa,
    source: node.source,
    breadcrumbs: node.breadcrumbs,

    exportDate: new Date().toISOString(),
    format: "yaml",
    version: (node as any).version,
    includes: ["meta", "schema", "aa", "source", "breadcrumbs"],

    metadata: {
      exportedBy: "FunctionsCatalog",
      sourceSystem: "Frontend",
      checksum: String(node.id).length + "-" + Date.now(),
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                EXPORT-FUNKTION                              */
/* -------------------------------------------------------------------------- */

export function exportNodeAsYAML(node: NodeDetail): void {
  const payload = buildExportPayload(node);

  const yamlStr = toYAML(payload, 0);
  const fileName = `node-${node.id}.yaml`;

  const blob = new Blob([yamlStr], {
    type: "text/yaml;charset=utf-8",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
