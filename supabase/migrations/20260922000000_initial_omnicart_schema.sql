-- ==============================================================================
-- OmniCart AI 2.0 — Supabase PostgreSQL Production Schema & Migrations
-- Complete DDL matching all 24 SQLAlchemy models, RLS, Storage & Realtime
-- ==============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_user_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    avatar_url TEXT,
    language TEXT NOT NULL DEFAULT 'ru',
    timezone TEXT,
    country TEXT,
    city TEXT,
    currency TEXT NOT NULL DEFAULT 'UZS',
    last_seen_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_users_tg_id ON public.users(telegram_user_id);

-- 2. User Settings
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    language TEXT DEFAULT 'ru',
    currency TEXT DEFAULT 'UZS',
    city TEXT,
    timezone TEXT,
    theme TEXT NOT NULL DEFAULT 'auto',
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ai_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    notification_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    parent_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Products Catalog
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    normalized_name TEXT UNIQUE NOT NULL,
    category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
    default_unit TEXT NOT NULL DEFAULT 'шт',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS ix_products_norm ON public.products(normalized_name);

-- 5. Product Aliases
CREATE TABLE IF NOT EXISTS public.product_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    alias TEXT UNIQUE NOT NULL,
    language TEXT NOT NULL DEFAULT 'ru',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_product_alias UNIQUE (product_id, alias)
);
CREATE INDEX IF NOT EXISTS ix_product_aliases_alias ON public.product_aliases(alias);

-- 6. Favorites
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_favorite UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS ix_favorites_user ON public.favorites(user_id);

-- 7. Families (Household workspaces)
CREATE TABLE IF NOT EXISTS public.families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- 8. Family Members
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_family_member UNIQUE (family_id, user_id)
);
CREATE INDEX IF NOT EXISTS ix_family_members_user ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS ix_family_members_fam ON public.family_members(family_id);

-- 9. Family Invites
CREATE TABLE IF NOT EXISTS public.family_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    accepted_at TIMESTAMPTZ,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS ix_family_invites_token ON public.family_invites(token);

-- 10. Shopping Lists
CREATE TABLE IF NOT EXISTS public.shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '🛒',
    color TEXT NOT NULL DEFAULT '#10B981',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_lists_owner ON public.shopping_lists(owner_id);

-- 11. Shopping List Members (RBAC)
CREATE TABLE IF NOT EXISTS public.shopping_list_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'editor', -- owner, editor, viewer
    added_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_shopping_list_member UNIQUE (list_id, user_id)
);
CREATE INDEX IF NOT EXISTS ix_list_members_list ON public.shopping_list_members(list_id);
CREATE INDEX IF NOT EXISTS ix_list_members_user ON public.shopping_list_members(user_id);

-- 12. Shopping Items
CREATE TABLE IF NOT EXISTS public.shopping_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL DEFAULT '',
    quantity NUMERIC(10, 3) NOT NULL DEFAULT 1.000,
    unit TEXT NOT NULL DEFAULT 'шт',
    estimated_price NUMERIC(12, 2),
    actual_price NUMERIC(12, 2),
    currency TEXT NOT NULL DEFAULT 'UZS',
    category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
    note TEXT,
    priority INT NOT NULL DEFAULT 0,
    is_purchased BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    purchased_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    purchased_at TIMESTAMPTZ,
    version INT NOT NULL DEFAULT 1,
    client_mutation_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_items_list ON public.shopping_items(list_id);
CREATE INDEX IF NOT EXISTS ix_items_purchased ON public.shopping_items(list_id, is_purchased);

-- 13. Stores Catalog
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. Markets Catalog
CREATE TABLE IF NOT EXISTS public.markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT,
    type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. Price Observations
CREATE TABLE IF NOT EXISTS public.price_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    market_id UUID REFERENCES public.markets(id) ON DELETE SET NULL,
    price NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'UZS',
    unit TEXT NOT NULL DEFAULT 'шт',
    source TEXT NOT NULL,
    reported_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    observed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    confidence FLOAT NOT NULL DEFAULT 0.5
);
CREATE INDEX IF NOT EXISTS ix_prices_prod ON public.price_observations(product_id);

-- 16. Budgets
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    list_id UUID REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    name TEXT,
    amount NUMERIC(14, 2) NOT NULL,
    spent_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'UZS',
    period TEXT NOT NULL DEFAULT 'monthly', -- monthly, weekly
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS ix_budgets_user ON public.budgets(user_id);

-- 17. Purchase History
CREATE TABLE IF NOT EXISTS public.purchase_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity NUMERIC(10, 3) NOT NULL DEFAULT 1.000,
    unit TEXT NOT NULL DEFAULT 'шт',
    price NUMERIC(12, 2),
    currency TEXT NOT NULL DEFAULT 'UZS',
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS ix_history_user ON public.purchase_history(user_id, purchased_at DESC);

-- 18. Recurring Items
CREATE TABLE IF NOT EXISTS public.recurring_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    list_id UUID REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity NUMERIC(10, 3) NOT NULL DEFAULT 1.000,
    unit TEXT NOT NULL DEFAULT 'шт',
    interval_days INT NOT NULL DEFAULT 7,
    last_added_at TIMESTAMPTZ,
    next_due_at TIMESTAMPTZ,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS ix_recurring_user ON public.recurring_items(user_id);

-- 19. Smart Reorder Events
CREATE TABLE IF NOT EXISTS public.smart_reorder_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    confidence FLOAT NOT NULL DEFAULT 0.85,
    estimated_interval_days FLOAT NOT NULL DEFAULT 7.0,
    last_purchase_at TIMESTAMPTZ NOT NULL,
    next_expected_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, dismissed
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS ix_reorder_user ON public.smart_reorder_events(user_id, status);

-- 20. Activity Events (Realtime audit trail)
CREATE TABLE IF NOT EXISTS public.activity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- item_added, item_purchased, item_deleted, member_joined
    entity_type TEXT NOT NULL,
    entity_id UUID,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS ix_activity_family ON public.activity_events(family_id, created_at DESC);

-- 21. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS ix_notifications_user ON public.notifications(user_id, is_read);

-- 22. Reminders
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    remind_at TIMESTAMPTZ NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS ix_reminders_user ON public.reminders(user_id, remind_at);

-- 23. AI Requests Log
CREATE TABLE IF NOT EXISTS public.ai_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    operation TEXT NOT NULL,
    tokens_input INT NOT NULL DEFAULT 0,
    tokens_output INT NOT NULL DEFAULT 0,
    latency_ms INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS ix_ai_requests_user ON public.ai_requests(user_id);

-- 24. Feature Flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_reorder_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_requests ENABLE ROW LEVEL SECURITY;

-- Helper function: get current app user id from Supabase auth.uid() or claim
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        auth.uid(),
        NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'sub', '')::UUID
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public;

-- Internal security helper functions (non-recursive, shielded from public RPC)
CREATE SCHEMA IF NOT EXISTS internal;
GRANT USAGE ON SCHEMA internal TO authenticated, anon;

CREATE OR REPLACE FUNCTION internal.is_list_owner(_list_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM shopping_lists WHERE id = _list_id AND owner_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION internal.is_list_member(_list_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM shopping_list_members WHERE list_id = _list_id AND user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION internal.is_family_member(_family_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM family_members WHERE family_id = _family_id AND user_id = _user_id AND is_active = true);
$$;

CREATE OR REPLACE FUNCTION internal.is_family_admin(_family_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM families f WHERE f.id = _family_id AND f.created_by = _user_id
  ) OR EXISTS (
    SELECT 1 FROM family_members m WHERE m.family_id = _family_id AND m.user_id = _user_id AND m.role IN ('owner', 'admin') AND m.is_active = true
  );
$$;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA internal TO authenticated;

-- Users policies
CREATE POLICY users_select ON public.users
    FOR SELECT USING (id = public.current_app_user_id());

CREATE POLICY users_insert ON public.users
    FOR INSERT WITH CHECK (id = public.current_app_user_id() OR auth.uid()::text IS NOT NULL);

CREATE POLICY users_update ON public.users
    FOR UPDATE USING (id = public.current_app_user_id());

-- User Settings policies
CREATE POLICY user_settings_select ON public.user_settings
    FOR SELECT USING (user_id = public.current_app_user_id());

CREATE POLICY user_settings_all ON public.user_settings
    FOR ALL USING (user_id = public.current_app_user_id());

-- Shopping Lists: Owner or Member (non-recursive)
CREATE POLICY lists_select ON public.shopping_lists
    FOR SELECT USING (owner_id = public.current_app_user_id() OR internal.is_list_member(id, public.current_app_user_id()));

CREATE POLICY lists_insert ON public.shopping_lists
    FOR INSERT WITH CHECK (owner_id = public.current_app_user_id());

CREATE POLICY lists_update ON public.shopping_lists
    FOR UPDATE USING (
        owner_id = public.current_app_user_id() OR
        EXISTS (
            SELECT 1 FROM public.shopping_list_members m
            WHERE m.list_id = shopping_lists.id AND m.user_id = public.current_app_user_id() AND m.role IN ('owner', 'editor')
        )
    );

CREATE POLICY lists_delete ON public.shopping_lists
    FOR DELETE USING (owner_id = public.current_app_user_id());

-- Shopping List Members (non-recursive)
CREATE POLICY list_members_select ON public.shopping_list_members
    FOR SELECT USING (user_id = public.current_app_user_id() OR internal.is_list_owner(list_id, public.current_app_user_id()));

CREATE POLICY list_members_insert ON public.shopping_list_members
    FOR INSERT WITH CHECK (internal.is_list_owner(list_id, public.current_app_user_id()));

CREATE POLICY list_members_update ON public.shopping_list_members
    FOR UPDATE USING (internal.is_list_owner(list_id, public.current_app_user_id()));

CREATE POLICY list_members_delete ON public.shopping_list_members
    FOR DELETE USING (internal.is_list_owner(list_id, public.current_app_user_id()));

-- Shopping Items: SELECT allowed for list members; MUTATION allowed ONLY for owner/editor (VIEWERS DENIED)
CREATE POLICY items_select ON public.shopping_items
    FOR SELECT USING (internal.is_list_owner(list_id, public.current_app_user_id()) OR internal.is_list_member(list_id, public.current_app_user_id()));

CREATE POLICY items_insert ON public.shopping_items
    FOR INSERT WITH CHECK (
        internal.is_list_owner(list_id, public.current_app_user_id()) OR
        EXISTS (SELECT 1 FROM public.shopping_list_members m WHERE m.list_id = shopping_items.list_id AND m.user_id = public.current_app_user_id() AND m.role IN ('owner', 'editor'))
    );

CREATE POLICY items_update ON public.shopping_items
    FOR UPDATE USING (
        internal.is_list_owner(list_id, public.current_app_user_id()) OR
        EXISTS (SELECT 1 FROM public.shopping_list_members m WHERE m.list_id = shopping_items.list_id AND m.user_id = public.current_app_user_id() AND m.role IN ('owner', 'editor'))
    );

CREATE POLICY items_delete ON public.shopping_items
    FOR DELETE USING (
        internal.is_list_owner(list_id, public.current_app_user_id()) OR
        EXISTS (SELECT 1 FROM public.shopping_list_members m WHERE m.list_id = shopping_items.list_id AND m.user_id = public.current_app_user_id() AND m.role IN ('owner', 'editor'))
    );

-- Favorites
CREATE POLICY favorites_all ON public.favorites
    FOR ALL USING (user_id = public.current_app_user_id());

-- Families (non-recursive)
CREATE POLICY families_select ON public.families
    FOR SELECT USING (created_by = public.current_app_user_id() OR internal.is_family_member(id, public.current_app_user_id()));

CREATE POLICY families_insert ON public.families
    FOR INSERT WITH CHECK (created_by = public.current_app_user_id());

CREATE POLICY families_update ON public.families
    FOR UPDATE USING (created_by = public.current_app_user_id() OR internal.is_family_admin(id, public.current_app_user_id()));

CREATE POLICY families_delete ON public.families
    FOR DELETE USING (created_by = public.current_app_user_id());

-- Family Members (non-recursive)
CREATE POLICY family_members_select ON public.family_members
    FOR SELECT USING (user_id = public.current_app_user_id() OR internal.is_family_member(family_id, public.current_app_user_id()));

CREATE POLICY family_members_insert ON public.family_members
    FOR INSERT WITH CHECK (internal.is_family_admin(family_id, public.current_app_user_id()));

CREATE POLICY family_members_update ON public.family_members
    FOR UPDATE USING (internal.is_family_admin(family_id, public.current_app_user_id()));

CREATE POLICY family_members_delete ON public.family_members
    FOR DELETE USING (internal.is_family_admin(family_id, public.current_app_user_id()));

-- Family Invites
CREATE POLICY family_invites_select ON public.family_invites
    FOR SELECT USING (
        created_by = public.current_app_user_id() OR
        is_used = FALSE
    );

CREATE POLICY family_invites_all ON public.family_invites
    FOR ALL USING (created_by = public.current_app_user_id());

-- Budgets
CREATE POLICY budgets_all ON public.budgets
    FOR ALL USING (user_id = public.current_app_user_id());

-- Purchase History
CREATE POLICY history_all ON public.purchase_history
    FOR ALL USING (user_id = public.current_app_user_id());

-- Recurring Items
CREATE POLICY recurring_all ON public.recurring_items
    FOR ALL USING (user_id = public.current_app_user_id());

-- Smart Reorder Events
CREATE POLICY reorder_all ON public.smart_reorder_events
    FOR ALL USING (user_id = public.current_app_user_id());

-- Activity Events
CREATE POLICY activity_select ON public.activity_events
    FOR SELECT USING (
        user_id = public.current_app_user_id() OR
        EXISTS (
            SELECT 1 FROM public.family_members m
            WHERE m.family_id = activity_events.family_id AND m.user_id = public.current_app_user_id() AND m.is_active = TRUE
        )
    );

CREATE POLICY activity_insert ON public.activity_events
    FOR INSERT WITH CHECK (user_id = public.current_app_user_id());

-- Notifications
CREATE POLICY notifications_all ON public.notifications
    FOR ALL USING (user_id = public.current_app_user_id());

-- Reminders
CREATE POLICY reminders_all ON public.reminders
    FOR ALL USING (user_id = public.current_app_user_id());

-- AI Requests
CREATE POLICY ai_requests_all ON public.ai_requests
    FOR ALL USING (user_id = public.current_app_user_id());

-- ==============================================================================
-- Storage Buckets & Policies
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', TRUE) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload receipts" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'receipts' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can view own receipts" ON storage.objects
    FOR SELECT USING (bucket_id = 'receipts' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Avatars are publicly viewable" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (auth.uid()::text = (storage.foldername(name))[1]));

-- ==============================================================================
-- Supabase Realtime Publication
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_lists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ==============================================================================
-- Default Seed Data
-- ==============================================================================
INSERT INTO public.categories (name, emoji, sort_order) VALUES
('Овощи и фрукты', '🥦', 1),
('Молочные продукты', '🥛', 2),
('Мясо и птица', '🥩', 3),
('Хлеб и выпечка', '🥖', 4),
('Напитки', '🧃', 5),
('Бакалея', '🌾', 6),
('Бытовая химия', '🧼', 7),
('Сладости', '🍫', 8)
ON CONFLICT DO NOTHING;

INSERT INTO public.feature_flags (name, enabled, description) VALUES
('ai_parser', TRUE, 'Smart AI receipt and message parser'),
('smart_reorder', TRUE, 'Predictive shopping replenishment reminders'),
('realtime_sync', TRUE, 'Realtime Supabase list updates')
ON CONFLICT (name) DO NOTHING;
