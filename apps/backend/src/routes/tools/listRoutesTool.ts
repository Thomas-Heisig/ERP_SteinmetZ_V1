// SPDX-License-Identifier: MIT
import { GlobalApp } from "../../utils/globalApp.js";
import type { Application } from "express";

export interface RouteInfo {
  path: string;
  methods: string[];
}

type RouterLayer = {
  route?: {
    path?: string;
    methods?: Record<string, unknown>;
  };
  handle?: { stack?: RouterLayer[] };
  regexp?: RegExp;
};

export const listRoutesTool = {
  name: "listRoutes",
  description: "Liest alle registrierten Express-Routen aus.",
  parameters: {},

  async run(): Promise<{
    success: boolean;
    count: number;
    routes: RouteInfo[];
  }> {
    const app: Application = GlobalApp.get();

    const routerStack = (app._router as { stack?: RouterLayer[] } | undefined)?.stack as RouterLayer[] | undefined;

    if (!app || !routerStack) {
      return {
        success: false,
        count: 0,
        routes: [],
      };
    }

    const routes: RouteInfo[] = [];
    const seen = new Set<string>();

    /** Rekursive Analyse des Express-Router-Stacks */
    const extract = (stack: RouterLayer[], base: string = ""): void => {
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

    extract(routerStack);

    return {
      success: true,
      count: routes.length,
      routes,
    };
  },
};
