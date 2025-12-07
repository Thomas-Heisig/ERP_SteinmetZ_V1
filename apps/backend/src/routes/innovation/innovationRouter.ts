// SPDX-License-Identifier: MIT
// apps/backend/src/routes/innovation/innovationRouter.ts

import { Router, Request, Response } from "express";
import { z } from "zod";
import db from "../../services/dbService.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { BadRequestError, NotFoundError } from "../../types/errors.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("innovation");

const router = Router();

// Ideen-Phasen
export const IDEA_PHASES = [
  "parked", // Geparkt
  "analysis", // In Analyse
  "development", // In Entwicklung
  "testing", // Testing
  "completed", // Abgeschlossen
  "archived", // Archiviert
] as const;

export type IdeaPhase = (typeof IDEA_PHASES)[number];

export interface Idea {
  id: string;
  title: string;
  description: string;
  phase: IdeaPhase;
  priority: number;
  author: string;
  assignee?: string;
  tags: string[];
  attachments: string[];
  relatedTasks: string[];
  createdAt: string;
  updatedAt: string;
  phaseHistory: PhaseChange[];
  milestone?: string;
  estimatedEffort?: number; // in hours
  actualEffort?: number;
  dueDate?: string;
}

export interface PhaseChange {
  from: IdeaPhase;
  to: IdeaPhase;
  timestamp: string;
  comment?: string;
  changedBy?: string;
}

// Tabelle für Ideen erstellen
async function ensureIdeasTable(): Promise<void> {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ideas (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        phase TEXT DEFAULT 'parked',
        priority INTEGER DEFAULT 0,
        author TEXT,
        assignee TEXT,
        tags_json TEXT DEFAULT '[]',
        attachments_json TEXT DEFAULT '[]',
        related_tasks_json TEXT DEFAULT '[]',
        phase_history_json TEXT DEFAULT '[]',
        milestone TEXT,
        estimated_effort INTEGER,
        actual_effort INTEGER,
        due_date TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    await db.exec(`CREATE INDEX IF NOT EXISTS idx_ideas_phase ON ideas(phase)`);
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_ideas_priority ON ideas(priority)`,
    );
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_ideas_author ON ideas(author)`,
    );
  } catch (error) {
    logger.error({ error }, "Failed to create ideas table");
  }
}

// Initialisierung
ensureIdeasTable();

/* ========================================================================== */
/* Zod Validation Schemas                                                     */
/* ========================================================================== */

const ideaPhaseSchema = z.enum([
  "parked",
  "analysis",
  "development",
  "testing",
  "completed",
  "archived",
]);

const getIdeasQuerySchema = z.object({
  phase: ideaPhaseSchema.optional(),
  priority: z.coerce.number().int().min(0).optional(),
  author: z.string().min(1).max(100).optional(),
  search: z.string().min(1).max(200).optional(),
  limit: z.coerce.number().int().positive().optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const createIdeaSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().default(""),
  phase: ideaPhaseSchema.optional().default("parked"),
  priority: z.number().int().min(0).max(10).optional().default(0),
  author: z.string().min(1).max(100).optional().default("anonymous"),
  assignee: z.string().min(1).max(100).optional(),
  tags: z.array(z.string().max(50)).optional().default([]),
  milestone: z.string().max(100).optional(),
  estimatedEffort: z.number().positive().optional(),
  dueDate: z.string().datetime().optional(),
});

const updateIdeaSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  phase: ideaPhaseSchema.optional(),
  priority: z.number().int().min(0).max(10).optional(),
  assignee: z.string().min(1).max(100).optional(),
  tags: z.array(z.string().max(50)).optional(),
  attachments: z.array(z.string().max(500)).optional(),
  relatedTasks: z.array(z.string().uuid()).optional(),
  milestone: z.string().max(100).optional(),
  estimatedEffort: z.number().positive().optional(),
  actualEffort: z.number().positive().optional(),
  dueDate: z.string().datetime().optional(),
  phaseComment: z.string().max(500).optional(),
  changedBy: z.string().min(1).max(100).optional(),
});

const updatePhaseSchema = z.object({
  phase: ideaPhaseSchema,
  comment: z.string().max(500).optional(),
  changedBy: z.string().min(1).max(100).optional().default("system"),
});

/* ========================================================================== */
/* Routes                                                                     */
/* ========================================================================== */

/**
 * GET /api/innovation/ideas
 * Liste aller Ideen mit optionalen Filtern
 */
router.get(
  "/ideas",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = getIdeasQuerySchema.parse(req.query);
    const { phase, priority, author, search, limit, offset } = validated;

    let sql = "SELECT * FROM ideas WHERE 1=1";
    const params: unknown[] = [];

    if (phase) {
      sql += " AND phase = ?";
      params.push(phase);
    }

    if (priority !== undefined) {
      sql += " AND priority >= ?";
      params.push(priority);
    }

    if (author) {
      sql += " AND author = ?";
      params.push(author);
    }

    if (search) {
      sql += " AND (title LIKE ? OR description LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += " ORDER BY priority DESC, created_at DESC";
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = await db.all<Record<string, unknown>>(sql, params);
    const ideas = rows.map(rowToIdea);

    res.json({
      success: true,
      data: ideas,
      total: ideas.length,
    });
  }),
);

/**
 * GET /api/innovation/ideas/:id
 * Einzelne Idee abrufen
 */
router.get(
  "/ideas/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const row = await db.get<Record<string, unknown>>(
      "SELECT * FROM ideas WHERE id = ?",
      [id],
    );

    if (!row) {
      throw new NotFoundError("Idea not found");
    }

    res.json({
      success: true,
      data: rowToIdea(row),
    });
  }),
);

/**
 * POST /api/innovation/ideas
 * Neue Idee erstellen (Schnelles "Parken")
 */
router.post(
  "/ideas",
  asyncHandler(async (req: Request, res: Response) => {
    const validated = createIdeaSchema.parse(req.body);
    const {
      title,
      description,
      phase,
      priority,
      author,
      assignee,
      tags,
      milestone,
      estimatedEffort,
      dueDate,
    } = validated;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const phaseHistory: PhaseChange[] = [
      {
        from: "parked",
        to: phase,
        timestamp: now,
        comment: "Idee erstellt",
        changedBy: author,
      },
    ];

    await db.run(
      `INSERT INTO ideas (
        id, title, description, phase, priority, author, assignee,
        tags_json, attachments_json, related_tasks_json, phase_history_json,
        milestone, estimated_effort, due_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title.trim(),
        description,
        phase,
        priority,
        author,
        assignee ?? null,
        JSON.stringify(tags),
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify(phaseHistory),
        milestone ?? null,
        estimatedEffort ?? null,
        dueDate ?? null,
        now,
        now,
      ],
    );

    const newIdea: Idea = {
      id,
      title: title.trim(),
      description,
      phase,
      priority,
      author,
      assignee,
      tags,
      attachments: [],
      relatedTasks: [],
      phaseHistory,
      milestone,
      estimatedEffort,
      dueDate,
      createdAt: now,
      updatedAt: now,
    };

    res.status(201).json({
      success: true,
      data: newIdea,
    });
  }),
);

/**
 * PUT /api/innovation/ideas/:id
 * Idee aktualisieren
 */
router.put(
  "/ideas/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = updateIdeaSchema.parse(req.body);

    const existingRow = await db.get<Record<string, unknown>>(
      "SELECT * FROM ideas WHERE id = ?",
      [id],
    );

    if (!existingRow) {
      throw new NotFoundError("Idea not found");
    }

    const existing = rowToIdea(existingRow);
    const {
      title = existing.title,
      description = existing.description,
      phase = existing.phase,
      priority = existing.priority,
      assignee = existing.assignee,
      tags = existing.tags,
      attachments = existing.attachments,
      relatedTasks = existing.relatedTasks,
      milestone = existing.milestone,
      estimatedEffort = existing.estimatedEffort,
      actualEffort = existing.actualEffort,
      dueDate = existing.dueDate,
      phaseComment,
      changedBy = "system",
    } = validated;

    const now = new Date().toISOString();
    let phaseHistory = existing.phaseHistory;

    // Phase-Änderung tracken
    if (phase !== existing.phase) {
      phaseHistory = [
        ...phaseHistory,
        {
          from: existing.phase,
          to: phase,
          timestamp: now,
          comment: phaseComment,
          changedBy,
        },
      ];
    }

    await db.run(
      `UPDATE ideas SET
        title = ?, description = ?, phase = ?, priority = ?,
        assignee = ?, tags_json = ?, attachments_json = ?,
        related_tasks_json = ?, phase_history_json = ?,
        milestone = ?, estimated_effort = ?, actual_effort = ?,
        due_date = ?, updated_at = ?
      WHERE id = ?`,
      [
        title,
        description,
        phase,
        priority,
        assignee ?? null,
        JSON.stringify(tags),
        JSON.stringify(attachments),
        JSON.stringify(relatedTasks),
        JSON.stringify(phaseHistory),
        milestone ?? null,
        estimatedEffort ?? null,
        actualEffort ?? null,
        dueDate ?? null,
        now,
        id,
      ],
    );

    const updatedIdea: Idea = {
      id,
      title,
      description,
      phase,
      priority,
      author: existing.author,
      assignee,
      tags,
      attachments,
      relatedTasks,
      phaseHistory,
      milestone,
      estimatedEffort,
      actualEffort,
      dueDate,
      createdAt: existing.createdAt,
      updatedAt: now,
    };

    res.json({
      success: true,
      data: updatedIdea,
    });
  }),
);

/**
 * PATCH /api/innovation/ideas/:id/phase
 * Phase einer Idee ändern (Workflow)
 */
router.patch(
  "/ideas/:id/phase",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = updatePhaseSchema.parse(req.body);
    const { phase, comment, changedBy } = validated;

    const existingRow = await db.get<Record<string, unknown>>(
      "SELECT * FROM ideas WHERE id = ?",
      [id],
    );

    if (!existingRow) {
      throw new NotFoundError("Idea not found");
    }

    const existing = rowToIdea(existingRow);
    const now = new Date().toISOString();

    const phaseHistory: PhaseChange[] = [
      ...existing.phaseHistory,
      {
        from: existing.phase,
        to: phase,
        timestamp: now,
        comment,
        changedBy,
      },
    ];

    await db.run(
      `UPDATE ideas SET phase = ?, phase_history_json = ?, updated_at = ? WHERE id = ?`,
      [phase, JSON.stringify(phaseHistory), now, id],
    );

    res.json({
      success: true,
      data: {
        id,
        previousPhase: existing.phase,
        newPhase: phase,
        phaseHistory,
      },
    });
  }),
);

/**
 * DELETE /api/innovation/ideas/:id
 * Idee löschen
 */
router.delete(
  "/ideas/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await db.run("DELETE FROM ideas WHERE id = ?", [id]);

    if (result.changes === 0) {
      throw new NotFoundError("Idea not found");
    }

    res.json({
      success: true,
      message: "Idea deleted",
    });
  }),
);

/**
 * GET /api/innovation/board
 * Kanban-Board Daten (Ideen gruppiert nach Phase)
 */
router.get(
  "/board",
  asyncHandler(async (req: Request, res: Response) => {
    const rows = await db.all<Record<string, unknown>>(
      "SELECT * FROM ideas ORDER BY priority DESC, created_at DESC",
    );

    const ideas = rows.map(rowToIdea);

    const board: Record<IdeaPhase, Idea[]> = {
      parked: [],
      analysis: [],
      development: [],
      testing: [],
      completed: [],
      archived: [],
    };

    for (const idea of ideas) {
      board[idea.phase].push(idea);
    }

    res.json({
      success: true,
      data: board,
      stats: {
        total: ideas.length,
        byPhase: Object.fromEntries(
          IDEA_PHASES.map((phase) => [phase, board[phase].length]),
        ),
      },
    });
  }),
);

/**
 * GET /api/innovation/roadmap
 * Roadmap-Daten für Gantt-Darstellung
 */
router.get(
  "/roadmap",
  asyncHandler(async (req: Request, res: Response) => {
    const rows = await db.all<Record<string, unknown>>(
      `SELECT * FROM ideas 
       WHERE phase NOT IN ('archived', 'completed')
       ORDER BY due_date ASC, priority DESC`,
    );

    const ideas = rows.map(rowToIdea);

    // Gruppiert nach Meilenstein
    const milestones: Record<string, Idea[]> = {};
    const noMilestone: Idea[] = [];

    for (const idea of ideas) {
      if (idea.milestone) {
        if (!milestones[idea.milestone]) {
          milestones[idea.milestone] = [];
        }
        milestones[idea.milestone].push(idea);
      } else {
        noMilestone.push(idea);
      }
    }

    res.json({
      success: true,
      data: {
        milestones,
        noMilestone,
        total: ideas.length,
      },
    });
  }),
);

// Helper: Row zu Idea
function rowToIdea(row: Record<string, unknown>): Idea {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    phase: (row.phase as IdeaPhase) ?? "parked",
    priority: (row.priority as number) ?? 0,
    author: (row.author as string) ?? "anonymous",
    assignee: row.assignee as string | undefined,
    tags: JSON.parse((row.tags_json as string) ?? "[]"),
    attachments: JSON.parse((row.attachments_json as string) ?? "[]"),
    relatedTasks: JSON.parse((row.related_tasks_json as string) ?? "[]"),
    phaseHistory: JSON.parse((row.phase_history_json as string) ?? "[]"),
    milestone: row.milestone as string | undefined,
    estimatedEffort: row.estimated_effort as number | undefined,
    actualEffort: row.actual_effort as number | undefined,
    dueDate: row.due_date as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export default router;
