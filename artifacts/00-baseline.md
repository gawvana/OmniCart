# OMNICART AI 2.0 — BASELINE REPOSITORY PRESERVATION
**Artifact ID:** `00-baseline.md`  
**Execution Phase:** Phase 1 (Baseline & Repository Discovery)  
**Timestamp:** 2026-09-22T21:30:00Z  
**Branch:** `main`  
**Latest Git Commit:** `5bfac76a1ed409759e48fbb1d39f3b6dbde166a1`  
**Status:** Pristine working tree (`git status --short`: untracked `audit_prompt.txt`, `artifacts/`)  

---

## 1. Executive Summary & Purpose
This artifact records the exact state of the OmniCart AI 2.0 repository prior to commencing code repairs and production hardening. In accordance with zero-trust engineering principles, all existing assumptions, README claims, and historical verification reports are discarded until confirmed by actual runtime behavior, dependency analysis, and end-to-end testing.

---

## 2. Git State & Version Control
- **Current Branch:** `main`
- **Remote Origin:** `https://github.com/gawvana/OmniCart.git`
- **Head Commit:** `5bfac76` (`fix(audit): resolve bot imports, RLS recursion, AI models, telegram HMAC auth, and dead websocket`)
- **Working Tree Cleanliness:** Clean (untracked: `audit_prompt.txt`, `artifacts/`)
- **Recent Commit History:**
  1. `5bfac76` — fix(audit): resolve bot imports, RLS recursion, AI models, telegram HMAC auth, and dead websocket
  2. `825aa37` — feat(supabase): add generated database types and type supabase client
  3. `879ac55` — chore: ignore frontend env files
  4. `f9d9c00` — feat: integrate supabase backend
  5. `4b94d6a` — feat(design-system): Apple-inspired Liquid Glass redesign and Supabase integration

---

## 3. Repository Directory Structure
```
OmniCart/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI API routers (v1, deps, health, webhook)
│   │   ├── bot/             # aiogram 3.x Telegram bot (handlers, keyboards, dispatcher)
│   │   ├── core/            # Config, security, exceptions, middleware
│   │   ├── db/              # SQLAlchemy async engine, session factory, base models
│   │   ├── integrations/    # AI router, cache, rate limiter, external providers
│   │   ├── models/          # 24 SQLAlchemy declarative models
│   │   ├── repositories/    # Database repository access layer (includes *_repo and *_repository)
│   │   ├── schemas/         # Pydantic v2 schemas
│   │   ├── services/        # Domain business logic services
│   │   └── workers/         # Background scheduler and recurring task workers
│   └── tests/               # Pytest suite (auth, budget, family, items, permissions, reorder, supabase)
├── frontend/
│   ├── src/
│   │   ├── api/             # HTTP API client modules
│   │   ├── app/             # TanStack Router and React Query providers
│   │   ├── design-system/   # Liquid Glass UI components, theme provider, icons
│   │   ├── features/        # Feature components (lists, items, scanner, voice)
│   │   ├── hooks/           # useTelegram, useLists, useTheme, etc.
│   │   ├── i18n/            # i18next multilingual dictionary (en, ru, uz)
│   │   ├── pages/           # Page routes (HomePage, ShoppingPage, ListsPage, etc.)
│   │   ├── store/           # Zustand state stores (offline queue, lists, items)
│   │   └── types/           # TypeScript interface definitions
│   ├── package.json         # React 18, Vite 5, Tailwind CSS, TanStack Router/Query
│   ├── tsconfig.json        # Strict TypeScript configuration
│   ├── vercel.json          # Deployment configuration, API rewrites, HTTP headers
│   └── vite.config.ts       # Vite build setup with alias `@/` -> `src/`
├── supabase/
│   ├── functions/           # Deno Edge Functions (telegram-auth, ai-parse)
│   ├── migrations/          # PostgreSQL DDL migrations (20260922000000_initial_omnicart_schema.sql)
│   └── config.toml          # Local Supabase CLI configuration
├── docker-compose.yml       # Production services (api, bot, worker, redis, postgres)
├── Dockerfile               # Backend container definition
└── alembic.ini              # Alembic migration configuration
```

---

## 4. Runtime Entrypoints
| Component | Entrypoint File | Primary Execution Command | State / Notes |
| :--- | :--- | :--- | :--- |
| **Backend API** | `backend/app/main.py` | `uvicorn app.main:app --host 0.0.0.0 --port 8000` | FastAPI app with Lifespan managing Redis connection |
| **Telegram Bot** | `backend/app/bot/main.py` | `python -m app.bot.main` | aiogram 3.x polling bot runner |
| **Background Worker** | `backend/app/workers/scheduler.py` | `python -m app.workers.scheduler` | Async background scheduler for reminders and recurring items |
| **Frontend Mini App**| `frontend/src/main.tsx` | `npm run dev` / `npm run build` | Vite + React SPA mounting to `#root` |

---

## 5. Deployment Configurations
1. **Frontend Deployment:**
   - **Host:** Vercel
   - **Production URL:** `https://frontend-umber-seven-66.vercel.app`
   - **Config:** `frontend/vercel.json`
   - **Critical Vulnerability Found:** `X-Frame-Options: DENY` is sent by Vercel, blocking Telegram Mini App iframe rendering.
   - **API Proxy:** Rewrites `/api/:path*` to `https://omnicart-backend.onrender.com/api/:path*`.
2. **Backend Deployment:**
   - **Host:** Render (`https://omnicart-backend.onrender.com`)
   - **Current Status:** Inactive / Returning HTTP 404 on all routes. Needs alignment with deployment topology.
3. **Database & Edge Functions:**
   - **Provider:** Supabase (`dolmdxbunpfurqrkgxsy.supabase.co`)
   - **Tables:** 24 active PostgreSQL tables with RLS enabled.
   - **Edge Functions:** `telegram-auth` (v3) and `ai-parse` (v3) deployed and active.
4. **Containerization:**
   - `docker-compose.yml` configures `db`, `redis`, `backend`, `bot`, and `worker`.

---

## 6. Database Migrations & Models
- **Database Engine:** PostgreSQL via Supabase / asyncpg SQLAlchemy 2.0.
- **24 Core Tables:** `users`, `user_settings`, `categories`, `products`, `product_aliases`, `favorites`, `families`, `family_members`, `family_invites`, `shopping_lists`, `shopping_list_members`, `shopping_items`, `stores`, `markets`, `price_observations`, `budgets`, `purchase_history`, `recurring_items`, `smart_reorder_events`, `activity_events`, `notifications`, `reminders`, `ai_requests`, `feature_flags`.
- **Security & RLS:** Non-recursive policies via `internal` schema helper functions (`is_list_owner`, `is_list_member`, `is_family_member`, `is_family_admin`).
- **Advisor Status:** 0 security advisor lints, 0 unindexed foreign keys.
- **Migration Discrepancy:** `alembic.ini` exists alongside raw Supabase SQL migrations. A unified strategy must be codified.

---

## 7. Current Test Baseline
- **Pytest:** 22 passed in 11.71s (`backend/tests/`).
  - Covers basic unit/integration for items, budget, family, permissions, reorder, and supabase connection.
  - Does NOT yet cover end-to-end AUTH-001 through AUTH-015 security red-team test matrix.
- **Vitest:** 6 passed in `frontend/src/__tests__/`.
- **TypeScript Compiler:** 0 errors on `npx tsc --noEmit`.

---

## 8. Preserved State Sign-off
No destructive operations (`git reset --hard`, file deletion) have been performed. All discoveries are tracked in the risk register (`00-risk-register.md`) and implementation plan.
