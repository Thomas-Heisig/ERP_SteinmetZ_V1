# QuickChat Router

**Version:** 0.2.0  
**Last Updated:** December 2025

## Overview

The QuickChat Router provides a fast, command-based interface for users to interact with the ERP system using natural language and slash commands. It enables quick actions like creating invoices, generating reports, or parking ideas without navigating through the full UI.

## Features

- **Natural Language Processing**: Understands user messages and extracts intent
- **Slash Commands**: Quick actions via `/command` syntax
- **Session Management**: Maintains conversation context across messages
- **Command Registry**: Extensible command system
- **Standardized Error Handling**: Uses APIError classes and Zod validation

## API Endpoints

### POST `/api/quickchat`

Processes a chat message or command.

**Request Body:**

```typescript
{
  sessionId?: string;      // UUID for session continuity (optional)
  message: string;         // User message (1-5000 chars)
  context?: Record<string, unknown>; // Additional context (optional)
}
```

**Response:**

```typescript
{
  success: true;
  data: {
    sessionId: string;     // Session UUID
    response: string;      // AI/System response
    suggestions?: string[]; // Optional follow-up suggestions
  }
}
```

**Error Response:**

```typescript
{
  success: false;
  error: {
    code: "VALIDATION_ERROR" | "BAD_REQUEST" | "INTERNAL_ERROR";
    message: string;
    details?: any;
    timestamp: string;
    path: string;
  }
}
```

### POST `/api/quickchat/command`

Executes a specific command directly.

**Request Body:**

```typescript
{
  command: string;         // Command name (e.g., "/rechnung")
  args?: string;           // Command arguments (optional)
  context?: Record<string, unknown>; // Additional context (optional)
}
```

### GET `/api/quickchat/commands`

Lists all available commands.

**Response:**

```typescript
{
  success: true;
  data: {
    commands: {
      [key: string]: {
        name: string;
        description: string;
        handler: string;
      }
    }
  }
}
```

## Available Commands

| Command     | Description          | Handler          |
| ----------- | -------------------- | ---------------- |
| `/rechnung` | Create a new invoice | `createInvoice`  |
| `/angebot`  | Create a new quote   | `createQuote`    |
| `/bericht`  | Generate a report    | `generateReport` |
| `/idee`     | Park a new idea      | `parkIdea`       |

## Validation

All endpoints use **Zod schemas** for input validation:

- **messageSchema**: Validates chat messages
  - `sessionId`: Optional UUID
  - `message`: 1-5000 characters
  - `context`: Optional key-value pairs

- **commandSchema**: Validates command requests
  - `command`: Required, min 1 character
  - `args`: Optional string
  - `context`: Optional key-value pairs

## Error Handling

Uses standardized APIError classes:

- `ValidationError`: Invalid input data
- `BadRequestError`: Malformed requests
- `NotFoundError`: Command not found

All errors follow the standard error response format (see ERROR_HANDLING.md).

## Logging

Uses **Pino** for structured logging:

```typescript
logger.info({ sessionId, command }, "Command executed");
logger.warn({ sessionId, error }, "Command failed");
logger.error({ err, context }, "QuickChat error");
```

## Usage Examples

### Send a Chat Message

```bash
curl -X POST http://localhost:3000/api/quickchat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create an invoice for customer ABC",
    "sessionId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

### Execute a Command

```bash
curl -X POST http://localhost:3000/api/quickchat/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "/rechnung",
    "args": "customer: ABC, amount: 1000"
  }'
```

### List Available Commands

```bash
curl http://localhost:3000/api/quickchat/commands
```

## Dependencies

- **express**: Web framework
- **zod**: Schema validation
- **pino**: Structured logging
- **uuid**: Session ID generation (implied)

## Related Documentation

- [ERROR_HANDLING.md](../../../../docs/ERROR_HANDLING.md) - Error handling patterns
- [API_DOCUMENTATION.md](../../../../docs/api/API_DOCUMENTATION.md) - Complete API reference

## Future Enhancements

- [ ] AI-powered intent recognition
- [ ] Multi-language support
- [ ] Command aliases
- [ ] Command history and recall
- [ ] Rich response formatting (markdown, tables)
- [ ] File attachments in chat

## Maintainer

Thomas Heisig

**Last Review:** December 2025
