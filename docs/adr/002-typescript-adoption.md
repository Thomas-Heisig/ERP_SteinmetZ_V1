# 002. TypeScript for All New Code

**Date:** 2024-12-04  
**Status:** Accepted

## Context

The project was initially developed with a mix of JavaScript and TypeScript. As the codebase grew, we faced increasing challenges:
- Runtime type errors that could have been caught at compile time
- Difficulty understanding function signatures and data structures
- Refactoring was risky without type safety
- IDE autocomplete was limited without type information

We needed to decide on a language strategy going forward.

## Decision

All new code must be written in TypeScript. Existing JavaScript code will be gradually migrated to TypeScript.

**Requirements:**
- All `.ts` and `.tsx` files for new code
- Strict mode enabled in `tsconfig.json`
- Type definitions for all public APIs
- No use of `any` type unless absolutely necessary
- Proper interface definitions for all data structures

**Configuration:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## Alternatives Considered

### Alternative 1: Continue with JavaScript
- **Pros:** No migration effort, no learning curve
- **Cons:** Continued type errors, poor IDE support
- **Why not:** Type safety is critical for maintainability

### Alternative 2: JSDoc Type Annotations
- **Pros:** Type checking without TypeScript
- **Cons:** Verbose, not enforced, limited features
- **Why not:** TypeScript provides better DX and enforcement

### Alternative 3: Flow
- **Pros:** Similar to TypeScript, Facebook-backed
- **Cons:** Smaller ecosystem, declining popularity
- **Why not:** TypeScript is the industry standard

## Consequences

### Positive
- **Type Safety:** Catch errors at compile time
- **Better IDE Support:** Autocomplete, refactoring, navigation
- **Self-Documenting:** Types serve as documentation
- **Refactoring Confidence:** Safe refactoring with type checking
- **Team Productivity:** Faster development with fewer bugs
- **Onboarding:** Easier for new developers to understand code

### Negative
- **Build Step:** Requires compilation before running
- **Learning Curve:** Developers must learn TypeScript
- **Initial Slowdown:** Type definitions take time to write
- **Dependency Types:** Need @types packages for libraries

### Risks
- **Risk:** Developers may use `any` to bypass type checking
  - **Mitigation:** ESLint rule to warn on `any`, code review
- **Risk:** Complex types may become hard to understand
  - **Mitigation:** Keep types simple, document complex ones

## Implementation Notes

### Migration Strategy

1. **Phase 1:** All new files must be TypeScript
2. **Phase 2:** Migrate critical services and utilities
3. **Phase 3:** Gradually convert remaining JavaScript files

### Type Definitions

**Example Service:**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface CreateUserDto {
  name: string;
  email: string;
}

class UserService {
  async createUser(data: CreateUserDto): Promise<User> {
    // Implementation
  }
  
  async getUserById(id: string): Promise<User | null> {
    // Implementation
  }
}
```

### Best Practices

- Define interfaces for all data structures
- Use `unknown` instead of `any` when type is uncertain
- Leverage type inference where obvious
- Export types alongside implementation
- Use generics for reusable code

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [tsconfig.json Reference](https://www.typescriptlang.org/tsconfig)

---

**Author:** Thomas Heisig  
**Status:** Accepted  
**Last Updated:** 2024-12-04
