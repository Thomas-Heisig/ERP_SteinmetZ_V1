/**
 * conversationContext.ts
 * ---------------------------------------------------------
 * Erweiterte Kontext- und Themenanalyse für ERP-, KI- und Systemdialoge.
 * Erkennt Themen, Stimmung, Intention, Benutzerpräferenzen und reagiert auf
 * vordefinierte Muster aus context.json (ehem. fallbackAI.json).
 *
 * Kompatibel mit Tool- und Workflow-Systemen.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createLogger } from "../../../utils/logger.js";
import type {
  ChatMessage,
  ConversationState,
  ElizaRule,
  MessageCategory,
} from "../types/types.js";
import { toolRegistry } from "../tools/registry.js";
import { workflowEngine } from "../workflows/workflowEngine.js";

const logger = createLogger("conversation-context");

/* ========================================================================== */
/* 📦 Erweiterte Datentypen */
/* ========================================================================== */

interface LoadedContextData {
  reflections?: Record<string, string>;
  eliza_rules?: ElizaRule[];
  metadata?: {
    version?: string;
    last_updated?: string;
    description?: string;
  };
}

interface ContextStats {
  messageCount: number;
  topicSwitches: number;
  lastTopic: string | null;
  rulesTriggered: number;
  toolsExecuted: number;
  workflowsExecuted: number;
  averageResponseTime: number;
}

interface TopicPattern {
  name: string;
  regex: RegExp;
  category: MessageCategory;
  priority: number;
}

/* ========================================================================== */
/* 🧠 Hauptklasse - VERBESSERT */
/* ========================================================================== */

export class ConversationContext {
  private context = new Map<string, any>();
  private history: ChatMessage[] = [];
  private userPreferences = new Map<string, any>();
  private stats: ContextStats = {
    messageCount: 0,
    topicSwitches: 0,
    lastTopic: null,
    rulesTriggered: 0,
    toolsExecuted: 0,
    workflowsExecuted: 0,
    averageResponseTime: 0,
  };

  private reflections: Record<string, string> = {};
  private rules: ElizaRule[] = [];
  private metadata: Record<string, any> = {};

  // Erweiterte Themenanalyse mit Kategorien
  private topicPatterns: TopicPattern[] = [
    {
      name: "orders",
      regex: /\b(bestellung|auftrag|order|angebot|purchase)\b/i,
      category: "orders",
      priority: 1,
    },
    {
      name: "inventory",
      regex: /\b(lager|bestand|inventar|stock|warehouse)\b/i,
      category: "inventory",
      priority: 1,
    },
    {
      name: "customers",
      regex: /\b(kunde|kundin|customer|client|klient)\b/i,
      category: "customers",
      priority: 1,
    },
    {
      name: "invoices",
      regex: /\b(rechnung|zahlung|invoice|payment|bill)\b/i,
      category: "invoices",
      priority: 1,
    },
    {
      name: "database",
      regex: /\b(datenbank|sqlite|db|query|table|sql|database)\b/i,
      category: "database",
      priority: 2,
    },
    {
      name: "file",
      regex: /\b(datei|file|verzeichnis|lesen|schreiben|pfad|directory)\b/i,
      category: "file_operations",
      priority: 2,
    },
    {
      name: "ai",
      regex: /\b(ki|ai|modell|prompt|workflow|tool|analyse|llm)\b/i,
      category: "ai",
      priority: 2,
    },
    {
      name: "system",
      regex: /\b(system|cpu|ram|server|diagnose|uptime|monitoring)\b/i,
      category: "system_monitoring",
      priority: 3,
    },
    {
      name: "code",
      regex:
        /\b(code|funktion|klasse|typescript|javascript|python|programmierung)\b/i,
      category: "code",
      priority: 3,
    },
    {
      name: "finance",
      regex: /\b(gewinn|kosten|umsatz|buchhaltung|finance|revenue)\b/i,
      category: "pricing",
      priority: 2,
    },
    {
      name: "communication",
      regex: /\b(chat|nachricht|kommunikation|dialog|message)\b/i,
      category: "communication",
      priority: 3,
    },
    {
      name: "greetings",
      regex: /\b(hallo|guten\s+(tag|morgen)|hello|hi|hey)\b/i,
      category: "greetings",
      priority: 0,
    },
    {
      name: "thanks",
      regex: /\b(danke|thanks|thank you|vielen dank)\b/i,
      category: "thanks",
      priority: 0,
    },
    {
      name: "goodbye",
      regex: /\b(tschüss|auf wiedersehen|bye|goodbye|bis\s+bald)\b/i,
      category: "goodbye",
      priority: 0,
    },
    {
      name: "calculations",
      regex: /\b(berechne|rechne|ermittle|kalkuliere|calculate)\b/i,
      category: "calculations",
      priority: 2,
    },
    {
      name: "security",
      regex: /\b(sicherheit|passwort|login|authentifizierung|security)\b/i,
      category: "system_security",
      priority: 3,
    },
  ];

  private responseTimes: number[] = [];

  constructor() {
    this.loadContextFile();
    this.initializeDefaultContext();
  }

  /* ======================================================================== */
  /* 🔄 Kontextdateien laden - VERBESSERT & ROBUSTER                         */
  /* ======================================================================== */

  private loadContextFile(): void {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const baseDir = __dirname;
      const dataDir = path.join(baseDir, "data");

      logger.info({ baseDir, dataDir }, "Loading context data from /data/");

      const combined: Required<LoadedContextData> = {
        reflections: {},
        eliza_rules: [],
        metadata: {},
      };

      if (!fs.existsSync(dataDir)) {
        logger.warn({ dataDir }, "Directory not found, using fallback context");
        this.initializeFallbackContext();
        return;
      }

      const files = fs
        .readdirSync(dataDir)
        .filter((f) => f.toLowerCase().endsWith(".json"))
        .sort((a, b) => {
          // Sortiere nach Nummerierung für konsistente Ladereihenfolge
          const numA = parseInt(a.split("_")[0]) || 0;
          const numB = parseInt(b.split("_")[0]) || 0;
          return numA - numB;
        });

      if (files.length === 0) {
        logger.warn({ dataDir }, "No JSON files found in directory, using fallback context");
        this.initializeFallbackContext();
        return;
      }

      logger.info({ fileCount: files.length }, "Found JSON context files");

      for (const file of files) {
        const fullPath = path.join(dataDir, file);
        try {
          const raw = fs.readFileSync(fullPath, "utf8");
          const parsed = JSON.parse(raw) as LoadedContextData;

          // Validierung der geladenen Daten
          if (this.validateContextData(parsed, file)) {
            const reflections = parsed.reflections ?? {};
            const rules = parsed.eliza_rules ?? [];
            const metadata = parsed.metadata ?? {};

            if (Object.keys(reflections).length > 0) {
              Object.assign(combined.reflections, reflections);
              logger.debug(
                { file, reflectionCount: Object.keys(reflections).length },
                "Loaded reflections from file",
              );
            }

            if (rules.length > 0) {
              combined.eliza_rules.push(...rules);
              console.log(`   ➕ Regeln aus ${file}: ${rules.length}`);
            }

            if (Object.keys(metadata).length > 0) {
              Object.assign(combined.metadata, metadata);
            }
          }
        } catch (err: any) {
          console.warn(`   ⚠️ Fehler beim Laden von ${file}: ${err.message}`);
        }
      }

      this.reflections = combined.reflections;
      this.rules = combined.eliza_rules;
      this.metadata = combined.metadata;

      const totalRules = this.rules.length;
      const totalReflections = Object.keys(this.reflections).length;

      if (totalRules === 0 && totalReflections === 0) {
        console.warn(
          "⚠️ [CONTEXT] Keine gültigen Regeln oder Reflexionen geladen, verwende Fallback!",
        );
        this.initializeFallbackContext();
      } else {
        console.log(
          `✅ [CONTEXT] Gesamtdaten geladen: ${totalRules} Regeln, ${totalReflections} Reflexionen`,
        );

        // Aktive Regeln für Debugging loggen
        const activeRules = this.rules.filter((rule) => rule.enabled !== false);
        console.log(`   📊 Aktive Regeln: ${activeRules.length}/${totalRules}`);
      }
    } catch (err: any) {
      console.error(
        "❌ [CONTEXT] Kritischer Fehler beim Laden der Kontextdaten:",
        err.message,
      );
      this.initializeFallbackContext();
    }
  }

  private validateContextData(data: any, filename: string): boolean {
    if (typeof data !== "object" || data === null) {
      console.warn(`   ⚠️ Ungültige Daten in ${filename}: Kein Objekt`);
      return false;
    }

    // Validiere reflections
    if (data.reflections && typeof data.reflections !== "object") {
      console.warn(`   ⚠️ Ungültige reflections in ${filename}`);
      return false;
    }

    // Validiere rules
    if (data.eliza_rules && !Array.isArray(data.eliza_rules)) {
      console.warn(`   ⚠️ Ungültige eliza_rules in ${filename}: Kein Array`);
      return false;
    }

    if (data.eliza_rules) {
      for (const rule of data.eliza_rules) {
        if (!rule.pattern || !Array.isArray(rule.replies)) {
          console.warn(`   ⚠️ Ungültige Regelstruktur in ${filename}`);
          return false;
        }
      }
    }

    return true;
  }

  private initializeFallbackContext(): void {
    console.log("🔄 [CONTEXT] Initialisiere Fallback-Kontext");

    this.reflections = {
      ich: "du",
      mir: "dir",
      mich: "dich",
      mein: "dein",
      meine: "deine",
      bin: "bist",
    };

    this.rules = [
      {
        pattern: "hallo|guten tag|hello",
        replies: [
          "Hallo! Wie kann ich Ihnen helfen?",
          "Guten Tag! Was kann ich für Sie tun?",
        ],
        enabled: true,
        priority: 1,
      },
      {
        pattern: "danke|vielen dank|thanks",
        replies: ["Gern geschehen!", "Keine Ursache!", "Immer wieder gerne!"],
        enabled: true,
        priority: 1,
      },
    ];

    this.metadata = {
      version: "1.0.0-fallback",
      description: "Fallback-Kontext für Notfälle",
      last_updated: new Date().toISOString(),
    };
  }

  private initializeDefaultContext(): void {
    // Setze Standardwerte für Kontext
    this.set("system.initialized", true);
    this.set("system.start_time", new Date().toISOString());
    this.set("conversation.phase", "initial");
    this.set("user.experience_level", "unknown");
  }

  /* ======================================================================== */
  /* 🧩 Reflexionssystem - VERBESSERT                                        */
  /* ======================================================================== */

  private applyReflections(text: string): string {
    if (!text || typeof text !== "string") return text;

    let result = text;
    for (const [key, value] of Object.entries(this.reflections)) {
      try {
        const regex = new RegExp(`\\b${key}\\b`, "gi");
        result = result.replace(regex, value);
      } catch (err) {
        console.warn(`⚠️ [CONTEXT] Fehler bei Reflexion für "${key}":`, err);
      }
    }
    return result;
  }

  /* ======================================================================== */
  /* 💬 Grundlegende Kontextverwaltung - VERBESSERT                          */
  /* ======================================================================== */

  set(key: string, value: any): void {
    if (key && typeof key === "string") {
      this.context.set(key, value);
    }
  }

  get(key: string): any {
    return this.context.get(key);
  }

  has(key: string): boolean {
    return this.context.has(key);
  }

  delete(key: string): boolean {
    return this.context.delete(key);
  }

  clear(): void {
    this.context.clear();
    this.history = [];
    this.userPreferences.clear();
    this.stats = {
      messageCount: 0,
      topicSwitches: 0,
      lastTopic: null,
      rulesTriggered: 0,
      toolsExecuted: 0,
      workflowsExecuted: 0,
      averageResponseTime: 0,
    };
    this.responseTimes = [];
    this.initializeDefaultContext();
  }

  /* ======================================================================== */
  /* 🔍 Hauptanalyse - VERBESSERT                                            */
  /* ======================================================================== */

  update(messages: ChatMessage[], responseTime?: number): void {
    if (!Array.isArray(messages)) {
      console.warn("⚠️ [CONTEXT] Ungültige Nachrichten für Update:", messages);
      return;
    }

    // Begrenze Historie auf letzte 30 Nachrichten für Performance
    this.history = messages.slice(-30);
    this.stats.messageCount += messages.length;

    // Track Response Time falls vorhanden
    if (responseTime && responseTime > 0) {
      this.responseTimes.push(responseTime);
      // Begrenze auf letzte 100 Werte
      if (this.responseTimes.length > 100) {
        this.responseTimes = this.responseTimes.slice(-100);
      }
      this.stats.averageResponseTime = this.calculateAverageResponseTime();
    }

    this.analyzeContext();
  }

  private calculateAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    return (
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
    );
  }

  private analyzeContext(): void {
    if (this.history.length === 0) return;

    const lastMessages = this.history
      .slice(-10)
      .map((m) => m.content.toLowerCase());
    const joined = lastMessages.join(" ");

    // Themenanalyse mit erweiterten Kategorien
    this.analyzeTopics(joined);

    // Erweiterte Analyse-Funktionen
    this.analyzeSentiment(joined);
    this.analyzeIntent(joined);
    this.analyzePreferences(joined);
    this.analyzeUserExperience(joined);

    // Kontext-Confidence berechnen
    this.calculateContextConfidence();

    this.set("last_updated", new Date().toISOString());
  }

  private analyzeTopics(joined: string): void {
    const detectedTopics: string[] = [];
    const detectedCategories: MessageCategory[] = [];

    for (const topic of this.topicPatterns) {
      if (topic.regex.test(joined)) {
        detectedTopics.push(topic.name);
        detectedCategories.push(topic.category);
        this.set(`discussing_${topic.name}`, true);
      } else {
        this.set(`discussing_${topic.name}`, false);
      }
    }

    const mainTopic = detectedTopics[0] ?? "general";
    const mainCategory = detectedCategories[0] ?? "unknown";

    // Topic-Switch Tracking
    if (mainTopic !== this.stats.lastTopic && this.stats.lastTopic !== null) {
      this.stats.topicSwitches++;
    }
    this.stats.lastTopic = mainTopic;

    this.set("current_topic", mainTopic);
    this.set("current_category", mainCategory);
    this.set("detected_topics", detectedTopics);
    this.set("detected_categories", detectedCategories);
  }

  /* ======================================================================== */
  /* 😐 Stimmung / Intention / Präferenzen - VERBESSERT                      */
  /* ======================================================================== */

  private analyzeSentiment(joined: string): void {
    const positiveIndicators =
      /\b(danke|gut|super|perfekt|zufrieden|ausgezeichnet|toll|fantastisch)\b/;
    const negativeIndicators =
      /\b(fehler|problem|defekt|nicht funktioniert|schlecht|kaputt|frustrierend)\b/;
    const questioningIndicators =
      /\b(warum|weshalb|hilfe|wieso|wie funktioniert|erklär)\b/;
    const criticalIndicators =
      /\b(achtung|kritisch|warnung|überlastet|notfall|dringend)\b/;

    if (criticalIndicators.test(joined)) {
      this.set("sentiment", "critical");
    } else if (negativeIndicators.test(joined)) {
      this.set("sentiment", "negative");
    } else if (questioningIndicators.test(joined)) {
      this.set("sentiment", "questioning");
    } else if (positiveIndicators.test(joined)) {
      this.set("sentiment", "positive");
    } else {
      this.set("sentiment", "neutral");
    }

    // Sentiment-Confidence basierend auf Indikator-Stärke
    const matches = [
      criticalIndicators.test(joined),
      negativeIndicators.test(joined),
      questioningIndicators.test(joined),
      positiveIndicators.test(joined),
    ].filter(Boolean).length;

    this.set(
      "sentiment_confidence",
      matches > 1 ? "high" : matches === 1 ? "medium" : "low",
    );
  }

  private analyzeIntent(joined: string): void {
    const intentPatterns = {
      query:
        /\b(zeige|liste|scan|prüfe|analysiere|überwache|suche|finde|anzeigen)\b/,
      create: /\b(erstelle|lege an|füge hinzu|addiere|erzeuge|neu anlegen)\b/,
      update:
        /\b(aktualisiere|ändere|update|modifiziere|bearbeite|verändere)\b/,
      delete: /\b(lösche|entferne|delete|vernichte|entfernen)\b/,
      calculate:
        /\b(berechne|rechne|ermittle|simuliere|kalkuliere|berechnen)\b/,
      diagnose: /\b(test|diagnose|überprüfe|prüfung|fehlersuche)\b/,
      explain: /\b(erkläre|beschreibe|was ist|wie funktioniert)\b/,
    };

    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(joined)) {
        this.set("intent", intent);
        return;
      }
    }

    this.set("intent", "informational");
  }

  private analyzePreferences(joined: string): void {
    const stylePatterns = {
      detailed:
        /\b(detail|ausführlich|schritt für schritt|detailliert|genau)\b/,
      short: /\b(kurz|übersicht|zusammenfassung|knapp|kurz gefasst)\b/,
      technical: /\b(technisch|debug|api|system|log|technische details)\b/,
      simple: /\b(einfach|verständlich|einfache sprache|laienhaft)\b/,
    };

    for (const [style, pattern] of Object.entries(stylePatterns)) {
      if (pattern.test(joined)) {
        this.userPreferences.set("response_style", style);
        break;
      }
    }

    // Sprachpräferenzen
    if (/\b(englisch|english)\b/.test(joined)) {
      this.userPreferences.set("language", "en");
    } else if (/\b(deutsch|german)\b/.test(joined)) {
      this.userPreferences.set("language", "de");
    }

    // Format-Präferenzen
    if (/\b(json|xml|csv|tabellarisch)\b/.test(joined)) {
      this.userPreferences.set(
        "preferred_format",
        joined.match(/\b(json|xml|csv|tabellarisch)\b/)?.[0],
      );
    }
  }

  private analyzeUserExperience(joined: string): void {
    const beginnerTerms =
      /\b(anfänger|neu|erstmals|wie fange ich an|grundlagen)\b/;
    const expertTerms =
      /\b(erweitert|fortgeschritten|experte|api|script|programmierung)\b/;

    if (beginnerTerms.test(joined)) {
      this.set("user.experience_level", "beginner");
    } else if (expertTerms.test(joined)) {
      this.set("user.experience_level", "expert");
    } else if (this.get("user.experience_level") === "unknown") {
      this.set("user.experience_level", "intermediate");
    }
  }

  private calculateContextConfidence(): void {
    const factors = [
      this.history.length >= 3 ? 1 : 0,
      this.get("current_topic") !== "general" ? 1 : 0,
      this.get("intent") !== "informational" ? 1 : 0,
      this.userPreferences.size > 0 ? 1 : 0,
    ];

    const confidenceScore = factors.filter(Boolean).length / factors.length;

    let confidence: "low" | "medium" | "high";
    if (confidenceScore >= 0.75) confidence = "high";
    else if (confidenceScore >= 0.5) confidence = "medium";
    else confidence = "low";

    this.set("context_confidence", confidence);
    this.set("context_confidence_score", confidenceScore);
  }

  /* ======================================================================== */
  /* ⚙️ Regelbasiertes Matching - VERBESSERT                                 */
  /* ======================================================================== */

  matchRules(input: string): {
    reply?: string;
    action?: string;
    params?: string[];
    rule?: ElizaRule;
    confidence?: number;
  } | null {
    if (!input || typeof input !== "string") return null;

    const lower = input.toLowerCase().trim();
    if (!lower) return null;

    // Filter nur aktive Regeln
    const activeRules = this.rules.filter((rule) => rule.enabled !== false);
    if (activeRules.length === 0) return null;

    let bestMatch: any = null;
    let highestPriority = -1;

    for (const rule of activeRules) {
      try {
        const regex = new RegExp(rule.pattern, "i");
        const match = lower.match(regex);

        if (match) {
          const currentPriority = rule.priority || 0;

          // Wähle Regel mit höchster Priorität
          if (currentPriority > highestPriority) {
            highestPriority = currentPriority;

            const replyTemplate =
              rule.replies?.[Math.floor(Math.random() * rule.replies.length)] ??
              "";
            const reply = this.applyReflections(
              replyTemplate.replace(
                /\$(\d+)/g,
                (_, n) => match[Number(n)] ?? "",
              ),
            );

            const params = rule.params?.map((p) =>
              p.replace(/\$(\d+)/g, (_, n) => match[Number(n)] ?? ""),
            );

            bestMatch = {
              reply,
              action: rule.action,
              params,
              rule,
              confidence: rule.confidence_threshold || 0.8,
            };
          }
        }
      } catch (err) {
        console.warn(`⚠️ [CONTEXT] Fehler bei Regel-Auswertung:`, err);
      }
    }

    if (bestMatch) {
      this.stats.rulesTriggered++;
      this.set("last_rule_matched", bestMatch.rule?.pattern);
      this.set("last_rule_action", bestMatch.action);
    }

    return bestMatch;
  }

  /* ======================================================================== */
  /* 🧩 Integration in Tools & Workflows - VERBESSERT                        */
  /* ======================================================================== */

  async executeAction(
    action: string,
    params?: Record<string, any>,
  ): Promise<any> {
    if (!action) {
      return { success: false, error: "Keine Aktion angegeben" };
    }

    const startTime = Date.now();

    try {
      let result: any;

      // Tool-Execution
      if (toolRegistry.has(action)) {
        result = await toolRegistry.call(action, params ?? {});
        this.stats.toolsExecuted++;
        this.set("last_tool_used", action);
      }
      // Workflow-Execution
      else if (
        workflowEngine.getWorkflowDefinitions().some((w) => w.name === action)
      ) {
        result = await workflowEngine.executeWorkflow(action, params ?? {});
        this.stats.workflowsExecuted++;
        this.set("last_workflow_used", action);
      }
      // Unbekannte Aktion
      else {
        result = {
          success: false,
          error: `Unbekannte Aktion: ${action}`,
          available_actions: this.getAvailableActions(),
        };
      }

      const executionTime = Date.now() - startTime;
      this.set(`last_execution_time.${action}`, executionTime);

      return {
        ...result,
        metadata: {
          execution_time_ms: executionTime,
          action_type: this.getActionType(action),
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      console.error(
        `❌ [CONTEXT] Fehler bei Aktionsausführung "${action}":`,
        error,
      );

      return {
        success: false,
        error: error.message,
        execution_time_ms: Date.now() - startTime,
      };
    }
  }

  private getActionType(action: string): "tool" | "workflow" | "unknown" {
    if (toolRegistry.has(action)) return "tool";
    if (workflowEngine.getWorkflowDefinitions().some((w) => w.name === action))
      return "workflow";
    return "unknown";
  }

  private getAvailableActions(): { tools: string[]; workflows: string[] } {
    const tools = (() => {
      try {
        // Falls listTools nicht existiert, Fallback verwenden
        const allTools =
          typeof (toolRegistry as any).listTools === "function"
            ? (toolRegistry as any).listTools()
            : [];

        // Sichere Extraktion von Namen
        return Array.isArray(allTools)
          ? allTools.map((t: any) => t?.name ?? "Unbekanntes Tool")
          : [];
      } catch {
        return [];
      }
    })();

    const workflows = (() => {
      try {
        const defs = workflowEngine.getWorkflowDefinitions?.() ?? [];
        return Array.isArray(defs)
          ? defs.map((w: any) => w?.name ?? "Unbenannter Workflow")
          : [];
      } catch {
        return [];
      }
    })();

    return { tools, workflows };
  }

  /* ======================================================================== */
  /* 📤 Kontextausgabe - VERBESSERT                                          */
  /* ======================================================================== */

  getContext(): ConversationState {
    const baseContext: ConversationState = {
      ...Object.fromEntries(this.context),
      preferences: Object.fromEntries(this.userPreferences),
      history_length: this.history.length,
      sentiment: this.get("sentiment"),
      intent: this.get("intent"),
      current_topic: this.get("current_topic"),
      current_category: this.get("current_category"),
      confidence: this.get("context_confidence"),
      updated_at: this.get("last_updated"),
      stats: this.stats,
      metadata: this.metadata,
    };

    // Füge erweiterte Metriken hinzu
    baseContext.system_metrics = {
      average_response_time: this.stats.averageResponseTime,
      rules_loaded: this.rules.length,
      reflections_loaded: Object.keys(this.reflections).length,
      active_rules: this.rules.filter((r) => r.enabled !== false).length,
    };

    return baseContext;
  }

  getPreferences(): Record<string, any> {
    return Object.fromEntries(this.userPreferences);
  }

  mergeInto(target: Record<string, any>): Record<string, any> {
    return {
      ...target,
      ...Object.fromEntries(this.context),
      _context: this.getContext(), // Füge vollständigen Kontext als separate Property hinzu
    };
  }

  /* ======================================================================== */
  /* 📊 Erweiterte Diagnose-Funktionen                                       */
  /* ======================================================================== */

  getDiagnostics(): any {
    return {
      context_size: this.context.size,
      history_length: this.history.length,
      preferences_size: this.userPreferences.size,
      rules_loaded: this.rules.length,
      reflections_loaded: Object.keys(this.reflections).length,
      topic_patterns: this.topicPatterns.length,
      response_times: {
        current: this.responseTimes.slice(-1)[0],
        average: this.stats.averageResponseTime,
        samples: this.responseTimes.length,
      },
      stats: this.stats,
      metadata: this.metadata,
    };
  }

  // Neue Funktion: Kontext zurücksetzen aber Historie behalten
  resetContext(keepHistory: boolean = false): void {
    const oldHistory = this.history;
    this.clear();
    if (keepHistory) {
      this.history = oldHistory;
    }
  }
}
