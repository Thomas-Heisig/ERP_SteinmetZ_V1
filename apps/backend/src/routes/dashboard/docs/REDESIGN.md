# Dashboard Module - Complete Redesign

**Version:** 2.0  
**Status:** Production Ready  
**Last Updated:** 2025-12-20

## 🎯 Übersicht

Vollständig redesigntes Dashboard-Module mit:

- **DashboardService** - Singleton-Service mit DatabaseManager
- **Konsolidierte Router** - Keine doppelte Logik mehr
- **Utility-Funktionen** - Pagination, Filtering, Error Handling
- **Migrations Only** - Keine CREATE TABLE-Statements in Routes
- **TypeScript & Zod** - Vollständige Typsicherheit und Validierung
- **JSDoc** - Umfassende Dokumentation

## 📦 Komponenten

### 1. DashboardService (`DashboardService.ts`)

**Zentrale Business-Logik** für alle Dashboard-Operationen.

#### Features

- ✅ Singleton-Pattern mit `getInstance()`
- ✅ Lazy Initialization mit DatabaseManager
- ✅ Automatisches Retry bei Fehlern
- ✅ Pagination und Filterung
- ✅ Umfassende Fehlerbehandlung
- ✅ Type-safe Operationen

#### Methoden

**System Health & Overview:**

```typescript
const health = await dashboardService.getSystemHealth();
const overview = await dashboardService.getDashboardOverview();
```

**KPI Management:**

```typescript
const kpis = await dashboardService.getKPIs({ category: 'revenue', days: 30 });
const newKPI = await dashboardService.createKPI({
  category: 'sales',
  name: 'Monthly Revenue',
  value: 125000,
  unit: 'EUR',
  target: 150000
});
```

**Task Management:**

```typescript
// Paginated tasks with filtering
const tasks = await dashboardService.getTasks({
  userId: 'user-123',
  status: 'pending',
  priority: 'high',
  limit: 20,
  offset: 0
});

// Create task
const task = await dashboardService.createTask({
  userId: 'user-123',
  title: 'Review Q4 Report',
  priority: 'urgent',
  dueDate: '2025-12-25'
});

// Update task
await dashboardService.updateTask('task-id', {
  status: 'completed'
});

// Delete task
await dashboardService.deleteTask('task-id');
```

**Notification Management:**

```typescript
// Paginated notifications
const notifications = await dashboardService.getNotifications({
  userId: 'user-123',
  read: false,
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
  actionLabel: 'View Details'
});

// Mark as read
await dashboardService.updateNotification('notif-id', {
  read: true
});
```

### 2. Router (`dashboard.ts`)

**Express-Router** mit vollständiger Zod-Validierung.

#### Endpoints

**System Health:**

- `GET /api/dashboard/health` - System health status
- `GET /api/dashboard/overview` - Complete dashboard overview
- `GET /api/dashboard/context` - Last log entries

**KPIs:**

- `GET /api/dashboard/kpis` - Get KPIs with filtering
- `POST /api/dashboard/kpis` - Create new KPI

**Tasks:**

- `GET /api/dashboard/tasks` - List tasks (paginated)
- `GET /api/dashboard/tasks/:id` - Get task by ID
- `POST /api/dashboard/tasks` - Create task
- `PUT /api/dashboard/tasks/:id` - Update task
- `DELETE /api/dashboard/tasks/:id` - Delete task

**Notifications:**

- `GET /api/dashboard/notifications` - List notifications (paginated)
- `GET /api/dashboard/notifications/:id` - Get notification by ID
- `POST /api/dashboard/notifications` - Create notification
- `PUT /api/dashboard/notifications/:id` - Update notification
- `DELETE /api/dashboard/notifications/:id` - Delete notification

**Widgets & Activities:**

- `GET /api/dashboard/widgets/stats` - Widget statistics
- `GET /api/dashboard/activities` - Recent activities
- `GET /api/dashboard/quick-links` - Navigation quick links

### 3. Types (`types.ts`)

**TypeScript-Typen** und **Zod-Schemas** für vollständige Typsicherheit.

#### Schemas

- `createTaskSchema` - Validierung für neue Tasks
- `updateTaskSchema` - Validierung für Task-Updates
- `queryTaskSchema` - Validierung für Task-Queries
- `createNotificationSchema` - Validierung für neue Notifications
- `updateNotificationSchema` - Validierung für Notification-Updates
- `queryNotificationSchema` - Validierung für Notification-Queries

#### Types

- `DashboardTask` - Task-Interface
- `DashboardNotification` - Notification-Interface
- `DashboardKPI` - KPI-Interface
- `DashboardWidget` - Widget-Interface
- `DashboardLayout` - Layout-Interface
- `DashboardFavorite` - Favorite-Interface
- `ActivityItem` - Activity-Interface
- `DashboardStats` - Stats-Interface

## 🔧 Migration Guide

### Schritt 1: Backup erstellen

```bash
# Alte Router sichern
cp dashboard.ts dashboard.ts.old
cp comprehensive.ts comprehensive.ts.old
```

### Schritt 2: Neue Dateien verwenden

```bash
# dashboard.ts ersetzen
mv dashboard_new.ts dashboard.ts
```

### Schritt 3: Imports aktualisieren

```typescript
// Alt
import db from '../database/dbService.js';

// Neu
import dashboardService from './DashboardService.js';
```

### Schritt 4: Code migrieren

**Vorher:**

```typescript
router.get('/tasks', asyncHandler(async (req, res) => {
  const tasks = await db.all('SELECT * FROM dashboard_tasks');
  res.json({ success: true, data: tasks });
}));
```

**Nachher:**

```typescript
router.get('/tasks', asyncHandler(async (req, res) => {
  const validated = queryTaskSchema.parse(req.query);
  const result = await dashboardService.getTasks(validated);
  res.json(result);
}));
```

## 📊 Database Schema

**WICHTIG:** Alle Tabellen werden durch **Migrations** erstellt!

### Dashboard Tables

#### `dashboard_kpis`

```sql
CREATE TABLE dashboard_kpis (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT,
  target REAL,
  trend TEXT,
  change_percent REAL,
  date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

#### `dashboard_tasks`

```sql
CREATE TABLE dashboard_tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'normal',
  due_date TEXT,
  completed_at TEXT,
  assigned_to TEXT,
  tags TEXT,
  related_to TEXT,
  related_type TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

#### `dashboard_notifications`

```sql
CREATE TABLE dashboard_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  action_url TEXT,
  action_label TEXT,
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  read_at TEXT
);
```

### Indexes

```sql
-- KPIs
CREATE INDEX idx_kpis_date ON dashboard_kpis(date);
CREATE INDEX idx_kpis_category ON dashboard_kpis(category);

-- Tasks
CREATE INDEX idx_tasks_user ON dashboard_tasks(user_id);
CREATE INDEX idx_tasks_status ON dashboard_tasks(status);
CREATE INDEX idx_tasks_priority ON dashboard_tasks(priority);
CREATE INDEX idx_tasks_due ON dashboard_tasks(due_date);

-- Notifications
CREATE INDEX idx_notifications_user ON dashboard_notifications(user_id);
CREATE INDEX idx_notifications_read ON dashboard_notifications(read);
CREATE INDEX idx_notifications_created ON dashboard_notifications(created_at);
```

## 🚀 Performance

### Pagination

Alle List-Endpunkte verwenden **Cursor-based Pagination**:

```typescript
GET /api/dashboard/tasks?limit=20&offset=0&sortBy=priority&sortOrder=desc
```

**Response:**

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 150,
    "page": 1,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Caching

**DashboardService** verwendet automatisches Caching für:

- System Health (5 Minuten)
- Overview Data (5 Minuten)
- Widget Stats (2 Minuten)

### Indexierung

Alle Query-Felder sind **indexiert** für optimale Performance:

- `user_id`, `status`, `priority` (Tasks)
- `user_id`, `read`, `created_at` (Notifications)
- `category`, `date` (KPIs)

## 🔒 Sicherheit

### Input Validation

Alle Inputs werden mit **Zod** validiert:

```typescript
const createTaskSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'critical']),
  // ...
});
```

### SQL Injection Prevention

**DashboardService** verwendet **Prepared Statements**:

```typescript
// ✅ Sicher
await db.run(
  'INSERT INTO dashboard_tasks (id, user_id, title) VALUES (?, ?, ?)',
  [id, userId, title]
);

// ❌ NIEMALS
await db.run(`INSERT INTO dashboard_tasks VALUES ('${id}', '${userId}', '${title}')`);
```

### Error Handling

Alle Fehler werden **formatiert** und **geloggt**:

```typescript
try {
  await dashboardService.createTask(data);
} catch (error) {
  logger.error({ error }, 'Failed to create task');
  throw formatDatabaseError(error);
}
```

## 📝 Testing

### Unit Tests (Vitest)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import dashboardService from './DashboardService.js';

describe('DashboardService', () => {
  beforeEach(async () => {
    await dashboardService.initialize();
  });

  it('should create task', async () => {
    const task = await dashboardService.createTask({
      userId: 'user-123',
      title: 'Test Task',
      priority: 'high'
    });
    
    expect(task.id).toBeDefined();
    expect(task.title).toBe('Test Task');
    expect(task.priority).toBe('high');
  });

  it('should get paginated tasks', async () => {
    const result = await dashboardService.getTasks({
      limit: 10,
      offset: 0
    });
    
    expect(result.data).toBeInstanceOf(Array);
    expect(result.pagination.limit).toBe(10);
  });
});
```

### Integration Tests

```typescript
import request from 'supertest';
import app from '../../app.js';

describe('Dashboard API', () => {
  it('GET /api/dashboard/health', async () => {
    const res = await request(app).get('/api/dashboard/health');
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('POST /api/dashboard/tasks', async () => {
    const res = await request(app)
      .post('/api/dashboard/tasks')
      .send({
        userId: 'user-123',
        title: 'Integration Test Task',
        priority: 'normal'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
  });
});
```

## 🐛 Troubleshooting

### "Database not initialized"

**Ursache:** DashboardService wurde nicht initialisiert.

**Lösung:**

```typescript
// In app.ts / index.ts
import dashboardService from './routes/dashboard/DashboardService.js';

async function startServer() {
  await dashboardService.initialize();
  app.listen(3000);
}
```

### "Task not found"

**Ursache:** Task-ID existiert nicht oder wurde gelöscht.

**Lösung:** Prüfen ob ID korrekt ist:

```typescript
try {
  const task = await dashboardService.getTaskById('invalid-id');
} catch (error) {
  if (error.message.includes('not found')) {
    // Handle 404
  }
}
```

### Pagination funktioniert nicht

**Ursache:** Fehlende oder falsche Query-Parameter.

**Lösung:** Zod-Schema prüfen:

```typescript
const validated = queryTaskSchema.parse(req.query);
// Throws error if invalid
```

## 📚 API-Referenz

Vollständige API-Dokumentation siehe: [docs/README.md](docs/README.md)

## 🔄 Changelog

### Version 2.0 (2025-12-20)

**Breaking Changes:**

- Router verwenden jetzt `DashboardService` statt direktem `db`
- Alle CREATE TABLE-Statements entfernt (nur Migrations)
- Response-Format geändert (pagination included)

**Improvements:**

- ✅ DashboardService mit Singleton-Pattern
- ✅ DatabaseManager Integration
- ✅ Utility-Funktionen (pagination, filtering)
- ✅ Zod-Validierung für alle Inputs
- ✅ Umfassende JSDoc-Kommentare
- ✅ Retry-Logik mit exponential backoff
- ✅ Formatierte Fehlermeldungen
- ✅ Type-safe Operations

**Migration:**

- Alte Routen sind kompatibel (backward compatible)
- Neue Routen verwenden DashboardService
- Schrittweise Migration möglich

---

**Vollständige Dokumentation:** [docs/](docs/)  
**GitHub Issues:** [GitHub Repository](https://github.com/steinmetz-erp/issues)  
**Support:** <support@steinmetz-erp.de>
