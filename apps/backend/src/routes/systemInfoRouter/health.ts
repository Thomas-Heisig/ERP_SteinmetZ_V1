// src/routes/health.ts
import { Router, Request, Response } from "express";
import { getVersionInfo } from "../../version.js";

const router = Router();

type LogicalStatus = "healthy" | "degraded" | "unhealthy";

function computeStatus(details: Record<string, boolean>): LogicalStatus {
  const vals = Object.values(details);
  if (vals.every(Boolean)) return "healthy";
  if (vals.some(Boolean)) return "degraded";
  return "unhealthy";
}

function basePayload(status: LogicalStatus, details: Record<string, boolean>) {
  const versionInfo = getVersionInfo();
  return {
    status,
    timestamp: new Date().toISOString(),
    version: versionInfo.version,
    buildDate: versionInfo.buildDate,
    environment: versionInfo.environment,
    nodeVersion: versionInfo.nodeVersion,
    platform: versionInfo.platform,
    arch: versionInfo.arch,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    details, // z. B. { hasOpenAIKey: false, hasOllamaUrl: true, … }
  };
}

/**
 * Liveness: billig, immer 200, Zustand im Body.
 * Mountpoint in index.ts: app.use('/api/health', healthRouter)
 * -> Dieser Handler antwortet auf GET /api/health
 */
router.get("/", (_req: Request, res: Response) => {
  try {
    const details = {
      processUp: true,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasOllamaUrl: !!process.env.OLLAMA_BASE_URL,
    };
    const status = computeStatus(details);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(basePayload(status, details));
  } catch (error) {
    console.error("Health (liveness) error:", error);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(basePayload("degraded", { processUp: true })); // liveness bleibt 200
  }
});

/**
 * Readiness: kann 503 liefern, wenn Kernabhängigkeiten fehlen.
 * -> GET /api/health/readiness
 */
router.get("/readiness", async (_req: Request, res: Response) => {
  try {
    const details = {
      processUp: true,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasOllamaUrl: !!process.env.OLLAMA_BASE_URL,
      // hier optional kurze Pings mit kleinem Timeout einbauen
    };
    const status = computeStatus(details);
    const http = status === "healthy" ? 200 : 503;
    res.setHeader("Cache-Control", "no-store");
    return res.status(http).json(basePayload(status, details));
  } catch (error) {
    console.error("Health (readiness) error:", error);
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json(basePayload("unhealthy", { processUp: false }));
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
