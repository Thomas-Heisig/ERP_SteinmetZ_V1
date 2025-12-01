// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/features/code/useMonacoThemeSync.ts

import { useEffect } from "react";

/**
 * Interne App-Themes, die auf Monaco-Themes gemappt werden.
 */
export type InternalTheme = "light" | "dark" | "lcars";

/**
 * Zulässige Monaco-Themes laut Typdefinition.
 */
export type MonacoBuiltinTheme = "vs" | "vs-dark" | "hc-black";

/**
 * Mapped interne Themes auf Monaco-Builtin-Themes.
 */
function mapToMonacoTheme(theme: InternalTheme): MonacoBuiltinTheme {
  switch (theme) {
    case "light":
      return "vs";
    case "dark":
      return "vs-dark";
    case "lcars":
      // LCARS hat kein Monaco-Pendant → sinnvolles fallback
      return "vs-dark";
    default:
      return "vs-dark";
  }
}

/**
 * Synchronisiert das interne Theme mit dem Monaco Editor.
 * - monaco kann null sein → Hook bleibt passiv
 * - Fehlerbehandlung optional, keine Nebenwirkungen
 */
export function useMonacoThemeSync(
  monaco: typeof import("monaco-editor") | null,
  internalTheme: InternalTheme,
) {
  useEffect(() => {
    if (!monaco || !monaco.editor) return;

    try {
      const theme = mapToMonacoTheme(internalTheme);
      monaco.editor.setTheme(theme);
    } catch (err) {
      console.error(
        "[useMonacoThemeSync] Fehler beim Setzen des Monaco-Themes:",
        err,
      );
    }
  }, [monaco, internalTheme]);
}
