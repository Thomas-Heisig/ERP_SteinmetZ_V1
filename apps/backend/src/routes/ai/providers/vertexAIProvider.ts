/**
 * vertexAIProvider.ts
 * ---------------------------------------------------------
 * Anbindung an Google Vertex AI (Gemini-Modelle).
 * Unterstützt Chat, Vision, Tool-Aufrufe und JSON-Ausgaben.
 * Voll kompatibel mit ERP_SteinmetZ KI-System.
 */

import type { ChatMessage, AIResponse, AIModuleConfig } from "../types/types.js";
import { log } from "../utils/logger.js";
import fetch from "node-fetch";

/* ========================================================================== */
/* ⚙️ Konfiguration                                                          */
/* ========================================================================== */

export let vertexConfig: AIModuleConfig = {
  name: "vertexAIProvider",
  provider: "vertex",
  model: process.env.VERTEX_MODEL ?? "gemini-1.5-pro",
  endpoint:
    process.env.VERTEX_API_URL ??
    "https://generativelanguage.googleapis.com/v1beta/models",
  api_key_env: "VERTEX_API_KEY",
  temperature: Number(process.env.VERTEX_TEMPERATURE) || 0.4,
  max_tokens: Number(process.env.VERTEX_MAX_TOKENS) || 1500,
  active: true,
  // ✅ gültige Capability-Werte laut types.ts
  capabilities: ["chat", "vision", "tools", "json", "reasoning"],
  description: "Anbindung an Google Vertex AI (Gemini-Modelle)",
  timeout_ms: 60000,
};

/* ========================================================================== */
/* 💬 Hauptfunktion: Chat / Inferenz (sicher & typgeprüft)                   */
/* ========================================================================== */

/**
 * Führt einen Chat mit einem Gemini-Modell über Vertex AI aus.
 * Unterstützt Text-, Vision- und Tool-basierte Eingaben.
 */

export async function callVertexAI(
  model: string,
  messages: ChatMessage[],
  options: Record<string, any> = {}
): Promise<AIResponse> {
  const apiKey = process.env[vertexConfig.api_key_env ?? ""] ?? "";
  if (!apiKey) {
    throw new Error("VERTEX_API_KEY fehlt in den Umgebungsvariablen.");
  }

  const usedModel = model || vertexConfig.model;

  const endpoint = `${vertexConfig.endpoint}/${usedModel}:generateContent?key=${apiKey}`;

  const sysPrompt =
    options.systemPrompt ?? "Du bist ein präziser, sachlicher Assistent.";

  /* ----------------------------------------------------------------------
     Eingabestruktur für Vertex AI erzeugen
  ---------------------------------------------------------------------- */
  const parts = messages.map((m) => ({
    role: m.role,
    parts: [{ text: String(m.content || "") }],
  }));

  // Systemprompt zuerst
  parts.unshift({
    role: "system",
    parts: [{ text: String(sysPrompt) }],
  });

  const body = {
    contents: parts,
    generationConfig: {
      temperature: options.temperature ?? vertexConfig.temperature,
      maxOutputTokens: options.max_tokens ?? vertexConfig.max_tokens,
    },
  };

  try {
    const start = Date.now();

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // @ts-ignore – node-fetch erlaubt timeout, TS definiert es nicht
      timeout: vertexConfig.timeout_ms,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`Vertex API HTTP ${res.status}: ${errText}`);
    }

    /* ----------------------------------------------------------------------
       Antwort sicher parsen
    ---------------------------------------------------------------------- */
    const rawData: unknown = await res.json();
    const duration = Date.now() - start;

    let reply = "(keine Antwort erhalten)";
    let totalTokens: number | null = null;

    /* ----------------------------------------------------------------------
       Sicher prüfen, ob Kandidaten existieren
    ---------------------------------------------------------------------- */
    if (
      typeof rawData === "object" &&
      rawData !== null &&
      "candidates" in rawData &&
      Array.isArray((rawData as any).candidates)
    ) {
      const cand = (rawData as any).candidates[0];

      if (
        cand &&
        typeof cand === "object" &&
        "content" in cand &&
        cand.content?.parts?.[0]?.text
      ) {
        reply = String(cand.content.parts[0].text);
      } else if (cand && typeof cand === "object" && "output" in cand) {
        reply = String(cand.output);
      }
    }

    /* ----------------------------------------------------------------------
       Tokens nur lesen, wenn usageMetadata vorhanden ist
    ---------------------------------------------------------------------- */
    if (
      typeof rawData === "object" &&
      rawData !== null &&
      "usageMetadata" in rawData &&
      (rawData as any).usageMetadata?.totalTokenCount !== undefined
    ) {
      totalTokens = Number((rawData as any).usageMetadata.totalTokenCount) || 0;
    }

    /* ----------------------------------------------------------------------
       Tools aus der Antwort erkennen und ggf. ausführen
    ---------------------------------------------------------------------- */
    const toolCalls = detectToolCalls(reply);
    const toolResults =
      toolCalls.length > 0 ? await handleToolCalls(toolCalls) : [];

    log("info", "VertexAI Antwort empfangen", {
      model: usedModel,
      tokens: totalTokens,
      duration_ms: duration,
      tools_used: toolCalls.length,
    });

    /* ----------------------------------------------------------------------
       Endgültige Antwort
    ---------------------------------------------------------------------- */
    return {
      text: [reply, ...toolResults].filter(Boolean).join("\n\n"),
      action: "vertex_chat",
      tool_calls: toolCalls,
      meta: {
        provider: "vertexAI",
        model: usedModel,
        tokens_used: totalTokens ?? 0,
        time_ms: duration,
        source: "vertexAIProvider",
        confidence: 0.95,
      },
    };
  } catch (err: any) {
    log("error", "VertexAI Fehler", {
      model: model || vertexConfig.model,
      error: err.message,
    });

    return {
      text: `VertexAI Fehler: ${err.message}`,
      errors: [err.message],
      meta: {
        provider: "vertexAI",
        model: usedModel,
        source: "vertexAIProvider",
        confidence: 0,
      },
    };
  }
}


/* ========================================================================== */
/* 🧠 Tool-Unterstützung                                                     */
/* ========================================================================== */

/**
 * Erkennt Tool-Aufrufe im Text, z. B. [TOOL: system_info {"verbose":true}]
 */
function detectToolCalls(text: string): { name: string; parameters: any }[] {
  const matches = [...text.matchAll(/\[TOOL:\s*([a-zA-Z0-9_]+)(.*?)\]/g)];
  return matches.map((m) => ({
    name: m[1],
    parameters: safeJsonParse(m[2]),
  }));
}

/** Sicheres JSON-Parsing */
function safeJsonParse(s: string): any {
  try {
    return s && s.trim().length > 0 ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

/** Führt erkannte Tool-Calls aus */
async function handleToolCalls(calls: { name: string; parameters: any }[]): Promise<string[]> {
  const results: string[] = [];
  for (const call of calls) {
    try {
      const { toolRegistry } = await import("../tools/registry.js");
      const res = await toolRegistry.call(call.name, call.parameters);
      results.push(`✅ Tool "${call.name}" erfolgreich ausgeführt.\nAntwort: ${JSON.stringify(res)}`);
    } catch (err: any) {
      results.push(`❌ Tool "${call.name}" Fehler: ${err.message}`);
    }
  }
  return results;
}

/* ========================================================================== */
/* 🔧 Konfiguration & Status                                                 */
/* ========================================================================== */

/** Aktualisiert Vertex-Konfiguration dynamisch */
export function updateVertexConfig(update: Partial<AIModuleConfig>): AIModuleConfig {
  vertexConfig = { ...vertexConfig, ...update };
  log("info", "Vertex-Konfiguration aktualisiert", update);
  return vertexConfig;
}

/** Gibt aktuellen Providerstatus zurück */
export async function getVertexStatus() {
  return {
    provider: "vertexAI",
    model: vertexConfig.model,
    endpoint: vertexConfig.endpoint,
    api_key_set: !!process.env[vertexConfig.api_key_env ?? ""],
    active_config: vertexConfig,
  };
}

/* ========================================================================== */
/* ✅ Export                                                                */
/* ========================================================================== */

export default {
  callVertexAI,
  updateVertexConfig,
  getVertexStatus,
};
