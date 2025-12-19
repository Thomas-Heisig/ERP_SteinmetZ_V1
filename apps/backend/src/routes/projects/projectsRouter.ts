// SPDX-License-Identifier: MIT
// apps/backend/src/routes/projects/projectsRouter.ts

/**
 * Projects Management Router
 *
 * Provides API for project tracking, task management,
 * milestones, and team collaboration.
 *
 * @module routes/projects
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { NotFoundError, ValidationError } from "../../types/errors.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import pino from "pino";
import db from "../../services/dbService.js";
import { randomUUID } from "crypto";

const router = Router();
const _logger = pino({ level: process.env.LOG_LEVEL || "info" }); // Reserved for future logging

// Validation schemas
const projectQuerySchema = z.object({
  status: z.enum(["planning", "active", "on_hold", "completed"]).optional(),
  search: z.string().optional(),
});

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z
    .enum(["planning", "active", "on_hold", "completed"])
    .default("planning"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  budget: z.number().min(0).optional(),
  client: z.string().optional(),
  manager: z.string().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

const createTaskSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "review", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assignee: z.string().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  estimatedHours: z.number().min(0).optional(),
});

/**
 * GET /api/projects
 * List all projects
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const query = projectQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw new ValidationError("Invalid query parameters", query.error.issues);
    }

    const { status, search } = query.data;

    let sql = "SELECT * FROM projects WHERE 1=1";
    const params: (string | number)[] = [];

    // Apply filters
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }
    if (search) {
      sql += " AND (name LIKE ? OR description LIKE ? OR client LIKE ?)";
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += " ORDER BY created_at DESC";

    const results = await db.all(sql, params);

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  }),
);

/**
 * GET /api/projects/:id
 * Get a specific project
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const project = await db.get("SELECT * FROM projects WHERE id = ?", [
      req.params.id,
    ]);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Get project tasks
    const projectTasks = await db.all(
      "SELECT * FROM project_tasks WHERE project_id = ? ORDER BY created_at",
      [req.params.id],
    );

    res.json({
      success: true,
      data: {
        ...project,
        tasks: projectTasks,
      },
    });
  }),
);

/**
 * POST /api/projects
 * Create a new project
 */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const validation = createProjectSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError(
        "Invalid project data",
        validation.error.issues,
      );
    }

    const id = `proj-${randomUUID()}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO projects (id, name, description, status, start_date, end_date, budget, client, manager, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validation.data.name,
        validation.data.description || null,
        validation.data.status,
        validation.data.startDate || null,
        validation.data.endDate || null,
        validation.data.budget || null,
        validation.data.client || null,
        validation.data.manager || null,
        now,
        now,
      ],
    );

    const project = await db.get("SELECT * FROM projects WHERE id = ?", [id]);

    res.status(201).json({
      success: true,
      data: project,
    });
  }),
);

/**
 * PUT /api/projects/:id
 * Update a project
 */
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await db.get("SELECT * FROM projects WHERE id = ?", [
      req.params.id,
    ]);

    if (!existing) {
      throw new NotFoundError("Project not found");
    }

    const validation = updateProjectSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError(
        "Invalid project data",
        validation.error.issues,
      );
    }

    const now = new Date().toISOString();
    const updates = validation.data;

    // Build dynamic UPDATE query
    const fields = Object.keys(updates);
    if (fields.length === 0) {
      return res.json({ success: true, data: existing });
    }

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = [
      ...fields.map((f) => (updates as Record<string, unknown>)[f]),
      now,
      req.params.id,
    ];

    await db.run(
      `UPDATE projects SET ${setClause}, updated_at = ? WHERE id = ?`,
      values,
    );

    const updated = await db.get("SELECT * FROM projects WHERE id = ?", [
      req.params.id,
    ]);

    res.json({
      success: true,
      data: updated,
    });
  }),
);

/**
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await db.get("SELECT * FROM projects WHERE id = ?", [
      req.params.id,
    ]);

    if (!existing) {
      throw new NotFoundError("Project not found");
    }

    // Delete project (cascades to tasks)
    await db.run("DELETE FROM projects WHERE id = ?", [req.params.id]);

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  }),
);

/**
 * GET /api/projects/:projectId/tasks
 * List all tasks for a project
 */
router.get(
  "/:projectId/tasks",
  asyncHandler(async (req: Request, res: Response) => {
    const project = await db.get("SELECT * FROM projects WHERE id = ?", [
      req.params.projectId,
    ]);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const projectTasks = await db.all(
      "SELECT * FROM project_tasks WHERE project_id = ? ORDER BY created_at",
      [req.params.projectId],
    );

    res.json({
      success: true,
      data: projectTasks,
      count: projectTasks.length,
    });
  }),
);

/**
 * POST /api/projects/tasks
 * Create a new task
 */
router.post(
  "/tasks",
  asyncHandler(async (req: Request, res: Response) => {
    const validation = createTaskSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError("Invalid task data", validation.error.issues);
    }

    const { projectId } = validation.data;
    const project = await db.get("SELECT * FROM projects WHERE id = ?", [
      projectId,
    ]);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const id = `task-${randomUUID()}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO project_tasks (id, project_id, title, description, status, priority, assignee, due_date, estimated_hours, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        validation.data.title,
        validation.data.description || null,
        validation.data.status,
        validation.data.priority,
        validation.data.assignee || null,
        validation.data.dueDate || null,
        validation.data.estimatedHours || null,
        now,
        now,
      ],
    );

    const task = await db.get("SELECT * FROM project_tasks WHERE id = ?", [id]);

    res.status(201).json({
      success: true,
      data: task,
    });
  }),
);

/**
 * PUT /api/projects/tasks/:id
 * Update a task
 */
router.put(
  "/tasks/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await db.get("SELECT * FROM project_tasks WHERE id = ?", [
      req.params.id,
    ]);

    if (!existing) {
      throw new NotFoundError("Task not found");
    }

    const now = new Date().toISOString();
    const updates = req.body;

    // Build dynamic UPDATE query
    const fields = Object.keys(updates);
    if (fields.length === 0) {
      return res.json({ success: true, data: existing });
    }

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = [...fields.map((f) => updates[f]), now, req.params.id];

    await db.run(
      `UPDATE project_tasks SET ${setClause}, updated_at = ? WHERE id = ?`,
      values,
    );

    const updated = await db.get("SELECT * FROM project_tasks WHERE id = ?", [
      req.params.id,
    ]);

    res.json({
      success: true,
      data: updated,
    });
  }),
);

/**
 * GET /api/projects/stats
 * Get project statistics
 */
router.get(
  "/stats",
  asyncHandler(async (req: Request, res: Response) => {
    const totalProjects = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM projects",
    );
    const activeProjects = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM projects WHERE status = 'active'",
    );
    const completedProjects = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM projects WHERE status = 'completed'",
    );
    const totalTasks = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM project_tasks",
    );
    const completedTasks = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM project_tasks WHERE status = 'done'",
    );
    const inProgressTasks = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM project_tasks WHERE status = 'in_progress'",
    );

    const stats = {
      totalProjects: totalProjects?.count || 0,
      activeProjects: activeProjects?.count || 0,
      completedProjects: completedProjects?.count || 0,
      totalTasks: totalTasks?.count || 0,
      completedTasks: completedTasks?.count || 0,
      inProgressTasks: inProgressTasks?.count || 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  }),
);

export default router;
