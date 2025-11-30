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
});
