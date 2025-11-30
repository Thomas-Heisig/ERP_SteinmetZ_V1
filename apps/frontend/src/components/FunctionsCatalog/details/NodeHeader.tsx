// src/components/FunctionsCatalog/details/NodeHeader.tsx
import React from "react";
import type { NodeDetail } from "../../../hooks/useFunctionsCatalog";

interface Props {
  node: NodeDetail;
}

export default function NodeHeader({ node }: Props) {
  const icon = node.icon ?? "📄";

  /** Sicherstellen, dass ui existiert */
  const ui = node.ui ?? {
    isForm: false,
    isWorkflow: false,
    isReport: false,
    isDataset: false,
    isAction: false,
  };

  /** UI-Badges erzeugen */
  const uiBadges: string[] = [];
  if (ui.isForm) uiBadges.push("Formular");
  if (ui.isWorkflow) uiBadges.push("Workflow");
  if (ui.isReport) uiBadges.push("Bericht");
  if (ui.isDataset) uiBadges.push("Dataset");
  if (ui.isAction) uiBadges.push("Aktion");

  /** Tags: optional, da nicht in NodeDetail definiert */
  const tags = Array.isArray((node as any).tags)
    ? (node as any).tags as string[]
    : [];

  return (
    <header className="fc-node-header">
      {/* Icon */}
      <div className="fc-node-icon">{icon}</div>

      {/* Titel */}
      <div className="fc-node-title">{node.title}</div>

      {/* Kind (z. B. action, workflow, dataset …) */}
      <span className="fc-node-kind">{node.kind}</span>

      {/* UI-Badges */}
      {uiBadges.map((b) => (
        <span key={b} className="fc-badge">
          {b}
        </span>
      ))}

      {/* Tags */}
      {tags.map((tag) => (
        <span key={tag} className="fc-badge fc-badge-tag">
          #{tag}
        </span>
      ))}
    </header>
  );
}
