// SPDX-License-Identifier: MIT
// apps/frontend/src/features/shared/utils.tsx

import React from "react";

/**
 * Configuration for status badges
 */
interface StatusConfig {
  label: string;
  bg: string;
  color: string;
}

/**
 * Default status badge configurations
 */
const DEFAULT_STATUS_CONFIG: Record<string, StatusConfig> = {
  active: {
    label: "Aktiv",
    bg: "var(--success-50)",
    color: "var(--success-600)",
  },
  inactive: {
    label: "Inaktiv",
    bg: "var(--gray-100)",
    color: "var(--gray-600)",
  },
  pending: {
    label: "Ausstehend",
    bg: "var(--warning-50)",
    color: "var(--warning-600)",
  },
  draft: {
    label: "Entwurf",
    bg: "var(--gray-100)",
    color: "var(--gray-600)",
  },
  completed: {
    label: "Abgeschlossen",
    bg: "var(--primary-50)",
    color: "var(--primary-600)",
  },
  cancelled: {
    label: "Abgebrochen",
    bg: "var(--error-50)",
    color: "var(--error-600)",
  },
};

/**
 * Returns a status badge component with appropriate styling
 * @param status - The status string
 * @param customConfig - Optional custom status configurations
 * @param className - Optional CSS class name for the badge
 */
export const getStatusBadge = (
  status: string,
  customConfig?: Record<string, StatusConfig>,
  className?: string,
): React.ReactElement => {
  const config = customConfig || DEFAULT_STATUS_CONFIG;
  const statusConfig = config[status] || DEFAULT_STATUS_CONFIG.active;

  return (
    <span
      className={className}
      style={{
        background: statusConfig.bg,
        color: statusConfig.color,
        padding: "0.25rem 0.75rem",
        borderRadius: "1rem",
        fontSize: "0.875rem",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {statusConfig.label}
    </span>
  );
};

/**
 * Formats a date string to German locale
 * @param dateString - ISO date string
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("de-DE");
};

/**
 * Formats a currency amount to German locale
 * @param amount - The amount to format
 * @param currency - The currency code (default: EUR)
 */
export const formatCurrency = (amount: number, currency = "EUR"): string => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Gets the API base URL from environment or defaults to localhost
 */
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_URL || "http://localhost:3000";
};

/**
 * Constructs a full API endpoint URL
 * @param path - The API path (e.g., "/api/business/companies")
 */
export const getApiUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};
