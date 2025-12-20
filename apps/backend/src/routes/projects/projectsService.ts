// SPDX-License-Identifier: MIT
// apps/backend/src/routes/projects/projectsService.ts

/**
 * Projects Service
 *
 * Business logic for project management including CRUD operations,
 * task management, time tracking, and project analytics.
 *
 * @module projects/projectsService
 */

import { v4 as uuidv4 } from "uuid";
import { createLogger } from "../../utils/logger.js";
import db from "../database/dbService.js";

const logger = createLogger("projects-service");

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "cancelled";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  client: string | null;
  manager: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  due_date: string | null;
  estimated_hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  project_id: string;
  task_id: string | null;
  user_id: string;
  hours: number;
  date: string;
  description: string | null;
  created_at: string;
}

export interface ProjectAnalytics {
  completion: number;
  budget_used: number;
  budget_remaining: number;
  hours_logged: number;
  hours_estimated: number;
  tasks_completed: number;
  tasks_remaining: number;
  on_schedule: boolean;
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
}

/* ---------------------------------------------------------
   PROJECT OPERATIONS
--------------------------------------------------------- */

export class ProjectsService {
  /**
   * Get all projects with optional filtering
   *
   * @param filters - Filter options (status, search)
   * @returns Array of projects
   */
  async getProjects(filters?: {
    status?: ProjectStatus;
    search?: string;
  }): Promise<Project[]> {
    let sql = "SELECT * FROM projects WHERE 1=1";
    const params: (string | number)[] = [];

    if (filters?.status) {
      sql += " AND status = ?";
      params.push(filters.status);
    }

    if (filters?.search) {
      sql += " AND (name LIKE ? OR description LIKE ? OR client LIKE ?)";
      const pattern = `%${filters.search}%`;
      params.push(pattern, pattern, pattern);
    }

    sql += " ORDER BY created_at DESC";

    try {
      const projects = await db.all<Project>(sql, params);
      logger.debug({ count: projects.length }, "Projects retrieved");
      return projects;
    } catch (error) {
      logger.error({ error }, "Failed to retrieve projects");
      throw error;
    }
  }

  /**
   * Get a single project by ID
   *
   * @param projectId - Project ID
   * @returns Project with tasks or null if not found
   */
  async getProject(projectId: string): Promise<(Project & { tasks: ProjectTask[] }) | null> {
    try {
      const project = await db.get<Project>(
        "SELECT * FROM projects WHERE id = ?",
        [projectId]
      );

      if (!project) {
        return null;
      }

      const tasks = await db.all<ProjectTask>(
        "SELECT * FROM project_tasks WHERE project_id = ? ORDER BY created_at",
        [projectId]
      );

      return { ...project, tasks };
    } catch (error) {
      logger.error({ error, projectId }, "Failed to retrieve project");
      throw error;
    }
  }

  /**
   * Create a new project
   *
   * @param data - Project data
   * @returns Created project
   */
  async createProject(data: {
    name: string;
    description?: string;
    status?: ProjectStatus;
    startDate?: string;
    endDate?: string;
    budget?: number;
    client?: string;
    manager?: string;
  }): Promise<Project> {
    const id = `proj-${uuidv4()}`;
    const now = new Date().toISOString();

    try {
      await db.run(
        `INSERT INTO projects (id, name, description, status, start_date, end_date, budget, client, manager, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.name,
          data.description || null,
          data.status || "planning",
          data.startDate || null,
          data.endDate || null,
          data.budget || null,
          data.client || null,
          data.manager || null,
          now,
          now,
        ]
      );

      const project = await db.get<Project>("SELECT * FROM projects WHERE id = ?", [id]);

      logger.info({ projectId: id, name: data.name }, "Project created");
      if (!project) {
        throw new Error("Failed to retrieve created project");
      }
      return project;
    } catch (error) {
      logger.error({ error, data }, "Failed to create project");
      throw error;
    }
  }

  /**
   * Update a project
   *
   * @param projectId - Project ID
   * @param data - Updated project data
   * @returns Updated project
   */
  async updateProject(
    projectId: string,
    data: Partial<Omit<Project, "id" | "created_at" | "updated_at">>
  ): Promise<Project> {
    try {
      const existing = await db.get<Project>(
        "SELECT * FROM projects WHERE id = ?",
        [projectId]
      );

      if (!existing) {
        throw new Error("Project not found");
      }

      const now = new Date().toISOString();
      const fields = Object.keys(data) as (keyof typeof data)[];
      const values: (string | number | null | undefined)[] = fields.map((f) => {
        const val = data[f];
        return val === undefined ? null : val;
      });

      if (fields.length === 0) {
        return existing;
      }

      const setClause = fields.map((f) => `${f} = ?`).join(", ");
      await db.run(
        `UPDATE projects SET ${setClause}, updated_at = ? WHERE id = ?`,
        [...values, now, projectId] as (string | number | null)[]
      );

      const updated = await db.get<Project>(
        "SELECT * FROM projects WHERE id = ?",
        [projectId]
      );

      if (!updated) {
        throw new Error("Failed to retrieve updated project");
      }
      logger.info({ projectId }, "Project updated");
      return updated;
    } catch (error) {
      logger.error({ error, projectId }, "Failed to update project");
      throw error;
    }
  }

  /**
   * Delete a project
   *
   * @param projectId - Project ID
   * @returns true if deleted, false if not found
   */
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      const existing = await db.get<Project>(
        "SELECT * FROM projects WHERE id = ?",
        [projectId]
      );

      if (!existing) {
        return false;
      }

      // Delete cascading data
      await db.run("DELETE FROM project_time_entries WHERE project_id = ?", [projectId]);
      await db.run("DELETE FROM project_tasks WHERE project_id = ?", [projectId]);
      await db.run("DELETE FROM projects WHERE id = ?", [projectId]);

      logger.info({ projectId }, "Project deleted");
      return true;
    } catch (error) {
      logger.error({ error, projectId }, "Failed to delete project");
      throw error;
    }
  }

  /* ---------------------------------------------------------
     TASK OPERATIONS
  --------------------------------------------------------- */

  /**
   * Get all tasks for a project
   *
   * @param projectId - Project ID
   * @returns Array of tasks
   */
  async getProjectTasks(projectId: string): Promise<ProjectTask[]> {
    try {
      const tasks = await db.all<ProjectTask>(
        "SELECT * FROM project_tasks WHERE project_id = ? ORDER BY created_at",
        [projectId]
      );

      return tasks;
    } catch (error) {
      logger.error({ error, projectId }, "Failed to retrieve project tasks");
      throw error;
    }
  }

  /**
   * Create a new task
   *
   * @param data - Task data
   * @returns Created task
   */
  async createTask(data: {
    projectId: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee?: string;
    dueDate?: string;
    estimatedHours?: number;
  }): Promise<ProjectTask> {
    const id = `task-${uuidv4()}`;
    const now = new Date().toISOString();

    try {
      // Verify project exists
      const project = await db.get("SELECT id FROM projects WHERE id = ?", [
        data.projectId,
      ]);

      if (!project) {
        throw new Error("Project not found");
      }

      await db.run(
        `INSERT INTO project_tasks (id, project_id, title, description, status, priority, assignee, due_date, estimated_hours, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.projectId,
          data.title,
          data.description || null,
          data.status || "todo",
          data.priority || "medium",
          data.assignee || null,
          data.dueDate || null,
          data.estimatedHours || null,
          now,
          now,
        ]
      );

      const task = await db.get<ProjectTask>("SELECT * FROM project_tasks WHERE id = ?", [id]);

      if (!task) {
        throw new Error("Failed to retrieve created task");
      }
      logger.info({ taskId: id, projectId: data.projectId }, "Task created");
      return task;
    } catch (error) {
      logger.error({ error, data }, "Failed to create task");
      throw error;
    }
  }

  /**
   * Update a task
   *
   * @param taskId - Task ID
   * @param data - Updated task data
   * @returns Updated task
   */
  async updateTask(taskId: string, data: Partial<ProjectTask>): Promise<ProjectTask> {
    try {
      const existing = await db.get<ProjectTask>(
        "SELECT * FROM project_tasks WHERE id = ?",
        [taskId]
      );

      if (!existing) {
        throw new Error("Task not found");
      }

      const now = new Date().toISOString();
      const fields = Object.keys(data) as (keyof typeof data)[];
      const values: (string | number | null | undefined)[] = fields.map((f) => {
        const val = data[f];
        return val === undefined ? null : val;
      });

      if (fields.length === 0) {
        return existing;
      }

      const setClause = fields.map((f) => `${f} = ?`).join(", ");
      await db.run(
        `UPDATE project_tasks SET ${setClause}, updated_at = ? WHERE id = ?`,
        [...values, now, taskId] as (string | number | null)[]
      );

      const updated = await db.get<ProjectTask>(
        "SELECT * FROM project_tasks WHERE id = ?",
        [taskId]
      );

      if (!updated) {
        throw new Error("Failed to retrieve updated task");
      }
      logger.info({ taskId }, "Task updated");
      return updated;
    } catch (error) {
      logger.error({ error, taskId }, "Failed to update task");
      throw error;
    }
  }

  /**
   * Delete a task
   *
   * @param taskId - Task ID
   * @returns true if deleted, false if not found
   */
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const existing = await db.get("SELECT id FROM project_tasks WHERE id = ?", [taskId]);

      if (!existing) {
        return false;
      }

      await db.run("DELETE FROM project_time_entries WHERE task_id = ?", [taskId]);
      await db.run("DELETE FROM project_tasks WHERE id = ?", [taskId]);

      logger.info({ taskId }, "Task deleted");
      return true;
    } catch (error) {
      logger.error({ error, taskId }, "Failed to delete task");
      throw error;
    }
  }

  /* ---------------------------------------------------------
     TIME TRACKING
  --------------------------------------------------------- */

  /**
   * Log time entry
   *
   * @param data - Time entry data
   * @returns Created time entry
   */
  async logTimeEntry(data: {
    projectId: string;
    taskId?: string;
    userId: string;
    hours: number;
    date: string;
    description?: string;
  }): Promise<TimeEntry> {
    const id = `time-${uuidv4()}`;
    const now = new Date().toISOString();

    try {
      await db.run(
        `INSERT INTO project_time_entries (id, project_id, task_id, user_id, hours, date, description, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.projectId,
          data.taskId || null,
          data.userId,
          data.hours,
          data.date,
          data.description || null,
          now,
        ]
      );

      const entry = await db.get<TimeEntry>(
        "SELECT * FROM project_time_entries WHERE id = ?",
        [id]
      );

      if (!entry) {
        throw new Error("Failed to retrieve logged time entry");
      }
      logger.info({ entryId: id, projectId: data.projectId }, "Time entry logged");
      return entry;
    } catch (error) {
      logger.error({ error, data }, "Failed to log time entry");
      throw error;
    }
  }

  /**
   * Get time entries for a project
   *
   * @param projectId - Project ID
   * @returns Array of time entries
   */
  async getTimeEntries(projectId: string): Promise<TimeEntry[]> {
    try {
      const entries = await db.all<TimeEntry>(
        "SELECT * FROM project_time_entries WHERE project_id = ? ORDER BY date DESC",
        [projectId]
      );

      return entries;
    } catch (error) {
      logger.error({ error, projectId }, "Failed to retrieve time entries");
      throw error;
    }
  }

  /* ---------------------------------------------------------
     ANALYTICS
  --------------------------------------------------------- */

  /**
   * Get project analytics
   *
   * @param projectId - Project ID
   * @returns Project analytics and metrics
   */
  async getProjectAnalytics(projectId: string): Promise<ProjectAnalytics> {
    try {
      const project = await db.get<Project>(
        "SELECT * FROM projects WHERE id = ?",
        [projectId]
      );

      if (!project) {
        throw new Error("Project not found");
      }

      const tasks = await db.all<ProjectTask>(
        "SELECT * FROM project_tasks WHERE project_id = ?",
        [projectId]
      );

      const timeEntries = await db.all<TimeEntry>(
        "SELECT * FROM project_time_entries WHERE project_id = ?",
        [projectId]
      );

      const completedTasks = tasks.filter((t) => t.status === "done").length;
      const remainingTasks = tasks.length - completedTasks;
      const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
      const totalLoggedHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);

      const completion =
        tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

      const budgetUsed = project.budget
        ? Math.min(totalLoggedHours * 100, project.budget) // Assume $100/hour
        : 0;

      const onSchedule =
        !project.end_date ||
        new Date(project.end_date) > new Date() ||
        completion >= 90;

      return {
        completion: Math.round(completion * 10) / 10,
        budget_used: Math.round(budgetUsed * 100) / 100,
        budget_remaining: (project.budget || 0) - budgetUsed,
        hours_logged: totalLoggedHours,
        hours_estimated: totalEstimatedHours,
        tasks_completed: completedTasks,
        tasks_remaining: remainingTasks,
        on_schedule: onSchedule,
      };
    } catch (error) {
      logger.error({ error, projectId }, "Failed to get project analytics");
      throw error;
    }
  }

  /**
   * Get global project statistics
   *
   * @returns Project statistics
   */
  async getStatistics(): Promise<ProjectStats> {
    try {
      const totalProjects =
        (await db.get<{ count: number }>(
          "SELECT COUNT(*) as count FROM projects"
        ))?.count || 0;

      const activeProjects =
        (await db.get<{ count: number }>(
          "SELECT COUNT(*) as count FROM projects WHERE status = 'active'"
        ))?.count || 0;

      const completedProjects =
        (await db.get<{ count: number }>(
          "SELECT COUNT(*) as count FROM projects WHERE status = 'completed'"
        ))?.count || 0;

      const totalTasks =
        (await db.get<{ count: number }>(
          "SELECT COUNT(*) as count FROM project_tasks"
        ))?.count || 0;

      const completedTasks =
        (await db.get<{ count: number }>(
          "SELECT COUNT(*) as count FROM project_tasks WHERE status = 'done'"
        ))?.count || 0;

      const inProgressTasks =
        (await db.get<{ count: number }>(
          "SELECT COUNT(*) as count FROM project_tasks WHERE status = 'in_progress'"
        ))?.count || 0;

      logger.debug("Project statistics calculated");

      return {
        total_projects: totalProjects,
        active_projects: activeProjects,
        completed_projects: completedProjects,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        in_progress_tasks: inProgressTasks,
      };
    } catch (error) {
      logger.error({ error }, "Failed to get project statistics");
      throw error;
    }
  }
}

export const projectsService = new ProjectsService();
