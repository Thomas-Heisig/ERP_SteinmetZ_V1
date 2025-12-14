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
      // Zod 4.x uses 'issues' instead of 'errors'
      if ("issues" in error && Array.isArray(error.issues)) {
        error.issues.forEach((issue: any) => {
          const path = issue.path ? issue.path.join(".") : "unknown";
          console.error(`  - ${path}: ${issue.message || "Validation failed"}`);
        });
      }
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
    console.warn(
      "⚠️  SQLITE_FILE not set, using default: ../../data/dev.sqlite3",
    );
  }

  if (env.DB_DRIVER === "postgresql" && !env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required when DB_DRIVER is set to 'postgresql'",
    );
  }
}

/**
 * Validate production configuration
 *
 * Performs additional validation for production environments including:
 * - JWT secret strength
 * - Database configuration
 * - Security settings
 * - Warning on development defaults
 *
 * @param env - Environment configuration
 * @throws Error if critical production requirements are not met
 */
export function validateProductionConfig(env: Env): void {
  if (env.NODE_ENV !== "production") {
    return; // Skip production validation in dev/test
  }

  // Note: Using console for validation messages as logger may not be initialized yet
  // These are startup messages that should always be visible

  // Critical: JWT Secret must be strong in production
  if (!env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is required in production environment. Generate a strong random secret.",
    );
  }

  if (env.JWT_SECRET.length < 32) {
    throw new Error(
      "JWT_SECRET must be at least 32 characters long in production for security.",
    );
  }

  // Warn on weak/default JWT secrets
  const weakSecrets = [
    "change-me-in-production",
    "secret",
    "your-secret-key",
    "jwt-secret",
  ];
  if (
    weakSecrets.some((weak) =>
      env.JWT_SECRET?.toLowerCase().includes(weak.toLowerCase()),
    )
  ) {
    throw new Error(
      "JWT_SECRET contains a default/weak value. Use a cryptographically secure random string.",
    );
  }

  // Database: Warn if using SQLite in production
  if (env.DB_DRIVER === "sqlite") {
    console.warn(
      "⚠️  WARNING: Using SQLite in production. Consider PostgreSQL for better scalability and reliability.",
    );
  }

  // Database: PostgreSQL should have proper connection string
  if (env.DB_DRIVER === "postgresql" && !env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for PostgreSQL in production");
  }

  // CORS: Warn on overly permissive CORS
  if (
    env.CORS_ORIGIN === "*" ||
    env.CORS_ORIGIN.includes("localhost") ||
    env.CORS_ORIGIN.includes("127.0.0.1")
  ) {
    console.warn(
      "⚠️  WARNING: CORS_ORIGIN contains localhost or wildcard in production. This may be a security risk.",
    );
  }

  // AI Provider: Ensure proper configuration
  validateProviderConfig(env);
}

/**
 * Comprehensive environment validation
 *
 * Validates both general and production-specific configuration.
 * Should be called at application startup.
 *
 * @throws Error if validation fails
 */
export function validateEnvironment(): Env {
  const env = validateEnv();
  validateProductionConfig(env);
  return env;
}
