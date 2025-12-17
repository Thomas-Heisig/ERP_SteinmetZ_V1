/**
 * embeddingService.ts
 * ---------------------------------------------------------
 * Erzeugt Embeddings (Text-Vektoren) für semantische Suche,
 * Wissensabruf (RAG), Klassifikation und Ähnlichkeitsanalyse.
 */

import fetch from "node-fetch";
import { log } from "../utils/logger.js";
import type { AIResponse, AIModuleConfig, Provider } from "../types/types.js";

/* ========================================================================== */
/* ⚙️ Konfiguration                                                          */
/* ========================================================================== */

const envProvider = (
  process.env.EMBEDDING_PROVIDER ?? "openai"
).toLowerCase() as Provider;

export const embeddingConfig: AIModuleConfig = {
  name: "embeddingService",
  provider: envProvider, // jetzt typensicher
  model: process.env.EMBEDDING_MODEL ?? "text-embedding-3-small",
  description: "Erzeugt Embeddings für semantische Suche und Analyse.",
  capabilities: ["embedding", "text"],
  active: true,
};

/* ========================================================================== */
/* 🧠 Hauptfunktion: Embeddings generieren                                   */
/* ========================================================================== */

interface EmbeddingOptions {
  provider?: string;
  model?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Erzeugt einen Vektor (Array<number>) für einen oder mehrere Texte.
 */
export async function generateEmbeddings(
  input: string | string[],
  options: EmbeddingOptions = {},
): Promise<AIResponse> {
  const provider = (options.provider ?? embeddingConfig.provider).toLowerCase();
  const model = options.model ?? embeddingConfig.model;

  log("info", "Embedding-Service gestartet", { provider, model });

  try {
    switch (provider) {
      case "openai":
        return await openAIEmbedding(input, model);

      case "ollama":
        return await ollamaEmbedding(input, model);

      case "huggingface":
        return await huggingFaceEmbedding(input, model);

      case "local":
        return await localDummyEmbedding(input);

      default:
        throw new Error(`Unbekannter Embedding-Provider: ${provider}`);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    log("error", "Embedding-Service Fehler", { error: errorMessage });
    return {
      text: `❌ Fehler bei Embedding: ${errorMessage}`,
      errors: [errorMessage],
      meta: { provider, model },
    };
  }
}

/* ========================================================================== */
/* 🤖 OpenAI Embeddings                                                      */
/* ========================================================================== */

interface OpenAIEmbeddingVector {
  embedding: number[];
}

interface OpenAIEmbeddingResponse {
  data?: OpenAIEmbeddingVector[];
  usage?: {
    total_tokens?: number;
  };
}

async function openAIEmbedding(
  input: string | string[],
  model: string,
): Promise<AIResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY fehlt.");
  }

  const payload = {
    model,
    input,
  };

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  const data = json as OpenAIEmbeddingResponse; // ✔ sicheres Casting

  const vectorList = Array.isArray(data.data) ? data.data : [];
  const vectors = vectorList.map((v) =>
    Array.isArray(v.embedding) ? v.embedding : [],
  );

  const dimensions =
    Array.isArray(vectors[0]) && vectors[0].length > 0 ? vectors[0].length : 0;

  return {
    text: `OpenAI Embeddings erzeugt (${vectors.length} Vektoren, ${dimensions} Dimensionen).`,
    data: vectors,
    meta: {
      provider: "openai",
      model,
      tokens_used: data.usage?.total_tokens ?? undefined,
    },
  };
}

/* ========================================================================== */
/* 🧩 Ollama Embeddings (lokal)                                              */
/* ========================================================================== */

interface OllamaEmbeddingResponse {
  embedding?: number[];
  data?: { embedding: number[] }[];
}

async function ollamaEmbedding(
  input: string | string[],
  model: string,
): Promise<AIResponse> {
  const baseUrl =
    process.env.OLLAMA_API_URL ?? "http://localhost:11434/api/embeddings";

  const body = {
    model,
    input: Array.isArray(input) ? input.join("\n") : input,
  };

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  const data = json as OllamaEmbeddingResponse;

  let vector: number[] = [];

  // Struktur 1: data.embedding
  if (Array.isArray(data.embedding)) {
    vector = data.embedding;
  }

  // Struktur 2: data.data[].embedding
  if (
    vector.length === 0 &&
    Array.isArray(data.data) &&
    Array.isArray(data.data[0]?.embedding)
  ) {
    vector = data.data[0].embedding;
  }

  return {
    text: `Ollama Embedding erzeugt (${vector.length} Dimensionen).`,
    data: [vector],
    meta: {
      provider: "ollama",
      model,
      dimensions: vector.length,
    },
  };
}

/* ========================================================================== */
/* 🤗 HuggingFace Embeddings                                                 */
/* ========================================================================== */

interface HFEmbeddingResponse {
  // mögliche Formate der HF-Inference API
  // 1) [[vector]]
  // 2) [vector]
  // 3) { embeddings: [...] }
  0?: number[] | number[][];
  embeddings?: number[] | number[][];
}

async function huggingFaceEmbedding(
  input: string | string[],
  model: string,
): Promise<AIResponse> {
  const token = process.env.HUGGINGFACEHUB_API_TOKEN;
  if (!token) throw new Error("HUGGINGFACEHUB_API_TOKEN fehlt.");

  const endpoint = `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: Array.isArray(input) ? input : [input],
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  // unknown → typisieren
  const json = await res.json();
  const data = json as HFEmbeddingResponse;

  let vector: number[] = [];

  /* ----------------------------------------------------------
   * 1) Format: [[vector]]
   * ---------------------------------------------------------- */
  if (Array.isArray(data[0]) && Array.isArray((data[0] as number[])[0])) {
    const nested = data[0] as number[][];
    if (nested.length > 0) {
      vector = nested[0];
    }
  }

  /* ----------------------------------------------------------
   * 2) Format: [vector]
   * ---------------------------------------------------------- */
  if (vector.length === 0 && Array.isArray(data[0])) {
    const arr = data[0] as number[];
    vector = arr;
  }

  /* ----------------------------------------------------------
   * 3) Format: { embeddings: [...] }
   * ---------------------------------------------------------- */
  if (
    vector.length === 0 &&
    Array.isArray(data.embeddings) &&
    Array.isArray((data.embeddings as number[])[0])
  ) {
    const emb = data.embeddings as number[][];
    vector = emb[0];
  }

  if (vector.length === 0) {
    throw new Error("Konnte HuggingFace-Embedding nicht interpretieren.");
  }

  return {
    text: `HuggingFace Embedding erzeugt (${vector.length} Dimensionen).`,
    data: [vector],
    meta: {
      provider: "huggingface",
      model,
      dimensions: vector.length,
    },
  };
}

/* ========================================================================== */
/* 🧱 Lokaler Dummy-Fallback                                                */
/* ========================================================================== */

async function localDummyEmbedding(
  input: string | string[],
): Promise<AIResponse> {
  const text = Array.isArray(input) ? input.join(" ") : input;
  const seed = text.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const vector = Array.from({ length: 128 }, (_, i) => Math.sin(seed + i));

  return {
    text: `🧩 Lokales Dummy-Embedding erzeugt (128 Dimensionen).`,
    data: [vector],
    meta: { provider: "local", model: "dummy-embedding" },
  };
}

/* ========================================================================== */
/* 📊 Nützlich: Ähnlichkeitsberechnung                                      */
/* ========================================================================== */

/**
 * Berechnet Kosinus-Ähnlichkeit zwischen zwei Vektoren.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

/* ========================================================================== */
/* 🧾 Default Export                                                        */
/* ========================================================================== */

export default {
  generateEmbeddings,
  cosineSimilarity,
};
