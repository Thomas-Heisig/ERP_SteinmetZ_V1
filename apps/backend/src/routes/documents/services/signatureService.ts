// SPDX-License-Identifier: MIT
// apps/backend/src/routes/documents/services/signatureService.ts

/**
 * Signature Service
 * Business Logic für E-Signaturen
 */

import { Database } from "better-sqlite3";
import pino from "pino";
import { NotFoundError } from "../../error/errors.js";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

export interface Signature {
  id: string;
  document_id: string;
  signer_email: string;
  status: "pending" | "signed" | "declined" | "expired";
  provider?: string;
  provider_envelope_id?: string;
  signed_at?: string;
  ip_address?: string;
  created_at: string;
  expires_at?: string;
}

export interface CreateSignatureDto {
  signers: string[];
  message?: string;
  provider?: string;
}

/**
 * Signature Service Class
 */
export class SignatureService {
  constructor(private db: Database) {}

  /**
   * Signatur-Anfrage erstellen
   */
  async createSignatureRequest(
    documentId: string,
    data: CreateSignatureDto
  ): Promise<Signature[]> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 Tage Gültigkeit

    const signatures: Signature[] = [];

    for (const signer of data.signers) {
      const stmt = this.db.prepare(`
        INSERT INTO document_signatures (
          document_id, signer_email, provider, expires_at
        )
        VALUES (?, ?, ?, ?)
      `);

      stmt.run(
        documentId,
        signer,
        data.provider || "docusign",
        expiresAt.toISOString()
      );

      const signatureId = this.getLastInsertId();

      const getStmt = this.db.prepare(
        "SELECT * FROM document_signatures WHERE id = ?"
      );
      const signature = getStmt.get(signatureId) as Signature;

      signatures.push(signature);
    }

    logger.info({ documentId, signers: data.signers.length }, "Signature request created");

    return signatures;
  }

  /**
   * Signaturen eines Dokuments abrufen
   */
  async getDocumentSignatures(documentId: string): Promise<Signature[]> {
    const stmt = this.db.prepare(
      "SELECT * FROM document_signatures WHERE document_id = ? ORDER BY created_at DESC"
    );
    return stmt.all(documentId) as Signature[];
  }

  /**
   * Signatur aktualisieren
   */
  async updateSignatureStatus(
    id: string,
    status: "signed" | "declined" | "expired",
    ipAddress?: string
  ): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE document_signatures
      SET status = ?,
          signed_at = CURRENT_TIMESTAMP,
          ip_address = ?
      WHERE id = ?
    `);

    stmt.run(status, ipAddress || null, id);

    logger.info({ signatureId: id, status }, "Signature status updated");
  }

  /**
   * Pending Signaturen zählen
   */
  getPendingSignaturesCount(): number {
    const stmt = this.db.prepare(
      "SELECT COUNT(*) as count FROM document_signatures WHERE status = 'pending'"
    );
    const result = stmt.get() as { count: number };
    return result.count;
  }

  /**
   * Hilfsfunktionen
   */
  private getLastInsertId(): string {
    const stmt = this.db.prepare("SELECT last_insert_rowid() as id");
    const result = stmt.get() as { id: number };
    return result.id.toString(16).padStart(32, "0");
  }
}
