// SPDX-License-Identifier: MIT
// vitest.config.ts - Root configuration for workspace

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/*.config.*",
      "**/.*/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.config.*",
        "**/types/**",
        "**/*.d.ts",
      ],
    },
  },
});
