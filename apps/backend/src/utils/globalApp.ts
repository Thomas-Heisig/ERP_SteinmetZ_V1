// apps/backend/src/utils/globalApp.ts
import type { Application } from 'express';

/**
 * Setzt oder holt die globale Express-App-Instanz.
 * Wird genutzt, um auch aus Services oder Routern Zugriff zu haben.
 */
export class GlobalApp {
  private static _app: Application | null = null;

  static set(app: Application) {
    GlobalApp._app = app;
    (globalThis as any).expressApp = app; // für Alt-Kompatibilität
  }

  static get(): Application {
    const app = GlobalApp._app ?? (globalThis as any).expressApp;
    if (!app) throw new Error('GlobalApp: Express-Instanz nicht gesetzt');
    return app;
  }
}
