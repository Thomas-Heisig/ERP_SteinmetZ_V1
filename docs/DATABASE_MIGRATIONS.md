# Database Migrations Guide

This document describes the database migration system used in ERP SteinmetZ.

## Overview

The migration system uses SQLite as the primary database with support for PostgreSQL. Migrations are SQL files that are applied sequentially to modify the database schema.

## Migration Script Location

The main migration script is located at:
- `apps/backend/src/utils/migrateSchema.ts`

## Migration Files Location

Migration files are stored in:
- `apps/backend/data/migrations/`

## Migration File Naming Convention

Migration files should follow this naming pattern:
```
<number>_<description>.sql
```

Examples:
- `001_initial_schema.sql`
- `002_add_ai_tables.sql`
- `003_add_annotation_status.sql`

Files are applied in alphabetical/numerical order.

## Migration Tracking

The system tracks applied migrations in a special table:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT UNIQUE NOT NULL,
  applied_at TEXT DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'success',
  message TEXT
);
```

## Running Migrations

### Using npm scripts

```bash
# Run migration script
cd apps/backend
node dist/utils/migrateSchema.js
```

### Using ts-node (development)

```bash
cd apps/backend
npx tsx src/utils/migrateSchema.ts
```

## Creating a New Migration

1. Create a new SQL file in `apps/backend/data/migrations/`
2. Use sequential numbering (e.g., if last is 003, use 004)
3. Write your SQL statements
4. Test the migration locally

Example migration file:

```sql
-- SPDX-License-Identifier: MIT
-- Migration 004: Add user roles table

PRAGMA foreign_keys = off;

CREATE TABLE IF NOT EXISTS user_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

PRAGMA foreign_keys = on;
```

## Migration Best Practices

### 1. Use Transactions
The migration script automatically wraps migrations in transactions unless they contain their own `BEGIN TRANSACTION`.

### 2. Add Column Checks
Before adding columns, check if they exist:

```sql
-- The migration script automatically checks for existing columns
-- when it sees an ALTER TABLE ADD COLUMN statement
ALTER TABLE nodes ADD COLUMN new_field TEXT DEFAULT 'default_value';
```

### 3. Use IF NOT EXISTS
Always use `IF NOT EXISTS` for CREATE statements:

```sql
CREATE TABLE IF NOT EXISTS new_table (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);
```

### 4. Preserve Foreign Keys
When modifying tables with foreign keys:

```sql
PRAGMA foreign_keys = off;
-- Your modifications here
PRAGMA foreign_keys = on;
```

### 5. Add Indexes
Create indexes for frequently queried columns:

```sql
CREATE INDEX IF NOT EXISTS idx_table_column ON table_name(column_name);
```

## Rollback Strategy

The current migration system does not support automatic rollbacks. If a migration fails:

1. The migration is marked as 'failed' in the `schema_migrations` table
2. The transaction is rolled back
3. Subsequent migrations continue to run
4. Manual intervention may be required to fix the schema

### Manual Rollback Process

1. Identify the failed migration in `schema_migrations` table
2. Manually reverse the changes
3. Delete the entry from `schema_migrations` table
4. Fix the migration file
5. Re-run the migration script

## Testing Migrations

### Before Production

1. **Test on a copy of production data:**
   ```bash
   cp data/production.db data/test.db
   # Update DATABASE_URL to point to test.db
   npm run migrate
   ```

2. **Verify the changes:**
   ```bash
   sqlite3 data/test.db ".schema"
   ```

3. **Check the migration status:**
   ```sql
   SELECT * FROM schema_migrations ORDER BY applied_at DESC;
   ```

### Automated Testing

A test script is available to verify migrations work correctly:

```bash
cd apps/backend
npm run test:migrations
```

## Common Issues

### Issue: Migration already applied
**Solution:** The system automatically skips already-applied migrations.

### Issue: Column already exists
**Solution:** The migration script checks for existing columns before ALTER TABLE ADD COLUMN.

### Issue: Syntax error in SQL
**Solution:** Validate SQL syntax before committing. Test locally first.

### Issue: Foreign key constraint failure
**Solution:** Ensure foreign key references exist before creating relationships.

## Migration Script Features

- ✅ Automatic transaction management
- ✅ Duplicate column detection
- ✅ Migration tracking
- ✅ Detailed error reporting
- ✅ Continues on individual migration failure
- ✅ Statement splitting for multi-statement files
- ✅ Comment filtering

## Database Backup

Always backup your database before running migrations:

```bash
# SQLite backup
cp apps/backend/data/database.db apps/backend/data/database.backup.db

# Or use SQLite's built-in backup
sqlite3 apps/backend/data/database.db ".backup apps/backend/data/database.backup.db"
```

## Environment-Specific Migrations

Migrations run the same way in all environments. Use environment variables to control database connection:

- **Development:** `SQLITE_FILE=../../data/dev.sqlite3`
- **Production:** `SQLITE_FILE=../../data/production.sqlite3`
- **Test:** `SQLITE_FILE=../../data/test.sqlite3`

## Monitoring

Check migration status with this query:

```sql
SELECT 
  filename,
  status,
  applied_at,
  message
FROM schema_migrations 
ORDER BY applied_at DESC 
LIMIT 10;
```

## Support

For issues or questions about migrations, refer to:
- Migration script: `apps/backend/src/utils/migrateSchema.ts`
- Migration files: `apps/backend/data/migrations/`
- Issue tracker: Create an issue in the repository
