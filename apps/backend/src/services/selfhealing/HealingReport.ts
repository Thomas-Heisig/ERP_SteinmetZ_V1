// SPDX-License-Identifier: MIT
// apps/backend/src/services/selfhealing/HealingReport.ts

import { HealthCheckResult } from "./DatabaseHealthMonitor.js";
import { IntegrityIssue } from "./DatabaseHealthMonitor.js";
import { RepairSession } from "./AutoRepair.js";
import db from "../dbService.js";

export interface HealingReportEntry {
  id: string;
  timestamp: Date;
  type: "nightly" | "weekly" | "manual" | "repair";
  status: "success" | "warning" | "error";
  summary: string;
  healthResult?: HealthCheckResult;
  issues?: IntegrityIssue[];
  repairSession?: RepairSession;
  details?: Record<string, unknown>;
}

/**
 * HealingReport - Audit-Trail aller automatischen Änderungen
 */
export class HealingReport {
  private reports: Map<string, HealingReportEntry> = new Map();
  private maxReportsKept = 1000;

  constructor() {}

  /**
   * Erstellt einen neuen Report
   */
  async createReport(
    type: "nightly" | "weekly" | "manual" | "repair",
    healthResult: HealthCheckResult,
    additionalData?: {
      issues?: IntegrityIssue[];
      repairSession?: RepairSession;
    }
  ): Promise<HealingReportEntry> {
    const reportId = crypto.randomUUID();
    
    let status: "success" | "warning" | "error";
    if (healthResult.status === "healthy") {
      status = "success";
    } else if (healthResult.status === "degraded") {
      status = "warning";
    } else {
      status = "error";
    }

    const report: HealingReportEntry = {
      id: reportId,
      timestamp: new Date(),
      type,
      status,
      summary: this.generateSummary(type, healthResult, additionalData),
      healthResult,
      issues: additionalData?.issues,
      repairSession: additionalData?.repairSession,
      details: {
        checksPerformed: healthResult.checks.length,
        checksPassed: healthResult.checks.filter((c) => c.status === "pass").length,
        checksWarned: healthResult.checks.filter((c) => c.status === "warn").length,
        checksFailed: healthResult.checks.filter((c) => c.status === "fail").length,
        issuesFound: additionalData?.issues?.length ?? 0,
        repairsAttempted: additionalData?.repairSession?.results.length ?? 0,
        repairsSuccessful: additionalData?.repairSession?.results.filter((r) => r.success).length ?? 0,
      },
    };

    this.reports.set(reportId, report);

    // In Datenbank speichern
    await this.saveReportToDatabase(report);

    // Alte Reports aufräumen
    this.cleanupOldReports();

    console.log(`📝 [HealingReport] Created report ${reportId}: ${status}`);
    return report;
  }

  /**
   * Speichert einen Report in der Datenbank
   */
  private async saveReportToDatabase(report: HealingReportEntry): Promise<void> {
    try {
      await db.run(
        `INSERT INTO audit_log (entity, entity_id, action, details, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          "selfhealing_report",
          report.id,
          report.type,
          JSON.stringify({
            status: report.status,
            summary: report.summary,
            details: report.details,
          }),
          report.timestamp.toISOString(),
        ]
      );
    } catch (error) {
      console.error(
        "❌ [HealingReport] Failed to save report to database:",
        error instanceof Error ? error.message : error
      );
    }
  }

  /**
   * Generiert eine Zusammenfassung des Reports
   */
  private generateSummary(
    type: "nightly" | "weekly" | "manual" | "repair",
    healthResult: HealthCheckResult,
    additionalData?: {
      issues?: IntegrityIssue[];
      repairSession?: RepairSession;
    }
  ): string {
    const parts: string[] = [];

    // Typ des Checks
    const typeLabels = {
      nightly: "Nächtlicher Check",
      weekly: "Wöchentliche Tiefenanalyse",
      manual: "Manueller Check",
      repair: "Reparatur-Session",
    };
    parts.push(typeLabels[type]);

    // Status
    parts.push(`Status: ${healthResult.status}`);

    // Checks
    const passed = healthResult.checks.filter((c) => c.status === "pass").length;
    const warned = healthResult.checks.filter((c) => c.status === "warn").length;
    const failed = healthResult.checks.filter((c) => c.status === "fail").length;
    parts.push(
      `Checks: ${passed} OK, ${warned} Warnungen, ${failed} Fehler`
    );

    // Issues
    if (additionalData?.issues && additionalData.issues.length > 0) {
      parts.push(`${additionalData.issues.length} Integritätsprobleme gefunden`);
    }

    // Reparaturen
    if (additionalData?.repairSession) {
      const successful = additionalData.repairSession.results.filter(
        (r) => r.success
      ).length;
      parts.push(
        `${successful}/${additionalData.repairSession.results.length} Reparaturen erfolgreich`
      );
    }

    return parts.join(" | ");
  }

  /**
   * Alte Reports aufräumen
   */
  private cleanupOldReports(): void {
    if (this.reports.size <= this.maxReportsKept) return;

    const sortedReports = Array.from(this.reports.entries())
      .sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());

    const toRemove = sortedReports.slice(
      0,
      sortedReports.length - this.maxReportsKept
    );
    for (const [id] of toRemove) {
      this.reports.delete(id);
    }
  }

  /**
   * Gibt alle Reports zurück
   */
  getReports(limit = 100): HealingReportEntry[] {
    return Array.from(this.reports.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Gibt einen Report nach ID zurück
   */
  getReport(reportId: string): HealingReportEntry | undefined {
    return this.reports.get(reportId);
  }

  /**
   * Lädt Reports aus der Datenbank
   */
  async loadReportsFromDatabase(limit = 100): Promise<HealingReportEntry[]> {
    try {
      const rows = await db.all<{
        entity_id: string;
        action: string;
        details: string;
        created_at: string;
      }>(
        `SELECT entity_id, action, details, created_at 
         FROM audit_log 
         WHERE entity = 'selfhealing_report' 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [limit]
      );

      return rows.map((row) => {
        const details = JSON.parse(row.details);
        return {
          id: row.entity_id,
          timestamp: new Date(row.created_at),
          type: row.action as "nightly" | "weekly" | "manual" | "repair",
          status: details.status,
          summary: details.summary,
          details: details.details,
        };
      });
    } catch (error) {
      console.error(
        "❌ [HealingReport] Failed to load reports from database:",
        error instanceof Error ? error.message : error
      );
      return [];
    }
  }

  /**
   * Generiert einen Statistik-Report
   */
  getStatistics(): {
    totalReports: number;
    successRate: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    lastReport?: HealingReportEntry;
  } {
    const reports = Array.from(this.reports.values());

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const report of reports) {
      byType[report.type] = (byType[report.type] ?? 0) + 1;
      byStatus[report.status] = (byStatus[report.status] ?? 0) + 1;
    }

    const successCount = byStatus.success ?? 0;
    const successRate =
      reports.length > 0 ? (successCount / reports.length) * 100 : 100;

    return {
      totalReports: reports.length,
      successRate: Math.round(successRate * 100) / 100,
      byType,
      byStatus,
      lastReport: reports.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      )[0],
    };
  }
}

export default new HealingReport();
