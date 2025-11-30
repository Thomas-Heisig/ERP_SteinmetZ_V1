/**
 * sessionStore.ts
 * ---------------------------------------------------------
 * Verwaltung von Chat-Sessions für das KI-System.
 * Unterstützt OpenAI, Vertex, Ollama usw.
 * 
 * Funktionen:
 *  - Erstellen, Laden, Löschen und Aktualisieren von Sessions
 *  - Persistente Speicherung (optional)
 *  - Nachrichtenverlauf, Metadaten, Tokenzählung
 */

import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { ChatMessage, AIResponse } from "../types/types.js";
import { log } from "../utils/logger.js";

/* ========================================================================== */
/* 📁 Speicherort / Konfiguration                                            */
/* ========================================================================== */

const SESSION_DIR = path.resolve("data", "sessions");
const PERSIST_SESSIONS = true; // Wenn true → speichert jede Session als Datei

if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

/* ========================================================================== */
/* 📦 Typdefinition                                                          */
/* ========================================================================== */

export interface ChatSession {
  id: string;
  model: string;
  provider?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  tokensUsed?: number;
  meta?: Record<string, any>;
}

/* ========================================================================== */
/* 🧠 In-Memory Store                                                        */
/* ========================================================================== */

export const chatSessions = new Map<string, ChatSession>();

/* ========================================================================== */
/* 🧩 Core-Methoden                                                          */
/* ========================================================================== */

/** Erstellt eine neue Session */
export async function createSession(model: string, provider = "unknown"): Promise<ChatSession> {
  const session: ChatSession = {
    id: `chat_${randomUUID()}`,
    model,
    provider,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tokensUsed: 0,
  };

  chatSessions.set(session.id, session);

  if (PERSIST_SESSIONS) saveSessionToFile(session);

  log("info", "Neue Chat-Session erstellt", { id: session.id, model, provider });
  return session;
}

/** Ruft eine Session ab */
export function getSession(id: string): ChatSession | null {
  return chatSessions.get(id) ?? null;
}

/** Aktualisiert eine Session */
export function updateSession(id: string, message: ChatMessage | AIResponse): ChatSession | null {
  const session = chatSessions.get(id);
  if (!session) return null;

  const msg: ChatMessage = "role" in message
    ? (message as ChatMessage)
    : { role: "assistant", content: (message as AIResponse).text ?? "(keine Antwort)" };

  session.messages.push(msg);
  session.updatedAt = new Date().toISOString();

  if (PERSIST_SESSIONS) saveSessionToFile(session);

  return session;
}

/** Löscht eine Session */
export function removeSession(id: string): boolean {
  if (PERSIST_SESSIONS) deleteSessionFile(id);
  return chatSessions.delete(id);
}

/** Listet alle Sessions */
export function listSessions(): ChatSession[] {
  return Array.from(chatSessions.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/* ========================================================================== */
/* 💾 Persistente Speicherung                                                */
/* ========================================================================== */

/** Schreibt Session auf Disk */
export function saveSessionToFile(session: ChatSession): void {
  try {
    const filePath = path.join(SESSION_DIR, `${session.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(session, null, 2), "utf8");
  } catch (err: any) {
    log("error", "Fehler beim Speichern der Session", { id: session.id, error: err.message });
  }
}

/** Lädt alle gespeicherten Sessions aus JSON-Dateien */
export function loadAllSessions(): number {
  if (!PERSIST_SESSIONS) return 0;
  if (!fs.existsSync(SESSION_DIR)) return 0;

  const files = fs.readdirSync(SESSION_DIR).filter(f => f.endsWith(".json"));
  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(SESSION_DIR, f), "utf8")) as ChatSession;
      chatSessions.set(data.id, data);
    } catch (err: any) {
      log("warn", "Konnte Session-Datei nicht laden", { file: f, error: err.message });
    }
  }

  log("info", "Sessions geladen", { count: chatSessions.size });
  return chatSessions.size;
}

/** Löscht eine gespeicherte Session-Datei */
export function deleteSessionFile(id: string): void {
  const filePath = path.join(SESSION_DIR, `${id}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

/* ========================================================================== */
/* 🔍 Utility-Funktionen                                                     */
/* ========================================================================== */

/** Filtert Sessions nach Modell oder Provider */
export function findSessions(filter: Partial<{ model: string; provider: string }>): ChatSession[] {
  return Array.from(chatSessions.values()).filter(s => {
    return (!filter.model || s.model === filter.model) &&
           (!filter.provider || s.provider === filter.provider);
  });
}

/** Bereinigt alte Sessions (z. B. älter als X Tage) */
export function cleanupOldSessions(maxAgeDays = 7): number {
  const now = Date.now();
  const threshold = maxAgeDays * 24 * 60 * 60 * 1000;
  let count = 0;

  for (const [id, session] of chatSessions.entries()) {
    const age = now - new Date(session.updatedAt).getTime();
    if (age > threshold) {
      removeSession(id);
      count++;
    }
  }

  if (count > 0) log("info", "Alte Sessions bereinigt", { count });
  return count;
}

/* ========================================================================== */
/* 🧾 Diagnose- & Statusfunktionen                                           */
/* ========================================================================== */

export function getSessionStatus() {
  return {
    total: chatSessions.size,
    persistent: PERSIST_SESSIONS,
    directory: SESSION_DIR,
    lastUpdated: new Date().toISOString(),
  };
}

/* ========================================================================== */
/* ✅ Initialisierung beim Start                                             */
/* ========================================================================== */

if (PERSIST_SESSIONS) {
  loadAllSessions();
  cleanupOldSessions(14); // ältere als 14 Tage entfernen
}

/* ========================================================================== */
/* ✅ Export                                                                 */
/* ========================================================================== */

export default {
  createSession,
  getSession,
  updateSession,
  removeSession,
  listSessions,
  findSessions,
  getSessionStatus,
  loadAllSessions,
  cleanupOldSessions,
};
