# 001. Monorepo Structure with npm Workspaces

**Date:** 2024-12-04  
**Status:** Accepted

## Context

The ERP SteinmetZ project consists of multiple related components:

- Backend (Express API server)
- Frontend (React application)
- Shared utilities and patterns (resilience, SAGA)

We needed to decide on a repository structure that would:

- Support independent development and deployment of each component
- Enable code sharing between components
- Simplify dependency management
- Maintain a good developer experience

## Decision

We adopt a monorepo structure using npm workspaces.

**Structure:**

```
ERP_SteinmetZ_V1/
├── apps/
│   ├── backend/     # @erp-steinmetz/backend
│   └── frontend/    # @erp-steinmetz/frontend
├── packages/        # Shared packages (future)
├── src/             # Shared resilience patterns
└── package.json     # Root workspace configuration
```

**Key features:**

- Each app has its own `package.json` and dependencies
- Shared code in `src/` directory for common patterns
- Single `node_modules` at root (with hoisting)
- Unified scripts at root level for all workspaces
- Independent build and deployment

## Alternatives Considered

### Alternative 1: Separate Repositories

- **Pros:** Complete independence, simpler CI/CD
- **Cons:** Difficult code sharing, version synchronization issues
- **Why not:** Too much overhead for a medium-sized project

### Alternative 2: Lerna

- **Pros:** More features, version management
- **Cons:** Additional complexity, maintenance overhead
- **Why not:** npm workspaces are sufficient and built-in

### Alternative 3: Monolith (single app)

- **Pros:** Simplest structure
- **Cons:** No clear separation, harder to scale
- **Why not:** Need independent deployment of frontend/backend

## Consequences

### Positive

- **Code Sharing:** Easy to share types, utilities between apps
- **Unified Dependencies:** Single `node_modules`, faster installs
- **Developer Experience:** Run all apps with single command
- **Consistency:** Shared tooling (ESLint, Prettier, TypeScript)
- **Atomic Changes:** Changes across apps in single commit/PR

### Negative

- **Build Complexity:** Need to coordinate builds across workspaces
- **Dependency Conflicts:** Must resolve version conflicts across apps
- **Learning Curve:** Developers need to understand workspace structure

### Risks

- **Risk:** Accidental coupling between apps
  - **Mitigation:** Enforce clear boundaries, use explicit exports
- **Risk:** Slower CI/CD as project grows
  - **Mitigation:** Implement selective testing/building

## Implementation Notes

**Workspace Configuration** (`package.json`):

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

**Key Scripts:**

```json
{
  "dev": "run-p -l dev:backend dev:frontend",
  "build": "npm run build -ws",
  "test": "vitest"
}
```

## References

- [npm Workspaces Documentation](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
- [Monorepo Best Practices](https://monorepo.tools/)

---

**Author:** Thomas Heisig  
**Status:** Accepted  
**Last Updated:** 2024-12-04
