// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/features/navigation/NavigationManager.ts

/**
 * NavigationManager - Advanced navigation flow controller for the dashboard
 * 
 * Features:
 * - Comprehensive history management with configurable limits
 * - Advanced navigation operations (replace, jump, remove)
 * - Navigation validation and sanitization
 * - Event system for navigation lifecycle
 * - Persistence and restoration capabilities
 * - Analytics and metrics tracking
 * - Middleware support for extensibility
 * 
 * Pure business logic - no UI components
 */

import type {
  NavigationEntry,
  NavigationParams,
  NavigationManager as NavigationManagerInterface,
} from "../../types";

import {
  createEmptyStack,
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
  current,
  previous,
  next,
  totalEntries,
  currentPosition,
  isEmpty,
  isFull,
  validateNavigationEntry,
  sanitizeNavigationEntry,
  createNavigationEntry,
  calculateMetrics,
  serializeStack,
  deserializeStack,
  type NavigationStackState,
  type NavigationStackOptions,
  type NavigationMetrics
} from "./NavigationStack";

// ============================================================================
// ============================================================================
// Type Definitions
// ============================================================================

export interface NavigationEventMap {
  navigationChanged: NavigationEventDetail;
  navigationCancelled: { entry: NavigationEntry; reason: string };
  navigationError: { entry: NavigationEntry; errors: string[] };
  entryRemoved: { entryId: string; from: NavigationEntry | null; to: NavigationEntry | null; timestamp: Date };
  historyCleared: { type: string; from: NavigationEntry | null; to: NavigationEntry | null; timestamp: Date };
  stateRestored: { state: NavigationStackState; timestamp: Date };
  stateImported: { from: NavigationEntry | null; to: NavigationEntry | null; timestamp: Date };
}

export interface NavigationManagerOptions extends NavigationStackOptions {
  enablePersistence?: boolean;
  persistenceKey?: string;
  maxSize?: number;
  enableAnalytics?: boolean;
  enableEvents?: boolean;
}

export interface NavigationEventDetail {
  from: NavigationEntry | null;
  to: NavigationEntry | null;
  operation: string;
  timestamp: Date;
}

export interface NavigationMiddleware {
  (entry: NavigationEntry, operation: string): NavigationEntry | null | Promise<NavigationEntry | null>;
}

// ============================================================================
// Main Class
// ============================================================================

export class NavigationManager implements NavigationManagerInterface {
  private state: NavigationStackState;
  private options: Required<NavigationManagerOptions>;
  private eventTarget: EventTarget;
  private middlewares: NavigationMiddleware[] = [];

  private static readonly DEFAULT_OPTIONS: Required<NavigationManagerOptions> = {
    maxSize: 100,
    duplicatePrevention: true,
    autoPrune: true,
    enableEvents: true,
    enablePersistence: false,
    persistenceKey: 'dashboard_navigation',
    enableAnalytics: true
  };

  constructor(options: NavigationManagerOptions = {}) {
    this.options = { ...NavigationManager.DEFAULT_OPTIONS, ...options };
    this.state = createEmptyStack(this.options);
    this.eventTarget = new EventTarget();
    
    this.initialize();
  }

  /**
   * Initializes the navigation manager
   */
  private initialize(): void {
    // Restore persisted state if enabled
    if (this.options.enablePersistence) {
      this.restoreState();
    }

    // Set up beforeunload handler for persistence
    if (this.options.enablePersistence) {
      window.addEventListener('beforeunload', this.persistState.bind(this));
    }
  }

  // ============================================================================
  // Core Navigation Operations
  // ============================================================================

  /**
   * Navigates to a new view with parameters
   */
  async navigate(view: string, params: NavigationParams = {}): Promise<void> {
    const entry = createNavigationEntry(view, params, params?.title as string);
    
    // Run middlewares
    let processedEntry = entry;
    for (const middleware of this.middlewares) {
      const result = await middleware(processedEntry, 'navigate');
      if (result === null) {
        // Navigation was cancelled by middleware
        this.dispatchEvent('navigationCancelled', { 
          entry: processedEntry, 
          reason: 'middleware' 
        });
        return;
      }
      processedEntry = result || processedEntry;
    }

    // Validate the entry
    const validation = validateNavigationEntry(processedEntry);
    if (!validation.isValid) {
      console.error('Navigation validation failed:', validation.errors);
      this.dispatchEvent('navigationError', { 
        entry: processedEntry, 
        errors: validation.errors 
      });
      throw new Error(`Navigation validation failed: ${validation.errors.join(', ')}`);
    }

    const previousEntry = current(this.state);
    this.state = push(this.state, processedEntry, this.options);
    const newEntry = current(this.state);

    this.dispatchEvent('navigationChanged', {
      from: previousEntry,
      to: newEntry,
      operation: 'navigate',
      timestamp: new Date()
    });

    this.persistState();
  }

  /**
   * Navigates back in history
   */
  async goBack(): Promise<void> {
    if (!this.canGoBack()) {
      return;
    }

    const previousEntry = current(this.state);
    this.state = pop(this.state);
    const newEntry = current(this.state);

    this.dispatchEvent('navigationChanged', {
      from: previousEntry,
      to: newEntry,
      operation: 'goBack',
      timestamp: new Date()
    });

    this.persistState();
  }

  /**
   * Navigates forward in history
   */
  async goForward(): Promise<void> {
    if (!this.canGoForward()) {
      return;
    }

    const previousEntry = current(this.state);
    this.state = forward(this.state);
    const newEntry = current(this.state);

    this.dispatchEvent('navigationChanged', {
      from: previousEntry,
      to: newEntry,
      operation: 'goForward',
      timestamp: new Date()
    });

    this.persistState();
  }

  /**
   * Replaces the current entry without affecting history
   */
  async replace(view: string, params: NavigationParams = {}): Promise<void> {
    const entry = createNavigationEntry(view, params, params?.title as string);
    
    // Run middlewares
    let processedEntry = entry;
    for (const middleware of this.middlewares) {
      const result = await middleware(processedEntry, 'replace');
      if (result === null) {
        this.dispatchEvent('navigationCancelled', { 
          entry: processedEntry, 
          reason: 'middleware' 
        });
        return;
      }
      processedEntry = result || processedEntry;
    }

    const previousEntry = current(this.state);
    this.state = replace(this.state, processedEntry);
    const newEntry = current(this.state);

    this.dispatchEvent('navigationChanged', {
      from: previousEntry,
      to: newEntry,
      operation: 'replace',
      timestamp: new Date()
    });

    this.persistState();
  }

  // ============================================================================
  // Advanced Navigation Operations
  // ============================================================================

  /**
   * Jumps to a specific index in history
   */
  async jumpToIndex(targetIndex: number): Promise<void> {
    const previousEntry = current(this.state);
    this.state = jumpToIndex(this.state, targetIndex);
    const newEntry = current(this.state);

    this.dispatchEvent('navigationChanged', {
      from: previousEntry,
      to: newEntry,
      operation: 'jumpToIndex',
      timestamp: new Date()
    });

    this.persistState();
  }

  /**
   * Jumps to a specific entry by ID
   */
  async jumpToEntry(entryId: string): Promise<void> {
    const previousEntry = current(this.state);
    this.state = jumpToEntry(this.state, entryId);
    const newEntry = current(this.state);

    this.dispatchEvent('navigationChanged', {
      from: previousEntry,
      to: newEntry,
      operation: 'jumpToEntry',
      timestamp: new Date()
    });

    this.persistState();
  }

  /**
   * Removes a specific entry from history
   */
  async removeEntry(entryId: string): Promise<void> {
    const previousEntry = current(this.state);
    this.state = removeEntry(this.state, entryId);
    const newEntry = current(this.state);

    this.dispatchEvent('entryRemoved', {
      entryId,
      from: previousEntry,
      to: newEntry,
      timestamp: new Date()
    });

    this.persistState();
  }

  /**
   * Clears all forward history from current position
   */
  async clearForward(): Promise<void> {
    const previousEntry = current(this.state);
    this.state = clearForward(this.state);
    const newEntry = current(this.state);

    this.dispatchEvent('historyCleared', {
      type: 'forward',
      from: previousEntry,
      to: newEntry,
      timestamp: new Date()
    });

    this.persistState();
  }

  // ============================================================================
  // Status Queries
  // ============================================================================

  /**
   * Checks if backward navigation is possible
   */
  canGoBack(): boolean {
    return canGoBack(this.state);
  }

  /**
   * Checks if forward navigation is possible
   */
  canGoForward(): boolean {
    return canGoForward(this.state);
  }

  /**
   * Gets the current navigation entry
   */
  get current(): NavigationEntry | null {
    return current(this.state);
  }

  /**
   * Gets the previous navigation entry
   */
  get previous(): NavigationEntry | null {
    return previous(this.state);
  }

  /**
   * Gets the next navigation entry
   */
  get next(): NavigationEntry | null {
    return next(this.state);
  }

  /**
   * Gets the complete history
   */
  getHistory(): NavigationEntry[] {
    return [...this.state.history];
  }

  /**
   * Gets the current position in history
   */
  getCurrentPosition(): number {
    return currentPosition(this.state);
  }

  /**
   * Gets the total number of entries
   */
  getTotalEntries(): number {
    return totalEntries(this.state);
  }

  /**
   * Checks if history is empty
   */
  isEmpty(): boolean {
    return isEmpty(this.state);
  }

  /**
   * Checks if history is at maximum capacity
   */
  isFull(): boolean {
    return isFull(this.state);
  }

  // ============================================================================
  // History Management
  // ============================================================================

  /**
   * Clears the entire navigation history
   */
  clear(): void {
    const previousEntry = current(this.state);
    this.state = clearStack(this.options);
    
    this.dispatchEvent('historyCleared', {
      type: 'all',
      from: previousEntry,
      to: null,
      timestamp: new Date()
    });

    this.persistState();
  }

  /**
   * Gets navigation metrics for analytics
   */
  getMetrics(): NavigationMetrics {
    return calculateMetrics(this.state);
  }

  // ============================================================================
  // Event System
  // ============================================================================

  /**
   * Adds an event listener
   */
  addEventListener<K extends keyof NavigationEventMap>(
    type: K,
    listener: (event: CustomEvent<NavigationEventMap[K]>) => void
  ): void {
    this.eventTarget.addEventListener(type as string, listener as EventListener);
  }

  /**
   * Removes an event listener
   */
  removeEventListener<K extends keyof NavigationEventMap>(
    type: K,
    listener: (event: CustomEvent<NavigationEventMap[K]>) => void
  ): void {
    this.eventTarget.removeEventListener(type as string, listener as EventListener);
  }

  /**
   * Dispatches a custom event
   */
  private dispatchEvent<K extends keyof NavigationEventMap>(
    type: K,
    detail: NavigationEventMap[K]
  ): void {
    if (!this.options.enableEvents) return;

    const event = new CustomEvent(type as string, { detail });
    this.eventTarget.dispatchEvent(event);
  }

  // ============================================================================
  // Middleware System
  // ============================================================================

  /**
   * Adds a navigation middleware
   */
  use(middleware: NavigationMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * Removes a navigation middleware
   */
  removeMiddleware(middleware: NavigationMiddleware): void {
    const index = this.middlewares.indexOf(middleware);
    if (index > -1) {
      this.middlewares.splice(index, 1);
    }
  }

  // ============================================================================
  // Persistence
  // ============================================================================

  /**
   * Persists the current state to storage
   */
  private persistState(): void {
    if (!this.options.enablePersistence) return;

    try {
      const serialized = serializeStack(this.state);
      localStorage.setItem(this.options.persistenceKey, serialized);
    } catch (error) {
      console.error('Failed to persist navigation state:', error);
    }
  }

  /**
   * Restores state from storage
   */
  private restoreState(): void {
    if (!this.options.enablePersistence) return;

    try {
      const serialized = localStorage.getItem(this.options.persistenceKey);
      if (serialized) {
        this.state = deserializeStack(serialized);
        this.dispatchEvent('stateRestored', {
          state: this.state,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to restore navigation state:', error);
      // Fall back to empty state
      this.state = createEmptyStack(this.options);
    }
  }

  /**
   * Exports the current state for external use
   */
  exportState(): string {
    return serializeStack(this.state);
  }

  /**
   * Imports state from external source
   */
  importState(serializedState: string): void {
    try {
      const previousEntry = current(this.state);
      this.state = deserializeStack(serializedState);
      const newEntry = current(this.state);

      this.dispatchEvent('stateImported', {
        from: previousEntry,
        to: newEntry,
        timestamp: new Date()
      });

      this.persistState();
    } catch (error) {
      console.error('Failed to import navigation state:', error);
      throw new Error('Invalid navigation state format');
    }
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  /**
   * Updates manager options
   */
  updateOptions(newOptions: Partial<NavigationManagerOptions>): void {
    this.options = { ...this.options, ...newOptions };
    
    // Recreate stack with new options if size-related options changed
    if (newOptions.maxSize !== undefined || newOptions.autoPrune !== undefined) {
      this.state = createEmptyStack(this.options);
    }
  }

  /**
   * Gets current options
   */
  getOptions(): NavigationManagerOptions {
    return { ...this.options };
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /**
   * Cleans up resources
   */
  destroy(): void {
    if (this.options.enablePersistence) {
      window.removeEventListener('beforeunload', this.persistState.bind(this));
    }
    
    this.middlewares = [];
    this.state = createEmptyStack();
    
    // Clear all event listeners
    this.eventTarget = new EventTarget();
  }
}

export default NavigationManager;