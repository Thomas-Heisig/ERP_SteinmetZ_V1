// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/features/navigation/NavigationStack.ts

/**
 * NavigationStack - Advanced navigation stack utilities with enhanced functionality
 * 
 * Features:
 * - Pure functional navigation operations
 * - Advanced stack manipulation (replace, insert, remove)
 * - Navigation validation and sanitization
 * - Stack persistence utilities
 * - Navigation analytics and metrics
 * - Type-safe operations with comprehensive error handling
 * 
 * These are pure utility functions that can be used by reducers, managers, or external modules.
 */

import type { NavigationEntry, NavigationParams } from "../../types";

// ============================================================================
// Type Definitions
// ============================================================================

export interface NavigationStackState {
  history: NavigationEntry[];
  index: number;
  maxSize?: number;
}

export interface NavigationStackOptions {
  maxSize?: number;
  duplicatePrevention?: boolean;
  autoPrune?: boolean;
}

export interface NavigationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface NavigationMetrics {
  totalNavigations: number;
  backOperations: number;
  forwardOperations: number;
  averageStackDepth: number;
  mostVisitedViews: string[];
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_MAX_SIZE = 100;
const DEFAULT_OPTIONS: Required<NavigationStackOptions> = {
  maxSize: DEFAULT_MAX_SIZE,
  duplicatePrevention: true,
  autoPrune: true
};

// ============================================================================
// Core Stack Operations
// ============================================================================

/**
 * Creates an empty navigation stack with optional configuration
 */
export function createEmptyStack(options: NavigationStackOptions = {}): NavigationStackState {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  return {
    history: [],
    index: -1,
    maxSize: mergedOptions.maxSize
  };
}

/**
 * Gets the current navigation entry
 */
export function current(state: NavigationStackState): NavigationEntry | null {
  if (state.index < 0 || state.index >= state.history.length) {
    return null;
  }
  return state.history[state.index];
}

/**
 * Gets the previous navigation entry (if any)
 */
export function previous(state: NavigationStackState): NavigationEntry | null {
  if (state.index <= 0 || state.index >= state.history.length) {
    return null;
  }
  return state.history[state.index - 1];
}

/**
 * Gets the next navigation entry (if any)
 */
export function next(state: NavigationStackState): NavigationEntry | null {
  if (state.index < 0 || state.index >= state.history.length - 1) {
    return null;
  }
  return state.history[state.index + 1];
}

// ============================================================================
// Navigation Operations
// ============================================================================

/**
 * Pushes a new navigation entry onto the stack
 */
export function push(
  state: NavigationStackState,
  entry: NavigationEntry,
  options: NavigationStackOptions = {}
): NavigationStackState {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  let history = state.history;
  let index = state.index;

  // Validate the new entry
  const validation = validateNavigationEntry(entry);
  if (!validation.isValid) {
    console.warn('Invalid navigation entry:', validation.errors);
    throw new Error(`Invalid navigation entry: ${validation.errors.join(', ')}`);
  }

  // Remove forward history if we're not at the end
  if (index < history.length - 1) {
    history = history.slice(0, index + 1);
  }

  // Check for duplicates if prevention is enabled
  if (mergedOptions.duplicatePrevention && history.length > 0) {
    const lastEntry = history[history.length - 1];
    if (areEntriesEqual(lastEntry, entry)) {
      // Return current state if it's a duplicate of the last entry
      return state;
    }
  }

  // Add the new entry
  const newHistory = [...history, entry];
  const newIndex = newHistory.length - 1;

  // Apply size limits if needed
  const finalHistory = mergedOptions.autoPrune 
    ? pruneHistory(newHistory, mergedOptions.maxSize!)
    : newHistory;
  const finalIndex = Math.min(newIndex, finalHistory.length - 1);

  return {
    history: finalHistory,
    index: finalIndex,
    maxSize: state.maxSize
  };
}

/**
 * Navigates back in the history
 */
export function pop(state: NavigationStackState): NavigationStackState {
  if (state.index <= 0) {
    return state; // Already at the beginning
  }

  return {
    history: state.history,
    index: state.index - 1,
    maxSize: state.maxSize
  };
}

/**
 * Navigates forward in the history
 */
export function forward(state: NavigationStackState): NavigationStackState {
  if (state.index >= state.history.length - 1) {
    return state; // Already at the end
  }

  return {
    history: state.history,
    index: state.index + 1,
    maxSize: state.maxSize
  };
}

/**
 * Replaces the current entry with a new one (no history change)
 */
export function replace(
  state: NavigationStackState,
  entry: NavigationEntry
): NavigationStackState {
  if (state.index < 0 || state.index >= state.history.length) {
    return push(state, entry);
  }

  const validation = validateNavigationEntry(entry);
  if (!validation.isValid) {
    console.warn('Invalid navigation entry:', validation.errors);
    return state;
  }

  const newHistory = [...state.history];
  newHistory[state.index] = entry;

  return {
    history: newHistory,
    index: state.index,
    maxSize: state.maxSize
  };
}

// ============================================================================
// Advanced Stack Operations
// ============================================================================

/**
 * Clears the entire navigation stack
 */
export function clearStack(options: NavigationStackOptions = {}): NavigationStackState {
  return createEmptyStack(options);
}

/**
 * Clears all entries after the current index (forward history)
 */
export function clearForward(state: NavigationStackState): NavigationStackState {
  if (state.index >= state.history.length - 1) {
    return state; // No forward history to clear
  }

  return {
    history: state.history.slice(0, state.index + 1),
    index: state.index,
    maxSize: state.maxSize
  };
}

/**
 * Jumps to a specific point in the history
 */
export function jumpToIndex(state: NavigationStackState, targetIndex: number): NavigationStackState {
  if (targetIndex < 0 || targetIndex >= state.history.length) {
    console.warn('Invalid target index:', targetIndex);
    return state;
  }

  return {
    history: state.history,
    index: targetIndex,
    maxSize: state.maxSize
  };
}

/**
 * Finds and jumps to an entry by ID
 */
export function jumpToEntry(state: NavigationStackState, entryId: string): NavigationStackState {
  const targetIndex = state.history.findIndex(entry => entry.id === entryId);
  
  if (targetIndex === -1) {
    console.warn('Entry not found:', entryId);
    return state;
  }

  return jumpToIndex(state, targetIndex);
}

/**
 * Removes a specific entry from the history
 */
export function removeEntry(state: NavigationStackState, entryId: string): NavigationStackState {
  const entryIndex = state.history.findIndex(entry => entry.id === entryId);
  
  if (entryIndex === -1) {
    return state; // Entry not found
  }

  const newHistory = state.history.filter(entry => entry.id !== entryId);
  let newIndex = state.index;

  // Adjust current index if we removed the current entry or an entry before it
  if (entryIndex <= state.index) {
    newIndex = Math.max(0, state.index - 1);
  }

  // If we removed the current entry and it was the only one
  if (newHistory.length === 0) {
    newIndex = -1;
  }

  return {
    history: newHistory,
    index: newIndex,
    maxSize: state.maxSize
  };
}

// ============================================================================
// Status Queries
// ============================================================================

/**
 * Checks if backward navigation is possible
 */
export function canGoBack(state: NavigationStackState): boolean {
  return state.index > 0;
}

/**
 * Checks if forward navigation is possible
 */
export function canGoForward(state: NavigationStackState): boolean {
  return state.index < state.history.length - 1;
}

/**
 * Gets the total number of entries in the history
 */
export function totalEntries(state: NavigationStackState): number {
  return state.history.length;
}

/**
 * Gets the current position in the history (1-based)
 */
export function currentPosition(state: NavigationStackState): number {
  return state.index + 1;
}

/**
 * Checks if the stack is empty
 */
export function isEmpty(state: NavigationStackState): boolean {
  return state.history.length === 0;
}

/**
 * Checks if the stack is at maximum capacity
 */
export function isFull(state: NavigationStackState): boolean {
  return state.maxSize !== undefined && state.history.length >= state.maxSize;
}

// ============================================================================
// Validation & Sanitization
// ============================================================================

/**
 * Validates a navigation entry
 */
export function validateNavigationEntry(entry: NavigationEntry): NavigationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field checks
  if (!entry.id || typeof entry.id !== 'string') {
    errors.push('Entry must have a valid string ID');
  }

  if (!entry.view || typeof entry.view !== 'string') {
    errors.push('Entry must have a valid view identifier');
  }

  if (!entry.timestamp || !(entry.timestamp instanceof Date)) {
    errors.push('Entry must have a valid timestamp');
  }

  if (!entry.title || typeof entry.title !== 'string') {
    warnings.push('Entry should have a descriptive title');
  }

  // Parameter validation
  if (entry.params && typeof entry.params !== 'object') {
    errors.push('Params must be an object if provided');
  }

  // ID format validation (optional)
  if (entry.id && entry.id.length > 100) {
    warnings.push('Entry ID is unusually long');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitizes a navigation entry (creates a clean copy)
 */
export function sanitizeNavigationEntry(entry: Partial<NavigationEntry>): NavigationEntry {
  const now = new Date();
  
  return {
    id: entry.id || generateEntryId(),
    view: entry.view || 'unknown',
    params: entry.params || {},
    timestamp: entry.timestamp || now,
    title: entry.title || 'Untitled',
    ...entry
  };
}

/**
 * Compares two navigation entries for equality
 */
export function areEntriesEqual(a: NavigationEntry, b: NavigationEntry): boolean {
  if (a === b) return true;
  
  return (
    a.id === b.id &&
    a.view === b.view &&
    JSON.stringify(a.params) === JSON.stringify(b.params) &&
    a.timestamp.getTime() === b.timestamp.getTime() &&
    a.title === b.title
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generates a unique ID for navigation entries
 */
export function generateEntryId(): string {
  return `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Prunes the history to fit within maximum size
 */
function pruneHistory(history: NavigationEntry[], maxSize: number): NavigationEntry[] {
  if (history.length <= maxSize) {
    return history;
  }

  // Keep the most recent entries
  return history.slice(history.length - maxSize);
}

/**
 * Creates a navigation entry with automatic timestamp and ID
 */
export function createNavigationEntry(
  view: string,
  params: NavigationParams = {},
  title?: string
): NavigationEntry {
  return {
    id: generateEntryId(),
    view,
    params,
    timestamp: new Date(),
    title: title || view
  };
}

/**
 * Calculates navigation metrics for analytics
 */
export function calculateMetrics(state: NavigationStackState): NavigationMetrics {
  const viewCounts: Record<string, number> = {};
  
  state.history.forEach(entry => {
    viewCounts[entry.view] = (viewCounts[entry.view] || 0) + 1;
  });

  const mostVisited = Object.entries(viewCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([view]) => view);

  return {
    totalNavigations: state.history.length,
    backOperations: Math.max(0, state.history.length - state.index - 1),
    forwardOperations: state.index,
    averageStackDepth: state.history.length,
    mostVisitedViews: mostVisited
  };
}

/**
 * Serializes the navigation stack for persistence
 */
export function serializeStack(state: NavigationStackState): string {
  const serializableState = {
    ...state,
    history: state.history.map(entry => ({
      ...entry,
      timestamp: entry.timestamp.toISOString()
    }))
  };
  
  return JSON.stringify(serializableState);
}

/**
 * Deserializes a navigation stack from persisted data
 */
export function deserializeStack(serialized: string): NavigationStackState {
  try {
    const parsed = JSON.parse(serialized);
    
    return {
      ...parsed,
      history: parsed.history.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }))
    };
  } catch (error) {
    console.error('Failed to deserialize navigation stack:', error);
    return createEmptyStack();
  }
}

// ============================================================================
// Export
// ============================================================================

export default {
  createEmptyStack,
  current,
  previous,
  next,
  push,
  pop,
  forward,
  replace,
  clearStack,
  clearForward,
  jumpToIndex,
  jumpToEntry,
  removeEntry,
  canGoBack,
  canGoForward,
  totalEntries,
  currentPosition,
  isEmpty,
  isFull,
  validateNavigationEntry,
  sanitizeNavigationEntry,
  areEntriesEqual,
  generateEntryId,
  createNavigationEntry,
  calculateMetrics,
  serializeStack,
  deserializeStack
};