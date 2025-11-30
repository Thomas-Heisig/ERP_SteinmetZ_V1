// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/utils/debounce.ts

// ============================================================================
// Type Definitions
// ============================================================================

export interface DebounceOptions {
  /** Delay in milliseconds (default: 300ms) */
  delay?: number;
  /** Whether to execute on the leading edge (immediately) */
  leading?: boolean;
  /** Whether to execute on the trailing edge (after delay) */
  trailing?: boolean;
  /** Maximum wait time in milliseconds */
  maxWait?: number | undefined;
}

export interface DebouncedFunction<T extends (...args: any[]) => any> {
  /** The debounced function */
  (...args: Parameters<T>): void;
  /** Cancel pending execution */
  cancel: () => void;
  /** Immediately execute pending call and cancel any pending execution */
  flush: () => void;
  /** Check if there's a pending execution */
  pending: () => boolean;
}

// ============================================================================
// Main Debounce Function
// ============================================================================

/**
 * Advanced debounce function with leading/trailing options and cancellation
 * 
 * @param fn - The function to debounce
 * @param options - Debounce configuration options
 * @returns Debounced function with control methods
 * 
 * @example
 * ```typescript
 * // Basic debounce
 * const debouncedSearch = debounce(searchApi, 300);
 * 
 * // With leading edge (immediate execution on first call)
 * const debouncedSave = debounce(saveData, { 
 *   delay: 1000, 
 *   leading: true 
 * });
 * 
 * // Cancel pending execution
 * debouncedSearch.cancel();
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  options: number | DebounceOptions = {}
): DebouncedFunction<T> {
  const config: Omit<Required<DebounceOptions>, 'maxWait'> & { maxWait: number | undefined } = {
    delay: 300,
    leading: false,
    trailing: true,
    maxWait: undefined,
    ...(typeof options === 'number' ? { delay: options } : options)
  };

  let timer: ReturnType<typeof setTimeout> | null = null;
  let maxTimer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime: number | null = null;
  let lastExecTime: number | null = null;
  let isLeadingCalled = false;

  const clearTimers = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    if (maxTimer !== null) {
      clearTimeout(maxTimer);
      maxTimer = null;
    }
  };

  const execute = (): void => {
    if (lastArgs === null) return;
    
    // Execute the function with the last arguments
    fn(...lastArgs);
    lastExecTime = Date.now();
    lastArgs = null;
    isLeadingCalled = false;
  };

  const debounced = (...args: Parameters<T>): void => {
    const now = Date.now();
    lastArgs = args;
    lastCallTime = now;

    // Leading edge execution (first call)
    if (config.leading && !isLeadingCalled) {
      isLeadingCalled = true;
      execute();
    }

    // Clear existing timers
    clearTimers();

    // Trailing edge execution
    if (config.trailing) {
      timer = setTimeout(execute, config.delay);
    }

    // Maximum wait time enforcement
    if (config.maxWait !== undefined) {
      const timeSinceLastExec = lastExecTime ? now - lastExecTime : Infinity;
      const timeSinceLastCall = lastCallTime ? now - lastCallTime : Infinity;
      
      if (timeSinceLastExec >= config.maxWait || timeSinceLastCall >= config.maxWait) {
        execute();
      } else {
        maxTimer = setTimeout(execute, config.maxWait - timeSinceLastExec);
      }
    }
  };

  // Attach control methods
  debounced.cancel = (): void => {
    clearTimers();
    lastArgs = null;
    isLeadingCalled = false;
    lastCallTime = null;
  };

  debounced.flush = (): void => {
    if (timer !== null || maxTimer !== null) {
      execute();
      clearTimers();
    }
  };

  debounced.pending = (): boolean => {
    return timer !== null || maxTimer !== null;
  };

  return debounced;
}

// ============================================================================
// Throttle Function (using debounce internally)
// ============================================================================

/**
 * Throttle function - limits function execution to once per specified period
 * 
 * @param fn - The function to throttle
 * @param delay - Minimum time between executions in milliseconds
 * @returns Throttled function
 * 
 * @example
 * ```typescript
 * const throttledScroll = throttle(handleScroll, 100);
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): DebouncedFunction<T> {
  return debounce(fn, {
    delay,
    leading: true,
    trailing: true,
    maxWait: delay
  });
}

// ============================================================================
// Specialized Debounce Variants
// ============================================================================

/**
 * Debounce with immediate execution on first call
 */
export function debounceLeading<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): DebouncedFunction<T> {
  return debounce(fn, { delay, leading: true, trailing: false });
}

/**
 * Debounce with execution only after delay (no immediate execution)
 */
export function debounceTrailing<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): DebouncedFunction<T> {
  return debounce(fn, { delay, leading: false, trailing: true });
}

/**
 * Debounce with both leading and trailing execution
 */
export function debounceBoth<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): DebouncedFunction<T> {
  return debounce(fn, { delay, leading: true, trailing: true });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a debounced function that returns a promise
 * Useful for async operations like API calls
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: number | DebounceOptions = {}
): {
  (...args: Parameters<T>): Promise<ReturnType<T>>;
  cancel: () => void;
  flush: () => Promise<ReturnType<T> | void>;
  pending: () => boolean;
} {
  let pendingPromise: Promise<ReturnType<T>> | null = null;
  let resolvePending: ((value: ReturnType<T>) => void) | null = null;
  let rejectPending: ((reason?: any) => void) | null = null;

  const debounced = debounce((...args: Parameters<T>) => {
    if (pendingPromise) {
      fn(...args)
        .then(result => {
          if (resolvePending) {
            resolvePending(result);
            resolvePending = null;
            rejectPending = null;
            pendingPromise = null;
          }
        })
        .catch(error => {
          if (rejectPending) {
            rejectPending(error);
            resolvePending = null;
            rejectPending = null;
            pendingPromise = null;
          }
        });
    }
  }, options);

  const asyncDebounced = (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Cancel previous execution but keep the promise
    debounced.cancel();
    
    if (!pendingPromise) {
      pendingPromise = new Promise((resolve, reject) => {
        resolvePending = resolve;
        rejectPending = reject;
      });
    }
    
    debounced(...args);
    return pendingPromise;
  };

  asyncDebounced.cancel = (): void => {
    debounced.cancel();
    if (rejectPending) {
      rejectPending(new Error('Debounced function cancelled'));
      resolvePending = null;
      rejectPending = null;
      pendingPromise = null;
    }
  };

  asyncDebounced.flush = async (): Promise<ReturnType<T> | void> => {
    if (pendingPromise) {
      debounced.flush();
      return pendingPromise;
    }
  };

  asyncDebounced.pending = (): boolean => {
    return debounced.pending() || pendingPromise !== null;
  };

  return asyncDebounced;
}

/**
 * Create a memoized debounced function that returns cached results
 * for same arguments during the debounce period
 */
export function memoizedDebounce<T extends (...args: any[]) => any>(
  fn: T,
  options: number | DebounceOptions = {}
): {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
  clearCache: () => void;
} {
  let cachedResult: ReturnType<T> | undefined;
  let cachedArgs: Parameters<T> | null = null;

  const debounced = debounce((...args: Parameters<T>) => {
    cachedResult = fn(...args);
    cachedArgs = args;
  }, options);

  const memoized = (...args: Parameters<T>): ReturnType<T> | undefined => {
    // Return cached result if arguments are the same
    if (cachedArgs !== null && JSON.stringify(args) === JSON.stringify(cachedArgs)) {
      return cachedResult;
    }
    
    debounced(...args);
    return undefined;
  };

  memoized.cancel = (): void => {
    debounced.cancel();
    cachedResult = undefined;
    cachedArgs = null;
  };

  memoized.flush = (): void => {
    debounced.flush();
  };

  memoized.pending = (): boolean => {
    return debounced.pending();
  };

  memoized.clearCache = (): void => {
    cachedResult = undefined;
    cachedArgs = null;
  };

  return memoized;
}

// ============================================================================
// Default Export
// ============================================================================

export default debounce;