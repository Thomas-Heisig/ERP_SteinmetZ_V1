// src/routes/health.ts
import { Router, Request, Response } from "express";
import { getVersionInfo } from "../../version.js";
import { shutdownManager } from "../other/shutdownManager.js";
import redisService from "../other/redisService.js";

const router = Router();

type LogicalStatus = "healthy" | "degraded" | "unhealthy" | "shutting_down";

type HealthChecks = {
  processUp: boolean;
  hasOpenAIKey: boolean;
  hasAnthropicKey: boolean;
  hasOllamaUrl: boolean;
  redisConnected?: boolean;
};

type RedisStatus = {
  connected: boolean;
  usingFallback: boolean;
};

function computeStatus(
  checks: HealthChecks,
  isShuttingDown: boolean,
): LogicalStatus {
  if (isShuttingDown) return "shutting_down";
  const vals = Object.values(checks);
  if (vals.every(Boolean)) return "healthy";
  if (vals.some(Boolean)) return "degraded";
  return "unhealthy";
}

function basePayload(
  status: LogicalStatus,
  checks: HealthChecks,
  isShuttingDown: boolean,
  redis?: RedisStatus,
) {
  const versionInfo = getVersionInfo();
  return {
    status,
    shuttingDown: isShuttingDown,
    timestamp: new Date().toISOString(),
    version: versionInfo.version,
    buildDate: versionInfo.buildDate,
    environment: versionInfo.environment,
    nodeVersion: versionInfo.nodeVersion,
    platform: versionInfo.platform,
    arch: versionInfo.arch,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks,
    redis,
  };
}

/**
 * Liveness: billig, immer 200, Zustand im Body.
 * Mountpoint in index.ts: app.use('/api/health', healthRouter)
 * -> Dieser Handler antwortet auf GET /api/health
 */
router.get("/", (_req: Request, res: Response) => {
  try {
    const isShuttingDown = shutdownManager.isShuttingDown();
    const redisStatus = redisService.getStatus();
    const checks: HealthChecks = {
      processUp: !isShuttingDown,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasOllamaUrl: !!process.env.OLLAMA_BASE_URL,
      redisConnected: redisStatus.connected,
    };
    const status = computeStatus(checks, isShuttingDown);
    res.setHeader("Cache-Control", "no-store");
    return res
      .status(200)
      .json(basePayload(status, checks, isShuttingDown, redisStatus));
  } catch (error) {
    console.error("Health (liveness) error:", error);
    res.setHeader("Cache-Control", "no-store");
    return res
      .status(200)
      .json(basePayload("degraded", { processUp: true, hasOpenAIKey: false, hasAnthropicKey: false, hasOllamaUrl: false }, false)); // liveness bleibt 200
  }
});

/**
 * Readiness: kann 503 liefern, wenn Kernabhängigkeiten fehlen.
 * -> GET /api/health/readiness
 */
router.get("/readiness", async (_req: Request, res: Response) => {
  try {
    const isShuttingDown = shutdownManager.isShuttingDown();
    const checks: HealthChecks = {
      processUp: !isShuttingDown,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasOllamaUrl: !!process.env.OLLAMA_BASE_URL,
      // hier optional kurze Pings mit kleinem Timeout einbauen
    };
    const status = computeStatus(checks, isShuttingDown);
    // Return 503 during shutdown or if unhealthy
    const http = status === "healthy" ? 200 : 503;
    res.setHeader("Cache-Control", "no-store");
    return res.status(http).json(basePayload(status, checks, isShuttingDown));
  } catch (error) {
    console.error("Health (readiness) error:", error);
    res.setHeader("Cache-Control", "no-store");
    return res
      .status(503)
      .json(basePayload("unhealthy", { processUp: false, hasOpenAIKey: false, hasAnthropicKey: false, hasOllamaUrl: false }, false));
  }
});

/** Schneller HEAD-Probe: 204 No Content */
router.head("/", (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(204).end();
});

/**
 * Version Info: Returns version and build information
 * -> GET /api/health/version
 */
router.get("/version", (_req: Request, res: Response) => {
  const versionInfo = getVersionInfo();
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    success: true,
    ...versionInfo,
  });
});

export default router;
