// SPDX-License-Identifier: MIT
// apps/backend/src/services/selfhealing/AutoRepair.ts

import { createLogger } from "../../utils/logger.js";
import db from "../dbService.js";
import {
  DatabaseHealthMonitor,
  IntegrityIssue,
} from "./DatabaseHealthMonitor.js";

const logger = createLogger("auto-repair");

export interface RepairResult {
  timestamp: Date;
  issue: IntegrityIssue;
  success: boolean;
  action: string;
  rollbackAvailable: boolean;
  rollbackData?: unknown;
  error?: string;
}

export interface RepairSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  results: RepairResult[];
  status: "running" | "completed" | "failed" | "rolledback";
}

/**
 * AutoRepair - Automatische Reparatur mit Rollback-Fähigkeit
 */
export class AutoRepair {
  private healthMonitor: DatabaseHealthMonitor;
  private sessions: Map<string, RepairSession> = new Map();
  private maxSessionsKept = 100;

  constructor(healthMonitor: DatabaseHealthMonitor) {
    this.healthMonitor = healthMonitor;
  }

  /**
   * Startet eine automatische Reparatur-Session
   */
  async startRepairSession(dryRun = false): Promise<RepairSession> {
    const sessionId = crypto.randomUUID();
    const session: RepairSession = {
      id: sessionId,
      startTime: new Date(),
      results: [],
      status: "running",
    };

    this.sessions.set(sessionId, session);

    try {
      const issues = await this.healthMonitor.findIntegrityIssues();
      logger.info(
        { sessionId, issueCount: issues.length },
        "Starting repair session",
      );

      for (const issue of issues) {
        const result = await this.repairIssue(issue, dryRun);
        session.results.push(result);
      }

      session.status = "completed";
      session.endTime = new Date();

      // Alte Sessions entfernen
      this.cleanupOldSessions();

      const successCount = session.results.filter((r) => r.success).length;
      logger.info(
        { sessionId, successCount, totalCount: session.results.length },
        "Repair session completed",
      );
    } catch (error) {
      session.status = "failed";
      session.endTime = new Date();
      logger.error({ err: error, sessionId }, "Repair session failed");
    }

    return session;
  }

  /**
   * Repariert ein einzelnes Problem
   */
  private async repairIssue(
    issue: IntegrityIssue,
    dryRun: boolean,
  ): Promise<RepairResult> {
    const result: RepairResult = {
      timestamp: new Date(),
      issue,
      success: false,
      action: dryRun ? "DRY_RUN" : "PENDING",
      rollbackAvailable: false,
    };

    try {
      switch (issue.type) {
        case "orphan_edge":
          await this.repairOrphanEdge(issue, result, dryRun);
          break;
        case "invalid_data":
          await this.repairInvalidData(issue, result, dryRun);
          break;
        case "duplicate":
          await this.repairDuplicate(issue, result, dryRun);
          break;
        case "missing_reference":
          await this.repairMissingReference(issue, result, dryRun);
          break;
        default:
          result.action = "SKIPPED";
          result.error = `Unknown issue type: ${issue.type}`;
      }
    } catch (error) {
      result.success = false;
      result.error = error instanceof Error ? error.message : "Unknown error";
    }

    return result;
  }

  /**
   * Repariert verwaiste Edges
   */
  private async repairOrphanEdge(
    issue: IntegrityIssue,
    result: RepairResult,
    dryRun: boolean,
  ): Promise<void> {
    if (!issue.recordId) {
      result.error = "No record ID provided";
      return;
    }

    const [parentId, childId] = issue.recordId.split("->");

    // Backup erstellen
    const existingEdge = await db.get(
      "SELECT * FROM functions_edges WHERE parent_id = ? AND child_id = ?",
      [parentId, childId],
    );

    if (!existingEdge) {
      result.action = "NO_ACTION_NEEDED";
      result.success = true;
      return;
    }

    result.rollbackData = existingEdge;
    result.rollbackAvailable = true;

    if (dryRun) {
      result.action = `DRY_RUN: Would delete orphan edge ${parentId} -> ${childId}`;
      result.success = true;
      return;
    }

    await db.run(
      "DELETE FROM functions_edges WHERE parent_id = ? AND child_id = ?",
      [parentId, childId],
    );

    result.action = `DELETED orphan edge ${parentId} -> ${childId}`;
    result.success = true;
  }

  /**
   * Repariert ungültige Daten
   */
  private async repairInvalidData(
    issue: IntegrityIssue,
    result: RepairResult,
    dryRun: boolean,
  ): Promise<void> {
    if (!issue.recordId) {
      result.error = "No record ID provided";
      return;
    }

    // Backup erstellen
    const existingNode = await db.get(
      "SELECT * FROM functions_nodes WHERE id = ?",
      [issue.recordId],
    );

    if (!existingNode) {
      result.action = "NO_ACTION_NEEDED";
      result.success = true;
      return;
    }

    result.rollbackData = existingNode;
    result.rollbackAvailable = true;

    // Bei fehlendem Titel: Standardtitel setzen
    if (
      issue.description.includes("missing required title") ||
      issue.description.includes("without title")
    ) {
      const newTitle = `[Auto-Repaired] ${issue.recordId}`;

      if (dryRun) {
        result.action = `DRY_RUN: Would set title to "${newTitle}"`;
        result.success = true;
        return;
      }

      await db.run(
        "UPDATE functions_nodes SET title = ?, updated_at = datetime('now') WHERE id = ?",
        [newTitle, issue.recordId],
      );

      result.action = `UPDATED title to "${newTitle}"`;
      result.success = true;
    } else {
      result.action = "SKIPPED";
      result.error = "Unknown invalid data issue";
    }
  }

  /**
   * Repariert Duplikate
   */
  private async repairDuplicate(
    issue: IntegrityIssue,
    result: RepairResult,
    _dryRun: boolean,
  ): Promise<void> {
    // Duplikate werden vorerst nur gemeldet, nicht automatisch gelöscht
    result.action = "REPORTED_ONLY";
    result.success = true;
    result.error =
      "Duplicate repair requires manual review - keeping all entries";
  }

  /**
   * Repariert fehlende Referenzen
   */
  private async repairMissingReference(
    issue: IntegrityIssue,
    result: RepairResult,
    _dryRun: boolean,
  ): Promise<void> {
    // Fehlende Referenzen werden vorerst nur gemeldet
    result.action = "REPORTED_ONLY";
    result.success = true;
    result.error = "Missing reference repair requires manual review";
  }

  /**
   * Rollback einer Repair-Session
   */
  async rollbackSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      logger.error({ sessionId }, "Session not found for rollback");
      return false;
    }

    logger.info({ sessionId }, "Rolling back session");

    let rollbackCount = 0;

    // Rückwärts durch die Ergebnisse
    for (let i = session.results.length - 1; i >= 0; i--) {
      const result = session.results[i];
      if (result.rollbackAvailable && result.rollbackData) {
        try {
          await this.rollbackResult(result);
          rollbackCount++;
        } catch (error) {
          logger.error(
            { err: error, recordId: result.issue.recordId },
            "Rollback failed for record",
          );
        }
      }
    }

    session.status = "rolledback";
    logger.info({ sessionId, rollbackCount }, "Session rolled back");

    return true;
  }

  /**
   * Rollback eines einzelnen Repair-Ergebnisses
   */
  private async rollbackResult(result: RepairResult): Promise<void> {
    const data = result.rollbackData as Record<string, unknown>;

    if (result.issue.type === "orphan_edge" && data) {
      // Edge wiederherstellen
      await db.run(
        "INSERT OR REPLACE INTO functions_edges (parent_id, child_id, weight, relationship_type) VALUES (?, ?, ?, ?)",
        [
          data.parent_id,
          data.child_id,
          data.weight ?? 1,
          data.relationship_type ?? "contains",
        ],
      );
    } else if (result.issue.type === "invalid_data" && data) {
      // Node wiederherstellen
      await db.run(
        "UPDATE functions_nodes SET title = ?, updated_at = datetime('now') WHERE id = ?",
        [data.title, data.id],
      );
    }
  }

  /**
   * Alte Sessions aufräumen
   */
  private cleanupOldSessions(): void {
    if (this.sessions.size <= this.maxSessionsKept) return;

    const sortedSessions = Array.from(this.sessions.entries()).sort(
      (a, b) => a[1].startTime.getTime() - b[1].startTime.getTime(),
    );

    const toRemove = sortedSessions.slice(
      0,
      sortedSessions.length - this.maxSessionsKept,
    );
    for (const [id] of toRemove) {
      this.sessions.delete(id);
    }
  }

  /**
   * Gibt alle Sessions zurück
   */
  getSessions(): RepairSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Gibt eine Session nach ID zurück
   */
  getSession(sessionId: string): RepairSession | undefined {
    return this.sessions.get(sessionId);
  }
}

export default AutoRepair;
