import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLists } from '../hooks/useLists';
import { listsApi } from '../api/lists';
import { AppIcon } from '@/design-system/icons/AppIcon';

export interface ListsPageProps {
  onSelectList?: (listId: string) => void;
}

export const ListsPage: React.FC<ListsPageProps> = ({ onSelectList }) => {
  const { t } = useTranslation();
  const { data: lists = [], isLoading, refetch } = useLists();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setIsCreating(true);
      await listsApi.createList({ name: name.trim(), emoji: '🛒', color: '#3B82F6' });
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

  return (
    <div className="p-4 space-y-5 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {t('myLists', 'Мои списки')}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {lists.length} списков покупок
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-md transition-all"
        >
          <AppIcon name="plus" size={20} />
        </button>
      </header>

      {/* Lists Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="h-36 bg-white/40 dark:bg-zinc-800/40 rounded-3xl animate-pulse" />
          <div className="h-36 bg-white/40 dark:bg-zinc-800/40 rounded-3xl animate-pulse" />
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white/40 dark:bg-zinc-900/40 border border-white/20 dark:border-zinc-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <AppIcon name="list" size={24} />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Нет списков</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Создайте свой первый список покупок прямо сейчас
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            Создать список
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {lists.map((list: any) => (
            <div
              key={list.id}
              onClick={() => onSelectList?.(list.id)}
              className="p-4 rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 shadow-sm aspect-square flex flex-col justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.98] group relative"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg shadow-sm">
                  {list.emoji || '🛒'}
                </div>
                {!list.is_default && (
                  <button
                    onClick={(e) => handleDelete(e, list.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                    title="Удалить"
                  >
                    <AppIcon name="trash" size={14} />
                  </button>
                )}
              </div>

              <div>
                <h3 className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                  {list.name}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {list.is_default ? 'Основной' : 'Общий'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create List */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Новый список</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-zinc-400 p-1">
                <AppIcon name="close" size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название списка..."
                className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="py-2.5 rounded-xl bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 transition-colors"
                >
                  {isCreating ? 'Создание...' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
