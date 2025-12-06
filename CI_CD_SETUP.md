# CI/CD Setup Documentation

**Version**: 1.0.0  
**Last Updated**: December 6, 2025  
**Status**: ✅ Implemented

---

## Overview

This document describes the Continuous Integration and Continuous Deployment (CI/CD) infrastructure for the ERP SteinmetZ project. The CI/CD pipeline is implemented using **GitHub Actions** and provides automated testing, linting, building, and security scanning.

## Architecture

The CI/CD pipeline consists of four main workflows:

1. **Tests** (`test.yml`) - Automated test execution
2. **Lint** (`lint.yml`) - Code quality and style checks
3. **Build** (`build.yml`) - Application build verification
4. **CodeQL** (`codeql.yml`) - Security vulnerability scanning

## Workflows

### 1. Test Workflow (test.yml)

**Triggers:**
- Push to `main`, `develop`, or `copilot/**` branches
- Pull requests to `main` or `develop`

**Matrix Strategy:**
- Node.js versions: 18.x, 20.x

**Steps:**
1. Checkout code
2. Setup Node.js environment
3. Install dependencies (`npm ci --ignore-scripts`)
4. Rebuild native modules (better-sqlite3)
5. Run backend tests (`npm run test:backend`)
6. Run frontend tests (`npm run test:frontend`)
7. Upload coverage reports to Codecov (Node.js 20.x only)

**Test Statistics:**
- Backend: 6 test files, 42 tests
- Frontend: 3 test files, 50 tests
- **Total: 92 tests**

**Environment Variables:**
- `NODE_ENV=test` - Test environment configuration

### 2. Lint Workflow (lint.yml)

**Triggers:**
- Push to `main`, `develop`, or `copilot/**` branches
- Pull requests to `main` or `develop`

**Steps:**
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies
4. TypeScript type checking (backend & frontend)
5. Prettier format checking

**Linting Tools:**
- **TypeScript Compiler** - Type safety verification
- **Prettier** - Code formatting consistency

### 3. Build Workflow (build.yml)

**Triggers:**
- Push to `main`, `develop`, or `copilot/**` branches
- Pull requests to `main` or `develop`

**Steps:**
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies
4. Rebuild native modules
5. Build backend (`npm run build -w @erp-steinmetz/backend`)
6. Build frontend (`npm run build -w @erp-steinmetz/frontend`)
7. Upload build artifacts (7-day retention)

**Build Artifacts:**
- `backend-build` - Backend compiled files (`apps/backend/dist`)
- `frontend-build` - Frontend static files (`apps/frontend/dist`)

**Environment Variables:**
- `NODE_ENV=production` - Production build configuration

### 4. CodeQL Security Scan (codeql.yml)

**Triggers:**
- Push to `main`, `develop`
- Pull requests to `main`, `develop`
- Weekly schedule (Mondays at 6 AM UTC)

**Languages Scanned:**
- JavaScript
- TypeScript

**Analysis Type:**
- Security vulnerabilities
- Code quality issues

**Permissions Required:**
- `actions: read`
- `contents: read`
- `security-events: write`

## Workflow Diagram

```
┌─────────────┐
│  Push/PR    │
└──────┬──────┘
       │
       ├─────────────┬─────────────┬─────────────┐
       │             │             │             │
   ┌───▼───┐    ┌───▼───┐    ┌───▼───┐    ┌───▼──────┐
   │ Tests │    │  Lint │    │ Build │    │  CodeQL  │
   └───┬───┘    └───┬───┘    └───┬───┘    └───┬──────┘
       │             │             │             │
   ┌───▼───┐    ┌───▼───┐    ┌───▼───┐    ┌───▼──────┐
   │  92   │    │  ✓    │    │  ✓    │    │    ✓     │
   │ Tests │    │  Pass │    │  Pass │    │   Pass   │
   └───────┘    └───────┘    └───────┘    └──────────┘
```

## Pre-commit Hooks

Local quality checks are enforced using **Husky** pre-commit hooks:

### Pre-commit Hook
- **Prettier formatting** - Automatic code formatting

### Commit-msg Hook
- **Commitlint** - Conventional commit message validation

**Configuration Files:**
- `.husky/pre-commit` - Pre-commit hook script
- `.husky/commit-msg` - Commit message validation
- `.commitlintrc.json` - Commitlint configuration

See [COMMIT_CONVENTIONS.md](COMMIT_CONVENTIONS.md) for commit message standards.

## Setup Instructions

### Prerequisites

- Node.js >= 18.18.0
- npm >= 9.0.0
- Git

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1.git
   cd ERP_SteinmetZ_V1
   ```

2. **Install dependencies:**
   ```bash
   npm install --ignore-scripts
   ```

3. **Rebuild native modules:**
   ```bash
   npm rebuild better-sqlite3
   ```

4. **Setup Husky hooks:**
   ```bash
   npm run prepare
   ```

5. **Run tests locally:**
   ```bash
   npm test
   ```

6. **Run linting locally:**
   ```bash
   npx prettier --check "**/*.{js,jsx,ts,tsx,json,css,md}"
   ```

7. **Build the application:**
   ```bash
   npm run build
   ```

## GitHub Actions Configuration

### Required Secrets

The following secrets need to be configured in GitHub repository settings:

| Secret | Description | Required |
|--------|-------------|----------|
| `CODECOV_TOKEN` | Codecov upload token | Optional |

### Repository Settings

**Branch Protection Rules (Recommended):**

For `main` branch:
- ✅ Require status checks to pass before merging
  - ✅ Tests (Node.js 18.x, 20.x)
  - ✅ Lint
  - ✅ Build
  - ✅ CodeQL Analysis
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Require linear history

## Monitoring & Notifications

### Test Coverage

Test coverage reports are automatically uploaded to **Codecov** for Node.js 20.x builds.

**Coverage Targets:**
- Backend: 86% (Goal: 90%)
- Frontend: To be measured

### Build Status

Build status badges can be added to README.md:

```markdown
![Tests](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/workflows/Tests/badge.svg)
![Build](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/workflows/Build/badge.svg)
![CodeQL](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/workflows/CodeQL/badge.svg)
```

### Notification Channels

- **GitHub UI** - Workflow run status
- **Email** - Workflow failures (configurable per user)
- **Pull Request Comments** - Test results and coverage changes

## Troubleshooting

### Common Issues

#### 1. Native Module Build Failures

**Problem:** better-sqlite3 fails to build

**Solution:**
```bash
npm rebuild better-sqlite3
```

#### 2. Test Failures

**Problem:** Tests pass locally but fail in CI

**Solution:**
- Check Node.js version compatibility
- Verify environment variables are set
- Review test logs in GitHub Actions

#### 3. Lint Failures

**Problem:** Prettier formatting issues

**Solution:**
```bash
npm run format
```

#### 4. Build Failures

**Problem:** TypeScript compilation errors

**Solution:**
```bash
# Check types locally
npm run typecheck -w @erp-steinmetz/backend
npm run typecheck -w @erp-steinmetz/frontend
```

### Debug Mode

To debug CI workflows locally, use [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflows locally
act push
act pull_request
```

## Performance Optimization

### Caching Strategy

The workflows use GitHub Actions cache for:
- **npm cache** - Dependency caching via `actions/setup-node@v4`

### Parallelization

- Tests run in parallel across Node.js versions
- Backend and frontend tests run sequentially (shared database)

### Resource Usage

- **Average workflow duration:**
  - Tests: ~2-3 minutes
  - Lint: ~1 minute
  - Build: ~3-4 minutes
  - CodeQL: ~5-10 minutes

## Security Considerations

### CodeQL Analysis

- **Queries:** Security and quality rules
- **Frequency:** Weekly scheduled scans + PR/Push triggers
- **Languages:** JavaScript, TypeScript

### Secrets Management

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate tokens regularly

### Dependency Security

- Regular dependency updates via Dependabot
- `npm audit` for vulnerability scanning
- Automated security patches

## Future Enhancements

### Planned Improvements

- [ ] **Deployment Workflow** - Automated deployment to staging/production
- [ ] **E2E Tests** - Integration with Playwright/Cypress
- [ ] **Performance Testing** - Lighthouse CI for frontend
- [ ] **Docker Builds** - Container image creation
- [ ] **Release Automation** - Semantic versioning and changelog generation
- [ ] **Dependency Updates** - Dependabot configuration
- [ ] **Code Quality Metrics** - SonarQube integration

### Deployment Pipeline (Planned)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   Dev    │ ──> │  Staging │ ──> │   Prod   │
└──────────┘     └──────────┘     └──────────┘
     │                 │                 │
  Auto Deploy      Manual Approve   Tag Release
```

## Maintenance

### Regular Tasks

- **Weekly:** Review CodeQL security alerts
- **Monthly:** Update dependencies
- **Quarterly:** Review and optimize workflow performance

### Contacts

- **Maintainer:** Thomas Heisig
- **CI/CD Issues:** Open GitHub issue with `ci/cd` label

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Prettier Documentation](https://prettier.io/docs/en/)

---

**Document Version:** 1.0.0  
**Last Review:** December 6, 2025  
**Next Review:** March 2026
