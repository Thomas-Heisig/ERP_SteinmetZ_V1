# Projects Module

## Overview

The Projects module provides comprehensive project management functionality including project planning, task management, resource allocation, time tracking, and project analytics.

## Features

- **Project Management**: Create and manage projects with milestones
- **Task Tracking**: Break down projects into manageable tasks
- **Resource Allocation**: Assign team members and resources
- **Time Tracking**: Track time spent on projects and tasks
- **Gantt Charts**: Visual project timeline
- **Collaboration**: Team collaboration and communication
- **Budget Tracking**: Monitor project budgets and costs

## API Endpoints

### Projects

#### `GET /api/projects`
List all projects with filtering.

**Query Parameters:**
- `status` (optional): Filter by status (planning, active, on_hold, completed, cancelled)
- `search` (optional): Search projects by name or description

#### `POST /api/projects`
Create a new project.

**Request Body:**
```json
{
  "name": "ERP Implementation",
  "description": "Customer ERP system implementation",
  "status": "planning",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "budget": 100000.00,
  "client": "Customer Name",
  "project_manager": "user-id"
}
```

#### `GET /api/projects/:id`
Get project details.

#### `PUT /api/projects/:id`
Update project information.

#### `DELETE /api/projects/:id`
Delete a project.

### Tasks

#### `GET /api/projects/:projectId/tasks`
List all tasks for a project.

#### `POST /api/projects/:projectId/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "Database Design",
  "description": "Design database schema",
  "status": "todo",
  "priority": "high",
  "assigned_to": "user-id",
  "due_date": "2025-02-15",
  "estimated_hours": 40
}
```

#### `GET /api/projects/tasks/:taskId`
Get task details.

#### `PUT /api/projects/tasks/:taskId`
Update task information.

#### `DELETE /api/projects/tasks/:taskId`
Delete a task.

### Time Tracking

#### `GET /api/projects/time-entries`
List time entries with filtering.

#### `POST /api/projects/time-entries`
Log time spent on a task.

**Request Body:**
```json
{
  "project_id": "project-uuid",
  "task_id": "task-uuid",
  "user_id": "user-uuid",
  "hours": 4.5,
  "date": "2025-12-19",
  "description": "Worked on database design"
}
```

### Milestones

#### `GET /api/projects/:projectId/milestones`
List project milestones.

#### `POST /api/projects/:projectId/milestones`
Create a milestone.

### Resources

#### `GET /api/projects/:projectId/resources`
Get project resource allocation.

#### `POST /api/projects/:projectId/resources`
Assign resources to project.

### Analytics

#### `GET /api/projects/:projectId/analytics`
Get project analytics and metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "completion": 65.5,
    "budget_used": 45000.00,
    "budget_remaining": 55000.00,
    "hours_logged": 850,
    "hours_estimated": 1200,
    "tasks_completed": 45,
    "tasks_remaining": 23,
    "on_schedule": true
  }
}
```

## Database Schema

### `projects`
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `description` (TEXT)
- `status` (TEXT)
- `start_date` (TEXT)
- `end_date` (TEXT)
- `budget` (REAL)
- `client` (TEXT)
- `project_manager` (TEXT)
- `created_at` (TEXT)
- `updated_at` (TEXT)

### `project_tasks`
- `id` (TEXT PRIMARY KEY)
- `project_id` (TEXT FOREIGN KEY)
- `title` (TEXT NOT NULL)
- `description` (TEXT)
- `status` (TEXT)
- `priority` (TEXT)
- `assigned_to` (TEXT)
- `due_date` (TEXT)
- `estimated_hours` (REAL)
- `created_at` (TEXT)
- `updated_at` (TEXT)

### `project_time_entries`
- `id` (TEXT PRIMARY KEY)
- `project_id` (TEXT FOREIGN KEY)
- `task_id` (TEXT FOREIGN KEY)
- `user_id` (TEXT)
- `hours` (REAL NOT NULL)
- `date` (TEXT NOT NULL)
- `description` (TEXT)
- `created_at` (TEXT)

## Integration Points

- **HR Module**: Employee assignments and availability
- **Finance Module**: Project billing and invoicing
- **Inventory Module**: Material allocation
- **CRM Module**: Customer projects

## Future Enhancements

- [ ] Kanban board view
- [ ] Dependencies between tasks
- [ ] Resource capacity planning
- [ ] Project templates
- [ ] Risk management
- [ ] Document versioning
- [ ] Client portal access

## Version History

- **v0.3.0** (2025-12-19): Initial projects module implementation
