// SPDX-License-Identifier: MIT
// apps/frontend/vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    strictPort: true,

    // 🧩 Proxy für Backend-API
    proxy: {
      // Leitet alles unter /api an dein Backend (Port 3000) weiter
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  resolve: {
    dedupe: ["react", "react-dom"],
    preserveSymlinks: true,
  },

  optimizeDeps: {
    exclude: [],
  },

  build: {
    // Enable code splitting and chunk optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "i18n-vendor": ["i18next", "react-i18next"],
          "monaco-vendor": ["monaco-editor"],
        },
      },
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging
    sourcemap: true,
    // Use default esbuild minification (faster and no extra dependencies needed)
    minify: "esbuild",
  },
});
