# ERP SteinmetZ - Module Documentation Index

**Version:** 0.3.0  
**Last Updated:** December 6, 2025  
**Status:** Production-Ready

This document provides a comprehensive index of all modules and their documentation within the ERP SteinmetZ system.

## 📚 Overview

ERP SteinmetZ consists of multiple modules organized into three layers:

1. **Frontend Modules** - User interface components
2. **Backend API Modules** - REST API endpoints and business logic
3. **Core Services** - Shared functionality and infrastructure

---

## 🎨 Frontend Modules

Located in: `apps/frontend/src/components/`

### Dashboard

**Path:** `apps/frontend/src/components/Dashboard/`  
**Documentation:** [README.md](../../apps/frontend/src/components/Dashboard/README.md)

Main dashboard interface providing:

- 11 function area navigation
- Dynamic widget system
- Theme switching
- Language selection
- Responsive layout

**Key Features:**

- Real-time data updates
- Customizable widgets
- Role-based access control
- Performance optimizations (lazy loading, code splitting)

### Functions Catalog

**Path:** `apps/frontend/src/components/FunctionsCatalog/`  
**Documentation:** [README_FunctionsCatalog.md](../../apps/frontend/src/components/FunctionsCatalog/README_FunctionsCatalog.md)

Function catalog browser with:

- 15,472 function nodes
- Hierarchical navigation
- Search and filtering
- Code editor integration
- Export capabilities

**Key Features:**

- Monaco editor integration
- Export to JSON/YAML
- Metadata visualization
- Advanced search

### QuickChat Assistant

**Path:** `apps/frontend/src/components/QuickChat/`

AI-powered chat assistant providing:

- Natural language queries
- Context-aware responses
- Multi-provider AI support
- Session management

---

## 🔧 Backend API Modules

Located in: `apps/backend/src/routes/`

### AI Module

**Path:** `apps/backend/src/routes/ai/`  
**Documentation:** [docs/README.md](../../apps/backend/src/routes/ai/docs/README.md)

Comprehensive AI integration system:

**Sub-Documentation:**

- [Provider System](../../apps/backend/src/routes/ai/docs/README_PROVIDER.md) - 13 AI providers
- [Service Layer](../../apps/backend/src/routes/ai/docs/README_SERVICE.md) - AI services (chat, audio, translation, vision)
- [Tools Registry](../../apps/backend/src/routes/ai/docs/README_TOOLS.md) - ERP, database, file, system tools
- [Workflow Engine](../../apps/backend/src/routes/ai/docs/README_WORKFLOWS.md) - Complex AI orchestration
- [Type System](../../apps/backend/src/routes/ai/docs/README_TYPES.md) - TypeScript types
- [Utilities](../../apps/backend/src/routes/ai/docs/README_UTILS.md) - Helper functions
- [Router](../../apps/backend/src/routes/ai/docs/README_ROUTER.md) - API endpoints
- [Complete Documentation](../../apps/backend/src/routes/ai/docs/README_ALL.md) - All-in-one reference

**Endpoints:** 20+ AI-related endpoints  
**Status:** ✅ Production-Ready

### AI Annotator

**Path:** `apps/backend/src/routes/aiAnnotatorRouter/`  
**Documentation:** [docs/README.md](../../apps/backend/src/routes/aiAnnotatorRouter/docs/README.md)

Automated metadata generation and enhancement:

- Function node annotation
- PII classification
- Schema enhancement
- Batch processing
- Quality assurance

**Workflow Documentation:** [AI_ANNOTATOR_WORKFLOW.md](../AI_ANNOTATOR_WORKFLOW.md)  
**Status:** ✅ Production-Ready

### HR Module

**Path:** `apps/backend/src/routes/hr/`  
**Documentation:** [docs/README.md](../../apps/backend/src/routes/hr/docs/README.md)

Human Resources management:

**Features:**

- Employee management (CRUD operations)
- Time tracking
- Leave management
- Payroll (basic)
- Department management
- HR statistics

**Endpoints:** 14 fully documented endpoints  
**Status:** ✅ Production-Ready (APIs complete, frontend integration pending)

**Key Capabilities:**

- Full CRUD for employees
- Zod input validation
- Standardized error handling
- Comprehensive test coverage

### Finance Module

**Path:** `apps/backend/src/routes/finance/`  
**Documentation:** [docs/README.md](../../apps/backend/src/routes/finance/docs/README.md)

Financial management and accounting:

**Features:**

- Invoice management
- Customer management (Accounts Receivable)
- Supplier management (Accounts Payable)
- Payment processing
- Chart of accounts
- Transaction management
- Financial reports (Balance Sheet, P&L)
- Statistics

**Endpoints:** 19 fully documented endpoints  
**Status:** ✅ Production-Ready (APIs complete, frontend integration pending)

**Key Capabilities:**

- Complete accounting cycle
- Zod input validation
- Standardized error handling
- Financial reporting

### Dashboard Router

**Path:** `apps/backend/src/routes/dashboard/`  
**Documentation:** [docs/README.md](../../apps/backend/src/routes/dashboard/docs/README.md)

Dashboard data and system information:

- System health monitoring
- Dashboard overview
- Context/logs retrieval

**Endpoints:** 3 endpoints  
**Status:** ✅ Production-Ready

### Functions Catalog Router

**Path:** `apps/backend/src/routes/functionsCatalog/`  
**Documentation:** [docs/README.md](../../apps/backend/src/routes/functionsCatalog/docs/README.md)

Function catalog management:

**Features:**

- 15,472 function nodes
- Hierarchical structure
- Full-text search
- Metadata management
- RBAC filtering
- Import/export

**Endpoints:** 12+ endpoints  
**Status:** ✅ Production-Ready

**Transformation Documentation:** [FUNCTION_NODE_TRANSFORMATION.md](../FUNCTION_NODE_TRANSFORMATION.md)

### QuickChat Router

**Path:** `apps/backend/src/routes/quickchat/`

AI chat assistant API:

- Natural language processing
- Context management
- Multi-provider support

**Endpoints:** 3 endpoints  
**Status:** ✅ Production-Ready with standardized error handling

### System Info Router

**Path:** `apps/backend/src/routes/systemInfoRouter/`  
**Documentation:** [docs/README.md](../../apps/backend/src/routes/systemInfoRouter/docs/README.md)

System monitoring and diagnostics:

- Health checks
- System metrics
- Performance monitoring

**Endpoints:** 5+ endpoints  
**Status:** ✅ Production-Ready

### Auth Router

**Path:** `apps/backend/src/routes/auth/`

Authentication and authorization:

- JWT-based authentication
- Login/logout
- Token refresh
- RBAC

**Documentation:** [AUTHENTICATION.md](../AUTHENTICATION.md)  
**Status:** ✅ Production-Ready

### Additional Routers

**Calendar Service**  
Path: `apps/backend/src/routes/calendar/`  
Status: Beta

**Diagnostics Router**  
Path: `apps/backend/src/routes/diagnostics/`  
Status: Beta

**Innovation Router**  
Path: `apps/backend/src/routes/innovation/`  
Status: Beta

---

## 🏗️ Core Services & Infrastructure

### Resilience Layer

**Path:** `src/resilience/`

Production-ready infrastructure:

- **SAGA Pattern** - Transaction coordination
- **Circuit Breaker** - Failure handling
- **Retry Policy** - Exponential backoff
- **Idempotency Store** - Duplicate prevention

**Documentation:** [ARCHITECTURE.md](../ARCHITECTURE.md#resilience-patterns)

### Database Layer

**Path:** `src/database/`

Database management:

- SQLite (development)
- PostgreSQL (production-ready)
- Migrations system
- Audit trail

**Documentation:** [DATABASE_MIGRATIONS.md](../DATABASE_MIGRATIONS.md)

### Middleware

**Path:** `apps/backend/src/middleware/`  
**Documentation:** [README.md](../../apps/backend/src/middleware/README.md)

Express middleware:

- Authentication
- Error handling
- Rate limiting
- Logging
- CORS

---

## 📊 Module Status Overview

| Module            | Status        | Endpoints | Tests       | Documentation    |
| ----------------- | ------------- | --------- | ----------- | ---------------- |
| AI Module         | ✅ Production | 20+       | ✅ Complete | ✅ Comprehensive |
| AI Annotator      | ✅ Production | 8         | ✅ Complete | ✅ Comprehensive |
| HR Module         | ✅ Production | 14        | ✅ Complete | ✅ Comprehensive |
| Finance Module    | ✅ Production | 19        | ✅ Complete | ✅ Comprehensive |
| Functions Catalog | ✅ Production | 12+       | ✅ Complete | ✅ Comprehensive |
| Dashboard         | ✅ Production | 3         | ✅ Complete | ✅ Complete      |
| QuickChat         | ✅ Production | 3         | ✅ Complete | ✅ Complete      |
| Auth              | ✅ Production | 5         | ✅ Complete | ✅ Complete      |
| System Info       | ✅ Production | 5+        | ✅ Complete | ✅ Complete      |
| Calendar          | 🔄 Beta       | 4         | ⚠️ Partial  | ⚠️ Partial       |
| Diagnostics       | 🔄 Beta       | 3         | ⚠️ Partial  | ⚠️ Partial       |
| Innovation        | 🔄 Beta       | 2         | ⚠️ Partial  | ⚠️ Partial       |

**Legend:**

- ✅ Production-Ready / Complete
- 🔄 Beta / In Development
- ⚠️ Partial / Needs Work
- ❌ Not Available

---

## 🎯 Quick Navigation

### By Use Case

**Need to integrate AI features?**
→ [AI Module Documentation](../../apps/backend/src/routes/ai/docs/README.md)

**Building HR features?**
→ [HR Module Documentation](../../apps/backend/src/routes/hr/docs/README.md)

**Working with finances?**
→ [Finance Module Documentation](../../apps/backend/src/routes/finance/docs/README.md)

**Need function catalog?**
→ [Functions Catalog Documentation](../../apps/backend/src/routes/functionsCatalog/docs/README.md)

**Setting up authentication?**
→ [Authentication Guide](../AUTHENTICATION.md)

### By Technology

**Frontend (React):**

- [Dashboard Component](../../apps/frontend/src/components/Dashboard/README.md)
- [Functions Catalog Component](../../apps/frontend/src/components/FunctionsCatalog/README_FunctionsCatalog.md)

**Backend (Express):**

- [API Overview](../api/API_DOCUMENTATION.md)
- [Error Handling](../ERROR_STANDARDIZATION_GUIDE.md)

**Database:**

- [Database Migrations](../DATABASE_MIGRATIONS.md)
- [Database Schema](./database-schema.md)

**Infrastructure:**

- [Architecture Overview](../ARCHITECTURE.md)
- [Performance Features](../PERFORMANCE_FEATURES.md)

---

## 📚 Related Documentation

- [Getting Started Tutorial](../tutorials/getting-started.md)
- [API Documentation](../api/API_DOCUMENTATION.md)
- [Code Conventions](../CODE_CONVENTIONS.md)
- [Contributing Guide](../../CONTRIBUTING.md)

---

## 📧 Contact & Support

**Questions about a specific module?**

- Check the module's README.md in its directory
- See [SUPPORT.md](../../SUPPORT.md) for getting help
- Open an [issue](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues)

**Want to contribute to a module?**

- See [CONTRIBUTING.md](../../CONTRIBUTING.md)
- Check module-specific contribution guidelines

---

**Document Version:** 1.0.0  
**Last Updated:** December 6, 2025  
**Maintainer:** Thomas Heisig

**Coverage:** 12 major modules, 90+ endpoints, comprehensive documentation
