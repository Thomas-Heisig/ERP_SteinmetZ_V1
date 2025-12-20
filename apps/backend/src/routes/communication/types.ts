// SPDX-License-Identifier: MIT
// apps/backend/src/routes/communication/types.ts

/**
 * Communication Module Type Definitions
 * 
 * Comprehensive type system for messaging, notifications, emails, and templates.
 * 
 * @module routes/communication/types
 */

import { z } from "zod";

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export const MESSAGE_TYPES = [
  "email",
  "sms",
  "fax",
  "call",
  "internal",
] as const;

export type MessageType = (typeof MESSAGE_TYPES)[number];

export const MESSAGE_STATUS = [
  "draft",
  "pending",
  "sent",
  "delivered",
  "read",
  "failed",
  "cancelled",
] as const;

export type MessageStatus = (typeof MESSAGE_STATUS)[number];

export const MESSAGE_PRIORITY = ["low", "normal", "high", "urgent"] as const;

export type MessagePriority = (typeof MESSAGE_PRIORITY)[number];

export interface Message {
  id: string;
  type: MessageType;
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  body: string;
  html?: string;
  priority: MessagePriority;
  status: MessageStatus;
  
  // Metadata
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedReason?: string;
  
  // Attachments
  attachments?: string; // JSON array
  
  // References
  replyTo?: string;
  inReplyTo?: string;
  threadId?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export const NOTIFICATION_TYPES = [
  "info",
  "success",
  "warning",
  "error",
  "task",
  "reminder",
  "mention",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  
  // Actions
  link?: string;
  actionLabel?: string;
  actionUrl?: string;
  
  // State
  read: boolean;
  readAt?: string;
  dismissed: boolean;
  dismissedAt?: string;
  
  // Priority
  priority: MessagePriority;
  expiresAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export const TEMPLATE_TYPES = ["email", "sms", "notification"] as const;

export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  category?: string;
  
  // Content
  subject?: string;
  body: string;
  html?: string;
  
  // Variables
  variables: string; // JSON array of variable names
  
  // Metadata
  isActive: boolean;
  usageCount: number;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CALL TYPES
// ============================================================================

export const CALL_TYPES = ["inbound", "outbound", "missed"] as const;

export type CallType = (typeof CALL_TYPES)[number];

export const CALL_STATUS = [
  "ringing",
  "answered",
  "voicemail",
  "busy",
  "failed",
  "completed",
] as const;

export type CallStatus = (typeof CALL_STATUS)[number];

export interface Call {
  id: string;
  type: CallType;
  from: string;
  to: string;
  status: CallStatus;
  
  // Details
  duration?: number; // seconds
  recording?: string;
  notes?: string;
  
  // Timestamps
  startedAt: string;
  endedAt?: string;
  
  createdBy: string;
  createdAt: string;
}

// ============================================================================
// STATISTICS
// ============================================================================

export interface CommunicationStats {
  messages: {
    total: number;
    byType: Record<MessageType, number>;
    byStatus: Record<MessageStatus, number>;
    sentToday: number;
    failedToday: number;
  };
  notifications: {
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
  };
  calls: {
    total: number;
    inbound: number;
    outbound: number;
    missed: number;
    totalDuration: number;
  };
  templates: {
    total: number;
    byType: Record<TemplateType, number>;
    mostUsed: Array<{ id: string; name: string; count: number }>;
  };
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

// Message Schemas
export const createMessageSchema = z.object({
  type: z.enum(MESSAGE_TYPES),
  from: z.string().min(1),
  to: z.string().min(1),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().max(500).optional(),
  body: z.string().min(1),
  html: z.string().optional(),
  priority: z.enum(MESSAGE_PRIORITY).default("normal"),
  attachments: z.array(z.string()).optional(),
  replyTo: z.string().optional(),
  inReplyTo: z.string().optional(),
  threadId: z.string().optional(),
  createdBy: z.string().default("system"),
});

export const updateMessageSchema = z.object({
  status: z.enum(MESSAGE_STATUS).optional(),
  readAt: z.string().optional(),
  failedReason: z.string().optional(),
});

export const messageQuerySchema = z.object({
  type: z.enum(MESSAGE_TYPES).optional(),
  status: z.enum(MESSAGE_STATUS).optional(),
  priority: z.enum(MESSAGE_PRIORITY).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  search: z.string().optional(),
  threadId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
});

// Notification Schemas
export const createNotificationSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(NOTIFICATION_TYPES).default("info"),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  icon: z.string().optional(),
  link: z.string().optional(),
  actionLabel: z.string().optional(),
  actionUrl: z.string().optional(),
  priority: z.enum(MESSAGE_PRIORITY).default("normal"),
  expiresAt: z.string().optional(),
});

export const updateNotificationSchema = z.object({
  read: z.boolean().optional(),
  dismissed: z.boolean().optional(),
});

export const notificationQuerySchema = z.object({
  userId: z.string().optional(),
  type: z.enum(NOTIFICATION_TYPES).optional(),
  read: z.coerce.boolean().optional(),
  dismissed: z.coerce.boolean().optional(),
  priority: z.enum(MESSAGE_PRIORITY).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

// Template Schemas
export const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(TEMPLATE_TYPES),
  category: z.string().optional(),
  subject: z.string().max(500).optional(),
  body: z.string().min(1),
  html: z.string().optional(),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdBy: z.string().default("system"),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.string().optional(),
  subject: z.string().max(500).optional(),
  body: z.string().min(1).optional(),
  html: z.string().optional(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const templateQuerySchema = z.object({
  type: z.enum(TEMPLATE_TYPES).optional(),
  category: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// Call Schemas
export const createCallSchema = z.object({
  type: z.enum(CALL_TYPES),
  from: z.string().min(1),
  to: z.string().min(1),
  status: z.enum(CALL_STATUS).default("ringing"),
  duration: z.number().min(0).optional(),
  recording: z.string().optional(),
  notes: z.string().optional(),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  createdBy: z.string().default("system"),
});

export const updateCallSchema = z.object({
  status: z.enum(CALL_STATUS).optional(),
  duration: z.number().min(0).optional(),
  recording: z.string().optional(),
  notes: z.string().optional(),
  endedAt: z.string().optional(),
});

export const callQuerySchema = z.object({
  type: z.enum(CALL_TYPES).optional(),
  status: z.enum(CALL_STATUS).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(500).default(100),
  offset: z.coerce.number().min(0).default(0),
});

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isValidMessageType(value: unknown): value is MessageType {
  return typeof value === "string" && MESSAGE_TYPES.includes(value as MessageType);
}

export function isValidMessageStatus(value: unknown): value is MessageStatus {
  return typeof value === "string" && MESSAGE_STATUS.includes(value as MessageStatus);
}

export function isValidNotificationType(value: unknown): value is NotificationType {
  return typeof value === "string" && NOTIFICATION_TYPES.includes(value as NotificationType);
}

export function isValidTemplateType(value: unknown): value is TemplateType {
  return typeof value === "string" && TEMPLATE_TYPES.includes(value as TemplateType);
}
