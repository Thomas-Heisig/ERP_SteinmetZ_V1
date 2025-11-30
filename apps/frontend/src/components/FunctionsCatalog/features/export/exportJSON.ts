// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/features/export/exportJSON.ts

import type { NodeDetail } from "../../types";

/**
 * JSON-Serializer mit robuster Behandlung von:
 * - undefined → null
 * - zyklischen Referenzen (Vermeidung von Errors)
 * - saubere Einrückung
 */
function prepare(data: unknown): string {
  const seen = new WeakSet();

  try {
    return JSON.stringify(
      data,
      (_key, value) => {
        if (value === undefined) return null;

        // Zyklische Objektverweise verhindern
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) return "[Circular]";
          seen.add(value);
        }

        return value;
      },
      2
    );
  } catch (err) {
    console.error("[exportJSON] Fehler bei JSON.stringify:", err);
    return '{"error":"Export fehlgeschlagen"}';
  }
}

/**
 * Startet einen Download im Browser.
 */
function triggerDownload(filename: string, content: string): void {
  try {
    const blob = new Blob([content], {
      type: "application/json;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("[exportJSON] Download-Fehler:", err);
  }
}

/**
 * Exportiert einen NodeDetail als JSON-Datei.
 */
export function exportNodeAsJSON(node: NodeDetail): void {
  if (!node) {
    console.warn("[exportJSON] Ungültiger Node:", node);
    return;
  }

  const safeName =
    node.title?.toLowerCase().replace(/[^a-z0-9_-]+/gi, "_").slice(0, 80) ??
    "node";

  const filename = `${safeName}.json`;
  const content = prepare(node);

  triggerDownload(filename, content);
}

/**
 * Exportiert beliebige Daten als JSON.
 */
export function exportAnyJSON(value: unknown, filename = "export.json"): void {
  const content = prepare(value);
  triggerDownload(filename, content);
}
