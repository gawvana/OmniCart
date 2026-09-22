# OMNICART AI 2.0 — DEPLOYMENT & INFRASTRUCTURE AUDIT
**Artifact ID:** `06-deployment-audit.md`  
**Execution Phase:** Phase 16 & Phase 20 (Deployment & Infrastructure)  
**Vercel URL:** `https://frontend-umber-seven-66.vercel.app`  
**Telegram Bot:** `@OmniCartV2_bot`  
**Supabase Region:** `dolmdxbunpfurqrkgxsy.supabase.co`  

---

## 1. Frontend Vercel Deployment

- **Deployment Configuration:** `frontend/vercel.json`
- **Iframe Compatibility Fix:**
  - **Previous:** `X-Frame-Options: DENY` (Prevented Telegram Mini App from loading in iframe).
  - **Remediation:** Removed `X-Frame-Options: DENY`. Added `Content-Security-Policy: frame-ancestors 'self' https://web.telegram.org https://*.telegram.org https://telegram.org;`.
- **SPA Routing:** Added rewrite `{ "source": "/((?!api/).*)", "destination": "/index.html" }` for TanStack Router dynamic paths (`/shopping/$listId`).
- **Bundle Verification:**
  - Build command: `npm --prefix frontend run build` (`tsc -b && vite build`)
  - Status: Built 663 modules in 6.10s cleanly with 0 TypeScript errors.

---

## 2. Supabase Cloud Infrastructure

- **Database:** PostgreSQL 15 with asyncpg connections and pgbouncer pooling.
- **Edge Function: `telegram-auth` (Version 3, Active):**
  - Web Crypto HMAC-SHA256 signature verification over `TELEGRAM_BOT_TOKEN`.
  - Rejects payloads where `auth_date > 86400s`.
  - Issues signed Supabase JWT for authenticated client access.
- **Edge Function: `ai-parse` (Version 3, Active):**
  - Connected to Groq provider using active model `openai/gpt-oss-20b`.
  - Enforces structured JSON output schema and utf-8 Cyrillic safety fallback.

---

## 3. Production Service Health Probes

- **`/health/live`:** Lightweight liveness check ensuring the FastAPI event loop is running and accepting connections.
- **`/health/ready`:** Deep dependency probe verifying:
  - Active PostgreSQL connection via `SELECT 1`.
  - Responsive Redis pool via `PING`.
  - Returns HTTP 503 with individual service health details if any backing store is unreachable.
