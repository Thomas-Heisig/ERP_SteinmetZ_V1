# AI Provider Health Checks

## Overview

The AI Provider Health Check system monitors the availability and performance of all configured AI providers (OpenAI, Ollama, Anthropic, etc.) and implements automatic fallback mechanisms.

## Endpoints

### Check All Providers

```http
GET /api/ai/health
```

Returns health status for all configured AI providers.

**Response:**

```json
{
  "success": true,
  "data": {
    "overall": "healthy",
    "providers": [
      {
        "provider": "openai",
        "status": "healthy",
        "latency": 234,
        "timestamp": "2024-12-04T10:00:00.000Z"
      },
      {
        "provider": "ollama",
        "status": "unavailable",
        "error": "Connection refused",
        "timestamp": "2024-12-04T10:00:00.000Z"
      }
    ],
    "timestamp": "2024-12-04T10:00:00.000Z"
  }
}
```

### Check Individual Providers

```http
GET /api/ai/health/openai
GET /api/ai/health/ollama
GET /api/ai/health/anthropic
GET /api/ai/health/fallback
```

Returns health status for a specific provider.

**Response:**

```json
{
  "success": true,
  "data": {
    "provider": "openai",
    "status": "healthy",
    "latency": 234,
    "timestamp": "2024-12-04T10:00:00.000Z"
  }
}
```

### Get Available Providers

```http
GET /api/ai/health/available
```

Returns a list of currently healthy providers.

**Response:**

```json
{
  "success": true,
  "data": {
    "providers": ["openai", "anthropic", "fallback"],
    "count": 3
  }
}
```

### Get Best Available Provider

```http
GET /api/ai/health/best
```

Returns the best available provider based on priority and health status.

Priority order: OpenAI > Anthropic > Ollama > Fallback

**Response:**

```json
{
  "success": true,
  "data": {
    "provider": "openai"
  }
}
```

## Health Status Values

- **healthy**: Provider is fully operational
- **degraded**: Provider is reachable but experiencing issues (e.g., rate limits)
- **unavailable**: Provider cannot be reached or is not configured

## Overall System Status

The overall system status is determined by the number of healthy providers:

- **healthy**: 2 or more providers are healthy
- **degraded**: At least 1 provider is healthy or degraded
- **unavailable**: No providers are healthy (fallback is always available)

## Configuration

AI providers are configured via environment variables:

### OpenAI

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

### Ollama

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral:latest
```

### Anthropic

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

## Fallback Mechanism

The system automatically falls back to available providers when the primary provider fails:

1. **Provider Selection**: Uses `getBestAvailableProvider()` to select optimal provider
2. **Priority Order**: OpenAI → Anthropic → Ollama → Fallback
3. **Automatic Retry**: Retries with next available provider on failure
4. **Local Fallback**: Always available as last resort

## Health Check Behavior

### OpenAI Health Checks

- Checks connectivity by listing available models
- Timeout: 10 seconds
- Error states: API key missing, network errors, API errors

### Ollama Health Checks

- Checks local Ollama installation via `/api/tags` endpoint
- Default URL: `http://localhost:11434`
- Timeout: 5 seconds
- Returns model count in details

### Anthropic Health Checks

- Makes minimal API request to verify connectivity
- Handles rate limits gracefully (marked as degraded)
- Timeout: 10 seconds

### Fallback Health Checks

- Always returns healthy status
- No external dependencies
- Provides basic responses when other providers fail

## Monitoring

Health checks can be integrated into monitoring systems:

```bash
# Check system health
curl http://localhost:3000/api/ai/health

# Alert if overall status is unavailable
STATUS=$(curl -s http://localhost:3000/api/ai/health | jq -r '.data.overall')
if [ "$STATUS" = "unavailable" ]; then
  echo "Alert: All AI providers unavailable!"
fi
```

## Performance Considerations

- Health checks are executed on-demand (not cached)
- Each check has appropriate timeouts
- Failed providers don't block healthy ones
- Checks run in parallel for better performance

## Error Handling

All health check errors are:

- Logged with appropriate severity (warn/error)
- Returned in the response with error details
- Non-blocking (system continues with available providers)

## Testing

Run health check tests:

```bash
npm run test -- aiProviderHealthService.test.ts
```

The test suite covers:

- Individual provider checks
- Overall system health
- Fallback mechanisms
- Provider priority selection
- Response structure validation
