# OMNICART AI 2.0 — FORENSIC RISK REGISTER
**Artifact ID:** `00-risk-register.md`  
**Execution Phase:** Phase 1 (Baseline & Repository Discovery)  
**Version:** 1.0.0  
**Audit Policy:** Zero-trust, fail-closed, no synthetic success.

---

## Risk Severity Classification
- **P0 (Critical / Blocker):** System failure, security vulnerability, broken user-facing flow, or complete deployment obstruction.
- **P1 (High):** Data inconsistency, incorrect accounting, unhandled race condition, or degradation under load.
- **P2 (Medium):** Code duplication, architecture drift, missing translation strings, or sub-optimal performance.

---

## Comprehensive Risk Matrix

| Risk ID | Category | Component | Description & Impact | Severity | Mitigation Plan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RISK-01** | Security / Auth | `backend/app/api/deps.py` | **Fake User Fallback in Production:** `get_current_user` silently registers and returns fake user `123456789` when Telegram auth headers are missing or invalid. Bypasses all authentication. | **P0** | Enforce strict fail-closed auth: raise `HTTPException(status_code=401, detail="Authentication required")` when `initData` is missing or invalid. Allow dev bypass only under explicit `TESTING=True`. |
| **RISK-02** | Security / Auth | `backend/app/api/deps.py` | **Admin Authorization Stub:** `get_current_admin` and `require_role` return `current_user` without validating role or admin flag, allowing any regular user to access admin endpoints. | **P0** | Implement real role verification against user record and admin whitelist. Return 403 Forbidden for unauthorized users. |
| **RISK-03** | Telegram / Iframe | `frontend/vercel.json` | **Iframe Embedding Blocked (`X-Frame-Options: DENY`):** Vercel sends `X-Frame-Options: DENY`, preventing Telegram Mini App from loading inside Telegram's WebApp iframe on mobile and desktop. | **P0** | Remove `X-Frame-Options: DENY` from `vercel.json` and set `Content-Security-Policy: frame-ancestors 'self' https://web.telegram.org https://*.telegram.org https://telegram.org;`. |
| **RISK-04** | API / Routing | `frontend/src/api/items.ts` vs `backend/app/api/v1/items.py` | **Shopping Item Route & Parameter Mismatch:** Frontend calls `GET /items/${listId}` and `POST /items/${listId}`, but backend defines `GET /api/v1/items/?list_id=` and `POST /api/v1/items/` with body. Also missing `POST /items/{item_id}/purchase`. | **P0** | Standardize items API contract. Support both `/items/{list_id}` and query parameters, and add dedicated `/items/{item_id}/purchase` endpoint with budget accounting. |
| **RISK-05** | DTO / Contract | `frontend/src/types/index.ts` vs backend schemas | **CamelCase vs SnakeCase Mismatch:** Backend serializes `list_id`, `is_purchased`, `estimated_price`, `note`, while frontend interfaces expect `listId`, `isPurchased`, `price`, `notes`. Breaks UI state. | **P0** | Introduce bidirectional DTO serializer/deserializer in `apiClient` or standardize API schemas to match frontend expectations seamlessly. |
| **RISK-06** | Worker / Logic | `backend/app/workers/tasks.py` | **Infinite Recurring Item Notification Loop:** `process_recurring_items` queries items where `next_due_at <= now`, sends notifications, but NEVER updates `next_due_at`, spamming notifications endlessly every run. | **P0** | Atomically calculate and update `next_due_at = now + interval_days` in the same transaction as notification creation. |
| **RISK-07** | Worker / Logic | `backend/app/workers/tasks.py` | **Infinite Notification Dispatch Spam:** `send_notifications` queries `is_read == False` and sends Telegram messages without recording delivery status. Repeatedly resends same notification. | **P0** | Add `is_sent` / `sent_at` delivery tracking to `notifications` model and table. Query pending `is_sent == False` and mark sent atomically. |
| **RISK-08** | Concurrency / Data | `backend/app/repositories/family_repo.py` | **Family Invite Double-Use Race Condition:** `use_invite` marks invite as used without checking `is_used == False` in an atomic SQL compare-and-swap statement. | **P1** | Update `use_invite` with `UPDATE ... WHERE id = :id AND is_used = FALSE` and verify affected rowcount == 1. |
| **RISK-09** | Pagination / Data | `backend/app/repositories/history_repo.py` | **Fake Cursor Pagination:** `get_user_history` accepts `cursor` parameter but ignores it completely in SQL query, always returning page 1. | **P1** | Implement genuine cursor-based pagination using `(purchased_at, id) < (cursor_purchased_at, cursor_id)`. |
| **RISK-10** | Telegram SDK | `frontend/src/hooks/useTelegram.ts` | **Missing Telegram WebApp Lifecycle Hooks:** `useTelegram` never calls `webApp.ready()`, `webApp.expand()`, doesn't handle `BackButton`, or parse `themeParams`. | **P1** | Complete full Telegram WebApp SDK initialization sequence: `ready()`, `expand()`, viewport monitoring, haptics, and Telegram theme integration. |
| **RISK-11** | Architecture | `backend/app/repositories/` | **Repository Duplication:** Duplicate files across all repositories (`*_repo.py` and `*_repository.py` stubs). | **P2** | Consolidate to canonical repository modules and clean up redundant bridge files. |
| **RISK-12** | Deployment | `frontend/vercel.json` | **Hardcoded Inactive Backend URL:** Vercel proxies `/api` to `https://omnicart-backend.onrender.com`, which returns 404 Not Found. | **P0** | Configure dynamic `VITE_API_BASE_URL` with fallback to Supabase Edge Functions / live backend, and eliminate hardcoded broken proxy. |
| **RISK-13** | Bot Architecture | `backend/app/core/config.py` vs `backend/app/bot/` | **Webhook vs Polling Duality:** Configuration references webhook mode while runner uses polling, and webhook endpoint is not registered in API router. | **P1** | Mount `/api/v1/bot/webhook` and `/setup-webhook` in API router, with clean switching based on `BOT_MODE`. |
| **RISK-14** | API / Standards | `backend/app/main.py` | **Non-Standard Error Response Contract:** Default exception handlers and FastAPI unhandled errors return `{ "detail": ... }` instead of standardized `{ "error": { "code": ..., "message": ..., "request_id": ... } }`. | **P1** | Implement global FastAPI exception handlers capturing all HTTPExceptions and returning standard envelope. |
| **RISK-15** | Security / QA | `backend/tests/` | **Absence of Red-Team Test Suite:** Suite lacks automated tests for AUTH-001 through AUTH-015 (tampered HMAC, expired auth_date, future auth_date, IDOR across lists/items/budgets). | **P0** | Implement full automated test suite for AUTH-001 through AUTH-015 and verify all fail closed. |
| **RISK-16** | Infrastructure | `backend/app/api/v1/health.py` | **Shallow Health Checks:** Current health endpoint returns static OK without checking real PostgreSQL and Redis connection pool responsiveness. | **P1** | Implement `/health/live` (process alive) and `/health/ready` (DB ping + Redis ping). |
| **RISK-17** | Database | `backend/app/models/user.py` vs `user_repo.py` | **Column Attribute Mismatch:** `UserSettings.id` vs `user_id` query mismatch in `user_repo.py` (`get_settings` filtering on `UserSettings.id == user_id`). | **P1** | Correct `UserSettings` repository queries to filter on `UserSettings.user_id == user_id`. |
| **RISK-18** | Frontend UX | `frontend/src/i18n/` | **Partial Internationalization:** Hardcoded UI strings in components instead of i18next translation keys for `ru`, `uz`, and `en`. | **P2** | Audit all UI components and route labels to ensure full i18n coverage. |

---

## Sign-off & Execution Readiness
This Risk Register serves as the definitive tracking matrix for Phases 2 through 22 of the OmniCart Forensic Audit and Production Recovery. Every risk listed above must have verified resolution and regression testing before final sign-off.
