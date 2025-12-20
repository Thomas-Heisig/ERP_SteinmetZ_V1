# Projects Module Documentation

> Comprehensive project management system with task tracking, time logging, and project analytics.

**Module Status:** ✅ Production Ready  
**Last Updated:** 2025-12-20  
**Version:** 1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Service Layer](#service-layer)
7. [Integration Guide](#integration-guide)
8. [Examples](#examples)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)
12. [Changelog](#changelog)

---

## Overview

The Projects Module provides a complete project management solution integrated into the ERP SteinmetZ system. It enables:

- **Project Lifecycle Management** - from planning to completion
- **Task Management** - granular task tracking with priorities and status
- **Time Tracking** - log work time against projects/tasks
- **Project Analytics** - real-time metrics and progress tracking
- **Team Collaboration** - assign tasks, track progress, manage deadlines

### Key Capabilities

| Feature | Capability | Status |
| ------- | ---------- | ------ |

| CRUD Operations | Create, read, update, delete projects and tasks | ✅ Implemented |
| Time Tracking | Log hours against projects/tasks with dates | ✅ Implemented |
| Project Analytics | Completion %, budget tracking, hours metrics | ✅ Implemented |
| Task Management | Status, priority, assignee, due dates, estimates | ✅ Implemented |
| Cascading Deletes | Delete project → removes all tasks and entries | ✅ Implemented |
| Global Statistics | Aggregate project and task statistics | ✅ Implemented |
| Type Safety | Full TypeScript interfaces for all data | ✅ Implemented |
| Structured Logging | Pino logging with context | ✅ Implemented |
| Error Handling | Custom error classes with validation | ✅ Implemented |

---

## Features

### 1. Project Lifecycle

Each project moves through defined states:

```text
planning → active → on_hold → completed
                 ↘          ↙
                  cancelled
```

**Status Meanings:**

- **planning** - Project is being prepared, not yet active
- **active** - Project is in progress
- **on_hold** - Work temporarily paused
- **completed** - Project finished successfully
- **cancelled** - Project abandoned

### 2. Task Management

Tasks support granular status and priority tracking:

**Task Status:**

```text
todo → in_progress → review → done
```

**Task Priority:**

```txt
low < medium < high < urgent
```

**Task Features:**

- Estimated hours for planning
- Due date tracking
- Assignee management
- Cascading deletion with project

### 3. Time Tracking

Log work time with:

- Project and optional task association
- User identification
- Date tracking
- Hour precision (0.25 hour minimum)
- Description for context

**Example Time Entries:**

```text
- Project: E-Commerce Website
  Task: Frontend Development
  User: john.doe
  Hours: 8.5
  Date: 2025-12-20
```

### 4. Analytics Dashboard

Real-time project metrics:

- **Completion %** - Based on done vs. total tasks
- **Budget Tracking** - Spent vs. budgeted
- **Hours Metrics** - Logged vs. estimated hours
- **Task Distribution** - Breakdown by status
- **Schedule Status** - On-track vs. overdue

---

## Architecture

### Module Structure

```text
projects/
├── projectsRouter.ts          # HTTP API layer (REST endpoints)
├── projectsService.ts         # Business logic layer
├── types.ts                   # TypeScript interfaces
├── docs/
│   └── README.md             # Basic documentation (deprecated)
└── README_NEW.md             # This file
```

### Layered Architecture

```chart
┌─────────────────────────────────────┐
│         HTTP Requests               │
│      (Express Route Handlers)        │
└────────────┬────────────────────────┘
             │ ↓
┌─────────────────────────────────────┐
│     projectsRouter.ts               │
│  • Request validation (Zod)         │
│  • HTTP response formatting         │
│  • Error handling                   │
└────────────┬────────────────────────┘
             │ ↓
┌─────────────────────────────────────┐
│     projectsService.ts              │
│  • Business logic                   │
│  • Database operations              │
│  • Data transformations             │
│  • Structured logging               │
└────────────┬────────────────────────┘
             │ ↓
┌─────────────────────────────────────┐
│      SQLite Database                │
│  • projects table                   │
│  • project_tasks table              │
│  • project_time_entries table       │
└─────────────────────────────────────┘
```

### Design Patterns

**Service Layer Pattern:**

- Router delegates all business logic to service
- Service encapsulates database operations
- Each service method has single responsibility

**Error Handling Pattern:**

- Custom error classes (NotFoundError, ValidationError)
- Try-catch in service methods
- Structured error responses

**Logging Pattern:**

- Pino logger with module context
- Debug, Info, Error levels
- Contextual data included with logs

**Type Safety Pattern:**

- TypeScript interfaces for all data structures
- Zod validation for incoming data
- Type inference for database queries

---

## API Endpoints

### Projects

#### List Projects

```http
GET /api/projects?status=active&search=website

Query Parameters:
  status: planning | active | on_hold | completed | cancelled (optional)
  search: string to search name/description/client (optional)

Response:
{
  "success": true,
  "data": [
    {
      "id": "proj-123abc",
      "name": "E-Commerce Website",
      "description": "Build new e-commerce platform",
      "status": "active",
      "start_date": "2025-01-01",
      "end_date": "2025-06-30",
      "budget": 50000,
      "client": "TechCorp Inc.",
      "manager": "jane.smith",
      "created_at": "2025-12-20T10:30:00Z",
      "updated_at": "2025-12-20T14:20:00Z"
    }
  ],
  "count": 1
}
```

#### Get Project

```http
GET /api/projects/proj-123abc

Response:
{
  "success": true,
  "data": {
    "id": "proj-123abc",
    "name": "E-Commerce Website",
    "description": "Build new e-commerce platform",
    "status": "active",
    "start_date": "2025-01-01",
    "end_date": "2025-06-30",
    "budget": 50000,
    "client": "TechCorp Inc.",
    "manager": "jane.smith",
    "created_at": "2025-12-20T10:30:00Z",
    "updated_at": "2025-12-20T14:20:00Z"
  }
}
```

#### Create Project

```http
POST /api/projects

Content-Type: application/json

{
  "name": "E-Commerce Website",
  "description": "Build new e-commerce platform",
  "status": "planning",
  "startDate": "2025-01-01",
  "endDate": "2025-06-30",
  "budget": 50000,
  "client": "TechCorp Inc.",
  "manager": "jane.smith"
}

Response:
{
  "success": true,
  "data": {
    "id": "proj-123abc",
    "name": "E-Commerce Website",
    ...
  }
}
```

#### Update Project

```http
PUT /api/projects/proj-123abc

Content-Type: application/json

{
  "status": "active",
  "budget": 55000
}

Response:
{
  "success": true,
  "data": {
    "id": "proj-123abc",
    "status": "active",
    "budget": 55000,
    ...
  }
}
```

#### Delete Project

```http
DELETE /api/projects/proj-123abc

Response:
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### Tasks

#### List Project Tasks

```http
GET /api/projects/proj-123abc/tasks

Response:
{
  "success": true,
  "data": [
    {
      "id": "task-456def",
      "project_id": "proj-123abc",
      "title": "Design Database Schema",
      "description": "Design and optimize database structure",
      "status": "in_progress",
      "priority": "high",
      "assignee": "bob.wilson",
      "due_date": "2025-01-15",
      "estimated_hours": 24,
      "created_at": "2025-12-20T10:30:00Z",
      "updated_at": "2025-12-20T14:20:00Z"
    }
  ],
  "count": 1
}
```

#### Create Task

```http
POST /api/projects/tasks

Content-Type: application/json

{
  "projectId": "proj-123abc",
  "title": "Design Database Schema",
  "description": "Design and optimize database structure",
  "status": "todo",
  "priority": "high",
  "assignee": "bob.wilson",
  "dueDate": "2025-01-15",
  "estimatedHours": 24
}

Response:
{
  "success": true,
  "data": {
    "id": "task-456def",
    ...
  }
}
```

#### Update Task

```http
PUT /api/projects/tasks/task-456def

Content-Type: application/json

{
  "status": "review",
  "priority": "urgent"
}

Response:
{
  "success": true,
  "data": {
    "id": "task-456def",
    "status": "review",
    "priority": "urgent",
    ...
  }
}
```

#### Delete Task

```http
DELETE /api/projects/tasks/task-456def

Response:
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### Time Tracking

#### List Time Entries

```http
GET /api/projects/proj-123abc/time-entries

Response:
{
  "success": true,
  "data": [
    {
      "id": "time-789ghi",
      "project_id": "proj-123abc",
      "task_id": "task-456def",
      "user_id": "bob.wilson",
      "hours": 8.5,
      "date": "2025-12-20",
      "description": "Database schema design and optimization",
      "created_at": "2025-12-20T18:00:00Z"
    }
  ],
  "count": 1
}
```

#### Log Time Entry

```http
POST /api/projects/time-entries

Content-Type: application/json

{
  "projectId": "proj-123abc",
  "taskId": "task-456def",
  "userId": "bob.wilson",
  "hours": 8.5,
  "date": "2025-12-20",
  "description": "Database schema design and optimization"
}

Response:
{
  "success": true,
  "data": {
    "id": "time-789ghi",
    ...
  }
}
```

### Analytics

#### Get Project Analytics

```http
GET /api/projects/proj-123abc/analytics

Response:
{
  "success": true,
  "data": {
    "project_id": "proj-123abc",
    "project_name": "E-Commerce Website",
    "status": "active",
    "completion_percentage": 35.5,
    "tasks": {
      "total": 20,
      "completed": 7,
      "in_progress": 8,
      "in_review": 2,
      "not_started": 3
    },
    "hours": {
      "estimated": 240,
      "logged": 85,
      "remaining": 155
    },
    "budget": {
      "total": 50000,
      "spent": 15000,
      "remaining": 35000
    },
    "timeline": {
      "start_date": "2025-01-01",
      "end_date": "2025-06-30",
      "days_elapsed": 354,
      "days_remaining": 161,
      "on_schedule": true
    }
  }
}
```

#### Get Global Statistics

```http
GET /api/projects/stats

Response:
{
  "success": true,
  "data": {
    "projects": {
      "total": 15,
      "active": 8,
      "completed": 5,
      "on_hold": 1,
      "planning": 1
    },
    "tasks": {
      "total": 128,
      "completed": 42,
      "in_progress": 56,
      "not_started": 30
    },
    "completion_rate": 32.8
  }
}
```

---

## Database Schema

### Projects Table

```sql
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  start_date TEXT,
  end_date TEXT,
  budget REAL,
  client TEXT,
  manager TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_manager ON projects(manager);
```

**Fields:**

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |

| id | TEXT | ✓ | UUID formatted |
| name | TEXT | ✓ | Max 200 characters |
| description | TEXT | | Detailed project info |
| status | TEXT | | Enum: planning, active, on_hold, completed, cancelled |
| start_date | TEXT | | ISO 8601 date format |
| end_date | TEXT | | ISO 8601 date format |
| budget | REAL | | Total budget in currency |
| client | TEXT | | Client/customer name |
| manager | TEXT | | Project manager user ID |
| created_at | TEXT | ✓ | ISO 8601 timestamp |
| updated_at | TEXT | ✓ | ISO 8601 timestamp |

### Project Tasks Table

```sql
CREATE TABLE IF NOT EXISTS project_tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
  assignee TEXT,
  due_date TEXT,
  estimated_hours REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_project_tasks_status ON project_tasks(status);
CREATE INDEX idx_project_tasks_assignee ON project_tasks(assignee);
```

**Fields:**

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |

| id | TEXT | ✓ | UUID formatted |
| project_id | TEXT | ✓ | Foreign key to projects |
| title | TEXT | ✓ | Max 200 characters |
| description | TEXT | | Detailed task description |
| status | TEXT | | Enum: todo, in_progress, review, done |
| priority | TEXT | | Enum: low, medium, high, urgent |
| assignee | TEXT | | User ID of assignee |
| due_date | TEXT | | ISO 8601 date format |
| estimated_hours | REAL | | Hours needed to complete |
| created_at | TEXT | ✓ | ISO 8601 timestamp |
| updated_at | TEXT | ✓ | ISO 8601 timestamp |

### Project Time Entries Table

```sql
CREATE TABLE IF NOT EXISTS project_time_entries (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  task_id TEXT,
  user_id TEXT NOT NULL,
  hours REAL NOT NULL CHECK(hours > 0),
  date TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE SET NULL
);

CREATE INDEX idx_time_entries_project ON project_time_entries(project_id);
CREATE INDEX idx_time_entries_task ON project_time_entries(task_id);
CREATE INDEX idx_time_entries_user ON project_time_entries(user_id);
CREATE INDEX idx_time_entries_date ON project_time_entries(date);
```

**Fields:**

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |

| id | TEXT | ✓ | UUID formatted |
| project_id | TEXT | ✓ | Foreign key to projects |
| task_id | TEXT | | Optional foreign key to project_tasks |
| user_id | TEXT | ✓ | User who logged time |
| hours | REAL | ✓ | Minimum 0.25, max 24 |
| date | TEXT | ✓ | ISO 8601 date format |
| description | TEXT | | Context for time entry |
| created_at | TEXT | ✓ | ISO 8601 timestamp |

---

## Service Layer

### ProjectsService Class

The `ProjectsService` class encapsulates all project management business logic.

#### Methods Overview

```typescript
// Project Operations
async getProjects(filters?: { status?: string; search?: string }): Promise<Project[]>
async getProject(id: string): Promise<Project | null>
async createProject(data: Partial<Project>): Promise<Project>
async updateProject(id: string, data: Partial<Project>): Promise<Project>
async deleteProject(id: string): Promise<boolean>

// Task Operations
async getProjectTasks(projectId: string): Promise<ProjectTask[]>
async createTask(data: {
  projectId: string;
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
  estimatedHours?: number;
}): Promise<ProjectTask>
async updateTask(id: string, data: Partial<ProjectTask>): Promise<ProjectTask>
async deleteTask(id: string): Promise<boolean>

// Time Tracking
async logTimeEntry(data: {
  projectId: string;
  taskId?: string;
  userId: string;
  hours: number;
  date: string;
  description?: string;
}): Promise<TimeEntry>
async getTimeEntries(projectId: string): Promise<TimeEntry[]>

// Analytics
async getProjectAnalytics(projectId: string): Promise<ProjectAnalytics>
async getStatistics(): Promise<ProjectStats>
```

#### Key Methods

**getProjects(filters)!**

Retrieves all projects with optional filtering and search.

```typescript
const activeProjects = await projectsService.getProjects({
  status: "active",
});

const searchResults = await projectsService.getProjects({
  search: "website",
});
```

**getProjectAnalytics(projectId)!**

Calculates comprehensive project metrics including:

- Completion percentage (based on tasks)
- Task distribution by status
- Hour metrics (logged vs. estimated)
- Budget metrics (spent vs. budgeted)
- Timeline tracking (on schedule boolean)

```typescript
const analytics = await projectsService.getProjectAnalytics("proj-123abc");
// Returns: ProjectAnalytics with completion %, tasks, hours, budget, timeline
```

**getStatistics()!**

Returns global project and task statistics.

```typescript
const stats = await projectsService.getStatistics();
// Returns: {
//   projects: { total, active, completed, on_hold, planning },
//   tasks: { total, completed, in_progress, not_started },
//   completion_rate: percentage
// }
```

### Type Definitions

```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  start_date?: string;
  end_date?: string;
  budget?: number;
  client?: string;
  manager?: string;
  created_at: string;
  updated_at: string;
}

interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  due_date?: string;
  estimated_hours?: number;
  created_at: string;
  updated_at: string;
}

interface TimeEntry {
  id: string;
  project_id: string;
  task_id?: string;
  user_id: string;
  hours: number;
  date: string;
  description?: string;
  created_at: string;
}

interface ProjectAnalytics {
  project_id: string;
  project_name: string;
  status: string;
  completion_percentage: number;
  tasks: {
    total: number;
    completed: number;
    in_progress: number;
    in_review: number;
    not_started: number;
  };
  hours: {
    estimated: number;
    logged: number;
    remaining: number;
  };
  budget: {
    total: number;
    spent: number;
    remaining: number;
  };
  timeline: {
    start_date?: string;
    end_date?: string;
    days_elapsed: number;
    days_remaining: number;
    on_schedule: boolean;
  };
}

interface ProjectStats {
  projects: {
    total: number;
    active: number;
    completed: number;
    on_hold: number;
    planning: number;
  };
  tasks: {
    total: number;
    completed: number;
    in_progress: number;
    not_started: number;
  };
  completion_rate: number;
}
```

---

## Integration Guide

### Basic Usage

#### Create and Track a Project

```typescript
import { projectsService } from "@/routes/projects/projectsService";

// 1. Create project
const project = await projectsService.createProject({
  name: "Mobile App Development",
  description: "Develop iOS and Android app",
  status: "planning",
  startDate: "2025-01-01",
  endDate: "2025-06-30",
  budget: 75000,
  client: "StartupXYZ",
  manager: "john.smith",
});

// 2. Create tasks
const task1 = await projectsService.createTask({
  projectId: project.id,
  title: "Design UI/UX",
  priority: "high",
  estimatedHours: 120,
  assignee: "alice.designer",
});

const task2 = await projectsService.createTask({
  projectId: project.id,
  title: "Backend API Development",
  priority: "high",
  estimatedHours: 200,
  assignee: "bob.developer",
});

// 3. Log time
await projectsService.logTimeEntry({
  projectId: project.id,
  taskId: task1.id,
  userId: "alice.designer",
  hours: 8.5,
  date: "2025-12-20",
  description: "Completed wireframes and style guide",
});

// 4. Get analytics
const analytics = await projectsService.getProjectAnalytics(project.id);
console.log(`Completion: ${analytics.completion_percentage}%`);
console.log(
  `Hours logged: ${analytics.hours.logged}/${analytics.hours.estimated}`,
);

// 5. Update task status
await projectsService.updateTask(task1.id, {
  status: "done",
});

// 6. Get statistics
const stats = await projectsService.getStatistics();
console.log(`Total projects: ${stats.projects.total}`);
console.log(`Active projects: ${stats.projects.active}`);
```

### Integration with Other Modules

#### From Dashboard Module

```typescript
// Display project overview
const projects = await projectsService.getProjects({ status: "active" });
const stats = await projectsService.getStatistics();

// Render dashboard widgets
renderProjectWidget({
  activeProjects: stats.projects.active,
  completedProjects: stats.projects.completed,
  taskCompletion: stats.completion_rate,
});
```

#### From Reporting Module

```typescript
// Generate project status report
const allProjects = await projectsService.getProjects();

const report = allProjects.map((project) => ({
  name: project.name,
  status: project.status,
  analytics: await projectsService.getProjectAnalytics(project.id),
}));

// Export report
exportPDF(report);
```

#### From HR Module

```typescript
// Track employee utilization
const timeEntries = await projectsService.getTimeEntries(projectId);

const utilization = timeEntries.reduce(
  (acc, entry) => {
    acc[entry.user_id] = (acc[entry.user_id] || 0) + entry.hours;
    return acc;
  },
  {} as Record<string, number>,
);

// Display in HR dashboard
```

---

## Examples

### Example 1: Complete Project Workflow

```typescript
// 1. Plan: Create project
const website = await projectsService.createProject({
  name: "Company Website Redesign",
  description: "Modernize company website",
  status: "planning",
  startDate: "2025-01-15",
  endDate: "2025-03-31",
  budget: 25000,
  client: "Internal",
  manager: "sarah.manager",
});

// 2. Plan: Create tasks
const designTask = await projectsService.createTask({
  projectId: website.id,
  title: "Design New Layout",
  priority: "high",
  estimatedHours: 40,
  assignee: "designer@company.com",
  dueDate: "2025-02-15",
});

const devTask = await projectsService.createTask({
  projectId: website.id,
  title: "Implement Frontend",
  priority: "high",
  estimatedHours: 80,
  assignee: "dev@company.com",
  dueDate: "2025-03-15",
});

// 3. Execute: Update project to active
await projectsService.updateProject(website.id, {
  status: "active",
});

// 4. Execute: Log work
await projectsService.logTimeEntry({
  projectId: website.id,
  taskId: designTask.id,
  userId: "designer@company.com",
  hours: 8,
  date: "2025-01-20",
});

// 5. Monitor: Update task status
await projectsService.updateTask(designTask.id, {
  status: "done",
});

// 6. Monitor: Check progress
const analytics = await projectsService.getProjectAnalytics(website.id);
console.log("Project Status:", {
  completion: `${analytics.completion_percentage}%`,
  hoursLogged: analytics.hours.logged,
  budgetSpent: analytics.budget.spent,
});
```

### Example 2: Batch Project Operations

```typescript
// Import multiple projects from CSV
const projectsData = [
  { name: "Project A", budget: 10000, client: "Client A" },
  { name: "Project B", budget: 15000, client: "Client B" },
  { name: "Project C", budget: 20000, client: "Client C" },
];

const createdProjects = await Promise.all(
  projectsData.map((data) =>
    projectsService.createProject({
      ...data,
      status: "planning",
    }),
  ),
);

console.log(`Created ${createdProjects.length} projects`);
```

### Example 3: Analytics Dashboard

```typescript
// Get all active projects with analytics
const activeProjects = await projectsService.getProjects({
  status: "active",
});

const projectMetrics = await Promise.all(
  activeProjects.map(async (project) => ({
    id: project.id,
    name: project.name,
    analytics: await projectsService.getProjectAnalytics(project.id),
  })),
);

// Sort by completion percentage
projectMetrics.sort(
  (a, b) =>
    b.analytics.completion_percentage - a.analytics.completion_percentage,
);

// Render dashboard
renderProjectDashboard(projectMetrics);
```

### Example 4: Time Tracking Reports

```typescript
// Get time entries for a project
const timeEntries = await projectsService.getTimeEntries(projectId);

// Group by user
const entriesByUser = timeEntries.reduce(
  (acc, entry) => {
    if (!acc[entry.user_id]) acc[entry.user_id] = [];
    acc[entry.user_id].push(entry);
    return acc;
  },
  {} as Record<string, TimeEntry[]>,
);

// Calculate hours per user
const hoursByUser = Object.entries(entriesByUser).map(([userId, entries]) => ({
  userId,
  totalHours: entries.reduce((sum, e) => sum + e.hours, 0),
  entries: entries.length,
}));

console.log("Time Report:", hoursByUser);
```

---

## Error Handling

### Error Types

The module uses custom error classes for specific scenarios:

```typescript
import { NotFoundError, ValidationError } from "../error/errors";
```

### Handling Errors

```typescript
try {
  const project = await projectsService.getProject("invalid-id");
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error("Project not found:", error.message);
  } else if (error instanceof ValidationError) {
    console.error("Invalid data:", error.fields);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

### Common Errors

| Error | Cause | Solution |
| ----- | ----- | -------- |

| `NotFoundError` | Project/task doesn't exist | Verify ID, check if deleted |
| `ValidationError` | Invalid input data | Check data types and constraints |
| `Invalid hours value` | Hours < 0.25 or > 24 | Use valid hour range |
| `Invalid date format` | Date not ISO 8601 | Use YYYY-MM-DD format |
| `Status transition invalid` | Cannot move to that status | Check allowed status flows |

---

## Best Practices

### 1. Always Validate Dates

```typescript
// ✅ Correct: ISO 8601 format
await projectsService.createProject({
  name: "Project",
  startDate: "2025-01-01", // Correct
  endDate: "2025-12-31", // Correct
});

// ❌ Incorrect
await projectsService.createProject({
  name: "Project",
  startDate: "01/01/2025", // Wrong format
  endDate: "12/31/2025", // Wrong format
});
```

### 2. Set Realistic Estimates

```typescript
// ✅ Realistic estimates help with analytics
const task = await projectsService.createTask({
  projectId: projectId,
  title: "Backend Development",
  estimatedHours: 160, // 4 weeks @ 40hrs
});

// Log actual hours
for (let day = 0; day < 10; day++) {
  await projectsService.logTimeEntry({
    projectId: projectId,
    taskId: task.id,
    userId: "developer",
    hours: 8,
    date: getTodayMinusDays(day),
  });
}
```

### 3. Use Status Transitions Properly

```typescript
// ✅ Logical progression
const project = await projectsService.createProject({...});            // planning
await projectsService.updateProject(project.id, {status: 'active'}); // → active
// Work progresses...
await projectsService.updateProject(project.id, {status: 'completed'}); // → completed

// ❌ Skip intermediate states carefully
await projectsService.updateProject(project.id, {status: 'completed'}); // Directly?
```

### 4. Monitor Budget vs. Hours

```typescript
// Track project financial health
const analytics = await projectsService.getProjectAnalytics(projectId);

const costPerHour = analytics.budget.total / analytics.hours.estimated;
const currentCost = analytics.hours.logged * costPerHour;
const costOverrun = currentCost > analytics.budget.spent;

if (costOverrun) {
  console.warn("Project budget exceeded!");
}
```

### 5. Archive Old Projects

```typescript
// Don't delete old projects, mark as completed
const oldProjects = await projectsService.getProjects({
  status: "on_hold",
});

for (const project of oldProjects) {
  if (isOldEnough(project.updated_at)) {
    // Either set to completed or delete
    await projectsService.updateProject(project.id, {
      status: "completed",
    });
  }
}
```

### 6. Regular Analytics Review

```typescript
// Weekly check of all active projects
const activeProjects = await projectsService.getProjects({
  status: "active",
});

for (const project of activeProjects) {
  const analytics = await projectsService.getProjectAnalytics(project.id);

  if (analytics.completion_percentage === 0 && isStale(project)) {
    console.warn(`Project "${project.name}" has no progress`);
  }

  if (analytics.timeline.on_schedule === false) {
    console.warn(`Project "${project.name}" is off schedule`);
  }
}
```

---

## Troubleshooting

### Issue: Project not found but I just created it

**Cause:** ID mismatch or database transaction issue

**Solution:**

```typescript
// Verify the response ID
const project = await projectsService.createProject({...});
console.log('Created project ID:', project.id);

// Try retrieving it
const retrieved = await projectsService.getProject(project.id);
console.log('Retrieved:', retrieved);
```

### Issue: Time entry hours calculation seems wrong

**Cause:** May be rounding or decimal precision

**Solution:**

```typescript
// Verify hours precision
const entries = await projectsService.getTimeEntries(projectId);
const total = entries.reduce((sum, e) => {
  console.log(`${e.user_id}: ${e.hours} hours`);
  return sum + e.hours;
}, 0);
console.log("Total:", total.toFixed(2)); // Round to 2 decimals
```

### Issue: Analytics completion percentage seems incorrect

**Cause:** Task status not properly set to 'done'

**Solution:**

```typescript
// Verify task statuses
const tasks = await projectsService.getProjectTasks(projectId);
tasks.forEach((task) => {
  console.log(`${task.title}: ${task.status}`);
});

// Ensure 'done' tasks are marked correctly
const incompleteTasks = tasks.filter((t) => t.status !== "done");
console.log(`Incomplete tasks: ${incompleteTasks.length}`);
```

### Issue: Time zone handling for dates

**Cause:** Date format doesn't include timezone

**Solution:**

```typescript
// Always use ISO 8601 date format (YYYY-MM-DD)
// The service handles timezone-aware timestamps internally

const today = new Date().toISOString().split("T")[0]; // Gets YYYY-MM-DD
await projectsService.logTimeEntry({
  projectId,
  userId,
  hours: 8,
  date: today, // ISO date format
});
```

---

## Changelog

### Version 1.0.0 (2025-12-20)

**Features:**

- ✅ Full project CRUD operations
- ✅ Task management with priority and status
- ✅ Time tracking and entry logging
- ✅ Project analytics and metrics
- ✅ Global statistics
- ✅ Cascading deletes
- ✅ Comprehensive error handling
- ✅ Full TypeScript support
- ✅ Zod validation
- ✅ Pino structured logging

**Components:**

- `projectsRouter.ts` - HTTP layer (REST API)
- `projectsService.ts` - Business logic layer
- Full CRUD endpoints for projects, tasks, and time entries
- Analytics endpoints for progress tracking

**Database:**

- `projects` table - Project information
- `project_tasks` table - Task tracking with cascading delete
- `project_time_entries` table - Time logging

---

## Support & Questions

For issues or questions:

1. **Check Documentation:** Review relevant section above
2. **Examine Logs:** Check server logs for detailed error messages
3. **Verify Data:** Ensure data meets schema constraints
4. **Contact:** Reach out to development team

---

**Module Location:** `apps/backend/src/routes/projects/`  
**Last Updated:** 2025-12-20  
**Status:** Production Ready ✅
