// SPDX-License-Identifier: MIT
// apps/backend/src/setup/middlewareSetup.ts

/**
 * Middleware Setup Module
 *
 * Centralized configuration of all Express middleware.
 * Separates middleware configuration from main application file.
 *
 * @module setup/middlewareSetup
 */

import { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { createLogger } from "../utils/logger.js";
import {
  createSessionMiddleware,
  startSessionCleanup,
} from "../middleware/sessionMiddleware.js";
import { metricsMiddleware } from "../middleware/metricsMiddleware.js";
import { errorTrackingMiddleware } from "../middleware/errorTrackingMiddleware.js";
import { errorHandler } from "../middleware/errorHandler.js";

const logger = createLogger("middleware-setup");

/**
 * Interface for middleware configuration
 */
interface MiddlewareConfig {
  corsOrigin: string;
  bodyLimit?: string;
  enableMetrics?: boolean;
  enableErrorTracking?: boolean;
  enableAdminAuth?: boolean;
  adminToken?: string;
}

/**
 * Configure CORS middleware
 */
function setupCors(app: Application, corsOrigin: string): void {
  logger.debug({ corsOrigin }, "Configuring CORS");
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    }),
  );
}

/**
 * Configure body parser middleware
 */
function setupBodyParsers(app: Application, bodyLimit: string = "10mb"): void {
  logger.debug({ bodyLimit }, "Configuring body parsers");
  app.use(express.json({ limit: bodyLimit }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
}

/**
 * Configure session middleware
 */
function setupSessionMiddleware(app: Application): void {
  logger.debug("Configuring session middleware with Redis support");
  app.use(createSessionMiddleware());
  startSessionCleanup();
  logger.info("Session cleanup scheduler started");
}

/**
 * Configure metrics middleware
 */
function setupMetrics(app: Application): void {
  logger.debug("Enabling metrics middleware");
  app.use(metricsMiddleware);
}

/**
 * Configure optional admin token authentication
 */
function setupAdminAuth(
  app: Application,
  adminToken: string | undefined,
): void {
  if (!adminToken) {
    logger.debug("Admin token authentication disabled");
    return;
  }

  logger.debug("Configuring admin token authentication for /api/system");
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api/system")) {
      const token = req.headers["x-admin-token"];
      if (token !== adminToken) {
        logger.warn({ path: req.path }, "Access denied: Admin token required");
        return res
          .status(403)
          .json({ error: "Forbidden: Admin token required" });
      }
    }
    next();
  });
}

/**
 * Configure error tracking middleware
 */
function setupErrorTracking(app: Application): void {
  logger.debug("Configuring error tracking middleware");
  app.use(errorTrackingMiddleware);
}

/**
 * Configure central error handler
 * Must be registered last
 */
function setupErrorHandler(app: Application): void {
  logger.debug("Configuring central error handler");
  app.use(errorHandler);
}

/**
 * Setup all middleware for the application
 *
 * @param app - Express application instance
 * @param config - Middleware configuration
 */
export function setupMiddleware(
  app: Application,
  config: MiddlewareConfig,
): void {
  logger.info("Setting up middleware pipeline...");

  // Order matters: CORS, parsers, session, metrics, auth, error tracking, error handler
  setupCors(app, config.corsOrigin);
  setupBodyParsers(app, config.bodyLimit);
  setupSessionMiddleware(app);

  if (config.enableMetrics !== false) {
    setupMetrics(app);
  }

  if (config.enableAdminAuth !== false) {
    setupAdminAuth(app, config.adminToken);
  }

  if (config.enableErrorTracking !== false) {
    setupErrorTracking(app);
  }

  setupErrorHandler(app);

  logger.info("Middleware pipeline configured");
}

export default {
  setupMiddleware,
};
