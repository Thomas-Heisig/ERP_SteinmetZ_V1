// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/features/code/MonacoCode.tsx

import React, { useEffect, useRef, useState } from "react";

/** Zulässige Monaco-Sprachen */
export type MonacoLanguage =
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
  readOnly?: boolean;
  onChange?: (value: string) => void;
  minimap?: boolean;
  lineNumbers?: boolean;
  wordWrap?: boolean;
  formatOnPaste?: boolean;
  formatOnType?: boolean;
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
  readOnly = true,
  onChange,
  minimap = false,
  lineNumbers = true,
  wordWrap = true,
  formatOnPaste = true,
  formatOnType = false,
}: MonacoCodeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fallbackRef = useRef<HTMLPreElement | null>(null);
  const editorRef = useRef<
    import("monaco-editor").editor.IStandaloneCodeEditor | null
  >(null);

  const monacoRef = useRef<typeof import("monaco-editor") | null>(null);
  const onChangeRef = useRef(onChange);

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Keep onChange ref up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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
          readOnly,
          theme: resolveMonacoTheme(theme),
          fontSize: 13,
          automaticLayout: true,
          minimap: { enabled: minimap },
          wordWrap: wordWrap ? "on" : "off",
          lineNumbers: lineNumbers ? "on" : "off",
          scrollBeyondLastLine: false,
          formatOnPaste,
          formatOnType,
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true,
          folding: true,
          bracketPairColorization: { enabled: true },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
        });

        // onChange Handler für Bearbeitungen
        if (!readOnly) {
          editorRef.current.onDidChangeModelContent(() => {
            const currentValue = editorRef.current?.getValue() ?? "";
            onChangeRef.current?.(currentValue);
          });
        }

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
  }, [
    value,
    language,
    theme,
    readOnly,
    minimap,
    lineNumbers,
    wordWrap,
    formatOnPaste,
    formatOnType,
  ]);

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
     ReadOnly Modus aktualisieren
  -------------------------------------------------------------- */
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly });
    }
  }, [readOnly]);

  /* --------------------------------------------------------------
     Dynamische Höhe für Fallback und Container
  -------------------------------------------------------------- */
  useEffect(() => {
    const heightValue =
      typeof height === "number" ? `${height}px` : String(height);

    if (fallbackRef.current) {
      fallbackRef.current.style.setProperty(
        "--monaco-fallback-height",
        heightValue,
      );
    }

    if (containerRef.current) {
      containerRef.current.style.setProperty("--monaco-height", heightValue);
    }
  }, [height]);

  /* --------------------------------------------------------------
     Fallback: kein Monaco verfügbar
  -------------------------------------------------------------- */
  if (error) {
    return (
      <pre ref={fallbackRef} className="monaco-code-fallback">
        {value}
      </pre>
    );
  }

  /* --------------------------------------------------------------
     Rendering
  -------------------------------------------------------------- */
  return (
    <div className="monaco-code-wrapper">
      {!loaded && <div className="monaco-code-loading">Lade Code-Viewer…</div>}
      <div
        ref={containerRef}
        className={`monaco-code-editor ${loaded ? "loaded" : "hidden"}`}
      />
    </div>
  );
}
