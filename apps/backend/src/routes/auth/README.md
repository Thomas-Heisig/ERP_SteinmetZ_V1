# Authentication Router

**Version:** 0.2.0  
**Last Updated:** December 2025

## Overview

The Authentication Router provides secure user authentication and authorization functionality for the ERP system. It implements JWT-based authentication with session management, role-based access control (RBAC), and rate limiting for login attempts.

## Features

- **JWT Authentication**: Secure token-based authentication
- **Session Management**: Server-side session tracking
- **Role-Based Access Control (RBAC)**: Fine-grained permissions
- **Rate Limiting**: Protection against brute force attacks
- **Secure Cookie Handling**: HttpOnly, SameSite cookies
- **Input Validation**: Zod schemas for all requests
- **Standardized Error Handling**: APIError classes

## API Endpoints

### POST `/api/auth/register`

Register a new user account.

**Request Body:**

```typescript
{
  username: string;        // 3-50 characters
  password: string;        // Min 8 characters
  email: string;           // Valid email format
  firstName?: string;
  lastName?: string;
  role?: string;           // Default: 'user'
}
```

**Response:**

```typescript
{
  success: true;
  data: {
    userId: string;
    username: string;
    email: string;
    role: string;
  }
}
```

### POST `/api/auth/login`

Authenticate a user and create a session.

**Rate Limited:** 5 attempts per 15 minutes per IP

**Request Body:**

```typescript
{
  username: string;
  password: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: {
    token: string; // JWT token
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
    }
  }
}
```

**Sets Cookie:** `auth_token` (HttpOnly, SameSite, Secure in production)

### POST `/api/auth/logout`

End the current user session.

**Authentication Required**

**Response:**

```typescript
{
  success: true;
  message: "Logged out successfully";
}
```

### GET `/api/auth/me`

Get current user information.

**Authentication Required**

**Response:**

```typescript
{
  success: true;
  data: {
    id: string;
    username: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
  }
}
```

### GET `/api/auth/verify`

Verify a JWT token's validity.

**Authentication Required**

**Response:**

```typescript
{
  success: true;
  valid: boolean;
  user?: {
    id: string;
    username: string;
    role: string;
  }
}
```

### POST `/api/auth/refresh`

Refresh an expired or expiring JWT token.

**Authentication Required**

**Response:**

```typescript
{
  success: true;
  data: {
    token: string;
  }
}
```

## Authentication Middleware

### `authenticate()`

Verifies JWT token from header or cookie.

**Usage:**

```typescript
router.get("/protected", authenticate(), (req, res) => {
  // req.user is populated
  res.json({ user: req.user });
});
```

### `requireRole(roles: string[])`

Restricts access to specific user roles.

**Usage:**

```typescript
router.delete(
  "/admin/users/:id",
  authenticate(),
  requireRole(["admin", "superadmin"]),
  deleteUserHandler,
);
```

### `rateLimitLogin()`

Rate limits login attempts to prevent brute force attacks.

**Configuration:**

- **Max Attempts:** 5 per window
- **Window:** 15 minutes
- **Type:** Per IP address

## Security Features

### Password Security

- Minimum length: 8 characters
- Hashed with **bcrypt** (cost factor: 10)
- Never logged or exposed in responses

### JWT Configuration

- **Algorithm:** HS256
- **Expiry:** 24 hours (configurable via `JWT_EXPIRES_IN`)
- **Secret:** Environment variable `JWT_SECRET`
- **Cookie Options:**
  - `httpOnly: true` - Prevents XSS
  - `sameSite: 'strict'` - CSRF protection
  - `secure: true` (production) - HTTPS only

### RBAC Roles

Default roles in the system:

- `user` - Standard user access
- `manager` - Manager-level permissions
- `admin` - Administrative access
- `superadmin` - Full system access

## Validation Schemas

### Login Schema

```typescript
{
  username: string (required),
  password: string (required)
}
```

### Register Schema

```typescript
{
  username: string (3-50 chars),
  password: string (min 8 chars),
  email: string (valid email),
  firstName?: string,
  lastName?: string,
  role?: string
}
```

## Error Handling

Uses standardized APIError classes:

- `ValidationError`: Invalid credentials format
- `UnauthorizedError`: Invalid credentials or token
- `ForbiddenError`: Insufficient permissions
- `ConflictError`: Username/email already exists

All errors follow the standard error response format.

## Logging

Uses **Pino** for structured logging:

```typescript
logger.info({ userId, username }, "User logged in");
logger.warn({ ip, username }, "Failed login attempt");
logger.error({ err, userId }, "Auth error");
```

**Security Note:** Passwords are NEVER logged.

## Usage Examples

### Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "SecurePass123",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "SecurePass123"
  }'
```

### Get Current User

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Dependencies

- **express**: Web framework
- **jsonwebtoken**: JWT implementation
- **bcrypt**: Password hashing
- **zod**: Schema validation
- **express-rate-limit**: Rate limiting

## Related Services

- **AuthService** (`src/services/authService.ts`): Core authentication logic
- **authMiddleware** (`src/middleware/authMiddleware.ts`): Authentication middleware

## Related Documentation

- [ERROR_HANDLING.md](../../../../docs/ERROR_HANDLING.md) - Error handling patterns
- [SECURITY.md](../../../../SECURITY.md) - Security best practices

## Environment Variables

```bash
JWT_SECRET=your-secret-key-here       # Required
JWT_EXPIRES_IN=24h                    # Optional, default: 24h
NODE_ENV=production                   # Optional, affects cookie security
```

## Future Enhancements

- [ ] OAuth2 integration (Google, Microsoft)
- [ ] Two-factor authentication (2FA)
- [ ] Password reset flow
- [ ] Account lockout after failed attempts
- [ ] Session management dashboard
- [ ] Audit log for authentication events

## Maintainer

Thomas Heisig

**Last Review:** December 2025
