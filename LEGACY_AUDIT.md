# OmniCart AI — Legacy Codebase Audit

**Audit Date:** September 22, 2026
**Legacy Location:** `Shpgu/omnicart_ai/`

---

## Executive Summary

The legacy OmniCart AI is a Telegram Mini App + Bot for smart grocery shopping, built with FastAPI, React 18, aiogram 3.x, and SQLAlchemy 2.0 async. While it has a solid conceptual foundation covering AI text parsing, shopping lists, family sharing, and offline sync, it suffers from **critical security vulnerabilities**, **data-destructive bugs**, **non-functional background workers**, and a **monolithic frontend architecture**.

**Verdict: Complete rebuild required.** The legacy codebase serves as a requirements source only.

---

## Security Vulnerabilities

| ID | Severity | Issue | Location |
|---|---|---|---|
| SEC-01 | 🔴 CRITICAL | Plaintext production secrets committed to git | `.env`, `backend/.env` |
| SEC-02 | 🔴 CRITICAL | Unauthenticated webhook hijack endpoint | `api/routers/webhook.py` - `/api/v1/bot/setup-webhook` |
| SEC-03 | 🟠 HIGH | Custom XOR stream cipher (unauthenticated) | `core/security.py` - `encrypt_telegram_id` |
| SEC-04 | 🟠 HIGH | Family cart join bypasses authorization | `api/routers/cart.py`, `bot/handlers/start.py` |
| SEC-05 | 🟡 MEDIUM | 24-hour TMA auth token lifetime | `core/config.py` |
| SEC-06 | 🟡 MEDIUM | CORS `allow_origins=["*"]` with credentials | `api/main.py` |

### Compromised Credentials (DO NOT TRANSFER)
- Telegram Bot Token: `8889107787:AAG65uk...`
- Upstash Redis URL with auth token
- B.AI API Key: `sk-ifsmsa2...`
- Secret Key, CRON Secret
- Vercel OIDC Token (in `.env.local`)

---

## Feature Audit

| Feature | Implementation | Status | Decision |
|---|---|---|---|
| **Shopping List CRUD** | Working with idempotency (`client_mutation_id`) | ✅ Functional | **REWRITE** — Add service layer, pagination |
| **AI Text Parser** | B.AI client + regex fallback | ✅ Functional | **REWRITE** — Abstract to multi-provider |
| **Telegram Auth** | HMAC-SHA256 validation | ✅ Working | **KEEP** pattern, fix double-decode bug |
| **Family Cart** | Basic join via UUID, no roles | ⚠️ Partial | **REWRITE** — Full family system with roles |
| **Purchase History** | Records exist but get deleted on clear | 🔴 Broken | **REWRITE** — Never delete history |
| **Price Data** | `LocalPriceIndex` model, Redis cache | ⚠️ Partial | **REWRITE** — Proper Store/Market entities |
| **Smart Reorder** | Worker logic exists but `product_id` always null | 🔴 Non-functional | **REWRITE** — Fix product matching |
| **Price Aggregation** | Worker is an empty stub | 🔴 Non-functional | **REWRITE** — Full implementation |
| **Analytics** | Queries in router, loads all data into Python | ⚠️ Inefficient | **REWRITE** — SQL aggregation |
| **Budget** | Model exists, no API beyond basic CRUD | ⚠️ Partial | **REWRITE** — Full budget tracking |
| **Recurring Items** | Model exists, basic CRUD | ⚠️ Partial | **REWRITE** — Full scheduling |
| **Reminders** | Model exists, basic CRUD | ⚠️ Partial | **REWRITE** — AI parsing + scheduling |
| **i18n** | Python dict for 3 languages | ✅ Functional | **REWRITE** — External files, frontend i18n |
| **Offline Sync** | IndexedDB + mutation queue | ✅ Working concept | **KEEP** pattern, fix ID desync |
| **Notifications** | Model exists, no delivery mechanism | ⚠️ Stub | **REWRITE** — Full notification system |
| **Data Export** | Basic JSON export | ⚠️ Partial | **REWRITE** — Add CSV, async |
| **Account Deletion** | Soft delete, no cleanup | ⚠️ Partial | **REWRITE** — Add cleanup job |

---

## Architecture Issues

### Backend
1. **God-routers**: `cart.py` has 15+ endpoints covering favorites, analytics, budget, recurring, reminders
2. **No service layer**: Business logic mixed into route handlers
3. **No repository layer**: Raw SQLAlchemy queries in routes
4. **`create_all()` on startup**: Should use Alembic exclusively
5. **No Alembic directory**: Docker compose references `alembic upgrade head` but no migrations exist
6. **No rate limiting**: Despite Redis being available
7. **No pagination**: All list endpoints return everything
8. **4-second AI timeout**: LLM calls timeout frequently
9. **Webhook reset on cold start**: Drops pending updates
10. **Hardcoded geography**: "Гулистан", "UZ" hardcoded in multiple places

### Frontend
1. **Monolithic App.tsx**: ~780 lines containing all views
2. **No router**: useState-based "routing"
3. **Client/server ID desync**: Items duplicated on refresh
4. **Dead components**: `CategorySection`, `UndoBar`, `useTelegram` unused
5. **No design system**: Glass effects copy-pasted
6. **No i18n**: All strings hardcoded in Russian
7. **Broken family links**: Sends Telegram numeric ID instead of UUID
8. **Hardcoded bot username**: `@gusop_bot`
9. **Dual sync bug**: API call + queue entry simultaneously

---

## Database Models Assessment

**Existing (18 models):**
User, UserSettings, Product, ProductAlias, PurchaseHistory, PredictiveInterval, LocalPriceIndex, ShoppingList, ShoppingItem, ShoppingListMember (missing), Family, FamilyMember, FamilyInvite, ActivityEvent, Notification, Reminder, Budget, RecurringItem, SmartReorderEvent, AIRequest

**Missing in legacy:**
- Category (proper entity, not string field)
- Favorite (explicit, not derived)
- Store, Market (proper entities, not string fields)
- FeatureFlag

**Critical model flaw:**
`PurchaseHistory` serves dual purpose as both active checklist AND purchase history. Clearing completed items deletes history permanently, breaking analytics, smart reorder, and price tracking.

---

## Migration Decision Matrix

| Category | Action | Details |
|---|---|---|
| **KEEP** | Auth approach | Telegram HMAC-SHA256 validation (fix bugs) |
| **KEEP** | Tech stack | FastAPI, SQLAlchemy 2.0, aiogram 3.x, Pydantic v2 |
| **KEEP** | Offline sync pattern | IndexedDB + mutation queue (fix ID desync) |
| **KEEP** | AI fallback strategy | LLM → regex heuristic graceful degradation |
| **KEEP** | i18n vocabulary | ru/uz/en translation strings |
| **KEEP** | Docker service separation | backend, bot, worker, frontend, postgres, redis |
| **REWRITE** | All models | Separate concerns, add missing entities |
| **REWRITE** | API structure | Proper routers, service/repository layers |
| **REWRITE** | AI integration | Multi-provider abstraction (Groq/Gemini) |
| **REWRITE** | Frontend | Complete rebuild with pages, router, design system |
| **REWRITE** | Workers | Fix product matching, implement all background jobs |
| **REWRITE** | Security | Fix all vulnerabilities, rotate all secrets |
| **REMOVE** | `.env` with secrets | All credentials compromised |
| **REMOVE** | `omnicart.db` | SQLite database file |
| **REMOVE** | `create_all()` calls | Use Alembic exclusively |
| **REMOVE** | Vercel serverless wrappers | Build for container deployment |
| **REMOVE** | Custom XOR cipher | Use standard encryption |
| **REMOVE** | B.AI specific client | Replace with provider abstraction |
| **ADD** | Design system | Centralized frosted glass components |
| **ADD** | Admin panel | Internal admin interface |
| **ADD** | Feature flags | Server-side feature toggles |
| **ADD** | WebSocket | Family realtime sync |
| **ADD** | Proper tests | Unit, integration, E2E |
