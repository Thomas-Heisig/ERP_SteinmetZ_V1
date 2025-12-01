/**
 * visionService.ts
 * ---------------------------------------------------------
 * KI-gestützte Bildanalyse, Objekterkennung und visuelles Verständnis.
 * Unterstützt OpenAI (GPT-4o), Vertex AI (Gemini), HuggingFace und lokale Modelle.
 *
 * Funktionen:
 *  - Beschreibung von Bildern
 *  - Text- und Objekterkennung (OCR, tags)
 *  - Mehrbildanalyse
 *  - Kompatibel mit allen AIResponse-Typen im ERP_SteinmetZ KI-System
 */

import fs from "node:fs";
import path from "node:path";
import fetch from "node-fetch";
import { log } from "../utils/logger.js";
import type {
  AIResponse,
  AIModuleConfig,
  ChatMessage,
} from "../types/types.js";
import { callOpenAI } from "../providers/openaiProvider.js";
import { callVertexAI } from "../providers/vertexAIProvider.js";
import { callHuggingFace } from "../providers/huggingfaceProvider.js";

/* ========================================================================== */
/* ⚙️ Konfiguration                                                          */
/* ========================================================================== */

export const visionConfig: AIModuleConfig = {
  name: "visionService",
  provider: "openai",
  model: process.env.VISION_MODEL ?? "gpt-4o",
  description:
    "Verarbeitet Bilder, erkennt Objekte, Text und visuelle Zusammenhänge.",
  capabilities: ["vision", "json_mode", "reasoning"],
  active: true,
  max_tokens: 1500,
  temperature: 0.3,
};

/* ========================================================================== */
/* 📸 Hilfsfunktionen                                                        */
/* ========================================================================== */

/** Prüft, ob eine Datei ein unterstütztes Bildformat ist. */
export function isImageFile(filePath: string): boolean {
  return /\.(png|jpg|jpeg|gif|bmp|webp|tiff)$/i.test(filePath);
}

/** Liest Bilddatei als Base64. */
export function encodeImageToBase64(filePath: string): string {
  if (!fs.existsSync(filePath))
    throw new Error(`Datei nicht gefunden: ${filePath}`);
  const buffer = fs.readFileSync(filePath);
  return buffer.toString("base64");
}

/* ========================================================================== */
/* 🧠 Hauptfunktion: Bildanalyse                                             */
/* ========================================================================== */

interface OpenAIVisionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export async function analyzeImage(
  imagePath: string,
  instruction = "Beschreibe den Inhalt des Bildes detailliert.",
  engine: "openai" | "vertex" | "huggingface" = "openai",
): Promise<AIResponse> {
  if (!isImageFile(imagePath)) {
    return {
      text: `❌ Ungültiges Format: ${imagePath}`,
      errors: ["Unsupported file type"],
    };
  }

  const base64 = encodeImageToBase64(imagePath);
  const fileName = path.basename(imagePath);

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "Du bist ein KI-System für visuelle Analyse. Beantworte in natürlicher Sprache.",
    },
    {
      role: "user",
      content: `${instruction}\nDateiname: ${fileName}`,
    },
  ];

  try {
    let result: AIResponse;

    switch (engine) {
      case "vertex":
        result = await callVertexAI("gemini-1.5-pro-vision", messages);
        break;

      case "huggingface":
        result = await callHuggingFace(
          "Salesforce/blip-image-captioning-large",
          [{ role: "user", content: `Bildbeschreibung: ${instruction}` }],
        );
        break;

      default:
        /* ============================================================
         * OPENAI VISION (GPT-4o / GPT-4o-mini)
         * ============================================================ */
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: visionConfig.model,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: instruction },
                  {
                    type: "image_url",
                    image_url: `data:image/jpeg;base64,${base64}`,
                  },
                ],
              },
            ],
          }),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => res.statusText);
          throw new Error(`HTTP ${res.status}: ${errText}`);
        }

        // unknown -> typisieren
        const json = await res.json();
        const data = json as OpenAIVisionResponse;

        const reply = data.choices?.[0]?.message?.content || "(keine Antwort)";

        result = {
          text: reply,
          meta: { provider: "openai", model: visionConfig.model },
        };
        break;
    }

    log("info", "Bildanalyse abgeschlossen", { fileName, engine });

    return {
      ...result,
      meta: {
        ...result.meta,
        file: fileName,
        engine,
      },
    };
  } catch (err: any) {
    log("error", "VisionService Fehler", { error: err.message });
    return {
      text: `❌ Fehler bei Analyse: ${err.message}`,
      errors: [err.message],
    };
  }
}

/* ========================================================================== */
/* 🧩 Multi-Bildanalyse                                                      */
/* ========================================================================== */

/**
 * Analysiert mehrere Bilder gleichzeitig und fasst die Ergebnisse zusammen.
 */
export async function analyzeMultipleImages(
  imagePaths: string[],
  instruction = "Analysiere die Gemeinsamkeiten und Unterschiede zwischen den Bildern.",
  engine: "openai" | "vertex" | "huggingface" = "openai",
): Promise<AIResponse> {
  const validPaths = imagePaths.filter(isImageFile);
  if (validPaths.length === 0) {
    return { text: "❌ Keine gültigen Bilddateien gefunden." };
  }

  const results: string[] = [];
  for (const img of validPaths) {
    const res = await analyzeImage(img, instruction, engine);
    results.push(`🖼️ ${path.basename(img)} → ${res.text}`);
  }

  return {
    text: results.join("\n\n"),
    meta: {
      provider: engine,
      model: visionConfig.model,
      images: validPaths.length,
    },
  };
}

/* ========================================================================== */
/* 🔍 OCR / Texterkennung                                                    */
/* ========================================================================== */

/**
 * Extrahiert Text aus einem Bild (OCR).
 */
export async function extractTextFromImage(
  imagePath: string,
  engine: "openai" | "vertex" | "huggingface" = "openai",
): Promise<AIResponse> {
  const prompt = "Erkenne und gib den im Bild enthaltenen Text exakt wieder.";
  return analyzeImage(imagePath, prompt, engine);
}

/* ========================================================================== */
/* 🧾 Status / Diagnose                                                      */
/* ========================================================================== */

export function getVisionStatus() {
  return {
    provider: "visionService",
    active_model: visionConfig.model,
    engines_supported: ["openai", "vertex", "huggingface"],
    max_tokens: visionConfig.max_tokens,
    active: visionConfig.active,
  };
}

/* ========================================================================== */
/* ✅ Export                                                                 */
/* ========================================================================== */

export default {
  analyzeImage,
  analyzeMultipleImages,
  extractTextFromImage,
  getVisionStatus,
};
