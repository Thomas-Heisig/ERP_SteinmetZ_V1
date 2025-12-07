# Development Tools Guide

**Stand**: 7. Dezember 2025  
**Version**: 0.3.0

## Überblick

Dieses Dokument beschreibt die Development Tools für das ERP SteinmetZ Projekt.

---

## 📚 Storybook für Component Development

### Installation

```bash
# Install Storybook for React + Vite
npm install --save-dev @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/blocks @storybook/test
```

### Konfiguration

**.storybook/main.js**:
```javascript
export default {
  stories: ['../apps/frontend/src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};
```

**.storybook/preview.js**:
```javascript
import '../apps/frontend/src/styles/globals.css';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
```

### Beispiel Story

**Button.stories.tsx**:
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};
```

### Scripts hinzufügen

**package.json**:
```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

### Storybook starten

```bash
npm run storybook
```

Öffnet Browser auf http://localhost:6006

---

## 🧪 Mock Server für Frontend Development

### JSON Server Setup

```bash
npm install --save-dev json-server
```

**mock-server/db.json**:
```json
{
  "users": [
    { "id": 1, "name": "Admin User", "email": "admin@steinmetz.de" }
  ],
  "functionNodes": [
    { "id": 1, "name": "createUser", "kind": "function" }
  ],
  "batches": [
    { "id": "batch_1", "status": "completed", "progress": 100 }
  ]
}
```

**mock-server/routes.json**:
```json
{
  "/api/*": "/$1"
}
```

**mock-server/middlewares.js**:
```javascript
module.exports = (req, res, next) => {
  // Add custom response headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Delay responses to simulate network latency
  setTimeout(() => {
    next();
  }, 300);
};
```

### Scripts

**package.json**:
```json
{
  "scripts": {
    "mock-server": "json-server --watch mock-server/db.json --routes mock-server/routes.json --middlewares mock-server/middlewares.js --port 3001"
  }
}
```

### MSW (Mock Service Worker) Alternative

```bash
npm install --save-dev msw
```

**mocks/handlers.ts**:
```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'Admin User' },
    ]);
  }),
  
  http.post('/api/batches', async ({ request }) => {
    const batch = await request.json();
    return HttpResponse.json({
      id: 'batch_' + Date.now(),
      ...batch,
      status: 'pending',
    }, { status: 201 });
  }),
];
```

**mocks/browser.ts**:
```typescript
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

**main.tsx** (Development only):
```typescript
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { worker } = await import('./mocks/browser');
  return worker.start();
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
```

---

## ⚡ Hot Module Replacement (HMR) Optimierung

### Vite HMR Config

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Fast Refresh Configuration
      fastRefresh: true,
      
      // Babel options for better HMR
      babel: {
        plugins: [
          // React Refresh plugin
        ],
      },
    }),
  ],
  
  server: {
    hmr: {
      overlay: true, // Show errors as overlay
      port: 5173,
    },
    watch: {
      // Ignore node_modules for better performance
      ignored: ['**/node_modules/**', '**/dist/**'],
    },
  },
  
  optimizeDeps: {
    // Pre-bundle dependencies
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
```

### Best Practices für HMR

1. **State Preservation**: Use React Fast Refresh
```typescript
// Component state is preserved on hot reload
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

2. **Module Boundaries**: Export components properly
```typescript
// ✅ Good - HMR works
export function Button() { ... }

// ❌ Bad - HMR may not work
export default function() { ... }
```

3. **Accept HMR**: Manually accept HMR for non-React modules
```typescript
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Update module
  });
}
```

---

## 🔧 Dev Tools Extension

### React DevTools

Browser-Erweiterung für React:
- Chrome: https://chrome.google.com/webstore (React Developer Tools)
- Firefox: https://addons.mozilla.org (React Developer Tools)

Features:
- Component Tree inspektion
- Props und State debugging
- Performance Profiling
- Hook inspection

### Redux DevTools (falls verwendet)

```bash
npm install --save-dev @redux-devtools/extension
```

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { devToolsEnhancer } from '@redux-devtools/extension';

const store = configureStore({
  reducer: rootReducer,
  enhancers: [devToolsEnhancer()],
});
```

### Custom DevTools Panel (Optional)

**dev-tools/DevPanel.tsx**:
```typescript
import React, { useState } from 'react';

export const DevPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      background: '#000',
      color: '#0f0',
      padding: '10px',
      fontFamily: 'monospace',
      zIndex: 9999,
    }}>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Close' : 'Dev Tools'}
      </button>
      
      {isOpen && (
        <div style={{ marginTop: '10px' }}>
          <h3>Environment</h3>
          <pre>{JSON.stringify(import.meta.env, null, 2)}</pre>
          
          <h3>Performance</h3>
          <button onClick={() => console.log(performance.getEntries())}>
            Log Performance Metrics
          </button>
          
          <h3>Storage</h3>
          <button onClick={() => console.log(localStorage)}>
            Log LocalStorage
          </button>
          <button onClick={() => localStorage.clear()}>
            Clear LocalStorage
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## 📊 Code Coverage Reports

**Bereits vorhanden via Vitest**

### Coverage-Konfiguration

**vitest.config.ts**:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['apps/*/src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.{js,ts,jsx,tsx}',
        '**/*.spec.{js,ts,jsx,tsx}',
        '**/*.stories.{js,ts,jsx,tsx}',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

### Coverage Reports ausführen

```bash
# Backend Coverage
npm run test:coverage -w @erp-steinmetz/backend

# Frontend Coverage
npm run test:coverage -w @erp-steinmetz/frontend

# Combined Coverage
npm run test:coverage
```

### Coverage HTML Report öffnen

```bash
# Backend
open apps/backend/coverage/index.html

# Frontend
open apps/frontend/coverage/index.html
```

---

## 🔍 SonarQube Integration

### SonarQube Docker Setup

**docker-compose.sonar.yml**:
```yaml
version: '3.8'

services:
  sonarqube:
    image: sonarqube:community
    ports:
      - "9000:9000"
    environment:
      - SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_logs:/opt/sonarqube/logs
      - sonarqube_extensions:/opt/sonarqube/extensions

volumes:
  sonarqube_data:
  sonarqube_logs:
  sonarqube_extensions:
```

```bash
docker-compose -f docker-compose.sonar.yml up -d
```

### SonarQube Scanner Installation

```bash
npm install --save-dev sonarqube-scanner
```

### SonarQube Konfiguration

**sonar-project.properties**:
```properties
sonar.projectKey=erp-steinmetz
sonar.projectName=ERP SteinmetZ
sonar.projectVersion=0.3.0

# Source directories
sonar.sources=apps/backend/src,apps/frontend/src
sonar.tests=apps/backend/src,apps/frontend/src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts

# Coverage reports
sonar.javascript.lcov.reportPaths=apps/backend/coverage/lcov.info,apps/frontend/coverage/lcov.info

# Exclusions
sonar.exclusions=**/node_modules/**,**/dist/**,**/*.test.ts,**/*.spec.ts

# Language
sonar.language=ts
sonar.sourceEncoding=UTF-8
```

### SonarQube Scanner Script

**scripts/sonar-scan.js**:
```javascript
import sonarqubeScanner from 'sonarqube-scanner';

sonarqubeScanner(
  {
    serverUrl: process.env.SONAR_HOST_URL || 'http://localhost:9000',
    token: process.env.SONAR_TOKEN || 'your-token',
    options: {
      'sonar.projectKey': 'erp-steinmetz',
      'sonar.sources': 'apps',
    },
  },
  () => {
    console.log('SonarQube scan completed');
  }
);
```

**package.json**:
```json
{
  "scripts": {
    "sonar": "node scripts/sonar-scan.js"
  }
}
```

### SonarQube ausführen

```bash
# 1. Start SonarQube
docker-compose -f docker-compose.sonar.yml up -d

# 2. Generate Coverage Reports
npm run test:coverage

# 3. Run SonarQube Scanner
npm run sonar
```

### SonarQube Dashboard

Öffne http://localhost:9000 und logge dich ein:
- Default Username: `admin`
- Default Password: `admin`

### CI/CD Integration

**GitHub Actions** (.github/workflows/sonar.yml):
```yaml
name: SonarQube Analysis

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  sonar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm run test:coverage
      
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

---

## 📋 Zusammenfassung

### Installierte Tools

- ✅ **Code Coverage**: Vitest (bereits vorhanden)
- 🔜 **Storybook**: Component Development & Documentation
- 🔜 **Mock Server**: JSON Server oder MSW
- ✅ **HMR**: Vite (bereits konfiguriert)
- 🔜 **Dev Tools**: React DevTools + Custom Panel
- 🔜 **SonarQube**: Code Quality Analysis

### Next Steps

1. **Storybook installieren**:
```bash
npx storybook@latest init
```

2. **Mock Server einrichten**:
```bash
npm install --save-dev json-server
# oder
npm install --save-dev msw
```

3. **SonarQube aufsetzen**:
```bash
docker-compose -f docker-compose.sonar.yml up -d
npm install --save-dev sonarqube-scanner
```

4. **Dev Tools Panel integrieren**:
- DevPanel.tsx in App.tsx einbinden (nur in Development)

---

**Maintainer**: Thomas Heisig  
**Letzte Aktualisierung**: 7. Dezember 2025
