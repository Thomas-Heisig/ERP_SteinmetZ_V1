// SPDX-License-Identifier: MIT
// apps/backend/src/routes/quickchat/quickchatRouter.ts

/**
 * QuickChat Router
 *
 * AI-powered chat assistant API with multi-provider support, tool execution,
 * workflow orchestration, and advanced AI capabilities (vision, audio, translation).
 *
 * @module routes/quickchat
 * @category Routes
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { ValidationError, NotFoundError } from "../error/errors.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { createLogger } from "../../utils/logger.js";
import { quickchatService } from "./quickchatService.js";

const logger = createLogger("quickchat-router");
const router = Router();

/* ---------------------------------------------------------
   VALIDATION SCHEMAS
--------------------------------------------------------- */

const messageSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID format").optional(),
  userId: z.string().optional(),
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message too long (max 5000 characters)"),
  context: z.record(z.string(), z.unknown()).optional(),
  metadata: z
    .object({
      source: z.string().optional(),
      priority: z.enum(["low", "normal", "high"]).optional(),
      tags: z.array(z.string()).optional(),
    })
    .optional(),
  preferences: z
    .object({
      provider: z.string().optional(),
      model: z.string().optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().positive().optional(),
      stream: z.boolean().optional(),
    })
    .optional(),
});

const commandSchema = z.object({
  command: z.string().trim().min(1, "Command cannot be empty"),
  args: z.string().trim().optional(),
  context: z.record(z.string(), z.unknown()).optional(),
});

const sessionCreateSchema = z.object({
  userId: z.string().optional(),
  context: z.record(z.string(), z.unknown()).optional(),
  preferences: z
    .object({
      provider: z.string().optional(),
      model: z.string().optional(),
      temperature: z.number().optional(),
      maxTokens: z.number().optional(),
    })
    .optional(),
});

/* ---------------------------------------------------------
   ENDPOINTS
--------------------------------------------------------- */

/**
 * Send a message to QuickChat
 *
 * Processes user messages with AI, executes commands, and maintains
 * conversation context.
 *
 * @route POST /api/quickchat/message
 * @body {object} Message data with sessionId, message, context, preferences
 * @access Private
 * @returns {object} AI response with session ID and metadata
 */
router.post(
  "/message",
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug({ body: req.body }, "POST /api/quickchat/message");

    const validationResult = messageSchema.safeParse(req.body);
    if (!validationResult.success) {
      const issues = Object.fromEntries(
        validationResult.error.issues.map((issue) => [
          issue.path.join(".") || "root",
          issue.message,
        ]),
      );
      throw new ValidationError("Invalid request body", issues);
    }

    const result = await quickchatService.sendMessage(validationResult.data);

    logger.info(
      {
        sessionId: result.sessionId,
        messageLength: result.message.content.length,
      },
      "Message processed successfully",
    );

    res.json({
      success: true,
      data: result,
    });
  }),
);

/**
 * Execute a command directly
 *
 * Executes slash commands without full AI processing.
 *
 * @route POST /api/quickchat/command
 * @body {object} Command with args and context
 * @access Private
 * @returns {object} Command execution result
 */
router.post(
  "/command",
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug({ body: req.body }, "POST /api/quickchat/command");

    const validationResult = commandSchema.safeParse(req.body);
    if (!validationResult.success) {
      const issues = Object.fromEntries(
        validationResult.error.issues.map((issue) => [
          issue.path.join(".") || "root",
          issue.message,
        ]),
      );
      throw new ValidationError("Invalid request body", issues);
    }

    const { command, args } = validationResult.data;
    const cmd = command.startsWith("/") ? command : `/${command}`;

    // Create temporary session for command execution
    const session = await quickchatService.createSession({});
    const result = await quickchatService.executeCommand(
      `${cmd} ${args || ""}`,
      session,
    );

    logger.info({ command: cmd, success: result.success }, "Command executed");

    res.json({
      success: true,
      data: result,
    });
  }),
);

/**
 * List available commands
 *
 * Returns all slash commands with descriptions and required tools.
 *
 * @route GET /api/quickchat/commands
 * @access Public
 * @returns {object} List of available commands
 */
router.get(
  "/commands",
  asyncHandler(async (_req: Request, res: Response) => {
    logger.debug("GET /api/quickchat/commands");

    const commands = quickchatService.getCommands();

    res.json({
      success: true,
      data: {
        commands: Object.entries(commands).map(([key, value]) => ({
          command: key,
          name: value.name,
          description: value.description,
          tools: value.tools,
        })),
      },
    });
  }),
);

/**
 * Get QuickChat capabilities
 *
 * Returns available providers, models, tools, workflows, and features.
 *
 * @route GET /api/quickchat/capabilities
 * @access Public
 * @returns {object} System capabilities
 */
router.get(
  "/capabilities",
  asyncHandler(async (_req: Request, res: Response) => {
    logger.debug("GET /api/quickchat/capabilities");

    const capabilities = await quickchatService.getCapabilities();

    logger.info(
      {
        providers: capabilities.providers.length,
        tools: capabilities.tools.length,
      },
      "Capabilities retrieved",
    );

    res.json({
      success: true,
      data: capabilities,
    });
  }),
);

/**
 * Create a new session
 *
 * Creates a new chat session with optional user ID and preferences.
 *
 * @route POST /api/quickchat/sessions
 * @body {object} Session configuration
 * @access Private
 * @returns {object} Created session
 */
router.post(
  "/sessions",
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug({ body: req.body }, "POST /api/quickchat/sessions");

    const validationResult = sessionCreateSchema.safeParse(req.body);
    if (!validationResult.success) {
      const issues = Object.fromEntries(
        validationResult.error.issues.map((issue) => [
          issue.path.join(".") || "root",
          issue.message,
        ]),
      );
      throw new ValidationError("Invalid request body", issues);
    }

    const session = await quickchatService.createSession(validationResult.data);

    logger.info({ sessionId: session.id }, "Session created");

    res.status(201).json({
      success: true,
      data: session,
    });
  }),
);

/**
 * Get a session by ID
 *
 * Retrieves session with full message history and context.
 *
 * @route GET /api/quickchat/sessions/:id
 * @param {string} id - Session ID
 * @access Private
 * @returns {object} Session data
 */
router.get(
  "/sessions/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    logger.debug({ sessionId: id }, "GET /api/quickchat/sessions/:id");

    const session = await quickchatService.getSession(id);

    if (!session) {
      throw new NotFoundError("Session not found", { sessionId: id });
    }

    res.json({
      success: true,
      data: session,
    });
  }),
);

/**
 * List all sessions
 *
 * Lists all sessions, optionally filtered by user ID.
 *
 * @route GET /api/quickchat/sessions
 * @query {string} [userId] - Filter by user ID
 * @access Private
 * @returns {object} List of sessions
 */
router.get(
  "/sessions",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.query.userId as string | undefined;
    logger.debug({ userId }, "GET /api/quickchat/sessions");

    const sessions = await quickchatService.listSessions(userId);

    logger.info({ count: sessions.length, userId }, "Sessions listed");

    res.json({
      success: true,
      data: {
        sessions,
        count: sessions.length,
      },
    });
  }),
);

/**
 * Delete a session
 *
 * Permanently deletes a session and all its messages.
 *
 * @route DELETE /api/quickchat/sessions/:id
 * @param {string} id - Session ID
 * @access Private
 * @returns {object} Deletion confirmation
 */
router.delete(
  "/sessions/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    logger.debug({ sessionId: id }, "DELETE /api/quickchat/sessions/:id");

    const deleted = await quickchatService.deleteSession(id);

    logger.info({ sessionId: id, deleted }, "Session deleted");

    res.json({
      success: true,
      data: { deleted },
    });
  }),
);

export default router;
