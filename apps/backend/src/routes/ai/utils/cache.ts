/**
 * cache.ts
 * ---------------------------------------------------------
 * Asynchroner In-Memory-Cache mit optionaler Dateipersistenz.
 * Für KI-Abfragen, Modelle, Tool-Resultate usw.
 *
 * Unterstützt:
 *  - TTL-basierte Ablaufsteuerung
 *  - automatisches Cleanup
 *  - optionale Dateispeicherung
 *  - Hash-basierte Schlüssel (prompt+model)
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { log } from "../utils/logger.js";
import { createHashId } from "./aiUtils.js";

/* ========================================================================== */
/* 📦 Cache-Grundstruktur                                                     */
/* ========================================================================== */

interface CacheEntry<T = any> {
  key: string;
  value: T;
  createdAt: number;
  expiresAt?: number;
}

interface CacheOptions {
  ttl?: number; // Ablaufzeit in Millisekunden
  persistent?: boolean; // Speichern auf Festplatte
  namespace?: string; // Logische Gruppierung (z. B. "openai" / "embedding")
}

/* ========================================================================== */
/* 🧠 Cache-Klasse                                                            */
/* ========================================================================== */

export class AICache {
  private cache = new Map<string, CacheEntry>();
  private readonly baseDir = path.resolve("data", "ai_cache");

  constructor() {
    if (!fs.existsSync(this.baseDir))
      fs.mkdirSync(this.baseDir, { recursive: true });
    this.startCleanup();
  }

  /* ─────────────────────────────────────────────
   * 🧩 Schlüsselverwaltung
   * ───────────────────────────────────────────── */

  /**
   * Erstellt deterministischen Cache-Schlüssel.
   * Kombiniert Model, Prompt und Zusatzoptionen.
   */
  generateKey(model: string, input: any, opts: CacheOptions = {}): string {
    const data = JSON.stringify({
      model,
      input,
      ns: opts.namespace ?? "default",
    });
    return createHashId(data);
  }

  /**
   * Prüft, ob ein Eintrag existiert und gültig ist.
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /* ─────────────────────────────────────────────
   * 💾 Lesen / Schreiben
   * ───────────────────────────────────────────── */

  /**
   * Speichert Wert im Cache (optional persistent).
   */
  set<T>(key: string, value: T, opts: CacheOptions = {}): void {
    const ttl = opts.ttl ?? 5 * 60 * 1000; // Default: 5 Minuten
    const entry: CacheEntry = {
      key,
      value,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(key, entry);

    if (opts.persistent) {
      const filePath = this.getFilePath(key);
      try {
        fs.writeFileSync(filePath, JSON.stringify(entry, null, 2), "utf8");
      } catch (err: any) {
        log("warn", "Cache konnte nicht gespeichert werden", {
          filePath,
          error: err.message,
        });
      }
    }
  }

  /**
   * Ruft Wert aus Cache ab, falls vorhanden.
   * Wenn persistent, wird auch aus Datei gelesen.
   */
  get<T>(key: string, persistent = false): T | null {
    const entry = this.cache.get(key);
    if (entry && (!entry.expiresAt || Date.now() < entry.expiresAt)) {
      return entry.value as T;
    }

    if (persistent) {
      const filePath = this.getFilePath(key);
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(
            fs.readFileSync(filePath, "utf8"),
          ) as CacheEntry;
          if (!data.expiresAt || Date.now() < data.expiresAt) {
            this.cache.set(key, data);
            return data.value as T;
          }
        } catch (err: any) {
          log("error", "Fehler beim Lesen aus Cache-Datei", {
            error: err.message,
          });
        }
      }
    }

    return null;
  }

  /**
   * Entfernt spezifischen Schlüssel.
   */
  delete(key: string): boolean {
    const removed = this.cache.delete(key);
    const filePath = this.getFilePath(key);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return removed;
  }

  /**
   * Löscht gesamten Cache.
   */
  clear(): void {
    this.cache.clear();
    if (fs.existsSync(this.baseDir)) {
      for (const f of fs.readdirSync(this.baseDir)) {
        try {
          fs.unlinkSync(path.join(this.baseDir, f));
        } catch {}
      }
    }
  }

  /* ─────────────────────────────────────────────
   * 🧹 Cleanup
   * ───────────────────────────────────────────── */

  private startCleanup(interval = 60_000): void {
    setInterval(() => this.cleanupExpired(), interval).unref();
  }

  private cleanupExpired(): void {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.cache.delete(key);
        removed++;
      }
    }
    if (removed > 0) {
      log(
        "info",
        `🧹 Cache bereinigt: ${removed} abgelaufene Einträge entfernt.`,
      );
    }
  }

  /* ─────────────────────────────────────────────
   * 🧭 Utility
   * ───────────────────────────────────────────── */

  private getFilePath(key: string): string {
    return path.join(this.baseDir, `${key}.json`);
  }

  /**
   * Gibt Cache-Statistik aus.
   */
  stats() {
    return {
      entries: this.cache.size,
      baseDir: this.baseDir,
      oldest: this.getOldestEntryAge(),
    };
  }

  private getOldestEntryAge(): string {
    const times = Array.from(this.cache.values()).map((e) => e.createdAt);
    if (times.length === 0) return "leer";
    const oldest = Math.min(...times);
    const diff = Math.round((Date.now() - oldest) / 1000);
    return `${diff}s`;
  }
}

/* ========================================================================== */
/* 🧠 Globale Instanz & Helper                                               */
/* ========================================================================== */

export const aiCache = new AICache();

/**
 * Cached Wrapper um eine asynchrone Funktion.
 * Beispiel: `await cached("myKey", () => callOpenAI(...))`
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  opts: CacheOptions = {},
): Promise<T> {
  const hit = aiCache.get<T>(key, opts.persistent);
  if (hit !== null) {
    log("info", `✅ Cache-Hit: ${key}`);
    return hit;
  }

  const result = await fn();
  aiCache.set(key, result, opts);
  log("info", `💾 Cache-Miss → gespeichert: ${key}`);
  return result;
}

/* ========================================================================== */
/* ✅ Export                                                                 */
/* ========================================================================== */

export default {
  aiCache,
  cached,
  AICache,
};
