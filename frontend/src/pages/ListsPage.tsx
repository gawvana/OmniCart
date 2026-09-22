import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useLists } from '../hooks/useLists';
import { listsApi } from '../api/lists';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { LiquidCard } from '@/design-system/components/GlassCard';
import { PrimaryButton, SecondaryButton } from '@/design-system/components/GlassButton';
import { LiquidModal } from '@/design-system/components/GlassModal';
import { GlassInput } from '@/design-system/components/GlassInput';
import { GlassSkeleton } from '@/design-system/components/GlassSkeleton';

export interface ListsPageProps {
  onSelectList?: (listId: string) => void;
}

export const ListsPage: React.FC<ListsPageProps> = ({ onSelectList }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: lists = [], isLoading, refetch } = useLists();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setIsCreating(true);
      await listsApi.createList({ name: name.trim(), emoji: '🛒', color: '#10B981' });
      setName('');
      setIsCreateOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await listsApi.deleteList(id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (id: string) => {
    if (onSelectList) {
      onSelectList(id);
    } else {
      navigate({ to: '/shopping' });
    }
  };

  return (
    <div className="p-4 space-y-5 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t('myLists', 'Мои списки')}
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {lists.length} активных списков
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center shadow-md shadow-emerald-950/40 transition-all"
        >
          <AppIcon name="plus" size={18} />
        </button>
      </header>

      {/* Lists Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          <GlassSkeleton variant="card" height={130} />
          <GlassSkeleton variant="card" height={130} />
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl liquid-glass-subtle border border-white/[0.06] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
            <AppIcon name="lists" size={22} />
          </div>
          <h3 className="text-sm font-semibold text-white">Нет списков</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Создайте свой первый список покупок для себя или семьи
          </p>
          <PrimaryButton size="sm" onClick={() => setIsCreateOpen(true)}>
            Создать список
          </PrimaryButton>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {lists.map((list: any) => (
            <LiquidCard
              key={list.id}
              variant="subtle"
              padding="sm"
              interactive
              onClick={() => handleSelect(list.id)}
              className="flex flex-col justify-between h-34 group relative border-white/[0.06] hover:border-white/15"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center text-xs shadow-inner">
                  <AppIcon name="lists" size={15} />
                </div>
                {!list.is_default && (
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, list.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-all"
                    title="Удалить"
                  >
                    <AppIcon name="trash" size={14} />
                  </button>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-xs text-white tracking-tight truncate">
                  {list.name}
                </h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-400">
                    {list.is_default ? 'Основной' : 'Общий'}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400">
                    Активен
                  </span>
                </div>
                {/* Emerald Progress Bar */}
                <div className="w-full h-1 rounded-full bg-white/[0.06] mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-2/3" />
                </div>
              </div>
            </LiquidCard>
          ))}
        </div>
      )}

      {/* Modal: Create List */}
      <LiquidModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Новый список"
        size="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <GlassInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название (например, Продукты домой)"
            autoFocus
          />
          <div className="flex gap-2">
            <SecondaryButton fullWidth onClick={() => setIsCreateOpen(false)}>
              Отмена
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={isCreating || !name.trim()}
              loading={isCreating}
              fullWidth
            >
              Создать
            </PrimaryButton>
          </div>
        </form>
      </LiquidModal>
    </div>
  );
};
