// SPDX-License-Identifier: MIT
// apps/backend/src/routes/documents/services/retentionService.ts

/**
 * Retention Service
 * Business Logic für Aufbewahrungsrichtlinien
 */

import { Database } from "better-sqlite3";
import pino from "pino";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

export interface RetentionPolicy {
  id: string;
  category: string;
  retention_years: number;
  description: string;
  legal_basis: string;
  created_at: string;
  updated_at: string;
}

/**
 * Retention Service Class
 */
export class RetentionService {
  constructor(private db: Database) {}

  /**
   * Alle Retention Policies abrufen
   */
  async getAllPolicies(): Promise<RetentionPolicy[]> {
    const stmt = this.db.prepare(
      "SELECT * FROM retention_policies ORDER BY category"
    );
    return stmt.all() as RetentionPolicy[];
  }

  /**
   * Policy für Kategorie abrufen
   */
  async getPolicyByCategory(category: string): Promise<RetentionPolicy | null> {
    const stmt = this.db.prepare(
      "SELECT * FROM retention_policies WHERE category = ?"
    );
    return stmt.get(category) as RetentionPolicy | null;
  }

  /**
   * Retention Policy eines Dokuments aktualisieren
   */
  async updateDocumentRetention(
    documentId: string,
    retentionYears: number,
    reason: string,
    userId: string
  ): Promise<void> {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + retentionYears);

    const stmt = this.db.prepare(`
      UPDATE documents
      SET retention_years = ?,
          retention_expires_at = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(retentionYears, expiryDate.toISOString(), documentId);

    // Audit-Log
    const auditStmt = this.db.prepare(`
      INSERT INTO document_audit_log (document_id, action, user_id, changes)
      VALUES (?, 'retention_policy_updated', ?, ?)
    `);

    auditStmt.run(
      documentId,
      userId,
      JSON.stringify({ retentionYears, reason })
    );

    logger.info({ documentId, retentionYears }, "Retention policy updated");
  }
}
