// SPDX-License-Identifier: MIT
// apps/backend/src/types/connect-sqlite3.d.ts

/**
 * Type definitions for connect-sqlite3
 * SQLite session store for Express session middleware
 */

declare module "connect-sqlite3" {
  import session from "express-session";

  /**
   * SQLite session store options
   */
  interface SQLiteStoreOptions {
    /** Database file name */
    db?: string;
    /** Directory path for database file */
    dir?: string;
    /** Table name for sessions */
    table?: string;
    /** Time to live in milliseconds */
    ttl?: number;
    /** Session ID prefix */
    prefix?: string;
    /** Connection string for SQLite */
    concurrentDB?: boolean;
  }

  /**
   * SQLite session store class
   */
  class SQLiteStore extends session.Store {
    constructor(options?: SQLiteStoreOptions);
  }

  /**
   * Factory function to create SQLite store
   * @param session - Express session module
   * @returns SQLite store constructor
   */
  function connectSqlite3(
    session: typeof import("express-session")
  ): typeof SQLiteStore;

  export = connectSqlite3;
}
