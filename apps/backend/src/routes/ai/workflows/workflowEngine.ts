/**
 * workflowEngine.ts
 * ---------------------------------------------------------
 * Universelle Workflow-Engine für das ERP-/KI-System.
 * Führt komplexe Prozessketten aus Tools, Bedingungen, Loops
 * und Kontextinteraktionen aus.
 */

import { createLogger } from "../../../utils/logger.js";
import { toolRegistry } from "../tools/registry.js";
import { ConversationContext } from "../context/conversationContext.js";
import { log } from "../utils/logger.js";
import { sanitizeString } from "../utils/helpers.js"; // <- sleep entfernt
import { validateSchema, logValidationErrors } from "../utils/validation.js";
import type {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowInput,
  WorkflowResult,
  WorkflowContext,
} from "../types/types.js";
import fs from "fs";
import path from "path";

const logger = createLogger("workflow-engine");

/* ========================================================================== */
/* 🧠 WorkflowEngine-Klasse                                                  */
/* ========================================================================== */

export class WorkflowEngine {
  private workflows = new Map<string, WorkflowDefinition>();
  private context!: ConversationContext; // erst später gesetzt

  async initialize() {
    const { ConversationContext } =
      await import("../context/conversationContext.js");
    this.context = new ConversationContext();
  }

  /* ─────────────────────────────────────────────
   * 🧩 Workflow-Registrierung (TOLERANTER)
   * ───────────────────────────────────────────── */
  registerWorkflow(name: string, def: WorkflowDefinition): void {
    // Vollständiges Schema für alle Keys der WorkflowDefinition
    // Die "?“ Suffixe nutzt deine validateSchema-Logik (allowOptional),
    // aber der Funktions-Parametertyp erlaubt sie nicht – deshalb enger Cast beim Aufruf unten.
    const schema = {
      id: "string?",
      name: "string?",
      description: "string?",
      steps: "array",
      on_error: "string?",
      metadata: "object?",
      category: "string?",
      version: "string?",
      created_at: "string?",
      tags: "array?",
      variables: "object?",
      enabled: "boolean?",
    } as const;

    const validation = validateSchema<WorkflowDefinition>(
      def,
      // enger Cast nur an dieser Stelle, damit die "?"-Marker verwendbar bleiben
      schema as unknown as Record<
        keyof WorkflowDefinition,
        "string" | "number" | "boolean" | "object" | "array"
      >,
      {
        allowExtra: true,
      },
    );

    if (!validation.valid) {
      logValidationErrors(`Workflow '${name}'`, validation.errors);
      log(
        "warn",
        `Workflow '${name}' hat Validierungsfehler, wird aber trotzdem registriert`,
        {
          errors: validation.errors,
        },
      );
    }

    // Zusätzliche Validierung für steps
    if (!def.steps || !Array.isArray(def.steps)) {
      throw new Error(`Workflow '${name}' muss ein steps-Array enthalten.`);
    }

    if (def.steps.length === 0) {
      log("warn", `Workflow '${name}' hat keine Schritte`);
    }

    // Normalisierung
    const normalizedDef = this.normalizeWorkflowDefinition(def);

    // Registrierung
    this.workflows.set(name, normalizedDef);

    log("info", `Workflow registriert: ${name}`, {
      steps: normalizedDef.steps.length,
      description: normalizedDef.description ?? "Keine Beschreibung",
      error_mode: normalizedDef.on_error ?? "stop",
      has_metadata: !!normalizedDef.metadata,
    });
  }

  /* ─────────────────────────────────────────────
   * 🔧 Normalisierung für verschiedene Formate
   * ───────────────────────────────────────────── */
  private normalizeWorkflowDefinition(
    def: WorkflowDefinition,
  ): WorkflowDefinition {
    const normalized: WorkflowDefinition = { ...def };

    // Steps normalisieren
    normalized.steps = def.steps.map((step) =>
      this.normalizeWorkflowStep(step),
    );

    // on_error prüfen
    if (
      normalized.on_error &&
      !["continue", "stop", "skip"].includes(normalized.on_error)
    ) {
      log(
        "warn",
        `Ungültiger on_error Wert: ${normalized.on_error}, verwende 'stop'`,
      );
      normalized.on_error = "stop";
    }

    // metadata sicherstellen
    if (!normalized.metadata) {
      normalized.metadata = {};
    }

    return normalized;
  }

  private normalizeWorkflowStep(step: WorkflowStep): WorkflowStep {
    const normalized: WorkflowStep = { ...step };

    // Legacy: action -> tool (proper type handling)
    if (normalized.action && !normalized.tool) {
      normalized.tool = normalized.action;
      log("debug", `Konvertiere action → tool (${normalized.tool})`);
    }

    // params sicherstellen
    if (!normalized.params) {
      normalized.params = {};
    }

    // Verschachtelte steps rekursiv normalisieren
    if (normalized.steps && Array.isArray(normalized.steps)) {
      normalized.steps = normalized.steps.map((nested) =>
        this.normalizeWorkflowStep(nested),
      );
    }

    return normalized;
  }

  /* ─────────────────────────────────────────────
   * 📚 Workflow-Abfragen
   * ───────────────────────────────────────────── */
  hasWorkflow(name: string): boolean {
    return this.workflows.has(name);
  }

  listWorkflows(): string[] {
    return Array.from(this.workflows.keys());
  }

  getWorkflowDefinitions() {
    return Array.from(this.workflows.entries()).map(([name, def]) => ({
      name,
      steps: def.steps.length,
      description: def.description ?? "Kein Beschreibungstext",
      on_error: def.on_error ?? "stop",
      metadata: def.metadata ?? {},
    }));
  }

  /* ─────────────────────────────────────────────
   * ⚙️ Workflow-Ausführung (ROBUSTER)
   * ───────────────────────────────────────────── */
  async executeWorkflow(
    name: string,
    input: WorkflowInput = {},
    debug = false,
  ): Promise<WorkflowResult> {
    const wf = this.workflows.get(name);
    if (!wf) {
      throw new Error(
        `Workflow '${name}' nicht gefunden. Verfügbar: ${this.listWorkflows().join(", ")}`,
      );
    }

    const contextVars: WorkflowContext = {
      input,
      last_result: null,
      timestamp: new Date().toISOString().replace(/[:.]/g, "-"),
    };
    const results: WorkflowResult[] = [];

    const dlog = (msg: string, data?: unknown) => {
      if (debug) logger.debug({ workflowName: name, data }, msg);
    };

    dlog(`Starte Workflow (${wf.steps.length} Schritte)...`);
    log("info", `Starte Workflow: ${name}`, {
      steps: wf.steps.length,
      input_keys: Object.keys(input),
    });

    for (let i = 0; i < wf.steps.length; i++) {
      const step = wf.steps[i];
      const stepNumber = i + 1;

      try {
        const stepDesc = `${step.type}${step.tool ? `:${step.tool}` : ""}`;
        dlog(`[${stepNumber}/${wf.steps.length}] → Schritt: ${stepDesc}`);

        const result = await this.executeSingleStep(
          step,
          contextVars,
          name,
          debug,
        );
        if (result !== undefined) {
          results.push({ step: stepDesc, result });
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        dlog(`❌ Fehler in Schritt ${stepNumber}: ${error.message}`);

        log("error", `Fehler in Workflow-Schritt`, {
          workflow: name,
          step_number: stepNumber,
          step_type: step.type,
          error: error.message,
        });

        const errorMode = wf.on_error ?? "stop";

        if (errorMode === "stop") {
          throw new Error(
            `Workflow '${name}' gestoppt bei Schritt ${stepNumber}: ${err.message}`,
          );
        } else if (errorMode === "skip") {
          dlog(`⏭️  Überspringe restliche Schritte aufgrund von Fehler`);
          break;
        } else if (errorMode === "continue") {
          dlog(`➡️  Setze Workflow trotz Fehler fort`);
          continue;
        }
      }
    }

    log("info", `✅ Workflow '${name}' abgeschlossen`, {
      results: results.length,
      success: true,
    });

    return {
      success: true,
      workflow: name,
      results,
      context: contextVars,
      executed_steps: results.length,
    };
  }

  /* ─────────────────────────────────────────────
   * ⚡ Einzelschritt-Ausführung
   * ───────────────────────────────────────────── */
  private async executeSingleStep(
    step: WorkflowStep,
    contextVars: WorkflowContext,
    workflowName: string,
    debug = false,
  ): Promise<WorkflowResult> {
    const dlog = (msg: string, data?: unknown) => {
      if (debug) logger.debug({ workflowName, data }, msg);
    };

    switch (step.type) {
      case "tool_call": {
        if (!step.tool) {
          throw new Error("Toolname fehlt in tool_call Schritt.");
        }

        if (!toolRegistry.has(step.tool)) {
          throw new Error(
            `Tool '${step.tool}' nicht registriert. Verfügbar: ${toolRegistry.list().join(", ")}`,
          );
        }

        const resolvedParams = this.interpolateParams(
          step.params ?? {},
          contextVars,
        );
        dlog(`Tool '${step.tool}' aufrufen mit Parametern:`, resolvedParams);

        const result = await toolRegistry.call(step.tool, resolvedParams);

        contextVars.last_result = result;
        if (step.variable) {
          contextVars[step.variable] = result;
          dlog(`Ergebnis in Variable '${step.variable}' gespeichert`);
        }

        dlog(`Tool '${step.tool}' erfolgreich ausgeführt.`, result);
        return result;
      }

      case "if": {
        const cond = step.condition ?? "";
        const condResult = this.evaluateCondition(cond, contextVars);
        dlog(`Bedingung '${cond}' → ${condResult}`);

        if (condResult && step.steps) {
          dlog(`Führe ${step.steps.length} verschachtelte Schritte aus...`);
          const nestedResults = await this.executeSteps(
            step.steps,
            contextVars,
            debug,
          );
          dlog(
            `Verschachtelte Schritte abgeschlossen: ${nestedResults.length} Ergebnisse`,
          );
          return nestedResults;
        }
        return null;
      }

      case "loop": {
        const list = this.interpolate(step.params?.list ?? [], contextVars);
        if (!Array.isArray(list)) {
          throw new Error("Loop-Parameter 'list' ist keine Liste.");
        }

        dlog(`Starte Schleife über ${list.length} Elemente...`);
        const loopResults: unknown[] = [];

        for (let j = 0; j < list.length; j++) {
          const item = list[j];
          contextVars.item = item;
          contextVars.index = j;

          dlog(`[${j + 1}/${list.length}] Schleifen-Durchlauf`);
          const nested = await this.executeSteps(
            step.steps ?? [],
            contextVars,
            debug,
          );
          loopResults.push(...nested);
        }

        delete contextVars.item;
        delete contextVars.index;
        dlog(`Schleife abgeschlossen: ${loopResults.length} Ergebnisse`);
        return loopResults;
      }

      case "workflow_call": {
        if (!step.tool) {
          throw new Error("Subworkflow-Name fehlt in workflow_call.");
        }

        dlog(`Rufe Subworkflow '${step.tool}' auf...`);
        const subInput = this.interpolateParams(step.params ?? {}, contextVars);
        const subResult = await this.executeWorkflow(
          step.tool,
          subInput,
          debug,
        );

        contextVars.last_result = subResult;
        dlog(`Subworkflow '${step.tool}' abgeschlossen`);
        return subResult;
      }

      case "context_update": {
        const updates = step.params ?? {};
        const resolvedUpdates = this.interpolateParams(updates, contextVars);

        Object.entries(resolvedUpdates).forEach(([k, v]) => {
          this.context.set(k, v);
          contextVars[k] = v; // Auch im lokalen Kontext verfügbar
        });

        dlog(`Kontext aktualisiert: ${Object.keys(updates).join(", ")}`);
        return { updated: Object.keys(updates) };
      }

      case "log": {
        const rawMessage = step.message ?? "Log-Schritt";
        const resolvedMessage = this.interpolate(rawMessage, contextVars);
        const sanitizedMessage = sanitizeString(resolvedMessage);

        log("info", `[WF:${workflowName}] ${sanitizedMessage}`);
        dlog(`LOG: ${sanitizedMessage}`);
        return { logged: sanitizedMessage };
      }

      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error(`Unbekannter Schritt-Typ: ${(step as any).type}`);
    }
  }

  /* ─────────────────────────────────────────────
   * 🔁 Interne Hilfsfunktionen
   * ───────────────────────────────────────────── */

  private async executeSteps(
    steps: WorkflowStep[],
    contextVars: Record<string, unknown>,
    debug = false,
  ) {
    const nestedResults: unknown[] = [];
    for (const step of steps) {
      const res = await this.executeSingleStep(
        step,
        contextVars,
        "nested",
        debug,
      );
      if (res !== undefined && res !== null) {
        nestedResults.push(res);
      }
    }
    return nestedResults;
  }

  private interpolateParams(
    params: Record<string, unknown>,
    context: Record<string, unknown>,
  ): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params)) {
      resolved[key] = this.interpolate(value, context);
    }
    return resolved;
  }

  private interpolate(value: unknown, context: Record<string, unknown>): unknown {
    if (typeof value === "string") {
      return value.replace(/\{\{(.*?)\}\}/g, (_, expr) => {
        try {
          const path = expr.trim().split(".");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let ref: any = context;
          for (const p of path) ref = ref?.[p];
          return ref ?? `{{${expr}}}`; // Falls nicht gefunden, Original zurückgeben
        } catch {
          return `{{${expr}}}`; // Falls Fehler, Original zurückgeben
        }
      });
    } else if (Array.isArray(value)) {
      return value.map((item) => this.interpolate(item, context));
    } else if (typeof value === "object" && value !== null) {
      return this.interpolateParams(value as Record<string, unknown>, context);
    }
    return value;
  }

  private evaluateCondition(
    expr: string,
    context: Record<string, unknown>,
  ): boolean {
    try {
      const replaced = this.interpolate(expr, context);

      // Einfache, sichere Auswertung für häufige Fälle
      if (replaced === "true" || replaced === "1") return true;
      if (replaced === "false" || replaced === "0") return false;

      // Zahlenvergleiche
      const numberCompare = replaced.match(/^(\d+)\s*([<>]=?|==)\s*(\d+)$/);
      if (numberCompare) {
        const [, left, operator, right] = numberCompare;
        const leftNum = parseFloat(left);
        const rightNum = parseFloat(right);

        switch (operator) {
          case ">":
            return leftNum > rightNum;
          case ">=":
            return leftNum >= rightNum;
          case "<":
            return leftNum < rightNum;
          case "<=":
            return leftNum <= rightNum;
          case "==":
            return leftNum === rightNum;
        }
      }

      // Sicherheitswarnung: In Produktion sollte dies durch einen sicheren Parser ersetzt werden
      // Für Entwicklung verwenden wir Function als Fallback
      return Function('"use strict"; return (' + replaced + ")")();
    } catch {
      log("warn", `Konnte Bedingung nicht auswerten: ${expr}`);
      return false;
    }
  }

  /* ─────────────────────────────────────────────
   * 💾 Export / Import
   * ───────────────────────────────────────────── */
  exportWorkflows(): unknown {
    return Array.from(this.workflows.entries()).map(([name, def]) => ({
      name,
      def: this.normalizeWorkflowDefinition(def),
    }));
  }

  importWorkflows(data: unknown[]): void {
    let imported = 0;
    let skipped = 0;

    for (const wf of data) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const name = (wf as any).name || (wf as any).def?.name;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (name && (wf as any).def) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.registerWorkflow(name, (wf as any).def);
          imported++;
        } else {
          skipped++;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        log("error", `Fehler beim Import von Workflow`, { error: message });
        skipped++;
      }
    }

    log("info", `Workflow-Import abgeschlossen`, { imported, skipped });
  }

  clear(): void {
    const count = this.workflows.size;
    this.workflows.clear();
    log("info", `Alle Workflows gelöscht`, { previous_count: count });
  }
}

/* ========================================================================== */
/* 🌍 Globale Instanz & Beispielworkflow                                     */
/* ========================================================================== */
export const workflowEngine = new WorkflowEngine();

// Pfad zur externen JSON-Definition
const workflowPath = path.resolve("src/routes/ai/workflows/data_export.json");

// Versuche, den Workflow aus JSON zu laden
try {
  if (fs.existsSync(workflowPath)) {
    const rawData = fs.readFileSync(workflowPath, "utf8");
    const jsonDef = JSON.parse(rawData);

    workflowEngine.registerWorkflow(jsonDef.name || "data_export", {
      id: "wf_data_export_001",
      name: jsonDef.name || "data_export",
      description:
        jsonDef.description ||
        "Exportiert strukturierte Daten aus Tabellen oder Modulen",
      on_error: jsonDef.on_error || "continue",
      metadata: {
        author: jsonDef.metadata?.author || "Thomas Heisig",
        version: jsonDef.metadata?.version || "1.1",
        created: jsonDef.metadata?.created || new Date().toISOString(),
        last_modified:
          jsonDef.metadata?.last_modified || new Date().toISOString(),
        category: jsonDef.metadata?.category || "data_processing",
      },
      category: jsonDef.metadata?.category || "data_processing",
      version: jsonDef.metadata?.version || "1.1",
      created_at: new Date().toISOString(),
      tags: ["export", "orders", "csv", "notification"],
      variables: {},
      enabled: true,
      steps: jsonDef.steps || [],
    });

    log("info", "Workflow 'data_export' erfolgreich aus JSON registriert", {
      steps: jsonDef.steps?.length || 0,
      author: jsonDef.metadata?.author,
      version: jsonDef.metadata?.version,
    });
  } else {
    log("warn", "Workflow-Datei data_export.json wurde nicht gefunden.");
  }
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  log("error", "Fehler beim Laden des Workflows 'data_export'", {
    error: message,
  });
}
