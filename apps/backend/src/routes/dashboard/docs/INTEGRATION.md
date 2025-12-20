# Dashboard Integration Guide

**Version:** 2.0  
**Target Audience:** Backend Developers  
**Last Updated:** 2025-12-20

## 📋 Inhaltsverzeichnis

1. [Quick Start](#-quick-start)
2. [Service Integration](#-service-integration)
3. [Router Integration](#%EF%B8%8F-router-integration)
4. [Utility Functions](#-utility-functions)
5. [Error Handling](#-error-handling)
6. [Testing Guide](#-testing-guide)
7. [Best Practices](#-best-practices)

## 🚀 Quick Start

### Installation

Der Dashboard-Module ist bereits Teil des Projekts. Keine zusätzliche Installation erforderlich.

### Basic Usage

```typescript
import dashboardService from './routes/dashboard/DashboardService.js';

// In app startup
await dashboardService.initialize();

// Use in routes
const tasks = await dashboardService.getTasks({ limit: 10, offset: 0 });
```

### Router einbinden

```typescript
// apps/backend/src/index.ts
import dashboardRouter from './routes/dashboard/dashboard.js';

app.use('/api/dashboard', dashboardRouter);
```

## 🔧 Service Integration

### DashboardService Singleton

Der **DashboardService** ist ein Singleton mit lazy initialization:

```typescript
import dashboardService from './routes/dashboard/DashboardService.js';

// Initialisierung (einmalig beim App-Start)
await dashboardService.initialize();

// Danach überall verwendbar
const overview = await dashboardService.getDashboardOverview();
```

### Methoden-Übersicht

#### System & Health

```typescript
// System health check
const health = await dashboardService.getSystemHealth();
// Returns: { status, uptime, memory, loadAvg, ... }

// Dashboard overview
const overview = await dashboardService.getDashboardOverview();
// Returns: { system, ai, erp, timestamp }
```

#### KPI Operations

```typescript
// Get KPIs with filtering
const kpis = await dashboardService.getKPIs({
  category: 'revenue',
  days: 30
});

// Create new KPI
const kpi = await dashboardService.createKPI({
  category: 'sales',
  name: 'Monthly Revenue',
  value: 125000,
  unit: 'EUR',
  target: 150000,
  date: '2025-12-20'
});
```

#### Task Management

```typescript
// Get tasks (paginated)
const result = await dashboardService.getTasks({
  userId: 'user-123',
  status: 'pending',
  priority: 'high',
  limit: 20,
  offset: 0,
  sortBy: 'priority',
  sortOrder: 'desc'
});

// Create task
const task = await dashboardService.createTask({
  userId: 'user-123',
  title: 'Review Q4 Report',
  description: 'Review and approve financial report',
  priority: 'urgent',
  dueDate: '2025-12-25',
  assignedTo: 'user-456',
  tags: 'finance,urgent',
  relatedTo: 'report-789',
  relatedType: 'report'
});

// Update task
const updated = await dashboardService.updateTask('task-id', {
  status: 'completed',
  completedAt: new Date().toISOString()
});

// Delete task
await dashboardService.deleteTask('task-id');
```

#### Notification Management

```typescript
// Get notifications (paginated)
const result = await dashboardService.getNotifications({
  userId: 'user-123',
  read: false,
  type: 'warning',
  limit: 10,
  offset: 0
});

// Create notification
const notification = await dashboardService.createNotification({
  userId: 'user-123',
  type: 'warning',
  title: 'Server Maintenance',
  message: 'Scheduled maintenance at 02:00 AM',
  actionUrl: '/maintenance',
  actionLabel: 'View Details',
  metadata: JSON.stringify({ priority: 'high' })
});

// Mark as read
await dashboardService.updateNotification('notif-id', {
  read: true
});

// Delete notification
await dashboardService.deleteNotification('notif-id');
```

#### Widget Management (CRUD)

```typescript
// Get widgets (paginated)
const widgets = await dashboardService.getWidgets({
  userId: 'user-123',
  widgetType: 'chart',
  dataSource: 'revenue',
  isVisible: true,
  limit: 12,
  offset: 0,
});

// Create widget
const widget = await dashboardService.createWidget({
  userId: 'user-123',
  widgetType: 'chart',
  dataSource: 'revenue',
  title: 'Revenue by Month',
  position: 0,
  width: 6,
  height: 4,
  config: JSON.stringify({ chartType: 'line' }),
});

// Update widget
const updatedWidget = await dashboardService.updateWidget(widget.id, {
  title: 'Revenue (12 months)',
  position: 1,
  width: 8,
});

// Delete widget
await dashboardService.deleteWidget(widget.id);
```

#### Layout Management (CRUD)

```typescript
// Get layouts for user
const layouts = await dashboardService.getLayouts('user-123');

// Create layout
const layout = await dashboardService.createLayout({
  userId: 'user-123',
  name: 'Executive View',
  description: 'KPIs and revenue overview',
  layout: JSON.stringify({ grid: [] }),
  isDefault: true,
  isActive: true,
});

// Update layout
const updatedLayout = await dashboardService.updateLayout(layout.id, {
  name: 'Executive View v2',
  isActive: true,
});

// Delete layout
await dashboardService.deleteLayout(layout.id);
```

#### Favorites Management (CRUD)

```typescript
// Get favorites for user
const favorites = await dashboardService.getFavorites('user-123');

// Add favorite
const favorite = await dashboardService.addFavorite({
  userId: 'user-123',
  itemType: 'route',
  itemId: 'finance-revenue',
  title: 'Revenue Dashboard',
  url: '/dashboard/finance/revenue',
  icon: 'dollar-sign',
  position: 0,
});

// Delete favorite
await dashboardService.deleteFavorite(favorite.id);
```

## 🛣️ Router Integration

### Route Handler mit DashboardService

```typescript
import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import dashboardService from './DashboardService.js';
import { queryTaskSchema } from './types.js';

const router = Router();

router.get('/tasks', asyncHandler(async (req, res) => {
  // 1. Validate input with Zod
  const validated = queryTaskSchema.parse(req.query);
  
  // 2. Call service method
  const result = await dashboardService.getTasks(validated);
  
  // 3. Return response
  res.json(result);
}));

export default router;
```

### Widgets/Layout/Favorites Router Examples

```typescript
import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import dashboardService from './DashboardService.js';
import {
  queryWidgetSchema,
  createWidgetSchema,
  updateWidgetSchema,
  createLayoutSchema,
  createFavoriteSchema,
  updateLayoutSchema,
} from './types.js';

const router = Router();

// Widgets
router.get('/widgets', asyncHandler(async (req, res) => {
  const validated = queryWidgetSchema.parse(req.query);
  const result = await dashboardService.getWidgets({
    ...validated,
    isVisible: typeof validated.isVisible === 'string' ? validated.isVisible === 'true' : undefined,
  } as any);
  res.json(result);
}));

router.post('/widgets', asyncHandler(async (req, res) => {
  const validated = createWidgetSchema.parse(req.body);
  const widget = await dashboardService.createWidget(validated);
  res.status(201).json({ success: true, data: widget });
}));

router.put('/widgets/:id', asyncHandler(async (req, res) => {
  const validated = updateWidgetSchema.parse(req.body);
  const widget = await dashboardService.updateWidget(req.params.id, validated);
  res.json({ success: true, data: widget });
}));

router.delete('/widgets/:id', asyncHandler(async (req, res) => {
  await dashboardService.deleteWidget(req.params.id);
  res.json({ success: true, message: 'Widget deleted successfully' });
}));

// Layouts
router.get('/layouts', asyncHandler(async (req, res) => {
  const userId = req.query.userId as string | undefined;
  if (!userId) throw new BadRequestError('Missing required query: userId');
  const layouts = await dashboardService.getLayouts(userId);
  res.json({ success: true, data: layouts, count: layouts.length });
}));

router.post('/layouts', asyncHandler(async (req, res) => {
  const validated = createLayoutSchema.parse(req.body);
  const layout = await dashboardService.createLayout(validated);
  res.status(201).json({ success: true, data: layout });
}));

router.put('/layouts/:id', asyncHandler(async (req, res) => {
  const validated = updateLayoutSchema.parse(req.body);
  const layout = await dashboardService.updateLayout(req.params.id, validated);
  res.json({ success: true, data: layout });
}));

router.delete('/layouts/:id', asyncHandler(async (req, res) => {
  await dashboardService.deleteLayout(req.params.id);
  res.json({ success: true, message: 'Layout deleted successfully' });
}));

// Favorites
router.get('/favorites', asyncHandler(async (req, res) => {
  const userId = req.query.userId as string | undefined;
  if (!userId) throw new BadRequestError('Missing required query: userId');
  const favorites = await dashboardService.getFavorites(userId);
  res.json({ success: true, data: favorites, count: favorites.length });
}));

router.post('/favorites', asyncHandler(async (req, res) => {
  const validated = createFavoriteSchema.parse(req.body);
  const favorite = await dashboardService.addFavorite(validated);
  res.status(201).json({ success: true, data: favorite });
}));

router.delete('/favorites/:id', asyncHandler(async (req, res) => {
  await dashboardService.deleteFavorite(req.params.id);
  res.json({ success: true, message: 'Favorite deleted successfully' });
}));
```

### Error Handling

```typescript
router.post('/tasks', asyncHandler(async (req, res) => {
  try {
    const validated = createTaskSchema.parse(req.body);
    const task = await dashboardService.createTask(validated);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError('Invalid input', error.errors);
    }
    throw error;
  }
}));
```

## 🧰 Utility Functions

Das Dashboard-Module verwendet Utility-Funktionen aus `../database/utils.ts`:

### Pagination

```typescript
import { parsePagination, createPaginatedResult } from '../database/utils.js';

// Parse pagination from query params
const pagination = parsePagination(req.query);
// Returns: { limit: 50, offset: 0, page: 1 }

// Create paginated result
const result = createPaginatedResult(data, total, pagination);
// Returns: { success: true, data, pagination: { limit, offset, total, ... } }
```

### WHERE Clause Building

```typescript
import { buildWhereClause } from '../database/utils.js';

const whereClause = buildWhereClause({
  user_id: 'user-123',
  status: 'pending',
  'priority IN': ['high', 'urgent'],
  'due_date <=': '2025-12-31'
});
// Returns: { clause: 'WHERE user_id = ? AND status = ? ...', params: [...] }
```

### ORDER BY Building

```typescript
import { buildOrderBy } from '../database/utils.js';

const orderBy = buildOrderBy('priority', 'desc', ['created_at DESC']);
// Returns: 'ORDER BY priority DESC, created_at DESC'
```

### SELECT Query Building

```typescript
import { buildSelectQuery } from '../database/utils.js';

const sql = buildSelectQuery({
  table: 'dashboard_tasks',
  where: 'WHERE user_id = ?',
  orderBy: 'priority DESC',
  limit: 20,
  offset: 0
});
// Returns: 'SELECT * FROM dashboard_tasks WHERE user_id = ? ORDER BY priority DESC LIMIT 20 OFFSET 0'
```

### Error Formatting

```typescript
import { formatDatabaseError } from '../database/utils.js';

try {
  await db.run('INSERT INTO ...');
} catch (error) {
  throw formatDatabaseError(error);
  // Converts DB errors to user-friendly messages
}
```

### Retry Logic

```typescript
import { retryOperation } from '../database/utils.js';

const result = await retryOperation(async () => {
  return await db.run('INSERT INTO ...');
}, { maxRetries: 3, baseDelay: 100 });
```

## ❌ Error Handling

### Custom Errors

```typescript
import { NotFoundError, BadRequestError } from '../error/errors.js';

// Task not found
if (!task) {
  throw new NotFoundError('Task not found', { taskId });
}

// Invalid input
if (!data.userId) {
  throw new BadRequestError('Missing required field: userId');
}
```

### Zod Validation Errors

```typescript
import { z } from 'zod';

try {
  const validated = createTaskSchema.parse(req.body);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Return validation errors
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.errors
    });
  }
}
```

### Database Errors

```typescript
try {
  await dashboardService.createTask(data);
} catch (error) {
  logger.error({ error }, 'Failed to create task');
  
  if (error.message.includes('UNIQUE constraint')) {
    throw new BadRequestError('Task already exists');
  }
  
  throw formatDatabaseError(error);
}
```

## 🧪 Testing Guide

### Unit Tests (DashboardService)

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import dashboardService from './DashboardService.js';

describe('DashboardService - Tasks', () => {
  beforeEach(async () => {
    await dashboardService.initialize();
  });

  afterEach(async () => {
    // Clean up test data
  });

  it('should create task', async () => {
    const task = await dashboardService.createTask({
      userId: 'test-user',
      title: 'Test Task',
      priority: 'high'
    });
    
    expect(task.id).toBeDefined();
    expect(task.title).toBe('Test Task');
    expect(task.status).toBe('pending');
  });

  it('should get paginated tasks', async () => {
    const result = await dashboardService.getTasks({
      userId: 'test-user',
      limit: 10,
      offset: 0
    });
    
    expect(result.data).toBeInstanceOf(Array);
    expect(result.pagination.limit).toBe(10);
    expect(result.pagination.total).toBeGreaterThanOrEqual(0);
  });

  it('should update task status', async () => {
    const task = await dashboardService.createTask({
      userId: 'test-user',
      title: 'Test Task'
    });
    
    const updated = await dashboardService.updateTask(task.id, {
      status: 'completed'
    });
    
    expect(updated.status).toBe('completed');
    expect(updated.completedAt).toBeDefined();
  });

  it('should throw error for non-existent task', async () => {
    await expect(
      dashboardService.getTaskById('invalid-id')
    ).rejects.toThrow('Task not found');
  });
});
```

### Integration Tests (Router)

```typescript
import request from 'supertest';
import app from '../../app.js';

describe('Dashboard API - Tasks', () => {
  it('GET /api/dashboard/tasks', async () => {
    const res = await request(app)
      .get('/api/dashboard/tasks')
      .query({ limit: 10, offset: 0 });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
  });

  it('POST /api/dashboard/tasks', async () => {
    const res = await request(app)
      .post('/api/dashboard/tasks')
      .send({
        userId: 'test-user',
        title: 'Integration Test Task',
        priority: 'normal'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
  });

  it('PUT /api/dashboard/tasks/:id', async () => {
    const createRes = await request(app)
      .post('/api/dashboard/tasks')
      .send({
        userId: 'test-user',
        title: 'Test Task'
      });
    
    const taskId = createRes.body.data.id;
    
    const updateRes = await request(app)
      .put(`/api/dashboard/tasks/${taskId}`)
      .send({ status: 'completed' });
    
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('completed');
  });

  it('DELETE /api/dashboard/tasks/:id', async () => {
    const createRes = await request(app)
      .post('/api/dashboard/tasks')
      .send({
        userId: 'test-user',
        title: 'Test Task'
      });
    
    const taskId = createRes.body.data.id;
    
    const deleteRes = await request(app)
      .delete(`/api/dashboard/tasks/${taskId}`);
    
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});
```

## ✅ Best Practices

### 1. Immer DashboardService verwenden

```typescript
// ✅ Korrekt
import dashboardService from './DashboardService.js';
const tasks = await dashboardService.getTasks(filters);

// ❌ Falsch
import db from '../database/dbService.js';
const tasks = await db.all('SELECT * FROM dashboard_tasks');
```

### 2. Zod für Input-Validierung

```typescript
// ✅ Korrekt
const validated = queryTaskSchema.parse(req.query);
const result = await dashboardService.getTasks(validated);

// ❌ Falsch
const result = await dashboardService.getTasks(req.query);
```

### 3. Pagination verwenden

```typescript
// ✅ Korrekt
const result = await dashboardService.getTasks({
  limit: 50,
  offset: 0
});

// ❌ Falsch
const result = await db.all('SELECT * FROM dashboard_tasks');
```

### 4. Error Handling

```typescript
// ✅ Korrekt
try {
  const task = await dashboardService.getTaskById(id);
} catch (error) {
  logger.error({ error, taskId: id }, 'Failed to get task');
  throw formatDatabaseError(error);
}

// ❌ Falsch
const task = await dashboardService.getTaskById(id);
// No error handling!
```

### 5. Logging

```typescript
// ✅ Korrekt
import { createLogger } from '../../utils/logger.js';
const logger = createLogger('dashboard-custom');

logger.info({ userId, taskId }, 'Task created');
logger.error({ error }, 'Task creation failed');

// ❌ Falsch
console.log('Task created');
console.error('Error:', error);
```

### 6. Type Safety

```typescript
// ✅ Korrekt
import type { DashboardTask, CreateTaskInput } from './types.js';

const createTask = async (data: CreateTaskInput): Promise<DashboardTask> => {
  return await dashboardService.createTask(data);
};

// ❌ Falsch
const createTask = async (data: any): Promise<any> => {
  return await dashboardService.createTask(data);
};
```

### 7. Keine CREATE TABLE in Routes

```typescript
// ✅ Korrekt
// Tabellen werden durch Migrations erstellt
// Routes verwenden nur SELECT, INSERT, UPDATE, DELETE

// ❌ Falsch
await db.run('CREATE TABLE IF NOT EXISTS dashboard_tasks ...');
```

### 8. Prepared Statements

```typescript
// ✅ Korrekt
await db.run(
  'INSERT INTO dashboard_tasks (id, title) VALUES (?, ?)',
  [id, title]
);

// ❌ Falsch
await db.run(`INSERT INTO dashboard_tasks VALUES ('${id}', '${title}')`);
```

## 📚 Weitere Ressourcen

- [REDESIGN.md](REDESIGN.md) - Vollständiger Redesign-Überblick
- [docs/README.md](docs/README.md) - API-Dokumentation
- [DATABASE_MIGRATION_STANDARDS.md](../../../../docs/DATABASE_MIGRATION_STANDARDS.md) - Migration-Standards
- [CODE_CONVENTIONS.md](../../../../docs/CODE_CONVENTIONS.md) - Code-Konventionen

---

**Support:** Fragen? → GitHub Issues oder <support@steinmetz-erp.de>
