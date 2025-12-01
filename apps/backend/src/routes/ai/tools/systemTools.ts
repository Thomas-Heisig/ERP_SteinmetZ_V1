/**
 * systemTools.ts
 * ---------------------------------------------------------
 * Erweiterte Systemdiagnose-, Sicherheits- und Monitoring-Werkzeuge.
 * Für ERP- und KI-Systemdiagnosen. Plattformübergreifend nutzbar.
 */

import os from "node:os";
import fs from "node:fs";
import process from "node:process";
import { execSync } from "node:child_process";
import { toolRegistry, type ToolFunction } from "./registry.js";

/* ─────────────────────────────────────────────
 * 🧠 Systeminformationen (Allgemein)
 * ───────────────────────────────────────────── */
const systemInfoTool: ToolFunction = async (params?: Record<string, any>) => {
  const section = params?.section as string | undefined;

  const info = {
    platform: process.platform,
    arch: process.arch,
    node_version: process.version,
    cpu: os.cpus(),
    cpu_model: os.cpus()[0]?.model ?? "unbekannt",
    cpu_count: os.cpus().length,
    load_avg: os.loadavg(),
    total_memory: os.totalmem(),
    free_memory: os.freemem(),
    used_memory: os.totalmem() - os.freemem(),
    uptime_seconds: os.uptime(),
    process_uptime: process.uptime(),
    process_memory: process.memoryUsage(),
    cwd: process.cwd(),
    home_dir: os.homedir(),
    hostname: os.hostname(),
    tmp_dir: os.tmpdir(),
    network_interfaces: os.networkInterfaces(),
    user: os.userInfo(),
    environment: Object.fromEntries(
      Object.entries(process.env).filter(
        ([k]) =>
          !k.toLowerCase().includes("password") &&
          !k.toLowerCase().includes("token") &&
          !k.toLowerCase().includes("secret"),
      ),
    ),
    timestamps: {
      now: new Date().toISOString(),
      start_time: new Date(Date.now() - process.uptime() * 1000).toISOString(),
    },
  };

  if (section) {
    switch (section.toLowerCase()) {
      case "cpu":
        return { cpu: info.cpu, load_avg: info.load_avg };
      case "memory":
        return {
          total_memory: info.total_memory,
          free_memory: info.free_memory,
          used_memory: info.used_memory,
          process_memory: info.process_memory,
        };
      case "network":
        return { network_interfaces: info.network_interfaces };
      case "process":
        return {
          pid: process.pid,
          cwd: info.cwd,
          uptime: info.process_uptime,
          memory: info.process_memory,
        };
      case "os":
        return {
          platform: info.platform,
          arch: info.arch,
          release: os.release(),
          type: os.type(),
          version: (os as any).version?.() ?? "n/a",
        };
      default:
        return { note: `Sektion '${section}' nicht erkannt`, full: info };
    }
  }

  return info;
};

systemInfoTool.description =
  "Liefert vollständige Systeminformationen oder spezifische Teilbereiche.";
systemInfoTool.parameters = {
  section: "Optional: cpu, memory, network, process, os",
};
systemInfoTool.category = "system_info";
systemInfoTool.version = "1.2";
toolRegistry.register("get_system_info", systemInfoTool);

/* ─────────────────────────────────────────────
 * 🧩 Systemlast / Performance
 * ───────────────────────────────────────────── */
const systemLoadTool: ToolFunction = async () => {
  const cpus = os.cpus();
  const load = os.loadavg();
  const memUsed = (1 - os.freemem() / os.totalmem()) * 100;

  return {
    cpu_model: cpus[0]?.model,
    cpu_count: cpus.length,
    load_avg: load.map((v) => Number(v.toFixed(2))),
    mem_usage_percent: Math.round(memUsed),
    status: {
      cpu: load[0] > cpus.length ? "hoch" : "normal",
      memory: memUsed > 85 ? "kritisch" : memUsed > 70 ? "hoch" : "ok",
    },
  };
};

systemLoadTool.description = "Analysiert CPU- und Speicherlast.";
systemLoadTool.category = "system_monitoring";
systemLoadTool.version = "1.1";
toolRegistry.register("get_system_load", systemLoadTool);

/* ─────────────────────────────────────────────
 * 🧮 Laufzeitdiagnose
 * ───────────────────────────────────────────── */
const runtimeDiagnosticsTool: ToolFunction = async () => {
  const mem = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  return {
    pid: process.pid,
    node_version: process.version,
    uptime_seconds: process.uptime(),
    exec_path: process.execPath,
    argv: process.argv,
    memory: {
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external,
    },
    cpu: {
      user_ms: Math.round(cpuUsage.user / 1000),
      system_ms: Math.round(cpuUsage.system / 1000),
    },
    env_vars_count: Object.keys(process.env).length,
  };
};

runtimeDiagnosticsTool.description =
  "Zeigt Prozesslaufzeit- und Speichermetriken an.";
runtimeDiagnosticsTool.category = "system_monitoring";
runtimeDiagnosticsTool.version = "1.0";
toolRegistry.register("runtime_diagnostics", runtimeDiagnosticsTool);

/* ─────────────────────────────────────────────
 * 🧱 Systemberechtigungen
 * ───────────────────────────────────────────── */
const systemPermissionsTool: ToolFunction = async () => {
  const user = os.userInfo();
  let canWriteTmp = false;

  try {
    const testPath = `${os.tmpdir()}/perm_test_${Date.now()}.tmp`;
    fs.writeFileSync(testPath, "test");
    fs.unlinkSync(testPath);
    canWriteTmp = true;
  } catch {}

  return {
    user: user.username,
    uid: user.uid,
    gid: user.gid,
    home: user.homedir,
    shell: user.shell,
    writable_tmp: canWriteTmp,
  };
};

systemPermissionsTool.description =
  "Prüft grundlegende Benutzer- und Schreibrechte.";
systemPermissionsTool.category = "system_security";
systemPermissionsTool.version = "1.0";
toolRegistry.register("check_system_permissions", systemPermissionsTool);

/* ─────────────────────────────────────────────
 * 🧩 Systemintegritätsprüfung
 * ───────────────────────────────────────────── */
const systemHealthTool: ToolFunction = async () => {
  const memUsage = (1 - os.freemem() / os.totalmem()) * 100;
  const load = os.loadavg()[0];
  const diskOk = fs.existsSync(os.tmpdir());

  return {
    healthy: memUsage < 90 && load < os.cpus().length * 2 && diskOk,
    metrics: {
      load_1m: load.toFixed(2),
      mem_usage_percent: Math.round(memUsage),
      disk_ok: diskOk,
      uptime_minutes: Math.round(os.uptime() / 60),
    },
    status:
      memUsage > 90 ? "kritisch" : load > os.cpus().length ? "hoch" : "ok",
    timestamp: new Date().toISOString(),
  };
};

systemHealthTool.description =
  "Bewertet den allgemeinen Systemzustand (Health Check).";
systemHealthTool.category = "system_health";
systemHealthTool.version = "1.0";
toolRegistry.register("system_health_check", systemHealthTool);

/* ─────────────────────────────────────────────
 * 📦 Systemzusammenfassung
 * ───────────────────────────────────────────── */
const systemSummaryTool: ToolFunction = async () => {
  const load = os.loadavg()[0];
  const memUsage = Math.round((1 - os.freemem() / os.totalmem()) * 100);

  return {
    summary: {
      system: `${os.type()} ${os.release()} (${os.arch()})`,
      hostname: os.hostname(),
      cpu_count: os.cpus().length,
      load_avg: load.toFixed(2),
      mem_usage_percent: memUsage,
      uptime_h: Math.round(os.uptime() / 3600),
    },
    timestamp: new Date().toISOString(),
  };
};

systemSummaryTool.description =
  "Gibt eine kompakte System-Zusammenfassung aus.";
systemSummaryTool.category = "system_info";
systemSummaryTool.version = "1.1";
toolRegistry.register("system_summary", systemSummaryTool);

/* ─────────────────────────────────────────────
 * ⚙️ Erweiterte Prozessliste
 * ───────────────────────────────────────────── */
const processListTool: ToolFunction = async () => {
  try {
    const output =
      process.platform === "win32"
        ? execSync("tasklist", { encoding: "utf8" })
        : execSync("ps -eo pid,comm,%cpu,%mem --sort=-%cpu | head -n 10", {
            encoding: "utf8",
          });

    return {
      success: true,
      top_processes: output.trim(),
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

processListTool.description =
  "Liest laufende Prozesse mit CPU-/RAM-Auslastung (Top 10).";
processListTool.category = "system_monitoring";
processListTool.version = "1.0";
toolRegistry.register("list_top_processes", processListTool);
