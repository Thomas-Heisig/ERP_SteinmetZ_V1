/**
 * audioService.ts
 * ---------------------------------------------------------
 * Verwaltung und Verarbeitung von Audioeingaben.
 * Unterstützt Spracherkennung (Whisper) und Sprachausgabe (TTS).
 * Voll integriert in das ERP_SteinmetZ KI-Subsystem.
 */

import fs from "node:fs";
import path from "node:path";
import fetch from "node-fetch";
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
 */
export async function transcribeAudio(filePath: string): Promise<AIResponse> {
  if (!fs.existsSync(filePath)) {
    return { text: `❌ Datei nicht gefunden: ${filePath}` };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { text: "❌ OPENAI_API_KEY fehlt in den Umgebungsvariablen." };
  }

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
      body: formData as any,
      // @ts-expect-error – node-fetch erlaubt timeout
      timeout: audioConfig.timeout_ms,
    });

    if (!res.ok) {
      const errTxt = await res.text().catch(() => res.statusText);
      throw new Error(`HTTP ${res.status}: ${errTxt}`);
    }

    /* -------------------------------------------------------------
       Antwort sicher parsen: rawData ist unknown → zuerst prüfen
    ------------------------------------------------------------- */
    const rawData: unknown = await res.json();

    let textOut: string = "(Keine Transkription erhalten)";

    if (
      typeof rawData === "object" &&
      rawData !== null &&
      "text" in rawData &&
      typeof (rawData as any).text === "string"
    ) {
      textOut = (rawData as any).text;
    }

    log("info", "Transkription erfolgreich", {
      file: filePath,
      model: audioConfig.model,
    });

    return {
      text: textOut,
      meta: {
        provider: "openai",
        model: audioConfig.model,
        source: path.basename(filePath),
        time_ms: audioConfig.timeout_ms,
      },
    };
  } catch (err: any) {
    log("error", "Fehler bei Transkription", { error: err.message });

    return {
      text: `❌ Fehler bei Transkription: ${err.message}`,
      errors: [err.message],
      meta: {
        provider: "openai",
        model: audioConfig.model,
      },
    };
  }
}

/* ========================================================================== */
/* 🔊 Sprachausgabe (Text-to-Speech)                                         */
/* ========================================================================== */

/**
 * Erstellt Sprachdatei (TTS) aus Text.
 * Gibt Pfad zur erzeugten Datei zurück.
 */
export async function textToSpeech(
  text: string,
  outputPath: string = path.resolve("output", `tts_${Date.now()}.mp3`),
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY fehlt.");

  // Zielordner sicherstellen
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

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
      // @ts-expect-error – node-fetch timeout property
      timeout: audioConfig.timeout_ms,
    });

    if (!res.ok) {
      const errTxt = await res.text().catch(() => res.statusText);
      throw new Error(`TTS HTTP ${res.status}: ${errTxt}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    log("info", "TTS-Datei erstellt", {
      file: outputPath,
      size: buffer.length,
    });

    return outputPath;
  } catch (err: any) {
    log("error", "TTS-Fehler", { error: err.message });
    throw new Error(`❌ TTS-Fehler: ${err.message}`);
  }
}

/* ========================================================================== */
/* 🧩 Zusatzfunktionen                                                       */
/* ========================================================================== */

/**
 * Prüft, ob Whisper & TTS verfügbar sind.
 * Defensiv typisiert gegen unknown-JSON-Strukturen.
 */
export async function testAudioEndpoints(): Promise<Record<string, boolean>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { whisper: false, tts: false };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
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
    if (
      typeof raw === "object" &&
      raw !== null &&
      "data" in raw &&
      Array.isArray((raw as any).data)
    ) {
      const models = (raw as any).data as Array<{ id?: unknown }>;

      const ids = models
        .map((m) => (typeof m.id === "string" ? m.id : ""))
        .filter((id) => id.length > 0);

      whisperAvailable = ids.includes("whisper-1");
      ttsAvailable = ids.some((id) => id.includes("tts"));
    }

    return {
      whisper: whisperAvailable,
      tts: ttsAvailable,
    };
  } catch {
    return { whisper: false, tts: false };
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
