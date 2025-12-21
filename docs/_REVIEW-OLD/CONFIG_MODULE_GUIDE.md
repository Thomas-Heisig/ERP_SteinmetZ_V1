# Configuration Module Guide

Complete documentation for the ERP SteinmetZ Configuration system covering environment variables, role-based access control, and provider setup.

**Last Updated:** 2025-12-20  
**Status:** ✅ Production Ready  
**Module Path:** `apps/backend/src/config/`

---

## Table of Contents

- [Overview](#overview)
- [Environment Variables](#environment-variables)
- [RBAC Configuration](#rbac-configuration)
- [AI Provider Setup](#ai-provider-setup)
- [Production Configuration](#production-configuration)
- [Development Setup](#development-setup)
- [Validation and Error Handling](#validation-and-error-handling)
- [Common Issues](#common-issues)
- [Best Practices](#best-practices)

---

## Overview

The Configuration module provides centralized management of environment variables, role-based access control (RBAC), and AI provider settings. It uses **Zod schemas** for type-safe validation and **structured logging** for debugging.

### Core Files

| File                                                    | Purpose                                        | Lines |
| ------------------------------------------------------- | ---------------------------------------------- | ----- |
| [`env.ts`](../apps/backend/src/config/env.ts)           | Environment variable validation and management | 353   |
| [`env.test.ts`](../apps/backend/src/config/env.test.ts) | Comprehensive validation tests                 | 500+  |
| [`rbac.ts`](../apps/backend/src/config/rbac.ts)         | Role definitions and permissions               | 710   |

### Key Features

✅ **Type-Safe Validation** - Zod schemas for all environment variables  
✅ **Structured Logging** - Pino logger with debug/info/warn/error levels  
✅ **Multi-Provider Support** - OpenAI, Anthropic, Azure, Ollama, Local  
✅ **RBAC System** - 5-level role hierarchy with module-based permissions  
✅ **Production Checks** - JWT strength, CORS validation, database verification  
✅ **Comprehensive Tests** - 28 tests covering all validation scenarios

---

## Environment Variables

### Server Configuration

Control basic server behavior and networking.

```env
# Application port (default: 3000)
PORT=3000

# Node environment (development | production | test)
NODE_ENV=development

# CORS origin for frontend connections
CORS_ORIGIN=http://localhost:5173
```

### Database Configuration

Configure SQLite or PostgreSQL database connections.

```env
# Database driver selection (sqlite | postgresql)
DB_DRIVER=sqlite

# SQLite file path (relative or absolute)
SQLITE_FILE=data/dev.sqlite3

# PostgreSQL connection string (if DB_DRIVER=postgresql)
DATABASE_URL=postgresql://user:password@localhost:5432/steinmetz
```

**Selection Logic:**

- If `DB_DRIVER=sqlite`: Use `SQLITE_FILE` path
- If `DB_DRIVER=postgresql`: Use `DATABASE_URL` connection string

### AI Provider Configuration

Configure integration with LLM providers for AI Annotator and intelligent features.

#### OpenAI Setup

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4-turbo-preview
```

**Requirements:**

- Valid OpenAI API key (starts with `sk-`)
- Supported models: `gpt-4`, `gpt-4-turbo-preview`, `gpt-3.5-turbo`
- API key must have sufficient quota

#### Anthropic Setup

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

**Requirements:**

- Valid Anthropic API key (starts with `sk-ant-`)
- Supported models: `claude-3-opus`, `claude-3-sonnet`, `claude-3-haiku`

#### Azure OpenAI Setup

```env
AI_PROVIDER=azure
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

**Requirements:**

- Valid Azure OpenAI resource API key
- Endpoint URL (with trailing slash)
- Deployment name matching your Azure resource

#### Ollama Setup

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
```

**Requirements:**

- Ollama service running and accessible
- Model must be pulled locally: `ollama pull qwen2.5:3b`
- Supported models: `qwen2.5:3b`, `mistral`, `neural-chat`, `llama2`

#### Local Model Setup

```env
AI_PROVIDER=local
LOCAL_MODEL_PATH=/path/to/model.bin
LOCAL_MODEL_NAME=custom-model
```

**Requirements:**

- ONNX or compatible model file
- Model must be accessible at `LOCAL_MODEL_PATH`
- No external API calls (completely local)

#### Disabled AI

```env
AI_PROVIDER=none
```

Disables all AI features. Application runs without AI Annotator.

### Functions Configuration

Control dynamic function loading and persistence.

```env
# Directory containing function definitions
FUNCTIONS_DIR=./docs/functions

# Auto-load functions on startup (0 or 1)
FUNCTIONS_AUTOLOAD=1

# Watch function files for changes in development (0 or 1)
FUNCTIONS_WATCH=1

# Auto-persist function changes to database (0 or 1)
FUNCTIONS_AUTOPERSIST=0
```

### Logging Configuration

Configure application logging behavior.

```env
# Log level (trace | debug | info | warn | error | fatal)
LOG_LEVEL=info

# Log HTTP requests and responses (0 or 1)
LOG_REQUESTS=1
```

**Recommended Levels:**

- **Development:** `debug` - See detailed operation flow
- **Production:** `info` - Standard operational logging
- **Debugging:** `trace` - Very detailed, includes internal calls

### Security Configuration

Control security-related settings.

```env
# JWT secret for authentication (minimum 32 characters, must contain uppercase, lowercase, number, symbol)
JWT_SECRET=YourSecureJWTSecretWith32CharactersMinimum!@#

# JWT token expiration time
JWT_EXPIRES_IN=24h

# Refresh token expiration time
REFRESH_TOKEN_EXPIRES_IN=7d

# Maximum file upload size (bytes, default: 10MB)
MAX_FILE_UPLOAD_SIZE=10485760

# Maximum batch operation size
MAX_BATCH_OPERATION_SIZE=100
```

**JWT Secret Requirements:**

- Minimum 32 characters
- Must contain uppercase letters
- Must contain lowercase letters
- Must contain at least one number
- Must contain at least one symbol (!@#$%^&\*)

### Fallback Configuration

Control error tolerance and fallback mechanisms.

```env
# Enable wiki fallback for missing AI responses (0 or 1)
FALLBACK_WIKI=1

# Enable AI fallback strategies (0 or 1)
AI_FALLBACK_ENABLED=1
```

---

## RBAC Configuration

### Role Hierarchy

The system implements a 5-level role hierarchy with privilege inheritance.

```
┌─────────────────────────────────────┐
│ SUPER_ADMIN (Level 0)               │  Full system access
│ ├─ Can manage all roles             │
│ ├─ Can modify system settings       │
│ └─ Unrestricted access              │
└─────────────────────────────────────┘
         ↓ inherits from
┌─────────────────────────────────────┐
│ ADMIN (Level 1)                     │  Administrative access
│ ├─ Can manage users and roles       │
│ ├─ Can configure modules            │
│ └─ Can generate reports             │
└─────────────────────────────────────┘
         ↓ inherits from
┌─────────────────────────────────────┐
│ MANAGER (Level 2)                   │  Departmental management
│ ├─ Can manage team members          │
│ ├─ Can view team metrics            │
│ └─ Can approve requests             │
└─────────────────────────────────────┘
         ↓ inherits from
┌─────────────────────────────────────┐
│ USER (Level 3)                      │  Standard user access
│ ├─ Can access assigned modules      │
│ ├─ Can create own records           │
│ └─ Can view assigned data           │
└─────────────────────────────────────┘
         ↓ inherits from
┌─────────────────────────────────────┐
│ GUEST (Level 4)                     │  Read-only access
│ ├─ Can view public resources        │
│ ├─ Cannot create or modify          │
│ └─ Limited data access              │
└─────────────────────────────────────┘
```

### Module Permissions

Permissions follow the pattern `module:action`.

#### HR Module

```typescript
// Permissions available in HR module
hr:read        // View HR records
hr:create      // Create new employees
hr:update      // Modify employee data
hr:delete      // Remove employees
hr:export      // Export HR data
hr:approve     // Approve HR requests
```

#### Finance Module

```typescript
finance: read; // View financial records
finance: create; // Create transactions
finance: approve; // Approve transactions
finance: reconcile; // Reconcile accounts
finance: report; // Generate financial reports
```

#### CRM Module

```typescript
crm:read       // View customer data
crm:create     // Create customer records
crm:update     // Update customer information
crm:delete     // Delete customer records
crm:export     // Export customer data
```

#### Dashboard

```typescript
dashboard: read; // View dashboard
dashboard: setup; // Configure dashboard
```

#### Calendar

```typescript
calendar: read; // View calendar events
calendar: create; // Create events
calendar: update; // Modify events
```

### Role Definitions

#### SUPER_ADMIN

```typescript
{
  id: 'super_admin',
  name: 'Super Administrator',
  description: 'Full system access with no restrictions',
  is_system: true,
  permissions: [
    'hr:*',           // All HR permissions
    'finance:*',      // All Finance permissions
    'crm:*',          // All CRM permissions
    'dashboard:*',    // All Dashboard permissions
    'calendar:*',     // All Calendar permissions
    // ... all available permissions
  ]
}
```

**Use Cases:**

- System administrators
- Initial setup and configuration
- Security management
- Emergency access

#### ADMIN

```typescript
{
  id: 'admin',
  name: 'Administrator',
  description: 'Administrative access to system configuration',
  is_system: true,
  permissions: [
    'hr:read',
    'hr:create',
    'hr:update',
    'finance:read',
    'finance:create',
    'finance:approve',
    'crm:read',
    'crm:create',
    'crm:update',
    'dashboard:read',
    'dashboard:setup'
  ]
}
```

**Use Cases:**

- System administrators
- Department heads
- Power users

#### MANAGER

```typescript
{
  id: 'manager',
  name: 'Manager',
  description: 'Departmental management and team oversight',
  is_system: true,
  permissions: [
    'hr:read',
    'hr:create',
    'hr:update',
    'finance:read',
    'crm:read',
    'crm:create',
    'crm:update',
    'dashboard:read',
    'calendar:read',
    'calendar:create'
  ]
}
```

**Use Cases:**

- Team leads
- Department managers
- Project managers

#### USER

```typescript
{
  id: 'user',
  name: 'User',
  description: 'Standard user with assigned module access',
  is_system: true,
  permissions: [
    'hr:read',
    'finance:read',
    'crm:read',
    'crm:create',
    'dashboard:read',
    'calendar:read',
    'calendar:create'
  ]
}
```

**Use Cases:**

- Regular employees
- Data entry staff
- Standard users

#### GUEST

```typescript
{
  id: 'guest',
  name: 'Guest',
  description: 'Read-only access to public resources',
  is_system: true,
  permissions: [
    'dashboard:read',
    'calendar:read'
  ]
}
```

**Use Cases:**

- External consultants
- Read-only access users
- Temporary users

---

## AI Provider Setup

### Provider Selection Strategy

Choose your AI provider based on your needs:

| Provider         | Setup Effort | Cost        | Privacy | Speed     |
| ---------------- | ------------ | ----------- | ------- | --------- |
| **OpenAI**       | Easy         | Medium      | Cloud   | Fast      |
| **Anthropic**    | Easy         | Medium-High | Cloud   | Medium    |
| **Azure OpenAI** | Medium       | Variable    | Cloud   | Fast      |
| **Ollama**       | Medium       | Free        | Local   | Slow      |
| **Local**        | Hard         | Free        | Local   | Very Slow |
| **None**         | N/A          | Free        | N/A     | N/A       |

### OpenAI Configuration

#### Step 1: Get API Key

1. Visit [OpenAI API](https://platform.openai.com/account/api-keys)
2. Create or select an API key
3. Copy the key (starts with `sk-proj-`)

#### Step 2: Set Environment Variables

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_MODEL=gpt-4-turbo-preview
```

#### Step 3: Verify Setup

```bash
npm run dev

# In another terminal
curl -X POST http://localhost:3000/api/ai/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, test response"}'
```

### Anthropic Configuration

#### Step 1: Get API Key

1. Visit [Anthropic Console](https://console.anthropic.com/account/keys)
2. Create an API key
3. Copy the key (starts with `sk-ant-`)

#### Step 2: Set Environment Variables

```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

#### Step 3: Verify Setup

```bash
npm run dev
# Application will use Anthropic Claude models automatically
```

### Azure OpenAI Configuration

#### Step 1: Create Azure Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Create "Azure OpenAI" resource
3. Deploy a model (e.g., "gpt-4")
4. Note the Resource name and Deployment name

#### Step 2: Get Credentials

In Azure Portal, go to **Keys and Endpoint**:

- Copy **Key 1** or **Key 2**
- Copy **Endpoint** URL

#### Step 3: Set Environment Variables

```bash
AI_PROVIDER=azure
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

#### Step 4: Verify Setup

```bash
npm run dev
# Application will use Azure OpenAI endpoint
```

### Ollama Configuration

#### Step 1: Install Ollama

Download from [Ollama.ai](https://ollama.ai):

**Windows:**

```bash
# Download and install from ollama.ai
# Ollama will start automatically on http://localhost:11434
```

**macOS:**

```bash
brew install ollama
ollama serve  # Start Ollama service
```

**Linux:**

```bash
curl https://ollama.ai/install.sh | sh
ollama serve  # Start Ollama service
```

#### Step 2: Pull Model

In another terminal:

```bash
# Pull qwen2.5:3b (recommended for most systems)
ollama pull qwen2.5:3b

# Or pull alternative models
ollama pull mistral        # Fast, 7B parameters
ollama pull neural-chat    # Good quality, 7B
ollama pull llama2         # Strong, 7B
```

#### Step 3: Set Environment Variables

```bash
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
```

#### Step 4: Verify Setup

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Should return list of available models
```

### Local Model Configuration

#### Step 1: Prepare Model

1. Obtain an ONNX-compatible model file
2. Place in your models directory
3. Ensure model path is accessible

#### Step 2: Set Environment Variables

```bash
AI_PROVIDER=local
LOCAL_MODEL_PATH=/absolute/path/to/model.bin
LOCAL_MODEL_NAME=my-custom-model
MODELS_DIR=./models
```

#### Step 3: Verify Setup

```bash
# Check model file exists
ls -la /absolute/path/to/model.bin

npm run dev
# Application will load local model on startup
```

---

## Production Configuration

### Pre-Deployment Checklist

#### 1. Environment Variables

```bash
# Verify all required variables are set
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-domain.com

# Database
DB_DRIVER=postgresql
DATABASE_URL=postgresql://user:secure-password@host:5432/db

# AI Provider (choose one)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_MODEL=gpt-4-turbo-preview

# Security (CRITICAL)
JWT_SECRET=GenerateSecureSecretWith32CharsMin!@#
```

#### 2. JWT Secret Generation

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Result should be 32+ characters with mixed case, numbers, and symbols
```

**Validation:**

```typescript
// JWT_SECRET must pass validation
const jwtSecret = process.env.JWT_SECRET;
const isValid =
  jwtSecret &&
  jwtSecret.length >= 32 &&
  /[A-Z]/.test(jwtSecret) && // uppercase
  /[a-z]/.test(jwtSecret) && // lowercase
  /[0-9]/.test(jwtSecret) && // number
  /[!@#$%^&*]/.test(jwtSecret); // symbol
```

#### 3. Database Configuration

```bash
# PostgreSQL (recommended for production)
DB_DRIVER=postgresql
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# Connection pooling (add to DATABASE_URL)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require&pool_size=20
```

**Verify Connection:**

```bash
# Test PostgreSQL connection
psql postgresql://user:pass@host:5432/database_name -c "SELECT version();"
```

#### 4. CORS Configuration

```bash
# Specify exact origin for production
CORS_ORIGIN=https://your-domain.com

# For multiple domains (comma-separated in code)
# CORS_ORIGIN=https://domain1.com,https://domain2.com
```

#### 5. Logging Configuration

```bash
# Production logging
LOG_LEVEL=info
LOG_REQUESTS=1

# Log to file (configure in logger setup)
# See apps/backend/src/utils/logger.ts
```

#### 6. API Rate Limiting

```bash
MAX_FILE_UPLOAD_SIZE=10485760      # 10MB
MAX_BATCH_OPERATION_SIZE=100
```

### Security Hardening

#### SSL/TLS Configuration

```bash
# Enable HTTPS in production
# Use reverse proxy (nginx, Apache) or Node.js:
NODE_TLS_REJECT_UNAUTHORIZED=0  # Only for trusted certificates
```

#### Database Security

```bash
# Use strong passwords
# Enable SSL connections
# Use connection pooling
# Regular backups

# Example secure connection string
DATABASE_URL=postgresql://user:StrongPassword123!@prod-db.example.com:5432/erp_db?sslmode=require
```

#### Environment Variable Security

- Store in secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)
- Never commit `.env` files
- Use `.env.example` as template
- Rotate secrets regularly

#### JWT Configuration

```bash
# Secure JWT settings
JWT_SECRET=<very-strong-32-char-min>
JWT_EXPIRES_IN=24h              # Shorter expiration in production
REFRESH_TOKEN_EXPIRES_IN=7d
```

### Monitoring Configuration

```bash
# Enable request logging
LOG_REQUESTS=1

# Set appropriate log level
LOG_LEVEL=info

# Configure error tracking
# See docs/ERROR_TRACKING_SETUP.md
```

---

## Development Setup

### Initial Setup

#### 1. Create `.env.development.local`

```bash
cp .env.example .env.development.local
```

#### 2. Configure for Development

```bash
# Server
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Database (SQLite for easy setup)
DB_DRIVER=sqlite
SQLITE_FILE=data/dev.sqlite3

# AI Provider (Ollama recommended for development)
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b

# Logging
LOG_LEVEL=debug
LOG_REQUESTS=1

# Security (temporary for development)
JWT_SECRET=DevelopmentSecretKey32CharactersMinimum!@#
```

#### 3. Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, start Ollama if using it
ollama serve
```

#### 4. Verify Setup

```bash
# Check server is running
curl http://localhost:3000/health

# Run tests
npm run test

# Run linting
npm run lint
```

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Run all tests
npm run test

# Run specific test file
npm run test -- env.test.ts

# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check TypeScript
npm run type-check

# Generate API documentation
npm run docs
```

### Database Development

#### Using SQLite

```bash
# View database
sqlite3 data/dev.sqlite3

# Run query
sqlite3 data/dev.sqlite3 "SELECT * FROM users LIMIT 5;"

# Reset database
rm data/dev.sqlite3*
npm run dev  # Migrations run automatically
```

#### Using PostgreSQL

```bash
# Start PostgreSQL locally
# macOS with Homebrew
brew services start postgresql

# Linux
sudo service postgresql start

# Create development database
createdb erp_dev

# Set environment
DATABASE_URL=postgresql://localhost:5432/erp_dev
```

---

## Validation and Error Handling

### Validation Process

The configuration module validates at three levels:

#### 1. Schema Validation

```typescript
// Each variable validated against Zod schema
const envSchema = z.object({
  PORT: z
    .string()
    .default("3000")
    .transform((v) => parseInt(v, 10)),
  JWT_SECRET: z.string().min(32),
  // ... more variables
});

const result = envSchema.parse(process.env);
```

#### 2. Provider Validation

```typescript
// AI Provider config validated based on selected provider
if (AI_PROVIDER === "openai") {
  // Verify OPENAI_API_KEY exists and is valid format
  // Verify OPENAI_MODEL is supported
}
```

#### 3. Production Validation

```typescript
// Additional checks for production environment
if (NODE_ENV === "production") {
  // JWT_SECRET strength verification
  // Database SSL requirement
  // CORS specific origin requirement
}
```

### Common Validation Errors

#### JWT Secret Too Short

```
Error: JWT_SECRET must be at least 32 characters
Config environment validation failed
```

**Solution:**

```bash
# Generate secure secret
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET" >> .env.development.local
```

#### Missing AI Provider Key

```
Error: OPENAI_API_KEY required when AI_PROVIDER=openai
```

**Solution:**

```bash
# Get API key from provider and set
OPENAI_API_KEY=sk-proj-your-key-here
```

#### Database Connection Failed

```
Error: Failed to connect to PostgreSQL
DATABASE_URL=postgresql://localhost/db not accessible
```

**Solution:**

```bash
# Verify database is running
# Verify connection string is correct
# Check username and password
psql postgresql://user:pass@localhost/db -c "SELECT 1;"
```

#### Ollama Not Running

```
Error: ECONNREFUSED - Cannot connect to Ollama at http://localhost:11434
```

**Solution:**

```bash
# In separate terminal
ollama serve

# Or in background
ollama serve &
```

---

## Common Issues

### Issue: "Cannot find module 'config/env'"

**Cause:** TypeScript import path not resolved

**Solution:**

```bash
# Ensure imports use correct path
import { getEnv } from '../config/env.js';  // ✅ Correct
import { getEnv } from './config/env.js';   // ❌ Wrong

# Verify tsconfig.json paths
npm run type-check
```

### Issue: "JWT_SECRET validation failed"

**Cause:** Secret doesn't meet strength requirements

**Solution:**

```typescript
// JWT_SECRET must have:
// ✅ Minimum 32 characters
// ✅ At least one uppercase letter
// ✅ At least one lowercase letter
// ✅ At least one number
// ✅ At least one special character

// Generate valid secret:
const secret = require("crypto").randomBytes(32).toString("base64");
```

### Issue: "AI Provider configuration invalid"

**Cause:** Provider settings mismatch or missing keys

**Solution:**

```bash
# 1. Verify AI_PROVIDER value
# 2. Check provider-specific variables are set
# 3. Validate API key format

# For OpenAI:
OPENAI_API_KEY=sk-proj-xxx...  # Must start with sk-proj-

# For Anthropic:
ANTHROPIC_API_KEY=sk-ant-xxx...  # Must start with sk-ant-

# For Azure:
AZURE_OPENAI_ENDPOINT=https://...  # Must include https://
```

### Issue: "CORS errors when accessing from frontend"

**Cause:** CORS_ORIGIN doesn't match frontend URL

**Solution:**

```bash
# Development
CORS_ORIGIN=http://localhost:5173

# Production
CORS_ORIGIN=https://your-domain.com

# Multiple origins (requires code change)
# See apps/backend/src/server.ts
```

### Issue: "Database migrations not running"

**Cause:** SQLite file permissions or path issue

**Solution:**

```bash
# Verify data directory exists
mkdir -p data

# Reset SQLite database
rm -f data/dev.sqlite3*

# Restart server (migrations run automatically)
npm run dev
```

---

## Best Practices

### Environment Variables

✅ **DO:**

- Use `.env.local` for development
- Use secrets manager for production
- Document all variables in `.env.example`
- Validate on startup
- Rotate secrets regularly
- Use strong JWT secrets

❌ **DON'T:**

- Commit `.env` files
- Store secrets in code
- Use same secret in dev and production
- Use weak JWT secrets (less than 32 chars)
- Log sensitive variables

### RBAC Configuration

✅ **DO:**

- Start with least privilege principle
- Use system roles (don't modify)
- Create custom roles for specific needs
- Document permission requirements
- Review role assignments regularly
- Test permissions before deployment

❌ **DON'T:**

- Use SUPER_ADMIN for regular users
- Grant unnecessary permissions
- Hardcode roles in application logic
- Mix authentication and authorization
- Trust client-side role enforcement

### AI Provider Management

✅ **DO:**

- Test provider connection on startup
- Implement fallback strategy
- Monitor API usage and costs
- Use appropriate models for tasks
- Implement rate limiting
- Handle API errors gracefully

❌ **DON'T:**

- Expose API keys in logs
- Use production keys in development
- Ignore rate limits
- Assume provider is always available
- Store API keys in version control

### Logging Configuration

✅ **DO:**

- Set appropriate log level per environment
- Use structured logging
- Include context in log messages
- Monitor logs for errors
- Implement log rotation
- Use consistent log format

❌ **DON'T:**

- Log sensitive data (passwords, tokens)
- Use console.log in production code
- Ignore error logs
- Over-log in tight loops
- Mix logging levels

### Security

✅ **DO:**

- Use HTTPS in production
- Validate all input data
- Use prepared statements
- Implement rate limiting
- Enable CORS only for trusted origins
- Keep dependencies updated
- Regular security audits

❌ **DON'T:**

- Disable CORS in production
- Use weak database passwords
- Trust client-side validation
- Store passwords in plain text
- Expose error details to clients
- Ignore security warnings

---

## Testing

### Run All Tests

```bash
npm run test
```

### Run Configuration Tests

```bash
npm run test -- env.test.ts
```

### Test Coverage

```bash
npm run test -- --coverage
```

### Test Groups

The test suite includes:

- **Environment Validation** (15 tests)
- **AI Provider Validation** (8 tests)
- **Database Configuration** (4 tests)
- **JWT Secret Validation** (5 tests)
- **CORS Configuration** (4 tests)
- **Production Settings** (3 tests)

---

## API Reference

### Configuration Export

```typescript
import { getEnv } from "@/config/env";

// Get validated configuration object
const config = getEnv();

// Access configuration
config.PORT; // 3000
config.NODE_ENV; // 'development'
config.AI_PROVIDER; // 'openai'
config.OPENAI_API_KEY; // 'sk-proj-...'
```

### Role-Based Access

```typescript
import { DEFAULT_ROLES, ROLE_HIERARCHY } from "@/config/rbac";

// Check user role
const userRole = DEFAULT_ROLES.find((r) => r.id === user.role_id);

// Check privilege level
const hasAccess =
  ROLE_HIERARCHY.find((r) => r.role === user.role)!.level <=
  ROLE_HIERARCHY.find((r) => r.role === "admin")!.level;

// Get permissions
const permissions = userRole?.permissions || [];
```

---

## Related Documentation

- [Environment Variables](./ENVIRONMENT_VARIABLES.md)
- [RBAC Configuration](./RBAC_CONFIGURATION.md)
- [Authentication Guide](./AUTHENTICATION.md)
- [Error Handling](./ERROR_HANDLING.md)
- [Security Guidelines](./SECURITY.md)

---

## Support

For issues or questions:

1. Check [Common Issues](#common-issues) section
2. Review [Best Practices](#best-practices)
3. Check error logs with `LOG_LEVEL=debug`
4. Review test files in `env.test.ts`
5. Consult [ARCHITECTURE.md](./ARCHITECTURE.md)

---

**Last Updated:** 2025-12-20  
**Module Status:** ✅ Production Ready  
**Test Coverage:** 28 comprehensive tests  
**Version:** 1.0.0
