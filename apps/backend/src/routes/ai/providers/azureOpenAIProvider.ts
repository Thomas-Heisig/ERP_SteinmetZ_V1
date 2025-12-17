/**
 * azureOpenAIProvider.ts
 * ---------------------------------------------------------
 * Verbindung zu Azure OpenAI Service (GPT-3.5 / GPT-4 / GPT-4o)
 * Angepasst an das ERP_SteinmetZ_V1 KI-System.
 */

import OpenAI from "openai";
import type {
  ChatMessage,
  AIModuleConfig,
  AIOptions,
  ModelResponse,
  Provider,
  ToolResult,
} from "../types/types.js";
import { log } from "../utils/logger.js";
import { toolRegistry } from "../tools/registry.js";
import { ConversationContext } from "../context/conversationContext.js";

/* ========================================================================== */
/* 🏗️ Typdefinitionen und Konfiguration                                    */
/* ========================================================================== */

interface AzureOpenAIProviderConfig {
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  enableToolCalls?: boolean;
  enableStreaming?: boolean;
  fallbackOnError?: boolean;
  apiVersion?: string;
  deploymentName?: string;
}

interface AzureClientConfig {
  apiKey: string;
  endpoint: string;
  deployment: string;
  apiVersion: string;
}

/* ========================================================================== */
/* 🔧 Konfiguration (aus .env oder Defaults) - VERBESSERT                  */
/* ========================================================================== */

export const azureConfig: AIModuleConfig = {
  name: "azureOpenAIProvider",
  provider: "azure" as Provider,
  model: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4",
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  api_key_env: "AZURE_OPENAI_API_KEY",
  temperature: Number(process.env.AZURE_OPENAI_TEMPERATURE) || 0.4,
  max_tokens: Number(process.env.AZURE_OPENAI_MAX_TOKENS) || 1500,
  description: "Azure OpenAI Integration (GPT-3.5 / GPT-4 / GPT-4o)",
  capabilities: ["chat", "tools", "json_mode", "completion"],
  active: true,
  timeout_ms: 30000,
  category: "general",
  streaming: false,
  cacheable: true,
};

// Client-Caching für bessere Performance
let azureClient: OpenAI | null = null;
let clientInitialization: Promise<OpenAI> | null = null;

/* ========================================================================== */
/* 🧠 Hilfsfunktion: OpenAI Client erstellen - VERBESSERT                  */
/* ========================================================================== */

async function initializeAzureClient(): Promise<OpenAI> {
  if (azureClient) return azureClient;

  // Verhindere parallele Initialisierung
  if (!clientInitialization) {
    clientInitialization = (async () => {
      try {
        const config = getAzureClientConfig();

        azureClient = new OpenAI({
          apiKey: config.apiKey,
          baseURL: `${config.endpoint}/openai/deployments/${config.deployment}`,
          defaultHeaders: { "api-key": config.apiKey },
          defaultQuery: { "api-version": config.apiVersion },
          timeout: 30000,
          maxRetries: 2,
        });

        log("info", "Azure OpenAI Client erfolgreich initialisiert", {
          endpoint: config.endpoint,
          deployment: config.deployment,
          apiVersion: config.apiVersion,
        });

        return azureClient;
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        clientInitialization = null;
        throw new Error(
          `Fehler bei Azure OpenAI Client Initialisierung: ${errorMsg}`,
        );
      }
    })();
  }

  return clientInitialization;
}

function getAzureClientConfig(): AzureClientConfig {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || azureConfig.model;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-02-01";

  if (!apiKey || !endpoint || !deployment) {
    const missing = [];
    if (!apiKey) missing.push("AZURE_OPENAI_API_KEY");
    if (!endpoint) missing.push("AZURE_OPENAI_ENDPOINT");
    if (!deployment) missing.push("AZURE_OPENAI_DEPLOYMENT");

    throw new Error(
      `Azure OpenAI Konfiguration unvollständig. Fehlend: ${missing.join(", ")}`,
    );
  }

  return { apiKey, endpoint, deployment, apiVersion };
}

async function getAzureClient(): Promise<OpenAI> {
  try {
    return await initializeAzureClient();
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log("error", "Fehler beim Holen des Azure OpenAI Clients", {
      error: errorMsg,
    });
    throw error;
  }
}

/* ========================================================================== */
/* 💬 Hauptfunktion: Anfrage an Azure OpenAI - VERBESSERT                 */
/* ========================================================================== */

export async function callAzureOpenAI(
  model: string,
  messages: ChatMessage[],
  options: AIOptions = {},
  context: ConversationContext = new ConversationContext(),
): Promise<ModelResponse> {
  const startTime = Date.now();
  const config: AzureOpenAIProviderConfig = {
    maxTokens: options.maxTokens || azureConfig.max_tokens,
    temperature: options.temperature ?? azureConfig.temperature,
    timeoutMs: options.timeoutMs || azureConfig.timeout_ms,
    enableToolCalls: true,
    enableStreaming: false,
    fallbackOnError: true,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-01",
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT,
    ...options.context?.azureConfig,
  };

  try {
    const client = await getAzureClient();
    const usedModel = model || azureConfig.model;

    // Bereite Messages für OpenAI vor
    const { systemPrompt, chatMessages, tools } = prepareOpenAIMessages(
      messages,
      config,
    );

    // Request Body vorbereiten
    const requestBody: Record<string, unknown> = {
      model: usedModel,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      messages: chatMessages,
      ...(systemPrompt && { system: systemPrompt }),
      ...(tools && tools.length > 0 && { tools }),
      ...(config.enableToolCalls && { tool_choice: "auto" }),
    };

    log("debug", "Azure OpenAI API Request vorbereitet", {
      model: usedModel,
      messageCount: chatMessages.length,
      hasSystemPrompt: !!systemPrompt,
      toolsCount: tools?.length || 0,
      temperature: config.temperature,
    });

    // API Call mit Timeout
    const result = (await Promise.race([
      client.chat.completions.create(requestBody as unknown as Parameters<typeof client.chat.completions.create>[0]),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Azure OpenAI API Timeout")),
          config.timeoutMs || 30000,
        ),
      ),
    ])) as OpenAI.Chat.Completions.ChatCompletion;

    const duration = Date.now() - startTime;

    // Verarbeite Response
    const reply = result?.choices?.[0]?.message?.content?.trim() || "";
    const toolCalls = result?.choices?.[0]?.message?.tool_calls || [];

    // Logging
    log("info", "Azure OpenAI Antwort empfangen", {
      model: usedModel,
      input_tokens: result?.usage?.prompt_tokens,
      output_tokens: result?.usage?.completion_tokens,
      total_tokens: result?.usage?.total_tokens,
      duration_ms: duration,
      has_tool_calls: toolCalls.length > 0,
    });

    // Tool-Calls ausführen falls vorhanden
    let toolResults: ToolResult[] = [];
    if (config.enableToolCalls && toolCalls.length > 0) {
      toolResults = await executeToolCalls(toolCalls);
    }

    // Kontext aktualisieren
    context.update(messages, duration);

    // ModelResponse erstellen
    const modelResponse: ModelResponse = {
      model: usedModel,
      provider: "azure" as Provider,
      text: reply || "(keine Antwort von Azure OpenAI erhalten)",
      tokens_in: result?.usage?.prompt_tokens,
      tokens_out: result?.usage?.completion_tokens,
      duration_ms: duration,
      tool_calls: toolCalls.map(tc => {
        const toolCallAny = tc as OpenAI.Chat.Completions.ChatCompletionMessageToolCall & { function?: { name?: string; arguments?: string } };
        return {
          name: toolCallAny.function?.name || "unknown",
          parameters: (() => {
            try {
              return JSON.parse(toolCallAny.function?.arguments || "{}") as Record<string, unknown>;
            } catch {
              return {};
            }
          })(),
          id: tc.id,
          type: "function" as const,
        };
      }),
      success: true,
      meta: {
        finish_reason: result?.choices?.[0]?.finish_reason,
        tool_results: toolResults,
        deployment: config.deploymentName,
        api_version: config.apiVersion,
      },
    };

    // Tool-Results anhängen falls vorhanden
    if (toolResults.length > 0) {
      modelResponse.text += formatToolResults(toolResults);
    }

    return modelResponse;
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    log("error", "Azure OpenAI Fehler", {
      model: model || azureConfig.model,
      error: errorMsg,
      duration_ms: duration,
      stack: config.fallbackOnError ? errorStack : undefined,
    });

    // Fallback Response bei aktiviertem Fallback
    if (config.fallbackOnError) {
      return createFallbackResponse(model, errorMsg, duration);
    }

    throw new Error(`Azure OpenAI Provider Fehler: ${errorMsg}`);
  }
}

/* ========================================================================== */
/* 🛠️ Message Preparation & Tool Execution                                */
/* ========================================================================== */

function prepareOpenAIMessages(
  messages: ChatMessage[],
  config: AzureOpenAIProviderConfig,
): {
  systemPrompt?: string;
  chatMessages: Array<{ role: string; content: string; metadata?: unknown }>;
  tools?: Array<{ type: "function"; function: { name: string; description: string; parameters: unknown } }>;
} {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { systemPrompt: undefined, chatMessages: [] };
  }

  // System-Prompt extrahieren
  const systemMessages = messages
    .filter((m) => m.role === "system")
    .map((m) => String(m.content || ""))
    .filter((content) => content.trim().length > 0);

  const systemPrompt =
    systemMessages.length > 0 ? systemMessages.join("\n\n") : undefined;

  // Chat-Nachrichten mappen
  const chatMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role,
      content: String(m.content || ""),
      ...(m.metadata && { metadata: m.metadata }),
    }))
    .filter((m) => m.content.trim().length > 0);

  // Tools vorbereiten falls aktiviert
  let tools: Array<{ type: "function"; function: { name: string; description: string; parameters: unknown } }> | undefined;
  if (config.enableToolCalls) {
    tools = prepareToolsForOpenAI();
  }

  return { systemPrompt, chatMessages, tools };
}

function prepareToolsForOpenAI(): Array<{ type: "function"; function: { name: string; description: string; parameters: unknown } }> {
  const tools = toolRegistry.getToolDefinitions();
  return tools
    .map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description || `Tool: ${tool.name}`,
        parameters: {
          type: "object",
          properties: tool.parameters || {},
          required: tool.parameters
            ? Object.keys(tool.parameters).filter(
                (key) => tool.parameters?.[key]?.required,
              )
            : [],
        },
      },
    }))
    .filter((tool) => tool.function.name && tool.function.description);
}

async function executeToolCalls(toolCalls: unknown[]): Promise<ToolResult[]> {
  const results: ToolResult[] = [];

  for (const toolCall of toolCalls) {
    if (typeof toolCall !== "object" || toolCall === null) continue;
    
    const call = toolCall as { function?: { name?: string; arguments?: string } };
    const startTime = Date.now();

    try {
      const toolName = call.function?.name;
      let parameters: Record<string, unknown> = {};

      try {
        parameters = JSON.parse(call.function?.arguments || "{}") as Record<string, unknown>;
      } catch {
        parameters = {};
      }

      if (!toolName) {
        throw new Error("Tool name missing in tool call");
      }

      const tool = toolRegistry.get(toolName);
      if (!tool) {
        throw new Error(`Unbekanntes Tool: ${toolName}`);
      }

      const result = await tool(parameters);

      results.push({
        success: true,
        data: result,
        runtime_ms: Date.now() - startTime,
        source_tool: toolName,
        timestamp: new Date().toISOString(),
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      results.push({
        success: false,
        error: errorMsg,
        runtime_ms: Date.now() - startTime,
        source_tool: call.function?.name || "unknown",
        timestamp: new Date().toISOString(),
      });
    }
  }

  return results;
}

function formatToolResults(results: ToolResult[]): string {
  if (results.length === 0) return "";

  const summary = results
    .map((r) =>
      r.success
        ? `✅ [${r.source_tool}] Ausführung erfolgreich (${r.runtime_ms}ms)`
        : `❌ [${r.source_tool}] Fehler: ${r.error}`,
    )
    .join("\n");

  return `\n\n---\n**Tool-Ausführungen:**\n${summary}`;
}

/* ========================================================================== */
/* 🛡️ Fallback & Error Handling                                           */
/* ========================================================================== */

function createFallbackResponse(
  model: string,
  error: string,
  duration: number,
): ModelResponse {
  const fallbackText = `Entschuldigung, es gab einen Verbindungsfehler zu Azure OpenAI (${error}). 
Bitte versuchen Sie es später erneut oder verwenden Sie einen anderen Provider.`;

  return {
    model,
    provider: "azure" as Provider,
    text: fallbackText,
    duration_ms: duration,
    success: false,
    errors: [error],
    meta: {
      source: "fallback",
      error_type: "API_ERROR",
    },
  };
}

/* ========================================================================== */
/* 🧩 Hilfsfunktion: Modellzugehörigkeit prüfen - VERBESSERT              */
/* ========================================================================== */

export function isAzureOpenAIModel(modelId: string): boolean {
  if (!modelId || typeof modelId !== "string") return false;

  const lowerModelId = modelId.toLowerCase();

  return (
    lowerModelId.includes("azure") ||
    lowerModelId.startsWith("gpt-") ||
    lowerModelId.includes("openai-azure") ||
    lowerModelId.includes("deployment") ||
    // Azure spezifische Muster
    (/^[a-z0-9-]+$/.test(lowerModelId) && lowerModelId.length > 10) // Azure Deployment Namen
  );
}

export function getSupportedAzureModels(): string[] {
  return [
    "gpt-4",
    "gpt-4-32k",
    "gpt-4-turbo",
    "gpt-4o",
    "gpt-35-turbo",
    "gpt-35-turbo-16k",
    "gpt-35-turbo-instruct",
  ];
}

export function validateAzureConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.AZURE_OPENAI_API_KEY) {
    errors.push("AZURE_OPENAI_API_KEY Umgebungsvariable fehlt");
  }

  if (!process.env.AZURE_OPENAI_ENDPOINT) {
    errors.push("AZURE_OPENAI_ENDPOINT Umgebungsvariable fehlt");
  }

  if (!process.env.AZURE_OPENAI_DEPLOYMENT) {
    errors.push("AZURE_OPENAI_DEPLOYMENT Umgebungsvariable fehlt");
  }

  // Endpoint Validierung
  if (process.env.AZURE_OPENAI_ENDPOINT) {
    try {
      new URL(process.env.AZURE_OPENAI_ENDPOINT);
    } catch {
      errors.push("AZURE_OPENAI_ENDPOINT ist keine gültige URL");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/* ========================================================================== */
/* 🧪 Provider Interface für Framework-Integration                         */
/* ========================================================================== */

export const azureOpenAIProvider = {
  name: "azure" as Provider,
  call: callAzureOpenAI,
  isSupportedModel: isAzureOpenAIModel,
  getSupportedModels: getSupportedAzureModels,
  validateConfig: validateAzureConfig,
  config: azureConfig,

  // Erweiterte Methoden
  async healthCheck(): Promise<{ healthy: boolean; details?: unknown }> {
    try {
      const configCheck = validateAzureConfig();
      if (!configCheck.valid) {
        return { healthy: false, details: configCheck };
      }

      // Test-Call mit minimalem Prompt
      const testMessages: ChatMessage[] = [{ role: "user", content: "Hello" }];

      await callAzureOpenAI(azureConfig.model, testMessages);
      return { healthy: true };
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        healthy: false,
        details: { error: errorMsg },
      };
    }
  },

  // Client-Reset für Re-Initialisierung
  resetClient(): void {
    azureClient = null;
    clientInitialization = null;
    log("info", "Azure OpenAI Client zurückgesetzt");
  },
};

export default azureOpenAIProvider;
