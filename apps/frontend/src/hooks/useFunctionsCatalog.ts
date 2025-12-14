// SPDX-License-Identifier: MIT
// apps/frontend/src/hooks/useFunctionsCatalog.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("functions-catalog");

/* ---------- Typen (kompatibel zum Backend) ---------- */

export type NodeKind =
  | "category"
  | "section"
  | "record"
  | "collection"
  | "action"
  | "note"
  | "group"
  | "workflow"
  | "report"
  | "dataset"
  | "item";

export interface MenuNode {
  id: string;
  title: string;
  icon?: string;
  kind: NodeKind;
  children?: MenuNode[];
}

export interface MenuContext {
  roles?: string[];
  features?: string[];
}

export interface Breadcrumb {
  id: string;
  title: string;
}

export interface NodeUI {
  isForm: boolean;
  isWorkflow: boolean;
  isReport: boolean;
  isDataset: boolean;
  isAction: boolean;
}

export interface NodeDetail {
  id: string;
  title: string;
  icon?: string;
  kind: NodeKind;
  path: string[];
  weight: number;
  children: Array<{
    id: string;
    title: string;
    icon?: string;
    kind: NodeKind;
  }>;
  source: { file: string; lineStart: number; lineEnd?: number };
  meta?: unknown;
  rbac?: unknown;
  flags?: unknown;
  pii?: unknown;
  aa?: unknown;
  schema?: unknown;
  warnings?: string[];
  breadcrumbs: Breadcrumb[];
  ui: NodeUI;
}

export interface SearchResult {
  id: string;
  title: string;
  kind: NodeKind;
  path: string[];
  score: number;
  tags?: string[];
}

export type Severity = "error" | "warn" | "info";
export interface LintFinding {
  code: string;
  message: string;
  severity: Severity;
  file?: string;
  nodePath?: string;
  nodeId?: string;
}

export interface FunctionsRulesSnapshot {
  version: number;
  locale: string;
}

export interface BuildResult {
  nodes: any[];
  findings: any[];
  warnings: string[];
  rules: any;
  loadedAt: string;
}

/* ---------- Sidebar Typen ---------- */

export interface SidebarProps {
  menu: MenuNode[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  title?: string;
}

export type ExpandedMap = Record<string, boolean>;

/* ---------- Logger ---------- */

class CatalogLogger {
  private readonly enabled: boolean;
  private readonly prefix = "[FunctionsCatalog]";

  constructor(enabled: boolean = true) {
    this.enabled =
      enabled && (import.meta as any)?.env?.NODE_ENV !== "production";
  }

  info(message: string, data?: any) {
    if (this.enabled) {
      logger.info(message, data);
    }
  }

  warn(message: string, data?: any) {
    if (this.enabled) {
      logger.warn(message, data);
    }
  }

  error(message: string, error?: any) {
    if (this.enabled) {
      console.error(`${this.prefix} ${message}`, error || "");
    }
  }

  debug(message: string, data?: any) {
    if (this.enabled && import.meta.env.DEV) {
      // Development-only debug logging
      // eslint-disable-next-line no-console
      console.debug(`${this.prefix} ${message}`, data || "");
    }
  }
}

/* ---------- Hilfsfunktionen ---------- */

function sanitizeUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function validateBaseUrl(url: string): boolean {
  try {
    if (!url) return true;
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function sanitizeContext(context: MenuContext): MenuContext {
  return {
    roles: Array.isArray(context.roles)
      ? context.roles.filter(
          (role) => typeof role === "string" && role.length > 0,
        )
      : [],
    features: Array.isArray(context.features)
      ? context.features.filter(
          (feature) => typeof feature === "string" && feature.length > 0,
        )
      : [],
  };
}

function getDefaultBaseUrl(): string {
  return (import.meta as any)?.env?.VITE_BACKEND_URL || "";
}

/* ---------- Haupt-Hook ---------- */

export interface UseFunctionsCatalogOptions {
  initialContext?: MenuContext;
  baseUrl?: string;
  enableLogging?: boolean;
}

export interface UseFunctionsCatalogReturn {
  // State
  rules: FunctionsRulesSnapshot | null;
  menu: MenuNode[];
  node: NodeDetail | null;
  searchResults: SearchResult[];
  findings: LintFinding[];
  loadedAt: string | null;
  selectedId: string | null;
  searchQuery: string;
  menuLoading: boolean;
  menuError: string | null;
  nodeLoading: boolean;
  nodeError: string | null;
  searchLoading: boolean;
  lintLoading: boolean;
  rulesLoading: boolean;
  roots: NodeDetail[];
  rootsLoading: boolean;
  rootsError: string | null;

  // API
  setContext: (
    context: MenuContext | ((prev: MenuContext) => MenuContext),
  ) => void;
  reloadIndex: () => Promise<void>;
  selectNode: (id: string) => void;
  search: (query: string, kinds?: NodeKind[], tags?: string[]) => void;
  loadLint: () => Promise<void>;
  loadNode: (id: string) => Promise<void>;
  loadRoots: () => Promise<void>;
}

export function useFunctionsCatalog(
  options?: UseFunctionsCatalogOptions,
): UseFunctionsCatalogReturn {
  // Konfiguration mit useMemo statt useState für stabilen Wert
  const config = useMemo(() => {
    const baseUrl = options?.baseUrl || getDefaultBaseUrl();
    const sanitizedUrl = sanitizeUrl(baseUrl);

    if (baseUrl && !validateBaseUrl(baseUrl)) {
      console.warn(
        `[FunctionsCatalog] Ungültige baseUrl: ${baseUrl}, verwende relative Pfade`,
      );
    }

    return {
      baseUrl: sanitizedUrl,
      enableLogging: options?.enableLogging ?? true,
    };
  }, [options?.baseUrl, options?.enableLogging]);

  // Logger als Ref, um Re-Renders zu vermeiden
  const logger = useRef(new CatalogLogger(config.enableLogging));

  const [context, setContext] = useState<MenuContext>(
    sanitizeContext(options?.initialContext || {}),
  );

  const [menu, setMenu] = useState<MenuNode[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);

  const [rules, setRules] = useState<FunctionsRulesSnapshot | null>(null);
  const [rulesLoading, setRulesLoading] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [node, setNode] = useState<NodeDetail | null>(null);
  const [nodeLoading, setNodeLoading] = useState(false);
  const [nodeError, setNodeError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const searchTimer = useRef<number | null>(null);

  const [findings, setFindings] = useState<LintFinding[]>([]);
  const [lintLoading, setLintLoading] = useState(false);

  const [loadedAt, setLoadedAt] = useState<string | null>(null);

  // --- Roots State
  const [roots, setRoots] = useState<NodeDetail[]>([]);
  const [rootsLoading, setRootsLoading] = useState(false);
  const [rootsError, setRootsError] = useState<string | null>(null);

  const abortMenu = useRef<AbortController | null>(null);
  const abortNode = useRef<AbortController | null>(null);
  const abortSearch = useRef<AbortController | null>(null);
  const abortRules = useRef<AbortController | null>(null);
  const abortLint = useRef<AbortController | null>(null);
  const abortRoots = useRef<AbortController | null>(null);

  /* ----- Sichere Fetch-Funktion ----- */
  const jsonFetch = useCallback(
    async <T = any>(
      endpoint: string,
      init?: RequestInit,
      signal?: AbortSignal,
    ): Promise<T> => {
      const url = config.baseUrl ? `${config.baseUrl}${endpoint}` : endpoint;

      logger.current.debug(`Fetch: ${url}`, {
        method: init?.method || "GET",
        hasBody: !!init?.body,
      });

      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
          },
          ...init,
          signal,
        });

        if (!response.ok) {
          const text = await response.text().catch(() => "Unknown error");
          logger.current.error(`HTTP ${response.status} für ${url}`, text);
          throw new Error(
            `HTTP ${response.status}: ${text || response.statusText}`,
          );
        }

        const data = await response.json();
        logger.current.debug(`Erfolgreiche Antwort von ${url}`, {
          success: data.success,
          dataLength: JSON.stringify(data).length,
        });

        return data;
      } catch (error: any) {
        if (error.name === "AbortError") {
          logger.current.debug("Request abgebrochen", url);
          throw error;
        }
        logger.current.error(`Fetch-Fehler für ${url}`, error);
        throw error;
      }
    },
    [config.baseUrl],
  );

  /* ----- Regeln laden (einmalig) ----- */
  const loadRules = useCallback(async () => {
    abortRules.current?.abort();
    const ac = new AbortController();
    abortRules.current = ac;

    try {
      setRulesLoading(true);
      logger.current.info("Lade Regeln...");

      const data = await jsonFetch<{
        success: boolean;
        rules: FunctionsRulesSnapshot;
      }>("/api/functions/rules", undefined, ac.signal);

      if (data.success) {
        setRules(data.rules);
        logger.current.info("Regeln erfolgreich geladen", {
          version: data.rules.version,
          locale: data.rules.locale,
        });
      } else {
        logger.current.warn(
          "Regeln konnten nicht geladen werden - success=false",
        );
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      logger.current.error("Fehler beim Laden der Regeln", error);
    } finally {
      setRulesLoading(false);
    }
  }, [jsonFetch]);

  /* ----- Menü laden (bei Context-Änderung) ----- */
  const loadMenu = useCallback(
    async (ctx: MenuContext) => {
      abortMenu.current?.abort();
      const ac = new AbortController();
      abortMenu.current = ac;

      const sanitizedCtx = sanitizeContext(ctx);

      try {
        setMenuLoading(true);
        setMenuError(null);
        logger.current.info("Lade Menü...", { context: sanitizedCtx });

        const data = await jsonFetch<{
          success: boolean;
          menu: MenuNode[];
          loadedAt?: string;
        }>(
          "/api/functions/menu",
          {
            method: "POST",
            body: JSON.stringify(sanitizedCtx),
          },
          ac.signal,
        );

        if (data.success) {
          setMenu(data.menu || []);
          if (data.loadedAt) {
            setLoadedAt(data.loadedAt);
          }
          logger.current.info("Menü erfolgreich geladen", {
            nodeCount: data.menu?.length || 0,
            loadedAt: data.loadedAt,
          });
        } else {
          setMenu([]);
          logger.current.warn(
            "Menü konnte nicht geladen werden - success=false",
          );
        }
      } catch (error: any) {
        if (error?.name === "AbortError") {
          logger.current.debug("Menü-Request abgebrochen");
          return;
        }
        const errorMsg = error?.message || "Menü konnte nicht geladen werden";
        setMenuError(errorMsg);
        setMenu([]);
        logger.current.error("Fehler beim Laden des Menüs", error);
      } finally {
        setMenuLoading(false);
      }
    },
    [jsonFetch],
  );

  /* ----- Node laden ----- */
  const loadNode = useCallback(
    async (id: string) => {
      if (!id || typeof id !== "string" || id.trim().length === 0) {
        logger.current.warn("Versuch einen leeren Node-ID zu laden");
        setNodeError("Ungültige Node-ID");
        return;
      }

      const sanitizedId = id.trim();
      abortNode.current?.abort();
      const ac = new AbortController();
      abortNode.current = ac;

      try {
        setNodeLoading(true);
        setNodeError(null);
        logger.current.info(`Lade Node: ${sanitizedId}`);

        const data = await jsonFetch<{ success: boolean; node: NodeDetail }>(
          `/api/functions/nodes/${encodeURIComponent(sanitizedId)}`,
          undefined,
          ac.signal,
        );

        if (data.success) {
          setNode(data.node);
          logger.current.debug(`Node ${sanitizedId} erfolgreich geladen`, {
            title: data.node.title,
            kind: data.node.kind,
          });
        } else {
          setNode(null);
          logger.current.warn(
            `Node ${sanitizedId} nicht gefunden - success=false`,
          );
        }
      } catch (error: any) {
        if (error?.name === "AbortError") {
          logger.current.debug(`Node-Request für ${sanitizedId} abgebrochen`);
          return;
        }
        setNode(null);
        const errorMsg = error?.message || "Knoten konnte nicht geladen werden";
        setNodeError(errorMsg);
        logger.current.error(
          `Fehler beim Laden von Node ${sanitizedId}`,
          error,
        );
      } finally {
        setNodeLoading(false);
      }
    },
    [jsonFetch],
  );

  /* ----- Lint laden (optional für Admin/Debug) ----- */
  const loadLint = useCallback(async () => {
    abortLint.current?.abort();
    const ac = new AbortController();
    abortLint.current = ac;

    try {
      setLintLoading(true);
      logger.current.info("Lade Lint-Ergebnisse...");

      const data = await jsonFetch<{
        success: boolean;
        findings: LintFinding[];
      }>("/api/functions/lint", undefined, ac.signal);

      if (data.success) {
        setFindings(data.findings || []);
        logger.current.info("Lint-Ergebnisse geladen", {
          findingCount: data.findings?.length || 0,
        });
      }
    } catch (error: any) {
      if (error?.name === "AbortError") return;
      logger.current.error("Fehler beim Laden der Lint-Ergebnisse", error);
    } finally {
      setLintLoading(false);
    }
  }, [jsonFetch]);

  /* ----- Roots laden ----- */
  const loadRoots = useCallback(async () => {
    abortRoots.current?.abort();
    const ac = new AbortController();
    abortRoots.current = ac;

    try {
      setRootsLoading(true);
      setRootsError(null);
      logger.current.info("Lade Roots...");

      // flache Kategorien vom Backend holen
      const data = await jsonFetch<{ success: boolean; nodes: NodeDetail[] }>(
        `/api/functions/index?kinds=category&flat=1`,
        undefined,
        ac.signal,
      );

      if (data.success) {
        // nur echte Datei-Roots: path.length === 1
        const top = (data.nodes || []).filter(
          (n) => Array.isArray(n.path) && n.path.length === 1,
        );
        setRoots(top);
        logger.current.info("Roots erfolgreich geladen", {
          rootCount: top.length,
          totalNodes: data.nodes?.length || 0,
        });
      } else {
        setRoots([]);
        logger.current.warn(
          "Roots konnten nicht geladen werden - success=false",
        );
      }
    } catch (error: any) {
      if (error?.name === "AbortError") {
        logger.current.debug("Roots-Request abgebrochen");
        return;
      }
      setRoots([]);
      const errorMsg = error?.message || "Roots konnten nicht geladen werden";
      setRootsError(errorMsg);
      logger.current.error("Fehler beim Laden der Roots", error);
    } finally {
      setRootsLoading(false);
    }
  }, [jsonFetch]);

  /* ----- Index reload (manuell) ----- */
  const reloadIndex = useCallback(async () => {
    try {
      logger.current.info("Starte Index-Reload...");

      await jsonFetch<{ success: boolean; loadedAt?: string }>(
        "/api/functions/reload",
        { method: "POST" },
      );

      await loadMenu(context);
      await loadRoots();

      if (selectedId) {
        await loadNode(selectedId);
      }

      logger.current.info("Index-Reload abgeschlossen");
    } catch (error: any) {
      logger.current.error("Fehler beim Index-Reload", error);
      throw error;
    }
  }, [jsonFetch, context, loadMenu, loadNode, loadRoots, selectedId]);

  /* ----- Suche (debounced) ----- */
  const search = useCallback(
    async (query: string, kinds?: NodeKind[], tags?: string[]) => {
      const sanitizedQuery = typeof query === "string" ? query.trim() : "";

      if (searchTimer.current) {
        window.clearTimeout(searchTimer.current);
        searchTimer.current = null;
      }

      setSearchQuery(sanitizedQuery);

      if (!sanitizedQuery) {
        setSearchResults([]);
        return;
      }

      searchTimer.current = window.setTimeout(async () => {
        abortSearch.current?.abort();
        const ac = new AbortController();
        abortSearch.current = ac;

        try {
          setSearchLoading(true);
          logger.current.debug("Starte Suche", {
            query: sanitizedQuery,
            kinds,
            tags,
          });

          const params = new URLSearchParams();
          params.set("q", sanitizedQuery);

          if (kinds?.length) {
            params.set("kinds", kinds.join(","));
          }

          if (tags?.length) {
            params.set("tags", tags.join(","));
          }

          const data = await jsonFetch<{
            success: boolean;
            results: SearchResult[];
          }>(
            `/api/functions/search?${params.toString()}`,
            undefined,
            ac.signal,
          );

          if (data.success) {
            setSearchResults(data.results || []);
            logger.current.debug("Suche abgeschlossen", {
              query: sanitizedQuery,
              resultCount: data.results?.length || 0,
            });
          }
        } catch (error: any) {
          if (error?.name === "AbortError") return;
          logger.current.error("Fehler bei der Suche", error);
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    },
    [jsonFetch],
  );

  /* ----- Auswahl setzen ----- */
  const selectNode = useCallback(
    (id: string) => {
      if (!id || typeof id !== "string") {
        logger.current.warn("Ungültige Node-ID für Auswahl", id);
        return;
      }

      setSelectedId(id);
      if (id) {
        logger.current.debug("Wähle Node aus", { id });
        void loadNode(id);
      }
    },
    [loadNode],
  );

  /* ----- Kontext setzen (sicher) ----- */
  const setSafeContext = useCallback(
    (newContext: MenuContext | ((prev: MenuContext) => MenuContext)) => {
      setContext((prev) => {
        const nextContext =
          typeof newContext === "function" ? newContext(prev) : newContext;
        return sanitizeContext(nextContext);
      });
    },
    [],
  );

  /* ----- Effekte ----- */
  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  useEffect(() => {
    void loadMenu(context);
    void loadRoots();
  }, [context, loadMenu, loadRoots]);

  /* ----- Aufräumen ----- */
  useEffect(() => {
    return () => {
      logger.current.debug("Cleanup: Breche alle laufenden Requests ab");

      abortMenu.current?.abort();
      abortNode.current?.abort();
      abortSearch.current?.abort();
      abortRules.current?.abort();
      abortLint.current?.abort();
      abortRoots.current?.abort();

      if (searchTimer.current) {
        window.clearTimeout(searchTimer.current);
      }
    };
  }, []);

  const api = useMemo(
    () => ({
      setContext: setSafeContext,
      reloadIndex,
      selectNode,
      search,
      loadLint,
      loadNode,
      loadRoots,
    }),
    [
      setSafeContext,
      reloadIndex,
      search,
      selectNode,
      loadLint,
      loadNode,
      loadRoots,
    ],
  );

  const state = useMemo(
    () => ({
      rules,
      menu,
      node,
      searchResults,
      findings,
      loadedAt,
      selectedId,
      searchQuery,
      menuLoading,
      menuError,
      nodeLoading,
      nodeError,
      searchLoading,
      lintLoading,
      rulesLoading,
      roots,
      rootsLoading,
      rootsError,
    }),
    [
      rules,
      menu,
      node,
      searchResults,
      findings,
      loadedAt,
      selectedId,
      searchQuery,
      menuLoading,
      menuError,
      nodeLoading,
      nodeError,
      searchLoading,
      lintLoading,
      rulesLoading,
      roots,
      rootsLoading,
      rootsError,
    ],
  );

  logger.current.debug("Hook-Zustand", {
    menuItems: menu.length,
    selectedId,
    searchQueryLength: searchQuery.length,
    searchResults: searchResults.length,
    rootsCount: roots.length,
  });

  return {
    ...state,
    ...api,
  };
}
