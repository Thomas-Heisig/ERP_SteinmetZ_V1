// SPDX-License-Identifier: MIT
// apps/backend/src/types/external.d.ts

/**
 * Zusätzliche Typdefinitionen für Pakete ohne offizielle @types
 * sowie Erweiterungen globaler Variablen und ProcessEnv.
 */

// --------------------------------------------------------
// Module ohne Typdefinitionen
// --------------------------------------------------------
declare module "node-llama-cpp";

// --------------------------------------------------------
// Globale Variablen (z. B. app, db, logger)
// --------------------------------------------------------
declare global {
   
  var app: import("express").Express | undefined;
   
  var db: any | undefined;
   
  var logger: Console | undefined;
}

// --------------------------------------------------------
// Erweiterung von NodeJS.ProcessEnv
// --------------------------------------------------------
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: "development" | "production" | "test";
    PORT?: string;
    CORS_ORIGIN?: string;
    DB_DRIVER?: "sqlite" | "postgres";
    DATABASE_URL?: string;

    FUNCTIONS_DIR?: string;
    FUNCTIONS_AUTOLOAD?: "0" | "1";
    FUNCTIONS_AUTOPERSIST?: "0" | "1";
    FUNCTIONS_WATCH?: "0" | "1";

    AI_PROVIDER?: string;
    OPENAI_MODEL?: string;
    OPENAI_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    GEMINI_API_KEY?: string;

    JWT_SECRET?: string;
    FALLBACK_WIKI?: string;
    LOG_LEVEL?: "info" | "warn" | "error" | "debug";
    ENABLE_SHELL?: "0" | "1";
  }
}

// ⬇️ Wichtig: Damit TS die Datei als *Modul* erkennt!
export {};
