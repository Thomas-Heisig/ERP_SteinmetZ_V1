# Error Codes Reference

**Version:** 1.0.0  
**Last Updated:** December 6, 2025  
**Status:** Complete

This document provides a comprehensive reference of all error codes used in ERP SteinmetZ.

## 📋 Overview

ERP SteinmetZ uses standardized HTTP status codes and custom error codes for consistent error handling across all modules.

See also: [Error Standardization Guide](../ERROR_STANDARDIZATION_GUIDE.md) for implementation details.

---

## 🔢 HTTP Status Codes

### Success Codes (2xx)

| Code | Name       | Description                   | Usage                          |
| ---- | ---------- | ----------------------------- | ------------------------------ |
| 200  | OK         | Request successful            | GET, PUT successful operations |
| 201  | Created    | Resource created              | POST successful creation       |
| 204  | No Content | Success with no response body | DELETE successful              |

### Client Error Codes (4xx)

| Code | Name                 | Error Class         | Description                          |
| ---- | -------------------- | ------------------- | ------------------------------------ |
| 400  | Bad Request          | `BadRequestError`   | Invalid request format or parameters |
| 401  | Unauthorized         | `UnauthorizedError` | Authentication required or failed    |
| 403  | Forbidden            | `ForbiddenError`    | Insufficient permissions             |
| 404  | Not Found            | `NotFoundError`     | Resource doesn't exist               |
| 409  | Conflict             | `ConflictError`     | Resource conflict (duplicate, etc.)  |
| 422  | Unprocessable Entity | `ValidationError`   | Validation failed                    |
| 429  | Too Many Requests    | `RateLimitError`    | Rate limit exceeded                  |

### Server Error Codes (5xx)

| Code | Name                  | Error Class               | Description                     |
| ---- | --------------------- | ------------------------- | ------------------------------- |
| 500  | Internal Server Error | `InternalServerError`     | Unexpected server error         |
| 501  | Not Implemented       | `NotImplementedError`     | Feature not implemented         |
| 503  | Service Unavailable   | `ServiceUnavailableError` | Service temporarily unavailable |

---

## 📦 Error Response Format

All errors follow this standard format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    },
    "timestamp": "2025-12-06T12:00:00.000Z",
    "path": "/api/endpoint"
  }
}
```

---

## 🔍 Custom Error Codes by Module

### Authentication Errors (AUTH\_\*)

| Code                            | HTTP Status | Description                     | Solution                     |
| ------------------------------- | ----------- | ------------------------------- | ---------------------------- |
| `AUTH_INVALID_CREDENTIALS`      | 401         | Invalid username/password       | Check credentials            |
| `AUTH_TOKEN_EXPIRED`            | 401         | JWT token expired               | Refresh token or re-login    |
| `AUTH_TOKEN_INVALID`            | 401         | JWT token malformed or invalid  | Provide valid token          |
| `AUTH_TOKEN_MISSING`            | 401         | No authorization header         | Include Authorization header |
| `AUTH_INSUFFICIENT_PERMISSIONS` | 403         | User lacks required permissions | Contact administrator        |
| `AUTH_ACCOUNT_LOCKED`           | 403         | Account temporarily locked      | Wait or contact support      |
| `AUTH_ACCOUNT_DISABLED`         | 403         | Account permanently disabled    | Contact administrator        |

**Example:**

```json
{
  "success": false,
  "error": {
    "code": "AUTH_TOKEN_EXPIRED",
    "message": "Your session has expired. Please log in again.",
    "timestamp": "2025-12-06T12:00:00.000Z",
    "path": "/api/hr/employees"
  }
}
```

### Validation Errors (VALIDATION\_\*)

| Code                              | HTTP Status | Description                | Solution                  |
| --------------------------------- | ----------- | -------------------------- | ------------------------- |
| `VALIDATION_REQUIRED_FIELD`       | 422         | Required field missing     | Provide required field    |
| `VALIDATION_INVALID_FORMAT`       | 422         | Invalid field format       | Check format requirements |
| `VALIDATION_INVALID_TYPE`         | 422         | Wrong data type            | Use correct data type     |
| `VALIDATION_OUT_OF_RANGE`         | 422         | Value out of allowed range | Use value within range    |
| `VALIDATION_INVALID_EMAIL`        | 422         | Invalid email format       | Provide valid email       |
| `VALIDATION_INVALID_DATE`         | 422         | Invalid date format        | Use ISO 8601 format       |
| `VALIDATION_CONSTRAINT_VIOLATION` | 422         | Business rule violated     | Check business rules      |

**Example:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_REQUIRED_FIELD",
    "message": "Validation failed",
    "details": {
      "field": "email",
      "message": "Email is required"
    },
    "timestamp": "2025-12-06T12:00:00.000Z",
    "path": "/api/hr/employees"
  }
}
```

### Resource Errors (RESOURCE\_\*)

| Code                      | HTTP Status | Description                     | Solution                   |
| ------------------------- | ----------- | ------------------------------- | -------------------------- |
| `RESOURCE_NOT_FOUND`      | 404         | Resource doesn't exist          | Check resource ID          |
| `RESOURCE_ALREADY_EXISTS` | 409         | Duplicate resource              | Use different identifier   |
| `RESOURCE_LOCKED`         | 409         | Resource locked by another user | Wait or contact other user |
| `RESOURCE_DELETED`        | 410         | Resource permanently deleted    | Cannot be recovered        |

**Example:**

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Employee with id '12345' not found",
    "details": {
      "resource": "Employee",
      "id": "12345"
    },
    "timestamp": "2025-12-06T12:00:00.000Z",
    "path": "/api/hr/employees/12345"
  }
}
```

### Database Errors (DB\_\*)

| Code                      | HTTP Status | Description                  | Solution              |
| ------------------------- | ----------- | ---------------------------- | --------------------- |
| `DB_CONNECTION_FAILED`    | 503         | Cannot connect to database   | Check database status |
| `DB_QUERY_FAILED`         | 500         | Database query failed        | Contact support       |
| `DB_CONSTRAINT_VIOLATION` | 409         | Database constraint violated | Check data integrity  |
| `DB_TRANSACTION_FAILED`   | 500         | Transaction rolled back      | Retry operation       |

### AI Provider Errors (AI\_\*)

| Code                      | HTTP Status | Description                  | Solution             |
| ------------------------- | ----------- | ---------------------------- | -------------------- |
| `AI_PROVIDER_UNAVAILABLE` | 503         | AI provider not responding   | Try again later      |
| `AI_RATE_LIMIT_EXCEEDED`  | 429         | AI API rate limit hit        | Wait before retrying |
| `AI_INVALID_RESPONSE`     | 500         | AI returned invalid response | Contact support      |
| `AI_CONTEXT_TOO_LARGE`    | 413         | Input exceeds token limit    | Reduce input size    |
| `AI_MODEL_NOT_FOUND`      | 404         | Requested model unavailable  | Use different model  |

### HR Module Errors (HR\_\*)

| Code                            | HTTP Status | Description              | Solution               |
| ------------------------------- | ----------- | ------------------------ | ---------------------- |
| `HR_EMPLOYEE_NOT_FOUND`         | 404         | Employee doesn't exist   | Check employee ID      |
| `HR_INVALID_DEPARTMENT`         | 422         | Department doesn't exist | Use valid department   |
| `HR_INVALID_TIMESHEET`          | 422         | Invalid timesheet entry  | Check time entry data  |
| `HR_LEAVE_CONFLICT`             | 409         | Leave dates conflict     | Choose different dates |
| `HR_INSUFFICIENT_LEAVE_BALANCE` | 422         | Not enough leave days    | Check leave balance    |

### Finance Module Errors (FIN\_\*)

| Code                    | HTTP Status | Description               | Solution             |
| ----------------------- | ----------- | ------------------------- | -------------------- |
| `FIN_INVOICE_NOT_FOUND` | 404         | Invoice doesn't exist     | Check invoice ID     |
| `FIN_INVALID_AMOUNT`    | 422         | Invalid monetary amount   | Use valid amount     |
| `FIN_PAYMENT_FAILED`    | 500         | Payment processing failed | Contact finance team |
| `FIN_ACCOUNT_NOT_FOUND` | 404         | Account doesn't exist     | Check account number |
| `FIN_DUPLICATE_INVOICE` | 409         | Invoice already exists    | Check invoice number |

---

## 🛠️ Usage in Code

### Throwing Errors

```typescript
import {
  NotFoundError,
  ValidationError,
  BadRequestError,
} from "../utils/apiErrors";

// Not found
throw new NotFoundError("Employee with id 12345 not found");

// Validation error with details
throw new ValidationError("Invalid input", {
  field: "email",
  message: "Email format is invalid",
});

// Bad request
throw new BadRequestError("Missing required parameter: department");
```

### Catching Errors

```typescript
import { asyncHandler } from "../middleware/asyncHandler";

router.get(
  "/employees/:id",
  asyncHandler(async (req, res) => {
    const employee = await employeeService.getById(req.params.id);

    if (!employee) {
      throw new NotFoundError(`Employee with id ${req.params.id} not found`);
    }

    res.json({
      success: true,
      data: employee,
    });
  }),
);
```

### Error Middleware

The global error handler automatically converts error classes to proper HTTP responses:

```typescript
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || "INTERNAL_SERVER_ERROR";

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message,
      details: err.details || {},
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
});
```

---

## 📊 Error Statistics

Track these metrics for monitoring:

- **Error rate by endpoint** - Identify problematic endpoints
- **Error distribution by type** - Most common error categories
- **Error resolution time** - How quickly errors are resolved
- **Recurring errors** - Patterns indicating systemic issues

---

## 🔗 Related Documentation

- [Error Standardization Guide](../ERROR_STANDARDIZATION_GUIDE.md) - Implementation guide
- [API Documentation](../api/API_DOCUMENTATION.md) - API endpoints
- [Code Conventions](../CODE_CONVENTIONS.md) - Coding standards
- [Testing Guidelines](../how-to/writing-tests.md) - Testing errors

---

## 📧 Support

**Encountered an undocumented error?**

- Check the module-specific documentation
- Open an [issue](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues)
- See [SUPPORT.md](../../SUPPORT.md)

---

**Document Version:** 1.0.0  
**Last Updated:** December 6, 2025  
**Completeness:** Covers all major modules and error scenarios
