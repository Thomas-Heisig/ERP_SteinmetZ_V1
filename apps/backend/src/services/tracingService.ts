// SPDX-License-Identifier: MIT
// apps/backend/src/services/tracingService.ts

import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { trace, context, SpanStatusCode, Span } from "@opentelemetry/api";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("tracing");

/**
 * OpenTelemetry tracing service for distributed tracing.
 * Supports automatic instrumentation and custom spans.
 *
 * Usage:
 * ```typescript
 * import { tracingService } from './services/tracingService.js';
 *
 * // Initialize tracing on app startup
 * await tracingService.initialize();
 *
 * // Create custom span
 * const span = tracingService.startSpan('operation-name', { custom: 'attribute' });
 * try {
 *   // ... do work
 *   tracingService.endSpan(span);
 * } catch (error) {
 *   tracingService.recordError(span, error);
 *   tracingService.endSpan(span);
 * }
 * ```
 */

let sdk: NodeSDK | null = null;
let isInitialized = false;

export const tracingService = {
  /**
   * Initialize OpenTelemetry SDK
   */
  async initialize(): Promise<void> {
    if (isInitialized) {
      logger.warn("Tracing service already initialized");
      return;
    }

    const tracingEnabled = process.env.OTEL_TRACES_ENABLED === "true";
    if (!tracingEnabled) {
      logger.info("Tracing is disabled (OTEL_TRACES_ENABLED not set to true)");
      return;
    }

    try {
      const serviceName =
        process.env.OTEL_SERVICE_NAME || "erp-steinmetz-backend";
      const serviceVersion = process.env.npm_package_version || "0.2.0";
      const otlpEndpoint =
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
        "http://localhost:4318/v1/traces";

      // Create OTLP exporter
      const traceExporter = new OTLPTraceExporter({
        url: otlpEndpoint,
        headers: {},
      });

      // Create resource
      const resource = new Resource({
        [ATTR_SERVICE_NAME]: serviceName,
        [ATTR_SERVICE_VERSION]: serviceVersion,
      });

      // Initialize SDK with auto-instrumentation
      sdk = new NodeSDK({
        resource,
        traceExporter,
        instrumentations: [
          getNodeAutoInstrumentations({
            // Disable instrumentations that might cause issues
            "@opentelemetry/instrumentation-fs": {
              enabled: false,
            },
          }),
        ],
      });

      await sdk.start();
      isInitialized = true;

      logger.info(
        {
          serviceName,
          serviceVersion,
          otlpEndpoint,
        },
        "OpenTelemetry tracing initialized",
      );
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      let specificError = "Failed to initialize OpenTelemetry tracing";

      // Provide specific error messages for common issues
      if (errorMessage.includes("ECONNREFUSED")) {
        specificError =
          "Cannot connect to OTLP endpoint. Ensure the collector is running and accessible.";
      } else if (errorMessage.includes("ENOTFOUND")) {
        specificError =
          "OTLP endpoint hostname not found. Check your OTEL_EXPORTER_OTLP_ENDPOINT configuration.";
      } else if (errorMessage.includes("parse")) {
        specificError =
          "Invalid OTLP endpoint URL. Check your OTEL_EXPORTER_OTLP_ENDPOINT format.";
      }

      logger.error({ error, specificError }, specificError);
      throw new Error(specificError);
    }
  },

  /**
   * Shutdown tracing service
   */
  async shutdown(): Promise<void> {
    if (!isInitialized || !sdk) {
      return;
    }

    try {
      await sdk.shutdown();
      isInitialized = false;
      logger.info("OpenTelemetry tracing shut down");
    } catch (error) {
      logger.error({ error }, "Failed to shutdown OpenTelemetry tracing");
    }
  },

  /**
   * Get the tracer
   */
  getTracer() {
    return trace.getTracer("erp-steinmetz", "0.2.0");
  },

  /**
   * Start a new span
   */
  startSpan(name: string, attributes?: Record<string, any>): Span {
    const tracer = this.getTracer();
    return tracer.startSpan(name, {
      attributes,
    });
  },

  /**
   * End a span
   */
  endSpan(span: Span): void {
    span.end();
  },

  /**
   * Record an error on a span
   */
  recordError(span: Span, error: Error | string): void {
    const err = typeof error === "string" ? new Error(error) : error;
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
  },

  /**
   * Set span attributes
   */
  setAttributes(span: Span, attributes: Record<string, any>): void {
    span.setAttributes(attributes);
  },

  /**
   * Execute function within a span context
   */
  async executeInSpan<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    attributes?: Record<string, any>,
  ): Promise<T> {
    const span = this.startSpan(name, attributes);
    try {
      const result = await fn(span);
      this.endSpan(span);
      return result;
    } catch (error) {
      this.recordError(span, error as Error);
      this.endSpan(span);
      throw error;
    }
  },

  /**
   * Get current span from context
   */
  getCurrentSpan(): Span | undefined {
    return trace.getSpan(context.active());
  },

  /**
   * Check if tracing is enabled
   */
  isEnabled(): boolean {
    return isInitialized;
  },
};

export default tracingService;
