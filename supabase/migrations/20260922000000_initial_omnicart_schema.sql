-- ==============================================================================
-- OmniCart AI 2.0 — Supabase PostgreSQL Production Schema
-- Extensions, Tables, Constraints, Indexes, RLS Policies, Realtime Publication
-- ==============================================================================

-- Enable UUID extension
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
    id SERIAL PRIMARY KEY,
    alias TEXT UNIQUE NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    language TEXT NOT NULL DEFAULT 'ru'
);

-- 6. Families (Household workspaces)
CREATE TABLE IF NOT EXISTS public.families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- 7. Family Members
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(family_id, user_id)
);

-- 8. Family Invites
CREATE TABLE IF NOT EXISTS public.family_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Shopping Lists
CREATE TABLE IF NOT EXISTS public.shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '🛒',
    color TEXT DEFAULT '#10B981',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_lists_owner ON public.shopping_lists(owner_id);

-- 10. Shopping List Members (RBAC)
CREATE TABLE IF NOT EXISTS public.shopping_list_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'editor', -- owner, editor, viewer
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(list_id, user_id)
);

-- 11. Shopping Items
CREATE TABLE IF NOT EXISTS public.shopping_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit TEXT NOT NULL DEFAULT 'шт',
    category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
    note TEXT,
    estimated_price NUMERIC(12, 2),
    actual_price NUMERIC(12, 2),
    is_purchased BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    client_mutation_id TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    purchased_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    purchased_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_items_list ON public.shopping_items(list_id);
CREATE INDEX IF NOT EXISTS ix_items_purchased ON public.shopping_items(list_id, is_purchased);

-- 12. Budgets
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    list_id UUID REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    spent_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'UZS',
    period TEXT NOT NULL DEFAULT 'monthly', -- monthly, weekly
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. Purchase History
CREATE TABLE IF NOT EXISTS public.purchase_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    list_id UUID REFERENCES public.shopping_lists(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit TEXT NOT NULL DEFAULT 'шт',
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'UZS',
    category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
    store_name TEXT,
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS ix_history_user ON public.purchase_history(user_id, purchased_at DESC);

-- 14. Smart Reorder & Recurring
CREATE TABLE IF NOT EXISTS public.smart_reorder_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    estimated_interval_days INT NOT NULL,
    last_purchase_at TIMESTAMPTZ NOT NULL,
    next_expected_date DATE NOT NULL,
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.85,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, dismissed
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.recurring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit TEXT NOT NULL DEFAULT 'шт',
    interval_days INT NOT NULL DEFAULT 7,
    last_added_at TIMESTAMPTZ,
    next_due_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. Activity Logs (Realtime feed)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    list_id UUID REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- item_added, item_completed, item_deleted, member_joined
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS ix_activity_family ON public.activity_logs(family_id, created_at DESC);

-- 16. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_reorder_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY users_view_own ON public.users
    FOR SELECT USING (auth.uid() = id OR current_setting('request.jwt.claims', true)::jsonb->>'sub' = id::text);

CREATE POLICY users_update_own ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Shopping Lists: owners & members
CREATE POLICY lists_select ON public.shopping_lists
    FOR SELECT USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.shopping_list_members m
            WHERE m.list_id = shopping_lists.id AND m.user_id = auth.uid()
        )
    );

CREATE POLICY lists_insert ON public.shopping_lists
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY lists_update ON public.shopping_lists
    FOR UPDATE USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.shopping_list_members m
            WHERE m.list_id = shopping_lists.id AND m.user_id = auth.uid() AND m.role IN ('owner', 'editor')
        )
    );

-- Shopping Items: view if list member, edit if owner/editor
CREATE POLICY items_select ON public.shopping_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.shopping_lists l
            WHERE l.id = shopping_items.list_id AND (
                l.owner_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.shopping_list_members m WHERE m.list_id = l.id AND m.user_id = auth.uid())
            )
        )
    );

CREATE POLICY items_insert ON public.shopping_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.shopping_lists l
            WHERE l.id = shopping_items.list_id AND (
                l.owner_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.shopping_list_members m WHERE m.list_id = l.id AND m.user_id = auth.uid() AND m.role IN ('owner', 'editor'))
            )
        )
    );

CREATE POLICY items_update ON public.shopping_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.shopping_lists l
            WHERE l.id = shopping_items.list_id AND (
                l.owner_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.shopping_list_members m WHERE m.list_id = l.id AND m.user_id = auth.uid() AND m.role IN ('owner', 'editor'))
            )
        )
    );

CREATE POLICY items_delete ON public.shopping_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.shopping_lists l
            WHERE l.id = shopping_items.list_id AND (
                l.owner_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.shopping_list_members m WHERE m.list_id = l.id AND m.user_id = auth.uid() AND m.role IN ('owner', 'editor'))
            )
        )
    );

-- Enable Realtime Publication
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
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Seed Default Categories
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
