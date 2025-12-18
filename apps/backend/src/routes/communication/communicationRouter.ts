// SPDX-License-Identifier: MIT
// apps/backend/src/routes/communication/communicationRouter.ts

/**
 * Communication Center Router
 *
 * Provides API for messaging, notifications, email, fax, and phone call management.
 *
 * @module routes/communication
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { NotFoundError, ValidationError } from "../../types/errors.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import pino from "pino";

const router = Router();
const _logger = pino({ level: process.env.LOG_LEVEL || "info" }); // Reserved for future logging

// Validation schemas
const messageQuerySchema = z.object({
  type: z.enum(["email", "sms", "fax", "call", "internal"]).optional(),
  status: z.enum(["sent", "received", "pending", "failed"]).optional(),
  search: z.string().optional(),
});

const createMessageSchema = z.object({
  type: z.enum(["email", "sms", "fax", "call", "internal"]),
  to: z.string().min(1),
  from: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});

const createNotificationSchema = z.object({
  userId: z.string(),
  title: z.string().min(1).max(200),
  message: z.string(),
  type: z.enum(["info", "warning", "error", "success"]).default("info"),
  link: z.string().optional(),
});

// In-memory storage
const messages = new Map<string, any>();
const notifications = new Map<string, any>();
const calls = new Map<string, any>();
let messageCounter = 0;
let notificationCounter = 0;
let callCounter = 0;

/**
 * GET /api/communication/messages
 * List all messages
 */
router.get(
  "/messages",
  asyncHandler(async (req: Request, res: Response) => {
    const query = messageQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw new ValidationError("Invalid query parameters", query.error.issues);
    }

    const { type, status, search } = query.data;
    let results = Array.from(messages.values());

    // Apply filters
    if (type) {
      results = results.filter((m) => m.type === type);
    }
    if (status) {
      results = results.filter((m) => m.status === status);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(
        (m) =>
          m.to?.toLowerCase().includes(searchLower) ||
          m.from?.toLowerCase().includes(searchLower) ||
          m.subject?.toLowerCase().includes(searchLower) ||
          m.body?.toLowerCase().includes(searchLower),
      );
    }

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  }),
);

/**
 * GET /api/communication/messages/:id
 * Get a specific message
 */
router.get(
  "/messages/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const message = messages.get(req.params.id);

    if (!message) {
      throw new NotFoundError("Message not found");
    }

    res.json({
      success: true,
      data: message,
    });
  }),
);

/**
 * POST /api/communication/messages
 * Send a new message
 */
router.post(
  "/messages",
  asyncHandler(async (req: Request, res: Response) => {
    const validation = createMessageSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError(
        "Invalid message data",
        validation.error.issues,
      );
    }

    const id = `msg-${++messageCounter}`;
    const message = {
      id,
      ...validation.data,
      status: "sent",
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    messages.set(id, message);

    res.status(201).json({
      success: true,
      data: message,
    });
  }),
);

/**
 * GET /api/communication/notifications
 * List all notifications
 */
router.get(
  "/notifications",
  asyncHandler(async (req: Request, res: Response) => {
    const results = Array.from(notifications.values());

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  }),
);

/**
 * POST /api/communication/notifications
 * Create a new notification
 */
router.post(
  "/notifications",
  asyncHandler(async (req: Request, res: Response) => {
    const validation = createNotificationSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError(
        "Invalid notification data",
        validation.error.issues,
      );
    }

    const id = `notif-${++notificationCounter}`;
    const notification = {
      id,
      ...validation.data,
      read: false,
      createdAt: new Date().toISOString(),
    };

    notifications.set(id, notification);

    res.status(201).json({
      success: true,
      data: notification,
    });
  }),
);

/**
 * PUT /api/communication/notifications/:id/read
 * Mark a notification as read
 */
router.put(
  "/notifications/:id/read",
  asyncHandler(async (req: Request, res: Response) => {
    const notification = notifications.get(req.params.id);

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    notification.read = true;
    notification.readAt = new Date().toISOString();
    notifications.set(req.params.id, notification);

    res.json({
      success: true,
      data: notification,
    });
  }),
);

/**
 * GET /api/communication/calls
 * List all calls
 */
router.get(
  "/calls",
  asyncHandler(async (req: Request, res: Response) => {
    const results = Array.from(calls.values());

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  }),
);

/**
 * POST /api/communication/calls
 * Log a new call
 */
router.post(
  "/calls",
  asyncHandler(async (req: Request, res: Response) => {
    const id = `call-${++callCounter}`;
    const call = {
      id,
      ...req.body,
      status: req.body.status || "completed",
      timestamp: new Date().toISOString(),
    };

    calls.set(id, call);

    res.status(201).json({
      success: true,
      data: call,
    });
  }),
);

/**
 * GET /api/communication/stats
 * Get communication statistics
 */
router.get(
  "/stats",
  asyncHandler(async (req: Request, res: Response) => {
    const allMessages = Array.from(messages.values());
    const allNotifications = Array.from(notifications.values());

    const stats = {
      totalMessages: messages.size,
      emailsSent: allMessages.filter((m) => m.type === "email").length,
      smsSent: allMessages.filter((m) => m.type === "sms").length,
      faxesSent: allMessages.filter((m) => m.type === "fax").length,
      totalCalls: calls.size,
      totalNotifications: notifications.size,
      unreadNotifications: allNotifications.filter((n) => !n.read).length,
    };

    res.json({
      success: true,
      data: stats,
    });
  }),
);

export default router;
