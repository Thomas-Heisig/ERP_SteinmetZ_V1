# Frontend Documentation Index

Comprehensive documentation for the ERP SteinmetZ frontend application.

## Architecture & Structure

- **[Frontend Structure](./FRONTEND_STRUCTURE.md)** - Overall architecture and organization
- **[Theme System](./THEME_SYSTEM.md)** - Theming and styling system

## Components

### Navigation & Layout
- **[Navigation](./components/Navigation.md)** - Main navigation component
- **[Sidebar](./components/Sidebar.md)** - Sidebar navigation

### Dashboard & Analytics
- **[Dashboard](./components/Dashboard.md)** - Main dashboard component
- **[Dashboard Development](./components/Dashboard-Dev.md)** - Development guide
- **[Quality Dashboard](./components/QualityDashboard.md)** - Quality metrics dashboard
- **[Search Analytics](./components/SearchAnalytics.md)** - Search analytics component

### AI & Automation
- **[QuickChat](./components/QuickChat.md)** - AI-powered chat assistant
- **[QuickChat Quality Report](./components/QuickChat-Quality.md)** - Quality assessment
- **[Model Management](./components/ModelManagement.md)** - AI model management UI

### Business Functions
- **[Functions Catalog](./components/FunctionsCatalog.md)** - Business functions catalog UI

### UI Components
- **[Input](./components/Input.md)** - Input component documentation

## Pages

- **[Settings](./pages/Settings.md)** - Settings page documentation

## Features

### Business Modules
- **[Innovation API](./features/Innovation-API.md)** - Innovation module API specification
- **[HR API](./features/HR-API.md)** - HR module API specification
- **[HR Improvements](./features/HR-Improvements.md)** - HR module improvements
- **[Documents API](./features/Documents-API.md)** - Documents module API specification
- **[Finance Invoice Fix](./features/Finance-Invoice-Fix.md)** - Invoice functionality fixes

## Development Guide

### Getting Started
1. **Setup**: Follow [Developer Onboarding](../DEVELOPER_ONBOARDING.md)
2. **Structure**: Review [Frontend Structure](./FRONTEND_STRUCTURE.md)
3. **Theming**: Understand [Theme System](./THEME_SYSTEM.md)

### Component Development
1. Follow [Code Conventions](../CODE_CONVENTIONS.md)
2. Use existing components as templates
3. Ensure responsive design
4. Add TypeScript types
5. Write unit tests

### Best Practices
- **TypeScript**: Use strict typing
- **React**: Follow React 19 best practices
- **Styling**: Use the theme system
- **Testing**: Write comprehensive tests
- **Accessibility**: Follow WCAG 2.1 AA standards

## Technology Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **State Management**: React Context + Hooks
- **Styling**: CSS Modules + Theme System
- **Testing**: Vitest + React Testing Library

## Quick Links

### By Category

**Core Components:**
- [Navigation](./components/Navigation.md)
- [Sidebar](./components/Sidebar.md)
- [Dashboard](./components/Dashboard.md)

**AI Features:**
- [QuickChat](./components/QuickChat.md)
- [Model Management](./components/ModelManagement.md)

**Business Modules:**
- [Finance](./features/Finance-Invoice-Fix.md)
- [HR](./features/HR-API.md)
- [Documents](./features/Documents-API.md)
- [Innovation](./features/Innovation-API.md)

**Development:**
- [Frontend Structure](./FRONTEND_STRUCTURE.md)
- [Theme System](./THEME_SYSTEM.md)
- [Settings Page](./pages/Settings.md)

## Related Documentation

- [Backend Modules](../modules/README.md)
- [API Documentation](../reference/modules-index.md)
- [Architecture](../ARCHITECTURE.md)
- [Developer Onboarding](../DEVELOPER_ONBOARDING.md)
- [Code Conventions](../CODE_CONVENTIONS.md)

## Contributing

When adding new frontend features:
1. Update component documentation
2. Add API specifications for new integrations
3. Update this index
4. Follow the documentation standards
5. Include examples and screenshots where helpful
