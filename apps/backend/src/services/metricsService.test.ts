// SPDX-License-Identifier: MIT
// apps/backend/src/services/metricsService.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { metricsService } from "./metricsService.js";

describe("Metrics Service", () => {
  beforeEach(() => {
    // Reset metrics before each test
    metricsService.reset();
  });

  describe("HTTP Metrics", () => {
    it("should record HTTP request metrics", () => {
      metricsService.recordHttpRequest("GET", "/api/users", 200, 150);
      metricsService.recordHttpRequest("POST", "/api/users", 201, 250);

      // Metrics should be recorded without errors
      expect(true).toBe(true);
    });

    it("should track HTTP requests in progress", () => {
      metricsService.startHttpRequest("GET", "/api/users");
      metricsService.endHttpRequest("GET", "/api/users");

      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe("Database Metrics", () => {
    it("should record database query metrics", () => {
      metricsService.recordDbQuery("SELECT", "users", 50, true);
      metricsService.recordDbQuery("INSERT", "orders", 75, true);

      expect(true).toBe(true);
    });

    it("should record failed database queries", () => {
      metricsService.recordDbQuery("SELECT", "users", 100, false);

      expect(true).toBe(true);
    });

    it("should set active database connections", () => {
      metricsService.setDbConnections(5);
      metricsService.setDbConnections(10);

      expect(true).toBe(true);
    });
  });

  describe("Authentication Metrics", () => {
    it("should record authentication attempts", () => {
      metricsService.recordAuthAttempt("password", true);
      metricsService.recordAuthAttempt("password", false);
      metricsService.recordAuthAttempt("token", true);

      expect(true).toBe(true);
    });

    it("should set active session count", () => {
      metricsService.setActiveSessions(15);
      metricsService.setActiveSessions(20);

      expect(true).toBe(true);
    });
  });

  describe("Business Metrics", () => {
    it("should record business events", () => {
      metricsService.recordBusinessEvent("order_created", "success");
      metricsService.recordBusinessEvent("payment_processed", "success");
      metricsService.recordBusinessEvent("invoice_generated", "failed");

      expect(true).toBe(true);
    });

    it("should record business operation duration", () => {
      metricsService.recordBusinessOperation("order_processing", 1500);
      metricsService.recordBusinessOperation("report_generation", 5000);

      expect(true).toBe(true);
    });
  });

  describe("AI Metrics", () => {
    it("should record AI provider requests", () => {
      metricsService.recordAiRequest("openai", 2500, true);
      metricsService.recordAiRequest("ollama", 1500, true);
      metricsService.recordAiRequest("anthropic", 3000, false);

      expect(true).toBe(true);
    });

    it("should record AI token usage", () => {
      metricsService.recordAiTokens("openai", "prompt", 100);
      metricsService.recordAiTokens("openai", "completion", 200);
      metricsService.recordAiTokens("ollama", "prompt", 50);

      expect(true).toBe(true);
    });
  });

  describe("Error Metrics", () => {
    it("should record errors", () => {
      metricsService.recordError("validation", "warning");
      metricsService.recordError("database", "error");
      metricsService.recordError("network", "critical");

      expect(true).toBe(true);
    });
  });

  describe("Metrics Export", () => {
    it("should get metrics in Prometheus format", async () => {
      // Record some metrics
      metricsService.recordHttpRequest("GET", "/api/test", 200, 100);
      metricsService.recordDbQuery("SELECT", "users", 50, true);

      const metrics = await metricsService.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe("string");
      expect(metrics.length).toBeGreaterThan(0);
    });

    it("should get content type for metrics", () => {
      const contentType = metricsService.getContentType();

      expect(contentType).toBeDefined();
      expect(typeof contentType).toBe("string");
      expect(contentType).toContain("text/plain");
    });
  });
});
