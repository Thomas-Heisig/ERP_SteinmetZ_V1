// SPDX-License-Identifier: MIT
// vitest.config.ts - Root configuration for workspace
// Note: This config is not used when running tests via npm scripts.
// Each workspace (backend/frontend) has its own vitest.config.ts with appropriate environment settings.
// Use "npm test" to run all tests, or "npm run test:backend"/"npm run test:frontend" for specific workspaces.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // This root config is intentionally minimal
    // Backend uses environment: node (apps/backend/vitest.config.ts)
    // Frontend uses environment: jsdom (apps/frontend/vitest.config.ts)
    exclude: ["**/node_modules/**", "**/dist/**", "**/*.config.*", "**/.*/**"],
  },
});
