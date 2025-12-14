/**
 * ollamaProvider.ts
 * ---------------------------------------------------------
 * Lokaler KI-Provider für Ollama-Modelle.
 * Unterstützt Chat, Tool-Aufrufe, JSON-Antworten und Model-Management.
 *
 * Läuft standardmäßig unter: http://localhost:11434
 *
 * Erkennt automatisch installierte Modelle,
 * kann Tools verwenden, Systemstatus liefern und sich dynamisch anpassen.
 */

import type {
  ChatMessage,
  AIResponse,
  AIModuleConfig,
} from "../types/types.js";
import { log } from "../utils/logger.js";
import { toolRegistry } from "../tools/registry.js";
import os from "node:os";
import fetch from "node-fetch";

/* ========================================================================== */
/* ⚙️ Konfiguration                                                          */
/* ========================================================================== */

export let ollamaConfig: AIModuleConfig = {
  name: "ollamaProvider",
  provider: "ollama",
  model: process.env.OLLAMA_MODEL ?? "mistral:latest",
  temperature: Number(process.env.OLLAMA_TEMPERATURE) || 0.5,
  max_tokens: Number(process.env.OLLAMA_MAX_TOKENS) || 1024,
  active: true,
  // ✅ gültige Typen laut types.ts
  capabilities: ["chat", "embedding", "vision", "tools", "workflow", "json"],
  description: "Verwendet lokal installierte Ollama-Modelle (REST API).",
  timeout_ms: 60000,
};

/* ========================================================================== */
/* 🔍 Modellscan                                                             */
/* ========================================================================== */

/**
 * Ruft alle lokal verfügbaren Ollama-Modelle ab.
 */
export async function listOllamaModels(): Promise<
  { name: string; modified: string }[]
> {
  try {
    const res = await fetch("http://localhost:11434/api/tags");

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const data: unknown = await res.json();

    // Sicherstellen, dass data das erwartete Format hat
    if (
      typeof data !== "object" ||
      data === null ||
      !("models" in data) ||
      !Array.isArray((data as any).models)
    ) {
      throw new Error("Ungültiges Ollama-API Format: 'models' fehlt");
    }

    const models = (data as { models: any[] }).models;

    return models.map((m) => ({
      name: String(m.name ?? ""),
      modified: String(m.modified_at ?? ""),
    }));
  } catch (err: any) {
    log("error", "Fehler beim Laden der Ollama-Modelle", {
      error: err.message,
    });
    return [];
  }
}

/* ========================================================================== */
/* 💬 Ollama-Chat                                                            */
/* ========================================================================== */

/**
 * Führt eine Chat-Anfrage an ein Ollama-Modell aus.
 * Unterstützt Systemprompt, Tools und JSON-Rückgaben.
 */
export async function callOllama(
  model: string,
  messages: ChatMessage[],
  options: Record<string, any> = {},
): Promise<AIResponse> {
  const apiUrl =
    process.env.OLLAMA_API_URL ?? "http://localhost:11434/api/chat";
  const usedModel = model || ollamaConfig.model;
  const sysPrompt =
    options.systemPrompt ?? "Du bist eine lokale Ollama-KI-Instanz.";

  const msgs = [
    { role: "system", content: sysPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const body = {
    model: usedModel,
    stream: false,
    options: {
      temperature: options.temperature ?? ollamaConfig.temperature,
      num_predict: options.max_tokens ?? ollamaConfig.max_tokens,
    },
    messages: msgs,
  };

  try {
    const start = Date.now();
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // @ts-expect-error — node-fetch akzeptiert Timeout
      timeout: ollamaConfig.timeout_ms,
    });

    if (!res.ok) {
      const errTxt = await res.text().catch(() => res.statusText);
      throw new Error(`Ollama antwortete mit HTTP ${res.status}: ${errTxt}`);
    }

    const data: any = await res.json();
    const duration = Date.now() - start;

    const replyText =
      data?.message?.content?.trim?.() ??
      data?.response ??
      data?.output ??
      "(keine Antwort von Ollama erhalten)";

    // Prüfe auf Toolaufrufe im Text
    const toolCalls = detectToolCalls(replyText);
    const toolResults =
      toolCalls.length > 0 ? await handleToolCalls(toolCalls) : [];

    log("info", "Ollama-Antwort empfangen", {
      model: usedModel,
      tokens: data?.eval_count,
      duration_ms: duration,
      tools_used: toolCalls.length,
    });

    return {
      text: [replyText, ...toolResults].join("\n\n"),
      action: "ollama_chat",
      tool_calls: toolCalls,
      meta: {
        model: usedModel,
        tokens_used: data?.eval_count ?? 0,
        time_ms: duration,
        source: "ollamaProvider",
        confidence: 0.95,
      },
    };
  } catch (err: any) {
    log("error", "Ollama-Provider Fehler", { error: err.message });

    return {
      text: `❌ Ollama-Fehler: ${err.message}`,
      errors: [err.message],
      meta: {
        model: model || ollamaConfig.model,
        source: "ollamaProvider",
        confidence: 0,
      },
    };
  }
}

/* ========================================================================== */
/* 🧠 Tool-Unterstützung                                                     */
/* ========================================================================== */

/**
 * Erkennt einfache Tool-Aufrufe im Text, z. B. [TOOL: system_info {"verbose":true}]
 */
function detectToolCalls(text: string): { name: string; parameters: any }[] {
  const matches = [...text.matchAll(/\[TOOL:\s*([a-zA-Z0-9_]+)(.*?)\]/g)];
  return matches.map((m) => ({
    name: m[1],
    parameters: safeParseJSON(m[2]),
  }));
}

/**
 * Führt erkannte Tool-Calls aus und liefert Textantworten zurück.
 */
async function handleToolCalls(
  toolCalls: { name: string; parameters: any }[],
): Promise<string[]> {
  const results: string[] = [];
  for (const call of toolCalls) {
    try {
      const res = await toolRegistry.call(call.name, call.parameters);
      results.push(
        `✅ Tool "${call.name}" erfolgreich ausgeführt.\nAntwort: ${JSON.stringify(res)}`,
      );
    } catch (err: any) {
      results.push(`❌ Tool "${call.name}" Fehler: ${err.message}`);
    }
  }
  return results;
}

/**
 * Sicheres JSON-Parsing für Tool-Parameter.
 */
function safeParseJSON(str: string): any {
  try {
    return str && str.trim().length > 0 ? JSON.parse(str) : {};
  } catch {
    return {};
  }
}

/* ========================================================================== */
/* 🔧 Konfiguration & Status                                                 */
/* ========================================================================== */

/**
 * Aktualisiert die Ollama-Konfiguration dynamisch.
 */
export function updateOllamaConfig(
  update: Partial<AIModuleConfig>,
): AIModuleConfig {
  ollamaConfig = { ...ollamaConfig, ...update };
  log("info", "Ollama-Konfiguration aktualisiert", update);
  return ollamaConfig;
}

/**
 * Prüft, ob Ollama läuft und gibt Statusdaten zurück.
 */
export async function getOllamaStatus() {
  const models = await listOllamaModels();
  const apiUrl = process.env.OLLAMA_API_URL ?? "http://localhost:11434";

  return {
    provider: "ollama",
    apiUrl,
    model_count: models.length,
    models,
    config: ollamaConfig,
    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      totalmem_GB: +(os.totalmem() / 1024 ** 3).toFixed(1),
      freemem_GB: +(os.freemem() / 1024 ** 3).toFixed(1),
      cpus: os.cpus().length,
      uptime_h: +(os.uptime() / 3600).toFixed(1),
    },
  };
}

/* ========================================================================== */
/* ✅ Export                                                                */
/* ========================================================================== */

export default {
  callOllama,
  listOllamaModels,
  updateOllamaConfig,
  getOllamaStatus,
};
