// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/search/SearchItem.tsx

import React from "react";
import type { SearchResult } from "../types";

interface Props {
  item: SearchResult;
  onSelect: (id: string) => void;
}

export default function SearchItem({ item, onSelect }: Props) {
  const handleSelect = () => onSelect(item.id);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect();
    }
  };

  const itemExtended = item as SearchResult & {
    highlight?: { content?: unknown };
    description?: unknown;
  };

  const hasPath = Array.isArray(item.path) && item.path.length > 0;
  const hasHighlight = Array.isArray(itemExtended.highlight?.content);
  const hasDescription = typeof itemExtended.description === "string";

  return (
    <div
      className="fc-search-item"
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKey}
    >
      {/* Titel + Badge */}
      <div className="fc-search-item-title">
        {item.icon && (
          <span className="fc-search-icon" aria-hidden="true">
            {item.icon}
          </span>
        )}

        <span>{item.title}</span>

        {item.kind && <span className="fc-badge">{item.kind}</span>}
      </div>

      {/* Beschreibung (optional, da im aktuellen Modell nicht enthalten) */}
      {hasDescription && (
        <div className="fc-search-item-description">
          {String(itemExtended.description)}
        </div>
      )}

      {/* Pfad */}
      {hasPath && (
        <div className="fc-search-item-path">{item.path.join(" / ")}</div>
      )}

      {/* Highlight Treffer (optional) */}
      {hasHighlight && (
        <div className="fc-search-item-highlight">
          {(itemExtended.highlight?.content as string[]).join(" ")}
        </div>
      )}

      {/* Score (optional) */}
      {typeof item.score === "number" && (
        <div className="fc-search-item-score">
          Score: {item.score.toFixed(2)}
        </div>
      )}
    </div>
  );
}
