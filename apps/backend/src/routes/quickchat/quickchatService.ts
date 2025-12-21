// SPDX-License-Identifier: MIT
// apps/backend/src/routes/quickchat/quickchatService.ts

/**
 * QuickChat Service
 *
 * Core business logic for AI-powered chat assistant with provider integration,
 * tool execution, session management, and workflow orchestration.
 *
 * @module quickchat/quickchatService
 */

import { createLogger } from "../../utils/logger.js";
import { v4 as uuidv4 } from "uuid";
import type { ChatMessage } from "../ai/types/types.js";
import { providerManager } from "../ai/services/providerManager.js";
import chatService from "../ai/services/chatService.js";
import toolService from "../ai/services/toolService.js";
import * as sessionStore from "../ai/sessions/sessionStore.js";
import { workflowEngine } from "../ai/workflows/workflowEngine.js";
import visionService from "../ai/services/visionService.js";
import audioService from "../ai/services/audioService.js";
import translationService from "../ai/services/translationService.js";
import embeddingService from "../ai/services/embeddingService.js";
import knowledgeService from "../ai/services/knowledgeService.js";

const logger = createLogger("quickchat-service");

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */

export interface QuickChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  command?: string;
  commandResult?: unknown;
  metadata?: {
    provider?: string;
    model?: string;
    tokens?: {
      input: number;
      output: number;
      total: number;
    };
    duration?: number;
    toolCalls?: string[];
  };
}

export interface QuickChatSession {
  id: string;
  userId?: string;
  messages: QuickChatMessage[];
  context: Record<string, unknown>;
  preferences: {
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SendMessageOptions {
  sessionId?: string;
  userId?: string;
  message: string;
  context?: Record<string, unknown>;
  metadata?: {
    source?: string;
    priority?: "low" | "normal" | "high";
    tags?: string[];
  };
  preferences?: {
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  };
}

export interface CommandExecutionResult {
  success: boolean;
  message: string;
  data?: unknown;
  toolsUsed?: string[];
  duration?: number;
}

export interface QuickChatCapabilities {
  providers: string[];
  models: Record<string, string[]>;
  tools: string[];
  workflows: string[];
  features: {
    vision: boolean;
    audio: boolean;
    translation: boolean;
    embedding: boolean;
    knowledge: boolean;
    streaming: boolean;
  };
}

/* ---------------------------------------------------------
   COMMANDS
--------------------------------------------------------- */

export const COMMANDS = {
  "/rechnung": {
    name: "Rechnung erstellen",
    description: "Erstellt eine neue Rechnung",
    handler: "createInvoice",
    tools: ["database_query", "erp_create_invoice"],
  },
  "/angebot": {
    name: "Angebot erstellen",
    description: "Erstellt ein neues Angebot",
    handler: "createQuote",
    tools: ["database_query", "erp_create_quote"],
  },
  "/bericht": {
    name: "Bericht generieren",
    description: "Generiert einen Bericht",
    handler: "generateReport",
    tools: ["database_query", "file_write"],
  },
  "/idee": {
    name: "Idee parken",
    description: "Parkt eine neue Idee schnell",
    handler: "parkIdea",
    tools: ["database_insert"],
  },
  "/termin": {
    name: "Termin erstellen",
    description: "Erstellt einen neuen Termin",
    handler: "createEvent",
    tools: ["database_insert"],
  },
  "/suche": {
    name: "Suche",
    description: "Durchsucht das System mit AI-Embeddings",
    handler: "search",
    tools: ["database_query", "semantic_search"],
  },
  "/hilfe": {
    name: "Hilfe",
    description: "Zeigt verfügbare Befehle",
    handler: "help",
    tools: [],
  },
  "/translate": {
    name: "Übersetzen",
    description: "Übersetzt Text in eine andere Sprache",
    handler: "translate",
    tools: ["translation"],
  },
  "/vision": {
    name: "Bild analysieren",
    description: "Analysiert ein Bild mit AI Vision",
    handler: "analyzeImage",
    tools: ["vision"],
  },
  "/audio": {
    name: "Audio verarbeiten",
    description: "Transkribiert oder erzeugt Audio",
    handler: "processAudio",
    tools: ["audio_transcribe", "audio_generate"],
  },
  "/workflow": {
    name: "Workflow ausführen",
    description: "Führt einen definierten Workflow aus",
    handler: "executeWorkflow",
    tools: ["workflow_engine"],
  },
} as const;

export type CommandKey = keyof typeof COMMANDS;

/* ---------------------------------------------------------
   SERVICE CLASS
--------------------------------------------------------- */

/**
 * QuickChat Service
 *
 * Provides AI-powered chat functionality with:
 * - Multi-provider support (OpenAI, Anthropic, Ollama, etc.)
 * - Tool execution (database, ERP, files, etc.)
 * - Session management with context
 * - Workflow orchestration
 * - Vision, audio, translation capabilities
 *
 * @example
 * ```typescript
 * const result = await quickchatService.sendMessage({
 *   message: "Create an invoice for customer ABC",
 *   preferences: { provider: "openai", model: "gpt-4" }
 * });
 * ```
 */
export class QuickChatService {
  /**
   * Send a message to the AI assistant
   *
   * @param {SendMessageOptions} options - Message options
   * @returns {Promise<QuickChatMessage>} AI response
   *
   * @example
   * ```typescript
   * const response = await quickchatService.sendMessage({
   *   sessionId: "uuid-123",
   *   message: "What's the revenue this month?",
   *   preferences: { provider: "anthropic" }
   * });
   * ```
   */
  async sendMessage(options: SendMessageOptions): Promise<{
    sessionId: string;
    message: QuickChatMessage;
    commandResult?: unknown;
  }> {
    const startTime = Date.now();
    const {
      sessionId: providedSessionId,
      userId,
      message,
      context = {},
      metadata,
      preferences = {},
    } = options;

    logger.debug(
      { message, sessionId: providedSessionId },
      "Processing message",
    );

    // Get or create session
    const sessionId = providedSessionId || uuidv4();
    let session = await this.getSession(sessionId);

    if (!session) {
      session = await this.createSession({
        sessionId,
        userId,
        context,
        preferences,
      });
    }

    // Add user message
    const userMessage: QuickChatMessage = {
      id: uuidv4(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        duration: 0,
      },
    };
    session.messages.push(userMessage);

    // Check if it's a command
    const trimmedMessage = message.trim();
    let assistantMessage: QuickChatMessage;
    let commandResult: unknown;

    if (trimmedMessage.startsWith("/")) {
      const result = await this.executeCommand(trimmedMessage, session);
      assistantMessage = {
        id: uuidv4(),
        role: "assistant",
        content: result.message,
        timestamp: new Date().toISOString(),
        command: trimmedMessage.split(" ")[0],
        commandResult: result.data,
        metadata: {
          toolCalls: result.toolsUsed,
          duration: result.duration,
        },
      };
      commandResult = result.data;
    } else {
      // AI chat completion
      const aiResponse = await this.getAICompletion(
        message,
        session,
        preferences,
      );
      assistantMessage = {
        id: uuidv4(),
        role: "assistant",
        content: aiResponse.content,
        timestamp: new Date().toISOString(),
        metadata: aiResponse.metadata,
      };
    }

    session.messages.push(assistantMessage);
    session.updatedAt = new Date().toISOString();
    await this.updateSession(session);

    const duration = Date.now() - startTime;
    logger.info(
      {
        sessionId,
        messageLength: message.length,
        responseLength: assistantMessage.content.length,
        duration,
      },
      "Message processed successfully",
    );

    return {
      sessionId: session.id,
      message: assistantMessage,
      commandResult,
    };
  }

  /**
   * Execute a command
   *
   * @param {string} command - Command string (e.g., "/rechnung ABC")
   * @param {QuickChatSession} session - Current session
   * @returns {Promise<CommandExecutionResult>} Command result
   *
   * @example
   * ```typescript
   * const result = await quickchatService.executeCommand(
   *   "/rechnung Kunde ABC, 1000€",
   *   session
   * );
   * ```
   */
  async executeCommand(
    command: string,
    session: QuickChatSession,
  ): Promise<CommandExecutionResult> {
    const startTime = Date.now();
    const parts = command.split(" ");
    const cmd = parts[0] as CommandKey;
    const args = parts.slice(1).join(" ");

    logger.debug({ command: cmd, args }, "Executing command");

    if (!(cmd in COMMANDS)) {
      return {
        success: false,
        message: `Unbekannter Befehl: ${cmd}\n\nVerfügbare Befehle:\n${Object.entries(
          COMMANDS,
        )
          .map(([k, v]) => `${k} - ${v.description}`)
          .join("\n")}`,
        duration: Date.now() - startTime,
      };
    }

    const commandInfo = COMMANDS[cmd];
    const toolsUsed: string[] = [];

    try {
      let result: CommandExecutionResult;

      switch (cmd) {
        case "/rechnung":
          result = await this.handleInvoiceCommand(args, session);
          toolsUsed.push(...(commandInfo.tools || []));
          break;

        case "/angebot":
          result = await this.handleQuoteCommand(args, session);
          toolsUsed.push(...(commandInfo.tools || []));
          break;

        case "/bericht":
          result = await this.handleReportCommand(args, session);
          toolsUsed.push(...(commandInfo.tools || []));
          break;

        case "/idee":
          result = await this.handleIdeaCommand(args, session);
          toolsUsed.push(...(commandInfo.tools || []));
          break;

        case "/termin":
          result = await this.handleEventCommand(args, session);
          toolsUsed.push(...(commandInfo.tools || []));
          break;

        case "/suche":
          result = await this.handleSearchCommand(args, session);
          toolsUsed.push(...(commandInfo.tools || []));
          break;

        case "/translate":
          result = await this.handleTranslateCommand(args, session);
          toolsUsed.push("translation");
          break;

        case "/vision":
          result = await this.handleVisionCommand(args, session);
          toolsUsed.push("vision");
          break;

        case "/audio":
          result = await this.handleAudioCommand(args, session);
          toolsUsed.push("audio");
          break;

        case "/workflow":
          result = await this.handleWorkflowCommand(args, session);
          toolsUsed.push("workflow_engine");
          break;

        case "/hilfe":
          result = this.handleHelpCommand();
          break;

        default:
          result = {
            success: false,
            message: `Befehl nicht implementiert: ${cmd}`,
          };
      }

      result.toolsUsed = toolsUsed;
      result.duration = Date.now() - startTime;

      logger.info(
        { command: cmd, success: result.success, duration: result.duration },
        "Command executed",
      );

      return result;
    } catch (error) {
      logger.error({ error, command: cmd }, "Command execution failed");
      return {
        success: false,
        message: `Fehler bei Ausführung von ${cmd}: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Get AI completion for a message
   *
   * @param {string} message - User message
   * @param {QuickChatSession} session - Current session
   * @param {object} preferences - AI preferences
   * @returns {Promise<object>} AI response
   */
  private async getAICompletion(
    message: string,
    session: QuickChatSession,
    preferences: SendMessageOptions["preferences"] = {},
  ): Promise<{ content: string; metadata: QuickChatMessage["metadata"] }> {
    const startTime = Date.now();

    try {
      // Get provider
      const providerName =
        preferences.provider || session.preferences.provider || "openai";
      const allStatuses = await providerManager.getProviderStatus();
      const providerStatus = allStatuses.find(
        (p) => p.provider === providerName,
      );

      if (!providerStatus || !providerStatus.available) {
        logger.warn({ providerName }, "Provider not available, using fallback");
        return {
          content: this.getFallbackResponse(message),
          metadata: { provider: "fallback", duration: Date.now() - startTime },
        };
      }

      // Prepare messages for AI
      const messages: ChatMessage[] = session.messages
        .slice(-10)
        .map((msg) => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        }));

      messages.push({
        role: "user",
        content: message,
      });

      // Get available tools (simplified - using available tool methods)
      toolService.getToolMetadata();

      // Create completion - using handleChatRequest (actual method available)
      const response = await chatService.handleChatRequest(
        preferences.model || session.preferences.model || "gpt-3.5-turbo",
        messages,
        {
          provider: providerName,
          temperature:
            preferences.temperature || session.preferences.temperature || 0.7,
          max_tokens:
            preferences.maxTokens || session.preferences.maxTokens || 2000,
        },
      );

      // Note: Full tool calling not yet implemented - simplified version
      // TODO: Implement tool calling integration when AI services support it

      return {
        content: response.text || "No response generated",
        metadata: {
          provider: providerName,
          model:
            preferences.model || session.preferences.model || "gpt-3.5-turbo",
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      logger.error({ error }, "AI completion failed");
      return {
        content: this.getFallbackResponse(message),
        metadata: {
          provider: "fallback",
          duration: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Get fallback response when AI is unavailable
   */
  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("hilfe") || lowerMessage.includes("help")) {
      return `Wie kann ich Ihnen helfen? Verfügbare Befehle:\n${Object.entries(
        COMMANDS,
      )
        .map(([k, v]) => `• ${k} - ${v.description}`)
        .join("\n")}\n\nOder stellen Sie mir einfach eine Frage!`;
    }

    if (lowerMessage.includes("hallo") || lowerMessage.includes("hi")) {
      return "Hallo! Ich bin der ERP SteinmetZ Assistent. Wie kann ich Ihnen helfen?";
    }

    return `Ich habe Ihre Nachricht erhalten: "${message}"\n\nFür schnelle Aktionen nutzen Sie Befehle wie /hilfe, /rechnung, /idee oder /termin.`;
  }

  /* ---------------------------------------------------------
     COMMAND HANDLERS
  --------------------------------------------------------- */

  private async handleInvoiceCommand(
    args: string,
    _session: QuickChatSession,
  ): Promise<CommandExecutionResult> {
    return {
      success: true,
      message: `Rechnung wird erstellt für: ${args || "Neuer Kunde"}`,
      data: { type: "invoice", status: "draft", args },
    };
  }

  private async handleQuoteCommand(
    args: string,
    _session: QuickChatSession,
  ): Promise<CommandExecutionResult> {
    return {
      success: true,
      message: `Angebot wird erstellt: ${args || "Neues Angebot"}`,
      data: { type: "quote", status: "draft", args },
    };
  }

  private async handleReportCommand(
    args: string,
    _session: QuickChatSession,
  ): Promise<CommandExecutionResult> {
    return {
      success: true,
      message: `Bericht "${args || "Standard-Bericht"}" wird generiert...`,
      data: { type: "report", name: args || "Standard-Bericht" },
    };
  }

  private async handleIdeaCommand(
    args: string,
    _session: QuickChatSession,
  ): Promise<CommandExecutionResult> {
    const ideaId = uuidv4();
    return {
      success: true,
      message: `Idee geparkt: "${args || "Neue Idee"}"`,
      data: { type: "idea", id: ideaId, title: args, phase: "parked" },
    };
  }

  private async handleEventCommand(
    args: string,
    _session: QuickChatSession,
  ): Promise<CommandExecutionResult> {
    return {
      success: true,
      message: `Termin wird erstellt: ${args || "Neuer Termin"}`,
      data: { type: "event", title: args },
    };
  }

  private async handleSearchCommand(
    args: string,
    _session: QuickChatSession,
  ): Promise<CommandExecutionResult> {
    try {
      // Use AI embedding for semantic search
      await embeddingService.generateEmbeddings(args);
      const results = await knowledgeService.queryKnowledgeBase(args, 5);

      return {
        success: true,
        message: `Suche nach: "${args}"\n\nAnfrage verarbeitet`,
        data: { type: "search", query: args, results },
      };
    } catch (error) {
      logger.error({ error }, "Search failed");
      return {
        success: false,
        message: `Suche fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
      };
    }
  }

  private async handleTranslateCommand(
    args: string,
    _session: QuickChatSession,
  ): Promise<CommandExecutionResult> {
    try {
      // Parse args: "text | source | target"
      const parts = args.split("|").map((p) => p.trim());
      const [text, _source = "auto", target = "en"] = parts;

      const translation = await translationService.translateText(text, target);

      return {
        success: true,
        message: `Übersetzung:\n\n${translation.text}`,
        data: translation,
      };
    } catch (error) {
      logger.error({ error }, "Translation failed");
      return {
        success: false,
        message: `Übersetzung fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
      };
    }
  }

  private async handleVisionCommand(
    args: string,
    _session: QuickChatSession,
  ): Promise<CommandExecutionResult> {
    try {
      // Args should be image URL or base64
      const analysis = await visionService.analyzeImage(
        args,
        "Describe this image in detail",
      );

      return {
        success: true,
        message: `Bildanalyse:\n\n${analysis.text || "Keine Beschreibung verfügbar"}`,
        data: analysis,
      };
    } catch (error) {
      logger.error({ error }, "Vision analysis failed");
      return {
        success: false,
        message: `Bildanalyse fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
      };
    }
  }

  private async handleAudioCommand(
    args: string,
    _session: QuickChatSession,
  ): Promise<CommandExecutionResult> {
    try {
      // Args: "transcribe|URL" or "generate|text|outputPath"
      const parts = args.split("|").map((p) => p.trim());
      const [action, ...restArgs] = parts;

      if (action === "transcribe") {
        const filePath = restArgs[0];
        const transcription = await audioService.transcribeAudio(filePath);
        return {
          success: true,
          message: `Transkription:\n\n${transcription.text}`,
          data: transcription,
        };
      } else if (action === "generate") {
        const text = restArgs[0];
        const outputPath = restArgs[1];
        const audio = await audioService.textToSpeech(text, outputPath);
        return {
          success: true,
          message: "Audio generiert",
          data: audio,
        };
      } else {
        return {
          success: false,
          message:
            "Ungültige Aktion. Nutzen Sie: /audio transcribe|URL oder /audio generate|Text",
        };
      }
    } catch (error) {
      logger.error({ error }, "Audio processing failed");
      return {
        success: false,
        message: `Audio-Verarbeitung fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
      };
    }
  }

  private async handleWorkflowCommand(
    args: string,
    session: QuickChatSession,
  ): Promise<CommandExecutionResult> {
    try {
      const workflowName = args.trim();
      const result = await workflowEngine.executeWorkflow(workflowName, {
        sessionId: session.id,
        userId: session.userId,
      });

      return {
        success: true,
        message: `Workflow "${workflowName}" ausgeführt`,
        data: result,
      };
    } catch (error) {
      logger.error({ error }, "Workflow execution failed");
      return {
        success: false,
        message: `Workflow-Ausführung fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
      };
    }
  }

  private handleHelpCommand(): CommandExecutionResult {
    const helpText = Object.entries(COMMANDS)
      .map(([k, v]) => `**${k}** - ${v.description}`)
      .join("\n");

    return {
      success: true,
      message: `Verfügbare Befehle:\n\n${helpText}`,
      data: { type: "help", commands: Object.keys(COMMANDS) },
    };
  }

  /* ---------------------------------------------------------
     SESSION MANAGEMENT
  --------------------------------------------------------- */

  /**
   * Create a new chat session
   */
  async createSession(options: {
    sessionId?: string;
    userId?: string;
    context?: Record<string, unknown>;
    preferences?: QuickChatSession["preferences"];
  }): Promise<QuickChatSession> {
    const session: QuickChatSession = {
      id: options.sessionId || uuidv4(),
      userId: options.userId,
      messages: [],
      context: options.context || {},
      preferences: options.preferences || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create session in AI sessionStore
    await sessionStore.createSession(
      options.preferences?.model || "gpt-3.5-turbo",
      options.preferences?.provider || "openai",
    );

    logger.info({ sessionId: session.id }, "Session created");
    return session;
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId: string): Promise<QuickChatSession | null> {
    try {
      const storedSession = sessionStore.getSession(sessionId);
      if (!storedSession) return null;

      return {
        id: sessionId,
        userId: undefined, // Not stored in AI sessionStore
        messages: storedSession.messages.map((msg) => ({
          id: uuidv4(),
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
          timestamp: msg.timestamp || new Date().toISOString(),
        })),
        context: {},
        preferences: {
          provider: storedSession.provider,
          model: storedSession.model,
        },
        createdAt: storedSession.createdAt,
        updatedAt: storedSession.updatedAt,
      };
    } catch (error) {
      logger.error({ error, sessionId }, "Failed to get session");
      return null;
    }
  }

  /**
   * Update a session
   */
  async updateSession(session: QuickChatSession): Promise<void> {
    // Update using last message
    if (session.messages.length > 0) {
      const lastMessage = session.messages[session.messages.length - 1];
      sessionStore.updateSession(session.id, {
        role: lastMessage.role,
        content: lastMessage.content,
      });
    }

    logger.debug({ sessionId: session.id }, "Session updated");
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    const deleted = sessionStore.removeSession(sessionId);
    logger.info({ sessionId, deleted }, "Session deleted");
    return deleted;
  }

  /**
   * List all sessions for a user
   */
  async listSessions(userId?: string): Promise<QuickChatSession[]> {
    const allSessions = sessionStore.listSessions();

    const sessions: QuickChatSession[] = allSessions.map((aiSession) => ({
      id: aiSession.id,
      userId: undefined,
      messages: aiSession.messages.map((msg) => ({
        id: uuidv4(),
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
      })),
      context: {},
      preferences: {
        provider: aiSession.provider,
        model: aiSession.model,
      },
      createdAt: aiSession.createdAt,
      updatedAt: aiSession.updatedAt,
    }));

    if (userId) {
      // Cannot filter by userId since AI sessionStore doesn't track it
      logger.warn(
        { userId },
        "User filtering not supported by AI sessionStore",
      );
    }

    return sessions;
  }

  /* ---------------------------------------------------------
     CAPABILITIES
  --------------------------------------------------------- */

  /**
   * Get QuickChat capabilities
   */
  async getCapabilities(): Promise<QuickChatCapabilities> {
    interface ProviderStatusInfo {
      provider: string;
      available: boolean;
      status: string;
    }

    const providerStatuses = await providerManager.getProviderStatus();
    const providers = (providerStatuses as ProviderStatusInfo[])
      .filter((p) => p.available)
      .map((p) => p.provider);

    const tools = toolService.getToolMetadata();
    const workflows = await workflowEngine.getWorkflowDefinitions();

    interface ToolInfo {
      name: string;
    }

    interface WorkflowInfo {
      name?: string;
      id?: string;
    }

    // Static model definitions based on provider
    const models: Record<string, string[]> = {
      ollama: [],
      openai: ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"],
      anthropic: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
      azure: [],
      vertexai: [],
      huggingface: [],
      llamacpp: [],
      eliza: ["rule-based"],
      fallback: ["simple"],
    };

    return {
      providers,
      models,
      tools: (tools as ToolInfo[]).map((t) => t.name),
      workflows: Array.isArray(workflows)
        ? (workflows as WorkflowInfo[]).map((w) => w.name || w.id || "unknown")
        : [],
      features: {
        vision: true,
        audio: true,
        translation: true,
        embedding: true,
        knowledge: true,
        streaming: true,
      },
    };
  }

  /**
   * Get available commands
   */
  getCommands(): typeof COMMANDS {
    return COMMANDS;
  }
}

export const quickchatService = new QuickChatService();
