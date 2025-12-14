/**
 * diagnosticService.ts
 * ---------------------------------------------------------
 * Systemdiagnose- und Monitoring-Service für das KI-Subsystem.
 * Überprüft verfügbare Provider, Tools, Workflows und Systemressourcen.
 * Vollständig kompatibel mit dem ERP_SteinmetZ_V1 KI-System.
 */

import os from "node:os";
import path from "node:path";
import fetch from "node-fetch";
import { log } from "../utils/logger.js";

import { getProviderStatus } from "./chatService.js";
import { toolRegistry } from "../tools/registry.js";
import { workflowEngine } from "../workflows/workflowEngine.js";
import { audioConfig } from "./audioService.js";
import type { AIResponse } from "../types/types.js";

/* ========================================================================== */
/* 🧠 Diagnose-Hauptfunktion                                                 */
/* ========================================================================== */

/**
 * Führt eine vollständige Systemdiagnose durch:
 * - Prüft Provider-Verfügbarkeit
 * - Testet Tools & Workflows
 * - Misst Speicher- & CPU-Auslastung
 */
export async function runSystemDiagnostics(): Promise<AIResponse> {
  log("info", "Systemdiagnose gestartet …");

  try {
    const [providers, system, tools, workflows, audio] = await Promise.all([
      checkProviders(),
      checkSystemInfo(),
      checkTools(),
      checkWorkflows(),
      checkAudio(),
    ]);

    const summary =
      `🩺 KI-Systemdiagnose abgeschlossen.\n\n` +
      `📡 Provider aktiv: ${providers.activeCount}/${providers.total}\n` +
      `🔧 Tools geladen: ${tools.count}\n` +
      `⚙️ Workflows registriert: ${workflows.count}\n` +
      `🧠 Speicher: ${system.memory.freeGB.toFixed(1)} GB frei von ${system.memory.totalGB.toFixed(1)} GB\n` +
      `🗣️ Audio verfügbar: ${audio.available ? "Ja" : "Nein"} (${audio.details})\n`;

    return {
      text: summary,
      data: { providers, system, tools, workflows, audio },
      meta: {
        provider: "diagnosticService",
        model: "internal-check",
        time_ms: Date.now(),
        source: "diagnosticService.ts",
      },
    };
  } catch (err: any) {
    log("error", "Systemdiagnose fehlgeschlagen", { error: err.message });
    return {
      text: `❌ Systemdiagnose-Fehler: ${err.message}`,
      errors: [err.message],
      meta: { provider: "diagnosticService" },
    };
  }
}

/* ========================================================================== */
/* 📡 Provider-Prüfung                                                       */
/* ========================================================================== */

async function checkProviders() {
  try {
    const status = await getProviderStatus();
    const active = status.filter((s) => s.available);
    return {
      list: status,
      activeCount: active.length,
      total: status.length,
    };
  } catch (err: any) {
    log("error", "Providerprüfung fehlgeschlagen", { error: err.message });
    return { list: [], activeCount: 0, total: 0 };
  }
}

/* ========================================================================== */
/* 🧩 Tools & Workflows                                                     */
/* ========================================================================== */

async function checkTools() {
  try {
    const all = toolRegistry.getToolDefinitions?.() ?? [];
    return { count: all.length, list: all.map((t) => t.name ?? "unknown") };
  } catch (err: any) {
    log("error", "Toolprüfung fehlgeschlagen", { error: err.message });
    return { count: 0, list: [] };
  }
}

async function checkWorkflows() {
  try {
    const all = workflowEngine.getWorkflowDefinitions?.() ?? [];
    return { count: all.length, list: all.map((w) => w.name ?? "unnamed") };
  } catch (err: any) {
    log("error", "Workflowprüfung fehlgeschlagen", { error: err.message });
    return { count: 0, list: [] };
  }
}

/* ========================================================================== */
/* 🗣️ Audio-Systemprüfung                                                   */
/* ========================================================================== */

interface OpenAIModelsResponse {
  data?: { id: string }[];
}

async function checkAudio() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { available: false, details: "OPENAI_API_KEY fehlt" };
    }

    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return { available: false, details: `HTTP ${res.status}` };
    }

    const json = await res.json();
    const data = json as OpenAIModelsResponse; // ✔ sicheres Casting

    const modelList = Array.isArray(data.data) ? data.data : [];

    const modelNames = modelList.map((m) => m.id);

    const whisper = modelNames.includes("whisper-1");
    const tts = modelNames.some(
      (n) => typeof n === "string" && n.includes("tts"),
    );

    const detailText =
      [whisper ? "Whisper" : "", tts ? "TTS" : ""].filter(Boolean).join(", ") ||
      "Keine Audio-Modelle gefunden";

    return {
      available: whisper || tts,
      details: detailText,
      model: audioConfig.model,
    };
  } catch (err: any) {
    log("error", "Audioprüfung fehlgeschlagen", { error: err.message });
    return { available: false, details: err.message };
  }
}

/* ========================================================================== */
/* 💻 Systeminformationen                                                  */
/* ========================================================================== */

async function checkSystemInfo() {
  const uptimeMin = Math.floor(os.uptime() / 60);
  const load = os.loadavg();

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    uptime_min: uptimeMin,
    cpu: {
      cores: os.cpus().length,
      load1: load[0],
      load5: load[1],
      load15: load[2],
    },
    memory: {
      totalGB: os.totalmem() / 1024 ** 3,
      freeGB: os.freemem() / 1024 ** 3,
    },
    paths: {
      cwd: process.cwd(),
      tmp: os.tmpdir(),
      dataDir: path.resolve("ERP_SteinmetZ_V1", "data"),
      logDir: path.resolve("ERP_SteinmetZ_V1", "logs"),
    },
  };
}

/* ========================================================================== */
/* 🧾 Default-Export                                                        */
/* ========================================================================== */

export default {
  runSystemDiagnostics,
  checkProviders,
  checkAudio,
  checkTools,
  checkWorkflows,
  checkSystemInfo,
};
