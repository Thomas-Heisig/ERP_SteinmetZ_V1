// SPDX-License-Identifier: MIT
// apps/backend/src/services/filterService.ts

/**
 * Advanced Filter Service
 * Provides functionality for creating and managing saved filters
 */

export interface FilterConfig {
  query?: string;
  kinds?: string[];
  tags?: string[];
  businessArea?: string[];
  annotationStatus?: string[];
  complexityScore?: { min?: number; max?: number };
  createdAfter?: string;
  createdBefore?: string;
  minConfidence?: number;
  hasSchema?: boolean;
  hasMeta?: boolean;
  customFields?: Record<string, any>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filterType: "search" | "annotator" | "batch";
  filterConfig: FilterConfig;
  isPreset: boolean;
  isPublic: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon?: string;
  filterConfig: FilterConfig;
}

export class FilterService {
  private filters: Map<string, SavedFilter> = new Map();

  createFilter(
    filter: Omit<SavedFilter, "id" | "createdAt" | "updatedAt" | "usageCount">
  ): SavedFilter {
    const id = `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

  getFilter(id: string): SavedFilter | null {
    return this.filters.get(id) || null;
  }

  getFilters(filterType?: string, includePublicOnly = false): SavedFilter[] {
    let results = Array.from(this.filters.values());
    
    if (filterType) {
      results = results.filter(f => f.filterType === filterType);
    }
    
    if (includePublicOnly) {
      results = results.filter(f => f.isPublic);
    }
    
    return results.sort((a, b) => b.usageCount - a.usageCount);
  }

  getPresets(filterType?: string): SavedFilter[] {
    let results = Array.from(this.filters.values()).filter(f => f.isPreset);
    
    if (filterType) {
      results = results.filter(f => f.filterType === filterType);
    }
    
    return results;
  }

  updateFilter(
    id: string,
    updates: Partial<Omit<SavedFilter, "id" | "createdAt" | "usageCount">>
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

  deleteFilter(id: string): boolean {
    return this.filters.delete(id);
  }

  incrementUsageCount(id: string): void {
    const filter = this.filters.get(id);
    if (filter) {
      filter.usageCount++;
      this.filters.set(id, filter);
    }
  }

  applyFilter(nodes: any[], filterConfig: FilterConfig): any[] {
    let filtered = [...nodes];

    if (filterConfig.query) {
      const query = filterConfig.query.toLowerCase();
      filtered = filtered.filter(node => 
        node.title?.toLowerCase().includes(query) ||
        node.id?.toLowerCase().includes(query)
      );
    }

    if (filterConfig.kinds && filterConfig.kinds.length > 0) {
      filtered = filtered.filter(node => 
        filterConfig.kinds!.includes(node.kind)
      );
    }

    if (filterConfig.tags && filterConfig.tags.length > 0) {
      filtered = filtered.filter(node => {
        const nodeTags = node.meta_json?.tags || [];
        return filterConfig.tags!.some(tag => nodeTags.includes(tag));
      });
    }

    return filtered;
  }

  async exportFilteredResults(
    nodes: any[],
    format: "json" | "csv" | "excel" = "json"
  ): Promise<string | Buffer> {
    if (format === "json") {
      return JSON.stringify(nodes, null, 2);
    }

    if (format === "csv") {
      if (nodes.length === 0) return "";
      const keys = Object.keys(nodes[0]);
      const rows = nodes.map(node => 
        keys.map(key => JSON.stringify(node[key] || "")).join(",")
      );
      return [keys.join(","), ...rows].join("\n");
    }

    return JSON.stringify(nodes, null, 2);
  }

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
