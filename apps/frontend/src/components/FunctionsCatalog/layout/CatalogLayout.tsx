// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/layout/CatalogLayout.tsx

import React from "react";

export interface CatalogLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function CatalogLayout({
  children,
  sidebar,
  footer,
}: CatalogLayoutProps) {
  const hasSidebar = Boolean(sidebar);

  return (
    <div className="fc-root-layout">
      {/* Sidebar (optional) */}
      {hasSidebar && (
        <aside className="fc-sidebar" aria-label="Catalog Sidebar">
          {sidebar}
        </aside>
      )}

      {/* Hauptbereich */}
      <main className="fc-content-area">{children}</main>

      {/* Optionaler Footer */}
      {footer && <footer className="fc-footer">{footer}</footer>}

      {/* Inline-Layout als Fallback */}
      <style>
        {`
          .fc-root-layout {
            display: grid;
            grid-template-columns: ${hasSidebar ? "280px 1fr" : "1fr"};
            grid-template-rows: auto 1fr auto;
            min-height: 100%;
            gap: 0;
            background: var(--fc-bg, #f9fafb);
            color: var(--fc-text, #111827);
          }

          .fc-sidebar {
            border-right: 1px solid var(--fc-border, #d1d5db);
            padding: 12px;
            overflow-y: auto;
            background: var(--fc-sidebar-bg, #ffffff);
          }

          .fc-content-area {
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .fc-footer {
            grid-column: 1 / -1;
            padding: 8px 16px;
            border-top: 1px solid var(--fc-border, #d1d5db);
            color: var(--fc-muted, #6b7280);
            font-size: 12px;
            background: var(--fc-footer-bg, #f3f4f6);
          }
        `}
      </style>
    </div>
  );
}
