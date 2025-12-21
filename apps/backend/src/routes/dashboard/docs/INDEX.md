# Dashboard Module Documentation Index

**Version:** 2.0  
**Status:** Production Ready  
**Last Updated:** 2025-12-20

## 📚 Dokumentation

### Haupt-Dokumente

1. **[REDESIGN.md](REDESIGN.md)** - Kompletter Redesign-Überblick
   - Komponenten-Übersicht
   - Migration Guide
   - Database Schema
   - Performance
   - Sicherheit
   - Testing
   - Troubleshooting

2. **[INTEGRATION.md](INTEGRATION.md)** - Integration Guide
   - Quick Start
   - Service Integration
   - Router Integration
   - Utility Functions
   - Error Handling
   - Testing Guide
   - Best Practices

3. **[README.md](docs/README.md)** - API-Referenz
   - Vollständige Endpoint-Dokumentation
   - Request/Response-Beispiele
   - Query-Parameter
   - Error-Codes

## 🎯 Quick Navigation

### Für Anfänger

- Start: [Quick Start (INTEGRATION.md#quick-start)](INTEGRATION.md#quick-start)
- API: [API Reference (docs/README.md)](docs/README.md)
- Beispiele: [INTEGRATION.md#service-integration](INTEGRATION.md#service-integration)

### Für Entwickler

- Service: [DashboardService](REDESIGN.md#1-dashboardservice-dashboardservicets)
- Router: [Router](REDESIGN.md#2-router-dashboardts)
- Testing: [Testing](INTEGRATION.md#testing-guide)
- Best Practices: [Best Practices](INTEGRATION.md#best-practices)

### Für Architekten

- Redesign: [REDESIGN.md](REDESIGN.md)
- Database Schema: [Database Schema](REDESIGN.md#database-schema)
- Performance: [Performance](REDESIGN.md#performance)
- Migration: [Migration Guide](REDESIGN.md#migration-guide)

## 📦 Komponenten

### Core Components

| Component | File | Description |
| --------- | ---- | ----------- |

| **DashboardService** | `DashboardService.ts` | Singleton-Service mit Business-Logik |
| **Main Router** | `dashboard.ts` | Express-Router mit Zod-Validierung |
| **Comprehensive Router** | `comprehensive.ts` | Erweiterte Analytics und Metrics |
| **Unified Router** | `unifiedDashboardRouter.ts` | KI-Annotator + Funktionskatalog |
| **Types** | `types.ts` | TypeScript-Typen und Zod-Schemas |
| **Index** | `index.ts` | Central export point |

### Documentation

| Document | Purpose | Audience |
| -------- | ------- | -------- |

| **REDESIGN.md** | Complete redesign overview | All |
| **INTEGRATION.md** | Integration guide & best practices | Developers |
| **docs/README.md** | API reference | Frontend Developers |
| **INDEX.md** | Documentation index | All |

## 🚀 Features

### ✅ Implemented

- [x] DashboardService Singleton
- [x] DatabaseManager Integration
- [x] Utility Functions (pagination, filtering)
- [x] Zod Validation
- [x] Comprehensive JSDoc
- [x] Retry Logic
- [x] Error Formatting
- [x] Type Safety
- [x] Pagination Support
- [x] Filtering Support
- [x] System Health Monitoring
- [x] KPI Tracking
- [x] Task Management
- [x] Notification System
- [x] Widget Configuration
- [x] Layout Management
- [x] Widget CRUD Operations
- [x] Layout CRUD Operations
- [x] Favorites CRUD Operations

### 🔄 In Progress

- [ ] Executive Metrics Implementation
- [ ] Process Monitoring Implementation
- [ ] Real-time Analytics

### 📋 Planned

- [ ] WebSocket Support for Real-time Updates
- [ ] GraphQL API
- [ ] Advanced Filtering (date ranges, complex queries)
- [ ] Bulk Operations
- [ ] Export/Import Functionality
- [ ] Dashboard Templates
- [ ] User Preferences
- [ ] Dark Mode Support

## 🔧 API Endpoints

### System & Health

```h
GET  /api/dashboard/health          - System health status
GET  /api/dashboard/overview        - Dashboard overview
GET  /api/dashboard/context         - Last log entries
```

### KPIs

```h
GET  /api/dashboard/kpis            - List KPIs
POST /api/dashboard/kpis            - Create KPI
```

### Tasks

```h
GET    /api/dashboard/tasks         - List tasks (paginated)
GET    /api/dashboard/tasks/:id     - Get task by ID
POST   /api/dashboard/tasks         - Create task
PUT    /api/dashboard/tasks/:id     - Update task
DELETE /api/dashboard/tasks/:id     - Delete task
```

### Notifications

```h
GET    /api/dashboard/notifications         - List notifications (paginated)
GET    /api/dashboard/notifications/:id     - Get notification by ID
POST   /api/dashboard/notifications         - Create notification
PUT    /api/dashboard/notifications/:id     - Update notification
DELETE /api/dashboard/notifications/:id     - Delete notification
```

### Widgets & Activities

```h
GET /api/dashboard/widgets/stats    - Widget statistics
GET /api/dashboard/activities       - Recent activities
GET /api/dashboard/quick-links      - Navigation quick links
```

### Widgets (CRUD)

```h
GET    /api/dashboard/widgets         - List widgets (paginated)
POST   /api/dashboard/widgets         - Create widget
PUT    /api/dashboard/widgets/:id     - Update widget
DELETE /api/dashboard/widgets/:id     - Delete widget
```

### Layouts (CRUD)

```h
GET    /api/dashboard/layouts         - List layouts for a user
POST   /api/dashboard/layouts         - Create layout
PUT    /api/dashboard/layouts/:id     - Update layout
DELETE /api/dashboard/layouts/:id     - Delete layout
```

### Favorites (CRUD)

```h
GET    /api/dashboard/favorites       - List favorites for a user
POST   /api/dashboard/favorites       - Add favorite
DELETE /api/dashboard/favorites/:id   - Delete favorite
```

### Comprehensive Dashboard

```h
GET /api/dashboard/comprehensive/executive/revenue       - Revenue metrics
GET /api/dashboard/comprehensive/executive/margins       - Profit margins
GET /api/dashboard/comprehensive/executive/liquidity     - Liquidity status
GET /api/dashboard/comprehensive/executive/order-intake  - Order intake
GET /api/dashboard/comprehensive/executive/productivity  - Productivity
GET /api/dashboard/comprehensive/process/pipeline        - Sales pipeline
GET /api/dashboard/comprehensive/process/procurement     - Procurement metrics
GET /api/dashboard/comprehensive/process/production      - Production utilization
GET /api/dashboard/comprehensive/process/sla             - SLA metrics
GET /api/dashboard/comprehensive/process/projects        - Project progress
GET /api/dashboard/comprehensive/warnings                - Warnings & alerts
GET /api/dashboard/comprehensive/widgets                 - Widget configuration
GET /api/dashboard/comprehensive/layouts                 - Layout management
GET /api/dashboard/comprehensive/favorites               - Favorites management
```

## 📖 Code Examples

### Service Usage

```typescript
import dashboardService from "./routes/dashboard/DashboardService.js";

// Initialize once at app startup
await dashboardService.initialize();

// Use throughout application
const tasks = await dashboardService.getTasks({
  userId: "user-123",
  status: "pending",
  limit: 20,
  offset: 0,
});
```

### Router Usage

```typescript
import dashboardRouter from "./routes/dashboard/dashboard.js";

app.use("/api/dashboard", dashboardRouter);
```

### API Call (Frontend)

```typescript
// Get paginated tasks
const response = await fetch(
  "/api/dashboard/tasks?limit=20&offset=0&status=pending",
);
const result = await response.json();

// Create task
const response = await fetch("/api/dashboard/tasks", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: "user-123",
    title: "Review Report",
    priority: "high",
  }),
});
```

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test:unit -- src/routes/dashboard

# Integration tests
npm run test:integration -- src/routes/dashboard

# Coverage
npm run test:coverage -- src/routes/dashboard
```

### Test Files

- `DashboardService.test.ts` - Service unit tests
- `dashboard.test.ts` - Router integration tests
- `comprehensive.test.ts` - Comprehensive router tests

## 📊 Database Schema

### Core Tables

- `dashboard_kpis` - KPI tracking
- `dashboard_tasks` - Task management
- `dashboard_notifications` - Notification system
- `dashboard_widgets` - Widget configuration
- `dashboard_layouts` - Layout management
- `dashboard_favorites` - Favorites management

### Migrations

- `010_create_module_tables_sqlite.sql` - Initial tables
- `051_add_user_id_to_dashboard_tables.sql` - User ID migration
- `052_add_missing_crm_calendar_columns.sql` - Additional columns

## 🐛 Troubleshooting

See [REDESIGN.md#troubleshooting](REDESIGN.md#troubleshooting) for common issues and solutions.

## 📝 Contributing

1. Follow [Best Practices](INTEGRATION.md#best-practices)
2. Write tests for new features
3. Update documentation
4. Follow [Code Conventions](../../../../docs/CODE_CONVENTIONS.md)

## 📞 Support

- **GitHub Issues:** [Repository Issues](https://github.com/steinmetz-erp/issues)
- **Email:** <support@steinmetz-erp.de>
- **Documentation:** [docs/](docs/)

## 📜 License

SPDX-License-Identifier: MIT

---

**Version:** 2.0  
**Last Updated:** 2025-12-20  
**Maintainers:** ERP SteinmetZ Team
