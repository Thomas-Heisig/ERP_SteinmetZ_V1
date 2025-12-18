/**
 * translationService.ts
 * ---------------------------------------------------------
 * Universeller Übersetzungsdienst für das ERP_SteinmetZ KI-System.
 * Unterstützt OpenAI, Vertex AI, HuggingFace und lokale Modelle.
 *
 * Funktionen:
 *  - Textübersetzung (einzeln oder als Liste)
 *  - Automatische Spracherkennung
 *  - Engine-Auswahl je nach Verfügbarkeit
 *  - Kontextbasierte Prompts
 */

import { callOpenAI } from "../providers/openaiProvider.js";
import { callVertexAI } from "../providers/vertexAIProvider.js";
import { callHuggingFace } from "../providers/huggingfaceProvider.js";
import type { AIResponse, ChatMessage } from "../types/types.js";
import { log } from "../utils/logger.js";

/* ========================================================================== */
/* ⚙️ Basiskonfiguration                                                     */
/* ========================================================================== */

export const translationConfig = {
  name: "translationService",
  defaultEngine: "openai",
  defaultModel: "gpt-4o-mini",
  fallbackEngine: "vertex",
  supportedEngines: ["openai", "vertex", "huggingface"],
  defaultTargetLang: "Deutsch",
};

/* ========================================================================== */
/* 💬 Hauptfunktion: Übersetzung                                             */
/* ========================================================================== */

/**
 * Übersetzt Text zwischen Sprachen.
 * @param text - Eingabetext
 * @param targetLang - Zielsprache
 * @param engine - Engine: openai | vertex | huggingface
 */
export async function translateText(
  text: string,
  targetLang: string = translationConfig.defaultTargetLang,
  engine:
    | "openai"
    | "vertex"
    | "huggingface" = translationConfig.defaultEngine as
    | "openai"
    | "vertex"
    | "huggingface",
): Promise<AIResponse> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Übersetze den folgenden Text präzise ins ${targetLang}.`,
    },
    { role: "user", content: text },
  ];

  try {
    let response: AIResponse;

    switch (engine) {
      case "vertex":
        response = await callVertexAI("gemini-1.5-pro", messages);
        break;
      case "huggingface":
        response = await callHuggingFace("facebook/m2m100_418M", messages);
        break;
      default:
        response = await callOpenAI(translationConfig.defaultModel, messages);
    }

    if (!response?.text) {
      throw new Error("Keine Übersetzungsantwort erhalten.");
    }

    log("info", "Übersetzung erfolgreich", {
      engine,
      targetLang,
      chars: text.length,
    });

    return {
      ...response,
      meta: {
        ...response.meta,
        engine,
        targetLang,
      },
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const msg = `❌ Übersetzungsfehler (${engine}): ${errorMessage}`;
    log("error", "Fehler bei Übersetzung", { error: errorMessage, engine });
    return { text: msg, errors: [errorMessage], meta: { engine, targetLang } };
  }
}

/* ========================================================================== */
/* 🧠 Automatische Spracherkennung                                           */
/* ========================================================================== */

/**
 * Erkennt automatisch die Sprache des Textes.
 */
export async function detectLanguage(
  text: string,
  engine:
    | "openai"
    | "vertex"
    | "huggingface" = translationConfig.defaultEngine as
    | "openai"
    | "vertex"
    | "huggingface",
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "Bestimme die Sprache des folgenden Textes und antworte nur mit dem Sprachennamen (z. B. 'Deutsch', 'Englisch', 'Französisch').",
    },
    { role: "user", content: text },
  ];

  try {
    const res =
      engine === "vertex"
        ? await callVertexAI("gemini-1.5-pro", messages)
        : await callOpenAI(translationConfig.defaultModel, messages);

    return res.text.trim();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    log("error", "Fehler bei Spracherkennung", { error: errorMessage });
    return "Unbekannt";
  }
}

/* ========================================================================== */
/* 🌍 Automatische Übersetzung                                               */
/* ========================================================================== */

/**
 * Erkennt Sprache automatisch und übersetzt ins Deutsche.
 */
export async function autoTranslate(
  text: string,
  targetLang: string = "Deutsch",
  engine:
    | "openai"
    | "vertex"
    | "huggingface" = translationConfig.defaultEngine as
    | "openai"
    | "vertex"
    | "huggingface",
): Promise<AIResponse> {
  try {
    const detected = await detectLanguage(text, engine);
    log("info", "Automatische Spracherkennung", { detected });

    if (detected.toLowerCase() === targetLang.toLowerCase()) {
      return {
        text: text,
        meta: { info: "Keine Übersetzung nötig", language: detected },
      };
    }

    return await translateText(text, targetLang, engine);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { text: `❌ Fehler bei autoTranslate: ${errorMessage}` };
  }
}

/* ========================================================================== */
/* 🧩 Batch-Übersetzung                                                      */
/* ========================================================================== */

/**
 * Übersetzt mehrere Texte nacheinander.
 */
export async function translateBatch(
  texts: string[],
  targetLang = "Deutsch",
  engine:
    | "openai"
    | "vertex"
    | "huggingface" = translationConfig.defaultEngine as "openai" | "vertex" | "huggingface",
): Promise<AIResponse[]> {
  const results: AIResponse[] = [];
  for (const t of texts) {
    const res = await translateText(t, targetLang, engine);
    results.push(res);
  }
  return results;
}

/* ========================================================================== */
/* 🧾 Diagnose                                                               */
/* ========================================================================== */

export function getTranslationStatus() {
  return {
    service: "translationService",
    defaultEngine: translationConfig.defaultEngine,
    supportedEngines: translationConfig.supportedEngines,
    defaultTargetLang: translationConfig.defaultTargetLang,
  };
}

/* ========================================================================== */
/* ✅ Export                                                                 */
/* ========================================================================== */

export default {
  translateText,
  autoTranslate,
  translateBatch,
  detectLanguage,
  getTranslationStatus,
};
