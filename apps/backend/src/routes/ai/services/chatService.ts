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

const ACTIVE_PROVIDER = process.env.AI_PROVIDER?.toLowerCase() ?? "ollama";
const FALLBACK_ENABLED = process.env.AI_FALLBACK_ENABLED === "1";
const FALLBACK_PROVIDER =
  process.env.AI_FALLBACK_PROVIDER?.toLowerCase() ?? "eliza";

/* ========================================================================== */
/* 🧠 Chat-Handler                                                           */
/* ========================================================================== */

export async function handleChatRequest(
  model: string,
  messages: ChatMessage[],
  options: Record<string, any> = {},
): Promise<AIResponse> {
  const provider = options.provider?.toLowerCase() ?? ACTIVE_PROVIDER;

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
  } catch (err: any) {
    log("error", "ChatService Fehler", { provider, error: err.message });

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
            errors: [err.message],
          };
        } catch (elizaErr: any) {
          log("warn", "Eliza Fallback fehlgeschlagen", {
            error: elizaErr.message,
          });
        }
      }

      // Simple fallback as last resort
      const fb = await callFallback(model, messages);
      const fbText =
        typeof fb === "string" ? fb : ((fb as any)?.text ?? "Fallback aktiv.");
      return {
        text: fbText,
        meta: {
          provider: "fallback",
          model,
          originalProvider: provider,
          fallbackUsed: true,
        },
        errors: [err.message],
      };
    }

    return {
      text: `❌ Fehler: ${err.message}`,
      errors: [err.message],
      meta: { provider, model },
    };
  }
}

/* ========================================================================== */
/* 🧰 Tool-Unterstützung                                                    */
/* ========================================================================== */

async function executeToolCalls(
  toolCalls: { name: string; parameters?: Record<string, any> }[],
): Promise<string[]> {
  const results: string[] = [];
  for (const call of toolCalls) {
    try {
      const res = await toolRegistry.call(call.name, call.parameters ?? {});
      results.push(
        `✅ Tool "${call.name}" erfolgreich (${Object.keys(res).length} Felder).`,
      );
    } catch (err: any) {
      results.push(`❌ Tool "${call.name}" Fehler: ${err.message}`);
    }
  }
  return results;
}

/* ========================================================================== */
/* 🔁 Workflow-Unterstützung                                                */
/* ========================================================================== */

export async function handleWorkflow(
  name: string,
  input: Record<string, any> = {},
): Promise<AIResponse> {
  try {
    const runFn =
      (workflowEngine as any).runWorkflow ||
      (workflowEngine as any).execute ||
      (workflowEngine as any).start;

    if (typeof runFn !== "function") {
      throw new Error(
        "Workflow-Engine unterstützt keine runWorkflow/execute-Methode.",
      );
    }

    const result = await runFn.call(workflowEngine, name, input);

    return {
      text: `Workflow "${name}" erfolgreich ausgeführt.`,
      data: result,
      meta: { provider: "workflowEngine", workflow: name },
    };
  } catch (err: any) {
    log("error", "Workflow-Fehler", { name, error: err.message });
    return {
      text: `❌ Workflow-Fehler: ${err.message}`,
      errors: [err.message],
    };
  }
}

/* ========================================================================== */
/* 📊 Statusabfragen                                                       */
/* ========================================================================== */

export async function getProviderStatus(): Promise<
  { provider: string; available: boolean }[]
> {
  const providers = [
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

async function isProviderAvailable(provider: string): Promise<boolean> {
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
