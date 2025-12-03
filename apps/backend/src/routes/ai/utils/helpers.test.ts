// SPDX-License-Identifier: MIT
// apps/backend/src/routes/ai/utils/helpers.test.ts

import { describe, it, expect } from "vitest";
import { formatDuration, safeJsonParse, safeJsonStringify } from "./helpers";

describe("helpers utility functions", () => {
  describe("formatDuration", () => {
    it("should format milliseconds correctly", () => {
      expect(formatDuration(500)).toBe("500 ms");
      expect(formatDuration(999)).toBe("999 ms");
    });

    it("should format seconds correctly", () => {
      expect(formatDuration(1000)).toBe("1.00 s");
      expect(formatDuration(5500)).toBe("5.50 s");
    });

    it("should format minutes correctly", () => {
      expect(formatDuration(60000)).toBe("1.00 min");
      expect(formatDuration(120000)).toBe("2.00 min");
    });
  });

  describe("safeJsonParse", () => {
    it("should parse valid JSON", () => {
      const input = '{"key": "value"}';
      const result = safeJsonParse(input);
      expect(result).toEqual({ key: "value" });
    });

    it("should return fallback for invalid JSON", () => {
      const input = "{invalid json}";
      const fallback = { default: true };
      const result = safeJsonParse(input, fallback);
      expect(result).toEqual(fallback);
    });

    it("should return empty object as default fallback", () => {
      const input = "not json at all";
      const result = safeJsonParse(input);
      expect(result).toEqual({});
    });
  });

  describe("safeJsonStringify", () => {
    it("should stringify object correctly", () => {
      const obj = { key: "value" };
      const result = safeJsonStringify(obj);
      expect(result).toBe('{"key":"value"}');
    });

    it("should pretty print when requested", () => {
      const obj = { key: "value" };
      const result = safeJsonStringify(obj, true);
      expect(result).toContain("\n");
      expect(result).toContain("  ");
    });
  });
});
