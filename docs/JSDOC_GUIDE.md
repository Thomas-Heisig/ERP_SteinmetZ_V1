# JSDoc Style Guide

**Status**: ✅ Active  
**Version**: 1.0.0  
**Letzte Aktualisierung**: 9. Dezember 2025

## Übersicht

Diese Anleitung definiert, wie Code in ERP SteinmetZ dokumentiert werden soll. Gute Dokumentation hilft neuen Entwicklern, den Code zu verstehen und TypeDoc generiert daraus automatisch API-Dokumentation.

## Grundregeln

### 1. Was muss dokumentiert werden?

✅ **MUSS dokumentiert werden**:

- Öffentliche APIs (exported functions, classes, methods)
- Komplexe Logik oder Algorithmen
- Non-triviale Business Rules
- Type Guards und Assertions
- Middleware und Router
- Services und Utilities

❌ **Muss NICHT dokumentiert werden**:

- Getter/Setter ohne Logik
- Triviale Private Methods
- Test Files (außer komplexe Test-Utilities)
- Offensichtliche Code (z.B. `add(a, b)` braucht keine Doku)

### 2. Sprache

- **Code**: Englisch (bereits Standard)
- **Kommentare**: Englisch
- **JSDoc**: Englisch
- **User-Facing Docs**: Deutsch

**Grund**: Internationale Entwickler-Community, bessere Tool-Support

## JSDoc Syntax

### Basic Function

````typescript
/**
 * Calculates the total price including tax.
 *
 * @param price - The base price before tax
 * @param taxRate - Tax rate as decimal (e.g., 0.19 for 19%)
 * @returns The total price including tax
 * @throws {BadRequestError} If price or taxRate is negative
 *
 * @example
 * ```ts
 * const total = calculateTotalPrice(100, 0.19);
 * // returns 119
 * ```
 */
export function calculateTotalPrice(price: number, taxRate: number): number {
  if (price < 0 || taxRate < 0) {
    throw new BadRequestError("Price and tax rate must be positive");
  }
  return price * (1 + taxRate);
}
````

### Class

````typescript
/**
 * Manages user sessions with Redis backend.
 *
 * @remarks
 * This class provides session storage with automatic expiration
 * and optional in-memory fallback for development.
 *
 * @example
 * ```ts
 * const sessionManager = new SessionManager(redisClient);
 * await sessionManager.set("session-123", userData, 3600);
 * const user = await sessionManager.get("session-123");
 * ```
 */
export class SessionManager {
  /**
   * Creates a new SessionManager instance.
   *
   * @param redisClient - Redis client for session storage
   * @param options - Optional configuration
   */
  constructor(
    private redisClient: RedisClient,
    private options: SessionOptions = {},
  ) {
    // implementation
  }

  /**
   * Retrieves session data by ID.
   *
   * @param sessionId - Unique session identifier
   * @returns Session data if found, null otherwise
   *
   * @throws {ServiceUnavailableError} If Redis is unavailable
   */
  async get(sessionId: string): Promise<SessionData | null> {
    // implementation
  }
}
````

### Type/Interface

```typescript
/**
 * Configuration options for the logger.
 *
 * @public
 */
export interface LoggerOptions {
  /**
   * Minimum log level to output.
   * @defaultValue "info"
   */
  level?: LogLevel;

  /**
   * Whether to pretty-print logs (development only).
   * @defaultValue false
   */
  prettyPrint?: boolean;

  /**
   * File path for log output. If not provided, logs to stdout only.
   */
  filePath?: string;

  /**
   * Secrets to redact from logs (e.g., passwords, tokens).
   * @defaultValue ["password", "token", "apiKey", "secret"]
   */
  redact?: string[];
}
```

### Enum

```typescript
/**
 * HTTP status codes used in API responses.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export enum HttpStatus {
  /** Request succeeded */
  OK = 200,

  /** Resource created successfully */
  CREATED = 201,

  /** Request accepted but not yet processed */
  ACCEPTED = 202,

  /** Invalid request parameters */
  BAD_REQUEST = 400,

  /** Authentication required */
  UNAUTHORIZED = 401,

  /** Authenticated but not authorized */
  FORBIDDEN = 403,

  /** Resource not found */
  NOT_FOUND = 404,

  /** Server error */
  INTERNAL_SERVER_ERROR = 500,
}
```

### Async Function

````typescript
/**
 * Fetches user data from the database.
 *
 * @param userId - User ID to fetch
 * @returns Promise resolving to user data
 * @throws {NotFoundError} If user doesn't exist
 * @throws {DatabaseError} If database query fails
 *
 * @example
 * ```ts
 * try {
 *   const user = await getUserById("user-123");
 *   console.log(user.name);
 * } catch (error) {
 *   if (error instanceof NotFoundError) {
 *     console.log("User not found");
 *   }
 * }
 * ```
 */
export async function getUserById(userId: string): Promise<User> {
  // implementation
}
````

## JSDoc Tags

### Essential Tags

| Tag           | Verwendung                     | Beispiel                            |
| ------------- | ------------------------------ | ----------------------------------- |
| `@param`      | Beschreibt Parameter           | `@param userId - The user ID`       |
| `@returns`    | Beschreibt Rückgabewert        | `@returns The user object`          |
| `@throws`     | Beschreibt mögliche Exceptions | `@throws {NotFoundError}`           |
| `@example`    | Zeigt Verwendungsbeispiel      | Siehe oben                          |
| `@remarks`    | Zusätzliche Hinweise           | `@remarks This is thread-safe`      |
| `@see`        | Link zu verwandten Docs        | `@see getUserById`                  |
| `@deprecated` | Markiert veraltete APIs        | `@deprecated Use getUserV2 instead` |
| `@since`      | Seit welcher Version verfügbar | `@since 0.3.0`                      |
| `@internal`   | Nur für internen Gebrauch      | `@internal`                         |
| `@public`     | Öffentliche API                | `@public`                           |
| `@private`    | Private Implementierung        | `@private`                          |

### Advanced Tags

| Tag              | Verwendung              | Beispiel                       |
| ---------------- | ----------------------- | ------------------------------ |
| `@typeParam`     | Beschreibt Generic Type | `@typeParam T - The item type` |
| `@defaultValue`  | Default-Wert            | `@defaultValue 10`             |
| `@beta`          | Beta-Feature            | `@beta`                        |
| `@experimental`  | Experimentell           | `@experimental`                |
| `@eventProperty` | Event-Property          | Für Event-Emitter              |
| `@callback`      | Callback-Function       | `@callback RequestCallback`    |

## Patterns & Best Practices

### 1. Generic Function

````typescript
/**
 * Filters an array based on a predicate function.
 *
 * @typeParam T - The type of items in the array
 * @param items - Array to filter
 * @param predicate - Function to test each item
 * @returns Filtered array
 *
 * @example
 * ```ts
 * const numbers = [1, 2, 3, 4, 5];
 * const evens = filterArray(numbers, n => n % 2 === 0);
 * // evens = [2, 4]
 * ```
 */
export function filterArray<T>(
  items: T[],
  predicate: (item: T) => boolean,
): T[] {
  return items.filter(predicate);
}
````

### 2. HOC (Higher-Order Component)

````typescript
/**
 * Wraps a component with error boundary.
 *
 * @param Component - React component to wrap
 * @param fallback - Optional fallback UI
 * @returns Wrapped component with error boundary
 *
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(MyComponent, <ErrorFallback />);
 * ```
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode,
): React.ComponentType<P> {
  // implementation
}
````

### 3. Type Guard

````typescript
/**
 * Type guard to check if value is a valid User object.
 *
 * @param value - Value to check
 * @returns True if value is a User
 *
 * @example
 * ```ts
 * if (isUser(data)) {
 *   console.log(data.name); // TypeScript knows data is User
 * }
 * ```
 */
export function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value
  );
}
````

### 4. Factory Function

````typescript
/**
 * Creates a configured logger instance.
 *
 * @param moduleName - Name of the module using the logger
 * @param options - Optional logger configuration
 * @returns Configured logger instance
 *
 * @remarks
 * Loggers are cached by module name to avoid duplicate instances.
 *
 * @example
 * ```ts
 * const logger = createLogger("auth-service");
 * logger.info({ userId: "123" }, "User logged in");
 * ```
 */
export function createLogger(
  moduleName: string,
  options?: LoggerOptions,
): Logger {
  // implementation
}
````

### 5. Middleware

````typescript
/**
 * Express middleware for request authentication.
 *
 * @remarks
 * Validates JWT token from Authorization header and attaches
 * user data to req.user. Responds with 401 if token is invalid.
 *
 * @example
 * ```ts
 * app.get("/api/protected", authMiddleware, (req, res) => {
 *   // req.user is available here
 *   res.json({ user: req.user });
 * });
 * ```
 *
 * @throws {UnauthorizedError} If token is missing or invalid
 */
export const authMiddleware: RequestHandler = async (req, res, next) => {
  // implementation
};
````

## Code Examples

### Example-Struktur

````typescript
/**
 * @example
 * Basic usage:
 * ```ts
 * const result = myFunction(input);
 * console.log(result); // expected output
 * ```
 *
 * @example
 * Advanced usage with error handling:
 * ```ts
 * try {
 *   const result = await myAsyncFunction(input);
 *   console.log(result);
 * } catch (error) {
 *   console.error("Failed:", error.message);
 * }
 * ```
 */
````

## TypeDoc-Generierung

### NPM Script

```bash
# Generate API documentation
npm run docs

# Serve documentation locally
npm run docs:serve
```

### Output

Dokumentation wird generiert in: `docs/api/index.html`

### CI/CD Integration

```yaml
# .github/workflows/docs.yml
name: Documentation

on:
  push:
    branches: [main]

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run docs
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/api
```

## Migration Plan

### Phase 1: Critical APIs (Woche 1-2)

- [ ] Services (aiProviderHealthService, authService, etc.)
- [ ] Middleware (authMiddleware, errorHandler, etc.)
- [ ] Core Utilities (logger, errorResponse, etc.)

### Phase 2: Routes (Woche 3-4)

- [ ] AI Router & Sub-Routes
- [ ] HR Router
- [ ] Finance Router
- [ ] Auth Router

### Phase 3: Supporting Code (Woche 5-6)

- [ ] Types & Interfaces
- [ ] Utilities
- [ ] Helpers

## Linting & Enforcement

### ESLint Rule (Optional)

```javascript
// eslint.config.js
{
  rules: {
    "jsdoc/require-jsdoc": [
      "warn",
      {
        publicOnly: true,
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
        },
      },
    ],
    "jsdoc/require-param": "warn",
    "jsdoc/require-returns": "warn",
  },
}
```

## Tools & IDE Support

### VS Code Extensions

- **Document This**: Auto-generate JSDoc templates
- **Better Comments**: Highlight different comment types
- **TypeDoc**: Preview generated documentation

### Shortcuts

- VS Code: Type `/**` above function and press Enter → Auto-generates JSDoc template

## Weitere Ressourcen

- [TypeScript TSDoc](https://tsdoc.org/)
- [TypeDoc Documentation](https://typedoc.org/)
- [JSDoc Cheatsheet](https://devhints.io/jsdoc)
- [Google JavaScript Style Guide - Comments](https://google.github.io/styleguide/jsguide.html#jsdoc)

---

**Letzte Aktualisierung**: 9. Dezember 2025  
**Maintainer**: Thomas Heisig  
**Nächster Review**: Februar 2026
