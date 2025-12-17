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
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "../../types/errors.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import pino from "pino";

const router = Router();
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

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

// In-memory storage
const projects = new Map<string, any>();
const tasks = new Map<string, any>();
const milestones = new Map<string, any>();
let projectCounter = 0;
let taskCounter = 0;

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
    let results = Array.from(projects.values());

    // Apply filters
    if (status) {
      results = results.filter((p) => p.status === status);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.client?.toLowerCase().includes(searchLower),
      );
    }

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
    const project = projects.get(req.params.id);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Get project tasks
    const projectTasks = Array.from(tasks.values()).filter(
      (t) => t.projectId === req.params.id,
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

    const id = `proj-${++projectCounter}`;
    const project = {
      id,
      ...validation.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.set(id, project);

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
    const project = projects.get(req.params.id);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const validation = updateProjectSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError(
        "Invalid project data",
        validation.error.issues,
      );
    }

    const updated = {
      ...project,
      ...validation.data,
      updatedAt: new Date().toISOString(),
    };

    projects.set(req.params.id, updated);

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
    if (!projects.has(req.params.id)) {
      throw new NotFoundError("Project not found");
    }

    projects.delete(req.params.id);

    // Also delete associated tasks
    for (const [taskId, task] of tasks.entries()) {
      if (task.projectId === req.params.id) {
        tasks.delete(taskId);
      }
    }

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
    const project = projects.get(req.params.projectId);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const projectTasks = Array.from(tasks.values()).filter(
      (t) => t.projectId === req.params.projectId,
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
    if (!projects.has(projectId)) {
      throw new NotFoundError("Project not found");
    }

    const id = `task-${++taskCounter}`;
    const task = {
      id,
      ...validation.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.set(id, task);

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
    const task = tasks.get(req.params.id);

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    const updated = {
      ...task,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    tasks.set(req.params.id, updated);

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
    const allProjects = Array.from(projects.values());
    const allTasks = Array.from(tasks.values());

    const stats = {
      totalProjects: projects.size,
      activeProjects: allProjects.filter((p) => p.status === "active").length,
      completedProjects: allProjects.filter((p) => p.status === "completed")
        .length,
      totalTasks: tasks.size,
      completedTasks: allTasks.filter((t) => t.status === "done").length,
      inProgressTasks: allTasks.filter((t) => t.status === "in_progress")
        .length,
    };

    res.json({
      success: true,
      data: stats,
    });
  }),
);

export default router;
