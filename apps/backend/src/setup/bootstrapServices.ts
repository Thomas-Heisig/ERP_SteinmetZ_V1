// SPDX-License-Identifier: MIT
// apps/backend/src/setup/bootstrapServices.ts

/**
 * Bootstrap Services Module
 *
 * Initialization of all core services:
 * - Database setup and migrations
 * - Authentication system
 * - User settings
 * - Functions catalog
 * - Tracing and error tracking
 *
 * @module setup/bootstrapServices
 */

import { createLogger } from "../utils/logger.js";
import db from "../routes/database/dbService.js";
import { AuthService } from "../routes/auth/authService.js";
import { FunctionsCatalogService } from "../routes/functionsCatalog/functionsCatalogService.js";
import { tracingService } from "../routes/other/tracingService.js";
import { errorTrackingService } from "../routes/error/errorTrackingService.js";
import chokidar from "chokidar";
import type { Express, Application } from "express";

const logger = createLogger("bootstrap");

/**
 * Bootstrap configuration
 */
export interface BootstrapConfig {
  functionsDir: string;
  autoloadFunctions?: boolean;
  persistFunctions?: boolean;
  watchFunctions?: boolean;
  environment?: string;
}

/**
 * Initialize database and run migrations
 */
async function initializeDatabase(): Promise<void> {
  logger.info("Initializing database...");

  try {
    await db.init();
    logger.info("Database initialized");

    const { runAllMigrations } = await import("../utils/runMigrations.js");
    const migrationResult = await runAllMigrations();

    if (migrationResult.success) {
      logger.info(
        { executed: migrationResult.executed },
        "Database migrations completed successfully",
      );
    } else {
      logger.warn(
        { executed: migrationResult.executed, failed: migrationResult.failed },
        "Some database migrations failed",
      );
    }
  } catch (error) {
    logger.error({ error }, "Failed to initialize database");
    throw error;
  }
}

/**
 * Initialize authentication system
 */
async function initializeAuth(environment?: string): Promise<void> {
  logger.info("Initializing authentication system...");

  try {
    await AuthService.init();
    logger.info("Authentication system initialized");

    // Create development user in development mode
    if (environment === "development") {
      try {
        const devUser = await AuthService.login({
          username: "admin",
          password: "Admin123",
        });

        if (!devUser.success) {
          await AuthService.register({
            username: "admin",
            email: "admin@dev.local",
            password: "Admin123",
            full_name: "Development Admin",
          });
          logger.info(
            "Development user created: username=admin, password=Admin123",
          );
        } else {
          logger.info("Development user already exists");
        }
      } catch (_error) {
        try {
          await AuthService.register({
            username: "admin",
            email: "admin@dev.local",
            password: "Admin123",
            full_name: "Development Admin",
          });
          logger.info(
            "Development user created: username=admin, password=Admin123",
          );
        } catch (registerError: unknown) {
          const err =
            registerError instanceof Error
              ? registerError
              : new Error(String(registerError));
          if (!err.message?.includes("already exists")) {
            logger.warn(
              { error: err.message },
              "Failed to create development user",
            );
          }
        }
      }
    }
  } catch (error) {
    logger.error({ error }, "Failed to initialize authentication system");
    throw error;
  }
}

/**
 * Initialize user settings
 */
async function initializeUserSettings(): Promise<void> {
  logger.info("Initializing user settings system...");

  try {
    const UserSettingsService = (
      await import("../routes/other/userSettingsService.js")
    ).default;
    await UserSettingsService.init();
    logger.info("User settings system initialized");
  } catch (error) {
    logger.error({ error }, "Failed to initialize user settings system");
    throw error;
  }
}

/**
 * Initialize tracing (OpenTelemetry)
 */
async function initializeTracing(): Promise<void> {
  logger.info("Initializing tracing service...");

  try {
    await tracingService.initialize();
    if (tracingService.isEnabled()) {
      logger.info("OpenTelemetry tracing initialized");
    } else {
      logger.debug("Tracing disabled");
    }
  } catch (error) {
    logger.warn({ error }, "Failed to initialize tracing service");
  }
}

/**
 * Initialize error tracking (Sentry)
 */
async function initializeErrorTracking(
  app: Express | Application,
): Promise<void> {
  logger.info("Initializing error tracking service...");

  try {
    errorTrackingService.initialize(app);
    if (errorTrackingService.isEnabled()) {
      logger.info("Sentry error tracking initialized");
    } else {
      logger.debug("Error tracking disabled");
    }
  } catch (error) {
    logger.warn({ error }, "Failed to initialize error tracking service");
  }
}

/**
 * Initialize functions catalog
 */
async function initializeFunctionsCatalog(
  config: BootstrapConfig,
): Promise<void> {
  logger.info("Initializing Functions Catalog...");

  try {
    const service = new FunctionsCatalogService();

    if (config.autoloadFunctions !== false) {
      const result = await service.refreshFunctionsIndex();
      logger.info(
        { loadedAt: result.loadedAt, rootNodes: result.nodes.length },
        "Functions catalog initially loaded",
      );

      if (config.persistFunctions === true) {
        const summary = await db.upsertFunctionsCatalog(result);
        logger.info(
          { nodes: summary.nodes, edges: summary.edges },
          "Functions catalog persisted to database",
        );
      }
    } else {
      logger.info("FUNCTIONS_AUTOLOAD disabled - Skipping initial load");
    }

    if (config.watchFunctions === true) {
      startFunctionsWatcher(service, config.functionsDir);
    }
  } catch (error) {
    logger.error({ error }, "Failed to initialize Functions Catalog");
  }
}

/**
 * Start file watcher for functions catalog
 */
function startFunctionsWatcher(
  service: FunctionsCatalogService,
  dir: string,
): void {
  logger.info({ directory: dir }, "Functions watcher activated");
  let timer: NodeJS.Timeout | null = null;

  const reload = async () => {
    try {
      const result = await service.refreshFunctionsIndex();
      logger.info({ loadedAt: result.loadedAt }, "Functions catalog reloaded");

      if (process.env.FUNCTIONS_AUTOPERSIST === "1") {
        const summary = await db.upsertFunctionsCatalog(result);
        logger.info(
          { nodes: summary.nodes, edges: summary.edges },
          "Functions catalog persisted to database",
        );
      }
    } catch (error) {
      logger.error({ error }, "Functions catalog reload failed");
    }
  };

  chokidar
    .watch(dir, {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
      ignored: /(^|[/\\])\../,
    })
    .on("all", (_event, _file) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(reload, 300);
    });
}

/**
 * Bootstrap all services
 *
 * @param app - Express application instance
 * @param config - Bootstrap configuration
 */
export async function bootstrapServices(
  app: Express | Application,
  config: BootstrapConfig,
): Promise<void> {
  logger.info("========== Service Bootstrap Start ==========");

  try {
    // Initialize monitoring
    await initializeTracing();
    await initializeErrorTracking(app);

    // Initialize core services
    await initializeDatabase();
    await initializeAuth(config.environment);
    await initializeUserSettings();

    // Initialize functions catalog
    await initializeFunctionsCatalog(config);

    logger.info("========== Service Bootstrap Complete ==========");
  } catch (error) {
    logger.error({ error }, "Service bootstrap failed");
    throw error;
  }
}

export default {
  bootstrapServices,
};
