// SPDX-License-Identifier: MIT
// apps/frontend/src/config/api.ts

/**
 * API Configuration
 *
 * Centralized configuration for API endpoints.
 * Uses environment variables for flexibility across different environments.
 */

// Base API URL - defaults to localhost for development
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// API endpoints
export const API_ENDPOINTS = {
  // Finance
  finance: {
    invoices: `${API_BASE_URL}/api/finance/invoices`,
    customers: `${API_BASE_URL}/api/finance/customers`,
    suppliers: `${API_BASE_URL}/api/finance/suppliers`,
    payments: `${API_BASE_URL}/api/finance/payments`,
    accounts: `${API_BASE_URL}/api/finance/accounts`,
    transactions: `${API_BASE_URL}/api/finance/transactions`,
    assets: `${API_BASE_URL}/api/finance/assets`,

    // KPIs
    kpi: {
      dashboard: `${API_BASE_URL}/api/finance/kpi/dashboard`,
      liquidity: `${API_BASE_URL}/api/finance/kpi/liquidity`,
      profitability: `${API_BASE_URL}/api/finance/kpi/profitability`,
      efficiency: `${API_BASE_URL}/api/finance/kpi/efficiency`,
      capitalStructure: `${API_BASE_URL}/api/finance/kpi/capital-structure`,
    },

    // Reports
    reports: {
      balanceSheet: `${API_BASE_URL}/api/finance/reports/balance-sheet`,
      profitLoss: `${API_BASE_URL}/api/finance/reports/profit-loss`,
      cashFlow: `${API_BASE_URL}/api/finance/reports/cash-flow`,
      trialBalance: `${API_BASE_URL}/api/finance/reports/trial-balance`,
      aging: `${API_BASE_URL}/api/finance/reports/aging`,
      assetRegister: `${API_BASE_URL}/api/finance/reports/asset-register`,
    },
  },

  // Add other modules as needed
  // hr: { ... },
  // production: { ... },
};

/**
 * Helper function to build URL with query parameters
 */
export function buildUrl(
  baseUrl: string,
  params?: Record<string, any>,
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  return url.toString();
}

/**
 * Helper function for fetch with error handling
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<{ data: T; success: boolean; error?: string }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API fetch error:", error);
    return {
      success: false,
      data: {} as T,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
