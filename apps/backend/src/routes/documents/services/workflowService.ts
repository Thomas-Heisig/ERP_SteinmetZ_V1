// SPDX-License-Identifier: MIT
// apps/backend/src/routes/documents/services/workflowService.ts

/**
 * Workflow Service
 * Business Logic für Workflow-Automation
 */

import { Database } from "better-sqlite3";
import pino from "pino";
import { NotFoundError, ForbiddenError } from "../../error/errors.js";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

export interface Workflow {
  id: string;
  document_id: string;
  type: "approval" | "review" | "signature";
  status: "pending" | "in_progress" | "approved" | "rejected" | "cancelled";
  created_by: string;
  deadline?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_number: number;
  approver_id: string;
  status: "pending" | "approved" | "rejected" | "skipped";
  comment?: string;
  actioned_at?: string;
  created_at: string;
}

export interface CreateWorkflowDto {
  type: "approval" | "review" | "signature";
  approvers: string[];
  deadline?: string;
  description?: string;
}

/**
 * Workflow Service Class
 */
export class WorkflowService {
  constructor(private db: Database) {}

  /**
   * Workflow starten
   */
  async startWorkflow(
    documentId: string,
    workflowData: CreateWorkflowDto,
    userId: string
  ): Promise<Workflow> {
    // Workflow erstellen
    const stmt = this.db.prepare(`
      INSERT INTO workflows (document_id, type, created_by, deadline, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      documentId,
      workflowData.type,
      userId,
      workflowData.deadline || null,
      workflowData.description || null
    );

    const workflowId = this.getLastInsertId();

    // Workflow-Schritte erstellen
    for (let i = 0; i < workflowData.approvers.length; i++) {
      const stepStmt = this.db.prepare(`
        INSERT INTO workflow_steps (workflow_id, step_number, approver_id)
        VALUES (?, ?, ?)
      `);

      stepStmt.run(workflowId, i + 1, workflowData.approvers[i]);
    }

    // Workflow-Status aktualisieren
    const updateStmt = this.db.prepare(
      "UPDATE workflows SET status = 'in_progress' WHERE id = ?"
    );
    updateStmt.run(workflowId);

    logger.info({ workflowId, documentId }, "Workflow started");

    return this.getWorkflowById(workflowId);
  }

  /**
   * Workflow abrufen
   */
  async getWorkflowById(id: string): Promise<Workflow> {
    const stmt = this.db.prepare("SELECT * FROM workflows WHERE id = ?");
    const workflow = stmt.get(id) as Workflow | undefined;

    if (!workflow) {
      throw new NotFoundError("Workflow not found");
    }

    return workflow;
  }

  /**
   * Alle Workflows eines Dokuments abrufen
   */
  async getDocumentWorkflows(documentId: string): Promise<Workflow[]> {
    const stmt = this.db.prepare(
      "SELECT * FROM workflows WHERE document_id = ? ORDER BY created_at DESC"
    );
    return stmt.all(documentId) as Workflow[];
  }

  /**
   * Workflow-Schritte abrufen
   */
  async getWorkflowSteps(workflowId: string): Promise<WorkflowStep[]> {
    const stmt = this.db.prepare(
      "SELECT * FROM workflow_steps WHERE workflow_id = ? ORDER BY step_number"
    );
    return stmt.all(workflowId) as WorkflowStep[];
  }

  /**
   * Workflow-Schritt genehmigen
   */
  async approveStep(
    workflowId: string,
    stepNumber: number,
    userId: string,
    comment?: string
  ): Promise<void> {
    const workflow = await this.getWorkflowById(workflowId);

    // Schritt laden
    const stepStmt = this.db.prepare(`
      SELECT * FROM workflow_steps
      WHERE workflow_id = ? AND step_number = ?
    `);
    const step = stepStmt.get(workflowId, stepNumber) as
      | WorkflowStep
      | undefined;

    if (!step) {
      throw new NotFoundError("Workflow step not found");
    }

    if (step.approver_id !== userId) {
      throw new ForbiddenError("Not authorized to approve this step");
    }

    // Schritt genehmigen
    const updateStmt = this.db.prepare(`
      UPDATE workflow_steps
      SET status = 'approved',
          comment = ?,
          actioned_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    updateStmt.run(comment || null, step.id);

    // Prüfen ob weitere Schritte existieren
    const nextStepStmt = this.db.prepare(`
      SELECT * FROM workflow_steps
      WHERE workflow_id = ? AND step_number = ?
    `);
    const nextStep = nextStepStmt.get(workflowId, stepNumber + 1) as
      | WorkflowStep
      | undefined;

    if (!nextStep) {
      // Letzter Schritt - Workflow abschließen
      const completeStmt = this.db.prepare(`
        UPDATE workflows
        SET status = 'approved',
            completed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      completeStmt.run(workflowId);

      // Dokument-Status aktualisieren
      const docStmt = this.db.prepare(
        "UPDATE documents SET status = 'approved' WHERE id = ?"
      );
      docStmt.run(workflow.document_id);
    }

    logger.info({ workflowId, stepNumber }, "Workflow step approved");
  }

  /**
   * Workflow-Schritt ablehnen
   */
  async rejectStep(
    workflowId: string,
    stepNumber: number,
    userId: string,
    reason: string
  ): Promise<void> {
    const workflow = await this.getWorkflowById(workflowId);

    // Schritt laden
    const stepStmt = this.db.prepare(`
      SELECT * FROM workflow_steps
      WHERE workflow_id = ? AND step_number = ?
    `);
    const step = stepStmt.get(workflowId, stepNumber) as
      | WorkflowStep
      | undefined;

    if (!step) {
      throw new NotFoundError("Workflow step not found");
    }

    if (step.approver_id !== userId) {
      throw new ForbiddenError("Not authorized to reject this step");
    }

    // Schritt ablehnen
    const updateStmt = this.db.prepare(`
      UPDATE workflow_steps
      SET status = 'rejected',
          comment = ?,
          actioned_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    updateStmt.run(reason, step.id);

    // Workflow ablehnen
    const rejectStmt = this.db.prepare(`
      UPDATE workflows
      SET status = 'rejected',
          completed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    rejectStmt.run(workflowId);

    // Dokument-Status aktualisieren
    const docStmt = this.db.prepare(
      "UPDATE documents SET status = 'in_review' WHERE id = ?"
    );
    docStmt.run(workflow.document_id);

    logger.info({ workflowId, stepNumber }, "Workflow step rejected");
  }

  /**
   * Pending Workflows zählen
   */
  getPendingWorkflowsCount(): number {
    const stmt = this.db.prepare(
      "SELECT COUNT(*) as count FROM workflows WHERE status IN ('pending', 'in_progress')"
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
