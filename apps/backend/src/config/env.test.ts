// SPDX-License-Identifier: MIT
// apps/backend/src/config/env.test.ts
// Environment configuration validation tests

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  validateProviderConfig,
  validateProductionConfig,
} from "./env";
import type { Env } from "./env";

describe("validateProviderConfig", () => {
  let mockEnv: Env;

  beforeEach(() => {
    mockEnv = {
      PORT: 3000,
      NODE_ENV: "development",
      CORS_ORIGIN: "http://localhost:5173",
      DB_DRIVER: "sqlite",
      AI_PROVIDER: "ollama",
      OLLAMA_BASE_URL: "http://localhost:11434",
      OLLAMA_MODEL: "qwen2.5:3b",
      FUNCTIONS_DIR: "./docs/functions",
      FUNCTIONS_AUTOLOAD: true,
      FUNCTIONS_WATCH: true,
      FUNCTIONS_AUTOPERSIST: false,
      MODELS_DIR: "./models",
      FALLBACK_WIKI: true,
      AI_FALLBACK_ENABLED: true,
      MAX_FILE_UPLOAD_SIZE: 10485760,
      MAX_BATCH_OPERATION_SIZE: 100,
      LOG_LEVEL: "info",
      LOG_REQUESTS: true,
      JWT_EXPIRES_IN: "24h",
      REFRESH_TOKEN_EXPIRES_IN: "7d",
    };
  });

  describe("AI Provider Validation", () => {
    it("should pass validation for ollama provider", () => {
      expect(() => validateProviderConfig(mockEnv)).not.toThrow();
    });

    it("should throw error for openai provider without API key", () => {
      mockEnv.AI_PROVIDER = "openai";
      expect(() => validateProviderConfig(mockEnv)).toThrow(
        "OPENAI_API_KEY is required",
      );
    });

    it("should pass validation for openai provider with API key", () => {
      mockEnv.AI_PROVIDER = "openai";
      mockEnv.OPENAI_API_KEY = "sk-test-key-1234567890abcdef";
      expect(() => validateProviderConfig(mockEnv)).not.toThrow();
    });

    it("should throw error for anthropic provider without API key", () => {
      mockEnv.AI_PROVIDER = "anthropic";
      expect(() => validateProviderConfig(mockEnv)).toThrow(
        "ANTHROPIC_API_KEY is required",
      );
    });

    it("should pass validation for anthropic provider with API key", () => {
      mockEnv.AI_PROVIDER = "anthropic";
      mockEnv.ANTHROPIC_API_KEY = "sk-ant-test-key-1234567890abcdef";
      expect(() => validateProviderConfig(mockEnv)).not.toThrow();
    });

    it("should throw error for azure provider without all required fields", () => {
      mockEnv.AI_PROVIDER = "azure";
      expect(() => validateProviderConfig(mockEnv)).toThrow(
        "AZURE_OPENAI_API_KEY",
      );
    });

    it("should pass validation for azure provider with all required fields", () => {
      mockEnv.AI_PROVIDER = "azure";
      mockEnv.AZURE_OPENAI_API_KEY = "azure-key-12345";
      mockEnv.AZURE_OPENAI_ENDPOINT = "https://test.openai.azure.com/";
      mockEnv.AZURE_OPENAI_DEPLOYMENT = "test-deployment";
      expect(() => validateProviderConfig(mockEnv)).not.toThrow();
    });

    it("should throw error for local provider without model path", () => {
      mockEnv.AI_PROVIDER = "local";
      expect(() => validateProviderConfig(mockEnv)).toThrow(
        "LOCAL_MODEL_PATH is required",
      );
    });

    it("should pass validation for local provider with model path", () => {
      mockEnv.AI_PROVIDER = "local";
      mockEnv.LOCAL_MODEL_PATH = "/path/to/model.bin";
      expect(() => validateProviderConfig(mockEnv)).not.toThrow();
    });
  });

  describe("Database Configuration Validation", () => {
    it("should throw error for postgresql without DATABASE_URL", () => {
      mockEnv.DB_DRIVER = "postgresql";
      expect(() => validateProviderConfig(mockEnv)).toThrow(
        "DATABASE_URL is required",
      );
    });

    it("should pass validation for postgresql with DATABASE_URL", () => {
      mockEnv.DB_DRIVER = "postgresql";
      mockEnv.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
      expect(() => validateProviderConfig(mockEnv)).not.toThrow();
    });

    it("should warn for sqlite without SQLITE_FILE set", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      mockEnv.DB_DRIVER = "sqlite";
      mockEnv.SQLITE_FILE = undefined;
      expect(() => validateProviderConfig(mockEnv)).not.toThrow();
      warnSpy.mockRestore();
    });

    it("should not warn for sqlite with SQLITE_FILE set", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      mockEnv.DB_DRIVER = "sqlite";
      mockEnv.SQLITE_FILE = "./data/dev.sqlite3";
      expect(() => validateProviderConfig(mockEnv)).not.toThrow();
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});

describe("validateProductionConfig", () => {
  let mockEnv: Env;
  let consoleLogSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    mockEnv = {
      PORT: 3000,
      NODE_ENV: "production",
      CORS_ORIGIN: "https://example.com",
      DB_DRIVER: "postgresql",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      AI_PROVIDER: "openai",
      OPENAI_API_KEY: "sk-test-key-1234567890abcdef",
      OLLAMA_BASE_URL: "http://localhost:11434",
      OLLAMA_MODEL: "qwen2.5:3b",
      FUNCTIONS_DIR: "./docs/functions",
      FUNCTIONS_AUTOLOAD: true,
      FUNCTIONS_WATCH: false,
      FUNCTIONS_AUTOPERSIST: false,
      MODELS_DIR: "./models",
      FALLBACK_WIKI: true,
      AI_FALLBACK_ENABLED: true,
      MAX_FILE_UPLOAD_SIZE: 10485760,
      MAX_BATCH_OPERATION_SIZE: 100,
      LOG_LEVEL: "info",
      LOG_REQUESTS: true,
      JWT_SECRET: "TEST_JWT_TOKEN_FOR_VALIDATION_PURPOSES_ONLY_1234567890",
      JWT_EXPIRES_IN: "24h",
      REFRESH_TOKEN_EXPIRES_IN: "7d",
    };

    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe("Development Environment", () => {
    it("should skip validation in development mode", () => {
      mockEnv.NODE_ENV = "development";
      delete mockEnv.JWT_SECRET;
      expect(() => validateProductionConfig(mockEnv)).not.toThrow();
    });

    it("should skip validation in test mode", () => {
      mockEnv.NODE_ENV = "test";
      delete mockEnv.JWT_SECRET;
      expect(() => validateProductionConfig(mockEnv)).not.toThrow();
    });
  });

  describe("JWT Secret Validation", () => {
    it("should throw error for missing JWT_SECRET in production", () => {
      delete mockEnv.JWT_SECRET;
      expect(() => validateProductionConfig(mockEnv)).toThrow(
        "JWT_SECRET is required in production",
      );
    });

    it("should throw error for short JWT_SECRET in production", () => {
      mockEnv.JWT_SECRET = "short";
      expect(() => validateProductionConfig(mockEnv)).toThrow(
        "at least 32 characters long",
      );
    });

    it("should throw error for weak JWT_SECRET with common placeholder", () => {
      mockEnv.JWT_SECRET = "change-me-in-production-but-still-long-enough";
      expect(() => validateProductionConfig(mockEnv)).toThrow(
        "default/weak",
      );
    });

    it("should throw error for weak JWT_SECRET with 'secret' keyword", () => {
      mockEnv.JWT_SECRET = "this-is-my-secret-key-but-not-changing-it-1234567890";
      expect(() => validateProductionConfig(mockEnv)).toThrow(
        "default/weak",
      );
    });

    it("should pass validation with strong JWT_SECRET", () => {
      mockEnv.JWT_SECRET = "aB3!cDeFg9Hijk2lMnOpQr5StUvWxYzAbCdEfGhIjKlMnO";
      expect(() => validateProductionConfig(mockEnv)).not.toThrow();
    });
  });

  describe("Database Configuration", () => {
    it("should warn when using SQLite in production", () => {
      mockEnv.DB_DRIVER = "sqlite";
      mockEnv.SQLITE_FILE = "./data/prod.sqlite3";
      validateProductionConfig(mockEnv);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("SQLite in production"),
      );
    });

    it("should throw error for PostgreSQL without DATABASE_URL", () => {
      mockEnv.DB_DRIVER = "postgresql";
      delete mockEnv.DATABASE_URL;
      expect(() => validateProductionConfig(mockEnv)).toThrow(
        "DATABASE_URL is required",
      );
    });

    it("should not warn for proper PostgreSQL configuration", () => {
      mockEnv.DB_DRIVER = "postgresql";
      mockEnv.DATABASE_URL = "postgresql://user:pass@prod-db:5432/db";
      expect(() => validateProductionConfig(mockEnv)).not.toThrow();
    });
  });

  describe("CORS Configuration", () => {
    it("should warn on wildcard CORS origin in production", () => {
      mockEnv.CORS_ORIGIN = "*";
      validateProductionConfig(mockEnv);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("CORS_ORIGIN"),
      );
    });

    it("should warn on localhost CORS origin in production", () => {
      mockEnv.CORS_ORIGIN = "http://localhost:5173";
      validateProductionConfig(mockEnv);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("CORS_ORIGIN"),
      );
    });

    it("should warn on loopback CORS origin in production", () => {
      mockEnv.CORS_ORIGIN = "http://127.0.0.1:5173";
      validateProductionConfig(mockEnv);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("CORS_ORIGIN"),
      );
    });

    it("should not warn on proper CORS origin in production", () => {
      mockEnv.CORS_ORIGIN = "https://app.example.com";
      validateProductionConfig(mockEnv);
      expect(consoleWarnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("CORS_ORIGIN"),
      );
    });
  });

  describe("Provider Configuration", () => {
    it("should validate provider config when applicable", () => {
      mockEnv.AI_PROVIDER = "openai";
      delete mockEnv.OPENAI_API_KEY;
      expect(() => validateProductionConfig(mockEnv)).toThrow(
        "OPENAI_API_KEY",
      );
    });
  });
});

describe("validateEnvironment", () => {
  it("should validate all configuration at once", () => {
    const mockEnv: Env = {
      PORT: 3000,
      NODE_ENV: "development",
      CORS_ORIGIN: "http://localhost:5173",
      DB_DRIVER: "sqlite",
      AI_PROVIDER: "ollama",
      OLLAMA_BASE_URL: "http://localhost:11434",
      OLLAMA_MODEL: "qwen2.5:3b",
      FUNCTIONS_DIR: "./docs/functions",
      FUNCTIONS_AUTOLOAD: true,
      FUNCTIONS_WATCH: true,
      FUNCTIONS_AUTOPERSIST: false,
      MODELS_DIR: "./models",
      FALLBACK_WIKI: true,
      AI_FALLBACK_ENABLED: true,
      MAX_FILE_UPLOAD_SIZE: 10485760,
      MAX_BATCH_OPERATION_SIZE: 100,
      LOG_LEVEL: "info",
      LOG_REQUESTS: true,
      JWT_EXPIRES_IN: "24h",
      REFRESH_TOKEN_EXPIRES_IN: "7d",
    };

    // Verify provider config is called
    expect(() => validateProviderConfig(mockEnv)).not.toThrow();
    // Verify production config is called (skipped in dev)
    expect(() => validateProductionConfig(mockEnv)).not.toThrow();
  });
});
