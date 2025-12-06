# Error Handling Documentation

**Stand**: Dezember 2025  
**Version**: 0.3.0

Dieses Dokument beschreibt das standardisierte Error-Handling-System des ERP SteinmetZ Projekts.

---

## 📋 Überblick

Das ERP SteinmetZ System verwendet ein einheitliches, standardisiertes Error-Handling-System über alle API-Endpunkte hinweg. Dies gewährleistet konsistente Fehlerbehandlung und verbessert die Integration mit Frontend-Anwendungen.

## 🎯 Ziele

1. **Konsistenz**: Alle API-Endpunkte geben Fehler im gleichen Format zurück
2. **Typsicherheit**: TypeScript-Typen für alle Error-Klassen
3. **Validierung**: Automatische Eingabevalidierung mit detaillierten Fehlermeldungen
4. **Debugging**: Umfassende Fehlerinformationen für Entwickler
5. **Security**: Keine sensitiven Informationen in Production-Error-Messages

---

## 📦 Komponenten

### 1. Error-Klassen

Alle Error-Klassen befinden sich in `apps/backend/src/types/errors.ts`.

#### Base APIError Class

```typescript
export class APIError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    details?: any,
    isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}
```

#### Verfügbare Error-Klassen

| Klasse | Status Code | Error Code | Verwendung |
|--------|-------------|------------|------------|
| `BadRequestError` | 400 | `BAD_REQUEST` | Ungültige Anfrageparameter |
| `UnauthorizedError` | 401 | `UNAUTHORIZED` | Fehlende/ungültige Authentifizierung |
| `ForbiddenError` | 403 | `FORBIDDEN` | Keine Berechtigung |
| `NotFoundError` | 404 | `NOT_FOUND` | Ressource nicht gefunden |
| `ConflictError` | 409 | `CONFLICT` | Ressourcenkonflikt |
| `ValidationError` | 422 | `VALIDATION_ERROR` | Validierungsfehler |
| `RateLimitError` | 429 | `RATE_LIMIT_EXCEEDED` | Rate Limit überschritten |
| `InternalServerError` | 500 | `INTERNAL_SERVER_ERROR` | Interner Serverfehler |
| `ServiceUnavailableError` | 503 | `SERVICE_UNAVAILABLE` | Service nicht verfügbar |
| `DatabaseError` | 500 | `DATABASE_ERROR` | Datenbankfehler |
| `AIProviderError` | 502 | `AI_PROVIDER_ERROR` | KI-Provider-Fehler |
| `ExternalAPIError` | 502 | `EXTERNAL_API_ERROR` | Externer API-Fehler |

### 2. Error Response Format

Alle Error-Responses folgen diesem standardisierten Format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "timestamp": "2024-12-06T15:30:00Z",
    "path": "/api/endpoint"
  }
}
```

**Felder:**

- `success`: Immer `false` bei Fehlern
- `error.code`: Maschinenlesbarer Error-Code (siehe ErrorCode enum)
- `error.message`: Menschenlesbare Fehlermeldung
- `error.details`: Zusätzliche Details (z.B. Validierungsfehler, Stack-Trace im Dev-Mode)
- `error.timestamp`: ISO 8601 Zeitstempel
- `error.path`: API-Pfad der fehlgeschlagenen Anfrage

### 3. AsyncHandler Middleware

Wrapper für async Route-Handler zur automatischen Fehlerbehandlung:

```typescript
// apps/backend/src/middleware/asyncHandler.ts
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

**Verwendung:**

```typescript
router.get('/employees', asyncHandler(async (req, res) => {
  // Fehler werden automatisch gefangen und an Error-Middleware weitergeleitet
  const employees = await getEmployees();
  res.json({ success: true, data: employees });
}));
```

### 4. Validation Middleware

Zod-basierte Validierung für Request-Parameter:

```typescript
import { z } from 'zod';
import { ValidationError } from '../types/errors.js';

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Validation failed', {
          issues: error.errors
        });
      }
      next(error);
    }
  };
}
```

**Verwendung:**

```typescript
const createEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  department: z.string().min(1),
  position: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

router.post(
  '/employees',
  validate(createEmployeeSchema),
  asyncHandler(async (req, res) => {
    // req.body ist garantiert valide
    const employee = await createEmployee(req.body);
    res.json({ success: true, data: employee });
  })
);
```

### 5. Error Handler Middleware

Zentrale Error-Handler-Middleware in `apps/backend/src/middleware/errorHandler.ts`:

```typescript
export function errorHandler(
  err: Error | APIError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle APIError
  if (err instanceof APIError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
}
```

---

## 🚀 Verwendung

### Beispiel 1: Einfacher Route-Handler

```typescript
import { asyncHandler } from '../middleware/asyncHandler.js';
import { NotFoundError } from '../types/errors.js';

router.get('/employees/:id', asyncHandler(async (req, res) => {
  const employee = await findEmployeeById(req.params.id);
  
  if (!employee) {
    throw new NotFoundError('Employee not found', { id: req.params.id });
  }
  
  res.json({ success: true, data: employee });
}));
```

### Beispiel 2: Mit Validierung

```typescript
import { z } from 'zod';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { BadRequestError } from '../types/errors.js';

const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  department: z.string().min(1).optional(),
});

router.put(
  '/employees/:id',
  validate(updateEmployeeSchema),
  asyncHandler(async (req, res) => {
    const employee = await updateEmployee(req.params.id, req.body);
    
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }
    
    res.json({ 
      success: true, 
      data: employee,
      message: 'Employee updated successfully'
    });
  })
);
```

### Beispiel 3: Error mit Details

```typescript
import { ValidationError } from '../types/errors.js';

router.post('/employees', asyncHandler(async (req, res) => {
  // Custom validation logic
  const existingEmployee = await findEmployeeByEmail(req.body.email);
  
  if (existingEmployee) {
    throw new ValidationError('Email already in use', {
      field: 'email',
      value: req.body.email,
      suggestion: 'Please use a different email address'
    });
  }
  
  const employee = await createEmployee(req.body);
  res.json({ success: true, data: employee });
}));
```

---

## 📊 Status

### Vollständig Implementiert

- ✅ **Error-Klassen**: Alle Standard-Error-Klassen verfügbar
- ✅ **AsyncHandler**: Middleware für async Route-Handler
- ✅ **Error-Handler-Middleware**: Zentrale Fehlerbehandlung
- ✅ **Validation-Middleware**: Zod-basierte Validierung
- ✅ **HR-Modul**: 14/14 Endpoints standardisiert
- ✅ **Finance-Modul**: 19/19 Endpoints standardisiert
- ✅ **QuickChat-Modul**: 3/3 Endpoints standardisiert

### Optional (Niedrige Priorität)

- 🟡 **AI-Router**: Kann bei Bedarf migriert werden
- 🟡 **Dashboard-Router**: Kann bei Bedarf migriert werden
- 🟡 **Diagnostics-Router**: Kann bei Bedarf migriert werden
- 🟡 **System-Info-Router**: Kann bei Bedarf migriert werden
- 🟡 **AI-Annotator-Router**: Kann bei Bedarf migriert werden

---

## 🔧 Migration Guide

### Schritt 1: Import Error-Klassen

```typescript
import { 
  BadRequestError, 
  NotFoundError, 
  ValidationError 
} from '../types/errors.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
```

### Schritt 2: Wrap Route-Handler

```typescript
// Vorher
router.get('/endpoint', async (req, res) => {
  try {
    const data = await getData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Nachher
router.get('/endpoint', asyncHandler(async (req, res) => {
  const data = await getData();
  res.json({ success: true, data });
}));
```

### Schritt 3: Throw Specific Errors

```typescript
// Vorher
if (!resource) {
  return res.status(404).json({ error: 'Not found' });
}

// Nachher
if (!resource) {
  throw new NotFoundError('Resource not found', { id: req.params.id });
}
```

### Schritt 4: Add Validation

```typescript
import { z } from 'zod';
import { validate } from '../middleware/validation.js';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

router.post(
  '/endpoint',
  validate(schema),
  asyncHandler(async (req, res) => {
    // req.body ist garantiert valide
    const result = await createResource(req.body);
    res.json({ success: true, data: result });
  })
);
```

---

## 🧪 Testing

Beispiel für Error-Handler-Tests:

```typescript
import { describe, it, expect } from 'vitest';
import { NotFoundError, ValidationError } from '../types/errors.js';

describe('Error Classes', () => {
  it('should create NotFoundError with correct properties', () => {
    const error = new NotFoundError('Resource not found', { id: '123' });
    
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Resource not found');
    expect(error.details).toEqual({ id: '123' });
    expect(error.isOperational).toBe(true);
  });

  it('should serialize error to JSON', () => {
    const error = new ValidationError('Invalid input');
    const json = error.toJSON();
    
    expect(json.code).toBe('VALIDATION_ERROR');
    expect(json.message).toBe('Invalid input');
    expect(json.statusCode).toBe(422);
    expect(json.timestamp).toBeDefined();
  });
});
```

---

## 📚 Best Practices

1. **Verwende spezifische Error-Klassen**: `NotFoundError` statt `APIError`
2. **Füge Details hinzu**: Hilft beim Debugging
3. **Keine sensitiven Daten**: In Error-Messages oder Details
4. **Konsistente Messages**: Verwende klare, einheitliche Fehlermeldungen
5. **Validierung zuerst**: Validiere Eingaben vor Business-Logik
6. **AsyncHandler nutzen**: Für alle async Route-Handler
7. **Log Errors**: Error-Handler-Middleware loggt automatisch

---

## 🔗 Siehe auch

- [API Documentation](../docs/api/README.md)
- [HR Module Documentation](../apps/backend/src/routes/hr/docs/README.md)
- [Finance Module Documentation](../apps/backend/src/routes/finance/docs/README.md)
- [Error Standardization Guide](./ERROR_STANDARDIZATION_GUIDE.md)

---

**Letzte Aktualisierung**: 6. Dezember 2025  
**Maintainer**: Thomas Heisig
