# Help Desk Module

The Help Desk module provides a comprehensive help system for managing documentation and support articles.

## Features

- **Article Management**: Create, read, update, and delete help articles
- **Categories**: Organize articles into categories
- **Search**: Advanced search with relevance scoring
- **Analytics**: Track article views and usage statistics
- **Status Management**: Draft, published, and archived states

## API Endpoints

### Articles

#### Get All Articles

```http
GET /api/help/articles?category=<category>&status=<status>&search=<query>&limit=<n>&offset=<n>
```

Returns a list of help articles with optional filtering.

**Query Parameters:**

- `category` (optional): Filter by category
- `status` (optional): Filter by status (default: "published")
- `search` (optional): Search in title, content, keywords, excerpt
- `limit` (optional): Maximum number of results
- `offset` (optional): Pagination offset

**Response:**

```json
{
  "success": true,
  "articles": [...],
  "count": 10
}
```

#### Get Article by ID

```http
GET /api/help/articles/:id
```

Returns a specific article and increments the view count.

**Response:**

```json
{
  "success": true,
  "article": {
    "id": 1,
    "title": "...",
    "content": "...",
    "category": "...",
    ...
  }
}
```

#### Create Article

```http
POST /api/help/articles
Content-Type: application/json

{
  "title": "Article Title",
  "content": "Article content in markdown",
  "category": "category-id",
  "excerpt": "Short description",
  "keywords": "keyword1,keyword2",
  "icon": "📖",
  "path": "/docs/path.md",
  "status": "published"
}
```

**Response:**

```json
{
  "success": true,
  "id": 123,
  "message": "Help article created successfully"
}
```

#### Update Article

```http
PUT /api/help/articles/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  ...
}
```

#### Delete Article

```http
DELETE /api/help/articles/:id
```

### Categories

#### Get All Categories

```http
GET /api/help/categories
```

Returns all help categories ordered by `order` field.

**Response:**

```json
{
  "success": true,
  "categories": [
    {
      "id": "getting-started",
      "name": "Erste Schritte",
      "icon": "🚀",
      "description": "...",
      "order": 1
    },
    ...
  ]
}
```

#### Create Category

```http
POST /api/help/categories
Content-Type: application/json

{
  "id": "new-category",
  "name": "New Category",
  "icon": "🎯",
  "description": "Category description",
  "order": 10
}
```

### Search

#### Advanced Search

```http
GET /api/help/search?q=<query>&category=<category>&limit=<n>
```

Performs advanced search with relevance scoring.

**Query Parameters:**

- `q` (required): Search query
- `category` (optional): Filter by category
- `limit` (optional): Maximum results (default: 20)

**Response:**

```json
{
  "success": true,
  "results": [
    {
      "id": 1,
      "title": "...",
      "category": "...",
      "excerpt": "...",
      "relevance": 10
    },
    ...
  ],
  "count": 5
}
```

Relevance scoring:

- Title match: 10 points
- Excerpt match: 5 points
- Keywords match: 3 points
- Content match: 1 point

### Statistics

#### Get Help Statistics

```http
GET /api/help/stats
```

Returns help system statistics.

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalArticles": 50,
    "publishedArticles": 45,
    "draftArticles": 5,
    "totalViews": 1234,
    "topArticles": [...]
  }
}
```

## Database Schema

### help_articles

| Column     | Type    | Description                        |
| ---------- | ------- | ---------------------------------- |
| id         | INTEGER | Primary key (auto-increment)       |
| title      | TEXT    | Article title                      |
| content    | TEXT    | Article content (markdown)         |
| category   | TEXT    | Category ID                        |
| excerpt    | TEXT    | Short description                  |
| keywords   | TEXT    | Comma-separated keywords           |
| icon       | TEXT    | Icon emoji                         |
| path       | TEXT    | Original file path                 |
| status     | TEXT    | Status: draft, published, archived |
| author     | TEXT    | Author name                        |
| created_at | TEXT    | Creation timestamp                 |
| updated_at | TEXT    | Last update timestamp              |
| view_count | INTEGER | Number of views                    |

**Indexes:**

- `idx_help_category` on `category`
- `idx_help_status` on `status`
- `idx_help_created` on `created_at`
- `idx_help_views` on `view_count`

### help_categories

| Column      | Type    | Description          |
| ----------- | ------- | -------------------- |
| id          | TEXT    | Primary key          |
| name        | TEXT    | Category name        |
| icon        | TEXT    | Icon emoji           |
| description | TEXT    | Category description |
| order       | INTEGER | Display order        |

**Indexes:**

- `idx_help_cat_order` on `order`

## Seeding Data

To seed the help system with initial data:

```bash
cd apps/backend
npm run build
node dist/routes/help/seedHelpData.js
```

Or programmatically:

```typescript
import { seedHelpData } from "./routes/help/seedHelpData.js";

await seedHelpData();
```

## Usage Example

### Frontend Integration

```typescript
// Fetch all published articles
const response = await fetch("/api/help/articles");
const { articles } = await response.json();

// Search for articles
const searchResponse = await fetch("/api/help/search?q=authentication");
const { results } = await searchResponse.json();

// Get article by ID
const articleResponse = await fetch("/api/help/articles/1");
const { article } = await articleResponse.json();
```

### Creating Articles

```typescript
const article = {
  title: "New Feature Guide",
  content: "# New Feature\n\nDetailed guide...",
  category: "tutorials",
  excerpt: "Learn about the new feature",
  keywords: "feature,tutorial,guide",
  icon: "📖",
  status: "published",
};

const response = await fetch("/api/help/articles", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(article),
});
```

## Security Considerations

- **Authentication**: Add authentication middleware for admin operations (POST, PUT, DELETE)
- **Authorization**: Implement role-based access control for article management
- **Input Validation**: All inputs are validated before database operations
- **SQL Injection**: Parameterized queries prevent SQL injection
- **XSS Protection**: Content should be sanitized when rendering

## Future Enhancements

- [ ] Article versioning and history
- [ ] Related articles suggestions
- [ ] Article ratings and feedback
- [ ] Multi-language support
- [ ] Rich media attachments
- [ ] Full-text search with Elasticsearch
- [ ] Article templates
- [ ] Bulk operations
- [ ] Export/import functionality
- [ ] Analytics dashboard

## Related Documentation

- [Frontend Help Center Component](../../../../frontend/src/components/HelpCenter/HelpCenter.tsx)
- [Help Desk Content Data](../../../../frontend/src/data/helpDeskContent.ts)
- [API Documentation](../../../docs/reference/modules-index.md)
