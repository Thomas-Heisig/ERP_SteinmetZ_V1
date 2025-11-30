// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/layout/Panel.tsx

import React from "react";

export interface PanelProps {
  title?: string | React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  padded?: boolean;
  ariaLabel?: string;
}

export default function Panel({
  title,
  actions,
  children,
  padded = true,
  ariaLabel,
}: PanelProps) {
  const bodyClass = padded
    ? "fc-panel-body padded"
    : "fc-panel-body";

  return (
    <section
      className="fc-panel"
      {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
    >
      {/* Kopfzeile */}
      {(title || actions) && (
        <header className="fc-panel-header">
          {title && <div className="fc-panel-title">{title}</div>}
          {actions && <div className="fc-panel-actions">{actions}</div>}
        </header>
      )}

      {/* Inhalt */}
      <div className={bodyClass}>{children}</div>

      {/* Inline-Styles als Fallback */}
      <style>
        {`
          .fc-panel {
            background: var(--fc-panel-bg, #ffffff);
            border: 1px solid var(--fc-border, #d1d5db);
            border-radius: 8px;
            padding: 0;
            margin-bottom: 16px;
          }

          .fc-panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid var(--fc-border, #d1d5db);
          }

          .fc-panel-title {
            font-size: 15px;
            font-weight: 600;
            color: var(--fc-text, #111827);
          }

          .fc-panel-actions {
            display: flex;
            gap: 8px;
          }

          .fc-panel-body {
            padding: 12px 16px;
          }

          .fc-panel-body.padded {
            padding: 16px;
          }
        `}
      </style>
    </section>
  );
}
