# Help Desk System - Quick Start Guide

## Overview

ERP SteinmetZ now includes a comprehensive Help Desk system for managing documentation and user support.

## Quick Access

### For Users

- **Help Center**: Navigate to `/help` in the application
- Browse categories, search articles, and view documentation

### For Administrators

- **Admin Interface**: Navigate to `/help-admin`
- Manage articles, categories, and view statistics

### For Developers

- **API Documentation**: See `apps/backend/src/routes/help/README.md`
- **API Client**: Use `apps/frontend/src/api/helpApi.ts`

## Features

### User Features

- ✅ Browse articles by category
- ✅ Search with relevance scoring
- ✅ View markdown-formatted content
- ✅ Track popular articles

### Admin Features

- ✅ Create, edit, delete articles
- ✅ Manage categories
- ✅ View usage statistics
- ✅ Workflow management (draft/published/archived)

### API Features

- ✅ RESTful API at `/api/help`
- ✅ 8 endpoints for full CRUD operations
- ✅ Advanced search with relevance scoring
- ✅ Statistics and analytics

## Getting Started

### Initial Setup

1. **Seed the Database** (first time only):

```bash
cd apps/backend
npm run build
node dist/routes/help/seedHelpData.js
```

2. **Start the Application**:

```bash
npm run dev
```

3. **Access Help Center**:

- Frontend: http://localhost:5173/help
- Admin: http://localhost:5173/help-admin
- API: http://localhost:3000/api/help

### Creating Your First Article

1. Navigate to `/help-admin`
2. Click "Neuer Artikel"
3. Fill in:
   - **Title**: "My First Article"
   - **Category**: Choose from dropdown
   - **Status**: "published"
   - **Content**: Write in Markdown
4. Click "Speichern"

## API Usage

### Fetch All Articles

```typescript
import { getHelpArticles } from "@/api/helpApi";

const articles = await getHelpArticles({
  category: "getting-started",
  status: "published",
  limit: 10,
});
```

### Search Articles

```typescript
import { searchHelpArticles } from "@/api/helpApi";

const results = await searchHelpArticles("authentication", "integration");
```

### Create Article

```typescript
import { createHelpArticle } from "@/api/helpApi";

const id = await createHelpArticle({
  title: "New Article",
  content: "# Content here",
  category: "tutorials",
  status: "published",
});
```

## Database Schema

### Tables

- **help_articles**: Stores article content and metadata
- **help_categories**: Organizes articles into categories

### Key Fields

- `id`: Unique identifier
- `title`: Article title
- `content`: Markdown content
- `category`: Category ID
- `status`: draft | published | archived
- `view_count`: Number of views

## API Endpoints

| Method | Endpoint                  | Description     |
| ------ | ------------------------- | --------------- |
| GET    | `/api/help/articles`      | List articles   |
| GET    | `/api/help/articles/:id`  | Get article     |
| POST   | `/api/help/articles`      | Create article  |
| PUT    | `/api/help/articles/:id`  | Update article  |
| DELETE | `/api/help/articles/:id`  | Delete article  |
| GET    | `/api/help/categories`    | List categories |
| POST   | `/api/help/categories`    | Create category |
| GET    | `/api/help/search?q=term` | Search articles |
| GET    | `/api/help/stats`         | Get statistics  |

## Categories

Default categories included:

1. 🚀 Erste Schritte (Getting Started)
2. 🧭 Konzept & Vision (Concept & Vision)
3. 🏗️ Architektur (Architecture)
4. 💻 Entwicklung (Development)
5. 🧩 Module & Features
6. 🤖 KI & Automatisierung (AI & Automation)
7. 🔌 Integration & APIs
8. 🚀 Deployment & Monitoring
9. 📖 Tutorials & How-To
10. 📚 Referenz (Reference)

## Documentation

### Complete Documentation

- **System Overview**: `docs/DOCUMENTATION_REORGANIZATION_2025_12_19.md`
- **API Documentation**: `apps/backend/src/routes/help/README.md`
- **Documentation Index**: `docs/DOCUMENTATION_INDEX.md`

### Module Documentation

- **Backend Modules**: `docs/modules/README.md`
- **Frontend Components**: `docs/frontend/README.md`
- **Backend Infrastructure**: `docs/backend/README.md`

## Troubleshooting

### Articles Not Loading

1. Check backend is running: `npm run dev:backend`
2. Verify database tables exist
3. Run seeding script if needed
4. Check browser console for errors

### Search Not Working

1. Verify articles are published (status = 'published')
2. Check search query format
3. Review API logs for errors

### Admin Interface Issues

1. Clear browser cache
2. Check network tab for API errors
3. Verify backend API is accessible

## Support

### Getting Help

- Check documentation in `/docs`
- Use Help Center at `/help`
- Review API documentation
- Contact development team

### Reporting Issues

1. Document the issue
2. Include steps to reproduce
3. Attach screenshots if applicable
4. Submit through proper channels

## Next Steps

### For Users

1. Explore Help Center at `/help`
2. Search for topics of interest
3. Provide feedback on articles

### For Administrators

1. Review existing articles
2. Create new content as needed
3. Monitor usage statistics
4. Archive outdated content

### For Developers

1. Review API documentation
2. Integrate help features into your modules
3. Contribute new articles
4. Extend functionality as needed

## Related Links

- [Full Documentation](docs/README.md)
- [API Reference](apps/backend/src/routes/help/README.md)
- [Reorganization Report](docs/DOCUMENTATION_REORGANIZATION_2025_12_19.md)
- [Developer Onboarding](docs/DEVELOPER_ONBOARDING.md)

---

**Version**: 1.0  
**Last Updated**: December 19, 2025  
**Status**: Production Ready
