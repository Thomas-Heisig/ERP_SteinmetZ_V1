/**
 * chatService.ts
 * ---------------------------------------------------------
 * Zentrale Steuerung aller Chat- und KI-Anfragen.
 * Enthält Routing, Tool-Integration, Fallbacks und Workflows.
 */

import type { ChatMessage, AIResponse } from "../types/types.js";
import { log } from "../utils/logger.js";

// Provider-Module
import { callOpenAI } from "../providers/openaiProvider.js";
import { callOllama } from "../providers/ollamaProvider.js";
import { callAzureOpenAI } from "../providers/azureOpenAIProvider.js";
import { callVertexAI } from "../providers/vertexAIProvider.js";
import { callHuggingFace } from "../providers/huggingfaceProvider.js";
import { callCustomAPI } from "../providers/customProvider.js";
import { callLlamaCpp } from "../providers/llamaCppProvider.js";
import { callLocalModel } from "../providers/localProvider.js";
import { callFallback } from "../providers/fallbackProvider.js";
import elizaProvider from "../providers/elizaProvider.js";

import { toolRegistry } from "../tools/registry.js";
import { workflowEngine } from "../workflows/workflowEngine.js";

/* ========================================================================== */
/* ⚙️ System-Konfiguration                                                   */
/* ========================================================================== */

const ACTIVE_PROVIDER: ProviderName = (process.env.AI_PROVIDER?.toLowerCase() ??
  "ollama") as ProviderName;
const FALLBACK_ENABLED = process.env.AI_FALLBACK_ENABLED === "1";
const FALLBACK_PROVIDER: ProviderName =
  (process.env.AI_FALLBACK_PROVIDER?.toLowerCase() ?? "eliza") as ProviderName;

type ProviderName =
  | "openai"
  | "azure"
  | "azureopenai"
  | "vertex"
  | "ollama"
  | "huggingface"
  | "local"
  | "llama"
  | "llamacpp"
  | "custom"
  | "eliza";

interface ChatRequestOptions extends Record<string, unknown> {
  provider?: string;
}

interface ToolCall {
  name: string;
  parameters?: Record<string, unknown>;
}

type WorkflowRunner = (
  name: string,
  input: Record<string, unknown>,
) => Promise<unknown>;

interface WorkflowEngineLike {
  runWorkflow?: WorkflowRunner;
  execute?: WorkflowRunner;
  start?: WorkflowRunner;
  getWorkflowDefinitions?(): unknown[];
}

/* ========================================================================== */
/* 🧠 Chat-Handler                                                           */
/* ========================================================================== */

/**
 * Zentraler Entry-Point für Chat-Anfragen inkl. Tool- und Fallback-Unterstützung.
 * @param model Zielmodell (z. B. "gpt-4o-mini")
 * @param messages Verlauf der Unterhaltung
 * @param options optionale Provider-Overrides und Modellparameter
 */
export async function handleChatRequest(
  model: string,
  messages: ChatMessage[],
  options: ChatRequestOptions = {},
): Promise<AIResponse> {
  const provider = normalizeProvider(options.provider ?? ACTIVE_PROVIDER);

  log("info", "ChatService gestartet", {
    provider,
    model,
    messageCount: messages.length,
  });

  try {
    let response: AIResponse | null = null;

    switch (provider) {
      case "openai":
        response = await callOpenAI(model, messages, options);
        break;

      case "azure":
      case "azureopenai":
        response = await callAzureOpenAI(model, messages);
        break;

      case "vertex":
        response = await callVertexAI(model, messages);
        break;

      case "ollama":
        response = await callOllama(model, messages, options);
        break;

      case "huggingface":
        response = await callHuggingFace(model, messages);
        break;

      case "local":
        response = await callLocalModel(model, messages, options);
        break;

      case "llama":
      case "llamacpp":
        response = await callLlamaCpp(model, messages);
        break;

      case "custom":
        response = await callCustomAPI(model, messages);
        break;

      case "eliza":
        response = await elizaProvider.respond(messages);
        break;

      default:
        throw new Error(`Unbekannter Provider: ${provider}`);
    }

    // Tool-Aufrufe erkennen & ausführen
    if (response?.tool_calls?.length) {
      const toolResults = await executeToolCalls(response.tool_calls);
      response.text += `\n\n${toolResults.join("\n")}`;
    }

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    log("error", "ChatService Fehler", { provider, error: message });

    if (FALLBACK_ENABLED) {
      log("info", "Fallback aktiviert", {
        fallbackProvider: FALLBACK_PROVIDER,
      });

      // Use Eliza as primary fallback, then simple fallback
      if (FALLBACK_PROVIDER === "eliza" && provider !== "eliza") {
        try {
          const elizaResponse = await elizaProvider.respond(messages);
          return {
            ...elizaResponse,
            meta: {
              ...elizaResponse.meta,
              originalProvider: provider,
              fallbackUsed: true,
            },
            errors: [message],
          };
        } catch (elizaError: unknown) {
          const elizaMessage =
            elizaError instanceof Error
              ? elizaError.message
              : String(elizaError);
          log("warn", "Eliza Fallback fehlgeschlagen", {
            error: elizaMessage,
          });
        }
      }

      // Simple fallback as last resort
      const fb = await callFallback(model, messages);
      const fbText =
        typeof fb === "string"
          ? fb
          : (getTextFromUnknown(fb) ?? "Fallback aktiv.");
      return {
        text: fbText,
        meta: {
          provider: "fallback",
          model,
          originalProvider: provider,
          fallbackUsed: true,
        },
        errors: [message],
      };
    }

    return {
      text: `❌ Fehler: ${message}`,
      errors: [message],
      meta: { provider, model },
    };
  }
}

/* ========================================================================== */
/* 🧰 Tool-Unterstützung                                                    */
/* ========================================================================== */

async function executeToolCalls(toolCalls: ToolCall[]): Promise<string[]> {
  const results: string[] = [];
  for (const call of toolCalls) {
    try {
      const result = await toolRegistry.call(call.name, call.parameters ?? {});
      results.push(formatToolSuccess(call.name, result));
    } catch (error: unknown) {
      results.push(formatToolError(call.name, error));
    }
  }
  return results;
}

/* ========================================================================== */
/* 🔁 Workflow-Unterstützung                                                */
/* ========================================================================== */

/**
 * Führt einen registrierten Workflow aus (mit Abwärtskompatibilität zu Legacy-Runnern).
 * @param name Name des Workflows
 * @param input Eingabedaten für den Workflow
 */
export async function handleWorkflow(
  name: string,
  input: Record<string, unknown> = {},
): Promise<AIResponse> {
  try {
    const runFn = resolveWorkflowRunner(workflowEngine);
    const result = await runFn(name, input);

    return {
      text: `Workflow "${name}" erfolgreich ausgeführt.`,
      data: result,
      meta: { provider: "workflowEngine", workflow: name },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "Workflow-Fehler", { name, error: message });
    return {
      text: `❌ Workflow-Fehler: ${message}`,
      errors: [message],
    };
  }
}

/* ========================================================================== */
/* 📊 Statusabfragen                                                       */
/* ========================================================================== */

/**
 * Liefert eine Übersicht, welche Provider basierend auf Konfiguration/Health erreichbar sind.
 */
export async function getProviderStatus(): Promise<
  { provider: ProviderName; available: boolean }[]
> {
  const providers: ProviderName[] = [
    "openai",
    "ollama",
    "vertex",
    "local",
    "huggingface",
    "custom",
  ];

  const results = await Promise.all(
    providers.map(async (p) => ({
      provider: p,
      available: await isProviderAvailable(p),
    })),
  );

  return results;
}

async function isProviderAvailable(provider: ProviderName): Promise<boolean> {
  try {
    switch (provider) {
      case "openai":
        return !!process.env.OPENAI_API_KEY;
      case "ollama": {
        const res = await fetch("http://localhost:11434/api/tags");
        return res.ok;
      }
      case "vertex":
        return !!process.env.VERTEX_API_KEY;
      case "huggingface":
        return !!process.env.HUGGINGFACEHUB_API_TOKEN;
      case "local":
        return true;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

/* ========================================================================== */
/* 🧾 Systeminfo                                                           */
/* ========================================================================== */

/**
 * Gibt aktuelle Chat-Subsystem-Informationen zurück (Provider, Tools, Workflows).
 */
export function getChatSystemInfo() {
  return {
    activeProvider: ACTIVE_PROVIDER,
    fallbackEnabled: FALLBACK_ENABLED,
    tools: toolRegistry.getToolDefinitions?.() ?? [],
    workflows: workflowEngine.getWorkflowDefinitions?.() ?? [],
  };
}

/* ========================================================================== */
/* ✅ Export                                                               */
/* ========================================================================== */

export default {
  handleChatRequest,
  handleWorkflow,
  getProviderStatus,
  getChatSystemInfo,
};

function formatToolSuccess(name: string, result: unknown): string {
  if (isRecord(result)) {
    return `✅ Tool "${name}" erfolgreich (${Object.keys(result).length} Felder).`;
  }
  if (typeof result === "string") {
    return `✅ Tool "${name}" erfolgreich: ${result}`;
  }
  return `✅ Tool "${name}" erfolgreich.`;
}

function formatToolError(name: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return `❌ Tool "${name}" Fehler: ${message}`;
}

function resolveWorkflowRunner(engine: WorkflowEngineLike): WorkflowRunner {
  const candidate = engine.runWorkflow || engine.execute || engine.start;
  if (typeof candidate !== "function") {
    throw new Error(
      "Workflow-Engine unterstützt keine runWorkflow/execute/start-Methode.",
    );
  }
  return candidate.bind(engine);
}

function getTextFromUnknown(value: unknown): string | undefined {
  if (isRecord(value) && typeof value.text === "string") {
    return value.text;
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeProvider(value: unknown): ProviderName {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    return isProviderName(normalized) ? normalized : ACTIVE_PROVIDER;
  }
  return ACTIVE_PROVIDER as ProviderName;
}

function isProviderName(value: string): value is ProviderName {
  return (
    value === "openai" ||
    value === "azure" ||
    value === "azureopenai" ||
    value === "vertex" ||
    value === "ollama" ||
    value === "huggingface" ||
    value === "local" ||
    value === "llama" ||
    value === "llamacpp" ||
    value === "custom" ||
    value === "eliza"
  );
}
