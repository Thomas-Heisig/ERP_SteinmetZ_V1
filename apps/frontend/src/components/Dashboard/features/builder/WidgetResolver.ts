// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/builder/WidgetResolver.ts

/**
 * WidgetResolver – ordnet Widget-Typen konkreten React-Komponenten zu.
 * Der Resolver enthält keine UI-Logik selbst, sondern stellt eine
 * Zuordnungstabelle bereit, die vom NodeBuilder oder der Render-Engine
 * genutzt wird.
 */

import type { WidgetRegistry, WidgetProps } from "../../types";
import React from "react";

/**
 * Struktur des Resolver-Containers.
 */
export interface WidgetResolverOptions {
  registry: WidgetRegistry;
}

/**
 * WidgetResolver – einfache, aber erweiterbare Resolver-Instanz.
 */
export class WidgetResolver {
  private registry: WidgetRegistry;

  constructor(options: WidgetResolverOptions) {
    this.registry = options.registry;
  }

  /**
   * Prüft, ob ein Widget registriert ist.
   */
  has(type: string): boolean {
    return Boolean(this.registry[type]);
  }

  /**
   * Liefert die React-Komponente eines Widgets oder null.
   */
  resolve(type: string): React.ComponentType<WidgetProps> | null {
    return this.registry[type] ?? null;
  }

  /**
   * Registriert ein Widget dynamisch zur Laufzeit.
   */
  register(type: string, component: React.ComponentType<WidgetProps>): void {
    this.registry[type] = component;
  }

  /**
   * Entfernt ein Widget aus der Registry.
   */
  unregister(type: string): void {
    delete this.registry[type];
  }

  /**
   * Liefert alle registrierten Widgets.
   */
  list(): string[] {
    return Object.keys(this.registry);
  }
}

export default WidgetResolver;