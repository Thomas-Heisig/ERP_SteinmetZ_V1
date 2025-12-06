# API Integration Guide

**Estimated Time**: 30 minutes  
**Level**: Intermediate  
**Prerequisites**: Basic HTTP knowledge, familiarity with REST APIs

---

## Introduction

This guide demonstrates how to integrate with the ERP SteinmetZ REST API. You'll learn how to authenticate, make API calls, handle responses, and build integrations.

## API Overview

### Base URL

```
Development: http://localhost:3000
Production:  https://your-domain.com
```

### Authentication

The API uses **JWT (JSON Web Tokens)** for authentication.

### Content Type

All requests and responses use `application/json`.

### API Versioning

Current version: **v1** (included in URL path: `/api/v1/...`)  
Legacy endpoints: `/api/...` (still supported)

## Quick Start

### 1. Health Check

Verify the API is accessible:

```bash
curl http://localhost:3000/api/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2025-12-06T21:45:00.000Z",
  "uptime": 123.456,
  "database": "connected"
}
```

### 2. Get Functions Catalog

Retrieve the functions catalog:

```bash
curl http://localhost:3000/api/functions/roots
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Dashboard",
      "icon": "📊",
      "description": "Central overview"
    }
    // ... more functions
  ]
}
```

## Authentication

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your-password"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "username": "admin",
    "role": "admin"
  }
}
```

### Using the Token

Include the JWT token in subsequent requests:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/hr/employees
```

## API Endpoints

### HR Module

#### Get Employees

```http
GET /api/hr/employees
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `search` (string, optional): Search term
- `department` (string, optional): Filter by department

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "department": "Engineering",
      "position": "Senior Developer"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

#### Create Employee

```http
POST /api/hr/employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@company.com",
  "department": "HR",
  "position": "HR Manager",
  "startDate": "2025-01-15"
}
```

### Finance Module

#### Get Invoices

```http
GET /api/finance/invoices
Authorization: Bearer <token>
```

**Query Parameters:**

- `status` (string): "draft", "sent", "paid", "overdue"
- `from` (date): Start date
- `to` (date): End date

#### Create Invoice

```http
POST /api/finance/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "123",
  "items": [
    {
      "description": "Consulting Services",
      "quantity": 10,
      "price": 150.00
    }
  ],
  "dueDate": "2025-01-31"
}
```

### QuickChat (AI Assistant)

```http
POST /api/quickchat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What are today's pending tasks?",
  "context": {
    "userId": "123",
    "language": "en"
  }
}
```

**Response:**

```json
{
  "success": true,
  "response": "You have 3 pending tasks: ...",
  "timestamp": "2025-12-06T21:45:00.000Z"
}
```

## Code Examples

### JavaScript (Node.js)

```javascript
// Using fetch
const API_URL = "http://localhost:3000";
let authToken = null;

// Login
async function login(username, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  authToken = data.token;
  return data;
}

// Get employees
async function getEmployees() {
  const response = await fetch(`${API_URL}/api/hr/employees`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return await response.json();
}

// Usage
await login("admin", "password");
const employees = await getEmployees();
console.log(employees);
```

### Python

```python
import requests

API_URL = 'http://localhost:3000'
auth_token = None

# Login
def login(username, password):
    global auth_token
    response = requests.post(
        f'{API_URL}/api/auth/login',
        json={'username': username, 'password': password}
    )
    data = response.json()
    auth_token = data['token']
    return data

# Get employees
def get_employees():
    headers = {'Authorization': f'Bearer {auth_token}'}
    response = requests.get(f'{API_URL}/api/hr/employees', headers=headers)
    return response.json()

# Usage
login('admin', 'password')
employees = get_employees()
print(employees)
```

### cURL

```bash
# Store token in variable
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  | jq -r '.token')

# Use token for API calls
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/hr/employees
```

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Employee not found",
    "statusCode": 404
  }
}
```

### Common Error Codes

| Code                    | Status | Description                |
| ----------------------- | ------ | -------------------------- |
| `BAD_REQUEST`           | 400    | Invalid request parameters |
| `UNAUTHORIZED`          | 401    | Authentication required    |
| `FORBIDDEN`             | 403    | Insufficient permissions   |
| `NOT_FOUND`             | 404    | Resource not found         |
| `VALIDATION_ERROR`      | 422    | Validation failed          |
| `INTERNAL_SERVER_ERROR` | 500    | Server error               |

### Error Handling Example

```javascript
async function handleApiCall() {
  try {
    const response = await fetch(`${API_URL}/api/hr/employees`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    console.error("API Error:", error.message);
    // Handle error appropriately
  }
}
```

## Rate Limiting

### Limits

- **AI Endpoints**: 10 requests per minute
- **General Endpoints**: 100 requests per minute

### Headers

Rate limit information is included in response headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1733518800
```

### Handling Rate Limits

```javascript
async function apiCallWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);

    if (response.status === 429) {
      // Rate limited - wait and retry
      const resetTime = response.headers.get("X-RateLimit-Reset");
      const waitTime = resetTime * 1000 - Date.now();
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      continue;
    }

    return response;
  }
  throw new Error("Max retries exceeded");
}
```

## Webhooks (Planned)

Webhook support is planned for real-time event notifications.

**Planned Events:**

- Employee created/updated
- Invoice paid
- Task completed
- System alerts

## Best Practices

### 1. Token Management

```javascript
// Store token securely
localStorage.setItem("auth_token", token);

// Refresh token before expiry
function scheduleTokenRefresh(expiresIn) {
  const refreshTime = (expiresIn - 300) * 1000; // 5 min before expiry
  setTimeout(refreshAuthToken, refreshTime);
}
```

### 2. Error Handling

```javascript
// Always handle errors
async function safeApiCall(endpoint) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}
```

### 3. Pagination

```javascript
// Fetch all pages
async function fetchAllEmployees() {
  let allEmployees = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `${API_URL}/api/hr/employees?page=${page}&limit=100`,
    );
    const data = await response.json();

    allEmployees = allEmployees.concat(data.data);

    if (data.data.length < 100) break;
    page++;
  }

  return allEmployees;
}
```

### 4. Caching

```javascript
// Simple cache implementation
const cache = new Map();

async function cachedApiCall(endpoint, ttl = 60000) {
  const cached = cache.get(endpoint);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await fetch(endpoint).then((r) => r.json());
  cache.set(endpoint, { data, timestamp: Date.now() });
  return data;
}
```

## Testing Your Integration

### Using Postman

1. Import the API collection: `docs/api/postman-collection.json`
2. Set environment variables:
   - `base_url`: `http://localhost:3000`
   - `token`: Your JWT token
3. Run collection tests

### Using OpenAPI/Swagger

View interactive API documentation:

```
http://localhost:3000/api-docs
```

(Note: Swagger UI setup required)

## Additional Resources

- [OpenAPI Specification](../api/openapi.yaml)
- [Postman Collection](../api/postman-collection.json)
- [API Reference](../reference/API_REFERENCE.md)
- [Authentication Guide](../explanation/AUTHENTICATION.md)

## Support

For API support:

- 📖 Check the [API Documentation](../api/API_DOCUMENTATION.md)
- 🐛 Report bugs via [GitHub Issues](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues)
- 💬 Ask questions in [Discussions](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/discussions)

---

**Last Updated**: December 6, 2025  
**Version**: 1.0.0  
**Maintainer**: Thomas Heisig
