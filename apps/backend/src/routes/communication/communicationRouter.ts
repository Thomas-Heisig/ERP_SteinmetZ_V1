// SPDX-License-Identifier: MIT
// apps/backend/src/routes/communication/communicationRouter.ts

/**
 * Communication Center Router
 *
 * Comprehensive communication management including messages, notifications,
 * templates, and call logging.
 *
 * @module routes/communication
 */

import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import db from "../database/dbService.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { NotFoundError } from "../error/errors.js";
import type { SqlValue } from "../database/database.js";
import { createLogger } from "../../utils/logger.js";
import {
  type Message,
  type Notification,
  type Template,
  type Call,
  createMessageSchema,
  updateMessageSchema,
  messageQuerySchema,
  createNotificationSchema,
  updateNotificationSchema,
  notificationQuerySchema,
  createTemplateSchema,
  updateTemplateSchema,
  templateQuerySchema,
  createCallSchema,
  updateCallSchema,
  callQuerySchema,
} from "./types.js";

const router = Router();
const logger = createLogger("communication");

// Export types for use in other modules
export type { Message, Notification, Template, Call } from "./types.js";

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

async function ensureTables(): Promise<void> {
  try {
    // Messages table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS communication_messages (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        "from" TEXT NOT NULL,
        "to" TEXT NOT NULL,
        cc TEXT,
        bcc TEXT,
        subject TEXT,
        body TEXT NOT NULL,
        html TEXT,
        priority TEXT DEFAULT 'normal',
        status TEXT DEFAULT 'draft',
        
        sent_at TEXT,
        delivered_at TEXT,
        read_at TEXT,
        failed_reason TEXT,
        
        attachments_json TEXT DEFAULT '[]',
        reply_to TEXT,
        in_reply_to TEXT,
        thread_id TEXT,
        
        created_by TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_messages_type ON communication_messages(type)`,
    );
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_messages_status ON communication_messages(status)`,
    );
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_messages_from ON communication_messages("from")`,
    );
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_messages_to ON communication_messages("to")`,
    );
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_messages_thread ON communication_messages(thread_id)`,
    );

    // Notifications table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS communication_notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        icon TEXT,
        
        link TEXT,
        action_label TEXT,
        action_url TEXT,
        
        read INTEGER DEFAULT 0,
        read_at TEXT,
        dismissed INTEGER DEFAULT 0,
        dismissed_at TEXT,
        
        priority TEXT DEFAULT 'normal',
        expires_at TEXT,
        
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_notifications_user ON communication_notifications(user_id)`,
    );
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_notifications_read ON communication_notifications(read)`,
    );

    // Templates table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS communication_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT,
        
        subject TEXT,
        body TEXT NOT NULL,
        html TEXT,
        
        variables_json TEXT DEFAULT '[]',
        
        is_active INTEGER DEFAULT 1,
        usage_count INTEGER DEFAULT 0,
        
        created_by TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_templates_type ON communication_templates(type)`,
    );

    // Calls table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS communication_calls (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        "from" TEXT NOT NULL,
        "to" TEXT NOT NULL,
        status TEXT DEFAULT 'ringing',
        
        duration INTEGER,
        recording TEXT,
        notes TEXT,
        
        started_at TEXT NOT NULL,
        ended_at TEXT,
        
        created_by TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_calls_type ON communication_calls(type)`,
    );

    logger.info("Communication tables initialized");
  } catch (error) {
    logger.error({ error }, "Failed to initialize communication tables");
  }
}

ensureTables();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function rowToMessage(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    type: row.type as Message["type"],
    from: row.from as string,
    to: row.to as string,
    cc: row.cc as string | undefined,
    bcc: row.bcc as string | undefined,
    subject: row.subject as string | undefined,
    body: row.body as string,
    html: row.html as string | undefined,
    priority: (row.priority as Message["priority"]) ?? "normal",
    status: (row.status as Message["status"]) ?? "draft",
    sentAt: row.sent_at as string | undefined,
    deliveredAt: row.delivered_at as string | undefined,
    readAt: row.read_at as string | undefined,
    failedReason: row.failed_reason as string | undefined,
    attachments: row.attachments_json as string | undefined,
    replyTo: row.reply_to as string | undefined,
    inReplyTo: row.in_reply_to as string | undefined,
    threadId: row.thread_id as string | undefined,
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToNotification(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    type: (row.type as Notification["type"]) ?? "info",
    title: row.title as string,
    message: row.message as string,
    icon: row.icon as string | undefined,
    link: row.link as string | undefined,
    actionLabel: row.action_label as string | undefined,
    actionUrl: row.action_url as string | undefined,
    read: Boolean(row.read),
    readAt: row.read_at as string | undefined,
    dismissed: Boolean(row.dismissed),
    dismissedAt: row.dismissed_at as string | undefined,
    priority: (row.priority as Notification["priority"]) ?? "normal",
    expiresAt: row.expires_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToTemplate(row: Record<string, unknown>): Template {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as Template["type"],
    category: row.category as string | undefined,
    subject: row.subject as string | undefined,
    body: row.body as string,
    html: row.html as string | undefined,
    variables: row.variables_json as string,
    isActive: Boolean(row.is_active),
    usageCount: (row.usage_count as number) ?? 0,
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToCall(row: Record<string, unknown>): Call {
  return {
    id: row.id as string,
    type: row.type as Call["type"],
    from: row.from as string,
    to: row.to as string,
    status: (row.status as Call["status"]) ?? "ringing",
    duration: row.duration as number | undefined,
    recording: row.recording as string | undefined,
    notes: row.notes as string | undefined,
    startedAt: row.started_at as string,
    endedAt: row.ended_at as string | undefined,
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
  };
}

// ============================================================================
// MESSAGES ROUTES
// ============================================================================

/**
 * GET /api/communication/messages
 * List messages with filtering
 */
router.get(
  "/messages",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = messageQuerySchema.parse(req.query);
    const {
      type,
      status,
      priority,
      from,
      to,
      search,
      threadId,
      startDate,
      endDate,
      limit,
      offset,
    } = validated;

    let sql = "SELECT * FROM communication_messages WHERE 1=1";
    const params: SqlValue[] = [];

    if (type) {
      sql += " AND type = ?";
      params.push(type);
    }
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }
    if (priority) {
      sql += " AND priority = ?";
      params.push(priority);
    }
    if (from) {
      sql += ' AND "from" LIKE ?';
      params.push(`%${from}%`);
    }
    if (to) {
      sql += ' AND "to" LIKE ?';
      params.push(`%${to}%`);
    }
    if (threadId) {
      sql += " AND thread_id = ?";
      params.push(threadId);
    }
    if (search) {
      sql += " AND (subject LIKE ? OR body LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    if (startDate) {
      sql += " AND created_at >= ?";
      params.push(startDate);
    }
    if (endDate) {
      sql += " AND created_at <= ?";
      params.push(endDate);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rows = await db.all<Record<string, unknown>>(sql, params);
    const messages = rows.map(rowToMessage);

    res.json({
      success: true,
      data: messages,
      pagination: { limit, offset, total: messages.length },
    });
  }),
);

/**
 * GET /api/communication/messages/:id
 */
router.get(
  "/messages/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const row = await db.get<Record<string, unknown>>(
      "SELECT * FROM communication_messages WHERE id = ?",
      [req.params.id],
    );

    if (!row) {
      throw new NotFoundError("Message not found");
    }

    res.json({ success: true, data: rowToMessage(row) });
  }),
);

/**
 * POST /api/communication/messages
 */
router.post(
  "/messages",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createMessageSchema.parse(req.body);
    const id = randomUUID();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO communication_messages (
        id, type, "from", "to", cc, bcc, subject, body, html, priority, status,
        attachments_json, reply_to, in_reply_to, thread_id, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validated.type,
        validated.from,
        validated.to,
        validated.cc ?? null,
        validated.bcc ?? null,
        validated.subject ?? null,
        validated.body,
        validated.html ?? null,
        validated.priority,
        "sent",
        JSON.stringify(validated.attachments ?? []),
        validated.replyTo ?? null,
        validated.inReplyTo ?? null,
        validated.threadId ?? null,
        validated.createdBy,
        now,
        now,
      ],
    );

    const message: Message = {
      id,
      ...validated,
      attachments: JSON.stringify(validated.attachments ?? []),
      status: "sent",
      sentAt: now,
      createdAt: now,
      updatedAt: now,
    };

    logger.info({ messageId: id, type: validated.type }, "Message sent");
    res.status(201).json({ success: true, data: message });
  }),
);

/**
 * PUT /api/communication/messages/:id
 */
router.put(
  "/messages/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = updateMessageSchema.parse(req.body);

    const existing = await db.get<Record<string, unknown>>(
      "SELECT * FROM communication_messages WHERE id = ?",
      [id],
    );

    if (!existing) {
      throw new NotFoundError("Message not found");
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const params: SqlValue[] = [];

    if (validated.status !== undefined) {
      updates.push("status = ?");
      params.push(validated.status);
    }
    if (validated.readAt !== undefined) {
      updates.push("read_at = ?");
      params.push(validated.readAt);
    }
    if (validated.failedReason !== undefined) {
      updates.push("failed_reason = ?");
      params.push(validated.failedReason);
    }

    updates.push("updated_at = ?");
    params.push(now, id);

    await db.run(
      `UPDATE communication_messages SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    const updated = await db.get<Record<string, unknown>>(
      "SELECT * FROM communication_messages WHERE id = ?",
      [id],
    );

    if (!updated) {
      throw new NotFoundError("Message not found after update");
    }

    res.json({ success: true, data: rowToMessage(updated) });
  }),
);

/**
 * DELETE /api/communication/messages/:id
 */
router.delete(
  "/messages/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await db.run(
      "DELETE FROM communication_messages WHERE id = ?",
      [req.params.id],
    );

    if (result.changes === 0) {
      throw new NotFoundError("Message not found");
    }

    res.json({ success: true, message: "Message deleted" });
  }),
);

// ============================================================================
// NOTIFICATIONS ROUTES
// ============================================================================

/**
 * GET /api/communication/notifications
 */
router.get(
  "/notifications",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = notificationQuerySchema.parse(req.query);
    const { userId, type, read, dismissed, priority, limit, offset } =
      validated;

    let sql = "SELECT * FROM communication_notifications WHERE 1=1";
    const params: SqlValue[] = [];

    if (userId) {
      sql += " AND user_id = ?";
      params.push(userId);
    }
    if (type) {
      sql += " AND type = ?";
      params.push(type);
    }
    if (read !== undefined) {
      sql += " AND read = ?";
      params.push(read ? 1 : 0);
    }
    if (dismissed !== undefined) {
      sql += " AND dismissed = ?";
      params.push(dismissed ? 1 : 0);
    }
    if (priority) {
      sql += " AND priority = ?";
      params.push(priority);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rows = await db.all<Record<string, unknown>>(sql, params);
    const notifications = rows.map(rowToNotification);

    res.json({
      success: true,
      data: notifications,
      pagination: { limit, offset, total: notifications.length },
    });
  }),
);

/**
 * POST /api/communication/notifications
 */
router.post(
  "/notifications",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createNotificationSchema.parse(req.body);
    const id = randomUUID();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO communication_notifications (
        id, user_id, type, title, message, icon, link, action_label,
        action_url, priority, expires_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validated.userId,
        validated.type,
        validated.title,
        validated.message,
        validated.icon ?? null,
        validated.link ?? null,
        validated.actionLabel ?? null,
        validated.actionUrl ?? null,
        validated.priority,
        validated.expiresAt ?? null,
        now,
        now,
      ],
    );

    const notification: Notification = {
      id,
      ...validated,
      read: false,
      dismissed: false,
      createdAt: now,
      updatedAt: now,
    };

    logger.info(
      { notificationId: id, userId: validated.userId },
      "Notification created",
    );
    res.status(201).json({ success: true, data: notification });
  }),
);

/**
 * PUT /api/communication/notifications/:id
 */
router.put(
  "/notifications/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = updateNotificationSchema.parse(req.body);

    const existing = await db.get<Record<string, unknown>>(
      "SELECT * FROM communication_notifications WHERE id = ?",
      [id],
    );

    if (!existing) {
      throw new NotFoundError("Notification not found");
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const params: SqlValue[] = [];

    if (validated.read !== undefined) {
      updates.push("read = ?", "read_at = ?");
      params.push(validated.read ? 1 : 0, validated.read ? now : null);
    }
    if (validated.dismissed !== undefined) {
      updates.push("dismissed = ?", "dismissed_at = ?");
      params.push(
        validated.dismissed ? 1 : 0,
        validated.dismissed ? now : null,
      );
    }

    updates.push("updated_at = ?");
    params.push(now, id);

    await db.run(
      `UPDATE communication_notifications SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    const updated = await db.get<Record<string, unknown>>(
      "SELECT * FROM communication_notifications WHERE id = ?",
      [id],
    );

    if (!updated) {
      throw new NotFoundError("Notification not found after update");
    }

    res.json({ success: true, data: rowToNotification(updated) });
  }),
);

/**
 * DELETE /api/communication/notifications/:id
 */
router.delete(
  "/notifications/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await db.run(
      "DELETE FROM communication_notifications WHERE id = ?",
      [req.params.id],
    );

    if (result.changes === 0) {
      throw new NotFoundError("Notification not found");
    }

    res.json({ success: true, message: "Notification deleted" });
  }),
);

// ============================================================================
// TEMPLATES ROUTES
// ============================================================================

/**
 * GET /api/communication/templates
 */
router.get(
  "/templates",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = templateQuerySchema.parse(req.query);
    const { type, category, isActive, search } = validated;

    let sql = "SELECT * FROM communication_templates WHERE 1=1";
    const params: SqlValue[] = [];

    if (type) {
      sql += " AND type = ?";
      params.push(type);
    }
    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }
    if (isActive !== undefined) {
      sql += " AND is_active = ?";
      params.push(isActive ? 1 : 0);
    }
    if (search) {
      sql += " AND (name LIKE ? OR body LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += " ORDER BY usage_count DESC, name ASC";

    const rows = await db.all<Record<string, unknown>>(sql, params);
    const templates = rows.map(rowToTemplate);

    res.json({ success: true, data: templates });
  }),
);

/**
 * GET /api/communication/templates/:id
 */
router.get(
  "/templates/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const row = await db.get<Record<string, unknown>>(
      "SELECT * FROM communication_templates WHERE id = ?",
      [req.params.id],
    );

    if (!row) {
      throw new NotFoundError("Template not found");
    }

    res.json({ success: true, data: rowToTemplate(row) });
  }),
);

/**
 * POST /api/communication/templates
 */
router.post(
  "/templates",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createTemplateSchema.parse(req.body);
    const id = randomUUID();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO communication_templates (
        id, name, type, category, subject, body, html, variables_json,
        is_active, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validated.name,
        validated.type,
        validated.category ?? null,
        validated.subject ?? null,
        validated.body,
        validated.html ?? null,
        JSON.stringify(validated.variables),
        validated.isActive ? 1 : 0,
        validated.createdBy,
        now,
        now,
      ],
    );

    const template: Template = {
      id,
      ...validated,
      variables: JSON.stringify(validated.variables),
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    logger.info({ templateId: id, name: validated.name }, "Template created");
    res.status(201).json({ success: true, data: template });
  }),
);

/**
 * PUT /api/communication/templates/:id
 */
router.put(
  "/templates/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = updateTemplateSchema.parse(req.body);

    const existing = await db.get<Record<string, unknown>>(
      "SELECT * FROM communication_templates WHERE id = ?",
      [id],
    );

    if (!existing) {
      throw new NotFoundError("Template not found");
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const params: SqlValue[] = [];

    if (validated.name !== undefined) {
      updates.push("name = ?");
      params.push(validated.name);
    }
    if (validated.category !== undefined) {
      updates.push("category = ?");
      params.push(validated.category);
    }
    if (validated.subject !== undefined) {
      updates.push("subject = ?");
      params.push(validated.subject);
    }
    if (validated.body !== undefined) {
      updates.push("body = ?");
      params.push(validated.body);
    }
    if (validated.html !== undefined) {
      updates.push("html = ?");
      params.push(validated.html);
    }
    if (validated.variables !== undefined) {
      updates.push("variables_json = ?");
      params.push(JSON.stringify(validated.variables));
    }
    if (validated.isActive !== undefined) {
      updates.push("is_active = ?");
      params.push(validated.isActive ? 1 : 0);
    }

    updates.push("updated_at = ?");
    params.push(now, id);

    await db.run(
      `UPDATE communication_templates SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    const updated = await db.get<Record<string, unknown>>(
      "SELECT * FROM communication_templates WHERE id = ?",
      [id],
    );

    if (!updated) {
      throw new NotFoundError("Template not found after update");
    }

    res.json({ success: true, data: rowToTemplate(updated) });
  }),
);

/**
 * DELETE /api/communication/templates/:id
 */
router.delete(
  "/templates/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await db.run(
      "DELETE FROM communication_templates WHERE id = ?",
      [req.params.id],
    );

    if (result.changes === 0) {
      throw new NotFoundError("Template not found");
    }

    res.json({ success: true, message: "Template deleted" });
  }),
);

// ============================================================================
// CALLS ROUTES
// ============================================================================

/**
 * GET /api/communication/calls
 */
router.get(
  "/calls",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = callQuerySchema.parse(req.query);
    const { type, status, from, to, startDate, endDate, limit, offset } =
      validated;

    let sql = "SELECT * FROM communication_calls WHERE 1=1";
    const params: SqlValue[] = [];

    if (type) {
      sql += " AND type = ?";
      params.push(type);
    }
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }
    if (from) {
      sql += ' AND "from" LIKE ?';
      params.push(`%${from}%`);
    }
    if (to) {
      sql += ' AND "to" LIKE ?';
      params.push(`%${to}%`);
    }
    if (startDate) {
      sql += " AND started_at >= ?";
      params.push(startDate);
    }
    if (endDate) {
      sql += " AND started_at <= ?";
      params.push(endDate);
    }

    sql += " ORDER BY started_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rows = await db.all<Record<string, unknown>>(sql, params);
    const calls = rows.map(rowToCall);

    res.json({
      success: true,
      data: calls,
      pagination: { limit, offset, total: calls.length },
    });
  }),
);

/**
 * POST /api/communication/calls
 */
router.post(
  "/calls",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createCallSchema.parse(req.body);
    const id = randomUUID();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO communication_calls (
        id, type, "from", "to", status, duration, recording, notes,
        started_at, ended_at, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validated.type,
        validated.from,
        validated.to,
        validated.status,
        validated.duration ?? null,
        validated.recording ?? null,
        validated.notes ?? null,
        validated.startedAt,
        validated.endedAt ?? null,
        validated.createdBy,
        now,
      ],
    );

    const call: Call = {
      id,
      ...validated,
      createdAt: now,
    };

    logger.info({ callId: id, type: validated.type }, "Call logged");
    res.status(201).json({ success: true, data: call });
  }),
);

/**
 * PUT /api/communication/calls/:id
 */
router.put(
  "/calls/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = updateCallSchema.parse(req.body);

    const existing = await db.get<Record<string, unknown>>(
      "SELECT * FROM communication_calls WHERE id = ?",
      [id],
    );

    if (!existing) {
      throw new NotFoundError("Call not found");
    }

    const updates: string[] = [];
    const params: SqlValue[] = [];

    if (validated.status !== undefined) {
      updates.push("status = ?");
      params.push(validated.status);
    }
    if (validated.duration !== undefined) {
      updates.push("duration = ?");
      params.push(validated.duration);
    }
    if (validated.recording !== undefined) {
      updates.push("recording = ?");
      params.push(validated.recording);
    }
    if (validated.notes !== undefined) {
      updates.push("notes = ?");
      params.push(validated.notes);
    }
    if (validated.endedAt !== undefined) {
      updates.push("ended_at = ?");
      params.push(validated.endedAt);
    }

    params.push(id);

    await db.run(
      `UPDATE communication_calls SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    const updated = await db.get<Record<string, unknown>>(
      "SELECT * FROM communication_calls WHERE id = ?",
      [id],
    );

    if (!updated) {
      throw new NotFoundError("Call not found after update");
    }

    res.json({ success: true, data: rowToCall(updated) });
  }),
);

// ============================================================================
// STATISTICS ROUTES
// ============================================================================

/**
 * GET /api/communication/stats
 */
router.get(
  "/stats",
  asyncHandler(async (req: Request, res: Response) => {
    const messageStats = await db.get<{
      total: number;
      email: number;
      sms: number;
      fax: number;
      internal: number;
      sent: number;
      failed: number;
    }>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN type = 'email' THEN 1 ELSE 0 END) as email,
        SUM(CASE WHEN type = 'sms' THEN 1 ELSE 0 END) as sms,
        SUM(CASE WHEN type = 'fax' THEN 1 ELSE 0 END) as fax,
        SUM(CASE WHEN type = 'internal' THEN 1 ELSE 0 END) as internal,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
       FROM communication_messages`,
    );

    const notificationStats = await db.get<{
      total: number;
      unread: number;
    }>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN read = 0 THEN 1 ELSE 0 END) as unread
       FROM communication_notifications`,
    );

    const callStats = await db.get<{
      total: number;
      inbound: number;
      outbound: number;
      missed: number;
      totalDuration: number;
    }>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN type = 'inbound' THEN 1 ELSE 0 END) as inbound,
        SUM(CASE WHEN type = 'outbound' THEN 1 ELSE 0 END) as outbound,
        SUM(CASE WHEN type = 'missed' THEN 1 ELSE 0 END) as missed,
        COALESCE(SUM(duration), 0) as totalDuration
       FROM communication_calls`,
    );

    const templateStats = await db.get<{
      total: number;
      active: number;
    }>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
       FROM communication_templates`,
    );

    res.json({
      success: true,
      data: {
        messages: messageStats,
        notifications: notificationStats,
        calls: callStats,
        templates: templateStats,
      },
    });
  }),
);

export default router;
