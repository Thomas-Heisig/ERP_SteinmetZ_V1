// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/features/search/SearchFilter.ts

/**
 * SearchFilter - Advanced search filtering logic for dashboard searches
 *
 * Features:
 * - Comprehensive filter functions with fuzzy matching
 * - Advanced query parsing and tokenization
 * - Weighted relevance scoring
 * - Filter composition and chaining
 * - Performance optimizations
 * - Type-safe filter operations
 * - Extensible filter system
 *
 * Pure business logic - no UI, no side effects
 */

import { createLogger } from "../../../../utils/logger";

import type {
  SearchResult,
  SearchFilters,
  NodeType,
  DateRange,
  SearchMetadata,
} from "../../types";

// ============================================================================
// Type Definitions
// ============================================================================

export interface FilterOptions {
  caseSensitive?: boolean;
  exactMatch?: boolean;
  fuzzyThreshold?: number;
  maxResults?: number;
}

export interface FilterContext {
  originalQuery?: string;
  appliedFilters: string[];
  executionTime: number;
}

export interface FilterResult {
  results: SearchResult[];
  context: FilterContext;
}

export interface WeightedSearchResult extends SearchResult {
  computedRelevance: number;
  matchDetails: {
    titleMatch: number;
    descriptionMatch: number;
    tagMatch: number;
    categoryMatch: number;
    recencyBonus: number;
  };
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_FILTER_OPTIONS: Required<FilterOptions> = {
  caseSensitive: false,
  exactMatch: false,
  fuzzyThreshold: 0.7,
  maxResults: 1000,
};

const RELEVANCE_WEIGHTS = {
  title: 3.0,
  description: 1.5,
  tags: 2.0,
  category: 1.0,
  recency: 0.5,
};

const RECENCY_BONUS_DAYS = 30;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Normalizes text for comparison
 */
function normalizeText(text: string, caseSensitive: boolean = false): string {
  let normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!caseSensitive) {
    normalized = normalized.toLowerCase();
  }
  return normalized;
}

/**
 * Tokenizes a query into search terms
 */
function tokenizeQuery(query: string): string[] {
  return query
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 0)
    .map((term) => normalizeText(term));
}

/**
 * Calculates fuzzy match score between two strings
 */
function fuzzyMatchScore(text: string, pattern: string): number {
  const normalizedText = normalizeText(text);
  const normalizedPattern = normalizeText(pattern);

  if (normalizedText === normalizedPattern) return 1.0;
  if (normalizedText.includes(normalizedPattern)) return 0.8;
  if (normalizedPattern.includes(normalizedText)) return 0.6;

  // Simple substring presence check
  let score = 0;
  const patternTokens = tokenizeQuery(normalizedPattern);
  const textTokens = tokenizeQuery(normalizedText);

  for (const patternToken of patternTokens) {
    for (const textToken of textTokens) {
      if (textToken.includes(patternToken)) {
        score += patternToken.length / textToken.length;
      }
    }
  }

  return Math.min(1.0, score / patternTokens.length);
}

/**
 * Calculates recency bonus based on last modified date
 */
function calculateRecencyBonus(lastModified: Date): number {
  const now = new Date();
  const daysDiff =
    (now.getTime() - lastModified.getTime()) / (1000 * 60 * 60 * 24);

  if (daysDiff <= RECENCY_BONUS_DAYS) {
    return 1.0 - daysDiff / RECENCY_BONUS_DAYS;
  }

  return 0;
}

// ============================================================================
// Core Filter Functions
// ============================================================================

/**
 * Filters results by query with relevance scoring
 */
export function filterByQuery(
  results: SearchResult[],
  query: string,
  options: FilterOptions = {},
): WeightedSearchResult[] {
  if (!query.trim()) {
    return results.map((result) => ({
      ...result,
      computedRelevance: result.relevance,
      matchDetails: {
        titleMatch: 0,
        descriptionMatch: 0,
        tagMatch: 0,
        categoryMatch: 0,
        recencyBonus: calculateRecencyBonus(result.metadata.lastModified),
      },
    }));
  }

  const mergedOptions = { ...DEFAULT_FILTER_OPTIONS, ...options };
  const queryTokens = tokenizeQuery(query);

  return results
    .map((result) => {
      let titleMatch = 0;
      let descriptionMatch = 0;
      let tagMatch = 0;
      let categoryMatch = 0;

      // Calculate match scores for each field
      for (const token of queryTokens) {
        titleMatch += fuzzyMatchScore(result.title, token);

        if (result.description) {
          descriptionMatch += fuzzyMatchScore(result.description, token);
        }

        if (result.metadata.tags) {
          tagMatch += Math.max(
            ...result.metadata.tags.map((tag) => fuzzyMatchScore(tag, token)),
          );
        }

        if (result.category) {
          categoryMatch += fuzzyMatchScore(result.category, token);
        }
      }

      // Normalize scores
      const tokenCount = queryTokens.length;
      titleMatch = tokenCount > 0 ? titleMatch / tokenCount : 0;
      descriptionMatch = tokenCount > 0 ? descriptionMatch / tokenCount : 0;
      tagMatch = tokenCount > 0 ? tagMatch / tokenCount : 0;
      categoryMatch = tokenCount > 0 ? categoryMatch / tokenCount : 0;

      // Calculate recency bonus
      const recencyBonus = calculateRecencyBonus(result.metadata.lastModified);

      // Compute weighted relevance
      const computedRelevance =
        titleMatch * RELEVANCE_WEIGHTS.title +
        descriptionMatch * RELEVANCE_WEIGHTS.description +
        tagMatch * RELEVANCE_WEIGHTS.tags +
        categoryMatch * RELEVANCE_WEIGHTS.category +
        recencyBonus * RELEVANCE_WEIGHTS.recency;

      return {
        ...result,
        computedRelevance,
        matchDetails: {
          titleMatch,
          descriptionMatch,
          tagMatch,
          categoryMatch,
          recencyBonus,
        },
      };
    })
    .filter((result) =>
      mergedOptions.exactMatch
        ? result.computedRelevance > 0
        : result.computedRelevance >= mergedOptions.fuzzyThreshold,
    );
}

/**
 * Filters results by categories
 */
export function filterByCategories(
  results: SearchResult[],
  categories: string[],
  options: FilterOptions = {},
): SearchResult[] {
  if (!categories.length) return results;

  const mergedOptions = { ...DEFAULT_FILTER_OPTIONS, ...options };
  const categorySet = new Set(
    categories.map((cat) =>
      mergedOptions.caseSensitive ? cat : normalizeText(cat),
    ),
  );

  return results.filter((result) => {
    if (!result.category) return false;

    const resultCategory = mergedOptions.caseSensitive
      ? result.category
      : normalizeText(result.category);

    return categorySet.has(resultCategory);
  });
}

/**
 * Filters results by node types
 */
export function filterByNodeTypes(
  results: SearchResult[],
  types: NodeType[],
  options: FilterOptions = {},
): SearchResult[] {
  if (!types.length) return results;

  const typeSet = new Set(types);
  return results.filter((result) => typeSet.has(result.metadata.nodeType));
}

/**
 * Filters results by tags with matching options
 */
export function filterByTags(
  results: SearchResult[],
  tags: string[],
  options: FilterOptions = {},
): SearchResult[] {
  if (!tags.length) return results;

  const mergedOptions = { ...DEFAULT_FILTER_OPTIONS, ...options };
  const tagSet = new Set(
    tags.map((tag) => (mergedOptions.caseSensitive ? tag : normalizeText(tag))),
  );

  return results.filter((result) =>
    result.metadata.tags.some((tag) => {
      const normalizedTag = mergedOptions.caseSensitive
        ? tag
        : normalizeText(tag);
      return tagSet.has(normalizedTag);
    }),
  );
}

/**
 * Filters results by date range
 */
export function filterByDate(
  results: SearchResult[],
  range: DateRange | undefined,
  options: FilterOptions = {},
): SearchResult[] {
  if (!range?.from || !range?.to) return results;

  const from = range.from.getTime();
  const to = range.to.getTime();

  return results.filter((result) => {
    const timestamp = result.metadata.lastModified.getTime();
    return timestamp >= from && timestamp <= to;
  });
}

/**
 * Filters results by minimum relevance score
 */
export function filterByRelevance(
  results: WeightedSearchResult[],
  minRelevance: number = 0.1,
): WeightedSearchResult[] {
  return results.filter((result) => result.computedRelevance >= minRelevance);
}

// ============================================================================
// Advanced Filter Functions
// ============================================================================

/**
 * Filters results by multiple criteria with exact matching
 */
export function filterByExactFields(
  results: SearchResult[],
  fieldMatches: Partial<{
    title: string;
    description: string;
    category: string;
    nodeType: NodeType;
  }>,
  options: FilterOptions = {},
): SearchResult[] {
  let filtered = [...results];
  const mergedOptions = { ...DEFAULT_FILTER_OPTIONS, ...options };

  if (fieldMatches.title) {
    const target = mergedOptions.caseSensitive
      ? fieldMatches.title
      : normalizeText(fieldMatches.title);

    filtered = filtered.filter((result) => {
      const resultTitle = mergedOptions.caseSensitive
        ? result.title
        : normalizeText(result.title);
      return resultTitle === target;
    });
  }

  if (fieldMatches.description) {
    const target = mergedOptions.caseSensitive
      ? fieldMatches.description
      : normalizeText(fieldMatches.description);

    filtered = filtered.filter((result) => {
      if (!result.description) return false;
      const resultDesc = mergedOptions.caseSensitive
        ? result.description
        : normalizeText(result.description);
      return resultDesc === target;
    });
  }

  if (fieldMatches.category) {
    filtered = filterByCategories(filtered, [fieldMatches.category], options);
  }

  if (fieldMatches.nodeType) {
    filtered = filterByNodeTypes(filtered, [fieldMatches.nodeType], options);
  }

  return filtered;
}

/**
 * Combines multiple filters with AND/OR logic
 */
export function combineFilters(
  results: SearchResult[],
  filters: Array<(results: SearchResult[]) => SearchResult[]>,
  logic: "AND" | "OR" = "AND",
): SearchResult[] {
  if (filters.length === 0) return results;

  if (logic === "OR") {
    const allResults = new Map<string, SearchResult>();

    for (const filter of filters) {
      const filtered = filter([...results]);
      filtered.forEach((result) => {
        if (!allResults.has(result.id)) {
          allResults.set(result.id, result);
        }
      });
    }

    return Array.from(allResults.values());
  }

  // AND logic (default)
  return filters.reduce(
    (currentResults, filter) => filter(currentResults),
    results,
  );
}

// ============================================================================
// Main Filter Composition
// ============================================================================

/**
 * Applies search filters with comprehensive options and context
 */
export function applySearchFilters(
  results: SearchResult[],
  filters: SearchFilters,
  options: FilterOptions = {},
): FilterResult {
  const startTime = performance.now();
  const appliedFilters: string[] = [];

  let filteredResults: (SearchResult | WeightedSearchResult)[] = [...results];

  // Apply query filter first (for relevance scoring)
  if (filters.query) {
    filteredResults = filterByQuery(filteredResults, filters.query, options);
    appliedFilters.push("query");
  }

  // Apply category filter
  if (filters.categories && filters.categories.length > 0) {
    filteredResults = filterByCategories(
      filteredResults,
      filters.categories,
      options,
    );
    appliedFilters.push("categories");
  }

  // Apply node type filter
  if (filters.nodeTypes && filters.nodeTypes.length > 0) {
    filteredResults = filterByNodeTypes(
      filteredResults,
      filters.nodeTypes,
      options,
    );
    appliedFilters.push("nodeTypes");
  }

  // Apply tag filter
  if (filters.tags && filters.tags.length > 0) {
    filteredResults = filterByTags(filteredResults, filters.tags, options);
    appliedFilters.push("tags");
  }

  // Apply date filter
  if (filters.dateRange) {
    filteredResults = filterByDate(filteredResults, filters.dateRange, options);
    appliedFilters.push("dateRange");
  }

  // Apply relevance threshold for weighted results
  if (filters.query && options.fuzzyThreshold !== undefined) {
    filteredResults = filterByRelevance(
      filteredResults as WeightedSearchResult[],
      options.fuzzyThreshold,
    );
  }

  // Sort by relevance if query was applied
  if (filters.query) {
    filteredResults = (filteredResults as WeightedSearchResult[]).sort(
      (a, b) => b.computedRelevance - a.computedRelevance,
    );
  }

  // Apply result limit
  if (options.maxResults && filteredResults.length > options.maxResults) {
    filteredResults = filteredResults.slice(0, options.maxResults);
  }

  const executionTime = performance.now() - startTime;

  return {
    results: filteredResults as SearchResult[],
    context: {
      originalQuery: filters.query,
      appliedFilters,
      executionTime,
    },
  };
}

/**
 * Advanced filter application with performance monitoring
 */
export function advancedSearch(
  results: SearchResult[],
  filters: SearchFilters,
  options: FilterOptions = {},
): FilterResult {
  const filterResult = applySearchFilters(results, filters, options);

  const isDev =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.DEV;

  if (isDev) {
    const logger = createLogger("SearchFilter");
    logger.debug("Search Filter Performance", {
      initialResults: results.length,
      filteredResults: filterResult.results.length,
      executionTime: `${filterResult.context.executionTime.toFixed(2)}ms`,
      appliedFilters: filterResult.context.appliedFilters,
      reduction: `${(
        (1 - filterResult.results.length / results.length) *
        100
      ).toFixed(1)}%`,
    });
  }

  return filterResult;
}

// ============================================================================
// Filter Analysis and Utilities
// ============================================================================

/**
 * Analyzes filter effectiveness and statistics
 */
export function analyzeFilterPerformance(
  results: SearchResult[],
  filterResult: FilterResult,
): {
  totalProcessed: number;
  resultsReturned: number;
  filterReduction: number;
  averageRelevance?: number;
  executionTime: number;
} {
  const totalProcessed = results.length;
  const resultsReturned = filterResult.results.length;
  const filterReduction =
    totalProcessed > 0 ? (1 - resultsReturned / totalProcessed) * 100 : 0;

  let averageRelevance: number | undefined;

  if (filterResult.context.originalQuery) {
    const weightedResults = filterResult.results as WeightedSearchResult[];
    if (weightedResults.length > 0) {
      averageRelevance =
        weightedResults.reduce(
          (sum, result) => sum + result.computedRelevance,
          0,
        ) / weightedResults.length;
    }
  }

  return {
    totalProcessed,
    resultsReturned,
    filterReduction,
    averageRelevance,
    executionTime: filterResult.context.executionTime,
  };
}

/**
 * Extracts available filter values from results
 */
export function extractAvailableFilters(results: SearchResult[]): {
  categories: string[];
  nodeTypes: NodeType[];
  tags: string[];
  dateRange: { min: Date; max: Date };
} {
  const categories = new Set<string>();
  const nodeTypes = new Set<NodeType>();
  const tags = new Set<string>();
  let minDate = new Date();
  let maxDate = new Date(0);

  results.forEach((result) => {
    if (result.category) {
      categories.add(result.category);
    }

    nodeTypes.add(result.metadata.nodeType);

    result.metadata.tags.forEach((tag) => {
      tags.add(tag);
    });

    const resultDate = result.metadata.lastModified;
    if (resultDate < minDate) minDate = resultDate;
    if (resultDate > maxDate) maxDate = resultDate;
  });

  return {
    categories: Array.from(categories).sort(),
    nodeTypes: Array.from(nodeTypes).sort(),
    tags: Array.from(tags).sort(),
    dateRange: { min: minDate, max: maxDate },
  };
}

// ============================================================================
// Export
// ============================================================================

export default {
  filterByQuery,
  filterByCategories,
  filterByNodeTypes,
  filterByTags,
  filterByDate,
  filterByRelevance,
  filterByExactFields,
  combineFilters,
  applySearchFilters,
  advancedSearch,
  analyzeFilterPerformance,
  extractAvailableFilters,
  normalizeText,
  tokenizeQuery,
  fuzzyMatchScore,
  calculateRecencyBonus,
};
