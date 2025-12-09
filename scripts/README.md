# Scripts

This directory contains utility scripts for the ERP SteinmetZ project.

## Available Scripts

### check-console-logs.sh

Checks for console.log statements in staged files.

**Usage**:
```bash
npm run check:console
# or directly:
bash scripts/check-console-logs.sh
```

**What it does**:
- Scans staged files for console.log, console.info, console.debug
- Allows console.warn and console.error
- Excludes test files and node_modules
- Runs automatically in pre-commit hook

**Why**:
- Prevents debug statements in production
- Enforces structured logging
- Improves code quality

### sonarqube-setup.sh

Sets up and validates SonarQube integration.

**Usage**:

```bash
npm run sonar:setup
# or directly:
bash scripts/sonarqube-setup.sh
```

**What it does**:

- Validates sonar-project.properties configuration
- Runs tests with coverage
- Verifies coverage reports are generated
- Provides instructions for next steps

**Prerequisites**:

- GitHub secrets configured (SONAR_TOKEN, SONAR_HOST_URL)
- Dependencies installed (`npm install`)

## Adding New Scripts

When adding new scripts:

1. **Create the script** in this directory
2. **Make it executable**: `chmod +x scripts/your-script.sh`
3. **Add to package.json**: Add an npm script entry
4. **Document it here**: Update this README with usage instructions
5. **Use SPDX license**: Add `# SPDX-License-Identifier: MIT` header

## Script Guidelines

- Use `#!/usr/bin/env bash` shebang
- Set `set -e` for error handling
- Add helpful output messages
- Check prerequisites before running
- Provide clear error messages
- Document all required environment variables
