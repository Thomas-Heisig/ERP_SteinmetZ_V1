// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/features/export/exportMarkdown.ts

import type { NodeDetail } from "../../types";

/**
 * Konvertiert beliebige Werte nach Markdown-kompatiblem Text.
 */
function mdValue(input: unknown): string {
  if (input == null) return "`null`";

  if (typeof input === "string") return input;

  try {
    return "```json\n" + JSON.stringify(input, null, 2) + "\n```";
  } catch {
    return String(input);
  }
}

/**
 * Führt den Dateidownload im Browser aus.
 */
function triggerDownload(filename: string, content: string): void {
  try {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("[exportMarkdown] Fehler beim Download:", err);
  }
}

/**
 * Generiert Markdown für einen einzelnen Node.
 */
function buildMarkdown(node: NodeDetail): string {
  const safeTitle = node.title || "Unbenannt";
  const lines: string[] = [];

  /* ------------------------------------------------------------
     Titel / Basisdaten
  ------------------------------------------------------------ */

  lines.push(`# ${safeTitle}`);
  lines.push("");

  lines.push(`**Typ:** \`${node.kind}\``);

  if (node.icon) {
    lines.push(`**Icon:** ${node.icon}`);
  }

  lines.push("");

  /* ------------------------------------------------------------
     Pfad
  ------------------------------------------------------------ */

  if (Array.isArray(node.path) && node.path.length > 0) {
    lines.push("## Pfad");
    lines.push(node.path.join(" / "));
    lines.push("");
  }

  /* ------------------------------------------------------------
     Quelle
  ------------------------------------------------------------ */

  if (node.source) {
    lines.push("## Quelle");
    lines.push(`Datei: \`${node.source.file}\``);

    const start = node.source.lineStart;
    const end = node.source.lineEnd;

    lines.push(
      end ? `Zeilen: ${start}–${end}` : `Zeilen: ${start}`
    );

    lines.push("");
  }

  /* ------------------------------------------------------------
     Gewichtung
  ------------------------------------------------------------ */

  if (typeof node.weight === "number") {
    lines.push("## Gewichtung");
    lines.push(String(node.weight));
    lines.push("");
  }

  /* ------------------------------------------------------------
     Breadcrumbs
  ------------------------------------------------------------ */

  if (Array.isArray(node.breadcrumbs) && node.breadcrumbs.length > 0) {
    lines.push("## Breadcrumbs");
    for (const b of node.breadcrumbs) {
      lines.push(`- ${b.title}`);
    }
    lines.push("");
  }

  /* ------------------------------------------------------------
     Meta
  ------------------------------------------------------------ */

  if (node.meta) {
    lines.push("## Meta");
    lines.push(mdValue(node.meta));
    lines.push("");
  }

  /* ------------------------------------------------------------
     Arbeitsanweisung (AnalyticsMetadata)
  ------------------------------------------------------------ */

  if (node.aa) {
    lines.push("## Arbeitsanweisung / Analytics");
    lines.push(mdValue(node.aa));
    lines.push("");
  }

  /* ------------------------------------------------------------
     Schema
  ------------------------------------------------------------ */

  if (node.schema) {
    lines.push("## JSON-Schema");
    lines.push(mdValue(node.schema));
    lines.push("");
  }

  /* ------------------------------------------------------------
     Warnungen
  ------------------------------------------------------------ */

  if (Array.isArray(node.warnings) && node.warnings.length > 0) {
    lines.push("## Warnungen");
    for (const w of node.warnings) {
      lines.push(`- ⚠️ ${w}`);
    }
    lines.push("");
  }

  /* ------------------------------------------------------------
     Unterknoten
  ------------------------------------------------------------ */

  if (Array.isArray(node.children) && node.children.length > 0) {
    lines.push("## Untergeordnete Elemente");
    for (const c of node.children) {
      lines.push(`- **${c.title}** (\`${c.kind}\`)`);
    }
    lines.push("");
  }

  /* ------------------------------------------------------------
     Abschluss
  ------------------------------------------------------------ */

  lines.push("---");
  lines.push("_Export generiert durch ERP FunctionsCatalog_");

  return lines.join("\n");
}

/**
 * Exportiert einen Node als Markdown-Datei.
 */
export function exportNodeAsMarkdown(node: NodeDetail): void {
  if (!node) {
    console.warn("[exportMarkdown] Ungültiger Node:", node);
    return;
  }

  const filename = `${node.title.replace(/[^a-z0-9_-]+/gi, "_")}.md`;
  const content = buildMarkdown(node);

  triggerDownload(filename, content);
}

/**
 * Exportiert beliebige Daten als Markdown.
 */
export function exportAnyMarkdown(value: unknown, filename = "export.md"): void {
  const content = mdValue(value);
  triggerDownload(filename, content);
}
