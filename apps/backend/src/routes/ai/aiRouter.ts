/**
 * aiRouter.ts
 * ---------------------------------------------------------
 * Zentraler Express-Router für alle KI-bezogenen Endpunkte.
 * Bindet Services, Workflows, Tools und Sessions ein.
 */

import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

// Services
import { getModelOverview } from "./services/modelService.js";
import { loadSettings, saveSettings, updateSetting } from "./services/settingsService.js";
import { transcribeAudio } from "./services/audioService.js";
import { translateText } from "./services/translationService.js";

// Core
import { createSession, getSession, removeSession, chatSessions } from "./sessions/sessionStore.js";
import { workflowEngine } from "./workflows/workflowEngine.js";
import { toolRegistry } from "./tools/registry.js";

// Utils
import { log } from "./utils/logger.js";
import { errorResponse } from "./utils/errors.js";

import { nowISO } from "./utils/helpers.js";
import { sanitizeMessages } from "./utils/aiUtils.js";

// Provider (Fallback)
import generateAIResponse from "./providers/fallbackProvider.js";

import type { ChatMessage } from "./types/types.js";



const router = Router();

/* ========================================================================== */
/* 📁 Upload-Verzeichnis vorbereiten                                          */
/* ========================================================================== */

const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

/* ========================================================================== */
/* ⚙️ Modelle                                                                 */
/* ========================================================================== */

router.get("/models", async (_req, res) => {
  try {
    const models = await getModelOverview();
    res.json({ success: true, models });
  } catch (err: any) {
    errorResponse(res, 500, "Fehler beim Abrufen der Modelle", err);
  }
});

/* ========================================================================== */
/* 💬 Chat-System                                                             */
/* ========================================================================== */

// Neue Chat-Session
router.post("/chat", async (req, res) => {
  try {
    const model = req.body?.model ?? "gpt-4o-mini";
    const session = await createSession(model);
    res.json({ success: true, session });
  } catch (err: any) {
    errorResponse(res, 400, "Fehler beim Erstellen der Chat-Session", err);
  }
});

// Nachricht an eine Session
router.post("/chat/:sessionId/message", async (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return errorResponse(res, 404, "Session nicht gefunden");

  const message = String(req.body?.message ?? "").trim();
  if (!message) return errorResponse(res, 400, "Nachricht darf nicht leer sein");

  const inbound: ChatMessage = {
    role: "user",
    content: message,
    timestamp: nowISO(),
  };
  session.messages.push(inbound);

  try {
    const cleanMessages = sanitizeMessages(session.messages);
    const aiResponse = await generateAIResponse(session.model, cleanMessages);

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

    log("info", "KI-Antwort generiert", { sessionId: session.id });
    res.json({ success: true, response: outbound });
  } catch (err: any) {
    errorResponse(res, 500, "Fehler beim Verarbeiten der KI-Anfrage", err);
  }
});

// Alle Sessions abrufen
router.get("/sessions", (_req, res) => {
  res.json({ success: true, sessions: Array.from(chatSessions.values()) });
});

// Session löschen
router.delete("/chat/:sessionId", (req, res) => {
  const ok = removeSession(req.params.sessionId);
  if (!ok) return errorResponse(res, 404, "Session nicht gefunden");
  res.json({ success: true, message: "Session gelöscht" });
});

/* ========================================================================== */
/* 🔊 Audioverarbeitung (STT / TTS)                                           */
/* ========================================================================== */

router.post("/audio/transcribe", upload.single("audio"), async (req, res) => {
  if (!req.file) return errorResponse(res, 400, "Keine Datei vorhanden");
  try {
    const transcript = await transcribeAudio(req.file.path);
    res.json({ success: true, transcript });
  } catch (err: any) {
    errorResponse(res, 500, "Fehler bei der Audioverarbeitung", err);
  }
});

/* ========================================================================== */
/* 🌍 Übersetzungen                                                           */
/* ========================================================================== */

router.post("/translate", async (req, res) => {
  const { text, targetLang, engine = "openai" } = req.body;
  if (!text || !targetLang)
    return errorResponse(res, 400, "Fehlende Parameter: text, targetLang");

  try {
    const result = await translateText(text, targetLang, engine);
    res.json({ success: true, translatedText: result.text ?? result });
  } catch (err: any) {
    errorResponse(res, 500, "Übersetzungsfehler", err);
  }
});

/* ========================================================================== */
/* ⚙️ Einstellungen & Konfiguration                                           */
/* ========================================================================== */

router.get("/settings", async (_req, res) => {
  try {
    const settings = await loadSettings();
    res.json({ success: true, settings });
  } catch (err: any) {
    errorResponse(res, 500, "Fehler beim Laden der Einstellungen", err);
  }
});

router.put("/settings", async (req, res) => {
  try {
    const ok = await saveSettings(req.body);
    res.json({ success: ok });
  } catch (err: any) {
    errorResponse(res, 500, "Fehler beim Speichern der Einstellungen", err);
  }
});

router.patch("/settings/:key", async (req, res) => {
  try {
    const updated = await updateSetting(req.params.key, req.body?.value);
    res.json({ success: true, updated });
  } catch (err: any) {
    errorResponse(res, 500, "Fehler beim Aktualisieren einer Einstellung", err);
  }
});

/* ========================================================================== */
/* 🧠 Tools & Workflows                                                       */
/* ========================================================================== */

// Tools abrufen
router.get("/tools", (_req, res) => {
  const defs = toolRegistry.getToolDefinitions();
  res.json({ success: true, count: defs.length, tools: defs });
});

// Einzelnes Tool aufrufen
router.post("/tools/:name/run", async (req, res) => {
  const { name } = req.params;
  try {
    const result = await toolRegistry.call(name, req.body ?? {});
    res.json({ success: true, name, result });
  } catch (err: any) {
    errorResponse(res, 500, `Fehler beim Ausführen von Tool '${name}'`, err);
  }
});

// Workflows auflisten
router.get("/workflows", (_req, res) => {
  const defs = workflowEngine.getWorkflowDefinitions();
  res.json({ success: true, workflows: defs });
});

// Workflow ausführen
router.post("/workflow/:name/run", async (req, res) => {
  const { name } = req.params;
  try {
    const result = await workflowEngine.executeWorkflow(name, req.body ?? {}, true);
    res.json({ success: true, result });
  } catch (err: any) {
    errorResponse(res, 500, `Fehler beim Ausführen von Workflow '${name}'`, err);
  }
});

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
/* ✅ Export                                                                  */
/* ========================================================================== */

export default router;
