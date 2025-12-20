// SPDX-License-Identifier: MIT
// apps/backend/src/routes/documents/services/documentService.ts

/**
 * Document Service
 * Business Logic für Dokumentenverwaltung
 */

import { Database } from "better-sqlite3";
import crypto from "crypto";
import pino from "pino";
import { NotFoundError, ForbiddenError } from "../../error/errors.js";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

export interface Document {
  id: string;
  title: string;
  category: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  checksum: string;
  uploaded_at: string;
  uploaded_by: string;
  current_version: number;
  status: string;
  retention_years: number;
  retention_expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: number;
  file_name: string;
  storage_path: string;
  file_size: number;
  checksum: string;
  uploaded_by: string;
  changes?: string;
  created_at: string;
}

export interface UploadDocumentDto {
  title: string;
  category: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  retentionYears?: number;
}

/**
 * Document Service Class
 */
export class DocumentService {
  constructor(private db: Database) {}

  /**
   * Alle Dokumente abrufen
   */
  async getAllDocuments(filters?: {
    category?: string;
    status?: string;
    userId?: string;
  }): Promise<Document[]> {
    let query = "SELECT * FROM documents WHERE 1=1";
    const params: any[] = [];

    if (filters?.category) {
      query += " AND category = ?";
      params.push(filters.category);
    }

    if (filters?.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }

    if (filters?.userId) {
      query += " AND uploaded_by = ?";
      params.push(filters.userId);
    }

    query += " ORDER BY created_at DESC";

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as Document[];
  }

  /**
   * Dokument nach ID abrufen
   */
  async getDocumentById(id: string): Promise<Document> {
    const stmt = this.db.prepare("SELECT * FROM documents WHERE id = ?");
    const document = stmt.get(id) as Document | undefined;

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    return document;
  }

  /**
   * Dokument erstellen
   */
  async createDocument(
    data: UploadDocumentDto,
    fileInfo: {
      fileName: string;
      fileType: string;
      fileSize: number;
      storagePath: string;
      buffer: Buffer;
    },
    userId: string,
  ): Promise<Document> {
    const checksum = this.calculateChecksum(fileInfo.buffer);
    const retentionYears = data.retentionYears || 10;
    const retentionExpiry = this.calculateRetentionExpiry(retentionYears);

    const stmt = this.db.prepare(`
      INSERT INTO documents (
        title, category, file_name, file_type, file_size,
        storage_path, checksum, uploaded_by, retention_years, retention_expires_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.title,
      data.category,
      fileInfo.fileName,
      fileInfo.fileType,
      fileInfo.fileSize,
      fileInfo.storagePath,
      checksum,
      userId,
      retentionYears,
      retentionExpiry,
    );

    const documentId = this.getLastInsertId();

    // Metadaten speichern
    if (data.metadata) {
      this.saveMetadata(documentId, data.metadata);
    }

    // Tags speichern
    if (data.tags) {
      this.saveTags(documentId, data.tags, "manual");
    }

    // Audit-Log
    this.logAudit({
      document_id: documentId,
      action: "created",
      user_id: userId,
    });

    logger.info({ documentId }, "Document created");

    return this.getDocumentById(documentId);
  }

  /**
   * Neue Version hochladen
   */
  async uploadVersion(
    documentId: string,
    fileInfo: {
      fileName: string;
      fileSize: number;
      storagePath: string;
      buffer: Buffer;
    },
    changes: string,
    userId: string,
  ): Promise<DocumentVersion> {
    const document = await this.getDocumentById(documentId);
    const checksum = this.calculateChecksum(fileInfo.buffer);
    const newVersion = document.current_version + 1;

    // Version speichern
    const stmt = this.db.prepare(`
      INSERT INTO document_versions (
        document_id, version, file_name, storage_path,
        file_size, checksum, uploaded_by, changes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      documentId,
      newVersion,
      fileInfo.fileName,
      fileInfo.storagePath,
      fileInfo.fileSize,
      checksum,
      userId,
      changes,
    );

    const versionId = this.getLastInsertId();

    // Dokument aktualisieren
    const updateStmt = this.db.prepare(`
      UPDATE documents
      SET current_version = ?,
          file_name = ?,
          file_type = ?,
          file_size = ?,
          storage_path = ?,
          checksum = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(
      newVersion,
      fileInfo.fileName,
      document.file_type,
      fileInfo.fileSize,
      fileInfo.storagePath,
      checksum,
      documentId,
    );

    // Audit-Log
    this.logAudit({
      document_id: documentId,
      action: "version_uploaded",
      user_id: userId,
      changes: JSON.stringify({ version: newVersion, changes }),
    });

    logger.info({ documentId, version: newVersion }, "Version uploaded");

    const versionStmt = this.db.prepare(
      "SELECT * FROM document_versions WHERE id = ?",
    );
    return versionStmt.get(versionId) as DocumentVersion;
  }

  /**
   * Dokument löschen (Soft Delete)
   */
  async deleteDocument(id: string, userId: string): Promise<void> {
    const document = await this.getDocumentById(id);

    // Retention Policy prüfen
    if (document.retention_expires_at) {
      const now = new Date();
      const expiryDate = new Date(document.retention_expires_at);

      if (now < expiryDate) {
        throw new ForbiddenError(
          `Document cannot be deleted before ${document.retention_expires_at}`,
        );
      }
    }

    const stmt = this.db.prepare(
      "UPDATE documents SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    );
    stmt.run(id);

    // Audit-Log
    this.logAudit({
      document_id: id,
      action: "deleted",
      user_id: userId,
    });

    logger.info({ documentId: id }, "Document deleted");
  }

  /**
   * Versionen eines Dokuments abrufen
   */
  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    const stmt = this.db.prepare(
      "SELECT * FROM document_versions WHERE document_id = ? ORDER BY version DESC",
    );
    return stmt.all(documentId) as DocumentVersion[];
  }

  /**
   * Metadaten speichern/aktualisieren
   */
  saveMetadata(documentId: string, metadata: Record<string, any>): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO document_metadata (document_id, metadata)
      VALUES (?, ?)
    `);
    stmt.run(documentId, JSON.stringify(metadata));
  }

  /**
   * Metadaten abrufen
   */
  getMetadata(documentId: string): Record<string, any> | null {
    const stmt = this.db.prepare(
      "SELECT metadata FROM document_metadata WHERE document_id = ?",
    );
    const result = stmt.get(documentId) as { metadata: string } | undefined;

    if (!result) return null;

    return JSON.parse(result.metadata);
  }

  /**
   * Tags speichern
   */
  saveTags(
    documentId: string,
    tags: string[],
    source: "manual" | "ai_generated" | "ocr_extracted",
    confidence?: number,
  ): void {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO document_tags (document_id, tag, source, confidence)
      VALUES (?, ?, ?, ?)
    `);

    for (const tag of tags) {
      stmt.run(documentId, tag, source, confidence || null);
    }
  }

  /**
   * Tags abrufen
   */
  getTags(documentId: string): Array<{
    tag: string;
    source: string;
    confidence: number | null;
  }> {
    const stmt = this.db.prepare(
      "SELECT tag, source, confidence FROM document_tags WHERE document_id = ? ORDER BY created_at",
    );
    return stmt.all(documentId) as Array<{
      tag: string;
      source: string;
      confidence: number | null;
    }>;
  }

  /**
   * Statistiken abrufen
   */
  getStatistics(): {
    totalDocuments: number;
    totalSize: number;
    byCategory: Record<string, number>;
  } {
    const totalStmt = this.db.prepare(
      "SELECT COUNT(*) as count, SUM(file_size) as totalSize FROM documents WHERE status = 'active'",
    );
    const totals = totalStmt.get() as { count: number; totalSize: number };

    const categoryStmt = this.db.prepare(
      "SELECT category, COUNT(*) as count FROM documents WHERE status = 'active' GROUP BY category",
    );
    const categories = categoryStmt.all() as Array<{
      category: string;
      count: number;
    }>;

    const byCategory: Record<string, number> = {};
    for (const cat of categories) {
      byCategory[cat.category] = cat.count;
    }

    return {
      totalDocuments: totals.count,
      totalSize: totals.totalSize || 0,
      byCategory,
    };
  }

  /**
   * Ablaufende Dokumente abrufen
   */
  getExpiringDocuments(days: number = 30): Document[] {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const stmt = this.db.prepare(`
      SELECT * FROM documents
      WHERE status = 'active'
        AND retention_expires_at IS NOT NULL
        AND retention_expires_at <= ?
      ORDER BY retention_expires_at ASC
    `);

    return stmt.all(futureDate.toISOString()) as Document[];
  }

  /**
   * Hilfsfunktionen
   */
  private calculateChecksum(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  private calculateRetentionExpiry(years: number): string {
    const now = new Date();
    now.setFullYear(now.getFullYear() + years);
    return now.toISOString();
  }

  private getLastInsertId(): string {
    const stmt = this.db.prepare("SELECT last_insert_rowid() as id");
    const result = stmt.get() as { id: number };
    // Convert to hex string for UUID-like format
    return result.id.toString(16).padStart(32, "0");
  }

  private logAudit(data: {
    document_id?: string;
    action: string;
    user_id?: string;
    changes?: string;
  }): void {
    const stmt = this.db.prepare(`
      INSERT INTO document_audit_log (document_id, action, user_id, changes)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(
      data.document_id || null,
      data.action,
      data.user_id || null,
      data.changes || null,
    );
  }
}
