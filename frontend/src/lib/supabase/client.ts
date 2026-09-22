import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Format any Supabase/PostgreSQL error into a clean, safe user-facing message.
 * Never leaks raw SQL or internal stack traces.
 */
export function formatSupabaseError(error: any): string {
  if (!error) return 'Неизвестная ошибка';
  const code = error.code || '';
  const msg = error.message || '';

  if (code === '42501' || msg.includes('permission denied') || msg.includes('row-level security')) {
    return 'Доступ запрещён: недостаточно прав для выполнения операции';
  }
  if (code === '23505' || msg.includes('unique constraint')) {
    return 'Запись с такими данными уже существует';
  }
  if (code === '23503' || msg.includes('foreign key')) {
    return 'Связанная запись не найдена';
  }
  if (msg.includes('JWT') || msg.includes('auth')) {
    return 'Сессия устарела. Пожалуйста, перезапустите приложение';
  }
  return 'Не удалось завершить операцию. Попробуйте снова позже';
}

/**
 * Subscribe to realtime shopping items changes for a given list
 */
export function subscribeToShoppingItems(
  listId: string,
  onUpdate: (payload: any) => void
) {
  if (!isSupabaseConfigured) {
    return { unsubscribe: () => {} };
  }

  const channel = supabase
    .channel(`shopping_items:${listId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'shopping_items',
        filter: `list_id=eq.${listId}`,
      },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

/**
 * Subscribe to family activity events feed
 */
export function subscribeToFamilyActivity(
  familyId: string,
  onActivity: (payload: any) => void
) {
  if (!isSupabaseConfigured) {
    return { unsubscribe: () => {} };
  }

  const channel = supabase
    .channel(`activity_events:${familyId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_events',
        filter: `family_id=eq.${familyId}`,
      },
      (payload) => {
        onActivity(payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

/**
 * Subscribe to user notifications feed
 */
export function subscribeToNotifications(
  userId: string,
  onNotification: (payload: any) => void
) {
  if (!isSupabaseConfigured) {
    return { unsubscribe: () => {} };
  }

  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

/**
 * Upload receipt image to private storage bucket
 */
export async function uploadReceiptImage(userId: string, file: File): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage.from('receipts').upload(filePath, file);
  if (error) {
    console.error('Receipt upload failed:', formatSupabaseError(error));
    return null;
  }
  return filePath;
}

/**
 * Upload avatar image to public storage bucket
 */
export async function uploadAvatarImage(userId: string, file: File): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage.from('avatars').upload(filePath, file);
  if (error) {
    console.error('Avatar upload failed:', formatSupabaseError(error));
    return null;
  }
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data?.publicUrl || null;
}
