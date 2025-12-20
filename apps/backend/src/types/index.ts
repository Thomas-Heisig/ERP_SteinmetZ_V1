// SPDX-License-Identifier: MIT
// apps/backend/src/types/index.ts

/**
 * Zentrale Typendefinitionen für das ERP-SteinmetZ System
 *
 * Dieses Modul exportiert alle zentralen TypeScript-Typen und Zod-Validierungsschemas
 * für das Backend. Es bildet die Single Source of Truth für Datentypkonsistenz.
 *
 * @module types
 */

// ============================================================================
// DATABASE TYPES & SCHEMAS
// ============================================================================

// Note: Ensure ./database.ts exists in this directory
// export type { ... } from "./database.js";
// export { ... } from "./database.js";

// ============================================================================
// ERROR TYPES & CLASSES
// ============================================================================

// Note: Ensure ./errors.ts exists in this directory
// export type { ... } from "./errors.js";
// export { ... } from "./errors.js";

// ============================================================================
// ALLGEMEINE ANWENDUNGS-TYPEN
// ============================================================================

/**
 * Eindeutige Benutzer-ID
 * Format: UUID v4 als String
 */
export type UserId = string & { readonly __brand: "UserId" };

/**
 * Eindeutige Dokument-ID
 * Format: UUID v4 als String
 */
export type DocumentId = string & { readonly __brand: "DocumentId" };

/**
 * Eindeutige Workflow-ID
 * Format: UUID v4 als String
 */
export type WorkflowId = string & { readonly __brand: "WorkflowId" };

/**
 * Eindeutige Rolle-ID
 * Format: Kebab-case String
 */
export type RoleId = string & { readonly __brand: "RoleId" };

/**
 * API-Antwort-Wrapper für einheitliche Responses
 */
export interface ApiResponse<T> {
  /** Erfolgreiche Ausführung */
  success: boolean;
  /** Antwortdaten */
  data?: T;
  /** Fehlermeldung bei Fehler */
  error?: string;
  /** Fehlerdetails */
  errors?: Record<string, string>;
  /** Anzahl Datensätze (bei Listen) */
  count?: number;
  /** Pagination Info */
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  /** Timestamp der Response */
  timestamp: string;
  /** Request-ID für Tracking */
  requestId?: string;
}

/**
 * Pagination Parameter für API-Requests
 */
export interface PaginationParams {
  /** Seitennummer (1-basiert) */
  page?: number;
  /** Datensätze pro Seite */
  limit?: number;
  /** Sortierung: "field" oder "-field" (descending) */
  sort?: string;
}

/**
 * Filter-Parameter für Query
 */
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * Standard Request-Kontext
 */
export interface RequestContext {
  /** Benutzer-ID des anfragenden Benutzers */
  userId: UserId;
  /** Benutzer-Rollen */
  roles: RoleId[];
  /** Request-ID für Tracking */
  requestId: string;
  /** Timestamp des Requests */
  timestamp: Date;
  /** IP-Adresse des Clients */
  ipAddress?: string;
}

/**
 * Audit-Log Eintrag
 */
export interface AuditLogEntry {
  /** Eindeutige ID */
  id: string;
  /** Benutzer der Aktion */
  userId: UserId;
  /** Typ der Aktion */
  action: string;
  /** Betroffene Ressource */
  resource: string;
  /** Ressourcen-ID */
  resourceId: string;
  /** Alte Werte */
  oldValues?: Record<string, unknown>;
  /** Neue Werte */
  newValues?: Record<string, unknown>;
  /** Status */
  status: "success" | "failed";
  /** Fehlermeldung bei Fehler */
  error?: string;
  /** Timestamp */
  createdAt: Date;
}

/**
 * Health-Check Response
 */
export interface HealthCheckResponse {
  /** Gesamtstatus */
  status: "healthy" | "degraded" | "unhealthy";
  /** Timestamp */
  timestamp: string;
  /** Uptime in Sekunden */
  uptime: number;
  /** Komponenten-Status */
  components: {
    database: {
      status: "up" | "down";
      latency?: number;
      driver?: string;
    };
    memory: {
      status: "ok" | "warning" | "critical";
      usage: {
        heapUsed: number;
        heapTotal: number;
      };
    };
    fileSystem?: {
      status: "ok" | "warning" | "critical";
      available: number;
      used: number;
    };
  };
}

// ============================================================================
// EXPORT von Error-Klassen
// ============================================================================

// Note: Ensure ./errors.ts exists in this directory
// export { ... } from "./errors.js";
// export type { ... } from "./errors.js";
