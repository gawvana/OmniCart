# OmniCart AI — Security Practices

## Authentication

### Telegram Mini App Authentication
- All API requests include `X-Telegram-Init-Data` header
- Backend validates using HMAC-SHA256 per [Telegram Bot API specification](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
- Auth data expires after 1 hour (3600 seconds)
- No JWT tokens — Telegram signature is the auth token
- User identity is always extracted server-side, never trusted from frontend

### Bot Webhook Authentication
- Webhook endpoint validates `X-Telegram-Bot-Api-Secret-Token` header
- Constant-time comparison to prevent timing attacks
- Update deduplication via Redis `SET NX` with 2-hour TTL

## Authorization

### Resource Access Control
Every API endpoint follows this flow:
1. Authenticate user via Telegram initData
2. Load requested resource
3. Check ownership or membership
4. Check role permissions
5. Execute operation

### Family Role Hierarchy
| Role | View | Add Items | Edit Items | Manage Members | Delete Family |
|---|---|---|---|---|---|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ❌ |
| Member | ✅ | ✅ | ✅ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |

### Family Invites
- Tokens are cryptographically random (`secrets.token_urlsafe(32)`)
- Invites expire after 7 days
- One-time use only
- Only family owner/admin can create invites

## Data Protection

### Secrets Management
- All secrets stored in environment variables only
- `.env` files are gitignored
- No hardcoded credentials in source code
- `.env.example` contains only placeholder values
- All legacy credentials have been rotated (considered compromised)

### Database Security
- PostgreSQL with parameterized queries only (SQLAlchemy ORM)
- No raw SQL execution
- No AI-generated SQL execution
- Input validation via Pydantic models on all endpoints
- Request size limits enforced

### API Security
- CORS restricted to configured origins (not `*` in production)
- Rate limiting via Redis sliding window:
  - General API: 60 requests/minute
  - AI endpoints: 20 requests/minute
  - Auth endpoints: 10 requests/minute
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Request ID tracking for audit trails
- Structured logging with user context

## AI Security

### Prompt Injection Protection
- System prompts include explicit anti-injection instructions
- AI output is always validated through Pydantic schemas
- AI never has direct database access
- User input is sanitized before inclusion in prompts
- Token limits enforced per request

### AI Cost Control
- Per-user rate limiting on AI operations
- All AI requests logged with token counts and latency
- Response caching for identical inputs
- Request deduplication
- Configurable timeouts with retry backoff

## Privacy

### Data Minimization
- Only data required for functionality is collected
- No tracking beyond what's needed for features
- Users control notification preferences

### User Rights
- **Data Export**: Users can export all their data (JSON/CSV)
- **Data Deletion**: Soft delete with confirmation, cleanup job processes within 30 days
- **History Management**: Users can clear purchase history

### Sensitive Data Handling
- Telegram user IDs stored as integers (not hashed — needed for bot messaging)
- No personal financial data beyond shopping amounts
- No biometric data
- No location tracking (city is user-provided preference)

## Infrastructure Security

### Docker
- Non-root user in container (`omnicart` user)
- Multi-stage builds to minimize image size
- No secrets in Docker images
- Health checks on all services

### Database
- Connection pooling via asyncpg
- Prepared statements (default with SQLAlchemy)
- Network isolation between services in Docker

### Redis
- Password authentication in production
- TLS for remote Redis connections
- Memory limits configured
- Key expiration on all cached data

## Incident Response

### If Credentials Are Compromised
1. Immediately rotate the compromised credential
2. Check audit logs for unauthorized access
3. Invalidate all affected sessions
4. Notify affected users if personal data was exposed
5. Update `.env` on all deployment environments
6. Review git history for accidental commits

### Monitoring
- Structured logs with request_id for traceability
- Health check endpoints (`/health`, `/ready`)
- AI request logging for anomaly detection
- Rate limit violation tracking
