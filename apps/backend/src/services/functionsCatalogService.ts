// apps/backend/src/services/functionsCatalogService.ts
// SPDX-License-Identifier: MIT

/**
 * Functions Catalog Service
 *
 * Manages the hierarchical functions catalog, providing CRUD operations,
 * validation, caching, and linting for function nodes. Supports multi-language
 * localization and rule-based validation.
 *
 * @remarks
 * This service offers:
 * - Hierarchical function node management (categories, sections, actions)
 * - JSON-based persistence with file watching
 * - In-memory caching with TTL
 * - Schema validation using Zod
 * - Rule-based linting and validation
 * - Multi-language support (de, en, fr, it, pl, tr)
 * - Concurrent access control with locks
 *
 * Features:
 * - Build and update catalog index
 * - Node CRUD operations (create, read, update, delete)
 * - Tree traversal and path resolution
 * - Global rules validation
 * - Lint findings and error reporting
 *
 * @example
 * ```typescript
 * import catalogService from './services/functionsCatalogService.js';
 *
 * // Get full catalog
 * const catalog = await catalogService.getIndex();
 *
 * // Get specific node
 * const node = await catalogService.getNode(123);
 *
 * // Update node
 * await catalogService.updateNode(123, { name: 'newName' });
 *
 * // Validate catalog
 * const lintResults = await catalogService.lintCatalog();
 * ```
 */

/*==========================================================================*/
/*  Imports & Grund‑Konfiguration                                            */
/*==========================================================================*/

import { promises as fs } from "node:fs";
import * as fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

import { z } from "zod";
import AwaitLock from "await-lock";
import pino from "pino";

/*==========================================================================*/
/*  Pfad‑Auflösung & globale Konfiguration                                   */
/*==========================================================================*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../../../../");

interface Config {
  functionsJsonDir: string;
  cacheTtlMs: number;
  logLevel: string;
}
const config: Config = {
  functionsJsonDir:
    process.env.FUNCTIONS_JSON_DIR ||
    path.join(REPO_ROOT, "data", "functions", "output"),
  cacheTtlMs: Number(process.env.FUNCTIONS_INDEX_TTL_MS) || 5 * 60 * 1000, // 5 min
  logLevel: process.env.LOG_LEVEL || "info",
};

const logger = pino({ level: config.logLevel });

/*==========================================================================*/
/*  Typ‑Definitionen (Export)                                               */
/*==========================================================================*/

export type Severity = "error" | "warn" | "info";

export interface LintFinding {
  code: string;
  message: string;
  severity: Severity;
  file?: string;
  nodePath?: string;
  nodeId?: string;
}

export interface GlobalRules {
  version: number;
  locale: string;
}

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

export interface NodeMeta {
  id?: string;
  kind?: NodeKind;
  title?: Record<string, string> | string;
  weight?: number;
  tags?: string[];
  icon?: string;
  description?: Record<string, string> | string;
  category?: string;
  area?: string;
  priority?: "low" | "medium" | "high" | "critical";
  status?: "draft" | "active" | "deprecated";
  lastModified?: string;
  created?: string;
  [k: string]: unknown;
}

export interface NodeRBAC {
  anyOf?: string[];
  allOf?: string[];
  noneOf?: string[];
  mask?: Record<string, string>;
}

export interface NodeFlags {
  hidden?: boolean;
  beta?: boolean;
  feature?: string;
}

export interface NodePII {
  fields?: Record<string, "none" | "low" | "medium" | "high">;
}

export interface NodeAA {
  intent: string;
  steps?: Array<{ id: string; desc: string; gate?: string }>;
  inputs?: Array<{ name: string; type: string; required?: boolean }>;
  outputs?: Array<{ name: string; type: string }>;
}

export interface NodeSchema {
  $id?: string;
  type?: string;
  properties?: Record<string, unknown>;
  required?: string[];
  [k: string]: unknown;
}

export interface CatalogNode {
  id: string;
  parent_id?: string | null;
  title: string;
  icon?: string;
  kind: NodeKind;
  path: string[];
  weight: number;
  depth: number;
  children: CatalogNode[];
  source: { file: string; lineStart: number; lineEnd?: number };

  // erweiterte Felder
  fileCategory?: string;
  area?: string;

  // optionale Metadaten‑Blöcke
  meta?: NodeMeta;
  rbac?: NodeRBAC;
  flags?: NodeFlags;
  pii?: NodePII;
  aa?: NodeAA;
  schema?: NodeSchema;
  warnings?: string[];
}

export interface MenuNode {
  id: string;
  title: string;
  icon?: string;
  kind: NodeKind;
  depth?: number;
  children?: MenuNode[];
  metadata?: {
    area?: string;
    priority?: string;
    status?: string;
  };
}

export interface MenuContext {
  roles?: string[];
  features?: string[];
  area?: string; // Bereichs‑Filter
}

export interface BuildOptions {
  baseDir?: string;
  locale?: string;
  strict?: boolean;
  files?: string[];
}

export interface BuildResult {
  nodes: CatalogNode[];
  findings: LintFinding[];
  warnings: string[];
  rules: GlobalRules;
  loadedAt: string;
  stats: {
    totalNodes: number;
    categories: number;
    maxDepth: number;
    filesProcessed: number;
  };
}

export interface SearchParams {
  q?: string;
  kinds?: string[];
  tags?: string[];
  area?: string;
  priority?: string;
}

/*==========================================================================*/
/*  Default‑Regeln                                                          */
/*==========================================================================*/

const DEFAULT_RULES: GlobalRules = {
  version: 2,
  locale: "de",
};

/*==========================================================================*/
/*  Zod-Schema für die Roh-JSON-Einträge                                    */
/*==========================================================================*/

const ALLOWED_KINDS = [
  "category",
  "section",
  "record",
  "collection",
  "action",
  "note",
  "group",
  "workflow",
  "report",
  "dataset",
  "item",
] as const;

function normalizeKind(input: unknown): string {
  if (!input) return "group";

  const value = String(input).trim().toLowerCase();

  const map: Record<string, string> = {
    category: "category",
    cat: "category",

    section: "section",
    sec: "section",

    record: "record",
    rec: "record",
    form: "record",

    collection: "collection",
    coll: "collection",

    action: "action",
    act: "action",

    note: "note",

    group: "group",
    grp: "group",

    workflow: "workflow",
    wf: "workflow",

    report: "report",
    rpt: "report",

    dataset: "dataset",
    data: "dataset",

    item: "item",
  };

  return map[value] ?? "item";
}

const JsonNodeSchema = z
  .object({
    id: z.string(),
    parent_id: z.string().nullable().optional(),
    title: z.string(),

    kind: z
      .string()
      .transform((k) => normalizeKind(k))
      .pipe(z.enum(ALLOWED_KINDS))
      .optional(),

    path: z.array(z.string()).optional(),
    order: z.number().optional(),
    depth: z.number().optional(),
    icon: z.string().optional(),

    meta: z
      .object({
        lineNumber: z.number().optional(),
        tags: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .passthrough();

type JsonNode = z.infer<typeof JsonNodeSchema>;

/*==========================================================================*/
/*  Hilfs‑Funktionen für Metadaten‑Extraktion                              */
/*==========================================================================*/

function extractCategoryFromFilename(filename: string): string {
  const match = filename.match(/_(\d+)_([^.]+)/);
  if (match) {
    return match[2].replace(/[-_]/g, " ");
  }
  return filename.replace(/\.jsonl?$/i, "").replace(/[-_]/g, " ");
}

function extractArea(node: any): string {
  const title = node.title?.toLowerCase() ?? "";
  const pathStr = node.path?.join(" ").toLowerCase() ?? "";

  const patterns: Record<string, RegExp> = {
    finance: /finanz|controlling|budget|kosten|umsatz|einnahmen|ausgaben/,
    sales: /vertrieb|sales|kunden|auftrag|angebot|pipeline/,
    production: /produktion|fertigung|werk|lager|bestand|material/,
    hr: /personal|hr|mitarbeiter|gehalt|zeiterfassung|recruiting/,
    marketing: /marketing|kampagne|social|web|online|werbung/,
    it: /system|it|admin|software|hardware|netzwerk|datenbank/,
    communication: /kommunikation|email|chat|message|kontakt/,
    analytics: /reporting|analytics|analyse|kennzahl|metric|dashboard/,
  };

  for (const [area, regex] of Object.entries(patterns)) {
    if (regex.test(title) || regex.test(pathStr)) {
      return area;
    }
  }
  return "general";
}

function determinePriority(node: any): "low" | "medium" | "high" | "critical" {
  const title = node.title?.toLowerCase() ?? "";

  if (/(warnung|error|fehler|critical|kritisch|alert|notfall)/.test(title)) {
    return "critical";
  }
  if (/(wichtig|priority|dringend|haupt|core|zentral)/.test(title)) {
    return "high";
  }
  if (node.depth && node.depth <= 2) {
    return "medium";
  }
  return "low";
}

function extractTags(node: any): string[] {
  const tags = new Set<string>();
  const title = node.title?.toLowerCase() ?? "";
  const content = JSON.stringify(node).toLowerCase();

  const tagPatterns: Record<string, RegExp> = {
    kpi: /kpi|kennzahl|metric|leistung|performance/,
    report: /report|bericht|auswertung|statistik/,
    dashboard: /dashboard|übersicht|overview/,
    workflow: /workflow|prozess|ablauf|automatisierung/,
    data: /daten|data|export|import|migration/,
    realtime: /realtime|live|echtzeit|sofort/,
    analysis: /analyse|analysis|auswertung|trend/,
    monitoring: /monitoring|überwachung|control|tracking/,
    alert: /alert|warnung|notification|benachrichtigung/,
    export: /export|download|herunterladen|ausgabe/,
    import: /import|upload|hochladen|eingabe/,
  };

  for (const [tag, regex] of Object.entries(tagPatterns)) {
    if (regex.test(title) || regex.test(content)) {
      tags.add(tag);
    }
  }

  const area = extractArea(node);
  if (area !== "general") {
    tags.add(area);
  }

  return Array.from(tags);
}

/*==========================================================================*/
/*  Streaming‑Parser für .jsonl‑Dateien                                    */
/*==========================================================================*/

async function streamJsonLines(filePath: string): Promise<JsonNode[]> {
  const rl = readline.createInterface({
    input: fsSync.createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  const nodes: JsonNode[] = [];

  for await (const rawLine of rl) {
    const line = rawLine.trim();
    if (!line) continue;

    try {
      const parsed = JSON.parse(line);
      const result = JsonNodeSchema.safeParse(parsed);
      if (result.success) {
        nodes.push(result.data);
      } else {
        logger.warn(
          { file: path.basename(filePath), error: result.error },
          "Invalid JSON line in functions file",
        );
      }
    } catch (e) {
      logger.warn(
        { file: path.basename(filePath), error: e },
        "Unable to parse line as JSON",
      );
    }
  }

  return nodes;
}

/*==========================================================================*/
/*  Laden & Transformieren einer einzelnen Datei                              */
/*==========================================================================*/

async function parseJSONFile(
  filePath: string,
  _rules: GlobalRules,
): Promise<{
  file: string;
  nodes: CatalogNode[];
  findings: LintFinding[];
  warnings: string[];
}> {
  const relFile = path.relative(config.functionsJsonDir, filePath);
  const fileCategory = extractCategoryFromFilename(path.basename(filePath));
  const findings: LintFinding[] = [];
  const warnings: string[] = [];

  try {
    const jsonNodes = await streamJsonLines(filePath);
    const catalogNodes = jsonNodes.map((jn) =>
      jsonToCatalogNode(jn, relFile, fileCategory),
    );

    return { file: relFile, nodes: catalogNodes, findings, warnings };
  } catch (e) {
    const err = e as Error;
    const msg = err?.message ?? String(e);
    warnings.push(`Parse‑Fehler: ${msg}`);
    findings.push({
      code: "PARSE_FAILED",
      message: `JSON‑Datei konnte nicht geparst werden: ${msg}`,
      severity: "error",
      file: relFile,
    });
    return { file: relFile, nodes: [], findings, warnings };
  }
}

/*==========================================================================*/
/*  Konvertierung einer Roh‑JSON‑Node zu einem CatalogNode                     */
/*==========================================================================*/

function jsonToCatalogNode(
  jsonNode: JsonNode,
  sourceFile: string,
  fileCategory: string,
): CatalogNode {
  const area = extractArea(jsonNode);
  const priority = determinePriority(jsonNode);
  const extraTags = extractTags(jsonNode);

  const mergedMeta: NodeMeta = {
    ...(jsonNode.meta ?? {}),
    tags: [...(jsonNode.meta?.tags ?? []), ...extraTags],
    area,
    priority,
    status: (jsonNode.meta as any)?.status ?? "active",
    lastModified: new Date().toISOString(),
    created: (jsonNode.meta as any)?.created ?? new Date().toISOString(),
  };

  const node: CatalogNode = {
    id: jsonNode.id,
    parent_id: jsonNode.parent_id ?? null,
    title: jsonNode.title,
    icon: jsonNode.icon,
    kind: (jsonNode.kind ?? "group") as NodeKind,
    path: jsonNode.path ?? [],
    weight: jsonNode.order ?? 0,
    depth: jsonNode.depth ?? 0,
    children: [],
    source: {
      file: sourceFile,
      lineStart: jsonNode.meta?.lineNumber ?? 1,
    },
    fileCategory,
    area,
    meta: mergedMeta,
    // optional Blöcke (falls im JSON vorhanden)
    rbac: (jsonNode as any).rbac,
    flags: (jsonNode as any).flags,
    pii: (jsonNode as any).pii,
    aa: (jsonNode as any).aa,
    schema: (jsonNode as any).schema,
    warnings: (jsonNode as any).warnings,
  };

  return node;
}

/*==========================================================================*/
/*  Datei‑Auflistung (JSONL)                                                */
/*==========================================================================*/

async function listJSONFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const out: string[] = [];

    for (const e of entries) {
      if (e.isDirectory()) continue;
      if (!/\.jsonl?$/i.test(e.name)) continue;
      if (/_0_REGELN|parser-log/i.test(e.name)) continue;
      out.push(path.join(dir, e.name));
    }

    return out.sort();
  } catch (e) {
    logger.warn(e, `Fehler beim Lesen des Verzeichnisses ${dir}`);
    return [];
  }
}

/*==========================================================================*/
/*  Platzhalter‑Lader für globale Regeln                                    */
/*==========================================================================*/

async function loadGlobalRules(): Promise<GlobalRules> {
  // In einer echten Applikation würden hier externe Regel‑Dateien gemerged.
  return DEFAULT_RULES;
}

/*==========================================================================*/
/*  Baum‑Aufbau (flache Liste → hierarchischer Wald)                       */
/*==========================================================================*/

function buildTreeFromFlatNodes(flatNodes: CatalogNode[]): CatalogNode[] {
  const nodeMap = new Map<string, CatalogNode>();
  const roots: CatalogNode[] = [];

  // 1️⃣ Knoten kopieren (ohne Kinder) → Map
  for (const n of flatNodes) {
    nodeMap.set(n.id, { ...n, children: [] });
  }

  // 2️⃣ Parent‑/Child‑Beziehungen herstellen
  for (const n of flatNodes) {
    const cur = nodeMap.get(n.id);
    if (!cur) continue; // Should not happen, but handle it gracefully

    if (n.parent_id && nodeMap.has(n.parent_id)) {
      const parent = nodeMap.get(n.parent_id);
      if (parent) {
        parent.children.push(cur);
      }
    } else {
      roots.push(cur);
    }
  }

  // 3️⃣ Kategorien‑Wrapper (nach fileCategory)
  const catMap = new Map<string, CatalogNode>();
  const organized: CatalogNode[] = [];

  for (const root of roots) {
    const category = root.fileCategory ?? "Uncategorized";

    let catNode = catMap.get(category);
    if (!catNode) {
      const catId = `cat:${category.toLowerCase().replace(/\s+/g, "-")}`;
      catNode = {
        id: catId,
        parent_id: null,
        title: category,
        icon: undefined,
        kind: "category",
        path: [category],
        weight: 0,
        depth: 0,
        children: [],
        source: { file: "system", lineStart: 1 },
        fileCategory: category,
        area: extractArea({ title: category }),
        meta: {
          title: category,
          area: extractArea({ title: category }),
          priority: "medium",
          status: "active",
        } as NodeMeta,
      };
      catMap.set(category, catNode);
      organized.push(catNode);
    }
    catNode.children.push(root);
  }

  // 4️⃣ rekursive Sortierung (Gewicht → Titel)
  const sortRecursively = (nodes: CatalogNode[]) => {
    nodes.sort((a, b) => {
      if (a.weight !== b.weight) return a.weight - b.weight;
      return a.title.localeCompare(b.title, "de");
    });
    nodes.forEach((n) => sortRecursively(n.children));
  };
  sortRecursively(organized);

  return organized.length ? organized : roots;
}

/*==========================================================================*/
/*  Lint‑Prüfungen                                                         */
/*==========================================================================*/

function lintTree(allFiles: ParsedFile[], _rules: GlobalRules): LintFinding[] {
  const findings: LintFinding[] = [];
  const idMap = new Map<string, { file: string; path: string }[]>();

  const walk = (node: CatalogNode, file: string) => {
    // – Duplikat‑ID‑Check –
    const list = idMap.get(node.id) ?? [];
    list.push({ file, path: node.path.join(" / ") });
    idMap.set(node.id, list);

    // – Fehlende Pflicht‑Felder –
    if (!node.id) {
      findings.push({
        code: "MISSING_ID",
        message: "Node hat keine ID",
        severity: "error",
        file,
        nodePath: node.path.join(" / "),
      });
    }

    if (!node.title) {
      findings.push({
        code: "MISSING_TITLE",
        message: "Node hat keinen Titel",
        severity: "warn",
        file,
        nodeId: node.id,
        nodePath: node.path.join(" / "),
      });
    }

    node.children.forEach((c) => walk(c, file));
  };

  for (const pf of allFiles) {
    pf.nodes.forEach((n) => walk(n, pf.file));
  }

  // – Duplikate melden –
  for (const [id, locations] of idMap.entries()) {
    if (locations.length > 1) {
      const details = locations.map((l) => `${l.file} @ ${l.path}`).join("; ");
      findings.push({
        code: "DUPLICATE_ID",
        message: `ID "${id}" mehrfach verwendet (${details})`,
        severity: "error",
      });
    }
  }

  return findings;
}

/*==========================================================================*/
/*  Cache‑ und Lock‑Mechanismus                                            */
/*==========================================================================*/

interface CacheEntry {
  result: BuildResult;
  timestamp: number;
}
let cacheEntry: CacheEntry | null = null;

function isCacheValid(): boolean {
  if (!cacheEntry) return false;
  const age = Date.now() - cacheEntry.timestamp;
  return age < config.cacheTtlMs;
}

const refreshLock = new AwaitLock();

/*==========================================================================*/
/*  Kern‑Funktion: Index‑Aufbau                                            */
/*==========================================================================*/

interface ParsedFile {
  file: string;
  nodes: CatalogNode[];
  findings: LintFinding[];
  warnings: string[];
}

/**
 * Baut das komplette Katalog‑Index neu auf.
 * Wird intern verwendet – externe Aufrufer sollten die Service‑Klasse nutzen,
 * damit das Caching greift.
 */
async function buildIndex(opts?: BuildOptions): Promise<BuildResult> {
  const baseDir = opts?.baseDir ?? config.functionsJsonDir;
  const rules = await loadGlobalRules();

  const files = await listJSONFiles(baseDir);
  if (files.length === 0) {
    return {
      rules,
      nodes: [],
      findings: [
        {
          code: "NO_FILES",
          message: `Keine JSON‑Dateien gefunden in ${baseDir}`,
          severity: "warn",
        },
      ],
      warnings: [`Keine JSON‑Dateien in ${baseDir} gefunden`],
      loadedAt: new Date().toISOString(),
      stats: {
        totalNodes: 0,
        categories: 0,
        maxDepth: 0,
        filesProcessed: 0,
      },
    };
  }

  // Parallelisiertes Parsen
  const parsePromises = files.map((f) => parseJSONFile(f, rules));
  const settled = await Promise.allSettled(parsePromises);

  const parsedFiles: ParsedFile[] = [];
  const parseFindings: LintFinding[] = [];

  for (const r of settled) {
    if (r.status === "fulfilled") {
      parsedFiles.push(r.value);
    } else {
      const err = r.reason as Error;
      parseFindings.push({
        code: "PARSE_FILE",
        message: err.message,
        severity: "error",
      });
    }
  }

  let flatNodes = parsedFiles.flatMap((p) => p.nodes);

  // Auto-ID-Normalisierung
  flatNodes = normalizeDuplicateIds(flatNodes);

  /**
   * Auto-Normalizer für doppelte IDs.
   *
   * - belässt die erste ID unverändert
   * - hängt "-1", "-2", "-3", ... an alle weiteren Duplikate an
   * - protokolliert die Änderungen sauber
   */
  function normalizeDuplicateIds(nodes: CatalogNode[]): CatalogNode[] {
    const seen = new Map<string, number>();

    return nodes.map((n) => {
      const originalId = n.id;

      if (!seen.has(originalId)) {
        seen.set(originalId, 1);
        return n;
      }

      const count = seen.get(originalId) ?? 1;
      const newId = `${originalId}-${count}`;

      seen.set(originalId, count + 1);

      return {
        ...n,
        id: newId,
        warnings: [
          ...(n.warnings ?? []),
          `Auto-normalized duplicate ID "${originalId}" → "${newId}"`,
        ],
      };
    });
  }

  const normalizationWarnings = flatNodes.filter((n) =>
    n.warnings?.some((w) => w.includes("auto-normalized")),
  ).length;

  if (normalizationWarnings > 0) {
    parseFindings.push({
      code: "AUTO_ID_NORMALIZED",
      message: `IDs automatisch normalisiert (${normalizationWarnings} betroffene Knoten)`,
      severity: "info",
    });
  }

  const forest = buildTreeFromFlatNodes(flatNodes);

  // Statistiken
  let totalNodes = 0;
  let maxDepth = 0;
  const catSet = new Set<string>();
  const walkStats = (nodes: CatalogNode[]) => {
    for (const n of nodes) {
      totalNodes++;
      maxDepth = Math.max(maxDepth, n.depth);
      if (n.kind === "category") catSet.add(n.title);
      walkStats(n.children);
    }
  };
  walkStats(forest);

  const stats = {
    totalNodes,
    categories: catSet.size,
    maxDepth,
    filesProcessed: files.length,
  };

  logger.info(
    `[functions] Baumstruktur geladen: ${stats.categories} Kategorien, ${stats.totalNodes} Knoten, Tiefe ${stats.maxDepth}`,
  );

  const lintFindings = lintTree(parsedFiles, rules);

  return {
    rules,
    nodes: forest,
    findings: [
      ...parseFindings,
      ...lintFindings,
      ...parsedFiles.flatMap((p) => p.findings),
    ],
    warnings: parsedFiles.flatMap((p) => p.warnings),
    loadedAt: new Date().toISOString(),
    stats,
  };
}

/*==========================================================================*/
/*  Hilfs‑Methoden für das Frontend‑Menu‑Filtering                         */
/*==========================================================================*/

function passesFlags(node: CatalogNode, ctx: MenuContext): boolean {
  const flags = node.flags ?? {};
  if (flags.hidden) return false;

  if (flags.feature) {
    const allowed = new Set(ctx.features ?? []);
    if (!allowed.has(flags.feature)) return false;
  }

  if (ctx.area && node.area !== ctx.area) return false;

  return true;
}

function passesRBAC(node: CatalogNode, ctx: MenuContext): boolean {
  const roles = new Set(ctx.roles ?? []);
  const rbac = node.rbac ?? { anyOf: ["role:user"] };

  if (rbac.noneOf && rbac.noneOf.some((r) => roles.has(r))) return false;
  if (rbac.allOf && rbac.allOf.length > 0) {
    if (!rbac.allOf.every((r) => roles.has(r))) return false;
  }
  if (rbac.anyOf && rbac.anyOf.length > 0) {
    if (!rbac.anyOf.some((r) => roles.has(r))) return false;
  }

  return true;
}

function toMenuNode(node: CatalogNode): MenuNode {
  return {
    id: node.id,
    title: node.title,
    icon: node.icon,
    kind: node.kind,
    depth: node.depth,
    children: node.children.length ? node.children.map(toMenuNode) : undefined,
    metadata: {
      area: node.area,
      priority: node.meta?.priority,
      status: node.meta?.status,
    },
  };
}

function filterMenu(
  nodes: CatalogNode[],
  rules: GlobalRules,
  ctx: MenuContext,
): MenuNode[] {
  const out: MenuNode[] = [];

  for (const n of nodes) {
    if (!passesFlags(n, ctx)) continue;
    if (!passesRBAC(n, ctx)) continue;

    const childMenu = filterMenu(n.children, rules, ctx);

    if (childMenu.length > 0 || n.children.length === 0) {
      out.push({
        id: n.id,
        title: n.title,
        icon: n.icon,
        kind: n.kind,
        depth: n.depth,
        children: childMenu.length > 0 ? childMenu : undefined,
        metadata: {
          area: n.area,
          priority: n.meta?.priority,
          status: n.meta?.status,
        },
      });
    }
  }

  return out;
}

/*==========================================================================*/
/*  Knoten‑Suche (rekursiv)                                                */
/*==========================================================================*/

function findNodeWithBreadcrumbs(
  nodes: CatalogNode[],
  id: string,
  trail: Array<{ id: string; title: string }> = [],
): {
  node: CatalogNode;
  breadcrumbs: Array<{ id: string; title: string }>;
} | null {
  for (const n of nodes) {
    const nextTrail = [...trail, { id: n.id, title: n.title }];
    if (n.id === id) return { node: n, breadcrumbs: nextTrail };
    const hit = findNodeWithBreadcrumbs(n.children, id, nextTrail);
    if (hit) return hit;
  }
  return null;
}

/*==========================================================================*/
/*  Service‑Klasse (öffentliche API)                                       */
/*==========================================================================*/

export class FunctionsCatalogService {
  private baseDir: string;
  private readonly locale: string;
  private readonly strict: boolean;

  constructor(opts?: BuildOptions) {
    this.baseDir = opts?.baseDir ?? config.functionsJsonDir;
    this.locale = opts?.locale ?? "de";
    this.strict = opts?.strict ?? false;
  }

  /** Neuaufbau + Cache‑Update (exklusiv über Lock) */
  async refreshFunctionsIndex(): Promise<BuildResult> {
    await refreshLock.acquireAsync();
    try {
      const result = await buildIndex({
        baseDir: this.baseDir,
        locale: this.locale,
        strict: this.strict,
      });

      // Wenn beim Build einzelne Nodes Warnungen enthalten (z.B. auto-normalisierte IDs),
      // dann ein zusätzliches Lint-Finding für die Übersicht ins Ergebnis aufnehmen.
      if (
        flattenTree(result.nodes).some(
          (n: CatalogNode) => (n.warnings?.length ?? 0) > 0,
        )
      ) {
        result.findings.push({
          code: "AUTO_ID_NORMALIZED",
          severity: "info",
          message:
            "Duplicate IDs auto-normalized. Siehe node.warnings für Details.",
        });
      }

      cacheEntry = { result, timestamp: Date.now() };
      return result;
    } finally {
      refreshLock.release();
    }
  }

  /** Liefert gecachten Index oder aktualisiert ihn bei Verfall */
  async getFunctionsIndex(): Promise<BuildResult> {
    if (cacheEntry && isCacheValid()) {
      return cacheEntry.result;
    }
    return await this.refreshFunctionsIndex();
  }

  /** Menü‑Struktur, gefiltert nach Rollen/Features/Bereich */
  async getMenuForContext(
    ctx: MenuContext,
  ): Promise<{ menu: MenuNode[]; loadedAt: string; stats: any }> {
    const idx = await this.getFunctionsIndex();
    const menu = filterMenu(idx.nodes, idx.rules, ctx ?? {});
    return { menu, loadedAt: idx.loadedAt, stats: idx.stats };
  }

  /** Lint‑Ergebnisse */
  async lintFunctions(): Promise<{
    findings: LintFinding[];
    loadedAt: string;
  }> {
    const idx = await this.getFunctionsIndex();
    return { findings: idx.findings, loadedAt: idx.loadedAt };
  }

  /** Knoten nach ID (inkl. Breadcrumbs & UI‑Helper) */
  async getNodeById(id: string): Promise<
    | (CatalogNode & {
        breadcrumbs: Array<{ id: string; title: string }>;
        ui: {
          isForm: boolean;
          isWorkflow: boolean;
          isReport: boolean;
          isDataset: boolean;
          isAction: boolean;
        };
      })
    | null
  > {
    const idx = await this.getFunctionsIndex();
    const hit = findNodeWithBreadcrumbs(idx.nodes, id);
    if (!hit) return null;

    const { node, breadcrumbs } = hit;
    const ui = {
      isForm: node.kind === "record" && !!node.schema,
      isWorkflow: node.kind === "workflow" && !!node.aa,
      isReport: node.kind === "report",
      isDataset: node.kind === "dataset",
      isAction: node.kind === "action",
    };

    return { ...node, breadcrumbs, ui };
  }

  /** Kind‑Knoten (optional gefiltert) */
  async getChildrenForNode(
    id: string,
    ctx?: MenuContext,
  ): Promise<{ parent: MenuNode; children: MenuNode[] } | null> {
    const idx = await this.getFunctionsIndex();
    const hit = findNodeWithBreadcrumbs(idx.nodes, id);
    if (!hit) return null;

    const parentNode = hit.node;
    const parent: MenuNode = {
      id: parentNode.id,
      title: parentNode.title,
      icon: parentNode.icon,
      kind: parentNode.kind,
      depth: parentNode.depth,
      metadata: {
        area: parentNode.area,
        priority: parentNode.meta?.priority,
        status: parentNode.meta?.status,
      },
    };

    const children = ctx
      ? filterMenu(parentNode.children, idx.rules, ctx)
      : parentNode.children.map(toMenuNode);
    return { parent, children };
  }

  /** Volltext‑Suche (mit optionaler Pagination) */
  async search(
    params: SearchParams,
    pagination?: { limit?: number; offset?: number },
  ): Promise<
    Array<{
      id: string;
      title: string;
      kind: NodeKind;
      path: string[];
      score: number;
      tags?: string[];
      area?: string;
      priority?: string;
    }>
  > {
    const idx = await this.getFunctionsIndex();

    const q = (params.q ?? "").toLowerCase();
    const kinds = params.kinds ? new Set(params.kinds) : undefined;
    const tagFilter = params.tags
      ? new Set(params.tags.map((t) => t.toLowerCase()))
      : undefined;
    const areaFilter = params.area?.toLowerCase();

    const results: Array<{
      id: string;
      title: string;
      kind: NodeKind;
      path: string[];
      score: number;
      tags?: string[];
      area?: string;
      priority?: string;
    }> = [];

    const visit = (node: CatalogNode) => {
      if (kinds && !kinds.has(node.kind)) {
        node.children.forEach(visit);
        return;
      }
      if (areaFilter && node.area?.toLowerCase() !== areaFilter) {
        node.children.forEach(visit);
        return;
      }

      const hay =
        `${node.id} ${node.title} ${(node.meta?.tags ?? []).join(" ")}`.toLowerCase();

      let score = 0;
      if (q) {
        if (hay.includes(q)) score += 10;
        if (node.title.toLowerCase().startsWith(q)) score += 5;
        if (node.id.toLowerCase() === q) score += 20;
      } else {
        score = 1;
      }

      if (tagFilter && node.meta?.tags) {
        const nodeTags = new Set(node.meta.tags.map((t) => t.toLowerCase()));
        const hasTag = [...tagFilter].some((t) => nodeTags.has(t));
        if (!hasTag) score = 0;
      }

      if (score > 0) {
        results.push({
          id: node.id,
          title: node.title,
          kind: node.kind,
          path: node.path,
          score,
          tags: node.meta?.tags,
          area: node.area,
          priority: node.meta?.priority,
        });
      }

      node.children.forEach(visit);
    };

    idx.nodes.forEach(visit);

    results.sort(
      (a, b) =>
        b.score - a.score || a.title.localeCompare(b.title, idx.rules.locale),
    );

    const limit = pagination?.limit ?? results.length;
    const offset = pagination?.offset ?? 0;
    return results.slice(offset, offset + limit);
  }

  /** Snapshot der aktuellen Regeln */
  getRuleSnapshot(): GlobalRules {
    return cacheEntry?.result.rules ?? DEFAULT_RULES;
  }

  /** Liste aller Quell‑Dateien, die im Index vertreten sind */
  getSourceFiles(): string[] {
    return (
      cacheEntry?.result.nodes
        .map((n) => n.source.file)
        .filter((v, i, a) => a.indexOf(v) === i) ?? []
    );
  }

  /** Gesamte Knoten‑Anzahl */
  async getNodeCount(): Promise<number> {
    const idx = await this.getFunctionsIndex();
    return idx.stats.totalNodes;
  }

  /** Ändert das Basis‑Verzeichnis und invalidiert den Cache */
  async setBaseDirectory(newDir: string): Promise<void> {
    this.baseDir = newDir;
    cacheEntry = null;
  }

  /** Inkrem. Hinzufügen von JSON‑Dateien (nach aktuellem Index gemerged) */
  async addJSONFiles(filePaths: string[]): Promise<BuildResult> {
    const rules = await loadGlobalRules();

    // parse nur die neuen Dateien
    const parsedSettled = await Promise.allSettled(
      filePaths.map((p) => parseJSONFile(p, rules)),
    );

    const newFlat: CatalogNode[] = [];
    const newFindings: LintFinding[] = [];
    const newWarnings: string[] = [];

    for (const r of parsedSettled) {
      if (r.status === "fulfilled") {
        newFlat.push(...r.value.nodes);
        newFindings.push(...r.value.findings);
        newWarnings.push(...r.value.warnings);
      } else {
        const err = r.reason as Error;
        newFindings.push({
          code: "PARSE_FILE",
          message: err.message,
          severity: "error",
        });
      }
    }

    // bestehender Index
    const current = await this.getFunctionsIndex();

    // Merge – flache Liste aus aktuellem und neuem
    const mergedFlat = [
      ...current.nodes.flatMap((n) => flattenTree([n])),
      ...newFlat,
    ];

    const mergedForest = buildTreeFromFlatNodes(mergedFlat);

    const stats = {
      totalNodes: mergedFlat.length,
      categories: new Set(
        mergedFlat.filter((n) => n.kind === "category").map((n) => n.title),
      ).size,
      maxDepth: Math.max(...mergedFlat.map((n) => n.depth)),
      filesProcessed: current.stats.filesProcessed + filePaths.length,
    };

    const mergedResult: BuildResult = {
      rules,
      nodes: mergedForest,
      findings: [...current.findings, ...newFindings],
      warnings: [...current.warnings, ...newWarnings],
      loadedAt: new Date().toISOString(),
      stats,
    };

    cacheEntry = { result: mergedResult, timestamp: Date.now() };
    return mergedResult;
  }

  /** Kompakte Zusammenfassung für das Dashboard */
  async getFunctionsSummary() {
    try {
      const idx = await this.getFunctionsIndex();
      const totalNodes = idx.nodes?.length ?? 0;
      const categories = (idx.nodes ?? []).filter(
        (n) => n.children.length > 0,
      ).length;

      return {
        loadedAt: idx.loadedAt ?? new Date().toISOString(),
        nodes: totalNodes,
        categories,
        warnings: idx.warnings ?? [],
        findings: idx.findings ?? [],
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logger.error(e, "[FunctionsCatalogService] getFunctionsSummary failed");
      return {
        loadedAt: new Date().toISOString(),
        nodes: 0,
        categories: 0,
        warnings: [],
        findings: [],
        error: msg,
      };
    }
  }
}

/*==========================================================================*/
/*  Hilfs‑Funktion: flaches Auflösen eines Baums                            */
/*==========================================================================*/

function flattenTree(nodes: CatalogNode[]): CatalogNode[] {
  const out: CatalogNode[] = [];
  for (const n of nodes) {
    out.push(n);
    out.push(...flattenTree(n.children));
  }
  return out;
}

/*==========================================================================*/
/*  Convenience‑Export‑Funktionen (wie bisher)                              */
/*==========================================================================*/

export async function refreshFunctionsIndex(
  opts?: BuildOptions,
): Promise<BuildResult> {
  const service = new FunctionsCatalogService(opts);
  return await service.refreshFunctionsIndex();
}

export async function getFunctionsIndex(
  opts?: BuildOptions,
): Promise<BuildResult> {
  const service = new FunctionsCatalogService(opts);
  return await service.getFunctionsIndex();
}

export async function getMenuForContext(
  ctx: MenuContext,
  opts?: BuildOptions,
): Promise<{ menu: MenuNode[]; loadedAt: string; stats: any }> {
  const service = new FunctionsCatalogService(opts);
  return await service.getMenuForContext(ctx);
}

export async function lintFunctions(
  opts?: BuildOptions,
): Promise<{ findings: LintFinding[]; loadedAt: string }> {
  const service = new FunctionsCatalogService(opts);
  return await service.lintFunctions();
}

export async function getNodeById(
  id: string,
  opts?: BuildOptions,
): Promise<ReturnType<FunctionsCatalogService["getNodeById"]>> {
  const service = new FunctionsCatalogService(opts);
  return await service.getNodeById(id);
}

export async function getChildrenForNode(
  id: string,
  ctx?: MenuContext,
  opts?: BuildOptions,
): Promise<ReturnType<FunctionsCatalogService["getChildrenForNode"]>> {
  const service = new FunctionsCatalogService(opts);
  return await service.getChildrenForNode(id, ctx);
}

export async function searchFunctions(
  params: SearchParams,
  opts?: BuildOptions,
): Promise<ReturnType<FunctionsCatalogService["search"]>> {
  const service = new FunctionsCatalogService(opts);
  return await service.search(params);
}

export async function getNodeCount(opts?: BuildOptions): Promise<number> {
  const service = new FunctionsCatalogService(opts);
  return await service.getNodeCount();
}

export async function setFunctionsDirectory(
  newDir: string,
  opts?: BuildOptions,
): Promise<void> {
  const service = new FunctionsCatalogService(opts);
  await service.setBaseDirectory(newDir);
}

export async function addFunctionFiles(
  filePaths: string[],
  opts?: BuildOptions,
): Promise<BuildResult> {
  const service = new FunctionsCatalogService(opts);
  return await service.addJSONFiles(filePaths);
}
