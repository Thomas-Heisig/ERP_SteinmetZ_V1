/**
 * fallbackProvider.ts
 * ---------------------------------------------------------
 * Minimaler lokaler Fallback-Provider.
 */

import type { ChatMessage, AIResponse } from "../types/types.js";

const FALLBACK_RESPONSES: string[] = [
  "Ich habe Ihre Eingabe registriert, benötige jedoch mehr Informationen.",
  "Die Anfrage konnte nicht eindeutig interpretiert werden.",
  "Bitte formulieren Sie die Frage etwas präziser.",
  "Im aktuellen Modus stehen nur einfache Antworten bereit.",
  "Gerne – bitte geben Sie weitere Details an.",
];

/**
 * Fallback-Antworten erzeugen
 */
export async function callFallback(
  model: string,
  messages: ChatMessage[],
): Promise<AIResponse> {
  const response =
    FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];

  return {
    text: response,

    // AIResponse erlaubt "meta" → sicher
    meta: {
      provider: "fallback",
      model: model || "fallback",
      source: "local",
    },
  };
}

/**
 * Modell-Erkennung
 */
export function isFallbackModel(modelId: string): boolean {
  if (!modelId) return true;
  const m = modelId.toLowerCase();
  return m === "fallback" || m === "local" || m.includes("offline");
}

/**
 * Provider-Objekt
 */
export const fallbackProvider = {
  call: callFallback,
  isModel: isFallbackModel,
};

export default callFallback;
