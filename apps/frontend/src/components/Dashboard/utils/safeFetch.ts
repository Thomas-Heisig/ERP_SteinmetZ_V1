// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/utils/safeFetch.ts

/**
 * safeFetch – Enhanced fetch wrapper with timeout and error handling
 *
 * Features:
 * - Configurable timeout with AbortController
 * - Consistent response structure
 * - Automatic JSON parsing with fallback
 * - Type-safe generic responses
 * - Comprehensive error handling
 * - No external dependencies
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface SafeFetchOptions extends RequestInit {
  /** Request timeout in milliseconds (default: 8000ms) */
  timeout?: number;
  /** Custom error messages for specific status codes */
  errorMessages?: Record<number, string>;
}

export interface SafeFetchResponse<T = any> {
  /** Whether the request was successful (status 200-299) */
  ok: boolean;
  /** HTTP status code */
  status: number;
  /** Response data (parsed JSON or text) */
  data?: T;
  /** Error message if request failed */
  error?: string;
  /** Response headers */
  headers?: Record<string, string>;
  /** URL of the request */
  url?: string;
}

export interface SafeFetchError extends Error {
  /** HTTP status code */
  status: number;
  /** Original error if available */
  originalError?: unknown;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TIMEOUT = 8000;
const DEFAULT_ERROR_MESSAGES: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  408: "Request Timeout",
  409: "Conflict",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

// ============================================================================
// Main Function
// ============================================================================

/**
 * Safe fetch wrapper with timeout and consistent error handling
 *
 * @param url - The URL to fetch
 * @param options - Fetch options with timeout support
 * @returns Promise with standardized response format
 *
 * @example
 * ```typescript
 * const result = await safeFetch<User[]>('/api/users');
 * if (result.ok) {
 *   console.log(result.data); // Type-safe data
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export async function safeFetch<T = any>(
  url: string,
  options: SafeFetchOptions = {},
): Promise<SafeFetchResponse<T>> {
  const {
    timeout = DEFAULT_TIMEOUT,
    errorMessages = {},
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timer);

    // Extract response headers
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Determine content type and parse accordingly
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json") ?? false;
    const isText = contentType?.includes("text/") ?? false;

    let payload: any;

    if (isJson) {
      payload = await response.json();
    } else if (isText) {
      payload = await response.text();
    } else {
      // For other content types (blob, arraybuffer, etc.), return as is
      payload = await response.blob();
    }

    if (!response.ok) {
      const errorMessage = getErrorMessage(
        response.status,
        errorMessages,
        payload,
      );

      return {
        ok: false,
        status: response.status,
        error: errorMessage,
        headers,
        url: response.url,
      };
    }

    return {
      ok: true,
      status: response.status,
      data: payload as T,
      headers,
      url: response.url,
    };
  } catch (error: unknown) {
    clearTimeout(timer);

    const errorResult = handleFetchError(error, url);
    return {
      ok: false,
      status: errorResult.status,
      error: errorResult.message,
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get appropriate error message based on status code and response
 */
function getErrorMessage(
  status: number,
  customMessages: Record<number, string>,
  payload: any,
): string {
  // Priority: custom message → default message → payload message → generic message
  if (customMessages[status]) {
    return customMessages[status];
  }

  if (DEFAULT_ERROR_MESSAGES[status]) {
    return DEFAULT_ERROR_MESSAGES[status];
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (payload?.message) {
    return payload.message;
  }

  if (payload?.error) {
    return payload.error;
  }

  return `HTTP Error ${status}`;
}

/**
 * Handle different types of fetch errors
 */
function handleFetchError(
  error: unknown,
  url: string,
): { status: number; message: string } {
  if (error instanceof Error) {
    switch (error.name) {
      case "AbortError":
        return {
          status: 408,
          message: `Request to ${url} timed out`,
        };

      case "TypeError":
        return {
          status: 0,
          message: `Network error: ${error.message}`,
        };

      case "SyntaxError":
        return {
          status: 0,
          message: `Invalid JSON response from ${url}`,
        };

      default:
        return {
          status: 0,
          message: `Request failed: ${error.message}`,
        };
    }
  }

  return {
    status: 0,
    message: `Unknown error occurred while fetching ${url}`,
  };
}

// ============================================================================
// Convenience Methods
// ============================================================================

/**
 * GET request convenience method
 */
export async function safeGet<T = any>(
  url: string,
  options: Omit<SafeFetchOptions, "method"> = {},
): Promise<SafeFetchResponse<T>> {
  return safeFetch<T>(url, { ...options, method: "GET" });
}

/**
 * POST request convenience method
 */
export async function safePost<T = any>(
  url: string,
  data?: any,
  options: Omit<SafeFetchOptions, "method" | "body"> = {},
): Promise<SafeFetchResponse<T>> {
  return safeFetch<T>(url, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request convenience method
 */
export async function safePut<T = any>(
  url: string,
  data?: any,
  options: Omit<SafeFetchOptions, "method" | "body"> = {},
): Promise<SafeFetchResponse<T>> {
  return safeFetch<T>(url, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request convenience method
 */
export async function safeDelete<T = any>(
  url: string,
  options: Omit<SafeFetchOptions, "method"> = {},
): Promise<SafeFetchResponse<T>> {
  return safeFetch<T>(url, { ...options, method: "DELETE" });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if error is a network error (status 0)
 */
export function isNetworkError(response: SafeFetchResponse): boolean {
  return response.status === 0;
}

/**
 * Check if error is a client error (4xx)
 */
export function isClientError(response: SafeFetchResponse): boolean {
  return response.status >= 400 && response.status < 500;
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(response: SafeFetchResponse): boolean {
  return response.status >= 500 && response.status < 600;
}

/**
 * Check if error is due to timeout
 */
export function isTimeoutError(response: SafeFetchResponse): boolean {
  return (
    response.status === 408 || (response.error?.includes("timed out") ?? false)
  );
}

export default safeFetch;
