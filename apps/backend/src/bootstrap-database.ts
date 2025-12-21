// SPDX-License-Identifier: MIT

/**
 * Application Startup - Database Integration Guide
 *
 * Shows how to properly initialize DatabaseManager in your application.
 * Place this in your main index.ts or bootstrap file.
 *
 * @module bootstrap-database
 */

import { DatabaseManager } from "./routes/database/index.js";
import { createLogger } from "./utils/logger.js";

const logger = createLogger("app-bootstrap");

/**
 * Initialize database on application startup
 *
 * Call this early in your application's startup sequence,
 * before starting the HTTP server.
 *
 * @example
 * ```typescript
 * import { initializeDatabase } from './bootstrap-database.js';
 *
 * async function startApplication() {
 *   // Initialize database first
 *   await initializeDatabase();
 *
 *   // Then start HTTP server
 *   app.listen(PORT, () => {
 *     logger.info(`Server running on port ${PORT}`);
 *   });
 * }
 *
 * startApplication().catch(error => {
 *   logger.error({ error }, 'Application startup failed');
 *   process.exit(1);
 * });
 * ```
 */
export async function initializeDatabase(): Promise<void> {
  try {
    logger.info("Initializing database...");

    // Initialize DatabaseManager (singleton)
    await DatabaseManager.initialize();

    logger.info("Database initialized successfully");
  } catch (error) {
    logger.error({ error }, "Database initialization failed");
    throw error;
  }
}

/**
 * Register database initialization hooks
 *
 * Use this to run setup operations after the database is initialized.
 *
 * @example
 * ```typescript
 * registerDatabaseHooks();
 *
 * async function registerDatabaseHooks() {
 *   const dbManager = DatabaseManager;
 *
 *   // Seed default data
 *   dbManager.registerHook(async () => {
 *     logger.info('Seeding default roles...');
 *     await seedDefaultRoles();
 *   });
 *
 *   // Run migrations
 *   dbManager.registerHook(async () => {
 *     logger.info('Running migrations...');
 *     await runMigrations();
 *   });
 *
 *   // Create indexes
 *   dbManager.registerHook(async () => {
 *     logger.info('Creating database indexes...');
 *     await createOptimizationIndexes();
 *   });
 * }
 * ```
 */
export function registerDatabaseHooks(): void {
  const dbManager = DatabaseManager;

  // Example hook: Log database health
  dbManager.registerHook(async () => {
    logger.debug("Database initialization hook completed");
  });
}

/**
 * Usage in index.ts
 */

/*
 * Example Application Startup:
 *
 * import express from 'express';
 * import { initializeDatabase, registerDatabaseHooks } from './bootstrap-database.js';
 * import { createLogger } from './utils/logger.js';
 *
 * const app = express();
 * const logger = createLogger('app');
 * const PORT = process.env.PORT || 3000;
 *
 * async function startApplication() {
 *   try {
 *     // Register hooks BEFORE initialization
 *     registerDatabaseHooks();
 *
 *     // Initialize database
 *     await initializeDatabase();
 *
 *     // Setup Express middleware
 *     app.use(express.json());
 *     app.use(express.urlencoded({ extended: true }));
 *
 *     // Register routes
 *     app.use('/api/users', usersRouter);
 *     app.use('/api/documents', documentsRouter);
 *     // ... more routes
 *
 *     // Start server
 *     const server = app.listen(PORT, () => {
 *       logger.info(`Server listening on port ${PORT}`);
 *     });
 *
 *     // Graceful shutdown
 *     process.on('SIGTERM', async () => {
 *       logger.info('SIGTERM received, shutting down gracefully');
 *       server.close(() => {
 *         logger.info('Server closed');
 *         process.exit(0);
 *       });
 *     });
 *
 *   } catch (error) {
 *     logger.error({ error }, 'Application startup failed');
 *     process.exit(1);
 *   }
 * }
 *
 * // Start the application
 * startApplication();
 */

// ============================================================================
// ALTERNATIVE: Using Async/Await in index.ts
// ============================================================================

/*
 * // index.ts
 * import express from 'express';
 * import { initializeDatabase } from './bootstrap-database.js';
 *
 * const app = express();
 *
 * // Use top-level await (Node 14.8+)
 * await initializeDatabase();
 *
 * app.listen(3000, () => {
 *   console.log('Server started');
 * });
 */

// ============================================================================
// ALTERNATIVE: Using IIFE Pattern
// ============================================================================

/*
 * // index.ts
 * import express from 'express';
 * import { initializeDatabase } from './bootstrap-database.js';
 *
 * const app = express();
 *
 * (async () => {
 *   await initializeDatabase();
 *   app.listen(3000);
 * })();
 */

// ============================================================================
// Environment Setup
// ============================================================================

/*
 * Environment variables for database:
 *
 * DATABASE_DRIVER=sqlite        // or 'postgres'
 * DATABASE_PATH=data/dev.sqlite3
 * DATABASE_URL=postgresql://...
 *
 * For development:
 *   - Uses SQLite by default
 *   - Automatic migrations
 *   - In-memory sessions
 *
 * For production:
 *   - Use PostgreSQL
 *   - Connection pooling
 *   - Persistent sessions
 */

// ============================================================================
// Complete Example with All Features
// ============================================================================

/*
 * // index.ts - Complete Application Startup
 * import express from 'express';
 * import { initializeDatabase, registerDatabaseHooks } from './bootstrap-database.js';
 * import { DatabaseManager } from './routes/database/index.js';
 * import { createLogger } from './utils/logger.js';
 *
 * const app = express();
 * const logger = createLogger('app');
 *
 * async function bootstrap() {
 *   // 1. Register hooks before initialization
 *   registerDatabaseHooks();
 *
 *   // 2. Initialize database
 *   await initializeDatabase();
 *
 *   // 3. Setup middleware
 *   app.use(express.json());
 *   app.use(express.urlencoded({ extended: true }));
 *
 *   // 4. Health check endpoint
 *   app.get('/health', async (req, res) => {
 *     const isInit = DatabaseManager.isInitialized();
 *     res.json({
 *       status: isInit ? 'healthy' : 'unhealthy',
 *       database: isInit ? 'initialized' : 'not initialized',
 *       timestamp: new Date().toISOString(),
 *     });
 *   });
 *
 *   // 5. Register routers
 *   import('./routes/users/usersRouter.js').then(m => {
 *     app.use('/api/users', m.default);
 *   });
 *
 *   // 6. Error handler
 *   app.use((err, req, res, next) => {
 *     logger.error({ err }, 'Unhandled error');
 *     res.status(500).json({ error: 'Internal server error' });
 *   });
 *
 *   // 7. Start server
 *   const PORT = process.env.PORT || 3000;
 *   const server = app.listen(PORT, () => {
 *     logger.info(`Server listening on port ${PORT}`);
 *   });
 *
 *   // 8. Graceful shutdown
 *   const shutdown = async () => {
 *     logger.info('Shutting down gracefully...');
 *     server.close(() => {
 *       logger.info('Server closed');
 *       process.exit(0);
 *     });
 *   };
 *
 *   process.on('SIGTERM', shutdown);
 *   process.on('SIGINT', shutdown);
 * }
 *
 * bootstrap().catch(error => {
 *   logger.error({ error }, 'Bootstrap failed');
 *   process.exit(1);
 * });
 */
