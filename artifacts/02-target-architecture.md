# OMNICART AI 2.0 — TARGET ARCHITECTURE SPECIFICATION
**Artifact ID:** `02-target-architecture.md`  
**Execution Phase:** Phase 4 (Target Architecture)  
**Version:** 2.0.0  

---

## 1. High-Level System Topology

```mermaid
flowchart TD
    subgraph TelegramClient ["Telegram Client (Mobile / Desktop)"]
        BotChat["@OmniCartV2_bot Chat Interface"]
        MiniAppIframe["Telegram Mini App (Iframe)"]
    end

    subgraph CDN ["Frontend CDN (Vercel)"]
        ViteApp["Vite + React SPA (Liquid Glass)"]
        VercelRouting["vercel.json (CSP Frame-Ancestors)"]
    end

    subgraph BackendAPI ["Backend Service (FastAPI 0.115+)"]
        AuthMiddleware["Telegram HMAC Auth Layer"]
        V1Router["FastAPI /api/v1 Router"]
        ItemService["Item & Shopping Service"]
        FamilyService["Family Service & Invites"]
        WorkerEngine["Background Worker Tasks"]
    end

    subgraph DatabaseLayer ["Cloud Database & Edge (Supabase)"]
        Postgres["PostgreSQL 15 (24 Tables + RLS)"]
        EdgeAuth["Edge Function: telegram-auth"]
        EdgeAI["Edge Function: ai-parse (Groq OSS-20B)"]
        RealtimeEngine["Supabase Realtime (WebSockets)"]
    end

    subgraph CacheStore ["Cache & Queues"]
        Redis["Redis (Rate Limiter & Cache)"]
    end

    BotChat -->|Commands & Natural Language| BackendAPI
    MiniAppIframe -->|Loads SPA| ViteApp
    ViteApp -->|Signed initData HTTP Requests| V1Router
    ViteApp <-->|Realtime Table Subscriptions| RealtimeEngine
    V1Router --> AuthMiddleware
    AuthMiddleware -->|Validate HMAC-SHA256| Postgres
    V1Router --> ItemService
    V1Router --> FamilyService
    ItemService --> Postgres
    FamilyService --> Postgres
    ItemService --> Redis
    WorkerEngine --> Postgres
    WorkerEngine -->|Telegram Alerts| BotChat
```

---

## 2. Authentication Flow (Zero-Trust HMAC Verification)

1. **Client Initiation:**
   The user opens the Mini App from `@OmniCartV2_bot`. The Telegram native container provides `window.Telegram.WebApp.initData`, a cryptographically signed query string containing user identity, `auth_date`, `query_id`, and `hash`.

2. **Transport:**
   `frontend/src/api/client.ts` attaches `X-Telegram-Init-Data: <initData>` on every outbound HTTP request to `/api/v1/*`.

3. **Backend Verification (`backend/app/core/security.py`):**
   - Extracts `hash` from the parameters.
   - Reconstructs `data_check_string` by sorting remaining key-value pairs alphabetically separated by newlines (`\n`).
   - Derives `secret_key = HMAC-SHA256("WebAppData", TELEGRAM_BOT_TOKEN)`.
   - Computes `computed_hash = HMAC-SHA256(secret_key, data_check_string)`.
   - Compares hashes using constant-time comparison `hmac.compare_digest`.
   - Rejects if `auth_date > now + 60s` (future) or `now - auth_date > 3600s` (expired).

4. **User Resolution (`backend/app/services/auth_service.py`):**
   - Retrieves user from PostgreSQL by `telegram_user_id`.
   - If new user: registers user, provisions default shopping list (`"My Shopping List"`), and creates default `UserSettings`.
   - Updates `last_seen_at`.
   - Returns verified canonical user instance to route dependency injection.

---

## 3. Database Isolation Architecture (Non-Recursive RLS)

All 24 database tables enforce Row Level Security. To prevent infinite recursion (`42P17`) between interdependent tables:
- An isolated schema `internal` houses `SECURITY DEFINER` helper functions:
  - `internal.is_list_owner(_list_id, _user_id)`
  - `internal.is_list_member(_list_id, _user_id)`
  - `internal.is_family_member(_family_id, _user_id)`
  - `internal.is_family_admin(_family_id, _user_id)`
- Direct table RLS policies delegate membership checks to `internal.*`, maintaining $O(1)$ query evaluation time and zero performance warnings.
