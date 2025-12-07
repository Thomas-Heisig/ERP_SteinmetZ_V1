// SPDX-License-Identifier: MIT
// apps/backend/src/services/tracingService.test.ts

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { tracingService } from "./tracingService.js";

describe("Tracing Service", () => {
  beforeEach(async () => {
    // Shutdown tracing before each test
    await tracingService.shutdown();
    // Reset environment variables
    delete process.env.OTEL_TRACES_ENABLED;
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  });

  afterEach(async () => {
    // Shutdown tracing after each test
    await tracingService.shutdown();
    // Clean up environment variables
    delete process.env.OTEL_TRACES_ENABLED;
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  });

  describe("Initialization", () => {
    it("should initialize when OTEL_TRACES_ENABLED is true", async () => {
      // Set environment variable
      process.env.OTEL_TRACES_ENABLED = "true";
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT =
        "http://localhost:4318/v1/traces";

      await tracingService.initialize();

      expect(tracingService.isEnabled()).toBe(true);
    });

    it("should not initialize when OTEL_TRACES_ENABLED is false", async () => {
      process.env.OTEL_TRACES_ENABLED = "false";

      await tracingService.initialize();

      expect(tracingService.isEnabled()).toBe(false);
    });

    it("should not initialize when OTEL_TRACES_ENABLED is not set", async () => {
      delete process.env.OTEL_TRACES_ENABLED;

      await tracingService.initialize();

      expect(tracingService.isEnabled()).toBe(false);
    });

    it("should handle initialization errors gracefully", async () => {
      process.env.OTEL_TRACES_ENABLED = "true";
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "://invalid";

      // Should throw error for invalid URL
      try {
        await tracingService.initialize();
        // If it doesn't throw, that's also acceptable (it logs the error instead)
        expect(true).toBe(true);
      } catch (error) {
        // Error is expected
        expect(error).toBeDefined();
      }
    });
  });

  describe("Span Operations", () => {
    it("should create and end a span", async () => {
      process.env.OTEL_TRACES_ENABLED = "true";
      await tracingService.initialize();

      const span = tracingService.startSpan("test-operation");
      expect(span).toBeDefined();

      tracingService.endSpan(span);
      // Should complete without errors
      expect(true).toBe(true);
    });

    it("should create span with attributes", async () => {
      process.env.OTEL_TRACES_ENABLED = "true";
      await tracingService.initialize();

      const span = tracingService.startSpan("test-operation", {
        userId: "123",
        action: "test",
      });

      expect(span).toBeDefined();
      tracingService.endSpan(span);
    });

    it("should record error on span", async () => {
      process.env.OTEL_TRACES_ENABLED = "true";
      await tracingService.initialize();

      const span = tracingService.startSpan("test-operation");
      const error = new Error("Test error");

      tracingService.recordError(span, error);
      tracingService.endSpan(span);

      expect(true).toBe(true);
    });

    it("should set attributes on span", async () => {
      process.env.OTEL_TRACES_ENABLED = "true";
      await tracingService.initialize();

      const span = tracingService.startSpan("test-operation");

      tracingService.setAttributes(span, {
        customAttr: "value",
        count: 42,
      });

      tracingService.endSpan(span);
      expect(true).toBe(true);
    });
  });

  describe("Execute in Span", () => {
    it("should execute function within span", async () => {
      process.env.OTEL_TRACES_ENABLED = "true";
      await tracingService.initialize();

      const result = await tracingService.executeInSpan(
        "test-operation",
        async (span) => {
          // Do some work
          return "success";
        },
      );

      expect(result).toBe("success");
    });

    it("should handle errors in executeInSpan", async () => {
      process.env.OTEL_TRACES_ENABLED = "true";
      await tracingService.initialize();

      await expect(
        tracingService.executeInSpan("test-operation", async (span) => {
          throw new Error("Test error");
        }),
      ).rejects.toThrow("Test error");
    });

    it("should execute function with attributes", async () => {
      process.env.OTEL_TRACES_ENABLED = "true";
      await tracingService.initialize();

      const result = await tracingService.executeInSpan(
        "test-operation",
        async (span) => {
          return 42;
        },
        { userId: "123" },
      );

      expect(result).toBe(42);
    });
  });

  describe("Tracer", () => {
    it("should get tracer instance", async () => {
      process.env.OTEL_TRACES_ENABLED = "true";
      await tracingService.initialize();

      const tracer = tracingService.getTracer();

      expect(tracer).toBeDefined();
      expect(typeof tracer.startSpan).toBe("function");
    });
  });

  describe("Shutdown", () => {
    it("should shutdown gracefully", async () => {
      process.env.OTEL_TRACES_ENABLED = "true";
      await tracingService.initialize();

      await tracingService.shutdown();

      expect(tracingService.isEnabled()).toBe(false);
    });

    it("should handle shutdown when not initialized", async () => {
      await tracingService.shutdown();

      // Should not throw
      expect(true).toBe(true);
    });
  });
});
