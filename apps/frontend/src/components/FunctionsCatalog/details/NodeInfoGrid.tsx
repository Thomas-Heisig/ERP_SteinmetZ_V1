// src/components/FunctionsCatalog/details/NodeInfoGrid.tsx
import React from "react";
import type { NodeDetail } from "../../../hooks/useFunctionsCatalog";

interface Props {
  node: NodeDetail;
}

export default function NodeInfoGrid({ node }: Props) {
  const file = node.source?.file ?? "—";
  const lineStart = node.source?.lineStart ?? "—";
  const lineEnd = node.source?.lineEnd;

  const path = Array.isArray(node.path) ? node.path.join(" / ") : "—";

  // Erweiterte optionale Felder (nicht im NodeDetail-Typ enthalten)
  const extra = node as NodeDetail & { [key: string]: unknown };

  return (
    <div className="fc-grid">
      {/* Quelle */}
      <div className="fc-grid-label">Quelle</div>
      <div className="fc-grid-value">
        {file}:{lineStart}
        {lineEnd ? `–${lineEnd}` : ""}
      </div>

      {/* Gewichtung */}
      <div className="fc-grid-label">Gewichtung</div>
      <div className="fc-grid-value">
        {typeof node.weight === "number" ? node.weight : "—"}
      </div>

      {/* Pfad */}
      <div className="fc-grid-label">Pfad</div>
      <div className="fc-grid-value">{path}</div>

      {/* Status */}
      <div className="fc-grid-label">Status</div>
      <div className="fc-grid-value">{String(extra.status ?? "—")}</div>

      {/* Priorität */}
      <div className="fc-grid-label">Priorität</div>
      <div className="fc-grid-value">{String(extra.priority ?? "—")}</div>

      {/* Tags */}
      <div className="fc-grid-label">Tags</div>
      <div className="fc-grid-value">
        {Array.isArray(extra.tags) && extra.tags.length > 0
          ? extra.tags.join(", ")
          : "—"}
      </div>

      {/* Kategorien */}
      <div className="fc-grid-label">Kategorien</div>
      <div className="fc-grid-value">
        {Array.isArray(extra.categories) && extra.categories.length > 0
          ? extra.categories.join(", ")
          : "—"}
      </div>

      {/* Erstellt */}
      <div className="fc-grid-label">Erstellt am</div>
      <div className="fc-grid-value">{String(extra.createdAt ?? "—")}</div>

      {/* Aktualisiert */}
      <div className="fc-grid-label">Aktualisiert am</div>
      <div className="fc-grid-value">{String(extra.updatedAt ?? "—")}</div>

      {/* Letzter Zugriff */}
      <div className="fc-grid-label">Letzter Zugriff</div>
      <div className="fc-grid-value">{String(extra.lastAccessed ?? "—")}</div>

      {/* Aufrufe */}
      <div className="fc-grid-label">Aufrufe</div>
      <div className="fc-grid-value">{String(extra.viewCount ?? "—")}</div>

      {/* Favoriten */}
      <div className="fc-grid-label">Favorisiert</div>
      <div className="fc-grid-value">{String(extra.favoriteCount ?? "—")}</div>
    </div>
  );
}
