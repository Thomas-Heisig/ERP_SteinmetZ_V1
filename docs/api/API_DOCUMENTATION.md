# ERP SteinmetZ - API Documentation

**Version:** 0.2.0  
**Last Updated:** December 2024

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
  - [Health](#health-endpoints)
  - [AI & Chat](#ai--chat-endpoints)
  - [Functions Catalog](#functions-catalog-endpoints)
  - [AI Annotator](#ai-annotator-endpoints)
  - [Dashboard](#dashboard-endpoints)
  - [Authentication](#authentication-endpoints)
  - [System](#system-endpoints)

## Overview

The ERP SteinmetZ API provides a comprehensive REST API for enterprise resource planning with AI-powered features. The API is built with Express 5 and follows RESTful principles.

### Key Features

- **AI-Powered Chat:** Multi-provider AI chat system (OpenAI, Ollama, Anthropic)
- **Functions Catalog:** 15,472+ function nodes across 11 business areas
- **AI Annotator:** Automated metadata generation and annotation
- **Real-time Updates:** WebSocket support for live data
- **Multilingual:** Support for 7 languages
- **RBAC:** Role-based access control

## Base URL

### Development
```
http://localhost:3000
```

### Production
```
https://api.erp-steinmetz.example.com
```

## Authentication

### JWT Bearer Token

Most endpoints require a JWT bearer token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

**Example:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  http://localhost:3000/api/functions
```

### Admin Token

System administration endpoints require an admin token:

```http
x-admin-token: <your-admin-token>
```

**Example:**
```bash
curl -H "x-admin-token: your-admin-token-here" \
  http://localhost:3000/api/system/info
```

## Rate Limiting

API rate limits are applied per endpoint category:

- **AI Endpoints:** 20 requests per 15 minutes
- **General Endpoints:** 100 requests per minute
- **Search Endpoints:** 30 requests per minute

When rate limit is exceeded, you'll receive a `429 Too Many Requests` response.

## Error Handling

All error responses follow a consistent format:

```json
{
  "success": false,
  "error": "Error message here",
  "details": {
    "field": "Additional details"
  },
  "timestamp": "2024-12-04T10:00:00Z",
  "path": "/api/endpoint"
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## API Endpoints

## Health Endpoints

### GET /api/health

Get comprehensive system health status.

**Authentication:** None required

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-04T10:00:00Z",
  "uptime": 3600,
  "version": "0.2.0",
  "database": {
    "status": "connected",
    "responseTime": 5
  },
  "ai": {
    "provider": "ollama",
    "status": "available",
    "model": "qwen2.5:3b"
  }
}
```

**Example:**
```bash
curl http://localhost:3000/api/health
```

---

## AI & Chat Endpoints

### GET /api/ai/models

List all available AI models across all configured providers.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "id": "gpt-4o-mini",
      "name": "GPT-4o Mini",
      "provider": "openai",
      "capabilities": ["chat", "vision"],
      "maxTokens": 128000
    },
    {
      "id": "qwen2.5:3b",
      "name": "Qwen 2.5 3B",
      "provider": "ollama",
      "capabilities": ["chat"],
      "maxTokens": 32768
    }
  ]
}
```

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/ai/models
```

### POST /api/ai/chat

Create a new chat session with AI.

**Authentication:** Required

**Request Body:**
```json
{
  "model": "gpt-4o-mini"
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "model": "gpt-4o-mini",
    "messages": [],
    "createdAt": "2024-12-04T10:00:00Z",
    "updatedAt": "2024-12-04T10:00:00Z"
  }
}
```

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4o-mini"}' \
  http://localhost:3000/api/ai/chat
```

### POST /api/ai/chat/:sessionId/message

Send a message to an existing chat session.

**Authentication:** Required

**Path Parameters:**
- `sessionId` (string, required) - Chat session UUID

**Request Body:**
```json
{
  "message": "Hello, how can you help me?"
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "role": "assistant",
    "content": "Hello! I'm here to help you with various tasks...",
    "timestamp": "2024-12-04T10:00:01Z"
  }
}
```

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain SAGA pattern"}' \
  http://localhost:3000/api/ai/chat/550e8400-e29b-41d4-a716-446655440000/message
```

### GET /api/ai/sessions

List all active chat sessions.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "model": "gpt-4o-mini",
      "messages": [
        {
          "role": "user",
          "content": "Hello",
          "timestamp": "2024-12-04T10:00:00Z"
        }
      ],
      "createdAt": "2024-12-04T10:00:00Z",
      "updatedAt": "2024-12-04T10:00:01Z"
    }
  ]
}
```

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/ai/sessions
```

### DELETE /api/ai/chat/:sessionId

Delete a chat session.

**Authentication:** Required

**Path Parameters:**
- `sessionId` (string, required) - Chat session UUID

**Response:**
```json
{
  "success": true,
  "message": "Session gelöscht"
}
```

**Example:**
```bash
curl -X DELETE \
  -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/ai/chat/550e8400-e29b-41d4-a716-446655440000
```

### POST /api/ai/audio/transcribe

Transcribe audio file to text (Speech-to-Text).

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body:**
- `audio` (file, required) - Audio file (mp3, wav, m4a, etc.)

**Response:**
```json
{
  "success": true,
  "transcript": "This is the transcribed text from the audio file."
}
```

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "audio=@recording.mp3" \
  http://localhost:3000/api/ai/audio/transcribe
```

### POST /api/ai/translate

Translate text to another language.

**Authentication:** Required

**Request Body:**
```json
{
  "text": "Hello, world!",
  "targetLanguage": "de",
  "sourceLanguage": "en"
}
```

**Response:**
```json
{
  "success": true,
  "translation": "Hallo, Welt!",
  "sourceLanguage": "en",
  "targetLanguage": "de"
}
```

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, world!","targetLanguage":"de"}' \
  http://localhost:3000/api/ai/translate
```

---

## Functions Catalog Endpoints

### GET /api/functions

Get the complete functions catalog tree.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "1_dashboard",
        "name": "Dashboard",
        "kind": "category",
        "description": "Zentrale Übersicht und Steuerung",
        "children": [...]
      }
    ],
    "loadedAt": "2024-12-04T10:00:00Z",
    "totalNodes": 15472
  }
}
```

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/functions
```

### GET /api/functions/roots

Get only the root-level function categories (11 business areas).

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "roots": [
    {
      "id": "1_dashboard",
      "name": "Dashboard",
      "kind": "category",
      "description": "Zentrale Übersicht und Steuerung"
    },
    {
      "id": "2_geschaeftsverwaltung",
      "name": "Geschäftsverwaltung",
      "kind": "category",
      "description": "Stammdaten und Grundfunktionen"
    }
  ]
}
```

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/functions/roots
```

### GET /api/functions/nodes/:id

Get a specific function node by ID.

**Authentication:** Required

**Path Parameters:**
- `id` (string, required) - Function node ID

**Response:**
```json
{
  "success": true,
  "node": {
    "id": "1_dashboard",
    "name": "Dashboard",
    "kind": "category",
    "description": "Zentrale Übersicht und Steuerung",
    "tags": ["overview", "analytics"],
    "children": [...]
  }
}
```

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/functions/nodes/1_dashboard
```

### GET /api/functions/search

Search for functions with full-text search and filtering.

**Authentication:** Required

**Query Parameters:**
- `q` (string, optional) - Search query
- `kinds` (string, optional) - Comma-separated kinds (category, function, action, rule, form)
- `tags` (string, optional) - Comma-separated tags
- `area` (string, optional) - Business area filter
- `limit` (integer, optional, default: 20) - Max results
- `offset` (integer, optional, default: 0) - Pagination offset

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "invoice_create",
      "name": "Rechnung erstellen",
      "kind": "function",
      "description": "Neue Rechnung anlegen",
      "tags": ["finance", "invoice"]
    }
  ],
  "total": 156,
  "limit": 20,
  "offset": 0
}
```

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/functions/search?q=rechnung&limit=10"
```

### POST /api/functions/menu

Get filtered menu based on user context (RBAC).

**Authentication:** Required

**Request Body:**
```json
{
  "roles": ["admin", "manager"],
  "features": ["ai", "analytics"],
  "area": "Finance"
}
```

**Response:**
```json
{
  "success": true,
  "menu": [
    {
      "id": "finance",
      "name": "Finanzen",
      "kind": "category",
      "children": [...]
    }
  ]
}
```

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"roles":["admin"],"features":["ai"]}' \
  http://localhost:3000/api/functions/menu
```

---

## AI Annotator Endpoints

### POST /api/ai-annotator/nodes/:id/generate-meta

Generate metadata for a function node using AI.

**Authentication:** Required

**Path Parameters:**
- `id` (string, required) - Function node ID

**Request Body:**
```json
{
  "fields": ["description", "tags", "permissions"]
}
```

**Response:**
```json
{
  "success": true,
  "metadata": {
    "description": "AI-generated description",
    "tags": ["finance", "invoice", "automation"],
    "permissions": {
      "roles": ["accountant", "manager"],
      "features": ["finance"]
    }
  }
}
```

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"fields":["description","tags"]}' \
  http://localhost:3000/api/ai-annotator/nodes/invoice_create/generate-meta
```

### POST /api/ai-annotator/batch

Process multiple nodes in batch for metadata generation.

**Authentication:** Required

**Request Body:**
```json
{
  "nodeIds": ["node1", "node2", "node3"],
  "fields": ["description", "tags"],
  "options": {
    "overwrite": false,
    "async": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "batchId": "batch-123",
  "status": "processing",
  "total": 3,
  "processed": 0
}
```

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nodeIds":["node1","node2"],"fields":["description"]}' \
  http://localhost:3000/api/ai-annotator/batch
```

---

## Dashboard Endpoints

### GET /api/dashboard

Get dashboard data including widgets and analytics.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "widgets": [
      {
        "id": "sales-overview",
        "type": "chart",
        "title": "Sales Overview",
        "data": {...}
      }
    ],
    "stats": {
      "totalRevenue": 150000,
      "activeProjects": 12,
      "pendingTasks": 45
    }
  }
}
```

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/dashboard
```

---

## Authentication Endpoints

### POST /api/auth/login

Authenticate user and receive JWT token.

**Authentication:** None required

**Request Body:**
```json
{
  "username": "admin",
  "password": "secure-password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "username": "admin",
    "roles": ["admin"]
  }
}
```

**Example:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  http://localhost:3000/api/auth/login
```

### POST /api/auth/refresh

Refresh JWT token using refresh token.

**Authentication:** None required

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Example:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGciOiJIUzI1NiIs..."}' \
  http://localhost:3000/api/auth/refresh
```

---

## System Endpoints

### GET /api/system/info

Get system information (requires admin token).

**Authentication:** Admin token required

**Response:**
```json
{
  "success": true,
  "info": {
    "version": "0.2.0",
    "environment": "development",
    "nodeVersion": "v20.10.0",
    "platform": "linux",
    "memory": {
      "total": 16000000000,
      "used": 8000000000
    }
  }
}
```

**Example:**
```bash
curl -H "x-admin-token: your-admin-token" \
  http://localhost:3000/api/system/info
```

---

## Pagination

Endpoints supporting pagination use `limit` and `offset` parameters:

**Example:**
```bash
# Get results 21-40
curl "http://localhost:3000/api/functions/search?q=invoice&limit=20&offset=20"
```

## Filtering

Many endpoints support filtering via query parameters:

**Example:**
```bash
# Filter by multiple criteria
curl "http://localhost:3000/api/functions/search?kinds=function,action&tags=finance&area=Accounting"
```

## Webhooks

Configure webhooks to receive real-time notifications about events:

### Supported Events
- `function.created`
- `function.updated`
- `function.deleted`
- `batch.completed`
- `annotation.completed`

**Webhook Payload:**
```json
{
  "event": "function.updated",
  "timestamp": "2024-12-04T10:00:00Z",
  "data": {
    "id": "node-123",
    "changes": {...}
  }
}
```

---

## Best Practices

### 1. Use Appropriate HTTP Methods
- `GET` for retrieving data
- `POST` for creating resources
- `PUT`/`PATCH` for updating resources
- `DELETE` for removing resources

### 2. Handle Errors Gracefully
Always check the `success` field in responses and handle errors appropriately.

### 3. Implement Exponential Backoff
When rate limited, implement exponential backoff before retrying.

### 4. Cache Responses
Cache responses where appropriate to reduce API calls.

### 5. Use Pagination
Always use pagination for large datasets.

### 6. Validate Input
Validate all input on the client side before sending to the API.

---

## Support & Resources

- **OpenAPI Specification:** [openapi.yaml](./openapi.yaml)
- **Postman Collection:** [postman-collection.json](./postman-collection.json)
- **GitHub Repository:** https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1
- **Issues:** https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues

---

**Last Updated:** December 4, 2024  
**Maintainer:** Thomas Heisig
