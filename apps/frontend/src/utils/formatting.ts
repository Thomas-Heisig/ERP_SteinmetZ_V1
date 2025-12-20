// SPDX-License-Identifier: MIT
// apps/frontend/src/utils/formatting.ts

/**
 * Format number as currency (EUR)
 */
export function formatCurrency(value: number, locale: string = 'de-DE', currency: string = 'EUR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format number as percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format date to locale string
 */
export function formatDate(date: string | Date, locale: string = 'de-DE'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale);
}

/**
 * Format datetime to locale string
 */
export function formatDateTime(date: string | Date, locale: string = 'de-DE'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale);
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number, decimals: number = 0, locale: string = 'de-DE'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
