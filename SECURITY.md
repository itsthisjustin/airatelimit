# Security Guide

This document covers security considerations for deploying and operating AI Rate Limit.

## Table of Contents

1. [Quick Security Checklist](#quick-security-checklist)
2. [Authentication & Authorization](#authentication--authorization)
3. [Secrets Management](#secrets-management)
4. [Rate Limiting & DDoS Protection](#rate-limiting--ddos-protection)
5. [Database Security](#database-security)
6. [Container Security](#container-security)
7. [Dependency Auditing](#dependency-auditing)
8. [Migration Safety](#migration-safety)

---

## Quick Security Checklist

Before deploying to production, verify:

- [ ] `JWT_SECRET` is set to a strong random value (min 32 chars)
- [ ] `DATABASE_URL` uses a strong password
- [ ] `CORS_ORIGIN` is set to your actual dashboard URL (not `*`)
- [ ] Running `npm audit` shows no critical vulnerabilities
- [ ] Docker containers are not running as root
- [ ] Database migrations have been reviewed for destructive operations
- [ ] SSL/TLS is enabled for all connections

---

## Authentication & Authorization

### Endpoint Protection

| Endpoint | Auth Type | Description |
|----------|-----------|-------------|
| `/api/health/*` | None | Health checks for orchestration |
| `/api/auth/*` | None | Login/signup (rate limited) |
| `/api/v1/*` | Header-based | Proxy endpoints (project key + API key) |
| `/api/projects/*` | JWT | Dashboard management APIs |
| `/api/organizations/*` | JWT | Organization management |
| `/api/projects/:key/identities/*` | JWT or Secret Key | Identity limit management |

### Proxy Authentication

The proxy endpoints (`/api/v1/*`) use a two-layer authentication:

1. **Project Key** (`x-project-key`): Identifies the project, can be public
2. **API Key** (`Authorization: Bearer`): User's actual AI provider key, passed through

This design means:
- Your customers' API keys are never stored (pass-through)
- Project keys can be safely embedded in client-side code
- Rate limiting is applied before the request reaches the AI provider

---

## Secrets Management

### Required Secrets

```bash
# Generate a strong JWT secret (REQUIRED)
JWT_SECRET=$(openssl rand -hex 32)

# Generate database password (REQUIRED)
DB_PASSWORD=$(openssl rand -base64 24)
```

### Security Validations

The application will **fail to start** in production if:
- `JWT_SECRET` is not set
- `JWT_SECRET` is less than 32 characters
- `JWT_SECRET` contains placeholder text like "change" or "your-"

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes (prod) | JWT signing key, min 32 chars |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `CORS_ORIGIN` | Yes (prod) | Allowed dashboard origins |
| `RESEND_API_KEY` | No | For sending magic link emails |
| `NODE_ENV` | Yes | Set to `production` in prod |

---

## Rate Limiting & DDoS Protection

### Built-in Protection

| Protection | Limit | Scope |
|------------|-------|-------|
| IP rate limit | 120/min | Per IP address |
| Project rate limit | 600/min | Per project key |
| Body size limit | 2MB | Per request |
| Identity header | 512 chars max | Per request |
| Messages per request | 200 max | Per chat completion |
| Streaming timeout | 5 minutes | Per streaming request |
| DB row cardinality | 50k identities/period | Per project |

### Additional Recommendations

For high-traffic production deployments:

1. **Use a CDN/WAF** (Cloudflare, AWS WAF) for edge rate limiting
2. **Enable Redis** for distributed rate limiting across instances
3. **Monitor** for unusual patterns (spikes in unique identities)

---

## Database Security

### Connection Security

- Use SSL for database connections (enabled by default in production)
- Use strong passwords (generated, not chosen)
- Restrict database network access

### Migration Safety

Always use the safe migration runner:

```bash
./scripts/run-migration.sh migrations/009-performance-optimizations.sql
```

This will:
- Check for destructive operations (DROP TABLE, TRUNCATE, etc.)
- Show a preview of the migration
- Require confirmation before running
- Log all migration attempts

### Destructive Operations

The following require extra caution:
- `DROP TABLE` / `DROP DATABASE`
- `TRUNCATE`
- `DELETE FROM ... WHERE`
- `ALTER TABLE ... DROP COLUMN`

---

## Container Security

### Non-Root Execution

Both Dockerfiles are configured to run as non-root:

```dockerfile
# Create non-root user
RUN groupadd --gid 1001 nodejs \
    && useradd --uid 1001 --gid nodejs nodejs

# Switch to non-root user
USER nodejs
```

### Health Checks

Containers include health checks for orchestration:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/api/health'..."
```

---

## Dependency Auditing

### Regular Audits

Run dependency audits regularly:

```bash
# Check for vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# For dashboard
cd dashboard && npm audit
```

### CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Security Audit
  run: |
    npm audit --audit-level=high
    cd dashboard && npm audit --audit-level=high
```

### Known Dependencies

Key security-sensitive dependencies:

| Package | Purpose | Notes |
|---------|---------|-------|
| `bcrypt` | Password hashing | Uses native bindings |
| `jsonwebtoken` | JWT signing | Keep updated |
| `pg` | PostgreSQL driver | Keep updated |
| `axios` | HTTP client | Used for proxy |

---

## Incident Response

### If You Suspect a Breach

1. **Rotate secrets immediately**:
   ```bash
   # Generate new JWT secret
   JWT_SECRET=$(openssl rand -hex 32)
   # Update in production and restart
   ```

2. **Invalidate all sessions**: Changing JWT_SECRET invalidates all existing tokens

3. **Review logs**:
   - Check `logs/backend.log` for suspicious activity
   - Review security events in the database
   - Check rate limit violations

4. **Regenerate project secret keys** if needed:
   - Use the dashboard or API to regenerate
   - Notify affected customers

---

## Security Contacts

Report security vulnerabilities responsibly to: [your-security-email]

---

## Changelog

- **2024-XX-XX**: Initial security hardening
  - Added non-root Docker execution
  - Added JWT secret validation
  - Added rate limiting to proxy endpoints
  - Added migration safety checks
  - Added body size limits

