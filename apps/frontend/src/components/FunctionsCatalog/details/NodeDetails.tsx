// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/details/NodeDetails.tsx

import React, { memo } from "react";

import NodeHeader from "./NodeHeader";
import Breadcrumbs from "./Breadcrumbs";
import NodeInfoGrid from "./NodeInfoGrid";
import NodeMetaBlocks from "./NodeMetaBlocks";

// ✔ Richtige Typquelle: Hook!
import type { NodeDetail, Breadcrumb } from "../../../hooks/useFunctionsCatalog";

interface Props {
  node: NodeDetail;
  onNavigate: (id: string) => void;
}

const NodeDetails: React.FC<Props> = ({ node, onNavigate }) => {
  if (!node) {
    return (
      <div className="fc-panel">
        <div className="text-gray-500">Keine Details verfügbar.</div>
      </div>
    );
  }

  const hasBreadcrumbs =
    Array.isArray(node.breadcrumbs) && node.breadcrumbs.length > 0;

  return (
    <div className="fc-panel" role="region" aria-label="Node Details">
      
      {/* Kopf (Titel, Icon, Kind, Flags) */}
      <NodeHeader node={node} />

      {/* Breadcrumbs */}
      {hasBreadcrumbs && (
        <Breadcrumbs
          items={node.breadcrumbs as Breadcrumb[]}
          onNavigate={onNavigate}
        />
      )}

      {/* Technische Basis-Infos */}
      <NodeInfoGrid node={node} />

      {/* Meta / Schema / Warnungen / AA */}
      <NodeMetaBlocks node={node} />
    </div>
  );
};

export default memo(NodeDetails);
