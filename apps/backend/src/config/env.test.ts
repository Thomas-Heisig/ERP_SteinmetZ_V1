// SPDX-License-Identifier: MIT
// apps/backend/src/config/env.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { validateProviderConfig } from "./env";
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
    mockEnv.OPENAI_API_KEY = "sk-test-key";
    expect(() => validateProviderConfig(mockEnv)).not.toThrow();
  });

  it("should throw error for anthropic provider without API key", () => {
    mockEnv.AI_PROVIDER = "anthropic";
    expect(() => validateProviderConfig(mockEnv)).toThrow(
      "ANTHROPIC_API_KEY is required",
    );
  });

  it("should throw error for azure provider without required fields", () => {
    mockEnv.AI_PROVIDER = "azure";
    expect(() => validateProviderConfig(mockEnv)).toThrow(
      "AZURE_OPENAI_API_KEY",
    );
  });

  it("should throw error for local provider without model path", () => {
    mockEnv.AI_PROVIDER = "local";
    expect(() => validateProviderConfig(mockEnv)).toThrow(
      "LOCAL_MODEL_PATH is required",
    );
  });

  it("should throw error for postgresql without DATABASE_URL", () => {
    mockEnv.DB_DRIVER = "postgresql";
    expect(() => validateProviderConfig(mockEnv)).toThrow(
      "DATABASE_URL is required",
    );
  });
});
