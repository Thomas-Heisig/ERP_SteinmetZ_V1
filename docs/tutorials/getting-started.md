# Tutorial: Getting Started with ERP SteinmetZ

**Estimated Time:** 5-10 minutes  
**Level:** Beginner  
**Prerequisites:** Basic knowledge of Node.js and TypeScript

## What You'll Learn

In this tutorial, you'll:
- ✅ Install and run ERP SteinmetZ locally
- ✅ Explore the frontend dashboard
- ✅ Make your first API request
- ✅ Understand the project structure

## Prerequisites

Before starting, ensure you have:
- **Node.js** >= 18.18.0 ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control
- A code editor (VS Code recommended)

Check your versions:
```bash
node --version  # Should be >= 18.18.0
npm --version   # Should be >= 9.0.0
git --version
```

## Step 1: Clone the Repository

Open your terminal and run:

```bash
# Clone the repository
git clone https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1.git

# Navigate to the project directory
cd ERP_SteinmetZ_V1

# Check that you're in the right place
ls -la
```

You should see files like `package.json`, `README.md`, and directories like `apps/`, `docs/`, etc.

## Step 2: Install Dependencies

Install all project dependencies:

```bash
npm install
```

This will:
- Install all workspace dependencies
- Set up frontend packages
- Set up backend packages
- Configure development tools

**Note:** This may take 2-3 minutes on first run.

## Step 3: Configure Environment Variables

Set up your environment configuration:

```bash
# Copy backend environment template
cp apps/backend/.env.example apps/backend/.env

# Copy frontend environment template
cp apps/frontend/.env.example apps/frontend/.env
```

Open `apps/backend/.env` and review the settings:

```env
# Basic settings (default values work for local development)
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database (SQLite for development)
DATABASE_URL=./data/dev.db

# Optional: Add AI provider keys if you want AI features
# OPENAI_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here
```

**For now, the defaults are fine!**

## Step 4: Start the Development Servers

Start both frontend and backend:

```bash
npm run dev
```

This command starts:
- **Backend server** on `http://localhost:3000`
- **Frontend dev server** on `http://localhost:5173`

You should see output like:
```
[backend]  Server running on port 3000
[backend]  Database connected
[frontend] Local: http://localhost:5173/
```

## Step 5: Explore the Frontend

Open your browser and navigate to:

**http://localhost:5173**

You should see:

1. **Welcome Screen** - ERP SteinmetZ dashboard
2. **11 Function Areas** - Main ERP modules
3. **Theme Switcher** - Try switching themes (top right)
4. **Language Selector** - Try different languages
5. **QuickChat Assistant** - AI-powered help (bottom right)

### Try This:
- Click on different function areas
- Switch between Light, Dark, and LCARS themes
- Change the language to English, Spanish, or another supported language
- Open the QuickChat assistant (if AI is configured)

## Step 6: Test the Backend API

The backend exposes a REST API. Let's test it!

### Option A: Using Browser

Open in your browser:
```
http://localhost:3000/api/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-12-06T...",
  "uptime": 123.456,
  "database": "connected",
  "version": "0.3.0"
}
```

### Option B: Using curl

In a new terminal:

```bash
# Health check
curl http://localhost:3000/api/health

# Get function catalog roots
curl http://localhost:3000/api/functions/roots

# Search functions
curl "http://localhost:3000/api/functions/search?q=invoice"
```

### Option C: Using Postman

Import the Postman collection from:
`docs/api/postman-collection.json`

## Step 7: Understand the Project Structure

```
ERP_SteinmetZ_V1/
├── apps/
│   ├── frontend/          # React 19 + Vite
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── contexts/    # React contexts
│   │   │   └── styles/      # CSS themes
│   │   └── package.json
│   │
│   └── backend/           # Express 5 API
│       ├── src/
│       │   ├── routes/      # API routes
│       │   ├── services/    # Business logic
│       │   ├── middleware/  # Express middleware
│       │   └── tools/       # AI tools
│       └── package.json
│
├── docs/                  # Documentation
├── data/                  # SQLite database (dev)
└── package.json           # Root workspace config
```

**Key Files:**
- `README.md` - Project overview
- `CONTRIBUTING.md` - How to contribute
- `docs/README.md` - Documentation hub
- `apps/backend/src/server.ts` - Backend entry point
- `apps/frontend/src/main.tsx` - Frontend entry point

## Step 8: Make Your First Code Change

Let's modify something simple to verify everything works.

### Edit the Health Check Response

1. Open `apps/backend/src/routes/systemInfoRouter/systemInfoRouter.ts`

2. Find the health check route (around line 20):

```typescript
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected',
    version: '0.3.0'
  });
});
```

3. Add a custom message:

```typescript
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected',
    version: '0.3.0',
    message: 'Hello from my first change!' // Add this line
  });
});
```

4. Save the file. The server will automatically reload!

5. Test your change:
```bash
curl http://localhost:3000/api/health
```

You should see your message in the response! 🎉

## Step 9: Run Tests

Verify everything works by running tests:

```bash
# Run all tests
npm test

# Or run separately
npm run test:backend
npm run test:frontend
```

Expected results:
- Backend: 42/42 tests passing ✅
- Frontend: Most tests passing (some pre-existing issues)

## Step 10: Stop the Servers

When you're done, stop the development servers:

Press `Ctrl+C` in the terminal where `npm run dev` is running.

## What's Next?

Now that you have ERP SteinmetZ running, you can:

### Continue Learning
- 📚 [Building Your First Feature](./building-first-feature.md) - Create a new feature
- 📚 [Working with AI Integration](./ai-integration.md) - Use AI capabilities
- 📚 [Creating a New Module](./creating-module.md) - Add a new module

### Deep Dive
- 📖 [Developer Onboarding](../DEVELOPER_ONBOARDING.md) - Comprehensive setup guide
- 📖 [Code Conventions](../CODE_CONVENTIONS.md) - Coding standards
- 📖 [Architecture](../ARCHITECTURE.md) - System design

### Start Contributing
- 🔧 [How to Add an API Endpoint](../how-to/add-api-endpoint.md)
- 🔧 [How to Write Tests](../how-to/writing-tests.md)
- 🤝 [Contributing Guide](../../CONTRIBUTING.md)

## Troubleshooting

### Port 3000 Already in Use
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clean build and restart
npm run clean
npm install
npm run dev
```

### Database Issues
```bash
# Delete and recreate database
rm data/dev.db
npm run dev:backend
```

For more help, see [SUPPORT.md](../../SUPPORT.md).

## Summary

Congratulations! You've successfully:
- ✅ Installed ERP SteinmetZ
- ✅ Started the development servers
- ✅ Explored the frontend dashboard
- ✅ Tested the backend API
- ✅ Made your first code change
- ✅ Ran the test suite

You're now ready to start building with ERP SteinmetZ!

## Feedback

Found an issue with this tutorial?
- [Open an issue](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues/new)
- [Contribute improvements](../../CONTRIBUTING.md)

---

**Tutorial Version:** 1.0.0  
**Last Updated:** December 6, 2025  
**Estimated Time:** 5-10 minutes  
**Difficulty:** Beginner
