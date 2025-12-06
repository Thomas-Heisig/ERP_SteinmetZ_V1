# ERP SteinmetZ - Documentation Hub

Welcome to the ERP SteinmetZ documentation! This directory contains comprehensive documentation for the project.

## 📚 Quick Navigation

### For New Developers

Start here if you're new to the project:

1. **[Developer Onboarding Guide](./DEVELOPER_ONBOARDING.md)** ⭐
   - Prerequisites and setup
   - Installation instructions
   - Troubleshooting common issues
   - Development workflow

2. **[Code Conventions](./CODE_CONVENTIONS.md)**
   - TypeScript style guide
   - Naming conventions
   - Best practices
   - Testing guidelines

### For API Users

If you're integrating with the API:

1. **[API Documentation](./api/API_DOCUMENTATION.md)** ⭐
   - Complete API reference
   - Request/response examples
   - Authentication guide
   - Error handling

2. **[OpenAPI Specification](./api/openapi.yaml)**
   - Machine-readable API spec
   - Use with Swagger UI
   - Generate client code

3. **[Postman Collection](./api/postman-collection.json)**
   - Import and test endpoints
   - Pre-configured examples

### For Architects & Tech Leads

Understanding architectural decisions:

1. **[Architecture Decision Records](./adr/README.md)** ⭐
   - ADR 001: Monorepo Structure
   - ADR 002: TypeScript Adoption
   - ADR 003: Multi-Provider AI System
   - ADR 004: SQLite for Development
   - ADR 005: React 19 for Frontend

2. **[System Architecture](./ARCHITECTURE.md)**
   - High-level architecture
   - Component overview
   - Data flow

### Technical Documentation

- **[Environment Variables](./ENVIRONMENT_VARIABLES.md)** - Configuration guide
- **[Database Migrations](./DATABASE_MIGRATIONS.md)** - Migration system
- **[Authentication](./AUTHENTICATION.md)** - Auth system details
- **[Compliance](./COMPLIANCE.md)** - Security and GDPR
- **[Performance Features](./PERFORMANCE_FEATURES.md)** ⭐ NEU - WebSocket, Caching, Query Monitoring
- **[Error Standardization](./ERROR_STANDARDIZATION_GUIDE.md)** - Error handling guide
- **[Code Quality](./CODE_QUALITY_IMPROVEMENTS.md)** - Quality improvements roadmap

### Project Management

- **[TODO List](../TODO.md)** - Planned features and tasks
- **[Issues](../ISSUES.md)** - Known problems and technical debt
- **[Changelog](../CHANGELOG_2024-12-04.md)** - Recent changes

---

## 📖 Documentation Structure

```
docs/
├── README.md (you are here)
│
├── 👨‍💻 For Developers
│   ├── DEVELOPER_ONBOARDING.md    # Start here!
│   ├── CODE_CONVENTIONS.md         # Coding standards
│   └── ARCHITECTURE.md             # System overview
│
├── 🔌 API Documentation
│   └── api/
│       ├── README.md               # API docs overview
│       ├── API_DOCUMENTATION.md    # Full API reference
│       ├── openapi.yaml            # OpenAPI 3.0 spec
│       └── postman-collection.json # Postman collection
│
├── 🏛️ Architecture
│   └── adr/
│       ├── README.md               # ADR overview
│       ├── 000-template.md         # ADR template
│       └── 001-005-*.md            # Decision records
│
├── 🔧 Technical Guides
│   ├── ENVIRONMENT_VARIABLES.md    # Config reference
│   ├── DATABASE_MIGRATIONS.md      # Migration guide
│   ├── AUTHENTICATION.md           # Auth system
│   └── COMPLIANCE.md               # Security/GDPR
│
└── 📋 Project Info
    └── concept/                    # Original concept docs
```

---

## 🚀 Getting Started

### Quick Start (5 minutes)

1. **Clone the repo:**

   ```bash
   git clone https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1.git
   cd ERP_SteinmetZ_V1
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment:**

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   ```

4. **Start development servers:**

   ```bash
   npm run dev
   ```

5. **Open in browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api/health

**Need more details?** → [Developer Onboarding Guide](./DEVELOPER_ONBOARDING.md)

---

## 📝 Documentation Standards

### When to Update Documentation

Update documentation when you:

- Add a new API endpoint → Update `api/`
- Change architecture → Create/update ADR
- Add new feature → Update README
- Change setup process → Update DEVELOPER_ONBOARDING.md
- Fix a common issue → Update troubleshooting section

### How to Contribute Documentation

1. **For API changes:**
   - Update OpenAPI spec (`api/openapi.yaml`)
   - Update API docs (`api/API_DOCUMENTATION.md`)
   - Update Postman collection

2. **For architectural decisions:**
   - Create new ADR using template
   - Follow ADR format
   - Update ADR index

3. **For code changes:**
   - Follow CODE_CONVENTIONS.md
   - Add JSDoc comments
   - Update relevant guides

---

## 🎯 Documentation Goals

Our documentation aims to:

- ✅ Enable new developers to start quickly (< 30 minutes)
- ✅ Provide complete API reference with examples
- ✅ Document architectural decisions and rationale
- ✅ Maintain consistent code standards
- ✅ Support troubleshooting common issues

---

## 📊 Documentation Coverage

| Area             | Status      | Quality    |
| ---------------- | ----------- | ---------- |
| Getting Started  | ✅ Complete | ⭐⭐⭐⭐⭐ |
| API Reference    | ✅ Complete | ⭐⭐⭐⭐⭐ |
| Code Conventions | ✅ Complete | ⭐⭐⭐⭐⭐ |
| Architecture     | ✅ Complete | ⭐⭐⭐⭐⭐ |
| Troubleshooting  | ✅ Complete | ⭐⭐⭐⭐   |
| Testing Guide    | ⚠️ Partial  | ⭐⭐⭐     |
| Deployment       | ⚠️ Partial  | ⭐⭐       |

---

## 🔍 Finding What You Need

### I want to...

**...start developing**
→ [Developer Onboarding](./DEVELOPER_ONBOARDING.md)

**...use the API**
→ [API Documentation](./api/API_DOCUMENTATION.md)

**...understand the architecture**
→ [ADRs](./adr/README.md) and [Architecture](./ARCHITECTURE.md)

**...fix a problem**
→ [Troubleshooting](./DEVELOPER_ONBOARDING.md#troubleshooting)

**...follow code standards**
→ [Code Conventions](./CODE_CONVENTIONS.md)

**...configure the system**
→ [Environment Variables](./ENVIRONMENT_VARIABLES.md)

**...understand auth**
→ [Authentication](./AUTHENTICATION.md)

**...optimize performance**
→ [Performance Features](./PERFORMANCE_FEATURES.md)

**...handle errors properly**
→ [Error Standardization](./ERROR_STANDARDIZATION_GUIDE.md)

**...see what's planned**
→ [TODO List](../TODO.md)

---

## 🤝 Contributing

See [DEVELOPER_ONBOARDING.md](./DEVELOPER_ONBOARDING.md#development-workflow) for:

- Git workflow
- Branch naming
- Commit messages
- Pull request process

---

## 📧 Support

**Questions?**

- Check [GitHub Issues](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues)
- Read [Troubleshooting](./DEVELOPER_ONBOARDING.md#troubleshooting)
- Review [FAQ](./DEVELOPER_ONBOARDING.md)

**Found a bug?**

- Check [Known Issues](../ISSUES.md)
- Create new issue if not listed

**Need help?**

- Contact: Thomas Heisig
- GitHub: [@Thomas-Heisig](https://github.com/Thomas-Heisig)

---

## 📜 License

See [LICENSE](../LICENSE) file for details.

---

## 🆕 Neue Dokumentation (Dezember 2025)

### AI & Function Transformation

- **[AI Annotator Workflow](./AI_ANNOTATOR_WORKFLOW.md)** ⭐ NEU
  - Vollständiger Datenverarbeitungs-Workflow
  - 15.472 Funktionsknoten-Verarbeitung
  - PII-Klassifikation und Compliance
  - Quality Assurance Prozess

- **[Function Node Transformation](./FUNCTION_NODE_TRANSFORMATION.md)** ⭐ NEU
  - Markdown → TypeScript Code-Generierung
  - Instruction-Driven ERP Konzept
  - Automatische API-Endpoint-Erstellung
  - Test-Generierung

### Internationale Standards

- **ISO/IEC 25010**: Software-Qualitätsmodell (siehe [ARCHITECTURE.md](./ARCHITECTURE.md))
- **IEEE 1471**: Architektur-Beschreibung
- **OpenAPI 3.0**: API-Spezifikation
- **JSON Schema Draft-07**: Datenvalidierung

---

**Version:** 0.3.0  
**Last Updated:** December 6, 2025  
**Maintainer:** Thomas Heisig

**Documentation Status:** ✅ Complete and up-to-date (85 Dateien, 93% aktuell)
