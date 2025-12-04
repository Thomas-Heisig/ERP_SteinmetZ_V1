# Developer Onboarding Guide

Welcome to ERP SteinmetZ! This guide will help you get started with development on this project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Conventions](#code-conventions)
- [Troubleshooting](#troubleshooting)
- [Useful Resources](#useful-resources)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js** >= 18.18.0 (LTS recommended)

  ```bash
  node --version  # Should be >= 18.18.0
  ```

- **npm** >= 9.0.0 (comes with Node.js)

  ```bash
  npm --version
  ```

- **Git** >= 2.30.0
  ```bash
  git --version
  ```

### Optional but Recommended

- **Visual Studio Code** (or your preferred IDE)
  - Extensions:
    - ESLint
    - Prettier
    - TypeScript and JavaScript Language Features
    - EditorConfig

- **Ollama** (for local AI development)

  ```bash
  # Install Ollama from https://ollama.ai
  ollama pull qwen2.5:3b
  ```

- **PostgreSQL** (for production database)
  - SQLite is used by default in development

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1.git
cd ERP_SteinmetZ_V1
```

### 2. Install Dependencies

```bash
npm install
```

This will install dependencies for all workspaces (root, backend, frontend).

**Note:** You may see some deprecation warnings - these are expected and don't affect functionality.

### 3. Environment Configuration

#### Backend Configuration

Copy the example environment file:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env` with your preferred settings:

```bash
# Minimal configuration for development
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database (SQLite default)
DB_DRIVER=sqlite
SQLITE_FILE=../../data/dev.sqlite3

# AI Provider (Ollama is recommended for local development)
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b

# Functions Catalog
FUNCTIONS_DIR=./docs/functions
FUNCTIONS_AUTOLOAD=1
FUNCTIONS_WATCH=1

# Security (change in production!)
JWT_SECRET=change-me-in-production-use-a-long-random-string
```

#### Frontend Configuration

Copy the example environment file:

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

Edit `apps/frontend/.env`:

```bash
VITE_BACKEND_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3000
```

### 4. Database Setup

The SQLite database will be created automatically on first run. If you want to use PostgreSQL:

```bash
# In .env, change:
DB_DRIVER=postgresql
DATABASE_URL=postgresql://user:password@localhost:5432/erp_steinmetz

# Run migrations
npm run migrate
```

### 5. Start Development Servers

```bash
# Start both backend and frontend
npm run dev

# Or start them separately:
npm run dev:backend  # Backend on http://localhost:3000
npm run dev:frontend # Frontend on http://localhost:5173
```

### 6. Verify Installation

Open your browser and navigate to:

- Frontend: http://localhost:5173
- Backend Health: http://localhost:3000/api/health

You should see the ERP SteinmetZ dashboard loading successfully.

---

## Development Environment

### Workspace Structure

This is a monorepo using npm workspaces:

```
ERP_SteinmetZ_V1/
├── apps/
│   ├── backend/           # Express 5 Backend
│   └── frontend/          # React 19 + Vite Frontend
├── packages/              # Shared packages (future)
├── src/                   # Shared resilience patterns
├── docs/                  # Documentation
└── data/                  # Development database
```

### IDE Setup (VS Code)

Recommended VS Code settings (`.vscode/settings.json`):

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  }
}
```

### Available Scripts

#### Root Level

```bash
npm run dev              # Start both backend and frontend
npm run build            # Build all workspaces
npm run test             # Run all tests
npm run test:coverage    # Run tests with coverage report
npm run lint             # Lint all workspaces
npm run format           # Format code with Prettier
npm run clean            # Remove all node_modules and dist
```

#### Backend Specific

```bash
npm run dev -w @erp-steinmetz/backend      # Start backend dev server
npm run build -w @erp-steinmetz/backend    # Build backend
npm run start -w @erp-steinmetz/backend    # Start production backend
npm run test -w @erp-steinmetz/backend     # Run backend tests
```

#### Frontend Specific

```bash
npm run dev -w @erp-steinmetz/frontend     # Start frontend dev server
npm run build -w @erp-steinmetz/frontend   # Build frontend
npm run preview -w @erp-steinmetz/frontend # Preview production build
npm run test -w @erp-steinmetz/frontend    # Run frontend tests
```

---

## Project Structure

### Backend Structure

```
apps/backend/src/
├── routes/              # API route handlers
│   ├── ai/             # AI chat and services
│   ├── auth/           # Authentication
│   ├── dashboard/      # Dashboard endpoints
│   ├── functions/      # Functions catalog
│   └── ...
├── services/           # Business logic
│   ├── authService.ts
│   ├── dbService.ts
│   └── functionsCatalogService.ts
├── middleware/         # Express middleware
│   ├── errorHandler.ts
│   └── auth.ts
├── tools/              # AI tools registry
└── index.ts            # Entry point
```

### Frontend Structure

```
apps/frontend/src/
├── components/         # React components
│   ├── Dashboard/
│   ├── FunctionsCatalog/
│   ├── QuickChat/
│   └── ui/            # Reusable UI components
├── contexts/          # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/             # Custom hooks
├── features/          # Feature modules
├── styles/            # CSS stylesheets
└── main.tsx           # Entry point
```

---

## Development Workflow

### 1. Creating a New Feature

```bash
# 1. Create a feature branch
git checkout -b feature/your-feature-name

# 2. Make your changes

# 3. Run tests
npm run test

# 4. Lint your code
npm run lint

# 5. Build to ensure no TypeScript errors
npm run build

# 6. Commit your changes
git add .
git commit -m "feat: add your feature description"

# 7. Push and create PR
git push origin feature/your-feature-name
```

### 2. Adding a New API Endpoint

Example: Adding a new endpoint to the backend

```typescript
// apps/backend/src/routes/myFeature/myFeatureRouter.ts
import { Router } from "express";

const router = Router();

router.get("/my-endpoint", async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
```

Register it in `apps/backend/src/index.ts`:

```typescript
import myFeatureRouter from "./routes/myFeature/myFeatureRouter.js";

app.use("/api/my-feature", myFeatureRouter);
```

### 3. Adding a New React Component

```typescript
// apps/frontend/src/components/MyComponent/MyComponent.tsx
import React from 'react';
import './MyComponent.css';

export const MyComponent: React.FC = () => {
  return (
    <div className="my-component">
      <h1>My Component</h1>
    </div>
  );
};
```

### 4. Hot Reload

Both backend and frontend have hot reload enabled:

- **Frontend:** Vite provides instant hot module replacement (HMR)
- **Backend:** Changes trigger automatic restart (via nodemon/tsx)

---

## Testing

### Backend Tests

Tests use Vitest:

```bash
# Run backend tests
npm run test -w @erp-steinmetz/backend

# Watch mode
npm run test:watch -w @erp-steinmetz/backend

# Coverage
npm run test:coverage -w @erp-steinmetz/backend
```

Example test:

```typescript
// apps/backend/src/services/myService.test.ts
import { describe, it, expect } from "vitest";
import { myFunction } from "./myService";

describe("myFunction", () => {
  it("should return expected result", () => {
    const result = myFunction("input");
    expect(result).toBe("expected output");
  });
});
```

### Frontend Tests

```bash
# Run frontend tests
npm run test -w @erp-steinmetz/frontend

# Watch mode
npm run test:watch -w @erp-steinmetz/frontend
```

Example test:

```typescript
// apps/frontend/src/components/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('My Component')).toBeInTheDocument();
  });
});
```

---

## Code Conventions

### TypeScript

- Use TypeScript for all new code
- Define interfaces for all data structures
- Avoid `any` types - use proper typing
- Use `unknown` instead of `any` when type is genuinely unknown

### Naming Conventions

**Files:**

- Components: `PascalCase.tsx` (e.g., `Dashboard.tsx`)
- Services: `camelCase.ts` (e.g., `authService.ts`)
- Tests: `*.test.ts` or `*.test.tsx`
- CSS: `PascalCase.css` matching component name

**Variables & Functions:**

- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Functions: `camelCase`
- React Components: `PascalCase`
- Interfaces: `PascalCase` (e.g., `UserProfile`)
- Types: `PascalCase` (e.g., `ApiResponse`)

### Code Style

**Formatting:** Prettier handles formatting automatically.

**ESLint:** Follow ESLint rules. Run `npm run lint` to check.

**Comments:**

```typescript
// Single-line comments for simple explanations

/**
 * Multi-line JSDoc comments for functions and classes
 * @param {string} name - Parameter description
 * @returns {Promise<User>} Return value description
 */
async function getUser(name: string): Promise<User> {
  // Implementation
}
```

### Git Commit Messages

Follow Conventional Commits:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: code style changes (formatting)
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

Examples:

```bash
git commit -m "feat(auth): add JWT refresh token endpoint"
git commit -m "fix(dashboard): resolve widget loading issue"
git commit -m "docs: update API documentation"
```

### API Conventions

**Response Format:**

```typescript
// Success
{
  success: true,
  data: {...},
  message: "Optional message"
}

// Error
{
  success: false,
  error: "Error message",
  details: {...}
}
```

**HTTP Status Codes:**

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Problem:** Port 3000 or 5173 is already in use.

**Solution:**

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows

# Or change the port in .env
PORT=3001
```

#### 2. Dependencies Not Installing

**Problem:** `npm install` fails or shows errors.

**Solution:**

```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 3. TypeScript Build Errors

**Problem:** TypeScript compilation fails.

**Solution:**

```bash
# Check TypeScript version
npx tsc --version

# Rebuild TypeScript
npm run build

# If issues persist, check tsconfig.json
```

#### 4. Ollama Connection Failed

**Problem:** AI endpoints return "Provider unavailable".

**Solution:**

```bash
# Check if Ollama is running
ollama list

# Start Ollama
ollama serve

# Pull required model
ollama pull qwen2.5:3b

# Verify in .env
OLLAMA_BASE_URL=http://localhost:11434
```

#### 5. Database Connection Issues

**Problem:** Database errors on startup.

**Solution:**

```bash
# For SQLite, ensure directory exists
mkdir -p data

# For PostgreSQL, verify connection
psql -h localhost -U your_user -d erp_steinmetz

# Check DATABASE_URL in .env
```

#### 6. Frontend Not Loading

**Problem:** Blank page or errors in browser console.

**Solution:**

```bash
# Check backend is running
curl http://localhost:3000/api/health

# Check CORS settings in backend .env
CORS_ORIGIN=http://localhost:5173

# Clear browser cache and hard reload (Ctrl+Shift+R)
```

#### 7. Tests Failing

**Problem:** Tests fail unexpectedly.

**Solution:**

```bash
# Update test snapshots if needed
npm run test -- -u

# Run specific test file
npm run test -- path/to/test.test.ts

# Check test database configuration
```

### Getting Help

If you're still stuck:

1. Check existing [GitHub Issues](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues)
2. Read the comprehensive [README](../README_COMPREHENSIVE.md)
3. Review [Architecture Documentation](./ARCHITECTURE.md)
4. Create a new issue with:
   - Problem description
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)
   - Error messages or logs

---

## Useful Resources

### Documentation

- [README](../README.md) - Project overview
- [API Documentation](./api/API_DOCUMENTATION.md) - Complete API reference
- [Architecture](./ARCHITECTURE.md) - System architecture
- [TODO List](../TODO.md) - Planned features and tasks
- [Issues](../ISSUES.md) - Known issues and bugs

### External Resources

- [Express Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)

### Tools & Libraries

- **Backend:**
  - Express 5
  - TypeScript
  - Pino (logging)
  - Zod (validation)
  - SQLite/PostgreSQL

- **Frontend:**
  - React 19
  - Vite
  - React Router v7
  - i18next (internationalization)

### Community

- GitHub: https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1
- Issues: https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues

---

## Quick Reference

### Common Commands Cheat Sheet

```bash
# Development
npm run dev                  # Start everything
npm run dev:backend          # Backend only
npm run dev:frontend         # Frontend only

# Building
npm run build                # Build all
npm run build:backend        # Backend only
npm run build:frontend       # Frontend only

# Testing
npm test                     # Run all tests
npm run test:coverage        # With coverage
npm run test:ui              # Visual test UI

# Code Quality
npm run lint                 # Lint all code
npm run format               # Format with Prettier

# Cleaning
npm run clean                # Clean all
npm run clean:backend        # Backend only
npm run clean:frontend       # Frontend only
```

### Environment Variables Quick Reference

**Backend:**

```bash
PORT=3000
NODE_ENV=development
AI_PROVIDER=ollama
DATABASE_URL=sqlite:./data/dev.sqlite3
```

**Frontend:**

```bash
VITE_API_BASE_URL=http://localhost:3000
```

---

**Welcome aboard! Happy coding! 🚀**

---

**Last Updated:** December 4, 2024  
**Maintainer:** Thomas Heisig
