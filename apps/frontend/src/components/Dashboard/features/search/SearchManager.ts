// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/features/search/SearchManager.ts

/**
 * SearchManager - Advanced search logic core for the dashboard
 *
 * Features:
 * - Comprehensive search pipeline with multiple stages
 * - Advanced scoring and ranking algorithms
 * - Configurable search strategies
 * - Performance monitoring and analytics
 * - Caching and optimization strategies
 * - Extensible plugin system
 * - Error handling and fallback mechanisms
 *
 * Pure business logic - no UI, no global state management
 */

import { createLogger } from "../../../../utils/logger";

const logger = createLogger("SearchManager");

import type {
  SearchResult,
  SearchFilters,
  SearchManager as SearchManagerInterface,
  SortCriteria,
  NodeDetail,
  SearchMetadata,
} from "../../types";

import {
  advancedSearch,
  type FilterResult,
  type FilterOptions,
  type WeightedSearchResult,
} from "./SearchFilter";

import { applyScoring, sortResults } from "./SearchHelpers";

// ============================================================================
// Type Definitions
// ============================================================================

export interface SearchOptions extends FilterOptions {
  enableCaching?: boolean;
  cacheTimeout?: number;
  maxResults?: number;
  searchStrategy?: "standard" | "advanced" | "fuzzy" | "exact";
  enableAnalytics?: boolean;
  boostRecent?: boolean;
  fieldBoosts?: Record<string, number>;
}

export interface SearchContext {
  query: string;
  filters?: SearchFilters;
  options: SearchOptions;
  timestamp: Date;
  executionId: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  hasMore: boolean;
  context: SearchContext;
  performance: {
    totalTime: number;
    fetchTime: number;
    filterTime: number;
    scoreTime: number;
    sortTime: number;
  };
  metadata: {
    appliedFilters: string[];
    searchStrategy: string;
    resultBreakdown: Record<string, number>;
  };
}

export interface SearchPlugin {
  name: string;
  preProcess?(query: string, context: SearchContext): string | Promise<string>;
  postProcess?(
    results: SearchResult[],
    context: SearchContext,
  ): SearchResult[] | Promise<SearchResult[]>;
  scoreEnhancer?(
    results: WeightedSearchResult[],
    context: SearchContext,
  ): WeightedSearchResult[] | Promise<WeightedSearchResult[]>;
}

export interface CacheEntry {
  results: SearchResult[];
  timestamp: number;
  context: SearchContext;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_SEARCH_OPTIONS: Required<SearchOptions> = {
  enableCaching: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  maxResults: 100,
  searchStrategy: "standard",
  enableAnalytics: true,
  boostRecent: true,
  fieldBoosts: {
    title: 2.0,
    description: 1.0,
    tags: 1.5,
  },
  // FilterOptions
  caseSensitive: false,
  exactMatch: false,
  fuzzyThreshold: 0.3,
};

const SEARCH_STRATEGIES = {
  standard: { fuzzyThreshold: 0.3, boostRecent: true },
  advanced: {
    fuzzyThreshold: 0.1,
    boostRecent: true,
    fieldBoosts: { title: 3.0, tags: 2.0 },
  },
  fuzzy: { fuzzyThreshold: 0.05, boostRecent: false },
  exact: { exactMatch: true, fuzzyThreshold: 0.8 },
};

// ============================================================================
// Main Class
// ============================================================================

export class SearchManager implements SearchManagerInterface {
  private plugins: SearchPlugin[] = [];
  private cache: Map<string, CacheEntry> = new Map();
  private searchHistory: SearchContext[] = [];
  private dataSource: NodeDetail[] = [];

  constructor(initialData: NodeDetail[] = []) {
    this.dataSource = initialData;
  }

  // ============================================================================
  // Core Search Operations
  // ============================================================================

  /**
   * Executes a comprehensive search with full pipeline
   */

  async search(
    query: string,
    filters?: SearchFilters,
    options: SearchOptions = {},
  ): Promise<SearchResult[]> {
    const executionId = this.generateExecutionId();

    const mergedOptions = {
      ...DEFAULT_SEARCH_OPTIONS,
      ...options,
    };

    const context: SearchContext = {
      query,
      filters,
      options: mergedOptions,
      timestamp: new Date(),
      executionId,
    };

    try {
      // -----------------------------------------------------
      // 1) Cache Check
      // -----------------------------------------------------
      if (mergedOptions.enableCaching) {
        const cached = this.getCachedResults(query, filters, mergedOptions);
        if (cached) {
          return cached;
        }
      }

      // const totalStart = performance.now();

      // -----------------------------------------------------
      // 2) Pre-Processing
      // -----------------------------------------------------
      const processedQuery = await this.preProcessQuery(query, context);

      // -----------------------------------------------------
      // 3) Data Fetching
      // -----------------------------------------------------
      // const fetchStart = performance.now();
      const baseResults = await this.fetchResults(processedQuery, context);
      // const fetchTime = performance.now() - fetchStart;

      // -----------------------------------------------------
      // 4) Filtering
      // -----------------------------------------------------
      // const filterStart = performance.now();
      const filtered = this.applyFiltering(
        baseResults,
        processedQuery,
        filters,
        mergedOptions,
      );
      // const filterTime = performance.now() - filterStart;

      // -----------------------------------------------------
      // 5) Scoring
      // -----------------------------------------------------
      // const scoreStart = performance.now();
      const scored = await this.applyScoring(
        filtered.results,
        processedQuery,
        context,
      );
      // const scoreTime = performance.now() - scoreStart;

      // -----------------------------------------------------
      // 6) Sorting
      // -----------------------------------------------------
      // const sortStart = performance.now();
      const sorted = this.applySorting(scored, context);
      // const sortTime = performance.now() - sortStart;

      // -----------------------------------------------------
      // 7) Post-Processing
      // -----------------------------------------------------
      const finalResults = await this.postProcessResults(sorted, context);

      // const totalTime = performance.now() - totalStart;

      // -----------------------------------------------------
      // 8) Cache Results
      // -----------------------------------------------------
      if (mergedOptions.enableCaching) {
        this.cacheResults(query, filters, mergedOptions, finalResults, context);
      }

      // -----------------------------------------------------
      // 9) Analytics
      // -----------------------------------------------------
      if (mergedOptions.enableAnalytics) {
        this.recordSearchHistory(context);
      }

      // -----------------------------------------------------
      // 10) Return Results
      // -----------------------------------------------------
      return finalResults;
    } catch (err) {
      console.error("Search execution failed:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      throw new Error(`Search failed: ${message}`);
    }
  }

  /**
   * Filters results with advanced options
   */
  filter(
    results: SearchResult[],
    filters: SearchFilters,
    options: FilterOptions = {},
  ): SearchResult[] {
    try {
      const filterResult = advancedSearch(results, filters, options);

      if (process.env.NODE_ENV === "development") {
        logger.debug("Filter Performance", {
          inputCount: results.length,
          outputCount: filterResult.results.length,
          executionTime: `${filterResult.context.executionTime.toFixed(2)}ms`,
        });
      }

      return filterResult.results;
    } catch (error) {
      console.error("Filter operation failed:", error);
      return results;
    }
  }

  /**
   * Sorts results according to criteria
   */
  sort(results: SearchResult[], criteria: SortCriteria): SearchResult[] {
    try {
      return sortResults(results, criteria);
    } catch (error) {
      console.error("Sort operation failed:", error);
      // Return original results as fallback
      return results;
    }
  }

  // ============================================================================
  // Search Pipeline Stages
  // ============================================================================

  /**
   * Pre-processes search query
   */
  private async preProcessQuery(
    query: string,
    _context: SearchContext,
  ): Promise<string> {
    let processedQuery = query.trim();

    // Apply plugin pre-processing
    for (const plugin of this.plugins) {
      if (plugin.preProcess) {
        const result = await plugin.preProcess(processedQuery, _context);
        if (result) {
          processedQuery = result;
        }
      }
    }

    // Apply search strategy adjustments
    const strategy =
      SEARCH_STRATEGIES[_context.options.searchStrategy || "standard"];
    if (strategy) {
      // Could apply strategy-specific query transformations here
    }

    return processedQuery;
  }

  /**
   * Applies filtering stage
   */
  private applyFiltering(
    results: SearchResult[],
    query: string,
    filters: SearchFilters | undefined,
    options: SearchOptions,
  ): FilterResult {
    const searchFilters: SearchFilters = {
      query,
      ...filters,
      categories: filters?.categories || [],
      nodeTypes: filters?.nodeTypes || [],
      tags: filters?.tags || [],
      dateRange: filters?.dateRange,
    };

    return advancedSearch(results, searchFilters, options);
  }

  /**
   * Applies scoring and ranking stage
   */
  private async applyScoring(
    results: SearchResult[],
    query: string,
    _context: SearchContext,
  ): Promise<WeightedSearchResult[]> {
    let scoredResults: WeightedSearchResult[] = applyScoring(
      results,
      query,
    ) as WeightedSearchResult[];

    // Apply field boosts
    // Apply field boosts
    if (_context.options.fieldBoosts) {
      scoredResults = scoredResults.map((result) => ({
        ...result,
        computedRelevance:
          result.computedRelevance *
          (_context.options.fieldBoosts?.[result.metadata.nodeType] || 1),
      }));
    }
    // Apply recency boosting
    // Apply recency boosting
    if (_context.options.boostRecent) {
      const now = Date.now();
      scoredResults = scoredResults.map((result) => ({
        ...result,
        computedRelevance:
          result.computedRelevance *
          (1 +
            Math.max(
              0,
              (now -
                (result.metadata.lastModified
                  ? new Date(result.metadata.lastModified).getTime()
                  : now)) /
                (30 * 24 * 60 * 60 * 1000),
            )),
      }));
    }
    // Apply plugin score enhancements
    for (const plugin of this.plugins) {
      if (plugin.scoreEnhancer) {
        scoredResults = await plugin.scoreEnhancer(scoredResults, _context);
      }
    }

    return scoredResults;
  }

  /**
   * Applies sorting stage
   */
  private applySorting(
    results: WeightedSearchResult[],
    _context: SearchContext,
  ): SearchResult[] {
    // For weighted results, sort by computed relevance
    return results.sort((a, b) => b.computedRelevance - a.computedRelevance);
  }

  /**
   * Post-processes final results
   */
  private async postProcessResults(
    results: SearchResult[],
    _context: SearchContext,
  ): Promise<SearchResult[]> {
    let processedResults = results;

    // Apply plugin post-processing
    for (const plugin of this.plugins) {
      if (plugin.postProcess) {
        processedResults = await plugin.postProcess(processedResults, _context);
      }
    }

    // Apply result limit
    if (
      _context.options.maxResults &&
      processedResults.length > _context.options.maxResults
    ) {
      processedResults = processedResults.slice(0, _context.options.maxResults);
    }

    return processedResults;
  }

  // ============================================================================
  // Data Source Management
  // ============================================================================

  /**
   * Fetches results from data source
   */
  private async fetchResults(
    query: string,
    _context: SearchContext,
  ): Promise<SearchResult[]> {
    // Convert NodeDetail[] to SearchResult[]
    const searchResults: SearchResult[] = this.dataSource.map((node) => ({
      id: node.id,
      type: "NODE",
      title: node.title || node.name,
      description: node.description,
      category: node.category,
      relevance: 0, // Will be calculated later
      metadata: {
        nodeType: node.type,
        tags: node.tags,
        lastModified: node.updatedAt,
        category: node.category,
        ...node.metadata,
      } as SearchMetadata,
    }));

    // If we have a query, do initial filtering
    if (query.trim()) {
      return searchResults.filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          (result.description?.toLowerCase().includes(query.toLowerCase()) ??
            false) ||
          result.metadata.tags.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase()),
          ),
      );
    }

    return searchResults;
  }

  /**
   * Updates the data source
   */
  updateDataSource(data: NodeDetail[]): void {
    this.dataSource = data;
    // Clear cache when data source changes
    this.cache.clear();
  }

  /**
   * Gets the current data source stats
   */
  getDataSourceStats(): {
    totalNodes: number;
    categories: string[];
    nodeTypes: string[];
  } {
    const categories = Array.from(
      new Set(this.dataSource.map((node) => node.category)),
    );
    const nodeTypes = Array.from(
      new Set(this.dataSource.map((node) => node.type)),
    );

    return {
      totalNodes: this.dataSource.length,
      categories,
      nodeTypes,
    };
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  /**
   * Gets cached results if available and valid
   */
  private getCachedResults(
    query: string,
    filters: SearchFilters | undefined,
    options: SearchOptions,
  ): SearchResult[] | null {
    const mergedOptions = { ...DEFAULT_SEARCH_OPTIONS, ...options };
    const cacheKey = this.generateCacheKey(query, filters, options);
    const entry = this.cache.get(cacheKey);

    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > mergedOptions.cacheTimeout) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.results;
  }

  /**
   * Caches search results
   */
  private cacheResults(
    query: string,
    filters: SearchFilters | undefined,
    options: SearchOptions,
    results: SearchResult[],
    _context: SearchContext,
  ): void {
    const cacheKey = this.generateCacheKey(query, filters, options);
    this.cache.set(cacheKey, {
      results,
      timestamp: Date.now(),
      context: _context,
    });

    // Limit cache size
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * Generates cache key from search parameters
   */
  private generateCacheKey(
    query: string,
    filters: SearchFilters | undefined,
    options: SearchOptions,
  ): string {
    const keyParts = [query, JSON.stringify(filters), JSON.stringify(options)];

    return btoa(keyParts.join("|")).substring(0, 50);
  }

  /**
   * Clears the search cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  // ============================================================================
  // Plugin System
  // ============================================================================

  /**
   * Registers a search plugin
   */
  use(plugin: SearchPlugin): void {
    this.plugins.push(plugin);
  }

  /**
   * Unregisters a search plugin
   */
  unuse(pluginName: string): void {
    this.plugins = this.plugins.filter((plugin) => plugin.name !== pluginName);
  }

  /**
   * Gets registered plugins
   */
  getPlugins(): SearchPlugin[] {
    return [...this.plugins];
  }

  // ============================================================================
  // Analytics and History
  // ============================================================================

  /**
   * Records search history for analytics
   */
  private recordSearchHistory(context: SearchContext): void {
    this.searchHistory.push(context);

    // Limit history size
    if (this.searchHistory.length > 1000) {
      this.searchHistory = this.searchHistory.slice(-500);
    }
  }

  /**
   * Gets search history
   */
  getSearchHistory(): SearchContext[] {
    return [...this.searchHistory];
  }

  /**
   * Clears search history
   */
  clearSearchHistory(): void {
    this.searchHistory = [];
  }

  /**
   * Gets search analytics
   */
  getSearchAnalytics(): {
    totalSearches: number;
    popularQueries: Array<{ query: string; count: number }>;
    averageResults: number;
    searchTiming: { average: number; min: number; max: number };
  } {
    const totalSearches = this.searchHistory.length;

    const queryCounts: Record<string, number> = {};
    let totalResults = 0;
    const timings: number[] = [];

    this.searchHistory.forEach((context) => {
      queryCounts[context.query] = (queryCounts[context.query] || 0) + 1;
      // Note: Actual result counts would need to be stored in history
      totalResults += 1; // Placeholder
      timings.push(0); // Placeholder - would need timing data
    });

    const popularQueries = Object.entries(queryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    return {
      totalSearches,
      popularQueries,
      averageResults: totalSearches > 0 ? totalResults / totalSearches : 0,
      searchTiming: {
        average:
          timings.length > 0
            ? timings.reduce((a, b) => a + b) / timings.length
            : 0,
        min: timings.length > 0 ? Math.min(...timings) : 0,
        max: timings.length > 0 ? Math.max(...timings) : 0,
      },
    };
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Creates a standardized search response
   */
  private createSearchResponse(
    results: SearchResult[],
    _context: SearchContext,
    totalTime: number,
    fromCache: boolean,
    stageTimings?: {
      fetchTime: number;
      filterTime: number;
      scoreTime: number;
      sortTime: number;
    },
    _filterContext?: FilterResult,
  ): SearchResponse {
    const resultBreakdown: Record<string, number> = {};
    results.forEach((result) => {
      const type = result.type;
      resultBreakdown[type] = (resultBreakdown[type] || 0) + 1;
    });

    return {
      results,
      totalCount: results.length,
      hasMore: false, // Could be implemented with pagination
      context: _context,
      performance: {
        totalTime,
        fetchTime: stageTimings?.fetchTime || 0,
        filterTime: stageTimings?.filterTime || 0,
        scoreTime: stageTimings?.scoreTime || 0,
        sortTime: stageTimings?.sortTime || 0,
      },
      metadata: {
        appliedFilters: [],
        searchStrategy: _context.options.searchStrategy || "standard",
        resultBreakdown,
      },
    };
  }

  /**
   * Generates unique execution ID
   */
  private generateExecutionId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /**
   * Cleans up resources
   */
  destroy(): void {
    this.cache.clear();
    this.searchHistory = [];
    this.plugins = [];
    this.dataSource = [];
  }
}

export default SearchManager;
