// SPDX-License-Identifier: MIT
// apps/backend/src/config/env.ts
// Environment variable validation and management

import { z } from "zod";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("config:env");

/**
 * Zod schema for backend environment variable validation
 * Includes server, database, AI provider, and security configurations
 * @see docs/ENVIRONMENT_VARIABLES.md for complete documentation
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
 *
 * Reads from process.env and validates against the defined schema.
 * Provides detailed error messages for validation failures.
 *
 * @returns {Env} Validated environment configuration
 * @throws {Error} if validation fails with descriptive messages
 */
export function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env);
    logger.debug("Environment variables validated successfully");
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error({ issues: error.issues }, "Environment validation failed");
      console.error("❌ Environment variable validation failed:");

      if ("issues" in error && Array.isArray(error.issues)) {
        error.issues.forEach((issue: z.ZodIssue) => {
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
 *
 * Returns cached configuration after first validation to avoid repeated parsing.
 * This is the primary way to access environment variables throughout the application.
 *
 * @example
 * ```typescript
 * const env = getEnv();
 * const port = env.PORT;
 * const dbUrl = env.DATABASE_URL;
 * ```
 *
 * @returns {Env} Cached validated environment configuration
 */
let cachedEnv: Env | null = null;
export function getEnv(): Env {
  if (!cachedEnv) {
    logger.info("Initializing environment configuration");
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * Validate AI provider-specific configuration requirements
 *
 * Different AI providers require different environment variables.
 * This function checks that all required variables for the selected
 * provider are present and valid.
 *
 * @param {Env} env - Environment configuration to validate
 * @throws {Error} if required provider variables are missing
 *
 * @example
 * ```typescript
 * const env = validateEnv();
 * validateProviderConfig(env);  // Throws if provider config is invalid
 * ```
 */
export function validateProviderConfig(env: Env): void {
  const provider = env.AI_PROVIDER;
  logger.debug({ provider }, "Validating AI provider configuration");

  if (provider === "openai" && !env.OPENAI_API_KEY) {
    logger.error("OpenAI API key not configured");
    throw new Error(
      "OPENAI_API_KEY is required when AI_PROVIDER is set to 'openai'",
    );
  }

  if (provider === "anthropic" && !env.ANTHROPIC_API_KEY) {
    logger.error("Anthropic API key not configured");
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
    logger.error("Azure OpenAI configuration incomplete");
    throw new Error(
      "AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT are required when AI_PROVIDER is set to 'azure'",
    );
  }

  if (provider === "local" && !env.LOCAL_MODEL_PATH) {
    logger.error("Local model path not configured");
    throw new Error(
      "LOCAL_MODEL_PATH is required when AI_PROVIDER is set to 'local'",
    );
  }

  if (env.DB_DRIVER === "sqlite" && !env.SQLITE_FILE) {
    logger.warn(
      "SQLITE_FILE not explicitly set, using default: ../../data/dev.sqlite3",
    );
    console.warn(
      "⚠️  SQLITE_FILE not set, using default: ../../data/dev.sqlite3",
    );
  }

  if (env.DB_DRIVER === "postgresql" && !env.DATABASE_URL) {
    logger.error("PostgreSQL connection string missing");
    throw new Error(
      "DATABASE_URL is required when DB_DRIVER is set to 'postgresql'",
    );
  }

  logger.debug("AI provider configuration validated successfully");
}

/**
 * Validate production-specific environment configuration
 *
 * Performs comprehensive security and reliability checks for production environments:
 * - JWT secret strength and validity
 * - Database configuration appropriateness
 * - Security settings and CORS configuration
 * - Warnings for potential development defaults in production
 *
 * Skips validation entirely in non-production environments (development, test).
 *
 * @param {Env} env - Environment configuration to validate
 * @throws {Error} if critical production requirements are not met
 *
 * @example
 * ```typescript
 * const env = getEnv();
 * validateProductionConfig(env);  // Validates if NODE_ENV=production
 * ```
 */
export function validateProductionConfig(env: Env): void {
  if (env.NODE_ENV !== "production") {
    logger.debug(
      "Skipping production validation in non-production environment",
    );
    return; // Skip production validation in dev/test
  }

  logger.info("Validating production configuration");

  // Critical: JWT Secret must be strong in production
  if (!env.JWT_SECRET) {
    logger.error("JWT_SECRET not configured for production");
    throw new Error(
      "JWT_SECRET is required in production environment. Generate a strong random secret.",
    );
  }

  if (env.JWT_SECRET.length < 32) {
    logger.error({ length: env.JWT_SECRET.length }, "JWT_SECRET too short");
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
    logger.error("JWT_SECRET contains weak/default value");
    throw new Error(
      "JWT_SECRET contains a default/weak value. Use a cryptographically secure random string.",
    );
  }

  // Database: Warn if using SQLite in production
  if (env.DB_DRIVER === "sqlite") {
    logger.warn("SQLite is not recommended for production");
    console.warn(
      "⚠️  WARNING: Using SQLite in production. Consider PostgreSQL for better scalability and reliability.",
    );
  }

  // Database: PostgreSQL should have proper connection string
  if (env.DB_DRIVER === "postgresql" && !env.DATABASE_URL) {
    logger.error("PostgreSQL DATABASE_URL not configured");
    throw new Error("DATABASE_URL is required for PostgreSQL in production");
  }

  // CORS: Warn on overly permissive CORS
  if (
    env.CORS_ORIGIN === "*" ||
    env.CORS_ORIGIN.includes("localhost") ||
    env.CORS_ORIGIN.includes("127.0.0.1")
  ) {
    logger.warn(
      { corsOrigin: env.CORS_ORIGIN },
      "Overly permissive CORS in production",
    );
    console.warn(
      "⚠️  WARNING: CORS_ORIGIN contains localhost or wildcard in production. This may be a security risk.",
    );
  }

  // AI Provider: Ensure proper configuration
  validateProviderConfig(env);

  logger.info("Production configuration validation completed successfully");
}

/**
 * Comprehensive environment validation
 *
 * Main entry point for environment validation that should be called
 * at application startup. Combines general validation with production-specific checks.
 *
 * This function:
 * 1. Validates all environment variables against the schema
 * 2. Performs provider-specific validation
 * 3. Performs production-specific validation if applicable
 * 4. Returns the validated environment configuration
 *
 * @returns {Env} Fully validated environment configuration
 * @throws {Error} if any validation step fails
 *
 * @example
 * ```typescript
 * // At application startup
 * const env = validateEnvironment();
 * // Now safe to use env throughout the app
 * ```
 */
export function validateEnvironment(): Env {
  logger.info(
    { nodeEnv: process.env.NODE_ENV || "not set" },
    "Starting environment validation",
  );
  const env = validateEnv();
  validateProductionConfig(env);
  logger.info("Environment validation completed successfully");
  return env;
}
