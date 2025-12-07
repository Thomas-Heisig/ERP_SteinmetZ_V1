// SPDX-License-Identifier: MIT
// apps/backend/src/services/errorTrackingService.test.ts

import { describe, it, expect } from "vitest";
import { errorTrackingService } from "./errorTrackingService.js";

describe("Error Tracking Service", () => {
  describe("Initialization", () => {
    it("should not throw when initializing with disabled flag", () => {
      const originalEnabled = process.env.SENTRY_ENABLED;
      process.env.SENTRY_ENABLED = "false";

      expect(() => errorTrackingService.initialize()).not.toThrow();

      // Restore
      if (originalEnabled) process.env.SENTRY_ENABLED = originalEnabled;
      else delete process.env.SENTRY_ENABLED;
    });

    it("should not throw when initializing without DSN", () => {
      const originalEnabled = process.env.SENTRY_ENABLED;
      const originalDsn = process.env.SENTRY_DSN;

      process.env.SENTRY_ENABLED = "true";
      delete process.env.SENTRY_DSN;

      expect(() => errorTrackingService.initialize()).not.toThrow();

      // Restore
      if (originalEnabled) process.env.SENTRY_ENABLED = originalEnabled;
      else delete process.env.SENTRY_ENABLED;
      if (originalDsn) process.env.SENTRY_DSN = originalDsn;
    });
  });

  describe("Exception Capturing", () => {
    it("should not throw when capturing exception", () => {
      const error = new Error("Test error");

      // Should not throw regardless of initialization state
      expect(() => errorTrackingService.captureException(error)).not.toThrow();
    });

    it("should not throw when capturing exception with context", () => {
      const error = new Error("Test error");

      // Should not throw regardless of initialization state
      expect(() =>
        errorTrackingService.captureException(error, {
          user: { id: "123", email: "test@example.com" },
          tags: { env: "test" },
          extra: { data: "test" },
        }),
      ).not.toThrow();
    });
  });

  describe("Message Capturing", () => {
    it("should not throw when capturing message", () => {
      // Should not throw regardless of initialization state
      expect(() =>
        errorTrackingService.captureMessage("Test message", "warning"),
      ).not.toThrow();
    });

    it("should not throw when capturing message with context", () => {
      // Should not throw regardless of initialization state
      expect(() =>
        errorTrackingService.captureMessage("Test message", "info", {
          tags: { feature: "test" },
          extra: { details: "additional info" },
        }),
      ).not.toThrow();
    });
  });

  describe("Context Management", () => {
    it("should not throw when setting user context", () => {
      // Should not throw regardless of initialization state
      expect(() =>
        errorTrackingService.setUser({
          id: "123",
          email: "test@example.com",
          username: "testuser",
        }),
      ).not.toThrow();
    });

    it("should not throw when clearing user context", () => {
      // Should not throw regardless of initialization state
      expect(() => errorTrackingService.setUser(null)).not.toThrow();
    });

    it("should not throw when setting tags", () => {
      // Should not throw regardless of initialization state
      expect(() => {
        errorTrackingService.setTag("environment", "test");
        errorTrackingService.setTags({ version: "1.0.0", feature: "test" });
      }).not.toThrow();
    });

    it("should not throw when setting context", () => {
      // Should not throw regardless of initialization state
      expect(() =>
        errorTrackingService.setContext("custom", {
          data: "test",
          count: 42,
        }),
      ).not.toThrow();
    });

    it("should not throw when adding breadcrumb", () => {
      // Should not throw regardless of initialization state
      expect(() =>
        errorTrackingService.addBreadcrumb({
          message: "User logged in",
          category: "auth",
          level: "info",
          data: { userId: "123" },
        }),
      ).not.toThrow();
    });
  });

  describe("Flush and Close", () => {
    it("should not throw when flushing events", async () => {
      // Should not throw regardless of initialization state
      await expect(errorTrackingService.flush(10)).resolves.toBeDefined();
    });

    it("should not throw when closing", async () => {
      // Should not throw regardless of initialization state
      await expect(errorTrackingService.close(10)).resolves.toBeDefined();
    });
  });

  describe("Sentry Instance", () => {
    it("should get Sentry instance", () => {
      const sentry = errorTrackingService.getSentry();

      expect(sentry).toBeDefined();
      expect(typeof sentry.captureException).toBe("function");
      expect(typeof sentry.captureMessage).toBe("function");
    });
  });
});
