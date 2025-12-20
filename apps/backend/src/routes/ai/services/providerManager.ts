/**
 * Provider Manager Service
 * 
 * Manages AI provider selection, health checking, and fallback chain
 * for the QuickChat component.
 * 
 * Provider Priority (configurable):
 * 1. Ollama (local, fast, offline)
 * 2. Eliza (rule-based fallback, always available)
 * 3. Simple fallback (basic responses)
 * 
 * @module services/providerManager
 */

import { createLogger } from "../../../utils/logger.js";
import type { ChatMessage, AIResponse } from "../types/types.js";
import { callOllama, listOllamaModels } from "../providers/ollamaProvider.js";
import { elizaProvider } from "../providers/elizaProvider.js";
import generateAIResponse from "../providers/fallbackProvider.js";
import { loadAPIKeys } from "./apiKeyService.js";

const logger = createLogger("providerManager");

export interface ProviderStatus {
  provider: string;
  available: boolean;
  status: "online" | "offline" | "error" | "unknown";
  message?: string;
  latency?: number;
  lastChecked: string;
}

export interface ProviderConfig {
  name: string;
  enabled: boolean;
  priority: number;
  apiKey?: string;
  endpoint?: string;
}

/**
 * Provider Manager Class
 */
export class ProviderManager {
  private providerCache: Map<string, ProviderStatus> = new Map();
  private cacheTimeout = 30000; // 30 seconds
  private providers: ProviderConfig[] = [
    { name: "ollama", enabled: true, priority: 1 },
    { name: "eliza", enabled: true, priority: 2 },
    { name: "fallback", enabled: true, priority: 3 },
  ];

  /**
   * Get status of all configured providers
   */
  async getProviderStatus(): Promise<ProviderStatus[]> {
    const statuses: ProviderStatus[] = [];

    // Check Ollama
    statuses.push(await this.checkOllamaStatus());

    // Check Eliza (always available)
    statuses.push({
      provider: "eliza",
      available: true,
      status: "online",
      message: "Rule-based provider always available",
      lastChecked: new Date().toISOString(),
    });

    // Check OpenAI (if configured)
    statuses.push(await this.checkOpenAIStatus());

    // Check Anthropic (if configured)
    statuses.push(await this.checkAnthropicStatus());

    // Check Azure (if configured)
    statuses.push(await this.checkAzureStatus());

    // Update cache
    statuses.forEach(status => {
      this.providerCache.set(status.provider, status);
    });

    return statuses;
  }

  /**
   * Check if Ollama is available
   */
  private async checkOllamaStatus(): Promise<ProviderStatus> {
    const startTime = Date.now();
    try {
      const models = await listOllamaModels();
      const latency = Date.now() - startTime;

      if (models.length > 0) {
        return {
          provider: "ollama",
          available: true,
          status: "online",
          message: `${models.length} models available`,
          latency,
          lastChecked: new Date().toISOString(),
        };
      } else {
        return {
          provider: "ollama",
          available: false,
          status: "offline",
          message: "No models found",
          lastChecked: new Date().toISOString(),
        };
      }
    } catch (error) {
      return {
        provider: "ollama",
        available: false,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check if OpenAI is configured and available
   */
  private async checkOpenAIStatus(): Promise<ProviderStatus> {
    try {
      const apiKeys = await loadAPIKeys();
      const apiKey = apiKeys.openai || process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        return {
          provider: "openai",
          available: false,
          status: "offline",
          message: "API key not configured",
          lastChecked: new Date().toISOString(),
        };
      }

      // Don't actually call the API for health check to avoid costs
      // Just verify the key is present
      return {
        provider: "openai",
        available: true,
        status: "online",
        message: "API key configured",
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        provider: "openai",
        available: false,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check if Anthropic is configured and available
   */
  private async checkAnthropicStatus(): Promise<ProviderStatus> {
    try {
      const apiKeys = await loadAPIKeys();
      const apiKey = apiKeys.anthropic || process.env.ANTHROPIC_API_KEY;
      
      if (!apiKey) {
        return {
          provider: "anthropic",
          available: false,
          status: "offline",
          message: "API key not configured",
          lastChecked: new Date().toISOString(),
        };
      }

      return {
        provider: "anthropic",
        available: true,
        status: "online",
        message: "API key configured",
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        provider: "anthropic",
        available: false,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check if Azure OpenAI is configured and available
   */
  private async checkAzureStatus(): Promise<ProviderStatus> {
    try {
      const apiKeys = await loadAPIKeys();
      const apiKey = apiKeys.azure?.apiKey || process.env.AZURE_OPENAI_API_KEY;
      const endpoint = apiKeys.azure?.endpoint || process.env.AZURE_OPENAI_ENDPOINT;
      
      if (!apiKey || !endpoint) {
        return {
          provider: "azure",
          available: false,
          status: "offline",
          message: "API key or endpoint not configured",
          lastChecked: new Date().toISOString(),
        };
      }

      return {
        provider: "azure",
        available: true,
        status: "online",
        message: "API key and endpoint configured",
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        provider: "azure",
        available: false,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Send a message using the best available provider with fallback chain
   */
  async sendMessage(
    messages: ChatMessage[],
    preferredProvider?: string,
    model?: string
  ): Promise<AIResponse> {
    const providerChain = this.getProviderChain(preferredProvider);

    for (const provider of providerChain) {
      try {
        logger.info({ provider, model }, "Attempting to send message via provider");
        
        const response = await this.callProvider(provider, messages, model);
        
        logger.info({ provider, model }, "Message sent successfully");
        return response;
      } catch (error) {
        logger.warn(
          { provider, error: error instanceof Error ? error.message : String(error) },
          "Provider failed, trying next in chain"
        );
        continue;
      }
    }

    // If all providers fail, return fallback response
    logger.error("All providers failed, using basic fallback");
    return {
      text: "Es tut mir leid, derzeit sind keine KI-Provider verfügbar. Bitte versuchen Sie es später erneut.",
      meta: {
        provider: "fallback",
        model: "none",
      }
    };
  }

  /**
   * Get the provider chain based on preferences
   */
  private getProviderChain(preferredProvider?: string): string[] {
    const chain: string[] = [];

    // Add preferred provider first if specified and enabled
    if (preferredProvider) {
      const providerConfig = this.providers.find(p => p.name === preferredProvider);
      if (providerConfig?.enabled) {
        chain.push(preferredProvider);
      }
    }

    // Add remaining providers in priority order
    const sortedProviders = [...this.providers]
      .filter(p => p.enabled && p.name !== preferredProvider)
      .sort((a, b) => a.priority - b.priority);

    chain.push(...sortedProviders.map(p => p.name));

    return chain;
  }

  /**
   * Call a specific provider
   */
  private async callProvider(
    provider: string,
    messages: ChatMessage[],
    model?: string
  ): Promise<AIResponse> {
    switch (provider) {
      case "ollama":
        return await callOllama(
          model || process.env.OLLAMA_MODEL || "qwen2.5:3b",
          messages
        );

      case "eliza":
        return await elizaProvider.respond(messages);

      case "fallback":
        const response = await generateAIResponse(
          model || "fallback",
          messages
        );
        return {
          text: typeof response === "string" ? response : response.text,
          meta: {
            provider: "fallback",
            model: model || "fallback",
          }
        };

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Get cached provider status (fast)
   */
  getCachedStatus(provider: string): ProviderStatus | null {
    const cached = this.providerCache.get(provider);
    if (!cached) return null;

    // Check if cache is still valid
    const cacheAge = Date.now() - new Date(cached.lastChecked).getTime();
    if (cacheAge > this.cacheTimeout) {
      return null;
    }

    return cached;
  }
}

// Export singleton instance
export const providerManager = new ProviderManager();
