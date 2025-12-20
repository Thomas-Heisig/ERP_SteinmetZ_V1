// SPDX-License-Identifier: MIT
// apps/backend/src/routes/search/searchService.ts

/**
 * Enhanced Full-Text Search Service
 *
 * Provides advanced search capabilities including:
 * - Text highlighting
 * - Relevance scoring
 * - Fuzzy matching
 * - Faceted search
 * - Search suggestions
 * - Analytics integration
 *
 * @example
 * ```typescript
 * import { searchService } from './searchService.js';
 *
 * // Perform search
 * const result = searchService.search(nodes, {
 *   q: 'customer',
 *   kinds: ['action'],
 *   fuzzy: true,
 *   highlight: true
 * });
 * ```
 */

import { createLogger } from "../../utils/logger.js";
import type { CatalogNode } from "../functionsCatalog/functionsCatalogService.js";

const logger = createLogger("search-service");

/**
 * Search query parameters
 */
export interface SearchQuery {
  /** Search query string - text to search for */
  q?: string;
  /** Filter by node kinds (e.g., 'category', 'action', 'section') */
  kinds?: string[];
  /** Filter by tags - must match at least one tag */
  tags?: string[];
  /** Filter by business area */
  area?: string;
  /** Enable fuzzy matching (allows typos, max distance 2) */
  fuzzy?: boolean;
  /** Enable text highlighting in results */
  highlight?: boolean;
  /** Minimum relevance score (0-1) to include in results */
  minScore?: number;
}

/**
 * Search result with relevance scoring and highlighting
 */
export interface SearchResult {
  /** The matching catalog node */
  node: CatalogNode;
  /** Relevance score (0-1), higher is more relevant */
  score: number;
  /** Highlighted text snippets (only if highlight=true in query) */
  highlights?: SearchHighlight[];
  /** Fields that matched the search query */
  matchedFields: string[];
}

/**
 * Highlighted text snippet from search result
 */
export interface SearchHighlight {
  /** Field name that was matched (e.g., 'title', 'description') */
  field: string;
  /** Text snippets with <mark> tags around matches */
  snippets: string[];
}

/**
 * Faceted search results for filtering
 */
export interface SearchFacets {
  /** Available node kinds with counts */
  kinds: FacetValue[];
  /** Available tags with counts */
  tags: FacetValue[];
  /** Available business areas with counts */
  areas: FacetValue[];
}

/**
 * Facet value with occurrence count
 */
export interface FacetValue {
  /** Facet value (e.g., 'action', 'customer') */
  value: string;
  /** Number of results with this value */
  count: number;
}

/**
 * Search suggestion for autocomplete
 */
export interface SearchSuggestion {
  /** Suggested search text */
  text: string;
  /** Relevance score (0-1) */
  score: number;
  /** Type of suggestion */
  type: "node" | "tag" | "area";
}

/**
 * Enhanced search service with advanced features
 */
export class SearchService {
  /**
   * Perform enhanced full-text search
   *
   * @param nodes - Catalog nodes to search
   * @param query - Search query parameters
   * @param pagination - Optional pagination (limit, offset)
   * @returns Search results with total count and facets
   *
   * @example
   * ```typescript
   * const result = searchService.search(nodes, {
   *   q: 'customer management',
   *   kinds: ['action'],
   *   fuzzy: true,
   *   highlight: true,
   *   minScore: 0.3
   * }, { limit: 10, offset: 0 });
   * ```
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
    const startTime = Date.now();
    logger.debug({ query, nodeCount: nodes.length }, "Starting search");

    try {
      // Filter nodes based on criteria
      const filteredNodes = this.filterNodes(nodes, query);

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

    const duration = Date.now() - startTime;
    logger.info(
      {
        query: query.q,
        totalResults: relevantResults.length,
        returnedResults: paginatedResults.length,
        duration,
      },
      "Search completed",
    );

    return {
      results: paginatedResults,
      total: relevantResults.length,
      facets,
    };
    } catch (error) {
      logger.error({ error, query }, "Search failed");
      // Return empty results on error instead of throwing
      return {
        results: [],
        total: 0,
        facets: { kinds: [], tags: [], areas: [] },
      };
    }
  }

  /**
   * Filter nodes based on query criteria
   *
   * @param nodes - Nodes to filter
   * @param query - Filter criteria
   * @returns Filtered nodes
   */
  private filterNodes(nodes: CatalogNode[], query: SearchQuery): CatalogNode[] {
    if (!nodes || nodes.length === 0) {
      return [];
    }

    let filtered = nodes;

    // Filter by kinds
    if (query.kinds && query.kinds.length > 0) {
      const kinds = query.kinds;
      filtered = filtered.filter((node) => kinds.includes(node.kind));
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      const tags = query.tags;
      filtered = filtered.filter((node) => {
        const nodeTags = (node.meta?.tags || []) as string[];
        return tags.some((tag) =>
          nodeTags.some((nt) =>
            String(nt).toLowerCase().includes(tag.toLowerCase()),
          ),
        );
      });
    }

    // Filter by area
    if (query.area) {
      const area = query.area;
      filtered = filtered.filter((node) => {
        const nodeArea = String(node.meta?.businessArea || "");
        return nodeArea.toLowerCase().includes(area.toLowerCase());
      });
    }

    return filtered;
  }

  /**
   * Score nodes based on relevance to query
   *
   * @param nodes - Nodes to score
   * @param query - Search query
   * @returns Scored search results
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
   *
   * Scoring weights:
   * - Title: 3.0x
   * - Description: 2.0x
   * - Tags: 1.5x
   * - ID: 1.0x
   *
   * @param node - Node to score
   * @param searchTerms - Tokenized search terms
   * @param query - Original search query
   * @returns Scored result
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
   *
   * Score calculation:
   * - Exact match: weight * 2.0
   * - Starts with: weight * 1.5
   * - Contains: weight * 1.0
   * - Fuzzy match: weight * 0.5
   *
   * @param fieldValue - Field value to score
   * @param searchTerms - Search terms
   * @param weight - Field weight multiplier
   * @param fuzzy - Enable fuzzy matching
   * @returns Field score
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
   *
   * @param query - Search query string
   * @returns Array of lowercase terms
   */
  private tokenize(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0);
  }

  /**
   * Simple fuzzy matching using Levenshtein distance
   * Optimized with early exit conditions
   *
   * @param text - Text to search in
   * @param pattern - Pattern to search for
   * @param maxDistance - Maximum edit distance (default: 2)
   * @returns True if pattern matches within maxDistance edits
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
   *
   * @param a - First string
   * @param b - Second string
   * @param maxDistance - Maximum distance before early exit (default: 3)
   * @returns Edit distance between strings
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
   * Highlight search terms in text with <mark> tags
   *
   * @param text - Text to highlight
   * @param searchTerms - Terms to highlight
   * @param _maxLength - Maximum snippet length (unused)
   * @returns Array of highlighted snippets
   */
  private highlightText(
    text: string,
    searchTerms: string[],
    _maxLength = 200,
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
   *
   * @param nodes - Nodes to calculate facets from
   * @returns Facet counts for kinds, tags, and areas
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
   *
   * @param nodes - Catalog nodes to extract suggestions from
   * @param partialQuery - Partial search query
   * @param limit - Maximum number of suggestions (default: 10)
   * @returns Sorted suggestions by relevance score
   *
   * @example
   * ```typescript
   * const suggestions = searchService.getSuggestions(nodes, 'cust', 5);
   * // Returns: [{ text: 'customer', score: 0.9, type: 'node' }, ...]
   * ```
   */
  getSuggestions(
    nodes: CatalogNode[],
    partialQuery: string,
    limit = 10,
  ): SearchSuggestion[] {
    logger.debug({ partialQuery, limit }, "Getting search suggestions");

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
