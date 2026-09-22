# OMNICART AI 2.0 — DATABASE ARCHITECTURE & AUDIT
**Artifact ID:** `05-database-audit.md`  
**Execution Phase:** Phase 8 & Phase 21 (Database & Migrations)  
**PostgreSQL Provider:** Supabase (`dolmdxbunpfurqrkgxsy.supabase.co`)  
**Security Advisor Score:** 0 Security Lints  
**Index Coverage:** 100% of Foreign Keys Indexed  
**Total Tables:** 24 Active Production Tables  

---

## 1. Schema Inventory (All 24 Tables Active)
1. `public.users`: Core user identities with `telegram_user_id` unique index, `is_admin`, and `role`.
2. `public.user_settings`: Preferences, theme (`auto`/`light`/`dark`), language (`ru`/`uz`/`en`), currency.
3. `public.categories`: Hierarchical shopping categories.
4. `public.products`: Master global product catalog.
5. `public.product_aliases`: Normalized search aliases and OCR barcodes.
6. `public.favorites`: User frequently bought products.
7. `public.families`: Family shopping groups.
8. `public.family_members`: Member membership and roles (`owner`, `admin`, `member`, `viewer`).
9. `public.family_invites`: Single-use invite tokens with expiration and atomic consumption.
10. `public.shopping_lists`: Shopping lists with custom colors, emoji, and default flags.
11. `public.shopping_list_members`: List collaborators and roles.
12. `public.shopping_items`: Items with price, quantity, unit, `is_purchased`, client mutation IDs.
13. `public.stores`: Physical and digital grocery stores.
14. `public.markets`: Regional supermarket chains.
15. `public.price_observations`: Crowdsourced and user price history.
16. `public.budgets`: Spending targets per period and list.
17. `public.purchase_history`: Historical purchases with genuine cursor compound keys.
18. `public.recurring_items`: Auto-replenishment subscriptions with interval days and `next_due_at`.
19. `public.smart_reorder_events`: AI predictive purchase suggestions.
20. `public.activity_events`: Audit trail for family activity feeds.
21. `public.notifications`: Push alerts with delivery state (`is_read`, `is_sent`, `sent_at`).
22. `public.reminders`: User time-based shopping reminders.
23. `public.ai_requests`: Telemetry and caching for AI NLP requests.
24. `public.feature_flags`: Dynamic feature flags.

---

## 2. Row Level Security & Advisor Status

### Supabase Security Linter
- **Executed Tool:** `get_advisors(type: "security")`
- **Result:** `{"lints": []}` (0 security issues).

### Non-Recursive RLS Policies
- Infinite recursion (`42P17`) between `shopping_lists` and `shopping_list_members` was eradicated by creating the `internal` schema with `SECURITY DEFINER` functions:
  - `internal.is_list_owner(UUID, UUID)`
  - `internal.is_list_member(UUID, UUID)`
  - `internal.is_family_member(UUID, UUID)`
  - `internal.is_family_admin(UUID, UUID)`
- Functions execute with fixed `search_path = public` and are granted to `authenticated` while revoked from `public`/`anon`.

### Migration Uniformity
- All production changes originate from `supabase/migrations/20260922000000_initial_omnicart_schema.sql`.
- Direct invocation of `create_all` is prohibited in production runtimes.
