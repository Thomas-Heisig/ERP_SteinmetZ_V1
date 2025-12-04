# 005. React 19 for Frontend

**Date:** 2024-12-04  
**Status:** Accepted

## Context

We needed to choose a frontend framework for the ERP SteinmetZ user interface. The frontend must:
- Provide a responsive, modern UI
- Support complex state management
- Enable component reusability
- Offer good developer experience
- Have strong ecosystem and community support

React 19 was recently released with new features and improvements.

## Decision

Adopt **React 19** as the frontend framework with **Vite** as the build tool.

**Key Technologies:**
- React 19 (latest stable)
- Vite 5 (fast build tool)
- React Router v7 (routing)
- TypeScript (type safety)
- CSS Modules (styling)

**React 19 Features Used:**
- Function components with hooks
- Server Components (future consideration)
- Improved Suspense
- Automatic batching
- New concurrent features

## Alternatives Considered

### Alternative 1: Vue.js 3
- **Pros:** Simpler learning curve, good DX
- **Cons:** Smaller ecosystem than React
- **Why not:** Team more familiar with React

### Alternative 2: Angular 18
- **Pros:** Full framework, batteries included
- **Cons:** Steep learning curve, verbose
- **Why not:** Too opinionated, slower development

### Alternative 3: Svelte
- **Pros:** Lightweight, fast, simple
- **Cons:** Smaller ecosystem, fewer libraries
- **Why not:** Less mature ecosystem for enterprise

### Alternative 4: React 18
- **Pros:** More stable, fewer edge cases
- **Cons:** Missing React 19 improvements
- **Why not:** React 19 is stable enough, better features

## Consequences

### Positive
- **Modern Features:** Latest React capabilities
- **Performance:** Automatic batching, better rendering
- **Developer Experience:** Excellent tooling and ecosystem
- **Component Reusability:** Rich component library ecosystem
- **TypeScript Support:** First-class TS support
- **Community:** Largest React community
- **Vite:** Lightning-fast HMR and builds
- **Future-Proof:** New features like Server Components

### Negative
- **Learning Curve:** React 19 has new patterns to learn
- **Bundle Size:** React adds to bundle size
- **Complexity:** Can become complex with state management
- **Breaking Changes:** React 19 has some breaking changes from 18
- **Bleeding Edge:** Some third-party libraries may not support React 19 yet

### Risks
- **Risk:** Third-party components break with React 19
  - **Mitigation:** Test libraries, use compatible versions
- **Risk:** Developers unfamiliar with React 19 features
  - **Mitigation:** Documentation, training, gradual adoption
- **Risk:** Performance issues with complex state
  - **Mitigation:** Use proper optimization (memo, useMemo, useCallback)

## Implementation Notes

### Project Setup

```bash
npm create vite@latest frontend -- --template react-ts
```

### Key Dependencies

```json
{
  "dependencies": {
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "react-router-dom": "^7.0.0",
    "react-i18next": "^16.3.3"
  }
}
```

### Component Structure

```typescript
// Modern React 19 function component
import React, { useState, useEffect } from 'react';

interface DashboardProps {
  userId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchDashboardData(userId).then(setData);
  }, [userId]);
  
  return (
    <div className="dashboard">
      {/* Component content */}
    </div>
  );
};
```

### State Management

Use React Context for global state:
- AuthContext for authentication
- ThemeContext for theming
- No Redux needed initially (add if complexity grows)

### Routing

```typescript
// React Router v7
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'functions', element: <FunctionsCatalog /> },
    ],
  },
]);
```

### Styling Strategy

- CSS Modules for component-specific styles
- Global CSS for theme variables
- Design system with CSS custom properties
- Multiple themes (Light, Dark, LCARS)

### Build Configuration

Vite configuration for optimal performance:
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
});
```

## Migration Path

For future React updates:
1. Check breaking changes in release notes
2. Update dependencies
3. Run tests
4. Fix any breaking changes
5. Test thoroughly
6. Deploy

## References

- [React 19 Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router v7](https://reactrouter.com/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

**Author:** Thomas Heisig  
**Status:** Accepted  
**Last Updated:** 2024-12-04
