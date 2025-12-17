// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/widgets/BasicCardWidget.tsx

import React from "react";
import type { WidgetProps } from "../../types";
import "./BasicCardWidget.css";

/**
 * Convert unknown content to a safe React node
 */
function toReactNode(content: unknown): React.ReactNode {
  if (typeof content === "string" || typeof content === "number") {
    return content;
  }
  if (typeof content === "boolean") {
    return content ? "true" : "false";
  }
  // Safely convert any other type to string
  return String(content);
}

/**
 * BasicCardWidget – einfache Informationskarte.
 * Präsentationskomponente ohne Geschäftslogik.
 */
const BasicCardWidget: React.FC<WidgetProps> = ({ node }) => {
  const { title, content } = node.data;
  const renderedContent: React.ReactNode = content
    ? toReactNode(content)
    : null;

  return (
    <div className="basic-card-widget">
      <h3 className="basic-card-widget__title">{title}</h3>
      {renderedContent && (
        <div className="basic-card-widget__content">{renderedContent}</div>
      )}
    </div>
  );
};

export default BasicCardWidget;
