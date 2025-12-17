// src/components/FunctionsCatalog/details/NodeMetaBlocks.tsx
import React from "react";
import type { NodeDetail } from "../../../hooks/useFunctionsCatalog";

interface Props {
  node: NodeDetail;
}

/**
 * Wandelt beliebige Werte sicher in eine string-Darstellung um.
 * React kann unknown nicht direkt rendern – hier wird immer ein
 * gültiger String erzeugt.
 */
function toDisplay(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function NodeMetaBlocks({ node }: Props) {
  const hasMeta = node.meta !== null && node.meta !== undefined;
  const hasAa = node.aa !== null && node.aa !== undefined;
  const hasSchema = node.schema !== null && node.schema !== undefined;
  const hasWarnings = Array.isArray(node.warnings) && node.warnings.length > 0;

  return (
    <div className="fc-meta-blocks">
      {hasMeta && (
        <section>
          <div className="fc-section-title">Meta</div>
          <pre className="fc-code">{toDisplay(node.meta)}</pre>
        </section>
      )}

      {hasAa && (
        <section>
          <div className="fc-section-title">Arbeitsanweisung</div>
          <pre className="fc-code">{toDisplay(node.aa)}</pre>
        </section>
      )}

      {hasSchema && (
        <section>
          <div className="fc-section-title">JSON-Schema</div>
          <pre className="fc-code">{toDisplay(node.schema)}</pre>
        </section>
      )}

      {hasWarnings && (
        <section>
          <div className="fc-section-title">Warnungen</div>
          <ul className="fc-warnings">
            {(node.warnings ?? []).map((w, index) => (
              <li key={index}>{w}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
