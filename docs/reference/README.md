# Reference Documentation

**Information-oriented technical specifications**

Reference guides are technical descriptions of the machinery and how to operate it. They are information-oriented and provide detailed, accurate information.

## Available References

### API Reference

#### Complete API Documentation
**Path:** [API_DOCUMENTATION.md](../api/API_DOCUMENTATION.md)  
**Format:** Comprehensive REST API reference

Complete API documentation including:
- All endpoints
- Request/response formats
- Authentication
- Error handling
- Code examples

#### Modules Index
**Path:** [modules-index.md](./modules-index.md)  
**Format:** Module catalog with links

Comprehensive index of all modules:
- Frontend modules
- Backend API modules
- Core services
- Status overview
- Quick navigation

#### Error Codes Reference
**Path:** [error-codes.md](./error-codes.md)  
**Format:** Complete error code catalog

All error codes and meanings:
- HTTP status codes
- Custom error codes by module
- Error response formats
- Usage examples

---

### Code Reference

#### TypeScript Guidelines
**Status:** Planned  
**Format:** TypeScript best practices reference

TypeScript-specific reference:
- Type definitions
- Interfaces
- Generics
- Utility types
- Common patterns

#### Database Schema
**Status:** Planned  
**Format:** Complete data model reference

Database structure:
- Entity-relationship diagrams
- Table definitions
- Column specifications
- Relationships
- Indexes and constraints

---

### Module-Specific References

#### AI Module Reference
**Status:** Link to existing docs  
**See:** [AI Module Documentation](../../apps/backend/src/routes/ai/docs/README_ALL.md)

Complete AI module reference:
- 13 AI providers
- AI services (chat, audio, translation, vision)
- Tools registry
- Workflow engine
- Type definitions

#### HR Module Reference
**Status:** Link to existing docs  
**See:** [HR Module Documentation](../../apps/backend/src/routes/hr/docs/README.md)

HR module API reference:
- 14 endpoints
- Request/response formats
- Data models
- Validation schemas

#### Finance Module Reference
**Status:** Link to existing docs  
**See:** [Finance Module Documentation](../../apps/backend/src/routes/finance/docs/README.md)

Finance module API reference:
- 19 endpoints
- Request/response formats
- Accounting models
- Report structures

#### Functions Catalog Reference
**Status:** Link to existing docs  
**See:** [Functions Catalog Documentation](../../apps/backend/src/routes/functionsCatalog/docs/README.md)

Functions catalog reference:
- 15,472 function nodes
- 12+ endpoints
- Node structure
- Metadata specification

---

## How to Use Reference Documentation

Reference documentation is for looking things up, not for learning:

1. **Know what you're looking for** - Have a specific question
2. **Use the index** - Navigate quickly to relevant section
3. **Scan for your topic** - Use headers and tables
4. **Copy examples** - Use code snippets as-is
5. **Verify details** - Double-check versions and formats

## Reference Format

Each reference document follows this structure:

- **Table of Contents** - Quick navigation
- **Overview** - Brief description
- **Specifications** - Detailed technical information
- **Parameters** - All parameters with types
- **Return Values** - What functions return
- **Examples** - Code examples
- **See Also** - Related references

## Reference Documentation Standards

Reference docs must be:

✅ **Accurate** - Technically correct and up-to-date  
✅ **Complete** - Cover all features and parameters  
✅ **Consistent** - Follow uniform formatting  
✅ **Structured** - Easy to scan and search  
✅ **Versioned** - Clearly indicate version applicability

## Contributing to References

Want to improve reference docs? See:
- [Contributing Guide](../../CONTRIBUTING.md#documentation)
- [Documentation Standards](../CODE_CONVENTIONS.md#documentation)

**Reference Guidelines:**
- Be precise and technical
- Include all parameters and return types
- Provide complete code examples
- Update with every code change
- Maintain backward compatibility notes

---

## Quick Reference Cards

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource missing |
| 422 | Validation Error - Invalid data |
| 500 | Internal Server Error |

See: [Complete Error Codes Reference](./error-codes.md)

### API Response Format
```typescript
// Success
{
  "success": true,
  "data": { /* ... */ }
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Description",
    "details": { /* ... */ }
  }
}
```

### Authentication Header
```
Authorization: Bearer <jwt-token>
```

---

## Related Documentation

### Tutorials
Learn by doing:
- [Getting Started](../tutorials/getting-started.md)
- [More Tutorials](../tutorials/README.md)

### How-To Guides
Solve specific problems:
- [How-To Index](../how-to/README.md)
- [Add API Endpoint](../how-to/add-api-endpoint.md)

### Explanations
Understand concepts:
- [Architecture](../ARCHITECTURE.md)
- [AI Annotator Workflow](../AI_ANNOTATOR_WORKFLOW.md)

---

**Version:** 1.0.0  
**Last Updated:** December 6, 2025  
**Format:** Following [Diátaxis Framework](https://diataxis.fr/)  
**Coverage:** 90+ endpoints, 12 major modules, complete API
