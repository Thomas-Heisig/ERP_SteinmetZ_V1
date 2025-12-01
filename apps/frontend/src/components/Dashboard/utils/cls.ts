// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/utils/cls.ts

// ============================================================================
// Type Definitions
// ============================================================================

export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | Record<string, boolean>
  | ClassArray;

export interface ClassArray extends Array<ClassValue> {}

export interface ClsOptions {
  /** Custom separator for class names (default: space) */
  separator?: string;
  /** Whether to remove duplicate class names */
  dedupe?: boolean;
  /** Custom filter function for class names */
  filter?: (className: string) => boolean;
}

// ============================================================================
// Main Class Name Composition Function
// ============================================================================

/**
 * Advanced CSS class name composition utility
 *
 * Features:
 * - Handles strings, arrays, objects, and nested structures
 * - Removes falsy values (undefined, null, false, '', 0)
 * - Deduplicates class names
 * - Customizable separator and filtering
 * - Type-safe with comprehensive TypeScript support
 *
 * @param inputs - Class name inputs to combine
 * @param options - Configuration options
 * @returns Combined CSS class string
 *
 * @example
 * ```typescript
 * // Basic usage
 * cls('btn', 'btn-primary', isLoading && 'loading');
 * // → 'btn btn-primary loading'
 *
 * // With objects
 * cls('btn', { 'btn-primary': isPrimary, 'btn-disabled': isDisabled });
 * // → 'btn btn-primary'
 *
 * // With arrays
 * cls(['btn', 'btn-large'], ['btn-primary', null, undefined]);
 * // → 'btn btn-large btn-primary'
 *
 * // With options
 * cls('foo', 'foo', 'bar', { separator: '_', dedupe: true });
 * // → 'foo_bar'
 * ```
 */
export function cls(
  ...inputs: [...ClassValue[], ClsOptions | undefined]
): string {
  // Extract options from last argument if it's an object without class-like properties
  const lastInput = inputs[inputs.length - 1];
  const options: ClsOptions =
    typeof lastInput === "object" &&
    !Array.isArray(lastInput) &&
    !isClassObject(lastInput)
      ? (inputs.pop() as ClsOptions)
      : {};

  const { separator = " ", dedupe = false, filter = () => true } = options;

  const classNames: string[] = [];

  // Process all inputs
  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string") {
      addClassName(classNames, input, filter);
      continue;
    }

    if (typeof input === "number") {
      addClassName(classNames, String(input), filter);
      continue;
    }

    if (Array.isArray(input)) {
      processArray(input, classNames, filter);
      continue;
    }

    if (typeof input === "object" && isClassObject(input)) {
      processObject(input as Record<string, boolean>, classNames, filter);
      continue;
    }
  }

  // Apply deduplication if enabled
  const finalClassNames = dedupe ? [...new Set(classNames)] : classNames;

  return finalClassNames.join(separator);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if an object is a class condition object
 */
function isClassObject(obj: any): boolean {
  if (Array.isArray(obj)) return false;
  if (obj === null) return false;

  // Exclude ClsOptions by checking for known option keys
  if ("separator" in obj || "dedupe" in obj || "filter" in obj) {
    return false;
  }

  // Check if object has any non-class-like properties
  // Class condition objects typically have boolean values
  for (const value of Object.values(obj)) {
    if (typeof value !== "boolean") {
      return false;
    }
  }

  return Object.keys(obj).length > 0;
}

/**
 * Add a class name to the list if it passes the filter
 */
function addClassName(
  classNames: string[],
  className: string,
  filter: (className: string) => boolean,
): void {
  const trimmed = className.trim();
  if (trimmed && filter(trimmed)) {
    classNames.push(trimmed);
  }
}

/**
 * Process array input recursively
 */
function processArray(
  arr: ClassArray,
  classNames: string[],
  filter: (className: string) => boolean,
): void {
  for (const item of arr) {
    if (!item) continue;

    if (typeof item === "string") {
      addClassName(classNames, item, filter);
      continue;
    }

    if (typeof item === "number") {
      addClassName(classNames, String(item), filter);
      continue;
    }

    if (Array.isArray(item)) {
      processArray(item, classNames, filter);
      continue;
    }

    if (typeof item === "object" && isClassObject(item)) {
      processObject(item as Record<string, boolean>, classNames, filter);
      continue;
    }
  }
}

/**
 * Process object input (conditional classes)
 */
function processObject(
  obj: Record<string, boolean>,
  classNames: string[],
  filter: (className: string) => boolean,
): void {
  for (const [className, condition] of Object.entries(obj)) {
    if (condition && className) {
      addClassName(classNames, className, filter);
    }
  }
}

// ============================================================================
// Specialized Variants
// ============================================================================

/**
 * cls function with default deduplication enabled
 */
export function clsx(...inputs: ClassValue[]): string {
  return cls(...inputs, { dedupe: true });
}

/**
 * cls function with custom separator (e.g., for CSS modules)
 */
export function clsWithSeparator(
  separator: string,
  ...inputs: ClassValue[]
): string {
  return cls(...inputs, { separator });
}

/**
 * cls function with custom filtering
 */
export function clsWithFilter(
  filter: (className: string) => boolean,
  ...inputs: ClassValue[]
): string {
  return cls(...inputs, { filter });
}

/**
 * cls function that returns an array of class names instead of a string
 */
export function clsArray(...inputs: ClassValue[]): string[] {
  const result = cls(...inputs, { dedupe: true });
  return result ? result.split(" ").filter(Boolean) : [];
}

// ============================================================================
// Conditional Class Helpers
// ============================================================================

/**
 * Create a conditional class object with type safety
 */
export function classes(
  conditions: Record<string, boolean>,
): Record<string, boolean> {
  return conditions;
}

/**
 * Conditional class helper for common patterns
 */
export function when(
  condition: boolean,
  truthyClass: string,
  falsyClass: string = "",
): string {
  return condition ? truthyClass : falsyClass;
}

/**
 * Switch-based conditional classes
 */
export function switchClass<T extends string | number>(
  value: T,
  cases: Record<T, string>,
  defaultClass: string = "",
): string {
  return cases[value] || defaultClass;
}

// ============================================================================
// Validation and Utility Functions
// ============================================================================

/**
 * Validate if a string contains valid CSS class names
 */
export function isValidClassName(className: string): boolean {
  if (!className || typeof className !== "string") return false;

  // Basic CSS class name validation
  const cssClassRegex = /^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/;
  return cssClassRegex.test(className);
}

/**
 * Remove invalid class names from a class string or array
 */
export function sanitizeClassNames(
  input: string | string[],
  options: { strict?: boolean } = {},
): string {
  const classNames = Array.isArray(input) ? input : input.split(/\s+/);
  const validClassNames = classNames.filter((className) =>
    options.strict ? isValidClassName(className) : Boolean(className?.trim()),
  );

  return validClassNames.join(" ");
}

/**
 * Merge multiple class strings with deduplication
 */
export function mergeClasses(
  ...classStrings: (string | undefined | null)[]
): string {
  const allClassNames: string[] = [];

  for (const classString of classStrings) {
    if (!classString) continue;

    const names = classString.split(/\s+/).filter(Boolean);
    allClassNames.push(...names);
  }

  return [...new Set(allClassNames)].join(" ");
}

// ============================================================================
// Default Export
// ============================================================================

export default cls;
