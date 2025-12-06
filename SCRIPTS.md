# NPM Scripts Documentation

This document describes all available npm scripts in the ERP SteinmetZ project.

## Development Scripts

### `npm run dev`

Starts both backend and frontend development servers in parallel with live reload.

- Backend runs on port 3000 (default)
- Frontend runs on port 5173 (default)
- Uses `npm-run-all` to run both servers simultaneously

### `npm run dev:backend`

Starts only the backend development server with live reload using ts-node-dev.

### `npm run dev:frontend`

Starts only the frontend development server using Vite dev server.

## Build Scripts

### `npm run build`

Builds both backend and frontend for production. This is the recommended command before deployment.

### `npm run build:backend`

Compiles TypeScript backend code to JavaScript in the `apps/backend/dist` directory.

- Cleans previous build
- Compiles with TypeScript
- Copies assets (views, migrations)
- Updates build date

### `npm run build:frontend`

Builds optimized production bundle for frontend using Vite.

- Outputs to `apps/frontend/dist`
- Includes code splitting and minification
- Generates source maps

## Start Scripts

### `npm start`

Builds the project and starts the backend production server. Use this for production deployment.

### `npm run start:backend`

Starts the backend production server (requires build first).

### `npm run start:frontend`

Serves the frontend production build using Vite preview server.

## Test Scripts

### `npm test`

Runs all tests for both backend and frontend with appropriate test environments.

- Backend: Node.js environment
- Frontend: jsdom (browser simulation)
- Total: 92 tests (42 backend, 50 frontend)

### `npm run test:backend`

Runs only backend tests using Vitest with Node.js environment.

### `npm run test:frontend`

Runs only frontend tests using Vitest with jsdom environment.

### `npm run test:ui`

Opens Vitest UI for interactive test running and debugging.

- Provides visual test runner
- Shows test coverage
- Allows test filtering and watching

### `npm run test:coverage`

Runs all tests with coverage reports for both backend and frontend.

- Generates HTML, JSON, and text reports
- Coverage reports saved to `coverage/` directory
- Current coverage: ~86% (target: 90%)

## Cleanup Scripts

### `npm run clean`

Removes all node_modules and dist directories from the entire project.
⚠️ **Warning**: This will require reinstalling dependencies with `npm install`.

### `npm run clean:backend`

Removes only the backend build directory (`apps/backend/dist`).

### `npm run clean:frontend`

Removes only the frontend build directory (`apps/frontend/dist`).

## Code Quality Scripts

### `npm run lint`

Runs ESLint on all workspaces to check for code quality issues.

- Checks both backend and frontend
- Uses workspace-specific ESLint configs

### `npm run format`

Formats all code using Prettier according to project style guide.

- Formats TypeScript, JavaScript, JSON, Markdown, etc.
- Applies consistent code style across entire project

### `npm run prepare`

Automatically runs `format` after package installation (Git hook).

- Ensures code is formatted before committing
- Part of the pre-install process

## Workspace Commands

All scripts support workspace-specific execution using the `-w` flag:

```bash
# Run any script in a specific workspace
npm run <script> -w @erp-steinmetz/backend
npm run <script> -w @erp-steinmetz/frontend
```

## Quick Reference

| Command          | Description           | Use Case            |
| ---------------- | --------------------- | ------------------- |
| `npm run dev`    | Start dev servers     | Local development   |
| `npm run build`  | Build for production  | Pre-deployment      |
| `npm start`      | Run production build  | Production server   |
| `npm test`       | Run all tests         | CI/CD, verification |
| `npm run lint`   | Check code quality    | Pre-commit          |
| `npm run format` | Format code           | Code cleanup        |
| `npm run clean`  | Clean build artifacts | Troubleshooting     |

## Common Workflows

### Starting Development

```bash
npm install              # Install dependencies
npm run dev             # Start dev servers
```

### Running Tests

```bash
npm test                # Run all tests
npm run test:ui         # Interactive test runner
npm run test:coverage   # With coverage report
```

### Production Build

```bash
npm run build           # Build everything
npm start              # Start production server
```

### Code Quality Check

```bash
npm run lint            # Check for issues
npm run format          # Auto-format code
npm test               # Verify tests pass
```

## Troubleshooting

### Build fails

```bash
npm run clean          # Clean all artifacts
npm install            # Reinstall dependencies
npm run build          # Try build again
```

### Tests fail

```bash
npm run test:backend   # Test backend only
npm run test:frontend  # Test frontend only
npm run test:ui        # Debug with UI
```

### Dependencies issues

```bash
npm run clean          # Remove all node_modules
npm install            # Fresh install
```

## See Also

- [DEVELOPER_ONBOARDING.md](docs/DEVELOPER_ONBOARDING.md) - Setup guide
- [CODE_CONVENTIONS.md](docs/CODE_CONVENTIONS.md) - Code style guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
