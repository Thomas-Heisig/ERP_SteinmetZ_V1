/**
 * toolService.ts
 * ---------------------------------------------------------
 * Verwaltung, Registrierung und Ausführung von Tools / Funktionen,
 * die durch KI-Modelle oder interne Module aufgerufen werden können.
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { log } from "../utils/logger.js";
import { toolRegistry } from "../tools/registry.js";
import type { AIModuleConfig } from "../types/types.js";

/* ========================================================================== */
/* ⚙️ Konfiguration                                                          */
/* ========================================================================== */

export const toolServiceConfig: AIModuleConfig = {
  name: "toolService",
  provider: "custom",
  model: "tools-runtime",
  active: true,
  description: "Verwaltet Tools und deren Aufrufe über KI-Modelle.",
  capabilities: ["tools", "workflow", "json_mode", "reasoning"],
};

/* ========================================================================== */
/* 🧩 Tool-Registrierung                                                     */
/* ========================================================================== */

export function loadAvailableTools(): string[] {
  const toolDir = path.resolve("apps", "backend", "src", "routes", "ai", "tools");
  if (!fs.existsSync(toolDir)) return [];

  const files = fs
    .readdirSync(toolDir)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"));
  const names = files.map((f) => path.basename(f, path.extname(f)));
  log("info", `Tools gefunden: ${names.length}`, { names });
  return names;
}

/** Gibt alle registrierten Tools zurück */
export function listRegisteredTools(): string[] {
  return toolRegistry.list();
}

/* ========================================================================== */
/* ⚙️ Tool-Aufruf                                                            */
/* ========================================================================== */

export async function runTool(
  toolName: string,
  params: Record<string, unknown> = {},
): Promise<string> {
  try {
    const start = Date.now();
    const result = await toolRegistry.call(toolName, params);
    const duration = Date.now() - start;

    log("info", `Tool ausgeführt: ${toolName}`, {
      duration_ms: duration,
      params,
    });

    if (typeof result === "string") return result;

    const payload = isRecord(result) || Array.isArray(result) ? result : { value: result };
    return JSON.stringify({
      success: true,
      tool: toolName,
      result: payload,
      duration_ms: duration,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    log("error", `Tool "${toolName}" Fehler`, { error: message });
    return `❌ Tool-Fehler (${toolName}): ${message}`;
  }
}

/* ========================================================================== */
/* 🔍 Tool-Metadaten                                                         */
/* ========================================================================== */

export interface ToolMetadata {
  name: string;
  description?: string;
  category?: string;
  params?: Record<string, string>;
  example?: string;
  last_used?: string;
}

/**
 * Liefert Metadaten zu allen Tools.
 * Fällt automatisch zurück, wenn `describe()` nicht existiert.
 */
export function getToolMetadata(): ToolMetadata[] {
  const reg = toolRegistry as unknown;

  if (hasDescribe(reg)) {
    const described = reg.describe();
    if (Array.isArray(described)) return described as ToolMetadata[];
  }

  if (hasGetToolDefinitions(reg)) {
    const defs = reg.getToolDefinitions();
    return defs.map((t) => ({
      name: t.name,
      description: t.description ?? "Kein Beschreibungstext",
      category: (t as { category?: string }).category ?? "Allgemein",
      params: (t as { parameters?: Record<string, string> }).parameters ?? {},
      example: "",
      last_used: (t as { registeredAt?: string }).registeredAt ?? "",
    }));
  }

  return toolRegistry.list().map((name) => ({
    name,
    description: "Keine Metadaten verfügbar",
  }));
}

/* ========================================================================== */
/* 🧠 Automatische Tool-Erkennung                                            */
/* ========================================================================== */

export function isToolAvailable(toolName: string): boolean {
  return toolRegistry.list().includes(toolName);
}

/**
 * Lädt Tools neu (sicherer Fallback, falls reload() fehlt)
 */
export function reloadTools(): string[] {
  try {
    const names = loadAvailableTools();

    const reg = toolRegistry as unknown;
    if (hasReload(reg)) {
      reg.reload();
    } else {
      log(
        "warn",
        "toolRegistry.reload() nicht vorhanden – statisches Neuladen verwendet.",
      );
    }

    log("info", "Tools neu geladen", { count: names.length });
    return names;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    log("error", "Fehler beim Neuladen der Tools", { error: message });
    return [];
  }
}

/* ========================================================================== */
/* 🧾 Diagnose- & Statusfunktionen                                           */
/* ========================================================================== */

export function getToolServiceStatus() {
  const registered = toolRegistry.list();
  const available = loadAvailableTools();

  return {
    provider: "toolService",
    registered_count: registered.length,
    available_count: available.length,
    active_config: toolServiceConfig,
    system_info: {
      hostname: os.hostname(),
      platform: os.platform(),
      cpus: os.cpus().length,
    },
  };
}

/* ========================================================================== */
/* ✅ Export                                                                 */
/* ========================================================================== */

export default {
  loadAvailableTools,
  listRegisteredTools,
  runTool,
  getToolMetadata,
  isToolAvailable,
  reloadTools,
  getToolServiceStatus,
};

function hasDescribe(obj: unknown): obj is { describe: () => ToolMetadata[] } {
  if (!isRecord(obj)) return false;
  const d = (obj as Record<string, unknown>)["describe"];
  return typeof d === "function";
}

function hasGetToolDefinitions(obj: unknown): obj is {
  getToolDefinitions: () => Array<{ name: string; description?: string }>;
} {
  if (!isRecord(obj)) return false;
  const fn = (obj as Record<string, unknown>)["getToolDefinitions"];
  return typeof fn === "function";
}

function hasReload(obj: unknown): obj is { reload: () => void } {
  if (!isRecord(obj)) return false;
  const fn = (obj as Record<string, unknown>)["reload"];
  return typeof fn === "function";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : JSON.stringify(error);
}
