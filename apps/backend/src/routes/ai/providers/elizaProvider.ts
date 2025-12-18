/**
 * elizaProvider.ts
 * ---------------------------------------------------------
 * Regelbasierter KI-Provider (ElizaEngine) für ERP-/Systemdialoge.
 * Dient als lokaler KI-Provider und Fallback bei fehlender externer Verbindung.
 * Unterstützt Tool-Calls, Workflows und kontextabhängige Antworten.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createLogger } from "../../../utils/logger.js";
import type {
  ChatMessage,
  AIResponse,
  ElizaRule,
  ConversationState,
  Provider,
  ToolResult,
} from "../types/types.js";
import { toolRegistry } from "../tools/registry.js";
import { workflowEngine } from "../workflows/workflowEngine.js";
import { ConversationContext } from "../context/conversationContext.js";

const logger = createLogger("eliza");

/* ========================================================================== */
/* 🧱 Hilfsfunktionen - VERBESSERT */
/* ========================================================================== */

function pick<T>(arr: T[]): T | undefined {
  return Array.isArray(arr) && arr.length > 0
    ? arr[Math.floor(Math.random() * arr.length)]
    : undefined;
}

function pickFromPool(pool?: string[][]): string {
  if (!pool || !Array.isArray(pool) || pool.length === 0) return "";
  const group = pick(pool) ?? [];
  return pick(group as string[]) ?? "";
}

function isValidString(str: unknown): str is string {
  return typeof str === "string" && str.trim().length > 0;
}

/* ========================================================================== */
/* ⚙️ Konfigurationsverwaltung - VERBESSERT & ROBUSTER                      */
/* ========================================================================== */

interface ElizaConfig {
  pools: Record<string, string[][]>;
  eliza_rules: ElizaRule[];
  reflections: Record<string, string>;
  metadata?: {
    version?: string;
    description?: string;
    last_updated?: string;
  };
}

interface ElizaProviderConfig {
  maxHistoryLength?: number;
  enableToolCalls?: boolean;
  enableWorkflows?: boolean;
  fallbackResponses?: string[];
  debugMode?: boolean;
}

/** Quelle der geladenen Konfiguration */
let CONFIG_SOURCE: "json" | "data" | "defaults" = "defaults";

// Basisverzeichnis für Konfiguration bestimmen
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTEXT_DIR = path.resolve(__dirname, "../context");
const DATA_DIR = path.join(CONTEXT_DIR, "data");
const CONFIG_PATH = path.join(CONTEXT_DIR, "context.json");

/**
 * Lädt und validiert Eliza-Konfiguration mit erweiterter Fehlerbehandlung
 */
function loadElizaConfig(): ElizaConfig {
  const defaultConfig: ElizaConfig = {
    pools: {
      unknown: [
        [
          "Entschuldigung, ich bin mir nicht sicher, was Sie meinen.",
          "Könnten Sie das bitte anders formulieren?",
        ],
        [
          "Das verstehe ich nicht ganz. Könnten Sie es anders erklären?",
          "Ich benötige mehr Informationen, um Ihnen zu helfen.",
        ],
      ],
    },
    eliza_rules: [],
    reflections: {},
    metadata: {
      version: "1.0.0-default",
      description: "Standard-Eliza-Konfiguration",
      last_updated: new Date().toISOString(),
    },
  };

  try {
    logger.info("Starting configuration loading...");

    const combined: ElizaConfig = {
      pools: { ...defaultConfig.pools },
      eliza_rules: [],
      reflections: {},
      metadata: { ...defaultConfig.metadata },
    };

    let configFound = false;

    // 1) Multi-File-Directory laden (DATA_DIR)
    if (fs.existsSync(DATA_DIR)) {
      logger.info({ directory: DATA_DIR }, "Configuration directory found");

      const files = fs
        .readdirSync(DATA_DIR)
        .filter((f) => f.toLowerCase().endsWith(".json"))
        .sort((a, b) => {
          const numA = parseInt(a.split("_")[0]) || 0;
          const numB = parseInt(b.split("_")[0]) || 0;
          return numA - numB;
        });

      logger.info({ count: files.length }, "Found JSON configuration files");

      for (const file of files) {
        const fullPath = path.join(DATA_DIR, file);
        logger.debug({ file }, "Loading configuration file");

        try {
          const raw = fs.readFileSync(fullPath, "utf8");
          const part = JSON.parse(raw) as Partial<ElizaConfig>;

          if (validateConfigPart(part, file)) {
            if (part.pools && typeof part.pools === "object") {
              Object.assign(combined.pools, part.pools);
              logger.debug(
                { poolsAdded: Object.keys(part.pools).length },
                "Pools added from configuration",
              );
            }
            if (part.eliza_rules && Array.isArray(part.eliza_rules)) {
              const validRules = part.eliza_rules.filter(
                (r) => r?.pattern && Array.isArray(r?.replies),
              );
              combined.eliza_rules.push(...validRules);
              logger.debug(
                {
                  validRules: validRules.length,
                  totalRules: part.eliza_rules.length,
                },
                "Rules added from configuration",
              );
            }
            if (part.reflections && typeof part.reflections === "object") {
              Object.assign(combined.reflections, part.reflections);
              logger.debug(
                { reflectionsAdded: Object.keys(part.reflections).length },
                "Reflections added from configuration",
              );
            }
            if (part.metadata && typeof part.metadata === "object") {
              if (combined.metadata) {
                Object.assign(combined.metadata, part.metadata);
              }
            }

            configFound = true;
          }
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          logger.warn(
            { file, error: errorMsg },
            "Failed to read/parse configuration file",
          );
        }
      }

      if (configFound) {
        CONFIG_SOURCE = "data";
      }
    }

    // 2) Fallback: context.json
    if (!configFound && fs.existsSync(CONFIG_PATH)) {
      logger.info({ path: CONFIG_PATH }, "Fallback - Loading context.json");
      try {
        const raw = fs.readFileSync(CONFIG_PATH, "utf8");
        const cfg = JSON.parse(raw) as ElizaConfig;

        if (validateConfigPart(cfg, "context.json")) {
          if (cfg.pools && typeof cfg.pools === "object") {
            Object.assign(combined.pools, cfg.pools);
          }
          if (cfg.eliza_rules && Array.isArray(cfg.eliza_rules)) {
            combined.eliza_rules.push(...cfg.eliza_rules);
          }
          if (cfg.reflections && typeof cfg.reflections === "object") {
            Object.assign(combined.reflections, cfg.reflections);
          }
          if (cfg.metadata && typeof cfg.metadata === "object") {
            if (combined.metadata) {
              Object.assign(combined.metadata, cfg.metadata);
            }
          }

          CONFIG_SOURCE = "json";
          configFound = true;
          logger.info(
            { rules: cfg.eliza_rules?.length ?? 0 },
            "context.json loaded",
          );
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        logger.warn({ error: errorMsg }, "Failed to load context.json");
      }
    }

    // Zusammenfassung & garantierter Rückgabewert
    const totalRules = combined.eliza_rules.length;
    const totalReflections = Object.keys(combined.reflections).length;
    const totalPools = Object.keys(combined.pools).length;

    logger.info(
      {
        source: CONFIG_SOURCE,
        rules: totalRules,
        reflections: totalReflections,
        pools: totalPools,
      },
      "Configuration loading completed",
    );

    if (!configFound) {
      logger.warn("No valid configuration found - using default configuration");
      return defaultConfig; // <- garantierter Rückgabepfad
    }

    return combined; // <- regulärer Rückgabepfad
  } catch (err: unknown) {
    logger.error({ err }, "Critical error loading configuration");
    return defaultConfig; // <- Fallback bei Exceptions
  }
}

// Konfigurations-Validierung
function validateConfigPart(part: unknown, filename: string): boolean {
  if (typeof part !== "object" || part === null) {
    logger.warn({ filename }, "Invalid configuration: Not an object");
    return false;
  }

  const config = part as Record<string, unknown>;

  // Validiere Pools
  if ("pools" in config && typeof config.pools !== "object") {
    logger.warn({ filename }, "Invalid pools in configuration");
    return false;
  }

  // Validiere Regeln
  if ("eliza_rules" in config && !Array.isArray(config.eliza_rules)) {
    logger.warn(
      { filename },
      "Invalid eliza_rules in configuration: Not an array",
    );
    return false;
  }

  // Validiere Reflections
  if ("reflections" in config && typeof config.reflections !== "object") {
    logger.warn({ filename }, "Invalid reflections in configuration");
    return false;
  }

  return true;
}

// Globale Instanz laden
const ELIZA_CONFIG = loadElizaConfig();

/* ========================================================================== */
/* 🧠 ElizaEngine – Regelbasierte Verarbeitung - VERBESSERT                 */
/* ========================================================================== */

class ElizaEngine {
  private rules: (ElizaRule & {
    compiled: RegExp;
    priority: number;
    enabled: boolean;
  })[] = [];
  private stats = {
    totalMatches: 0,
    matchesByPriority: {} as Record<number, number>,
    lastMatchTime: null as string | null,
  };

  constructor() {
    this.compileRules();
  }

  /** Kompiliert alle Regex-Regeln mit erweiterter Validierung */
  private compileRules(): void {
    this.rules = (ELIZA_CONFIG.eliza_rules || [])
      .filter((rule) => {
        // Filter nur gültige und aktivierte Regeln
        if (rule.enabled === false) return false;
        if (
          !rule.pattern ||
          !Array.isArray(rule.replies) ||
          rule.replies.length === 0
        ) {
          logger.warn({ pattern: rule.pattern }, "Invalid rule ignored");
          return false;
        }
        return true;
      })
      .map((rule) => {
        try {
          return {
            ...rule,
            compiled: new RegExp(rule.pattern, "i"),
            priority: rule.priority ?? 1,
            enabled: rule.enabled !== false,
          };
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          logger.warn(
            { pattern: rule.pattern, error: errorMsg },
            "Failed to compile rule",
          );
          return null;
        }
      })
      .filter((rule): rule is NonNullable<typeof rule> => rule !== null);

    // Sortiere nach Priorität (höhere zuerst)
    this.rules.sort((a, b) => b.priority - a.priority);

    logger.info({ rulesCount: this.rules.length }, "Rules compiled and sorted");
  }

  /** Wendet Reflexionsregeln auf den Text an */
  private reflect(input: string): string {
    if (!isValidString(input)) return input;

    const tokens = input.split(/(\s+)/);
    return tokens
      .map((token) => {
        const lower = token.toLowerCase().trim();
        if (ELIZA_CONFIG.reflections[lower]) {
          return ELIZA_CONFIG.reflections[lower];
        }
        return token;
      })
      .join("");
  }

  /** Hauptverarbeitung: versucht, eine passende Regel zu finden */
  async apply(
    message: string,
    context: ConversationState,
  ): Promise<AIResponse | null> {
    if (!isValidString(message)) {
      return null;
    }

    const msg = message.trim();
    const lowerMsg = msg.toLowerCase();

    // 1️⃣ Sonderfall Wikipedia
    if (lowerMsg.includes("wikipedia")) {
      const query = msg.replace(/.*wikipedia\s+/i, "").trim();
      if (query) {
        return await this.handleWikipediaSearch(query);
      }
    }

    // 2️⃣ Regelmatching
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      try {
        const match = lowerMsg.match(rule.compiled);
        if (!match) continue;

        // Kontext-Überprüfung
        if (rule.context && !this.checkRuleContext(rule.context, context)) {
          continue;
        }

        // Statistiken aktualisieren
        this.stats.totalMatches++;
        this.stats.matchesByPriority[rule.priority] =
          (this.stats.matchesByPriority[rule.priority] || 0) + 1;
        this.stats.lastMatchTime = new Date().toISOString();

        // Antwort generieren
        const response = await this.generateResponse(rule, match, context);
        return response;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        logger.warn(
          { pattern: rule.pattern, error: errorMsg },
          "Error evaluating rule",
        );
      }
    }

    // Kein Treffer
    return null;
  }

  /** Überprüft Regel-Kontext-Anforderungen */
  private checkRuleContext(
    requiredContext: string[],
    context: ConversationState,
  ): boolean {
    return requiredContext.every((ctxKey) => {
      const contextValue = context[ctxKey];
      return (
        contextValue !== undefined &&
        contextValue !== false &&
        contextValue !== null
      );
    });
  }

  /** Generiert Antwort basierend auf gefundener Regel */
  private async generateResponse(
    rule: ElizaRule & { compiled: RegExp; priority: number; enabled: boolean },
    match: RegExpMatchArray,
    context: ConversationState,
  ): Promise<AIResponse> {
    // Antworttext generieren
    let text = pick(rule.replies) ?? "";
    for (let i = 1; i < match.length; i++) {
      const replacement = match[i] ? this.reflect(match[i]) : "";
      text = text.replace(new RegExp(`\\$${i}`, "g"), replacement);
    }

    const response: AIResponse = {
      text,
      action: rule.action,
      meta: {
        provider: "eliza" as Provider,
        model: "eliza-engine",
        confidence: rule.confidence_threshold || 0.7,
        source: "rule_based",
        matched_rule: rule.pattern,
        rule_priority: rule.priority,
      },
    };

    // Tool-Calls verarbeiten
    if (rule.tool_call) {
      response.tool_calls = [
        {
          name: rule.tool_call,
          parameters: this.extractToolParameters(rule, match),
        },
      ];
    }

    // Kontext-Update
    response.context_update = {
      matched_rule: rule.pattern,
      rule_priority: rule.priority,
      timestamp: new Date().toISOString(),
      ...context,
    };

    return response;
  }

  /** Extrahiert Parameter für Tool-Aufrufe aus Regex-Matches */
  private extractToolParameters(
    rule: ElizaRule,
    match: RegExpMatchArray,
  ): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    if (rule.params && Array.isArray(rule.params)) {
      rule.params.forEach((param, index) => {
        if (param.startsWith("$") && match[index + 1]) {
          const paramName = param.substring(1); // Entferne $ prefix
          params[paramName] = match[index + 1];
        } else {
          params[`param_${index}`] = param;
        }
      });
    }

    return params;
  }

  /** Behandelt Wikipedia-Suche */
  private async handleWikipediaSearch(query: string): Promise<AIResponse> {
    try {
      const result = await toolRegistry.call("wikipedia_search", { query });
      return {
        text: `Wikipedia-Ergebnis für "${query}":\n${result?.result ?? "(keine Daten gefunden)"}`,
        action: "wikipedia_search",
        data: result,
        meta: {
          provider: "eliza",
          model: "wikipedia-tool",
          source: "tool_call",
        },
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        text: `Fehler bei Wikipedia-Suche für "${query}": ${errorMsg}`,
        errors: [String(err)],
        meta: {
          provider: "eliza",
          model: "wikipedia-tool",
          source: "tool_error",
        },
      };
    }
  }

  getStats() {
    const byPriority = this.rules.reduce(
      (acc, r) => {
        acc[r.priority] = (acc[r.priority] ?? 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    return {
      total_rules: this.rules.length,
      active_rules: this.rules.filter((r) => r.enabled).length,
      rules_by_priority: byPriority,
      patterns_with_tools: this.rules.filter((r) => r.tool_call).length,
      patterns_with_actions: this.rules.filter((r) => r.action).length,
      match_statistics: this.stats,
      config_source: CONFIG_SOURCE,
    };
  }

  // Neue Methode: Regel zur Laufzeit hinzufügen
  addRule(rule: ElizaRule): void {
    try {
      const compiledRule = {
        ...rule,
        compiled: new RegExp(rule.pattern, "i"),
        priority: rule.priority ?? 1,
        enabled: rule.enabled !== false,
      };

      this.rules.push(compiledRule);
      this.rules.sort((a, b) => b.priority - a.priority);
      logger.info({ pattern: rule.pattern }, "New rule added");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.warn({ error: errorMsg }, "Failed to add rule");
    }
  }
}

/* ========================================================================== */
/* 🤖 Hauptklasse: ElizaProvider - VERBESSERT                               */
/* ========================================================================== */

export class ElizaProvider {
  private context = new ConversationContext();
  private history: ChatMessage[] = [];
  private engine = new ElizaEngine();
  private sessionId = `eliza_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  private config: ElizaProviderConfig;
  private startTime = new Date().toISOString();

  constructor(config: ElizaProviderConfig = {}) {
    this.config = {
      maxHistoryLength: 25,
      enableToolCalls: true,
      enableWorkflows: true,
      debugMode: false,
      fallbackResponses: [
        "Das habe ich nicht verstanden. Könnten Sie es anders formulieren?",
        "Entschuldigung, ich bin mir nicht sicher, was Sie meinen.",
        "Könnten Sie das bitte näher erläutern?",
      ],
      ...config,
    };

    logger.info({ sessionId: this.sessionId }, "ELIZA provider initialized");
  }

  /** Hauptantwort-Handler mit erweiterter Funktionalität */
  async respond(messages: ChatMessage[]): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Historie und Kontext aktualisieren
      this.history = messages.slice(-(this.config.maxHistoryLength || 25));
      this.context.update(this.history);

      const lastMsg = this.history[this.history.length - 1]?.content ?? "";

      if (!isValidString(lastMsg)) {
        return this.createErrorResponse(
          "Leere oder ungültige Nachricht erhalten",
        );
      }

      // 1️⃣ Befehle / Diagnostik
      const commandResp = this.handleCommand(lastMsg);
      if (commandResp) return commandResp;

      // 2️⃣ Regelbasierte Antwort
      const elizaResp = await this.engine.apply(
        lastMsg,
        this.context.getContext(),
      );
      if (elizaResp) {
        // Tool-Calls ausführen falls aktiviert
        if (this.config.enableToolCalls && elizaResp.tool_calls?.length) {
          const toolResults = await this.executeToolCalls(elizaResp.tool_calls);
          elizaResp.text += this.formatToolResults(toolResults);
        }

        // Kontext aktualisieren
        elizaResp.context_update = {
          ...elizaResp.context_update,
          ...this.context.getContext(),
          response_source: "eliza_engine",
        };

        // Metadaten hinzufügen
        elizaResp.meta = {
          ...elizaResp.meta,
          response_time_ms: Date.now() - startTime,
          session_id: this.sessionId,
          history_length: this.history.length,
        };

        return elizaResp;
      }

      // 3️⃣ Kategorie-Fallback
      return this.createFallbackResponse();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error({ err: error }, "Error in respond method");
      return this.createErrorResponse(`Interner Fehler: ${errorMsg}`);
    }
  }

  /* ====================================================================== */
  /* 🧰 Tool-Aufrufe - VERBESSERT                                          */
  /* ====================================================================== */
  private async executeToolCalls(tool_calls: unknown[]): Promise<ToolResult[]> {
    if (!this.config.enableToolCalls) {
      return [{ success: false, error: "Tool calls are disabled" }];
    }

    const results: ToolResult[] = [];

    for (const call of tool_calls) {
      const startTime = Date.now();

      try {
        // Type guard for call object
        if (typeof call !== "object" || call === null) {
          throw new Error("Ungültiges Tool-Call-Objekt");
        }

        const toolCall = call as { name?: unknown; parameters?: unknown };

        if (!toolCall.name || typeof toolCall.name !== "string") {
          throw new Error("Ungültiger Tool-Name");
        }

        const parameters =
          typeof toolCall.parameters === "object" &&
          toolCall.parameters !== null
            ? toolCall.parameters
            : {};

        const res = await toolRegistry.call(toolCall.name, parameters);
        results.push({
          success: true,
          data: res,
          runtime_ms: Date.now() - startTime,
          source_tool: toolCall.name,
          timestamp: new Date().toISOString(),
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        const toolName =
          typeof call === "object" && call !== null
            ? (call as { name?: unknown }).name
            : "unknown";
        results.push({
          success: false,
          error: errorMsg,
          runtime_ms: Date.now() - startTime,
          source_tool: typeof toolName === "string" ? toolName : "unknown",
          timestamp: new Date().toISOString(),
        });
      }
    }

    return results;
  }

  private formatToolResults(results: ToolResult[]): string {
    if (results.length === 0) return "";

    const formatted = results.map((result) => {
      if (result.success) {
        return `✅ ${result.source_tool}: Erfolgreich ausgeführt (${result.runtime_ms}ms)`;
      } else {
        return `❌ ${result.source_tool}: Fehler - ${result.error}`;
      }
    });

    return `\n\n**Tool-Ergebnisse:**\n${formatted.join("\n")}`;
  }

  /* ====================================================================== */
  /* ⚙️ Befehle (Systemdiagnose, Tools, Workflows) - VERBESSERT            */
  /* ====================================================================== */
  private handleCommand(msg: string): AIResponse | null {
    const command = msg.trim().toLowerCase();

    const commandHandlers: Record<string, () => AIResponse> = {
      "?help": () => this.showHelp(),
      "/help": () => this.showHelp(),
      hilfe: () => this.showHelp(),
      "?tools": () => this.showTools(),
      "?workflows": () => this.showWorkflows(),
      "?config": () => this.showConfig(),
      "?session": () => this.showSession(),
      "?stats": () => this.showStats(),
      "?rules": () => this.showRules(),
      "?status": () => this.showStatus(),
    };

    const handler = commandHandlers[command];
    return handler ? handler() : null;
  }

  private showHelp(): AIResponse {
    return {
      text: `# Eliza Provider Hilfe\n\n**Verfügbare Befehle:**\n
• ?help – Zeigt diese Hilfe
• ?tools – Zeigt verfügbare Tools
• ?workflows – Zeigt aktive Workflows  
• ?config – Zeigt Konfiguration & Regeln
• ?session – Zeigt aktuelle Sitzung
• ?stats – Zeigt Systemstatistiken
• ?rules – Zeigt Regel-Statistiken
• ?status – Zeigt Systemstatus\n
**Allgemeine Nutzung:**
Der Eliza Provider verarbeitet natürliche Sprache und führt automatisch Tools aus, wenn passende Regeln gefunden werden.`,
    };
  }

  private showTools(): AIResponse {
    const categories = toolRegistry.getToolsByCategory();
    let output = "## Verfügbare Tools\n\n";

    for (const [category, tools] of Object.entries(categories)) {
      output += `**${category.toUpperCase()}**\n`;
      tools.forEach((tool) => {
        output += `• **${tool.name}** – ${tool.description || "Keine Beschreibung"}\n`;
      });
      output += "\n";
    }

    return { text: output };
  }

  private showWorkflows(): AIResponse {
    const defs = workflowEngine.getWorkflowDefinitions();

    if (defs.length === 0) {
      return { text: "Keine Workflows definiert." };
    }

    const output = defs
      .map((w: unknown) => {
        if (typeof w === "object" && w !== null) {
          const workflow = w as {
            name?: string;
            id?: string;
            description?: string;
            steps?: unknown[] | number;
          };
          return `• **${workflow.name || workflow.id}** – ${workflow.description || "Keine Beschreibung"} (${Array.isArray(workflow.steps) ? workflow.steps.length : workflow.steps || 0} Schritte)`;
        }
        return "• Ungültiger Workflow";
      })
      .join("\n");

    return { text: `## Aktive Workflows\n\n${output}` };
  }

  private showConfig(): AIResponse {
    const stats = this.engine.getStats();
    return {
      text: `## Konfiguration\n
• **Quelle:** ${CONFIG_SOURCE}
• **Regeln:** ${stats.total_rules} (${stats.active_rules} aktiv)
• **Tools:** ${toolRegistry.getToolDefinitions().length}
• **Workflows:** ${workflowEngine.getWorkflowDefinitions().length}
• **Session:** ${this.sessionId}
• **Gestartet:** ${new Date(this.startTime).toLocaleString("de-DE")}`,
    };
  }

  private showSession(): AIResponse {
    return {
      text: JSON.stringify(this.getSessionInfo(), null, 2),
    };
  }

  private showStats(): AIResponse {
    const context = this.context.getContext();
    return {
      text: `## Systemstatistiken\n
• **Nachrichten:** ${context.history_length || 0}
• **Aktives Thema:** ${context.current_topic || "Unbekannt"}
• **Stimmung:** ${context.sentiment || "Neutral"}
• **Kontext-Confidence:** ${context.confidence || "Niedrig"}
• **Response Time Avg:** ${context.stats?.averageResponseTime?.toFixed(2) || "0"}ms`,
    };
  }

  private showRules(): AIResponse {
    const stats = this.engine.getStats();
    return {
      text: `## Regel-Statistiken\n
• **Gesamt:** ${stats.total_rules} Regeln
• **Aktiv:** ${stats.active_rules} Regeln
• **Treffer gesamt:** ${stats.match_statistics.totalMatches}
• **Letzter Treffer:** ${stats.match_statistics.lastMatchTime ? new Date(stats.match_statistics.lastMatchTime).toLocaleString("de-DE") : "Nie"}\n
**Verteilung nach Priorität:**
${Object.entries(stats.rules_by_priority)
  .map(([prio, count]) => `• Priorität ${prio}: ${count} Regeln`)
  .join("\n")}`,
    };
  }

  private showStatus(): AIResponse {
    return {
      text: `## Systemstatus\n
• **Provider:** Eliza Engine
• **Status:** ✅ Betriebsbereit
• **Session-ID:** ${this.sessionId}
• **Laufzeit:** ${this.getUptime()}
• **Tool-Calls:** ${this.config.enableToolCalls ? "✅ Aktiviert" : "❌ Deaktiviert"}
• **Workflows:** ${this.config.enableWorkflows ? "✅ Aktiviert" : "❌ Deaktiviert"}
• **Debug-Modus:** ${this.config.debugMode ? "✅ Aktiv" : "❌ Inaktiv"}`,
    };
  }

  private getUptime(): string {
    const uptimeMs = Date.now() - new Date(this.startTime).getTime();
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  /* ====================================================================== */
  /* 🧭 Status / Session-Information - VERBESSERT                          */
  /* ====================================================================== */
  getSessionInfo() {
    const context = this.context.getContext();
    const engineStats = this.engine.getStats();

    return {
      session: {
        id: this.sessionId,
        start_time: this.startTime,
        uptime: this.getUptime(),
        message_count: this.history.length,
      },
      context: {
        current_topic: context.current_topic,
        sentiment: context.sentiment,
        confidence: context.confidence,
        history_length: context.history_length,
      },
      engine: engineStats,
      config: {
        source: CONFIG_SOURCE,
        max_history: this.config.maxHistoryLength,
        tool_calls_enabled: this.config.enableToolCalls,
        workflows_enabled: this.config.enableWorkflows,
      },
    };
  }

  /* ====================================================================== */
  /* 🔧 Utility-Methoden                                                   */
  /* ====================================================================== */
  private createFallbackResponse(): AIResponse {
    const fallbackText =
      pick(this.config.fallbackResponses || []) ||
      pickFromPool(ELIZA_CONFIG.pools["unknown"]) ||
      "Entschuldigung, ich bin mir nicht sicher, was Sie meinen.";

    return {
      text: fallbackText,
      meta: {
        provider: "eliza",
        model: "fallback",
        source: "fallback",
        confidence: 0.1,
      },
    };
  }

  private createErrorResponse(error: string): AIResponse {
    return {
      text: `Es ist ein Fehler aufgetreten: ${error}`,
      errors: [error],
      meta: {
        provider: "eliza",
        model: "error",
        source: "error",
        confidence: 0,
      },
    };
  }

  // Neue Methoden für erweiterte Funktionalität
  addCustomRule(rule: ElizaRule): void {
    this.engine.addRule(rule);
  }

  updateConfig(newConfig: Partial<ElizaProviderConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info("Configuration updated");
  }

  getConfig(): ElizaProviderConfig {
    return { ...this.config };
  }

  resetSession(): void {
    this.history = [];
    this.context.clear();
    this.sessionId = `eliza_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.startTime = new Date().toISOString();
    logger.info({ sessionId: this.sessionId }, "Session reset");
  }
}

/* ========================================================================== */
/* 🔹 Exports */
/* ========================================================================== */

export const elizaProvider = new ElizaProvider();

export default elizaProvider;
