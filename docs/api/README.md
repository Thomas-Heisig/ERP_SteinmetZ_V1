# API Documentation

This directory contains comprehensive API documentation for the ERP SteinmetZ system.

## Contents

### 📚 Documentation Files

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with examples
- **[openapi.yaml](./openapi.yaml)** - OpenAPI 3.0 specification
- **[postman-collection.json](./postman-collection.json)** - Postman collection for testing

## Quick Start

### Using the API Documentation

Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for:

- Complete endpoint reference
- Request/response examples
- Authentication details
- Error handling
- Best practices

### Using OpenAPI Specification

The [openapi.yaml](./openapi.yaml) file can be used with:

**Swagger UI:**

```bash
# Install swagger-ui-express
npm install swagger-ui-express swagger-jsdoc

# Serve at /api-docs
```

**Online Validators:**

- [Swagger Editor](https://editor.swagger.io/) - Paste the YAML content
- [Swagger UI](https://petstore.swagger.io/) - Load the URL

**Code Generation:**

```bash
# Generate TypeScript client
npx @openapitools/openapi-generator-cli generate \
  -i docs/api/openapi.yaml \
  -g typescript-axios \
  -o src/generated/api-client
```

### Using Postman Collection

1. **Import Collection:**
   - Open Postman
   - Click Import
   - Select `postman-collection.json`

2. **Configure Environment:**
   - Create new environment
   - Set variables:
     - `baseUrl`: `http://localhost:3000`
     - `token`: (will be set automatically after login)
     - `adminToken`: Your admin token

3. **Test Endpoints:**
   - Start with "Login" request to get token
   - Token is automatically saved to environment
   - Try other endpoints

## API Overview

### Base URL

- Development: `http://localhost:3000`
- Production: `https://api.erp-steinmetz.example.com`

### Authentication

- **JWT Bearer Token** for user endpoints
- **Admin Token** for system endpoints

### Endpoints

| Category     | Base Path           | Description                  |
| ------------ | ------------------- | ---------------------------- |
| Health       | `/api/health`       | System health and monitoring |
| AI & Chat    | `/api/ai`           | AI chat, models, audio       |
| Functions    | `/api/functions`    | Functions catalog            |
| AI Annotator | `/api/ai-annotator` | Metadata generation          |
| Dashboard    | `/api/dashboard`    | Dashboard data               |
| Auth         | `/api/auth`         | Authentication               |
| System       | `/api/system`       | System administration        |

## Development

### Testing the API

**Using curl:**

```bash
# Health check
curl http://localhost:3000/api/health

# Get functions (with auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/functions
```

**Using Postman:**

- Import the collection
- Set up environment variables
- Run requests

**Using OpenAPI:**

- Use Swagger UI for interactive testing
- Generate client code for your language

### Adding New Endpoints

When adding new API endpoints:

1. **Implement the endpoint** in backend
2. **Update openapi.yaml** with the new endpoint
3. **Add to Postman collection** for testing
4. **Document in API_DOCUMENTATION.md** with examples
5. **Write tests** for the new endpoint

### Example: Adding a New Endpoint

**1. Backend Implementation:**

```typescript
// apps/backend/src/routes/myFeature/myRouter.ts
router.get("/my-endpoint", async (req, res) => {
  res.json({ success: true, data: {} });
});
```

**2. OpenAPI Specification:**

```yaml
paths:
  /api/my-endpoint:
    get:
      tags:
        - MyFeature
      summary: Description
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
```

**3. Postman Collection:**
Add to the appropriate folder in the collection.

**4. Documentation:**
Add section in API_DOCUMENTATION.md with:

- Endpoint description
- Request/response examples
- Error cases

## Resources

### Related Documentation

- [Developer Onboarding](../DEVELOPER_ONBOARDING.md)
- [Architecture](../ARCHITECTURE.md)
- [Code Conventions](../CODE_CONVENTIONS.md)

### External Tools

- [Swagger Editor](https://editor.swagger.io/) - Edit OpenAPI specs
- [Postman](https://www.postman.com/) - API testing
- [OpenAPI Generator](https://openapi-generator.tech/) - Generate client code

### API Standards

- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://httpstatuses.com/)

## Support

For issues or questions:

- Check the [API Documentation](./API_DOCUMENTATION.md)
- Review [GitHub Issues](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues)
- Create a new issue if needed

---

**Version:** 0.2.0  
**Last Updated:** December 4, 2024  
**Maintainer:** Thomas Heisig
