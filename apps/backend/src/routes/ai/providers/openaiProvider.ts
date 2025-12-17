/**
 * openaiProvider.ts
 * ---------------------------------------------------------
 * OpenAI / GPT-basierter Provider für Chat-, Analyse- und Tool-Aufgaben.
 * Unterstützt GPT-4, GPT-3.5, GPT-4o usw.
 * Voll kompatibel mit der modularen Provider-Struktur des Systems.
 */

import OpenAI from "openai";
import type {
  ChatMessage,
  AIResponse,
  AIModuleConfig,
} from "../types/types.js";
import { log } from "../utils/logger.js";
import { toolRegistry } from "../tools/registry.js";

/* ========================================================================== */
/* ⚙️ Standardkonfiguration                                                  */
/* ========================================================================== */

export let openaiConfig: AIModuleConfig = {
  name: "openaiProvider",
  provider: "openai",
  model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  temperature: Number(process.env.OPENAI_TEMPERATURE) || 0.3,
  max_tokens: Number(process.env.OPENAI_MAX_TOKENS) || 1500,
  active: true,
  // ✅ gültige Typen aus types.ts
  capabilities: ["chat", "tools", "reasoning", "workflow", "json"],
  timeout_ms: 60000,
  description: "Kommuniziert mit der OpenAI API (GPT-3.5, GPT-4, GPT-4o usw.)",
};

/* ========================================================================== */
/* 🔑 API-Client                                                             */
/* ========================================================================== */

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey)
    throw new Error("❌ OPENAI_API_KEY fehlt in den Umgebungsvariablen.");
  return new OpenAI({ apiKey });
}

/* ========================================================================== */
/* 💬 Chat-Funktion                                                          */
/* ========================================================================== */

/**
 * Führt ein Chat-Gespräch mit einem OpenAI-Modell.
 * Unterstützt Tools, Systemprompt und dynamische Parameter.
 */
export async function callOpenAI(
  model: string,
  messages: ChatMessage[],
  options: Record<string, unknown> = {},
): Promise<AIResponse> {
  const client = getClient();
  const usedModel = model || openaiConfig.model;

  const sysPrompt =
    options.systemPrompt ?? "Du bist ein sachlicher, formaler Assistent.";
  const formattedMessages = [
    { role: "system", content: sysPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const request = {
    model: usedModel,
    messages: formattedMessages,
    temperature: (typeof options.temperature === "number" ? options.temperature : openaiConfig.temperature) as number,
    max_tokens: (typeof options.max_tokens === "number" ? options.max_tokens : openaiConfig.max_tokens) as number,
    stream: false as const,
  };

  try {
    const start = Date.now();
    const completionResponse = await client.chat.completions.create(request as Parameters<typeof client.chat.completions.create>[0]);
    const duration = Date.now() - start;

    // Type guard: we know it's not a stream because stream: false
    const completion = completionResponse as OpenAI.Chat.Completions.ChatCompletion;
    
    const firstChoice = completion?.choices?.[0];
    const messageContent = firstChoice?.message?.content;
    const reply = typeof messageContent === "string" ? messageContent.trim() : "(keine Antwort)";
    const usage = completion?.usage ?? { total_tokens: 0 };

    // Tool-Aufrufe erkennen und ausführen
    const toolCalls = detectToolCalls(reply);
    const toolResults =
      toolCalls.length > 0 ? await handleToolCalls(toolCalls) : [];

    log("info", "OpenAI-Antwort empfangen", {
      model: usedModel,
      tokens: usage.total_tokens,
      duration_ms: duration,
      tool_calls: toolCalls.length,
    });

    return {
      text: [reply, ...toolResults].filter(Boolean).join("\n\n"),
      action: "openai_chat",
      tool_calls: toolCalls.map(tc => ({
        name: tc.name,
        parameters: typeof tc.parameters === "object" && tc.parameters !== null 
          ? tc.parameters as Record<string, unknown>
          : {},
      })),
      meta: {
        model: usedModel,
        tokens_used: usage.total_tokens ?? 0,
        time_ms: duration,
        source: "openaiProvider",
        confidence: 0.97,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    log("error", "OpenAI-Fehler", { model: usedModel, error: errorMsg });

    return {
      text: `❌ OpenAI-Fehler: ${errorMsg}`,
      errors: [errorMsg],
      meta: {
        model: usedModel,
        source: "openaiProvider",
        confidence: 0,
      },
    };
  }
}

/* ========================================================================== */
/* 🧠 Tool-Unterstützung                                                     */
/* ========================================================================== */

/**
 * Erkennt Tool-Aufrufe im Text, z. B. [TOOL: weather {"city":"Berlin"}]
 */
function detectToolCalls(text: string): { name: string; parameters: unknown }[] {
  const matches = [...text.matchAll(/\[TOOL:\s*([a-zA-Z0-9_]+)(.*?)\]/g)];
  return matches.map((m) => ({
    name: m[1],
    parameters: safeJsonParse(m[2]),
  }));
}

/** Sichere JSON-Deserialisierung */
function safeJsonParse(s: string): unknown {
  try {
    return s && s.trim().length > 0 ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

/**
 * Führt erkannte Tool-Calls über die zentrale Registry aus.
 */
async function handleToolCalls(
  calls: { name: string; parameters: unknown }[],
): Promise<string[]> {
  const results: string[] = [];
  for (const call of calls) {
    try {
      const parameters = typeof call.parameters === "object" && call.parameters !== null
        ? call.parameters as Record<string, unknown>
        : {};
      const res = await toolRegistry.call(call.name, parameters);
      results.push(
        `✅ Tool "${call.name}" erfolgreich ausgeführt.\nErgebnis: ${JSON.stringify(res)}`,
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push(`❌ Tool "${call.name}" Fehler: ${errorMsg}`);
    }
  }
  return results;
}

/* ========================================================================== */
/* 🔧 Konfiguration & Status                                                 */
/* ========================================================================== */

/** Aktualisiert Konfiguration dynamisch */
export function updateOpenAIConfig(
  update: Partial<AIModuleConfig>,
): AIModuleConfig {
  openaiConfig = { ...openaiConfig, ...update };
  log("info", "OpenAI-Konfiguration aktualisiert", update);
  return openaiConfig;
}

/** Gibt aktuellen Status und Konfigurationsinformationen zurück */
export function getOpenAIStatus() {
  return {
    provider: "openai",
    api_key_available: !!process.env.OPENAI_API_KEY,
    active_config: openaiConfig,
    default_model: openaiConfig.model,
    capabilities: openaiConfig.capabilities,
  };
}

/* ========================================================================== */
/* ✅ Export                                                                */
/* ========================================================================== */

export default {
  callOpenAI,
  updateOpenAIConfig,
  getOpenAIStatus,
};
