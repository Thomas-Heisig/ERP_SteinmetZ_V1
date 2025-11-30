// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/features/code/MonacoCode.tsx

import React, { useEffect, useRef, useState } from "react";

/** Zulässige Monaco-Sprachen */
type MonacoLanguage =
  | "json"
  | "typescript"
  | "javascript"
  | "yaml"
  | "plaintext";

/** App-interne Themes */
type InternalTheme = "dark" | "light";

/** Mapping App → Monaco Themes */
function resolveMonacoTheme(theme: InternalTheme): "vs" | "vs-dark" {
  return theme === "light" ? "vs" : "vs-dark";
}

export interface MonacoCodeProps {
  value: string;
  language?: MonacoLanguage;
  height?: string | number;
  theme?: InternalTheme;
}

/**
 * Monaco Editor (readonly)
 * Lazy-loaded, Strict-Mode-kompatibel, ohne race conditions.
 */
export default function MonacoCode({
  value,
  language = "json",
  height = 360,
  theme = "dark",
}: MonacoCodeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<
    import("monaco-editor").editor.IStandaloneCodeEditor | null
  >(null);

  const monacoRef = useRef<typeof import("monaco-editor") | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  /* --------------------------------------------------------------
     Monaco lazy load + initial editor creation
  -------------------------------------------------------------- */
  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const monaco = await import("monaco-editor");
        if (!active || !containerRef.current) return;

        monacoRef.current = monaco;

        editorRef.current = monaco.editor.create(containerRef.current, {
          value,
          language,
          readOnly: true,
          theme: resolveMonacoTheme(theme),
          fontSize: 13,
          automaticLayout: true,
          minimap: { enabled: false },
          wordWrap: "on",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
        });

        setLoaded(true);
      } catch (err) {
        console.error("[MonacoCode] Fehler beim Laden:", err);
        if (active) setError(true);
      }
    }

    init();

    return () => {
      active = false;
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);

  /* --------------------------------------------------------------
     Code aktualisieren
  -------------------------------------------------------------- */
  useEffect(() => {
    editorRef.current?.setValue(value);
  }, [value]);

  /* --------------------------------------------------------------
     Theme synchronisieren
  -------------------------------------------------------------- */
  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;

    try {
      monaco.editor.setTheme(resolveMonacoTheme(theme));
    } catch (err) {
      console.warn("[MonacoCode] Theme-Wechsel fehlgeschlagen:", err);
    }
  }, [theme]);

  /* --------------------------------------------------------------
     Fallback: kein Monaco verfügbar
  -------------------------------------------------------------- */
  if (error) {
    return (
      <pre
        style={{
          background: "#1e1e1e",
          color: "#fff",
          padding: 12,
          borderRadius: 8,
          fontSize: 13,
          overflow: "auto",
          height,
          whiteSpace: "pre-wrap",
        }}
      >
        {value}
      </pre>
    );
  }

  /* --------------------------------------------------------------
     Rendering
  -------------------------------------------------------------- */
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        position: "relative",
      }}
    >
      {!loaded && (
        <div
          style={{
            padding: 12,
            textAlign: "center",
            color: "#6b7280",
            fontSize: 13,
          }}
        >
          Lade Code-Viewer…
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          height,
          width: "100%",
          display: loaded ? "block" : "none",
        }}
      />
    </div>
  );
}
