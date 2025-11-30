// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/details/Breadcrumbs.tsx

import React from "react";

// → Richtiger Import: Typen aus dem Hook, NICHT aus components/types
import type { Breadcrumb } from "../../../hooks/useFunctionsCatalog";

interface Props {
  items: Breadcrumb[];
  onNavigate: (id: string) => void;
}

export default function Breadcrumbs({ items, onNavigate }: Props) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <nav className="fc-breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.id} className="fc-breadcrumb">
            {/* Trennzeichen */}
            {index > 0 && <span className="fc-breadcrumb-sep">›</span>}

            {/* Letztes Element ist nicht klickbar */}
            {isLast ? (
              <span className="fc-breadcrumb-current">{item.title}</span>
            ) : (
              <button
                type="button"
                className="fc-breadcrumb-link"
                onClick={() => onNavigate(item.id)}
                title={item.title}
              >
                {item.title}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
