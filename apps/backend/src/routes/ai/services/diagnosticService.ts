/**
 * diagnosticService.ts
 * ---------------------------------------------------------
 * Systemdiagnose- und Monitoring-Service für das KI-Subsystem.
 * Überprüft verfügbare Provider, Tools, Workflows und Systemressourcen.
 * Vollständig kompatibel mit dem ERP_SteinmetZ_V1 KI-System.
 */

import os from "node:os";
import path from "node:path";
import { log } from "../utils/logger.js";

import { getProviderStatus } from "./chatService.js";
import { toolRegistry } from "../tools/registry.js";
import { workflowEngine } from "../workflows/workflowEngine.js";
import { audioConfig, testAudioEndpoints } from "./audioService.js";
import type { AIResponse } from "../types/types.js";

type ProviderStatus = Awaited<ReturnType<typeof getProviderStatus>>[number];

interface ProviderSummary {
  list: ProviderStatus[];
  activeCount: number;
  total: number;
}

interface ToolSummary {
  count: number;
  list: string[];
}

interface WorkflowSummary {
  count: number;
  list: string[];
}

interface AudioDiagnostics {
  available: boolean;
  details: string;
  model?: string;
}

interface SystemInfo {
  hostname: string;
  platform: NodeJS.Platform;
  uptime_min: number;
  cpu: {
    cores: number;
    load1: number;
    load5: number;
    load15: number;
  };
  memory: {
    totalGB: number;
    freeGB: number;
  };
  paths: {
    cwd: string;
    tmp: string;
    dataDir: string;
    logDir: string;
  };
}

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
  } catch (error: unknown) {
    const message = getErrorMessage(error);

    log("error", "Systemdiagnose fehlgeschlagen", { error: message });
    return {
      text: `❌ Systemdiagnose-Fehler: ${message}`,
      errors: [message],
      meta: { provider: "diagnosticService" },
    };
  }
}

/* ========================================================================== */
/* 📡 Provider-Prüfung                                                       */
/* ========================================================================== */

async function checkProviders(): Promise<ProviderSummary> {
  try {
    const status = await getProviderStatus();
    const active = status.filter((s) => s.available);

    return {
      list: status,
      activeCount: active.length,
      total: status.length,
    };
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    log("error", "Providerprüfung fehlgeschlagen", { error: message });
    return { list: [], activeCount: 0, total: 0 };
  }
}

/* ========================================================================== */
/* 🧩 Tools & Workflows                                                     */
/* ========================================================================== */

async function checkTools(): Promise<ToolSummary> {
  try {
    const all = toolRegistry.getToolDefinitions?.() ?? [];
    return { count: all.length, list: all.map((t) => t.name ?? "unknown") };
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    log("error", "Toolprüfung fehlgeschlagen", { error: message });
    return { count: 0, list: [] };
  }
}

async function checkWorkflows(): Promise<WorkflowSummary> {
  try {
    const all = workflowEngine.getWorkflowDefinitions?.() ?? [];
    return { count: all.length, list: all.map((w) => w.name ?? "unnamed") };
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    log("error", "Workflowprüfung fehlgeschlagen", { error: message });
    return { count: 0, list: [] };
  }
}

/* ========================================================================== */
/* 🗣️ Audio-Systemprüfung                                                   */
/* ========================================================================== */
async function checkAudio(): Promise<AudioDiagnostics> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { available: false, details: "OPENAI_API_KEY fehlt" };
    }

    const endpoints = await testAudioEndpoints();
    const available = endpoints.whisper || endpoints.tts;

    const detailText = formatAudioDetails(endpoints.whisper, endpoints.tts);

    return {
      available,
      details: detailText,
      model: audioConfig.model,
    };
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    log("error", "Audioprüfung fehlgeschlagen", { error: message });
    return { available: false, details: message };
  }
}

/* ========================================================================== */
/* 💻 Systeminformationen                                                  */
/* ========================================================================== */

async function checkSystemInfo(): Promise<SystemInfo> {
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
      dataDir: path.resolve("data"),
      logDir: path.resolve("logs"),
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

function formatAudioDetails(whisper: boolean, tts: boolean): string {
  const parts = [whisper ? "Whisper" : "", tts ? "TTS" : ""]
    .filter(Boolean)
    .join(", ");

  return parts || "Keine Audio-Modelle gefunden";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : JSON.stringify(error);
}
