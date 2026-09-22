import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShoppingItems, useAddItem, usePurchaseItem, useDeleteItem } from '../hooks/useShoppingList';
import { AddItemInput } from '../features/shopping/AddItemInput';
import { CategorySection } from '../features/shopping/CategorySection';
import { CompletedSection } from '../features/shopping/CompletedSection';
import { ShoppingItem as IShoppingItem } from '../types';
import { aiApi } from '../api/ai';
import { AppIcon } from '@/design-system/icons/AppIcon';

export const ShoppingPage = ({ listId = 'default' }: { listId?: string }) => {
  const { t } = useTranslation();
  const { data: items = [], isLoading } = useShoppingItems(listId);
  const addItem = useAddItem(listId);
  const toggleItem = usePurchaseItem(listId);
  const deleteItem = useDeleteItem(listId);

  const [isAiParsing, setIsAiParsing] = useState(false);
  const [storeMode, setStoreMode] = useState(false);

  const activeItems = items.filter((i: IShoppingItem) => !i.isPurchased);
  const completedItems = items.filter((i: IShoppingItem) => i.isPurchased);

  const categories = Array.from(
    new Set(activeItems.map((i: any) => i.category || 'Другое'))
  ) as string[];

  const handleAdd = (text: string) => {
    if (text.trim()) {
      addItem.mutate({ name: text.trim(), quantity: 1, unit: 'шт' });
    }
  };

  const handleAiParse = async (text: string) => {
    if (!text.trim()) return;
    try {
      setIsAiParsing(true);
      const res = await aiApi.parseItems(text);
      if (res && res.items && Array.isArray(res.items)) {
        for (const it of res.items) {
          addItem.mutate({
            name: it.name,
            quantity: it.quantity || 1,
            unit: it.unit || 'шт',
            category: it.category || 'Другое'
          });
        }
      } else {
        handleAdd(text);
      }
    } catch (err) {
      console.error('AI parse error', err);
      handleAdd(text);
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleToggle = (id: string) => {
    toggleItem.mutate(id);
  };

  const handleDelete = (id: string) => {
    deleteItem.mutate(id);
  };

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {t('shoppingList', 'Список покупок')}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {activeItems.length} активных товаров
          </p>
        </div>

        <button
          onClick={() => setStoreMode(!storeMode)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            storeMode
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white/60 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700'
          }`}
        >
          <AppIcon name="store" size={14} />
          <span>{storeMode ? 'В магазине' : 'Режим покупок'}</span>
        </button>
      </div>

      {/* Input */}
      {!storeMode && (
        <div className="mb-5 sticky top-2 z-10">
          <AddItemInput
            onAdd={handleAdd}
            onAiParse={handleAiParse}
            isLoading={isAiParsing}
          />
        </div>
      )}

      {isAiParsing && (
        <div className="p-3 mb-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs flex items-center gap-2 animate-pulse">
          <AppIcon name="sparkles" size={16} />
          <span>AI распознает товары...</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-14 bg-white/40 dark:bg-zinc-800/40 rounded-2xl animate-pulse" />
          <div className="h-14 bg-white/40 dark:bg-zinc-800/40 rounded-2xl animate-pulse" />
          <div className="h-14 bg-white/40 dark:bg-zinc-800/40 rounded-2xl animate-pulse" />
        </div>
      ) : activeItems.length === 0 && completedItems.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white/40 dark:bg-zinc-900/40 border border-white/20 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
            <AppIcon name="cart" size={24} />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Список пуст</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
            Введите товар в поле выше или нажмите иконку AI для добавления целого списка
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {categories.map((cat) => (
            <CategorySection
              key={cat}
              category={cat}
              items={activeItems.filter(
                (i: IShoppingItem) => (i.category || 'Другое') === cat
              )}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}

          <CompletedSection
            items={completedItems}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
};
