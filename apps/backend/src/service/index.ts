// SPDX-License-Identifier: MIT
// apps/backend/src/service/index.ts

/**
 * Service Layer - Business-Logik Module
 *
 * Zentrale Export-Stelle für alle Service-Klassen und Utilities.
 *
 * @module service
 *
 * @example
 * ```typescript
 * import { DatabaseService } from './service/index.js';
 *
 * const db = new DatabaseService();
 * await db.init();
 * ```
 */

export { DatabaseService } from "./DatabaseService.js";

// Weitere Services können hier hinzugefügt werden
// export { UserService } from './UserService.js';
// export { AuthService } from './AuthService.js';
// etc.
