// SPDX-License-Identifier: MIT
// apps/backend/src/routes/documents/services/searchService.ts

/**
 * Search Service
 * Business Logic für Dokumentensuche
 */

import { Database } from "better-sqlite3";
import pino from "pino";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

export interface SearchResult {
  id: string;
  title: string;
  category: string;
  file_name: string;
  file_type: string;
  uploaded_at: string;
  snippet?: string;
  relevance?: number;
}

export interface SearchQuery {
  query?: string;
  category?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  fileType?: string;
}

/**
 * Search Service Class
 */
export class SearchService {
  constructor(private db: Database) {}

  /**
   * Dokumente durchsuchen
   */
  async searchDocuments(params: SearchQuery): Promise<SearchResult[]> {
    let query = `
      SELECT DISTINCT d.id, d.title, d.category, d.file_name, d.file_type, d.uploaded_at
      FROM documents d
      LEFT JOIN document_tags dt ON d.id = dt.document_id
      LEFT JOIN document_ocr ocr ON d.id = ocr.document_id
      WHERE d.status = 'active'
    `;

    const queryParams: any[] = [];

    // Volltext-Suche
    if (params.query) {
      query += ` AND (
        d.title LIKE ? OR
        d.file_name LIKE ? OR
        ocr.extracted_text LIKE ?
      )`;
      const searchTerm = `%${params.query}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Kategorie-Filter
    if (params.category) {
      query += " AND d.category = ?";
      queryParams.push(params.category);
    }

    // Tags-Filter
    if (params.tags && params.tags.length > 0) {
      const placeholders = params.tags.map(() => "?").join(",");
      query += ` AND dt.tag IN (${placeholders})`;
      queryParams.push(...params.tags);
    }

    // Datumsbereich-Filter
    if (params.startDate) {
      query += " AND d.created_at >= ?";
      queryParams.push(params.startDate);
    }

    if (params.endDate) {
      query += " AND d.created_at <= ?";
      queryParams.push(params.endDate);
    }

    // Dateityp-Filter
    if (params.fileType) {
      query += " AND d.file_type LIKE ?";
      queryParams.push(`%${params.fileType}%`);
    }

    query += " ORDER BY d.created_at DESC LIMIT 100";

    const stmt = this.db.prepare(query);
    const results = stmt.all(...queryParams) as SearchResult[];

    logger.info(
      { query: params.query, resultsCount: results.length },
      "Search completed",
    );

    return results;
  }

  /**
   * OCR-Text speichern
   */
  async saveOCRData(
    documentId: string,
    data: {
      extractedText: string;
      language: string;
      confidence: number;
      provider: string;
      processingTimeMs: number;
    },
  ): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO document_ocr (
        document_id, extracted_text, language, confidence,
        ocr_provider, processing_time_ms
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      documentId,
      data.extractedText,
      data.language,
      data.confidence,
      data.provider,
      data.processingTimeMs,
    );

    logger.info({ documentId, provider: data.provider }, "OCR data saved");
  }

  /**
   * OCR-Daten abrufen
   */
  async getOCRData(documentId: string): Promise<{
    extracted_text: string;
    language: string;
    confidence: number;
    ocr_provider: string;
  } | null> {
    const stmt = this.db.prepare(`
      SELECT extracted_text, language, confidence, ocr_provider
      FROM document_ocr
      WHERE document_id = ?
    `);

    return stmt.get(documentId) as any;
  }
}
