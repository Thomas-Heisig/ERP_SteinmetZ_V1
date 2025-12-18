# Support

## Getting Help

Thank you for using ERP SteinmetZ! We're here to help you get the most out of the system.

## 📚 Documentation

Before seeking support, please check our comprehensive documentation:

### Getting Started

- **[README.md](README.md)** - Project overview and complete documentation
- **[Documentation Hub](docs/README.md)** - Central documentation index
- **[Developer Onboarding](docs/DEVELOPER_ONBOARDING.md)** - Setup and development guide

### Technical Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - System architecture
- **[API Documentation](docs/api/API_DOCUMENTATION.md)** - Complete API reference
- **[Code Conventions](docs/CODE_CONVENTIONS.md)** - Coding standards
- **[Environment Variables](docs/ENVIRONMENT_VARIABLES.md)** - Configuration guide

### Module-Specific Documentation

- **[AI Module](apps/backend/src/routes/ai/docs/)** - AI integration docs
- **[HR Module](apps/backend/src/routes/hr/docs/)** - HR management docs
- **[Finance Module](apps/backend/src/routes/finance/docs/)** - Finance docs
- **[Dashboard](apps/backend/src/routes/dashboard/docs/)** - Dashboard docs

## 🐛 Reporting Issues

### Before Reporting

1. **Search existing issues**: Check if your issue has already been reported
   - [All Issues](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues)
   - [Known Issues](ISSUES.md)

2. **Check documentation**: Make sure it's not a configuration issue

3. **Update to latest version**: Ensure you're using the latest release

### How to Report

If you've found a bug, please [create a new issue](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues/new) with:

**Bug Report Template:**

```markdown
## Bug Description

Clear and concise description of the bug

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior

What you expected to happen

## Actual Behavior

What actually happened

## Environment

- OS: [e.g., Windows 10, macOS 12.1, Ubuntu 20.04]
- Node.js Version: [e.g., 18.18.0]
- Browser: [e.g., Chrome 120]
- ERP SteinmetZ Version: [e.g., 0.3.0]

## Error Messages
```

Paste error messages or logs here

```text

## Screenshots
If applicable, add screenshots

## Additional Context
Any other information about the problem
```

### Issue Types

- **🐛 Bug**: Something isn't working as expected
- **✨ Feature Request**: Suggest a new feature or enhancement
- **📚 Documentation**: Improvements or additions to documentation
- **❓ Question**: General questions about usage
- **🔒 Security**: Security vulnerabilities (use [SECURITY.md](SECURITY.md) instead)

## 💬 Community Support

### GitHub Discussions

For questions, ideas, and discussions:

- [GitHub Discussions](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/discussions)

**Categories:**

- **💡 Ideas** - Feature suggestions and brainstorming
- **❓ Q&A** - Ask the community for help
- **📣 Announcements** - Updates and news
- **🗨️ General** - Everything else

### Chat & Community

- _(Future community channels will be listed here)_

## 🚀 Feature Requests

We welcome feature suggestions! Before submitting:

1. **Check existing requests**: See if someone else has suggested it
2. **Consider scope**: Does it fit the project's vision?
3. **Provide use case**: Explain why this feature would be valuable

**Feature Request Template:**

```markdown
## Feature Description

Clear description of the proposed feature

## Use Case

Who would benefit and how?

## Proposed Solution

Your suggested approach (optional)

## Alternatives Considered

Other ways you've considered solving this (optional)

## Additional Context

Mockups, examples, or references
```

## 📖 Frequently Asked Questions (FAQ)

### Installation & Setup

**Q: I get "Module not found" errors when running npm install!**

```bash
# Try clearing cache and reinstalling
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Q: Backend won't start - "Port 3000 already in use"!**

```bash
# Find and kill the process using port 3000
# Linux/Mac:
lsof -i :3000
kill -9 <PID>

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Q: Frontend shows CORS errors!**

```bash
# Ensure backend is running and CORS is configured
# Check apps/backend/.env:
FRONTEND_URL=http://localhost:5173
```

### Development

**Q: How do I run only frontend or backend?**

```bash
npm run dev:frontend  # Frontend only
npm run dev:backend   # Backend only
npm run dev          # Both
```

**Q: How do I reset the database?**

```bash
# Delete SQLite database and restart
rm data/dev.db
npm run dev:backend
```

**Q: TypeScript errors during build!**

```bash
# Ensure types are installed
npm install
npm run build
```

### Features

**Q: How do I enable AI features?**
See [AI Router Documentation](apps/backend/src/routes/ai/docs/README.md)

**Q: How do I add a new module?**
See [Architecture Documentation](docs/ARCHITECTURE.md) and [Code Conventions](docs/CODE_CONVENTIONS.md)

**Q: Is there a REST API reference?**
Yes! See [API Documentation](docs/api/API_DOCUMENTATION.md)

### Deployment

**Q: How do I deploy to production?**

```bash
npm run build
npm start
```

See [Architecture Documentation](docs/ARCHITECTURE.md#deployment) for detailed production setup.

**Q: What database should I use in production?**
PostgreSQL is recommended. See [DATABASE_MIGRATIONS.md](docs/DATABASE_MIGRATIONS.md)

## 🔐 Security Issues

**Do NOT report security vulnerabilities publicly!**

Please follow our [Security Policy](SECURITY.md) for responsible disclosure.

## 📧 Contact

### Project Maintainers

- **Thomas Heisig**
  - GitHub: [@Thomas-Heisig](https://github.com/Thomas-Heisig)
  - Role: Project Lead & Maintainer

### Response Times

- **Bug Reports**: Within 48 hours
- **Feature Requests**: Within 1 week
- **Security Issues**: Within 24 hours
- **Questions**: Within 3-5 days (community support may be faster)

## 🤝 Contributing

Want to help improve ERP SteinmetZ? Check out our:

- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Development Workflow](docs/DEVELOPER_ONBOARDING.md)

## 📊 Project Status

### Current Version: 0.3.0

**Release Status:**

- ✅ Core Features: Stable
- ✅ API: Functional
- ✅ Documentation: Comprehensive
- 🔄 AI Features: Beta
- 🔄 HR Module: Beta
- 🔄 Finance Module: Beta

**Build Status:**

- ✅ Backend Tests: 42/42 passing
- ⚠️ Frontend Tests: 37/50 passing (13 pre-existing issues)
- ✅ TypeScript Build: Successful

See [CHANGELOG.md](CHANGELOG.md) for version history.

## 📚 Learning Resources

### Tutorials & Guides

1. **Getting Started** (5 minutes)
   - [Quick Start Guide](README.md#-quick-start)

2. **Development Setup** (30 minutes)
   - [Developer Onboarding](docs/DEVELOPER_ONBOARDING.md)

3. **Understanding Architecture** (1 hour)
   - [Architecture Overview](docs/ARCHITECTURE.md)
   - [ADR Documentation](docs/adr/README.md)

4. **Building Features** (varies)
   - [Code Conventions](docs/CODE_CONVENTIONS.md)
   - [API Development](docs/api/README.md)

### External Resources

- [React 19 Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🎯 Roadmap

Want to see what's planned? Check out:

- [TODO.md](TODO.md) - Prioritized task list
- [Project Roadmap](docs/concept/_ROADMAP.md) - Long-term plans
- [GitHub Projects](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/projects) - Current work

## 📄 License

ERP SteinmetZ is MIT licensed. See [LICENSE](LICENSE) for details.

---

## Version Information

**Support Documentation Version:** 1.0.0  
**Last Updated:** December 6, 2025  
**Applies to ERP SteinmetZ:** 0.3.0+

---

Thank you for using ERP SteinmetZ! We're committed to providing excellent support and documentation. If you have suggestions for improving this support guide, please [let us know](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues/new).
