// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/core/DashboardContext.ts

import React, {
  createContext,
  useContext,
  Dispatch,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { createLogger } from "../../../utils/logger.js";

import type {
  DashboardState,
  DashboardAction,
  NavigationEntry,
  DashboardHealthState,
} from "../types";

const logger = createLogger("dashboard-context");

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Context value: global state + dispatch
 */
export interface DashboardContextValue {
  state: DashboardState;
  dispatch: Dispatch<DashboardAction>;
  version: string;
  isInitialized: boolean;
}

/**
 * Selector function type with memoization support
 */
export type DashboardSelector<T = unknown> = (state: DashboardState) => T;

/**
 * Equality function for selector comparisons
 */
export type EqualityFn<T = unknown> = (a: T, b: T) => boolean;

/**
 * Configuration for stable selector hook
 */
export interface StableSelectorOptions<T = unknown> {
  equalityFn?: EqualityFn<T>;
  customMemoKey?: string;
}

// ============================================================================
// Constants
// ============================================================================

// Removed unused constants - context version tracking not needed
// DEFAULT_EQUALITY_FN available as inline comparison

// ============================================================================
// Context Creation
// ============================================================================

/**
 * Main Dashboard Context
 */
export const DashboardContext = createContext<DashboardContextValue | null>(
  null,
);

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Deep equality check for objects and arrays
 */
export function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;

  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null
  ) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => {
    if (!(key in (b as Record<string, unknown>))) return false;
    const aRec = a as Record<string, unknown>;
    const bRec = b as Record<string, unknown>;
    return deepEqual(aRec[key], bRec[key]);
  });
}

/**
 * Shallow equality check for performance
 */
export function shallowEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;

  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null
  ) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  const aRec = a as Record<string, unknown>;
  const bRec = b as Record<string, unknown>;
  return keysA.every((key) => aRec[key] === bRec[key]);
}

/**
 * JSON-based equality check (simple but reliable)
 */
export function jsonEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ============================================================================
// Main Hooks
// ============================================================================

/**
 * Base hook for complete access to the Dashboard context
 *
 * @throws {Error} When used outside of DashboardProvider
 * @returns Complete context value including state, dispatch, and metadata
 *
 * @example
 * ```tsx
 * const { state, dispatch, version, isInitialized } = useDashboardContext();
 * ```
 */
export function useDashboardContext(): DashboardContextValue {
  const ctx = useContext(DashboardContext);

  if (!ctx) {
    throw new Error(
      "useDashboardContext must be used within a DashboardProvider. " +
        "Make sure your component is wrapped in <DashboardProvider>.",
    );
  }

  return ctx;
}

/**
 * Selector hook: returns only a specific part of the state with performance optimizations
 *
 * @param selector Function that extracts specific data from the state
 * @param equalityFn Optional custom equality function (default: JSON comparison)
 * @returns Selected state slice
 *
 * @example
 * ```tsx
 * const searchState = useDashboardSelector(state => state.search);
 * const nodeCount = useDashboardSelector(state => state.catalog.roots.length);
 * ```
 */
export function useDashboardSelector<T>(
  selector: DashboardSelector<T>,
  _equalityFn: EqualityFn<T> = jsonEqual,
): T {
  const { state } = useDashboardContext();

  // Derive value directly from state with memoization
  return useMemo(() => selector(state), [selector, state]);
}

/**
 * Stable selector hook with advanced memoization and comparison
 *
 * @param selector Function that extracts specific data from the state
 * @param options Configuration options for comparison and memoization
 * @returns Stable selected state slice
 *
 * @example
 * ```tsx
 * const navigation = useStableDashboardSelector(
 *   state => state.navigation,
 *   { equalityFn: shallowEqual }
 * );
 * ```
 */
export function useStableDashboardSelector<T>(
  selector: DashboardSelector<T>,
  _options: StableSelectorOptions<T> = {},
): T {
  const { state } = useDashboardContext();

  // Derive value directly from state with memoization
  return useMemo(() => selector(state), [selector, state]);
}

/**
 * Dispatch-only hook
 *
 * @returns Dispatch function for sending actions
 *
 * @example
 * ```tsx
 * const dispatch = useDashboardDispatch();
 * dispatch({ type: 'SELECT_NODE', payload: nodeId });
 * ```
 */
export function useDashboardDispatch(): Dispatch<DashboardAction> {
  const { dispatch } = useDashboardContext();
  return dispatch;
}

/**
 * Slice access hook: returns both selected state and dispatch
 *
 * @param selector Function that extracts specific data from the state
 * @param equalityFn Optional custom equality function
 * @returns Tuple containing selected state slice and dispatch function
 *
 * @example
 * ```tsx
 * const [search, dispatch] = useDashboardSlice(state => state.search);
 * ```
 */
export function useDashboardSlice<T>(
  selector: DashboardSelector<T>,
  equalityFn: EqualityFn<T> = jsonEqual,
): [T, Dispatch<DashboardAction>] {
  const { dispatch } = useDashboardContext();

  const selected = useDashboardSelector(selector, equalityFn);

  return [selected, dispatch];
}

// ============================================================================
// Specialized Selector Hooks
// ============================================================================

/**
 * Hook for accessing navigation state with optimized re-renders
 */
export function useDashboardNavigation() {
  return useStableDashboardSelector((state) => state.navigation, {
    equalityFn: shallowEqual,
  });
}

/**
 * Hook for accessing search state with optimized re-renders
 */
export function useDashboardSearch() {
  return useStableDashboardSelector((state) => state.search, {
    equalityFn: shallowEqual,
  });
}

/**
 * Hook for accessing catalog state with optimized re-renders
 */
export function useDashboardCatalog() {
  return useStableDashboardSelector((state) => state.catalog, {
    equalityFn: shallowEqual,
  });
}

/**
 * Hook for accessing health state with optimized re-renders
 */
export function useDashboardHealth() {
  return useStableDashboardSelector((state) => state.health, {
    equalityFn: shallowEqual,
  });
}

/**
 * Hook for accessing UI state with optimized re-renders
 */
export function useDashboardUI() {
  return useStableDashboardSelector((state) => state.ui, {
    equalityFn: shallowEqual,
  });
}

/**
 * Hook for accessing builder state with optimized re-renders
 */
export function useDashboardBuilder() {
  return useStableDashboardSelector((state) => state.builder, {
    equalityFn: shallowEqual,
  });
}

// ============================================================================
// Action Creator Hooks
// ============================================================================

/**
 * Hook for creating pre-bound action dispatchers
 */
export function useDashboardActions() {
  const dispatch = useDashboardDispatch();

  return useMemo(
    () => ({
      // Navigation actions
      navigateTo: (entry: NavigationEntry) =>
        dispatch({ type: "NAV_PUSH", payload: entry }),
      goBack: () => dispatch({ type: "NAV_POP" }),
      selectNode: (nodeId: string) =>
        dispatch({ type: "SELECT_NODE", payload: nodeId }),

      // Search actions
      setSearchQuery: (query: string) =>
        dispatch({ type: "SET_SEARCH_QUERY", payload: query }),
      setSearchActive: (active: boolean) =>
        dispatch({ type: "SET_SEARCH_ACTIVE", payload: active }),
      clearSearch: () => dispatch({ type: "SEARCH_CLEAR" }),

      // UI actions
      setTheme: (theme: "light" | "dark" | "lcars") =>
        dispatch({ type: "SET_THEME", payload: theme }),
      setLanguage: (language: string) =>
        dispatch({ type: "SET_LANGUAGE", payload: language }),
      toggleChat: () => dispatch({ type: "TOGGLE_CHAT" }),

      // Health actions
      updateHealth: (status: DashboardHealthState) =>
        dispatch({ type: "HEALTH_UPDATE", payload: status }),

      // Utility actions
      setLoading: (key: string, value: boolean) =>
        dispatch({ type: "SET_LOADING", payload: { key, value } }),
      setError: (key: string, value: unknown) =>
        dispatch({ type: "SET_ERROR", payload: { key, value } }),
      clearErrors: () => dispatch({ type: "CLEAR_ERRORS" }),
    }),
    [dispatch],
  );
}

// ============================================================================
// Debug and Development Hooks
// ============================================================================

/**
 * Hook for debugging state changes (development only)
 */
export function useDashboardDebug(
  options: {
    enabled?: boolean;
    logChanges?: boolean;
    selector?: DashboardSelector;
  } = {},
) {
  const defaultEnabled =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.MODE === "development";

  const { enabled = defaultEnabled, logChanges = true, selector } = options;
  const { state, version, isInitialized } = useDashboardContext();

  const prevStateRef = useRef<DashboardState | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;

    if (logChanges && prevStateRef.current !== undefined) {
      const changes = findStateChanges(prevStateRef.current, state, selector);
      if (changes.length > 0) {
        logger.debug("Dashboard state changes", { changes });
      }
    }

    prevStateRef.current = state;
  }, [state, enabled, logChanges, selector]);

  return {
    version,
    isInitialized,
    stateSize: JSON.stringify(state).length,
    stateKeys: Object.keys(state),
  };
}

/**
 * Hook for tracking specific state changes
 */
export function useDashboardWatch<T>(
  selector: DashboardSelector<T>,
  callback: (newValue: T, oldValue: T | undefined) => void,
  equalityFn: EqualityFn<T> = jsonEqual,
) {
  const value = useDashboardSelector(selector, equalityFn);
  const prevValueRef = useRef<T | undefined>(undefined);

  useEffect(() => {
    if (
      prevValueRef.current !== undefined &&
      !equalityFn(prevValueRef.current, value)
    ) {
      callback(value, prevValueRef.current);
    }
    prevValueRef.current = value;
  }, [value, callback, equalityFn]);
}

// ============================================================================
// Utility Functions
// ============================================================================

function findStateChanges(
  prevState: DashboardState,
  nextState: DashboardState,
  selector?: DashboardSelector,
): string[] {
  const changes: string[] = [];

  if (selector) {
    const prev = selector(prevState);
    const next = selector(nextState);

    if (!jsonEqual(prev, next)) {
      changes.push(
        `Selector changed: ${JSON.stringify(prev)} → ${JSON.stringify(next)}`,
      );
    }
    return changes;
  }

  (Object.keys(nextState) as Array<keyof DashboardState>).forEach((key) => {
    if (!jsonEqual(prevState[key], nextState[key])) {
      changes.push(`State.${key} changed`);
    }
  });

  return changes;
}

/**
 * Higher-order component für Komponenten, die den Dashboard-Context benötigen.
 */
export function withDashboardContext<P extends object>(
  Wrapped: React.ComponentType<P & { dashboard: DashboardContextValue }>,
): React.FC<P> {
  const WithDashboard: React.FC<P> = (props: P) => {
    const dashboard = useDashboardContext();

    // Kein JSX → vermeidet Parsing-/Type-Probleme mit <Wrapped ... />
    return React.createElement(Wrapped, {
      ...(props as P),
      dashboard,
    });
  };

  // Sinnvolle displayName für Debugging setzen
  const wrappedName =
    (Wrapped as { displayName?: string; name?: string }).displayName ||
    (Wrapped as { displayName?: string; name?: string }).name ||
    "Component";

  WithDashboard.displayName = `WithDashboard(${wrappedName})`;

  return WithDashboard;
}

// ============================================================================
// Default Export
// ============================================================================

export default DashboardContext;
