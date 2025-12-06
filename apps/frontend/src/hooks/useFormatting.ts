// SPDX-License-Identifier: MIT
// apps/frontend/src/hooks/useFormatting.ts
// Custom hook for locale-aware formatting of dates, numbers, and currency

import { useTranslation } from "react-i18next";

/**
 * Hook for formatting dates, numbers, and currency based on current locale
 */
export function useFormatting() {
  const { i18n } = useTranslation();
  const locale = i18n.language || "de";

  /**
   * Format a date according to current locale
   */
  const formatDate = (
    date: Date | string | number,
    style: "short" | "long" | "full" = "short",
  ): string => {
    const d =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;

    if (style === "short") {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);
    }

    if (style === "long") {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(d);
    }

    // full
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  };

  /**
   * Format a time according to current locale
   */
  const formatTime = (date: Date | string | number): string => {
    const d =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;

    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  /**
   * Format a datetime according to current locale
   */
  const formatDateTime = (date: Date | string | number): string => {
    const d =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  /**
   * Format a number with decimal places
   */
  const formatNumber = (
    value: number,
    options?: Intl.NumberFormatOptions,
  ): string => {
    return new Intl.NumberFormat(locale, {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(value);
  };

  /**
   * Format currency according to current locale
   */
  const formatCurrency = (
    value: number,
    currency: string = locale === "en" ? "USD" : "EUR",
  ): string => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(value);
  };

  /**
   * Format percentage
   * @param value - The value to format (0-100 range, will be divided by 100)
   * @param decimals - Number of decimal places (default: 0)
   * @example formatPercent(75.5, 1) => "75.5%" or "75,5%" depending on locale
   */
  const formatPercent = (value: number, decimals: number = 0): string => {
    return new Intl.NumberFormat(locale, {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  };

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  const formatRelativeTime = (date: Date | string | number): string => {
    const d =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return locale === "de" ? "Jetzt" : "Now";
    }
    if (diffMins < 60) {
      return locale === "de"
        ? `vor ${diffMins} Minute${diffMins === 1 ? "" : "n"}`
        : `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
    }
    if (diffHours < 24) {
      return locale === "de"
        ? `vor ${diffHours} Stunde${diffHours === 1 ? "" : "n"}`
        : `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    }
    if (diffDays < 7) {
      return locale === "de"
        ? `vor ${diffDays} Tag${diffDays === 1 ? "" : "en"}`
        : `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    }

    return formatDate(d);
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return {
    formatDate,
    formatTime,
    formatDateTime,
    formatNumber,
    formatCurrency,
    formatPercent,
    formatRelativeTime,
    formatFileSize,
    locale,
  };
}
