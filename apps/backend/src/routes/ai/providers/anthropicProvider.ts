/**
 * anthropicProvider.ts
 * ---------------------------------------------------------
 * Wrapper für die Anthropic Claude API (Claude 3 / 3.5 usw.)
 * Mit Tool- und Agentenintegration, vorbereitet für Any-to-Any-Kommunikation.
 *
 * Nutzt zentrale Typen und ToolRegistry aus dem Framework.
 */

import type {
  ChatMessage,
  ToolResult,
  ToolFunction,
  AIResponse,
  AIOptions,
  ModelResponse,
  Provider,
  ConversationState,
} from "../types/types.js";
import { log } from "../utils/logger.js";
import { toolRegistry } from "../tools/registry.js";
import { workflowEngine } from "../workflows/workflowEngine.js";
import { ConversationContext } from "../context/conversationContext.js";

/* ========================================================================== */
/* 🏗️ Typdefinitionen und Konfiguration                                     */
/* ========================================================================== */

interface AnthropicProviderConfig {
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  enableToolCalls?: boolean;
  enableWorkflows?: boolean;
  toolCallPatterns?: RegExp[];
  fallbackOnError?: boolean;
  debugMode?: boolean;
}

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

interface AnthropicResponse {
  content: Array<{
    type: string;
    text?: string;
  }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  model: string;
  stop_reason?: string;
}

// Globale Variablen mit besserer Isolation
let AnthropicClient: any = null;
let clientInitialization: Promise<any> | null = null;

/* ========================================================================== */
/* 🏗️ Client-Initialisierung - VERBESSERT                                  */
/* ========================================================================== */

async function initializeAnthropicClient(): Promise<any> {
  if (AnthropicClient) return AnthropicClient;

  // Verhindere parallele Initialisierung
  if (!clientInitialization) {
    clientInitialization = (async () => {
      try {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new Error("ANTHROPIC_API_KEY fehlt in den Umgebungsvariablen");
        }

        // Dynamischer Import für bessere Performance
        const { default: Anthropic } = await import("@anthropic-ai/sdk");

        AnthropicClient = new Anthropic({
          apiKey,
          timeout: 30000, // 30 Sekunden Timeout
          maxRetries: 2,
        });

        log("info", "Anthropic Client erfolgreich initialisiert", {
          sdkVersion: AnthropicClient?._version || "unknown",
        });

        return AnthropicClient;
      } catch (error: any) {
        clientInitialization = null;
        throw new Error(
          `Fehler bei Anthropic Client Initialisierung: ${error.message}`,
        );
      }
    })();
  }

  return clientInitialization;
}

async function getAnthropicClient(): Promise<any> {
  try {
    return await initializeAnthropicClient();
  } catch (error: any) {
    log("error", "Fehler beim Holen des Anthropic Clients", {
      error: error.message,
    });
    throw error;
  }
}

/* ========================================================================== */
/* 💬 Message Mapping - VERBESSERT                                          */
/* ========================================================================== */

function mapMessages(messages: ChatMessage[]): {
  systemPrompt?: string;
  messageHistory: AnthropicMessage[];
  tools?: any[];
} {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { systemPrompt: undefined, messageHistory: [] };
  }

  // System-Prompt aus System-Nachrichten extrahieren
  const systemMessages = messages
    .filter((m) => m.role === "system")
    .map((m) => String(m.content || ""))
    .filter((content) => content.trim().length > 0);

  const systemPrompt =
    systemMessages.length > 0 ? systemMessages.join("\n\n") : undefined;

  // User/Assistant Nachrichten mappen
  const messageHistory: AnthropicMessage[] = [];

  for (const message of messages) {
    if (["user", "assistant"].includes(message.role)) {
      const content = String(message.content || "");
      if (content.trim().length > 0) {
        messageHistory.push({
          role: message.role as "user" | "assistant",
          content: content,
        });
      }
    }
  }

  return {
    systemPrompt,
    messageHistory,
    tools: prepareToolsForAnthropic(),
  };
}

function prepareToolsForAnthropic(): any[] {
  const tools = toolRegistry.getToolDefinitions();
  return tools
    .map((tool) => ({
      name: tool.name,
      description: tool.description || `Tool: ${tool.name}`,
      input_schema: {
        type: "object",
        properties: tool.parameters || {},
        required: tool.parameters
          ? Object.keys(tool.parameters).filter(
              (key) => tool.parameters?.[key]?.required,
            )
          : [],
      },
    }))
    .filter((tool) => tool.name && tool.description);
}

/* ========================================================================== */
/* 🛠️ Tool Execution - VERBESSERT & ERWEITERT                              */
/* ========================================================================== */

/**
 * Erweiterte Tool-Erkennung mit multiple Patterns
 */
async function detectAndRunTools(
  output: string,
  config: AnthropicProviderConfig = {},
): Promise<ToolResult[]> {
  const results: ToolResult[] = [];

  // Standard Tool-Call Patterns
  const defaultPatterns = [
    /#TOOL\s*:\s*(\w+)\((.*?)\)/g, // #TOOL: tool_name(params)
    /```tool\s+(\w+)([\s\S]*?)```/g, // ```tool tool_name params```
    /{"tool":\s*"(\w+)",\s*"params":\s*({[^}]*})}/g, // JSON Format
  ];

  const patterns = config.toolCallPatterns || defaultPatterns;

  for (const pattern of patterns) {
    const matches = output.matchAll(pattern);

    for (const match of matches) {
      const toolName = match[1]?.trim();
      let paramString = match[2]?.trim() || "{}";

      if (!toolName) continue;

      try {
        // Parameter-Parsing je nach Pattern-Typ
        const params = parseToolParams(paramString, pattern);
        const result = await executeToolCall(toolName, params);
        results.push(result);
      } catch (error: any) {
        results.push({
          success: false,
          error: error.message,
          source_tool: toolName,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Wenn wir Ergebnisse haben, breche ab um Duplikate zu vermeiden
    if (results.length > 0) break;
  }

  return results;
}

/**
 * Verbesserter Parameter-Parser mit JSON-Support
 */
function parseToolParams(
  paramString: string,
  pattern: RegExp,
): Record<string, any> {
  // Versuche JSON zu parsen falls vorhanden
  if (pattern.source.includes("{")) {
    try {
      const jsonMatch = paramString.match(/{[^}]*}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fallback zu key=value Parsing
    }
  }

  // Key=Value Parsing für einfache Syntax
  const params: Record<string, any> = {};
  const parts = paramString
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p);

  for (const part of parts) {
    const [key, ...valueParts] = part.split("=");
    if (!key) continue;

    const value = valueParts.join("=").trim();
    try {
      params[key.trim()] = JSON.parse(value);
    } catch {
      // Entferne Quotes falls vorhanden
      const cleanValue = value.replace(/^['"`]|['"`]$/g, "");
      params[key.trim()] =
        cleanValue === "true"
          ? true
          : cleanValue === "false"
            ? false
            : !isNaN(Number(cleanValue))
              ? Number(cleanValue)
              : cleanValue;
    }
  }

  return params;
}

/**
 * Tool-Ausführung mit erweiterter Fehlerbehandlung
 */
async function executeToolCall(
  toolName: string,
  params: Record<string, any>,
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    const tool = toolRegistry.get(toolName);
    if (!tool) {
      throw new Error(`Unbekanntes Tool: ${toolName}`);
    }

    // Parameter-Validierung
    const validatedParams = validateToolParameters(tool, params);

    // Tool ausführen
    const result = await (tool as ToolFunction)(validatedParams);

    return {
      success: true,
      data: result,
      runtime_ms: Date.now() - startTime,
      source_tool: toolName,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      runtime_ms: Date.now() - startTime,
      source_tool: toolName,
      timestamp: new Date().toISOString(),
    };
  }
}

function validateToolParameters(
  tool: any,
  params: Record<string, any>,
): Record<string, any> {
  // Hole alle Tool-Definitionen (Plural)
  const allDefs = toolRegistry.getToolDefinitions?.() ?? [];

  // Finde das passende Tool anhand des Namens
  const toolDef = allDefs.find((t: any) => t.name === (tool.name || "unknown"));

  if (!toolDef?.parameters) return params;

  const validated: Record<string, any> = {};

  // Iteriere sicher über Parameterdefinitionen
  for (const [key, rawSchema] of Object.entries(
    toolDef.parameters as Record<string, any>,
  )) {
    const schema = rawSchema ?? {};

    if (params[key] !== undefined) {
      validated[key] = params[key];
    } else if (schema.required) {
      throw new Error(`Erforderlicher Parameter fehlt: ${key}`);
    } else if (schema.default !== undefined) {
      validated[key] = schema.default;
    }
  }

  return validated;
}

/* ========================================================================== */
/* 🧠 Hauptfunktion – KI-Antwort generieren - VERBESSERT                    */
/* ========================================================================== */

export async function callAnthropic(
  model: string,
  messages: ChatMessage[],
  options: AIOptions = {},
  context: ConversationContext = new ConversationContext(),
): Promise<ModelResponse> {
  const startTime = Date.now();
  const config: AnthropicProviderConfig = {
    maxTokens: options.maxTokens || 1024,
    temperature: options.temperature ?? 0.4,
    timeoutMs: options.timeoutMs || 30000,
    enableToolCalls: true,
    enableWorkflows: true,
    fallbackOnError: true,
    ...options.context?.anthropicConfig,
  };

  try {
    const client = await getAnthropicClient();
    const { systemPrompt, messageHistory, tools } = mapMessages(messages);

    // Bereite Request vor
    const requestPayload: any = {
      model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      messages: messageHistory,
      ...(systemPrompt && { system: systemPrompt }),
      ...(tools && tools.length > 0 && { tools }),
    };

    log("debug", "Anthropic API Request vorbereitet", {
      model,
      messageCount: messageHistory.length,
      hasSystemPrompt: !!systemPrompt,
      toolsCount: tools?.length || 0,
    });

    // API Call mit Timeout
    const response = (await Promise.race([
      client.messages.create(requestPayload),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Anthropic API Timeout")),
          config.timeoutMs,
        ),
      ),
    ])) as AnthropicResponse;

    const duration = Date.now() - startTime;

    // Verarbeite Response
    let output = "";
    const toolCalls: Array<{ name: string; parameters: Record<string, any> }> =
      [];

    for (const part of response.content) {
      if (part.type === "text" && part.text) {
        output += part.text;
      }
      // Hier könnten Tool Use Parts verarbeitet werden
    }

    // Logging
    log("info", "Anthropic response received", {
      model,
      input_tokens: response.usage?.input_tokens ?? "unknown",
      output_tokens: response.usage?.output_tokens ?? "unknown",
      duration_ms: duration,
      stop_reason: response.stop_reason,
    });

    // Tool-Execution falls aktiviert
    let toolResults: ToolResult[] = [];
    if (config.enableToolCalls && output) {
      toolResults = await detectAndRunTools(output, config);
    }

    // Kontext aktualisieren
    context.update(messages, duration);

    // Tool-Results anhängen falls vorhanden
    if (toolResults.length > 0) {
      output += formatToolResults(toolResults);
    }

    // ModelResponse erstellen
    const modelResponse: ModelResponse = {
      model: response.model,
      provider: "anthropic" as Provider,
      text: output.trim() || "(keine Antwort von Anthropic erhalten)",
      tokens_in: response.usage?.input_tokens,
      tokens_out: response.usage?.output_tokens,
      duration_ms: duration,
      tool_calls: toolCalls,
      success: true,
      meta: {
        stop_reason: response.stop_reason,
        tool_results: toolResults,
        response_time: duration,
      },
    };

    return modelResponse;
  } catch (error: any) {
    const duration = Date.now() - startTime;

    log("error", "Anthropic Provider Fehler", {
      model,
      error: error.message,
      duration_ms: duration,
      stack: config.debugMode ? error.stack : undefined,
    });

    // Fallback Response bei aktiviertem Fallback
    if (config.fallbackOnError) {
      return createFallbackResponse(model, error, duration);
    }

    throw new Error(`Anthropic Provider Fehler: ${error.message}`);
  }
}

/* ========================================================================== */
/* 🛡️ Fallback & Error Handling                                            */
/* ========================================================================== */

function createFallbackResponse(
  model: string,
  error: any,
  duration: number,
): ModelResponse {
  const fallbackText = `Entschuldigung, es gab einen Verbindungsfehler zur KI-API (${error.message}). 
Bitte versuchen Sie es später erneut oder verwenden Sie einen anderen Provider.`;

  return {
    model,
    provider: "anthropic" as Provider,
    text: fallbackText,
    duration_ms: duration,
    success: false,
    errors: [error.message],
    meta: {
      source: "fallback",
      error_type: error.name || "API_ERROR",
    },
  };
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
/* 🔧 Hilfsfunktionen - VERBESSERT                                          */
/* ========================================================================== */

export function isAnthropicModel(modelId: string): boolean {
  if (!modelId || typeof modelId !== "string") return false;

  return (
    modelId.startsWith("claude-") ||
    modelId.includes("anthropic") ||
    modelId.includes("claude")
  );
}

export function getSupportedAnthropicModels(): string[] {
  return [
    "claude-3-5-sonnet-20241022",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
    "claude-2.1",
    "claude-2.0",
    "claude-instant-1.2",
  ];
}

export function validateAnthropicConfig(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!process.env.ANTHROPIC_API_KEY) {
    errors.push("ANTHROPIC_API_KEY Umgebungsvariable fehlt");
  }

  if (
    process.env.ANTHROPIC_API_KEY &&
    process.env.ANTHROPIC_API_KEY.length < 10
  ) {
    errors.push("ANTHROPIC_API_KEY scheint ungültig zu sein");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/* ========================================================================== */
/* 🧪 Provider Interface für Framework-Integration                          */
/* ========================================================================== */

export const anthropicProvider = {
  name: "anthropic" as Provider,
  call: callAnthropic,
  isSupportedModel: isAnthropicModel,
  getSupportedModels: getSupportedAnthropicModels,
  validateConfig: validateAnthropicConfig,

  // Erweiterte Methoden
  async healthCheck(): Promise<{ healthy: boolean; details?: any }> {
    try {
      const configCheck = validateAnthropicConfig();
      if (!configCheck.valid) {
        return { healthy: false, details: configCheck };
      }

      // Test-Call mit minimalem Prompt
      const testMessages: ChatMessage[] = [{ role: "user", content: "Hello" }];

      await callAnthropic("claude-3-haiku-20240307", testMessages);
      return { healthy: true };
    } catch (error: any) {
      return {
        healthy: false,
        details: { error: error.message },
      };
    }
  },
};

export default anthropicProvider;
