# Authentication System Documentation

## Overview

The ERP SteinmetZ authentication system provides secure user authentication, session management, and role-based access control (RBAC) for the dashboard application.

## Architecture

### Components

1. **Backend Services**
   - `AuthService`: Core authentication logic (registration, login, session management)
   - `authMiddleware`: Express middleware for route protection
   - `authRouter`: RESTful API endpoints

2. **Frontend Components**
   - `AuthContext`: Global authentication state management
   - `Login` page: User authentication interface
   - `ProtectedRoute`: HOC for securing routes

3. **Database Schema**
   - `users`: User accounts with credentials
   - `roles`: System roles (Admin, User, Viewer)
   - `user_roles`: User-role associations
   - `sessions`: Active user sessions
   - `password_reset_tokens`: Password reset functionality

## Security Features

### Password Security
- **Hashing**: bcrypt with 10 rounds
- **Requirements**: Minimum 8 characters, mixed case, numbers
- **Validation**: Zod schema validation on both frontend and backend

### Session Management
- **Token Type**: JWT (JSON Web Tokens)
- **Access Token**: 24 hours expiration (configurable via JWT_EXPIRES_IN)
- **Refresh Token**: 7 days expiration (configurable via REFRESH_TOKEN_EXPIRES_IN)
- **Storage**: HttpOnly cookies + localStorage
- **Validation**: Token signature and expiration checked on every request

### Account Protection
- **Rate Limiting**: Max 10 login attempts per IP per 15 minutes
- **Account Lockout**: 5 failed attempts = 15 minute lockout
- **Session Tracking**: IP address and user agent logged

### Authorization
- **Role-Based Access Control (RBAC)**
  - Admin: Full system access (`*` permission)
  - User: Standard access (dashboard, catalog, AI)
  - Viewer: Read-only access
- **Permission Checking**: Middleware functions for route protection
- **Role Assignment**: Only admins can assign/remove roles

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "full_name": "string" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "full_name": "string",
    "is_active": true,
    "is_verified": false,
    "created_at": "timestamp"
  },
  "message": "User registered successfully"
}
```

#### POST /api/auth/login
Authenticate user and create session.

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "user": { /* user object */ },
  "token": "jwt_token",
  "refreshToken": "refresh_token",
  "expiresAt": "timestamp"
}
```

**Rate Limit:** 10 attempts per IP per 15 minutes

#### POST /api/auth/logout
Invalidate current session.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /api/auth/me
Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": { /* user object */ },
  "roles": [ /* role objects */ ],
  "permissions": ["permission1", "permission2"]
}
```

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "new_jwt_token",
  "expiresAt": "timestamp"
}
```

#### POST /api/auth/change-password
Change user password (requires authentication).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### User Management (Admin Only)

#### GET /api/auth/users
List all users.

**Headers:** `Authorization: Bearer <token>`

**Role Required:** Admin

**Response:**
```json
{
  "success": true,
  "users": [ /* array of user objects */ ]
}
```

#### GET /api/auth/roles
List all available roles.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "roles": [ /* array of role objects */ ]
}
```

#### POST /api/auth/users/:userId/roles
Assign role to user.

**Headers:** `Authorization: Bearer <token>`

**Role Required:** Admin

**Request:**
```json
{
  "roleId": "string"
}
```

#### DELETE /api/auth/users/:userId/roles/:roleId
Remove role from user.

**Headers:** `Authorization: Bearer <token>`

**Role Required:** Admin

#### DELETE /api/auth/users/:userId
Delete user account.

**Headers:** `Authorization: Bearer <token>`

**Role Required:** Admin

**Note:** Cannot delete your own account

## Frontend Usage

### Using AuthContext

```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole
  } = useAuth();

  // Check if user has permission
  if (hasPermission('dashboard.write')) {
    // Allow action
  }

  // Check if user has role
  if (hasRole('Admin')) {
    // Show admin features
  }
}
```

### Protecting Routes

```typescript
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Basic protection (requires authentication)
<ProtectedRoute>
  <MyComponent />
</ProtectedRoute>

// Require specific permission
<ProtectedRoute requiredPermission="dashboard.write">
  <MyComponent />
</ProtectedRoute>

// Require specific role
<ProtectedRoute requiredRole="Admin">
  <AdminPanel />
</ProtectedRoute>
```

## Environment Variables

### Backend (.env)

```env
# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Optional: Admin Password (for initial setup)
ADMIN_PASSWORD=Admin123!
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Admin User

```bash
cd apps/backend
npx tsx src/scripts/createAdminUser.ts
```

Default credentials:
- Username: `admin`
- Password: `Admin123!`

### 3. Start Services

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

### 4. Access Application

Open http://localhost:5173 and login with admin credentials.

## Security Considerations

### Current Implementation

✅ **Implemented:**
- Password hashing with bcrypt
- JWT token authentication
- HttpOnly cookies
- Rate limiting on login
- Account lockout protection
- Input validation with Zod
- SQL injection protection via parameterized queries
- XSS protection via React's built-in escaping
- Session expiration
- Role-based access control

⚠️ **Known Limitations:**
- No CSRF protection (planned for future release)
- No email verification
- No 2FA support
- No password reset via email
- Session tokens stored in localStorage (less secure than httpOnly cookies for frontend state)

### Recommendations

1. **CSRF Protection**: Add CSRF tokens for state-changing operations
2. **Email Verification**: Implement email verification for new accounts
3. **2FA**: Add two-factor authentication support
4. **Password Reset**: Implement secure password reset via email
5. **Audit Logging**: Enhance audit trail for security events
6. **Session Management**: Add ability to view and revoke active sessions
7. **IP Whitelisting**: Optional IP restriction for admin accounts

## Troubleshooting

### Issue: "Invalid or expired token"

**Cause:** Token has expired or been invalidated

**Solution:** Use refresh token to get new access token, or re-login

### Issue: "Account locked"

**Cause:** Too many failed login attempts

**Solution:** Wait 15 minutes or contact administrator

### Issue: "Insufficient permissions"

**Cause:** User lacks required permission or role

**Solution:** Contact administrator to request appropriate role assignment

### Issue: Database tables not created

**Cause:** Migration not run during initialization

**Solution:** 
```bash
cd apps/backend
npx tsx src/scripts/createAdminUser.ts
```

## Testing

### Manual Testing

1. **Registration Flow**
   - Register new user
   - Verify user created in database
   - Check default role assignment

2. **Login Flow**
   - Login with valid credentials
   - Verify token received
   - Verify redirect to dashboard
   - Check user menu appears

3. **Protected Routes**
   - Try accessing dashboard without login
   - Verify redirect to login page
   - Login and verify access granted

4. **Logout Flow**
   - Click logout button
   - Verify token invalidated
   - Verify redirect to login

5. **Role-Based Access**
   - Login as non-admin user
   - Try accessing admin-only endpoints
   - Verify access denied

### API Testing with curl

```bash
# Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}' \
  | jq -r '.token')

# Get current user
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# List users (admin only)
curl http://localhost:3000/api/auth/users \
  -H "Authorization: Bearer $TOKEN"
```

## Maintenance

### Cleaning Up Expired Sessions

Sessions are automatically marked as invalid when they expire. To clean up old session records:

```sql
DELETE FROM sessions 
WHERE expires_at < datetime('now') 
  AND is_valid = 0;
```

### Monitoring Failed Login Attempts

```sql
SELECT 
  user_id,
  COUNT(*) as failed_attempts,
  MAX(created_at) as last_attempt
FROM audit_log
WHERE action = 'login'
  AND details LIKE '%failed%'
  AND created_at > datetime('now', '-1 day')
GROUP BY user_id
HAVING failed_attempts > 3;
```

## Future Enhancements

- [ ] CSRF protection
- [ ] Email verification
- [ ] Two-factor authentication (2FA)
- [ ] Password reset via email
- [ ] OAuth/SSO integration (Google, GitHub, etc.)
- [ ] Session activity dashboard
- [ ] Advanced audit logging
- [ ] IP-based restrictions
- [ ] Biometric authentication support
- [ ] Remember me functionality
- [ ] Account recovery options
