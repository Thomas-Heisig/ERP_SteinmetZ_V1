/**
 * localProvider.ts
 * ---------------------------------------------------------
 * Lokaler Provider für alle unterstützten Modelle auf dem System.
 * Erkennt automatisch Modelle in:
 *   - F:\KI\models
 *   - ERP_SteinmetZ_V1\models
 *
 * Unterstützt GGUF-, HF-, Whisper-, LLaMA-, Gemma-, Falcon-, Qwen-, Mistral-Modelle usw.
 * Kann über Systemprompt oder API-Aufruf dynamisch konfiguriert werden.
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type {
  ChatMessage,
  AIResponse,
  AIModuleConfig,
} from "../types/types.js";
import { log } from "../utils/logger.js";

/* ========================================================================== */
/* ⚙️ Lokale Modellpfade                                                    */
/* ========================================================================== */

const MODEL_PATHS = [
  path.resolve("F:/KI/models"),
  path.resolve("ERP_SteinmetZ_V1/models"),
];

/* ========================================================================== */
/* 🔍 Modellerkennung                                                        */
/* ========================================================================== */

interface LocalModelInfo {
  name: string;
  path: string;
  type: string;
  sizeMB?: number;
  lastModified?: string;
  files?: string[];
}

/**
 * Erkennt automatisch lokale Modelle im Dateisystem.
 */
export function scanLocalModels(): LocalModelInfo[] {
  const models: LocalModelInfo[] = [];

  for (const basePath of MODEL_PATHS) {
    if (!fs.existsSync(basePath)) continue;

    const dirs = fs.readdirSync(basePath, { withFileTypes: true });
    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;

      const modelDir = path.join(basePath, dir.name);
      const files = fs.readdirSync(modelDir);

      const modelType = files.some((f) => f.endsWith(".gguf"))
        ? "GGUF"
        : files.some((f) => f.includes("pytorch_model"))
          ? "HuggingFace"
          : files.some((f) => f.includes("whisper"))
            ? "Whisper"
            : files.some((f) => f.includes("falcon"))
              ? "Falcon"
              : files.some((f) => f.includes("mistral"))
                ? "Mistral"
                : files.some((f) => f.includes("gemma"))
                  ? "Gemma"
                  : files.some((f) => f.includes("qwen"))
                    ? "Qwen"
                    : "Unknown";

      const stats = files
        .map((f) => {
          try {
            const fp = path.join(modelDir, f);
            const s = fs.statSync(fp);
            return s.isFile() ? s.size : 0;
          } catch {
            return 0;
          }
        })
        .reduce((a, b) => a + b, 0);

      models.push({
        name: dir.name,
        path: modelDir,
        type: modelType,
        sizeMB: +(stats / (1024 * 1024)).toFixed(2),
        lastModified: new Date(fs.statSync(modelDir).mtime).toISOString(),
        files,
      });
    }
  }

  return models;
}

/* ========================================================================== */
/* 💬 Modellinteraktion (Pseudo-Chat)                                        */
/* ========================================================================== */

export async function callLocalModel(
  model: string,
  messages: ChatMessage[],
  options: Record<string, any> = {},
): Promise<AIResponse> {
  const localModels = scanLocalModels();
  const selected = localModels.find((m) =>
    model.toLowerCase().includes(m.name.toLowerCase()),
  );

  if (!selected) {
    const available = localModels.map((m) => m.name).join(", ") || "keine";
    return {
      text: `❌ Lokales Modell "${model}" nicht gefunden.\nVerfügbare Modelle: ${available}`,
      action: "error_local_model_not_found",
      errors: [`Model ${model} not found`],
    };
  }

  log("info", `Lokales Modell verwendet: ${selected.name}`, {
    path: selected.path,
    type: selected.type,
    sizeMB: selected.sizeMB,
  });

  // Simulation (Mock)
  const lastMessage = messages[messages.length - 1]?.content ?? "";
  const sysPrompt = options.systemPrompt ?? "Du bist ein lokales KI-Modell.";

  const responseText =
    `${sysPrompt}\n\n🧠 (${selected.name}): ` +
    `Ich habe deine Eingabe erhalten: "${lastMessage.slice(0, 200)}" ...\n` +
    `Ich bin aktuell eine lokale Simulation, kann aber für echte Inferenz erweitert werden.`;

  return {
    text: responseText,
    meta: {
      model: selected.name,
      source: "localProvider",
      reasoning: `Antwort generiert von lokalem Modell (${selected.type})`,
      confidence: 0.6,
      time_ms: 75,
    },
  };
}

/* ========================================================================== */
/* 🧭 Konfiguration                                                          */
/* ========================================================================== */

export let localProviderConfig: AIModuleConfig = {
  name: "localProvider",
  provider: "local",
  model: "auto",
  role: "assistant",
  temperature: 0.4,
  max_tokens: 512,
  active: true,
  description:
    "Scannt, erkennt und verwaltet lokale Modelle (GGUF, HF, Whisper etc.).",
  // ✅ gültige Capability-Werte laut types.ts
  capabilities: ["tools", "workflow", "chat", "reasoning", "json"],
};

/**
 * Ändert dynamisch Konfiguration des Local Providers (z. B. über Systemprompt)
 */
export function updateLocalConfig(
  updates: Partial<AIModuleConfig>,
): AIModuleConfig {
  localProviderConfig = { ...localProviderConfig, ...updates };
  log("info", "Lokale Provider-Konfiguration aktualisiert", updates);
  return localProviderConfig;
}

/* ========================================================================== */
/* ⚙️ Hilfsfunktionen für Systemsteuerung                                   */
/* ========================================================================== */

export function getLocalProviderStatus() {
  const models = scanLocalModels();
  return {
    provider: "localProvider",
    model_count: models.length,
    directories: MODEL_PATHS,
    active_config: localProviderConfig,
    system_info: {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      totalmem_GB: +(os.totalmem() / 1024 ** 3).toFixed(1),
      freemem_GB: +(os.freemem() / 1024 ** 3).toFixed(1),
      cpus: os.cpus().length,
      uptime_hours: +(os.uptime() / 3600).toFixed(1),
    },
  };
}

/* ========================================================================== */
/* 🧩 Export-API                                                             */
/* ========================================================================== */

export default {
  callLocalModel,
  scanLocalModels,
  updateLocalConfig,
  getLocalProviderStatus,
};
