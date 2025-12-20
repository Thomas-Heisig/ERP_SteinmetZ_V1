/**
 * audioService.ts
 * ---------------------------------------------------------
 * Verwaltung und Verarbeitung von Audioeingaben.
 * Unterstützt Spracherkennung (Whisper) und Sprachausgabe (TTS).
 * Voll integriert in das ERP_SteinmetZ KI-Subsystem.
 */

import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import fetch from "node-fetch";
import type { BodyInit } from "node-fetch";
import FormData from "form-data"; // ✅ Wichtig: Node.js-FormData verwenden
import { log } from "../utils/logger.js";
import type { AIResponse, AIModuleConfig } from "../types/types.js";

/* ========================================================================== */
/* ⚙️ Konfiguration                                                          */
/* ========================================================================== */

export const audioConfig: AIModuleConfig = {
  name: "audioService",
  provider: "openai",
  model: process.env.AUDIO_MODEL ?? "whisper-1",
  description:
    "Audioverarbeitung: Speech-to-Text & Text-to-Speech (OpenAI Whisper + TTS)",
  capabilities: ["audio", "tools", "json"],
  active: true,
  timeout_ms: 120000, // 2 Minuten
};

/* ========================================================================== */
/* 🎙️ Spracherkennung (Whisper Speech-to-Text)                              */
/* ========================================================================== */

/**
 * Wandelt Audio (z. B. WAV, MP3, M4A) in Text um.
 * Typgesichert und defensiv, da die API-Struktur variieren kann.
 * @param filePath Absoluter oder relativer Pfad zur Audiodatei
 * @returns KI-Antwort mit Transkript oder Fehlerdetails
 */
export async function transcribeAudio(filePath: string): Promise<AIResponse> {
  if (!fs.existsSync(filePath)) {
    return { text: `❌ Datei nicht gefunden: ${filePath}` };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { text: "❌ OPENAI_API_KEY fehlt in den Umgebungsvariablen." };
  }

  const startedAt = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    audioConfig.timeout_ms,
  );

  try {
    const formData = new FormData();
    formData.append(
      "file",
      fs.createReadStream(filePath),
      path.basename(filePath),
    );
    formData.append("model", audioConfig.model);

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData as unknown as BodyInit,
      signal: controller.signal,
    });

    if (!res.ok) {
      const errTxt = await res.text().catch(() => res.statusText);
      throw new Error(`HTTP ${res.status}: ${errTxt}`);
    }

    /* -------------------------------------------------------------
       Antwort sicher parsen: rawData ist unknown → zuerst prüfen
    ------------------------------------------------------------- */
    const rawData: unknown = await res.json();
    const textOut = extractText(rawData);

    const durationMs = Math.round(performance.now() - startedAt);

    log("info", "Transkription erfolgreich", {
      file: filePath,
      model: audioConfig.model,
      duration_ms: durationMs,
    });

    return {
      text: textOut,
      meta: {
        provider: "openai",
        model: audioConfig.model,
        source: path.basename(filePath),
        time_ms: durationMs,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    log("error", "Fehler bei Transkription", {
      error: message,
      file: filePath,
    });

    return {
      text: `❌ Fehler bei Transkription: ${message}`,
      errors: [message],
      meta: {
        provider: "openai",
        model: audioConfig.model,
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ========================================================================== */
/* 🔊 Sprachausgabe (Text-to-Speech)                                         */
/* ========================================================================== */

/**
 * Erstellt Sprachdatei (TTS) aus Text.
 * Gibt Pfad zur erzeugten Datei zurück.
 * @param text Inhalt, der gesprochen werden soll
 * @param outputPath Zielpfad für die erzeugte Audiodatei
 * @returns Pfad zur geschriebenen Datei
 */
export async function textToSpeech(
  text: string,
  outputPath: string = path.resolve("output", `tts_${Date.now()}.mp3`),
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY fehlt.");

  // Zielordner sicherstellen
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const startedAt = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    audioConfig.timeout_ms,
  );

  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: process.env.TTS_VOICE ?? "alloy",
        input: text,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errTxt = await res.text().catch(() => res.statusText);
      throw new Error(`TTS HTTP ${res.status}: ${errTxt}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    const durationMs = Math.round(performance.now() - startedAt);

    log("info", "TTS-Datei erstellt", {
      file: outputPath,
      size: buffer.length,
      duration_ms: durationMs,
    });

    return outputPath;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    log("error", "TTS-Fehler", { error: message });
    throw new Error(`❌ TTS-Fehler: ${message}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ========================================================================== */
/* 🧩 Zusatzfunktionen                                                       */
/* ========================================================================== */

/**
 * Prüft, ob Whisper & TTS verfügbar sind.
 * Defensiv typisiert gegen unknown-JSON-Strukturen.
 * @returns Objekt mit Verfügbarkeitsflags für Whisper und TTS
 */
export async function testAudioEndpoints(): Promise<Record<string, boolean>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { whisper: false, tts: false };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    audioConfig.timeout_ms,
  );

  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });

    if (!res.ok) {
      return { whisper: false, tts: false };
    }

    // JSON sicher in 'unknown' einlesen
    const raw: unknown = await res.json();

    // Ergebnis-Initialisierung
    let whisperAvailable = false;
    let ttsAvailable = false;

    /* ---------------------------------------------------------
       Strukturprüfung: Erwartete Struktur ist:
       { data: [ { id: string }, ... ] }
       Diese Struktur wird defensiv verifiziert.
    --------------------------------------------------------- */
    if (isRecord(raw) && Array.isArray(raw.data)) {
      const ids = extractModelIds(raw.data);

      whisperAvailable = ids.includes("whisper-1");
      ttsAvailable = ids.some((id) => id.includes("tts"));
    }

    return {
      whisper: whisperAvailable,
      tts: ttsAvailable,
    };
  } catch {
    return { whisper: false, tts: false };
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ========================================================================== */
/* 🧾 Default-Export                                                         */
/* ========================================================================== */

export default {
  config: audioConfig,
  transcribeAudio,
  textToSpeech,
  testAudioEndpoints,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractText(payload: unknown): string {
  if (isRecord(payload) && typeof payload.text === "string") {
    return payload.text;
  }
  return "(Keine Transkription erhalten)";
}

function extractModelIds(models: unknown[]): string[] {
  return models
    .map((model) =>
      isRecord(model) && typeof model.id === "string" ? model.id : null,
    )
    .filter((id): id is string => Boolean(id));
}
