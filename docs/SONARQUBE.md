# SonarQube Integration Guide

**Version**: 1.0.0  
**Last Updated**: December 7, 2025  
**Status**: ✅ Configured

---

## Overview

This document describes the SonarQube integration for the ERP SteinmetZ project. SonarQube provides continuous code quality inspection, including:

- **Code Quality Analysis** - Bugs, vulnerabilities, code smells
- **Code Coverage** - Test coverage metrics and trends
- **Security Analysis** - OWASP Top 10 vulnerabilities
- **Technical Debt** - Maintainability ratings and estimates
- **Duplication Detection** - Code duplication analysis

## Architecture

### Integration Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Tests     │ ──> │  Coverage   │ ──> │ SonarQube   │
│   (Vitest)  │     │  (LCOV)     │     │  Analysis   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │                    │
   Run Tests         Generate LCOV        Upload & Scan
       │                    │                    │
       └────────────────────┴────────────────────┘
                            │
                     ┌──────▼──────┐
                     │   Quality   │
                     │    Gate     │
                     └─────────────┘
```

## Configuration Files

### 1. sonar-project.properties

Located at project root, defines SonarQube project configuration:

```properties
# Project identification
sonar.projectKey=Thomas-Heisig_ERP_SteinmetZ_V1
sonar.organization=thomas-heisig
sonar.projectName=ERP SteinmetZ
sonar.projectVersion=0.3.0

# Source code paths
sonar.sources=apps/backend/src,apps/frontend/src,src
sonar.tests=apps/backend/src,apps/frontend/src

# Test file patterns
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx

# Exclude patterns
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**,**/*.config.*

# Coverage reports
sonar.javascript.lcov.reportPaths=apps/backend/coverage/lcov.info,apps/frontend/coverage/lcov.info

# Code quality settings
sonar.qualitygate.wait=true
```

### 2. Vitest Coverage Configuration

Both backend and frontend are configured to generate LCOV format:

**apps/backend/vitest.config.ts**:
```typescript
coverage: {
  provider: "v8",
  reporter: ["text", "json", "html", "lcov"],
  reportsDirectory: "./coverage",
  // ...
}
```

**apps/frontend/vitest.config.ts**:
```typescript
coverage: {
  provider: "v8",
  reporter: ["text", "json", "html", "lcov"],
  reportsDirectory: "./coverage",
  // ...
}
```

### 3. GitHub Actions Workflow

Added to `.github/workflows/test.yml`:

```yaml
- name: Run backend tests with coverage
  run: npm run test:coverage -w @erp-steinmetz/backend
  env:
    NODE_ENV: test

- name: Run frontend tests with coverage
  run: npm run test:coverage -w @erp-steinmetz/frontend
  env:
    NODE_ENV: test

- name: SonarQube Scan
  if: matrix.node-version == '20.x'
  uses: SonarSource/sonarqube-scan-action@master
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

## Setup Instructions

### Prerequisites

1. **SonarQube Server** or **SonarCloud** account
2. **GitHub Repository Access** with Actions enabled
3. **Admin Rights** for repository secrets configuration

### Step 1: Create SonarQube Project

#### Using SonarCloud (Recommended)

1. Go to [SonarCloud](https://sonarcloud.io/)
2. Log in with GitHub account
3. Click "+" → "Analyze new project"
4. Select `Thomas-Heisig/ERP_SteinmetZ_V1`
5. Follow setup wizard to create project

#### Using Self-Hosted SonarQube

1. Access your SonarQube instance
2. Navigate to "Projects" → "Create Project"
3. Choose "Manually"
4. Enter project key: `Thomas-Heisig_ERP_SteinmetZ_V1`
5. Generate a token for CI integration

### Step 2: Configure GitHub Secrets

Add the following secrets in GitHub repository settings:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret Name      | Description                          | Example Value                        |
| ---------------- | ------------------------------------ | ------------------------------------ |
| `SONAR_TOKEN`    | SonarQube authentication token       | `sqp_1234567890abcdef...`            |
| `SONAR_HOST_URL` | SonarQube server URL                 | `https://sonarcloud.io`              |

**Note**: For SonarCloud, the `SONAR_HOST_URL` is `https://sonarcloud.io`

### Step 3: Run Initial Analysis

1. **Trigger the workflow**:
   ```bash
   git push origin main
   ```

2. **Monitor the workflow**:
   - Go to GitHub repository → Actions tab
   - Watch "Tests" workflow execution
   - Verify SonarQube scan completes successfully

3. **View results**:
   - SonarCloud: `https://sonarcloud.io/project/overview?id=Thomas-Heisig_ERP_SteinmetZ_V1`
   - Self-hosted: `https://your-sonarqube.com/dashboard?id=Thomas-Heisig_ERP_SteinmetZ_V1`

## Local Analysis

### Prerequisites

```bash
# Install SonarScanner CLI
# macOS
brew install sonar-scanner

# Linux
# Download from https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/

# Windows
# Download from https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/
```

### Running Local Scan

```bash
# 1. Generate coverage reports
npm run test:coverage

# 2. Run SonarScanner
sonar-scanner \
  -Dsonar.projectKey=Thomas-Heisig_ERP_SteinmetZ_V1 \
  -Dsonar.sources=. \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.login=YOUR_TOKEN
```

**Note**: Local scans are useful for development but CI scans are the source of truth.

## Quality Gates

### Default Quality Gate

SonarQube enforces the following quality gate by default:

| Metric                    | Threshold         |
| ------------------------- | ----------------- |
| Coverage                  | ≥ 80%             |
| Duplicated Lines          | ≤ 3%              |
| Maintainability Rating    | ≥ A               |
| Reliability Rating        | ≥ A               |
| Security Rating           | ≥ A               |
| Security Hotspots Reviewed| = 100%            |

### Custom Quality Gates

To create custom quality gates:

1. Go to SonarQube → Quality Gates
2. Click "Create"
3. Define conditions for your project
4. Assign to the project

## Metrics & Analysis

### Code Coverage

- **Source**: Vitest coverage reports (LCOV format)
- **Target**: ≥ 80% overall coverage
- **Current Status**: Backend 47%, Frontend 96%
- **Note**: Backend coverage lower due to pending integration tests; Frontend has excellent UI component coverage

### Code Quality Metrics

#### Reliability (Bugs)
- **A**: 0 bugs
- **B**: ≥ 1 minor bug
- **C**: ≥ 1 major bug
- **D**: ≥ 1 critical bug
- **E**: ≥ 1 blocker bug

#### Security (Vulnerabilities)
- **A**: 0 vulnerabilities
- **B**: ≥ 1 minor vulnerability
- **C**: ≥ 1 major vulnerability
- **D**: ≥ 1 critical vulnerability
- **E**: ≥ 1 blocker vulnerability

#### Maintainability (Code Smells)
- **A**: Technical debt ratio ≤ 5%
- **B**: Technical debt ratio 6-10%
- **C**: Technical debt ratio 11-20%
- **D**: Technical debt ratio 21-50%
- **E**: Technical debt ratio > 50%

## Dashboard & Reports

### SonarQube Dashboard

Access the project dashboard at:
- **SonarCloud**: `https://sonarcloud.io/project/overview?id=Thomas-Heisig_ERP_SteinmetZ_V1`
- **Self-hosted**: `https://your-sonarqube.com/dashboard?id=Thomas-Heisig_ERP_SteinmetZ_V1`

### Available Views

1. **Overview** - Key metrics and quality gate status
2. **Issues** - Bugs, vulnerabilities, code smells
3. **Measures** - Detailed metrics and trends
4. **Code** - Source code browser with annotations
5. **Activity** - Analysis history and timeline

### Badges

Add SonarQube badges to README.md:

```markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Thomas-Heisig_ERP_SteinmetZ_V1&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Thomas-Heisig_ERP_SteinmetZ_V1)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Thomas-Heisig_ERP_SteinmetZ_V1&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Thomas-Heisig_ERP_SteinmetZ_V1)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Thomas-Heisig_ERP_SteinmetZ_V1&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Thomas-Heisig_ERP_SteinmetZ_V1)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Thomas-Heisig_ERP_SteinmetZ_V1&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=Thomas-Heisig_ERP_SteinmetZ_V1)
```

## Troubleshooting

### Common Issues

#### 1. Coverage Not Showing

**Problem**: Coverage is 0% in SonarQube

**Solution**:
- Verify LCOV files are generated: `ls apps/*/coverage/lcov.info`
- Check `sonar.javascript.lcov.reportPaths` in `sonar-project.properties`
- Ensure tests run with coverage: `npm run test:coverage`

#### 2. Analysis Fails

**Problem**: SonarQube scan fails in CI

**Solution**:
- Check GitHub Actions logs for errors
- Verify `SONAR_TOKEN` and `SONAR_HOST_URL` secrets are set
- Ensure project key matches: `Thomas-Heisig_ERP_SteinmetZ_V1`

#### 3. Quality Gate Fails

**Problem**: Build fails due to quality gate

**Solution**:
- Review issues in SonarQube dashboard
- Fix critical/blocker issues first
- Adjust quality gate thresholds if needed
- Use `sonar.qualitygate.wait=false` to not block builds (not recommended)

#### 4. Incorrect File Paths

**Problem**: SonarQube can't find source files

**Solution**:
- Verify `sonar.sources` paths in `sonar-project.properties`
- Ensure paths are relative to project root
- Check exclusion patterns in `sonar.exclusions`

### Debug Mode

Enable debug logging in GitHub Actions:

```yaml
- name: SonarQube Scan
  uses: SonarSource/sonarqube-scan-action@master
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
    SONAR_SCANNER_OPTS: "-X"  # Enable debug mode
```

## Best Practices

### 1. Regular Monitoring

- **Daily**: Check quality gate status
- **Weekly**: Review new issues and technical debt
- **Monthly**: Analyze trends and set improvement goals

### 2. Issue Management

- **Prioritize**: Fix blocker and critical issues first
- **Assign**: Assign issues to team members
- **Track**: Use issue workflow (Open → Confirmed → Fixed → Closed)

### 3. Coverage Goals

- **Minimum**: 80% overall coverage
- **Target**: 90% for critical business logic
- **New Code**: 100% coverage for new features

### 4. Quality First

- **Fix Before Push**: Address issues before committing
- **Code Review**: Use SonarQube results in PR reviews
- **Zero Tolerance**: No new bugs or vulnerabilities

## Integration with Development Workflow

### Pre-commit

```bash
# Run tests with coverage locally
npm run test:coverage

# Review coverage report
open apps/backend/coverage/index.html
open apps/frontend/coverage/index.html
```

### Pull Request

1. Tests run automatically with coverage
2. SonarQube scan analyzes changes
3. Quality gate status shown in PR
4. Review findings before merging

### Continuous Improvement

- Set monthly quality improvement goals
- Track coverage trends
- Reduce technical debt systematically
- Share learnings with team

## Performance Considerations

### Scan Duration

- **Tests**: ~2-3 minutes
- **Coverage Generation**: +30 seconds
- **SonarQube Scan**: ~1-2 minutes
- **Total**: ~4-6 minutes

### Optimizations

- Scans only run on Node.js 20.x (not 18.x matrix)
- Coverage cached between test and scan steps
- Incremental analysis for branches

## Security Considerations

### Token Security

- Never commit `SONAR_TOKEN` to repository
- Use GitHub Secrets for all tokens
- Rotate tokens regularly (every 90 days)
- Limit token scope to project access

### Data Privacy

- SonarQube analyzes code, not data
- No sensitive information sent to SonarCloud
- Self-hosted option for complete control

## Future Enhancements

### Planned Improvements

- [ ] **Pull Request Decoration** - Comments on PRs with findings
- [ ] **Quality Profiles** - Custom rules for TypeScript/React
- [ ] **Quality Gate History** - Long-term quality tracking
- [ ] **Team Metrics** - Individual and team quality metrics
- [ ] **Custom Dashboards** - Project-specific views
- [ ] **Integration Testing Coverage** - E2E test coverage

## References

### Documentation

- [SonarQube Documentation](https://docs.sonarqube.org/)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [SonarScanner for JavaScript](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/)
- [GitHub Actions Integration](https://github.com/SonarSource/sonarqube-scan-action)

### Metrics Reference

- [Metric Definitions](https://docs.sonarqube.org/latest/user-guide/metric-definitions/)
- [Quality Gates](https://docs.sonarqube.org/latest/user-guide/quality-gates/)
- [Clean Code](https://docs.sonarqube.org/latest/user-guide/clean-code/)

### Related Documents

- [CI/CD Setup](../CI_CD_SETUP.md)
- [Code Conventions](CODE_CONVENTIONS.md)
- [Testing Guide](../README.md#tests--quality)

## Support

### Getting Help

- **Documentation**: This guide and SonarQube docs
- **Issues**: Open GitHub issue with `quality` label
- **Community**: [SonarSource Community Forum](https://community.sonarsource.com/)

### Maintainer

- **Name**: Thomas Heisig
- **GitHub**: [@Thomas-Heisig](https://github.com/Thomas-Heisig)

---

**Document Version:** 1.0.0  
**Last Review:** December 7, 2025  
**Next Review:** March 2026
