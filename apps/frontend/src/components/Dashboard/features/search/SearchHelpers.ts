// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/search/SearchHelpers.ts

/**
 * SearchHelpers – Hilfsfunktionen für Scoring, Highlighting und Sortierung.
 * Keine UI, rein logische Utility-Funktionen.
 */

import type { SearchResult, SortCriteria } from "../../types";

/* ============================================================
   1) Einfaches Relevanz-Scoring
   ============================================================ */

export function scoreResult(result: SearchResult, query: string): number {
  if (!query.trim()) return 0;
  const q = query.toLowerCase();

  let score = 0;

  // Titelgewicht
  if (result.title.toLowerCase().includes(q)) {
    score += 5;
  }

  // Beschreibung
  if (result.description?.toLowerCase().includes(q)) {
    score += 3;
  }

  // Tags match
  for (const tag of result.metadata.tags) {
    if (tag.toLowerCase().includes(q)) score += 2;
  }

  return score;
}

export function applyScoring(results: SearchResult[], query: string): SearchResult[] {
  return results.map((r) => ({ ...r, relevance: scoreResult(r, query) }));
}

/* ============================================================
   2) Highlighting
   ============================================================ */

export function highlight(text: string, query: string): string {
  if (!query.trim()) return text;
  const q = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape
  const regex = new RegExp(`(${q})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

/* ============================================================
   3) Sortierungen
   ============================================================ */

export function sortResults(results: SearchResult[], criteria: SortCriteria): SearchResult[] {
  const out = [...results];

  switch (criteria.field) {
    case "RELEVANCE":
      out.sort((a, b) => compare(a.relevance, b.relevance, criteria.direction));
      break;

    case "DATE":
      out.sort((a, b) =>
        compare(
          a.metadata.lastModified.getTime(),
          b.metadata.lastModified.getTime(),
          criteria.direction
        )
      );
      break;

    case "TITLE":
      out.sort((a, b) => compareText(a.title, b.title, criteria.direction));
      break;
  }

  return out;
}

function compare(a: number, b: number, dir: "ASC" | "DESC"): number {
  return dir === "ASC" ? a - b : b - a;
}

function compareText(a: string, b: string, dir: "ASC" | "DESC"): number {
  return dir === "ASC" ? a.localeCompare(b) : b.localeCompare(a);
}