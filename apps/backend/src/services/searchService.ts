// SPDX-License-Identifier: MIT
// apps/backend/src/services/searchService.ts

/**
 * Enhanced Full-Text Search Service
 *
 * Provides advanced search capabilities including:
 * - Text highlighting
 * - Relevance scoring
 * - Fuzzy matching
 * - Faceted search
 * - Search suggestions
 */

import type { CatalogNode } from "./functionsCatalogService.js";

export interface SearchQuery {
  /** Search query string */
  q?: string;
  /** Filter by node kinds */
  kinds?: string[];
  /** Filter by tags */
  tags?: string[];
  /** Filter by business area */
  area?: string;
  /** Enable fuzzy matching */
  fuzzy?: boolean;
  /** Enable highlighting */
  highlight?: boolean;
  /** Minimum relevance score (0-1) */
  minScore?: number;
}

export interface SearchResult {
  /** The matching node */
  node: CatalogNode;
  /** Relevance score (0-1) */
  score: number;
  /** Highlighted matches (if highlight=true) */
  highlights?: SearchHighlight[];
  /** Matched fields */
  matchedFields: string[];
}

export interface SearchHighlight {
  /** Field that was matched */
  field: string;
  /** Text snippets with matches highlighted */
  snippets: string[];
}

export interface SearchFacets {
  /** Facets by kind */
  kinds: FacetValue[];
  /** Facets by tags */
  tags: FacetValue[];
  /** Facets by area */
  areas: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface SearchSuggestion {
  text: string;
  score: number;
  type: "node" | "tag" | "area";
}

/**
 * Enhanced search service with advanced features
 */
export class SearchService {
  /**
   * Perform enhanced full-text search
   */
  search(
    nodes: CatalogNode[],
    query: SearchQuery,
    pagination?: { limit?: number; offset?: number },
  ): {
    results: SearchResult[];
    total: number;
    facets: SearchFacets;
  } {
    // Filter nodes based on criteria
    let filteredNodes = this.filterNodes(nodes, query);

    // Score and rank results
    const scoredResults = this.scoreNodes(filteredNodes, query);

    // Apply minimum score filter
    const minScore = query.minScore || 0;
    const relevantResults = scoredResults.filter((r) => r.score >= minScore);

    // Sort by relevance
    relevantResults.sort((a, b) => b.score - a.score);

    // Calculate facets before pagination
    const facets = this.calculateFacets(relevantResults.map((r) => r.node));

    // Apply pagination
    const offset = pagination?.offset || 0;
    const limit = pagination?.limit || 50;
    const paginatedResults = relevantResults.slice(offset, offset + limit);

    return {
      results: paginatedResults,
      total: relevantResults.length,
      facets,
    };
  }

  /**
   * Filter nodes based on query criteria
   */
  private filterNodes(nodes: CatalogNode[], query: SearchQuery): CatalogNode[] {
    let filtered = nodes;

    // Filter by kinds
    if (query.kinds && query.kinds.length > 0) {
      filtered = filtered.filter((node) => query.kinds!.includes(node.kind));
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      filtered = filtered.filter((node) => {
        const nodeTags = (node.meta?.tags || []) as string[];
        return query.tags!.some((tag) =>
          nodeTags.some((nt) =>
            String(nt).toLowerCase().includes(tag.toLowerCase()),
          ),
        );
      });
    }

    // Filter by area
    if (query.area) {
      filtered = filtered.filter((node) => {
        const nodeArea = String(node.meta?.businessArea || "");
        return nodeArea.toLowerCase().includes(query.area!.toLowerCase());
      });
    }

    return filtered;
  }

  /**
   * Score nodes based on relevance to query
   */
  private scoreNodes(nodes: CatalogNode[], query: SearchQuery): SearchResult[] {
    if (!query.q || query.q.trim() === "") {
      // No text query - return all with equal score
      return nodes.map((node) => ({
        node,
        score: 0.5,
        matchedFields: [],
        highlights: query.highlight ? [] : undefined,
      }));
    }

    const searchTerms = this.tokenize(query.q);

    return nodes
      .map((node) => {
        const result = this.scoreNode(node, searchTerms, query);
        return result;
      })
      .filter((r) => r.score > 0);
  }

  /**
   * Score a single node against search terms
   */
  private scoreNode(
    node: CatalogNode,
    searchTerms: string[],
    query: SearchQuery,
  ): SearchResult {
    let totalScore = 0;
    const matchedFields: string[] = [];
    const highlights: SearchHighlight[] = [];

    // Search in title (highest weight)
    const titleScore = this.scoreField(
      node.title || "",
      searchTerms,
      3.0,
      query.fuzzy || false,
    );
    if (titleScore > 0) {
      totalScore += titleScore;
      matchedFields.push("title");
      if (query.highlight) {
        highlights.push({
          field: "title",
          snippets: this.highlightText(node.title || "", searchTerms),
        });
      }
    }

    // Search in description (medium weight)
    const descValue = node.meta?.description || "";
    const description =
      typeof descValue === "string" ? descValue : JSON.stringify(descValue);
    const descScore = this.scoreField(
      description,
      searchTerms,
      2.0,
      query.fuzzy || false,
    );
    if (descScore > 0) {
      totalScore += descScore;
      matchedFields.push("description");
      if (query.highlight) {
        highlights.push({
          field: "description",
          snippets: this.highlightText(description, searchTerms, 150),
        });
      }
    }

    // Search in tags (medium-low weight)
    const tags = (node.meta?.tags || []) as string[];
    const tagsText = tags.join(" ");
    const tagsScore = this.scoreField(
      tagsText,
      searchTerms,
      1.5,
      query.fuzzy || false,
    );
    if (tagsScore > 0) {
      totalScore += tagsScore;
      matchedFields.push("tags");
      if (query.highlight) {
        highlights.push({
          field: "tags",
          snippets: this.highlightText(tagsText, searchTerms),
        });
      }
    }

    // Search in ID (lower weight)
    const idScore = this.scoreField(
      node.id,
      searchTerms,
      1.0,
      query.fuzzy || false,
    );
    if (idScore > 0) {
      totalScore += idScore;
      matchedFields.push("id");
    }

    // Normalize score to 0-1 range
    const normalizedScore = Math.min(
      totalScore / (searchTerms.length * 5),
      1.0,
    );

    return {
      node,
      score: normalizedScore,
      matchedFields,
      highlights: query.highlight ? highlights : undefined,
    };
  }

  /**
   * Score a field against search terms
   */
  private scoreField(
    fieldValue: string,
    searchTerms: string[],
    weight: number,
    fuzzy: boolean,
  ): number {
    if (!fieldValue) return 0;

    const normalizedField = fieldValue.toLowerCase();
    let score = 0;

    for (const term of searchTerms) {
      const normalizedTerm = term.toLowerCase();

      // Exact match (highest score)
      if (normalizedField === normalizedTerm) {
        score += weight * 1.0;
        continue;
      }

      // Starts with (high score)
      if (normalizedField.startsWith(normalizedTerm)) {
        score += weight * 0.8;
        continue;
      }

      // Contains (medium score)
      if (normalizedField.includes(normalizedTerm)) {
        score += weight * 0.5;
        continue;
      }

      // Fuzzy match (lower score)
      if (fuzzy && this.fuzzyMatch(normalizedField, normalizedTerm)) {
        score += weight * 0.3;
      }
    }

    return score;
  }

  /**
   * Tokenize search query into terms
   */
  private tokenize(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0);
  }

  /**
   * Simple fuzzy matching (Levenshtein distance)
   * Optimized with early exit conditions
   */
  private fuzzyMatch(text: string, pattern: string, maxDistance = 2): boolean {
    // Early exit for very different lengths
    if (Math.abs(text.length - pattern.length) > maxDistance * 2) {
      return false;
    }

    // Check if pattern exists in text with at most maxDistance edits
    const words = text.split(/\s+/);

    for (const word of words) {
      // Skip words that are too different in length
      if (Math.abs(word.length - pattern.length) > maxDistance * 2) {
        continue;
      }

      if (this.levenshteinDistance(word, pattern) <= maxDistance) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * Optimized with early exit for performance
   */
  private levenshteinDistance(a: string, b: string, maxDistance = 3): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    // Early exit if length difference is too large
    if (Math.abs(a.length - b.length) > maxDistance) {
      return maxDistance + 1;
    }

    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      let minInRow = Infinity;

      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
        minInRow = Math.min(minInRow, matrix[i][j]);
      }

      // Early exit if no cell in this row is within maxDistance
      if (minInRow > maxDistance) {
        return maxDistance + 1;
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Highlight search terms in text
   */
  private highlightText(
    text: string,
    searchTerms: string[],
    maxLength = 200,
  ): string[] {
    if (!text) return [];

    const snippets: string[] = [];
    const normalizedText = text.toLowerCase();

    for (const term of searchTerms) {
      const normalizedTerm = term.toLowerCase();
      let index = normalizedText.indexOf(normalizedTerm);

      while (index !== -1 && snippets.length < 3) {
        // Extract snippet around match
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + normalizedTerm.length + 50);
        let snippet = text.substring(start, end);

        // Add ellipsis
        if (start > 0) snippet = "..." + snippet;
        if (end < text.length) snippet = snippet + "...";

        // Highlight the match
        const matchStart = snippet.toLowerCase().indexOf(normalizedTerm);
        if (matchStart !== -1) {
          snippet =
            snippet.substring(0, matchStart) +
            "<mark>" +
            snippet.substring(matchStart, matchStart + normalizedTerm.length) +
            "</mark>" +
            snippet.substring(matchStart + normalizedTerm.length);
        }

        snippets.push(snippet);

        // Find next occurrence
        index = normalizedText.indexOf(normalizedTerm, index + 1);
      }
    }

    return snippets;
  }

  /**
   * Calculate facets for search results
   */
  private calculateFacets(nodes: CatalogNode[]): SearchFacets {
    const kindCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();
    const areaCounts = new Map<string, number>();

    for (const node of nodes) {
      // Count kinds
      kindCounts.set(node.kind, (kindCounts.get(node.kind) || 0) + 1);

      // Count tags
      const tags = (node.meta?.tags || []) as string[];
      for (const tag of tags) {
        const tagStr = String(tag);
        tagCounts.set(tagStr, (tagCounts.get(tagStr) || 0) + 1);
      }

      // Count areas
      const area = String(node.meta?.businessArea || "Other");
      areaCounts.set(area, (areaCounts.get(area) || 0) + 1);
    }

    return {
      kinds: Array.from(kindCounts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
      tags: Array.from(tagCounts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20), // Top 20 tags
      areas: Array.from(areaCounts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  /**
   * Get search suggestions based on partial query
   */
  getSuggestions(
    nodes: CatalogNode[],
    partialQuery: string,
    limit = 10,
  ): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const normalizedQuery = partialQuery.toLowerCase();

    // Collect unique values
    const nodeTexts = new Set<string>();
    const tags = new Set<string>();
    const areas = new Set<string>();

    for (const node of nodes) {
      if (node.title) nodeTexts.add(node.title);

      const nodeTags = (node.meta?.tags || []) as string[];
      nodeTags.forEach((tag) => tags.add(String(tag)));

      const area = node.meta?.businessArea;
      if (area && typeof area === "string") areas.add(area);
    }

    // Score and filter suggestions
    for (const text of nodeTexts) {
      if (text.toLowerCase().includes(normalizedQuery)) {
        suggestions.push({
          text,
          score: this.scoreField(text, [normalizedQuery], 1.0, false),
          type: "node",
        });
      }
    }

    for (const tag of tags) {
      if (tag.toLowerCase().includes(normalizedQuery)) {
        suggestions.push({
          text: tag,
          score: this.scoreField(tag, [normalizedQuery], 1.0, false),
          type: "tag",
        });
      }
    }

    for (const area of areas) {
      if (area.toLowerCase().includes(normalizedQuery)) {
        suggestions.push({
          text: area,
          score: this.scoreField(area, [normalizedQuery], 1.0, false),
          type: "area",
        });
      }
    }

    // Sort by score and limit
    return suggestions.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}

export const searchService = new SearchService();
