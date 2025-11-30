/**
 * modelService.ts
 * ---------------------------------------------------------
 * Zentrale Verwaltung aller registrierten KI-Modelle im ERP_SteinmetZ_V1-System.
 * 
 * Aufgaben:
 *  - Modelle & Provider erfassen, aktivieren, deaktivieren
 *  - Status- & Leistungsberichte
 *  - Lokale und externe Modelle zusammenführen
 *  - Automatische Erkennung lokaler Modelle
 */

import os from "node:os";
import { log } from "../utils/logger.js";
import type { AIModuleConfig } from "../types/types.js";

// Provider-Konfigurationen importieren
import { openaiConfig } from "../providers/openaiProvider.js";
import { vertexConfig } from "../providers/vertexAIProvider.js";
import { ollamaConfig, listOllamaModels } from "../providers/ollamaProvider.js";
import { localProviderConfig, scanLocalModels } from "../providers/localProvider.js";
import { hfConfig } from "../providers/huggingfaceProvider.js";
import { azureConfig } from "../providers/azureOpenAIProvider.js";
import { customConfig } from "../providers/customProvider.js";

/* ========================================================================== */
/* 🧭 Zentrale Modellliste                                                    */
/* ========================================================================== */

/**
 * Gibt alle bekannten KI-Module / Provider-Konfigurationen zurück.
 */
export function listAllModels(): AIModuleConfig[] {
  return [
    openaiConfig,
    vertexConfig,
    ollamaConfig,
    localProviderConfig,
    hfConfig,
    azureConfig,
    customConfig,
  ].filter((cfg) => cfg && cfg.active);
}

/* ========================================================================== */
/* 📊 Übersicht aller aktiven Modelle                                        */
/* ========================================================================== */

export function getModelOverview() {
  const models = listAllModels();
  return models.map((m) => ({
    name: m.name,
    provider: m.provider,
    model: m.model,
    active: m.active,
    capabilities: m.capabilities ?? [],
    description: m.description ?? "",
    endpoint: m.endpoint ?? "n/a",
  }));
}

/* ========================================================================== */
/* ⚙️ Dynamische Modellaktivierung                                           */
/* ========================================================================== */

/**
 * Aktiviert oder deaktiviert ein bestimmtes Modell.
 */
export function toggleModel(name: string, active: boolean): AIModuleConfig {
  const models = listAllModels();
  const model = models.find((m) => m.name === name);
  if (!model) throw new Error(`❌ Modell "${name}" nicht gefunden.`);

  model.active = active;
  log("info", `Modellstatus geändert`, { model: name, active });
  return model;
}

/* ========================================================================== */
/* 🧩 Registrierung & Aktualisierung                                         */
/* ========================================================================== */

/**
 * Registriert oder aktualisiert ein Modell dynamisch (z. B. über API).
 */
export function registerModel(newModel: AIModuleConfig): AIModuleConfig {
  if (!newModel.name || !newModel.provider) {
    throw new Error("Ungültige Modellkonfiguration.");
  }

  const all = listAllModels();
  const existing = all.find((m) => m.name === newModel.name);

  if (existing) {
    Object.assign(existing, newModel);
    log("info", `Modell aktualisiert: ${newModel.name}`);
    return existing;
  } else {
    all.push(newModel);
    log("info", `Neues Modell registriert: ${newModel.name}`);
    return newModel;
  }
}

/* ========================================================================== */
/* 🧠 Erweiterung: Lokale & Ollama-Modelle scannen                           */
/* ========================================================================== */

/**
 * Führt eine automatische Erkennung von Modellen durch:
 *  - Lokale Modelle aus `models`-Verzeichnis
 *  - Ollama-Modelle über lokale API
 */
export async function autoDetectModels(): Promise<AIModuleConfig[]> {
  const localModels = scanLocalModels();
  const ollamaModels = await listOllamaModels();

  const detected: AIModuleConfig[] = [];

  for (const m of localModels) {
    detected.push({
      name: `local-${m.name}`,
      provider: "local",
      model: m.name,
      description: `Lokales Modell (${m.type})`,
      active: true,
      capabilities: ["chat", "completion", "embedding"],
    });
  }

  for (const m of ollamaModels) {
    detected.push({
      name: `ollama-${m.name}`,
      provider: "ollama",
      model: m.name,
      description: `Ollama-Modell (${m.name})`,
      active: true,
      capabilities: ["chat", "completion", "tools"],
    });
  }

  log("info", `Automatisch erkannte Modelle: ${detected.length}`);
  return detected;
}

/* ========================================================================== */
/* 📈 System- & Modellstatus                                                 */
/* ========================================================================== */

/**
 * Gibt aktuelle Statusinformationen der KI-Systeme aus.
 */
export async function getModelStatusReport() {
  const allModels = listAllModels();
  const autoModels = await autoDetectModels();

  const total = allModels.length + autoModels.length;

  return {
    timestamp: new Date().toISOString(),
    total_models: total,
    active_models: allModels.filter((m) => m.active).length,
    detected_models: autoModels.length,
    providers: [...new Set(allModels.map((m) => m.provider))],
    system_info: {
      hostname: os.hostname(),
      platform: os.platform(),
      totalmem_GB: +(os.totalmem() / 1024 ** 3).toFixed(1),
      freemem_GB: +(os.freemem() / 1024 ** 3).toFixed(1),
      cpus: os.cpus().length,
    },
  };
}

/* ========================================================================== */
/* 🧾 Export                                                                */
/* ========================================================================== */

export default {
  listAllModels,
  getModelOverview,
  toggleModel,
  registerModel,
  autoDetectModels,
  getModelStatusReport,
};
