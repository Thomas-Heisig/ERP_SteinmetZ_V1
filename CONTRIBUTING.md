# Contributing to ERP SteinmetZ

First off, thank you for considering contributing to ERP SteinmetZ! It's people like you that make ERP SteinmetZ such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js >= 18.18.0
- npm or yarn
- Git

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/ERP_SteinmetZ_V1.git
   cd ERP_SteinmetZ_V1
   ```

3. **Add upstream remote**:

   ```bash
   git remote add upstream https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1.git
   ```

4. **Install dependencies**:

   ```bash
   npm install
   ```

5. **Set up environment variables**:

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   # Edit .env files with your configuration
   ```

6. **Start development servers**:
   ```bash
   npm run dev
   ```

For detailed setup instructions, see [Developer Onboarding Guide](docs/DEVELOPER_ONBOARDING.md).

## Development Process

### Branching Strategy

We follow the **Git Flow** branching model:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features or enhancements
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical fixes for production
- `docs/*` - Documentation updates

### Creating a Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b bugfix/issue-description
```

### Making Changes

1. **Make your changes** in your feature branch
2. **Follow our [coding standards](#coding-standards)**
3. **Write or update tests** for your changes
4. **Update documentation** as needed
5. **Test your changes**:
   ```bash
   npm run lint
   npm run build
   npm test
   ```

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools

**Examples:**

```bash
feat(hr): add employee search functionality
fix(finance): correct invoice calculation error
docs(api): update authentication endpoints
test(backend): add tests for AI provider service
```

## Submitting Changes

### Pull Request Process

1. **Update your branch** with the latest changes:

   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Push your changes**:

   ```bash
   git push origin your-branch
   ```

3. **Create a Pull Request** on GitHub:
   - Go to your fork on GitHub
   - Click "Pull Request"
   - Select your branch
   - Fill out the PR template
   - Link related issues

4. **PR Requirements**:
   - [ ] All tests pass
   - [ ] Code follows our style guidelines
   - [ ] Documentation is updated
   - [ ] Commit messages follow conventions
   - [ ] No merge conflicts
   - [ ] Changes are reviewed by at least one maintainer

### Pull Request Template

When creating a PR, include:

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

How has this been tested?

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests
- [ ] All tests pass
```

## Coding Standards

### TypeScript Style Guide

We follow strict TypeScript guidelines. See [CODE_CONVENTIONS.md](docs/CODE_CONVENTIONS.md) for complete details.

**Key Points:**

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Use async/await instead of callbacks
- Handle errors properly with try-catch

**Example:**

```typescript
/**
 * Retrieves employee by ID
 * @param id - Employee unique identifier
 * @returns Promise resolving to employee data
 * @throws {NotFoundError} If employee doesn't exist
 */
async function getEmployeeById(id: string): Promise<Employee> {
  const employee = await db.employees.findById(id);
  if (!employee) {
    throw new NotFoundError(`Employee with id ${id} not found`);
  }
  return employee;
}
```

### Error Handling

Use standardized error classes from `src/utils/apiErrors.ts`:

- `BadRequestError` - Invalid input (400)
- `UnauthorizedError` - Authentication required (401)
- `ForbiddenError` - Insufficient permissions (403)
- `NotFoundError` - Resource not found (404)
- `ValidationError` - Validation failure (422)
- `InternalServerError` - Server error (500)

See [Error Standardization Guide](docs/ERROR_STANDARDIZATION_GUIDE.md) for details.

### Code Formatting

We use Prettier for consistent code formatting:

```bash
# Format all files
npm run format

# Check formatting
npm run lint
```

Configuration is in `.prettierrc`.

## Testing Guidelines

### Writing Tests

We use Vitest for testing. Write tests for:

- All new features
- Bug fixes
- Critical business logic
- API endpoints

**Test Structure:**

```typescript
import { describe, it, expect, beforeEach } from "vitest";

describe("EmployeeService", () => {
  beforeEach(() => {
    // Setup
  });

  describe("getEmployeeById", () => {
    it("should return employee when found", async () => {
      // Arrange
      const employeeId = "123";

      // Act
      const result = await service.getEmployeeById(employeeId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(employeeId);
    });

    it("should throw NotFoundError when employee not found", async () => {
      // Arrange
      const invalidId = "999";

      // Act & Assert
      await expect(service.getEmployeeById(invalidId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- employee.test.ts

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch
```

### Test Coverage

We aim for:

- Overall coverage: > 80%
- Critical paths: > 95%
- New code: > 90%

## Documentation

### Documenting Code

- **Functions/Methods**: Use JSDoc comments
- **Classes**: Document purpose and usage
- **Complex Logic**: Add inline comments
- **APIs**: Update OpenAPI spec

### Updating Documentation

When making changes, update:

1. **README.md** - If affecting getting started or main features
2. **API Documentation** - For API changes
3. **Architecture Docs** - For architectural changes
4. **Module READMEs** - For module-specific changes
5. **CHANGELOG.md** - Add entry for your change

### Documentation Standards

Follow these guidelines:

- Use clear, concise language
- Include code examples
- Add diagrams for complex concepts
- Keep documentation in sync with code
- Use proper markdown formatting

## Community

### Getting Help

- **Documentation**: Check [docs/](docs/) directory
- **Issues**: Search [existing issues](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues)
- **Discussions**: Start a [GitHub Discussion](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/discussions)

### Reporting Bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md):

1. **Search existing issues** first
2. **Provide detailed description**
3. **Include steps to reproduce**
4. **Add error messages/logs**
5. **Specify your environment**

### Requesting Features

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md):

1. **Describe the feature**
2. **Explain the use case**
3. **Suggest implementation** (optional)
4. **Add examples** (optional)

### Code Review Process

All contributions go through code review:

1. **Automated checks** run on PR
2. **Maintainer review** within 48 hours
3. **Feedback addressed** by contributor
4. **Approval and merge** by maintainer

**Review Checklist:**

- Code quality and style
- Test coverage
- Documentation completeness
- Performance impact
- Security considerations
- Breaking changes

## Recognition

Contributors are recognized in:

- [CONTRIBUTORS.md](CONTRIBUTORS.md) - All contributors
- Release notes - Significant contributions
- GitHub insights - Automatic tracking

Thank you for contributing to ERP SteinmetZ! 🎉

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

---

**Questions?** Contact the maintainers:

- GitHub: [@Thomas-Heisig](https://github.com/Thomas-Heisig)
- Email: [Contact via GitHub]

**Version:** 1.0.0  
**Last Updated:** December 6, 2025
