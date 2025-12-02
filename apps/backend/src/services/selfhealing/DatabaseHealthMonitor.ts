// SPDX-License-Identifier: MIT
// apps/backend/src/services/selfhealing/DatabaseHealthMonitor.ts

import db from "../dbService.js";

export interface HealthCheckResult {
  timestamp: Date;
  status: "healthy" | "degraded" | "unhealthy";
  checks: HealthCheck[];
  summary: string;
}

export interface HealthCheck {
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
  details?: Record<string, unknown>;
  duration?: number;
}

export interface IntegrityIssue {
  type:
    | "orphan_edge"
    | "missing_reference"
    | "duplicate"
    | "invalid_data"
    | "constraint_violation";
  table: string;
  recordId?: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  suggestedFix?: string;
}

/**
 * DatabaseHealthMonitor - Kontinuierliche Überwachung der Datenbankintegrität
 */
export class DatabaseHealthMonitor {
  private lastCheckResult: HealthCheckResult | null = null;
  private isRunning = false;

  constructor() {}

  /**
   * Führt alle Health-Checks durch
   */
  async runHealthChecks(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const checks: HealthCheck[] = [];

    try {
      // 1. Verbindungstest
      checks.push(await this.checkConnection());

      // 2. Schema-Integrität
      checks.push(await this.checkSchemaIntegrity());

      // 3. Referenzielle Integrität
      checks.push(await this.checkReferentialIntegrity());

      // 4. Duplikate prüfen
      checks.push(await this.checkDuplicates());

      // 5. Datenvalidität
      checks.push(await this.checkDataValidity());

      // 6. Speicherplatz
      checks.push(await this.checkStorageHealth());
    } catch (error) {
      checks.push({
        name: "global_check",
        status: "fail",
        message: `Health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }

    const failCount = checks.filter((c) => c.status === "fail").length;
    const warnCount = checks.filter((c) => c.status === "warn").length;

    let status: "healthy" | "degraded" | "unhealthy";
    if (failCount > 0) {
      status = "unhealthy";
    } else if (warnCount > 0) {
      status = "degraded";
    } else {
      status = "healthy";
    }

    const result: HealthCheckResult = {
      timestamp: new Date(),
      status,
      checks,
      summary: `${checks.length} checks completed in ${Date.now() - startTime}ms - ${failCount} failures, ${warnCount} warnings`,
    };

    this.lastCheckResult = result;
    return result;
  }

  /**
   * Prüft die Datenbankverbindung
   */
  private async checkConnection(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      const result = await db.get<{ health_check: number }>(
        "SELECT 1 as health_check",
      );
      return {
        name: "connection",
        status: result?.health_check === 1 ? "pass" : "fail",
        message:
          result?.health_check === 1
            ? "Database connection OK"
            : "Connection check returned unexpected result",
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        name: "connection",
        status: "fail",
        message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        duration: Date.now() - start,
      };
    }
  }

  /**
   * Prüft die Schema-Integrität
   */
  private async checkSchemaIntegrity(): Promise<HealthCheck> {
    const start = Date.now();
    const requiredTables = [
      "functions_nodes",
      "functions_edges",
      "batch_operations",
      "ai_annotations_log",
      "annotations",
      "audit_log",
    ];

    try {
      const existingTables = await db.all<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table'",
      );
      const tableNames = existingTables.map((t) => t.name);
      const missingTables = requiredTables.filter(
        (t) => !tableNames.includes(t),
      );

      if (missingTables.length > 0) {
        return {
          name: "schema_integrity",
          status: "fail",
          message: `Missing tables: ${missingTables.join(", ")}`,
          details: { missingTables },
          duration: Date.now() - start,
        };
      }

      return {
        name: "schema_integrity",
        status: "pass",
        message: "All required tables exist",
        details: { tableCount: tableNames.length },
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        name: "schema_integrity",
        status: "fail",
        message: `Schema check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        duration: Date.now() - start,
      };
    }
  }

  /**
   * Prüft die referenzielle Integrität
   */
  private async checkReferentialIntegrity(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      // Orphan Edges (parent_id ohne zugehörigen Node)
      const orphanParents = await db.all<{ count: number }>(`
        SELECT COUNT(*) as count FROM functions_edges 
        WHERE parent_id NOT IN (SELECT id FROM functions_nodes)
      `);

      // Orphan Edges (child_id ohne zugehörigen Node)
      const orphanChildren = await db.all<{ count: number }>(`
        SELECT COUNT(*) as count FROM functions_edges 
        WHERE child_id NOT IN (SELECT id FROM functions_nodes)
      `);

      const orphanParentCount = orphanParents[0]?.count ?? 0;
      const orphanChildCount = orphanChildren[0]?.count ?? 0;
      const totalOrphans = orphanParentCount + orphanChildCount;

      if (totalOrphans > 0) {
        return {
          name: "referential_integrity",
          status: "warn",
          message: `Found ${totalOrphans} orphan edges`,
          details: {
            orphanParents: orphanParentCount,
            orphanChildren: orphanChildCount,
          },
          duration: Date.now() - start,
        };
      }

      return {
        name: "referential_integrity",
        status: "pass",
        message: "All references are valid",
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        name: "referential_integrity",
        status: "fail",
        message: `Reference check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        duration: Date.now() - start,
      };
    }
  }

  /**
   * Prüft auf Duplikate
   */
  private async checkDuplicates(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      // Doppelte Einträge in functions_nodes basierend auf title + kind
      const duplicates = await db.all<{
        title: string;
        kind: string;
        cnt: number;
      }>(`
        SELECT title, kind, COUNT(*) as cnt 
        FROM functions_nodes 
        GROUP BY title, kind 
        HAVING COUNT(*) > 1
      `);

      if (duplicates.length > 0) {
        return {
          name: "duplicates",
          status: "warn",
          message: `Found ${duplicates.length} duplicate entries`,
          details: { duplicates: duplicates.slice(0, 10) },
          duration: Date.now() - start,
        };
      }

      return {
        name: "duplicates",
        status: "pass",
        message: "No duplicate entries found",
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        name: "duplicates",
        status: "fail",
        message: `Duplicate check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        duration: Date.now() - start,
      };
    }
  }

  /**
   * Prüft die Datenvalidität
   */
  private async checkDataValidity(): Promise<HealthCheck> {
    const start = Date.now();
    const issues: string[] = [];

    try {
      // Nodes ohne Titel
      const noTitle = await db.get<{ count: number }>(
        "SELECT COUNT(*) as count FROM functions_nodes WHERE title IS NULL OR title = ''",
      );
      if ((noTitle?.count ?? 0) > 0) {
        issues.push(`${noTitle?.count} nodes without title`);
      }

      // Nodes mit ungültigem kind
      const validKinds = [
        "category",
        "section",
        "record",
        "collection",
        "action",
        "note",
        "group",
        "workflow",
        "report",
        "dataset",
        "item",
      ];
      const invalidKind = await db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM functions_nodes WHERE kind NOT IN (${validKinds.map(() => "?").join(",")})`,
        validKinds,
      );
      if ((invalidKind?.count ?? 0) > 0) {
        issues.push(`${invalidKind?.count} nodes with invalid kind`);
      }

      if (issues.length > 0) {
        return {
          name: "data_validity",
          status: "warn",
          message: `Data validity issues: ${issues.join("; ")}`,
          details: { issues },
          duration: Date.now() - start,
        };
      }

      return {
        name: "data_validity",
        status: "pass",
        message: "All data is valid",
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        name: "data_validity",
        status: "fail",
        message: `Data validity check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        duration: Date.now() - start,
      };
    }
  }

  /**
   * Prüft den Speicherstatus
   */
  private async checkStorageHealth(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      const nodeCount = await db.get<{ count: number }>(
        "SELECT COUNT(*) as count FROM functions_nodes",
      );
      const edgeCount = await db.get<{ count: number }>(
        "SELECT COUNT(*) as count FROM functions_edges",
      );
      const logCount = await db.get<{ count: number }>(
        "SELECT COUNT(*) as count FROM ai_annotations_log",
      );

      const totalRecords =
        (nodeCount?.count ?? 0) +
        (edgeCount?.count ?? 0) +
        (logCount?.count ?? 0);

      // Warnung bei sehr vielen Einträgen im Log
      if ((logCount?.count ?? 0) > 10000) {
        return {
          name: "storage_health",
          status: "warn",
          message: "Large number of log entries - consider cleanup",
          details: {
            nodes: nodeCount?.count,
            edges: edgeCount?.count,
            logs: logCount?.count,
            totalRecords,
          },
          duration: Date.now() - start,
        };
      }

      return {
        name: "storage_health",
        status: "pass",
        message: `Database contains ${totalRecords} records`,
        details: {
          nodes: nodeCount?.count,
          edges: edgeCount?.count,
          logs: logCount?.count,
          totalRecords,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        name: "storage_health",
        status: "fail",
        message: `Storage check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        duration: Date.now() - start,
      };
    }
  }

  /**
   * Ermittelt alle Integritätsprobleme
   */
  async findIntegrityIssues(): Promise<IntegrityIssue[]> {
    const issues: IntegrityIssue[] = [];

    try {
      // Orphan edges (parent)
      const orphanParents = await db.all<{
        parent_id: string;
        child_id: string;
      }>(`
        SELECT parent_id, child_id FROM functions_edges 
        WHERE parent_id NOT IN (SELECT id FROM functions_nodes)
      `);
      for (const edge of orphanParents) {
        issues.push({
          type: "orphan_edge",
          table: "functions_edges",
          recordId: `${edge.parent_id}->${edge.child_id}`,
          description: `Edge references non-existent parent node: ${edge.parent_id}`,
          severity: "high",
          suggestedFix: "DELETE edge or restore parent node",
        });
      }

      // Orphan edges (child)
      const orphanChildren = await db.all<{
        parent_id: string;
        child_id: string;
      }>(`
        SELECT parent_id, child_id FROM functions_edges 
        WHERE child_id NOT IN (SELECT id FROM functions_nodes)
      `);
      for (const edge of orphanChildren) {
        issues.push({
          type: "orphan_edge",
          table: "functions_edges",
          recordId: `${edge.parent_id}->${edge.child_id}`,
          description: `Edge references non-existent child node: ${edge.child_id}`,
          severity: "high",
          suggestedFix: "DELETE edge or restore child node",
        });
      }

      // Nodes without required fields
      const nodesWithoutTitle = await db.all<{ id: string }>(
        "SELECT id FROM functions_nodes WHERE title IS NULL OR title = ''",
      );
      for (const node of nodesWithoutTitle) {
        issues.push({
          type: "invalid_data",
          table: "functions_nodes",
          recordId: node.id,
          description: "Node is missing required title field",
          severity: "medium",
          suggestedFix: "Set a title or remove the node",
        });
      }
    } catch (error) {
      console.error(
        "Error finding integrity issues:",
        error instanceof Error ? error.message : error,
      );
    }

    return issues;
  }

  /**
   * Gibt das letzte Check-Ergebnis zurück
   */
  getLastCheckResult(): HealthCheckResult | null {
    return this.lastCheckResult;
  }

  /**
   * Prüft ob der Monitor läuft
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }
}

export default new DatabaseHealthMonitor();
