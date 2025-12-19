# Backend Middleware

This directory contains Express middleware for the ERP SteinmetZ backend.

## Available Middleware

### Authentication & Authorization

#### `authMiddleware.ts`

Provides authentication and authorization middleware:

- **`authenticate()`**: Validates JWT tokens and attaches auth context to request
- **`optionalAuthenticate()`**: Validates token if present, but doesn't require it
- **`requirePermission(permission)`**: Factory for permission-based authorization
- **`requireRole(roleName)`**: Factory for role-based authorization
- **`rateLimitLogin()`**: Rate limiter specifically for login endpoints

**Usage:**

```typescript
import {
  authenticate,
  requirePermission,
} from "./middleware/authMiddleware.js";

router.get("/protected", authenticate, (req, res) => {
  res.json({ user: req.auth?.userId });
});

router.post(
  "/admin",
  authenticate,
  requirePermission("admin.*"),
  (req, res) => {
    // Only users with admin.* permission can access
  },
);
```

### Error Handling

#### `errorHandler.ts`

Global error handling middleware with standardized error responses.

**Usage:**

```typescript
import { errorHandler } from "./middleware/errorHandler.js";

// Add as last middleware
app.use(errorHandler);
```

#### `asyncHandler.ts`

Wraps async route handlers to catch errors and pass them to error middleware.

**Usage:**

```typescript
import { asyncHandler } from "./middleware/asyncHandler.js";

router.get(
  "/data",
  asyncHandler(async (req, res) => {
    const data = await fetchData();
    res.json(data);
  }),
);
```

### Rate Limiting

#### `rateLimiters.ts`

Pre-configured rate limiters for different endpoint types:

- **`generalRateLimiter`**: 100 requests per 15 minutes (general API)
- **`aiRateLimiter`**: 20 requests per 15 minutes (AI chat, translation)
- **`strictAiRateLimiter`**: 5 requests per 15 minutes (expensive AI operations)
- **`audioRateLimiter`**: 10 requests per hour (audio transcription)

**Configuration:**
Set `SKIP_RATE_LIMIT=true` in development to disable rate limiting.

**Usage:**

```typescript
import { aiRateLimiter } from "./middleware/rateLimiters.js";

router.post("/ai/chat", aiRateLimiter, async (req, res) => {
  // Handle AI chat
});
```

### Standardized Error Responses

All middleware uses the standardized error response format defined in `utils/errorResponse.ts`:

```typescript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human-readable message",
    details?: any,
    timestamp: "2024-12-04T14:00:00Z",
    path: "/api/endpoint"
  }
}
```

## Best Practices

1. **Always use asyncHandler** for async route handlers
2. **Apply rate limiting** to expensive or abuse-prone endpoints
3. **Use authentication middleware** before protected routes
4. **Combine middleware** for layered security:

   ```typescript
   router.post(
     "/ai/generate",
     aiRateLimiter, // Rate limit first
     authenticate, // Then authenticate
     requirePermission("ai"), // Then authorize
     asyncHandler(handler), // Finally handle
   );
   ```

## Error Codes

Standard error codes are defined in `utils/errorResponse.ts`:

- `BAD_REQUEST` - Invalid request format
- `UNAUTHORIZED` - Authentication required/failed
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Input validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error
- `SERVICE_UNAVAILABLE` - Service temporarily down
- `AI_PROVIDER_ERROR` - AI provider error
- `AI_MODEL_NOT_FOUND` - AI model not available
- `AI_QUOTA_EXCEEDED` - AI usage quota exceeded
