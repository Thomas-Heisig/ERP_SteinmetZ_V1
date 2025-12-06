# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.3.x   | :white_check_mark: |
| 0.2.x   | :white_check_mark: |
| < 0.2   | :x:                |

## Reporting a Vulnerability

The ERP SteinmetZ team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report a Security Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Preferred**: Use GitHub's Security Advisory feature:
   - Go to the [Security tab](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/security)
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Alternative**: Email the maintainers directly
   - Contact via GitHub profile for secure communication channel

### What to Include in Your Report

To help us understand and resolve the issue quickly, please include:

- **Type of issue** (e.g., SQL injection, XSS, authentication bypass)
- **Full paths** of source file(s) related to the issue
- **Location** of the affected source code (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact** of the issue, including how an attacker might exploit it

### What to Expect

After you submit a report, you can expect:

1. **Acknowledgment**: Within 48 hours
2. **Initial Assessment**: Within 1 week
3. **Status Updates**: Every 1-2 weeks
4. **Resolution Timeline**:
   - Critical: 1-7 days
   - High: 1-4 weeks
   - Medium: 1-3 months
   - Low: Best effort

### Our Commitment

- We will keep you updated on the progress
- We will credit you in the security advisory (unless you prefer to remain anonymous)
- We will work with you to understand and resolve the issue
- We will publicly disclose the issue after a fix is released (coordinated disclosure)

## Security Best Practices

### For Developers

When contributing to ERP SteinmetZ, follow these security guidelines:

#### Input Validation

Always validate and sanitize user input:

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().positive().optional()
});

// In your route handler
const validatedData = UserSchema.parse(req.body);
```

#### Authentication & Authorization

- Use JWT tokens with appropriate expiration
- Implement proper RBAC (Role-Based Access Control)
- Never store passwords in plain text
- Use bcrypt with appropriate salt rounds

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
```

#### SQL Injection Prevention

Always use parameterized queries:

```typescript
// Good - Parameterized query
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// Bad - String concatenation
// const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

#### XSS Prevention

- Sanitize HTML output
- Use Content Security Policy headers
- Escape user-generated content

```typescript
// Set CSP headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'"
  );
  next();
});
```

#### API Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

#### Secure Headers

Use security-focused middleware:

```typescript
import helmet from 'helmet';
app.use(helmet());
```

#### Environment Variables

- Never commit `.env` files to git
- Use strong, random values for secrets
- Rotate secrets regularly
- Use different secrets for dev/staging/production

```bash
# Generate secure random secret
openssl rand -base64 32
```

#### Dependencies

- Keep dependencies updated
- Run `npm audit` regularly
- Review security advisories
- Use `npm audit fix` for automatic fixes

```bash
npm audit
npm audit fix
npm outdated
```

### For Deployment

#### HTTPS Only

- Always use HTTPS in production
- Redirect HTTP to HTTPS
- Use HSTS headers

```typescript
app.use((req, res, next) => {
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    next();
  } else {
    res.redirect(`https://${req.headers.host}${req.url}`);
  }
});
```

#### Database Security

- Use strong database passwords
- Limit database user permissions
- Enable database encryption
- Regular backups
- Network isolation

#### Logging & Monitoring

- Log security events
- Monitor for suspicious activity
- Set up alerts for anomalies
- Protect log files

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['password', 'token', 'secret'] // Prevent sensitive data in logs
});
```

#### Error Handling

- Don't expose stack traces in production
- Use generic error messages for users
- Log detailed errors server-side

```typescript
app.use((err, req, res, next) => {
  logger.error(err);
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});
```

## Known Security Considerations

### Current Security Features

✅ **Implemented:**
- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Zod
- CORS configuration
- Rate limiting on sensitive endpoints
- SQL parameterized queries
- Audit trail for critical operations
- RBAC (Role-Based Access Control)

⚠️ **Planned:**
- Two-factor authentication (2FA)
- API key management
- Advanced threat detection
- Automated security scanning in CI/CD
- Penetration testing

### Compliance

ERP SteinmetZ follows these standards:

- **GDPR** (General Data Protection Regulation) - Data privacy
- **GoBD** (German accounting regulations) - Audit trail
- **OWASP Top 10** - Web security best practices
- **ISO 27001** - Information security management (in progress)

See [COMPLIANCE.md](docs/COMPLIANCE.md) for detailed compliance documentation.

## Security Audit History

### 2025-12-06
- **Status**: Internal security review completed
- **Findings**: No critical issues
- **Actions**: Enhanced error handling, added input validation

### Future Audits
- External penetration testing planned for Q2 2026
- Automated security scanning to be integrated in CI/CD

## Acknowledgments

We thank the following security researchers for their responsible disclosure:

*(No security researchers to acknowledge yet)*

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Version:** 1.0.0  
**Last Updated:** December 6, 2025  
**Next Review:** March 2026

For questions about this security policy, please contact the maintainers via GitHub.
