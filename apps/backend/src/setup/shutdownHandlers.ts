// SPDX-License-Identifier: MIT
// apps/backend/src/setup/shutdownHandlers.ts

/**
 * Graceful Shutdown Handlers Module
 *
 * Manages application shutdown with proper resource cleanup:
 * - WebSocket connections
 * - HTTP server
 * - Redis connections
 * - Database connections
 * - Tracing/error tracking services
 *
 * @module setup/shutdownHandlers
 */

import { Server } from "http";
import { createLogger } from "../utils/logger.js";
import { websocketService } from "../routes/other/websocketService.js";
import { tracingService } from "../routes/other/tracingService.js";
import { errorTrackingService } from "../routes/error/errorTrackingService.js";
import { shutdownManager } from "../routes/other/shutdownManager.js";
import { redisService } from "../routes/other/redisService.js";
import db from "../routes/database/dbService.js";

const logger = createLogger("shutdown");

/**
 * Register graceful shutdown handler for WebSocket connections
 */
function registerWebSocketShutdown(): void {
  shutdownManager.registerComponent(
    "websocket",
    async () => {
      logger.info("Closing WebSocket connections");
      if (websocketService && typeof websocketService.shutdown === "function") {
        await websocketService.shutdown();
      }
    },
    { timeout: 5000, critical: false },
  );
}

/**
 * Register graceful shutdown handler for HTTP server
 */
function registerHttpServerShutdown(server: Server): void {
  shutdownManager.registerComponent(
    "http-server",
    async () => {
      return new Promise<void>((resolve, reject) => {
        logger.info("Closing HTTP server");
        server.close((err: Error | undefined) => {
          if (err) {
            logger.error({ err }, "Error closing HTTP server");
            reject(err);
          } else {
            logger.info("HTTP server closed successfully");
            resolve();
          }
        });
      });
    },
    { timeout: 10000, critical: true },
  );
}

/**
 * Register graceful shutdown handler for Redis
 */
function registerRedisShutdown(): void {
  shutdownManager.registerComponent(
    "redis",
    async () => {
      logger.info("Closing Redis connection");
      await redisService.disconnect();
      logger.info("Redis connection closed");
    },
    { timeout: 5000, critical: false },
  );
}

/**
 * Register graceful shutdown handler for database
 */
function registerDatabaseShutdown(): void {
  shutdownManager.registerComponent(
    "database",
    async () => {
      logger.info("Closing database connections");
      await db.close();
      logger.info("Database connections closed");
    },
    { timeout: 10000, critical: true },
  );
}

/**
 * Register graceful shutdown handler for tracing service
 */
function registerTracingShutdown(): void {
  shutdownManager.registerComponent(
    "tracing",
    async () => {
      logger.info("Shutting down tracing service");
      await tracingService.shutdown();
      logger.info("Tracing service shut down");
    },
    { timeout: 5000, critical: false },
  );
}

/**
 * Register graceful shutdown handler for error tracking
 */
function registerErrorTrackingShutdown(): void {
  shutdownManager.registerComponent(
    "error-tracking",
    async () => {
      logger.info("Shutting down error tracking");
      await errorTrackingService.close();
      logger.info("Error tracking shut down");
    },
    { timeout: 5000, critical: false },
  );
}

/**
 * Register health status shutdown handler
 */
function registerHealthStatusShutdown(): void {
  shutdownManager.registerComponent(
    "health-status",
    async () => {
      logger.info("Setting health status to shutting down");
      // Health endpoint will check shutdownManager.isShuttingDown()
    },
    { timeout: 1000, critical: false },
  );
}

/**
 * Register all graceful shutdown handlers
 *
 * @param server - HTTP server instance
 */
export function registerAllShutdownHandlers(server: Server): void {
  logger.info("Registering graceful shutdown handlers...");

  shutdownManager.initialize();
  logger.info("Graceful shutdown manager initialized");

  // Register all handlers
  registerHealthStatusShutdown();
  registerWebSocketShutdown();
  registerHttpServerShutdown(server);
  registerRedisShutdown();
  registerDatabaseShutdown();
  registerTracingShutdown();
  registerErrorTrackingShutdown();

  logger.info("All shutdown handlers registered");

  // Log shutdown handler summary
  setTimeout(() => {
    logger.info(
      "Shutdown handlers ready - application will perform graceful shutdown on SIGTERM/SIGINT",
    );
  }, 100);
}

export default {
  registerAllShutdownHandlers,
};
