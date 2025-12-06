# Getting Started with ERP SteinmetZ

**Estimated Time**: 15 minutes  
**Level**: Beginner  
**Prerequisites**: Basic knowledge of Node.js and npm

---

## Introduction

Welcome to ERP SteinmetZ! This tutorial will guide you through setting up your development environment and running the application for the first time. By the end of this tutorial, you'll have a fully functional ERP system running locally.

## What You'll Learn

- ✅ System requirements and prerequisites
- ✅ Installation and setup process
- ✅ Running the development server
- ✅ Accessing the web interface
- ✅ Basic navigation and features
- ✅ Troubleshooting common issues

## System Requirements

### Required

- **Node.js**: >= 18.18.0 (LTS recommended)
- **npm**: >= 9.0.0
- **Git**: Latest version
- **Operating System**: Linux, macOS, or Windows (with WSL2 recommended)

### Recommended

- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB for dependencies and builds
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## Installation Steps

### Step 1: Verify Prerequisites

First, verify that you have the required tools installed:

```bash
# Check Node.js version (should be >= 18.18.0)
node --version

# Check npm version (should be >= 9.0.0)
npm --version

# Check Git version
git --version
```

If any of these commands fail, install the missing tools:
- **Node.js & npm**: Download from [nodejs.org](https://nodejs.org/)
- **Git**: Download from [git-scm.com](https://git-scm.com/)

### Step 2: Clone the Repository

Clone the ERP SteinmetZ repository to your local machine:

```bash
# Clone the repository
git clone https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1.git

# Navigate to the project directory
cd ERP_SteinmetZ_V1
```

### Step 3: Install Dependencies

Install all project dependencies using npm:

```bash
# Install dependencies (skip build scripts for faster installation)
npm install --ignore-scripts

# This installs packages for:
# - Root workspace
# - Backend application (@erp-steinmetz/backend)
# - Frontend application (@erp-steinmetz/frontend)
```

**Note**: This may take 2-5 minutes depending on your internet connection.

### Step 4: Rebuild Native Modules

Some dependencies (like better-sqlite3) require native compilation:

```bash
# Rebuild native modules
npm rebuild better-sqlite3
```

### Step 5: Setup Environment Variables

Create environment configuration files:

```bash
# Copy backend environment template
cp apps/backend/.env.example apps/backend/.env

# Copy frontend environment template
cp apps/frontend/.env.example apps/frontend/.env
```

**Backend Configuration** (`apps/backend/.env`):
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_PATH=./data/erp.db

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=http://localhost:5173

# AI Providers (Optional)
OPENAI_API_KEY=your-openai-key
OLLAMA_BASE_URL=http://localhost:11434
```

**Frontend Configuration** (`apps/frontend/.env`):
```env
# API Configuration
VITE_API_URL=http://localhost:3000
```

### Step 6: Initialize the Database

The database will be automatically initialized on first run. You can verify it works:

```bash
# Run database initialization (optional - happens automatically)
npm run dev:backend
# Press Ctrl+C after you see "Database connected successfully"
```

## Running the Application

### Option 1: Run Everything Together (Recommended)

Run both backend and frontend simultaneously:

```bash
npm run dev
```

This command starts:
- **Backend** on `http://localhost:3000`
- **Frontend** on `http://localhost:5173`

### Option 2: Run Components Separately

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

### Verification

You should see output similar to:

```
> erp_steinmetz@0.3.0 dev
> npm run dev:backend & npm run dev:frontend

🚀 Server running on http://localhost:3000
📊 Database: Connected (SQLite)
✅ Health check available at /api/health

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Accessing the Application

### Web Interface

Open your browser and navigate to:

```
http://localhost:5173
```

You should see the ERP SteinmetZ dashboard.

### API Health Check

Verify the backend API is running:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-06T21:45:00.000Z",
  "uptime": 12.345,
  "database": "connected"
}
```

## First Steps in the Application

### 1. Explore the Dashboard

The dashboard displays 11 functional areas:

- 📊 **Dashboard** - Overview and metrics
- 👥 **HR** - Human resources management
- 💰 **Finance** - Financial management
- 📦 **Inventory** - Stock and materials
- 🔧 **Production** - Manufacturing processes
- 📝 **Documents** - Document management
- 🤖 **AI Assistant** - QuickChat AI helper
- 📋 **Functions Catalog** - 15,472 function nodes
- 🔍 **Innovation** - Ideas and improvements
- ⚙️ **Diagnostics** - System health monitoring
- 📅 **Calendar** - Events and scheduling

### 2. Try the QuickChat Assistant

1. Click on "QuickChat" in the sidebar
2. Type a message: "Hello, what can you help me with?"
3. The AI assistant will respond with available capabilities

### 3. Browse the Functions Catalog

1. Navigate to "Functions Catalog"
2. Explore the organized function tree
3. Search for specific functions using the search bar

### 4. Change the Theme

The application supports 4 themes:

1. Click the theme toggle (sun/moon icon) in the header
2. Choose from:
   - 🌞 **Light** - Clean white theme
   - 🌙 **Dark** - Modern dark theme
   - 🖥️ **LCARS** - Star Trek inspired
   - ♿ **Contrast** - High contrast for accessibility

## Running Tests

Verify everything is working correctly by running the test suite:

```bash
# Run all tests
npm test

# Run only backend tests
npm run test:backend

# Run only frontend tests
npm run test:frontend
```

**Expected Output:**
```
Test Files  6 passed (6)
      Tests  42 passed (42)

Test Files  3 passed (3)
      Tests  50 passed (50)

✅ All 92 tests passed!
```

## Building for Production

To create production builds:

```bash
# Build both backend and frontend
npm run build

# Or build separately
npm run build:backend
npm run build:frontend
```

Build artifacts will be in:
- Backend: `apps/backend/dist/`
- Frontend: `apps/frontend/dist/`

## Troubleshooting

### Issue: Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev:backend
```

### Issue: Database Connection Failed

**Error:** `Database connection failed`

**Solution:**
```bash
# Remove old database and reinitialize
rm apps/backend/data/erp.db
npm run dev:backend
```

### Issue: npm install Fails

**Error:** `npm ERR! code ELIFECYCLE`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --ignore-scripts
npm rebuild better-sqlite3
```

### Issue: Frontend Can't Connect to Backend

**Error:** `Network Error` or `CORS error`

**Solution:**
1. Verify backend is running on port 3000
2. Check `apps/frontend/.env` has correct API URL:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
3. Restart both backend and frontend

### Issue: Tests Failing

**Error:** `Could not locate the bindings file`

**Solution:**
```bash
# Rebuild native modules
npm rebuild better-sqlite3
```

## Next Steps

Now that you have the application running, explore these resources:

- 📖 [Basic Usage Guide](./BASIC_USAGE.md) - Learn core functionality
- 🔌 [API Integration Guide](./API_INTEGRATION.md) - Use the REST API
- 🚀 [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Deploy to production
- 📚 [Complete Documentation](../README.md) - Full documentation index

## Getting Help

- 📖 **Documentation**: [docs/README.md](../README.md)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/discussions)
- 📧 **Email**: Contact the maintainer

## Useful Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend + frontend |
| `npm run dev:backend` | Start only backend |
| `npm run dev:frontend` | Start only frontend |
| `npm test` | Run all tests |
| `npm run build` | Build for production |
| `npm run lint` | Run linters |
| `npm run format` | Format code with Prettier |

---

**Tutorial Complete!** 🎉

You now have a working ERP SteinmetZ development environment. Continue with the [Basic Usage Guide](./BASIC_USAGE.md) to learn how to use the system.

---

**Last Updated**: December 6, 2025  
**Maintainer**: Thomas Heisig  
**Version**: 1.0.0
