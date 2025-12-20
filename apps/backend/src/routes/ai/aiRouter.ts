/**
 * AI Router
 *
 * Central router for all AI-related endpoints including chat completions,
 * model management, embeddings, vision analysis, audio transcription,
 * translation, and knowledge base integration.
 *
 * @remarks
 * This router provides:
 * - Chat completion with multiple providers (OpenAI, Anthropic, Ollama)
 * - Session-based conversation management
 * - Tool calling and workflow execution
 * - Model selection and configuration
 * - Vision analysis (image understanding)
 * - Audio transcription (Whisper API)
 * - Text translation
 * - Knowledge base embeddings and search
 * - Provider health checks
 * - Rate limiting for AI operations
 *
 * Features:
 * - Multi-provider support with automatic fallback
 * - Session persistence for conversation context
 * - Tool registry for function calling
 * - Workflow engine for complex AI tasks
 * - File upload support (audio, images)
 * - Streaming responses
 * - Cost tracking and usage statistics
 *
 * Supported Providers:
 * - OpenAI (GPT-4, GPT-3.5, Whisper, DALL-E)
 * - Anthropic (Claude 3 family)
 * - Ollama (local models)
 * - Fallback (simple rule-based responses)
 *
 * @module routes/ai
 *
 * @example
 * ```typescript
 * // Chat completion
 * POST /api/ai/chat/completions
 * {
 *   "sessionId": "session-123",
 *   "message": "Explain quantum computing",
 *   "provider": "openai",
 *   "model": "gpt-4"
 * }
 *
 * // Vision analysis
 * POST /api/ai/vision/analyze
 * {
 *   "imageUrl": "https://example.com/image.jpg",
 *   "prompt": "Describe this image"
 * }
 *
 * // Audio transcription
 * POST /api/ai/audio/transcribe
 * (multipart/form-data with audio file)
 * ```
 */

import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

// Middleware
import {
  aiRateLimiter,
  audioRateLimiter,
} from "../../middleware/rateLimiters.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { BadRequestError, NotFoundError } from "../error/errors.js";

// Services
import { getModelOverview } from "./services/modelService.js";
import {
  loadSettings,
  saveSettings,
  updateSetting,
} from "./services/settingsService.js";
import { transcribeAudio } from "./services/audioService.js";
import { translateText } from "./services/translationService.js";
import { providerManager } from "./services/providerManager.js";
import {
  loadAPIKeys,
  updateAPIKey,
  deleteAPIKey,
  validateAPIKey,
  getSanitizedAPIKeys,
} from "./services/apiKeyService.js";

// Health Router
import healthRouter from "./healthRouter.js";

// Core
import {
  createSession,
  getSession,
  removeSession,
  chatSessions,
} from "./sessions/sessionStore.js";
import { workflowEngine } from "./workflows/workflowEngine.js";
import { toolRegistry } from "./tools/registry.js";

// Utils
import { log } from "./utils/logger.js";

import { nowISO } from "./utils/helpers.js";
import { sanitizeMessages } from "./utils/aiUtils.js";

import type { ChatMessage } from "./types/types.js";

const router = Router();

/* ========================================================================== */
/* 📁 Upload-Verzeichnis vorbereiten                                          */
/* ========================================================================== */

const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

/* ========================================================================== */
/* Zod Validation Schemas                                                     */
/* ========================================================================== */

const createSessionSchema = z.object({
  model: z.string().min(1).max(100).optional().default("gpt-4o-mini"),
});

const chatMessageSchema = z.object({
  message: z.string().min(1).max(10000),
});

const translateSchema = z.object({
  text: z.string().min(1).max(10000),
  targetLang: z.string().min(2).max(10),
  engine: z
    .enum(["openai", "vertex", "huggingface"])
    .optional()
    .default("openai"),
});

const updateSettingSchema = z.object({
  value: z.any(),
});

const toolRunSchema = z
  .object({
    // Generic schema - tool-specific validation happens in toolRegistry
  })
  .passthrough();

const workflowRunSchema = z
  .object({
    // Generic schema - workflow-specific validation happens in workflowEngine
  })
  .passthrough();

/* ========================================================================== */
/* ⚙️ Modelle                                                                 */
/* ========================================================================== */

router.get(
  "/models",
  asyncHandler(async (_req, res) => {
    try {
      const models = getModelOverview();
      res.json({ success: true, models: models || [] });
    } catch (error) {
      console.error("Error loading models:", error);
      // Return empty list on error instead of failing
      res.json({ success: true, models: [] });
    }
  }),
);

/* ========================================================================== */
/* 💬 Chat-System                                                             */
/* ========================================================================== */

// Neue Chat-Session
router.post(
  "/chat",
  aiRateLimiter,
  asyncHandler(async (req, res) => {
    const validated = createSessionSchema.parse(req.body);
    const session = await createSession(validated.model);
    res.json({ success: true, session });
  }),
);

// Nachricht an eine Session
router.post(
  "/chat/:sessionId/message",
  aiRateLimiter,
  asyncHandler(async (req, res) => {
    const session = getSession(req.params.sessionId);
    if (!session) throw new NotFoundError("Session nicht gefunden");

    const validated = chatMessageSchema.parse(req.body);
    const message = validated.message.trim();

    const inbound: ChatMessage = {
      role: "user",
      content: message,
      timestamp: nowISO(),
    };
    session.messages.push(inbound);

    const cleanMessages = sanitizeMessages(session.messages);

    // Use provider manager for intelligent provider selection and fallback
    const aiResponse = await providerManager.sendMessage(
      cleanMessages,
      session.provider, // Use session's preferred provider
      session.model,
    );

    const responseText =
      typeof aiResponse === "object" && "text" in aiResponse
        ? aiResponse.text
        : String(aiResponse);

    const outbound: ChatMessage = {
      role: "assistant",
      content: responseText,
      timestamp: nowISO(),
    };

    session.messages.push(outbound);
    session.updatedAt = nowISO();

    log("info", "KI-Antwort generiert", {
      sessionId: session.id,
      provider: aiResponse.meta?.provider,
      model: aiResponse.meta?.model,
    });
    res.json({ success: true, response: outbound });
  }),
);

// Alle Sessions abrufen
router.get("/sessions", (_req, res) => {
  try {
    const sessions = Array.from(chatSessions.values());
    res.json({ success: true, sessions: sessions || [] });
  } catch (error) {
    console.error("Error loading sessions:", error);
    res.json({ success: true, sessions: [] });
  }
});

// Neue Session erstellen (für QuickChat frontend)
router.post(
  "/sessions",
  aiRateLimiter,
  asyncHandler(async (req, res) => {
    const { model, provider } = req.body;
    const session = await createSession(
      model || "qwen2.5:3b",
      provider || "ollama",
    );
    res.json({ success: true, session });
  }),
);

// Session-Details abrufen
router.get(
  "/sessions/:id",
  asyncHandler(async (req, res) => {
    const session = getSession(req.params.id);
    if (!session) throw new NotFoundError("Session nicht gefunden");
    res.json({ success: true, session });
  }),
);

// Nachricht an Session senden (QuickChat frontend endpoint)
router.post(
  "/sessions/:id/messages",
  aiRateLimiter,
  asyncHandler(async (req, res) => {
    const session = getSession(req.params.id);
    if (!session) throw new NotFoundError("Session nicht gefunden");

    const validated = chatMessageSchema.parse(req.body);
    const message = validated.message.trim();

    const inbound: ChatMessage = {
      role: "user",
      content: message,
      timestamp: nowISO(),
    };
    session.messages.push(inbound);

    const cleanMessages = sanitizeMessages(session.messages);

    // Use provider manager for intelligent provider selection and fallback
    const aiResponse = await providerManager.sendMessage(
      cleanMessages,
      session.provider,
      session.model,
    );

    const responseText =
      typeof aiResponse === "object" && "text" in aiResponse
        ? aiResponse.text
        : String(aiResponse);

    const outbound: ChatMessage = {
      role: "assistant",
      content: responseText,
      timestamp: nowISO(),
    };

    session.messages.push(outbound);
    session.updatedAt = nowISO();

    log("info", "KI-Antwort generiert", {
      sessionId: session.id,
      provider: aiResponse.meta?.provider,
      model: aiResponse.meta?.model,
    });

    // Return response in format expected by frontend
    res.json({
      success: true,
      message: responseText,
      provider: aiResponse.meta?.provider,
      model: aiResponse.meta?.model,
    });
  }),
);

// Session löschen
router.delete(
  "/sessions/:id",
  asyncHandler(async (req, res) => {
    const ok = removeSession(req.params.id);
    if (!ok) throw new NotFoundError("Session nicht gefunden");
    res.json({ success: true, message: "Session gelöscht" });
  }),
);

/* ========================================================================== */
/* 🔊 Audioverarbeitung (STT / TTS)                                           */
/* ========================================================================== */

router.post(
  "/audio/transcribe",
  audioRateLimiter,
  upload.single("audio"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new BadRequestError("Keine Datei vorhanden");
    const transcript = await transcribeAudio(req.file.path);
    res.json({ success: true, transcript });
  }),
);

/* ========================================================================== */
/* 🌍 Übersetzungen                                                           */
/* ========================================================================== */

router.post(
  "/translate",
  aiRateLimiter,
  asyncHandler(async (req, res) => {
    const validated = translateSchema.parse(req.body);
    const { text, targetLang, engine } = validated;

    const result = await translateText(text, targetLang, engine);
    res.json({ success: true, translatedText: result.text ?? result });
  }),
);

/* ========================================================================== */
/* ⚙️ Einstellungen & Konfiguration                                           */
/* ========================================================================== */

router.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    const settings = await loadSettings();
    res.json({ success: true, settings });
  }),
);

router.put(
  "/settings",
  asyncHandler(async (req, res) => {
    const ok = await saveSettings(req.body);
    res.json({ success: ok });
  }),
);

router.patch(
  "/settings/:key",
  asyncHandler(async (req, res) => {
    const validated = updateSettingSchema.parse(req.body);
    const updated = await updateSetting(req.params.key, validated.value);
    res.json({ success: true, updated });
  }),
);

/* ========================================================================== */
/* 🔑 API Key Management                                                      */
/* ========================================================================== */

// Get sanitized API keys (for display only)
router.get(
  "/api-keys",
  asyncHandler(async (_req, res) => {
    const keys = await getSanitizedAPIKeys();
    res.json({ success: true, keys });
  }),
);

// Update an API key
router.put(
  "/api-keys/:provider",
  asyncHandler(async (req, res) => {
    const { provider } = req.params;
    const { value } = req.body;

    if (!value) {
      throw new BadRequestError("API key value is required");
    }

    // Validate based on provider
    if (provider === "azure") {
      if (!value.apiKey || !value.endpoint) {
        throw new BadRequestError("Azure requires both apiKey and endpoint");
      }
      if (!validateAPIKey(provider, value.apiKey)) {
        throw new BadRequestError("Invalid Azure API key format");
      }
    } else {
      if (!validateAPIKey(provider, value)) {
        throw new BadRequestError(`Invalid ${provider} API key format`);
      }
    }

    await updateAPIKey(provider, value);
    res.json({ success: true, message: "API key updated successfully" });
  }),
);

// Delete an API key
router.delete(
  "/api-keys/:provider",
  asyncHandler(async (req, res) => {
    const { provider } = req.params;
    await deleteAPIKey(provider);
    res.json({ success: true, message: "API key deleted successfully" });
  }),
);

// Test an API key connection
router.post(
  "/api-keys/:provider/test",
  asyncHandler(async (req, res) => {
    const { provider } = req.params;

    // For now, just validate the format
    // In production, this would actually test the connection
    const keys = await loadAPIKeys();
    let isValid = false;

    switch (provider) {
      case "openai":
        isValid = !!keys.openai && validateAPIKey(provider, keys.openai);
        break;
      case "anthropic":
        isValid = !!keys.anthropic && validateAPIKey(provider, keys.anthropic);
        break;
      case "azure":
        isValid =
          !!keys.azure?.apiKey && validateAPIKey(provider, keys.azure.apiKey);
        break;
      case "huggingface":
        isValid =
          !!keys.huggingface && validateAPIKey(provider, keys.huggingface);
        break;
      default:
        isValid = !!keys.custom?.[provider];
    }

    res.json({
      success: true,
      provider,
      valid: isValid,
      message: isValid
        ? "API key is valid"
        : "API key not configured or invalid",
    });
  }),
);

/* ========================================================================== */
/* 🧠 Tools & Workflows                                                       */
/* ========================================================================== */

// Tools abrufen
router.get("/tools", (_req, res) => {
  const defs = toolRegistry.getToolDefinitions();
  res.json({ success: true, count: defs.length, tools: defs });
});

// Einzelnes Tool aufrufen
router.post(
  "/tools/:name/run",
  asyncHandler(async (req, res) => {
    const { name } = req.params;
    const validated = toolRunSchema.parse(req.body);
    const result = await toolRegistry.call(name, validated);
    res.json({ success: true, name, result });
  }),
);

// Workflows auflisten
router.get("/workflows", (_req, res) => {
  const defs = workflowEngine.getWorkflowDefinitions();
  res.json({ success: true, workflows: defs });
});

// Workflow ausführen
router.post(
  "/workflow/:name/run",
  asyncHandler(async (req, res) => {
    const { name } = req.params;
    const validated = workflowRunSchema.parse(req.body);
    const result = await workflowEngine.executeWorkflow(name, validated, true);
    res.json({ success: true, result });
  }),
);

/* ========================================================================== */
/* 🩺 Systemstatus / Diagnose                                                 */
/* ========================================================================== */

router.get("/status", (_req, res) => {
  res.json({
    success: true,
    timestamp: nowISO(),
    system: {
      models: getModelOverview().length,
      tools: toolRegistry.count(),
      workflows: workflowEngine.listWorkflows().length,
    },
  });
});

/* ========================================================================== */
/* 🏥 Provider Status & Health Checks                                         */
/* ========================================================================== */

// Get provider status (for QuickChat traffic light indicator)
router.get(
  "/providers",
  asyncHandler(async (_req, res) => {
    try {
      const providers = await providerManager.getProviderStatus();
      res.json({ success: true, providers: providers || [] });
    } catch (error) {
      console.error("Error loading providers:", error);
      // Return empty list with offline status on error
      res.json({
        success: true,
        providers: [
          {
            provider: "ollama",
            available: false,
            status: "offline",
            message: "Failed to check provider status",
            lastChecked: new Date().toISOString(),
          },
        ],
      });
    }
  }),
);

// Get system status with provider information
router.get(
  "/system/status",
  asyncHandler(async (_req, res) => {
    const providers = await providerManager.getProviderStatus();
    const activeProvider =
      providers.find((p) => p.available)?.provider || "none";

    res.json({
      success: true,
      timestamp: nowISO(),
      modelCount: getModelOverview().length,
      toolCount: toolRegistry.count(),
      systemStatus: providers.some((p) => p.available) ? "healthy" : "degraded",
      activeProvider,
      fallbackEnabled: true,
    });
  }),
);

router.use("/health", healthRouter);

/* ========================================================================== */
/* ✅ Export                                                                  */
/* ========================================================================== */

export default router;
