// SPDX-License-Identifier: MIT
// apps/backend/src/services/filterService.ts

/**
 * Advanced Filter Service
 *
 * Provides comprehensive filtering capabilities for search results and data collections.
 * Supports creating, saving, and applying complex filters with multiple criteria.
 *
 * Features:
 * - Save and reuse filter configurations
 * - Pre-defined filter presets for common use cases
 * - Public/private filter sharing
 * - Usage tracking for popular filters
 * - Multi-format export (JSON, CSV)
 * - Complex filtering with multiple criteria
 *
 * @example
 * ```typescript
 * import { filterService } from './services/filterService.js';
 *
 * // Create a saved filter
 * const filter = filterService.createFilter({
 *   name: 'High Priority Tasks',
 *   filterType: 'search',
 *   filterConfig: { tags: ['urgent'], hasSchema: true },
 *   isPreset: false,
 *   isPublic: true
 * });
 *
 * // Apply filter to data
 * const filtered = filterService.applyFilter(nodes, filter.filterConfig);
 *
 * // Export results
 * const csv = await filterService.exportFilteredResults(filtered, 'csv');
 * ```
 */

/**
 * Filter configuration options
 *
 * Defines all possible filter criteria that can be applied to data.
 * All fields are optional and can be combined for complex filtering.
 *
 * @interface FilterConfig
 */
interface FilterNode {
  id?: string;
  title?: string;
  kind?: string;
  meta_json?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FilterConfig {
  /** Text search query (searches title and ID fields) */
  query?: string;
  /** Filter by node types/kinds */
  kinds?: string[];
  /** Filter by tags */
  tags?: string[];
  /** Filter by business area categories */
  businessArea?: string[];
  /** Filter by annotation status (pending, complete, failed) */
  annotationStatus?: string[];
  /** Filter by complexity score range (0-10) */
  complexityScore?: { min?: number; max?: number };
  /** Filter items created after this date (ISO 8601) */
  createdAfter?: string;
  /** Filter items created before this date (ISO 8601) */
  createdBefore?: string;
  /** Minimum confidence score (0-1) */
  minConfidence?: number;
  /** Filter items that have schema definitions */
  hasSchema?: boolean;
  /** Filter items that have metadata */
  hasMeta?: boolean;
  /** Custom field filters for extensibility */
  customFields?: Record<string, unknown>;
  /** Field to sort results by */
  sortBy?: string;
  /** Sort order direction */
  sortOrder?: "asc" | "desc";
}

/**
 * Saved filter definition
 *
 * Represents a reusable filter configuration that can be saved and shared.
 *
 * @interface SavedFilter
 */
export interface SavedFilter {
  /** Unique filter identifier */
  id: string;
  /** Human-readable filter name */
  name: string;
  /** Optional description of filter purpose */
  description?: string;
  /** Type of data this filter applies to */
  filterType: "search" | "annotator" | "batch";
  /** The actual filter criteria configuration */
  filterConfig: FilterConfig;
  /** Whether this is a system-provided preset */
  isPreset: boolean;
  /** Whether this filter is visible to all users */
  isPublic: boolean;
  /** User ID who created this filter */
  createdBy?: string;
  /** Creation timestamp (ISO 8601) */
  createdAt: string;
  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
  /** Number of times this filter has been used */
  usageCount: number;
}

/**
 * Filter preset definition
 *
 * Predefined filter configurations for common use cases.
 *
 * @interface FilterPreset
 */
export interface FilterPreset {
  /** Unique preset identifier */
  id: string;
  /** Display name for the preset */
  name: string;
  /** Description of what the preset filters for */
  description: string;
  /** Optional emoji or icon identifier */
  icon?: string;
  /** The filter configuration */
  filterConfig: FilterConfig;
}

/**
 * Filter Service Class
 *
 * Manages the lifecycle of saved filters including creation, retrieval,
 * updates, and deletion. Provides methods for applying filters to data
 * and exporting filtered results.
 */
export class FilterService {
  private filters: Map<string, SavedFilter> = new Map();

  /**
   * Create a new saved filter
   *
   * Generates a unique ID and timestamps, then stores the filter configuration.
   *
   * @param {Omit<SavedFilter, "id" | "createdAt" | "updatedAt" | "usageCount">} filter - Filter data without auto-generated fields
   * @returns {SavedFilter} The created filter with generated fields
   *
   * @example
   * ```typescript
   * const filter = filterService.createFilter({
   *   name: 'Pending Annotations',
   *   filterType: 'annotator',
   *   filterConfig: { annotationStatus: ['pending'] },
   *   isPreset: false,
   *   isPublic: true
   * });
   * ```
   */
  createFilter(
    filter: Omit<SavedFilter, "id" | "createdAt" | "updatedAt" | "usageCount">,
  ): SavedFilter {
    const id = `filter_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date().toISOString();

    const savedFilter: SavedFilter = {
      id,
      ...filter,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
    };

    this.filters.set(id, savedFilter);
    return savedFilter;
  }

  /**
   * Retrieve a saved filter by ID
   *
   * @param {string} id - The filter ID to retrieve
   * @returns {SavedFilter | null} The filter if found, null otherwise
   *
   * @example
   * ```typescript
   * const filter = filterService.getFilter('filter_123');
   * if (filter) {
   *   console.log(`Filter: ${filter.name}`);
   * }
   * ```
   */
  getFilter(id: string): SavedFilter | null {
    return this.filters.get(id) || null;
  }

  /**
   * Get all saved filters with optional filtering
   *
   * Returns filters sorted by usage count (most used first).
   *
   * @param {string} [filterType] - Optional filter type to filter by
   * @param {boolean} [includePublicOnly=false] - If true, only return public filters
   * @returns {SavedFilter[]} Array of matching filters
   *
   * @example
   * ```typescript
   * // Get all public search filters
   * const searchFilters = filterService.getFilters('search', true);
   *
   * // Get all filters
   * const allFilters = filterService.getFilters();
   * ```
   */
  getFilters(filterType?: string, includePublicOnly = false): SavedFilter[] {
    let results = Array.from(this.filters.values());

    if (filterType) {
      results = results.filter((f) => f.filterType === filterType);
    }

    if (includePublicOnly) {
      results = results.filter((f) => f.isPublic);
    }

    return results.sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * Get all preset filters
   *
   * Retrieves only filters marked as presets (system-provided filters).
   *
   * @param {string} [filterType] - Optional filter type to filter by
   * @returns {SavedFilter[]} Array of preset filters
   *
   * @example
   * ```typescript
   * const presets = filterService.getPresets('annotator');
   * ```
   */
  getPresets(filterType?: string): SavedFilter[] {
    let results = Array.from(this.filters.values()).filter((f) => f.isPreset);

    if (filterType) {
      results = results.filter((f) => f.filterType === filterType);
    }

    return results;
  }

  /**
   * Update an existing saved filter
   *
   * Updates the filter and sets the updatedAt timestamp.
   * Cannot update id, createdAt, or usageCount.
   *
   * @param {string} id - The filter ID to update
   * @param {Partial<Omit<SavedFilter, "id" | "createdAt" | "usageCount">>} updates - Fields to update
   * @returns {SavedFilter | null} The updated filter, or null if not found
   *
   * @example
   * ```typescript
   * const updated = filterService.updateFilter('filter_123', {
   *   name: 'Updated Name',
   *   isPublic: false
   * });
   * ```
   */
  updateFilter(
    id: string,
    updates: Partial<Omit<SavedFilter, "id" | "createdAt" | "usageCount">>,
  ): SavedFilter | null {
    const existing = this.filters.get(id);
    if (!existing) return null;

    const updated: SavedFilter = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      usageCount: existing.usageCount,
    };

    this.filters.set(id, updated);
    return updated;
  }

  /**
   * Delete a saved filter
   *
   * @param {string} id - The filter ID to delete
   * @returns {boolean} True if filter was deleted, false if not found
   *
   * @example
   * ```typescript
   * const deleted = filterService.deleteFilter('filter_123');
   * ```
   */
  deleteFilter(id: string): boolean {
    return this.filters.delete(id);
  }

  /**
   * Increment the usage counter for a filter
   *
   * Tracks how often a filter is used. Filters with higher usage counts
   * appear first in getFilters() results.
   *
   * @param {string} id - The filter ID to increment
   *
   * @example
   * ```typescript
   * // Track filter usage
   * filterService.incrementUsageCount('filter_123');
   * ```
   */
  incrementUsageCount(id: string): void {
    const filter = this.filters.get(id);
    if (filter) {
      filter.usageCount++;
      this.filters.set(id, filter);
    }
  }

  /**
   * Apply filter criteria to a dataset
   *
   * Filters the provided array of nodes based on the filter configuration.
   * Supports query string search, kind filtering, and tag filtering.
   *
   * @param {any[]} nodes - Array of data items to filter
   * @param {FilterConfig} filterConfig - Filter criteria to apply
   * @returns {any[]} Filtered array of nodes
   *
   * @example
   * ```typescript
   * const filtered = filterService.applyFilter(allNodes, {
   *   query: 'payment',
   *   kinds: ['action', 'workflow'],
   *   tags: ['finance']
   * });
   * ```
   */
  applyFilter(nodes: FilterNode[], filterConfig: FilterConfig): FilterNode[] {
    let filtered = [...nodes];

    if (filterConfig.query) {
      const query = filterConfig.query.toLowerCase();
      filtered = filtered.filter(
        (node) =>
          node.title?.toLowerCase().includes(query) ||
          node.id?.toLowerCase().includes(query),
      );
    }

    if (filterConfig.kinds && filterConfig.kinds.length > 0) {
      const kinds = filterConfig.kinds;
      filtered = filtered.filter((node) => kinds.includes(node.kind || ""));
    }

    if (filterConfig.tags && filterConfig.tags.length > 0) {
      const tags = filterConfig.tags;
      filtered = filtered.filter((node) => {
        const nodeTags = (node.meta_json?.tags as string[]) || [];
        return tags.some((tag) => nodeTags.includes(tag));
      });
    }

    return filtered;
  }

  /**
   * Export filtered results in various formats
   *
   * Converts filtered data to JSON or CSV format for download/export.
   *
   * @param {any[]} nodes - The filtered data to export
   * @param {"json" | "csv"} [format="json"] - Export format (JSON or CSV)
   * @returns {Promise<string | Buffer>} Formatted data as string or buffer
   *
   * @example
   * ```typescript
   * const filtered = filterService.applyFilter(nodes, config);
   * const csv = await filterService.exportFilteredResults(filtered, 'csv');
   * // Write to file or send as download
   * ```
   */
  async exportFilteredResults(
    nodes: FilterNode[],
    format: "json" | "csv" = "json",
  ): Promise<string | Buffer> {
    if (format === "json") {
      return JSON.stringify(nodes, null, 2);
    }

    if (format === "csv") {
      if (nodes.length === 0) return "";
      const keys = Object.keys(nodes[0]);
      const rows = nodes.map((node) =>
        keys.map((key) => JSON.stringify(node[key] || "")).join(","),
      );
      return [keys.join(","), ...rows].join("\n");
    }

    return JSON.stringify(nodes, null, 2);
  }

  /**
   * Get default filter presets
   *
   * Returns system-provided filter presets for common use cases.
   * These can be used to initialize the filter system or provide quick filters.
   *
   * @returns {FilterPreset[]} Array of default filter presets
   *
   * @example
   * ```typescript
   * const presets = filterService.getDefaultPresets();
   * presets.forEach(preset => {
   *   console.log(`${preset.icon} ${preset.name}: ${preset.description}`);
   * });
   * ```
   */
  getDefaultPresets(): FilterPreset[] {
    return [
      {
        id: "preset-needs-annotation",
        name: "Needs Annotation",
        description: "Nodes that need AI annotation",
        icon: "🤖",
        filterConfig: {
          annotationStatus: ["pending"],
          hasMeta: false,
        },
      },
      {
        id: "preset-high-complexity",
        name: "High Complexity",
        description: "Complex nodes requiring review",
        icon: "⚠️",
        filterConfig: {
          complexityScore: { min: 7 },
        },
      },
    ];
  }
}

export const filterService = new FilterService();
