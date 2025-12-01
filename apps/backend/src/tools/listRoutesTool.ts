// SPDX-License-Identifier: MIT
import { GlobalApp } from "../utils/globalApp.js";
import type { Application } from "express";

export interface RouteInfo {
  path: string;
  methods: string[];
}

export const listRoutesTool = {
  name: "listRoutes",
  description: "Liest alle registrierten Express-Routen aus.",
  parameters: {},

  async run(): Promise<{
    success: boolean;
    count: number;
    routes: RouteInfo[];
  }> {
    const app: Application | undefined = GlobalApp.get();

    if (!app || !(app as any)._router?.stack) {
      return {
        success: false,
        count: 0,
        routes: [],
      };
    }

    const routes: RouteInfo[] = [];
    const seen = new Set<string>();

    /** Rekursive Analyse des Express-Router-Stacks */
    const extract = (stack: any[], base: string = ""): void => {
      for (const layer of stack) {
        // 1. Direkte Route
        if (layer?.route?.path) {
          const path = (base + layer.route.path).replace(/\/+/g, "/");
          const methods = Object.keys(layer.route.methods || {}).map((m) =>
            m.toUpperCase(),
          );

          const key = `${methods.join(",")}:${path}`;
          if (!seen.has(key)) {
            seen.add(key);
            routes.push({ path, methods });
          }
          continue;
        }

        // 2. Subrouter
        const sub = layer?.handle?.stack;
        if (Array.isArray(sub)) {
          let pattern = layer.regexp?.source ?? "";

          pattern = pattern
            .replace(/\\\//g, "/") // \/ → /
            .replace(/^\^/, "") // ^ entfernen
            .replace(/\$$/, ""); // $ entfernen

          const prefix = pattern.startsWith("/") ? pattern : "/" + pattern;

          extract(sub, (base + prefix).replace(/\/+/g, "/"));
        }
      }
    };

    extract((app as any)._router.stack);

    return {
      success: true,
      count: routes.length,
      routes,
    };
  },
};
