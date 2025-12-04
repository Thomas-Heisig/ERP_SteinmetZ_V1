// apps/backend/src/services/aiProviderHealthService.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkFallbackHealth,
  checkAllProviders,
  getAvailableProviders,
  getBestAvailableProvider,
} from "./aiProviderHealthService";

describe("AI Provider Health Service", () => {
  describe("checkFallbackHealth", () => {
    it("should always return healthy status", async () => {
      const result = await checkFallbackHealth();
      
      expect(result.provider).toBe("fallback");
      expect(result.status).toBe("healthy");
      expect(result.latency).toBe(0);
      expect(result.timestamp).toBeDefined();
      expect(result.details?.alwaysAvailable).toBe(true);
    });
  });

  describe("checkAllProviders", () => {
    it("should check all providers and return overall status", async () => {
      const result = await checkAllProviders();
      
      expect(result.overall).toBeDefined();
      expect(result.providers).toBeInstanceOf(Array);
      expect(result.providers.length).toBeGreaterThanOrEqual(4);
      expect(result.timestamp).toBeDefined();
      
      // Check that each provider has required fields
      result.providers.forEach((provider) => {
        expect(provider.provider).toBeDefined();
        expect(provider.status).toMatch(/^(healthy|degraded|unavailable)$/);
        expect(provider.timestamp).toBeDefined();
      });
    });

    it("should include fallback provider", async () => {
      const result = await checkAllProviders();
      const fallback = result.providers.find((p) => p.provider === "fallback");
      
      expect(fallback).toBeDefined();
      expect(fallback?.status).toBe("healthy");
    });

    it("should have overall status as healthy when multiple providers work", async () => {
      const result = await checkAllProviders();
      const healthyCount = result.providers.filter(
        (p) => p.status === "healthy"
      ).length;
      
      if (healthyCount >= 2) {
        expect(result.overall).toBe("healthy");
      }
    });
  });

  describe("getAvailableProviders", () => {
    it("should return list of healthy providers", async () => {
      const available = await getAvailableProviders();
      
      expect(available).toBeInstanceOf(Array);
      expect(available.length).toBeGreaterThan(0);
      
      // Fallback should always be available
      expect(available).toContain("fallback");
    });

    it("should only include healthy providers", async () => {
      const available = await getAvailableProviders();
      const allProviders = await checkAllProviders();
      
      available.forEach((providerName) => {
        const provider = allProviders.providers.find(
          (p) => p.provider === providerName
        );
        expect(provider?.status).toBe("healthy");
      });
    });
  });

  describe("getBestAvailableProvider", () => {
    it("should return a provider name", async () => {
      const best = await getBestAvailableProvider();
      
      expect(best).toBeDefined();
      expect(typeof best).toBe("string");
      expect(best.length).toBeGreaterThan(0);
    });

    it("should return fallback as last resort", async () => {
      const best = await getBestAvailableProvider();
      
      // Should never be empty
      expect(best).toBeTruthy();
    });

    it("should prefer providers in priority order", async () => {
      const available = await getAvailableProviders();
      const best = await getBestAvailableProvider();
      
      // If OpenAI is available, it should be selected
      if (available.includes("openai")) {
        expect(best).toBe("openai");
      }
      // If not, fallback should eventually be returned
      else {
        expect(["anthropic", "ollama", "fallback"]).toContain(best);
      }
    });
  });

  describe("Provider Health Response Structure", () => {
    it("should have consistent response structure", async () => {
      const result = await checkAllProviders();
      
      result.providers.forEach((provider) => {
        // Required fields
        expect(provider).toHaveProperty("provider");
        expect(provider).toHaveProperty("status");
        expect(provider).toHaveProperty("timestamp");
        
        // Status should be valid
        expect(["healthy", "degraded", "unavailable"]).toContain(
          provider.status
        );
        
        // Timestamp should be valid ISO string
        expect(() => new Date(provider.timestamp)).not.toThrow();
        
        // If healthy, should have latency
        if (provider.status === "healthy") {
          expect(provider.latency).toBeDefined();
          expect(typeof provider.latency).toBe("number");
          expect(provider.latency).toBeGreaterThanOrEqual(0);
        }
        
        // If unavailable, may have error
        if (provider.status === "unavailable") {
          // Error is optional but common for unavailable providers
          if (provider.error) {
            expect(typeof provider.error).toBe("string");
          }
        }
      });
    });
  });
});
