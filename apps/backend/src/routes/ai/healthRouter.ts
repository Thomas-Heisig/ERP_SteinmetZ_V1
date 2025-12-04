// apps/backend/src/routes/ai/healthRouter.ts
/**
 * AI Provider Health Check Router
 * ---------------------------------------------------------
 * Provides endpoints to check the health of all AI providers
 */

import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import {
  checkAllProviders,
  checkOpenAIHealth,
  checkOllamaHealth,
  checkAnthropicHealth,
  checkFallbackHealth,
  getAvailableProviders,
  getBestAvailableProvider,
} from "../../services/aiProviderHealthService.js";

const router = Router();

/**
 * GET /api/ai/health
 * Check health of all AI providers
 */
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const health = await checkAllProviders();
    res.json({
      success: true,
      data: health,
    });
  }),
);

/**
 * GET /api/ai/health/openai
 * Check OpenAI provider health
 */
router.get(
  "/openai",
  asyncHandler(async (_req, res) => {
    const health = await checkOpenAIHealth();
    res.json({
      success: true,
      data: health,
    });
  }),
);

/**
 * GET /api/ai/health/ollama
 * Check Ollama provider health
 */
router.get(
  "/ollama",
  asyncHandler(async (_req, res) => {
    const health = await checkOllamaHealth();
    res.json({
      success: true,
      data: health,
    });
  }),
);

/**
 * GET /api/ai/health/anthropic
 * Check Anthropic provider health
 */
router.get(
  "/anthropic",
  asyncHandler(async (_req, res) => {
    const health = await checkAnthropicHealth();
    res.json({
      success: true,
      data: health,
    });
  }),
);

/**
 * GET /api/ai/health/fallback
 * Check fallback provider health (always healthy)
 */
router.get(
  "/fallback",
  asyncHandler(async (_req, res) => {
    const health = await checkFallbackHealth();
    res.json({
      success: true,
      data: health,
    });
  }),
);

/**
 * GET /api/ai/health/available
 * Get list of available (healthy) providers
 */
router.get(
  "/available",
  asyncHandler(async (_req, res) => {
    const available = await getAvailableProviders();
    res.json({
      success: true,
      data: {
        providers: available,
        count: available.length,
      },
    });
  }),
);

/**
 * GET /api/ai/health/best
 * Get the best available provider based on priority and health
 */
router.get(
  "/best",
  asyncHandler(async (_req, res) => {
    const best = await getBestAvailableProvider();
    res.json({
      success: true,
      data: {
        provider: best,
      },
    });
  }),
);

export default router;
