// SPDX-License-Identifier: MIT
// apps/backend/src/routes/crm/types.ts

/**
 * CRM Module Type Definitions
 *
 * Comprehensive type system for Customer Relationship Management including
 * customers, contacts, opportunities, and activities.
 *
 * @module routes/crm/types
 */

import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const CUSTOMER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PROSPECT: "prospect",
  ARCHIVED: "archived",
} as const;

export const OPPORTUNITY_STATUS = {
  OPEN: "open",
  WON: "won",
  LOST: "lost",
  CANCELLED: "cancelled",
} as const;

export const OPPORTUNITY_STAGE = {
  LEAD: "lead",
  QUALIFIED: "qualified",
  PROPOSAL: "proposal",
  NEGOTIATION: "negotiation",
  CLOSED: "closed",
} as const;

export const ACTIVITY_TYPE = {
  CALL: "call",
  MEETING: "meeting",
  EMAIL: "email",
  TASK: "task",
  NOTE: "note",
  DEMO: "demo",
} as const;

export const ACTIVITY_STATUS = {
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const ACTIVITY_OUTCOME = {
  POSITIVE: "positive",
  NEUTRAL: "neutral",
  NEGATIVE: "negative",
  NO_RESPONSE: "no_response",
} as const;

// ============================================================================
// INTERFACES
// ============================================================================

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  status: (typeof CUSTOMER_STATUS)[keyof typeof CUSTOMER_STATUS];
  category?: string;
  industry?: string;
  website?: string;
  taxId?: string;
  notes?: string;
  assignedTo?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  department?: string;
  isPrimary: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  customerId: string;
  contactId?: string;
  title: string;
  description?: string;
  value: number;
  probability: number;
  status: (typeof OPPORTUNITY_STATUS)[keyof typeof OPPORTUNITY_STATUS];
  stage: (typeof OPPORTUNITY_STAGE)[keyof typeof OPPORTUNITY_STAGE];
  expectedCloseDate?: string;
  actualCloseDate?: string;
  assignedTo?: string;
  source?: string;
  competitors?: string;
  nextStep?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  customerId?: string;
  contactId?: string;
  opportunityId?: string;
  type: (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE];
  subject: string;
  description?: string;
  status: (typeof ACTIVITY_STATUS)[keyof typeof ACTIVITY_STATUS];
  scheduledAt?: string;
  completedAt?: string;
  durationMinutes?: number;
  assignedTo?: string;
  outcome?: (typeof ACTIVITY_OUTCOME)[keyof typeof ACTIVITY_OUTCOME];
  location?: string;
  attendees?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CRMStats {
  customers: {
    total: number;
    active: number;
    inactive: number;
    prospects: number;
    archived: number;
  };
  contacts: {
    total: number;
    primary: number;
  };
  opportunities: {
    total: number;
    open: number;
    won: number;
    lost: number;
    totalValue: number;
    avgValue: number;
    avgProbability: number;
  };
  activities: {
    total: number;
    planned: number;
    completed: number;
    thisMonth: number;
  };
}

// ============================================================================
// ZOD SCHEMAS - CUSTOMER
// ============================================================================

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  status: z
    .enum(["active", "inactive", "prospect", "archived"])
    .default("prospect"),
  category: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  website: z.string().url().optional(),
  taxId: z.string().max(50).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  createdBy: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerQuerySchema = z.object({
  status: z.enum(["active", "inactive", "prospect", "archived"]).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  industry: z.string().optional(),
  assignedTo: z.string().optional(),
  limit: z.coerce.number().int().positive().max(1000).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

// ============================================================================
// ZOD SCHEMAS - CONTACT
// ============================================================================

export const createContactSchema = z.object({
  customerId: z.string(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  mobile: z.string().max(50).optional(),
  position: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export const contactQuerySchema = z.object({
  customerId: z.string().optional(),
  search: z.string().optional(),
  isPrimary: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().positive().max(1000).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

// ============================================================================
// ZOD SCHEMAS - OPPORTUNITY
// ============================================================================

export const createOpportunitySchema = z.object({
  customerId: z.string(),
  contactId: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  value: z.number().nonnegative().default(0),
  probability: z.number().int().min(0).max(100).default(50),
  status: z.enum(["open", "won", "lost", "cancelled"]).default("open"),
  stage: z
    .enum(["lead", "qualified", "proposal", "negotiation", "closed"])
    .default("lead"),
  expectedCloseDate: z.string().datetime().optional(),
  actualCloseDate: z.string().datetime().optional(),
  assignedTo: z.string().optional(),
  source: z.string().max(100).optional(),
  competitors: z.string().optional(),
  nextStep: z.string().max(500).optional(),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();

export const opportunityQuerySchema = z.object({
  customerId: z.string().optional(),
  status: z.enum(["open", "won", "lost", "cancelled"]).optional(),
  stage: z
    .enum(["lead", "qualified", "proposal", "negotiation", "closed"])
    .optional(),
  assignedTo: z.string().optional(),
  minValue: z.coerce.number().nonnegative().optional(),
  maxValue: z.coerce.number().nonnegative().optional(),
  limit: z.coerce.number().int().positive().max(1000).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

// ============================================================================
// ZOD SCHEMAS - ACTIVITY
// ============================================================================

export const createActivitySchema = z.object({
  customerId: z.string().optional(),
  contactId: z.string().optional(),
  opportunityId: z.string().optional(),
  type: z.enum(["call", "meeting", "email", "task", "note", "demo"]),
  subject: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z
    .enum(["planned", "in_progress", "completed", "cancelled"])
    .default("planned"),
  scheduledAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().positive().optional(),
  assignedTo: z.string().optional(),
  outcome: z
    .enum(["positive", "neutral", "negative", "no_response"])
    .optional(),
  location: z.string().max(200).optional(),
  attendees: z.string().optional(),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
});

export const updateActivitySchema = createActivitySchema.partial();

export const activityQuerySchema = z.object({
  customerId: z.string().optional(),
  contactId: z.string().optional(),
  opportunityId: z.string().optional(),
  type: z.enum(["call", "meeting", "email", "task", "note", "demo"]).optional(),
  status: z
    .enum(["planned", "in_progress", "completed", "cancelled"])
    .optional(),
  assignedTo: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(1000).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isValidCustomerStatus(
  status: string,
): status is (typeof CUSTOMER_STATUS)[keyof typeof CUSTOMER_STATUS] {
  return Object.values(CUSTOMER_STATUS).includes(
    status as (typeof CUSTOMER_STATUS)[keyof typeof CUSTOMER_STATUS],
  );
}

export function isValidOpportunityStatus(
  status: string,
): status is (typeof OPPORTUNITY_STATUS)[keyof typeof OPPORTUNITY_STATUS] {
  return Object.values(OPPORTUNITY_STATUS).includes(
    status as (typeof OPPORTUNITY_STATUS)[keyof typeof OPPORTUNITY_STATUS],
  );
}

export function isValidOpportunityStage(
  stage: string,
): stage is (typeof OPPORTUNITY_STAGE)[keyof typeof OPPORTUNITY_STAGE] {
  return Object.values(OPPORTUNITY_STAGE).includes(
    stage as (typeof OPPORTUNITY_STAGE)[keyof typeof OPPORTUNITY_STAGE],
  );
}

export function isValidActivityType(
  type: string,
): type is (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE] {
  return Object.values(ACTIVITY_TYPE).includes(
    type as (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE],
  );
}

export function isValidActivityStatus(
  status: string,
): status is (typeof ACTIVITY_STATUS)[keyof typeof ACTIVITY_STATUS] {
  return Object.values(ACTIVITY_STATUS).includes(
    status as (typeof ACTIVITY_STATUS)[keyof typeof ACTIVITY_STATUS],
  );
}

export function isValidActivityOutcome(
  outcome: string,
): outcome is (typeof ACTIVITY_OUTCOME)[keyof typeof ACTIVITY_OUTCOME] {
  return Object.values(ACTIVITY_OUTCOME).includes(
    outcome as (typeof ACTIVITY_OUTCOME)[keyof typeof ACTIVITY_OUTCOME],
  );
}
