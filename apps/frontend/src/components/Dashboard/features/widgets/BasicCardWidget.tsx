// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/widgets/BasicCardWidget.tsx

import React from "react";
import type { WidgetProps } from "../../types";

/**
 * BasicCardWidget – einfache Informationskarte.
 * Präsentationskomponente ohne Geschäftslogik.
 */
const BasicCardWidget: React.FC<WidgetProps> = ({ node, config }) => {
  const { title, content } = node.data;

  return (
    <div
      style={{
        padding: "1rem",
        backgroundColor: config.theme.backgroundColor,
        color: config.theme.textColor,
        borderRadius: config.theme.borderRadius ?? 6,
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <h3 style={{ margin: 0 }}>{title}</h3>
      {content && <div style={{ fontSize: "0.9rem" }}>{String(content)}</div>}
    </div>
  );
};

export default BasicCardWidget;
