// SPDX-License-Identifier: MIT
// apps/backend/src/routes/documents/documentsRouter.ts

/**
 * Document Management System Router
 *
 * Provides comprehensive document management including:
 * - Document upload with versioning and checksum validation
 * - OCR integration for text extraction
 * - AI-based tagging and classification
 * - Full-text search with filters
 * - Workflow automation with multi-step approval
 * - E-signature integration
 * - Retention policy management
 * - Audit trail for all operations
 *
 * @module routes/documents
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { BadRequestError } from "../error/errors.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import pino from "pino";
import { DatabaseManager } from "../database/index.js";
import { DocumentService } from "./services/documentService.js";
import { WorkflowService } from "./services/workflowService.js";
import { SignatureService } from "./services/signatureService.js";
import { SearchService } from "./services/searchService.js";
import { RetentionService } from "./services/retentionService.js";

const router = Router();
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

// Type for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

// Services initialized lazily (NOT at module level)
let documentService: DocumentService | null = null;
let workflowService: WorkflowService | null = null;
let signatureService: SignatureService | null = null;
let searchService: SearchService | null = null;
let retentionService: RetentionService | null = null;

/**
 * Lazy initialize services on first request (synchronous)
 */
function initializeServices(): void {
  if (documentService) return; // Already initialized

  try {
    // DatabaseManager is exported as an instance (singleton)
    const dbInstance = DatabaseManager.getDatabase();

    documentService = new DocumentService(dbInstance);
    workflowService = new WorkflowService(dbInstance);
    signatureService = new SignatureService(dbInstance);
    searchService = new SearchService(dbInstance);
    retentionService = new RetentionService(dbInstance);
    logger.info("Document services initialized");
  } catch (error) {
    logger.error({ error }, "Failed to initialize document services");
    throw error;
  }
}

// Middleware to ensure services are initialized
router.use((req: Request, res: Response, next) => {
  try {
    initializeServices();
    next();
  } catch (error) {
    logger.error({ error }, "Service initialization failed");
    res.status(503).json({ success: false, error: "Services unavailable" });
  }
});

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const uploadDocumentSchema = z.object({
  category: z.enum([
    "invoice",
    "contract",
    "employee_document",
    "report",
    "correspondence",
    "other",
  ]),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  retentionYears: z.number().int().min(1).max(30).default(10),
});

const searchDocumentsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  fileType: z.string().optional(),
});

const workflowSchema = z.object({
  type: z.enum(["approval", "review", "signature"]),
  approvers: z.array(z.string()).min(1),
  deadline: z.string().optional(),
  description: z.string().optional(),
});

const retentionPolicySchema = z.object({
  retentionYears: z.number().int().min(1).max(30),
  reason: z.string().optional(),
});

// ============================================================================
// DOCUMENT MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * GET /api/documents
 * Get all documents with optional filters
 * @route GET /api/documents
 * @access Private
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    if (!documentService) throw new Error("Document service not initialized");

    const { category, status } = req.query;
    const userId = (req as AuthenticatedRequest).user?.id;

    const documents = await documentService.getAllDocuments({
      category: category as string,
      status: status as string,
      userId,
    });

    res.json({
      success: true,
      data: documents,
      count: documents.length,
    });
  }),
);

/**
 * GET /api/documents/:id
 * Get a single document by ID with full details
 * @route GET /api/documents/:id
 * @access Private
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    if (!documentService) throw new Error("Document service not initialized");
    if (!searchService) throw new Error("Search service not initialized");

    const { id } = req.params;

    const document = await documentService.getDocumentById(id);
    const metadata = documentService.getMetadata(id);
    const tags = documentService.getTags(id);
    const versions = await documentService.getDocumentVersions(id);
    const ocrData = await searchService.getOCRData(id);

    res.json({
      success: true,
      data: {
        ...document,
        metadata,
        tags,
        versions,
        ocrData,
      },
    });
  }),
);

/**
 * POST /api/documents/upload
 * Upload a new document
 * @route POST /api/documents/upload
 * @access Private
 */
router.post(
  "/upload",
  asyncHandler(async (req: Request, res: Response) => {
    if (!documentService) throw new Error("Document service not initialized");

    // Validate input
    const validationResult = uploadDocumentSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new BadRequestError("Invalid document data");
    }

    const documentData = validationResult.data;
    const userId = (req as AuthenticatedRequest).user?.id || "system";

    // TODO: Integrate with multer for actual file upload
    // For now, use mock file data
    const mockFileInfo = {
      fileName: documentData.title + ".pdf",
      fileType: "application/pdf",
      fileSize: 245678,
      storagePath: `/storage/documents/${Date.now()}.pdf`,
      buffer: Buffer.from("mock file content"),
    };

    const newDocument = await documentService.createDocument(
      documentData,
      mockFileInfo,
      userId,
    );

    logger.info({ documentId: newDocument.id }, "Document uploaded successfully");

    res.status(201).json({
      success: true,
      data: newDocument,
      message: "Document uploaded successfully",
    });
  }),
);

/**
 * POST /api/documents/:id/versions
 * Upload a new version of an existing document
 * @route POST /api/documents/:id/versions
 * @access Private
 */
router.post(
  "/:id/versions",
  asyncHandler(async (req: Request, res: Response) => {
    if (!documentService) throw new Error("Document service not initialized");

    const { id } = req.params;
    const { changes } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id || "system";

    // Verify document exists
    await documentService.getDocumentById(id);

    // TODO: Integrate with multer for actual file upload
    const mockFileInfo = {
      fileName: "updated-file.pdf",
      fileSize: 256789,
      storagePath: `/storage/documents/${Date.now()}.pdf`,
      buffer: Buffer.from("updated mock file content"),
    };

    const newVersion = await documentService.uploadVersion(
      id,
      mockFileInfo,
      changes || "Updated document",
      userId,
    );

    logger.info({ documentId: id, version: newVersion.version }, "New document version created");

    res.status(201).json({
      success: true,
      data: newVersion,
      message: "New version uploaded successfully",
    });
  }),
);

/**
 * DELETE /api/documents/:id
 * Delete a document (soft delete with retention check)
 * @route DELETE /api/documents/:id
 * @access Private
 */
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    if (!documentService) throw new Error("Document service not initialized");

    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id || "system";

    await documentService.deleteDocument(id, userId);

    logger.info({ documentId: id, userId }, "Document deleted");

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  }),
);

// ============================================================================
// SEARCH AND OCR ENDPOINTS
// ============================================================================

/**
 * GET /api/documents/search
 * Full-text search across documents with filters
 * @route GET /api/documents/search
 * @access Private
 */
router.get(
  "/search",
  asyncHandler(async (req: Request, res: Response) => {
    if (!searchService) throw new Error("Search service not initialized");

    const validationResult = searchDocumentsSchema.safeParse(req.query);
    if (!validationResult.success) {
      throw new BadRequestError("Invalid search parameters");
    }

    const searchParams = validationResult.data;
    const results = await searchService.searchDocuments(searchParams);

    logger.info({ query: searchParams.query, resultCount: results.length }, "Search completed");

    res.json({
      success: true,
      data: results,
      count: results.length,
      query: searchParams.query,
    });
  }),
);

/**
 * POST /api/documents/:id/ocr
 * Trigger OCR processing for a document
 * @route POST /api/documents/:id/ocr
 * @access Private
 */
router.post(
  "/:id/ocr",
  asyncHandler(async (req: Request, res: Response) => {
    if (!documentService) throw new Error("Document service not initialized");
    if (!searchService) throw new Error("Search service not initialized");

    const { id } = req.params;

    // Verify document exists
    await documentService.getDocumentById(id);

    // TODO: Queue OCR processing job with BullMQ
    // For now, store mock OCR data
    const jobId = `ocr-job-${Date.now()}`;

    // Mock OCR processing result
    setTimeout(async () => {
      try {
        if (!searchService) return;
        await searchService.saveOCRData(id, {
          extractedText: "Sample extracted text from document...",
          language: "deu",
          confidence: 0.95,
          provider: "tesseract",
          processingTimeMs: 1500,
        });
      } catch (error) {
        logger.error({ error, documentId: id }, "OCR processing failed");
      }
    }, 100);

    logger.info({ documentId: id, jobId }, "OCR processing started");

    res.json({
      success: true,
      message: "OCR processing started",
      jobId,
    });
  }),
);

/**
 * POST /api/documents/:id/ai-tags
 * Generate AI-based tags for a document
 * @route POST /api/documents/:id/ai-tags
 * @access Private
 */
router.post(
  "/:id/ai-tags",
  asyncHandler(async (req: Request, res: Response) => {
    if (!documentService) throw new Error("Document service not initialized");

    const { id } = req.params;

    // Verify document exists
    await documentService.getDocumentById(id);

    // TODO: Integrate with OpenAI/Anthropic API
    // For now, generate mock AI tags
    const generatedTags = ["rechnung", "kunde", "2024", "zahlung"];

    // Save AI-generated tags
    documentService.saveTags(id, generatedTags, "ai_generated", 0.92);

    const aiTags = {
      generatedTags,
      category: "invoice",
      confidence: 0.92,
      entities: [
        { type: "customer", value: "ABC GmbH", confidence: 0.95 },
        { type: "amount", value: "1500.00 EUR", confidence: 0.98 },
      ],
    };

    logger.info({ documentId: id, tagCount: generatedTags.length }, "AI tags generated");

    res.json({
      success: true,
      data: aiTags,
    });
  }),
);

// ============================================================================
// WORKFLOW AUTOMATION ENDPOINTS
// ============================================================================

/**
 * POST /api/documents/:id/workflows
 * Start a workflow for a document
 * @route POST /api/documents/:id/workflows
 * @access Private
 */
router.post(
  "/:id/workflows",
  asyncHandler(async (req: Request, res: Response) => {
    if (!documentService) throw new Error("Document service not initialized");
    if (!workflowService) throw new Error("Workflow service not initialized");

    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id || "system";

    // Verify document exists
    await documentService.getDocumentById(id);

    // Validate workflow data
    const validationResult = workflowSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new BadRequestError("Invalid workflow data");
    }

    const workflowData = validationResult.data;

    const workflow = await workflowService.startWorkflow(
      id,
      workflowData,
      userId,
    );

    logger.info(
      { documentId: id, workflowId: workflow.id, type: workflowData.type },
      "Workflow started",
    );

    res.status(201).json({
      success: true,
      data: workflow,
    });
  }),
);

/**
 * GET /api/documents/:id/workflows
 * Get all workflows for a document
 * @route GET /api/documents/:id/workflows
 * @access Private
 */
router.get(
  "/:id/workflows",
  asyncHandler(async (req: Request, res: Response) => {
    if (!documentService) throw new Error("Document service not initialized");
    if (!workflowService) throw new Error("Workflow service not initialized");

    const { id } = req.params;

    // Verify document exists
    await documentService.getDocumentById(id);

    const workflows = await workflowService.getDocumentWorkflows(id);

    res.json({
      success: true,
      data: workflows,
      count: workflows.length,
    });
  }),
);

/**
 * POST /api/documents/:id/workflows/:workflowId/approve
 * Approve a workflow step
 * @route POST /api/documents/:id/workflows/:workflowId/approve
 * @access Private
 */
router.post(
  "/:id/workflows/:workflowId/approve",
  asyncHandler(async (req: Request, res: Response) => {
    if (!workflowService) throw new Error("Workflow service not initialized");

    const { id, workflowId } = req.params;
    const { stepNumber, comment } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id || "system";

    if (stepNumber === undefined) {
      throw new BadRequestError("stepNumber is required");
    }

    await workflowService.approveStep(workflowId, stepNumber, userId, comment);

    logger.info(
      { documentId: id, workflowId, stepNumber, userId },
      "Workflow step approved",
    );

    res.json({
      success: true,
      message: "Workflow step approved",
    });
  }),
);

/**
 * POST /api/documents/:id/workflows/:workflowId/reject
 * Reject a workflow step
 * @route POST /api/documents/:id/workflows/:workflowId/reject
 * @access Private
 */
router.post(
  "/:id/workflows/:workflowId/reject",
  asyncHandler(async (req: Request, res: Response) => {
    if (!workflowService) throw new Error("Workflow service not initialized");

    const { id, workflowId } = req.params;
    const { stepNumber, reason } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id || "system";

    if (stepNumber === undefined) {
      throw new BadRequestError("stepNumber is required");
    }

    if (!reason) {
      throw new BadRequestError("Rejection reason is required");
    }

    await workflowService.rejectStep(workflowId, stepNumber, userId, reason);

    logger.info(
      { documentId: id, workflowId, stepNumber, userId },
      "Workflow step rejected",
    );

    res.json({
      success: true,
      message: "Workflow step rejected",
    });
  }),
);

// ============================================================================
// E-SIGNATURE ENDPOINTS
// ============================================================================

/**
 * POST /api/documents/:id/sign
 * Request e-signature for a document
 * @route POST /api/documents/:id/sign
 * @access Private
 */
router.post(
  "/:id/sign",
  asyncHandler(async (req: Request, res: Response) => {
    if (!documentService) throw new Error("Document service not initialized");
    if (!signatureService) throw new Error("Signature service not initialized");

    const { id } = req.params;
    const { signers } = req.body;

    if (!Array.isArray(signers) || signers.length === 0) {
      throw new BadRequestError("At least one signer is required");
    }

    // Verify document exists
    await documentService.getDocumentById(id);

    const signatureRequest = await signatureService.createSignatureRequest(id, {
      signers,
      provider: req.body.provider || "internal",
    });

    logger.info({ documentId: id, signerCount: signers.length }, "Signature request created");

    res.status(201).json({
      success: true,
      data: signatureRequest,
      message: "Signature request created",
    });
  }),
);

/**
 * GET /api/documents/:id/signatures
 * Get all signatures for a document
 * @route GET /api/documents/:id/signatures
 * @access Private
 */
router.get(
  "/:id/signatures",
  asyncHandler(async (req: Request, res: Response) => {
    if (!documentService) throw new Error("Document service not initialized");
    if (!signatureService) throw new Error("Signature service not initialized");

    const { id } = req.params;

    // Verify document exists
    await documentService.getDocumentById(id);

    const signatures = await signatureService.getDocumentSignatures(id);

    res.json({
      success: true,
      data: signatures,
      count: signatures.length,
    });
  }),
);

/**
 * PUT /api/documents/signatures/:signatureId
 * Update signature status
 * @route PUT /api/documents/signatures/:signatureId
 * @access Private
 */
router.put(
  "/signatures/:signatureId",
  asyncHandler(async (req: Request, res: Response) => {
    if (!signatureService) throw new Error("Signature service not initialized");

    const { signatureId } = req.params;
    const { status } = req.body;

    if (!["signed", "declined", "expired"].includes(status)) {
      throw new BadRequestError("Invalid signature status");
    }

    const ipAddress = req.ip || (req.headers["x-forwarded-for"] as string) || "unknown";

    await signatureService.updateSignatureStatus(
      signatureId,
      status,
      ipAddress,
    );

    logger.info({ signatureId, status }, "Signature status updated");

    res.json({
      success: true,
      message: "Signature status updated",
    });
  }),
);

// ============================================================================
// RETENTION POLICY ENDPOINTS
// ============================================================================

/**
 * GET /api/documents/retention-policies
 * Get all retention policies
 * @route GET /api/documents/retention-policies
 * @access Private
 */
router.get(
  "/retention-policies",
  asyncHandler(async (req: Request, res: Response) => {
    if (!retentionService) throw new Error("Retention service not initialized");

    const policies = await retentionService.getAllPolicies();

    res.json({
      success: true,
      data: policies,
      count: policies.length,
    });
  }),
);

/**
 * PUT /api/documents/:id/retention-policy
 * Update retention policy for a document
 * @route PUT /api/documents/:id/retention-policy
 * @access Private
 */
router.put(
  "/:id/retention-policy",
  asyncHandler(async (req: Request, res: Response) => {
    if (!documentService) throw new Error("Document service not initialized");
    if (!retentionService) throw new Error("Retention service not initialized");

    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id || "system";

    // Validate input
    const validationResult = retentionPolicySchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new BadRequestError("Invalid retention policy data");
    }

    const { retentionYears, reason } = validationResult.data;

    // Verify document exists
    await documentService.getDocumentById(id);

    await retentionService.updateDocumentRetention(
      id,
      retentionYears,
      reason || "Updated by user",
      userId,
    );

    logger.info({ documentId: id, retentionYears, userId }, "Retention policy updated");

    res.json({
      success: true,
      message: "Retention policy updated",
    });
  }),
);

/**
 * GET /api/documents/expiring
 * Get documents expiring within specified days
 * @route GET /api/documents/expiring
 * @access Private
 */
router.get(
  "/expiring",
  asyncHandler(async (req: Request, res: Response) => {
    if (!documentService) throw new Error("Document service not initialized");

    let days = 30;
    if (req.query.days) {
      const parsedDays = parseInt(req.query.days as string);
      if (!isNaN(parsedDays) && parsedDays > 0) {
        days = parsedDays;
      }
    }

    const expiringDocuments = await documentService.getExpiringDocuments(days);

    logger.info({ days, count: expiringDocuments.length }, "Expiring documents retrieved");

    res.json({
      success: true,
      data: expiringDocuments,
      count: expiringDocuments.length,
    });
  }),
);

// ============================================================================
// STATISTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/documents/statistics
 * Get document statistics
 * @route GET /api/documents/statistics
 * @access Private
 */
router.get(
  "/statistics",
  asyncHandler(async (req: Request, res: Response) => {
    if (!documentService) throw new Error("Document service not initialized");
    if (!workflowService) throw new Error("Workflow service not initialized");
    if (!signatureService) throw new Error("Signature service not initialized");

    const stats = documentService.getStatistics();
    const pendingWorkflows = workflowService.getPendingWorkflowsCount();
    const pendingSignatures = signatureService.getPendingSignaturesCount();

    logger.info({ totalDocuments: stats.totalDocuments, pendingWorkflows, pendingSignatures }, "Statistics retrieved");

    res.json({
      success: true,
      data: {
        ...stats,
        pendingWorkflows,
        pendingSignatures,
      },
    });
  }),
);

export default router;
