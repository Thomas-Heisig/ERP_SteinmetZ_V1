// SPDX-License-Identifier: MIT
// apps/backend/src/services/shutdownManager.ts

/**
 * Graceful Shutdown Manager
 *
 * Coordinates graceful shutdown of all application components.
 * Ensures proper cleanup of resources including:
 * - HTTP server (stop accepting new connections, finish pending requests)
 * - WebSocket connections (notify clients, close connections)
 * - Database connections (close connection pools)
 * - Redis connections (close client)
 * - Background jobs (wait for completion)
 * - Monitoring services (flush metrics, close tracers)
 *
 * Implements best practices for container orchestration (Docker, Kubernetes)
 * and process managers (systemd, PM2).
 *
 * @example
 * ```typescript
 * import { shutdownManager } from './services/shutdownManager.js';
 *
 * // Register shutdown handlers at startup
 * shutdownManager.initialize();
 *
 * // Register components for graceful shutdown
 * shutdownManager.registerComponent('server', async () => {
 *   await server.close();
 * });
 *
 * // Trigger shutdown programmatically
 * await shutdownManager.shutdown('manual');
 * ```
 */

import { createLogger } from "../utils/logger.js";

const logger = createLogger("shutdown");

/**
 * Shutdown reason types
 */
type ShutdownReason =
  | "SIGTERM" // Graceful termination signal (default in Kubernetes)
  | "SIGINT" // Interrupt signal (Ctrl+C)
  | "SIGUSR2" // User-defined signal (used by nodemon)
  | "uncaughtException" // Unhandled exception
  | "unhandledRejection" // Unhandled promise rejection
  | "manual"; // Programmatic shutdown

/**
 * Component shutdown handler
 */
type ShutdownHandler = () => Promise<void> | void;

/**
 * Shutdown component registration
 */
interface ShutdownComponent {
  name: string;
  handler: ShutdownHandler;
  timeout?: number; // Max time to wait for shutdown (ms)
  critical?: boolean; // If true, failure blocks shutdown
}

/**
 * Shutdown state
 */
type ShutdownState = "idle" | "shutting_down" | "shutdown_complete";

class ShutdownManager {
  private state: ShutdownState = "idle";
  private components: ShutdownComponent[] = [];
  private isInitialized = false;
  private shutdownTimeout = 30000; // 30 seconds total shutdown timeout
  private gracePeriod = 5000; // 5 seconds grace period for new requests

  /**
   * Initialize shutdown handlers
   *
   * Registers signal handlers for SIGTERM, SIGINT, and uncaught errors.
   * Should be called once during application startup.
   */
  initialize(): void {
    if (this.isInitialized) {
      logger.warn("Shutdown manager already initialized");
      return;
    }

    logger.info("Initializing graceful shutdown manager");

    // Handle termination signals
    process.on("SIGTERM", () => {
      logger.info("Received SIGTERM signal");
      void this.shutdown("SIGTERM");
    });

    process.on("SIGINT", () => {
      logger.info("Received SIGINT signal");
      void this.shutdown("SIGINT");
    });

    // Handle nodemon restarts
    process.on("SIGUSR2", () => {
      logger.info("Received SIGUSR2 signal (nodemon restart)");
      void this.shutdown("SIGUSR2");
    });

    // Handle uncaught errors (last resort)
    process.on("uncaughtException", (error) => {
      logger.error({ err: error }, "Uncaught exception - initiating shutdown");
      void this.shutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error(
        { reason, promise },
        "Unhandled rejection - initiating shutdown",
      );
      void this.shutdown("unhandledRejection");
    });

    this.isInitialized = true;
    logger.info("Graceful shutdown manager initialized");
  }

  /**
   * Register a component for graceful shutdown
   *
   * Components are shut down in reverse registration order (LIFO).
   * This ensures dependencies are closed before their dependents.
   *
   * @param name - Component name for logging
   * @param handler - Async function to perform cleanup
   * @param options - Component options (timeout, critical)
   *
   * @example
   * ```typescript
   * shutdownManager.registerComponent('database', async () => {
   *   await db.close();
   * }, { timeout: 5000, critical: true });
   * ```
   */
  registerComponent(
    name: string,
    handler: ShutdownHandler,
    options?: { timeout?: number; critical?: boolean },
  ): void {
    logger.debug({ name }, "Registering shutdown component");

    this.components.push({
      name,
      handler,
      timeout: options?.timeout,
      critical: options?.critical ?? false,
    });
  }

  /**
   * Execute graceful shutdown
   *
   * Shuts down all registered components in reverse order.
   * Implements timeout handling and error recovery.
   *
   * @param reason - Reason for shutdown
   */
  async shutdown(reason: ShutdownReason): Promise<void> {
    if (this.state === "shutting_down") {
      logger.warn("Shutdown already in progress");
      return;
    }

    if (this.state === "shutdown_complete") {
      logger.warn("Shutdown already completed");
      return;
    }

    this.state = "shutting_down";
    const startTime = Date.now();

    logger.info({ reason }, "========================================");
    logger.info({ reason }, "🛑 Initiating graceful shutdown");
    logger.info({ reason }, "========================================");

    // Set overall shutdown timeout
    const shutdownTimeoutHandle = setTimeout(() => {
      logger.error(
        { timeout: this.shutdownTimeout },
        "Shutdown timeout exceeded - forcing exit",
      );
      process.exit(1);
    }, this.shutdownTimeout);

    try {
      // Stop accepting new requests (grace period)
      logger.info(
        { gracePeriod: this.gracePeriod },
        "Grace period: waiting for pending requests",
      );
      await this.sleep(this.gracePeriod);

      // Shut down components in reverse order (LIFO)
      const componentsToShutdown = [...this.components].reverse();

      for (const component of componentsToShutdown) {
        await this.shutdownComponent(component);
      }

      const duration = Date.now() - startTime;
      logger.info(
        { duration, reason },
        "========================================",
      );
      logger.info({ duration, reason }, "✅ Graceful shutdown completed");
      logger.info(
        { duration, reason },
        "========================================",
      );

      this.state = "shutdown_complete";
      clearTimeout(shutdownTimeoutHandle);

      // Exit process
      process.exit(0);
    } catch (error) {
      logger.error({ err: error }, "Error during shutdown");
      clearTimeout(shutdownTimeoutHandle);
      process.exit(1);
    }
  }

  /**
   * Shutdown a single component with timeout handling
   */
  private async shutdownComponent(component: ShutdownComponent): Promise<void> {
    const { name, handler, timeout, critical } = component;
    const componentTimeout = timeout ?? 5000; // Default 5 seconds per component

    logger.info({ name, timeout: componentTimeout }, `Shutting down: ${name}`);

    try {
      // Execute handler with timeout
      await this.withTimeout(handler(), componentTimeout, name);
      logger.info({ name }, `✅ ${name} shut down successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (critical) {
        logger.error(
          { name, error: errorMessage },
          `❌ Critical component ${name} failed to shut down`,
        );
        throw error;
      } else {
        logger.warn(
          { name, error: errorMessage },
          `⚠️  ${name} failed to shut down (non-critical)`,
        );
      }
    }
  }

  /**
   * Execute a promise with timeout
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    name: string,
  ): Promise<T> {
    let timeoutHandle: NodeJS.Timeout;

    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutHandle = setTimeout(
        () => reject(new Error(`Timeout: ${name} exceeded ${timeoutMs}ms`)),
        timeoutMs,
      );
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutHandle!);
      return result;
    } catch (error) {
      clearTimeout(timeoutHandle!);
      throw error;
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current shutdown state
   */
  getState(): ShutdownState {
    return this.state;
  }

  /**
   * Check if shutdown is in progress
   */
  isShuttingDown(): boolean {
    return this.state === "shutting_down";
  }

  /**
   * Set shutdown timeout (default: 30 seconds)
   */
  setShutdownTimeout(timeoutMs: number): void {
    this.shutdownTimeout = timeoutMs;
  }

  /**
   * Set grace period for pending requests (default: 5 seconds)
   */
  setGracePeriod(periodMs: number): void {
    this.gracePeriod = periodMs;
  }
}

// Singleton instance
export const shutdownManager = new ShutdownManager();
