// SPDX-License-Identifier: MIT
// apps/backend/src/config/env.ts
// Environment variable validation using Zod

import { z } from "zod";

/**
 * Schema for backend environment variables
 */
const envSchema = z.object({
  // Server configuration
  PORT: z
    .string()
    .default("3000")
    .transform((val) => parseInt(val, 10)),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  // Database configuration
  DB_DRIVER: z.enum(["sqlite", "postgresql"]).default("sqlite"),
  SQLITE_FILE: z.string().optional(),
  DATABASE_URL: z.string().optional(),

  // AI Provider configuration
  AI_PROVIDER: z
    .enum(["openai", "ollama", "local", "anthropic", "azure", "none"])
    .default("ollama"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  AZURE_OPENAI_API_KEY: z.string().optional(),
  AZURE_OPENAI_ENDPOINT: z.string().optional(),
  AZURE_OPENAI_DEPLOYMENT: z.string().optional(),
  OLLAMA_BASE_URL: z.string().default("http://localhost:11434"),
  OLLAMA_MODEL: z.string().default("qwen2.5:3b"),
  LOCAL_MODEL_PATH: z.string().optional(),
  LOCAL_MODEL_NAME: z.string().optional(),

  // Functions catalog
  FUNCTIONS_DIR: z.string().default("./docs/functions"),
  FUNCTIONS_AUTOLOAD: z
    .string()
    .default("1")
    .transform((val) => val === "1" || val === "true"),
  FUNCTIONS_WATCH: z
    .string()
    .default("1")
    .transform((val) => val === "1" || val === "true"),
  FUNCTIONS_AUTOPERSIST: z
    .string()
    .default("0")
    .transform((val) => val === "1" || val === "true"),

  // Model directory
  MODELS_DIR: z.string().default("./models"),

  // Fallback & error tolerance
  FALLBACK_WIKI: z
    .string()
    .default("1")
    .transform((val) => val === "1" || val === "true"),
  AI_FALLBACK_ENABLED: z
    .string()
    .default("1")
    .transform((val) => val === "1" || val === "true"),

  // Security & limits
  MAX_FILE_UPLOAD_SIZE: z
    .string()
    .default("10485760")
    .transform((val) => parseInt(val, 10)),
  MAX_BATCH_OPERATION_SIZE: z
    .string()
    .default("100")
    .transform((val) => parseInt(val, 10)),

  // Logging
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  LOG_REQUESTS: z
    .string()
    .default("1")
    .transform((val) => val === "1" || val === "true"),

  // Authentication & security
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default("24h"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate and parse environment variables
 * @throws {z.ZodError} if validation fails
 */
export function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment variable validation failed:");
      // Zod 4.x might have different error structure
      const issues = (error as any).issues || [];
      issues.forEach((err: any) => {
        const path = err.path ? err.path.join(".") : "unknown";
        console.error(`  - ${path}: ${err.message || "Validation failed"}`);
      });
      throw new Error("Invalid environment configuration");
    }
    throw error;
  }
}

/**
 * Get validated environment configuration
 * Cached after first call
 */
let cachedEnv: Env | null = null;
export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * Validate critical environment variables based on selected provider
 */
export function validateProviderConfig(env: Env): void {
  const provider = env.AI_PROVIDER;

  if (provider === "openai" && !env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is required when AI_PROVIDER is set to 'openai'",
    );
  }

  if (provider === "anthropic" && !env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is required when AI_PROVIDER is set to 'anthropic'",
    );
  }

  if (
    provider === "azure" &&
    (!env.AZURE_OPENAI_API_KEY ||
      !env.AZURE_OPENAI_ENDPOINT ||
      !env.AZURE_OPENAI_DEPLOYMENT)
  ) {
    throw new Error(
      "AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT are required when AI_PROVIDER is set to 'azure'",
    );
  }

  if (provider === "local" && !env.LOCAL_MODEL_PATH) {
    throw new Error(
      "LOCAL_MODEL_PATH is required when AI_PROVIDER is set to 'local'",
    );
  }

  if (env.DB_DRIVER === "sqlite" && !env.SQLITE_FILE) {
    console.warn("⚠️  SQLITE_FILE not set, using default: ../../data/dev.sqlite3");
  }

  if (env.DB_DRIVER === "postgresql" && !env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required when DB_DRIVER is set to 'postgresql'",
    );
  }
}
