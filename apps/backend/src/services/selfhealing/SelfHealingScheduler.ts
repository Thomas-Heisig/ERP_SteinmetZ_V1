// SPDX-License-Identifier: MIT
// apps/backend/src/services/selfhealing/SelfHealingScheduler.ts

import { DatabaseHealthMonitor, HealthCheckResult } from "./DatabaseHealthMonitor.js";
import { AutoRepair, RepairSession } from "./AutoRepair.js";
import { HealingReport } from "./HealingReport.js";

export interface ScheduleConfig {
  nightlyCheckEnabled: boolean;
  nightlyCheckHour: number; // 0-23
  weeklyDeepAnalysisEnabled: boolean;
  weeklyDeepAnalysisDay: number; // 0 = Sunday, 6 = Saturday
  autoRepairEnabled: boolean;
  autoRepairDryRunOnly: boolean;
  reportingEnabled: boolean;
}

export interface ScheduledTask {
  id: string;
  name: string;
  type: "nightly" | "weekly" | "manual";
  scheduledTime: Date;
  executedTime?: Date;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  result?: HealthCheckResult | RepairSession;
  error?: string;
}

/**
 * SelfHealingScheduler - Nächtliche Checks, wöchentliche Tiefenanalyse
 */
export class SelfHealingScheduler {
  private healthMonitor: DatabaseHealthMonitor;
  private autoRepair: AutoRepair;
  private report: HealingReport;

  private config: ScheduleConfig;
  private scheduledTasks: Map<string, ScheduledTask> = new Map();
  private nightlyInterval?: ReturnType<typeof setInterval>;
  private isRunning = false;

  constructor(
    healthMonitor: DatabaseHealthMonitor,
    autoRepair: AutoRepair,
    report: HealingReport
  ) {
    this.healthMonitor = healthMonitor;
    this.autoRepair = autoRepair;
    this.report = report;

    this.config = {
      nightlyCheckEnabled: true,
      nightlyCheckHour: 3, // 3:00 AM
      weeklyDeepAnalysisEnabled: true,
      weeklyDeepAnalysisDay: 0, // Sunday
      autoRepairEnabled: true,
      autoRepairDryRunOnly: false,
      reportingEnabled: true,
    };
  }

  /**
   * Startet den Scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.log("⚠️ [Scheduler] Already running");
      return;
    }

    this.isRunning = true;
    console.log("🚀 [Scheduler] Starting self-healing scheduler");

    // Stündlich prüfen, ob eine geplante Aufgabe ausgeführt werden soll
    this.nightlyInterval = setInterval(
      () => this.checkScheduledTasks(),
      60 * 60 * 1000 // 1 Stunde
    );

    // Initiale Prüfung
    this.checkScheduledTasks();
  }

  /**
   * Stoppt den Scheduler
   */
  stop(): void {
    if (this.nightlyInterval) {
      clearInterval(this.nightlyInterval);
      this.nightlyInterval = undefined;
    }
    this.isRunning = false;
    console.log("🛑 [Scheduler] Stopped");
  }

  /**
   * Prüft, ob geplante Aufgaben ausgeführt werden müssen
   */
  private async checkScheduledTasks(): Promise<void> {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Nächtlicher Check
    if (
      this.config.nightlyCheckEnabled &&
      currentHour === this.config.nightlyCheckHour
    ) {
      await this.runNightlyCheck();
    }

    // Wöchentliche Tiefenanalyse (nur am konfigurierten Tag)
    if (
      this.config.weeklyDeepAnalysisEnabled &&
      currentDay === this.config.weeklyDeepAnalysisDay &&
      currentHour === this.config.nightlyCheckHour
    ) {
      await this.runWeeklyDeepAnalysis();
    }
  }

  /**
   * Führt den nächtlichen Check durch
   */
  async runNightlyCheck(): Promise<ScheduledTask> {
    const taskId = `nightly-${Date.now()}`;
    const task: ScheduledTask = {
      id: taskId,
      name: "Nächtlicher Health-Check",
      type: "nightly",
      scheduledTime: new Date(),
      status: "running",
    };

    this.scheduledTasks.set(taskId, task);
    console.log(`🌙 [Scheduler] Running nightly check (${taskId})`);

    try {
      // Health Check durchführen
      const healthResult = await this.healthMonitor.runHealthChecks();
      task.result = healthResult;

      // Bei Problemen automatisch reparieren
      if (
        this.config.autoRepairEnabled &&
        (healthResult.status === "degraded" ||
          healthResult.status === "unhealthy")
      ) {
        console.log("🔧 [Scheduler] Issues found, starting auto-repair");
        const repairSession = await this.autoRepair.startRepairSession(
          this.config.autoRepairDryRunOnly
        );
        task.result = repairSession;
      }

      // Report erstellen
      if (this.config.reportingEnabled) {
        await this.report.createReport("nightly", healthResult);
      }

      task.status = "completed";
      task.executedTime = new Date();
    } catch (error) {
      task.status = "failed";
      task.error = error instanceof Error ? error.message : "Unknown error";
      task.executedTime = new Date();
      console.error(`❌ [Scheduler] Nightly check failed:`, task.error);
    }

    return task;
  }

  /**
   * Führt die wöchentliche Tiefenanalyse durch
   */
  async runWeeklyDeepAnalysis(): Promise<ScheduledTask> {
    const taskId = `weekly-${Date.now()}`;
    const task: ScheduledTask = {
      id: taskId,
      name: "Wöchentliche Tiefenanalyse",
      type: "weekly",
      scheduledTime: new Date(),
      status: "running",
    };

    this.scheduledTasks.set(taskId, task);
    console.log(`📊 [Scheduler] Running weekly deep analysis (${taskId})`);

    try {
      // Ausführlicher Health Check
      const healthResult = await this.healthMonitor.runHealthChecks();

      // Alle Integritätsprobleme finden
      const issues = await this.healthMonitor.findIntegrityIssues();

      // Auto-Repair wenn aktiviert
      let repairSession: RepairSession | undefined;
      if (this.config.autoRepairEnabled && issues.length > 0) {
        console.log(
          `🔧 [Scheduler] Found ${issues.length} issues, starting repair`
        );
        repairSession = await this.autoRepair.startRepairSession(
          this.config.autoRepairDryRunOnly
        );
      }

      // Ausführlichen Report erstellen
      if (this.config.reportingEnabled) {
        await this.report.createReport("weekly", healthResult, {
          issues,
          repairSession,
        });
      }

      task.result = repairSession || healthResult;
      task.status = "completed";
      task.executedTime = new Date();
    } catch (error) {
      task.status = "failed";
      task.error = error instanceof Error ? error.message : "Unknown error";
      task.executedTime = new Date();
      console.error(`❌ [Scheduler] Weekly analysis failed:`, task.error);
    }

    return task;
  }

  /**
   * Manueller Health-Check
   */
  async runManualCheck(): Promise<ScheduledTask> {
    const taskId = `manual-${Date.now()}`;
    const task: ScheduledTask = {
      id: taskId,
      name: "Manueller Health-Check",
      type: "manual",
      scheduledTime: new Date(),
      status: "running",
    };

    this.scheduledTasks.set(taskId, task);
    console.log(`🔍 [Scheduler] Running manual check (${taskId})`);

    try {
      const healthResult = await this.healthMonitor.runHealthChecks();
      task.result = healthResult;
      task.status = "completed";
      task.executedTime = new Date();
    } catch (error) {
      task.status = "failed";
      task.error = error instanceof Error ? error.message : "Unknown error";
      task.executedTime = new Date();
    }

    return task;
  }

  /**
   * Konfiguration aktualisieren
   */
  updateConfig(newConfig: Partial<ScheduleConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("⚙️ [Scheduler] Configuration updated", this.config);
  }

  /**
   * Gibt die aktuelle Konfiguration zurück
   */
  getConfig(): ScheduleConfig {
    return { ...this.config };
  }

  /**
   * Gibt alle geplanten Tasks zurück
   */
  getScheduledTasks(): ScheduledTask[] {
    return Array.from(this.scheduledTasks.values())
      .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime())
      .slice(0, 100); // Nur letzte 100
  }

  /**
   * Gibt einen Task nach ID zurück
   */
  getTask(taskId: string): ScheduledTask | undefined {
    return this.scheduledTasks.get(taskId);
  }

  /**
   * Status des Schedulers
   */
  getStatus(): {
    isRunning: boolean;
    config: ScheduleConfig;
    taskCount: number;
    lastTask?: ScheduledTask;
  } {
    const tasks = this.getScheduledTasks();
    return {
      isRunning: this.isRunning,
      config: this.config,
      taskCount: tasks.length,
      lastTask: tasks[0],
    };
  }
}

export default SelfHealingScheduler;
