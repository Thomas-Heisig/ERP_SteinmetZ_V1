// apps/backend/src/services/aiProviderHealthService.ts
/**
 * AI Provider Health Check Service
 * ---------------------------------------------------------
 * Manages health checks for all AI providers and implements
 * fallback mechanisms when providers are unavailable.
 */

import fetch from "node-fetch";
import { log } from "../routes/ai/utils/logger.js";
import OpenAI from "openai";

export interface ProviderHealth {
  provider: string;
  status: "healthy" | "degraded" | "unavailable";
  latency?: number;
  error?: string;
  timestamp: string;
  details?: any;
}

export interface HealthCheckResult {
  overall: "healthy" | "degraded" | "unavailable";
  providers: ProviderHealth[];
  timestamp: string;
}

/**
 * Check OpenAI provider health
 */
export async function checkOpenAIHealth(): Promise<ProviderHealth> {
  const start = Date.now();
  const provider = "openai";

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        provider,
        status: "unavailable",
        error: "API key not configured",
        timestamp: new Date().toISOString(),
      };
    }

    const client = new OpenAI({ apiKey });

    // Simple API check by listing models
    await client.models.list();

    const latency = Date.now() - start;

    return {
      provider,
      status: "healthy",
      latency,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    log("warn", `OpenAI health check failed: ${error.message}`);
    return {
      provider,
      status: "unavailable",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Check Ollama provider health
 */
export async function checkOllamaHealth(): Promise<ProviderHealth> {
  const start = Date.now();
  const provider = "ollama";
  const baseURL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  try {
    const response = await fetch(`${baseURL}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return {
        provider,
        status: "degraded",
        error: `HTTP ${response.status}`,
        timestamp: new Date().toISOString(),
      };
    }

    const data = (await response.json()) as any;
    const latency = Date.now() - start;

    return {
      provider,
      status: "healthy",
      latency,
      timestamp: new Date().toISOString(),
      details: {
        modelsCount: data.models?.length || 0,
      },
    };
  } catch (error: any) {
    log("warn", `Ollama health check failed: ${error.message}`);
    return {
      provider,
      status: "unavailable",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Check Anthropic provider health
 */
export async function checkAnthropicHealth(): Promise<ProviderHealth> {
  const start = Date.now();
  const provider = "anthropic";

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        provider,
        status: "unavailable",
        error: "API key not configured",
        timestamp: new Date().toISOString(),
      };
    }

    // Basic connectivity check
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1,
        messages: [{ role: "user", content: "test" }],
      }),
      signal: AbortSignal.timeout(10000),
    });

    const latency = Date.now() - start;

    // Even rate limit or quota errors mean the API is reachable
    if (response.status === 429 || response.status === 402) {
      return {
        provider,
        status: "degraded",
        latency,
        error: `Rate limited or quota exceeded (${response.status})`,
        timestamp: new Date().toISOString(),
      };
    }

    if (response.ok || response.status === 400) {
      // 400 is fine - means API is reachable but our test request was invalid
      return {
        provider,
        status: "healthy",
        latency,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      provider,
      status: "unavailable",
      error: `HTTP ${response.status}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    log("warn", `Anthropic health check failed: ${error.message}`);
    return {
      provider,
      status: "unavailable",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Check local/fallback provider (always available)
 */
export async function checkFallbackHealth(): Promise<ProviderHealth> {
  return {
    provider: "fallback",
    status: "healthy",
    latency: 0,
    timestamp: new Date().toISOString(),
    details: {
      type: "local",
      alwaysAvailable: true,
    },
  };
}

/**
 * Check all AI providers
 */
export async function checkAllProviders(): Promise<HealthCheckResult> {
  const providers = await Promise.all([
    checkOpenAIHealth(),
    checkOllamaHealth(),
    checkAnthropicHealth(),
    checkFallbackHealth(),
  ]);

  // Determine overall status
  const healthyCount = providers.filter((p) => p.status === "healthy").length;
  const degradedCount = providers.filter((p) => p.status === "degraded").length;

  let overall: "healthy" | "degraded" | "unavailable";
  if (healthyCount >= 2) {
    overall = "healthy";
  } else if (healthyCount >= 1 || degradedCount >= 1) {
    overall = "degraded";
  } else {
    overall = "unavailable";
  }

  return {
    overall,
    providers,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get list of available providers (for fallback mechanism)
 */
export async function getAvailableProviders(): Promise<string[]> {
  const result = await checkAllProviders();
  return result.providers
    .filter((p) => p.status === "healthy")
    .map((p) => p.provider);
}

/**
 * Determine best available provider
 */
export async function getBestAvailableProvider(): Promise<string> {
  const available = await getAvailableProviders();

  // Priority order: OpenAI > Anthropic > Ollama > Fallback
  const priority = ["openai", "anthropic", "ollama", "fallback"];

  for (const provider of priority) {
    if (available.includes(provider)) {
      log("info", `Selected provider: ${provider}`);
      return provider;
    }
  }

  // Always return fallback as last resort
  return "fallback";
}
