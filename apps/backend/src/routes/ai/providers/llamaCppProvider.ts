/**
 * llamaCppProvider.ts
 * ---------------------------------------------------------
 * Direkte Anbindung an lokale llama.cpp REST-Schnittstelle.
 * Unterstützt GGUF-Modelle, Offline-Nutzung und API-kompatible Parameter.
 * Vollständig kompatibel mit ERP_SteinmetZ_V1 KI-System.
 */

import fetch from "node-fetch";
import type { ChatMessage, AIResponse, AIModuleConfig } from "../types/types.js";
import { log } from "../utils/logger.js";

/* ========================================================================== */
/* ⚙️ Konfiguration */
/* ========================================================================== */

export const llamaConfig: AIModuleConfig = {
  name: "llamaCppProvider",
  provider: "local",
  model: process.env.LLAMA_CPP_MODEL ?? "local-gguf",
  endpoint: process.env.LLAMA_CPP_URL ?? "http://localhost:8080/completion",
  temperature: Number(process.env.LLAMA_CPP_TEMPERATURE) || 0.4,
  max_tokens: Number(process.env.LLAMA_CPP_MAX_TOKENS) || 1000,
  description: "Lokaler llama.cpp Server (GGUF- oder API-kompatible Modelle)",
  capabilities: ["chat", "text", "reasoning", "tools", "json"],
  active: true,
};

/* ========================================================================== */
/* 🔧 Hilfsfunktionen */
/* ========================================================================== */

/** Baut den Prompt aus Chat-Nachrichten */
function buildPrompt(messages: ChatMessage[]): string {
  return messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n")
    .concat("\nASSISTANT:");
}

/** Baut das JSON-Payload für llama.cpp (Kompatibel zu /completion und /chat/completions) */
function buildPayload(prompt: string) {
  return {
    prompt,
    temperature: llamaConfig.temperature,
    max_tokens: llamaConfig.max_tokens,
    stream: false,
  };
}

/* ========================================================================== */
/* 💬 Hauptfunktion: Aufruf der llama.cpp API */
/* ========================================================================== */

export async function callLlamaCpp(model: string, messages: ChatMessage[]): Promise<AIResponse> {
  const apiUrl = llamaConfig.endpoint ?? "http://localhost:8080/completion";
  const usedModel = model || llamaConfig.model;
  const prompt = buildPrompt(messages);

  const payload = buildPayload(prompt);

  try {
    const start = Date.now();
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // @ts-ignore
      timeout: 120000, // 2 Minuten
    });

    if (!response.ok) {
      const errTxt = await response.text().catch(() => response.statusText);
      throw new Error(`HTTP ${response.status}: ${errTxt}`);
    }

    const data: any = await response.json();
    const duration = Date.now() - start;

    /* ─────────────────────────────────────────────
     * 🔍 Ausgabe interpretieren
     * ───────────────────────────────────────────── */
    let output =
      data?.content ??
      data?.response ??
      data?.choices?.[0]?.text ??
      data?.choices?.[0]?.message?.content ??
      "";

    if (typeof output !== "string") output = JSON.stringify(output);

    log("info", "llama.cpp Antwort empfangen", {
      model: usedModel,
      endpoint: apiUrl,
      duration_ms: duration,
    });

    return {
      text: output.trim() || "(keine Antwort von llama.cpp erhalten)",
      meta: {
        provider: "llama.cpp",
        model: usedModel,
        time_ms: duration,
        source: apiUrl,
      },
    };
  } catch (err: any) {
    const message = err?.message ?? "Unbekannter Fehler";
    log("error", "llama.cpp Fehler", { error: message, endpoint: llamaConfig.endpoint });

    return {
      text: `❌ llama.cpp Fehler: ${message}`,
      errors: [String(err)],
      meta: {
        provider: "llama.cpp",
        model: model || llamaConfig.model,
        source: llamaConfig.endpoint,
        confidence: 0,
      },
    };
  }
}

/* ========================================================================== */
/* 🔍 Zusatzfunktionen */
/* ========================================================================== */

/**
 * Prüft, ob eine Modell-ID auf llama.cpp hinweist.
 */
export function isLlamaCppModel(modelId: string): boolean {
  const id = modelId.toLowerCase();
  return id.includes("gguf") || id.includes("llama") || id.includes("local");
}

/**
 * Prüft, ob die lokale API erreichbar ist.
 */
export async function testLlamaCpp(): Promise<boolean> {
  const endpoint = llamaConfig.endpoint ?? "";

  // Wenn kein Endpoint definiert ist → Verbindung unmöglich
  if (!endpoint) return false;

  try {
    // Timeout korrekt umgesetzt
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(endpoint, { 
      method: "HEAD",
      signal: controller.signal
    });

    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}


/* ========================================================================== */
/* 🧾 Default-Export */
/* ========================================================================== */

export default {
  config: llamaConfig,
  call: callLlamaCpp,
  isModel: isLlamaCppModel,
  test: testLlamaCpp,
};
