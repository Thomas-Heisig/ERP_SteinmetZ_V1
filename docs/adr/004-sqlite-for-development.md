# 004. SQLite for Development Database

**Date:** 2024-12-04  
**Status:** Accepted

## Context

The ERP SteinmetZ system requires a database for:

- User authentication and sessions
- Functions catalog persistence
- Application metadata
- Audit trails

We needed to choose a database strategy that would:

- Enable quick local development setup
- Support production requirements
- Allow easy testing
- Minimize infrastructure requirements

## Decision

Use **SQLite for development** and **PostgreSQL for production**.

**Development (SQLite):**

- File-based database (`data/dev.sqlite3`)
- No server setup required
- Perfect for local development
- Easily reset-able

**Production (PostgreSQL):**

- Robust, scalable RDBMS
- ACID compliance
- Rich feature set
- Industry standard

**Database Abstraction:**

- Service layer abstracts database specifics
- Same queries work on both databases
- Environment variable controls which to use

## Alternatives Considered

### Alternative 1: PostgreSQL for Everything

- **Pros:** Production parity, more features
- **Cons:** Requires server setup, harder for new devs
- **Why not:** Unnecessary complexity for development

### Alternative 2: MySQL/MariaDB

- **Pros:** Popular, well-supported
- **Cons:** Requires server, similar complexity to PostgreSQL
- **Why not:** PostgreSQL has better features

### Alternative 3: MongoDB (NoSQL)

- **Pros:** Flexible schema, JSON native
- **Cons:** No transactions, different query language
- **Why not:** Relational model fits our needs better

### Alternative 4: SQLite for Everything

- **Pros:** Simplest, no server needed
- **Cons:** Not suitable for production scale
- **Why not:** Production needs robust RDBMS

## Consequences

### Positive

- **Easy Setup:** New developers run `npm install` and start
- **No Infrastructure:** No database server needed for development
- **Fast Tests:** In-memory SQLite for unit tests
- **Version Control:** Can commit test databases
- **Low Overhead:** Minimal resource usage
- **Production Ready:** PostgreSQL handles scale

### Negative

- **Different Databases:** Must ensure compatibility
- **Feature Parity:** Can't use PostgreSQL-specific features in dev
- **Testing Gap:** Some production issues won't show in dev
- **Migration Complexity:** Must test migrations on both databases

### Risks

- **Risk:** SQL dialect differences cause issues
  - **Mitigation:** Use database abstraction layer, test on both
- **Risk:** Performance characteristics differ
  - **Mitigation:** Performance testing on production-like database
- **Risk:** Developers forget to test on PostgreSQL
  - **Mitigation:** CI/CD tests against PostgreSQL

## Implementation Notes

### Configuration

```bash
# Development (.env)
DB_DRIVER=sqlite
SQLITE_FILE=../../data/dev.sqlite3

# Production (.env.production)
DB_DRIVER=postgresql
DATABASE_URL=postgresql://user:password@localhost:5432/erp_steinmetz
```

### Database Service

```typescript
// services/dbService.ts
class DatabaseService {
  private driver: "sqlite" | "postgresql";

  async init() {
    if (this.driver === "sqlite") {
      this.connection = await sqlite.open({
        filename: process.env.SQLITE_FILE,
        driver: sqlite3.Database,
      });
    } else {
      this.connection = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
      });
    }
  }

  async query(sql: string, params: any[]) {
    // Abstraction handles both databases
    return this.connection.query(sql, params);
  }
}
```

### Migration Strategy

- Write migrations in portable SQL
- Test on both SQLite and PostgreSQL
- Use migration tool that supports both (e.g., node-pg-migrate)

### Testing

```typescript
// Use in-memory SQLite for unit tests
beforeEach(async () => {
  db = await sqlite.open({
    filename: ":memory:",
    driver: sqlite3.Database,
  });
  await runMigrations(db);
});
```

## References

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Better SQLite3](https://github.com/WiseLibs/better-sqlite3)
- [node-postgres](https://node-postgres.com/)

---

**Author:** Thomas Heisig  
**Status:** Accepted  
**Last Updated:** 2024-12-04
