# Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to ensure consistent and meaningful commit messages. Commit messages are enforced using Husky and commitlint.

## Format

```bash
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (Required)

The type must be one of the following:

- **feat**: A new feature for the user
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies (npm, webpack, etc)
- **ci**: Changes to CI configuration files and scripts (GitHub Actions, etc)
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scope (Optional)

The scope provides additional contextual information and is contained within parentheses:

- **backend**: Backend-related changes
- **frontend**: Frontend-related changes
- **api**: API-related changes
- **ui**: UI component changes
- **db**: Database-related changes
- **auth**: Authentication/Authorization
- **deps**: Dependency updates
- **config**: Configuration changes

Examples:

```text
feat(backend): add user authentication
fix(frontend): resolve navigation bug
docs(api): update endpoint documentation
```

### Subject (Required)

The subject contains a succinct description of the change:

- Use imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No period (.) at the end
- Maximum 100 characters

### Body (Optional)

The body should include the motivation for the change and contrast this with previous behavior.

- Use imperative, present tense
- Wrap at 72 characters
- Can contain multiple paragraphs

### Footer (Optional)

The footer should contain any information about Breaking Changes and reference GitHub issues that this commit closes.

**Breaking Changes** should start with `BREAKING CHANGE:` followed by a description.

**Issue references** should use the format: `Closes #123`, `Fixes #456`, `Relates to #789`

## Examples

### Simple feature

```text
feat(backend): add rate limiting to API endpoints
```

### Bug fix with scope

```text
fix(frontend): correct theme toggle persistence

The theme toggle state was not being saved to localStorage correctly.
This fix ensures the user's theme preference is maintained across sessions.

Fixes #234
```

### Breaking change

```text
feat(api): redesign authentication flow

Implement JWT-based authentication replacing session cookies.
This provides better scalability and security for API access.

BREAKING CHANGE: The authentication endpoint has changed from /api/login
to /api/auth/login and now returns a JWT token instead of setting a cookie.

Closes #456
```

### Documentation update

```text
docs: update developer onboarding guide

Add instructions for setting up the development environment on Windows.
```

### Dependency update

```text
chore(deps): upgrade react to v19.2.0

Update React and React DOM to latest stable version.
```

### Performance improvement

```text
perf(backend): optimize database queries

Reduce N+1 queries in user data fetching by implementing eager loading.
This improves response time by ~40% for user list endpoints.
```

## Pre-commit Hooks

The following checks run automatically before each commit:

1. **Linting**: ESLint checks for code quality issues
2. **Formatting**: Prettier formats code to match style guide

If any check fails, the commit will be aborted. Fix the issues and try again.

## Commit Message Validation

The `commit-msg` hook validates your commit message format using commitlint.

### Common Validation Errors

#### Error: "type may not be empty"

```info
# ❌ Bad
update documentation

# ✅ Good
docs: update documentation
```

#### Error: "subject may not be empty"

```info
# ❌ Bad
feat:

# ✅ Good
feat: add new feature
```

#### Error: "type must be one of [feat, fix, docs, ...]"

```info
# ❌ Bad
feature: add login

# ✅ Good
feat: add login
```

#### Error: "header must not be longer than 100 characters"

```info
# ❌ Bad
feat: add a very long description that exceeds the maximum allowed length for commit message headers

# ✅ Good
feat: add user authentication with JWT

Add comprehensive JWT-based authentication system including
token generation, validation, and refresh mechanisms.
```

## Bypassing Hooks (Not Recommended)

In rare cases where you need to bypass hooks (e.g., during a rebase), you can use:

```bash
git commit --no-verify
```

⚠️ **Warning**: Only use `--no-verify` when absolutely necessary. All commits should follow the conventions.

## Tools and IDE Integration

### VSCode Extension

Install [Conventional Commits](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits) extension for guided commit message creation.

### Git Commit Template

Set up a commit message template:

```bash
git config --local commit.template .gitmessage
```

Create `.gitmessage` file:

```bash
# <type>(<scope>): <subject>
# |<----  Using a Maximum Of 100 Characters  ---->|

# <body>
# |<----   Try To Limit Each Line to a Maximum Of 72 Characters   ---->|

# <footer>
# Example:
# feat(backend): add user registration endpoint
#
# Implement POST /api/auth/register with email validation,
# password hashing, and automatic user profile creation.
#
# Closes #123
```

## Automated Changelog

Commit messages following these conventions enable automatic changelog generation using tools like:

- `standard-version`
- `semantic-release`
- `conventional-changelog`

Future implementation planned for automatic CHANGELOG.md updates.

## References

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Husky Documentation](https://typicode.github.io/husky/)

## Questions?

If you have questions about commit conventions, see:

- [CODE_CONVENTIONS.md](docs/CODE_CONVENTIONS.md) - Project code style guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - General contribution guidelines
