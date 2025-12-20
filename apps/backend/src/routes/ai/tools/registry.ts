/**
 * registry.ts
 * ---------------------------------------------------------
 * Erweiterte, rückwärtskompatible Tool-Registry für das ERP-/KI-System.
 * Verwaltet Tool-Definitionen, sichere Aufrufe, Events, Sandbox und Debugging.
 */

import { createLogger } from "../../../utils/logger.js";
import { log } from "../utils/logger.js";

const logger = createLogger("tool-registry");

/* ===================================================================== */
/* 🧠 Typdefinitionen                                                    */
/* ===================================================================== */

/**
 * ToolFunction:
 * Asynchrone Funktion mit optionalen Metadaten, die von der ToolRegistry verwaltet wird.
 */
export type ToolFunction = ((params?: Record<string, unknown>) => Promise<unknown>) & {
  description?: string;
  parameters?: Record<string, unknown>;
  category?: string;
  version?: string;
  restricted?: boolean;
  registeredAt?: string;
};

/**
 * ToolMetadata:
 * Vereinheitlichte Metadaten für Anzeige, Export, Verwaltung.
 */
export interface ToolMetadata {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
  category?: string;
  version?: string;
  restricted?: boolean;
  registeredAt?: string | null;
}

/* ===================================================================== */
/* 🧠 Zentrale Registry                                                  */
/* ===================================================================== */

export class ToolRegistry {
  private readonly tools = new Map<string, ToolFunction>();
  private readonly aliases = new Map<string, string>();
  private readonly listeners: Record<string, ((info: unknown) => void)[]> = {};
  private readonly meta = {
    version: "2.7",
    lastUpdated: new Date().toISOString(),
  };

  /* ─────────────────────────────────────────────
   * 🔧 Registrierung & Verwaltung
   * ───────────────────────────────────────────── */

  register(name: string, fn: ToolFunction, alias?: string | string[]): void {
    if (typeof fn !== "function") {
      throw new TypeError(`Ungültiges Tool '${name}': keine Funktion.`);
    }

    // Sichere Standardwerte
    fn.registeredAt = new Date().toISOString();
    fn.description =
      fn.description ?? `Tool ${name} (keine Beschreibung vorhanden)`;
    fn.parameters = fn.parameters ?? {};
    fn.category = fn.category ?? "general";
    fn.version = fn.version ?? "1.0";
    fn.restricted = fn.restricted ?? false;

    this.tools.set(name, fn);
    this.meta.lastUpdated = fn.registeredAt;

    if (alias) {
      const arr = Array.isArray(alias) ? alias : [alias];
      for (const a of arr) this.aliases.set(a, name);
    }

    this.emit("register", { name, alias });
    log(
      "info",
      `Tool registriert: ${name}${alias ? ` (Alias: ${alias})` : ""}`,
    );
  }

  async registerAsync(
    name: string,
    fnPromise: Promise<ToolFunction>,
    alias?: string,
  ): Promise<void> {
    const fn = await fnPromise;
    this.register(name, fn, alias);
  }

  unregister(name: string): boolean {
    const removed = this.tools.delete(name);
    this.meta.lastUpdated = new Date().toISOString();
    if (removed) this.emit("unregister", { name });
    return removed;
  }

  clear(): void {
    this.tools.clear();
    this.aliases.clear();
    this.meta.lastUpdated = new Date().toISOString();
    this.emit("clear", {});
  }

  has(name: string): boolean {
    return this.tools.has(name) || this.aliases.has(name);
  }

  get(name: string): ToolFunction | undefined {
    const realName = this.aliases.get(name) ?? name;
    return this.tools.get(realName);
  }

  count(): number {
    return this.tools.size;
  }

  list(): string[] {
    return Array.from(this.tools.keys());
  }

  getAliases(): Record<string, string> {
    return Object.fromEntries(this.aliases.entries());
  }

  /* ─────────────────────────────────────────────
   * ⚙️ Sicherer Aufruf (mit Timeout)
   * ───────────────────────────────────────────── */

  async call(
    name: string,
    params: Record<string, unknown> = {},
    opts: { timeout?: number; sandbox?: boolean; source?: string } = {},
  ): Promise<unknown> {
    const realName = this.aliases.get(name) ?? name;
    const tool = this.tools.get(realName);
    if (!tool) {
      const available = Array.from(this.tools.keys()).join(", ") || "keine";
      throw new Error(
        `Tool '${name}' nicht gefunden. Verfügbare Tools: ${available}`,
      );
    }

    const start = Date.now();
    this.emit("beforeCall", { name: realName, params });

    try {
      const result = await Promise.race([
        tool(params),
        opts.timeout
          ? new Promise((_r, reject) =>
              setTimeout(
                () => reject(new Error(`Timeout nach ${opts.timeout} ms`)),
                opts.timeout,
              ),
            )
          : new Promise(() => {}),
      ]);

      const duration = Date.now() - start;
      this.emit("afterCall", { name: realName, duration, success: true });
      return result;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      this.emit("afterCall", { name: realName, success: false, error: msg });
      log("error", `Tool '${realName}' Fehler`, { msg });
      throw new Error(`Fehler beim Ausführen von '${realName}': ${msg}`);
    }
  }

  /* ─────────────────────────────────────────────
   * 🧩 Übersicht & Suche
   * ───────────────────────────────────────────── */

  getToolDefinitions(): ToolMetadata[] {
    return Array.from(this.tools.entries()).map(([name, fn]) => ({
      name,
      description: fn.description ?? `Führt ${name} aus.`,
      parameters: fn.parameters ?? {},
      category: fn.category ?? "general",
      version: fn.version ?? "1.0",
      restricted: fn.restricted ?? false,
      registeredAt: fn.registeredAt ?? null,
    }));
  }

  getToolsByCategory(): Record<string, ToolMetadata[]> {
    const grouped: Record<string, ToolMetadata[]> = {};
    for (const def of this.getToolDefinitions()) {
      const cat = def.category ?? "uncategorized";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(def);
    }
    return grouped;
  }

  findTools(keyword: string): string[] {
    const key = keyword.toLowerCase();
    return this.getToolDefinitions()
      .filter(
        (t) =>
          t.name.toLowerCase().includes(key) ||
          (t.description?.toLowerCase().includes(key) ?? false) ||
          (t.category?.toLowerCase().includes(key) ?? false),
      )
      .map((t) => t.name);
  }

  /* ─────────────────────────────────────────────
   * 🧠 Ereignisbehandlung (Hooks)
   * ───────────────────────────────────────────── */

  on(
    event: "register" | "beforeCall" | "afterCall" | "unregister" | "clear",
    handler: (info: unknown) => void,
  ) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  emit(event: string, data: unknown): void {
    (this.listeners[event] ?? []).forEach((cb) => {
      try {
        cb(data);
      } catch (error: unknown) {
        log("warn", `Listener-Fehler für Event '${event}': ${getErrorMessage(error)}`);
      }
    });
  }

  /* ─────────────────────────────────────────────
   * 🔄 Export / Import
   * ───────────────────────────────────────────── */

  exportRegistry(): {
    meta: { version: string; lastUpdated: string };
    tools: ToolMetadata[];
    aliases: Record<string, string>;
  } {
    return {
      meta: this.meta,
      tools: this.getToolDefinitions(),
      aliases: Object.fromEntries(this.aliases.entries()),
    };
  }

  importRegistry(data: unknown): void {
    if (!isRecord(data) || !Array.isArray((data as Record<string, unknown>).tools)) {
      throw new Error("Ungültiges Registry-Importformat.");
    }
    this.clear();
    const tools = (data as Record<string, unknown>).tools as Array<Record<string, unknown>>;
    for (const t of tools) {
      const fn = (async () => ({})) as ToolFunction;
      const name = typeof t.name === "string" ? t.name : `imported_${Date.now()}`;
      fn.description = (t.description as string) ?? `Importiertes Tool ${name}`;
      fn.parameters = (t.parameters as Record<string, unknown>) ?? {};
      fn.category = (t.category as string) ?? "general";
      fn.version = (t.version as string) ?? "1.0";
      fn.restricted = Boolean(t.restricted);
      fn.registeredAt = new Date().toISOString();
      this.tools.set(name, fn);
    }
    const aliases = (data as Record<string, unknown>).aliases;
    if (isRecord(aliases)) {
      for (const [a, target] of Object.entries(aliases)) {
        if (typeof target === "string") this.aliases.set(a, target);
      }
    }
    this.meta.lastUpdated = new Date().toISOString();
  }

  /* ─────────────────────────────────────────────
   * 🧩 Integration (Any-to-Any / Workflow)
   * ───────────────────────────────────────────── */

  async routeAnyToAny(source: string, target: string, payload: unknown) {
    log("info", `🔄 Any-to-Any Call: ${source} → ${target}`, { payload });
    if (this.has(target)) {
      const params =
        typeof payload === "object" && payload !== null
          ? (payload as Record<string, unknown>)
          : {};
      return await this.call(target, params);
    }
    log("warn", `Ziel '${target}' unbekannt.`);
    return { success: false, error: `Unbekanntes Ziel: ${target}` };
  }

  /* ─────────────────────────────────────────────
   * 🧾 Debugging & Monitoring
   * ───────────────────────────────────────────── */

  debugPrint(): void {
    const defs = this.getToolDefinitions();
    if (defs.length === 0) {
      logger.warn("No tools registered");
      return;
    }

    logger.info(
      {
        tools: defs.map((t) => ({
          name: t.name,
          category: t.category,
          restricted: t.restricted,
        })),
      },
      "Registered tools",
    );
    // Log tool table for debugging (only in development)
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.table(
        defs.map((t) => ({
          Name: t.name,
          Kategorie: t.category ?? "—",
          Beschreibung: t.description ?? "—",
          Parameter: Object.keys(t.parameters || {}).join(", ") || "–",
          Version: t.version ?? "—",
          Eingeschränkt: t.restricted ? "Ja" : "Nein",
        })),
      );
    }
  }

  getRegistryInfo() {
    return {
      totalTools: this.tools.size,
      lastUpdated: this.meta.lastUpdated,
      version: this.meta.version,
      categories: Object.keys(this.getToolsByCategory()),
      aliases: this.getAliases(),
    };
  }
}

/** 🧭 Globale Instanz */
export const toolRegistry = new ToolRegistry();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : JSON.stringify(error);
}
