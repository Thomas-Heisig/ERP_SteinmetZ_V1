/**
 * customProvider.ts
 * ---------------------------------------------------------
 * Universeller Provider für REST-, KI- oder eigene Backend-APIs.
 * Unterstützt generische JSON-Schnittstellen mit optionalem API-Key.
 * Vollständig kompatibel mit dem ERP_SteinmetZ KI-System.
 */

import fetch from "node-fetch";
import type { 
  ChatMessage, 
  AIResponse, 
  AIModuleConfig,
  AIOptions,
  ModelResponse,
  Provider,
  ToolResult
} from "../types/types.js";
import { log } from "../utils/logger.js";
import { toolRegistry } from '../tools/registry.js';
import { ConversationContext } from '../context/conversationContext.js';

/* ========================================================================== */
/* 🏗️ Typdefinitionen und Konfiguration                                    */
/* ========================================================================== */

interface CustomProviderConfig {
  timeoutMs?: number;
  retryAttempts?: number;
  enableToolCalls?: boolean;
  fallbackOnError?: boolean;
  requestFormat?: 'openai' | 'anthropic' | 'generic' | 'custom';
  responseMapping?: {
    text?: string[];
    error?: string[];
    tokens?: string[];
  };
}

interface CustomRequestPayload {
  model: string;
  messages: any[];
  temperature?: number;
  max_tokens?: number;
  system?: string;
  tools?: any[];
  [key: string]: any;
}

/* ========================================================================== */
/* 🧩 Konfiguration (aus .env oder Defaults) - VERBESSERT                 */
/* ========================================================================== */

export const customConfig: AIModuleConfig = {
  name: "customProvider",
  provider: "custom" as Provider,
  model: process.env.CUSTOM_AI_MODEL ?? "generic",
  endpoint: process.env.CUSTOM_AI_URL ?? "http://localhost:5000/api/chat",
  api_key_env: "CUSTOM_AI_KEY",
  temperature: Number(process.env.CUSTOM_AI_TEMPERATURE) || 0.5,
  max_tokens: Number(process.env.CUSTOM_AI_MAX_TOKENS) || 1000,
  description: "Bindet beliebige REST-basierte KI- oder API-Endpunkte ein",
  capabilities: ["chat", "json", "tool_calls", "completion"],
  active: true,
  timeout_ms: 60000,
  category: "custom",
  streaming: false,
  cacheable: false
};

/* ========================================================================== */
/* ⚙️ Helper: Anfrageaufbau - VERBESSERT                                  */
/* ========================================================================== */

function buildHeaders(): Record<string, string> {
  const apiKey = process.env[customConfig.api_key_env ?? ""] ?? "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "ERP_SteinmetZ/1.0 CustomProvider"
  };

  if (apiKey) {
    // Flexible Authorization Header Unterstützung
    const authType = process.env.CUSTOM_AI_AUTH_TYPE || "bearer";
    switch (authType.toLowerCase()) {
      case "bearer":
        headers["Authorization"] = `Bearer ${apiKey}`;
        break;
      case "api_key":
        headers["X-API-Key"] = apiKey;
        break;
      case "token":
        headers["X-Token"] = apiKey;
        break;
      default:
        headers["Authorization"] = apiKey;
    }
  }

  // Zusätzliche benutzerdefinierte Header
  const customHeaders = process.env.CUSTOM_AI_HEADERS;
  if (customHeaders) {
    try {
      const parsedHeaders = JSON.parse(customHeaders);
      Object.assign(headers, parsedHeaders);
    } catch (error) {
      log('warn', 'Fehler beim Parsen benutzerdefinierter Header', { error });
    }
  }

  return headers;
}

function buildRequestPayload(
  model: string, 
  messages: ChatMessage[], 
  options: AIOptions = {},
  config: CustomProviderConfig = {}
): CustomRequestPayload {
  const usedModel = model || customConfig.model;
  const requestFormat = config.requestFormat || 'generic';

  // Basis-Payload
  const payload: CustomRequestPayload = {
    model: usedModel,
    messages: [],
    temperature: options.temperature ?? customConfig.temperature,
    max_tokens: options.maxTokens ?? customConfig.max_tokens,
  };

  // Messages nach Format mappen
  const { systemPrompt, chatMessages } = prepareMessages(messages, requestFormat);
  
  if (systemPrompt && requestFormat !== 'anthropic') {
    payload.messages.unshift({ role: 'system', content: systemPrompt });
  }

  payload.messages.push(...chatMessages);

  // Format-spezifische Anpassungen
  switch (requestFormat) {
    case 'openai':
      if (systemPrompt) {
        payload.messages.unshift({ role: 'system', content: systemPrompt });
      }
      break;
    case 'anthropic':
      if (systemPrompt) {
        payload.system = systemPrompt;
      }
      break;
    case 'generic':
      // Generisches Format - keine speziellen Anpassungen
      break;
  }

  // Tools hinzufügen falls aktiviert
  if (config.enableToolCalls) {
    const tools = prepareToolsForCustomAPI();
    if (tools.length > 0) {
      payload.tools = tools;
    }
  }

  // Benutzerdefinierte Parameter hinzufügen
  const customParams = process.env.CUSTOM_AI_PARAMS;
  if (customParams) {
    try {
      const parsedParams = JSON.parse(customParams);
      Object.assign(payload, parsedParams);
    } catch (error) {
      log('warn', 'Fehler beim Parsen benutzerdefinierter Parameter', { error });
    }
  }

  return payload;
}

function prepareMessages(messages: ChatMessage[], format: string): { 
  systemPrompt?: string; 
  chatMessages: any[] 
} {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { systemPrompt: undefined, chatMessages: [] };
  }

  // System-Prompt extrahieren
  const systemMessages = messages
    .filter(m => m.role === 'system')
    .map(m => String(m.content || ''))
    .filter(content => content.trim().length > 0);

  const systemPrompt = systemMessages.length > 0 
    ? systemMessages.join('\n\n') 
    : undefined;

  // Chat-Nachrichten mappen
  const chatMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || ''),
      ...(m.metadata && { metadata: m.metadata })
    }))
    .filter(m => m.content.trim().length > 0);

  return { systemPrompt, chatMessages };
}

function prepareToolsForCustomAPI(): any[] {
  const tools = toolRegistry.getToolDefinitions();
  return tools.map(tool => ({
    name: tool.name,
    description: tool.description || `Tool: ${tool.name}`,
    parameters: tool.parameters || {},
    required: tool.parameters ? Object.keys(tool.parameters).filter(key => 
      tool.parameters?.[key]?.required
    ) : []
  })).filter(tool => tool.name && tool.description);
}

/* ========================================================================== */
/* 💬 Hauptfunktion: API-Aufruf - VERBESSERT                              */
/* ========================================================================== */

export async function callCustomAPI(
  model: string, 
  messages: ChatMessage[], 
  options: AIOptions = {},
  context: ConversationContext = new ConversationContext()
): Promise<ModelResponse> {
  const startTime = Date.now();
  const config: CustomProviderConfig = {
    timeoutMs: options.timeoutMs || customConfig.timeout_ms,
    retryAttempts: 2,
    enableToolCalls: true,
    fallbackOnError: true,
    requestFormat: (process.env.CUSTOM_AI_FORMAT as any) || 'generic',
    responseMapping: {
      text: ['text', 'response', 'message', 'content', 'answer'],
      error: ['error', 'error_message', 'err'],
      tokens: ['tokens', 'usage.total_tokens', 'usage.tokens']
    },
    ...options.context?.customConfig
  };

  const apiUrl = customConfig.endpoint;
  const headers = buildHeaders();
  const usedModel = model || customConfig.model;

  try {
    // Request-Payload erstellen
    const payload = buildRequestPayload(usedModel, messages, options, config);

    log('debug', 'Custom Provider API Request', {
      model: usedModel,
      endpoint: apiUrl,
      messageCount: messages.length,
      requestFormat: config.requestFormat,
      payloadKeys: Object.keys(payload)
    });

    // API-Aufruf mit Retry-Mechanismus
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= (config.retryAttempts || 0); attempt++) {
      try {
        const apiUrl = customConfig.endpoint;

      if (!apiUrl || typeof apiUrl !== "string" || apiUrl.trim() === "") {
        throw new Error("CustomProvider: Kein gültiger API-Endpoint definiert (customConfig.endpoint).");
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });


        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: any = await response.json();
        const duration = Date.now() - startTime;

        // Response verarbeiten
        const processedResponse = processCustomResponse(data, usedModel, duration, config);
        
        // Tool-Calls ausführen falls vorhanden
        if (config.enableToolCalls && processedResponse.tool_calls?.length) {
          const toolResults = await executeToolCalls(processedResponse.tool_calls);
          processedResponse.text += formatToolResults(toolResults);
          processedResponse.meta = {
            ...processedResponse.meta,
            tool_results: toolResults
          };
        }

        // Kontext aktualisieren
        context.update(messages, duration);

        log("info", "CustomProvider Antwort empfangen", {
          model: usedModel,
          duration_ms: duration,
          endpoint: apiUrl,
          attempt: attempt + 1
        });

        return processedResponse;

      } catch (error: any) {
        lastError = error;
        if (attempt < (config.retryAttempts || 0)) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
          log('warn', `CustomProvider Versuch ${attempt + 1} fehlgeschlagen, retry in ${waitTime}ms`, {
            error: error.message
          });
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
    }

    throw lastError || new Error('Unbekannter Fehler bei Custom Provider');

  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    log("error", "CustomProvider Fehler", {
      model: usedModel,
      error: error.message,
      endpoint: apiUrl,
      duration_ms: duration
    });

    // Fallback Response bei aktiviertem Fallback
    if (config.fallbackOnError) {
      return createFallbackResponse(usedModel, error, duration);
    }

    throw new Error(`Custom Provider Fehler: ${error.message}`);
  }
}

/* ========================================================================== */
/* 🛠️ Response Processing & Tool Execution                               */
/* ========================================================================== */

function processCustomResponse(
  data: any, 
  model: string, 
  duration: number,
  config: CustomProviderConfig
): ModelResponse {
  // Text aus verschiedenen Feldern extrahieren
  const text = extractField(data, config.responseMapping?.text || ['text', 'response', 'message']);
  const error = extractField(data, config.responseMapping?.error || ['error', 'error_message']);
  const tokens = extractField(data, config.responseMapping?.tokens || ['tokens', 'usage.total_tokens']);

  if (error) {
    throw new Error(`API Error: ${error}`);
  }

  // Tool-Calls erkennen
  const toolCalls = extractToolCalls(data);

  return {
    model,
    provider: 'custom' as Provider,
    text: String(text || "(Keine Antwort erhalten)").trim(),
    tokens_in: typeof tokens === 'number' ? tokens : undefined,
    tokens_out: undefined,
    duration_ms: duration,
    tool_calls: toolCalls,
    success: true,
    meta: {
      source: 'custom_api',
      response_data: data,
      tool_calls_detected: toolCalls.length > 0
    }
  };
}

function extractField(data: any, paths: string[]): any {
  for (const path of paths) {
    if (path.includes('.')) {
      // Tiefe Pfade wie "usage.total_tokens"
      const parts = path.split('.');
      let value = data;
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          value = undefined;
          break;
        }
      }
      if (value !== undefined) return value;
    } else {
      // Flache Pfade
      if (data && data[path] !== undefined) {
        return data[path];
      }
    }
  }
  return undefined;
}

function extractToolCalls(data: any): Array<{ name: string; parameters: Record<string, any> }> {
  const toolCalls: Array<{ name: string; parameters: Record<string, any> }> = [];

  // Verschiedene Tool-Call Formate unterstützen
  if (Array.isArray(data.tool_calls)) {
    toolCalls.push(...data.tool_calls);
  }
  if (Array.isArray(data.tools)) {
    toolCalls.push(...data.tools);
  }
  if (data.function_calls && Array.isArray(data.function_calls)) {
    toolCalls.push(...data.function_calls.map((fc: any) => ({
      name: fc.function?.name || fc.name,
      parameters: fc.function?.arguments || fc.parameters || {}
    })));
  }

  return toolCalls;
}

async function executeToolCalls(toolCalls: any[]): Promise<ToolResult[]> {
  const results: ToolResult[] = [];
  
  for (const toolCall of toolCalls) {
    const startTime = Date.now();
    
    try {
      const toolName = toolCall.name;
      const parameters = toolCall.parameters || {};

      if (!toolName) {
        throw new Error('Tool name missing in tool call');
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
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      results.push({
        success: false,
        error: error.message,
        runtime_ms: Date.now() - startTime,
        source_tool: toolCall.name || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return results;
}

function formatToolResults(results: ToolResult[]): string {
  if (results.length === 0) return '';

  const summary = results.map(r => 
    r.success 
      ? `✅ [${r.source_tool}] Ausführung erfolgreich (${r.runtime_ms}ms)`
      : `❌ [${r.source_tool}] Fehler: ${r.error}`
  ).join('\n');

  return `\n\n---\n**Tool-Ausführungen:**\n${summary}`;
}

/* ========================================================================== */
/* 🛡️ Fallback & Error Handling                                           */
/* ========================================================================== */

function createFallbackResponse(model: string, error: any, duration: number): ModelResponse {
  const fallbackText = `Entschuldigung, es gab einen Verbindungsfehler zum Custom API Endpoint (${error.message}). 
Bitte versuchen Sie es später erneut oder verwenden Sie einen anderen Provider.`;

  return {
    model,
    provider: 'custom' as Provider,
    text: fallbackText,
    duration_ms: duration,
    success: false,
    errors: [error.message],
    meta: {
      source: 'fallback',
      error_type: error.name || 'API_ERROR'
    }
  };
}

/* ========================================================================== */
/* 🔍 Helferfunktionen - VERBESSERT                                        */
/* ========================================================================== */

export function isCustomModel(modelId: string): boolean {
  if (!modelId || typeof modelId !== 'string') return false;
  
  const lowerModelId = modelId.toLowerCase();
  return (
    lowerModelId.includes("custom") ||
    lowerModelId.startsWith("generic") ||
    lowerModelId.startsWith("external") ||
    lowerModelId.includes("api") ||
    lowerModelId.includes("rest")
  );
}

export async function testCustomAPI(): Promise<{ 
  success: boolean; 
  details?: any 
}> {
  try {
    const endpoint = customConfig.endpoint;

    if (!endpoint) {
      throw new Error("CustomProvider: Kein gültiger Endpoint (customConfig.endpoint).");
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers: buildHeaders(),
      // timeout: 10000  // node-fetch v3 unterstützt kein timeout
    });

    
    return {
      success: response.ok,
      details: {
        status: response.status,
        statusText: response.statusText,
        endpoint: customConfig.endpoint
      }
    };
  } catch (error: any) {
    return {
      success: false,
      details: {
        error: error.message,
        endpoint: customConfig.endpoint
      }
    };
  }
}

export function validateCustomConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!customConfig.endpoint) {
    errors.push('CUSTOM_AI_URL Umgebungsvariable fehlt');
  }

  if (customConfig.endpoint) {
    try {
      new URL(customConfig.endpoint);
    } catch {
      errors.push('CUSTOM_AI_URL ist keine gültige URL');
    }
  }

  const apiKeyEnv = customConfig.api_key_env;
  if (apiKeyEnv && !process.env[apiKeyEnv]) {
    errors.push(`${apiKeyEnv} Umgebungsvariable fehlt`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/* ========================================================================== */
/* 🧾 Provider Interface für Framework-Integration                         */
/* ========================================================================== */

export const customProvider = {
  name: 'custom' as Provider,
  call: callCustomAPI,
  isSupportedModel: isCustomModel,
  testConnection: testCustomAPI,
  validateConfig: validateCustomConfig,
  config: customConfig,
  
  // Erweiterte Methoden
  async healthCheck(): Promise<{ healthy: boolean; details?: any }> {
    try {
      const configCheck = validateCustomConfig();
      if (!configCheck.valid) {
        return { healthy: false, details: configCheck };
      }

      const connectionTest = await testCustomAPI();
      return { 
        healthy: connectionTest.success, 
        details: connectionTest.details 
      };
    } catch (error: any) {
      return { 
        healthy: false, 
        details: { error: error.message } 
      };
    }
  },

  // Konfiguration zur Laufzeit aktualisieren
  updateConfig(newConfig: Partial<AIModuleConfig>): void {
    Object.assign(customConfig, newConfig);
    log('info', 'Custom Provider Konfiguration aktualisiert', { changes: Object.keys(newConfig) });
  }
};

export default customProvider;