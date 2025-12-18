// SPDX-License-Identifier: MIT
// apps/backend/src/services/errorTrackingService.ts

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
// Reserved for future use
// import { Request } from "express";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("error-tracking");

/**
 * Sentry error tracking service.
 * Provides error tracking, grouping, and alerting capabilities.
 *
 * Usage:
 * ```typescript
 * import { errorTrackingService } from './services/errorTrackingService.js';
 *
 * // Initialize on app startup
 * errorTrackingService.initialize(app);
 *
 * // Capture exception
 * errorTrackingService.captureException(error);
 *
 * // Capture message
 * errorTrackingService.captureMessage('Something happened', 'warning');
 * ```
 */

let isInitialized = false;

export const errorTrackingService = {
  /**
   * Initialize Sentry
   */
  initialize(app?: any): void {
    if (isInitialized) {
      logger.warn("Error tracking service already initialized");
      return;
    }

    const sentryEnabled = process.env.SENTRY_ENABLED === "true";
    if (!sentryEnabled) {
      logger.info(
        "Sentry error tracking is disabled (SENTRY_ENABLED not set to true)",
      );
      return;
    }

    const sentryDsn = process.env.SENTRY_DSN;
    if (!sentryDsn) {
      logger.warn("SENTRY_DSN not configured, skipping Sentry initialization");
      return;
    }

    try {
      Sentry.init({
        dsn: sentryDsn,
        environment: process.env.NODE_ENV || "development",
        release: process.env.npm_package_version || "0.2.0",

        // Performance monitoring
        tracesSampleRate: parseFloat(
          process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1",
        ),

        // Profiling
        profilesSampleRate: parseFloat(
          process.env.SENTRY_PROFILES_SAMPLE_RATE || "0.1",
        ),

        integrations: [
          // Enable profiling
          nodeProfilingIntegration(),
          // Enable HTTP integration if Express app is provided
          ...(app
            ? [Sentry.httpIntegration(), Sentry.expressIntegration()]
            : []),
        ],

        // Before send hook to filter sensitive data
        beforeSend(event, _hint) {
          // Redact sensitive data from request data
          if (event.request?.data) {
            event.request.data = redactSensitiveData(event.request.data);
          }

          // Redact sensitive data from extra data
          if (event.extra) {
            event.extra = redactSensitiveData(event.extra);
          }

          return event;
        },

        // Ignore common errors
        ignoreErrors: [
          // Browser errors
          /^Non-Error/,
          // Network errors
          "NetworkError",
          "Network request failed",
          // Aborted requests
          "AbortError",
          "Request aborted",
        ],
      });

      isInitialized = true;
      logger.info(
        {
          environment: process.env.NODE_ENV,
          tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1",
          profilesSampleRate: process.env.SENTRY_PROFILES_SAMPLE_RATE || "0.1",
        },
        "Sentry error tracking initialized",
      );
    } catch (error) {
      logger.error({ error }, "Failed to initialize Sentry");
    }
  },

  /**
   * Capture an exception
   */
  captureException(
    error: Error,
    context?: {
      user?: { id: string; email?: string; username?: string };
      tags?: Record<string, string>;
      extra?: Record<string, any>;
      level?: Sentry.SeverityLevel;
    },
  ): string | undefined {
    if (!isInitialized) {
      return undefined;
    }

    return Sentry.captureException(error, {
      user: context?.user,
      tags: context?.tags,
      extra: context?.extra ? redactSensitiveData(context.extra) : undefined,
      level: context?.level,
    });
  },

  /**
   * Capture a message
   */
  captureMessage(
    message: string,
    level: Sentry.SeverityLevel = "info",
    context?: {
      tags?: Record<string, string>;
      extra?: Record<string, any>;
    },
  ): string | undefined {
    if (!isInitialized) {
      return undefined;
    }

    return Sentry.captureMessage(message, {
      level,
      tags: context?.tags,
      extra: context?.extra ? redactSensitiveData(context.extra) : undefined,
    });
  },

  /**
   * Set user context
   */
  setUser(
    user: { id: string; email?: string; username?: string } | null,
  ): void {
    if (!isInitialized) {
      return;
    }

    Sentry.setUser(user);
  },

  /**
   * Set tag
   */
  setTag(key: string, value: string): void {
    if (!isInitialized) {
      return;
    }

    Sentry.setTag(key, value);
  },

  /**
   * Set tags
   */
  setTags(tags: Record<string, string>): void {
    if (!isInitialized) {
      return;
    }

    Sentry.setTags(tags);
  },

  /**
   * Set context
   */
  setContext(name: string, context: Record<string, any>): void {
    if (!isInitialized) {
      return;
    }

    Sentry.setContext(name, redactSensitiveData(context));
  },

  /**
   * Add breadcrumb
   */
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: Sentry.SeverityLevel;
    data?: Record<string, any>;
  }): void {
    if (!isInitialized) {
      return;
    }

    Sentry.addBreadcrumb({
      ...breadcrumb,
      data: breadcrumb.data ? redactSensitiveData(breadcrumb.data) : undefined,
    });
  },

  /**
   * Flush events
   */
  async flush(timeout: number = 2000): Promise<boolean> {
    if (!isInitialized) {
      return false;
    }

    return await Sentry.flush(timeout);
  },

  /**
   * Close Sentry
   */
  async close(timeout: number = 2000): Promise<boolean> {
    if (!isInitialized) {
      return false;
    }

    const result = await Sentry.close(timeout);
    isInitialized = false;
    return result;
  },

  /**
   * Check if error tracking is enabled
   */
  isEnabled(): boolean {
    return isInitialized;
  },

  /**
   * Get Sentry instance for advanced usage
   */
  getSentry(): typeof Sentry {
    return Sentry;
  },
};

/**
 * Redact sensitive data from objects
 */
function redactSensitiveData(data: any): any {
  if (!data || typeof data !== "object") {
    return data;
  }

  const sensitiveKeys = [
    "password",
    "token",
    "apiKey",
    "api_key",
    "secret",
    "authorization",
    "auth",
    "cookie",
    "session",
    "ssn",
    "credit_card",
    "creditCard",
  ];

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  const redacted: any = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      redacted[key] = "[REDACTED]";
    } else if (value && typeof value === "object") {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

export default errorTrackingService;
