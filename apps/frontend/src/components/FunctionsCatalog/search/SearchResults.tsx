// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/search/SearchResults.tsx

import React from "react";
import SearchItem from "./SearchItem";
import type { SearchResult } from "../types";

interface Props {
  results: SearchResult[];
  onSelect: (id: string) => void;
}

export default function SearchResults({ results, onSelect }: Props) {
  const hasResults = Array.isArray(results) && results.length > 0;

  if (!hasResults) {
    return (
      <div className="fc-search-results fc-empty" role="status">
        <div className="fc-empty-text">Keine Ergebnisse gefunden.</div>
      </div>
    );
  }

  return (
    <div className="fc-search-results" role="list">
      {results.map((result) => (
        <div key={result.id} role="listitem">
          <SearchItem item={result} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}
