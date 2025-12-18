/**
 * huggingfaceProvider.ts
 * ---------------------------------------------------------
 * Verbindung zur HuggingFace Inference API
 * Unterstützt Text-, Chat-, Übersetzungs- und Embedding-Modelle.
 * Vollständig kompatibel mit ERP_SteinmetZ_V1 KI-System.
 */

import fetch from "node-fetch";
import type {
  ChatMessage,
  AIResponse,
  AIModuleConfig,
} from "../types/types.js";
import { log } from "../utils/logger.js";

/* ========================================================================== */
/* ⚙️ Konfiguration */
/* ========================================================================== */

export const hfConfig: AIModuleConfig = {
  name: "huggingfaceProvider",
  provider: "huggingface",
  model: process.env.HF_MODEL ?? "mistralai/Mistral-7B-Instruct-v0.1",
  endpoint:
    process.env.HF_ENDPOINT ?? "https://api-inference.huggingface.co/models/",
  api_key_env: "HUGGINGFACEHUB_API_TOKEN",
  temperature: Number(process.env.HF_TEMPERATURE) || 0.4,
  max_tokens: Number(process.env.HF_MAX_TOKENS) || 1200,
  description: "Anbindung an die HuggingFace Inference API",
  capabilities: ["chat", "text", "embedding", "translation", "summarization"],
  active: true,
};

/* ========================================================================== */
/* 🧩 Hilfsfunktionen */
/* ========================================================================== */

/** Erzeugt Header mit API-Key */
function buildHeaders(): Record<string, string> {
  const token = process.env[hfConfig.api_key_env ?? ""] ?? "";
  if (!token) throw new Error("❌ HUGGINGFACEHUB_API_TOKEN fehlt in .env");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/** Baut aus ChatMessages einen Eingabetext */
function formatInput(messages: ChatMessage[]): string {
  return messages.map((m) => `${m.role}: ${m.content}`).join("\n");
}

/* ========================================================================== */
/* 💬 Hauptfunktion: Aufruf der HF API */
/* ========================================================================== */

export async function callHuggingFace(
  model: string,
  messages: ChatMessage[],
): Promise<AIResponse> {
  const usedModel = model || hfConfig.model;

  // ✅ Endpoint-Absicherung gegen undefined
  const baseEndpoint =
    hfConfig.endpoint ?? "https://api-inference.huggingface.co/models/";
  const endpoint = baseEndpoint.endsWith("/")
    ? `${baseEndpoint}${usedModel}`
    : `${baseEndpoint}/${usedModel}`;

  const inputText = formatInput(messages);

  const payload = {
    inputs: inputText,
    parameters: {
      temperature: hfConfig.temperature,
      max_new_tokens: hfConfig.max_tokens,
      return_full_text: false,
    },
  };

  try {
    const start = Date.now();
    const res = await fetch(endpoint, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(payload),
      // @ts-expect-error – node-fetch unterstützt timeout, aber TS kennt das Attribut nicht offiziell
      timeout: 60000,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data: unknown = await res.json();
    const duration = Date.now() - start;

    /* ─────────────────────────────────────────────
     * 🔍 Ausgabe interpretieren
     * ───────────────────────────────────────────── */
    type HFArrayResponse = Array<{
      generated_text?: string;
      translation_text?: string;
      summary_text?: string;
    }>;

    type HFObjectResponse = {
      generated_text?: string;
      outputs?: string | unknown;
      usage?: {
        total_tokens?: number;
      };
    };

    let output = "";
    if (Array.isArray(data)) {
      // Standard-Textmodelle
      const arrayData = data as HFArrayResponse;
      output =
        arrayData[0]?.generated_text ??
        arrayData[0]?.translation_text ??
        arrayData[0]?.summary_text ??
        "";
    } else if (typeof data === "object" && data !== null) {
      const objData = data as HFObjectResponse;
      if (objData.generated_text) {
        output = objData.generated_text;
      } else if (objData.outputs) {
        // z. B. Embedding- oder generische Modelle
        output =
          typeof objData.outputs === "string"
            ? objData.outputs
            : JSON.stringify(objData.outputs);
      }
    }

    const objData =
      typeof data === "object" && data !== null
        ? (data as HFObjectResponse)
        : undefined;

    log("info", "HuggingFace Antwort empfangen", {
      model: usedModel,
      endpoint,
      duration_ms: duration,
      tokens: objData?.usage?.total_tokens,
    });

    return {
      text: output?.trim() || "(keine Ausgabe von HuggingFace erhalten)",
      data,
      meta: {
        provider: "huggingface",
        model: usedModel,
        tokens_used: objData?.usage?.total_tokens,
        time_ms: duration,
        source: endpoint,
      },
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    log("error", "HuggingFace Fehler", {
      model: model || hfConfig.model,
      error: errorMessage,
    });

    return {
      text: `❌ HuggingFace Fehler: ${errorMessage}`,
      errors: [errorMessage],
      meta: {
        provider: "huggingface",
        model: usedModel,
        source: endpoint,
      },
    };
  }
}

/* ========================================================================== */
/* 🔍 Zusatzfunktionen */
/* ========================================================================== */

/**
 * Prüft, ob ein Modell-ID auf HuggingFace hindeutet.
 */
export function isHuggingFaceModel(modelId: string): boolean {
  return modelId.includes("/") || modelId.toLowerCase().includes("huggingface");
}

/**
 * Prüft, ob der API-Endpunkt erreichbar ist.
 */
export async function testHuggingFace(): Promise<boolean> {
  const endpoint = hfConfig.endpoint ?? "";

  // Wenn leer → direkt Fehler zurückgeben
  if (!endpoint) return false;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(endpoint, {
      method: "HEAD",
      signal: controller.signal,
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
  config: hfConfig,
  call: callHuggingFace,
  isModel: isHuggingFaceModel,
  test: testHuggingFace,
};
