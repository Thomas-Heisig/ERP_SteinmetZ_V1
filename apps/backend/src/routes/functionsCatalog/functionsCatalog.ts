// SPDX-License-Identifier: MIT
// ---------------------------------------------------------------------
// Router: /api/functions/*
// ---------------------------------------------------------------------
// Dieser Router verwendet die neu refaktorierte
// `FunctionsCatalogService`.  Dabei werden die neuen
// Features (Streaming‑Parsing, Cache‑TTL, Pagination, Validierung …)
// ausgenutzt.
// ---------------------------------------------------------------------

import { Router, Request, Response } from "express";
import { z } from "zod";

import {
  FunctionsCatalogService,
  type MenuContext,
  type SearchParams,
} from "../../services/functionsCatalogService.js";

import db from "../../services/dbService.js";
import pino from "pino";

/* ------------------------------------------------------------------- */
/* Logging / Error‑Handling                                            */
/* ------------------------------------------------------------------- */
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

function sendError(
  res: Response,
  source: string,
  err: unknown,
  status = 500,
): void {
  const message = err instanceof Error ? err.message : String(err);
  logger.error({ source, err: message }, "Router‑Error");
  res.status(status).json({ success: false, error: message });
}

/* ------------------------------------------------------------------- */
/* Eingabe‑Validierung (Zod)                                           */
/* ------------------------------------------------------------------- */
const menuContextSchema = z.object({
  roles: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  area: z.string().optional(),
});

const addFilesSchema = z.object({
  files: z
    .array(z.string().min(1))
    .nonempty({ message: "files‑Array darf nicht leer sein" }),
});

const searchSchema = z.object({
  q: z.string().optional(),
  kinds: z
    .string()
    .optional()
    .transform((s) =>
      s
        ? s
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean)
        : [],
    ),
  tags: z
    .string()
    .optional()
    .transform((s) =>
      s
        ? s
            .split(",")
            .map((i) => i.trim().toLowerCase())
            .filter(Boolean)
        : [],
    ),
  area: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((s) => (s ? Number(s) : undefined))
    .refine((n) => n === undefined || (Number.isInteger(n) && n > 0), {
      message: "limit must be a positive integer",
    }),
  offset: z
    .string()
    .optional()
    .transform((s) => (s ? Number(s) : undefined))
    .refine((n) => n === undefined || (Number.isInteger(n) && n >= 0), {
      message: "offset must be a non‑negative integer",
    }),
});

/* ------------------------------------------------------------------- */
/* Router‑Instanz & Service (Cache wird static vom Service verwaltet)   */
/* ------------------------------------------------------------------- */
const router = Router();
const service = new FunctionsCatalogService();

/* ------------------------------------------------------------------- */
/* Hilfs‑Wrapper für async‑Routen (statt try / catch in jedem Handler)*/
/* ------------------------------------------------------------------- */
function asyncHandler(fn: (req: Request, res: Response) => Promise<unknown>) {
  return (req: Request, res: Response, next: (err?: unknown) => void) => {
    fn(req, res).catch(next);
  };
}

/* ------------------------------------------------------------------- */
/* 1️⃣  Regeln‑Snapshot                                                */
/* ------------------------------------------------------------------- */
router.get(
  "/rules",
  asyncHandler(async (_req, res) => {
    const rules = service.getRuleSnapshot();
    res.json({ success: true, rules });
  }),
);

/* ------------------------------------------------------------------- */
/* 2️⃣  Index neu aufbauen (Cache‑Refresh)                              */
/* ------------------------------------------------------------------- */
router.post(
  "/reload",
  asyncHandler(async (_req, res) => {
    const result = await service.refreshFunctionsIndex();
    res.json({
      success: true,
      loadedAt: result.loadedAt,
      findings: result.findings,
      warnings: result.warnings ?? [],
    });
  }),
);

/* ------------------------------------------------------------------- */
/* 3️⃣  Voller Funktions-Index                                          */
/* ------------------------------------------------------------------- */
router.get(
  "/index",
  asyncHandler(async (req, res) => {
    const strict = req.query.strict === "1";

    const kinds =
      typeof req.query.kinds === "string"
        ? (req.query.kinds as string)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    const flat = req.query.flat === "1";

    // Bei strict-Mode einen frischen Build forcen
    const result = strict
      ? await service.refreshFunctionsIndex() // ⬅ geändert
      : await service.getFunctionsIndex();

    let nodes = result.nodes ?? [];

    // ---------------------------------------------------------------
    // Auf Kind-Filter anwenden (optional)
    // ---------------------------------------------------------------
    if (kinds?.length) {
      type NodeLike = { kind: string; children?: NodeLike[] };
      const matched: NodeLike[] = [];

      const walk = (n: NodeLike) => {
        if (kinds.includes(n.kind)) matched.push(n);
        n.children?.forEach(walk);
      };
      nodes.forEach(walk);

      if (flat) {
        return res.json({
          success: true,
          nodes: matched,
          loadedAt: result.loadedAt,
        });
      }

      // gruppiert nach Kind-Name
      const grouped: Record<string, NodeLike[]> = {};
      for (const n of matched) {
        (grouped[n.kind] = grouped[n.kind] || []).push(n);
      }

      return res.json({
        success: true,
        nodesGrouped: grouped,
        loadedAt: result.loadedAt,
      });
    }

    // ---------------------------------------------------------------
    // Keine Kind-Filterung → Gesamtes Ergebnis zurückgeben
    // ---------------------------------------------------------------
    res.json({
      success: true,
      nodes,
      loadedAt: result.loadedAt,
      findings: result.findings ?? [],
      warnings: result.warnings ?? [],
    });
  }),
);

/* ------------------------------------------------------------------- */
/* 4️⃣  Menü‑Erstellung (RBAC + Feature + Area‑Filter)                  */
/* ------------------------------------------------------------------- */
router.post(
  "/menu",
  asyncHandler(async (req, res) => {
    const parsed = menuContextSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.message,
      });
    }

    const ctx: MenuContext = parsed.data;
    const { menu, loadedAt } = await service.getMenuForContext(ctx);
    res.json({ success: true, menu, loadedAt });
  }),
);

/* ------------------------------------------------------------------- */
/* 5️⃣  Liste aller Quelldateien                                        */
/* ------------------------------------------------------------------- */
router.get(
  "/files",
  asyncHandler(async (_req, res) => {
    const files = service.getSourceFiles();
    res.json({ success: true, files });
  }),
);

/* ------------------------------------------------------------------- */
/* 6️⃣  Lint‑Findings                                                   */
/* ------------------------------------------------------------------- */
router.get(
  "/lint",
  asyncHandler(async (_req, res) => {
    const { findings, loadedAt } = await service.lintFunctions();
    res.json({ success: true, findings, loadedAt });
  }),
);

/* ------------------------------------------------------------------- */
/* 7️⃣  Einzelknoten + Breadcrumbs + UI‑Hinweise                        */
/* ------------------------------------------------------------------- */
router.get(
  "/nodes/:id",
  asyncHandler(async (req, res) => {
    const node = await service.getNodeById(req.params.id);
    if (!node) {
      return res.status(404).json({ success: false, error: "NOT_FOUND" });
    }
    res.json({ success: true, node });
  }),
);

/* ------------------------------------------------------------------- */
/* 8️⃣  Direkte Kinder eines Knotens (optional gefiltert)                */
/* ------------------------------------------------------------------- */
router.get(
  "/nodes/:id/children",
  asyncHandler(async (req, res) => {
    const id = req.params.id;

    const parseRoles = (v: unknown) =>
      typeof v === "string"
        ? v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    const ctx: MenuContext = {
      roles: parseRoles(req.query.roles),
      features: parseRoles(req.query.features),
    };

    const out = await service.getChildrenForNode(id, ctx);
    if (!out) {
      return res.status(404).json({ success: false, error: "NOT_FOUND" });
    }
    res.json({ success: true, ...out });
  }),
);

/* ------------------------------------------------------------------- */
/* 9️⃣  Volltext‑Suche (mit Pagination)                                 */
/* ------------------------------------------------------------------- */
router.get(
  "/search",
  asyncHandler(async (req, res) => {
    const parsed = searchSchema.safeParse(req.query);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, error: parsed.error.message });
    }

    const { q, kinds, tags, area, limit, offset } =
      parsed.data as SearchParams & { limit?: number; offset?: number };

    const pagination = {
      limit,
      offset,
    };

    const params: SearchParams = {
      q,
      kinds: kinds?.length ? kinds : undefined,
      tags: tags?.length ? tags : undefined,
      area,
    };

    const results = await service.search(params, pagination);
    res.json({ success: true, results });
  }),
);

/* ------------------------------------------------------------------- */
/* 🔟  Neue Route: JSON‑Dateien inkrementell hinzufügen                */
/* ------------------------------------------------------------------- */
router.post(
  "/add-files",
  asyncHandler(async (req, res) => {
    const parsed = addFilesSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, error: parsed.error.message });
    }

    const { files } = parsed.data;
    const result = await service.addJSONFiles(files);
    res.json({
      success: true,
      loadedAt: result.loadedAt,
      stats: result.stats,
      findings: result.findings,
      warnings: result.warnings,
    });
  }),
);

/* ------------------------------------------------------------------- */
/* 11️⃣  Katalog → DB persistieren (Basis‑Schema)                        */
/* ------------------------------------------------------------------- */
router.post(
  "/persist",
  asyncHandler(async (_req, res) => {
    const result = await service.getFunctionsIndex();
    const summary = await db.upsertFunctionsCatalog(result);
    res.json({ success: true, ...summary });
  }),
);

/* ------------------------------------------------------------------- */
/* 12️⃣  Roots-Endpoint für Dashboard                                   */
/* ------------------------------------------------------------------- */
router.get(
  "/roots",
  asyncHandler(async (_req, res) => {
    const index = await service.getFunctionsIndex();
    // Return only top-level nodes (roots)
    res.json({
      success: true,
      roots: index.nodes, // Top-level category nodes
      loadedAt: index.loadedAt,
    });
  }),
);

/* ------------------------------------------------------------------- */
/* 13️⃣  Root‑Endpoint – kompakte Zusammenfassung für das Dashboard   */
/* ------------------------------------------------------------------- */
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const summary = await service.getFunctionsSummary();

    // Für Frontend‑Kompatibilität die vollen Knoten mitliefern
    const index = await service.getFunctionsIndex();

    res.json({
      success: true,
      data: {
        loadedAt: summary.loadedAt,
        nodes: index.nodes, // Array‑Struktur (nicht nur IDs)
        categories: summary.categories,
        warnings: summary.warnings,
        findings: summary.findings,
      },
    });
  }),
);

/* ------------------------------------------------------------------- */
/* Export (default)                                                    */
/* ------------------------------------------------------------------- */
export default router;
