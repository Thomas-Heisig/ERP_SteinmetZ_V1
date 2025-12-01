/**
 * aiUtils.ts
 * ---------------------------------------------------------
 * Allgemeine KI-Dienstprogramme:
 *  - Nachrichtenvalidierung & Bereinigung
 *  - Timeout-Handling für API-Aufrufe
 *  - Textanalyse & Sicherheitsprüfung
 *  - Tokenabschätzung & Trunkierung
 *  - Systemprotokollierung für KI-Events
 */

import crypto from "node:crypto";
import type { ChatMessage, AIResponse } from "../types/types.js";
import { log } from "../utils/logger.js";

/* ========================================================================== */
/* 🧩 Nachrichten-Validierung & Bereinigung                                   */
/* ========================================================================== */

/**
 * Entfernt ungültige Rollen und erzwingt ein sicheres Nachrichtenformat.
 */
export function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter((m) => ["system", "user", "assistant"].includes(m.role))
    .map((m) => ({
      role: m.role as "system" | "user" | "assistant",
      content: String(m.content).trim(),
    }));
}

/**
 * Kürzt überlange Nachrichten, entfernt sensible Datenmuster
 * (z. B. API-Schlüssel, Token, Passwörter).
 */
export function normalizeMessageContent(
  content: string,
  maxLength = 4000,
): string {
  if (!content) return "";
  let clean = content;

  // Entferne API-Keys und Tokens
  clean = clean.replace(
    /[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/g,
    "[REDACTED_TOKEN]",
  );
  clean = clean.replace(/(sk-|api-|key-|token-|secret-)\w+/gi, "[REDACTED]");

  // Trimmen und kürzen
  clean = clean.trim();
  if (clean.length > maxLength) clean = clean.slice(0, maxLength) + "…";

  return clean;
}

/**
 * Führt Sanitize + Normalize zusammen durch.
 */
export function sanitizeAndNormalize(messages: ChatMessage[]): ChatMessage[] {
  return sanitizeMessages(messages).map((m) => ({
    ...m,
    content: normalizeMessageContent(m.content),
  }));
}

/* ========================================================================== */
/* 🕒 Timeout-Wrapper                                                         */
/* ========================================================================== */

/**
 * Führt ein Promise mit Timeout aus, wirft bei Ablauf einen Fehler.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms = 10000,
  label = "Operation",
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} Timeout nach ${ms} ms`)),
      ms,
    );
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

/* ========================================================================== */
/* 🧠 Token-Abschätzung & Trunkierung                                        */
/* ========================================================================== */

/**
 * Sehr einfache Token-Schätzung (≈ 1 Token ≈ 4 Zeichen englischer Text).
 * Kann bei Bedarf später durch tiktoken ersetzt werden.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Kürzt Nachrichten so, dass eine maximale Tokenanzahl nicht überschritten wird.
 */
export function truncateMessages(
  messages: ChatMessage[],
  maxTokens = 8000,
): ChatMessage[] {
  let total = 0;
  const result: ChatMessage[] = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const tokens = estimateTokens(msg.content);
    if (total + tokens > maxTokens) break;
    total += tokens;
    result.unshift(msg);
  }

  return result;
}

/* ========================================================================== */
/* 🔒 Sicherheits- & Qualitätsprüfung                                        */
/* ========================================================================== */

/**
 * Prüft Inhalte auf potenziell unsichere oder sensible Informationen.
 * Keine Zensur, nur Markierung.
 */
export function analyzeTextSecurity(text: string): {
  safe: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (/password|token|api[_-]?key/i.test(text))
    issues.push("Sensibler Schlüssel oder Passwort erkannt");
  if (/<script|<\/script>/i.test(text))
    issues.push("HTML/Script-Code gefunden");
  if (/DROP\s+TABLE|DELETE\s+FROM/i.test(text))
    issues.push("SQL-Schlüsselwörter erkannt");
  if (/SELECT\s+\*|INSERT\s+INTO/i.test(text))
    issues.push("SQL-Anweisung im Text");

  return { safe: issues.length === 0, issues };
}

/**
 * Führt eine Sicherheitsprüfung über alle ChatMessages durch.
 */
export function validateConversation(messages: ChatMessage[]): {
  safe: boolean;
  issues: string[];
} {
  const allIssues: string[] = [];
  for (const msg of messages) {
    const { issues } = analyzeTextSecurity(msg.content);
    if (issues.length > 0) allIssues.push(`[${msg.role}] ${issues.join(", ")}`);
  }
  return { safe: allIssues.length === 0, issues: allIssues };
}

/* ========================================================================== */
/* 🧾 Logging & Analyse-Helfer                                               */
/* ========================================================================== */

/**
 * Erstellt eine einheitliche Hash-ID (z. B. für deduplizierte Logs oder Cache).
 */
export function createHashId(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 16);
}

/**
 * Erstellt einen Auswertungsbericht für eine KI-Antwort.
 */
export function analyzeAIResponse(response: AIResponse) {
  const text = response.text ?? "";
  const length = text.length;
  const tokens = estimateTokens(text);
  const safeCheck = analyzeTextSecurity(text);

  return {
    model: response.meta?.model ?? "unbekannt",
    provider: response.meta?.provider ?? "n/a",
    tokens,
    length,
    safe: safeCheck.safe,
    issues: safeCheck.issues,
    time_ms: response.meta?.time_ms ?? null,
  };
}

/* ========================================================================== */
/* 🧠 KI-Debugging-Helfer                                                   */
/* ========================================================================== */

/**
 * Gibt eine KI-Antwort schön formatiert im Log aus.
 */
export function debugAIResponse(label: string, response: AIResponse): void {
  const summary = analyzeAIResponse(response);
  log("info", `🔍 [${label}] KI-Antwort`, {
    model: summary.model,
    provider: summary.provider,
    tokens: summary.tokens,
    safe: summary.safe,
    issues: summary.issues,
    time_ms: summary.time_ms,
  });
}

/**
 * Misst die Laufzeit einer Funktion (Benchmark).
 */
export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<{ result: T; time_ms: number }> {
  const start = performance.now();
  const result = await fn();
  const time_ms = Math.round(performance.now() - start);
  log("info", `⏱️ Benchmark [${label}]`, { time_ms });
  return { result, time_ms };
}

/* ========================================================================== */
/* ✅ Export                                                                */
/* ========================================================================== */

export default {
  sanitizeMessages,
  sanitizeAndNormalize,
  normalizeMessageContent,
  withTimeout,
  estimateTokens,
  truncateMessages,
  analyzeTextSecurity,
  validateConversation,
  analyzeAIResponse,
  debugAIResponse,
  createHashId,
  measureAsync,
};
