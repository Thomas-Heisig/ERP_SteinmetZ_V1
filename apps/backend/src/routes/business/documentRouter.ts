// SPDX-License-Identifier: MIT
// apps/backend/src/routes/business/documentRouter.ts
/**
 * @module DocumentRouter
 * @description Document Management - Templates, Workflows, Archive
 */

import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { z } from "zod";
import { NotFoundError, BadRequestError } from "../../types/errors.js";
import db from "../../services/dbService.js";
import { createLogger } from "../../utils/logger.js";

const router = Router();
const logger = createLogger("documents");

/* ---------------------------------------------------------
   VALIDATION SCHEMAS
--------------------------------------------------------- */

const templateSchema = z.object({
  company_id: z.string(),
  name: z.string().min(1, "Name is required"),
  category: z.enum([
    "email",
    "letter",
    "quote",
    "invoice",
    "report",
    "form",
    "presentation",
    "contract",
    "policy",
    "process",
  ]),
  description: z.string().optional(),
  template_content: z.string().optional(), // JSON or HTML
  variables: z.string().optional(), // JSON array
  layout: z.string().optional(), // JSON
  branding: z.string().optional(), // JSON
  language: z.string().default("de"),
  version: z.string().default("1.0"),
});

const workflowSchema = z.object({
  company_id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  workflow_type: z.string(), // approval, review, notification, etc.
  target_entity: z.string(), // document, template, invoice, etc.
  steps: z.string(), // JSON array of workflow steps
  rules: z.string().optional(), // JSON conditional rules
  escalation_rules: z.string().optional(), // JSON
  sla_hours: z.number().int().optional(),
  version: z.string().default("1.0"),
});

const archiveSchema = z.object({
  company_id: z.string(),
  document_name: z.string().min(1, "Document name is required"),
  document_type: z.string().optional(),
  document_category: z.string().optional(),
  storage_path: z.string().min(1, "Storage path is required"),
  file_size: z.number().int().optional(),
  file_hash: z.string().optional(),
  mime_type: z.string().optional(),
  metadata: z.string().optional(), // JSON
  tags: z.string().optional(), // JSON array
  retention_period_years: z.number().int().optional(),
  retention_start_date: z.string().optional(),
  compliance_tags: z.string().optional(), // JSON array
});

/* ---------------------------------------------------------
   DOCUMENT TEMPLATES
--------------------------------------------------------- */

// GET /api/business/documents/templates - Get all templates
router.get(
  "/templates",
  asyncHandler(async (req, res) => {
    const { company_id, category, status } = req.query;

    let query = `SELECT * FROM business_doc_templates WHERE is_active = 1`;
    const params: any[] = [];

    if (company_id) {
      query += ` AND company_id = ?`;
      params.push(company_id);
    }

    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY category, name`;

    const templates = await db.all(query, params);
    res.json({ templates });
  })
);

// GET /api/business/documents/templates/:id - Get single template
router.get(
  "/templates/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const template = await db.get(
      `SELECT * FROM business_doc_templates WHERE id = ?`,
      [id]
    );

    if (!template) {
      throw new NotFoundError("Template not found");
    }

    // Get version history
    const versions = await db.all(
      `SELECT * FROM business_doc_versions WHERE template_id = ? ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      template,
      versions,
    });
  })
);

// POST /api/business/documents/templates - Create template
router.post(
  "/templates",
  asyncHandler(async (req, res) => {
    const validatedData = templateSchema.parse(req.body);

    const result = await db.run(
      `INSERT INTO business_doc_templates (
        company_id, name, category, description, template_content,
        variables, layout, branding, language, version, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        validatedData.company_id,
        validatedData.name,
        validatedData.category,
        validatedData.description || null,
        validatedData.template_content || null,
        validatedData.variables || null,
        validatedData.layout || null,
        validatedData.branding || null,
        validatedData.language,
        validatedData.version,
      ]
    );

    // Create initial version
    await db.run(
      `INSERT INTO business_doc_versions (
        template_id, version, version_note, content, is_current
      ) VALUES (?, ?, ?, ?, 1)`,
      [result.lastID, validatedData.version, "Initial version", validatedData.template_content]
    );

    logger.info("Template created", { name: validatedData.name });

    res.status(201).json({
      message: "Template created successfully",
      id: result.lastID,
    });
  })
);

// PUT /api/business/documents/templates/:id - Update template
router.put(
  "/templates/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const validatedData = templateSchema.parse(req.body);

    const existing = await db.get(
      `SELECT * FROM business_doc_templates WHERE id = ?`,
      [id]
    );

    if (!existing) {
      throw new NotFoundError("Template not found");
    }

    // Update template
    await db.run(
      `UPDATE business_doc_templates SET
        name = ?, category = ?, description = ?, template_content = ?,
        variables = ?, layout = ?, branding = ?, language = ?, version = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [
        validatedData.name,
        validatedData.category,
        validatedData.description || null,
        validatedData.template_content || null,
        validatedData.variables || null,
        validatedData.layout || null,
        validatedData.branding || null,
        validatedData.language,
        validatedData.version,
        id,
      ]
    );

    // Create new version if content changed
    if (validatedData.template_content !== existing.template_content) {
      // Mark old versions as not current
      await db.run(
        `UPDATE business_doc_versions SET is_current = 0 WHERE template_id = ?`,
        [id]
      );

      // Create new version
      await db.run(
        `INSERT INTO business_doc_versions (
          template_id, version, version_note, content, is_current
        ) VALUES (?, ?, ?, ?, 1)`,
        [id, validatedData.version, "Updated version", validatedData.template_content]
      );
    }

    logger.info("Template updated", { id, name: validatedData.name });

    res.json({ message: "Template updated successfully" });
  })
);

// POST /api/business/documents/templates/:id/approve - Approve template
router.post(
  "/templates/:id/approve",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { approved_by } = req.body;

    const existing = await db.get(
      `SELECT id FROM business_doc_templates WHERE id = ?`,
      [id]
    );

    if (!existing) {
      throw new NotFoundError("Template not found");
    }

    await db.run(
      `UPDATE business_doc_templates SET
        status = 'approved',
        approved_by = ?,
        approved_at = datetime('now'),
        updated_at = datetime('now')
      WHERE id = ?`,
      [approved_by, id]
    );

    logger.info("Template approved", { id, approved_by });

    res.json({ message: "Template approved successfully" });
  })
);

// POST /api/business/documents/templates/:id/use - Increment usage count
router.post(
  "/templates/:id/use",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    await db.run(
      `UPDATE business_doc_templates SET
        usage_count = usage_count + 1,
        last_used = datetime('now'),
        updated_at = datetime('now')
      WHERE id = ?`,
      [id]
    );

    res.json({ message: "Template usage recorded" });
  })
);

/* ---------------------------------------------------------
   WORKFLOWS
--------------------------------------------------------- */

// GET /api/business/documents/workflows - Get all workflows
router.get(
  "/workflows",
  asyncHandler(async (req, res) => {
    const { company_id, workflow_type } = req.query;

    let query = `SELECT * FROM business_workflows WHERE is_active = 1`;
    const params: any[] = [];

    if (company_id) {
      query += ` AND company_id = ?`;
      params.push(company_id);
    }

    if (workflow_type) {
      query += ` AND workflow_type = ?`;
      params.push(workflow_type);
    }

    query += ` ORDER BY name`;

    const workflows = await db.all(query, params);
    res.json({ workflows });
  })
);

// GET /api/business/documents/workflows/:id - Get single workflow
router.get(
  "/workflows/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const workflow = await db.get(
      `SELECT * FROM business_workflows WHERE id = ?`,
      [id]
    );

    if (!workflow) {
      throw new NotFoundError("Workflow not found");
    }

    // Get active instances
    const instances = await db.all(
      `SELECT * FROM business_workflow_instances WHERE workflow_id = ? AND status IN ('pending', 'in_progress')`,
      [id]
    );

    res.json({
      workflow,
      active_instances: instances,
    });
  })
);

// POST /api/business/documents/workflows - Create workflow
router.post(
  "/workflows",
  asyncHandler(async (req, res) => {
    const validatedData = workflowSchema.parse(req.body);

    await db.run(
      `INSERT INTO business_workflows (
        company_id, name, description, workflow_type, target_entity,
        steps, rules, escalation_rules, sla_hours, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.company_id,
        validatedData.name,
        validatedData.description || null,
        validatedData.workflow_type,
        validatedData.target_entity,
        validatedData.steps,
        validatedData.rules || null,
        validatedData.escalation_rules || null,
        validatedData.sla_hours || null,
        validatedData.version,
      ]
    );

    logger.info("Workflow created", { name: validatedData.name });

    res.status(201).json({ message: "Workflow created successfully" });
  })
);

// POST /api/business/documents/workflows/:id/start - Start workflow instance
router.post(
  "/workflows/:id/start",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { entity_type, entity_id, due_date } = req.body;

    const workflow = await db.get(
      `SELECT * FROM business_workflows WHERE id = ? AND is_active = 1`,
      [id]
    );

    if (!workflow) {
      throw new NotFoundError("Workflow not found or inactive");
    }

    // Parse steps to determine first approver
    const steps = JSON.parse(workflow.steps);
    const firstStep = steps[0];

    const result = await db.run(
      `INSERT INTO business_workflow_instances (
        workflow_id, entity_type, entity_id, current_step, status,
        current_approver_id, due_date, step_history
      ) VALUES (?, ?, ?, 0, 'pending', ?, ?, '[]')`,
      [id, entity_type, entity_id, firstStep?.approver_id || null, due_date || null]
    );

    logger.info("Workflow instance started", { workflow_id: id, instance_id: result.lastID });

    res.status(201).json({
      message: "Workflow started successfully",
      instance_id: result.lastID,
    });
  })
);

// GET /api/business/documents/workflows/instances/:instanceId - Get workflow instance
router.get(
  "/workflows/instances/:instanceId",
  asyncHandler(async (req, res) => {
    const { instanceId } = req.params;

    const instance = await db.get(
      `SELECT * FROM business_workflow_instances WHERE id = ?`,
      [instanceId]
    );

    if (!instance) {
      throw new NotFoundError("Workflow instance not found");
    }

    // Get workflow definition
    const workflow = await db.get(
      `SELECT * FROM business_workflows WHERE id = ?`,
      [instance.workflow_id]
    );

    res.json({
      instance,
      workflow,
    });
  })
);

/* ---------------------------------------------------------
   DOCUMENT ARCHIVE
--------------------------------------------------------- */

// GET /api/business/documents/archive - Get archived documents
router.get(
  "/archive",
  asyncHandler(async (req, res) => {
    const { company_id, document_type, archive_status } = req.query;

    let query = `SELECT * FROM business_doc_archive WHERE 1=1`;
    const params: any[] = [];

    if (company_id) {
      query += ` AND company_id = ?`;
      params.push(company_id);
    }

    if (document_type) {
      query += ` AND document_type = ?`;
      params.push(document_type);
    }

    if (archive_status) {
      query += ` AND archive_status = ?`;
      params.push(archive_status);
    }

    query += ` ORDER BY archived_date DESC`;

    const documents = await db.all(query, params);
    res.json({ documents });
  })
);

// POST /api/business/documents/archive - Archive document
router.post(
  "/archive",
  asyncHandler(async (req, res) => {
    const validatedData = archiveSchema.parse(req.body);

    const retentionEndDate = validatedData.retention_start_date && validatedData.retention_period_years
      ? new Date(validatedData.retention_start_date)
      : null;

    if (retentionEndDate && validatedData.retention_period_years) {
      retentionEndDate.setFullYear(retentionEndDate.getFullYear() + validatedData.retention_period_years);
    }

    await db.run(
      `INSERT INTO business_doc_archive (
        company_id, document_name, document_type, document_category,
        storage_path, file_size, file_hash, mime_type, metadata, tags,
        retention_period_years, retention_start_date, retention_end_date,
        compliance_tags, archived_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        validatedData.company_id,
        validatedData.document_name,
        validatedData.document_type || null,
        validatedData.document_category || null,
        validatedData.storage_path,
        validatedData.file_size || null,
        validatedData.file_hash || null,
        validatedData.mime_type || null,
        validatedData.metadata || null,
        validatedData.tags || null,
        validatedData.retention_period_years || null,
        validatedData.retention_start_date || null,
        retentionEndDate ? retentionEndDate.toISOString() : null,
        validatedData.compliance_tags || null,
      ]
    );

    logger.info("Document archived", { name: validatedData.document_name });

    res.status(201).json({ message: "Document archived successfully" });
  })
);

// GET /api/business/documents/archive/search - Search archive
router.get(
  "/archive/search",
  asyncHandler(async (req, res) => {
    const { company_id, query } = req.query;

    if (!query) {
      throw new BadRequestError("Search query is required");
    }

    let sql = `SELECT * FROM business_doc_archive WHERE company_id = ? AND (
      document_name LIKE ? OR
      document_type LIKE ? OR
      document_category LIKE ? OR
      tags LIKE ?
    ) AND archive_status = 'active' ORDER BY archived_date DESC`;

    const searchTerm = `%${query}%`;
    const documents = await db.all(sql, [
      company_id,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
    ]);

    res.json({ documents });
  })
);

export default router;
