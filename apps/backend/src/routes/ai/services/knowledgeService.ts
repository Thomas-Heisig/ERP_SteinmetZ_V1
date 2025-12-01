/**
 * knowledgeService.ts
 * ---------------------------------------------------------
 * Semantischer Wissens- & Kontextservice für ERP_SteinmetZ_V1.
 *
 * Verknüpft:
 *  - EmbeddingService (Vektoren)
 *  - lokale Wissensdaten (Dateien, JSON, SQLite)
 *  - semantische Suche (RAG)
 *  - KI-basierte Zusammenfassungen
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { log } from "../utils/logger.js";
import { generateEmbeddings, cosineSimilarity } from "./embeddingService.js";
import type { AIResponse } from "../types/types.js";

/* ========================================================================== */
/* 📚 Speicherorte & Basis-Konfiguration                                     */
/* ========================================================================== */

const KNOWLEDGE_BASE_PATHS = [
  path.resolve("ERP_SteinmetZ_V1", "data", "knowledge"),
  path.resolve("ERP_SteinmetZ_V1", "docs", "knowledge"),
  path.resolve("F:/KI/ERP_SteinmetZ_V1", "knowledge"),
];

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  vector?: number[];
  source?: string;
  updated?: string;
}

/* ========================================================================== */
/* 🧩 Wissen laden und indexieren                                            */
/* ========================================================================== */

/**
 * Lädt alle Textdateien aus den Knowledge-Verzeichnissen.
 * Erstellt daraus einen internen Suchindex mit Embeddings.
 */
export async function loadKnowledgeBase(): Promise<KnowledgeEntry[]> {
  const entries: KnowledgeEntry[] = [];

  for (const base of KNOWLEDGE_BASE_PATHS) {
    if (!fs.existsSync(base)) continue;

    const files = fs
      .readdirSync(base)
      .filter(
        (f) => f.endsWith(".txt") || f.endsWith(".md") || f.endsWith(".json"),
      );
    for (const file of files) {
      const fullPath = path.join(base, file);
      const raw = fs.readFileSync(fullPath, "utf8");

      let text = raw;
      if (file.endsWith(".json")) {
        try {
          const json = JSON.parse(raw);
          text = JSON.stringify(json);
        } catch {
          log("warn", `Ungültige JSON-Datei: ${file}`);
        }
      }

      entries.push({
        id: path.basename(file),
        title: path.basename(file),
        content: text,
        source: fullPath,
        updated: new Date(fs.statSync(fullPath).mtime).toISOString(),
      });
    }
  }

  // Embeddings generieren
  if (entries.length > 0) {
    const vectors = await Promise.all(
      entries.map((e) => generateEmbeddings(e.content)),
    );

    for (let i = 0; i < entries.length; i++) {
      entries[i].vector = vectors[i].data?.[0] ?? [];
    }
  }

  log("info", `Knowledge Base geladen (${entries.length} Einträge)`);
  return entries;
}

/* ========================================================================== */
/* 🔍 Semantische Suche (RAG Retrieval)                                      */
/* ========================================================================== */

/**
 * Führt eine semantische Suche durch und liefert relevante Wissenseinträge zurück.
 */
export async function queryKnowledgeBase(
  query: string,
  limit = 5,
): Promise<AIResponse> {
  const kb = await loadKnowledgeBase();
  if (kb.length === 0) {
    return {
      text: "❌ Keine Wissensbasis gefunden.",
      data: [],
      meta: { provider: "knowledgeService", model: "local" },
    };
  }

  const qVecResp = await generateEmbeddings(query);
  const qVec = qVecResp.data?.[0] ?? [];

  const scored = kb
    .map((e) => ({
      ...e,
      score: e.vector && e.vector.length ? cosineSimilarity(qVec, e.vector) : 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const summary =
    `📖 Relevante Wissenseinträge zu "${query}":\n\n` +
    scored
      .map(
        (e) =>
          `• **${e.title}** (${(e.score * 100).toFixed(1)}%)\n  Quelle: ${path.basename(e.source ?? "")}`,
      )
      .join("\n");

  return {
    text: summary,
    data: scored,
    meta: { provider: "knowledgeService", model: "semantic-retrieval" },
  };
}

/* ========================================================================== */
/* 🧠 Kontextaufbereitung für KI                                             */
/* ========================================================================== */

/**
 * Erstellt einen konsolidierten Kontext (z. B. für Chat oder Analyse).
 */
export async function buildContextFromKnowledge(
  query: string,
): Promise<string> {
  const result = await queryKnowledgeBase(query, 3);
  const top = result.data ?? [];

  const context =
    top
      .map(
        (e: KnowledgeEntry) => `# ${e.title}\n${e.content.slice(0, 1000)}\n---`,
      )
      .join("\n\n") || "Kein Wissen gefunden.";

  return `📚 Wissenskontext:\n${context}`;
}

/* ========================================================================== */
/* 🧾 Diagnose- & Statusfunktionen                                           */
/* ========================================================================== */

export function getKnowledgeStatus() {
  const foundDirs = KNOWLEDGE_BASE_PATHS.filter(fs.existsSync);
  return {
    provider: "knowledgeService",
    directories: foundDirs,
    total_dirs: foundDirs.length,
    system: {
      hostname: os.hostname(),
      platform: os.platform(),
    },
  };
}

/* ========================================================================== */
/* 🧾 Default Export                                                        */
/* ========================================================================== */

export default {
  loadKnowledgeBase,
  queryKnowledgeBase,
  buildContextFromKnowledge,
  getKnowledgeStatus,
};
