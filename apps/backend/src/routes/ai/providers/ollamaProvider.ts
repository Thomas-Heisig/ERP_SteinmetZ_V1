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

import type { ChatMessage, AIModuleConfig } from "../types/types.js";
import type { AIResponse } from "../types/types.js";
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
      !Array.isArray((data as Record<string, unknown>).models)
    ) {
      throw new Error("Ungültiges Ollama-API Format: 'models' fehlt");
    }

    const models = (data as { models: unknown[] }).models;

    return models.map((m) => {
      const model =
        typeof m === "object" && m !== null
          ? (m as Record<string, unknown>)
          : {};
      return {
        name: String(model.name ?? ""),
        modified: String(model.modified_at ?? ""),
      };
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    log("error", "Fehler beim Laden der Ollama-Modelle", {
      error: errorMsg,
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
  options: Record<string, unknown> = {},
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

    const data: unknown = await res.json();
    const duration = Date.now() - start;

    const dataObj =
      typeof data === "object" && data !== null
        ? (data as Record<string, unknown>)
        : {};
    const message =
      typeof dataObj.message === "object" && dataObj.message !== null
        ? (dataObj.message as Record<string, unknown>)
        : {};
    const messageContent = message.content;
    const replyText =
      (typeof messageContent === "string" ? messageContent.trim() : "") ||
      (typeof dataObj.response === "string" ? dataObj.response : "") ||
      (typeof dataObj.output === "string" ? dataObj.output : "") ||
      "(keine Antwort von Ollama erhalten)";

    // Prüfe auf Toolaufrufe im Text
    const toolCalls = detectToolCalls(replyText);
    const toolResults =
      toolCalls.length > 0 ? await handleToolCalls(toolCalls) : [];

    log("info", "Ollama-Antwort empfangen", {
      model: usedModel,
      tokens: typeof dataObj.eval_count === "number" ? dataObj.eval_count : 0,
      duration_ms: duration,
      tools_used: toolCalls.length,
    });

    return {
      text: [replyText, ...toolResults].join("\n\n"),
      action: "ollama_chat",
      tool_calls: toolCalls.map((tc) => ({
        name: tc.name,
        parameters:
          typeof tc.parameters === "object" && tc.parameters !== null
            ? (tc.parameters as Record<string, unknown>)
            : {},
      })),
      meta: {
        model: usedModel,
        tokens_used:
          typeof dataObj.eval_count === "number" ? dataObj.eval_count : 0,
        time_ms: duration,
        source: "ollamaProvider",
        confidence: 0.95,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    log("error", "Ollama-Provider Fehler", { error: errorMsg });

    return {
      text: `❌ Ollama-Fehler: ${errorMsg}`,
      errors: [errorMsg],
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
function detectToolCalls(
  text: string,
): { name: string; parameters: unknown }[] {
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
  toolCalls: { name: string; parameters: unknown }[],
): Promise<string[]> {
  const results: string[] = [];
  for (const call of toolCalls) {
    try {
      const parameters =
        typeof call.parameters === "object" && call.parameters !== null
          ? (call.parameters as Record<string, unknown>)
          : {};
      const res = await toolRegistry.call(call.name, parameters);
      results.push(
        `✅ Tool "${call.name}" erfolgreich ausgeführt.\nAntwort: ${JSON.stringify(res)}`,
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push(`❌ Tool "${call.name}" Fehler: ${errorMsg}`);
    }
  }
  return results;
}

/**
 * Sicheres JSON-Parsing für Tool-Parameter.
 */
function safeParseJSON(str: string): unknown {
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
