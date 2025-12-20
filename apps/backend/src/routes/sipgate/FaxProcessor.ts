// SPDX-License-Identifier: MIT
// apps/backend/src/services/sipgate/FaxProcessor.ts

import sipgateClient, { SipgateFax } from "./SipgateClient.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("fax-processor");

interface FaxProcessorConfig {
  maxQueueSize?: number;
}

export interface FaxDocument {
  id: string;
  from: string;
  to: string;
  receivedAt: string;
  pages: number;
  status: "received" | "processing" | "processed" | "failed";
  ocrText?: string;
  classification?: FaxClassification;
  originalFile?: string;
  processedFile?: string;
}

export interface FaxClassification {
  type: "invoice" | "order" | "inquiry" | "complaint" | "other";
  confidence: number;
  suggestedAction?: string;
  extractedData?: Record<string, unknown>;
}

/**
 * FaxProcessor - OCR and classification of incoming faxes
 */
export class FaxProcessor {
  private processedFaxes: Map<string, FaxDocument> = new Map();
  private pendingQueue: FaxDocument[] = [];
  private readonly maxQueueSize: number;

  constructor(config?: FaxProcessorConfig) {
    this.maxQueueSize = config?.maxQueueSize ?? 500;
  }

  /**
   * Process incoming fax
   */
  async processIncomingFax(webhookData: {
    faxId: string;
    from: string;
    to: string;
    pages: number;
    base64Content?: string;
  }): Promise<FaxDocument> {
    const fax: FaxDocument = {
      id: webhookData.faxId,
      from: webhookData.from,
      to: webhookData.to,
      receivedAt: new Date().toISOString(),
      pages: webhookData.pages,
      status: "received",
    };

    this.processedFaxes.set(fax.id, fax);
    if (this.pendingQueue.length < this.maxQueueSize) {
      this.pendingQueue.push(fax);
    } else {
      logger.warn(
        { faxId: fax.id },
        "Pending queue full; fax enqueued without backpressure handling",
      );
    }

    logger.info(
      { faxId: fax.id, from: fax.from, pages: fax.pages },
      `📠 Received fax from ${fax.from} (${fax.pages} pages)`,
    );

    // Start async processing
    this.processFaxAsync(fax, webhookData.base64Content);

    return fax;
  }

  /**
   * Process fax asynchronously (OCR + Classification)
   */
  private async processFaxAsync(
    fax: FaxDocument,
    base64Content?: string,
  ): Promise<void> {
    try {
      // Update status
      fax.status = "processing";
      this.processedFaxes.set(fax.id, fax);

      // Perform OCR
      if (base64Content) {
        fax.ocrText = await this.performOCR(base64Content);
      }

      // Classify the fax
      if (fax.ocrText) {
        fax.classification = await this.classifyFax(fax.ocrText);
      }

      fax.status = "processed";
      this.processedFaxes.set(fax.id, fax);

      // Remove from pending queue
      const index = this.pendingQueue.findIndex((f) => f.id === fax.id);
      if (index >= 0) {
        this.pendingQueue.splice(index, 1);
      }

      logger.info(
        {
          faxId: fax.id,
          type: fax.classification?.type,
          confidence: fax.classification?.confidence,
        },
        `✅ Processed fax ${fax.id}: ${fax.classification?.type || "unknown"} (${(fax.classification?.confidence || 0) * 100}% confidence)`,
      );
    } catch (error) {
      logger.error(
        { faxId: fax.id, error },
        `❌ Failed to process fax ${fax.id}`,
      );
      fax.status = "failed";
      this.processedFaxes.set(fax.id, fax);
    }
  }

  /**
   * Perform OCR on fax content
   * In production, this would use a real OCR service like Tesseract or Google Vision
   */
  private async performOCR(_base64Content: string): Promise<string> {
    // Mock OCR implementation
    // In production, integrate with:
    // - Tesseract.js for local OCR
    // - Google Cloud Vision API
    // - AWS Textract
    // - Azure Computer Vision

    logger.info("🔍 Performing OCR...");

    // Simulate OCR processing time
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return mock extracted text
    return `
[Fax Document]
Date: ${new Date().toLocaleDateString("de-DE")}
From: Sender Name
Subject: Sample Document

This is a mock OCR result.
In production, actual text would be extracted from the fax image.

Regards,
Sender
    `.trim();
  }

  /**
   * Classify fax based on OCR text
   * In production, this would use AI/ML classification
   */
  private async classifyFax(ocrText: string): Promise<FaxClassification> {
    const lowerText = ocrText.toLowerCase();

    // Simple keyword-based classification
    // In production, use ML models for better accuracy

    if (lowerText.includes("rechnung") || lowerText.includes("invoice")) {
      return {
        type: "invoice",
        confidence: 0.85,
        suggestedAction: "Add to invoice processing queue",
        extractedData: {
          possibleInvoiceNumber: this.extractInvoiceNumber(ocrText),
        },
      };
    }

    if (lowerText.includes("bestellung") || lowerText.includes("order")) {
      return {
        type: "order",
        confidence: 0.8,
        suggestedAction: "Create new order in system",
      };
    }

    if (lowerText.includes("anfrage") || lowerText.includes("inquiry")) {
      return {
        type: "inquiry",
        confidence: 0.75,
        suggestedAction: "Route to sales department",
      };
    }

    if (lowerText.includes("beschwerde") || lowerText.includes("complaint")) {
      return {
        type: "complaint",
        confidence: 0.8,
        suggestedAction: "Route to customer service",
      };
    }

    return {
      type: "other",
      confidence: 0.5,
      suggestedAction: "Manual review required",
    };
  }

  /**
   * Extract invoice number from text
   */
  private extractInvoiceNumber(text: string): string | undefined {
    const patterns = [
      /Rechnungsnr\.?\s*:?\s*(\d+)/i,
      /Invoice\s*#?\s*:?\s*(\d+)/i,
      /RE-(\d+)/i,
      /INV-(\d+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  /**
   * Send fax
   */
  async sendFax(params: {
    faxlineId: string;
    recipient: string;
    filename: string;
    base64Content: string;
  }): Promise<SipgateFax> {
    return sipgateClient.sendFax(params);
  }

  /**
   * Get processed faxes
   */
  getProcessedFaxes(params?: {
    limit?: number;
    status?: FaxDocument["status"];
  }): FaxDocument[] {
    let faxes = Array.from(this.processedFaxes.values());

    if (params?.status) {
      faxes = faxes.filter((f) => f.status === params.status);
    }

    faxes.sort(
      (a, b) =>
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
    );

    if (params?.limit) {
      faxes = faxes.slice(0, params.limit);
    }

    return faxes;
  }

  /**
   * Get fax by ID
   */
  getFax(faxId: string): FaxDocument | undefined {
    return this.processedFaxes.get(faxId);
  }

  /**
   * Get pending faxes count
   */
  getPendingCount(): number {
    return this.pendingQueue.length;
  }
}

export default new FaxProcessor();
