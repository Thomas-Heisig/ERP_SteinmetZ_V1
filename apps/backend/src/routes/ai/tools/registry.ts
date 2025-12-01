/**
 * registry.ts
 * ---------------------------------------------------------
 * Erweiterte, rückwärtskompatible Tool-Registry für das ERP-/KI-System.
 * Verwaltet Tool-Definitionen, sichere Aufrufe, Events, Sandbox und Debugging.
 */

import fs from "node:fs";
import path from "node:path";
import { log } from "../utils/logger.js";

/* ===================================================================== */
/* 🧠 Typdefinitionen                                                    */
/* ===================================================================== */

/**
 * ToolFunction:
 * Asynchrone Funktion mit optionalen Metadaten, die von der ToolRegistry verwaltet wird.
 */
export type ToolFunction = ((params?: Record<string, any>) => Promise<any>) & {
  description?: string;
  parameters?: Record<string, any>;
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
  parameters?: Record<string, any>;
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
  private readonly listeners: Record<string, ((info: any) => void)[]> = {};
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
    params: Record<string, any> = {},
    opts: { timeout?: number; sandbox?: boolean; source?: string } = {},
  ): Promise<any> {
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
    } catch (err: any) {
      const msg = err?.message ?? String(err);
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
    handler: (info: any) => void,
  ) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  emit(event: string, data: any): void {
    (this.listeners[event] ?? []).forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        log(
          "warn",
          `Listener-Fehler für Event '${event}': ${(err as Error).message}`,
        );
      }
    });
  }

  /* ─────────────────────────────────────────────
   * 🔄 Export / Import
   * ───────────────────────────────────────────── */

  exportRegistry(): any {
    return {
      meta: this.meta,
      tools: this.getToolDefinitions(),
      aliases: Object.fromEntries(this.aliases.entries()),
    };
  }

  importRegistry(data: any): void {
    if (!data?.tools || !Array.isArray(data.tools)) {
      throw new Error("Ungültiges Registry-Importformat.");
    }
    this.clear();
    for (const t of data.tools) {
      const fn = (async () => ({})) as ToolFunction;
      fn.description = t.description ?? `Importiertes Tool ${t.name}`;
      fn.parameters = t.parameters ?? {};
      fn.category = t.category ?? "general";
      fn.version = t.version ?? "1.0";
      fn.restricted = t.restricted ?? false;
      fn.registeredAt = new Date().toISOString();
      this.tools.set(t.name, fn);
    }
    if (data.aliases) {
      for (const [a, target] of Object.entries(data.aliases)) {
        if (typeof target === "string") this.aliases.set(a, target);
      }
    }
    this.meta.lastUpdated = new Date().toISOString();
  }

  /* ─────────────────────────────────────────────
   * 🧩 Integration (Any-to-Any / Workflow)
   * ───────────────────────────────────────────── */

  async routeAnyToAny(source: string, target: string, payload: any) {
    log("info", `🔄 Any-to-Any Call: ${source} → ${target}`, { payload });
    if (this.has(target)) return await this.call(target, payload);
    log("warn", `Ziel '${target}' unbekannt.`);
    return { success: false, error: `Unbekanntes Ziel: ${target}` };
  }

  /* ─────────────────────────────────────────────
   * 🧾 Debugging & Monitoring
   * ───────────────────────────────────────────── */

  debugPrint(): void {
    const defs = this.getToolDefinitions();
    if (defs.length === 0) {
      console.log("⚠️  Keine Tools registriert.");
      return;
    }

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
