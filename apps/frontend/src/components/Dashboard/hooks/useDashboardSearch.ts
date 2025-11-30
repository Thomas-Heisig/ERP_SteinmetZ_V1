// SPDX-License-Identifier: MIT
// src/components/Dashboard/hooks/useDashboardSearch.ts

import { useCallback } from "react";
import { useDashboardContext } from "../core/DashboardContext";
import { SearchManager } from "../features/search/SearchManager";
import type { UseDashboardSearch, SearchFilters } from "../types";

/** Default-Filter fallback */
const DEFAULT_FILTERS: SearchFilters = {
  categories: [],
  nodeTypes: [],
  tags: [],
  dateRange: undefined,
};

export function useDashboardSearch(): UseDashboardSearch {
  const { state, dispatch } = useDashboardContext();

  const manager = new SearchManager();

  /** Query setzen */
  const setQuery = useCallback(
    (query: string) => {
      dispatch({ type: "SET_SEARCH_QUERY", payload: query });
    },
    [dispatch]
  );

  /** Filter setzen */
  const setFilters = useCallback(
    (filters: SearchFilters) => {
      dispatch({ type: "SET_SEARCH_FILTERS", payload: filters });
    },
    [dispatch]
  );

  /**
   * Sichere Filter extrahieren
   * → garantiert SearchFilters, niemals string
   */
  const safeFilters: SearchFilters =
    typeof state.search.filters === "object" && state.search.filters !== null
      ? state.search.filters
      : DEFAULT_FILTERS;

  /** Hauptsuche */
  const search = useCallback(
    async (query: string) => {
      dispatch({ type: "SEARCH_START" });

      try {
        const response = await manager.search(query, safeFilters);

        dispatch({
          type: "SEARCH_SUCCESS",
          payload: { query, results: response },
        });
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: { key: "search", value: err },
        });
      }
    },
    [dispatch, manager, safeFilters]
  );

  /** Suche vollständig löschen */
  const clearSearch = useCallback(() => {
    dispatch({ type: "SEARCH_CLEAR" });
  }, [dispatch]);

  /** Output der Hook – 100 % typensicher */
  return {
    query: state.search.query,
    results: state.search.results,

    /** garantiert SearchFilters */
    filters: safeFilters,

    search,
    setFilters,
    clearSearch,

    isLoading: state.search.isLoading ?? false,
    isOpen: state.search.isOpen ?? false,
  };
}

export default useDashboardSearch;
