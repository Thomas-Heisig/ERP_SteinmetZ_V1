// SPDX-License-Identifier: MIT
// apps/backend/src/routes/projects/projectsRouter.ts

/**
 * Projects Router
 *
 * HTTP API endpoints for project management including projects, tasks,
 * time tracking, and project analytics.
 *
 * @module routes/projects
 * @category Routes
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { NotFoundError, ValidationError } from "../error/errors.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { createLogger } from "../../utils/logger.js";
import { projectsService } from "./projectsService.js";

const logger = createLogger("projects-router");
const router = Router();

/* ---------------------------------------------------------
   VALIDATION SCHEMAS
--------------------------------------------------------- */

const projectQuerySchema = z.object({
  status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]).optional(),
  search: z.string().optional(),
});

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]).default("planning"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
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
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  estimatedHours: z.number().min(0).optional(),
});

const timeEntrySchema = z.object({
  projectId: z.string(),
  taskId: z.string().optional(),
  userId: z.string(),
  hours: z.number().min(0.25).max(24),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().optional(),
});

/* ---------------------------------------------------------
   PROJECTS ENDPOINTS
--------------------------------------------------------- */

/**
 * GET /api/projects
 * List all projects with optional filtering
 *
 * @route GET /api/projects
 * @query {string} [status] - Filter by status
 * @query {string} [search] - Search projects by name, description, or client
 * @access Private
 * @returns {object} List of projects
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug({ query: req.query }, "GET /api/projects");

    const validation = projectQuerySchema.safeParse(req.query);
    if (!validation.success) {
      const issues = Object.fromEntries(
        validation.error.issues.map((issue) => [issue.path.join(".") || "root", issue.message])
      );
      throw new ValidationError("Invalid query parameters", issues);
    }

    const projects = await projectsService.getProjects(validation.data);

    logger.info({ count: projects.length }, "Projects retrieved");

    res.json({
      success: true,
      data: projects,
      count: projects.length,
    });
  })
);

/**
 * GET /api/projects/:id
 * Get a specific project with tasks
 *
 * @route GET /api/projects/:id
 * @param {string} id - Project ID
 * @access Private
 * @returns {object} Project with tasks
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug({ projectId: req.params.id }, "GET /api/projects/:id");

    const project = await projectsService.getProject(req.params.id);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    res.json({
      success: true,
      data: project,
    });
  })
);

/**
 * POST /api/projects
 * Create a new project
 *
 * @route POST /api/projects
 * @body {object} Project data (name required)
 * @access Private
 * @returns {object} Created project
 */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug({ body: req.body }, "POST /api/projects");

    const validation = createProjectSchema.safeParse(req.body);
    if (!validation.success) {
      const issues = Object.fromEntries(
        validation.error.issues.map((issue) => [issue.path.join(".") || "root", issue.message])
      );
      throw new ValidationError("Invalid project data", issues);
    }

    const project = await projectsService.createProject(validation.data);

    logger.info({ projectId: project.id, name: project.name }, "Project created");

    res.status(201).json({
      success: true,
      data: project,
    });
  })
);

/**
 * PUT /api/projects/:id
 * Update a project
 *
 * @route PUT /api/projects/:id
 * @param {string} id - Project ID
 * @body {object} Updated project data
 * @access Private
 * @returns {object} Updated project
 */
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug({ projectId: req.params.id, body: req.body }, "PUT /api/projects/:id");

    const validation = updateProjectSchema.safeParse(req.body);
    if (!validation.success) {
      const issues = Object.fromEntries(
        validation.error.issues.map((issue) => [issue.path.join(".") || "root", issue.message])
      );
      throw new ValidationError("Invalid project data", issues);
    }

    const project = await projectsService.updateProject(req.params.id, validation.data);

    logger.info({ projectId: req.params.id }, "Project updated");

    res.json({
      success: true,
      data: project,
    });
  })
);

/**
 * DELETE /api/projects/:id
 * Delete a project
 *
 * @route DELETE /api/projects/:id
 * @param {string} id - Project ID
 * @access Private
 * @returns {object} Deletion confirmation
 */
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug({ projectId: req.params.id }, "DELETE /api/projects/:id");

    const deleted = await projectsService.deleteProject(req.params.id);

    if (!deleted) {
      throw new NotFoundError("Project not found");
    }

    logger.info({ projectId: req.params.id }, "Project deleted");

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  })
);

/* ---------------------------------------------------------
   TASKS ENDPOINTS
--------------------------------------------------------- */

/**
 * GET /api/projects/:projectId/tasks
 * Get all tasks for a project
 *
 * @route GET /api/projects/:projectId/tasks
 * @param {string} projectId - Project ID
 * @access Private
 * @returns {object} List of tasks
 */
router.get(
  "/:projectId/tasks",
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug({ projectId: req.params.projectId }, "GET /api/projects/:projectId/tasks");

    const tasks = await projectsService.getProjectTasks(req.params.projectId);

    logger.info({ projectId: req.params.projectId, count: tasks.length }, "Tasks retrieved");

    res.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  })
);

/**
 * POST /api/projects/tasks
 * Create a new task
 *
 * @route POST /api/projects/tasks
 * @body {object} Task data
 * @access Private
 * @returns {object} Created task
 */
router.post(
  "/tasks",
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug({ body: req.body }, "POST /api/projects/tasks");

    const validation = createTaskSchema.safeParse(req.body);
    if (!validation.success) {
      const issues = Object.fromEntries(
        validation.error.issues.map((issue) => [issue.path.join(".") || "root", issue.message])
      );
      throw new ValidationError("Invalid task data", issues);
    }

    const task = await projectsService.createTask(validation.data);

    logger.info({ taskId: task.id, projectId: task.project_id }, "Task created");

    res.status(201).json({
      success: true,
      data: task,
    });
  })
);

/**
 * PUT /api/projects/tasks/:id
 * Update a task
 *
 * @route PUT /api/projects/tasks/:id
 * @param {string} id - Task ID
 * @body {object} Updated task data
 * @access Private
 * @returns {object} Updated task
 */
router.put(
  "/tasks/:id",
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug({ taskId: req.params.id, body: req.body }, "PUT /api/projects/tasks/:id");

    const task = await projectsService.updateTask(req.params.id, req.body);

    logger.info({ taskId: req.params.id }, "Task updated");

    res.json({
      success: true,
      data: task,
    });
  })
);

/**
 * DELETE /api/projects/tasks/:id
 * Delete a task
 *
 * @route DELETE /api/projects/tasks/:id
 * @param {string} id - Task ID
 * @access Private
 * @returns {object} Deletion confirmation
 */
router.delete(
  "/tasks/:id",
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug({ taskId: req.params.id }, "DELETE /api/projects/tasks/:id");

    const deleted = await projectsService.deleteTask(req.params.id);

    if (!deleted) {
      throw new NotFoundError("Task not found");
    }

    logger.info({ taskId: req.params.id }, "Task deleted");

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  })
);

/* ---------------------------------------------------------
   TIME TRACKING ENDPOINTS
--------------------------------------------------------- */

/**
 * GET /api/projects/:projectId/time-entries
 * Get all time entries for a project
 *
 * @route GET /api/projects/:projectId/time-entries
 * @param {string} projectId - Project ID
 * @access Private
 * @returns {object} List of time entries
 */
router.get(
  "/:projectId/time-entries",
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug({ projectId: req.params.projectId }, "GET /api/projects/:projectId/time-entries");

    const entries = await projectsService.getTimeEntries(req.params.projectId);

    logger.info({ projectId: req.params.projectId, count: entries.length }, "Time entries retrieved");

    res.json({
      success: true,
      data: entries,
      count: entries.length,
    });
  })
);

/**
 * POST /api/projects/time-entries
 * Log time spent on a task or project
 *
 * @route POST /api/projects/time-entries
 * @body {object} Time entry data
 * @access Private
 * @returns {object} Created time entry
 */
router.post(
  "/time-entries",
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug({ body: req.body }, "POST /api/projects/time-entries");

    const validation = timeEntrySchema.safeParse(req.body);
    if (!validation.success) {
      const issues = Object.fromEntries(
        validation.error.issues.map((issue) => [issue.path.join(".") || "root", issue.message])
      );
      throw new ValidationError("Invalid time entry data", issues);
    }

    const entry = await projectsService.logTimeEntry(validation.data);

    logger.info({ entryId: entry.id, projectId: entry.project_id }, "Time entry logged");

    res.status(201).json({
      success: true,
      data: entry,
    });
  })
);

/* ---------------------------------------------------------
   ANALYTICS ENDPOINTS
--------------------------------------------------------- */

/**
 * GET /api/projects/:projectId/analytics
 * Get project analytics and metrics
 *
 * @route GET /api/projects/:projectId/analytics
 * @param {string} projectId - Project ID
 * @access Private
 * @returns {object} Project analytics
 */
router.get(
  "/:projectId/analytics",
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug({ projectId: req.params.projectId }, "GET /api/projects/:projectId/analytics");

    const analytics = await projectsService.getProjectAnalytics(req.params.projectId);

    res.json({
      success: true,
      data: analytics,
    });
  })
);

/**
 * GET /api/projects/stats
 * Get global project statistics
 *
 * @route GET /api/projects/stats
 * @access Private
 * @returns {object} Project statistics
 */
router.get(
  "/stats",
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug("GET /api/projects/stats");

    const stats = await projectsService.getStatistics();

    logger.info(stats as unknown as Record<string, unknown>, "Project statistics retrieved");

    res.json({
      success: true,
      data: stats,
    });
  })
);

export default router;
