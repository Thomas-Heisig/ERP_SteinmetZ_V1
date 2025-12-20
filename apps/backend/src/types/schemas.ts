// SPDX-License-Identifier: MIT
// apps/backend/src/types/schemas.ts

/**
 * Zod Validierungsschemas für das ERP-SteinmetZ System
 *
 * Dieses Modul enthält alle Zod-Schemas für Request/Response Validierung
 * und typsichere Datenvalidierung an den Systemgrenzen.
 *
 * @module types/schemas
 */

import { z } from "zod";

// ============================================================================
// PAGINIERUNG & FILTER
// ============================================================================

/**
 * Pagination Query Parameter Schema
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

// ============================================================================
// BENUTZER & AUTHENTIFIZIERUNG
// ============================================================================

/**
 * User-Login Schema
 */
export const UserLoginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
});

export type UserLoginInput = z.infer<typeof UserLoginSchema>;

/**
 * User-Registrierung Schema
 */
export const UserRegisterSchema = z
  .object({
    email: z.string().email("Ungültige E-Mail-Adresse"),
    password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
    passwordConfirm: z.string(),
    firstName: z.string().min(1, "Vorname erforderlich"),
    lastName: z.string().min(1, "Nachname erforderlich"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwörter stimmen nicht überein",
    path: ["passwordConfirm"],
  });

export type UserRegisterInput = z.infer<typeof UserRegisterSchema>;

/**
 * User-Profil-Update Schema
 */
export const UserProfileUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
});

export type UserProfileUpdateInput = z.infer<typeof UserProfileUpdateSchema>;

// ============================================================================
// DOKUMENTE
// ============================================================================

/**
 * Dokument-Upload Schema
 */
export const DocumentUploadSchema = z.object({
  title: z.string().min(1, "Titel erforderlich").max(200),
  description: z.string().optional(),
  category: z.enum([
    "invoice",
    "contract",
    "employee_document",
    "report",
    "correspondence",
    "other",
  ]),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  retentionYears: z.number().int().min(1).max(30).default(10),
});

export type DocumentUploadInput = z.infer<typeof DocumentUploadSchema>;

/**
 * Dokument-Suche Schema
 */
export const DocumentSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  fileType: z.string().optional(),
  ...PaginationSchema.shape,
});

export type DocumentSearchInput = z.infer<typeof DocumentSearchSchema>;

/**
 * Dokument-Metadata-Update Schema
 */
export const DocumentMetadataSchema = z.record(z.string(), z.any());

export type DocumentMetadataInput = z.infer<typeof DocumentMetadataSchema>;

// ============================================================================
// WORKFLOWS
// ============================================================================

/**
 * Workflow-Erstellung Schema
 */
export const WorkflowCreateSchema = z.object({
  type: z.enum(["approval", "review", "signature"]),
  approvers: z
    .array(z.string())
    .min(1, "Mindestens ein Genehmiger erforderlich"),
  deadline: z.string().datetime().optional(),
  description: z.string().optional(),
});

export type WorkflowCreateInput = z.infer<typeof WorkflowCreateSchema>;

/**
 * Workflow-Step Approval Schema
 */
export const WorkflowApprovalSchema = z.object({
  stepNumber: z.number().int().min(1),
  comment: z.string().optional(),
});

export type WorkflowApprovalInput = z.infer<typeof WorkflowApprovalSchema>;

/**
 * Workflow-Step Rejection Schema
 */
export const WorkflowRejectionSchema = z.object({
  stepNumber: z.number().int().min(1),
  reason: z.string().min(1, "Grund erforderlich"),
});

export type WorkflowRejectionInput = z.infer<typeof WorkflowRejectionSchema>;

// ============================================================================
// E-SIGNATURES
// ============================================================================

/**
 * Signatur-Anfrage Schema
 */
export const SignatureRequestSchema = z.object({
  signers: z
    .array(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        order: z.number().int().optional(),
      }),
    )
    .min(1, "Mindestens ein Unterzeichner erforderlich"),
  expiresIn: z.number().int().min(1).max(90).default(30),
  message: z.string().optional(),
  provider: z.enum(["internal", "docusign", "adobe_sign"]).default("internal"),
});

export type SignatureRequestInput = z.infer<typeof SignatureRequestSchema>;

/**
 * Signatur-Status-Update Schema
 */
export const SignatureStatusSchema = z.object({
  status: z.enum(["signed", "declined", "expired"]),
  signatureData: z.string().optional(),
  timestamp: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
});

export type SignatureStatusInput = z.infer<typeof SignatureStatusSchema>;

// ============================================================================
// AUFBEWAHRUNGSRICHTLINIEN
// ============================================================================

/**
 * Retention-Policy-Update Schema
 */
export const RetentionPolicySchema = z.object({
  retentionYears: z.number().int().min(1).max(30),
  reason: z.string().optional(),
});

export type RetentionPolicyInput = z.infer<typeof RetentionPolicySchema>;

// ============================================================================
// ROLLEN & BERECHTIGUNGEN
// ============================================================================

/**
 * Rollen-Erstellung Schema
 */
export const RoleCreateSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(
      /^[a-z_]+$/,
      "Rolle-ID muss Kleinbuchstaben und Unterstriche enthalten",
    ),
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export type RoleCreateInput = z.infer<typeof RoleCreateSchema>;

/**
 * Permission Schema
 */
export const PermissionSchema = z.object({
  id: z.string().min(1),
  resource: z.string(),
  action: z.enum(["create", "read", "update", "delete", "execute"]),
  description: z.string().optional(),
});

export type PermissionInput = z.infer<typeof PermissionSchema>;

// ============================================================================
// AUDIT LOGGING
// ============================================================================

/**
 * Audit-Log Filter Schema
 */
export const AuditLogFilterSchema = z.object({
  userId: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  status: z.enum(["success", "failed"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  ...PaginationSchema.shape,
});

export type AuditLogFilterInput = z.infer<typeof AuditLogFilterSchema>;

// ============================================================================
// ERROR RESPONSES
// ============================================================================

/**
 * API Error Response Schema
 */
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  errors: z.record(z.string(), z.string()).optional(),
  timestamp: z.string().datetime(),
  requestId: z.string().optional(),
});

export type ErrorResponseType = z.infer<typeof ErrorResponseSchema>;

/**
 * Validation Error Details Schema
 */
export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  value: z.any().optional(),
});

export type ValidationErrorDetail = z.infer<typeof ValidationErrorSchema>;

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

/**
 * Sicheres Parsing mit detailliertem Error-Handling
 *
 * @param schema - Zod Schema zum Validieren
 * @param data - Zu validierende Daten
 * @returns Validierte Daten oder Fehler-Details
 *
 * @example
 * ```typescript
 * const result = safeParse(UserLoginSchema, loginData);
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.errors);
 * }
 * ```
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
):
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      for (const issue of error.issues) {
        const path = issue.path.join(".");
        errors[path] = issue.message;
      }
      return { success: false, errors };
    }
    return {
      success: false,
      errors: { _global: "Validierungsfehler" },
    };
  }
}
