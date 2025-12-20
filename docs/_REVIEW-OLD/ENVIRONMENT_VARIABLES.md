# Environment Variables Documentation

This document describes all environment variables used in the ERP SteinmetZ application.

## Backend Environment Variables

### Server Configuration

| Variable      | Type   | Default                 | Required | Description                                              |
| ------------- | ------ | ----------------------- | -------- | -------------------------------------------------------- |
| `PORT`        | number | `3000`                  | No       | Port number for the backend server                       |
| `NODE_ENV`    | string | `development`           | No       | Environment mode: `development`, `production`, or `test` |
| `CORS_ORIGIN` | string | `http://localhost:5173` | No       | Allowed CORS origin for frontend                         |

### Database Configuration

| Variable       | Type   | Default  | Required        | Description                               |
| -------------- | ------ | -------- | --------------- | ----------------------------------------- |
| `DB_DRIVER`    | string | `sqlite` | No              | Database driver: `sqlite` or `postgresql` |
| `SQLITE_FILE`  | string | -        | Conditional\*   | Path to SQLite database file              |
| `DATABASE_URL` | string | -        | Conditional\*\* | PostgreSQL connection URL                 |

\*Required when `DB_DRIVER=sqlite`
\*\*Required when `DB_DRIVER=postgresql`

### AI Provider Configuration

| Variable                  | Type   | Default                  | Required            | Description                                                               |
| ------------------------- | ------ | ------------------------ | ------------------- | ------------------------------------------------------------------------- |
| `AI_PROVIDER`             | string | `ollama`                 | No                  | AI provider: `openai`, `ollama`, `local`, `anthropic`, `azure`, or `none` |
| `OPENAI_API_KEY`          | string | -                        | Conditional\*\*\*   | OpenAI API key                                                            |
| `OPENAI_MODEL`            | string | -                        | No                  | OpenAI model name                                                         |
| `ANTHROPIC_API_KEY`       | string | -                        | Conditional\*\*\*\* | Anthropic API key                                                         |
| `AZURE_OPENAI_API_KEY`    | string | -                        | Conditional**\***   | Azure OpenAI API key                                                      |
| `AZURE_OPENAI_ENDPOINT`   | string | -                        | Conditional**\***   | Azure OpenAI endpoint URL                                                 |
| `AZURE_OPENAI_DEPLOYMENT` | string | -                        | Conditional**\***   | Azure OpenAI deployment name                                              |
| `OLLAMA_BASE_URL`         | string | `http://localhost:11434` | No                  | Ollama server base URL                                                    |
| `OLLAMA_MODEL`            | string | `qwen2.5:3b`             | No                  | Ollama model name                                                         |
| `LOCAL_MODEL_PATH`        | string | -                        | Conditional**\*\*** | Path to local GGUF model file                                             |
| `LOCAL_MODEL_NAME`        | string | -                        | No                  | Name for local model                                                      |

**\*Required when `AI_PROVIDER=openai`
\*\***Required when `AI_PROVIDER=anthropic`
**\***Required when `AI_PROVIDER=azure`
**\*\***Required when `AI_PROVIDER=local`

### Functions Catalog Configuration

| Variable                | Type    | Default            | Required | Description                               |
| ----------------------- | ------- | ------------------ | -------- | ----------------------------------------- |
| `FUNCTIONS_DIR`         | string  | `./docs/functions` | No       | Directory containing function definitions |
| `FUNCTIONS_AUTOLOAD`    | boolean | `true`             | No       | Automatically load functions on startup   |
| `FUNCTIONS_WATCH`       | boolean | `true`             | No       | Watch for changes in functions directory  |
| `FUNCTIONS_AUTOPERSIST` | boolean | `false`            | No       | Automatically persist function changes    |

### Other Configuration

| Variable              | Type    | Default    | Required | Description                  |
| --------------------- | ------- | ---------- | -------- | ---------------------------- |
| `MODELS_DIR`          | string  | `./models` | No       | Directory for AI model files |
| `FALLBACK_WIKI`       | boolean | `true`     | No       | Enable Wikipedia fallback    |
| `AI_FALLBACK_ENABLED` | boolean | `true`     | No       | Enable AI provider fallback  |

### Security & Limits

| Variable                   | Type   | Default    | Required    | Description                                     |
| -------------------------- | ------ | ---------- | ----------- | ----------------------------------------------- |
| `MAX_FILE_UPLOAD_SIZE`     | number | `10485760` | No          | Maximum file upload size in bytes (10MB)        |
| `MAX_BATCH_OPERATION_SIZE` | number | `100`      | No          | Maximum batch operation size                    |
| `JWT_SECRET`               | string | -          | Recommended | Secret key for JWT token signing (min 32 chars) |
| `JWT_EXPIRES_IN`           | string | `24h`      | No          | JWT token expiration time                       |
| `REFRESH_TOKEN_EXPIRES_IN` | string | `7d`       | No          | Refresh token expiration time                   |

### Logging

| Variable       | Type    | Default | Required | Description                                                      |
| -------------- | ------- | ------- | -------- | ---------------------------------------------------------------- |
| `LOG_LEVEL`    | string  | `info`  | No       | Log level: `trace`, `debug`, `info`, `warn`, `error`, or `fatal` |
| `LOG_REQUESTS` | boolean | `true`  | No       | Log HTTP requests                                                |

## Frontend Environment Variables

| Variable            | Type   | Default                 | Required | Description                 |
| ------------------- | ------ | ----------------------- | -------- | --------------------------- |
| `VITE_BACKEND_URL`  | string | `http://localhost:3000` | Yes      | Backend API URL             |
| `VITE_API_BASE_URL` | string | `http://localhost:3000` | Yes      | Alternative backend API URL |

## Setup Instructions

1. Copy `.env.example` to `.env` in the appropriate directory (backend or frontend)
2. Update the values according to your environment
3. Ensure required variables are set based on your configuration

## Validation

The backend automatically validates environment variables on startup using Zod schemas. If validation fails, the application will not start and will display specific error messages indicating which variables are missing or invalid.

## Examples

### Development Setup (Local Ollama)

```env
NODE_ENV=development
PORT=3000
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
```

### Production Setup (OpenAI)

```env
NODE_ENV=production
PORT=3000
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o-mini
JWT_SECRET=your-secure-secret-key-at-least-32-characters-long
```

### PostgreSQL Database

```env
DB_DRIVER=postgresql
DATABASE_URL=postgresql://user:password@localhost:5432/erp_steinmetz
```
