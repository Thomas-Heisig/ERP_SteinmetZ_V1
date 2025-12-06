// SPDX-License-Identifier: MIT
// apps/backend/src/routes/innovation/innovationRouter.ts

import { Router, Request, Response } from "express";
import db from "../../services/dbService.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { BadRequestError, NotFoundError } from "../../types/errors.js";

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
    console.error("❌ [Innovation] Failed to create ideas table:", error);
  }
}

// Initialisierung
ensureIdeasTable();

/**
 * GET /api/innovation/ideas
 * Liste aller Ideen mit optionalen Filtern
 */
router.get("/ideas", async (req: Request, res: Response) => {
  try {
    const {
      phase,
      priority,
      author,
      search,
      limit = "100",
      offset = "0",
    } = req.query;

    let sql = "SELECT * FROM ideas WHERE 1=1";
    const params: unknown[] = [];

    if (phase) {
      sql += " AND phase = ?";
      params.push(phase);
    }

    if (priority) {
      sql += " AND priority >= ?";
      params.push(Number(priority));
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
    params.push(Number(limit), Number(offset));

    const rows = await db.all<Record<string, unknown>>(sql, params);

    const ideas = rows.map(rowToIdea);

    res.json({
      success: true,
      data: ideas,
      total: ideas.length,
    });
  } catch (error) {
    console.error("❌ [Innovation] GET /ideas error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/innovation/ideas/:id
 * Einzelne Idee abrufen
 */
router.get("/ideas/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const row = await db.get<Record<string, unknown>>(
      "SELECT * FROM ideas WHERE id = ?",
      [id],
    );

    if (!row) {
      res.status(404).json({
        success: false,
        error: "Idea not found",
      });
      return;
    }

    res.json({
      success: true,
      data: rowToIdea(row),
    });
  } catch (error) {
    console.error("❌ [Innovation] GET /ideas/:id error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/innovation/ideas
 * Neue Idee erstellen (Schnelles "Parken")
 */
router.post("/ideas", async (req: Request, res: Response) => {
  try {
    const {
      title,
      description = "",
      phase = "parked",
      priority = 0,
      author = "anonymous",
      assignee,
      tags = [],
      milestone,
      estimatedEffort,
      dueDate,
    } = req.body;

    if (!title || title.trim() === "") {
      res.status(400).json({
        success: false,
        error: "Title is required",
      });
      return;
    }

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
  } catch (error) {
    console.error("❌ [Innovation] POST /ideas error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * PUT /api/innovation/ideas/:id
 * Idee aktualisieren
 */
router.put("/ideas/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingRow = await db.get<Record<string, unknown>>(
      "SELECT * FROM ideas WHERE id = ?",
      [id],
    );

    if (!existingRow) {
      res.status(404).json({
        success: false,
        error: "Idea not found",
      });
      return;
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
    } = req.body;

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
  } catch (error) {
    console.error("❌ [Innovation] PUT /ideas/:id error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * PATCH /api/innovation/ideas/:id/phase
 * Phase einer Idee ändern (Workflow)
 */
router.patch("/ideas/:id/phase", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { phase, comment, changedBy = "system" } = req.body;

    if (!phase || !IDEA_PHASES.includes(phase)) {
      res.status(400).json({
        success: false,
        error: `Invalid phase. Must be one of: ${IDEA_PHASES.join(", ")}`,
      });
      return;
    }

    const existingRow = await db.get<Record<string, unknown>>(
      "SELECT * FROM ideas WHERE id = ?",
      [id],
    );

    if (!existingRow) {
      res.status(404).json({
        success: false,
        error: "Idea not found",
      });
      return;
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
  } catch (error) {
    console.error("❌ [Innovation] PATCH /ideas/:id/phase error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * DELETE /api/innovation/ideas/:id
 * Idee löschen
 */
router.delete("/ideas/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.run("DELETE FROM ideas WHERE id = ?", [id]);

    if (result.changes === 0) {
      res.status(404).json({
        success: false,
        error: "Idea not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Idea deleted",
    });
  } catch (error) {
    console.error("❌ [Innovation] DELETE /ideas/:id error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/innovation/board
 * Kanban-Board Daten (Ideen gruppiert nach Phase)
 */
router.get("/board", async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error("❌ [Innovation] GET /board error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/innovation/roadmap
 * Roadmap-Daten für Gantt-Darstellung
 */
router.get("/roadmap", async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error("❌ [Innovation] GET /roadmap error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

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
