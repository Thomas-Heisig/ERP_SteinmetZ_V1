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
  const toolDir = path.resolve(
    "ERP_SteinmetZ_V1",
    "apps",
    "backend",
    "src",
    "routes",
    "ai",
    "tools",
  );
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
  params: Record<string, any> = {},
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

    return JSON.stringify({
      success: true,
      tool: toolName,
      result,
      duration_ms: duration,
    });
  } catch (err: any) {
    log("error", `Tool "${toolName}" Fehler`, { error: err.message });
    return `❌ Tool-Fehler (${toolName}): ${err.message}`;
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
  const registry: any = toolRegistry as any;

  // Falls Registry describe() hat → nutzen
  if (typeof registry.describe === "function") {
    return registry.describe();
  }

  // Falls nur getToolDefinitions() existiert → konvertieren
  if (typeof registry.getToolDefinitions === "function") {
    return registry.getToolDefinitions().map((t: any) => ({
      name: t.name,
      description: t.description ?? "Kein Beschreibungstext",
      category: t.category ?? "Allgemein",
      params: t.parameters ?? {},
      example: "",
      last_used: t.registeredAt ?? "",
    }));
  }

  // Fallback – nur Namen ausgeben
  return toolRegistry.list().map((name: string) => ({
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
  const registry: any = toolRegistry as any;
  try {
    const names = loadAvailableTools();

    if (typeof registry.reload === "function") {
      registry.reload();
    } else {
      log(
        "warn",
        "toolRegistry.reload() nicht vorhanden – statisches Neuladen verwendet.",
      );
    }

    log("info", "Tools neu geladen", { count: names.length });
    return names;
  } catch (err: any) {
    log("error", "Fehler beim Neuladen der Tools", { error: err.message });
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
