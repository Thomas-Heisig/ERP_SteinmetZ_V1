# Code Conventions and Style Guide

**Version:** 0.2.0  
**Last Updated:** December 2024

This document defines the coding standards and best practices for the ERP SteinmetZ project.

## Table of Contents

- [General Principles](#general-principles)
- [TypeScript](#typescript)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Code Formatting](#code-formatting)
- [Comments and Documentation](#comments-and-documentation)
- [React Guidelines](#react-guidelines)
- [Backend Guidelines](#backend-guidelines)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Git Workflow](#git-workflow)

---

## General Principles

### SOLID Principles

Follow SOLID principles:
- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

### DRY (Don't Repeat Yourself)

Avoid code duplication. Extract common logic into reusable functions or components.

### KISS (Keep It Simple, Stupid)

Write simple, readable code. Avoid over-engineering.

### Code Review Mindset

Write code that is easy to review. Think about the next developer who will read your code.

---

## TypeScript

### Type Safety

**DO:**
```typescript
// Define proper interfaces
interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

// Use explicit return types
function getUser(id: string): Promise<User> {
  // Implementation
}

// Use unknown instead of any when type is uncertain
function processData(data: unknown): void {
  if (typeof data === 'string') {
    // Process string
  }
}
```

**DON'T:**
```typescript
// Avoid any
function processData(data: any) {  // ❌
  // Implementation
}

// Avoid implicit any
function getValue(key) {  // ❌
  return storage[key];
}
```

### Type Definitions

**Interfaces vs Types:**
```typescript
// Use interfaces for object shapes
interface UserProfile {
  name: string;
  age: number;
}

// Use types for unions, intersections, or primitives
type Status = 'active' | 'inactive' | 'pending';
type ID = string | number;
```

### Enums

```typescript
// Use const enums for compile-time constants
const enum HttpStatus {
  OK = 200,
  BadRequest = 400,
  NotFound = 404,
}

// Use string enums for runtime values
enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
  Guest = 'GUEST',
}
```

### Generics

```typescript
// Use generics for reusable code
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  // Implementation
}
```

---

## File Organization

### File Structure

```
feature/
├── Component.tsx          # Main component
├── Component.test.tsx     # Tests
├── Component.css          # Styles
├── types.ts               # Type definitions
├── utils.ts               # Helper functions
├── hooks.ts               # Custom hooks
└── index.ts               # Public exports
```

### Imports Order

```typescript
// 1. External libraries
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal absolute imports
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

// 3. Relative imports
import { formatDate } from './utils';
import type { User } from './types';

// 4. Styles (last)
import './Component.css';
```

### Barrel Exports (index.ts)

```typescript
// Good: Clean public API
export { Dashboard } from './Dashboard';
export { DashboardWidget } from './DashboardWidget';
export type { DashboardProps } from './types';

// Avoid: Don't re-export everything
export * from './Dashboard';  // ❌
```

---

## Naming Conventions

### Files and Directories

```
PascalCase.tsx         # React components
camelCase.ts           # Services, utilities
kebab-case.css         # CSS files (optional)
UPPER_SNAKE_CASE.md    # Documentation
```

### Variables and Functions

```typescript
// Variables: camelCase
const userName = 'John';
const isActive = true;

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:3000';
const MAX_RETRY_COUNT = 3;

// Functions: camelCase
function getUserById(id: string): User {
  // Implementation
}

// Boolean functions: is/has/should prefix
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hasPermission(user: User, permission: string): boolean {
  return user.permissions.includes(permission);
}
```

### Classes and Interfaces

```typescript
// Classes: PascalCase
class UserService {
  private users: User[];
  
  constructor() {
    this.users = [];
  }
}

// Interfaces: PascalCase
interface UserProfile {
  id: string;
  name: string;
}

// Type aliases: PascalCase
type ApiResponse = {
  success: boolean;
  data: unknown;
};
```

### React Components

```typescript
// Components: PascalCase
export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return <div>{user.name}</div>;
};

// Props interface: ComponentName + Props
interface UserProfileProps {
  user: User;
  onUpdate?: (user: User) => void;
}
```

---

## Code Formatting

### Prettier Configuration

We use Prettier for automatic code formatting. Configuration is in `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

### Line Length

- Maximum line length: **80 characters** (enforced by Prettier)
- Break long lines for readability

### Indentation

- Use **2 spaces** for indentation (no tabs)
- Consistent across TypeScript, JSON, CSS

### Semicolons

- Always use semicolons (enforced by Prettier)

### Quotes

- Single quotes for strings: `'hello'`
- Double quotes for JSX attributes: `<div className="container">`

---

## Comments and Documentation

### JSDoc Comments

```typescript
/**
 * Fetches a user by ID from the database.
 * 
 * @param id - The unique user identifier
 * @returns Promise resolving to the user object
 * @throws {NotFoundError} If user is not found
 * @example
 * ```typescript
 * const user = await getUserById('user-123');
 * console.log(user.name);
 * ```
 */
async function getUserById(id: string): Promise<User> {
  // Implementation
}
```

### Inline Comments

```typescript
// Good: Explain WHY, not WHAT
// Using exponential backoff to avoid overwhelming the API
await retry(fetchData, { maxAttempts: 3, backoff: 'exponential' });

// Bad: Stating the obvious
// Increment counter by 1
counter++;  // ❌
```

### TODO Comments

```typescript
// TODO: Implement caching layer
// TODO(username): Optimize this query
// FIXME: Handle edge case when user is null
// HACK: Temporary workaround until API is fixed
```

### Comment Style

```typescript
// Single-line comment for brief notes

/**
 * Multi-line comment for functions, classes, and complex logic.
 * Provides detailed explanation when needed.
 */

/* 
 * Block comment for temporarily disabling code
 * (but prefer deleting unused code)
 */
```

---

## React Guidelines

### Component Structure

```typescript
import React, { useState, useEffect } from 'react';
import './MyComponent.css';

// 1. Type definitions
interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

// 2. Component definition
export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  // 3. Hooks
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 4. Event handlers
  const handleClick = () => {
    setCount(count + 1);
    onAction?.();
  };
  
  // 5. Render helpers (if needed)
  const renderContent = () => {
    return <div>{count}</div>;
  };
  
  // 6. Return JSX
  return (
    <div className="my-component">
      <h1>{title}</h1>
      {renderContent()}
      <button onClick={handleClick}>Click me</button>
    </div>
  );
};
```

### Hooks Guidelines

```typescript
// Custom hooks: use prefix
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);
  
  return { user, loading };
}

// Hook dependencies: Always specify
useEffect(() => {
  // Effect
}, [dependency1, dependency2]);  // ✓

useEffect(() => {
  // Effect
}, []);  // ✓ Empty for mount only

useEffect(() => {
  // Effect
});  // ❌ Missing dependencies
```

### Props Destructuring

```typescript
// Good: Destructure props
const MyComponent: React.FC<Props> = ({ title, onAction }) => {
  return <div>{title}</div>;
};

// Avoid: Accessing via props object
const MyComponent: React.FC<Props> = (props) => {  // ❌
  return <div>{props.title}</div>;
};
```

### Conditional Rendering

```typescript
// Short circuit for simple conditions
{isLoading && <Spinner />}
{!isLoading && <Content />}

// Ternary for if/else
{isLoading ? <Spinner /> : <Content />}

// Function for complex logic
const renderStatus = () => {
  if (error) return <Error />;
  if (loading) return <Loading />;
  return <Success />;
};

return <div>{renderStatus()}</div>;
```

---

## Backend Guidelines

### Route Handlers

```typescript
import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// Validation schema
const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

// Route handler
router.post('/users', async (req: Request, res: Response) => {
  try {
    // 1. Validate input
    const data = createUserSchema.parse(req.body);
    
    // 2. Business logic
    const user = await userService.createUser(data);
    
    // 3. Success response
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (err) {
    // 4. Error handling
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: err.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
```

### Service Layer

```typescript
// services/userService.ts
export class UserService {
  async createUser(data: CreateUserDto): Promise<User> {
    // Validation
    if (await this.userExists(data.email)) {
      throw new ConflictError('User already exists');
    }
    
    // Business logic
    const user = await db.users.create(data);
    
    // Side effects
    await emailService.sendWelcomeEmail(user);
    
    return user;
  }
  
  private async userExists(email: string): Promise<boolean> {
    const user = await db.users.findByEmail(email);
    return user !== null;
  }
}
```

### Database Queries

```typescript
// Good: Use parameterized queries
const user = await db.query(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// Bad: String concatenation (SQL injection risk)
const user = await db.query(
  `SELECT * FROM users WHERE id = ${userId}`  // ❌
);
```

---

## Error Handling

### Custom Error Classes

```typescript
// errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(400, message);
  }
}
```

### Error Handling Pattern

```typescript
// Backend
try {
  const result = await riskyOperation();
  return result;
} catch (err) {
  if (err instanceof NotFoundError) {
    // Handle specific error
    res.status(404).json({ error: err.message });
  } else if (err instanceof ValidationError) {
    // Handle validation
    res.status(400).json({ error: err.message });
  } else {
    // Unknown error
    logger.error('Unexpected error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Frontend
try {
  const data = await fetchData();
  setData(data);
} catch (err) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  setError(message);
  toast.error(message);
}
```

---

## Testing

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('UserService', () => {
  let service: UserService;
  
  beforeEach(() => {
    service = new UserService();
  });
  
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      
      // Act
      const user = await service.createUser(userData);
      
      // Assert
      expect(user).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
    });
    
    it('should throw error if user already exists', async () => {
      // Arrange
      const userData = { name: 'Jane', email: 'existing@example.com' };
      
      // Act & Assert
      await expect(service.createUser(userData))
        .rejects
        .toThrow('User already exists');
    });
  });
});
```

### Test Naming

```typescript
// Pattern: should [expected behavior] when [condition]
it('should return user when valid ID is provided', () => {});
it('should throw NotFoundError when user does not exist', () => {});
it('should cache results after first fetch', () => {});
```

---

## Git Workflow

### Branch Naming

```bash
feature/add-user-authentication
fix/dashboard-loading-issue
docs/update-api-documentation
refactor/optimize-database-queries
chore/update-dependencies
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add JWT authentication
feat(auth): add password reset functionality
fix: resolve memory leak in WebSocket connection
fix(dashboard): correct widget alignment on mobile
docs: update API documentation
docs(readme): add installation instructions
style: format code with Prettier
refactor: extract common validation logic
test: add tests for user service
chore: update dependencies
```

### Pull Requests

**PR Title:**
```
feat: Add user authentication system
```

**PR Description Template:**
```markdown
## Description
Brief description of changes

## Changes
- Added JWT authentication
- Created login/logout endpoints
- Added auth middleware

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] No console errors

## Screenshots
(if applicable)

## Related Issues
Closes #123
```

---

## Code Review Checklist

### For Author

- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Proper error handling
- [ ] TypeScript types defined
- [ ] Build passes
- [ ] Tests pass

### For Reviewer

- [ ] Code is readable
- [ ] Logic is sound
- [ ] Edge cases handled
- [ ] Tests are meaningful
- [ ] No security issues
- [ ] Performance considerations
- [ ] Documentation is clear

---

## Performance Best Practices

### React

```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
  return <div>{/* Complex rendering */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Use useCallback for event handlers passed to children
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

### Backend

```typescript
// Use caching
const cached = await cache.get(key);
if (cached) return cached;

const data = await fetchData();
await cache.set(key, data, { ttl: 3600 });
return data;

// Use pagination
const users = await db.users.find({
  limit: 20,
  offset: page * 20,
});

// Use database indexes
await db.query('CREATE INDEX idx_users_email ON users(email)');
```

---

## Security Best Practices

### Input Validation

```typescript
// Always validate user input
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const validated = schema.parse(req.body);
```

### SQL Injection Prevention

```typescript
// Use parameterized queries
db.query('SELECT * FROM users WHERE email = ?', [email]);

// Never concatenate user input
db.query(`SELECT * FROM users WHERE email = '${email}'`);  // ❌
```

### XSS Prevention

```typescript
// React escapes by default
<div>{userInput}</div>  // ✓ Safe

// Avoid dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // ❌
```

### Authentication

```typescript
// Hash passwords
const hashedPassword = await bcrypt.hash(password, 10);

// Verify JWT tokens
const decoded = jwt.verify(token, JWT_SECRET);

// Implement rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }));
```

---

**This is a living document. Update it as the project evolves.**

---

**Last Updated:** December 4, 2024  
**Maintainer:** Thomas Heisig
